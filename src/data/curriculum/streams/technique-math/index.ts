/**
 * BAC Mastery - Technique Mathématique Stream Aggregator
 * Consolidates all 4 engineering branches: Civil, Mechanical, Electrical, Process
 */

import { SkillLearningBundle } from "../../bundle-builder";
import { tmCivilBundles } from "./civil";
import { tmMecaBundles } from "./mechanical";
import { tmElecBundles } from "./electrical";
import { tmProcBundles } from "./process";

export { tmCivilBundles } from "./civil";
export { tmMecaBundles } from "./mechanical";
export { tmElecBundles } from "./electrical";
export { tmProcBundles } from "./process";

export const TECHNIQUE_MATH_STREAM_BUNDLES: Record<string, SkillLearningBundle> = {
  ...tmCivilBundles,
  ...tmMecaBundles,
  ...tmElecBundles,
  ...tmProcBundles,
};
