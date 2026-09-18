/**
 * BAC Mastery V2 — Canonical Content Registry (Task 1.5)
 * 
 * INVARIANT:
 * Pure in-memory architectural boundary exposing canonical content via read contracts.
 * 
 * Architectural Flow:
 *   CANONICAL CONTENT ──► CONTENT REGISTRY ──► PUBLISHED READ CONTRACT ──► RUNTIME CONSUMERS
 * 
 * Crucial Invariants:
 * 1. Read-only and side-effect free. Zero database writes, zero mutations, zero network/AI.
 * 2. ID-based reads only (SkillId, QuestionId, TopicId, SubjectId, etc.).
 * 3. Zero silent fallbacks: Unknown IDs return undefined; never fuzzy searches, never title lookups.
 * 4. Zero legacy fallbacks: Canonical queries NEVER silently search legacy catalogs.
 * 5. Lifecycle separation:
 *    - .governance: Exposes all publication envelopes (draft, in_review, validated, published, deprecated).
 *    - .published: Strictly exposes runtime-eligible published content only.
 * 6. Explicit compatibility: Legacy catalogs are isolated under .compatibility.
 * 7. Zero decision authority: Never computes priority, roadmap, mission, mastery, or student level.
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
  isRuntimeEligible,
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
  toSkillId,
  toQuestionId,
  toTopicId,
  toResourceId,
} from "../ids";
import {
  CanonicalQuestion,
  MinisterialRubric,
} from "../assessment";
import {
  AdapterResult,
  adaptLegacyCurriculum,
  adaptLegacySubject,
  adaptLegacyTopic,
  adaptLegacySkill,
  adaptLegacyQuestion,
  adaptLegacyResource,
} from "../adapters";
import {
  CanonicalContentReadContract,
  PublishedContentReadContract,
  LegacyCompatibilityReadContract,
  SkillReadFilter,
  QuestionReadFilter,
  ResourceReadFilter,
  TopicReadFilter,
} from "./read-contract";
import {
  auditContentDuplicates,
  DuplicateDiagnosticReport,
} from "./diagnostics";
import {
  CanonicalContentManifest,
  createCanonicalContentManifest,
} from "./manifest";

// Raw content imports from Git-tracked source of truth
import { ALGERIAN_BAC_STREAMS, ALL_SUBJECTS } from "@/lib/constants/streams";
import { CURRICULUM_TOPICS } from "@/data/curriculum/topics";
import { CANONICAL_SCIENCES_EXP_SKILLS } from "@/data/skills/canonical-sciences";
import { GESTION_ECO_SKILLS } from "@/data/skills/gestion-economie";
import { LETTRES_PHILO_SKILLS } from "@/data/skills/lettres-philo";
import { SCIENCES_EXP_SKILLS as LEGACY_INDEX_SKILLS } from "@/data/skills/index";
import { ALL_PRACTICE_QUESTIONS } from "@/data/curriculum";
import { PROMPT12_LESSONS } from "@/domain/content/lessons";
import { PROMPT12_REPAIR_GUIDES } from "@/domain/content/repair-guides";

export class CanonicalContentRegistry {
  private readonly streams = new Map<StreamId, ContentPublicationEnvelope<CanonicalStream>>();
  private readonly subjects = new Map<SubjectId, ContentPublicationEnvelope<CanonicalSubject>>();
  private readonly topics = new Map<TopicId, ContentPublicationEnvelope<Topic>>();
  private readonly skills = new Map<SkillId, ContentPublicationEnvelope<CanonicalSkill>>();
  private readonly questions = new Map<QuestionId, ContentPublicationEnvelope<CanonicalQuestion>>();
  private readonly rubrics = new Map<RubricId, ContentPublicationEnvelope<MinisterialRubric>>();
  private readonly resources = new Map<ResourceId, ContentPublicationEnvelope<PedagogicalResource>>();
  private readonly misconceptions = new Map<MisconceptionId, ContentPublicationEnvelope<Misconception>>();
  private readonly concepts = new Map<ConceptId, ContentPublicationEnvelope<Concept>>();
  private readonly objectives = new Map<LearningObjectiveId, ContentPublicationEnvelope<CanonicalLearningObjective>>();

  // Isolated legacy compatibility store (NEVER accessed as fallback by canonical lookups)
  private readonly legacySkills = new Map<string, AdapterResult<CanonicalSkill>>();

  // ===========================================================================
  // REGISTRATION API (AUTHORING / INGESTION INTO REGISTRY)
  // ===========================================================================

  public registerStream(envelope: ContentPublicationEnvelope<CanonicalStream>): void {
    this.streams.set(envelope.entity.id, envelope);
  }

  public registerSubject(envelope: ContentPublicationEnvelope<CanonicalSubject>): void {
    this.subjects.set(envelope.entity.id, envelope);
  }

  public registerTopic(envelope: ContentPublicationEnvelope<Topic>): void {
    this.topics.set(envelope.entity.id, envelope);
  }

  public registerSkill(envelope: ContentPublicationEnvelope<CanonicalSkill>): void {
    this.skills.set(toSkillId(envelope.entity.id), envelope);
  }

  public registerQuestion(envelope: ContentPublicationEnvelope<CanonicalQuestion>): void {
    this.questions.set(envelope.entity.id, envelope);
  }

  public registerRubric(envelope: ContentPublicationEnvelope<MinisterialRubric>): void {
    this.rubrics.set(envelope.entity.id, envelope);
  }

  public registerResource(envelope: ContentPublicationEnvelope<PedagogicalResource>): void {
    this.resources.set(envelope.entity.id, envelope);
  }

  public registerMisconception(envelope: ContentPublicationEnvelope<Misconception>): void {
    this.misconceptions.set(envelope.entity.id, envelope);
  }

  public registerConcept(envelope: ContentPublicationEnvelope<Concept>): void {
    this.concepts.set(envelope.entity.id, envelope);
  }

  public registerObjective(envelope: ContentPublicationEnvelope<CanonicalLearningObjective>): void {
    this.objectives.set(envelope.entity.id, envelope);
  }

  public registerLegacySkill(legacyId: string, result: AdapterResult<CanonicalSkill>): void {
    this.legacySkills.set(legacyId, result);
  }

  // ===========================================================================
  // 1. GOVERNANCE READ CONTRACT (.governance)
  // ===========================================================================

  public readonly governance: CanonicalContentReadContract = {
    getStream: (id: StreamId) => this.streams.get(id),
    getSubject: (id: SubjectId) => this.subjects.get(id),
    getTopic: (id: TopicId) => this.topics.get(id),
    getSkill: (id: SkillId) => this.skills.get(id),
    getQuestion: (id: QuestionId) => this.questions.get(id),
    getRubric: (id: RubricId) => this.rubrics.get(id),
    getResource: (id: ResourceId) => this.resources.get(id),
    getMisconception: (id: MisconceptionId) => this.misconceptions.get(id),
    getConcept: (id: ConceptId) => this.concepts.get(id),
    getObjective: (id: LearningObjectiveId) => this.objectives.get(id),

    listStreams: () => Array.from(this.streams.values()),
    listSubjects: (streamId?: StreamId) => {
      const all = Array.from(this.subjects.values());
      if (!streamId) return all;
      const stream = this.streams.get(streamId);
      if (!stream) return [];
      const subjectIds = new Set(stream.entity.subjects.map((s) => s.subjectId));
      return all.filter((s) => subjectIds.has(s.entity.id));
    },
    listTopics: (filter?: TopicReadFilter) => {
      let all = Array.from(this.topics.values());
      if (filter?.subjectId) {
        all = all.filter((t) => t.entity.subjectId === filter.subjectId);
      }
      return all;
    },
    listSkills: (filter?: SkillReadFilter) => {
      let all = Array.from(this.skills.values());
      if (filter?.subjectId) {
        all = all.filter((s) => s.entity.subjectId === filter.subjectId);
      }
      if (filter?.streamId) {
        all = all.filter((s) => s.entity.streamId === filter.streamId);
      }
      if (filter?.topicId) {
        all = all.filter((s) => s.entity.topicId === filter.topicId);
      }
      return all;
    },
    listQuestions: (filter?: QuestionReadFilter) => {
      let all = Array.from(this.questions.values());
      const targetSkillId = filter?.skillId;
      if (targetSkillId) {
        all = all.filter((q) => q.entity.skillId === targetSkillId || q.entity.skillIds?.includes(targetSkillId));
      }
      if (filter?.subjectId) {
        all = all.filter((q) => q.entity.subjectId === filter.subjectId);
      }
      if (filter?.streamId) {
        all = all.filter((q) => q.entity.streamId === filter.streamId);
      }
      if (typeof filter?.isRetestVariant === "boolean") {
        all = all.filter((q) => Boolean(q.entity.isRetestVariant) === filter.isRetestVariant);
      }
      if (filter?.format) {
        all = all.filter((q) => q.entity.format === filter.format);
      }
      if (filter?.difficulty) {
        all = all.filter((q) => q.entity.difficulty === filter.difficulty);
      }
      return all;
    },
    listResources: (filter?: ResourceReadFilter) => {
      let all = Array.from(this.resources.values());
      if (filter?.skillId) {
        all = all.filter((r) => r.entity.skillIds.includes(filter.skillId!));
      }
      if (filter?.type) {
        all = all.filter((r) => r.entity.type === filter.type);
      }
      return all;
    },
  };

  // ===========================================================================
  // 2. PUBLISHED RUNTIME READ CONTRACT (.published)
  // ===========================================================================

  public readonly published: PublishedContentReadContract = {
    getStream: (id: StreamId): CanonicalStream | undefined => {
      const env = this.streams.get(id);
      if (!env || !isRuntimeEligible(env.lifecycleStatus, env.sourceKind)) return undefined;
      return env.entity;
    },
    getSubject: (id: SubjectId): CanonicalSubject | undefined => {
      const env = this.subjects.get(id);
      if (!env || !isRuntimeEligible(env.lifecycleStatus, env.sourceKind)) return undefined;
      return env.entity;
    },
    getTopic: (id: TopicId): Topic | undefined => {
      const env = this.topics.get(id);
      if (!env || !isRuntimeEligible(env.lifecycleStatus, env.sourceKind)) return undefined;
      return env.entity;
    },
    getSkill: (id: SkillId): CanonicalSkill | undefined => {
      const env = this.skills.get(id);
      if (!env || !isRuntimeEligible(env.lifecycleStatus, env.sourceKind)) return undefined;
      return env.entity;
    },
    getQuestion: (id: QuestionId): CanonicalQuestion | undefined => {
      const env = this.questions.get(id);
      if (!env || !isRuntimeEligible(env.lifecycleStatus, env.sourceKind)) return undefined;
      return env.entity;
    },
    getRubric: (id: RubricId): MinisterialRubric | undefined => {
      const env = this.rubrics.get(id);
      if (!env || !isRuntimeEligible(env.lifecycleStatus, env.sourceKind)) return undefined;
      return env.entity;
    },
    getResource: (id: ResourceId): PedagogicalResource | undefined => {
      const env = this.resources.get(id);
      if (!env || !isRuntimeEligible(env.lifecycleStatus, env.sourceKind)) return undefined;
      return env.entity;
    },
    getMisconception: (id: MisconceptionId): Misconception | undefined => {
      const env = this.misconceptions.get(id);
      if (!env || !isRuntimeEligible(env.lifecycleStatus, env.sourceKind)) return undefined;
      return env.entity;
    },
    getConcept: (id: ConceptId): Concept | undefined => {
      const env = this.concepts.get(id);
      if (!env || !isRuntimeEligible(env.lifecycleStatus, env.sourceKind)) return undefined;
      return env.entity;
    },
    getObjective: (id: LearningObjectiveId): CanonicalLearningObjective | undefined => {
      const env = this.objectives.get(id);
      if (!env || !isRuntimeEligible(env.lifecycleStatus, env.sourceKind)) return undefined;
      return env.entity;
    },

    listStreams: (): CanonicalStream[] => {
      return this.governance
        .listStreams()
        .filter((e) => isRuntimeEligible(e.lifecycleStatus, e.sourceKind))
        .map((e) => e.entity);
    },
    listSubjects: (streamId?: StreamId): CanonicalSubject[] => {
      return this.governance
        .listSubjects(streamId)
        .filter((e) => isRuntimeEligible(e.lifecycleStatus, e.sourceKind))
        .map((e) => e.entity);
    },
    listTopics: (filter?: TopicReadFilter): Topic[] => {
      return this.governance
        .listTopics(filter)
        .filter((e) => isRuntimeEligible(e.lifecycleStatus, e.sourceKind))
        .map((e) => e.entity);
    },
    listSkills: (filter?: SkillReadFilter): CanonicalSkill[] => {
      return this.governance
        .listSkills(filter)
        .filter((e) => isRuntimeEligible(e.lifecycleStatus, e.sourceKind))
        .map((e) => e.entity);
    },
    listQuestions: (filter?: QuestionReadFilter): CanonicalQuestion[] => {
      return this.governance
        .listQuestions(filter)
        .filter((e) => isRuntimeEligible(e.lifecycleStatus, e.sourceKind))
        .map((e) => e.entity);
    },
    listResources: (filter?: ResourceReadFilter): PedagogicalResource[] => {
      return this.governance
        .listResources(filter)
        .filter((e) => isRuntimeEligible(e.lifecycleStatus, e.sourceKind))
        .map((e) => e.entity);
    },
  };

  // ===========================================================================
  // 3. ISOLATED LEGACY COMPATIBILITY READ CONTRACT (.compatibility)
  // ===========================================================================

  public readonly compatibility: LegacyCompatibilityReadContract = {
    getLegacySkill: (legacyId: string): AdapterResult<CanonicalSkill> | undefined => {
      return this.legacySkills.get(legacyId);
    },
    listLegacySkills: (): AdapterResult<CanonicalSkill>[] => {
      return Array.from(this.legacySkills.values());
    },
  };

  // ===========================================================================
  // 4. DIAGNOSTICS & AUDIT
  // ===========================================================================

  public getDiagnostics(): DuplicateDiagnosticReport {
    const canonicalSkills = Array.from(this.skills.values()).map((e) => ({
      id: e.entity.id,
      title_ar: e.entity.title_ar,
      title_fr: e.entity.title_fr,
    }));
    const legacySkills = Array.from(this.legacySkills.values()).map((r) => ({
      id: r.value.id,
      title_ar: r.value.title_ar,
      title_fr: r.value.title_fr,
    }));
    const questions = Array.from(this.questions.values()).map((e) => ({
      id: e.entity.id,
      title_ar: e.entity.prompt_ar,
      title_fr: e.entity.prompt_fr,
    }));

    return auditContentDuplicates([
      { catalogName: "canonical_skills", entityType: "skill", items: canonicalSkills },
      { catalogName: "legacy_skills_index", entityType: "skill", items: legacySkills },
      { catalogName: "canonical_questions", entityType: "question", items: questions },
    ]);
  }

  public getManifest(): CanonicalContentManifest {
    return createCanonicalContentManifest({
      totalStreams: this.streams.size,
      totalSubjects: this.subjects.size,
      totalTopics: this.topics.size,
      totalCanonicalSkills: this.skills.size,
      totalQuestions: this.questions.size,
      totalResources: this.resources.size,
    });
  }
}

// =============================================================================
// DEFAULT FACTORY (POPULATES REGISTRY FROM CANONICAL GIT DECLARATIONS)
// =============================================================================

export function createCanonicalContentRegistry(): CanonicalContentRegistry {
  return new CanonicalContentRegistry();
}

/**
 * Creates and populates the default in-memory registry using the ratified Git-tracked content.
 * 
 * INVARIANT:
 * Zero DB queries. Pure synchronous instantiation.
 */
