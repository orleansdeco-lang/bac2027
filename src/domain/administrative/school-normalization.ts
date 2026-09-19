/**
 * High School Name Normalization
 * Standardizes Arabic and French high school names for duplicate detection and phonetic/spelling-tolerant search.
 * Mirrors the PostgreSQL function `public.normalize_school_name(txt TEXT)` defined in migration 015.
 */

export function normalizeSchoolName(input: string | null | undefined): string {
  if (!input) return "";

  let cleaned = input.toLowerCase().trim();

  // 1. Remove common prefixes: 'ثانوية', 'ثانويه', 'lycee', 'lycée'
  cleaned = cleaned.replace(/^(ثانوية|ثانويه|lycee|lycée)\s+/i, "");

  // 2. Remove Arabic diacritics / tashkeel
  cleaned = cleaned.replace(/[\u064B-\u065F\u0670]/g, "");

  // 3. Remove tatweel (kashida)
  cleaned = cleaned.replace(/ـ+/g, "");

  // 4. Normalize Arabic Alefs: [أإآٱ] -> ا
  cleaned = cleaned.replace(/[أإآٱ]/g, "ا");

  // 5. Normalize Taa Marbuta: ة -> ه
  cleaned = cleaned.replace(/ة/g, "ه");

  // 6. Normalize Yaa: ى -> ي
  cleaned = cleaned.replace(/ى/g, "ي");

  // 7. Normalize French accented characters
  cleaned = cleaned
    .replace(/[éèêë]/g, "e")
    .replace(/[àâä]/g, "a")
    .replace(/[ôö]/g, "o")
    .replace(/[îï]/g, "i")
    .replace(/[ùûü]/g, "u")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  // 8. Remove punctuation and collapse whitespace
  cleaned = cleaned.replace(/[\-_.,()''"\/]/g, " ");
  cleaned = cleaned.replace(/\s+/g, " ");

  return cleaned.trim();
}

/**
 * Checks if two school names are effectively equivalent after normalization
 */
export function areSchoolNamesEquivalent(nameA: string, nameB: string): boolean {
  const normA = normalizeSchoolName(nameA);
  const normB = normalizeSchoolName(nameB);
  if (!normA || !normB) return false;
  return normA === normB;
}
