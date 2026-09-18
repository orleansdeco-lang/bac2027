/**
 * BAC Mastery V2 — Canonical Curriculum Contracts
 * 
 * INVARIANT:
 * Curriculum truth is immutable, versioned, and stored in Git.
 * Reflects official Algerian Ministry of National Education syllabi.
 */

import {
  SkillId,
  TopicId,
  DomainUnitId,
  CurriculumVersionId,
  ConceptId,
  MisconceptionId,
  ResourceId,
  LearningObjectiveId,
} from "../ids";
import { CanonicalSkill } from "@/domain/contracts/canonical-skill.contract";
import { SubjectId, StreamId, ExamType, TechniqueMathSpecialty } from "@/types/education";
import { DiagnosticDimension } from "@/types/diagnostic";

export type { CanonicalSkill };
export type { SubjectId, StreamId, ExamType, TechniqueMathSpecialty, DiagnosticDimension };

export type CanonicalEducationLevel = "secondary_1as" | "secondary_2as" | "secondary_3as";

export interface StreamSubjectRule {
  subjectId: SubjectId;
  coefficient: number;
  isCoreSubject: boolean;
  weeklyHours?: number;
}

export interface CanonicalSubject {
  id: SubjectId;
  code: string;
  name_ar: string;
  name_fr: string;
  isScientific: boolean;
}

export interface CanonicalStream {
  id: StreamId;
  examType: ExamType;
  code: string;
  name_ar: string;
  name_fr: string;
  description_ar: string;
  description_fr: string;
  subjects: StreamSubjectRule[];
}

export interface DomainUnit {
  id: DomainUnitId;
  subjectId: SubjectId;
  streamId: StreamId;
  unitNumber: number;
  title_ar: string;
  title_fr: string;
  topicIds: TopicId[];
  skillIds: SkillId[];
}

export interface Topic {
  id: TopicId;
  unitId: DomainUnitId;
  subjectId: SubjectId;
  title_ar: string;
  title_fr: string;
  skillIds: SkillId[];
}

export interface PrerequisiteDeclaration {
  sourceSkillId: SkillId;
  targetSkillId: SkillId;
  criticality: "hard" | "soft";
  rationale_ar?: string;
  rationale_fr?: string;
}

export interface CanonicalLearningObjective {
  id: LearningObjectiveId;
  skillId: SkillId;
  code: string;
  description_ar: string;
  description_fr: string;
  bloomLevel: "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";
  order: number;
}

export interface Concept {
  id: ConceptId;
  subjectId: SubjectId;
  title_ar: string;
  title_fr: string;
  summary_ar: string;
  summary_fr: string;
  relatedSkillIds: SkillId[];
}

export interface Misconception {
  id: MisconceptionId;
  skillId: SkillId;
  slug: string;
  description_ar: string;
  description_fr: string;
  counterExample_ar?: string;
  counterExample_fr?: string;
}

export interface PedagogicalResource {
  id: ResourceId;
  type: "video" | "diagram" | "summary_card" | "official_bac_solution" | "audio_explainer";
  title_ar: string;
  title_fr: string;
  uri: string;
  skillIds: SkillId[];
  isVerified: boolean;
}

// =============================================================================
// CONTENT GOVERNANCE & SOURCE-OF-TRUTH BOUNDARY (TASK 1.4)
// =============================================================================

export type ContentSourceKind =
  | "canonical_git_declaration"   // Authoritative Git-backed domain contracts
  | "legacy_typescript_catalog"    // Read-only legacy data files (src/data/)
  | "database_telemetry_store"    // Runtime storage for attempts/progress, NOT content authority
  | "runtime_cache"                // Non-authoritative in-memory or ISR caches
  | "client_ui_state";             // Ephemeral frontend view models

export type ContentLifecycleStatus =
  | "draft"        // Initial authoring; strictly excluded from runtime practice
  | "in_review"    // Pedagogical & psychometric review in progress
  | "validated"    // Passed review; queued for release
  | "published"    // Authoritative and active in runtime learning loops
  | "deprecated";  // Superseded by newer syllabus; preserved for historical records

export interface ContentPublicationEnvelope<T> {
  entity: T;
  sourceKind: ContentSourceKind;
  lifecycleStatus: ContentLifecycleStatus;
  version: number;
  isRuntimeEligible: boolean;
  publishedAt?: string;
  governanceNotes?: string;
}

export function isAuthoritativeSource(kind: ContentSourceKind): boolean {
  return kind === "canonical_git_declaration";
}

export function isRuntimeEligible(status: ContentLifecycleStatus, sourceKind: ContentSourceKind): boolean {
  // Runtime may ONLY consume published content from authoritative sources or verified legacy adapters
  if (sourceKind === "client_ui_state" || sourceKind === "database_telemetry_store" || sourceKind === "runtime_cache") {
    return false;
  }
  return status === "published";
}

export function assertCanonicalContentAuthority(sourceKind: ContentSourceKind, entityName: string): void {
  if (sourceKind !== "canonical_git_declaration") {
    throw new Error(
      `[ContentBoundaryError] Entity "${entityName}" from source "${sourceKind}" cannot claim canonical content authority. Only "canonical_git_declaration" is semantic authority.`
    );
  }
}

