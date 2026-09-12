/**
 * BAC Mastery — 16-Stage Content Coverage Matrix
 * 
 * Tracks the complete 16-stage lifecycle for every curriculum skill across all streams:
 * 1. MAPPED
 * 2. SOURCE_VERIFIED
 * 3. OBJECTIVE_DEFINED
 * 4. LESSON
 * 5. WORKED_EXAMPLE
 * 6. ACTIVE_RECALL
 * 7. PRACTICE
 * 8. RETEST
 * 9. ERROR_GUIDE
 * 10. REPAIR
 * 11. VISUAL
 * 12. EXTERNAL_RESOURCE
 * 13. EXAM_TRANSFER
 * 14. QA
 * 15. VERIFIED
 * 16. PUBLISHED
 * 
 * Invariants:
 * - 'Mapped' != 'complete'
 * - 'Published' != 'official'
 * - 'Content exists' != 'student mastered it'
 */

import { StreamId, SubjectId, TechniqueMathSpecialty } from "@/types/education";
import { FULL_COVERAGE_MATRIX } from "@/domain/curriculum/coverage-matrix";
import { CoverageSkillItem } from "@/domain/curriculum/types";
import { CANONICAL_EXEMPLAR_VISUAL_ASSETS } from "@/domain/learning-ecosystem/visual-assets";
import { CANONICAL_EXEMPLAR_EXTERNAL_RESOURCES } from "@/domain/learning-ecosystem/external-resources";

export type CoverageStageKey =
  | "MAPPED"
  | "SOURCE_VERIFIED"
  | "OBJECTIVE_DEFINED"
  | "LESSON"
  | "WORKED_EXAMPLE"
  | "ACTIVE_RECALL"
  | "PRACTICE"
  | "RETEST"
  | "ERROR_GUIDE"
  | "REPAIR"
  | "VISUAL"
  | "EXTERNAL_RESOURCE"
  | "EXAM_TRANSFER"
  | "QA"
  | "VERIFIED"
  | "PUBLISHED";

export const ALL_COVERAGE_STAGES: CoverageStageKey[] = [
  "MAPPED",
  "SOURCE_VERIFIED",
  "OBJECTIVE_DEFINED",
  "LESSON",
  "WORKED_EXAMPLE",
  "ACTIVE_RECALL",
  "PRACTICE",
  "RETEST",
  "ERROR_GUIDE",
  "REPAIR",
  "VISUAL",
  "EXTERNAL_RESOURCE",
  "EXAM_TRANSFER",
  "QA",
  "VERIFIED",
  "PUBLISHED",
];

export interface SkillCoverage16StageRecord {
  skillId: string;
  streamId: StreamId;
  subjectId: SubjectId;
  specialtyId?: TechniqueMathSpecialty;
  topicId: string;
  title_ar: string;
  title_fr: string;
  stages: Record<CoverageStageKey, boolean>;
  completedStagesCount: number;
  completionPercentage: number;
  isFullyPublished: boolean;
  notes: string;
}

export interface Coverage16StageStats {
  totalTrackedSkills: number;
  publishedCount: number;
  mappedOnlyCount: number;
  stageDistribution: Record<CoverageStageKey, number>;
  byStream: Record<
    StreamId,
    {
      total: number;
      published: number;
      mapped: number;
      averageStagesCompleted: number;
    }
  >;
}

/**
 * Evaluates the 16-stage status of a single skill item.
 */
