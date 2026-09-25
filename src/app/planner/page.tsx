"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth/context";
import { useTheme } from "@/lib/theme/context";
import { useTranslation } from "@/lib/i18n/context";
import { StudentService } from "@/lib/services";
import { AppShell } from "@/components/ui/AppShell";
import { useFocus } from "@/context/FocusContext";
import { PlannerStorage } from "@/lib/planner/storage";
import { PlannerService } from "@/lib/planner/planner-service";
import { NotificationService } from "@/lib/planner/notification-service";
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
  AddTaskModal,
  AiPlannerModal,
  StudySessionModal,
  DailyReflectionModal,
  NotificationsPanel,
  PostponeModal,
} from "@/components/planner";

export default function PlannerPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { locale } = useTranslation();
  const { startSession, openFocusMode } = useFocus();
  const isGirls = theme === "girls";

  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Student Profile State
  const [studentName, setStudentName] = useState<string>("");
  const [streamId, setStreamId] = useState<string>("sciences_exp");
  const [streamNameAr, setStreamNameAr] = useState<string>("علوم تجريبية");
  const [targetScore, setTargetScore] = useState<number>(15.5);

  // Selected date & view state
  const [selectedDateIso, setSelectedDateIso] = useState<string>(todayIso);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");

  // Planner Data
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [todayReflection, setTodayReflection] = useState<DailyReflection | null>(null);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>({
    morning_brief: true,
    task_reminders: true,
    evening_reflection: true,
    spiritual_reminders: true,
    advance_notice_minutes: 15,
  });
  const [notifications, setNotifications] = useState<PlannerNotification[]>([]);

  // Modals state
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAiPlannerOpen, setIsAiPlannerOpen] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [activeSessionEvent, setActiveSessionEvent] = useState<PlannerEvent | null>(null);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isPostponeOpen, setIsPostponeOpen] = useState(false);
  const [postponeEvent, setPostponeEvent] = useState<PlannerEvent | null>(null);

  // 1. Initial Load of Student Profile
  useEffect(() => {
    if (user?.id) {
      StudentService.getProfile(user.id).then((p) => {
        if (p) {
          if (p.firstName) setStudentName(p.firstName);
          if (p.streamId) setStreamId(p.streamId);
          if (p.targetScore) setTargetScore(p.targetScore);
        }
      });
    }
  }, [user]);

  // Update stream name in Arabic based on streamId
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

  // 2. Load Events, Reflection, Preferences
  const refreshData = () => {
    const allEvents = PlannerStorage.getEvents();
    setEvents(allEvents);

    const ref = PlannerStorage.getReflection(todayIso);
    setTodayReflection(ref);

    const prefs = PlannerStorage.getNotificationPreferences();
    setNotificationPrefs(prefs);

    const smartNotifs = NotificationService.generateSmartNotifications(allEvents, prefs);
    setNotifications(smartNotifs);
  };

  useEffect(() => {
    refreshData();
  }, [todayIso]);

  // 3. Computed items
  const filteredEvents = useMemo(() => {
    return events.filter((e) => e.date === selectedDateIso);
  }, [events, selectedDateIso]);

  const weeklyStats: PlannerWeeklyStats = useMemo(() => {
    return PlannerService.getWeeklyStats(events);
  }, [events]);

  // Daily Objectives
  const dailyObjectives: DailyObjective[] = useMemo(() => {
    return filteredEvents.map((evt) => ({
      id: evt.id,
      title: evt.title,
      durationMinutes: evt.duration_minutes,
      completed: evt.status === "completed",
      subjectName: evt.subject_id,
    }));
  }, [filteredEvents]);

  // Today's Bilan Metrics
  const todayEvents = useMemo(() => {
    return events.filter((e) => e.date === todayIso);
  }, [events, todayIso]);

  const todayCompletedEvents = todayEvents.filter((e) => e.status === "completed");
  const studyMinutesToday = todayCompletedEvents.reduce(
    (sum, e) => sum + (e.actual_minutes_spent || e.duration_minutes || 0),
    0
  );

  const unreadNotificationCount = notifications.filter((n) => !n.is_read).length;

  // Formatted date labels
  const dateObj = new Date(selectedDateIso + "T00:00:00");
  const formattedDateFr = dateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const formattedDateAr = dateObj.toLocaleDateString("ar-DZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // 4. Action Handlers
  const handleToggleComplete = (id: string) => {
    const updated = PlannerService.toggleEventCompleted(id);
    if (updated) {
      refreshData();
    }
  };

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

  const handleCompleteSession = (eventId: string, actualMinutes: number) => {
    PlannerService.logStudySession(eventId, actualMinutes, true);
    refreshData();
  };

  const handleOpenPostpone = (event: PlannerEvent) => {
    setPostponeEvent(event);
    setIsPostponeOpen(true);
  };

  const handleConfirmPostpone = (
    eventId: string,
    newDate: string,
    newStartTime?: string,
    reason?: string
  ) => {
    PlannerService.postponeEvent(eventId, newDate, newStartTime, reason);
    refreshData();
  };

  const handleDeleteEvent = (id: string) => {
    PlannerStorage.deleteEvent(id);
    refreshData();
  };

  const handleAddTask = (
    taskData: Omit<PlannerEvent, "id" | "created_at" | "updated_at">
  ) => {
    PlannerStorage.saveEvent(taskData);
    refreshData();
  };

  const handleAcceptAiPlan = (
    newEvents: Omit<PlannerEvent, "id" | "created_at" | "updated_at">[]
  ) => {
    PlannerStorage.bulkSaveEvents(newEvents);
    refreshData();
  };

  const handleSaveReflection = (
    reflectionData: Omit<DailyReflection, "id" | "created_at" | "updated_at">
  ) => {
    PlannerStorage.saveReflection(reflectionData);
    refreshData();
  };

  const handleToggleObjective = (id: string) => {
    handleToggleComplete(id);
  };

  const handleAddObjective = (title: string, durationMinutes?: number) => {
    handleAddTask({
      user_id: user?.id || "local_user",
      title,
      event_type: "study",
      date: selectedDateIso,
      duration_minutes: durationMinutes || 30,
      priority: "medium",
      status: "pending",
      is_ai_generated: false,
    });
  };

  const handleUpdateTargetScore = (newScore: number) => {
    setTargetScore(newScore);
    if (user?.id) {
      StudentService.getProfile(user.id).then((p) => {
        if (p) {
          StudentService.saveProfile({ ...p, targetScore: newScore }, user.id);
        }
      });
    }
  };

  const handleToggleSpiritual = (enabled: boolean) => {
    const updated = { ...notificationPrefs, spiritual_reminders: enabled };
    setNotificationPrefs(updated);
    PlannerStorage.saveNotificationPreferences(updated);
    refreshData();
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  return (
    <AppShell activeNav="planner">
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* 1. Hero Section (Greeting, BAC Target, Quick Action Buttons) */}
        <PlannerHero
          studentName={studentName}
          streamNameAr={streamNameAr}
          bacTargetScore={targetScore}
          onUpdateTargetScore={handleUpdateTargetScore}
          onOpenAddTask={() => setIsAddTaskOpen(true)}
          onOpenAiPlanner={() => setIsAiPlannerOpen(true)}
        />

        {/* 2. Date Navigation Strip */}
        <DayWeekStrip
          selectedDate={selectedDateIso}
          onSelectDate={setSelectedDateIso}
          viewMode={viewMode}
          onChangeViewMode={setViewMode}
          notificationCount={unreadNotificationCount}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />

        {/* 3. Main Two-Column Clean Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (2/3): Objectives & Daily Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Objectives Checklist */}
            <TodayObjectivesCard
              objectives={dailyObjectives}
              onToggleObjective={handleToggleObjective}
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
              studyMinutesToday={studyMinutesToday}
              tasksCompletedToday={todayCompletedEvents.length}
              tasksTotalToday={todayEvents.length}
              estimatedAverage={14.5}
              streakDays={weeklyStats.currentStreak}
              reflectionToday={todayReflection}
              onOpenReflectionModal={() => setIsReflectionOpen(true)}
            />
          </div>
        </div>
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
    </AppShell>
  );
}
