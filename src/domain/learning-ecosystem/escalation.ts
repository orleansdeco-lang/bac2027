/**
 * BAC Mastery — Deterministic Learning Escalation Engine
 * Prompt 20.1: Multi-Tier Pedagogical Escalation
 * 
 * Invariants:
 * 1. A SINGLE wrong answer NEVER triggers teacher escalation.
 * 2. Escalation requires cumulative, objective evidence (retests, repairs, recurring misconceptions).
 * 3. 100% deterministic — zero probabilistic AI or LLM dependencies.
 * 4. BAC Mastery detects, teacher explains, BAC Mastery verifies via retest.
 */

import { SubjectId } from "@/types/education";
import {
  LearningEscalationLevel,
  EscalationEvidence,
  LearningEscalationResult,
} from "./types";
import { getVisualAssetsForSkill } from "./visual-assets";
import { getExternalResourcesForSkill } from "./external-resources";

export interface LearningEscalationInput {
  skillId: string;
  subjectId: SubjectId;
  evidence: EscalationEvidence;
}

/**
 * Pure deterministic escalation evaluator.
 * Maps objective student learning state to the exact, proportional intervention tier.
 */
export function getLearningEscalation(
  input: LearningEscalationInput
): LearningEscalationResult {
  const { skillId, subjectId, evidence } = input;

  const hasVisualAssets = getVisualAssetsForSkill(skillId).length > 0;
  const hasExternalResources = getExternalResourcesForSkill(skillId).length > 0;

  // ===========================================================================
  // TIER 6: LIVE_TUTORING (Severe Chronic Blockage)
  // Severe persistent block: 3+ retest failures, multiple repair cycles, extensive time spent.
  // ===========================================================================
  if (
    evidence.retestFailureCount >= 3 &&
    evidence.repairAttemptCount >= 2 &&
    evidence.totalTimeSpentSeconds >= 1800
  ) {
    return {
      level: "LIVE_TUTORING",
      reasonCode: "CHRONIC_LEARNING_DEADLOCK",
      reason_ar: "استنفدت محاولات الترميم الذاتي وإعادة الاختبار (3 إخفاقات متتالية). تحتاج لحصة توجيهية حية لفك العقدة المنهجية مباشرة.",
      reason_fr: "Impasse persistante après multiples réparations et retests. Session de tutorat recommandée.",
      evidence,
      recommendedAction: {
        type: "schedule_tutoring",
        targetId: skillId,
        actionLabel_ar: "حجز حصة مرافقة بيداغوجية مركزة",
        actionLabel_fr: "Planifier une session de tutorat ciblée",
      },
    };
  }

  // ===========================================================================
  // TIER 5: TEACHER_HELP (Targeted Pedagogical Escalation)
  // Evidence:
  // - 2+ retest failures, OR
  // - Repair completed but failed retest with recurring error, OR
  // - Student explicitly requested teacher AND has at least 1 retest failure or 2+ consecutive failures.
  // CRITICAL INVARIANT: A single practice error never lands here.
  // ===========================================================================
  const qualifiesForTeacherByRetest = evidence.retestFailureCount >= 2;
  const qualifiesForTeacherByRepairFailure =
    evidence.repairCompletedButFailedRetest && evidence.isRecurringError;
  const qualifiesForTeacherByExplicitRequest =
    evidence.studentExplicitRequest === "need_teacher" &&
    (evidence.consecutiveFailures >= 2 || evidence.retestFailed || evidence.isRecurringError);

  if (
    qualifiesForTeacherByRetest ||
    qualifiesForTeacherByRepairFailure ||
    qualifiesForTeacherByExplicitRequest
  ) {
    return {
      level: "TEACHER_HELP",
      reasonCode: qualifiesForTeacherByRetest
        ? "MULTIPLE_RETEST_FAILURES"
        : qualifiesForTeacherByRepairFailure
        ? "REPAIR_LOOP_EXHAUSTED"
        : "STUDENT_REQUESTED_TEACHER_WITH_EVIDENCE",
      reason_ar: "تعثر متكرر في اختبار التوأم ومسار الترميم. سيقوم النظام بإعداد بطاقة تشخيص بيداغوجية (Learning Brief) لتقديمها لأستاذ متخصص.",
      reason_fr: "Blocage persistant au retest. Génération d'une fiche diagnostic (Learning Brief) pour un enseignant.",
      evidence,
      recommendedAction: {
        type: "prepare_teacher_brief",
        targetId: skillId,
        actionLabel_ar: "تجهيز بطاقة التشخيص للأستاذ",
        actionLabel_fr: "Préparer la fiche d'apprentissage",
      },
    };
  }

  // ===========================================================================
  // TIER 4: EXTERNAL_RESOURCE (Curated Alternative Perspective)
  // Evidence:
  // - Retest failed once after repair, OR
  // - 2+ consecutive failures with recurring error and external resource exists, OR
  // - Student explicitly requested external resource or video.
  // ===========================================================================
  const qualifiesForExternalResource =
    hasExternalResources &&
    (evidence.retestFailed ||
      (evidence.consecutiveFailures >= 2 && evidence.isRecurringError) ||
      evidence.studentExplicitRequest === "need_external_resource");

  if (qualifiesForExternalResource) {
    const availableResources = getExternalResourcesForSkill(skillId);
    const primaryResource = availableResources[0];

    return {
      level: "EXTERNAL_RESOURCE",
      reasonCode: evidence.retestFailed
        ? "RETEST_FAILED_NEED_ALTERNATIVE_SOURCE"
        : "RECURRING_ERROR_EXTERNAL_VIEW",
      reason_ar: "أظهرت المحاولات السابقة صعوبة في التثبيت الذاتي؛ تم ترشيح مورد رسمي/تربوي معتمد لشرح المفهوم من زاوية مختلفة قبل العودة لإعادة الاختبار.",
      reason_fr: "Difficulté de fixation ; ressource pédagogique externe recommandée avant le retest.",
      evidence,
      recommendedAction: {
        type: "open_resource",
        targetId: primaryResource?.id,
        actionLabel_ar: "مشاهدة المورد الخارجي المعتمد ثم العودة للاختبار",
        actionLabel_fr: "Consulter la ressource puis revenir au retest",
      },
    };
  }

  // ===========================================================================
  // TIER 3: VISUAL_SUPPORT (Schematic & Structural Reinforcement)
  // Evidence:
  // - 2+ consecutive failures and visual exists, OR
  // - Student explicitly requested visual/diagram, OR
  // - Overconfidence error (high confidence but incorrect answer).
  // ===========================================================================
  const qualifiesForVisualSupport =
    hasVisualAssets &&
    (evidence.consecutiveFailures >= 2 ||
      evidence.studentExplicitRequest === "need_visual" ||
      evidence.highConfidenceWrongCount >= 2);

  if (qualifiesForVisualSupport) {
    const availableVisuals = getVisualAssetsForSkill(skillId);
    const primaryVisual = availableVisuals[0];

    return {
      level: "VISUAL_SUPPORT",
      reasonCode: evidence.studentExplicitRequest === "need_visual"
        ? "STUDENT_REQUESTED_VISUAL"
        : evidence.highConfidenceWrongCount >= 2
        ? "OVERCONFIDENCE_MISCONCEPTION"
        : "REPEATED_PRACTICE_FAILURE_VISUAL_REMEDY",
      reason_ar: "يوفر الرسم التخطيطي/البياني تمثيلاً حسياً لتجاوز الخلط المفاهيمي ومقارنة المعطيات بوضوح.",
      reason_fr: "Support visuel/schématique recommandé pour lever la confusion conceptuelle.",
      evidence,
      recommendedAction: {
        type: "view_visual",
        targetId: primaryVisual?.id,
        actionLabel_ar: "استعراض المخطط البصري التوضيحي",
        actionLabel_fr: "Consulter le schéma explicatif",
      },
    };
  }

  // ===========================================================================
  // TIER 2: EXTRA_EXPLANATION (Targeted Micro-Clarification)
  // Evidence:
  // - 1-2 wrong answers in practice, OR
  // - Student requested simpler explanation or another worked example, OR
  // - Unmastered prerequisite identified.
  // ===========================================================================
  if (
    evidence.consecutiveFailures >= 1 ||
    evidence.studentExplicitRequest === "explain_simpler" ||
    evidence.studentExplicitRequest === "another_example" ||
    evidence.unmasteredPrerequisites.length > 0
  ) {
    return {
      level: "EXTRA_EXPLANATION",
      reasonCode: evidence.studentExplicitRequest === "explain_simpler"
        ? "STUDENT_REQUESTED_SIMPLER_EXPLANATION"
        : evidence.studentExplicitRequest === "another_example"
        ? "STUDENT_REQUESTED_WORKED_EXAMPLE"
        : evidence.unmasteredPrerequisites.length > 0
        ? "PREREQUISITE_ALERT"
        : "INITIAL_PRACTICE_SLIP",
      reason_ar: "تعثر أولي في التطبيق؛ نقدم لك صياغة مبسطة ومثالاً محلولاً إضافياً لترسيخ الفكرة قبل المتابعة.",
      reason_fr: "Explication complémentaire ou exemple résolu pour consolider la notion.",
      evidence,
      recommendedAction: {
        type: "view_explanation",
        targetId: skillId,
        actionLabel_ar: "قراءة الشرح المبسط والمثال المحلول",
        actionLabel_fr: "Lire l'explication simplifiée et l'exemple",
      },
    };
  }

  // ===========================================================================
  // TIER 1: SELF_LEARN (Default Authoritative Loop)
  // 0 errors, student is progressing normally through the mission loop.
  // ===========================================================================
  return {
    level: "SELF_LEARN",
    reasonCode: "NOMINAL_PROGRESSION",
    reason_ar: "أنت تتقدم بثبات في مسار التعلم الذاتي الأساسي (فهم، أمثلة، تمرين، استرجاع).",
    reason_fr: "Progression nominale dans le cycle d'apprentissage autonome.",
    evidence,
    recommendedAction: {
      type: "continue_practice",
      targetId: skillId,
      actionLabel_ar: "متابعة التمارين المستقلة",
      actionLabel_fr: "Poursuivre les exercices autonomes",
    },
  };
}
