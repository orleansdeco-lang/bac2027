-- ==============================================================================
-- 020_shater_trial_cod_and_referral_v1.sql
-- SHATER BAC: 7-Day Free Trial, COD Orders, Vouchers & Referral System V1
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTEND STUDENT PROFILES FOR 7-DAY TRIAL & REFERRALS
-- ------------------------------------------------------------------------------

-- Update default trial expiration to 7 days (168 hours)
ALTER TABLE public.student_profiles
  ALTER COLUMN trial_expires_at SET DEFAULT (now() + interval '7 days');

-- Add referral fields and credit balance
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by_code TEXT,
  ADD COLUMN IF NOT EXISTS credit_balance_dzd NUMERIC(10, 2) NOT NULL DEFAULT 0.00;

CREATE INDEX IF NOT EXISTS idx_student_profiles_referral_code ON public.student_profiles(referral_code);

-- Update protection trigger to preserve authoritative 7-day trial fields and credit
CREATE OR REPLACE FUNCTION public.protect_student_trial_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If invoked by an authenticated student (client role), preserve authoritative server values
  IF (auth.role() = 'authenticated' AND NOT public.is_operator(auth.uid())) THEN
    -- Student cannot change trial_started_at
    IF (OLD.trial_started_at IS DISTINCT FROM NEW.trial_started_at) THEN
      NEW.trial_started_at := OLD.trial_started_at;
    END IF;

    -- Student cannot extend trial_expires_at
    IF (OLD.trial_expires_at IS DISTINCT FROM NEW.trial_expires_at) THEN
      NEW.trial_expires_at := OLD.trial_expires_at;
    END IF;

    -- Student cannot self-elevate to PAID or modify access_status
    IF (OLD.access_status IS DISTINCT FROM NEW.access_status) THEN
      NEW.access_status := OLD.access_status;
    END IF;

    -- Student cannot self-elevate or modify plan
    IF (OLD.plan IS DISTINCT FROM NEW.plan) THEN
      NEW.plan := OLD.plan;
    END IF;

    -- Student cannot modify subscription timestamps
    IF (OLD.subscription_started_at IS DISTINCT FROM NEW.subscription_started_at) THEN
      NEW.subscription_started_at := OLD.subscription_started_at;
    END IF;

    IF (OLD.subscription_expires_at IS DISTINCT FROM NEW.subscription_expires_at) THEN
      NEW.subscription_expires_at := OLD.subscription_expires_at;
    END IF;

    -- Student cannot alter credit balance directly
    IF (OLD.credit_balance_dzd IS DISTINCT FROM NEW.credit_balance_dzd) THEN
      NEW.credit_balance_dzd := OLD.credit_balance_dzd;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ------------------------------------------------------------------------------
-- 2. EXTEND PAYMENT ORDERS FOR CASH ON DELIVERY (COD)
-- ------------------------------------------------------------------------------

-- Allow 'cod' and 'shater_pass_cod' in payment_method
ALTER TABLE public.payment_orders 
  DROP CONSTRAINT IF EXISTS chk_payment_orders_method;

ALTER TABLE public.payment_orders 
  ADD CONSTRAINT chk_payment_orders_method CHECK (
    payment_method IN ('baridimob', 'ccp', 'manual_transfer', 'cash', 'cod', 'shater_pass_cod', 'other')
  );

-- Add shipping details for Cash on Delivery
ALTER TABLE public.payment_orders
  ADD COLUMN IF NOT EXISTS order_type TEXT NOT NULL DEFAULT 'ONLINE' CHECK (order_type IN ('ONLINE', 'COD')),
  ADD COLUMN IF NOT EXISTS shipping_name TEXT,
  ADD COLUMN IF NOT EXISTS shipping_phone TEXT,
  ADD COLUMN IF NOT EXISTS shipping_wilaya TEXT,
  ADD COLUMN IF NOT EXISTS shipping_commune TEXT,
  ADD COLUMN IF NOT EXISTS shipping_address TEXT,
  ADD COLUMN IF NOT EXISTS delivery_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    delivery_status IN ('PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED')
  ),
  ADD COLUMN IF NOT EXISTS tracking_number TEXT;


