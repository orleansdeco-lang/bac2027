/**
 * BAC Mastery - Common Curriculum: Islamic Studies (العلوم الإسلامية المشتركة)
 * Source: Algerian National Curriculum (3AS)
 * Units: العقيدة وأثرها، مقاصد الشريعة، مصادر التشريع، العقل، المعاملات المالية، الميراث، الجريمة والانحراف، العلاقات الإنسانية، الوقف
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { PACK1_ISLAMIC_STUDIES_BUNDLE, getPack1IslamicBundle } from "@/domain/content/pack1-islamic-studies-full-bundle";
import { getPack6LettresPhiloBundle } from "@/domain/content/pack6-lettres-philo-bundle";

export const COMMON_ISLAMIC_SKILL_IDS = [
  "isl_aqeedah_individual_society",
  "isl_maqasid_sharia_priorities",
  "isl_sources_legislation_ijma_qiyas",
  "isl_mind_role_quran",
  "isl_riba_modern_financial_transactions",
  "isl_freedom_individual_social",
  "isl_family_society_foundations",
  "isl_inheritance_rules_hajb",
  "isl_crime_deviance_hudud_qisas",
  "isl_human_relations_non_muslims",
  "isl_constitutional_charters_madinah",
  "isl_waqf_economic_social_role",
  "is_lp_aqeedah_intellect",
  "is_lp_sources_legislation",
] as const;

export function getCommonIslamicBundle(skillId: string): SkillLearningBundle | null {
  const p1 = getPack1IslamicBundle(skillId);
  if (p1) {
    return buildFromStandardPayload(p1 as any, "islamic_studies", "common");
  }

  const p6 = getPack6LettresPhiloBundle(skillId);
  if (p6 && (skillId === "is_lp_aqeedah_intellect" || skillId === "is_lp_sources_legislation")) {
    return buildFromStandardPayload(p6 as any, "islamic_studies", "lettres_philo");
  }

  return null;
}

export const commonIslamicBundles: Record<string, SkillLearningBundle> = {};
for (const id of COMMON_ISLAMIC_SKILL_IDS) {
  const b = getCommonIslamicBundle(id);
  if (b) commonIslamicBundles[id] = b;
}
