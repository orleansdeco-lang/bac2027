import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { requireServerAuth } from "@/lib/auth/server-guard";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    if (!roomId) {
      return NextResponse.json({ success: false, error: "Missing roomId" }, { status: 400 });
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ success: true, count: 0, hasRsvp: false });
    }

    // Get count
    const { count, error } = await supabase
      .from("majlis_rsvp")
      .select("*", { count: "exact", head: true })
      .eq("room_id", roomId);

    if (error) {
      console.warn("[Campus RSVP GET] Query error:", error);
      return NextResponse.json({ success: true, count: 0, hasRsvp: false });
    }

    // Optional check for current user
    const authResult = await requireServerAuth(req);
    let hasRsvp = false;
    if (authResult.authenticated && authResult.userId) {
      const { data: userRsvp } = await supabase
        .from("majlis_rsvp")
        .select("id")
        .eq("room_id", roomId)
        .eq("user_id", authResult.userId)
        .maybeSingle();

      hasRsvp = Boolean(userRsvp);
    }

    return NextResponse.json({
      success: true,
      count: count || 0,
      hasRsvp,
    });
  } catch (err) {
    console.error("[Campus RSVP GET] Exception:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireServerAuth(req);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { roomId, willAttend = true } = body;

    if (!roomId || typeof roomId !== "string") {
      return NextResponse.json({ success: false, error: "Invalid roomId" }, { status: 400 });
    }

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json({ success: true, willAttend, count: willAttend ? 1 : 0 });
    }

    if (willAttend) {
      await supabase.from("majlis_rsvp").upsert(
        {
          room_id: roomId,
          user_id: authResult.userId,
          created_at: new Date().toISOString(),
        },
        { onConflict: "room_id,user_id" }
      );
    } else {
      await supabase
        .from("majlis_rsvp")
        .delete()
        .eq("room_id", roomId)
        .eq("user_id", authResult.userId);
    }

    const { count } = await supabase
      .from("majlis_rsvp")
      .select("*", { count: "exact", head: true })
      .eq("room_id", roomId);

    return NextResponse.json({
      success: true,
      willAttend,
      count: count || 0,
    });
  } catch (err) {
    console.error("[Campus RSVP POST] Exception:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
