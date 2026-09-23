/**
 * SHATER BAC — Pure Client & Server Safe Referral Code Helpers
 * Safe for both React client components and Node.js server environments (no fs/os dependencies)
 */

/**
 * Generates an Algerian student-friendly uppercase referral code that is UNIQUE to the user.
 * Format: 3-5 letters prefix + unique 4-character deterministic token from userId.
 * E.g. "AMINE4F2A" or "SHTR8B29"
 */
export function generateReferralCode(studentName?: string, userId?: string): string {
  let prefix = "SHTR";
  if (studentName) {
    const cleaned = studentName.replace(/[^a-zA-Z]/g, "").toUpperCase();
    if (cleaned.length >= 3) {
      prefix = cleaned.slice(0, 5);
    }
  }

  // Derive unique 4-character deterministic suffix from userId if provided
  if (userId) {
    const cleanId = userId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    if (cleanId.length >= 4) {
      return `${prefix}${cleanId.slice(-4)}`;
    }
    let hash = 5381;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) + hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    const token = Math.abs(hash).toString(36).toUpperCase().padStart(4, "0").slice(-4);
    return `${prefix}${token}`;
  }

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${randomSuffix}`;
}

/**
 * Builds the direct referral registration link
 */
export function generateReferralShareUrl(referralCode: string, origin?: string): string {
  const baseUrl = origin || (typeof window !== "undefined" ? window.location.origin : "https://shater-bac.dz");
  return `${baseUrl}/auth?ref=${encodeURIComponent(referralCode)}`;
}

/**
 * Builds the WhatsApp viral share message in Algerian dialect
 */
export function generateWhatsAppShareMessage(referralCode: string, origin?: string): string {
  const baseUrl = origin || (typeof window !== "undefined" ? window.location.origin : "https://shater-bac.dz");
  const link = `${baseUrl}/auth?ref=${encodeURIComponent(referralCode)}`;
  return `راك توجد للباك؟ 🎓 جرب منصة شاطر (SHATER) باطل لمدة 7 أيام كاملة! تكتشف ثغراتك وتلقى مسار مخصص ليك يضمنلك النجاح. سجل بكودي واستفاد من التجربة:\n${link}`;
}
