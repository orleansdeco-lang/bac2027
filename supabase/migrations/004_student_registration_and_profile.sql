-- ==============================================================================
-- 004_student_registration_and_profile.sql
-- BAC Mastery: Student Registration & Academic Profile V1 Schema Extension
-- Dedicated Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- NON-NEGOTIABLE ARCHITECTURAL INVARIANTS:
-- 1. Single Table Canonical Identity: Extends public.student_profiles cleanly.
--    Does NOT create duplicate profile, school, parent, or location tables.
-- 2. Strict Identity Integrity: id = user_id = auth.users(id).
-- 3. Data Minimization: No email, photo, date of birth, national ID, or full address.
-- 4. Conditional Data Integrity:
--    - school_name REQUIRED if student_status in ('schooled', 'متمدرس')
--    - school_name MUST BE NULL if student_status in ('free', 'مترشح حر')
--    - target_specialty REQUIRED if has_target_specialty = true
--    - target_specialty MUST BE NULL if has_target_specialty = false
--    - Academic score validation: 0.00 to 20.00
-- ==============================================================================

-- 1. Add Registration & Contact Columns
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS student_phone TEXT,
  ADD COLUMN IF NOT EXISTS parent_phone TEXT,
  ADD COLUMN IF NOT EXISTS student_status TEXT,
  ADD COLUMN IF NOT EXISTS wilaya_code TEXT,
  ADD COLUMN IF NOT EXISTS wilaya_name TEXT,
  ADD COLUMN IF NOT EXISTS commune_code TEXT,
  ADD COLUMN IF NOT EXISTS commune_name TEXT,
  ADD COLUMN IF NOT EXISTS school_name TEXT;

-- 2. Add Academic Profile Columns
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS annual_average_year_1 NUMERIC(4, 2),
  ADD COLUMN IF NOT EXISTS annual_average_year_2 NUMERIC(4, 2),
  ADD COLUMN IF NOT EXISTS has_target_specialty BOOLEAN,
  ADD COLUMN IF NOT EXISTS target_specialty TEXT,
  ADD COLUMN IF NOT EXISTS study_methods JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS current_self_assessment TEXT,
  ADD COLUMN IF NOT EXISTS registration_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS academic_profile_completed_at TIMESTAMPTZ;

-- 3. Add Safe Conditional Constraints
DO $$
BEGIN
  -- Student Status Check
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_student_profiles_status'
  ) THEN
    ALTER TABLE public.student_profiles
      ADD CONSTRAINT chk_student_profiles_status
      CHECK (student_status IS NULL OR student_status IN ('schooled', 'free', 'متمدرس', 'مترشح حر'));
  END IF;

  -- School Name Conditional Check: Required for schooled, MUST be NULL for free candidates
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_student_profiles_school_conditional'
  ) THEN
    ALTER TABLE public.student_profiles
      ADD CONSTRAINT chk_student_profiles_school_conditional
      CHECK (
        (student_status IN ('schooled', 'متمدرس') AND school_name IS NOT NULL AND length(trim(school_name)) > 0)
        OR (student_status IN ('free', 'مترشح حر') AND school_name IS NULL)
        OR student_status IS NULL
      );
  END IF;

  -- Target Specialty Conditional Check
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_student_profiles_target_specialty_conditional'
  ) THEN
    ALTER TABLE public.student_profiles
      ADD CONSTRAINT chk_student_profiles_target_specialty_conditional
      CHECK (
        (has_target_specialty = true AND target_specialty IS NOT NULL AND length(trim(target_specialty)) > 0)
        OR (has_target_specialty = false AND target_specialty IS NULL)
        OR has_target_specialty IS NULL
      );
  END IF;

  -- Annual Averages Validation (0.00 to 20.00)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_student_profiles_annual_avg_1'
  ) THEN
    ALTER TABLE public.student_profiles
      ADD CONSTRAINT chk_student_profiles_annual_avg_1
      CHECK (annual_average_year_1 IS NULL OR (annual_average_year_1 >= 0.00 AND annual_average_year_1 <= 20.00));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_student_profiles_annual_avg_2'
  ) THEN
    ALTER TABLE public.student_profiles
      ADD CONSTRAINT chk_student_profiles_annual_avg_2
      CHECK (annual_average_year_2 IS NULL OR (annual_average_year_2 >= 0.00 AND annual_average_year_2 <= 20.00));
  END IF;
END $$;

-- 4. Indexes for fast administrative queries
CREATE INDEX IF NOT EXISTS idx_student_profiles_student_phone ON public.student_profiles(student_phone);
CREATE INDEX IF NOT EXISTS idx_student_profiles_wilaya_commune ON public.student_profiles(wilaya_code, commune_code);
