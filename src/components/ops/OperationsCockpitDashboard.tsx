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
  Sparkles,
  TrendingUp,
  Clock,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  DollarSign,
  FileSpreadsheet,
  Package,
  Truck,
  MapPin,
  Award,
  ChevronRight,
  ShieldCheck,
  Compass,
  PieChart as PieChartIcon,
  HelpCircle,
  BookOpen,
  Calculator,
  MessageSquare,
  FileText,
  Boxes,
  Zap,
} from "lucide-react";
import { OperationsDashboardData } from "@/lib/operations/types";
import { opsFetch } from "@/lib/operations/client-api";

export function OperationsCockpitDashboard() {
  const [data, setData] = useState<OperationsDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [activeSection, setActiveSection] = useState<string>("all");

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
    // Background refresh every 30 seconds
    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Shortcuts
  const business = data?.business;
  const audience = data?.audience;
  const acquisition = data?.acquisition;
  const productUsage = data?.productUsage;
  const conversion = data?.conversion;
  const commerce = data?.commerce;
  const geography = data?.geography;
  const integrity = data?.dataIntegrity;
  const alerts = data?.alerts;
  const orders = data?.orders || [];

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
      `"${o.orderNumber || o.id}"`,
      `"${o.studentName || o.shippingName || "طالب"}"`,
      `"${o.phone || o.studentPhone || ""}"`,
      `"${o.wilaya || o.shippingWilaya || "غير محددة"}"`,
      `"${o.commune || o.shippingCommune || ""}"`,
      `"${(o.address || o.shippingAddress || "").replace(/"/g, '""')}"`,
      o.isStopDesk ? "1" : "0",
      `"${o.planName || o.plan || "اشتراك"}"`,
      o.amount || 0,
      `"${o.shipment?.trackingNumber || o.trackingNumber || ""}"`,
      `"${o.status}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `yalidine_orders_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto text-slate-100 bg-[#070B14]"
      dir="rtl"
    >
      {/* ======================================================== */}
      {/* TOP HEADER & DATA INTEGRITY INDICATOR & GLOBAL ACTIONS   */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
            <span className="text-indigo-400 font-bold">منصة شاطر بكالوريا</span>
            <span>/</span>
            <span>مركز العمليات والتحكم المركزي</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <LayoutDashboardIcon className="w-7 h-7 text-indigo-400" />
              <span>لوحة القيادة المركزية | SHATER Operations Cockpit</span>
            </h1>

            {/* DATA INTEGRITY INDICATOR */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border transition-all ${
                integrity?.status === "REAL"
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                  : integrity?.status === "PARTIAL"
                  ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                  : "bg-slate-800 border-slate-700 text-slate-400"
              }`}
              title={integrity?.message || "مؤشر سلامة وتوثيق البيانات"}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  integrity?.status === "REAL"
                    ? "bg-emerald-400 animate-ping"
                    : integrity?.status === "PARTIAL"
                    ? "bg-amber-400"
                    : "bg-slate-400"
                }`}
              />
              <span>
                {integrity?.status === "REAL"
                  ? "بيانات حقيقية 100% (REAL)"
                  : integrity?.status === "PARTIAL"
                  ? "بيانات جزئية موثقة (PARTIAL)"
                  : "غير متاحة — البيانات غير كافية"}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-1">
            {integrity?.message ||
              "المراقبة اللحظية الشاملة للأعمال، الجمهور، قمع التحويل، واستخدام المنتج بدون بيانات وهمية"}
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all shadow"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                refreshing ? "animate-spin text-indigo-400" : ""
              }`}
            />
            <span>تحديث</span>
            {lastRefreshed && (
              <span className="text-[10px] text-slate-400 font-mono">
                (
                {lastRefreshed.toLocaleTimeString("ar-DZ", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
                )
              </span>
            )}
          </button>

          <button
            onClick={handleExportYalidine}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير ياليدين (CSV)</span>
          </button>

          <Link
            href="/ops/orders"
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Truck className="w-4 h-4" />
            <span>الطلبيات والتوصيل</span>
          </Link>

          <Link
            href="/ops/funnel"
            className="px-3.5 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5 border border-purple-400/30 transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>قمع التحويل</span>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* SECTION NAVIGATION CHIPS                                */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <a
          href="#section-business"
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-indigo-500 text-slate-300 font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5"
        >
          <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
          <span>1. مؤشرات الأعمال (Business)</span>
        </a>
        <a
          href="#section-audience"
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-emerald-500 text-slate-300 font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5"
        >
          <Users className="w-3.5 h-3.5 text-emerald-400" />
          <span>2. الجمهور والطلاب (Audience)</span>
        </a>
        <a
          href="#section-acquisition"
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-amber-500 text-slate-300 font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5"
        >
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          <span>3. مصادر الاستقطاب (Acquisition)</span>
        </a>
        <a
          href="#section-product"
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-purple-500 text-slate-300 font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>4. استخدام المنتج (Product Usage)</span>
        </a>
        <a
          href="#section-conversion"
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-500 text-slate-300 font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5"
        >
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          <span>5. قمع التحويل (Conversion)</span>
        </a>
        <a
          href="#section-commerce"
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-rose-500 text-slate-300 font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5"
        >
          <Package className="w-3.5 h-3.5 text-rose-400" />
          <span>6. التجارة والطلبيات (Commerce)</span>
        </a>
        <a
          href="#section-geography"
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-teal-500 text-slate-300 font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5"
        >
          <MapPin className="w-3.5 h-3.5 text-teal-400" />
          <span>7. التوزيع الجغرافي (Geography)</span>
        </a>
      </div>

      {/* ======================================================== */}
      {/* OPERATIONAL ALERTS BANNER (STALE ORDERS / EXPIRING SUBS) */}
      {/* ======================================================== */}
      {((alerts?.stalePending && alerts.stalePending.length > 0) ||
        (alerts?.expiringSoon && alerts.expiringSoon.length > 0)) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts?.stalePending && alerts.stalePending.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-sm">
                    {alerts.stalePending.length} طلبات تنتظر التأكيد منذ أكثر من 12 ساعة
                  </div>
                  <div className="text-[11px] text-amber-300/80 mt-0.5">
                    تتطلب المراجعة الفورية لتفادي تأخر التوصيل لـ ياليدين
                  </div>
                </div>
              </div>
              <Link
                href="/ops/orders"
                className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shrink-0 text-xs transition-colors"
              >
                معالجة الطلبات
              </Link>
            </div>
          )}

          {alerts?.expiringSoon && alerts.expiringSoon.length > 0 && (
            <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 text-xs text-purple-200 flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-sm">
                    {alerts.expiringSoon.length} اشتراكات تنتهي صلاحيتها خلال أقل من 7 أيام
                  </div>
                  <div className="text-[11px] text-purple-300/80 mt-0.5">
                    فرصة لإرسال تنبيه تجديد الاشتراك للطلاب المعنيين
                  </div>
                </div>
              </div>
              <Link
                href="/ops/students"
                className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold shrink-0 text-xs transition-colors"
              >
                عرض الطلاب
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. BUSINESS SECTION                                      */}
      {/* ======================================================== */}
      <section id="section-business" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">1. مؤشرات الأعمال (Business)</h2>
              <p className="text-xs text-slate-400">
                المبيعات المؤكدة، التحصيلات النقدية، الاشتراكات السنوية والشهرية
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-500">مصدر البيانات: payment_orders + unified_orders</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Card 1: مبيعات اليوم */}
          <div className="p-4 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>مبيعات اليوم</span>
              <DollarSign className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black font-mono text-white">
                {(business?.todaySales ?? 0).toLocaleString()}{" "}
                <span className="text-xs text-slate-400">دج</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>مبيعات مؤكدة اليوم</span>
            </div>
          </div>

          {/* Card 2: مبيعات الشهر */}
          <div className="p-4 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>مبيعات الشهر</span>
              <Calendar className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black font-mono text-emerald-400">
                {(business?.monthSales ?? 0).toLocaleString()}{" "}
                <span className="text-xs text-slate-400">دج</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>إجمالي الشهر الجاري</span>
            </div>
          </div>

          {/* Card 3: المداخيل المحصلة */}
          <div className="p-4 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>المداخيل المحصلة (Cash)</span>
              <CreditCard className="w-4 h-4 text-amber-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black font-mono text-amber-300">
                {(business?.collectedCash ?? 0).toLocaleString()}{" "}
                <span className="text-xs text-slate-400">دج</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>أونلاين + COD مستلم</span>
            </div>
          </div>

          {/* Card 4: مستحقات COD مع ياليدين */}
          <div className="p-4 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>مستحقات COD قيد التحصيل</span>
              <Truck className="w-4 h-4 text-teal-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black font-mono text-teal-300">
                {(business?.pendingCod ?? 0).toLocaleString()}{" "}
                <span className="text-xs text-slate-400">دج</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <span>شحنات قيد التسليم</span>
            </div>
          </div>

          {/* Card 5: إجمالي الطلبيات */}
          <div className="p-4 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>إجمالي الطلبيات</span>
              <Package className="w-4 h-4 text-sky-400" />
            </div>
            <div className="my-2">
              <div className="text-2xl font-black font-mono text-white">
                {business?.totalOrders ?? 0}{" "}
                <span className="text-xs text-slate-400">طلب</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center justify-between">
              <span>مؤكدة: {business?.ordersByStatus.delivered ?? 0}</span>
              <span>قيد الانتظار: {business?.ordersByStatus.pending ?? 0}</span>
            </div>
          </div>

          {/* Card 6: الاشتراكات */}
          <div className="p-4 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>الاشتراكات (السنوي / الشهري)</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <div className="my-2">
              <div className="text-sm font-mono font-bold text-white flex items-center justify-between">
                <span className="text-purple-300">سنوي: {business?.subscriptions.annualCount ?? 0}</span>
                <span className="text-sky-300">شهري: {business?.subscriptions.monthlyCount ?? 0}</span>
              </div>
              <div className="text-[11px] font-mono text-emerald-400 mt-1">
                {((business?.subscriptions.annualRevenue ?? 0) + (business?.subscriptions.monthlyRevenue ?? 0)).toLocaleString()} دج
              </div>
            </div>
            <div className="text-[10px] text-slate-400">
              إجمالي المشتركين الفعليين
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. AUDIENCE SECTION                                      */}
      {/* ======================================================== */}
      <section id="section-audience" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">2. الجمهور والطلاب (Audience)</h2>
              <p className="text-xs text-slate-400">
                الزوار اليوم، الزوار الجدد والعائدون، الطلاب المسجلون، والنشاط التفاعلي الحقيقي
              </p>
            </div>
          </div>
          <Link
            href="/ops/students"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>دليل الطلاب الكامل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl">
            <div className="text-xs text-slate-400 mb-1">زوار اليوم (Unique Visitors)</div>
            <div className="text-2xl font-black font-mono text-cyan-400">
              {audience?.visitorsToday ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">هوية زائر أولية فريدة</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl">
            <div className="text-xs text-slate-400 mb-1">زوار جدد اليوم (New)</div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {audience?.newVisitorsToday ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">زيارة أولى مسجلة اليوم</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl">
            <div className="text-xs text-slate-400 mb-1">زوار عائدون اليوم (Returning)</div>
            <div className="text-2xl font-black font-mono text-purple-400">
              {audience?.returningVisitorsToday ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">تكرار الزيارة عبر الجلسات</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl">
            <div className="text-xs text-slate-400 mb-1">إجمالي الطلاب المسجلين</div>
            <div className="text-2xl font-black font-mono text-white">
              {audience?.registeredStudents ?? 0}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">حسابات طالب معتمدة في المنصة</div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0D1526] border border-indigo-500/30 shadow-xl bg-gradient-to-br from-[#0D1526] to-indigo-950/20">
            <div className="text-xs text-indigo-300 font-semibold mb-1">الطلاب النشطون اليوم (Active)</div>
            <div className="text-2xl font-black font-mono text-indigo-300">
              {audience?.activeStudentsToday ?? 0}
            </div>
            <div className="text-[10px] text-indigo-400/80 mt-1">
              تعريف: توليد حدث تفاعلي فعلي واحد على الأقل اليوم
            </div>
          </div>
        </div>

        {/* Audience Sub-Breakdown Details */}
        <div className="p-4 rounded-2xl bg-[#0D1526] border border-slate-800 text-xs">
          <div className="font-bold text-white mb-3 flex items-center justify-between">
            <span>توزيع مراحل نشاط الطلاب المسجلين</span>
            <span className="text-[11px] text-slate-500 font-normal">
              لا يتم احتساب مجرد الوجود في قاعدة البيانات كنشاط
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-sans">نشط خلال 7 أيام</span>
              <span className="text-sm font-bold text-white">{audience?.activeStudents7d ?? 0} طالب</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-sans">نشط خلال 30 يوم</span>
              <span className="text-sm font-bold text-white">{audience?.activeStudents30d ?? 0} طالب</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-sans">لم ينشط قط</span>
              <span className="text-sm font-bold text-slate-400">{audience?.neverActiveStudents ?? 0} طالب</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-sans">فترة تجريبية</span>
              <span className="text-sm font-bold text-amber-300">{audience?.trialStudents ?? 0} طالب</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-sans">اشتراك مدفوع (PAID)</span>
              <span className="text-sm font-bold text-emerald-400">{audience?.paidStudents ?? 0} طالب</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] block font-sans">اشتراك منتهي</span>
              <span className="text-sm font-bold text-rose-400">{audience?.expiredSubscriptions ?? 0} طالب</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. ACQUISITION SECTION                                   */}
      {/* ======================================================== */}
      <section id="section-acquisition" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">3. مصادر الاستقطاب والإحالة (Acquisition)</h2>
              <p className="text-xs text-slate-400">
                توزيع الزوار حسب القنوات الأولى وحملات UTM الموثقة
              </p>
            </div>
          </div>
          <Link
            href="/ops/funnel"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>تفاصيل الإحالة والحملات</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Attribution Quality Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-300 font-semibold">حالة جودة التوثيق:</span>
            <span
              className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                acquisition?.attributionQuality.status === "REAL"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
              }`}
            >
              {acquisition?.attributionQuality.status || "PARTIAL"}
            </span>
            <span className="text-slate-400 text-[11px]">
              {acquisition?.attributionQuality.warningMessage ||
                "يتم ربط الإحالة تلقائياً عند تسجيل أو دخول الطالب"}
            </span>
          </div>

          <div className="font-mono text-slate-400 text-[11px]">
            تسجيلات بإحالة موثقة:{" "}
            <span className="text-white font-bold">
              {acquisition?.attributionQuality.attributedRegistrations ?? 0}
            </span>{" "}
            | مباشرة/غير محددة:{" "}
            <span className="text-slate-400">
              {acquisition?.attributionQuality.unattributedRegistrations ?? 0}
            </span>
          </div>
        </div>

        {/* Traffic Sources Table */}
        <div className="p-4 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="text-slate-500 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">القناة / المصدر الأول</th>
                <th className="py-2.5 px-3">الزوار</th>
                <th className="py-2.5 px-3">التسجيلات</th>
                <th className="py-2.5 px-3">فترة تجريبية</th>
                <th className="py-2.5 px-3">اشتراكات مدفوعة</th>
                <th className="py-2.5 px-3">الإيرادات الموثقة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {(acquisition?.topSources || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-500">
                    لا توجد بيانات قنوات استقطاب كافية حالياً
                  </td>
                </tr>
              ) : (
                (acquisition?.topSources || []).map((src) => (
                  <tr key={src.source} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-semibold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span>{src.source}</span>
                    </td>
                    <td className="py-2.5 px-3 font-mono">{src.visitors}</td>
                    <td className="py-2.5 px-3 font-mono">{src.registrations}</td>
                    <td className="py-2.5 px-3 font-mono">{src.trials}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                      {src.paidStudents}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                      {src.revenue.toLocaleString()} دج
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. PRODUCT USAGE SECTION                                 */}
      {/* ======================================================== */}
      <section id="section-product" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">4. استخدام ميزات المنتج الحقيقية (Product Usage)</h2>
              <p className="text-xs text-slate-400">
                مؤشرات تفاعل التلاميذ مع ميزات شاطر الحقيقية استناداً إلى جدول الأحداث المعتمد
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-purple-400">
            إجمالي التفاعلات: {productUsage?.totalProductEvents ?? 0} حدث
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Diwan Activity */}
          <div className="p-5 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white text-sm">الديوان والمذاكرة الجماعية</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono text-xs font-bold">
                {productUsage?.diwan.total ?? 0} تفاعل
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">طاولات تم إنشاؤها (Tables Created):</span>
                <span className="font-mono font-bold text-white">{productUsage?.diwan.tablesCreated ?? 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">انضمام إلى طاولات (Tables Joined):</span>
                <span className="font-mono font-bold text-white">{productUsage?.diwan.tablesJoined ?? 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">فتح قسم الديوان (Diwan Opened):</span>
                <span className="font-mono font-bold text-white">{productUsage?.diwan.opened ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Planner Activity */}
          <div className="p-5 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white text-sm">المخطط الذكي للدروس</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono text-xs font-bold">
                {productUsage?.planner.opened ?? 0} فتح
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">مرات فتح المخطط (Planner Opened):</span>
                <span className="font-mono font-bold text-white">{productUsage?.planner.opened ?? 0}</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                يشمل مراجعة وتعديل جداول الحفظ والمراجعة الأسبوعية
              </div>
            </div>
          </div>

          {/* Exams Activity */}
          <div className="p-5 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-sm">بنك الامتحانات والتقييم</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono text-xs font-bold">
                {productUsage?.exams.total ?? 0} حدث
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">فتح الامتحانات (Exam Opened):</span>
                <span className="font-mono font-bold text-white">{productUsage?.exams.opened ?? 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">بدء الامتحان (Exam Started):</span>
                <span className="font-mono font-bold text-white">{productUsage?.exams.started ?? 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">إكمال الامتحان (Exam Completed):</span>
                <span className="font-mono font-bold text-emerald-400">{productUsage?.exams.completed ?? 0}</span>
              </div>
            </div>
          </div>

          {/* Summaries Activity */}
          <div className="p-5 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-sm">الملخصات والخرائط الذهنية</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-xs font-bold">
                {productUsage?.summaries.opened ?? 0} فتح
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">استعراض الملخصات (Summary Opened):</span>
                <span className="font-mono font-bold text-white">{productUsage?.summaries.opened ?? 0}</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                استعراض خرائط المواد ومذكرات الحفظ
              </div>
            </div>
          </div>

          {/* Calculator Activity */}
          <div className="p-5 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-sky-400" />
                <span className="font-bold text-white text-sm">حاسبة المعدل التوجيهي</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 font-mono text-xs font-bold">
                {productUsage?.calculator.used ?? 0} استخدام
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">مرات حساب المعدل (Calculator Used):</span>
                <span className="font-mono font-bold text-white">{productUsage?.calculator.used ?? 0}</span>
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                حساب المعدل الموزون والتوجيه الجامعي
              </div>
            </div>
          </div>

          {/* Other Real Product Events */}
          <div className="p-5 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Boxes className="w-4 h-4 text-teal-400" />
                <span className="font-bold text-white text-sm">أقسام تفاعلية أخرى</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 font-mono text-xs font-bold">
                {productUsage?.other.total ?? 0} حدث
              </span>
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">التوجيه الجامعي (Orientation):</span>
                <span className="font-mono font-bold text-white">{productUsage?.other.orientationOpened ?? 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">استعراض المواد (Subject Opened):</span>
                <span className="font-mono font-bold text-white">{productUsage?.other.subjectOpened ?? 0}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">تدريبات ومختبر الأخطاء:</span>
                <span className="font-mono font-bold text-white">
                  {(productUsage?.other.practiceCompleted ?? 0) + (productUsage?.other.retestCompleted ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Most Used Sections Ranking */}
        {productUsage?.mostUsedSections && productUsage.mostUsedSections.length > 0 && (
          <div className="p-4 rounded-2xl bg-[#0D1526] border border-slate-800 text-xs">
            <div className="font-bold text-white mb-2">الأقسام الأكثر تفاعلاً في المنصة</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {productUsage.mostUsedSections.map((sec) => (
                <div key={sec.name} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 font-semibold">{sec.labelAr}</span>
                    <span className="font-mono font-bold text-indigo-400">
                      {sec.count} ({sec.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(5, sec.percentage))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 5. CONVERSION SECTION                                    */}
      {/* ======================================================== */}
      <section id="section-conversion" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">5. قمع التحويل الحقيقي (Conversion Funnel)</h2>
              <p className="text-xs text-slate-400">
                تتبع مسار التلميذ من الزيارة الأولى حتى الاشتراك المدفوع الفعلي
              </p>
            </div>
          </div>
          <Link
            href="/ops/funnel"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>استعراض القمع التفاعلي الكامل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Headline Ratios */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">من زائر إلى تسجيل</span>
            <span className="text-lg font-black font-mono text-white">
              {conversion?.ratios.visitorToRegistration ?? 0}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">من تسجيل إلى تفعيل</span>
            <span className="text-lg font-black font-mono text-cyan-300">
              {conversion?.ratios.registrationToActivation ?? 0}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">من تفعيل إلى تجربة</span>
            <span className="text-lg font-black font-mono text-amber-300">
              {conversion?.ratios.activationToTrial ?? 0}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px]">من تجربة إلى اشتراك مدفوع</span>
            <span className="text-lg font-black font-mono text-emerald-400">
              {conversion?.ratios.trialToPaid ?? 0}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/60 to-purple-950/60 border border-indigo-500/40 col-span-2 sm:col-span-1">
            <span className="text-indigo-300 block text-[10px]">التحويل الإجمالي (End-to-End)</span>
            <span className="text-lg font-black font-mono text-indigo-200">
              {conversion?.ratios.overallConversion ?? 0}%
            </span>
          </div>
        </div>

        {/* Stages Pipeline */}
        <div className="p-4 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl space-y-2">
          {(conversion?.stages || []).length === 0 ? (
            <div className="py-6 text-center text-slate-500 text-xs">
              قمع التحويل قيد التجميع من الأحداث الحقيقية
            </div>
          ) : (
            (conversion?.stages || []).map((step, idx) => (
              <div
                key={step.key}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-white">{step.label}</div>
                    <div className="text-[10px] text-slate-400">{step.definition}</div>
                  </div>
                </div>

                <div className="text-left font-mono">
                  <span className="text-white font-bold text-sm">{step.count}</span>
                  {idx > 0 && (
                    <span className="text-slate-400 text-[10px] mr-2">
                      ({step.conversionFromPrev}% من السابق)
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. COMMERCE SECTION                                      */}
      {/* ======================================================== */}
      <section id="section-commerce" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">6. التجارة والطلبيات (Commerce)</h2>
              <p className="text-xs text-slate-400">
                إدارة شحنات ياليدين، الدفع عند الاستلام، والمخزون الحقيقي
              </p>
            </div>
          </div>
          <Link
            href="/ops/orders"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
          >
            <span>إدارة جميع الطلبيات ({commerce?.totalOrders ?? 0})</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Delivery & Logistics */}
          <div className="p-5 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-400" />
                <span>حالة التوصيل (Yalidine Express)</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">تغطية 58 ولاية</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300">شحنات منقولة مع ياليدين (In Transit):</span>
                <span className="font-mono font-bold text-purple-400">
                  {commerce?.delivery.inTransit ?? 0} طرد
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300">طرود تم تسليمها (Delivered):</span>
                <span className="font-mono font-bold text-emerald-400">
                  {commerce?.delivery.delivered ?? 0} طرد
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-300">قيد التجهيز والشحن:</span>
                <span className="font-mono font-bold text-amber-400">
                  {commerce?.delivery.pendingShipment ?? 0} طلب
                </span>
              </div>
            </div>
          </div>

          {/* COD & Payments Channels */}
          <div className="p-5 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>قنوات الدفع واستلام المستحقات</span>
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300">الدفع عند الاستلام (COD):</span>
                <span className="font-mono font-bold text-white">
                  {commerce?.payments.codCount ?? 0} طلب (
                  {(commerce?.payments.codRevenue ?? 0).toLocaleString()} دج)
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300">بريدي موب / CCP:</span>
                <span className="font-mono font-bold text-white">
                  {commerce?.payments.baridimobCount ?? 0} طلب (
                  {(commerce?.payments.baridimobRevenue ?? 0).toLocaleString()} دج)
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-300">البطاقة الذهبية / CIB:</span>
                <span className="font-mono font-bold text-white">
                  {commerce?.payments.onlineCount ?? 0} طلب (
                  {(commerce?.payments.onlineRevenue ?? 0).toLocaleString()} دج)
                </span>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div className="p-5 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-400" />
                <span>مخزون بطاقات وباقات شاطر</span>
              </span>
              <span className="text-[10px] text-amber-400 font-bold">
                {commerce?.inventory.status || "متوفر"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300">باقات وبطاقات جاهزة للشحن:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {commerce?.inventory.availableStudyPacks ?? 0} باقة
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-300">بطاقات محجوزة لطلبات قيد المعالجة:</span>
                <span className="font-mono font-bold text-white">
                  {commerce?.inventory.reservedCards ?? 0} بطاقة
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-300">تنبيه انخفاض المخزون:</span>
                <span className="font-mono font-bold text-slate-400">
                  {commerce?.inventory.lowStockWarning ? "نعم — يرجى تزويد المخزن" : "لا — المخزون آمن"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. GEOGRAPHY SECTION                                     */}
      {/* ======================================================== */}
      <section id="section-geography" className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">7. التوزيع الجغرافي والولايات (Geography)</h2>
              <p className="text-xs text-slate-400">
                توزيع الطلبات والتسجيلات الجغرافية الموثقة فقط (بدون محاكاة عشوائية)
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0D1526] border border-slate-800 shadow-xl">
          {!geography?.hasReliableGeography || (geography?.wilayas || []).length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <MapPin className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-bold text-slate-300">
                {geography?.message || "غير متاح — البيانات غير كافية"}
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                يتم عرض التوزيع الجغرافي حصرياً للولايات المذكورة في الطلبات الفعلية أو ملفات الطلاب المكتملة.
                المنصة تمنع توليد نسب جغرافية عشوائية أو محاكاة تقريبية.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {(geography?.wilayas || []).map((w, idx) => (
                <div
                  key={w.wilaya}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white">{w.wilaya}</span>
                  </div>

                  <div className="text-left font-mono">
                    <span className="text-teal-300 font-bold">{w.studentsCount} مسجل</span>
                    {w.ordersCount > 0 && (
                      <span className="text-slate-400 text-[10px] mr-1">({w.ordersCount} طلب)</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
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
