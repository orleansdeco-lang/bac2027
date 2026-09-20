"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { Container } from "./Container";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Badge } from "./Badge";
import { getStrategicProfile, getRegistrationDraft } from "@/lib/onboarding/profile";
import { StrategicProfile } from "@/types/onboarding";
import { StudentRegistrationData } from "@/types/registration";
import { useAuth } from "@/lib/auth/context";
import { StudentService } from "@/lib/services";
import { StudentProfile } from "@/types/student";
import { formatTrialCountdown, formatTrialExpiryDate } from "@/lib/access";
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
  BookOpen,
  Sparkles,
  LogIn,
  Clock,
  Search,
  Bell,
  FileText,
  GraduationCap,
  MessageSquareQuote,
} from "lucide-react";

export function TopBar() {
  const pathname = usePathname();
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";
  const { user } = useAuth();
  const [profile, setProfile] = useState<StrategicProfile | null>(null);
  const [regData, setRegData] = useState<StudentRegistrationData | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);

    if (user?.id) {
      const p = getStrategicProfile(user.id);
      if (p) setProfile(p);
      const reg = getRegistrationDraft(user.id);
      if (reg) setRegData(reg);

      StudentService.getProfile(user.id).then((sp) => {
        if (sp) {
          setStudentProfile(sp);
          setProfile(sp as any);
        }
      });
    } else {
      setProfile(null);
      setRegData(null);
      setStudentProfile(null);
    }
  }, [pathname, user]);

  const navLinks = [
    { href: "/dashboard", label: isAr ? "لوحة التحكم" : "Tableau de bord", icon: Compass },
    { href: "/curriculum", label: isAr ? "المكتبة الشاملة" : "Bibliothèque", icon: BookOpen },
    { href: "/exams", label: isAr ? "بنك البكالوريات" : "Annales BAC", icon: FileText },
    { href: "/exams/terms", label: isAr ? "فروض واختبارات الفصول" : "Devoirs & Examens", icon: GraduationCap },
    { href: "/experiences", label: isAr ? "بنك التجارب والعِبر" : "Témoignages & Conseils", icon: MessageSquareQuote },
    { href: "/diagnostic", label: isAr ? "تشخيص المواد" : "Diagnostics", icon: Stethoscope },
    { href: "/roadmap", label: isAr ? "الخريطة" : "Feuille de route", icon: Map },
    { href: "/error-lab", label: isAr ? "مختبر الأخطاء" : "Lab d'erreurs", icon: AlertTriangle },
    { href: "/progress", label: isAr ? "تقدمي" : "Progrès", icon: BarChart3 },
    { href: "/exam", label: isAr ? "وضع الامتحان" : "Mode Examen", icon: Target },
    { href: "/account", label: isAr ? "حسابي" : "Mon compte", icon: User },
  ];

  const hasAccount = Boolean(user || studentProfile || profile || regData);
  const studentDisplayName =
    studentProfile?.firstName ||
    regData?.firstName ||
    (profile ? (isAr ? "طالب بكالوريا" : "Élève") : null);

  const activeStream =
    studentProfile?.streamId ||
    regData?.streamId ||
    profile?.streamId ||
    "sciences_exp";

  const streamLabels: Record<string, { ar: string; fr: string }> = {
    sciences_exp: { ar: "علوم تجريبية", fr: "Sciences Exp." },
    gestion_eco: { ar: "تسيير واقتصاد", fr: "Gestion & Éco" },
    math: { ar: "رياضيات", fr: "Mathématiques" },
    technique_math: { ar: "تقني رياضي", fr: "Technique Math" },
    lettres_philo: { ar: "آداب وفلسفة", fr: "Lettres & Philo" },
    langues_etrangeres: { ar: "لغات أجنبية", fr: "Langues Étr." },
  };

  const streamLabel = activeStream && streamLabels[activeStream]
    ? (isAr ? streamLabels[activeStream].ar : streamLabels[activeStream].fr)
    : null;

  // 72-Hour Server-Anchored Trial Calculation
  const trialExpiresAt = studentProfile?.trialExpiresAt;
  const trialRemainingHours = trialExpiresAt
    ? Math.max(0, Math.ceil((new Date(trialExpiresAt).getTime() - Date.now()) / (3600 * 1000)))
    : null;
  const isTrialActive =
    studentProfile?.trialStatus === "active" &&
    trialRemainingHours !== null &&
    trialRemainingHours > 0;
  const isTrialExpired =
    studentProfile?.trialStatus === "expired" ||
    (trialRemainingHours !== null && trialRemainingHours <= 0);

  const countdownText = trialRemainingHours !== null ? formatTrialCountdown(trialRemainingHours, isAr) : "";
  const expiryDateText = trialExpiresAt ? formatTrialExpiryDate(trialExpiresAt, isAr) : "";

  const isLandingPage = pathname === "/" || pathname === "/landing";

  return (
    <header className="sticky top-0 z-40 border-b border-theme bg-surface/95 backdrop-blur-md transition-colors duration-200">
      <div className="w-full max-w-[1920px] 3xl:max-w-[2400px] mx-auto flex h-16 items-center justify-between px-3.5 sm:px-6 md:px-8 3xl:px-12">
        {/* Left: Logo + Stream Badge + Trial Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Logo size="md" showTagline={false} />
          {streamLabel && !isLandingPage && (
            <Badge
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold border-[var(--color-border-subtle)] bg-[var(--color-primary-soft)] text-[var(--color-primary)] rounded-full px-2.5"
            >
              <span>{streamLabel}</span>
            </Badge>
          )}

          {/* 7-Day Trial Countdown Indicator */}
          {isTrialActive && (
            <div
              title={
                isAr
                  ? `تنتهي التجربة بتاريخ ${expiryDateText} (متبقي: ${countdownText})`
                  : `L'essai se termine le ${expiryDateText} (restant : ${countdownText})`
              }
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-success-soft)] border border-[var(--color-success)]/30 text-[var(--color-success)] text-[10px] sm:text-xs font-mono font-bold whitespace-nowrap"
            >
              <Clock className="w-3 h-3 shrink-0 animate-pulse" />
              <span className="hidden md:inline">{isAr ? "تجربة مجانية:" : "Essai:"}</span>
              <span>{countdownText}</span>
            </div>
          )}

          {isTrialExpired && (
            <div
              title={isAr ? "انتهت الفترة التجريبية (7 أيام)" : "Période d'essai (7 jours) expirée"}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--color-warning-soft)] border border-[var(--color-warning)]/30 text-[var(--color-warning)] text-[10px] sm:text-xs font-mono font-bold whitespace-nowrap"
            >
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>{isAr ? "انتهت التجربة" : "Essai expiré"}</span>
            </div>
          )}
        </div>

        {/* Center Desktop: Landing Navigation Links or Search Pill */}
        {isLandingPage ? (
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 mx-auto">
            <Link
              href="#two-modes"
              className="text-xs font-bold text-theme-secondary hover:text-[var(--color-primary)] transition-colors"
            >
              {isAr ? "طريقتان للتعلم" : "Deux modes"}
            </Link>
            <Link
              href="#what-is-shater"
              className="text-xs font-bold text-theme-secondary hover:text-[var(--color-primary)] transition-colors"
            >
              {isAr ? "واش معناها شاطر؟" : "L'Esprit SHATER"}
            </Link>
            <Link
              href="#how-it-works"
              className="text-xs font-bold text-theme-secondary hover:text-[var(--color-primary)] transition-colors"
            >
              {isAr ? "المنظومة العملية" : "Comment ça marche ?"}
            </Link>
            <Link
              href="/curriculum"
              className="text-xs font-bold text-theme-secondary hover:text-[var(--color-primary)] transition-colors flex items-center gap-1.5"
            >
              <span>{isAr ? "المكتبة الحرة" : "Bibliothèque"}</span>
            </Link>
            <Link
              href="/experiences"
              className="text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? "بنك التجارب" : "Témoignages"}</span>
            </Link>
          </nav>
        ) : (
          <div className="hidden md:flex items-center flex-1 max-w-sm lg:max-w-md xl:max-w-lg 3xl:max-w-xl mx-3 lg:mx-6 min-w-0">
            <div className="relative w-full">
              <Search className={`w-4 h-4 text-theme-muted absolute top-2.5 ${isAr ? "right-3.5" : "left-3.5"}`} />
              <input
                type="text"
                readOnly
                placeholder={isAr ? "ابحث في مهارات المنهاج، الدروس..." : "Rechercher une compétence, formule..."}
                onClick={() => {
                  window.location.href = "/roadmap";
                }}
                className={`w-full py-1.5 rounded-full bg-card/80 border border-theme text-xs text-theme-text placeholder:text-theme-muted shadow-sm hover:border-[var(--color-border-hover)] cursor-pointer transition-all ${
                  isAr ? "pr-9 pl-4" : "pl-9 pr-4"
                }`}
              />
            </div>
          </div>
        )}

        {/* Right Action: Desktop & Mobile Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Desktop Experiences Link Button - Always visible on desktop */}
          <Link
            href="/experiences"
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${
              pathname?.startsWith("/experiences")
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                : "text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30"
            }`}
            title={isAr ? "بنك تجارب وعِبر البكالوريا" : "Témoignages & Conseils BAC"}
          >
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>{isAr ? "بنك التجارب" : "Témoignages"}</span>
          </Link>

          {/* Desktop CTA Buttons */}
          {!user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/auth"
                className="px-3 py-1.5 text-xs font-bold text-theme-secondary hover:text-theme-text rounded-xl transition-colors"
              >
                <span>{isAr ? "تسجيل الدخول" : "Connexion"}</span>
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isAr ? "ابدأ الآن" : "Démarrer"}</span>
              </Link>
            </div>
          ) : (
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{isAr ? "لوحة التحكم" : "Tableau de bord"}</span>
            </Link>
          )}

          {/* Mobile Quick Action Buttons */}
          <div className="flex md:hidden items-center gap-1.5">
            {/* Direct Mobile Experiences Button */}
            <Link
              href="/experiences"
              aria-label={isAr ? "بنك التجارب" : "Témoignages"}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
                pathname?.startsWith("/experiences")
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-sm"
                  : "text-amber-500 hover:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30"
              }`}
              title={isAr ? "بنك التجارب والعِبر" : "Témoignages & Conseils"}
            >
              <MessageSquareQuote className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="text-[11px] whitespace-nowrap">{isAr ? "التجارب" : "Avis"}</span>
            </Link>

            {!hasAccount ? (
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-[var(--color-primary)] text-white rounded-lg shadow-sm transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{isAr ? "ابدأ" : "Démarrer"}</span>
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

          {/* Notification Indicator */}
          {user && (
            <Link
              href="/progress"
              aria-label={isAr ? "التنبيهات والتقدم" : "Notifications et progrès"}
              className="hidden sm:inline-flex relative p-2 rounded-full border border-theme bg-card hover:bg-card-hover text-theme-secondary hover:text-theme-text transition-all shadow-sm"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute -top-0.5 -end-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--color-accent)] text-white text-[8px] font-bold">
                3
              </span>
            </Link>
          )}

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
      </div>

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
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      {streamLabel && (
                        <span className="text-[10px] text-cyan-400 font-semibold">
                          {streamLabel}
                        </span>
                      )}
                      {isTrialActive && (
                        <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                          · {isAr ? `تجربة 72 سا: متبقي ${trialRemainingHours} سا` : `Essai 72h: ${trialRemainingHours}h`}
                        </span>
                      )}
                      {isTrialExpired && (
                        <span className="text-[10px] text-amber-400 font-semibold">
                          · {isAr ? "انتهت التجربة" : "Essai expiré"}
                        </span>
                      )}
                    </div>
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
                  <span>{isAr ? "مرحباً بك في الشاطر" : "Bienvenue sur SHATER"}</span>
                </div>
                <p className="text-[11px] text-theme-secondary">
                  {isAr
                    ? "منظومة ذكية للتعلم والتدريب وبناء الكفاءة لشهادة البكالوريا."
                    : "Système intelligent d'apprentissage et de préparation au Baccalauréat."}
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[var(--color-primary)] text-white text-xs font-bold rounded-xl shadow-sm"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isAr ? "ابدأ الآن" : "Démarrer"}</span>
                  </Link>
                  <Link
                    href="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 bg-card-muted border border-theme text-theme-text text-xs font-semibold rounded-xl hover:bg-card-hover"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{isAr ? "تسجيل الدخول" : "Connexion"}</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Landing quick navigation links in mobile drawer */}
          {isLandingPage && (
            <div className="space-y-1 py-1 border-b border-theme/60">
              <Link
                href="#two-modes"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-2 text-xs font-bold text-theme-text hover:bg-card rounded-lg transition-colors"
              >
                {isAr ? "← طريقتان للتعلم" : "Deux modes"}
              </Link>
              <Link
                href="#what-is-shater"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-2 text-xs font-bold text-theme-text hover:bg-card rounded-lg transition-colors"
              >
                {isAr ? "← واش معناها شاطر؟" : "L'Esprit SHATER"}
              </Link>
              <Link
                href="#how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-2 text-xs font-bold text-theme-text hover:bg-card rounded-lg transition-colors"
              >
                {isAr ? "← المنظومة العملية" : "Comment ça marche ?"}
              </Link>
              <Link
                href="/curriculum"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-2 text-xs font-bold text-[var(--color-primary)] hover:bg-card rounded-lg transition-colors"
              >
                {isAr ? "← المكتبة الحرة" : "Bibliothèque Libre"}
              </Link>
            </div>
          )}

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
              href="/curriculum"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-theme text-xs font-semibold text-theme-text hover:border-[var(--color-primary)]/50 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{isAr ? "المكتبة الشاملة" : "Bibliothèque"}</span>
            </Link>

            <Link
              href="/exams"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-theme text-xs font-semibold text-theme-text hover:border-[var(--color-primary)]/50 transition-colors"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>{isAr ? "بنك البكالوريات" : "Annales BAC"}</span>
            </Link>

            <Link
              href="/experiences"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-500 hover:border-amber-500/50 transition-colors"
            >
              <MessageSquareQuote className="w-4 h-4 text-amber-500" />
              <span>{isAr ? "بنك التجارب والعِبر" : "Témoignages"}</span>
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

            <Link
              href="/exam"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-card border border-theme text-xs font-semibold text-theme-text hover:border-[var(--color-primary)]/50 transition-colors"
            >
              <Target className="w-4 h-4 text-cyan-400" />
              <span>{isAr ? "وضع الامتحان" : "Mode Examen"}</span>
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
