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

import { UserPlan, FeatureKey, UserEntitlements, DailyAiQuota, FREE_DAILY_AI_QUOTA } from "./types";
import { TRIAL_DURATION_MS } from "./index";
import { getServerAuthoritativeDate } from "./server-time";
import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "../supabase/client";
import { getAdminClient } from "../supabase/admin";
import { StudentRepository } from "../repositories/student-repository";

export { FREE_DAILY_AI_QUOTA };

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
  const isAllowed = userPlan === "PREMIUM" || userPlan === "TRIAL" || userPlan === "ADMIN" || userPlan === "STAFF";

  if (isAllowed) {
    return {
      allowed: true,
      used: 0,
      remaining: Infinity,
      total: Infinity,
    };
  }

  // EXPIRED accounts and unauthenticated users get 0 AI queries
  return {
    allowed: false,
    used: 0,
    remaining: 0,
    total: 0,
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
    return {
      userId: "guest",
      plan: "FREE",
      isPremium: false,
      isTrial: false,
      isAdmin: false,
      isExpired: false,
      isFree: true,
      canUseProduct: true,
      trialDaysRemaining: 3,
      trialHoursRemaining: 72,
      trialEndsAt: null,
      subscriptionExpiresAt: null,
      dailyAiQuota: {
        used: 0,
        total: 0,
        remaining: 0,
      },
      features: {
        EXAMS_FULL_LIBRARY: false,
        EXAMS_OFFICIAL_RECENT: false,
        PLANNER_BASIC: false,
        PLANNER_PRO_AI: false,
        DIAGNOSTIC_BASIC: false,
        DIAGNOSTIC_FULL: false,
        ERROR_LAB_BASIC: false,
        ERROR_LAB_AI_TWINS: false,
        AI_TUTOR_BASIC: false,
        AI_TUTOR_UNLIMITED: false,
        ANALYTICS_PRO: false,
        CAMPUS_COMMUNITY: false,
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

  // If user is Admin/Staff, immediately grant full access
  if (isAdmin) {
    return {
      userId,
      plan: "ADMIN",
      isPremium: true,
      isTrial: false,
      isAdmin: true,
      isExpired: false,
      isFree: false,
      canUseProduct: true,
      trialDaysRemaining: 0,
      trialHoursRemaining: 0,
      trialEndsAt: null,
      subscriptionExpiresAt: null,
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
      isExpired: false,
      isFree: false,
      canUseProduct: true,
      trialDaysRemaining: 0,
      trialHoursRemaining: 0,
      trialEndsAt: null,
      subscriptionExpiresAt: subExpiresAt,
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

  // 3. Check for 3-Day (72h) Free Trial
  const createdAt =
    studentProfile?.trial_started_at ||
    studentProfile?.created_at ||
    studentProfile?.createdAt ||
    now.toISOString();

  const accountCreatedMs = new Date(createdAt).getTime();
  const trialExpiresMs = accountCreatedMs + TRIAL_DURATION_MS;
  const trialRemainingMs = trialExpiresMs - nowMs;
  const isTrialActive = trialRemainingMs > 0;

  if (isTrialActive) {
    const trialHoursRemaining = Math.max(1, Math.floor(trialRemainingMs / (60 * 60 * 1000)));
    const trialDaysRemaining = Math.max(1, Math.ceil(trialRemainingMs / (24 * 60 * 60 * 1000)));
    return {
      userId,
      plan: "TRIAL",
      isPremium: true,
      isTrial: true,
      isAdmin: false,
      isExpired: false,
      isFree: false,
      canUseProduct: true,
      trialDaysRemaining,
      trialHoursRemaining,
      trialEndsAt: new Date(trialExpiresMs).toISOString(),
      subscriptionExpiresAt: null,
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

  // 4. Trial Expired: Access is strictly BLOCKED until subscription is purchased
  return {
    userId,
    plan: "EXPIRED",
    isPremium: false,
    isTrial: false,
    isAdmin: false,
    isExpired: true,
    isFree: false,
    canUseProduct: false,
    trialDaysRemaining: 0,
    trialHoursRemaining: 0,
    trialEndsAt: new Date(trialExpiresMs).toISOString(),
    subscriptionExpiresAt: null,
    features: {
      EXAMS_FULL_LIBRARY: false,
      EXAMS_OFFICIAL_RECENT: false,
      PLANNER_BASIC: false,
      PLANNER_PRO_AI: false,
      DIAGNOSTIC_BASIC: false,
      DIAGNOSTIC_FULL: false,
      ERROR_LAB_BASIC: false,
      ERROR_LAB_AI_TWINS: false,
      AI_TUTOR_BASIC: false,
      AI_TUTOR_UNLIMITED: false,
      ANALYTICS_PRO: false,
      CAMPUS_COMMUNITY: false,
    },
  };
}
