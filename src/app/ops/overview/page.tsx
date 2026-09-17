"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  CreditCard,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  ArrowRight,
  RefreshCw,
  Sliders,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Flame,
  Layers,
  ArrowUpRight,
  MessageCircle,
  Zap,
  Clock,
  Send,
  UserCheck,
  Search,
  Filter,
  Eye,
  Tag,
  Calendar,
  Smartphone,
  Monitor,
  ExternalLink,
  ChevronRight,
  Check,
  X,
  PlusCircle,
  ShieldCheck,
  Phone,
  Mail,
  FileText,
  Percent,
} from "lucide-react";
import {
  OperationsOverviewKPIs,
  PaymentOrder,
  SubscriptionPlan,
  StudentOperationalSummary,
} from "@/lib/operations/types";
import { opsFetch } from "@/lib/operations/client-api";

type CockpitTab = "pulse" | "orders" | "pricing" | "visitors" | "students";

interface DailyVisitorStat {
  date: string;
  totalViews: number;
  uniqueVisitors: number;
  mobileViews: number;
  desktopViews: number;
  topRoutes: Array<{ route: string; count: number }>;
}

interface VisitorAnalyticsData {
  liveCount: number;
  totalHits: number;
  uniqueVisitors: number;
  dailyStats: DailyVisitorStat[];
  deviceStats: { mobile: number; desktop: number; tablet: number };
  recentHits: Array<{
    id: string;
    path: string;
    visitorId: string;
    timestamp: string;
    deviceType: string;
    referrer?: string;
  }>;
}

function safeFormatDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("ar-DZ");
  } catch {
    return "—";
  }
}

function safeFormatDateTime(iso?: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return isNaN(d.getTime())
      ? "—"
      : d.toLocaleDateString("ar-DZ", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  } catch {
    return "—";
  }
}

function safeFormatTime(dateOrIso?: Date | string | null): string {
  if (!dateOrIso) return "—";
  try {
    const d = typeof dateOrIso === "string" ? new Date(dateOrIso) : dateOrIso;
    return isNaN(d.getTime()) ? "—" : d.toLocaleTimeString("ar-DZ");
  } catch {
    return "—";
  }
}

