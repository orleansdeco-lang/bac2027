/**
 * BAC Mastery — Content & Knowledge Architecture Validation Engine
 * Prompt 11: Content Quality Rules & Integrity Suite
 * 
 * Enforces the 12 Content Quality Rules:
 * - Rule 1: Content Purity (Zero User ID)
 * - Rule 2: Subject-Topic-Skill Hierarchy Integrity
 * - Rule 3: Prerequisite DAG Integrity (No cycles, no self-references, valid targets)
 * - Rule 4: Bilingual Completeness (Arabic & French parity)
 * - Rule 5: Learning Objective Alignment (Bloom taxonomy)
 * - Rule 6: Provenance & Verification Tracking (Source, Rights, Verification Status)
 * - Rule 7: Official Curriculum Facts Integrity (Strict verification, no invented facts)
 * - Rule 8: Rights & Copyright Integrity (Original vs Citation separation)
 * - Rule 9: Question Quality & Single Correct Answer (MCQ structure)
 * - Rule 10: Error Lab Distractor Alignment (Taxonomy mapping)
 * - Rule 11: Unseen Retest Guarantee (Twin problem separation)
 * - Rule 12: Remediation Guide Completeness (Multi-step repair guides)
 */

import {
  Curriculum,
  Subject,
  Topic,
  Skill,
  LearningObjective,
  PracticeQuestion,
  RetestQuestion,
  PastBacExamReference,
  ContentSource,
  VerificationRecord,
  Resource,
} from "./types";
import {
  VALID_VERIFICATION_STATUSES,
  VALID_SOURCE_TYPES,
  VALID_RIGHTS_STATUSES,
  VALID_COGNITIVE_DIMENSIONS,
  VALID_ERROR_TAXONOMY,
  VALID_DIFFICULTY_LEVELS,
} from "./schemas";

export interface ContentDataset {
  curriculum: Curriculum;
  subjects: Subject[];
  topics: Topic[];
  skills: Skill[];
  learningObjectives?: LearningObjective[];
  practiceQuestions: PracticeQuestion[];
  retestQuestions: RetestQuestion[];
  pastBacExamReferences?: PastBacExamReference[];
  sources?: ContentSource[];
  verificationRecords?: VerificationRecord[];
  resources?: Resource[];
}

export interface RuleViolation {
  ruleNumber: number;
  ruleName: string;
  entityType: string;
  entityId: string;
  message: string;
}

export interface ContentValidationReport {
  isValid: boolean;
  totalEntitiesChecked: number;
  violations: RuleViolation[];
  summary: {
    ruleViolationsCount: Record<number, number>;
    passedRules: number[];
    failedRules: number[];
  };
}

/**
 * Validates the complete content architecture dataset against the 12 Content Quality Rules
 */
