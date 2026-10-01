/**
 * SHATER Planner — Strict Zod Validation Schemas
 * Used by all planner API routes and server mutations
 */

import { z } from "zod";

export const ValidEventTypes = [
  "STUDY",
  "PRACTICE",
  "MISSION",
  "REVIEW",
  "EXAM",
  "HOMEWORK",
  "TUTORING",
  "SCHOOL",
  "PERSONAL",
  "BREAK",
  "SPORT",
  "SLEEP",
  "OTHER",
] as const;

export const ValidPriorities = ["LOW", "MEDIUM", "HIGH"] as const;

export const ValidEventStatuses = [
  "TODO",
  "IN_PROGRESS",
  "COMPLETED",
  "POSTPONED",
  "CANCELLED",
] as const;

export const ValidDayMoods = [
  "EXCELLENT",
  "GOOD",
  "AVERAGE",
  "DIFFICULT",
] as const;

// Normalize enum helper
export function normalizeUpperEnum<T extends readonly string[]>(
  val: any,
  allowed: T,
  fallback: T[number]
): T[number] {
  if (!val || typeof val !== "string") return fallback;
  const upper = val.trim().toUpperCase();
  return (allowed as readonly string[]).includes(upper) ? (upper as T[number]) : fallback;
}

export const CreatePlannerEventSchema = z.object({
  title: z.string().min(1, "عنوان المهمة مطلوب").max(250, "العنوان طويل جداً"),
  type: z.string().optional().default("STUDY"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ غير صالح (YYYY-MM-DD)"),
  start_time: z.string().optional().default("18:00"),
  end_time: z.string().optional(),
  duration_minutes: z.coerce.number().int().min(5).max(600).default(45),
  stream_id: z.string().optional().default("sciences_exp"),
  subject_id: z.string().optional(),
  skill_id: z.string().optional(),
  priority: z.string().optional().default("MEDIUM"),
  status: z.string().optional().default("TODO"),
  notes: z.string().max(1000).optional(),
  source: z.string().optional().default("MANUAL"),
});

export const UpdatePlannerEventSchema = z.object({
  title: z.string().min(1).max(250).optional(),
  type: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  duration_minutes: z.coerce.number().int().min(5).max(600).optional(),
  stream_id: z.string().optional(),
  subject_id: z.string().optional(),
  skill_id: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().max(1000).optional(),
  completed_at: z.string().datetime().optional().nullable(),
  // For rescheduling
  new_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  new_start_time: z.string().optional(),
  reschedule_reason: z.string().max(300).optional(),
});

export const CreateStudySessionSchema = z.object({
  event_id: z.string().uuid().optional().nullable(),
  stream_id: z.string().optional().default("sciences_exp"),
  subject_id: z.string().min(1, "المادة مطلوبة"),
  skill_id: z.string().optional().nullable(),
  planned_duration_minutes: z.coerce.number().int().min(1).max(600).default(45),
  actual_duration_seconds: z.coerce.number().int().min(0).max(86400).default(0),
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().optional().nullable(),
  status: z.enum(["COMPLETED", "ABANDONED", "PAUSED"]).default("COMPLETED"),
  interruptions_count: z.coerce.number().int().min(0).max(100).default(0),
  notes: z.string().max(1000).optional().nullable(),
  mark_event_completed: z.boolean().optional().default(true),
});

export const SaveDailyReflectionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ غير صالح (YYYY-MM-DD)"),
  what_learned: z.string().min(1, "يرجى تدوين ما استوعبته أو أنجزته اليوم").max(2000),
  day_mood: z.string().default("GOOD"),
  hardest_part: z.string().max(1000).optional().nullable(),
  tomorrow_goal: z.string().max(1000).optional().nullable(),
});

export const UpdatePlannerPreferencesSchema = z.object({
  bac_target_score: z.coerce.number().min(10).max(20).optional(),
  daily_study_target_minutes: z.coerce.number().int().min(30).max(720).optional(),
  theme_preference: z.enum(["boys", "girls", "bac-mastery"]).optional(),
  planning_style: z.enum(["MANUAL", "AI_ASSISTED", "HYBRID"]).optional(),
  spiritual_reminders: z.boolean().optional(),
});

export const AiProposalCommitSchema = z.object({
  events: z.array(CreatePlannerEventSchema).min(1, "يجب تحديد مهمة واحدة على الأقل"),
});
