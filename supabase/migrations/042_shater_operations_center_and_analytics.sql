-- ==============================================================================
-- 042_shater_operations_center_and_analytics.sql
-- SHATER CONTROL CENTER: First-Party Analytics, Session Tracking & Campaign Attribution
-- Dedicated Supabase Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- INVARIANTS:
-- 1. Strictly Additive & Non-Destructive: Preserves all existing tables and learner data.
-- 2. Decoupled Identity: Distinguishes anonymous visitors from registered users.
-- 3. Dual-Touch Attribution: Stores both first_touch (immutable) and last_touch UTM data.
-- 4. Coarse Privacy: Stores only Wilaya/region, zero invasive fingerprinting or exact GPS.
-- 5. Mandatory RLS: Public write for client analytics events; operator-only read for reporting.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ANALYTICS SESSIONS TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  anonymous_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Landing & Referrer
  landing_page TEXT NOT NULL DEFAULT '/',
  referrer TEXT,
  referrer_domain TEXT,

  -- First-Touch Attribution (Preserved forever on session creation)
  first_utm_source TEXT,
  first_utm_medium TEXT,
  first_utm_campaign TEXT,
  first_utm_content TEXT,
  first_utm_term TEXT,

  -- Last-Touch Attribution (Updated on subsequent campaign hits)
  last_utm_source TEXT,
  last_utm_medium TEXT,
  last_utm_campaign TEXT,
  last_utm_content TEXT,
  last_utm_term TEXT,

  -- Client Environment (Coarse categories only)
  device_type TEXT NOT NULL DEFAULT 'desktop' CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  browser TEXT,
  os TEXT,
  ip_hash TEXT,
  
  -- Coarse Location & Context
  country TEXT DEFAULT 'DZ',
  wilaya_code TEXT, -- 01 to 58
  stream_id TEXT, -- sciences_exp, math, etc. when known

  -- Metrics & Lifecycle
  pageviews_count INT NOT NULL DEFAULT 1,
  duration_seconds INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Analytical Indexes
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON public.analytics_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_last_activity ON public.analytics_sessions(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_anonymous_id ON public.analytics_sessions(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_user_id ON public.analytics_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_first_campaign ON public.analytics_sessions(first_utm_campaign);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_first_source ON public.analytics_sessions(first_utm_source);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_wilaya ON public.analytics_sessions(wilaya_code);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_device ON public.analytics_sessions(device_type);

-- ------------------------------------------------------------------------------
-- 2. GRANULAR ANALYTICS EVENTS TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  session_id TEXT NOT NULL,
  anonymous_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  route TEXT NOT NULL DEFAULT '/',
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_occurred_at ON public.analytics_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_route ON public.analytics_events(route);

-- ------------------------------------------------------------------------------
-- 3. MARKETING CAMPAIGNS REGISTRY
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  utm_source TEXT NOT NULL, -- e.g. facebook, google, telegram
  utm_medium TEXT NOT NULL, -- e.g. paid_social, cpc, organic
  utm_campaign TEXT NOT NULL UNIQUE, -- e.g. shater_launch_october
  utm_content TEXT,
  utm_term TEXT,
  landing_page TEXT NOT NULL DEFAULT '/',
  budget_dzd NUMERIC(10, 2) DEFAULT 0.00,
  target_audience TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_utm ON public.marketing_campaigns(utm_campaign);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_status ON public.marketing_campaigns(status);

-- ------------------------------------------------------------------------------
-- 4. ADVERTISEMENT SYSTEM PERSISTENCE (SHATER ADS)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  advertiser_id TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT 'native' CHECK (format IN ('image', 'video', 'native')),
  placement TEXT NOT NULL DEFAULT 'sidebar',
  cta_type TEXT NOT NULL DEFAULT 'whatsapp' CHECK (cta_type IN ('external_link', 'whatsapp')),
  cta_destination TEXT NOT NULL,
  cta_label TEXT NOT NULL DEFAULT 'تواصل معنا',
  headline TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  target_wilayas JSONB DEFAULT '[]'::jsonb,
  target_streams JSONB DEFAULT '[]'::jsonb,
  target_grades JSONB DEFAULT '[]'::jsonb,
  target_subjects JSONB DEFAULT '[]'::jsonb,
  target_placements JSONB DEFAULT '[]'::jsonb,
  start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_date TIMESTAMPTZ,
  daily_impression_cap INT DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (
    status IN ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'SCHEDULED', 'ACTIVE', 'PAUSED', 'ENDED', 'REJECTED')
  ),
  is_educational_claim BOOLEAN NOT NULL DEFAULT false,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_campaigns_status ON public.ad_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_ad_campaigns_placement ON public.ad_campaigns(placement);

CREATE TABLE IF NOT EXISTS public.ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  placement TEXT NOT NULL,
  anonymous_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  route TEXT NOT NULL,
  wilaya_code TEXT,
  stream_id TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_impressions_campaign ON public.ad_impressions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_occurred ON public.ad_impressions(occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.ad_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.ad_campaigns(id) ON DELETE CASCADE,
  placement TEXT NOT NULL,
  click_type TEXT NOT NULL DEFAULT 'standard' CHECK (click_type IN ('standard', 'whatsapp', 'external')),
  anonymous_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ad_clicks_campaign ON public.ad_clicks(campaign_id);

-- ------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------------------------

ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- 1. Analytics Sessions RLS
  DROP POLICY IF EXISTS "analytics_sessions_insert_all" ON public.analytics_sessions;
  CREATE POLICY "analytics_sessions_insert_all" ON public.analytics_sessions
    FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "analytics_sessions_update_all" ON public.analytics_sessions;
  CREATE POLICY "analytics_sessions_update_all" ON public.analytics_sessions
    FOR UPDATE USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "analytics_sessions_select_operator" ON public.analytics_sessions;
  CREATE POLICY "analytics_sessions_select_operator" ON public.analytics_sessions
    FOR SELECT USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role' OR auth.uid() = user_id
    );

  -- 2. Analytics Events RLS
  DROP POLICY IF EXISTS "analytics_events_insert_all" ON public.analytics_events;
  CREATE POLICY "analytics_events_insert_all" ON public.analytics_events
    FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "analytics_events_select_operator" ON public.analytics_events;
  CREATE POLICY "analytics_events_select_operator" ON public.analytics_events
    FOR SELECT USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role' OR auth.uid() = user_id
    );

  -- 3. Marketing Campaigns RLS
  DROP POLICY IF EXISTS "marketing_campaigns_operator_all" ON public.marketing_campaigns;
  CREATE POLICY "marketing_campaigns_operator_all" ON public.marketing_campaigns
    FOR ALL USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    );

  -- 4. Ad Campaigns RLS
  DROP POLICY IF EXISTS "ad_campaigns_public_select_active" ON public.ad_campaigns;
  CREATE POLICY "ad_campaigns_public_select_active" ON public.ad_campaigns
    FOR SELECT USING (
      status = 'ACTIVE' OR public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    );

  DROP POLICY IF EXISTS "ad_campaigns_operator_write" ON public.ad_campaigns;
  CREATE POLICY "ad_campaigns_operator_write" ON public.ad_campaigns
    FOR ALL USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    );

  -- 5. Ad Impressions & Clicks RLS
  DROP POLICY IF EXISTS "ad_impressions_insert_all" ON public.ad_impressions;
  CREATE POLICY "ad_impressions_insert_all" ON public.ad_impressions
    FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "ad_impressions_select_operator" ON public.ad_impressions;
  CREATE POLICY "ad_impressions_select_operator" ON public.ad_impressions
    FOR SELECT USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    );

  DROP POLICY IF EXISTS "ad_clicks_insert_all" ON public.ad_clicks;
  CREATE POLICY "ad_clicks_insert_all" ON public.ad_clicks
    FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "ad_clicks_select_operator" ON public.ad_clicks;
  CREATE POLICY "ad_clicks_select_operator" ON public.ad_clicks
    FOR SELECT USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    );
END $$;

GRANT ALL ON public.analytics_sessions TO service_role;
GRANT ALL ON public.analytics_events TO service_role;
GRANT ALL ON public.marketing_campaigns TO service_role;
GRANT ALL ON public.ad_campaigns TO service_role;
GRANT ALL ON public.ad_impressions TO service_role;
GRANT ALL ON public.ad_clicks TO service_role;

GRANT INSERT, UPDATE ON public.analytics_sessions TO anon, authenticated;
GRANT INSERT ON public.analytics_events TO anon, authenticated;
GRANT INSERT ON public.ad_impressions TO anon, authenticated;
GRANT INSERT ON public.ad_clicks TO anon, authenticated;
GRANT SELECT ON public.analytics_sessions TO authenticated;
GRANT SELECT ON public.analytics_events TO authenticated;
