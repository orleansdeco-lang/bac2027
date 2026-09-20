/**
 * BAC Mastery - Common Curriculum: Arabic Language & Literature (اللغة العربية وآدابها المشتركة)
 * Source: Algerian National Curriculum (3AS)
 * Units: قواعد النحو والإعراب (إذا، إذ، إذن، لولا، لوما، الجمل التي لها محل والتي لا محل لها)، البلاغة والاتساق، فن المقال، شعر المهجر والالتزام
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getBatch1LearningBundle } from "@/domain/content/batch1-philosophy-arabic-bundle";
import { getBatch5LiteratureLanguagesBundle } from "@/domain/content/foreign-languages-third-lang-bundle";
import { getBatch7LearningBundle } from "@/domain/content/batch7-geo-islamic-arabic-bundle";
import { getBatch9LearningBundle } from "@/domain/content/batch9-final-curriculum-bundle";
import { getPack4ArabicLitMathBundle } from "@/domain/content/pack4-arabic-and-literature-math-bundle";
import { getPack6LettresPhiloBundle } from "@/domain/content/pack6-lettres-philo-bundle";

export const COMMON_ARABIC_SKILL_IDS = [
  "ar_grammar_ida_idhan_rules",
  "ar_poetry_commit_liberation",
  "ar_rhetoric_cohesion_coherence",
  "ar_grammar_law_lawla_lawma",
  "ar_grammar_clauses_with_without_functions",
  "ar_grammar_plural_types_qillah_kathrah",
  "ar_rhetoric_musnad_musnad_ilayh_syntax",
  "ar_idha_idhan_hinaidin",
  "ar_jumal_lah_la_mahal",
  "ar_mahjar_rabita_qalamiyya",
  "ar_fan_maqal_jazaeri",
  "ar_lp_exile_revival_poetry",
  "ar_lp_intellectual_summary",
  "ar_lp_rhetoric_imagery",
  "ar_lp_critical_appreciation",
] as const;

export function getCommonArabicBundle(skillId: string): SkillLearningBundle | null {
  // Pack 4 Units
  const p4 = getPack4ArabicLitMathBundle(skillId);
  if (p4 && p4.subject === "arabic") {
    return buildFromStandardPayload(p4 as any, "arabic", "common");
  }

  // Pack 6 Units
  const p6 = getPack6LettresPhiloBundle(skillId);
  if (p6 && p6.subject === "arabic") {
    return buildFromStandardPayload(p6 as any, "arabic", "lettres_philo");
  }

  // Batch 1 Arabic
  const b1 = getBatch1LearningBundle(skillId);
  if (b1 && b1.subject === "arabic") {
    return buildFromStandardPayload({
      skillId: b1.skillId,
      title_ar: b1.titleAr,
      subject: "arabic",
      stream: "common",
      unit: b1.unitAr,
      theory: {
        summary: b1.theory.summaryAr,
        keyTakeaways: b1.theory.keyTakeawaysAr,
        commonPitfalls: b1.theory.commonPitfallsAr,
      },
      practice: {
        question: b1.practice.questionAr,
        options: b1.practice.options.map((o) => ({ id: o.id, text: o.textAr, correct: o.isCorrect })),
        stepByStepSolution: [b1.practice.explanationStepByStepAr],
      },
      isomorphicRetest: {
        question: b1.isomorphicRetest.questionAr,
        options: b1.isomorphicRetest.options.map((o) => ({ id: o.id, text: o.textAr, correct: o.isCorrect })),
        repairGuide: b1.isomorphicRetest.repairGuideAr,
      },
    }, "arabic");
  }

  // Batch 5 Arabic
  const b5 = getBatch5LiteratureLanguagesBundle(skillId);
  if (b5 && b5.subject === "arabic") {
    return buildFromStandardPayload(b5 as any, "arabic", "common");
  }

  // Batch 7 Arabic
  const b7 = getBatch7LearningBundle(skillId);
  if (b7 && b7.subject === "arabic") {
    return buildFromStandardPayload(b7 as any, "arabic", "common");
  }

  // Batch 9 Arabic
  const b9 = getBatch9LearningBundle(skillId);
  if (b9 && b9.subject === "arabic") {
    return buildFromStandardPayload(b9 as any, "arabic", "common");
  }

  return null;
}

export const commonArabicBundles: Record<string, SkillLearningBundle> = {};
for (const id of COMMON_ARABIC_SKILL_IDS) {
  const b = getCommonArabicBundle(id);
  if (b) commonArabicBundles[id] = b;
}
