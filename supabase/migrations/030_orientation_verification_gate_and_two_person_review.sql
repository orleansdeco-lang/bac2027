-- ==============================================================================
-- 030_orientation_verification_gate_and_two_person_review.sql
-- Two-Person Verification Workflow & Strict Publication Gate
-- Invariant: No record can transition to 'PUBLISHED' without verified_by AND second_reviewer.
-- Invariant: Non-destructive migration (additive only).
-- ==============================================================================

-- 1. ADD TWO-PERSON REVIEW & VERIFICATION COLUMNS TO PROGRAMS
DO $$ BEGIN
    ALTER TABLE public.programs 
        ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'VERIFIED' 
            CHECK (verification_status IN ('VERIFIED', 'PARTIALLY_VERIFIED', 'CONDITIONAL', 'UNKNOWN', 'LEGACY_UNVERIFIED')),
        ADD COLUMN IF NOT EXISTS verified_by TEXT,
        ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS second_reviewer TEXT,
        ADD COLUMN IF NOT EXISTS second_reviewed_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- 2. ADD TWO-PERSON REVIEW COLUMNS TO ADMISSION RULES
DO $$ BEGIN
    ALTER TABLE public.admission_rules 
        ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'VERIFIED' 
            CHECK (verification_status IN ('VERIFIED', 'PARTIALLY_VERIFIED', 'CONDITIONAL', 'UNKNOWN', 'LEGACY_UNVERIFIED')),
        ADD COLUMN IF NOT EXISTS verified_by TEXT,
        ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS second_reviewer TEXT,
        ADD COLUMN IF NOT EXISTS second_reviewed_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- 3. ADD SCOPE & VERIFICATION COLUMNS TO PROGRAM CUTOFFS
DO $$ BEGIN
    ALTER TABLE public.program_cutoffs 
        ADD COLUMN IF NOT EXISTS scope TEXT NOT NULL DEFAULT 'STREAM' 
            CHECK (scope IN ('STREAM', 'GENERAL')),
        ADD COLUMN IF NOT EXISTS cutoff_type TEXT NOT NULL DEFAULT 'WEIGHTED' 
            CHECK (cutoff_type IN ('WEIGHTED', 'GENERAL')),
        ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'VERIFIED' 
            CHECK (verification_status IN ('VERIFIED', 'PARTIALLY_VERIFIED', 'CONDITIONAL', 'UNKNOWN', 'LEGACY_UNVERIFIED')),
        ADD COLUMN IF NOT EXISTS verified_by TEXT,
        ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS second_reviewer TEXT,
        ADD COLUMN IF NOT EXISTS second_reviewed_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- 4. TWO-PERSON REVIEW AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.orientation_review_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_type TEXT NOT NULL CHECK (record_type IN ('PROGRAM', 'ADMISSION_RULE', 'CUTOFF', 'GEOGRAPHIC_RULE', 'SOURCE')),
    record_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('SUBMIT_FOR_VERIFICATION', 'FIRST_VERIFY', 'SECOND_REVIEW_APPROVE', 'REJECT', 'PUBLISH', 'UNPUBLISH')),
    reviewer TEXT NOT NULL,
    reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orientation_review_logs_rec ON public.orientation_review_logs (record_type, record_id);
CREATE INDEX IF NOT EXISTS idx_orientation_review_logs_time ON public.orientation_review_logs (reviewed_at DESC);

ALTER TABLE public.orientation_review_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Public read review logs" ON public.orientation_review_logs FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. FUNCTION & TRIGGER TO ENFORCE TWO-PERSON VERIFICATION BEFORE PUBLICATION
CREATE OR REPLACE FUNCTION check_orientation_publication_gate()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting to PUBLISHED, verify that first verification AND second review exist
    IF NEW.publication_status = 'PUBLISHED' THEN
        IF NEW.verified_by IS NULL OR NEW.verified_at IS NULL THEN
            RAISE EXCEPTION 'Cannot publish record %: First verification (verified_by, verified_at) is missing.', NEW.id;
        END IF;
        IF NEW.second_reviewer IS NULL OR NEW.second_reviewed_at IS NULL THEN
            RAISE EXCEPTION 'Cannot publish record %: Second independent reviewer sign-off (second_reviewer, second_reviewed_at) is missing.', NEW.id;
        END IF;
        IF NEW.verified_by = NEW.second_reviewer THEN
            RAISE EXCEPTION 'Cannot publish record %: First and second reviewers must be distinct persons.', NEW.id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_programs_pub_gate ON public.programs;
CREATE TRIGGER trg_programs_pub_gate
BEFORE INSERT OR UPDATE ON public.programs
FOR EACH ROW EXECUTE FUNCTION check_orientation_publication_gate();

DROP TRIGGER IF EXISTS trg_admission_rules_pub_gate ON public.admission_rules;
CREATE TRIGGER trg_admission_rules_pub_gate
BEFORE INSERT OR UPDATE ON public.admission_rules
FOR EACH ROW EXECUTE FUNCTION check_orientation_publication_gate();

-- End of Migration 030
