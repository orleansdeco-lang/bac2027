/**
 * BAC Mastery - Gestion & Économie: Accounting & Financial Management (المحاسبة والتسيير المالي)
 * Source: Algerian National Curriculum (3AS)
 * Units: الاهتلاكات ونقص القيمة، تسوية المخزونات، تسوية حسابات الزبائن، مؤونات الأخطار، التقارب البنكي، حساب النتائج، الميزانية الوظيفية
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getBatch1GestionEcoBundle } from "@/domain/content/batch1-gestion-eco-bundle";
import { getBatch8LearningBundle } from "@/domain/content/batch8-italien-mecanique-gestion-bundle";
import { getGestionEcoContentPackage } from "@/domain/content/gestion-eco-mappings";

export const GESTION_ECO_ACCOUNTING_SKILL_IDS = [
  "acc_provisions_depreciation_adjustments",
  "acc_income_statement_by_function",
  "acc_depreciation_linear_degressive",
  "acc_inventory_adjustments_variance",
  "acc_customer_receivables_provisions",
  "acc_financial_investment_provisions",
  "acc_cash_bank_reconciliation",
  "acc_balance_sheet_functional_analysis",
  "acc_ratio_analysis_liquidity_profitability",
] as const;

export function getGestionEcoAccountingBundle(skillId: string): SkillLearningBundle | null {
  const b1 = getBatch1GestionEcoBundle(skillId);
  if (b1 && b1.subject === "gestion_comptable") {
    return buildFromStandardPayload(b1 as any, "accounting_finance", "gestion_eco");
  }

  const b8 = getBatch8LearningBundle(skillId);
  if (b8 && b8.subject === "gestion_comptable") {
    return buildFromStandardPayload(b8 as any, "accounting_finance", "gestion_eco");
  }

  const pkg = getGestionEcoContentPackage(skillId);
  if (pkg && pkg.subjectId === "accounting_finance") {
    return buildFromStandardPayload({
      skillId: pkg.skillId,
      title_ar: pkg.lesson.title_ar,
      subject: "accounting_finance",
      stream: "gestion_eco",
      unit: pkg.topicId,
      theory: {
        summary: pkg.lesson.contentMarkdown_ar,
        keyTakeaways: [pkg.lesson.keyTakeaway_ar],
        commonPitfalls: (pkg.examTransfer.commonPitfalls_ar && pkg.examTransfer.commonPitfalls_ar.length > 0) ? pkg.examTransfer.commonPitfalls_ar : ["تجنب الخلط في الحسابات"],
      },
      practice: {
        question: pkg.practice[0]?.prompt_ar || pkg.lesson.title_ar,
        options: [
          { id: "opt_corr", text: pkg.practice[0]?.explanation_ar.slice(0, 50) || "الإجابة المحاسبية الصحيحة", correct: true },
          { id: "opt_w1", text: "خطأ في تسجيل القيد", correct: false },
          { id: "opt_w2", text: "خلط في طبيعة الحساب مدين/دائن", correct: false },
        ],
        stepByStepSolution: pkg.workedExample.stepByStepSolution_ar,
      },
      isomorphicRetest: {
        question: pkg.retest.prompt_ar,
        options: [
          { id: "iso_corr", text: "التسجيل المحاسبي النظامي", correct: true },
          { id: "iso_w1", text: "تسجيل قيد غير مطابق", correct: false },
        ],
        repairGuide: pkg.repairGuide.actionableSteps_ar.join(" | "),
      },
    }, "accounting_finance", "gestion_eco");
  }

  return null;
}

export const gestionEcoAccountingBundles: Record<string, SkillLearningBundle> = {};
for (const id of GESTION_ECO_ACCOUNTING_SKILL_IDS) {
  const b = getGestionEcoAccountingBundle(id);
  if (b) gestionEcoAccountingBundles[id] = b;
}
