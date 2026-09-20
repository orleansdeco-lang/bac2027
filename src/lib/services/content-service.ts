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
  getAllPack1IslamicSkills,
  getAllPack2LanguageSkills,
  getAllPack3PhilosophySkills,
  getAllPack4ArabicLitMathSkills,
  getAllPack5EngineeringSnvSkills,
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
    const pack1Islamic = getAllPack1IslamicSkills();
    const pack2Languages = getAllPack2LanguageSkills();
    const pack3PhiloSci = getAllPack3PhilosophySkills();
    const pack4All = getAllPack4ArabicLitMathSkills();
    const pack4Arabic = pack4All.filter((s) => s.subjectId === "arabic");
    const pack4LitMath = pack4All.filter((s) => s.subjectId === "math");
    const pack5All = getAllPack5EngineeringSnvSkills();
    const pack5Eng = pack5All.filter((s) => s.subjectId !== "natural_sciences");
    const pack5MathSnv = pack5All.filter((s) => s.subjectId === "natural_sciences");

    // Deduplicate skills by id
    const dedupe = (skills: Skill[]): Skill[] => {
      const map = new Map<string, Skill>();
      for (const s of skills) {
        if (!map.has(s.id)) map.set(s.id, s);
      }
      return Array.from(map.values());
    };

    if (streamId === "sciences_exp") {
      return dedupe([
        ...PROMPT11_SKILLS,
        ...b9List,
        ...pack1Islamic,
        ...pack2Languages,
        ...pack3PhiloSci,
        ...pack4Arabic,
      ]);
    }
    if (streamId === "math") {
      const mathPhysics = PROMPT11_SKILLS.filter(
        (s) => s.subjectId === "math" || s.subjectId === "physics"
      );
      return dedupe([
        ...mathPhysics,
        ...pack5MathSnv,
        ...b9List,
        ...pack1Islamic,
        ...pack2Languages,
        ...pack3PhiloSci,
        ...pack4Arabic,
      ]);
    }
    if (streamId === "technique_math") {
      const baseMathPhysics = PROMPT11_SKILLS.filter(
        (s) => s.subjectId === "math" || s.subjectId === "physics"
      );
      return dedupe([
        ...baseMathPhysics,
        ...getAllTechniqueMathSkills(),
        ...pack5Eng,
        ...b9List,
        ...pack1Islamic,
        ...pack2Languages,
        ...pack3PhiloSci,
        ...pack4Arabic,
      ]);
    }
    if (streamId === "gestion_eco") {
      const baseGestion = Object.values(GESTION_ECO_SKILLS) as unknown as Skill[];
      return dedupe([
        ...baseGestion,
        ...b9List,
        ...pack1Islamic,
        ...pack2Languages,
        ...pack3PhiloSci,
        ...pack4Arabic,
      ]);
    }
    if (streamId === "lettres_philo") {
      const baseLettres = Object.values(LETTRES_PHILO_SKILLS) as unknown as Skill[];
      const b5 = getBatch5SkillsForStream("lettres_philo");
      return dedupe([
        ...baseLettres,
        ...b5,
        ...b9List,
        ...pack1Islamic,
        ...pack2Languages,
        ...pack4Arabic,
        ...pack4LitMath,
      ]);
    }
    if (streamId === "langues_etrangeres") {
      const base = (Object.values(LETTRES_PHILO_SKILLS) as unknown as Skill[]).filter((s) =>
        validateContentStreamCompatibility(streamId, { skillId: s.id, subjectId: s.subjectId })
      );
      const b5 = getBatch5SkillsForStream("langues_etrangeres");
      return dedupe([
        ...base,
        ...b5,
        ...b9List,
        ...pack1Islamic,
        ...pack2Languages,
        ...pack4Arabic,
        ...pack4LitMath,
      ]);
    }
    // Default fallback with strict validation
    return dedupe([...PROMPT11_SKILLS, ...b9List, ...pack1Islamic, ...pack2Languages, ...pack4Arabic]).filter((s) =>
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
    const p1List = getAllPack1IslamicSkills();
    const p2List = getAllPack2LanguageSkills();
    const p3List = getAllPack3PhilosophySkills();
    const p4List = getAllPack4ArabicLitMathSkills();
    const p5List = getAllPack5EngineeringSnvSkills();

    const all = [
      ...PROMPT11_SKILLS,
      ...gestionList,
      ...lettresList,
      ...tmList,
      ...b5List,
      ...b9List,
      ...p1List,
      ...p2List,
      ...p3List,
      ...p4List,
      ...p5List,
    ];
    const map = new Map<string, Skill>();
    for (const s of all) {
      if (!map.has(s.id)) map.set(s.id, s);
    }
    return Array.from(map.values());
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
