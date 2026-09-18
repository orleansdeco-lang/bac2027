/**
 * BAC Mastery V2 — Canonical Content Relationship Contracts & Integrity Audits (Task 1.6)
 * 
 * INVARIANT:
 * Pure, deterministic relationship models and integrity auditors.
 * 
 * CRITICAL ARCHITECTURAL PRINCIPLE:
 * Prefer TRUTHFUL INCOMPLETENESS over FABRICATED COMPLETENESS.
 * A missing relationship is recorded as "missing" or "unavailable".
 * It is NEVER silently invented, inferred from keywords, or guessed.
 * 
 * Ontological Invariants:
 * - Topic != Skill
 * - Skill != Concept
 * - Skill != Misconception
 * - Error != Misconception
 * - Question != Evidence
 */

import {
  CanonicalStream,
  CanonicalSubject,
  Topic,
  CanonicalSkill,
  PedagogicalResource,
  SubjectId,
  StreamId,
} from "../curriculum";
import {
  SkillId,
  QuestionId,
  TopicId,
  ResourceId,
  toSkillId,
} from "../ids";
import { CanonicalQuestion } from "../assessment";

// =============================================================================
// 1. RELATIONSHIP STATUS & QUALITY CLASSIFICATIONS
// =============================================================================

export type RelationshipStatus =
  | "explicit"      // Authored directly on the entity (e.g. question.skillId)
  | "derived"       // Traversed through intermediate entity (e.g. resource -> skill -> topic)
  | "missing"       // Expected by domain schema but null/undefined
  | "conflicting"   // Contradictory links across catalogs
  | "unavailable";  // Pedagogical construct not yet authored in legacy records

export type RelationshipQuality =
  | "SAFE"          // Explicit, complete, referentially sound
  | "INCOMPLETE"    // Missing target or parent
  | "CONFLICTING"   // Inconsistent targets
  | "DUPLICATED"    // Redundant edges
  | "UNRESOLVED";   // Ambiguous provenance

export interface ContentRelationshipEdge<FromId = string, ToId = string> {
  fromId: FromId;
  fromType: "stream" | "subject" | "topic" | "skill" | "question" | "resource" | "concept" | "misconception";
  relationship: string;
  toId: ToId;
  toType: "stream" | "subject" | "topic" | "skill" | "question" | "resource" | "concept" | "misconception" | "rubric";
  status: RelationshipStatus;
  quality: RelationshipQuality;
  isDerived: boolean;
  notes?: string;
}

// =============================================================================
// 2. AUDIT MODELS
// =============================================================================

export interface PrerequisiteGraphAudit {
  totalPrerequisiteEdges: number;
  selfReferences: SkillId[];
  missingTargets: Array<{ fromSkillId: SkillId; missingTargetId: string }>;
  duplicateEdges: Array<{ fromSkillId: SkillId; targetSkillId: string }>;
  cycles: string[][];
  hasCycles: boolean;
  quality: RelationshipQuality;
}

export interface CurriculumHierarchyAudit {
  totalStreams: number;
  totalSubjects: number;
  totalTopics: number;
  totalSkills: number;
  streamSubjectEdges: number;
  orphanTopics: TopicId[];
  skillsWithoutRegisteredTopic: SkillId[];
  quality: RelationshipQuality;
}

export interface QuestionMappingAudit {
  totalQuestions: number;
  questionsWithExplicitSkill: number;
  questionsWithoutSkill: number;
  questionsWithRetestTwin: number;
  questionsWithExplicitMisconception: number;
  questionsWithRubric: number;
  questionsWithObjective: number;
  questionsWithConcept: number;
  skillCoverageRatio: number;
  quality: RelationshipQuality;
}

export interface ResourceMappingAudit {
  totalResources: number;
  resourcesWithExplicitSkill: number;
  resourcesWithExplicitTopic: number;
  resourcesWithDerivedTopic: number;
  resourcesWithObjective: number;
  resourcesWithConcept: number;
  quality: RelationshipQuality;
}

