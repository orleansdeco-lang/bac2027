/**
 * BAC Mastery — Critical Educational Content Language Architecture
 * Prompt 17: Separation of UI Language vs Educational Content Language
 * 
 * CORE PRODUCT RULE:
 * 1. UI Language is a user preference (Arabic RTL or French LTR for nav, buttons, system chrome).
 * 2. Educational Content Language depends on the SCHOOL SUBJECT:
 *    - All Algerian BAC non-language school subjects (Math, Physics, SNV, Philosophy, History, etc.)
 *      MUST be presented in academic, structured Algerian Arabic ("ar").
 *    - Actual language subjects are taught in the target language:
 *      * French subject -> French ("fr")
 *      * English subject -> English ("en")
 *      * Spanish / Third Language subject -> Spanish ("es")
 * 3. The UI language MUST NOT automatically translate or alter the educational content language.
 */

import { SubjectId } from "@/types/education";
import { Subject } from "./types";

export type EducationalContentLanguage = "ar" | "fr" | "en" | "es";

export type ContentDirection = "rtl" | "ltr";

/**
 * Known language subjects in the Algerian secondary educational curriculum
 */
export const LANGUAGE_SUBJECT_IDS: ReadonlySet<string> = new Set([
  "french",
  "english",
  "third_language",
  "spanish",
  "german",
  "italian",
]);

/**
 * Mapping of language subjects to their respective target educational content languages
 */
const LANGUAGE_SUBJECT_CONTENT_MAP: Record<string, EducationalContentLanguage> = {
  french: "fr",
  english: "en",
  third_language: "es", // Default 3rd language specialization for BAC Langues Étrangères
  spanish: "es",
  german: "es", // Target language fallback
  italian: "es",
};

/**
 * Deterministically resolves the educational content language for any subject.
 * 
 * Non-language school subjects always resolve to "ar" (Algerian school textbook Arabic).
 * Language school subjects resolve to their native target language ("fr", "en", "es").
 */
export function resolveEducationalContentLanguage(
  subjectOrId: SubjectId | Subject | string | null | undefined
): EducationalContentLanguage {
  if (!subjectOrId) {
    return "ar";
  }

  // If passed a Subject object with an explicit contentLanguage override
  if (typeof subjectOrId === "object" && "contentLanguage" in subjectOrId && subjectOrId.contentLanguage) {
    return subjectOrId.contentLanguage;
  }

  const rawId = typeof subjectOrId === "object" ? subjectOrId.id : subjectOrId;
  const normalizedId = String(rawId).toLowerCase().trim();

  // Check language subject mapping
  if (LANGUAGE_SUBJECT_CONTENT_MAP[normalizedId]) {
    return LANGUAGE_SUBJECT_CONTENT_MAP[normalizedId];
  }

  // DEFAULT RULE: All BAC school subjects (Math, Physics, SNV, Philosophy, etc.) are in Arabic
  return "ar";
}

/**
 * Resolves the visual text direction (RTL or LTR) for educational content
 */
export function resolveContentDirection(lang: EducationalContentLanguage): ContentDirection {
  return lang === "ar" ? "rtl" : "ltr";
}

/**
 * Determines whether a subject is a native language subject
 */
export function isLanguageSubject(subjectId: SubjectId | string | null | undefined): boolean {
  if (!subjectId) return false;
  return LANGUAGE_SUBJECT_IDS.has(String(subjectId).toLowerCase().trim());
}

/**
 * Returns human-readable metadata for a content language
 */
export function getContentLanguageMeta(lang: EducationalContentLanguage): {
  code: EducationalContentLanguage;
  label_ar: string;
  label_fr: string;
  dir: ContentDirection;
} {
  switch (lang) {
    case "ar":
      return { code: "ar", label_ar: "العربية", label_fr: "Arabe", dir: "rtl" };
    case "fr":
      return { code: "fr", label_ar: "الفرنسية", label_fr: "Français", dir: "ltr" };
    case "en":
      return { code: "en", label_ar: "الإنجليزية", label_fr: "Anglais", dir: "ltr" };
    case "es":
      return { code: "es", label_ar: "الإسبانية", label_fr: "Espagnol", dir: "ltr" };
  }
}
