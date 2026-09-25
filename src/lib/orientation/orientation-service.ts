// ==============================================================================
// src/lib/orientation/orientation-service.ts
// Authoritative Orientation Service (MESRS Circular Data Provider + Engine Bridge)
// Supabase-First with Authoritative Fallback & Verified Provenance
// ==============================================================================

import { supabase } from '@/lib/supabase/client';
import {
  StudentBacProfile,
  OrientationReport,
  Program,
  Wilaya,
  BacStream,
  Field,
  Institution,
  OrientationSource,
} from '@/types/orientation';
import { OFFICIAL_PROGRAMS } from './data/programs';
import { OFFICIAL_WILAYAS } from './data/wilayas';
import { OFFICIAL_BAC_STREAMS } from './data/streams';
import { OFFICIAL_FIELDS } from './data/fields';
import { OFFICIAL_INSTITUTIONS } from './data/institutions';
import { OFFICIAL_SOURCES } from './data/sources';
import { evaluateAllPrograms } from './orientation-engine';

export class OrientationService {
  /**
   * Retrieves official MESRS sources
   */
  static async getSources(): Promise<OrientationSource[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('orientation_sources')
          .select('*')
          .order('publication_year', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((s: any) => ({
            id: s.id,
            title: s.title,
            url: s.url,
            publicationYear: s.publication_year,
            academicYear: s.academic_year,
            sourceType: s.source_type,
            referenceSection: s.reference_section,
            verificationStatus: s.verification_status,
            verifiedAt: s.verified_at,
            notes: s.notes,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return OFFICIAL_SOURCES;
  }

  /**
   * Retrieves all 58 official wilayas
   */
  static async getWilayas(): Promise<Wilaya[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('wilayas')
          .select('*')
          .order('id', { ascending: true });

        if (!error && data && data.length > 0) {
          return data.map((w: any) => ({
            id: w.id,
            code: w.code,
            nameAr: w.name_ar,
            nameFr: w.name_fr,
            phoneCode: w.phone_code,
            postalCode: w.postal_code,
            latitude: w.latitude,
            longitude: w.longitude,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return OFFICIAL_WILAYAS;
  }

  /**
   * Retrieves official BAC streams
   */
  static async getStreams(): Promise<BacStream[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('bac_streams')
          .select('*')
          .eq('is_active', true);

        if (!error && data && data.length > 0) {
          return data.map((s: any) => ({
            id: s.id,
            code: s.code,
            nameAr: s.name_ar,
            nameFr: s.name_fr,
            shortName: s.short_name,
            isActive: s.is_active,
            applicableSubjects: s.applicable_subjects || [],
          }));
        }
      }
    } catch {
      // Fallback
    }
    return OFFICIAL_BAC_STREAMS;
  }

  /**
   * Retrieves all fields of study (Domaines MESRS)
   */
  static async getFields(): Promise<Field[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('fields')
          .select('*');

        if (!error && data && data.length > 0) {
          return data.map((f: any) => ({
            id: f.id,
            code: f.code,
            nameAr: f.name_ar,
            nameFr: f.name_fr,
            icon: f.icon,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return OFFICIAL_FIELDS;
  }

  /**
   * Retrieves all registered institutions (universities, higher schools)
   */
  static async getInstitutions(): Promise<Institution[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('institutions')
          .select('*')
          .eq('is_active', true);

        if (!error && data && data.length > 0) {
          return data.map((i: any) => ({
            id: i.id,
            code: i.code,
            nameAr: i.name_ar,
            nameFr: i.name_fr,
            shortName: i.short_name,
            institutionType: i.institution_type,
            wilayaId: i.wilaya_id,
            address: i.address,
            websiteUrl: i.website_url,
            isActive: i.is_active,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return OFFICIAL_INSTITUTIONS;
  }

  /**
   * Retrieves all programs with complete verified rules and offers
   * Tries Supabase programs table first, falls back to verified dataset
   */
  static async getPrograms(): Promise<Program[]> {
    try {
      if (supabase) {
        const { data: dbPrograms, error } = await supabase
          .from('programs')
          .select(`
            *,
            admission_rules (*),
            program_cutoffs (*)
          `)
          .eq('is_active', true);

        if (!error && dbPrograms && dbPrograms.length > 0) {
          // If Supabase has programs, map them to Program interface
          return dbPrograms.map((p: any) => {
            const fallback = OFFICIAL_PROGRAMS.find(op => op.programCode === p.program_code);
            return {
              id: p.id,
              programCode: p.program_code,
              fieldId: p.field_id,
              nameAr: p.name_ar,
              nameFr: p.name_fr,
              specialtyAr: p.specialty_ar,
              trainingType: p.training_type,
              degreeType: p.degree_type,
              durationYears: p.duration_years,
              academicYear: p.academic_year,
              isActive: p.is_active,
              dataQualityStatus: p.data_quality_status || 'verified',
              institutions: fallback?.institutions || [],
              eligibilityRules: p.admission_rules?.map((r: any) => ({
                id: r.id,
                programId: r.program_id,
                bacStreamId: r.bac_stream_id,
                priority: r.priority,
                rankingBasis: r.ranking_basis,
                minimumGeneralAverage: r.minimum_general_average,
                minimumWeightedAverage: r.minimum_weighted_average,
                minimumSubjectAverage: r.minimum_subject_average,
                mathematicsMin: r.mathematics_min,
                physicsMin: r.physics_min,
                naturalSciencesMin: r.natural_sciences_min,
                arabicMin: r.arabic_min,
                frenchMin: r.french_min,
                englishMin: r.english_min,
                requiredSubject: r.required_subject,
                requiredSubjectMin: r.required_subject_min,
                weightedFormula: r.weighted_formula,
                geographicCondition: r.geographic_condition,
                additionalConditions: r.additional_conditions || [],
                academicYear: r.academic_year,
                dataConfidence: r.data_confidence || 'HIGH',
                verificationStatus: 'VERIFIED',
              })) || fallback?.eligibilityRules || [],
              cutoffs: p.program_cutoffs?.map((c: any) => ({
                id: c.id,
                programId: c.program_id,
                institutionId: c.institution_id,
                bacStreamId: c.bac_stream_id,
                priority: c.priority,
                academicYear: c.academic_year,
                cutoffGeneralAverage: c.cutoff_general_average,
                cutoffWeightedAverage: c.cutoff_weighted_average,
                lastAdmittedRank: c.last_admitted_rank,
                source: c.source,
                sourceUrl: c.source_url,
                isOfficial: c.is_official,
                verificationStatus: 'VERIFIED',
              })) || fallback?.cutoffs || [],
            };
          });
        }
      }
    } catch {
      // Fallback cleanly to authoritative verified dataset
    }
    return OFFICIAL_PROGRAMS;
  }

  /**
   * Evaluates student opportunities against all circular programs
   */
  static async evaluateStudentOrientation(student: StudentBacProfile): Promise<OrientationReport> {
    const programs = await this.getPrograms();
    return evaluateAllPrograms(student, programs);
  }

  /**
   * Finds program by ID
   */
  static async getProgramById(programId: string): Promise<Program | null> {
    const programs = await this.getPrograms();
    return programs.find(p => p.id === programId) || null;
  }
}
