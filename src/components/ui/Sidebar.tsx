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
    const p = getStrategicProfile();
    const reg = getRegistrationDraft();
    setProfileDraft({ ...p, ...reg });

    if (user?.id) {
      StudentService.getProfile(user.id).then((sp) => {
        if (sp) setStudentProfile(sp);
      });
    }
  }, [user]);

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

  // Avatar image matching the active theme personality
  const avatarSrc =
    theme === "edge"
      ? "/illustrations/hero-edge.jpg"
      : theme === "bloom"
      ? "/illustrations/hero-bloom.jpg"
      : "/illustrations/hero-focus.jpg";

  const navLinks = [
    {
      href: "/dashboard",
      label: isAr ? "لوحة التحكم" : "Dashboard",
      icon: Compass,
      matches: (p: string) => p === "/" || p === "/dashboard",
    },
    {
      href: "/roadmap",
      label: isAr ? "خريطة الطريق" : "Feuille de route",
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
      label: isAr ? "حسابي والمظهر" : "Mon espace",
      icon: User,
      matches: (p: string) => p.startsWith("/account"),
    },
  ];

  return (
    <aside
      aria-label="Navigation latérale"
      className={cn(
        "hidden md:flex flex-col justify-between w-64 shrink-0 bg-sidebar border border-theme rounded-[32px] p-5 shadow-clay transition-all duration-200 select-none",
        className
      )}
    >
      {/* Top Section: Logo & Personal Student Avatar Card */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo size="sm" />
          </Link>
          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface/60 border border-theme text-theme-secondary font-bold">
            BAC 2027
          </span>
        </div>

        {/* Tactile Profile Card */}
        <div className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-surface/50 border border-theme/70 shadow-sm">
          <div className="relative mb-2.5">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/80 shadow-md ring-2 ring-[var(--color-primary)]/25">
              <img
                src={avatarSrc}
                alt={firstName}
                className="w-full h-full object-cover object-top"
              />
            </div>
            <span className="absolute bottom-0 end-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow-sm" />
          </div>

          <h3 className="font-bold text-sm text-theme-text font-sans">
            {isAr ? `سلام، ${firstName}! 👋` : `Hi, ${firstName}! 👋`}
          </h3>

          <div className="mt-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-primary)]/20">
              {streamLabel}
            </span>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="space-y-1.5" aria-label="Menu principal">
          {navLinks.map((item) => {
            const isActive = item.matches(pathname);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 group cursor-pointer",
                  isActive
                    ? "bg-card text-theme-text shadow-md shadow-black/5 font-bold scale-[1.02] border border-theme/80"
                    : "text-theme-secondary hover:text-theme-text hover:bg-surface/50 hover:translate-x-0.5"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-xl transition-colors",
                    isActive
                      ? "bg-[var(--color-primary)] text-white shadow-sm"
                      : "bg-surface/60 text-theme-secondary group-hover:text-theme-text"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                </div>
                <span className="font-sans">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Premium Upgrade Pill Card */}
      <div className="mt-6 pt-4 border-t border-theme/60">
        <div className="relative p-4 rounded-2xl bg-gradient-to-br from-[var(--color-primary-muted)] to-[var(--color-secondary-muted)] border border-[var(--color-primary)]/30 shadow-sm text-center overflow-hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--color-primary)] text-white mx-auto mb-2 shadow-sm">
            <Crown className="w-4 h-4 fill-current" />
          </div>

          <h4 className="font-bold text-xs text-theme-text font-sans">
            {isAr ? "BAC Mastery Pro" : "Passer en Pro"}
          </h4>

          <p className="text-[11px] text-theme-secondary mt-1 leading-snug line-clamp-2">
            {isPaid
              ? (isAr ? "وصول كامل مفعل لكامل مهارات شعبتك" : "Accès illimité actif")
              : isTrial
              ? (isAr ? `فترة تجريبية: باقي ${access.remainingHours} ساعة` : `Essai actif : ${access.remainingHours}h restantes`)
              : (isAr ? "افتح كل المهارات والتصحيح الذكي" : "Débloquez tout le programme")}
          </p>

          <Link
            href="/subscribe"
            className="mt-3 block w-full py-2 px-3 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-white hover:opacity-95 active:scale-95 shadow-sm transition-all"
          >
            {isPaid ? (isAr ? "تفاصيل اشتراكي" : "Mon Abonnement") : (isAr ? "ترقية الحساب ←" : "Passer en Pro →")}
          </Link>
        </div>
      </div>
    </aside>
  );
}
