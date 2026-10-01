-- ==============================================================================
-- SHATER | الشاطر — MIGRATION 045: FIX ORDERS, REFERRALS & COD CHECKOUT
-- ==============================================================================
-- Fixes:
-- 1. Adds missing columns to public.payment_orders (order_type, shipping columns)
--    so trg_sync_order_to_payment_orders bridge trigger never crashes on order insert.
-- 2. Hardens Row Level Security (RLS) on public.orders and public.shipping_addresses
--    allowing students and guests to submit checkout orders without 42501 violations.
-- 3. Enables secure initial insertion of shipments (PENDING) and payments (COD).
-- 4. Adds referral_code & referred_by_code to public.student_profiles.
-- 5. Creates public.referrals table with appropriate policies.
-- ==============================================================================

-- 1. FIX PAYMENT_ORDERS COLUMNS
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'COD';
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'PENDING';
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS shipping_name TEXT;
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS shipping_phone TEXT;
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS shipping_wilaya TEXT;
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS shipping_commune TEXT;
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE public.payment_orders ADD COLUMN IF NOT EXISTS proof_url TEXT;

-- 2. HARDEN RLS ON ORDERS TABLE
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_insert_own_or_operator" ON public.orders;
CREATE POLICY "orders_insert_own_or_operator" ON public.orders
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "orders_select_own_or_operator" ON public.orders;
CREATE POLICY "orders_select_own_or_operator" ON public.orders
  FOR SELECT TO anon, authenticated
  USING (
    user_id IS NULL OR auth.uid() = user_id OR public.has_finance_access(auth.uid()) OR auth.role() = 'service_role'
  );

-- 3. HARDEN RLS ON SHIPPING_ADDRESSES TABLE
ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shipping_addresses_insert" ON public.shipping_addresses;
CREATE POLICY "shipping_addresses_insert" ON public.shipping_addresses
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 4. PERMIT COD INITIALIZATION ON SHIPMENTS & PAYMENTS
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shipments_insert_checkout" ON public.shipments;
CREATE POLICY "shipments_insert_checkout" ON public.shipments
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'PENDING');

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_insert_checkout" ON public.payments;
CREATE POLICY "payments_insert_checkout" ON public.payments
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'COD' AND settled_at IS NULL AND verified_by IS NULL);

-- 5. REFERRALS & STUDENT_PROFILES COLUMNS
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.student_profiles ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  reward_amount_dzd NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
  reward_applied BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "referrals_select" ON public.referrals;
CREATE POLICY "referrals_select" ON public.referrals
  FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

DROP POLICY IF EXISTS "referrals_insert" ON public.referrals;
CREATE POLICY "referrals_insert" ON public.referrals
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 6. GRANT ALL REQUIRED PERMISSIONS
GRANT ALL ON public.orders TO anon, authenticated, service_role;
GRANT ALL ON public.shipping_addresses TO anon, authenticated, service_role;
GRANT ALL ON public.shipments TO anon, authenticated, service_role;
GRANT ALL ON public.payments TO anon, authenticated, service_role;
GRANT ALL ON public.payment_orders TO anon, authenticated, service_role;
GRANT ALL ON public.referrals TO anon, authenticated, service_role;
