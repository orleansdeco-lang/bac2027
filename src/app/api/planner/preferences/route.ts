import { NextResponse } from "next/server";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { createAuthenticatedSupabaseClient, isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { UpdatePlannerPreferencesSchema } from "@/lib/planner/schemas";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/planner/preferences
 * Updates planner settings, BAC target score, theme, and reminders.
 */
export async function PATCH(req: Request) {
  try {
    const callerId = await extractAuthenticatedUserId(req);
    if (!callerId) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لتعديل الإعدادات." },
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
    const parsed = UpdatePlannerPreferencesSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "بيانات الإعدادات غير صالحة";
      return NextResponse.json({ success: false, error: firstError }, { status: 400 });
    }

    const data = parsed.data;
    const nowIso = new Date().toISOString();

    const updates: PromiseLike<any>[] = [];

    // 1. Planner Preferences
    const plannerPrefPayload: Record<string, any> = {
      user_id: callerId,
      updated_at: nowIso,
    };
    if (data.bac_target_score !== undefined) {
      plannerPrefPayload.bac_target_score = data.bac_target_score;
    }
    if (data.daily_study_target_minutes !== undefined) {
      plannerPrefPayload.daily_study_target_minutes = data.daily_study_target_minutes;
    }
    if (data.theme_preference !== undefined) {
      plannerPrefPayload.theme_preference = data.theme_preference;
    }
    if (data.planning_style !== undefined) {
      plannerPrefPayload.planning_style = data.planning_style;
    }

    updates.push(
      client
        .from("planner_preferences")
        .upsert(plannerPrefPayload, { onConflict: "user_id" })
    );

    // 2. If target score updated, synchronize with student_profiles
    if (data.bac_target_score !== undefined) {
      updates.push(
        client
          .from("student_profiles")
          .update({
            target_score: data.bac_target_score,
            updated_at: nowIso,
          })
          .eq("id", callerId)
      );
    }

    // 3. If spiritual reminders updated, update notification_preferences
    if (data.spiritual_reminders !== undefined) {
      updates.push(
        client
          .from("notification_preferences")
          .upsert(
            {
              user_id: callerId,
              spiritual_reminders: data.spiritual_reminders,
              updated_at: nowIso,
            },
            { onConflict: "user_id" }
          )
      );
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: "تم تحديث الإعدادات بنجاح." });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
