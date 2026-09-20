/**
 * BAC Mastery - Langues Étrangères: Spanish (اللغة الإسبانية - لغة أجنبية ثالثة)
 * Source: Algerian National Curriculum (3AS)
 * Units: El Presente de Subjuntivo (Deseo, Duda), Las Estructuras Condicionales (Si + Subjuntivo)
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getBatch5LiteratureLanguagesBundle } from "@/domain/content/foreign-languages-third-lang-bundle";

export const SPANISH_SKILL_IDS = [
  "esp_subjuntivo_deseo_duda",
  "esp_oraciones_condicionales_si",
] as const;

export function getSpanishBundle(skillId: string): SkillLearningBundle | null {
  const b5 = getBatch5LiteratureLanguagesBundle(skillId);
  if (b5 && skillId.startsWith("esp_")) {
    return buildFromStandardPayload(b5 as any, "third_language", "langues_etrangeres");
  }
  return null;
}

export const spanishBundles: Record<string, SkillLearningBundle> = {};
for (const id of SPANISH_SKILL_IDS) {
  const b = getSpanishBundle(id);
  if (b) spanishBundles[id] = b;
}
