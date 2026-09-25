import fs from 'fs';
import { OFFICIAL_PROGRAMS } from '../src/lib/orientation/data/programs.ts';
import { OFFICIAL_INSTITUTIONS } from '../src/lib/orientation/data/institutions.ts';
import { OFFICIAL_SOURCES } from '../src/lib/orientation/data/sources.ts';
import { OFFICIAL_FIELDS } from '../src/lib/orientation/data/fields.ts';

let sql = `-- ==============================================================================
-- 028_verified_orientation_data_and_sources.sql
-- Verified Official Algerian Orientation Data Migration & Sourced Provenance
-- Single Source of Truth for Algerian Higher Education Orientation Subsystem (MESRS)
-- ==============================================================================

-- 1. ENHANCE / ENSURE ORIENTATION SOURCES TABLE
CREATE TABLE IF NOT EXISTS public.orientation_sources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    publication_year TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('OFFICIAL_CIRCULAR', 'MINISTERIAL_DECREE', 'ANNUAL_CUTOFF_REPORT', 'INSTITUTION_REGULATION')),
    reference_section TEXT,
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (verification_status IN ('VERIFIED', 'PARTIALLY_VERIFIED', 'UNVERIFIED')),
    verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orientation_sources ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
    CREATE POLICY "Anyone can read orientation sources" ON public.orientation_sources FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE POLICY "Service role full access orientation sources" ON public.orientation_sources FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Ensure bac_stream_id in program_cutoffs
DO $$ BEGIN
    ALTER TABLE public.program_cutoffs ADD COLUMN IF NOT EXISTS bac_stream_id TEXT REFERENCES public.bac_streams(id) ON DELETE CASCADE;
EXCEPTION WHEN duplicate_column THEN NULL; END $$;

-- 2. INSERT VERIFIED SOURCES
`;

for (const s of OFFICIAL_SOURCES) {
  sql += `INSERT INTO public.orientation_sources (id, title, url, publication_year, academic_year, source_type, reference_section, verification_status, verified_at, notes)
VALUES (
  '${s.id}',
  '${s.title.replace(/'/g, "''")}',
  '${s.url}',
  '${s.publicationYear}',
  '${s.academicYear}',
  '${s.sourceType}',
  ${s.referenceSection ? `'${s.referenceSection.replace(/'/g, "''")}'` : 'NULL'},
  '${s.verificationStatus}',
  '${s.verifiedAt || new Date().toISOString()}',
  ${s.notes ? `'${s.notes.replace(/'/g, "''")}'` : 'NULL'}
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  url = EXCLUDED.url,
  verification_status = EXCLUDED.verification_status;
\n`;
}

sql += `\n-- 3. INSERT VERIFIED INSTITUTIONS (${OFFICIAL_INSTITUTIONS.length})\n`;
for (const inst of OFFICIAL_INSTITUTIONS) {
  sql += `INSERT INTO public.institutions (id, code, name_ar, name_fr, short_name, institution_type, wilaya_id, address, website_url, is_active)
VALUES (
  gen_random_uuid(),
  '${inst.code}',
  '${inst.nameAr.replace(/'/g, "''")}',
  '${inst.nameFr.replace(/'/g, "''")}',
  ${inst.shortName ? `'${inst.shortName.replace(/'/g, "''")}'` : 'NULL'},
  '${inst.institutionType}',
  ${inst.wilayaId},
  ${inst.address ? `'${inst.address.replace(/'/g, "''")}'` : 'NULL'},
  ${inst.websiteUrl ? `'${inst.websiteUrl.replace(/'/g, "''")}'` : 'NULL'},
  true
) ON CONFLICT (code) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  short_name = EXCLUDED.short_name,
  institution_type = EXCLUDED.institution_type,
  wilaya_id = EXCLUDED.wilaya_id,
  address = EXCLUDED.address,
  website_url = EXCLUDED.website_url;
