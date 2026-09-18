"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth/context";
import {
  ProgressService,
  UserProgressRecord,
  UserProgressSummary,
  SkillProgressStatus,
} from "./progress-service";

export interface ProgressContextType {
  isDiagnosticCompleted: boolean;
  diagnosticScore: number | null;
  lastLessonId: string | null;
  totalStudyTimeSeconds: number;
  masteredCount: number;
  inProgressCount: number;
  skills: Record<string, UserProgressRecord>;
  isLoading: boolean;
  saveDiagnostic: (params: {
    streamId: string;
    overallScore: number;
    skillResults?: Array<{
      skillId: string;
      subjectId: string;
      score: number;
      isMastered?: boolean;
    }>;
  }) => Promise<void>;
  trackLessonActivity: (params: {
    streamId: string;
    subjectId: string;
    skillId: string;
    lessonId: string;
    status?: SkillProgressStatus;
    timeSpentDeltaSeconds?: number;
  }) => Promise<void>;
  refreshProgress: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const effectiveUserId = user?.id || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("bac_auth_user") || "{}")?.id : undefined);

  // Synchronous initial state to avoid any flashing/flickering
  const initialSync = useMemo(() => {
    return ProgressService.getSyncDiagnosticStatus(effectiveUserId);
  }, [effectiveUserId]);

  const [isDiagnosticCompleted, setIsDiagnosticCompleted] = useState<boolean>(initialSync.completed);
  const [diagnosticScore, setDiagnosticScore] = useState<number | null>(initialSync.score);
  const [lastLessonId, setLastLessonId] = useState<string | null>(initialSync.lastLessonId);
  const [totalStudyTimeSeconds, setTotalStudyTimeSeconds] = useState<number>(initialSync.totalTimeSeconds);
  const [masteredCount, setMasteredCount] = useState<number>(initialSync.masteredCount);
  const [inProgressCount, setInProgressCount] = useState<number>(0);
  const [skills, setSkills] = useState<Record<string, UserProgressRecord>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const applySummary = useCallback((summary: UserProgressSummary) => {
    setIsDiagnosticCompleted(summary.diagnosticCompleted);
    setDiagnosticScore(summary.diagnosticScore);
    setLastLessonId(summary.lastLessonId);
    setTotalStudyTimeSeconds(summary.totalTimeSeconds);
    setMasteredCount(summary.masteredSkillsCount);
    setInProgressCount(summary.inProgressSkillsCount);
    setSkills(summary.skills);
  }, []);

  const refreshProgress = useCallback(async () => {
    if (!effectiveUserId) {
      setIsLoading(false);
      return;
    }
    try {
      const summary = await ProgressService.getUserProgress(effectiveUserId);
      applySummary(summary);
    } catch (err) {
      console.error("ProgressContext refreshProgress error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [effectiveUserId, applySummary]);

  // Load progress on mount or user change
  useEffect(() => {
    const sync = ProgressService.getSyncDiagnosticStatus(effectiveUserId);
    setIsDiagnosticCompleted(sync.completed);
    setDiagnosticScore(sync.score);
    setLastLessonId(sync.lastLessonId);
    setTotalStudyTimeSeconds(sync.totalTimeSeconds);
    setMasteredCount(sync.masteredCount);

    refreshProgress();
  }, [effectiveUserId, refreshProgress]);

  // Listen for progress update events dispatched by any component or tab
  useEffect(() => {
    function handleUpdate(e: CustomEvent<UserProgressSummary>) {
      if (e.detail) {
        applySummary(e.detail);
      }
    }
    window.addEventListener("bac_user_progress_updated" as any, handleUpdate as any);
    return () => {
      window.removeEventListener("bac_user_progress_updated" as any, handleUpdate as any);
    };
  }, [applySummary]);

  const saveDiagnostic = useCallback(
    async (params: {
      streamId: string;
      overallScore: number;
      skillResults?: Array<{
        skillId: string;
        subjectId: string;
        score: number;
        isMastered?: boolean;
      }>;
    }) => {
      if (!effectiveUserId) return;
      await ProgressService.saveDiagnosticCompletion({
        userId: effectiveUserId,
        ...params,
      });
      await refreshProgress();
    },
    [effectiveUserId, refreshProgress]
  );

  const trackLessonActivity = useCallback(
    async (params: {
      streamId: string;
      subjectId: string;
      skillId: string;
      lessonId: string;
      status?: SkillProgressStatus;
      timeSpentDeltaSeconds?: number;
    }) => {
      if (!effectiveUserId) return;
      await ProgressService.recordLessonActivity({
        userId: effectiveUserId,
        ...params,
      });
      await refreshProgress();
    },
    [effectiveUserId, refreshProgress]
  );

  const value = useMemo(
    () => ({
      isDiagnosticCompleted,
      diagnosticScore,
      lastLessonId,
      totalStudyTimeSeconds,
      masteredCount,
      inProgressCount,
      skills,
      isLoading,
      saveDiagnostic,
      trackLessonActivity,
      refreshProgress,
    }),
    [
      isDiagnosticCompleted,
      diagnosticScore,
      lastLessonId,
      totalStudyTimeSeconds,
      masteredCount,
      inProgressCount,
      skills,
      isLoading,
      saveDiagnostic,
      trackLessonActivity,
      refreshProgress,
    ]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useUserProgress(): ProgressContextType {
  const context = useContext(ProgressContext);
  if (!context) {
    // Graceful fallback if invoked outside provider
    const sync = ProgressService.getSyncDiagnosticStatus();
    return {
      isDiagnosticCompleted: sync.completed,
      diagnosticScore: sync.score,
      lastLessonId: sync.lastLessonId,
      totalStudyTimeSeconds: sync.totalTimeSeconds,
      masteredCount: sync.masteredCount,
      inProgressCount: 0,
      skills: {},
      isLoading: false,
      saveDiagnostic: async () => {},
      trackLessonActivity: async () => {},
      refreshProgress: async () => {},
    };
  }
  return context;
}
