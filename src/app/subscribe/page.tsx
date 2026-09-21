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
  ExternalLink,
  MessageCircle,
  Headphones,
  RefreshCw,
  UploadCloud,
  FileCheck,
  AlertCircle,
  AlertTriangle,
  ShieldCheck,
  Phone,
  User,
  MapPin,
  CheckCheck,
  HelpCircle,
  Truck,
  CreditCard,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function SubscribePage() {
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [masteryCount, setMasteryCount] = useState(0);
  const [completedMissionsCount, setCompletedMissionsCount] = useState(0);

  // Selected plan: "season" (featured) or "monthly"
  const [selectedPlanId, setSelectedPlanId] = useState<"season" | "monthly">("season");

  // Payment mode: "ONLINE" (BaridiMob/CCP) or "COD" (Cash on Delivery)
  const [paymentMode, setPaymentMode] = useState<"ONLINE" | "COD">("ONLINE");

  // Cash on Delivery (COD) auto-filled inputs
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingParentPhone, setShippingParentPhone] = useState("");
  const [shippingWilaya, setShippingWilaya] = useState("");
  const [shippingCommune, setShippingCommune] = useState("");
  const [isSubmittingCod, setIsSubmittingCod] = useState(false);
  const [codError, setCodError] = useState<string | null>(null);
  const [codResult, setCodResult] = useState<{
    orderId: string;
    trackingNumber?: string;
    message: string;
  } | null>(null);

  // Voucher / Friend code redemption state
  const [voucherCodeInput, setVoucherCodeInput] = useState("");
  const [isRedeemingVoucher, setIsRedeemingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherSuccess, setVoucherSuccess] = useState<string | null>(null);

  // Receipt file upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // FAQ interactive accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Post-submission success state
  const [orderResult, setOrderResult] = useState<{
    orderId: string;
    referenceId: string;
    receiptPath: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Official coordinates
  const ACTIVATION_WHATSAPP_NUMBER = "213550303286";
  const SUPPORT_WHATSAPP_NUMBER = "213550853234";
  const BARIDIMOB_RIP = "00799999004125624964";
  const CCP_ACCOUNT = "0041256249";
  const CCP_KEY = "64";

  const selectedPlanPrice = selectedPlanId === "season" ? 4900 : 900;
  const selectedPlanName =
    selectedPlanId === "season"
      ? (isAr ? "موسم البكالوريا الكامل 2027" : "Pass Saison Complète BAC 2027")
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
          const fullName = `${prof.firstName || ""} ${prof.lastName || ""}`.trim() || prof.fullName || "";
          if (fullName) {
            setShippingName(fullName);
          }
          const phone = prof.studentPhone || (prof as any).student_phone || "";
          if (phone) {
            setShippingPhone(phone);
          }
          const parentPhone = (prof as any).parentPhone || (prof as any).parent_phone || "";
          if (parentPhone) {
            setShippingParentPhone(parentPhone);
          }
          const wilaya = prof.wilayaName || (prof as any).wilaya_name || (prof as any).wilaya || "";
          if (wilaya) {
            setShippingWilaya(wilaya);
          }
          const commune = (prof as any).communeName || (prof as any).commune_name || (prof as any).commune || "";
          if (commune) {
            setShippingCommune(commune);
          }
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

  // Submit Receipt without redundant manual identity inputs (auto-attached from profile)
  const handleSubmitReceipt = async () => {
    if (!receiptFile) {
      setReceiptError(isAr ? "يرجى اختيار صورة وصل الدفع أولاً" : "Veuillez joindre le reçu de paiement");
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

      const effectiveName =
        `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
        profile?.fullName ||
        shippingName ||
        "طالب مسجل";
      const effectivePhone = profile?.studentPhone || (profile as any)?.student_phone || shippingPhone || "";
      const effectiveWilaya = profile?.wilayaName || (profile as any)?.wilaya_name || shippingWilaya || "";

      const formData = new FormData();
      formData.append("referenceId", referenceId);
      formData.append("userId", effectiveUserId);
      formData.append("plan", selectedPlanId);
      formData.append("file", receiptFile);
      if (receiptDataUrl) {
        formData.append("fileBase64", receiptDataUrl.split(",")[1] || "");
      }
      formData.append("studentEmail", user?.email || profile?.email || "");
      formData.append("studentName", effectiveName);
      if (effectivePhone) formData.append("studentPhone", effectivePhone);
      if (effectiveWilaya) formData.append("wilayaName", effectiveWilaya);
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
          : "Erreur lors de l'envoi du reçu."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Cash on Delivery (COD) order
  const handleSubmitCod = async () => {
    setCodError(null);
    if (!shippingName.trim() || !shippingPhone.trim() || !shippingWilaya.trim()) {
      setCodError(isAr ? "يرجى التأكد من الاسم، رقم الهاتف، والولاية" : "Veuillez renseigner votre nom, téléphone et wilaya");
      return;
    }

    const cleanPhone = shippingPhone.replace(/\s+/g, "");
    if (!/^(05|06|07|02)\d{8}$/.test(cleanPhone)) {
      setCodError(isAr ? "يرجى إدخال رقم هاتف جزائري صالح (05 / 06 / 07)" : "Numéro de téléphone invalide");
      return;
    }

    setIsSubmittingCod(true);
    try {
      const effectiveUserId =
        user?.id ||
        profile?.id ||
        (typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("bac_auth_user") || "{}")?.id
          : undefined) ||
        `guest_${cleanPhone}`;

      const res = await fetch("/api/orders/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: effectiveUserId,
          plan: selectedPlanId,
          shippingName: shippingName.trim(),
          shippingPhone: cleanPhone,
          parentPhone: shippingParentPhone.trim() || undefined,
          shippingWilaya: shippingWilaya.trim(),
          shippingCommune: shippingCommune.trim(),
          studentEmail: user?.email || profile?.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error || "فشل تسجيل طلب التوصيل");
      }

      setCodResult({
        orderId: data.order?.id || "COD-ORDER",
        trackingNumber: data.order?.trackingNumber,
        message: data.message,
      });

      trackEvent("cod_order_placed", {
        userId: effectiveUserId,
        plan: selectedPlanId,
        wilaya: shippingWilaya,
      });
    } catch (err: any) {
      setCodError(err?.message || "حدث خطأ أثناء تسجيل طلب التوصيل");
    } finally {
      setIsSubmittingCod(false);
    }
  };

  // Redeem code (voucher or referral)
  const handleRedeemCode = async () => {
    setVoucherError(null);
    setVoucherSuccess(null);

    const code = voucherCodeInput.trim();
    if (!code) {
      setVoucherError(isAr ? "يرجى إدخال الكود" : "Veuillez entrer le code");
      return;
    }

    setIsRedeemingVoucher(true);
    try {
      const effectiveUserId =
        user?.id ||
        profile?.id ||
        (typeof window !== "undefined"
          ? JSON.parse(localStorage.getItem("bac_auth_user") || "{}")?.id
          : undefined);

      if (!effectiveUserId) {
        setVoucherError(isAr ? "يجب تسجيل الدخول أولاً" : "Veuillez vous connecter");
        return;
      }

      // If it looks like a physical voucher code SHATER-XXXX-XXXX
      if (code.toUpperCase().startsWith("SHATER-")) {
        const res = await fetch("/api/vouchers/redeem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: effectiveUserId,
            voucherCode: code.toUpperCase(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data?.error || "رمز البطاقة غير صالح");
        }

        setVoucherSuccess(data.message || (isAr ? "تم تفعيل اشتراكك بنجاح! مبروك." : "Abonnement activé avec succès !"));
        trackEvent("voucher_redeemed", { userId: effectiveUserId, code });

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        // Referral signup code
        const res = await fetch("/api/referral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referredUserId: effectiveUserId,
            referralCode: code.toUpperCase(),
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data?.error || "رمز غير صالح أو تم استخدامه مسبقاً");
        }

        setVoucherSuccess(isAr ? "تم ربط كود صديقك بنجاح! سيستفيد من المكافأة عند اشتراكك." : "Code parrain enregistré avec succès !");
      }
    } catch (err: any) {
      setVoucherError(err?.message || "فشل التحقق من الكود");
    } finally {
      setIsRedeemingVoucher(false);
    }
  };

  const access = getStudentAccess(profile);
  const isExpired = access.status === "TRIAL_EXPIRED";

  // WhatsApp activation message
  const activationWhatsAppMessage = `مرحباً، قمت بتسديد اشتراك منصة الشاطر.\n\n📌 رقم الطلب: ${orderResult?.referenceId || "جديد"}\n🎓 نوع الاشتراك: ${selectedPlanName} (${selectedPlanPrice.toLocaleString()} دج)\n👤 اسم الطالب: ${shippingName || profile?.fullName || user?.email || "طالب مسجل"}\n📱 رقم الهاتف: ${shippingPhone || profile?.studentPhone || "غير مسجل"}\n\nمرفق صورة الوصل للتفعيل الفوري.`;
  const activationWhatsAppUrl = `https://wa.me/${ACTIVATION_WHATSAPP_NUMBER}?text=${encodeURIComponent(activationWhatsAppMessage)}`;
  const supportWhatsAppUrl = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    "مرحباً، أحتاج مساعدة بخصوص الاشتراك في منصة الشاطر."
  )}`;

  // FAQ list for accordion
  const faqs = [
    {
      q: isAr ? "متى يتم تفعيل حسابي بعد إرسال الوصل؟" : "Quand mon compte sera-t-il activé ?",
      a: isAr
        ? "يتم التحقق من الوصل فور وصوله، ويتم التفعيل في مدة تتراوح بين 5 إلى 30 دقيقة كحد أقصى. بمجرد الضغط على زر الواتساب بعد إرسال الوصل، يتلقى المشرف إشعارك مباشرة لتسريع التفعيل."
        : "L'activation s'effectue généralement dans un délai de 5 à 30 minutes après vérification du reçu.",
    },
    {
      q: isAr ? "هل تضيع بياناتي واختباراتي السابقة؟" : "Mes données précédentes sont-elles conservées ?",
      a: isAr
        ? "لا إطلاقاً، جميع نتائجك، مهاراتك المثبتة، تقرير معمل الأخطاء، ونقاط قوتك وضعفك محفوظة 100% في قاعدة البيانات، وتواصل المذاكرة من نفس النقطة التي توقفت عندها."
        : "Toutes vos données, diagnostics et maîtrises validées sont intégralement conservées.",
    },
    {
      q: isAr ? "هل يمكنني الدفع نقداً بدون تطبيق بريدي موب؟" : "Puis-je payer sans BaridiMob ?",
      a: isAr
        ? "نعم بكل سهولة! يمكنك اختيار «الدفع عند التوصيل» وتصلك البطاقة حتى باب منزلك وتدفع نقداً يداً بيد، أو التوجه لأي مكتب بريد جزائري (CCP) وتحويل المبلغ للحساب المذكور أعلاه."
        : "Oui, vous pouvez choisir le paiement à la livraison en espèces ou effectuer un virement dans un bureau de poste.",
    },
    {
      q: isAr ? "ما الفرق بين اشتراك الموسم والاشتراك الشهري؟" : "Quelle est la différence entre le pass saison et mensuel ?",
      a: isAr
        ? "اشتراك الموسم يمنحك وصولاً شاملاً لكل المنصة طوال السنة حتى يوم امتحان البكالوريا في جوان 2027 بسعر 4,900 دج (ما يعادل 490 دج شهرياً فقط)، بينما الاشتراك الشهري يمنحك 30 يوماً بـ 900 دج."
        : "Le Pass Saison vous accompagne jusqu'au jour de l'examen du BAC pour 4 900 DA, tandis que le Pass Mensuel est à 900 DA pour 30 jours.",
    },
  ];

  return (
    <AppShell activeNav="home">
      <div className="min-h-screen py-6 sm:py-10 bg-theme-base">
        <Container size="md" className="space-y-6 sm:space-y-8 max-w-3xl mx-auto px-4 sm:px-6">
          {/* Active Subscription Banner if Already Paid */}
          {access.status === "PAID_ACTIVE" && (
            <div className="p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2 shadow-sm">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-theme-text">
                {isAr ? "أنت مشترك رسمي في منصة الشاطر!" : "Vous êtes abonné à SHATER BAC !"}
              </h2>
              <p className="text-xs text-theme-secondary max-w-md mx-auto">
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
                className="inline-flex items-center justify-center px-6 py-2 rounded-xl font-bold text-xs bg-[var(--color-primary)] text-white shadow-md hover:opacity-95 transition-all"
              >
                <span>{isAr ? "الانتقال إلى لوحة المذاكرة" : "Tableau de bord"}</span>
              </Link>
            </div>
          )}

          {/* Rejected Receipt Banner */}
          {(profile as any)?.access_status === "REJECTED" && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center space-y-1.5 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-xs sm:text-sm text-rose-900 dark:text-rose-100">
                {isAr ? "تم رفض وصل الدفع السابق" : "Reçu précédent non validé"}
              </h3>
              <p className="text-xs text-rose-700 dark:text-rose-300">
                {isAr
                  ? `السبب: ${(profile as any)?.rejection_reason || "الوصل غير واضح"}. يرجى إعادة رفع صورة واضحة للوصل.`
                  : "Veuillez soumettre à nouveau un reçu lisible."}
              </p>
            </div>
          )}

          {/* Clean Title */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-theme-text tracking-tight">
              {isExpired
                ? isAr
                  ? "انتهت فترة التجربة.. واصل رحلتك نحو التفوق"
                  : "Votre essai gratuit est terminé"
                : isAr
                ? "اختر باقتك وفعّل حسابك في الشاطر"
                : "Abonnez-vous à SHATER BAC"}
            </h1>
            <p className="text-xs sm:text-sm text-theme-secondary max-w-xl mx-auto">
              {isAr
                ? "الباقة تفتح لك كامل الموقع والمواد بدون استثناء. كل تقدمك ونتائجك السابقة محفوظة 100%."
                : "Accès illimité à toutes les matières et à l'Error Lab jusqu'au BAC."}
            </p>
          </div>

          {/* 1. PLANS SELECTION: Price & Simple Explanation Only */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Plan 1: Season Pass (Featured) */}
            <div
              onClick={() => setSelectedPlanId("season")}
              className={`relative p-5 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedPlanId === "season"
                  ? "border-[var(--color-primary)] bg-card shadow-md ring-2 ring-[var(--color-primary)]/20"
                  : "border-theme bg-surface/70 hover:border-[var(--color-primary)]/40 hover:bg-card"
              }`}
            >
              <div className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-extrabold shadow-sm">
                <span>الأكثر طلباً ⭐</span>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-theme-text">
                      {isAr ? "موسم البكالوريا 2027 الكامل" : "Pass Saison BAC 2027"}
                    </h3>
                    <span className="text-[11px] text-theme-muted">
                      {isAr ? "حتى آخر يوم في البكالوريا (جوان 2027)" : "Jusqu'au BAC 2027"}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedPlanId === "season"
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-theme bg-surface"
                    }`}
                  >
                    {selectedPlanId === "season" && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-theme-text font-mono">
                    4,900
                  </span>
                  <span className="text-xs font-bold text-theme-secondary">دج / الموسم كاملاً</span>
                </div>

                <p className="text-xs text-theme-secondary leading-relaxed pt-1 border-t border-theme/60">
                  {isAr
                    ? "فتح كامل وشامل لكل المنصة وجميع المواد ومعمل الأخطاء وبنك المواضيع حتى يوم البكالوريا."
                    : "Accès complet à toutes les fonctionnalités et matières jusqu'au BAC."}
                </p>
              </div>
            </div>

            {/* Plan 2: Monthly Pass */}
            <div
              onClick={() => setSelectedPlanId("monthly")}
              className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedPlanId === "monthly"
                  ? "border-[var(--color-primary)] bg-card shadow-md ring-2 ring-[var(--color-primary)]/20"
                  : "border-theme bg-surface/70 hover:border-[var(--color-primary)]/40 hover:bg-card"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-theme-text">
                      {isAr ? "الاشتراك الشهري" : "Abonnement Mensuel"}
                    </h3>
                    <span className="text-[11px] text-theme-muted">
                      {isAr ? "صلاحية 30 يوماً قابلة للتجديد" : "30 jours renouvelables"}
                    </span>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      selectedPlanId === "monthly"
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-theme bg-surface"
                    }`}
                  >
                    {selectedPlanId === "monthly" && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-black text-theme-text font-mono">
                    900
                  </span>
                  <span className="text-xs font-bold text-theme-secondary">دج / شهرياً</span>
                </div>

                <p className="text-xs text-theme-secondary leading-relaxed pt-1 border-t border-theme/60">
                  {isAr
                    ? "فتح كامل وشامل لجميع المواد وميزات المنصة لمدة 30 يوماً كاملة قابلة للتجديد."
                    : "Accès complet à toute la plateforme pendant 30 jours."}
                </p>
              </div>
            </div>
          </div>

          {/* 2. عندك صاحبك شاطر؟ / بطاقة التفعيل المتميزة */}
          <Card className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-500/10 via-[var(--color-primary-soft)]/20 to-indigo-500/10 border-2 border-purple-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/20 text-purple-600 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xs sm:text-sm text-theme-text flex items-center gap-2">
                    <span>{isAr ? "عندك صاحبك شاطر؟ 🤝" : "Parrainage ou carte d'activation"}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 font-bold">
                      {isAr ? "اربح تخفيض 10%" : "-10%"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-theme-muted">
                    {isAr
                      ? "أدخل كود تفعيل البطاقة أو كود الإحالة من زميلك للاستفادة من تخفيض 10% وتفعيل حسابك فوراً"
                      : "Entrez un code de parrainage pour bénéficier de 10% de réduction"}
                  </p>
                </div>
              </div>

              <Link
                href="/referral"
                className="text-xs font-bold text-purple-600 hover:text-purple-700 underline self-start sm:self-auto"
              >
                {isAr ? "برنامج الإحالة (تخفيض 10%) ←" : "Programme parrainage (-10%) →"}
              </Link>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <input
                type="text"
                dir="ltr"
                value={voucherCodeInput}
                onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                placeholder={isAr ? "مثال: SHATER-XXXX-XXXX أو كود زميلك" : "Code parrain ou carte"}
                className="w-full sm:flex-1 px-3.5 py-2.5 rounded-xl bg-card border border-theme text-xs font-mono font-bold text-theme-text uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="button"
                onClick={handleRedeemCode}
                disabled={isRedeemingVoucher || !voucherCodeInput.trim()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
              >
                {isRedeemingVoucher ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{isAr ? "جاري التحقق..." : "Vérification..."}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAr ? "تفعيل الكود" : "Activer"}</span>
                  </>
                )}
              </button>
            </div>

            {voucherError && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{voucherError}</span>
              </div>
            )}

            {voucherSuccess && (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>{voucherSuccess}</span>
              </div>
            )}
          </Card>

          {/* 3. PAYMENT METHOD TABS: Two Side-by-Side Cards */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-theme-text">
              {isAr ? "طريقة الدفع" : "Mode de paiement"}
            </h2>

            <div className="grid grid-cols-2 gap-3">
              {/* Tab 1: Online Payment */}
              <button
                type="button"
                onClick={() => setPaymentMode("ONLINE")}
                className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  paymentMode === "ONLINE"
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]/25 shadow-sm"
                    : "border-theme bg-surface hover:bg-card"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="font-black text-xs sm:text-sm text-theme-text">
                  {isAr ? "دفع إلكتروني" : "Paiement en ligne"}
                </span>
              </button>

              {/* Tab 2: Cash on Delivery */}
              <button
                type="button"
                onClick={() => setPaymentMode("COD")}
                className={`p-3.5 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                  paymentMode === "COD"
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-soft)]/25 shadow-sm"
                    : "border-theme bg-surface hover:bg-card"
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <span className="font-black text-xs sm:text-sm text-theme-text">
                  {isAr ? "دفع عند الاستلام" : "Paiement à la livraison"}
                </span>
              </button>
            </div>
          </div>

          {/* 4. CONDITIONAL VIEW: ONLINE OR COD */}
          {paymentMode === "ONLINE" ? (
            <div className="space-y-4">
              {/* Online Coordinates Card: Clean RIP & CCP with Copy */}
              <Card className="p-5 bg-card border-theme rounded-3xl space-y-4 shadow-sm">
                {/* RIP Box */}
                <div className="p-3.5 rounded-2xl bg-surface border border-theme flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-theme-muted font-mono uppercase block">
                      {isAr ? "رقم الـ RIP:" : "Numéro RIP :"}
                    </span>
                    <span
                      dir="ltr"
                      className="font-mono font-bold text-theme-text text-sm sm:text-base select-all inline-block text-left"
                      style={{ unicodeBidi: "isolate" }}
                    >
                      {BARIDIMOB_RIP}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(BARIDIMOB_RIP, "rip")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-primary-soft)] hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedField === "rip" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">{isAr ? "تم النسخ" : "Copié"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isAr ? "نسخ" : "Copier"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* CCP Box */}
                <div className="p-3.5 rounded-2xl bg-surface border border-theme flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-theme-muted font-mono uppercase block">
                      {isAr ? "رقم الحساب:" : "Numéro de compte :"}
                    </span>
                    <div
                      dir="ltr"
                      className="flex items-center gap-2 font-mono font-bold text-theme-text text-sm sm:text-base text-left"
                      style={{ unicodeBidi: "isolate" }}
                    >
                      <span>{CCP_ACCOUNT}</span>
                      <span className="text-theme-muted">|</span>
                      <span>{isAr ? `المفتاح: ${CCP_KEY}` : `Clé : ${CCP_KEY}`}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${CCP_ACCOUNT} ${CCP_KEY}`, "ccp")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--color-primary-soft)] hover:bg-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedField === "ccp" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">{isAr ? "تم النسخ" : "Copié"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{isAr ? "نسخ" : "Copier"}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Upload Receipt: Simple Dropzone without format or size limits text */}
                <div className="space-y-3 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {!receiptFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="p-6 border-2 border-dashed border-theme hover:border-[var(--color-primary)] bg-surface/50 hover:bg-surface rounded-2xl text-center cursor-pointer transition-all space-y-2"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center mx-auto">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-theme-text">
                        {isAr ? "اضغط هنا لاختيار صورة وصل الدفع أو اسحب الصورة هنا" : "Cliquez pour choisir le reçu ou glissez-le ici"}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-surface border border-theme space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 truncate">
                          <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span className="text-xs font-bold text-theme-text truncate">
                            {receiptFile.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-xs text-rose-500 hover:text-rose-600 font-semibold px-2 py-1"
                        >
                          {isAr ? "تغيير" : "Changer"}
                        </button>
                      </div>

                      {receiptDataUrl && (
                        <div className="pt-1 text-center">
                          <img
                            src={receiptDataUrl}
                            alt="وصل الدفع"
                            className="max-h-44 mx-auto rounded-xl border border-theme object-contain"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {receiptError && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{receiptError}</span>
                    </div>
                  )}

                  {/* Submit Upload Button */}
                  <button
                    type="button"
                    disabled={!receiptFile || isSubmitting}
                    onClick={handleSubmitReceipt}
                    className="w-full min-h-[50px] rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:opacity-95 text-white shadow-md active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>{isAr ? "جاري إرسال الوصل..." : "Envoi du reçu..."}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isAr ? "تأكيد وإرسال الوصل" : "Confirmer et envoyer le reçu"}</span>
                      </>
                    )}
                  </button>
                </div>
              </Card>

              {/* Success Result View */}
              {orderResult && (
                <Card className="p-5 sm:p-6 bg-card border-2 border-emerald-500/40 rounded-3xl space-y-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-theme-text">
                      {isAr ? "تم استلام وصل الدفع بنجاح!" : "Reçu bien reçu !"}
                    </h3>
                    <p className="text-xs text-theme-secondary max-w-sm mx-auto">
                      {isAr
                        ? "طلبك مسجل في قاعدة العمليات وجاري التحقق الفوري منه وتفعيل حسابك."
                        : "Votre demande est en cours de validation."}
                    </p>
                  </div>

                  <a
                    href={activationWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>{isAr ? "إشعار المشرف عبر واتساب للتفعيل السريع" : "Notifier sur WhatsApp"}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                </Card>
              )}
            </div>
          ) : (
            /* Cash On Delivery Option */
            <div className="space-y-4">
              {codResult ? (
                <Card className="p-6 bg-card border-theme rounded-3xl text-center space-y-4 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-theme-text">
                      {isAr ? "تم تسجيل طلبك بنجاح! 🎉" : "Commande enregistrée avec succès !"}
                    </h3>
                    <p className="text-xs text-theme-muted max-w-sm mx-auto">
                      {isAr
                        ? `سيتم الاتصال بك على الرقم (${shippingPhone}) لتأكيد عنوان التسليم والتوصيل لباب منزلك.`
                        : `Nous vous contacterons au (${shippingPhone}) pour confirmer votre livraison.`}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-bold text-xs bg-[var(--color-primary)] text-white shadow-md"
                  >
                    <span>{isAr ? "العودة إلى لوحة المذاكرة" : "Tableau de bord"}</span>
                  </Link>
                </Card>
              ) : (
                <Card className="p-5 bg-card border-theme rounded-3xl space-y-4 shadow-sm">
                  <div className="border-b border-theme pb-3">
                    <h3 className="text-sm font-bold text-theme-text flex items-center gap-2">
                      <Truck className="w-4 h-4 text-purple-600" />
                      <span>{isAr ? "طلب التوصيل للمنزل والدفع عند الاستلام" : "Livraison à domicile"}</span>
                    </h3>
                    <span className="text-[11px] text-theme-muted">
                      {isAr ? "التوصيل متوفر لكل الـ 58 ولاية. تدفع نقداً عند الاستلام يداً بيد." : "Livraison 58 wilayas"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Auto-filled Name */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-theme-secondary block flex items-center gap-1">
                        <User className="w-3 h-3 text-[var(--color-primary)]" />
                        <span>{isAr ? "الاسم واللقب" : "Nom et prénom"}</span>
                      </label>
                      <input
                        type="text"
                        value={shippingName}
                        onChange={(e) => setShippingName(e.target.value)}
                        placeholder={isAr ? "الاسم واللقب" : "Nom et prénom"}
                        className="w-full px-3 py-2 rounded-xl bg-surface border border-theme text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                    </div>

                    {/* Auto-filled Phone & Optional Parent Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-theme-secondary block flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[var(--color-primary)]" />
                          <span>{isAr ? "رقم الهاتف للتوصيل" : "Téléphone"}</span>
                        </label>
                        <input
                          type="tel"
                          dir="ltr"
                          value={shippingPhone}
                          onChange={(e) => setShippingPhone(e.target.value)}
                          placeholder="05 / 06 / 07..."
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-theme text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-theme-secondary block flex items-center gap-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{isAr ? "رقم ولي الأمر (اختياري)" : "Téléphone du parent (optionnel)"}</span>
                        </label>
                        <input
                          type="tel"
                          dir="ltr"
                          value={shippingParentPhone}
                          onChange={(e) => setShippingParentPhone(e.target.value)}
                          placeholder="05 / 06 / 07..."
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-theme text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] font-mono"
                        />
                      </div>
                    </div>

                    {/* Auto-filled Wilaya & Commune */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-theme-secondary block flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[var(--color-primary)]" />
                          <span>{isAr ? "الولاية" : "Wilaya"}</span>
                        </label>
                        <input
                          type="text"
                          value={shippingWilaya}
                          onChange={(e) => setShippingWilaya(e.target.value)}
                          placeholder={isAr ? "مثال: الجزائر، سطيف، وهران..." : "Wilaya"}
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-theme text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-theme-secondary block">
                          <span>{isAr ? "البلدية" : "Commune"}</span>
                        </label>
                        <input
                          type="text"
                          value={shippingCommune}
                          onChange={(e) => setShippingCommune(e.target.value)}
                          placeholder={isAr ? "مثال: باب الزوار، العلمة..." : "Commune"}
                          className="w-full px-3 py-2 rounded-xl bg-surface border border-theme text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                      </div>
                    </div>

                    {codError && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 text-xs">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{codError}</span>
                      </div>
                    )}

                    {/* Total & Submit */}
                    <div className="pt-2 border-t border-theme space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-theme-text">
                          {isAr ? "المبلغ عند الاستلام:" : "Total à la livraison :"}
                        </span>
                        <span className="font-black font-mono text-base text-theme-text">
                          {selectedPlanPrice.toLocaleString()} دج
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleSubmitCod}
                        disabled={isSubmittingCod}
                        className="w-full min-h-[50px] rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingCod ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                            <span>{isAr ? "جاري تسجيل الطلب..." : "Enregistrement..."}</span>
                          </>
                        ) : (
                          <>
                            <Truck className="w-4 h-4 shrink-0" />
                            <span>
                              {isAr
                                ? `تأكيد طلب التوصيل (${selectedPlanPrice.toLocaleString()} دج عند الاستلام)`
                                : `Confirmer (${selectedPlanPrice.toLocaleString()} DA à la livraison)`}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* 5. INTERACTIVE FAQ ACCORDION: Show question, click to show answer */}
          <div className="space-y-3 pt-2 border-t border-theme">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[var(--color-primary)]" />
              <h3 className="text-sm font-bold text-theme-text">
                {isAr ? "الأسئلة الشائعة" : "Questions Fréquentes"}
              </h3>
            </div>

            <div className="space-y-2">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl bg-card border border-theme overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-3.5 text-start flex items-center justify-between gap-3 font-bold text-xs sm:text-sm text-theme-text hover:bg-surface/50 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] inline-flex items-center justify-center text-[10px] font-mono shrink-0">
                          {idx + 1}
                        </span>
                        <span>{faq.q}</span>
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-theme-muted shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-theme-muted shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-3.5 pt-1 text-xs text-theme-secondary leading-relaxed border-t border-theme/40">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Technical Support Box */}
          <div className="p-4 rounded-2xl bg-surface border border-theme flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-start">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-theme-text">
                  {isAr ? "تحتاج مساعدة بخصوص الدفع؟" : "Besoin d'aide ?"}
                </h4>
                <p className="text-[11px] text-theme-muted">
                  {isAr ? "فريق الدعم متاح للإجابة على تساؤلاتك فورياً" : "Support disponible sur WhatsApp"}
                </p>
              </div>
            </div>

            <a
              href={supportWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold transition-all shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>{isAr ? "تواصل مع الدعم" : "Support WhatsApp"}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          </div>
        </Container>
      </div>
    </AppShell>
  );
}
