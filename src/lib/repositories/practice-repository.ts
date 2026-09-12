/**
 * BAC Mastery - Practice Repository
 * Handles logging of individual practice attempts in Supabase with LocalStorage fallback & sync
 */

import { PracticeSession } from "@/types/mission";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import { loadPracticeSessions, savePracticeSession as saveLocalPracticeSession, loadMissions } from "../mission/storage";

export const PracticeRepository = {
  async savePracticeSession(session: PracticeSession, userId?: string, skillId?: string): Promise<void> {
    saveLocalPracticeSession(session);

    if (isSupabaseConfigured && supabase && userId && session.responses.length > 0) {
      try {
        const resolvedSkillId = skillId || loadMissions()[session.missionId]?.skillId || "general_practice";
        const rows = session.responses.map((r) => ({
          mission_id: session.missionId,
          user_id: userId,
          skill_id: resolvedSkillId,
          question_id: r.questionId,
          attempt_type: session.isRetest ? "retest" : "practice",
          selected_answer: r.selectedAnswer,
          is_correct: r.isCorrect,
          confidence: r.confidence || 3,
          time_spent_seconds: r.responseTimeSeconds || 0,
          created_at: session.startedAt || new Date().toISOString(),
        }));

        await supabase.from("practice_attempts").insert(rows);
      } catch (err) {
        console.error("PracticeRepository.savePracticeSession error:", err);
      }
    }
  },

  getAllSessions(): Record<string, PracticeSession> {
    return loadPracticeSessions();
  },
};
