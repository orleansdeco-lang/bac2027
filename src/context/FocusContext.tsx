"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import {
  ActiveFocusSession,
  FocusTimerMode,
  FocusSessionStatus,
  ProductivityRating,
  StartSessionOptions,
  CompletedSessionSummary,
} from "@/types/focus";
import {
  generateSessionUuid,
  computeAuthoritativeElapsedSeconds,
  computeRemainingSeconds,
  formatMonospaceTime,
  getSubjectMeta,
  saveActiveSessionLocal,
  loadActiveSessionLocal,
  clearActiveSessionLocal,
  serializeSessionNotes,
} from "@/lib/focus/focus-engine";
import { PlannerStorage } from "@/lib/planner/storage";
import { PlannerService } from "@/lib/planner/planner-service";
import { useAuth } from "@/lib/auth/context";
import { soundEngine } from "@/lib/ypt/soundEngine";

interface FocusContextType {
  activeSession: ActiveFocusSession | null;
  elapsedSeconds: number;
  remainingSeconds: number;
  formattedElapsed: string;
  formattedRemaining: string;
  isRunning: boolean;
  isPaused: boolean;
  isSessionActive: boolean;

  // Modals
  isFocusModeOpen: boolean;
  isReflectionModalOpen: boolean;
  pendingCompletedSession: ActiveFocusSession | null;

  // Actions
  startSession: (options: StartSessionOptions) => { success: boolean; message?: string };
  pauseSession: () => void;
  resumeSession: () => void;
  togglePauseResume: () => void;
  finishSession: () => void;
  submitReflection: (rating: ProductivityRating, reflectionText?: string) => Promise<void>;
  abandonSession: () => Promise<void>;
  openFocusMode: () => void;
  closeFocusMode: () => void;
}

const FocusContext = createContext<FocusContextType | null>(null);

