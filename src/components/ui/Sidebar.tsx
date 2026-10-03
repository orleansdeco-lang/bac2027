"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { useTheme } from "@/lib/theme/context";
import { getStrategicProfile, getRegistrationDraft } from "@/lib/onboarding/profile";
import { StudentProfile } from "@/types/student";
import { StudentService } from "@/lib/services";
import { getStudentAccess, formatTrialCountdown } from "@/lib/access";
import { Logo } from "./Logo";
import { Badge } from "./Badge";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { SOCIAL_CHANNELS } from "@/lib/constants/social-links";
import {
  Compass,
  Map,
  AlertTriangle,
  BarChart3,
  Target,
  User,
  Crown,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Stethoscope,
  MessageCircle,
  ExternalLink,
  FileText,
  GraduationCap,
  Gift,
  Calendar,
  X,
  Menu,
  ChevronLeft,
  ChevronRight,
  Layers,
  Calculator,
  Brain,
  Zap,
  Clock,
  Users,
  Bot,
  Landmark,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

interface NavCategory {
  title_ar: string;
  title_fr: string;
  items: {
    href: string;
    label_ar: string;
    label_fr: string;
    icon: React.ElementType;
    matches: (p: string) => boolean;
    badge?: string;
    badgeColor?: string;
    highlight?: boolean;
  }[];
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const { user } = useAuth();
  const { theme } = useTheme();

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [profileDraft, setProfileDraft] = useState<any>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      const p = getStrategicProfile(user.id);
      const reg = getRegistrationDraft(user.id);
      setProfileDraft({ ...p, ...reg });

      StudentService.getProfile(user.id).then((sp) => {
        if (sp) setStudentProfile(sp);
      });
    } else {
      setStudentProfile(null);
      setProfileDraft(null);
    }
  }, [user]);

  // Listen for access updates & mobile drawer toggle events
  useEffect(() => {
    const handleAccessUpdated = (e: any) => {
      if (e?.detail) {
        setProfileDraft((prev: any) => ({ ...prev, ...e.detail }));
      }
    };

    const handleToggleMobile = () => {
      setIsMobileOpen((prev) => !prev);
    };

    const handleCloseMobile = () => {
      setIsMobileOpen(false);
    };

    window.addEventListener("bac_student_access_updated", handleAccessUpdated);
    window.addEventListener("shater_toggle_mobile_sidebar", handleToggleMobile);
    window.addEventListener("shater_close_mobile_sidebar", handleCloseMobile);

    return () => {
      window.removeEventListener("bac_student_access_updated", handleAccessUpdated);
      window.removeEventListener("shater_toggle_mobile_sidebar", handleToggleMobile);
      window.removeEventListener("shater_close_mobile_sidebar", handleCloseMobile);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  const firstName =
    studentProfile?.firstName ||
    profileDraft?.firstName ||
    (isAr ? "طالبنا" : "Élève");

  const streamId =
    studentProfile?.streamId ||
    profileDraft?.streamId ||
    "sciences_exp";

  const streamLabels: Record<string, { ar: string; fr: string }> = {
    sciences_exp: { ar: "علوم تجريبية", fr: "Sciences Exp." },
    gestion_eco: { ar: "تسيير واقتصاد", fr: "Gestion & Éco" },
    math: { ar: "رياضيات", fr: "Mathématiques" },
    technique_math: { ar: "تقني رياضي", fr: "Technique Math" },
    lettres_philo: { ar: "آداب وفلسفة", fr: "Lettres & Philo" },
    langues_etrangeres: { ar: "لغات أجنبية", fr: "Langues Étr." },
  };

  const streamLabel = streamLabels[streamId]
    ? (isAr ? streamLabels[streamId].ar : streamLabels[streamId].fr)
    : streamId;

  const access = getStudentAccess(studentProfile || profileDraft);
  const isTrial = access.status === "TRIAL_ACTIVE";
  const isPaid = access.status === "PAID_ACTIVE";

  // Study Character Avatar chosen at registration
  const characterMap: Record<string, string> = {
    boy: "/illustrations/characters/boy.jpg",
    girl: "/illustrations/characters/girl.jpg",
    scholar: "/illustrations/characters/scholar.jpg",
  };
  const characterId = (studentProfile as any)?.characterId || (profileDraft as any)?.characterId || "scholar";
  const avatarSrc = characterMap[characterId] || "/illustrations/bac-hero.jpg";

  // Categorized Navigation Architecture
  const navigationCategories: NavCategory[] = [
    {
      title_ar: "المسار الدراسي الذكي",
      title_fr: "Parcours d'apprentissage",
      items: [
        {
          href: "/dashboard",
          label_ar: "لوحة التحكم",
          label_fr: "Tableau de bord",
          icon: Compass,
          matches: (p: string) => p === "/" || p === "/dashboard",
        },
        {
          href: "/planner",
          label_ar: "المخطط الدراسي",
          label_fr: "Mon Planner",
          icon: Calendar,
          matches: (p: string) => p.startsWith("/planner"),
          badge: isAr ? "جديد" : "Nouveau",
          badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        },
        {
          href: "/roadmap",
          label_ar: "خريطة الطريق لجميع المواد",
          label_fr: "Feuille de route",
          icon: Map,
          matches: (p: string) => p.startsWith("/roadmap"),
        },
        {
          href: "/diwan",
          label_ar: "ديوان العلم 🏛️",
          label_fr: "Diwan El Ilm",
          icon: Landmark,
          matches: (p: string) =>
            p.startsWith("/diwan") ||
            p.startsWith("/campus") ||
            p.startsWith("/table") ||
            p.startsWith("/ypt"),
        },
        {
          href: "/curriculum",
          label_ar: "منهاج ودروس شعبتي",
          label_fr: "Mon Programme",
          icon: BookOpen,
          matches: (p: string) => p.startsWith("/curriculum") || p.startsWith("/library"),
        },
      ],
    },
    {
      title_ar: "التدريب والامتحانات",
      title_fr: "Entraînement & Examens",
      items: [
        {
          href: "/exam",
          label_ar: "وضع الامتحان الرسمي",
          label_fr: "Mode Examen",
          icon: Target,
          matches: (p: string) => p.startsWith("/exam") && !p.startsWith("/exams"),
          badge: isAr ? "رسمي" : "Officiel",
          badgeColor: "bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)]/30",
        },
        {
          href: "/exams",
          label_ar: "بنك البكالوريات (2016-2026)",
          label_fr: "Annales BAC (2016-2026)",
          icon: FileText,
          matches: (p: string) => (p.startsWith("/exams") && !p.startsWith("/exams/terms")) || p.startsWith("/annales"),
        },
        {
          href: "/exams/terms",
          label_ar: "فروض واختبارات الفصول",
          label_fr: "Devoirs & Examens",
          icon: GraduationCap,
          matches: (p: string) => p.startsWith("/exams/terms"),
        },
        {
          href: "/student/error-lab",
          label_ar: "معمل الأخطاء والترميم",
          label_fr: "Lab d'erreurs & Recall",
          icon: AlertTriangle,
          matches: (p: string) => p.startsWith("/student/error-lab") || p.startsWith("/error-lab") || p.startsWith("/errors"),
          badge: isAr ? "Leitner" : "Recall",
          badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        },
        {
          href: "/student/arena/quick-recall",
          label_ar: "الاسترجاع السريع ⚡",
          label_fr: "Quick Recall Sprint",
          icon: Zap,
          matches: (p: string) => p.startsWith("/student/arena/quick-recall"),
          badge: isAr ? "نشط" : "Sprint",
          badgeColor: "bg-[var(--color-primary)]/15 text-[var(--color-primary)] border-[var(--color-primary)]/30",
        },
        {
          href: "/tutor",
          label_ar: "الأستاذ الذكي 🤖",
          label_fr: "Tuteur IA BAC",
          icon: Bot,
          matches: (p: string) => p.startsWith("/tutor"),
          badge: isAr ? "Socratic AI" : "AI Tutor",
          badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
        },
        {
          href: "/diagnostic",
          label_ar: "تشخيص المواد المستقل",
          label_fr: "Diagnostics par matière",
          icon: Stethoscope,
          matches: (p: string) => p.startsWith("/diagnostic"),
        },
        {
          href: "/memorize",
          label_ar: "لعبة الحفظ (شخصيات وتواريخ)",
          label_fr: "Jeu de Mémorisation (BAC)",
          icon: Brain,
          matches: (p: string) => p.startsWith("/memorize"),
          badge: isAr ? "جديد 🧠" : "Nouveau",
          badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
        },
        {
          href: "/calculator",
          label_ar: "حاسبة معدل البكالوريا",
          label_fr: "Calculateur de Moyenne BAC",
          icon: GraduationCap,
          matches: (p: string) => p.startsWith("/calculator"),
          badge: isAr ? "رسمية" : "Officiel",
          badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        },
        {
          href: "/orientation",
          label_ar: "مستكشف التوجيه الجامعي 🎓",
          label_fr: "Orientation Universitaire (MESRS)",
          icon: Compass,
          matches: (p: string) => p.startsWith("/orientation"),
          badge: isAr ? "منشور 2026" : "MESRS 2026",
          badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        },
      ],
    },
    {
      title_ar: "التقدم والمكافآت",
      title_fr: "Progression & Avantages",
      items: [
        {
          href: "/progress",
          label_ar: "التقدم والإحصائيات",
          label_fr: "Ma progression",
          icon: BarChart3,
          matches: (p: string) => p.startsWith("/progress"),
        },
        {
          href: "/referral",
          label_ar: "دعوة الأصدقاء (تخفيض 10%)",
          label_fr: "Parrainage (-10%)",
          icon: Gift,
          matches: (p: string) => p.startsWith("/referral"),
          badge: "-10%",
          badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
        },
        {
          href: "/account",
          label_ar: "حسابي الشخصي",
          label_fr: "Mon compte",
          icon: User,
          matches: (p: string) => p.startsWith("/account"),
        },
      ],
    },
  ];

  // Common Nav Content shared between Desktop Sidebar and Mobile Drawer
  const renderSidebarContent = (isMobile: boolean = false) => (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="space-y-5">
        {/* Header: Logo & 3D Scientific Calculator Button */}
        <div className="flex items-center justify-between px-1">
          <Logo size="sm" href="/dashboard" />
          <Link
            href="/scientific-calculator"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2C5E54] hover:bg-[#20473f] text-white border border-emerald-600/40 text-xs font-black transition-all shadow-sm hover:shadow-md hover:scale-102 active:scale-98 group cursor-pointer"
            title={isAr ? "الآلة الحاسبة العلمية" : "Calculatrice Scientifique"}
          >
            <span className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:rotate-12 transition-transform">
              <Calculator className="w-3.5 h-3.5 text-white" />
            </span>
            <span className="tracking-wide text-white font-extrabold">{isAr ? "الآلة الحاسبة 🔬" : "Calculatrice 🔬"}</span>
          </Link>
          {isMobile && (
            <button
              type="button"
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 rounded-xl border border-theme bg-surface hover:bg-surface-soft text-theme-secondary transition-colors"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Student Profile Identity Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-theme shadow-xs">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-xs ring-2 ring-[var(--color-primary)]/20">
              <img
                src={avatarSrc}
                alt={firstName}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <span className="absolute -bottom-0.5 -end-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-xs text-theme-text font-sans truncate">
              {isAr ? `سلام، ${firstName}! 👋` : `Salut, ${firstName}! 👋`}
            </h3>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-primary)]/20 truncate">
                {streamLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Grouped Navigation Links */}
        <nav className="space-y-5" aria-label="Menu de navigation">
          {navigationCategories.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <div className="px-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-theme-muted font-sans">
                  {isAr ? group.title_ar : group.title_fr}
                </span>
              </div>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.matches(pathname);
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => isMobile && setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 group cursor-pointer",
                        isActive
                          ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)] font-bold shadow-xs border border-[var(--color-primary)]/25"
                          : item.highlight
                          ? "text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 border border-transparent hover:border-amber-500/20"
                          : "text-theme-secondary hover:text-theme-text hover:bg-card border border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={cn(
                            "p-1.5 rounded-lg transition-colors shrink-0",
                            isActive
                              ? "bg-[var(--color-primary)] text-white shadow-xs"
                              : item.highlight
                              ? "bg-amber-500/15 text-amber-600 group-hover:bg-amber-500 group-hover:text-white"
                              : "bg-surface-soft text-theme-secondary group-hover:text-theme-text"
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                        </div>
                        <span className="font-sans truncate">
                          {isAr ? item.label_ar : item.label_fr}
                        </span>
                      </div>

                      {item.badge && (
                        <span
                          className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-md border font-mono shrink-0",
                            item.badgeColor || "bg-card border-theme text-theme-muted"
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Section: Premium Card & Support Direct Action */}
      <div className="pt-4 border-t border-theme/70 space-y-3">
        {/* Pass Status / Pro Card */}
        <div className="p-3.5 rounded-2xl bg-card border border-[var(--color-primary)]/25 shadow-xs text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-theme-text font-sans">
            <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>
              {isPaid
                ? (isAr ? "الشاطر بريميوم • مفعل" : "Pass Actif • Pro")
                : isTrial
                ? (isAr ? "تجربة بريميوم (3 أيام)" : "Essai Pro (3 Jours)")
                : (isAr ? "انتهت فترة التجربة" : "Essai terminé")}
            </span>
          </div>

          <p className="text-[11px] text-theme-secondary leading-snug">
            {isPaid
              ? (isAr ? "وصول كامل مفتوح لكل مواد وتمارين شعبتك." : "Accès illimité actif.")
              : isTrial
              ? (isAr ? `باقي في التجربة: ${formatTrialCountdown(access.remainingHours, true)}` : `Essai : ${access.remainingHours}h restantes`)
              : (isAr ? "يرجى تفعيل اشتراكك لمتابعة استخدام المنصة." : "Veuillez activer votre abonnement pour continuer.")}
          </p>

          <Link
            href="/subscribe"
            onClick={() => isMobile && setIsMobileOpen(false)}
            className="block w-full py-1.5 px-3 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] active:scale-98 shadow-xs transition-all"
          >
            {isPaid
              ? (isAr ? "تفاصيل الاشتراك" : "Mon Abonnement")
              : isTrial
              ? (isAr ? "الاشتراك الكامل ←" : "S'abonner ←")
              : (isAr ? "تفعيل الاشتراك الآن ←" : "Activer l'abonnement →")}
          </Link>
        </div>


        {/* Support & Social Channels Hub */}
        <div className="p-3 rounded-2xl bg-card border border-theme shadow-xs space-y-2.5">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-bold text-theme-text font-sans">
              {isAr ? "تواصل معنا والدعم الفني" : "Support & Réseaux"}
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              {isAr ? "متاح" : "En ligne"}
            </span>
          </div>

          {/* Quick Direct Chat: WhatsApp & Telegram */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={SOCIAL_CHANNELS.whatsapp.url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="sidebar-whatsapp-btn"
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition-all shadow-xs group cursor-pointer"
              title={isAr ? "تواصل معنا عبر واتساب" : "Contacter sur WhatsApp"}
            >
              <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">{isAr ? "واتساب" : "WhatsApp"}</span>
            </a>

            <a
              href={SOCIAL_CHANNELS.telegram.url}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="sidebar-telegram-btn"
              className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 hover:border-sky-500/50 text-sky-700 dark:text-sky-400 text-xs font-bold transition-all shadow-xs group cursor-pointer"
              title={isAr ? "انضم لقناتنا على تيليغرام" : "Canal Telegram"}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="shrink-0 text-sky-500 group-hover:scale-110 transition-transform">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.61 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.75 3.98-1.73 6.64-2.87 7.98-3.43 3.8-1.58 4.59-1.86 5.11-1.87.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.04.2z" />
              </svg>
              <span className="truncate">{isAr ? "تيليغرام" : "Telegram"}</span>
            </a>
          </div>

          {/* Social Communities Bar: Instagram, Facebook, TikTok, YouTube */}
          <div className="flex items-center justify-between pt-1 border-t border-theme/60">
            <span className="text-[10px] text-theme-muted font-sans">
              {isAr ? "صفحاتنا:" : "Réseaux:"}
            </span>
            <div className="flex items-center gap-1.5">
              <a
                href={SOCIAL_CHANNELS.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="sidebar-instagram-btn"
                className="w-7 h-7 rounded-lg bg-surface hover:bg-[#E1306C]/10 border border-theme hover:border-[#E1306C]/30 text-theme-muted hover:text-[#E1306C] flex items-center justify-center transition-all shadow-2xs group cursor-pointer"
                title={isAr ? "إنستغرام" : "Instagram"}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>

              <a
                href={SOCIAL_CHANNELS.facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="sidebar-facebook-btn"
                className="w-7 h-7 rounded-lg bg-surface hover:bg-[#1877F2]/10 border border-theme hover:border-[#1877F2]/30 text-theme-muted hover:text-[#1877F2] flex items-center justify-center transition-all shadow-2xs group cursor-pointer"
                title={isAr ? "فيسبوك" : "Facebook"}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="group-hover:scale-110 transition-transform">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              <a
                href={SOCIAL_CHANNELS.tiktok.url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="sidebar-tiktok-btn"
                className="w-7 h-7 rounded-lg bg-surface hover:bg-slate-900/10 border border-theme hover:border-slate-800/30 text-theme-muted hover:text-theme-text flex items-center justify-center transition-all shadow-2xs group cursor-pointer"
                title={isAr ? "تيك توك" : "TikTok"}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="group-hover:scale-110 transition-transform">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.4a6.33 6.33 0 0 0-.85-.06A6.34 6.34 0 0 0 3.14 15.7a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V9.05a8.28 8.28 0 0 0 3.77.92V6.69z"/>
                </svg>
              </a>

              <a
                href={SOCIAL_CHANNELS.youtube.url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="sidebar-youtube-btn"
                className="w-7 h-7 rounded-lg bg-surface hover:bg-[#FF0000]/10 border border-theme hover:border-[#FF0000]/30 text-theme-muted hover:text-[#FF0000] flex items-center justify-center transition-all shadow-2xs group cursor-pointer"
                title={isAr ? "يوتيوب" : "YouTube"}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="group-hover:scale-110 transition-transform">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Language Switcher at the very bottom */}
        <div className="pt-2 border-t border-theme/60 space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider font-sans">
              {isAr ? "لغة المنصة" : "Langue"}
            </span>
          </div>
          <LanguageSwitcher variant="sidebar" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sleek Sidebar */}
      <aside
        aria-label="Navigation latérale"
        className={cn(
          "hidden md:flex flex-col justify-between w-64 xl:w-72 shrink-0 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto bg-sidebar/85 backdrop-blur-md border border-theme rounded-3xl p-4 shadow-clay select-none scrollbar-thin transition-all duration-200",
          className
        )}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* 2. Mobile Full-Featured Slide-Over Drawer */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50" dir={isAr ? "rtl" : "ltr"}>
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Drawer Panel - Anchored cleanly to start (right in RTL, left in LTR) */}
          <div
            className={cn(
              "fixed inset-y-0 start-0 z-50 w-[82%] max-w-xs bg-sidebar border-e border-theme h-full p-5 overflow-y-auto shadow-2xl",
              isAr
                ? "animate-in slide-in-from-right duration-250"
                : "animate-in slide-in-from-left duration-250"
            )}
          >
            {renderSidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
