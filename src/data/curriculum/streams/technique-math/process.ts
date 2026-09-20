/**
 * BAC Mastery - Technique Mathématique: Process Engineering (هندسة الطرائق)
 * Source: Algerian National Curriculum (3AS)
 * Units: الكيمياء العضوية (الدهون والصبونة)، الحركية الكيميائية وسرعة التفاعل، الديناميكا الحرارية الكيميائية (Hess)، تكرير البترول والتقطير
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getTechniqueMathBundle } from "@/domain/content/technique-math-bundle";
import { getPack5EngineeringSnvBundle } from "@/domain/content/pack5-technique-math-engineering-expanded";

export const TM_PROC_SKILL_IDS = [
  "tm_proc_organic_lipids_saponification",
  "tm_proc_chemical_kinetics_rate",
  "tm_proc_chemical_thermodynamics",
  "tm_proc_petroleum_refining_distillation",
] as const;

export function getTmProcBundle(skillId: string): SkillLearningBundle | null {
  const p5 = getPack5EngineeringSnvBundle(skillId);
  if (p5 && (p5.subject === "process_engineering" || (p5.subject as string) === "process_eng")) {
    return buildFromStandardPayload(p5 as any, "process_eng", "technique_math");
  }

  const tm = getTechniqueMathBundle(skillId);
  if (tm && tm.subject === "genie_procedes") {
    return buildFromStandardPayload(tm as any, "process_eng", "technique_math");
  }

  return null;
}

export const tmProcBundles: Record<string, SkillLearningBundle> = {};
for (const id of TM_PROC_SKILL_IDS) {
  const b = getTmProcBundle(id);
  if (b) tmProcBundles[id] = b;
}
