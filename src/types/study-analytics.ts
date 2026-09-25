/**
 * SHATER Study OS — Analytics Types
 * Phase 5: Clear distinction between Study Activity and Real Learning Progress
 * across Today, This Week, and Long-Term horizons.
 */

import { SubjectId, StreamId } from "@/types/education";

export type AnalyticsTimeHorizon = "today" | "week" | "longTerm";

export interface DailyActivityPoint {
  date: string;         // "YYYY-MM-DD"
  dayNameAr: string;    // "السبت", "الأحد", etc.
  actualMinutes: number;
  targetMinutes: number;
  sessionsCount: number;
}

export interface SubjectFocusPoint {
  subjectId: string;
  nameAr: string;
  hexColor: string;
  coefficient: number;
  focusMinutes: number;
  percentage: number;
  sessionsCount: number;
}

export interface UnresolvedWeakness {
  errorId: string;
  skillId: string;
  subjectId: string;
  subjectNameAr: string;
  skillTitleAr: string;
  rootCauseAr?: string;
  occurredAt: string;
  repairStatus: "identified" | "repair_started";
  actionUrl: string;
}

export interface StudyActivityMetrics {
  focusMinutes: number;
  targetMinutes: number;
  sessionsCount: number;
  activeDaysCount: number;
  subjectsStudiedCount: number;
  dailyDistribution: DailyActivityPoint[];
  subjectDistribution: SubjectFocusPoint[];
  currentStreakDays: number;
  longestStreakDays: number;
}

export interface LearningProgressMetrics {
  repairedErrorsCount: number;
  retestSuccessCount: number;
  completedMissionsCount: number;
  demonstratedSkillsCount: number;
  emergingSkillsCount: number;
  unresolvedWeaknesses: UnresolvedWeakness[];
  totalCurriculumSkillsCount: number;
  demonstratedMasteryPercentage: number;
}

export interface HorizonReport {
  horizon: AnalyticsTimeHorizon;
  labelAr: string;
  activity: StudyActivityMetrics;
  learning: LearningProgressMetrics;
}

export interface StudyOsAnalyticsReport {
  generatedAt: string;
  streamId: StreamId;
  streamNameAr: string;
  today: HorizonReport;
  week: HorizonReport;
  longTerm: HorizonReport;
}
