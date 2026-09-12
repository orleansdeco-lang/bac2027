/**
 * BAC Mastery — Content Quality Infrastructure Types
 * 
 * Defines domain models for:
 * 1. Source Classification Hierarchy
 * 2. Content Lifecycle & Verification Dimensions
 * 3. Expansion Priority Inputs & Categorical Scores
 * 4. Multidimensional Quality Evaluation
 * 5. Automated Claim Audit Rules & Violations
 * 6. Source Health & Staleness Tracking
 * 7. Content Package Authoring Contract
 * 8. Official 2026-2027 Curriculum Audit Schema
 */

import { StreamId, SubjectId, TechniqueMathSpecialty } from "@/types/education";
import { SuspectedErrorType } from "@/types/mission";
import { VisualEducationalPurpose, VisualType } from "@/domain/learning-ecosystem/types";
import { ResourceEducationalPurpose, ResourceReturnAction } from "@/domain/learning-ecosystem/types";

// =============================================================================
// 1. SOURCE CLASSIFICATION HIERARCHY
// =============================================================================

export type SourceClassification =
  | "OFFICIAL_CURRENT"      // Active ministerial decree, circular, or syllabus valid for 2026-2027
  | "OFFICIAL_HISTORICAL"   // Confirmed in past decree (e.g. Decree 07-142), active until officially superseded
  | "BAC_MASTERY_DERIVED"   // Internal instructional design, taxonomy, or pedagogical synthesis
  | "RESEARCH_SUPPORTED"    // Empirical educational literature or accredited pedagogical consensus
  | "UNVERIFIED";           // Public claim or third-party assertion not yet authoritatively audited

// =============================================================================
// 2. CONTENT LIFECYCLE STATES
// =============================================================================

export type ContentLifecycleStage =
  | "DRAFT"                 // Authoring in progress; strictly hidden from students
  | "INTERNAL_REVIEW"       // Author completed; undergoing initial peer review
  | "FACT_CHECKED"          // Formulas, numbers, citations, and units independently verified
  | "PEDAGOGICALLY_REVIEWED"// Methodological progression, Bloom level, and error taxonomy audited
  | "VERIFIED"              // Passed all quality dimensions; certified for platform inclusion
  | "PUBLISHED"             // Active and consumable in student learning OS
  | "ARCHIVED";             // Deprecated or replaced by updated curriculum revision

// =============================================================================
// 3. EXPANSION PRIORITY ENGINE TYPES
// =============================================================================

export type PriorityLevel = "HIGH" | "MEDIUM" | "LOW";

export interface PriorityFactorInputs {
  studentDemandPotential: 1 | 2 | 3 | 4 | 5;     // Estimated learner volume / search frequency
  examRelevance: 1 | 2 | 3 | 4 | 5;              // Core coefficient and BAC exam appearance probability
  curriculumCentrality: 1 | 2 | 3 | 4 | 5;       // Foundational concept vs peripheral subtopic
  prerequisiteImportance: 1 | 2 | 3 | 4 | 5;     // Blocks multiple downstream skills if unmastered
  crossTopicDependency: 1 | 2 | 3 | 4 | 5;       // Required across multiple chapters / subjects
  difficultyLevel: 1 | 2 | 3;                    // 1: Foundation, 2: Standard BAC, 3: Complex synthesis
  currentContentGap: boolean;                    // True if completely unmapped or unauthored
  trustworthySourcesAvailable: boolean;          // High-quality official/pedagogical sources on hand
  errorFrequencyPotential: 1 | 2 | 3 | 4 | 5;    // Known stumbling block in BAC corrections
  educationalRoi: 1 | 2 | 3 | 4 | 5;             // Score gain efficiency per hour of study
}

export interface ExpansionPriorityResult {
  level: PriorityLevel;
  priorityReason: string;
  keyDrivers: string[];
}

// =============================================================================
// 4. MULTIDIMENSIONAL QUALITY SCORING
// =============================================================================

export type DimensionStatus = "VERIFIED" | "NEEDS_IMPROVEMENT" | "NOT_APPLICABLE" | "UNKNOWN";

export interface ContentQualityDimensionsAssessment {
  factualAccuracy: DimensionStatus;
  curriculumAlignment: DimensionStatus;
  pedagogicalQuality: DimensionStatus;
  practiceQuality: DimensionStatus;
  retestQuality: DimensionStatus;
  errorCoverage: DimensionStatus;
  provenanceVerification: DimensionStatus;
  accessibilityCompliance: DimensionStatus;
  languageQuality: DimensionStatus;
  examTransferAlignment: DimensionStatus;
}

export interface ContentQualityScoreResult {
  overallScore: "EXEMPLARY" | "ACCEPTABLE" | "PROVISIONAL" | "UNKNOWN";
  dimensions: ContentQualityDimensionsAssessment;
  isPublishable: boolean;
  auditNotes: string[];
}

