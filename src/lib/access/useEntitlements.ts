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
  isExpired: false,
  canUseProduct: true,
  trialDaysRemaining: 0,
  trialHoursRemaining: 0,
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

let cachedEntitlements: { data: UserEntitlements; userId: string; timestamp: number } | null = null;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache window

export function useEntitlements() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const currentUserId = user?.id || "guest";

  // Check if valid cache exists for current user
  const initialCached =
    cachedEntitlements &&
    cachedEntitlements.userId === currentUserId &&
    Date.now() - cachedEntitlements.timestamp < CACHE_TTL_MS
      ? cachedEntitlements.data
      : null;

  const [entitlements, setEntitlements] = useState<UserEntitlements | null>(initialCached);
  const [isLoading, setIsLoading] = useState<boolean>(!initialCached);

  const fetchEntitlements = useCallback(async (forceRefresh = false) => {
    // If not forced and fresh cache exists, use it immediately
    if (
      !forceRefresh &&
      cachedEntitlements &&
      cachedEntitlements.userId === currentUserId &&
      Date.now() - cachedEntitlements.timestamp < CACHE_TTL_MS
    ) {
      setEntitlements(cachedEntitlements.data);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/entitlements", {
        headers: user?.id ? { "x-user-id": user.id } : {},
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.entitlements) {
          cachedEntitlements = {
            data: data.entitlements,
            userId: currentUserId,
            timestamp: Date.now(),
          };
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
  }, [user?.id, currentUserId]);

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
    isExpired: activeEntitlements.isExpired ?? false,
    canUseProduct: activeEntitlements.canUseProduct ?? true,
    trialDaysRemaining: activeEntitlements.trialDaysRemaining,
    trialHoursRemaining: activeEntitlements.trialHoursRemaining ?? (activeEntitlements.trialDaysRemaining * 24),
    dailyAiQuota: activeEntitlements.dailyAiQuota,
    canAccess,
    refreshEntitlements: () => fetchEntitlements(true),
    refresh: () => fetchEntitlements(true),
  };
}
