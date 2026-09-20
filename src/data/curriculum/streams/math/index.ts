/**
 * BAC Mastery - Mathématiques Stream Aggregator
 */

import { SkillLearningBundle } from "../../bundle-builder";
import { mathStreamAdvancedBundles } from "./math-advanced";
import { mathStreamBiologyBundles } from "./biology";

export { mathStreamAdvancedBundles } from "./math-advanced";
export { mathStreamBiologyBundles } from "./biology";

export const MATH_STREAM_BUNDLES: Record<string, SkillLearningBundle> = {
  ...mathStreamAdvancedBundles,
  ...mathStreamBiologyBundles,
};
