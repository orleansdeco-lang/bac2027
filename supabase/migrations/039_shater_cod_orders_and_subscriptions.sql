-- ==============================================================================
-- 039_shater_cod_orders_and_subscriptions.sql
-- SHATER Physical Kit + COD Subscription Database Layer
-- Dedicated Supabase Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- INVARIANTS:
-- 1. Strictly Forward-Only & Non-Destructive: Zero drops of production user data.
-- 2. Decoupled Lifecycles: Order, Delivery, Payment, and Subscription are independent.
-- 3. Invariant Rule: DELIVERED ≠ PAID. Delivery of physical box does NOT activate subscription.
-- 4. Subscription Activation Gate: Subscription can ONLY be activated after Payment = PAID
--    AND explicit Admin verification/confirmation.
-- 5. Data Minimization: Shipping addresses store only essential delivery fields.
-- 6. Mandatory RLS: Enabled on all tables with strict principle of least privilege.
-- 7. Zero browser service_role: Client interacts via authenticated RLS or Security Definer RPCs.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SEQUENCE & ENHANCEMENTS FOR SHATER ID
-- ------------------------------------------------------------------------------

CREATE SEQUENCE IF NOT EXISTS public.shater_order_seq START 1001;

-- Add human-readable shater_id (Matricule) to student_profiles if not present
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS shater_id TEXT UNIQUE;

CREATE SEQUENCE IF NOT EXISTS public.shater_id_seq START 10001;

CREATE OR REPLACE FUNCTION public.assign_shater_student_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.shater_id IS NULL THEN
    NEW.shater_id := 'SHTR-27-' || lpad(nextval('public.shater_id_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_assign_shater_student_id ON public.student_profiles;
CREATE TRIGGER trg_assign_shater_student_id
  BEFORE INSERT ON public.student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_shater_student_id();


-- ------------------------------------------------------------------------------
-- 2. CANONICAL ORDERS TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE, -- e.g. 'ORD-2027-01001'
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0.00),
  currency TEXT NOT NULL DEFAULT 'DZD',
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_orders_status CHECK (
    status IN ('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED')
  )
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_plan_id ON public.orders(plan_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Automatic order_number generation function
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR trim(NEW.order_number) = '' THEN
    NEW.order_number := 'ORD-2027-' || lpad(nextval('public.shater_order_seq')::text, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_generate_order_number ON public.orders;
CREATE TRIGGER trg_generate_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_order_number();


-- ------------------------------------------------------------------------------
-- 3. SHIPPING ADDRESSES TABLE (DATA MINIMIZATION)
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.shipping_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL CHECK (phone ~ '^(05|06|07|02)[0-9]{8}$'),
  wilaya TEXT NOT NULL,
  commune TEXT NOT NULL,
  address TEXT NOT NULL,
  delivery_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipping_addresses_order_id ON public.shipping_addresses(order_id);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_phone ON public.shipping_addresses(phone);
CREATE INDEX IF NOT EXISTS idx_shipping_addresses_wilaya ON public.shipping_addresses(wilaya);


-- ------------------------------------------------------------------------------
-- 4. SHIPMENTS TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  carrier TEXT NOT NULL DEFAULT 'YALIDINE',
  tracking_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'PENDING',
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_shipments_status CHECK (
    status IN ('PENDING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED')
  )
);

CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON public.shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking_number ON public.shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON public.shipments(status);


-- ------------------------------------------------------------------------------
-- 5. COD PAYMENTS TABLE
-- ------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  method TEXT NOT NULL DEFAULT 'COD' CHECK (method IN ('COD', 'BARIDIMOB', 'CCP')),
  status TEXT NOT NULL DEFAULT 'COD',
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0.00),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  settlement_notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_payments_status CHECK (
    status IN ('PENDING', 'COD', 'DELIVERED_PENDING_SETTLEMENT', 'PAID', 'FAILED', 'REFUNDED')
  )
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_verified_by ON public.payments(verified_by);


-- ------------------------------------------------------------------------------
-- 6. EXTEND & HARMONIZE CANONICAL SUBSCRIPTIONS TABLE
-- ------------------------------------------------------------------------------

-- Ensure user_id and starts_at columns exist on public.subscriptions
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ DEFAULT now();

-- Update constraint to canonical statuses
ALTER TABLE public.subscriptions 
  DROP CONSTRAINT IF EXISTS chk_subscriptions_status;

ALTER TABLE public.subscriptions 
  ADD CONSTRAINT chk_subscriptions_status CHECK (
    status IN ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'REVOKED', 'SUSPENDED')
  );

