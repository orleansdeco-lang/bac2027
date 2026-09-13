"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { StudentService } from "@/lib/services";
import { StudentProfile } from "@/types/student";
import { StudentLearningContext, getStudentSubjects } from "@/domain/student";

export interface LearningAccessGateState {
  isLoading: boolean;
  isAuthorized: boolean;
  profile: StudentProfile | null;
  learningContext: StudentLearningContext | null;
  streamSubjects: ReturnType<typeof getStudentSubjects>;
}

/**
 * Authoritative access gate enforcing:
 * 1. Authenticated account
 * 2. Personal registration completion
 * 3. Academic profile completion
 * 4. 72-hour trial & stream scoping
 */
export function useLearningAccessGate(options?: {
  redirectToAuth?: boolean;
}): LearningAccessGateState {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [learningContext, setLearningContext] = useState<StudentLearningContext | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function evaluateAccess() {
      if (isAuthLoading) return;

      let effectiveUserId = user?.id;
      if (!effectiveUserId && typeof window !== "undefined") {
        try {
          const rawAuth = localStorage.getItem("bac_auth_user");
          if (rawAuth) {
            const parsed = JSON.parse(rawAuth);
            if (parsed && parsed.id) effectiveUserId = parsed.id;
          }
        } catch {}
      }

      // 1. Must be authenticated
      if (!effectiveUserId) {
        if (options?.redirectToAuth !== false) {
          router.replace("/auth?mode=login");
        }
        if (isMounted) {
          setIsLoading(false);
          setIsAuthorized(false);
        }
        return;
      }

      try {
        const studentProfile = await StudentService.getProfile(effectiveUserId);

        if (!studentProfile) {
          // No profile at all -> redirect to registration
          if (options?.redirectToAuth !== false) {
            router.replace("/auth/register");
          }
          if (isMounted) {
            setIsLoading(false);
            setIsAuthorized(false);
          }
          return;
        }

        // 2. Personal registration completion
        const isRegistrationComplete = Boolean(
          studentProfile.registrationCompletedAt ||
          (studentProfile.firstName && studentProfile.streamId)
        );

        if (!isRegistrationComplete) {
          if (options?.redirectToAuth !== false) {
            router.replace("/auth/register");
          }
          if (isMounted) {
            setProfile(studentProfile);
            setIsLoading(false);
            setIsAuthorized(false);
          }
          return;
        }

        // 3. Academic profile completion
        const isAcademicProfileComplete = Boolean(
          studentProfile.academicProfileCompletedAt ||
          (studentProfile.targetScore && studentProfile.studyMethods && studentProfile.studyMethods.length > 0)
        );

        if (!isAcademicProfileComplete) {
          if (options?.redirectToAuth !== false) {
            router.replace("/profile/academic");
          }
          if (isMounted) {
            setProfile(studentProfile);
            setIsLoading(false);
            setIsAuthorized(false);
          }
          return;
        }

        // 4. Authorized - establish learning context
        const ctx = await StudentService.getLearningContext(effectiveUserId);

        if (isMounted) {
          setProfile(studentProfile);
          setLearningContext(ctx);
          setIsAuthorized(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Access gate error:", err);
        if (isMounted) {
          setIsLoading(false);
          setIsAuthorized(false);
        }
      }
    }

    evaluateAccess();

    return () => {
      isMounted = false;
    };
  }, [user, isAuthLoading, router, options?.redirectToAuth]);

  const streamSubjects = learningContext
    ? getStudentSubjects(learningContext)
    : profile?.streamId
    ? getStudentSubjects(profile.streamId, profile.techniqueMathSpecialty)
    : [];

  return {
    isLoading: isAuthLoading || isLoading,
    isAuthorized,
    profile,
    learningContext,
    streamSubjects,
  };
}
