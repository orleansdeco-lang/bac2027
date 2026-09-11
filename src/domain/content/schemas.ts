/**
 * BAC Mastery — Content & Knowledge Architecture Schemas & Validators
 * Prompt 11: Trustworthy Internal Knowledge & Content Model
 * 
 * Provides schema validation definitions, valid enum sets, and type guards.
 */

import {
  VerificationStatus,
  ContentSourceType,
  ContentRightsStatus,
  QuestionType,
  BloomTaxonomyLevel,
  ContentSource,
  VerificationRecord,
  Curriculum,
  Subject,
  Topic,
  Skill,
  LearningObjective,
  Resource,
  PastBacExamReference,
  PracticeQuestion,
  RetestQuestion,
  QuestionOption,
} from "./types";
import { DiagnosticDimension } from "@/types/diagnostic";
import { SuspectedErrorType } from "@/types/mission";

// ============================================================================
// 1. VALID ENUM SETS
// ============================================================================

export const VALID_VERIFICATION_STATUSES: ReadonlySet<VerificationStatus> = new Set<VerificationStatus>([
  "unverified",
  "pending_review",
  "verified",
  "outdated",
  "rejected",
]);

export const VALID_SOURCE_TYPES: ReadonlySet<ContentSourceType> = new Set<ContentSourceType>([
  "ministry",
  "official_curriculum",
  "official_exam",
  "official_document",
  "school_reference",
  "trusted_educational_source",
  "original_bac_mastery",
  "past_bac_exam",
  "other",
]);

export const VALID_RIGHTS_STATUSES: ReadonlySet<ContentRightsStatus> = new Set<ContentRightsStatus>([
  "original",
  "official_reference",
  "licensed",
  "permission_granted",
  "external_reference_only",
  "restricted",
  "unknown",
]);

export const VALID_QUESTION_TYPES: ReadonlySet<QuestionType> = new Set<QuestionType>([
  "mcq",
  "multiple_select",
  "numeric",
  "short_answer",
  "true_false",
  "structured_answer",
  "open_response",
]);

export const VALID_BLOOM_LEVELS: ReadonlySet<BloomTaxonomyLevel> = new Set<BloomTaxonomyLevel>([
  "remember",
  "understand",
  "apply",
  "analyze",
  "evaluate",
  "create",
]);

export const VALID_COGNITIVE_DIMENSIONS: ReadonlySet<DiagnosticDimension> = new Set<DiagnosticDimension>([
  "knowledge",
  "understanding",
  "application",
  "methodology",
  "speed",
  "confidence",
]);

export const VALID_ERROR_TAXONOMY: ReadonlySet<SuspectedErrorType> = new Set<SuspectedErrorType>([
  "forgot_information",
  "misunderstood_concept",
  "methodology_error",
  "calculation_error",
  "misread_question",
  "rushed",
  "lack_of_practice",
  "time_management",
  "attention_error",
  "unknown",
]);

export const VALID_DIFFICULTY_LEVELS: ReadonlySet<number> = new Set([1, 2, 3]);

// ============================================================================
// 2. SCHEMA VALIDATION RESULT INTERFACE
// ============================================================================

export interface ValidationOutcome {
  valid: boolean;
  errors: string[];
}

function createOutcome(): { outcome: ValidationOutcome; addError: (msg: string) => void } {
  const errors: string[] = [];
  return {
    outcome: {
      get valid() {
        return errors.length === 0;
      },
      errors,
    },
    addError: (msg: string) => errors.push(msg),
  };
}

// ============================================================================
// 3. ENTITY VALIDATORS
// ============================================================================

/**
 * Validates ContentSource entity
 */
export function validateContentSource(source: unknown): ValidationOutcome {
  const { outcome, addError } = createOutcome();
  if (!source || typeof source !== "object") {
    addError("ContentSource must be a non-null object");
    return outcome;
  }
  const s = source as Record<string, unknown>;

  if (typeof s.id !== "string" || !s.id.trim()) addError("source.id must be a non-empty string");
  if (!VALID_SOURCE_TYPES.has(s.type as ContentSourceType)) {
    addError(`source.type invalid: ${String(s.type)}`);
  }
  if (typeof s.name !== "string" || !s.name.trim()) addError("source.name must be non-empty");
  if (typeof s.title_ar !== "string" || !s.title_ar.trim()) addError("source.title_ar must be non-empty");
  if (typeof s.title_fr !== "string" || !s.title_fr.trim()) addError("source.title_fr must be non-empty");
  if (typeof s.publisher !== "string" || !s.publisher.trim()) addError("source.publisher must be non-empty");
  if (!VALID_RIGHTS_STATUSES.has(s.rightsStatus as ContentRightsStatus)) {
    addError(`source.rightsStatus invalid: ${String(s.rightsStatus)}`);
  }
  if ("user_id" in s || "userId" in s) addError("ContentSource must not contain student user_id");

  return outcome;
}

