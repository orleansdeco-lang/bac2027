-- ==============================================================================
-- 060_purge_operator_analytics_events.sql
-- Purges internal operational (/ops) and admin (/admin) paths from visitor analytics
-- Ensures that only genuine student/visitor traffic is tracked and displayed.
-- ==============================================================================

-- 1. Remove internal dashboard events from analytics_events
DELETE FROM public.analytics_events
WHERE route LIKE '/ops%' 
   OR route LIKE '/admin%' 
   OR route LIKE '/api%';

-- 2. Remove internal dashboard sessions from analytics_sessions
DELETE FROM public.analytics_sessions
WHERE landing_page LIKE '/ops%' 
   OR landing_page LIKE '/admin%' 
   OR landing_page LIKE '/api%';

-- 3. Remove visitors whose only recorded activity was internal dashboard views
DELETE FROM public.analytics_visitors
WHERE (first_landing_page LIKE '/ops%' OR first_landing_page LIKE '/admin%' OR first_landing_page LIKE '/api%')
  AND (last_landing_page LIKE '/ops%' OR last_landing_page LIKE '/admin%' OR last_landing_page LIKE '/api%' OR last_landing_page IS NULL);
