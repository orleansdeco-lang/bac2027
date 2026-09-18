/**
 * BAC Mastery - User Progress & Session Persistence Service
 * Dual-write repository combining Supabase public.user_progress with synchronous LocalStorage caching.
 * Prevents redundant diagnostic loops and provides real, durable learning progress tracking.
 */

import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "../supabase/client";

export type SkillProgressStatus = "not_started" | "in_progress" | "mastered";

export interface UserProgressRecord {
  userId: string;
  streamId: string;
  subjectId: string;
  skillId: string;
  status: SkillProgressStatus;
  diagnosticCompleted: boolean;
  diagnosticScore: number | null;
  lastLessonId: string | null;
  totalTimeSeconds: number;
  lastActiveAt: string;
}

export interface UserProgressSummary {
  diagnosticCompleted: boolean;
  diagnosticScore: number | null;
  lastLessonId: string | null;
  totalTimeSeconds: number;
  masteredSkillsCount: number;
  inProgressSkillsCount: number;
  skills: Record<string, UserProgressRecord>;
}

// Memory cache to eliminate redundant reads during a single session
const progressMemoryCache = new Map<string, UserProgressSummary>();

function getStorageKeys(userId: string) {
  return {
    progressKey: `bac_user_progress:${userId}`,
    metaKey: `bac_user_progress_meta:${userId}`,
  };
}

function resolveEffectiveUserId(userId?: string): string | null {
  if (userId) return userId;
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("bac_auth_user");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.id) return parsed.id;
    }
  } catch {}
  return null;
}

function broadcastProgressUpdate(summary: UserProgressSummary) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("bac_user_progress_updated", {
        detail: summary,
      })
    );
  }
}

