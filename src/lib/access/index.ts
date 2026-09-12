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

export const TRIAL_DURATION_HOURS = 48;
export const TRIAL_DURATION_MS = TRIAL_DURATION_HOURS * 60 * 60 * 1000;

export interface AccessProfileInput {
  id?: string;
  createdAt?: string;
  created_at?: string;
  trial_started_at?: string | null;
  trial_expires_at?: string | null;
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

  // 2. Explicit Paid Subscriber
  const rawStatus = (profile as any).access_status;
  const rawPlan = (profile as any).plan;
  if (rawStatus === "PAID" || rawPlan === "PAID") {
    return {
      status: "PAID_ACTIVE",
      trialStatus: "EXPIRED",
      accessStatus: "PAID",
      plan: "PAID",
      trialStartedAt: (profile as any).trial_started_at || null,
      trialExpiresAt: (profile as any).trial_expires_at || null,
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
    (profile as any).created_at || (profile as any).createdAt || now.toISOString();

  const trialStartedAt = (profile as any).trial_started_at || profileCreated;
  const trialStartMs = new Date(trialStartedAt).getTime();

  let trialExpiresAt = (profile as any).trial_expires_at;
  if (!trialExpiresAt) {
    trialExpiresAt = new Date(trialStartMs + TRIAL_DURATION_MS).toISOString();
  }
  const trialExpiryMs = new Date(trialExpiresAt).getTime();

  const remainingMs = trialExpiryMs - nowMs;
  const remainingHours = Math.max(0, Math.floor(remainingMs / (1000 * 60 * 60)));
  const remainingMinutes = Math.max(0, Math.floor(remainingMs / (1000 * 60)));

  // 4. Check for Expiration
  if (remainingMs <= 0 || rawStatus === "EXPIRED") {
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
      canUseProduct: false,
      isExpiringSoon: false,
      reason: "trial_48h_expired",
    };
  }

  // 5. Active Trial
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
    canUseProduct: true,
    isExpiringSoon: remainingHours < 6,
    reason: "trial_48h_active",
  };
}
