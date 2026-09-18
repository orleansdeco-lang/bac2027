/**
 * BAC Mastery V2 — Canonical Assessment Contracts
 * 
 * INVARIANT:
 * Questions are assessment instruments; they generate evidence, but are NOT evidence itself.
 * Full support for 6 Diagnostic Layers (L0–L5) and official Algerian BAC Rubrics.
 */

import { QuestionId, RubricId, SkillId, ExamSessionId, ExamAttemptId, StudentId } from "../ids";
import { SubjectId, StreamId, ExamType } from "@/types/education";
import { DiagnosticDimension } from "@/types/diagnostic";

// --- 6 Canonical Diagnostic Layers ---

export const DIAGNOSTIC_LAYERS = ["L0", "L1", "L2", "L3", "L4", "L5"] as const;
export type DiagnosticLayer = (typeof DIAGNOSTIC_LAYERS)[number];

export interface DiagnosticLayerDefinition {
  layer: DiagnosticLayer;
  name_en: string;
  name_ar: string;
  purpose: string;
}

export const DIAGNOSTIC_LAYER_METADATA: Record<DiagnosticLayer, DiagnosticLayerDefinition> = {
  L0: {
    layer: "L0",
    name_en: "Routing Layer",
    name_ar: "طبقة التوجيه",
    purpose: "Stream, level, language, target grade, daily study budget routing.",
  },
  L1: {
    layer: "L1",
    name_en: "Broad Screening Layer",
    name_ar: "طبقة المسح الأولي",
    purpose: "Coarse syllabus breadth across core units to detect macro gaps.",
  },
  L2: {
    layer: "L2",
    name_en: "Skill Diagnosis Layer",
    name_ar: "طبقة تشخيص الكفاءات",
    purpose: "Precision testing of specific observable competencies.",
  },
  L3: {
    layer: "L3",
    name_en: "Bottleneck / Prerequisite Probe Layer",
    name_ar: "طبقة سبر المتطلبات القبلية",
    purpose: "Traverses prerequisite DAG downward to isolate root misconception.",
  },
  L4: {
    layer: "L4",
    name_en: "Confidence & Methodology Calibration Layer",
    name_ar: "طبقة المعايرة المنهجية والميتامعرفية",
    purpose: "Metacognitive calibration, timing fluency, and BAC methodology rubrics.",
  },
  L5: {
    layer: "L5",
    name_en: "Transfer Probe Layer",
    name_ar: "طبقة سبر التحويل والتوليف",
    purpose: "Unannounced cross-topic synthesis and novel BAC framing.",
  },
};

export function isDiagnosticLayer(val: unknown): val is DiagnosticLayer {
  return typeof val === "string" && (DIAGNOSTIC_LAYERS as readonly string[]).includes(val);
}

import { PracticeTier } from "../evidence";

// --- Question Formats & Cognitive Demands ---

export type QuestionFormat =
  | "mcq_single"
  | "error_identification"
  | "methodology_sequence"
  | "trap_avoidance"
  | "structured_open"
  | "reorder"
  | "formula_choice"
  | "document_exploitation"
  | "journal_entry"
  | "step_by_step"
  | "single_choice"
  | "multi_select"
  | "numeric"
  | "symbolic"
  | "short_answer"
  | "open_response";

export type CognitiveDemand =
  | "recall"
  | "comprehension"
  | "application"
  | "analysis_synthesis"
  | "bac_evaluation";

export interface QuestionOption {
  id: string;
  text_ar: string;
  text_fr: string;
  isCorrect: boolean;
  misconceptionId?: string;
  rationale_ar?: string;
  rationale_fr?: string;
}

export interface CanonicalQuestion {
  id: QuestionId;
  skillId: SkillId;
  skillIds?: SkillId[]; // For multi-skill assessment items
  topicId?: string;
  subjectId: SubjectId;
  streamId: StreamId;
  format: QuestionFormat;
  cognitiveDemand: CognitiveDemand;
  diagnosticLayer?: DiagnosticLayer;
  difficulty: 1 | 2 | 3;
  prompt_ar: string;
  prompt_fr: string;
  options?: QuestionOption[];
  rubricId?: RubricId;
  expectedTimeSeconds: number;
  isRetestVariant?: boolean;
  retestForQuestionId?: QuestionId;
  practiceTier?: PracticeTier;
  version?: number;
  tags?: string[];
  sourceId?: string;
  rightsStatus?: string;
  verificationStatus?: string;
}

export interface RubricCriterion {
  id: string;
  descriptor_ar: string;
  descriptor_fr: string;
  allocatedPoints: number;
  requiredKeywords: string[];
}

export interface MinisterialRubric {
  id: RubricId;
  questionId: QuestionId;
  totalPoints: number;
  criteria: RubricCriterion[];
  bacYearReference?: number;
}

export interface ExamSessionContract {
  id: ExamSessionId;
  studentId: StudentId;
  streamId: StreamId;
  examType: ExamType;
  startedAt: string;
  completedAt?: string;
  status: "in_progress" | "submitted" | "graded";
}

export interface ExamAttemptContract {
  id: ExamAttemptId;
  sessionId: ExamSessionId;
  subjectId: SubjectId;
  selectedOptionNumber: 1 | 2; // Sujet 1 vs Sujet 2
  rawScoreOutof20?: number;
  submittedAt: string;
}
