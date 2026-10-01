-- ==============================================================================
-- 046_fix_planner_and_student_sync.sql
-- Fixes:
-- 1. Sets production-safe defaults on student_profiles (stream_id, target_score)
--    preventing null value in column "stream_id" (code 23502) on profile creation/sync.
-- 2. Grants explicit permissions to authenticated role for student_profiles and planner tables
--    preventing permission denied (code 42501).
-- 3. Hardens RLS owner-only policies for all planner entities.
-- ==============================================================================

-- 1. student_profiles column defaults
ALTER TABLE public.student_profiles 
  ALTER COLUMN stream_id SET DEFAULT 'sciences_exp';

ALTER TABLE public.student_profiles 
  ALTER COLUMN target_score SET DEFAULT 16.00;

-- 2. Explicit grants for authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planner_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.daily_reflections TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.planner_preferences TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated;

-- Ensure service_role has all permissions
GRANT ALL ON public.student_profiles TO service_role;
GRANT ALL ON public.planner_events TO service_role;
GRANT ALL ON public.study_sessions TO service_role;
GRANT ALL ON public.daily_reflections TO service_role;
GRANT ALL ON public.planner_preferences TO service_role;
GRANT ALL ON public.notification_preferences TO service_role;

-- 3. Ensure RLS is active
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planner_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- 4. Harden owner-only policies on planner tables
DROP POLICY IF EXISTS "planner_events_owner" ON public.planner_events;
CREATE POLICY "planner_events_owner" ON public.planner_events
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "study_sessions_owner" ON public.study_sessions;
CREATE POLICY "study_sessions_owner" ON public.study_sessions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "daily_reflections_owner" ON public.daily_reflections;
CREATE POLICY "daily_reflections_owner" ON public.daily_reflections
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "planner_preferences_owner" ON public.planner_preferences;
CREATE POLICY "planner_preferences_owner" ON public.planner_preferences
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notification_preferences_owner" ON public.notification_preferences;
CREATE POLICY "notification_preferences_owner" ON public.notification_preferences
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
