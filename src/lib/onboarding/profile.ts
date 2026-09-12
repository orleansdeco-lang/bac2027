import { OnboardingDraft, StrategicProfile } from "../../types/onboarding";

export const ONBOARDING_DRAFT_KEY = "bac_mastery_onboarding_draft";
export const STRATEGIC_PROFILE_KEY = "bac_mastery_strategic_profile";

/**
 * Builds a validated StrategicProfile from onboarding draft data.
 */
export function buildStrategicProfile(draft: OnboardingDraft): StrategicProfile {
  if (!draft.streamId) {
    throw new Error("Cannot build StrategicProfile without a streamId");
  }

  return {
    id: `profile_${Date.now()}`,
    educationLevel: draft.educationLevel || "secondary",
    examType: draft.examType || "BAC",
    streamId: draft.streamId,
    techniqueMathSpecialty: draft.techniqueMathSpecialty,
    targetScore: draft.targetScore || 14.0,
    subjectEstimates: draft.subjectEstimates || {},
    availableTime: draft.availableTime || "8_to_12",
    futureObjective: {
      preset: draft.futureObjectivePreset,
      customText: draft.futureObjectiveCustom?.trim(),
    },
    obstacles: draft.obstacles || [],
    studyEnergy: draft.studyEnergy || "normal",
    createdAt: new Date().toISOString(),
  };
}

/**
 * LocalStorage Helpers for Draft state
 */
export function saveOnboardingDraft(draft: OnboardingDraft): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify(draft));
  } catch (err) {
    console.warn("Failed to persist onboarding draft to localStorage", err);
  }
}

export function getOnboardingDraft(): OnboardingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ONBOARDING_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingDraft;
  } catch {
    return null;
  }
}

export function clearOnboardingDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ONBOARDING_DRAFT_KEY);
  } catch {
    // Ignore
  }
}

/**
 * LocalStorage Helpers for Completed Strategic Profile
 */
export function saveStrategicProfile(profile: StrategicProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STRATEGIC_PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.warn("Failed to persist strategic profile to localStorage", err);
  }
}

export function getStrategicProfile(): StrategicProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STRATEGIC_PROFILE_KEY) || localStorage.getItem("bac_mastery_student_profile");
    if (!raw) return null;
    return JSON.parse(raw) as StrategicProfile;
  } catch {
    return null;
  }
}

export function clearStrategicProfile(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STRATEGIC_PROFILE_KEY);
  } catch {
    // Ignore
  }
}
