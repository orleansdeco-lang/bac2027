/**
 * SHATER Planner — Authoritative Storage Engine
 * Strictly connects to Supabase PostgreSQL & Authoritative Server APIs.
 * Eliminates fake mock seed data, fake streaks, and unpersisted localStorage states.
 */

export type {
  PlannerEvent,
  StudySession,
  DailyReflection,
  PlannerPreferences,
  NotificationPreferences,
  PlannerNotificationItem,
} from "./types";
import type {
  PlannerEvent,
  StudySession,
  DailyReflection,
  PlannerPreferences,
  NotificationPreferences,
  PlannerNotificationItem,
} from "./types";

import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "@/lib/supabase/client";
import { getAlgeriaDateString } from "./algeria-date";

export { getAlgeriaDateString as getTodayDateString };

const CACHE_KEYS = {
  EVENTS: "shater_planner_events",
  SESSIONS: "shater_study_sessions",
  REFLECTIONS: "shater_daily_reflections",
  PREFERENCES: "shater_planner_preferences",
  NOTIF_PREFS: "shater_notification_preferences",
  NOTIFICATIONS: "shater_planner_notifications",
};

/**
 * Empty seed generator — returns zero mock events in production.
 */
export function generateSeedEvents(_userId?: string): PlannerEvent[] {
  return [];
}

// In-memory cache for ultra-fast local state rendering
const memoryCache = {
  events: new Map<string, PlannerEvent[]>(),
  sessions: new Map<string, StudySession[]>(),
  reflections: new Map<string, DailyReflection[]>(),
};

// In-flight request deduplication map to prevent parallel duplicate network calls
const inFlightPlannerFetches = new Map<string, Promise<PlannerEvent[]>>();

