/**
 * BAC Mastery - Math Stream: Natural Sciences (العلوم الطبيعية لشعبة الرياضيات)
 * Source: Algerian National Curriculum (3AS)
 * Units: تركيب البروتين (استنساخ وترجمة)، النشاط الإنزيمي، المناعة (خلطية وخلوية)، الاتصال العصبي
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getPack5EngineeringSnvBundle } from "@/domain/content/pack5-technique-math-engineering-expanded";

export const MATH_STREAM_BIOLOGY_SKILL_IDS = [
  "snv_math_protein_synthesis_transcription_translation",
  "snv_math_humoral_cellular_immunity",
  "snv_math_enzymes_biocatalysis",
  "snv_math_synaptic_transmission_action_potential",
] as const;

export function getMathStreamBiologyBundle(skillId: string): SkillLearningBundle | null {
  const p5 = getPack5EngineeringSnvBundle(skillId);
  if (p5 && p5.subject === "natural_sciences") {
    return buildFromStandardPayload(p5 as any, "natural_sciences", "math");
  }
  return null;
}

export const mathStreamBiologyBundles: Record<string, SkillLearningBundle> = {};
for (const id of MATH_STREAM_BIOLOGY_SKILL_IDS) {
  const b = getMathStreamBiologyBundle(id);
  if (b) mathStreamBiologyBundles[id] = b;
}
