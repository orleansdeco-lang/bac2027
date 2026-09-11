/**
 * BAC Mastery - Onboarding & Strategic Profile Types
 */

import { EducationLevel, ExamType, StreamId, SubjectId, TechniqueMathSpecialty } from "./education";

export type OnboardingStep =
  | "welcome"
  | "education_level"
  | "stream"
  | "target_score"
  | "level_estimation"
  | "available_time"
  | "future_objective"
  | "obstacles"
  | "study_state"
  | "summary";

export type SelfRatedLevel = 1 | 2 | 3 | 4 | 5;

export interface SubjectLevelEstimate {
  subjectId: SubjectId;
  selfRatedLevel: SelfRatedLevel;
}

export type AvailableTimeRange =
  | "less_than_5"
  | "5_to_8"
  | "8_to_12"
  | "12_to_18"
  | "18_to_25"
  | "25_plus"
  | "not_sure";

export type FutureObjectivePreset =
  | "specific_university_field"
  | "higher_school_ens_esi"
  | "specific_profession"
  | "open_more_doors"
  | "prove_to_myself"
  | "not_decided_yet";

export type ObstacleId =
  | "dont_know_where_to_start"
  | "start_and_stop"
  | "time_management"
  | "understand_but_fail_exercises"
  | "memorize_and_forget"
  | "waste_time"
  | "fear_of_bac"
  | "big_backlog"
  | "lack_of_confidence"
  | "other";

export type StudyEnergyState = "good" | "normal" | "tired" | "stressed";

export interface OnboardingDraft {
  currentStep: OnboardingStep;
  educationLevel: EducationLevel;
  examType: ExamType;
  streamId?: StreamId;
  techniqueMathSpecialty?: TechniqueMathSpecialty;
  targetScore?: number;
  subjectEstimates: Record<SubjectId, SelfRatedLevel>;
  availableTime?: AvailableTimeRange;
  futureObjectivePreset?: FutureObjectivePreset;
  futureObjectiveCustom?: string;
  obstacles: ObstacleId[];
  studyEnergy?: StudyEnergyState;
  completedAt?: string;
}

export interface StrategicProfile {
  id: string;
  educationLevel: EducationLevel;
  examType: ExamType;
  streamId: StreamId;
  techniqueMathSpecialty?: TechniqueMathSpecialty;
  targetScore: number;
  subjectEstimates: Record<SubjectId, SelfRatedLevel>;
  availableTime: AvailableTimeRange;
  futureObjective: {
    preset?: FutureObjectivePreset;
    customText?: string;
  };
  obstacles: ObstacleId[];
  studyEnergy: StudyEnergyState;
  createdAt: string;
}

export interface InitialSubjectGap {
  subjectId: SubjectId;
  coefficient: number;
  isCoreSubject: boolean;
  selfRatedLevel: SelfRatedLevel;
  estimatedBaselineGrade: number; // e.g. 7, 9, 12, 15, 18
  weightedGap: number;
}

export interface InitialGapResult {
  targetScore: number;
  estimatedBaselineScore: number;
  approximateGap: number;
  subjectGaps: InitialSubjectGap[];
}

export type BottleneckCategory =
  | "subject_academic"
  | "methodology_application"
  | "habit_consistency"
  | "time_management"
  | "active_recall_retention"
  | "backlog_overwhelm";

export interface StrategicBottleneck {
  category: BottleneckCategory;
  title_ar: string;
  title_fr: string;
  explanation_ar: string;
  explanation_fr: string;
  recommendedFirstMission_ar: string;
  recommendedFirstMission_fr: string;
  targetSubjectId?: SubjectId;
}

export interface StrategicBottleneckAnalysis {
  primaryBottleneck: StrategicBottleneck;
  secondaryBottlenecks: StrategicBottleneck[];
}
