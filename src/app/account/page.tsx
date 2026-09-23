"use client";

import React, { useEffect, useState, useMemo } from "react";
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
import { useUserProgress } from "@/lib/hooks/useUserProgress";
import { ALL_SUBJECTS, getStreamSubjects } from "@/lib/constants/streams";
import { StreamId, SubjectId } from "@/types/education";
import { normalizeStreamIdWithDefault, getStreamMetadata } from "@/lib/curriculum/filter";
import {
  User,
  ShieldCheck,
  LogOut,
  Target,
  Clock,
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Download,
  Check,
  AlertCircle,
  Award,
  Play,
  Bell,
  BellRing,
  BookOpen,
  Smartphone,
  CheckCircle2,
  Brain,
  Layers,
  ChevronRight,
  Copy,
  Gift,
  Users,
  MessageCircle,
  QrCode,
} from "lucide-react";
import QRCode from "qrcode";
import { exportAnonymizedPilotData } from "@/lib/analytics";
import { MarketingPosterCard } from "@/components/referral/MarketingPosterCard";
import { generateReferralCode } from "@/lib/referral/code";

export default function AccountPage() {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<StrategicProfile | null>(null);
  const [regDraft, setRegDraft] = useState<StudentRegistrationData | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [paymentRecord, setPaymentRecord] = useState<PilotPaymentRecord | null>(null);
  const [referralSummary, setReferralSummary] = useState<any>(null);
  const [copiedCodeField, setCopiedCodeField] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  // Live progress metrics from ProgressService & Supabase
  const {
    skills,
    masteredCount,
    inProgressCount,
    totalStudyTimeSeconds,
    lastLessonId,
    getSubjectStatus,
  } = useUserProgress();

  // Push notification state
  const [notificationPermission, setNotificationPermission] = useState<
    "default" | "granted" | "denied" | "unsupported"
  >("unsupported");
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [isStandaloneApp, setIsStandaloneApp] = useState(false);

  // If visitor is not authenticated, redirect cleanly to login & register page
  useEffect(() => {
    if (!authLoading && !user) {
      window.location.replace("/auth");
    }
  }, [user, authLoading]);

  // Check notification permission and PWA status
  useEffect(() => {
    if (typeof window !== "undefined") {
      if ("Notification" in window) {
        setNotificationPermission(Notification.permission);
      }
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandaloneApp(Boolean(isStandalone));
    }
  }, []);

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

      try {
        const refRes = await fetch(`/api/referral?userId=${encodeURIComponent(user.id)}`);
        const refData = await refRes.json();
        if (refData.success && refData.summary) {
          setReferralSummary(refData.summary);
        }
      } catch (err) {
        console.error("Failed to load referral summary on account page:", err);
      }
    }
    fetchAccProfile();
  }, [user]);

  const copyCode = (text: string, field: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCodeField(field);
      setTimeout(() => setCopiedCodeField(null), 2500);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.replace("/auth");
    } catch (e) {
      console.error("Sign out failed:", e);
      window.location.replace("/auth");
    }
  };

  // Notification toggle handler
  const handleToggleNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === "granted") {
        localStorage.setItem("bac_daily_notifications", "enabled");
      } else {
        localStorage.setItem("bac_daily_notifications", "disabled");
      }
    } catch (e) {
      console.error("Error requesting notification permission:", e);
    }
  };

  // Test Notification sender
  const handleSendTestNotification = () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      try {
        if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(isAr ? "BAC Mastery — تذكير دراسي" : "Rappel BAC Mastery", {
              body: isAr
                ? "🚀 إشعار تجريبي ناجح! ستصلك تذكيرات مراجعة مهمتك اليومية بانتظام."
                : "Notification de test réussie ! Vos rappels de révision sont actifs.",
              icon: "/app-icon.svg",
              badge: "/favicon.svg",
              dir: isAr ? "rtl" : "ltr",
            });
          });
        } else {
          new Notification(isAr ? "BAC Mastery — تذكير دراسي" : "Rappel BAC Mastery", {
            body: isAr
              ? "🚀 إشعار تجريبي ناجح! ستصلك تذكيرات مراجعة مهمتك اليومية بانتظام."
              : "Notification de test réussie ! Vos rappels de révision sont actifs.",
            icon: "/app-icon.svg",
          });
        }
        setTestNotificationSent(true);
        setTimeout(() => setTestNotificationSent(false), 3000);
      } catch (e) {
        console.error("Error sending test notification:", e);
      }
    }
  };

  // Format study time into hours and minutes
  const formatStudyTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
      return isAr ? `${hours} سا و ${minutes} د` : `${hours} h ${minutes} min`;
    }
    if (minutes > 0) {
      return isAr ? `${minutes} دقيقة` : `${minutes} min`;
    }
    return isAr ? "أقل من دقيقة" : "< 1 min";
  };

  // Stream Resolution
  const streamId: StreamId = normalizeStreamIdWithDefault(
    profile?.streamId || (regDraft as any)?.streamId,
    "sciences_exp"
  );
  const streamMeta = getStreamMetadata(streamId);
  const streamSubjects = useMemo(() => getStreamSubjects(streamId), [streamId]);

  // Last Lesson Display Information
  const lastLessonInfo = useMemo(() => {
    if (!lastLessonId) return null;
    if (lastLessonId.startsWith("snv_day_")) {
      const day = lastLessonId.replace("snv_day_", "");
      return {
        title: isAr ? `علوم الطبيعة والحياة • اليوم ${day}` : `Sciences Naturelles • Jour ${day}`,
        subjectId: "natural_sciences",
        url: `/curriculum?lesson=${lastLessonId}&subject=natural_sciences`,
      };
    }
    if (lastLessonId.includes("math")) {
      return {
        title: isAr ? "مادة الرياضيات • الدوال والتحليل" : "Mathématiques • Fonctions",
        subjectId: "math",
        url: "/curriculum?subject=math",
      };
    }
    if (lastLessonId.includes("physics")) {
      return {
        title: isAr ? "العلوم الفيزيائية • المتابعة الزمنية" : "Sciences Physiques • Suivi temporel",
        subjectId: "physics",
        url: "/curriculum?subject=physics",
      };
    }
    return {
      title: isAr ? `متابعة الدرس: ${lastLessonId}` : `Reprendre : ${lastLessonId}`,
      subjectId: "general",
      url: `/curriculum?lesson=${lastLessonId}`,
    };
  }, [lastLessonId, isAr]);

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

  // Study Character Mapping
  const characterMap: Record<string, { nameAr: string; nameFr: string; img: string }> = {
    boy: { nameAr: "الفتى الطموح", nameFr: "L'Ambitieux", img: "/illustrations/characters/boy.jpg" },
    girl: { nameAr: "الفتاة المتفوقة", nameFr: "L'Étoile", img: "/illustrations/characters/girl.jpg" },
    scholar: { nameAr: "الباحث المركز", nameFr: "Le Méthodique", img: "/illustrations/characters/scholar.jpg" },
  };
  const currentCharacterKey = (regDraft as any)?.characterId || (profile as any)?.characterId || "scholar";
  const characterInfo = characterMap[currentCharacterKey] || characterMap.scholar;

  const referralCode =
    referralSummary?.referralCode ||
    (profile as any)?.referral_code ||
    (profile as any)?.referralCode ||
    (user?.id
      ? generateReferralCode(
          profile?.firstName || regDraft?.firstName || (user.user_metadata as any)?.full_name,
          user.id
        )
      : "SHTR2027");

  const creditBalance = referralSummary?.creditBalanceDzd ?? (profile as any)?.credit_balance_dzd ?? 0;

  // Generate QR code pointing to registration with referral code
  useEffect(() => {
    if (referralCode) {
      const regUrl = typeof window !== "undefined"
        ? `${window.location.origin}/auth/register?ref=${encodeURIComponent(referralCode)}`
        : `https://shater.dz/auth/register?ref=${encodeURIComponent(referralCode)}`;

      QRCode.toDataURL(regUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#26302F",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("Error generating QR Code:", err));
    }
  }, [referralCode]);

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `shater_referral_${referralCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <AppShell activeNav="account">
      <Container size="sm" className="py-6 sm:py-10 space-y-6">
        {/* ================================================================= */}
        {/* 1. TOP PRIMARY CARD: REFERRAL CODE, QR CODE & STUDENT IDENTITY    */}
        {/* ================================================================= */}
        <Card className="p-5 sm:p-7 rounded-3xl bg-card border-2 border-[var(--color-primary)]/30 shadow-clay space-y-5">
          {/* Student Profile Identity header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-theme pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center font-bold text-xl shadow-xs">
                🎓
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-theme-text">
                    {profile?.firstName && profile?.lastName
                      ? `${profile.firstName} ${profile.lastName}`
                      : regDraft?.firstName && regDraft?.lastName
                      ? `${regDraft.firstName} ${regDraft.lastName}`
                      : isAr
                      ? "طالب شاطر"
                      : "Élève SHATER"}
                  </h2>
                  <Badge variant="outline" size="sm" className="border-[var(--color-primary)]/40 text-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[10px] font-bold">
                    {isAr ? streamMeta.name_ar : streamMeta.name_fr}
                  </Badge>
                </div>
                <p className="text-xs text-theme-muted mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>

            <div>
              {access.status === "PAID_ACTIVE" ? (
                <Badge variant="success" size="sm" className="px-3 py-1 text-xs font-bold">
                  {isAr ? "اشتراك موسم 2027 نشط ✓" : "Pass Saison Actif"}
                </Badge>
              ) : access.status === "TRIAL_ACTIVE" ? (
                <Badge variant="warning" size="sm" className="px-3 py-1 text-xs font-bold">
                  {isAr ? `فترة تجريبية (${formatTrialCountdown(access.remainingHours, true)})` : "Essai actif"}
                </Badge>
              ) : (
                <Badge variant="outline" size="sm" className="px-3 py-1 text-xs font-bold text-rose-500 border-rose-500/30">
                  {isAr ? "التجربة منتهية" : "Essai expiré"}
                </Badge>
              )}
            </div>
          </div>

          {/* Marketing Poster Card & QR Referral Section */}
          <MarketingPosterCard
            referralCode={referralCode}
            studentName={
              profile?.firstName && profile?.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : regDraft?.firstName && regDraft?.lastName
                ? `${regDraft.firstName} ${regDraft.lastName}`
                : undefined
            }
            discountPercentage={10}
            locale={locale}
          />
        </Card>

        {/* ================================================================= */}
        {/* 2. REAL-TIME STAT CARDS ROW (AUTHENTIC SHATER PALETTE)             */}
        {/* ================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Metric 1: Live Total Study Time */}
          <Card className="p-4 sm:p-5 rounded-3xl border border-theme shadow-clay flex flex-col justify-between space-y-2 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-theme-secondary">
                {isAr ? "وقت المذاكرة الفعلي" : "Temps actif"}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-theme-text font-mono block">
                {formatStudyTime(totalStudyTimeSeconds)}
              </span>
              <span className="text-[11px] text-theme-muted block mt-0.5">
                {isAr ? "تتبع نشط ومسجل" : "Temps effectif"}
              </span>
            </div>
          </Card>

          {/* Metric 2: Live Mastered Skills */}
          <Card className="p-4 sm:p-5 rounded-3xl border border-theme shadow-clay flex flex-col justify-between space-y-2 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-theme-secondary">
                {isAr ? "المهارات المتقنة" : "Compétences"}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shadow-xs">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl sm:text-2xl font-black text-theme-text">
                  {masteredCount}
                </span>
                <span className="text-xs text-theme-muted">
                  /{streamMeta.totalSkills}
                </span>
              </div>
              <span className="text-[11px] text-theme-muted block mt-0.5">
                {inProgressCount > 0 ? (isAr ? `${inProgressCount} قيد البناء` : `${inProgressCount} en cours`) : (isAr ? "مكتملة برهانياً" : "Validées")}
              </span>
            </div>
          </Card>

          {/* Metric 3: Target Score */}
          <Card className="p-4 sm:p-5 rounded-3xl border border-theme shadow-clay flex flex-col justify-between space-y-2 bg-card">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-theme-secondary">
                {isAr ? "الهدف في البكالوريا" : "Objectif BAC"}
              </span>
              <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center shadow-xs">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-[var(--color-accent)] font-mono block">
                {profile?.targetScore ? `${profile.targetScore.toFixed(1)}` : "16.0"}
                <span className="text-xs">/20</span>
              </span>
              <span className="text-[11px] text-theme-muted block mt-0.5">
                {isAr ? "معدل النجاح" : "Mention visée"}
              </span>
            </div>
          </Card>
        </div>

        {/* ================================================================= */}
        {/* 2. RESUME LAST LESSON CARD (متابعة التعلم)                         */}
        {/* ================================================================= */}
        <Card className="p-5 border border-theme shadow-clay bg-gradient-to-br from-card via-card-muted/40 to-card space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--color-primary)] flex items-center gap-2">
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isAr ? "متابعة من حيث توقفت" : "Reprendre la dernière leçon"}</span>
            </span>
            <Badge variant="outline" size="sm" className="text-[10px] font-mono">
              {lastLessonInfo ? (isAr ? "درس قيد المذاكرة" : "En cours") : (isAr ? "جاهز للبدء" : "Prêt")}
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-theme-text">
                {lastLessonInfo
                  ? lastLessonInfo.title
                  : isAr
                  ? "ابدأ الدرس الأول في مادتك الأساسية"
                  : "Démarrez votre premier cours au programme"}
              </h3>
              <p className="text-xs text-theme-muted">
                {lastLessonInfo
                  ? (isAr
                      ? "اضغط للمتابعة الفورية من الشروحات وملخصات المفاهيم المقررة."
                      : "Cliquez pour reprendre immédiatement les fiches et exercices.")
                  : (isAr
                      ? "المكتبة الشاملة مفتوحة لكافة المواد دون أي قيود."
                      : "La bibliothèque complète est disponible en accès libre.")}
              </p>
            </div>

            <Link href={lastLessonInfo ? lastLessonInfo.url : "/curriculum"} className="w-full sm:w-auto shrink-0">
              <Button size="sm" variant="primary" className="w-full font-bold rounded-xl py-3 px-5 shadow-sm flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{lastLessonInfo ? (isAr ? "متابعة الدرس الآن" : "Reprendre") : (isAr ? "فتح المكتبة" : "Explorer")}</span>
                <NextArrow className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* ================================================================= */}
        {/* 3. STREAM-AWARE SUBJECT MASTERY & DIAGNOSTICS BREAKDOWN           */}
        {/* ================================================================= */}
        <Card className="p-5 space-y-4 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-theme-text flex items-center gap-2">
                <Layers className="h-4 w-4 text-[var(--color-primary)]" />
                <span>{isAr ? "حالة المواد والتشخيص المستقل" : "Matières & Diagnostics"}</span>
              </h2>
              <span className="text-[11px] text-theme-muted">
                {isAr ? `الشعبة: ${streamMeta.name_ar}` : `Filière : ${streamMeta.name_fr}`}
              </span>
            </div>

            <Link href="/diagnostic">
              <Button size="sm" variant="outline" className="text-xs font-bold rounded-xl py-1 px-3">
                <span>{isAr ? "مركز التشخيص" : "Diagnostics"}</span>
                <NextArrow className="w-3 h-3 ms-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-2.5">
            {streamSubjects.map((rule) => {
              const subj = ALL_SUBJECTS[rule.subjectId];
              const name = subj ? (isAr ? subj.name_ar : subj.name_fr) : rule.subjectId;
              const diagStatus = getSubjectStatus(rule.subjectId);

              // Count mastered skills in this subject
              const subjectMasteredCount = Object.values(skills).filter(
                (s) => s.subjectId === rule.subjectId && s.status === "mastered"
              ).length;

              return (
                <div
                  key={rule.subjectId}
                  className="p-3.5 rounded-2xl bg-card-muted/70 border border-theme flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-theme-text text-xs sm:text-sm">{name}</span>
                      {rule.isCoreSubject && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          {isAr ? "أساسية" : "Majeure"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-theme-muted font-mono">
                      <span>{isAr ? `المعامل ${rule.coefficient}` : `Coef ${rule.coefficient}`}</span>
                      <span>•</span>
                      <span>{subjectMasteredCount} {isAr ? "مهارة متقنة" : "acquis"}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {diagStatus.completed ? (
                      <Badge variant="success" size="sm" className="font-bold text-[11px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{diagStatus.score !== null ? `${diagStatus.score}/20` : (isAr ? "مكتمل" : "Évalué")}</span>
                      </Badge>
                    ) : (
                      <Link href={`/diagnostic/${rule.subjectId}`}>
                        <Badge variant="outline" size="sm" className="text-[11px] text-theme-muted hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] cursor-pointer">
                          <span>{isAr ? "ابدأ التقييم" : "Évaluer"}</span>
                        </Badge>
                      </Link>
                    )}

                    <Link href={`/curriculum?subject=${rule.subjectId}`}>
                      <Button size="sm" variant="ghost" className="p-1.5 rounded-lg text-theme-muted hover:text-theme-text" title={isAr ? "تصفح دروس المادة" : "Voir les cours"}>
                        <BookOpen className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* ================================================================= */}
        {/* 4. ACADEMIC PROFILE & CHARACTER DETAILS                           */}
        {/* ================================================================= */}
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
              <span className="text-theme-muted block">{isAr ? "الشعبة الرسمية" : "Filière"}</span>
              <span className="font-bold text-theme-text">
                {isAr ? streamMeta.name_ar : streamMeta.name_fr}
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

        {/* ================================================================= */}
        {/* 7. PILOT TELEMETRY & SAFE DATA EXPORT                             */}
        {/* ================================================================= */}
        <Card className="p-5 space-y-3 text-xs border border-theme shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-theme-text font-bold">
              <Download className="h-4 w-4 text-[var(--color-primary)]" />
              <span>{isAr ? "بيانات التجربة الميدانية (Pilot Export)" : "Export des données du pilote"}</span>
            </div>
            <Badge variant="outline" className="text-[10px] font-mono">
              v1.1.0
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

        {/* ================================================================= */}
        {/* 6. SUBSCRIPTION & ACCESS STATUS CARD                              */}
        {/* ================================================================= */}
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
                  : (isAr ? "تجربة مجانية استكشافية (أسبوع كامل - 7 أيام)" : "Essai Découverte (7 jours)")}
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
                    ? "حسابك مفعل باشتراك كامل (Pass BAC 2027) حتى يوم الامتحان الرسمي."
                    : "Accès intégral activé jusqu'au jour de l'épreuve du BAC."}
                </span>
              </div>
            )}
          </div>

          {/* Pending Payment Record Display */}
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

        {/* ================================================================= */}
        {/* 7. PWA & WEB PUSH NOTIFICATION SETTINGS                           */}
        {/* ================================================================= */}
        <Card className="p-5 space-y-4 shadow-card">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-theme-text flex items-center gap-2">
              <Bell className="h-4 w-4 text-[var(--color-primary)]" />
              <span>{isAr ? "إشعارات التذكير وتطبيق الهاتف" : "Notifications & PWA"}</span>
            </h2>

            {isStandaloneApp ? (
              <Badge variant="success" size="sm" className="flex items-center gap-1 text-[11px]">
                <Smartphone className="w-3 h-3" />
                <span>{isAr ? "تطبيق مثبت" : "Installé"}</span>
              </Badge>
            ) : (
              <Badge variant="outline" size="sm" className="text-[11px] text-theme-muted">
                <span>{isAr ? "نسخة المتصفح" : "Web"}</span>
              </Badge>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-card-muted border border-theme space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="font-bold text-theme-text text-xs block">
                  {isAr ? "إشعارات التذكير بالمهام اليومية" : "Rappels quotidiens d'étude"}
                </span>
                <p className="text-[11px] text-theme-muted leading-relaxed">
                  {isAr
                    ? "تنبيه خفيف يُرسل في موعد دراستك المفضل لتذكيرك بإنجاز مهمتك اليومية وسد ثغراتك."
                    : "Recevez une notification discrète pour maintenir votre régularité BAC."}
                </p>
              </div>

              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  notificationPermission === "granted"
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : notificationPermission === "denied"
                    ? "bg-rose-500/20 text-rose-500"
                    : "bg-stone-200 dark:bg-stone-700 text-theme-muted"
                }`}
              >
                {notificationPermission === "granted"
                  ? isAr ? "مفعّلة ✓" : "Activées"
                  : notificationPermission === "denied"
                  ? isAr ? "محظورة" : "Bloquées"
                  : isAr ? "غير مفعلة" : "Désactivées"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-theme/60">
              <Button
                size="sm"
                variant={notificationPermission === "granted" ? "outline" : "primary"}
                onClick={handleToggleNotifications}
                disabled={notificationPermission === "unsupported"}
                className="text-xs font-bold rounded-xl py-2 px-4"
              >
                <BellRing className="w-3.5 h-3.5 me-1.5" />
                <span>
                  {notificationPermission === "granted"
                    ? (isAr ? "تحديث الصلاحية" : "Actualiser")
                    : (isAr ? "تفعيل إشعارات التذكير اليومي" : "Activer les rappels")}
                </span>
              </Button>

              {notificationPermission === "granted" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSendTestNotification}
                  className="text-xs rounded-xl py-2 px-3 border-theme text-theme-secondary hover:text-theme-text"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 me-1" />
                  <span>{testNotificationSent ? (isAr ? "تم الإرسال ✓" : "Envoyé") : (isAr ? "إرسال إشعار تجريبي" : "Tester")}</span>
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* ================================================================= */}
        {/* 8. ACCOUNT & SESSION (LOGOUT)                                     */}
        {/* ================================================================= */}
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
