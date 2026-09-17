/**
 * BAC Mastery - Mastery Repository
 * Manages evidence-based skill mastery records in Supabase with LocalStorage fallback & sync
 */

import { MasteryEvidence } from "@/types/mission";
import { SpacedReviewSchedule } from "@/domain/learning/types";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import {
  loadMasteryRecords,
  saveMasteryEvidence as saveLocalMasteryEvidence,
  loadSpacedReviewSchedules,
  saveSpacedReviewSchedule as saveLocalSpacedSchedule,
} from "../mission/storage";

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

          const map: Record<string, MasteryEvidence> = {};
          for (const row of data) {
            map[row.skill_id] = {
              missionId: "mission_" + row.skill_id,
              skillId: row.skill_id,
              subjectId: row.subject_id,
              evidenceType: "repair_retest_success",
              practiceAttempts: 1,
              correctAttempts: 1,
              retestAttempts: 1,
              successfulRetests: 1,
              confidenceSignals: [5],
              masteryStatus: (row.status as any) || "demonstrated",
              achievedAt: row.last_verified_at || row.updated_at,
            };
          }
          return map;
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

  async getSpacedReviewSchedules(userId?: string): Promise<Record<string, SpacedReviewSchedule>> {
    return loadSpacedReviewSchedules();
  },

  async saveSpacedReviewSchedule(schedule: SpacedReviewSchedule, userId?: string): Promise<void> {
    saveLocalSpacedSchedule(schedule);

    if (isSupabaseConfigured && supabase && userId) {
      try {
        const payload = {
          user_id: userId,
          skill_id: schedule.skillId,
          subject_id: schedule.subjectId,
          interval_days: schedule.intervalDays,
          last_tested_at: schedule.lastTestedAt,
          next_review_due_at: schedule.nextReviewDueAt,
          urgency: schedule.urgency,
          consecutive_successes: schedule.consecutiveSuccesses,
          lapse_count: schedule.lapseCount,
          decay_rate: schedule.decayRate,
          updated_at: new Date().toISOString(),
        };

        await supabase
          .from("retention_schedules")
          .upsert(payload, { onConflict: "user_id,skill_id" });
      } catch (err) {
        // Non-blocking: table might not exist in Supabase yet
        console.warn("MasteryRepository.saveSpacedReviewSchedule cloud sync skipped/failed:", err);
      }
    }
  },
};
