/**
 * BAC Mastery - Retest Repository
 * Manages twin retest attempts in Supabase (table: retests) with LocalStorage fallback & sync
 */

import { supabase, isSupabaseConfigured } from "../supabase/client";

export interface RetestAttemptRecord {
  id: string;
  errorId: string;
  userId?: string;
  skillId: string;
  practiceQuestionId: string;
  retestQuestionId: string;
  isPassed: boolean;
  selectedAnswer: string;
  confidence: number;
  attemptedAt: string;
}

const LOCAL_STORAGE_RETESTS_KEY = "bac_mastery_retests";

function loadLocalRetests(): Record<string, RetestAttemptRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RETESTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalRetest(retest: RetestAttemptRecord): void {
  if (typeof window === "undefined") return;
  try {
    const records = loadLocalRetests();
    records[retest.id] = retest;
    localStorage.setItem(LOCAL_STORAGE_RETESTS_KEY, JSON.stringify(records));
  } catch (err) {
    console.error("Failed to save retest locally:", err);
  }
}

export const RetestRepository = {
  /**
   * Save a retest attempt
   */
  async saveRetest(retest: RetestAttemptRecord, userId?: string): Promise<void> {
    saveLocalRetest(retest);

    if (isSupabaseConfigured && supabase && userId) {
      try {
        const payload = {
          id: retest.id,
          error_id: retest.errorId,
          user_id: userId,
          skill_id: retest.skillId,
          practice_question_id: retest.practiceQuestionId,
          retest_question_id: retest.retestQuestionId,
          is_passed: retest.isPassed,
          selected_answer: retest.selectedAnswer,
          confidence: retest.confidence,
          attempted_at: retest.attemptedAt,
        };

        const { error } = await supabase
          .from("retests")
          .insert(payload);

        if (error) {
          console.error("RetestRepository.saveRetest error:", error);
        }
      } catch (err) {
        console.error("RetestRepository.saveRetest exception:", err);
      }
    }
  },

  /**
   * Get all retest attempts for an error
   */
  async getRetestsForError(errorId: string, userId?: string): Promise<RetestAttemptRecord[]> {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from("retests")
          .select("*")
          .eq("error_id", errorId)
          .eq("user_id", userId)
          .order("attempted_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((d) => ({
            id: d.id,
            errorId: d.error_id,
            userId: d.user_id,
            skillId: d.skill_id,
            practiceQuestionId: d.practice_question_id,
            retestQuestionId: d.retest_question_id,
            isPassed: d.is_passed,
            selectedAnswer: d.selected_answer,
            confidence: d.confidence,
            attemptedAt: d.attempted_at,
          }));
        }
      } catch (err) {
        console.error("RetestRepository.getRetestsForError exception:", err);
      }
    }

    const local = loadLocalRetests();
    return Object.values(local).filter((r) => r.errorId === errorId);
  },

  /**
   * Get all retest attempts for a user
   */
  async getAllRetests(userId?: string): Promise<RetestAttemptRecord[]> {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from("retests")
          .select("*")
          .eq("user_id", userId)
          .order("attempted_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((d) => ({
            id: d.id,
            errorId: d.error_id,
            userId: d.user_id,
            skillId: d.skill_id,
            practiceQuestionId: d.practice_question_id,
            retestQuestionId: d.retest_question_id,
            isPassed: d.is_passed,
            selectedAnswer: d.selected_answer,
            confidence: d.confidence,
            attemptedAt: d.attempted_at,
          }));
        }
      } catch (err) {
        console.error("RetestRepository.getAllRetests exception:", err);
      }
    }

    const local = loadLocalRetests();
    return Object.values(local);
  },

  /**
   * Sync local retests to cloud on sign in
   */
  async syncLocalToCloud(userId: string): Promise<void> {
    const local = loadLocalRetests();
    const retestsList = Object.values(local);
    if (retestsList.length === 0) return;

    if (isSupabaseConfigured && supabase) {
      for (const retest of retestsList) {
        await this.saveRetest(retest, userId);
      }
    }
  },
};