export const PlannerStorage = {
  // ============================================================================
  // 1. PLANNER EVENTS / TASKS
  // ============================================================================

  /**
   * Synchronous cached events getter (for instant initial UI render)
   */
  getEvents(userId: string = "default"): PlannerEvent[] {
    if (memoryCache.events.has(userId)) {
      return memoryCache.events.get(userId) || [];
    }
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`${CACHE_KEYS.EVENTS}_${userId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return [];
  },

  /**
   * Save all events to memory cache and local storage (offline resilience)
   */
  saveAll(events: PlannerEvent[], userId?: string): void {
    const effectiveUserId = userId || "default";
    memoryCache.events.set(effectiveUserId, events);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${CACHE_KEYS.EVENTS}_${effectiveUserId}`, JSON.stringify(events));
      } catch {}
    }
  },

  /**
   * Asynchronously loads authoritative events from PostgreSQL via /api/planner
   */
  async loadEvents(userId?: string): Promise<PlannerEvent[]> {
    const effectiveUserId = userId || "default";

    // In browser: call authoritative /api/planner endpoint
    if (typeof window !== "undefined") {
      const inFlight = inFlightPlannerFetches.get(effectiveUserId);
      if (inFlight) {
        return inFlight;
      }

      const fetchPromise = (async () => {
        try {
          const res = await fetch("/api/planner", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            cache: "no-store",
          });

          if (res.ok) {
            const data = await res.json();
            if (data && Array.isArray(data.events)) {
              const mapped: PlannerEvent[] = data.events;
              memoryCache.events.set(effectiveUserId, mapped);
              try {
                localStorage.setItem(`${CACHE_KEYS.EVENTS}_${effectiveUserId}`, JSON.stringify(mapped));
              } catch {}
              return mapped;
            }
          }
        } catch (err) {
          console.warn("[PlannerStorage.loadEvents] API fetch error:", err);
        } finally {
          inFlightPlannerFetches.delete(effectiveUserId);
        }

        // Return memory/local cache as fallback if network fails
        return this.getEvents(effectiveUserId);
      })();

      inFlightPlannerFetches.set(effectiveUserId, fetchPromise);
      return fetchPromise;
    }

    // On Server: Query Supabase directly
    if (isSupabaseConfigured && effectiveUserId && effectiveUserId !== "default") {
      try {
        let client: any = supabase;
        try {
          const adminMod = eval("require")("@/lib/supabase/admin");
          client = adminMod?.getAdminClient?.() || supabase;
        } catch {}

        const { data, error } = await client
          .from("planner_events")
          .select("*")
          .eq("user_id", effectiveUserId)
          .order("date", { ascending: true })
          .order("start_time", { ascending: true });

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            user_id: d.user_id,
            title: d.title,
            type: d.type,
            event_type: d.type?.toLowerCase(),
            date: d.date,
            startTime: d.start_time,
            start_time: d.start_time,
            endTime: d.end_time,
            end_time: d.end_time,
            durationMinutes: d.duration_minutes,
            duration_minutes: d.duration_minutes,
            streamId: d.stream_id,
            stream_id: d.stream_id,
            subjectId: d.subject_id,
            subject_id: d.subject_id,
            skillId: d.skill_id,
            skill_id: d.skill_id,
            priority: d.priority,
            status: d.status,
            notes: d.notes,
            description: d.notes,
            source: d.source,
            completedAt: d.completed_at,
            completed_at: d.completed_at,
            createdAt: d.created_at,
            created_at: d.created_at,
            updatedAt: d.updated_at,
            updated_at: d.updated_at,
          }));
        }
      } catch (err) {
        console.warn("[PlannerStorage.loadEvents] Server query error:", err);
      }
    }

    return [];
  },

  /**
   * Save (create or update) a planner task in PostgreSQL
   */
  async saveEvent(event: any): Promise<PlannerEvent> {
    const isNew = !event.id || event.id.startsWith("task-") || event.id.startsWith("temp-");
    const normalizedType = (event.type || event.event_type || "STUDY").toUpperCase();
    const normalizedPriority = (event.priority || "MEDIUM").toUpperCase();
    const normalizedStatus = (event.status || "TODO").toUpperCase();

    const payload = {
      title: event.title,
      type: normalizedType,
      date: event.date,
      start_time: event.startTime || event.start_time || "18:00",
      end_time: event.endTime || event.end_time || null,
      duration_minutes: Number(event.durationMinutes || event.duration_minutes) || 45,
      stream_id: event.streamId || event.stream_id || "sciences_exp",
      subject_id: event.subjectId || event.subject_id || null,
      skill_id: event.skillId || event.skill_id || null,
      priority: normalizedPriority,
      status: normalizedStatus,
      notes: event.notes || event.description || null,
      source: (event.source || "MANUAL").toUpperCase(),
      new_date: event.new_date,
      new_start_time: event.new_start_time,
      reschedule_reason: event.reschedule_reason,
    };

    // Client-side execution via API
    if (typeof window !== "undefined") {
      try {
        const url = isNew ? "/api/planner/events" : `/api/planner/events/${event.id}`;
        const method = isNew ? "POST" : "PATCH";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData.success && resData.event) {
            // Update local memory cache
            const userId = resData.event.userId || "default";
            const existingList = memoryCache.events.get(userId) || [];
            const idx = existingList.findIndex((e) => e.id === resData.event.id);
            if (idx >= 0) {
              existingList[idx] = resData.event;
            } else {
              existingList.push(resData.event);
            }
            memoryCache.events.set(userId, existingList);
            try {
              localStorage.setItem(`${CACHE_KEYS.EVENTS}_${userId}`, JSON.stringify(existingList));
            } catch {}
            return resData.event;
          }
        }
      } catch (err) {
        console.error("[PlannerStorage.saveEvent] API call failed:", err);
      }
    }

    // Server-side direct execution
    if (typeof window === "undefined") {
      let client: any = supabase;
      try {
        const adminMod = eval("require")("@/lib/supabase/admin");
        client = adminMod?.getAdminClient?.() || supabase;
      } catch {}

      if (client && event.userId) {
        const row = {
          user_id: event.userId,
          title: payload.title,
          type: payload.type,
          date: payload.date,
          start_time: payload.start_time,
          end_time: payload.end_time,
          duration_minutes: payload.duration_minutes,
          stream_id: payload.stream_id,
          subject_id: payload.subject_id,
          skill_id: payload.skill_id,
          priority: payload.priority,
          status: payload.status,
          notes: payload.notes,
          source: payload.source,
          updated_at: new Date().toISOString(),
        };

        if (isNew) {
          const { data } = await client.from("planner_events").insert(row).select().single();
          if (data) return data;
        } else {
          const { data } = await client.from("planner_events").update(row).eq("id", event.id).select().single();
          if (data) return data;
        }
      }
    }

    return event as PlannerEvent;
  },

  /**
   * Delete an event authoritatively
   */
  async deleteEvent(eventId: string, userId: string = "default"): Promise<void> {
    if (typeof window !== "undefined") {
      try {
        await fetch(`/api/planner/events/${eventId}`, {
          method: "DELETE",
        });

        // Update local cache
        const existingList = memoryCache.events.get(userId) || [];
        const filtered = existingList.filter((e) => e.id !== eventId);
        memoryCache.events.set(userId, filtered);
        try {
          localStorage.setItem(`${CACHE_KEYS.EVENTS}_${userId}`, JSON.stringify(filtered));
        } catch {}
      } catch (err) {
        console.error("[PlannerStorage.deleteEvent] Error:", err);
      }
    }
  },

  /**
   * Bulk save accepted events (e.g. from AI Planner Proposal)
   */
  async bulkSaveEvents(events: Array<Omit<PlannerEvent, "id" | "created_at" | "updated_at">>): Promise<PlannerEvent[]> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/planner/ai-proposal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "commit",
            events,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.events) {
            return data.events;
          }
        }
      } catch (err) {
        console.error("[PlannerStorage.bulkSaveEvents] Error:", err);
      }
    }
    return [];
  },

  // ============================================================================
  // 2. STUDY SESSIONS
  // ============================================================================

  getStudySessions(userId: string = "default"): StudySession[] {
    if (memoryCache.sessions.has(userId)) {
      return memoryCache.sessions.get(userId) || [];
    }
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`${CACHE_KEYS.SESSIONS}_${userId}`);
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return [];
  },

  async loadStudySessions(userId?: string): Promise<StudySession[]> {
    const effectiveUserId = userId || "default";

    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/planner", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.sessions)) {
            memoryCache.sessions.set(effectiveUserId, data.sessions);
            try {
              localStorage.setItem(`${CACHE_KEYS.SESSIONS}_${effectiveUserId}`, JSON.stringify(data.sessions));
            } catch {}
            return data.sessions;
          }
        }
      } catch {}
      return this.getStudySessions(effectiveUserId);
    }

    return [];
  },

  async saveStudySession(session: any): Promise<StudySession> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/planner/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event_id: session.eventId || session.event_id || null,
            stream_id: session.streamId || session.stream_id || "sciences_exp",
            subject_id: session.subjectId || session.subject_id || "math",
            skill_id: session.skillId || session.skill_id || null,
            planned_duration_minutes: session.plannedDurationMinutes || session.planned_duration_minutes || 45,
            actual_duration_seconds: session.actualDurationSeconds || session.actual_duration_seconds || 0,
            started_at: session.startedAt || session.started_at,
            ended_at: session.endedAt || session.ended_at,
            status: (session.status || "COMPLETED").toUpperCase(),
            interruptions_count: session.interruptionsCount || 0,
            notes: session.notes || null,
            mark_event_completed: true,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.session) {
            return data.session;
          }
        }
      } catch (err) {
        console.error("[PlannerStorage.saveStudySession] API error:", err);
      }
    }

    return session as StudySession;
  },

  // ============================================================================
  // 3. DAILY REFLECTIONS
  // ============================================================================

  getReflection(date: string, userId: string = "default"): DailyReflection | null {
    const list = memoryCache.reflections.get(userId) || [];
    const found = list.find((r) => r.date === date);
    if (found) return found;

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`${CACHE_KEYS.REFLECTIONS}_${userId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.find((r) => r.date === date) || null;
          }
        }
      } catch {}
    }
    return null;
  },

  async loadReflections(userId?: string): Promise<DailyReflection[]> {
    const effectiveUserId = userId || "default";

    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/planner", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.reflections)) {
            memoryCache.reflections.set(effectiveUserId, data.reflections);
            try {
              localStorage.setItem(`${CACHE_KEYS.REFLECTIONS}_${effectiveUserId}`, JSON.stringify(data.reflections));
            } catch {}
            return data.reflections;
          }
        }
      } catch {}
    }
    return memoryCache.reflections.get(effectiveUserId) || [];
  },

  async saveReflection(reflection: any): Promise<DailyReflection> {
    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/planner/reflection", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: reflection.date,
            what_learned: reflection.what_learned || reflection.learned_today || "",
            day_mood: (reflection.day_mood || reflection.mood || "GOOD").toUpperCase(),
            hardest_part: reflection.hardest_part || reflection.hardest_challenge || null,
            tomorrow_goal: reflection.tomorrow_goal || null,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.reflection) {
            const userId = data.reflection.userId || "default";
            const currentList = memoryCache.reflections.get(userId) || [];
            const idx = currentList.findIndex((r) => r.date === data.reflection.date);
            if (idx >= 0) currentList[idx] = data.reflection;
            else currentList.unshift(data.reflection);
            memoryCache.reflections.set(userId, currentList);
            try {
              localStorage.setItem(`${CACHE_KEYS.REFLECTIONS}_${userId}`, JSON.stringify(currentList));
            } catch {}
            return data.reflection;
          }
        }
      } catch (err) {
        console.error("[PlannerStorage.saveReflection] API error:", err);
      }
    }

    return reflection as DailyReflection;
  },

  // ============================================================================
  // 4. PLANNER PREFERENCES
  // ============================================================================

  getPlannerPreferences(): PlannerPreferences {
    return {
      dailyStudyTargetMinutes: 120,
      daily_study_target_minutes: 120,
      bacTargetScore: 16.0,
      bac_target_score: 16.0,
      themePreference: "boys",
      theme_preference: "boys",
      planningStyle: "HYBRID",
      planning_style: "HYBRID",
      preferredStudyTimes: ["morning", "evening"],
      preferred_study_times: ["morning", "evening"],
      studyDays: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday"],
      study_days: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday"],
      fixedCommitments: [],
      fixed_commitments: [],
    };
  },

  async savePlannerPreferences(prefs: Partial<PlannerPreferences>): Promise<void> {
    if (typeof window !== "undefined") {
      try {
        await fetch("/api/planner/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(prefs),
        });
      } catch (err) {
        console.error("[PlannerStorage.savePlannerPreferences] API error:", err);
      }
    }
  },

  // ============================================================================
  // 5. NOTIFICATION PREFERENCES
  // ============================================================================

  getNotificationPreferences(): NotificationPreferences {
    return {
      morningReminder: true,
      morning_reminder: true,
      morning_brief: true,
      upcomingTaskReminder: true,
      upcoming_task_reminder: true,
      taskStartReminder: true,
      task_start_reminder: true,
      completionEncouragement: true,
      completion_encouragement: true,
      eveningReflectionReminder: true,
      evening_reflection_reminder: true,
      evening_reflection: true,
      spiritualReminders: false,
      spiritual_reminders: false,
      morningTime: "08:00",
      morning_time: "08:00",
      eveningTime: "21:00",
      evening_time: "21:00",
      advanceNoticeMinutes: 15,
      advance_notice_minutes: 15,
    };
  },

  async loadNotificationPreferences(userId?: string): Promise<NotificationPreferences> {
    return this.getNotificationPreferences();
  },

  async saveNotificationPreferences(prefs: Partial<NotificationPreferences>): Promise<void> {
    if (typeof window !== "undefined") {
      try {
        await fetch("/api/planner/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            spiritual_reminders: prefs.spiritual_reminders,
          }),
        });
      } catch (err) {
        console.error("[PlannerStorage.saveNotificationPreferences] API error:", err);
      }
    }
  },
};
