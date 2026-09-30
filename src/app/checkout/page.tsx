"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth/context";
import { useTranslation } from "@/lib/i18n/context";
import { StudentService } from "@/lib/services";
import { ALGERIAN_WILAYAS } from "@/domain/administrative/algeria-administrative";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  FileText,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CreditCard,
  ShieldCheck,
  RefreshCw,
  Gift,
} from "lucide-react";

interface PlanItem {
  id: string;
  name: string;
  price_dzd: number;
  duration_months: number;
  active: boolean;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get("plan") || "season";
  const { user } = useAuth();
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const NextArrow = isAr ? ArrowLeft : ArrowRight;

  // Plan Selection & Server-Fetched Plans
  const [selectedPlanId, setSelectedPlanId] = useState<string>(initialPlan);
  const [plans, setPlans] = useState<PlanItem[]>([
    {
      id: "season",
      name: "اشتراك الموسم الدراسي الكامل (BAC 2027)",
      price_dzd: 4900,
      duration_months: 10,
      active: true,
    },
    {
      id: "monthly",
      name: "الاشتراك الشهري (30 يوماً)",
      price_dzd: 900,
      duration_months: 1,
      active: true,
    },
  ]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  // Form Fields (Data Minimization: ONLY 6 essential shipping fields)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [commune, setCommune] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // UI / Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);

  // Post-Confirmation State
  const [confirmedOrder, setConfirmedOrder] = useState<{
    order_number: string;
    plan_name: string;
    duration_months: number;
    amount: number;
    shipping_fee: number;
    total: number;
    wilaya: string;
    commune: string;
  } | null>(null);

  // Load plans from server API (authoritative pricing)
  useEffect(() => {
    async function fetchPlans() {
      setLoadingPlans(true);
      try {
        const res = await fetch("/api/subscriptions/plans");
        if (res.ok) {
          const data = await res.json();
          if (data.plans && Array.isArray(data.plans) && data.plans.length > 0) {
            setPlans(data.plans);
          }
        }
      } catch (err) {
        console.warn("Using default plans cache:", err);
      } finally {
        setLoadingPlans(false);
      }
    }
    fetchPlans();
  }, []);

  // Pre-fill student profile info if logged in
  useEffect(() => {
    async function loadUserProfile() {
      if (!user?.id) return;
      try {
        const prof = await StudentService.getProfile(user.id);
        if (prof) {
          const name = `${prof.firstName || ""} ${prof.lastName || ""}`.trim() || prof.fullName || "";
          if (name && !fullName) setFullName(name);
          const studentPhone = prof.studentPhone || (prof as any)?.student_phone || "";
          if (studentPhone && !phone) setPhone(studentPhone);
          const wilayaName = prof.wilayaName || (prof as any)?.wilaya_name || "";
          if (wilayaName && !wilaya) setWilaya(wilayaName);
          const communeName = (prof as any)?.communeName || (prof as any)?.commune_name || "";
          if (communeName && !commune) setCommune(communeName);
        }
      } catch (err) {
        console.warn("Could not prefill checkout profile:", err);
      }
    }
    loadUserProfile();
  }, [user]);

  // Selected Plan Object (Server Authoritative)
  const currentPlan = useMemo(() => {
    return plans.find((p) => p.id === selectedPlanId) || plans[0];
  }, [plans, selectedPlanId]);

  const shippingFeeDzd = 0; // Free delivery for physical VIP kit
  const totalAmountDzd = currentPlan.price_dzd + shippingFeeDzd;

  // Handle Form Submission
  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validation
    if (!fullName.trim() || !phone.trim() || !wilaya.trim() || !commune.trim() || !address.trim()) {
      setErrorMessage("يرجى ملء جميع الحقول الإلزامية: الاسم الكامل، رقم الهاتف، الولاية، البلدية، والعنوان.");
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, "");
    if (!/^(05|06|07|02)\d{8}$/.test(cleanPhone)) {
      setErrorMessage("يرجى إدخال رقم هاتف جزائري صالح مكون من 10 أرقام (05 / 06 / 07 / 02).");
      return;
    }

    setIsSubmitting(true);

    try {
      // Send ONLY plan_id and shipping info. The server calculates price & duration!
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: currentPlan.id,
          full_name: fullName.trim(),
          phone: cleanPhone,
          wilaya: wilaya.trim(),
          commune: commune.trim(),
          address: address.trim(),
          delivery_notes: deliveryNotes.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "تعذر تسجيل الطلب، يرجى المحاولة لاحقاً.");
      }

