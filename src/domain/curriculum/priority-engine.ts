/**
 * BAC Mastery V1 — Deterministic Content Production Priority Engine
 * Prompt 20 Section 12: Production Priority & Complete Vertical Slice Focus
 * 
 * Production Philosophy:
 * QUALITY > COVERAGE > SPEED
 * 1 complete skill loop (Lesson -> Practice -> Error -> Repair -> Retest -> Mastery)
 * is worth exponentially more than 10 disconnected, unverified lessons.
 */

import { CoverageSkillItem, CurriculumVerificationStatus } from "./types";

export interface ProductionPriorityFactors {
  officialVerificationWeight: number; // 0 to 25 pts
  examRelevanceWeight: number;        // 0 to 25 pts (core coefficient / frequent BAC exam appearances)
  prerequisiteCentrality: number;     // 0 to 20 pts (blocks other key skills if missing)
  studentCognitiveDifficulty: number; // 0 to 15 pts (high historical error rates / stumbling blocks)
  loopCompletenessFeasibility: number;// 0 to 15 pts (availability of worked examples, retest twins)
}

/**
 * Calculates a deterministic 0-100 priority score for authoring a skill
 */
export function computeProductionPriorityScore(
  item: CoverageSkillItem,
  customFactors?: Partial<ProductionPriorityFactors>
): number {
  // 1. Official Verification Status Factor (0 to 25)
  let verifScore = 10;
  if (item.verificationStatus === "OFFICIAL_CURRENT") verifScore = 25;
  else if (item.verificationStatus === "OFFICIAL_HISTORICAL") verifScore = 22;
  else if (item.verificationStatus === "RESEARCH_SUPPORTED") verifScore = 18;
  else if (item.verificationStatus === "PROVISIONAL") verifScore = 12;

  // 2. Exam Relevance & Core Subject Status (0 to 25)
  let examScore = 15;
  if (["math", "physics", "natural_sciences", "accounting_finance", "philosophy"].includes(item.subjectId)) {
    examScore = 24; // Core defining subject
  } else if (["civil_eng", "mechanical_eng", "electrical_eng", "process_eng"].includes(item.subjectId)) {
    examScore = 25; // Distinctive branch specialty (coef 7)
  }

  // 3. Bloom Level / Prerequisite Centrality (0 to 20)
  let centralityScore = 12;
  if (item.bloomLevel === "apply" || item.bloomLevel === "analyze") centralityScore = 18;
  else if (item.bloomLevel === "evaluate") centralityScore = 20;

  // 4. Cognitive Difficulty / Error Propensity (0 to 15)
  const difficultyScore = 12;

  // 5. Vertical Slice Completeness Bonus (0 to 15)
  let sliceScore = 5;
  if (item.hasLesson && item.hasPractice && item.hasRetest && item.hasRepair) {
    sliceScore = 15; // Complete vertical slice ready
  } else if (item.status === "PLANNED") {
    sliceScore = 10;
  }

  const factors: ProductionPriorityFactors = {
    officialVerificationWeight: verifScore,
    examRelevanceWeight: examScore,
    prerequisiteCentrality: centralityScore,
    studentCognitiveDifficulty: difficultyScore,
    loopCompletenessFeasibility: sliceScore,
    ...customFactors,
  };

  const total =
    factors.officialVerificationWeight +
    factors.examRelevanceWeight +
    factors.prerequisiteCentrality +
    factors.studentCognitiveDifficulty +
    factors.loopCompletenessFeasibility;

  return Math.min(100, Math.max(0, total));
}

/**
 * Ranks curriculum items in descending order of production priority
 */
export function rankSkillsForProduction(items: CoverageSkillItem[]): CoverageSkillItem[] {
  return [...items].sort((a, b) => {
    // Skills needing completion are ordered by priority score
    const scoreA = computeProductionPriorityScore(a);
    const scoreB = computeProductionPriorityScore(b);
    return scoreB - scoreA;
  });
}