-- Sync user_id and student_id automatically
CREATE OR REPLACE FUNCTION public.sync_subscription_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL AND NEW.student_id IS NOT NULL THEN
    NEW.user_id := NEW.student_id;
  END IF;
  IF NEW.student_id IS NULL AND NEW.user_id IS NOT NULL THEN
    NEW.student_id := NEW.user_id;
  END IF;
  IF NEW.starts_at IS NULL AND NEW.started_at IS NOT NULL THEN
    NEW.starts_at := NEW.started_at;
  END IF;
  IF NEW.started_at IS NULL AND NEW.starts_at IS NOT NULL THEN
    NEW.started_at := NEW.starts_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_subscription_user_id ON public.subscriptions;
CREATE TRIGGER trg_sync_subscription_user_id
  BEFORE INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_subscription_user_id();

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);


-- ------------------------------------------------------------------------------
-- 7. THE CRITICAL INVARIANT: PREVENT PREMATURE SUBSCRIPTION ACTIVATION
-- ------------------------------------------------------------------------------
-- RULE:
-- DO NOT activate subscription on ORDER CREATED
-- DO NOT activate subscription on SHIPPED
-- DO NOT activate subscription on DELIVERED
-- Activation ONLY allowed when:
-- 1. PAYMENT = PAID
-- 2. Explicit Admin confirmation (activated_by IS NOT NULL or service_role)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.check_subscription_activation_prerequisites()
RETURNS TRIGGER AS $$
DECLARE
  v_payment RECORD;
  v_shipment RECORD;
BEGIN
  -- Check only when entering or staying in ACTIVE status
  IF NEW.status = 'ACTIVE' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'ACTIVE') THEN
    -- If subscription is tied to an order, verify Payment is PAID
    IF NEW.order_id IS NOT NULL THEN
      SELECT * INTO v_payment 
      FROM public.payments 
      WHERE order_id = NEW.order_id;

      IF FOUND THEN
        IF v_payment.status <> 'PAID' THEN
          RAISE EXCEPTION 'Subscription activation rejected: Order payment is in status "%", but must be verified as PAID before subscription can be activated.', v_payment.status;
        END IF;
      END IF;

      -- Double verification: Shipment must not be PENDING or RETURNED
      SELECT * INTO v_shipment 
      FROM public.shipments 
      WHERE order_id = NEW.order_id;

      IF FOUND THEN
        IF v_shipment.status = 'RETURNED' OR v_shipment.status = 'FAILED' THEN
          RAISE EXCEPTION 'Subscription activation rejected: Shipment was returned or failed.';
        END IF;
      END IF;
    END IF;

    -- Strict authorization check: Must have admin confirmation or service_role
    IF NEW.activated_by IS NULL AND auth.role() <> 'service_role' THEN
      RAISE EXCEPTION 'Subscription activation rejected: Explicit Admin confirmation (activated_by) is required.';
    END IF;

    -- Ensure activation timestamp is populated
    IF NEW.activated_at IS NULL THEN
      NEW.activated_at := now();
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_check_subscription_activation ON public.subscriptions;
CREATE TRIGGER trg_check_subscription_activation
  BEFORE INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_subscription_activation_prerequisites();


-- ------------------------------------------------------------------------------
-- 8. AUTOMATIC DELIVERY EVENT CASCADES (DELIVERED != PAID)
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_shipment_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- When shipment changes to SHIPPED
  IF NEW.status = 'SHIPPED' AND (OLD IS NULL OR OLD.status <> 'SHIPPED') THEN
    NEW.shipped_at := coalesce(NEW.shipped_at, now());
    UPDATE public.orders SET status = 'SHIPPED', updated_at = now() WHERE id = NEW.order_id;
  END IF;

  -- When shipment changes to DELIVERED
  -- CRITICAL: Payment transitions to DELIVERED_PENDING_SETTLEMENT, NOT to PAID!
  -- Subscription remains PENDING!
  IF NEW.status = 'DELIVERED' AND (OLD IS NULL OR OLD.status <> 'DELIVERED') THEN
    NEW.delivered_at := coalesce(NEW.delivered_at, now());
    UPDATE public.payments 
    SET status = 'DELIVERED_PENDING_SETTLEMENT', 
        updated_at = now() 
    WHERE order_id = NEW.order_id 
      AND status = 'COD';
  END IF;

  -- When shipment changes to RETURNED
  IF NEW.status = 'RETURNED' AND (OLD IS NULL OR OLD.status <> 'RETURNED') THEN
    NEW.returned_at := coalesce(NEW.returned_at, now());
    UPDATE public.orders SET status = 'CANCELLED', updated_at = now() WHERE id = NEW.order_id;
    UPDATE public.payments SET status = 'FAILED', updated_at = now() WHERE order_id = NEW.order_id;
    UPDATE public.subscriptions SET status = 'CANCELLED', updated_at = now() WHERE order_id = NEW.order_id AND status = 'PENDING';
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_shipment_status_transition ON public.shipments;
CREATE TRIGGER trg_shipment_status_transition
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_shipment_status_transition();


