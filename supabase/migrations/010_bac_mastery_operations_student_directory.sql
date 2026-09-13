-- ==============================================================================
-- 010_bac_mastery_operations_student_directory.sql
-- BAC Mastery: Operations Student Directory & Dossier Safe RPCs
-- Dedicated Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- INVARIANTS:
-- 1. Strictly ADDITIVE. Zero modifications to the 10 canonical Learning Core tables.
-- 2. Student RLS on public.student_profiles is 100% PRESERVED (USING auth.uid() = user_id).
-- 3. No service role key exposed to client.
-- 4. Server-enforced RBAC: Functions are SECURITY DEFINER but strictly verify
--    that the caller possesses OWNER or OPERATOR role via auth.uid() ONLY.
--    The parameter p_operator_id is NEVER trusted for authorization.
-- 5. Strict search_path = public, pg_temp with schema-qualified object references.
-- 6. Execution privileges: anon revoked, authenticated granted, operator verified.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. OPS GET STUDENT DIRECTORY RPC
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ops_get_student_directory(
  p_operator_id UUID DEFAULT auth.uid(),
  p_limit INT DEFAULT 100,
  p_offset INT DEFAULT 0
)
RETURNS JSONB AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_result JSONB;
BEGIN
  -- Strict verification: Authorization is based ONLY on auth.uid()
  -- The parameter p_operator_id is NEVER trusted for authorization
  IF v_caller IS NULL OR NOT public.is_operator(v_caller) THEN
    RAISE EXCEPTION 'Access denied: operator role required';
  END IF;

  SELECT COALESCE(jsonb_agg(row_to_json(sub)), '[]'::jsonb) INTO v_result
  FROM (
    SELECT 
      sp.id,
      sp.user_id,
      sp.first_name,
      sp.last_name,
      u.email::text AS email,
      sp.student_phone,
      sp.parent_phone,
      sp.stream_id,
      sp.wilaya_name,
      sp.commune_name,
      sp.target_score,
      sp.access_status,
      sp.plan,
      sp.trial_started_at,
      sp.trial_expires_at,
      sp.subscription_started_at,
      sp.subscription_expires_at,
      sp.onboarding_completed,
      sp.created_at,
      sp.updated_at
    FROM public.student_profiles sp
    LEFT JOIN auth.users u ON u.id = sp.id
    ORDER BY sp.created_at DESC
    LIMIT p_limit
    OFFSET p_offset
  ) sub;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- ------------------------------------------------------------------------------
-- 2. OPS GET STUDENT DOSSIER RPC
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ops_get_student_dossier(
  p_student_id UUID,
  p_operator_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_result JSONB;
BEGIN
  -- Strict verification: Authorization is based ONLY on auth.uid()
  -- The parameter p_operator_id is NEVER trusted for authorization
  IF v_caller IS NULL OR NOT public.is_operator(v_caller) THEN
    RAISE EXCEPTION 'Access denied: operator role required';
  END IF;

  SELECT row_to_json(sub)::jsonb INTO v_result
  FROM (
    SELECT 
      sp.*,
      u.email::text AS email
    FROM public.student_profiles sp
    LEFT JOIN auth.users u ON u.id = sp.id
    WHERE sp.id = p_student_id
  ) sub;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- ------------------------------------------------------------------------------
-- 3. OPS GET STUDENT KPI COUNTS RPC
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ops_get_student_kpi_counts(
  p_operator_id UUID DEFAULT auth.uid()
)
RETURNS JSONB AS $$
DECLARE
  v_caller UUID := auth.uid();
  v_total_students INT := 0;
  v_active_trials INT := 0;
  v_trials_expiring_24h INT := 0;
  v_expired_trials INT := 0;
  v_paid_subscribers INT := 0;
  v_completed_onboarding INT := 0;
  v_now TIMESTAMPTZ := now();
  v_in_24h TIMESTAMPTZ := now() + interval '24 hours';
BEGIN
  -- Strict verification: Authorization is based ONLY on auth.uid()
  -- The parameter p_operator_id is NEVER trusted for authorization
  IF v_caller IS NULL OR NOT public.is_operator(v_caller) THEN
    RAISE EXCEPTION 'Access denied: operator role required';
  END IF;

  SELECT count(*) INTO v_total_students FROM public.student_profiles;

  SELECT count(*) INTO v_paid_subscribers
  FROM public.student_profiles
  WHERE access_status = 'PAID'
     OR (subscription_expires_at IS NOT NULL AND subscription_expires_at > v_now);

  SELECT count(*) INTO v_expired_trials
  FROM public.student_profiles
  WHERE (access_status = 'EXPIRED'
     OR (trial_expires_at IS NOT NULL AND trial_expires_at <= v_now AND (subscription_expires_at IS NULL OR subscription_expires_at <= v_now)))
    AND access_status != 'PAID';

  SELECT count(*) INTO v_active_trials
  FROM public.student_profiles
  WHERE (access_status = 'TRIAL' OR access_status IS NULL)
    AND (trial_expires_at IS NULL OR trial_expires_at > v_now)
    AND access_status != 'PAID';

  SELECT count(*) INTO v_trials_expiring_24h
  FROM public.student_profiles
  WHERE trial_expires_at > v_now
    AND trial_expires_at <= v_in_24h
    AND (access_status IS NULL OR access_status = 'TRIAL');

  SELECT count(*) INTO v_completed_onboarding
  FROM public.student_profiles
  WHERE onboarding_completed = true
     OR academic_profile_completed_at IS NOT NULL
     OR registration_completed_at IS NOT NULL;

  RETURN jsonb_build_object(
    'total_students', v_total_students,
    'active_trials', v_active_trials,
    'trials_expiring_24h', v_trials_expiring_24h,
    'expired_trials', v_expired_trials,
    'paid_subscribers', v_paid_subscribers,
    'completed_onboarding', v_completed_onboarding
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, pg_temp;

-- ------------------------------------------------------------------------------
-- 4. PERMISSIONS & GRANTS
-- Desired model:
-- - anon: NO EXECUTE
-- - authenticated: EXECUTE allowed
-- - function itself: operator authorization required (enforced via auth.uid())
-- ------------------------------------------------------------------------------

REVOKE ALL ON FUNCTION public.ops_get_student_directory(UUID, INT, INT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ops_get_student_directory(UUID, INT, INT) FROM anon;
GRANT EXECUTE ON FUNCTION public.ops_get_student_directory(UUID, INT, INT) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.ops_get_student_dossier(UUID, UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ops_get_student_dossier(UUID, UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.ops_get_student_dossier(UUID, UUID) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.ops_get_student_kpi_counts(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.ops_get_student_kpi_counts(UUID) FROM anon;
GRANT EXECUTE ON FUNCTION public.ops_get_student_kpi_counts(UUID) TO authenticated, service_role;
