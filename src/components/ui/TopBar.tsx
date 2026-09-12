"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeSelector } from "./ThemeSelector";
import { Badge } from "./Badge";
import { getStrategicProfile, getRegistrationDraft } from "@/lib/onboarding/profile";
import { StrategicProfile } from "@/types/onboarding";
import { StudentRegistrationData } from "@/types/registration";
import {
  Menu,
  X,
  User,
  UserPlus,
  Compass,
  Map,
  Target,
  BarChart3,
  AlertTriangle,
  Stethoscope,
  Sparkles,
  LogIn,
} from "lucide-react";

export function TopBar() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";
  const [profile, setProfile] = useState<StrategicProfile | null>(null);
  const [regData, setRegData] = useState<StudentRegistrationData | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const p = getStrategicProfile();
    if (p) setProfile(p);
    const reg = getRegistrationDraft();
    if (reg) setRegData(reg);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/dashboard", label: isAr ? "لوحة التحكم" : "Tableau de bord", icon: Compass },
    { href: "/roadmap", label: isAr ? "الخريطة" : "Feuille de route", icon: Map },
    { href: "/error-lab", label: isAr ? "مختبر الأخطاء" : "Lab d'erreurs", icon: AlertTriangle },
    { href: "/progress", label: isAr ? "تقدمي" : "Progrès", icon: BarChart3 },
    { href: "/account", label: isAr ? "حسابي" : "Mon compte", icon: User },
  ];

  const hasAccount = Boolean(profile || regData);
  const studentDisplayName = regData?.firstName || (profile ? (isAr ? "طالب بكالوريا" : "Élève") : null);

  return (
    <header className="sticky top-0 z-40 border-b border-theme bg-surface/95 backdrop-blur-md transition-colors duration-200">
      <Container size="lg" className="flex h-16 items-center justify-between px-3 sm:px-6">
        {/* Left: Logo + Optional Profile Badge */}
        <div className="flex items-center gap-3">
          <Logo size="md" showTagline={false} />
          {profile && (
            <Badge
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex text-[10px] border-theme bg-card text-theme-secondary"
            >
              {profile.streamId === "sciences_exp"
                ? (isAr ? "علوم تجريبية" : "Sciences Exp.")
                : profile.streamId}
              {profile.targetScore ? ` · ${profile.targetScore.toFixed(1)}/20` : ""}
            </Badge>
          )}
        </div>

        {/* Center Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-primary)]/25 shadow-sm"
                    : "text-theme-secondary hover:text-theme-text hover:bg-card-hover"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Desktop & Mobile Controls */}
        <div className="flex items-center gap-2">
          {/* Desktop Register CTA Button */}
          {!hasAccount && (
            <Link
              href="/auth/register"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isAr ? "تسجيل جديد" : "S'inscrire"}</span>
            </Link>
          )}

          {/* Mobile Quick Action Buttons: Register & Account */}
          <div className="flex md:hidden items-center gap-1.5">
            {!hasAccount ? (
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-[var(--color-primary)] text-white rounded-lg shadow-sm transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isAr ? "تسجيل" : "S'inscrire"}</span>
              </Link>
            ) : null}

            <Link
              href="/account"
              aria-label={isAr ? "حسابي" : "Mon compte"}
              className={`p-1.5 rounded-lg border border-theme transition-colors ${
                pathname === "/account"
                  ? "bg-[var(--color-primary-muted)] text-[var(--color-primary)] border-[var(--color-primary)]/30"
                  : "bg-card text-theme-secondary hover:text-theme-text"
              }`}
            >
              <User className="w-4 h-4" />
            </Link>
          </div>

          <ThemeSelector variant="compact" />
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            className="md:hidden p-1.5 rounded-lg border border-theme bg-card text-theme-secondary hover:text-theme-text transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-theme bg-surface/98 backdrop-blur-xl px-4 py-4 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          {/* User Status Card */}
          <div className="p-3.5 rounded-2xl bg-card border border-theme">
            {hasAccount ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/30 flex items-center justify-center text-[var(--color-primary)]">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-theme-text block">
                      {studentDisplayName || (isAr ? "طالب بكالوريا" : "Élève")}
                    </span>
                    <span className="text-[10px] text-theme-muted">
                      {regData?.wilayaName ? `${isAr ? "ولاية" : "Wilaya"} ${regData.wilayaName}` : (isAr ? "جلسة دراسية نشطة" : "Session active")}
                    </span>
                  </div>
                </div>
                <Link
                  href="/profile/academic"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[11px] font-semibold text-[var(--color-primary)] hover:underline"
                >
                  {isAr ? "الملف الدراسي ←" : "Profil →"}
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-theme-text">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? "مرحباً بك في BAC Mastery" : "Bienvenue sur BAC Mastery"}</span>
                </div>
                <p className="text-[11px] text-theme-secondary">
                  {isAr
                    ? "سجّل حسابك في دقيقة واحدة لحفظ تقدمك الدراسي وخريطتك."
                    : "Créez votre compte en 1 minute pour sauvegarder votre progression."}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[var(--color-primary)] text-white text-xs font-bold rounded-xl shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isAr ? "تسجيل جديد" : "S'inscrire"}</span>
                  </Link>
                  <Link
                    href="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-card-muted border border-theme text-theme-text text-xs font-semibold rounded-xl hover:bg-card-hover"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{isAr ? "دخول" : "Connexion"}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Primary Navigation Links Grid */}
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/auth/register"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-theme text-xs font-semibold text-theme-text hover:border-[var(--color-primary)]/50 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? "التسجيل المدرسي" : "Inscription BAC"}</span>
            </Link>

            <Link
              href="/account"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-theme text-xs font-semibold text-theme-text hover:border-[var(--color-primary)]/50 transition-colors"
            >
              <User className="w-4 h-4 text-blue-400" />
              <span>{isAr ? "حسابي وإعداداتي" : "Mon compte"}</span>
            </Link>

            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-theme text-xs font-semibold text-theme-text hover:border-[var(--color-primary)]/50 transition-colors"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? "لوحة التحكم" : "Tableau de bord"}</span>
            </Link>

            <Link
              href="/roadmap"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-theme text-xs font-semibold text-theme-text hover:border-[var(--color-primary)]/50 transition-colors"
            >
              <Map className="w-4 h-4 text-violet-400" />
              <span>{isAr ? "خريطة الطريق" : "Feuille de route"}</span>
            </Link>

            <Link
              href="/error-lab"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-theme text-xs font-semibold text-theme-text hover:border-[var(--color-primary)]/50 transition-colors"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{isAr ? "مختبر الأخطاء" : "Lab d'erreurs"}</span>
            </Link>

            <Link
              href="/diagnostic"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-theme text-xs font-semibold text-theme-text hover:border-[var(--color-primary)]/50 transition-colors"
            >
              <Stethoscope className="w-4 h-4 text-rose-400" />
              <span>{isAr ? "اختبار المستوى" : "Diagnostic"}</span>
            </Link>
          </div>

          {/* Mobile Drawer Footer: Language Switcher */}
          <div className="pt-2 border-t border-theme flex items-center justify-between">
            <span className="text-xs text-theme-muted">
              {isAr ? "لغة الواجهة:" : "Langue :"}
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