      setConfirmedOrder({
        order_number: data.order?.order_number || "SH-2026-000184",
        plan_name: data.order?.plan_name || currentPlan.name,
        duration_months: data.order?.duration_months || currentPlan.duration_months,
        amount: data.order?.amount || currentPlan.price_dzd,
        shipping_fee: data.order?.shipping_fee || 0,
        total: data.order?.total || totalAmountDzd,
        wilaya: wilaya.trim(),
        commune: commune.trim(),
      });

      // Scroll to top to view confirmation
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMessage(err.message || "حدث خطأ غير متوقع أثناء معالجة الطلب.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOrderNumber = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedOrderNumber(true);
      setTimeout(() => setCopiedOrderNumber(false), 2500);
    }
  };

  return (
    <AppShell activeNav="subscribe">
      <Container size="lg" className="py-8 sm:py-12" dir="rtl">
        {/* ================================================================= */}
        {/* VIEW A: ORDER CONFIRMATION SCREEN (تم تسجيل طلبك)                   */}
        {/* ================================================================= */}
        {confirmedOrder ? (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Success Hero Card */}
            <Card className="p-6 sm:p-10 rounded-3xl bg-[#0D182E] border-2 border-emerald-500/40 text-center space-y-6 shadow-2xl text-white">
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <Badge variant="success" size="sm" className="px-3 py-1 font-bold text-xs bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
                  تم الاستلام بنجاح ✓
                </Badge>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  تم تسجيل طلبك
                </h1>
                <p className="text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                  شكراً لثقتك في منصة شاطر. طلبك قيد المتابعة وسيتم تجهيز علبتك المادية المخصصة للبكالوريا.
                </p>
              </div>

              {/* Order Number Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#091122] border border-slate-700/80 space-y-2 max-w-md mx-auto">
                <span className="text-xs text-slate-400 font-mono block">
                  رقم الطلب المرجعي:
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-wider">
                    {confirmedOrder.order_number}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyOrderNumber(confirmedOrder.order_number)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shadow-sm"
                    title="نسخ رقم الطلب"
                  >
                    {copiedOrderNumber ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mandatory Clarification Box */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-200 text-sm font-bold flex items-center justify-center gap-3">
                <Truck className="w-6 h-6 text-amber-400 shrink-0" />
                <span className="text-sm sm:text-base leading-snug">
                  "سيتم إرسال طلبك عبر شركة التوصيل، والدفع يكون عند الاستلام."
                </span>
              </div>

              {/* Order Summary Details */}
              <div className="pt-4 border-t border-slate-800 text-xs space-y-2.5 text-right font-medium">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">الخطة المطلوبة:</span>
                  <span className="text-white font-bold">{confirmedOrder.plan_name}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">مدة الاشتراك:</span>
                  <span className="text-white font-bold">{confirmedOrder.duration_months} أشهر (حتى البكالوريا)</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">وجهة التوصيل:</span>
                  <span className="text-white font-bold">{confirmedOrder.wilaya} • {confirmedOrder.commune}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">مصاريف الشحن:</span>
                  <span className="text-emerald-400 font-bold">مجاناً (0 دج)</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-sm font-bold">
                  <span className="text-slate-200">المبلغ المستحق عند الاستلام:</span>
                  <span className="text-amber-300 text-lg font-black font-mono">
                    {confirmedOrder.total.toLocaleString()} دج
                  </span>
                </div>
              </div>

              {/* Next Steps Timeline */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-right space-y-3">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>ماذا يحدث الآن؟</span>
                </h4>
                <ol className="text-[11px] text-slate-400 space-y-2 pr-4 list-decimal">
                  <li>
                    <strong className="text-white">تأكيد الطلب:</strong> سيتصل بك فريق العمل أو يتواصل معك عبر الواتساب لتأكيد العنوان وموعد التوصيل.
                  </li>
                  <li>
                    <strong className="text-white">تجهيز العلبة المادية (Physical Kit):</strong> يتم تخصيص بطاقتك الذكية، الملصقات، وخارطة طريق البكالوريا.
                  </li>
                  <li>
                    <strong className="text-white">التسليم والدفع:</strong> يستلم الموزع المبلغ كاش عند باب منزلك، ويسلمك الطرد.
                  </li>
                  <li>
                    <strong className="text-white">تفعيل الاشتراك:</strong> تفعّل الإدارة اشتراكك الرقمي فورياً، وتستمتع بجميع ميزات شاطر!
                  </li>
                </ol>
              </div>

              {/* Navigation Back */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href={`/orders/track/${encodeURIComponent(confirmedOrder.order_number)}`} className="w-full sm:w-auto">
                  <Button variant="primary" size="md" className="w-full sm:w-auto font-black rounded-xl px-8 shadow-clay flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>تتبع مسار طلبك الآن (Timeline)</span>
                  </Button>
                </Link>
                <Link href="/dashboard/orders" className="w-full sm:w-auto">
                  <Button variant="outline" size="md" className="w-full sm:w-auto font-bold rounded-xl px-6 border-slate-700 text-slate-300 hover:text-white">
                    <span>قائمة طلباتي</span>
                  </Button>
                </Link>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="outline" size="md" className="w-full sm:w-auto font-bold rounded-xl px-6 border-slate-700 text-slate-300 hover:text-white">
                    <span>العودة للمنصة</span>
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        ) : (
          /* ================================================================= */
          /* VIEW B: CHECKOUT FORM (نموذج إتمام الطلب)                           */
          /* ================================================================= */
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                <Truck className="w-4 h-4" />
                <span>طلب باقة شاطر المادية • الدفع عند الاستلام (COD)</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-theme-text">
                إتمام الطلب والتوصيل
              </h1>
              <p className="text-xs sm:text-sm text-theme-muted">
                احصل على علبة شاطر المادية وبطاقة الاشتراك حتى باب منزلك، وادفع نقداً عند استلام الطرد.
              </p>
            </div>

            <form onSubmit={handleConfirmOrder}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* ------------------------------------------------------------- */}
                {/* LEFT/MAIN: SHIPPING FORM (7 COLS)                             */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-6">
                  {/* Step 1: Plan Picker */}
                  <Card className="p-5 sm:p-6 rounded-3xl border border-theme bg-card shadow-clay space-y-4">
                    <div className="flex items-center justify-between border-b border-theme pb-3">
                      <h2 className="text-sm sm:text-base font-bold text-theme-text flex items-center gap-2">
                        <Package className="w-4 h-4 text-[var(--color-primary)]" />
                        <span>1. اختيار باقة الاشتراك</span>
                      </h2>
                      <Badge variant="outline" size="sm" className="text-[10px] font-mono">
                        {plans.length} باقات متاحة
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {plans.map((p) => {
                        const isSelected = selectedPlanId === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPlanId(p.id)}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-2 relative ${
                              isSelected
                                ? "bg-[var(--color-primary-soft)] border-[var(--color-primary)] shadow-sm"
                                : "bg-card-muted/50 border-theme hover:border-[var(--color-primary)]/40"
                            }`}
                          >
                            {p.id === "season" && (
                              <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full bg-amber-500 text-slate-900 text-[10px] font-black shadow-xs">
                                الأكثر طلباً ⭐
                              </span>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-theme-text">{p.name}</span>
                              <div
                                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  isSelected
                                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                                    : "border-slate-400"
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </div>

                            <div className="flex items-baseline gap-1 font-mono">
                              <span className="text-xl font-black text-theme-text">
                                {p.price_dzd.toLocaleString()}
                              </span>
                              <span className="text-xs text-theme-muted">دج</span>
                            </div>

                            <p className="text-[11px] text-theme-muted">
                              {p.duration_months === 10
                                ? "صالحة لمدة 10 أشهر حتى يوم امتحان البكالوريا."
                                : "صالحة لمدة 30 يوماً من تاريخ التفعيل."}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Step 2: Shipping Information (ONLY 6 REQUIRED FIELDS) */}
                  <Card className="p-5 sm:p-6 rounded-3xl border border-theme bg-card shadow-clay space-y-5">
                    <div className="flex items-center justify-between border-b border-theme pb-3">
                      <h2 className="text-sm sm:text-base font-bold text-theme-text flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>2. معلومات التوصيل والاستلام</span>
                      </h2>
                      <span className="text-[11px] text-theme-muted">
                        بيانات المستلم لشركة التوصيل
                      </span>
                    </div>

                    {errorMessage && (
                      <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div className="space-y-4">
                      {/* Field 1: Full Name */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-theme-text flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>الاسم الكامل للتلميذ أو المستلم:</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="مثال: يوسف بن مهيدي"
                          className="w-full bg-card-muted border border-theme text-theme-text text-xs sm:text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                        />
                      </div>

                      {/* Field 2: Phone */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-theme-text flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>رقم الهاتف (للاتصال والتسليم):</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          dir="ltr"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="05 / 06 / 07 / 02 XX XX XX XX"
                          className="w-full bg-card-muted border border-theme text-theme-text text-xs sm:text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--color-primary)] transition-colors font-mono"
                        />
                        <span className="text-[10px] text-theme-muted block">
                          سيتصل بك الموزع على هذا الرقم لتسليم الطرد.
                        </span>
                      </div>

                      {/* Fields 3 & 4: Wilaya and Commune */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Wilaya */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-theme-text flex items-center gap-1">
                            <span>الولاية:</span>
                            <span className="text-rose-500">*</span>
                          </label>
                          <select
                            required
                            value={wilaya}
                            onChange={(e) => setWilaya(e.target.value)}
                            className="w-full bg-card-muted border border-theme text-theme-text text-xs sm:text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                          >
                            <option value="">اختر الولاية...</option>
                            {ALGERIAN_WILAYAS.map((w) => (
                              <option key={w.code} value={w.name_ar}>
                                {w.code} - {w.name_ar} ({w.name_fr})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Commune */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-theme-text flex items-center gap-1">
                            <span>البلدية:</span>
                            <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={commune}
                            onChange={(e) => setCommune(e.target.value)}
                            placeholder="مثال: القبة، سيدي بلعباس..."
                            className="w-full bg-card-muted border border-theme text-theme-text text-xs sm:text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                          />
                        </div>
                      </div>

                      {/* Field 5: Street Address */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-theme-text flex items-center gap-1">
                          <span>العنوان بالتفصيل (أو مكتب التوصيل Stop-Desk):</span>
                          <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="مثال: حي 500 مسكن، عمارة ب، أو مكتب ياليدين المركزي"
                          className="w-full bg-card-muted border border-theme text-theme-text text-xs sm:text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                        />
                      </div>

                      {/* Field 6: Delivery Notes */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-theme-text flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-400" />
                          <span>ملاحظات إضافية للتوصيل (اختياري):</span>
                        </label>
                        <input
                          type="text"
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                          placeholder="مثال: الاتصال بعد الظهر، التوصيل للمنزل أو المكتب"
                          className="w-full bg-card-muted border border-theme text-theme-text text-xs sm:text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                        />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* RIGHT: ORDER SUMMARY & PAYMENT METHOD (5 COLS)                */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-6">
                  {/* Summary Card */}
                  <Card className="p-5 sm:p-6 rounded-3xl border-2 border-[var(--color-primary)]/30 bg-card shadow-clay space-y-4">
                    <h3 className="text-sm font-bold text-theme-text border-b border-theme pb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>ملخص الفاتورة</span>
                    </h3>

                    {/* Breakdown */}
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center text-theme-secondary">
                        <span>الخطة:</span>
                        <span className="font-bold text-theme-text">{currentPlan.name}</span>
                      </div>

                      <div className="flex justify-between items-center text-theme-secondary">
                        <span>مدة الاشتراك:</span>
                        <span className="font-mono font-bold text-theme-text">
                          {currentPlan.duration_months} أشهر
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-theme-secondary">
                        <span>سعر الباقة:</span>
                        <span className="font-mono font-bold text-theme-text">
                          {currentPlan.price_dzd.toLocaleString()} دج
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-theme-secondary">
                        <span>مصاريف التوصيل:</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <Gift className="w-3.5 h-3.5" />
                          <span>مجاناً (0 دج)</span>
                        </span>
                      </div>

                      {/* Total */}
                      <div className="pt-3 border-t border-theme flex justify-between items-baseline">
                        <span className="text-sm font-black text-theme-text">المجموع الإجمالي:</span>
                        <div className="text-left font-mono">
                          <span className="text-2xl font-black text-[var(--color-primary)]">
                            {totalAmountDzd.toLocaleString()}
                          </span>
                          <span className="text-xs text-theme-muted mr-1 font-sans">دج</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method Badge */}
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                        <Truck className="w-4 h-4" />
                        <span>طريقة الدفع: الدفع عند الاستلام</span>
                      </div>
                      <p className="text-[11px] text-theme-muted leading-relaxed">
                        لا تدفع أي دينار الآن. الموزع يأتيك بالطرد وتدفع نقداً بعد المعاينة عند باب بيتك.
                      </p>
                    </div>

                    {/* Physical Kit Guarantee */}
                    <div className="p-3 rounded-2xl bg-card-muted/70 border border-theme text-[11px] text-theme-muted space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-theme-text">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>محتويات العلبة المادية:</span>
                      </div>
                      <p>
                        بطاقة شاطر الذكية VIP + خارطة طريق البكالوريا + ملصقات شاطر الرسمية.
                      </p>
                    </div>

                    {/* Confirm Button */}
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={isSubmitting}
                      className="w-full font-black text-sm rounded-2xl py-4 shadow-clay flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>جاري تسجيل الطلب...</span>
                        </>
                      ) : (
                        <>
                          <span>تأكيد الطلب والدفع عند الاستلام</span>
                          <NextArrow className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </Card>
                </div>
              </div>
            </form>
          </div>
        )}
      </Container>
    </AppShell>
  );
}
