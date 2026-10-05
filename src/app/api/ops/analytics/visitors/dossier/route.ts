import { NextResponse } from "next/server";
import { extractAndVerifyOperator, extractTokenFromCookies } from "@/lib/operations/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "@/lib/supabase/client";
import { generateGuestStudentNumber, formatDwellDuration } from "@/lib/operations/visitors-analytics";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/analytics/visitors/dossier
 * Returns complete dossier and chronological page journey for a specific visitor or registered student.
 * 
 * Query Params:
 * - userId: optional Supabase user UUID
 * - visitorId: optional persistent visitor ID (e.g. vid_...)
 * - sessionId: optional session ID (e.g. ses_...)
 * - id: optional fallback identifier
 */
export async function GET(req: Request) {
  const operator = await extractAndVerifyOperator(req);
  if (!operator) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Operator access required" },
      { status: 403 }
    );
  }

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  let token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;
  if (!token) {
    const cookieHeader = req.headers.get("cookie") || req.headers.get("Cookie");
    token = extractTokenFromCookies(cookieHeader);
  }

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") || url.searchParams.get("user_id") || undefined;
  const visitorId = url.searchParams.get("visitorId") || url.searchParams.get("visitor_id") || undefined;
  const sessionId = url.searchParams.get("sessionId") || url.searchParams.get("session_id") || undefined;
  const genericId = url.searchParams.get("id") || undefined;

  const effectiveVisitorId = visitorId || (genericId?.startsWith("vid_") || genericId?.startsWith("anon_") ? genericId : undefined);
  const effectiveSessionId = sessionId || (genericId?.startsWith("ses_") ? genericId : undefined);
  const effectiveUserId = userId || (genericId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(genericId) ? genericId : undefined);

  if (!effectiveUserId && !effectiveVisitorId && !effectiveSessionId && !genericId) {
    return NextResponse.json(
      { success: false, error: "Missing visitor or user identifier" },
      { status: 400 }
    );
  }

  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
  if (!client) {
    return NextResponse.json(
      { success: false, error: "Database client unavailable" },
      { status: 503 }
    );
  }

  try {
    let studentProfile: any = null;
    let paymentOrders: any[] = [];

    // 1. If user ID is available, fetch student profile and payment orders
    if (effectiveUserId) {
      try {
        const { data: prof } = await client
          .from("student_profiles")
          .select("*")
          .or(`id.eq.${effectiveUserId},user_id.eq.${effectiveUserId}`)
          .maybeSingle();
        if (prof) studentProfile = prof;
      } catch (err: any) {
        console.warn("[OPS_DOSSIER] student_profiles lookup error:", err?.message);
      }

      try {
        const { data: orders } = await client
          .from("payment_orders")
          .select("id, status, plan, amount, payment_method, submitted_at, reviewed_at, created_at, rejection_reason")
          .eq("user_id", effectiveUserId)
          .order("created_at", { ascending: false });
        if (Array.isArray(orders)) paymentOrders = orders;
      } catch (err: any) {
        console.warn("[OPS_DOSSIER] payment_orders lookup error:", err?.message);
      }
    }

    // 2. Query all matching sessions (excluding internal /ops and /admin routes)
    let sessions: any[] = [];
    try {
      let query = client
        .from("analytics_sessions")
        .select("*")
        .not("landing_page", "like", "/ops%")
        .not("landing_page", "like", "/admin%");

      if (effectiveUserId) {
        query = query.eq("user_id", effectiveUserId);
      } else if (effectiveVisitorId) {
        query = query.or(`visitor_id.eq.${effectiveVisitorId},anonymous_id.eq.${effectiveVisitorId},session_id.eq.${effectiveSessionId || effectiveVisitorId}`);
      } else if (effectiveSessionId) {
        query = query.eq("session_id", effectiveSessionId);
      } else if (genericId) {
        query = query.or(`session_id.eq.${genericId},anonymous_id.eq.${genericId},visitor_id.eq.${genericId}`);
      }

      const { data: sessData, error: sessErr } = await query.order("started_at", { ascending: false }).limit(50);
      if (!sessErr && Array.isArray(sessData)) {
        sessions = sessData;
      }
    } catch (err: any) {
      console.warn("[OPS_DOSSIER] sessions lookup exception:", err?.message);
    }

    // If session had a user_id and we haven't loaded profile yet, try loading it
    if (!studentProfile && sessions.length > 0) {
      const foundUserId = sessions.find((s) => s.user_id)?.user_id;
      if (foundUserId) {
        try {
          const { data: prof } = await client
            .from("student_profiles")
            .select("*")
            .or(`id.eq.${foundUserId},user_id.eq.${foundUserId}`)
            .maybeSingle();
          if (prof) studentProfile = prof;
        } catch {}
      }
    }

    // 3. Query all matching events (chronological journey)
    const sessionIds = sessions.map((s) => s.session_id).filter(Boolean);
    let events: any[] = [];
    try {
      let evQuery = client
        .from("analytics_events")
        .select("event_id, session_id, anonymous_id, user_id, event_name, route, page_path, properties, occurred_at")
        .not("route", "like", "/ops%")
        .not("route", "like", "/admin%")
        .not("route", "like", "/api%")
        .order("occurred_at", { ascending: false })
        .limit(150);

      const orParts: string[] = [];
      if (effectiveUserId) {
        orParts.push(`user_id.eq.${effectiveUserId}`);
      }
      if (effectiveVisitorId) {
        orParts.push(`anonymous_id.eq.${effectiveVisitorId}`);
      }
      if (effectiveSessionId) {
        orParts.push(`session_id.eq.${effectiveSessionId}`);
      }
      if (sessionIds.length > 0) {
        sessionIds.slice(0, 20).forEach((sid) => {
          orParts.push(`session_id.eq.${sid}`);
        });
      }
      if (genericId && !orParts.some((p) => p.includes(genericId))) {
        orParts.push(`anonymous_id.eq.${genericId}`);
        orParts.push(`session_id.eq.${genericId}`);
      }

      if (orParts.length > 0) {
        evQuery = evQuery.or(orParts.join(","));
      }

      const { data: evData, error: evErr } = await evQuery;
      if (!evErr && Array.isArray(evData)) {
        events = evData.filter((ev) => {
          const r = ev.route || ev.page_path || "";
          return !r.startsWith("/ops") && !r.startsWith("/admin") && !r.startsWith("/api");
        });
      }
    } catch (err: any) {
      console.warn("[OPS_DOSSIER] events lookup exception:", err?.message);
    }

    // 4. Construct Identity Card
    const latestSession = sessions[0] || {};
    const earliestSession = sessions[sessions.length - 1] || latestSession;
    
    const isRegistered = Boolean(studentProfile || effectiveUserId);
    let displayName = "";

    if (studentProfile) {
      const fullName = [studentProfile.first_name, studentProfile.last_name].filter(Boolean).join(" ").trim() || "طالب مسجل";
      const wilayaPart = studentProfile.wilaya_code ? ` (ولاية ${studentProfile.wilaya_code})` : (studentProfile.wilaya_name ? ` (${studentProfile.wilaya_name})` : "");
      displayName = `${fullName}${wilayaPart}`;
    } else {
      const idForName = effectiveVisitorId || effectiveSessionId || genericId || "guest";
      displayName = generateGuestStudentNumber(idForName);
    }

    let totalDurationSeconds = 0;
    for (const s of sessions) {
      if (s.started_at && s.last_activity_at) {
        const dur = Math.max(0, Math.round((new Date(s.last_activity_at).getTime() - new Date(s.started_at).getTime()) / 1000));
        totalDurationSeconds += dur;
      }
    }

    // Calculate duration from events if sessions didn't accumulate
    if (totalDurationSeconds === 0) {
      for (const ev of events) {
        if (typeof ev.properties?.duration_seconds === "number") {
          totalDurationSeconds += ev.properties.duration_seconds;
        }
      }
    }

    // 5. Build timeline of page visits and actions
    const timeline = events.map((ev) => {
      const isLeave = ev.event_name === "page_leave";
      const props = ev.properties || {};
      const enteredAt = props.entered_at || (isLeave ? undefined : ev.occurred_at);
      const exitedAt = props.exited_at || (isLeave ? ev.occurred_at : undefined);
      const durSec = typeof props.duration_seconds === "number" ? props.duration_seconds : undefined;
      const formattedDur = props.formatted_duration || (durSec ? formatDwellDuration(durSec) : undefined);
      const page = props.path || ev.page_path || ev.route || "/";

      return {
        id: ev.event_id || `ev_${Math.random().toString(36).slice(2)}`,
        eventName: ev.event_name,
        page,
        occurredAt: ev.occurred_at,
        enteredAt,
        exitedAt,
        durationSeconds: durSec,
        formattedDuration: formattedDur,
        metadata: props,
      };
    });

    // 6. Summary per unique page visited
    const pageStatsMap: Record<string, { views: number; totalDurationSec: number; lastVisitedAt: string }> = {};
    for (const item of timeline) {
      const p = item.page || "/";
      if (!pageStatsMap[p]) {
        pageStatsMap[p] = { views: 0, totalDurationSec: 0, lastVisitedAt: item.occurredAt };
      }
      if (item.eventName === "page_view" || item.eventName === "page_leave") {
        pageStatsMap[p].views += 1;
      }
      if (item.durationSeconds) {
        pageStatsMap[p].totalDurationSec += item.durationSeconds;
      }
      if (new Date(item.occurredAt) > new Date(pageStatsMap[p].lastVisitedAt)) {
        pageStatsMap[p].lastVisitedAt = item.occurredAt;
      }
    }

    const pagesSummary = Object.entries(pageStatsMap)
      .map(([page, stat]) => ({
        page,
        views: stat.views || 1,
        totalDurationSeconds: stat.totalDurationSec,
        formattedDuration: formatDwellDuration(stat.totalDurationSec),
        lastVisitedAt: stat.lastVisitedAt,
      }))
      .sort((a, b) => b.views - a.views);

    return NextResponse.json({
      success: true,
      identity: {
        displayName,
        isRegistered,
        userId: effectiveUserId || studentProfile?.user_id || null,
        visitorId: effectiveVisitorId || latestSession.visitor_id || latestSession.anonymous_id || null,
        sessionId: effectiveSessionId || latestSession.session_id || null,
        profile: studentProfile ? {
          fullName: [studentProfile.first_name, studentProfile.last_name].filter(Boolean).join(" ").trim() || "طالب مسجل",
          firstName: studentProfile.first_name || null,
          lastName: studentProfile.last_name || null,
          studentPhone: studentProfile.student_phone || null,
          parentPhone: studentProfile.parent_phone || null,
          wilayaCode: studentProfile.wilaya_code || null,
          wilayaName: studentProfile.wilaya_name || null,
          communeName: studentProfile.commune_name || null,
          schoolName: studentProfile.school_name || null,
          streamId: studentProfile.stream_id || null,
          plan: studentProfile.plan || "PILOT_TRIAL",
          accessStatus: studentProfile.access_status || "TRIAL",
          createdAt: studentProfile.created_at || null,
          targetScore: studentProfile.target_score || null,
        } : null,
        orders: paymentOrders,
        device: {
          type: latestSession.device_type || "desktop",
          browser: latestSession.browser || "Other",
          os: latestSession.os || "Other",
        },
        attribution: {
          source: latestSession.first_utm_source || latestSession.last_utm_source || "direct",
          channel: latestSession.first_channel || latestSession.last_channel || "direct",
          campaign: latestSession.first_utm_campaign || latestSession.last_utm_campaign || null,
          referrer: latestSession.referrer || "direct",
          landingPage: earliestSession.landing_page || latestSession.landing_page || "/",
        },
        firstSeenAt: earliestSession.started_at || latestSession.started_at || timeline[timeline.length - 1]?.occurredAt || null,
        lastSeenAt: latestSession.last_activity_at || latestSession.started_at || timeline[0]?.occurredAt || null,
        totalSessions: Math.max(1, sessions.length),
        totalEvents: timeline.length,
        totalDurationSeconds,
        formattedTotalDuration: formatDwellDuration(totalDurationSeconds),
      },
      timeline,
      pagesSummary,
    });
  } catch (err: any) {
    console.error("[OPS_VISITOR_DOSSIER_ERROR]", err);
    return NextResponse.json(
      { success: false, error: "Failed to load visitor dossier", details: err?.message },
      { status: 500 }
    );
  }
}
