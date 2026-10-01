/**
 * الشاطر | SHATER - Social Media & Support Channels Configuration
 * روابط قنوات التواصل الاجتماعي والدعم الفني
 * 
 * يمكنك تعديل الروابط أدناه مباشرة لتوجيه الزوار إلى صفحاتك وحساباتك الرسمية:
 */

export interface SocialChannel {
  id: "whatsapp" | "telegram" | "facebook" | "instagram" | "tiktok" | "youtube";
  name_ar: string;
  name_fr: string;
  url: string;
  color: string;
  hoverBg: string;
  badge_ar?: string;
  badge_fr?: string;
}

export const SOCIAL_CHANNELS: Record<string, SocialChannel> = {
  whatsapp: {
    id: "whatsapp",
    name_ar: "واتساب الدعم",
    name_fr: "WhatsApp Support",
    // عدّل رابط الواتساب هنا (مع رقمك أو رابط المجموعة):
    url: "https://wa.me/213550853234?text=" + encodeURIComponent("مرحباً، أحتاج إلى مساعدة ودعم فني في منصة الشاطر للبكالوريا."),
    color: "#25D366",
    hoverBg: "hover:bg-[#25D366]/15 hover:border-[#25D366]/40 text-[#25D366]",
    badge_ar: "مباشر",
    badge_fr: "Direct",
  },
  telegram: {
    id: "telegram",
    name_ar: "تيليغرام",
    name_fr: "Telegram",
    // عدّل رابط قناة أو بوت التيليغرام هنا:
    url: "https://t.me/+-b12gmOJV2diZjQ0",
    color: "#229ED9",
    hoverBg: "hover:bg-[#229ED9]/15 hover:border-[#229ED9]/40 text-[#229ED9]",
    badge_ar: "القناة الرسمية",
    badge_fr: "Canal",
  },
  instagram: {
    id: "instagram",
    name_ar: "إنستغرام",
    name_fr: "Instagram",
    // عدّل رابط حساب الإنستغرام هنا:
    url: "https://www.instagram.com/shater.dz",
    color: "#E1306C",
    hoverBg: "hover:bg-[#E1306C]/15 hover:border-[#E1306C]/40 text-[#E1306C]",
  },
  facebook: {
    id: "facebook",
    name_ar: "فيسبوك",
    name_fr: "Facebook",
    // عدّل رابط صفحة الفيسبوك هنا:
    url: "https://www.facebook.com/profile.php?id=61594217893620",
    color: "#1877F2",
    hoverBg: "hover:bg-[#1877F2]/15 hover:border-[#1877F2]/40 text-[#1877F2]",
  },
  tiktok: {
    id: "tiktok",
    name_ar: "تيك توك",
    name_fr: "TikTok",
    // عدّل رابط حساب التيك توك هنا:
    url: "https://tiktok.com/@shater_bac",
    color: "#000000",
    hoverBg: "hover:bg-slate-800/15 hover:border-slate-800/40 text-theme-text",
  },
  youtube: {
    id: "youtube",
    name_ar: "يوتيوب",
    name_fr: "YouTube",
    // عدّل رابط قناة اليوتيوب هنا:
    url: "https://youtube.com/@shater_bac",
    color: "#FF0000",
    hoverBg: "hover:bg-[#FF0000]/15 hover:border-[#FF0000]/40 text-[#FF0000]",
  },
};
