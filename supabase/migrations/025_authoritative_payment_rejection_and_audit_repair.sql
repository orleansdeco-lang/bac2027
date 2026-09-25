-- ==============================================================================
-- Migration 025: Authoritative Payment Rejection & Audit Log Resilience
-- Fixes: "relation operations_audit_logs does not exist" on payment rejection
-- Adds: admin_authoritative_reject_order RPC with full service_role & operator support
-- Adds: fail-safe audit logging & student profile status synchronization
-- ==============================================================================

-- 1. Ensure operations_audit_logs table exists and is resilient
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
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
      public.is_operator(auth.uid()) OR auth.uid() = actor_user_id OR auth.role() = 'service_role'
    );
END $$;


-- 2. Authoritative Atomic Payment Rejection RPC
CREATE OR REPLACE FUNCTION public.admin_authoritative_reject_order(
  p_order_id UUID,
  p_operator_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT 'Payment rejected by operator'
)
RETURNS JSONB AS $$
DECLARE
  v_caller_id UUID := coalesce(auth.uid(), p_operator_id);
  v_is_service_role BOOLEAN := (auth.role() = 'service_role');
  v_order RECORD;
  v_before_state JSONB;
  v_after_state JSONB;
BEGIN
  -- Authorization check: caller MUST be finance authorized OR service_role
  IF NOT v_is_service_role THEN
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
      -- Do not block rejection if student profile column is missing
      NULL;
    END;
  END IF;

  -- Fail-safe write to immutable operations audit log
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
    -- Audit log table anomaly must never block the rejection process
    NULL;
  END;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'user_id', v_order.user_id,
    'status', 'REJECTED'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;


-- 3. Compatibility wrappers for reject_payment_order
CREATE OR REPLACE FUNCTION public.reject_payment_order(
  p_order_id UUID,
  p_reason TEXT DEFAULT 'Payment rejected by operator'
)
RETURNS JSONB AS $$
BEGIN
  RETURN public.admin_authoritative_reject_order(
    p_order_id,
    auth.uid(),
    p_reason
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.reject_payment_order(
  p_order_id UUID,
  p_rejection_reason TEXT
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


-- 4. Permissions
REVOKE ALL ON FUNCTION public.admin_authoritative_reject_order(UUID, UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_authoritative_reject_order(UUID, UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_authoritative_reject_order(UUID, UUID, TEXT) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.reject_payment_order(UUID, TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reject_payment_order(UUID, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.reject_payment_order(UUID, TEXT) TO authenticated, service_role;