-- ------------------------------------------------------------------------------
-- 3. SHATER PASS VOUCHERS (CARDS & CODES)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.shater_pass_vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash TEXT NOT NULL UNIQUE,
  code_prefix TEXT NOT NULL, -- e.g. 'SHTR-9421-****' for admin identification
  plan_id TEXT NOT NULL DEFAULT 'season' REFERENCES public.subscription_plans(id),
  value_dzd NUMERIC(10, 2) NOT NULL DEFAULT 4900.00,
  status TEXT NOT NULL DEFAULT 'UNASSIGNED' CHECK (
    status IN ('UNASSIGNED', 'ASSIGNED', 'SOLD', 'DELIVERED', 'ACTIVATED', 'EXPIRED', 'CANCELLED')
  ),
  sales_channel TEXT NOT NULL DEFAULT 'COD' CHECK (
    sales_channel IN ('COD', 'ONLINE', 'LIBRARY', 'RESELLER')
  ),
  order_id UUID REFERENCES public.payment_orders(id) ON DELETE SET NULL,
  assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activated_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  batch_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vouchers_status ON public.shater_pass_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_code_hash ON public.shater_pass_vouchers(code_hash);
CREATE INDEX IF NOT EXISTS idx_vouchers_order_id ON public.shater_pass_vouchers(order_id);

ALTER TABLE public.shater_pass_vouchers ENABLE ROW LEVEL SECURITY;

-- Students cannot query vouchers table directly; only via secure redemption RPC
DO $$
BEGIN
  DROP POLICY IF EXISTS "vouchers_operator_all" ON public.shater_pass_vouchers;
  CREATE POLICY "vouchers_operator_all" ON public.shater_pass_vouchers
    FOR ALL USING (
      public.has_finance_access(auth.uid())
    ) WITH CHECK (
      public.has_finance_access(auth.uid())
    );
END $$;


