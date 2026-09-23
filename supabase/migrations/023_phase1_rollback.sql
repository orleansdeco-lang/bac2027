-- ==============================================================================
-- 023_phase1_rollback.sql
-- Rollback script for 023_phase1_security_and_authoritative_persistence.sql
-- ==============================================================================

-- 1. Restore previous ops_get_cockpit_kpis function
CREATE OR REPLACE FUNCTION public.ops_get_cockpit_kpis(p_operator_id UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
DECLARE
  v_is_authorized BOOLEAN;
  v_result JSONB;
BEGIN
  IF auth.role() = 'service_role' THEN
    v_is_authorized := TRUE;
  ELSE
    SELECT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = p_operator_id 
        AND role IN ('OWNER', 'OPERATOR')
    ) INTO v_is_authorized;
  END IF;

  IF NOT v_is_authorized THEN
    RAISE EXCEPTION 'Access Denied: Caller does not possess OPERATOR or OWNER privileges.';
  END IF;

  SELECT jsonb_build_object(
    'generated_at', now(),
    'funnel', jsonb_build_object(
      'total_signups', (SELECT count(*) FROM public.student_profiles),
      'active_trials', (SELECT count(*) FROM public.student_profiles WHERE access_status = 'TRIAL' AND trial_expires_at > now()),
      'expired_trials', (SELECT count(*) FROM public.student_profiles WHERE access_status = 'EXPIRED' OR (access_status = 'TRIAL' AND trial_expires_at <= now())),
      'paid_subscribers', (SELECT count(*) FROM public.student_profiles WHERE access_status = 'PAID' OR plan = 'PAID')
    ),
    'revenue', jsonb_build_object(
      'total_revenue_dzd', (SELECT coalesce(sum(amount), 0.00) FROM public.payment_orders WHERE status = 'APPROVED'),
      'pending_revenue_dzd', (SELECT coalesce(sum(amount), 0.00) FROM public.payment_orders WHERE status = 'PENDING'),
      'approved_orders_count', (SELECT count(*) FROM public.payment_orders WHERE status = 'APPROVED'),
      'pending_orders_count', (SELECT count(*) FROM public.payment_orders WHERE status = 'PENDING'),
      'rejected_orders_count', (SELECT count(*) FROM public.payment_orders WHERE status = 'REJECTED')
    )
  ) INTO v_result;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- 2. Restore grants on views if needed
GRANT SELECT ON public.ops_payment_summary TO anon, authenticated, service_role;
GRANT SELECT ON public.ops_trial_summary TO anon, authenticated, service_role;
GRANT SELECT ON public.ops_learning_summary TO anon, authenticated, service_role;

-- 3. Drop RPC admin_authoritative_approve_order
DROP FUNCTION IF EXISTS public.admin_authoritative_approve_order(UUID, UUID, TEXT);

-- 4. Note: subscriptions table and records are preserved to prevent data loss.
-- If complete table drop is required in dev/staging:
-- DROP TABLE IF EXISTS public.subscriptions CASCADE;

DELETE FROM supabase_migrations.schema_migrations WHERE version = '023';
