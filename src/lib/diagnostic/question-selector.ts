import { StreamId, SubjectId } from "../../types/education";
import { DiagnosticQuestion } from "../../types/diagnostic";
import {
  SCIENCES_EXP_DIAGNOSTIC_QUESTIONS,
  MATHEMATICS_DIAGNOSTIC_QUESTIONS,
  PHYSICS_DIAGNOSTIC_QUESTIONS,
  NATURAL_SCIENCES_DIAGNOSTIC_QUESTIONS,
} from "../../data/diagnostic/bac/sciences-exp";
import {
  GESTION_ECO_DIAGNOSTIC_QUESTIONS,
  ACCOUNTING_DIAGNOSTIC_QUESTIONS,
  ECONOMICS_DIAGNOSTIC_QUESTIONS,
  LAW_DIAGNOSTIC_QUESTIONS,
  MATHEMATICS_DIAGNOSTIC_QUESTIONS as GESTION_ECO_MATHEMATICS_DIAGNOSTIC_QUESTIONS,
} from "../../data/diagnostic/bac/gestion-eco";
import {
  LETTRES_PHILO_DIAGNOSTIC_QUESTIONS,
  PHILOSOPHY_DIAGNOSTIC_QUESTIONS,
  ARABIC_DIAGNOSTIC_QUESTIONS,
} from "../../data/diagnostic/bac/lettres-philo";

/**
 * Isolated Math stream diagnostic pack: 5 Math + 5 Physics (10 questions total)
 * Invariant: ZERO biology / natural_sciences questions for Math stream.
 */
export const MATH_STREAM_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  ...MATHEMATICS_DIAGNOSTIC_QUESTIONS,
  ...PHYSICS_DIAGNOSTIC_QUESTIONS,
];

/**
 * Returns the diagnostic question pack for a specific subject within a stream.
 */
export function getDiagnosticQuestionsForSubject(
  subjectId: SubjectId | string,
  streamId?: StreamId
): DiagnosticQuestion[] {
  switch (subjectId) {
    case "math":
    case "mathematics":
      if (streamId === "gestion_eco") {
        return [...GESTION_ECO_MATHEMATICS_DIAGNOSTIC_QUESTIONS];
      }
      return [...MATHEMATICS_DIAGNOSTIC_QUESTIONS];

    case "physics":
      return [...PHYSICS_DIAGNOSTIC_QUESTIONS];

    case "natural_sciences":
    case "science":
      return [...NATURAL_SCIENCES_DIAGNOSTIC_QUESTIONS];

    case "accounting_finance":
    case "accounting":
      return [...ACCOUNTING_DIAGNOSTIC_QUESTIONS];

    case "economics_management":
    case "economics":
      return [...ECONOMICS_DIAGNOSTIC_QUESTIONS];

    case "law":
      return [...LAW_DIAGNOSTIC_QUESTIONS];

    case "philosophy":
      return [...PHILOSOPHY_DIAGNOSTIC_QUESTIONS];

    case "arabic":
      return [...ARABIC_DIAGNOSTIC_QUESTIONS];

    default:
      return [];
  }
}

/**
 * Returns the diagnostic question pack for a specified stream.
 * For Sciences Expérimentales, returns the full 15-question pilot pack (5 Math, 5 Physics, 5 Sciences).
 * For Gestion & Économie, returns the full 15-question pilot pack (4 Accounting, 4 Economics, 3 Law, 4 Math).
 * For Math, returns the 10-question isolated pack (5 Math, 5 Physics) with zero biology.
 * For Lettres & Philo, returns the 5-question pack (3 Philo, 2 Arabic).
 */
export function getDiagnosticQuestionsForStream(streamId: StreamId): DiagnosticQuestion[] {
  switch (streamId) {
    case "sciences_exp":
      return [...SCIENCES_EXP_DIAGNOSTIC_QUESTIONS];

    case "gestion_eco":
      return [...GESTION_ECO_DIAGNOSTIC_QUESTIONS];

    case "math":
    case "technique_math":
      return [...MATH_STREAM_DIAGNOSTIC_QUESTIONS];

    case "lettres_philo":
    case "langues_etrangeres":
      return [...LETTRES_PHILO_DIAGNOSTIC_QUESTIONS];

    default:
      return [];
  }
}

export const selectDiagnosticQuestions = getDiagnosticQuestionsForStream;

/**
 * Checks whether diagnostic assessment questions are available for the given stream.
 */
export function isStreamDiagnosticAvailable(streamId: StreamId): boolean {
  return getDiagnosticQuestionsForStream(streamId).length > 0;
}

/**
 * Validates that a question pack meets the 4 cognitive core dimensions
 */
export function validateQuestionPackCompleteness(questions: DiagnosticQuestion[]): boolean {
  if (!questions || questions.length === 0) return false;

  const requiredDimensions = ["knowledge", "understanding", "application", "methodology"];
  const presentDimensions = new Set(questions.map((q) => q.dimension));

  return requiredDimensions.every((dim) => presentDimensions.has(dim as any));
}
