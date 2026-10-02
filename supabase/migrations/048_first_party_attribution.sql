-- Migration: 048_first_party_attribution
-- Description: Add channel attribution and enforce immutability of first-touch data

DO $$ 
BEGIN
  -- Add columns to analytics_visitors
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'analytics_visitors' AND column_name = 'first_channel') THEN
    ALTER TABLE public.analytics_visitors ADD COLUMN first_channel TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'analytics_visitors' AND column_name = 'last_channel') THEN
    ALTER TABLE public.analytics_visitors ADD COLUMN last_channel TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'analytics_visitors' AND column_name = 'last_referrer') THEN
    ALTER TABLE public.analytics_visitors ADD COLUMN last_referrer TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'analytics_visitors' AND column_name = 'last_landing_page') THEN
    ALTER TABLE public.analytics_visitors ADD COLUMN last_landing_page TEXT;
  END IF;

  -- Add columns to analytics_sessions
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'analytics_sessions' AND column_name = 'first_channel') THEN
    ALTER TABLE public.analytics_sessions ADD COLUMN first_channel TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'analytics_sessions' AND column_name = 'last_channel') THEN
    ALTER TABLE public.analytics_sessions ADD COLUMN last_channel TEXT;
  END IF;
END $$;

-- 2. Create UPSERT RPC for analytics_visitors
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
    -- ONLY update "last_" touch if a new external source/channel is provided
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

-- 3. Create UPSERT RPC for analytics_sessions
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
    
    -- Update last_touch ONLY if new source is not direct/internal
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
