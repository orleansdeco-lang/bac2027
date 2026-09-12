/**
 * BAC Mastery — Human Help & Teacher Escalation Layer
 * Prompt 20.1: Student Help Mapping, Learning Brief & Teacher Profiles
 * 
 * Invariants:
 * 1. ZERO Marketplace UI, ZERO booking, ZERO payments, ZERO video calling logic.
 * 2. Privacy-first: Student Learning Brief contains ZERO student PII, credentials, or tokens.
 * 3. BAC Mastery detects the bottleneck, teacher explains, student returns to BAC Mastery for retest.
 * 4. Error mapping bridges conversational student requests into authoritative Error Intelligence.
 */

import { SubjectId, StreamId, TechniqueMathSpecialty } from "@/types/education";
import { SuspectedErrorType, RepairStatus, MasteryStatus } from "@/types/mission";
import { DiagnosticDimension } from "@/types/diagnostic";
import {
  StudentHelpRequestCategory,
  StudentHelpMappingOutcome,
  TeacherSubjectSkillMapping,
  TeacherHelpType,
  StudentLearningBrief,
} from "./types";

// =============================================================================
// 1. STUDENT "NEED HELP" INTENT MAPPING
// =============================================================================

/**
 * Maps student qualitative statements into authoritative Error Intelligence types.
 * Ensures the system does not spawn redundant or competing error taxonomies.
 */
export function mapStudentHelpRequest(
  category: StudentHelpRequestCategory
): StudentHelpMappingOutcome {
  switch (category) {
    case "explain_simpler":
      return {
        mappedErrorType: "misunderstood_concept",
        cognitiveRootCause: "conceptual",
        immediateAction: "explain_simpler",
        rationale_ar: "الطالب يطلب تبسيطاً لغوياً أو نظرياً للمفهوم الأساسي.",
        rationale_fr: "L'élève demande une simplification conceptuelle de la notion.",
      };

    case "another_example":
      return {
        mappedErrorType: "methodology_error",
        cognitiveRootCause: "procedural",
        immediateAction: "show_example",
        rationale_ar: "الطالب استوعب القاعدة النظرية لكنه يحتاج نمذجة إضافية لطريقة الحل والتطبيق.",
        rationale_fr: "Besoin de modélisation procédurale à travers un exemple résolu.",
      };

    case "need_visual":
      return {
        mappedErrorType: "misunderstood_concept",
        cognitiveRootCause: "conceptual",
        immediateAction: "show_visual",
        rationale_ar: "طلب مباشر لرسم بياني، دارة، أو مخطط لتثبيت الإدراك المكاني أو البنيوي.",
        rationale_fr: "Demande directe de support visuel ou schéma explicatif.",
      };

    case "need_external_resource":
      return {
        mappedErrorType: "lack_of_practice",
        cognitiveRootCause: "procedural",
        immediateAction: "recommend_resource",
        rationale_ar: "الطالب يرغب في الاستعانة بفيديو أو وثيقة خارجية موثوقة لتعزيز الفهم.",
        rationale_fr: "Orientation vers une ressource externe certifiée avec consigne de retour.",
      };

    case "more_practice":
      return {
        mappedErrorType: "lack_of_practice",
        cognitiveRootCause: "procedural",
        immediateAction: "explain_simpler",
        rationale_ar: "الحاجة إلى تمارين إضافية متدرجة الصعوبة لتثبيت المكتسبات.",
        rationale_fr: "Besoin d'exercices d'entraînement progressifs.",
      };

    case "misunderstood_concept":
      return {
        mappedErrorType: "misunderstood_concept",
        cognitiveRootCause: "conceptual",
        immediateAction: "explain_simpler",
        rationale_ar: "تصريح صريح بعدم استيعاب الفكرة الرياضية أو العلمية من أساسها.",
        rationale_fr: "Incompréhension explicite du concept fondamental.",
      };

    case "cannot_apply_methodology":
      return {
        mappedErrorType: "methodology_error",
        cognitiveRootCause: "procedural",
        immediateAction: "show_example",
        rationale_ar: "فهم المفهوم نظرياً مع تعثر في خطوات الحساب أو صياغة البرهان النموذجي.",
        rationale_fr: "Blocage méthodologique dans la rédaction ou l'application.",
      };

    case "forgot_rule":
      return {
        mappedErrorType: "forgot_information",
        cognitiveRootCause: "metacognitive",
        immediateAction: "explain_simpler",
        rationale_ar: "نسيان القانون الرياضي، الوحدة الفيزيائية، أو المصطلح الأساسي.",
        rationale_fr: "Oubli de la formule, règle ou terme fondamental.",
      };

    case "calculation_trouble":
      return {
        mappedErrorType: "calculation_error",
        cognitiveRootCause: "arithmetic",
        immediateAction: "explain_simpler",
        rationale_ar: "أخطاء في العمليات الحسابية، النشر، التحليل، أو توحيد المقامات.",
        rationale_fr: "Erreurs arithmétiques ou de calcul algébrique élémentaire.",
      };

    case "misunderstood_question":
      return {
        mappedErrorType: "misread_question",
        cognitiveRootCause: "attentional",
        immediateAction: "explain_simpler",
        rationale_ar: "صعوبة في تفكيك سياق السؤال، استخراج المعطيات، أو تحديد المطلوب بدقة.",
        rationale_fr: "Mauvaise interprétation de la consigne ou de la question.",
      };

    case "need_teacher":
      return {
        mappedErrorType: "methodology_error",
        cognitiveRootCause: "procedural",
        immediateAction: "escalate_teacher",
        rationale_ar: "طلب تدخل أستاذ للإجابة المباشرة أو معالجة تعثر معقد.",
        rationale_fr: "Demande d'intervention humaine ciblée avec fiche d'apprentissage.",
      };

    default:
      return {
        mappedErrorType: "unknown",
        cognitiveRootCause: "metacognitive",
        immediateAction: "explain_simpler",
        rationale_ar: "طلب مساعدة غير محدد؛ يتم تقديم مراجعة شاملة ومبسطة.",
        rationale_fr: "Demande non qualifiée ; retour vers explication synthétique.",
      };
  }
}

