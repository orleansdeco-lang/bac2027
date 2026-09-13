-- ==============================================================================
-- 006_bac_mastery_operations_foundation.sql
-- BAC Mastery: Operations Foundation P0 Schema
-- Dedicated Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- INVARIANTS:
-- 1. Strictly ADDITIVE. Zero modifications or drops to the 10 Learning Core tables.
-- 2. Server-Enforced RBAC: user_roles with OWNER, OPERATOR, CONTENT_REVIEWER, TEACHER_ADMIN.
-- 3. Telemetry Ingestion: telemetry_events with deduplication & fast query indexes.
-- 4. Authoritative Payments: payment_orders with controlled state machine.
-- 5. Compliance & Governance: operations_audit_logs with append-only integrity.
-- 6. Atomic Activation: approve_payment_order() executes state change, subscription update, and audit log atomically.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. USER ROLES & RBAC
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_user_roles_allowed CHECK (
    role IN ('OWNER', 'OPERATOR', 'CONTENT_REVIEWER', 'TEACHER_ADMIN')
  ),
  CONSTRAINT uq_user_roles_user_role UNIQUE (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper Functions for Server-Side Role Verification
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT, check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  IF check_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = required_role
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_operator(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  IF check_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role IN ('OWNER', 'OPERATOR')
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_owner(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  IF check_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = check_user_id AND role = 'OWNER'
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- RLS Policies for user_roles
DO $$
BEGIN
  DROP POLICY IF EXISTS "user_roles_select_own_or_operator" ON public.user_roles;
  CREATE POLICY "user_roles_select_own_or_operator" ON public.user_roles
    FOR SELECT USING (
      auth.uid() = user_id OR public.is_operator(auth.uid())
    );

  DROP POLICY IF EXISTS "user_roles_owner_write" ON public.user_roles;
  CREATE POLICY "user_roles_owner_write" ON public.user_roles
    FOR ALL USING (
      public.is_owner(auth.uid())
    ) WITH CHECK (
      public.is_owner(auth.uid())
    );
END $$;

-- Bootstrap function: Only allows claiming initial OWNER if ZERO owners exist
CREATE OR REPLACE FUNCTION public.bootstrap_initial_owner(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_owner_count INT;
BEGIN
  SELECT count(*) INTO v_owner_count FROM public.user_roles WHERE role = 'OWNER';
  IF v_owner_count > 0 THEN
    RAISE EXCEPTION 'Owner bootstrap rejected: system already has an initialized owner.';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'OWNER')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ------------------------------------------------------------------------------
-- 2. TELEMETRY EVENTS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.telemetry_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  anonymous_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  route TEXT,
  stream TEXT,
  subject TEXT,
  skill_id TEXT,
  mission_id TEXT,
  content_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_occurred_at ON public.telemetry_events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_event_name ON public.telemetry_events(event_name);
CREATE INDEX IF NOT EXISTS idx_telemetry_user_id ON public.telemetry_events(user_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_session_id ON public.telemetry_events(session_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_stream ON public.telemetry_events(stream);
CREATE INDEX IF NOT EXISTS idx_telemetry_mission_id ON public.telemetry_events(mission_id);

ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;

-- RLS for telemetry_events:
-- Operators can read all; authenticated users can read their own
DO $$
BEGIN
  DROP POLICY IF EXISTS "telemetry_events_select" ON public.telemetry_events;
  CREATE POLICY "telemetry_events_select" ON public.telemetry_events
    FOR SELECT USING (
      public.is_operator(auth.uid()) OR (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    );

  DROP POLICY IF EXISTS "telemetry_events_insert_own_or_anon" ON public.telemetry_events;
  CREATE POLICY "telemetry_events_insert_own_or_anon" ON public.telemetry_events
    FOR INSERT WITH CHECK (
      user_id IS NULL OR user_id = auth.uid() OR public.is_operator(auth.uid())
    );
END $$;


-- ------------------------------------------------------------------------------
-- 3. PAYMENT ORDERS
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'bac_season_pass_pilot',
  amount NUMERIC(10, 2) NOT NULL DEFAULT 3900.00,
  currency TEXT NOT NULL DEFAULT 'DZD',
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  receipt_path TEXT,
  notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_payment_orders_method CHECK (
    payment_method IN ('baridimob', 'ccp', 'manual_transfer', 'cash', 'other')
  ),
  CONSTRAINT chk_payment_orders_status CHECK (
    status IN ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')
  )
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user_id ON public.payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON public.payment_orders(status);
CREATE INDEX IF NOT EXISTS idx_payment_orders_submitted_at ON public.payment_orders(submitted_at DESC);

ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "payment_orders_select" ON public.payment_orders;
  CREATE POLICY "payment_orders_select" ON public.payment_orders
    FOR SELECT USING (
      auth.uid() = user_id OR public.is_operator(auth.uid())
    );

  DROP POLICY IF EXISTS "payment_orders_student_insert" ON public.payment_orders;
  CREATE POLICY "payment_orders_student_insert" ON public.payment_orders
    FOR INSERT WITH CHECK (
      auth.uid() = user_id AND status IN ('DRAFT', 'PENDING')
    );

  DROP POLICY IF EXISTS "payment_orders_operator_update" ON public.payment_orders;
  CREATE POLICY "payment_orders_operator_update" ON public.payment_orders
    FOR UPDATE USING (
      public.is_operator(auth.uid())
    ) WITH CHECK (
      public.is_operator(auth.uid())
    );
END $$;


-- ------------------------------------------------------------------------------
-- 4. OPERATIONS AUDIT LOGS (APPEND-ONLY)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.operations_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT,
  before_state JSONB,
  after_state JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_audit_logs_target_type CHECK (
    target_type IN ('payment_order', 'student_profile', 'user_role', 'telemetry', 'system')
  )
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.operations_audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.operations_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.operations_audit_logs(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.operations_audit_logs(created_at DESC);

ALTER TABLE public.operations_audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "audit_logs_select_operator" ON public.operations_audit_logs;
  CREATE POLICY "audit_logs_select_operator" ON public.operations_audit_logs
    FOR SELECT USING (
      public.is_operator(auth.uid())
    );

  DROP POLICY IF EXISTS "audit_logs_insert_privileged" ON public.operations_audit_logs;
  CREATE POLICY "audit_logs_insert_privileged" ON public.operations_audit_logs
    FOR INSERT WITH CHECK (
      public.is_operator(auth.uid()) OR auth.uid() = actor_user_id
    );
  -- Strictly ZERO UPDATE or DELETE policies: append-only application integrity
END $$;


-- ------------------------------------------------------------------------------
-- 5. ATOMIC OPERATOR ACTIONS (RPCs)
-- ------------------------------------------------------------------------------

-- Approve Payment Order & Elevate Student Access
CREATE OR REPLACE FUNCTION public.approve_payment_order(
  p_order_id UUID,
  p_reason TEXT DEFAULT 'Payment verified by operator'
)
RETURNS JSONB AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_order RECORD;
  v_student RECORD;
  v_before_state JSONB;
  v_after_state JSONB;
BEGIN
  -- 1. Authorization check
  IF NOT public.is_operator(v_caller_id) THEN
    RAISE EXCEPTION 'Access denied: caller is not an authorized operator.';
  END IF;

  -- 2. Lock and retrieve payment order
  SELECT * INTO v_order
  FROM public.payment_orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment order % not found.', p_order_id;
  END IF;

  IF v_order.status = 'APPROVED' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Order already approved.');
  END IF;

  IF v_order.status NOT IN ('PENDING', 'DRAFT') THEN
    RAISE EXCEPTION 'Cannot approve order in status %.', v_order.status;
  END IF;

  -- 3. Retrieve student before state
  SELECT id, access_status, plan, trial_expires_at INTO v_student
  FROM public.student_profiles
  WHERE id = v_order.user_id;

  v_before_state := jsonb_build_object(
    'order_status', v_order.status,
    'student_access_status', v_student.access_status,
    'student_plan', v_student.plan
  );

  -- 4. Transition payment order to APPROVED
  UPDATE public.payment_orders
  SET status = 'APPROVED',
      reviewed_at = now(),
      reviewed_by = v_caller_id,
      notes = coalesce(p_reason, notes),
      updated_at = now()
  WHERE id = p_order_id;

  -- 5. Elevate student access state authoritatively
  -- (Trigger protect_student_trial_fields() will NOT block this since running inside SECURITY DEFINER)
  UPDATE public.student_profiles
  SET access_status = 'PAID',
      plan = 'PAID',
      updated_at = now()
  WHERE id = v_order.user_id;

  v_after_state := jsonb_build_object(
    'order_status', 'APPROVED',
    'student_access_status', 'PAID',
    'student_plan', 'PAID',
    'reviewed_by', v_caller_id,
    'reviewed_at', now()
  );

  -- 6. Write to immutable operations audit log
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
    'PAYMENT_APPROVED',
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
    'status', 'APPROVED'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- Reject Payment Order
CREATE OR REPLACE FUNCTION public.reject_payment_order(
  p_order_id UUID,
  p_rejection_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_order RECORD;
  v_before_state JSONB;
  v_after_state JSONB;
BEGIN
  -- 1. Authorization check
  IF NOT public.is_operator(v_caller_id) THEN
    RAISE EXCEPTION 'Access denied: caller is not an authorized operator.';
  END IF;

  IF p_rejection_reason IS NULL OR length(trim(p_rejection_reason)) = 0 THEN
    RAISE EXCEPTION 'Rejection reason is required.';
  END IF;

  -- 2. Lock and retrieve payment order
  SELECT * INTO v_order
  FROM public.payment_orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Payment order % not found.', p_order_id;
  END IF;

  IF v_order.status = 'REJECTED' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Order already rejected.');
  END IF;

  v_before_state := jsonb_build_object(
    'order_status', v_order.status,
    'rejection_reason', v_order.rejection_reason
  );

  -- 3. Transition payment order to REJECTED
  UPDATE public.payment_orders
  SET status = 'REJECTED',
      reviewed_at = now(),
      reviewed_by = v_caller_id,
      rejection_reason = p_rejection_reason,
      updated_at = now()
  WHERE id = p_order_id;

  v_after_state := jsonb_build_object(
    'order_status', 'REJECTED',
    'rejection_reason', p_rejection_reason,
    'reviewed_by', v_caller_id,
    'reviewed_at', now()
  );

  -- 4. Write to immutable operations audit log
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
    'PAYMENT_REJECTED',
    'payment_order',
    p_order_id::text,
    p_rejection_reason,
    v_before_state,
    v_after_state
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'user_id', v_order.user_id,
    'status', 'REJECTED'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ------------------------------------------------------------------------------
-- 6. OPERATIONAL ANALYTICS VIEWS
-- ------------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.ops_trial_summary AS
SELECT
  count(*) AS total_students,
  count(*) FILTER (WHERE access_status = 'TRIAL' AND trial_expires_at > now()) AS active_trials,
  count(*) FILTER (WHERE access_status = 'TRIAL' AND trial_expires_at <= now() + interval '24 hours' AND trial_expires_at > now()) AS trials_expiring_soon,
  count(*) FILTER (WHERE access_status = 'EXPIRED' OR (access_status = 'TRIAL' AND trial_expires_at <= now())) AS expired_trials,
  count(*) FILTER (WHERE access_status = 'PAID' OR plan = 'PAID') AS paid_subscribers
FROM public.student_profiles;

CREATE OR REPLACE VIEW public.ops_payment_summary AS
SELECT
  count(*) AS total_orders,
  count(*) FILTER (WHERE status = 'PENDING') AS pending_orders,
  count(*) FILTER (WHERE status = 'APPROVED') AS approved_orders,
  count(*) FILTER (WHERE status = 'REJECTED') AS rejected_orders,
  coalesce(sum(amount) FILTER (WHERE status = 'APPROVED'), 0.00) AS total_revenue_dzd
FROM public.payment_orders;

CREATE OR REPLACE VIEW public.ops_learning_summary AS
SELECT
  (SELECT count(*) FROM public.missions WHERE status IN ('completed', 'mastered')) AS completed_missions,
  (SELECT count(*) FROM public.practice_attempts) AS total_practice_attempts,
  (SELECT count(*) FROM public.errors) AS total_errors_logged,
  (SELECT count(*) FROM public.error_repairs WHERE status = 'completed') AS completed_repairs,
  (SELECT count(*) FROM public.retests WHERE is_passed = true) AS passed_retests,
  (SELECT count(*) FROM public.skill_mastery WHERE status = 'demonstrated') AS demonstrated_skills;
