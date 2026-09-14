-- ==============================================================================
-- 012_bac_mastery_security_and_edge_guarding.sql
-- BAC Mastery: Row Level Security (RLS) Hardening & Edge Guard Policy Audit
-- Dedicated Project: erbvmpnxufgeinqnshzu
-- ==============================================================================
-- INVARIANTS:
-- 1. Strictly enforce Row Level Security (RLS) across all student and learning tables.
-- 2. Data access strictly restricted to:
--    a) The authenticated account owner (auth.uid() = user_id / auth.uid() = id)
--    b) Authorized platform operators & absolute owner (public.is_operator(auth.uid()))
-- 3. Anonymous (anon) role is explicitly REVOKED from accessing student private data.
-- 4. Idempotent and safe: DROP POLICY IF EXISTS before CREATE POLICY.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ENABLE ROW LEVEL SECURITY ON ALL STUDENT & LEARNING TABLES
-- ------------------------------------------------------------------------------

ALTER TABLE IF EXISTS public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.diagnostic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.diagnostic_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.diagnostic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.practice_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.error_repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.retests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.skill_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_orders ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. HARDEN STUDENT PROFILES RLS
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  -- SELECT
  DROP POLICY IF EXISTS "student_profiles_select_own" ON public.student_profiles;
  DROP POLICY IF EXISTS "student_profiles_select_own_or_operator" ON public.student_profiles;
  CREATE POLICY "student_profiles_select_own_or_operator" ON public.student_profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id OR auth.uid() = user_id OR public.is_operator(auth.uid()));

  -- INSERT
  DROP POLICY IF EXISTS "student_profiles_insert_own" ON public.student_profiles;
  DROP POLICY IF EXISTS "student_profiles_insert_own_or_operator" ON public.student_profiles;
  CREATE POLICY "student_profiles_insert_own_or_operator" ON public.student_profiles
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id OR auth.uid() = user_id OR public.is_operator(auth.uid()));

  -- UPDATE
  DROP POLICY IF EXISTS "student_profiles_update_own" ON public.student_profiles;
  DROP POLICY IF EXISTS "student_profiles_update_own_or_operator" ON public.student_profiles;
  CREATE POLICY "student_profiles_update_own_or_operator" ON public.student_profiles
    FOR UPDATE TO authenticated
    USING (auth.uid() = id OR auth.uid() = user_id OR public.is_operator(auth.uid()))
    WITH CHECK (auth.uid() = id OR auth.uid() = user_id OR public.is_operator(auth.uid()));

  -- DELETE
  DROP POLICY IF EXISTS "student_profiles_delete_own" ON public.student_profiles;
  DROP POLICY IF EXISTS "student_profiles_delete_own_or_operator" ON public.student_profiles;
  CREATE POLICY "student_profiles_delete_own_or_operator" ON public.student_profiles
    FOR DELETE TO authenticated
    USING (auth.uid() = id OR auth.uid() = user_id OR public.is_operator(auth.uid()));
END $$;

-- ------------------------------------------------------------------------------
-- 3. HARDEN MISSIONS & LEARNING CORE RLS
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  -- MISSIONS
  DROP POLICY IF EXISTS "missions_select_own" ON public.missions;
  DROP POLICY IF EXISTS "missions_select_own_or_operator" ON public.missions;
  CREATE POLICY "missions_select_own_or_operator" ON public.missions
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "missions_insert_own" ON public.missions;
  DROP POLICY IF EXISTS "missions_insert_own_or_operator" ON public.missions;
  CREATE POLICY "missions_insert_own_or_operator" ON public.missions
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "missions_update_own" ON public.missions;
  DROP POLICY IF EXISTS "missions_update_own_or_operator" ON public.missions;
  CREATE POLICY "missions_update_own_or_operator" ON public.missions
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()))
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "missions_delete_own" ON public.missions;
  DROP POLICY IF EXISTS "missions_delete_own_or_operator" ON public.missions;
  CREATE POLICY "missions_delete_own_or_operator" ON public.missions
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  -- PRACTICE ATTEMPTS
  DROP POLICY IF EXISTS "practice_attempts_select_own" ON public.practice_attempts;
  DROP POLICY IF EXISTS "practice_attempts_select_own_or_operator" ON public.practice_attempts;
  CREATE POLICY "practice_attempts_select_own_or_operator" ON public.practice_attempts
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "practice_attempts_insert_own" ON public.practice_attempts;
  DROP POLICY IF EXISTS "practice_attempts_insert_own_or_operator" ON public.practice_attempts;
  CREATE POLICY "practice_attempts_insert_own_or_operator" ON public.practice_attempts
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "practice_attempts_update_own" ON public.practice_attempts;
  DROP POLICY IF EXISTS "practice_attempts_update_own_or_operator" ON public.practice_attempts;
  CREATE POLICY "practice_attempts_update_own_or_operator" ON public.practice_attempts
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()))
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "practice_attempts_delete_own" ON public.practice_attempts;
  DROP POLICY IF EXISTS "practice_attempts_delete_own_or_operator" ON public.practice_attempts;
  CREATE POLICY "practice_attempts_delete_own_or_operator" ON public.practice_attempts
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));
END $$;