// =============================================================================
// 5. AUTOMATED CLAIM AUDIT TYPES
// =============================================================================

export type ClaimViolationSeverity = "BLOCKER" | "WARNING" | "INFO";

export interface ClaimViolation {
  matchedPattern: string;
  severity: ClaimViolationSeverity;
  category:
    | "unsupported_official_claim"
    | "coefficient_misrepresentation"
    | "score_guarantee"
    | "exam_prediction"
    | "syllabus_absolutism"
    | "forbidden_threshold_term";
  excerpt: string;
  reason: string;
  remediation: string;
}

export interface ClaimAuditResult {
  isClean: boolean;
  violations: ClaimViolation[];
  blockerCount: number;
  warningCount: number;
}

// =============================================================================
// 6. SOURCE HEALTH & STALENESS TRACKING
// =============================================================================

export type SourceHealthStatus = "FRESH" | "VALID" | "STALE_WARNING" | "SOURCE_STALE";

export interface SourceHealthRecord {
  sourceId: string;
  url?: string;
  title: string;
  provider: string;
  classification: SourceClassification;
  lastCheckedAt: string;          // ISO 8601
  status: SourceHealthStatus;
  validityWindowDays: number;     // E.g. 180 days
  daysSinceLastCheck: number;
  auditFlag?: string;
}

// =============================================================================
// 7. CONTENT PACKAGE AUTHORING CONTRACT
// =============================================================================

export type VisualNecessityLevel =
  | "VISUAL_REQUIRED"
  | "VISUAL_USEFUL"
  | "VISUAL_OPTIONAL"
  | "VISUAL_NOT_NEEDED";

export interface ContentPackagePracticeItem {
  id: string;
  prompt_ar: string;
  prompt_fr?: string;
  optionsCount: number;
  correctAnswerId: string;
  explanation_ar: string;
  distractorErrorMappings: Record<string, SuspectedErrorType>;
}

export interface ContentPackageRetestItem {
  id: string;
  parentPracticeQuestionId: string;
  prompt_ar: string;
  prompt_fr?: string;
  isIsomorphicTwin: boolean;
  altersSurfaceContext: boolean;
  testsIdenticalConcept: boolean;
  correctAnswerId: string;
  explanation_ar: string;
}

export interface ContentPackageRepairGuide {
  targetErrorType: SuspectedErrorType;
  title_ar: string;
  mentalModelExplanation_ar: string;
  actionableSteps_ar: string[];
  contrastiveWorkedExample?: string;
}

export interface ContentPackageExamTransfer {
  status: "AVAILABLE" | "NOT_NEEDED";
  bacTypologyNotes_ar?: string;
  commonPitfalls_ar?: string[];
  officialBacPastRefIds?: string[];
}

export interface ContentPackage {
  packageId: string;
  streamId: StreamId;
  subjectId: SubjectId;
  specialtyId?: TechniqueMathSpecialty;
  topicId: string;
  skillId: string;
  objective_ar: string;
  objective_fr?: string;
  prerequisites: string[];
  lesson: {
    title_ar: string;
    contentMarkdown_ar: string;
    keyTakeaway_ar: string;
  };
  workedExample: {
    problem_ar: string;
    stepByStepSolution_ar: string[];
    pedagogicalComment_ar: string;
  };
  activeRecall: {
    prompt_ar: string;
    expectedAnswer_ar: string;
    concealedInitially: boolean;
  };
  practice: ContentPackagePracticeItem[];
  retest: ContentPackageRetestItem;
  repairGuide: ContentPackageRepairGuide;
  visualNecessity: VisualNecessityLevel;
  visualAssetIds: string[];
  externalResourceIds: string[];
  examTransfer: ContentPackageExamTransfer;
  motivationSupport?: {
    status: "NORMALIZED" | "NOT_NEEDED";
    microNormalizeText_ar?: string;
    nextBestActionHint_ar?: string;
  };
  provenance: {
    sourceId: string;
    sourceTitle: string;
    classification: SourceClassification;
    rightsStatus: "original" | "official_reference" | "external_reference_only";
    lastAuditedAt: string;
  };
  lifecycleState: ContentLifecycleStage;
}

// =============================================================================
// 8. OFFICIAL 2026-2027 CURRICULUM AUDIT SCHEMA
// =============================================================================

export interface StreamCurriculumAuditRecord {
  streamId: StreamId;
  specialtyId?: TechniqueMathSpecialty;
  streamName_ar: string;
  streamName_fr: string;
  educationLevel: "secondary";
  academicYear: "2026-2027";
  legalStatusSummary: string;
  coefficientStatus: "OFFICIAL_HISTORICAL" | "PROVISIONAL_UNVERIFIED";
  ministerialCancellationNotice: string;
  coreSubjects: SubjectId[];
  totalOfficialSubjects: number;
  lastVerifiedDate: string;
  reviewerStatus: "AUDITED_LEGAL_BASELINE";
  unresolvedQuestions: string[];
}
