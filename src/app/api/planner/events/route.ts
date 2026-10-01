import { NextResponse } from "next/server";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { createAuthenticatedSupabaseClient, isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import {
  CreatePlannerEventSchema,
  ValidEventTypes,
  ValidPriorities,
  ValidEventStatuses,
  normalizeUpperEnum,
} from "@/lib/planner/schemas";

export const dynamic = "force-dynamic";

/**
 * POST /api/planner/events
 * Authoritatively creates a new planner task in PostgreSQL public.planner_events.
 * Enforces ownership: user_id is strictly derived from authenticated caller session.
 */
export async function POST(req: Request) {
  try {
    const callerId = await extractAuthenticatedUserId(req);
    if (!callerId) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لإنشاء مهمة دراسية." },
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
    const parsed = CreatePlannerEventSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "بيانات المهمة غير صالحة";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const data = parsed.data;

    const normalizedType = normalizeUpperEnum(data.type, ValidEventTypes, "STUDY");
    const normalizedPriority = normalizeUpperEnum(data.priority, ValidPriorities, "MEDIUM");
    const normalizedStatus = normalizeUpperEnum(data.status, ValidEventStatuses, "TODO");
    const normalizedSource = normalizeUpperEnum(data.source, ["MANUAL", "AI", "ROADMAP", "RECURRING"] as const, "MANUAL");

    const payload = {
      user_id: callerId,
      title: data.title,
      type: normalizedType,
      date: data.date,
      start_time: data.start_time || "18:00",
      end_time: data.end_time || null,
      duration_minutes: data.duration_minutes,
      stream_id: data.stream_id || "sciences_exp",
      subject_id: data.subject_id || null,
      skill_id: data.skill_id || null,
      priority: normalizedPriority,
      status: normalizedStatus,
      notes: data.notes || null,
      source: normalizedSource,
      completed_at: normalizedStatus === "COMPLETED" ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: created, error } = await client
      .from("planner_events")
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error("[POST /api/planner/events] Insert error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        event: {
          id: created.id,
          userId: created.user_id,
          user_id: created.user_id,
          title: created.title,
          type: created.type,
          event_type: created.type?.toLowerCase(),
          date: created.date,
          startTime: created.start_time,
          start_time: created.start_time,
          endTime: created.end_time,
          end_time: created.end_time,
          durationMinutes: created.duration_minutes,
          duration_minutes: created.duration_minutes,
          streamId: created.stream_id,
          stream_id: created.stream_id,
          subjectId: created.subject_id,
          subject_id: created.subject_id,
          skillId: created.skill_id,
          skill_id: created.skill_id,
          priority: created.priority,
          status: created.status,
          notes: created.notes,
          description: created.notes,
          source: created.source,
          completedAt: created.completed_at,
          completed_at: created.completed_at,
          createdAt: created.created_at,
          created_at: created.created_at,
          updatedAt: created.updated_at,
          updated_at: created.updated_at,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
