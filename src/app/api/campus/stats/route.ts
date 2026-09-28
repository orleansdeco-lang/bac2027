import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let activeRoomsCount = 0;
    let activeStudentsCount = 0;
    let completedSessionsToday = 0;

    if (isSupabaseConfigured && supabase) {
      // 1. Active rooms
      const { count: roomsCount } = await supabase
        .from("majlis_rooms")
        .select("*", { count: "exact", head: true })
        .eq("status", "ACTIVE");
      activeRoomsCount = roomsCount || 0;

      // 2. Active students currently seated
      const { count: membersCount } = await supabase
        .from("majlis_members")
        .select("*", { count: "exact", head: true });
      activeStudentsCount = membersCount || 0;

      // 3. Completed study sessions today
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const { count: sessionsCount } = await supabase
        .from("study_sessions")
        .select("*", { count: "exact", head: true })
        .eq("status", "COMPLETED")
        .gte("started_at", startOfToday.toISOString());
      completedSessionsToday = sessionsCount || 0;
    }

    return NextResponse.json({
      success: true,
      stats: {
        activeRoomsCount,
        activeStudentsCount,
        completedSessionsToday,
      },
    });
  } catch (err) {
    console.error("[API Campus Stats] Error:", err);
    return NextResponse.json({
      success: true,
      stats: {
        activeRoomsCount: 0,
        activeStudentsCount: 0,
        completedSessionsToday: 0,
      },
    });
  }
}
