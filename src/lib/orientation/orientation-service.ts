// ==============================================================================
// src/lib/orientation/orientation-service.ts
// Authoritative Orientation Service (MESRS Circular Data Provider & Engine Bridge)
// Supabase-First with Strict Two-Person Publication Gate & Verified Provenance
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
  InstitutionOffer,
  OrientationSource,
} from '@/types/orientation';
import { OFFICIAL_PROGRAMS } from './data/programs';
import { OFFICIAL_WILAYAS } from './data/wilayas';
import { OFFICIAL_BAC_STREAMS } from './data/streams';
import { OFFICIAL_FIELDS } from './data/fields';
import { OFFICIAL_INSTITUTIONS } from './data/institutions';
import { OFFICIAL_SOURCES } from './data/sources';
import { evaluateAllPrograms } from './orientation-engine';

export interface OrientationQueryOptions {
  includeVerified?: boolean; // When true, includes VERIFIED records (for review/testing). Production default is false.
}

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
      // Fallback below
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
      // Fallback below
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
      // Fallback below
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
      // Fallback below
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
      // Fallback below
    }
    return OFFICIAL_INSTITUTIONS;
  }

  /**
   * Retrieves programs with complete verified rules and offers.
   * STRICT PUBLICATION GATE ENFORCEMENT:
   * - By default (production): ONLY returns programs with publicationStatus = 'PUBLISHED'.
   * - In review/test mode (options.includeVerified = true): returns 'VERIFIED' and 'PUBLISHED' records.
   * - Since currently 0 records have completed two-person sign-off to become 'PUBLISHED',
   *   production calls return an empty array until the human review gate is unlocked.
   */
  static async getPrograms(options?: OrientationQueryOptions): Promise<Program[]> {
    const includeVerified = options?.includeVerified ?? false;
    const allowedStatuses = includeVerified ? ['PUBLISHED', 'VERIFIED'] : ['PUBLISHED'];

    try {
      if (supabase) {
        const { data: dbPrograms, error } = await supabase
          .from('programs')
          .select(`
            *,
            admission_rules (*),
            program_cutoffs (*),
            program_institutions (
              registration_scope,
              institution:institutions (*)
            ),
            geographic_rules (
              registration_scope,
              institution:institutions (*),
              geographic_rule_wilayas (wilaya_id)
            )
          `)
          .eq('is_active', true)
          .eq('is_legacy', false)
          .in('publication_status', allowedStatuses);

        if (!error && dbPrograms) {
          // If in production mode and 0 published records exist, return []
          if (!includeVerified && dbPrograms.length === 0) {
            return [];
          }

          if (dbPrograms.length > 0) {
            return dbPrograms.map((p: any) => {
              const fallback = OFFICIAL_PROGRAMS.find(op => op.programCode === p.program_code);

              // Map institutions from geographic_rules or program_institutions
              let institutions: InstitutionOffer[] = [];
              if (p.geographic_rules && p.geographic_rules.length > 0) {
                institutions = p.geographic_rules
                  .filter((gr: any) => gr.institution)
                  .map((gr: any) => ({
                    institution: {
                      id: gr.institution.id,
                      code: gr.institution.code,
                      nameAr: gr.institution.name_ar,
                      nameFr: gr.institution.name_fr,
                      shortName: gr.institution.short_name,
                      institutionType: gr.institution.institution_type,
                      wilayaId: gr.institution.wilaya_id,
                      address: gr.institution.address,
                      websiteUrl: gr.institution.website_url,
                      isActive: gr.institution.is_active,
                    },
                    registrationScope: gr.registration_scope,
                    eligibleWilayas: gr.geographic_rule_wilayas?.map((w: any) => w.wilaya_id) || [],
                  }));
              } else if (p.program_institutions && p.program_institutions.length > 0) {
                institutions = p.program_institutions
                  .filter((pi: any) => pi.institution)
                  .map((pi: any) => ({
                    institution: {
                      id: pi.institution.id,
                      code: pi.institution.code,
                      nameAr: pi.institution.name_ar,
                      nameFr: pi.institution.name_fr,
                      shortName: pi.institution.short_name,
                      institutionType: pi.institution.institution_type,
                      wilayaId: pi.institution.wilaya_id,
                      address: pi.institution.address,
                      websiteUrl: pi.institution.website_url,
                      isActive: pi.institution.is_active,
                    },
                    registrationScope: pi.registration_scope,
                  }));
              } else if (fallback?.institutions) {
                institutions = fallback.institutions;
              }

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
                publicationStatus: p.publication_status,
                dataQualityStatus: p.data_quality_status || (p.publication_status === 'PUBLISHED' || p.publication_status === 'VERIFIED' ? 'verified' : 'partially_verified'),
                institutions,
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
                  sourceId: r.source_id,
                  dataConfidence: r.data_confidence || 'HIGH',
                  verificationStatus: r.verification_status || 'VERIFIED',
                })) || fallback?.eligibilityRules || [],
                cutoffs: p.program_cutoffs?.map((c: any) => ({
                  id: c.id,
                  programId: c.program_id,
                  institutionId: c.institution_id,
                  bacStreamId: c.bac_stream_id,
                  scope: c.scope || 'STREAM',
                  cutoffType: c.cutoff_type || 'WEIGHTED',
                  priority: c.priority,
                  academicYear: c.academic_year,
                  cutoffGeneralAverage: c.cutoff_general_average,
                  cutoffWeightedAverage: c.cutoff_weighted_average,
                  lastAdmittedRank: c.last_admitted_rank,
                  source: c.source,
                  sourceUrl: c.source_url,
                  sourceId: c.source_id,
                  isOfficial: c.is_official,
                  verificationStatus: c.verification_status || 'VERIFIED',
                  publicationStatus: c.publication_status || 'VERIFIED',
                })) || fallback?.cutoffs || [],
                sourceId: p.source_id,
              };
            });
          }
        }
      }
    } catch {
      // Fallback cleanly below
    }

    // Static fallback respecting Publication Gate
    if (!includeVerified) {
      // Production mode: returns only PUBLISHED records. Currently 0 exist.
      return OFFICIAL_PROGRAMS.filter(p => p.publicationStatus === 'PUBLISHED');
    }

    // Review / Test mode: returns VERIFIED records
    return OFFICIAL_PROGRAMS.filter(p => {
      const status = p.publicationStatus || (p.dataQualityStatus === 'verified' ? 'VERIFIED' : 'DRAFT');
      return status === 'VERIFIED' || status === 'PUBLISHED';
    });
  }

  /**
   * Evaluates student opportunities against catalog programs
   * In production mode, evaluates only PUBLISHED programs.
   * In review mode (options.includeVerified = true), evaluates VERIFIED programs.
   */
  static async evaluateStudentOrientation(
    student: StudentBacProfile,
    options?: OrientationQueryOptions
  ): Promise<OrientationReport> {
    const programs = await this.getPrograms(options);
    return evaluateAllPrograms(student, programs, {
      onlyPublished: !options?.includeVerified,
    });
  }

  /**
   * Finds program by ID or program code
   */
  static async getProgramById(
    programId: string,
    options?: OrientationQueryOptions
  ): Promise<Program | null> {
    const programs = await this.getPrograms(options);
    return programs.find(p => p.id === programId || p.programCode === programId) || null;
  }

  /**
   * Retrieves official conflicts and discrepancies tracked for human review
   */
  static async getConflicts() {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('orientation_conflicts')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data;
        }
      }
    } catch {}

    // Fallback documented official conflicts
    return [
      {
        id: 'conf-geo-regional-annex',
        conflictType: 'REGIONAL_ANNEX_MISSING',
        title: 'غياب التحديد الحصري لولايات التكوين الجهوي في بعض التخصصات',
        description: 'ينص المنشور على أن التسجيل جهوي دون إرفاق جدول الولايات التابعة جغرافياً لكل مؤسسة.',
        severity: 'HIGH',
        resolutionStatus: 'UNRESOLVED',
        requiresHumanReview: true,
      },
      {
        id: 'conf-stream-priority-tm-st',
        conflictType: 'STREAM_PRIORITY_AMBIGUITY',
        title: 'تفاوت أولويات شعبة التقني رياضي في الميادين التكنولوجية بين دورات 2024 و 2025',
        description: 'الأولوية 1 في ST والأولوية 2 في المدارس العليا (ESI, ENSIA).',
        severity: 'MEDIUM',
        resolutionStatus: 'RESOLVED_BY_CIRCULAR_PRIORITY',
        requiresHumanReview: true,
      },
      {
        id: 'conf-ens-interview-subjectivity',
        conflictType: 'MANUAL_INTERVIEW_CRITERIA',
        title: 'معايير المقابلة الشفهية والفحص الطبي لمدارس الأساتذة (ENS) غير قابلة للأتمتة',
        description: 'الالتحاق بمدارس الأساتذة مشروط باجتياز مقابلة شفهية وفحص طبي.',
        severity: 'MEDIUM',
        resolutionStatus: 'MANUALLY_VERIFIED',
        requiresHumanReview: true,
      },
      {
        id: 'conf-quota-unspecified-schools',
        conflictType: 'QUOTA_UNSPECIFIED',
        title: 'عدم نشر كوطة المقاعد المخصصة لكل شعبة في المدارس الوطنية العليا',
        description: 'المنشور لا ينشر النسب المئوية للحصص المخصصة لكل شعبة.',
        severity: 'HIGH',
        resolutionStatus: 'UNRESOLVED',
        requiresHumanReview: false,
      },
      {
        id: 'conf-sidi-abdellah-new-schools',
        conflictType: 'NEW_SPECIALTY_UNMAPPED',
        title: 'استحداث مدارس وطنية جديدة في القطب التكنولوجي سيدي عبد الله لدورة 2026',
        description: 'المدارس الجديدة لم تقترن بعد بصدور الأكواد الرسمية في المنشور 01 لدورة 2026.',
        severity: 'LOW',
        resolutionStatus: 'DEFERRED',
        requiresHumanReview: true,
      },
    ];
  }

  /**
   * Retrieves review audit logs
   */
  static async getReviewLogs() {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('orientation_review_logs')
          .select('*')
          .order('reviewed_at', { ascending: false });

        if (!error && data) return data;
      }
    } catch {}
    return [];
  }
}
