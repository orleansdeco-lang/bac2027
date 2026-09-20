/**
 * BAC Mastery - Master Curriculum Central Registry (الفهرس المركزي الموحد)
 * Single Source of Truth for all pedagogical curriculum units and skills across all 6 BAC streams.
 * Invariant: Content Purity (zero student_id / user_id)
 * Lookup: O(1) instantaneous access
 */

import { SkillLearningBundle } from "./bundle-builder";
import { COMMON_CURRICULUM_BUNDLES } from "./common";
import { STREAM_CURRICULUM_BUNDLES } from "./streams";
import { Skill } from "@/domain/content/types";
import { StreamId, SubjectId } from "@/types/education";

let fallbackBundleResolver: ((skillId: string) => SkillLearningBundle | null) | null = null;

export function setFallbackBundleResolver(fn: (skillId: string) => SkillLearningBundle | null) {
  fallbackBundleResolver = fn;
}

/**
 * The Master Unified Curriculum Registry
 * Pre-indexes all modules into a flat, O(1) dictionary
 */
export const MASTER_CURRICULUM_REGISTRY: Record<string, SkillLearningBundle> = {
  ...COMMON_CURRICULUM_BUNDLES,
  ...STREAM_CURRICULUM_BUNDLES,
};

/**
 * Universal O(1) Skill Learning Bundle Resolver
 */
export function getSkillLearningBundle(skillId: string): SkillLearningBundle | null {
  const existing = MASTER_CURRICULUM_REGISTRY[skillId];
  if (existing) return existing;

  if (fallbackBundleResolver) {
    const fallback = fallbackBundleResolver(skillId);
    if (fallback) {
      MASTER_CURRICULUM_REGISTRY[skillId] = fallback;
      return fallback;
    }
  }

  return null;
}

/**
 * Get all skills in the master curriculum registry
 */
export function getAllCurriculumBundleSkills(): Skill[] {
  return Object.values(MASTER_CURRICULUM_REGISTRY).map((b) => b.skill);
}

/**
 * Get all bundles for a given stream
 */
export function getCurriculumBundlesForStream(streamId: StreamId): SkillLearningBundle[] {
  return Object.values(MASTER_CURRICULUM_REGISTRY).filter((b) => {
    return b.skill.streamId === streamId || b.stream === streamId || b.stream === "common" || b.stream === "all_streams";
  });
}

/**
 * Get all bundles for a given subject
 */
export function getCurriculumBundlesForSubject(subjectId: SubjectId): SkillLearningBundle[] {
  return Object.values(MASTER_CURRICULUM_REGISTRY).filter((b) => {
    return b.skill.subjectId === subjectId || b.subject === subjectId;
  });
}
