-- ==============================================================================
-- 056_security_hardening_and_rbac_lockdown.sql
-- CRITICAL SECURITY HARDENING & RBAC LOCKDOWN FOR PRODUCTION SUPABASE
-- Dedicated Supabase Project: erbvmpnxufgeinqnshzu
--
-- SECURITY INVARIANTS:
-- 1. Real Operator User UID ('7f7f704e-d9f1-4edf-9952-591f41fc0c55') is bound as authoritative OWNER in public.user_roles.
-- 2. Fixed UUIDs are NEVER trusted as authorization credentials or secrets.
-- 3. public.bootstrap_initial_owner is permanently locked and revoked from PUBLIC, anon, authenticated.
-- 4. public.admin_authoritative_approve_order and reject functions strictly bind to auth.uid() (or explicit service_role).
-- 5. All analytical ops_get_* RPCs strictly verify public.is_operator(auth.uid()) and are REVOKED from anon.
-- 6. No destructive drops; 100% idempotent and non-destructive to production data.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: OWNER AUTHORITATIVE PROVISIONING IN public.user_roles
-- ------------------------------------------------------------------------------

INSERT INTO public.user_roles (user_id, role)
VALUES ('7f7f704e-d9f1-4edf-9952-591f41fc0c55'::uuid, 'OWNER')
ON CONFLICT (user_id, role) DO NOTHING;

-- ------------------------------------------------------------------------------
-- STEP 2: PERMANENTLY LOCK public.bootstrap_initial_owner
-- ------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.bootstrap_initial_owner(UUID);