export function createDefaultCanonicalRegistry(): CanonicalContentRegistry {
  const registry = new CanonicalContentRegistry();

  // 1. Streams
  for (const stream of Object.values(ALGERIAN_BAC_STREAMS)) {
    const adapted = adaptLegacyCurriculum({ ...stream, streamId: stream.id });
    registry.registerStream({
      entity: adapted.value,
      sourceKind: "canonical_git_declaration",
      lifecycleStatus: "published",
      version: 1,
      isRuntimeEligible: true,
      governanceNotes: "Official syllabus stream baseline (Decision MEN 10 Sept 2026).",
    });
  }

  // 2. Subjects
  for (const subject of Object.values(ALL_SUBJECTS)) {
    const adapted = adaptLegacySubject(subject);
    registry.registerSubject({
      entity: adapted.value,
      sourceKind: "canonical_git_declaration",
      lifecycleStatus: "published",
      version: 1,
      isRuntimeEligible: true,
      governanceNotes: "National curriculum subject declaration.",
    });
  }

  // 3. Topics
  const allCanonicalSkillsList = [
    ...Object.values(CANONICAL_SCIENCES_EXP_SKILLS),
    ...Object.values(GESTION_ECO_SKILLS),
    ...Object.values(LETTRES_PHILO_SKILLS),
  ];

  for (const topic of CURRICULUM_TOPICS) {
    const associatedSkillIds = allCanonicalSkillsList
      .filter((s) => s.topicId === topic.id)
      .map((s) => s.id);
    const adapted = adaptLegacyTopic(topic, { associatedSkillIds });
    registry.registerTopic({
      entity: adapted.value,
      sourceKind: "canonical_git_declaration",
      lifecycleStatus: "published",
      version: 1,
      isRuntimeEligible: true,
      governanceNotes: "Thematic chapter module from official syllabus.",
    });
  }

  // 4. Canonical Skills (Sciences Expérimentales)
  for (const skill of Object.values(CANONICAL_SCIENCES_EXP_SKILLS)) {
    const adapted = adaptLegacySkill(skill);
    registry.registerSkill({
      entity: adapted.value,
      sourceKind: "canonical_git_declaration",
      lifecycleStatus: "published",
      version: 1,
      isRuntimeEligible: true,
      governanceNotes: "Authoritative 3AS Sciences Expérimentales competence.",
    });
  }

  // 5. Canonical Skills (Gestion & Économie)
  for (const skill of Object.values(GESTION_ECO_SKILLS)) {
    const adapted = adaptLegacySkill(skill);
    registry.registerSkill({
      entity: adapted.value,
      sourceKind: "canonical_git_declaration",
      lifecycleStatus: "published",
      version: 1,
      isRuntimeEligible: true,
      governanceNotes: "Authoritative 3AS Gestion & Économie competence.",
    });
  }

  // 6. Canonical Skills (Lettres & Philosophie)
  for (const skill of Object.values(LETTRES_PHILO_SKILLS)) {
    const adapted = adaptLegacySkill(skill);
    registry.registerSkill({
      entity: adapted.value,
      sourceKind: "canonical_git_declaration",
      lifecycleStatus: "published",
      version: 1,
      isRuntimeEligible: true,
      governanceNotes: "Authoritative 3AS Lettres & Philosophie competence.",
    });
  }

  // 7. Practice & Retest Questions
  for (const pq of ALL_PRACTICE_QUESTIONS) {
    const adapted = adaptLegacyQuestion(pq);
    registry.registerQuestion({
      entity: adapted.value,
      sourceKind: "canonical_git_declaration",
      lifecycleStatus: "published",
      version: pq.version || 1,
      isRuntimeEligible: true,
      governanceNotes: pq.isRetestVariant ? "Unseen twin retest variant item." : "Formative practice assessment item.",
    });
  }

  // 8. Learning Resources & Repair Guides
  for (const lesson of PROMPT12_LESSONS) {
    const adapted = adaptLegacyResource(lesson as any);
    registry.registerResource({
      entity: adapted.value,
      sourceKind: "canonical_git_declaration",
      lifecycleStatus: "published",
      version: 1,
      isRuntimeEligible: true,
      governanceNotes: "High-yield active lesson card.",
    });
  }

  for (const guide of PROMPT12_REPAIR_GUIDES) {
    const adapted = adaptLegacyResource(guide as any);
    registry.registerResource({
      entity: adapted.value,
      sourceKind: "canonical_git_declaration",
      lifecycleStatus: "published",
      version: 1,
      isRuntimeEligible: true,
      governanceNotes: "Targeted error remediation protocol.",
    });
  }

  // 9. Legacy Skills Catalog (src/data/skills/index.ts) -> COMPATIBILITY STORE ONLY
  for (const [legacyId, legacySkill] of Object.entries(LEGACY_INDEX_SKILLS)) {
    const adapted = adaptLegacySkill(legacySkill);
    registry.registerLegacySkill(legacyId, adapted);
  }

  return registry;
}
