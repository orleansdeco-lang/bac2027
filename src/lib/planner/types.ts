/**
 * SHATER Planner — Core System Type Definitions
 * Invariant: Stream-Aware, Privacy-Preserving, Offline-Capable
 */

import { StreamId, SubjectId } from "@/types/education";

export type EventType =
  | "STUDY"
  | "PRACTICE"
  | "MISSION"
  | "REVIEW"
  | "EXAM"
  | "HOMEWORK"
  | "TUTORING"
  | "SCHOOL"
  | "PERSONAL"
  | "BREAK"
  | "SPORT"
  | "SLEEP"
  | "OTHER"
  | "study"
  | "practice"
  | "mission"
  | "review"
  | "exam"
  | "homework"
  | "tutoring"
  | "school"
  | "personal"
  | "break"
  | "exam_prep"
  | "revision";

export type PlannerEventType = EventType;

export type EventPriority = "LOW" | "MEDIUM" | "HIGH" | "low" | "medium" | "high";
export type PriorityLevel = EventPriority;

export type EventStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "POSTPONED"
  | "CANCELLED"
  | "todo"
  | "in_progress"
  | "completed"
  | "postponed"
  | "cancelled"
  | "pending";

export type EventSource = "MANUAL" | "AI" | "ROADMAP" | "RECURRING" | "manual" | "ai" | "roadmap" | "recurring";

export type DayMood = "EXCELLENT" | "GOOD" | "AVERAGE" | "DIFFICULT" | "great" | "good" | "neutral" | "hard" | "tired";
export type StudentMood = DayMood;
export type ReflectionMood = StudentMood;

export type ThemePreference = "boys" | "girls" | "bac-mastery";

export type PlanningStyle = "MANUAL" | "AI_ASSISTED" | "HYBRID";

/**
 * Main Planner Event / Task
 */
export interface PlannerEvent {
  id: string;
  userId?: string;
  user_id?: string;
  title: string;
  type?: EventType;
  event_type?: EventType | string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:MM (24-hour)
  start_time?: string;
  endTime?: string; // HH:MM
  end_time?: string;
  durationMinutes?: number;
  duration_minutes?: number;
  streamId?: StreamId | string;
  stream_id?: StreamId | string;
  subjectId?: SubjectId | string;
  subject_id?: SubjectId | string;
  skillId?: string;
  skill_id?: string;
  priority?: EventPriority | string;
  status?: EventStatus | string;
  notes?: string;
  description?: string;
  source?: EventSource;
  completedAt?: string; // ISO Timestamp
  completed_at?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  actualMinutesSpent?: number;
  actual_minutes_spent?: number;
  isAiGenerated?: boolean;
  is_ai_generated?: boolean;
}

/**
 * Active Timer Study Session Record
 */
export interface StudySession {
  id: string;
  userId?: string;
  user_id?: string;
  eventId?: string;
  event_id?: string;
  streamId?: StreamId | string;
  stream_id?: StreamId | string;
  subjectId?: SubjectId | string;
  subject_id?: SubjectId | string;
  skillId?: string;
  skill_id?: string;
  plannedDurationMinutes?: number;
  planned_duration_minutes?: number;
  actualDurationSeconds?: number;
  actual_duration_seconds?: number;
  actualMinutes?: number;
  startedAt?: string;
  started_at?: string;
  endedAt?: string;
  ended_at?: string;
  status?: "COMPLETED" | "ABANDONED" | "PAUSED" | string;
  interruptionsCount?: number;
  notes?: string;
  createdAt?: string;
  created_at?: string;
}

/**
 * Daily Evening Reflection Journal
 */
