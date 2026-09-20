/**
 * BAC Mastery - All Stream Curriculum Aggregator
 * Consolidates specialized subjects across all 6 BAC streams
 */

import { SkillLearningBundle } from "../bundle-builder";
import { SCIENCES_EXP_STREAM_BUNDLES } from "./sciences-exp";
import { MATH_STREAM_BUNDLES } from "./math";
import { TECHNIQUE_MATH_STREAM_BUNDLES } from "./technique-math";
import { GESTION_ECO_STREAM_BUNDLES } from "./gestion-eco";
import { LETTRES_PHILO_STREAM_BUNDLES } from "./lettres-philo";
import { FOREIGN_LANGUAGES_STREAM_BUNDLES } from "./langues";

export { SCIENCES_EXP_STREAM_BUNDLES } from "./sciences-exp";
export { MATH_STREAM_BUNDLES } from "./math";
export { TECHNIQUE_MATH_STREAM_BUNDLES } from "./technique-math";
export { GESTION_ECO_STREAM_BUNDLES } from "./gestion-eco";
export { LETTRES_PHILO_STREAM_BUNDLES } from "./lettres-philo";
export { FOREIGN_LANGUAGES_STREAM_BUNDLES } from "./langues";

export const STREAM_CURRICULUM_BUNDLES: Record<string, SkillLearningBundle> = {
  ...SCIENCES_EXP_STREAM_BUNDLES,
  ...MATH_STREAM_BUNDLES,
  ...TECHNIQUE_MATH_STREAM_BUNDLES,
  ...GESTION_ECO_STREAM_BUNDLES,
  ...LETTRES_PHILO_STREAM_BUNDLES,
  ...FOREIGN_LANGUAGES_STREAM_BUNDLES,
};
