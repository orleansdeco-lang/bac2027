-- ==============================================================================
-- Migration 059: Server-Side Phone Verification via WhatsApp OTP & Rate Limiting
-- 
-- Phase 1: Security, Persistence, Schema & Anti-Abuse Foundation
-- 
-- INVARIANTS:
-- 1. Plaintext OTP codes are NEVER persisted in PostgreSQL.
-- 2. OTP hash uses server-side HMAC-SHA256 with OTP_PEPPER.
-- 3. Exact 10-minute expiry and max 5 attempts per challenge.
-- 4. Single active OTP challenge per student at any time (invalidates previous).
-- 5. Persistent rate limiting (Postgres-backed) resilient across serverless instances.
-- 6. phone_verified and phone_verified_at are strictly authoritatively set by server.
-- 7. Trigger prevents authenticated/anon clients from self-verifying phone numbers.
-- 8. Any change to student_phone or canonical_phone automatically resets phone_verified to false.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: ADD phone_verified & phone_verified_at TO student_profiles
-- ------------------------------------------------------------------------------
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_student_profiles_phone_verified 
  ON public.student_profiles(phone_verified);

-- ------------------------------------------------------------------------------
-- STEP 2: CREATE phone_verification_codes TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.phone_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  canonical_phone TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 5,
  consumed_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_attempt_at TIMESTAMPTZ NULL
);

-- Indexes for lightning-fast active challenge lookups
CREATE INDEX IF NOT EXISTS idx_phone_otp_user_id 
  ON public.phone_verification_codes(user_id);

CREATE INDEX IF NOT EXISTS idx_phone_otp_canonical_phone 
  ON public.phone_verification_codes(canonical_phone);

CREATE INDEX IF NOT EXISTS idx_phone_otp_expires_at 
  ON public.phone_verification_codes(expires_at);

CREATE INDEX IF NOT EXISTS idx_phone_otp_consumed_at 
  ON public.phone_verification_codes(consumed_at);

CREATE INDEX IF NOT EXISTS idx_phone_otp_active_lookup 
  ON public.phone_verification_codes(user_id, consumed_at, expires_at);

-- Row Level Security: Deny all client access (anon & authenticated); strictly service_role only
ALTER TABLE public.phone_verification_codes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.phone_verification_codes FROM anon, authenticated;
GRANT ALL ON public.phone_verification_codes TO service_role;

