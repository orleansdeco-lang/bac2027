/**
 * BAC Mastery - Diagnostic & Gap Analysis Engine Types
 */

import { SubjectId, StreamId, TechniqueMathSpecialty } from "./education";

export type DiagnosticDimension =
  | "knowledge"       // استرجاع المعارف
  | "understanding"   // الفهم والتفسير
  | "application"     // التطبيق والحساب
  | "methodology"     // المنهجية وصياغة الإجابة
  | "speed"           // السرعة وإدارة الوقت
  | "confidence";     // ثقة التلميذ

// Alias for backward compatibility
export type CognitiveDimension = DiagnosticDimension;

export type DiagnosticCoverage = "pilot" | "partial" | "complete";

export type QualitativeSignalBand =
  | "foundational_fragility" // 0–34: هش / يحتاج تأسيس
  | "weak"                   // 35–49: ضعيف
  | "in_construction"        // 50–69: في طور البناء
  | "good"                   // 70–84: جيد
  | "strong";                // 85–100: قوي

export type PerformanceTier = "strength" | "average" | "weakness" | "bottleneck";

export type DiagnosticQuestionType =
  | "mcq_single"
  | "error_identification"
  | "methodology_sequence"
  | "trap_avoidance";

export interface DiagnosticOption {
  id: string;
  text_ar: string;
  text_fr: string;
  isCorrect: boolean;
  rationale_ar: string;
  rationale_fr: string;
  isMisconceptionTrap?: boolean;
  misconceptionDetails?: {
    trapId: string;
    description_ar: string;
    description_fr: string;
    suspectedErrorType?: string;
    errorType?: string;
  };
}

export interface DiagnosticQuestion {
  id: string;
  subjectId: SubjectId;
  streamId: StreamId;
  topicId: string;
  topic_ar: string;
  topic_fr: string;
  questionType: DiagnosticQuestionType;
  dimension: DiagnosticDimension;
  prompt_ar: string;
  prompt_fr: string;
  options: DiagnosticOption[];
  expectedSeconds: number; // Estimated expected solving time (product benchmark)
  bacRelevance_ar: string;
  bacRelevance_fr: string;
}

export type SpeedCategory = "fast" | "normal" | "slow" | "very_slow";

export interface DiagnosticResponse {
  questionId: string;
  subjectId: SubjectId;
  dimension: DiagnosticDimension;
  selectedOptionId: string;
  isCorrect: boolean;
  confidenceRating: 1 | 2 | 3 | 4 | 5;
  timeSpentSeconds: number;
  speedCategory: SpeedCategory;
  isMisconceptionTrap: boolean;
  misconceptionDetails?: DiagnosticOption["misconceptionDetails"];
}

export interface DiagnosticSession {
  sessionId: string;
  streamId: StreamId;
  techniqueMathSpecialty?: TechniqueMathSpecialty;
  startedAt: string;
  completedAt?: string;
  status: "in_progress" | "completed";
  currentQuestionIndex: number;
  responses: Record<string, DiagnosticResponse>;
}

export interface SubjectDiagnosticScore {
  subjectId: SubjectId;
  coefficient: number;
  totalQuestions: number;
  questionCount?: number; // Sample size awareness
  correctCount: number;
  accuracyPercentage: number;
  signalBand: QualitativeSignalBand;
  signalBand_ar: string;
  signalBand_fr: string;
  observedRange: string;
  dimensionBreakdown: Record<DiagnosticDimension, number>;
  averageTimeSpentSeconds: number;
  averageConfidence: number;
  highConfidenceWrongCount: number;
  uncalibratedScore: number;
}

export type LevelSource = "onboarding_estimate" | "diagnostic_observed";

export type CalibrationCategory =
  | "well_calibrated"
  | "overconfident"
  | "underconfident"
  | "uncalibrated_severe";

