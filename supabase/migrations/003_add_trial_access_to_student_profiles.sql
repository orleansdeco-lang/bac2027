-- ==============================================================================
-- 003_add_trial_access_to_student_profiles.sql
-- BAC Mastery Prompt 18: 48-Hour Free Trial & Access Control Schema
-- Dedicated Project: erbvmpnxufgeinqnshzu
-- ==============================================================================

-- 1. Add trial and access status columns to student_profiles
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ DEFAULT (now() + interval '48 hours'),
  ADD COLUMN IF NOT EXISTS access_status TEXT NOT NULL DEFAULT 'TRIAL' CHECK (access_status IN ('TRIAL', 'PAID', 'EXPIRED')),
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'PILOT_TRIAL' CHECK (plan IN ('PILOT_TRIAL', 'PAID'));

-- 2. Index for access status queries
CREATE INDEX IF NOT EXISTS idx_student_profiles_access_status ON public.student_profiles(access_status);
CREATE INDEX IF NOT EXISTS idx_student_profiles_trial_expires ON public.student_profiles(trial_expires_at);

-- 3. PostgreSQL Protection Trigger
-- Prevents student clients from tampering with trial duration or falsely setting access_status to PAID
CREATE OR REPLACE FUNCTION public.protect_student_trial_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If invoked by an authenticated student (client role), preserve authoritative server values
  IF (auth.role() = 'authenticated') THEN
    -- Student cannot change trial_started_at
    IF (OLD.trial_started_at IS DISTINCT FROM NEW.trial_started_at) THEN
      NEW.trial_started_at := OLD.trial_started_at;
    END IF;

    -- Student cannot extend trial_expires_at
    IF (OLD.trial_expires_at IS DISTINCT FROM NEW.trial_expires_at) THEN
      NEW.trial_expires_at := OLD.trial_expires_at;
    END IF;

    -- Student cannot self-elevate to PAID
    IF (OLD.access_status IS DISTINCT FROM NEW.access_status AND NEW.access_status = 'PAID') THEN
      NEW.access_status := OLD.access_status;
    END IF;

    -- Student cannot self-elevate plan to PAID
    IF (OLD.plan IS DISTINCT FROM NEW.plan AND NEW.plan = 'PAID') THEN
      NEW.plan := OLD.plan;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_student_trial ON public.student_profiles;
CREATE TRIGGER trg_protect_student_trial
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_student_trial_fields();
