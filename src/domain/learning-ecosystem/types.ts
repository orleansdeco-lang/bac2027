/**
 * BAC Mastery — Learning Ecosystem Layer Types
 * Prompt 20.1: Visual Learning + External Resources + Human Help / Teacher Escalation
 * 
 * Strict architectural boundaries:
 * 1. Visual Learning: Pedagogical asset contracts with explicit educational purposes.
 * 2. External Resources: Quality provenance, explainable recommendations, and return actions.
 * 3. Human Help / Escalation: Evidence-based deterministic escalation, Student Learning Brief,
 *    and student help intent mapping to authoritative Error Intelligence.
 * 4. Zero DB migrations, zero AI APIs, zero teacher marketplace/booking UI.
 */

import { SubjectId, StreamId, TechniqueMathSpecialty } from "@/types/education";
import { DiagnosticDimension } from "@/types/diagnostic";
import { SuspectedErrorType, RepairStatus, MasteryStatus } from "@/types/mission";
import { EvidenceTier } from "@/domain/learning/types";
import { VerificationStatus, ContentSourceType, ContentRightsStatus } from "@/domain/content/types";

// =============================================================================
// 1. VISUAL LEARNING LAYER TYPES
// =============================================================================

export type VisualType =
  | "diagram"
  | "graph"
  | "mathematical_plot"
  | "geometry_figure"
  | "scientific_schema"
  | "process_diagram"
  | "circuit_diagram"
  | "force_diagram"
  | "molecular_structure"
  | "biological_schema"
  | "anatomy_schema"
  | "map"
  | "timeline"
  | "table"
  | "flowchart"
  | "technical_drawing"
  | "annotated_document"
  | "comparison_visual"
  | "interactive_visual"
  | "other";

export type VisualEducationalPurpose =
  | "CONCEPT_EXPLANATION"        // شرح وتجسيد مفهوم نظري
  | "PROCESS_EXPLANATION"        // توضيح مراحل مسار أو آلية متسلسلة
  | "RELATIONSHIP_MAPPING"       // إبراز الروابط بين مفاهيم متعددة
  | "SPATIAL_REASONING"          // تدريب على الإدراك الهندسي أو المكاني
  | "DOCUMENT_ANALYSIS"          // سند تحليلي أو وثيقة تتطلب استقراء
  | "MEMORY_SUPPORT"             // دعم التذكر البصري وتثبيت المعطيات
  | "COMPARISON"                 // مقارنة بنيوية بين عنصرين أو حالتين
  | "EXAM_METHOD"                // نموذج توضيحي لطريقة الإجابة الرسمية
  | "ERROR_REPAIR"               // تفكيك وتصحيح تصور خاطئ محدد
  | "WORKED_EXAMPLE_SUPPORT";    // سند بصري مرافق لمثال تطبيقي محلول

export interface VisualAccessibilityMetadata {
  description: string;                // Detailed description for screen readers
  highContrastAvailable: boolean;     // Can be rendered in high contrast
  screenReaderSummary: string;        // Concise summary for blind/visually impaired students
  nonColorDependentCues: boolean;     // Visual cues do not rely on color perception alone
}

export interface VisualAnnotation {
  id: string;
  label_ar: string;
  label_fr: string;
  xPercent?: number;                  // Coordinate on asset
  yPercent?: number;
  explanation_ar?: string;
  explanation_fr?: string;
}

export interface VisualLearningAsset {
  id: string;
  skillId: string;
  subjectId: SubjectId;
  streamId?: StreamId;
  specialtyId?: TechniqueMathSpecialty;
  visualType: VisualType;
  educationalPurpose: VisualEducationalPurpose;
  title_ar: string;
  title_fr: string;
  caption_ar?: string;
  caption_fr?: string;
  altText_ar: string;
  altText_fr: string;
  language: "ar" | "fr" | "en" | "es" | "de" | "it";
  direction: "rtl" | "ltr";
  assetUrl?: string;                  // Canonical relative or asset reference
  source: string;
  sourceType: ContentSourceType;
  rightsStatus: ContentRightsStatus;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  annotations?: VisualAnnotation[];
  isInteractive: boolean;
  accessibilityMetadata: VisualAccessibilityMetadata;
}

// =============================================================================
// 2. EXTERNAL LEARNING RESOURCE LAYER TYPES
// =============================================================================

export type ExternalResourceType =
  | "video"
  | "article"
  | "pdf"
  | "official_document"
  | "course"
  | "interactive"
  | "exercise"
  | "reference"
  | "other";

