/**
 * BAC Mastery - Gestion & Économie Stream Aggregator
 * Consolidates Accounting, Economics, Law, and Financial Math
 */

import { SkillLearningBundle } from "../../bundle-builder";
import { gestionEcoAccountingBundles } from "./accounting";
import { gestionEcoEconomicsBundles } from "./economics";
import { gestionEcoLawBundles } from "./law";
import { gestionEcoMathFinBundles } from "./math-fin";

export { gestionEcoAccountingBundles } from "./accounting";
export { gestionEcoEconomicsBundles } from "./economics";
export { gestionEcoLawBundles } from "./law";
export { gestionEcoMathFinBundles } from "./math-fin";

export const GESTION_ECO_STREAM_BUNDLES: Record<string, SkillLearningBundle> = {
  ...gestionEcoAccountingBundles,
  ...gestionEcoEconomicsBundles,
  ...gestionEcoLawBundles,
  ...gestionEcoMathFinBundles,
};
