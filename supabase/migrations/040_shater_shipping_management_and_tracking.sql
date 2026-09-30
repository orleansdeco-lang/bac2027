-- ==============================================================================
-- SHATER COD: Migration 040 - Shipping Management & Tracking Architecture
-- ==============================================================================
-- 1. Forward-only extension: Add tracking_number directly to public.orders.
-- 2. Add lifecycle timestamp columns: out_for_delivery_at, failed_at, status_notes to public.shipments.
-- 3. Enhance status transition trigger to synchronize tracking_number & timestamps.
-- 4. Maintain strict invariant: DELIVERED != PAID.
-- ==============================================================================

-- 1. Orders table tracking column
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS tracking_number TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);

-- 2. Shipments table extra lifecycle & notes columns
ALTER TABLE public.shipments
  ADD COLUMN IF NOT EXISTS out_for_delivery_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_shipments_shipped_at ON public.shipments(shipped_at);

-- 3. Backfill orders.tracking_number from shipments
UPDATE public.orders o
SET tracking_number = s.tracking_number
FROM public.shipments s
WHERE s.order_id = o.id
  AND s.tracking_number IS NOT NULL
  AND o.tracking_number IS NULL;

-- 4. Enhanced shipment lifecycle & synchronization trigger
CREATE OR REPLACE FUNCTION public.handle_shipment_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Synchronize tracking_number to canonical orders table
  IF NEW.tracking_number IS NOT NULL AND (OLD IS NULL OR OLD.tracking_number IS DISTINCT FROM NEW.tracking_number) THEN
    UPDATE public.orders
    SET tracking_number = NEW.tracking_number,
        updated_at = now()
    WHERE id = NEW.order_id;
  END IF;

  -- 1. SHIPPED transition
  IF NEW.status = 'SHIPPED' AND (OLD IS NULL OR OLD.status <> 'SHIPPED') THEN
    NEW.shipped_at := coalesce(NEW.shipped_at, now());
    UPDATE public.orders SET status = 'SHIPPED', updated_at = now() WHERE id = NEW.order_id;
  END IF;

  -- 2. OUT_FOR_DELIVERY transition
  IF NEW.status = 'OUT_FOR_DELIVERY' AND (OLD IS NULL OR OLD.status <> 'OUT_FOR_DELIVERY') THEN
    NEW.out_for_delivery_at := coalesce(NEW.out_for_delivery_at, now());
  END IF;

  -- 3. DELIVERED transition
  -- CRITICAL INVARIANT: Payment transitions to DELIVERED_PENDING_SETTLEMENT, NEVER to PAID!
  -- Subscription remains PENDING until explicit admin payment confirmation & activation!
  IF NEW.status = 'DELIVERED' AND (OLD IS NULL OR OLD.status <> 'DELIVERED') THEN
    NEW.delivered_at := coalesce(NEW.delivered_at, now());
    UPDATE public.payments 
    SET status = 'DELIVERED_PENDING_SETTLEMENT', 
        updated_at = now() 
    WHERE order_id = NEW.order_id 
      AND status = 'COD';
  END IF;

  -- 4. FAILED transition (Delivery attempt failed)
  IF NEW.status = 'FAILED' AND (OLD IS NULL OR OLD.status <> 'FAILED') THEN
    NEW.failed_at := coalesce(NEW.failed_at, now());
  END IF;

  -- 5. RETURNED transition (Package returned to warehouse)
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

-- Re-attach trigger
DROP TRIGGER IF EXISTS trg_shipment_status_transition ON public.shipments;
CREATE TRIGGER trg_shipment_status_transition
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_shipment_status_transition();
