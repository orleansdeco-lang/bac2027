/**
 * SHATER BAC — Referral & Credit Domain Types (V1)
 */

export type ReferralStatus = "PENDING" | "QUALIFIED" | "REWARDED" | "REJECTED" | "CANCELLED";

export type CreditTransactionType = "REFERRAL_REWARD" | "SUBSCRIPTION_DISCOUNT" | "ADMIN_CREDIT" | "REFUND";

export type CreditTransactionStatus = "PENDING" | "AVAILABLE" | "USED" | "EXPIRED" | "REVERSED";

export const REFERRAL_REWARD_AMOUNT_DZD = 700;

export interface ReferralRecord {
  id: string;
  referrerId: string;
  referredId: string;
  referralCode: string;
  status: ReferralStatus;
  rewardAmountDzd: number;
  qualifyingOrderId?: string | null;
  qualifiedAt?: string | null;
  rewardedAt?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt?: string;
  // Privacy-safe display name for referred friend
  friendFirstName?: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amountDzd: number;
  type: CreditTransactionType;
  status: CreditTransactionStatus;
  referenceId?: string;
  notes?: string;
  createdAt: string;
}

export interface ReferralDashboardItem {
  id: string;
  friendName: string;
  status: "subscribed" | "trial" | "rejected";
  statusLabelAr: string;
  rewardLabel: string;
  isRewarded: boolean;
  createdAt: string;
}

export interface ReferralSummary {
  referralCode: string;
  shareUrl: string;
  whatsappMessage: string;
  totalReferrals: number;
  subscribedCount: number;
  pendingCount: number;
  confirmedRewardsDzd: number;
  pendingRewardsDzd: number;
  creditBalanceDzd: number;
  friends: ReferralDashboardItem[];
}
