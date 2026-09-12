/**
 * BAC Mastery — Central Learning Operating System Types
 * Prompt 18.1: Foundation Learning System Architecture
 * 
 * Defines domain models for:
 * 1. Universal Learning Cycle & Stages
 * 2. Evidence Hierarchy (Signal vs. Evidence vs. Mastery)
 * 3. Memory & Spaced Review Dynamics
 * 4. Practice & Interleaving Specifications
 * 5. Error, Repair & Retest Protocols
 * 6. Subject Methodology Families
 * 7. Planning Contracts (Daily Next Best Action, Weekly Adaptation)
 */

import { SubjectId, StreamId, ExamType, EducationLevel, TechniqueMathSpecialty } from "@/types/education";
import { DiagnosticDimension } from "@/types/diagnostic";
import { SuspectedErrorType, MasteryStatus } from "@/types/mission";

// =============================================================================
// 1. UNIVERSAL LEARNING CYCLE
// =============================================================================

export type LearningStage =
  | "preview"               // 1. Taffahuh awal / Preview
  | "activate_prereq"       // 2. Tanchit al-muktasabat / Activate prerequisites
  | "understand_concept"    // 3. Fahm al-mafhoum / Understand concept
  | "worked_example"        // 4. Mithal mahloul / Worked example
  | "close_source"          // 5. Ighlaq al-masdar / Close notes
  | "active_recall"         // 6. Istirja' fa'al / Active recall
  | "guided_practice"       // 7. Tatbiq muwajjah / Guided practice
  | "independent_practice"  // 8. Tatbiq mustaqil / Independent practice
  | "feedback"              // 9. Taghdiya raji'a / Instant feedback
  | "diagnose_error"        // 10. Tashkhis al-khata' / Diagnose error
  | "repair"                // 11. Tarmeem / Repair misconception
  | "retest"                // 12. I'adat ikhtibar / Retest twin
  | "transfer"              // 13. Tahweel wa rabt / Transfer to BAC context
  | "spaced_review";        // 14. Muraja'a mutaba'ida / Spaced review

// =============================================================================
// 2. EVIDENCE HIERARCHY
// =============================================================================

/**
 * Epistemic distinction:
 * - SIGNAL: Subjective or indirect indicator (e.g. self-rating, time on page)
 * - PRACTICE_EVIDENCE: Objective correctness during initial practice
 * - RETEST_EVIDENCE: Validated correction on unseen twin question
 * - TRANSFER_EVIDENCE: Success in mixed, unguided, or exam-level problem
 * - STABLE_MASTERY_EVIDENCE: Repeated retrieval and transfer sustained across time
 */
export type EvidenceTier =
  | "signal"
  | "practice_evidence"
  | "retest_evidence"
  | "transfer_evidence"
  | "stable_mastery_evidence";

export interface StudentEvidenceRecord {
  skillId: string;
  subjectId: SubjectId;
  tier: EvidenceTier;
  timestamp: string;
  source: "diagnostic" | "practice" | "retest" | "spaced_review" | "exam_transfer";
  score: number;            // 0.0 to 1.0
  confidence: 1 | 2 | 3 | 4 | 5;
  responseTimeSeconds?: number;
  expectedTimeSeconds?: number;
  isRecurringError?: boolean;
}

// =============================================================================
// 3. ADAPTIVE SPACED REVIEW
// =============================================================================

export type ReviewUrgency = "fresh" | "due" | "overdue" | "critical";

export interface SpacedReviewSchedule {
  skillId: string;
  subjectId: SubjectId;
  intervalDays: number;
  lastTestedAt: string;
  nextReviewDueAt: string;
  urgency: ReviewUrgency;
  consecutiveSuccesses: number;
  lapseCount: number;
  decayRate: number;        // Higher rate = faster forgetting
}

export interface ReviewParameters {
  correctness: boolean;
  confidence: 1 | 2 | 3 | 4 | 5;
  responseTimeSeconds: number;
  expectedTimeSeconds: number;
  previousLapses: number;
  isRecurring: boolean;
  daysSinceLastReview: number;
}

// =============================================================================
// 4. PRACTICE & INTERLEAVING
// =============================================================================

export type PracticeProgression =
  | "guided"
  | "semi_guided"
  | "independent"
  | "mixed"
  | "transfer"
  | "exam";

