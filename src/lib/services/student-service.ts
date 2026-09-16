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
import { getStudentAccess, calculateTrialExpiration } from "@/lib/access";
import { normalizeStreamIdWithDefault } from "@/lib/curriculum/filter";

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
    if (!userId || userId.trim() === "") return null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("student_profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (error) {
          console.error("StudentService migration check error:", error);
          return null;
        }

        // Case 1: Server profile already exists and is authoritative
        if (data) {
          const serverProfile = await StudentRepository.getProfile(userId);
          if (serverProfile) {
            saveStrategicProfile(serverProfile, userId); // update scoped local mirror
            clearOnboardingDraft(userId);
            return serverProfile;
          }
        }
      } catch (err) {
        console.error("StudentService.handleAuthSessionMigration exception:", err);
      }
    }

    // New accounts start with a clean slate: no silent migration of unscoped drafts
    return null;
  },

  /**
   * Resolves authoritative StudentLearningContext for a student
   */
  async getLearningContext(userId?: string): Promise<StudentLearningContext | null> {
    const profile = await StudentRepository.getProfile(userId);
    if (!profile) return null;

    const access = getStudentAccess(profile);
    const stream = normalizeStreamIdWithDefault(profile.streamId || (profile as any).stream, "sciences_exp");
    const studentStatus = (profile as any).student_status || (profile as any).studentStatus || "schooled";

    return {
      userId: profile.id || userId || "anonymous",
      stream,
      studentStatus,
      wilayaCode: (profile as any).wilaya_code || (profile as any).wilayaCode || "",
      wilayaName: (profile as any).wilaya_name || (profile as any).wilayaName,
      communeCode: (profile as any).commune_code || (profile as any).communeCode || "",
      communeName: (profile as any).commune_name || (profile as any).communeName,
      schoolName: (profile as any).school_name !== undefined ? (profile as any).school_name : (profile as any).schoolName || null,
      targetScore: profile.targetScore || 16.0,
      targetSpecialty: (profile as any).target_specialty || (profile as any).targetSpecialty,
      techniqueMathSpecialty: profile.techniqueMathSpecialty,
      trialStartedAt: access.trialStartedAt || new Date().toISOString(),
      trialExpiresAt: access.trialExpiresAt || new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
      isTrialActive: access.status === "TRIAL_ACTIVE" || access.status === "PAID_ACTIVE",
      canUseProduct: access.canUseProduct,
      registrationCompletedAt: (profile as any).registration_completed_at || (profile as any).registrationCompletedAt,
      academicProfileCompletedAt: (profile as any).academic_profile_completed_at || (profile as any).academicProfileCompletedAt,
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

    if (typeof window !== "undefined") {
      try {
        const { getAuthToken } = await import("@/lib/operations/client-api");
        const token = await getAuthToken();
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        fetch("/api/student/sync", {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            id: userId,
            firstName: data.firstName,
            lastName: data.lastName,
            studentPhone: data.studentPhone,
            parentPhone: data.parentPhone,
            studentStatus: data.studentStatus,
            streamId: data.streamId,
            wilayaCode: data.wilayaCode,
            wilayaName: data.wilayaName,
            communeCode: data.communeCode,
            communeName: data.communeName,
            schoolName: data.schoolName,
            registrationCompletedAt: data.registrationCompletedAt,
          }),
        }).catch(() => {});
      } catch {}
    }
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
