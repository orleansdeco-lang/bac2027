/**
 * BAC Mastery — Multidimensional Content Quality Scorer
 * 
 * Strict Principle:
 * Quality is never represented by an ungrounded floating-point percentage (e.g. 98/100).
 * If audit evidence is incomplete or unverified, the system returns UNKNOWN.
 */

import {
  ContentQualityDimensionsAssessment,
  ContentQualityScoreResult,
  DimensionStatus,
} from "./types";

export function evaluateContentQualityScore(
  dimensions: Partial<ContentQualityDimensionsAssessment>
): ContentQualityScoreResult {
  const auditNotes: string[] = [];

  const evaluatedDimensions: ContentQualityDimensionsAssessment = {
    factualAccuracy: dimensions.factualAccuracy || "UNKNOWN",
    curriculumAlignment: dimensions.curriculumAlignment || "UNKNOWN",
    pedagogicalQuality: dimensions.pedagogicalQuality || "UNKNOWN",
    practiceQuality: dimensions.practiceQuality || "UNKNOWN",
    retestQuality: dimensions.retestQuality || "UNKNOWN",
    errorCoverage: dimensions.errorCoverage || "UNKNOWN",
    provenanceVerification: dimensions.provenanceVerification || "UNKNOWN",
    accessibilityCompliance: dimensions.accessibilityCompliance || "UNKNOWN",
    languageQuality: dimensions.languageQuality || "UNKNOWN",
    examTransferAlignment: dimensions.examTransferAlignment || "UNKNOWN",
  };

  const statuses = Object.entries(evaluatedDimensions);
  const unknownCount = statuses.filter(([_, status]) => status === "UNKNOWN").length;
  const needsImprovementCount = statuses.filter(([_, status]) => status === "NEEDS_IMPROVEMENT").length;
  const verifiedCount = statuses.filter(([_, status]) => status === "VERIFIED").length;

  // Rule 1: Insufficient Evidence -> UNKNOWN
  // If core dimensions (factualAccuracy, curriculumAlignment, retestQuality) are UNKNOWN,
  // the entire score is UNKNOWN.
  const coreUnknown =
    evaluatedDimensions.factualAccuracy === "UNKNOWN" ||
    evaluatedDimensions.curriculumAlignment === "UNKNOWN" ||
    evaluatedDimensions.retestQuality === "UNKNOWN";

  if (coreUnknown || unknownCount >= 4) {
    auditNotes.push("أدلة التدقيق غير مكتملة على الأبعاد الجوهرية (الدقة العلمية، التوافق الوزاري، أو جودة التوأم).");
    return {
      overallScore: "UNKNOWN",
      dimensions: evaluatedDimensions,
      isPublishable: false,
      auditNotes,
    };
  }

  // Rule 2: Critical defects -> PROVISIONAL (blocked from publish)
  if (needsImprovementCount > 0) {
    auditNotes.push(`توجد ${needsImprovementCount} أبعاد تحتاج معالجة وتدقيق إضافي قبل الاعتماد.`);
    return {
      overallScore: "PROVISIONAL",
      dimensions: evaluatedDimensions,
      isPublishable: false,
      auditNotes,
    };
  }

  // Rule 3: Exemplary vs Acceptable
  if (verifiedCount === 10) {
    auditNotes.push("المحتوى مستوفٍ لجميع أبعاد الجودة العشرة بامتياز.");
    return {
      overallScore: "EXEMPLARY",
      dimensions: evaluatedDimensions,
      isPublishable: true,
      auditNotes,
    };
  }

  auditNotes.push("المحتوى مستوفٍ للشروط الأساسية مع وجود أبعاد غير مطلوبة أو مكتملة بصفة مقبولة.");
  return {
    overallScore: "ACCEPTABLE",
    dimensions: evaluatedDimensions,
    isPublishable: true,
    auditNotes,
  };
}
