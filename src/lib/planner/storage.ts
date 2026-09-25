/**
 * SHATER Planner — Hybrid Offline-First Storage Engine
 * Invariant: Works seamlessly offline via localStorage, syncs with Supabase when available
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
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

const STORAGE_KEYS = {
  EVENTS: "shater_planner_events",
  SESSIONS: "shater_study_sessions",
  REFLECTIONS: "shater_daily_reflections",
  PREFERENCES: "shater_planner_preferences",
  NOTIF_PREFS: "shater_notification_preferences",
  NOTIFICATIONS: "shater_planner_notifications",
};

/**
 * Returns today's date in YYYY-MM-DD local format
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Seed initial mock/demo events matching the product design mockup
 */
export function generateSeedEvents(userId: string = "demo-user"): PlannerEvent[] {
  const today = getTodayDateString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const inTwoDays = new Date();
  inTwoDays.setDate(inTwoDays.getDate() + 2);
  const inTwoDaysStr = inTwoDays.toISOString().split("T")[0];

  const now = new Date().toISOString();

  return [
    {
      id: "seed-1",
      userId,
      user_id: userId,
      title: "Mathématiques — Révision Dérivées & Continuité",
      type: "STUDY",
      event_type: "study",
      date: today,
      startTime: "08:00",
      start_time: "08:00",
      endTime: "09:30",
      end_time: "09:30",
      durationMinutes: 90,
      duration_minutes: 90,
      streamId: "sciences_exp",
      stream_id: "sciences_exp",
      subjectId: "math",
      subject_id: "math",
      skillId: "math-derivatives",
      priority: "HIGH",
      status: "COMPLETED",
      notes: "Fiche mémo + 3 exercices type BAC",
      description: "Fiche mémo + 3 exercices type BAC",
      source: "MANUAL",
      completedAt: now,
      completed_at: now,
      actualMinutesSpent: 90,
      actual_minutes_spent: 90,
      createdAt: now,
      created_at: now,
      updatedAt: now,
      updated_at: now,
    },
    {
      id: "seed-2",
      userId,
      user_id: userId,
      title: "Physique-Chimie — Sujet BAC Blanc 2024",
      type: "PRACTICE",
      event_type: "practice",
      date: today,
      startTime: "10:00",
      start_time: "10:00",
      endTime: "11:30",
      end_time: "11:30",
      durationMinutes: 90,
      duration_minutes: 90,
      streamId: "sciences_exp",
      stream_id: "sciences_exp",
      subjectId: "physics",
      subject_id: "physics",
      skillId: "phy-nuclear-decay",
      priority: "HIGH",
      status: "IN_PROGRESS",
      notes: "Exercice 1 & 2 : Transformations nucléaires",
      description: "Exercice 1 & 2 : Transformations nucléaires",
      source: "MANUAL",
      createdAt: now,
      created_at: now,
      updatedAt: now,
      updated_at: now,
    },
    {
      id: "seed-3",
      userId,
      user_id: userId,
      title: "Sciences Naturelles — Synthèse des Protéines",
      type: "REVIEW",
      event_type: "review",
      date: today,
      startTime: "14:00",
      start_time: "14:00",
      endTime: "15:00",
      end_time: "15:00",
      durationMinutes: 60,
      duration_minutes: 60,
      streamId: "sciences_exp",
      stream_id: "sciences_exp",
      subjectId: "natural_sciences",
      subject_id: "natural_sciences",
      priority: "MEDIUM",
      status: "TODO",
      notes: "Schéma bilan de la traduction et transcription",
      description: "Schéma bilan de la traduction et transcription",
      source: "AI",
      createdAt: now,
      created_at: now,
      updatedAt: now,
      updated_at: now,
    },
    {
      id: "seed-4",
      userId,
      user_id: userId,
      title: "Français — Texte d'histoire & Compte rendu",
      type: "HOMEWORK",
      event_type: "homework",
      date: today,
      startTime: "16:30",
      start_time: "16:30",
      endTime: "17:15",
      end_time: "17:15",
      durationMinutes: 45,
      duration_minutes: 45,
      streamId: "sciences_exp",
      stream_id: "sciences_exp",
      subjectId: "french",
      subject_id: "french",
      priority: "LOW",
      status: "TODO",
      notes: "Méthodologie du compte rendu objectif",
      description: "Méthodologie du compte rendu objectif",
      source: "MANUAL",
      createdAt: now,
      created_at: now,
      updatedAt: now,
      updated_at: now,
    },
    {
      id: "seed-5",
      userId,
      user_id: userId,
      title: "Philosophie — Problématique de la Conscience",
      type: "STUDY",
      event_type: "study",
      date: tomorrowStr,
      startTime: "09:00",
      start_time: "09:00",
      endTime: "10:30",
      end_time: "10:30",
      durationMinutes: 90,
      duration_minutes: 90,
      streamId: "sciences_exp",
      stream_id: "sciences_exp",
      subjectId: "philosophy",
      subject_id: "philosophy",
      priority: "MEDIUM",
      status: "TODO",
      notes: "Lire et résumer les 3 thèses principales",
      description: "Lire et résumer les 3 thèses principales",
      source: "AI",
      createdAt: now,
      created_at: now,
      updatedAt: now,
      updated_at: now,
    },
    {
      id: "seed-6",
      userId,
      user_id: userId,
      title: "Mathématiques — Fonctions Exponentielles",
      type: "STUDY",
      event_type: "study",
      date: inTwoDaysStr,
      startTime: "15:00",
      start_time: "15:00",
      endTime: "16:30",
      end_time: "16:30",
      durationMinutes: 90,
      duration_minutes: 90,
      streamId: "sciences_exp",
      stream_id: "sciences_exp",
      subjectId: "math",
      subject_id: "math",
      priority: "HIGH",
      status: "TODO",
      notes: "Étude de branches infinies",
      description: "Étude de branches infinies",
      source: "MANUAL",
      createdAt: now,
      created_at: now,
      updatedAt: now,
      updated_at: now,
    },
  ];
}

