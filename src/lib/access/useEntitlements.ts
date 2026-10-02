"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "@/lib/auth/context";
import { UserEntitlements, UserPlan, FeatureKey, DailyAiQuota, FREE_DAILY_AI_QUOTA } from "./types";

const DEFAULT_FREE_ENTITLEMENTS: UserEntitlements = {
  userId: "guest",
  plan: "FREE",
  isPremium: false,
  isTrial: false,
  isAdmin: false,
  isFree: true,
  trialDaysRemaining: 0,
  trialEndsAt: null,
  subscriptionExpiresAt: null,
  dailyAiQuota: {
    used: 0,
    total: FREE_DAILY_AI_QUOTA,
    remaining: FREE_DAILY_AI_QUOTA,
  },
  features: {
    EXAMS_FULL_LIBRARY: false,
    EXAMS_OFFICIAL_RECENT: true,
    PLANNER_BASIC: true,
    PLANNER_PRO_AI: false,
    DIAGNOSTIC_BASIC: true,
    DIAGNOSTIC_FULL: false,
    ERROR_LAB_BASIC: true,
    ERROR_LAB_AI_TWINS: false,
    AI_TUTOR_BASIC: true,
    AI_TUTOR_UNLIMITED: false,
    ANALYTICS_PRO: false,
    CAMPUS_COMMUNITY: true,
  },
};

export function useEntitlements() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [entitlements, setEntitlements] = useState<UserEntitlements | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchEntitlements = useCallback(async () => {
    try {
      const res = await fetch("/api/user/entitlements", {
        cache: "no-store",
        headers: user?.id ? { "x-user-id": user.id } : {},
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.entitlements) {
          setEntitlements(data.entitlements);
          return;
        }
      }
    } catch (err) {
      console.warn("[useEntitlements] fetch error:", err);
    } finally {
      setIsLoading(false);
    }

    // Fallback if not loaded
    setEntitlements((prev) => prev || DEFAULT_FREE_ENTITLEMENTS);
  }, [user?.id]);

  useEffect(() => {
    if (!isAuthLoading) {
      fetchEntitlements();
    }
  }, [isAuthLoading, fetchEntitlements]);

  const activeEntitlements = entitlements || DEFAULT_FREE_ENTITLEMENTS;

  const canAccess = useCallback(
    (feature: FeatureKey): boolean => {
      return Boolean(activeEntitlements.features[feature]);
    },
    [activeEntitlements]
  );

  return {
    entitlements: activeEntitlements,
    isLoading: isAuthLoading || isLoading,
    plan: activeEntitlements.plan,
    isPremium: activeEntitlements.isPremium,
    isTrial: activeEntitlements.isTrial,
    isAdmin: activeEntitlements.isAdmin,
    isFree: activeEntitlements.isFree,
    trialDaysRemaining: activeEntitlements.trialDaysRemaining,
    dailyAiQuota: activeEntitlements.dailyAiQuota,
    canAccess,
    refreshEntitlements: fetchEntitlements,
  };
}
