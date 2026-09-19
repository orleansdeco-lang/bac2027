"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/lib/auth/context";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getStudentAccess, formatTrialExpiryDate } from "@/lib/access";
import { markPaymentPendingVerification } from "@/lib/payment";
import { getAuthToken } from "@/lib/operations/client-api";
import { StudentService } from "@/lib/services";
import {
  DiagnosticRepository,
  MasteryRepository,
  MissionRepository,
} from "@/lib/repositories";
import { trackEvent } from "@/lib/analytics";
import {
  Sparkles,
  Target,
  CheckCircle2,
  Check,
  Copy,
  Info,
  ExternalLink,
  MessageCircle,
  Headphones,
  RefreshCw,
  UploadCloud,
  FileCheck,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  Zap,
  Building2,
  Phone,
  User,
  MapPin,
  CheckCheck,
  HelpCircle,
} from "lucide-react";

export default function SubscribePage() {
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [masteryCount, setMasteryCount] = useState(0);
  const [completedMissionsCount, setCompletedMissionsCount] = useState(0);

  // Selected plan: "season" (featured) or "monthly"
  const [selectedPlanId, setSelectedPlanId] = useState<"season" | "monthly">("season");

  // Contact inputs for smooth verification
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [studentWilaya, setStudentWilaya] = useState("");

  // Receipt file upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Post-submission success state
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    referenceId: string;
    receiptPath: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Official contact coordinates
  const ACTIVATION_WHATSAPP_NUMBER = "213550303286";
  const SUPPORT_WHATSAPP_NUMBER = "213550853234";
  const BARIDIMOB_RIP = "00799999004125624964";
  const CCP_ACCOUNT = "0041256249";
  const CCP_KEY = "64";

  const selectedPlanPrice = selectedPlanId === "season" ? 4900 : 900;
  const selectedPlanName =
    selectedPlanId === "season"
      ? (isAr ? "موسم البكالوريا الكامل 2027 (BAC Pass)" : "Pass Saison Complète BAC 2027")
      : (isAr ? "الاشتراك الشهري (30 يوماً)" : "Pass Mensuel (30 jours)");

  const copyToClipboard = (text: string, field: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2500);
    }
  };

  useEffect(() => {
    trackEvent("conversion_viewed", { userId: user?.id || null });

    async function loadData() {
      try {
        const uid = user?.id;
        const [prof, diag, mast, missions] = await Promise.all([
          StudentService.getProfile(uid),
          DiagnosticRepository.getResults(uid),
          MasteryRepository.getMasteryRecords(uid),
          MissionRepository.getMissions(uid),
        ]);

        setProfile(prof);
        setDiagnosticResult(diag);
        setMasteryCount(mast ? Object.keys(mast).length : 0);
        setCompletedMissionsCount(
          missions
            ? Object.values(missions).filter(
                (m: any) => m.status === "completed" || m.status === "mastered"
              ).length
            : 0
        );

        if (prof) {
          const fullName = `${prof.firstName || ""} ${prof.lastName || ""}`.trim();
          if (fullName) setStudentName(fullName);
          const phone = prof.studentPhone || (prof as any).student_phone || "";
          if (phone) setStudentPhone(phone);
          const wilaya = prof.wilayaName || (prof as any).wilaya_name || "";
          if (wilaya) setStudentWilaya(wilaya);
        }
      } catch (err) {
        console.error("Subscribe page load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReceiptError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setReceiptError(isAr ? "حجم الملف يتجاوز الحد الأقصى (5 ميغابايت)" : "Le fichier dépasse 5 Mo");
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setReceiptError(
        isAr
          ? "صيغة غير مدعومة. يرجى اختيار صورة JPG أو PNG أو مستند PDF"
          : "Format non supporté (JPEG, PNG ou PDF requis)"
      );
      return;
    }

    setReceiptFile(file);

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReceiptDataUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setReceiptDataUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setReceiptFile(null);
    setReceiptDataUrl(null);
    setReceiptError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Single-action atomic receipt submission
  const handleSubmitReceipt = async () => {
    if (!receiptFile) {
      setReceiptError(isAr ? "يرجى اختيار صورة أو ملف وصل الدفع أولاً" : "Veuillez joindre le reçu de paiement");
      return;
    }

    setIsSubmitting(true);
    setReceiptError(null);

    try {
      const effectiveUserId =
        user?.id ||
        profile?.id ||
        (typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("bac_auth_user") || "{}")?.id
          : undefined) ||
        `pilot_${Date.now()}`;

      const referenceId = `SHATER-${selectedPlanId.toUpperCase()}-${effectiveUserId.slice(0, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

      const formData = new FormData();
      formData.append("referenceId", referenceId);
      formData.append("userId", effectiveUserId);
      formData.append("plan", selectedPlanId);
      formData.append("file", receiptFile);
      if (receiptDataUrl) {
        formData.append("fileBase64", receiptDataUrl.split(",")[1] || "");
      }
      formData.append("studentEmail", user?.email || profile?.email || "");
      if (studentName) formData.append("studentName", studentName);
      if (studentPhone) formData.append("studentPhone", studentPhone);
      if (studentWilaya) formData.append("wilayaName", studentWilaya);
      if (profile?.streamId) formData.append("streamId", profile.streamId);

      const token = await getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/ops/payments/receipt/upload", {
        method: "POST",
        headers,
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to submit receipt");
      }

      markPaymentPendingVerification(referenceId);

      setOrderResult({
        orderId: data.orderId || referenceId,
        referenceId,
        receiptPath: data.receiptPath || receiptDataUrl || "",
      });

      trackEvent("payment_pending_verification", {
        userId: effectiveUserId,
        plan: selectedPlanId,
        orderId: data.orderId,
      });
    } catch (err: any) {
      console.error("Receipt submission error:", err);
      setReceiptError(
        isAr
          ? "تعذر إرسال الوصل. يرجى التأكد من اتصال الإنترنت أو إرسال الوصل مباشرة عبر واتساب."
          : "Erreur lors de l'envoi du reçu. Veuillez réessayer ou contacter le support WhatsApp."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const access = getStudentAccess(profile);
  const isExpired = access.status === "TRIAL_EXPIRED";

  // WhatsApp activation message link
  const activationWhatsAppMessage = `مرحباً، قمت بتسديد اشتراك منصة الشاطر (SHATER BAC 2027).\n\n📌 رقم الطلب: ${orderResult?.referenceId || "جديد"}\n🎓 نوع الاشتراك: ${selectedPlanName} (${selectedPlanPrice.toLocaleString()} دج)\n👤 اسم الطالب: ${studentName || user?.email || "طالب مسجل"}\n📱 رقم الهاتف: ${studentPhone || "غير مسجل"}\n📧 البريد: ${user?.email || "غير مسجل"}\n\nمرفق صورة الوصل للتفعيل الفوري.`;
  const activationWhatsAppUrl = `https://wa.me/${ACTIVATION_WHATSAPP_NUMBER}?text=${encodeURIComponent(activationWhatsAppMessage)}`;

  // WhatsApp technical support link
  const supportWhatsAppUrl = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "مرحباً، أحتاج مساعدة أو استفسار بخصوص الدفع والاشتراك في منصة الشاطر."
  )}`;

  return (
    <AppShell activeNav="home">
      <div className="min-h-screen py-8 sm:py-12 bg-theme-base">
        <Container size="md" className="space-y-8 max-w-4xl mx-auto px-4 sm:px-6">
          {/* Active Subscription Banner if Already Paid */}
          {access.status === "PAID_ACTIVE" && (
            <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-theme-text">
                {isAr ? "أنت مشترك رسمي في منصة الشاطر (SHATER BAC)!" : "Vous êtes abonné à SHATER BAC !"}
              </h2>
              <p className="text-xs sm:text-sm text-theme-secondary max-w-md mx-auto">
                {isAr
                  ? `اشتراكك مفعل بالكامل${
                      access.subscriptionExpiresAt
                        ? ` حتى ${formatTrialExpiryDate(access.subscriptionExpiresAt, isAr)}`
                        : ""
                    }. جميع الدروس، الاختبارات، ومعمل الأخطاء متاحة لك دون قيود.`
                  : "Votre abonnement est pleinement actif."}
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-[var(--color-primary)] text-white shadow-md hover:opacity-95 transition-all"
              >
                <span>{isAr ? "الانتقال إلى لوحة المذاكرة" : "Aller au tableau de bord"}</span>
              </Link>
            </div>
          )}

          {/* Rejected Receipt Banner */}
          {(profile as any)?.access_status === "REJECTED" && (
            <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-rose-900 dark:text-rose-100">
                {isAr ? "تم رفض وصل الدفع السابق" : "Reçu précédent non validé"}
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {isAr
                  ? `سبب عدم التأكيد: ${
                      (profile as any)?.rejection_reason ||
                      "الوصل غير واضح أو لم يتم العثور على المعاملة"
                    }. يمكنك إعادة رفع صورة واضحة للوصل بالأسفل لتفعيل حسابك.`
                  : "Veuillez soumettre à nouveau un reçu lisible ci-dessous."}
              </p>
            </div>
          )}

          {/* Header Section */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-primary-soft)] border border-[var(--color-primary)]/25 text-[var(--color-primary)] text-xs font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isAr ? "منظومة الشاطر للبكالوريا 2027 🇩🇿" : "Système SHATER BAC 2027 🇩🇿"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-theme-text tracking-tight font-sans leading-snug">
              {isExpired
                ? isAr
                  ? "انتهت فترة التجربة.. واصل رحلتك نحو التفوق"
                  : "Votre essai gratuit est terminé"
                : isAr
                ? "استثمر في مستقبلك الأكاديمي.. خطوة واحدة تفصلك عن التميز"
                : "Investissez dans votre réussite au BAC 2027"}
            </h1>

            <p className="text-sm sm:text-base text-theme-secondary max-w-2xl mx-auto leading-relaxed">
              {isAr
                ? "تفعيل حسابك يمنحك وصولاً غير محدود لجميع المواد، معمل الأخطاء الذكي، والاختبارات التوأم. كل تقدمك ونتائجك السابقة محفوظة بالكامل وستستمر من نفس النقطة."
                : "Accès illimité aux missions adaptatives, à l'Error Lab et aux sujets d'entraînement. Tous vos acquis restent intégralement sauvegardés."}
            </p>
          </div>

          {/* Real Stored Student Progress Summary Card */}
          <Card data-testid="subscribe-conversion-card" className="p-5 sm:p-6 bg-card border-theme space-y-4 shadow-sm rounded-3xl">
            <div className="flex items-center justify-between border-b border-theme pb-3">
              <span className="text-xs font-bold text-theme-text uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4 text-[var(--color-primary)]" />
                <span>{isAr ? "حصيلة عملك الميداني المحفوظة في حسابك" : "Vos progrès actuels sauvegardés"}</span>
              </span>
              <Badge variant="outline" size="sm" className="text-[var(--color-success)] border-[var(--color-success)]/30 bg-[var(--color-success-soft)]">
                {isAr ? "محفوظة وجاهزة للاستئناف ✓" : "Sauvegardé ✓"}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-surface border border-theme">
                <span className="text-[11px] text-theme-muted block">{isAr ? "معدلك المستهدف" : "Objectif BAC"}</span>
                <span className="text-lg sm:text-xl font-bold text-theme-text mt-0.5 block font-mono">
                  {profile?.targetScore ? `${Number(profile.targetScore).toFixed(2)}/20` : "16.00/20"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface border border-theme">
                <span className="text-[11px] text-theme-muted block">{isAr ? "إشارة التشخيص" : "Diagnostic"}</span>
                <span className="text-lg sm:text-xl font-bold text-[var(--color-accent)] mt-0.5 block font-mono">
                  {diagnosticResult?.observedSignal
                    ? `${Math.round(diagnosticResult.observedSignal)}%`
                    : diagnosticResult?.observedDiagnosticScore
                    ? `${Math.round(diagnosticResult.observedDiagnosticScore)}%`
                    : isAr
                    ? "جاهز"
                    : "Prêt"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface border border-theme">
                <span className="text-[11px] text-theme-muted block">{isAr ? "مهام مكتملة" : "Missions finies"}</span>
                <span className="text-lg sm:text-xl font-bold text-[var(--color-primary)] mt-0.5 block font-mono">
                  {completedMissionsCount}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface border border-theme">
                <span className="text-[11px] text-theme-muted block">{isAr ? "مهارات مثبتة" : "Maîtrises validées"}</span>
                <span className="text-lg sm:text-xl font-bold text-[var(--color-success)] mt-0.5 block font-mono">
                  {masteryCount}
                </span>
              </div>
            </div>

            {diagnosticResult?.bottleneckSkillId && (
              <div className="p-3 rounded-xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/30 text-xs text-[var(--color-accent)] flex items-center gap-2.5">
                <Info className="w-4 h-4 text-[var(--color-accent)] shrink-0" />
                <span>
                  {isAr
                    ? `أكبر ثغرة ستعالجها فور التفعيل: ${diagnosticResult.bottleneckSkillId.replace(/_/g, " ")}`
                    : `Point clé à travailler : ${diagnosticResult.bottleneckSkillId.replace(/_/g, " ")}`}
                </span>
              </div>
            )}
          </Card>

          {/* STEP 1: Plan Selection Cards */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center font-mono">
                1
              </span>
              <h2 className="text-lg font-bold text-theme-text">
                {isAr ? "اختر باقة الاشتراك المناسبة لك" : "Choisissez votre formule d'abonnement"}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Option 1: Season Pass (Featured & High Conversion) */}
              <div
                onClick={() => setSelectedPlanId("season")}
                className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  selectedPlanId === "season"
                    ? "border-[var(--color-primary)] bg-card shadow-lg ring-2 ring-[var(--color-primary)]/20 scale-[1.01]"
                    : "border-theme bg-surface/70 hover:border-[var(--color-primary)]/40 hover:bg-card"
                }`}
              >
                {/* Top Badge */}
                <div className="absolute -top-3.5 right-6 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-[11px] font-extrabold shadow-sm flex items-center gap-1">
                  <span>الأكثر طلباً وتوفيراً ⭐</span>
                </div>

                <div className="space-y-4 pt-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-theme-text">
                        {isAr ? "موسم البكالوريا 2027 الكامل" : "Pass Saison BAC 2027"}
                      </h3>
                      <p className="text-xs text-theme-secondary mt-1">
                        {isAr ? "اشتراك شامل لمرة واحدة حتى آخر يوم في امتحان البكالوريا (جوان 2027)" : "Accès complet garanti jusqu'aux épreuves du BAC"}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                        selectedPlanId === "season"
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                          : "border-theme bg-surface"
                      }`}
                    >
                      {selectedPlanId === "season" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 pb-2 border-b border-theme">
                    <span className="text-3xl sm:text-4xl font-black text-theme-text font-mono">
                      4,900
                    </span>
                    <span className="text-sm font-bold text-theme-secondary">دج / الموسم كاملاً</span>
                    <span className="text-[11px] text-emerald-600 font-semibold ps-2">
                      (~490 دج/شهر فقط)
                    </span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2.5 text-xs text-theme-secondary">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{isAr ? "وصول غير محدود لجميع المواد والشعب حتى جوان 2027" : "Accès illimité à toutes les matières"}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{isAr ? "معمل الأخطاء الذكي (Error Lab) لمعالجة أسباب التعثر" : "Error Lab : analyse des causes profondes"}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{isAr ? "اختبارات توأم مستقلة لتأكيد الإتقان بدون حفظ أعمى" : "Retests jumeaux pour valider la maîtrise"}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{isAr ? "بنك مواضيع البكالوريا الرسمية والمقترحة مع الحلول وسلم التنقيط" : "Sujets de BAC avec corrigés types"}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{isAr ? "مرافقة وإرشاد بيداغوجي طوال السنة" : "Suivi et accompagnement pédagogique"}</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-theme/60 text-center">
                  <span className="text-xs font-bold text-[var(--color-primary)]">
                    {selectedPlanId === "season" ? "✓ الباقة المحددة حالياً" : "انقر لتحديد هذه الباقة"}
                  </span>
                </div>
              </div>

              {/* Option 2: Monthly Pass */}
              <div
                onClick={() => setSelectedPlanId("monthly")}
                className={`p-6 rounded-3xl border-2 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                  selectedPlanId === "monthly"
                    ? "border-[var(--color-primary)] bg-card shadow-lg ring-2 ring-[var(--color-primary)]/20 scale-[1.01]"
                    : "border-theme bg-surface/70 hover:border-[var(--color-primary)]/40 hover:bg-card"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-theme-text">
                        {isAr ? "الاشتراك الشهري" : "Abonnement Mensuel"}
                      </h3>
                      <p className="text-xs text-theme-secondary mt-1">
                        {isAr ? "صلاحية 30 يوماً كاملة قابلة للتجديد بكل مرونة حسب وتيرتك" : "Accès complet pendant 30 jours renouvelable"}
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 ${
                        selectedPlanId === "monthly"
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                          : "border-theme bg-surface"
                      }`}
                    >
                      {selectedPlanId === "monthly" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 pb-2 border-b border-theme">
                    <span className="text-3xl sm:text-4xl font-black text-theme-text font-mono">
                      900
                    </span>
                    <span className="text-sm font-bold text-theme-secondary">دج / شهرياً</span>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-2.5 text-xs text-theme-secondary">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{isAr ? "وصول كامل وشامل لمدة 30 يوماً قابلة للتجديد" : "Accès complet 30 jours renouvelable"}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{isAr ? "معمل الأخطاء الذكي وجميع مهام التعلم اليومية" : "Error Lab et missions quotidiennes"}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{isAr ? "متابعة دقيقة لمستوى التقدم ونقاط الضعف" : "Suivi précis des compétences"}</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{isAr ? "حرية التجديد شهرياً بدون أي التزام مسبق" : "Renouvelable librement sans engagement"}</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-5 pt-3 border-t border-theme/60 text-center">
                  <span className="text-xs font-bold text-[var(--color-primary)]">
                    {selectedPlanId === "monthly" ? "✓ الباقة المحددة حالياً" : "انقر لتحديد هذه الباقة"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: Official Payment Coordinates */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center font-mono">
                  2
                </span>
                <h2 className="text-lg font-bold text-theme-text">
                  {isAr ? "طرق الدفع الرسمية (بريدي موب / الحساب البريدي CCP)" : "Coordonnées officielles de paiement"}
                </h2>
              </div>
              <div className="px-3 py-1 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-bold font-mono">
                {isAr ? `المبلغ المطلوب: ${selectedPlanPrice.toLocaleString()} دج` : `Montant : ${selectedPlanPrice.toLocaleString()} DA`}
              </div>
            </div>

            <Card className="p-6 bg-card border-theme rounded-3xl space-y-5 shadow-sm">
              {/* Method A: BaridiMob */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-theme space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold text-sm">
                      📱
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-theme-text">
                        {isAr ? "الخيار الأول: تطبيق بريدي موب (BaridiMob)" : "Option 1 : Application BaridiMob"}
                      </h3>
                      <span className="text-[11px] text-theme-muted">
                        {isAr ? "التحويل فوري وسهل في ثوانٍ عبر رقم الـ RIP" : "Virement instantané via le RIP"}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 font-bold">
                    {isAr ? "فوري ⚡" : "Instantané ⚡"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-theme-muted font-mono uppercase tracking-wider block">
                      {isAr ? "رقم الـ RIP للحساب البريدي الجاري:" : "Numéro RIP BaridiMob :"}
                    </span>
                    <span className="font-mono font-bold text-theme-text text-sm sm:text-base tracking-wider select-all">
                      {BARIDIMOB_RIP}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(BARIDIMOB_RIP, "rip")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary-soft)] hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-bold transition-all self-start sm:self-center cursor-pointer active:scale-95"
                  >
                    {copiedField === "rip" ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600">{isAr ? "تم النسخ بنجاح!" : "Copié !"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>{isAr ? "نسخ رقم الـ RIP" : "Copier le RIP"}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs text-theme-secondary space-y-1 pt-1 leading-relaxed">
                  <p className="font-semibold text-theme-text">
                    {isAr ? "خطوات التحويل عبر بريدي موب:" : "Étapes sur BaridiMob :"}
                  </p>
                  <p>
                    {isAr
                      ? "1. افتح تطبيق بريدي موب > اختر «تحويل» (Virement) > «تحويل نحو حساب آخر»."
                      : "1. Ouvrez BaridiMob > Virement vers un autre compte."}
                  </p>
                  <p>
                    {isAr
                      ? `2. الصق رقم الـ RIP المنسوخ أعلاه وحدد المبلغ (${selectedPlanPrice.toLocaleString()} دج).`
                      : `2. Collez le RIP et saisissez le montant (${selectedPlanPrice.toLocaleString()} DA).`}
                  </p>
                  <p>
                    {isAr
                      ? "3. أكّد التحويل والتقط لقطة شاشة (Screenshot) واضحة لوصل العملية."
                      : "3. Confirmez et prenez une capture d'écran du reçu."}
                  </p>
                </div>
              </div>

              {/* Method B: CCP Office Transfer */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-theme space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-600 flex items-center justify-center font-bold text-sm">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-theme-text">
                        {isAr ? "الخيار الثاني: مكاتب بريد الجزائر (Poste Algérie CCP)" : "Option 2 : Bureaux de poste CCP"}
                      </h3>
                      <span className="text-[11px] text-theme-muted">
                        {isAr ? "عبر أي مكتب بريد بحوالة بريدية أو صك CCP" : "Via virement postal ou chèque CCP"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-card border border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-theme-muted font-mono uppercase tracking-wider block">
                      {isAr ? "الحساب البريدي والمفتاح (CCP & Clé):" : "Compte postal & Clé :"}
                    </span>
                    <div className="flex items-center gap-3 font-mono font-bold text-theme-text text-sm sm:text-base">
                      <span>{CCP_ACCOUNT}</span>
                      <span className="text-theme-muted">|</span>
                      <span>{isAr ? `المفتاح (Clé): ${CCP_KEY}` : `Clé : ${CCP_KEY}`}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${CCP_ACCOUNT} ${CCP_KEY}`, "ccp")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-primary-soft)] hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-bold transition-all self-start sm:self-center cursor-pointer active:scale-95"
                  >
                    {copiedField === "ccp" ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-600">{isAr ? "تم النسخ بنجاح!" : "Copié !"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>{isAr ? "نسخ رقم الـ CCP" : "Copier CCP"}</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-xs text-theme-secondary space-y-1 pt-1 leading-relaxed">
                  <p>
                    {isAr
                      ? "• اطلب ملء حوالة بريدية عادية (Mandat) أو صك بريدي موجه لمنظومة الشاطر."
                      : "• Remplissez un mandat ordinaire ou chèque postal."}
                  </p>
                  <p>
                    {isAr
                      ? "• احتفظ بالوصل الورقي الذي يختمه عون البريد وصوّره بوضوح بالهاتف."
                      : "• Prenez une photo nette du reçu tamponné par la poste."}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* STEP 3: Upload Receipt & Instant Activation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white text-xs font-bold flex items-center justify-center font-mono">
                3
              </span>
              <h2 className="text-lg font-bold text-theme-text">
                {isAr ? "رفع وصل الدفع وتأكيد التفعيل" : "Téléchargement du reçu et confirmation"}
              </h2>
            </div>

            {/* Post-submission Success View */}
            {orderResult ? (
              <Card className="p-6 sm:p-8 bg-card border-2 border-emerald-500/40 rounded-3xl space-y-6 shadow-md text-center animate-scale-in">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-black text-theme-text">
                    {isAr ? "تم استلام وصل الدفع بنجاح!" : "Reçu de paiement bien reçu !"}
                  </h3>
                  <p className="text-xs sm:text-sm text-theme-secondary max-w-md mx-auto">
                    {isAr
                      ? "طلبك الآن مسجل في قاعدة العمليات وقيد التحقق الفوري. لتسريع التفعيل إلى أقل من 10 دقائق، اضغط على زر الواتساب بالأسفل لإشعار المشرف."
                      : "Votre demande est enregistrée. Cliquez sur le bouton WhatsApp ci-dessous pour accélérer la validation."}
                  </p>
                </div>

                {/* Order Reference Box */}
                <div className="p-4 rounded-2xl bg-[var(--color-primary-soft)]/50 border border-[var(--color-primary)]/30 max-w-md mx-auto flex items-center justify-between text-xs">
                  <span className="text-theme-secondary font-medium">
                    {isAr ? "الرمز المرجعي للطلب:" : "Référence de commande :"}
                  </span>
                  <span className="font-mono font-extrabold text-[var(--color-primary)] text-sm select-all">
                    {orderResult.referenceId}
                  </span>
                </div>

                {/* Receipt Preview Thumbnail */}
                {orderResult.receiptPath && orderResult.receiptPath.startsWith("data:image") && (
                  <div className="max-w-xs mx-auto">
                    <span className="text-[11px] text-theme-muted block mb-2">{isAr ? "صورة الوصل المرفقة:" : "Reçu joint :"}</span>
                    <img
                      src={orderResult.receiptPath}
                      alt="وصل الدفع"
                      className="max-h-48 mx-auto rounded-2xl border border-theme object-contain shadow-sm"
                    />
                  </div>
                )}

                {/* Primary Action: Direct WhatsApp Activation */}
                <div className="space-y-3 max-w-md mx-auto pt-2">
                  <a
                    href={activationWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full min-h-[52px] rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 fill-current shrink-0" />
                    <span>{isAr ? "إشعار المشرف عبر واتساب للتفعيل الفوري 🚀" : "Notifier le superviseur via WhatsApp"}</span>
                    <ExternalLink className="w-4 h-4 opacity-80 shrink-0" />
                  </a>

                  <Link
                    href="/dashboard"
                    className="w-full min-h-[44px] rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 bg-surface hover:bg-surface/80 border border-theme text-theme-text transition-all"
                  >
                    <span>{isAr ? "العودة إلى لوحة التلميذ" : "Retour au tableau de bord"}</span>
                  </Link>
                </div>
              </Card>
            ) : (
              /* Upload Form */
              <Card className="p-6 sm:p-8 bg-card border-theme rounded-3xl space-y-6 shadow-sm">
                {/* File Drop & Browse Area */}
                <div className="space-y-3">
                  <span className="text-xs font-extrabold text-theme-text block">
                    {isAr ? "صورة وصل التحويل (سكرين شوت أو صورة ورقية):" : "Photo du reçu de virement :"}
                  </span>

                  <input
                    ref={fileInputRef}
                    type="file"
                    id="receipt-file-input"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {!receiptFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-8 border-2 border-dashed border-theme hover:border-[var(--color-primary)] bg-surface/50 hover:bg-surface rounded-3xl text-center cursor-pointer transition-all space-y-3 group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-theme-text">
                          {isAr ? "اضغط هنا لاختيار صورة الوصل أو اسحب الملف إلى هنا" : "Cliquez pour sélectionner le reçu ou glissez-le ici"}
                        </p>
                        <p className="text-[11px] text-theme-muted mt-1">
                          {isAr ? "الصيغ المقبولة: JPG, PNG, WEBP أو PDF (أقصى حد: 5 ميغابايت)" : "Formats acceptés : JPG, PNG, WEBP ou PDF (max 5 Mo)"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-surface border border-theme space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 truncate">
                          <FileCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                          <div className="truncate text-start">
                            <span className="text-xs font-bold text-theme-text block truncate">
                              {receiptFile.name}
                            </span>
                            <span className="text-[10px] text-theme-muted font-mono">
                              {(receiptFile.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-xs text-rose-500 hover:text-rose-600 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                        >
                          {isAr ? "تغيير الملف" : "Changer"}
                        </button>
                      </div>

                      {receiptDataUrl && (
                        <div className="pt-2 text-center">
                          <img
                            src={receiptDataUrl}
                            alt="معاينة وصل الدفع"
                            className="max-h-52 mx-auto rounded-2xl border border-theme object-contain shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {receiptError && (
                    <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{receiptError}</span>
                    </div>
                  )}
                </div>

                {/* Verification Fields: Pre-filled from student profile */}
                <div className="pt-2 border-t border-theme space-y-4">
                  <span className="text-xs font-extrabold text-theme-text block">
                    {isAr ? "بيانات تأكيد الهوية (تساعد المشرف على مطابقة الوصل فورياً):" : "Informations de confirmation :"}
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-theme-secondary block flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        <span>{isAr ? "اسم ولقب الطالب" : "Nom complet"}</span>
                      </label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder={isAr ? "مثال: أيمن بن عيسى" : "Nom et prénom"}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-theme text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-theme-secondary block flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        <span>{isAr ? "رقم هاتف الطالب / الولي" : "Téléphone"}</span>
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={studentPhone}
                        onChange={(e) => setStudentPhone(e.target.value)}
                        placeholder="05 / 06 / 07..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-theme text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-theme-secondary block flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        <span>{isAr ? "الولاية" : "Wilaya"}</span>
                      </label>
                      <input
                        type="text"
                        value={studentWilaya}
                        onChange={(e) => setStudentWilaya(e.target.value)}
                        placeholder={isAr ? "مثال: الجزائر العاصمة، وهران، سطيف..." : "Wilaya"}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-theme text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Single Submit Button with Spinner & Protection */}
                <div className="pt-2 space-y-3">
                  <button
                    type="button"
                    data-testid="submit-receipt-primary-cta"
                    onClick={handleSubmitReceipt}
                    disabled={isSubmitting || !receiptFile}
                    className="w-full min-h-[54px] rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-xl shadow-[var(--color-primary)]/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin shrink-0" />
                        <span>{isAr ? "جاري رفع الوصل وتوثيق الطلب..." : "Envoi en cours..."}</span>
                      </>
                    ) : (
                      <>
                        <CheckCheck className="w-5 h-5 shrink-0" />
                        <span>
                          {isAr
                            ? `تأكيد وإرسال وصل الدفع (${selectedPlanPrice.toLocaleString()} دج)`
                            : `Confirmer et envoyer le reçu (${selectedPlanPrice.toLocaleString()} DA)`}
                        </span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-theme-muted text-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{isAr ? "بياناتك مشفرة ومحمية 100%. يتم التحقق فورياً وتفعيل الحساب." : "Paiement sécurisé et activation rapide."}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Technical Support Box */}
          <div className="p-4 sm:p-5 rounded-3xl bg-surface border border-theme flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3 text-center sm:text-start">
              <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-theme-text">
                  {isAr ? "هل تواجه أي صعوبة أو لديك استفسار؟" : "Besoin d'aide pour le paiement ?"}
                </h4>
                <p className="text-xs text-theme-muted mt-0.5">
                  {isAr ? "فريق الدعم البيداغوجي والتقني متاح للإجابة على جميع تساؤلاتك فورياً" : "Notre équipe d'assistance est disponible sur WhatsApp"}
                </p>
              </div>
            </div>

            <a
              href={supportWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="whatsapp-support-cta"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition-all shrink-0 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current shrink-0" />
              <span>{isAr ? "تواصل مع الدعم الفني" : "Contacter le support"}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 shrink-0" />
            </a>
          </div>

          {/* Secondary CTA navigation */}
          <div className="flex justify-center">
            <Link href="/progress">
              <Button
                data-testid="subscribe-secondary-cta"
                size="md"
                variant="ghost"
                className="text-xs text-theme-muted hover:text-theme-text rounded-xl"
              >
                <span>{isAr ? "← العودة للاطلاع على مكتسباتي السابقة" : "← Consulter mes acquis"}</span>
              </Button>
            </Link>
          </div>

          {/* Commercial Transparency FAQ Section */}
          <div data-testid="commercial-faq-section" className="space-y-4 pt-4 border-t border-theme">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[var(--color-primary)]" />
              <h3 className="text-base font-bold text-theme-text">
                {isAr ? "الأسئلة الشائعة والضمانات" : "Questions Fréquentes"}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Card className="p-4 bg-card border-theme space-y-1.5 shadow-sm rounded-2xl">
                <h4 className="text-xs sm:text-sm font-bold text-theme-text flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] inline-flex items-center justify-center text-[10px] font-mono shrink-0">1</span>
                  <span>{isAr ? "متى يتم تفعيل حسابي بعد إرسال الوصل؟" : "Quand mon compte sera-t-il activé ?"}</span>
                </h4>
                <p className="text-xs text-theme-secondary leading-relaxed ps-7">
                  {isAr
                    ? "يتم التحقق من الوصل فور وصوله، ويتم التفعيل في مدة تتراوح بين 5 إلى 30 دقيقة كحد أقصى. بمجرد الضغط على زر الواتساب بعد إرسال الوصل، يتلقى المشرف إشعارك مباشرة."
                    : "L'activation s'effectue généralement dans un délai de 5 à 30 minutes après vérification du reçu."}
                </p>
              </Card>

              <Card className="p-4 bg-card border-theme space-y-1.5 shadow-sm rounded-2xl">
                <h4 className="text-xs sm:text-sm font-bold text-theme-text flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] inline-flex items-center justify-center text-[10px] font-mono shrink-0">2</span>
                  <span>{isAr ? "هل تضيع بياناتي واختباراتي السابقة؟" : "Mes données précédentes sont-elles conservées ?"}</span>
                </h4>
                <p className="text-xs text-theme-secondary leading-relaxed ps-7">
                  {isAr
                    ? "لا، جميع نتائجك، مهاراتك المثبتة، تقرير معمل الأخطاء، ونقاط قوتك وضعفك محفوظة 100% في قاعدة البيانات، وستواصل التدريب من نفس النقطة التي توقفت عندها."
                    : "Toutes vos données, diagnostics et maîtrises validées sont intégralement conservées."}
                </p>
              </Card>

              <Card className="p-4 bg-card border-theme space-y-1.5 shadow-sm rounded-2xl">
                <h4 className="text-xs sm:text-sm font-bold text-theme-text flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] inline-flex items-center justify-center text-[10px] font-mono shrink-0">3</span>
                  <span>{isAr ? "هل يمكنني الدفع نقداً بدون تطبيق بريدي موب؟" : "Puis-je payer sans BaridiMob ?"}</span>
                </h4>
                <p className="text-xs text-theme-secondary leading-relaxed ps-7">
                  {isAr
                    ? "نعم بكل تأكيد! يمكنك التوجه إلى أي مكتب بريد جزائري (Poste Algérie) وطلب تحويل المبلغ إلى رقم الحساب CCP والمفتاح المذكورين أعلاه، ثم تصوير الوصل ورفعه هنا."
                    : "Oui, vous pouvez effectuer un virement ordinaire en espèces dans n'importe quel bureau de poste (Poste Algérie)."}
                </p>
              </Card>

              <Card className="p-4 bg-card border-theme space-y-1.5 shadow-sm rounded-2xl">
                <h4 className="text-xs sm:text-sm font-bold text-theme-text flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] inline-flex items-center justify-center text-[10px] font-mono shrink-0">4</span>
                  <span>{isAr ? "ما الفرق بين اشتراك الموسم والاشتراك الشهري؟" : "Quelle est la différence entre le pass saison et mensuel ?"}</span>
                </h4>
                <p className="text-xs text-theme-secondary leading-relaxed ps-7">
                  {isAr
                    ? "اشتراك الموسم يمنحك وصولاً شاملاً طوال السنة حتى يوم امتحان البكالوريا في جوان 2027 بسعر 4,900 دج (ما يعادل 490 دج شهرياً فقط)، بينما الاشتراك الشهري يمنحك 30 يوماً بـ 900 دج."
                    : "Le Pass Saison vous accompagne jusqu'au jour de l'examen du BAC pour 4 900 DA, tandis que le Pass Mensuel est à 900 DA pour 30 jours."}
                </p>
              </Card>
            </div>
          </div>
        </Container>
      </div>
    </AppShell>
  );
}
