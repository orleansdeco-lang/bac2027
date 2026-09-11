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
import { Lock, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function AuthPage() {
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

  // If already logged in, redirect to roadmap
  React.useEffect(() => {
    if (!isLoading && user) {
      router.push("/roadmap");
    }
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg(
        locale === "fr"
          ? "Veuillez renseigner votre email et mot de passe."
          : "يرجى ملء البريد الإلكتروني وكلمة المرور."
      );
      return;
    }

    if (password.length < 6) {
      setErrorMsg(
        locale === "fr"
          ? "Le mot de passe doit contenir au moins 6 caractères."
          : "يجب أن تتكون كلمة المرور من 6 أحرف على الأقل."
      );
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(
            locale === "fr"
              ? "Identifiants incorrects ou compte introuvable."
              : "بيانات الدخول غير صحيحة أو الحساب غير موجود."
          );
        } else {
          router.push("/roadmap");
        }
      } else {
        const { user: newUser, error } = await signUp(email, password);
        if (error) {
          setErrorMsg(error.message);
        } else if (newUser) {
          setSuccessMsg(
            locale === "fr"
              ? "Compte créé avec succès ! Vous pouvez maintenant accéder à votre parcours."
              : "تم إنشاء حسابك بنجاح! يمكنك الآن متابعة مسارك التعليمي."
          );
          setTimeout(() => {
            router.push("/onboarding");
          }, 1200);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-6">
      {/* Header */}
      <header className="border-b border-slate-800/80 pb-4">
        <Container className="flex items-center justify-between">
          <Logo />
          <LanguageSwitcher />
        </Container>
      </header>

      {/* Main Container */}
      <main className="my-auto py-8">
        <Container className="max-w-md">
          <Card className="bg-slate-900/90 border-slate-800 p-6 md:p-8 rounded-2xl shadow-xl backdrop-blur-sm">
            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-800/70 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  mode === "login"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
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
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  mode === "signup"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {locale === "fr" ? "Créer un compte" : "حساب جديد"}
              </button>
            </div>

            {/* Title & Mentor Subtitle */}
            <div className="text-center mb-6">
              <h1 className="text-xl md:text-2xl font-bold text-white mb-2">
                {mode === "login"
                  ? locale === "fr"
                    ? "Bon retour sur BAC Mastery"
                    : "مرحباً بك مجدداً في BAC Mastery"
                  : locale === "fr"
                  ? "Commencez votre progression ciblée"
                  : "ابدأ مسارك التعليمي الموجه"}
              </h1>
              <p className="text-sm text-slate-400">
                {locale === "fr"
                  ? "Pas ce que vous lisez. Comment y arriver."
                  : "ماشي واش تقرا. كيفاش توصل."}
              </p>
            </div>

            {!isConfigured && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
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
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {locale === "fr" ? "Adresse email" : "البريد الإلكتروني"}
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-slate-500 absolute top-3.5 ${isRTL ? "right-3.5" : "left-3.5"}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    required
                    className={`w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors ${
                      isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {locale === "fr" ? "Mot de passe" : "كلمة المرور"}
                </label>
                <div className="relative">
                  <Lock className={`w-4 h-4 text-slate-500 absolute top-3.5 ${isRTL ? "right-3.5" : "left-3.5"}`} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors ${
                      isRTL ? "pr-10 pl-3" : "pl-10 pr-3"
                    }`}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[48px] bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl mt-2 flex items-center justify-center gap-2"
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
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1"
              >
                {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
                <span>{locale === "fr" ? "Retour à l'accueil" : "العودة إلى الصفحة الرئيسية"}</span>
              </Link>
            </div>
          </Card>
        </Container>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-600">
        <p>BAC Mastery &copy; 2026 — {locale === "fr" ? "Plateforme d'Apprentissage Adaptatif" : "منصة التعلم التكيفي الذكي"}</p>
      </footer>
    </div>
  );
}