export interface DailyReflection {
  id: string;
  userId?: string;
  user_id?: string;
  date: string; // YYYY-MM-DD
  whatLearned?: string;
  learned_today?: string;
  dayMood?: DayMood;
  mood?: StudentMood;
  hardestPart?: string;
  hardest_challenge?: string;
  tomorrowGoal?: string;
  tomorrow_goal?: string;
  gratitudeNote?: string;
  gratitude_note?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

/**
 * Fixed Weekly Commitment (e.g. School, Tutoring, Sport)
 */
export interface FixedCommitment {
  id: string;
  title: string;
  type: "SCHOOL" | "TUTORING" | "SPORT" | "SLEEP" | "OTHER";
  dayOfWeek: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

/**
 * Student Personal Planner Preferences
 */
export interface PlannerPreferences {
  userId?: string;
  user_id?: string;
  themePreference?: ThemePreference;
  planningStyle?: PlanningStyle;
  preferredStudyTimes?: string[];
  studyDays?: string[];
  fixedCommitments?: FixedCommitment[];
  dailyStudyTargetMinutes?: number;
  bacTargetScore?: number;
  updatedAt?: string;
  updated_at?: string;
}

/**
 * Smart Notification Engine Settings
 */
export interface NotificationPreferences {
  userId?: string;
  user_id?: string;
  morningReminder?: boolean;
  morning_brief?: boolean;
  upcomingTaskReminder?: boolean;
  task_reminders?: boolean;
  taskStartReminder?: boolean;
  completionEncouragement?: boolean;
  eveningReflectionReminder?: boolean;
  evening_reflection?: boolean;
  spiritualReminders?: boolean;
  spiritual_reminders?: boolean;
  morningTime?: string;
  eveningTime?: string;
  advance_notice_minutes?: number;
  updatedAt?: string;
  updated_at?: string;
}

/**
 * Aggregated Planner Overview Statistics
 */
export interface PlannerStats {
  todayCompletedCount: number;
  todayTotalCount: number;
  todayStudyTimeMinutes: number;
  weekCompletedCount: number;
  weekTotalCount: number;
  weekStudyTimeMinutes: number;
  weekSubjectsCount: number;
  weekProgressDelta: number;
  streakDays: number;
  quizAverageScore: number;
}

export interface PlannerWeeklyStats {
  completedTasks: number;
  totalTasks: number;
  completionRate: number;
  totalStudyMinutes: number;
  subjectsStudiedCount: number;
  weeklyProgressRate: number;
  currentStreak: number;
}

/**
 * Progress per subject for the student's stream
 */
export interface StreamSubjectProgress {
  subjectId: SubjectId | string;
  nameAr?: string;
  nameFr?: string;
  subjectName?: string;
  subjectNameAr?: string;
  coefficient?: number;
  progressPercent?: number; // 0 - 100
  progressPercentage?: number;
  masteredSkills?: number;
  totalSkills?: number;
  recommendedWeeklyHours?: number;
  minutesCompleted?: number;
  targetMinutes?: number;
  color?: string;
}

/**
 * AI Planner Input Request
 */
export interface AiPlanRequest {
  naturalPrompt?: string;
  userPrompt?: string;
  streamId?: StreamId | string;
  studentStreamId?: StreamId | string;
  startDateIso?: string;
  daysCount?: number;
  dailyHoursAvailable?: number;
  availableHoursThisWeek?: number;
  preferredDays?: string[];
  focusSubjects?: string[];
  upcomingExams?: Array<{ subjectId: string; date: string; title: string }>;
}

/**
 * Single Proposed Event from AI
 */
export interface AiProposedEvent {
  id?: string;
  title: string;
  type?: EventType;
  date: string; // YYYY-MM-DD
  dayNameFr?: string;
  startTime?: string;
  start_time?: string;
  durationMinutes?: number;
  duration_minutes?: number;
  subjectId?: SubjectId | string;
  subject_id?: SubjectId | string;
  skillId?: string;
  priority?: EventPriority | string;
  explanationAr?: string;
}

/**
 * AI Planning Proposal Response
 */
export interface AiPlanResponse {
  summaryAr?: string;
  summaryFr?: string;
  totalHoursProposed?: number;
  rationale?: string;
  proposedEvents: PlannerEvent[] | any[];
  warnings?: string[];
}

export type AiPlannerResponse = AiPlanResponse;

/**
 * Weekly Review Report Data
 */
export interface WeeklyReviewData {
  weekStartDate: string;
  weekEndDate: string;
  totalPlannedEvents: number;
  completedEvents: number;
  postponedEvents: number;
  totalStudyMinutes: number;
  sessionsCount: number;
  subjectsStudied: Array<{ subjectId: string; nameAr: string; minutes: number }>;
  streakDays: number;
  consistencyScore: number;
  aiInsightAr?: string;
}

/**
 * Notification Item for In-App Notification Center
 */
export interface PlannerNotificationItem {
  id: string;
  type: string;
  title?: string;
  titleAr?: string;
  titleFr?: string;
  message?: string;
  messageAr?: string;
  messageFr?: string;
  time?: string;
  scheduled_time?: string;
  scheduledFor?: string;
  isRead?: boolean;
  is_read?: boolean;
  actionUrl?: string;
}

export type PlannerNotification = PlannerNotificationItem;
