/**
 * BAC Mastery - Technique Mathématique: Mechanical Engineering (الهندسة الميكانيكية)
 * Source: Algerian National Curriculum (3AS)
 * Units: سلاسل الأبعاد، الانحناء البسيط، المسننات وحساب السرعات، الالتواء البسيط، نقل الحركة بالسيور والسلاسل
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getTechniqueMathBundle } from "@/domain/content/technique-math-bundle";
import { getBatch8LearningBundle } from "@/domain/content/batch8-italien-mecanique-gestion-bundle";
import { getPack5EngineeringSnvBundle } from "@/domain/content/pack5-technique-math-engineering-expanded";

export const TM_MECA_SKILL_IDS = [
  "tm_meca_dimensional_chains",
  "tm_meca_simple_bending_rdm",
  "tm_meca_spur_gears_kinematics",
  "tm_meca_torsion_stress",
  "tm_meca_power_transmission_belt_chain",
] as const;

export function getTmMecaBundle(skillId: string): SkillLearningBundle | null {
  const p5 = getPack5EngineeringSnvBundle(skillId);
  if (p5 && (p5.subject === "mechanical_engineering" || (p5.subject as string) === "mechanical_eng")) {
    return buildFromStandardPayload(p5 as any, "mechanical_eng", "technique_math");
  }

  const b8 = getBatch8LearningBundle(skillId);
  if (b8 && b8.subject === "genie_mecanique") {
    return buildFromStandardPayload(b8 as any, "mechanical_eng", "technique_math");
  }

  const tm = getTechniqueMathBundle(skillId);
  if (tm && tm.subject === "genie_mecanique") {
    return buildFromStandardPayload(tm as any, "mechanical_eng", "technique_math");
  }

  return null;
}

export const tmMecaBundles: Record<string, SkillLearningBundle> = {};
for (const id of TM_MECA_SKILL_IDS) {
  const b = getTmMecaBundle(id);
  if (b) tmMecaBundles[id] = b;
}
