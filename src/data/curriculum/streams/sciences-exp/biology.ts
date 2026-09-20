/**
 * BAC Mastery - Sciences Expérimentales: Natural & Life Sciences (علوم الطبيعة والحياة)
 * Source: Algerian National Curriculum (3AS)
 * Units: تركيب البروتين، الإنزيمات، المناعة الخلطية والخلوية، الاتصال العصبي، التحولات الطاقوية (التركيب الضوئي والتنفس)، الجيولوجيا وحركة الصفائح
 */

import { SkillLearningBundle, buildFromStandardPayload } from "../../bundle-builder";
import { getSnvTerm2Bundle } from "@/domain/content/snv-term2-3-bundle";
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

export const SCIENCES_EXP_BIOLOGY_SKILL_IDS = [
  "snv_transcription_translation_flow",
  "snv_genetic_code_reading",
  "snv_enzyme_active_site_kinetics",
  "snv_enzyme_inhibition_ph_temp",
  "snv_humoral_cellular_response",
  "snv_antibodies_structure_action",
  "snv_synaptic_transmission_action_potential",
  "snv_motor_reflex_inhibition",
  "snv_photosynthesis_light_reactions",
  "snv_cellular_respiration_krebs_cycle",
  "snv_geology_earth_structure_subduction",
] as const;

export function getSciencesExpBiologyBundle(skillId: string): SkillLearningBundle | null {
  const t2 = getSnvTerm2Bundle(skillId);
  if (t2) {
    return buildFromStandardPayload(t2 as any, "natural_sciences", "sciences_exp");
  }

  const skill = PROMPT11_SKILLS.find((s) => s.id === skillId && s.subjectId === "natural_sciences");
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

export const sciencesExpBiologyBundles: Record<string, SkillLearningBundle> = {};
for (const id of SCIENCES_EXP_BIOLOGY_SKILL_IDS) {
  const b = getSciencesExpBiologyBundle(id);
  if (b) sciencesExpBiologyBundles[id] = b;
}
