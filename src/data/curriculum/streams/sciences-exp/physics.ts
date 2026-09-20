/**
 * BAC Mastery - Sciences Expérimentales: Physics & Chemistry (الفيزياء والكيمياء)
 * Source: Algerian National Curriculum (3AS)
 * Units: الحركية الكيميائية، النووي، الكهرباء (RC, RL, RLC)، الميكانيك وحركة الكواكب، مراقبة جملة كيميائية وأسترة
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getPhysicsTerm2Bundle } from "@/domain/content/physics-term2-bundle";
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

export const SCIENCES_EXP_PHYSICS_SKILL_IDS = [
  "physics_redox_half_equations",
  "physics_reaction_progress_table",
  "physics_half_life_speed",
  "physics_nuclear_decay_equations",
  "physics_nuclear_mass_defect_energy",
  "physics_nuclear_decay_law",
  "physics_rc_charge_differential_eq",
  "physics_rl_current_establishment",
  "physics_rlc_electrical_oscillations",
  "physics_newton_second_law_freefall",
  "physics_satellite_kepler_orbital",
  "physics_mechanical_oscillations_spring",
  "physics_ph_buffer_equivalence",
  "physics_esterification_hydrolysis_equilibrium",
] as const;

export function getSciencesExpPhysicsBundle(skillId: string): SkillLearningBundle | null {
  const t2 = getPhysicsTerm2Bundle(skillId);
  if (t2) {
    return buildFromStandardPayload(t2 as any, "physics", "sciences_exp");
  }

  const skill = PROMPT11_SKILLS.find((s) => s.id === skillId && s.subjectId === "physics");
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

export const sciencesExpPhysicsBundles: Record<string, SkillLearningBundle> = {};
for (const id of SCIENCES_EXP_PHYSICS_SKILL_IDS) {
  const b = getSciencesExpPhysicsBundle(id);
  if (b) sciencesExpPhysicsBundles[id] = b;
}
