/**
 * BAC Mastery - Technique Mathématique: Electrical Engineering (الهندسة الكهربائية)
 * Source: Algerian National Curriculum (3AS)
 * Units: العدادات والمنطق التعاقبي، المضخمات العملياتية، التيار المتناوب ثلاثي الطور، المحركات اللاتزامنية
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getTechniqueMathBundle } from "@/domain/content/technique-math-bundle";
import { getPack5EngineeringSnvBundle } from "@/domain/content/pack5-technique-math-engineering-expanded";

export const TM_ELEC_SKILL_IDS = [
  "tm_elec_sequential_counters",
  "tm_elec_operational_amplifiers",
  "tm_elec_three_phase_systems",
  "tm_elec_ac_induction_motors",
] as const;

export function getTmElecBundle(skillId: string): SkillLearningBundle | null {
  const p5 = getPack5EngineeringSnvBundle(skillId);
  if (p5 && (p5.subject === "electrical_engineering" || (p5.subject as string) === "electrical_eng")) {
    return buildFromStandardPayload(p5 as any, "electrical_eng", "technique_math");
  }

  const tm = getTechniqueMathBundle(skillId);
  if (tm && tm.subject === "genie_electrique") {
    return buildFromStandardPayload(tm as any, "electrical_eng", "technique_math");
  }

  return null;
}

export const tmElecBundles: Record<string, SkillLearningBundle> = {};
for (const id of TM_ELEC_SKILL_IDS) {
  const b = getTmElecBundle(id);
  if (b) tmElecBundles[id] = b;
}
