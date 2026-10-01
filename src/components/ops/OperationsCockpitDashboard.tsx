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
  ArrowLeft,
  RefreshCw,
  Sliders,
  Sparkles,
  TrendingUp,
  Clock,
  Download,
  Eye,
  Check,
  X,
  ExternalLink,
  Smartphone,
  Monitor,
  Tablet,
  Share2,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  Search,
  MessageCircle,
  Zap,
  BookOpen,
  Award,
  Target,
  Brain,
  ShieldAlert,
  Flame,
  ChevronRight,
  BarChart3,
  MapPin,
  School,
  Package,
  Truck,
  Printer,
  Phone,
  ShieldCheck,
  Send,
  Radio,
  Globe,
  DollarSign,
  FileText,
} from "lucide-react";
import {
  OperationsDashboardData,
  ExpiringSoonAlert,
  StalePendingAlert,
  DropoffAlert,
  ConversionFunnelStep,
} from "@/lib/operations/types";
import { opsFetch } from "@/lib/operations/client-api";

export function OperationsCockpitDashboard() {
  const [data, setData] = useState<OperationsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Orders Table Filters & Action State
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Shipping Modal State
  const [shippingModalOrder, setShippingModalOrder] = useState<any | null>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState("");
  const [carrierInput, setCarrierInput] = useState("Yalidine Express");

  // Active Alert Wall Tab
  const [activeAlertTab, setActiveAlertTab] = useState<"stale_pending" | "expiring_soon" | "dropoffs">("stale_pending");

  // Fetch Dashboard Data from Server API
  async function fetchDashboard(isManual = false) {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await opsFetch("/api/ops/dashboard");
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.data) {
          setData(json.data);
          setLastRefreshed(new Date());
        }
      }
    } catch (err) {
      console.error("Failed to load operations dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchDashboard(false);
    // Auto-refresh in background every 12 seconds
    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Quick Action Handlers for Live Orders
  async function handleOrderAction(orderId: string, action: string, params: Record<string, any> = {}) {
    setActionLoadingId(orderId);
    setActionToast(null);

    try {
      const res = await opsFetch("/api/ops/orders/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action, params }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setActionToast({ message: json.message || "تم تنفيذ الإجراء بنجاح", type: "success" });
        await fetchDashboard(true);
      } else {
        setActionToast({ message: json.error || "تعذر تنفيذ الإجراء", type: "error" });
      }
    } catch (err: any) {
      setActionToast({ message: err?.message || "فشل الاتصال بالخادم", type: "error" });
    } finally {
      setActionLoadingId(null);
    }
  }

  // Filtered Orders List
  const filteredOrders = useMemo(() => {
    const list = data?.orders || [];
    return list.filter((order: any) => {
      // 1. Status Filter
      if (orderStatusFilter === "PENDING" && order.status !== "PENDING") return false;
      if (orderStatusFilter === "SHIPPED" && order.shipment?.status !== "SHIPPED") return false;
      if (orderStatusFilter === "COD_PENDING" && order.payment?.status !== "COD") return false;
      if (orderStatusFilter === "PAID" && order.payment?.status !== "PAID") return false;
      if (orderStatusFilter === "ACTIVE" && order.subscription?.status !== "ACTIVE") return false;

      // 2. Search Query Filter
      if (!orderSearch.trim()) return true;
      const q = orderSearch.toLowerCase().trim();
      const num = (order.order_number || "").toLowerCase();
      const name = (order.student?.full_name || order.shipping_address?.full_name || "").toLowerCase();
      const phone = (order.student?.phone || order.shipping_address?.phone || "").toLowerCase();
      const wilaya = (order.shipping_address?.wilaya || "").toLowerCase();
      const commune = (order.shipping_address?.commune || "").toLowerCase();

      return num.includes(q) || name.includes(q) || phone.includes(q) || wilaya.includes(q) || commune.includes(q);
    });
  }, [data?.orders, orderStatusFilter, orderSearch]);

  const kpis = data?.kpis;
  const alerts = data?.alerts;
  const funnel = data?.funnel || [];
  const learning = data?.learning;
  const analytics = data?.analytics;
  const ordersSummary = data?.ordersSummary;

  const liveVisitorsCount = analytics?.liveVisitorsNow ?? kpis?.liveVisitors ?? 1;
  const todayVisitorsCount = analytics?.todayVisitors ?? kpis?.todayVisitors ?? 1;
  const totalOrdersCount = ordersSummary?.totalOrders ?? (data?.orders?.length || 0);

  return (
    <div dir="rtl" className="min-h-screen bg-[#080D1A] text-slate-100 p-3 sm:p-6 lg:p-8 space-y-6 font-sans antialiased">
      {/* Toast Notification */}
      {actionToast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-bold flex items-center gap-3 backdrop-blur-xl transition-all ${
            actionToast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500 text-emerald-200"
              : "bg-rose-950/90 border-rose-500 text-rose-200"
          }`}
        >
          {actionToast.type === "success" ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
          <span>{actionToast.message}</span>
          <button onClick={() => setActionToast(null)} className="opacity-70 hover:opacity-100 mr-2 text-xs">✕</button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 1. HEADER & CENTRAL PULSE BAR                                         */}
      {/* ===================================================================== */}
      <div className="rounded-3xl bg-[#0D1526]/90 backdrop-blur-2xl border border-[#1E293B] p-5 sm:p-6 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/20 shrink-0">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                قاعدة العمليات المركزية
              </h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                SHATER Operations Center
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>مباشر لحظي (Realtime Pulse)</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              المراقبة اللحظية لزوار الموقع، حركة الإعلانات، استلام وتجهيز طلبات العلب الورقية والـ COD، وتفعيل الاشتراكات.
            </p>
          </div>
        </div>

        {/* Quick Actions & Navigation */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          <div className="px-3 py-1.5 rounded-xl bg-[#10192E] border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>متصل الآن: </span>
            <strong className="text-emerald-400 font-bold text-sm">{liveVisitorsCount}</strong>
          </div>

          <Link
            href="/ops/payments"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold transition-all shadow-sm"
          >
            <CreditCard className="w-4 h-4" />
            <span>المدفوعات</span>
            {kpis && kpis.pendingOrdersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-black">
                {kpis.pendingOrdersCount}
              </span>
            )}
          </Link>

          <Link
            href="/ops/students"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#131D31] hover:bg-[#1E293B] border border-[#1E293B] text-slate-300 hover:text-white text-xs font-bold transition-all shadow-sm"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>سجل الطلاب</span>
          </Link>

          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#131D31] hover:bg-[#1E293B] border border-[#1E293B] text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            title="تحديث البيانات لحظياً"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. TOP EXECUTIVE METRIC CARDS (5 CARDS)                                */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric 1: Live Visitors Right Now */}
        <div className="rounded-3xl bg-[#0D1526]/90 backdrop-blur-xl border border-emerald-500/30 p-5 shadow-xl flex flex-col justify-between space-y-3 relative overflow-hidden group hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>الزوار الآن (Live Now)</span>
            </span>
            <Globe className="w-5 h-5 text-emerald-400" />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                {liveVisitorsCount}
              </span>
              <span className="text-xs text-slate-400">زائر متصل</span>
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-1">
              يتصفحون المنصة في هذه اللحظة
            </p>
          </div>

          <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>هواتف: {analytics?.deviceBreakdown?.mobile || 0}</span>
            <span>كمبيوتر: {analytics?.deviceBreakdown?.desktop || 0}</span>
          </div>
        </div>

        {/* Metric 2: Today's Unique Visitors */}
        <div className="rounded-3xl bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] p-5 shadow-xl flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-bold uppercase tracking-wider">زوار اليوم (Today)</span>
            <Users className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                {todayVisitorsCount}
              </span>
              <span className="text-xs text-slate-400">زائر فريد</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              إجمالي المشاهدات: <strong className="text-cyan-300 font-mono">{analytics?.todayPageviews || todayVisitorsCount}</strong>
            </p>
          </div>

          <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>جلسات: {analytics?.todaySessions || todayVisitorsCount}</span>
            <span>حملات: {analytics?.topSources?.[0]?.source || "Direct"}</span>
          </div>
        </div>

        {/* Metric 3: Orders Queue & Pending COD */}
        <div
          className={`rounded-3xl backdrop-blur-xl border p-5 shadow-xl flex flex-col justify-between space-y-3 transition-all ${
            kpis && kpis.pendingOrdersCount > 0
              ? "bg-amber-950/20 border-amber-500/50 hover:border-amber-400"
              : "bg-[#0D1526]/90 border-[#1E293B] hover:border-amber-500/30"
          }`}
        >
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase tracking-wider">الطلبات المعلقة (Orders)</span>
            <Package className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                {kpis ? kpis.pendingOrdersCount : 0}
              </span>
              <span className="text-xs text-slate-400">طلب قيد المعالجة</span>
            </div>
            <p className="text-[11px] text-amber-300 font-mono mt-1">
              بقيمة: <strong>{kpis ? kpis.pendingOrdersRevenue.toLocaleString() : "0"} دج</strong>
            </p>
          </div>

          <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>إجمالي الطلبات: {totalOrdersCount}</span>
            <span>توصيل COD: {ordersSummary?.codPending || 0}</span>
          </div>
        </div>

        {/* Metric 4: Revenue Today & Total */}
        <div className="rounded-3xl bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] p-5 shadow-xl flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">الإيرادات (Revenue)</span>
            <CreditCard className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
                +{kpis ? kpis.todayRevenue.toLocaleString() : "0"}
              </span>
              <span className="text-xs text-slate-400 font-bold">دج اليوم</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              المجموع: <strong className="text-white font-mono">{kpis ? kpis.totalRevenue.toLocaleString() : "0"} دج</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>الأسبوع: {kpis ? kpis.weekRevenue.toLocaleString() : "0"} دج</span>
            <span>الشهر: {kpis ? kpis.monthRevenue.toLocaleString() : "0"} دج</span>
          </div>
        </div>

        {/* Metric 5: Total Registered Students */}
        <div className="rounded-3xl bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] p-5 shadow-xl flex flex-col justify-between space-y-3 hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-bold uppercase tracking-wider">الطلاب المسجلون</span>
            <GraduationCap className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                {kpis ? kpis.totalStudents : 0}
              </span>
              <span className="text-xs text-slate-400">تلميذ</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                <div className="bg-emerald-500 h-full" style={{ width: `${kpis?.paidRatio || 0}%` }} title={`PAID: ${kpis?.paidStudents || 0}`} />
                <div className="bg-blue-500 h-full" style={{ width: `${kpis && kpis.totalStudents > 0 ? Math.round((kpis.trialStudents / kpis.totalStudents) * 100) : 0}%` }} />
                <div className="bg-rose-500 h-full" style={{ width: `${kpis && kpis.totalStudents > 0 ? Math.round((kpis.expiredStudents / kpis.totalStudents) * 100) : 0}%` }} />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono">
            <span className="text-emerald-400 font-bold">PAID: {kpis?.paidStudents || 0}</span>
            <span className="text-blue-400 font-bold">TRIAL: {kpis?.trialStudents || 0}</span>
            <span className="text-rose-400 font-bold">EXP: {kpis?.expiredStudents || 0}</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. SECTION: LIVE ORDERS & COD FULFILLMENT QUEUE (NEWEST ORDERS FIRST) */}
      {/* ===================================================================== */}
      <div className="rounded-3xl bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  جدول الطلبات المباشرة والطرود (Live COD Orders Queue)
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold border border-amber-500/30">
                  {filteredOrders.length} طلب
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تظهر هنا فوراً كل الطلبات المسجلة على الموقع مع بيانات التلميذ والولاية، وإجراءات طباعة الملصق وتأكيد الدفع والتفعيل.
              </p>
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث بالاسم، الهاتف، الولاية..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full pl-3 pr-9 py-2 bg-[#10192E] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#10192E] border border-slate-800 rounded-xl text-xs">
              {[
                { id: "ALL", label: "الكل" },
                { id: "PENDING", label: "قيد المراجعة" },
                { id: "SHIPPED", label: "تم الشحن" },
                { id: "COD_PENDING", label: "بانتظار التحصيل" },
                { id: "PAID", label: "تم الدفع" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOrderStatusFilter(tab.id)}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all ${
                    orderStatusFilter === tab.id
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Orders Table */}
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center bg-[#10192E]/60 rounded-2xl border border-slate-800/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto text-slate-400">
              <Package className="w-6 h-6" />
            </div>
            <div className="text-sm font-bold text-slate-200">لا توجد طلبات تطابق هذا الفلتر</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              عندما يسجل أي زائر طلباً جديداً عبر صفحة الاشتراك (COD)، سيظهر هنا فوراً وبشكل لحظي.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] text-slate-400 font-semibold text-[11px] bg-[#10192E]/40">
                  <th className="py-3 px-3">رقم الطلب / التاريخ</th>
                  <th className="py-3 px-3">بيانات التلميذ والولي</th>
                  <th className="py-3 px-3">الولاية والعنوان</th>
                  <th className="py-3 px-3">الخطة والمبلغ</th>
                  <th className="py-3 px-3">حالة الشحن والتوصيل</th>
                  <th className="py-3 px-3">حالة الدفع</th>
                  <th className="py-3 px-3">الاشتراك</th>
                  <th className="py-3 px-3 text-center">الإجراءات التشغيلية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {filteredOrders.map((order: any) => {
                  const isActionLoading = actionLoadingId === order.id;
                  const phone = order.student?.phone || order.shipping_address?.phone || "";
                  const cleanPhone = phone.replace(/^0/, "");
                  const fullName = order.student?.full_name || order.shipping_address?.full_name || "تلميذ مسجل";
                  const wilaya = order.shipping_address?.wilaya || "غير محددة";
                  const commune = order.shipping_address?.commune || "";
                  const planName = order.plan?.name || (order.plan?.id === "monthly" ? "الاشتراك الشهري" : "اشتراك الموسم الدراسي");
                  const price = Number(order.amount || order.plan?.price || 4900);
                  const isShipped = order.shipment?.status === "SHIPPED";
                  const isDelivered = order.shipment?.status === "DELIVERED";
                  const isPaid = order.payment?.status === "PAID";
                  const isActive = order.subscription?.status === "ACTIVE";

                  return (
                    <tr key={order.id} className="hover:bg-[#131D31]/40 transition-colors">
                      {/* Order Number & Date */}
                      <td className="py-3.5 px-3">
                        <div className="font-mono font-bold text-white text-[12px] flex items-center gap-1.5">
                          <span>{order.order_number || order.id.slice(0, 8)}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {new Date(order.created_at).toLocaleDateString("ar-DZ")} {new Date(order.created_at).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </td>

                      {/* Customer Full Name & Phone */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-200">{fullName}</div>
                        {phone ? (
                          <div className="flex items-center gap-2 mt-1 font-mono text-[11px]">
                            <a
                              href={`tel:${phone}`}
                              className="text-cyan-400 hover:underline flex items-center gap-1"
                              title="اتصال هاتفي"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{phone}</span>
                            </a>
                            <a
                              href={`https://wa.me/213${cleanPhone}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-400 hover:text-emerald-300"
                              title="محادثة واتساب"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[10px]">لا يوجد هاتف</span>
                        )}
                      </td>

                      {/* Wilaya & Address */}
                      <td className="py-3.5 px-3 max-w-[200px]">
                        <div className="font-semibold text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                          <span className="truncate">{wilaya} {commune ? `— ${commune}` : ""}</span>
                        </div>
                        {order.shipping_address?.address && (
                          <div className="text-[10px] text-slate-400 truncate mt-0.5">
                            {order.shipping_address.address}
                          </div>
                        )}
                      </td>

                      {/* Plan & Amount */}
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-indigo-300 truncate max-w-[140px]">{planName}</div>
                        <div className="text-xs font-mono font-bold text-emerald-400 mt-0.5">
                          {price.toLocaleString()} دج
                        </div>
                      </td>

                      {/* Shipment Status */}
                      <td className="py-3.5 px-3">
                        {isDelivered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>تم التسليم</span>
                          </span>
                        ) : isShipped ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-950/60 border border-blue-500/40 text-blue-300 font-bold text-[10px]">
                              <Truck className="w-3 h-3" />
                              <span>تم الشحن</span>
                            </span>
                            {order.shipment?.tracking_number && (
                              <div className="text-[9px] font-mono text-slate-400">
                                تتبع: {order.shipment.tracking_number}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold text-[10px]">
                            <Clock className="w-3 h-3" />
                            <span>قيد التجهيز</span>
                          </span>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-3">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-bold text-[10px] border border-emerald-500/30">
                            <Check className="w-3 h-3" />
                            <span>مدفوع نقداً</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono font-bold text-[10px] border border-amber-500/30">
                            <span>COD بانتظار الدفع</span>
                          </span>
                        )}
                      </td>

                      {/* Subscription Status */}
                      <td className="py-3.5 px-3">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                            <ShieldCheck className="w-3 h-3" />
                            <span>مفعل (PAID)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold text-[10px]">
                            <span>معلق</span>
                          </span>
                        )}
                      </td>

                      {/* Operational Actions */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Print Kit Label */}
                          <Link
                            href={`/admin/orders/${order.id}/kit`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition-colors"
                            title="طباعة وصل العلبة والملصق"
                          >
                            <Printer className="w-4 h-4" />
                          </Link>

                          {/* Mark Shipped Button */}
                          {!isShipped && !isDelivered && (
                            <button
                              onClick={() => {
                                setShippingModalOrder(order);
                                setTrackingNumberInput(order.shipment?.tracking_number || "");
                              }}
                              disabled={isActionLoading}
                              className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/40 text-[11px] font-bold transition-all disabled:opacity-50"
                              title="تسجيل الشحن وإضافة رقم التتبع"
                            >
                              شحن
                            </button>
                          )}

                          {/* Mark Delivered Button */}
                          {isShipped && !isDelivered && (
                            <button
                              onClick={() => handleOrderAction(order.id, "MARK_DELIVERED")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1 rounded-lg bg-teal-600/20 hover:bg-teal-600/40 text-teal-300 border border-teal-500/40 text-[11px] font-bold transition-all disabled:opacity-50"
                              title="تأكيد تسليم الطرد للطالب"
                            >
                              تسليم
                            </button>
                          )}

                          {/* Confirm Cash Paid */}
                          {!isPaid && (
                            <button
                              onClick={() => handleOrderAction(order.id, "MARK_COD_PAID")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-sm disabled:opacity-50"
                              title="تأكيد استلام المبلغ نقداً (Payment = PAID)"
                            >
                              تأكيد الدفع
                            </button>
                          )}

                          {/* Activate Subscription */}
                          {!isActive && (
                            <button
                              onClick={() => handleOrderAction(order.id, "ACTIVATE_SUBSCRIPTION")}
                              disabled={isActionLoading}
                              className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold transition-all shadow-sm disabled:opacity-50"
                              title="تفعيل حساب واشتراك التلميذ"
                            >
                              تفعيل
                            </button>
                          )}
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

      {/* ===================================================================== */}
      {/* 4. SECTION: LIVE TRAFFIC & REAL VISITOR ANALYTICS                     */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sub-card 1: Real Live Sessions Deck (Col 6) */}
        <div className="lg:col-span-6 rounded-3xl bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 text-cyan-400">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>الجلسات المباشرة الآن (Active Sessions)</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30">
              {analytics?.activeSessions?.length || 1} متصل
            </span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {(!analytics?.activeSessions || analytics.activeSessions.length === 0) ? (
              <div className="p-4 rounded-xl bg-[#10192E] text-center text-xs text-slate-400">
                جاري رصد حركة الزوار من محركات البحث وشبكات التواصل...
              </div>
            ) : (
              analytics.activeSessions.map((s: any, idx: number) => (
                <div
                  key={s.sessionId || idx}
                  className="p-3 rounded-xl bg-[#10192E]/70 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <div className="min-w-0">
                      <div className="font-mono text-slate-200 truncate">{s.path || "/"}</div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                        <span>{s.utmSource || s.referrer ? "إعلان / إحالة" : "Direct / زيارة مباشرة"}</span>
                        {s.wilaya && <span>• {s.wilaya}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300">
                      {s.deviceType === "mobile" ? "📱 هاتف" : "💻 كمبيوتر"}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {s.pageviewsCount} ص
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sub-card 2: Algerian Wilayas Traffic Leaderboard (Col 6) */}
        <div className="lg:col-span-6 rounded-3xl bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 text-purple-400">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>توزيع الزوار حسب الولايات الجزائرية (Wilayas)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">58 ولاية</span>
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {(!analytics?.topWilayas || analytics.topWilayas.length === 0) ? (
              <div className="p-4 rounded-xl bg-[#10192E] text-center text-xs text-slate-400">
                الزيارات تتوزع تلقائياً بناءً على بيانات التوصيل والتسجيل الجغرافي.
              </div>
            ) : (
              analytics.topWilayas.map((w: any, idx: number) => {
                const total = analytics.todayVisitors || 1;
                const pct = Math.min(100, Math.round((w.count / total) * 100));

                return (
                  <div key={w.wilaya || idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{w.wilaya}</span>
                      <span className="font-mono text-slate-400 text-[11px]">
                        {w.count} زيارة ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. ROW 3: STUDENT JOURNEY & CONVERSION FUNNEL (قمع التحويل السلوكي)     */}
      {/* ===================================================================== */}
      <div className="rounded-3xl bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>قمع التحويل ومسار الطالب (Telemetry & Conversion Funnel)</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Observable Real Evidence
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تتبع انسياب الزائر خطوة بخطوة من وصول الإعلان حتى إنشاء الطلب وتأكيد الدفع والتفعيل (PAID).
              </p>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-[#10192E] px-3 py-1.5 rounded-xl border border-slate-800">
            معدل التحويل الكلي (End-to-End):{" "}
            <strong className="text-cyan-400 text-sm">
              {funnel.length > 0 && funnel[0].count > 0
                ? `${Math.round(((funnel[funnel.length - 1]?.count || 0) / funnel[0].count) * 100)}%`
                : "0%"}
            </strong>
          </div>
        </div>

        {/* The Funnel Step Visualizer */}
        <div className="space-y-3 pt-1">
          {funnel.map((step, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === funnel.length - 1;

            return (
              <div
                key={step.id}
                className="p-3.5 rounded-2xl bg-[#10192E]/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-300 flex items-center justify-center font-bold text-[11px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white text-sm">{step.label}</span>
                    <span className="text-[11px] font-mono text-slate-400">({step.id})</span>
                  </div>

                  <div className="flex items-center gap-4 font-mono text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px]">العدد: </span>
                      <strong className="text-white text-sm">{step.count.toLocaleString()}</strong>
                    </div>

                    <div className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-bold">
                      {step.percentageOfTotal}% من الزوار
                    </div>

                    {!isFirst && (
                      <div className="text-slate-400 text-[11px]">
                        تحويل مرحلي:{" "}
                        <span className={`font-bold ${step.percentageOfPrevious >= 70 ? "text-emerald-400" : "text-amber-400"}`}>
                          {step.percentageOfPrevious}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar of Step */}
                <div className="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800 flex">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isLast
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30"
                        : "bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-400"
                    }`}
                    style={{ width: `${step.percentageOfTotal > 0 ? Math.max(2, step.percentageOfTotal) : 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 6. MODAL: MARK SHIPPED & ADD TRACKING NUMBER                           */}
      {/* ===================================================================== */}
      {shippingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D1526] border border-[#1E293B] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-base">
                <Truck className="w-5 h-5 text-blue-400" />
                <span>تأكيد شحن الطرد وإضافة التتبع</span>
              </div>
              <button
                onClick={() => setShippingModalOrder(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400">الطلب: </span>
                <strong className="text-white font-mono">{shippingModalOrder.order_number}</strong>
                <span className="text-slate-400 mr-2">— {shippingModalOrder.student?.full_name}</span>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">شركة التوصيل:</label>
                <input
                  type="text"
                  value={carrierInput}
                  onChange={(e) => setCarrierInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#10192E] border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">رقم التتبع (Tracking Number):</label>
                <input
                  type="text"
                  placeholder="مثال: YAL-10029384"
                  value={trackingNumberInput}
                  onChange={(e) => setTrackingNumberInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#10192E] border border-slate-800 rounded-xl text-white text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#1E293B]">
              <button
                onClick={async () => {
                  const ordId = shippingModalOrder.id;
                  setShippingModalOrder(null);
                  await handleOrderAction(ordId, "MARK_SHIPPED", {
                    carrier: carrierInput,
                    trackingNumber: trackingNumberInput,
                  });
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/30"
              >
                تأكيد الشحن الفوري
              </button>
              <button
                onClick={() => setShippingModalOrder(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
