"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { TeacherEscalationModal } from "@/components/ui/TeacherEscalationModal";
import { DashboardService } from "@/lib/services";
import { StudentDashboardData } from "@/lib/services/dashboard-service";
import { MustWinService, MustWinSummary, MustWinItem } from "@/lib/study-os/must-win-service";
import { PlannerStorage } from "@/lib/planner/storage";
import { PlannerService } from "@/lib/planner/planner-service";
import { PlannerEvent } from "@/lib/planner/types";
import { trackEvent } from "@/lib/analytics";
import { getStudentAccess } from "@/lib/access";
import { useLearningAccessGate, useUserProgress } from "@/lib/hooks";
import { useFocus } from "@/context/FocusContext";
import { ALL_SUBJECTS } from "@/lib/constants/streams";
import { SubjectId } from "@/types/education";
import {
  normalizeStreamIdWithDefault,
  getStreamMetadata,
  isSubjectAuthorizedForStream,
  getDefaultSubjectForStream,
  getDefaultSkillForStream,
  getDefaultSkillTitleForStream,
} from "@/lib/curriculum/filter";
import { validateContentStreamCompatibility } from "@/domain/student";

import {
  TodayHeader,
  NowActionCard,
  TodayPlanAgenda,
  MustWinSection,
  AcademicSnapshot,
  SubjectHealthCard,
  NeedsAttentionCard,
  RoadPositionCard,
  QuickOperatingBar,
} from "@/components/dashboard";

