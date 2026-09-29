/**
 * Authoritative Configuration & Privacy Guards for Diwan / Majlis
 * Enforces production-readiness, zero vanity metrics, and student privacy.
 */

export const MAJLIS_CONFIG = {
  // Feature flags: Text chat is enabled and monitored authoritatively
  textChatEnabled: process.env.NEXT_PUBLIC_MAJLIS_TEXT_CHAT !== "false", // Default TRUE
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

  // Session duration presets (in minutes)
  durationOptions: [
    { minutes: 25, label: "25 دقيقة (جلسة بومودورو مركزة ⏱️)" },
    { minutes: 45, label: "45 دقيقة (حصة نموذجية 🎯)" },
    { minutes: 60, label: "60 دقيقة (ساعة كاملة ⚡)" },
    { minutes: 90, label: "90 دقيقة (جلسة تعمّق 🧠)" },
    { minutes: 120, label: "120 دقيقة (محاكاة بكالوريا 📝)" },
  ] as const,

  // Fixed bounded reactions
  reactions: [
    { id: "coffee", emoji: "☕", label: "تشجيع ☕", message: "أرسل لك كوب قهوة لصفاء الذهن ☕" },
    { id: "fire", emoji: "🔥", label: "عزيمة 🔥", message: "همّة عالية وعزيمة متقدة 🔥" },
    { id: "clap", emoji: "👏", label: "أحسنت 👏", message: "أحسنت! حل متقن ومنهجي 👏" },
    { id: "pray", emoji: "🤲", label: "بالتوفيق 🤲", message: "وفقك الله وسدد خطاك 🤲" },
  ] as const,

  // Report violation reasons (Student, Message, Room)
  reportReasons: [
    { id: "OFFENSIVE_CHAT", label: "ألفاظ أو رسائل مسيئة في المحادثة" },
    { id: "INAPPROPRIATE_BEHAVIOR", label: "سلوك غير لائق أو تشتيت للزملاء" },
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
 * Never shows email address, email prefix (e.g. azinox27), or raw IDs.
 */
export function formatStudentPrivacyName(
  fullName?: string | null,
  nickname?: string | null,
  fallback = "طالب شاطر"
): string {
  if (nickname && nickname.trim()) {
    const cleanNick = nickname.trim();
    if (
      !cleanNick.includes("@") &&
      !/^[a-zA-Z0-9._-]{3,}\d+$/.test(cleanNick) &&
      !/^user[-_]/i.test(cleanNick) &&
      !/^mem[-_]/i.test(cleanNick)
    ) {
      return cleanNick;
    }
  }

  if (!fullName || !fullName.trim()) {
    return fallback;
  }

  const clean = fullName.trim();

  // Strictly reject email addresses, email prefixes with digits/underscores, or raw system IDs
  if (
    clean.includes("@") ||
    /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/.test(clean) ||
    /^[a-zA-Z0-9._-]{3,}\d+$/.test(clean) ||
    /^user[-_]/i.test(clean) ||
    /^mem[-_]/i.test(clean) ||
    /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(clean)
  ) {
    return fallback;
  }

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    // If it's a single word containing Latin letters and numbers (like azinox27), reject
    if (/^[a-zA-Z0-9_-]+$/.test(parts[0]) && /\d/.test(parts[0])) {
      return fallback;
    }
    return parts[0];
  }

  const first = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0);
  return `${first} ${lastInitial}.`;
}

/**
 * Character avatars registered in SHATER BAC
 */
export const CHARACTER_AVATARS: Record<string, string> = {
  boy: "/illustrations/characters/boy.jpg",
  girl: "/illustrations/characters/girl.jpg",
  scholar: "/illustrations/characters/scholar.jpg",
};

/**
 * Resolves complete student identity (Privacy Name + Wilaya Code + Registered Character Avatar)
 */
export function resolveStudentIdentity(params: {
  user?: any;
  profile?: any;
  draft?: any;
  fallbackWilaya?: string;
}): {
  name: string;
  wilayaCode: string;
  avatar: string;
} {
  const { user, profile, draft, fallbackWilaya = "16" } = params;

  // 1. Resolve character avatar chosen at registration
  const charId =
    profile?.characterId ||
    (profile as any)?.character_id ||
    draft?.characterId ||
    user?.user_metadata?.character_id ||
    "scholar";

  const avatar = CHARACTER_AVATARS[charId] || "/illustrations/characters/scholar.jpg";

  // 2. Resolve Algerian Wilaya Code (01 to 58)
  const rawWilaya =
    profile?.wilayaCode ||
    (profile as any)?.wilaya_code ||
    draft?.wilayaCode ||
    user?.user_metadata?.wilaya_code ||
    fallbackWilaya;

  const wilayaCode = String(rawWilaya).padStart(2, "0");

  // 3. Resolve student privacy name (e.g. "أحمد .ب")
  const rawName =
    profile?.fullName ||
    (profile as any)?.full_name ||
    draft?.fullName ||
    (draft?.firstName ? `${draft.firstName} ${draft?.lastName || ""}` : null) ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "طالب شاطر";

  const name = formatStudentPrivacyName(rawName);

  return { name, wilayaCode, avatar };
}


/**
 * Formats time strictly in Africa/Algiers timezone (UTC+1)
 * regardless of the client machine's local timezone.
 */
export function formatAlgiersTime(dateOrIso: string | Date | number, includeLabel = true): string {
  try {
    const d = typeof dateOrIso === "string" || typeof dateOrIso === "number" ? new Date(dateOrIso) : dateOrIso;
    if (isNaN(d.getTime())) {
      return includeLabel ? "20:00 (توقيت الجزائر)" : "20:00";
    }
    const timeStr = new Intl.DateTimeFormat("fr-DZ", {
      timeZone: "Africa/Algiers",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(d);
    return includeLabel ? `${timeStr} (توقيت الجزائر)` : timeStr;
  } catch {
    return includeLabel ? "20:00 (توقيت الجزائر)" : "20:00";
  }
}

/**
 * Formats date strictly in Africa/Algiers timezone
 */
export function formatAlgiersDate(dateOrIso: string | Date | number): string {
  try {
    const d = typeof dateOrIso === "string" || typeof dateOrIso === "number" ? new Date(dateOrIso) : dateOrIso;
    if (isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("ar-DZ", {
      timeZone: "Africa/Algiers",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(d);
  } catch {
    return "";
  }
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
