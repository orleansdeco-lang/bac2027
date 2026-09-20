/**
 * BAC Mastery - Sciences Expérimentales Stream Aggregator
 */

import { SkillLearningBundle } from "../../bundle-builder";
import { sciencesExpMathBundles } from "./math";
import { sciencesExpPhysicsBundles } from "./physics";
import { sciencesExpBiologyBundles } from "./biology";

export { sciencesExpMathBundles } from "./math";
export { sciencesExpPhysicsBundles } from "./physics";
export { sciencesExpBiologyBundles } from "./biology";

export const SCIENCES_EXP_STREAM_BUNDLES: Record<string, SkillLearningBundle> = {
  ...sciencesExpMathBundles,
  ...sciencesExpPhysicsBundles,
  ...sciencesExpBiologyBundles,
};