export function FocusProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const effectiveUserId = user?.id || "demo-user";

  const [activeSession, setActiveSession] = useState<ActiveFocusSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const [isFocusModeOpen, setIsFocusModeOpen] = useState<boolean>(false);
  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState<boolean>(false);
  const [pendingCompletedSession, setPendingCompletedSession] = useState<ActiveFocusSession | null>(null);

  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Authoritative reconciliation function: always uses Date.now() against timestamps
  const reconcileTimer = useCallback(() => {
    setActiveSession((currentSession) => {
      if (!currentSession) {
        setElapsedSeconds(0);
        setRemainingSeconds(0);
        return null;
      }

      const authoritativeElapsed = computeAuthoritativeElapsedSeconds(currentSession, Date.now());
      setElapsedSeconds(authoritativeElapsed);

      if (currentSession.targetDurationMinutes > 0) {
        const remaining = computeRemainingSeconds(currentSession, authoritativeElapsed);
        setRemainingSeconds(remaining);

        // Check if countdown completed
        if (remaining <= 0 && currentSession.status === "running") {
          // Play chime and transition to reflection
          soundEngine.playChime();
          const completedSession: ActiveFocusSession = {
            ...currentSession,
            status: "reflecting",
            accumulatedElapsedSeconds: currentSession.targetDurationMinutes * 60,
            currentStretchStartTimestamp: null,
            pausedAtTimestamp: Date.now(),
          };
          saveActiveSessionLocal(completedSession);
          setPendingCompletedSession(completedSession);
          setIsReflectionModalOpen(true);
          return completedSession;
        }
      } else {
        setRemainingSeconds(0);
      }

      return currentSession;
    });
  }, []);

  // 1. Recover active session from localStorage on startup
  useEffect(() => {
    const recovered = loadActiveSessionLocal();
    if (recovered) {
      setActiveSession(recovered);
      const elapsed = computeAuthoritativeElapsedSeconds(recovered, Date.now());
      setElapsedSeconds(elapsed);

      if (recovered.targetDurationMinutes > 0) {
        setRemainingSeconds(computeRemainingSeconds(recovered, elapsed));
      }

      if (recovered.status === "reflecting") {
        setPendingCompletedSession(recovered);
        setIsReflectionModalOpen(true);
      }
    }
  }, []);

  // 2. High-precision reconciliation on window visibility & focus (defeats browser throttling)
  useEffect(() => {
    const handleReconcile = () => {
      reconcileTimer();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        handleReconcile();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleReconcile);
    window.addEventListener("pageshow", handleReconcile);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleReconcile);
      window.removeEventListener("pageshow", handleReconcile);
    };
  }, [reconcileTimer]);

  // 3. UI heartbeat ticker (1 second UI refresh anchored to timestamps)
  useEffect(() => {
    if (activeSession && activeSession.status === "running") {
      tickIntervalRef.current = setInterval(() => {
        reconcileTimer();
      }, 1000);
    } else {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    }

    return () => {
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
  }, [activeSession, reconcileTimer]);

  // Start new focus session
  const startSession = useCallback(
    (options: StartSessionOptions): { success: boolean; message?: string } => {
      // Check if session already active to prevent accidental duplicate sessions
      if (activeSession && (activeSession.status === "running" || activeSession.status === "paused")) {
        // Open existing session instead of duplicating
        setIsFocusModeOpen(true);
        return {
          success: false,
          message: "توجد جلسة تركيز نشطة حالياً. تم استرجاعها مباشرة.",
        };
      }

      const nowMs = Date.now();
      const nowIso = new Date(nowMs).toISOString();
      const subjectMeta = getSubjectMeta(String(options.subjectId));

      let targetMinutes = 0;
      if (options.mode === "25m") targetMinutes = 25;
      else if (options.mode === "50m") targetMinutes = 50;
      else if (options.mode === "90m") targetMinutes = 90;
      else if (options.mode === "custom") targetMinutes = options.targetDurationMinutes || 30;

      const newSession: ActiveFocusSession = {
        id: generateSessionUuid(),
        userId: effectiveUserId,
        mode: options.mode,
        targetDurationMinutes: targetMinutes,
        subjectId: options.subjectId,
        subjectNameAr: subjectMeta.nameAr,
        subjectNameFr: subjectMeta.nameFr,
        subjectHex: subjectMeta.hexColor,
        streamId: options.streamId || "sciences_exp",
        skillId: options.skillId,
        eventId: options.eventId,
        taskTitle: options.taskTitle,
        missionId: options.missionId,

        startedAt: nowIso,
        startedAtTimestamp: nowMs,
        currentStretchStartTimestamp: nowMs,
        accumulatedElapsedSeconds: 0,
        pausedAtTimestamp: null,

        status: "running",
        interruptionsCount: 0,
      };

      setActiveSession(newSession);
      setElapsedSeconds(0);
      setRemainingSeconds(targetMinutes * 60);
      saveActiveSessionLocal(newSession);

      // Asynchronously upsert initial record into public.study_sessions
      PlannerStorage.saveStudySession({
        id: newSession.id,
        userId: effectiveUserId,
        eventId: newSession.eventId,
        streamId: String(newSession.streamId),
        subjectId: String(newSession.subjectId),
        skillId: newSession.skillId,
        plannedDurationMinutes: targetMinutes || 30,
        actualDurationSeconds: 0,
        startedAt: nowIso,
        status: "PAUSED",
        interruptionsCount: 0,
        notes: newSession.taskTitle ? `[مهمة: ${newSession.taskTitle}]` : undefined,
      }).catch((err) => {
        console.warn("Initial background session save warning:", err);
      });

      return { success: true };
    },
    [activeSession, effectiveUserId]
  );

  // Pause active session
  const pauseSession = useCallback(() => {
    setActiveSession((curr) => {
      if (!curr || curr.status !== "running" || curr.currentStretchStartTimestamp === null) {
        return curr;
      }

      const nowMs = Date.now();
      const currentStretchSeconds = Math.max(
        0,
        Math.floor((nowMs - curr.currentStretchStartTimestamp) / 1000)
      );
      const newAccumulated = curr.accumulatedElapsedSeconds + currentStretchSeconds;

      const pausedSession: ActiveFocusSession = {
        ...curr,
        status: "paused",
        accumulatedElapsedSeconds: newAccumulated,
        currentStretchStartTimestamp: null,
        pausedAtTimestamp: nowMs,
        interruptionsCount: curr.interruptionsCount + 1,
      };

      setElapsedSeconds(newAccumulated);
      if (curr.targetDurationMinutes > 0) {
        setRemainingSeconds(computeRemainingSeconds(pausedSession, newAccumulated));
      }
      saveActiveSessionLocal(pausedSession);

      // Update study_sessions record status
      PlannerStorage.saveStudySession({
        id: pausedSession.id,
        userId: effectiveUserId,
        eventId: pausedSession.eventId,
        streamId: String(pausedSession.streamId),
        subjectId: String(pausedSession.subjectId),
        skillId: pausedSession.skillId,
        plannedDurationMinutes: pausedSession.targetDurationMinutes || 30,
        actualDurationSeconds: newAccumulated,
        startedAt: pausedSession.startedAt,
        status: "PAUSED",
        interruptionsCount: pausedSession.interruptionsCount,
      }).catch(() => {});

      return pausedSession;
    });
  }, [effectiveUserId]);

  // Resume paused session
  const resumeSession = useCallback(() => {
    setActiveSession((curr) => {
      if (!curr || curr.status !== "paused") return curr;

      const nowMs = Date.now();
      const resumedSession: ActiveFocusSession = {
        ...curr,
        status: "running",
        currentStretchStartTimestamp: nowMs,
        pausedAtTimestamp: null,
      };

      saveActiveSessionLocal(resumedSession);
      return resumedSession;
    });
  }, []);

  const togglePauseResume = useCallback(() => {
    if (!activeSession) return;
    if (activeSession.status === "running") {
      pauseSession();
    } else if (activeSession.status === "paused") {
      resumeSession();
    }
  }, [activeSession, pauseSession, resumeSession]);

  // Finish session -> opens reflection modal
  const finishSession = useCallback(() => {
    setActiveSession((curr) => {
      if (!curr) return null;

      const finalElapsed = computeAuthoritativeElapsedSeconds(curr, Date.now());
      const finishedSnapshot: ActiveFocusSession = {
        ...curr,
        status: "reflecting",
        accumulatedElapsedSeconds: finalElapsed,
        currentStretchStartTimestamp: null,
        pausedAtTimestamp: Date.now(),
      };

      saveActiveSessionLocal(finishedSnapshot);
      setPendingCompletedSession(finishedSnapshot);
      setIsReflectionModalOpen(true);
      return finishedSnapshot;
    });
  }, []);

  // Submit short session reflection & finalize in public.study_sessions
  const submitReflection = useCallback(
    async (rating: ProductivityRating, reflectionText?: string) => {
      const sessionToFinalize = pendingCompletedSession || activeSession;
      if (!sessionToFinalize) {
        setIsReflectionModalOpen(false);
        return;
      }

      const finalDuration = sessionToFinalize.accumulatedElapsedSeconds;
      const serializedNotes = serializeSessionNotes(
        rating,
        reflectionText,
        sessionToFinalize.taskTitle
      );
      const endedAtIso = new Date().toISOString();

      try {
        // Save authoritative final record in public.study_sessions
        await PlannerStorage.saveStudySession({
          id: sessionToFinalize.id,
          userId: effectiveUserId,
          eventId: sessionToFinalize.eventId,
          streamId: String(sessionToFinalize.streamId),
          subjectId: String(sessionToFinalize.subjectId),
          skillId: sessionToFinalize.skillId,
          plannedDurationMinutes: sessionToFinalize.targetDurationMinutes || Math.round(finalDuration / 60) || 1,
          actualDurationSeconds: finalDuration,
          startedAt: sessionToFinalize.startedAt,
          endedAt: endedAtIso,
          status: "COMPLETED",
          interruptionsCount: sessionToFinalize.interruptionsCount,
          notes: serializedNotes,
        });

        // If linked to a planner event, mark the event as COMPLETED
        if (sessionToFinalize.eventId) {
          const events = await PlannerStorage.loadEvents(effectiveUserId);
          const targetEvent = events.find((e) => e.id === sessionToFinalize.eventId);
          if (targetEvent && targetEvent.status !== "COMPLETED") {
            await PlannerStorage.saveEvent({
              ...targetEvent,
              status: "COMPLETED",
              completedAt: endedAtIso,
              completed_at: endedAtIso,
              actualMinutesSpent: Math.round(finalDuration / 60),
              actual_minutes_spent: Math.round(finalDuration / 60),
              updatedAt: endedAtIso,
              updated_at: endedAtIso,
            });
          }
        }
      } catch (err) {
        console.warn("Failed to finalize study session record:", err);
      } finally {
        clearActiveSessionLocal();
        setActiveSession(null);
        setPendingCompletedSession(null);
        setIsReflectionModalOpen(false);
        setIsFocusModeOpen(false);
        setElapsedSeconds(0);
        setRemainingSeconds(0);
      }
    },
    [pendingCompletedSession, activeSession, effectiveUserId]
  );

  // Abandon session cleanly
  const abandonSession = useCallback(async () => {
    const sessionToAbandon = activeSession || pendingCompletedSession;
    if (!sessionToAbandon) return;

    const finalDuration = computeAuthoritativeElapsedSeconds(sessionToAbandon, Date.now());

    // If session was at least 60 seconds, save record as ABANDONED so student's effort isn't deleted
    if (finalDuration >= 60) {
      try {
        await PlannerStorage.saveStudySession({
          id: sessionToAbandon.id,
          userId: effectiveUserId,
          eventId: sessionToAbandon.eventId,
          streamId: String(sessionToAbandon.streamId),
          subjectId: String(sessionToAbandon.subjectId),
          skillId: sessionToAbandon.skillId,
          plannedDurationMinutes: sessionToAbandon.targetDurationMinutes || 1,
          actualDurationSeconds: finalDuration,
          startedAt: sessionToAbandon.startedAt,
          endedAt: new Date().toISOString(),
          status: "ABANDONED",
          interruptionsCount: sessionToAbandon.interruptionsCount,
          notes: sessionToAbandon.taskTitle
            ? `[مغادرة مبكرة] [الهدف: ${sessionToAbandon.taskTitle}]`
            : "[مغادرة مبكرة]",
        });
      } catch (err) {
        console.warn("Failed to persist abandoned session:", err);
      }
    }

    clearActiveSessionLocal();
    setActiveSession(null);
    setPendingCompletedSession(null);
    setIsReflectionModalOpen(false);
    setIsFocusModeOpen(false);
    setElapsedSeconds(0);
    setRemainingSeconds(0);
  }, [activeSession, pendingCompletedSession, effectiveUserId]);

  const openFocusMode = useCallback(() => {
    setIsFocusModeOpen(true);
  }, []);

  const closeFocusMode = useCallback(() => {
    setIsFocusModeOpen(false);
  }, []);

  const isRunning = Boolean(activeSession && activeSession.status === "running");
  const isPaused = Boolean(activeSession && activeSession.status === "paused");
  const isSessionActive = Boolean(
    activeSession && (activeSession.status === "running" || activeSession.status === "paused")
  );

  const { formatted: formattedElapsed } = formatMonospaceTime(elapsedSeconds);
  const { formatted: formattedRemaining } = formatMonospaceTime(remainingSeconds);

  return (
    <FocusContext.Provider
      value={{
        activeSession,
        elapsedSeconds,
        remainingSeconds,
        formattedElapsed,
        formattedRemaining,
        isRunning,
        isPaused,
        isSessionActive,
        isFocusModeOpen,
        isReflectionModalOpen,
        pendingCompletedSession,
        startSession,
        pauseSession,
        resumeSession,
        togglePauseResume,
        finishSession,
        submitReflection,
        abandonSession,
        openFocusMode,
        closeFocusMode,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  const context = useContext(FocusContext);
  if (!context) {
    throw new Error("useFocus must be used within a FocusProvider");
  }
  return context;
}
