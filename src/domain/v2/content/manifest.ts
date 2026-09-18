/**
 * BAC Mastery V2 — Canonical Content Manifest (Task 1.5)
 * 
 * INVARIANT:
 * Minimal metadata index summarizing the canonical content set.
 * 
 * The Manifest is an index; it is NOT a second content database or duplicate store.
 */

export interface CanonicalContentManifest {
  manifestVersion: string;
  syllabusAcademicYear: string;
  totalStreams: number;
  totalSubjects: number;
  totalTopics: number;
  totalCanonicalSkills: number;
  totalQuestions: number;
  totalResources: number;
  catalogs: {
    canonicalSciences: string;
    gestionEconomie: string;
    lettresPhilo: string;
    topics: string;
    practiceQuestions: string;
    lessons: string;
    repairGuides: string;
  };
}

export function createCanonicalContentManifest(counts: {
  totalStreams: number;
  totalSubjects: number;
  totalTopics: number;
  totalCanonicalSkills: number;
  totalQuestions: number;
  totalResources: number;
}): CanonicalContentManifest {
  return {
    manifestVersion: "2.0.0",
    syllabusAcademicYear: "2024-2025 (Decision MEN 10 Sept 2026 baseline)",
    totalStreams: counts.totalStreams,
    totalSubjects: counts.totalSubjects,
    totalTopics: counts.totalTopics,
    totalCanonicalSkills: counts.totalCanonicalSkills,
    totalQuestions: counts.totalQuestions,
    totalResources: counts.totalResources,
    catalogs: {
      canonicalSciences: "src/data/skills/canonical-sciences.ts",
      gestionEconomie: "src/data/skills/gestion-economie.ts",
      lettresPhilo: "src/data/skills/lettres-philo.ts",
      topics: "src/data/curriculum/topics.ts",
      practiceQuestions: "src/data/curriculum/practice-questions*.ts",
      lessons: "src/domain/content/lessons.ts",
      repairGuides: "src/domain/content/repair-guides.ts",
    },
  };
}
