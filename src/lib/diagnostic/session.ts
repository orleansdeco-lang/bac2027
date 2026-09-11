import {
  DiagnosticAnalysisResult,
  DiagnosticQuestion,
  DiagnosticResponse,
  DiagnosticSession,
} from "../../types/diagnostic";
import { StreamId, TechniqueMathSpecialty } from "../../types/education";
import {
  classifySpeed,
  calculateSubjectScores,
  calculateDimensionScores,
  calculateDimensionQuestionCounts,
  calculateObservedDiagnosticScore,
  getDiagnosticBand,
} from "./scoring";
import { analyzeConfidenceCalibration, compareEstimateWithObserved, extractMisconceptionTraps } from "./calibration";
import { detectEmpiricalBottlenecks, generateFirstMission } from "./bottleneck";

export const DIAGNOSTIC_SESSION_KEY = "bac_mastery_diagnostic_session";
export const DIAGNOSTIC_RESULTS_KEY = "bac_mastery_diagnostic_results";

/**
 * Creates a fresh diagnostic session for a given stream
 */
export function createDiagnosticSession(
  streamId: StreamId = "sciences_exp",
  specialty?: TechniqueMathSpecialty
): DiagnosticSession {
  return {
    sessionId: `diag_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    streamId,
    techniqueMathSpecialty: specialty,
    startedAt: new Date().toISOString(),
    status: "in_progress",
    currentQuestionIndex: 0,
    responses: {},
  };
}

/**
 * Loads the active session from localStorage
 */
export function loadDiagnosticSession(): DiagnosticSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DIAGNOSTIC_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DiagnosticSession;
  } catch (e) {
    console.error("Failed to load diagnostic session from localStorage", e);
    return null;
  }
}

/**
 * Saves active session to localStorage
 */
export function saveDiagnosticSession(session: DiagnosticSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DIAGNOSTIC_SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error("Failed to save diagnostic session to localStorage", e);
  }
}

/**
 * Clears active session from localStorage
 */
export function clearDiagnosticSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(DIAGNOSTIC_SESSION_KEY);
  } catch (e) {
    console.error("Failed to clear diagnostic session", e);
  }
}

/**
 * Records a student's answer and confidence rating for a specific question
 */
export function recordQuestionResponse(
  session: DiagnosticSession,
  question: DiagnosticQuestion,
  selectedOptionId: string,
  confidenceRating: 1 | 2 | 3 | 4 | 5,
  timeSpentSeconds: number
): DiagnosticSession {
  const chosenOption = question.options.find((opt) => opt.id === selectedOptionId);
  const isCorrect = chosenOption?.isCorrect ?? false;
  const speedCategory = classifySpeed(timeSpentSeconds, question.expectedSeconds);

  const isMisconceptionTrap = chosenOption?.isMisconceptionTrap ?? false;
  const misconceptionDetails = chosenOption?.misconceptionDetails;

  const response: DiagnosticResponse = {
    questionId: question.id,
    subjectId: question.subjectId,
    dimension: question.dimension,
    selectedOptionId,
    isCorrect,
    confidenceRating,
    timeSpentSeconds,
    speedCategory,
    isMisconceptionTrap,
    misconceptionDetails,
  };

  const updatedResponses = {
    ...session.responses,
    [question.id]: response,
  };

  return {
    ...session,
    responses: updatedResponses,
  };
}

/**
 * Completes the session, processes empirical scores, and generates full analysis
 */
export function completeDiagnosticSession(
  session: DiagnosticSession,
  questions: DiagnosticQuestion[],
  selfEstimateScore: number = 12.0
): DiagnosticAnalysisResult {
  const completedAt = new Date().toISOString();
  const responsesList = Object.values(session.responses);
  const totalQuestions = questions.length;
  const correctCount = responsesList.filter((r) => r.isCorrect).length;
  const overallAccuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // 1. Scoring
  const subjectScores = calculateSubjectScores(
    questions,
    session.responses,
    session.streamId,
    session.techniqueMathSpecialty
  );
  const dimensionScores = calculateDimensionScores(responsesList);
  const dimensionQuestionCounts = calculateDimensionQuestionCounts(responsesList);
  const coreDiagnosticSignal = calculateObservedDiagnosticScore(subjectScores);
  const { band_ar, band_fr } = getDiagnosticBand(coreDiagnosticSignal);

  // 2. Calibration
  const calibration = analyzeConfidenceCalibration(responsesList);
  const comparison = compareEstimateWithObserved(selfEstimateScore, coreDiagnosticSignal);
  const misconceptionTraps = extractMisconceptionTraps(questions, session.responses);

  // 3. Bottleneck and First Mission
  const { primaryBottleneck, secondaryBottlenecks } = detectEmpiricalBottlenecks(
    subjectScores,
    dimensionScores,
    misconceptionTraps
  );
  const firstRecommendedMission = generateFirstMission(primaryBottleneck, misconceptionTraps);

  const limitations = [
    "عينة تجريبية أولية (15 سؤالاً للمواد الأساسية فقط).",
    "المؤشر يمثل إشارة تشخيصية استطلاعية، وليس تنبؤاً قطعياً بمعدل شهادة البكالوريا.",
    "المعاملات المستخدمة مرحلية وتخضع للمراجعة الوزارية الرسمية.",
    "الأبعاد المعرفية مبنية على عينة صغيرة تتطلب تثبيتاً مستمراً عبر التمارين والمهمات.",
  ];

  const analysisResult: DiagnosticAnalysisResult = {
    sessionId: session.sessionId,
    streamId: session.streamId,
    completedAt,
    coverage: "pilot",
    source: "diagnostic",
    totalQuestions,
    questionCount: totalQuestions,
    overallAccuracy,
    coreDiagnosticSignal,
    observedDiagnosticScore: coreDiagnosticSignal,
    observedDiagnosticBand_ar: band_ar,
    observedDiagnosticBand_fr: band_fr,
    selfEstimateScore,
    deltaFromEstimate: comparison.delta,
    estimationDiscrepancy: comparison.discrepancy,
    discrepancyNote_ar: comparison.analysis_ar,
    discrepancyNote_fr: comparison.analysis_fr,
    subjectScores,
    dimensionScores,
    dimensionQuestionCounts,
    calibration,
    misconceptionTraps,
    primaryBottleneck,
    preliminaryBottleneck: primaryBottleneck,
    secondaryBottlenecks,
    firstRecommendedMission,
    levelSource: "diagnostic_observed",
    limitations,
  };

  return analysisResult;
}

/**
 * Loads the latest diagnostic analysis results
 */
export function loadDiagnosticResults(): DiagnosticAnalysisResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DIAGNOSTIC_RESULTS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DiagnosticAnalysisResult;
  } catch (e) {
    console.error("Failed to load diagnostic results", e);
    return null;
  }
}

/**
 * Saves diagnostic analysis results to localStorage
 */
export function saveDiagnosticResults(results: DiagnosticAnalysisResult): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DIAGNOSTIC_RESULTS_KEY, JSON.stringify(results));
  } catch (e) {
    console.error("Failed to save diagnostic results", e);
  }
}
