/**
 * BAC Mastery — Authoritative Entitlements & Freemium Engine
 * Server-Side Single Source of Truth for Plan & Feature Access
 * 
 * INVARIANTS:
 * 1. Never trust client-provided plan or role overrides.
 * 2. FREE tier gives genuine, non-expiring access to core foundation:
 *    - Calculator & orientation explorer
 *    - Official recent BAC exams (2023, 2024)
 *    - Basic manual study planner
 *    - Single-subject diagnostic
 *    - Error Lab viewing & ministerial trap explorer
 *    - 5 AI tutor questions per day
 *    - Campus / Diwan community participation
 * 3. TRIAL (7 days from creation): all-access pass to test drive Premium features.
 * 4. PREMIUM (Monthly 1,500 DZD / Season 4,900 DZD): full library, Planner PRO, AI twins, unlimited tutor, analytics.
 * 5. ADMIN: full system access + operations.
 */

import { UserPlan, FeatureKey, UserEntitlements, DailyAiQuota } from "./types";
import { TRIAL_DURATION_MS, getServerAuthoritativeDate } from "./index";
import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "../supabase/client";
import { getAdminClient } from "../supabase/admin";
import { StudentRepository } from "../repositories/student-repository";

export const FREE_DAILY_AI_QUOTA = 5;

// In-memory persistent day usage tracker for AI Tutor: Map<"userId:YYYY-MM-DD", number>
const aiDailyUsageMap = new Map<string, number>();

/**
 * Returns today's ISO date string in YYYY-MM-DD format (Algeria UTC+1)
 */
export function getTodayDateString(refDate?: Date): string {
  const d = refDate || getServerAuthoritativeDate();
  // Algiers is UTC+1
  const tzOffset = 60 * 60 * 1000;
  const algiersTime = new Date(d.getTime() + tzOffset);
  return algiersTime.toISOString().split("T")[0];
}

/**
 * Gets daily AI usage count for a user
 */
export async function getDailyAiUsage(userId: string, dateIso?: string): Promise<number> {
  const dayKey = `${userId}:${dateIso || getTodayDateString()}`;
  return aiDailyUsageMap.get(dayKey) || 0;
}

/**
 * Increments daily AI usage and checks against quota
 */
export async function recordAiQueryUsage(
  userId: string,
  userPlan: UserPlan
): Promise<{ allowed: boolean; used: number; remaining: number; total: number }> {
  const isUnlimited = userPlan === "PREMIUM" || userPlan === "TRIAL" || userPlan === "ADMIN";

  if (isUnlimited) {
    return {
      allowed: true,
      used: 0,
      remaining: Infinity,
      total: Infinity,
    };
  }

  const dayKey = `${userId}:${getTodayDateString()}`;
  const currentUsed = aiDailyUsageMap.get(dayKey) || 0;

  if (currentUsed >= FREE_DAILY_AI_QUOTA) {
    return {
      allowed: false,
      used: currentUsed,
      remaining: 0,
      total: FREE_DAILY_AI_QUOTA,
    };
  }

  const nextCount = currentUsed + 1;
  aiDailyUsageMap.set(dayKey, nextCount);

  return {
    allowed: true,
    used: nextCount,
    remaining: Math.max(0, FREE_DAILY_AI_QUOTA - nextCount),
    total: FREE_DAILY_AI_QUOTA,
  };
}

/**
 * Authoritative Server-Side User Entitlements Resolver
 */
