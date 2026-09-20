"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth/context";
import { useTranslation } from "@/lib/i18n/context";
import { useTheme } from "@/lib/theme/context";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  UserPlus,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { StudentService } from "@/lib/services";
import { purgeUserAndLegacyStorage, getRegistrationDraft } from "@/lib/onboarding/profile";

function AuthContent() {
  const router = useRouter();
  const { direction, locale } = useTranslation();
  const isRTL = direction === "rtl";
  const { signIn, signUp, user, isLoading } = useAuth();
  const { theme } = useTheme();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const searchParams = useSearchParams();

  // Initialize mode from query param if provided
  React.useEffect(() => {
    const qMode = searchParams.get("mode");
    if (qMode === "signup" || qMode === "login") {
      setMode(qMode);
    }
    const qRef = searchParams.get("ref");
    if (qRef) {
      try {
        localStorage.setItem("shater_pending_referral_code", qRef.trim().toUpperCase());
      } catch {}
    }
  }, [searchParams]);

  // If already logged in, redirect to the appropriate step
  React.useEffect(() => {
    if (!isLoading && user) {
      StudentService.getProfile(user.id).then((p) => {
        const regDraft = getRegistrationDraft(user.id);
        const rawRedirect = searchParams.get("redirectTo");
        const target = rawRedirect && rawRedirect.startsWith("/") ? rawRedirect : "/dashboard";
        const isRegistered = Boolean(
          p?.registrationCompletedAt ||
          (p as any)?.registration_completed_at ||
          (p?.firstName && p?.streamId) ||
          ((p as any)?.first_name && (p as any)?.stream_id) ||
          (regDraft?.registrationCompletedAt && (regDraft?.firstName || regDraft?.streamId))
        );
        if (!isRegistered) {
          router.push(rawRedirect ? `/auth/register?redirectTo=${encodeURIComponent(rawRedirect)}` : "/auth/register");
        } else {
          router.push(target);
        }
      });
    }
  }, [user, isLoading, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg(
        locale === "fr"
          ? "Veuillez renseigner tous les champs."
          : "يرجى ملء جميع الحقول المطلوبة."
      );
      return;
    }

    if (password.length < 6) {
      setErrorMsg(
        locale === "fr"
          ? "Le mot de passe doit comporter au moins 6 caractères."
          : "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل."
      );
      return;
    }

    if (mode === "signup" && password !== passwordConfirmation) {
      setErrorMsg(
        locale === "fr"
          ? "Les mots de passe ne correspondent pas."
          : "كلمات المرور غير متطابقة."
      );
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "login") {
        const { user: loggedInUser, error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else if (loggedInUser) {
          await StudentService.handleAuthSessionMigration(loggedInUser.id);
          const profile = await StudentService.getProfile(loggedInUser.id);
          const regDraft = getRegistrationDraft(loggedInUser.id);
          const { trackEvent } = await import("@/lib/analytics");
          trackEvent("login_completed", { userId: loggedInUser.id });
          const rawRedirect = searchParams.get("redirectTo");
          const target = rawRedirect && rawRedirect.startsWith("/") ? rawRedirect : "/dashboard";
          const isRegistered = Boolean(
            profile?.registrationCompletedAt ||
            (profile as any)?.registration_completed_at ||
            (profile?.firstName && profile?.streamId) ||
            ((profile as any)?.first_name && (profile as any)?.stream_id) ||
            (regDraft?.registrationCompletedAt && (regDraft?.firstName || regDraft?.streamId))
          );
          if (!isRegistered) {
            router.push(rawRedirect ? `/auth/register?redirectTo=${encodeURIComponent(rawRedirect)}` : "/auth/register");
          } else {
            router.push(target);
          }
        }
      } else {
        const { user: newUser, error } = await signUp(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else if (newUser) {
          // Clean slate for new account: eradicate any previous session state
          purgeUserAndLegacyStorage(newUser.id);
          const { trackEvent } = await import("@/lib/analytics");
          trackEvent("trial_started", { userId: newUser.id, durationHours: 168 });
          setSuccessMsg(
            locale === "fr"
              ? "Compte créé avec succès ! Votre essai gratuit de 7 jours débute dès maintenant."
              : "تم إنشاء حسابك بنجاح! بدأت تجربتك المجانية الكاملة لمدة 7 أيام."
          );
          setTimeout(() => {
            router.push("/auth/register");
          }, 600);
        }
      }
    } catch {
      setErrorMsg(
        locale === "fr"
          ? "Une erreur inattendue est survenue."
          : "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Unified Signature 3D Editorial Illustration: Boy and Girl together
  const peekingIllustration = "/illustrations/bac-peeking.jpg";

  return (
    <div className="min-h-screen bg-canvas text-theme-text flex flex-col justify-between py-5 sm:py-6 transition-colors duration-300 relative overflow-x-hidden">
      
      {/* Background Soft Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-b from-[var(--color-primary-soft)] via-[var(--color-secondary)]/10 to-transparent pointer-events-none blur-3xl" />

      {/* Header */}
      <header className="border-b border-theme/60 pb-4 relative z-20">
        <Container className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2.5">
            <LanguageSwitcher />
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-6 sm:py-10 relative z-10">
        <Container size="sm" className="w-full max-w-[460px]">
          
          {/* Outer Billboard Card Container */}
          <div className="relative rounded-[36px] bg-card text-theme-text border border-theme shadow-clay overflow-hidden transition-all">
            
            {/* Top Peeking 3D Illustration Area */}
            <div className="relative h-44 sm:h-52 w-full bg-[#EFE9DC] overflow-hidden flex items-end justify-center border-b border-theme">
              <div className="relative w-full h-full transform translate-y-1">
                <Image
                  src={peekingIllustration}
                  alt="طلبة الشاطر | SHATER"
                  fill
                  className="object-cover object-top drop-shadow-sm"
                  priority
                />
              </div>

              {/* Floating Badge */}
              <div className="absolute top-3.5 left-3.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/95 text-theme-text shadow-sm border border-theme backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  <span>BAC 2027</span>
                </span>
              </div>
            </div>

            {/* Inner White Form Container (The Board Held by the Characters) */}
            <div className="p-6 sm:p-8 space-y-5 bg-card">
              
              {/* Segmented Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-surface border border-theme rounded-full shadow-inner">
                <button
                  data-testid="auth-mode-login"
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    mode === "login"
                      ? "bg-[var(--color-primary)] text-white shadow-md"
                      : "text-theme-secondary hover:text-theme-text"
                  }`}
                >
                  {locale === "fr" ? "Connexion" : "تسجيل الدخول"}
                </button>
                <button
                  data-testid="auth-mode-signup"
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className={`py-2 text-xs font-bold rounded-full transition-all cursor-pointer ${
                    mode === "signup"
                      ? "bg-[var(--color-primary)] text-white shadow-md"
                      : "text-theme-secondary hover:text-theme-text"
                  }`}
                >
                  {locale === "fr" ? "Créer un compte" : "حساب جديد"}
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-black text-theme-text tracking-tight font-sans">
                  {mode === "login"
                    ? locale === "fr"
                      ? "Bon retour parmi nous !"
                      : "مرحباً بك مجدداً 👋"
                    : locale === "fr"
                    ? "Rejoignez SHATER"
                    : "ابدأ مسارك مع الشاطر"}
                </h1>
                <p className="text-xs text-theme-secondary font-medium">
                  {locale === "fr"
                    ? "Pas ce que vous lisez. Comment y arriver."
                    : "ماشي واش تقرا. كيفاش توصل."}
                </p>
              </div>

              {/* Free Trial Banner in Signup Mode */}
              {mode === "signup" && (
                <div className="p-3.5 bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/30 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[var(--color-primary)]">
                    <Sparkles className="w-4 h-4 shrink-0 text-[var(--color-primary)]" />
                    <span>
                      {locale === "fr"
                        ? "Essai gratuit de 72 heures inclus"
                        : "فترة تجريبية مجانية لمدة 72 ساعة"}
                    </span>
                  </div>
                  <p className="text-theme-secondary text-[11px] leading-relaxed">
                    {locale === "fr"
                      ? "Accès complet immédiat aux matières de votre filière et à votre diagnostic initial."
                      : "وصول كامل ومباشر لمواد شعبتك والتشخيص الأولي دون أي التزام مالي."}
                  </p>
                </div>
              )}

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3.5 bg-[var(--color-error-soft)] border border-[var(--color-error)]/30 rounded-2xl text-xs text-[var(--color-error)] flex items-center gap-2 animate-calm-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[var(--color-error)]" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Alert */}
              {successMsg && (
                <div className="p-3.5 bg-[var(--color-success-soft)] border border-[var(--color-success)]/30 rounded-2xl text-xs text-[var(--color-success)] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--color-success)]" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email Pill Input */}
                <div>
                  <label className="block text-xs font-bold text-theme-text mb-1.5 px-1">
                    {locale === "fr" ? "Adresse email" : "البريد الإلكتروني"}
                  </label>
                  <div className="relative flex items-center">
                    <div
                      className={`absolute ${
                        isRTL ? "right-2.5" : "left-2.5"
                      } w-8 h-8 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center shrink-0 pointer-events-none`}
                    >
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      data-testid="auth-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={locale === "fr" ? "eleve@example.com" : "student@example.com"}
                      required
                      className={`w-full h-12 rounded-full bg-[#FFFCF7] border border-theme text-sm text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-medium ${
                        isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
                      }`}
                    />
                  </div>
                </div>

                {/* Password Pill Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <label className="block text-xs font-bold text-theme-text">
                      {locale === "fr" ? "Mot de passe" : "كلمة المرور"}
                    </label>
                    {mode === "login" && (
                      <span className="text-[11px] text-theme-muted cursor-not-allowed">
                        {locale === "fr" ? "Oublié ?" : "نسيت كلمة المرور؟"}
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <div
                      className={`absolute ${
                        isRTL ? "right-2.5" : "left-2.5"
                      } w-8 h-8 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center shrink-0 pointer-events-none`}
                    >
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      data-testid="auth-password-input"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`w-full h-12 rounded-full bg-[#FFFCF7] border border-theme text-sm text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-medium ${
                        isRTL ? "pr-12 pl-11" : "pl-12 pr-11"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute ${isRTL ? "left-3" : "right-3"} text-theme-muted hover:text-theme-text cursor-pointer`}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (Signup only) */}
                {mode === "signup" && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-bold text-theme-text mb-1.5 px-1">
                      {locale === "fr" ? "Confirmer le mot de passe" : "تأكيد كلمة المرور"}
                    </label>
                    <div className="relative flex items-center">
                      <div
                        className={`absolute ${
                          isRTL ? "right-2.5" : "left-2.5"
                        } w-8 h-8 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center shrink-0 pointer-events-none`}
                      >
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        data-testid="auth-confirm-password-input"
                        type={showPassword ? "text" : "password"}
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        placeholder="••••••••"
                        required
                        className={`w-full h-12 rounded-full bg-[#FFFCF7] border border-theme text-sm text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all font-medium ${
                          isRTL ? "pr-12 pl-4" : "pl-12 pr-4"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Tactile Pill CTA Button */}
                <Button
                  data-testid="auth-submit-button"
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={submitting}
                  className="rounded-full h-12 mt-2 font-bold text-white shadow-clay hover:scale-[1.01] active:scale-[0.99] transition-all bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
                >
                  {submitting ? (
                    <span>{locale === "fr" ? "Vérification..." : "جاري التحقق..."}</span>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>
                        {mode === "login"
                          ? locale === "fr"
                            ? "Se connecter"
                            : "تسجيل الدخول"
                          : locale === "fr"
                          ? "Démarrer mon essai de 72h"
                          : "بدء التجربة المجانية (72 ساعة)"}
                      </span>
                      {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </div>
                  )}
                </Button>
              </form>

              {/* Onboarding Register Link */}
              <div className="pt-3 border-t border-theme text-center space-y-1.5">
                <p className="text-xs text-theme-secondary">
                  {locale === "fr" ? "Nouveau sur SHATER ?" : "تلميذ جديد في الشاطر؟"}
                </p>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>
                    {locale === "fr"
                      ? "Créer un compte élève gratuit"
                      : "تسجيل حساب تلميذ جديد (سريع ومجاني)"}
                  </span>
                </Link>
              </div>

              {/* Back to Home */}
              <div className="pt-1 text-center">
                <Link
                  href="/"
                  className="text-xs text-theme-muted hover:text-theme-text transition-colors inline-flex items-center gap-1"
                >
                  {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                  <span>{locale === "fr" ? "Retour à l'accueil" : "العودة إلى الصفحة الرئيسية"}</span>
                </Link>
              </div>

            </div>
          </div>
        </Container>
      </main>

      {/* Footer */}
      <footer className="border-t border-theme/60 pt-4 text-center text-xs text-theme-muted relative z-20">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-success)]" />
          <span>SHATER BAC • Conforme au Ministère de l&apos;Éducation Nationale</span>
        </div>
        <p>
          الشاطر | SHATER © {new Date().getFullYear()} —{" "}
          {locale === "fr"
            ? "Pas ce que vous lisez. Comment y arriver."
            : "ماشي واش تقرا. كيفاش توصل."}
        </p>
      </footer>
    </div>
  );
}

export default function AuthPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-canvas" />}>
      <AuthContent />
    </React.Suspense>
  );
}
