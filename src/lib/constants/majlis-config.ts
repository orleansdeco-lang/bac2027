/**
 * Authoritative Configuration & Privacy Guards for Diwan / Majlis
 * Enforces production-readiness, zero vanity metrics, and student privacy.
 */

export const MAJLIS_CONFIG = {
  // Feature flags
  textChatEnabled: process.env.NEXT_PUBLIC_MAJLIS_TEXT_CHAT === "true", // Default FALSE
  requiresSubscription: process.env.NEXT_PUBLIC_MAJLIS_REQUIRES_SUBSCRIPTION === "true", // Default FALSE
  demoMode: process.env.NEXT_PUBLIC_DEMO_MODE === "true",

  // Supported study streams (Ready streams)
  activeStreams: [
    "sciences_exp",
    "math",
    "technique_math",
  ] as const,

  // Stream status labels for honesty
  streamReadiness: {
    sciences_exp: { isReady: true, label: "شعبة علوم تجريبية (جاهز)" },
    math: { isReady: true, label: "شعبة رياضيات (جاهز)" },
    technique_math: { isReady: true, label: "شعبة تقني رياضي (جاهز)" },
    gestion_eco: { isReady: false, label: "شعبة تسيير واقتصاد (قريباً)" },
    lettres_philo: { isReady: false, label: "شعبة آداب وفلسفة (قريباً)" },
    langues: { isReady: false, label: "شعبة لغات أجنبية (قريباً)" },
  },

  // Fixed bounded reactions (replaces open text chat)
  reactions: [
    { id: "coffee", emoji: "☕", label: "تشجيع ☕", message: "أرسل لك كوب قهوة لصفاء الذهن ☕" },
    { id: "fire", emoji: "🔥", label: "عزيمة 🔥", message: "همّة عالية وعزيمة متقدة 🔥" },
    { id: "clap", emoji: "👏", label: "أحسنت 👏", message: "أحسنت! حل متقن ومنهجي 👏" },
    { id: "pray", emoji: "🤲", label: "بالتوفيق 🤲", message: "وفقك الله وسدد خطاك 🤲" },
  ] as const,

  // Report violation reasons
  reportReasons: [
    { id: "INAPPROPRIATE_BEHAVIOR", label: "سلوك غير لائق أو تشتيت للزملاء" },
    { id: "OFFENSIVE_CHAT", label: "ألفاظ أو رسائل مسيئة" },
    { id: "DISTRACTION", label: "عدم الجدية ومغادرة متكررة" },
    { id: "CHEATING", label: "محاولة غش أو تلاعب بالنقاط" },
    { id: "SPAM", label: "تكرار وإزعاج (سبام)" },
    { id: "OTHER", label: "سبب آخر" },
  ] as const,
};

/**
 * Format student name for strict privacy:
 * Example: "سارة بن علي" -> "سارة ب."
 * Example: "ياسين" -> "ياسين"
 * Never shows email address or part of email.
 */
export function formatStudentPrivacyName(
  fullName?: string | null,
  nickname?: string | null,
  fallback = "طالب شاطر"
): string {
  if (nickname && nickname.trim()) {
    return nickname.trim();
  }
  if (!fullName || !fullName.trim()) {
    return fallback;
  }
  const clean = fullName.trim();
  // Strip email if mistakenly passed as full name
  if (clean.includes("@")) {
    return fallback;
  }
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0];
  }
  const first = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0);
  return `${first} ${lastInitial}.`;
}

/**
 * Safety check: Fails production build if demo mode is accidentally enabled
 */
if (
  process.env.NODE_ENV === "production" &&
  process.env.NEXT_PUBLIC_DEMO_MODE === "true"
) {
  throw new Error(
    "[FATAL ERROR] NEXT_PUBLIC_DEMO_MODE cannot be true in production! Diwan must only serve 100% genuine data."
  );
}
