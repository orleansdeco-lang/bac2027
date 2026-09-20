/**
 * BAC Mastery - Common Curriculum: Geography (الجغرافيا المشتركة لجميع الشعب)
 * Source: Algerian National Curriculum (3AS)
 * Units: القوى الاقتصادية الكبرى (الثالوث)، الاقتصاد الجزائري وتحديات التنمية، البرازيل والتفاوت الإقليمي
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getBatch7LearningBundle } from "@/domain/content/batch7-geo-islamic-arabic-bundle";
import { getBatch9LearningBundle } from "@/domain/content/batch9-final-curriculum-bundle";

export const COMMON_GEOGRAPHY_SKILL_IDS = [
  "geo_global_economic_powers_triad",
  "geo_algerian_economy_development_challenges",
  "geo_brazil_emerging_power_inequalities",
] as const;

export function getCommonGeographyBundle(skillId: string): SkillLearningBundle | null {
  const b7 = getBatch7LearningBundle(skillId);
  if (b7 && skillId === "geo_global_economic_powers_triad") {
    return buildFromStandardPayload(b7 as any, "history_geography", "common");
  }

  const b9 = getBatch9LearningBundle(skillId);
  if (b9 && (skillId === "geo_algerian_economy_development_challenges" || skillId === "geo_brazil_emerging_power_inequalities")) {
    return buildFromStandardPayload(b9 as any, "history_geography", "common");
  }

  return null;
}

export const commonGeographyBundles: Record<string, SkillLearningBundle> = {};
for (const id of COMMON_GEOGRAPHY_SKILL_IDS) {
  const b = getCommonGeographyBundle(id);
  if (b) commonGeographyBundles[id] = b;
}
