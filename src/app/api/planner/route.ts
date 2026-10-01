import { NextResponse } from "next/server";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { createAuthenticatedSupabaseClient, isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { getAlgeriaDateString, calculateAuthoritativeStreak } from "@/lib/planner/algeria-date";
import { ALGERIAN_BAC_STREAMS, ALL_SUBJECTS, getStreamSubjects } from "@/lib/constants/streams";
import { StreamId, SubjectId } from "@/types/education";

export const dynamic = "force-dynamic";

/**
 * GET /api/planner
 * Authoritatively retrieves all planner data, events, sessions, reflections, preferences,
 * and calculates real-time streak, weekly stats, and stream progress from PostgreSQL.
 * Strict RLS & server-side authorization: caller only receives their own data.
 */
export async function GET(req: Request) {
  try {
    const callerId = await extractAuthenticatedUserId(req);

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;

    if (!callerId) {
      return NextResponse.json({
        authenticated: false,
        studentProfile: null,
        events: [],
        sessions: [],
        reflections: [],
        preferences: null,
        notificationPreferences: null,
        stats: {
          todayCompletedCount: 0,
          todayTotalCount: 0,
          todayStudyTimeMinutes: 0,
          weekCompletedCount: 0,
          weekTotalCount: 0,
          weekStudyTimeMinutes: 0,
          weekSubjectsCount: 0,
          weekProgressDelta: 0,
          streakDays: 0,
        },
        weeklyStats: {
          completedTasks: 0,
          totalTasks: 0,
          completionRate: 0,
          totalStudyMinutes: 0,
          subjectsStudiedCount: 0,
          weeklyProgressRate: 0,
          currentStreak: 0,
        },
        subjectProgress: [],
      });
    }

    const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;

    if (!isSupabaseConfigured || !client) {
      return NextResponse.json({ success: false, error: "Database service unavailable" }, { status: 503 });
    }

    const todayIso = getAlgeriaDateString();

    // Query all student planner data in parallel
    const [profileRes, eventsRes, sessionsRes, reflectionsRes, prefsRes, notifRes] = await Promise.all([
      client.from("student_profiles").select("*").eq("id", callerId).maybeSingle(),
      client
        .from("planner_events")
        .select("*")
        .eq("user_id", callerId)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true }),
      client
        .from("study_sessions")
        .select("*")
        .eq("user_id", callerId)
        .order("started_at", { ascending: false }),
      client
        .from("daily_reflections")
        .select("*")
        .eq("user_id", callerId)
        .order("date", { ascending: false }),
      client.from("planner_preferences").select("*").eq("user_id", callerId).maybeSingle(),
      client.from("notification_preferences").select("*").eq("user_id", callerId).maybeSingle(),
    ]);

    const profile = profileRes.data;
    const rawEvents = eventsRes.data || [];
    const rawSessions = sessionsRes.data || [];
    const rawReflections = reflectionsRes.data || [];
    const preferences = prefsRes.data;
    const notificationPreferences = notifRes.data;

    // Normalize events
    const events = rawEvents.map((e: any) => ({
      id: e.id,
      userId: e.user_id,
      user_id: e.user_id,
      title: e.title,
      type: e.type,
      event_type: e.type?.toLowerCase(),
      date: e.date,
      startTime: e.start_time,
      start_time: e.start_time,
      endTime: e.end_time,
      end_time: e.end_time,
      durationMinutes: e.duration_minutes,
      duration_minutes: e.duration_minutes,
      streamId: e.stream_id,
      stream_id: e.stream_id,
      subjectId: e.subject_id,
      subject_id: e.subject_id,
      skillId: e.skill_id,
      skill_id: e.skill_id,
      priority: e.priority,
      status: e.status,
      notes: e.notes,
      description: e.notes,
      source: e.source,
      completedAt: e.completed_at,
      completed_at: e.completed_at,
      createdAt: e.created_at,
      created_at: e.created_at,
      updatedAt: e.updated_at,
      updated_at: e.updated_at,
    }));

    // Normalize sessions
    const sessions = rawSessions.map((s: any) => ({
      id: s.id,
      userId: s.user_id,
      user_id: s.user_id,
      eventId: s.event_id,
      event_id: s.event_id,
      streamId: s.stream_id,
      stream_id: s.stream_id,
      subjectId: s.subject_id,
      subject_id: s.subject_id,
      skillId: s.skill_id,
      skill_id: s.skill_id,
      plannedDurationMinutes: s.planned_duration_minutes,
      actualDurationSeconds: s.actual_duration_seconds,
      startedAt: s.started_at,
      started_at: s.started_at,
      endedAt: s.ended_at,
      ended_at: s.ended_at,
      status: s.status,
      interruptionsCount: s.interruptions_count,
      notes: s.notes,
      createdAt: s.created_at,
    }));

    // Normalize reflections
    const reflections = rawReflections.map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      user_id: r.user_id,
      date: r.date,
      what_learned: r.what_learned,
      learned_today: r.what_learned,
      day_mood: r.day_mood,
      mood: r.day_mood?.toLowerCase(),
      hardest_part: r.hardest_part,
      hardest_challenge: r.hardest_part,
      tomorrow_goal: r.tomorrow_goal,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));

    // 1. Authoritative Streak Calculation (No fake numbers)
    const streakDays = calculateAuthoritativeStreak(events, sessions, reflections, todayIso);

    // 2. Today's metrics
    const todayEvents = events.filter((e) => e.date === todayIso);
    const todayCompleted = todayEvents.filter((e) => e.status === "COMPLETED" || e.status === "completed");

    // Study minutes today from actual sessions + completed tasks
    const todaySessionMinutes = Math.round(
      sessions
        .filter((s) => s.started_at?.startsWith(todayIso))
        .reduce((sum, s) => sum + (s.actualDurationSeconds || 0), 0) / 60
    );
    const todayTaskMinutes = todayCompleted.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
    const todayStudyMinutes = Math.max(todaySessionMinutes, todayTaskMinutes);

    // 3. Weekly metrics (Saturday to Friday)
    const [tY, tM, tD] = todayIso.split("-").map(Number);
    const refDate = new Date(Date.UTC(tY, tM - 1, tD, 12, 0, 0));
    const jsDay = refDate.getUTCDay();
    const daysSinceSat = (jsDay + 1) % 7;
    const saturday = new Date(refDate);
    saturday.setUTCDate(refDate.getUTCDate() - daysSinceSat);
    const weekStartIso = saturday.toISOString().split("T")[0];

    const weekEvents = events.filter((e) => e.date >= weekStartIso);
    const weekCompleted = weekEvents.filter((e) => e.status === "COMPLETED" || e.status === "completed");
    const weekTotalCount = weekEvents.length;
    const weekCompletedCount = weekCompleted.length;
    const completionRate = weekTotalCount > 0 ? Math.round((weekCompletedCount / weekTotalCount) * 100) : 0;

    const weekSessionMinutes = Math.round(
      sessions
        .filter((s) => s.started_at && s.started_at >= weekStartIso)
        .reduce((sum, s) => sum + (s.actualDurationSeconds || 0), 0) / 60
    );
    const weekTaskMinutes = weekCompleted.reduce((sum, e) => sum + (e.duration_minutes || 0), 0);
    const weekStudyTimeMinutes = Math.max(weekSessionMinutes, weekTaskMinutes);

    const weekSubjectsSet = new Set<string>();
    for (const e of weekCompleted) {
      if (e.subject_id) weekSubjectsSet.add(e.subject_id);
    }
    for (const s of sessions) {
      if (s.started_at && s.started_at >= weekStartIso && s.subject_id) {
        weekSubjectsSet.add(s.subject_id);
      }
    }

    // 4. Stream-aware subject progress
    const activeStreamId = (profile?.stream_id || "sciences_exp") as StreamId;
    const streamRules = getStreamSubjects(activeStreamId) || [];

    const subjectColors: Record<string, string> = {
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
    };

    const subjectProgress = streamRules.map((rule) => {
      const subjId = rule.subjectId as SubjectId;
      const subjMeta = ALL_SUBJECTS[subjId];

      // Total minutes completed for this subject
      const subjectEvents = events.filter(
        (e) => (e.status === "COMPLETED" || e.status === "completed") && e.subject_id === subjId
      );
      const subjectSessions = sessions.filter((s) => s.subject_id === subjId);

      const sessMins = Math.round(
        subjectSessions.reduce((acc, s) => acc + (s.actualDurationSeconds || 0), 0) / 60
      );
      const evtMins = subjectEvents.reduce((acc, e) => acc + (e.duration_minutes || 0), 0);
      const completedMins = Math.max(sessMins, evtMins);

      // Target minutes based on BAC coefficient (approx 60 mins per coeff point per week benchmark)
      const targetMins = Math.max(rule.coefficient * 60, 120);
      const progressPercent = Math.min(Math.round((completedMins / targetMins) * 100), 100);

      return {
        subjectId: subjId,
        subjectName: subjMeta?.name_fr || subjId,
        subjectNameAr: subjMeta?.name_ar || subjId,
        nameFr: subjMeta?.name_fr || subjId,
        nameAr: subjMeta?.name_ar || subjId,
        coefficient: rule.coefficient,
        isCore: rule.isCoreSubject,
        minutesCompleted: completedMins,
        targetMinutes: targetMins,
        progressPercentage: progressPercent,
        progressPercent,
        color: subjectColors[subjId] || "bg-blue-500",
      };
    });

    return NextResponse.json({
      authenticated: true,
      studentProfile: profile
        ? {
            id: profile.id,
            firstName: profile.first_name,
            lastName: profile.last_name,
            streamId: profile.stream_id,
            targetScore: Number(profile.target_score) || 16.0,
            accessStatus: profile.access_status,
          }
        : null,
      events,
      sessions,
      reflections,
      preferences: preferences || {
        daily_study_target_minutes: 120,
        bac_target_score: 16.0,
        theme_preference: "boys",
        planning_style: "HYBRID",
      },
      notificationPreferences: notificationPreferences || {
        morning_reminder: true,
        upcoming_task_reminder: true,
        task_start_reminder: true,
        evening_reflection_reminder: true,
        spiritual_reminders: false,
      },
      stats: {
        todayCompletedCount: todayCompleted.length,
        todayTotalCount: todayEvents.length,
        todayStudyTimeMinutes: todayStudyMinutes,
        weekCompletedCount,
        weekTotalCount,
        weekStudyTimeMinutes,
        weekSubjectsCount: weekSubjectsSet.size,
        weekProgressDelta: completionRate,
        streakDays,
      },
      weeklyStats: {
        completedTasks: weekCompletedCount,
        totalTasks: weekTotalCount,
        completionRate,
        totalStudyMinutes: weekStudyTimeMinutes,
        subjectsStudiedCount: weekSubjectsSet.size,
        weeklyProgressRate: completionRate,
        currentStreak: streakDays,
      },
      subjectProgress,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[GET /api/planner] Error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
