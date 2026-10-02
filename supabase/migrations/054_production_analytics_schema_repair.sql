-- ==============================================================================
-- 054_production_analytics_schema_repair.sql
-- CRITICAL: Repairs all missing analytics schema in production Supabase
-- 
-- ROOT CAUSE: Migrations 021, 047, 048, 049 were never applied to production.
-- This consolidated script creates all missing tables, columns, RPCs, indexes,
-- RLS policies, and grants. Fully idempotent — safe to run multiple times.
-- ==============================================================================

-- ============================================================================
-- PART 1: visitor_hits TABLE (from migration 021)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.visitor_hits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  path TEXT NOT NULL DEFAULT '/',
  full_url TEXT,
  query_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  referrer TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  utm_medium TEXT,
  ref_code TEXT,
  device_type TEXT NOT NULL DEFAULT 'desktop',
  browser TEXT,
  os TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visitor_hits_created_at ON public.visitor_hits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_hits_session_id ON public.visitor_hits(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_hits_utm_source ON public.visitor_hits(utm_source);
CREATE INDEX IF NOT EXISTS idx_visitor_hits_ref_code ON public.visitor_hits(ref_code);
CREATE INDEX IF NOT EXISTS idx_visitor_hits_path ON public.visitor_hits(path);

ALTER TABLE public.visitor_hits ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "visitor_hits_insert" ON public.visitor_hits;
  CREATE POLICY "visitor_hits_insert" ON public.visitor_hits
    FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "visitor_hits_select" ON public.visitor_hits;
  CREATE POLICY "visitor_hits_select" ON public.visitor_hits
    FOR SELECT USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    );
END $$;

GRANT ALL ON public.visitor_hits TO service_role;
GRANT INSERT ON public.visitor_hits TO anon, authenticated;
GRANT SELECT ON public.visitor_hits TO authenticated;

