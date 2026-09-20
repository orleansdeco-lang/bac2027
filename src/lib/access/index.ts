/**
 * BAC Mastery — Centralized Access Decision Service
 * Prompt 18: 48-Hour Free Trial Enforcement
 * Single Source of Truth for Student Entitlements
 */

import { StudentAccessDecision, AccessState, TrialStatus, AccessStatus, Plan } from "./types";
import { getServerAuthoritativeDate } from "./server-time";
import { StrategicProfile } from "@/types/onboarding";

export * from "./types";
export * from "./server-time";

export const TRIAL_DURATION_DAYS = 7;
export const TRIAL_DURATION_HOURS = 168; // 7 days * 24 hours
export const TRIAL_DURATION_MS = TRIAL_DURATION_HOURS * 60 * 60 * 1000;

/**
 * Calculates trial expiration date:
 * Strictly 7 days (168 hours) from account creation date.
 */
export function calculateTrialExpiration(startDate: Date = new Date()): Date {
  return new Date(startDate.getTime() + TRIAL_DURATION_MS);
}

/**
 * Formats countdown showing days and hours clearly.
 * E.g., "4 أيام و 8 ساعات" / "4j 8h"
 */
export function formatTrialCountdown(remainingHours: number, isAr: boolean = true): string {
  const safeHours = Math.max(0, remainingHours);
  const days = Math.floor(safeHours / 24);
  const hours = safeHours % 24;

  if (isAr) {
    if (days > 0 && hours > 0) return `${days} أيام و ${hours} ساعات`;
    if (days > 0) return `${days} أيام`;
    return `${hours} ساعة`;
  } else {
    if (days > 0 && hours > 0) return `${days}j ${hours}h`;
    if (days > 0) return `${days}j`;
    return `${hours}h`;
  }
}

/**
 * Formats trial expiration date ONLY without showing hours/minutes.
 * E.g., "16 سبتمبر 2026" / "16 septembre 2026"
 */
