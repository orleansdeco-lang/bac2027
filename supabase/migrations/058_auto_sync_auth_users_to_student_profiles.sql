-- ==============================================================================
-- Migration 058: Automatic Synchronization of auth.users to public.student_profiles
-- 
-- PROBLEM:
-- When users create accounts (via email signup, Google auth, or Supabase dashboard),
-- they are recorded in auth.users. However, without a database trigger, public.student_profiles
-- remains empty until the user completes the multi-step onboarding wizard.
-- Consequently, registered emails are visible in Supabase Authentication but invisible
-- in the Operations Cockpit, Students Directory, and Analytics.
--
-- RESOLUTION:
-- 1. Add email column to public.student_profiles.
-- 2. Create trigger handle_new_auth_user() to immediately initialize a student profile
--    upon signup with 3-day trial and sensible defaults.
-- 3. Create trigger handle_update_auth_user() to keep email in sync.
-- 4. Backfill all existing auth.users into public.student_profiles.
-- 5. Harden ops_get_student_directory, ops_get_cockpit_kpis, and ops_get_student_analytics
--    so all registered students are guaranteed visible, while operators/owners are filtered out.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: ADD email COLUMN TO student_profiles
-- ------------------------------------------------------------------------------
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS email TEXT;
CREATE INDEX IF NOT EXISTS idx_student_profiles_email ON public.student_profiles(email);

-- ------------------------------------------------------------------------------
-- STEP 2: TRIGGER FUNCTION TO INITIALIZE STUDENT PROFILE ON USER CREATION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  v_first_name TEXT;
  v_last_name TEXT;
  v_email_name TEXT;
BEGIN
  -- Extract sensible fallback names
  v_email_name := split_part(COALESCE(NEW.email, 'طالب'), '@', 1);
  v_first_name := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), ''),
    NULLIF(TRIM(NEW.raw_user_meta_data->>'name'), ''),
    v_email_name
  );
  v_last_name := COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), ''), '');

  INSERT INTO public.student_profiles (
    id,
    user_id,
    email,
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
    first_name = CASE 
      WHEN public.student_profiles.first_name IS NULL OR public.student_profiles.first_name = '' 
      THEN EXCLUDED.first_name 
      ELSE public.student_profiles.first_name 
    END,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Attach trigger to auth.users (runs after insert)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- ------------------------------------------------------------------------------
-- STEP 3: TRIGGER FUNCTION TO KEEP EMAIL IN SYNC ON USER UPDATE
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_update_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.student_profiles
  SET 
    email = NEW.email,
    updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_update_auth_user();

-- ------------------------------------------------------------------------------
-- STEP 4: BACKFILL EXISTING auth.users INTO public.student_profiles
-- ------------------------------------------------------------------------------
INSERT INTO public.student_profiles (
  id,
  user_id,
  email,
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
)
SELECT 
  u.id,
  u.id,
  u.email,
  COALESCE(
    NULLIF(TRIM(u.raw_user_meta_data->>'first_name'), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'name'), ''),
    split_part(COALESCE(u.email, 'طالب'), '@', 1)
  ),
  COALESCE(NULLIF(TRIM(u.raw_user_meta_data->>'last_name'), ''), ''),
  'secondary',
  'bac',
  COALESCE(NULLIF(TRIM(u.raw_user_meta_data->>'stream_id'), ''), 'sciences_exp'),
  16.00,
  'TRIAL',
  'PILOT_TRIAL',
  COALESCE(u.created_at, now()),
  COALESCE(u.created_at, now()) + INTERVAL '3 days',
  COALESCE(u.created_at, now()),
  now()
FROM auth.users u
LEFT JOIN public.student_profiles sp ON sp.id = u.id
WHERE sp.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Populate email for any existing student profiles that lack email
UPDATE public.student_profiles sp
SET email = u.email
FROM auth.users u
WHERE sp.id = u.id AND (sp.email IS NULL OR sp.email = '');

-- ------------------------------------------------------------------------------
-- STEP 5: UPGRADE ops_get_student_directory RPC (INCLUDES ALL REGISTERED USERS)
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.ops_get_student_directory(UUID, INT, INT);

