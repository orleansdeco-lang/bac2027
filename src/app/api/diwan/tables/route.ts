import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { sanitizeSingleLine } from "@/lib/security/sanitize";
import { StreamId } from "@/types/education";
import { DiwanTable } from "@/types/diwan";
import { DiwanService } from "@/lib/diwan/diwan-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const stream = searchParams.get("stream") as StreamId | null;

    const tables = await DiwanService.fetchTables(stream || undefined);
    return NextResponse.json({ success: true, tables });
  } catch (err: any) {
    console.error("[API Diwan Tables GET] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, subject, topic, stream, capacity, durationMinutes, hostUserId } = body;

    if (!title || !subject || !topic) {
      return NextResponse.json(
        { success: false, error: "العنوان، المادة والموضوع مطلوبان لفتح طاولة." },
        { status: 400 }
      );
    }

    const cleanTitle = sanitizeSingleLine(title, 80);
    const cleanTopic = sanitizeSingleLine(topic, 100);

    const newTable = await DiwanService.createTable({
      title: cleanTitle,
      subject,
      topic: cleanTopic,
      stream: stream || "sciences_exp",
      capacity: Number(capacity) || 6,
      durationMinutes: Number(durationMinutes) || 45,
      hostUserId: hostUserId || undefined,
    });

    return NextResponse.json({ success: true, table: newTable });
  } catch (err: any) {
    console.error("[API Diwan Tables POST] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
