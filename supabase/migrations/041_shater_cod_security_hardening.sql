-- ==============================================================================
-- SHATER COD: Migration 041 - Security Hardening & Idempotency Enforcement
-- Dedicated Supabase Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- 1. Anti-Duplicate Subscription: Unique index on subscriptions(order_id).
-- 2. Enhanced Activation Prerequisites: Disallow activation on CANCELLED orders.
-- 3. Payment Settlement Safeguard: Disallow PAID status on CANCELLED orders or RETURNED shipments.
-- 4. Address Protection: Lock shipping addresses once order is SHIPPED or COMPLETED.
-- ==============================================================================

-- 1. Anti-duplicate subscription invariant (idempotent unique constraint)
CREATE UNIQUE INDEX IF NOT EXISTS uq_subscriptions_order_id 
  ON public.subscriptions(order_id) 
  WHERE order_id IS NOT NULL;

-- 2. Enhance subscription activation trigger to reject CANCELLED orders
CREATE OR REPLACE FUNCTION public.check_subscription_activation_prerequisites()
RETURNS TRIGGER AS $$
DECLARE
  v_order RECORD;
  v_payment RECORD;
  v_shipment RECORD;
BEGIN
  -- Check only when entering or staying in ACTIVE status
  IF NEW.status = 'ACTIVE' AND (OLD IS NULL OR OLD.status IS DISTINCT FROM 'ACTIVE') THEN
    IF NEW.order_id IS NOT NULL THEN
      -- Check Order status
      SELECT * INTO v_order 
      FROM public.orders 
      WHERE id = NEW.order_id;

      IF FOUND THEN
        IF v_order.status = 'CANCELLED' THEN
          RAISE EXCEPTION 'Subscription activation rejected: Order is CANCELLED.';
        END IF;
      END IF;

      -- Check Payment status
      SELECT * INTO v_payment 
      FROM public.payments 
      WHERE order_id = NEW.order_id;

      IF FOUND THEN
        IF v_payment.status <> 'PAID' THEN
          RAISE EXCEPTION 'Subscription activation rejected: Order payment is in status "%", but must be verified as PAID before subscription can be activated.', v_payment.status;
        END IF;
      END IF;

      -- Check Shipment status
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

-- 3. Safeguard: Disallow payment settlement on CANCELLED orders
CREATE OR REPLACE FUNCTION public.check_payment_settlement_safeguard()
RETURNS TRIGGER AS $$
DECLARE
  v_order RECORD;
  v_shipment RECORD;
BEGIN
  IF NEW.status = 'PAID' AND (OLD IS NULL OR OLD.status <> 'PAID') THEN
    SELECT status INTO v_order FROM public.orders WHERE id = NEW.order_id;
    IF FOUND AND v_order.status = 'CANCELLED' THEN
      RAISE EXCEPTION 'Payment settlement rejected: Order % is CANCELLED.', NEW.order_id;
    END IF;

    SELECT status INTO v_shipment FROM public.shipments WHERE order_id = NEW.order_id;
    IF FOUND AND (v_shipment.status = 'RETURNED' OR v_shipment.status = 'FAILED') THEN
      RAISE EXCEPTION 'Payment settlement rejected: Shipment is RETURNED or FAILED.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_payment_settlement_safeguard ON public.payments;
CREATE TRIGGER trg_payment_settlement_safeguard
  BEFORE INSERT OR UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_payment_settlement_safeguard();

-- 4. Address Protection: Shipping address lock after SHIPPED / COMPLETED
CREATE OR REPLACE FUNCTION public.check_shipping_address_lock()
RETURNS TRIGGER AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT status INTO v_order FROM public.orders WHERE id = NEW.order_id;
  IF FOUND AND v_order.status IN ('SHIPPED', 'COMPLETED', 'CANCELLED') THEN
    IF auth.role() <> 'service_role' THEN
      RAISE EXCEPTION 'Shipping address cannot be modified: Order is already in locked state (%).', v_order.status;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_check_shipping_address_lock ON public.shipping_addresses;
CREATE TRIGGER trg_check_shipping_address_lock
  BEFORE UPDATE ON public.shipping_addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.check_shipping_address_lock();
