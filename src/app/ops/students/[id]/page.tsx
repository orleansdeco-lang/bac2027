"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  GraduationCap,
  Target,
  CreditCard,
  History,
  ShieldCheck,
  Activity,
  Layers,
  Brain,
  FileClock,
  Sparkles,
  Calendar,
  Phone,
  MapPin,
  Flame,
  MessageCircle,
  ExternalLink,
  RefreshCw,
  Eye,
  Copy,
  Check,
  AlertTriangle,
  Truck,
  Sliders,
  X,
  ChevronRight,
  FileText,
  Award,
  BookOpen,
  School,
  Mail,
  Zap,
} from "lucide-react";
import { PaymentOrder, OperationsAuditLog, IngestedTelemetryEvent } from "@/lib/operations/types";
import { opsFetch } from "@/lib/operations/client-api";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";

interface CanonicalSubscription {
  id: string;
  student_id: string;
  plan_id: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED" | string;
  started_at: string;
  expires_at: string;
  payment_order_id?: string | null;
  activated_by?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

interface StudentDossierData {
  profile: any;
  subscriptions: CanonicalSubscription[];
  orders: PaymentOrder[];
  auditLogs: OperationsAuditLog[];
  telemetry: IngestedTelemetryEvent[];
}

export default function StudentDossierPage() {
  const params = useParams();
  const studentId = params?.id as string;

  const [dossier, setDossier] = useState<StudentDossierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Manual Extension Form State
  const [extensionPlan, setExtensionPlan] = useState<"season" | "monthly" | "custom">("season");
  const [customDays, setCustomDays] = useState("300");
  const [extensionReason, setExtensionReason] = useState("");
  const [extending, setExtending] = useState(false);

  // Order Actions State (Approve / Reject from Dossier)
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<PaymentOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectionCustomText, setRejectionCustomText] = useState("");