export type PracticeMode = "blocked" | "interleaved";

export interface InterleavingCriteria {
  subjectId: SubjectId;
  primarySkillId: string;
  eligibleRelatedSkillIds: string[];
  cognitiveDimensions: DiagnosticDimension[];
  minMasteryTier: MasteryStatus;
  maxDifficultyDifference: number; // 0, 1
}

// =============================================================================
// 5. ERROR, REPAIR & RETEST
// =============================================================================

export interface ErrorClassification {
  errorType: SuspectedErrorType;
  isRecurring: boolean;
  occurrenceCount: number;
  rootCauseAttribution: "conceptual" | "procedural" | "metacognitive" | "arithmetic" | "attentional";
  priorityImpact: "escalate_immediate" | "repair_next" | "monitor";
}

export interface RepairProtocol {
  skillId: string;
  errorType: SuspectedErrorType;
  title_ar: string;
  title_fr: string;
  targetMisconception_ar: string;
  targetMisconception_fr: string;
  steps_ar: string[];
  steps_fr: string[];
  microDrillQuestionId?: string;
  estimatedMinutes: number; // 5 to 15 max
}

export interface RetestContract {
  parentQuestionId: string;
  skillId: string;
  subjectId: SubjectId;
  isIsomorphicTwin: boolean;   // Tests identical concept with altered surface values
  isIndependentPath: boolean;  // Student must construct solution from scratch
  maxAllowedCycles: number;    // Exactly 2 cycles
}

// =============================================================================
// 6. SUBJECT METHODOLOGY FAMILIES
// =============================================================================

export type MethodologyFamily =
  | "mathematics"
  | "physics_chemistry"
  | "natural_sciences"
  | "history_geography"
  | "philosophy"
  | "islamic_studies"
  | "languages"
  | "economics_management"
  | "technique_math";

export interface SubjectMethodologyProfile {
  family: MethodologyFamily;
  subjectId: SubjectId;
  displayName_ar: string;
  displayName_fr: string;
  contentLanguage: "ar" | "fr" | "en" | "es" | "de" | "it";
  textDirection: "rtl" | "ltr";
  coreEpistemicSequence: string[];
  typicalCognitiveDemands: string[];
  preferredStudyProtocol: string;
  practiceProgressionModel: PracticeProgression[];
  dominantErrorTypes: SuspectedErrorType[];
  examTransferCharacteristics: string[];
  specialtyIdentifier?: TechniqueMathSpecialty;
  coefficientStatus: "provisional_benchmark" | "officially_verified_current";
  provisionalCoefficient?: number;
}

// =============================================================================
// 7. PLANNING CONTRACTS (DAILY & WEEKLY)
// =============================================================================

export interface DailyPlannerInput {
  userId: string;
  streamId: StreamId;
  targetScore: number;
  availableMinutesToday: number;
  energyState: "good" | "normal" | "tired" | "stressed";
  activeErrors: Array<{ skillId: string; isRecurring: boolean; errorType: SuspectedErrorType }>;
  dueReviews: SpacedReviewSchedule[];
  unmasteredPrerequisites: string[];
  currentRoadmapSkillId: string;
}

export interface DailyNextBestAction {
  primaryMissionId: string;
  skillId: string;
  subjectId: SubjectId;
  actionType: "repair" | "retest" | "new_learning" | "spaced_review" | "exam_transfer" | "recovery_reset";
  title_ar: string;
  rationale_ar: string;
  rationaleCode: string;
  estimatedMinutes: number;
  expectedEvidence: EvidenceTier;
  energySuitability: ("good" | "normal" | "tired" | "stressed")[];
  secondaryReviewMissionId?: string;
}

export interface WeeklyAdaptationSummary {
  weekNumber: number;
  masteredSkillsThisWeek: string[];
  emergingSkillsThisWeek: string[];
  persistentErrors: SuspectedErrorType[];
  overdueReviewCount: number;
  actualVsPlannedMinutes: { planned: number; completed: number };
  subjectBalanceBreakdown: Record<SubjectId, number>; // minutes spent per subject
  adjustedFocusNextWeek: {
    boostSubjects: SubjectId[];
    maintainSubjects: SubjectId[];
    recoveryInterventions: string[];
  };
}
