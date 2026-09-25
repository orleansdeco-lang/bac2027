-- ==============================================================================
-- 031_official_source_evidence_and_review_audit.sql
-- Subsystem: Algerian University Orientation (SHATER - MESRS 2026-2027)
-- Purpose: Official Source Evidence Records, Tiering, and Two-Person Audit Gate
-- Invariants:
-- 1. Source Tiering: OFFICIAL_PRIMARY, OFFICIAL_INSTITUTIONAL, OFFICIAL_HISTORICAL, SECONDARY, UNVERIFIED
-- 2. Two-Person Independence: verified_by != second_reviewer strictly enforced at all times
-- 3. Non-destructive: Additive schema evolution preserving existing data
-- ==============================================================================

-- 1. ADD SOURCE QUALITY TIER AND EXTENDED PROVENANCE TO ORIENTATION_SOURCES
DO $$ BEGIN
    ALTER TABLE public.orientation_sources
        ADD COLUMN IF NOT EXISTS source_tier TEXT NOT NULL DEFAULT 'OFFICIAL_PRIMARY'
            CHECK (source_tier IN ('OFFICIAL_PRIMARY', 'OFFICIAL_INSTITUTIONAL', 'OFFICIAL_HISTORICAL', 'SECONDARY', 'UNVERIFIED')),
        ADD COLUMN IF NOT EXISTS page_number TEXT,
        ADD COLUMN IF NOT EXISTS article_number TEXT,
        ADD COLUMN IF NOT EXISTS exact_circular_quote TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- 2. ADD EVIDENCE COLUMNS TO ADMISSION_RULES
DO $$ BEGIN
    ALTER TABLE public.admission_rules
        ADD COLUMN IF NOT EXISTS section_reference TEXT,
        ADD COLUMN IF NOT EXISTS exact_circular_quote TEXT;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- 3. EXPAND ORIENTATION_REVIEW_LOGS COLUMNS
DO $$ BEGIN
    ALTER TABLE public.orientation_review_logs
        ADD COLUMN IF NOT EXISTS reviewer_role TEXT DEFAULT 'data_engineer',
        ADD COLUMN IF NOT EXISTS previous_status TEXT DEFAULT 'DRAFT',
        ADD COLUMN IF NOT EXISTS new_status TEXT DEFAULT 'VERIFIED',
        ADD COLUMN IF NOT EXISTS source_id TEXT REFERENCES public.orientation_sources(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- 4. CREATE RULE_EVIDENCE_RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.rule_evidence_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES public.admission_rules(id) ON DELETE CASCADE,
    program_code TEXT NOT NULL,
    bac_stream_id TEXT NOT NULL REFERENCES public.bac_streams(id),
    source_id TEXT NOT NULL REFERENCES public.orientation_sources(id),
    source_tier TEXT NOT NULL CHECK (source_tier IN ('OFFICIAL_PRIMARY', 'OFFICIAL_INSTITUTIONAL', 'OFFICIAL_HISTORICAL', 'SECONDARY', 'UNVERIFIED')),
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    page_or_section TEXT NOT NULL,
    exact_circular_quote TEXT NOT NULL,
    stream_priority INTEGER NOT NULL CHECK (stream_priority BETWEEN 1 AND 5),
    formula_expression TEXT,
    geographic_scope TEXT NOT NULL CHECK (geographic_scope IN ('national', 'regional', 'local')),
    geographic_status TEXT NOT NULL DEFAULT 'OFFICIALLY_VERIFIED' CHECK (geographic_status IN ('OFFICIALLY_VERIFIED', 'PENDING_OFFICIAL_ANNEX')),
    first_reviewer TEXT NOT NULL,
    first_reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    first_reviewer_role TEXT NOT NULL DEFAULT 'technical_auditor',
    second_reviewer TEXT,
    second_reviewed_at TIMESTAMPTZ,
    second_reviewer_role TEXT,
    verification_status TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (verification_status IN ('OFFICIALLY_VERIFIED', 'PENDING_VERIFICATION', 'BLOCKED_CONFLICT')),
    publication_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (publication_status IN ('DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'PUBLISHED', 'LEGACY')),
    audit_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rule_evidence_code ON public.rule_evidence_records (program_code, bac_stream_id);
CREATE INDEX IF NOT EXISTS idx_rule_evidence_source ON public.rule_evidence_records (source_id);
CREATE INDEX IF NOT EXISTS idx_rule_evidence_status ON public.rule_evidence_records (verification_status);

ALTER TABLE public.rule_evidence_records ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Public read verified rule evidence" 
    ON public.rule_evidence_records FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5. FUNCTION TO PREVENT SELF-APPROVAL AND ENFORCE SOURCE QUALITY BEFORE PUBLICATION
CREATE OR REPLACE FUNCTION check_orientation_publication_gate_v2()
RETURNS TRIGGER AS $$
DECLARE
    src_tier TEXT;
BEGIN
    -- Strict check: first reviewer and second reviewer cannot be the same person
    IF NEW.second_reviewer IS NOT NULL AND NEW.verified_by IS NOT NULL THEN
        IF NEW.verified_by = NEW.second_reviewer THEN
            RAISE EXCEPTION 'Security Invariant Violated on record %: First reviewer (%) and second reviewer (%) must be distinct individuals.', NEW.id, NEW.verified_by, NEW.second_reviewer;
        END IF;
    END IF;

    -- If transitioning to PUBLISHED:
    IF NEW.publication_status = 'PUBLISHED' THEN
        -- 1. Ensure both reviewers exist and are distinct
        IF NEW.verified_by IS NULL OR NEW.verified_at IS NULL THEN
            RAISE EXCEPTION 'Cannot publish record %: First verification (verified_by, verified_at) is missing.', NEW.id;
        END IF;
        IF NEW.second_reviewer IS NULL OR NEW.second_reviewed_at IS NULL THEN
            RAISE EXCEPTION 'Cannot publish record %: Second independent reviewer sign-off (second_reviewer, second_reviewed_at) is missing.', NEW.id;
        END IF;
        IF NEW.verified_by = NEW.second_reviewer THEN
            RAISE EXCEPTION 'Cannot publish record %: Reviewers must be two distinct individuals.', NEW.id;
        END IF;

        -- 2. Verify source tier if source_id is present
        IF NEW.source_id IS NOT NULL THEN
            SELECT source_tier INTO src_tier FROM public.orientation_sources WHERE id = NEW.source_id;
            IF src_tier IS NOT NULL AND src_tier NOT IN ('OFFICIAL_PRIMARY', 'OFFICIAL_INSTITUTIONAL', 'OFFICIAL_HISTORICAL') THEN
                RAISE EXCEPTION 'Cannot publish record %: Source % is tier %, only official tiers are permitted in production.', NEW.id, NEW.source_id, src_tier;
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_programs_pub_gate ON public.programs;
CREATE TRIGGER trg_programs_pub_gate
BEFORE INSERT OR UPDATE ON public.programs
FOR EACH ROW EXECUTE FUNCTION check_orientation_publication_gate_v2();

DROP TRIGGER IF EXISTS trg_admission_rules_pub_gate ON public.admission_rules;
CREATE TRIGGER trg_admission_rules_pub_gate
BEFORE INSERT OR UPDATE ON public.admission_rules
FOR EACH ROW EXECUTE FUNCTION check_orientation_publication_gate_v2();

-- End of Migration 031
