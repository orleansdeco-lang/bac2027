-- ==============================================================================
-- 023_phase1_security_and_authoritative_persistence.sql
-- SHATER BAC: Phase 1 Authoritative Persistence, Subscriptions & Security Hardening
-- Dedicated Supabase Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- INVARIANTS:
-- 1. Strictly additive and non-destructive: zero DROPs of production user tables or columns.
-- 2. PostgreSQL is the SOLE single source of truth for payment, subscription, and access states.
-- 3. Atomic execution: payment order approval, subscription creation, student elevation,
--    and audit logging execute inside a single atomic transaction.
-- 4. Zero hardcoded bypasses: all role checks resolve strictly through public.user_roles.
-- 5. Strict RLS hardening: custom_exams and operations views are locked down against anon.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CANONICAL SUBSCRIPTIONS TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.payment_orders(id) ON DELETE SET NULL,
  plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  activated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_subscriptions_status CHECK (
    status IN ('ACTIVE', 'EXPIRED', 'CANCELLED', 'SUSPENDED')
  )
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_student_id ON public.subscriptions(student_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_order_id ON public.subscriptions(order_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_expires ON public.subscriptions(status, expires_at);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "subscriptions_student_select" ON public.subscriptions;
  CREATE POLICY "subscriptions_student_select" ON public.subscriptions
    FOR SELECT USING (
      auth.uid() = student_id OR public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    );

  DROP POLICY IF EXISTS "subscriptions_operator_write" ON public.subscriptions;
  CREATE POLICY "subscriptions_operator_write" ON public.subscriptions
    FOR ALL USING (
      public.has_finance_access(auth.uid()) OR auth.role() = 'service_role'
    ) WITH CHECK (
      public.has_finance_access(auth.uid()) OR auth.role() = 'service_role'
    );
END $$;

GRANT ALL ON public.subscriptions TO service_role;
GRANT SELECT ON public.subscriptions TO authenticated;


-- ------------------------------------------------------------------------------
-- 2. SEED & ACTIVATE CANONICAL SUBSCRIPTION PLANS
-- ------------------------------------------------------------------------------

INSERT INTO public.subscription_plans (id, name, price_dzd, duration_months, active, updated_at)
VALUES
  ('season', 'اشتراك الموسم الدراسي', 4900.00, 10, true, now()),
  ('monthly', 'الاشتراك الشهري', 900.00, 1, true, now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_dzd = EXCLUDED.price_dzd,
  duration_months = EXCLUDED.duration_months,
  active = EXCLUDED.active,
  updated_at = now();

-- Ensure payment_orders.user_id allows NULL for prospective Cash on Delivery orders
ALTER TABLE public.payment_orders ALTER COLUMN user_id DROP NOT NULL;


-- ------------------------------------------------------------------------------
-- 3. ATOMIC AUTHORITATIVE APPROVAL RPC (TRANSACTIONAL)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.admin_authoritative_approve_order(
  p_order_id UUID,
  p_operator_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT 'Payment verified by authorized operator'
)
RETURNS JSONB AS $$
DECLARE
  v_caller_id UUID := coalesce(auth.uid(), p_operator_id);
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
  -- 1. Authorization Verification: caller MUST be finance authorized OR service_role
  IF NOT v_is_service_role THEN
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

-- Keep backward compatibility for approve_payment_order
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
-- 4. HARDEN CUSTOM_EXAMS RLS (REMOVE WIDE-OPEN WITH CHECK(true))
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  DROP POLICY IF EXISTS "Operators and service role can insert custom exams" ON public.custom_exams;
  CREATE POLICY "Operators and service role can insert custom exams"
    ON public.custom_exams
    FOR INSERT
    WITH CHECK (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    );

  DROP POLICY IF EXISTS "Operators and service role can update custom exams" ON public.custom_exams;
  CREATE POLICY "Operators and service role can update custom exams"
    ON public.custom_exams
    FOR UPDATE
    USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    )
    WITH CHECK (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    );

  DROP POLICY IF EXISTS "Operators and service role can delete custom exams" ON public.custom_exams;
  CREATE POLICY "Operators and service role can delete custom exams"
    ON public.custom_exams
    FOR DELETE
    USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    );
END $$;


-- ------------------------------------------------------------------------------
-- 5. REMOVE HARDCODED ADMIN BACKDOOR FROM COCKPIT KPIS
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ops_get_cockpit_kpis(p_operator_id UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
DECLARE
  v_is_authorized BOOLEAN;
  v_result JSONB;
BEGIN
  -- Strict server-side RBAC check
  IF auth.role() = 'service_role' THEN
    v_is_authorized := TRUE;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = p_operator_id 
        AND role IN ('OWNER', 'OPERATOR')
    ) INTO v_is_authorized;
  END IF;

  IF NOT v_is_authorized THEN
    RAISE EXCEPTION 'Access Denied: Caller does not possess OPERATOR or OWNER privileges.';
  END IF;

  SELECT jsonb_build_object(
    'generated_at', now(),
    'funnel', jsonb_build_object(
      'total_signups', (
        SELECT count(*) FROM public.student_profiles
        WHERE id NOT IN (SELECT user_id FROM public.user_roles WHERE role IN ('OWNER', 'OPERATOR'))
      ),
      'active_trials', (
        SELECT count(*) FROM public.student_profiles
        WHERE access_status = 'TRIAL' 
          AND trial_expires_at > now()
      ),
      'expired_trials', (
        SELECT count(*) FROM public.student_profiles
        WHERE access_status = 'EXPIRED' 
           OR (access_status = 'TRIAL' AND trial_expires_at <= now())
      ),
      'paid_subscribers', (
        SELECT count(*) FROM public.student_profiles
        WHERE access_status = 'PAID' OR plan = 'PAID'
      )
    ),
    'revenue', jsonb_build_object(
      'total_revenue_dzd', (
        SELECT coalesce(sum(amount), 0.00) 
        FROM public.payment_orders 
        WHERE status = 'APPROVED'
      ),
      'pending_revenue_dzd', (
        SELECT coalesce(sum(amount), 0.00) 
        FROM public.payment_orders 
        WHERE status = 'PENDING'
      ),
      'approved_orders_count', (
        SELECT count(*) 
        FROM public.payment_orders 
        WHERE status = 'APPROVED'
      ),
      'pending_orders_count', (
        SELECT count(*) 
        FROM public.payment_orders 
        WHERE status = 'PENDING'
      ),
      'rejected_orders_count', (
        SELECT count(*) 
        FROM public.payment_orders 
        WHERE status = 'REJECTED'
      )
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

REVOKE ALL ON FUNCTION public.ops_get_cockpit_kpis(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ops_get_cockpit_kpis(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.ops_get_cockpit_kpis(UUID) TO authenticated, service_role;


-- ------------------------------------------------------------------------------
-- 6. RESTRICT FINANCIAL OPERATIONS VIEWS AGAINST ANONYMOUS ACCESS
-- ------------------------------------------------------------------------------

REVOKE ALL ON public.ops_payment_summary FROM PUBLIC;
REVOKE ALL ON public.ops_payment_summary FROM anon;
GRANT SELECT ON public.ops_payment_summary TO authenticated, service_role;

REVOKE ALL ON public.ops_trial_summary FROM PUBLIC;
REVOKE ALL ON public.ops_trial_summary FROM anon;
GRANT SELECT ON public.ops_trial_summary TO authenticated, service_role;

REVOKE ALL ON public.ops_learning_summary FROM PUBLIC;
REVOKE ALL ON public.ops_learning_summary FROM anon;
GRANT SELECT ON public.ops_learning_summary TO authenticated, service_role;


-- ------------------------------------------------------------------------------
-- 7. RECORD SCHEMA MIGRATION VERSION
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'supabase_migrations' AND table_name = 'schema_migrations'
  ) THEN
    INSERT INTO supabase_migrations.schema_migrations (version)
    VALUES ('023')
    ON CONFLICT (version) DO NOTHING;
  END IF;
END $$;
