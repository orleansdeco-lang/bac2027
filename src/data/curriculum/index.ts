/**
 * BAC Mastery - Curriculum Data Layer & Helper Queries
 * Stream: Sciences Expérimentales (3AS)
 * Aggregates Topics, Skills, and Question Banks
 */

import { CurriculumTopic, CurriculumSkill } from "@/types/content";
import { PracticeQuestion } from "@/types/mission";
import { CURRICULUM_TOPICS } from "./topics";
import { ALL_CURRICULUM_SKILLS } from "@/data/skills";
import { EXPANDED_PRACTICE_QUESTIONS } from "./practice-questions";
import { EXPANDED_PRACTICE_QUESTIONS_SET2 } from "./practice-questions-set2";
import { SCIENCES_EXP_PRACTICE_QUESTIONS } from "@/data/practice/sciences-exp";
import { GESTION_ECO_PRACTICE_QUESTIONS } from "@/data/practice/gestion-eco";

// Re-export core datasets
export { CURRICULUM_TOPICS } from "./topics";
export { ALL_CURRICULUM_SKILLS } from "@/data/skills";
export { EXPANDED_PRACTICE_QUESTIONS } from "./practice-questions";
export { EXPANDED_PRACTICE_QUESTIONS_SET2 } from "./practice-questions-set2";
export { GESTION_ECO_PRACTICE_QUESTIONS } from "@/data/practice/gestion-eco";

// Combine all practice questions across pilot (18), expanded set 1 (44), expanded set 2 (31), and gestion-eco
export const ALL_PRACTICE_QUESTIONS: PracticeQuestion[] = [
  ...SCIENCES_EXP_PRACTICE_QUESTIONS,
  ...GESTION_ECO_PRACTICE_QUESTIONS,
  ...EXPANDED_PRACTICE_QUESTIONS,
  ...EXPANDED_PRACTICE_QUESTIONS_SET2,
];

// --- Topic Queries ---

export function getAllTopics(): CurriculumTopic[] {
  return CURRICULUM_TOPICS.filter((t) => t.isActive);
}

export function getTopicsForSubject(subjectId: string): CurriculumTopic[] {
  return CURRICULUM_TOPICS.filter((t) => t.subjectId === subjectId && t.isActive).sort((a, b) => a.order - b.order);
}

export function getTopicById(topicId: string): CurriculumTopic | undefined {
  return CURRICULUM_TOPICS.find((t) => t.id === topicId);
}

// --- Skill Queries ---

export function getAllCurriculumSkills(): CurriculumSkill[] {
  return Object.values(ALL_CURRICULUM_SKILLS).filter((s) => s.isActive);
}

export function getCurriculumSkillById(skillId: string): CurriculumSkill | undefined {
  return ALL_CURRICULUM_SKILLS[skillId];
}

export function getSkillsForTopic(topicId: string): CurriculumSkill[] {
  return Object.values(ALL_CURRICULUM_SKILLS)
    .filter((s) => s.topicId === topicId && s.isActive)
    .sort((a, b) => a.order - b.order);
}

export function getSkillsForSubject(subjectId: string): CurriculumSkill[] {
  return Object.values(ALL_CURRICULUM_SKILLS)
    .filter((s) => s.subjectId === subjectId && s.isActive)
    .sort((a, b) => a.order - b.order);
}

export function getPrerequisitesForSkill(skillId: string): CurriculumSkill[] {
  const skill = ALL_CURRICULUM_SKILLS[skillId];
  if (!skill || !skill.prerequisites) return [];
  return skill.prerequisites
    .map((prereqId) => ALL_CURRICULUM_SKILLS[prereqId])
    .filter((s): s is CurriculumSkill => Boolean(s));
}

export function getDependentsForSkill(skillId: string): CurriculumSkill[] {
  return Object.values(ALL_CURRICULUM_SKILLS).filter(
    (s) => s.isActive && s.prerequisites && s.prerequisites.includes(skillId)
  );
}

// --- Question Queries ---

export function getPracticeQuestionsForSkill(skillId: string): PracticeQuestion[] {
  return ALL_PRACTICE_QUESTIONS.filter((q) => q.skillId === skillId && !q.isRetestVariant);
}

export function getRetestQuestionForSkill(skillId: string): PracticeQuestion | undefined {
  return ALL_PRACTICE_QUESTIONS.find((q) => q.skillId === skillId && q.isRetestVariant);
}

export function getQuestionById(questionId: string): PracticeQuestion | undefined {
  return ALL_PRACTICE_QUESTIONS.find((q) => q.id === questionId);
}
