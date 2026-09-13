-- ==============================================================================
-- 005_enforce_72h_trial_and_stream_lock.sql
-- BAC Mastery: 72-Hour Free Trial Enforcement & Stream-Locked Profile Constraint
-- Dedicated Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- NON-NEGOTIABLE ARCHITECTURAL INVARIANTS:
-- 1. Exact 72-Hour Trial: trial_expires_at defaults to now() + interval '72 hours'.
-- 2. Authoritative Server-Side Truth: Anchored at account creation timestamp.
-- 3. Reset Protection: Trigger prevents client tampering with trial timestamps.
-- 4. Canonical Streams Check: Validates stream_id against the 6 Algerian BAC streams.
-- 5. Strict Identity Integrity: id = user_id = auth.users(id).
-- ==============================================================================

-- 1. Update trial_expires_at column default to 72 hours
ALTER TABLE public.student_profiles
  ALTER COLUMN trial_expires_at SET DEFAULT (now() + interval '72 hours');

-- 2. Stream ID Constraint: Restrict to canonical Algerian BAC streams
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_student_profiles_canonical_stream'
  ) THEN
    ALTER TABLE public.student_profiles
      ADD CONSTRAINT chk_student_profiles_canonical_stream
      CHECK (
        stream_id IS NULL OR stream_id IN (
          'sciences_exp',
          'math',
          'technique_math',
          'gestion_eco',
          'lettres_philo',
          'langues_etrangeres'
        )
      );
  END IF;
END $$;

-- 3. Update PostgreSQL Protection Trigger for 72-Hour Trial Integrity
-- Prevents student clients from altering trial_started_at, extending trial_expires_at, or self-elevating to PAID
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

-- Re-attach trigger if not already active
DROP TRIGGER IF EXISTS trg_protect_student_trial ON public.student_profiles;
CREATE TRIGGER trg_protect_student_trial
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_student_trial_fields();
