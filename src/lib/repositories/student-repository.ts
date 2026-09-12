/**
 * BAC Mastery - Student Profile Repository
 * Handles persistence of StrategicProfile, StudentRegistrationData, and AcademicProfileData
 * to Supabase with LocalStorage fallback & migration
 * Canonical Identity Model: id = user_id = auth.users(id)
 */

import { StrategicProfile } from "@/types/onboarding";
import {
  StudentRegistrationData,
  AcademicProfileData,
  CompleteStudentProfile,
} from "@/types/registration";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import {
  getStrategicProfile,
  saveStrategicProfile,
  getRegistrationDraft,
  saveRegistrationDraft,
  getAcademicProfileDraft,
  saveAcademicProfileDraft,
} from "../onboarding/profile";
import { normalizeAlgerianPhone } from "@/domain/administrative/phone-validation";

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
   * Save registration data (Step 1 to 6)
   */
  async saveRegistrationData(data: StudentRegistrationData, userId?: string): Promise<void> {
    // 1. Normalize phone numbers
    const normalizedStudentPhone = normalizeAlgerianPhone(data.studentPhone);
    const normalizedParentPhone = data.parentPhone ? normalizeAlgerianPhone(data.parentPhone) : undefined;
    
    // 2. Enforce free candidate rule: schoolName MUST be null
    const finalSchoolName = data.studentStatus === "free" ? null : (data.schoolName?.trim() || null);

    const sanitizedData: StudentRegistrationData = {
      ...data,
      studentPhone: normalizedStudentPhone,
      parentPhone: normalizedParentPhone,
      schoolName: finalSchoolName,
      registrationCompletedAt: data.registrationCompletedAt || new Date().toISOString(),
    };

    // Save to LocalStorage draft
    saveRegistrationDraft(sanitizedData);

    // Sync baseline StrategicProfile for backward compatibility
    const existingProfile = getStrategicProfile();
    const updatedProfile: StrategicProfile = {
      id: userId || existingProfile?.id || `profile_${Date.now()}`,
      educationLevel: "secondary",
      examType: "BAC",
      streamId: sanitizedData.streamId,
      techniqueMathSpecialty: sanitizedData.techniqueMathSpecialty,
      targetScore: existingProfile?.targetScore || 16.0,
      subjectEstimates: (existingProfile?.subjectEstimates || {}) as any,
      availableTime: existingProfile?.availableTime || "12_to_18",
      futureObjective: existingProfile?.futureObjective || { preset: "higher_school_ens_esi", customText: "" },
      obstacles: existingProfile?.obstacles || [],
      studyEnergy: existingProfile?.studyEnergy || "normal",
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
    };
    saveStrategicProfile(updatedProfile);

    // Persist to Supabase if authenticated
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const payload: Record<string, any> = {
          id: userId,
          user_id: userId,
          first_name: sanitizedData.firstName.trim(),
          last_name: sanitizedData.lastName.trim(),
          student_phone: sanitizedData.studentPhone,
          parent_phone: sanitizedData.parentPhone || null,
          student_status: sanitizedData.studentStatus,
          stream_id: sanitizedData.streamId,
          specialty_id: sanitizedData.techniqueMathSpecialty || null,
          wilaya_code: sanitizedData.wilayaCode,
          wilaya_name: sanitizedData.wilayaName,
          commune_code: sanitizedData.communeCode,
          commune_name: sanitizedData.communeName,
          school_name: sanitizedData.schoolName,
          registration_completed_at: sanitizedData.registrationCompletedAt,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("student_profiles")
          .upsert(payload, { onConflict: "id" });

        if (error) {
          console.error("StudentRepository.saveRegistrationData error:", error);
          // Fallback: save inside raw_draft
          await this.saveProfile(updatedProfile, userId);
        }
      } catch (err) {
        console.error("StudentRepository.saveRegistrationData exception:", err);
      }
    }
  },

  /**
   * Save Academic Profile Data
   */
  async saveAcademicProfileData(data: AcademicProfileData, userId?: string): Promise<void> {
    const sanitizedData: AcademicProfileData = {
      ...data,
      targetScore: Math.min(20, Math.max(0, Number(data.targetScore) || 16.0)),
      annualAverageYear1: data.annualAverageYear1 !== undefined && data.annualAverageYear1 !== null
        ? Math.min(20, Math.max(0, Number(data.annualAverageYear1)))
        : null,
      annualAverageYear2: data.annualAverageYear2 !== undefined && data.annualAverageYear2 !== null
        ? Math.min(20, Math.max(0, Number(data.annualAverageYear2)))
        : null,
      targetSpecialty: data.hasTargetSpecialty === true ? data.targetSpecialty?.trim() || null : null,
      academicProfileCompletedAt: data.academicProfileCompletedAt || new Date().toISOString(),
    };

    // Save to LocalStorage
    saveAcademicProfileDraft(sanitizedData);

    // Update targetScore on strategic profile mirror
    const existingProfile = getStrategicProfile();
    if (existingProfile) {
      existingProfile.targetScore = sanitizedData.targetScore;
      if (sanitizedData.targetSpecialty) {
        existingProfile.futureObjective = {
          preset: "specific_university_field",
          customText: sanitizedData.targetSpecialty,
        };
      }
      saveStrategicProfile(existingProfile);
    }

    // Persist to Supabase if authenticated
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const payload: Record<string, any> = {
          id: userId,
          user_id: userId,
          target_score: sanitizedData.targetScore,
          annual_average_year_1: sanitizedData.annualAverageYear1,
          annual_average_year_2: sanitizedData.annualAverageYear2,
          has_target_specialty: sanitizedData.hasTargetSpecialty === true,
          target_specialty: sanitizedData.targetSpecialty,
          study_methods: sanitizedData.studyMethods || [],
          current_self_assessment: sanitizedData.currentSelfAssessment,
          academic_profile_completed_at: sanitizedData.academicProfileCompletedAt,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from("student_profiles")
          .upsert(payload, { onConflict: "id" });

        if (error) {
          console.error("StudentRepository.saveAcademicProfileData error:", error);
        }
      } catch (err) {
        console.error("StudentRepository.saveAcademicProfileData exception:", err);
      }
    }
  },

  /**
   * Get registration data from Supabase or LocalStorage
   */
  async getRegistrationData(userId?: string): Promise<StudentRegistrationData | null> {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from("student_profiles")
          .select("first_name, last_name, student_phone, parent_phone, student_status, stream_id, specialty_id, wilaya_code, wilaya_name, commune_code, commune_name, school_name, registration_completed_at")
          .eq("id", userId)
          .maybeSingle();

        if (!error && data && data.first_name) {
          return {
            firstName: data.first_name,
            lastName: data.last_name,
            studentPhone: data.student_phone,
            parentPhone: data.parent_phone || undefined,
            studentStatus: data.student_status as any,
            streamId: data.stream_id as any,
            techniqueMathSpecialty: data.specialty_id || undefined,
            wilayaCode: data.wilaya_code,
            wilayaName: data.wilaya_name,
            communeCode: data.commune_code,
            communeName: data.commune_name,
            schoolName: data.school_name,
            registrationCompletedAt: data.registration_completed_at,
          };
        }
      } catch (err) {
        console.error("StudentRepository.getRegistrationData error:", err);
      }
    }

    return getRegistrationDraft();
  },

  /**
   * Get academic profile data from Supabase or LocalStorage
   */
  async getAcademicProfileData(userId?: string): Promise<AcademicProfileData | null> {
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data, error } = await supabase
          .from("student_profiles")
          .select("target_score, annual_average_year_1, annual_average_year_2, has_target_specialty, target_specialty, study_methods, current_self_assessment, academic_profile_completed_at")
          .eq("id", userId)
          .maybeSingle();

        if (!error && data && data.academic_profile_completed_at) {
          return {
            targetScore: Number(data.target_score) || 16.0,
            annualAverageYear1: data.annual_average_year_1 !== null ? Number(data.annual_average_year_1) : null,
            annualAverageYear1Remembered: data.annual_average_year_1 !== null,
            annualAverageYear2: data.annual_average_year_2 !== null ? Number(data.annual_average_year_2) : null,
            annualAverageYear2Remembered: data.annual_average_year_2 !== null,
            hasTargetSpecialty: data.has_target_specialty,
            targetSpecialty: data.target_specialty,
            studyMethods: Array.isArray(data.study_methods) ? data.study_methods : [],
            currentSelfAssessment: data.current_self_assessment as any,
            academicProfileCompletedAt: data.academic_profile_completed_at,
          };
        }
      } catch (err) {
        console.error("StudentRepository.getAcademicProfileData error:", err);
      }
    }

    return getAcademicProfileDraft();
  },

  /**
   * Safely migrate existing LocalStorage profile to Supabase on first sign in
   */
  async syncLocalToCloud(userId: string): Promise<void> {
    const localProfile = getStrategicProfile();
    const localReg = getRegistrationDraft();
    const localAcad = getAcademicProfileDraft();

    if (isSupabaseConfigured && supabase && userId) {
      try {
        const { data } = await supabase
          .from("student_profiles")
          .select("id, registration_completed_at")
          .eq("id", userId)
          .maybeSingle();

        if (!data && localProfile) {
          await this.saveProfile(localProfile, userId);
        }

        if (localReg && (!data || !data.registration_completed_at)) {
          await this.saveRegistrationData(localReg, userId);
        }

        if (localAcad) {
          await this.saveAcademicProfileData(localAcad, userId);
        }
      } catch (err) {
        console.error("StudentRepository.syncLocalToCloud error:", err);
      }
    }
  },
};
