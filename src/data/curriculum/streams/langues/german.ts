/**
 * BAC Mastery - Langues Étrangères: German (اللغة الألمانية - لغة أجنبية ثالثة)
 * Source: Algerian National Curriculum (3AS)
 * Units: Das Vorgangspassiv mit Modalverben, Kausale und Konditionale Nebensätze (weil, dass, wenn)
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getBatch5LiteratureLanguagesBundle } from "@/domain/content/foreign-languages-third-lang-bundle";

export const GERMAN_SKILL_IDS = [
  "all_passiv_modalverben",
  "all_nebensaetze_weil_dass_wenn",
] as const;

export function getGermanBundle(skillId: string): SkillLearningBundle | null {
  const b5 = getBatch5LiteratureLanguagesBundle(skillId);
  if (b5 && skillId.startsWith("all_")) {
    return buildFromStandardPayload(b5 as any, "third_language", "langues_etrangeres");
  }
  return null;
}

export const germanBundles: Record<string, SkillLearningBundle> = {};
for (const id of GERMAN_SKILL_IDS) {
  const b = getGermanBundle(id);
  if (b) germanBundles[id] = b;
}
