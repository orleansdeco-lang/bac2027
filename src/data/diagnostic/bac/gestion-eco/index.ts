import { DiagnosticQuestion } from "../../../../types/diagnostic";
import { ACCOUNTING_DIAGNOSTIC_QUESTIONS } from "./accounting";
import { ECONOMICS_DIAGNOSTIC_QUESTIONS } from "./economics";
import { LAW_DIAGNOSTIC_QUESTIONS } from "./law";
import { MATHEMATICS_DIAGNOSTIC_QUESTIONS } from "./mathematics";

export {
  ACCOUNTING_DIAGNOSTIC_QUESTIONS,
  ECONOMICS_DIAGNOSTIC_QUESTIONS,
  LAW_DIAGNOSTIC_QUESTIONS,
  MATHEMATICS_DIAGNOSTIC_QUESTIONS,
};

export const GESTION_ECO_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  ...ACCOUNTING_DIAGNOSTIC_QUESTIONS,
  ...ECONOMICS_DIAGNOSTIC_QUESTIONS,
  ...LAW_DIAGNOSTIC_QUESTIONS,
  ...MATHEMATICS_DIAGNOSTIC_QUESTIONS,
];

export function getGestionEcoQuestions(): DiagnosticQuestion[] {
  return [...GESTION_ECO_DIAGNOSTIC_QUESTIONS];
}
