/**
 * BAC Mastery — Interactive Exercise Data Contracts & Types
 * 
 * Supports authentic Algerian Baccalaureate exam formats:
 * 1. Accounting Journal (Journal de l'exercice - Système Comptable Financier SCF)
 * 2. Methodological Step-by-Step Resolution (Étapes méthodologiques progressives)
 * 3. Classical MCQ & Multiselect
 */

export type ExerciseType = "mcq" | "journal_entry" | "step_by_step";

// ============================================================================
// 1. ACCOUNTING JOURNAL TYPES (نظام المحاسبة المالية الجزائري SCF)
// ============================================================================

export interface JournalAccountRow {
  id: string;
  code: string;
  name_ar: string;
  name_fr?: string;
  amount: number | "";
}

export interface JournalEntryPayload {
  date?: string;
  debitRows: JournalAccountRow[];
  creditRows: JournalAccountRow[];
  label_ar: string;
}

export interface ExpectedJournalAccount {
  code: string;
  name_ar?: string;
  amount: number;
  tolerance?: number;
  /** Allowable alternative sub-account codes (e.g. 2818 vs 28182) */
  alternativeCodes?: string[];
}

export interface JournalEntrySolution {
  expectedDebits: ExpectedJournalAccount[];
  expectedCredits: ExpectedJournalAccount[];
  expectedDate?: string;
  expectedLabel_ar?: string;
  pedagogicalExplanation_ar: string;
  pedagogicalExplanation_fr?: string;
  commonMistakes?: Array<{
    triggerCodes: string[];
    feedback_ar: string;
    feedback_fr?: string;
  }>;
}

export interface JournalValidationError {
  field: "balance" | "debit_code" | "credit_code" | "amount" | "label" | "empty";
  message_ar: string;
  message_fr?: string;
  hint_ar?: string;
}

export interface JournalValidationResult {
  isValid: boolean;
  isBalanced: boolean;
  totalDebit: number;
  totalCredit: number;
  imbalanceAmount: number;
  errors: JournalValidationError[];
  feedback_ar?: string;
  feedback_fr?: string;
}

// ============================================================================
// 2. METHODOLOGICAL STEP-BY-STEP RESOLUTION TYPES
// ============================================================================

export type StepInputType = "number" | "text" | "formula";

export interface MethodologicalStep {
  stepIndex: number;
  title_ar: string;
  title_fr?: string;
  prompt_ar: string;
  prompt_fr?: string;
  expectedInputType: StepInputType;
  expectedValue: string | number;
  /** Acceptable margin for numeric answers (e.g., 0.05 for 20% or 0.2) */
  tolerance?: number;
  /** Unit indicator (e.g., "دج", "%", "سنوات", "أشهر") */
  unit_ar?: string;
  unit_fr?: string;
  hint_ar: string;
  hint_fr?: string;
  mistakeFeedback_ar: string;
  mistakeFeedback_fr?: string;
  pedagogicalTip_ar?: string;
}

export interface StepValidationResult {
  isCorrect: boolean;
  userValue: string | number;
  feedback_ar: string;
  feedback_fr?: string;
  hint_ar?: string;
}

export interface StepByStepSolution {
  steps: MethodologicalStep[];
  finalConclusion_ar: string;
  finalConclusion_fr?: string;
}

// ============================================================================
// 3. UNIFIED INTERACTIVE QUESTION CONTRACT
// ============================================================================

export interface InteractiveQuestionConfig {
  exerciseType: ExerciseType;
  journalSolution?: JournalEntrySolution;
  stepSolution?: StepByStepSolution;
}
