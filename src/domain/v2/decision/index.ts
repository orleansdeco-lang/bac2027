/**
 * BAC Mastery V2 — Canonical Decision Contracts
 * 
 * INVARIANT:
 * Weakest Skill ≠ Highest Priority.
 * Priority (tactical next step) is decoupled from Roadmap (strategic macro-path).
 * Hard Safety Gates (Retest, Repair, Retention, Prerequisites) take absolute precedence.
 */

import { DecisionId, SkillId, StudentId } from "../ids";
import { SubjectId, StreamId } from "@/types/education";
import { MissionDurationClass, CanonicalMissionType } from "../mission";

// --- 8 Priority Hierarchy Levels (Safety Gates & Contextual Factors) ---

export type PriorityReasonCode =
  | "continuation_retest"           // Gate 1: Retest twin to close loop
  | "continuation_repair"           // Gate 2: Micro-repair for active error
  | "critical_retention_overdue"    // Gate 3: Urgent memory retrieval before trace collapses
  | "unmastered_prerequisite"       // Gate 4: Foundational prerequisite fix before downstream work
  | "recurring_error_cause"         // Gate 5: Remediation for recurring blunder
  | "diagnostic_bottleneck"         // Gate 6: Prerequisite probe remediation from diagnostic
  | "active_subject_progression"    // Contextual 7: Advancement in active subject
  | "core_subject_balancing";       // Contextual 8: Transition to high-coefficient subject

export interface PriorityGateDefinition {
  priorityRank: number; // 1 (Highest) to 8 (Lowest)
  reasonCode: PriorityReasonCode;
  isHardSafetyGate: boolean;
  description_en: string;
}

export const PRIORITY_HIERARCHY_GATES: Record<PriorityReasonCode, PriorityGateDefinition> = {
  continuation_retest: {
    priorityRank: 1,
    reasonCode: "continuation_retest",
    isHardSafetyGate: true,
    description_en: "Immediate isomorphic twin retest to validate active repair",
  },
  continuation_repair: {
    priorityRank: 2,
    reasonCode: "continuation_repair",
    isHardSafetyGate: true,
    description_en: "Immediate micro-repair for freshly diagnosed error",
  },
  critical_retention_overdue: {
    priorityRank: 3,
    reasonCode: "critical_retention_overdue",
    isHardSafetyGate: true,
    description_en: "Urgent retention retrieval for demonstrated skill overdue >= 4 days",
  },
  unmastered_prerequisite: {
    priorityRank: 4,
    reasonCode: "unmastered_prerequisite",
    isHardSafetyGate: true,
    description_en: "Foundational prerequisite gap preventing progress on target skill",
  },
  recurring_error_cause: {
    priorityRank: 5,
    reasonCode: "recurring_error_cause",
    isHardSafetyGate: false,
    description_en: "Root-cause remediation for recurring blunder (>= 2 occurrences)",
  },
  diagnostic_bottleneck: {
    priorityRank: 6,
    reasonCode: "diagnostic_bottleneck",
    isHardSafetyGate: false,
    description_en: "Remediating bottleneck identified during diagnostic L3 probe",
  },
  active_subject_progression: {
    priorityRank: 7,
    reasonCode: "active_subject_progression",
    isHardSafetyGate: false,
    description_en: "Advancing to next curriculum skill in currently active subject",
  },
  core_subject_balancing: {
    priorityRank: 8,
    reasonCode: "core_subject_balancing",
    isHardSafetyGate: false,
    description_en: "Transitioning focus to high-coefficient core subject",
  },
};

export interface DecisionRationale {
  reasonCode: PriorityReasonCode;
  priorityRank: number;
  isHardSafetyGate: boolean;
  title_ar: string;
  title_fr: string;
  evidenceSummary_ar: string;
  evidenceSummary_fr: string;
  studentExplanation_ar: string;
  studentExplanation_fr: string;
}

export interface DeterministicDecision {
  id: DecisionId;
  studentId: StudentId;
  targetSkillId: SkillId;
  targetSubjectId: SubjectId;
  streamId: StreamId;
  recommendedMissionType: CanonicalMissionType;
  durationClass: MissionDurationClass;
  estimatedMinutes: number;
  rationale: DecisionRationale;
  decidedAt: string;
}

/**
 * Priority Engine Contract
 */
export interface PriorityEngineContract {
  evaluateNextDecision(input: {
    studentId: StudentId;
    streamId: StreamId;
    hasActiveRetest: boolean;
    hasActiveRepair: boolean;
    criticalRetentionOverdueSkillIds: SkillId[];
    unmasteredPrerequisiteSkillIds: SkillId[];
    weakestSkillId?: SkillId;
  }): { recommendedSkillId: SkillId; reasonCode: PriorityReasonCode; priorityRank: number };
}
