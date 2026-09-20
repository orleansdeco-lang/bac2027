/**
 * BAC Mastery - Math Stream: Advanced Mathematics (الحساب، الموافقات، والتحويلات النقطية)
 * Source: Algerian National Curriculum (3AS)
 * Units: الحساب والموافقات الدورية في Z، معادلات ديوفانتوس ومبرهنة بيزو، مبرهنة غوص والتحليل لعوامل أولية، التحويلات النقطية في الأعداد المركبة
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getBatch6LearningBundle } from "@/domain/content/math-factory-revolution-bundle";

export const MATH_STREAM_ADVANCED_SKILL_IDS = [
  "math_arithmetic_congruences_periodicity",
  "math_arithmetic_bezout_diophantine",
  "math_arithmetic_gauss_prime_factorization",
  "math_complex_geometric_transformations",
] as const;

export function getMathStreamAdvancedBundle(skillId: string): SkillLearningBundle | null {
  const b6 = getBatch6LearningBundle(skillId);
  if (b6 && b6.subject === "math") {
    return buildFromStandardPayload(b6 as any, "math", "math");
  }

  return null;
}

export const mathStreamAdvancedBundles: Record<string, SkillLearningBundle> = {};
for (const id of MATH_STREAM_ADVANCED_SKILL_IDS) {
  const b = getMathStreamAdvancedBundle(id);
  if (b) mathStreamAdvancedBundles[id] = b;
}