export type ResourceEducationalPurpose =
  | "UNDERSTAND"      // فهم مبدئي أو إعادة شرح من زاوية مختلفة
  | "REVIEW"          // مراجعة سريعة لتركيز الأفكار
  | "VISUALIZE"       // رؤية محاكاة أو رسم متحرك للمفهوم
  | "PRACTICE"        // تمرين إضافي بنمط مختلف
  | "EXAM_METHOD"     // طريقة منهجية للتعامل مع تمارين البكالوريا
  | "REPAIR"          // علاج خلل مفاهيمي محدد
  | "GO_DEEPER"       // تعميق وإثراء معرفي
  | "PREREQUISITE";   // تدارك مكتسب قبلي ناقص

export type ProvenanceQualityClassification =
  | "OFFICIAL_CURRENT"          // مستند أو قرار وزاري نافذ
  | "OFFICIAL_HISTORICAL"       // وثيقة أو بكالوريا رسمية سابقة
  | "RESEARCH_SUPPORTED"        // مرجع بيداغوجي أكاديمي محكم
  | "BAC_MASTERY_DERIVED"       // محتوى أصيل تم اشتقاقه وفق المعايير
  | "PROVISIONAL"               // مرجع تمهيدي تحت التدقيق
  | "UNVERIFIED";               // مصدر خارجي لم يستكمل التحقق بعد

export type ResourceReturnAction =
  | "active_recall"             // الرجوع لإجراء استرجاع نشط فوري
  | "isomorphic_retest"         // الرجوع لإجراء اختبار توأم مباشر
  | "guided_repair_step"        // متابعة خطوات بروتوكول الترميم
  | "practice_micro_drill"      // حل تمرين تطبيقي مخصص
  | "checkpoint_quiz";          // الإجابة عن سؤال تحقق معرفي

export interface ExternalLearningResource {
  id: string;
  title_ar: string;
  title_fr: string;
  provider: string;                   // E.g. "ONEC Archive", "CRDP", "Verified Educator"
  url: string;                        // Validated external link
  resourceType: ExternalResourceType;
  subjectId: SubjectId;
  skillId: string;
  streamId?: StreamId;
  language: "ar" | "fr" | "en" | "es" | "de" | "it";
  direction: "rtl" | "ltr";
  difficulty: 1 | 2 | 3;
  estimatedDurationMinutes: number;
  purpose: ResourceEducationalPurpose;
  sourceQuality: ProvenanceQualityClassification;
  rightsStatus: ContentRightsStatus;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  lastCheckedAt: string;
  description_ar: string;
  description_fr: string;
  whyRecommended_ar: string;
  whyRecommended_fr: string;
  prerequisites?: string[];
  suggestedReturnAction: ResourceReturnAction;
}

export interface ResourceRecommendation {
  resourceId: string;
  skillId: string;
  reasonCode:
    | "CONCEPTUAL_MISUNDERSTANDING"
    | "REPEATED_RETEST_FAILURE"
    | "METHODOLOGY_BLOCK"
    | "PREREQUISITE_GAP"
    | "VISUALIZATION_NEEDED"
    | "STUDENT_EXPLICIT_REQUEST";
  reason_ar: string;
  reason_fr: string;
  purpose: ResourceEducationalPurpose;
  priority: "high" | "medium" | "low";
  expectedOutcome_ar: string;
  expectedOutcome_fr: string;
  returnAction: ResourceReturnAction;
}

// =============================================================================
// 3. HUMAN HELP / TEACHER ESCALATION LAYER TYPES
// =============================================================================

export type LearningEscalationLevel =
  | "SELF_LEARN"          // التعلم الذاتي الأساسي (شرح، أمثلة، تدريب)
  | "EXTRA_EXPLANATION"   // شرح إضافي أو تبسيط نصي
  | "VISUAL_SUPPORT"      // دعم برسم، مخطط، أو شكل هندسي/علمي
  | "EXTERNAL_RESOURCE"   // توجيه لمورد خارجي موثوق مع أمر عودة
  | "TEACHER_HELP"        // طلب تدخل أستاذ للإجابة أو توجيه محدد
  | "LIVE_TUTORING";      // حصة دعم تفاعلية مباشرة (مستقبلية)

export interface EscalationEvidence {
  consecutiveFailures: number;
  retestFailed: boolean;
  retestFailureCount: number;
  isRecurringError: boolean;
  dominantErrorType?: SuspectedErrorType;
  repairCompletedButFailedRetest: boolean;
  repairAttemptCount: number;
  highConfidenceWrongCount: number;
  unmasteredPrerequisites: string[];
  totalTimeSpentSeconds: number;
  studentExplicitRequest?: StudentHelpRequestCategory;
}