  // Receipt Modal State
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);
  const [previewReceiptTitle, setPreviewReceiptTitle] = useState("");

  // Toast State
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  function showToast(type: "success" | "error" | "info", text: string) {
    setToast({ type, text });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  }

  function handleCopy(text: string, fieldName: string) {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  }

  // Load Dossier from Authoritative Backend
  async function loadDossier(isManual = false) {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await opsFetch(`/api/ops/students/${studentId}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.success && data?.profile) {
          setDossier({
            profile: data.profile,
            subscriptions: data.subscriptions || [],
            orders: data.orders || [],
            auditLogs: data.auditLogs || [],
            telemetry: data.telemetry || [],
          });
        } else {
          setDossier(null);
        }
      } else {
        setDossier(null);
      }
    } catch (err: any) {
      console.error("Failed to load student dossier:", err);
      showToast("error", err?.message || "فشل تحميل ملف الطالب من الخادم");
      setDossier(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (studentId) {
      loadDossier();
    }
  }, [studentId]);

  // Handle Manual Extension
  async function handleManualExtension(e: React.FormEvent) {
    e.preventDefault();
    if (extending) return;

    const daysCount =
      extensionPlan === "season"
        ? 300
        : extensionPlan === "monthly"
        ? 30
        : Math.max(1, Number(customDays) || 30);

    const reason = extensionReason.trim();
    if (!reason) {
      showToast("error", "يرجى كتابة سبب التمديد الإداري (مطلوب لتوثيق سجل التدقيق)");
      return;
    }

    setExtending(true);
    try {
      const res = await opsFetch(`/api/ops/students/${studentId}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: extensionPlan === "season" ? "season" : "monthly",
          days: daysCount,
          reason,
          type: extensionPlan === "custom" ? "custom" : extensionPlan === "season" ? "season" : "1_month",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          "success",
          `تم تمديد الاشتراك بنجاح حتى ${new Date(data.newExpiresAt).toLocaleDateString("ar-DZ")}`
        );
        setExtensionReason("");
        await loadDossier(true);
      } else {
        showToast("error", data.error || "فشل تمديد الاشتراك في قاعدة البيانات");
      }
    } catch (err: any) {
      showToast("error", err?.message || "حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setExtending(false);
    }
  }

  // Handle Inline Order Approval
  async function handleApproveOrder(order: PaymentOrder) {
    if (processingOrderId) return;
    setProcessingOrderId(order.id);

    try {
      const res = await opsFetch("/api/ops/payments/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          reason: "تم التحقق والموافقة مباشرة من صفحة الطالب (Student 360°)",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", "تمت الموافقة بنجاح وترقية الطالب إلى PAID فوراً!");
        await loadDossier(true);
      } else {
        showToast("error", data.error || "فشلت الموافقة في قاعدة البيانات");
      }
    } catch (err: any) {
      showToast("error", err?.message || "حدث خطأ أثناء معالجة الموافقة");
    } finally {
      setProcessingOrderId(null);
    }
  }

  // Handle Inline Order Rejection
  async function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectingOrder || processingOrderId) return;

    const finalReason =
      rejectionReason === "custom"
        ? rejectionCustomText.trim()
        : rejectionReason || "وصل التحويل غير واضح أو غير مطابق للمبلغ";

    if (!finalReason) {
      showToast("error", "يرجى تحديد أو إدخال سبب الرفض");
      return;
    }

    setProcessingOrderId(rejectingOrder.id);
    try {
      const res = await opsFetch("/api/ops/payments/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: rejectingOrder.id,
          reason: finalReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast("info", "تم تسجيل رفض الطلب وحفظ السبب في قاعدة البيانات");
        setRejectingOrder(null);
        setRejectionReason("");
        setRejectionCustomText("");
        await loadDossier(true);
      } else {
        showToast("error", data.error || "فشل تسجيل الرفض في قاعدة البيانات");
      }
    } catch (err: any) {
      showToast("error", err?.message || "حدث خطأ أثناء معالجة الرفض");
    } finally {
      setProcessingOrderId(null);
    }
  }

  // Derived Access and Countdown Computations
  const profile = dossier?.profile;
  const accessStatus = profile?.access_status || "TRIAL";
  const plan = profile?.plan || "PILOT_TRIAL";
  const isPaid = accessStatus === "PAID";
  const isTrial = accessStatus === "TRIAL";

  // Expiration calculation
  const expirationInfo = useMemo(() => {
    if (!profile) return null;
    const now = new Date();
    const expiresAtStr = isPaid
      ? profile.subscription_expires_at
      : profile.trial_expires_at || profile.subscription_expires_at;

    if (!expiresAtStr) {
      return {
        status: isPaid ? "ACTIVE_NO_EXPIRY" : "NO_EXPIRY",
        label: "بدون تاريخ انتهاء محدد",
        remainingDays: 0,
        remainingHours: 0,
        isExpired: false,
        percentRemaining: 100,
      };
    }

    const expiresAt = new Date(expiresAtStr);
    const startedAtStr = isPaid
      ? profile.subscription_started_at || profile.created_at
      : profile.trial_started_at || profile.created_at;
    const startedAt = startedAtStr ? new Date(startedAtStr) : new Date(expiresAt.getTime() - 30 * 86400000);

    const diffMs = expiresAt.getTime() - now.getTime();
    const isExpired = diffMs <= 0;

    const totalDuration = Math.max(1, expiresAt.getTime() - startedAt.getTime());
    const elapsed = Math.max(0, now.getTime() - startedAt.getTime());
    const percentRemaining = Math.max(0, Math.min(100, Math.round(((totalDuration - elapsed) / totalDuration) * 100)));

    const remainingDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    const remainingHours = Math.floor((Math.abs(diffMs) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return {
      status: isExpired ? "EXPIRED" : "ACTIVE",
      expiresAt,
      startedAt,
      isExpired,
      remainingDays,
      remainingHours,
      percentRemaining: isExpired ? 0 : percentRemaining,
      label: isExpired
        ? `منتهي الصلاحية منذ ${remainingDays} يوم و ${remainingHours} ساعة`
        : `متبقي ${remainingDays} يوم و ${remainingHours} ساعة`,
    };
  }, [profile, isPaid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080D1A] flex flex-col items-center justify-center text-slate-400 p-8 space-y-4" dir="rtl">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <div className="text-xs font-mono">جاري تحميل ملف الطالب الشامل (Student 360°)...</div>
      </div>
    );
  }

  if (!dossier || !profile) {
    return (
      <div className="min-h-screen bg-[#080D1A] text-slate-100 p-6 flex flex-col items-center justify-center space-y-6" dir="rtl">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <User className="w-8 h-8" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-xl font-bold text-white">لم يتم العثور على ملف الطالب</h1>
          <p className="text-xs text-slate-400 font-mono">
            المعرف المطلوب: <code className="text-indigo-400 px-2 py-0.5 rounded bg-slate-900">{studentId}</code>
          </p>
        </div>
        <Link
          href="/ops/students"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          <span>العودة لدليل الطلاب</span>
        </Link>
      </div>
    );
  }

  const p = dossier.profile;
  const subscriptions = dossier.subscriptions || [];
  const orders = dossier.orders || [];
  const auditLogs = dossier.auditLogs || [];

  const fullName = `${p.first_name || ""} ${p.last_name || ""}`.trim() || p.fullName || "طالب بدون اسم";
  const studentPhone = p.student_phone || p.phone_number;
  const parentPhone = p.parent_phone;
  const email = p.email || p.student_email;

  // Stream Info
  const streamConfig = p.stream_id ? (ALGERIAN_BAC_STREAMS as any)[p.stream_id] : null;
  const streamNameAr = streamConfig ? streamConfig.name_ar : p.stream_id || "شعبة عامة";

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 left-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border transition-all animate-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : toast.type === "error"
              ? "bg-rose-950/90 border-rose-500/50 text-rose-200"
              : "bg-indigo-950/90 border-indigo-500/50 text-indigo-200"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.type === "error" && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          {toast.type === "info" && <AlertTriangle className="w-5 h-5 text-indigo-400 shrink-0" />}
          <span className="text-xs font-semibold">{toast.text}</span>
          <button onClick={() => setToast(null)} className="p-1 hover:bg-white/10 rounded-lg mr-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/ops/students"
            className="p-2 rounded-xl bg-[#0D1526] hover:bg-[#131D31] border border-[#1E293B] text-slate-400 hover:text-white transition-colors"
            title="العودة لدليل الطلاب"
          >
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Operations Center</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 rotate-180" />
              <Link href="/ops/students" className="text-xs text-slate-400 hover:text-white transition-colors">
                الطلاب
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 rotate-180" />
              <span className="text-xs font-bold text-indigo-400">Student 360° Dossier</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>ملف الطالب:</span>
              <span className="text-indigo-300">{fullName}</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDossier(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D1526] hover:bg-[#131D31] border border-[#1E293B] text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
            <span>تحديث البيانات الحية</span>
          </button>

          <Link
            href="/ops/payments"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 text-xs font-semibold transition-all"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>طابور المدفوعات</span>
          </Link>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on LG): Identity, Access Status, Subscriptions & Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Student Comprehensive Header Card */}
          <div className="bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 relative z-10">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 border border-indigo-500/40 flex items-center justify-center text-indigo-200 font-black text-2xl shadow-lg shrink-0">
                  {fullName.charAt(0) || "ط"}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl font-black text-white">{fullName}</h2>

                    {/* Access Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold border flex items-center gap-1.5 ${
                        accessStatus === "PAID"
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-md shadow-emerald-900/30"
                          : accessStatus === "TRIAL"
                          ? "bg-blue-950/80 text-blue-300 border-blue-500/60 shadow-md shadow-blue-900/30"
                          : "bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-md shadow-rose-900/30"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          accessStatus === "PAID"
                            ? "bg-emerald-400 animate-pulse"
                            : accessStatus === "TRIAL"
                            ? "bg-blue-400"
                            : "bg-rose-400"
                        }`}
                      />
                      <span>{accessStatus === "PAID" ? "مشترك مفعل (PAID)" : accessStatus === "TRIAL" ? "فترة تجريبية (TRIAL)" : "منتهي (EXPIRED)"}</span>
                    </span>

                    {/* Stream Badge */}
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 text-xs font-bold">
                      {streamNameAr}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <span>UUID:</span>
                      <span className="text-slate-300">{studentId.slice(0, 13)}...</span>
                      <button
                        onClick={() => handleCopy(studentId, "uuid")}
                        className="text-slate-500 hover:text-white p-0.5"
                        title="نسخ المعرف الكامل"
                      >
                        {copiedField === "uuid" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </span>

                    {email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span className="text-slate-300">{email}</span>
                        <button
                          onClick={() => handleCopy(email, "email")}
                          className="text-slate-500 hover:text-white p-0.5"
                          title="نسخ البريد"
                        >
                          {copiedField === "email" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Contacts Buttons */}
              <div className="flex items-center gap-2">
                {studentPhone && (
                  <a
                    href={`https://wa.me/213${studentPhone.replace(/^0/, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all shadow-sm"
                    title="محادثة واتساب مباشرة مع الطالب"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>واتساب الطالب</span>
                  </a>
                )}

                {parentPhone && (
                  <a
                    href={`https://wa.me/213${parentPhone.replace(/^0/, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all shadow-sm"
                    title="محادثة واتساب مع ولي الأمر"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>واتساب الولي</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar inside Card 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#1E293B]">
              <div className="bg-[#10192E] p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">الولاية والبلدية</div>
                <div className="text-xs font-bold text-white mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{p.wilaya_name || "غير محددة"} {p.commune_name ? `(${p.commune_name})` : ""}</span>
                </div>
              </div>

              <div className="bg-[#10192E] p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">الثانوية والصفة</div>
                <div className="text-xs font-bold text-white mt-1 flex items-center gap-1 truncate" title={p.school_name || ""}>
                  <School className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">{p.school_name || (p.student_status === "free" ? "مترشح حر" : "ثانوية عامة")}</span>
                </div>
              </div>

              <div className="bg-[#10192E] p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">المعدل المستهدف</div>
                <div className="text-sm font-black text-indigo-400 font-mono mt-0.5">
                  {p.target_score ? Number(p.target_score).toFixed(2) : "16.00"}{" "}
                  <span className="text-[10px] text-slate-400 font-normal">/ 20</span>
                </div>
              </div>

              <div className="bg-[#10192E] p-3 rounded-2xl border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">التخصص المرغوب</div>
                <div className="text-xs font-bold text-amber-300 mt-1 truncate" title={p.target_specialty || "غير محدد"}>
                  {p.target_specialty || "الطب / الذكاء الاصطناعي"}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Live Access & Subscription Engine (Single Source of Truth) */}
          <div className="bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>حالة الوصول والاشتراك الحي (Access & Subscription Engine)</span>
              </h3>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                PostgreSQL Authoritative
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Plan Card */}
              <div className="bg-[#10192E] p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">الخطة النشطة (Active Plan)</span>
                <div className="text-base font-black text-white">
                  {plan === "season" || plan === "bac_season_pass_pilot"
                    ? "اشتراك الموسم الدراسي (سنة كاملة)"
                    : plan === "monthly"
                    ? "الاشتراك الشهري (30 يوم)"
                    : "الفترة التجريبية (Pilot Trial)"}
                </div>
                <div className="text-[11px] text-indigo-400 font-mono">
                  {isPaid ? "وصول كامل غير مقيد لكافة المواد" : "وصول تجريبي مقيد"}
                </div>
              </div>

              {/* Start Date */}
              <div className="bg-[#10192E] p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">تاريخ البداية (Started At)</span>
                <div className="text-sm font-bold text-slate-200 font-mono">
                  {expirationInfo?.startedAt
                    ? expirationInfo.startedAt.toLocaleDateString("ar-DZ", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—"}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {expirationInfo?.startedAt ? expirationInfo.startedAt.toLocaleTimeString("ar-DZ") : ""}
                </div>
              </div>

              {/* Expiration Date */}
              <div className="bg-[#10192E] p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">تاريخ الانتهاء (Expires At)</span>
                <div
                  className={`text-sm font-black font-mono ${
                    expirationInfo?.isExpired ? "text-rose-400" : "text-emerald-400"
                  }`}
                >
                  {expirationInfo?.expiresAt
                    ? expirationInfo.expiresAt.toLocaleDateString("ar-DZ", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "غير محدد"}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {expirationInfo?.expiresAt ? expirationInfo.expiresAt.toLocaleTimeString("ar-DZ") : ""}
                </div>
              </div>
            </div>

            {/* Visual Countdown Progress Bar */}
            {expirationInfo && (
              <div className="bg-[#10192E] p-4 rounded-2xl border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-2">
                    <Zap className={`w-3.5 h-3.5 ${expirationInfo.isExpired ? "text-rose-400" : "text-amber-400"}`} />
                    <span>{expirationInfo.label}</span>
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">
                    المتبقي: {expirationInfo.percentRemaining}%
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      expirationInfo.isExpired
                        ? "bg-rose-500"
                        : expirationInfo.percentRemaining < 20
                        ? "bg-amber-500"
                        : "bg-gradient-to-r from-emerald-500 to-teal-400"
                    }`}
                    style={{ width: `${expirationInfo.percentRemaining}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Canonical Subscriptions Table (public.subscriptions) */}
          <div className="bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>سجل الاشتراكات المعتمدة في قاعدة البيانات (public.subscriptions)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">{subscriptions.length} اشتراك مسجل</span>
            </div>

            {subscriptions.length === 0 ? (
              <div className="p-8 text-center bg-[#10192E] rounded-2xl border border-slate-800/80 space-y-2">
                <Sliders className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-bold text-slate-300">لا توجد سجلات اشتراك سابقة لهذا الطالب</div>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  يتم إنشاء سجل اشتراك رسمي تلقائياً عند قبول طلب الدفع عبر الـ RPC أو عند التمديد الإداري.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#10192E] text-slate-400 font-mono text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">الخطة</th>
                      <th className="py-2.5 px-3">الحالة</th>
                      <th className="py-2.5 px-3">تاريخ البدء</th>
                      <th className="py-2.5 px-3">تاريخ الانتهاء</th>
                      <th className="py-2.5 px-3">مفعل بواسطة</th>
                      <th className="py-2.5 px-3">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {subscriptions.map((sub) => {
                      const isActive = sub.status === "ACTIVE";
                      const isSeason = sub.plan_id === "season" || sub.plan_id === "bac_season_pass_pilot";

                      return (
                        <tr key={sub.id} className="hover:bg-[#131D31]/50 transition-colors">
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isSeason
                                  ? "bg-purple-950/80 text-purple-300 border border-purple-800"
                                  : "bg-blue-950/80 text-blue-300 border border-blue-800"
                              }`}
                            >
                              {isSeason ? "الموسم الدراسي" : "الاشتراك الشهري"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isActive
                                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                            {new Date(sub.started_at).toLocaleDateString("ar-DZ")}
                          </td>
                          <td className="py-3 px-3 text-slate-300 font-mono text-[11px]">
                            {new Date(sub.expires_at).toLocaleDateString("ar-DZ")}
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                            {sub.activated_by ? sub.activated_by.slice(0, 8) : "Payment RPC"}
                          </td>
                          <td className="py-3 px-3 text-slate-400 text-[11px] truncate max-w-xs" title={sub.notes || ""}>
                            {sub.notes || "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Card 4: Payment Orders History (public.payment_orders) */}
          <div className="bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>سجل طلبات الدفع والتحويلات (public.payment_orders)</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">{orders.length} طلب</span>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center bg-[#10192E] rounded-2xl border border-slate-800/80 space-y-2">
                <CreditCard className="w-8 h-8 text-slate-600 mx-auto" />
                <div className="text-xs font-bold text-slate-300">لم يقدم الطالب أي طلبات دفع حتى الآن</div>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  تظهر هنا جميع طلبات التحويل البنكي أو البريدي موب أو بطاقات التوصيل مع إمكانية الفحص المباشر.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-[#10192E] text-slate-400 font-mono text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">رقم الطلب</th>
                      <th className="py-2.5 px-3">الخطة والمبلغ</th>
                      <th className="py-2.5 px-3">طريقة الدفع</th>
                      <th className="py-2.5 px-3">الوصل</th>
                      <th className="py-2.5 px-3">الحالة</th>
                      <th className="py-2.5 px-3">التاريخ</th>
                      <th className="py-2.5 px-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {orders.map((order) => {
                      const isPending = order.status === "PENDING";
                      const isApproved = order.status === "APPROVED";
                      const isRejected = order.status === "REJECTED";
                      const isSeason = order.plan === "season" || order.plan === "bac_season_pass_pilot";
                      const isProcessing = processingOrderId === order.id;

                      return (
                        <tr
                          key={order.id}
                          className={`hover:bg-[#131D31]/50 transition-colors ${
                            isPending ? "bg-amber-950/15" : ""
                          }`}
                        >
                          <td className="py-3 px-3 font-mono text-[11px] text-slate-400">
                            {order.id.slice(0, 8)}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-white">
                              {Number(order.amount).toLocaleString()} <span className="text-[10px] text-slate-400">دج</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{isSeason ? "موسم كامل" : "شهري"}</div>
                          </td>
                          <td className="py-3 px-3">
                            {order.paymentMethod === "baridimob" && (
                              <span className="px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 text-[10px] font-bold border border-amber-800/40">
                                BaridiMob
                              </span>
                            )}
                            {order.paymentMethod === "ccp" && (
                              <span className="px-2 py-0.5 rounded bg-blue-950/50 text-blue-300 text-[10px] font-bold border border-blue-800/40">
                                CCP
                              </span>
                            )}
                            {order.paymentMethod === "cash" && (
                              <span className="px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 text-[10px] font-bold border border-emerald-800/40">
                                COD
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            {order.receiptPath ? (
                              <button
                                onClick={() => {
                                  setPreviewReceiptUrl(order.receiptPath!);
                                  setPreviewReceiptTitle(`وصل طلب الدفع (${order.id.slice(0, 8)})`);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1A263F] hover:bg-[#223354] border border-indigo-500/30 text-indigo-300 text-[10px] font-bold transition-all"
                              >
                                <Eye className="w-3 h-3" />
                                <span>معاينة</span>
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-500">—</span>
                            )}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            {isPending && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-bold animate-pulse">
                                في الانتظار
                              </span>
                            )}
                            {isApproved && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                                مقبول ومفعل
                              </span>
                            )}
                            {isRejected && (
                              <div>
                                <span className="px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                                  مرفوض
                                </span>
                                {order.rejectionReason && (
                                  <p className="text-[9px] text-rose-400 mt-0.5 max-w-[140px] truncate" title={order.rejectionReason}>
                                    {order.rejectionReason}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                            {new Date(order.submittedAt || order.createdAt).toLocaleDateString("ar-DZ")}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            {isPending && (
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleApproveOrder(order)}
                                  disabled={isProcessing}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-all active:scale-95 disabled:opacity-50"
                                >
                                  {isProcessing ? <RefreshCw className="w-3 h-3 animate-spin" /> : "موافقة"}
                                </button>
                                <button
                                  onClick={() => setRejectingOrder(order)}
                                  disabled={isProcessing}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-300 text-[10px] font-bold border border-rose-900 transition-all active:scale-95 disabled:opacity-50"
                                >
                                  رفض
                                </button>
                              </div>
                            )}
                            {isApproved && (
                              <span className="text-emerald-400 text-[10px] font-mono flex items-center justify-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>تم التفعيل</span>
                              </span>
                            )}
                            {isRejected && (
                              <button
                                onClick={() => handleApproveOrder(order)}
                                disabled={isProcessing}
                                className="text-[10px] text-slate-400 hover:text-emerald-400 underline"
                              >
                                إعادة قبول
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col on LG): Manual Extension, Detailed Academic Dossier, Audit Timeline */}
        <div className="space-y-6">
          {/* Card 5: Manual Subscription Extension / Override Panel */}
          <div className="bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 text-emerald-400">
              <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>تمديد أو تعديل الاشتراك يدوياً</span>
              </h3>
              <span className="text-[10px] font-bold bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800/40">
                إشراف إداري
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              تمديد وصول الطالب مباشرة في قاعدة بيانات Supabase مع تسجيل عملية تدقيق غير قابلة للتعديل.
            </p>

            <form onSubmit={handleManualExtension} className="space-y-3.5">
              {/* Plan Choice */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">نوع التمديد:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExtensionPlan("season");
                      setCustomDays("300");
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                      extensionPlan === "season"
                        ? "bg-purple-950/70 border-purple-500 text-white shadow-md shadow-purple-950"
                        : "bg-[#10192E] border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    موسم كامل
                    <span className="block text-[10px] font-normal text-slate-400 font-mono mt-0.5">300 يوم</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setExtensionPlan("monthly");
                      setCustomDays("30");
                    }}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                      extensionPlan === "monthly"
                        ? "bg-blue-950/70 border-blue-500 text-white shadow-md shadow-blue-950"
                        : "bg-[#10192E] border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    شهر كامل
                    <span className="block text-[10px] font-normal text-slate-400 font-mono mt-0.5">30 يوم</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setExtensionPlan("custom")}
                    className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                      extensionPlan === "custom"
                        ? "bg-indigo-950/70 border-indigo-500 text-white shadow-md shadow-indigo-950"
                        : "bg-[#10192E] border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    مدة مخصصة
                    <span className="block text-[10px] font-normal text-slate-400 font-mono mt-0.5">بالأيام</span>
                  </button>
                </div>
              </div>

              {/* Custom Days Input */}
              {extensionPlan === "custom" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">عدد الأيام الإضافية:</label>
                  <input
                    type="number"
                    min="1"
                    max="400"
                    required
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                    className="w-full bg-[#10192E] border border-indigo-500/40 rounded-xl p-2.5 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Reason Input (Mandatory) */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  سبب التمديد <span className="text-rose-400">*</span>:
                </label>
                <textarea
                  required
                  rows={2}
                  value={extensionReason}
                  onChange={(e) => setExtensionReason(e.target.value)}
                  placeholder="مثال: منحة تفوق دراسي / تصحيح خطأ مدة الاشتراك / ترقية خاصة..."
                  className="w-full bg-[#10192E] border border-slate-800 rounded-xl p-2.5 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={extending}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {extending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>تنفيذ التمديد وتحديث Supabase</span>
              </button>
            </form>
          </div>

          {/* Card 6: Comprehensive Academic & Profile Data */}
          <div className="bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-[#1E293B] pb-3">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>المعلومات الأكاديمية والمسار</span>
            </h3>

            <div className="space-y-2 text-xs divide-y divide-slate-800/60">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">رقم هاتف الطالب:</span>
                <span className="text-white font-mono">{studentPhone || "—"}</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">رقم هاتف الولي:</span>
                <span className="text-white font-mono">{parentPhone || "—"}</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">صفة التلميذ:</span>
                <span className="text-indigo-300 font-bold">
                  {p.student_status === "free" ? "مترشح حر (Candidat Libre)" : "متمدرس (Scolarisé)"}
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">معدل سنة أولى ثانوي:</span>
                <span className="text-white font-mono">
                  {p.annual_average_year_1 ? `${p.annual_average_year_1} / 20` : "—"}
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">معدل سنة ثانية ثانوي:</span>
                <span className="text-white font-mono">
                  {p.annual_average_year_2 ? `${p.annual_average_year_2} / 20` : "—"}
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">ساعات الدراسة الأسبوعية:</span>
                <span className="text-white font-mono">{p.weekly_study_hours || 10} ساعة / أسبوع</span>
              </div>

              <div className="flex justify-between py-1.5">
                <span className="text-slate-400">تاريخ إنشاء الحساب:</span>
                <span className="text-slate-300 font-mono text-[11px]">
                  {p.created_at ? new Date(p.created_at).toLocaleDateString("ar-DZ") : "—"}
                </span>
              </div>
            </div>
          </div>

          {/* Card 7: Operations Audit Log Timeline */}
          <div className="bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileClock className="w-4 h-4 text-cyan-400" />
                <span>سجل تدقيق العمليات (Audit Timeline)</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">{auditLogs.length} سجل</span>
            </div>

            {auditLogs.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 italic bg-[#10192E] rounded-xl border border-slate-800">
                لا توجد سجلات تدقيق سابقة لهذا الطالب.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-[#10192E] p-3 rounded-2xl border border-slate-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-900/60">
                        {log.action}
                      </span>
                      <span className="text-slate-500">
                        {new Date(log.createdAt).toLocaleDateString("ar-DZ", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {log.reason || "تم التنفيذ بواسطة المشرف"}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                      <span>الفاعل: {log.actorRole}</span>
                      <span>{new Date(log.createdAt).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>{previewReceiptTitle || "معاينة وصل الدفع"}</span>
              </h3>
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-black/40 rounded-2xl p-2 border border-slate-800">
              <img
                src={previewReceiptUrl}
                alt="Payment Receipt"
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={previewReceiptUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#131D31] hover:bg-[#1E293B] text-slate-200 text-xs font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح في تبويب مستقل بدقة كاملة</span>
              </a>

              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleRejectSubmit}
            className="bg-[#0D1526] border border-[#1E293B] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 text-rose-400">
              <h3 className="text-sm font-bold flex items-center gap-2 text-white">
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>رفض طلب الدفع</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed">
              أنت على وشك رفض طلب الدفع رقم{" "}
              <strong className="text-white font-mono">{rejectingOrder.id.slice(0, 8)}</strong> بقيمة{" "}
              <strong className="text-white font-mono">{Number(rejectingOrder.amount).toLocaleString()} دج</strong>.
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 block">سبب الرفض المعتمد:</label>

              {[
                "وصل التحويل غير واضح أو غير مقروء",
                "المبلغ المحول في الوصل لا يطابق سعر الخطة المحددة",
                "وصل التحويل مكرر أو تم استخدامه مسبقاً",
                "رقم المعاملة غير مطابق لسجلات الحساب البريدي",
                "custom",
              ].map((reasonOption) => {
                const isSelected =
                  reasonOption === "custom"
                    ? rejectionReason === "custom"
                    : rejectionReason === reasonOption;

                return (
                  <label
                    key={reasonOption}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-rose-950/30 border-rose-500/50 text-white"
                        : "bg-[#10192E] border-slate-800 text-slate-400 hover:bg-[#131D31]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejectionReason"
                      value={reasonOption}
                      checked={isSelected}
                      onChange={() => setRejectionReason(reasonOption)}
                      className="accent-rose-500"
                    />
                    <span>{reasonOption === "custom" ? "سبب مخصص آخر (كتابة يدوية)..." : reasonOption}</span>
                  </label>
                );
              })}

              {rejectionReason === "custom" && (
                <textarea
                  required
                  value={rejectionCustomText}
                  onChange={(e) => setRejectionCustomText(e.target.value)}
                  placeholder="اكتب سبب الرفض بالتفصيل..."
                  rows={3}
                  className="w-full bg-[#10192E] border border-rose-500/40 rounded-xl p-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E293B]">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2 rounded-xl bg-[#10192E] hover:bg-[#131D31] text-slate-300 text-xs font-semibold"
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={processingOrderId !== null}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {processingOrderId ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                <span>تأكيد الرفض في قاعدة البيانات</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
