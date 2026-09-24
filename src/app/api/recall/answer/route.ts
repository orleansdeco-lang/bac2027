import { NextResponse } from "next/server";
import { RecallRepository } from "@/lib/repositories/recall-repository";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let token: string | null = null;
    let verifiedUserId: string | null = null;
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ") && isSupabaseConfigured && supabase) {
      token = authHeader.replace(/^Bearer\s+/i, "").trim();
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user?.id) verifiedUserId = user.id;
      } catch {
        // ignore
      }
    }

    const body = await req.json().catch(() => null);
    if (!body || !body.questionId || body.selectedOptionIndex === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing questionId or selectedOptionIndex" },
        { status: 400 }
      );
    }

    const userId = verifiedUserId || body.userId || "anonymous-student";
    const source = body.source === "inline_push" ? "inline_push" : "in_app";

    const result = await RecallRepository.submitAnswer(
      userId,
      {
        questionId: body.questionId,
        selectedOptionIndex: Number(body.selectedOptionIndex),
        source,
      },
      { token }
    );

    // Record Telemetry Event directly to Supabase if client is ready
    if (isSupabaseConfigured && supabase) {
      try {
        const client = token ? createServerSupabaseClient(token) || supabase : supabase;
        const eventName = source === "inline_push" ? "recall_answered_inline" : "recall_answered_in_app";
        await client.from("telemetry_events").insert({
          event_id: `rec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          anonymous_id: userId,
          session_id: "recall_session",
          user_id: verifiedUserId,
          event_name: eventName,
          occurred_at: new Date().toISOString(),
          route: "/student/arena/quick-recall",
          content_id: body.questionId,
          metadata: {
            question_id: body.questionId,
            selected_option: body.selectedOptionIndex,
            is_correct: result.is_correct,
            box_level: result.new_box_level,
            is_in_error_lab: result.is_in_error_lab,
            source,
          },
        });

        if (result.remediated) {
          await client.from("telemetry_events").insert({
            event_id: `rem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            anonymous_id: userId,
            session_id: "recall_session",
            user_id: verifiedUserId,
            event_name: "error_lab_item_remediated",
            occurred_at: new Date().toISOString(),
            route: "/student/error-lab",
            content_id: body.questionId,
            metadata: {
              question_id: body.questionId,
              final_box_level: result.new_box_level,
            },
          });
        }
      } catch (telErr) {
        console.warn("[RecallAnswerRoute] Telemetry logging error:", telErr);
      }
    }

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: any) {
    console.error("[RecallAnswerRoute] Exception:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal error evaluating answer" },
      { status: 500 }
    );
  }
}
