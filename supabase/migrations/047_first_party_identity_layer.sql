-- Migration 047: First-Party Identity Layer and RLS Hardening
-- Purpose: Introduces analytics_visitors to track pre-auth identity. Fixes over-permissive RLS from 046.

-- 1. CREATE analytics_visitors TABLE
CREATE TABLE IF NOT EXISTS public.analytics_visitors (
  visitor_id TEXT PRIMARY KEY,  -- crypto.randomUUID() from client
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- linked after auth
  linked_at TIMESTAMPTZ,  -- when visitor was linked to user_id
  
  -- First-Touch Attribution (immutable after creation)
  first_utm_source TEXT,
  first_utm_medium TEXT,
  first_utm_campaign TEXT,
  first_utm_content TEXT,
  first_utm_term TEXT,
  first_referrer TEXT,
  first_landing_page TEXT,
  
  -- Device fingerprint (coarse)
  device_type TEXT DEFAULT 'desktop' CHECK (device_type IN ('mobile', 'desktop', 'tablet')),
  browser TEXT,
  os TEXT,
  
  -- Metadata
  total_sessions INT NOT NULL DEFAULT 0,
  total_pageviews INT NOT NULL DEFAULT 0,
  is_bot BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_visitors_user_id ON public.analytics_visitors(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_first_seen_at ON public.analytics_visitors(first_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_last_seen_at ON public.analytics_visitors(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_is_bot ON public.analytics_visitors(is_bot);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_first_utm_source ON public.analytics_visitors(first_utm_source);
CREATE INDEX IF NOT EXISTS idx_analytics_visitors_first_utm_campaign ON public.analytics_visitors(first_utm_campaign);

-- 2. ALTER analytics_sessions — ADD visitor_id COLUMN
ALTER TABLE public.analytics_sessions ADD COLUMN IF NOT EXISTS visitor_id TEXT;
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor_id ON public.analytics_sessions(visitor_id);

-- 3. HARDEN RLS & 4. analytics_visitors RLS
ALTER TABLE public.analytics_visitors ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- analytics_sessions
  DROP POLICY IF EXISTS "analytics_sessions_select_all" ON public.analytics_sessions;
  DROP POLICY IF EXISTS "analytics_sessions_select_operator" ON public.analytics_sessions;
  CREATE POLICY "analytics_sessions_select_operator" ON public.analytics_sessions
    FOR SELECT USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role' OR auth.uid() = user_id
    );

  -- visitor_hits
  DROP POLICY IF EXISTS "visitor_hits_select" ON public.visitor_hits;
  CREATE POLICY "visitor_hits_select" ON public.visitor_hits
    FOR SELECT USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    );

  -- orders
  DROP POLICY IF EXISTS "orders_select_all_resilient" ON public.orders;
  DROP POLICY IF EXISTS "orders_select_operator" ON public.orders;
  CREATE POLICY "orders_select_operator" ON public.orders
    FOR SELECT USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role' OR auth.uid() = user_id
    );

  -- shipping_addresses
  DROP POLICY IF EXISTS "shipping_addresses_select_all" ON public.shipping_addresses;
  DROP POLICY IF EXISTS "shipping_addresses_select_operator" ON public.shipping_addresses;
  CREATE POLICY "shipping_addresses_select_operator" ON public.shipping_addresses
    FOR SELECT USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    );

  -- shipments
  DROP POLICY IF EXISTS "shipments_select_all" ON public.shipments;
  DROP POLICY IF EXISTS "shipments_select_operator" ON public.shipments;
  CREATE POLICY "shipments_select_operator" ON public.shipments
    FOR SELECT USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    );

  -- payments
  DROP POLICY IF EXISTS "payments_select_all" ON public.payments;
  DROP POLICY IF EXISTS "payments_select_operator" ON public.payments;
  CREATE POLICY "payments_select_operator" ON public.payments
    FOR SELECT USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    );

  -- payment_orders
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname='public' AND tablename='payment_orders') THEN
    DROP POLICY IF EXISTS "payment_orders_select_all" ON public.payment_orders;
    DROP POLICY IF EXISTS "payment_orders_select_operator" ON public.payment_orders;
    CREATE POLICY "payment_orders_select_operator" ON public.payment_orders
      FOR SELECT USING (
        public.is_operator(auth.uid()) OR auth.role() = 'service_role'
      );
  END IF;

  -- analytics_visitors RLS
  DROP POLICY IF EXISTS "analytics_visitors_insert" ON public.analytics_visitors;
  CREATE POLICY "analytics_visitors_insert" ON public.analytics_visitors
    FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "analytics_visitors_select" ON public.analytics_visitors;
  CREATE POLICY "analytics_visitors_select" ON public.analytics_visitors
    FOR SELECT USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    );

  DROP POLICY IF EXISTS "analytics_visitors_update" ON public.analytics_visitors;
  CREATE POLICY "analytics_visitors_update" ON public.analytics_visitors
    FOR UPDATE USING (
      public.is_operator(auth.uid()) OR auth.role() = 'service_role'
    );

END $$;

-- 5. CREATE RPC: link_visitor_to_user
CREATE OR REPLACE FUNCTION public.link_visitor_to_user(
  p_visitor_id TEXT,
  p_user_id UUID
) RETURNS VOID AS $$
BEGIN
  -- Update the visitor record
  UPDATE public.analytics_visitors 
  SET user_id = p_user_id, 
      linked_at = now(),
      updated_at = now()
  WHERE visitor_id = p_visitor_id AND user_id IS NULL;
  
  -- Update all sessions for this visitor
  UPDATE public.analytics_sessions 
  SET user_id = p_user_id, 
      updated_at = now()
  WHERE visitor_id = p_visitor_id AND user_id IS NULL;
  
  -- Update all events for this visitor's sessions  
  UPDATE public.analytics_events 
  SET user_id = p_user_id
  WHERE session_id IN (
    SELECT session_id FROM public.analytics_sessions WHERE visitor_id = p_visitor_id
  ) AND user_id IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only callable by authenticated users and service_role
REVOKE ALL ON FUNCTION public.link_visitor_to_user FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.link_visitor_to_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.link_visitor_to_user TO service_role;

-- 6. GRANT permissions for analytics_visitors
GRANT ALL ON public.analytics_visitors TO service_role;
GRANT INSERT ON public.analytics_visitors TO anon, authenticated;
GRANT SELECT ON public.analytics_visitors TO authenticated;
