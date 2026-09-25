/**
 * SHATER Study OS — High-Precision Focus Engine Type Definitions
 * Invariant: Timestamp-anchored precision, drift-immune, single active session enforcement
 */

import { StreamId, SubjectId } from "./education";

export type FocusTimerMode = "stopwatch" | "25m" | "50m" | "90m" | "custom";

export type FocusSessionStatus =
  | "running"
  | "paused"
  | "reflecting"
  | "completed"
  | "abandoned";

export type ProductivityRating = "weak" | "average" | "good" | "excellent";

export interface ActiveFocusSession {
  /** Canonical UUID conforming to public.study_sessions(id) */
  id: string;
  userId: string;
  mode: FocusTimerMode;
  targetDurationMinutes: number; // 0 for stopwatch, 25/50/90 or custom
  subjectId: SubjectId | string;
  subjectNameAr: string;
  subjectNameFr: string;
  subjectHex: string;
  streamId: StreamId | string;
  skillId?: string;
  eventId?: string;
  taskTitle?: string;
  missionId?: string;

  /** Timestamp-based Truth: Prevents JavaScript setInterval drift */
  startedAt: string; // ISO 8601 string
  startedAtTimestamp: number; // Unix timestamp in ms
  currentStretchStartTimestamp: number | null; // Unix timestamp when last resumed/started
  accumulatedElapsedSeconds: number; // Total seconds accumulated across pauses
  pausedAtTimestamp: number | null; // Unix timestamp when paused

  status: FocusSessionStatus;
  interruptionsCount: number;

  /** Session Reflection data */
  productivityRating?: ProductivityRating;
  studentReflection?: string;
}

export interface StartSessionOptions {
  mode: FocusTimerMode;
  targetDurationMinutes?: number;
  subjectId: SubjectId | string;
  streamId?: StreamId | string;
  skillId?: string;
  eventId?: string;
  taskTitle?: string;
  missionId?: string;
}

export interface CompletedSessionSummary {
  id: string;
  subjectId: string;
  subjectNameAr: string;
  actualDurationSeconds: number;
  plannedDurationMinutes: number;
  productivityRating?: ProductivityRating;
  studentReflection?: string;
  completedAt: string;
  linkedTaskTitle?: string;
}