export function validateContentArchitecture(dataset: ContentDataset): ContentValidationReport {
  const violations: RuleViolation[] = [];
  let totalEntitiesChecked = 0;

  function addViolation(
    ruleNumber: number,
    ruleName: string,
    entityType: string,
    entityId: string,
    message: string
  ) {
    violations.push({ ruleNumber, ruleName, entityType, entityId, message });
  }

  // ==========================================================================
  // RULE 1: CONTENT PURITY (ZERO USER_ID)
  // All content entities must be strictly global and student-agnostic.
  // ==========================================================================
  const allEntities: Array<{ type: string; entity: Record<string, unknown> }> = [
    { type: "curriculum", entity: dataset.curriculum as unknown as Record<string, unknown> },
    ...dataset.subjects.map((s) => ({ type: "subject", entity: s as unknown as Record<string, unknown> })),
    ...dataset.topics.map((t) => ({ type: "topic", entity: t as unknown as Record<string, unknown> })),
    ...dataset.skills.map((sk) => ({ type: "skill", entity: sk as unknown as Record<string, unknown> })),
    ...(dataset.learningObjectives || []).map((lo) => ({ type: "learningObjective", entity: lo as unknown as Record<string, unknown> })),
    ...dataset.practiceQuestions.map((pq) => ({ type: "practiceQuestion", entity: pq as unknown as Record<string, unknown> })),
    ...dataset.retestQuestions.map((rq) => ({ type: "retestQuestion", entity: rq as unknown as Record<string, unknown> })),
    ...(dataset.pastBacExamReferences || []).map((pbr) => ({ type: "pastBacExamReference", entity: pbr as unknown as Record<string, unknown> })),
    ...(dataset.resources || []).map((r) => ({ type: "resource", entity: r as unknown as Record<string, unknown> })),
  ];

  totalEntitiesChecked += allEntities.length;

  for (const { type, entity } of allEntities) {
    const id = String(entity.id || "unknown");
    if ("user_id" in entity || "userId" in entity || "student_id" in entity || "studentId" in entity) {
      addViolation(1, "Content Purity (Zero User ID)", type, id, `Content entity contains student ownership identifier`);
    }
  }

  // ==========================================================================
  // RULE 2: SUBJECT-TOPIC-SKILL HIERARCHY INTEGRITY
  // Every skill belongs to a topic; topic belongs to subject; subject belongs to curriculum.
  // ==========================================================================
  const subjectMap = new Map(dataset.subjects.map((s) => [s.id, s]));
  const topicMap = new Map(dataset.topics.map((t) => [t.id, t]));
  const skillMap = new Map(dataset.skills.map((s) => [s.id, s]));

  for (const topic of dataset.topics) {
    if (!subjectMap.has(topic.subjectId)) {
      addViolation(2, "Hierarchy Integrity", "topic", topic.id, `References non-existent subjectId: ${topic.subjectId}`);
    }
    if (topic.curriculumId !== dataset.curriculum.id) {
      addViolation(2, "Hierarchy Integrity", "topic", topic.id, `curriculumId does not match root curriculum: ${topic.curriculumId}`);
    }
  }

  for (const skill of dataset.skills) {
    const parentTopic = topicMap.get(skill.topicId);
    if (!parentTopic) {
      addViolation(2, "Hierarchy Integrity", "skill", skill.id, `References non-existent topicId: ${skill.topicId}`);
    } else {
      if (skill.subjectId !== parentTopic.subjectId) {
        addViolation(2, "Hierarchy Integrity", "skill", skill.id, `subjectId (${skill.subjectId}) does not match topic subjectId (${parentTopic.subjectId})`);
      }
      if (skill.streamId !== parentTopic.streamId) {
        addViolation(2, "Hierarchy Integrity", "skill", skill.id, `streamId (${skill.streamId}) does not match topic streamId (${parentTopic.streamId})`);
      }
    }
  }

  // ==========================================================================
  // RULE 3: PREREQUISITE DAG INTEGRITY (NO CYCLES, NO SELF-REFS)
  // Prerequisite graph must be a valid Directed Acyclic Graph.
  // ==========================================================================
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function checkCycle(skillId: string, path: string[] = []) {
    visited.add(skillId);
    recursionStack.add(skillId);

    const skill = skillMap.get(skillId);
    if (skill && skill.prerequisites) {
      for (const prereqId of skill.prerequisites) {
        if (!skillMap.has(prereqId)) {
          addViolation(3, "Prerequisite DAG Integrity", "skill", skillId, `Prerequisite ID ${prereqId} does not exist`);
        }
        if (prereqId === skillId) {
          addViolation(3, "Prerequisite DAG Integrity", "skill", skillId, `Skill cannot have itself as prerequisite`);
        }
        if (!visited.has(prereqId)) {
          checkCycle(prereqId, [...path, skillId]);
        } else if (recursionStack.has(prereqId)) {
          addViolation(3, "Prerequisite DAG Integrity", "skill", skillId, `Circular prerequisite dependency detected: ${[...path, skillId, prereqId].join(" -> ")}`);
        }
      }
    }

    recursionStack.delete(skillId);
  }

  for (const skill of dataset.skills) {
    if (!visited.has(skill.id)) {
      checkCycle(skill.id);
    }
  }

  // ==========================================================================
  // RULE 4: BILINGUAL COMPLETENESS (AR & FR)
  // Every user-facing content entity must have Arabic and French representations.
  // ==========================================================================
  for (const topic of dataset.topics) {
    if (!topic.title_ar?.trim() || topic.title_ar.trim().length < 3) {
      addViolation(4, "Bilingual Completeness", "topic", topic.id, `Missing or too short title_ar`);
    }
    if (!topic.title_fr?.trim() || topic.title_fr.trim().length < 3) {
      addViolation(4, "Bilingual Completeness", "topic", topic.id, `Missing or too short title_fr`);
    }
  }

  for (const skill of dataset.skills) {
    if (!skill.title_ar?.trim() || skill.title_ar.trim().length < 3) {
      addViolation(4, "Bilingual Completeness", "skill", skill.id, `Missing or too short title_ar`);
    }
    if (!skill.title_fr?.trim() || skill.title_fr.trim().length < 3) {
      addViolation(4, "Bilingual Completeness", "skill", skill.id, `Missing or too short title_fr`);
    }
    if (!skill.description_ar?.trim() || skill.description_ar.trim().length < 5) {
      addViolation(4, "Bilingual Completeness", "skill", skill.id, `Missing or too short description_ar`);
    }
    if (!skill.description_fr?.trim() || skill.description_fr.trim().length < 5) {
      addViolation(4, "Bilingual Completeness", "skill", skill.id, `Missing or too short description_fr`);
    }
  }

  for (const q of [...dataset.practiceQuestions, ...dataset.retestQuestions]) {
    if (!q.prompt_ar?.trim() || q.prompt_ar.trim().length < 5) {
      addViolation(4, "Bilingual Completeness", "question", q.id, `Missing or too short prompt_ar`);
    }
    if (!q.prompt_fr?.trim() || q.prompt_fr.trim().length < 5) {
      addViolation(4, "Bilingual Completeness", "question", q.id, `Missing or too short prompt_fr`);
    }
    if (!q.explanation_ar?.trim() || q.explanation_ar.trim().length < 5) {
      addViolation(4, "Bilingual Completeness", "question", q.id, `Missing or too short explanation_ar`);
    }
    if (!q.explanation_fr?.trim() || q.explanation_fr.trim().length < 5) {
      addViolation(4, "Bilingual Completeness", "question", q.id, `Missing or too short explanation_fr`);
    }
  }

  // ==========================================================================
  // RULE 5: LEARNING OBJECTIVE ALIGNMENT
  // Every skill is linked to atomic learning objectives or structured pedagogical outcomes.
  // ==========================================================================
  if (dataset.learningObjectives && dataset.learningObjectives.length > 0) {
    const objectiveMap = new Map(dataset.learningObjectives.map((lo) => [lo.id, lo]));
    for (const lo of dataset.learningObjectives) {
      if (!skillMap.has(lo.skillId)) {
        addViolation(5, "Learning Objective Alignment", "learningObjective", lo.id, `References non-existent skillId: ${lo.skillId}`);
      }
    }
    for (const skill of dataset.skills) {
      if (skill.learningObjectiveIds) {
        for (const loId of skill.learningObjectiveIds) {
          if (!objectiveMap.has(loId)) {
            addViolation(5, "Learning Objective Alignment", "skill", skill.id, `learningObjectiveId not found: ${loId}`);
          }
        }
      }
    }
  }

  // ==========================================================================
  // RULE 6: PROVENANCE & VERIFICATION TRACKING
  // Every entity must declare valid sourceId, sourceType, rightsStatus, verificationStatus.
  // ==========================================================================
  for (const { type, entity } of allEntities) {
    const id = String(entity.id || "unknown");
    if (!entity.sourceId || typeof entity.sourceId !== "string") {
      addViolation(6, "Provenance Tracking", type, id, `Missing sourceId`);
    }
    if (!VALID_SOURCE_TYPES.has(entity.sourceType as any)) {
      addViolation(6, "Provenance Tracking", type, id, `Invalid sourceType: ${String(entity.sourceType)}`);
    }
    if (!VALID_RIGHTS_STATUSES.has(entity.rightsStatus as any)) {
      addViolation(6, "Provenance Tracking", type, id, `Invalid rightsStatus: ${String(entity.rightsStatus)}`);
    }
    if (!VALID_VERIFICATION_STATUSES.has(entity.verificationStatus as any)) {
      addViolation(6, "Provenance Tracking", type, id, `Invalid verificationStatus: ${String(entity.verificationStatus)}`);
    }
  }

  // ==========================================================================
  // RULE 7: OFFICIAL CURRICULUM FACTS INTEGRITY
  // Official curriculum facts (e.g. subject coefficients) must have proven provenance.
  // Unverified facts must be explicitly flagged as unverified; zero invented claims.
  // ==========================================================================
  for (const subject of dataset.subjects) {
    const cp = subject.coefficientProvenance;
    if (!cp || typeof cp.value !== "number" || cp.value <= 0) {
      addViolation(7, "Official Curriculum Facts Integrity", "subject", subject.id, `Invalid or missing coefficient provenance`);
    } else {
      if (cp.status === "verified" && !cp.officialDocumentRef) {
        addViolation(7, "Official Curriculum Facts Integrity", "subject", subject.id, `Verified coefficient must cite an officialDocumentRef`);
      }
    }
  }

  // Check against prohibited overclaiming in titles/descriptions
  const forbiddenClaims = ["official prediction", "predictedBACScore", "garantie de réussite"];
  for (const { type, entity } of allEntities) {
    const id = String(entity.id || "unknown");
    const jsonStr = JSON.stringify(entity);
    for (const term of forbiddenClaims) {
      if (jsonStr.includes(term)) {
        addViolation(7, "Official Curriculum Facts Integrity", type, id, `Contains prohibited overclaim string: ${term}`);
      }
    }
  }

  // ==========================================================================
  // RULE 8: RIGHTS & COPYRIGHT INTEGRITY
  // Past BAC exams must be references only; original questions must be original_bac_mastery.
  // ==========================================================================
  for (const pq of dataset.practiceQuestions) {
    if (pq.sourceType === "original_bac_mastery" && pq.rightsStatus !== "original") {
      addViolation(8, "Rights & Copyright Integrity", "practiceQuestion", pq.id, `Original BAC Mastery question must have rightsStatus = 'original'`);
    }
  }

  for (const rq of dataset.retestQuestions) {
    if (rq.sourceType === "original_bac_mastery" && rq.rightsStatus !== "original") {
      addViolation(8, "Rights & Copyright Integrity", "retestQuestion", rq.id, `Original BAC Mastery retest must have rightsStatus = 'original'`);
    }
  }

  if (dataset.pastBacExamReferences) {
    for (const ref of dataset.pastBacExamReferences) {
      if (ref.rightsStatus !== "official_reference") {
        addViolation(8, "Rights & Copyright Integrity", "pastBacExamReference", ref.id, `Past BAC Exam reference must have rightsStatus = 'official_reference'`);
      }
    }
  }

  // ==========================================================================
  // RULE 9: QUESTION QUALITY & SINGLE CORRECT ANSWER
  // MCQ questions must have 3-4 options and exactly one valid correctAnswerId.
  // ==========================================================================
  const allQuestions = [...dataset.practiceQuestions, ...dataset.retestQuestions];
  for (const q of allQuestions) {
    if (q.type === "mcq") {
      if (!Array.isArray(q.options) || q.options.length < 3 || q.options.length > 4) {
        addViolation(9, "Question Quality & Correct Answer", "question", q.id, `MCQ must have 3 or 4 options; got ${q.options?.length}`);
      } else {
        const correctOpts = q.options.filter((opt) => opt.id === q.correctAnswerId);
        if (correctOpts.length !== 1) {
          addViolation(9, "Question Quality & Correct Answer", "question", q.id, `MCQ must have exactly 1 matching correct option for correctAnswerId '${q.correctAnswerId}'`);
        }
      }
    }
    if (!VALID_DIFFICULTY_LEVELS.has(q.difficulty)) {
      addViolation(9, "Question Quality & Correct Answer", "question", q.id, `Question difficulty must be 1, 2, or 3`);
    }
    if (!VALID_COGNITIVE_DIMENSIONS.has(q.dimension)) {
      addViolation(9, "Question Quality & Correct Answer", "question", q.id, `Invalid cognitive dimension: ${q.dimension}`);
    }
  }

  // ==========================================================================
  // RULE 10: ERROR LAB DISTRACTOR ALIGNMENT
  // All distractors must map to valid suspected error types in the Error Lab taxonomy.
  // ==========================================================================
  for (const q of allQuestions) {
    if (Array.isArray(q.options)) {
      for (const opt of q.options) {
        if (opt.id !== q.correctAnswerId && opt.suspectedErrorType) {
          if (!VALID_ERROR_TAXONOMY.has(opt.suspectedErrorType)) {
            addViolation(10, "Error Lab Distractor Alignment", "question", q.id, `Option ${opt.id} has invalid suspectedErrorType: ${opt.suspectedErrorType}`);
          }
        }
      }
    }
  }

  // ==========================================================================
  // RULE 11: UNSEEN RETEST GUARANTEE
  // Retest questions must map to parent practice twin, test the same skill, have a different ID and non-verbatim prompt.
  // ==========================================================================
  const practiceMap = new Map(dataset.practiceQuestions.map((pq) => [pq.id, pq]));

  for (const rq of dataset.retestQuestions) {
    if (!rq.isRetestVariant) {
      addViolation(11, "Unseen Retest Guarantee", "retestQuestion", rq.id, `isRetestVariant must be true`);
    }
    if (!rq.retestForQuestionId) {
      addViolation(11, "Unseen Retest Guarantee", "retestQuestion", rq.id, `Missing retestForQuestionId`);
    } else {
      const parent = practiceMap.get(rq.retestForQuestionId);
      if (!parent) {
        addViolation(11, "Unseen Retest Guarantee", "retestQuestion", rq.id, `retestForQuestionId references non-existent parent: ${rq.retestForQuestionId}`);
      } else {
        if (rq.id === parent.id) {
          addViolation(11, "Unseen Retest Guarantee", "retestQuestion", rq.id, `Retest question ID cannot equal parent practice question ID`);
        }
        if (rq.skillId !== parent.skillId) {
          addViolation(11, "Unseen Retest Guarantee", "retestQuestion", rq.id, `Retest skillId (${rq.skillId}) does not match parent skillId (${parent.skillId})`);
        }
        if (rq.subjectId !== parent.subjectId) {
          addViolation(11, "Unseen Retest Guarantee", "retestQuestion", rq.id, `Retest subjectId (${rq.subjectId}) does not match parent subjectId (${parent.subjectId})`);
        }
        if (rq.prompt_ar.trim() === parent.prompt_ar.trim()) {
          addViolation(11, "Unseen Retest Guarantee", "retestQuestion", rq.id, `Retest prompt_ar must not be verbatim clone of parent question`);
        }
      }
    }
  }

  // ==========================================================================
  // RULE 12: REMEDIATION GUIDE COMPLETENESS
  // Every skill must have actionable repairStrategy and >= 3 repairSteps in ar & fr.
  // ==========================================================================
  for (const skill of dataset.skills) {
    if (!skill.repairStrategy_ar?.trim() || skill.repairStrategy_ar.trim().length < 5) {
      addViolation(12, "Remediation Guide Completeness", "skill", skill.id, `Missing repairStrategy_ar`);
    }
    if (!skill.repairStrategy_fr?.trim() || skill.repairStrategy_fr.trim().length < 5) {
      addViolation(12, "Remediation Guide Completeness", "skill", skill.id, `Missing repairStrategy_fr`);
    }
    if (!Array.isArray(skill.repairSteps_ar) || skill.repairSteps_ar.length < 3) {
      addViolation(12, "Remediation Guide Completeness", "skill", skill.id, `repairSteps_ar must have at least 3 steps`);
    }
    if (!Array.isArray(skill.repairSteps_fr) || skill.repairSteps_fr.length < 3) {
      addViolation(12, "Remediation Guide Completeness", "skill", skill.id, `repairSteps_fr must have at least 3 steps`);
    }
  }

  // ==========================================================================
  // COMPILE REPORT
  // ==========================================================================
  const ruleViolationsCount: Record<number, number> = {};
  for (let r = 1; r <= 12; r++) {
    ruleViolationsCount[r] = 0;
  }
  for (const v of violations) {
    ruleViolationsCount[v.ruleNumber] = (ruleViolationsCount[v.ruleNumber] || 0) + 1;
  }

  const passedRules: number[] = [];
  const failedRules: number[] = [];
  for (let r = 1; r <= 12; r++) {
    if (ruleViolationsCount[r] === 0) {
      passedRules.push(r);
    } else {
      failedRules.push(r);
    }
  }

  return {
    isValid: violations.length === 0,
    totalEntitiesChecked,
    violations,
    summary: {
      ruleViolationsCount,
      passedRules,
      failedRules,
    },
  };
}
