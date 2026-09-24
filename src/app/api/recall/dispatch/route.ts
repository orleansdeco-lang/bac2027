import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { sendQuestionPushNotification } from "@/lib/notifications/web-push-sender";
import { RecallRepository } from "@/lib/repositories/recall-repository";
import { FlashQuestion } from "@/types/recall";

export const dynamic = "force-dynamic";

/**
 * Checks if current time is within active hours window (HH:mm)
 */
function isWithinActiveHours(startTimeStr: string, endTimeStr: string, now: Date = new Date()): boolean {
  try {
    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTotalMin = currentHour * 60 + currentMin;

    const [startH, startM] = (startTimeStr || "08:00").split(":").map(Number);
    const [endH, endM] = (endTimeStr || "22:00").split(":").map(Number);

    const startTotalMin = (startH || 8) * 60 + (startM || 0);
    const endTotalMin = (endH || 22) * 60 + (endM || 0);

    if (startTotalMin <= endTotalMin) {
      return currentTotalMin >= startTotalMin && currentTotalMin <= endTotalMin;
    } else {
      // Overnight range (e.g. 21:00 to 02:00)
      return currentTotalMin >= startTotalMin || currentTotalMin <= endTotalMin;
    }
  } catch {
    return true;
  }
}

export async function GET(req: Request) {
  return handleDispatch(req);
}

export async function POST(req: Request) {
  return handleDispatch(req);
}

async function handleDispatch(req: Request) {
  const { searchParams } = new URL(req.url);
  const targetUserId = searchParams.get("userId");
  const force = searchParams.get("force") === "true";

  const adminClient = getAdminClient() || supabase;
  if (!adminClient) {
    return NextResponse.json(
      { success: false, error: "Database client not available" },
      { status: 500 }
    );
  }

  try {
    // 1. Query notification preferences
    let query = adminClient
      .from("notification_preferences")
      .select(`
        user_id,
        frequency_minutes,
        active_hours_start,
        active_hours_end,
        enabled_subjects,
        push_subscription,
        is_active,
        last_notification_sent_at
      `)
      .eq("is_active", true)
      .not("push_subscription", "is", null);

    if (targetUserId) {
      query = query.eq("user_id", targetUserId);
    }

    const { data: candidates, error } = await query;
    if (error) {
      console.error("[RecallDispatch] Error fetching candidate users:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const now = new Date();
    const results: Array<{
      userId: string;
      status: "dispatched" | "skipped_inactive_hours" | "skipped_frequency" | "failed";
      reason?: string;
      questionId?: string;
    }> = [];

    for (const pref of candidates || []) {
      const userId = pref.user_id;

      // Check active hours
      if (!force && !isWithinActiveHours(pref.active_hours_start, pref.active_hours_end, now)) {
        results.push({
          userId,
          status: "skipped_inactive_hours",
          reason: `Current time outside ${pref.active_hours_start}-${pref.active_hours_end}`,
        });
        continue;
      }

      // Check frequency
      if (!force && pref.last_notification_sent_at) {
        const lastSent = new Date(pref.last_notification_sent_at);
        const diffMinutes = (now.getTime() - lastSent.getTime()) / (1000 * 60);
        if (diffMinutes < (pref.frequency_minutes || 60)) {
          results.push({
            userId,
            status: "skipped_frequency",
            reason: `Only ${Math.round(diffMinutes)}m elapsed since last notification (freq: ${pref.frequency_minutes}m)`,
          });
          continue;
        }
      }

      // Fetch student profile for stream and term
      let studentStream = "sciences_exp";
      let studentTerm = 1;
      try {
        const { data: profile } = await adminClient
          .from("student_profiles")
          .select("stream_id, current_term")
          .eq("id", userId)
          .single();

        if (profile) {
          if (profile.stream_id) studentStream = profile.stream_id;
          if (profile.current_term) studentTerm = profile.current_term;
        }
      } catch {
        // fallback
      }

      // Get smart question for the student
      const dueQuestions = await RecallRepository.getDueQuestions(userId, {
        limit: 1,
        studentStream,
        studentTerm,
      });

      if (dueQuestions.length === 0) {
        results.push({
          userId,
          status: "failed",
          reason: "No available questions for student stream and term",
        });
        continue;
      }

      const selectedQuestion: FlashQuestion = dueQuestions[0];
      const subscription = pref.push_subscription;

      // Dispatch Web Push with Actionable Buttons
      const pushResult = await sendQuestionPushNotification(subscription, selectedQuestion);

      if (pushResult.success) {
        // Update last_notification_sent_at
        await adminClient
          .from("notification_preferences")
          .update({
            last_notification_sent_at: now.toISOString(),
            updated_at: now.toISOString(),
          })
          .eq("user_id", userId);

        // Record telemetry event: recall_notification_sent
        try {
          await adminClient.from("telemetry_events").insert({
            event_id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            anonymous_id: userId,
            session_id: "push_dispatcher",
            user_id: userId,
            event_name: "recall_notification_sent",
            occurred_at: now.toISOString(),
            route: "/api/recall/dispatch",
            stream: selectedQuestion.stream,
            subject: selectedQuestion.subject,
            content_id: selectedQuestion.id,
            metadata: {
              question_id: selectedQuestion.id,
              subject: selectedQuestion.subject,
              term: selectedQuestion.term,
              question_type: selectedQuestion.question_type,
            },
          });
        } catch (tErr) {
          console.warn("[RecallDispatch] Failed to log telemetry event:", tErr);
        }

        results.push({
          userId,
          status: "dispatched",
          questionId: selectedQuestion.id,
        });
      } else {
        results.push({
          userId,
          status: "failed",
          reason: pushResult.error,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: candidates?.length || 0,
      dispatchedCount: results.filter((r) => r.status === "dispatched").length,
      results,
    });
  } catch (err: any) {
    console.error("[RecallDispatch] Unhandled dispatcher exception:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal dispatcher failure" },
      { status: 500 }
    );
  }
}