-- ------------------------------------------------------------------------------
-- 4. HARDEN ERROR LAB (errors, error_repairs, retests) RLS
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  -- ERRORS (STUDENT ERROR LAB)
  DROP POLICY IF EXISTS "errors_select_own" ON public.errors;
  DROP POLICY IF EXISTS "errors_select_own_or_operator" ON public.errors;
  CREATE POLICY "errors_select_own_or_operator" ON public.errors
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "errors_insert_own" ON public.errors;
  DROP POLICY IF EXISTS "errors_insert_own_or_operator" ON public.errors;
  CREATE POLICY "errors_insert_own_or_operator" ON public.errors
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "errors_update_own" ON public.errors;
  DROP POLICY IF EXISTS "errors_update_own_or_operator" ON public.errors;
  CREATE POLICY "errors_update_own_or_operator" ON public.errors
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()))
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "errors_delete_own" ON public.errors;
  DROP POLICY IF EXISTS "errors_delete_own_or_operator" ON public.errors;
  CREATE POLICY "errors_delete_own_or_operator" ON public.errors
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  -- ERROR REPAIRS
  DROP POLICY IF EXISTS "error_repairs_select_own" ON public.error_repairs;
  DROP POLICY IF EXISTS "error_repairs_select_own_or_operator" ON public.error_repairs;
  CREATE POLICY "error_repairs_select_own_or_operator" ON public.error_repairs
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "error_repairs_insert_own" ON public.error_repairs;
  DROP POLICY IF EXISTS "error_repairs_insert_own_or_operator" ON public.error_repairs;
  CREATE POLICY "error_repairs_insert_own_or_operator" ON public.error_repairs
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "error_repairs_update_own" ON public.error_repairs;
  DROP POLICY IF EXISTS "error_repairs_update_own_or_operator" ON public.error_repairs;
  CREATE POLICY "error_repairs_update_own_or_operator" ON public.error_repairs
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()))
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "error_repairs_delete_own" ON public.error_repairs;
  DROP POLICY IF EXISTS "error_repairs_delete_own_or_operator" ON public.error_repairs;
  CREATE POLICY "error_repairs_delete_own_or_operator" ON public.error_repairs
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  -- RETESTS
  DROP POLICY IF EXISTS "retests_select_own" ON public.retests;
  DROP POLICY IF EXISTS "retests_select_own_or_operator" ON public.retests;
  CREATE POLICY "retests_select_own_or_operator" ON public.retests
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "retests_insert_own" ON public.retests;
  DROP POLICY IF EXISTS "retests_insert_own_or_operator" ON public.retests;
  CREATE POLICY "retests_insert_own_or_operator" ON public.retests
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "retests_update_own" ON public.retests;
  DROP POLICY IF EXISTS "retests_update_own_or_operator" ON public.retests;
  CREATE POLICY "retests_update_own_or_operator" ON public.retests
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()))
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "retests_delete_own" ON public.retests;
  DROP POLICY IF EXISTS "retests_delete_own_or_operator" ON public.retests;
  CREATE POLICY "retests_delete_own_or_operator" ON public.retests
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));
END $$;

-- ------------------------------------------------------------------------------
-- 5. HARDEN SKILL MASTERY RLS
-- ------------------------------------------------------------------------------

DO $$
BEGIN
  DROP POLICY IF EXISTS "skill_mastery_select_own" ON public.skill_mastery;
  DROP POLICY IF EXISTS "skill_mastery_select_own_or_operator" ON public.skill_mastery;
  CREATE POLICY "skill_mastery_select_own_or_operator" ON public.skill_mastery
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "skill_mastery_insert_own" ON public.skill_mastery;
  DROP POLICY IF EXISTS "skill_mastery_insert_own_or_operator" ON public.skill_mastery;
  CREATE POLICY "skill_mastery_insert_own_or_operator" ON public.skill_mastery
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "skill_mastery_update_own" ON public.skill_mastery;
  DROP POLICY IF EXISTS "skill_mastery_update_own_or_operator" ON public.skill_mastery;
  CREATE POLICY "skill_mastery_update_own_or_operator" ON public.skill_mastery
    FOR UPDATE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()))
    WITH CHECK (auth.uid() = user_id OR public.is_operator(auth.uid()));

  DROP POLICY IF EXISTS "skill_mastery_delete_own" ON public.skill_mastery;
  DROP POLICY IF EXISTS "skill_mastery_delete_own_or_operator" ON public.skill_mastery;
  CREATE POLICY "skill_mastery_delete_own_or_operator" ON public.skill_mastery
    FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.is_operator(auth.uid()));
END $$;

-- ------------------------------------------------------------------------------
-- 6. REVOKE ANON ACCESS & GRANT AUTHENTICATED ROLES
-- ------------------------------------------------------------------------------

REVOKE ALL ON public.student_profiles FROM anon;
REVOKE ALL ON public.diagnostic_sessions FROM anon;
REVOKE ALL ON public.diagnostic_answers FROM anon;
REVOKE ALL ON public.diagnostic_results FROM anon;
REVOKE ALL ON public.missions FROM anon;
REVOKE ALL ON public.practice_attempts FROM anon;
REVOKE ALL ON public.errors FROM anon;
REVOKE ALL ON public.error_repairs FROM anon;
REVOKE ALL ON public.retests FROM anon;
REVOKE ALL ON public.skill_mastery FROM anon;
REVOKE ALL ON public.payment_orders FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnostic_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnostic_answers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.diagnostic_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.missions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.practice_attempts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.errors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.error_repairs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.retests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_mastery TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_orders TO authenticated;

-- Optional view alias for developer/operator clarity
CREATE OR REPLACE VIEW public.student_error_lab AS
  SELECT * FROM public.errors;

COMMENT ON VIEW public.student_error_lab IS 'Convenience alias view for student errors and misconceptions laboratory';
