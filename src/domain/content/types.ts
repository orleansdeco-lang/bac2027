/**
 * BAC Mastery — Content & Knowledge Architecture Types
 * Prompt 11: Trustworthy Internal Knowledge & Content Model
 * 
 * Strict architectural boundaries:
 * 1. Global Content Entities: ZERO student ownership / ZERO user_id.
 * 2. Strict Provenance Tracking: sourceId, sourceType, verificationStatus, verifiedBy.
 * 3. Rights & Copyright Model: original, official_reference, licensed, etc.
 * 4. Practice vs Retest distinct separation: Unseen twin problem variants.
 * 5. Official Curriculum Facts vs Pedagogical Content: Explicit verification records.
 */

import { SubjectId, StreamId, ExamType, EducationLevel } from "@/types/education";
import { DiagnosticDimension } from "@/types/diagnostic";
import { SuspectedErrorType } from "@/types/mission";

// ============================================================================
// 1. PROVENANCE & RIGHTS ENUMS / UNIONS
// ============================================================================

/**
 * Verification lifecycle states for content entities and curriculum facts
 */
export type VerificationStatus =
  | "unverified"       // Unconfirmed fact or draft content; cannot be claimed as official
  | "pending_review"   // Submitted for pedagogical/official review
  | "verified"         // Authoritatively verified against official document or pedagogical standard
  | "outdated"         // Formerly verified; superseded by official curriculum revision
  | "rejected";        // Fails pedagogical review or contradicts official curriculum

/**
 * Classification of origin/source for content entities
 */
export type ContentSourceType =
  | "ministry"                   // Ministry of National Education (Algeria) official decree/circular
  | "official_curriculum"        // Official curriculum syllabus (Programme Officiel 3AS)
  | "official_exam"              // Official national BAC exam archive (ONEC)
  | "official_document"          // Official ministerial pedagogical guide or document
  | "school_reference"           // Verified secondary school educational reference
  | "trusted_educational_source" // Recognized pedagogical authority or validated publisher
  | "original_bac_mastery"       // Original pedagogical content authored for BAC Mastery
  | "past_bac_exam"              // Past BAC exam reference metadata
  | "other";                     // Other validated source

/**
 * Intellectual property and copyright rights classification
 */
export type ContentRightsStatus =
  | "original"                 // Created by BAC Mastery team; full proprietary rights
  | "official_reference"       // Metadata/citation of official public exam; fair use reference
  | "licensed"                 // Third-party content licensed for digital use
  | "permission_granted"       // Express pedagogical permission granted
  | "external_reference_only"  // External citation/URL only; no internal storage of text
  | "restricted"               // Internal draft only; not cleared for public distribution
  | "unknown";                 // Rights status unconfirmed; requires audit

/**
 * Supported question pedagogical interaction formats
 */
export type QuestionType =
  | "mcq"                // Single-select multiple choice question (3-4 options)
  | "multiple_select"    // Multi-select question (multiple correct answers)
  | "numeric"            // Numeric input with tolerance bound
  | "short_answer"       // Exact short string or algebraic expression
  | "true_false"         // Binary truth evaluation with justification
  | "structured_answer"  // Multi-step structured reasoning question
  | "open_response";     // Open qualitative answer (for human/rubric evaluation)

/**
 * Cognitive Bloom taxonomy level for learning objectives
 */
export type BloomTaxonomyLevel =
  | "remember"
  | "understand"
  | "apply"
  | "analyze"
  | "evaluate"
  | "create";

// ============================================================================
// 2. PROVENANCE & VERIFICATION METADATA
// ============================================================================

/**
 * Immutable source provenance declaration
 */
export interface ContentSource {
  id: string;
  type: ContentSourceType;
  name: string;
  title_ar: string;
  title_fr: string;
  publisher: string;
  publicationDate?: string;
  documentRef?: string;
  url?: string;
  rightsStatus: ContentRightsStatus;
  license?: string;
  notes?: string;
}

/**
 * Formal audit verification record
 */
