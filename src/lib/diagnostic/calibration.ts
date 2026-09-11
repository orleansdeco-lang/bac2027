import {
  CalibrationCategory,
  ConfidenceCalibrationResult,
  DiagnosticOption,
  DiagnosticQuestion,
  DiagnosticResponse,
  MisconceptionTrapFinding,
} from "../../types/diagnostic";

/**
 * Analyzes the metacognitive calibration between student confidence and empirical accuracy
 */
export function analyzeConfidenceCalibration(
  responses: DiagnosticResponse[]
): ConfidenceCalibrationResult {
  if (responses.length === 0) {
    return {
      category: "well_calibrated",
      averageConfidence: 3,
      overallAccuracy: 0,
      highConfidenceWrongCount: 0,
      lowConfidenceCorrectCount: 0,
      calibrationIndex: 0,
      summary_ar: "لم يتم تسجيل إجابات كافية لحساب مؤشر الثقة.",
      summary_fr: "Pas assez de réponses pour calculer l'indice de confiance.",
    };
  }

  let totalConfidence = 0;
  let correctCount = 0;
  let highConfidenceWrongCount = 0;
  let lowConfidenceCorrectCount = 0;

  for (const r of responses) {
    totalConfidence += r.confidenceRating;
    if (r.isCorrect) {
      correctCount++;
      if (r.confidenceRating <= 2) {
        lowConfidenceCorrectCount++;
      }
    } else {
      if (r.confidenceRating >= 4) {
        highConfidenceWrongCount++;
      }
    }
  }

  const n = responses.length;
  const averageConfidence = Math.round((totalConfidence / n) * 10) / 10;
  const overallAccuracy = Math.round((correctCount / n) * 100);

  // Confidence normalized to 0-100 scale: (rating 1..5 -> 0..100)
  const normalizedConfidence = ((averageConfidence - 1) / 4) * 100;
  const gap = normalizedConfidence - overallAccuracy;
  const calibrationIndex = Math.round((gap / 100) * 100) / 100;

  let category: CalibrationCategory = "well_calibrated";
  let summary_ar = "";
  let summary_fr = "";

  if (highConfidenceWrongCount >= 3) {
    category = "uncalibrated_severe";
    summary_ar = `إشارة انتباه أولية: وقعت في ${highConfidenceWrongCount} إجابات خاطئة مع درجة ثقة مرتفعة. هذه أفخاخ مفاهيمية محتملة يُنصح بالانتباه إليها مبكراً لأنك قد لا تشعر بوجود الفجوة.`;
    summary_fr = `Signal d'attention initial : ${highConfidenceWrongCount} réponses erronées données avec une certitude élevée. Ce sont des pièges conceptuels potentiels à travailler en priorité.`;
  } else if (gap > 20) {
    category = "overconfident";
    summary_ar = `مؤشر ثقة مرتفع مقارنة بهذه العينة: يبدو أن ثقتك في بعض الإجابات أعلى من الدقة المرصودة هنا. التركيز على دقة المنهجية سيعزز نتائجك.`;
    summary_fr = `Signal de surconfiance modérée : votre certitude sur cet échantillon dépasse la précision observée. Consolider la méthode vous aidera à sécuriser vos points.`;
  } else if (gap < -20) {
    category = "underconfident";
    summary_ar = `يبدو أن مستواك الفعلي في هذه العينة أفضل مما كنت تتوقع: إجاباتك صحيحة في ${correctCount} أسئلة مع ثقة متحفظة (${lowConfidenceCorrectCount} إجابات صحيحة مع تردد). أنت تملك معارف جيدة تحتاج فقط تثبيت الثقة.`;
    summary_fr = `Votre niveau sur cet échantillon semble meilleur que vous ne le pensiez : ${correctCount} réponses correctes malgré une certitude réservée. Vos bases sont solides.`;
  } else {
    category = "well_calibrated";
    summary_ar = `مؤشر معايرة متزن: مستوى يقينك متقارب بواقعية مع دقة إجاباتك في هذه العينة التشخيصية. هذا الوعي يساعدك على استثمار وقت المراجعة بذكاء.`;
    summary_fr = `Signal de calibration équilibré : votre niveau de certitude reflète fidèlement vos réponses sur cet échantillon.`;
  }

  return {
    category,
    averageConfidence,
    overallAccuracy,
    highConfidenceWrongCount,
    lowConfidenceCorrectCount,
    calibrationIndex,
    summary_ar,
    summary_fr,
  };
}

