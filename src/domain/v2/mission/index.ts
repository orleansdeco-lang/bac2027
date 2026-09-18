/**
 * BAC Mastery V2 — Canonical Mission Contracts
 * 
 * INVARIANT:
 * 6 Mission Types.
 * 4 Duration Classes: MICRO (5–10m), SHORT (10–20m), STANDARD (20–35m), DEEP (35–60m).
 * Universal 15-minute mission assumption is strictly rejected.
 */

import { MissionId, SkillId, QuestionId, StudentId } from "../ids";
import { SubjectId, StreamId } from "@/types/education";
import { DeterministicDecision } from "../decision";

// --- 6 Canonical Mission Types ---

export const CANONICAL_MISSION_TYPES = [
  "new_concept",
  "repair",
  "review",
  "exam_transfer",
  "mastery_verification",
  "diagnostic_followup",
] as const;

export type CanonicalMissionType = (typeof CANONICAL_MISSION_TYPES)[number];

export function isCanonicalMissionType(val: unknown): val is CanonicalMissionType {
  return typeof val === "string" && (CANONICAL_MISSION_TYPES as readonly string[]).includes(val);
}

// --- 4 Canonical Duration Classes ---

export const MISSION_DURATION_CLASSES = ["MICRO", "SHORT", "STANDARD", "DEEP"] as const;
export type MissionDurationClass = (typeof MISSION_DURATION_CLASSES)[number];

export interface DurationBounds {
  min: number;
  max: number;
}

export const DURATION_CLASS_BOUNDS: Record<MissionDurationClass, DurationBounds> = {
  MICRO: { min: 5, max: 10 },
  SHORT: { min: 10, max: 20 },
  STANDARD: { min: 20, max: 35 },
  DEEP: { min: 35, max: 60 },
};

export function classifyDurationMinutes(minutes: number): MissionDurationClass {
  if (minutes < 10) return "MICRO";
  if (minutes < 20) return "SHORT";
  if (minutes <= 35) return "STANDARD";
  return "DEEP";
}

export function validateDurationClassMinutes(durationClass: MissionDurationClass, minutes: number): boolean {
  const bounds = DURATION_CLASS_BOUNDS[durationClass];
  return minutes >= bounds.min && minutes <= bounds.max;
}

export interface CanonicalMission {
  id: MissionId;
  studentId: StudentId;
  targetSkillId: SkillId;
  subjectId: SubjectId;
  streamId: StreamId;
  missionType: CanonicalMissionType;
  durationClass: MissionDurationClass;
  estimatedMinutes: number;
  decisionRef?: DeterministicDecision;
  prerequisiteSkillIds: SkillId[];
  practiceQuestionIds: QuestionId[];
  retestQuestionIds?: QuestionId[];
  status: "available" | "in_progress" | "completed" | "abandoned";
  createdAt: string;
  completedAt?: string;
}
