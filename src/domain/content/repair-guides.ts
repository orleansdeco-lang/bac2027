/**
 * BAC Mastery — Error Repair Guides Catalog
 * Prompt 13: Targeted 5-15 minute remediation guides mapped to Error Lab taxonomy
 * 
 * Aggregates all 31 Curriculum Skills:
 * - Mathematics: 10 Repair Guides (src/domain/content/repair-guides/math.ts)
 * - Physique-Chimie: 11 Repair Guides (src/domain/content/repair-guides/physics.ts)
 * - Sciences de la Nature et de la Vie: 10 Repair Guides (src/domain/content/repair-guides/snv.ts)
 * 
 * Invariant: Content Purity (ZERO user_id).
 */

import { RepairGuide } from "./types";
import { MATH_REPAIR_GUIDES } from "./repair-guides/math";
import { PHYSICS_REPAIR_GUIDES } from "./repair-guides/physics";
import { SNV_REPAIR_GUIDES } from "./repair-guides/snv";

export { MATH_REPAIR_GUIDES } from "./repair-guides/math";
export { PHYSICS_REPAIR_GUIDES } from "./repair-guides/physics";
export { SNV_REPAIR_GUIDES } from "./repair-guides/snv";

export const PROMPT12_REPAIR_GUIDES: RepairGuide[] = [
  ...MATH_REPAIR_GUIDES,
  ...PHYSICS_REPAIR_GUIDES,
  ...SNV_REPAIR_GUIDES,
];