/**
 * Validates VerificationRecord entity
 */
export function validateVerificationRecord(record: unknown): ValidationOutcome {
  const { outcome, addError } = createOutcome();
  if (!record || typeof record !== "object") {
    addError("VerificationRecord must be a non-null object");
    return outcome;
  }
  const r = record as Record<string, unknown>;

  if (typeof r.id !== "string" || !r.id.trim()) addError("record.id must be a non-empty string");
  if (typeof r.entityId !== "string" || !r.entityId.trim()) addError("record.entityId must be non-empty");
  if (!VALID_VERIFICATION_STATUSES.has(r.status as VerificationStatus)) {
    addError(`record.status invalid: ${String(r.status)}`);
  }
  if (typeof r.verifiedBy !== "string" || !r.verifiedBy.trim()) addError("record.verifiedBy must be non-empty");
  if (typeof r.verifiedAt !== "string" || !r.verifiedAt.trim()) addError("record.verifiedAt must be non-empty");
  if ("user_id" in r || "userId" in r) addError("VerificationRecord must not contain student user_id");

  return outcome;
}

/**
 * Validates Curriculum entity
 */
export function validateCurriculum(curriculum: unknown): ValidationOutcome {
  const { outcome, addError } = createOutcome();
  if (!curriculum || typeof curriculum !== "object") {
    addError("Curriculum must be a non-null object");
    return outcome;
  }
  const c = curriculum as Record<string, unknown>;

  if (typeof c.id !== "string" || !c.id.trim()) addError("curriculum.id must be a non-empty string");
  if (c.streamId !== "sciences_exp" && typeof c.streamId !== "string") addError("curriculum.streamId missing");
  if (c.educationLevel !== "secondary") addError("curriculum.educationLevel must be 'secondary'");
  if (c.examType !== "bac") addError("curriculum.examType must be 'bac'");
  if (typeof c.academicYear !== "string" || !c.academicYear.trim()) addError("curriculum.academicYear must be non-empty");
  if (typeof c.title_ar !== "string" || !c.title_ar.trim()) addError("curriculum.title_ar must be non-empty");
  if (typeof c.title_fr !== "string" || !c.title_fr.trim()) addError("curriculum.title_fr must be non-empty");
  if (!VALID_SOURCE_TYPES.has(c.sourceType as ContentSourceType)) addError(`curriculum.sourceType invalid`);
  if (!VALID_RIGHTS_STATUSES.has(c.rightsStatus as ContentRightsStatus)) addError(`curriculum.rightsStatus invalid`);
  if (!VALID_VERIFICATION_STATUSES.has(c.verificationStatus as VerificationStatus)) addError(`curriculum.verificationStatus invalid`);
  if ("user_id" in c || "userId" in c) addError("Curriculum must not contain student user_id");

  return outcome;
}

/**
 * Validates Subject entity
 */
export function validateSubject(subject: unknown): ValidationOutcome {
  const { outcome, addError } = createOutcome();
  if (!subject || typeof subject !== "object") {
    addError("Subject must be a non-null object");
    return outcome;
  }
  const s = subject as Record<string, unknown>;

  if (typeof s.id !== "string" || !s.id.trim()) addError("subject.id must be non-empty");
  if (typeof s.title_ar !== "string" || !s.title_ar.trim()) addError("subject.title_ar must be non-empty");
  if (typeof s.title_fr !== "string" || !s.title_fr.trim()) addError("subject.title_fr must be non-empty");
  if (!s.coefficientProvenance || typeof s.coefficientProvenance !== "object") {
    addError("subject.coefficientProvenance must be defined");
  } else {
    const cp = s.coefficientProvenance as Record<string, unknown>;
    if (typeof cp.value !== "number" || cp.value <= 0) addError("coefficient value must be a positive number");
    if (!VALID_VERIFICATION_STATUSES.has(cp.status as VerificationStatus)) {
      addError("coefficientProvenance.status must be a valid verification status");
    }
  }
  if (!VALID_SOURCE_TYPES.has(s.sourceType as ContentSourceType)) addError(`subject.sourceType invalid`);
  if (!VALID_RIGHTS_STATUSES.has(s.rightsStatus as ContentRightsStatus)) addError(`subject.rightsStatus invalid`);
  if (!VALID_VERIFICATION_STATUSES.has(s.verificationStatus as VerificationStatus)) addError(`subject.verificationStatus invalid`);
  if ("user_id" in s || "userId" in s) addError("Subject must not contain student user_id");

  return outcome;
}

