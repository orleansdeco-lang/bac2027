/**
 * BAC Mastery - Error Repository
 * Manages Error Lab records (errors, repairs, twin retests) in Supabase with LocalStorage fallback & sync
 */

import { ErrorRecord } from "@/types/mission";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import { loadErrorRecords, saveErrorRecord as saveLocalErrorRecord } from "../mission/storage";

export const ErrorRepository = {
  async getErrors(userId?: string): Promise<Record<string, ErrorRecord>> {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from("errors")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          console.error("ErrorRepository.getErrors error:", error);
          return loadErrorRecords();
        }

        if (data && data.length > 0) {
          const local = loadErrorRecords();
          if (Object.keys(local).length > 0) return local;
        }
      } catch (err) {
        console.error("ErrorRepository.getErrors exception:", err);
      }
    }

    return loadErrorRecords();
  },

  async saveError(error: ErrorRecord, userId?: string): Promise<void> {
    saveLocalErrorRecord(error);

    if (isSupabaseConfigured && supabase && userId) {
      try {
        const payload = {
          id: error.id,
          user_id: userId,
          mission_id: error.missionId || null,
          skill_id: error.skillId,
          question_id: error.questionId,
          subject_id: error.subjectId,
          system_inferred_error_type: error.suspectedErrorType || "unknown",
          student_selected_error_type: error.errorSource === "student_selected" ? error.suspectedErrorType : null,
          status: error.repairStatus || "identified",
          is_recurring: Boolean(error.isRecurring),
          occurrence_count: error.attemptCount || 1,
          created_at: error.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await supabase.from("errors").upsert(payload, { onConflict: "id" });
      } catch (err) {
        console.error("ErrorRepository.saveError error:", err);
      }
    }
  },

  async syncLocalToCloud(userId: string): Promise<void> {
    const localErrors = loadErrorRecords();
    const errorList = Object.values(localErrors);
    if (errorList.length === 0) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from("errors")
          .select("id")
          .eq("user_id", userId)
          .limit(1);

        if (!data || data.length === 0) {
          for (const err of errorList) {
            await this.saveError(err, userId);
          }
        }
      } catch (err) {
        console.error("ErrorRepository.syncLocalToCloud error:", err);
      }
    }
  },
};
