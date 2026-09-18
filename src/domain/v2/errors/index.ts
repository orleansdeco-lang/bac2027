/**
 * BAC Mastery V2 — Canonical Error & Retest Contracts
 * 
 * INVARIANT:
 * Exactly 10 canonical error taxonomy types.
 * Hard limit of 2 repair cycles before transitioning to needs_more_work / delayed_recovery.
 */

import { ErrorEventId, EvidenceId, SkillId, QuestionId, RetestId } from "../ids";
import { SubjectId } from "@/types/education";

// --- Exactly 10 Canonical Error Taxonomy Types ---

export const CANONICAL_ERROR_TAXONOMY = [
  "forgot_information",
  "misunderstood_concept",
  "methodology_error",
  "calculation_error",
  "misread_question",
  "rushed",
  "lack_of_practice",
  "time_management",
  "attention_error",
  "unknown",
] as const;

export type CanonicalErrorType = (typeof CANONICAL_ERROR_TAXONOMY)[number];

export function isCanonicalErrorType(val: unknown): val is CanonicalErrorType {
  return typeof val === "string" && (CANONICAL_ERROR_TAXONOMY as readonly string[]).includes(val);
}

export function assertValidErrorType(val: unknown): asserts val is CanonicalErrorType {
  if (!isCanonicalErrorType(val)) {
    throw new Error(`[DomainV2:ErrorTaxonomy] Invalid error taxonomy type: "${val}". Expected one of: ${CANONICAL_ERROR_TAXONOMY.join(", ")}`);
  }
}

export type ErrorRepairStatus =
  | "identified"
  | "repair_started"
  | "repair_completed"
  | "retest_passed"
  | "retest_failed";

export const MAX_ALLOWED_REPAIR_CYCLES = 2;

export interface ErrorEvent {
  id: ErrorEventId;
  evidenceId: EvidenceId;
  skillId: SkillId;
  subjectId: SubjectId;
  questionId: QuestionId;
  errorType: CanonicalErrorType;
  isRecurring: boolean;
  cycleCount: number;
  status: ErrorRepairStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ErrorRepairProtocol {
  skillId: SkillId;
  errorType: CanonicalErrorType;
  title_ar: string;
  title_fr: string;
  targetMisconception_ar: string;
  targetMisconception_fr: string;
  steps_ar: string[];
  steps_fr: string[];
  microDrillQuestionId?: QuestionId;
  estimatedMinutes: number; // 5 to 15 max
}

export interface RetestTwinContract {
  id: RetestId;
  originalErrorEventId: ErrorEventId;
  parentQuestionId: QuestionId;
  twinQuestionId: QuestionId;
  skillId: SkillId;
  subjectId: SubjectId;
  isIsomorphicTwin: true;     // Must test identical concept with altered surface values
  isIndependentPath: true;    // Student must construct solution from scratch without hints
  cycleNumber: number;        // 1 or 2
  maxAllowedCycles: 2;        // Strictly frozen to 2
}
