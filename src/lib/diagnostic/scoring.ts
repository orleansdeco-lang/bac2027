import {
  DiagnosticDimension,
  DiagnosticQuestion,
  DiagnosticResponse,
  SpeedCategory,
  SubjectDiagnosticScore,
} from "../../types/diagnostic";
import { StreamId, SubjectId, TechniqueMathSpecialty } from "../../types/education";
import { getStreamSubjects } from "../constants/streams";

/**
 * Classifies the student's response speed relative to the expected completion duration
 */
export function classifySpeed(
  timeSpentSeconds: number,
  expectedSeconds: number
): SpeedCategory {
  if (expectedSeconds <= 0) return "normal";

  if (timeSpentSeconds < expectedSeconds * 0.8) {
    return "fast";
  }
  if (timeSpentSeconds <= expectedSeconds * 1.2) {
    return "normal";
  }
  if (timeSpentSeconds <= expectedSeconds * 1.8) {
    return "slow";
  }
  return "very_slow";
}

/**
 * Calculates subject-level diagnostic scores
 */
export function calculateSubjectScores(
  questions: DiagnosticQuestion[],
  responses: Record<string, DiagnosticResponse>,
  streamId: StreamId,
  specialty?: TechniqueMathSpecialty
): Partial<Record<SubjectId, SubjectDiagnosticScore>> {
  const streamRules = getStreamSubjects(streamId, specialty);
  const coeffMap = new Map<SubjectId, number>();
  for (const rule of streamRules) {
    coeffMap.set(rule.subjectId, rule.coefficient);
  }

  const subjectMap = new Map<SubjectId, {
    questions: DiagnosticQuestion[];
    responses: DiagnosticResponse[];
  }>();

  for (const q of questions) {
    const resp = responses[q.id];
    if (!resp) continue;

    if (!subjectMap.has(q.subjectId)) {
      subjectMap.set(q.subjectId, { questions: [], responses: [] });
    }
    const entry = subjectMap.get(q.subjectId)!;
    entry.questions.push(q);
    entry.responses.push(resp);
  }

  const result: Partial<Record<SubjectId, SubjectDiagnosticScore>> = {};

  subjectMap.forEach((data, subjectId) => {
    const totalQuestions = data.responses.length;
    if (totalQuestions === 0) return;

    const correctCount = data.responses.filter((r: DiagnosticResponse) => r.isCorrect).length;
    const accuracyPercentage = Math.round((correctCount / totalQuestions) * 100);

    // Dimension breakdown within subject
    const dimStats: Record<DiagnosticDimension, { total: number; correct: number }> = {
      knowledge: { total: 0, correct: 0 },
      understanding: { total: 0, correct: 0 },
      application: { total: 0, correct: 0 },
      methodology: { total: 0, correct: 0 },
      speed: { total: 0, correct: 0 },
      confidence: { total: 0, correct: 0 },
    };

    let totalTime = 0;
    let totalConfidence = 0;
    let highConfidenceWrongCount = 0;

    for (const r of data.responses) {
      totalTime += r.timeSpentSeconds;
      totalConfidence += r.confidenceRating;
      if (!r.isCorrect && r.confidenceRating >= 4) {
        highConfidenceWrongCount++;
      }

      const dim = r.dimension as DiagnosticDimension;
      if (dimStats[dim]) {
        dimStats[dim].total++;
        if (r.isCorrect) {
          dimStats[dim].correct++;
        }
      }
    }

    const dimensionBreakdown: Record<DiagnosticDimension, number> = {
      knowledge: dimStats.knowledge.total > 0 ? Math.round((dimStats.knowledge.correct / dimStats.knowledge.total) * 100) : 0,
      understanding: dimStats.understanding.total > 0 ? Math.round((dimStats.understanding.correct / dimStats.understanding.total) * 100) : 0,
      application: dimStats.application.total > 0 ? Math.round((dimStats.application.correct / dimStats.application.total) * 100) : 0,
      methodology: dimStats.methodology.total > 0 ? Math.round((dimStats.methodology.correct / dimStats.methodology.total) * 100) : 0,
      speed: Math.round(
        (data.responses.filter((r: DiagnosticResponse) => r.speedCategory === "fast" || r.speedCategory === "normal").length / totalQuestions) * 100
      ),
      confidence: Math.round(((totalConfidence / totalQuestions - 1) / 4) * 100),
    };

    const bandInfo = getQualitativeSignalBand(accuracyPercentage);
    const avgTime = Math.round(totalTime / totalQuestions);
    const avgConfidence = Math.round((totalConfidence / totalQuestions) * 10) / 10;
    const coefficient = coeffMap.get(subjectId) ?? 1;

    result[subjectId] = {
      subjectId,
      coefficient,
      totalQuestions,
      correctCount,
      accuracyPercentage,
      signalBand: bandInfo.band,
      signalBand_ar: bandInfo.band_ar,
      signalBand_fr: bandInfo.band_fr,
      observedRange: bandInfo.observedRange,
      dimensionBreakdown,
      averageTimeSpentSeconds: avgTime,
      averageConfidence: avgConfidence,
      highConfidenceWrongCount,
      uncalibratedScore: accuracyPercentage,
    };
  });

  return result;
}

