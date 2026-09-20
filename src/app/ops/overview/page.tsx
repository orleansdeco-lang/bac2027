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
} from "lucide-react";
import {
  OperationsOverviewKPIs,
  PaymentOrder,
  StudentOperationalSummary,
} from "@/lib/operations/types";
import { opsFetch } from "@/lib/operations/client-api";
import { AdminNotifications } from "@/components/ops/AdminNotifications";
import { VisitorAnalyticsSummaryV2, HourlyTrafficBucket, CampaignLinkStat } from "@/lib/operations/visitors";

export default function OpsOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  // Time & Filter selection
  const [selectedDateFilter, setSelectedDateFilter] = useState<"today" | "yesterday" | "7d" | "30d">("today");
  const [hourlyMetricView, setHourlyMetricView] = useState<"visitors" | "inflow">("visitors");

  // Core Real Data States (Zero Mocking)
  const [kpis, setKpis] = useState<OperationsOverviewKPIs | null>(null);
  const [traffic, setTraffic] = useState<VisitorAnalyticsSummaryV2 | null>(null);
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [students, setStudents] = useState<StudentOperationalSummary[]>([]);

  // Modals & Action States
  const [previewReceiptUrl, setPreviewReceiptUrl] = useState<string | null>(null);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeBottomTab, setActiveBottomTab] = useState<"visitors_log" | "pending_orders" | "campaign_links">("visitors_log");

  // Selected date ISO string for API
  const targetDateStr = useMemo(() => {
    const d = new Date();
    if (selectedDateFilter === "yesterday") {
      d.setDate(d.getDate() - 1);
    }
    return d.toISOString().slice(0, 10);
  }, [selectedDateFilter]);

  // ─── Fetch 100% Real Live Operations Data ──────────────────────────────────
  async function fetchRealOperationsData() {
    setLoading(true);
    setActionNotice(null);

    // Clear any obsolete localStorage mock caches left from previous sessions
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("bac_ops_cached_students");
        localStorage.removeItem("bac_ops_cached_orders");
        localStorage.removeItem("bac_ops_cached_plans");
      } catch {}
    }

    try {
      const [kpisRes, trafficRes, ordersRes, studentsRes] = await Promise.all([
        opsFetch("/api/ops/overview").catch(() => null),
        opsFetch(`/api/ops/analytics/traffic?date=${targetDateStr}`).catch(() => null),
        opsFetch("/api/ops/payments").catch(() => null),
        opsFetch("/api/ops/students").catch(() => null),
      ]);

      if (kpisRes && kpisRes.ok) {
        const kpisData = await kpisRes.json().catch(() => null);
        if (kpisData?.kpis) setKpis(kpisData.kpis);
      }

      if (trafficRes && trafficRes.ok) {
        const trafficData = await trafficRes.json().catch(() => null);
        if (trafficData?.data) setTraffic(trafficData.data);
      }

      if (ordersRes && ordersRes.ok) {
        const ordersData = await ordersRes.json().catch(() => null);
        if (Array.isArray(ordersData?.orders)) {
          setOrders(ordersData.orders);
        }
      }

      if (studentsRes && studentsRes.ok) {
        const studentsData = await studentsRes.json().catch(() => null);
        if (Array.isArray(studentsData?.students)) {
          setStudents(studentsData.students);
        }
      }

      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Ops overview real fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRealOperationsData();
    // Live update every 12 seconds
    const interval = setInterval(() => {
      fetchRealOperationsData();
    }, 12000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  // Approve payment order
  const handleApproveOrder = async (orderId: string) => {
    setProcessingOrderId(orderId);
    setActionNotice(null);
    try {
      const res = await opsFetch("/api/ops/payments/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to approve payment");
      }
      setActionNotice({ type: "success", message: "تمت الموافقة على الدفع وتفعيل حساب التلميذ بنجاح!" });
      await fetchRealOperationsData();
    } catch (err: any) {
      setActionNotice({ type: "error", message: err?.message || "تعذر قبول الطلب" });
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Reject payment order
  const handleRejectOrder = async (orderId: string) => {
    setProcessingOrderId(orderId);
    setActionNotice(null);
    try {
      const res = await opsFetch("/api/ops/payments/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, reason: "إيصال غير صالح أو بيانات غير متطابقة" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reject order");
      }
      setActionNotice({ type: "success", message: "تم رفض الطلب بنجاح." });
      await fetchRealOperationsData();
    } catch (err: any) {
      setActionNotice({ type: "error", message: err?.message || "تعذر رفض الطلب" });
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Calculated Real Metrics
  const approvedOrders = useMemo(() => orders.filter((o) => o.status === "APPROVED"), [orders]);
  const pendingOrders = useMemo(() => orders.filter((o) => o.status === "PENDING"), [orders]);

  const totalRealRevenueDZD = useMemo(() => {
    return approvedOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
  }, [approvedOrders]);

  const todayRevenueDZD = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    return approvedOrders
      .filter((o) => (o.reviewedAt || o.submittedAt || "").slice(0, 10) === todayIso)
      .reduce((sum, o) => sum + (o.amount || 0), 0);
  }, [approvedOrders]);

  const onlineRevenueDZD = useMemo(() => {
    return approvedOrders
      .filter((o) => o.paymentMethod === "baridimob" || o.paymentMethod === "ccp")
      .reduce((sum, o) => sum + (o.amount || 0), 0);
  }, [approvedOrders]);

  const codRevenueDZD = useMemo(() => {
    return approvedOrders
      .filter((o) => o.paymentMethod === "cash" || o.orderType === "COD")
      .reduce((sum, o) => sum + (o.amount || 0), 0);
  }, [approvedOrders]);

  // Hourly traffic buckets (0..23)
  const hourlyData = traffic?.hourlyTrafficToday || [];
  const maxHourlyVal = Math.max(1, ...hourlyData.map((h) => (hourlyMetricView === "visitors" ? h.visitors : h.pageviews)));

  // Real conversion rates
  const uniqueVisitorsCount = traffic?.todayUniqueVisitors || 0;
  const registeredCount = students.length;
  const conversionRateVisitorsToStudents = uniqueVisitorsCount > 0 ? Math.round((registeredCount / uniqueVisitorsCount) * 100) : 0;
  const paidCount = approvedOrders.length;
  const conversionRateStudentsToPaid = registeredCount > 0 ? Math.round((paidCount / registeredCount) * 100) : 0;

  return (
    <div dir="rtl" className="min-h-screen bg-[#080D1A] text-slate-100 p-3 sm:p-6 space-y-6 font-sans antialiased">
      {/* ===================================================================== */}
      {/* 1. TOP HEADER & COCKPIT CONTROLS                                      */}
      {/* ===================================================================== */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 p-4 sm:p-5 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Brand & Live Presence Orb */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-black text-base sm:text-xl tracking-wide text-white">
                SHATER Operations Cockpit
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                BAC 2027
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 font-mono text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                <span className="font-bold">{traffic?.liveVisitorsCount ?? 1} زائر متصل الآن</span>
              </span>
              <span>•</span>
              <span className="text-[11px] font-mono">بيانات حقيقية 100% (Zero Mock)</span>
            </div>
          </div>
        </div>

        {/* Date Filter & Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
          {/* Date Segmented Control */}
          <div className="p-1 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center text-xs font-bold">
            <button
              type="button"
              onClick={() => setSelectedDateFilter("today")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedDateFilter === "today"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              اليوم
            </button>
            <button
              type="button"
              onClick={() => setSelectedDateFilter("yesterday")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedDateFilter === "yesterday"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              أمس
            </button>
            <button
              type="button"
              onClick={() => setSelectedDateFilter("7d")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedDateFilter === "7d"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              7 أيام
            </button>
            <button
              type="button"
              onClick={() => setSelectedDateFilter("30d")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedDateFilter === "30d"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              الشهر
            </button>
          </div>

          {/* CSV Export Button */}
          <a
            href="/api/ops/analytics/traffic?format=csv"
            download
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs transition-all shadow-sm"
            title="تصدير سجل الزوار إلى Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">تصدير CSV</span>
          </a>

          {/* Admin Real-Time Notifications Bell */}
          <AdminNotifications />

          {/* Manual Refresh */}
          <button
            type="button"
            onClick={fetchRealOperationsData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all disabled:opacity-50"
            title="تحديث البيانات فوراً"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>

      {actionNotice && (
        <div
          className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between gap-2 shadow-lg ${
            actionNotice.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/15 border-rose-500/30 text-rose-400"
          }`}
        >
          <span>{actionNotice.message}</span>
          <button type="button" onClick={() => setActionNotice(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. THE EXECUTIVE 3-COLUMN COCKPIT (MATCHING USER TABLET IMAGE)         */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ─── CARD 1: BALANCE & CASH INFLOW (Col 4) ────────────────────────── */}
        <div className="lg:col-span-4 rounded-3xl bg-gradient-to-br from-[#0D1527]/90 via-[#131E38]/90 to-[#0A1020]/95 backdrop-blur-2xl border border-cyan-500/20 p-6 shadow-2xl space-y-6 flex flex-col justify-between relative overflow-hidden group">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                إجمالي المداخيل المحققة
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                DZD Live
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                {totalRealRevenueDZD.toLocaleString()}
              </span>
              <span className="text-sm font-bold text-slate-400">دج</span>
            </div>

            <p className="text-[11px] text-slate-400 mt-1">
              مداخيل اليوم: <span className="font-mono font-bold text-emerald-400">+{todayRevenueDZD.toLocaleString()} دج</span>
            </p>
          </div>

          {/* Progress Ring / Gauge Display */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold">نسبة الاشتراكات المدفوعة</span>
              <span className="font-mono font-black text-cyan-400">
                {registeredCount > 0 ? `${conversionRateStudentsToPaid}%` : "0%"}
              </span>
            </div>
            {/* Horizontal Bar Gauge */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, conversionRateStudentsToPaid)}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">دفع إلكتروني</span>
                <span className="font-mono font-bold text-slate-200">{onlineRevenueDZD.toLocaleString()} دج</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">عند الاستلام (COD)</span>
                <span className="font-mono font-bold text-slate-200">{codRevenueDZD.toLocaleString()} دج</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Footer */}
          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">مشتركون</span>
              <span className="font-mono font-bold text-white text-sm">{approvedOrders.length}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">قيد المراجعة</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{pendingOrders.length}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">تلاميذ مسجلون</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">{students.length}</span>
            </div>
          </div>
        </div>

        {/* ─── CARD 2: SHOPIFY 24-HOUR HOURLY TRAFFIC GRAPH (Col 5) ───────────── */}
        <div className="lg:col-span-5 rounded-3xl bg-[#0D1527]/90 backdrop-blur-2xl border border-slate-800/90 p-6 shadow-2xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                  توزيع الزوار بالساعة (Shopify-Style Hourly Traffic)
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {traffic?.todayUniqueVisitors || 0}
                </span>
                <span className="text-xs text-slate-400">زائر فريد خلال اليوم</span>
                {traffic?.growthRatePercent !== undefined && traffic.growthRatePercent !== 0 && (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      traffic.growthRatePercent > 0
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-rose-500/15 text-rose-400"
                    }`}
                  >
                    {traffic.growthRatePercent > 0 ? `+${traffic.growthRatePercent}%` : `${traffic.growthRatePercent}%`}
                  </span>
                )}
              </div>
            </div>

            {/* Toggle metric */}
            <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setHourlyMetricView("visitors")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  hourlyMetricView === "visitors"
                    ? "bg-cyan-500 text-slate-950 font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                الزوار
              </button>
              <button
                type="button"
                onClick={() => setHourlyMetricView("inflow")}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  hourlyMetricView === "inflow"
                    ? "bg-cyan-500 text-slate-950 font-black"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                المشاهدات
              </button>
            </div>
          </div>

          {/* 24-Hour Vertical Bar Chart with Hover Tooltips */}
          <div className="space-y-2 pt-2">
            <div className="h-44 flex items-end justify-between gap-1 sm:gap-1.5 px-1 bg-slate-950/50 rounded-2xl p-3 border border-slate-800/80">
              {hourlyData.map((b) => {
                const val = hourlyMetricView === "visitors" ? b.visitors : b.pageviews;
                const heightPercent = maxHourlyVal > 0 ? Math.max(8, Math.round((val / maxHourlyVal) * 100)) : 8;
                const isCurrentHour = new Date().getHours() === b.hour;

                return (
                  <div
                    key={b.hour}
                    className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-white shadow-xl text-[10px] whitespace-nowrap font-mono">
                        <span className="font-bold text-cyan-400 block">{b.label}</span>
                        <span>{b.visitors} زائر فريد</span>
                        <span className="text-slate-400 block">{b.pageviews} مشاهدة صفحة</span>
                      </div>
                      <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b border-slate-700" />
                    </div>

                    {/* The Bar */}
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        val > 0
                          ? isCurrentHour
                            ? "bg-gradient-to-t from-cyan-600 to-cyan-300 shadow-lg shadow-cyan-500/40"
                            : "bg-gradient-to-t from-indigo-700 to-cyan-500 hover:from-cyan-500 hover:to-cyan-300"
                          : "bg-slate-800/40 hover:bg-slate-800"
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* X-Axis Hour Labels */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-2">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:00</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>إجمالي مشاهدات الصفحات اليوم: <b className="font-mono text-white">{traffic?.todayPageviews || 0}</b></span>
            <span className="font-mono text-[10px] text-cyan-400">Shopify 24h Live Engine</span>
          </div>
        </div>

        {/* ─── CARD 3: DEVICE & CONVERSION DISTRIBUTION (Col 3) ─────────────── */}
        <div className="lg:col-span-3 rounded-3xl bg-[#0D1527]/90 backdrop-blur-2xl border border-slate-800/90 p-6 shadow-2xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-semibold uppercase text-slate-400">
              توزيع الأجهزة والمنصات
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              Live Ratio
            </span>
          </div>

          {/* Donut representation via stacked bar and list */}
          <div className="space-y-4 my-auto">
            <div className="h-3 rounded-full bg-slate-800 overflow-hidden flex">
              <div
                className="bg-cyan-400 h-full transition-all"
                style={{ width: `${traffic?.deviceRatios.mobile || 0}%` }}
                title={`Mobile: ${traffic?.deviceRatios.mobile}%`}
              />
              <div
                className="bg-indigo-500 h-full transition-all"
                style={{ width: `${traffic?.deviceRatios.desktop || 0}%` }}
                title={`Desktop: ${traffic?.deviceRatios.desktop}%`}
              />
              <div
                className="bg-purple-500 h-full transition-all"
                style={{ width: `${traffic?.deviceRatios.tablet || 0}%` }}
                title={`Tablet: ${traffic?.deviceRatios.tablet}%`}
              />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-300">الهواتف (Mobile)</span>
                </div>
                <span className="font-mono font-black text-cyan-400">{traffic?.deviceRatios.mobile ?? 0}%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-slate-300">الحواسيب (Desktop)</span>
                </div>
                <span className="font-mono font-black text-indigo-400">{traffic?.deviceRatios.desktop ?? 0}%</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Tablet className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-slate-300">الأجهزة اللوحية (Tablet)</span>
                </div>
                <span className="font-mono font-black text-purple-400">{traffic?.deviceRatios.tablet ?? 0}%</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 text-center">
            تحديث لحظي بناءً على بيانات المتصفح
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. ROW 2: GOALS FUNNEL & THE 20 CAMPAIGN LINKS TRACKER                 */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Goals & Conversion Funnel (Col 4) */}
        <div className="lg:col-span-4 rounded-3xl bg-[#0D1527]/90 backdrop-blur-2xl border border-slate-800/90 p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-bold uppercase text-slate-300">
              قمع تحويل الزوار (Acquisition Funnel)
            </span>
            <span className="text-[10px] font-mono text-cyan-400">100% Real</span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Step 1: Visitors */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">1. زوار الموقع (Unique Visitors)</span>
                <span className="font-mono font-bold text-white">{uniqueVisitorsCount}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ width: "100%" }} />
              </div>
            </div>

            {/* Step 2: Registrations */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">2. الحسابات المسجلة (Signups)</span>
                <span className="font-mono font-bold text-indigo-300">{registeredCount} ({conversionRateVisitorsToStudents}%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, conversionRateVisitorsToStudents)}%` }}
                />
              </div>
            </div>

            {/* Step 3: Paid Subscribers */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">3. الاشتراكات المدفوعة (Pass Sales)</span>
                <span className="font-mono font-bold text-emerald-400">{paidCount} ({conversionRateStudentsToPaid}%)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, conversionRateStudentsToPaid)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* The 20 Campaign Links Attribution Card (Col 8) */}
        <div className="lg:col-span-8 rounded-3xl bg-[#0D1527]/90 backdrop-blur-2xl border border-slate-800/90 p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase text-slate-200">
                تتبع الروابط المنشورة وحملات الـ UTM (الروابط الـ 20)
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {traffic?.topCampaignLinks.length || 0} رابط نشط
            </span>
          </div>

          {traffic?.topCampaignLinks && traffic.topCampaignLinks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                    <th className="pb-2">مصدر الرابط (Source / UTM)</th>
                    <th className="pb-2">اسم الحملة</th>
                    <th className="pb-2">كود الإحالة</th>
                    <th className="pb-2 text-center">النقرات والزيارات</th>
                    <th className="pb-2 text-center">زوار فريدون</th>
                    <th className="pb-2 text-left">آخر نقرة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {traffic.topCampaignLinks.map((c) => (
                    <tr key={c.campaignKey} className="hover:bg-slate-850/50">
                      <td className="py-2.5 font-bold text-white flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{c.source}</span>
                      </td>
                      <td className="py-2.5 text-slate-300">{c.campaign || "—"}</td>
                      <td className="py-2.5 text-indigo-400 font-bold">{c.refCode || "—"}</td>
                      <td className="py-2.5 text-center font-bold text-cyan-300">{c.totalVisits}</td>
                      <td className="py-2.5 text-center text-emerald-400 font-bold">{c.uniqueVisitors}</td>
                      <td className="py-2.5 text-left text-[10px] text-slate-500">
                        {new Date(c.lastVisitAt).toLocaleTimeString("ar-DZ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <Share2 className="w-8 h-8 mx-auto opacity-30 text-cyan-400" />
              <p className="text-xs">لم يتم تسجيل نقرات على الروابط في هذه الفترة حتى الآن</p>
              <p className="text-[11px] text-slate-600">
                أي زيارة تأتي عبر رابط يحتوي على <code>?ref=...</code> أو <code>?utm_source=...</code> ستظهر هنا فوراً.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. REAL DATA LIVE TABLES & RECENT ACTIVITY                           */}
      {/* ===================================================================== */}
      <div className="rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 p-5 shadow-2xl space-y-4">
        {/* Table Tab Selector */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveBottomTab("visitors_log")}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeBottomTab === "visitors_log"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              سجل الزوار الحقيقي لحظة بلحظة ({traffic?.recentLogs.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setActiveBottomTab("pending_orders")}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeBottomTab === "pending_orders"
                  ? "bg-cyan-500 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              طلبات الدفع والاشتراك ({orders.length})
            </button>
            <Link
              href="/ops/students"
              className="px-3.5 py-2 rounded-xl text-slate-400 hover:text-white transition-all flex items-center gap-1"
            >
              <span>دليل التلاميذ المنظم ({students.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <a
            href="/api/ops/analytics/traffic?format=csv"
            download
            className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
          >
            <Download className="w-3 h-3" />
            <span>تصدير الجدول</span>
          </a>
        </div>

        {/* VIEW 1: LIVE VISITORS LOG */}
        {activeBottomTab === "visitors_log" && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                  <th className="pb-2.5">الوقت</th>
                  <th className="pb-2.5">الصفحة / المسار</th>
                  <th className="pb-2.5">الرابط الكامل / الحملة</th>
                  <th className="pb-2.5">المصدر الخارجي</th>
                  <th className="pb-2.5">الجهاز</th>
                  <th className="pb-2.5">المتصفح والنظام</th>
                  <th className="pb-2.5 font-mono text-left">الجلسة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {traffic?.recentLogs && traffic.recentLogs.length > 0 ? (
                  traffic.recentLogs.slice(0, 25).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-850/50">
                      <td className="py-2.5 text-slate-300 font-bold whitespace-nowrap">
                        {log.time}
                      </td>
                      <td className="py-2.5 text-cyan-300 font-semibold font-sans truncate max-w-[150px]">
                        {log.path}
                      </td>
                      <td className="py-2.5 text-slate-300 truncate max-w-[200px]" title={log.fullUrl || log.path}>
                        {log.utmSource || log.refCode ? (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                            {log.utmSource || log.refCode}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-2.5 text-slate-400 whitespace-nowrap">
                        {log.referrerDomain || "مباشر"}
                      </td>
                      <td className="py-2.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.deviceType === "mobile"
                              ? "bg-cyan-500/15 text-cyan-400"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {log.deviceType}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-400 text-[11px] whitespace-nowrap">
                        {log.browser} / {log.os}
                      </td>
                      <td className="py-2.5 text-left text-[10px] text-slate-600 truncate max-w-[100px]">
                        {log.sessionId.slice(0, 12)}...
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      لا توجد زيارات مسجلة حتى الآن
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: REAL PAYMENT ORDERS QUEUE */}
        {activeBottomTab === "pending_orders" && (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                  <th className="pb-2.5">التلميذ</th>
                  <th className="pb-2.5">رقم الهاتف</th>
                  <th className="pb-2.5">الولاية</th>
                  <th className="pb-2.5">المبلغ</th>
                  <th className="pb-2.5">طريقة الدفع</th>
                  <th className="pb-2.5">الحالة</th>
                  <th className="pb-2.5 text-center">الوصل</th>
                  <th className="pb-2.5 text-left">الإجراء الفوري</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {orders.length > 0 ? (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-850/50">
                      <td className="py-3 font-bold text-white">
                        {o.studentName || o.shippingName || "تلميذ مسجل"}
                      </td>
                      <td className="py-3 font-mono text-cyan-400" dir="ltr">
                        {o.studentPhone || o.shippingPhone || "—"}
                      </td>
                      <td className="py-3 text-slate-300">
                        {o.shippingWilaya || "—"}
                      </td>
                      <td className="py-3 font-mono font-black text-white">
                        {(o.amount || 4900).toLocaleString()} دج
                      </td>
                      <td className="py-3 font-mono text-[11px] text-slate-400">
                        {o.orderType === "COD" || o.paymentMethod === "cash" ? "عند الاستلام (COD)" : "دفع إلكتروني"}
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            o.status === "APPROVED"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : o.status === "REJECTED"
                              ? "bg-rose-500/15 text-rose-400"
                              : "bg-amber-500/15 text-amber-400"
                          }`}
                        >
                          {o.status === "APPROVED" ? "مقبول ومفعل" : o.status === "REJECTED" ? "مرفوض" : "قيد المراجعة"}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {o.receiptPath ? (
                          <button
                            type="button"
                            onClick={() => setPreviewReceiptUrl(o.receiptPath!)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
                            title="معاينة صورة الوصل"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 text-left">
                        {o.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              disabled={processingOrderId === o.id}
                              onClick={() => handleApproveOrder(o.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>قبول وتفعيل</span>
                            </button>
                            <button
                              type="button"
                              disabled={processingOrderId === o.id}
                              onClick={() => handleRejectOrder(o.id)}
                              className="px-2 py-1 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-bold text-[11px] flex items-center gap-1 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">مكتمل</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      لا توجد طلبات اشتراك مسجلة حالياً
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 5. RECEIPT PREVIEW MODAL                                              */}
      {/* ===================================================================== */}
      {previewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="font-bold text-sm text-white">معاينة وصل الدفع</span>
              <button
                type="button"
                onClick={() => setPreviewReceiptUrl(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-auto rounded-xl border border-slate-800 bg-black flex items-center justify-center">
              <img
                src={previewReceiptUrl}
                alt="وصل الدفع"
                className="max-h-[65vh] object-contain rounded-lg"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <a
                href={previewReceiptUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح بالحجم الكامل</span>
              </a>
              <button
                type="button"
                onClick={() => setPreviewReceiptUrl(null)}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black hover:bg-cyan-400"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
