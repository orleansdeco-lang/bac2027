import { NextResponse } from "next/server";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { createAuthenticatedSupabaseClient, isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { CreateStudySessionSchema } from "@/lib/planner/schemas";

export const dynamic = "force-dynamic";

/**
 * POST /api/planner/sessions
 * Records a real timer-tracked study session in PostgreSQL public.study_sessions.
 * Enforces ownership and optionally updates the linked planner task to COMPLETED.
 */
export async function POST(req: Request) {
  try {
    const callerId = await extractAuthenticatedUserId(req);
    if (!callerId) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لتسجيل جلسة المذاكرة." },
        { status: 401 }
      );
    }

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;

    const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
    if (!isSupabaseConfigured || !client) {
      return NextResponse.json({ success: false, error: "Database service unavailable" }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    const parsed = CreateStudySessionSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "بيانات جلسة المذاكرة غير صالحة";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const data = parsed.data;
    const nowIso = new Date().toISOString();
    const startedAt = data.started_at || new Date(Date.now() - (data.actual_duration_seconds || 0) * 1000).toISOString();
    const endedAt = data.ended_at || nowIso;

    // Verify linked event belongs to user if provided
    if (data.event_id) {
      const { data: linkedEvent } = await client
        .from("planner_events")
        .select("id, user_id, duration_minutes")
        .eq("id", data.event_id)
        .maybeSingle();

      if (linkedEvent && linkedEvent.user_id !== callerId) {
        return NextResponse.json(
          { success: false, error: "المهمة المرتبطة لا تنتمي إلى حسابك." },
          { status: 403 }
        );
      }
    }

    const sessionPayload = {
      user_id: callerId,
      event_id: data.event_id || null,
      stream_id: data.stream_id || "sciences_exp",
      subject_id: data.subject_id,
      skill_id: data.skill_id || null,
      planned_duration_minutes: data.planned_duration_minutes,
      actual_duration_seconds: data.actual_duration_seconds,
      started_at: startedAt,
      ended_at: endedAt,
      status: data.status,
      interruptions_count: data.interruptions_count,
      notes: data.notes || null,
      created_at: nowIso,
    };

    const { data: createdSession, error: sessionErr } = await client
      .from("study_sessions")
      .insert(sessionPayload)
      .select()
      .single();

    if (sessionErr) {
      console.error("[POST /api/planner/sessions] Error:", sessionErr);
      return NextResponse.json({ success: false, error: sessionErr.message }, { status: 500 });
    }

    // Optionally mark linked task as completed
    if (data.event_id && data.mark_event_completed && data.status === "COMPLETED") {
      await client
        .from("planner_events")
        .update({
          status: "COMPLETED",
          completed_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", data.event_id)
        .eq("user_id", callerId);
    }

    return NextResponse.json(
      {
        success: true,
        session: {
          id: createdSession.id,
          userId: createdSession.user_id,
          eventId: createdSession.event_id,
          streamId: createdSession.stream_id,
          subjectId: createdSession.subject_id,
          skillId: createdSession.skill_id,
          plannedDurationMinutes: createdSession.planned_duration_minutes,
          actualDurationSeconds: createdSession.actual_duration_seconds,
          startedAt: createdSession.started_at,
          endedAt: createdSession.ended_at,
          status: createdSession.status,
          interruptionsCount: createdSession.interruptions_count,
          notes: createdSession.notes,
          createdAt: createdSession.created_at,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
