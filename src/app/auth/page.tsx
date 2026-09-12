"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/context";
import { useTranslation } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import { Lock, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { StudentService } from "@/lib/services";
import { syncAllLocalStorageToCloud } from "@/lib/repositories";
import { useSearchParams } from "next/navigation";

function AuthContent() {
  const router = useRouter();
  const { direction, locale } = useTranslation();
  const isRTL = direction === "rtl";
  const { signIn, signUp, user, isLoading, isConfigured } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  // If already logged in, redirect to dashboard or onboarding
  React.useEffect(() => {
    if (!isLoading && user) {
      StudentService.getProfile(user.id).then((p) => {
        if (!p || !p.streamId) {
          router.push("/onboarding");
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
          if (!profile || !profile.streamId) {
            router.push("/onboarding");
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
          setSuccessMsg(
            locale === "fr"
              ? "Compte créé avec succès ! Vous pouvez maintenant accéder à votre parcours."
              : "تم إنشاء حسابك بنجاح! يمكنك الآن متابعة مسارك التعليمي."
          );
          setTimeout(async () => {
            const profile = await StudentService.getProfile(newUser.id);
            if (!profile || !profile.streamId) {
              router.push("/onboarding");
            } else {
              router.push("/dashboard");
            }
          }, 1000);
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
    <div className="min-h-screen bg-canvas text-theme-text flex flex-col justify-between py-6 transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-theme pb-4">
        <Container className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <ThemeSelector variant="compact" />
            <LanguageSwitcher />
          </div>
        </Container>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Container size="sm" className="w-full max-w-md">
          <Card className="p-6 sm:p-8 space-y-6">
            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-card-muted border border-theme rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === "login"
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-theme-secondary hover:text-theme-text"
                }`}
              >
                {locale === "fr" ? "Connexion" : "تسجيل الدخول"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  mode === "signup"
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "text-theme-secondary hover:text-theme-text"
                }`}
              >
                {locale === "fr" ? "Créer un compte" : "حساب جديد"}
              </button>
            </div>

            {/* Title & Mentor Subtitle */}
            <div className="text-center mb-6">
              <h1 className="text-xl md:text-2xl font-bold text-theme-text mb-2 font-sans">
                {mode === "login"
                  ? locale === "fr"
                    ? "Bon retour sur BAC Mastery"
                    : "مرحباً بك مجدداً في BAC Mastery"
                  : locale === "fr"
                  ? "Commencez votre progression ciblée"
                  : "ابدأ مسارك التعليمي الموجه"}
              </h1>
              <p className="text-sm text-theme-secondary">
                {locale === "fr"
                  ? "Pas ce que vous lisez. Comment y arriver."
                  : "ماشي واش تقرا. كيفاش توصل."}
              </p>
            </div>

            {!isConfigured && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {locale === "fr"
                    ? "Mode local actif. Configurez les identifiants Supabase pour activer la synchronisation cloud."
                    : "الوضع المحلي نشط. قم بضبط إعدادات Supabase لتفعيل المزامنة السحابية."}
                </span>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-2 animate-calm-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-theme-secondary mb-1.5">
                  {locale === "fr" ? "Adresse email" : "البريد الإلكتروني"}
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-theme-muted absolute top-3.5 ${isRTL ? "right-3.5" : "left-3.5"}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    required
                    className={`w-full bg-card-muted border border-theme rounded-xl py-2.5 text-sm text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors ${
                      isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-theme-secondary mb-1.5">
                  {locale === "fr" ? "Mot de passe" : "كلمة المرور"}
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 text-theme-muted absolute top-3.5 ${isRTL ? "right-3.5" : "left-3.5"}`} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full bg-card-muted border border-theme rounded-xl py-2.5 text-sm text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors ${
                      isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
                    }`}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                disabled={submitting}
                className="mt-2 min-h-[48px]"
              >
                {submitting ? (
                  <span>{locale === "fr" ? "Chargement..." : "جاري المعالجة..."}</span>
                ) : (
                  <>
                    <span>
                      {mode === "login"
                        ? locale === "fr"
                          ? "Se connecter"
                          : "دخول"
                        : locale === "fr"
                        ? "Créer mon compte"
                        : "إنشاء حسابي"}
                    </span>
                    {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </>
                )}
              </Button>
            </form>

            {/* Back link */}
            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-xs text-theme-muted hover:text-theme-text transition-colors inline-flex items-center gap-1"
              >
                {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                <span>{locale === "fr" ? "Retour à l'accueil" : "العودة إلى الصفحة الرئيسية"}</span>
              </Link>
            </div>
          </Card>
        </Container>
      </main>

      {/* Footer */}
      <footer className="border-t border-theme pt-4 text-center text-xs text-theme-muted">
        <p>BAC Mastery © {new Date().getFullYear()} — {locale === "fr" ? "Pas ce que vous lisez. Comment y arriver." : "ماشي واش تقرا. كيفاش توصل."}</p>
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
