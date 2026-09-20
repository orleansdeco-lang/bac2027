/**
 * BAC Mastery - Langues Étrangères (Third Languages) Stream Aggregator
 * Consolidates Spanish, German, and Italian
 */

import { SkillLearningBundle } from "../../bundle-builder";
import { spanishBundles } from "./spanish";
import { germanBundles } from "./german";
import { italianBundles } from "./italian";

export { spanishBundles } from "./spanish";
export { germanBundles } from "./german";
export { italianBundles } from "./italian";

export const FOREIGN_LANGUAGES_STREAM_BUNDLES: Record<string, SkillLearningBundle> = {
  ...spanishBundles,
  ...germanBundles,
  ...italianBundles,
};
