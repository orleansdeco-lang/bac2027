/**
 * BAC Mastery - Mastery Repository
 * Manages evidence-based skill mastery records in Supabase with LocalStorage fallback & sync
 */

import { MasteryEvidence } from "@/types/mission";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import { loadMasteryRecords, saveMasteryEvidence as saveLocalMasteryEvidence } from "../mission/storage";

export const MasteryRepository = {
  async getMasteryRecords(userId?: string): Promise<Record<string, MasteryEvidence>> {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from("skill_mastery")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          console.error("MasteryRepository.getMasteryRecords error:", error);
          return loadMasteryRecords();
        }

        if (data && data.length > 0) {
          const local = loadMasteryRecords();
          if (Object.keys(local).length > 0) return local;
        }
      } catch (err) {
        console.error("MasteryRepository.getMasteryRecords exception:", err);
      }
    }

    return loadMasteryRecords();
  },

  async saveMasteryRecord(evidence: MasteryEvidence, userId?: string): Promise<void> {
    saveLocalMasteryEvidence(evidence);

    if (isSupabaseConfigured && supabase && userId) {
      try {
        const payload = {
          user_id: userId,
          skill_id: evidence.skillId,
          subject_id: evidence.subjectId,
          status: evidence.masteryStatus || "not_yet",
          evidence_history: [evidence],
          last_verified_at: evidence.achievedAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await supabase
          .from("skill_mastery")
          .upsert(payload, { onConflict: "user_id,skill_id" });
      } catch (err) {
        console.error("MasteryRepository.saveMasteryRecord error:", err);
      }
    }
  },

  async syncLocalToCloud(userId: string): Promise<void> {
    const localRecords = loadMasteryRecords();
    const recordsList = Object.values(localRecords);
    if (recordsList.length === 0) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from("skill_mastery")
          .select("id")
          .eq("user_id", userId)
          .limit(1);

        if (!data || data.length === 0) {
          for (const rec of recordsList) {
            await this.saveMasteryRecord(rec, userId);
          }
        }
      } catch (err) {
        console.error("MasteryRepository.syncLocalToCloud error:", err);
      }
    }
  },
};
