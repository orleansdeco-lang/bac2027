/**
 * BAC Mastery V2 — Domain Adapters & Bridges (Task 1.1)
 * 
 * INVARIANT:
 * Isolates V2 Canonical Domain layer from legacy code.
 * Pure read-only translation; zero mutation of inputs; zero database side-effects.
 * Unknown values are NEVER silently swallowed; original values are preserved in metadata.
 */

import { CanonicalMasteryStatus } from "../learner";
import { CanonicalErrorType, CANONICAL_ERROR_TAXONOMY } from "../errors";
import { CanonicalMissionType, MissionDurationClass, classifyDurationMinutes } from "../mission";
import { PriorityReasonCode } from "../decision";
import { CanonicalEducationLevel } from "../curriculum";
import { SubjectId, StreamId, ExamType, TechniqueMathSpecialty } from "@/types/education";
import {
  AttemptId,
  EvidenceId,
  QuestionId,
  SkillId,
  StudentId,
  toAttemptId,
  toEvidenceId,
  toQuestionId,
  toSkillId,
  toStudentId,
} from "../ids";
import { CanonicalQuestion, QuestionFormat, CognitiveDemand } from "../assessment";
import {
  RawAttempt,
  CognitiveEvidence,
  PracticeTier,
  EvidenceSource,
  MultiDimensionalEvidenceVectors,
} from "../evidence";
import { DiagnosticQuestion } from "@/types/diagnostic";
import { PracticeResponse } from "@/types/mission";


import { StudentProfile, GoalSettings } from "@/types/student";
import { StrategicProfile, OnboardingDraft } from "@/types/onboarding";
import { DiagnosticResponse } from "@/types/diagnostic";
import { MasteryEvidence } from "@/types/mission";
import { SpacedReviewSchedule, StudentEvidenceRecord } from "@/domain/learning/types";
import {
  LearnerState as LegacyLearnerState,
  LearnerSkillState as LegacyLearnerSkillState,
} from "@/domain/contracts/learner.contract";
import { CognitiveEvidenceRecord } from "@/domain/contracts/evidence.contract";
import { LearnerSkillState, LearnerState } from "../learner";
import { RetentionSchedule } from "../retention";
import { ErrorEvent } from "../errors";

import {
  CanonicalStream,
  DomainUnit,
  Topic,
  PrerequisiteDeclaration,
  Concept,
  Misconception,
  PedagogicalResource,
  CanonicalSkill,
} from "../curriculum";
import { MinisterialRubric, RubricCriterion } from "../assessment";
import {
  DomainUnitId,
  TopicId,
  ConceptId,
  MisconceptionId,
  ResourceId,
  RubricId,
} from "../ids";
import { CurriculumTopic, CurriculumSkill as LegacyCurriculumSkill } from "@/types/content";
import {
  Curriculum as LegacyCurriculum,
  Subject as LegacySubject,
  LearningObjective as LegacyLearningObjective,
  Resource as LegacyResource,
  ContentRightsStatus,
} from "@/domain/content/types";
import { ALGERIAN_BAC_STREAMS, ALL_SUBJECTS } from "@/lib/constants/streams";


// =============================================================================
// 1. STANDARD ADAPTER RESULT & METADATA ENVELOPE (TASK 3)
// =============================================================================

export interface MappingMetadata {
  isKnown: boolean;
  preserved: string[];
  derived: string[];
  unavailable: string[];
  lossy: string[];
  originalLegacyValue?: unknown;
  notes?: string;
}

export interface AdapterResult<T> {
  value: T;
  mapping: MappingMetadata;
}

// =============================================================================
// 2. EDUCATION ADAPTERS
// =============================================================================

export function adaptLegacyEducationLevel(level: string): AdapterResult<CanonicalEducationLevel> {
  switch (level) {
    case "secondary":
    case "secondary_3as":
    case "3as":
      return {
        value: "secondary_3as",
        mapping: {
          isKnown: true,
          preserved: ["level_intent"],
          derived: ["canonical_secondary_3as"],
          unavailable: [],
          lossy: level === "secondary" ? ["coarse_level_normalized_to_terminal_year"] : [],
          originalLegacyValue: level,
        },
      };
    case "2as":
      return {
        value: "secondary_2as",
        mapping: {
          isKnown: true,
          preserved: ["grade_2as"],
          derived: ["canonical_secondary_2as"],
          unavailable: [],
          lossy: [],
          originalLegacyValue: level,
        },
      };
    case "1as":
      return {
        value: "secondary_1as",
        mapping: {
          isKnown: true,
          preserved: ["grade_1as"],
          derived: ["canonical_secondary_1as"],
          unavailable: [],
          lossy: [],
          originalLegacyValue: level,
        },
      };
    default:
      return {
        value: "secondary_3as",
        mapping: {
          isKnown: false,
          preserved: [],
          derived: ["default_to_secondary_3as"],
          unavailable: [],
          lossy: ["unrecognized_education_level"],
          originalLegacyValue: level,
          notes: `Unrecognized education level "${level}" mapped safely to "secondary_3as".`,
        },
      };
  }
}

export function adaptLegacyExamType(exam: string): AdapterResult<ExamType> {
  if (exam === "BAC" || exam === "BEM") {
    return {
      value: exam as ExamType,
      mapping: {
        isKnown: true,
        preserved: ["exam_type"],
        derived: [],
        unavailable: [],
        lossy: [],
        originalLegacyValue: exam,
      },
    };
  }
  const normalized = exam.toUpperCase();
  if (normalized === "BAC" || normalized === "BEM") {
    return {
      value: normalized as ExamType,
      mapping: {
        isKnown: true,
        preserved: ["exam_type_case_normalized"],
        derived: ["uppercase_normalization"],
        unavailable: [],
        lossy: [],
        originalLegacyValue: exam,
      },
    };
  }
  return {
    value: "BAC",
    mapping: {
      isKnown: false,
      preserved: [],
      derived: ["default_fallback_bac"],
      unavailable: [],
      lossy: ["unrecognized_exam_type"],
      originalLegacyValue: exam,
      notes: `Unrecognized exam type "${exam}" defaulted to "BAC".`,
    },
  };
}

// =============================================================================
// 3. MASTERY ADAPTER & GUARDRAIL (TASK 5)
// =============================================================================

export function adaptLegacyMasteryStatus(legacyStatus: string): AdapterResult<CanonicalMasteryStatus> {
  switch (legacyStatus) {
    case "not_yet":
    case "unassessed":
      return {
        value: "not_yet",
        mapping: {
          isKnown: true,
          preserved: ["not_yet_status"],
          derived: [],
          unavailable: ["underlying_evidence_vectors"],
          lossy: [],
          originalLegacyValue: legacyStatus,
        },
      };

    // TASK 5: Explicit Guardrail on needs_more_work
    case "needs_more_work":
    case "needs_further_work":
      return {
        value: "not_yet",
        mapping: {
          isKnown: true,
          preserved: ["status_intent"],
          derived: ["compatibility_normalization_to_not_yet"],
          unavailable: ["2_cycle_retest_failure_telemetry"],
          lossy: ["specific_needs_more_work_failure_history_not_in_raw_status"],
          originalLegacyValue: legacyStatus,
          notes: "LEGACY COMPATIBILITY MAPPING: 'needs_more_work' mapped to 'not_yet'. Does not alter authoritative V2 mastery semantics.",
        },
      };

    case "emerging":
    case "in_progress":
    case "partially_mastered":
      return {
        value: "emerging",
        mapping: {
          isKnown: true,
          preserved: ["emerging_status"],
          derived: ["alias_normalization"],
          unavailable: ["underlying_evidence_vectors"],
          lossy: legacyStatus !== "emerging" ? ["legacy_status_alias_normalized"] : [],
          originalLegacyValue: legacyStatus,
        },
      };

    case "demonstrated":
    case "mastered":
    case "completed":
      return {
        value: "demonstrated",
        mapping: {
          isKnown: true,
          preserved: ["demonstrated_status"],
          derived: ["alias_normalization"],
          unavailable: ["twin_retest_evidence_record"],
          lossy: legacyStatus !== "demonstrated" ? ["legacy_mastered_alias_normalized"] : [],
          originalLegacyValue: legacyStatus,
        },
      };

    case "review_due":
    case "overdue":
    case "retention_due":
      return {
        value: "review_due",
        mapping: {
          isKnown: true,
          preserved: ["review_due_status"],
          derived: ["alias_normalization"],
          unavailable: ["elapsed_retention_days"],
          lossy: legacyStatus !== "review_due" ? ["legacy_overdue_alias_normalized"] : [],
          originalLegacyValue: legacyStatus,
        },
      };

    default:
      return {
        value: "not_yet",
        mapping: {
          isKnown: false,
          preserved: [],
          derived: ["safe_default_not_yet"],
          unavailable: ["unknown_status_semantics"],
          lossy: ["unrecognized_legacy_mastery_string"],
          originalLegacyValue: legacyStatus,
          notes: `Unrecognized mastery string "${legacyStatus}" mapped safely to "not_yet".`,
        },
      };
  }
}