/**
 * Seed initial mock daily reflections
 */
export function generateSeedReflections(userId: string = "demo-user"): DailyReflection[] {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  return [
    {
      id: "seed-refl-1",
      userId,
      user_id: userId,
      date: yesterdayStr,
      whatLearned: "J'ai bien consolidé les limites et les asymptotes en maths, mais j'ai manqué de temps en physique.",
      learned_today: "J'ai bien consolidé les limites et les asymptotes en maths, mais j'ai manqué de temps en physique.",
      dayMood: "GOOD",
      mood: "good",
      hardestPart: "Calcul d'intégrale par parties",
      hardest_challenge: "Calcul d'intégrale par parties",
      tomorrowGoal: "Résoudre 2 exercices types BAC en physique nucléaire",
      tomorrow_goal: "Résoudre 2 exercices types BAC en physique nucléaire",
      gratitudeNote: "الحمد لله على نعمة الفهم والتركيز",
      gratitude_note: "الحمد لله على نعمة الفهم والتركيز",
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}

/**
 * Default Preferences
 */
export function getDefaultPreferences(userId: string = "demo-user"): PlannerPreferences {
  return {
    userId,
    user_id: userId,
    themePreference: "boys",
    planningStyle: "HYBRID",
    preferredStudyTimes: ["morning", "evening"],
    studyDays: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"],
    fixedCommitments: [
      {
        id: "sch-1",
        title: "Lycée (Cour de cours)",
        type: "SCHOOL",
        dayOfWeek: 1, // Monday
        startTime: "08:00",
        endTime: "16:00",
      },
    ],
    dailyStudyTargetMinutes: 180, // 3 hours
    bacTargetScore: 15.5,
    updatedAt: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Default Notifications Settings
 */
export function getDefaultNotificationPreferences(userId: string = "demo-user"): NotificationPreferences {
  return {
    userId,
    user_id: userId,
    morningReminder: true,
    morning_brief: true,
    upcomingTaskReminder: true,
    task_reminders: true,
    taskStartReminder: true,
    completionEncouragement: true,
    eveningReflectionReminder: true,
    evening_reflection: true,
    spiritualReminders: true,
    spiritual_reminders: true,
    morningTime: "08:00",
    eveningTime: "21:00",
    advance_notice_minutes: 15,
    updatedAt: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export const PlannerStorage = {
  // ============================================================================
  // 1. EVENTS / TASKS
  // ============================================================================
  getEvents(userId: string = "demo-user"): PlannerEvent[] {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`${STORAGE_KEYS.EVENTS}_${userId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (err) {
        console.warn("Failed to read planner events from localStorage", err);
      }
    }
    const seed = generateSeedEvents(userId);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${STORAGE_KEYS.EVENTS}_${userId}`, JSON.stringify(seed));
      } catch (e) {}
    }
    return seed;
  },

  async loadEvents(userId?: string): Promise<PlannerEvent[]> {
    const effectiveUserId = userId || "demo-user";

    // Try localStorage first
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`${STORAGE_KEYS.EVENTS}_${effectiveUserId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch (err) {
        console.warn("Failed to read planner events from localStorage", err);
      }
    }

    // Try Supabase if configured
    if (Boolean(isSupabaseConfigured) && supabase && userId && userId !== "demo-user") {
      try {
        const { data, error } = await supabase
          .from("planner_events")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: true })
          .order("start_time", { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped: PlannerEvent[] = data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            user_id: d.user_id,
            title: d.title,
            type: d.type,
            event_type: d.type,
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

          if (typeof window !== "undefined") {
            localStorage.setItem(
              `${STORAGE_KEYS.EVENTS}_${effectiveUserId}`,
              JSON.stringify(mapped)
            );
          }
          return mapped;
        }
      } catch (err) {
        console.warn("Supabase fetch failed for planner_events, fallback to seed", err);
      }
    }

    // Default Seed Events
    const seed = generateSeedEvents(effectiveUserId);
    if (typeof window !== "undefined") {
      localStorage.setItem(`${STORAGE_KEYS.EVENTS}_${effectiveUserId}`, JSON.stringify(seed));
    }
    return seed;
  },

  async saveEvent(event: any): Promise<PlannerEvent> {
    const effectiveUserId = event.userId || event.user_id || "demo-user";
    const now = new Date().toISOString();

    const normalized: PlannerEvent = {
      id: event.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      userId: effectiveUserId,
      user_id: effectiveUserId,
      title: event.title,
      type: event.type || event.event_type || "STUDY",
      event_type: event.event_type || event.type || "study",
      date: event.date,
      startTime: event.startTime || event.start_time || "09:00",
      start_time: event.start_time || event.startTime || "09:00",
      endTime: event.endTime || event.end_time,
      end_time: event.end_time || event.endTime,
      durationMinutes: event.durationMinutes || event.duration_minutes || 60,
      duration_minutes: event.duration_minutes || event.durationMinutes || 60,
      streamId: event.streamId || event.stream_id || "sciences_exp",
      stream_id: event.stream_id || event.streamId || "sciences_exp",
      subjectId: event.subjectId || event.subject_id,
      subject_id: event.subject_id || event.subjectId,
      skillId: event.skillId || event.skill_id,
      skill_id: event.skill_id || event.skillId,
      priority: event.priority || "MEDIUM",
      status: event.status || "TODO",
      notes: event.notes || event.description,
      description: event.description || event.notes,
      source: event.source || "MANUAL",
      completedAt: event.completedAt || event.completed_at,
      completed_at: event.completed_at || event.completedAt,
      createdAt: event.createdAt || event.created_at || now,
      created_at: event.created_at || event.createdAt || now,
      updatedAt: now,
      updated_at: now,
    };

    // 1. Update localStorage
    if (typeof window !== "undefined") {
      try {
        const events = this.getEvents(effectiveUserId);
        const index = events.findIndex((e) => e.id === normalized.id);
        if (index >= 0) {
          events[index] = normalized;
        } else {
          events.push(normalized);
        }
        localStorage.setItem(`${STORAGE_KEYS.EVENTS}_${effectiveUserId}`, JSON.stringify(events));
      } catch (err) {
        console.warn("Failed to write event to localStorage", err);
      }
    }

    // 2. Sync to Supabase in background
    if (Boolean(isSupabaseConfigured) && supabase && effectiveUserId !== "demo-user") {
      try {
        await supabase.from("planner_events").upsert({
          id: normalized.id,
          user_id: effectiveUserId,
          title: normalized.title,
          type: normalized.type,
          date: normalized.date,
          start_time: normalized.startTime,
          end_time: normalized.endTime || null,
          duration_minutes: normalized.durationMinutes,
          stream_id: normalized.streamId,
          subject_id: normalized.subjectId || null,
          skill_id: normalized.skillId || null,
          priority: normalized.priority,
          status: normalized.status,
          notes: normalized.notes || null,
          source: normalized.source,
          completed_at: normalized.completedAt || null,
          updated_at: now,
        });
      } catch (err) {
        console.warn("Background Supabase upsert failed for planner event", err);
      }
    }

    return normalized;
  },

  async bulkSaveEvents(newEvents: any[], userId: string = "demo-user"): Promise<void> {
    for (const evt of newEvents) {
      await this.saveEvent({ ...evt, userId });
    }
  },

  async deleteEvent(eventId: string, userId?: string): Promise<void> {
    const effectiveUserId = userId || "demo-user";

    if (typeof window !== "undefined") {
      try {
        const events = this.getEvents(effectiveUserId);
        const filtered = events.filter((e) => e.id !== eventId);
        localStorage.setItem(`${STORAGE_KEYS.EVENTS}_${effectiveUserId}`, JSON.stringify(filtered));
      } catch (err) {
        console.warn("Failed to delete event in localStorage", err);
      }
    }

    if (Boolean(isSupabaseConfigured) && supabase && effectiveUserId !== "demo-user") {
      try {
        await supabase.from("planner_events").delete().eq("id", eventId).eq("user_id", effectiveUserId);
      } catch (err) {
        console.warn("Supabase delete failed for event", err);
      }
    }
  },

  // ============================================================================
  // 2. STUDY SESSIONS
  // ============================================================================
  async loadStudySessions(userId?: string): Promise<StudySession[]> {
    const effectiveUserId = userId || "demo-user";

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`${STORAGE_KEYS.SESSIONS}_${effectiveUserId}`);
        if (raw) return JSON.parse(raw);
      } catch (err) {
        console.warn("Failed to read study sessions from localStorage", err);
      }
    }

    if (Boolean(isSupabaseConfigured) && supabase && userId && userId !== "demo-user") {
      try {
        const { data, error } = await supabase
          .from("study_sessions")
          .select("*")
          .eq("user_id", userId)
          .order("started_at", { ascending: false });

        if (!error && data) {
          const mapped: StudySession[] = data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            eventId: d.event_id,
            streamId: d.stream_id,
            subjectId: d.subject_id,
            skillId: d.skill_id,
            plannedDurationMinutes: d.planned_duration_minutes,
            actualDurationSeconds: d.actual_duration_seconds,
            startedAt: d.started_at,
            endedAt: d.ended_at,
            status: d.status,
            interruptionsCount: d.interruptions_count,
            notes: d.notes,
            createdAt: d.created_at,
          }));
          return mapped;
        }
      } catch (err) {
        console.warn("Supabase load failed for study_sessions", err);
      }
    }

    return [];
  },

  async saveStudySession(session: StudySession): Promise<StudySession> {
    const effectiveUserId = session.userId || "demo-user";

    if (typeof window !== "undefined") {
      try {
        const sessions = await this.loadStudySessions(effectiveUserId);
        const index = sessions.findIndex((s) => s.id === session.id);
        if (index >= 0) sessions[index] = session;
        else sessions.unshift(session);
        localStorage.setItem(`${STORAGE_KEYS.SESSIONS}_${effectiveUserId}`, JSON.stringify(sessions));
      } catch (err) {
        console.warn("Failed to write study session to localStorage", err);
      }
    }

    if (Boolean(isSupabaseConfigured) && supabase && session.userId && session.userId !== "demo-user") {
      try {
        await supabase.from("study_sessions").upsert({
          id: session.id,
          user_id: session.userId,
          event_id: session.eventId || null,
          stream_id: session.streamId,
          subject_id: session.subjectId,
          skill_id: session.skillId || null,
          planned_duration_minutes: session.plannedDurationMinutes,
          actual_duration_seconds: session.actualDurationSeconds,
          started_at: session.startedAt,
          ended_at: session.endedAt || null,
          status: session.status,
          interruptions_count: session.interruptionsCount,
          notes: session.notes || null,
        });
      } catch (err) {
        console.warn("Supabase upsert failed for study session", err);
      }
    }

    return session;
  },

  // ============================================================================
  // 3. DAILY REFLECTIONS
  // ============================================================================
  getReflection(date: string, userId: string = "demo-user"): DailyReflection | null {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`${STORAGE_KEYS.REFLECTIONS}_${userId}`);
        if (raw) {
          const reflections: DailyReflection[] = JSON.parse(raw);
          return reflections.find((r) => r.date === date) || null;
        }
      } catch (e) {}
    }
    const seed = generateSeedReflections(userId);
    return seed.find((r) => r.date === date) || null;
  },

  async loadReflections(userId?: string): Promise<DailyReflection[]> {
    const effectiveUserId = userId || "demo-user";

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`${STORAGE_KEYS.REFLECTIONS}_${effectiveUserId}`);
        if (raw) return JSON.parse(raw);
      } catch (err) {
        console.warn("Failed to read reflections from localStorage", err);
      }
    }

    if (Boolean(isSupabaseConfigured) && supabase && userId && userId !== "demo-user") {
      try {
        const { data, error } = await supabase
          .from("daily_reflections")
          .select("*")
          .eq("user_id", userId)
          .order("date", { ascending: false });

        if (!error && data) {
          const mapped: DailyReflection[] = data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            user_id: d.user_id,
            date: d.date,
            whatLearned: d.what_learned,
            learned_today: d.what_learned,
            dayMood: d.day_mood,
            mood: d.day_mood,
            hardestPart: d.hardest_part,
            hardest_challenge: d.hardest_part,
            tomorrowGoal: d.tomorrow_goal,
            tomorrow_goal: d.tomorrow_goal,
            gratitudeNote: d.gratitude_note,
            gratitude_note: d.gratitude_note,
            createdAt: d.created_at,
            created_at: d.created_at,
            updatedAt: d.updated_at,
            updated_at: d.updated_at,
          }));
          return mapped;
        }
      } catch (err) {
        console.warn("Supabase load failed for daily_reflections", err);
      }
    }

    const seed = generateSeedReflections(effectiveUserId);
    if (typeof window !== "undefined") {
      localStorage.setItem(`${STORAGE_KEYS.REFLECTIONS}_${effectiveUserId}`, JSON.stringify(seed));
    }
    return seed;
  },

  async saveReflection(reflection: any): Promise<DailyReflection> {
    const effectiveUserId = reflection.userId || reflection.user_id || "demo-user";
    const now = new Date().toISOString();

    const normalized: DailyReflection = {
      id: reflection.id || `refl-${reflection.date}-${Date.now()}`,
      userId: effectiveUserId,
      user_id: effectiveUserId,
      date: reflection.date,
      whatLearned: reflection.whatLearned || reflection.learned_today || "",
      learned_today: reflection.learned_today || reflection.whatLearned || "",
      dayMood: reflection.dayMood || reflection.mood || "GOOD",
      mood: reflection.mood || reflection.dayMood || "good",
      hardestPart: reflection.hardestPart || reflection.hardest_challenge,
      hardest_challenge: reflection.hardest_challenge || reflection.hardestPart,
      tomorrowGoal: reflection.tomorrowGoal || reflection.tomorrow_goal,
      tomorrow_goal: reflection.tomorrow_goal || reflection.tomorrow_goal,
      gratitudeNote: reflection.gratitudeNote || reflection.gratitude_note,
      gratitude_note: reflection.gratitude_note || reflection.gratitudeNote,
      createdAt: reflection.createdAt || reflection.created_at || now,
      created_at: reflection.created_at || reflection.createdAt || now,
      updatedAt: now,
      updated_at: now,
    };

    if (typeof window !== "undefined") {
      try {
        const reflections = await this.loadReflections(effectiveUserId);
        const index = reflections.findIndex((r) => r.id === normalized.id || r.date === normalized.date);
        if (index >= 0) reflections[index] = normalized;
        else reflections.unshift(normalized);
        localStorage.setItem(`${STORAGE_KEYS.REFLECTIONS}_${effectiveUserId}`, JSON.stringify(reflections));
      } catch (err) {
        console.warn("Failed to save reflection to localStorage", err);
      }
    }

    if (Boolean(isSupabaseConfigured) && supabase && effectiveUserId !== "demo-user") {
      try {
        await supabase.from("daily_reflections").upsert({
          id: normalized.id,
          user_id: effectiveUserId,
          date: normalized.date,
          what_learned: normalized.whatLearned,
          day_mood: normalized.dayMood,
          hardest_part: normalized.hardestPart || null,
          tomorrow_goal: normalized.tomorrowGoal || null,
          updated_at: now,
        });
      } catch (err) {
        console.warn("Supabase upsert failed for daily reflection", err);
      }
    }

    return normalized;
  },

  // ============================================================================
  // 4. PREFERENCES
  // ============================================================================
  async loadPreferences(userId?: string): Promise<PlannerPreferences> {
    const effectiveUserId = userId || "demo-user";

    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`${STORAGE_KEYS.PREFERENCES}_${effectiveUserId}`);
        if (raw) return JSON.parse(raw);
      } catch (err) {
        console.warn("Failed to read planner preferences from localStorage", err);
      }
    }

    if (Boolean(isSupabaseConfigured) && supabase && userId && userId !== "demo-user") {
      try {
        const { data, error } = await supabase
          .from("planner_preferences")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (!error && data) {
          const prefs: PlannerPreferences = {
            userId: data.user_id,
            themePreference: data.theme_preference,
            planningStyle: data.planning_style,
            preferredStudyTimes: data.preferred_study_times,
            studyDays: data.study_days,
            fixedCommitments: data.fixed_commitments || [],
            dailyStudyTargetMinutes: data.daily_study_target_minutes,
            bacTargetScore: Number(data.bac_target_score) || 15.0,
            updatedAt: data.updated_at,
          };
          return prefs;
        }
      } catch (err) {
        console.warn("Supabase load failed for planner_preferences", err);
      }
    }

    return getDefaultPreferences(effectiveUserId);
  },

  async savePreferences(prefs: PlannerPreferences): Promise<PlannerPreferences> {
    const effectiveUserId = prefs.userId || "demo-user";

    if (typeof window !== "undefined") {
      localStorage.setItem(`${STORAGE_KEYS.PREFERENCES}_${effectiveUserId}`, JSON.stringify(prefs));
    }

    if (Boolean(isSupabaseConfigured) && supabase && prefs.userId && prefs.userId !== "demo-user") {
      try {
        await supabase.from("planner_preferences").upsert({
          user_id: prefs.userId,
          theme_preference: prefs.themePreference,
          planning_style: prefs.planningStyle,
          preferred_study_times: prefs.preferredStudyTimes,
          study_days: prefs.studyDays,
          fixed_commitments: prefs.fixedCommitments,
          daily_study_target_minutes: prefs.dailyStudyTargetMinutes,
          bac_target_score: prefs.bacTargetScore,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Supabase upsert failed for planner preferences", err);
      }
    }

    return prefs;
  },

  // ============================================================================
  // 5. NOTIFICATION PREFERENCES
  // ============================================================================
  getNotificationPreferences(userId: string = "demo-user"): NotificationPreferences {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`${STORAGE_KEYS.NOTIF_PREFS}_${userId}`);
        if (raw) return JSON.parse(raw);
      } catch (err) {}
    }
    return getDefaultNotificationPreferences(userId);
  },

  async loadNotificationPreferences(userId?: string): Promise<NotificationPreferences> {
    const effectiveUserId = userId || "demo-user";
    return this.getNotificationPreferences(effectiveUserId);
  },

  async saveNotificationPreferences(prefs: NotificationPreferences): Promise<NotificationPreferences> {
    const effectiveUserId = prefs.userId || prefs.user_id || "demo-user";

    if (typeof window !== "undefined") {
      localStorage.setItem(`${STORAGE_KEYS.NOTIF_PREFS}_${effectiveUserId}`, JSON.stringify(prefs));
    }

    if (Boolean(isSupabaseConfigured) && supabase && effectiveUserId !== "demo-user") {
      try {
        await supabase.from("notification_preferences").upsert({
          user_id: effectiveUserId,
          morning_reminder: prefs.morningReminder ?? prefs.morning_brief,
          upcoming_task_reminder: prefs.upcomingTaskReminder ?? prefs.task_reminders,
          task_start_reminder: prefs.taskStartReminder,
          completion_encouragement: prefs.completionEncouragement,
          evening_reflection_reminder: prefs.eveningReflectionReminder ?? prefs.evening_reflection,
          spiritual_reminders: prefs.spiritualReminders ?? prefs.spiritual_reminders,
          morning_time: prefs.morningTime,
          evening_time: prefs.eveningTime,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn("Supabase upsert failed for notification preferences", err);
      }
    }

    return prefs;
  },
};
