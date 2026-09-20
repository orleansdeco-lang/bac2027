/**
 * BAC Mastery - Lettres & Philo: Philosophy (الفلسفة العامة ومنهجيات المقال)
 * Source: Algerian National Curriculum (3AS)
 * Units: منهجية الجدل والاستقصاء والمقارنة وتحليل النص، الإدراك، اللغة والفكر، الشعور واللاشعور، الذاكرة، العادة والإرادة، فلسفة العلوم والرياضيات، الأخلاق والعدالة
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getBatch1LearningBundle } from "@/domain/content/batch1-philosophy-arabic-bundle";
import { getBatch5LiteratureLanguagesBundle } from "@/domain/content/foreign-languages-third-lang-bundle";
import { getBatch7LearningBundle } from "@/domain/content/batch7-geo-islamic-arabic-bundle";
import { getPack3PhilosophyBundle } from "@/domain/content/pack3-philosophy-scientific-bundle";
import { getPack6LettresPhiloBundle } from "@/domain/content/pack6-lettres-philo-bundle";

export const LETTRES_PHILO_PHILOSOPHY_SKILL_IDS = [
  "phi_lp_dialectical_methodology",
  "phi_lp_investigation_defense",
  "phi_lp_comparison_methodology",
  "phi_lp_text_analysis",
  "phil_perception_empiricism_rationalism",
  "phil_language_thought_connection",
  "phil_consciousness_unconscious_freud",
  "phil_memory_imagination_theories",
  "phil_habit_will_conflict",
  "phil_epistemology_biology_determinism",
  "phil_ethics_justice_equality_merit",
  "phil_mathematics_epistemology_axiomatics",
  "phil_sci_problem_vs_dialectic",
  "phil_sci_math_rationalism_empiricism",
  "phil_sci_experimental_method_determinism",
] as const;

export function getLettresPhiloPhilosophyBundle(skillId: string): SkillLearningBundle | null {
  const p6 = getPack6LettresPhiloBundle(skillId);
  if (p6 && p6.subject === "philosophy") {
    return buildFromStandardPayload(p6 as any, "philosophy", "lettres_philo");
  }

  const p3 = getPack3PhilosophyBundle(skillId);
  if (p3) {
    return buildFromStandardPayload(p3 as any, "philosophy", "lettres_philo");
  }

  const b1 = getBatch1LearningBundle(skillId);
  if (b1 && b1.subject === "philosophy") {
    return buildFromStandardPayload(b1 as any, "philosophy", "lettres_philo");
  }

  const b5 = getBatch5LiteratureLanguagesBundle(skillId);
  if (b5 && b5.subject === "philosophy") {
    return buildFromStandardPayload(b5 as any, "philosophy", "lettres_philo");
  }

  const b7 = getBatch7LearningBundle(skillId);
  if (b7 && ((b7.subject as string) === "philosophy" || (b7.subject as string) === "philo")) {
    return buildFromStandardPayload(b7 as any, "philosophy", "lettres_philo");
  }

  return null;
}

export const lettresPhiloPhilosophyBundles: Record<string, SkillLearningBundle> = {};
for (const id of LETTRES_PHILO_PHILOSOPHY_SKILL_IDS) {
  const b = getLettresPhiloPhilosophyBundle(id);
  if (b) lettresPhiloPhilosophyBundles[id] = b;
}
