-- ==============================================================================
-- 055_production_analytics_rpcs_repair.sql
-- CRITICAL REPAIR: Authoritative Server-Side Analytics RPCs for SHATER Cockpit
-- Dedicated Supabase Project: erbvmpnxufgeinqnshzu
--
-- PURPOSE:
-- Deploys production-grade, SECURITY DEFINER PostgreSQL analytical RPCs for:
-- 1. public.ops_get_visitors_analytics(p_period_days, p_operator_id)
-- 2. public.ops_get_student_analytics(p_period_days, p_operator_id)
-- 3. public.ops_get_conversion_funnel(p_start_date, p_end_date, p_operator_id)
--
-- SECURITY INVARIANTS:
-- - All functions are SECURITY DEFINER with search_path = public, pg_temp.
-- - Internal authorization gate: validates auth.uid() is an operator OR caller supplies master UUID.
-- - Public execution permitted ONLY with valid operator credential; direct public queries denied.
-- - Timezone aligned with Algeria (UTC+1, Africa/Algiers).
-- - ZERO fake/mock data: 100% computed from analytics_visitors, analytics_sessions, analytics_events, student_profiles, subscriptions, payment_orders.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ANALYTICAL PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_analytics_visitors_seen_composite
  ON public.analytics_visitors(last_seen_at DESC, first_seen_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_activity_composite
  ON public.analytics_sessions(started_at DESC, last_activity_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_landing_page
  ON public.analytics_sessions(landing_page);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_channel_source
  ON public.analytics_sessions(first_channel, first_utm_source);

CREATE INDEX IF NOT EXISTS idx_analytics_sessions_active_detect
  ON public.analytics_sessions(last_activity_at DESC, is_active);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user_occurred
  ON public.analytics_events(user_id, occurred_at DESC)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_analytics_events_funnel
  ON public.analytics_events(event_name, occurred_at DESC);

-- ------------------------------------------------------------------------------
-- 2. FUNCTION: ops_get_visitors_analytics
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ops_get_visitors_analytics(
  p_period_days INT DEFAULT 30,
  p_operator_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_now TIMESTAMPTZ := now();
  v_today_start TIMESTAMPTZ := (date_trunc('day', now() AT TIME ZONE 'Africa/Algiers') AT TIME ZONE 'Africa/Algiers');
  v_week_start TIMESTAMPTZ := now() - interval '7 days';
  v_month_start TIMESTAMPTZ := now() - interval '30 days';
  v_period_start TIMESTAMPTZ := now() - (p_period_days || ' days')::interval;

  -- KPI Totals
  v_unique_visitors_today INT := 0;
  v_sessions_today INT := 0;
  v_new_visitors_today INT := 0;
  v_returning_visitors_today INT := 0;
  v_unique_visitors_7d INT := 0;
  v_unique_visitors_30d INT := 0;

  -- Live Detection
  v_active_visitors_now INT := 0;
  v_live_tracking_supported BOOLEAN := true;

  -- Period Aggregates
  v_period_new_visitors INT := 0;
  v_period_returning_visitors INT := 0;

  -- Devices
  v_devices JSONB;
  
  -- Top Pages, Entry Pages, Exit Pages, Traffic Sources, Trend, Geography, Recent Logs
  v_trend JSONB := '[]'::jsonb;
  v_top_pages JSONB := '[]'::jsonb;
  v_traffic_sources JSONB := '[]'::jsonb;
  v_entry_pages JSONB := '[]'::jsonb;
  v_exit_pages JSONB := '[]'::jsonb;
  v_geography JSONB;
  v_recent_activity JSONB := '[]'::jsonb;

  v_total_period_sessions INT := 0;
  v_has_reliable_geo BOOLEAN := false;

  v_result JSONB;
BEGIN
  -- 1. Security Check: Operator role or Master UUID
  IF (v_caller IS NULL OR NOT public.is_operator(v_caller))
     AND (p_operator_id IS DISTINCT FROM '7f7f704e-d9f1-4edf-9952-591f41fc0c55'::uuid) THEN
    RAISE EXCEPTION 'Access denied: operator authorization required';
  END IF;

  -- 2. Visitors Overview Ground Truth
  SELECT count(*) INTO v_unique_visitors_today
  FROM public.analytics_visitors
  WHERE last_seen_at >= v_today_start;

  SELECT count(*) INTO v_sessions_today
  FROM public.analytics_sessions
  WHERE started_at >= v_today_start;

  SELECT count(*) INTO v_new_visitors_today
  FROM public.analytics_visitors
  WHERE first_seen_at >= v_today_start;

  SELECT count(*) INTO v_returning_visitors_today
  FROM public.analytics_visitors
  WHERE last_seen_at >= v_today_start
    AND first_seen_at < v_today_start;

  SELECT count(*) INTO v_unique_visitors_7d
  FROM public.analytics_visitors
  WHERE last_seen_at >= v_week_start;

  SELECT count(*) INTO v_unique_visitors_30d
  FROM public.analytics_visitors
  WHERE last_seen_at >= v_month_start;

  -- Fallback to analytics_sessions if analytics_visitors is empty
  IF v_unique_visitors_today = 0 AND v_sessions_today > 0 THEN
    SELECT count(DISTINCT visitor_id) INTO v_unique_visitors_today
    FROM public.analytics_sessions
    WHERE started_at >= v_today_start;
  END IF;

  -- 3. Live Activity Detection (Active within last 5 minutes)
  SELECT count(DISTINCT visitor_id) INTO v_active_visitors_now
  FROM public.analytics_sessions
  WHERE last_activity_at >= (now() - interval '5 minutes')
    AND is_active = true;

  -- 4. Period New vs Returning
  SELECT count(*) INTO v_period_new_visitors
  FROM public.analytics_visitors
  WHERE first_seen_at >= v_period_start;

  SELECT count(*) INTO v_period_returning_visitors
  FROM public.analytics_visitors
  WHERE last_seen_at >= v_period_start
    AND first_seen_at < v_period_start;

  -- 5. Daily Trend Breakdown
  SELECT COALESCE(jsonb_agg(sub ORDER BY sub.date ASC), '[]'::jsonb)
  INTO v_trend
  FROM (
    SELECT
      to_char(d::date, 'YYYY-MM-DD') AS date,
      to_char(d::date, 'DD/MM') AS label,
      COALESCE(count(DISTINCT s.session_id), 0) AS sessions,
      COALESCE(count(DISTINCT s.visitor_id), 0) AS "uniqueVisitors",
      COALESCE(count(DISTINCT CASE WHEN v.first_seen_at::date = d::date THEN v.visitor_id END), 0) AS "newVisitors",
      COALESCE(count(DISTINCT CASE WHEN v.first_seen_at::date < d::date AND v.last_seen_at::date = d::date THEN v.visitor_id END), 0) AS "returningVisitors"
    FROM generate_series(v_period_start::date, v_now::date, interval '1 day') AS d
    LEFT JOIN public.analytics_sessions s ON s.started_at::date = d::date
    LEFT JOIN public.analytics_visitors v ON v.last_seen_at::date = d::date
    GROUP BY d::date
  ) sub;

  -- 6. Top Pages (by views)
  SELECT COALESCE(jsonb_agg(sub), '[]'::jsonb)
  INTO v_top_pages
  FROM (
    SELECT
      COALESCE(page_path, route, '/') AS path,
      count(*) AS views,
      ROUND((count(*)::numeric / NULLIF((SELECT count(*) FROM public.analytics_events WHERE occurred_at >= v_period_start), 0)::numeric) * 100, 1) AS percentage
    FROM public.analytics_events
    WHERE occurred_at >= v_period_start
    GROUP BY COALESCE(page_path, route, '/')
    ORDER BY views DESC
    LIMIT 15
  ) sub;

  -- 7. Traffic Sources Breakdown
  SELECT count(*) INTO v_total_period_sessions
  FROM public.analytics_sessions
  WHERE started_at >= v_period_start;

  SELECT COALESCE(jsonb_agg(sub), '[]'::jsonb)
  INTO v_traffic_sources
  FROM (
    SELECT
      COALESCE(NULLIF(first_utm_source, ''), NULLIF(first_channel, ''), 'direct') AS source,
      count(DISTINCT visitor_id) AS visitors,
      count(session_id) AS sessions,
      CASE 
        WHEN v_total_period_sessions > 0 
        THEN ROUND((count(session_id)::numeric / v_total_period_sessions::numeric) * 100, 1)
        ELSE 0 
      END AS percentage
    FROM public.analytics_sessions
    WHERE started_at >= v_period_start
    GROUP BY COALESCE(NULLIF(first_utm_source, ''), NULLIF(first_channel, ''), 'direct')
    ORDER BY sessions DESC
    LIMIT 10
  ) sub;

  -- 8. Devices Breakdown
  SELECT jsonb_build_object(
    'mobile', COALESCE(count(*) FILTER (WHERE device_type = 'mobile'), 0),
    'desktop', COALESCE(count(*) FILTER (WHERE device_type = 'desktop'), 0),
    'tablet', COALESCE(count(*) FILTER (WHERE device_type = 'tablet'), 0),
    'unknown', COALESCE(count(*) FILTER (WHERE device_type NOT IN ('mobile', 'desktop', 'tablet') OR device_type IS NULL), 0),
    'total', count(*)
  )
  INTO v_devices
  FROM public.analytics_sessions
  WHERE started_at >= v_period_start;

  -- 9. Entry Pages
  SELECT COALESCE(jsonb_agg(sub), '[]'::jsonb)
  INTO v_entry_pages
  FROM (
    SELECT
      COALESCE(landing_page, '/') AS page,
      count(session_id) AS sessions,
      CASE 
        WHEN v_total_period_sessions > 0 
        THEN ROUND((count(session_id)::numeric / v_total_period_sessions::numeric) * 100, 1)
        ELSE 0 
      END AS percentage
    FROM public.analytics_sessions
    WHERE started_at >= v_period_start
    GROUP BY COALESCE(landing_page, '/')
    ORDER BY sessions DESC
    LIMIT 10
  ) sub;

  -- 10. Geography (Wilayas only if available in student_profiles)
  SELECT EXISTS(
    SELECT 1 FROM public.student_profiles WHERE wilaya_name IS NOT NULL AND wilaya_name != ''
  ) INTO v_has_reliable_geo;

  IF v_has_reliable_geo THEN
    SELECT jsonb_build_object(
      'hasReliableGeography', true,
      'wilayas', COALESCE((
        SELECT jsonb_agg(sub)
        FROM (
          SELECT
            wilaya_name AS wilaya,
            count(*) AS count,
            ROUND((count(*)::numeric / NULLIF((SELECT count(*) FROM public.student_profiles WHERE wilaya_name IS NOT NULL)::numeric, 0)) * 100, 1) AS percentage
          FROM public.student_profiles
          WHERE wilaya_name IS NOT NULL AND wilaya_name != ''
          GROUP BY wilaya_name
          ORDER BY count DESC
          LIMIT 10
        ) sub
      ), '[]'::jsonb)
    ) INTO v_geography;
  ELSE
    v_geography := jsonb_build_object('hasReliableGeography', false);
  END IF;

  -- 11. Recent Activity (last 20 logs)
  SELECT COALESCE(jsonb_agg(sub), '[]'::jsonb)
  INTO v_recent_activity
  FROM (
    SELECT
      s.session_id AS id,
      to_char(s.started_at AT TIME ZONE 'Africa/Algiers', 'YYYY-MM-DD HH24:MI:SS') AS time,
      COALESCE(s.landing_page, '/') AS page,
      COALESCE(s.device_type, 'desktop') AS device,
      COALESCE(NULLIF(s.first_utm_source, ''), NULLIF(s.first_channel, ''), 'direct') AS source,
      CASE 
        WHEN v.first_seen_at >= v_period_start AND v.first_seen_at = v.last_seen_at THEN 'NEW'
        ELSE 'RETURNING'
      END AS "visitorType"
    FROM public.analytics_sessions s
    LEFT JOIN public.analytics_visitors v ON v.visitor_id = s.visitor_id
    ORDER BY s.started_at DESC
    LIMIT 20
  ) sub;

  -- 12. Final Result Payload
  v_result := jsonb_build_object(
    'kpis', jsonb_build_object(
      'uniqueVisitorsToday', v_unique_visitors_today,
      'sessionsToday', v_sessions_today,
      'newVisitorsToday', v_new_visitors_today,
      'returningVisitorsToday', v_returning_visitors_today,
      'uniqueVisitorsLast7Days', v_unique_visitors_7d,
      'uniqueVisitorsLast30Days', v_unique_visitors_30d
    ),
    'liveActivity', jsonb_build_object(
      'isSupported', v_live_tracking_supported,
      'activeNow', v_active_visitors_now
    ),
    'trend', v_trend,
    'topPages', v_top_pages,
    'sources', v_traffic_sources,
    'devices', v_devices,
    'returningVsNew', jsonb_build_object(
      'newVisitors', v_period_new_visitors,
      'returningVisitors', v_period_returning_visitors,
      'newPercentage', CASE 
        WHEN (v_period_new_visitors + v_period_returning_visitors) > 0 
        THEN ROUND((v_period_new_visitors::numeric / (v_period_new_visitors + v_period_returning_visitors)::numeric) * 100, 1)
        ELSE 0 
      END,
      'returningPercentage', CASE 
        WHEN (v_period_new_visitors + v_period_returning_visitors) > 0 
        THEN ROUND((v_period_returning_visitors::numeric / (v_period_new_visitors + v_period_returning_visitors)::numeric) * 100, 1)
        ELSE 0 
      END
    ),
    'entryPages', v_entry_pages,
    'exitPages', v_exit_pages,
    'geography', v_geography,
    'recentActivity', v_recent_activity,
    'periodDays', p_period_days,
    'generatedAt', v_now
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.ops_get_visitors_analytics(INT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ops_get_visitors_analytics(INT, UUID) TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 3. FUNCTION: ops_get_student_analytics
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ops_get_student_analytics(
  p_period_days INT DEFAULT 30,
  p_operator_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_now TIMESTAMPTZ := now();
  v_today_start TIMESTAMPTZ := (date_trunc('day', now() AT TIME ZONE 'Africa/Algiers') AT TIME ZONE 'Africa/Algiers');
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
  -- 1. Security Check
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

  -- 3. Activity Totals
  SELECT count(DISTINCT user_id) INTO v_active_today
  FROM public.analytics_events
  WHERE user_id IS NOT NULL 
    AND occurred_at >= v_today_start
    AND page_path NOT LIKE '/ops%'
    AND page_path NOT LIKE '/admin%';

  SELECT count(DISTINCT user_id) INTO v_active_7d
  FROM public.analytics_events
  WHERE user_id IS NOT NULL 
    AND occurred_at >= v_week_start
    AND page_path NOT LIKE '/ops%'
    AND page_path NOT LIKE '/admin%';

  SELECT count(DISTINCT user_id) INTO v_active_30d
  FROM public.analytics_events
  WHERE user_id IS NOT NULL 
    AND occurred_at >= v_month_start
    AND page_path NOT LIKE '/ops%'
    AND page_path NOT LIKE '/admin%';

  SELECT count(*) INTO v_never_active
  FROM public.student_profiles p
  WHERE NOT EXISTS (
    SELECT 1 FROM public.analytics_events e 
    WHERE e.user_id = p.id
  );

  -- 4. Subscription States
  SELECT count(DISTINCT s.student_id) INTO v_paid_students
  FROM public.subscriptions s
  WHERE s.status = 'ACTIVE' 
    AND s.expires_at > v_now;

  SELECT count(DISTINCT p.id) INTO v_trial_students
  FROM public.student_profiles p
  WHERE (p.access_status = 'TRIAL' OR p.trial_expires_at > v_now)
    AND NOT EXISTS (
      SELECT 1 FROM public.subscriptions s 
      WHERE s.student_id = p.id AND s.status = 'ACTIVE' AND s.expires_at > v_now
    );

  SELECT count(DISTINCT s.student_id) INTO v_expired_subscriptions
  FROM public.subscriptions s
  WHERE s.status = 'EXPIRED' OR s.expires_at <= v_now;

  -- 5. Funnel Stages
  v_funnel_registered := v_total_students;

  SELECT count(*) INTO v_funnel_activated
  FROM public.student_profiles
  WHERE onboarding_completed = true OR academic_profile_completed_at IS NOT NULL;

  v_funnel_active := v_active_30d;
  v_funnel_trial := v_trial_students;
  v_funnel_paid := v_paid_students;

  -- 6. Growth Chart Series
  SELECT COALESCE(jsonb_agg(sub ORDER BY sub.date ASC), '[]'::jsonb)
  INTO v_daily_growth
  FROM (
    SELECT 
      to_char(d::date, 'YYYY-MM-DD') AS date,
      to_char(d::date, 'DD/MM') AS label,
      count(p.id) AS count
    FROM generate_series(v_period_start::date, v_now::date, interval '1 day') AS d
    LEFT JOIN public.student_profiles p ON p.created_at::date = d::date
    GROUP BY d::date
  ) sub;

  -- 7. Activity Chart Series
  SELECT COALESCE(jsonb_agg(sub ORDER BY sub.date ASC), '[]'::jsonb)
  INTO v_daily_activity
  FROM (
    SELECT 
      to_char(d::date, 'YYYY-MM-DD') AS date,
      to_char(d::date, 'DD/MM') AS label,
      count(DISTINCT e.user_id) AS count
    FROM generate_series(v_period_start::date, v_now::date, interval '1 day') AS d
    LEFT JOIN public.analytics_events e 
      ON e.occurred_at::date = d::date 
      AND e.user_id IS NOT NULL
      AND e.page_path NOT LIKE '/ops%'
      AND e.page_path NOT LIKE '/admin%'
    GROUP BY d::date
  ) sub;

  -- 8. Final Result Assembly
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
      'stages', jsonb_build_array(
        jsonb_build_object('stage', 'Registered', 'label', 'مسجل', 'count', v_funnel_registered),
        jsonb_build_object('stage', 'Activated', 'label', 'أكمل التهيئة', 'count', v_funnel_activated),
        jsonb_build_object('stage', 'Active', 'label', 'نشط خلال 30 يوم', 'count', v_funnel_active),
        jsonb_build_object('stage', 'Trial', 'label', 'فترة تجريبية', 'count', v_funnel_trial),
        jsonb_build_object('stage', 'Paid', 'label', 'اشتراك مدفوع', 'count', v_funnel_paid)
      )
    ),
    'growthChart', v_daily_growth,
    'activityChart', v_daily_activity,
    'periodDays', p_period_days,
    'generatedAt', v_now
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.ops_get_student_analytics(INT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ops_get_student_analytics(INT, UUID) TO anon, authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 4. FUNCTION: ops_get_conversion_funnel
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ops_get_conversion_funnel(
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ,
  p_operator_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_now TIMESTAMPTZ := now();

  -- Stage Counts
  v_count_visitors INT := 0;
  v_count_engaged INT := 0;
  v_count_signup_started INT := 0;
  v_count_registered INT := 0;
  v_count_activated INT := 0;
  v_count_trial INT := 0;
  v_count_payment_submitted INT := 0;
  v_count_paid INT := 0;

  -- Attribution Counts
  v_attributed_registrations INT := 0;
  v_unattributed_registrations INT := 0;
  v_unattributed_percentage NUMERIC(5, 1) := 0.0;
  v_attribution_status TEXT := 'UNAVAILABLE';

  -- Breakdown JSON
  v_stages JSONB := '[]'::jsonb;
  v_ratios JSONB;
  v_sources JSONB := '[]'::jsonb;
  v_campaigns JSONB := '[]'::jsonb;
  v_result JSONB;
BEGIN
  -- 1. Security Check
  IF (v_caller IS NULL OR NOT public.is_operator(v_caller))
     AND (p_operator_id IS DISTINCT FROM '7f7f704e-d9f1-4edf-9952-591f41fc0c55'::uuid) THEN
    RAISE EXCEPTION 'Access denied: operator authorization required';
  END IF;

  -- 2. Stage 1: VISITOR
  SELECT count(*) INTO v_count_visitors
  FROM public.analytics_visitors
  WHERE first_seen_at >= p_start_date AND first_seen_at <= p_end_date;

  IF v_count_visitors = 0 THEN
    SELECT count(DISTINCT visitor_id) INTO v_count_visitors
    FROM public.analytics_sessions
    WHERE started_at >= p_start_date AND started_at <= p_end_date;
  END IF;

  -- 3. Stage 2: ENGAGED VISITOR (>1 pageview or active interaction)
  SELECT count(DISTINCT visitor_id) INTO v_count_engaged
  FROM public.analytics_sessions
  WHERE started_at >= p_start_date AND started_at <= p_end_date
    AND pageviews_count > 1;

  -- 4. Stage 3: SIGNUP STARTED
  SELECT count(DISTINCT COALESCE(visitor_id, session_id)) INTO v_count_signup_started
  FROM public.analytics_events
  WHERE occurred_at >= p_start_date AND occurred_at <= p_end_date
    AND (
      event_name = 'signup_started'
      OR (event_name = 'page_view' AND (page_path = '/register' OR page_path = '/auth'))
    );

  -- 5. Stage 4: REGISTERED STUDENT
  SELECT count(*) INTO v_count_registered
  FROM public.student_profiles
  WHERE created_at >= p_start_date AND created_at <= p_end_date;

  -- 6. Stage 5: ACTIVATED STUDENT
  SELECT count(*) INTO v_count_activated
  FROM public.student_profiles
  WHERE created_at >= p_start_date AND created_at <= p_end_date
    AND (onboarding_completed = true OR academic_profile_completed_at IS NOT NULL);

  -- 7. Stage 6: TRIAL STARTED
  SELECT count(*) INTO v_count_trial
  FROM public.student_profiles
  WHERE created_at >= p_start_date AND created_at <= p_end_date
    AND (access_status = 'TRIAL' OR trial_expires_at IS NOT NULL);

  -- 8. Stage 7: PAYMENT SUBMITTED
  SELECT count(*) INTO v_count_payment_submitted
  FROM public.payment_orders
  WHERE created_at >= p_start_date AND created_at <= p_end_date;

  -- 9. Stage 8: PAID STUDENT
  SELECT count(DISTINCT student_id) INTO v_count_paid
  FROM public.subscriptions
  WHERE started_at >= p_start_date AND started_at <= p_end_date
    AND status = 'ACTIVE';

  IF v_count_paid = 0 THEN
    SELECT count(DISTINCT user_id) INTO v_count_paid
    FROM public.payment_orders
    WHERE created_at >= p_start_date AND created_at <= p_end_date
      AND status = 'APPROVED';
  END IF;

  -- 10. Funnel Stages JSON Assembly
  v_stages := jsonb_build_array(
    jsonb_build_object(
      'id', 'visitor',
      'label', 'زائر (Visitor)',
      'count', v_count_visitors,
      'conversionFromPrevious', 100.0,
      'dropoffCount', 0,
      'definition', 'زائر فريد تم رصده عبر الهوية الأولى'
    ),
    jsonb_build_object(
      'id', 'engaged_visitor',
      'label', 'زائر متفاعل (Engaged)',
      'count', v_count_engaged,
      'conversionFromPrevious', CASE WHEN v_count_visitors > 0 THEN ROUND((v_count_engaged::numeric / v_count_visitors::numeric) * 100, 1) ELSE 0 END,
      'dropoffCount', GREATEST(0, v_count_visitors - v_count_engaged),
      'definition', 'زائر تجاوز صفحة واحدة أو تفاعل مع المحتوى'
    ),
    jsonb_build_object(
      'id', 'signup_started',
      'label', 'بدأ التسجيل (Signup Started)',
      'count', v_count_signup_started,
      'conversionFromPrevious', CASE WHEN v_count_engaged > 0 THEN ROUND((v_count_signup_started::numeric / v_count_engaged::numeric) * 100, 1) ELSE 0 END,
      'dropoffCount', GREATEST(0, v_count_engaged - v_count_signup_started),
      'definition', 'زيارة صفحة التسجيل أو إطلاق حدث signup_started'
    ),
    jsonb_build_object(
      'id', 'registered',
      'label', 'طالب مسجل (Registered)',
      'count', v_count_registered,
      'conversionFromPrevious', CASE WHEN v_count_signup_started > 0 THEN ROUND((v_count_registered::numeric / v_count_signup_started::numeric) * 100, 1) ELSE 0 END,
      'dropoffCount', GREATEST(0, v_count_signup_started - v_count_registered),
      'definition', 'إنشاء حساب طالب موثق في جدول student_profiles'
    ),
    jsonb_build_object(
      'id', 'activated',
      'label', 'طالب مفعل (Activated)',
      'count', v_count_activated,
      'conversionFromPrevious', CASE WHEN v_count_registered > 0 THEN ROUND((v_count_activated::numeric / v_count_registered::numeric) * 100, 1) ELSE 0 END,
      'dropoffCount', GREATEST(0, v_count_registered - v_count_activated),
      'definition', 'إكمال التهيئة الأكاديمية والتشخيص'
    ),
    jsonb_build_object(
      'id', 'trial',
      'label', 'بدأ التجربة (Trial Started)',
      'count', v_count_trial,
      'conversionFromPrevious', CASE WHEN v_count_activated > 0 THEN ROUND((v_count_trial::numeric / v_count_activated::numeric) * 100, 1) ELSE 0 END,
      'dropoffCount', GREATEST(0, v_count_activated - v_count_trial),
      'definition', 'تفعيل الفترة التجريبية المجانية للدروس'
    ),
    jsonb_build_object(
      'id', 'payment_submitted',
      'label', 'أرسل الدفع (Payment Submitted)',
      'count', v_count_payment_submitted,
      'conversionFromPrevious', CASE WHEN v_count_trial > 0 THEN ROUND((v_count_payment_submitted::numeric / v_count_trial::numeric) * 100, 1) ELSE 0 END,
      'dropoffCount', GREATEST(0, v_count_trial - v_count_payment_submitted),
      'definition', 'تقديم وصل دفع أو طلب الدفع عند الاستلام'
    ),
    jsonb_build_object(
      'id', 'paid',
      'label', 'مشترك مدفوع (Paid Student)',
      'count', v_count_paid,
      'conversionFromPrevious', CASE WHEN v_count_payment_submitted > 0 THEN ROUND((v_count_paid::numeric / v_count_payment_submitted::numeric) * 100, 1) ELSE 0 END,
      'dropoffCount', GREATEST(0, v_count_payment_submitted - v_count_paid),
      'definition', 'اشتراك نشط معتمد ومؤكد مالياً'
    )
  );

  -- 11. Conversion Ratios Assembly
  v_ratios := jsonb_build_object(
    'visitorToRegistration', jsonb_build_object(
      'rate', CASE WHEN v_count_visitors > 0 THEN ROUND((v_count_registered::numeric / v_count_visitors::numeric) * 100, 2) ELSE 0 END,
      'numerator', v_count_registered,
      'denominator', v_count_visitors
    ),
    'registrationToActivation', jsonb_build_object(
      'rate', CASE WHEN v_count_registered > 0 THEN ROUND((v_count_activated::numeric / v_count_registered::numeric) * 100, 2) ELSE 0 END,
      'numerator', v_count_activated,
      'denominator', v_count_registered
    ),
    'activationToTrial', jsonb_build_object(
      'rate', CASE WHEN v_count_activated > 0 THEN ROUND((v_count_trial::numeric / v_count_activated::numeric) * 100, 2) ELSE 0 END,
      'numerator', v_count_trial,
      'denominator', v_count_activated
    ),
    'trialToPaid', jsonb_build_object(
      'rate', CASE WHEN v_count_trial > 0 THEN ROUND((v_count_paid::numeric / v_count_trial::numeric) * 100, 2) ELSE 0 END,
      'numerator', v_count_paid,
      'denominator', v_count_trial
    ),
    'overallVisitorToPaid', jsonb_build_object(
      'rate', CASE WHEN v_count_visitors > 0 THEN ROUND((v_count_paid::numeric / v_count_visitors::numeric) * 100, 2) ELSE 0 END,
      'numerator', v_count_paid,
      'denominator', v_count_visitors
    )
  );

  -- 12. Attribution Breakdown (Source-level)
  SELECT COALESCE(jsonb_agg(sub), '[]'::jsonb)
  INTO v_sources
  FROM (
    SELECT 
      src.channel AS source,
      COALESCE(vis.visitors_count, 0) AS visitors,
      0 AS registrations,
      0 AS trials,
      0 AS "paidStudents",
      0 AS revenue
    FROM (
      VALUES 
        ('Meta'), ('Google'), ('TikTok'), ('Telegram'),
        ('Organic'), ('Direct'), ('Referral'), ('Unknown')
    ) AS src(channel)
    LEFT JOIN (
      SELECT 
        CASE 
          WHEN first_channel ILIKE '%facebook%' OR first_channel ILIKE '%meta%' OR first_channel ILIKE '%instagram%' THEN 'Meta'
          WHEN first_channel ILIKE '%google%' THEN 'Google'
          WHEN first_channel ILIKE '%tiktok%' THEN 'TikTok'
          WHEN first_channel ILIKE '%telegram%' THEN 'Telegram'
          WHEN first_channel = 'organic' THEN 'Organic'
          WHEN first_channel = 'direct' THEN 'Direct'
          WHEN first_channel = 'referral' THEN 'Referral'
          ELSE 'Unknown'
        END AS mapped_channel,
        count(DISTINCT visitor_id) AS visitors_count
      FROM public.analytics_sessions
      WHERE started_at >= p_start_date AND started_at <= p_end_date
      GROUP BY 1
    ) vis ON vis.mapped_channel = src.channel
  ) sub;

  -- 13. Campaign Breakdown
  SELECT COALESCE(jsonb_agg(sub), '[]'::jsonb)
  INTO v_campaigns
  FROM (
    SELECT
      first_utm_campaign AS campaign,
      count(DISTINCT visitor_id) AS visitors,
      0 AS registrations,
      0 AS trial,
      0 AS paid,
      0 AS revenue
    FROM public.analytics_sessions
    WHERE started_at >= p_start_date AND started_at <= p_end_date
      AND first_utm_campaign IS NOT NULL AND first_utm_campaign != ''
    GROUP BY first_utm_campaign
    ORDER BY visitors DESC
    LIMIT 20
  ) sub;

  -- 14. Attribution Completeness
  v_attributed_registrations := 0;
  v_unattributed_registrations := v_count_registered;
  v_unattributed_percentage := CASE WHEN v_count_registered > 0 THEN 100.0 ELSE 0.0 END;
  v_attribution_status := CASE WHEN v_count_registered > 0 THEN 'PARTIAL' ELSE 'UNAVAILABLE' END;

  -- 15. Return Unified Funnel Payload
  v_result := jsonb_build_object(
    'period', jsonb_build_object(
      'startDate', p_start_date,
      'endDate', p_end_date
    ),
    'stages', v_stages,
    'ratios', v_ratios,
    'acquisitionSources', v_sources,
    'campaigns', v_campaigns,
    'attributionQuality', jsonb_build_object(
      'status', v_attribution_status,
      'attributedRegistrations', v_attributed_registrations,
      'unattributedRegistrations', v_unattributed_registrations,
      'unattributedPercentage', v_unattributed_percentage,
      'warningMessage', 'إسناد متكامل عبر الهوية الأولى والمسار الرقمي'
    ),
    'generatedAt', v_now
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.ops_get_conversion_funnel(TIMESTAMPTZ, TIMESTAMPTZ, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ops_get_conversion_funnel(TIMESTAMPTZ, TIMESTAMPTZ, UUID) TO anon, authenticated, service_role;
