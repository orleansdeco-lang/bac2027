/**
 * BAC Mastery - Mind, Rest & Recovery Engine Types
 */

export type WellbeingState = "good" | "normal" | "tired" | "stressed";

export interface WellbeingCheckin {
  id: string;
  studentId: string;
  state: WellbeingState;
  loggedAt: string;
  adaptedPlanSummary_ar: string;
  adaptedPlanSummary_fr: string;
}

export interface RestRecommendation {
  type: "micro_break" | "sleep_priority" | "light_day" | "complete_reset";
  durationMinutes: number;
  reason_ar: string;
  reason_fr: string;
}

export interface RecoveryPlan {
  studentId: string;
  missedMissionsCount: number;
  priority1MissionIds: string[]; // Essential prerequisites & bottlenecks
  priority2MissionIds: string[]; // Standard chapter progression
  optionalMissionIds: string[];  // Deferred for later review
  restartedAt: string;
  encouragement_ar: string;
  encouragement_fr: string;
}
