"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { StudentService } from "@/lib/services";
import { StudentProfile } from "@/types/student";
import { StudentLearningContext, getStudentSubjects } from "@/domain/student";
import { getRegistrationDraft } from "@/lib/onboarding/profile";
import { getStudentAccess, StudentAccessDecision } from "@/lib/access";

export interface LearningAccessGateState {
  isLoading: boolean;
  isAuthorized: boolean;
  hasPremiumAccess: boolean;
  accessDecision: StudentAccessDecision | null;
  profile: StudentProfile | null;
  learningContext: StudentLearningContext | null;
  streamSubjects: ReturnType<typeof getStudentSubjects>;
}

/**
 * Authoritative access gate enforcing:
 * 1. Authenticated account
 * 2. Personal registration completion
 * 3. Academic profile completion
 * 4. 7-day trial (168h) & subscription status verification
 */
export function useLearningAccessGate(options?: {
  redirectToAuth?: boolean;
}): LearningAccessGateState {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [learningContext, setLearningContext] = useState<StudentLearningContext | null>(null);
  const [accessDecision, setAccessDecision] = useState<StudentAccessDecision | null>(null);
  const [hasPremiumAccess, setHasPremiumAccess] = useState<boolean>(true);
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
      if (!user && !effectiveUserId) {
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
        let studentProfile = await StudentService.getProfile(effectiveUserId);
        const regDraft = getRegistrationDraft(effectiveUserId);

        // 2. Personal registration completion: check both camelCase and snake_case properties
        const isRegistrationComplete = Boolean(
          studentProfile?.registrationCompletedAt ||
          (studentProfile as any)?.registration_completed_at ||
          (studentProfile?.firstName && studentProfile?.streamId) ||
          ((studentProfile as any)?.first_name && (studentProfile as any)?.stream_id) ||
          (regDraft?.registrationCompletedAt && (regDraft?.firstName || regDraft?.streamId))
        );

        if (!isRegistrationComplete) {
          // Loop guard: ensure rapid bounces do not freeze the UI
          if (typeof window !== "undefined") {
            const lastBounce = sessionStorage.getItem("bac_gate_bounce_time");
            const now = Date.now();
            if (lastBounce && now - parseInt(lastBounce, 10) < 3000) {
              console.warn("Rapid redirect loop prevented in useLearningAccessGate");
              setIsLoading(false);
              setIsAuthorized(true);
              return;
            }
            sessionStorage.setItem("bac_gate_bounce_time", String(now));
          }

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

        // If registered, make sure studentProfile is populated
        if (!studentProfile) {
          studentProfile = await StudentService.getProfile(effectiveUserId);
        }

        // Clear bounce tracker on authorized entrance
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("bac_gate_bounce_time");
        }

        // 3. Authorized - establish learning context
        const ctx = await StudentService.getLearningContext(effectiveUserId);

        // 4. Calculate authoritative trial & subscription status
        const access = getStudentAccess(studentProfile);

        if (isMounted) {
          setProfile(studentProfile);
          setLearningContext(ctx);
          setAccessDecision(access);
          setHasPremiumAccess(access.canUseProduct);
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
    hasPremiumAccess,
    accessDecision,
    profile,
    learningContext,
    streamSubjects,
  };
}
