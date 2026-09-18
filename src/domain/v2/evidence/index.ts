/**
 * BAC Mastery V2 — Canonical Evidence Contracts
 * 
 * INVARIANT:
 * ATTEMPT ≠ EVIDENCE.
 * Prohibits scalar collapse: No single formula (score * confidence * speed * decay)
 * is allowed to destroy the multi-dimensional evidence vectors.
 */

import { AttemptId, EvidenceId, QuestionId, SkillId, StudentId, MissionId } from "../ids";
import { SubjectId, StreamId } from "@/types/education";
import { CanonicalErrorType } from "../errors";

export type PracticeTier =
  | "guided"           // Step-by-step with active hints
  | "semi_guided"      // Hints on demand, single concept
  | "independent"      // Strict timer, zero hints, authentic options
  | "mixed"            // Multi-concept interleaved problem
  | "transfer"         // Novel framing or cross-topic application
  | "bac_exam_level";  // Authentic past Algerian BAC question

export type EvidenceStrength = "weak" | "moderate" | "strong" | "definitive";

export type EvidenceSource =
  | "diagnostic"
  | "practice"
  | "repair"
  | "retest"
  | "spaced_review"
  | "exam_simulation";

export type ConfidenceAlignment = "well_calibrated" | "overconfident" | "underconfident";

/**
 * Raw Attempt: Unprocessed empirical observation of a student action.
 * Telemetry substrate.
 */
export interface RawAttempt {
  id: AttemptId;
  studentId: StudentId;
  questionId: QuestionId;
  skillId: SkillId;
  subjectId: SubjectId;
  streamId: StreamId;
  missionId?: MissionId;
  selectedAnswer: string;
  isCorrect: boolean;
  confidenceRating: 1 | 2 | 3 | 4 | 5;
  timeSpentSeconds: number;
  expectedTimeSeconds: number;
  hintsUsedCount: number;
  practiceTier: PracticeTier;
  timestamp: string;
}

/**
 * Multi-dimensional Evidence Vectors: Preserved without scalar reduction.
 */
export interface MultiDimensionalEvidenceVectors {
  correctness: boolean;
  confidence: 1 | 2 | 3 | 4 | 5;
  responseSpeedRatio: number; // actual / expected
  hintsUsedCount: number;
  practiceTier: PracticeTier;
  confidenceAlignment: ConfidenceAlignment;
  evidenceStrength: EvidenceStrength;
}

/**
 * Cognitive Evidence: Methodology-aware pedagogical fact derived from raw attempt.
 */
export interface CognitiveEvidence {
  id: EvidenceId;
  attemptId: AttemptId;
  skillId: SkillId;
  subjectId: SubjectId;
  source: EvidenceSource;
  isDemonstratedSuccess: boolean;
  vectors: MultiDimensionalEvidenceVectors;
  observedErrorType?: CanonicalErrorType;
  isRecurringLapse: boolean;
  derivedAt: string;
}

/**
 * Non-scalar validation assertion.
 * Ensures caller is not passing a flattened scalar number in place of multi-dimensional evidence.
 */
export function assertNonScalarEvidence(evidence: unknown): asserts evidence is CognitiveEvidence {
  if (!evidence || typeof evidence !== "object") {
    throw new Error("[DomainV2:Evidence] Evidence must be a structured CognitiveEvidence object, not a primitive value.");
  }
  const rec = evidence as Partial<CognitiveEvidence>;
  if (!rec.id || !rec.vectors || typeof rec.vectors !== "object") {
    throw new Error("[DomainV2:Evidence] CognitiveEvidence missing required multi-dimensional vectors.");
  }
  if (typeof (rec as any).score === "number" && Object.keys(rec.vectors).length === 0) {
    throw new Error("[DomainV2:Evidence] Forbidden scalar reduction detected: evidence flattened to single score.");
  }
}
