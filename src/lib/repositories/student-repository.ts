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
import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "../supabase/client";
import {
  getStrategicProfile,
  saveStrategicProfile,
  getRegistrationDraft,
  saveRegistrationDraft,
  getAcademicProfileDraft,
  saveAcademicProfileDraft,
} from "../onboarding/profile";
import { normalizeAlgerianPhone } from "@/domain/administrative/phone-validation";
import { calculateTrialExpiration } from "@/lib/access";

const memoryStudentProfiles = new Map<string, any>();

export const StudentRepository = {
  /**
   * Fetch student profile for an authenticated user.
   * If Supabase is unconfigured or returns null, gracefully falls back to memory/LocalStorage.
   */
  async getProfile(userId?: string, token?: string | null): Promise<StrategicProfile | null> {
    let effectiveUserId = userId;
    if (!effectiveUserId && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("bac_auth_user");
        if (stored) effectiveUserId = JSON.parse(stored)?.id;
      } catch {}
    }
    if (!effectiveUserId) {
      return null;
    }

    if (memoryStudentProfiles.has(effectiveUserId)) {
      return memoryStudentProfiles.get(effectiveUserId);
    }

    const dbClient = token ? createAuthenticatedSupabaseClient(token) : supabase;
    if (isSupabaseConfigured && dbClient && effectiveUserId) {
      try {
        const { data, error } = await dbClient
          .from("student_profiles")
          .select("*")
          .eq("id", effectiveUserId)
          .maybeSingle();

        if (error) {
          console.error("StudentRepository.getProfile error:", error);
          // Do not return null immediately; fall back to local data below
        } else if (data) {
          const localFallback = getStrategicProfile(effectiveUserId) || ({} as any);
          const createdAt = data.created_at || localFallback.created_at || localFallback.createdAt || new Date().toISOString();
          const trialStarted = data.trial_started_at || data.raw_draft?.trial_started_at || createdAt;
          const trialExpires = data.trial_expires_at || calculateTrialExpiration(new Date(createdAt)).toISOString();
          // Server authoritative access status: localFallback can be PAID if isServerAuthoritativePaid is true or subscription is active
          const isPaidActive = Boolean(
            localFallback.isServerAuthoritativePaid ||
            (localFallback.access_status === "PAID" &&
              localFallback.subscription_expires_at &&
              new Date(localFallback.subscription_expires_at).getTime() > Date.now())
          );
          const accessStatus =
            data.access_status ||
            (isPaidActive ? "PAID" : localFallback.access_status) ||
            "TRIAL";
          const plan =
            data.plan ||
            (isPaidActive ? (localFallback.plan || "season") : localFallback.plan) ||
            "PILOT_TRIAL";

          const merged: any = {
            ...localFallback,
            ...(data.raw_draft && typeof data.raw_draft === "object" ? data.raw_draft : {}),
            id: data.id || effectiveUserId,
            educationLevel: (data.education_level as any) || data.raw_draft?.educationLevel || localFallback.educationLevel || "secondary",
            examType: ((data.exam_type || data.raw_draft?.examType || localFallback.examType || "bac").toUpperCase() as any),
            streamId: data.stream_id || data.raw_draft?.streamId || localFallback.streamId,
            techniqueMathSpecialty: data.specialty_id || data.raw_draft?.techniqueMathSpecialty || localFallback.techniqueMathSpecialty || undefined,
            targetScore: Number(data.target_score) || data.raw_draft?.targetScore || localFallback.targetScore || 16.0,
            subjectEstimates: data.raw_draft?.subjectEstimates || localFallback.subjectEstimates || ({} as any),
            availableTime: data.raw_draft?.availableTime || localFallback.availableTime || "12_to_18",
            futureObjective: data.raw_draft?.futureObjective || (data.future_objective ? { preset: "higher_school_ens_esi", customText: data.future_objective } : localFallback.futureObjective || { preset: "higher_school_ens_esi" }),
            obstacles: data.biggest_obstacle ? [data.biggest_obstacle as any] : (data.raw_draft?.obstacles || localFallback.obstacles || []),
            studyEnergy: (data.energy_state as any) || data.raw_draft?.studyEnergy || localFallback.studyEnergy || "normal",
            createdAt: data.created_at || localFallback.createdAt || new Date().toISOString(),
            created_at: data.created_at || localFallback.created_at,
            trial_started_at: trialStarted,
            trial_expires_at: trialExpires,
            access_status: accessStatus,
            plan: plan,
            first_name: data.first_name || data.raw_draft?.first_name || data.raw_draft?.firstName || localFallback.firstName || localFallback.first_name,
            firstName: data.first_name || data.raw_draft?.first_name || data.raw_draft?.firstName || localFallback.firstName || localFallback.first_name,
            last_name: data.last_name || data.raw_draft?.last_name || data.raw_draft?.lastName || localFallback.lastName || localFallback.last_name,
            lastName: data.last_name || data.raw_draft?.last_name || data.raw_draft?.lastName || localFallback.lastName || localFallback.last_name,
            student_phone: data.student_phone || data.raw_draft?.student_phone || data.raw_draft?.studentPhone || localFallback.studentPhone || localFallback.student_phone,
            studentPhone: data.student_phone || data.raw_draft?.student_phone || data.raw_draft?.studentPhone || localFallback.studentPhone || localFallback.student_phone,
            parent_phone: data.parent_phone || data.raw_draft?.parent_phone || data.raw_draft?.parentPhone || localFallback.parentPhone || localFallback.parent_phone,
            parentPhone: data.parent_phone || data.raw_draft?.parent_phone || data.raw_draft?.parentPhone || localFallback.parentPhone || localFallback.parent_phone,
            student_status: data.student_status || data.raw_draft?.student_status || data.raw_draft?.studentStatus || localFallback.studentStatus || localFallback.student_status,
            studentStatus: data.student_status || data.raw_draft?.student_status || data.raw_draft?.studentStatus || localFallback.studentStatus || localFallback.student_status,
            wilaya_code: data.wilaya_code || data.raw_draft?.wilaya_code || data.raw_draft?.wilayaCode || localFallback.wilayaCode || localFallback.wilaya_code,
            wilayaCode: data.wilaya_code || data.raw_draft?.wilaya_code || data.raw_draft?.wilayaCode || localFallback.wilayaCode || localFallback.wilaya_code,
            wilaya_name: data.wilaya_name || data.raw_draft?.wilaya_name || data.raw_draft?.wilayaName || localFallback.wilayaName || localFallback.wilaya_name,
            wilayaName: data.wilaya_name || data.raw_draft?.wilaya_name || data.raw_draft?.wilayaName || localFallback.wilayaName || localFallback.wilaya_name,
            commune_code: data.commune_code || data.raw_draft?.commune_code || data.raw_draft?.communeCode || localFallback.communeCode || localFallback.commune_code,
            communeCode: data.commune_code || data.raw_draft?.commune_code || data.raw_draft?.communeCode || localFallback.communeCode || localFallback.commune_code,
            commune_name: data.commune_name || data.raw_draft?.commune_name || data.raw_draft?.communeName || localFallback.communeName || localFallback.commune_name,
            communeName: data.commune_name || data.raw_draft?.commune_name || data.raw_draft?.communeName || localFallback.communeName || localFallback.commune_name,
            school_name: data.school_name !== undefined ? data.school_name : (data.raw_draft?.schoolName !== undefined ? data.raw_draft.schoolName : localFallback.schoolName),
            schoolName: data.school_name !== undefined ? data.school_name : (data.raw_draft?.schoolName !== undefined ? data.raw_draft.schoolName : localFallback.schoolName),
            annual_average_year_1: data.annual_average_year_1 ?? data.raw_draft?.annualAverageYear1 ?? localFallback.annualAverageYear1,
            annualAverageYear1: data.annual_average_year_1 ?? data.raw_draft?.annualAverageYear1 ?? localFallback.annualAverageYear1,
            annual_average_year_2: data.annual_average_year_2 ?? data.raw_draft?.annualAverageYear2 ?? localFallback.annualAverageYear2,
            annualAverageYear2: data.annual_average_year_2 ?? data.raw_draft?.annualAverageYear2 ?? localFallback.annualAverageYear2,
            has_target_specialty: data.has_target_specialty ?? data.raw_draft?.hasTargetSpecialty ?? localFallback.hasTargetSpecialty,
            target_specialty: data.target_specialty || data.raw_draft?.targetSpecialty || localFallback.targetSpecialty,
            targetSpecialty: data.target_specialty || data.raw_draft?.targetSpecialty || localFallback.targetSpecialty,
            study_methods: data.study_methods || data.raw_draft?.studyMethods || localFallback.studyMethods,
            studyMethods: data.study_methods || data.raw_draft?.studyMethods || localFallback.studyMethods,
            current_self_assessment: data.current_self_assessment || data.raw_draft?.currentSelfAssessment || localFallback.currentSelfAssessment,
            registration_completed_at: data.registration_completed_at || data.raw_draft?.registrationCompletedAt || data.raw_draft?.registration_completed_at || localFallback.registrationCompletedAt || localFallback.registration_completed_at,
            registrationCompletedAt: data.registration_completed_at || data.raw_draft?.registrationCompletedAt || data.raw_draft?.registration_completed_at || localFallback.registrationCompletedAt || localFallback.registration_completed_at,
            academic_profile_completed_at: data.academic_profile_completed_at || data.raw_draft?.academicProfileCompletedAt || data.raw_draft?.academic_profile_completed_at || localFallback.academicProfileCompletedAt || localFallback.academic_profile_completed_at,
            academicProfileCompletedAt: data.academic_profile_completed_at || data.raw_draft?.academicProfileCompletedAt || data.raw_draft?.academic_profile_completed_at || localFallback.academicProfileCompletedAt || localFallback.academic_profile_completed_at,
          };
          saveStrategicProfile(merged, effectiveUserId);
          memoryStudentProfiles.set(effectiveUserId, merged);
          return merged;
        }
      } catch (err) {
        console.error("StudentRepository.getProfile exception:", err);
      }
    }

    // Supabase returned null or failed, or Supabase is unconfigured:
    // Gracefully recover from local storage mirrors (strategic profile, registration draft, academic draft)
    const localProfile = getStrategicProfile(effectiveUserId);
    const regDraft = getRegistrationDraft(effectiveUserId);
    const academicDraft = getAcademicProfileDraft(effectiveUserId);

    if (localProfile || regDraft) {
      const baseStreamId = localProfile?.streamId || regDraft?.streamId || "sciences_exp";
      const createdAt = localProfile?.createdAt || (localProfile as any)?.created_at || new Date().toISOString();
      const trialStarted = (localProfile as any)?.trial_started_at || createdAt;
      const trialExpires = (localProfile as any)?.trial_expires_at || calculateTrialExpiration(new Date(createdAt)).toISOString();

      const reconstructed: any = {
        ...(localProfile || {}),
        id: effectiveUserId,
        educationLevel: localProfile?.educationLevel || "secondary",
        examType: ((localProfile?.examType || "bac").toUpperCase() as any),
        streamId: baseStreamId,
        techniqueMathSpecialty: localProfile?.techniqueMathSpecialty || regDraft?.techniqueMathSpecialty || undefined,
        targetScore: Number(academicDraft?.targetScore || localProfile?.targetScore || 16.0),
        subjectEstimates: localProfile?.subjectEstimates || ({} as any),
        availableTime: localProfile?.availableTime || "12_to_18",
        futureObjective: localProfile?.futureObjective || { preset: "higher_school_ens_esi" },
        obstacles: localProfile?.obstacles || [],
        studyEnergy: localProfile?.studyEnergy || "normal",
        createdAt: createdAt,
        created_at: createdAt,
        trial_started_at: trialStarted,
        trial_expires_at: trialExpires,
        access_status: localProfile?.access_status || "TRIAL",
        plan: localProfile?.plan || "PILOT_TRIAL",
        first_name: regDraft?.firstName || localProfile?.firstName || (localProfile as any)?.first_name,
        firstName: regDraft?.firstName || localProfile?.firstName || (localProfile as any)?.first_name,
        last_name: regDraft?.lastName || localProfile?.lastName || (localProfile as any)?.last_name,
        lastName: regDraft?.lastName || localProfile?.lastName || (localProfile as any)?.last_name,
        student_phone: regDraft?.studentPhone || localProfile?.studentPhone || (localProfile as any)?.student_phone,
        studentPhone: regDraft?.studentPhone || localProfile?.studentPhone || (localProfile as any)?.student_phone,
        parent_phone: regDraft?.parentPhone || localProfile?.parentPhone || (localProfile as any)?.parent_phone,
        parentPhone: regDraft?.parentPhone || localProfile?.parentPhone || (localProfile as any)?.parent_phone,
        student_status: regDraft?.studentStatus || localProfile?.studentStatus || (localProfile as any)?.student_status || "schooled",
        studentStatus: regDraft?.studentStatus || localProfile?.studentStatus || (localProfile as any)?.student_status || "schooled",
        wilaya_code: regDraft?.wilayaCode || localProfile?.wilayaCode || (localProfile as any)?.wilaya_code,
        wilayaCode: regDraft?.wilayaCode || localProfile?.wilayaCode || (localProfile as any)?.wilaya_code,
        wilaya_name: regDraft?.wilayaName || localProfile?.wilayaName || (localProfile as any)?.wilaya_name,
        wilayaName: regDraft?.wilayaName || localProfile?.wilayaName || (localProfile as any)?.wilaya_name,
        commune_code: regDraft?.communeCode || localProfile?.communeCode || (localProfile as any)?.commune_code,
        communeCode: regDraft?.communeCode || localProfile?.communeCode || (localProfile as any)?.commune_code,
        commune_name: regDraft?.communeName || localProfile?.communeName || (localProfile as any)?.commune_name,
        communeName: regDraft?.communeName || localProfile?.communeName || (localProfile as any)?.commune_name,
        school_name: regDraft?.schoolName !== undefined ? regDraft.schoolName : (localProfile?.schoolName !== undefined ? localProfile.schoolName : (localProfile as any)?.school_name),
        schoolName: regDraft?.schoolName !== undefined ? regDraft.schoolName : (localProfile?.schoolName !== undefined ? localProfile.schoolName : (localProfile as any)?.school_name),
        annual_average_year_1: academicDraft?.annualAverageYear1 ?? (localProfile as any)?.annual_average_year_1 ?? (localProfile as any)?.annualAverageYear1,
        annualAverageYear1: academicDraft?.annualAverageYear1 ?? (localProfile as any)?.annual_average_year_1 ?? (localProfile as any)?.annualAverageYear1,
        annual_average_year_2: academicDraft?.annualAverageYear2 ?? (localProfile as any)?.annual_average_year_2 ?? (localProfile as any)?.annualAverageYear2,
        annualAverageYear2: academicDraft?.annualAverageYear2 ?? (localProfile as any)?.annual_average_year_2 ?? (localProfile as any)?.annualAverageYear2,
        has_target_specialty: academicDraft?.hasTargetSpecialty ?? (localProfile as any)?.has_target_specialty ?? (localProfile as any)?.hasTargetSpecialty,
        target_specialty: academicDraft?.targetSpecialty || (localProfile as any)?.target_specialty || (localProfile as any)?.targetSpecialty,
        targetSpecialty: academicDraft?.targetSpecialty || (localProfile as any)?.target_specialty || (localProfile as any)?.targetSpecialty,
        study_methods: academicDraft?.studyMethods || (localProfile as any)?.study_methods || (localProfile as any)?.studyMethods,
        studyMethods: academicDraft?.studyMethods || (localProfile as any)?.study_methods || (localProfile as any)?.studyMethods,
        current_self_assessment: academicDraft?.currentSelfAssessment || (localProfile as any)?.current_self_assessment || (localProfile as any)?.currentSelfAssessment,
        registration_completed_at: regDraft?.registrationCompletedAt || localProfile?.registrationCompletedAt || (localProfile as any)?.registration_completed_at,
        registrationCompletedAt: regDraft?.registrationCompletedAt || localProfile?.registrationCompletedAt || (localProfile as any)?.registration_completed_at,
        academic_profile_completed_at: academicDraft?.academicProfileCompletedAt || (localProfile as any)?.academicProfileCompletedAt || (localProfile as any)?.academic_profile_completed_at,
        academicProfileCompletedAt: academicDraft?.academicProfileCompletedAt || (localProfile as any)?.academicProfileCompletedAt || (localProfile as any)?.academic_profile_completed_at,
      };

      saveStrategicProfile(reconstructed, effectiveUserId);
      memoryStudentProfiles.set(effectiveUserId, reconstructed);

      // Opportunistically attempt background sync to Supabase if configured and authenticated
      if (isSupabaseConfigured && supabase) {
        StudentRepository.saveProfile(reconstructed, effectiveUserId).catch((err) => {
          console.warn("StudentRepository: background sync of recovered local profile failed:", err);
        });
      }

      return reconstructed;
    }

    return null;
  },

  /**
   * Save student profile to Supabase and keep LocalStorage in sync
   * Always satisfies the database constraint: id = user_id
   */
  async saveProfile(profile: StrategicProfile, userId?: string, token?: string | null): Promise<void> {
    const targetId = (typeof userId === "string" && userId.trim()) ? userId.trim() : profile.id;
    const existing = targetId ? memoryStudentProfiles.get(targetId) : null;
    const canBePaid = Boolean(
      (profile as any).subscription_expires_at ||
      existing?.access_status === "PAID" ||
      (profile as any).isServerAuthoritativePaid
    );

    const accessStatus = canBePaid && (profile as any).access_status === "PAID"
      ? "PAID"
      : ((profile as any).access_status === "PAID" ? "TRIAL" : ((profile as any).access_status || "TRIAL"));

    const plan = canBePaid && (profile as any).access_status === "PAID"
      ? ((profile as any).plan || "PAID")
      : ((profile as any).plan === "PAID" ? "PILOT_TRIAL" : ((profile as any).plan || "PILOT_TRIAL"));

    const sanitizedProfile = {
      ...profile,
      id: targetId || profile.id,
      access_status: accessStatus,
      plan: plan,
    };

    saveStrategicProfile(sanitizedProfile, targetId);

    if (targetId) {
      memoryStudentProfiles.set(targetId, { ...sanitizedProfile, id: targetId });
    }

    const dbClient = token ? createAuthenticatedSupabaseClient(token) : supabase;
    if (isSupabaseConfigured && dbClient && userId) {
      try {
        const createdAt = (profile as any).created_at || (profile as any).createdAt || new Date().toISOString();
        const trialStarted = (profile as any).trial_started_at || createdAt;
        const trialExpires = calculateTrialExpiration(new Date(createdAt)).toISOString();

        const enrichedProfile = {
          ...sanitizedProfile,
          trial_started_at: trialStarted,
          trial_expires_at: trialExpires,
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
        const { error: fullError } = await dbClient
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
            const { error: fallbackError } = await dbClient
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
    let effectiveUserId = userId;
    if (!effectiveUserId && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("bac_auth_user");
        if (stored) effectiveUserId = JSON.parse(stored)?.id;
      } catch {}
    }
    if (!effectiveUserId || effectiveUserId.trim() === "") {
      throw new Error("Cannot save registration without an authenticated userId: profile must not exist outside an account");
    }

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

    // Save to LocalStorage draft (scoped to userId)
    saveRegistrationDraft(sanitizedData, userId);

    // Sync baseline StrategicProfile for this user
    const existingProfile = getStrategicProfile(userId);
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
      firstName: sanitizedData.firstName,
      lastName: sanitizedData.lastName,
      studentPhone: sanitizedData.studentPhone,
      parentPhone: sanitizedData.parentPhone,
      studentStatus: sanitizedData.studentStatus,
      wilayaCode: sanitizedData.wilayaCode,
      wilayaName: sanitizedData.wilayaName,
      communeCode: sanitizedData.communeCode,
      communeName: sanitizedData.communeName,
      schoolName: sanitizedData.schoolName,
      registrationCompletedAt: sanitizedData.registrationCompletedAt,
    };
    (updatedProfile as any).first_name = sanitizedData.firstName;
    (updatedProfile as any).last_name = sanitizedData.lastName;
    (updatedProfile as any).student_phone = sanitizedData.studentPhone;
    (updatedProfile as any).parent_phone = sanitizedData.parentPhone;
    (updatedProfile as any).student_status = sanitizedData.studentStatus;
    (updatedProfile as any).wilaya_code = sanitizedData.wilayaCode;
    (updatedProfile as any).wilaya_name = sanitizedData.wilayaName;
    (updatedProfile as any).commune_code = sanitizedData.communeCode;
    (updatedProfile as any).commune_name = sanitizedData.communeName;
    (updatedProfile as any).school_name = sanitizedData.schoolName;
    (updatedProfile as any).registration_completed_at = sanitizedData.registrationCompletedAt;
    saveStrategicProfile(updatedProfile, userId);
    if (userId) {
      memoryStudentProfiles.set(userId, updatedProfile);
    }

    // Persist to Supabase if authenticated
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const enrichedDraft = {
          ...updatedProfile,
          ...sanitizedData,
          registration_completed_at: sanitizedData.registrationCompletedAt,
          registrationCompletedAt: sanitizedData.registrationCompletedAt,
          first_name: sanitizedData.firstName,
          firstName: sanitizedData.firstName,
          last_name: sanitizedData.lastName,
          lastName: sanitizedData.lastName,
        };

        const fullPayload: Record<string, any> = {
          id: userId,
          user_id: userId,
          education_level: "secondary",
          exam_type: "bac",
          target_score: existingProfile?.targetScore || 16.0,
          stream_id: sanitizedData.streamId,
          specialty_id: sanitizedData.techniqueMathSpecialty || null,
          first_name: sanitizedData.firstName.trim(),
          last_name: sanitizedData.lastName.trim(),
          student_phone: sanitizedData.studentPhone,
          parent_phone: sanitizedData.parentPhone || null,
          student_status: sanitizedData.studentStatus,
          wilaya_code: sanitizedData.wilayaCode,
          wilaya_name: sanitizedData.wilayaName,
          commune_code: sanitizedData.communeCode,
          commune_name: sanitizedData.communeName,
          school_name: sanitizedData.schoolName,
          registration_completed_at: sanitizedData.registrationCompletedAt,
          raw_draft: enrichedDraft,
          updated_at: new Date().toISOString(),
        };

        const { error: fullErr } = await supabase
          .from("student_profiles")
          .upsert(fullPayload, { onConflict: "id" });

        if (fullErr) {
          console.warn("StudentRepository.saveRegistrationData using foundation schema + raw_draft fallback:", fullErr.message);
          const basePayload: Record<string, any> = {
            id: userId,
            user_id: userId,
            education_level: "secondary",
            exam_type: "bac",
            stream_id: sanitizedData.streamId,
            specialty_id: sanitizedData.techniqueMathSpecialty || null,
            target_score: existingProfile?.targetScore || 16.0,
            raw_draft: enrichedDraft,
            updated_at: new Date().toISOString(),
          };

          const { error: baseErr } = await supabase
            .from("student_profiles")
            .upsert(basePayload, { onConflict: "id" });

          if (baseErr) {
            console.error("StudentRepository.saveRegistrationData base upsert error:", baseErr.message);
          }
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
    let effectiveUserId = userId;
    if (!effectiveUserId && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("bac_auth_user");
        if (stored) effectiveUserId = JSON.parse(stored)?.id;
      } catch {}
    }

    if (!effectiveUserId || effectiveUserId.trim() === "") {
      throw new Error("Cannot save academic profile without an authenticated userId: profile must not exist outside an account");
    }

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

    // Save to LocalStorage draft (scoped)
    saveAcademicProfileDraft(sanitizedData, effectiveUserId);

    // Update targetScore on strategic profile mirror
    const existingProfile = getStrategicProfile(effectiveUserId);
    if (existingProfile) {
      existingProfile.targetScore = sanitizedData.targetScore;
      existingProfile.academicProfileCompletedAt = sanitizedData.academicProfileCompletedAt;
      (existingProfile as any).academic_profile_completed_at = sanitizedData.academicProfileCompletedAt;
      if (sanitizedData.targetSpecialty) {
        existingProfile.futureObjective = {
          preset: "specific_university_field",
          customText: sanitizedData.targetSpecialty,
        };
        existingProfile.targetSpecialty = sanitizedData.targetSpecialty;
        (existingProfile as any).target_specialty = sanitizedData.targetSpecialty;
      }
      if (sanitizedData.studyMethods) {
        existingProfile.studyMethods = sanitizedData.studyMethods;
        (existingProfile as any).study_methods = sanitizedData.studyMethods;
      }
      saveStrategicProfile(existingProfile, effectiveUserId);
      memoryStudentProfiles.set(effectiveUserId, existingProfile);
    }

    // Persist to Supabase if authenticated
    if (isSupabaseConfigured && supabase && userId) {
      try {
        const enrichedDraft = {
          ...existingProfile,
          ...sanitizedData,
          academicProfileCompletedAt: sanitizedData.academicProfileCompletedAt,
          academic_profile_completed_at: sanitizedData.academicProfileCompletedAt,
          targetScore: sanitizedData.targetScore,
          target_score: sanitizedData.targetScore,
        };

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
          raw_draft: enrichedDraft,
          updated_at: new Date().toISOString(),
        };

        const { error: fullErr } = await supabase
          .from("student_profiles")
          .upsert(payload, { onConflict: "id" });

        if (fullErr) {
          console.warn("StudentRepository.saveAcademicProfileData fallback to basePayload + raw_draft:", fullErr.message);
          const basePayload: Record<string, any> = {
            id: userId,
            user_id: userId,
            target_score: sanitizedData.targetScore,
            raw_draft: enrichedDraft,
            updated_at: new Date().toISOString(),
          };
          await supabase.from("student_profiles").upsert(basePayload, { onConflict: "id" });
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

    if (userId) {
      return getRegistrationDraft(userId);
    }
    return null;
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

    if (userId) {
      return getAcademicProfileDraft(userId);
    }
    return null;
  },

  /**
   * Disarmed syncLocalToCloud to prevent cross-account contamination.
   * Under canonical identity rules, local prototype or guest drafts
   * must NEVER automatically migrate into newly registered cloud accounts.
   */
  async syncLocalToCloud(_userId: string): Promise<void> {
    return;
  },

  /**
   * Invalidate memory cache for a specific user or completely upon sign out
   */
  clearMemoryCache(userId?: string): void {
    if (userId) {
      memoryStudentProfiles.delete(userId);
    } else {
      memoryStudentProfiles.clear();
    }
  },
};