/**
 * Disambiguation Guard: Rejects numeric values from ever becoming authoritative mastery.
 */
export function assertNumericNotMastery(val: unknown): void {
  if (typeof val === "number") {
    throw new Error(
      `[DomainV2:MasteryAdapter] Numeric value (${val}) rejected. Continuous numbers are secondary telemetry signals and MUST NOT be adapted as authoritative mastery states.`
    );
  }
}

// =============================================================================
// 4. ERROR TAXONOMY ADAPTER & UNKNOWN VALUE PRESERVATION (TASK 4)
// =============================================================================

export function adaptLegacyErrorCode(legacyCode: string): AdapterResult<CanonicalErrorType> {
  // Check exact canonical matches
  if ((CANONICAL_ERROR_TAXONOMY as readonly string[]).includes(legacyCode)) {
    return {
      value: legacyCode as CanonicalErrorType,
      mapping: {
        isKnown: true,
        preserved: ["exact_canonical_error_type"],
        derived: [],
        unavailable: [],
        lossy: [],
        originalLegacyValue: legacyCode,
      },
    };
  }

  // Known legacy mappings
  switch (legacyCode) {
    case "did_not_understand":
    case "concept_confusion":
      return {
        value: "misunderstood_concept",
        mapping: {
          isKnown: true,
          preserved: ["conceptual_error_intent"],
          derived: ["mapped_from_legacy_alias"],
          unavailable: [],
          lossy: ["legacy_code_normalized"],
          originalLegacyValue: legacyCode,
        },
      };

    case "method_unknown":
    case "methodology_flaw":
    case "keyword_missing":
      return {
        value: "methodology_error",
        mapping: {
          isKnown: true,
          preserved: ["methodological_error_intent"],
          derived: ["mapped_from_legacy_alias"],
          unavailable: [],
          lossy: ["subtle_keyword_vs_flow_distinction_merged"],
          originalLegacyValue: legacyCode,
        },
      };

    case "calculation_slip":
      return {
        value: "calculation_error",
        mapping: {
          isKnown: true,
          preserved: ["calculation_error_intent"],
          derived: ["mapped_from_legacy_alias"],
          unavailable: [],
          lossy: [],
          originalLegacyValue: legacyCode,
        },
      };

    case "reading_comprehension":
      return {
        value: "misread_question",
        mapping: {
          isKnown: true,
          preserved: ["reading_error_intent"],
          derived: ["mapped_from_legacy_alias"],
          unavailable: [],
          lossy: [],
          originalLegacyValue: legacyCode,
        },
      };

    case "time_pressure":
      return {
        value: "time_management",
        mapping: {
          isKnown: true,
          preserved: ["time_error_intent"],
          derived: ["mapped_from_legacy_alias"],
          unavailable: [],
          lossy: [],
          originalLegacyValue: legacyCode,
        },
      };

    // TASK 4: Unknown values must NEVER disappear silently.
    default:
      return {
        value: "unknown",
        mapping: {
          isKnown: false,
          preserved: [],
          derived: ["fallback_to_canonical_unknown"],
          unavailable: [],
          lossy: ["unrecognized_legacy_code"],
          originalLegacyValue: legacyCode,
          notes: `Unrecognized legacy error code "${legacyCode}" preserved in metadata and mapped to "unknown".`,
        },
      };
  }
}

// =============================================================================
// 5. MISSION & DURATION ADAPTER
// =============================================================================

export function adaptLegacyMissionDuration(
  estimatedMinutes: number
): AdapterResult<{ durationClass: MissionDurationClass; estimatedMinutes: number }> {
  const safeMinutes = typeof estimatedMinutes === "number" && !isNaN(estimatedMinutes) && estimatedMinutes > 0
    ? estimatedMinutes
    : 15; // default fallback if invalid

  const durationClass = classifyDurationMinutes(safeMinutes);

  return {
    value: {
      durationClass,
      estimatedMinutes: safeMinutes,
    },
    mapping: {
      isKnown: true,
      preserved: ["estimatedMinutes"], // continuous numeric minutes preserved!
      derived: ["durationClass"],      // discrete duration class derived
      unavailable: [],
      lossy: [],
      originalLegacyValue: estimatedMinutes,
    },
  };
}

export function adaptLegacyMissionType(legacyType: string): AdapterResult<CanonicalMissionType> {
  switch (legacyType) {
    case "understand":
    case "new_learning":
      return {
        value: "new_concept",
        mapping: {
          isKnown: true,
          preserved: ["concept_learning_intent"],
          derived: ["mapped_to_new_concept"],
          unavailable: [],
          lossy: [],
          originalLegacyValue: legacyType,
        },
      };

    case "repair":
    case "continuation_repair":
      return {
        value: "repair",
        mapping: {
          isKnown: true,
          preserved: ["repair_intent"],
          derived: ["mapped_to_repair"],
          unavailable: [],
          lossy: [],
          originalLegacyValue: legacyType,
        },
      };

    case "practice":
    case "mini_test":
    case "retest":
    case "continuation_retest":
      return {
        value: "mastery_verification",
        mapping: {
          isKnown: true,
          preserved: ["verification_intent"],
          derived: ["mapped_to_mastery_verification"],
          unavailable: [],
          lossy: ["practice_vs_retest_distinction_handled_at_activity_level"],
          originalLegacyValue: legacyType,
        },
      };

    case "error_review":
    case "spaced_review":
      return {
        value: "review",
        mapping: {
          isKnown: true,
          preserved: ["review_intent"],
          derived: ["mapped_to_review"],
          unavailable: [],
          lossy: [],
          originalLegacyValue: legacyType,
        },
      };

    case "exam_transfer":
    case "bac_simulation":
      return {
        value: "exam_transfer",
        mapping: {
          isKnown: true,
          preserved: ["exam_simulation_intent"],
          derived: ["mapped_to_exam_transfer"],
          unavailable: [],
          lossy: [],
          originalLegacyValue: legacyType,
        },
      };

    case "diagnostic":
    case "diagnostic_followup":
      return {
        value: "diagnostic_followup",
        mapping: {
          isKnown: true,
          preserved: ["diagnostic_followup_intent"],
          derived: ["mapped_to_diagnostic_followup"],
          unavailable: [],
          lossy: [],
          originalLegacyValue: legacyType,
        },
      };

    default:
      return {
        value: "review",
        mapping: {
          isKnown: false,
          preserved: [],
          derived: ["default_to_review"],
          unavailable: [],
          lossy: ["unrecognized_mission_type"],
          originalLegacyValue: legacyType,
          notes: `Unrecognized mission type "${legacyType}" mapped safely to "review".`,
        },
      };
  }
}

// =============================================================================
// 6. DIAGNOSTIC ADAPTER (NO L0–L5 FABRICATION)
// =============================================================================

export function adaptLegacyDiagnosticQuestion(
  legacyQ: DiagnosticQuestion
): AdapterResult<CanonicalQuestion> {
  const format: QuestionFormat = legacyQ.questionType === "error_identification"
    ? "error_identification"
    : legacyQ.questionType === "methodology_sequence"
    ? "methodology_sequence"
    : legacyQ.questionType === "trap_avoidance"
    ? "trap_avoidance"
    : "mcq_single";

  const cognitiveDemand: CognitiveDemand = legacyQ.dimension === "knowledge"
    ? "recall"
    : legacyQ.dimension === "understanding"
    ? "comprehension"
    : legacyQ.dimension === "application"
    ? "application"
    : legacyQ.dimension === "methodology"
    ? "analysis_synthesis"
    : "comprehension";

  const canonicalQuestion: CanonicalQuestion = {
    id: toQuestionId(legacyQ.id),
    skillId: toSkillId(legacyQ.topicId), // legacy questions link to topicId as skill proxy
    subjectId: legacyQ.subjectId,
    streamId: legacyQ.streamId,
    format,
    cognitiveDemand,
    // INVARIANT: Do NOT fabricate L0–L5 layer when legacy question lacks it!
    diagnosticLayer: undefined,
    difficulty: 2,
    prompt_ar: legacyQ.prompt_ar,
    prompt_fr: legacyQ.prompt_fr,
    options: legacyQ.options.map((opt) => ({
      id: opt.id,
      text_ar: opt.text_ar,
      text_fr: opt.text_fr,
      isCorrect: opt.isCorrect,
      rationale_ar: opt.rationale_ar,
      rationale_fr: opt.rationale_fr,
    })),
    expectedTimeSeconds: legacyQ.expectedSeconds || 60,
  };

  return {
    value: canonicalQuestion,
    mapping: {
      isKnown: true,
      preserved: ["id", "prompt_ar", "prompt_fr", "options", "expectedTimeSeconds", "subjectId", "streamId"],
      derived: ["format", "cognitiveDemand"],
      unavailable: ["diagnosticLayer (L0-L5) not present in legacy model; left undefined"],
      lossy: [],
      originalLegacyValue: { id: legacyQ.id, topicId: legacyQ.topicId },
    },
  };
}

