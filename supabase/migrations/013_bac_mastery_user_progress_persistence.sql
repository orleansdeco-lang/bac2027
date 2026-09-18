-- ==============================================================================
-- 013_bac_mastery_user_progress_persistence.sql
-- Persistent Student Progress, Diagnostic Loop Prevention & Study Time Tracking
-- Primary Key: (user_id, skill_id)
-- ==============================================================================

-- 1. Create public.user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stream_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'mastered')),
  diagnostic_completed BOOLEAN NOT NULL DEFAULT false,
  diagnostic_score NUMERIC(5, 2),
  last_lesson_id TEXT,
  total_time_seconds INTEGER NOT NULL DEFAULT 0 CHECK (total_time_seconds >= 0),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill_id)
);

-- 2. Add high-speed summary columns to student_profiles if not present
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS last_lesson_id TEXT,
  ADD COLUMN IF NOT EXISTS total_study_time_seconds INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS diagnostic_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS diagnostic_score NUMERIC(5, 2);

-- 3. High-Performance Composite and Query Indices
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_stream ON public.user_progress(user_id, stream_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_status ON public.user_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_diag ON public.user_progress(user_id, diagnostic_completed);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_active ON public.user_progress(user_id, last_active_at DESC);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- 5. Strict RLS Policies (Owner-Only Access)
DROP POLICY IF EXISTS "user_progress_select_own" ON public.user_progress;
CREATE POLICY "user_progress_select_own"
  ON public.user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_progress_insert_own" ON public.user_progress;
CREATE POLICY "user_progress_insert_own"
  ON public.user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_progress_update_own" ON public.user_progress;
CREATE POLICY "user_progress_update_own"
  ON public.user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_progress_delete_own" ON public.user_progress;
CREATE POLICY "user_progress_delete_own"
  ON public.user_progress
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Service role full access for administrative operations & migrations
DROP POLICY IF EXISTS "user_progress_service_role_all" ON public.user_progress;
CREATE POLICY "user_progress_service_role_all"
  ON public.user_progress
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
