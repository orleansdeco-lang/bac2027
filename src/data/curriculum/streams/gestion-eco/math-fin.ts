/**
 * BAC Mastery - Gestion & Économie: Financial Mathematics & Modeling (الرياضيات المالية)
 * Source: Algerian National Curriculum (3AS)
 * Units: الفائدة المركبة والجملة، الدفعات الثابتة، استهلاك القروض العادية بأقساط ثابتة، اختيار المشاريع الاستثمارية (VAN)
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getGestionEcoContentPackage } from "@/domain/content/gestion-eco-mappings";

export const GESTION_ECO_MATH_FIN_SKILL_IDS = [
  "math_fin_compound_interest_annuities",
  "math_fin_loan_amortization_constant_payments",
  "math_fin_simple_interest_discount",
  "math_fin_investment_choice_npv_irr",
  "math_fin_linear_programming_optimization",
] as const;

export function getGestionEcoMathFinBundle(skillId: string): SkillLearningBundle | null {
  const pkg = getGestionEcoContentPackage(skillId);
  if (pkg && pkg.subjectId === "math") {
    return buildFromStandardPayload({
      skillId: pkg.skillId,
      title_ar: pkg.lesson.title_ar,
      subject: "math",
      stream: "gestion_eco",
      unit: pkg.topicId,
      theory: {
        summary: pkg.lesson.contentMarkdown_ar,
        keyTakeaways: [pkg.lesson.keyTakeaway_ar],
        commonPitfalls: (pkg.examTransfer.commonPitfalls_ar && pkg.examTransfer.commonPitfalls_ar.length > 0) ? pkg.examTransfer.commonPitfalls_ar : ["تجنب الخطأ في تطبيق قوانين الفائدة المركبة والجداول المالية"],
      },
      practice: {
        question: pkg.practice[0]?.prompt_ar || pkg.lesson.title_ar,
        options: [
          { id: "opt_corr", text: pkg.practice[0]?.explanation_ar.slice(0, 50) || "الحساب المالي الدقيق", correct: true },
          { id: "opt_w1", text: "خطأ في تطبيق الأس أو الجدول المالي", correct: false },
          { id: "opt_w2", text: "خلط بين الفائدة البسيطة والمركبة", correct: false },
        ],
        stepByStepSolution: pkg.workedExample.stepByStepSolution_ar,
      },
      isomorphicRetest: {
        question: pkg.retest.prompt_ar,
        options: [
          { id: "iso_corr", text: "النتيجة الحسابية المعتمدة", correct: true },
          { id: "iso_w1", text: "نتيجة حسابية خاطئة", correct: false },
        ],
        repairGuide: pkg.repairGuide.actionableSteps_ar.join(" | "),
      },
    }, "math", "gestion_eco");
  }

  return null;
}

export const gestionEcoMathFinBundles: Record<string, SkillLearningBundle> = {};
for (const id of GESTION_ECO_MATH_FIN_SKILL_IDS) {
  const b = getGestionEcoMathFinBundle(id);
  if (b) gestionEcoMathFinBundles[id] = b;
}
