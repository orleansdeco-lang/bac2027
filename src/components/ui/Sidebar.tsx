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
import { getStudentAccess } from "@/lib/access";
import { Logo } from "./Logo";
import { Badge } from "./Badge";
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
  Headphones,
  MessageCircle,
  ExternalLink,
  FileText,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const { user } = useAuth();
  const { theme } = useTheme();

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [profileDraft, setProfileDraft] = useState<any>(null);

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

  useEffect(() => {
    const handleAccessUpdated = (e: any) => {
      if (e?.detail) {
        setProfileDraft((prev: any) => ({ ...prev, ...e.detail }));
      }
    };
    window.addEventListener("bac_student_access_updated", handleAccessUpdated);
    return () => window.removeEventListener("bac_student_access_updated", handleAccessUpdated);
  }, []);

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

  const navLinks = [
    {
      href: "/dashboard",
      label: isAr ? "لوحة التحكم" : "Dashboard",
      icon: Compass,
      matches: (p: string) => p === "/" || p === "/dashboard",
    },
    {
      href: "/curriculum",
      label: isAr ? "المكتبة الشاملة الحرة" : "Bibliothèque libre",
      icon: BookOpen,
      matches: (p: string) => p.startsWith("/curriculum") || p.startsWith("/library"),
    },
    {
      href: "/exams",
      label: isAr ? "بنك البكالوريات (2016-2026)" : "Annales BAC (2016-2026)",
      icon: FileText,
      matches: (p: string) => (p.startsWith("/exams") && !p.startsWith("/exams/terms")) || p.startsWith("/annales"),
    },
    {
      href: "/exams/terms",
      label: isAr ? "فروض واختبارات الفصول" : "Devoirs & Examens",
      icon: GraduationCap,
      matches: (p: string) => p.startsWith("/exams/terms"),
    },
    {
      href: "/diagnostic",
      label: isAr ? "تشخيص المواد المستقل" : "Diagnostics par matière",
      icon: Stethoscope,
      matches: (p: string) => p.startsWith("/diagnostic"),
    },
    {
      href: "/roadmap",
      label: isAr ? "خريطة الطريق الذكية" : "Feuille de route",
      icon: Map,
      matches: (p: string) => p.startsWith("/roadmap"),
    },
    {
      href: "/error-lab",
      label: isAr ? "مختبر الأخطاء" : "Lab d'erreurs",
      icon: AlertTriangle,
      matches: (p: string) => p.startsWith("/error-lab") || p.startsWith("/errors"),
    },
    {
      href: "/progress",
      label: isAr ? "التقدم والنتائج" : "Ma progression",
      icon: BarChart3,
      matches: (p: string) => p.startsWith("/progress"),
    },
    {
      href: "/exam",
      label: isAr ? "وضع الامتحان" : "Mode Examen",
      icon: Target,
      matches: (p: string) => p.startsWith("/exam"),
    },
    {
      href: "/account",
      label: isAr ? "حسابي" : "Mon compte",
      icon: User,
      matches: (p: string) => p.startsWith("/account"),
    },
  ];

  return (
    <aside
      aria-label="Navigation latérale"
      className={cn(
        "hidden md:flex flex-col justify-between md:w-20 lg:w-64 xl:w-72 shrink-0 bg-sidebar border border-theme rounded-[32px] md:p-3 lg:p-5 shadow-clay transition-all duration-200 select-none",
        className
      )}
    >
      {/* Top Section: Logo & Personal Student Avatar Card */}
      <div className="space-y-4 lg:space-y-6">
        <div className="flex items-center justify-center lg:justify-between px-1">
          <Logo size="sm" href="/dashboard" />
          <span className="hidden lg:inline-flex text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface/60 border border-theme text-theme-secondary font-bold">
            BAC 2027
          </span>
        </div>

        {/* Tactile Profile Card */}
        <div className="flex flex-col items-center text-center p-2 lg:p-3.5 rounded-2xl bg-surface/50 border border-theme/70 shadow-sm">
          <div className="relative mb-1 lg:mb-2.5">
            <div className="w-11 h-11 lg:w-16 lg:h-16 rounded-full overflow-hidden border-2 border-white/80 shadow-md ring-2 ring-[var(--color-primary)]/25">
              <img
                src={avatarSrc}
                alt={firstName}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <span className="absolute bottom-0 end-0 h-3.5 w-3.5 lg:h-4 lg:w-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
          </div>

          <div className="hidden lg:block">
            <h3 className="font-bold text-sm text-theme-text font-sans">
              {isAr ? `سلام، ${firstName}! 👋` : `Hi, ${firstName}! 👋`}
            </h3>

            <div className="mt-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                {streamLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="space-y-1 lg:space-y-1.5" aria-label="Menu principal">
          {navLinks.map((item) => {
            const isActive = item.matches(pathname);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={cn(
                  "flex items-center justify-center lg:justify-start gap-3 px-2 lg:px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 group cursor-pointer",
                  isActive
                    ? "bg-card text-theme-text shadow-md shadow-black/5 font-bold scale-[1.02] border border-theme/80"
                    : "text-theme-secondary hover:text-theme-text hover:bg-surface/50 hover:translate-x-0.5"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-colors shrink-0",
                    isActive
                      ? "bg-[var(--color-primary)] text-white shadow-sm"
                      : "bg-surface/60 text-theme-secondary group-hover:text-theme-text"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                </div>
                <span className="font-sans hidden lg:inline truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Premium Upgrade Pill Card */}
      <div className="mt-4 lg:mt-6 pt-3 lg:pt-4 border-t border-theme/60">
        {/* Tablet Compact Upgrade Icon */}
        <div className="block lg:hidden text-center">
          <Link
            href="/subscribe"
            title={isPaid ? (isAr ? "اشتراكي" : "Mon Pass") : (isAr ? "ترقية الحساب" : "Passer en Pro")}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--color-primary)] text-white mx-auto shadow-sm hover:scale-105 transition-transform"
          >
            <Crown className="w-5 h-5 fill-current" />
          </Link>
        </div>

        {/* Desktop Full Upgrade Card */}
        <div className="hidden lg:block relative p-4 rounded-2xl bg-gradient-to-br from-[var(--color-primary-muted)] to-[var(--color-secondary-muted)] border border-[var(--color-primary)]/30 shadow-sm text-center overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white mx-auto mb-2 shadow-sm">
            <Crown className="w-4 h-4 fill-current" />
          </div>

          <h4 className="font-bold text-xs text-theme-text font-sans">
            {isAr ? "BAC Mastery Pro" : "Passer en Pro"}
          </h4>

          <p className="text-[11px] text-theme-secondary mt-1 leading-snug line-clamp-2">
            {isPaid
              ? (isAr ? "وصول كامل مفعل لكامل مهارات شعبتك" : "Accès illimité actif")
              : (studentProfile || profileDraft)?.access_status === "REJECTED" || (studentProfile || profileDraft)?.accessStatus === "REJECTED"
              ? (isAr ? "تم رفض وصل الدفع — راجع التفاصيل" : "Reçu rejeté — voir détails")
              : isTrial
              ? (isAr ? `فترة تجريبية: باقي ${access.remainingHours} ساعة` : `Essai actif : ${access.remainingHours}h restantes`)
              : (isAr ? "افتح كل المهارات والتصحيح الذكي" : "Débloquez tout le programme")}
          </p>

          <Link
            href="/subscribe"
            className="mt-3 block w-full py-2 px-3 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-white hover:opacity-95 active:scale-95 shadow-sm transition-all"
          >
            {isPaid
              ? (isAr ? "تفاصيل اشتراكي" : "Mon Abonnement")
              : (studentProfile || profileDraft)?.access_status === "REJECTED" || (studentProfile || profileDraft)?.accessStatus === "REJECTED"
              ? (isAr ? "إعادة إرسال الوصل ←" : "Renvoyer le reçu →")
              : (isAr ? "ترقية الحساب ←" : "Passer en Pro →")}
          </Link>
        </div>

        {/* Customer Service & Technical Support Button */}
        <div className="mt-3">
          {/* Tablet compact support button */}
          <div className="block lg:hidden text-center">
            <a
              href={`https://wa.me/213550853234?text=${encodeURIComponent("مرحباً، أحتاج إلى مساعدة ودعم فني في منصة BAC Mastery.")}`}
              target="_blank"
              rel="noopener noreferrer"
              title={isAr ? "خدمة العملاء والدعم الفني WhatsApp" : "Support technique WhatsApp"}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white mx-auto transition-colors border border-emerald-500/20"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
            </a>
          </div>

          {/* Desktop full support button */}
          <a
            href={`https://wa.me/213550853234?text=${encodeURIComponent("مرحباً، أحتاج إلى مساعدة ودعم فني في منصة BAC Mastery.")}`}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="sidebar-whatsapp-support-btn"
            className="hidden lg:flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-surface/70 hover:bg-emerald-500/10 border border-theme hover:border-emerald-500/40 text-theme-secondary hover:text-emerald-500 transition-all group cursor-pointer text-xs"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4 fill-current" />
              </div>
              <div className="text-start">
                <span className="font-bold text-[11px] text-theme-text block leading-none group-hover:text-emerald-500 font-sans">
                  {isAr ? "خدمة العملاء والدعم الفني" : "Support technique WhatsApp"}
                </span>
                <span className="text-[10px] text-theme-muted font-mono leading-none mt-1 block">
                  +213 550 85 32 34
                </span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-theme-muted group-hover:text-emerald-500 shrink-0" />
          </a>
        </div>
      </div>
    </aside>
  );
}