-- ============================================================================
-- PART 2: analytics_visitors TABLE (from migration 047)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.analytics_visitors (
  visitor_id TEXT PRIMARY KEY,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  linked_at TIMESTAMPTZ,
  
  -- First-Touch Attribution (immutable after creation)
  first_utm_source TEXT,
  first_utm_medium TEXT,
  first_utm_campaign TEXT,
  first_utm_content TEXT,
  first_utm_term TEXT,
  first_referrer TEXT,
  first_landing_page TEXT,
  first_channel TEXT,
  
  -- Last-Touch Attribution
  last_referrer TEXT,
  last_landing_page TEXT,
  last_channel TEXT,
  
  -- Device fingerprint (coarse)
  device_type TEXT DEFAULT 'desktop' CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  browser TEXT,
  os TEXT,
  
  -- Metadata
  total_sessions INT NOT NULL DEFAULT 0,
  total_pageviews INT NOT NULL DEFAULT 0,
  is_bot BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_visitors_user_id ON public.analytics_visitors(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_first_seen_at ON public.analytics_visitors(first_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_last_seen_at ON public.analytics_visitors(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_is_bot ON public.analytics_visitors(is_bot);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_first_utm_source ON public.analytics_visitors(first_utm_source);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_first_utm_campaign ON public.analytics_visitors(first_utm_campaign);

ALTER TABLE public.analytics_visitors ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "analytics_visitors_insert" ON public.analytics_visitors;
  CREATE POLICY "analytics_visitors_insert" ON public.analytics_visitors
    FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "analytics_visitors_select" ON public.analytics_visitors;
  CREATE POLICY "analytics_visitors_select" ON public.analytics_visitors
    FOR SELECT USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    );

  DROP POLICY IF EXISTS "analytics_visitors_update" ON public.analytics_visitors;
  CREATE POLICY "analytics_visitors_update" ON public.analytics_visitors
    FOR UPDATE USING (
      auth.role() = 'service_role'
    );
END $$;

GRANT ALL ON public.analytics_visitors TO service_role;
GRANT INSERT ON public.analytics_visitors TO anon, authenticated;
GRANT SELECT ON public.analytics_visitors TO authenticated;

-- ============================================================================
-- PART 3: ADD MISSING COLUMNS to analytics_sessions (from 047, 048)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analytics_sessions' AND column_name='visitor_id') THEN
    ALTER TABLE public.analytics_sessions ADD COLUMN visitor_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analytics_sessions' AND column_name='first_channel') THEN
    ALTER TABLE public.analytics_sessions ADD COLUMN first_channel TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analytics_sessions' AND column_name='last_channel') THEN
    ALTER TABLE public.analytics_sessions ADD COLUMN last_channel TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor_id ON public.analytics_sessions(visitor_id);

-- ============================================================================
-- PART 4: ADD MISSING COLUMNS to analytics_events (from 049)
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analytics_events' AND column_name='visitor_id') THEN
    ALTER TABLE public.analytics_events ADD COLUMN visitor_id TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='analytics_events' AND column_name='page_path') THEN
    ALTER TABLE public.analytics_events ADD COLUMN page_path TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_id ON public.analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_time ON public.analytics_events(event_name, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_path ON public.analytics_events(page_path);

-- ============================================================================
-- PART 5: RPCs for Identity Stitching (from 048)
-- ============================================================================

-- record_visitor_identity: Upserts analytics_visitors with first-touch immutability
CREATE OR REPLACE FUNCTION public.record_visitor_identity(
  p_visitor_id TEXT,
  p_user_id UUID,
  p_device_type TEXT,
  p_browser TEXT,
  p_os TEXT,
  p_landing_page TEXT,
  p_referrer TEXT,
  p_source TEXT,
  p_medium TEXT,
  p_campaign TEXT,
  p_content TEXT,
  p_term TEXT,
  p_channel TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.analytics_visitors (
    visitor_id, user_id, first_seen_at, last_seen_at, linked_at,
    first_utm_source, first_utm_medium, first_utm_campaign, first_utm_content, first_utm_term,
    first_referrer, first_landing_page, first_channel,
    last_referrer, last_landing_page, last_channel,
    device_type, browser, os, total_sessions, total_pageviews, is_bot
  ) VALUES (
    p_visitor_id, p_user_id, now(), now(), CASE WHEN p_user_id IS NOT NULL THEN now() ELSE null END,
    p_source, p_medium, p_campaign, p_content, p_term,
    p_referrer, p_landing_page, p_channel,
    p_referrer, p_landing_page, p_channel,
    p_device_type, p_browser, p_os, 1, 1, false
  )
  ON CONFLICT (visitor_id) DO UPDATE SET
    last_seen_at = now(),
    total_pageviews = public.analytics_visitors.total_pageviews + 1,
    user_id = COALESCE(public.analytics_visitors.user_id, p_user_id),
    linked_at = CASE 
      WHEN public.analytics_visitors.user_id IS NULL AND p_user_id IS NOT NULL THEN now() 
      ELSE public.analytics_visitors.linked_at 
    END,
    last_referrer = CASE WHEN p_channel != 'direct' THEN p_referrer ELSE public.analytics_visitors.last_referrer END,
    last_landing_page = CASE WHEN p_channel != 'direct' THEN p_landing_page ELSE public.analytics_visitors.last_landing_page END,
    last_channel = CASE WHEN p_channel != 'direct' THEN p_channel ELSE public.analytics_visitors.last_channel END,
    device_type = COALESCE(p_device_type, public.analytics_visitors.device_type),
    browser = COALESCE(p_browser, public.analytics_visitors.browser),
    os = COALESCE(p_os, public.analytics_visitors.os),
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.record_visitor_identity FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_visitor_identity TO anon;
GRANT EXECUTE ON FUNCTION public.record_visitor_identity TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_visitor_identity TO service_role;

-- record_session_identity: Upserts analytics_sessions with first-touch immutability
CREATE OR REPLACE FUNCTION public.record_session_identity(
  p_session_id TEXT,
  p_visitor_id TEXT,
  p_anonymous_id TEXT,
  p_user_id UUID,
  p_landing_page TEXT,
  p_referrer TEXT,
  p_source TEXT,
  p_medium TEXT,
  p_campaign TEXT,
  p_content TEXT,
  p_term TEXT,
  p_channel TEXT,
  p_device_type TEXT,
  p_browser TEXT,
  p_os TEXT,
  p_ip_hash TEXT,
  p_country TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO public.analytics_sessions (
    session_id, visitor_id, anonymous_id, user_id, 
    landing_page, referrer, 
    first_utm_source, first_utm_medium, first_utm_campaign, first_utm_content, first_utm_term, first_channel,
    last_utm_source, last_utm_medium, last_utm_campaign, last_utm_content, last_utm_term, last_channel,
    device_type, browser, os, ip_hash, country, 
    pageviews_count, started_at, last_activity_at, is_active
  ) VALUES (
    p_session_id, p_visitor_id, p_anonymous_id, p_user_id,
    p_landing_page, p_referrer,
    p_source, p_medium, p_campaign, p_content, p_term, p_channel,
    p_source, p_medium, p_campaign, p_content, p_term, p_channel,
    p_device_type, p_browser, p_os, p_ip_hash, p_country,
    1, now(), now(), true
  )
  ON CONFLICT (session_id) DO UPDATE SET
    last_activity_at = now(),
    pageviews_count = public.analytics_sessions.pageviews_count + 1,
    user_id = COALESCE(public.analytics_sessions.user_id, p_user_id),
    visitor_id = COALESCE(public.analytics_sessions.visitor_id, p_visitor_id),
    last_utm_source = CASE WHEN p_channel != 'direct' THEN p_source ELSE public.analytics_sessions.last_utm_source END,
    last_utm_medium = CASE WHEN p_channel != 'direct' THEN p_medium ELSE public.analytics_sessions.last_utm_medium END,
    last_utm_campaign = CASE WHEN p_channel != 'direct' THEN p_campaign ELSE public.analytics_sessions.last_utm_campaign END,
    last_utm_content = CASE WHEN p_channel != 'direct' THEN p_content ELSE public.analytics_sessions.last_utm_content END,
    last_utm_term = CASE WHEN p_channel != 'direct' THEN p_term ELSE public.analytics_sessions.last_utm_term END,
    last_channel = CASE WHEN p_channel != 'direct' THEN p_channel ELSE public.analytics_sessions.last_channel END,
    updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.record_session_identity FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_session_identity TO anon;
GRANT EXECUTE ON FUNCTION public.record_session_identity TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_session_identity TO service_role;

-- link_visitor_to_user: Links anonymous visitor to authenticated user
CREATE OR REPLACE FUNCTION public.link_visitor_to_user(
  p_visitor_id TEXT,
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  UPDATE public.analytics_visitors 
  SET user_id = p_user_id, linked_at = now(), updated_at = now()
  WHERE visitor_id = p_visitor_id AND user_id IS NULL;
  
  UPDATE public.analytics_sessions 
  SET user_id = p_user_id, updated_at = now()
  WHERE visitor_id = p_visitor_id AND user_id IS NULL;
  
  UPDATE public.analytics_events
  SET user_id = p_user_id
  WHERE (
    visitor_id = p_visitor_id 
    OR session_id IN (
      SELECT session_id FROM public.analytics_sessions WHERE visitor_id = p_visitor_id
    )
  ) AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE ALL ON FUNCTION public.link_visitor_to_user FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_visitor_to_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.link_visitor_to_user TO service_role;
GRANT EXECUTE ON FUNCTION public.link_visitor_to_user TO anon;

-- ============================================================================
-- PART 6: Ensure RLS INSERT policies exist for all analytics tables
-- ============================================================================

DO $$
BEGIN
  -- Ensure analytics_sessions INSERT is open
  DROP POLICY IF EXISTS "analytics_sessions_insert_all" ON public.analytics_sessions;
  CREATE POLICY "analytics_sessions_insert_all" ON public.analytics_sessions
    FOR INSERT WITH CHECK (true);

  -- Ensure analytics_sessions UPDATE is open  
  DROP POLICY IF EXISTS "analytics_sessions_update_all" ON public.analytics_sessions;
  CREATE POLICY "analytics_sessions_update_all" ON public.analytics_sessions
    FOR UPDATE USING (true) WITH CHECK (true);

  -- Ensure analytics_events INSERT is open
  DROP POLICY IF EXISTS "analytics_events_insert_all" ON public.analytics_events;
  CREATE POLICY "analytics_events_insert_all" ON public.analytics_events
    FOR INSERT WITH CHECK (true);
END $$;

-- Ensure GRANTs
GRANT ALL ON public.analytics_sessions TO service_role;
GRANT ALL ON public.analytics_events TO service_role;
GRANT INSERT, UPDATE ON public.analytics_sessions TO anon, authenticated;
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT SELECT ON public.analytics_sessions TO authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
