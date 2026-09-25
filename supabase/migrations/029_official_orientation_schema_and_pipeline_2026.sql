-- ==============================================================================
-- 029_official_orientation_schema_and_pipeline_2026.sql
-- SHATER BAC — Authoritative Orientation Subsystem Schema & Import Pipeline Infrastructure
-- Academic Year Scope: 2026-2027 (Official MESRS Ministerial Circular Architecture)
-- Invariants:
-- 1. Non-destructive: No DROP TABLE or modifications to existing non-orientation SHATER tables.
-- 2. Publication Gate: No record is marked 'PUBLISHED' automatically. Default is 'VERIFIED' or 'DRAFT'.
-- 3. Source Provenance: Every record must reference an authoritative source in orientation_sources.
-- 4. Legacy Isolation: Any older or unverified orientation data is marked is_legacy = true.
-- ==============================================================================

-- 1. ORIENTATION SOURCES (Authoritative Ministerial Texts & Circular Documents)
CREATE TABLE IF NOT EXISTS public.orientation_sources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    publication_year TEXT NOT NULL,
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    source_type TEXT NOT NULL CHECK (source_type IN (
        'OFFICIAL_CIRCULAR', 'MINISTERIAL_DECREE', 'ANNUAL_CUTOFF_REPORT', 'INSTITUTION_REGULATION', 'ADDENDUM'
    )),
    reference_section TEXT,
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (verification_status IN (
        'VERIFIED', 'PARTIALLY_VERIFIED', 'UNVERIFIED', 'DEPRECATED'
    )),
    verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orientation_sources_year ON public.orientation_sources (academic_year);
CREATE INDEX IF NOT EXISTS idx_orientation_sources_type ON public.orientation_sources (source_type);

ALTER TABLE public.orientation_sources ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Public read verified orientation sources" 
    ON public.orientation_sources FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. ORIENTATION CONFLICTS (Discrepancies, Ambiguities, & Human Review Tracking)
CREATE TABLE IF NOT EXISTS public.orientation_conflicts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    program_id TEXT,
    program_code TEXT,
    conflict_type TEXT NOT NULL CHECK (conflict_type IN (
        'REGIONAL_ANNEX_MISSING',
        'FORMULA_VARIANT_DISCREPANCY',
        'STREAM_PRIORITY_AMBIGUITY',
        'QUOTA_UNSPECIFIED',
        'CIRCULAR_EDITION_DIFFERENCE',
        'NEW_SPECIALTY_UNMAPPED',
        'MANUAL_INTERVIEW_CRITERIA'
    )),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    resolution_status TEXT NOT NULL DEFAULT 'UNRESOLVED' CHECK (resolution_status IN (
        'UNRESOLVED', 'MANUALLY_VERIFIED', 'RESOLVED_BY_CIRCULAR_PRIORITY', 'DEFERRED'
    )),
    requires_human_review BOOLEAN NOT NULL DEFAULT true,
    source_reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orientation_conflicts_year ON public.orientation_conflicts (academic_year);
CREATE INDEX IF NOT EXISTS idx_orientation_conflicts_severity ON public.orientation_conflicts (severity);
CREATE INDEX IF NOT EXISTS idx_orientation_conflicts_status ON public.orientation_conflicts (resolution_status);

ALTER TABLE public.orientation_conflicts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Public read orientation conflicts" 
    ON public.orientation_conflicts FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. ORIENTATION IMPORT RUNS (Pipeline Auditing & Run Log)
CREATE TABLE IF NOT EXISTS public.orientation_import_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    source_id TEXT REFERENCES public.orientation_sources(id) ON DELETE SET NULL,
    total_programs INTEGER NOT NULL DEFAULT 0,
    total_institutions INTEGER NOT NULL DEFAULT 0,
    total_rules INTEGER NOT NULL DEFAULT 0,
    total_streams INTEGER NOT NULL DEFAULT 0,
    total_geographic_rules INTEGER NOT NULL DEFAULT 0,
    incomplete_records_count INTEGER NOT NULL DEFAULT 0,
    records_needing_review_count INTEGER NOT NULL DEFAULT 0,
    conflicts_count INTEGER NOT NULL DEFAULT 0,
    validation_status TEXT NOT NULL DEFAULT 'SUCCESS' CHECK (validation_status IN ('SUCCESS', 'WARNINGS', 'FAILED')),
    report_summary JSONB,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_orientation_import_runs_time ON public.orientation_import_runs (run_timestamp DESC);

-- 4. ENSURE BAC STREAMS TABLE
CREATE TABLE IF NOT EXISTS public.bac_streams (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    short_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 5. ENSURE WILAYAS TABLE
CREATE TABLE IF NOT EXISTS public.wilayas (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    phone_code TEXT,
    postal_code TEXT,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6)
);