export default function OpsOverviewPage() {
  // Navigation
  const [activeTab, setActiveTab] = useState<CockpitTab>("pulse");
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Core Data States
  const [kpis, setKpis] = useState<OperationsOverviewKPIs | null>(null);
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [visitors, setVisitors] = useState<VisitorAnalyticsData | null>(null);
  const [students, setStudents] = useState<StudentOperationalSummary[]>([]);

  // Filtering states
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("PENDING");
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState("all");

  // Action states
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);
  const [loadingReceiptId, setLoadingReceiptId] = useState<string | null>(null);
  const [rejectModalOrder, setRejectModalOrder] = useState<PaymentOrder | null>(null);
  const [rejectReason, setRejectReason] = useState("إيصال غير واضح أو غير مكتمل");
  const [customRejectReason, setCustomRejectReason] = useState("");

  // Plan editing states
  const [editingPlans, setEditingPlans] = useState<{ [planId: string]: { price_dzd: number; duration_months: number; active: boolean } }>({});
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);

  // Direct manual activation modal
  const [directStudentId, setDirectStudentId] = useState("");
  const [directPlan, setDirectPlan] = useState<"season" | "monthly">("season");
  const [isActivatingDirect, setIsActivatingDirect] = useState(false);
  const [showDirectModal, setShowDirectModal] = useState(false);

  // ─── Fetch All Operations Data ─────────────────────────────────────────────
  async function fetchAllData() {
    setLoading(true);
    setActionNotice(null);

    try {
      const [kpisRes, ordersRes, plansRes, visitorsRes, studentsRes] = await Promise.all([
        opsFetch("/api/ops/overview").catch(() => null),
        opsFetch("/api/ops/payments").catch(() => null),
        opsFetch("/api/ops/subscriptions").catch(() => null),
        opsFetch("/api/ops/analytics/visitors?days=30").catch(() => null),
        opsFetch("/api/ops/students").catch(() => null),
      ]);

      if (kpisRes && kpisRes.ok) {
        const kpisData = await kpisRes.json().catch(() => null);
        if (kpisData?.kpis) setKpis(kpisData.kpis);
      }

      if (ordersRes && ordersRes.ok) {
        const ordersData = await ordersRes.json().catch(() => null);
        if (Array.isArray(ordersData?.orders)) {
          setOrders(ordersData.orders);
        } else {
          setOrders([]);
        }
      } else {
        setOrders([]);
      }

      if (plansRes && plansRes.ok) {
        const plansData = await plansRes.json().catch(() => null);
        if (Array.isArray(plansData?.plans)) {
          setPlans(plansData.plans);
          // Initialize edit form buffer
          const map: { [id: string]: { price_dzd: number; duration_months: number; active: boolean } } = {};
          plansData.plans.forEach((p: SubscriptionPlan) => {
            map[p.id] = {
              price_dzd: p?.price_dzd ?? 0,
              duration_months: p?.duration_months ?? 1,
              active: p?.active !== false,
            };
          });
          setEditingPlans(map);
        }
      }

      if (visitorsRes && visitorsRes.ok) {
        const visitorsData = await visitorsRes.json().catch(() => null);
        if (visitorsData && typeof visitorsData === "object" && !visitorsData.error) {
          setVisitors(visitorsData);
        }
      }

      if (studentsRes && studentsRes.ok) {
        const studentsData = await studentsRes.json().catch(() => null);
        if (Array.isArray(studentsData?.students)) {
          setStudents(studentsData.students);
        } else {
          setStudents([]);
        }
      } else {
        setStudents([]);
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Ops overview full sync error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAllData();
    // Refresh live visitor count every 30 seconds
    const interval = setInterval(async () => {
      try {
        const res = await opsFetch("/api/ops/analytics/visitors?days=7");
        if (res.ok) {
          const data = await res.json();
          setVisitors(data);
        }
      } catch {
        // silent background poll
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // ─── Order Approval Handler ───────────────────────────────────────────────
  async function handleApproveOrder(order: PaymentOrder) {
    if (processingOrderId) return;
    setProcessingOrderId(order.id);
    setActionNotice(null);

    try {
      const res = await opsFetch("/api/ops/payments/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          reason: "تم التحقق والمطابقة اليدوية بنجاح",
        }),
      });

      const data = await res.json();
      if (res.ok && data?.success) {
        setActionNotice({
          type: "success",
          message: `✓ تم قبول الطلب وتفعيل اشتراك الطالب (${order.studentName || order.userId}) بنجاح!`,
        });
        // Optimistically update orders in list
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? { ...o, status: "APPROVED", resolvedAt: new Date().toISOString() }
              : o
          )
        );
        // Refresh full overview to reflect updated KPIs
        opsFetch("/api/ops/overview").then((r) => r.json()).then((d) => d?.kpis && setKpis(d.kpis));
      } else {
        setActionNotice({
          type: "error",
          message: `فشل قبول الطلب: ${data?.error || "خطأ غير متوقع"}`,
        });
      }
    } catch (err: any) {
      setActionNotice({ type: "error", message: `تعذر الاتصال بالخادم: ${err?.message}` });
    } finally {
      setProcessingOrderId(null);
    }
  }

  // ─── Order Rejection Handler ───────────────────────────────────────────────
  async function handleConfirmRejectOrder() {
    if (!rejectModalOrder) return;
    setProcessingOrderId(rejectModalOrder.id);
    setActionNotice(null);

    const finalReason = customRejectReason.trim() || rejectReason;

    try {
      const res = await opsFetch("/api/ops/payments/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: rejectModalOrder.id,
          reason: finalReason,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.success) {
        setActionNotice({
          type: "success",
          message: `✓ تم رفض الطلب وإعلام حساب الطالب بالسبب: "${finalReason}"`,
        });
        setOrders((prev) =>
          prev.map((o) =>
            o.id === rejectModalOrder.id
              ? { ...o, status: "REJECTED", notes: finalReason, resolvedAt: new Date().toISOString() }
              : o
          )
        );
        setRejectModalOrder(null);
        setCustomRejectReason("");
      } else {
        setActionNotice({
          type: "error",
          message: `فشل الرفض: ${data?.error || "خطأ غير متوقع"}`,
        });
      }
    } catch (err: any) {
      setActionNotice({ type: "error", message: `تعذر الاتصال بالخادم: ${err?.message}` });
    } finally {
      setProcessingOrderId(null);
    }
  }

  // ─── View Receipt Modal ───────────────────────────────────────────────────
  async function handleViewReceipt(orderId: string) {
    setLoadingReceiptId(orderId);
    try {
      const res = await opsFetch(`/api/ops/payments/receipt/view?orderId=${orderId}`);
      const data = await res.json();
      if (data?.success && data?.url) {
        setPreviewReceiptUrl(data.url);
      } else {
        alert(data?.error || "تعذر فتح وصل الدفع");
      }
    } catch {
      alert("حدث خطأ أثناء تحميل صورة الوصل");
    } finally {
      setLoadingReceiptId(null);
    }
  }

  // ─── Save Subscription Plan Price ──────────────────────────────────────────
  async function handleSavePlanPrice(planId: string) {
    const edit = editingPlans[planId];
    if (!edit) return;

    if (edit.price_dzd < 0) {
      alert("يرجى إدخال سعر صحيح بالدينار الجزائري.");
      return;
    }

    setSavingPlanId(planId);
    setActionNotice(null);

    try {
      const res = await opsFetch("/api/ops/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          price_dzd: edit.price_dzd,
          duration_months: edit.duration_months,
          active: edit.active,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.success) {
        setActionNotice({
          type: "success",
          message: `✓ تم تحديث سعر باقة (${planId}) إلى ${edit.price_dzd.toLocaleString()} دج بنجاح! سيظهر السعر الجديد فوراً للطلبة.`,
        });
        setPlans((prev) =>
          prev.map((p) =>
            p.id === planId
              ? { ...p, price_dzd: edit.price_dzd, duration_months: edit.duration_months, active: edit.active }
              : p
          )
        );
      } else {
        setActionNotice({
          type: "error",
          message: `فشل حفظ السعر: ${data?.error || "خطأ غير متوقع"}`,
        });
      }
    } catch (err: any) {
      setActionNotice({ type: "error", message: `تعذر الاتصال بالخادم: ${err?.message}` });
    } finally {
      setSavingPlanId(null);
    }
  }

  // ─── Direct Student Activation ────────────────────────────────────────────
  async function handleDirectActivateStudent(e: React.FormEvent) {
    e.preventDefault();
    const cleanId = directStudentId.trim();
    if (!cleanId) {
      alert("يرجى إدخال معرف الطالب أو بريده الإلكتروني.");
      return;
    }

    setIsActivatingDirect(true);
    setActionNotice(null);

    const isSeason = directPlan === "season";
    const planLabel = isSeason ? "سنة دراسية كاملة (Pass Saison)" : "اشتراك شهري (Mensuel)";

    try {
      const res = await opsFetch(`/api/ops/students/${encodeURIComponent(cleanId)}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: isSeason ? "custom" : "1_month",
          days: isSeason ? 365 : 30,
          plan: directPlan,
          reason: `تفعيل يدوي مباشر (${planLabel}) عبر لوحة القيادة`,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.success) {
        setActionNotice({
          type: "success",
          message: `✓ تم تفعيل اشتراك الطالب (${cleanId}) بنجاح كحساب مدفوع (${planLabel}).`,
        });
        setShowDirectModal(false);
        setDirectStudentId("");
        fetchAllData();
      } else {
        setActionNotice({
          type: "error",
          message: `فشل التفعيل المباشر: ${data?.error || "خطأ غير متوقع"}`,
        });
      }
    } catch (err: any) {
      setActionNotice({ type: "error", message: `تعذر الاتصال بالخادم: ${err?.message}` });
    } finally {
      setIsActivatingDirect(false);
    }
  }

  // ─── Filtered Orders ───────────────────────────────────────────────────────
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders.filter((order) => {
      if (!order) return false;
      const matchStatus = orderStatusFilter === "ALL" || order.status === orderStatusFilter;
      const q = (orderSearchQuery || "").trim().toLowerCase();
      const matchQuery =
        !q ||
        (order.studentName && order.studentName.toLowerCase().includes(q)) ||
        (order.studentPhone && order.studentPhone.includes(q)) ||
        (order.studentEmail && order.studentEmail.toLowerCase().includes(q)) ||
        (order.id && order.id.toLowerCase().includes(q)) ||
        (order.userId && order.userId.toLowerCase().includes(q));
      return matchStatus && matchQuery;
    });
  }, [orders, orderStatusFilter, orderSearchQuery]);

  // ─── Filtered Students ─────────────────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];
    return students.filter((st) => {
      if (!st) return false;
      const matchStatus =
        studentStatusFilter === "all" ||
        (studentStatusFilter === "PAID" && st.accessStatus === "PAID") ||
        (studentStatusFilter === "TRIAL" && st.accessStatus === "TRIAL") ||
        (studentStatusFilter === "REJECTED" && st.accessStatus === "REJECTED") ||
        (studentStatusFilter === "EXPIRED" && st.accessStatus === "EXPIRED");

      const q = (studentSearchQuery || "").trim().toLowerCase();
      const matchQuery =
        !q ||
        (st.fullName && st.fullName.toLowerCase().includes(q)) ||
        (st.studentPhone && st.studentPhone.includes(q)) ||
        (st.email && st.email.toLowerCase().includes(q)) ||
        (st.id && st.id.toLowerCase().includes(q));

      return matchStatus && matchQuery;
    });
  }, [students, studentStatusFilter, studentSearchQuery]);

  // Derived counts
  const pendingOrdersCount = useMemo(() => Array.isArray(orders) ? orders.filter((o) => o?.status === "PENDING").length : 0, [orders]);
  const approvedOrdersCount = useMemo(() => Array.isArray(orders) ? orders.filter((o) => o?.status === "APPROVED").length : 0, [orders]);
  const rejectedOrdersCount = useMemo(() => Array.isArray(orders) ? orders.filter((o) => o?.status === "REJECTED").length : 0, [orders]);

  const liveVisitorsCount = visitors?.liveCount ?? 0;
  const totalVisitorsCount = visitors?.uniqueVisitors ?? 0;
  const totalPageviewsCount = visitors?.totalHits ?? 0;

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 p-3 sm:p-6 lg:p-8 space-y-6 max-w-[1700px] mx-auto relative selection:bg-indigo-500/30">
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-1/3 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[140px]" />
      </div>

      {/* Global Notification Banner */}
      {actionNotice && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300 ${
            actionNotice.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-200"
              : "bg-rose-950/80 border-rose-500/50 text-rose-200"
          }`}
        >
          <div className="flex items-center gap-3">
            {actionNotice.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span className="text-sm font-semibold">{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#0C1322]/80 backdrop-blur-2xl border border-slate-800/80 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                <ShieldCheck className="w-5 h-5" />
              </span>
              مركز القيادة والعمليات الموحد
            </h1>

            {/* Live Visitors Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold tracking-wide shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span>{liveVisitorsCount} زوار متواجدون الآن</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            التحكم الشامل في الاشتراكات، مطابقة إيصالات BaridiMob/CCP، تعديل أسعار الباقات، ومراقبة تدفق الزوار الحية واليومية.
          </p>
        </div>

        {/* Header Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
          {lastRefreshed && (
            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
              آخر تحديث: {safeFormatTime(lastRefreshed)}
            </span>
          )}

          <button
            onClick={fetchAllData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#131D31] hover:bg-[#1A2640] border border-slate-700 text-xs font-semibold text-slate-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "جارِ التحديث..." : "تحديث فوري"}</span>
          </button>

          <button
            onClick={() => setShowDirectModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>تفعيل اشتراك يدوي</span>
          </button>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <nav className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80">
        <button
          onClick={() => setActiveTab("pulse")}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
            activeTab === "pulse"
              ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-lg shadow-indigo-600/10"
              : "bg-[#0C1322]/60 text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-800"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>⚡ النبض والملخص القيادي</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 border relative ${
            activeTab === "orders"
              ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/40 shadow-lg shadow-emerald-600/10"
              : "bg-[#0C1322]/60 text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-800"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>💳 طلبات الدفع والاشتراك</span>
          {pendingOrdersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-black text-[10px] animate-pulse">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("pricing")}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
            activeTab === "pricing"
              ? "bg-amber-600/20 text-amber-300 border-amber-500/40 shadow-lg shadow-amber-600/10"
              : "bg-[#0C1322]/60 text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-800"
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>🏷️ تغيير أسعار باقات الاشتراك</span>
        </button>

        <button
          onClick={() => setActiveTab("visitors")}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
            activeTab === "visitors"
              ? "bg-cyan-600/20 text-cyan-300 border-cyan-500/40 shadow-lg shadow-cyan-600/10"
              : "bg-[#0C1322]/60 text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>👥 تحليلات الزوار بالتفصيل وبالتاريخ</span>
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
            {liveVisitorsCount} حي
          </span>
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all shrink-0 border ${
            activeTab === "students"
              ? "bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-lg shadow-purple-600/10"
              : "bg-[#0C1322]/60 text-slate-400 hover:text-slate-200 border-transparent hover:border-slate-800"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>🎓 دليل الطلاب وحالة الحسابات</span>
        </button>
      </nav>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 1: النبض والملخص القيادي (Pulse & Cockpit)                      */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "pulse" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Quick WhatsApp Support Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-[#0C1322]/90 to-[#0C1322]/70 border border-emerald-500/30 backdrop-blur-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-white">مسار التحقق والتفعيل اليدوي السريع عبر واتساب</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                    WhatsApp Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  عند قبول أي طلب، يتم ترقية حساب الطالب فورياً إلى وضع الاشتراك المدفوع (PAID) بدون الحاجة لإعادة التسجيل أو مسح التخزين المؤقت.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab("orders")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20"
              >
                <span>طابور المراجعة ({pendingOrdersCount})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Hero 4 Bento Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Pending Orders */}
            <div
              onClick={() => {
                setOrderStatusFilter("PENDING");
                setActiveTab("orders");
              }}
              className="cursor-pointer relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/30 via-[#0C1322]/90 to-[#0C1322]/60 backdrop-blur-2xl border border-amber-500/30 p-5 shadow-xl hover:border-amber-500/60 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  طلبات تنتظر المعاينة
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono font-bold">
                  يحتاج تدخلاً
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                  {pendingOrdersCount}
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-amber-300 transition-colors flex items-center gap-1">
                  معاينة الآن <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>المقبولة إجمالاً:</span>
                <span className="font-mono font-bold text-emerald-400">{approvedOrdersCount}</span>
              </div>
            </div>

            {/* Card 2: Active Paid Students */}
            <div
              onClick={() => {
                setStudentStatusFilter("PAID");
                setActiveTab("students");
              }}
              className="cursor-pointer relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950/30 via-[#0C1322]/90 to-[#0C1322]/60 backdrop-blur-2xl border border-emerald-500/30 p-5 shadow-xl hover:border-emerald-500/60 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  الطلاب المشتركون (Paid)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                  ساري المفعول
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                  {kpis?.productStatus?.activePaidStudents ?? 0}
                </div>
                <span className="text-xs text-slate-400">حساب نشط</span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>إجمالي المسجلين:</span>
                <span className="font-mono font-bold text-white">{kpis?.productStatus?.totalRegistered ?? 0}</span>
              </div>
            </div>

            {/* Card 3: Live Visitors */}
            <div
              onClick={() => setActiveTab("visitors")}
              className="cursor-pointer relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-950/30 via-[#0C1322]/90 to-[#0C1322]/60 backdrop-blur-2xl border border-cyan-500/30 p-5 shadow-xl hover:border-cyan-500/60 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  زوار المنصة الحالية
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
                  مباشر 15m
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-cyan-300 flex items-center gap-2">
                  <span>{liveVisitorsCount}</span>
                  <span className="text-xs font-mono font-normal text-slate-400">متواجد</span>
                </div>
                <span className="text-xs font-medium text-slate-400 group-hover:text-cyan-300 transition-colors flex items-center gap-1">
                  التفاصيل <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>المشاهدات الكلية:</span>
                <span className="font-mono font-bold text-white">{totalPageviewsCount.toLocaleString()}</span>
              </div>
            </div>

            {/* Card 4: Trial Students */}
            <div
              onClick={() => {
                setStudentStatusFilter("TRIAL");
                setActiveTab("students");
              }}
              className="cursor-pointer relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/30 via-[#0C1322]/90 to-[#0C1322]/60 backdrop-blur-2xl border border-indigo-500/30 p-5 shadow-xl hover:border-indigo-500/60 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  في التجربة المجانية (Trial)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-mono font-bold">
                  72 ساعة
                </span>
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                  {kpis?.productStatus?.studentsInTrial ?? 0}
                </div>
                <span className="text-xs text-slate-400">طالب</span>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>أكملوا التهيئة:</span>
                <span className="font-mono font-bold text-indigo-300">
                  {kpis?.productStatus?.completedOnboarding ?? 0}
                </span>
              </div>
            </div>
          </section>

          {/* Quick Plans & Pricing Overview Block */}
          <section className="p-6 rounded-3xl bg-[#0C1322]/80 backdrop-blur-2xl border border-slate-800/80 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-amber-400" />
                  أسعار الاشتراكات المطبقة حالياً على المنصة
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  تستطيع تعديل هذه الأسعار مباشرة وتطبيقها فوراً دون الحاجة لتعديل الكود البرمجي.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("pricing")}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all self-start sm:self-auto"
              >
                <span>تعديل الأسعار الآن</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="p-5 rounded-2xl bg-[#111A2E]/80 border border-slate-700/60 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                      {p.id === "season" ? "Pass Saison BAC 2026" : "Abonnement Mensuel"}
                    </span>
                    <h3 className="text-lg font-black text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400">
                      المدة: {p.duration_months} أشهر | الحالة:{" "}
                      {p.active !== false ? (
                        <span className="text-emerald-400 font-bold">مفتوح للطلب</span>
                      ) : (
                        <span className="text-rose-400 font-bold">مغلق مؤقتاً</span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black font-mono text-amber-400">
                      {p.price_dzd.toLocaleString()} دج
                    </div>
                    <span className="text-[11px] text-slate-400">سعر الاشتراك الحالي</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 2: طلبات الدفع والاشتراك (Payment Orders Management)             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "orders" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Filters & Search Header */}
          <div className="p-5 rounded-3xl bg-[#0C1322]/80 backdrop-blur-2xl border border-slate-800/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setOrderStatusFilter("PENDING")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  orderStatusFilter === "PENDING"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md"
                    : "bg-[#111A2E] text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>قيد الانتظار ({pendingOrdersCount})</span>
              </button>

              <button
                onClick={() => setOrderStatusFilter("APPROVED")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  orderStatusFilter === "APPROVED"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md"
                    : "bg-[#111A2E] text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>المقبولة والمفعلة ({approvedOrdersCount})</span>
              </button>

              <button
                onClick={() => setOrderStatusFilter("REJECTED")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  orderStatusFilter === "REJECTED"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md"
                    : "bg-[#111A2E] text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>المرفوضة ({rejectedOrdersCount})</span>
              </button>

              <button
                onClick={() => setOrderStatusFilter("ALL")}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  orderStatusFilter === "ALL"
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-md"
                    : "bg-[#111A2E] text-slate-400 border-slate-800 hover:text-white"
                }`}
              >
                <span>جميع الطلبات ({orders.length})</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث باسم الطالب، الهاتف، الإيميل..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[#111A2E] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Orders Cards Grid */}
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#0C1322]/80 border border-slate-800 text-slate-400 space-y-2">
              <CreditCard className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-bold text-white">لا توجد طلبات تطابق هذا التصنيف</p>
              <p className="text-xs text-slate-500">جرب تغيير حالة الفلترة أو مسح عبارة البحث</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredOrders.map((order) => {
                const isPending = order.status === "PENDING";
                const isApproved = order.status === "APPROVED";
                const isRejected = order.status === "REJECTED";
                const isProcessing = processingOrderId === order.id;

                // Format whatsapp link
                const cleanPhone = (order.studentPhone || "").replace(/[^0-9]/g, "");
                const waNumber = cleanPhone.startsWith("0") ? `213${cleanPhone.slice(1)}` : cleanPhone;
                const waMessage = encodeURIComponent(
                  `مرحباً ${order.studentName || "عزيزي الطالب"}، معك إدارة منصة BAC Mastery بخصوص طلب اشتراكك (${order.amount.toLocaleString()} دج)...`
                );
                const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${waMessage}` : null;

                return (
                  <div
                    key={order.id}
                    className={`p-5 rounded-3xl border transition-all duration-300 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                      isPending
                        ? "bg-[#0C1322]/90 border-amber-500/40 hover:border-amber-500/60"
                        : isApproved
                        ? "bg-[#0C1322]/70 border-emerald-500/30 hover:border-emerald-500/50"
                        : "bg-[#0C1322]/60 border-rose-500/30 hover:border-rose-500/50"
                    }`}
                  >
                    {/* Left: Student & Order Info */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="text-sm sm:text-base font-black text-white">
                          {order.studentName || "طالب بدون اسم"}
                        </span>

                        {/* Status Badge */}
                        {isPending && (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold">
                            قيد المراجعة
                          </span>
                        )}
                        {isApproved && (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold flex items-center gap-1">
                            <Check className="w-3 h-3" /> اشتراك مفعل ومؤكد
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold flex items-center gap-1">
                            <X className="w-3 h-3" /> طلب مرفوض
                          </span>
                        )}

                        <span className="text-[11px] text-slate-500 font-mono">
                          {safeFormatDateTime(order.createdAt)}
                        </span>
                      </div>

                      {/* Contact & Meta Line */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                        {order.studentPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-500" />
                            <span className="font-mono text-slate-300">{order.studentPhone}</span>
                          </span>
                        )}
                        {order.studentEmail && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-slate-300">{order.studentEmail}</span>
                          </span>
                        )}
                        {order.streamId && (
                          <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[10px] font-semibold">
                            {order.streamId}
                          </span>
                        )}
                        <span className="text-slate-500">طريقة الدفع: {order.paymentMethod || "BaridiMob"}</span>
                      </div>

                      {/* Rejection reason or notes if present */}
                      {order.notes && (
                        <div className="text-xs p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-amber-300">
                          <span className="font-bold">ملاحظات / سبب الرفض:</span> {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Middle: Plan & Price Badge */}
                    <div className="flex items-center justify-between lg:flex-col lg:items-end gap-1 px-4 py-2 rounded-2xl bg-[#111A2E] border border-slate-800 shrink-0">
                      <span className="text-[11px] text-slate-400 font-semibold uppercase">
                        {order.plan === "season" ? "Pass Saison BAC" : "Abonnement Mensuel"}
                      </span>
                      <span className="text-xl sm:text-2xl font-black font-mono text-white">
                        {order.amount.toLocaleString()}{" "}
                        <span className="text-xs text-amber-400 font-sans">{order.currency || "دج"}</span>
                      </span>
                    </div>

                    {/* Right: Actions Bar */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                      {/* Receipt Preview Button */}
                      <button
                        onClick={() => handleViewReceipt(order.id)}
                        disabled={loadingReceiptId === order.id}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#111A2E] hover:bg-[#1A2640] border border-slate-700 text-xs font-semibold text-slate-200 transition-all active:scale-95"
                      >
                        {loadingReceiptId === order.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        ) : (
                          <Eye className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                        <span>معاينة الوصل</span>
                      </button>

                      {/* WhatsApp Direct Chat */}
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>واتساب</span>
                        </a>
                      )}

                      {/* Pending Controls: Approve / Reject */}
                      {isPending && (
                        <>
                          <button
                            onClick={() => handleApproveOrder(order)}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                          >
                            {isProcessing ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>قبول وتفعيل فوري</span>
                          </button>

                          <button
                            onClick={() => {
                              setRejectModalOrder(order);
                              setRejectReason("إيصال غير واضح أو غير مكتمل");
                              setCustomRejectReason("");
                            }}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>رفض</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 3: تغيير أسعار باقات الاشتراك (Pricing & Plans Control)          */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "pricing" && (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto">
          <div className="p-6 rounded-3xl bg-[#0C1322]/80 backdrop-blur-2xl border border-slate-800/80 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">إدارة وتعديل أسعار باقات الاشتراك</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  أي تعديل تقوم بحفظه هنا يتم تطبيقه فورياً على واجهات الطلاب وصفحة الدفع دون الحاجة لأي إعادة تشغيل.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {plans.map((plan) => {
                const edit = editingPlans[plan.id] || {
                  price_dzd: plan.price_dzd,
                  duration_months: plan.duration_months,
                  active: plan.active !== false,
                };
                const isSaving = savingPlanId === plan.id;

                return (
                  <div
                    key={plan.id}
                    className="p-6 rounded-3xl bg-[#111A2E]/90 border border-slate-700/80 space-y-5 shadow-2xl flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Plan Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                          Plan ID: {plan.id}
                        </span>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={edit.active}
                            onChange={(e) =>
                              setEditingPlans((prev) => ({
                                ...prev,
                                [plan.id]: { ...edit, active: e.target.checked },
                              }))
                            }
                            className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
                          />
                          <span className={`text-xs font-bold ${edit.active ? "text-emerald-400" : "text-rose-400"}`}>
                            {edit.active ? "متاح للطلب" : "مغلق مؤقتاً"}
                          </span>
                        </label>
                      </div>

                      <h3 className="text-xl font-black text-white">{plan.name}</h3>

                      {/* Price Field */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">السعر بالدينار الجزائري (DZD):</label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={edit.price_dzd}
                            onChange={(e) =>
                              setEditingPlans((prev) => ({
                                ...prev,
                                [plan.id]: { ...edit, price_dzd: Number(e.target.value) },
                              }))
                            }
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#080D1A] border border-slate-700 text-white font-mono font-black text-lg focus:outline-none focus:border-amber-500 transition-colors"
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400 font-sans">
                            دج
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">السعر السابق: {plan.price_dzd.toLocaleString()} دج</p>
                      </div>

                      {/* Duration Field */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-300">مدة الاشتراك (بالأشهر):</label>
                        <input
                          type="number"
                          min="1"
                          max="24"
                          value={edit.duration_months}
                          onChange={(e) =>
                            setEditingPlans((prev) => ({
                              ...prev,
                              [plan.id]: { ...edit, duration_months: Number(e.target.value) },
                            }))
                          }
                          className="w-full px-4 py-2.5 rounded-xl bg-[#080D1A] border border-slate-700 text-white font-mono font-bold text-sm focus:outline-none focus:border-amber-500 transition-colors"
                        />
                      </div>

                      {/* Features Preview */}
                      {plan.features && plan.features.length > 0 && (
                        <div className="space-y-1.5 pt-2">
                          <span className="text-[11px] font-bold text-slate-400">مميزات الباقة المعروضة للطالب:</span>
                          <ul className="text-xs text-slate-300 space-y-1 pr-2">
                            {plan.features.slice(0, 4).map((f, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={() => handleSavePlanPrice(plan.id)}
                      disabled={isSaving}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black text-xs transition-all shadow-lg shadow-amber-600/20 active:scale-98 disabled:opacity-50"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span>حفظ وتطبيق السعر فوراً ({edit.price_dzd.toLocaleString()} دج)</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 4: تحليلات الزوار بالتفصيل وبالتاريخ (Visitor Analytics by Date) */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "visitors" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Realtime Pulse Counter Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#0C1322]/90 to-[#0C1322]/70 border border-cyan-500/30 backdrop-blur-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                <Users className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">
                    LIVE REALTIME PULSE
                  </span>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white flex items-baseline gap-2">
                  <span>{liveVisitorsCount}</span>
                  <span className="text-sm font-normal text-slate-300">زائر متواجدون الآن على المنصة</span>
                </h2>
                <p className="text-xs text-slate-400">
                  يتم رصد الزيارات النشطة اللحظية خلال آخر 15 دقيقة مع التحديث التلقائي المستمر.
                </p>
              </div>
            </div>

            {/* Breakdown Mini-Stats */}
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <div className="px-4 py-3 rounded-2xl bg-[#111A2E] border border-slate-800 text-center min-w-[120px]">
                <span className="text-[11px] text-slate-400 block font-semibold">إجمالي المشاهدات</span>
                <span className="text-xl font-black font-mono text-white">{totalPageviewsCount.toLocaleString()}</span>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[#111A2E] border border-slate-800 text-center min-w-[120px]">
                <span className="text-[11px] text-slate-400 block font-semibold">الزوار الفريدون</span>
                <span className="text-xl font-black font-mono text-cyan-300">
                  {totalVisitorsCount.toLocaleString()}
                </span>
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[#111A2E] border border-slate-800 text-center min-w-[120px]">
                <span className="text-[11px] text-slate-400 block font-semibold">الهواتف vs الحواسيب</span>
                <span className="text-xs font-mono font-bold text-slate-200">
                  {visitors?.deviceStats?.mobile || 0} 📱 / {visitors?.deviceStats?.desktop || 0} 💻
                </span>
              </div>
            </div>
          </div>

          {/* Daily Table: الزوار بالتاريخ */}
          <div className="p-6 rounded-3xl bg-[#0C1322]/80 backdrop-blur-2xl border border-slate-800/80 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                  جدول عدد الزوار بالتفصيل وبالتاريخ اليومي
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  إحصائيات يومية مفصلة: الزوار الفريدون، إجمالي المشاهدات، نوع الجهاز، وأكثر الصفحات زيارة.
                </p>
              </div>
            </div>

            {(!visitors?.dailyStats || visitors.dailyStats.length === 0) ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                جارِ تجميع بيانات الزوار بالتواريخ...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-3 px-4 font-bold">التاريخ (Date)</th>
                      <th className="py-3 px-4 font-bold">الزوار الفريدون</th>
                      <th className="py-3 px-4 font-bold">عدد المشاهدات</th>
                      <th className="py-3 px-4 font-bold">الأجهزة (الهاتف / الحاسوب)</th>
                      <th className="py-3 px-4 font-bold">أكثر الصفحات زيارة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {visitors.dailyStats.map((day) => {
                      const totalD = day.mobileViews + day.desktopViews;
                      const mobilePct = totalD > 0 ? Math.round((day.mobileViews / totalD) * 100) : 0;

                      return (
                        <tr key={day.date} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                            {day.date}
                          </td>
                          <td className="py-3 px-4 font-mono font-black text-cyan-400">
                            {day.uniqueVisitors.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-200">
                            {day.totalViews.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono text-slate-400">
                                {mobilePct}% هاتف ({day.mobileViews})
                              </span>
                              <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-cyan-500 rounded-full"
                                  style={{ width: `${mobilePct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1.5">
                              {day.topRoutes.slice(0, 3).map((r, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 font-mono text-[10px] border border-slate-800"
                                >
                                  {r.route} <span className="text-cyan-400 font-bold">({r.count})</span>
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Live Hits Feed */}
          {visitors?.recentHits && visitors.recentHits.length > 0 && (
            <div className="p-6 rounded-3xl bg-[#0C1322]/80 backdrop-blur-2xl border border-slate-800/80 shadow-2xl space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                آخر الزيارات اللحظية المسجلة (Live Activity Feed)
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {visitors.recentHits.slice(0, 15).map((hit) => (
                  <div
                    key={hit.id}
                    className="p-2.5 rounded-xl bg-[#111A2E]/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded bg-slate-800 text-slate-400">
                        {hit.deviceType === "mobile" ? (
                          <Smartphone className="w-3.5 h-3.5" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5" />
                        )}
                      </span>
                      <span className="font-mono text-cyan-300 font-bold">{hit.path}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      {safeFormatTime(hit.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* TAB 5: دليل الطلاب وحالة الحسابات (Students Directory)              */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {activeTab === "students" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Search & Filter Header */}
          <div className="p-5 rounded-3xl bg-[#0C1322]/80 backdrop-blur-2xl border border-slate-800/80 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setStudentStatusFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  studentStatusFilter === "all"
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/50"
                    : "bg-[#111A2E] text-slate-400 border-slate-800"
                }`}
              >
                جميع الطلاب ({students.length})
              </button>
              <button
                onClick={() => setStudentStatusFilter("PAID")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  studentStatusFilter === "PAID"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                    : "bg-[#111A2E] text-slate-400 border-slate-800"
                }`}
              >
                المشتركون (PAID)
              </button>
              <button
                onClick={() => setStudentStatusFilter("TRIAL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  studentStatusFilter === "TRIAL"
                    ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/50"
                    : "bg-[#111A2E] text-slate-400 border-slate-800"
                }`}
              >
                تجربة (TRIAL)
              </button>
              <button
                onClick={() => setStudentStatusFilter("REJECTED")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  studentStatusFilter === "REJECTED"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                    : "bg-[#111A2E] text-slate-400 border-slate-800"
                }`}
              >
                مرفوض (REJECTED)
              </button>
            </div>

            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث بالاسم، الهاتف، البريد..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-[#111A2E] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Students Table */}
          <div className="p-6 rounded-3xl bg-[#0C1322]/80 backdrop-blur-2xl border border-slate-800/80 shadow-2xl">
            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                لا يوجد طلاب مطابقون لهذا البحث
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-3 px-4 font-bold">الطالب</th>
                      <th className="py-3 px-4 font-bold">معلومات الاتصال</th>
                      <th className="py-3 px-4 font-bold">الشعبة والولاية</th>
                      <th className="py-3 px-4 font-bold">حالة الحساب</th>
                      <th className="py-3 px-4 font-bold">تاريخ الانضمام</th>
                      <th className="py-3 px-4 font-bold text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-white block">{st.fullName || "طالب بدون اسم"}</span>
                          <span className="text-[10px] text-slate-500 font-mono">{st.id}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-slate-300 block">{st.studentPhone || "—"}</span>
                          <span className="text-[11px] text-slate-500">{st.email || "—"}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-semibold">
                            {st.streamId || "غير محدد"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {st.accessStatus === "PAID" ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                              ✓ مشترك (PAID)
                            </span>
                          ) : st.accessStatus === "REJECTED" ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                              ✕ مرفوض (REJECTED)
                            </span>
                          ) : st.accessStatus === "EXPIRED" ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold">
                              منتهي (EXPIRED)
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                              تجريبي (TRIAL)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {st.createdAt ? new Date(st.createdAt).toLocaleDateString("ar-DZ") : "—"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setDirectStudentId(st.id);
                              setShowDirectModal(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition-all"
                          >
                            تفعيل يدوي
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL 1: معاينة إيصال الدفع (Receipt Viewer)                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {previewReceiptUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setPreviewReceiptUrl(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-[#0C1322] border border-slate-700 rounded-3xl p-5 overflow-hidden shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-400" />
                معاينة وصل الدفع والتحويل (Receipt Preview)
              </h3>
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-auto rounded-2xl bg-black flex items-center justify-center p-2">
              <img
                src={previewReceiptUrl}
                alt="Receipt"
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <a
                href={previewReceiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح في نافذة كاملة</span>
              </a>
              <button
                onClick={() => setPreviewReceiptUrl(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL 2: تأكيد رفض الطلب مع السبب (Reject Reason Modal)             */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {rejectModalOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setRejectModalOrder(null)}
        >
          <div
            className="relative max-w-md w-full bg-[#0C1322] border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                تحديد سبب رفض طلب الاشتراك
              </h3>
              <button
                onClick={() => setRejectModalOrder(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              اختر السبب الدقيق لرفض طلب الطالب ({rejectModalOrder.studentName || rejectModalOrder.userId}).
              سيظهر هذا السبب مباشرة للطالب في حسابه ليتمكن من تصحيح الوصل وإعادة رفعه.
            </p>

            <div className="space-y-2">
              {[
                "إيصال غير واضح أو مقصوص",
                "المبلغ المدفوع غير مطابق لسعر الباقة",
                "رقم الحوالة مستعمل سابقاً أو مكرر",
                "اسم أو بيانات الحساب غير متطابقة",
                "أخرى (يرجى التحديد أدناه)",
              ].map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#111A2E] hover:bg-[#16223D] border border-slate-800 text-xs text-slate-200 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value={r}
                    checked={rejectReason === r}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="text-rose-500 focus:ring-0"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            {rejectReason === "أخرى (يرجى التحديد أدناه)" && (
              <textarea
                placeholder="اكتب سبب الرفض بالتفصيل هنا..."
                value={customRejectReason}
                onChange={(e) => setCustomRejectReason(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-[#111A2E] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
              />
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setRejectModalOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmRejectOrder}
                disabled={processingOrderId === rejectModalOrder.id}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {processingOrderId === rejectModalOrder.id ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <X className="w-3.5 h-3.5" />
                )}
                <span>تأكيد الرفض وإعلام الطالب</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MODAL 3: التفعيل اليدوي المباشر (Manual Direct Activation)           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showDirectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowDirectModal(false)}
        >
          <div
            className="relative max-w-md w-full bg-[#0C1322] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                تفعيل اشتراك يدوي مباشر لطالب
              </h3>
              <button
                onClick={() => setShowDirectModal(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDirectActivateStudent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  معرف الطالب (UUID أو البريد الإلكتروني أو الهاتف):
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: student@gmail.com أو UUID..."
                  value={directStudentId}
                  onChange={(e) => setDirectStudentId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111A2E] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">باقة الاشتراك:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDirectPlan("season")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      directPlan === "season"
                        ? "bg-emerald-600/20 text-emerald-300 border-emerald-500"
                        : "bg-[#111A2E] text-slate-400 border-slate-800"
                    }`}
                  >
                    Pass Saison (سنة كاملة)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirectPlan("monthly")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      directPlan === "monthly"
                        ? "bg-emerald-600/20 text-emerald-300 border-emerald-500"
                        : "bg-[#111A2E] text-slate-400 border-slate-800"
                    }`}
                  >
                    شهري (30 يوم)
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDirectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isActivatingDirect}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isActivatingDirect ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>تفعيل الحساب الآن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