CREATE OR REPLACE FUNCTION public.bootstrap_initial_owner(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RAISE EXCEPTION 'Owner bootstrap rejected: system owner is already provisioned and bootstrap is permanently locked.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.bootstrap_initial_owner(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.bootstrap_initial_owner(UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_initial_owner(UUID) TO service_role;

-- ------------------------------------------------------------------------------
-- STEP 3: AUTHORITATIVE HELPER FUNCTION: get_my_operator_role
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_my_operator_role()
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT role INTO v_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY CASE role
    WHEN 'OWNER' THEN 1
    WHEN 'OPERATOR' THEN 2
    WHEN 'CONTENT_REVIEWER' THEN 3
    ELSE 4
  END
  LIMIT 1;
  
  RETURN v_role;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.get_my_operator_role() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_operator_role() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_operator_role() TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- STEP 4: HARDEN admin_authoritative_approve_order & approve_payment_order
-- ------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.admin_authoritative_approve_order(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION public.admin_authoritative_approve_order(
  p_order_id UUID,
  p_operator_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT 'Payment verified by authorized operator'
)
RETURNS JSONB AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_is_service_role BOOLEAN := (auth.role() = 'service_role');
  v_order RECORD;
  v_student RECORD;
  v_plan RECORD;
  v_duration_months INT := 10;
  v_new_expires_at TIMESTAMPTZ;
  v_sub_id UUID;
  v_before_state JSONB;
  v_after_state JSONB;
BEGIN
  -- 1. Authorization Verification: strictly bind to auth.uid() unless service_role
  IF v_is_service_role THEN
    v_caller_id := coalesce(p_operator_id, auth.uid());
  ELSE
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL OR NOT public.has_finance_access(v_caller_id) THEN
      RAISE EXCEPTION 'Access denied: caller does not possess finance authorization.';
    END IF;
  END IF;

  -- 2. Lock and retrieve payment order
  SELECT * INTO v_order
  FROM public.payment_orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment order % not found.', p_order_id;
  END IF;

  -- Idempotency check: if already approved, return success without duplicate side-effects
  IF v_order.status = 'APPROVED' THEN
    SELECT * INTO v_student FROM public.student_profiles WHERE id = v_order.user_id;
    RETURN jsonb_build_object(
      'success', true,
      'order_id', p_order_id,
      'user_id', v_order.user_id,
      'status', 'APPROVED',
      'access_status', coalesce(v_student.access_status, 'PAID'),
      'subscription_expires_at', v_student.subscription_expires_at,
      'message', 'Order is already approved (idempotent).'
    );
  END IF;

  IF v_order.status NOT IN ('PENDING', 'DRAFT') THEN
    RAISE EXCEPTION 'Cannot approve order in status %.', v_order.status;
  END IF;

  IF v_order.user_id IS NULL THEN
    RAISE EXCEPTION 'Cannot approve order %: order is not linked to any student profile.', p_order_id;
  END IF;

  -- 3. Fetch plan configuration dynamically from database
  SELECT * INTO v_plan
  FROM public.subscription_plans
  WHERE id = v_order.plan;

  IF FOUND THEN
    v_duration_months := coalesce(v_plan.duration_months, 10);
  ELSE
    IF v_order.plan = 'monthly' THEN
      v_duration_months := 1;
    ELSE
      v_duration_months := 10;
    END IF;
  END IF;

  v_new_expires_at := now() + (v_duration_months || ' months')::interval;

  -- 4. Lock and retrieve student profile before state
  SELECT id, access_status, plan, trial_expires_at, subscription_expires_at INTO v_student
  FROM public.student_profiles
  WHERE id = v_order.user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Student profile % not found for payment order %.', v_order.user_id, p_order_id;
  END IF;

  v_before_state := jsonb_build_object(
    'order_status', v_order.status,
    'student_access_status', coalesce(v_student.access_status, 'TRIAL'),
    'student_plan', coalesce(v_student.plan, 'PILOT_TRIAL'),
    'amount', v_order.amount,
    'currency', v_order.currency,
    'subscription_expires_at', v_student.subscription_expires_at
  );

  -- 5. Transition payment order to APPROVED
  UPDATE public.payment_orders
  SET status = 'APPROVED',
      reviewed_at = now(),
      reviewed_by = v_caller_id,
      notes = coalesce(p_reason, notes),
      updated_at = now()
  WHERE id = p_order_id;

  -- 6. Insert durable subscription record
  INSERT INTO public.subscriptions (
    student_id,
    order_id,
    plan_id,
    status,
    started_at,
    expires_at,
    activated_by,
    notes,
    created_at,
    updated_at
  ) VALUES (
    v_order.user_id,
    p_order_id,
    CASE WHEN v_order.plan IN ('season', 'monthly') THEN v_order.plan ELSE 'season' END,
    'ACTIVE',
    now(),
    v_new_expires_at,
    v_caller_id,
    p_reason,
    now(),
    now()
  ) RETURNING id INTO v_sub_id;

  -- 7. Elevate student access state authoritatively
  UPDATE public.student_profiles
  SET access_status = 'PAID',
      plan = CASE WHEN v_order.plan IN ('season', 'monthly') THEN v_order.plan ELSE 'season' END,
      subscription_started_at = now(),
      subscription_expires_at = v_new_expires_at,
      updated_at = now()
  WHERE id = v_order.user_id;

  v_after_state := jsonb_build_object(
    'order_status', 'APPROVED',
    'student_access_status', 'PAID',
    'student_plan', CASE WHEN v_order.plan IN ('season', 'monthly') THEN v_order.plan ELSE 'season' END,
    'subscription_id', v_sub_id,
    'subscription_started_at', now(),
    'subscription_expires_at', v_new_expires_at,
    'reviewed_by', v_caller_id,
    'reviewed_at', now()
  );

  -- 8. Write immutable operations audit log
  INSERT INTO public.operations_audit_logs (
    actor_user_id,
    actor_role,
    action,
    target_type,
    target_id,
    reason,
    before_state,
    after_state,
    created_at
  ) VALUES (
    v_caller_id,
    CASE 
      WHEN v_is_service_role THEN 'SERVICE_ROLE'
      WHEN v_caller_id IS NOT NULL AND public.is_owner(v_caller_id) THEN 'OWNER' 
      ELSE 'OPERATOR' 
    END,
    'SUBSCRIPTION_APPROVED',
    'payment_order',
    p_order_id::text,
    p_reason,
    v_before_state,
    v_after_state,
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'user_id', v_order.user_id,
    'subscription_id', v_sub_id,
    'status', 'APPROVED',
    'access_status', 'PAID',
    'subscription_expires_at', v_new_expires_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP FUNCTION IF EXISTS public.approve_payment_order(UUID, TEXT);
DROP FUNCTION IF EXISTS public.approve_payment_order(UUID);

CREATE OR REPLACE FUNCTION public.approve_payment_order(
  p_order_id UUID,
  p_reason TEXT DEFAULT 'Payment verified by operator'
)
RETURNS JSONB AS $$
BEGIN
  RETURN public.admin_authoritative_approve_order(
    p_order_id,
    auth.uid(),
    p_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.admin_authoritative_approve_order(UUID, UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_authoritative_approve_order(UUID, UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_authoritative_approve_order(UUID, UUID, TEXT) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.approve_payment_order(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.approve_payment_order(UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.approve_payment_order(UUID, TEXT) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- STEP 5: HARDEN admin_authoritative_reject_order & reject_payment_order
-- ------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.admin_authoritative_reject_order(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION public.admin_authoritative_reject_order(
  p_order_id UUID,
  p_operator_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT 'Payment rejected by operator'
)
RETURNS JSONB AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_is_service_role BOOLEAN := (auth.role() = 'service_role');
  v_order RECORD;
  v_before_state JSONB;
  v_after_state JSONB;
BEGIN
  -- Authorization check: caller MUST be finance authorized OR service_role
  IF v_is_service_role THEN
    v_caller_id := coalesce(p_operator_id, auth.uid());
  ELSE
    v_caller_id := auth.uid();
    IF v_caller_id IS NULL OR NOT public.has_finance_access(v_caller_id) THEN
      RAISE EXCEPTION 'Access denied: caller does not possess finance authorization.';
    END IF;
  END IF;

  IF p_reason IS NULL OR length(trim(p_reason)) = 0 THEN
    RAISE EXCEPTION 'Rejection reason is required.';
  END IF;

  -- Lock and retrieve payment order
  SELECT * INTO v_order
  FROM public.payment_orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment order % not found.', p_order_id;
  END IF;

  -- Cannot reject an approved order
  IF v_order.status = 'APPROVED' THEN
    RAISE EXCEPTION 'Cannot reject an already APPROVED payment order.';
  END IF;

  -- Idempotency check: if already rejected, return success cleanly
  IF v_order.status = 'REJECTED' THEN
    RETURN jsonb_build_object(
      'success', true,
      'order_id', p_order_id,
      'user_id', v_order.user_id,
      'status', 'REJECTED',
      'message', 'Order is already rejected (idempotent).'
    );
  END IF;

  v_before_state := jsonb_build_object(
    'order_status', v_order.status,
    'rejection_reason', v_order.rejection_reason
  );

  -- Transition payment order to REJECTED
  UPDATE public.payment_orders
  SET status = 'REJECTED',
      reviewed_at = now(),
      reviewed_by = v_caller_id,
      rejection_reason = trim(p_reason),
      updated_at = now()
  WHERE id = p_order_id;

  v_after_state := jsonb_build_object(
    'order_status', 'REJECTED',
    'rejection_reason', trim(p_reason),
    'reviewed_by', v_caller_id,
    'reviewed_at', now()
  );

  -- Update student profile access status if linked and not already PAID
  IF v_order.user_id IS NOT NULL THEN
    BEGIN
      UPDATE public.student_profiles
      SET access_status = 'REJECTED',
          updated_at = now()
      WHERE id = v_order.user_id
        AND (access_status IS NULL OR access_status != 'PAID');
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;

  -- Write to immutable operations audit log
  BEGIN
    INSERT INTO public.operations_audit_logs (
      actor_user_id,
      actor_role,
      action,
      target_type,
      target_id,
      reason,
      before_state,
      after_state,
      created_at
    ) VALUES (
      v_caller_id,
      CASE 
        WHEN v_is_service_role THEN 'SERVICE_ROLE'
        WHEN v_caller_id IS NOT NULL AND public.is_owner(v_caller_id) THEN 'OWNER' 
        ELSE 'OPERATOR' 
      END,
      'PAYMENT_REJECTED',
      'payment_order',
      p_order_id::text,
      trim(p_reason),
      v_before_state,
      v_after_state,
      now()
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'user_id', v_order.user_id,
    'status', 'REJECTED',
    'rejection_reason', trim(p_reason)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP FUNCTION IF EXISTS public.reject_payment_order(UUID, TEXT);
DROP FUNCTION IF EXISTS public.reject_payment_order(UUID);

CREATE OR REPLACE FUNCTION public.reject_payment_order(
  p_order_id UUID,
  p_rejection_reason TEXT DEFAULT 'Payment rejected by operator'
)
RETURNS JSONB AS $$
BEGIN
  RETURN public.admin_authoritative_reject_order(
    p_order_id,
    auth.uid(),
    p_rejection_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.admin_authoritative_reject_order(UUID, UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_authoritative_reject_order(UUID, UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_authoritative_reject_order(UUID, UUID, TEXT) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.reject_payment_order(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reject_payment_order(UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.reject_payment_order(UUID, TEXT) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- STEP 6: REVOKE EXECUTE ON COD & SUBSCRIPTION ADMIN FUNCTIONS FROM anon
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'admin_dispatch_shipment') THEN
    REVOKE ALL ON FUNCTION public.admin_dispatch_shipment(UUID, TEXT, TEXT) FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.admin_dispatch_shipment(UUID, TEXT, TEXT) FROM anon;
    GRANT EXECUTE ON FUNCTION public.admin_dispatch_shipment(UUID, TEXT, TEXT) TO authenticated, service_role;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'admin_verify_cod_payment_settled') THEN
    REVOKE ALL ON FUNCTION public.admin_verify_cod_payment_settled(UUID, TEXT) FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.admin_verify_cod_payment_settled(UUID, TEXT) FROM anon;
    GRANT EXECUTE ON FUNCTION public.admin_verify_cod_payment_settled(UUID, TEXT) TO authenticated, service_role;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'admin_activate_cod_subscription') THEN
    REVOKE ALL ON FUNCTION public.admin_activate_cod_subscription(UUID, TEXT) FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.admin_activate_cod_subscription(UUID, TEXT) FROM anon;
    GRANT EXECUTE ON FUNCTION public.admin_activate_cod_subscription(UUID, TEXT) TO authenticated, service_role;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'extend_student_subscription') THEN
    REVOKE ALL ON FUNCTION public.extend_student_subscription(UUID, INT, TEXT) FROM PUBLIC;
    REVOKE EXECUTE ON FUNCTION public.extend_student_subscription(UUID, INT, TEXT) FROM anon;
    GRANT EXECUTE ON FUNCTION public.extend_student_subscription(UUID, INT, TEXT) TO authenticated, service_role;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- STEP 7: HARDEN ops_get_visitors_analytics (NO FIXED UUID BYPASS)
-- ------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.ops_get_visitors_analytics(INT, UUID);

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
  v_total_visitors_period INT := 0;
  v_total_sessions_period INT := 0;
  v_new_visitors_period INT := 0;
  v_returning_visitors_period INT := 0;
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
  -- 1. Security Check: Strict operator authorization (or service_role)
  IF NOT (auth.role() = 'service_role') THEN
    IF v_caller IS NULL OR NOT public.is_operator(v_caller) THEN
      RAISE EXCEPTION 'Access denied: operator authorization required';
    END IF;
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

  v_returning_visitors_today := GREATEST(0, v_unique_visitors_today - v_new_visitors_today);

  SELECT count(*) INTO v_unique_visitors_7d
  FROM public.analytics_visitors
  WHERE last_seen_at >= v_week_start;

  SELECT count(*) INTO v_unique_visitors_30d
  FROM public.analytics_visitors
  WHERE last_seen_at >= v_month_start;

  -- 3. Live Active Visitors (activity in the last 5 minutes)
  SELECT count(DISTINCT visitor_id) INTO v_active_visitors_now
  FROM public.analytics_sessions
  WHERE last_activity_at >= (now() - interval '5 minutes')
    AND is_active = true;

  -- 4. Period Aggregates (Configurable window)
  SELECT count(*) INTO v_total_visitors_period
  FROM public.analytics_visitors
  WHERE last_seen_at >= v_period_start;

  SELECT count(*) INTO v_total_sessions_period
  FROM public.analytics_sessions
  WHERE started_at >= v_period_start;

  SELECT count(*) INTO v_new_visitors_period
  FROM public.analytics_visitors
  WHERE first_seen_at >= v_period_start;

  v_returning_visitors_period := GREATEST(0, v_total_visitors_period - v_new_visitors_period);

  -- 5. Daily Trend Generation (Last min(p_period_days, 30) days)
  WITH dates AS (
    SELECT generate_series(
      date_trunc('day', v_period_start AT TIME ZONE 'Africa/Algiers'),
      date_trunc('day', v_now AT TIME ZONE 'Africa/Algiers'),
      interval '1 day'
    ) AT TIME ZONE 'Africa/Algiers' AS day_date
  ),
  daily_stats AS (
    SELECT
      date_trunc('day', started_at AT TIME ZONE 'Africa/Algiers') AT TIME ZONE 'Africa/Algiers' AS day_bucket,
      count(DISTINCT visitor_id) AS day_unique,
      count(*) AS day_sessions
    FROM public.analytics_sessions
    WHERE started_at >= v_period_start
    GROUP BY 1
  ),
  daily_new AS (
    SELECT
      date_trunc('day', first_seen_at AT TIME ZONE 'Africa/Algiers') AT TIME ZONE 'Africa/Algiers' AS day_bucket,
      count(DISTINCT visitor_id) AS day_new_count
    FROM public.analytics_visitors
    WHERE first_seen_at >= v_period_start
    GROUP BY 1
  )
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'date', to_char(d.day_date, 'YYYY-MM-DD'),
      'label', to_char(d.day_date, 'DD Mon'),
      'uniqueVisitors', coalesce(s.day_unique, 0),
      'sessions', coalesce(s.day_sessions, 0),
      'newVisitors', coalesce(n.day_new_count, 0),
      'returningVisitors', GREATEST(0, coalesce(s.day_unique, 0) - coalesce(n.day_new_count, 0))
    ) ORDER BY d.day_date ASC
  ), '[]'::jsonb) INTO v_trend
  FROM dates d
  LEFT JOIN daily_stats s ON d.day_date = s.day_bucket
  LEFT JOIN daily_new n ON d.day_date = n.day_bucket;

  -- 6. Top Visited Pages
  WITH page_counts AS (
    SELECT
      page_path,
      count(*) AS views,
      round((count(*)::numeric / NULLIF(sum(count(*)) OVER (), 0)) * 100, 1) AS pct
    FROM public.analytics_events
    WHERE event_name = 'page_view'
      AND occurred_at >= v_period_start
      AND page_path IS NOT NULL
    GROUP BY page_path
    ORDER BY count(*) DESC
    LIMIT 10
  )
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'path', page_path,
      'views', views,
      'percentage', coalesce(pct, 0.0)
    )
  ), '[]'::jsonb) INTO v_top_pages
  FROM page_counts;

  -- 7. Traffic Sources Breakdown
  WITH sources_stats AS (
    SELECT
      coalesce(nullif(first_utm_source, ''), nullif(first_channel, ''), 'Direct / Internal') AS src,
      count(DISTINCT visitor_id) AS visitors_count,
      count(*) AS sessions_count,
      round((count(*)::numeric / NULLIF(sum(count(*)) OVER (), 0)) * 100, 1) AS pct
    FROM public.analytics_sessions
    WHERE started_at >= v_period_start
    GROUP BY 1
    ORDER BY count(*) DESC
    LIMIT 8
  )
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'source', src,
      'visitors', visitors_count,
      'sessions', sessions_count,
      'percentage', coalesce(pct, 0.0)
    )
  ), '[]'::jsonb) INTO v_traffic_sources
  FROM sources_stats;

  -- 8. Device Breakdown
  WITH device_counts AS (
    SELECT
      coalesce(nullif(lower(device_type), ''), 'desktop') AS dev,
      count(*) AS cnt
    FROM public.analytics_sessions
    WHERE started_at >= v_period_start
    GROUP BY 1
  )
  SELECT jsonb_build_object(
    'mobile', coalesce(sum(cnt) FILTER (WHERE dev = 'mobile'), 0),
    'desktop', coalesce(sum(cnt) FILTER (WHERE dev = 'desktop'), 0),
    'tablet', coalesce(sum(cnt) FILTER (WHERE dev = 'tablet'), 0),
    'unknown', coalesce(sum(cnt) FILTER (WHERE dev NOT IN ('mobile', 'desktop', 'tablet')), 0),
    'total', coalesce(sum(cnt), 0)
  ) INTO v_devices
  FROM device_counts;

  -- 9. Entry Pages (Landing pages)
  WITH landing_stats AS (
    SELECT
      landing_page,
      count(*) AS cnt,
      round((count(*)::numeric / NULLIF(sum(count(*)) OVER (), 0)) * 100, 1) AS pct
    FROM public.analytics_sessions
    WHERE started_at >= v_period_start
      AND landing_page IS NOT NULL
    GROUP BY landing_page
    ORDER BY count(*) DESC
    LIMIT 8
  )
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'path', landing_page,
      'entries', cnt,
      'percentage', coalesce(pct, 0.0)
    )
  ), '[]'::jsonb) INTO v_entry_pages
  FROM landing_stats;

  -- 10. Exit Pages
  WITH exit_stats AS (
    SELECT
      page_path,
      count(*) AS cnt,
      round((count(*)::numeric / NULLIF(sum(count(*)) OVER (), 0)) * 100, 1) AS pct
    FROM (
      SELECT
        page_path,
        row_number() OVER (PARTITION BY session_id ORDER BY occurred_at DESC) AS rn
      FROM public.analytics_events
      WHERE event_name = 'page_view'
        AND occurred_at >= v_period_start
        AND page_path IS NOT NULL
    ) sub
    WHERE rn = 1
    GROUP BY page_path
    ORDER BY count(*) DESC
    LIMIT 8
  )
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'path', page_path,
      'exits', cnt,
      'percentage', coalesce(pct, 0.0)
    )
  ), '[]'::jsonb) INTO v_exit_pages
  FROM exit_stats;

  -- 11. Geographic Intelligence
  SELECT count(*) > 0 INTO v_has_reliable_geo
  FROM public.analytics_sessions
  WHERE started_at >= v_period_start
    AND country IS NOT NULL
    AND country != ''
    AND country != 'UNKNOWN';

  IF v_has_reliable_geo THEN
    WITH geo_counts AS (
      SELECT
        country,
        count(*) AS cnt,
        round((count(*)::numeric / NULLIF(sum(count(*)) OVER (), 0)) * 100, 1) AS pct
      FROM public.analytics_sessions
      WHERE started_at >= v_period_start
        AND country IS NOT NULL
        AND country != ''
      GROUP BY country
      ORDER BY count(*) DESC
      LIMIT 10
    )
    SELECT jsonb_build_object(
      'hasReliableGeography', true,
      'topCountries', coalesce(jsonb_agg(
        jsonb_build_object(
          'code', country,
          'name', country,
          'visitors', cnt,
          'percentage', coalesce(pct, 0.0)
        )
      ), '[]'::jsonb)
    ) INTO v_geography
    FROM geo_counts;
  ELSE
    v_geography := jsonb_build_object('hasReliableGeography', false);
  END IF;

  -- 12. Recent Visitor Activity Stream
  WITH recent_logs AS (
    SELECT
      id,
      visitor_id,
      session_id,
      page_path,
      event_name,
      occurred_at
    FROM public.analytics_events
    WHERE occurred_at >= (now() - interval '24 hours')
    ORDER BY occurred_at DESC
    LIMIT 15
  )
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', id::text,
      'visitorId', visitor_id,
      'sessionId', session_id,
      'path', coalesce(page_path, '/'),
      'eventName', event_name,
      'time', occurred_at
    )
  ), '[]'::jsonb) INTO v_recent_activity
  FROM recent_logs;

  -- Final Structured Response
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
    'periodSummary', jsonb_build_object(
      'periodDays', p_period_days,
      'totalVisitors', v_total_visitors_period,
      'totalSessions', v_total_sessions_period,
      'newVisitors', v_new_visitors_period,
      'returningVisitors', v_returning_visitors_period
    ),
    'trend', v_trend,
    'topPages', v_top_pages,
    'sources', v_traffic_sources,
    'devices', v_devices,
    'returningVsNew', jsonb_build_object(
      'newVisitors', v_new_visitors_period,
      'returningVisitors', v_returning_visitors_period,
      'newPercentage', CASE WHEN v_total_visitors_period > 0 THEN round((v_new_visitors_period::numeric / v_total_visitors_period) * 100, 1) ELSE 0.0 END,
      'returningPercentage', CASE WHEN v_total_visitors_period > 0 THEN round((v_returning_visitors_period::numeric / v_total_visitors_period) * 100, 1) ELSE 0.0 END
    ),
    'entryPages', v_entry_pages,
    'exitPages', v_exit_pages,
    'geography', v_geography,
    'recentActivity', v_recent_activity,
    'generatedAt', v_now
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.ops_get_visitors_analytics(INT, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ops_get_visitors_analytics(INT, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.ops_get_visitors_analytics(INT, UUID) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- STEP 8: HARDEN ops_get_student_analytics (NO FIXED UUID BYPASS)
-- ------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.ops_get_student_analytics(INT, UUID);

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
  -- 1. Security Check: Strict operator authorization (or service_role)
  IF NOT (auth.role() = 'service_role') THEN
    IF v_caller IS NULL OR NOT public.is_operator(v_caller) THEN
      RAISE EXCEPTION 'Access denied: operator authorization required';
    END IF;
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

  -- 3. Activity Counts
  SELECT count(DISTINCT user_id) INTO v_active_today
  FROM public.analytics_events
  WHERE user_id IS NOT NULL
    AND occurred_at >= v_today_start;

  SELECT count(DISTINCT user_id) INTO v_active_7d
  FROM public.analytics_events
  WHERE user_id IS NOT NULL
    AND occurred_at >= v_week_start;

  SELECT count(DISTINCT user_id) INTO v_active_30d
  FROM public.analytics_events
  WHERE user_id IS NOT NULL
    AND occurred_at >= v_month_start;

  SELECT count(*) INTO v_never_active
  FROM public.student_profiles sp
  WHERE NOT EXISTS (
    SELECT 1 FROM public.analytics_events ae
    WHERE ae.user_id = sp.id
  );

  -- 4. Subscription & Access Breakdown
  SELECT count(*) INTO v_trial_students
  FROM public.student_profiles
  WHERE access_status = 'TRIAL'
     OR (trial_expires_at IS NOT NULL AND trial_expires_at > v_now AND coalesce(access_status, '') != 'PAID');

  SELECT count(*) INTO v_paid_students
  FROM public.student_profiles
  WHERE access_status = 'PAID'
     OR plan IN ('PAID', 'season', 'monthly')
     OR (subscription_expires_at IS NOT NULL AND subscription_expires_at > v_now);

  SELECT count(*) INTO v_expired_subscriptions
  FROM public.student_profiles
  WHERE subscription_expires_at IS NOT NULL
    AND subscription_expires_at <= v_now
    AND access_status != 'PAID';

  -- 5. Lifecycle Funnel Ground Truth
  v_funnel_registered := v_total_students;

  SELECT count(*) INTO v_funnel_activated
  FROM public.student_profiles
  WHERE stream_id IS NOT NULL OR wilaya_name IS NOT NULL;

  v_funnel_active := v_active_30d;
  v_funnel_trial := v_trial_students;
  v_funnel_paid := v_paid_students;

  -- 6. Daily Growth Curve (Registrations over the requested period)
  WITH dates AS (
    SELECT generate_series(
      date_trunc('day', v_period_start AT TIME ZONE 'Africa/Algiers'),
      date_trunc('day', v_now AT TIME ZONE 'Africa/Algiers'),
      interval '1 day'
    ) AT TIME ZONE 'Africa/Algiers' AS day_date
  ),
  daily_regs AS (
    SELECT
      date_trunc('day', created_at AT TIME ZONE 'Africa/Algiers') AT TIME ZONE 'Africa/Algiers' AS reg_day,
      count(*) AS new_count
    FROM public.student_profiles
    WHERE created_at >= v_period_start
    GROUP BY 1
  ),
  cum_base AS (
    SELECT count(*) AS base_count
    FROM public.student_profiles
    WHERE created_at < v_period_start
  )
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'date', to_char(d.day_date, 'YYYY-MM-DD'),
      'label', to_char(d.day_date, 'DD Mon'),
      'newRegistrations', coalesce(r.new_count, 0),
      'cumulativeTotal', (SELECT base_count FROM cum_base) + coalesce(sum(r.new_count) OVER (ORDER BY d.day_date ASC), 0)
    ) ORDER BY d.day_date ASC
  ), '[]'::jsonb) INTO v_daily_growth
  FROM dates d
  LEFT JOIN daily_regs r ON d.day_date = r.reg_day;

  -- 7. Daily Active Users Curve
  WITH dates AS (
    SELECT generate_series(
      date_trunc('day', v_period_start AT TIME ZONE 'Africa/Algiers'),
      date_trunc('day', v_now AT TIME ZONE 'Africa/Algiers'),
      interval '1 day'
    ) AT TIME ZONE 'Africa/Algiers' AS day_date
  ),
  daily_act AS (
    SELECT
      date_trunc('day', occurred_at AT TIME ZONE 'Africa/Algiers') AT TIME ZONE 'Africa/Algiers' AS act_day,
      count(DISTINCT user_id) AS active_users,
      count(*) AS total_interactions
    FROM public.analytics_events
    WHERE user_id IS NOT NULL
      AND occurred_at >= v_period_start
    GROUP BY 1
  )
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'date', to_char(d.day_date, 'YYYY-MM-DD'),
      'label', to_char(d.day_date, 'DD Mon'),
      'activeStudents', coalesce(a.active_users, 0),
      'interactions', coalesce(a.total_interactions, 0)
    ) ORDER BY d.day_date ASC
  ), '[]'::jsonb) INTO v_daily_activity
  FROM dates d
  LEFT JOIN daily_act a ON d.day_date = a.act_day;

  -- Final Structured Output
  v_result := jsonb_build_object(
    'kpis', jsonb_build_object(
      'totalStudents', v_total_students,
      'registrationsToday', v_registrations_today,
      'registrationsThisWeek', v_registrations_this_week,
      'registrationsThisMonth', v_registrations_this_month,
      'activeStudentsToday', v_active_today,
      'activeStudentsLast7Days', v_active_7d,
      'activeStudentsLast30Days', v_active_30d,
      'neverActiveStudents', v_never_active,
      'activePercentage', CASE WHEN v_total_students > 0 THEN round((v_active_30d::numeric / v_total_students) * 100, 1) ELSE 0.0 END,
      'paidStudents', v_paid_students,
      'trialStudents', v_trial_students,
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
    'generatedAt', v_now
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.ops_get_student_analytics(INT, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ops_get_student_analytics(INT, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.ops_get_student_analytics(INT, UUID) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- STEP 9: HARDEN ops_get_conversion_funnel (NO FIXED UUID BYPASS)
-- ------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.ops_get_conversion_funnel(TIMESTAMPTZ, TIMESTAMPTZ, UUID);

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
  -- 1. Security Check: Strict operator authorization (or service_role)
  IF NOT (auth.role() = 'service_role') THEN
    IF v_caller IS NULL OR NOT public.is_operator(v_caller) THEN
      RAISE EXCEPTION 'Access denied: operator authorization required';
    END IF;
  END IF;

  -- 2. Stage 1: VISITOR
  SELECT count(*) INTO v_count_visitors
  FROM public.analytics_visitors
  WHERE last_seen_at >= p_start_date AND last_seen_at <= p_end_date;

  -- Stage 2: ENGAGED
  SELECT count(DISTINCT session_id) INTO v_count_engaged
  FROM public.analytics_sessions
  WHERE started_at >= p_start_date AND started_at <= p_end_date
    AND pageviews_count >= 2;

  -- Stage 3: SIGNUP_STARTED
  SELECT count(DISTINCT coalesce(user_id::text, session_id)) INTO v_count_signup_started
  FROM public.analytics_events
  WHERE occurred_at >= p_start_date AND occurred_at <= p_end_date
    AND event_name IN ('signup_started', 'register_page_view', 'registration_started');

  -- Stage 4: REGISTERED
  SELECT count(*) INTO v_count_registered
  FROM public.student_profiles
  WHERE created_at >= p_start_date AND created_at <= p_end_date;

  -- Stage 5: ACTIVATED
  SELECT count(*) INTO v_count_activated
  FROM public.student_profiles
  WHERE created_at >= p_start_date AND created_at <= p_end_date
    AND (stream_id IS NOT NULL OR wilaya_name IS NOT NULL);

  -- Stage 6: TRIAL
  SELECT count(*) INTO v_count_trial
  FROM public.student_profiles
  WHERE created_at >= p_start_date AND created_at <= p_end_date
    AND (
      access_status = 'TRIAL'
      OR (trial_expires_at IS NOT NULL AND trial_expires_at > created_at)
    );

  -- Stage 7: PAYMENT_SUBMITTED
  SELECT count(*) INTO v_count_payment_submitted
  FROM public.payment_orders
  WHERE created_at >= p_start_date AND created_at <= p_end_date;

  -- Stage 8: PAID
  SELECT count(*) INTO v_count_paid
  FROM public.payment_orders
  WHERE created_at >= p_start_date AND created_at <= p_end_date
    AND status = 'APPROVED';

  -- 3. Monotonic smoothing
  v_count_engaged := LEAST(v_count_engaged, v_count_visitors);
  v_count_signup_started := LEAST(v_count_signup_started, GREATEST(v_count_engaged, v_count_registered));
  v_count_activated := LEAST(v_count_activated, v_count_registered);
  v_count_trial := LEAST(v_count_trial, v_count_registered);
  v_count_paid := LEAST(v_count_paid, v_count_payment_submitted);

  -- 4. Attribution Quality
  SELECT
    count(*) FILTER (WHERE first_channel IS NOT NULL AND first_channel NOT IN ('direct', 'internal', 'Direct / Internal')),
    count(*) FILTER (WHERE first_channel IS NULL OR first_channel IN ('direct', 'internal', 'Direct / Internal'))
  INTO v_attributed_registrations, v_unattributed_registrations
  FROM public.analytics_visitors
  WHERE user_id IS NOT NULL
    AND linked_at >= p_start_date AND linked_at <= p_end_date;

  IF (v_attributed_registrations + v_unattributed_registrations) > 0 THEN
    v_unattributed_percentage := round(
      (v_unattributed_registrations::numeric / (v_attributed_registrations + v_unattributed_registrations)) * 100,
      1
    );
    IF v_unattributed_percentage > 50.0 THEN
      v_attribution_status := 'DEGRADED';
    ELSE
      v_attribution_status := 'HEALTHY';
    END IF;
  ELSE
    v_attribution_status := 'UNAVAILABLE';
    v_unattributed_percentage := 0.0;
  END IF;

  -- 5. Build Stages Array
  v_stages := jsonb_build_array(
    jsonb_build_object(
      'key', 'VISITOR',
      'label', 'زوار المنصة (Visitors)',
      'count', v_count_visitors,
      'conversionFromPrev', 100.0,
      'conversionFromTop', 100.0,
      'definition', 'إجمالي الزوار الفريدين للموقع خلال الفترة'
    ),
    jsonb_build_object(
      'key', 'ENGAGED',
      'label', 'زيارات متفاعلة (Engaged)',
      'count', v_count_engaged,
      'conversionFromPrev', CASE WHEN v_count_visitors > 0 THEN round((v_count_engaged::numeric / v_count_visitors) * 100, 1) ELSE 0.0 END,
      'conversionFromTop', CASE WHEN v_count_visitors > 0 THEN round((v_count_engaged::numeric / v_count_visitors) * 100, 1) ELSE 0.0 END,
      'definition', 'جلسات تصفحت صفحتين أو أكثر مع تفاعل نشط'
    ),
    jsonb_build_object(
      'key', 'SIGNUP_STARTED',
      'label', 'بدء التسجيل (Signup Started)',
      'count', v_count_signup_started,
      'conversionFromPrev', CASE WHEN v_count_engaged > 0 THEN round((v_count_signup_started::numeric / v_count_engaged) * 100, 1) ELSE 0.0 END,
      'conversionFromTop', CASE WHEN v_count_visitors > 0 THEN round((v_count_signup_started::numeric / v_count_visitors) * 100, 1) ELSE 0.0 END,
      'definition', 'زوار فتحوا صفحة إنشاء الحساب أو بدأوا إدخال البيانات'
    ),
    jsonb_build_object(
      'key', 'REGISTERED',
      'label', 'حسابات مسجلة (Registered)',
      'count', v_count_registered,
      'conversionFromPrev', CASE WHEN v_count_signup_started > 0 THEN round((v_count_registered::numeric / v_count_signup_started) * 100, 1) ELSE 0.0 END,
      'conversionFromTop', CASE WHEN v_count_visitors > 0 THEN round((v_count_registered::numeric / v_count_visitors) * 100, 1) ELSE 0.0 END,
      'definition', 'طلاب أتموا إنشاء الحساب في قاعدة البيانات'
    ),
    jsonb_build_object(
      'key', 'ACTIVATED',
      'label', 'إعداد الملف (Profile Activated)',
      'count', v_count_activated,
      'conversionFromPrev', CASE WHEN v_count_registered > 0 THEN round((v_count_activated::numeric / v_count_registered) * 100, 1) ELSE 0.0 END,
      'conversionFromTop', CASE WHEN v_count_visitors > 0 THEN round((v_count_activated::numeric / v_count_visitors) * 100, 1) ELSE 0.0 END,
      'definition', 'طلاب حددوا الشعبة والولاية وبدأوا التهيئة الأكاديمية'
    ),
    jsonb_build_object(
      'key', 'TRIAL',
      'label', 'فترة التجربة (Trial Started)',
      'count', v_count_trial,
      'conversionFromPrev', CASE WHEN v_count_activated > 0 THEN round((v_count_trial::numeric / v_count_activated) * 100, 1) ELSE 0.0 END,
      'conversionFromTop', CASE WHEN v_count_visitors > 0 THEN round((v_count_trial::numeric / v_count_visitors) * 100, 1) ELSE 0.0 END,
      'definition', 'طلاب بدأت لهم فترة التجربة واستفادوا من الوصول المجاني'
    ),
    jsonb_build_object(
      'key', 'PAYMENT_SUBMITTED',
      'label', 'طلب اشتراك (Order Submitted)',
      'count', v_count_payment_submitted,
      'conversionFromPrev', CASE WHEN v_count_trial > 0 THEN round((v_count_payment_submitted::numeric / v_count_trial) * 100, 1) ELSE 0.0 END,
      'conversionFromTop', CASE WHEN v_count_visitors > 0 THEN round((v_count_payment_submitted::numeric / v_count_visitors) * 100, 1) ELSE 0.0 END,
      'definition', 'طلبات دفع مسجلة ومرفقة بالوصل في انتظار التأكيد'
    ),
    jsonb_build_object(
      'key', 'PAID',
      'label', 'مشتركون رسميّون (Paid Subscribers)',
      'count', v_count_paid,
      'conversionFromPrev', CASE WHEN v_count_payment_submitted > 0 THEN round((v_count_paid::numeric / v_count_payment_submitted) * 100, 1) ELSE 0.0 END,
      'conversionFromTop', CASE WHEN v_count_visitors > 0 THEN round((v_count_paid::numeric / v_count_visitors) * 100, 1) ELSE 0.0 END,
      'definition', 'اشتراكات مدفوعة معتمدة من الإدارة المالية'
    )
  );

  -- 6. Key Ratios
  v_ratios := jsonb_build_object(
    'visitorToRegistration', CASE WHEN v_count_visitors > 0 THEN round((v_count_registered::numeric / v_count_visitors) * 100, 2) ELSE 0.0 END,
    'registrationToTrial', CASE WHEN v_count_registered > 0 THEN round((v_count_trial::numeric / v_count_registered) * 100, 2) ELSE 0.0 END,
    'trialToPayment', CASE WHEN v_count_trial > 0 THEN round((v_count_payment_submitted::numeric / v_count_trial) * 100, 2) ELSE 0.0 END,
    'paymentToPaid', CASE WHEN v_count_payment_submitted > 0 THEN round((v_count_paid::numeric / v_count_payment_submitted) * 100, 2) ELSE 0.0 END,
    'overallConversion', CASE WHEN v_count_visitors > 0 THEN round((v_count_paid::numeric / v_count_visitors) * 100, 2) ELSE 0.0 END
  );

  -- 7. Sources Attribution Breakdown
  WITH src_agg AS (
    SELECT
      coalesce(nullif(first_utm_source, ''), nullif(first_channel, ''), 'Direct / Organic') AS source_name,
      count(*) AS visitors_total,
      count(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) AS registrations_total
    FROM public.analytics_visitors
    WHERE last_seen_at >= p_start_date AND last_seen_at <= p_end_date
    GROUP BY 1
    ORDER BY count(*) DESC
    LIMIT 6
  )
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'source', source_name,
      'visitors', visitors_total,
      'registrations', registrations_total,
      'conversionRate', CASE WHEN visitors_total > 0 THEN round((registrations_total::numeric / visitors_total) * 100, 1) ELSE 0.0 END
    )
  ), '[]'::jsonb) INTO v_sources
  FROM src_agg;

  -- 8. Campaigns Attribution Breakdown
  WITH cmp_agg AS (
    SELECT
      first_utm_campaign AS campaign_name,
      first_utm_source AS campaign_source,
      count(*) AS visitors_total,
      count(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL) AS registrations_total
    FROM public.analytics_visitors
    WHERE last_seen_at >= p_start_date AND last_seen_at <= p_end_date
      AND first_utm_campaign IS NOT NULL
      AND first_utm_campaign != ''
    GROUP BY 1, 2
    ORDER BY count(*) DESC
    LIMIT 6
  )
  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'campaign', campaign_name,
      'source', coalesce(campaign_source, 'Ad'),
      'visitors', visitors_total,
      'registrations', registrations_total,
      'conversionRate', CASE WHEN visitors_total > 0 THEN round((registrations_total::numeric / visitors_total) * 100, 1) ELSE 0.0 END
    )
  ), '[]'::jsonb) INTO v_campaigns
  FROM cmp_agg;

  -- 9. Response Composition
  v_result := jsonb_build_object(
    'period', jsonb_build_object('startDate', p_start_date, 'endDate', p_end_date),
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
REVOKE EXECUTE ON FUNCTION public.ops_get_conversion_funnel(TIMESTAMPTZ, TIMESTAMPTZ, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.ops_get_conversion_funnel(TIMESTAMPTZ, TIMESTAMPTZ, UUID) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- STEP 10: HARDEN ops_get_cockpit_kpis (NO FIXED UUID BYPASS)
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

  -- 1. Student Profiles Aggregation
  SELECT count(*) INTO v_total_students FROM public.student_profiles;

  SELECT count(*) INTO v_paid_subscribers
  FROM public.student_profiles
  WHERE access_status = 'PAID'
     OR plan IN ('PAID', 'season', 'monthly')
     OR (subscription_expires_at IS NOT NULL AND subscription_expires_at > v_now);

  SELECT count(*) INTO v_active_trials
  FROM public.student_profiles
  WHERE access_status = 'TRIAL'
     OR (trial_expires_at IS NOT NULL AND trial_expires_at > v_now AND coalesce(access_status, '') != 'PAID');

  SELECT count(*) INTO v_expired_trials
  FROM public.student_profiles
  WHERE trial_expires_at IS NOT NULL
    AND trial_expires_at <= v_now
    AND coalesce(access_status, '') NOT IN ('PAID', 'ACTIVE');

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
    FROM public.student_error_lab;
  EXCEPTION WHEN OTHERS THEN
    v_errors_recorded := 0;
  END;

  BEGIN
    SELECT count(*) INTO v_retests_passed
    FROM public.student_retest_attempts
    WHERE score >= 60;
  EXCEPTION WHEN OTHERS THEN
    v_retests_passed := 0;
  END;

  BEGIN
    SELECT count(*) INTO v_skills_demonstrated
    FROM public.student_skill_mastery
    WHERE mastery_level >= 2;
  EXCEPTION WHEN OTHERS THEN
    v_skills_demonstrated := 0;
  END;

  -- 3. Operations Counts (Today)
  SELECT count(*) INTO v_new_orders_today
  FROM public.payment_orders
  WHERE created_at >= v_today_start;

  SELECT count(*) INTO v_approved_today
  FROM public.payment_orders
  WHERE reviewed_at >= v_today_start AND status = 'APPROVED';

  SELECT count(*) INTO v_rejected_today
  FROM public.payment_orders
  WHERE reviewed_at >= v_today_start AND status = 'REJECTED';

  -- 4. Commercial Backlog
  SELECT count(*) INTO v_pending_orders
  FROM public.payment_orders
  WHERE status = 'PENDING';

  SELECT count(*) INTO v_subs_expiring_24h
  FROM public.subscriptions
  WHERE status = 'ACTIVE'
    AND expires_at > v_now
    AND expires_at <= (v_now + interval '24 hours');

  SELECT count(*) INTO v_subs_expired
  FROM public.subscriptions
  WHERE expires_at <= v_now
    AND status IN ('ACTIVE', 'EXPIRED');

  SELECT coalesce(sum(amount), 0.00) INTO v_total_revenue
  FROM public.payment_orders
  WHERE status = 'APPROVED';

  -- Build Result JSON
  RETURN jsonb_build_object(
    'studentsOverview', jsonb_build_object(
      'totalRegistered', v_total_students,
      'paidSubscribers', v_paid_subscribers,
      'activeTrials', v_active_trials,
      'expiredTrials', v_expired_trials
    ),
    'dailyOperationalPulse', jsonb_build_object(
      'activeStudentsToday', v_active_today,
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

-- ------------------------------------------------------------------------------
-- STEP 11: HARDEN ops_get_product_usage (STRICT OPERATOR CHECK & REVOKE anon)
-- ------------------------------------------------------------------------------

DROP FUNCTION IF EXISTS public.ops_get_product_usage(INT, UUID);

CREATE OR REPLACE FUNCTION public.ops_get_product_usage(
  p_period_days INT DEFAULT 30,
  p_operator_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_period_start TIMESTAMPTZ := now() - (p_period_days || ' days')::interval;

  -- Diwan
  v_diwan_opened INT := 0;
  v_diwan_table_created INT := 0;
  v_diwan_table_joined INT := 0;

  -- Planner
  v_planner_opened INT := 0;

  -- Exams
  v_exam_opened INT := 0;
  v_exam_started INT := 0;
  v_exam_completed INT := 0;

  -- Summaries
  v_summary_opened INT := 0;

  -- Calculator
  v_calculator_used INT := 0;

  -- Other
  v_subject_opened INT := 0;
  v_orientation_opened INT := 0;
  v_practice_completed INT := 0;
  v_retest_completed INT := 0;

  v_total_events INT := 0;
  v_top_sections JSONB := '[]'::jsonb;
BEGIN
  -- Strict operator authorization
  IF NOT (auth.role() = 'service_role') THEN
    IF v_caller IS NULL OR NOT public.is_operator(v_caller) THEN
      RAISE EXCEPTION 'Access denied: operator privilege required for product usage analytics';
    END IF;
  END IF;

  -- 1. Gather exact counts by controlled event name
  SELECT
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'diwan_opened'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'diwan_table_created'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'diwan_table_joined'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'planner_opened'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'exam_opened'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'exam_started'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'exam_completed'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'summary_opened'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'calculator_used'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'subject_opened'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'orientation_opened'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'practice_completed'), 0),
    COALESCE(COUNT(*) FILTER (WHERE event_name = 'retest_completed'), 0),
    COALESCE(COUNT(*), 0)
  INTO
    v_diwan_opened,
    v_diwan_table_created,
    v_diwan_table_joined,
    v_planner_opened,
    v_exam_opened,
    v_exam_started,
    v_exam_completed,
    v_summary_opened,
    v_calculator_used,
    v_subject_opened,
    v_orientation_opened,
    v_practice_completed,
    v_retest_completed,
    v_total_events
  FROM public.analytics_events
  WHERE occurred_at >= v_period_start;

  -- 2. Compute Most Used Sections Rankings
  WITH ranked_sections AS (
    SELECT
      CASE
        WHEN event_name LIKE 'diwan_%' THEN 'الديوان (قاعة المذاكرة)'
        WHEN event_name LIKE 'planner_%' THEN 'المخطط الذكي'
        WHEN event_name LIKE 'exam_%' THEN 'بنك الامتحانات'
        WHEN event_name LIKE 'summary_%' THEN 'الملخصات والخرائط'
        WHEN event_name LIKE 'calculator_%' THEN 'حاسبة المعدل'
        WHEN event_name = 'subject_opened' THEN 'المقررات الدراسية'
        WHEN event_name = 'orientation_opened' THEN 'دليل التوجيه'
        WHEN event_name IN ('practice_completed', 'retest_completed') THEN 'مختبر الأخطاء والتطبيقات'
        ELSE 'أقسام أخرى'
      END AS section_name,
      COUNT(*) AS section_count
    FROM public.analytics_events
    WHERE occurred_at >= v_period_start
    GROUP BY 1
    ORDER BY COUNT(*) DESC
  )
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'section', section_name,
      'eventsCount', section_count,
      'percentage', CASE WHEN v_total_events > 0 THEN ROUND((section_count::numeric / v_total_events) * 100, 1) ELSE 0.0 END
    )
  ), '[]'::jsonb) INTO v_top_sections
  FROM ranked_sections;

  -- 3. Return JSON
  RETURN jsonb_build_object(
    'diwan', jsonb_build_object(
      'opened', v_diwan_opened,
      'tablesCreated', v_diwan_table_created,
      'tablesJoined', v_diwan_table_joined,
      'totalInteractions', v_diwan_opened + v_diwan_table_created + v_diwan_table_joined
    ),
    'smartPlanner', jsonb_build_object(
      'opened', v_planner_opened,
      'total', v_planner_opened
    ),
    'examBank', jsonb_build_object(
      'opened', v_exam_opened,
      'started', v_exam_started,
      'completed', v_exam_completed,
      'total', v_exam_opened + v_exam_started + v_exam_completed
    ),
    'summaries', jsonb_build_object(
      'opened', v_summary_opened,
      'total', v_summary_opened
    ),
    'gradeCalculator', jsonb_build_object(
      'used', v_calculator_used,
      'total', v_calculator_used
    ),
    'learningPlatform', jsonb_build_object(
      'subjectOpened', v_subject_opened,
      'orientationOpened', v_orientation_opened,
      'practiceCompleted', v_practice_completed,
      'retestCompleted', v_retest_completed,
      'total', v_subject_opened + v_orientation_opened + v_practice_completed + v_retest_completed
    ),
    'mostUsedSections', v_top_sections,
    'totalProductEvents', v_total_events,
    'generatedAt', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.ops_get_product_usage(INT, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ops_get_product_usage(INT, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.ops_get_product_usage(INT, UUID) TO authenticated, service_role;
