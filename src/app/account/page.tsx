"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getStrategicProfile, getRegistrationDraft } from "@/lib/onboarding/profile";
import { StrategicProfile } from "@/types/onboarding";
import { StudentRegistrationData } from "@/types/registration";
import { StudentService } from "@/lib/services";
import { getStudentAccess, formatTrialCountdown, formatTrialExpiryDate } from "@/lib/access";
import { getStoredPaymentRecords, PilotPaymentRecord } from "@/lib/payment";
import { formatEnergyState } from "@/lib/i18n/statusMapper";
import {
  User,
  ShieldCheck,
  LogOut,
  Target,
  Clock,
  Compass,
  ArrowRight,
  ArrowLeft,
  Cloud,
  Sparkles,
  Download,
  Check,
  AlertCircle,
} from "lucide-react";
import { exportAnonymizedPilotData } from "@/lib/analytics";

export default function AccountPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<StrategicProfile | null>(null);
  const [regDraft, setRegDraft] = useState<StudentRegistrationData | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState<PilotPaymentRecord | null>(null);

  // If visitor is not authenticated, redirect to login & register page
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/auth");
    }
  }, [user, authLoading, router]);

  const access = getStudentAccess(profile);
  const isPaidActive = Boolean(
    access.status === "PAID_ACTIVE" ||
    (profile as any)?.access_status === "PAID" ||
    (profile as any)?.accessStatus === "PAID" ||
    access.plan === "PAID" ||
    (access.plan === "season" && access.status !== "TRIAL_ACTIVE" && access.status !== "TRIAL_EXPIRED")
  );
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
      if (!user?.id) {
        setProfile(null);
        setRegDraft(null);
        setPaymentRecord(null);
        return;
      }
      const p = await StudentService.getProfile(user.id);
      if (p) {
        setProfile(p);
      }
      const reg = getRegistrationDraft(user.id);
      if (reg) setRegDraft(reg);

      const records = getStoredPaymentRecords();
      const userRecord = records.find(
        (r) => r.userId === user.id || (user.email && r.studentEmail === user.email)
      ) || null;
      if (userRecord) {
        setPaymentRecord(userRecord);
      }
    }
    fetchAccProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/auth");
    } catch (e) {
      console.error("Sign out failed:", e);
    }
  };

  if (authLoading || !user) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Compass className="h-6 w-6 text-[var(--color-primary)] animate-spin" />
            <p className="text-sm font-mono text-theme-muted">
              {isAr ? "جاري توجيه الحساب..." : "Chargement du profil..."}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  // Study Character Mapping (Selected at registration)
  const characterMap: Record<string, { nameAr: string; nameFr: string; img: string }> = {
    boy: { nameAr: "الفتى الطموح", nameFr: "L'Ambitieux", img: "/illustrations/characters/boy.jpg" },
    girl: { nameAr: "الفتاة المتفوقة", nameFr: "L'Étoile", img: "/illustrations/characters/girl.jpg" },
    scholar: { nameAr: "الباحث المركز", nameFr: "Le Méthodique", img: "/illustrations/characters/scholar.jpg" },
  };
  const currentCharacterKey = (regDraft as any)?.characterId || (profile as any)?.characterId || "scholar";
  const characterInfo = characterMap[currentCharacterKey] || characterMap.scholar;

  return (
    <AppShell activeNav="account">
      <Container size="sm" className="py-6 sm:py-10 space-y-6">
        {/* Account Header with Automatic Sync Indicator */}
        <div className="flex items-center justify-between border-b border-theme pb-4">
          <div>
            <h1 className="text-2xl font-bold text-theme-text tracking-tight font-sans">
              {isAr ? "حساب التلميذ وإعدادات الخطة" : "Compte & Préférences"}
            </h1>
            <p className="text-xs text-theme-secondary mt-1">
              {isAr
                ? "متابعة تقدمك الدراسي، اشتراكك، وإعدادات حسابك."
                : "Suivi de votre progression, abonnement et profil."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline" size="sm" className="flex items-center gap-1.5 px-3 py-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>{isAr ? "حساب موثق" : "Compte vérifié"}</span>
            </Badge>
          </div>
        </div>

        {/* 1. Subscription & Trial Card */}
        <Card className="p-5 space-y-4 shadow-card" data-testid="account-subscription-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-theme-text">
              <Clock className="h-4 w-4 text-[var(--color-primary)]" />
              <span>{isAr ? "الاشتراك وحالة الوصول" : "Abonnement & Accès"}</span>
            </div>
            {access.status === "PAID_ACTIVE" ? (
              <Badge variant="success" size="sm">
                {isAr ? "اشتراك كامل مفعل" : "Actif"}
              </Badge>
            ) : access.status === "TRIAL_ACTIVE" ? (
              <Badge variant="warning" size="sm">
                {isAr
                  ? `تجربة مجانية (${formatTrialCountdown(access.remainingHours, true)})`
                  : `Essai (${formatTrialCountdown(access.remainingHours, false)})`}
              </Badge>
            ) : (
              <Badge variant="outline" size="sm" className="text-rose-400 border-rose-500/30">
                {isAr ? "فترة التجربة منتهية" : "Essai expiré"}
              </Badge>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-card-muted border border-theme space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-theme-muted">{isAr ? "نوع الخطة الحالية:" : "Plan actuel :"}</span>
              <span className="font-bold text-theme-text">
                {isPaidActive
                  ? (access.plan === "monthly"
                      ? (isAr ? "الاشتراك الشهري (30 يوماً)" : "Pass Mensuel (30 jours)")
                      : (isAr ? "اشتراك السنة الدراسية (موسم كامل)" : "Pass Année Scolaire (Saison Complète)"))
                  : (isAr ? "تجربة مجانية استكشافية (72 ساعة)" : "Essai Découverte (72h)")}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-theme-muted">{isAr ? "حالة الوصول:" : "Statut :"}</span>
              <span className={`font-bold ${access.canUseProduct ? "text-emerald-500" : "text-amber-500"}`}>
                {access.canUseProduct
                  ? (isAr ? "وصول كامل متاح" : "Accès complet")
                  : (isAr ? "الوصول مقفل (مطلوب التفعيل)" : "Accès restreint")}
              </span>
            </div>
            {access.trialExpiresAt && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-theme-muted">{isAr ? "تاريخ نهاية التجربة:" : "Date de fin :"}</span>
                <span className="font-bold text-theme-text font-sans">
                  {formatTrialExpiryDate(access.trialExpiresAt, isAr)}
                </span>
              </div>
            )}
          </div>

          {/* Honest Trial Status / Countdown banner */}
          <div data-testid="account-trial-countdown" className="p-3.5 rounded-2xl bg-card-muted border border-theme text-xs space-y-1">
            {access.status === "TRIAL_ACTIVE" && access.trialExpiresAt && (
              <div className="flex items-center gap-2 text-[var(--color-primary)] font-medium">
                <Clock className="w-4 h-4 shrink-0 text-[var(--color-primary)] animate-pulse" />
                <span>
                  {isAr
                    ? `تنتهي تجربتك المجانية بتاريخ ${formatTrialExpiryDate(access.trialExpiresAt, true)} (متبقي: ${formatTrialCountdown(access.remainingHours, true)}).`
                    : `Votre essai gratuit se termine le ${formatTrialExpiryDate(access.trialExpiresAt, false)} (restant : ${formatTrialCountdown(access.remainingHours, false)}).`}
                </span>
              </div>
            )}
            {access.status === "TRIAL_EXPIRED" && (
              <div className="flex items-center gap-2 text-rose-500 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>
                  {isAr
                    ? "انتهت تجربتك المجانية. جميع بياناتك ومكتسباتك السابقة محفوظة بأمان."
                    : "Votre période d'essai gratuit est terminée. Vos acquis restent sauvegardés."}
                </span>
              </div>
            )}
            {access.status === "PAID_ACTIVE" && (
              <div className="flex items-center gap-2 text-emerald-600 font-medium">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
                <span>
                  {isAr
                    ? "حسابك مفعل باشتراك كامل (Pass BAC 2026) حتى يوم الامتحان الرسمي."
                    : "Accès intégral activé jusqu'au jour de l'épreuve du BAC."}
                </span>
              </div>
            )}
          </div>

          {/* Pending Payment Record Display (Hidden when account is already PAID) */}
          {!isPaidActive && paymentRecord && paymentRecord.state !== "PAYMENT_CONFIRMED" && (
            <div data-testid="account-payment-record" className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-amber-700 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isAr ? "طلب اشتراك قيد المعالجة" : "Demande de paiement"}</span>
                </span>
                <Badge variant="warning" size="sm" className="text-[10px] uppercase">
                  {paymentRecord.state === "PAYMENT_PENDING_VERIFICATION"
                    ? isAr ? "بانتظار تأكيد المشرف" : "En vérification"
                    : isAr ? "طلب مسجل" : "Demandé"}
                </Badge>
              </div>
              <div className="font-mono text-[11px] text-theme-secondary">
                <span>{isAr ? "الرمز المرجعي: " : "Réf : "}</span>
                <span className="text-theme-text font-bold">{paymentRecord.requestId}</span>
              </div>
            </div>
          )}

          {access.status !== "PAID_ACTIVE" && (
            <Link href="/subscribe">
              <Button variant="primary" size="sm" className="w-full font-bold shadow-clay py-5 rounded-2xl">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>{isAr ? "تفعيل اشتراك BAC Mastery الكامل" : "Passer au Pass BAC Complet"}</span>
              </Button>
            </Link>
          )}
        </Card>

        {/* 2. Academic Profile & Selected Study Character */}
        <Card className="p-5 space-y-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-theme-text flex items-center gap-2">
              <Target className="h-4 w-4 text-[var(--color-primary)]" />
              <span>{isAr ? "بيانات المسار والشخصية المرافقة" : "Profil & Avatar"}</span>
            </h2>

            {/* Study Character Avatar Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-card-muted border border-theme">
              <div className="w-7 h-7 rounded-full overflow-hidden border border-white shadow-sm">
                <img src={characterInfo.img} alt={characterInfo.nameAr} className="w-full h-full object-cover object-top" />
              </div>
              <span className="text-xs font-bold text-theme-text">
                {isAr ? characterInfo.nameAr : characterInfo.nameFr}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-card-muted border border-theme space-y-1">
              <span className="text-theme-muted block">{isAr ? "الشعبة" : "Filière"}</span>
              <span className="font-bold text-theme-text">
                {isAr ? "علوم تجريبية" : "Sciences Expérimentales"}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-card-muted border border-theme space-y-1">
              <span className="text-theme-muted block">{isAr ? "معدل البكالوريا المستهدف" : "Objectif BAC"}</span>
              <span className="font-bold text-amber-600 font-mono">
                {profile?.targetScore ? `${profile.targetScore.toFixed(1)}/20` : "16.0/20"}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-card-muted border border-theme space-y-1">
              <span className="text-theme-muted block">{isAr ? "الوقت الأسبوعي" : "Temps"}</span>
              <span className="font-bold text-theme-text">
                {profile?.availableTime ? profile.availableTime : "8-12 سا/أسبوع"}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-card-muted border border-theme space-y-1">
              <span className="text-theme-muted block">{isAr ? "مستوى الطاقة" : "Énergie"}</span>
              <span className="font-bold text-theme-text">
                {formatEnergyState(profile?.studyEnergy, isAr)}
              </span>
            </div>
          </div>

          {regDraft && (
            <div className="p-3.5 rounded-2xl bg-card-muted/70 border border-theme space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-theme-muted">{isAr ? "بيانات التلميذ:" : "Informations élève :"}</span>
                <span className="font-bold text-theme-text">{regDraft.firstName} {regDraft.lastName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-theme-muted">{isAr ? "الوضعية والموقع:" : "Statut & Lieu :"}</span>
                <span className="text-theme-secondary font-medium">
                  {regDraft.studentStatus === "schooled"
                    ? `${isAr ? "متمدرس" : "Scolarisé"}${regDraft.schoolName ? ` (${regDraft.schoolName})` : ""}`
                    : (isAr ? "مترشح حر" : "Candidat libre")}
                  {regDraft.wilayaName ? ` · ${regDraft.wilayaName}` : ""}
                </span>
              </div>
            </div>
          )}

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Link href="/profile/academic">
              <Button variant="primary" size="sm" className="w-full text-xs font-bold rounded-xl py-4">
                <span>{isAr ? "الملف الدراسي والأهداف" : "Profil Académique"}</span>
                <NextArrow className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link href="/auth/register?edit=true">
              <Button variant="outline" size="sm" className="w-full text-xs rounded-xl py-4">
                <span>{isAr ? "تعديل بيانات التسجيل" : "Modifier l'inscription"}</span>
                <NextArrow className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* 3. System & Integrity Card */}
        <Card className="p-5 space-y-2 text-xs shadow-card">
          <div className="flex items-center gap-2 text-theme-text font-bold">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>{isAr ? "أمان البيانات والخصوصية" : "Sécurité & Confidentialité"}</span>
          </div>
          <p className="text-theme-muted leading-relaxed">
            {isAr
              ? "بياناتك الأكاديمية وتقدمك في المواد محفوظ بأمان تام وخاص بك وحدك."
              : "Vos données d'apprentissage sont protégées en toute confidentialité."}
          </p>
        </Card>

        {/* 4. Pilot Telemetry & Safe Export */}
        <Card className="p-5 space-y-3 text-xs border border-theme shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-theme-text font-bold">
              <Download className="h-4 w-4 text-[var(--color-primary)]" />
              <span>{isAr ? "بيانات التجربة الميدانية (Pilot Export)" : "Export des données du pilote"}</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              v1.0.0
            </Badge>
          </div>
          <p className="text-theme-muted leading-relaxed">
            {isAr
              ? "يمكنك تصدير سجل أحداث التعلم الميدانية والتقييمات مجهولة المصدر (Zero PII) بدون أي معلومات شخصية أو كلمات مرور."
              : "Exportez les événements d'apprentissage et retours d'expérience anonymes (sans PII ni mot de passe)."}
          </p>
          <div className="pt-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center justify-center gap-2 text-xs rounded-xl"
              onClick={handleExportPilotData}
              data-testid="pilot-export-btn"
            >
              {exportSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600 font-bold">{isAr ? "تم تحميل ملف JSON بنجاح" : "Fichier téléchargé"}</span>
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

        {/* 5. Account & Session Card (Positioned at the very bottom) */}
        <Card className="p-5 space-y-4 border border-theme shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/30 flex items-center justify-center text-[var(--color-primary)]">
                <User className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-theme-muted block">{isAr ? "البريد الإلكتروني للحساب" : "E-mail du compte"}</span>
                <span className="text-sm font-bold text-theme-text font-mono break-all">
                  {user.email}
                </span>
              </div>
            </div>

            <Badge variant="outline" size="sm" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="h-3 w-3 text-emerald-500" />
              <span>{isAr ? "حساب نشط" : "Compte actif"}</span>
            </Badge>
          </div>

          <div className="pt-3 border-t border-theme flex items-center justify-between">
            <span className="text-xs text-theme-muted">
              {isAr ? "يتم حفظ تقدمك تلقائياً مع كل تمرين ومهمة تنجزها." : "Votre progression est enregistrée automatiquement."}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
              className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
            >
              <LogOut className="h-3.5 w-3.5 ml-1.5 rtl:mr-1.5 rtl:ml-0" />
              <span>{isAr ? "تسجيل الخروج" : "Déconnexion"}</span>
            </Button>
          </div>
        </Card>
      </Container>
    </AppShell>
  );
}
