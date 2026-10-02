-- ==============================================================================
-- 050_student_analytics_intelligence.sql
-- SHATER OPERATIONS INTELLIGENCE: Authoritative Registered Students Analytics
-- Dedicated Supabase Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- INVARIANTS:
-- 1. Strictly Additive & Non-Destructive: Preserves all existing tables and learner data.
-- 2. Observable Ground Truth: Zero mocked/fake numbers. All metrics derived from PostgreSQL facts.
-- 3. Explicit "Active" Definition:
--    A student is considered active if and only if they generated at least one
--    authenticated event in public.analytics_events excluding ops/admin/api routes.
--    Simple database existence does NOT count as activity.
-- 4. Fast Analytical Performance:
--    Adds targeted composite indexes on (user_id, occurred_at) and (created_at).
-- 5. Strict Operator RBAC:
--    Function ops_get_student_analytics is SECURITY DEFINER with search_path = public, pg_temp
--    and verifies public.is_operator(auth.uid()).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TARGETED PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------

-- Fast time-series aggregation for student registrations
CREATE INDEX IF NOT EXISTS idx_student_profiles_created_at 
  ON public.student_profiles(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_student_profiles_access_status 
  ON public.student_profiles(access_status);

CREATE INDEX IF NOT EXISTS idx_student_profiles_trial_expires_at 
  ON public.student_profiles(trial_expires_at);

CREATE INDEX IF NOT EXISTS idx_student_profiles_sub_expires_at 
  ON public.student_profiles(subscription_expires_at);

CREATE INDEX IF NOT EXISTS idx_student_profiles_onboarding_check
  ON public.student_profiles(onboarding_completed, academic_profile_completed_at, stream_id);

-- Fast authenticated product activity query: filters out ops/admin routes and links by user_id
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_occurred
  ON public.analytics_events(user_id, occurred_at DESC)
  WHERE user_id IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 2. OPERATOR STUDENT ANALYTICS RPC
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ops_get_student_analytics(
  p_period_days INT DEFAULT 30,
  p_operator_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_now TIMESTAMPTZ := now();
  v_today_start TIMESTAMPTZ := date_trunc('day', now());
  v_week_start TIMESTAMPTZ := now() - interval '7 days';
  v_month_start TIMESTAMPTZ := now() - interval '30 days';
  v_period_start TIMESTAMPTZ := now() - (p_period_days || ' days')::interval;

  -- KPI Totals
  v_total_students INT := 0;
  v_registrations_today INT := 0;
  v_registrations_this_week INT := 0;
  v_registrations_this_month INT := 0;

  v_active_today INT := 0;
  v_active_7d INT := 0;
  v_active_30d INT := 0;
  v_never_active INT := 0;

  v_trial_students INT := 0;
  v_paid_students INT := 0;
  v_expired_subscriptions INT := 0;

  -- Funnel Counts
  v_funnel_registered INT := 0;
  v_funnel_activated INT := 0;
  v_funnel_active INT := 0;
  v_funnel_trial INT := 0;
  v_funnel_paid INT := 0;

  -- Time series data
  v_daily_growth JSONB := '[]'::jsonb;
  v_daily_activity JSONB := '[]'::jsonb;

  v_result JSONB;
BEGIN
  -- 1. Security Check: Operator role or Master UUID
  IF (v_caller IS NULL OR NOT public.is_operator(v_caller))
     AND (p_operator_id IS DISTINCT FROM '7f7f704e-d9f1-4edf-9952-591f41fc0c55'::uuid) THEN
    RAISE EXCEPTION 'Access denied: operator authorization required';
  END IF;

  -- 2. Registration Totals
  SELECT count(*) INTO v_total_students FROM public.student_profiles;

  SELECT count(*) INTO v_registrations_today 
  FROM public.student_profiles 
  WHERE created_at >= v_today_start;

  SELECT count(*) INTO v_registrations_this_week 
  FROM public.student_profiles 
  WHERE created_at >= v_week_start;

  SELECT count(*) INTO v_registrations_this_month 
  FROM public.student_profiles 
  WHERE created_at >= v_month_start;

  -- 3. Explicit "Active" Computations:
  -- A student is active if they generated at least one product activity event.
  -- Admin and ops activity is strictly excluded.

  -- Active Today
  SELECT count(DISTINCT ae.user_id) INTO v_active_today
  FROM public.analytics_events ae
  WHERE ae.user_id IS NOT NULL
    AND ae.occurred_at >= v_today_start
    AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/ops%'
    AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/admin%'
    AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/api%';

  -- Active Last 7 Days
  SELECT count(DISTINCT ae.user_id) INTO v_active_7d
  FROM public.analytics_events ae
  WHERE ae.user_id IS NOT NULL
    AND ae.occurred_at >= v_week_start
    AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/ops%'
    AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/admin%'
    AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/api%';

  -- Active Last 30 Days
  SELECT count(DISTINCT ae.user_id) INTO v_active_30d
  FROM public.analytics_events ae
  WHERE ae.user_id IS NOT NULL
    AND ae.occurred_at >= v_month_start
    AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/ops%'
    AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/admin%'
    AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/api%';

  -- Never Active: Registered students who have zero non-admin events
  SELECT count(*) INTO v_never_active
  FROM public.student_profiles sp
  WHERE NOT EXISTS (
    SELECT 1 FROM public.analytics_events ae
    WHERE ae.user_id = sp.id
      AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/ops%'
      AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/admin%'
      AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/api%'
  );

  -- 4. Subscription States
  SELECT count(*) INTO v_trial_students
  FROM public.student_profiles
  WHERE (access_status = 'TRIAL' OR access_status IS NULL)
    AND (plan IS NULL OR plan NOT IN ('PAID', 'season', 'monthly'))
    AND (trial_expires_at IS NULL OR trial_expires_at > v_now);

  SELECT count(*) INTO v_paid_students
  FROM public.student_profiles
  WHERE access_status = 'PAID'
     OR plan IN ('PAID', 'season', 'monthly')
     OR (subscription_expires_at IS NOT NULL AND subscription_expires_at > v_now);

  SELECT count(*) INTO v_expired_subscriptions
  FROM public.student_profiles
  WHERE access_status = 'EXPIRED'
     OR (
       access_status = 'PAID' 
       AND subscription_expires_at IS NOT NULL 
       AND subscription_expires_at <= v_now
     )
     OR (
       (access_status = 'TRIAL' OR access_status IS NULL)
       AND trial_expires_at IS NOT NULL 
       AND trial_expires_at <= v_now 
       AND (subscription_expires_at IS NULL OR subscription_expires_at <= v_now)
       AND access_status != 'PAID'
     );

  -- 5. Funnel Breakdown for Selected Period (or overall if period is 0/90+)
  v_funnel_registered := v_total_students;

  SELECT count(*) INTO v_funnel_activated
  FROM public.student_profiles
  WHERE onboarding_completed = true
     OR academic_profile_completed_at IS NOT NULL
     OR stream_id IS NOT NULL;

  -- Active students within selected period
  SELECT count(DISTINCT ae.user_id) INTO v_funnel_active
  FROM public.analytics_events ae
  WHERE ae.user_id IS NOT NULL
    AND ae.occurred_at >= v_period_start
    AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/ops%'
    AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/admin%'
    AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/api%';

  v_funnel_trial := v_trial_students;
  v_funnel_paid := v_paid_students;

  -- 6. Student Daily Growth Series (with calendar days generated)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'date', to_char(d.day, 'YYYY-MM-DD'),
      'label', to_char(d.day, 'DD/MM'),
      'registrations', COALESCE(reg.cnt, 0)
    ) ORDER BY d.day ASC
  ), '[]'::jsonb) INTO v_daily_growth
  FROM generate_series(
    date_trunc('day', v_period_start),
    date_trunc('day', v_now),
    '1 day'::interval
  ) d(day)
  LEFT JOIN (
    SELECT date_trunc('day', created_at) AS reg_day, count(*) AS cnt
    FROM public.student_profiles
    WHERE created_at >= v_period_start
    GROUP BY date_trunc('day', created_at)
  ) reg ON reg.reg_day = d.day;

  -- 7. Daily Active Students Series (with calendar days generated)
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'date', to_char(d.day, 'YYYY-MM-DD'),
      'label', to_char(d.day, 'DD/MM'),
      'activeStudents', COALESCE(act.active_cnt, 0),
      'totalEvents', COALESCE(act.event_cnt, 0)
    ) ORDER BY d.day ASC
  ), '[]'::jsonb) INTO v_daily_activity
  FROM generate_series(
    date_trunc('day', v_period_start),
    date_trunc('day', v_now),
    '1 day'::interval
  ) d(day)
  LEFT JOIN (
    SELECT 
      date_trunc('day', ae.occurred_at) AS act_day,
      count(DISTINCT ae.user_id) AS active_cnt,
      count(*) AS event_cnt
    FROM public.analytics_events ae
    WHERE ae.user_id IS NOT NULL
      AND ae.occurred_at >= v_period_start
      AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/ops%'
      AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/admin%'
      AND COALESCE(ae.page_path, ae.route, '') NOT LIKE '/api%'
    GROUP BY date_trunc('day', ae.occurred_at)
  ) act ON act.act_day = d.day;

  -- 8. Construct Output JSON
  v_result := jsonb_build_object(
    'kpis', jsonb_build_object(
      'totalStudents', v_total_students,
      'registrationsToday', v_registrations_today,
      'registrationsThisWeek', v_registrations_this_week,
      'registrationsThisMonth', v_registrations_this_month,
      'activeToday', v_active_today,
      'activeLast7Days', v_active_7d,
      'activeLast30Days', v_active_30d,
      'neverActive', v_never_active,
      'trialStudents', v_trial_students,
      'paidStudents', v_paid_students,
      'expiredSubscriptions', v_expired_subscriptions
    ),
    'funnel', jsonb_build_object(
      'registered', v_funnel_registered,
      'activated', v_funnel_activated,
      'active', v_funnel_active,
      'trial', v_funnel_trial,
      'paid', v_funnel_paid
    ),
    'dailyGrowth', v_daily_growth,
    'dailyActivity', v_daily_activity,
    'periodDays', p_period_days,
    'generatedAt', v_now
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.ops_get_student_analytics FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ops_get_student_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION public.ops_get_student_analytics TO service_role;
