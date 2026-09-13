-- ==============================================================================
-- 009_bac_mastery_operations_issues.sql
-- BAC Mastery: Central Operations Issues Queue
-- Dedicated Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- INVARIANTS:
-- 1. Strictly ADDITIVE. Zero modifications to the 10 canonical Learning Core tables.
-- 2. Server-Enforced RBAC: Only OPERATOR and OWNER can access and update operational issues.
-- 3. Auditable Resolutions: Any status change or resolution records before/after state.
-- 4. Simple Operational Queue: Categories, Severities (P0-P3), Statuses (OPEN, INVESTIGATING, RESOLVED, DISMISSED).
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.operations_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  severity TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  description TEXT NOT NULL,
  related_student_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  related_order_id UUID REFERENCES public.payment_orders(id) ON DELETE SET NULL,
  related_event_id TEXT,
  resolution TEXT,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_operations_issues_category CHECK (
    category IN ('payment', 'access', 'subscription', 'trial', 'telemetry', 'learning', 'content', 'system', 'security')
  ),
  CONSTRAINT chk_operations_issues_severity CHECK (
    severity IN ('P0', 'P1', 'P2', 'P3')
  ),
  CONSTRAINT chk_operations_issues_status CHECK (
    status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'DISMISSED')
  )
);

CREATE INDEX IF NOT EXISTS idx_operations_issues_status ON public.operations_issues(status);
CREATE INDEX IF NOT EXISTS idx_operations_issues_category ON public.operations_issues(category);
CREATE INDEX IF NOT EXISTS idx_operations_issues_severity ON public.operations_issues(severity);
CREATE INDEX IF NOT EXISTS idx_operations_issues_created_at ON public.operations_issues(created_at DESC);

ALTER TABLE public.operations_issues ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  DROP POLICY IF EXISTS "operations_issues_select" ON public.operations_issues;
  CREATE POLICY "operations_issues_select" ON public.operations_issues
    FOR SELECT USING (
      public.is_operator(auth.uid())
    );

  DROP POLICY IF EXISTS "operations_issues_write" ON public.operations_issues;
  CREATE POLICY "operations_issues_write" ON public.operations_issues
    FOR ALL USING (
      public.is_operator(auth.uid())
    ) WITH CHECK (
      public.is_operator(auth.uid())
    );
END $$;