/**
 * Validates Topic entity
 */
export function validateTopic(topic: unknown): ValidationOutcome {
  const { outcome, addError } = createOutcome();
  if (!topic || typeof topic !== "object") {
    addError("Topic must be a non-null object");
    return outcome;
  }
  const t = topic as Record<string, unknown>;

  if (typeof t.id !== "string" || !t.id.trim()) addError("topic.id must be non-empty");
  if (typeof t.subjectId !== "string" || !t.subjectId.trim()) addError("topic.subjectId must be non-empty");
  if (typeof t.title_ar !== "string" || !t.title_ar.trim()) addError("topic.title_ar must be non-empty");
  if (typeof t.title_fr !== "string" || !t.title_fr.trim()) addError("topic.title_fr must be non-empty");
  if (typeof t.order !== "number") addError("topic.order must be a number");
  if (!VALID_SOURCE_TYPES.has(t.sourceType as ContentSourceType)) addError(`topic.sourceType invalid`);
  if (!VALID_RIGHTS_STATUSES.has(t.rightsStatus as ContentRightsStatus)) addError(`topic.rightsStatus invalid`);
  if (!VALID_VERIFICATION_STATUSES.has(t.verificationStatus as VerificationStatus)) addError(`topic.verificationStatus invalid`);
  if ("user_id" in t || "userId" in t) addError("Topic must not contain student user_id");

  return outcome;
}

/**
 * Validates Skill entity
 */
export function validateSkill(skill: unknown): ValidationOutcome {
  const { outcome, addError } = createOutcome();
  if (!skill || typeof skill !== "object") {
    addError("Skill must be a non-null object");
    return outcome;
  }
  const s = skill as Record<string, unknown>;

  if (typeof s.id !== "string" || !s.id.trim()) addError("skill.id must be non-empty");
  if (typeof s.topicId !== "string" || !s.topicId.trim()) addError("skill.topicId must be non-empty");
  if (typeof s.subjectId !== "string" || !s.subjectId.trim()) addError("skill.subjectId must be non-empty");
  if (typeof s.title_ar !== "string" || !s.title_ar.trim()) addError("skill.title_ar must be non-empty");
  if (typeof s.title_fr !== "string" || !s.title_fr.trim()) addError("skill.title_fr must be non-empty");
  if (typeof s.description_ar !== "string" || !s.description_ar.trim()) addError("skill.description_ar must be non-empty");
  if (typeof s.description_fr !== "string" || !s.description_fr.trim()) addError("skill.description_fr must be non-empty");
  if (!Array.isArray(s.prerequisites)) addError("skill.prerequisites must be an array");
  if (!VALID_DIFFICULTY_LEVELS.has(s.difficulty as number)) addError("skill.difficulty must be 1, 2, or 3");
  if (!Array.isArray(s.cognitiveDimensions) || s.cognitiveDimensions.length === 0) {
    addError("skill.cognitiveDimensions must be a non-empty array");
  } else {
    for (const dim of s.cognitiveDimensions) {
      if (!VALID_COGNITIVE_DIMENSIONS.has(dim as DiagnosticDimension)) {
        addError(`skill contains invalid cognitive dimension: ${String(dim)}`);
      }
    }
  }
  if (typeof s.repairStrategy_ar !== "string" || !s.repairStrategy_ar.trim()) addError("skill.repairStrategy_ar must be non-empty");
  if (typeof s.repairStrategy_fr !== "string" || !s.repairStrategy_fr.trim()) addError("skill.repairStrategy_fr must be non-empty");
  if (!Array.isArray(s.repairSteps_ar) || s.repairSteps_ar.length < 3) addError("skill.repairSteps_ar must have at least 3 steps");
  if (!Array.isArray(s.repairSteps_fr) || s.repairSteps_fr.length < 3) addError("skill.repairSteps_fr must have at least 3 steps");
  if (!VALID_SOURCE_TYPES.has(s.sourceType as ContentSourceType)) addError(`skill.sourceType invalid`);
  if (!VALID_RIGHTS_STATUSES.has(s.rightsStatus as ContentRightsStatus)) addError(`skill.rightsStatus invalid`);
  if (!VALID_VERIFICATION_STATUSES.has(s.verificationStatus as VerificationStatus)) addError(`skill.verificationStatus invalid`);
  if ("user_id" in s || "userId" in s) addError("Skill must not contain student user_id");

  return outcome;
}