/**
 * Maps percentage to standardized qualitative signal bands
 * (0–34: هش / يحتاج تأسيس, 35–49: ضعيف, 50–69: في طور البناء, 70–84: جيد, 85–100: قوي)
 * NOTE: These are formative product bands, not scientifically validated clinical cutoffs.
 */
export function getQualitativeSignalBand(accuracyPercentage: number): {
  band: "foundational_fragility" | "weak" | "in_construction" | "good" | "strong";
  band_ar: string;
  band_fr: string;
  observedRange: string;
} {
  if (accuracyPercentage >= 85) {
    return {
      band: "strong",
      band_ar: "قوي",
      band_fr: "Solide",
      observedRange: "85–100%",
    };
  }
  if (accuracyPercentage >= 70) {
    return {
      band: "good",
      band_ar: "جيد",
      band_fr: "Bon",
      observedRange: "70–84%",
    };
  }
  if (accuracyPercentage >= 50) {
    return {
      band: "in_construction",
      band_ar: "في طور البناء",
      band_fr: "En consolidation",
      observedRange: "50–69%",
    };
  }
  if (accuracyPercentage >= 35) {
    return {
      band: "weak",
      band_ar: "ضعيف",
      band_fr: "Faible",
      observedRange: "35–49%",
    };
  }
  return {
    band: "foundational_fragility",
    band_ar: "هش / يحتاج تأسيس",
    band_fr: "Fragilité / À consolider",
    observedRange: "0–34%",
  };
}

/**
 * Calculates global scores across all 6 cognitive dimensions
 */
export function calculateDimensionScores(
  responses: DiagnosticResponse[]
): Record<DiagnosticDimension, number> {
  const dimStats: Record<"knowledge" | "understanding" | "application" | "methodology", { total: number; correct: number }> = {
    knowledge: { total: 0, correct: 0 },
    understanding: { total: 0, correct: 0 },
    application: { total: 0, correct: 0 },
    methodology: { total: 0, correct: 0 },
  };

  if (responses.length === 0) {
    return {
      knowledge: 0,
      understanding: 0,
      application: 0,
      methodology: 0,
      speed: 0,
      confidence: 0,
    };
  }

  let totalSpeedScore = 0;
  let totalConfidence = 0;

  for (const r of responses) {
    totalConfidence += r.confidenceRating;

    // Speed score weight
    if (r.speedCategory === "fast") totalSpeedScore += 100;
    else if (r.speedCategory === "normal") totalSpeedScore += 85;
    else if (r.speedCategory === "slow") totalSpeedScore += 60;
    else totalSpeedScore += 30;

    if (dimStats[r.dimension as keyof typeof dimStats]) {
      dimStats[r.dimension as keyof typeof dimStats].total++;
      if (r.isCorrect) {
        dimStats[r.dimension as keyof typeof dimStats].correct++;
      }
    }
  }

  const knowledge = dimStats.knowledge.total > 0
    ? Math.round((dimStats.knowledge.correct / dimStats.knowledge.total) * 100)
    : 0;
  const understanding = dimStats.understanding.total > 0
    ? Math.round((dimStats.understanding.correct / dimStats.understanding.total) * 100)
    : 0;
  const application = dimStats.application.total > 0
    ? Math.round((dimStats.application.correct / dimStats.application.total) * 100)
    : 0;
  const methodology = dimStats.methodology.total > 0
    ? Math.round((dimStats.methodology.correct / dimStats.methodology.total) * 100)
    : 0;

  const speed = Math.round(totalSpeedScore / responses.length);
  const confidence = Math.round(((totalConfidence / responses.length - 1) / 4) * 100);

  return {
    knowledge,
    understanding,
    application,
    methodology,
    speed,
    confidence,
  };
}