export interface ConfidenceCalibrationResult {
  category: CalibrationCategory;
  averageConfidence: number;
  overallAccuracy: number;
  highConfidenceWrongCount: number; // Misconceptions (confidence >= 4, wrong)
  lowConfidenceCorrectCount: number;  // Underconfidence/guessing (confidence <= 2, correct)
  calibrationIndex: number; // -1 (underconfident) to +1 (overconfident), ~0 calibrated
  summary_ar: string;
  summary_fr: string;
}

export interface MisconceptionTrapFinding {
  questionId: string;
  subjectId: SubjectId;
  topic_ar: string;
  topic_fr: string;
  confidenceRating: number;
  trapDetails: NonNullable<DiagnosticOption["misconceptionDetails"]>;
}

export interface DiagnosticBottleneck {
  subjectId: SubjectId;
  dimension: DiagnosticDimension;
  severity: "critical" | "high" | "moderate";
  observedScore: number;
  title_ar: string;
  title_fr: string;
  rationale_ar: string;
  rationale_fr: string;
  isPreliminary?: boolean; // Indicates preliminary candidate, not permanent diagnosis
}

export interface FirstMissionRecommendation {
  id: string;
  title_ar: string;
  title_fr: string;
  subjectId: SubjectId;
  dimension: DiagnosticDimension;
  focusTopic_ar: string;
  focusTopic_fr: string;
  estimatedMinutes: number;
  actionSteps_ar: string[];
  actionSteps_fr: string[];
}

export interface DiagnosticAnalysisResult {
  sessionId: string;
  streamId: StreamId;
  completedAt: string;
  coverage: DiagnosticCoverage; // "pilot" | "partial" | "complete"
  source: "diagnostic";
  totalQuestions: number;
  questionCount: number; // sample-size awareness
  overallAccuracy: number;
  coreDiagnosticSignal: number; // 0 - 100 (Core diagnostic signal, NOT a BAC score prediction)
  observedDiagnosticScore: number; // Alias for coreDiagnosticSignal (0 - 100)
  observedDiagnosticBand_ar: string;
  observedDiagnosticBand_fr: string;
  selfEstimateScore: number; // 0 - 20 from onboarding
  deltaFromEstimate: number; // Calibrated delta
  estimationDiscrepancy: "aligned" | "overestimated" | "underestimated";
  discrepancyNote_ar?: string;
  discrepancyNote_fr?: string;
  subjectScores: Partial<Record<SubjectId, SubjectDiagnosticScore>>;
  dimensionScores: Record<DiagnosticDimension, number>;
  dimensionQuestionCounts: Record<DiagnosticDimension, number>;
  calibration: ConfidenceCalibrationResult;
  misconceptionTraps: MisconceptionTrapFinding[];
  primaryBottleneck: DiagnosticBottleneck;
  preliminaryBottleneck?: DiagnosticBottleneck; // Preliminary bottleneck candidate
  secondaryBottlenecks: DiagnosticBottleneck[];
  firstRecommendedMission: FirstMissionRecommendation;
  weakestSkills?: string[];
  strengths?: string[];
  levelSource: LevelSource;
  limitations: string[];
}

export interface CognitiveScoreBreakdown {
  knowledge: number;
  understanding: number;
  application: number;
  methodology: number;
  speed: number;
  confidence: number;
}

export interface SubjectGapAnalysis {
  subjectId: SubjectId;
  coefficient: number;
  currentEstimatedScore: number;
  targetScore: number;
  rawPointGap: number;
  weightedGap: number;
  tier: PerformanceTier;
  cognitiveBreakdown: CognitiveScoreBreakdown;
  isPrimaryBottleneck: boolean;
  priorityRank: number;
  recommendation_ar: string;
  recommendation_fr: string;
}

export interface ComprehensiveGapReport {
  studentId: string;
  totalRawGap: number;
  totalWeightedGap: number;
  primaryBottleneckSubject: SubjectId;
  subjectGaps: SubjectGapAnalysis[];
  generatedAt: string;
}
