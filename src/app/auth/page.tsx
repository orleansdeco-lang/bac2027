"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth/context";
import { useTranslation } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
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
import { syncAllLocalStorageToCloud } from "@/lib/repositories";

function AuthContent() {
  const router = useRouter();
  const { direction, locale } = useTranslation();
  const isRTL = direction === "rtl";
  const { signIn, signUp, user, isLoading, isConfigured } = useAuth();

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
  }, [searchParams]);

  // If already logged in, redirect to the appropriate step
  React.useEffect(() => {
    if (!isLoading && user) {
      StudentService.getProfile(user.id).then((p) => {
        if (!p || (!p.registrationCompletedAt && !(p.firstName && p.streamId))) {
          router.push("/auth/register");
        } else if (!p.academicProfileCompletedAt && !(p.targetScore && p.studyMethods?.length)) {
          router.push("/profile/academic");
        } else {
          router.push("/dashboard");
        }
      });
    }
  }, [user, isLoading, router]);

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
          await syncAllLocalStorageToCloud(loggedInUser.id);
          const profile = await StudentService.getProfile(loggedInUser.id);
          const { trackEvent } = await import("@/lib/analytics");
          trackEvent("login_completed", { userId: loggedInUser.id });
          if (!profile || (!profile.registrationCompletedAt && !(profile.firstName && profile.streamId))) {
            router.push("/auth/register");
          } else if (!profile.academicProfileCompletedAt && !(profile.targetScore && profile.studyMethods?.length)) {
            router.push("/profile/academic");
          } else {
            router.push("/dashboard");
          }
        }
      } else {
        const { user: newUser, error } = await signUp(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else if (newUser) {
          await StudentService.handleAuthSessionMigration(newUser.id);
          await syncAllLocalStorageToCloud(newUser.id);
          const { trackEvent } = await import("@/lib/analytics");
          trackEvent("registration_completed", { userId: newUser.id });
          trackEvent("trial_started", { userId: newUser.id, durationHours: 72 });
          setSuccessMsg(
            locale === "fr"
              ? "Compte créé avec succès ! Votre essai gratuit de 72h a débuté."
              : "تم إنشاء حسابك بنجاح! بدأت تجربتك المجانية لمدة 72 ساعة."
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

  return (
    <div className="min-h-screen bg-canvas text-theme-text flex flex-col justify-between py-6 transition-colors duration-300 relative overflow-x-hidden">
      
      {/* Background Soft Pastel Glows */}
      <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-amber-400/10 dark:bg-amber-400/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-purple-400/10 dark:bg-purple-400/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-theme/50 pb-4 relative z-20">
        <Container className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2.5">
            <ThemeSelector variant="compact" />
            <LanguageSwitcher />
          </div>
        </Container>
      </header>

      {/* Main Content with Peeking Character Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <Container size="sm" className="w-full max-w-md">
          
          <div className="relative rounded-[36px] bg-card border border-stone-200/80 dark:border-white/10 shadow-clay overflow-hidden backdrop-blur-md transition-all">
            
            {/* Top Peeking 3D Student Illustration (Reference #2 Inspiration) */}
            <div className="relative h-48 sm:h-56 w-full bg-gradient-to-b from-purple-100/60 via-indigo-50/40 to-transparent dark:from-purple-950/40 dark:via-indigo-950/20 flex items-end justify-center overflow-hidden border-b border-stone-200/40 dark:border-white/5">
              <div className="relative w-56 h-48 sm:w-64 sm:h-56 transform translate-y-1">
                <Image
                  src="/illustrations/login-peeking.jpg"
                  alt="3D Student Illustration"
                  fill
                  className="object-contain object-bottom drop-shadow-xl"
                  priority
                />
              </div>

              {/* Floating Welcome Tag */}
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 dark:bg-stone-900/90 text-stone-800 dark:text-stone-200 shadow-sm border border-stone-200/60 dark:border-white/10 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>BAC 2027</span>
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Segmented Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-stone-100 dark:bg-stone-800/80 border border-stone-200/70 dark:border-white/10 rounded-full shadow-inner">
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
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
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
                      : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                  }`}
                >
                  {locale === "fr" ? "Créer un compte" : "حساب جديد"}
                </button>
              </div>

              {/* Title & Mentor Subtitle */}
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">
                  {mode === "login"
                    ? locale === "fr"
                      ? "Bon retour parmi nous !"
                      : "مرحباً بك مجدداً 👋"
                    : locale === "fr"
                    ? "Rejoignez BAC Mastery"
                    : "ابدأ مسارك نحو البكالوريا"}
                </h1>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {locale === "fr"
                    ? "Pas ce que vous lisez. Comment y arriver."
                    : "ماشي واش تقرا. كيفاش توصل."}
                </p>
              </div>

              {/* Free Trial Banner in Signup Mode */}
              {mode === "signup" && (
                <div className="p-3.5 bg-blue-500/10 border border-blue-500/25 rounded-2xl text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>
                      {locale === "fr"
                        ? "Essai gratuit de 72 heures inclus"
                        : "فترة تجريبية مجانية لمدة 72 ساعة"}
                    </span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-400 text-[11px] leading-relaxed">
                    {locale === "fr"
                      ? "Accès complet immédiat aux matières de votre filière et à votre diagnostic initial."
                      : "وصول كامل ومباشر لمواد شعبتك والتشخيص الأولي دون أي التزام مالي."}
                  </p>
                </div>
              )}

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2 animate-calm-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Success Alert */}
              {successMsg && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Email Pill Input */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 px-1">
                    {locale === "fr" ? "Adresse email" : "البريد الإلكتروني"}
                  </label>
                  <div className="relative flex items-center">
                    <div
                      className={`absolute ${
                        isRTL ? "right-2" : "left-2"
                      } w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 flex items-center justify-center shadow-inner shrink-0 pointer-events-none`}
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
                      className={`w-full h-13 rounded-full bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/80 dark:border-white/10 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all ${
                        isRTL ? "pr-13 pl-4" : "pl-13 pr-4"
                      }`}
                    />
                  </div>
                </div>

                {/* Password Pill Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 px-1">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                      {locale === "fr" ? "Mot de passe" : "كلمة المرور"}
                    </label>
                    {mode === "login" && (
                      <span className="text-[11px] text-stone-400 cursor-not-allowed">
                        {locale === "fr" ? "Oublié ?" : "نسيت كلمة المرور؟"}
                      </span>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <div
                      className={`absolute ${
                        isRTL ? "right-2" : "left-2"
                      } w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 flex items-center justify-center shadow-inner shrink-0 pointer-events-none`}
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
                      className={`w-full h-13 rounded-full bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/80 dark:border-white/10 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all ${
                        isRTL ? "pr-13 pl-12" : "pl-13 pr-12"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute ${isRTL ? "left-3.5" : "right-3.5"} text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer`}
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password (Signup only) */}
                {mode === "signup" && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5 px-1">
                      {locale === "fr" ? "Confirmer le mot de passe" : "تأكيد كلمة المرور"}
                    </label>
                    <div className="relative flex items-center">
                      <div
                        className={`absolute ${
                          isRTL ? "right-2" : "left-2"
                        } w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 flex items-center justify-center shadow-inner shrink-0 pointer-events-none`}
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
                        className={`w-full h-13 rounded-full bg-stone-50/90 dark:bg-stone-800/80 border border-stone-200/80 dark:border-white/10 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all ${
                          isRTL ? "pr-13 pl-4" : "pl-13 pr-4"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Tactile Big Pill CTA Button */}
                <Button
                  data-testid="auth-submit-button"
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={submitting}
                  className="rounded-full h-13 mt-3 font-bold text-white shadow-clay hover:scale-[1.01] active:scale-[0.99] transition-all bg-[var(--color-primary)]"
                >
                  {submitting ? (
                    <span>{locale === "fr" ? "Connexion en cours..." : "جاري التحقق..."}</span>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>
                        {mode === "login"
                          ? locale === "fr"
                            ? "Se connecter"
                            : "دخول"
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
              <div className="pt-4 border-t border-stone-200/60 dark:border-white/10 text-center space-y-2">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {locale === "fr" ? "Nouveau sur BAC Mastery ?" : "تلميذ جديد في BAC Mastery؟"}
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
              <div className="pt-2 text-center">
                <Link
                  href="/"
                  className="text-xs text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors inline-flex items-center gap-1"
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
      <footer className="border-t border-theme/50 pt-4 text-center text-xs text-stone-400 dark:text-stone-500 relative z-20">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>BAC 2027 • Conforme au Ministère de l&apos;Éducation Nationale</span>
        </div>
        <p>
          BAC Mastery © {new Date().getFullYear()} —{" "}
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
