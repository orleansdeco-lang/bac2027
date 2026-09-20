/**
 * BAC Mastery - Common Curriculum Aggregator
 * Consolidates all common subjects: History, Geography, Islamic Studies, Arabic, French, English
 */

import { SkillLearningBundle } from "../bundle-builder";
import { commonHistoryBundles } from "./history";
import { commonGeographyBundles } from "./geography";
import { commonIslamicBundles } from "./islamic";
import { commonArabicBundles } from "./arabic";
import { commonFrenchBundles } from "./french";
import { commonEnglishBundles } from "./english";

export { commonHistoryBundles } from "./history";
export { commonGeographyBundles } from "./geography";
export { commonIslamicBundles } from "./islamic";
export { commonArabicBundles } from "./arabic";
export { commonFrenchBundles } from "./french";
export { commonEnglishBundles } from "./english";

export const COMMON_CURRICULUM_BUNDLES: Record<string, SkillLearningBundle> = {
  ...commonHistoryBundles,
  ...commonGeographyBundles,
  ...commonIslamicBundles,
  ...commonArabicBundles,
  ...commonFrenchBundles,
  ...commonEnglishBundles,
};
