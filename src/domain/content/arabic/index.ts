export * from "./types";
export * from "./unit01_ida_idhan";

import { ArabicLesson } from "./types";
import { unit01IdaIdhanArabicLesson } from "./unit01_ida_idhan";

/**
 * Authoritative Catalog of Arabic Language & Literature Lessons
 * Specifically structured for Stream: Lettres & Philosophie (شعبة الآداب والفلسفة)
 */
export const ARABIC_LESSONS_CATALOG: ArabicLesson[] = [
  unit01IdaIdhanArabicLesson,
];
