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
  contentLanguage?: "ar" | "fr" | "en" | "es";
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
  dimensions?: DiagnosticDimension[];
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
  academicYear?: string;
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

// ============================================================================
// 6. PROMPT 12 LESSON ENGINE & PEDAGOGICAL ENTITIES
// ============================================================================

/**
 * Step-by-step worked example with cognitive thinking process
 */
export interface WorkedExample {
  id: string;
  skillId: string;
  problem_ar: string;
  howToThink_ar: string;
  stepByStepSolution_ar: string[];
  finalAnswer_ar: string;
  verificationTip_ar: string;
}

/**
 * Common student misconception card
 */
export interface CommonMistakeCard {
  id: string;
  mistake_ar: string;
  whyItHappens_ar: string;
  correctAction_ar: string;
  suspectedErrorType: SuspectedErrorType;
}

/**
 * Concise revision summary card
 */
export interface ShortReviewCard {
  id: string;
  keyRule_ar: string;
  keyFormula_ar: string;
  trapToAvoid_ar: string;
}

/**
 * Active, exam-oriented 14-element BAC Mastery Lesson
 */
export interface Lesson {
  id: string;
  skillId: string;
  subjectId: SubjectId;
  topicId: string;
  title_ar: string;
  title_fr: string;
  targetCapability_ar: string; // "بعد ما نكمل هذا الدرس، واش نقدر ندير وحدي؟"
  whatYouMustKnow_ar: string;   // 1. ماذا لازم تعرف؟
  whyThisMatters_ar: string;     // 2. علاش هذا مهم؟
  coreConcept_ar: string;        // 3. الفكرة الأساسية
  simpleExplanation_ar: string;  // 4. شرح بسيط
  workedExample: WorkedExample;  // 5, 6, 7. مثال محلول، كيف نفكر، الخطوات
  commonMistakes: CommonMistakeCard[]; // 8. أخطاء شائعة
  howToKnowYouUnderstood_ar: string;  // 9. كيف تعرف أنك فهمت؟
  quickRecallPrompt_ar: string;       // 10. اختبار سريع بدون النظر
  quickRecallAnswer_ar: string;
  practiceQuestionIds: string[];      // 11. تمرين تطبيقي
  whatToDoIfYouFail_ar: string;       // 12. ماذا تفعل إذا أخطأت؟
  summaryCard: ShortReviewCard;       // 13. بطاقة مراجعة قصيرة
  retestQuestionId: string;           // 14. Retest trigger
  estimatedMinutes: number;
  sourceId: string;
  sourceType: ContentSourceType;
  rightsStatus: ContentRightsStatus;
  verificationStatus: VerificationStatus;
  academicYear: string;
  isActive: boolean;
}

/**
 * Targeted 5-15 minute error repair guide
 */
export interface RepairGuide {
  id: string;
  skillId: string;
  suspectedErrorType: SuspectedErrorType;
  title_ar: string;
  whyItHappens_ar: string;
  diagnosis_ar: string;
  repairSteps_ar: string[];
  microPracticePrompt_ar: string;
  microPracticeSolution_ar: string;
  estimatedMinutes: number;
  sourceId: string;
  sourceType: ContentSourceType;
  rightsStatus: ContentRightsStatus;
  verificationStatus: VerificationStatus;
  academicYear: string;
  isActive: boolean;
}

// ============================================================================
// 7. STUDY METHODS & LEARNING SCIENCE GUIDANCE
// ============================================================================

export type StudyMethodCategory =
  | "reading"
  | "memorization"
  | "revision"
  | "problem_solving"
  | "error_repair"
  | "weekly_review"
  | "exam_prep"
  | "time_management";

/**
 * Actionable practical study method guide
 */
