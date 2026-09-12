/**
 * BAC Mastery — Content Package Authoring Contract & Validator
 * 
 * Rules:
 * 1. Completeness: Every authored skill package must provide a complete pedagogical loop:
 *    Lesson -> Worked Example -> Active Recall -> Practice (>=2) -> Retest Twin -> Repair Guide.
 * 2. Retest Quality: Retest question must be an isomorphic twin measuring conceptual transfer,
 *    never an identical copy of the worked example or mere cosmetic number swap.
 * 3. Explicit Status: Optional elements must explicitly state NOT_NEEDED rather than being omitted.
 * 4. Lightweight Mind Support: Concise normalization and task reset only (no clinical diagnosis).
 */

import { ContentPackage } from "./types";
import { auditClaimString } from "./claim-audit";

export interface PackageValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates a ContentPackage against strict pedagogical authoring standards.
 */
export function validateContentPackage(pkg: ContentPackage): PackageValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Structural Identifiers
  if (!pkg.packageId || pkg.packageId.trim() === "") {
    errors.push("حزمة المحتوى يجب أن تحتوي على معرف packageId غير فارغ.");
  }
  if (!pkg.skillId || pkg.skillId.trim() === "") {
    errors.push("حزمة المحتوى يجب أن ترتبط بمعرف مهارة skillId محدد.");
  }
  if (!pkg.subjectId) {
    errors.push("حزمة المحتوى يجب أن تحدد المادة الدراسية subjectId.");
  }

  // 2. Learning Objective
  if (!pkg.objective_ar || pkg.objective_ar.trim().length < 10) {
    errors.push("الهدف التعليمي باللغة العربية يجب أن يكون محدداً وصريحاً (>= 10 أحرف).");
  }

  // 3. Core Lesson & Worked Example
  if (!pkg.lesson || !pkg.lesson.contentMarkdown_ar || pkg.lesson.contentMarkdown_ar.length < 50) {
    errors.push("الدرس يجب أن يحتوي على شرح نظري ومفاهيمي كافٍ (>= 50 حرف).");
  }
  if (!pkg.workedExample || !pkg.workedExample.problem_ar || pkg.workedExample.stepByStepSolution_ar.length < 2) {
    errors.push("المثال المحلول يجب أن يتضمن مسألة وخطوات حل متسلسلة نموذجية (خطوتان على الأقل).");
  }

  // 4. Active Recall
  if (!pkg.activeRecall || !pkg.activeRecall.prompt_ar || !pkg.activeRecall.expectedAnswer_ar) {
    errors.push("سؤال الاسترجاع النشط يجب أن يحتوي على نص السؤال والإجابة النموذجية.");
  }
  if (!pkg.activeRecall.concealedInitially) {
    warnings.push("يُستحسن أن تكون إجابة الاسترجاع النشط مخفية مبدئياً لدعم التذكر الاسترجاعي.");
  }

  // 5. Practice Items (Minimum 2)
  if (!pkg.practice || pkg.practice.length < 2) {
    errors.push(`الحد الأدنى لتمارين التدريب هو تمرينان أصيلان (المتوفر حالياً: ${pkg.practice?.length || 0}).`);
  } else {
    pkg.practice.forEach((item, idx) => {
      if (!item.prompt_ar || item.prompt_ar.trim() === "") {
        errors.push(`تمرين التدريب رقم ${idx + 1} يفتقد نص السؤال باللغة العربية.`);
      }
      if (!item.correctAnswerId) {
        errors.push(`تمرين التدريب رقم ${idx + 1} لم يحدد معرف الإجابة الصحيحة.`);
      }
      if (!item.distractorErrorMappings || Object.keys(item.distractorErrorMappings).length === 0) {
        warnings.push(`تمرين التدريب رقم ${idx + 1} لا يحتوي على ربط تشخيصي للأخطاء الشائعة في الخيارات الخاطئة.`);
      }
    });
  }

  // 6. Retest Twin Quality (Transfer Invariant)
  if (!pkg.retest) {
    errors.push("حزمة المحتوى يجب أن تحتوي على اختبار توأم مستقل (retest).");
  } else {
    if (!pkg.retest.isIsomorphicTwin) {
      errors.push("اختبار التوأم يجب أن يُصنّف صراحة كـ isomorphic twin.");
    }
    if (!pkg.retest.testsIdenticalConcept) {
      errors.push("اختبار التوأم يجب أن يختبر نفس المفهوم الجوهري المستهدف.");
    }
    if (!pkg.retest.altersSurfaceContext) {
      errors.push("اختبار التوأم يجب أن يغير السياق السطحي أو المعطيات الرقمية لقياس انتقال أثر التعلم.");
    }
    // Check retest vs worked example collision
    if (pkg.workedExample && pkg.retest.prompt_ar.trim() === pkg.workedExample.problem_ar.trim()) {
      errors.push("لا يجوز نسخ نص المثال المحلول في سؤال إعادة الاختبار (خرق معيار التوأم المستقل).");
    }
  }

  // 7. Repair Guide Completeness
  if (!pkg.repairGuide) {
    errors.push("حزمة المحتوى يجب أن تحتوي على دليل ترميم مفاهيمي (repairGuide).");
  } else {
    if (!pkg.repairGuide.actionableSteps_ar || pkg.repairGuide.actionableSteps_ar.length < 2) {
      errors.push("دليل الترميم يجب أن يحتوي على خطوتين إجرائيتين على الأقل لتفكيك الخطأ.");
    }
  }

  // 8. Visual Necessity Contract
  const validVisualLevels = ["VISUAL_REQUIRED", "VISUAL_USEFUL", "VISUAL_OPTIONAL", "VISUAL_NOT_NEEDED"];
  if (!validVisualLevels.includes(pkg.visualNecessity)) {
    errors.push(`مستوى الحاجة للبصريات غير صالح: ${pkg.visualNecessity}`);
  }
  if (pkg.visualNecessity === "VISUAL_REQUIRED" && pkg.visualAssetIds.length === 0) {
    errors.push("المهارة مصنفة كـ VISUAL_REQUIRED ولكن لم يتم إرفاق أي معرف أصل بصري.");
  }

  // 9. Claim Audit Integrity Check
  const combinedText = [
    pkg.lesson.contentMarkdown_ar,
    pkg.workedExample.problem_ar,
    pkg.objective_ar,
    pkg.repairGuide.mentalModelExplanation_ar,
  ].join(" ");
  const claimAudit = auditClaimString(combinedText);
  if (!claimAudit.isClean) {
    claimAudit.violations.forEach((v) => {
      if (v.severity === "BLOCKER") {
        errors.push(`[خرق معايير الادعاء: ${v.category}] ${v.reason} (النص: ${v.excerpt})`);
      } else {
        warnings.push(`[تنبيه ادعاء: ${v.category}] ${v.reason} (النص: ${v.excerpt})`);
      }
    });
  }

  // 10. Provenance & Lifecycle
  if (!pkg.provenance || !pkg.provenance.classification) {
    errors.push("حزمة المحتوى يجب أن تحدد التصنيف المصدري (provenance.classification).");
  }
  if (pkg.lifecycleState === "PUBLISHED" && errors.length > 0) {
    errors.push("لا يجوز نشر الحزمة (PUBLISHED) مع وجود أخطاء في الامتثال البيداغوجي.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}
