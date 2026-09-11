/**
 * BAC Mastery - Generic Content Model Types
 * Prompt 07: Curriculum Topic and Competence Skill definitions
 * Core loop: Topic -> Skill -> Practice -> Error -> Repair -> Retest -> Mastery
 */

import { SubjectId, StreamId, ExamType, EducationLevel } from "./education";
import { DiagnosticDimension } from "./diagnostic";

/**
 * Curriculum Topic / Chapter entity
 * Represents an organizational curriculum module (e.g. "Dérivation", "Suites", "Circuits RC")
 */
export interface CurriculumTopic {
  id: string;
  educationLevel: EducationLevel;
  examType: ExamType;
  streamId: StreamId;
  subjectId: SubjectId;
  title_ar: string;
  title_fr: string;
  description_ar?: string;
  description_fr?: string;
  order: number;
  isActive: boolean;
}

/**
 * Targeted Learning Skill / Competence entity
 * Represents an actionable, assessable student capability within a curriculum topic
 */
export interface CurriculumSkill {
  id: string;
  topicId: string;
  subjectId: SubjectId;
  streamId: StreamId;
  title_ar: string;
  title_fr: string;
  description_ar: string;
  description_fr: string;
  prerequisites: string[]; // Directional prerequisite skill IDs
  cognitiveDimensions: DiagnosticDimension[];
  dimensions: DiagnosticDimension[]; // Backward-compatible alias
  difficulty: 1 | 2 | 3;
  order: number;
  isActive: boolean;
  repairStrategy_ar: string;
  repairStrategy_fr: string;
  repairSteps_ar: string[];
  repairSteps_fr: string[];
}

/**
 * Cognitive dimension definition and pedagogical description
 */
export interface DimensionMetadata {
  id: DiagnosticDimension;
  label_ar: string;
  label_fr: string;
  description_ar: string;
  description_fr: string;
}

/**
 * Skill learning state in student profile / curriculum map
 */
export type SkillEvidenceState =
  | "not_assessed"   // Mapped & supported, but not yet evaluated for student
  | "emerging"       // Initial practice passed with positive confidence
  | "needs_work"     // Re-test failed twice; scheduled for delayed revision
  | "demonstrated";  // Remediation completed and twin re-test passed
