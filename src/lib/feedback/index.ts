/**
 * BAC Mastery — Lightweight Pilot Feedback Service
 * Prompt 17 § 16: Qualitative Post-Milestone Student Feedback
 * 
 * DESIGN PRINCIPLES:
 * 1. Low friction: 4 one-tap sentiment options (سهلة / عادية / صعبة / ما فهمتش واش ندير).
 * 2. Optional qualitative commentary ("واش اللي ما عجبكش؟").
 * 3. Never blocking or intrusive.
 * 4. Stored locally with optional server syncing.
 */

import { trackEvent } from "../analytics";

export type PilotFeedbackRating = "easy" | "normal" | "hard" | "unclear";

export interface PilotFeedbackPayload {
  id?: string;
  missionId?: string;
  skillId?: string;
  rating: PilotFeedbackRating;
  feedbackNote?: string;
  userId?: string | null;
  createdAt?: string;
}

export const PILOT_FEEDBACK_STORAGE_KEY = "bac_mastery_pilot_feedback";

/**
 * Submit lightweight student feedback after a mission or milestone
 */
export function submitPilotFeedback(payload: PilotFeedbackPayload): PilotFeedbackPayload {
  const feedback: PilotFeedbackPayload = {
    id: `fb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    ...payload,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(PILOT_FEEDBACK_STORAGE_KEY);
      const existing: PilotFeedbackPayload[] = raw ? JSON.parse(raw) : [];
      localStorage.setItem(PILOT_FEEDBACK_STORAGE_KEY, JSON.stringify([...existing, feedback]));
      trackEvent("pilot_feedback_submitted", {
        rating: payload.rating,
        missionId: payload.missionId,
        skillId: payload.skillId,
        hasNote: Boolean(payload.feedbackNote),
      });
    } catch {
      // Ignore storage errors
    }
  }

  return feedback;
}

/**
 * Retrieve all buffered pilot feedback records
 */
export function getStoredPilotFeedback(): PilotFeedbackPayload[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(PILOT_FEEDBACK_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PilotFeedbackPayload[]) : [];
  } catch {
    return [];
  }
}

/**
 * Clear stored feedback records
 */
export function clearStoredPilotFeedback(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(PILOT_FEEDBACK_STORAGE_KEY);
  } catch {
    // Ignore
  }
}
