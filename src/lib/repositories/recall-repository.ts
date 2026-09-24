/**
 * BAC Mastery - Active Recall & Spaced Repetition Repository
 * Connects Learner UI, Web Push notifications, Supabase PostgreSQL, and Error Lab.
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { SEED_FLASH_QUESTIONS } from "@/data/flash-questions-bank";
import {
  FlashQuestion,
  NotificationPreferences,
  RecallAnswerResult,
  RecallAnswerSubmission,
  RecallQuestionWithState,
  StudentRecallState,
  ErrorLabSummary,
} from "@/types/recall";

const LOCAL_STORAGE_RECALL_STATES_KEY = "shater_recall_states_v1";
const LOCAL_STORAGE_PREFERENCES_KEY = "shater_recall_preferences_v1";

export class RecallRepository {
  /**
   * Helper: calculates next review date based on Leitner Box level.
   */
  static calculateNextReview(boxLevel: number, isInErrorLab: boolean): Date {
    const now = new Date();
    if (isInErrorLab) {
      // 4 hours for immediate remediation loop
      return new Date(now.getTime() + 4 * 60 * 60 * 1000);
    }

    switch (boxLevel) {
      case 1:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
      case 2:
        return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      case 3:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      case 4:
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
      case 5:
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  }

  /**
   * Evaluates if a question is compatible with the student's stream.
   */
  static isStreamCompatible(questionStream: string, studentStream?: string | null): boolean {
    if (!questionStream || questionStream === "all" || questionStream === "الكل") return true;
    if (!studentStream) return true;

    const s = studentStream.toLowerCase();
    const q = questionStream.toLowerCase();

    if (q === s) return true;

    // Scientific grouping
    if (["sciences_exp", "math", "technique_math"].includes(s) && (q === "scientific" || q === "علمي")) {
      return true;
    }

    // Literary grouping
    if (["lettres_philo", "langues_etrangeres"].includes(s) && (q === "literary" || q === "أدبي")) {
      return true;
    }

    return false;
  }

  /**
   * Fetches due questions for the student respecting current_term and stream.
   */
  static async getDueQuestions(
    userId: string,
    options: {
      limit?: number;
      studentTerm?: number;
      studentStream?: string;
      subject?: string;
      token?: string | null;
    } = {}
  ): Promise<RecallQuestionWithState[]> {
    const limit = options.limit || 5;
    const currentTerm = options.studentTerm || 1;
    const studentStream = options.studentStream || "sciences_exp";

    // 1. Try Supabase RPC if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const client = options.token ? createServerSupabaseClient(options.token) || supabase : supabase;
        const { data, error } = await client.rpc("get_due_recall_questions", {
          p_limit: limit,
          p_subject: options.subject || null,
        });

        if (!error && Array.isArray(data) && data.length > 0) {
          // Additional safety check on term
          return data
            .filter((q: any) => q.term <= currentTerm)
            .map((q: any) => ({
              id: q.id,
              stream: q.stream,
              subject: q.subject,
              term: q.term,
              unit_code: q.unit_code,
              lesson_id: q.lesson_id,
              question_type: q.question_type,
              question_text: q.question_text,
              options: Array.isArray(q.options) ? q.options : JSON.parse(q.options || "[]"),
              correct_option_index: q.correct_option_index,
              explanation: q.explanation,
              target_lesson_url: q.target_lesson_url,
              box_level: q.box_level,
              consecutive_correct: q.consecutive_correct,
              error_count: q.error_count,
              is_in_error_lab: q.is_in_error_lab,
              next_review_at: q.next_review_at,
              priority_tier: q.priority_tier,
            }));
        }
      } catch (err) {
        console.warn("[RecallRepo] Supabase RPC failed, using repository fallback:", err);
      }
    }

    // 2. Fallback using seed question bank + local recall states
    const localStates = this.getLocalRecallStates(userId);
    const now = new Date();

    const candidates = SEED_FLASH_QUESTIONS
      // STRICT FILTER 1: Reject any question belonging to a term later than the student's current term!
      .filter((q) => q.term <= currentTerm)
      // STRICT FILTER 2: Stream compatibility
      .filter((q) => this.isStreamCompatible(q.stream, studentStream))
      // Optional subject filter
      .filter((q) => !options.subject || q.subject === options.subject)
      .map((q) => {
        const state = localStates[q.id];
        const nextReview = state?.next_review_at ? new Date(state.next_review_at) : now;
        const isDue = nextReview <= now;

        let priority = 4; // new question
        if (state?.is_in_error_lab) {
          priority = isDue ? 1 : 2;
        } else if (state) {
          priority = isDue ? 3 : 5;
        }

        return {
          ...q,
          box_level: state?.box_level || 0,
          consecutive_correct: state?.consecutive_correct || 0,
          error_count: state?.error_count || 0,
          is_in_error_lab: state?.is_in_error_lab || false,
          next_review_at: state?.next_review_at || now.toISOString(),
          priority_tier: priority,
        };
      });

    candidates.sort((a, b) => {
      if (a.priority_tier !== b.priority_tier) {
        return a.priority_tier - b.priority_tier;
      }
      return new Date(a.next_review_at || 0).getTime() - new Date(b.next_review_at || 0).getTime();
    });

    return candidates.slice(0, limit);
  }

  /**
   * Fetches single question by ID.
   */
  static async getQuestionById(questionId: string): Promise<FlashQuestion | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("flash_questions")
          .select("*")
          .eq("id", questionId)
          .single();

        if (!error && data) {
          return {
            id: data.id,
            stream: data.stream,
            subject: data.subject,
            term: data.term,
            unit_code: data.unit_code,
            lesson_id: data.lesson_id,
            question_type: data.question_type,
            question_text: data.question_text,
            options: Array.isArray(data.options) ? data.options : JSON.parse(data.options || "[]"),
            correct_option_index: data.correct_option_index,
            explanation: data.explanation,
            target_lesson_url: data.target_lesson_url,
          };
        }
      } catch (err) {
        console.warn("[RecallRepo] Failed to fetch question from Supabase:", err);
      }
    }

    return SEED_FLASH_QUESTIONS.find((q) => q.id === questionId) || null;
  }

  /**
   * Processes an answer submission:
   * Updates Leitner box, streak, error count, Error Lab status, and logs telemetry.
   */
  static async submitAnswer(
    userId: string,
    submission: RecallAnswerSubmission,
    options: { token?: string | null; studentStream?: string } = {}
  ): Promise<RecallAnswerResult> {
    const { questionId, selectedOptionIndex, source } = submission;

    // 1. Try authoritative RPC if available
    if (isSupabaseConfigured && supabase) {
      try {
        const client = options.token ? createServerSupabaseClient(options.token) || supabase : supabase;
        const { data, error } = await client.rpc("process_recall_answer", {
          p_question_id: questionId,
          p_selected_option_index: selectedOptionIndex,
          p_source: source,
        });

        if (!error && data) {
          return data as RecallAnswerResult;
        }
      } catch (err) {
        console.warn("[RecallRepo] Supabase process_recall_answer RPC error, calculating locally:", err);
      }
    }

    // 2. Local Fallback calculation
    const question = await this.getQuestionById(questionId);
    if (!question) {
      throw new Error(`Question ${questionId} not found`);
    }

    const isCorrect = question.correct_option_index === selectedOptionIndex;
    const localStates = this.getLocalRecallStates(userId);
    const existing = localStates[questionId] || {
      user_id: userId,
      question_id: questionId,
      box_level: 0,
      consecutive_correct: 0,
      error_count: 0,
      last_reviewed_at: null,
      next_review_at: new Date().toISOString(),
      is_in_error_lab: false,
    };

    let newBoxLevel = existing.box_level;
    let consecutiveCorrect = existing.consecutive_correct;
    let errorCount = existing.error_count;
    let isInErrorLab = existing.is_in_error_lab;
    let remediated = false;
    let nextReviewDate: Date;

    if (!isCorrect) {
      // Wrong answer
      errorCount += 1;
      consecutiveCorrect = 0;
      isInErrorLab = true;
      newBoxLevel = Math.max(0, newBoxLevel - 1);
      nextReviewDate = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours
    } else {
      // Correct answer
      consecutiveCorrect += 1;

      if (isInErrorLab) {
        // Needs 2 consecutive correct answers to leave Error Lab
        if (consecutiveCorrect >= 2) {
          isInErrorLab = false;
          remediated = true;
          newBoxLevel = Math.min(5, newBoxLevel + 1);
          nextReviewDate = this.calculateNextReview(newBoxLevel, false);
        } else {
          // Still in error lab: review next session
          nextReviewDate = new Date(Date.now() + 12 * 60 * 60 * 1000);
        }
      } else {
        newBoxLevel = Math.min(5, newBoxLevel + 1);
        nextReviewDate = this.calculateNextReview(newBoxLevel, false);
      }
    }

    const updatedState: StudentRecallState = {
      user_id: userId,
      question_id: questionId,
      box_level: newBoxLevel,
      consecutive_correct: consecutiveCorrect,
      error_count: errorCount,
      last_reviewed_at: new Date().toISOString(),
      next_review_at: nextReviewDate.toISOString(),
      is_in_error_lab: isInErrorLab,
    };

    localStates[questionId] = updatedState;
    this.saveLocalRecallStates(userId, localStates);

    return {
      is_correct: isCorrect,
      correct_option_index: question.correct_option_index,
      explanation: question.explanation,
      target_lesson_url: question.target_lesson_url,
      new_box_level: newBoxLevel,
      is_in_error_lab: isInErrorLab,
      consecutive_correct: consecutiveCorrect,
      remediated,
      next_review_at: nextReviewDate.toISOString(),
    };
  }

  /**
   * Fetches Error Lab summary and active gaps for the student.
   */
  static async getErrorLabData(
    userId: string,
    options: { studentTerm?: number; studentStream?: string } = {}
  ): Promise<{
    items: RecallQuestionWithState[];
    summary: ErrorLabSummary;
  }> {
    const studentTerm = options.studentTerm || 1;
    const studentStream = options.studentStream || "sciences_exp";

    let states: StudentRecallState[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("student_recall_states")
          .select("*")
          .eq("user_id", userId);

        if (!error && Array.isArray(data)) {
          states = data;
        }
      } catch (err) {
        console.warn("[RecallRepo] Failed to fetch recall states from Supabase:", err);
      }
    }

    if (states.length === 0) {
      const localStates = this.getLocalRecallStates(userId);
      states = Object.values(localStates);
    }

    const stateMap = new Map<string, StudentRecallState>();
    states.forEach((s) => stateMap.set(s.question_id, s));

    const activeErrorItems: RecallQuestionWithState[] = [];
    let totalErrorsLogged = 0;
    let remediatedCount = 0;

    const bySubject: Record<string, { total: number; remediated: number; active: number }> = {};

    for (const q of SEED_FLASH_QUESTIONS) {
      if (q.term > studentTerm) continue;
      if (!this.isStreamCompatible(q.stream, studentStream)) continue;

      const state = stateMap.get(q.id);
      if (!state || state.error_count === 0) continue;

      totalErrorsLogged += 1;
      const subj = q.subject;
      if (!bySubject[subj]) {
        bySubject[subj] = { total: 0, remediated: 0, active: 0 };
      }
      bySubject[subj].total += 1;

      if (state.is_in_error_lab) {
        bySubject[subj].active += 1;
        activeErrorItems.push({
          ...q,
          box_level: state.box_level,
          consecutive_correct: state.consecutive_correct,
          error_count: state.error_count,
          is_in_error_lab: true,
          next_review_at: state.next_review_at,
        });
      } else {
        remediatedCount += 1;
        bySubject[subj].remediated += 1;
      }
    }

    const remediationRate =
      totalErrorsLogged > 0 ? Math.round((remediatedCount / totalErrorsLogged) * 100) : 100;

    return {
      items: activeErrorItems,
      summary: {
        totalErrors: totalErrorsLogged,
        inErrorLabCount: activeErrorItems.length,
        remediatedCount,
        remediationRatePercent: remediationRate,
        bySubject,
      },
    };
  }

  /**
   * Fetches or initializes notification preferences for student.
   */
  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    const defaults: NotificationPreferences = {
      user_id: userId,
      frequency_minutes: 60,
      active_hours_start: "08:00",
      active_hours_end: "22:00",
      enabled_subjects: ["تاريخ", "جغرافيا", "إسلامية", "فلسفة"],
      push_subscription: null,
      is_active: true,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (!error && data) {
          return {
            user_id: data.user_id,
            frequency_minutes: data.frequency_minutes,
            active_hours_start: data.active_hours_start?.slice(0, 5) || "08:00",
            active_hours_end: data.active_hours_end?.slice(0, 5) || "22:00",
            enabled_subjects: data.enabled_subjects || defaults.enabled_subjects,
            push_subscription: data.push_subscription,
            is_active: data.is_active,
            last_notification_sent_at: data.last_notification_sent_at,
          };
        }
      } catch (err) {
        console.warn("[RecallRepo] Could not load preferences from Supabase:", err);
      }
    }

    // Local storage fallback
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFERENCES_KEY}_${userId}`);
        if (raw) return { ...defaults, ...JSON.parse(raw) };
      } catch {
        // ignore
      }
    }

    return defaults;
  }

  /**
   * Saves or updates notification preferences.
   */
  static async saveNotificationPreferences(
    prefs: Partial<NotificationPreferences> & { user_id: string }
  ): Promise<NotificationPreferences> {
    const existing = await this.getNotificationPreferences(prefs.user_id);
    const merged: NotificationPreferences = {
      ...existing,
      ...prefs,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("notification_preferences").upsert({
          user_id: merged.user_id,
          frequency_minutes: merged.frequency_minutes,
          active_hours_start: merged.active_hours_start,
          active_hours_end: merged.active_hours_end,
          enabled_subjects: merged.enabled_subjects,
          push_subscription: merged.push_subscription,
          is_active: merged.is_active,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error("[RecallRepo] Failed to save preferences to Supabase:", error);
        }
      } catch (err) {
        console.warn("[RecallRepo] Supabase preferences upsert error:", err);
      }
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          `${LOCAL_STORAGE_PREFERENCES_KEY}_${merged.user_id}`,
          JSON.stringify(merged)
        );
      } catch {
        // ignore
      }
    }

    return merged;
  }

  // --- Internal Local Storage Helpers ---
  private static getLocalRecallStates(userId: string): Record<string, StudentRecallState> {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem(`${LOCAL_STORAGE_RECALL_STATES_KEY}_${userId}`);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  private static saveLocalRecallStates(
    userId: string,
    states: Record<string, StudentRecallState>
  ): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(`${LOCAL_STORAGE_RECALL_STATES_KEY}_${userId}`, JSON.stringify(states));
    } catch {
      // ignore
    }
  }
}