// =============================================================================
// 7. ATTEMPT VS EVIDENCE ADAPTER (STRICT SEPARATION)
// =============================================================================

export interface AdaptPracticeResponseParams {
  response: PracticeResponse;
  studentId: string;
  skillId: string;
  subjectId: SubjectId;
  streamId: StreamId;
  missionId?: string;
  expectedTimeSeconds?: number;
  practiceTier?: PracticeTier;
}

/**
 * Pure adapter creating RawAttempt from legacy PracticeResponse.
 * Strictly separates raw telemetry from pedagogical evidence.
 */
export function adaptPracticeResponseToRawAttempt(
  params: AdaptPracticeResponseParams
): RawAttempt {
  const { response, studentId, skillId, subjectId, streamId, missionId, expectedTimeSeconds = 60, practiceTier = "independent" } = params;

  return {
    id: toAttemptId(`att_${response.questionId}_${Date.now()}`),
    studentId: toStudentId(studentId),
    questionId: toQuestionId(response.questionId),
    skillId: toSkillId(skillId),
    subjectId,
    streamId,
    missionId: missionId ? (missionId as any) : undefined,
    selectedAnswer: response.selectedAnswer,
    isCorrect: response.isCorrect,
    confidenceRating: response.confidence,
    timeSpentSeconds: response.responseTimeSeconds || expectedTimeSeconds,
    expectedTimeSeconds,
    hintsUsedCount: 0, // Legacy practice responses did not record hint clicks
    practiceTier,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Pure adapter deriving CognitiveEvidence from an authenticated RawAttempt.
 * Preserves all 6 evidence dimensions without scalar formula reduction.
 */
export function deriveCognitiveEvidenceFromAttempt(
  attempt: RawAttempt,
  options?: { source?: EvidenceSource; observedErrorType?: CanonicalErrorType }
): CognitiveEvidence {
  const speedRatio = attempt.timeSpentSeconds / (attempt.expectedTimeSeconds || 1);

  // Derive confidence alignment without scalar collapse
  const confidenceAlignment = attempt.isCorrect
    ? attempt.confidenceRating >= 3
      ? "well_calibrated"
      : "underconfident"
    : attempt.confidenceRating >= 4
    ? "overconfident"
    : "well_calibrated";

  const vectors: MultiDimensionalEvidenceVectors = {
    correctness: attempt.isCorrect,
    confidence: attempt.confidenceRating,
    responseSpeedRatio: speedRatio,
    hintsUsedCount: attempt.hintsUsedCount,
    practiceTier: attempt.practiceTier,
    confidenceAlignment,
    evidenceStrength: attempt.practiceTier === "bac_exam_level" || attempt.practiceTier === "independent"
      ? "strong"
      : "moderate",
  };

  return {
    id: toEvidenceId(`ev_${attempt.id}`),
    attemptId: attempt.id,
    skillId: attempt.skillId,
    subjectId: attempt.subjectId,
    source: options?.source || "practice",
    isDemonstratedSuccess: attempt.isCorrect && attempt.hintsUsedCount === 0 && (attempt.practiceTier === "independent" || attempt.practiceTier === "transfer"),
    vectors,
    observedErrorType: options?.observedErrorType,
    isRecurringLapse: false,
    derivedAt: new Date().toISOString(),
  };
}

// =============================================================================
// 8. BACKWARD COMPATIBLE SHIMS (PRESERVED FROM TASK 1.0)
// =============================================================================

export function mapLegacyMasteryStatus(legacyStatus: string): CanonicalMasteryStatus {
  return adaptLegacyMasteryStatus(legacyStatus).value;
}

export function mapLegacyErrorCode(legacyCode: string): CanonicalErrorType {
  return adaptLegacyErrorCode(legacyCode).value;
}

export function mapLegacyMissionType(legacyType: string): CanonicalMissionType {
  return adaptLegacyMissionType(legacyType).value;
}

export function mapLegacyDurationToClass(minutes: number): MissionDurationClass {
  return adaptLegacyMissionDuration(minutes).value.durationClass;
}

export function mapLegacyEducationLevel(level: string): CanonicalEducationLevel {
  return adaptLegacyEducationLevel(level).value;
}

export function mapLegacyReasonCode(legacyCode: string): PriorityReasonCode {
  switch (legacyCode) {
    case "continuation_retest":
      return "continuation_retest";
    case "continuation_repair":
      return "continuation_repair";
    case "spaced_retrieval_review":
      return "critical_retention_overdue";
    case "delayed_needs_more_work":
    case "delayed_recovery":
      return "unmastered_prerequisite";
    case "recurring_error_cause":
      return "recurring_error_cause";
    case "diagnostic_bottleneck":
      return "diagnostic_bottleneck";
    case "next_subject_skill":
    case "weakest_supported_dimension":
    case "emerging_verification":
      return "active_subject_progression";
    case "next_core_subject":
      return "core_subject_balancing";
    default:
      return "active_subject_progression";
  }
}


// =============================================================================
// 9. LEARNER IDENTITY ADAPTER (TASK 1.2)
// =============================================================================

export interface LearnerIdentityReadModel {
  studentId: StudentId;
  isAnonymous: boolean;
  legacyIdentityType: "supabase_auth" | "profile_id" | "strategic_profile" | "anonymous";
}

export function adaptLegacyLearnerIdentity(
  input: string | StudentProfile | StrategicProfile
): AdapterResult<LearnerIdentityReadModel> {
  const rawId = typeof input === "string" ? input : input.id;
  const isAnonymous = !rawId || rawId.startsWith("anon_") || rawId === "mock-user-1";
  const studentId = toStudentId(rawId || `anon_${Date.now()}`);

  const legacyIdentityType = typeof input === "string"
    ? isAnonymous ? "anonymous" : "supabase_auth"
    : "wilayaCode" in input
    ? "profile_id"
    : "strategic_profile";

  return {
    value: {
      studentId,
      isAnonymous,
      legacyIdentityType,
    },
    mapping: {
      isKnown: !isAnonymous,
      preserved: ["studentId"],
      derived: ["isAnonymous", "legacyIdentityType"],
      unavailable: ["national_student_matricule"],
      lossy: [],
      originalLegacyValue: typeof input === "string" ? input : { id: input.id },
    },
  };
}

// =============================================================================
// 10. LEARNER CONTEXT ADAPTER (TASK 1.2)
// =============================================================================

export interface LearnerContextReadModel {
  streamId: StreamId;
  examType: ExamType;
  educationLevel: CanonicalEducationLevel;
  techniqueMathSpecialty?: TechniqueMathSpecialty;
  targetScore?: number;
  wilayaCode?: string;
}

export function adaptLegacyLearnerContext(
  input: StudentProfile | StrategicProfile | OnboardingDraft
): AdapterResult<LearnerContextReadModel> {
  const streamResult = input.streamId ? input.streamId : "sciences_exp";
  const examResult = adaptLegacyExamType(input.examType || "BAC");
  const rawEducationLevel = "educationLevel" in input ? (input as any).educationLevel : undefined;
  const educationResult = adaptLegacyEducationLevel(rawEducationLevel || "secondary");

  return {
    value: {
      streamId: streamResult as StreamId,
      examType: examResult.value,
      educationLevel: educationResult.value,
      techniqueMathSpecialty: input.techniqueMathSpecialty,
      targetScore: input.targetScore,
      wilayaCode: "wilayaCode" in input ? (input as any).wilayaCode : undefined,
    },
    mapping: {
      isKnown: Boolean(input.streamId),
      preserved: ["streamId", "techniqueMathSpecialty", "targetScore"].filter((k) => (input as any)[k] !== undefined),
      derived: ["canonical_education_level", "canonical_exam_type"],
      unavailable: ["curriculumVersionId"],
      lossy: rawEducationLevel === "secondary" ? ["coarse_level_normalized_to_terminal_year"] : [],
      originalLegacyValue: {
        streamId: input.streamId,
        educationLevel: rawEducationLevel,
        examType: input.examType,
      },
    },
  };
}

// =============================================================================
// 11. GOAL ADAPTER (TASK 1.2 - NO NEW PRIORITY OR FORMULAS)
// =============================================================================

export interface SubjectGoalTargetReadModel {
  subjectId: SubjectId;
  targetScore: number;
  currentEstimatedScore?: number;
}

export interface GoalReadModel {
  studentId: StudentId;
  targetOverallScore: number;
  currentEstimatedOverall?: number;
  weeklyStudyHours?: number;
  desiredSpecialty?: string;
  subjectTargets: SubjectGoalTargetReadModel[];
  perceivedDifficulties: SubjectId[];
}

export function adaptLegacyGoal(
  input: GoalSettings | StrategicProfile
): AdapterResult<GoalReadModel> {
  if ("targetOverallScore" in input) {
    // GoalSettings input
    return {
      value: {
        studentId: toStudentId(input.studentId),
        targetOverallScore: input.targetOverallScore,
        currentEstimatedOverall: input.currentEstimatedOverall,
        weeklyStudyHours: input.weeklyStudyHours,
        desiredSpecialty: input.desiredSpecialty,
        subjectTargets: input.subjectTargets.map((st) => ({
          subjectId: st.subjectId,
          targetScore: st.targetScore,
          currentEstimatedScore: st.currentEstimatedScore,
        })),
        perceivedDifficulties: input.perceivedDifficulties || [],
      },
      mapping: {
        isKnown: true,
        preserved: ["targetOverallScore", "currentEstimatedOverall", "weeklyStudyHours", "desiredSpecialty", "subjectTargets", "perceivedDifficulties"],
        derived: ["studentId"],
        unavailable: ["pacing_curve", "target_exam_session_id"],
        lossy: [],
        originalLegacyValue: { studentId: input.studentId, targetOverallScore: input.targetOverallScore },
        notes: "Exposes existing goal settings without introducing priority calculations or ranking logic.",
      },
    };
  }

  // StrategicProfile input
  const subjectTargets: SubjectGoalTargetReadModel[] = input.subjectEstimates
    ? Object.entries(input.subjectEstimates).map(([sId, level]) => ({
        subjectId: sId as SubjectId,
        targetScore: input.targetScore,
        currentEstimatedScore: (level as number) * 4, // 1-5 mapped to 4-20 provisional estimate
      }))
    : [];

  return {
    value: {
      studentId: toStudentId(input.id),
      targetOverallScore: input.targetScore,
      desiredSpecialty: input.targetSpecialty || input.futureObjective?.customText,
      subjectTargets,
      perceivedDifficulties: [],
    },
    mapping: {
      isKnown: true,
      preserved: ["targetOverallScore", "desiredSpecialty"],
      derived: ["subjectTargets_from_self_estimates"],
      unavailable: ["weeklyStudyHours", "pacing_curve"],
      lossy: ["self_estimates_coarsely_scaled_to_20"],
      originalLegacyValue: { id: input.id, targetScore: input.targetScore },
      notes: "Exposes strategic profile goals without introducing priority calculations.",
    },
  };
}

// =============================================================================
// 12. SKILL STATE ADAPTER & NUMERIC MASTERY SAFETY (TASK 1.2 - STEP 7)
// =============================================================================

export interface AdaptLegacySkillStateInput {
  skillId: string;
  subjectId: SubjectId;
  masteryStatus?: string;
  score?: number; // legacy continuous float
  consecutiveSuccesses?: number;
  totalAttempts?: number;
  lastTestedAt?: string;
  lastSuccessAt?: string;
  lastLapseAt?: string;
  nextReviewDueAt?: string;
  isOverdueForReview?: boolean;
}

export function adaptLegacySkillState(
  input: AdaptLegacySkillStateInput | MasteryEvidence
): AdapterResult<LearnerSkillState> {
  const isMasteryEvidence = "evidenceType" in input;
  const skillId = toSkillId(input.skillId);
  const subjectId = input.subjectId;

  // STEP 7: Check if input has ONLY numeric mastery and no valid discrete string status
  if (!isMasteryEvidence && typeof (input as any).score === "number" && !(input as any).masteryStatus) {
    const rawScore = (input as any).score as number;
    return {
      value: {
        skillId,
        subjectId,
        masteryStatus: "not_yet", // Safe conservative fallback
        consecutiveSuccesses: (input as AdaptLegacySkillStateInput).consecutiveSuccesses || 0,
        totalAttempts: (input as AdaptLegacySkillStateInput).totalAttempts || 0,
        lastTestedAt: (input as AdaptLegacySkillStateInput).lastTestedAt,
        lastSuccessAt: (input as AdaptLegacySkillStateInput).lastSuccessAt,
        lastLapseAt: (input as AdaptLegacySkillStateInput).lastLapseAt,
        nextReviewDueAt: (input as AdaptLegacySkillStateInput).nextReviewDueAt,
        isOverdueForReview: Boolean((input as AdaptLegacySkillStateInput).isOverdueForReview),
      },
      mapping: {
        isKnown: false,
        preserved: ["skillId", "subjectId"],
        derived: ["default_fallback_not_yet"],
        unavailable: ["authoritative_discrete_mastery_state"],
        lossy: ["numeric_score_cannot_define_mastery"],
        originalLegacyValue: { numericScore: rawScore },
        notes: `CRITICAL RULE ENFORCED: Numeric score (${rawScore}) preserved in metadata. Continuous numbers are secondary telemetry and cannot define authoritative mastery without discrete evidence.`,
      },
    };
  }

  // If discrete mastery status is present
  const rawStatus = isMasteryEvidence
    ? (input as MasteryEvidence).masteryStatus || (input as MasteryEvidence).status || "not_yet"
    : (input as AdaptLegacySkillStateInput).masteryStatus || "not_yet";

  const adaptedStatus = adaptLegacyMasteryStatus(rawStatus);

  const consecutiveSuccesses = isMasteryEvidence
    ? (input as MasteryEvidence).successfulRetests || 0
    : (input as AdaptLegacySkillStateInput).consecutiveSuccesses || 0;

  const totalAttempts = isMasteryEvidence
    ? ((input as MasteryEvidence).practiceAttempts || 0) + ((input as MasteryEvidence).retestAttempts || 0)
    : (input as AdaptLegacySkillStateInput).totalAttempts || 0;

  return {
    value: {
      skillId,
      subjectId,
      masteryStatus: adaptedStatus.value,
      consecutiveSuccesses,
      totalAttempts,
      lastTestedAt: isMasteryEvidence ? (input as MasteryEvidence).achievedAt : (input as AdaptLegacySkillStateInput).lastTestedAt,
      lastSuccessAt: isMasteryEvidence ? (input as MasteryEvidence).achievedAt : (input as AdaptLegacySkillStateInput).lastSuccessAt,
      lastLapseAt: (input as any).lastLapseAt,
      nextReviewDueAt: (input as any).nextReviewDueAt,
      isOverdueForReview: Boolean((input as any).isOverdueForReview),
    },
    mapping: {
      isKnown: adaptedStatus.mapping.isKnown,
      preserved: ["skillId", "subjectId", "consecutiveSuccesses", "totalAttempts"],
      derived: ["canonical_mastery_status"],
      unavailable: adaptedStatus.mapping.unavailable,
      lossy: adaptedStatus.mapping.lossy,
      originalLegacyValue: { rawStatus, isMasteryEvidence },
      notes: adaptedStatus.mapping.notes,
    },
  };
}

// =============================================================================
// 13. ATTEMPT ADAPTER (TASK 1.2 - STEP 6: RAW TELEMETRY ONLY)
// =============================================================================

export function adaptLegacyAttempt(
  input: PracticeResponse | DiagnosticResponse,
  context: {
    studentId: string;
    skillId: string;
    subjectId: SubjectId;
    streamId: StreamId;
    expectedTimeSeconds?: number;
    practiceTier?: PracticeTier;
    missionId?: string;
  }
): AdapterResult<RawAttempt> {
  const isDiag = "selectedOptionId" in input;
  const questionId = input.questionId;
  const selectedAnswer = isDiag ? (input as DiagnosticResponse).selectedOptionId : (input as PracticeResponse).selectedAnswer;
  const confidenceRating = isDiag ? (input as DiagnosticResponse).confidenceRating : (input as PracticeResponse).confidence;
  const timeSpentSeconds = isDiag ? (input as DiagnosticResponse).timeSpentSeconds : (input as PracticeResponse).responseTimeSeconds || 60;
  const isCorrect = input.isCorrect;

  const rawAttempt: RawAttempt = {
    id: toAttemptId(`att_${questionId}_${Date.now()}`),
    studentId: toStudentId(context.studentId),
    questionId: toQuestionId(questionId),
    skillId: toSkillId(context.skillId),
    subjectId: context.subjectId,
    streamId: context.streamId,
    missionId: context.missionId ? (context.missionId as any) : undefined,
    selectedAnswer,
    isCorrect,
    confidenceRating,
    timeSpentSeconds,
    expectedTimeSeconds: context.expectedTimeSeconds || 60,
    hintsUsedCount: 0,
    practiceTier: context.practiceTier || "independent",
    timestamp: new Date().toISOString(),
  };

  return {
    value: rawAttempt,
    mapping: {
      isKnown: true,
      preserved: ["questionId", "selectedAnswer", "isCorrect", "confidenceRating", "timeSpentSeconds"],
      derived: ["attemptId", "timestamp"],
      unavailable: ["exact_hint_click_timestamps"],
      lossy: [],
      originalLegacyValue: { questionId, isCorrect, confidence: confidenceRating },
      notes: "Captures raw interaction telemetry only. Strictly decoupled from evidence vectors.",
    },
  };
}

// =============================================================================
// 14. EVIDENCE ADAPTER (TASK 1.2 - STEP 6: MULTI-DIMENSIONAL VECTORS)
// =============================================================================

export function adaptLegacyEvidence(
  input: CognitiveEvidence | CognitiveEvidenceRecord | StudentEvidenceRecord | MasteryEvidence,
  context?: { attemptId?: AttemptId; streamId?: StreamId }
): AdapterResult<CognitiveEvidence> {
  // If already a V2 CognitiveEvidence, return as-is
  if ("vectors" in input && typeof (input as any).vectors === "object") {
    return {
      value: input as CognitiveEvidence,
      mapping: {
        isKnown: true,
        preserved: ["vectors", "skillId", "subjectId", "isDemonstratedSuccess"],
        derived: [],
        unavailable: [],
        lossy: [],
        originalLegacyValue: (input as any).id,
      },
    };
  }

  const isStudentEvidence = "tier" in input;
  const isMasteryEvidence = "evidenceType" in input;

  const skillId = toSkillId((input as any).skillId);
  const subjectId = (input as any).subjectId as SubjectId;
  const isDemonstratedSuccess = isMasteryEvidence
    ? (input as MasteryEvidence).successfulRetests > 0 || (input as MasteryEvidence).masteryStatus === "demonstrated"
    : isStudentEvidence
    ? (input as StudentEvidenceRecord).score >= 0.85
    : (input as any).isDemonstratedSuccess ?? false;

  const confidenceRating = isStudentEvidence
    ? (input as StudentEvidenceRecord).confidence
    : isMasteryEvidence
    ? ((input as MasteryEvidence).confidenceSignals?.[0] as any) || 3
    : 3;

  const speedRatio = isStudentEvidence && (input as StudentEvidenceRecord).responseTimeSeconds && (input as StudentEvidenceRecord).expectedTimeSeconds
    ? (input as StudentEvidenceRecord).responseTimeSeconds! / (input as StudentEvidenceRecord).expectedTimeSeconds!
    : 1.0;

  const confidenceAlignment = isDemonstratedSuccess
    ? confidenceRating >= 3 ? "well_calibrated" : "underconfident"
    : confidenceRating >= 4 ? "overconfident" : "well_calibrated";

  const vectors: MultiDimensionalEvidenceVectors = {
    correctness: isDemonstratedSuccess,
    confidence: confidenceRating,
    responseSpeedRatio: speedRatio,
    hintsUsedCount: 0,
    practiceTier: isStudentEvidence ? ((input as any).tier as any) || "independent" : "independent",
    confidenceAlignment,
    evidenceStrength: isDemonstratedSuccess ? "strong" : "moderate",
  };

  const cognitiveEvidence: CognitiveEvidence = {
    id: toEvidenceId(`ev_${(input as any).id || (input as any).skillId}_${Date.now()}`),
    attemptId: context?.attemptId || toAttemptId(`att_legacy_${(input as any).skillId}`),
    skillId,
    subjectId,
    source: isMasteryEvidence ? "retest" : isStudentEvidence ? ((input as any).source as any) || "practice" : "practice",
    isDemonstratedSuccess,
    vectors,
    isRecurringLapse: Boolean((input as any).isRecurringError || (input as any).isRecurringLapse),
    derivedAt: (input as any).timestamp || (input as any).derivedAt || new Date().toISOString(),
  };

  return {
    value: cognitiveEvidence,
    mapping: {
      isKnown: true,
      preserved: ["skillId", "subjectId", "isDemonstratedSuccess"],
      derived: ["multiDimensionalVectors", "confidenceAlignment"],
      unavailable: ["raw_student_answer", "rubric_breakdown"],
      lossy: isStudentEvidence ? ["scalar_score_normalized_to_success_boolean"] : [],
      originalLegacyValue: { skillId, isStudentEvidence, isMasteryEvidence },
      notes: "Preserves multi-dimensional evidence vectors without scalar formula collapse.",
    },
  };
}

// =============================================================================
// 15. RETENTION STATE ADAPTER (TASK 1.2 - STEP 8)
// =============================================================================

export function adaptLegacyRetentionState(
  input: SpacedReviewSchedule
): AdapterResult<RetentionSchedule> {
  const scheduleId = `ret_${input.skillId}` as any;

  const retentionSchedule: RetentionSchedule = {
    id: scheduleId,
    skillId: toSkillId(input.skillId),
    subjectId: input.subjectId,
    intervalDays: input.intervalDays,
    lastTestedAt: input.lastTestedAt,
    nextReviewDueAt: input.nextReviewDueAt,
    urgency: input.urgency,
    consecutiveSuccesses: input.consecutiveSuccesses,
    lapseCount: input.lapseCount,
    decayRate: input.decayRate,
  };

  return {
    value: retentionSchedule,
    mapping: {
      isKnown: true,
      preserved: [
        "intervalDays",
        "lastTestedAt",
        "nextReviewDueAt",
        "urgency",
        "consecutiveSuccesses",
        "lapseCount",
        "decayRate",
      ],
      derived: ["scheduleId"],
      unavailable: ["scheduler_algorithm_implementation"],
      lossy: [],
      originalLegacyValue: { skillId: input.skillId, intervalDays: input.intervalDays },
      notes: "Exposes legacy schedule under 6 frozen retention dimensions. Zero scheduling algorithm imposed. SM-2 is not declared authoritative.",
    },
  };
}

// =============================================================================
// 16. FULL LEARNER STATE READ ADAPTER (TASK 1.2 - STEP 5)
// =============================================================================

export function adaptLegacyLearnerState(
  input: LegacyLearnerState | Record<string, any>,
  context?: { source?: string }
): AdapterResult<LearnerState> {
  const isClientSource = context?.source === "react_component" || context?.source === "local_storage_direct" || context?.source === "ui_client";

  const rawUserId = "userId" in input ? input.userId : (input as any).studentId;
  const studentId = toStudentId(rawUserId || "anon_learner");
  const streamId = (input.streamId || "sciences_exp") as StreamId;

  const skills: Record<string, LearnerSkillState> = {};
  if (input.skills && typeof input.skills === "object") {
    for (const [sId, sState] of Object.entries(input.skills)) {
      skills[sId] = adaptLegacySkillState(sState as any).value;
    }
  }

  const activeErrors: ErrorEvent[] = [];
  if (Array.isArray(input.activeErrors)) {
    for (const err of input.activeErrors) {
      activeErrors.push({
        id: `err_${err.id || err.questionId}` as any,
        evidenceId: `ev_${err.questionId}` as any,
        skillId: toSkillId(err.skillId),
        subjectId: err.subjectId,
        questionId: toQuestionId(err.questionId),
        errorType: adaptLegacyErrorCode(err.suspectedErrorType || err.errorType || "unknown").value,
        isRecurring: Boolean(err.isRecurring),
        cycleCount: err.attemptCount || 1,
        status: err.repairStatus || "identified",
        createdAt: err.createdAt || new Date().toISOString(),
        updatedAt: err.updatedAt || new Date().toISOString(),
      });
    }
  }

  const learnerState: LearnerState = {
    studentId,
    streamId,
    techniqueMathSpecialty: input.techniqueMathSpecialty,
    targetScore: input.targetScore || 16,
    baselineScore: input.baselineScore,
    skills,
    activeErrors,
    masteredSkillIds: (input.masteredSkillIds || []).map(toSkillId),
    emergingSkillIds: (input.emergingSkillIds || []).map(toSkillId),
    needsMoreWorkSkillIds: (input.needsMoreWorkSkillIds || []).map(toSkillId),
    reviewDueSkillIds: (input.reviewDueSkillIds || []).map(toSkillId),
    lastActiveAt: input.lastActiveAt || new Date().toISOString(),
    calibrationIndex: input.calibrationIndex,
  };

  return {
    value: learnerState,
    mapping: {
      isKnown: true,
      preserved: ["studentId", "streamId", "targetScore", "skills", "activeErrors"],
      derived: ["canonical_skill_states", "canonical_active_errors"],
      unavailable: isClientSource ? ["server_verified_proof"] : [],
      lossy: [],
      originalLegacyValue: { studentId: input.userId, source: context?.source },
      notes: isClientSource
        ? "Derived from client store/cache; non-authoritative read snapshot."
        : "Authoritative learner state read snapshot.",
    },
  };
}


// =============================================================================
// 17. CURRICULUM ADAPTER (TASK 1.3 - STEP 1 & 19)
// =============================================================================

export function adaptLegacyCurriculum(
  legacy: (Partial<LegacyCurriculum> & { streamId?: StreamId; id?: string }) | Record<string, any>
): AdapterResult<CanonicalStream> {
  const streamId = (legacy.streamId || legacy.id) as StreamId;
  const examType = (legacy.examType || "BAC") as ExamType;
  const streamMeta = ALGERIAN_BAC_STREAMS[streamId] || {
    id: streamId,
    examType,
    code: streamId ? streamId.toUpperCase() : "UNKNOWN",
    name_ar: legacy.title_ar || streamId || "شعبة غير محددة",
    name_fr: legacy.title_fr || streamId || "Filière indéfinie",
    description_ar: legacy.description_ar || "",
    description_fr: legacy.description_fr || "",
    subjects: [],
  };

  const canonicalStream: CanonicalStream = {
    id: streamId,
    examType,
    code: streamMeta.code || streamId.toUpperCase(),
    name_ar: streamMeta.name_ar,
    name_fr: streamMeta.name_fr,
    description_ar: streamMeta.description_ar || "",
    description_fr: streamMeta.description_fr || "",
    subjects: Array.isArray(streamMeta.subjects)
      ? streamMeta.subjects.map((rule) => ({
          subjectId: rule.subjectId,
          coefficient: rule.coefficient,
          isCoreSubject: Boolean(rule.isCoreSubject),
          weeklyHours: (rule as any).weeklyHours,
        }))
      : [],
  };

  const isKnown = Boolean(ALGERIAN_BAC_STREAMS[streamId]);

  return {
    value: canonicalStream,
    mapping: {
      isKnown,
      preserved: ["streamId", "examType", "subjects"],
      derived: ["canonical_stream"],
      unavailable: ["cryptographic_curriculum_version_hash", "ministerial_circular_decree_ref"],
      lossy: isKnown ? [] : ["unrecognized_stream_identifier"],
      originalLegacyValue: { id: legacy.id, streamId: legacy.streamId, academicYear: legacy.academicYear },
      notes: "Curriculum stream structure projected deterministically without altering syllabus coefficients.",
    },
  };
}

// =============================================================================
// 18. SUBJECT ADAPTER (TASK 1.3 - STEP 2 & 19)
// =============================================================================

export function adaptLegacySubject(
  legacy: (Partial<LegacySubject> & { id: SubjectId }) | Record<string, any>
): AdapterResult<{ id: SubjectId; code: string; name_ar: string; name_fr: string; isScientific: boolean }> {
  const subjectId = legacy.id as SubjectId;
  const isKnown = Boolean(ALL_SUBJECTS[subjectId]);

  const defaultMeta = ALL_SUBJECTS[subjectId] || {
    id: subjectId,
    code: (legacy.code || subjectId || "UNK").toUpperCase(),
    name_ar: legacy.title_ar || (legacy as any).name_ar || subjectId || "مادة غير معروفة",
    name_fr: legacy.title_fr || (legacy as any).name_fr || subjectId || "Matière inconnue",
    isScientific: false,
  };

  return {
    value: {
      id: subjectId,
      code: legacy.code || defaultMeta.code,
      name_ar: legacy.title_ar || (legacy as any).name_ar || defaultMeta.name_ar,
      name_fr: legacy.title_fr || (legacy as any).name_fr || defaultMeta.name_fr,
      isScientific: typeof (legacy as any).isScientific === "boolean" ? (legacy as any).isScientific : defaultMeta.isScientific,
    },
    mapping: {
      isKnown,
      preserved: ["id", "code", "name_ar", "name_fr", "isScientific"],
      derived: [],
      unavailable: [],
      lossy: isKnown ? [] : ["unrecognized_subject_identifier"],
      originalLegacyValue: legacy,
      notes: "Enforces Subject boundary: Subject != Topic != Skill.",
    },
  };
}

// =============================================================================
// 19. TOPIC ADAPTER (TASK 1.3 - STEP 3 & 19)
// =============================================================================

export function adaptLegacyTopic(
  legacy: CurriculumTopic | (Partial<CurriculumTopic> & { id: string; subjectId: SubjectId }),
  context?: { associatedSkillIds?: string[]; unitId?: string }
): AdapterResult<Topic> {
  const topicId = legacy.id as TopicId;
  const subjectId = legacy.subjectId;
  const hasExplicitUnit = Boolean(context?.unitId || (legacy as any).unitId);
  const unitId = (context?.unitId || (legacy as any).unitId || `unit_${subjectId}_default`) as DomainUnitId;
  const skillIds = (context?.associatedSkillIds || []).map(toSkillId);

  const topic: Topic = {
    id: topicId,
    unitId,
    subjectId,
    title_ar: legacy.title_ar || legacy.id,
    title_fr: legacy.title_fr || legacy.id,
    skillIds,
  };

  return {
    value: topic,
    mapping: {
      isKnown: true,
      preserved: ["id", "subjectId", "title_ar", "title_fr"],
      derived: ["canonical_topic", ...(hasExplicitUnit ? [] : ["default_unit_id"])],
      unavailable: hasExplicitUnit ? [] : ["domain_unit_id"],
      lossy: [],
      originalLegacyValue: { id: legacy.id, order: legacy.order, isActive: legacy.isActive },
      notes: "Enforces Topic != Skill invariant. Topic represents an organizational curriculum module, not an assessable competence.",
    },
  };
}

// =============================================================================
// 20. SKILL ADAPTER (TASK 1.3 - STEP 4 & 19)
// =============================================================================

export function adaptLegacySkill(
  legacy: LegacyCurriculumSkill | (Partial<LegacyCurriculumSkill> & { id: string; subjectId: SubjectId; streamId?: StreamId })
): AdapterResult<CanonicalSkill> {
  const streamId = legacy.streamId || ("sciences_exp" as StreamId);
  const difficulty: 1 | 2 | 3 = (legacy.difficulty === 1 || legacy.difficulty === 2 || legacy.difficulty === 3)
    ? legacy.difficulty
    : 2;

  const canonical: CanonicalSkill = {
    id: legacy.id,
    topicId: legacy.topicId || `topic_${legacy.subjectId}_default`,
    subjectId: legacy.subjectId,
    streamId,
    title_ar: legacy.title_ar || legacy.id,
    title_fr: legacy.title_fr || legacy.id,
    description_ar: legacy.description_ar || "",
    description_fr: legacy.description_fr || "",
    prerequisites: legacy.prerequisites ? [...legacy.prerequisites] : [],
    dimensions: legacy.dimensions ? [...legacy.dimensions] : legacy.cognitiveDimensions ? [...legacy.cognitiveDimensions] : ["knowledge", "application"],
    cognitiveDimensions: legacy.cognitiveDimensions ? [...legacy.cognitiveDimensions] : legacy.dimensions ? [...legacy.dimensions] : ["knowledge", "application"],
    difficulty,
    order: legacy.order ?? 1,
    isActive: legacy.isActive ?? true,
    repairStrategy_ar: legacy.repairStrategy_ar || "",
    repairStrategy_fr: legacy.repairStrategy_fr || "",
    repairSteps_ar: legacy.repairSteps_ar ? [...legacy.repairSteps_ar] : [],
    repairSteps_fr: legacy.repairSteps_fr ? [...legacy.repairSteps_fr] : [],
  };

  return {
    value: canonical,
    mapping: {
      isKnown: true,
      preserved: [
        "id",
        "topicId",
        "subjectId",
        "streamId",
        "title_ar",
        "title_fr",
        "prerequisites",
        "difficulty",
        "repairStrategy_ar",
        "repairSteps_ar",
      ],
      derived: ["canonical_skill"],
      unavailable: legacy.topicId ? [] : ["explicit_topic_id"],
      lossy: [],
      originalLegacyValue: { id: legacy.id, difficulty: legacy.difficulty },
      notes: "Preserves integer difficulty (1|2|3) as problem complexity. INVARIANT: Difficulty is strictly decoupled from cognitive demand and practice tier.",
    },
  };
}

// =============================================================================
// 21. LEARNING OBJECTIVE ADAPTER (TASK 1.3 - STEP 5, 10 & 19)
// =============================================================================

export function adaptLegacyLearningObjective(
  legacy: LegacyLearningObjective | (Partial<LegacyLearningObjective> & { id: string; skillId: string }) | null | undefined
): AdapterResult<LegacyLearningObjective | null> {
  if (!legacy || !legacy.id) {
    return {
      value: null,
      mapping: {
        isKnown: false,
        preserved: [],
        derived: [],
        unavailable: ["learning_objective_construct"],
        lossy: [],
        notes: "Learning objective not authored in legacy item; marked unavailable rather than fabricated.",
      },
    };
  }

  const obj: LegacyLearningObjective = {
    id: legacy.id,
    skillId: legacy.skillId,
    code: legacy.code || legacy.id,
    description_ar: legacy.description_ar || "",
    description_fr: legacy.description_fr || "",
    bloomLevel: legacy.bloomLevel || "understand",
    order: legacy.order ?? 1,
    sourceId: legacy.sourceId || "legacy_unspecified",
    sourceType: legacy.sourceType || "other",
    rightsStatus: legacy.rightsStatus || "unknown",
    verificationStatus: legacy.verificationStatus || "unverified",
  };

  return {
    value: obj,
    mapping: {
      isKnown: true,
      preserved: ["id", "skillId", "code", "bloomLevel", "description_ar"],
      derived: ["canonical_objective"],
      unavailable: [],
      lossy: [],
      originalLegacyValue: legacy,
      notes: "Learning objective preserved without altering Bloom taxonomy level.",
    },
  };
}

// =============================================================================
// 22. CONCEPT ADAPTER (TASK 1.3 - STEP 6, 10 & 19)
// =============================================================================

export function adaptLegacyConcept(
  legacy: Concept | (Partial<Concept> & { id: string; subjectId: SubjectId }) | null | undefined
): AdapterResult<Concept | null> {
  if (!legacy || !legacy.id) {
    return {
      value: null,
      mapping: {
        isKnown: false,
        preserved: [],
        derived: [],
        unavailable: ["concept_construct"],
        lossy: [],
        notes: "Scientific concept not authored in legacy item; marked unavailable rather than fabricated.",
      },
    };
  }

  const concept: Concept = {
    id: legacy.id as ConceptId,
    subjectId: legacy.subjectId,
    title_ar: legacy.title_ar || legacy.id,
    title_fr: legacy.title_fr || legacy.id,
    summary_ar: legacy.summary_ar || "",
    summary_fr: legacy.summary_fr || "",
    relatedSkillIds: (legacy.relatedSkillIds || []).map(toSkillId),
  };

  return {
    value: concept,
    mapping: {
      isKnown: true,
      preserved: ["id", "subjectId", "title_ar", "title_fr", "summary_ar", "relatedSkillIds"],
      derived: ["canonical_concept"],
      unavailable: [],
      lossy: [],
      originalLegacyValue: legacy,
      notes: "Concept preserved without synthetic derivation from error codes.",
    },
  };
}

// =============================================================================
// 23. MISCONCEPTION ADAPTER (TASK 1.3 - STEP 7, 10 & 19)
// =============================================================================

export function adaptLegacyMisconception(
  legacy: Misconception | Record<string, any> | null | undefined,
  context?: { skillId?: string }
): AdapterResult<Misconception | null> {
  // CRITICAL INVARIANT (Step 10): Error != Misconception!
  // A raw error string like "calculation_error" is NOT a misconception construct.
  if (!legacy) {
    return {
      value: null,
      mapping: {
        isKnown: false,
        preserved: [],
        derived: [],
        unavailable: ["misconception_construct"],
        lossy: [],
        notes: "No misconception authored. INVARIANT: Errors (e.g. calculation_error) are NOT misconceptions.",
      },
    };
  }

  // If input is merely an error code string without cognitive trap details:
  if (typeof legacy === "string" || (!legacy.description_ar && !(legacy as any).misconceptionDetails && !(legacy as any).mistake_ar)) {
    return {
      value: null,
      mapping: {
        isKnown: false,
        preserved: [],
        derived: [],
        unavailable: ["authentic_misconception_construct"],
        lossy: [],
        originalLegacyValue: legacy,
        notes: "Rejected raw error string as misconception. Error != Misconception.",
      },
    };
  }

  const trapDetails = (legacy as any).misconceptionDetails || legacy;
  const skillId = toSkillId(context?.skillId || legacy.skillId || "skill_unassigned");
  const id = (trapDetails.id || trapDetails.trapId || `misc_${skillId}`) as MisconceptionId;
  const slug = trapDetails.slug || trapDetails.trapId || "unspecified_misconception";
  const description_ar = trapDetails.description_ar || trapDetails.mistake_ar || "";
  const description_fr = trapDetails.description_fr || "";
  const counterExample_ar = trapDetails.counterExample_ar || trapDetails.correctAction_ar;
  const counterExample_fr = trapDetails.counterExample_fr;

  const misconception: Misconception = {
    id,
    skillId,
    slug,
    description_ar,
    description_fr,
    counterExample_ar,
    counterExample_fr,
  };

  return {
    value: misconception,
    mapping: {
      isKnown: true,
      preserved: ["id", "skillId", "slug", "description_ar"],
      derived: ["canonical_misconception"],
      unavailable: counterExample_ar ? [] : ["counter_example"],
      lossy: [],
      originalLegacyValue: legacy,
      notes: "Authentic cognitive misconception trap preserved.",
    },
  };
}

// =============================================================================
// 24. FULL QUESTION ADAPTER (TASK 1.3 - STEP 4, 5, 6, 7, 8, 9, 11, 12, 15, 16)
// =============================================================================

export function adaptLegacyQuestion(
  legacy: Record<string, any>,
  context?: { associatedSkillIds?: string[] }
): AdapterResult<CanonicalQuestion> {
  const id = toQuestionId(legacy.id);
  const subjectId = legacy.subjectId as SubjectId;
  const streamId = (legacy.streamId || "sciences_exp") as StreamId;

  // 1. Format preservation (Step 4: Non-MCQ formats preserved!)
  let format: QuestionFormat = "mcq_single";
  const rawType = legacy.exerciseType || legacy.format || legacy.type || legacy.questionType || "mcq";
  if (rawType === "journal_entry") {
    format = "journal_entry";
  } else if (rawType === "step_by_step") {
    format = "step_by_step";
  } else if (rawType === "multiple_select" || rawType === "multi_select") {
    format = "multi_select";
  } else if (rawType === "numeric") {
    format = "numeric";
  } else if (rawType === "symbolic") {
    format = "symbolic";
  } else if (rawType === "short_answer") {
    format = "short_answer";
  } else if (rawType === "open_response" || rawType === "structured_written" || rawType === "structured_open") {
    format = "structured_open";
  } else if (rawType === "document_analysis" || rawType === "document_exploitation") {
    format = "document_exploitation";
  } else if (rawType === "error_identification") {
    format = "error_identification";
  } else if (rawType === "methodology_sequence") {
    format = "methodology_sequence";
  } else if (rawType === "trap_avoidance") {
    format = "trap_avoidance";
  } else {
    format = "mcq_single";
  }

  // 2. Difficulty preservation (Step 5: integer 1 | 2 | 3)
  const difficulty: 1 | 2 | 3 = (legacy.difficulty === 1 || legacy.difficulty === 2 || legacy.difficulty === 3)
    ? legacy.difficulty
    : 2;

  // 3. Cognitive Demand Safety (Step 6: Only map if explicitly present!)
  let cognitiveDemand: CognitiveDemand = "comprehension";
  let hasExplicitDemand = false;
  if (legacy.cognitiveDemand && ["recall", "comprehension", "application", "analysis_synthesis", "bac_evaluation"].includes(legacy.cognitiveDemand)) {
    cognitiveDemand = legacy.cognitiveDemand;
    hasExplicitDemand = true;
  } else if (legacy.level) {
    if (legacy.level === "L1_FOUNDATION") {
      cognitiveDemand = "recall";
      hasExplicitDemand = true;
    } else if (legacy.level === "L2_APPLICATION") {
      cognitiveDemand = "application";
      hasExplicitDemand = true;
    } else if (legacy.level === "L3_MIXED" || legacy.level === "L4_TRANSFER") {
      cognitiveDemand = "analysis_synthesis";
      hasExplicitDemand = true;
    } else if (legacy.level === "L5_BAC_STYLE") {
      cognitiveDemand = "bac_evaluation";
      hasExplicitDemand = true;
    }
  }

  // 4. Practice Tier Safety (Step 7: Only map if explicitly present!)
  let practiceTier: PracticeTier | undefined = undefined;
  let hasExplicitTier = false;
  if (legacy.practiceTier) {
    practiceTier = legacy.practiceTier;
    hasExplicitTier = true;
  } else if (legacy.level) {
    if (legacy.level === "L1_FOUNDATION") practiceTier = "guided";
    else if (legacy.level === "L2_APPLICATION") practiceTier = "semi_guided";
    else if (legacy.level === "L3_MIXED") practiceTier = "mixed";
    else if (legacy.level === "L4_TRANSFER") practiceTier = "transfer";
    else if (legacy.level === "L5_BAC_STYLE") practiceTier = "bac_exam_level";
    hasExplicitTier = true;
  }

  // 5. Skill Mapping Safety (Step 8 & 9)
  const rawSkillId = legacy.skillId || legacy.capabilityId;
  const isDiagnosticTopicOnly = !rawSkillId && Boolean(legacy.topicId);
  const primarySkillId = toSkillId(rawSkillId || legacy.topicId || "skill_unmapped");

  // Multi-skill relationships preserved (Step 9)
  const rawSkillIds: string[] = Array.isArray(legacy.skillIds)
    ? legacy.skillIds
    : context?.associatedSkillIds || (rawSkillId ? [rawSkillId] : []);
  const skillIds = rawSkillIds.map(toSkillId);

  // 6. Retest Twin Safety (Step 16)
  const isRetestVariant = Boolean(legacy.isRetestVariant);
  const retestForQuestionId = legacy.retestForQuestionId ? toQuestionId(legacy.retestForQuestionId) : undefined;

  // Options adaptation
  const options = Array.isArray(legacy.options)
    ? legacy.options.map((opt: any) => ({
        id: opt.id,
        text_ar: opt.text_ar,
        text_fr: opt.text_fr || opt.text_ar,
        isCorrect: Boolean(opt.isCorrect ?? (legacy.correctAnswerId === opt.id)),
        misconceptionId: opt.misconceptionDetails?.trapId || opt.misconceptionId,
        rationale_ar: opt.rationale_ar,
        rationale_fr: opt.rationale_fr,
      }))
    : undefined;

  const canonical: CanonicalQuestion = {
    id,
    skillId: primarySkillId,
    skillIds: skillIds.length > 1 ? skillIds : undefined,
    topicId: legacy.topicId,
    subjectId,
    streamId,
    format,
    cognitiveDemand,
    difficulty,
    prompt_ar: legacy.prompt_ar || "",
    prompt_fr: legacy.prompt_fr || legacy.prompt_ar || "",
    options,
    expectedTimeSeconds: legacy.expectedTimeSeconds || (legacy.estimatedTimeMin ? legacy.estimatedTimeMin * 60 : 60),
    isRetestVariant: isRetestVariant ? true : undefined,
    retestForQuestionId,
    practiceTier,
    version: legacy.version,
    tags: legacy.tags ? [...legacy.tags] : undefined,
    sourceId: legacy.sourceId,
    rightsStatus: legacy.rightsStatus,
    verificationStatus: legacy.verificationStatus,
  };

  const unavailable: string[] = [];
  if (!hasExplicitDemand) unavailable.push("cognitiveDemand (unspecified in legacy item; safe default assigned)");
  if (!hasExplicitTier) unavailable.push("practiceTier");
  if (isDiagnosticTopicOnly) unavailable.push("authoritative_skillId (topicId used as proxy)");
  if (legacy.diagnosticLayer === undefined) unavailable.push("diagnosticLayer (L0-L5)");

  const lossy: string[] = [];
  if (isDiagnosticTopicOnly) lossy.push("topic_id_used_as_skill_proxy");

  return {
    value: canonical,
    mapping: {
      isKnown: true,
      preserved: [
        "id",
        "subjectId",
        "streamId",
        "prompt_ar",
        "difficulty",
        ...(rawSkillId ? ["skillId"] : []),
        ...(skillIds.length > 1 ? ["multi_skill_relationships"] : []),
        ...(isRetestVariant ? ["isRetestVariant"] : []),
        ...(retestForQuestionId ? ["retestForQuestionId"] : []),
        ...(hasExplicitTier ? ["practiceTier"] : []),
        ...(legacy.version ? ["version"] : []),
      ],
      derived: [
        "canonical_question",
        ...(hasExplicitDemand ? ["cognitiveDemand"] : []),
      ],
      unavailable,
      lossy,
      originalLegacyValue: {
        id: legacy.id,
        rawType,
        rawDifficulty: legacy.difficulty,
        rawLevel: legacy.level,
        topicId: legacy.topicId,
      },
      notes: "Preserves question interaction format without forced MCQ conversion. Difficulty is isolated from cognitive demand and practice tier.",
    },
  };
}

// =============================================================================
// 25. RESOURCE ADAPTER (TASK 1.3 - STEP 13, 14 & 19)
// =============================================================================

export function adaptLegacyResource(
  legacy: LegacyResource | (Partial<LegacyResource> & { id: string; title_ar: string })
): AdapterResult<PedagogicalResource> {
  const resourceId = (legacy.id || `res_${Date.now()}`) as ResourceId;
  const isVerified = legacy.verificationStatus === "verified";
  const rightsStatus = legacy.rightsStatus || "unknown";

  let type: PedagogicalResource["type"] = "summary_card";
  if (legacy.type === "summary_sheet") type = "summary_card";
  else if (legacy.type === "methodology_guide") type = "summary_card";
  else if (legacy.type === "formula_card") type = "summary_card";

  const skillIds = legacy.skillId ? [toSkillId(legacy.skillId)] : [];

  const canonical: PedagogicalResource = {
    id: resourceId,
    type,
    title_ar: legacy.title_ar,
    title_fr: legacy.title_fr || legacy.title_ar,
    uri: legacy.sourceId || `internal://resources/${legacy.id}`,
    skillIds,
    isVerified,
  };

  return {
    value: canonical,
    mapping: {
      isKnown: true,
      preserved: ["id", "title_ar", "title_fr", "rightsStatus"],
      derived: ["isVerified"],
      unavailable: legacy.skillId ? [] : ["skill_linkage"],
      lossy: [],
      originalLegacyValue: { id: legacy.id, rightsStatus, sourceType: legacy.sourceType },
      notes: rightsStatus === "unknown"
        ? "Rights status is undeclared in legacy record; explicitly quarantined as unknown."
        : "Pedagogical resource adapted with verified rights metadata.",
    },
  };
}

// =============================================================================
// 26. RUBRIC ADAPTER (TASK 1.3 - STEP 17 & 19)
// =============================================================================

export function adaptLegacyRubric(
  legacy: MinisterialRubric | Record<string, any> | string | null | undefined,
  context?: { questionId?: string }
): AdapterResult<MinisterialRubric | null> {
  // RUBRIC SAFETY (Step 17): If input is a raw markdown string or explanation,
  // DO NOT fabricate criteria!
  if (!legacy || typeof legacy === "string") {
    return {
      value: null,
      mapping: {
        isKnown: false,
        preserved: [],
        derived: [],
        unavailable: ["structured_rubric_criteria"],
        lossy: [],
        originalLegacyValue: legacy,
        notes: "Free-form rubric explanation present in legacy record; structured ministerial rubric criteria unavailable.",
      },
    };
  }

  // If structured criteria exist:
  if (Array.isArray(legacy.criteria) && legacy.criteria.length > 0) {
    const questionId = toQuestionId(context?.questionId || legacy.questionId || "q_unassigned");
    const rubricId = (legacy.id || `rubric_${questionId}`) as RubricId;

    const criteria: RubricCriterion[] = legacy.criteria.map((c: any, idx: number) => ({
      id: c.id || `crit_${idx + 1}`,
      descriptor_ar: c.descriptor_ar || "",
      descriptor_fr: c.descriptor_fr || "",
      allocatedPoints: typeof c.allocatedPoints === "number" ? c.allocatedPoints : 1,
      requiredKeywords: Array.isArray(c.requiredKeywords) ? c.requiredKeywords : [],
    }));

    const totalPoints = typeof legacy.totalPoints === "number"
      ? legacy.totalPoints
      : criteria.reduce((sum, c) => sum + c.allocatedPoints, 0);

    const rubric: MinisterialRubric = {
      id: rubricId,
      questionId,
      totalPoints,
      criteria,
      bacYearReference: legacy.bacYearReference,
    };

    return {
      value: rubric,
      mapping: {
        isKnown: true,
        preserved: ["id", "questionId", "totalPoints", "criteria"],
        derived: ["canonical_rubric"],
        unavailable: legacy.bacYearReference ? [] : ["bacYearReference"],
        lossy: [],
        originalLegacyValue: legacy,
        notes: "Official structured rubric criteria preserved.",
      },
    };
  }

  // Otherwise, no structured criteria:
  return {
    value: null,
    mapping: {
      isKnown: false,
      preserved: [],
      derived: [],
      unavailable: ["structured_rubric_criteria"],
      lossy: [],
      originalLegacyValue: legacy,
      notes: "Legacy rubric lacks structured criteria array; marked unavailable without fabrication.",
    },
  };
}
