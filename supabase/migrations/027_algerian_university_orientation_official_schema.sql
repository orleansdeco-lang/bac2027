-- ==============================================================================
-- 027_algerian_university_orientation_official_schema.sql
-- SHATER BAC — Algerian Higher Education Orientation Architecture (MESRS)
-- Source of Truth: Le Guide / Circulaire Ministérielle Officielle (circulaire.mesrs.dz)
-- Invariant: Multi-Year Versioning, Strict RLS, NULL for Missing, Distinct Cutoffs
-- ==============================================================================

-- 1. ORIENTATION VERSIONS
-- Versioning by academic year (e.g. '2026-2027', '2025-2026')
CREATE TABLE IF NOT EXISTS public.orientation_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year TEXT NOT NULL UNIQUE,
    version_name TEXT NOT NULL,
    source_url TEXT NOT NULL DEFAULT 'https://circulaire.mesrs.dz/',
    source_document TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('OFFICIAL_CIRCULAR', 'MINISTERIAL_DECREE', 'ADDENDUM', 'HISTORICAL_REPORT')),
    published_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    is_current BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orientation_versions_year ON public.orientation_versions (academic_year);
CREATE INDEX IF NOT EXISTS idx_orientation_versions_current ON public.orientation_versions (is_current);

-- 2. BAC STREAMS (Séries de Baccalauréat)
CREATE TABLE IF NOT EXISTS public.bac_streams (
    id TEXT PRIMARY KEY, -- e.g. 'sciences_exp', 'math', 'technique_math', 'gestion_eco', 'lettres_philo', 'langues_etrangeres'
    code TEXT NOT NULL UNIQUE, -- e.g. 'SE', 'M', 'TM', 'GE', 'LP', 'LE'
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    short_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- 3. WILAYAS (58 Official Algerian Wilayas)
CREATE TABLE IF NOT EXISTS public.wilayas (
    id INTEGER PRIMARY KEY, -- 1 to 58
    code TEXT NOT NULL UNIQUE, -- '01', '02', ... '58'
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    phone_code TEXT,
    postal_code TEXT,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6)
);

CREATE INDEX IF NOT EXISTS idx_wilayas_code ON public.wilayas (code);

-- 4. COMMUNES (Municipalities)
CREATE TABLE IF NOT EXISTS public.communes (
    id INTEGER PRIMARY KEY,
    wilaya_id INTEGER NOT NULL REFERENCES public.wilayas(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    daira_ar TEXT,
    postal_code TEXT,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6)
);

CREATE INDEX IF NOT EXISTS idx_communes_wilaya_id ON public.communes (wilaya_id);
CREATE INDEX IF NOT EXISTS idx_communes_code ON public.communes (code);

-- 5. INSTITUTIONS (Higher Education Establishments)
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
    commune_id INTEGER REFERENCES public.communes(id),
    address TEXT,
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    website_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_institutions_wilaya_id ON public.institutions (wilaya_id);
CREATE INDEX IF NOT EXISTS idx_institutions_type ON public.institutions (institution_type);
CREATE INDEX IF NOT EXISTS idx_institutions_is_active ON public.institutions (is_active);

-- 6. FIELDS (Domaines de Formation MESRS)
CREATE TABLE IF NOT EXISTS public.fields (
    id TEXT PRIMARY KEY, -- e.g. 'ST', 'MI', 'SNV', 'SM', 'SEGC', 'DSP', 'LLE', 'MED', 'PHARM', 'DENT', 'VET', 'ARCH', 'STAPS', 'ARTS', 'HUM'
    code TEXT NOT NULL UNIQUE,
    name_ar TEXT NOT NULL,
    name_fr TEXT NOT NULL,
    icon TEXT
);

