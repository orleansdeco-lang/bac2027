/**
 * BAC Mastery - Technique Mathématique: Civil Engineering (الهندسة المدنية)
 * Source: Algerian National Curriculum (3AS)
 * Units: ردود أفعال الروافد، الشد والانضغاط البسيط، الأنظمة المثلثية، الخرسانة المسلحة وحساب التسليح
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getTechniqueMathBundle } from "@/domain/content/technique-math-bundle";
import { getPack5EngineeringSnvBundle } from "@/domain/content/pack5-technique-math-engineering-expanded";

export const TM_CIVIL_SKILL_IDS = [
  "tm_civil_beam_reactions",
  "tm_civil_tension_compression_stress",
  "tm_civil_truss_analysis",
  "tm_civil_reinforced_concrete_beams",
] as const;

export function getTmCivilBundle(skillId: string): SkillLearningBundle | null {
  const p5 = getPack5EngineeringSnvBundle(skillId);
  if (p5 && (p5.subject === "civil_engineering" || (p5.subject as string) === "civil_eng")) {
    return buildFromStandardPayload(p5 as any, "civil_eng", "technique_math");
  }

  const tm = getTechniqueMathBundle(skillId);
  if (tm && tm.subject === "genie_civil") {
    return buildFromStandardPayload(tm as any, "civil_eng", "technique_math");
  }

  return null;
}

export const tmCivilBundles: Record<string, SkillLearningBundle> = {};
for (const id of TM_CIVIL_SKILL_IDS) {
  const b = getTmCivilBundle(id);
  if (b) tmCivilBundles[id] = b;
}
