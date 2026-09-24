import { NextResponse } from "next/server";
import { RecallRepository } from "@/lib/repositories/recall-repository";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

async function getAuthenticatedUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ") && isSupabaseConfigured && supabase) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    try {
      const { data: { user } } = await supabase.auth.getUser(token);
      if (user?.id) return user.id;
    } catch {
      // ignore
    }
  }
  return null;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userIdFromQuery = searchParams.get("userId");
    const verifiedUserId = await getAuthenticatedUserId(req);
    const userId = verifiedUserId || userIdFromQuery;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const preferences = await RecallRepository.getNotificationPreferences(userId);
    return NextResponse.json({ success: true, preferences });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load preferences" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const verifiedUserId = await getAuthenticatedUserId(req);
    const body = await req.json().catch(() => null);

    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const userId = verifiedUserId || body.userId || body.user_id;
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const updated = await RecallRepository.saveNotificationPreferences({
      user_id: userId,
      frequency_minutes: body.frequency_minutes || body.frequencyMinutes || 60,
      active_hours_start: body.active_hours_start || body.activeHoursStart || "08:00",
      active_hours_end: body.active_hours_end || body.activeHoursEnd || "22:00",
      enabled_subjects: body.enabled_subjects || body.enabledSubjects || ["تاريخ", "جغرافيا", "إسلامية", "فلسفة"],
      push_subscription: body.push_subscription !== undefined ? body.push_subscription : body.pushSubscription,
      is_active: body.is_active !== undefined ? body.is_active : (body.isActive !== undefined ? body.isActive : true),
    });

    return NextResponse.json({ success: true, preferences: updated });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save preferences" },
      { status: 500 }
    );
  }
}
