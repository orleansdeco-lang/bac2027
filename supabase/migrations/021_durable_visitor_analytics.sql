-- ==============================================================================
-- 021_durable_visitor_analytics.sql
-- Durable, real-time Shopify-style visitor tracking for SHATER BAC Operations
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.visitor_hits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  path TEXT NOT NULL DEFAULT '/',
  full_url TEXT,
  query_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  referrer TEXT,
  utm_source TEXT,
  utm_campaign TEXT,
  utm_medium TEXT,
  ref_code TEXT,
  device_type TEXT NOT NULL DEFAULT 'desktop',
  browser TEXT,
  os TEXT,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast analytical indexes
CREATE INDEX IF NOT EXISTS idx_visitor_hits_created_at ON public.visitor_hits(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_hits_session_id ON public.visitor_hits(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_hits_utm_source ON public.visitor_hits(utm_source);
CREATE INDEX IF NOT EXISTS idx_visitor_hits_ref_code ON public.visitor_hits(ref_code);
CREATE INDEX IF NOT EXISTS idx_visitor_hits_path ON public.visitor_hits(path);

-- Enable RLS
ALTER TABLE public.visitor_hits ENABLE ROW LEVEL SECURITY;

-- Anonymous and authenticated visitors can INSERT hits
DO $$
BEGIN
  DROP POLICY IF EXISTS "visitor_hits_insert" ON public.visitor_hits;
  CREATE POLICY "visitor_hits_insert" ON public.visitor_hits
    FOR INSERT WITH CHECK (true);

  -- Operators can view all hits
  DROP POLICY IF EXISTS "visitor_hits_operator_select" ON public.visitor_hits;
  CREATE POLICY "visitor_hits_operator_select" ON public.visitor_hits
    FOR SELECT USING (
      public.is_operator(auth.uid()) OR auth.uid() = user_id
    );
END $$;
