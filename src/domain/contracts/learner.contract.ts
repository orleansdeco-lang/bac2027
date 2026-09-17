/**
 * BAC Mastery 2.0 — Layer 1: Learner Contract
 * 
 * INVARIANT:
 * Pure model of the student's true cognitive state derived from evidence.
 * Zero UI coupling, zero guesswork.
 */

import { SubjectId, StreamId, TechniqueMathSpecialty } from "@/types/education";
import { SuspectedErrorType } from "@/types/mission";

export type LearnerMasteryStatus = "not_yet" | "emerging" | "demonstrated" | "review_due";

export interface LearnerSkillState {
  skillId: string;
  subjectId: SubjectId;
  masteryStatus: LearnerMasteryStatus;
  consecutiveSuccesses: number;
  totalAttempts: number;
  lastTestedAt?: string;
  lastSuccessAt?: string;
  lastLapseAt?: string;
  nextReviewDueAt?: string;
  isOverdueForReview: boolean;
}

export interface ActiveErrorState {
  id: string;
  skillId: string;
  subjectId: SubjectId;
  questionId: string;
  suspectedErrorType: SuspectedErrorType;
  repairStatus: "identified" | "repair_started" | "repair_completed" | "retest_passed" | "retest_failed";
  isRecurring: boolean;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LearnerState {
  userId: string;
  streamId: StreamId;
  techniqueMathSpecialty?: TechniqueMathSpecialty;
  targetScore: number;
  baselineScore?: number;
  skills: Record<string, LearnerSkillState>;
  activeErrors: ActiveErrorState[];
  masteredSkillIds: string[];
  emergingSkillIds: string[];
  needsMoreWorkSkillIds: string[];
  reviewDueSkillIds: string[];
  lastActiveAt: string;
  calibrationIndex?: number;
}
