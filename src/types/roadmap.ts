/**
 * BAC Mastery - Roadmap Engine Types
 * Prompt 06: Pure Deterministic Adaptive Roadmap
 */

import {
  EducationLevel,
  ExamType,
  StreamId,
  SubjectId,
  TechniqueMathSpecialty,
} from "./education";
import { StrategicProfile } from "./onboarding";
import { DiagnosticAnalysisResult } from "./diagnostic";
import { ErrorRecord, MasteryEvidence, Mission } from "./mission";

export type RoadmapConfidence = "pilot" | "emerging" | "supported";

export type LearningStage = "fix" | "verify" | "demonstrate" | "move_forward";

export type MissionReasonCode =
  | "continuation_repair"
  | "continuation_retest"
  | "delayed_needs_more_work"
  | "recurring_error_cause"
  | "diagnostic_bottleneck"
  | "weakest_supported_dimension"
  | "emerging_verification"
  | "next_subject_skill"
  | "next_core_subject";

export interface MissionRationale {
  reasonCode: MissionReasonCode;
  reasonLabel_ar: string;
  reasonLabel_fr: string;
  evidence_ar: string;
  evidence_fr: string;
  priority: number; // 1 to 7 corresponding to the authoritative hierarchy
  shortExplanation_ar: string;
  shortExplanation_fr: string;
}

export interface SubjectProgressItem {
  subjectId: SubjectId;
  name_ar: string;
  name_fr: string;
  status: "assessed" | "partially_assessed" | "not_assessed";
  evidenceLevel: "none" | "pilot_evidence" | "supported";
  demonstratedCount: number;
  emergingCount: number;
  needsWorkCount: number;
  openErrorsCount: number;
  totalPilotSkills: number;
  coefficient: number;
}

export interface QueuedMissionItem {
  mission: Mission;
  rationale: MissionRationale;
  priorityOrder: number;
}

export interface MasteredSkillItem {
  skillId: string;
  subjectId: SubjectId;
  achievedAt?: string;
}

export interface EmergingSkillItem {
  skillId: string;
  subjectId: SubjectId;
  confidence: number;
}

export interface NeedsMoreWorkSkillItem {
  skillId: string;
  subjectId: SubjectId;
  failureCount: number;
}

export interface WeakestDimensionItem {
  dimension: string;
  severity: string;
}

export interface RoadmapLimitations {
  ar: string;
  fr: string;
}

export interface RoadmapCurrentFocus {
  subjectId: SubjectId;
  skillId: string;
  stage: LearningStage;
  title_ar: string;
  title_fr: string;
}

/**
 * Authoritative Pure Adaptive Roadmap State
 */
export interface AdaptiveRoadmapState {
  targetScore: number;
  educationLevel: EducationLevel;
  examType: ExamType;
  streamId: StreamId;
  specialtyId?: TechniqueMathSpecialty;
  roadmapConfidence: RoadmapConfidence;
  currentFocus: RoadmapCurrentFocus;
  nextMission: Mission | null;
  nextMissionRationale: MissionRationale | null;
  queuedMissions: QueuedMissionItem[];
  masteredSkills: MasteredSkillItem[];
  emergingSkills: EmergingSkillItem[];
  needsMoreWorkSkills: NeedsMoreWorkSkillItem[];
  unresolvedErrors: ErrorRecord[];
  recurringErrors: ErrorRecord[];
  weakestDimensions: WeakestDimensionItem[];
  subjectProgress: Record<SubjectId, SubjectProgressItem>;
  rationale: string;
  limitations: RoadmapLimitations;
  // Future extension points (extensible without breaking or active logic)
  energyState?: "good" | "normal" | "tired" | "stressed";
  futureReviewSchedule?: Array<{
    skillId: string;
    nextReviewAt?: string;
    reviewPriority?: string;
  }>;
  generatedAt: string;
}

/**
 * Pure Input to the Adaptive Roadmap Engine
 */
export interface AdaptiveRoadmapInput {
  onboardingProfile?: StrategicProfile | null;
  diagnosticResult?: DiagnosticAnalysisResult | null;
  missions?: Record<string, Mission> | Mission[];
  masteryEvidence?: Record<string, MasteryEvidence>;
  errors?: ErrorRecord[];
  energyState?: "good" | "normal" | "tired" | "stressed";
}

/**
 * Legacy Roadmap types maintained for backward compatibility
 */
export type RoadmapPhaseType =
  | "foundation"
  | "understanding"
  | "methodology"
  | "practice"
  | "weakness_repair"
  | "advanced_problems"
  | "simulation"
  | "exam_readiness";

export type MasteryLevel = "not_started" | "emerging" | "competent" | "mastered";

export interface RoadmapItem {
  id: string;
  subjectId: SubjectId;
  phase: RoadmapPhaseType;
  title_ar: string;
  title_fr: string;
  orderIndex: number;
  estimatedHours: number;
  masteryLevel: MasteryLevel;
  masteryPercentage: number;
  isBottleneckResolution: boolean;
  unlocked: boolean;
}

export interface StudentRoadmap {
  id: string;
  studentId: string;
  streamId: string;
  currentPhase: RoadmapPhaseType;
  items: RoadmapItem[];
  overallProgressPercentage: number;
  lastAdaptedAt: string;
}
