import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { sanitizeSingleLine } from "@/lib/security/sanitize";
import { MajlisRoom, MajlisStudyMode, getInitialMaterialForMode } from "@/lib/campus/majlis-service";
import { StreamId } from "@/types/education";

export const dynamic = "force-dynamic";

// In-memory cache for recent active rooms (serves as resilient fallback)
const memoryRooms = new Map<string, MajlisRoom>();

// UUID regex to validate Postgres UUID columns
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream") as StreamId | null;

    const client = getAdminClient() || supabase;
    let dbRooms: MajlisRoom[] = [];

    if (isSupabaseConfigured && client) {
      try {
        let query = client
          .from("majlis_rooms")
          .select("*")
          .eq("status", "ACTIVE")
          .order("created_at", { ascending: false })
          .limit(30);

        if (stream) {
          query = query.or(`stream.eq.${stream},stream.eq.ALL`);
        }

        const { data, error } = await query;
        if (!error && data) {
          dbRooms = data.map((d: any) => ({
            id: d.id,
            title: d.title,
            stream: d.stream as StreamId,
            subject: d.subject,
            lesson: d.lesson,
            mode: d.mode as MajlisStudyMode,
            host_user_id: d.host_user_id || d.active_material?.hostStudentId,
            capacity: d.capacity,
            status: d.status,
            current_step: d.current_step,
            duration_minutes: d.duration_minutes || d.active_material?.durationMinutes || 45,
            timer_end: d.timer_end,
            active_material: d.active_material,
            created_at: d.created_at,
            updated_at: d.updated_at,
          }));
        }
      } catch (dbErr) {
        console.warn("[API Campus Rooms GET] Database fetch error:", dbErr);
      }
    }

    // Merge with in-memory rooms that match
    const memoryList = Array.from(memoryRooms.values()).filter(
      (r) => r.status === "ACTIVE" && (!stream || r.stream === stream || (r.stream as string) === "ALL")
    );

    const mergedMap = new Map<string, MajlisRoom>();
    for (const r of dbRooms) mergedMap.set(r.id, r);
    for (const r of memoryList) {
      if (!mergedMap.has(r.id)) mergedMap.set(r.id, r);
    }

    return NextResponse.json({
      success: true,
      rooms: Array.from(mergedMap.values()),
    });
  } catch (err) {
    console.error("[API Campus Rooms GET] Unexpected error:", err);
    return NextResponse.json({ success: true, rooms: Array.from(memoryRooms.values()) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.title || !body.subject || !body.lesson) {
      return NextResponse.json(
        { success: false, error: "Missing required fields (title, subject, lesson)" },
        { status: 400 }
      );
    }

    const {
      title,
      stream = "sciences_exp",
      subject,
      lesson,
      mode = "PAPER_PRACTICE",
      capacity = 4,
      durationMinutes = 45,
      hostUserId,
      hostName = "طالب شاطر",
      hostAvatar = "/illustrations/characters/scholar.jpg",
    } = body;

    const roomId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const duration = Math.min(180, Math.max(15, Number(durationMinutes) || 45));
    const timerEnd = new Date(Date.now() + duration * 60 * 1000).toISOString();
    const material = getInitialMaterialForMode(mode, subject, lesson);

    // Embed rich metadata inside active_material for 100% preservation across all schema variants
    const activeMaterial = {
      ...(typeof material === "object" ? material : {}),
      durationMinutes: duration,
      hostStudentId: hostUserId || null,
      hostStudentName: hostName,
      hostStudentAvatar: hostAvatar,
    };

    const room: MajlisRoom = {
      id: roomId,
      title: sanitizeSingleLine(title, 150),
      stream,
      subject,
      lesson: sanitizeSingleLine(lesson, 100),
      mode,
      host_user_id: hostUserId,
      capacity: Math.min(8, Math.max(2, Number(capacity) || 4)),
      status: "ACTIVE",
      current_step: "SOLVING",
      duration_minutes: duration,
      timer_end: timerEnd,
      active_material: activeMaterial,
      created_at: now,
      updated_at: now,
    };

    // Store in memory for instant local availability
    memoryRooms.set(roomId, room);

    // Authoritative Supabase persistence with schema self-healing
    const client = getAdminClient() || supabase;
    if (isSupabaseConfigured && client) {
      // 1. Check if hostUserId is a valid UUID for the Postgres foreign key column
      const safeHostUserId = hostUserId && UUID_REGEX.test(hostUserId) ? hostUserId : null;

      // Base payload compatible with ALL Supabase schemas
      const basePayload: Record<string, any> = {
        id: room.id,
        title: room.title,
        stream: room.stream,
        subject: room.subject,
        lesson: room.lesson,
        mode: room.mode,
        host_user_id: safeHostUserId,
        capacity: room.capacity,
        status: room.status,
        current_step: room.current_step,
        timer_end: room.timer_end,
        active_material: room.active_material,
        created_at: room.created_at,
        updated_at: room.updated_at,
      };

      // Try inserting with duration_minutes first
      const fullPayload = {
        ...basePayload,
        duration_minutes: duration,
      };

      let { error: insertError } = await client.from("majlis_rooms").insert(fullPayload);

      // If duration_minutes does not exist in schema cache (PGRST204 or 42703), retry without it
      if (insertError && (insertError.code === "PGRST204" || (insertError as any).code === "42703")) {
        console.warn("[API Campus Rooms] duration_minutes column not found, falling back to base payload");
        const retryResult = await client.from("majlis_rooms").insert(basePayload);
        insertError = retryResult.error;
      }

      // If foreign key constraint failed on host_user_id, retry with null host_user_id
      if (insertError && (insertError.code === "23503" || insertError.code === "22P02")) {
        console.warn("[API Campus Rooms] host_user_id foreign key or syntax issue, retrying with null");
        const noHostPayload = { ...basePayload, host_user_id: null };
        const retryResult = await client.from("majlis_rooms").insert(noHostPayload);
        insertError = retryResult.error;
      }

      if (insertError) {
        console.error("[API Campus Rooms] Supabase insert warning:", insertError);
        // Note: we still return success with the in-memory room so student is NEVER blocked!
      }
    }

    return NextResponse.json({ success: true, room }, { status: 201 });
  } catch (err: any) {
    console.error("[API Campus Rooms POST] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create room" },
      { status: 500 }
    );
  }
}
