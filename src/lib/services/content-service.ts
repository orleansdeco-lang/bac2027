/**
 * BAC Mastery - Content Application Service
 * Provides access to authoritative pedagogical learning bundles (all 14 assets)
 * Invariant: Content Purity (zero student_id / user_id)
 */

import {
  getSkillLearningBundle,
  SkillLearningBundle,
  getAllSkillContentReadiness,
  SkillReadinessStatus,
  PROMPT11_SKILLS,
  PROMPT12_MINI_EXAMS,
  MiniExam,
} from "@/domain/content";
import { Skill } from "@/domain/content/types";

import { GESTION_ECO_SKILLS } from "@/data/skills/gestion-economie";

export const ContentService = {
  /**
   * Retrieve the full 14-element learning bundle for a canonical skill
   */
  getBundle(skillId: string): SkillLearningBundle | null {
    return getSkillLearningBundle(skillId);
  },

  /**
   * Get all canonical skills across streams
   */
  getAllSkills(): Skill[] {
    const gestionList = Object.values(GESTION_ECO_SKILLS) as unknown as Skill[];
    return [...PROMPT11_SKILLS, ...gestionList];
  },

  /**
   * Get readiness for all skills
   */
  getAllReadiness(): Record<string, SkillReadinessStatus> {
    return getAllSkillContentReadiness();
  },

  /**
   * Get all mini-exams and topic assessments
   */
  getMiniExams(): MiniExam[] {
    return PROMPT12_MINI_EXAMS;
  },

  /**
   * Get mini-exam by ID
   */
  getMiniExamById(id: string): MiniExam | undefined {
    return PROMPT12_MINI_EXAMS.find((e: MiniExam) => e.id === id);
  },

  /**
   * Get multi-subject weekly checkpoints
   */
  getWeeklyCheckpoints(): MiniExam[] {
    return PROMPT12_MINI_EXAMS.filter((e: MiniExam) => e.type === "weekly_checkpoint");
  },
};