// =============================================================================
// 2. STUDENT LEARNING BRIEF GENERATOR
// =============================================================================

export interface GenerateLearningBriefInput {
  briefId?: string;
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
  totalAttempts: number;
  consecutiveFailures: number;
  practiceAccuracy: number;
  recurringErrors: Array<{
    errorType: SuspectedErrorType;
    occurrenceCount: number;
    sampleContext_ar: string;
  }>;
  repairAttemptsCount: number;
  lastRepairStatus: RepairStatus;
  retestFailedCount: number;
  averageConfidence: number;
  overconfidenceCount: number;
  avgResponseSeconds: number;
  expectedSeconds: number;
  explanationsViewed: number;
  visualsConsulted?: string[];
  externalResourcesUsed?: string[];
}

/**
 * Generates an evidence-dense, privacy-conscious Student Learning Brief for a teacher.
 * Zero student PII is included. Only pedagogical diagnostics and attempt patterns.
 */
export function generateStudentLearningBrief(
  input: GenerateLearningBriefInput
): StudentLearningBrief {
  const pacingDiff = input.avgResponseSeconds / Math.max(input.expectedSeconds, 1);
  let speedClassification: "rushed" | "normal" | "struggling" = "normal";
  if (pacingDiff < 0.4) {
    speedClassification = "rushed";
  } else if (pacingDiff > 2.0) {
    speedClassification = "struggling";
  }

  // Synthesize diagnosis text based on objective patterns
  let diag_ar = `الطالب يعاني من صعوبة في مهارة [${input.skillTitle_ar}]. `;
  let diag_fr = `L'élève rencontre des difficultés sur la compétence [${input.skillTitle_fr}]. `;

  if (input.recurringErrors.length > 0) {
    const dominant = input.recurringErrors[0];
    diag_ar += `الخطأ المتكرر السائد هو (${dominant.errorType}) برصيد ${dominant.occurrenceCount} تكراراً. `;
    diag_fr += `L'erreur dominante est (${dominant.errorType}) observée ${dominant.occurrenceCount} fois. `;
  }

  if (input.retestFailedCount > 0) {
    diag_ar += `فشل في اختبار التوأم المستقل ${input.retestFailedCount} مرة رغم استكمال محاولات الترميم. `;
    diag_fr += `Échec au retest indépendant à ${input.retestFailedCount} reprises malgré le protocole de remédiation. `;
  }

  if (input.overconfidenceCount > 1) {
    diag_ar += `لوحظ نمط ثقة مفرطة (إجابات غير صحيحة بدرجة ثقة مرتفعة). `;
    diag_fr += `Pattern de surconfiance détecté (réponses erronées avec certitude élevée). `;
  }

  // Recommended teacher action synthesis
  let action_ar = "التركيز على تفكيك خطوات التطبيق العملي ونمذجة الحل خطوة بخطوة.";
  let action_fr = "Modéliser la démarche de résolution étape par étape et clarifier la méthodologie.";
  if (input.recurringErrors.some((e) => e.errorType === "misunderstood_concept")) {
    action_ar = "إعادة بناء المفهوم النظري من خلال أمثلة مضادة ورسم بياني/تخطيطي قبل الانتقال للتطبيق.";
    action_fr = "Reconstruire le concept théorique avec contre-exemples et schéma avant la pratique.";
  }

  return {
    briefId: input.briefId || `brief_${Date.now()}_${input.skillId}`,
    generatedAt: new Date().toISOString(),
    skillId: input.skillId,
    skillTitle_ar: input.skillTitle_ar,
    skillTitle_fr: input.skillTitle_fr,
    subjectId: input.subjectId,
    streamId: input.streamId,
    currentMasteryStatus: input.currentMasteryStatus,
    diagnosticSignal: input.diagnosticSignal,
    attemptSummary: {
      totalAttempts: input.totalAttempts,
      consecutiveFailures: input.consecutiveFailures,
      practiceAccuracy: input.practiceAccuracy,
    },
    recurringErrors: input.recurringErrors,
    repairHistory: {
      repairAttemptsCount: input.repairAttemptsCount,
      lastRepairStatus: input.lastRepairStatus,
      retestFailedCount: input.retestFailedCount,
    },
    confidenceMetrics: {
      averageConfidence: input.averageConfidence,
      overconfidenceCount: input.overconfidenceCount,
    },
    pacingMetrics: {
      avgResponseSeconds: input.avgResponseSeconds,
      expectedSeconds: input.expectedSeconds,
      speedClassification,
    },
    interventionsAlreadyAttempted: {
      explanationsViewed: input.explanationsViewed,
      visualsConsulted: input.visualsConsulted || [],
      externalResourcesUsed: input.externalResourcesUsed || [],
    },
    pedagogicalDiagnosis_ar: diag_ar.trim(),
    pedagogicalDiagnosis_fr: diag_fr.trim(),
    recommendedTeacherAction_ar: action_ar,
    recommendedTeacherAction_fr: action_fr,
    suggestedSessionObjective_ar: `معالجة ثغرة ${input.skillTitle_ar} وتمكين الطالب من اجتياز اختبار التوأم بنجاح عند العودة.`,
    suggestedSessionObjective_fr: `Combler la lacune sur ${input.skillTitle_fr} pour réussir le retest au retour sur la plateforme.`,
  };
}

