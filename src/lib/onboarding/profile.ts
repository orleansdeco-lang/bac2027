import { OnboardingDraft, StrategicProfile } from "../../types/onboarding";

export const ONBOARDING_DRAFT_KEY = "bac_mastery_onboarding_draft";
export const STRATEGIC_PROFILE_KEY = "bac_mastery_strategic_profile";
export const REGISTRATION_DRAFT_KEY = "bac_mastery_registration_draft";
export const ACADEMIC_PROFILE_DRAFT_KEY = "bac_mastery_academic_draft";
export const GUEST_DRAFT_KEY = "bac_mastery_guest_draft";

/**
 * Derives a strictly scoped LocalStorage key.
 * If userId is provided, keys are isolated per user: `${baseKey}:${userId}`
 * If unauthenticated, returns null for authenticated keys, or guest key for onboarding.
 */
export function getScopedKey(baseKey: string, userId?: string | null): string | null {
  if (userId && typeof userId === "string" && userId.trim() !== "") {
    return `${baseKey}:${userId.trim()}`;
  }
  if (baseKey === ONBOARDING_DRAFT_KEY) {
    return GUEST_DRAFT_KEY;
  }
  return null;
}

/**
 * Builds a validated StrategicProfile from onboarding draft data.
 */
export function buildStrategicProfile(draft: OnboardingDraft, userId?: string): StrategicProfile {
  if (!draft.streamId) {
    throw new Error("Cannot build StrategicProfile without a streamId");
  }

  return {
    id: userId || `profile_${Date.now()}`,
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
 * LocalStorage Helpers for Draft state (scoped by userId)
 * Unauthenticated onboarding strictly uses GUEST_DRAFT_KEY.
 * Authenticated onboarding uses ONBOARDING_DRAFT_KEY:${userId}.
 */
export function saveOnboardingDraft(draft: OnboardingDraft, userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const key = getScopedKey(ONBOARDING_DRAFT_KEY, userId);
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(draft));
  } catch (err) {
    console.warn("Failed to persist onboarding draft to localStorage", err);
  }
}

export function getOnboardingDraft(userId?: string | null): OnboardingDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const key = getScopedKey(ONBOARDING_DRAFT_KEY, userId);
    if (!key) return null;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingDraft;
  } catch {
    return null;
  }
}

export function clearOnboardingDraft(userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    const key = getScopedKey(ONBOARDING_DRAFT_KEY, userId);
    if (key) {
      localStorage.removeItem(key);
    }
    localStorage.removeItem(ONBOARDING_DRAFT_KEY);
    localStorage.removeItem(GUEST_DRAFT_KEY);
  } catch {
    // Ignore
  }
}

/**
 * LocalStorage Helpers for Completed Strategic Profile (strictly scoped by userId)
 * Missing or empty userId will NOT write or read any profile from localStorage.
 */
export function saveStrategicProfile(profile: StrategicProfile, userId?: string | null): void {
  if (typeof window === "undefined") return;
  const effectiveId = (userId && typeof userId === "string" && userId.trim() !== "")
    ? userId.trim()
    : (profile.id && !profile.id.startsWith("profile_") ? profile.id.trim() : null);

  if (!effectiveId) return;

  try {
    const key = `${STRATEGIC_PROFILE_KEY}:${effectiveId}`;
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (err) {
    console.warn("Failed to persist strategic profile to localStorage", err);
  }
}

export function getStrategicProfile(userId?: string | null): StrategicProfile | null {
  if (typeof window === "undefined") return null;
  const effectiveId = (userId && typeof userId === "string" && userId.trim() !== "") ? userId.trim() : null;

  try {
    if (effectiveId) {
      const key = `${STRATEGIC_PROFILE_KEY}:${effectiveId}`;
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw) as StrategicProfile;
    }

    // Fallback to legacy or unscoped keys
    const fallbackKeys = [
      STRATEGIC_PROFILE_KEY,
      "bac_mastery_student_profile",
      "bac_student_profile",
      "bac_strategic_profile",
    ];
    for (const fbKey of fallbackKeys) {
      const raw = localStorage.getItem(fbKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            if (!effectiveId || !parsed.id || parsed.id === effectiveId || String(parsed.id).startsWith("profile_")) {
              return parsed as StrategicProfile;
            }
          }
        } catch {}
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function clearStrategicProfile(userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (userId && typeof userId === "string" && userId.trim() !== "") {
      localStorage.removeItem(`${STRATEGIC_PROFILE_KEY}:${userId.trim()}`);
    }
    localStorage.removeItem(STRATEGIC_PROFILE_KEY);
    localStorage.removeItem("bac_mastery_student_profile");
    localStorage.removeItem("bac_student_profile");
    localStorage.removeItem("bac_strategic_profile");
  } catch {
    // Ignore
  }
}

/**
 * LocalStorage Helpers for Registration Draft (strictly scoped by userId)
 * NEVER accepts unauthenticated or arbitrary unscoped storage.
 */
export function saveRegistrationDraft(draft: any, userId?: string | null): void {
  if (typeof window === "undefined") return;
  if (!userId || typeof userId !== "string" || userId.trim() === "") return;

  try {
    const key = `${REGISTRATION_DRAFT_KEY}:${userId.trim()}`;
    localStorage.setItem(key, JSON.stringify(draft));
  } catch (err) {
    console.warn("Failed to persist registration draft to localStorage", err);
  }
}

export function getRegistrationDraft(userId?: string | null): any | null {
  if (typeof window === "undefined") return null;
  const effectiveId = (userId && typeof userId === "string" && userId.trim() !== "") ? userId.trim() : null;

  try {
    if (effectiveId) {
      const key = `${REGISTRATION_DRAFT_KEY}:${effectiveId}`;
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    }
    const legacyRaw = localStorage.getItem(REGISTRATION_DRAFT_KEY);
    if (legacyRaw) return JSON.parse(legacyRaw);
    return null;
  } catch {
    return null;
  }
}

export function clearRegistrationDraft(userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (userId && typeof userId === "string" && userId.trim() !== "") {
      localStorage.removeItem(`${REGISTRATION_DRAFT_KEY}:${userId.trim()}`);
    }
    localStorage.removeItem(REGISTRATION_DRAFT_KEY);
  } catch {
    // Ignore
  }
}

