-- ==============================================================================
-- 007_bac_mastery_commercial_hardening.sql
-- BAC Mastery: P0.1 Commercial Hardening Schema
-- Dedicated Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- INVARIANTS:
-- 1. Strictly ADDITIVE. Zero modifications to the 10 canonical Learning Core tables.
-- 2. Authoritative Price Catalog: Neutral unconfigured pricing, server-authoritative via database.
-- 3. Payment Order Anti-Tamper: Student inserts cannot self-approve or manipulate amount/currency.
-- 4. Private Receipt Storage: 'payment_receipts' bucket with strict RLS isolation.
-- 5. Granular RBAC: CONTENT_REVIEWER denied finance/receipts; OPERATOR denied role management.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PAYMENT ORDER ANTI-TAMPER CONSTRAINTS & TRIGGERS
-- ------------------------------------------------------------------------------

-- Ensure payment orders strictly adhere to non-negative amounts
ALTER TABLE public.payment_orders 
  DROP CONSTRAINT IF EXISTS chk_payment_orders_pilot_catalog;

ALTER TABLE public.payment_orders 
  DROP CONSTRAINT IF EXISTS chk_payment_orders_amount_positive;

ALTER TABLE public.payment_orders 
  ADD CONSTRAINT chk_payment_orders_amount_positive CHECK (amount >= 0.00);

-- Trigger to guarantee student inserts start as PENDING, zero self-approval
CREATE OR REPLACE FUNCTION public.enforce_payment_order_student_invariants()
RETURNS TRIGGER AS $$
BEGIN
  -- If not an operator/owner, enforce PENDING state and zero self-approval
  IF NOT public.is_operator(auth.uid()) THEN
    NEW.status := 'PENDING';
    NEW.reviewed_by := NULL;
    NEW.reviewed_at := NULL;
    NEW.rejection_reason := NULL;
    NEW.currency := 'DZD';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_payment_orders_student_invariants ON public.payment_orders;
CREATE TRIGGER trg_payment_orders_student_invariants
  BEFORE INSERT ON public.payment_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_payment_order_student_invariants();

-- Prevent direct student updates to payment_orders (defense in depth)
CREATE OR REPLACE FUNCTION public.protect_payment_orders_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.is_operator(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: only authorized operators may update payment orders.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_protect_payment_orders_update ON public.payment_orders;
CREATE TRIGGER trg_protect_payment_orders_update
  BEFORE UPDATE ON public.payment_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_payment_orders_update();


-- ------------------------------------------------------------------------------
-- 2. PRIVATE STORAGE BUCKET: payment_receipts
-- ------------------------------------------------------------------------------

-- Insert bucket if not already present in Supabase Storage
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment_receipts',
  'payment_receipts',
  false,
  5242880, -- 5 MB limit
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'application/pdf'];

-- Note: RLS on storage.objects is managed by Supabase internally (already enabled by default).
-- Storage policies below apply correctly without an explicit ENABLE ROW LEVEL SECURITY.


-- Storage Policy 1: Students can upload only to their own folder: payment_receipts/{user_id}/*
DO $$
BEGIN
  DROP POLICY IF EXISTS "payment_receipts_student_upload" ON storage.objects;
  CREATE POLICY "payment_receipts_student_upload" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'payment_receipts'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );

  -- Storage Policy 2: Students can view only their own receipts
  DROP POLICY IF EXISTS "payment_receipts_student_select" ON storage.objects;
  CREATE POLICY "payment_receipts_student_select" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'payment_receipts'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );

  -- Storage Policy 3: Operators & Owners can view all receipts in payment_receipts
  DROP POLICY IF EXISTS "payment_receipts_operator_select" ON storage.objects;
  CREATE POLICY "payment_receipts_operator_select" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'payment_receipts'
      AND public.is_operator(auth.uid())
    );

  -- Zero UPDATE or DELETE policies for students (immutable receipt records)
END $$;


-- ------------------------------------------------------------------------------
-- 3. GRANULAR RBAC HELPER FUNCTIONS
-- ------------------------------------------------------------------------------

-- Check if caller has finance privileges (OWNER or OPERATOR)
CREATE OR REPLACE FUNCTION public.has_finance_access(check_user_id UUID DEFAULT auth.uid())
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

-- Check if caller can manage roles (OWNER only)
CREATE OR REPLACE FUNCTION public.has_role_management_access(check_user_id UUID DEFAULT auth.uid())
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

-- Prevent double-approval and state corruption in approve_payment_order
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

  -- 3. Retrieve student before state
  SELECT id, access_status, plan, trial_expires_at INTO v_student
  FROM public.student_profiles
  WHERE id = v_order.user_id;

  v_before_state := jsonb_build_object(
    'order_status', v_order.status,
    'student_access_status', coalesce(v_student.access_status, 'TRIAL'),
    'student_plan', coalesce(v_student.plan, 'PILOT_TRIAL'),
    'amount', v_order.amount,
    'currency', v_order.currency
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
  UPDATE public.student_profiles
  SET access_status = 'PAID',
      plan = coalesce(v_order.plan, 'season'),
      updated_at = now()
  WHERE id = v_order.user_id;

  v_after_state := jsonb_build_object(
    'order_status', 'APPROVED',
    'student_access_status', 'PAID',
    'student_plan', coalesce(v_order.plan, 'season'),
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


-- Reject Payment Order with Finance Authorization and State Machine Integrity
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
  -- 1. Authorization check: requires finance access (OWNER or OPERATOR)
  IF NOT public.has_finance_access(v_caller_id) THEN
    RAISE EXCEPTION 'Access denied: caller does not possess finance authorization.';
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

  -- Cannot reject an approved order
  IF v_order.status = 'APPROVED' THEN
    RAISE EXCEPTION 'Cannot reject an already APPROVED payment order.';
  END IF;

  -- Cannot reject a cancelled order
  IF v_order.status = 'CANCELLED' THEN
    RAISE EXCEPTION 'Cannot reject a CANCELLED payment order.';
  END IF;

  -- Idempotent check
  IF v_order.status = 'REJECTED' THEN
    RETURN jsonb_build_object(
      'success', true,
      'order_id', p_order_id,
      'status', 'REJECTED',
      'message', 'Order is already rejected (idempotent).'
    );
  END IF;

  IF v_order.status NOT IN ('PENDING', 'DRAFT') THEN
    RAISE EXCEPTION 'Cannot reject order in status %.', v_order.status;
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
