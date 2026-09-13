/**
 * BAC Mastery — Access Control & Trial Domain Types
 * Prompt 18: 48-Hour Free Trial & Conversion Architecture
 */

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