/**
 * LocalStorage Helpers for Academic Profile Draft (strictly scoped by userId)
 * NEVER accepts unauthenticated or arbitrary unscoped storage.
 */
export function saveAcademicProfileDraft(draft: any, userId?: string | null): void {
  if (typeof window === "undefined") return;
  if (!userId || typeof userId !== "string" || userId.trim() === "") return;

  try {
    const key = `${ACADEMIC_PROFILE_DRAFT_KEY}:${userId.trim()}`;
    localStorage.setItem(key, JSON.stringify(draft));
  } catch (err) {
    console.warn("Failed to persist academic profile draft to localStorage", err);
  }
}

export function getAcademicProfileDraft(userId?: string | null): any | null {
  if (typeof window === "undefined") return null;
  const effectiveId = (userId && typeof userId === "string" && userId.trim() !== "") ? userId.trim() : null;

  try {
    if (effectiveId) {
      const key = `${ACADEMIC_PROFILE_DRAFT_KEY}:${effectiveId}`;
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    }
    const legacyRaw = localStorage.getItem(ACADEMIC_PROFILE_DRAFT_KEY) || localStorage.getItem("bac_academic_profile_draft");
    if (legacyRaw) return JSON.parse(legacyRaw);
    return null;
  } catch {
    return null;
  }
}

export function clearAcademicProfileDraft(userId?: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (userId && typeof userId === "string" && userId.trim() !== "") {
      localStorage.removeItem(`${ACADEMIC_PROFILE_DRAFT_KEY}:${userId.trim()}`);
    }
    localStorage.removeItem(ACADEMIC_PROFILE_DRAFT_KEY);
    localStorage.removeItem("bac_academic_profile_draft");
  } catch {
    // Ignore
  }
}

/**
 * Purge all legacy global unscoped keys across the application
 */
export function purgeLegacyGlobalStorage(): void {
  if (typeof window === "undefined") return;
  const legacyKeys = [
    ONBOARDING_DRAFT_KEY,
    STRATEGIC_PROFILE_KEY,
    REGISTRATION_DRAFT_KEY,
    ACADEMIC_PROFILE_DRAFT_KEY,
    GUEST_DRAFT_KEY,
    "bac_mastery_student_profile",
    "bac_student_profile",
    "bac_strategic_profile",
    "bac_academic_profile_draft",
    "bac_mastery_guest_draft:guest",
    `${ONBOARDING_DRAFT_KEY}:guest`,
    `${STRATEGIC_PROFILE_KEY}:guest`,
    `${REGISTRATION_DRAFT_KEY}:guest`,
    `${ACADEMIC_PROFILE_DRAFT_KEY}:guest`,
    "bac_mastery_diagnostic_session",
    "bac_mastery_diagnostic_results",
  ];

  legacyKeys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  });
}

/**
 * Purge storage scoped strictly to a given user
 */
export function purgeUserScopedStorage(userId: string): void {
  if (typeof window === "undefined" || !userId) return;
  const trimmedId = userId.trim();
  clearRegistrationDraft(trimmedId);
  clearAcademicProfileDraft(trimmedId);
  clearStrategicProfile(trimmedId);
  clearOnboardingDraft(trimmedId);

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.endsWith(`:${trimmedId}`) || k.includes(`:${trimmedId}:`))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch {}
    });
  } catch {}
}

/**
 * Combined purge for explicit cleanup routines
 */
export function purgeUserAndLegacyStorage(userId?: string): void {
  if (typeof window === "undefined") return;
  if (userId) {
    purgeUserScopedStorage(userId);
  }
  purgeLegacyGlobalStorage();
}
