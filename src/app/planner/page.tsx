"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/lib/auth/context";
import { useTheme } from "@/lib/theme/context";
import { useTranslation } from "@/lib/i18n/context";
import { AppShell } from "@/components/ui/AppShell";
import { useFocus } from "@/context/FocusContext";
import { PlannerStorage } from "@/lib/planner/storage";
import { PlannerService } from "@/lib/planner/planner-service";
import { NotificationService } from "@/lib/planner/notification-service";
import { useEntitlements } from "@/lib/access/useEntitlements";
import { PaywallModal } from "@/components/paywall/PaywallModal";
import { getAlgeriaDateString, getAlgeriaWeekDays } from "@/lib/planner/algeria-date";
import { ALL_SUBJECTS } from "@/lib/constants/streams";
import { SubjectId } from "@/types/education";
import {
  PlannerEvent,
  PlannerWeeklyStats,
  DailyReflection,
  NotificationPreferences,
  PlannerNotification,
} from "@/lib/planner/types";

import {
  PlannerHero,
  DayWeekStrip,
  TodayObjectivesCard,
  DailyObjective,
  DailyTimeline,
  TodayBilanSummary,
  WeeklyStatsGrid,
  AddTaskModal,
  AiPlannerModal,
  StudySessionModal,
  DailyReflectionModal,
  NotificationsPanel,
  PostponeModal,
} from "@/components/planner";
import { RefreshCw, AlertCircle, BookOpen, Calendar, Clock } from "lucide-react";

