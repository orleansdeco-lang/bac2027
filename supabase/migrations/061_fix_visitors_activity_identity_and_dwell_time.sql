-- ==============================================================================
-- 061_fix_visitors_activity_identity_and_dwell_time.sql
-- Fixes identity stitching and retroactive user linking for visitor analytics
-- Dedicated Project: erbvmpnxufgeinqnshzu
-- ==============================================================================

-- 1. Retroactively link orphan analytics_sessions to authentic user_id via analytics_visitors
UPDATE public.analytics_sessions s
SET user_id = v.user_id
FROM public.analytics_visitors v
WHERE (s.visitor_id = v.visitor_id OR s.anonymous_id = v.visitor_id)
  AND s.user_id IS NULL
  AND v.user_id IS NOT NULL;

-- 2. Retroactively link orphan analytics_events to authentic user_id via analytics_visitors
UPDATE public.analytics_events e
SET user_id = v.user_id
FROM public.analytics_visitors v
WHERE (e.visitor_id = v.visitor_id OR e.anonymous_id = v.visitor_id)
  AND e.user_id IS NULL
  AND v.user_id IS NOT NULL;

-- 3. Also link orphan analytics_events via matching session_id if session has user_id
UPDATE public.analytics_events e
SET user_id = s.user_id
FROM public.analytics_sessions s
WHERE e.session_id = s.session_id
  AND e.user_id IS NULL
  AND s.user_id IS NOT NULL;

-- 4. Purge any lingering operator or internal route events that might have crept into analytics_events
DELETE FROM public.analytics_events
WHERE route LIKE '/ops%'
   OR route LIKE '/admin%'
   OR route LIKE '/api%'
   OR (properties->>'path') LIKE '/ops%'
   OR (properties->>'path') LIKE '/admin%'
   OR (properties->>'path') LIKE '/api%';

DELETE FROM public.analytics_sessions
WHERE landing_page LIKE '/ops%'
   OR landing_page LIKE '/admin%'
   OR landing_page LIKE '/api%';

-- 5. Create index on analytics_events (session_id, route, occurred_at) for ultra-fast activity queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_recent_activity
  ON public.analytics_events (event_name, occurred_at DESC)
  WHERE route NOT LIKE '/ops%' AND route NOT LIKE '/admin%' AND route NOT LIKE '/api%';
