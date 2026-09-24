import { NextResponse } from "next/server";
import { RecallRepository } from "@/lib/repositories/recall-repository";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { RecallQuestionWithState } from "@/types/recall";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "anonymous-student";
    const targetQuestionId = searchParams.get("questionId");
    const limit = Math.min(10, Math.max(1, parseInt(searchParams.get("limit") || "3", 10)));
    const queryTerm = parseInt(searchParams.get("term") || "1", 10);
    const queryStream = searchParams.get("stream") || "sciences_exp";

    let studentTerm = isNaN(queryTerm) ? 1 : queryTerm;
    let studentStream = queryStream;

    // Try fetching actual student profile from Supabase if userId is a valid UUID
    if (isSupabaseConfigured && supabase && userId.length > 20) {
      try {
        const { data: profile } = await supabase
          .from("student_profiles")
          .select("stream_id, current_term")
          .eq("id", userId)
          .single();

        if (profile) {
          if (profile.current_term) studentTerm = profile.current_term;
          if (profile.stream_id) studentStream = profile.stream_id;
        }
      } catch {
        // fallback to query params
      }
    }

    const sprintQuestions: RecallQuestionWithState[] = [];

    // If targetQuestionId is provided (e.g. from notification deep link)
    if (targetQuestionId) {
      const targetQ = await RecallRepository.getQuestionById(targetQuestionId);
      if (targetQ && targetQ.term <= studentTerm) {
        sprintQuestions.push({
          ...targetQ,
          priority_tier: 0,
        });
      }
    }

    // Fetch due questions (prioritizing Error Lab then Spaced Reviews then new)
    const needed = limit - sprintQuestions.length;
    if (needed > 0) {
      const dueQuestions = await RecallRepository.getDueQuestions(userId, {
        limit: needed * 2,
        studentTerm,
        studentStream,
      });

      for (const q of dueQuestions) {
        if (!sprintQuestions.some((existing) => existing.id === q.id)) {
          sprintQuestions.push(q);
          if (sprintQuestions.length >= limit) break;
        }
      }
    }

    return NextResponse.json({
      success: true,
      questions: sprintQuestions,
      meta: {
        studentTerm,
        studentStream,
        total: sprintQuestions.length,
      },
    });
  } catch (err: any) {
    console.error("[RecallSprintRoute] Error generating sprint:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load sprint questions" },
      { status: 500 }
    );
  }
}
