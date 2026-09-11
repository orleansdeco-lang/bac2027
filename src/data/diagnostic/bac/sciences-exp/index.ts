import { DiagnosticQuestion } from "../../../../types/diagnostic";
import { MATHEMATICS_DIAGNOSTIC_QUESTIONS } from "./mathematics";
import { PHYSICS_DIAGNOSTIC_QUESTIONS } from "./physics";
import { NATURAL_SCIENCES_DIAGNOSTIC_QUESTIONS } from "./natural-sciences";

export {
  MATHEMATICS_DIAGNOSTIC_QUESTIONS,
  PHYSICS_DIAGNOSTIC_QUESTIONS,
  NATURAL_SCIENCES_DIAGNOSTIC_QUESTIONS,
};

export const SCIENCES_EXP_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  ...MATHEMATICS_DIAGNOSTIC_QUESTIONS,
  ...PHYSICS_DIAGNOSTIC_QUESTIONS,
  ...NATURAL_SCIENCES_DIAGNOSTIC_QUESTIONS,
];

export function getSciencesExpQuestions(): DiagnosticQuestion[] {
  return [...SCIENCES_EXP_DIAGNOSTIC_QUESTIONS];
}
