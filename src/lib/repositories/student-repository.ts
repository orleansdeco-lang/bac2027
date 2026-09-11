/**
 * BAC Mastery - Student Profile Repository
 * Handles persistence of StrategicProfile to Supabase with LocalStorage fallback & migration
 * Canonical Identity Model: id = user_id = auth.users(id)
 */

import { StrategicProfile } from "@/types/onboarding";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import { getStrategicProfile, saveStrategicProfile } from "../onboarding/profile";

export const StudentRepository = {
  /**
   * Fetch student profile for an authenticated user.
   * If Supabase is unconfigured or returns null, gracefully falls back to LocalStorage.
   */
  async getProfile(userId?: string): Promise<StrategicProfile | null> {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error("StudentRepository.getProfile error:", error);
          return getStrategicProfile();
        }

        if (data && data.raw_draft) {
          return data.raw_draft as StrategicProfile;
        }
      } catch (err) {
        console.error("StudentRepository.getProfile exception:", err);
      }
    }

    return getStrategicProfile();
  },

  /**
   * Save student profile to Supabase and keep LocalStorage in sync
   * Always satisfies the database constraint: id = user_id
   */
  async saveProfile(profile: StrategicProfile, userId?: string): Promise<void> {
    // Always persist to local storage first for offline/fallback safety
    saveStrategicProfile(profile);

    if (isSupabaseConfigured && supabase && userId) {
      try {
        const payload = {
          id: userId,
          user_id: userId,
          education_level: profile.educationLevel || "secondary",
          exam_type: profile.examType || "bac",
          stream_id: profile.streamId,
          specialty_id: profile.techniqueMathSpecialty || null,
          target_score: profile.targetScore,
          baseline_score: null,
          weekly_study_hours: 10,
          future_objective: profile.futureObjective?.customText || profile.futureObjective?.preset || null,
          biggest_obstacle: profile.obstacles?.[0] || null,
          energy_state: profile.studyEnergy || "normal",
          language: "ar",
          onboarding_completed: true,
          raw_draft: profile,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("student_profiles")
          .upsert(payload, { onConflict: "id" });

        if (error) {
          console.error("StudentRepository.saveProfile error:", error);
        }
      } catch (err) {
        console.error("StudentRepository.saveProfile exception:", err);
      }
    }
  },

  /**
   * Safely migrate existing LocalStorage profile to Supabase on first sign in
   */
  async syncLocalToCloud(userId: string): Promise<void> {
    const localProfile = getStrategicProfile();
    if (!localProfile) return;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from("student_profiles")
          .select("id")
          .eq("id", userId)
          .maybeSingle();

        // If cloud profile doesn't exist yet, upload the local one
        if (!data) {
          await this.saveProfile(localProfile, userId);
        }
      } catch (err) {
        console.error("StudentRepository.syncLocalToCloud error:", err);
      }
    }
  },
};
