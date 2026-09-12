/**
 * BAC Mastery - Student Profile Application Service
 * Orchestrates student profile loading, saving, and non-destructive migration
 */

import { StrategicProfile } from "@/types/onboarding";
import { StudentRepository } from "@/lib/repositories/student-repository";
import { getStrategicProfile, saveStrategicProfile, clearOnboardingDraft } from "@/lib/onboarding/profile";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const StudentService = {
  /**
   * Load profile for authenticated student, falling back gracefully
   */
  async getProfile(userId?: string): Promise<StrategicProfile | null> {
    return StudentRepository.getProfile(userId);
  },

  /**
   * Persist profile to both Supabase and LocalStorage
   */
  async saveProfile(profile: StrategicProfile, userId?: string): Promise<void> {
    await StudentRepository.saveProfile(profile, userId);
  },

  /**
   * Migrate local draft to cloud safely upon authentication:
   * Rule: Server profile is authoritative. If server profile already exists, do not overwrite it.
   */
  async handleAuthSessionMigration(userId: string): Promise<StrategicProfile | null> {
    const localProfile = getStrategicProfile();

    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error("StudentService migration check error:", error);
          return localProfile;
        }

        // Case 1: Server profile already exists and is authoritative
        if (data && data.raw_draft) {
          const serverProfile = data.raw_draft as StrategicProfile;
          saveStrategicProfile(serverProfile); // update local mirror
          clearOnboardingDraft();
          return serverProfile;
        }

        // Case 2: No server profile exists, but local profile exists -> migrate up
        if (localProfile) {
          await StudentRepository.saveProfile(localProfile, userId);
          clearOnboardingDraft();
          return localProfile;
        }
      } catch (err) {
        console.error("StudentService.handleAuthSessionMigration exception:", err);
      }
    }

    return localProfile;
  },
};
