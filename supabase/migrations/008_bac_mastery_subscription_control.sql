-- ==============================================================================
-- 008_bac_mastery_subscription_control.sql
-- BAC Mastery: P0.2 Simple Manual Subscription Control Schema
-- Dedicated Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- INVARIANTS:
-- 1. Strictly ADDITIVE. Zero modifications to the 10 canonical Learning Core tables.
-- 2. No hardcoded pricing in code or SQL constraints: prices and durations are dynamic.
-- 3. Two plans only: 'season' (Pass Saison BAC) and 'monthly' (Pass Mensuel).
-- 4. Server-enforced automatic expiration based on subscription_expires_at.
-- 5. Closing a plan blocks new purchases, but does not cancel existing subscriptions.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SUBSCRIPTION PLANS CONFIGURATION TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_dzd NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  duration_months INT NOT NULL DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_subscription_plans_id CHECK (id IN ('season', 'monthly'))
);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(active);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Everyone can read active plans; operators can read all plans
  DROP POLICY IF EXISTS "subscription_plans_select" ON public.subscription_plans;
  CREATE POLICY "subscription_plans_select" ON public.subscription_plans
    FOR SELECT USING (
      active = true OR public.is_operator(auth.uid())
    );

  -- Only authorized operators/owners can modify subscription plans
  DROP POLICY IF EXISTS "subscription_plans_operator_write" ON public.subscription_plans;
  CREATE POLICY "subscription_plans_operator_write" ON public.subscription_plans
    FOR ALL USING (
      public.has_finance_access(auth.uid())
    ) WITH CHECK (
      public.has_finance_access(auth.uid())
    );
END $$;

-- Seed the two canonical plans (initial operator defaults, fully editable)
INSERT INTO public.subscription_plans (id, name, price_dzd, duration_months, active)
VALUES
  ('season', 'اشتراك الموسم الدراسي', 3900.00, 10, true),
  ('monthly', 'الاشتراك الشهري', 1500.00, 1, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name;


-- ------------------------------------------------------------------------------
-- 2. STUDENT PROFILES EXTENSIONS FOR DYNAMIC SUBSCRIPTIONS
-- ------------------------------------------------------------------------------

ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_student_profiles_sub_expires ON public.student_profiles(subscription_expires_at);

-- Drop old hardcoded pricing constraint on payment_orders
ALTER TABLE public.payment_orders 
  DROP CONSTRAINT IF EXISTS chk_payment_orders_pilot_catalog;

-- Ensure payment orders reference valid non-negative amounts and dynamic plans
ALTER TABLE public.payment_orders
  DROP CONSTRAINT IF EXISTS chk_payment_orders_amount_positive;

ALTER TABLE public.payment_orders
  ADD CONSTRAINT chk_payment_orders_amount_positive CHECK (amount >= 0.00);


-- ------------------------------------------------------------------------------
-- 3. DYNAMIC ATOMIC PAYMENT APPROVAL & SUBSCRIPTION ACTIVATION
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.approve_payment_order(
  p_order_id UUID,
  p_reason TEXT DEFAULT 'Payment verified by operator'
)
RETURNS JSONB AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_order RECORD;
  v_student RECORD;
  v_plan RECORD;
  v_duration_months INT := 1;
  v_new_expires_at TIMESTAMPTZ;
  v_before_state JSONB;
  v_after_state JSONB;
BEGIN
  -- 1. Authorization check: requires finance access (OWNER or OPERATOR)
  IF NOT public.has_finance_access(v_caller_id) THEN
    RAISE EXCEPTION 'Access denied: caller does not possess finance authorization.';
  END IF;

  -- 2. Lock and retrieve payment order
  SELECT * INTO v_order
  FROM public.payment_orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment order % not found.', p_order_id;
  END IF;

  -- Idempotency: If already approved, return success without duplicating audit logs
  IF v_order.status = 'APPROVED' THEN
    RETURN jsonb_build_object(
      'success', true,
      'order_id', p_order_id,
      'status', 'APPROVED',
      'message', 'Order is already approved (idempotent).'
    );
  END IF;

  IF v_order.status NOT IN ('PENDING', 'DRAFT') THEN
    RAISE EXCEPTION 'Cannot approve order in status %.', v_order.status;
  END IF;

  -- 3. Fetch plan configuration dynamically from database
  SELECT * INTO v_plan
  FROM public.subscription_plans
  WHERE id = v_order.plan;

  IF FOUND THEN
    v_duration_months := coalesce(v_plan.duration_months, 1);
  ELSE
    -- Default fallback if plan record missing
    IF v_order.plan = 'monthly' THEN
      v_duration_months := 1;
    ELSE
      v_duration_months := 10;
    END IF;
  END IF;

  v_new_expires_at := now() + (v_duration_months || ' months')::interval;

  -- 4. Retrieve student before state
  SELECT id, access_status, plan, trial_expires_at, subscription_expires_at INTO v_student
  FROM public.student_profiles
  WHERE id = v_order.user_id;

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

  -- 6. Elevate student access state authoritatively with dynamic expiration
  UPDATE public.student_profiles
  SET access_status = 'PAID',
      plan = v_order.plan,
      subscription_started_at = now(),
      subscription_expires_at = v_new_expires_at,
      updated_at = now()
  WHERE id = v_order.user_id;

  v_after_state := jsonb_build_object(
    'order_status', 'APPROVED',
    'student_access_status', 'PAID',
    'student_plan', v_order.plan,
    'subscription_started_at', now(),
    'subscription_expires_at', v_new_expires_at,
    'reviewed_by', v_caller_id,
    'reviewed_at', now()
  );

  -- 7. Write to immutable operations audit log
  INSERT INTO public.operations_audit_logs (
    actor_user_id,
    actor_role,
    action,
    target_type,
    target_id,
    reason,
    before_state,
    after_state
  ) VALUES (
    v_caller_id,
    CASE WHEN public.is_owner(v_caller_id) THEN 'OWNER' ELSE 'OPERATOR' END,
    'SUBSCRIPTION_APPROVED',
    'payment_order',
    p_order_id::text,
    p_reason,
    v_before_state,
    v_after_state
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'user_id', v_order.user_id,
    'status', 'APPROVED',
    'subscription_expires_at', v_new_expires_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
