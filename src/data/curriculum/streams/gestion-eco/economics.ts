/**
 * BAC Mastery - Gestion & Économie: Economics & Management (الاقتصاد والمناجمنت)
 * Source: Algerian National Curriculum (3AS)
 * Units: التجارة الخارجية وميزان المدفوعات، النقود والكتلة النقدية، التضخم، السوق والأسعار، النظام المصرفي، الميزانية العامة، البطالة، التنمية المستدامة
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getBatch1GestionEcoBundle } from "@/domain/content/batch1-gestion-eco-bundle";
import { getGestionEcoContentPackage } from "@/domain/content/gestion-eco-mappings";

export const GESTION_ECO_ECONOMICS_SKILL_IDS = [
  "eco_foreign_trade_balance_payments",
  "eco_money_creation_central_bank",
  "eco_inflation_causes_control",
  "eco_market_structures_equilibrium",
  "eco_financial_intermediation_stock_market",
  "eco_economic_growth_sustainable_development",
  "eco_public_budget_fiscal_policy",
  "eco_unemployment_labor_market_dynamics",
  "eco_globalization_economic_integration",
] as const;

export function getGestionEcoEconomicsBundle(skillId: string): SkillLearningBundle | null {
  const b1 = getBatch1GestionEcoBundle(skillId);
  if (b1 && b1.subject === "economie_management") {
    return buildFromStandardPayload(b1 as any, "economics_management", "gestion_eco");
  }

  const pkg = getGestionEcoContentPackage(skillId);
  if (pkg && pkg.subjectId === "economics_management") {
    return buildFromStandardPayload({
      skillId: pkg.skillId,
      title_ar: pkg.lesson.title_ar,
      subject: "economics_management",
      stream: "gestion_eco",
      unit: pkg.topicId,
      theory: {
        summary: pkg.lesson.contentMarkdown_ar,
        keyTakeaways: [pkg.lesson.keyTakeaway_ar],
        commonPitfalls: (pkg.examTransfer.commonPitfalls_ar && pkg.examTransfer.commonPitfalls_ar.length > 0) ? pkg.examTransfer.commonPitfalls_ar : ["تجنب الخلط في المفاهيم الاقتصادية"],
      },
      practice: {
        question: pkg.practice[0]?.prompt_ar || pkg.lesson.title_ar,
        options: [
          { id: "opt_corr", text: pkg.practice[0]?.explanation_ar.slice(0, 50) || "الإجابة الاقتصادية المعتمدة", correct: true },
          { id: "opt_w1", text: "تفسير اقتصادي غير دقيق", correct: false },
          { id: "opt_w2", text: "خلط بين المفاهيم النقدية والمالية", correct: false },
        ],
        stepByStepSolution: pkg.workedExample.stepByStepSolution_ar,
      },
      isomorphicRetest: {
        question: pkg.retest.prompt_ar,
        options: [
          { id: "iso_corr", text: "التحليل الاقتصادي السليم", correct: true },
          { id: "iso_w1", text: "استنتاج اقتصادي خاطئ", correct: false },
        ],
        repairGuide: pkg.repairGuide.actionableSteps_ar.join(" | "),
      },
    }, "economics_management", "gestion_eco");
  }

  return null;
}

export const gestionEcoEconomicsBundles: Record<string, SkillLearningBundle> = {};
for (const id of GESTION_ECO_ECONOMICS_SKILL_IDS) {
  const b = getGestionEcoEconomicsBundle(id);
  if (b) gestionEcoEconomicsBundles[id] = b;
}