export interface VerificationRecord {
  id: string;
  entityType:
    | "curriculum"
    | "subject"
    | "topic"
    | "skill"
    | "objective"
    | "resource"
    | "practice_question"
    | "retest_question"
    | "question_variant"
    | "past_exam_ref";
  entityId: string;
  status: VerificationStatus;
  verifiedBy: string;
  verifiedAt: string;
  evidenceDocument?: string;
  notes?: string;
}

/**
 * Official coefficient provenance model
 */
export interface CoefficientProvenance {
  value: number;
  status: VerificationStatus;
  officialDocumentRef?: string;
  verifiedAt?: string;
  notes?: string;
}

// ============================================================================
// 3. CURRICULUM HIERARCHY ENTITIES (GLOBAL — ZERO USER_ID)
// ============================================================================

/**
 * Top-level Curriculum Framework entity
 */
export interface Curriculum {
  id: string;
  streamId: StreamId;
  educationLevel: EducationLevel;
  examType: ExamType;
  academicYear: string; // e.g. "2024-2025"
  title_ar: string;
  title_fr: string;
  description_ar: string;
  description_fr: string;
  subjectIds: SubjectId[];
  sourceId: string;
  sourceType: ContentSourceType;
  rightsStatus: ContentRightsStatus;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  version: number;
  isActive: boolean;
}

/**
 * Curriculum Subject entity
 */
export interface Subject {
  id: SubjectId;
  curriculumId: string;
  streamId: StreamId;
  code: string;
  title_ar: string;
  title_fr: string;
  coefficientProvenance: CoefficientProvenance;
  order: number;
  sourceId: string;
  sourceType: ContentSourceType;
  rightsStatus: ContentRightsStatus;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  isActive: boolean;
}

/**
 * Curriculum Topic / Chapter entity
 */
export interface Topic {
  id: string;
  subjectId: SubjectId;
  curriculumId: string;
  streamId: StreamId;
  title_ar: string;
  title_fr: string;
  description_ar?: string;
  description_fr?: string;
  order: number;
  academicYear: string;
  sourceId: string;
  sourceType: ContentSourceType;
  rightsStatus: ContentRightsStatus;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  isActive: boolean;
}

/**
 * Learning Objective entity (Atomic competence criteria)
 */
export interface LearningObjective {
  id: string;
  skillId: string;
  code: string; // e.g. "LO-MATH-DERIV-01"
  description_ar: string;
  description_fr: string;
  bloomLevel: BloomTaxonomyLevel;
  order: number;
  sourceId: string;
  sourceType: ContentSourceType;
  rightsStatus: ContentRightsStatus;
  verificationStatus: VerificationStatus;
}

/**
 * Targeted Learning Skill entity
 */
export interface Skill {
  id: string;
  topicId: string;
  subjectId: SubjectId;
  streamId: StreamId;
  title_ar: string;
  title_fr: string;
  description_ar: string;
  description_fr: string;
  prerequisites: string[]; // Directional prerequisite skill IDs (DAG)
  cognitiveDimensions: DiagnosticDimension[];
  difficulty: 1 | 2 | 3;
  order: number;
  learningObjectiveIds?: string[];
  repairStrategy_ar: string;
  repairStrategy_fr: string;
  repairSteps_ar: string[];
  repairSteps_fr: string[];
  academicYear: string;
  sourceId: string;
  sourceType: ContentSourceType;
  rightsStatus: ContentRightsStatus;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  isActive: boolean;
}

// ============================================================================
// 4. LEARNING RESOURCES & PAST EXAM REFERENCES
// ============================================================================

export type ResourceType =
  | "summary_sheet"      // ملخص شامل للدرس
  | "methodology_guide"  // دليل منهجي لحل التمارين
  | "formula_card"       // بطاقة قوانين وقواعد أساسية
  | "concept_map";       // خريطة ذهنية ومفاهيمية

/**
 * Verified pedagogical resource entity
 */
