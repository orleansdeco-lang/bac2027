/**
 * BAC Mastery — Pure Adaptive Spaced Review Engine
 * Prompt 18.1: Memory Engine & Evidence-Based Retention Scheduling
 * 
 * Rules:
 * - Pure and deterministic: same input -> same output.
 * - No hardcoded rigid Day 1/3/7/14/30 law; intervals are evidence-calibrated.
 * - Review is not only for memorization; applies to mathematical methods and scientific reasoning.
 */

import { ReviewParameters, SpacedReviewSchedule, ReviewUrgency } from "./types";
import { SubjectId } from "@/types/education";

/**
 * Baseline heuristic interval seed in days
 */
export const INITIAL_INTERVAL_DAYS = 1.0;

/**
 * Calculates the next adaptive spaced review interval based on student performance evidence.
 */
export function calculateNextReviewInterval(
  currentSchedule: SpacedReviewSchedule | null,
  params: ReviewParameters
): {
  intervalDays: number;
  decayRate: number;
  consecutiveSuccesses: number;
  lapseCount: number;
} {
  const previousInterval = currentSchedule?.intervalDays ?? INITIAL_INTERVAL_DAYS;
  const previousLapses = currentSchedule?.lapseCount ?? 0;
  const previousSuccesses = currentSchedule?.consecutiveSuccesses ?? 0;
  const previousDecay = currentSchedule?.decayRate ?? 1.0;

  // 1. Failure / Incorrect Response: Immediate collapse to 1 day for repair & retest
  if (!params.correctness) {
    const newLapseCount = previousLapses + 1;
    // Accelerated decay penalty for recurring errors
    const decayMultiplier = params.isRecurring ? 1.4 : 1.2;
    const newDecay = Math.min(previousDecay * decayMultiplier, 2.5);

    return {
      intervalDays: 1.0,
      decayRate: newDecay,
      consecutiveSuccesses: 0,
      lapseCount: newLapseCount,
    };
  }

  // 2. Correct Response: Modulate growth factor by confidence and retrieval fluency
  let growthFactor = 2.0;

  // Confidence modulation: Low confidence signals fragile retrieval
  if (params.confidence <= 2) {
    growthFactor = 1.2; // Modest step, don't jump too far
  } else if (params.confidence === 3) {
    growthFactor = 1.5;
  } else if (params.confidence >= 4) {
    growthFactor = 2.2;
  }

  // Speed modulation: Very slow response signals high cognitive struggle
  if (params.expectedTimeSeconds > 0 && params.responseTimeSeconds > 0) {
    const timeRatio = params.responseTimeSeconds / params.expectedTimeSeconds;
    if (timeRatio > 2.0) {
      growthFactor *= 0.8; // Struggled to retrieve
    } else if (timeRatio < 0.6 && params.confidence >= 4) {
      growthFactor *= 1.15; // Fluent, effortless retrieval
    }
  }

  // Lapse penalty: Chronic past lapses limit maximum interval expansion
  if (previousLapses > 0) {
    const lapsePenalty = Math.max(0.6, 1.0 - previousLapses * 0.1);
    growthFactor *= lapsePenalty;
  }

  // Decay adjustment
  const newDecay = Math.max(0.7, previousDecay * 0.95); // Stabilizes with success
  const newInterval = Math.max(1.0, Math.round(previousInterval * (growthFactor / newDecay) * 10) / 10);
  const newSuccesses = previousSuccesses + 1;

  return {
    intervalDays: newInterval,
    decayRate: newDecay,
    consecutiveSuccesses: newSuccesses,
    lapseCount: previousLapses,
  };
}

/**
 * Determines current review urgency and whether review is due.
 */
export function evaluateReviewUrgency(
  schedule: SpacedReviewSchedule,
  currentDate: Date = new Date()
): {
  isDue: boolean;
  urgency: ReviewUrgency;
  overdueDays: number;
} {
  const lastTested = new Date(schedule.lastTestedAt);
  const nextDue = new Date(schedule.nextReviewDueAt);
  const diffMs = currentDate.getTime() - nextDue.getTime();
  const overdueDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs < 0) {
    return {
      isDue: false,
      urgency: "fresh",
      overdueDays: 0,
    };
  }

  if (overdueDays === 0) {
    return {
      isDue: true,
      urgency: "due",
      overdueDays: 0,
    };
  }

  if (overdueDays <= 3) {
    return {
      isDue: true,
      urgency: "overdue",
      overdueDays,
    };
  }

  return {
    isDue: true,
    urgency: "critical",
    overdueDays,
  };
}

/**
 * Creates an initial schedule for a newly demonstrated skill.
 */
export function createInitialReviewSchedule(
  skillId: string,
  subjectId: SubjectId,
  testDate: Date = new Date(),
  initialConfidence: 1 | 2 | 3 | 4 | 5 = 4
): SpacedReviewSchedule {
  const intervalDays = initialConfidence >= 4 ? 2.0 : 1.0;
  const nextDueDate = new Date(testDate.getTime() + intervalDays * 24 * 60 * 60 * 1000);

  return {
    skillId,
    subjectId,
    intervalDays,
    lastTestedAt: testDate.toISOString(),
    nextReviewDueAt: nextDueDate.toISOString(),
    urgency: "fresh",
    consecutiveSuccesses: 1,
    lapseCount: 0,
    decayRate: 1.0,
  };
}
