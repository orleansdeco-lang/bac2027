import { OnboardingDraft, OnboardingStep, SelfRatedLevel } from "../../types/onboarding";
import { SubjectId } from "../../types/education";
import { getStreamSubjects } from "../constants/streams";

export interface ValidationResult {
  isValid: boolean;
  errorKey?: string;
}

/**
 * Validates whether the student can proceed past a specific onboarding step.
 */
export function validateOnboardingStep(
  step: OnboardingStep,
  data: Partial<OnboardingDraft>
): ValidationResult {
  switch (step) {
    case "welcome":
      return { isValid: true };

    case "education_level":
      if (!data.educationLevel || !data.examType) {
        return { isValid: false, errorKey: "onboarding.errors.selectEducationLevel" };
      }
      return { isValid: true };

    case "stream":
      if (!data.streamId) {
        return { isValid: false, errorKey: "onboarding.errors.selectStream" };
      }
      if (data.streamId === "technique_math" && !data.techniqueMathSpecialty) {
        return { isValid: false, errorKey: "onboarding.errors.selectSpecialty" };
      }
      return { isValid: true };

    case "target_score":
      if (
        data.targetScore === undefined ||
        data.targetScore < 10 ||
        data.targetScore > 20 ||
        isNaN(data.targetScore)
      ) {
        return { isValid: false, errorKey: "onboarding.errors.validTargetScore" };
      }
      return { isValid: true };

    case "level_estimation": {
      if (!data.streamId) {
        return { isValid: false, errorKey: "onboarding.errors.selectStreamFirst" };
      }
      const streamSubjects = getStreamSubjects(data.streamId, data.techniqueMathSpecialty);
      const estimates = (data.subjectEstimates || {}) as Partial<Record<SubjectId, SelfRatedLevel>>;

      // Require all core subjects to have a rating (1 to 5)
      const coreSubjects = streamSubjects.filter((s) => s.isCoreSubject);
      const missingCore = coreSubjects.some(
        (s) => {
          const val = estimates[s.subjectId];
          return !val || val < 1 || val > 5;
        }
      );

      if (missingCore) {
        return { isValid: false, errorKey: "onboarding.errors.rateAllCoreSubjects" };
      }
      return { isValid: true };
    }

    case "available_time":
      if (!data.availableTime) {
        return { isValid: false, errorKey: "onboarding.errors.selectAvailableTime" };
      }
      return { isValid: true };

    case "future_objective":
      if (!data.futureObjectivePreset && (!data.futureObjectiveCustom || !data.futureObjectiveCustom.trim())) {
        return { isValid: false, errorKey: "onboarding.errors.selectFutureObjective" };
      }
      return { isValid: true };

    case "obstacles":
      if (!data.obstacles || data.obstacles.length === 0) {
        return { isValid: false, errorKey: "onboarding.errors.selectAtLeastOneObstacle" };
      }
      return { isValid: true };

    case "study_state":
      if (!data.studyEnergy) {
        return { isValid: false, errorKey: "onboarding.errors.selectStudyEnergy" };
      }
      return { isValid: true };

    case "summary":
      // All previous validations must hold
      return {
        isValid:
          Boolean(data.streamId) &&
          (data.streamId !== "technique_math" || Boolean(data.techniqueMathSpecialty)) &&
          data.targetScore !== undefined &&
          data.targetScore >= 10 &&
          data.targetScore <= 20 &&
          Boolean(data.availableTime) &&
          (Boolean(data.futureObjectivePreset) || Boolean(data.futureObjectiveCustom?.trim())) &&
          Boolean(data.obstacles && data.obstacles.length > 0) &&
          Boolean(data.studyEnergy),
      };

    default:
      return { isValid: true };
  }
}
