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
} from "@/domain/content";
import { Skill } from "@/domain/content/types";

export const ContentService = {
  /**
   * Retrieve the full 14-element learning bundle for a canonical skill
   */
  getBundle(skillId: string): SkillLearningBundle | null {
    return getSkillLearningBundle(skillId);
  },

  /**
   * Get all 31 canonical skills
   */
  getAllSkills(): Skill[] {
    return PROMPT11_SKILLS;
  },

  /**
   * Get readiness for all skills
   */
  getAllReadiness(): Record<string, SkillReadinessStatus> {
    return getAllSkillContentReadiness();
  },
};
