/**
 * BAC Mastery 2.0 — Layer 1: Evidence Contract
 * 
 * INVARIANT:
 * Zero React/Next.js dependencies. Pure epistemic evidence representation.
 * Separates raw student attempts from derived cognitive evidence.
 */

import { SubjectId, StreamId } from "@/types/education";
import { SuspectedErrorType } from "@/types/mission";

export type EvidenceStrength = "weak" | "moderate" | "strong" | "definitive";

export type PracticeTier =
  | "guided"           // Step-by-step with active hints
  | "semi_guided"      // Hints on demand, single concept
  | "independent"      // Strict timer, zero hints, authentic options
  | "mixed"            // Multi-concept interleaved problem
  | "transfer"         // Novel framing or cross-topic application
  | "bac_exam_level";  // Authentic past Algerian BAC question

/**
 * Raw Attempt: Unprocessed empirical observation of a student action.
 */
export interface RawAttemptRecord {
  id: string;
  userId?: string;
  questionId: string;
  skillId: string;
  subjectId: SubjectId;
  streamId: StreamId;
  selectedAnswer: string;
  isCorrect: boolean;
  confidenceRating: 1 | 2 | 3 | 4 | 5;
  responseTimeSeconds: number;
  expectedTimeSeconds: number;
  practiceTier: PracticeTier;
  suspectedErrorType?: SuspectedErrorType;
  timestamp: string;
}

/**
 * Cognitive Evidence: Normalized pedagogical fact derived from raw attempts.
 */
export interface CognitiveEvidenceRecord {
  id: string;
  skillId: string;
  subjectId: SubjectId;
  evidenceSource: "diagnostic" | "practice" | "repair" | "retest" | "spaced_review" | "exam_simulation";
  isDemonstratedSuccess: boolean;
  confidenceAlignment: "well_calibrated" | "overconfident" | "underconfident";
  evidenceStrength: EvidenceStrength;
  errorTypeObserved?: SuspectedErrorType;
  isRecurringLapse: boolean;
  derivedAt: string;
}
