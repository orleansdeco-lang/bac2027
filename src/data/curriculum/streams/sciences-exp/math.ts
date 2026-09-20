/**
 * BAC Mastery - Sciences Expérimentales: Mathematics
 * Source: Algerian National Curriculum (3AS)
 * Units: الدوال العددية، الأسية واللوغاريتمية، المتتاليات، الاحتمالات، الأعداد المركبة، الهندسة في الفضاء، الحساب التكاملي
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getMathTerm2Bundle } from "@/domain/content/math-term2-bundle";
import {
  PROMPT11_SKILLS,
  PROMPT12_LESSONS,
  PROMPT11_PRACTICE_QUESTIONS,
  PROMPT12_MINI_EXAMS,
  PROMPT12_REPAIR_GUIDES,
  PROMPT11_RETEST_QUESTIONS,
  PROMPT11_PAST_BAC_REFERENCES,
  PROMPT11_SOURCES,
  getSkillReadinessReport,
} from "@/domain/content/mappings";

export const SCIENCES_EXP_MATH_SKILL_IDS = [
  "math_derivatives_chain_rule",
  "math_functions_limits_factoring",
  "math_functions_asymptotes",
  "math_tangent_convexity",
  "math_exp_properties_equations",
  "math_exp_growth_decay_limits",
  "math_ln_properties_equations",
  "math_ln_limits_growth",
  "math_sequences_induction",
  "math_sequences_arithmetic_geometric",
  "math_complex_polar_exponential",
  "math_space_geometry_plane_line",
  "math_integration_by_parts_area",
  "math_complex_numbers_polar_form",
] as const;

export function getSciencesExpMathBundle(skillId: string): SkillLearningBundle | null {
  const t2 = getMathTerm2Bundle(skillId);
  if (t2) {
    return buildFromStandardPayload(t2 as any, "math", "sciences_exp");
  }

  const skill = PROMPT11_SKILLS.find((s) => s.id === skillId && s.subjectId === "math");
  if (!skill) return null;

  const lesson = PROMPT12_LESSONS.find((l) => l.skillId === skillId && l.isActive);
  const workedExample = lesson?.workedExample;
  const practiceQuestions = PROMPT11_PRACTICE_QUESTIONS.filter((q) => q.skillId === skillId);
  const miniCheck = PROMPT12_MINI_EXAMS.find((me) => me.skillIds.includes(skillId) && me.isActive);
  const repairGuide = PROMPT12_REPAIR_GUIDES.find((rg) => rg.skillId === skillId && rg.isActive);
  const retest = PROMPT11_RETEST_QUESTIONS.find((q) => q.skillId === skillId);
  const examApplication = PROMPT11_PAST_BAC_REFERENCES.find((ref) => ref.skillIds.includes(skillId));
  const provenance = lesson?.sourceId
    ? PROMPT11_SOURCES.find((src) => src.id === lesson.sourceId)
    : undefined;
  const readiness = getSkillReadinessReport(skillId);

  return {
    skill,
    lesson,
    workedExample,
    practiceQuestions,
    miniCheck,
    repairGuide,
    retest,
    examApplication,
    provenance,
    readiness,
  };
}

export const sciencesExpMathBundles: Record<string, SkillLearningBundle> = {};
for (const id of SCIENCES_EXP_MATH_SKILL_IDS) {
  const b = getSciencesExpMathBundle(id);
  if (b) sciencesExpMathBundles[id] = b;
}
