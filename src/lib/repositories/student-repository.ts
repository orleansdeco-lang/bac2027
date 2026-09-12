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

        if (data) {
          const trialStarted = data.trial_started_at || data.raw_draft?.trial_started_at || data.created_at || new Date().toISOString();
          const trialExpires = data.trial_expires_at || data.raw_draft?.trial_expires_at || new Date(new Date(trialStarted).getTime() + 48 * 3600 * 1000).toISOString();
          const accessStatus = data.access_status || data.raw_draft?.access_status || "TRIAL";
          const plan = data.plan || data.raw_draft?.plan || "PILOT_TRIAL";

          if (data.raw_draft && Object.keys(data.raw_draft).length > 0) {
            const draft = { ...(data.raw_draft as StrategicProfile) } as any;
            draft.trial_started_at = trialStarted;
            draft.trial_expires_at = trialExpires;
            draft.access_status = accessStatus;
            draft.plan = plan;
            draft.created_at = data.created_at;
            saveStrategicProfile(draft);
            return draft;
          }

          const reconstructed: any = {
            id: data.id || userId,
            educationLevel: (data.education_level as any) || "secondary",
            examType: ((data.exam_type || "bac").toUpperCase() as any),
            streamId: data.stream_id,
            techniqueMathSpecialty: data.specialty_id || undefined,
            targetScore: Number(data.target_score) || 16.0,
            subjectEstimates: {} as any,
            availableTime: "12_to_18",
            futureObjective: { preset: "higher_school_ens_esi", customText: data.future_objective || "" },
            obstacles: data.biggest_obstacle ? [data.biggest_obstacle as any] : [],
            studyEnergy: (data.energy_state as any) || "normal",
            createdAt: data.created_at || new Date().toISOString(),
            created_at: data.created_at,
            trial_started_at: trialStarted,
            trial_expires_at: trialExpires,
            access_status: accessStatus,
            plan: plan,
          };
          saveStrategicProfile(reconstructed);
          return reconstructed;
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
        const trialStarted = (profile as any).trial_started_at || new Date().toISOString();
        const trialExpires = (profile as any).trial_expires_at || new Date(new Date(trialStarted).getTime() + 48 * 3600 * 1000).toISOString();
        const accessStatus = (profile as any).access_status || "TRIAL";
        const plan = (profile as any).plan || "PILOT_TRIAL";

        const enrichedProfile = {
          ...profile,
          trial_started_at: trialStarted,
          trial_expires_at: trialExpires,
          access_status: accessStatus,
          plan: plan,
        };

        const basePayload: Record<string, any> = {
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
          raw_draft: enrichedProfile,
          updated_at: new Date().toISOString(),
        };

        // Attempt upsert with trial columns first
        const { error: fullError } = await supabase
          .from("student_profiles")
          .upsert(
            {
              ...basePayload,
              trial_started_at: trialStarted,
              trial_expires_at: trialExpires,
              access_status: accessStatus,
              plan: plan,
            },
            { onConflict: "id" }
          );

        // If trial columns not yet in DB schema, fallback to base payload with enriched raw_draft
        if (fullError) {
          if (fullError.message?.includes("column") || fullError.code === "PGRST204") {
            const { error: fallbackError } = await supabase
              .from("student_profiles")
              .upsert(basePayload, { onConflict: "id" });
            if (fallbackError) {
              console.error("StudentRepository.saveProfile fallback error:", fallbackError);
            }
          } else {
            console.error("StudentRepository.saveProfile error:", fullError);
          }
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
