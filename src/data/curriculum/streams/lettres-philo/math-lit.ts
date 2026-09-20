/**
 * BAC Mastery - Lettres & Philo / Langues: Literary Mathematics (الرياضيات للأدبيين واللغات)
 * Source: Algerian National Curriculum (3AS)
 * Units: المتتاليات الحسابية والهندسية، القسمة الإقليدية والموافقات في Z، الدوال كثيرات الحدود
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getPack4ArabicLitMathBundle } from "@/domain/content/pack4-arabic-and-literature-math-bundle";
import { getPack6LettresPhiloBundle } from "@/domain/content/pack6-lettres-philo-bundle";

export const LITERARY_MATH_SKILL_IDS = [
  "math_lit_arithmetic_geometric_sequences",
  "math_lit_euclidean_division_congruence",
  "math_lit_polynomial_rational_functions",
  "math_lp_sequences_arithmetic",
  "math_lp_congruence_modular",
] as const;

export function getLiteraryMathBundle(skillId: string): SkillLearningBundle | null {
  const p6 = getPack6LettresPhiloBundle(skillId);
  if (p6 && p6.subject === "math") {
    return buildFromStandardPayload(p6 as any, "math", "lettres_philo");
  }

  const p4 = getPack4ArabicLitMathBundle(skillId);
  if (p4 && (p4.subject === "mathematics" || (p4.subject as string) === "math")) {
    return buildFromStandardPayload(p4 as any, "math", "lettres_philo");
  }

  return null;
}

export const literaryMathBundles: Record<string, SkillLearningBundle> = {};
for (const id of LITERARY_MATH_SKILL_IDS) {
  const b = getLiteraryMathBundle(id);
  if (b) literaryMathBundles[id] = b;
}
