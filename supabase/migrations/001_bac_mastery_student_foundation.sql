-- ==============================================================================
-- 001_bac_mastery_student_foundation.sql
-- BAC Mastery Dedicated Student Backend Foundation (Prompt 10.3.1 Hardened)
-- Database: Supabase (PostgreSQL 15+)
-- Dedicated Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- NON-NEGOTIABLE ARCHITECTURAL INVARIANTS:
-- 1. Student Data Only: Exactly 10 student-owned tables. Zero content/curriculum tables.
-- 2. Strict Identity Integrity: 
--    student_profiles.id = auth.users(id) ON DELETE CASCADE
--    student_profiles.user_id = auth.users(id) ON DELETE CASCADE
--    Enforced via CONSTRAINT chk_student_profiles_id_matches_user CHECK (id = user_id).
-- 3. Composite Ownership-Safe Foreign Keys: Child entities enforce (parent_id, user_id)
--    referencing parent(id, user_id) to prevent cross-user reference attacks at the DB level.
-- 4. Durable Learning Evidence: errors.mission_id references missions(id, user_id)
--    with ON DELETE SET NULL (mission_id), preserving student error records if a mission is cleared.
-- 5. Row Level Security: ENABLED on every table, with strict auth.uid() = user_id checks.
-- 6. Canonical Domain States: Aligned with TypeScript domain models and strict CHECK constraints.
-- 7. Non-Predictive Diagnostic Terminology: observed_signal, coverage, bottleneck_candidate.
-- ==============================================================================

-- Enable standard cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. STUDENT IDENTITY (student_profiles)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.student_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  education_level TEXT NOT NULL DEFAULT 'secondary',
  exam_type TEXT NOT NULL DEFAULT 'bac',
  stream_id TEXT NOT NULL,
  specialty_id TEXT,
  target_score NUMERIC(4, 2) NOT NULL CHECK (target_score >= 10.00 AND target_score <= 20.00),
  baseline_score NUMERIC(4, 2) CHECK (baseline_score >= 0.00 AND baseline_score <= 20.00),
  weekly_study_hours INTEGER NOT NULL DEFAULT 10 CHECK (weekly_study_hours >= 0),
  future_objective TEXT,
  biggest_obstacle TEXT,
  energy_state TEXT NOT NULL DEFAULT 'normal' CHECK (energy_state IN ('good', 'normal', 'tired', 'stressed')),
  language TEXT NOT NULL DEFAULT 'ar' CHECK (language IN ('ar', 'fr')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  raw_draft JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_student_profiles_id_matches_user CHECK (id = user_id)
);

CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON public.student_profiles(user_id);

-- ==============================================================================
-- 2. DIAGNOSTIC SUBSYSTEM (diagnostic_sessions, diagnostic_answers, diagnostic_results)
-- ==============================================================================

