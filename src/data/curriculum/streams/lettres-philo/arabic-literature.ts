/**
 * BAC Mastery - Lettres & Philo: Arabic Literature (الأدب والبناء الفكري والتقويم النقدي)
 * Source: Algerian National Curriculum (3AS)
 * Units: شعر المنفى والبعث، تقنية التلخيص، الصور البيانية، التقويم النقدي والمذاهب الأدبية
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getPack6LettresPhiloBundle } from "@/domain/content/pack6-lettres-philo-bundle";

export const LETTRES_PHILO_ARABIC_LIT_SKILL_IDS = [
  "ar_lp_exile_revival_poetry",
  "ar_lp_intellectual_summary",
  "ar_lp_rhetoric_imagery",
  "ar_lp_critical_appreciation",
] as const;

export function getLettresPhiloArabicLitBundle(skillId: string): SkillLearningBundle | null {
  const p6 = getPack6LettresPhiloBundle(skillId);
  if (p6 && p6.subject === "arabic") {
    return buildFromStandardPayload(p6 as any, "arabic", "lettres_philo");
  }
  return null;
}

export const lettresPhiloArabicLitBundles: Record<string, SkillLearningBundle> = {};
for (const id of LETTRES_PHILO_ARABIC_LIT_SKILL_IDS) {
  const b = getLettresPhiloArabicLitBundle(id);
  if (b) lettresPhiloArabicLitBundles[id] = b;
}
