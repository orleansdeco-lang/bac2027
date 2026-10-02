/**
 * BAC Mastery — Access Control & Trial Domain Types
 * Prompt 18: 48-Hour Free Trial & Conversion Architecture
 */

export type UserPlan = "TRIAL" | "PREMIUM" | "EXPIRED" | "ADMIN" | "STAFF" | "FREE";

export type FeatureKey =
  | "EXAMS_FULL_LIBRARY"
  | "EXAMS_OFFICIAL_RECENT"
  | "PLANNER_BASIC"
  | "PLANNER_PRO_AI"
  | "DIAGNOSTIC_BASIC"
  | "DIAGNOSTIC_FULL"
  | "ERROR_LAB_BASIC"
  | "ERROR_LAB_AI_TWINS"
  | "AI_TUTOR_BASIC"
  | "AI_TUTOR_UNLIMITED"
  | "ANALYTICS_PRO"
  | "CAMPUS_COMMUNITY";

export const FREE_DAILY_AI_QUOTA = 0;

export interface DailyAiQuota {
  used: number;
  total: number;
  remaining: number;
}

export interface UserEntitlements {
  userId: string;
  plan: UserPlan;
  isPremium: boolean;
  isTrial: boolean;
  isAdmin: boolean;
  isExpired: boolean;
  isFree: boolean;
  canUseProduct: boolean;
  trialDaysRemaining: number;
  trialHoursRemaining: number;
  trialEndsAt: string | null;
  subscriptionExpiresAt: string | null;
  dailyAiQuota?: DailyAiQuota;
  features: Record<FeatureKey, boolean>;
}

export type TrialStatus = "NOT_STARTED" | "ACTIVE" | "EXPIRED";
export type AccessStatus = "TRIAL" | "PAID" | "EXPIRED";
export type Plan = "PILOT_TRIAL" | "PAID" | "season" | "monthly" | string;

export type AccessState = "TRIAL_ACTIVE" | "PAID_ACTIVE" | "TRIAL_EXPIRED" | "EXPIRED";

export interface StudentTrialData {
  trial_started_at: string | null;
  trial_expires_at: string | null;
  subscription_started_at?: string | null;
  subscription_expires_at?: string | null;
  access_status: AccessStatus;
  plan: Plan;
}

export interface StudentAccessDecision {
  status: AccessState;
  trialStatus: TrialStatus;
  accessStatus: AccessStatus;
  plan: Plan;
  trialStartedAt: string | null;
  trialExpiresAt: string | null;
  subscriptionStartedAt?: string | null;
  subscriptionExpiresAt?: string | null;
  remainingMilliseconds: number;
  remainingHours: number;
  remainingMinutes: number;
  remainingDays?: number;
  remainingHoursOnly?: number;
  canUseProduct: boolean;
  isExpiringSoon: boolean; // < 6 hours
  reason: string;
}

