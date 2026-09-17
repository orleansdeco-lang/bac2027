/**
 * BAC Mastery 2.0 — Layer 1: Decision Contract
 * 
 * INVARIANT:
 * Pure contract for decisions produced by the Roadmap and Priority Engines.
 * Must be 100% deterministic and explainable.
 */

import { SubjectId, StreamId } from "@/types/education";

export type InterventionActionType =
  | "continuation_retest"       // Immediate isomorphic retest to close loop
  | "continuation_repair"       // Immediate micro-repair for active error
  | "spaced_retrieval_review"   // Urgent retention retrieval (prevent memory trace loss)
  | "recurring_error_cause"     // Root-cause remediation for recurring blunder
  | "diagnostic_bottleneck"     // Foundational fix for diagnostic bottleneck
  | "weakest_dimension"         // Strengthening weakest cognitive dimension
  | "emerging_verification"     // Transfer verification for single-success skill
  | "next_subject_skill"        // Curriculum advancement in active subject
  | "next_core_subject"         // Balanced transition to high-coefficient subject
  | "delayed_recovery";         // Calm recovery for delayed needs_more_work skill

export interface DecisionRationale {
  actionType: InterventionActionType;
  priorityRank: number; // 1 (Highest) to 8 (Lowest)
  title_ar: string;
  title_fr: string;
  evidenceSummary_ar: string;
  evidenceSummary_fr: string;
  studentExplanation_ar: string;
  studentExplanation_fr: string;
}

export interface DeterministicDecision {
  targetSkillId: string;
  targetSubjectId: SubjectId;
  streamId: StreamId;
  rationale: DecisionRationale;
  estimatedMinutes: number;
  decidedAt: string;
}
