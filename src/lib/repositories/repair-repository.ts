/**
 * BAC Mastery - Error Repair Repository
 * Manages repair actions in Supabase (table: error_repairs) with LocalStorage fallback & sync
 */

import { supabase, isSupabaseConfigured } from "../supabase/client";

export interface ErrorRepairRecord {
  id: string;
  errorId: string;
  userId?: string;
  stepsCompleted: string[];
  studentReflection?: string;
  status: "in_progress" | "completed";
  startedAt: string;
  completedAt?: string;
}

const LOCAL_STORAGE_REPAIRS_KEY = "bac_mastery_error_repairs";

function loadLocalRepairs(): Record<string, ErrorRepairRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REPAIRS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalRepair(repair: ErrorRepairRecord): void {
  if (typeof window === "undefined") return;
  try {
    const records = loadLocalRepairs();
    records[repair.id] = repair;
    localStorage.setItem(LOCAL_STORAGE_REPAIRS_KEY, JSON.stringify(records));
  } catch (err) {
    console.error("Failed to save repair locally:", err);
  }
}

export const RepairRepository = {
  /**
   * Save or update an error repair record
   */
  async saveRepair(repair: ErrorRepairRecord, userId?: string): Promise<void> {
    saveLocalRepair(repair);

    if (isSupabaseConfigured && supabase && userId) {
      try {
        const payload = {
          id: repair.id,
          error_id: repair.errorId,
          user_id: userId,
          steps_completed: repair.stepsCompleted,
          student_reflection: repair.studentReflection || null,
          status: repair.status,
          started_at: repair.startedAt,
          completed_at: repair.completedAt || null,
        };

        const { error } = await supabase
          .from("error_repairs")
          .upsert(payload, { onConflict: "id" });

        if (error) {
          console.error("RepairRepository.saveRepair error:", error);
        }
      } catch (err) {
        console.error("RepairRepository.saveRepair exception:", err);
      }
    }
  },

  /**
   * Get all repair records for a user
   */
  async getRepairsForError(errorId: string, userId?: string): Promise<ErrorRepairRecord[]> {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from("error_repairs")
          .select("*")
          .eq("error_id", errorId)
          .eq("user_id", userId)
          .order("started_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((d) => ({
            id: d.id,
            errorId: d.error_id,
            userId: d.user_id,
            stepsCompleted: d.steps_completed || [],
            studentReflection: d.student_reflection || undefined,
            status: d.status,
            startedAt: d.started_at,
            completedAt: d.completed_at || undefined,
          }));
        }
      } catch (err) {
        console.error("RepairRepository.getRepairsForError exception:", err);
      }
    }

    const local = loadLocalRepairs();
    return Object.values(local).filter((r) => r.errorId === errorId);
  },

  /**
   * Sync local repairs to cloud on sign in
   */
  async syncLocalToCloud(userId: string): Promise<void> {
    const local = loadLocalRepairs();
    const repairsList = Object.values(local);
    if (repairsList.length === 0) return;

    if (isSupabaseConfigured && supabase) {
      for (const repair of repairsList) {
        await this.saveRepair(repair, userId);
      }
    }
  },
};
