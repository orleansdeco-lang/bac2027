import { NextResponse } from "next/server";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { createAuthenticatedSupabaseClient, isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import {
  UpdatePlannerEventSchema,
  ValidEventTypes,
  ValidPriorities,
  ValidEventStatuses,
  normalizeUpperEnum,
} from "@/lib/planner/schemas";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/planner/events/[id]
 * Updates, toggles, or reschedules an existing planner task.
 * Enforces ownership: only the owner can modify their task.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const callerId = await extractAuthenticatedUserId(req);
    if (!callerId) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لتعديل المهمة." },
        { status: 401 }
      );
    }

    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json({ success: false, error: "معرف المهمة مطلوب." }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;

    const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
    if (!isSupabaseConfigured || !client) {
      return NextResponse.json({ success: false, error: "Database service unavailable" }, { status: 503 });
    }

    // 1. Fetch existing event to verify ownership
    const { data: existing, error: fetchErr } = await client
      .from("planner_events")
      .select("*")
      .eq("id", eventId)
      .maybeSingle();

    if (fetchErr || !existing) {
      return NextResponse.json({ success: false, error: "المهمة غير موجودة." }, { status: 404 });
    }

    if (existing.user_id !== callerId) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بتعديل هذه المهمة." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    const parsed = UpdatePlannerEventSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "بيانات التعديل غير صالحة";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const data = parsed.data;
    const nowIso = new Date().toISOString();
    const updatePayload: Record<string, any> = {
      updated_at: nowIso,
    };

    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.type !== undefined) {
      updatePayload.type = normalizeUpperEnum(data.type, ValidEventTypes, existing.type);
    }
    if (data.duration_minutes !== undefined) updatePayload.duration_minutes = data.duration_minutes;
    if (data.priority !== undefined) {
      updatePayload.priority = normalizeUpperEnum(data.priority, ValidPriorities, existing.priority);
    }
    if (data.subject_id !== undefined) updatePayload.subject_id = data.subject_id;
    if (data.skill_id !== undefined) updatePayload.skill_id = data.skill_id;

    // Rescheduling logic (Phase 8: maintain history, prevent duplicate tasks)
    if (data.new_date) {
      updatePayload.date = data.new_date;
      if (data.new_start_time) {
        updatePayload.start_time = data.new_start_time;
      }
      updatePayload.status = "TODO";
      updatePayload.completed_at = null;

      const reasonNote = data.reschedule_reason
        ? ` (أُجلت من ${existing.date}: ${data.reschedule_reason})`
        : ` (أُجلت من ${existing.date})`;
      const baseNote = data.notes !== undefined ? data.notes : (existing.notes || "");
      updatePayload.notes = baseNote ? `${baseNote}${reasonNote}` : reasonNote.trim();
    } else {
      if (data.date !== undefined) updatePayload.date = data.date;
      if (data.start_time !== undefined) updatePayload.start_time = data.start_time;
      if (data.end_time !== undefined) updatePayload.end_time = data.end_time;
      if (data.notes !== undefined) updatePayload.notes = data.notes;

      // Status updates
      if (data.status !== undefined) {
        const nextStatus = normalizeUpperEnum(data.status, ValidEventStatuses, existing.status);
        updatePayload.status = nextStatus;

        if (nextStatus === "COMPLETED") {
          updatePayload.completed_at = data.completed_at || nowIso;
        } else if (nextStatus === "TODO" || nextStatus === "IN_PROGRESS") {
          updatePayload.completed_at = null;
        }
      }
    }

    const { data: updated, error: updateErr } = await client
      .from("planner_events")
      .update(updatePayload)
      .eq("id", eventId)
      .select()
      .single();

    if (updateErr) {
      console.error("[PATCH /api/planner/events/[id]] Error:", updateErr);
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      event: {
        id: updated.id,
        userId: updated.user_id,
        user_id: updated.user_id,
        title: updated.title,
        type: updated.type,
        event_type: updated.type?.toLowerCase(),
        date: updated.date,
        startTime: updated.start_time,
        start_time: updated.start_time,
        endTime: updated.end_time,
        end_time: updated.end_time,
        durationMinutes: updated.duration_minutes,
        duration_minutes: updated.duration_minutes,
        streamId: updated.stream_id,
        stream_id: updated.stream_id,
        subjectId: updated.subject_id,
        subject_id: updated.subject_id,
        skillId: updated.skill_id,
        skill_id: updated.skill_id,
        priority: updated.priority,
        status: updated.status,
        notes: updated.notes,
        description: updated.notes,
        source: updated.source,
        completedAt: updated.completed_at,
        completed_at: updated.completed_at,
        createdAt: updated.created_at,
        created_at: updated.created_at,
        updatedAt: updated.updated_at,
        updated_at: updated.updated_at,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/planner/events/[id]
 * Deletes a planner event. Only the owner can delete their task.
 */
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const callerId = await extractAuthenticatedUserId(req);
    if (!callerId) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لحذف المهمة." },
        { status: 401 }
      );
    }

    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json({ success: false, error: "معرف المهمة مطلوب." }, { status: 400 });
    }

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;

    const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
    if (!isSupabaseConfigured || !client) {
      return NextResponse.json({ success: false, error: "Database service unavailable" }, { status: 503 });
    }

    // Verify ownership first
    const { data: existing } = await client
      .from("planner_events")
      .select("id, user_id")
      .eq("id", eventId)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ success: false, error: "المهمة غير موجودة." }, { status: 404 });
    }

    if (existing.user_id !== callerId) {
      return NextResponse.json(
        { success: false, error: "غير مصرح لك بحذف هذه المهمة." },
        { status: 403 }
      );
    }

    const { error: delErr } = await client
      .from("planner_events")
      .delete()
      .eq("id", eventId)
      .eq("user_id", callerId);

    if (delErr) {
      return NextResponse.json({ success: false, error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "تم حذف المهمة بنجاح." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