-- 7. PROGRAMS (Filières et Formations Universitaires)
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_code TEXT NOT NULL, -- Official code in circular (e.g. '011', '071')
    field_id TEXT NOT NULL REFERENCES public.fields(id) ON DELETE RESTRICT,
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
    academic_year TEXT NOT NULL REFERENCES public.orientation_versions(academic_year) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    data_quality_status TEXT NOT NULL DEFAULT 'verified' CHECK (data_quality_status IN ('verified', 'partially_verified', 'unverified', 'deprecated')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_program_code_year UNIQUE (program_code, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_programs_code_year ON public.programs (program_code, academic_year);
CREATE INDEX IF NOT EXISTS idx_programs_field_id ON public.programs (field_id);
CREATE INDEX IF NOT EXISTS idx_programs_training_type ON public.programs (training_type);

-- 8. PROGRAM INSTITUTIONS (Offer of Programs per University / Scope)
CREATE TABLE IF NOT EXISTS public.program_institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    registration_scope TEXT NOT NULL CHECK (registration_scope IN ('national', 'regional', 'local')),
    academic_year TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_prog_inst_year UNIQUE (program_id, institution_id, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_program_institutions_prog ON public.program_institutions (program_id);
CREATE INDEX IF NOT EXISTS idx_program_institutions_inst ON public.program_institutions (institution_id);
CREATE INDEX IF NOT EXISTS idx_program_institutions_scope ON public.program_institutions (registration_scope);

-- 9. PROGRAM BAC ELIGIBILITY (Accepted BAC Streams & Official Priorities)
CREATE TABLE IF NOT EXISTS public.program_bac_eligibility (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    bac_stream_id TEXT NOT NULL REFERENCES public.bac_streams(id) ON DELETE CASCADE,
    priority INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),
    academic_year TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_prog_stream_priority UNIQUE (program_id, bac_stream_id, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_prog_bac_eligibility_stream ON public.program_bac_eligibility (bac_stream_id, priority);

-- 10. ADMISSION RULES (Conditions Pédagogiques Minimales et Formules)
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
    academic_year TEXT NOT NULL,
    source_id UUID,
    data_confidence TEXT NOT NULL DEFAULT 'HIGH' CHECK (data_confidence IN ('HIGH', 'MEDIUM', 'LOW')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_admission_rule_unique UNIQUE (program_id, bac_stream_id, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_admission_rules_program ON public.admission_rules (program_id);
CREATE INDEX IF NOT EXISTS idx_admission_rules_stream ON public.admission_rules (bac_stream_id);
CREATE INDEX IF NOT EXISTS idx_admission_rules_priority ON public.admission_rules (priority);

-- 11. GEOGRAPHIC RULES (Circonscriptions Géographiques)
CREATE TABLE IF NOT EXISTS public.geographic_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
    registration_scope TEXT NOT NULL CHECK (registration_scope IN ('national', 'regional', 'local', 'wilaya_group', 'commune_group')),
    academic_year TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_geo_rules_prog_inst ON public.geographic_rules (program_id, institution_id);

-- 12. GEOGRAPHIC RULE WILAYAS (Explicit Eligible Wilayas for Regional / Local Programs)
CREATE TABLE IF NOT EXISTS public.geographic_rule_wilayas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    geographic_rule_id UUID NOT NULL REFERENCES public.geographic_rules(id) ON DELETE CASCADE,
    wilaya_id INTEGER NOT NULL REFERENCES public.wilayas(id) ON DELETE CASCADE,
    CONSTRAINT uq_rule_wilaya UNIQUE (geographic_rule_id, wilaya_id)
);

CREATE INDEX IF NOT EXISTS idx_geo_rule_wilayas_rule ON public.geographic_rule_wilayas (geographic_rule_id);
CREATE INDEX IF NOT EXISTS idx_geo_rule_wilayas_wilaya ON public.geographic_rule_wilayas (wilaya_id);

-- 13. PROGRAM CUTOFFS (Historical Admission Statistics — Strictly Distinct from Rules)
CREATE TABLE IF NOT EXISTS public.program_cutoffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
    institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE,
    bac_stream_id TEXT REFERENCES public.bac_streams(id) ON DELETE CASCADE,
    priority INTEGER CHECK (priority BETWEEN 1 AND 5),
    academic_year TEXT NOT NULL,
    cutoff_general_average NUMERIC(4,2) DEFAULT NULL CHECK (cutoff_general_average IS NULL OR (cutoff_general_average >= 0 AND cutoff_general_average <= 20)),
    cutoff_weighted_average NUMERIC(4,2) DEFAULT NULL CHECK (cutoff_weighted_average IS NULL OR (cutoff_weighted_average >= 0 AND cutoff_weighted_average <= 20)),
    last_admitted_rank INTEGER DEFAULT NULL,
    source TEXT NOT NULL DEFAULT 'circulaire_officielle',
    source_url TEXT,
    is_official BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_cutoff_record UNIQUE (program_id, institution_id, bac_stream_id, priority, academic_year)
);

CREATE INDEX IF NOT EXISTS idx_program_cutoffs_lookup ON public.program_cutoffs (program_id, institution_id, academic_year);

-- 14. SOURCES (Authoritative Reference Documents)
CREATE TABLE IF NOT EXISTS public.sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_type TEXT NOT NULL CHECK (source_type IN ('MINISTERIAL_CIRCULAR', 'MESRS_PORTAL', 'FACULTY_DECREE', 'ANNUAL_REPORT')),
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    document_name TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    official BOOLEAN NOT NULL DEFAULT true,
    verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 15. ADMISSION RULE SOURCES
CREATE TABLE IF NOT EXISTS public.admission_rule_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admission_rule_id UUID NOT NULL REFERENCES public.admission_rules(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
    CONSTRAINT uq_rule_source UNIQUE (admission_rule_id, source_id)
);

-- 16. RAW DATA INGESTION LAYER
CREATE TABLE IF NOT EXISTS public.orientation_raw_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year TEXT NOT NULL,
    source_document TEXT NOT NULL,
    section_name TEXT,
    raw_text TEXT NOT NULL,
    raw_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'parsed', 'verified', 'rejected')),
    imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    imported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_raw_records_year ON public.orientation_raw_records (academic_year);
CREATE INDEX IF NOT EXISTS idx_raw_records_status ON public.orientation_raw_records (verification_status);

-- 17. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.orientation_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bac_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wilayas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_bac_eligibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geographic_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geographic_rule_wilayas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.program_cutoffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_rule_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orientation_raw_records ENABLE ROW LEVEL SECURITY;

-- Read Policies: All students & guests can read active/verified orientation data
DO $$
BEGIN
    CREATE POLICY "Anyone can read orientation versions" ON public.orientation_versions FOR SELECT USING (true);
    CREATE POLICY "Anyone can read bac streams" ON public.bac_streams FOR SELECT USING (is_active = true);
    CREATE POLICY "Anyone can read wilayas" ON public.wilayas FOR SELECT USING (true);
    CREATE POLICY "Anyone can read communes" ON public.communes FOR SELECT USING (true);
    CREATE POLICY "Anyone can read institutions" ON public.institutions FOR SELECT USING (is_active = true);
    CREATE POLICY "Anyone can read fields" ON public.fields FOR SELECT USING (true);
    CREATE POLICY "Anyone can read programs" ON public.programs FOR SELECT USING (is_active = true);
    CREATE POLICY "Anyone can read program institutions" ON public.program_institutions FOR SELECT USING (true);
    CREATE POLICY "Anyone can read program bac eligibility" ON public.program_bac_eligibility FOR SELECT USING (true);
    CREATE POLICY "Anyone can read admission rules" ON public.admission_rules FOR SELECT USING (true);
    CREATE POLICY "Anyone can read geographic rules" ON public.geographic_rules FOR SELECT USING (true);
    CREATE POLICY "Anyone can read geographic rule wilayas" ON public.geographic_rule_wilayas FOR SELECT USING (true);
    CREATE POLICY "Anyone can read program cutoffs" ON public.program_cutoffs FOR SELECT USING (true);
    CREATE POLICY "Anyone can read sources" ON public.sources FOR SELECT USING (true);
    CREATE POLICY "Anyone can read admission rule sources" ON public.admission_rule_sources FOR SELECT USING (true);
    CREATE POLICY "Only admins can read raw records" ON public.orientation_raw_records FOR SELECT TO authenticated USING (
        EXISTS (SELECT 1 FROM public.operator_profiles WHERE id = auth.uid() AND is_active = true)
    );
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Write Policies: Strictly restricted to service_role and verified operator admins
CREATE POLICY "Service role full access orientation_versions" ON public.orientation_versions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access bac_streams" ON public.bac_streams FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access wilayas" ON public.wilayas FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access communes" ON public.communes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access institutions" ON public.institutions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access fields" ON public.fields FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access programs" ON public.programs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access program_institutions" ON public.program_institutions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access program_bac_eligibility" ON public.program_bac_eligibility FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access admission_rules" ON public.admission_rules FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access geographic_rules" ON public.geographic_rules FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access geographic_rule_wilayas" ON public.geographic_rule_wilayas FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access program_cutoffs" ON public.program_cutoffs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access sources" ON public.sources FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access admission_rule_sources" ON public.admission_rule_sources FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access orientation_raw_records" ON public.orientation_raw_records FOR ALL TO service_role USING (true) WITH CHECK (true);
