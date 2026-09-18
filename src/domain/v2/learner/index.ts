/**
 * BAC Mastery V2 — Canonical Learner State Contracts
 * 
 * INVARIANT:
 * Authoritative Mastery States: not_yet, emerging, demonstrated, review_due.
 * Continuous numeric values MUST NOT define mastery.
 * UI/Client state can NEVER directly mutate authoritative state.
 */

import { SkillId, StudentId } from "../ids";
import { SubjectId, StreamId, TechniqueMathSpecialty } from "@/types/education";
import { CanonicalErrorType, ErrorEvent } from "../errors";

// --- Authoritative 4-State Mastery ---

export const CANONICAL_MASTERY_STATES = [
  "not_yet",
  "emerging",
  "demonstrated",
  "review_due",
] as const;

export type CanonicalMasteryStatus = (typeof CANONICAL_MASTERY_STATES)[number];

export function isCanonicalMasteryStatus(val: unknown): val is CanonicalMasteryStatus {
  return typeof val === "string" && (CANONICAL_MASTERY_STATES as readonly string[]).includes(val);
}

export function assertValidMasteryStatus(val: unknown): asserts val is CanonicalMasteryStatus {
  if (typeof val === "number") {
    throw new Error(`[DomainV2:Mastery] Numeric value (${val}) rejected. Continuous numbers are secondary telemetry and MUST NOT be used as authoritative mastery states.`);
  }
  if (!isCanonicalMasteryStatus(val)) {
    throw new Error(`[DomainV2:Mastery] Invalid mastery state: "${val}". Expected one of: ${CANONICAL_MASTERY_STATES.join(", ")}`);
  }
}

export interface LearnerSkillState {
  skillId: SkillId;
  subjectId: SubjectId;
  masteryStatus: CanonicalMasteryStatus;
  consecutiveSuccesses: number;
  totalAttempts: number;
  lastTestedAt?: string;
  lastSuccessAt?: string;
  lastLapseAt?: string;
  nextReviewDueAt?: string;
  isOverdueForReview: boolean;
  // Secondary telemetry signals (NOT mastery definitions):
  internalLatencyRatio?: number;
  confidenceAlignment?: "well_calibrated" | "overconfident" | "underconfident";
}

export interface LearnerState {
  studentId: StudentId;
  streamId: StreamId;
  techniqueMathSpecialty?: TechniqueMathSpecialty;
  targetScore: number;
  baselineScore?: number;
  skills: Record<string, LearnerSkillState>;
  activeErrors: ErrorEvent[];
  masteredSkillIds: SkillId[];
  emergingSkillIds: SkillId[];
  needsMoreWorkSkillIds: SkillId[];
  reviewDueSkillIds: SkillId[];
  lastActiveAt: string;
  calibrationIndex?: number;
}

/**
 * State Authority Boundary Assertion
 * UI/Client components cannot claim authority to mutate state.
 */
export function assertAuthoritativeStateBoundary(source: string): void {
  const forbiddenSources = ["react_component", "local_storage_direct", "ui_client", "ai_assistant"];
  if (forbiddenSources.includes(source)) {
    throw new Error(`[DomainV2:StateAuthority] Mutation denied: Source "${source}" has zero authority to mutate authoritative learner state.`);
  }
}