-- ------------------------------------------------------------------------------
-- STEP 3: CREATE rate_limit_events TABLE FOR SERVERLESS PERSISTENT RATE LIMITING
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rate_limit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  action TEXT NOT NULL,
  identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_events_key_created 
  ON public.rate_limit_events(key, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limit_events_created 
  ON public.rate_limit_events(created_at);

ALTER TABLE public.rate_limit_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.rate_limit_events FROM anon, authenticated;
GRANT ALL ON public.rate_limit_events TO service_role;

-- ------------------------------------------------------------------------------
-- STEP 4: PERSISTENT RATE LIMITING RPC
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_and_record_rate_limit(
  p_key TEXT,
  p_action TEXT,
  p_identifier TEXT,
  p_max_requests INTEGER,
  p_window_seconds INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_window_start TIMESTAMPTZ := v_now - (p_window_seconds || ' seconds')::INTERVAL;
  v_count INTEGER;
  v_oldest TIMESTAMPTZ;
  v_reset_seconds INTEGER;
BEGIN
  -- Count events recorded within the active sliding window
  SELECT COUNT(*), MIN(created_at)
  INTO v_count, v_oldest
  FROM public.rate_limit_events
  WHERE key = p_key AND created_at >= v_window_start;

  IF v_count >= p_max_requests THEN
    v_reset_seconds := GREATEST(1, EXTRACT(EPOCH FROM (v_oldest + (p_window_seconds || ' seconds')::INTERVAL - v_now))::INTEGER);
    RETURN jsonb_build_object(
      'allowed', false,
      'current_count', v_count,
      'max_requests', p_max_requests,
      'reset_seconds', v_reset_seconds
    );
  END IF;

  -- Record this request event
  INSERT INTO public.rate_limit_events (key, action, identifier, created_at)
  VALUES (p_key, p_action, p_identifier, v_now);

  RETURN jsonb_build_object(
    'allowed', true,
    'current_count', v_count + 1,
    'max_requests', p_max_requests,
    'reset_seconds', p_window_seconds
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- STEP 5: COOLDOWN CHECK RPC (60 SECONDS MINIMUM INTERVAL)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_otp_send_cooldown(
  p_user_id UUID,
  p_canonical_phone TEXT,
  p_cooldown_seconds INTEGER DEFAULT 60
)
RETURNS JSONB AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_last_created TIMESTAMPTZ;
  v_elapsed INTEGER;
  v_remaining INTEGER;
BEGIN
  SELECT created_at INTO v_last_created
  FROM public.phone_verification_codes
  WHERE user_id = p_user_id OR canonical_phone = p_canonical_phone
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    v_elapsed := EXTRACT(EPOCH FROM (v_now - v_last_created))::INTEGER;
    IF v_elapsed < p_cooldown_seconds THEN
      v_remaining := p_cooldown_seconds - v_elapsed;
      RETURN jsonb_build_object(
        'allowed', false,
        'cooldown_seconds', p_cooldown_seconds,
        'remaining_seconds', v_remaining,
        'message', 'يرجى الانتظار ' || v_remaining || ' ثانية قبل طلب رمز جديد.'
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('allowed', true, 'remaining_seconds', 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- STEP 6: ATOMIC VERIFICATION & CONSUMPTION RPC WITH ROW LOCKING
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_and_consume_phone_otp(
  p_user_id UUID,
  p_canonical_phone TEXT,
  p_otp_hash TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_challenge RECORD;
  v_now TIMESTAMPTZ := now();
  v_remaining INTEGER;
BEGIN
  -- 1. Find active challenge for this user and phone, lock the row
  SELECT * INTO v_challenge
  FROM public.phone_verification_codes
  WHERE user_id = p_user_id
    AND canonical_phone = p_canonical_phone
    AND consumed_at IS NULL
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CHALLENGE_NOT_FOUND',
      'message', 'لم يتم العثور على رمز تحقق نشط. يرجى طلب رمز جديد.'
    );
  END IF;

  -- 2. Check if expired (10 minutes)
  IF v_challenge.expires_at < v_now THEN
    UPDATE public.phone_verification_codes
    SET consumed_at = v_now,
        last_attempt_at = v_now
    WHERE id = v_challenge.id;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'EXPIRED',
      'message', 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.'
    );
  END IF;

  -- 3. Check attempts count
  IF v_challenge.attempts >= v_challenge.max_attempts THEN
    UPDATE public.phone_verification_codes
    SET consumed_at = v_now,
        last_attempt_at = v_now
    WHERE id = v_challenge.id;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'MAX_ATTEMPTS_EXCEEDED',
      'remaining_attempts', 0,
      'message', 'تم تجاوز الحد الأقصى للمحاولات. يرجى طلب رمز جديد.'
    );
  END IF;

  -- 4. Increment attempts
  UPDATE public.phone_verification_codes
  SET attempts = attempts + 1,
      last_attempt_at = v_now
  WHERE id = v_challenge.id;

  -- 5. Compare OTP HMAC Hash
  IF v_challenge.otp_hash != p_otp_hash THEN
    v_remaining := v_challenge.max_attempts - (v_challenge.attempts + 1);
    IF v_remaining <= 0 THEN
      UPDATE public.phone_verification_codes
      SET consumed_at = v_now
      WHERE id = v_challenge.id;

      RETURN jsonb_build_object(
        'success', false,
        'error', 'MAX_ATTEMPTS_EXCEEDED',
        'remaining_attempts', 0,
        'message', 'رمز التحقق غير صحيح. تم تجاوز الحد الأقصى للمحاولات. يرجى طلب رمز جديد.'
      );
    ELSE
      RETURN jsonb_build_object(
        'success', false,
        'error', 'INVALID_CODE',
        'remaining_attempts', v_remaining,
        'message', 'رمز التحقق غير صحيح. تبقى لديك ' || v_remaining || ' محاولات.'
      );
    END IF;
  END IF;

  -- 6. Successful verification!
  -- Mark current challenge consumed
  UPDATE public.phone_verification_codes
  SET consumed_at = v_now
  WHERE id = v_challenge.id;

  -- Invalidate any remaining open codes for this user
  UPDATE public.phone_verification_codes
  SET consumed_at = v_now
  WHERE user_id = p_user_id AND consumed_at IS NULL AND id != v_challenge.id;

  -- Authoritatively set session variable to permit verification flag update in trigger
  PERFORM set_config('app.authoritative_otp_verification', 'true', true);

  -- Update student profile
  UPDATE public.student_profiles
  SET phone_verified = true,
      phone_verified_at = v_now,
      student_phone = public.to_canonical_algerian_phone(p_canonical_phone),
      canonical_phone = public.to_canonical_algerian_phone(p_canonical_phone),
      updated_at = v_now
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'verified', true,
    'phone', p_canonical_phone
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- STEP 7: TRIGGER FUNCTION TO PROTECT phone_verified ON student_profiles
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_student_phone_verification_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If phone changed, always reset phone_verified to false and clear phone_verified_at
  -- UNLESS this update is currently performing authoritative OTP verification
  IF ((OLD.student_phone IS DISTINCT FROM NEW.student_phone) OR (OLD.canonical_phone IS DISTINCT FROM NEW.canonical_phone)) 
     AND NOT (NEW.phone_verified = true AND OLD.phone_verified = false) THEN
    NEW.phone_verified := false;
    NEW.phone_verified_at := NULL;
  END IF;

  -- If called by authenticated or anon client role:
  IF (auth.role() = 'authenticated' OR auth.role() = 'anon') THEN
    -- Check if session variable is set by authoritative RPC
    IF current_setting('app.authoritative_otp_verification', true) IS DISTINCT FROM 'true' THEN
      -- Direct client update cannot modify phone_verified or phone_verified_at!
      IF (OLD.phone_verified IS DISTINCT FROM NEW.phone_verified) THEN
        NEW.phone_verified := OLD.phone_verified;
      END IF;
      IF (OLD.phone_verified_at IS DISTINCT FROM NEW.phone_verified_at) THEN
        NEW.phone_verified_at := OLD.phone_verified_at;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_protect_student_phone_verification ON public.student_profiles;
CREATE TRIGGER trg_protect_student_phone_verification
  BEFORE UPDATE ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_student_phone_verification_fields();

-- ------------------------------------------------------------------------------
-- STEP 8: TRIGGER FUNCTION FOR INSERT TO PREVENT CLIENT-INITIATED VERIFIED STATE
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_student_phone_verification_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF (auth.role() = 'authenticated' OR auth.role() = 'anon') THEN
    IF current_setting('app.authoritative_otp_verification', true) IS DISTINCT FROM 'true' THEN
      NEW.phone_verified := false;
      NEW.phone_verified_at := NULL;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_protect_student_phone_verification_insert ON public.student_profiles;
CREATE TRIGGER trg_protect_student_phone_verification_insert
  BEFORE INSERT ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_student_phone_verification_on_insert();