/**
 * Computes question count per cognitive dimension for sample size awareness
 */
export function calculateDimensionQuestionCounts(
  responses: DiagnosticResponse[]
): Record<DiagnosticDimension, number> {
  const counts: Record<DiagnosticDimension, number> = {
    knowledge: 0,
    understanding: 0,
    application: 0,
    methodology: 0,
    speed: responses.length,
    confidence: responses.length,
  };

  for (const r of responses) {
    const dim = r.dimension as DiagnosticDimension;
    if (counts[dim] !== undefined) {
      counts[dim]++;
    }
  }

  return counts;
}

/**
 * Computes the overall Core Diagnostic Signal (0 - 100) weighted by provisional subject BAC coefficients.
 *
 * CRITICAL SAFETY NOTE:
 * This is an initial formative diagnostic signal across the tested sample,
 * NOT a statistically definitive or scientifically validated BAC score prediction.
 */
export function calculateObservedDiagnosticScore(
  subjectScores: Partial<Record<SubjectId, SubjectDiagnosticScore>>
): number {
  const scores = Object.values(subjectScores).filter(Boolean) as SubjectDiagnosticScore[];
  if (scores.length === 0) return 0;

  let weightedSum = 0;
  let totalCoeff = 0;

  for (const s of scores) {
    weightedSum += s.accuracyPercentage * s.coefficient;
    totalCoeff += s.coefficient;
  }

  if (totalCoeff === 0) return 0;
  return Math.round(weightedSum / totalCoeff);
}

// Alias to emphasize cautious diagnostic signal terminology
export const calculateCoreDiagnosticSignal = calculateObservedDiagnosticScore;

/**
 * Returns qualitative diagnostic signal band based on observed score.
 * NOTE: These are product heuristics for formative guidance, not ministerial grading cutoffs.
 */
export function getDiagnosticBand(score: number): { band_ar: string; band_fr: string } {
  if (score >= 85) {
    return {
      band_ar: "مؤشر تحكم قوي واستعداد منهجي واعد",
      band_fr: "Signal de maîtrise solide et méthode prometteuse",
    };
  }
  if (score >= 70) {
    return {
      band_ar: "مؤشر تحكم جيد مع بعض النقاط الموضعية للتحسين",
      band_fr: "Signal de maîtrise bon avec points ponctuels à consolider",
    };
  }
  if (score >= 50) {
    return {
      band_ar: "مستوى في طور البناء يحتاج تثبيت المنهجية",
      band_fr: "Niveau en cours de consolidation méthodologique",
    };
  }
  if (score >= 35) {
    return {
      band_ar: "فجوات أولية تتطلب معالجة وتمارين موجهة",
      band_fr: "Lacunes initiales nécessitant un entraînement ciblé",
    };
  }
  return {
    band_ar: "هشاشة تأسيسية تتطلب إعادة بناء المفاهيم القاعدية",
    band_fr: "Fragilités de base nécessitant une reprise des fondamentaux",
  };
}
