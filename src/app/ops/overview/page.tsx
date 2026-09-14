"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  CreditCard,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
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
} from "lucide-react";
import { OperationsOverviewKPIs } from "@/lib/operations/types";
import { opsFetch } from "@/lib/operations/client-api";

type CockpitTab = "all" | "commercial" | "learning" | "system";

export default function OpsOverviewPage() {
  const [kpis, setKpis] = useState<OperationsOverviewKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<CockpitTab>("all");

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await opsFetch("/api/ops/overview");
      if (res.ok) {
        const data = await res.json();
        if (data?.kpis) {
          setKpis(data.kpis);
          setLastRefreshed(new Date());
        }
      }
    } catch (err) {
      console.error("Failed to load overview KPIs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOverview();
  }, []);

  // Derived statistics for Bento presentation
  const derivedStats = useMemo(() => {
    const total = kpis?.productStatus?.totalRegistered || 0;
    const paid = kpis?.productStatus?.activePaidStudents || 0;
    const onboarded = kpis?.productStatus?.completedOnboarding || 0;
    const firstAct = kpis?.productStatus?.reachedFirstLearningActivity || 0;
    const inTrial = kpis?.productStatus?.studentsInTrial || 0;

    const conversionRate = total > 0 ? ((paid / total) * 100).toFixed(1) : "0.0";
    const onboardingRate = total > 0 ? Math.round((onboarded / total) * 100) : 0;
    const firstActRate = onboarded > 0 ? Math.round((firstAct / onboarded) * 100) : 0;

    const pendingOrders = kpis?.commercialOverview?.pendingPaymentOrders || 0;
    const attentionCount = kpis?.attentionItems?.length || 0;
    const expiringSoon = kpis?.commercialOverview?.subscriptionsExpiringSoon || 0;

    return {
      conversionRate,
      onboardingRate,
      firstActRate,
      pendingOrders,
      attentionCount,
      expiringSoon,
    };
  }, [kpis]);

  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto relative selection:bg-indigo-500/30">
      {/* Ambient background lighting mesh */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
      </div>

      {/* Cockpit Top Bar */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#0D1526]/80 backdrop-blur-xl border border-[#1E293B]/80 shadow-2xl">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              Operations Command Cockpit
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-mono font-bold tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              REALTIME LIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            المركز القيادي الموحد لمنصة BAC Mastery: مراقبة التحويلات البيداغوجية، تفعيل الاشتراكات اليدوي عبر واتساب، وتدفق الاختبارات التوأمية.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center shrink-0">
          {lastRefreshed && (
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              آخر تحديث: {lastRefreshed.toLocaleTimeString()}
            </span>
          )}

          <button
            onClick={fetchOverview}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#131D31] hover:bg-[#1A2640] border border-[#1E293B] text-xs font-semibold text-slate-200 transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "جارِ التحديث..." : "تحديث فوري"}</span>
          </button>

          <Link
            href="/ops/subscriptions"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all shadow-sm group"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>تفعيل اشتراك يدوي</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </header>

      {/* WHATSAPP MANUAL PAYMENT WORKFLOW BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0D1526]/90 to-[#0D1526]/70 border border-emerald-500/30 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">مسار التحقق والتفعيل اليدوي عبر واتساب</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono">
                WhatsApp Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              يتم استلام الإيصالات (BaridiMob / CCP) مباشرة عبر واتساب ثم إطلاق وتمديد الاشتراك بنقرة واحدة من لوحة التحكم.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/ops/students"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#131D31] hover:bg-[#1A2640] border border-[#1E293B] text-xs font-medium text-slate-200 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>دليل الطلاب</span>
          </Link>
          <Link
            href="/ops/finance"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md shadow-emerald-600/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>طابور المراجعة ({derivedStats.pendingOrders})</span>
          </Link>
        </div>
      </div>

      {/* HERO METRIC BAR (Primary Bento Tier) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hero Card 1: Active Paid */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/30 via-[#0D1526]/90 to-[#0D1526]/60 backdrop-blur-xl border border-emerald-500/30 p-5 shadow-xl hover:border-emerald-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/90 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              المشتركون المفعلون (Paid)
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono font-semibold">
              {derivedStats.conversionRate}% نسبة التحويل
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {kpis?.productStatus?.activePaidStudents ?? "0"}
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-slate-400">اشتراك نشط</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E293B]/80 flex items-center justify-between text-xs text-slate-400">
            <span>الاشتراكات السارية:</span>
            <span className="font-mono font-semibold text-emerald-400">
              {kpis?.commercialOverview?.activeSubscriptions ?? 0}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>تنتهي خلال 24 ساعة:</span>
            <span className={`font-mono font-semibold ${derivedStats.expiringSoon > 0 ? "text-amber-400 animate-pulse" : "text-slate-400"}`}>
              {derivedStats.expiringSoon}
            </span>
          </div>

          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
        </div>

        {/* Hero Card 2: Total Registered */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/30 via-[#0D1526]/90 to-[#0D1526]/60 backdrop-blur-xl border border-indigo-500/30 p-5 shadow-xl hover:border-indigo-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400/90 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              إجمالي الطلاب المسجلين
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-mono font-semibold">
              {derivedStats.onboardingRate}% أكملوا التسجيل
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {kpis?.productStatus?.totalRegistered ?? "0"}
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-slate-400">كل الحسابات</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E293B]/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>إكمال اختيار الشعبة:</span>
              <span className="font-mono font-semibold text-white">
                {kpis?.productStatus?.completedOnboarding ?? 0} / {kpis?.productStatus?.totalRegistered ?? 0}
              </span>
            </div>
            <div className="w-full bg-[#131D31] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(derivedStats.onboardingRate, 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>في الفترة التجريبية (72h):</span>
            <span className="font-mono font-semibold text-blue-400">
              {kpis?.productStatus?.studentsInTrial ?? 0}
            </span>
          </div>

          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
        </div>

        {/* Hero Card 3: Today's Orders & Flow */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/30 via-[#0D1526]/90 to-[#0D1526]/60 backdrop-blur-xl border border-amber-500/30 p-5 shadow-xl hover:border-amber-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-400" />
              تدفق طلبات اليوم
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono font-semibold">
              {derivedStats.pendingOrders} بانتظار التأكيد
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {kpis?.todayDetailed?.newPaymentOrdersToday ?? "0"}
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-slate-400">طلب جديد اليوم</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E293B]/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">المفعلة اليوم:</span>
            <span className="font-mono font-semibold text-emerald-400">
              +{kpis?.todayDetailed?.approvedPaymentsToday ?? 0}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-400">المرفوضة اليوم:</span>
            <span className="font-mono font-semibold text-rose-400">
              -{kpis?.todayDetailed?.rejectedPaymentsToday ?? 0}
            </span>
          </div>

          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
        </div>

        {/* Hero Card 4: Learning Velocity */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950/30 via-[#0D1526]/90 to-[#0D1526]/60 backdrop-blur-xl border border-purple-500/30 p-5 shadow-xl hover:border-purple-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400/90 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-400" />
              النشاط البيداغوجي الحي
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono font-semibold">
              Live Evidence
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {kpis?.todayDetailed?.activeLearningSessionsToday ?? "0"}
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-slate-400">جلسة تدريب اليوم</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#1E293B]/80 flex items-center justify-between text-xs text-slate-400">
            <span>إعادة اختبار منجزة:</span>
            <span className="font-mono font-semibold text-indigo-400">
              {kpis?.todayDetailed?.retestsToday ?? 0}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>أخطاء مسجلة اليوم:</span>
            <span className="font-mono font-semibold text-yellow-400">
              {kpis?.todayDetailed?.errorsRecordedToday ?? 0}
            </span>
          </div>

          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
        </div>
      </section>

      {/* Navigation Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#1E293B]/80 pb-3">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "all"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-[#0D1526]/80 text-slate-400 hover:text-slate-200 hover:bg-[#131D31] border border-[#1E293B]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>كل اللوحة (All Cockpit)</span>
        </button>

        <button
          onClick={() => setActiveTab("commercial")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "commercial"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-[#0D1526]/80 text-slate-400 hover:text-slate-200 hover:bg-[#131D31] border border-[#1E293B]"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>المالية والتفعيل (WhatsApp & Finance)</span>
          {derivedStats.pendingOrders > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
              {derivedStats.pendingOrders}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("learning")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "learning"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-[#0D1526]/80 text-slate-400 hover:text-slate-200 hover:bg-[#131D31] border border-[#1E293B]"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>إشارات التعلم (Learning Signals)</span>
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "system"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-[#0D1526]/80 text-slate-400 hover:text-slate-200 hover:bg-[#131D31] border border-[#1E293B]"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>التنبيهات والأعطال (Anomalies)</span>
          {derivedStats.attentionCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
              {derivedStats.attentionCount}
            </span>
          )}
        </button>
      </div>

      {/* BENTO GRID: SECTION A & B (PRODUCT FUNNEL & TODAY'S VELOCITY) */}
      {(activeTab === "all" || activeTab === "commercial") && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Bento Card: Conversion Pipeline Funnel (Col Span 7) */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0D1526]/80 backdrop-blur-xl border border-[#1E293B]/80 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]/80">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">قمع تحويل الطلاب (Conversion Pipeline)</h2>
                    <p className="text-[11px] text-slate-400">تتبع مسار التلميذ من التسجيل وحتى التفعيل الدائم</p>
                  </div>
                </div>
                <Link
                  href="/ops/students"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                >
                  <span>دليل الطلاب</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Visual Funnel Steps */}
              <div className="mt-5 space-y-4">
                {/* Step 1: Registered */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      1. إجمالي الطلاب المسجلين
                    </span>
                    <span className="font-mono font-bold text-white">
                      {kpis?.productStatus?.totalRegistered ?? 0}
                    </span>
                  </div>
                  <div className="w-full bg-[#131D31] h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-400 h-full rounded-full w-full" />
                  </div>
                </div>

                {/* Step 2: Onboarded */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      2. إكمال الـ Onboarding واختيار الشعبة
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">({derivedStats.onboardingRate}%)</span>
                      <span className="font-mono font-bold text-indigo-300">
                        {kpis?.productStatus?.completedOnboarding ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-[#131D31] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(derivedStats.onboardingRate, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Step 3: First Activity */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      3. بدء أول نشاط تعليمي (First Activity)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({derivedStats.firstActRate}% من المسجلين)
                      </span>
                      <span className="font-mono font-bold text-purple-300">
                        {kpis?.productStatus?.reachedFirstLearningActivity ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-[#131D31] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (kpis?.productStatus?.totalRegistered || 0) > 0
                            ? Math.min(
                                Math.round(
                                  ((kpis?.productStatus?.reachedFirstLearningActivity || 0) /
                                    (kpis?.productStatus?.totalRegistered || 1)) *
                                    100
                                ),
                                100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Step 4: Active Trial */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      4. في التجربة المجانية (72h Free Window)
                    </span>
                    <span className="font-mono font-bold text-blue-300">
                      {kpis?.productStatus?.studentsInTrial ?? 0}
                    </span>
                  </div>
                  <div className="w-full bg-[#131D31] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (kpis?.productStatus?.totalRegistered || 0) > 0
                            ? Math.min(
                                Math.round(
                                  ((kpis?.productStatus?.studentsInTrial || 0) /
                                    (kpis?.productStatus?.totalRegistered || 1)) *
                                    100
                                ),
                                100
                              )
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                {/* Step 5: Active Paid Subscribed */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-emerald-400 font-semibold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      5. الاشتراكات المدفوعة المفعلة (Paid Access)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-emerald-400/80 font-mono">
                        ({derivedStats.conversionRate}%)
                      </span>
                      <span className="font-mono font-bold text-emerald-400">
                        {kpis?.productStatus?.activePaidStudents ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-[#131D31] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-sm shadow-emerald-500"
                      style={{
                        width: `${Math.min(parseFloat(derivedStats.conversionRate), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1E293B]/80 flex items-center justify-between text-xs text-slate-400">
              <span>حسابات انتهت فترتها التجريبية (Expired Access):</span>
              <span className="font-mono font-medium text-slate-400">
                {kpis?.productStatus?.expiredStudents ?? 0}
              </span>
            </div>
          </div>

          {/* Bento Card: Today's Operational Velocity Matrix (Col Span 5) */}
          <div className="lg:col-span-5 rounded-2xl bg-[#0D1526]/80 backdrop-blur-xl border border-[#1E293B]/80 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#1E293B]/80">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">مصفوفة السرعة التشغيلية لليوم</h2>
                    <p className="text-[11px] text-slate-400">معدل الدخول، الإجابات، والتحقق خلال 24 ساعة</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#131D31] border border-[#1E293B] text-slate-400 font-mono">
                  24h Window
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3.5 rounded-xl bg-[#131D31]/70 border border-[#1E293B] hover:border-[#1E293B]/80 transition-colors">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">تسجيلات جديدة</div>
                  <div className="text-xl font-black font-mono text-white mt-1">
                    {kpis?.todayDetailed?.newRegistrationsToday ?? "0"}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">حسابات تم إنشاؤها</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#131D31]/70 border border-[#1E293B] hover:border-[#1E293B]/80 transition-colors">
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">بدء التجربة</div>
                  <div className="text-xl font-black font-mono text-blue-400 mt-1">
                    {kpis?.todayDetailed?.newTrialStartsToday ?? "0"}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">تجارب مفعلة</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#131D31]/70 border border-[#1E293B] hover:border-[#1E293B]/80 transition-colors">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">طلبات دفع جديدة</div>
                  <div className="text-xl font-black font-mono text-white mt-1">
                    {kpis?.todayDetailed?.newPaymentOrdersToday ?? "0"}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">إيصالات مرفوعة</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#131D31]/70 border border-[#1E293B] hover:border-[#1E293B]/80 transition-colors">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">تمت ترقيتها اليوم</div>
                  <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                    {kpis?.todayDetailed?.approvedPaymentsToday ?? "0"}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">تم تفعيل PAID</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#131D31]/70 border border-[#1E293B] hover:border-[#1E293B]/80 transition-colors">
                  <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">أخطاء مرصودة</div>
                  <div className="text-xl font-black font-mono text-yellow-400 mt-1">
                    {kpis?.todayDetailed?.errorsRecordedToday ?? "0"}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">معمل الأخطاء</div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#131D31]/70 border border-[#1E293B] hover:border-[#1E293B]/80 transition-colors">
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">إعادة اختبار توأمي</div>
                  <div className="text-xl font-black font-mono text-indigo-400 mt-1">
                    {kpis?.todayDetailed?.retestsToday ?? "0"}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Twin Retests</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1E293B]/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">طلبات مرفوضة اليوم:</span>
              <span className="font-mono font-semibold text-rose-400">
                {kpis?.todayDetailed?.rejectedPaymentsToday ?? "0"}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* BENTO GRID: SECTION C (LEARNING LOOP HEALTH & OBSERVABLE EVIDENCE) */}
      {(activeTab === "all" || activeTab === "learning") && (
        <section className="rounded-2xl bg-[#0D1526]/80 backdrop-blur-xl border border-[#1E293B]/80 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[#1E293B]/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">إشارات التعلم والتمكن البيداغوجي (Observable Evidence)</h2>
                <p className="text-[11px] text-slate-400">
                  حقائق رقمية مباشرة من جداول Supabase للدروس والتدريبات ومعمل الأخطاء
                </p>
              </div>
            </div>
            <Link
              href="/ops/learning"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors self-start sm:self-auto"
            >
              <span>تحليلات التعلم التفصيلية</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Step 1: Missions */}
            <div className="p-4 rounded-xl bg-[#131D31]/60 border border-[#1E293B] hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">مهام مكتملة</span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                </div>
                <div className="text-2xl font-black font-mono text-white mt-2">
                  {kpis?.learningSignals?.completedAtLeastOneMission ?? "0"}
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 border-t border-[#1E293B]/60 pt-2">
                أكمل &ge; 1 مهمة بنجاح
              </div>
            </div>

            {/* Step 2: Practice */}
            <div className="p-4 rounded-xl bg-[#131D31]/60 border border-[#1E293B] hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">محاولات التدريب</span>
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                <div className="text-2xl font-black font-mono text-white mt-2">
                  {kpis?.learningSignals?.completedPractice ?? "0"}
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 border-t border-[#1E293B]/60 pt-2">
                تمارين تدريبية مكتملة
              </div>
            </div>

            {/* Step 3: Error Lab */}
            <div className="p-4 rounded-xl bg-[#131D31]/60 border border-[#1E293B] hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">معمل الأخطاء</span>
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                </div>
                <div className="text-2xl font-black font-mono text-yellow-400 mt-2">
                  {kpis?.learningSignals?.triggeredErrorLab ?? "0"}
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 border-t border-[#1E293B]/60 pt-2">
                أخطاء مفاهيمية تم رصدها
              </div>
            </div>

            {/* Step 4: Repair */}
            <div className="p-4 rounded-xl bg-[#131D31]/30 border border-dashed border-[#1E293B] hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">حلقة المعالجة</span>
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                </div>
                <div className="text-2xl font-black font-mono text-slate-600 mt-2">
                  {kpis?.learningSignals?.completedRepair ? kpis.learningSignals.completedRepair : "—"}
                </div>
              </div>
              <div className="mt-3 text-[10px] text-amber-400/90 font-semibold border-t border-[#1E293B]/60 pt-2">
                NOT TELEMETRIED
              </div>
            </div>

            {/* Step 5: Retest */}
            <div className="p-4 rounded-xl bg-[#131D31]/60 border border-[#1E293B] hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">إعادة اختبار ناجحة</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-2">
                  {kpis?.learningSignals?.completedRetest ?? "0"}
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 border-t border-[#1E293B]/60 pt-2">
                اجتازوا الاختبار التوأمي
              </div>
            </div>

            {/* Step 6: Mastery Evidence */}
            <div className="p-4 rounded-xl bg-[#131D31]/60 border border-[#1E293B] hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">مهارات متمكن منها</span>
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                </div>
                <div className="text-2xl font-black font-mono text-purple-400 mt-2">
                  {kpis?.learningSignals?.demonstratingMasteryEvidence ?? "0"}
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 border-t border-[#1E293B]/60 pt-2">
                مهارات مثبتة بالأدلة
              </div>
            </div>
          </div>
        </section>
      )}

      {/* BENTO GRID: SECTION D (COMMERCIAL PIPELINE & FINANCE) */}
      {(activeTab === "all" || activeTab === "commercial") && (
        <section className="rounded-2xl bg-[#0D1526]/80 backdrop-blur-xl border border-[#1E293B]/80 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[#1E293B]/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">الاشتراكات المالية وإدارة التفعيل اليدوي</h2>
                <p className="text-[11px] text-slate-400">التحقق من إيصالات الدفع، الاشتراكات السارية، ورصد انتهاء الصلاحية</p>
              </div>
            </div>
            <Link
              href="/ops/subscriptions"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors self-start sm:self-auto"
            >
              <span>إدارة خطط الاشتراكات والتفعيل</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className={`p-4 rounded-xl border transition-all ${
              (kpis?.commercialOverview?.pendingPaymentOrders || 0) > 0
                ? "bg-amber-950/30 border-amber-500/50 shadow-md shadow-amber-500/10"
                : "bg-[#131D31]/60 border-[#1E293B]"
            }`}>
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">طلبات معلقة</div>
              <div className="text-2xl font-black font-mono text-amber-400 mt-2">
                {kpis?.commercialOverview?.pendingPaymentOrders ?? "0"}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">تحتاج تأكيد عبر واتساب</div>
            </div>

            <div className="p-4 rounded-xl bg-[#131D31]/60 border border-[#1E293B]">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">مفعلة اليوم</div>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-2">
                {kpis?.commercialOverview?.approvedToday ?? "0"}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">تم رفعها لـ PAID</div>
            </div>

            <div className="p-4 rounded-xl bg-[#131D31]/60 border border-[#1E293B]">
              <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">مرفوضة اليوم</div>
              <div className="text-2xl font-black font-mono text-rose-400 mt-2">
                {kpis?.commercialOverview?.rejectedToday ?? "0"}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">إيصال غير صالح</div>
            </div>

            <div className="p-4 rounded-xl bg-[#131D31]/60 border border-[#1E293B]">
              <div className="text-[10px] font-bold text-white uppercase tracking-wider">اشتراكات سارية</div>
              <div className="text-2xl font-black font-mono text-white mt-2">
                {kpis?.commercialOverview?.activeSubscriptions ?? "0"}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">مشتركون دائمون</div>
            </div>

            <div className={`p-4 rounded-xl border transition-all ${
              (kpis?.commercialOverview?.subscriptionsExpiringSoon || 0) > 0
                ? "bg-amber-950/30 border-amber-500/50 animate-pulse"
                : "bg-[#131D31]/60 border-[#1E293B]"
            }`}>
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">تنتهي قريباً</div>
              <div className="text-2xl font-black font-mono text-amber-400 mt-2">
                {kpis?.commercialOverview?.subscriptionsExpiringSoon ?? "0"}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">&le; 24 ساعة (تواصل واتساب)</div>
            </div>

            <div className="p-4 rounded-xl bg-[#131D31]/60 border border-[#1E293B]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">اشتراكات منتهية</div>
              <div className="text-2xl font-black font-mono text-slate-400 mt-2">
                {kpis?.commercialOverview?.expiredSubscriptions ?? "0"}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">بحاجة لتجديد</div>
            </div>
          </div>
        </section>
      )}

      {/* BENTO GRID: SECTION E (ACTIONABLE ATTENTION & ANOMALIES) */}
      {(activeTab === "all" || activeTab === "system") && (
        <section className="rounded-2xl bg-[#0D1526]/80 backdrop-blur-xl border border-[#1E293B]/80 p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-[#1E293B]/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">طابور التدخل والعمليات العاجلة (Attention Required)</h2>
                <p className="text-[11px] text-slate-400">بنود تحتاج قراراً فورياً من المشرف أو المالك</p>
              </div>
            </div>
            <Link
              href="/ops/issues"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors self-start sm:self-auto"
            >
              <span>فتح سجل الأعطال</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {kpis?.attentionItems && kpis.attentionItems.length > 0 ? (
              kpis.attentionItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.targetHref}
                  className="block p-4 rounded-xl bg-[#131D31]/80 hover:bg-[#1A2640] border border-[#1E293B] hover:border-[#1E293B]/80 transition-all duration-150 group shadow-md"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold mt-0.5 shrink-0 shadow-sm ${
                          item.severity === "P0"
                            ? "bg-rose-950/80 text-rose-300 border border-rose-700 animate-pulse"
                            : item.severity === "P1"
                            ? "bg-amber-950/80 text-amber-300 border border-amber-700"
                            : item.severity === "P2"
                            ? "bg-yellow-950/80 text-yellow-300 border border-yellow-700"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {item.severity}
                      </span>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                          {item.description}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 self-end sm:self-auto shrink-0">
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-8 rounded-xl bg-[#131D31]/30 border border-[#1E293B]/80 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-slate-200">كافة العمليات منتظمة</div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  لا توجد طلبات معلقة أو أعطال حرجة تحتاج إلى تدخل فوري.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
