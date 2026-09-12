import { StreamId } from "../../types/education";
import { DiagnosticQuestion } from "../../types/diagnostic";
import { SCIENCES_EXP_DIAGNOSTIC_QUESTIONS } from "../../data/diagnostic/bac/sciences-exp";
import { GESTION_ECO_DIAGNOSTIC_QUESTIONS } from "../../data/diagnostic/bac/gestion-eco";

/**
 * Returns the diagnostic question pack for a specified stream.
 * For Sciences Expérimentales, returns the full 15-question pilot pack (5 Math, 5 Physics, 5 Sciences).
 * For Gestion & Économie, returns the full 15-question pilot pack (4 Accounting, 4 Economics, 3 Law, 4 Math).
 * For other streams, returns an empty pack or fallback placeholder questions until their packs are authored.
 */
export function getDiagnosticQuestionsForStream(streamId: StreamId): DiagnosticQuestion[] {
  switch (streamId) {
    case "sciences_exp":
      return [...SCIENCES_EXP_DIAGNOSTIC_QUESTIONS];

    case "gestion_eco":
      return [...GESTION_ECO_DIAGNOSTIC_QUESTIONS];

    // Other streams can be expanded in subsequent packs
    case "math":
    case "technique_math":
    case "lettres_philo":
    case "langues_etrangeres":
    default:
      // In the V1 pilot, return sciences_exp questions as the prototype benchmark
      return [...SCIENCES_EXP_DIAGNOSTIC_QUESTIONS];
  }
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
