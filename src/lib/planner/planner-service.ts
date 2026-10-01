/**
 * SHATER Planner — Core Application Service
 * Orchestrates tasks, study sessions, status transitions, metrics, and streak calculations.
 * Authoritative: Calculates all metrics from real database data without fake minimums.
 */

import {
  PlannerEvent,
  StudySession,
  DailyReflection,
  PlannerStats,
  PlannerWeeklyStats,
  StreamSubjectProgress,
  WeeklyReviewData,
} from "./types";
import { PlannerStorage } from "./storage";
import { getAlgeriaDateString, calculateAuthoritativeStreak, getAlgeriaWeekDays } from "./algeria-date";
import { StreamId, SubjectId } from "@/types/education";
import { ALL_SUBJECTS, getStreamSubjects, ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";

export { getStreamSubjects, getAlgeriaDateString as getTodayDateString };

export const PlannerService = {
  /**
   * Get all events for a user, optionally filtered by date
   */
  async getEvents(date?: string, userId?: string): Promise<PlannerEvent[]> {
    const all = await PlannerStorage.loadEvents(userId);
    if (date) {
      return all.filter((e) => e.date === date);
    }
    return all;
  },

  /**
   * Create a new task / event
   */
  async createEvent(
    eventInput: Omit<PlannerEvent, "id" | "createdAt" | "updatedAt">
  ): Promise<PlannerEvent> {
    return await PlannerStorage.saveEvent(eventInput);
  },

  /**
   * Update an existing task / event
   */
  async updateEvent(event: PlannerEvent): Promise<PlannerEvent> {
    return await PlannerStorage.saveEvent({
      ...event,
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  },

  /**
   * Toggle event status between TODO and COMPLETED
   */
  async toggleEventCompletion(eventId: string, userId?: string): Promise<PlannerEvent | null> {
    const events = await PlannerStorage.loadEvents(userId);
    const target = events.find((e) => e.id === eventId);
    if (!target) return null;

    const isDone = target.status === "COMPLETED" || target.status === "completed";
    const nextStatus = isDone ? "TODO" : "COMPLETED";
    const nowIso = new Date().toISOString();

    const updated: PlannerEvent = {
      ...target,
      status: nextStatus,
      completedAt: nextStatus === "COMPLETED" ? nowIso : undefined,
      completed_at: nextStatus === "COMPLETED" ? nowIso : undefined,
      updatedAt: nowIso,
      updated_at: nowIso,
    };

    return await PlannerStorage.saveEvent(updated);
  },

  toggleEventCompleted(eventId: string, userId?: string): PlannerEvent | null {
    const events = PlannerStorage.getEvents(userId);
    const target = events.find((e) => e.id === eventId);
    if (!target) return null;

    const isDone = target.status === "COMPLETED" || target.status === "completed";
    const nextStatus = isDone ? "TODO" : "COMPLETED";
    const nowIso = new Date().toISOString();

    const updated: PlannerEvent = {
      ...target,
      status: nextStatus,
      completedAt: nextStatus === "COMPLETED" ? nowIso : undefined,
      completed_at: nextStatus === "COMPLETED" ? nowIso : undefined,
      updatedAt: nowIso,
      updated_at: nowIso,
    };

    PlannerStorage.saveEvent(updated);
    return updated;
  },

  /**
   * Postpone an event to a new date and optional time (Phase 8: maintains history)
   */
  async postponeEvent(
    eventId: string,
    newDate: string,
    newStartTime?: string,
    reason?: string,
    userId?: string
  ): Promise<PlannerEvent | null> {
    const events = await PlannerStorage.loadEvents(userId);
    const target = events.find((e) => e.id === eventId);
    if (!target) return null;

    const reasonNote = reason ? ` (أُجلت من ${target.date}: ${reason})` : ` (أُجلت من ${target.date})`;
    const updated: any = {
      ...target,
      id: target.id,
      date: newDate,
      startTime: newStartTime || target.startTime,
      start_time: newStartTime || target.start_time,
      status: "TODO",
      new_date: newDate,
      new_start_time: newStartTime,
      reschedule_reason: reason,
      notes: target.notes ? `${target.notes}${reasonNote}` : reasonNote.trim(),
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return await PlannerStorage.saveEvent(updated);
  },

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string, userId?: string): Promise<void> {
    await PlannerStorage.deleteEvent(eventId, userId);
  },

  /**
   * Calculate real-time statistics for today and the current week from actual database records.
   * Invariant: ZERO hardcoded minimums or mock baselines.
   */
  async calculateStats(userId?: string, streamId: StreamId = "sciences_exp"): Promise<PlannerStats> {
    const today = getAlgeriaDateString();
    const events = await PlannerStorage.loadEvents(userId);
    const sessions = await PlannerStorage.loadStudySessions(userId);
    const reflections = await PlannerStorage.loadReflections(userId);

    // 1. Today's real completed tasks & minutes
    const todayEvents = events.filter((e) => e.date === today);
    const todayCompleted = todayEvents.filter((e) => e.status === "COMPLETED" || e.status === "completed");

    const todaySessionMinutes = Math.round(
      sessions
        .filter((s) => s.startedAt?.startsWith(today) || s.started_at?.startsWith(today))
        .reduce((acc, s) => acc + (s.actualDurationSeconds || s.actual_duration_seconds || 0), 0) / 60
    );
    const todayTaskMinutes = todayCompleted.reduce((acc, e) => acc + (e.duration_minutes || e.durationMinutes || 0), 0);
    const todayStudyMinutes = Math.max(todaySessionMinutes, todayTaskMinutes);

    // 2. Week's boundaries (Saturday to Friday)
    const weekDays = getAlgeriaWeekDays(today);
    const weekStartIso = weekDays[0]?.date || today;

    const weekEvents = events.filter((e) => e.date >= weekStartIso);
    const weekCompleted = weekEvents.filter((e) => e.status === "COMPLETED" || e.status === "completed");

    const weekSessionMinutes = Math.round(
      sessions
        .filter((s) => (s.startedAt || s.started_at || "") >= weekStartIso)
        .reduce((acc, s) => acc + (s.actualDurationSeconds || s.actual_duration_seconds || 0), 0) / 60
    );
    const weekTaskMinutes = weekCompleted.reduce((acc, e) => acc + (e.duration_minutes || e.durationMinutes || 0), 0);
    const weekStudyMinutes = Math.max(weekSessionMinutes, weekTaskMinutes);

    const workedSubjects = new Set<string>();
    for (const e of weekCompleted) {
      const sId = e.subjectId || e.subject_id;
      if (sId) workedSubjects.add(sId);
    }
    for (const s of sessions) {
      if ((s.startedAt || s.started_at || "") >= weekStartIso && (s.subjectId || s.subject_id)) {
        workedSubjects.add(s.subjectId || s.subject_id!);
      }
    }

    // 3. Real authoritative streak
    const streak = calculateAuthoritativeStreak(events, sessions, reflections, today);

    const totalWeek = weekEvents.length;
    const completedWeek = weekCompleted.length;
    const progressRate = totalWeek > 0 ? Math.round((completedWeek / totalWeek) * 100) : 0;

    return {
      todayCompletedCount: todayCompleted.length,
      todayTotalCount: todayEvents.length,
      todayStudyTimeMinutes: todayStudyMinutes,
      weekCompletedCount: completedWeek,
      weekTotalCount: totalWeek,
      weekStudyTimeMinutes: weekStudyMinutes,
      weekSubjectsCount: workedSubjects.size,
      weekProgressDelta: progressRate,
      streakDays: streak,
      quizAverageScore: 0,
    };
  },

  /**
   * Weekly stats calculation strictly from actual data (no fake numbers)
   */
  getWeeklyStats(eventsList?: PlannerEvent[], sessionsList?: StudySession[]): PlannerWeeklyStats {
    const events = eventsList || PlannerStorage.getEvents();
    const today = getAlgeriaDateString();
    const weekDays = getAlgeriaWeekDays(today);
    const weekStartIso = weekDays[0]?.date || today;

    const weekEvents = events.filter((e) => e.date >= weekStartIso);
    const total = weekEvents.length;
    const completed = weekEvents.filter((e) => e.status === "COMPLETED" || e.status === "completed").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const totalMins = weekEvents
      .filter((e) => e.status === "COMPLETED" || e.status === "completed")
      .reduce((sum, e) => sum + (e.actualMinutesSpent || e.actual_minutes_spent || e.durationMinutes || e.duration_minutes || 0), 0);

    const uniqueSubjects = new Set(
      weekEvents
        .filter((e) => e.status === "COMPLETED" || e.status === "completed")
        .map((e) => e.subjectId || e.subject_id)
        .filter(Boolean)
    );

    const streak = calculateAuthoritativeStreak(events, sessionsList || [], [], today);

    return {
      completedTasks: completed,
      totalTasks: total,
      completionRate: rate,
      totalStudyMinutes: totalMins,
      subjectsStudiedCount: uniqueSubjects.size,
      weeklyProgressRate: rate,
      currentStreak: streak,
    };
  },

  /**
   * Get progress for subjects of the active student stream based on actual study time
   */
  getStreamSubjectProgress(
    streamId: StreamId | string = "sciences_exp",
    events: PlannerEvent[] = [],
    sessions: StudySession[] = []
  ): StreamSubjectProgress[] {
    const rawStream = (streamId === "sciences" ? "sciences_exp" : streamId) as StreamId;
    const rules = getStreamSubjects(rawStream) || [];

    const colors: Record<string, string> = {
      math: "bg-blue-500",
      physics: "bg-purple-500",
      natural_sciences: "bg-emerald-500",
      arabic: "bg-amber-500",
      philosophy: "bg-indigo-500",
      french: "bg-pink-500",
      english: "bg-cyan-500",
      islamic_studies: "bg-teal-500",
      history_geography: "bg-orange-500",
      accounting_finance: "bg-blue-600",
      economics_management: "bg-amber-600",
      law: "bg-rose-500",
      civil_eng: "bg-stone-500",
      mechanical_eng: "bg-slate-600",
      electrical_eng: "bg-yellow-500",
      process_eng: "bg-violet-600",
      third_language: "bg-emerald-600",
      art_specialty: "bg-fuchsia-500",
      art_history: "bg-rose-600",
    };

    return rules.map((r) => {
      const subjId = r.subjectId as SubjectId;
      const subjMeta = ALL_SUBJECTS[subjId];

      const completedEvents = events.filter(
        (e) => (e.status === "COMPLETED" || e.status === "completed") && (e.subjectId === subjId || e.subject_id === subjId)
      );
      const taskMinutes = completedEvents.reduce(
        (sum, e) => sum + (e.durationMinutes || e.duration_minutes || 0),
        0
      );

      const subjSessions = sessions.filter((s) => s.subjectId === subjId || s.subject_id === subjId);
      const sessionMinutes = Math.round(
        subjSessions.reduce((sum, s) => sum + (s.actualDurationSeconds || s.actual_duration_seconds || 0), 0) / 60
      );

      const actualMinutes = Math.max(taskMinutes, sessionMinutes);
      const targetMinutes = Math.max(r.coefficient * 60, 120);
      const progressPercent = Math.min(Math.round((actualMinutes / targetMinutes) * 100), 100);

      return {
        subjectId: subjId,
        subjectName: subjMeta?.name_fr || subjId,
        subjectNameAr: subjMeta?.name_ar || subjId,
        nameFr: subjMeta?.name_fr || subjId,
        nameAr: subjMeta?.name_ar || subjId,
        coefficient: r.coefficient,
        isCore: r.isCoreSubject,
        minutesCompleted: actualMinutes,
        targetMinutes,
        progressPercentage: progressPercent,
        progressPercent,
        color: colors[subjId] || "bg-blue-500",
      };
    });
  },

  /**
   * Log a study session with persistence
   */
  async logStudySession(
    eventId: string | null,
    actualMinutes: number,
    completed: boolean = true,
    subjectId: string = "math",
    streamId: string = "sciences_exp",
    notes?: string
  ): Promise<StudySession> {
    const now = new Date();
    const durationSec = actualMinutes * 60;
    const startedAt = new Date(now.getTime() - durationSec * 1000).toISOString();

    const session: StudySession = {
      id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      eventId: eventId || undefined,
      event_id: eventId || undefined,
      streamId,
      stream_id: streamId,
      subjectId,
      subject_id: subjectId,
      plannedDurationMinutes: actualMinutes,
      planned_duration_minutes: actualMinutes,
      actualDurationSeconds: durationSec,
      actual_duration_seconds: durationSec,
      startedAt,
      started_at: startedAt,
      endedAt: now.toISOString(),
      ended_at: now.toISOString(),
      status: completed ? "COMPLETED" : "ABANDONED",
      notes,
      createdAt: now.toISOString(),
      created_at: now.toISOString(),
    };

    return await PlannerStorage.saveStudySession(session);
  },

  /**
   * Record a daily reflection
   */
  async recordReflection(
    date: string,
    learnedToday: string,
    mood: string,
    hardestChallenge?: string,
    tomorrowGoal?: string
  ): Promise<DailyReflection> {
    const reflection: DailyReflection = {
      id: `refl-${Date.now()}`,
      date,
      what_learned: learnedToday,
      whatLearned: learnedToday,
      learned_today: learnedToday,
      day_mood: (mood || "GOOD").toUpperCase() as any,
      dayMood: (mood || "GOOD").toUpperCase() as any,
      mood: mood as any,
      hardest_part: hardestChallenge,
      hardestPart: hardestChallenge,
      hardest_challenge: hardestChallenge,
      tomorrow_goal: tomorrowGoal,
      tomorrowGoal: tomorrowGoal,
    };

    return await PlannerStorage.saveReflection(reflection);
  },
};