import {
  Compass,
  AlertTriangle,
  RefreshCw,
  ShieldCheck,
  FileText,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export default function DashboardPage() {
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const { theme } = useTheme();
  const gate = useLearningAccessGate();
  const { masteredCount, totalStudyTimeSeconds } = useUserProgress();
  const {
    isSessionActive,
    activeSession,
    formattedElapsed,
    formattedRemaining,
    isRunning,
    openFocusMode,
    startSession,
  } = useFocus();

  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [mustWinSummary, setMustWinSummary] = useState<MustWinSummary | null>(null);
  const [personalEvents, setPersonalEvents] = useState<PlannerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [mustWinLoading, setMustWinLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);

  const NextArrow = isAr ? ArrowLeft : ArrowRight;
  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], []);
  const streamId = normalizeStreamIdWithDefault(
    gate.profile?.streamId || (gate.profile as any)?.stream,
    "sciences_exp"
  );

  // Offline network detector
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  // Subject display name resolver
  const getSubjectName = useCallback((subjectId?: string) => {
    if (!subjectId) return isAr ? "مادة دراسية" : "Discipline";
    const mappedId =
      subjectId === "science" ? "natural_sciences" :
      subjectId === "mathematics" ? "math" :
      subjectId;
    const subj = ALL_SUBJECTS[mappedId as SubjectId];
    if (subj) return isAr ? subj.name_ar : subj.name_fr;
    return subjectId;
  }, [isAr]);

  // Unified Dashboard Data Loader (Single Request Pipeline)
  const loadDashboard = useCallback(async () => {
    if (!gate.isAuthorized || !gate.profile) return;
    setLoading(true);
    setMustWinLoading(true);
    setError(null);

    try {
      // 1. Single authoritative fetch from DashboardService
      const dashData = await DashboardService.getDashboardData(gate.profile.id);
      setData(dashData);

      // 2. Filter today's planner events from preloaded dashData.plannerEvents
      const allEvents: PlannerEvent[] = dashData.plannerEvents || [];
      const todays = allEvents.filter(
        (e) => (e.date === todayIso || e.start_time) && e.status !== "cancelled"
      );
      setPersonalEvents(todays);

      // 3. Compute Must-Win 3 reusing preloaded dashData (0 duplicate network requests)
      const mwSummary = await MustWinService.getMustWinObjectives(
        gate.profile.id,
        todayIso,
        dashData
      );
      setMustWinSummary(mwSummary);

      trackEvent("dashboard_viewed", {
        streamId: normalizeStreamIdWithDefault(gate.profile.streamId),
      });
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setError(err?.message || (isAr ? "تعذر تحميل لوحة التحكم" : "Échec du chargement"));
    } finally {
      setLoading(false);
      setMustWinLoading(false);
    }
  }, [gate.isAuthorized, gate.profile, isAr, todayIso]);

  // Load and auto-invalidate on stream or auth changes
  useEffect(() => {
    if (gate.isAuthorized) {
      loadDashboard();
    } else if (!gate.isLoading) {
      setLoading(false);
    }
  }, [gate.isAuthorized, gate.isLoading, gate.profile?.streamId, loadDashboard]);

  // Lightweight refresh for local planner events without re-fetching entire dashboard
  const refreshLocalPlannerEvents = useCallback(async () => {
    if (!gate.profile?.id) return;
    try {
      const allEvents = await PlannerStorage.loadEvents(gate.profile.id);
      const todays = allEvents.filter(
        (e) => (e.date === todayIso || e.start_time) && e.status !== "cancelled"
      );
      setPersonalEvents(todays);

      // Re-derive Must-Win with current in-memory dashboard data
      if (data) {
        const updatedData = { ...data, plannerEvents: allEvents };
        const updatedMw = await MustWinService.getMustWinObjectives(
          gate.profile.id,
          todayIso,
          updatedData
        );
        setMustWinSummary(updatedMw);
      }
    } catch (err) {
      console.error("Failed to refresh planner events:", err);
    }
  }, [gate.profile?.id, todayIso, data]);

  // Handle Must-Win item completion toggle
  const handleToggleMustWin = useCallback(async (item: MustWinItem) => {
    if (item.plannerEventId) {
      PlannerService.toggleEventCompleted(item.plannerEventId);
      await refreshLocalPlannerEvents();
    } else {
      setMustWinSummary((prev) => {
        if (!prev) return prev;
        const updatedItems = prev.items.map((it) =>
          it.id === item.id
            ? {
                ...it,
                isCompleted: !it.isCompleted,
                status: it.isCompleted ? ("pending" as const) : ("completed" as const),
              }
            : it
        );
        const compCount = updatedItems.filter((i) => i.isCompleted).length;
        return { ...prev, items: updatedItems, completedCount: compCount };
      });
    }
  }, [refreshLocalPlannerEvents]);

  // Handle launching focus session from mission
  const handleStartMissionFocus = useCallback((missionObj: any) => {
    if (!missionObj) return;
    startSession({
      mode: missionObj.estimatedMinutes ? "custom" : "25m",
      targetDurationMinutes: missionObj.estimatedMinutes || 25,
      subjectId: missionObj.subjectId,
      skillId: missionObj.mission?.skillId || missionObj.skillId,
      missionId: missionObj.mission?.id,
      taskTitle: isAr ? missionObj.skillTitle_ar : missionObj.skillTitle_fr,
      streamId: streamId,
    });
    openFocusMode();
  }, [isAr, startSession, openFocusMode, streamId]);

  // Restrained Skeleton Loading State (no layout jumping)
  if (gate.isLoading || loading) {
    return (
      <AppShell>
        <Container size="xl" className="py-6 max-w-6xl mx-auto space-y-5">
          <div className="h-16 rounded-2xl bg-surface border border-theme animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-7 h-56 rounded-2xl bg-surface border border-theme animate-pulse" />
            <div className="lg:col-span-5 h-56 rounded-2xl bg-surface border border-theme animate-pulse" />
          </div>
          <div className="h-44 rounded-2xl bg-surface border border-theme animate-pulse" />
        </Container>
      </AppShell>
    );
  }

  // Error State (honest error screen with retry)
  if (error && !data) {
    return (
      <AppShell>
        <div className="min-h-[50vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 sm:p-7 rounded-2xl bg-card border border-rose-500/30 text-center space-y-3.5 shadow-xs">
            <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
            <h2 className="text-base font-bold text-theme-text">
              {isAr ? "ما قدرناش نحملو بيانات لوحة التحكم" : "Échec du chargement des données"}
            </h2>
            <p className="text-xs text-theme-secondary leading-relaxed">
              {isAr
                ? "حاول مرة أخرى أو تحقق من اتصالك بالإنترنت."
                : "Veuillez réessayer ou vérifier votre connexion internet."}
            </p>
            <div className="pt-1">
              <Button
                variant="primary"
                onClick={() => loadDashboard()}
                className="font-bold text-xs w-full rounded-xl py-2"
              >
                <RefreshCw className="w-3.5 h-3.5 ml-1.5" />
                <span>{isAr ? "إعادة المحاولة" : "Réessayer"}</span>
              </Button>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!gate.isAuthorized) {
    return null;
  }

  // Authentic Student Identity & Stream Resolution
  const profile = gate.profile;
  const firstName =
    profile?.firstName ||
    (profile?.fullName ? profile.fullName.trim().split(" ")[0] : null) ||
    (isAr ? "طالبنا العزيز" : "Élève");

  const activeStreamMeta = getStreamMetadata(streamId);

  // Target and current scores with Semantic Nulls (Zero fake metrics)
  const targetScore: number | null = profile?.targetScore ?? null;
  const currentScore: number | null = data?.roadPosition?.currentScore ?? null;
  const gap: number | null =
    data?.roadPosition?.gap ??
    (targetScore !== null && currentScore !== null
      ? Math.max(0, Math.round((targetScore - currentScore) * 10) / 10)
      : null);

  // Authoritative mission verification (no cross-stream leakage)
  const rawTodaysMission = data?.todaysMission;
  const isMissionAuthorized = rawTodaysMission?.subjectId
    ? isSubjectAuthorizedForStream(rawTodaysMission.subjectId, streamId) &&
      validateContentStreamCompatibility(streamId, {
        skillId: rawTodaysMission.mission?.skillId || "",
        subjectId: rawTodaysMission.subjectId,
      })
    : false;
  const todaysMission = isMissionAuthorized ? rawTodaysMission : null;

  const rawUpNext = data?.upNext;
  const isUpNextAuthorized = rawUpNext?.subjectId
    ? isSubjectAuthorizedForStream(rawUpNext.subjectId, streamId) &&
      validateContentStreamCompatibility(streamId, {
        skillId: rawUpNext.mission?.skillId || "",
        subjectId: rawUpNext.subjectId,
      })
    : false;
  const upNextMission = isUpNextAuthorized ? rawUpNext : null;

  // Real verified metrics
  const metrics = data?.verifiedMetrics || {
    demonstratedSkillsCount: 0,
    emergingSkillsCount: 0,
    activeRepairsCount: 0,
    completedMissionsCount: 0,
  };

  const demonstratedCount = Math.max(metrics.demonstratedSkillsCount, masteredCount);

  // Entitlement access check
  const access = getStudentAccess(profile);

  // Subject Coefficient for Today's Mission
  const currentMissionRule = gate.streamSubjects.find((r) => r.subjectId === todaysMission?.subjectId);
  const currentMissionCoeff = currentMissionRule?.coefficient;

  // Orientation Header Statistics
  const plannedTasksCount =
    (todaysMission?.mission ? 1 : 0) +
    (upNextMission?.mission ? 1 : 0) +
    personalEvents.length;

  const totalPlannedMinutes =
    (todaysMission?.estimatedMinutes || 0) +
    (upNextMission?.estimatedMinutes || 0) +
    personalEvents.reduce((acc, e) => acc + (e.duration_minutes || e.durationMinutes || 30), 0);

  const completedTasksCount = personalEvents.filter((e) => e.status === "completed").length;

  return (
    <AppShell activeNav="home">
      <Container size="xl" className="py-4 md:py-6 max-w-6xl mx-auto space-y-5">
        
        {/* ================================================================= */}
        {/* SECTION 1 — TODAY HEADER (Subtle greeting, date, stream, status)   */}
        {/* ================================================================= */}
        <TodayHeader
          studentName={firstName}
          streamNameAr={activeStreamMeta.name_ar}
          streamNameFr={activeStreamMeta.name_fr}
          isAr={isAr}
          plannedTasksCount={plannedTasksCount}
          totalPlannedMinutes={totalPlannedMinutes}
          completedTasksCount={completedTasksCount}
          accessStatus={access.status}
          remainingHours={access.remainingHours}
          isOffline={isOffline}
          rejectedReason={(profile as any)?.rejection_reason || (profile as any)?.rejectionReason}
        />

        {/* ================================================================= */}
        {/* SECTIONS 2 & 3 & 6: PRIMARY "NOW" + WHY THIS MISSION + SCORE/GOAL  */}
        {/* Desktop: NOW (7 cols) + Academic Snapshot (5 cols)                */}
        {/* Mobile: NOW -> Academic Snapshot                                  */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* NOW / PRIMARY ACTION (with Section 3: Why this mission?) */}
          <div className="lg:col-span-7">
            <NowActionCard
              isSessionActive={isSessionActive}
              activeSession={activeSession}
              formattedElapsed={formattedElapsed}
              formattedRemaining={formattedRemaining}
              isRunning={isRunning}
              openFocusMode={openFocusMode}
              hasCompletedDiagnostic={Boolean(data?.hasCompletedDiagnostic)}
              todaysMission={todaysMission}
              isAr={isAr}
              onStartFocus={handleStartMissionFocus}
              subjectName={getSubjectName(todaysMission?.subjectId)}
              subjectCoeff={currentMissionCoeff}
            />
          </div>

          {/* SECTION 6 & 10: ACADEMIC SNAPSHOT & SCORE/TARGET PRESENTATION */}
          <div className="lg:col-span-5">
            <AcademicSnapshot
              demonstratedSkills={demonstratedCount}
              totalSkills={activeStreamMeta.totalSkills}
              currentScore={currentScore}
              targetScore={targetScore}
              gap={gap}
              totalStudyTimeSeconds={totalStudyTimeSeconds}
              completedMissionsCount={metrics.completedMissionsCount}
              activeRepairsCount={metrics.activeRepairsCount}
              isAr={isAr}
            />
          </div>

        </div>

        {/* ================================================================= */}
        {/* SECTION 4 — TODAY PLAN (Clean chronological agenda)               */}
        {/* ================================================================= */}
        <TodayPlanAgenda
          todaysMission={todaysMission}
          upNextMission={upNextMission}
          personalEvents={personalEvents}
          userId={profile?.id || ""}
          streamId={streamId}
          isAr={isAr}
          onRefreshEvents={refreshLocalPlannerEvents}
          getSubjectName={getSubjectName}
        />

        {/* ================================================================= */}
        {/* SECTIONS 5 & 7: MUST WIN (لازم نكملهم) + SUBJECT HEALTH           */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* SECTION 5: MUST WIN (01, 02, 03 checklist) */}
          <div className="lg:col-span-7">
            <MustWinSection
              summary={mustWinSummary}
              isLoading={mustWinLoading}
              isAr={isAr}
              onToggleComplete={handleToggleMustWin}
            />
          </div>

          {/* SECTION 7: SUBJECT HEALTH (Subject, coefficient, honest status) */}
          <div className="lg:col-span-5">
            <SubjectHealthCard
              streamSubjects={gate.streamSubjects}
              masteryMap={data?.masteryMap || {}}
              errorsMap={data?.errorsMap || {}}
              isAr={isAr}
            />
          </div>

        </div>

        {/* ================================================================= */}
        {/* SECTIONS 8 & 9: NEEDS ATTENTION + ROAD POSITION                   */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* SECTION 8: NEEDS ATTENTION (Active errors & bottlenecks) */}
          <div className="lg:col-span-7">
            <NeedsAttentionCard
              errorsMap={data?.errorsMap || {}}
              diagnosticResult={data?.diagnosticResult}
              isAr={isAr}
            />
          </div>

          {/* SECTION 9: ROAD POSITION (Compact progress track) */}
          <div className="lg:col-span-5">
            <RoadPositionCard
              masteredCount={demonstratedCount}
              totalSkills={activeStreamMeta.totalSkills}
              currentSkillTitle={isAr ? todaysMission?.skillTitle_ar : todaysMission?.skillTitle_fr}
              isAr={isAr}
            />
          </div>

        </div>

        {/* ================================================================= */}
        {/* SECTION 10 & 14: QUICK OPERATING BAR (Text + icon daily tools)    */}
        {/* ================================================================= */}
        <QuickOperatingBar isAr={isAr} />

        {/* ================================================================= */}
        {/* SUBTLE SYSTEM FOOTER: Official Curriculum & Zero-PII Brief        */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-xl bg-surface border border-theme text-xs text-theme-muted">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {isAr
                ? "منهاج وزارة التربية الوطنية الرسمي · بكالوريا 2027 · مطابقة تامة للمعاملات"
                : "Programme officiel MEN · Session BAC 2027"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsTeacherModalOpen(true)}
            className="text-xs font-semibold text-theme-secondary hover:text-theme-text flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-theme-muted" />
            <span>{isAr ? "بطاقة التقرير البيداغوجي (Zero-PII)" : "Fiche Enseignant"}</span>
          </button>
        </div>

        {/* Teacher Escalation Modal */}
        <TeacherEscalationModal
          isOpen={isTeacherModalOpen}
          onClose={() => setIsTeacherModalOpen(false)}
          skillId={todaysMission?.mission?.skillId || getDefaultSkillForStream(streamId)}
          skillTitle={todaysMission?.skillTitle_ar || getDefaultSkillTitleForStream(streamId, isAr)}
          subjectId={(todaysMission?.subjectId as SubjectId) || getDefaultSubjectForStream(streamId)}
          streamId={streamId as any}
          locale={locale}
        />

      </Container>
    </AppShell>
  );
}
