/**
 * SHATER Study OS — Focus Engine Timestamp Arithmetic & Persistence Utility
 * Principle: Timestamps are the sole source of truth. setInterval is merely a UI tick.
 */

import { ActiveFocusSession, FocusSessionStatus, ProductivityRating } from "@/types/focus";
import { ALL_SUBJECTS } from "@/lib/constants/streams";
import { SubjectId } from "@/types/education";

export const FOCUS_STORAGE_KEY = "shater_active_focus_session_v1";

/**
 * Generates an RFC4122 v4 compliant UUID for Supabase compatibility
 */
export function generateSessionUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // Fallback
    }
  }

  // RFC4122 v4 compliant fallback
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Authoritative elapsed seconds calculation derived purely from timestamps
 */
export function computeAuthoritativeElapsedSeconds(
  session: ActiveFocusSession | null,
  nowMs: number = Date.now()
): number {
  if (!session) return 0;

  if (session.status !== "running" || session.currentStretchStartTimestamp === null) {
    return session.accumulatedElapsedSeconds;
  }

  const activeDelta = Math.max(
    0,
    Math.floor((nowMs - session.currentStretchStartTimestamp) / 1000)
  );
  return session.accumulatedElapsedSeconds + activeDelta;
}

/**
 * Calculates remaining seconds for countdown modes (25, 50, 90, custom)
 */
export function computeRemainingSeconds(
  session: ActiveFocusSession | null,
  elapsedSeconds: number
): number {
  if (!session || session.targetDurationMinutes <= 0) return 0;
  const targetTotal = session.targetDurationMinutes * 60;
  return Math.max(0, targetTotal - elapsedSeconds);
}

/**
 * Formats seconds into clean monospace string (MM:SS or HH:MM:SS)
 */
export function formatMonospaceTime(totalSeconds: number): {
  formatted: string;
  hours: string;
  minutes: string;
  seconds: string;
} {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const hours = String(h).padStart(2, "0");
  const minutes = String(m).padStart(2, "0");
  const seconds = String(s).padStart(2, "0");

  const formatted = h > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`;

  return { formatted, hours, minutes, seconds };
}

/**
 * Maps subject to official SHATER color and Arabic name
 */
export function getSubjectMeta(subjectId: string): {
  nameAr: string;
  nameFr: string;
  hexColor: string;
} {
  const mappedId =
    subjectId === "science" ? "natural_sciences" :
    subjectId === "mathematics" ? "math" :
    subjectId;

  const subj = ALL_SUBJECTS[mappedId as SubjectId];

  const colorMap: Record<string, string> = {
    math: "#2563EB",
    physics: "#D97706",
    natural_sciences: "#059669",
    philosophy: "#7C3AED",
    arabic: "#0891B2",
    history_geography: "#DC2626",
    islamic_studies: "#0D9488",
    french: "#4F46E5",
    english: "#DB2777",
    technology: "#EA580C",
    civil_eng: "#EA580C",
    mechanical_eng: "#EA580C",
    electrical_eng: "#EA580C",
    process_eng: "#EA580C",
    accounting_finance: "#65A30D",
    economics_management: "#0D9488",
    law: "#475569",
    third_language: "#EC4899",
  };

  return {
    nameAr: subj?.name_ar || subjectId,
    nameFr: subj?.name_fr || subjectId,
    hexColor: colorMap[mappedId] || "#2563EB",
  };
}

/**
 * LocalStorage session persistence with schema validation
 */
export function saveActiveSessionLocal(session: ActiveFocusSession): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FOCUS_STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn("Failed to persist active focus session to localStorage", err);
  }
}

export function loadActiveSessionLocal(): ActiveFocusSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(FOCUS_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);

    // Validation invariants
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !parsed.id ||
      typeof parsed.startedAtTimestamp !== "number" ||
      typeof parsed.accumulatedElapsedSeconds !== "number"
    ) {
      clearActiveSessionLocal();
      return null;
    }

    const now = Date.now();
    // Discard stale session if older than 36 hours without completion
    if (now - parsed.startedAtTimestamp > 36 * 3600 * 1000) {
      clearActiveSessionLocal();
      return null;
    }

    return parsed as ActiveFocusSession;
  } catch {
    clearActiveSessionLocal();
    return null;
  }
}

export function clearActiveSessionLocal(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(FOCUS_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Serialize reflection rating & notes into notes field of public.study_sessions
 */
export function serializeSessionNotes(
  rating?: ProductivityRating,
  reflectionText?: string,
  taskTitle?: string
): string {
  const parts: string[] = [];
  if (rating) {
    const labelMap: Record<ProductivityRating, string> = {
      weak: "ضعيفة",
      average: "عادية",
      good: "مليحة",
      excellent: "ممتازة",
    };
    parts.push(`[تقييم الإنتاجية: ${labelMap[rating] || rating}]`);
  }
  if (taskTitle) {
    parts.push(`[الهدف: ${taskTitle}]`);
  }
  if (reflectionText && reflectionText.trim()) {
    parts.push(reflectionText.trim());
  }
  return parts.join("\n");
}
