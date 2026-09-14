export * from "./types";
export * from "./issue01_perception";
export * from "./issue02_language_thought";
export * from "./issue03_consciousness";
export * from "./issue04_memory_imagination";
export * from "./issue05_habit_will";
export * from "./twinEngine";

import { PhilosophyEssayLesson } from "./types";
import { issue01PerceptionLesson } from "./issue01_perception";
import { issue02LanguageThoughtLesson } from "./issue02_language_thought";
import { issue03ConsciousnessLesson } from "./issue03_consciousness";
import { issue04MemoryImaginationLesson } from "./issue04_memory_imagination";
import { issue05HabitWillLesson } from "./issue05_habit_will";

/**
 * All Official Literature & Philosophy (شعبة الآداب والفلسفة) Term 1 Lessons
 * Unit 01: الإشكالية الأولى: في إدراك العالم الخارجي
 */
export const PHILOSOPHY_TERM1_LESSONS: PhilosophyEssayLesson[] = [
  issue01PerceptionLesson,
  issue02LanguageThoughtLesson,
  issue03ConsciousnessLesson,
  issue04MemoryImaginationLesson,
  issue05HabitWillLesson,
];
