/**
 * BAC Mastery - Common Curriculum: History (التاريخ المشترك لجميع الشعب)
 * Source: Algerian National Curriculum (3AS)
 * Units: الحرب الباردة، الثورة التحريرية (عسكرياً ودبلوماسياً)، عدم الانحياز، القضية الفلسطينية
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getBatch6LearningBundle } from "@/domain/content/math-factory-revolution-bundle";
import { getBatch9LearningBundle } from "@/domain/content/batch9-final-curriculum-bundle";
import { getPack6LettresPhiloBundle } from "@/domain/content/pack6-lettres-philo-bundle";

export const COMMON_HISTORY_SKILL_IDS = [
  "hist_algerian_revolution_military_strategy",
  "hist_algerian_revolution_diplomatic_strategy",
  "hist_non_aligned_movement_third_world",
  "hist_palestine_arab_israeli_conflict",
  "hg_lp_cold_war_bipolarity",
] as const;

export function getCommonHistoryBundle(skillId: string): SkillLearningBundle | null {
  // Batch 6 Revolution Units
  const b6 = getBatch6LearningBundle(skillId);
  if (b6 && skillId.startsWith("hist_")) {
    return buildFromStandardPayload(b6 as any, "history_geography", "common");
  }

  // Batch 9 Closing History Units
  const b9 = getBatch9LearningBundle(skillId);
  if (b9 && (skillId === "hist_non_aligned_movement_third_world" || skillId === "hist_palestine_arab_israeli_conflict")) {
    return buildFromStandardPayload(b9 as any, "history_geography", "common");
  }

  // Pack 6 Cold War Unit
  const p6 = getPack6LettresPhiloBundle(skillId);
  if (p6 && skillId === "hg_lp_cold_war_bipolarity") {
    return buildFromStandardPayload(p6 as any, "history_geography", "common");
  }

  return null;
}

export const commonHistoryBundles: Record<string, SkillLearningBundle> = {};
for (const id of COMMON_HISTORY_SKILL_IDS) {
  const b = getCommonHistoryBundle(id);
  if (b) commonHistoryBundles[id] = b;
}
