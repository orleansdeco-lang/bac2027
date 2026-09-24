import { YptSubject } from "@/types/ypt";

export const YPT_BAC_SUBJECTS: YptSubject[] = [
  {
    id: "math",
    nameAr: "الرياضيات",
    nameFr: "Mathématiques",
    hexColor: "#2563EB",
    bgClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    borderClass: "border-blue-500",
    textClass: "text-blue-500",
    icon: "📐",
  },
  {
    id: "physics",
    nameAr: "العلوم الفيزيائية",
    nameFr: "Physique-Chimie",
    hexColor: "#D97706",
    bgClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    borderClass: "border-amber-500",
    textClass: "text-amber-500",
    icon: "⚡",
  },
  {
    id: "natural_sciences",
    nameAr: "علوم الطبيعة والحياة",
    nameFr: "Sciences Naturelles",
    hexColor: "#059669",
    bgClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    borderClass: "border-emerald-500",
    textClass: "text-emerald-500",
    icon: "🧬",
  },
  {
    id: "philosophy",
    nameAr: "الفلسفة",
    nameFr: "Philosophie",
    hexColor: "#7C3AED",
    bgClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    borderClass: "border-purple-500",
    textClass: "text-purple-500",
    icon: "💭",
  },
  {
    id: "arabic",
    nameAr: "اللغة العربية وآدابها",
    nameFr: "Langue Arabe",
    hexColor: "#0891B2",
    bgClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    borderClass: "border-cyan-500",
    textClass: "text-cyan-500",
    icon: "📖",
  },
  {
    id: "history_geography",
    nameAr: "التاريخ والجغرافيا",
    nameFr: "Histoire-Géo",
    hexColor: "#DC2626",
    bgClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
    borderClass: "border-rose-500",
    textClass: "text-rose-500",
    icon: "🌍",
  },
  {
    id: "islamic_studies",
    nameAr: "العلوم الإسلامية",
    nameFr: "Sciences Islamiques",
    hexColor: "#0D9488",
    bgClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
    borderClass: "border-teal-500",
    textClass: "text-teal-500",
    icon: "🕌",
  },
  {
    id: "french",
    nameAr: "اللغة الفرنسية",
    nameFr: "Français",
    hexColor: "#4F46E5",
    bgClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    borderClass: "border-indigo-500",
    textClass: "text-indigo-500",
    icon: "🇫🇷",
  },
  {
    id: "english",
    nameAr: "اللغة الإنجليزية",
    nameFr: "Anglais",
    hexColor: "#DB2777",
    bgClass: "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30",
    borderClass: "border-pink-500",
    textClass: "text-pink-500",
    icon: "🇬🇧",
  },
  {
    id: "technology",
    nameAr: "التكنولوجيا والهندسة",
    nameFr: "Génie & Technologie",
    hexColor: "#EA580C",
    bgClass: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
    borderClass: "border-orange-500",
    textClass: "text-orange-500",
    icon: "⚙️",
  },
  {
    id: "economy_law",
    nameAr: "التسيير والاقتصاد والقانون",
    nameFr: "Éco, Gestion & Droit",
    hexColor: "#65A30D",
    bgClass: "bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-500/30",
    borderClass: "border-lime-500",
    textClass: "text-lime-500",
    icon: "📊",
  },
];

export const BAC_MOTIVATIONAL_QUOTES = [
  "كل دقيقة تركيز الآن، هي نصف علامة إضافية في موضوع البكالوريا 🎯",
  "تذكر فرحة والديك ودموع الفخر يوم إعلان النتائج.. لا تستسلم الآن! 🤍",
  "النجاح لا يأتي بالصدفة، بل بتكرار هذه الساعات الهادئة بعيداً عن المشتتات ⚡",
  "جلسة دراسة بتركيز تام تعادل ساعات طويلة من التصفح المشتت 🧠",
  "ابنِ معدلك علامة بعلامة.. بكالوريا 2026/2027 بانتظار تميزك 🎓",
  "الألم والتعب مؤقت، لكن شرف التميز والتفوق يدوم طويلاً 🚀",
  "ركّز في هذه الدقائق فقط، ولا تشغل بالك بكل البرنامج في آن واحد ⏳",
  "المثابرة اليومية هي السر الحقيقي للأوائل في كل ولايات الجزائر 🇩🇿",
  "أنت لا تدرس فقط لتنجح، بل لتصنع مستقبلك الذي تستحقه ✨",
];

export function getSubjectById(id: string): YptSubject {
  return (
    YPT_BAC_SUBJECTS.find((s) => s.id === id) || {
      id: "general",
      nameAr: "مراجعة عامة",
      nameFr: "Révision Générale",
      hexColor: "#2C5E54",
      bgClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      borderClass: "border-emerald-500",
      textClass: "text-emerald-500",
      icon: "📚",
    }
  );
}

export function formatSecondsToTime(totalSeconds: number): {
  hours: string;
  minutes: string;
  seconds: string;
  formatted: string;
} {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;

  const hours = String(h).padStart(2, "0");
  const minutes = String(m).padStart(2, "0");
  const seconds = String(s).padStart(2, "0");

  return {
    hours,
    minutes,
    seconds,
    formatted: h > 0 ? `${hours}:${minutes}:${seconds}` : `${minutes}:${seconds}`,
  };
}

export function getCurrentSlotIndex(): number {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  return hour * 6 + Math.floor(minute / 10);
}
