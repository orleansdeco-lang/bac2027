import { InitialGapResult, InitialSubjectGap, SelfRatedLevel, StrategicProfile } from "../../types/onboarding";
import { getStreamSubjects, getTotalStreamCoefficients } from "../constants/streams";

/**
 * Maps self-rated 1-5 confidence scale to an approximate baseline grade.
 * 1 (ضعيف جداً) -> 7.0/20
 * 2 (ضعيف)     -> 9.5/20
 * 3 (متوسط)    -> 12.0/20
 * 4 (مليح)     -> 15.0/20
 * 5 (قوي)      -> 18.0/20
 */
export const RATING_TO_BASELINE_GRADE: Record<SelfRatedLevel, number> = {
  1: 7.0,
  2: 9.5,
  3: 12.0,
  4: 15.0,
  5: 18.0,
};

/**
 * Calculates initial strategic gap from self-reported estimates and target score.
 * Clearly separates self-reported estimates from empirical diagnostics.
 */
export function calculateInitialStrategicGap(profile: StrategicProfile): InitialGapResult {
  const streamSubjects = getStreamSubjects(profile.streamId, profile.techniqueMathSpecialty);
  const totalCoefficients = getTotalStreamCoefficients(streamSubjects);

  let weightedSum = 0;
  const subjectGaps: InitialSubjectGap[] = [];

  for (const rule of streamSubjects) {
    // Default to average (3 -> 12.0) if unrated non-core subject
    const rating: SelfRatedLevel = profile.subjectEstimates[rule.subjectId] || 3;
    const estimatedGrade = RATING_TO_BASELINE_GRADE[rating];

    weightedSum += estimatedGrade * rule.coefficient;

    const rawGap = Math.max(0, profile.targetScore - estimatedGrade);
    const weightedGap = rawGap * rule.coefficient;

    subjectGaps.push({
      subjectId: rule.subjectId,
      coefficient: rule.coefficient,
      isCoreSubject: rule.isCoreSubject,
      selfRatedLevel: rating,
      estimatedBaselineGrade: estimatedGrade,
      weightedGap,
    });
  }

  const rawBaseline = totalCoefficients > 0 ? weightedSum / totalCoefficients : 10;
  // Round cleanly to 1 decimal place to prevent false precision
  const estimatedBaselineScore = Math.round(rawBaseline * 10) / 10;
  const approximateGap = Math.max(0, Math.round((profile.targetScore - estimatedBaselineScore) * 10) / 10);

  // Sort subjects by weighted gap descending
  subjectGaps.sort((a, b) => b.weightedGap - a.weightedGap);

  return {
    targetScore: profile.targetScore,
    estimatedBaselineScore,
    approximateGap,
    subjectGaps,
  };
}
