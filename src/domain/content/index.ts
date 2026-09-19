/**
 * BAC Mastery — Content & Knowledge Domain Module
 * Prompt 11: Content Architecture Entrypoint
 */

export * from "./types";
export * from "./schemas";
export * from "./validation";
export * from "./mappings";
export * from "./language";
export * from "./mini-exams";
export * from "./snv-daily-lessons";
export * from "./philosophy";
export * from "./arabic";
export * from "./technique-math-bundle";
export {
  BATCH5_LITERATURE_LANGUAGES_BUNDLE,
  getBatch5LiteratureLanguagesBundle,
  getAllBatch5Skills,
  getBatch5SkillsForStream,
} from "./foreign-languages-third-lang-bundle";
export type { Batch5LiteratureLanguagesPayload } from "./foreign-languages-third-lang-bundle";
export {
  BATCH9_FINAL_CURRICULUM_BUNDLE,
  BATCH9_CURRICULUM_ALIASES,
  getBatch9LearningBundle,
  getAllBatch9Skills,
} from "./batch9-final-curriculum-bundle";
export type { Batch9SkillLearningBundle } from "./batch9-final-curriculum-bundle";
