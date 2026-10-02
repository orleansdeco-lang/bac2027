-- ==============================================================================
-- 055_enforce_3day_trial_and_phone_uniqueness.sql
-- SHATER BAC: Strict 3-Day (72h) Trial, Canonical Phone Normalization & Uniqueness
-- ==============================================================================
-- INVARIANTS:
-- 1. Strictly 3-Day (72 Hours) Trial anchored at creation date.
-- 2. Phone Uniqueness: 1 student profile per canonical Algerian phone number.
-- 3. Canonical Phone Format: +213[567]XXXXXXXX (normalized from 05/06/07, 00213, 213, spaces).
-- 4. No Free Access after Trial: access_status = 'EXPIRED' when trial_expires_at < now() and no paid subscription.
-- ==============================================================================

-- 1. Create PostgreSQL function for Algerian phone canonicalization
CREATE OR REPLACE FUNCTION public.to_canonical_algerian_phone(phone_input TEXT)
RETURNS TEXT AS $$
DECLARE
  clean TEXT;
BEGIN
  IF phone_input IS NULL OR TRIM(phone_input) = '' THEN
    RETURN NULL;
  END IF;

  -- Strip all spaces, dots, dashes, parentheses, slashes
  clean := regexp_replace(TRIM(phone_input), '[\s\.\-\(\)\/]', '', 'g');

  -- Convert 00213... to +213...
  IF clean LIKE '00213%' THEN
    clean := '+213' || SUBSTRING(clean FROM 6);
  -- Convert 213... (11 or 12 digits) to +213...
  ELSIF clean LIKE '213%' AND LENGTH(clean) >= 11 THEN
    clean := '+' || clean;
  -- Convert 05/06/07 (10 digits) to +2135/+2136/+2137
  ELSIF clean LIKE '0%' AND LENGTH(clean) = 10 THEN
    clean := '+213' || SUBSTRING(clean FROM 2);
  -- If exactly 9 digits starting with 5, 6, 7
  ELSIF clean ~ '^[567][0-9]{8}$' THEN
    clean := '+213' || clean;
  END IF;

  -- Verify valid Algerian mobile format: +213 followed by 5, 6, or 7 and 8 digits
  IF clean ~ '^\+213[567][0-9]{8}$' THEN
    RETURN clean;
  END IF;

  -- If not standard mobile, return cleaned
  RETURN clean;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 2. Add canonical_phone column to student_profiles
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS canonical_phone TEXT;

-- 3. Populate existing rows with canonical phone
UPDATE public.student_profiles
SET canonical_phone = public.to_canonical_algerian_phone(student_phone)
WHERE student_phone IS NOT NULL AND (canonical_phone IS NULL OR canonical_phone = '');

-- 4. Unique partial index on canonical_phone (prevents duplicate phone numbers across student accounts)
CREATE UNIQUE INDEX IF NOT EXISTS uq_student_profiles_canonical_phone
  ON public.student_profiles(canonical_phone)
  WHERE canonical_phone IS NOT NULL AND canonical_phone != '';

-- 5. Trigger function to always keep canonical_phone in sync
CREATE OR REPLACE FUNCTION public.sync_student_canonical_phone()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.student_phone IS NOT NULL AND TRIM(NEW.student_phone) != '' THEN
    NEW.canonical_phone := public.to_canonical_algerian_phone(NEW.student_phone);
  ELSE
    NEW.canonical_phone := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_student_canonical_phone ON public.student_profiles;
CREATE TRIGGER trg_sync_student_canonical_phone
  BEFORE INSERT OR UPDATE OF student_phone ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_student_canonical_phone();

-- 6. Enforce 3-Day (72 hours) Trial Default & Trigger Protection
ALTER TABLE public.student_profiles
  ALTER COLUMN trial_expires_at SET DEFAULT (now() + interval '72 hours');

-- Ensure all trial users have strictly 72 hours from creation
UPDATE public.student_profiles
SET trial_expires_at = created_at + interval '72 hours'
WHERE (access_status IS NULL OR access_status IN ('TRIAL', 'EXPIRED'))
  AND (plan IS NULL OR plan NOT IN ('PAID', 'season', 'monthly'))
  AND trial_expires_at > created_at + interval '72 hours';

-- 7. Update PostgreSQL Trigger for Trial Integrity
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

    -- Student cannot self-elevate plan to commercial plans
    IF (OLD.plan IS DISTINCT FROM NEW.plan AND NEW.plan IN ('PAID', 'season', 'monthly')) THEN
      NEW.plan := OLD.plan;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
