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
    let profile: any = raw ? JSON.parse(raw) : null;
    const reg = getRegistrationDraft();
    const acad = getAcademicProfileDraft();

    if (!profile && !reg && !acad) return null;

    if (!profile) {
      profile = {
        id: `profile_${Date.now()}`,
        streamId: reg?.streamId || "sciences_exp",
        targetScore: acad?.targetScore || 16.0,
        subjectEstimates: {},
        availableTime: "12_to_18",
        studyEnergy: "normal",
        createdAt: new Date().toISOString(),
      };
    }

    if (reg) {
      profile.firstName = reg.firstName || profile.firstName;
      profile.first_name = reg.firstName || profile.first_name;
      profile.lastName = reg.lastName || profile.lastName;
      profile.last_name = reg.lastName || profile.last_name;
      profile.studentPhone = reg.studentPhone || profile.studentPhone;
      profile.student_phone = reg.studentPhone || profile.student_phone;
      profile.parentPhone = reg.parentPhone || profile.parentPhone;
      profile.parent_phone = reg.parentPhone || profile.parent_phone;
      profile.studentStatus = reg.studentStatus || profile.studentStatus;
      profile.student_status = reg.studentStatus || profile.student_status;
      profile.streamId = reg.streamId || profile.streamId;
      profile.stream_id = reg.streamId || profile.stream_id;
      profile.techniqueMathSpecialty = reg.techniqueMathSpecialty || profile.techniqueMathSpecialty;
      profile.wilayaCode = reg.wilayaCode || profile.wilayaCode;
      profile.wilaya_code = reg.wilayaCode || profile.wilaya_code;
      profile.wilayaName = reg.wilayaName || profile.wilayaName;
      profile.wilaya_name = reg.wilayaName || profile.wilaya_name;
      profile.communeCode = reg.communeCode || profile.communeCode;
      profile.commune_code = reg.communeCode || profile.commune_code;
      profile.communeName = reg.communeName || profile.communeName;
      profile.commune_name = reg.communeName || profile.commune_name;
      profile.schoolName = reg.schoolName !== undefined ? reg.schoolName : profile.schoolName;
      profile.school_name = reg.schoolName !== undefined ? reg.schoolName : profile.school_name;
      profile.registrationCompletedAt = reg.registrationCompletedAt || profile.registrationCompletedAt;
      profile.registration_completed_at = reg.registrationCompletedAt || profile.registration_completed_at;
    }

    if (acad) {
      profile.targetScore = acad.targetScore || profile.targetScore;
      profile.target_score = acad.targetScore || profile.target_score;
      profile.academicProfileCompletedAt = acad.academicProfileCompletedAt || profile.academicProfileCompletedAt;
      profile.academic_profile_completed_at = acad.academicProfileCompletedAt || profile.academic_profile_completed_at;
      if (acad.targetSpecialty) {
        profile.targetSpecialty = acad.targetSpecialty;
        profile.target_specialty = acad.targetSpecialty;
      }
      if (acad.studyMethods) {
        profile.studyMethods = acad.studyMethods;
        profile.study_methods = acad.studyMethods;
      }
    }

    return profile as StrategicProfile;
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

/**
 * LocalStorage Helpers for Registration Draft (V1 Progressive Flow)
 */
export const REGISTRATION_DRAFT_KEY = "bac_mastery_registration_draft";
export const ACADEMIC_PROFILE_DRAFT_KEY = "bac_mastery_academic_draft";

export function saveRegistrationDraft(draft: any): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(REGISTRATION_DRAFT_KEY, JSON.stringify(draft));
  } catch (err) {
    console.warn("Failed to persist registration draft to localStorage", err);
  }
}

export function getRegistrationDraft(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearRegistrationDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(REGISTRATION_DRAFT_KEY);
  } catch {
    // Ignore
  }
}

export function saveAcademicProfileDraft(draft: any): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACADEMIC_PROFILE_DRAFT_KEY, JSON.stringify(draft));
  } catch (err) {
    console.warn("Failed to persist academic profile draft to localStorage", err);
  }
}

export function getAcademicProfileDraft(): any | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACADEMIC_PROFILE_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearAcademicProfileDraft(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ACADEMIC_PROFILE_DRAFT_KEY);
  } catch {
    // Ignore
  }
}
