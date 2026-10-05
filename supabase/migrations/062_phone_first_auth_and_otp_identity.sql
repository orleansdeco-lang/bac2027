-- ==============================================================================
-- Migration 062: Phone-First Authentication & Identity via WhatsApp OTP
-- 
-- Extends the authentication and identity architecture so that Algerian Phone Number
-- + WhatsApp OTP is the primary and sole identity for student accounts.
--
-- INVARIANTS:
-- 1. Unauthenticated visitors can request OTP challenges before an auth.users record exists.
-- 2. phone_verification_codes.user_id is made NULLABLE (FK preserved when present).
-- 3. verify_and_consume_phone_otp supports both guest phone challenges and authenticated profile updates.
-- 4. Persistent rate limiting and 60-second cooldown work by canonical_phone and client IP.
-- 5. handle_new_auth_user trigger automatically inherits phone metadata from auth.users.
-- 6. No destructive schema changes: email column remains intact and nullable for legacy users.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: MAKE user_id NULLABLE ON phone_verification_codes
-- ------------------------------------------------------------------------------
ALTER TABLE public.phone_verification_codes 
  ALTER COLUMN user_id DROP NOT NULL;

-- Index for phone-only challenge lookups
CREATE INDEX IF NOT EXISTS idx_phone_otp_canonical_unconsumed
  ON public.phone_verification_codes(canonical_phone, consumed_at, expires_at);

-- ------------------------------------------------------------------------------
-- STEP 2: UPDATE COOLDOWN CHECK RPC (SUPPORTS NULL user_id)
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
  WHERE (p_user_id IS NOT NULL AND user_id = p_user_id) 
     OR canonical_phone = p_canonical_phone
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
-- STEP 3: UPDATE ATOMIC VERIFICATION & CONSUMPTION RPC (SUPPORTS NULL user_id)
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
  v_effective_user_id UUID;
BEGIN
  -- 1. Find active challenge for this phone (and user_id if provided), lock the row
  IF p_user_id IS NOT NULL THEN
    SELECT * INTO v_challenge
    FROM public.phone_verification_codes
    WHERE (user_id = p_user_id OR user_id IS NULL)
      AND canonical_phone = p_canonical_phone
      AND consumed_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
    FOR UPDATE;
  ELSE
    SELECT * INTO v_challenge
    FROM public.phone_verification_codes
    WHERE canonical_phone = p_canonical_phone
      AND consumed_at IS NULL
    ORDER BY created_at DESC
    LIMIT 1
    FOR UPDATE;
  END IF;

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

  -- Invalidate any remaining open codes for this phone
  UPDATE public.phone_verification_codes
  SET consumed_at = v_now
  WHERE canonical_phone = p_canonical_phone AND consumed_at IS NULL;

  -- Determine effective user_id: provided param, or challenge user_id, or matched profile
  v_effective_user_id := COALESCE(p_user_id, v_challenge.user_id);
  IF v_effective_user_id IS NULL THEN
    SELECT id INTO v_effective_user_id
    FROM public.student_profiles
    WHERE canonical_phone = p_canonical_phone
       OR student_phone = public.to_canonical_algerian_phone(p_canonical_phone)
    LIMIT 1;
  END IF;

  -- Authoritatively set session variable to permit verification flag update in trigger
  PERFORM set_config('app.authoritative_otp_verification', 'true', true);

  -- If user_id is identified, update their student profile
  IF v_effective_user_id IS NOT NULL THEN
    UPDATE public.student_profiles
    SET phone_verified = true,
        phone_verified_at = v_now,
        student_phone = public.to_canonical_algerian_phone(p_canonical_phone),
        canonical_phone = public.to_canonical_algerian_phone(p_canonical_phone),
        updated_at = v_now
    WHERE id = v_effective_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'verified', true,
    'phone', p_canonical_phone,
    'user_id', v_effective_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Revoke execute from anon & authenticated; strictly service_role only
REVOKE EXECUTE ON FUNCTION public.verify_and_consume_phone_otp(UUID, TEXT, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_and_consume_phone_otp(UUID, TEXT, TEXT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.check_otp_send_cooldown(UUID, TEXT, INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_otp_send_cooldown(UUID, TEXT, INTEGER) TO service_role;

-- ------------------------------------------------------------------------------
-- STEP 4: UPDATE handle_new_auth_user() TO SUPPORT PHONE IDENTITY METADATA
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_first_name TEXT;
  v_last_name TEXT;
  v_email_name TEXT;
  v_phone TEXT;
  v_canonical TEXT;
  v_phone_verified BOOLEAN := false;
BEGIN
  -- Extract phone metadata
  v_phone := NULLIF(TRIM(COALESCE(
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'student_phone',
    NEW.phone
  )), '');

  IF v_phone IS NOT NULL THEN
    v_canonical := public.to_canonical_algerian_phone(v_phone);
    IF (NEW.raw_user_meta_data->>'phone_verified')::BOOLEAN IS TRUE OR NEW.phone_confirmed_at IS NOT NULL THEN
      v_phone_verified := true;
    END IF;
  END IF;

  -- Extract sensible fallback names
  v_email_name := split_part(COALESCE(NEW.email, 'طالب'), '@', 1);
  v_first_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    CASE WHEN v_phone IS NOT NULL THEN 'طالب' ELSE v_email_name END
  );
  v_last_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), ''), '');

  INSERT INTO public.student_profiles (
    id,
    user_id,
    email,
    student_phone,
    canonical_phone,
    phone_verified,
    phone_verified_at,
    first_name,
    last_name,
    education_level,
    exam_type,
    stream_id,
    target_score,
    access_status,
    plan,
    trial_started_at,
    trial_expires_at,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(v_phone, v_canonical),
    v_canonical,
    v_phone_verified,
    CASE WHEN v_phone_verified THEN now() ELSE NULL END,
    v_first_name,
    v_last_name,
    'secondary',
    'bac',
    COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'stream_id'), ''), 'sciences_exp'),
    16.00,
    'TRIAL',
    'PILOT_TRIAL',
    COALESCE(NEW.created_at, now()),
    COALESCE(NEW.created_at, now()) + INTERVAL '3 days',
    COALESCE(NEW.created_at, now()),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = COALESCE(public.student_profiles.email, EXCLUDED.email),
    student_phone = COALESCE(public.student_profiles.student_phone, EXCLUDED.student_phone),
    canonical_phone = COALESCE(public.student_profiles.canonical_phone, EXCLUDED.canonical_phone),
    phone_verified = CASE 
      WHEN EXCLUDED.phone_verified IS TRUE THEN TRUE 
      ELSE public.student_profiles.phone_verified 
    END,
    phone_verified_at = CASE 
      WHEN EXCLUDED.phone_verified IS TRUE AND public.student_profiles.phone_verified_at IS NULL THEN now()
      ELSE public.student_profiles.phone_verified_at 
    END,
    first_name = CASE 
      WHEN public.student_profiles.first_name IS NULL OR public.student_profiles.first_name = '' 
      THEN EXCLUDED.first_name 
      ELSE public.student_profiles.first_name 
    END,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;
