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
  getAllTechniqueMathSkills,
  getAllBatch5Skills,
  getBatch5SkillsForStream,
  getAllBatch9Skills,
} from "@/domain/content";
import { Skill } from "@/domain/content/types";

import { GESTION_ECO_SKILLS } from "@/data/skills/gestion-economie";
import { LETTRES_PHILO_SKILLS } from "@/data/skills/lettres-philo";

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
    const b9List = getAllBatch9Skills();

    if (streamId === "sciences_exp") {
      return [...PROMPT11_SKILLS, ...b9List];
    }
    if (streamId === "gestion_eco") {
      return [...(Object.values(GESTION_ECO_SKILLS) as unknown as Skill[]), ...b9List];
    }
    if (streamId === "lettres_philo") {
      const base = Object.values(LETTRES_PHILO_SKILLS) as unknown as Skill[];
      const b5 = getBatch5SkillsForStream("lettres_philo");
      return [...base, ...b5, ...b9List];
    }
    if (streamId === "math") {
      // Return math and physics skills strictly excluding SNV + Batch 9 core
      const mathPhysics = PROMPT11_SKILLS.filter(
        (s) => s.subjectId === "math" || s.subjectId === "physics"
      );
      return [...mathPhysics, ...b9List];
    }
    if (streamId === "technique_math") {
      // Return math and physics skills + all technique math engineering skills + Batch 9 core
      const baseMathPhysics = PROMPT11_SKILLS.filter(
        (s) => s.subjectId === "math" || s.subjectId === "physics"
      );
      return [...baseMathPhysics, ...getAllTechniqueMathSkills(), ...b9List];
    }
    if (streamId === "langues_etrangeres") {
      const base = Object.values(LETTRES_PHILO_SKILLS).filter((s) =>
        validateContentStreamCompatibility(streamId, { skillId: s.id, subjectId: s.subjectId })
      ) as unknown as Skill[];
      const b5 = getBatch5SkillsForStream("langues_etrangeres");
      return [...base, ...b5, ...b9List];
    }
    // Default fallback with strict validation
    return [...PROMPT11_SKILLS, ...b9List].filter((s) =>
      validateContentStreamCompatibility(streamId, { skillId: s.id, subjectId: s.subjectId })
    );
  },

  /**
   * Get all canonical skills across streams (admin/catalog purposes only)
   */
  getAllSkills(): Skill[] {
    const gestionList = Object.values(GESTION_ECO_SKILLS) as unknown as Skill[];
    const lettresList = Object.values(LETTRES_PHILO_SKILLS) as unknown as Skill[];
    const tmList = getAllTechniqueMathSkills();
    const b5List = getAllBatch5Skills();
    const b9List = getAllBatch9Skills();
    return [...PROMPT11_SKILLS, ...gestionList, ...lettresList, ...tmList, ...b5List, ...b9List];
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
