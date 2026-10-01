import { NextResponse } from "next/server";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { createAuthenticatedSupabaseClient, isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { SaveDailyReflectionSchema, ValidDayMoods, normalizeUpperEnum } from "@/lib/planner/schemas";

export const dynamic = "force-dynamic";

/**
 * POST /api/planner/reflection
 * Upserts a daily evening reflection in PostgreSQL public.daily_reflections.
 * Unique constraint on (user_id, date).
 */
export async function POST(req: Request) {
  try {
    const callerId = await extractAuthenticatedUserId(req);
    if (!callerId) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لتدوين انطباع اليوم." },
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
    const parsed = SaveDailyReflectionSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "بيانات الانطباع غير صالحة";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const data = parsed.data;

    // Map client moods ('great', 'good', 'neutral', 'hard', 'tired') to database CHECK ('EXCELLENT', 'GOOD', 'AVERAGE', 'DIFFICULT')
    let dbMood: "EXCELLENT" | "GOOD" | "AVERAGE" | "DIFFICULT" = "GOOD";
    const rawMood = (data.day_mood || "").toUpperCase();
    if (rawMood === "GREAT" || rawMood === "EXCELLENT") dbMood = "EXCELLENT";
    else if (rawMood === "GOOD") dbMood = "GOOD";
    else if (rawMood === "NEUTRAL" || rawMood === "AVERAGE") dbMood = "AVERAGE";
    else if (rawMood === "HARD" || rawMood === "DIFFICULT" || rawMood === "TIRED") dbMood = "DIFFICULT";

    const nowIso = new Date().toISOString();
    const payload = {
      user_id: callerId,
      date: data.date,
      what_learned: data.what_learned,
      day_mood: dbMood,
      hardest_part: data.hardest_part || null,
      tomorrow_goal: data.tomorrow_goal || null,
      updated_at: nowIso,
    };

    const { data: upserted, error } = await client
      .from("daily_reflections")
      .upsert(payload, { onConflict: "user_id,date" })
      .select()
      .single();

    if (error) {
      console.error("[POST /api/planner/reflection] Error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reflection: {
        id: upserted.id,
        userId: upserted.user_id,
        user_id: upserted.user_id,
        date: upserted.date,
        what_learned: upserted.what_learned,
        learned_today: upserted.what_learned,
        day_mood: upserted.day_mood,
        mood: upserted.day_mood?.toLowerCase(),
        hardest_part: upserted.hardest_part,
        hardest_challenge: upserted.hardest_part,
        tomorrow_goal: upserted.tomorrow_goal,
        created_at: upserted.created_at,
        updated_at: upserted.updated_at,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