\n`;
}

sql += `\n-- 4. INSERT VERIFIED PROGRAMS (${OFFICIAL_PROGRAMS.length})\n`;
for (const p of OFFICIAL_PROGRAMS) {
  sql += `INSERT INTO public.programs (
  program_code, field_id, name_ar, name_fr, specialty_ar, training_type, degree_type, duration_years, academic_year, is_active, data_quality_status
) VALUES (
  '${p.programCode}',
  '${p.fieldId}',
  '${p.nameAr.replace(/'/g, "''")}',
  '${p.nameFr.replace(/'/g, "''")}',
  ${p.specialtyAr ? `'${p.specialtyAr.replace(/'/g, "''")}'` : 'NULL'},
  '${p.trainingType}',
  '${p.degreeType.replace(/'/g, "''")}',
  ${p.durationYears},
  '${p.academicYear}',
  true,
  '${p.dataQualityStatus}'
) ON CONFLICT (program_code, academic_year) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_fr = EXCLUDED.name_fr,
  data_quality_status = EXCLUDED.data_quality_status;
\n`;
}

sql += `\n-- 5. INSERT ADMISSION RULES & VERIFIED FORMULAS\n`;
for (const p of OFFICIAL_PROGRAMS) {
  for (const r of (p.eligibilityRules || [])) {
    const formulaJson = r.weightedFormula ? `'${JSON.stringify(r.weightedFormula).replace(/'/g, "''")}'::jsonb` : 'NULL';
    const addCondJson = `'${JSON.stringify(r.additionalConditions || []).replace(/'/g, "''")}'::jsonb`;
    
    sql += `INSERT INTO public.admission_rules (
  program_id, bac_stream_id, priority, ranking_basis, minimum_general_average, minimum_weighted_average,
  mathematics_min, physics_min, natural_sciences_min, required_subject, required_subject_min,
  weighted_formula, geographic_condition, additional_conditions, academic_year, data_confidence
) SELECT 
  p.id, '${r.bacStreamId}', ${r.priority}, '${r.rankingBasis}', ${r.minimumGeneralAverage ?? 'NULL'}, ${r.minimumWeightedAverage ?? 'NULL'},
  ${r.mathematicsMin ?? 'NULL'}, ${r.physicsMin ?? 'NULL'}, ${r.naturalSciencesMin ?? 'NULL'}, ${r.requiredSubject ? `'${r.requiredSubject}'` : 'NULL'}, ${r.requiredSubjectMin ?? 'NULL'},
  ${formulaJson}, ${r.geographicCondition ? `'${r.geographicCondition.replace(/'/g, "''")}'` : 'NULL'}, ${addCondJson}, '${r.academicYear}', '${r.dataConfidence}'
FROM public.programs p
WHERE p.program_code = '${p.programCode}' AND p.academic_year = '${p.academicYear}'
ON CONFLICT (program_id, bac_stream_id, academic_year) DO UPDATE SET
  ranking_basis = EXCLUDED.ranking_basis,
  minimum_general_average = EXCLUDED.minimum_general_average,
  minimum_weighted_average = EXCLUDED.minimum_weighted_average,
  weighted_formula = EXCLUDED.weighted_formula;
\n`;
  }
}

sql += `\n-- 6. INSERT STREAM-STRATIFIED VERIFIED CUTOFFS\n`;
for (const p of OFFICIAL_PROGRAMS) {
  for (const c of (p.cutoffs || [])) {
    sql += `INSERT INTO public.program_cutoffs (
  program_id, bac_stream_id, priority, academic_year, cutoff_general_average, cutoff_weighted_average, source, is_official
) SELECT
  p.id, ${c.bacStreamId ? `'${c.bacStreamId}'` : 'NULL'}, ${c.priority ?? 'NULL'}, '${c.academicYear}', ${c.cutoffGeneralAverage ?? 'NULL'}, ${c.cutoffWeightedAverage ?? 'NULL'}, '${c.source.replace(/'/g, "''")}', ${c.isOfficial}
FROM public.programs p
WHERE p.program_code = '${p.programCode}'
ON CONFLICT DO NOTHING;
\n`;
  }
}

fs.writeFileSync('supabase/migrations/028_verified_orientation_data_and_sources.sql', sql, 'utf8');
console.log('Successfully written migration 028_verified_orientation_data_and_sources.sql');
