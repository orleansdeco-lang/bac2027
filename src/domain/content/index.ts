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

// Pack 1: Complete Islamic Studies Bundle
export {
  PACK1_ISLAMIC_STUDIES_BUNDLE,
  getPack1IslamicBundle,
  getAllPack1IslamicSkills,
} from "./pack1-islamic-studies-full-bundle";
export type { IslamicStudiesBundlePayload } from "./pack1-islamic-studies-full-bundle";

// Pack 2: French and English Languages Bundle
export {
  PACK2_LANGUAGES_BUNDLE,
  getPack2LanguagesBundle,
  getAllPack2LanguageSkills,
} from "./pack2-languages-french-english-bundle";
export type { LanguageBundlePayload } from "./pack2-languages-french-english-bundle";

// Pack 3: Scientific Philosophy Bundle
export {
  PACK3_PHILOSOPHY_BUNDLE,
  getPack3PhilosophyBundle,
  getAllPack3PhilosophySkills,
} from "./pack3-philosophy-scientific-bundle";
export type { PhilosophyBundlePayload } from "./pack3-philosophy-scientific-bundle";

// Pack 4: Arabic Language, Literature & Literary Mathematics Bundle
export {
  PACK4_ARABIC_LIT_MATH_BUNDLE,
  getPack4ArabicLitMathBundle,
  getAllPack4ArabicLitMathSkills,
} from "./pack4-arabic-and-literature-math-bundle";
export type { ArabicAndLitMathBundlePayload } from "./pack4-arabic-and-literature-math-bundle";

// Pack 5: Technique Math Engineering & Math Stream SNV Expanded Bundle
export {
  PACK5_ENGINEERING_SNV_BUNDLE,
  getPack5EngineeringSnvBundle,
  getAllPack5EngineeringSnvSkills,
} from "./pack5-technique-math-engineering-expanded";
export type { EngineeringAndMathSnvBundlePayload } from "./pack5-technique-math-engineering-expanded";
