/**
 * BAC Mastery - Gestion & Économie: Law (القانون)
 * Source: Algerian National Curriculum (3AS)
 * Units: عقد البيع، عقد العمل الفردي والجماعي، منازعات العمل، الأوراق التجارية، الشركات التجارية (ش.ذ.م.م SARL، ش.م SPA)
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getBatch1GestionEcoBundle } from "@/domain/content/batch1-gestion-eco-bundle";
import { getBatch8LearningBundle } from "@/domain/content/batch8-italien-mecanique-gestion-bundle";
import { getGestionEcoContentPackage } from "@/domain/content/gestion-eco-mappings";

export const GESTION_ECO_LAW_SKILL_IDS = [
  "law_sales_contract_obligations",
  "law_commercial_companies_sarl_spa",
  "law_employment_contract_termination",
  "law_commercial_disputes_tribunals",
  "law_collective_labor_relations_strikes",
  "law_commercial_paper_cheque_bill",
  "law_corporate_dissolution_liquidation",
] as const;

export function getGestionEcoLawBundle(skillId: string): SkillLearningBundle | null {
  const b1 = getBatch1GestionEcoBundle(skillId);
  if (b1 && b1.subject === "droit") {
    return buildFromStandardPayload(b1 as any, "law", "gestion_eco");
  }

  const b8 = getBatch8LearningBundle(skillId);
  if (b8 && b8.subject === "droit") {
    return buildFromStandardPayload(b8 as any, "law", "gestion_eco");
  }

  const pkg = getGestionEcoContentPackage(skillId);
  if (pkg && pkg.subjectId === "law") {
    return buildFromStandardPayload({
      skillId: pkg.skillId,
      title_ar: pkg.lesson.title_ar,
      subject: "law",
      stream: "gestion_eco",
      unit: pkg.topicId,
      theory: {
        summary: pkg.lesson.contentMarkdown_ar,
        keyTakeaways: [pkg.lesson.keyTakeaway_ar],
        commonPitfalls: (pkg.examTransfer.commonPitfalls_ar && pkg.examTransfer.commonPitfalls_ar.length > 0) ? pkg.examTransfer.commonPitfalls_ar : ["تجنب الخلط في الشروط والمواد القانونية"],
      },
      practice: {
        question: pkg.practice[0]?.prompt_ar || pkg.lesson.title_ar,
        options: [
          { id: "opt_corr", text: pkg.practice[0]?.explanation_ar.slice(0, 50) || "التكييف القانوني السليم", correct: true },
          { id: "opt_w1", text: "تكييف قانوني خاطئ", correct: false },
          { id: "opt_w2", text: "تطبيق مادة قانونية غير ملائمة", correct: false },
        ],
        stepByStepSolution: pkg.workedExample.stepByStepSolution_ar,
      },
      isomorphicRetest: {
        question: pkg.retest.prompt_ar,
        options: [
          { id: "iso_corr", text: "الحكم القانوني المطابق للقانون التجاري والمدني", correct: true },
          { id: "iso_w1", text: "حكم غير معتمد قانوناً", correct: false },
        ],
        repairGuide: pkg.repairGuide.actionableSteps_ar.join(" | "),
      },
    }, "law", "gestion_eco");
  }

  return null;
}

export const gestionEcoLawBundles: Record<string, SkillLearningBundle> = {};
for (const id of GESTION_ECO_LAW_SKILL_IDS) {
  const b = getGestionEcoLawBundle(id);
  if (b) gestionEcoLawBundles[id] = b;
}