export default function PlannerPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { locale } = useTranslation();
  const { startSession, openFocusMode } = useFocus();
  const isGirls = theme === "girls";

  const todayIso = useMemo(() => getAlgeriaDateString(), []);

  // Student Profile State
  const [studentName, setStudentName] = useState<string>("");
  const [streamId, setStreamId] = useState<string>("sciences_exp");
  const [streamNameAr, setStreamNameAr] = useState<string>("علوم تجريبية");
  const [targetScore, setTargetScore] = useState<number>(16.0);

  // Selected date & view state
  const [selectedDateIso, setSelectedDateIso] = useState<string>(todayIso);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");

  // Loading & Error States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Authoritative Planner Data
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [todayReflection, setTodayReflection] = useState<DailyReflection | null>(null);
  const [authoritativeStreak, setAuthoritativeStreak] = useState<number>(0);
  const [authoritativeMinutesToday, setAuthoritativeMinutesToday] = useState<number>(0);
  const [serverWeeklyStats, setServerWeeklyStats] = useState<PlannerWeeklyStats | null>(null);

  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    morning_brief: true,
    task_reminders: true,
    evening_reflection: true,
    spiritual_reminders: true,
    advance_notice_minutes: 15,
  });
  const [notifications, setNotifications] = useState<PlannerNotification[]>([]);

  // Modals state
  const { canAccess } = useEntitlements();
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [activeSessionEvent, setActiveSessionEvent] = useState<PlannerEvent | null>(null);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPostponeOpen, setIsPostponeOpen] = useState(false);
  const [postponeEvent, setPostponeEvent] = useState<PlannerEvent | null>(null);

  // Stream name mapping in Arabic
  useEffect(() => {
    const map: Record<string, string> = {
      sciences_exp: "علوم تجريبية",
      sciences: "علوم تجريبية",
      math: "رياضيات",
      technique_math: "تقني رياضي",
      gestion_eco: "تسيير واقتصاد",
      lettres_philo: "آداب وفلسفة",
      langues_etrangeres: "لغات أجنبية",
    };
    setStreamNameAr(map[streamId] || "علوم تجريبية");
  }, [streamId]);

  // =========================================================================
  // AUTHORITATIVE DATA FETCHING (/api/planner)
  // =========================================================================
  const loadPlannerData = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/planner", {
        headers: { "Cache-Control": "no-cache" },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const loadedEvents: PlannerEvent[] = data.events || [];
          setEvents(loadedEvents);
          setTodayReflection(data.todayReflection || null);
          setAuthoritativeStreak(data.streakDays ?? 0);
          setAuthoritativeMinutesToday(data.todayStudyMinutes ?? 0);

          if (data.weeklyStats) {
            setServerWeeklyStats(data.weeklyStats);
          }

          if (data.preferences) {
            setNotificationPrefs({
              morning_brief: data.preferences.morning_brief ?? true,
              task_reminders: data.preferences.task_reminders ?? true,
              evening_reflection: data.preferences.evening_reflection ?? true,
              spiritual_reminders: data.preferences.spiritual_reminders ?? true,
              advance_notice_minutes: data.preferences.advance_notice_minutes ?? 15,
            });
          }

          if (data.profile) {
            if (data.profile.stream_id) setStreamId(data.profile.stream_id);
            if (data.profile.target_score) setTargetScore(data.profile.target_score);
            if (data.profile.first_name) setStudentName(data.profile.first_name);
          }

          // Cache locally for offline resilience
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem("shater_planner_events_default", JSON.stringify(loadedEvents));
            }
          } catch {}

          const smartNotifs = NotificationService.generateSmartNotifications(
            loadedEvents,
            data.preferences || {
              morning_brief: true,
              task_reminders: true,
              evening_reflection: true,
              spiritual_reminders: true,
              advance_notice_minutes: 15,
            }
          );
          setNotifications(smartNotifs);
          return;
        }
      }

      // If unauthenticated or backend error, gracefully fallback to local cache
      const localEvents = PlannerStorage.getEvents();
      setEvents(localEvents);
      const localRef = PlannerStorage.getReflection(todayIso);
      setTodayReflection(localRef);
    } catch (err: any) {
      console.warn("[PlannerPage] Could not load from server, using local fallback:", err);
      const localEvents = PlannerStorage.getEvents();
      setEvents(localEvents);
      setTodayReflection(PlannerStorage.getReflection(todayIso));
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [todayIso]);

  useEffect(() => {
    loadPlannerData(true);
  }, [loadPlannerData, user?.id]);

  // =========================================================================
  // COMPUTED VIEWS
  // =========================================================================
  const filteredEvents = useMemo(() => {
    return events.filter((e) => e.date === selectedDateIso);
  }, [events, selectedDateIso]);

  const weeklyStats: PlannerWeeklyStats = useMemo(() => {
    if (serverWeeklyStats) return serverWeeklyStats;
    return PlannerService.getWeeklyStats(events);
  }, [serverWeeklyStats, events]);

  // Daily Objectives for checklist
  const dailyObjectives: DailyObjective[] = useMemo(() => {
    return filteredEvents.map((evt) => ({
      id: evt.id,
      title: evt.title,
      durationMinutes: evt.duration_minutes,
      completed: evt.status === "completed",
      subjectName: evt.subject_id
        ? ALL_SUBJECTS[evt.subject_id as SubjectId]?.name_ar || evt.subject_id
        : undefined,
    }));
  }, [filteredEvents]);

  // Today's Bilan Metrics
  const todayEvents = useMemo(() => {
    return events.filter((e) => e.date === todayIso);
  }, [events, todayIso]);

  const todayCompletedEvents = todayEvents.filter((e) => e.status === "completed");

  const unreadNotificationCount = notifications.filter((n) => !n.is_read).length;

  // Formatted date labels in Algerian Arabic
  const [sy, sm, sd] = selectedDateIso.split("-").map(Number);
  const selectedDateObj = new Date(Date.UTC(sy, sm - 1, sd, 12, 0, 0));
  const formattedDateAr = new Intl.DateTimeFormat("ar-DZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(selectedDateObj);
  const formattedDateFr = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(selectedDateObj);

  // =========================================================================
  // SERVER-AUTHORITATIVE MUTATION HANDLERS
  // =========================================================================

  // 1. Toggle Event Completed
  const handleToggleComplete = async (id: string) => {
    const target = events.find((e) => e.id === id);
    if (!target) return;

    const nextStatus = target.status === "completed" ? "TODO" : "COMPLETED";

    // Optimistic UI update
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: nextStatus.toLowerCase() as any } : e))
    );

    try {
      const res = await fetch(`/api/planner/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        console.warn("Failed to patch event status on server");
      }
    } catch (err) {
      console.error("Network error toggling event:", err);
    }

    // Refresh authoritative state in background
    loadPlannerData(false);
  };

  // 2. Add New Task / Event
  const handleAddTask = async (
    taskData: Omit<PlannerEvent, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const res = await fetch("/api/planner/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskData.title,
          type: taskData.type || taskData.event_type || "STUDY",
          date: taskData.date || selectedDateIso,
          start_time: taskData.start_time || taskData.startTime || "18:00",
          duration_minutes: taskData.duration_minutes || taskData.durationMinutes || 45,
          subject_id: taskData.subject_id || taskData.subjectId || null,
          stream_id: streamId,
          priority: taskData.priority || "MEDIUM",
          notes: taskData.description,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل حفظ المهمة في الخادم.");
      }

      await loadPlannerData(false);
    } catch (err: any) {
      console.warn("Falling back to local storage for task creation:", err);
      PlannerStorage.saveEvent(taskData);
      setEvents(PlannerStorage.getEvents());
    }
  };

  // 3. Confirm Postpone / Reschedule
  const handleConfirmPostpone = async (
    eventId: string,
    newDate: string,
    newStartTime?: string,
    reason?: string
  ) => {
    try {
      const res = await fetch(`/api/planner/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newDate,
          start_time: newStartTime || "18:00",
          status: "POSTPONED",
          notes: reason ? `مؤجل: ${reason}` : undefined,
        }),
      });

      if (!res.ok) {
        console.warn("Failed to postpone event on server");
      }
    } catch (err) {
      console.error("Network error postponing event:", err);
      PlannerService.postponeEvent(eventId, newDate, newStartTime, reason);
    }

    await loadPlannerData(false);
  };

  // 4. Delete Event
  const handleDeleteEvent = async (id: string) => {
    // Optimistic UI update
    setEvents((prev) => prev.filter((e) => e.id !== id));
    PlannerStorage.deleteEvent(id);

    try {
      await fetch(`/api/planner/events/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Error deleting event on server:", err);
    }
  };

  // 5. Start Focus Session
  const handleStartSession = (event: PlannerEvent) => {
    startSession({
      eventId: event.id,
      subjectId: event.subject_id || "math",
      taskTitle: event.title,
      targetDurationMinutes: event.duration_minutes || 30,
      mode: event.duration_minutes ? "custom" : "25m",
      streamId: streamId,
    });
    openFocusMode();
  };

  // 6. Complete Focus Session (Persisted to study_sessions)
  const handleCompleteSession = async (eventId: string, actualMinutes: number) => {
    try {
      await fetch("/api/planner/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          durationMinutes: actualMinutes,
          completed: true,
          date: todayIso,
        }),
      });
    } catch (err) {
      console.error("Error logging study session on server:", err);
      PlannerService.logStudySession(eventId, actualMinutes, true);
    }

    await loadPlannerData(false);
  };

  // 7. Save Daily Reflection (Persisted to daily_reflections)
  const handleSaveReflection = async (
    reflectionData: Omit<DailyReflection, "id" | "created_at" | "updated_at">
  ) => {
    try {
      const res = await fetch("/api/planner/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: reflectionData.date || todayIso,
          mood: reflectionData.mood || "good",
          learned_today: reflectionData.learned_today,
          hardest_challenge: reflectionData.hardest_challenge,
          tomorrow_goal: reflectionData.tomorrow_goal,
          gratitude_note: reflectionData.gratitude_note,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTodayReflection(data.reflection);
      }
    } catch (err) {
      console.error("Error saving reflection on server:", err);
      PlannerStorage.saveReflection(reflectionData);
      setTodayReflection(PlannerStorage.getReflection(todayIso));
    }

    await loadPlannerData(false);
  };

  // 8. Accept AI Proposal
  const handleAcceptAiPlan = async (
    newEvents: Omit<PlannerEvent, "id" | "created_at" | "updated_at">[]
  ) => {
    // AiPlannerModal already commits via /api/planner/ai-proposal action='commit'
    // Refresh authoritative state
    await loadPlannerData(false);
  };

  // 9. Update Target Score
  const handleUpdateTargetScore = async (newScore: number) => {
    setTargetScore(newScore);
    try {
      await fetch("/api/planner/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetScore: newScore }),
      });
    } catch (err) {
      console.error("Error updating target score:", err);
    }
  };

  const handleOpenPostpone = (event: PlannerEvent) => {
    setPostponeEvent(event);
    setIsPostponeOpen(true);
  };

  const handleToggleSpiritual = async (enabled: boolean) => {
    const updated = { ...notificationPrefs, spiritual_reminders: enabled };
    setNotificationPrefs(updated);
    try {
      await fetch("/api/planner/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spiritual_reminders: enabled }),
      });
    } catch (err) {
      PlannerStorage.saveNotificationPreferences(updated);
    }
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleAddObjective = (title: string, durationMinutes?: number) => {
    handleAddTask({
      title,
      event_type: "study",
      date: selectedDateIso,
      duration_minutes: durationMinutes || 30,
      priority: "medium",
      status: "pending",
      is_ai_generated: false,
    });
  };

  return (
    <AppShell activeNav="planner">
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center p-3 rounded-2xl bg-surface border border-theme text-xs font-bold text-theme-secondary gap-2 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--color-primary)]" />
            <span>جاري تحميل بيانات المخطط الدراسي من قاعدة البيانات...</span>
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-bold flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => loadPlannerData(true)}
              className="px-3 py-1 rounded-xl bg-red-600 text-white text-[11px] font-bold cursor-pointer"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* 1. Hero Section (Greeting, BAC Target, Stream, Quick Action Buttons) */}
        <PlannerHero
          studentName={studentName}
          streamNameAr={streamNameAr}
          bacTargetScore={targetScore}
          onUpdateTargetScore={handleUpdateTargetScore}
          onOpenAddTask={() => setIsAddTaskOpen(true)}
          onOpenAiPlanner={() => {
            if (!canAccess("PLANNER_PRO_AI")) {
              setIsPaywallOpen(true);
            } else {
              setIsAiPlannerOpen(true);
            }
          }}
        />

        {/* 2. Date Navigation Strip (Algeria Saturday-first Calendar) */}
        <DayWeekStrip
          selectedDate={selectedDateIso}
          onSelectDate={setSelectedDateIso}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          notificationCount={unreadNotificationCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        {/* 3. Conditional View: Day View vs Week View */}
        {viewMode === "week" ? (
          /* WEEK VIEW (Phase 9) */
          <div className="space-y-6">
            <WeeklyStatsGrid stats={weeklyStats} />

            {/* Week Schedule Overview Cards */}
            <div className="rounded-3xl border border-theme bg-card p-5 sm:p-6 shadow-clay text-start">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
                  <h3 className="text-base sm:text-lg font-black text-theme-text font-sans">
                    توزيع جدول الأسبوع بالكامل
                  </h3>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-surface border border-theme text-theme-secondary font-mono">
                  {events.length} مهمة مسجلة
                </span>
              </div>

              {/* 7 Days Column Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
                {getAlgeriaWeekDays(selectedDateIso, selectedDateIso).map((dayInfo) => {
                  const dayStr = dayInfo.date;
                  const dayEvents = events.filter((e) => e.date === dayStr);
                  const isDaySelected = dayInfo.isSelected;
                  const isToday = dayInfo.isToday;
                  const dayNameAr = dayInfo.nameAr;
                  const dd = dayInfo.dayNumber;

                  return (
                    <div
                      key={dayStr}
                      onClick={() => {
                        setSelectedDateIso(dayStr);
                        setViewMode("day");
                      }}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between min-h-[160px] ${
                        isDaySelected
                          ? "bg-surface border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20"
                          : isToday
                          ? "bg-surface/80 border-[var(--color-primary)]/40"
                          : "bg-surface/50 border-theme hover:border-theme-strong"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-theme-text">{dayNameAr}</span>
                          <span className="text-[11px] font-mono text-theme-secondary">{dd}</span>
                        </div>

                        <div className="space-y-1.5">
                          {dayEvents.slice(0, 3).map((evt) => (
                            <div
                              key={evt.id}
                              className={`text-[10px] p-1.5 rounded-lg border truncate font-medium ${
                                evt.status === "completed"
                                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 line-through"
                                  : "bg-card border-theme text-theme-text"
                              }`}
                            >
                              {evt.title}
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-[9px] font-bold text-theme-muted text-center">
                              +{dayEvents.length - 3} مهام أخرى
                            </div>
                          )}
                          {dayEvents.length === 0 && (
                            <div className="text-[10px] text-theme-muted text-center py-4">
                              فارغ
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 text-[10px] font-mono text-theme-muted text-center border-t border-theme/40">
                        {dayEvents.reduce((s, e) => s + (e.duration_minutes || 0), 0)} دقيقة
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* DAY VIEW (Phase 5: "واش ندير اليوم؟") */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column (2/3): Objectives & Daily Timeline */}
            <div className="lg:col-span-2 space-y-6">
              {/* Today's Objectives Checklist */}
              <TodayObjectivesCard
                objectives={dailyObjectives}
                onToggleObjective={handleToggleComplete}
                onAddObjective={handleAddObjective}
                onDeleteObjective={handleDeleteEvent}
              />

              {/* Daily Timeline */}
              <DailyTimeline
                dateIso={selectedDateIso}
                formattedDateFr={formattedDateFr}
                formattedDateAr={formattedDateAr}
                events={filteredEvents}
                onToggleComplete={handleToggleComplete}
                onStartSession={handleStartSession}
                onPostpone={handleOpenPostpone}
                onDelete={handleDeleteEvent}
                onOpenAddTask={() => setIsAddTaskOpen(true)}
                onOpenAiPlanner={() => setIsAiPlannerOpen(true)}
              />
            </div>

            {/* Side Column (1/3): Today Bilan & Evening Reflection */}
            <div className="space-y-6">
              <TodayBilanSummary
                studyMinutesToday={authoritativeMinutesToday}
                tasksCompletedToday={todayCompletedEvents.length}
                tasksTotalToday={todayEvents.length}
                streakDays={authoritativeStreak}
                reflectionToday={todayReflection}
                onOpenReflectionModal={() => setIsReflectionOpen(true)}
              />

              {/* Mini Weekly Recap in Day View */}
              <div className="p-4 rounded-3xl border border-theme bg-card shadow-clay text-start">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-theme-text">توزيع الأسبوع</span>
                  <button
                    type="button"
                    onClick={() => setViewMode("week")}
                    className="text-[11px] font-bold text-[var(--color-primary)] hover:underline cursor-pointer"
                  >
                    عرض التفاصيل ←
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-surface border border-theme">
                    <span className="text-[10px] text-theme-muted block mb-0.5">وقت المذاكرة</span>
                    <span className="font-bold text-theme-text">
                      {Math.floor(weeklyStats.totalStudyMinutes / 60)} سا {weeklyStats.totalStudyMinutes % 60} د
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface border border-theme">
                    <span className="text-[10px] text-theme-muted block mb-0.5">المهام المنجزة</span>
                    <span className="font-bold text-theme-text">
                      {weeklyStats.completedTasks} من {weeklyStats.totalTasks}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAddTask={handleAddTask}
        initialDateIso={selectedDateIso}
        streamId={streamId}
      />

      <AiPlannerModal
        isOpen={isAiPlannerOpen}
        onClose={() => setIsAiPlannerOpen(false)}
        onAcceptPlan={handleAcceptAiPlan}
        streamId={streamId}
        startDateIso={selectedDateIso}
      />

      <StudySessionModal
        isOpen={isSessionOpen}
        event={activeSessionEvent}
        onClose={() => setIsSessionOpen(false)}
        onCompleteSession={handleCompleteSession}
      />

      <DailyReflectionModal
        isOpen={isReflectionOpen}
        onClose={() => setIsReflectionOpen(false)}
        onSaveReflection={handleSaveReflection}
        currentReflection={todayReflection}
        dateIso={todayIso}
      />

      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        preferences={notificationPrefs}
        onToggleSpiritual={handleToggleSpiritual}
        onMarkRead={handleMarkNotificationRead}
      />

      <PostponeModal
        isOpen={isPostponeOpen}
        event={postponeEvent}
        onClose={() => setIsPostponeOpen(false)}
        onConfirmPostpone={handleConfirmPostpone}
      />

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        feature="PLANNER_PRO_AI"
      />
    </AppShell>
  );
}
