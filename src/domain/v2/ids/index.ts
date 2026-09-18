/**
 * BAC Mastery V2 — Canonical Domain Identities
 * 
 * INVARIANT:
 * Stable, language-independent, branded identities for all 28 canonical domain entities.
 * These are domain-level contracts, distinct from database primary keys.
 */

declare const __brand: unique symbol;
export type Brand<T, B> = T & { readonly [__brand]: B };

export type StudentId = Brand<string, "StudentId">;
export type SkillId = Brand<string, "SkillId">;
export type QuestionId = Brand<string, "QuestionId">;
export type RubricId = Brand<string, "RubricId">;
export type AttemptId = Brand<string, "AttemptId">;
export type EvidenceId = Brand<string, "EvidenceId">;
export type ErrorEventId = Brand<string, "ErrorEventId">;
export type RetestId = Brand<string, "RetestId">;
export type MissionId = Brand<string, "MissionId">;
export type DecisionId = Brand<string, "DecisionId">;
export type ExamSessionId = Brand<string, "ExamSessionId">;
export type ExamAttemptId = Brand<string, "ExamAttemptId">;
export type GoalId = Brand<string, "GoalId">;
export type CurriculumVersionId = Brand<string, "CurriculumVersionId">;
export type DomainUnitId = Brand<string, "DomainUnitId">;
export type TopicId = Brand<string, "TopicId">;
export type LearningObjectiveId = Brand<string, "LearningObjectiveId">;
export type ConceptId = Brand<string, "ConceptId">;
export type MisconceptionId = Brand<string, "MisconceptionId">;
export type ResourceId = Brand<string, "ResourceId">;
export type RetentionScheduleId = Brand<string, "RetentionScheduleId">;

// --- Branded ID Constructors / Validators ---

export function toSkillId(raw: string): SkillId {
  if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(`[DomainV2:SkillId] Invalid skill ID string: "${raw}"`);
  }
  return raw.trim() as SkillId;
}

export function isSkillId(val: unknown): val is SkillId {
  return typeof val === "string" && val.trim().length > 0;
}

export function toQuestionId(raw: string): QuestionId {
  if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(`[DomainV2:QuestionId] Invalid question ID string: "${raw}"`);
  }
  return raw.trim() as QuestionId;
}

export function toStudentId(raw: string): StudentId {
  if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(`[DomainV2:StudentId] Invalid student ID string: "${raw}"`);
  }
  return raw.trim() as StudentId;
}

export function toMissionId(raw: string): MissionId {
  if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(`[DomainV2:MissionId] Invalid mission ID string: "${raw}"`);
  }
  return raw.trim() as MissionId;
}

export function toAttemptId(raw: string): AttemptId {
  if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(`[DomainV2:AttemptId] Invalid attempt ID string: "${raw}"`);
  }
  return raw.trim() as AttemptId;
}

export function toEvidenceId(raw: string): EvidenceId {
  if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(`[DomainV2:EvidenceId] Invalid evidence ID string: "${raw}"`);
  }
  return raw.trim() as EvidenceId;
}

export function toTopicId(raw: string): TopicId {
  if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(`[DomainV2:TopicId] Invalid topic ID string: "${raw}"`);
  }
  return raw.trim() as TopicId;
}

export function toResourceId(raw: string): ResourceId {
  if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(`[DomainV2:ResourceId] Invalid resource ID string: "${raw}"`);
  }
  return raw.trim() as ResourceId;
}

export function toRubricId(raw: string): RubricId {
  if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(`[DomainV2:RubricId] Invalid rubric ID string: "${raw}"`);
  }
  return raw.trim() as RubricId;
}

export function toConceptId(raw: string): ConceptId {
  if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(`[DomainV2:ConceptId] Invalid concept ID string: "${raw}"`);
  }
  return raw.trim() as ConceptId;
}

export function toMisconceptionId(raw: string): MisconceptionId {
  if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(`[DomainV2:MisconceptionId] Invalid misconception ID string: "${raw}"`);
  }
  return raw.trim() as MisconceptionId;
}

export function toLearningObjectiveId(raw: string): LearningObjectiveId {
  if (!raw || typeof raw !== "string" || raw.trim().length === 0) {
    throw new Error(`[DomainV2:LearningObjectiveId] Invalid learning objective ID string: "${raw}"`);
  }
  return raw.trim() as LearningObjectiveId;
}