export function formatTrialExpiryDate(expiryDateOrIso: string | Date, isAr: boolean = true): string {
  try {
    const d = new Date(expiryDateOrIso);
    return d.toLocaleDateString(isAr ? "ar-DZ" : "fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return String(expiryDateOrIso);
  }
}

export interface AccessProfileInput {
  id?: string;
  createdAt?: string;
  created_at?: string;
  trial_started_at?: string | null;
  trial_expires_at?: string | null;
  subscription_started_at?: string | null;
  subscription_expires_at?: string | null;
  access_status?: AccessStatus | string | null;
  plan?: Plan | string | null;
  raw_draft?: any;
}

/**
 * Calculates authoritative student access state.
 * Never trusts client device clock; defaults to server-authoritative time.
 */
export function getStudentAccess(
  profile?: AccessProfileInput | StrategicProfile | null,
  referenceDate?: Date
): StudentAccessDecision {
  const now = referenceDate || getServerAuthoritativeDate();
  const nowMs = now.getTime();

  // 1. Unregistered / Guest Visitor
  if (!profile) {
    return {
      status: "TRIAL_ACTIVE",
      trialStatus: "NOT_STARTED",
      accessStatus: "TRIAL",
      plan: "PILOT_TRIAL",
      trialStartedAt: null,
      trialExpiresAt: null,
      remainingMilliseconds: TRIAL_DURATION_MS,
      remainingHours: TRIAL_DURATION_HOURS,
      remainingMinutes: TRIAL_DURATION_HOURS * 60,
      canUseProduct: true,
      isExpiringSoon: false,
      reason: "guest_visitor_access",
    };
  }

  // 2. Check for Explicit Rejected State
  const rawStatus = (profile as any).access_status || (profile as any).accessStatus;
  const rawPlan = (profile as any).plan;
  const subExpiresAt = (profile as any).subscription_expires_at || (profile as any).subscriptionExpiresAt;
  const subStartedAt = (profile as any).subscription_started_at || (profile as any).subscriptionStartedAt;

  if (rawStatus === "REJECTED") {
    const rejectionReason =
      (profile as any).rejection_reason || (profile as any).rejectionReason || "تم رفض وصل الدفع من قبل الإدارة";
    return {
      status: "EXPIRED",
      trialStatus: "EXPIRED",
      accessStatus: "EXPIRED",
      plan: rawPlan || "season",
      trialStartedAt: (profile as any).trial_started_at || null,
      trialExpiresAt: (profile as any).trial_expires_at || null,
      subscriptionStartedAt: subStartedAt || null,
      subscriptionExpiresAt: null,
      remainingMilliseconds: 0,
      remainingHours: 0,
      remainingMinutes: 0,
      remainingDays: 0,
      remainingHoursOnly: 0,
      canUseProduct: false,
      isExpiringSoon: false,
      reason: rejectionReason,
    };
  }

  // 3. Explicit Paid Subscriber or Active Subscription
  const hasFutureSubscription = Boolean(subExpiresAt && new Date(subExpiresAt).getTime() > nowMs);
  if (rawStatus === "PAID" || rawPlan === "PAID" || hasFutureSubscription || (subExpiresAt && rawStatus !== "TRIAL")) {
    // If subscription_expires_at is present, verify expiration dynamically against server time
    if (subExpiresAt) {
      const subExpiryMs = new Date(subExpiresAt).getTime();
      if (!isNaN(subExpiryMs)) {
        if (nowMs >= subExpiryMs) {
          return {
            status: "EXPIRED",
            trialStatus: "EXPIRED",
            accessStatus: "EXPIRED",
            plan: rawPlan || "PAID",
            trialStartedAt: (profile as any).trial_started_at || null,
            trialExpiresAt: (profile as any).trial_expires_at || null,
            subscriptionStartedAt: subStartedAt || null,
            subscriptionExpiresAt: subExpiresAt,
            remainingMilliseconds: 0,
            remainingHours: 0,
            remainingMinutes: 0,
            remainingDays: 0,
            remainingHoursOnly: 0,
            canUseProduct: false,
            isExpiringSoon: false,
            reason: "subscription_expired",
          };
        }

        const remainingMs = subExpiryMs - nowMs;
        const remainingHours = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));
        const remainingMinutes = Math.max(0, Math.floor(remainingMs / (1000 * 60)));
        const remainingDays = Math.floor(remainingHours / 24);
        const remainingHoursOnly = remainingHours % 24;

        return {
          status: "PAID_ACTIVE",
          trialStatus: "EXPIRED",
          accessStatus: "PAID",
          plan: rawPlan || "PAID",
          trialStartedAt: (profile as any).trial_started_at || null,
          trialExpiresAt: (profile as any).trial_expires_at || null,
          subscriptionStartedAt: subStartedAt || null,
          subscriptionExpiresAt: subExpiresAt,
          remainingMilliseconds: remainingMs,
          remainingHours,
          remainingMinutes,
          remainingDays,
          remainingHoursOnly,
          canUseProduct: true,
          isExpiringSoon: remainingHours < 48,
          reason: "paid_active_access",
        };
      }
    }

    return {
      status: "PAID_ACTIVE",
      trialStatus: "EXPIRED",
      accessStatus: "PAID",
      plan: rawPlan || "PAID",
      trialStartedAt: (profile as any).trial_started_at || null,
      trialExpiresAt: (profile as any).trial_expires_at || null,
      subscriptionStartedAt: subStartedAt || null,
      subscriptionExpiresAt: null,
      remainingMilliseconds: Infinity,
      remainingHours: Infinity,
      remainingMinutes: Infinity,
      canUseProduct: true,
      isExpiringSoon: false,
      reason: "paid_active_access",
    };
  }

  // 3. Resolve Trial Timestamps
  const profileCreated =
    (profile as any).created_at || (profile as any).createdAt || (profile as any).trial_started_at || now.toISOString();

  const trialStartedAt = (profile as any).trial_started_at || profileCreated;
  const accountCreatedMs = new Date(profileCreated).getTime();

  // Authoritative trial expiration: STRICTLY account_created_at + 7 days (168 hours)
  const authoritative7dMs = accountCreatedMs + TRIAL_DURATION_MS;
  const authoritativeExpiresAtIso = new Date(authoritative7dMs).toISOString();

  // Guard against client clock or legacy trial values
  // Always enforce authoritative account_created_at + 7 days
  const trialExpiresAt = authoritativeExpiresAtIso;
  const remainingMs = authoritative7dMs - nowMs;
  const remainingHours = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));
  const remainingMinutes = Math.max(0, Math.floor(remainingMs / (1000 * 60)));

  // 4. Check for Expiration
  if (remainingMs <= 0) {
    return {
      status: "TRIAL_EXPIRED",
      trialStatus: "EXPIRED",
      accessStatus: "EXPIRED",
      plan: "PILOT_TRIAL",
      trialStartedAt,
      trialExpiresAt,
      remainingMilliseconds: 0,
      remainingHours: 0,
      remainingMinutes: 0,
      remainingDays: 0,
      remainingHoursOnly: 0,
      canUseProduct: false,
      isExpiringSoon: false,
      reason: "trial_7d_expired",
    };
  }

  // 5. Active Trial
  const remainingDays = Math.floor(remainingHours / 24);
  const remainingHoursOnly = remainingHours % 24;

  return {
    status: "TRIAL_ACTIVE",
    trialStatus: "ACTIVE",
    accessStatus: "TRIAL",
    plan: "PILOT_TRIAL",
    trialStartedAt,
    trialExpiresAt,
    remainingMilliseconds: remainingMs,
    remainingHours,
    remainingMinutes,
    remainingDays,
    remainingHoursOnly,
    canUseProduct: true,
    isExpiringSoon: remainingHours < 24,
    reason: "trial_7d_active",
  };
}

/**
 * Authoritative entitlement verification function (Section 35)
 * Returns true if trial active OR subscription active.
 * False if trial expired and no active subscription.
 */
export function hasPremiumAccess(
  profile?: AccessProfileInput | StrategicProfile | null,
  referenceDate?: Date
): boolean {
  const access = getStudentAccess(profile, referenceDate);
  return access.canUseProduct;
}

