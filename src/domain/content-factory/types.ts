/**
 * BAC Mastery — Math Content Factory Domain Types
 * 
 * Defines schemas and contracts for:
 * 1. 3AS Mathematics Curriculum Hierarchy (Domain -> Topic -> Skill)
 * 2. Diagnostic Signal Profiles
 * 3. Guided vs Independent Practice Model
 * 4. Isomorphic Retest Twin Verification Contracts
 * 5. Spaced Review Schedules
 * 6. Internal Verification & Quality Audit Records
 */

import { StreamId, SubjectId } from "@/types/education";
import { SuspectedErrorType } from "@/types/mission";
import {
  ContentPackage,
  ContentQualityScoreResult,
  ExpansionPriorityResult,
  SourceClassification,
} from "@/domain/content-quality/types";
import {
  VisualLearningAsset,
  ExternalLearningResource,
} from "@/domain/learning-ecosystem/types";

// =============================================================================
// 1. CURRICULUM HIERARCHY FOR 3AS MATHEMATICS
// =============================================================================

export type MathCurriculumDomainId =
  | "algebre_arithmetique"
  | "nombres_complexes_geometrie"
  | "analyse"
  | "geometrie_espace"
  | "probabilites_denombrement";

export interface MathCurriculumDomain {
  id: MathCurriculumDomainId;
  title_ar: string;
  title_fr: string;
  description_ar: string;
  description_fr: string;
  topicIds: string[];
  order: number;
}

export interface MathCurriculumTopic {
  id: string;
  domainId: MathCurriculumDomainId;
  title_ar: string;
  title_fr: string;
  description_ar: string;
  description_fr: string;
  skillIds: string[];
  order: number;
  isSpecificToMathStream: boolean; // True for Bézout, Similitudes, etc.
}

// =============================================================================
// 2. DIAGNOSTIC SIGNAL PROFILE
// =============================================================================

export interface MathDiagnosticSignalProfile {
  skillId: string;
  missingPrerequisiteIndicators_ar: string[];
  conceptualMisconceptionIndicators_ar: string[];
  proceduralWeaknessIndicators_ar: string[];
  examMethodWeaknessIndicators_ar: string[];
}

// =============================================================================
// 3. SPACED REVIEW SCHEDULES
// =============================================================================

export interface MathSpacedReviewSchedule {
  skillId: string;
  day1InitialEvidence_ar: string;
  day3RetrievalPrompt_ar: string;
  day7MixedPracticePrompt_ar: string;
  laterExamApplicationPrompt_ar: string;
}

// =============================================================================
// 4. COMPLETE AUTHORED MATH SKILL DOSSIER
// =============================================================================

export interface MathEscalationProfile {
  skillId: string;
  subjectId: "math";
  streamId: "math";
  complexityWeight: number;
  recommendedEscalation: string;
  requiresTeacherForRetestFailure: boolean;
}

export interface MathSkillDossier {
  package: ContentPackage;
  domainId: MathCurriculumDomainId;
  diagnosticSignal: MathDiagnosticSignalProfile;
  spacedReview: MathSpacedReviewSchedule;
  visualAsset: VisualLearningAsset;
  externalResource: ExternalLearningResource;
  escalationProfile: MathEscalationProfile;
  priorityAssessment: ExpansionPriorityResult;
  qualityAssessment: ContentQualityScoreResult;
}

// =============================================================================
// 5. BATCH PRODUCTION AUDIT SUMMARY
// =============================================================================

export interface MathBatchAuditSummary {
  batchId: string;
  targetStream: StreamId;
  targetSubject: SubjectId;
  academicYear: string;
  totalSkillsCount: number;
  fullyPublishedCount: number;
  highPriorityCount: number;
  cleanClaimAuditCount: number;
  averageLoopCompletenessPercentage: number;
  generatedAt: string;
}
