/**
 * BAC Mastery - Common Curriculum: French (اللغة الفرنسية المشتركة لجميع الشعب)
 * Source: Algerian National Curriculum (3AS)
 * Units: Texte d'histoire (visée, énonciation), Compte-rendu critique, Texte argumentatif (plaidoyer/réquisitoire), L'appel incitatif, Discours rapporté et cause/conséquence
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getForeignLanguageBundle } from "@/domain/content/foreign-languages-bundle";
import { getPack2LanguagesBundle } from "@/domain/content/pack2-languages-french-english-bundle";

export const COMMON_FRENCH_SKILL_IDS = [
  "fr_texte_histoire_enonciation",
  "fr_compte_rendu_objectif_critique",
  "fr_texte_argumentatif_plaidoyer_requisitoire",
  "fr_l_appel_incitatif",
  "fr_debat_idees_plaidoyer_requisitoire_syntax",
  "fr_appel_incitatif_structure_tripartite",
  "fr_outils_langue_discours_rapporte_cause",
] as const;

export function getCommonFrenchBundle(skillId: string): SkillLearningBundle | null {
  const p2 = getPack2LanguagesBundle(skillId);
  if (p2 && p2.subject === "french") {
    return buildFromStandardPayload(p2 as any, "french", "common");
  }

  const fl = getForeignLanguageBundle(skillId);
  if (fl && fl.subject === "french") {
    return buildFromStandardPayload(fl as any, "french", "common");
  }

  return null;
}

export const commonFrenchBundles: Record<string, SkillLearningBundle> = {};
for (const id of COMMON_FRENCH_SKILL_IDS) {
  const b = getCommonFrenchBundle(id);
  if (b) commonFrenchBundles[id] = b;
}