export interface Resource {
  id: string;
  subjectId: SubjectId;
  topicId?: string;
  skillId?: string;
  type: ResourceType;
  title_ar: string;
  title_fr: string;
  summary_ar: string;
  summary_fr: string;
  content_ar: string;
  content_fr: string;
  sourceId: string;
  sourceType: ContentSourceType;
  rightsStatus: ContentRightsStatus;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  academicYear: string;
  isActive: boolean;
}

/**
 * Official Past BAC Exam Reference entity (Metadata citation only; no verbatim copyright infringement)
 */
export interface PastBacExamReference {
  id: string; // e.g. "bac_ref_2023_math_s1_ex2"
  year: number; // e.g. 2023
  session: "principal" | "catchup";
  streamId: StreamId;
  subjectId: SubjectId;
  topicId: string;
  skillIds: string[];
  exerciseNumber: number;
  subQuestionRef?: string;
  title_ar: string;
  title_fr: string;
  description_ar: string;
  description_fr: string;
  sourceId: string;
  sourceType: ContentSourceType;
  officialExamSourceId: string;
  rightsStatus: "official_reference";
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  guidanceNotes_ar?: string;
  guidanceNotes_fr?: string;
}

// ============================================================================
// 5. PRACTICE, RETEST & QUESTION VARIANT ENTITIES
// ============================================================================

/**
 * Question option with pedagogical distractor error linkage
 */
export interface QuestionOption {
  id: string;
  text_ar: string;
  text_fr: string;
  suspectedErrorType?: SuspectedErrorType;
}

/**
 * Core Practice Question entity (Prompt 11 content model)
 */
export interface PracticeQuestion {
  id: string;
  educationLevel: "secondary";
  examType: ExamType | "bac";
  streamId: StreamId;
  subjectId: SubjectId;
  skillId: string;
  topicId?: string;
  dimension: DiagnosticDimension;
  difficulty: 1 | 2 | 3;
  type: QuestionType;
  prompt_ar: string;
  prompt_fr: string;
  options: QuestionOption[];
  correctAnswerId: string;
  correctAnswerIds?: string[]; // Used if type === "multiple_select"
  explanation_ar: string;
  explanation_fr: string;
  repairHint_ar?: string;
  repairHint_fr?: string;
  expectedTimeSeconds: number; // Product benchmark estimate
  tags: string[];
  version: number;
  isRetestVariant: false;
  sourceId: string;
  sourceType: ContentSourceType;
  rightsStatus: ContentRightsStatus;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  academicYear: string;
}

/**
 * Retest Question entity (Unseen twin problem variant)
 */
export interface RetestQuestion {
  id: string;
  educationLevel: "secondary";
  examType: ExamType | "bac";
  streamId: StreamId;
  subjectId: SubjectId;
  skillId: string;
  topicId?: string;
  dimension: DiagnosticDimension;
  difficulty: 1 | 2 | 3;
  type: QuestionType;
  prompt_ar: string;
  prompt_fr: string;
  options: QuestionOption[];
  correctAnswerId: string;
  correctAnswerIds?: string[];
  explanation_ar: string;
  explanation_fr: string;
  repairHint_ar?: string;
  repairHint_fr?: string;
  expectedTimeSeconds: number;
  tags: string[];
  version: number;
  isRetestVariant: true;
  retestForQuestionId: string; // Links strictly to parent practice question
  sourceId: string;
  sourceType: ContentSourceType;
  rightsStatus: ContentRightsStatus;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  academicYear: string;
}

/**
 * Question Variation Model for algorithmic or twin generation
 */
export interface QuestionVariant {
  id: string;
  parentQuestionId: string;
  skillId: string;
  variationType: "numbers" | "context" | "reverse" | "twin";
  prompt_ar: string;
  prompt_fr: string;
  options: QuestionOption[];
  correctAnswerId: string;
  explanation_ar: string;
  explanation_fr: string;
  sourceId: string;
  rightsStatus: ContentRightsStatus;
  verificationStatus: VerificationStatus;
}

/**
 * Union of question entities
 */
export type AnyQuestion = PracticeQuestion | RetestQuestion;
