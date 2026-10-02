-- Migration 049: Event Tracking Layer & Identity Hardening
-- Purpose: Adds visitor_id and page_path to analytics_events, adds index, and updates link_visitor_to_user

DO $$ 
BEGIN
  -- 1. Add visitor_id to analytics_events if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'analytics_events' 
    AND column_name = 'visitor_id'
  ) THEN
    ALTER TABLE public.analytics_events ADD COLUMN visitor_id TEXT;
  END IF;

  -- 2. Add page_path to analytics_events if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'analytics_events' 
    AND column_name = 'page_path'
  ) THEN
    ALTER TABLE public.analytics_events ADD COLUMN page_path TEXT;
  END IF;
END $$;

-- 3. Indexes for fast event retrieval and attribution stitching
CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_id ON public.analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_time ON public.analytics_events(event_name, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page_path ON public.analytics_events(page_path);

-- 4. Update link_visitor_to_user to also update analytics_events by visitor_id
CREATE OR REPLACE FUNCTION public.link_visitor_to_user(
  p_visitor_id TEXT,
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Link visitor record
  UPDATE public.analytics_visitors
  SET 
    user_id = p_user_id,
    linked_at = now(),
    updated_at = now()
  WHERE visitor_id = p_visitor_id AND user_id IS NULL;

  -- Link sessions
  UPDATE public.analytics_sessions
  SET 
    user_id = p_user_id,
    updated_at = now()
  WHERE visitor_id = p_visitor_id AND user_id IS NULL;

  -- Link events directly by visitor_id or via sessions
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