export interface StudyMethod {
  id: string;
  title_ar: string;
  title_fr: string;
  category: StudyMethodCategory;
  problemAddressed_ar: string;
  practicalSteps_ar: string[];
  exampleScenario_ar: string;
  commonTrap_ar: string;
  estimatedMinutes: number;
  sourceId: string;
  sourceType: ContentSourceType;
  rightsStatus: ContentRightsStatus;
  verificationStatus: VerificationStatus;
  academicYear: string;
  isActive: boolean;
}

/**
 * Evidence-based expert guidance with academic citations
 */
export interface ExpertGuidance {
  id: string;
  expertName: string;
  expertField: string;
  institutionOrAffiliation: string;
  primaryPublication: string;
  evidenceLevel: "Tier 1 (High)" | "Tier 2 (Moderate)" | "Tier 3 (Foundational)";
  principle_ar: string;
  bacMasteryInterpretation_ar: string;
  actionForStudent_ar: string;
  sourceId: string;
  sourceType: ContentSourceType;
  rightsStatus: ContentRightsStatus;
  verificationStatus: VerificationStatus;
  academicYear: string;
  isActive: boolean;
}

// ============================================================================
// 8. MOTIVATION, REST & SUPPORTIVE MINDSET
// ============================================================================

export type MotivationalCategory =
  | "starting"
  | "consistency"
  | "failure"
  | "difficult_days"
  | "exam_anxiety"
  | "long_term_effort"
  | "recovery"
  | "confidence"
  | "discipline";

/**
 * Action-oriented original motivational principle
 */
export interface MotivationalPrinciple {
  id: string;
  category: MotivationalCategory;
  title_ar: string;
  principle_ar: string;
  actionPrompt_ar: string;
  sourceId: string;
  sourceType: "original_bac_mastery";
  rightsStatus: "original";
  verificationStatus: "verified";
  academicYear: string;
  isActive: boolean;
}

/**
 * Rigorously verified quote with documented attribution
 */
export interface VerifiedQuote {
  id: string;
  quote_original: string;
  originalLanguage: string;
  translation_ar: string;
  author: string;
  authorContext: string;
  verifiedSource: string;
  sourceId: string;
  sourceType: ContentSourceType;
  rightsStatus: ContentRightsStatus;
  verificationStatus: VerificationStatus;
  academicYear: string;
  isActive: boolean;
}

// ============================================================================
// 9. MINI EXAMS & ASSESSMENT VEHICLES
// ============================================================================

export type MiniExamType =
  | "skill_quiz"
  | "topic_test"
  | "weekly_checkpoint"
  | "subject_mini_exam"
  | "weakness_exam"
  | "mixed_exam";

/**
 * Mini Exam vehicle for calibrated assessment
 */
export interface MiniExam {
  id: string;
  type: MiniExamType;
  title_ar: string;
  title_fr: string;
  subjectId: SubjectId;
  topicId?: string;
  skillIds: string[];
  questionIds: string[];
  timeTargetMinutes: number;
  difficultyProfile: { foundation: number; standard: number; advanced: number };
  passingScorePercent: number;
  sourceId: string;
  sourceType: ContentSourceType;
  rightsStatus: ContentRightsStatus;
  verificationStatus: VerificationStatus;
  academicYear: string;
  isActive: boolean;
}

/**
 * Internal content quality review record
 */
export interface ContentQualityReview {
  id: string;
  contentId: string;
  contentType: string;
  curriculumAlignment: number; // 1-5
  factualAccuracy: number;     // 1-5
  pedagogicalClarity: number;   // 1-5
  skillAlignment: number;       // 1-5
  assessmentQuality: number;    // 1-5
  errorRelevance: number;       // 1-5
  retestValidity: number;       // 1-5
  languageQuality: number;      // 1-5
  difficultyValidity: number;   // 1-5
  originalityRights: number;    // 1-5
  sourceProvenance: number;     // 1-5
  bacRelevance: number;         // 1-5
  overallScore: number;         // 0-100
  reviewer: string;
  reviewedAt: string;
  notes?: string;
}

