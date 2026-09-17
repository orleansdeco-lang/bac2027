/**
 * BAC Mastery 2.0 — Layer 1: Canonical Skill Contract
 * 
 * INVARIANT:
 * Authoritative interface for all pedagogical skills across streams.
 * Eliminates ad-hoc object structures and establishes the Gold Standard.
 */

import { SubjectId, StreamId } from "@/types/education";
import { DiagnosticDimension } from "@/types/diagnostic";

export interface CanonicalSkill {
  id: string;
  topicId: string;
  subjectId: SubjectId;
  streamId: StreamId;
  title_ar: string;
  title_fr: string;
  description_ar: string;
  description_fr: string;
  prerequisites: string[];
  dimensions: DiagnosticDimension[];
  cognitiveDimensions?: DiagnosticDimension[];
  difficulty: 1 | 2 | 3;
  order: number;
  isActive: boolean;
  repairStrategy_ar: string;
  repairStrategy_fr: string;
  repairSteps_ar: string[];
  repairSteps_fr: string[];
}