export interface FullRelationshipAuditReport {
  timestamp: string;
  hierarchy: CurriculumHierarchyAudit;
  prerequisites: PrerequisiteGraphAudit;
  questions: QuestionMappingAudit;
  resources: ResourceMappingAudit;
  overallQuality: RelationshipQuality;
}

// =============================================================================
// 3. PURE GRAPH AUDITORS
// =============================================================================

/**
 * Audits the prerequisite DAG across canonical skills.
 * Detects self-references, cycles, missing targets, and duplicate edges.
 * NEVER mutates or auto-repairs data.
 */
export function auditPrerequisiteGraph(skills: CanonicalSkill[]): PrerequisiteGraphAudit {
  const skillIdSet = new Set(skills.map((s) => s.id));
  const selfReferences: SkillId[] = [];
  const missingTargets: Array<{ fromSkillId: SkillId; missingTargetId: string }> = [];
  const duplicateEdges: Array<{ fromSkillId: SkillId; targetSkillId: string }> = [];
  let totalEdges = 0;

  const adj = new Map<string, string[]>();

  for (const skill of skills) {
    const rawPrereqs = skill.prerequisites || [];
    const seenForSkill = new Set<string>();
    const validNeighbors: string[] = [];

    for (const prereq of rawPrereqs) {
      totalEdges++;

      if (prereq === skill.id) {
        selfReferences.push(toSkillId(skill.id));
      }

      if (seenForSkill.has(prereq)) {
        duplicateEdges.push({ fromSkillId: toSkillId(skill.id), targetSkillId: prereq });
      } else {
        seenForSkill.add(prereq);
      }

      if (!skillIdSet.has(prereq)) {
        missingTargets.push({ fromSkillId: toSkillId(skill.id), missingTargetId: prereq });
      } else {
        validNeighbors.push(prereq);
      }
    }

    adj.set(skill.id, validNeighbors);
  }

  // Cycle Detection via standard 3-color DFS
  const cycles: string[][] = [];
  const visited = new Map<string, number>(); // 0: unvisited, 1: visiting, 2: visited
  const path: string[] = [];

  function dfs(curr: string) {
    visited.set(curr, 1);
    path.push(curr);
    const neighbors = adj.get(curr) || [];
    for (const n of neighbors) {
      const status = visited.get(n) || 0;
      if (status === 1) {
        const cycleStartIndex = path.indexOf(n);
        cycles.push(path.slice(cycleStartIndex).concat(n));
      } else if (status === 0) {
        dfs(n);
      }
    }
    path.pop();
    visited.set(curr, 2);
  }

  for (const s of skills) {
    if ((visited.get(s.id) || 0) === 0) {
      dfs(s.id);
    }
  }

  let quality: RelationshipQuality = "SAFE";
  if (cycles.length > 0 || selfReferences.length > 0) quality = "CONFLICTING";
  else if (missingTargets.length > 0) quality = "INCOMPLETE";
  else if (duplicateEdges.length > 0) quality = "DUPLICATED";

  return {
    totalPrerequisiteEdges: totalEdges,
    selfReferences,
    missingTargets,
    duplicateEdges,
    cycles,
    hasCycles: cycles.length > 0,
    quality,
  };
}

/**
 * Audits curriculum structural hierarchy: Stream -> Subject -> Topic -> Skill.
 */
export function auditCurriculumHierarchy(
  streams: CanonicalStream[],
  subjects: CanonicalSubject[],
  topics: Topic[],
  skills: CanonicalSkill[]
): CurriculumHierarchyAudit {
  const subjectIdSet = new Set(subjects.map((s) => s.id));
  const topicIdSet = new Set(topics.map((t) => t.id));

  let streamSubjectEdges = 0;
  for (const stream of streams) {
    streamSubjectEdges += stream.subjects.length;
  }

  const orphanTopics: TopicId[] = [];
  for (const topic of topics) {
    if (!subjectIdSet.has(topic.subjectId)) {
      orphanTopics.push(topic.id);
    }
  }

  const skillsWithoutRegisteredTopic: SkillId[] = [];
  for (const skill of skills) {
    if (!topicIdSet.has(skill.topicId as TopicId)) {
      skillsWithoutRegisteredTopic.push(toSkillId(skill.id));
    }
  }

  let quality: RelationshipQuality = "SAFE";
  if (orphanTopics.length > 0 || skillsWithoutRegisteredTopic.length > 0) {
    quality = "INCOMPLETE";
  }

  return {
    totalStreams: streams.length,
    totalSubjects: subjects.length,
    totalTopics: topics.length,
    totalSkills: skills.length,
    streamSubjectEdges,
    orphanTopics,
    skillsWithoutRegisteredTopic,
    quality,
  };
}