-- ------------------------------------------------------------------------------
-- 4. REFERRALS TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (
    status IN ('PENDING', 'QUALIFIED', 'REWARDED', 'REJECTED', 'CANCELLED')
  ),
  reward_amount_dzd NUMERIC(10, 2) NOT NULL DEFAULT 700.00,
  qualifying_order_id UUID REFERENCES public.payment_orders(id) ON DELETE SET NULL,
  qualified_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_no_self_referral CHECK (referrer_id <> referred_id),
  CONSTRAINT uq_referred_student UNIQUE (referred_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Students can view referrals they originated
  DROP POLICY IF EXISTS "referrals_student_select" ON public.referrals;
  CREATE POLICY "referrals_student_select" ON public.referrals
    FOR SELECT USING (
      referrer_id = auth.uid() OR public.is_operator(auth.uid())
    );

  -- Only operators or system functions can update referral statuses
  DROP POLICY IF EXISTS "referrals_operator_write" ON public.referrals;
  CREATE POLICY "referrals_operator_write" ON public.referrals
    FOR ALL USING (
      public.has_finance_access(auth.uid())
    ) WITH CHECK (
      public.has_finance_access(auth.uid())
    );
END $$;


-- ------------------------------------------------------------------------------
-- 5. CREDIT TRANSACTIONS LEDGER
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_dzd NUMERIC(10, 2) NOT NULL,
  type TEXT NOT NULL CHECK (
    type IN ('REFERRAL_REWARD', 'SUBSCRIPTION_DISCOUNT', 'ADMIN_CREDIT', 'REFUND')
  ),
  status TEXT NOT NULL DEFAULT 'AVAILABLE' CHECK (
    status IN ('PENDING', 'AVAILABLE', 'USED', 'EXPIRED', 'REVERSED')
  ),
  reference_id TEXT, -- e.g. referral_id or order_id
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_status ON public.credit_transactions(status);

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Students can view their own credit ledger
  DROP POLICY IF EXISTS "credit_transactions_student_select" ON public.credit_transactions;
  CREATE POLICY "credit_transactions_student_select" ON public.credit_transactions
    FOR SELECT USING (
      user_id = auth.uid() OR public.is_operator(auth.uid())
    );

  -- Only operators can modify ledger directly
  DROP POLICY IF EXISTS "credit_transactions_operator_write" ON public.credit_transactions;
  CREATE POLICY "credit_transactions_operator_write" ON public.credit_transactions
    FOR ALL USING (
      public.has_finance_access(auth.uid())
    ) WITH CHECK (
      public.has_finance_access(auth.uid())
    );
END $$;


-- ------------------------------------------------------------------------------
-- 6. ATOMIC REFERRAL REWARD PROCESSING FUNCTION
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.process_qualifying_referral(
  p_referred_user_id UUID,
  p_order_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_referral RECORD;
  v_reward NUMERIC(10, 2) := 700.00;
BEGIN
  -- 1. Check if an active PENDING referral exists for this newly subscribed student
  SELECT * INTO v_referral
  FROM public.referrals
  WHERE referred_id = p_referred_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'No referral record found.');
  END IF;

  -- 2. Prevent duplicate reward
  IF v_referral.status IN ('QUALIFIED', 'REWARDED') THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Referral already rewarded.');
  END IF;

  -- 3. Verify Anti-Fraud: Not self-referral
  IF v_referral.referrer_id = p_referred_user_id THEN
    UPDATE public.referrals
    SET status = 'REJECTED',
        rejection_reason = 'Self-referral rejected',
        updated_at = now()
    WHERE id = v_referral.id;
    RETURN jsonb_build_object('success', false, 'reason', 'Self-referral prohibited.');
  END IF;

  -- 4. Mark referral as QUALIFIED and REWARDED
  UPDATE public.referrals
  SET status = 'REWARDED',
      qualifying_order_id = p_order_id,
      qualified_at = now(),
      rewarded_at = now(),
      updated_at = now()
  WHERE id = v_referral.id;

  -- 5. Insert ledger entry for Referrer
  INSERT INTO public.credit_transactions (
    user_id,
    amount_dzd,
    type,
    status,
    reference_id,
    notes
  ) VALUES (
    v_referral.referrer_id,
    v_reward,
    'REFERRAL_REWARD',
    'AVAILABLE',
    v_referral.id::text,
    'مكافأة إحالة طالب جديد اشترك في باقة شاطر'
  );

  -- 6. Update Referrer cached credit balance in profile
  UPDATE public.student_profiles
  SET credit_balance_dzd = coalesce(credit_balance_dzd, 0.00) + v_reward,
      updated_at = now()
  WHERE id = v_referral.referrer_id;

  -- 7. Audit log
  INSERT INTO public.operations_audit_logs (
    actor_user_id,
    actor_role,
    action,
    target_type,
    target_id,
    reason,
    after_state
  ) VALUES (
    v_referral.referrer_id,
    'SYSTEM',
    'REFERRAL_REWARDED',
    'referral',
    v_referral.id::text,
    '700 DA credit awarded for qualified subscription',
    jsonb_build_object(
      'referrer_id', v_referral.referrer_id,
      'referred_id', p_referred_user_id,
      'order_id', p_order_id,
      'reward_amount_dzd', v_reward
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'referral_id', v_referral.id,
    'referrer_id', v_referral.referrer_id,
    'reward_amount', v_reward
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ------------------------------------------------------------------------------
-- 7. ATOMIC COD DELIVERY & CONFIRMATION FUNCTION
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.confirm_cod_order_delivery(
  p_order_id UUID,
  p_notes TEXT DEFAULT 'COD order delivered and cash collected'
)
RETURNS JSONB AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_order RECORD;
  v_student RECORD;
  v_plan RECORD;
  v_duration_months INT := 10;
  v_new_expires_at TIMESTAMPTZ;
  v_referral_res JSONB;
BEGIN
  -- 1. Authorization check: requires finance access (OWNER or OPERATOR)
  IF NOT public.has_finance_access(v_caller_id) THEN
    RAISE EXCEPTION 'Access denied: caller does not possess finance authorization.';
  END IF;

  -- 2. Lock and retrieve COD order
  SELECT * INTO v_order
  FROM public.payment_orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % not found.', p_order_id;
  END IF;

  IF v_order.status = 'APPROVED' AND v_order.delivery_status = 'DELIVERED' THEN
    RETURN jsonb_build_object(
      'success', true,
      'order_id', p_order_id,
      'status', 'APPROVED',
      'message', 'COD order is already delivered and approved (idempotent).'
    );
  END IF;

  -- 3. Calculate expiration based on plan
  SELECT * INTO v_plan
  FROM public.subscription_plans
  WHERE id = v_order.plan;

  IF FOUND THEN
    v_duration_months := coalesce(v_plan.duration_months, 10);
  ELSE
    v_duration_months := CASE WHEN v_order.plan = 'monthly' THEN 1 ELSE 10 END;
  END IF;

  v_new_expires_at := now() + (v_duration_months || ' months')::interval;

  -- 4. Transition order status to APPROVED and DELIVERED
  UPDATE public.payment_orders
  SET status = 'APPROVED',
      delivery_status = 'DELIVERED',
      reviewed_at = now(),
      reviewed_by = v_caller_id,
      notes = coalesce(p_notes, notes),
      updated_at = now()
  WHERE id = p_order_id;

  -- 5. Elevate student access state authoritatively
  UPDATE public.student_profiles
  SET access_status = 'PAID',
      plan = CASE WHEN v_order.plan IN ('season', 'monthly') THEN v_order.plan ELSE 'season' END,
      subscription_started_at = now(),
      subscription_expires_at = v_new_expires_at,
      updated_at = now()
  WHERE id = v_order.user_id;

  -- 6. Check and award referral if applicable
  SELECT public.process_qualifying_referral(v_order.user_id, p_order_id) INTO v_referral_res;

  -- 7. Audit log
  INSERT INTO public.operations_audit_logs (
    actor_user_id,
    actor_role,
    action,
    target_type,
    target_id,
    reason,
    after_state
  ) VALUES (
    v_caller_id,
    CASE WHEN public.is_owner(v_caller_id) THEN 'OWNER' ELSE 'OPERATOR' END,
    'COD_DELIVERED_AND_ACTIVATED',
    'payment_order',
    p_order_id::text,
    p_notes,
    jsonb_build_object(
      'order_id', p_order_id,
      'user_id', v_order.user_id,
      'subscription_expires_at', v_new_expires_at,
      'referral_result', v_referral_res
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'user_id', v_order.user_id,
    'subscription_expires_at', v_new_expires_at,
    'referral_rewarded', v_referral_res->>'success'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ------------------------------------------------------------------------------
-- 8. ATOMIC SHATER PASS VOUCHER REDEMPTION RPC
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.redeem_shater_pass_voucher(
  p_code_hash TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_voucher RECORD;
  v_plan RECORD;
  v_duration_months INT := 10;
  v_new_expires_at TIMESTAMPTZ;
  v_referral_res JSONB;
BEGIN
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to redeem SHATER Pass.';
  END IF;

  -- 1. Lock and find voucher
  SELECT * INTO v_voucher
  FROM public.shater_pass_vouchers
  WHERE code_hash = p_code_hash
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'كود بطاقة شاطر غير صحيح. يرجى التأكد من الرمز المدخل.');
  END IF;

  IF v_voucher.status = 'ACTIVATED' THEN
    RETURN jsonb_build_object('success', false, 'error', 'تم استخدام هذه البطاقة وتفعيلها مسبقاً.');
  END IF;

  IF v_voucher.status IN ('EXPIRED', 'CANCELLED') THEN
    RETURN jsonb_build_object('success', false, 'error', 'هذه البطاقة منتهية الصلاحية أو ملغاة.');
  END IF;

  -- 2. Fetch plan
  SELECT * INTO v_plan
  FROM public.subscription_plans
  WHERE id = v_voucher.plan_id;

  IF FOUND THEN
    v_duration_months := coalesce(v_plan.duration_months, 10);
  END IF;

  v_new_expires_at := now() + (v_duration_months || ' months')::interval;

  -- 3. Mark voucher as ACTIVATED
  UPDATE public.shater_pass_vouchers
  SET status = 'ACTIVATED',
      activated_by_user_id = v_caller_id,
      activated_at = now(),
      updated_at = now()
  WHERE id = v_voucher.id;

  -- 4. Elevate student access state
  UPDATE public.student_profiles
  SET access_status = 'PAID',
      plan = v_voucher.plan_id,
      subscription_started_at = now(),
      subscription_expires_at = v_new_expires_at,
      updated_at = now()
  WHERE id = v_caller_id;

  -- 5. Check and reward referral if any
  SELECT public.process_qualifying_referral(v_caller_id, v_voucher.order_id) INTO v_referral_res;

  -- 6. Audit log
  INSERT INTO public.operations_audit_logs (
    actor_user_id,
    actor_role,
    action,
    target_type,
    target_id,
    reason,
    after_state
  ) VALUES (
    v_caller_id,
    'STUDENT',
    'VOUCHER_ACTIVATED',
    'shater_pass_voucher',
    v_voucher.id::text,
    'Student activated physical SHATER Pass card',
    jsonb_build_object(
      'voucher_id', v_voucher.id,
      'code_prefix', v_voucher.code_prefix,
      'plan', v_voucher.plan_id,
      'subscription_expires_at', v_new_expires_at
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم تفعيل بطاقة شاطر باص بنجاح!',
    'plan', v_voucher.plan_id,
    'subscription_expires_at', v_new_expires_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
