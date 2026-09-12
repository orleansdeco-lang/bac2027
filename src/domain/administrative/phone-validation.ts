/**
 * BAC Mastery — Algerian Phone Number Validation & Normalization
 * 
 * Rules:
 * - Mobile lines: 05, 06, 07 followed by 8 digits (10 digits total)
 * - Fixed lines: 02, 03, 04 followed by 7 or 8 digits (9 or 10 digits total)
 * - International prefixes +213 or 00213 normalized cleanly to leading 0
 * - Non-numeric separators (spaces, dots, hyphens, brackets) stripped
 * - Returns normalized string for DB persistence (never an integer)
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized: string;
  error_ar?: string;
  error_fr?: string;
}

export function normalizeAlgerianPhone(input: string): string {
  if (!input) return "";
  
  // 1. Remove all whitespace, hyphens, periods, parentheses, slashes
  let clean = input.trim().replace(/[\s\.\-\(\)\/]/g, "");

  // 2. Handle international prefix
  if (clean.startsWith("+213")) {
    clean = "0" + clean.substring(4);
  } else if (clean.startsWith("00213")) {
    clean = "0" + clean.substring(5);
  } else if (clean.startsWith("213") && clean.length >= 11) {
    clean = "0" + clean.substring(3);
  }

  return clean;
}

export function validateAlgerianPhone(
  input: string,
  options: { isOptional?: boolean; fieldName_ar?: string; fieldName_fr?: string } = {}
): PhoneValidationResult {
  const { isOptional = false, fieldName_ar = "رقم الهاتف", fieldName_fr = "Numéro de téléphone" } = options;

  if (!input || input.trim() === "") {
    if (isOptional) {
      return { isValid: true, normalized: "" };
    }
    return {
      isValid: false,
      normalized: "",
      error_ar: `يرجى إدخال ${fieldName_ar}.`,
      error_fr: `Veuillez saisir le ${fieldName_fr.toLowerCase()}.`,
    };
  }

  const normalized = normalizeAlgerianPhone(input);

  // Check if string contains only digits
  if (!/^\d+$/.test(normalized)) {
    return {
      isValid: false,
      normalized,
      error_ar: `${fieldName_ar} يجب أن يحتوي على أرقام فقط.`,
      error_fr: `${fieldName_fr} ne doit contenir que des chiffres.`,
    };
  }

  // Algerian mobile pattern: starts with 05, 06, 07 and has exactly 10 digits
  const isMobile = /^(05|06|07)\d{8}$/.test(normalized);

  // Algerian fixed landline pattern: starts with 02, 03, 04 and has 9 or 10 digits
  const isLandline = /^(02|03|04)\d{7,8}$/.test(normalized);

  if (!isMobile && !isLandline) {
    return {
      isValid: false,
      normalized,
      error_ar: `يرجى إدخال ${fieldName_ar} جزائري صحيح (مثال: 0550123456 أو 0661123456 أو 0770123456).`,
      error_fr: `Veuillez saisir un ${fieldName_fr.toLowerCase()} algérien valide (ex: 0550123456).`,
    };
  }

  return {
    isValid: true,
    normalized,
  };
}
