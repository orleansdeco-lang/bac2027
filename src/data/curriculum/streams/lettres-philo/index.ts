/**
 * BAC Mastery - Lettres & Philosophie Stream Aggregator
 * Consolidates Philosophy, Arabic Literature, and Literary Math
 */

import { SkillLearningBundle } from "../../bundle-builder";
import { lettresPhiloPhilosophyBundles } from "./philosophy";
import { lettresPhiloArabicLitBundles } from "./arabic-literature";
import { literaryMathBundles } from "./math-lit";

export { lettresPhiloPhilosophyBundles } from "./philosophy";
export { lettresPhiloArabicLitBundles } from "./arabic-literature";
export { literaryMathBundles } from "./math-lit";

export const LETTRES_PHILO_STREAM_BUNDLES: Record<string, SkillLearningBundle> = {
  ...lettresPhiloPhilosophyBundles,
  ...lettresPhiloArabicLitBundles,
  ...literaryMathBundles,
};