export const ProgressService = {
  /**
   * Fast synchronous check from memory and localStorage to eliminate cold-start flashes / route flickers.
   */
  getSyncDiagnosticStatus(userId?: string): {
    completed: boolean;
    score: number | null;
    lastLessonId: string | null;
    totalTimeSeconds: number;
    masteredCount: number;
  } {
    const effectiveId = resolveEffectiveUserId(userId);
    if (!effectiveId) {
      return {
        completed: false,
        score: null,
        lastLessonId: null,
        totalTimeSeconds: 0,
        masteredCount: 0,
      };
    }

    // 1. Check memory cache
    const mem = progressMemoryCache.get(effectiveId);
    if (mem) {
      return {
        completed: mem.diagnosticCompleted,
        score: mem.diagnosticScore,
        lastLessonId: mem.lastLessonId,
        totalTimeSeconds: mem.totalTimeSeconds,
        masteredCount: mem.masteredSkillsCount,
      };
    }

    // 2. Check localStorage metadata
    if (typeof window !== "undefined") {
      try {
        const { metaKey, progressKey } = getStorageKeys(effectiveId);
        const metaRaw = localStorage.getItem(metaKey);
        if (metaRaw) {
          const meta = JSON.parse(metaRaw);
          return {
            completed: Boolean(meta.diagnosticCompleted),
            score: meta.diagnosticScore ?? null,
            lastLessonId: meta.lastLessonId ?? null,
            totalTimeSeconds: meta.totalTimeSeconds ?? 0,
            masteredCount: meta.masteredSkillsCount ?? 0,
          };
        }

        // Fallback: Check older diagnostic results key if present
        const legacyResultsKey = `bac_diagnostic_result_${effectiveId}`;
        const legacyGlobalKey = "bac_mastery_diagnostic_results";
        if (localStorage.getItem(legacyResultsKey) || localStorage.getItem(legacyGlobalKey)) {
          return {
            completed: true,
            score: null,
            lastLessonId: null,
            totalTimeSeconds: 0,
            masteredCount: 0,
          };
        }
      } catch (e) {
        console.warn("Error reading sync diagnostic status:", e);
      }
    }

    return {
      completed: false,
      score: null,
      lastLessonId: null,
      totalTimeSeconds: 0,
      masteredCount: 0,
    };
  },

  /**
   * Asynchronously queries Supabase with localStorage fallback to check diagnostic completion & study stats.
   */
  async checkDiagnosticStatus(userId?: string): Promise<{
    completed: boolean;
    score: number | null;
    lastLessonId: string | null;
    totalTimeSeconds: number;
    masteredCount: number;
  }> {
    const syncStatus = this.getSyncDiagnosticStatus(userId);
    const effectiveId = resolveEffectiveUserId(userId);
    if (!effectiveId) return syncStatus;

    if (isSupabaseConfigured && supabase) {
      try {
        // Query user_progress for any records or diagnostic_completed = true
        const { data: progressRows, error: pError } = await supabase
          .from("user_progress")
          .select("skill_id, status, diagnostic_completed, diagnostic_score, last_lesson_id, total_time_seconds, last_active_at")
          .eq("user_id", effectiveId);

        if (!pError && progressRows && progressRows.length > 0) {
          const hasDiagCompleted = progressRows.some((r) => r.diagnostic_completed === true);
          let maxScore: number | null = null;
          let totalSeconds = 0;
          let mastered = 0;
          let latestLessonId: string | null = null;
          let latestActiveTime = 0;

          for (const row of progressRows) {
            if (row.diagnostic_score !== null && row.diagnostic_score !== undefined) {
              const numScore = Number(row.diagnostic_score);
              if (maxScore === null || numScore > maxScore) maxScore = numScore;
            }
            if (row.status === "mastered") mastered += 1;
            totalSeconds += Number(row.total_time_seconds || 0);

            if (row.last_lesson_id && row.last_active_at) {
              const rowTime = new Date(row.last_active_at).getTime();
              if (rowTime > latestActiveTime) {
                latestActiveTime = rowTime;
                latestLessonId = row.last_lesson_id;
              }
            }
          }

          const resolved = {
            completed: hasDiagCompleted || progressRows.length > 0,
            score: maxScore ?? syncStatus.score,
            lastLessonId: latestLessonId || syncStatus.lastLessonId,
            totalTimeSeconds: Math.max(totalSeconds, syncStatus.totalTimeSeconds),
            masteredCount: Math.max(mastered, syncStatus.masteredCount),
          };

          // Cache update
          this.updateLocalCache(effectiveId, resolved);
          return resolved;
        }

        // Check student_profiles as secondary source
        const { data: profileRow } = await supabase
          .from("student_profiles")
          .select("diagnostic_completed, diagnostic_score, last_lesson_id, total_study_time_seconds")
          .eq("id", effectiveId)
          .maybeSingle();

        if (profileRow && profileRow.diagnostic_completed) {
          const resolved = {
            completed: true,
            score: profileRow.diagnostic_score ? Number(profileRow.diagnostic_score) : syncStatus.score,
            lastLessonId: profileRow.last_lesson_id || syncStatus.lastLessonId,
            totalTimeSeconds: Math.max(Number(profileRow.total_study_time_seconds || 0), syncStatus.totalTimeSeconds),
            masteredCount: syncStatus.masteredCount,
          };
          this.updateLocalCache(effectiveId, resolved);
          return resolved;
        }
      } catch (err) {
        console.warn("Supabase checkDiagnosticStatus failed, using local cache:", err);
      }
    }

    return syncStatus;
  },

  /**
   * Retrieves full progress summary (all skills, study time, mastered count)
   */
  async getUserProgress(userId?: string): Promise<UserProgressSummary> {
    const effectiveId = resolveEffectiveUserId(userId);
    if (!effectiveId) {
      return {
        diagnosticCompleted: false,
        diagnosticScore: null,
        lastLessonId: null,
        totalTimeSeconds: 0,
        masteredSkillsCount: 0,
        inProgressSkillsCount: 0,
        skills: {},
      };
    }

    // Try memory cache first
    const mem = progressMemoryCache.get(effectiveId);
    if (mem) return mem;

    // Load from localStorage
    let localSummary: UserProgressSummary = {
      diagnosticCompleted: false,
      diagnosticScore: null,
      lastLessonId: null,
      totalTimeSeconds: 0,
      masteredSkillsCount: 0,
      inProgressSkillsCount: 0,
      skills: {},
    };

    if (typeof window !== "undefined") {
      try {
        const { metaKey, progressKey } = getStorageKeys(effectiveId);
        const metaRaw = localStorage.getItem(metaKey);
        const progressRaw = localStorage.getItem(progressKey);

        const skills: Record<string, UserProgressRecord> = progressRaw ? JSON.parse(progressRaw) : {};
        const meta = metaRaw ? JSON.parse(metaRaw) : {};

        let mastered = 0;
        let inProg = 0;
        let totalTime = Number(meta.totalTimeSeconds || 0);

        Object.values(skills).forEach((s) => {
          if (s.status === "mastered") mastered += 1;
          else if (s.status === "in_progress") inProg += 1;
          totalTime = Math.max(totalTime, s.totalTimeSeconds || 0);
        });

        localSummary = {
          diagnosticCompleted: Boolean(meta.diagnosticCompleted || Object.values(skills).some((s) => s.diagnosticCompleted)),
          diagnosticScore: meta.diagnosticScore ?? null,
          lastLessonId: meta.lastLessonId ?? null,
          totalTimeSeconds: totalTime,
          masteredSkillsCount: mastered,
          inProgressSkillsCount: inProg,
          skills,
        };
      } catch (e) {
        console.warn("Failed reading local progress summary:", e);
      }
    }

    // Sync from Supabase in background
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("user_progress")
          .select("*")
          .eq("user_id", effectiveId);

        if (!error && data && data.length > 0) {
          const cloudSkills: Record<string, UserProgressRecord> = { ...localSummary.skills };
          let totalTime = 0;
          let mastered = 0;
          let inProg = 0;
          let diagCompleted = false;
          let diagScore: number | null = null;
          let latestLessonId: string | null = null;
          let latestActive = 0;

          data.forEach((row: any) => {
            const skill: UserProgressRecord = {
              userId: row.user_id,
              streamId: row.stream_id,
              subjectId: row.subject_id,
              skillId: row.skill_id,
              status: row.status as SkillProgressStatus,
              diagnosticCompleted: Boolean(row.diagnostic_completed),
              diagnosticScore: row.diagnostic_score !== null ? Number(row.diagnostic_score) : null,
              lastLessonId: row.last_lesson_id,
              totalTimeSeconds: Number(row.total_time_seconds || 0),
              lastActiveAt: row.last_active_at,
            };

            cloudSkills[row.skill_id] = skill;
            totalTime += skill.totalTimeSeconds;
            if (skill.status === "mastered") mastered += 1;
            else if (skill.status === "in_progress") inProg += 1;
            if (skill.diagnosticCompleted) diagCompleted = true;
            if (skill.diagnosticScore !== null) {
              if (diagScore === null || skill.diagnosticScore > diagScore) {
                diagScore = skill.diagnosticScore;
              }
            }
            if (skill.lastLessonId && skill.lastActiveAt) {
              const rowTime = new Date(skill.lastActiveAt).getTime();
              if (rowTime > latestActive) {
                latestActive = rowTime;
                latestLessonId = skill.lastLessonId;
              }
            }
          });

          const merged: UserProgressSummary = {
            diagnosticCompleted: diagCompleted || localSummary.diagnosticCompleted,
            diagnosticScore: diagScore ?? localSummary.diagnosticScore,
            lastLessonId: latestLessonId || localSummary.lastLessonId,
            totalTimeSeconds: Math.max(totalTime, localSummary.totalTimeSeconds),
            masteredSkillsCount: Math.max(mastered, localSummary.masteredSkillsCount),
            inProgressSkillsCount: inProg,
            skills: cloudSkills,
          };

          progressMemoryCache.set(effectiveId, merged);
          if (typeof window !== "undefined") {
            const { metaKey, progressKey } = getStorageKeys(effectiveId);
            localStorage.setItem(progressKey, JSON.stringify(merged.skills));
            localStorage.setItem(
              metaKey,
              JSON.stringify({
                diagnosticCompleted: merged.diagnosticCompleted,
                diagnosticScore: merged.diagnosticScore,
                lastLessonId: merged.lastLessonId,
                totalTimeSeconds: merged.totalTimeSeconds,
                masteredSkillsCount: merged.masteredSkillsCount,
              })
            );
          }
          return merged;
        }
      } catch (err) {
        console.warn("Supabase getUserProgress query failed, using local copy:", err);
      }
    }

    progressMemoryCache.set(effectiveId, localSummary);
    return localSummary;
  },

  /**
   * Immediately records the completion of the diagnostic assessment into Supabase and LocalStorage.
   */
  async saveDiagnosticCompletion(params: {
    userId: string;
    streamId: string;
    overallScore: number;
    skillResults?: Array<{
      skillId: string;
      subjectId: string;
      score: number;
      isMastered?: boolean;
    }>;
  }): Promise<void> {
    const { userId, streamId, overallScore, skillResults = [] } = params;
    const now = new Date().toISOString();

    // 1. Prepare records for each skill tested in diagnostic
    const currentProgress = await this.getUserProgress(userId);
    const updatedSkills = { ...currentProgress.skills };

    let newlyMastered = 0;
    const dbPayloads: any[] = [];

    if (skillResults.length > 0) {
      for (const item of skillResults) {
        const isMastered = item.isMastered ?? item.score >= 4.0;
        const currentStatus = updatedSkills[item.skillId]?.status;
        const resolvedStatus: SkillProgressStatus =
          currentStatus === "mastered" || isMastered ? "mastered" : "in_progress";

        if (resolvedStatus === "mastered" && currentStatus !== "mastered") {
          newlyMastered += 1;
        }

        const record: UserProgressRecord = {
          userId,
          streamId,
          subjectId: item.subjectId,
          skillId: item.skillId,
          status: resolvedStatus,
          diagnosticCompleted: true,
          diagnosticScore: item.score,
          lastLessonId: updatedSkills[item.skillId]?.lastLessonId || null,
          totalTimeSeconds: updatedSkills[item.skillId]?.totalTimeSeconds || 0,
          lastActiveAt: now,
        };

        updatedSkills[item.skillId] = record;
        dbPayloads.push({
          user_id: userId,
          stream_id: streamId,
          subject_id: item.subjectId,
          skill_id: item.skillId,
          status: resolvedStatus,
          diagnostic_completed: true,
          diagnostic_score: item.score,
          last_lesson_id: record.lastLessonId,
          total_time_seconds: record.totalTimeSeconds,
          last_active_at: now,
          updated_at: now,
        });
      }
    } else {
      // Create a default foundation entry to anchor diagnostic completion
      const defaultSkillId = `diagnostic_stream_${streamId}`;
      const defaultRecord: UserProgressRecord = {
        userId,
        streamId,
        subjectId: "general",
        skillId: defaultSkillId,
        status: "in_progress",
        diagnosticCompleted: true,
        diagnosticScore: overallScore,
        lastLessonId: null,
        totalTimeSeconds: 0,
        lastActiveAt: now,
      };
      updatedSkills[defaultSkillId] = defaultRecord;
      dbPayloads.push({
        user_id: userId,
        stream_id: streamId,
        subject_id: "general",
        skill_id: defaultSkillId,
        status: "in_progress",
        diagnostic_completed: true,
        diagnostic_score: overallScore,
        last_lesson_id: null,
        total_time_seconds: 0,
        last_active_at: now,
        updated_at: now,
      });
    }

    const totalMastered = Object.values(updatedSkills).filter((s) => s.status === "mastered").length;
    const totalInProg = Object.values(updatedSkills).filter((s) => s.status === "in_progress").length;

    const summary: UserProgressSummary = {
      diagnosticCompleted: true,
      diagnosticScore: overallScore,
      lastLessonId: currentProgress.lastLessonId,
      totalTimeSeconds: currentProgress.totalTimeSeconds,
      masteredSkillsCount: totalMastered,
      inProgressSkillsCount: totalInProg,
      skills: updatedSkills,
    };

    // 2. Synchronously write to LocalStorage & Memory Cache
    progressMemoryCache.set(userId, summary);
    if (typeof window !== "undefined") {
      const { metaKey, progressKey } = getStorageKeys(userId);
      localStorage.setItem(progressKey, JSON.stringify(updatedSkills));
      localStorage.setItem(
        metaKey,
        JSON.stringify({
          diagnosticCompleted: true,
          diagnosticScore: overallScore,
          lastLessonId: summary.lastLessonId,
          totalTimeSeconds: summary.totalTimeSeconds,
          masteredSkillsCount: totalMastered,
        })
      );
      // Legacy compatibility keys
      localStorage.setItem(`bac_diagnostic_result_${userId}`, JSON.stringify({ score: overallScore, completedAt: now }));
    }

    // 3. Broadcast update to UI listeners
    broadcastProgressUpdate(summary);

    // 4. Asynchronously write to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await Promise.all([
          // Upsert all skill rows into user_progress
          supabase.from("user_progress").upsert(dbPayloads, { onConflict: "user_id,skill_id" }),
          // Update student_profiles summary columns
          supabase
            .from("student_profiles")
            .update({
              diagnostic_completed: true,
              diagnostic_score: overallScore,
              onboarding_completed: true,
              updated_at: now,
            })
            .eq("id", userId),
        ]);
      } catch (err) {
        console.error("Failed saving diagnostic completion to Supabase:", err);
      }
    }
  },

  /**
   * Tracks lesson progress, updates study time, and changes skill status when mastered or in progress.
   */
  async recordLessonActivity(params: {
    userId: string;
    streamId: string;
    subjectId: string;
    skillId: string;
    lessonId: string;
    status?: SkillProgressStatus;
    timeSpentDeltaSeconds?: number;
  }): Promise<void> {
    const {
      userId,
      streamId,
      subjectId,
      skillId,
      lessonId,
      status,
      timeSpentDeltaSeconds = 0,
    } = params;

    const now = new Date().toISOString();
    const currentProgress = await this.getUserProgress(userId);
    const existing = currentProgress.skills[skillId];

    const currentTotal = (existing?.totalTimeSeconds || 0) + Math.max(0, timeSpentDeltaSeconds);
    const overallTotal = currentProgress.totalTimeSeconds + Math.max(0, timeSpentDeltaSeconds);

    // If existing status is already mastered, preserve it
    const nextStatus: SkillProgressStatus =
      status || (existing?.status === "mastered" ? "mastered" : existing?.status || "in_progress");

    const updatedRecord: UserProgressRecord = {
      userId,
      streamId,
      subjectId,
      skillId,
      status: nextStatus,
      diagnosticCompleted: existing?.diagnosticCompleted ?? currentProgress.diagnosticCompleted,
      diagnosticScore: existing?.diagnosticScore ?? null,
      lastLessonId: lessonId,
      totalTimeSeconds: currentTotal,
      lastActiveAt: now,
    };

    const updatedSkills = {
      ...currentProgress.skills,
      [skillId]: updatedRecord,
    };

    const totalMastered = Object.values(updatedSkills).filter((s) => s.status === "mastered").length;
    const totalInProg = Object.values(updatedSkills).filter((s) => s.status === "in_progress").length;

    const updatedSummary: UserProgressSummary = {
      ...currentProgress,
      lastLessonId: lessonId,
      totalTimeSeconds: overallTotal,
      masteredSkillsCount: totalMastered,
      inProgressSkillsCount: totalInProg,
      skills: updatedSkills,
    };

    // 1. Sync write to Memory Cache & LocalStorage
    progressMemoryCache.set(userId, updatedSummary);
    if (typeof window !== "undefined") {
      const { metaKey, progressKey } = getStorageKeys(userId);
      localStorage.setItem(progressKey, JSON.stringify(updatedSkills));
      localStorage.setItem(
        metaKey,
        JSON.stringify({
          diagnosticCompleted: updatedSummary.diagnosticCompleted,
          diagnosticScore: updatedSummary.diagnosticScore,
          lastLessonId: lessonId,
          totalTimeSeconds: overallTotal,
          masteredSkillsCount: totalMastered,
        })
      );
    }

    // 2. Broadcast event
    broadcastProgressUpdate(updatedSummary);

    // 3. Sync to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const payload = {
          user_id: userId,
          stream_id: streamId,
          subject_id: subjectId,
          skill_id: skillId,
          status: nextStatus,
          diagnostic_completed: updatedRecord.diagnosticCompleted,
          diagnostic_score: updatedRecord.diagnosticScore,
          last_lesson_id: lessonId,
          total_time_seconds: currentTotal,
          last_active_at: now,
          updated_at: now,
        };

        await Promise.all([
          supabase.from("user_progress").upsert(payload, { onConflict: "user_id,skill_id" }),
          supabase
            .from("student_profiles")
            .update({
              last_lesson_id: lessonId,
              total_study_time_seconds: overallTotal,
              updated_at: now,
            })
            .eq("id", userId),
        ]);
      } catch (err) {
        console.error("Failed persisting lesson activity to Supabase:", err);
      }
    }
  },

  /**
   * Helper to update local cache metadata synchronously
   */
  updateLocalCache(
    userId: string,
    meta: {
      completed: boolean;
      score: number | null;
      lastLessonId: string | null;
      totalTimeSeconds: number;
      masteredCount: number;
    }
  ) {
    if (typeof window === "undefined") return;
    try {
      const { metaKey } = getStorageKeys(userId);
      localStorage.setItem(
        metaKey,
        JSON.stringify({
          diagnosticCompleted: meta.completed,
          diagnosticScore: meta.score,
          lastLessonId: meta.lastLessonId,
          totalTimeSeconds: meta.totalTimeSeconds,
          masteredSkillsCount: meta.masteredCount,
        })
      );
    } catch {}
  },
};