/**
 * Compares the onboarding self-rated estimate with the diagnostic observed score
 * NOTE: Cautious comparison between initial self-estimate and observed sample signal (not a definitive BAC prediction).
 */
export function compareEstimateWithObserved(
  selfEstimateScore: number, // 0 - 20 from onboarding
  observedScore: number      // 0 - 100 from diagnostic
): {
  observedGrade: number;
  delta: number;
  discrepancy: "aligned" | "overestimated" | "underestimated";
  analysis_ar: string;
  analysis_fr: string;
} {
  // Convert observed 0-100 score to 0-20 equivalent benchmark for sample comparison
  const observedGrade = Math.round((observedScore / 5) * 10) / 10;
  const delta = Math.round((selfEstimateScore - observedGrade) * 10) / 10;

  if (Math.abs(delta) <= 2.0) {
    return {
      observedGrade,
      delta,
      discrepancy: "aligned",
      analysis_ar: `أداؤك في هذا التشخيص الأولي متقارب جداً مع تقديرك السابق (${selfEstimateScore}/20). هذا الوضوح الذاتي نقطة انطلاق ممتازة لضبط الأولويات.`,
      analysis_fr: `Votre performance sur ce diagnostic préliminaire est très proche de votre auto-évaluation (${selfEstimateScore}/20). Une bonne lucidité pour démarrer.`,
    };
  }

  if (delta > 2.0) {
    return {
      observedGrade,
      delta,
      discrepancy: "overestimated",
      analysis_ar: `يبدو أن تقديرك الأولي كان أعلى من الأداء الذي ظهر في هذا التشخيص التجريبي (بفارق مؤشر ${delta} نقاط). هذا التشخيص الأولي يكشف مبكراً النقاط التي تستحق مراجعة أعمق.`,
      analysis_fr: `Il semble que votre estimation initiale était supérieure à la performance observée lors de ce diagnostic préliminaire (écart indicatif de ${delta} pts). Cela permet d'identifier à temps les priorités.`,
    };
  }

  return {
    observedGrade,
    delta,
    discrepancy: "underestimated",
    analysis_ar: `يبدو أن مستواك الفعلي في هذه العينة أفضل مما كنت تتوقع (بفارق مؤشر ${Math.abs(delta)} نقاط عن تقديرك الأولي). لديك مكتسبات مشجعة للبناء عليها!`,
    analysis_fr: `Votre niveau observé sur cet échantillon semble meilleur que votre estimation initiale (écart indicatif de ${Math.abs(delta)} pts). Une base encourageante pour progresser !`,
  };
}

/**
 * Extracts all encountered misconception traps
 */
export function extractMisconceptionTraps(
  questions: DiagnosticQuestion[],
  responses: Record<string, DiagnosticResponse>
): MisconceptionTrapFinding[] {
  const findings: MisconceptionTrapFinding[] = [];

  for (const q of questions) {
    const resp = responses[q.id];
    if (!resp || resp.isCorrect) continue;

    const chosenOption = q.options.find((opt) => opt.id === resp.selectedOptionId);
    if (chosenOption?.isMisconceptionTrap && chosenOption.misconceptionDetails) {
      findings.push({
        questionId: q.id,
        subjectId: q.subjectId,
        topic_ar: q.topic_ar,
        topic_fr: q.topic_fr,
        confidenceRating: resp.confidenceRating,
        trapDetails: chosenOption.misconceptionDetails,
      });
    }
  }

  return findings;
}
