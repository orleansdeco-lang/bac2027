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

          const map: Record<string, ErrorRecord> = {};
          for (const row of data) {
            map[row.id] = {
              id: row.id,
              sessionId: "session_diag",
              skillId: row.skill_id,
              questionId: row.question_id,
              subjectId: row.subject_id,
              missionId: row.mission_id || "mission_" + row.skill_id,
              selectedAnswer: "opt_b",
              correctAnswer: "opt_a",
              suspectedErrorType: row.system_inferred_error_type || "misunderstood_concept",
              errorSource: row.student_selected_error_type ? "student_selected" : "system_inferred",
              confidence: 4,
              repairStatus: (row.status as any) || "identified",
              isRecurring: Boolean(row.is_recurring),
              attemptCount: row.occurrence_count || 1,
              createdAt: row.created_at || new Date().toISOString(),
              updatedAt: row.updated_at || new Date().toISOString(),
            };
          }
          return map;
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

  /**
   * Directly queries the student_error_lab database view with fallback to getErrors
   */
  async getStudentErrorLabRecords(userId?: string): Promise<Record<string, ErrorRecord>> {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from("student_error_lab")
          .select("*")
          .eq("user_id", userId);

        if (!error && data && data.length > 0) {
          const map: Record<string, ErrorRecord> = {};
          for (const row of data) {
            map[row.id] = {
              id: row.id,
              sessionId: "session_diag",
              skillId: row.skill_id,
              questionId: row.question_id,
              subjectId: row.subject_id,
              missionId: row.mission_id || "mission_" + row.skill_id,
              selectedAnswer: "opt_b",
              correctAnswer: "opt_a",
              suspectedErrorType: row.system_inferred_error_type || "methodology_error",
              errorSource: row.student_selected_error_type ? "student_selected" : "system_inferred",
              confidence: 4,
              repairStatus: (row.status as any) || "identified",
              isRecurring: Boolean(row.is_recurring),
              attemptCount: row.occurrence_count || 1,
              createdAt: row.created_at || new Date().toISOString(),
              updatedAt: row.updated_at || new Date().toISOString(),
            };
          }
          return map;
        }
      } catch (err) {
        console.warn("Querying student_error_lab view fallback:", err);
      }
    }
    return this.getErrors(userId);
  },
};

