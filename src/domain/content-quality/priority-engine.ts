/**
 * BAC Mastery — Deterministic Content Expansion Priority Engine
 * 
 * Production Philosophy:
 * Evaluates 10 objective pedagogical factors to categorize expansion tasks into
 * HIGH, MEDIUM, or LOW priority with clear, human-readable rationales.
 * 
 * Invariant: ZERO fake numerical precision. Outputs transparent categorical priority.
 */

import { PriorityFactorInputs, ExpansionPriorityResult, PriorityLevel } from "./types";

/**
 * Computes deterministic expansion priority for a skill or topic.
 */
export function evaluateExpansionPriority(
  factors: PriorityFactorInputs
): ExpansionPriorityResult {
  const drivers: string[] = [];

  // Identify standout factors
  const isHighExamRelevance = factors.examRelevance >= 4;
  const isCriticalPrerequisite = factors.prerequisiteImportance >= 4;
  const isHighDemand = factors.studentDemandPotential >= 4;
  const hasContentGap = factors.currentContentGap;
  const hasTrustworthySource = factors.trustworthySourcesAvailable;
  const isHighErrorTrap = factors.errorFrequencyPotential >= 4;
  const isHighRoi = factors.educationalRoi >= 4;
  const isCentral = factors.curriculumCentrality >= 4;

  if (isHighExamRelevance) drivers.push("عامل ترجيح عالي في امتحان البكالوريا");
  if (isCriticalPrerequisite) drivers.push("مكتسب قبلي حاكم لمهارات لاحقة متعددة");
  if (isHighDemand) drivers.push("طلب واحتياج مرتفع لدى التلاميذ");
  if (hasContentGap) drivers.push("فجوة محتوى حالية تتطلب تغطية");
  if (isHighErrorTrap) drivers.push("نقطة تعثر شائعة في تصحيحات البكالوريا");
  if (isHighRoi) drivers.push("عائد تحصيلي سريع لكل ساعة دراسية");

  // Determine Categorical Priority Level
  let level: PriorityLevel = "LOW";
  let priorityReason = "مهارة داعمة ذات تأثير محدود على المسار الفوري.";

  // High Priority Conditions:
  // - High exam relevance + critical prerequisite + gap + trustworthy sources available
  // - High exam relevance + high error trap + gap + trustworthy sources
  // - Central foundational concept + high ROI + gap
  const qualifiesForHigh =
    hasTrustworthySource &&
    ((isHighExamRelevance && isCriticalPrerequisite && hasContentGap) ||
      (isHighExamRelevance && isHighErrorTrap && hasContentGap) ||
      (isCentral && isHighRoi && hasContentGap) ||
      (isHighDemand && isHighExamRelevance && hasContentGap));

  // Medium Priority Conditions:
  // - Moderate relevance, or high relevance but already partially covered, or trustworthy source missing
  const qualifiesForMedium =
    qualifiesForHigh === false &&
    ((isHighExamRelevance && !hasContentGap) ||
      (factors.examRelevance >= 3 && factors.curriculumCentrality >= 3) ||
      (isCriticalPrerequisite && !isHighExamRelevance) ||
      (hasContentGap && factors.educationalRoi >= 3));

  if (qualifiesForHigh) {
    level = "HIGH";
    priorityReason = "مكتسب قبلي حاسم + وزن نوعي مرتفع في البكالوريا + غير مغطى حالياً.";
  } else if (qualifiesForMedium) {
    level = "MEDIUM";
    priorityReason = "مهارة مساعدة مفيدة ذات ارتباط وثيق بالمنهج لكنها تأتي بعد الأولويات الأساسية.";
  } else {
    level = "LOW";
    priorityReason = "مهارة طرفية ذات أثر تراكمي ثانوي على خريطة الطريق الفورية.";
  }

  // Guard: if trustworthy sources are unavailable, it cannot be HIGH priority for immediate authoring
  if (!hasTrustworthySource && level === "HIGH") {
    level = "MEDIUM";
    priorityReason = "ذات أهمية مرتفعة نظرياً ولكن الإنتاج معلق لعدم توفر مراجع رسمية/موثوقة كافية.";
    drivers.push("معلقة: انتظار وثائق مرجعية موثوقة");
  }

  return {
    level,
    priorityReason,
    keyDrivers: drivers,
  };
}
