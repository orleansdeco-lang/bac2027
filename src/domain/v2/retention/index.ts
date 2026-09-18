/**
 * BAC Mastery V2 — Canonical Retention Contracts
 * 
 * INVARIANT:
 * Built on the 6 Frozen Evidence Vectors:
 * 1. Correctness
 * 2. Confidence
 * 3. Response Speed Ratio
 * 4. Lapse History
 * 5. Decay Factor
 * 6. Days Elapsed
 * 
 * The mathematical scheduling algorithm remains INTENTIONALLY UN-FROZEN
 * behind a clean replaceable RetentionScheduler interface.
 * Zero hardcoded SM-2 in the authoritative domain model.
 */

import { SkillId, RetentionScheduleId } from "../ids";
import { SubjectId } from "@/types/education";

export type ReviewUrgency = "fresh" | "due" | "overdue" | "critical";

/**
 * The 6 Frozen Retention Evidence Vectors
 */
export interface RetentionEvidenceVectors {
  correctness: boolean;
  confidence: 1 | 2 | 3 | 4 | 5;
  responseSpeedRatio: number; // t_actual / t_expected
  lapseHistory: number;       // count of prior lapses (L)
  decayFactor: number;        // memory stability decay factor (delta)
  daysElapsed: number;        // days since previous review
}

export interface RetentionSchedule {
  id: RetentionScheduleId;
  skillId: SkillId;
  subjectId: SubjectId;
  intervalDays: number;
  lastTestedAt: string;
  nextReviewDueAt: string;
  urgency: ReviewUrgency;
  consecutiveSuccesses: number;
  lapseCount: number;
  decayRate: number;
}

/**
 * Replaceable Retention Scheduler Interface
 * Ensures scheduling algorithm (SM-2, FSRS, Ebbinghaus) can be swapped without changing domain model.
 */
export interface RetentionScheduler {
  readonly name: string;
  readonly version: string;
  evaluateUrgency(schedule: RetentionSchedule, referenceDate?: Date): { urgency: ReviewUrgency; isDue: boolean; overdueDays: number };
  updateSchedule(current: RetentionSchedule, evidence: RetentionEvidenceVectors): RetentionSchedule;
}
