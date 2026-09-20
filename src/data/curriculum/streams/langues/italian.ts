/**
 * BAC Mastery - Langues Étrangères: Italian (اللغة الإيطالية - لغة أجنبية ثالثة)
 * Source: Algerian National Curriculum (3AS)
 * Units: Passato prossimo vs imperfetto, Pronomi combinati e particella 'ne'
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getBatch8LearningBundle } from "@/domain/content/batch8-italien-mecanique-gestion-bundle";

export const ITALIAN_SKILL_IDS = [
  "it_grammar_passato_imperfetto",
  "it_grammar_pronomi_combinati_ne",
] as const;

export function getItalianBundle(skillId: string): SkillLearningBundle | null {
  const b8 = getBatch8LearningBundle(skillId);
  if (b8 && skillId.startsWith("it_")) {
    return buildFromStandardPayload(b8 as any, "third_language", "langues_etrangeres");
  }
  return null;
}

export const italianBundles: Record<string, SkillLearningBundle> = {};
for (const id of ITALIAN_SKILL_IDS) {
  const b = getItalianBundle(id);
  if (b) italianBundles[id] = b;
}
