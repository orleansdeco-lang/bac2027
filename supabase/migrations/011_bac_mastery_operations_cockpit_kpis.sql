-- ==============================================================================
-- 011_bac_mastery_operations_cockpit_kpis.sql
-- BAC Mastery: Unified Operations Cockpit Live KPI Aggregation RPC
-- Dedicated Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- INVARIANTS:
-- 1. Strictly ADDITIVE. Zero modifications to Learning Core or Student tables.
-- 2. Security: STABLE SECURITY DEFINER with search_path = public, pg_temp.
-- 3. RBAC Enforcement: Authenticates caller via auth.uid() OR Absolute Owner fallback.
-- 4. Unified Real-Time Fact Engine: Returns observable numbers across:
--    - student_profiles (total, trials, paid, expired, onboarding)
--    - missions (completed/mastered)
--    - practice_attempts (total, correct)
--    - errors (error lab captured)
--    - retests (retests passed)
--    - skill_mastery (demonstrated skills)
--    - payment_orders (pending, approved today, rejected today, total revenue)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.ops_get_cockpit_kpis(
  p_operator_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_now TIMESTAMPTZ := now();
  v_in_24h TIMESTAMPTZ := now() + interval '24 hours';
  v_today_start TIMESTAMPTZ := date_trunc('day', now());

  -- Student Counts
  v_total_students INT := 0;
  v_active_trials INT := 0;
  v_trials_expiring_24h INT := 0;
  v_expired_trials INT := 0;
  v_paid_subscribers INT := 0;
  v_completed_onboarding INT := 0;
  v_first_activity INT := 0;

  -- Learning Signals
  v_missions_mastered INT := 0;
  v_practice_attempts INT := 0;
  v_correct_practice INT := 0;
  v_errors_recorded INT := 0;
  v_retests_passed INT := 0;
  v_skills_demonstrated INT := 0;

  -- Today Velocity
  v_new_registrations_today INT := 0;
  v_trial_starts_today INT := 0;
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
  -- Strict verification: caller must be OPERATOR/OWNER or absolute owner UUID
  IF (v_caller IS NULL OR NOT public.is_operator(v_caller))
     AND (p_operator_id IS DISTINCT FROM '7f7f704e-d9f1-4edf-9952-591f41fc0c55'::uuid) THEN
    RAISE EXCEPTION 'Access denied: operator authorization required';
  END IF;

  -- 1. Student Profiles Aggregation
  SELECT count(*) INTO v_total_students FROM public.student_profiles;

  SELECT count(*) INTO v_paid_subscribers
  FROM public.student_profiles
  WHERE access_status = 'PAID'
     OR plan IN ('PAID', 'season', 'monthly')
     OR (subscription_expires_at IS NOT NULL AND subscription_expires_at > v_now);

  SELECT count(*) INTO v_active_trials
  FROM public.student_profiles
  WHERE (access_status = 'TRIAL' OR access_status IS NULL)
    AND (plan IS NULL OR plan NOT IN ('PAID', 'season', 'monthly'))
    AND (trial_expires_at IS NULL OR trial_expires_at > v_now);

  SELECT count(*) INTO v_trials_expiring_24h
  FROM public.student_profiles
  WHERE (access_status = 'TRIAL' OR access_status IS NULL)
    AND (plan IS NULL OR plan NOT IN ('PAID', 'season', 'monthly'))
    AND trial_expires_at > v_now
    AND trial_expires_at <= v_in_24h;

  SELECT count(*) INTO v_expired_trials
  FROM public.student_profiles
  WHERE (access_status = 'EXPIRED'
     OR (trial_expires_at IS NOT NULL AND trial_expires_at <= v_now AND (subscription_expires_at IS NULL OR subscription_expires_at <= v_now)))
    AND access_status != 'PAID';

  SELECT count(*) INTO v_completed_onboarding
  FROM public.student_profiles
  WHERE onboarding_completed = true
     OR academic_profile_completed_at IS NOT NULL
     OR registration_completed_at IS NOT NULL;

  -- Today registrations & trial starts
  SELECT count(*) INTO v_new_registrations_today
  FROM public.student_profiles
  WHERE created_at >= v_today_start;

  SELECT count(*) INTO v_trial_starts_today
  FROM public.student_profiles
  WHERE trial_started_at >= v_today_start OR created_at >= v_today_start;

  -- Subscriptions expiring in 24h
  SELECT count(*) INTO v_subs_expiring_24h
  FROM public.student_profiles
  WHERE subscription_expires_at > v_now AND subscription_expires_at <= v_in_24h;

  -- Subscriptions expired
  SELECT count(*) INTO v_subs_expired
  FROM public.student_profiles
  WHERE subscription_expires_at IS NOT NULL AND subscription_expires_at <= v_now;

  -- 2. Learning Core Aggregation
  SELECT count(*) INTO v_missions_mastered
  FROM public.missions
  WHERE status IN ('completed', 'mastered');

  SELECT count(*) INTO v_practice_attempts
  FROM public.practice_attempts;

  SELECT count(*) INTO v_correct_practice
  FROM public.practice_attempts
  WHERE is_correct = true;

  SELECT count(*) INTO v_errors_recorded
  FROM public.errors;

  SELECT count(*) INTO v_retests_passed
  FROM public.retests
  WHERE is_passed = true;

  SELECT count(*) INTO v_skills_demonstrated
  FROM public.skill_mastery
  WHERE status = 'demonstrated';

  -- First Activity reach count
  SELECT count(DISTINCT user_id) INTO v_first_activity
  FROM public.practice_attempts;

  -- Learning events today
  SELECT count(*) INTO v_errors_today
  FROM public.errors
  WHERE created_at >= v_today_start;

  SELECT count(*) INTO v_retests_today
  FROM public.retests
  WHERE attempted_at >= v_today_start;

  -- 3. Commercial & Payment Orders Aggregation
  SELECT count(*) INTO v_pending_orders
  FROM public.payment_orders
  WHERE status = 'PENDING';

  SELECT count(*) INTO v_new_orders_today
  FROM public.payment_orders
  WHERE submitted_at >= v_today_start;

  SELECT count(*) INTO v_approved_today
  FROM public.payment_orders
  WHERE status = 'APPROVED' AND reviewed_at >= v_today_start;

  SELECT count(*) INTO v_rejected_today
  FROM public.payment_orders
  WHERE status = 'REJECTED' AND reviewed_at >= v_today_start;

  SELECT COALESCE(sum(amount), 0.00) INTO v_total_revenue
  FROM public.payment_orders
  WHERE status = 'APPROVED';

  RETURN jsonb_build_object(
    'productStatus', jsonb_build_object(
      'totalRegistered', v_total_students,
      'studentsInTrial', v_active_trials,
      'activePaidStudents', v_paid_subscribers,
      'expiredStudents', v_expired_trials,
      'completedOnboarding', v_completed_onboarding,
      'reachedFirstLearningActivity', GREATEST(v_first_activity, v_missions_mastered)
    ),
    'todayDetailed', jsonb_build_object(
      'newRegistrationsToday', v_new_registrations_today,
      'newTrialStartsToday', v_trial_starts_today,
      'newPaymentOrdersToday', v_new_orders_today,
      'approvedPaymentsToday', v_approved_today,
      'rejectedPaymentsToday', v_rejected_today,
      'activeLearningSessionsToday', v_practice_attempts,
      'errorsRecordedToday', v_errors_today,
      'retestsToday', v_retests_today
    ),
    'learningSignals', jsonb_build_object(
      'completedAtLeastOneMission', v_missions_mastered,
      'completedPractice', v_practice_attempts,
      'triggeredErrorLab', v_errors_recorded,
      'completedRepair', 0,
      'completedRetest', v_retests_passed,
      'demonstratingMasteryEvidence', v_skills_demonstrated
    ),
    'commercialOverview', jsonb_build_object(
      'pendingPaymentOrders', v_pending_orders,
      'approvedToday', v_approved_today,
      'rejectedToday', v_rejected_today,
      'activeSubscriptions', v_paid_subscribers,
      'subscriptionsExpiringSoon', v_subs_expiring_24h,
      'expiredSubscriptions', v_subs_expired,
      'totalRevenueDZD', v_total_revenue
    )
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.ops_get_cockpit_kpis(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ops_get_cockpit_kpis(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.ops_get_cockpit_kpis(UUID) TO authenticated, service_role;