-- 2a. Diagnostic Sessions
CREATE TABLE IF NOT EXISTS public.diagnostic_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  coverage TEXT NOT NULL DEFAULT 'pilot' CHECK (coverage IN ('pilot', 'partial', 'complete')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  CONSTRAINT uq_diagnostic_sessions_id_user UNIQUE (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_sessions_user_status ON public.diagnostic_sessions(user_id, status);

-- 2b. Diagnostic Answers (Composite ownership-safe FK to session)
CREATE TABLE IF NOT EXISTS public.diagnostic_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  dimension TEXT NOT NULL,
  selected_option_id TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence >= 1 AND confidence <= 5),
  time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_diagnostic_answers_session_owner 
    FOREIGN KEY (session_id, user_id) 
    REFERENCES public.diagnostic_sessions(id, user_id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_answers_session_user ON public.diagnostic_answers(session_id, user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_answers_user ON public.diagnostic_answers(user_id);

-- 2c. Diagnostic Results (Composite ownership-safe FK to session)
CREATE TABLE IF NOT EXISTS public.diagnostic_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  observed_signal NUMERIC(5, 2) NOT NULL CHECK (observed_signal >= 0 AND observed_signal <= 100),
  coverage TEXT NOT NULL DEFAULT 'pilot' CHECK (coverage IN ('pilot', 'partial', 'complete')),
  bottleneck_candidate TEXT, -- nullable: can be skill_id, null, or 'insufficient_evidence'
  confidence_calibration JSONB NOT NULL DEFAULT '{}'::jsonb,
  question_count INTEGER NOT NULL DEFAULT 15 CHECK (question_count >= 0),
  dimension_signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  subject_signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  misconceptions JSONB NOT NULL DEFAULT '[]'::jsonb,
  limitations TEXT[] NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'diagnostic_engine',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_diagnostic_results_session_owner 
    FOREIGN KEY (session_id, user_id) 
    REFERENCES public.diagnostic_sessions(id, user_id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_diagnostic_results_session_user ON public.diagnostic_results(session_id, user_id);
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_user ON public.diagnostic_results(user_id);

-- ==============================================================================
-- 3. LEARNING EXECUTION (missions, practice_attempts)
-- ==============================================================================

-- 3a. Missions (Canonical states: available, in_progress, repair_needed, retest_ready, needs_more_work, mastered)
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN (
    'available', 'in_progress', 'repair_needed', 'retest_ready', 'needs_more_work', 'mastered'
  )),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  generation_source TEXT NOT NULL DEFAULT 'diagnostic_bottleneck',
  estimated_minutes INTEGER NOT NULL DEFAULT 15 CHECK (estimated_minutes > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_missions_id_user UNIQUE (id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_missions_user_status ON public.missions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_missions_user_skill ON public.missions(user_id, skill_id);

-- 3b. Practice Attempts (Composite ownership-safe FK to mission)
CREATE TABLE IF NOT EXISTS public.practice_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  attempt_type TEXT NOT NULL DEFAULT 'practice' CHECK (attempt_type IN ('practice', 'retest')),
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence >= 1 AND confidence <= 5),
  time_spent_seconds INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_practice_attempts_mission_owner 
    FOREIGN KEY (mission_id, user_id) 
    REFERENCES public.missions(id, user_id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_practice_attempts_mission_user ON public.practice_attempts(mission_id, user_id);
CREATE INDEX IF NOT EXISTS idx_practice_attempts_user_skill ON public.practice_attempts(user_id, skill_id);

-- ==============================================================================
-- 4. ERROR LAB (errors, error_repairs, retests)
-- ==============================================================================

-- 4a. Errors (Ownership-safe nullable composite FK to missions)
CREATE TABLE IF NOT EXISTS public.errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID,
  skill_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  system_inferred_error_type TEXT NOT NULL,
  student_selected_error_type TEXT,
  status TEXT NOT NULL DEFAULT 'identified' CHECK (status IN (
    'identified', 'repair_started', 'repair_completed', 'retest_passed', 'retest_failed'
  )),
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  occurrence_count INTEGER NOT NULL DEFAULT 1 CHECK (occurrence_count >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_errors_id_user UNIQUE (id, user_id),
  CONSTRAINT fk_errors_mission_owner 
    FOREIGN KEY (mission_id, user_id) 
    REFERENCES public.missions(id, user_id) 
    ON DELETE SET NULL (mission_id)
);

CREATE INDEX IF NOT EXISTS idx_errors_user_status ON public.errors(user_id, status);
CREATE INDEX IF NOT EXISTS idx_errors_user_skill ON public.errors(user_id, skill_id);
CREATE INDEX IF NOT EXISTS idx_errors_mission_user ON public.errors(mission_id, user_id);

-- 4b. Error Repairs (Composite ownership-safe FK to error)
CREATE TABLE IF NOT EXISTS public.error_repairs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  steps_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  student_reflection TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT fk_error_repairs_error_owner 
    FOREIGN KEY (error_id, user_id) 
    REFERENCES public.errors(id, user_id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_error_repairs_error_user ON public.error_repairs(error_id, user_id);
CREATE INDEX IF NOT EXISTS idx_error_repairs_user ON public.error_repairs(user_id);

-- 4c. Retests (Composite ownership-safe FK to error)
CREATE TABLE IF NOT EXISTS public.retests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  practice_question_id TEXT NOT NULL,
  retest_question_id TEXT NOT NULL,
  is_passed BOOLEAN NOT NULL,
  selected_answer TEXT NOT NULL,
  confidence INTEGER NOT NULL CHECK (confidence >= 1 AND confidence <= 5),
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_retests_error_owner 
    FOREIGN KEY (error_id, user_id) 
    REFERENCES public.errors(id, user_id) 
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_retests_error_user ON public.retests(error_id, user_id);
CREATE INDEX IF NOT EXISTS idx_retests_user ON public.retests(user_id);

-- ==============================================================================
-- 5. MASTERY SUBSYSTEM (skill_mastery)
-- ==============================================================================

-- Canonical mastery states: not_yet (default), emerging, demonstrated
CREATE TABLE IF NOT EXISTS public.skill_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_yet' CHECK (status IN ('not_yet', 'emerging', 'demonstrated')),
  confidence_score NUMERIC(3, 2) CHECK (confidence_score IS NULL OR (confidence_score >= 0.00 AND confidence_score <= 1.00)),
  evidence_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_skill_mastery_user_skill UNIQUE (user_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_skill_mastery_user_skill ON public.skill_mastery(user_id, skill_id);

-- ==============================================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS on all 10 tables
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_mastery ENABLE ROW LEVEL SECURITY;

-- 1. student_profiles policies (Strict identity check id = user_id = auth.uid())
CREATE POLICY "student_profiles_select_own" ON public.student_profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "student_profiles_insert_own" ON public.student_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id AND auth.uid() = user_id);

CREATE POLICY "student_profiles_update_own" ON public.student_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND auth.uid() = user_id);

CREATE POLICY "student_profiles_delete_own" ON public.student_profiles
  FOR DELETE TO authenticated USING (auth.uid() = id);

-- 2. diagnostic_sessions policies
CREATE POLICY "diagnostic_sessions_select_own" ON public.diagnostic_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "diagnostic_sessions_insert_own" ON public.diagnostic_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "diagnostic_sessions_update_own" ON public.diagnostic_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "diagnostic_sessions_delete_own" ON public.diagnostic_sessions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3. diagnostic_answers policies
CREATE POLICY "diagnostic_answers_select_own" ON public.diagnostic_answers
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "diagnostic_answers_insert_own" ON public.diagnostic_answers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "diagnostic_answers_update_own" ON public.diagnostic_answers
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "diagnostic_answers_delete_own" ON public.diagnostic_answers
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4. diagnostic_results policies
CREATE POLICY "diagnostic_results_select_own" ON public.diagnostic_results
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "diagnostic_results_insert_own" ON public.diagnostic_results
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "diagnostic_results_update_own" ON public.diagnostic_results
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "diagnostic_results_delete_own" ON public.diagnostic_results
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. missions policies
CREATE POLICY "missions_select_own" ON public.missions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "missions_insert_own" ON public.missions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "missions_update_own" ON public.missions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "missions_delete_own" ON public.missions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 6. practice_attempts policies
CREATE POLICY "practice_attempts_select_own" ON public.practice_attempts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "practice_attempts_insert_own" ON public.practice_attempts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "practice_attempts_update_own" ON public.practice_attempts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "practice_attempts_delete_own" ON public.practice_attempts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 7. errors policies
CREATE POLICY "errors_select_own" ON public.errors
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "errors_insert_own" ON public.errors
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "errors_update_own" ON public.errors
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "errors_delete_own" ON public.errors
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 8. error_repairs policies
CREATE POLICY "error_repairs_select_own" ON public.error_repairs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "error_repairs_insert_own" ON public.error_repairs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "error_repairs_update_own" ON public.error_repairs
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "error_repairs_delete_own" ON public.error_repairs
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 9. retests policies
CREATE POLICY "retests_select_own" ON public.retests
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "retests_insert_own" ON public.retests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "retests_update_own" ON public.retests
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "retests_delete_own" ON public.retests
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 10. skill_mastery policies
CREATE POLICY "skill_mastery_select_own" ON public.skill_mastery
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "skill_mastery_insert_own" ON public.skill_mastery
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skill_mastery_update_own" ON public.skill_mastery
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "skill_mastery_delete_own" ON public.skill_mastery
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