/**
 * Validates PracticeQuestion or RetestQuestion entity
 */
export function validateQuestion(question: unknown): ValidationOutcome {
  const { outcome, addError } = createOutcome();
  if (!question || typeof question !== "object") {
    addError("Question must be a non-null object");
    return outcome;
  }
  const q = question as Record<string, unknown>;

  if (typeof q.id !== "string" || !q.id.trim()) addError("question.id must be non-empty");
  if (typeof q.skillId !== "string" || !q.skillId.trim()) addError("question.skillId must be non-empty");
  if (typeof q.subjectId !== "string" || !q.subjectId.trim()) addError("question.subjectId must be non-empty");
  if (!VALID_DIFFICULTY_LEVELS.has(q.difficulty as number)) addError("question.difficulty must be 1, 2, or 3");
  if (!VALID_QUESTION_TYPES.has(q.type as QuestionType)) addError(`question.type invalid: ${String(q.type)}`);
  if (!VALID_COGNITIVE_DIMENSIONS.has(q.dimension as DiagnosticDimension)) addError(`question.dimension invalid: ${String(q.dimension)}`);

  if (typeof q.prompt_ar !== "string" || !q.prompt_ar.trim()) addError("question.prompt_ar must be non-empty");
  if (typeof q.prompt_fr !== "string" || !q.prompt_fr.trim()) addError("question.prompt_fr must be non-empty");

  if (!Array.isArray(q.options) || q.options.length < 2) {
    addError("question.options must be an array with at least 2 options");
  } else {
    const opts = q.options as QuestionOption[];
    const optIds = new Set(opts.map((o) => o.id));
    if (optIds.size !== opts.length) addError("question options must have unique IDs");

    if (q.type === "mcq") {
      if (opts.length < 3 || opts.length > 4) addError("MCQ question must have 3 or 4 options");
      if (typeof q.correctAnswerId !== "string" || !optIds.has(q.correctAnswerId)) {
        addError(`correctAnswerId ${String(q.correctAnswerId)} not found in options`);
      }
    }

    // Check distractors error taxonomy
    for (const opt of opts) {
      if (opt.id !== q.correctAnswerId && opt.suspectedErrorType) {
        if (!VALID_ERROR_TAXONOMY.has(opt.suspectedErrorType)) {
          addError(`Option ${opt.id} distractor has invalid error type: ${opt.suspectedErrorType}`);
        }
      }
    }
  }

  if (typeof q.explanation_ar !== "string" || !q.explanation_ar.trim()) addError("question.explanation_ar must be non-empty");
  if (typeof q.explanation_fr !== "string" || !q.explanation_fr.trim()) addError("question.explanation_fr must be non-empty");

  // Check Retest linkage
  if (q.isRetestVariant === true) {
    if (typeof q.retestForQuestionId !== "string" || !q.retestForQuestionId.trim()) {
      addError("Retest question must define non-empty retestForQuestionId");
    }
    if (q.id === q.retestForQuestionId) {
      addError("Retest question ID must not equal parent question ID");
    }
  }

  if (!VALID_SOURCE_TYPES.has(q.sourceType as ContentSourceType)) addError(`question.sourceType invalid`);
  if (!VALID_RIGHTS_STATUSES.has(q.rightsStatus as ContentRightsStatus)) addError(`question.rightsStatus invalid`);
  if (!VALID_VERIFICATION_STATUSES.has(q.verificationStatus as VerificationStatus)) addError(`question.verificationStatus invalid`);
  if ("user_id" in q || "userId" in q) addError("Question must not contain student user_id");

  return outcome;
}
