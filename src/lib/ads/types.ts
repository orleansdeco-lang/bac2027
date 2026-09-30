/**
 * SHATER Advertising & Promotional Engine — Types & Schemas
 * 
 * Strict Invariants:
 * 1. Controlled Module: Advertisements must be reviewed before activation.
 * 2. Mandatory Labeling: All ads must display the official badge «إعلان» or «محتوى ترويجي».
 * 3. Human-Only Advertiser Verification: AI is strictly prohibited from auto-verifying advertisers.
 * 4. Educational Claims Review: Any pedagogical/exam success claims must undergo manual validation.
 * 5. Multi-Channel CTA: Supports external destination links and direct WhatsApp integration.
 */

export type CampaignStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "scheduled"
  | "active"
  | "paused"
  | "ended";

export type AdFormat = "image" | "video" | "native";

export type AdCtaType = "external_link" | "whatsapp";

export type AdPlacement =
  | "banner_top"
  | "sidebar"
  | "feed_native"
  | "between_exercises"
  | "modal_interstitial"
  | "announcement_bar";

export interface AdTargeting {
  wilayas?: number[]; // Official Algerian Wilaya codes (e.g., 31 for Oran, 16 for Algiers)
  communes?: string[]; // Specific communes (e.g., "وهران", "بئر الجير")
  streams?: string[]; // (e.g., "sciences_exp", "math", "technique_math")
  grades?: string[]; // (e.g., "3AS", "2AS", "1AS", "4AM")
  subjects?: string[]; // (e.g., "mathematics", "physics", "philosophy")
  pages?: string[]; // (e.g., "home", "practice", "orientation", "diwan", "exam")
  placements?: AdPlacement[];
}

export interface AdSchedule {
  startDate: string; // ISO date
  endDate?: string; // ISO date
  daysOfWeek?: number[]; // [0, 1, 2, 3, 4, 5, 6] (0 = Sunday, 5 = Friday, 6 = Saturday)
  timeWindows?: Array<{
    startHour: number; // 0-23
    endHour: number; // 0-23
  }>;
  frequencyCap?: {
    maxImpressionsPerUserPerDay: number;
  };
}

export interface AdCreative {
  id: string;
  advertiserId: string;
  format: AdFormat;
  titleAr: string;
  bodyAr: string;
  assetUrl: string; // Image or Video URL
  thumbnailUrl?: string;
  ctaType: AdCtaType;
  ctaDestination: string; // URL or WhatsApp phone number (+213...)
  ctaLabelAr: string; // (e.g., "تواصل عبر واتساب", "سجل الآن", "اكتشف الدورة")
  whatsappPrefillText?: string;
  videoDurationSeconds?: number;
  isEducationalClaim: boolean;
  claimVerificationStatus: "verified" | "unverified" | "rejected";
  claimVerificationNotes?: string;
}

export interface Advertiser {
  id: string;
  name: string;
  companyNameAr: string;
  contactEmail: string;
  phone: string;
  wilayaCode: number;
  isVerified: boolean; // Must be manually set by human admin!
  verifiedByUserId?: string;
  verifiedAt?: string;
  status: "active" | "pending_verification" | "suspended";
  notes?: string;
  createdAt: string;
}

export interface AdAnalytics {
  impressionsCount: number;
  clicksCount: number;
  whatsappClicksCount: number;
  videoViewsCount: number;
  videoCompletionsCount: number;
  ctrPercentage: number;
}

export interface AdCampaign {
  id: string;
  title: string;
  advertiserId: string;
  status: CampaignStatus;
  placement: AdPlacement;
  targeting: AdTargeting;
  schedule: AdSchedule;
  creative: AdCreative;
  analytics: AdAnalytics;
  budgetDzd?: number;
  isMandatoryBadgeConfirmed: boolean; // Confirms «إعلان» badge
  reviewNotes?: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  createdBy: "admin" | "ai_assistant" | "advertiser";
  createdAt: string;
  updatedAt: string;
}

export interface StudentTargetingContext {
  studentId?: string;
  wilayaCode?: number;
  commune?: string;
  streamId?: string;
  grade?: string;
  currentSubject?: string;
  currentPage: string;
  placement: AdPlacement;
}
