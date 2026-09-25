import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireServerAuth } from "@/lib/auth/server-guard";
import { JoinTableSchema } from "@/lib/validation/campus-schemas";
import { MajlisSeat, MajlisTable } from "@/types/campus";
import { TableStore } from "@/lib/campus/table-store";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireServerAuth(req);
    if (!authResult.authenticated || !authResult.authorized) {
      if (authResult.errorResponse) return authResult.errorResponse;
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await req.json().catch(() => null);
    const parseResult = JoinTableSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { seatIndex } = parseResult.data;
    const tableId = params.id;
    const client = getAdminClient() || supabase;

    // 1. Fetch table details from Supabase or TableStore
    let table: any = null;
    if (isSupabaseConfigured && client) {
      try {
        const { data, error } = await client
          .from("majlis_tables")
          .select("*")
          .eq("id", tableId)
          .maybeSingle();
        if (!error && data) {
          table = data;
        }
      } catch (err) {
        console.warn("[API Join Table] Supabase lookup error:", err);
      }
    }

    if (!table) {
      table = TableStore.get(tableId);
    }

    if (!table) {
      return NextResponse.json({ success: false, error: "Table Not Found" }, { status: 404 });
    }

    // 2. STRICT SERVER STREAM ENFORCEMENT
    const studentStream =
      parseResult.data.student?.stream ||
      authResult.profile?.streamId ||
      (authResult.profile as any)?.stream ||
      "sciences_exp";

    if (studentStream !== table.stream) {
      return NextResponse.json(
        {
          success: false,
          error: "Stream Mismatch",
          message: `هذه الطاولة مخصصة لشعبة (${table.stream}) فقط. يمكنك المشاهدة فقط أو دعوة زميل من هذه الشعبة!`,
        },
        { status: 403 }
      );
    }

    // 3. Seat Occupancy Check
    const currentSeats: (MajlisSeat | null)[] = Array.isArray(table.seats) ? table.seats : [];
    if (seatIndex < 0 || seatIndex >= table.capacity) {
      return NextResponse.json({ success: false, error: "Invalid Seat Index" }, { status: 400 });
    }

    if (currentSeats[seatIndex] && currentSeats[seatIndex]?.studentId !== authResult.userId) {
      return NextResponse.json({ success: false, error: "Seat Already Taken" }, { status: 409 });
    }

    // Clean any other seat occupied by this user in this table
    const cleanedSeats = currentSeats.map((s) => (s?.studentId === authResult.userId ? null : s));

    const studentName =
      authResult.profile?.firstName ||
      (authResult.profile as any)?.nickname ||
      "طالب بكالوريا";

    cleanedSeats[seatIndex] = {
      seatIndex,
      studentId: authResult.userId!,
      studentName,
      avatar: "👨‍🎓",
      stream: studentStream,
      status: "SOLVING",
      statusPill: "يحل الآن ✍️",
      timerSeconds: 0,
      joinedAt: new Date().toISOString(),
    };

    // 4. Update in TableStore & Supabase Database
    TableStore.set(tableId, {
      ...table,
      seats: cleanedSeats,
    });

    if (client) {
      const { error: updateError } = await client
        .from("majlis_tables")
        .update({ seats: cleanedSeats, updated_at: new Date().toISOString() })
        .eq("id", tableId);

      if (updateError) {
        console.warn("[API Join Table] Database update warning:", updateError.message);
      }
    }

    return NextResponse.json({ success: true, seats: cleanedSeats });
  } catch (err) {
    console.error("[API Campus Table Join POST] Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
