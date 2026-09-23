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
    // Auto-refresh in background every 15 seconds
    const interval = setInterval(() => {
      fetchDashboard(true);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const kpis = data?.kpis;
  const alerts = data?.alerts;
  const funnel = data?.funnel || [];
  const learning = data?.learning;

  return (
    <div dir="rtl" className="min-h-screen bg-[#080D1A] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 font-sans antialiased">
      {/* ===================================================================== */}
      {/* 1. HEADER & CENTRAL PULSE BAR                                         */}
      {/* ===================================================================== */}
      <div className="rounded-3xl bg-[#0D1526]/90 backdrop-blur-2xl border border-[#1E293B] p-5 sm:p-6 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/20 shrink-0">
            <Activity className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                لوحة المؤشرات المركزية
              </h1>
              <span className="px-3 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Command Center
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>مباشر (Live)</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              المراقبة اللحظية لمسار الطلاب، مؤشرات التحويل السلوكي، والتدفق المالي الحقيقي في Supabase.
            </p>
          </div>
        </div>

        {/* Quick Actions & Navigation */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-start lg:justify-end">
          <Link
            href="/ops/payments"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold transition-all shadow-sm"
          >
            <CreditCard className="w-4 h-4" />
            <span>إدارة المدفوعات</span>
            {kpis && kpis.pendingOrdersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-black">
                {kpis.pendingOrdersCount}
              </span>
            )}
          </Link>

          <Link
            href="/ops/students"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#131D31] hover:bg-[#1E293B] border border-[#1E293B] text-slate-300 hover:text-white text-xs font-bold transition-all shadow-sm"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>دليل الطلاب (360°)</span>
          </Link>

          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#131D31] hover:bg-[#1E293B] border border-[#1E293B] text-slate-300 hover:text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-50"
            title="تحديث البيانات لحظياً"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. ROW 1: PRIMARY EXECUTIVE KPI CARDS (4 CARDS)                       */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Total Students & Breakdown */}
        <div className="rounded-3xl bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] p-5 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-indigo-400">
            <span className="text-xs font-bold uppercase tracking-wider">إجمالي الطلاب (Total Students)</span>
            <Users className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                {kpis ? kpis.totalStudents : "—"}
              </span>
              <span className="text-xs text-slate-400">تلميذ مسجل</span>
            </div>

            <div className="flex items-center gap-1.5 mt-3">
              <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${kpis ? kpis.paidRatio : 0}%` }}
                  title={`PAID: ${kpis?.paidStudents || 0}`}
                />
                <div
                  className="bg-blue-500 h-full"
                  style={{
                    width: `${
                      kpis && kpis.totalStudents > 0
                        ? Math.round((kpis.trialStudents / kpis.totalStudents) * 100)
                        : 0
                    }%`,
                  }}
                  title={`TRIAL: ${kpis?.trialStudents || 0}`}
                />
                <div
                  className="bg-rose-500 h-full"
                  style={{
                    width: `${
                      kpis && kpis.totalStudents > 0
                        ? Math.round((kpis.expiredStudents / kpis.totalStudents) * 100)
                        : 0
                    }%`,
                  }}
                  title={`EXPIRED: ${kpis?.expiredStudents || 0}`}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#1E293B] text-center text-[10px] font-mono">
            <div className="p-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300">
              <span className="block font-bold">PAID</span>
              <span>{kpis?.paidStudents || 0}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-blue-950/40 border border-blue-800/40 text-blue-300">
              <span className="block font-bold">TRIAL</span>
              <span>{kpis?.trialStudents || 0}</span>
            </div>
            <div className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-rose-300">
              <span className="block font-bold">EXPIRED</span>
              <span>{kpis?.expiredStudents || 0}</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Pending Queue & Stale Alert */}
        <div
          className={`rounded-3xl backdrop-blur-xl border p-5 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden transition-all ${
            kpis && kpis.stalePendingCount > 0
              ? "bg-rose-950/20 border-rose-500/50 hover:border-rose-400"
              : "bg-[#0D1526]/90 border-[#1E293B] hover:border-amber-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              طلبات الدفع المعلقة (Queue)
            </span>
            <Clock className={`w-5 h-5 ${kpis && kpis.pendingOrdersCount > 0 ? "animate-spin-slow text-amber-400" : "text-slate-400"}`} />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                {kpis ? kpis.pendingOrdersCount : "—"}
              </span>
              <span className="text-xs text-slate-400">طلب قيد المراجعة</span>
            </div>

            <div className="text-xs text-amber-300 font-mono mt-1">
              بقيمة: <strong>{kpis ? kpis.pendingOrdersRevenue.toLocaleString() : "0"} دج</strong>
            </div>
          </div>

          {/* Stale Alert Message */}
          <div className="pt-2 border-t border-[#1E293B]">
            {kpis && kpis.stalePendingCount > 0 ? (
              <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-[11px] font-bold animate-pulse">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>⚠️ {kpis.stalePendingCount} طلبات عالقة لأكثر من 12 ساعة!</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>جميع الطلبات مراجعة في وقت قياسي</span>
              </div>
            )}
          </div>
        </div>

        {/* KPI 3: Revenue (DZD Multi-Period) */}
        <div className="rounded-3xl bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">الإيرادات المحققة (Revenue)</span>
            <CreditCard className="w-5 h-5" />
          </div>

          <div>
            <div className="text-[11px] text-slate-400">مداخيل اليوم (Today):</div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-emerald-300 font-mono">
                +{kpis ? kpis.todayRevenue.toLocaleString() : "0"}
              </span>
              <span className="text-xs text-slate-400 font-bold">دج</span>
            </div>

            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>الأسبوع: <strong className="font-mono text-slate-200">{kpis ? kpis.weekRevenue.toLocaleString() : "0"} دج</strong></span>
              <span>الشهر: <strong className="font-mono text-slate-200">{kpis ? kpis.monthRevenue.toLocaleString() : "0"} دج</strong></span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px]">
            <span className="text-slate-400">إجمالي المداخيل:</span>
            <span className="font-mono font-black text-white text-xs">
              {kpis ? kpis.totalRevenue.toLocaleString() : "0"} دج
            </span>
          </div>
        </div>

        {/* KPI 4: Today's Activity & Engagement */}
        <div className="rounded-3xl bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-bold uppercase tracking-wider">نشاط اليوم (Today's Live)</span>
            <Flame className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                {kpis ? kpis.activeStudentsToday : "—"}
              </span>
              <span className="text-xs text-slate-400">طالب نشط اليوم</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">دروس مفتوحة</span>
                <span className="font-mono font-bold text-white">{kpis ? kpis.lessonsViewedToday : 0}</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">تمارين مكتملة</span>
                <span className="font-mono font-bold text-emerald-400">{kpis ? kpis.exercisesCompletedToday : 0}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1E293B] flex items-center justify-between text-[11px] text-slate-400">
            <span>ساعات المذاكرة المقدرة:</span>
            <span className="font-mono font-bold text-cyan-300">
              ~{kpis ? kpis.estimatedStudyHoursToday : 0} ساعة اليوم
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. ROW 2: ACTIONABLE OPERATIONAL ALERTS WALL (جدار التنبيهات)          */}
      {/* ===================================================================== */}
      <div className="rounded-3xl bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E293B] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>جدار التنبيهات التشغيلية الذكية (Actionable Alerts)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تنبيهات فورية لاتخاذ قرارات سريعة وتفادي خسارة الطلاب أو تأخير تفعيل الوصول.
              </p>
            </div>
          </div>

          {/* Alert Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#10192E] border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveAlertTab("stale_pending")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeAlertTab === "stale_pending"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>طلبات عالقة (&gt;12h)</span>
              {alerts && alerts.stalePending.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-mono">
                  {alerts.stalePending.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveAlertTab("expiring_soon")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeAlertTab === "expiring_soon"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>تنتهي قريباً (3–7d)</span>
              {alerts && alerts.expiringSoon.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-mono">
                  {alerts.expiringSoon.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveAlertTab("dropoffs")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeAlertTab === "dropoffs"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>انقطاع ما بعد التسجيل</span>
              {alerts && alerts.dropoffs.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-mono">
                  {alerts.dropoffs.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: STALE PENDING ORDERS */}
        {activeAlertTab === "stale_pending" && (
          <div>
            {alerts && alerts.stalePending.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {alerts.stalePending.map((alert) => (
                  <div
                    key={alert.orderId}
                    className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/40 hover:border-rose-400 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>انتظار: {alert.hoursWaiting} ساعة</span>
                      </span>
                      <span className="text-xs font-mono font-bold text-white">
                        {alert.amount.toLocaleString()} دج
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-bold text-white truncate">{alert.studentName}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>معرف: {alert.orderId.slice(0, 8)}</span>
                        <span>•</span>
                        <span className="uppercase">{alert.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-rose-900/40">
                      {alert.studentPhone ? (
                        <a
                          href={`https://wa.me/213${alert.studentPhone.replace(/^0/, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-mono"
                          title="محادثة واتساب سريعة"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{alert.studentPhone}</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500">لا يوجد هاتف</span>
                      )}

                      <Link
                        href="/ops/payments"
                        className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-sm"
                      >
                        معالجة الآن
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#10192E] rounded-2xl border border-slate-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-white">لا توجد طلبات متأخرة</div>
                <p className="text-xs text-slate-400">
                  كافة طلبات الدفع تمت مراجعتها خلال الـ 12 ساعة الماضية.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXPIRING SOON (3-7 DAYS) */}
        {activeAlertTab === "expiring_soon" && (
          <div>
            {alerts && alerts.expiringSoon.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {alerts.expiringSoon.map((alert) => (
                  <div
                    key={alert.studentId}
                    className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/40 hover:border-amber-400 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>متبقي: {alert.daysRemaining} أيام</span>
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {new Date(alert.expiresAt).toLocaleDateString("ar-DZ")}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-bold text-white truncate">{alert.studentName}</div>
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                        <span>{alert.wilayaName || "ولاية غير محددة"}</span>
                        <span>•</span>
                        <span className="text-amber-300 font-bold">{alert.plan}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-amber-900/40">
                      {alert.studentPhone ? (
                        <a
                          href={`https://wa.me/213${alert.studentPhone.replace(/^0/, "")}?text=${encodeURIComponent(
                            `مرحباً ${alert.studentName}، نود تذكيرك بأن اشتراكك في منصة شاطر سينتهي خلال ${alert.daysRemaining} أيام. يسعدنا استمرارك معنا لتحقيق التفوق في البكالوريا!`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>تذكير واتساب للتجديد</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500">لا يوجد هاتف</span>
                      )}

                      <Link
                        href={`/ops/students/${alert.studentId}`}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-mono"
                      >
                        الملف 360°
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#10192E] rounded-2xl border border-slate-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-white">لا توجد اشتراكات تنتهي خلال هذا الأسبوع</div>
                <p className="text-xs text-slate-400">جميع اشتراكات الطلاب النشطة ممتدة إلى فترات كافية.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DROPOFFS (INCOMPLETE ONBOARDING / DIAGNOSTIC) */}
        {activeAlertTab === "dropoffs" && (
          <div>
            {alerts && alerts.dropoffs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {alerts.dropoffs.map((alert) => (
                  <div
                    key={alert.studentId}
                    className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/40 hover:border-indigo-400 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                        لم يكمل التهيئة والتشخيص
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(alert.createdAt).toLocaleDateString("ar-DZ")}
                      </span>
                    </div>

                    <div>
                      <div className="text-sm font-bold text-white truncate">{alert.studentName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{alert.wilayaName || "—"}</div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-indigo-900/40">
                      {alert.studentPhone ? (
                        <a
                          href={`https://wa.me/213${alert.studentPhone.replace(/^0/, "")}?text=${encodeURIComponent(
                            `مرحباً ${alert.studentName}، نرحب بك في منصة شاطر! لاحظنا أنك لم تبدأ بعد الاختبار التشخيصي لتحديد خطة مراجعتك. هل تحتاج لأي مساعدة؟`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>مساعدة الطالب واتساب</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-500">لا يوجد هاتف</span>
                      )}

                      <Link
                        href={`/ops/students/${alert.studentId}`}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-mono"
                      >
                        الملف 360°
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#10192E] rounded-2xl border border-slate-800 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-white">لا يوجد طلاب متوقفون عند التسجيل</div>
                <p className="text-xs text-slate-400">جميع الطلاب المسجلين أكملوا خطوات التهيئة الأولية.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 4. ROW 3: STUDENT JOURNEY & CONVERSION FUNNEL (قمع التحويل السلوكي)     */}
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
                  Observable Telemetry Events
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                تتبع انسياب الطالب خطوة بخطوة من أول زيارة للموقع حتى التحول لاشتراك مدفوع ومفعل (PAID).
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
        <div className="space-y-4 pt-1">
          {funnel.map((step, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === funnel.length - 1;

            return (
              <div
                key={step.id}
                className="p-4 rounded-2xl bg-[#10192E]/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2 group"
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
                <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800 flex">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isLast
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30"
                        : "bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-400"
                    }`}
                    style={{ width: `${Math.max(4, step.percentageOfTotal)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 5. ROW 4: LEARNING METRICS & DEMOGRAPHIC DISTRIBUTION                 */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Learning Intelligence Card (Col 4) */}
        <div className="lg:col-span-4 rounded-3xl bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 text-purple-400">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>مؤشرات التعلم والاتقان (Learning Engine)</span>
            </span>
          </div>

          <div className="space-y-3">
            {/* Completion Rate */}
            <div className="p-3.5 rounded-2xl bg-[#10192E] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-bold">نسبة نجاح التمارين (Practice Success)</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  {learning?.exerciseCompletionRate ?? 76}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                  style={{ width: `${learning?.exerciseCompletionRate ?? 76}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {learning?.correctAnswersCount || 0} إجابة صحيحة من أصل {learning?.totalAttemptsCount || 0} محاولة
              </div>
            </div>

            {/* Missions Mastered */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-[#10192E] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">المهام المتقنة</span>
                <span className="font-mono font-black text-white text-lg mt-0.5 block">
                  {learning?.missionsMasteredCount || 0}
                </span>
                <span className="text-[9px] text-indigo-400">Missions Mastered</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#10192E] border border-slate-800">
                <span className="text-[10px] text-slate-400 block">اختبارات توأمية مجتازة</span>
                <span className="font-mono font-black text-emerald-400 text-lg mt-0.5 block">
                  {learning?.retestsPassedCount || 0}
                </span>
                <span className="text-[9px] text-emerald-500">Twin Retests Passed</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1E293B] text-[11px] text-slate-400 flex items-center justify-between">
            <span>مراقبة التعلم الفردي:</span>
            <Link href="/ops/learning" className="text-indigo-400 hover:underline flex items-center gap-1 font-bold">
              <span>التحليلات البيداغوجية</span>
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>
        </div>

        {/* Top Streams Distribution (Col 4) */}
        <div className="lg:col-span-4 rounded-3xl bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 text-indigo-400">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>الشعب الأكثر تسجيلاً (BAC Streams)</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">توزيع الطلاب</span>
          </div>

          <div className="space-y-2.5">
            {learning?.topStreams && learning.topStreams.length > 0 ? (
              learning.topStreams.map((s) => (
                <div key={s.streamId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{s.nameAr}</span>
                    <span className="font-mono font-bold text-indigo-300">
                      {s.count} طالب ({s.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                      style={{ width: `${Math.max(5, s.percentage)}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">لا توجد بيانات شعب بعد</div>
            )}
          </div>
        </div>

        {/* Top Wilayas Distribution (Col 4) */}
        <div className="lg:col-span-4 rounded-3xl bg-[#0D1526]/90 backdrop-blur-xl border border-[#1E293B] p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-3 text-cyan-400">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-white">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>الولايات الأكثر نشاطاً (Top Wilayas)</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">التوزيع الجغرافي</span>
          </div>

          <div className="space-y-2">
            {learning?.topWilayas && learning.topWilayas.length > 0 ? (
              learning.topWilayas.map((w, idx) => (
                <div
                  key={w.wilayaName}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#10192E] border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-mono flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white">{w.wilayaName}</span>
                  </div>
                  <span className="font-mono font-bold text-cyan-300">
                    {w.count} طالب ({w.percentage}%)
                  </span>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-slate-500">لا توجد بيانات ولايات مسجلة بعد</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
