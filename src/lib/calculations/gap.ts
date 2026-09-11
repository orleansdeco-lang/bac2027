import { StreamSubjectRule } from "@/types/education";
import { SubjectGoalTarget } from "@/types/student";
import { SubjectGapAnalysis } from "@/types/diagnostic";

/**
 * Calculates weighted gap for a subject: (target - current) * coefficient
 */
export function calculateSubjectGap(
  target: SubjectGoalTarget,
  rule: StreamSubjectRule
): SubjectGapAnalysis {
  const rawPointGap = Math.max(0, target.targetScore - target.currentEstimatedScore);
  const weightedGap = rawPointGap * rule.coefficient;

  // Determine performance tier based on current estimated score
  let tier: "strength" | "average" | "weakness" | "bottleneck" = "average";
  if (target.currentEstimatedScore >= 15) {
    tier = "strength";
  } else if (target.currentEstimatedScore < 10) {
    tier = "weakness";
  }

  return {
    subjectId: target.subjectId,
    coefficient: rule.coefficient,
    currentEstimatedScore: target.currentEstimatedScore,
    targetScore: target.targetScore,
    rawPointGap,
    weightedGap,
    tier,
    isPrimaryBottleneck: false, // Calculated across all subjects
    priorityRank: 0,
    cognitiveBreakdown: {
      knowledge: 70,
      understanding: 65,
      application: 60,
      methodology: 50,
      speed: 60,
      confidence: 65,
    },
    recommendation_ar: `التركيز على منهجية حل التمارين ذات المعامل ${rule.coefficient}`,
    recommendation_fr: `Prioriser la méthodologie de résolution pour la matière à coefficient ${rule.coefficient}`,
  };
}

/**
 * Ranks all subjects by weighted gap and flags the primary bottleneck
 */
export function identifyPrimaryBottleneck(
  gaps: SubjectGapAnalysis[]
): SubjectGapAnalysis[] {
  // Sort descending by weighted gap
  const sorted = [...gaps].sort((a, b) => b.weightedGap - a.weightedGap);

  return sorted.map((item, index) => ({
    ...item,
    priorityRank: index + 1,
    isPrimaryBottleneck: index === 0 && item.weightedGap > 0,
    tier: index === 0 && item.weightedGap > 0 ? "bottleneck" : item.tier,
  }));
}
