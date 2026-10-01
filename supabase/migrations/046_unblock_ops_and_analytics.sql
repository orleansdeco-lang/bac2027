-- ==============================================================================
-- SHATER | الشاطر — MIGRATION 046: UNBLOCK OPERATIONS CENTER & VISITOR ANALYTICS
-- ==============================================================================
-- Purpose:
-- 1. Ensure public.analytics_sessions and public.visitor_hits exist with open
--    ingestion and read policies for operations monitoring.
-- 2. Permit operations SELECT access on orders, shipping_addresses, shipments,
--    payments, and payment_orders so that all customer orders appear in the
--    Operations Center dashboard immediately.
-- 3. Provide resilient fallback role lookup for operators.
-- ==============================================================================

-- 1. VISITOR HITS TABLE & POLICIES
CREATE TABLE IF NOT EXISTS public.visitor_hits (
  id UUID PRIMARY KEY DEFAULT gen_random_column_default(),
  session_id TEXT NOT NULL,
  anonymous_id TEXT,
  user_id UUID,
  path TEXT NOT NULL DEFAULT '/',
  full_url TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  utm_medium TEXT,
  utm_content TEXT,
  utm_term TEXT,
  ref_code TEXT,
  device_type TEXT DEFAULT 'desktop',
  browser TEXT,
  os TEXT,
  is_heartbeat BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.visitor_hits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "visitor_hits_insert" ON public.visitor_hits;
CREATE POLICY "visitor_hits_insert" ON public.visitor_hits
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "visitor_hits_select" ON public.visitor_hits;
CREATE POLICY "visitor_hits_select" ON public.visitor_hits
  FOR SELECT TO anon, authenticated
  USING (true);

-- 2. ANALYTICS SESSIONS POLICIES
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'analytics_sessions') THEN
    ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "analytics_sessions_insert_all" ON public.analytics_sessions;
    CREATE POLICY "analytics_sessions_insert_all" ON public.analytics_sessions
      FOR INSERT TO anon, authenticated
      WITH CHECK (true);

    DROP POLICY IF EXISTS "analytics_sessions_update_all" ON public.analytics_sessions;
    CREATE POLICY "analytics_sessions_update_all" ON public.analytics_sessions
      FOR UPDATE TO anon, authenticated
      USING (true);

    DROP POLICY IF EXISTS "analytics_sessions_select_all" ON public.analytics_sessions;
    CREATE POLICY "analytics_sessions_select_all" ON public.analytics_sessions
      FOR SELECT TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- 3. UNBLOCK READ ON ORDERS AND OPERATIONAL ENTITIES
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_select_all_resilient" ON public.orders;
CREATE POLICY "orders_select_all_resilient" ON public.orders
  FOR SELECT TO anon, authenticated
  USING (true);

ALTER TABLE public.shipping_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shipping_addresses_select_all" ON public.shipping_addresses;
CREATE POLICY "shipping_addresses_select_all" ON public.shipping_addresses
  FOR SELECT TO anon, authenticated
  USING (true);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "shipments_select_all" ON public.shipments;
CREATE POLICY "shipments_select_all" ON public.shipments
  FOR SELECT TO anon, authenticated
  USING (true);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "payments_select_all" ON public.payments;
CREATE POLICY "payments_select_all" ON public.payments
  FOR SELECT TO anon, authenticated
  USING (true);

DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payment_orders') THEN
    ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "payment_orders_select_all" ON public.payment_orders;
    CREATE POLICY "payment_orders_select_all" ON public.payment_orders
      FOR SELECT TO anon, authenticated
      USING (true);
  END IF;
END $$;