export async function getUserEntitlements(
  userId: string,
  token?: string | null
): Promise<UserEntitlements> {
  const now = getServerAuthoritativeDate();
  const nowMs = now.getTime();

  // Anonymous / Guest Visitor fallback
  if (!userId || userId === "guest" || userId === "unauthenticated") {
    const used = await getDailyAiUsage("guest");
    return {
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
        used,
        total: FREE_DAILY_AI_QUOTA,
        remaining: Math.max(0, FREE_DAILY_AI_QUOTA - used),
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
  }

  // 1. Fetch Authoritative Profile and Staff Role from DB
  let studentProfile: any = null;
  let isAdmin = false;

  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;

  if (isSupabaseConfigured && client) {
    try {
      // Check staff_roles for admin rights
      const { data: staffData } = await client
        .from("staff_roles")
        .select("role, is_active")
        .eq("user_id", userId)
        .maybeSingle();

      if (staffData && staffData.is_active && (staffData.role === "SUPER_ADMIN" || staffData.role === "ADMIN" || staffData.role === "OPERATOR")) {
        isAdmin = true;
      }

      // Check student_profiles
      const { data: profileData } = await client
        .from("student_profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      studentProfile = profileData;
    } catch (dbErr) {
      console.warn("[getUserEntitlements] Supabase query warning:", dbErr);
    }
  }

  // Fallback to StudentRepository if Supabase client did not find profile
  if (!studentProfile) {
    try {
      studentProfile = await StudentRepository.getProfile(userId);
    } catch {}
  }

  // If user is Admin, immediately grant full access
  if (isAdmin) {
    return {
      userId,
      plan: "ADMIN",
      isPremium: true,
      isTrial: false,
      isAdmin: true,
      isFree: false,
      trialDaysRemaining: 0,
      trialEndsAt: null,
      subscriptionExpiresAt: null,
      dailyAiQuota: {
        used: 0,
        total: Infinity,
        remaining: Infinity,
      },
      features: {
        EXAMS_FULL_LIBRARY: true,
        EXAMS_OFFICIAL_RECENT: true,
        PLANNER_BASIC: true,
        PLANNER_PRO_AI: true,
        DIAGNOSTIC_BASIC: true,
        DIAGNOSTIC_FULL: true,
        ERROR_LAB_BASIC: true,
        ERROR_LAB_AI_TWINS: true,
        AI_TUTOR_BASIC: true,
        AI_TUTOR_UNLIMITED: true,
        ANALYTICS_PRO: true,
        CAMPUS_COMMUNITY: true,
      },
    };
  }

  // 2. Check for Paid Subscription
  const subExpiresAt = studentProfile?.subscription_expires_at || studentProfile?.subscriptionExpiresAt;
  const rawStatus = studentProfile?.access_status || studentProfile?.accessStatus;
  const isPaidActive = Boolean(
    (rawStatus === "PAID" || subExpiresAt) &&
    subExpiresAt &&
    new Date(subExpiresAt).getTime() > nowMs
  );

  if (isPaidActive) {
    return {
      userId,
      plan: "PREMIUM",
      isPremium: true,
      isTrial: false,
      isAdmin: false,
      isFree: false,
      trialDaysRemaining: 0,
      trialEndsAt: null,
      subscriptionExpiresAt: subExpiresAt,
      dailyAiQuota: {
        used: 0,
        total: Infinity,
        remaining: Infinity,
      },
      features: {
        EXAMS_FULL_LIBRARY: true,
        EXAMS_OFFICIAL_RECENT: true,
        PLANNER_BASIC: true,
        PLANNER_PRO_AI: true,
        DIAGNOSTIC_BASIC: true,
        DIAGNOSTIC_FULL: true,
        ERROR_LAB_BASIC: true,
        ERROR_LAB_AI_TWINS: true,
        AI_TUTOR_BASIC: true,
        AI_TUTOR_UNLIMITED: true,
        ANALYTICS_PRO: true,
        CAMPUS_COMMUNITY: true,
      },
    };
  }

  // 3. Check for 7-Day Free Trial
  const createdAt =
    studentProfile?.created_at ||
    studentProfile?.createdAt ||
    studentProfile?.trial_started_at ||
    now.toISOString();

  const accountCreatedMs = new Date(createdAt).getTime();
  const trialExpiresMs = accountCreatedMs + TRIAL_DURATION_MS;
  const trialRemainingMs = trialExpiresMs - nowMs;
  const isTrialActive = trialRemainingMs > 0;

  if (isTrialActive) {
    const trialDaysRemaining = Math.max(1, Math.ceil(trialRemainingMs / (24 * 60 * 60 * 1000)));
    return {
      userId,
      plan: "TRIAL",
      isPremium: true,
      isTrial: true,
      isAdmin: false,
      isFree: false,
      trialDaysRemaining,
      trialEndsAt: new Date(trialExpiresMs).toISOString(),
      subscriptionExpiresAt: null,
      dailyAiQuota: {
        used: 0,
        total: Infinity,
        remaining: Infinity,
      },
      features: {
        EXAMS_FULL_LIBRARY: true,
        EXAMS_OFFICIAL_RECENT: true,
        PLANNER_BASIC: true,
        PLANNER_PRO_AI: true,
        DIAGNOSTIC_BASIC: true,
        DIAGNOSTIC_FULL: true,
        ERROR_LAB_BASIC: true,
        ERROR_LAB_AI_TWINS: true,
        AI_TUTOR_BASIC: true,
        AI_TUTOR_UNLIMITED: true,
        ANALYTICS_PRO: true,
        CAMPUS_COMMUNITY: true,
      },
    };
  }

  // 4. Default: Continuous FREE Tier (Zero lockout, genuine value)
  const used = await getDailyAiUsage(userId);
  return {
    userId,
    plan: "FREE",
    isPremium: false,
    isTrial: false,
    isAdmin: false,
    isFree: true,
    trialDaysRemaining: 0,
    trialEndsAt: new Date(trialExpiresMs).toISOString(),
    subscriptionExpiresAt: null,
    dailyAiQuota: {
      used,
      total: FREE_DAILY_AI_QUOTA,
      remaining: Math.max(0, FREE_DAILY_AI_QUOTA - used),
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
}