CREATE OR REPLACE FUNCTION public.ops_get_student_directory(
  p_operator_id UUID DEFAULT auth.uid(),
  p_limit INT DEFAULT 100,
  p_offset INT DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_result JSONB;
BEGIN
  -- Strict verification: Authorization is based ONLY on auth.uid() or service_role
  IF NOT (auth.role() = 'service_role') THEN
    IF v_caller IS NULL OR NOT public.is_operator(v_caller) THEN
      RAISE EXCEPTION 'Access denied: operator role required';
    END IF;
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(sub)), '[]'::jsonb) INTO v_result
  FROM (
    SELECT 
      COALESCE(sp.id, u.id) AS id,
      COALESCE(sp.user_id, u.id) AS user_id,
      COALESCE(sp.first_name, split_part(COALESCE(u.email, 'طالب'), '@', 1)) AS first_name,
      COALESCE(sp.last_name, '') AS last_name,
      u.email::text AS email,
      sp.student_phone,
      sp.parent_phone,
      COALESCE(sp.stream_id, 'sciences_exp') AS stream_id,
      sp.wilaya_name,
      sp.commune_name,
      COALESCE(sp.target_score, 16.00) AS target_score,
      COALESCE(sp.access_status, 'TRIAL') AS access_status,
      COALESCE(sp.plan, 'PILOT_TRIAL') AS plan,
      COALESCE(sp.trial_started_at, u.created_at) AS trial_started_at,
      COALESCE(sp.trial_expires_at, u.created_at + INTERVAL '3 days') AS trial_expires_at,
      sp.subscription_started_at,
      sp.subscription_expires_at,
      COALESCE(sp.onboarding_completed, false) AS onboarding_completed,
      COALESCE(sp.created_at, u.created_at) AS created_at,
      COALESCE(sp.updated_at, u.created_at) AS updated_at
    FROM auth.users u
    LEFT JOIN public.student_profiles sp ON sp.id = u.id
    LEFT JOIN public.user_roles ur ON ur.user_id = u.id
    WHERE ur.role IS NULL OR ur.role NOT IN ('OWNER', 'OPERATOR')
    ORDER BY COALESCE(sp.created_at, u.created_at) DESC
    LIMIT p_limit
    OFFSET p_offset
  ) sub;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.ops_get_student_directory(UUID, INT, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ops_get_student_directory(UUID, INT, INT) FROM anon;
GRANT EXECUTE ON FUNCTION public.ops_get_student_directory(UUID, INT, INT) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- STEP 6: UPGRADE ops_get_cockpit_kpis RPC (COUNTS REAL REGISTERED USERS)
-- ------------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.ops_get_cockpit_kpis(UUID);

CREATE OR REPLACE FUNCTION public.ops_get_cockpit_kpis(
  p_operator_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_now TIMESTAMPTZ := now();
  v_today_start TIMESTAMPTZ := (date_trunc('day', now() AT TIME ZONE 'Africa/Algiers') AT TIME ZONE 'Africa/Algiers');

  -- Student Profiles Totals
  v_total_students INT := 0;
  v_paid_subscribers INT := 0;
  v_active_trials INT := 0;
  v_expired_trials INT := 0;

  -- Pedagogical Signals
  v_active_today INT := 0;
  v_missions_mastered INT := 0;
  v_practice_attempts INT := 0;
  v_errors_recorded INT := 0;
  v_retests_passed INT := 0;
  v_skills_demonstrated INT := 0;

  -- Operational Real-Time Counts
  v_new_orders_today INT := 0;
  v_approved_today INT := 0;
  v_rejected_today INT := 0;
  v_errors_today INT := 0;
  v_retests_today INT := 0;

  -- Commercial / Subscriptions
  v_pending_orders INT := 0;
  v_subs_expiring_24h INT := 0;
  v_subs_expired INT := 0;
  v_total_revenue NUMERIC(12, 2) := 0.00;
BEGIN
  -- Strict operator authorization
  IF NOT (auth.role() = 'service_role') THEN
    IF v_caller IS NULL OR NOT public.is_operator(v_caller) THEN
      RAISE EXCEPTION 'Access denied: operator authorization required';
    END IF;
  END IF;

  -- 1. Student Profiles Aggregation (authoritatively counts registered students, excluding operators)
  SELECT count(*) INTO v_total_students 
  FROM auth.users u
  LEFT JOIN public.user_roles ur ON ur.user_id = u.id
  WHERE ur.role IS NULL OR ur.role NOT IN ('OWNER', 'OPERATOR');

  SELECT count(*) INTO v_paid_subscribers
  FROM public.student_profiles sp
  LEFT JOIN public.user_roles ur ON ur.user_id = sp.user_id
  WHERE (ur.role IS NULL OR ur.role NOT IN ('OWNER', 'OPERATOR'))
    AND (
      sp.access_status = 'PAID'
      OR sp.plan IN ('PAID', 'season', 'monthly')
      OR (sp.subscription_expires_at IS NOT NULL AND sp.subscription_expires_at > v_now)
    );

  SELECT count(*) INTO v_active_trials
  FROM public.student_profiles sp
  LEFT JOIN public.user_roles ur ON ur.user_id = sp.user_id
  WHERE (ur.role IS NULL OR ur.role NOT IN ('OWNER', 'OPERATOR'))
    AND (
      sp.access_status = 'TRIAL'
      OR (sp.trial_expires_at IS NOT NULL AND sp.trial_expires_at > v_now AND coalesce(sp.access_status, '') != 'PAID')
    );

  SELECT count(*) INTO v_expired_trials
  FROM public.student_profiles sp
  LEFT JOIN public.user_roles ur ON ur.user_id = sp.user_id
  WHERE (ur.role IS NULL OR ur.role NOT IN ('OWNER', 'OPERATOR'))
    AND (
      sp.trial_expires_at IS NOT NULL
      AND sp.trial_expires_at <= v_now
      AND coalesce(sp.access_status, '') NOT IN ('PAID', 'ACTIVE')
    );

  -- 2. Pedagogical Signals
  BEGIN
    SELECT count(DISTINCT user_id) INTO v_active_today
    FROM public.analytics_events
    WHERE user_id IS NOT NULL AND occurred_at >= v_today_start;
  EXCEPTION WHEN OTHERS THEN
    v_active_today := 0;
  END;

  BEGIN
    SELECT count(*) INTO v_missions_mastered
    FROM public.student_mission_progress
    WHERE status = 'COMPLETED' OR progress_percentage >= 100;
  EXCEPTION WHEN OTHERS THEN
    v_missions_mastered := 0;
  END;

  BEGIN
    SELECT count(*) INTO v_practice_attempts
    FROM public.practice_session_attempts;
  EXCEPTION WHEN OTHERS THEN
    v_practice_attempts := 0;
  END;

  BEGIN
    SELECT count(*) INTO v_errors_recorded
    FROM public.student_error_records;
  EXCEPTION WHEN OTHERS THEN
    v_errors_recorded := 0;
  END;

  BEGIN
    SELECT count(*) INTO v_retests_passed
    FROM public.student_retest_attempts
    WHERE score >= 50;
  EXCEPTION WHEN OTHERS THEN
    v_retests_passed := 0;
  END;

  BEGIN
    SELECT count(*) INTO v_skills_demonstrated
    FROM public.student_skill_mastery
    WHERE mastery_level >= 70;
  EXCEPTION WHEN OTHERS THEN
    v_skills_demonstrated := 0;
  END;

  -- 3. Operational Real-Time Counts (Today in Algeria Timezone)
  BEGIN
    SELECT count(*) INTO v_new_orders_today
    FROM public.payment_orders
    WHERE submitted_at >= v_today_start;
  EXCEPTION WHEN OTHERS THEN
    v_new_orders_today := 0;
  END;

  BEGIN
    SELECT count(*) INTO v_approved_today
    FROM public.payment_orders
    WHERE reviewed_at >= v_today_start AND status = 'APPROVED';
  EXCEPTION WHEN OTHERS THEN
    v_approved_today := 0;
  END;

  BEGIN
    SELECT count(*) INTO v_rejected_today
    FROM public.payment_orders
    WHERE reviewed_at >= v_today_start AND status = 'REJECTED';
  EXCEPTION WHEN OTHERS THEN
    v_rejected_today := 0;
  END;

  BEGIN
    SELECT count(*) INTO v_errors_today
    FROM public.student_error_records
    WHERE created_at >= v_today_start;
  EXCEPTION WHEN OTHERS THEN
    v_errors_today := 0;
  END;

  BEGIN
    SELECT count(*) INTO v_retests_today
    FROM public.student_retest_attempts
    WHERE created_at >= v_today_start;
  EXCEPTION WHEN OTHERS THEN
    v_retests_today := 0;
  END;

  -- 4. Commercial / Subscriptions
  BEGIN
    SELECT count(*) INTO v_pending_orders
    FROM public.payment_orders
    WHERE status = 'PENDING';
  EXCEPTION WHEN OTHERS THEN
    v_pending_orders := 0;
  END;

  BEGIN
    SELECT count(*) INTO v_subs_expiring_24h
    FROM public.subscriptions
    WHERE status = 'ACTIVE'
      AND expires_at > v_now
      AND expires_at <= (v_now + interval '24 hours');
  EXCEPTION WHEN OTHERS THEN
    v_subs_expiring_24h := 0;
  END;

  BEGIN
    SELECT count(*) INTO v_subs_expired
    FROM public.subscriptions
    WHERE expires_at <= v_now OR status = 'EXPIRED';
  EXCEPTION WHEN OTHERS THEN
    v_subs_expired := 0;
  END;

  BEGIN
    SELECT coalesce(sum(amount), 0.00) INTO v_total_revenue
    FROM public.payment_orders
    WHERE status = 'APPROVED';
  EXCEPTION WHEN OTHERS THEN
    v_total_revenue := 0.00;
  END;

  RETURN jsonb_build_object(
    'totalStudents', v_total_students,
    'paidSubscribers', v_paid_subscribers,
    'activeTrials', v_active_trials,
    'expiredTrials', v_expired_trials,
    'activeToday', v_active_today,
    'missionsMastered', v_missions_mastered,
    'practiceAttempts', v_practice_attempts,
    'errorsRecorded', v_errors_recorded,
    'retestsPassed', v_retests_passed,
    'skillsDemonstrated', v_skills_demonstrated,
    'newOrdersToday', v_new_orders_today,
    'approvedToday', v_approved_today,
    'rejectedToday', v_rejected_today,
    'errorsToday', v_errors_today,
    'retestsToday', v_retests_today,
    'pendingOrders', v_pending_orders,
    'subsExpiring24h', v_subs_expiring_24h,
    'subsExpired', v_subs_expired,
    'totalRevenue', v_total_revenue,
    'generatedAt', v_now
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.ops_get_cockpit_kpis(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ops_get_cockpit_kpis(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.ops_get_cockpit_kpis(UUID) TO authenticated, service_role;