export interface LearningEscalationResult {
  level: LearningEscalationLevel;
  reasonCode: string;
  reason_ar: string;
  reason_fr: string;
  evidence: EscalationEvidence;
  recommendedAction: {
    type: "continue_practice" | "view_explanation" | "view_visual" | "open_resource" | "prepare_teacher_brief" | "schedule_tutoring";
    targetId?: string;
    actionLabel_ar: string;
    actionLabel_fr: string;
  };
}

// =============================================================================
// 4. STUDENT "NEED HELP" INTENT MAPPING
// =============================================================================

export type StudentHelpRequestCategory =
  | "explain_simpler"            // شرح أبسط
  | "another_example"            // مثال آخر محلول
  | "need_visual"                // رسم أو مخطط توضيحي
  | "need_external_resource"     // مصدر أو فيديو خارجي
  | "more_practice"              // تمرين إضافي متدرج
  | "misunderstood_concept"      // ما فهمتش المفهوم أصلاً
  | "cannot_apply_methodology"   // فهمت بصح ما نعرفش نطبق
  | "forgot_rule"                // نسيت القاعدة أو القانون
  | "calculation_trouble"        // نغلط في الحساب والعمليات
  | "misunderstood_question"     // ما فهمتش السؤال أو المطلوب
  | "need_teacher";              // نحتاج أستاذ يشرحلي

export interface StudentHelpRequest {
  id: string;
  studentId: string;             // Anonymized reference or session ID
  skillId: string;
  subjectId: SubjectId;
  category: StudentHelpRequestCategory;
  contextStage: string;
  timestamp: string;
  userNote?: string;
}

export interface StudentHelpMappingOutcome {
  mappedErrorType: SuspectedErrorType;
  cognitiveRootCause: "conceptual" | "procedural" | "metacognitive" | "arithmetic" | "attentional";
  immediateAction: "explain_simpler" | "show_visual" | "show_example" | "recommend_resource" | "escalate_teacher";
  rationale_ar: string;
  rationale_fr: string;
}

// =============================================================================
// 5. TEACHER DOMAIN CONTRACTS (NO MARKETPLACE / NO PAYMENTS)
// =============================================================================

export type TeacherHelpType =
  | "concept_explanation"        // تبسيط المفاهيم النظرية
  | "methodology"                // المنهجية وطريقة صياغة الإجابة
  | "exercise_solving"           // تفكيك وحل التمارين المعقدة
  | "exam_preparation";          // استراتيجيات امتحان البكالوريا

export interface TeacherSubjectSkillMapping {
  teacherId: string;
  subjectId: SubjectId;
  streamIds: StreamId[];
  specialtyIds?: TechniqueMathSpecialty[];
  qualifiedSkillIds: string[];   // Specific skills teacher is verified to support
  supportedHelpTypes: TeacherHelpType[];
  verificationStatus: "verified" | "pending" | "provisional";
  isAcceptingBriefs: boolean;
}

/**
 * Student Learning Brief:
 * The precise pedagogical diagnosis BAC Mastery prepares for a teacher.
 * Contains evidence, attempt history, and bottlenecks with ZERO student private data.
 */
export interface StudentLearningBrief {
  briefId: string;
  generatedAt: string;
  skillId: string;
  skillTitle_ar: string;
  skillTitle_fr: string;
  subjectId: SubjectId;
  streamId?: StreamId;
  currentMasteryStatus: MasteryStatus;
  diagnosticSignal?: {
    dimension: DiagnosticDimension;
    score: number;
    benchmarkTier: string;
  };
  attemptSummary: {
    totalAttempts: number;
    consecutiveFailures: number;
    practiceAccuracy: number;
  };
  recurringErrors: Array<{
    errorType: SuspectedErrorType;
    occurrenceCount: number;
    sampleContext_ar: string;
  }>;
  repairHistory: {
    repairAttemptsCount: number;
    lastRepairStatus: RepairStatus;
    retestFailedCount: number;
  };
  confidenceMetrics: {
    averageConfidence: number;        // 1 to 5
    overconfidenceCount: number;      // High confidence but wrong answer
  };
  pacingMetrics: {
    avgResponseSeconds: number;
    expectedSeconds: number;
    speedClassification: "rushed" | "normal" | "struggling";
  };
  interventionsAlreadyAttempted: {
    explanationsViewed: number;
    visualsConsulted: string[];       // Asset IDs
    externalResourcesUsed: string[];  // Resource IDs
  };
  pedagogicalDiagnosis_ar: string;
  pedagogicalDiagnosis_fr: string;
  recommendedTeacherAction_ar: string;
  recommendedTeacherAction_fr: string;
  suggestedSessionObjective_ar: string;
  suggestedSessionObjective_fr: string;
}
