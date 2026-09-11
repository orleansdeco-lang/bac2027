/**
 * BAC Mastery - Mission Repository
 * Manages learning missions persistence in Supabase with LocalStorage fallback & sync
 */

import { Mission, MissionStatus } from "@/types/mission";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import {
  loadMissions,
  saveMissions as saveLocalMissions,
  getActiveMissionId as getLocalActiveMissionId,
  setActiveMissionId as setLocalActiveMissionId,
} from "../mission/storage";

export const MissionRepository = {
  /**
   * Get all missions for the student
   */
  async getMissions(userId?: string): Promise<Record<string, Mission>> {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from("missions")
          .select("*")
          .eq("user_id", userId);

        if (error) {
          console.error("MissionRepository.getMissions error:", error);
          return loadMissions();
        }

        if (data && data.length > 0) {
          const local = loadMissions();
          if (Object.keys(local).length > 0) return local;
        }
      } catch (err) {
        console.error("MissionRepository.getMissions exception:", err);
      }
    }

    return loadMissions();
  },

  /**
   * Save a set of missions
   */
  async saveMissions(missions: Record<string, Mission>, userId?: string): Promise<void> {
    saveLocalMissions(missions);

    const missionList = Object.values(missions);
    if (isSupabaseConfigured && supabase && userId && missionList.length > 0) {
      try {
        const rows = missionList.map((m) => ({
          id: m.id,
          user_id: userId,
          skill_id: m.skillId,
          subject_id: m.subjectId,
          topic_id: "general",
          status: m.status,
          priority: m.priority || "medium",
          generation_source: m.source || "diagnostic_bottleneck",
          estimated_minutes: m.estimatedMinutes || 15,
          created_at: m.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        await supabase.from("missions").upsert(rows, { onConflict: "id" });
      } catch (err) {
        console.error("MissionRepository.saveMissions error:", err);
      }
    }
  },

  /**
   * Update the status of a specific mission
   */
  async updateMissionStatus(missionId: string, status: MissionStatus, userId?: string): Promise<void> {
    const local = loadMissions();
    if (local[missionId]) {
      local[missionId] = {
        ...local[missionId],
        status,
        updatedAt: new Date().toISOString(),
      };
      saveLocalMissions(local);
    }

    if (isSupabaseConfigured && supabase && userId) {
      try {
        await supabase
          .from("missions")
          .update({
            status,
            completed_at: status === "mastered" ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", missionId)
          .eq("user_id", userId);
      } catch (err) {
        console.error("MissionRepository.updateMissionStatus error:", err);
      }
    }
  },

  getActiveMissionId(): string | null {
    return getLocalActiveMissionId();
  },

  setActiveMissionId(id: string): void {
    setLocalActiveMissionId(id);
  },

  /**
   * Sync local missions to cloud upon login
   */
  async syncLocalToCloud(userId: string): Promise<void> {
    const localMissions = loadMissions();
    if (!localMissions || Object.keys(localMissions).length === 0) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from("missions")
          .select("id")
          .eq("user_id", userId)
          .limit(1);

        if (!data || data.length === 0) {
          await this.saveMissions(localMissions, userId);
        }
      } catch (err) {
        console.error("MissionRepository.syncLocalToCloud error:", err);
      }
    }
  },
};