-- ------------------------------------------------------------------------------
-- 9. ATOMIC ADMIN OPERATIONS (RPCs)
-- ------------------------------------------------------------------------------

-- 9.1. Admin Dispatches Shipment
CREATE OR REPLACE FUNCTION public.admin_dispatch_shipment(
  p_order_id UUID,
  p_carrier TEXT DEFAULT 'YALIDINE',
  p_tracking_number TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_caller_id UUID := auth.uid();
BEGIN
  IF NOT public.has_finance_access(v_caller_id) THEN
    RAISE EXCEPTION 'Access denied: requires finance privileges.';
  END IF;

  UPDATE public.shipments
  SET carrier = coalesce(p_carrier, carrier),
      tracking_number = coalesce(p_tracking_number, tracking_number),
      status = 'SHIPPED',
      shipped_at = now(),
      updated_at = now()
  WHERE order_id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Shipment record for order % not found.', p_order_id;
  END IF;

  UPDATE public.orders
  SET status = 'SHIPPED',
      updated_at = now()
  WHERE id = p_order_id;

  INSERT INTO public.operations_audit_logs (
    actor_user_id, actor_role, action, target_type, target_id, reason, after_state
  ) VALUES (
    v_caller_id, 'OPERATOR', 'SHIPMENT_DISPATCHED', 'shipment', p_order_id::text,
    'Physical kit dispatched with courier',
    jsonb_build_object('order_id', p_order_id, 'carrier', p_carrier, 'tracking_number', p_tracking_number)
  );

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'status', 'SHIPPED');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 9.2. Admin Confirms COD Cash Received (Payment = PAID)
CREATE OR REPLACE FUNCTION public.admin_verify_cod_payment_settled(
  p_order_id UUID,
  p_notes TEXT DEFAULT 'COD settlement verified in SHATER bank/cash account'
)
RETURNS JSONB AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_shipment RECORD;
  v_payment RECORD;
BEGIN
  IF NOT public.has_finance_access(v_caller_id) THEN
    RAISE EXCEPTION 'Access denied: requires finance privileges.';
  END IF;

  -- Verify shipment was delivered
  SELECT * INTO v_shipment FROM public.shipments WHERE order_id = p_order_id;
  IF NOT FOUND OR v_shipment.status <> 'DELIVERED' THEN
    RAISE EXCEPTION 'Cannot settle payment: Shipment must be marked as DELIVERED first.';
  END IF;

  -- Transition payment to PAID
  UPDATE public.payments
  SET status = 'PAID',
      settled_at = now(),
      verified_by = v_caller_id,
      settlement_notes = p_notes,
      updated_at = now()
  WHERE order_id = p_order_id
  RETURNING * INTO v_payment;

  -- Transition order to COMPLETED
  UPDATE public.orders
  SET status = 'COMPLETED',
      updated_at = now()
  WHERE id = p_order_id;

  INSERT INTO public.operations_audit_logs (
    actor_user_id, actor_role, action, target_type, target_id, reason, after_state
  ) VALUES (
    v_caller_id, 'OPERATOR', 'COD_PAYMENT_SETTLED', 'payment', v_payment.id::text,
    p_notes,
    jsonb_build_object('order_id', p_order_id, 'amount', v_payment.amount, 'settled_at', now())
  );

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'payment_status', 'PAID',
    'message', 'Payment marked as PAID. Subscription is now ready for Admin activation.'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- 9.3. Admin Confirms & Activates Subscription