/**
 * Audits factual question relationship coverage.
 */
export function auditQuestionRelationships(questions: CanonicalQuestion[]): QuestionMappingAudit {
  let qWithExplicitSkill = 0;
  let qWithoutSkill = 0;
  let qRetestTwins = 0;
  let qWithMisconception = 0;
  let qWithRubric = 0;
  let qWithObjective = 0;
  let qWithConcept = 0;

  for (const q of questions) {
    if (q.skillId && q.skillId !== "skill_unmapped") {
      qWithExplicitSkill++;
    } else {
      qWithoutSkill++;
    }

    if (q.isRetestVariant && q.retestForQuestionId) {
      qRetestTwins++;
    }

    if (q.rubricId) {
      qWithRubric++;
    }

    const hasTrap = q.options?.some((opt) => Boolean(opt.misconceptionId));
    if (hasTrap) {
      qWithMisconception++;
    }

    if ((q as any).objectiveId || (q as any).objectiveIds) {
      qWithObjective++;
    }

    if ((q as any).conceptId || (q as any).conceptIds) {
      qWithConcept++;
    }
  }

  const coverage = questions.length > 0 ? qWithExplicitSkill / questions.length : 0;
  const quality: RelationshipQuality = qWithoutSkill > 0 ? "INCOMPLETE" : "SAFE";

  return {
    totalQuestions: questions.length,
    questionsWithExplicitSkill: qWithExplicitSkill,
    questionsWithoutSkill: qWithoutSkill,
    questionsWithRetestTwin: qRetestTwins,
    questionsWithExplicitMisconception: qWithMisconception,
    questionsWithRubric: qWithRubric,
    questionsWithObjective: qWithObjective,
    questionsWithConcept: qWithConcept,
    skillCoverageRatio: coverage,
    quality,
  };
}

/**
 * Audits pedagogical resource relationship coverage.
 */
export function auditResourceRelationships(
  resources: PedagogicalResource[],
  skills?: CanonicalSkill[]
): ResourceMappingAudit {
  const skillTopicMap = new Map<string, string>();
  if (skills) {
    for (const s of skills) {
      if (s.topicId) skillTopicMap.set(s.id, s.topicId);
    }
  }

  let resWithSkill = 0;
  let resWithExplicitTopic = 0;
  let resWithDerivedTopic = 0;
  let resWithObjective = 0;
  let resWithConcept = 0;

  for (const r of resources) {
    const hasSkill = Array.isArray(r.skillIds) && r.skillIds.length > 0;
    if (hasSkill) {
      resWithSkill++;
      // Check derived topic
      const firstSkillId = r.skillIds[0];
      if (skillTopicMap.has(firstSkillId)) {
        resWithDerivedTopic++;
      }
    }

    if ((r as any).topicId) {
      resWithExplicitTopic++;
    }

    if ((r as any).objectiveId) {
      resWithObjective++;
    }

    if ((r as any).conceptId) {
      resWithConcept++;
    }
  }

  const quality: RelationshipQuality = resWithSkill === resources.length ? "SAFE" : "INCOMPLETE";

  return {
    totalResources: resources.length,
    resourcesWithExplicitSkill: resWithSkill,
    resourcesWithExplicitTopic: resWithExplicitTopic,
    resourcesWithDerivedTopic: resWithDerivedTopic,
    resourcesWithObjective: resWithObjective,
    resourcesWithConcept: resWithConcept,
    quality,
  };
}
