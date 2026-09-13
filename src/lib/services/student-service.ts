/**
 * BAC Mastery - Student Profile Application Service
 * Orchestrates student profile loading, saving, and non-destructive migration
 */

import { StrategicProfile } from "@/types/onboarding";
import { StudentRepository } from "@/lib/repositories/student-repository";
import { getStrategicProfile, saveStrategicProfile, clearOnboardingDraft } from "@/lib/onboarding/profile";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { StudentLearningContext, getStudentSubjects } from "@/domain/student";
import { StreamSubjectRule } from "@/domain/curriculum/streams";
import { getStudentAccess } from "@/lib/access";

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
        if (data) {
          const serverProfile = await StudentRepository.getProfile(userId);
          if (serverProfile) {
            saveStrategicProfile(serverProfile); // update local mirror
            clearOnboardingDraft();
            return serverProfile;
          }
        }

        // Case 2: No server profile exists, but local profile exists -> migrate up with 72h trial
        if (localProfile) {
          const now = new Date();
          const trialExpires = new Date(now.getTime() + 72 * 3600 * 1000);
          const trialProfile = {
            ...localProfile,
            trial_started_at: (localProfile as any).trial_started_at || now.toISOString(),
            trial_expires_at: (localProfile as any).trial_expires_at || trialExpires.toISOString(),
            access_status: (localProfile as any).access_status || "TRIAL",
            plan: (localProfile as any).plan || "PILOT_TRIAL",
          };
          await StudentRepository.saveProfile(trialProfile, userId);
          clearOnboardingDraft();
          return trialProfile;
        }

        // Case 3: Fresh registration without local profile -> create initial trial profile
        const freshNow = new Date();
        const freshExpires = new Date(freshNow.getTime() + 72 * 3600 * 1000);
        const defaultProfile: any = {
          id: userId,
          educationLevel: "secondary",
          examType: "BAC",
          streamId: "sciences_exp",
          targetScore: 16.0,
          subjectEstimates: {},
          availableTime: "12_to_18",
          studyEnergy: "normal",
          createdAt: freshNow.toISOString(),
          trial_started_at: freshNow.toISOString(),
          trial_expires_at: freshExpires.toISOString(),
          access_status: "TRIAL",
          plan: "PILOT_TRIAL",
        };
        await StudentRepository.saveProfile(defaultProfile, userId);
        return defaultProfile;
      } catch (err) {
        console.error("StudentService.handleAuthSessionMigration exception:", err);
      }
    }

    return localProfile;
  },

  /**
   * Resolves authoritative StudentLearningContext for a student
   */
  async getLearningContext(userId?: string): Promise<StudentLearningContext | null> {
    const profile = await StudentRepository.getProfile(userId);
    if (!profile) return null;

    const access = getStudentAccess(profile);
    const stream = (profile.streamId as any) || "sciences_exp";
    const studentStatus = (profile as any).student_status || "schooled";

    return {
      userId: profile.id || userId || "anonymous",
      stream,
      studentStatus,
      wilayaCode: (profile as any).wilaya_code || "",
      wilayaName: (profile as any).wilaya_name,
      communeCode: (profile as any).commune_code || "",
      communeName: (profile as any).commune_name,
      schoolName: (profile as any).school_name || null,
      targetScore: profile.targetScore || 16.0,
      targetSpecialty: (profile as any).target_specialty,
      techniqueMathSpecialty: profile.techniqueMathSpecialty,
      trialStartedAt: access.trialStartedAt || new Date().toISOString(),
      trialExpiresAt: access.trialExpiresAt || new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      isTrialActive: access.status === "TRIAL_ACTIVE" || access.status === "PAID_ACTIVE",
      canUseProduct: access.canUseProduct,
      registrationCompletedAt: (profile as any).registration_completed_at,
      academicProfileCompletedAt: (profile as any).academic_profile_completed_at,
    };
  },

  /**
   * Deterministic authorized subjects for the student's stream
   */
  async getStudentSubjects(userId?: string): Promise<StreamSubjectRule[]> {
    const context = await this.getLearningContext(userId);
    if (!context) {
      // Fallback default stream
      return getStudentSubjects("sciences_exp");
    }
    return getStudentSubjects(context);
  },

  /**
   * Save registration data (Step 1-6)
   */
  async saveRegistration(data: any, userId?: string): Promise<void> {
    if (!userId || userId.trim() === "") {
      throw new Error("Cannot save registration without an authenticated userId: profile must not exist outside an account");
    }
    await StudentRepository.saveRegistrationData(data, userId);
  },

  /**
   * Get registration data
   */
  async getRegistration(userId?: string): Promise<any | null> {
    return StudentRepository.getRegistrationData(userId);
  },

  /**
   * Save academic profile data
   */
  async saveAcademicProfile(data: any, userId?: string): Promise<void> {
    if (!userId || userId.trim() === "") {
      throw new Error("Cannot save academic profile without an authenticated userId: profile must not exist outside an account");
    }
    await StudentRepository.saveAcademicProfileData(data, userId);
  },

  /**
   * Get academic profile data
   */
  async getAcademicProfile(userId?: string): Promise<any | null> {
    return StudentRepository.getAcademicProfileData(userId);
  },
};
