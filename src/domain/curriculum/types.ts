/**
 * BAC Mastery V1 — Multi-Stream Curriculum Architecture Types
 * Prompt 20: Comprehensive Multi-Stream Foundations & Verification Standards
 * 
 * Strict Architectural Principles:
 * 1. ZERO UI coupling: Educational taxonomy decoupled from presentation layer.
 * 2. Strict provenance & verification tracking: No unverified claims labeled as official.
 * 3. Multi-stream coverage: Sciences Exp, Math, Technique Math, Gestion-Éco, Lettres-Philo, Langues.
 * 4. Technique Math specialty isolation: Unknown specialty must remain unknown.
 */

import { StreamId, SubjectId, TechniqueMathSpecialty, ExamType, EducationLevel } from "@/types/education";
import { MethodologyFamily } from "@/domain/learning/types";

// ============================================================================
// 1. CURRICULUM CLAIM & VERIFICATION STATES (PROMPT 20 § 3 & 9)
// ============================================================================

/**
 * Standard classification for curriculum facts, circulars, and coefficients
 */
export type CurriculumVerificationStatus =
  | "OFFICIAL_CURRENT"      // Confirmed in active official ministerial decree/circular for target academic year
  | "OFFICIAL_HISTORICAL"   // Confirmed in previous executive decree (e.g. Decree 07-142), active until officially superseded
  | "RESEARCH_SUPPORTED"    // Supported by educational science, pedagogical consensus, or empirical research
  | "BAC_MASTERY_DERIVED"   // Original instructional design or pedagogical taxonomy by BAC Mastery
  | "PROVISIONAL"           // Working baseline pending formal ministerial publication or verification
  | "UNVERIFIED";           // Unconfirmed public claim; explicitly excluded from official assertions

/**
 * Content entity lifecycle states (Prompt 20 § 9)
 */
export type ContentLifecycleState =
  | "DRAFT"                 // Initial authoring in progress; strictly hidden from students
  | "INTERNAL_REVIEW"       // Author completed; undergoing initial team peer review
  | "FACT_CHECKED"          // Formulas, numbers, citations, and units independently verified
  | "PEDAGOGICALLY_REVIEWED"// Methodological progression, Bloom level, and error analysis audited
  | "VERIFIED"              // Passed all quality dimensions; certified for platform inclusion
  | "PUBLISHED"             // Active in student learning operating system
  | "ARCHIVED";             // Deprecated or replaced by updated curriculum revision

/**
 * Multi-dimensional verification checks required before a content item can be marked VERIFIED
 */
export interface ContentQualityDimensions {
  structuralVerification: boolean; // Complete 13-element loop intact
  factualVerification: boolean;    // Scientific truth, units, and calculations audited
  pedagogicalVerification: boolean;// Methodology, cognitive demand, and Bloom level appropriate
  provenanceVerification: boolean; // Source citation, legal rights, and decree metadata documented
  languageVerification: boolean;   // Academic Arabic/French, RTL/LTR safety, no direction corruption
}

// ============================================================================
// 2. STREAM & SPECIALTY ARCHITECTURE
// ============================================================================

export interface StreamSubjectRule {
  subjectId: SubjectId;
  coefficient: number;
  coefficientStatus: CurriculumVerificationStatus;
  isCoreSubject: boolean;
  notes_ar?: string;
  notes_fr?: string;
}

export interface StreamDefinition {
  id: StreamId;
  code: string;
  name_ar: string;
  name_fr: string;
  description_ar: string;
  description_fr: string;
  examType: ExamType;
  educationLevel: EducationLevel;
  academicYear: string;
  subjects: StreamSubjectRule[];
  supportedSpecialties?: TechniqueMathSpecialty[];
  verificationStatus: CurriculumVerificationStatus;
  officialReference: string;
}

export interface SpecialtyDefinition {
  id: TechniqueMathSpecialty;
  code: string;
  name_ar: string;
  name_fr: string;
  streamId: "technique_math";
  specialtySubjectId: SubjectId;
  specialtyCoefficient: number;
  coefficientStatus: CurriculumVerificationStatus;
  description_ar: string;
  description_fr: string;
  officialReference: string;
}

// ============================================================================
// 3. SUBJECT REGISTRY CONTRACT
// ============================================================================

export interface SubjectRegistryItem {
  id: SubjectId;
  code: string;
  name_ar: string;
  name_fr: string;
  streamIds: StreamId[];
  specialtyIds?: TechniqueMathSpecialty[];
  contentLanguage: "ar" | "fr" | "en" | "es" | "de" | "it";
  textDirection: "rtl" | "ltr";
  methodologyFamily: MethodologyFamily;
  curriculumStatus: "active" | "planned" | "deprecated";
  verificationStatus: CurriculumVerificationStatus;
  academicYear: string;
  isScientific: boolean;
  coefficientProvenance: {
    standardBaseline?: number;
    status: CurriculumVerificationStatus;
    officialDocumentRef: string;
    notes: string;
  };
  provenance: {
    source: string;
    sourceType: "ministry_curriculum" | "official_decree" | "bac_mastery_pedagogy";
    rightsStatus: "official_public_curriculum" | "proprietary_adaptation";
  };
}

// ============================================================================
// 4. CONTENT COVERAGE MATRIX CONTRACT
// ============================================================================

export type CoverageStatus =
  | "MAPPED"                   // Topic and skills identified in curriculum syllabus
  | "PLANNED"                  // Scheduled in production priority backlog
  | "LESSON_AVAILABLE"         // Core lesson and worked examples completed
  | "PRACTICE_AVAILABLE"       // Guided and independent practice items created
  | "RETEST_AVAILABLE"         // Independent isomorphic retest twin created
  | "REPAIR_AVAILABLE"         // Error Lab cognitive repair guide created
  | "EXAM_TRANSFER_AVAILABLE"  // BAC exam synthesis questions mapped
  | "VERIFIED"                 // Passed all 5 quality audit dimensions
  | "PUBLISHED";               // Active and consumable in product engine

export interface CoverageSkillItem {
  skillId: string;
  subjectId: SubjectId;
  streamId: StreamId;
  specialtyId?: TechniqueMathSpecialty;
  topicId: string;
  title_ar: string;
  title_fr: string;
  objective_ar: string;
  objective_fr: string;
  bloomLevel: "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";
  status: CoverageStatus;
  lifecycleState: ContentLifecycleState;
  hasLesson: boolean;
  hasExample: boolean;
  hasActiveRecall: boolean;
  hasPractice: boolean;
  hasRetest: boolean;
  hasRepair: boolean;
  hasExamTransfer: boolean;
  contentLanguage: "ar" | "fr" | "en" | "es" | "de" | "it";
  verificationStatus: CurriculumVerificationStatus;
  verificationDimensions: ContentQualityDimensions;
  productionPriorityScore: number;
}