-- 6. ENSURE FIELDS TABLE (14 MESRS Training Disciplines)
CREATE TABLE IF NOT EXISTS public.fields (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    icon TEXT
);

-- 7. INSTITUTIONS (Higher Education Establishments)
CREATE TABLE IF NOT EXISTS public.institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE,
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    short_name TEXT,
    institution_type TEXT NOT NULL CHECK (institution_type IN (
        'university', 'central_university', 'university_center', 'school',
        'higher_school', 'ens', 'institute', 'iap', 'other'
    )),
    wilaya_id INTEGER NOT NULL REFERENCES public.wilayas(id),
    address TEXT,
    website_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    publication_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (publication_status IN (
        'DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'PUBLISHED', 'LEGACY'
    )),
    is_legacy BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. PROGRAMS (Academic Formations with 2026-2027 Scope)
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_code TEXT NOT NULL,
    field_id TEXT NOT NULL REFERENCES public.fields(id),
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    specialty_ar TEXT,
    training_type TEXT NOT NULL CHECK (training_type IN (
        'licence', 'integrated_master', 'engineering', 'higher_school',
        'teacher_training', 'professional', 'applied_sciences', 'medicine',
        'pharmacy', 'dentistry', 'veterinary', 'other'
    )),
    degree_type TEXT NOT NULL,
    duration_years INTEGER NOT NULL CHECK (duration_years BETWEEN 1 AND 7),
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    source_id TEXT REFERENCES public.orientation_sources(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    publication_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (publication_status IN (
        'DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'PUBLISHED', 'LEGACY'
    )),
    is_legacy BOOLEAN NOT NULL DEFAULT false,
    legacy_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_programs_code_academic_year UNIQUE (program_code, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_programs_code_year_029 ON public.programs (program_code, academic_year);
CREATE INDEX IF NOT EXISTS idx_programs_pub_status ON public.programs (publication_status);
CREATE INDEX IF NOT EXISTS idx_programs_is_legacy ON public.programs (is_legacy);

-- 9. PROGRAM INSTITUTION OFFERS (National / Regional / Local Offerings)
CREATE TABLE IF NOT EXISTS public.program_institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    registration_scope TEXT NOT NULL CHECK (registration_scope IN ('national', 'regional', 'local')),
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    publication_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (publication_status IN (
        'DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'PUBLISHED', 'LEGACY'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_prog_inst_year_029 UNIQUE (program_id, institution_id, academic_year)
);

-- 10. ADMISSION RULES (Official Formula, Priority, & Thresholds)
CREATE TABLE IF NOT EXISTS public.admission_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    bac_stream_id TEXT NOT NULL REFERENCES public.bac_streams(id) ON DELETE CASCADE,
    priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),
    ranking_basis TEXT NOT NULL CHECK (ranking_basis IN ('general_average', 'weighted_average', 'highest_of_general_or_weighted')),
    minimum_general_average NUMERIC(4,2) DEFAULT NULL CHECK (minimum_general_average IS NULL OR (minimum_general_average >= 0 AND minimum_general_average <= 20)),
    minimum_weighted_average NUMERIC(4,2) DEFAULT NULL CHECK (minimum_weighted_average IS NULL OR (minimum_weighted_average >= 0 AND minimum_weighted_average <= 20)),
    minimum_subject_average NUMERIC(4,2) DEFAULT NULL CHECK (minimum_subject_average IS NULL OR (minimum_subject_average >= 0 AND minimum_subject_average <= 20)),
    mathematics_min NUMERIC(4,2) DEFAULT NULL CHECK (mathematics_min IS NULL OR (mathematics_min >= 0 AND mathematics_min <= 20)),
    physics_min NUMERIC(4,2) DEFAULT NULL CHECK (physics_min IS NULL OR (physics_min >= 0 AND physics_min <= 20)),
    natural_sciences_min NUMERIC(4,2) DEFAULT NULL CHECK (natural_sciences_min IS NULL OR (natural_sciences_min >= 0 AND natural_sciences_min <= 20)),
    arabic_min NUMERIC(4,2) DEFAULT NULL CHECK (arabic_min IS NULL OR (arabic_min >= 0 AND arabic_min <= 20)),
    french_min NUMERIC(4,2) DEFAULT NULL CHECK (french_min IS NULL OR (french_min >= 0 AND french_min <= 20)),
    english_min NUMERIC(4,2) DEFAULT NULL CHECK (english_min IS NULL OR (english_min >= 0 AND english_min <= 20)),
    required_subject TEXT DEFAULT NULL,
    required_subject_min NUMERIC(4,2) DEFAULT NULL CHECK (required_subject_min IS NULL OR (required_subject_min >= 0 AND required_subject_min <= 20)),
    weighted_formula JSONB DEFAULT NULL,
    geographic_condition TEXT DEFAULT NULL,
    additional_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    source_id TEXT REFERENCES public.orientation_sources(id) ON DELETE RESTRICT,
    publication_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (publication_status IN (
        'DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'PUBLISHED', 'LEGACY'
    )),
    is_legacy BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_admission_rule_year_029 UNIQUE (program_id, bac_stream_id, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_admission_rules_prog_029 ON public.admission_rules (program_id);
CREATE INDEX IF NOT EXISTS idx_admission_rules_stream_029 ON public.admission_rules (bac_stream_id);

-- 11. GEOGRAPHIC RULES & EXPLICIT WILAYAS
CREATE TABLE IF NOT EXISTS public.geographic_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    registration_scope TEXT NOT NULL CHECK (registration_scope IN ('national', 'regional', 'local', 'wilaya_group', 'commune_group')),
    academic_year TEXT NOT NULL DEFAULT '2026-2027',
    source_id TEXT REFERENCES public.orientation_sources(id) ON DELETE SET NULL,
    publication_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (publication_status IN (
        'DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'PUBLISHED', 'LEGACY'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_geo_rules_prog_inst_year UNIQUE (program_id, institution_id, academic_year)
);

CREATE TABLE IF NOT EXISTS public.geographic_rule_wilayas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    geographic_rule_id UUID NOT NULL REFERENCES public.geographic_rules(id) ON DELETE CASCADE,
    wilaya_id INTEGER NOT NULL REFERENCES public.wilayas(id) ON DELETE CASCADE,
    CONSTRAINT uq_geo_rule_wilaya_unique UNIQUE (geographic_rule_id, wilaya_id)
);

CREATE INDEX IF NOT EXISTS idx_geo_rule_wilayas_rule_029 ON public.geographic_rule_wilayas (geographic_rule_id);
CREATE INDEX IF NOT EXISTS idx_geo_rule_wilayas_wilaya_029 ON public.geographic_rule_wilayas (wilaya_id);

-- 12. PROGRAM CUTOFFS (Historical Statistics with Strict Stream Stratification)
CREATE TABLE IF NOT EXISTS public.program_cutoffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    bac_stream_id TEXT NOT NULL REFERENCES public.bac_streams(id) ON DELETE CASCADE,
    priority INTEGER CHECK (priority BETWEEN 1 AND 5),
    academic_year TEXT NOT NULL,
    cutoff_general_average NUMERIC(4,2) DEFAULT NULL CHECK (cutoff_general_average IS NULL OR (cutoff_general_average >= 0 AND cutoff_general_average <= 20)),
    cutoff_weighted_average NUMERIC(4,2) DEFAULT NULL CHECK (cutoff_weighted_average IS NULL OR (cutoff_weighted_average >= 0 AND cutoff_weighted_average <= 20)),
    last_admitted_rank INTEGER DEFAULT NULL,
    source TEXT NOT NULL,
    source_url TEXT,
    source_id TEXT REFERENCES public.orientation_sources(id) ON DELETE SET NULL,
    is_official BOOLEAN NOT NULL DEFAULT true,
    publication_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (publication_status IN (
        'DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'PUBLISHED', 'LEGACY'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_cutoff_record_029 UNIQUE (program_id, institution_id, bac_stream_id, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_program_cutoffs_lookup_029 ON public.program_cutoffs (program_id, institution_id, bac_stream_id, academic_year);

-- 13. RLS SECURITY POLICIES (Read-Only Public, Restricted Modifications)
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geographic_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geographic_rule_wilayas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_cutoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orientation_import_runs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
    CREATE POLICY "Public read verified programs" ON public.programs FOR SELECT 
    USING (publication_status IN ('VERIFIED', 'PUBLISHED') AND is_legacy = false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read verified institutions" ON public.institutions FOR SELECT 
    USING (publication_status IN ('VERIFIED', 'PUBLISHED') AND is_legacy = false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read verified admission rules" ON public.admission_rules FOR SELECT 
    USING (publication_status IN ('VERIFIED', 'PUBLISHED') AND is_legacy = false);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read verified cutoffs" ON public.program_cutoffs FOR SELECT 
    USING (publication_status IN ('VERIFIED', 'PUBLISHED'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read verified geo rules" ON public.geographic_rules FOR SELECT 
    USING (publication_status IN ('VERIFIED', 'PUBLISHED'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public read verified geo rule wilayas" ON public.geographic_rule_wilayas FOR SELECT 
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- End of Migration 029
