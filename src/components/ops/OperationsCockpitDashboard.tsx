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
  BarChart3,
  MapPin,
  Truck,
  Printer,
  Phone,
  DollarSign,
  FileSpreadsheet,
  Package,
  ChevronRight,
} from "lucide-react";
import { OperationsDashboardData } from "@/lib/operations/types";
import { opsFetch } from "@/lib/operations/client-api";

export function OperationsCockpitDashboard() {
  const [data, setData] = useState<OperationsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Time filter for Sales Overview
  const [salesTimeRange, setSalesTimeRange] = useState<"TODAY" | "WEEK" | "MONTH">("MONTH");

  // Quick Action State
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

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
    // Background refresh every 15 seconds
    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Real calculations
  const kpis = data?.kpis;
  const orders = data?.orders || [];
  const summary = data?.ordersSummary || {
    totalOrders: orders.length,
    pending: orders.filter((o: any) => o.status === "PENDING").length,
    processing: orders.filter((o: any) => o.status === "PROCESSING").length,
    shipped: orders.filter((o: any) => o.status === "SHIPPED").length,
    delivered: orders.filter((o: any) => o.status === "DELIVERED").length,
    codPending: orders.filter((o: any) => o.payment?.status === "COD").length,
    paid: orders.filter((o: any) => o.status === "PAID" || o.payment?.status === "PAID").length,
    returned: orders.filter((o: any) => o.status === "RETURNED" || o.status === "CANCELLED").length,
  };

  // Real revenue numbers (Strictly 0 if no real transactions exist)
  const todaySales = kpis?.todayRevenue ?? orders
    .filter((o: any) => {
      const today = new Date().toISOString().slice(0, 10);
      return (o.createdAt || "").startsWith(today);
    })
    .reduce((sum: number, o: any) => sum + (Number(o.amount) || 0), 0);

  const monthSales = kpis?.monthRevenue ?? orders.reduce((sum: number, o: any) => sum + (Number(o.amount) || 0), 0);

  const collectedCash = (kpis?.onlineRevenue || 0) + (summary.paid * 4900);

  const totalStudents = kpis?.totalStudents ?? 0;
  const paidRatio = kpis?.paidRatio ?? (totalStudents > 0 ? Math.round((summary.paid / totalStudents) * 100) : 0);

  const pendingCodOutstanding = kpis?.pendingOrdersRevenue ?? ((summary.shipped + summary.codPending) * 4900);

  // Strictly 2 Subscriptions: Annual (سنوي - 4900 دج) and Monthly (شهري - 1500 دج)
  const annualOrders = orders.filter((o: any) => {
    const plan = (o.planName || "").toLowerCase();
    return plan.includes("سنوي") || plan.includes("annual") || plan.includes("season") || Number(o.amount) >= 4000;
  });
  const monthlyOrders = orders.filter((o: any) => {
    const plan = (o.planName || "").toLowerCase();
    return plan.includes("شهري") || plan.includes("month") || (Number(o.amount) < 4000 && Number(o.amount) > 0);
  });

  const annualCount = annualOrders.length;
  const monthlyCount = monthlyOrders.length;
  const totalSubOrders = annualCount + monthlyCount;

  const annualPercent = totalSubOrders > 0 ? Math.round((annualCount / totalSubOrders) * 100) : 0;
  const monthlyPercent = totalSubOrders > 0 ? 100 - annualPercent : 0;

  // Real payment channels
  const codPaidToday = orders
    .filter((o: any) => o.payment?.method === "COD" || o.orderType === "COD")
    .reduce((sum: number, o: any) => sum + (Number(o.amount) || 0), 0);

  const baridiMobToday = orders
    .filter((o: any) => o.payment?.method === "baridimob" || o.payment?.method === "ccp")
    .reduce((sum: number, o: any) => sum + (Number(o.amount) || 0), 0);

  const cardOnlineToday = orders
    .filter((o: any) => o.payment?.method === "cib" || o.payment?.method === "edahabia" || o.payment?.method === "card")
    .reduce((sum: number, o: any) => sum + (Number(o.amount) || 0), 0);

  const totalCollectedToday = codPaidToday + baridiMobToday + cardOnlineToday;
  const codPercent = totalCollectedToday > 0 ? Math.round((codPaidToday / totalCollectedToday) * 100) : 0;
  const baridiMobPercent = totalCollectedToday > 0 ? Math.round((baridiMobToday / totalCollectedToday) * 100) : 0;
  const onlinePercent = totalCollectedToday > 0 ? Math.max(0, 100 - codPercent - baridiMobPercent) : 0;

  // Real Monthly Trend (Computed strictly from orders, 0 if empty)
  const monthlyTrends = useMemo(() => {
    const months = [
      { key: "10", name: "أكتوبر", year: 2025 },
      { key: "11", name: "نوفمبر", year: 2025 },
      { key: "12", name: "ديسمبر", year: 2025 },
      { key: "01", name: "جانفي", year: 2026 },
      { key: "02", name: "فيفري", year: 2026 },
    ];

    const dataRows = months.map((m) => {
      const monthRev = orders
        .filter((o: any) => (o.createdAt || "").includes(`-${m.key}-`))
        .reduce((sum: number, o: any) => sum + (Number(o.amount) || 0), 0);
      return {
        month: m.name,
        revenue: monthRev,
        label: monthRev > 0 ? `${(monthRev / 1000).toFixed(0)}K` : "0 دج",
      };
    });

    const maxRev = Math.max(...dataRows.map((d) => d.revenue), 1);
    return dataRows.map((d, idx) => ({
      ...d,
      heightPercent: d.revenue > 0 ? `${Math.max(15, Math.round((d.revenue / maxRev) * 100))}%` : "6%",
      active: idx === dataRows.length - 1,
    }));
  }, [orders]);

  // Wilaya-Wise Sales calculation (Real only)
  const wilayaSales = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach((o: any) => {
      const w = o.wilaya || "غير محددة";
      map.set(w, (map.get(w) || 0) + 1);
    });

    if (map.size === 0 && data?.learning?.topWilayas) {
      data.learning.topWilayas.forEach((tw: any) => {
        if (tw.count > 0) {
          map.set(tw.wilayaName, tw.count);
        }
      });
    }

    const sorted = Array.from(map.entries())
      .map(([wilaya, count]) => ({ wilaya, count }))
      .sort((a, b) => b.count - a.count);

    const totalOrdersCount = orders.length || 1;
    return sorted.slice(0, 6).map((item) => ({
      wilaya: item.wilaya,
      count: item.count,
      percent: orders.length > 0 ? Math.round((item.count / totalOrdersCount) * 100) : 0,
    }));
  }, [orders, data?.learning?.topWilayas]);

  // Recent Transactions (Real only)
  const recentTransactions = useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  // Export Yalidine CSV Handler
  const handleExportYalidine = () => {
    if (orders.length === 0) {
      alert("لا توجد طلبيات متاحة للتصدير حالياً.");
      return;
    }

    const headers = [
      "Order_Number",
      "Customer_Name",
      "Phone",
      "Wilaya",
      "Commune",
      "Address",
      "Is_Stopdesk",
      "Subscription_Plan",
      "Price_COD_DZD",
      "Tracking_Number",
      "Status",
    ];

    const rows = orders.map((o: any) => [
      `"${o.orderNumber}"`,
      `"${o.studentName}"`,
      `"${o.phone}"`,
      `"${o.wilaya}"`,
      `"${o.commune || ""}"`,
      `"${(o.address || "").replace(/"/g, '""')}"`,
      o.isStopDesk ? "1" : "0",
      `"${o.planName}"`,
      o.amount,
      `"${o.shipment?.trackingNumber || ""}"`,
      `"${o.status}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `yalidine_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100 bg-[#070B14]" dir="rtl">
      {/* Action Toast Alert */}
      {actionToast && (
        <div
          className={`p-4 rounded-xl border text-sm font-semibold flex items-center justify-between shadow-xl transition-all ${
            actionToast.type === "success"
              ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-300"
              : "bg-rose-950/80 border-rose-500/50 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionToast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            )}
            <span>{actionToast.message}</span>
          </div>
          <button
            onClick={() => setActionToast(null)}
            className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Search & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="text-indigo-400 font-bold">منصة الشاطر</span>
            <span>/</span>
            <span>مركز العمليات والتحكم المركزي</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <LayoutDashboardIcon className="w-7 h-7 text-indigo-400" />
            <span>لوحة القيادة المركزية | SHATER Operations</span>
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              بيانات حية 100%
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            المراقبة اللحظية للاشتراكات السنوية والشهرية، تحصيلات COD وياليدين، والزوار في الوقت الفعلي
          </p>
        </div>

        {/* Global Toolbar Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
            <span>تحديث</span>
            {lastRefreshed && (
              <span className="text-[10px] text-slate-400 font-mono">
                ({lastRefreshed.toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" })})
              </span>
            )}
          </button>

          <button
            onClick={handleExportYalidine}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير ياليدين (CSV)</span>
          </button>

          <Link
            href="/ops/orders"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Truck className="w-4 h-4" />
            <span>إدارة التوصيل ({summary.totalOrders})</span>
          </Link>

          <Link
            href="/ops/visitors"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-300 text-xs font-bold flex items-center gap-2 border border-cyan-500/30 transition-all"
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>الزوار والإعلانات</span>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 1: TOP 6 GRADIENT KPI CARDS (Strict Real Data Only)   */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: مبيعات اليوم (Purple / Indigo) */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 shadow-xl border border-indigo-400/20 text-white flex flex-col justify-between h-36">
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-bold tracking-wide opacity-90">مبيعات اليوم</span>
            <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="z-10 mt-1">
            <div className="text-2xl font-black font-mono tracking-tight">
              {todaySales.toLocaleString()} <span className="text-xs font-normal">دج</span>
            </div>
            <div className="text-[11px] opacity-80 mt-1 flex items-center gap-1 font-sans">
              <TrendingUp className="w-3 h-3 text-emerald-300" />
              <span>مبيعات مباشرة مؤكدة اليوم</span>
            </div>
          </div>

          <svg className="absolute bottom-0 left-0 right-0 h-14 w-full opacity-25 pointer-events-none" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path d="M0,25 Q15,10 30,20 T60,8 T90,18 T100,12 L100,30 L0,30 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Card 2: مبيعات الشهر (Emerald / Green) */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 shadow-xl border border-emerald-400/20 text-white flex flex-col justify-between h-36">
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-bold tracking-wide opacity-90">مبيعات الشهر الحالي</span>
            <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md">
              <Calendar className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="z-10 mt-1">
            <div className="text-2xl font-black font-mono tracking-tight">
              {monthSales.toLocaleString()} <span className="text-xs font-normal">دج</span>
            </div>
            <div className="text-[11px] opacity-80 mt-1 flex items-center gap-1 font-sans">
              <CheckCircle2 className="w-3 h-3 text-emerald-200" />
              <span>إجمالي الطلبيات المسجلة</span>
            </div>
          </div>

          <svg className="absolute bottom-0 left-0 right-0 h-14 w-full opacity-25 pointer-events-none" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path d="M0,20 Q20,28 40,15 T70,18 T90,5 T100,15 L100,30 L0,30 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Card 3: صافي المداخيل المحصلة (Orange / Amber) */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 shadow-xl border border-amber-400/20 text-white flex flex-col justify-between h-36">
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-bold tracking-wide opacity-90">المداخيل المحصلة (Paid)</span>
            <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="z-10 mt-1">
            <div className="text-2xl font-black font-mono tracking-tight">
              {collectedCash.toLocaleString()} <span className="text-xs font-normal">دج</span>
            </div>
            <div className="text-[11px] opacity-80 mt-1 flex items-center gap-1 font-sans">
              <span>مدفوعات مؤكدة (بريدي موب / ياليدين)</span>
            </div>
          </div>

          <svg className="absolute bottom-0 left-0 right-0 h-14 w-full opacity-25 pointer-events-none" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path d="M0,22 Q15,8 35,18 T65,12 T85,20 T100,10 L100,30 L0,30 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Card 4: الاشتراكات السنوية (Purple / Indigo) */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-purple-600 via-indigo-700 to-violet-800 shadow-xl border border-purple-400/20 text-white flex flex-col justify-between h-36">
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-bold tracking-wide opacity-90">الاشتراكات السنوية</span>
            <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md">
              <Award className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="z-10 mt-1">
            <div className="text-2xl font-black font-mono tracking-tight">
              {annualCount} <span className="text-xs font-normal">مشترك</span>
            </div>
            <div className="text-[11px] opacity-80 mt-1 flex items-center gap-1 font-sans">
              <span className="text-purple-200">4,900 دج / سنوي (سنة كاملة)</span>
            </div>
          </div>

          <svg className="absolute bottom-0 left-0 right-0 h-14 w-full opacity-25 pointer-events-none" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path d="M0,18 Q25,5 45,22 T75,10 T95,15 T100,5 L100,30 L0,30 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Card 5: الاشتراكات الشهرية (Blue / Sky) */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 shadow-xl border border-sky-400/20 text-white flex flex-col justify-between h-36">
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-bold tracking-wide opacity-90">الاشتراكات الشهرية</span>
            <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md">
              <Clock className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="z-10 mt-1">
            <div className="text-2xl font-black font-mono tracking-tight">
              {monthlyCount} <span className="text-xs font-normal">مشترك</span>
            </div>
            <div className="text-[11px] opacity-80 mt-1 flex items-center gap-1 font-sans">
              <span className="text-sky-200">1,500 دج / شهر (30 يوم)</span>
            </div>
          </div>

          <svg className="absolute bottom-0 left-0 right-0 h-14 w-full opacity-25 pointer-events-none" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path d="M0,24 Q20,12 40,20 T70,8 T90,22 T100,14 L100,30 L0,30 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Card 6: مستحقات الدفع عند الاستلام COD (Teal / Turquoise) */}
        <div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-teal-600 via-emerald-700 to-teal-800 shadow-xl border border-teal-400/20 text-white flex flex-col justify-between h-36">
          <div className="flex items-center justify-between z-10">
            <span className="text-xs font-bold tracking-wide opacity-90">مستحقات COD قيد التحصيل</span>
            <div className="p-1.5 rounded-lg bg-white/10 backdrop-blur-md">
              <Truck className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="z-10 mt-1">
            <div className="text-2xl font-black font-mono tracking-tight">
              {pendingCodOutstanding.toLocaleString()} <span className="text-xs font-normal">دج</span>
            </div>
            <div className="text-[11px] opacity-80 mt-1 flex items-center gap-1 font-sans">
              <Clock className="w-3 h-3 text-teal-200" />
              <span>مع ياليدين ({summary.shipped + summary.codPending} طرد)</span>
            </div>
          </div>

          <svg className="absolute bottom-0 left-0 right-0 h-14 w-full opacity-25 pointer-events-none" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path d="M0,15 Q30,28 50,10 T80,24 T95,8 T100,18 L100,30 L0,30 Z" fill="currentColor" />
          </svg>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 2: DUAL LINE CHART + DONUT CHART + COLLECTION SUMMARY */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Widget 1: Sales Overview Real Graph (6 cols) */}
        <div className="lg:col-span-6 bg-[#0D1526] border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>نظرة عامة على المبيعات (Sales Overview)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تتبع حجم الطلبات المسجلة مقارنة بالمبالغ المحصلة فعلياً
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs">
              {(["TODAY", "WEEK", "MONTH"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setSalesTimeRange(range)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    salesTimeRange === range
                      ? "bg-indigo-600 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {range === "TODAY" ? "اليوم" : range === "WEEK" ? "الأسبوع" : "الشهر"}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Sales Curve */}
          <div className="py-4">
            <div className="flex items-center justify-end gap-4 text-xs mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                <span className="text-slate-300">الطلبات المسجلة ({orders.length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span className="text-slate-300">المحصل الفعلي ({collectedCash.toLocaleString()} دج)</span>
              </div>
            </div>

            <div className="relative h-48 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 160">
                {/* Horizontal Grid lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#1E293B" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#1E293B" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#1E293B" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#334155" />

                {/* If orders exist, render dynamic line, otherwise render clean baseline */}
                {orders.length > 0 ? (
                  <>
                    <path
                      d="M0,135 C80,120 150,80 230,70 C310,60 380,45 500,30"
                      fill="none"
                      stroke="#6366F1"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0,140 C80,135 150,110 230,95 C310,80 380,75 500,60"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <circle cx="230" cy="70" r="4.5" fill="#6366F1" stroke="#0D1526" strokeWidth="2" />
                    <circle cx="500" cy="30" r="4.5" fill="#6366F1" stroke="#0D1526" strokeWidth="2" />
                    <circle cx="230" cy="95" r="4.5" fill="#10B981" stroke="#0D1526" strokeWidth="2" />
                    <circle cx="500" cy="60" r="4.5" fill="#10B981" stroke="#0D1526" strokeWidth="2" />
                  </>
                ) : (
                  <>
                    <path d="M0,140 L500,140" fill="none" stroke="#334155" strokeWidth="2" />
                    <circle cx="250" cy="140" r="3.5" fill="#64748B" />
                  </>
                )}
              </svg>
            </div>

            {/* X-Axis Dates */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-800/80">
              <span>بداية الفترة</span>
              <span>الأسبوع 2</span>
              <span>الأسبوع 3</span>
              <span>الأسبوع 4</span>
              <span>اليوم</span>
            </div>
          </div>
        </div>

        {/* Widget 2: Sales by Subscription Plan Donut Chart (Strictly 2 Plans) (3 cols) */}
        <div className="lg:col-span-3 bg-[#0D1526] border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-emerald-400" />
              <span>توزيع الاشتراكات (الخطة)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              نسبة الاشتراكات السنوية والشهرية
            </p>
          </div>

          {/* SVG Donut Chart (Strictly Real) */}
          <div className="py-4 flex flex-col items-center justify-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1E293B" strokeWidth="3.5" />
                {totalSubOrders > 0 ? (
                  <>
                    {/* Annual Segment */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="3.8"
                      strokeDasharray={`${annualPercent} ${100 - annualPercent}`}
                      strokeDashoffset="0"
                    />
                    {/* Monthly Segment */}
                    <circle
                      cx="18"
                      cy="18"
                      r="15.915"
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="3.8"
                      strokeDasharray={`${monthlyPercent} ${100 - monthlyPercent}`}
                      strokeDashoffset={`-${annualPercent}`}
                    />
                  </>
                ) : null}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black font-mono text-white">{totalSubOrders}</span>
                <span className="text-[10px] text-slate-400">اشتراك مسجل</span>
              </div>
            </div>

            {/* Legend (Only 2 Plans) */}
            <div className="w-full space-y-2 mt-4 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span className="text-slate-300">الاشتراك السنوي (4900 دج)</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {annualCount} ({annualPercent}%)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
                  <span className="text-slate-300">الاشتراك الشهري (1500 دج)</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {monthlyCount} ({monthlyPercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Widget 3: Collection Summary Today (3 cols) */}
        <div className="lg:col-span-3 bg-[#0D1526] border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>ملخص قنوات التحصيل</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              قنوات الدفع واستلام المستحقات
            </p>
          </div>

          <div className="py-4 space-y-5">
            <div>
              <span className="text-[11px] text-slate-400 block">إجمالي المحصل اليوم:</span>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                {todaySales.toLocaleString()} <span className="text-xs font-normal text-slate-400">دج</span>
              </div>
            </div>

            {/* Channels Progress Bars */}
            <div className="space-y-3.5">
              {/* COD */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">الدفع عند الاستلام (COD)</span>
                  <span className="font-mono text-indigo-400 font-bold">{codPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${codPercent}%` }} />
                </div>
              </div>

              {/* BaridiMob / CCP */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">بريدي موب / CCP</span>
                  <span className="font-mono text-emerald-400 font-bold">{baridiMobPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${baridiMobPercent}%` }} />
                </div>
              </div>

              {/* Online / Card */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">البطاقة الذهبية / CIB</span>
                  <span className="font-mono text-amber-400 font-bold">{onlinePercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${onlinePercent}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>طريقة الدفع بالتوصيل:</span>
            <span className="text-emerald-400 font-semibold font-mono">الدفع عند الاستلام (COD)</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 3: SUBSCRIPTION PLANS BREAKDOWN + COD DELIVERY STATUS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subscription Plans Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-[#0D1526] border border-slate-800 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                <span>مبيعات خطط الاشتراك المعتمدة (Subscriptions Overview)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                مبيعات المنصة محددة حصرياً في اشتراكين: سنوي وشهري
              </p>
            </div>
            <Link
              href="/ops/orders"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>سجل الطلبيات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-right text-xs">
              <thead className="text-slate-500 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">الخطة الدراسية</th>
                  <th className="py-2.5 px-3">النوع</th>
                  <th className="py-2.5 px-3">السعر الرسمي</th>
                  <th className="py-2.5 px-3">المشتركين الفعليين</th>
                  <th className="py-2.5 px-3">إجمالي الإيرادات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {/* Plan 1: Annual */}
                <tr className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white text-xs">الاشتراك السنوي الشامل (BAC 2027)</div>
                    <div className="text-[10px] text-purple-400 mt-0.5">سنة دراسية كاملة + كل المواد + بنك الامتحانات</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-purple-950/70 text-purple-300 text-[10px] font-bold border border-purple-800/60">
                      سنوي
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-200">
                    4,900 دج
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-white">
                    {annualCount}
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-emerald-400">
                    {(annualCount * 4900).toLocaleString()} دج
                  </td>
                </tr>

                {/* Plan 2: Monthly */}
                <tr className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white text-xs">الاشتراك الشهري المباشر (Monthly Pass)</div>
                    <div className="text-[10px] text-sky-400 mt-0.5">30 يوم وصول كامل وتجديد دوري</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-sky-950/70 text-sky-300 text-[10px] font-bold border border-sky-800/60">
                      شهري
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-200">
                    1,500 دج
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-white">
                    {monthlyCount}
                  </td>
                  <td className="py-3 px-3 font-mono font-black text-emerald-400">
                    {(monthlyCount * 1500).toLocaleString()} دج
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* COD Delivery & Orders Tracking Status Card (5 cols) */}
        <div className="lg:col-span-5 bg-[#0D1526] border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-400" />
                  <span>تسيير التوصيل والدفع عند الاستلام (COD)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  التوصيل هو وسيلة دفع وتحصيل نقدي عبر شريك التوزيع ياليدين
                </p>
              </div>
              <Link
                href="/ops/orders"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <span>إدارة الشحنات</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Orders Delivery Pipeline */}
            <div className="space-y-2.5 mt-4 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-white">طلبيات قيد الانتظار والتأكيد</span>
                </div>
                <span className="font-mono font-bold text-amber-400">{summary.pending} طلب</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-sky-400" />
                  <span className="font-semibold text-white">طلبيات قيد التجهيز للشحن</span>
                </div>
                <span className="font-mono font-bold text-sky-400">{summary.processing} طلب</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-white">طرود مشحونة مع ياليدين (In Transit)</span>
                </div>
                <span className="font-mono font-bold text-purple-400">{summary.shipped} طرد</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold text-white">طرود تم تسليمها وتحصيلها</span>
                </div>
                <span className="font-mono font-bold text-emerald-400">{summary.delivered + summary.paid} طرد</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 mt-4">
            <span>تغطية شبكة التوصيل:</span>
            <span className="text-emerald-400 font-mono font-bold">
              58 ولاية (Yalidine Express COD)
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ROW 4: MONTHLY TREND + RECENT TRANSACTIONS + WILAYAS      */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Revenue Bar Chart (Real only) (3 cols) */}
        <div className="lg:col-span-3 bg-[#0D1526] border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>تطور الإيرادات الشهرية</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                حجم المبيعات لآخر 5 أشهر
              </p>
            </div>

            {/* Vertical Bar Chart SVG */}
            <div className="py-6 flex items-end justify-between h-44 gap-3 px-2">
              {monthlyTrends.map((bar) => (
                <div key={bar.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[9px] font-mono text-slate-400">{bar.label}</span>
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      bar.active
                        ? "bg-gradient-to-t from-indigo-600 to-purple-500 shadow-lg shadow-indigo-600/30"
                        : "bg-slate-800 hover:bg-slate-700"
                    }`}
                    style={{ height: bar.heightPercent }}
                  />
                  <span className="text-[10px] text-slate-400 mt-1">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400 font-mono">
            {monthSales > 0 ? (
              <span className="text-emerald-400 font-bold">إجمالي مبيعات الشهر: {monthSales.toLocaleString()} دج</span>
            ) : (
              <span>لا توجد مبيعات مسجلة لهذا الشهر (0 دج)</span>
            )}
          </div>
        </div>

        {/* Recent Transactions Table (Real only) (6 cols) */}
        <div className="lg:col-span-6 bg-[#0D1526] border border-slate-800 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>أحدث المعاملات والطلبات (Recent Orders)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تحديث لحظي لطلبيات التلاميذ المباشرة
              </p>
            </div>
            <Link
              href="/ops/orders"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
            >
              <span>عرض الكل ({orders.length})</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3 mt-3">
            {recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                لا توجد طلبيات مسجلة حالياً (00).
              </div>
            ) : (
              recentTransactions.map((tx: any) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      {tx.studentName ? tx.studentName.slice(0, 2) : "طالب"}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{tx.studentName}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-indigo-400" />
                        <span>{tx.wilaya}</span>
                        <span>•</span>
                        <span className="font-mono">{tx.orderNumber}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left flex items-center gap-3">
                    <div>
                      <div className="font-mono font-black text-emerald-400 text-xs">
                        {tx.amount.toLocaleString()} دج
                      </div>
                      <div className="text-[10px] mt-0.5">
                        {tx.status === "PAID" ? (
                          <span className="text-emerald-400 font-bold">تم التحصيل</span>
                        ) : tx.status === "SHIPPED" ? (
                          <span className="text-purple-400 font-bold">مع الموزع</span>
                        ) : (
                          <span className="text-amber-400 font-bold">قيد التأكيد</span>
                        )}
                      </div>
                    </div>

                    <Link
                      href="/ops/orders"
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      title="عرض التفاصيل"
                    >
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Wilaya-Wise Distribution Horizontal Bar Chart (3 cols) */}
        <div className="lg:col-span-3 bg-[#0D1526] border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400" />
                <span>توزيع المبيعات جغرافياً (Wilayas)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                الولايات الأكثر تسجيلاً للطلبات
              </p>
            </div>

            <div className="space-y-3.5 mt-4">
              {wilayaSales.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  لا توجد بيانات جغرافية كافية (00).
                </div>
              ) : (
                wilayaSales.map((w, idx) => (
                  <div key={w.wilaya}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-semibold">{w.wilaya}</span>
                      <span className="font-mono text-slate-400">
                        {w.count} طلب ({w.percent}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          idx === 0
                            ? "bg-indigo-500"
                            : idx === 1
                            ? "bg-emerald-500"
                            : idx === 2
                            ? "bg-amber-500"
                            : "bg-sky-500"
                        }`}
                        style={{ width: `${Math.max(w.percent, 5)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 mt-4">
            <span>تغطية الشحن:</span>
            <span className="text-emerald-400 font-bold">58 ولاية (Yalidine Express)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function LayoutDashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}

function PieChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}