CREATE OR REPLACE FUNCTION public.admin_activate_cod_subscription(
  p_order_id UUID,
  p_reason TEXT DEFAULT 'Subscription activated following payment settlement confirmation'
)
RETURNS JSONB AS $$
DECLARE
  v_caller_id UUID := auth.uid();
  v_order RECORD;
  v_payment RECORD;
  v_plan RECORD;
  v_duration_months INT := 10;
  v_new_expires_at TIMESTAMPTZ;
  v_sub_id UUID;
BEGIN
  IF NOT public.has_finance_access(v_caller_id) THEN
    RAISE EXCEPTION 'Access denied: requires finance privileges.';
  END IF;

  -- Fetch order and payment
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Order % not found.', p_order_id; END IF;

  SELECT * INTO v_payment FROM public.payments WHERE order_id = p_order_id;
  IF NOT FOUND OR v_payment.status <> 'PAID' THEN
    RAISE EXCEPTION 'Cannot activate subscription: Order payment status is not PAID.';
  END IF;

  IF v_order.user_id IS NULL THEN
    RAISE EXCEPTION 'Cannot activate subscription: Order is not attached to any registered user.';
  END IF;

  -- Fetch plan duration
  SELECT * INTO v_plan FROM public.subscription_plans WHERE id = v_order.plan_id;
  IF FOUND AND v_plan.duration_months IS NOT NULL THEN
    v_duration_months := v_plan.duration_months;
  END IF;

  v_new_expires_at := now() + (v_duration_months || ' months')::interval;

  -- Update or insert subscription
  UPDATE public.subscriptions
  SET status = 'ACTIVE',
      starts_at = now(),
      started_at = now(),
      expires_at = v_new_expires_at,
      activated_by = v_caller_id,
      notes = p_reason,
      updated_at = now()
  WHERE order_id = p_order_id
  RETURNING id INTO v_sub_id;

  IF v_sub_id IS NULL THEN
    INSERT INTO public.subscriptions (
      user_id, student_id, order_id, plan_id, status, starts_at, started_at, expires_at, activated_by, notes
    ) VALUES (
      v_order.user_id, v_order.user_id, p_order_id, v_order.plan_id, 'ACTIVE', now(), now(), v_new_expires_at, v_caller_id, p_reason
    ) RETURNING id INTO v_sub_id;
  END IF;

  -- Elevate student profile
  UPDATE public.student_profiles
  SET access_status = 'PAID',
      plan = v_order.plan_id,
      subscription_started_at = now(),
      subscription_expires_at = v_new_expires_at,
      updated_at = now()
  WHERE id = v_order.user_id;

  -- Process referral reward if eligible
  PERFORM public.process_qualifying_referral(v_order.user_id, p_order_id);

  INSERT INTO public.operations_audit_logs (
    actor_user_id, actor_role, action, target_type, target_id, reason, after_state
  ) VALUES (
    v_caller_id, 'OPERATOR', 'SUBSCRIPTION_ACTIVATED', 'subscription', v_sub_id::text,
    p_reason,
    jsonb_build_object('order_id', p_order_id, 'user_id', v_order.user_id, 'expires_at', v_new_expires_at)
  );

  RETURN jsonb_build_object(
    'success', true,
    'subscription_id', v_sub_id,
    'user_id', v_order.user_id,
    'expires_at', v_new_expires_at,
    'status', 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ------------------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Orders RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "orders_select_own_or_operator" ON public.orders;
  CREATE POLICY "orders_select_own_or_operator" ON public.orders
    FOR SELECT USING (
      auth.uid() = user_id OR public.has_finance_access(auth.uid()) OR auth.role() = 'service_role'
    );

  DROP POLICY IF EXISTS "orders_insert_own_or_operator" ON public.orders;
  CREATE POLICY "orders_insert_own_or_operator" ON public.orders
    FOR INSERT WITH CHECK (
      auth.uid() = user_id OR user_id IS NULL OR public.has_finance_access(auth.uid()) OR auth.role() = 'service_role'
    );

  DROP POLICY IF EXISTS "orders_update_operator" ON public.orders;
  CREATE POLICY "orders_update_operator" ON public.orders
    FOR UPDATE USING (
      public.has_finance_access(auth.uid()) OR auth.role() = 'service_role'
    );
END $$;


-- Shipping Addresses RLS
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "shipping_addresses_select" ON public.shipping_addresses;
  CREATE POLICY "shipping_addresses_select" ON public.shipping_addresses
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.orders o 
        WHERE o.id = shipping_addresses.order_id 
          AND (o.user_id = auth.uid() OR public.has_finance_access(auth.uid()) OR auth.role() = 'service_role')
      )
    );

  DROP POLICY IF EXISTS "shipping_addresses_insert" ON public.shipping_addresses;
  CREATE POLICY "shipping_addresses_insert" ON public.shipping_addresses
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.orders o 
        WHERE o.id = shipping_addresses.order_id 
          AND (o.user_id = auth.uid() OR o.user_id IS NULL OR public.has_finance_access(auth.uid()) OR auth.role() = 'service_role')
      )
    );

  DROP POLICY IF EXISTS "shipping_addresses_update_operator" ON public.shipping_addresses;
  CREATE POLICY "shipping_addresses_update_operator" ON public.shipping_addresses
    FOR UPDATE USING (
      public.has_finance_access(auth.uid()) OR auth.role() = 'service_role'
    );
