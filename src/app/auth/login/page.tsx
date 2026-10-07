"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/supabase/client";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { StudentService } from "@/lib/services";
import { getRegistrationDraft } from "@/lib/onboarding/profile";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { direction, locale } = useTranslation();
  const isRTL = direction === "rtl";
  const { signIn, user, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already authenticated, redirect to appropriate destination
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

    const normEmail = email.trim().toLowerCase();
    if (!normEmail || !password) {
      setErrorMsg(
        locale === "fr"
          ? "Veuillez renseigner votre e-mail et votre mot de passe."
          : "يرجى كتابة البريد الإلكتروني وكلمة المرور."
      );
      return;
    }

    setSubmitting(true);

    try {
      const { user: loggedInUser, error } = await signIn(normEmail, password);
      if (error) {
        setErrorMsg(
          error.message?.includes("Invalid login credentials")
            ? (locale === "fr" ? "Identifiants invalides. Veuillez vérifier votre e-mail et mot de passe." : "بيانات الدخول غير صحيحة. يرجى التأكد من البريد وكلمة المرور.")
            : error.message
        );
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

  const handleForgotPassword = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const normEmail = email.trim().toLowerCase();

    if (!normEmail || !normEmail.includes("@")) {
      setErrorMsg(
        locale === "fr"
          ? "Veuillez saisir votre adresse e-mail dans le champ ci-dessus d'abord."
          : "يرجى إدخال بريدك الإلكتروني في الحقل أعلاه أولاً لإرسال رابط الاسترجاع."
      );
      return;
    }

    setResettingPassword(true);
    try {
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(normEmail, {
          redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth?mode=reset` : undefined,
        });
        if (error) throw error;
      }
      setSuccessMsg(
        locale === "fr"
          ? "Un lien de réinitialisation de mot de passe a été envoyé à votre adresse e-mail."
          : "تم إرسال رابط استرجاع كلمة المرور إلى بريدك الإلكتروني بنجاح."
      );
    } catch (err: any) {
      setErrorMsg(err?.message || (locale === "fr" ? "Échec de l'envoi du lien." : "تعذر إرسال رابط الاسترجاع. يرجى المحاولة لاحقاً."));
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-theme-text flex flex-col justify-between py-5 sm:py-6 transition-colors duration-300 relative overflow-x-hidden">
      {/* Background Soft Glow */}
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
          <div className="relative rounded-[36px] bg-card text-theme-text border border-theme shadow-clay overflow-hidden transition-all">
            {/* Top Illustration Area */}
            <div className="relative h-44 sm:h-52 w-full bg-[#EFE9DC] overflow-hidden flex items-end justify-center border-b border-theme">
              <div className="relative w-full h-full transform translate-y-1">
                <Image
                  src="/illustrations/bac-peeking.jpg"
                  alt="طلبة الشاطر | SHATER"
                  fill
                  className="object-cover object-top drop-shadow-sm"
                  priority
                />
              </div>

              {/* Floating Badge */}
              <div className="absolute top-3.5 left-3.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-white/95 text-theme-text border border-theme shadow-sm backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                  <span>BAC 2027</span>
                </span>
              </div>
            </div>

            {/* Inner Form Card */}
            <div className="p-6 sm:p-8 space-y-5">
              {/* Header Title */}
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-black text-theme-text tracking-tight font-sans">
                  {locale === "fr" ? "Bon retour parmi nous !" : "تسجيل الدخول إلى حسابك 👋"}
                </h1>
                <p className="text-xs text-theme-secondary font-medium">
                  {locale === "fr"
                    ? "Accédez à votre espace d'apprentissage SHATER"
                    : "أدخل بريدك الإلكتروني وكلمة المرور للمتابعة"}
                </p>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-xs flex items-center gap-2 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="leading-snug">{errorMsg}</span>
                </div>
              )}

              {/* Success Message */}
              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="leading-snug">{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Pill Input */}
                <div>
                  <label className="block text-xs font-bold text-theme-text mb-1.5 px-1">
                    {locale === "fr" ? "Adresse e-mail" : "البريد الإلكتروني"}
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
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={resettingPassword}
                      className="text-[11px] text-[var(--color-primary)] hover:underline cursor-pointer font-medium"
                    >
                      {resettingPassword
                        ? (locale === "fr" ? "Envoi..." : "جاري الإرسال...")
                        : (locale === "fr" ? "Mot de passe oublié ?" : "نسيت كلمة المرور؟")}
                    </button>
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

                {/* Submit Button */}
                <Button
                  data-testid="auth-submit-button"
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={submitting}
                  className="rounded-full h-12 mt-2 font-bold text-white shadow-clay hover:scale-[1.01] active:scale-[0.99] transition-all bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{locale === "fr" ? "Vérification..." : "جاري التحقق..."}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>{locale === "fr" ? "Se connecter" : "تسجيل الدخول"}</span>
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
                  href="/auth?mode=signup"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>
                    {locale === "fr"
                      ? "Créer un compte élève gratuit (3 jours d'essai)"
                      : "تسجيل حساب تلميذ جديد (3 أيام تجربة مجانية)"}
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-canvas">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
