/**
 * BAC Mastery V2 — Canonical Content Read Contract (Task 1.5)
 * 
 * INVARIANT:
 * Pure read-only contracts establishing a controlled architectural boundary:
 * 
 *   CANONICAL CONTENT ──► CONTENT REGISTRY ──► PUBLISHED READ CONTRACT ──► RUNTIME CONSUMERS
 * 
 * 1. Governance Read Contract: Exposes full publication envelopes with lifecycle tracking.
 * 2. Published Runtime Read Contract: Exposes unwrapped entities, strictly filtered to published runtime-eligible items.
 * 3. Legacy Compatibility Read Contract: Explicitly isolated compatibility lookups; NEVER silent fallbacks.
 * 
 * Invariants:
 * - Reads use typed canonical IDs (SkillId, QuestionId, etc.); never UI labels, text slugs, or array indices.
 * - Missing or unknown IDs return undefined; zero fuzzy fallbacks or inferred replacements.
 * - Zero decision authority: answers "What is this content?", never "What should student do next?".
 * - Zero mutations, zero database writes, zero side-effects.
 */

import {
  StreamId,
  SubjectId,
  CanonicalStream,
  CanonicalSubject,
  Topic,
  CanonicalSkill,
  CanonicalLearningObjective,
  Concept,
  Misconception,
  PedagogicalResource,
  ContentPublicationEnvelope,
} from "../curriculum";
import {
  QuestionId,
  SkillId,
  TopicId,
  ResourceId,
  RubricId,
  ConceptId,
  MisconceptionId,
  LearningObjectiveId,
} from "../ids";
import {
  CanonicalQuestion,
  MinisterialRubric,
  QuestionFormat,
} from "../assessment";
import { AdapterResult } from "../adapters";

// =============================================================================
// 1. READ FILTERS (SAFE COLLECTION PREDICATES)
// =============================================================================

export interface SkillReadFilter {
  subjectId?: SubjectId;
  streamId?: StreamId;
  topicId?: TopicId | string;
}

export interface QuestionReadFilter {
  skillId?: SkillId;
  subjectId?: SubjectId;
  streamId?: StreamId;
  isRetestVariant?: boolean;
  format?: QuestionFormat;
  difficulty?: 1 | 2 | 3;
}

export interface ResourceReadFilter {
  skillId?: SkillId;
  type?: PedagogicalResource["type"];
}

export interface TopicReadFilter {
  subjectId?: SubjectId;
}

// =============================================================================
// 2. GOVERNANCE READ CONTRACT (FULL ENVELOPES & LIFECYCLE AUDIT)
// =============================================================================

/**
 * Full access for governance, audit, and quality pipelines.
 * Returns entities wrapped in ContentPublicationEnvelope<T> containing
 * lifecycleStatus (draft | in_review | validated | published | deprecated)
 * and sourceKind.
 */
export interface CanonicalContentReadContract {
  getStream(id: StreamId): ContentPublicationEnvelope<CanonicalStream> | undefined;
  getSubject(id: SubjectId): ContentPublicationEnvelope<CanonicalSubject> | undefined;
  getTopic(id: TopicId): ContentPublicationEnvelope<Topic> | undefined;
  getSkill(id: SkillId): ContentPublicationEnvelope<CanonicalSkill> | undefined;
  getQuestion(id: QuestionId): ContentPublicationEnvelope<CanonicalQuestion> | undefined;
  getRubric(id: RubricId): ContentPublicationEnvelope<MinisterialRubric> | undefined;
  getResource(id: ResourceId): ContentPublicationEnvelope<PedagogicalResource> | undefined;
  getMisconception(id: MisconceptionId): ContentPublicationEnvelope<Misconception> | undefined;
  getConcept(id: ConceptId): ContentPublicationEnvelope<Concept> | undefined;
  getObjective(id: LearningObjectiveId): ContentPublicationEnvelope<CanonicalLearningObjective> | undefined;

  listStreams(): ContentPublicationEnvelope<CanonicalStream>[];
  listSubjects(streamId?: StreamId): ContentPublicationEnvelope<CanonicalSubject>[];
  listTopics(filter?: TopicReadFilter): ContentPublicationEnvelope<Topic>[];
  listSkills(filter?: SkillReadFilter): ContentPublicationEnvelope<CanonicalSkill>[];
  listQuestions(filter?: QuestionReadFilter): ContentPublicationEnvelope<CanonicalQuestion>[];
  listResources(filter?: ResourceReadFilter): ContentPublicationEnvelope<PedagogicalResource>[];
}

// =============================================================================
// 3. PUBLISHED RUNTIME READ CONTRACT (UNWRAPPED RUNTIME-ELIGIBLE ENTITIES)
// =============================================================================

/**
 * Strict runtime access for Practice Runners, Exam Engines, and Diagnostic Engines.
 * 
 * CRITICAL INVARIANT:
 * ONLY returns entities where isRuntimeEligible(status, sourceKind) is true!
 * Draft, in_review, and deprecated entities are strictly quarantined (return undefined).
 */
export interface PublishedContentReadContract {
  getStream(id: StreamId): CanonicalStream | undefined;
  getSubject(id: SubjectId): CanonicalSubject | undefined;
  getTopic(id: TopicId): Topic | undefined;
  getSkill(id: SkillId): CanonicalSkill | undefined;
  getQuestion(id: QuestionId): CanonicalQuestion | undefined;
  getRubric(id: RubricId): MinisterialRubric | undefined;
  getResource(id: ResourceId): PedagogicalResource | undefined;
  getMisconception(id: MisconceptionId): Misconception | undefined;
  getConcept(id: ConceptId): Concept | undefined;
  getObjective(id: LearningObjectiveId): CanonicalLearningObjective | undefined;

  listStreams(): CanonicalStream[];
  listSubjects(streamId?: StreamId): CanonicalSubject[];
  listTopics(filter?: TopicReadFilter): Topic[];
  listSkills(filter?: SkillReadFilter): CanonicalSkill[];
  listQuestions(filter?: QuestionReadFilter): CanonicalQuestion[];
  listResources(filter?: ResourceReadFilter): PedagogicalResource[];
}

// =============================================================================
// 4. EXPLICIT LEGACY COMPATIBILITY READ CONTRACT
// =============================================================================

/**
 * Isolated bridge for accessing legacy catalogs (e.g. src/data/skills/index.ts).
 * 
 * CRITICAL INVARIANT:
 * Never called as a fallback by CanonicalContentReadContract or PublishedContentReadContract.
 * Must be invoked explicitly by legacy migration scripts or verification tests.
 */
export interface LegacyCompatibilityReadContract {
  getLegacySkill(legacyId: string): AdapterResult<CanonicalSkill> | undefined;
  listLegacySkills(): AdapterResult<CanonicalSkill>[];
}
