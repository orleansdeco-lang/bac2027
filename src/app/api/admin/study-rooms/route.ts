import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { createAuthenticatedSupabaseClient, isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { recordAdminAudit } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/study-rooms
 * Lists live and scheduled study rooms and tables for moderation.
 * Authoritative Guard: Requires 'study_rooms.read'.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("study_rooms.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const client = getAdminClient() || (authResult.context.token ? createAuthenticatedSupabaseClient(authResult.context.token) : null) || supabase;

  let rooms: any[] = [];

  if (isSupabaseConfigured && client) {
    try {
      const { data, error } = await client
        .from("study_rooms")
        .select("*, room_participants(count)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        rooms = data;
      }
    } catch (err) {
      console.warn("[AdminStudyRooms] Fetch error:", err);
    }
  }

  return NextResponse.json({ success: true, rooms });
}

/**
 * PATCH /api/admin/study-rooms
 * Moderates a study room (closes room, updates topic, or changes capacity).
 * Authoritative Guard: Requires 'study_rooms.manage'.
 */
export async function PATCH(req: Request) {
  const authResult = await requirePermission("study_rooms.manage", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;
  const client = getAdminClient() || (context.token ? createAuthenticatedSupabaseClient(context.token) : null) || supabase;

  try {
    const body = await req.json();
    const { roomId, action, reason } = body;

    if (!roomId || !action) {
      return NextResponse.json({ success: false, error: "Missing roomId or action" }, { status: 400 });
    }

    if (action === "CLOSE_ROOM" && isSupabaseConfigured && client) {
      await client
        .from("study_rooms")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", roomId);

      await recordAdminAudit(
        {
          actorUserId: context.userId,
          actorRole: context.role,
          action: "STUDY_ROOM_CLOSED",
          resourceType: "study_room",
          resourceId: roomId,
          reason: reason || "Closed by admin moderator",
        },
        context.token
      );

      return NextResponse.json({ success: true, message: "تم إغلاق الغرفة بنجاح." });
    }

    return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Failed to moderate room" }, { status: 500 });
  }
}
