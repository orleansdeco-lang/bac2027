-- ==============================================================================
-- 002_harden_errors_mission_composite_fk.sql
-- BAC Mastery - Post-Foundation Hardening Patch
-- Database: Supabase (PostgreSQL 15+)
-- Dedicated Project: erbvmpnxufgeinqnshzu
-- ==============================================================================

-- 1. Apply composite ownership FK from errors to missions with ON DELETE SET NULL
ALTER TABLE public.errors
  DROP CONSTRAINT IF EXISTS fk_errors_mission_owner;

ALTER TABLE public.errors
  ADD CONSTRAINT fk_errors_mission_owner
  FOREIGN KEY (mission_id, user_id)
  REFERENCES public.missions(id, user_id)
  ON DELETE SET NULL (mission_id);

CREATE INDEX IF NOT EXISTS idx_errors_mission_user ON public.errors(mission_id, user_id);

-- 2. Coverage constraint on diagnostic_results
ALTER TABLE public.diagnostic_results
  DROP CONSTRAINT IF EXISTS chk_diagnostic_results_coverage;

ALTER TABLE public.diagnostic_results
  ADD CONSTRAINT chk_diagnostic_results_coverage
  CHECK (coverage IN ('pilot', 'partial', 'complete'));

-- 3. Student profile identity equality constraint
ALTER TABLE public.student_profiles
  DROP CONSTRAINT IF EXISTS chk_student_profiles_id_matches_user;

ALTER TABLE public.student_profiles
  ADD CONSTRAINT chk_student_profiles_id_matches_user
  CHECK (id = user_id);
