import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    let activeRoomsCount = 0;
    let activeStudentsCount = 0;
    let completedSessionsToday = 0;

    if (isSupabaseConfigured && supabase) {
      // 1. Query Active rooms
      const { count: roomsCount, error: roomsErr } = await supabase
        .from("majlis_rooms")
        .select("*", { count: "exact", head: true })
        .eq("status", "ACTIVE");

      if (!roomsErr && typeof roomsCount === "number") {
        activeRoomsCount = roomsCount;
      }

      // 2. Query Active students currently seated
      const { count: membersCount, error: membersErr } = await supabase
        .from("majlis_members")
        .select("*", { count: "exact", head: true });

      if (!membersErr && typeof membersCount === "number") {
        activeStudentsCount = membersCount;
      }

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

    const stats = {
      activeRoomsCount,
      activeStudentsCount,
      completedSessionsToday,
    };

    return NextResponse.json(
      {
        success: true,
        stats,
        // Flat aliases for backwards compatibility with any client reading root keys
        activeRoomsCount,
        activeStudentsCount,
        completedSessionsToday,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (err) {
    console.error("[API Campus Stats] Error:", err);
    return NextResponse.json(
      {
        success: true,
        stats: {
          activeRoomsCount: 0,
          activeStudentsCount: 0,
          completedSessionsToday: 0,
        },
        activeRoomsCount: 0,
        activeStudentsCount: 0,
        completedSessionsToday: 0,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  }
}
