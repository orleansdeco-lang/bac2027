/**
 * BAC Mastery — Production Lessons Catalog (Sciences Expérimentales 3AS)
 * Prompt 13: High-Yield, Active, Exam-Oriented Lessons (14-Element Structure)
 * 
 * Aggregates all 31 Curriculum Skills:
 * - Mathematics: 10 Lessons (src/domain/content/lessons/math.ts)
 * - Physique-Chimie: 11 Lessons (src/domain/content/lessons/physics.ts)
 * - Sciences de la Nature et de la Vie: 10 Lessons (src/domain/content/lessons/snv.ts)
 * 
 * Invariant: Content Purity (ZERO user_id).
 */

import { Lesson } from "./types";
import { MATH_LESSONS } from "./lessons/math";
import { PHYSICS_LESSONS } from "./lessons/physics";
import { SNV_LESSONS } from "./lessons/snv";

export { MATH_LESSONS } from "./lessons/math";
export { PHYSICS_LESSONS } from "./lessons/physics";
export { SNV_LESSONS } from "./lessons/snv";

export const PROMPT12_LESSONS: Lesson[] = [
  ...MATH_LESSONS,
  ...PHYSICS_LESSONS,
  ...SNV_LESSONS,
];
