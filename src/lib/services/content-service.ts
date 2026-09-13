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

import { StreamId } from "@/types/education";
import { validateContentStreamCompatibility } from "@/domain/student";

export const ContentService = {
  /**
   * Retrieve the full 14-element learning bundle for a canonical skill,
   * optionally validating stream compatibility. Rejects cross-stream requests.
   */
  getBundle(skillId: string, streamId?: StreamId): SkillLearningBundle | null {
    if (streamId && !validateContentStreamCompatibility(streamId, { skillId })) {
      return null;
    }
    return getSkillLearningBundle(skillId);
  },

  /**
   * Get all canonical skills for a specific stream (eliminates cross-stream leakage)
   */
  getSkillsForStream(streamId: StreamId): Skill[] {
    if (streamId === "sciences_exp") {
      return PROMPT11_SKILLS;
    }
    if (streamId === "gestion_eco") {
      return Object.values(GESTION_ECO_SKILLS) as unknown as Skill[];
    }
    if (streamId === "math") {
      // Return math and physics skills compatible with Math stream (excluding SNV)
      return PROMPT11_SKILLS.filter((s) => s.subjectId === "math" || s.subjectId === "physics");
    }
    // Default fallback
    return PROMPT11_SKILLS.filter((s) => validateContentStreamCompatibility(streamId, { skillId: s.id, subjectId: s.subjectId }));
  },

  /**
   * Get all canonical skills across streams (admin/catalog purposes only)
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
   * Get all mini-exams, optionally filtered by stream
   */
  getMiniExams(streamId?: StreamId): MiniExam[] {
    if (!streamId) return PROMPT12_MINI_EXAMS;
    return PROMPT12_MINI_EXAMS.filter((e: MiniExam) =>
      validateContentStreamCompatibility(streamId, { subjectId: e.subjectId })
    );
  },

  /**
   * Get mini-exam by ID
   */
  getMiniExamById(id: string, streamId?: StreamId): MiniExam | undefined {
    const exam = PROMPT12_MINI_EXAMS.find((e: MiniExam) => e.id === id);
    if (!exam) return undefined;
    if (streamId && !validateContentStreamCompatibility(streamId, { subjectId: exam.subjectId })) {
      return undefined;
    }
    return exam;
  },

  /**
   * Get multi-subject weekly checkpoints for a specific stream
   */
  getWeeklyCheckpoints(streamId?: StreamId): MiniExam[] {
    const list = PROMPT12_MINI_EXAMS.filter((e: MiniExam) => e.type === "weekly_checkpoint");
    if (!streamId) return list;
    return list.filter((e: MiniExam) =>
      validateContentStreamCompatibility(streamId, { subjectId: e.subjectId })
    );
  },
};
