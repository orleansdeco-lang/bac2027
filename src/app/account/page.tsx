"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ThemeSelector } from "@/components/ui/ThemeSelector";
import { getStrategicProfile } from "@/lib/onboarding/profile";
import { StrategicProfile } from "@/types/onboarding";
import { StudentService } from "@/lib/services";
import { getStudentAccess } from "@/lib/access";
import { getStoredPaymentRecords, PilotPaymentRecord } from "@/lib/payment";
import {
  User,
  ShieldCheck,
  RefreshCw,
  LogOut,
  LogIn,
  Target,
  Clock,
  Compass,
  ArrowRight,
  ArrowLeft,
  Cloud,
  CloudOff,
  Palette,
  Sparkles,
  Download,
  Check,
  AlertCircle,
} from "lucide-react";
import { exportAnonymizedPilotData } from "@/lib/analytics";

export default function AccountPage() {
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<StrategicProfile | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState<PilotPaymentRecord | null>(null);

  const access = getStudentAccess(profile);

  const NextArrow = isAr ? ArrowLeft : ArrowRight;

  const handleExportPilotData = () => {
    try {
      const data = exportAnonymizedPilotData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bac_mastery_pilot_data_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  useEffect(() => {
    async function fetchAccProfile() {
      const p = user ? await StudentService.getProfile(user.id) : getStrategicProfile();
      if (p) setProfile(p);
      const records = getStoredPaymentRecords();
      const currentUid = user?.id || "guest_pilot";
      const userRecord = records.find(
        (r) => r.userId === currentUid || (user?.email && r.studentEmail === user.email)
      ) || (records.length > 0 ? records[records.length - 1] : null);
      if (userRecord) {
        setPaymentRecord(userRecord);
      }
    }
    fetchAccProfile();
  }, [user]);

  const handleSync = async () => {
    if (!user) return;
    setSyncing(true);
    setSyncSuccess(false);
    try {
      if (profile) {
        await StudentService.saveProfile(profile);
      }
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 4000);
    } catch (e) {
      console.error("Manual sync failed:", e);
    } finally {
      setSyncing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("Sign out failed:", e);
    }
  };

  if (authLoading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Compass className="h-6 w-6 text-[var(--color-primary)] animate-spin" />
            <p className="text-sm font-mono text-theme-muted">
              {isAr ? "جاري تحميل الحساب..." : "Chargement du profil..."}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell activeNav="home">
      <Container size="sm" className="py-6 sm:py-10 space-y-6">
        {/* Account Header */}
        <div className="flex items-center justify-between border-b border-theme pb-4">
          <div>
            <h1 className="text-2xl font-bold text-theme-text tracking-tight font-sans">
              {isAr ? "حساب التلميذ وإعدادات الخطة" : "Compte & Préférences"}
            </h1>
            <p className="text-xs text-theme-secondary mt-1">
              {isAr
                ? "إدارة جلستك، المظهر، والمزامنة السحابية."
                : "Gestion de votre session, apparence et synchronisation cloud."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <Badge variant="success" size="sm" className="flex items-center gap-1">
                <Cloud className="h-3 w-3" />
                <span>{isAr ? "متزامن" : "Connecté"}</span>
              </Badge>
            ) : (
              <Badge variant="outline" size="sm" className="flex items-center gap-1 text-theme-muted border-theme">
                <CloudOff className="h-3 w-3" />
                <span>{isAr ? "محلي" : "Local"}</span>
              </Badge>
            )}
          </div>
        </div>

        {/* 1. VISUAL THEME & PERSONALITY SELECTOR */}
        <Card className="p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-theme-text">
              <Palette className="h-4 w-4 text-[var(--color-primary)]" />
              <span>{isAr ? "المظهر والشخصية البصرية" : "Ambiance & Thème"}</span>
            </div>
            <span className="text-[11px] text-theme-muted font-medium">
              {isAr ? "3 شخصيات للدراسة" : "3 ambiances"}
            </span>
          </div>

          <ThemeSelector variant="cards" />
        </Card>

        {/* 2. Authentication Card */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/30 flex items-center justify-center text-[var(--color-primary)]">
              <User className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-theme-muted block">{isAr ? "البريد الإلكتروني" : "E-mail"}</span>
              <span className="text-sm font-bold text-theme-text font-mono break-all">
                {user?.email || (isAr ? "جلسة محلية (بدون تسجيل)" : "Session locale (invité)")}
              </span>
            </div>
          </div>

          {user ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-theme">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSync}
                disabled={syncing}
                className="w-full sm:w-auto text-xs"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
                <span>{syncing ? (isAr ? "جاري المزامنة..." : "Synchronisation...") : (isAr ? "مزامنة البيانات الآن" : "Synchroniser")}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="w-full sm:w-auto text-xs text-rose-400 hover:text-rose-300"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{isAr ? "تسجيل الخروج" : "Déconnexion"}</span>
              </Button>

              {syncSuccess && (
                <span className="text-xs text-emerald-400 font-semibold animate-in fade-in-50">
                  ✓ {isAr ? "تمت المزامنة بنجاح!" : "Synchronisation réussie !"}
                </span>
              )}
            </div>
          ) : (
            <div className="pt-3 border-t border-theme space-y-2">
              <p className="text-xs text-theme-secondary leading-relaxed">
                {isAr
                  ? "أنت تستخدم حالياً الوضع المحلي. يمكنك تسجيل حساب لحفظ تقدمك السحابي ومتابعته من أي جهاز."
                  : "Connectez-vous pour synchroniser votre progression dans le cloud."}
              </p>
              <Link href="/auth">
                <Button variant="primary" size="sm">
                  <LogIn className="h-3.5 w-3.5" />
                  <span>{isAr ? "تسجيل الدخول / إنشاء حساب" : "Connexion"}</span>
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* 3. Subscription & Trial Card */}
        <Card className="p-5 space-y-4" data-testid="account-subscription-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-theme-text">
              <Clock className="h-4 w-4 text-cyan-400" />
              <span>{isAr ? "الاشتراك والوصول" : "Abonnement & Accès"}</span>
            </div>
            {access.status === "PAID_ACTIVE" ? (
              <Badge variant="success" size="sm">
                {isAr ? "اشتراك كامل مفعل" : "Actif"}
              </Badge>
            ) : access.status === "TRIAL_ACTIVE" ? (
              <Badge variant="warning" size="sm">
                {isAr ? `تجربة مجانية (${access.remainingHours} سا متبقية)` : `Essai (${access.remainingHours}h)`}
              </Badge>
            ) : (
              <Badge variant="outline" size="sm" className="text-rose-400 border-rose-500/30">
                {isAr ? "فترة التجربة منتهية" : "Essai expiré"}
              </Badge>
            )}
          </div>

          <div className="p-4 rounded-xl bg-card-muted border border-theme space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-theme-muted">{isAr ? "نوع الخطة الحالية:" : "Plan actuel :"}</span>
              <span className="font-bold text-theme-text">
                {access.plan === "PAID" 
                  ? (isAr ? "Pass BAC كامل (موسم 2026)" : "Pass BAC Intégral") 
                  : (isAr ? "تجربة مجانية استكشافية (48 ساعة)" : "Essai Découverte (48h)")}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-theme-muted">{isAr ? "حالة الوصول:" : "Statut :"}</span>
              <span className={`font-bold ${access.canUseProduct ? "text-emerald-400" : "text-amber-400"}`}>
                {access.canUseProduct 
                  ? (isAr ? "وصول كامل متاح" : "Accès complet") 
                  : (isAr ? "الوصول مقفل (مطلوب التفعيل)" : "Accès restreint")}
              </span>
            </div>
            {access.trialExpiresAt && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-theme-muted">{isAr ? "نهاية فترة التجربة:" : "Fin de l'essai :"}</span>
                <span className="font-mono text-theme-secondary text-[11px]">
                  {new Date(access.trialExpiresAt).toLocaleString(isAr ? "ar-DZ" : "fr-FR")}
                </span>
              </div>
            )}
          </div>

          {/* Honest Trial Status / Countdown banner */}
          <div data-testid="account-trial-countdown" className="p-3 rounded-xl bg-card-muted border border-theme text-xs space-y-1">
            {access.status === "TRIAL_ACTIVE" && (
              <div className="flex items-center gap-2 text-cyan-400">
                <Clock className="w-4 h-4 shrink-0 text-cyan-400" />
                <span>
                  {isAr
                    ? `تجربتك المجانية تنتهي في ${new Date(access.trialExpiresAt!).toLocaleString("ar-DZ")} (باقي ${access.remainingHours} ساعة).`
                    : `Votre essai gratuit se termine le ${new Date(access.trialExpiresAt!).toLocaleString("fr-FR")} (${access.remainingHours}h restantes).`}
                </span>
              </div>
            )}
            {access.status === "TRIAL_EXPIRED" && (
              <div className="flex items-center gap-2 text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>
                  {isAr
                    ? "انتهت تجربتك المجانية (48 ساعة). جميع بياناتك ومكتسباتك محفوظة."
                    : "Votre essai gratuit de 48h est terminé. Vos acquis restent sauvegardés."}
                </span>
              </div>
            )}
            {access.status === "PAID_ACTIVE" && (
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  {isAr
                    ? "حسابك مفعل باشتراك كامل (Pass BAC 2026) حتى يوم الامتحان."
                    : "Accès intégral activé jusqu'au jour de l'épreuve du BAC."}
                </span>
              </div>
            )}
          </div>

          {/* Pending Payment Record Display */}
          {paymentRecord && paymentRecord.state !== "PAYMENT_CONFIRMED" && (
            <div data-testid="account-payment-record" className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isAr ? "طلب اشتراك قيد المعالجة" : "Demande de paiement"}</span>
                </span>
                <Badge variant="warning" size="sm" className="text-[10px] uppercase">
                  {paymentRecord.state === "PAYMENT_PENDING_VERIFICATION"
                    ? isAr ? "بانتظار تأكيد المشرف" : "En vérification"
                    : isAr ? "طلب مسجل" : "Demandé"}
                </Badge>
              </div>
              <div className="font-mono text-[11px] text-slate-300">
                <span>{isAr ? "الرمز المرجعي: " : "Réf : "}</span>
                <span className="text-white font-bold">{paymentRecord.requestId}</span>
              </div>
            </div>
          )}

          {access.status !== "PAID_ACTIVE" && (
            <Link href="/subscribe">
              <Button variant="primary" size="sm" className="w-full">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isAr ? "تفعيل اشتراك BAC Mastery الكامل" : "Passer au Pass BAC Complet"}</span>
              </Button>
            </Link>
          )}
        </Card>

        {/* 4. Academic Profile Details */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-bold text-theme-text flex items-center gap-2">
            <Target className="h-4 w-4 text-cyan-400" />
            <span>{isAr ? "بيانات المسار والهدف الدراسي" : "Objectifs Académiques"}</span>
          </h2>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-card-muted border border-theme space-y-1">
              <span className="text-theme-muted block">{isAr ? "الشعبة" : "Filière"}</span>
              <span className="font-bold text-theme-text">
                {isAr ? "علوم تجريبية" : "Sciences Expérimentales"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-card-muted border border-theme space-y-1">
              <span className="text-theme-muted block">{isAr ? "معدل البكالوريا المستهدف" : "Objectif BAC"}</span>
              <span className="font-bold text-amber-400 font-mono">
                {profile?.targetScore ? `${profile.targetScore.toFixed(1)}/20` : "16.0/20"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-card-muted border border-theme space-y-1">
              <span className="text-theme-muted block">{isAr ? "الوقت الأسبوعي" : "Temps"}</span>
              <span className="font-bold text-theme-text">
                {profile?.availableTime ? profile.availableTime : "8-12 سا/أسبوع"}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-card-muted border border-theme space-y-1">
              <span className="text-theme-muted block">{isAr ? "مستوى الطاقة" : "Énergie"}</span>
              <span className="font-bold text-theme-text">
                {profile?.studyEnergy ? profile.studyEnergy : "normal"}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link href="/onboarding">
              <Button variant="outline" size="sm" className="w-full text-xs">
                <span>{isAr ? "تعديل تفاصيل الخطة (Onboarding)" : "Modifier le profil"}</span>
                <NextArrow className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* 4. System & Integrity Card */}
        <Card className="p-5 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-theme-secondary font-bold">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>{isAr ? "أمان البيانات والخصوصية" : "Sécurité & Confidentialité"}</span>
          </div>
          <p className="text-theme-muted leading-relaxed">
            {isAr
              ? "بياناتك الأكاديمية محمية بسياسات RLS الصارمة على Supabase. لا يتم استخدام أي ذكاء اصطناعي خارجي أو مشارقة بياناتك مع أطراف ثالثة."
              : "Vos données sont protégées par les politiques RLS strictes sur Supabase."}
          </p>
        </Card>

        {/* 5. Pilot Telemetry & Safe Export (Prompt 18.2 § 25) */}
        <Card className="p-5 space-y-3 text-xs border border-theme">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-theme-secondary font-bold">
              <Download className="h-4 w-4 text-[var(--color-primary)]" />
              <span>{isAr ? "بيانات التجربة الميدانية (Pilot Export)" : "Export des données du pilote"}</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              v1.0.0
            </Badge>
          </div>
          <p className="text-theme-muted leading-relaxed">
            {isAr
              ? "يمكنك تصدير سجل أحداث التعلم الميدانية والتقييمات مجهولة المصدر (Zero PII) لتوثيق التجربة بدون أي معلومات شخصية أو كلمات مرور."
              : "Exportez les événements d'apprentissage et retours d'expérience anonymes (sans PII ni mot de passe)."}
          </p>
          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2 text-xs"
              onClick={handleExportPilotData}
              data-testid="pilot-export-btn"
            >
              {exportSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">{isAr ? "تم تحميل ملف JSON بنجاح" : "Fichier téléchargé"}</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>{isAr ? "تحميل سجل التجربة المجهول (JSON)" : "Télécharger les données anonymes (JSON)"}</span>
                </>
              )}
            </Button>
          </div>
        </Card>
      </Container>
    </AppShell>
  );
}