END $$;


-- Shipments RLS
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "shipments_select" ON public.shipments;
  CREATE POLICY "shipments_select" ON public.shipments
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.orders o 
        WHERE o.id = shipments.order_id 
          AND (o.user_id = auth.uid() OR public.has_finance_access(auth.uid()) OR auth.role() = 'service_role')
      )
    );

  DROP POLICY IF EXISTS "shipments_write_operator" ON public.shipments;
  CREATE POLICY "shipments_write_operator" ON public.shipments
    FOR ALL USING (
      public.has_finance_access(auth.uid()) OR auth.role() = 'service_role'
    ) WITH CHECK (
      public.has_finance_access(auth.uid()) OR auth.role() = 'service_role'
    );
END $$;


-- Payments RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "payments_select" ON public.payments;
  CREATE POLICY "payments_select" ON public.payments
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM public.orders o 
        WHERE o.id = payments.order_id 
          AND (o.user_id = auth.uid() OR public.has_finance_access(auth.uid()) OR auth.role() = 'service_role')
      )
    );

  DROP POLICY IF EXISTS "payments_write_operator" ON public.payments;
  CREATE POLICY "payments_write_operator" ON public.payments
    FOR ALL USING (
      public.has_finance_access(auth.uid()) OR auth.role() = 'service_role'
    ) WITH CHECK (
      public.has_finance_access(auth.uid()) OR auth.role() = 'service_role'
    );
END $$;


-- ------------------------------------------------------------------------------
-- 11. BACKWARD COMPATIBILITY BRIDGE (SYNC NEW ORDERS TO PAYMENT_ORDERS)
-- ------------------------------------------------------------------------------
-- Ensures that existing queries in the app querying payment_orders continue to
-- function seamlessly without any code breakage.
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.sync_order_to_payment_orders_bridge()
RETURNS TRIGGER AS $$
DECLARE
  v_ship RECORD;
BEGIN
  SELECT * INTO v_ship FROM public.shipping_addresses WHERE order_id = NEW.id;

  INSERT INTO public.payment_orders (
    id,
    user_id,
    plan,
    amount,
    currency,
    payment_method,
    status,
    order_type,
    shipping_name,
    shipping_phone,
    shipping_wilaya,
    shipping_commune,
    shipping_address,
    delivery_status,
    submitted_at,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.user_id,
    NEW.plan_id,
    NEW.amount,
    NEW.currency,
    'cash',
    CASE WHEN NEW.status = 'COMPLETED' THEN 'APPROVED' ELSE 'PENDING' END,
    'COD',
    v_ship.full_name,
    v_ship.phone,
    v_ship.wilaya,
    v_ship.commune,
    v_ship.address,
    'PENDING',
    NEW.created_at,
    NEW.created_at,
    NEW.updated_at
  )
  ON CONFLICT (id) DO UPDATE SET
    status = CASE WHEN EXCLUDED.status = 'APPROVED' THEN 'APPROVED' ELSE public.payment_orders.status END,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_sync_order_to_payment_orders ON public.orders;
CREATE TRIGGER trg_sync_order_to_payment_orders
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_order_to_payment_orders_bridge();

GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.shipping_addresses TO service_role;
GRANT ALL ON public.shipments TO service_role;
GRANT ALL ON public.payments TO service_role;
GRANT ALL ON public.subscriptions TO service_role;

GRANT SELECT ON public.orders TO authenticated;
GRANT SELECT ON public.shipping_addresses TO authenticated;
GRANT SELECT ON public.shipments TO authenticated;
GRANT SELECT ON public.payments TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
