/**
 * BAC Mastery - Common Curriculum: English (اللغة الإنجليزية المشتركة لجميع الشعب)
 * Source: Algerian National Curriculum (3AS)
 * Units: Ethics in Business (counterfeiting, whistleblowing), Ancient Civilizations, Safety First (advertising, fast food), Astronomy & Space Exploration, Key Grammar (high time, wishes, condition)
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getForeignLanguageBundle } from "@/domain/content/foreign-languages-bundle";
import { getPack2LanguagesBundle } from "@/domain/content/pack2-languages-french-english-bundle";

export const COMMON_ENGLISH_SKILL_IDS = [
  "eng_ethics_in_business_whistleblowing",
  "eng_grammar_it_is_high_time_wish",
  "eng_grammar_provided_that_condition",
  "eng_ancient_civilizations_flourish_fall",
  "eng_safety_first_advertising_junk_food",
  "eng_astronomy_solar_system_exploration",
] as const;

export function getCommonEnglishBundle(skillId: string): SkillLearningBundle | null {
  const p2 = getPack2LanguagesBundle(skillId);
  if (p2 && p2.subject === "english") {
    return buildFromStandardPayload(p2 as any, "english", "common");
  }

  const fl = getForeignLanguageBundle(skillId);
  if (fl && fl.subject === "english") {
    return buildFromStandardPayload(fl as any, "english", "common");
  }

  return null;
}

export const commonEnglishBundles: Record<string, SkillLearningBundle> = {};
for (const id of COMMON_ENGLISH_SKILL_IDS) {
  const b = getCommonEnglishBundle(id);
  if (b) commonEnglishBundles[id] = b;
}