// =============================================================================
// 3. TEACHER SKILL-BASED MODEL CONTRACTS
// =============================================================================

export const CANONICAL_EXEMPLAR_TEACHER_PROFILES: TeacherSubjectSkillMapping[] = [
  {
    teacherId: "teacher_math_exemplar_01",
    subjectId: "math",
    streamIds: ["sciences_exp", "math", "technique_math"],
    qualifiedSkillIds: [
      "math_exp_limits_indeterminate",
      "math_exp_derivatives_study",
      "math_exp_asymptotes_branches",
      "math_exp_log_properties",
    ],
    supportedHelpTypes: ["concept_explanation", "methodology", "exercise_solving", "exam_preparation"],
    verificationStatus: "verified",
    isAcceptingBriefs: true,
  },
  {
    teacherId: "teacher_phys_exemplar_02",
    subjectId: "physics",
    streamIds: ["sciences_exp", "math", "technique_math"],
    qualifiedSkillIds: [
      "phys_rc_dipole_response",
      "phys_rl_dipole_response",
      "phys_nuclear_decay_activity",
      "phys_newton_second_law_incline",
    ],
    supportedHelpTypes: ["concept_explanation", "methodology", "exercise_solving"],
    verificationStatus: "verified",
    isAcceptingBriefs: true,
  },
  {
    teacherId: "teacher_snv_exemplar_03",
    subjectId: "natural_sciences",
    streamIds: ["sciences_exp"],
    qualifiedSkillIds: [
      "snv_protein_synthesis_translation",
      "snv_protein_structure_function",
      "snv_enzyme_kinetics_inhibition",
      "snv_humoral_immunity_b_cells",
    ],
    supportedHelpTypes: ["concept_explanation", "methodology", "exam_preparation"],
    verificationStatus: "verified",
    isAcceptingBriefs: true,
  },
];

/**
 * Finds qualified teachers for a specific skill and help type.
 * Architectural foundation for future matching without building an active marketplace.
 */
export function findQualifiedTeachersForSkill(
  skillId: string,
  subjectId: SubjectId,
  helpType?: TeacherHelpType
): TeacherSubjectSkillMapping[] {
  return CANONICAL_EXEMPLAR_TEACHER_PROFILES.filter((teacher) => {
    if (teacher.subjectId !== subjectId) return false;
    if (!teacher.isAcceptingBriefs) return false;
    if (!teacher.qualifiedSkillIds.includes(skillId)) return false;
    if (helpType && !teacher.supportedHelpTypes.includes(helpType)) return false;
    return true;
  });
}