export function auditSkillCoverageStages(
  item: CoverageSkillItem
): SkillCoverage16StageRecord {
  const hasVisual = CANONICAL_EXEMPLAR_VISUAL_ASSETS.some((v) => v.skillId === item.skillId);
  const hasResource = CANONICAL_EXEMPLAR_EXTERNAL_RESOURCES.some((r) => r.skillId === item.skillId);

  const isPublished = item.lifecycleState === "PUBLISHED" && item.status === "PUBLISHED";
  const isVerified = item.verificationDimensions?.structuralVerification && item.verificationDimensions?.factualVerification;

  const stages: Record<CoverageStageKey, boolean> = {
    MAPPED: true, // If it's in the curriculum matrix, it is mapped
    SOURCE_VERIFIED: item.verificationStatus !== "UNVERIFIED",
    OBJECTIVE_DEFINED: Boolean(item.objective_ar && item.objective_ar.trim().length > 0),
    LESSON: item.hasLesson,
    WORKED_EXAMPLE: item.hasExample,
    ACTIVE_RECALL: item.hasActiveRecall,
    PRACTICE: item.hasPractice,
    RETEST: item.hasRetest,
    ERROR_GUIDE: item.hasRepair, // Error guides pair with repair
    REPAIR: item.hasRepair,
    VISUAL: hasVisual || isPublished, // Available or covered in reference slice
    EXTERNAL_RESOURCE: hasResource || isPublished,
    EXAM_TRANSFER: item.hasExamTransfer,
    QA: isVerified,
    VERIFIED: isVerified,
    PUBLISHED: isPublished,
  };

  const completedStagesCount = Object.values(stages).filter(Boolean).length;
  const completionPercentage = Math.round((completedStagesCount / ALL_COVERAGE_STAGES.length) * 100);

  let notes = "مهارة قيد التخطيط والتأطير المنهجي.";
  if (isPublished) {
    notes = "مهارة منشورة ومستوفية للشريحة البيداغوجية الكاملة.";
  } else if (stages.LESSON) {
    notes = "محتوى قيد المراجعة وإعداد الاختبارات التوأم.";
  }

  return {
    skillId: item.skillId,
    streamId: item.streamId,
    subjectId: item.subjectId,
    specialtyId: item.specialtyId,
    topicId: item.topicId,
    title_ar: item.title_ar,
    title_fr: item.title_fr,
    stages,
    completedStagesCount,
    completionPercentage,
    isFullyPublished: isPublished,
    notes,
  };
}

/**
 * Builds the complete 16-stage coverage matrix across all registered skills.
 */
export function buildComprehensiveCoverage16Matrix(): SkillCoverage16StageRecord[] {
  return FULL_COVERAGE_MATRIX.map(auditSkillCoverageStages);
}

/**
 * Computes aggregate statistics across all 16 coverage stages.
 */
export function getCoverage16StageStats(): Coverage16StageStats {
  const records = buildComprehensiveCoverage16Matrix();
  const total = records.length;
  let publishedCount = 0;
  let mappedOnlyCount = 0;

  const stageDistribution: Record<CoverageStageKey, number> = {
    MAPPED: 0,
    SOURCE_VERIFIED: 0,
    OBJECTIVE_DEFINED: 0,
    LESSON: 0,
    WORKED_EXAMPLE: 0,
    ACTIVE_RECALL: 0,
    PRACTICE: 0,
    RETEST: 0,
    ERROR_GUIDE: 0,
    REPAIR: 0,
    VISUAL: 0,
    EXTERNAL_RESOURCE: 0,
    EXAM_TRANSFER: 0,
    QA: 0,
    VERIFIED: 0,
    PUBLISHED: 0,
  };

  const streams: StreamId[] = [
    "sciences_exp",
    "math",
    "technique_math",
    "gestion_eco",
    "lettres_philo",
    "langues_etrangeres",
  ];

  const byStream: Coverage16StageStats["byStream"] = {
    sciences_exp: { total: 0, published: 0, mapped: 0, averageStagesCompleted: 0 },
    math: { total: 0, published: 0, mapped: 0, averageStagesCompleted: 0 },
    technique_math: { total: 0, published: 0, mapped: 0, averageStagesCompleted: 0 },
    gestion_eco: { total: 0, published: 0, mapped: 0, averageStagesCompleted: 0 },
    lettres_philo: { total: 0, published: 0, mapped: 0, averageStagesCompleted: 0 },
    langues_etrangeres: { total: 0, published: 0, mapped: 0, averageStagesCompleted: 0 },
  };

  const streamStageSums: Record<StreamId, number> = {
    sciences_exp: 0,
    math: 0,
    technique_math: 0,
    gestion_eco: 0,
    lettres_philo: 0,
    langues_etrangeres: 0,
  };

  records.forEach((r) => {
    if (r.isFullyPublished) publishedCount++;
    if (!r.isFullyPublished && r.stages.MAPPED) mappedOnlyCount++;

    ALL_COVERAGE_STAGES.forEach((stage) => {
      if (r.stages[stage]) {
        stageDistribution[stage]++;
      }
    });

    const streamStat = byStream[r.streamId];
    if (streamStat) {
      streamStat.total++;
      if (r.isFullyPublished) streamStat.published++;
      if (r.stages.MAPPED) streamStat.mapped++;
      streamStageSums[r.streamId] += r.completedStagesCount;
    }
  });

  streams.forEach((s) => {
    const stat = byStream[s];
    if (stat.total > 0) {
      stat.averageStagesCompleted = Math.round((streamStageSums[s] / stat.total) * 10) / 10;
    }
  });

  return {
    totalTrackedSkills: total,
    publishedCount,
    mappedOnlyCount,
    stageDistribution,
    byStream,
  };
}
