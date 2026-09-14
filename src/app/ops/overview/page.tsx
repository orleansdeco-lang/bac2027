"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  CreditCard,
  GraduationCap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Server,
  ArrowRight,
  RefreshCw,
  Sliders,
  FileCheck,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Flame,
  Layers,
  ArrowUpRight,
  Target,
  FileText,
  BadgeAlert,
  Zap,
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

    return {
      conversionRate,
      onboardingRate,
      firstActRate,
      pendingOrders,
      attentionCount,
    };
  }, [kpis]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto relative selection:bg-indigo-500/30">
      {/* Ambient background glow accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl" />
      </div>

      {/* Cockpit Top Bar */}
      <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
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
          <p className="text-xs text-slate-400 max-w-3xl">
            Authoritative operational intelligence for BAC Mastery: Conversion funnels, real-time transaction velocity, verified learning signals, and immediate anomaly triage.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
          {lastRefreshed && (
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              Refreshed: {lastRefreshed.toLocaleTimeString()}
            </span>
          )}

          <button
            onClick={fetchOverview}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-all shadow-sm hover:border-slate-600 active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Updating..." : "Refresh"}</span>
          </button>

          {derivedStats.pendingOrders > 0 && (
            <Link
              href="/ops/finance"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold transition-all shadow-sm group"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>{derivedStats.pendingOrders} Pending Orders</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>
      </header>

      {/* HERO METRIC BAR (Primary Bento Tier) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hero Card 1: Active Paid */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-900/60 backdrop-blur-xl border border-emerald-500/30 p-5 shadow-xl hover:border-emerald-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/90 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              Active Paid Students
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-mono font-semibold">
              {derivedStats.conversionRate}% Conv
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {kpis?.productStatus?.activePaidStudents ?? "—"}
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-slate-400">Subscribed</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Active Subscriptions:</span>
            <span className="font-mono font-semibold text-emerald-400">
              {kpis?.commercialOverview?.activeSubscriptions ?? 0}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
            <span>Expiring &le;24h:</span>
            <span className={`font-mono font-semibold ${kpis?.commercialOverview?.subscriptionsExpiringSoon ? "text-amber-400" : "text-slate-400"}`}>
              {kpis?.commercialOverview?.subscriptionsExpiringSoon ?? 0}
            </span>
          </div>

          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
        </div>

        {/* Hero Card 2: Total Registered */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-900/60 backdrop-blur-xl border border-indigo-500/30 p-5 shadow-xl hover:border-indigo-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400/90 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-400" />
              Total Registered
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 font-mono font-semibold">
              {derivedStats.onboardingRate}% Onboarded
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {kpis?.productStatus?.totalRegistered ?? "—"}
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-slate-400">All Accounts</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Onboarding Progress:</span>
              <span className="font-mono font-semibold text-white">
                {kpis?.productStatus?.completedOnboarding ?? 0} / {kpis?.productStatus?.totalRegistered ?? 0}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(derivedStats.onboardingRate, 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>In 72h Trial:</span>
            <span className="font-mono font-semibold text-blue-400">
              {kpis?.productStatus?.studentsInTrial ?? 0}
            </span>
          </div>

          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
        </div>

        {/* Hero Card 3: Today's Orders & Flow */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-900/60 backdrop-blur-xl border border-amber-500/30 p-5 shadow-xl hover:border-amber-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-400" />
              Today&apos;s Orders Flow
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono font-semibold">
              {derivedStats.pendingOrders} in Audit
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {kpis?.todayDetailed?.newPaymentOrdersToday ?? "0"}
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-slate-400">New Today</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Approved Today:</span>
            <span className="font-mono font-semibold text-emerald-400">
              +{kpis?.todayDetailed?.approvedPaymentsToday ?? 0}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between text-xs">
            <span className="text-slate-400">Rejected Today:</span>
            <span className="font-mono font-semibold text-rose-400">
              -{kpis?.todayDetailed?.rejectedPaymentsToday ?? 0}
            </span>
          </div>

          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
        </div>

        {/* Hero Card 4: Learning Velocity */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900/80 to-slate-900/60 backdrop-blur-xl border border-purple-500/30 p-5 shadow-xl hover:border-purple-500/50 transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400/90 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-400" />
              Learning Velocity
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 font-mono font-semibold">
              Observable
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {kpis?.todayDetailed?.activeLearningSessionsToday ?? "0"}
            </div>
            <div className="text-right">
              <span className="text-xs font-medium text-slate-400">Sessions Today</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Retests Completed Today:</span>
            <span className="font-mono font-semibold text-indigo-400">
              {kpis?.todayDetailed?.retestsToday ?? 0}
            </span>
          </div>

          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>Errors Captured Today:</span>
            <span className="font-mono font-semibold text-yellow-400">
              {kpis?.todayDetailed?.errorsRecordedToday ?? 0}
            </span>
          </div>

          <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
        </div>
      </section>

      {/* Navigation Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "all"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/60"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Cockpit</span>
        </button>

        <button
          onClick={() => setActiveTab("commercial")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "commercial"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/60"
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Commercial & Finance</span>
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
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/60"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Learning Loop Signals</span>
        </button>

        <button
          onClick={() => setActiveTab("system")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "system"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800/60"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Platform & Anomalies</span>
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
          <div className="lg:col-span-7 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Student Conversion Pipeline</h2>
                    <p className="text-[11px] text-slate-400">From account registration to active paid subscriber</p>
                  </div>
                </div>
                <Link
                  href="/ops/students"
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors"
                >
                  <span>Directory</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Visual Funnel Steps */}
              <div className="mt-5 space-y-3.5">
                {/* Step 1: Registered */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      1. Total Registered
                    </span>
                    <span className="font-mono font-bold text-white">
                      {kpis?.productStatus?.totalRegistered ?? 0}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
                    <div className="bg-slate-400 h-full rounded-full w-full" />
                  </div>
                </div>

                {/* Step 2: Onboarded */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-300 font-medium flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      2. Completed Onboarding (Stream Selected)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">({derivedStats.onboardingRate}%)</span>
                      <span className="font-mono font-bold text-indigo-300">
                        {kpis?.productStatus?.completedOnboarding ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
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
                      3. First Learning Activity (Mission Started)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({derivedStats.firstActRate}% of onboarded)
                      </span>
                      <span className="font-mono font-bold text-purple-300">
                        {kpis?.productStatus?.reachedFirstLearningActivity ?? 0}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
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
                      4. In Active Trial (72-Hour Free Window)
                    </span>
                    <span className="font-mono font-bold text-blue-300">
                      {kpis?.productStatus?.studentsInTrial ?? 0}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
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
                      5. Active Paid Students (Full Access)
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
                  <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
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

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Expired Access Accounts:</span>
              <span className="font-mono font-medium text-slate-400">
                {kpis?.productStatus?.expiredStudents ?? 0}
              </span>
            </div>
          </div>

          {/* Bento Card: Today's Operational Velocity Matrix (Col Span 5) */}
          <div className="lg:col-span-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white">Today&apos;s Velocity Matrix</h2>
                    <p className="text-[11px] text-slate-400">Daily intake, activity & verification speed</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-mono">
                  24h Window
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">New Registrations</div>
                  <div className="text-xl font-black font-mono text-white mt-1">
                    {kpis?.todayDetailed?.newRegistrationsToday ?? "0"}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Accounts created</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Trial Starts</div>
                  <div className="text-xl font-black font-mono text-blue-400 mt-1">
                    {kpis?.todayDetailed?.newTrialStartsToday ?? "0"}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Trials activated</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">New Orders</div>
                  <div className="text-xl font-black font-mono text-white mt-1">
                    {kpis?.todayDetailed?.newPaymentOrdersToday ?? "0"}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Receipts uploaded</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Approved Today</div>
                  <div className="text-xl font-black font-mono text-emerald-400 mt-1">
                    {kpis?.todayDetailed?.approvedPaymentsToday ?? "0"}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Promoted to PAID</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Errors Recorded</div>
                  <div className="text-xl font-black font-mono text-yellow-400 mt-1">
                    {kpis?.todayDetailed?.errorsRecordedToday ?? "0"}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Misconceptions</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 hover:border-slate-700 transition-colors">
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Retests Done</div>
                  <div className="text-xl font-black font-mono text-indigo-400 mt-1">
                    {kpis?.todayDetailed?.retestsToday ?? "0"}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Twin variations</div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400">Rejected Orders Today:</span>
              <span className="font-mono font-semibold text-rose-400">
                {kpis?.todayDetailed?.rejectedPaymentsToday ?? "0"}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* BENTO GRID: SECTION C (LEARNING LOOP HEALTH & OBSERVABLE EVIDENCE) */}
      {(activeTab === "all" || activeTab === "learning") && (
        <section className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Observable Learning Signals</h2>
                <p className="text-[11px] text-slate-400">
                  Strictly measurable pedagogical evidence across the learning & mastery cycle.
                </p>
              </div>
            </div>
            <Link
              href="/ops/learning"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors self-start sm:self-auto"
            >
              <span>Learning Analytics Funnel</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Step 1: Missions */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mission Mastered</span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                </div>
                <div className="text-2xl font-black font-mono text-white mt-2">
                  {kpis?.learningSignals?.completedAtLeastOneMission ?? "—"}
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-800/60 pt-2">
                Completed &ge; 1 Mission
              </div>
            </div>

            {/* Step 2: Practice */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Practice Attempts</span>
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                </div>
                <div className="text-2xl font-black font-mono text-white mt-2">
                  {kpis?.learningSignals?.completedPractice ?? "—"}
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-800/60 pt-2">
                Completed Practice exercises
              </div>
            </div>

            {/* Step 3: Error Lab */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Error Lab Triggered</span>
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                </div>
                <div className="text-2xl font-black font-mono text-yellow-400 mt-2">
                  {kpis?.learningSignals?.triggeredErrorLab ?? "—"}
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-800/60 pt-2">
                Identified misconceptions
              </div>
            </div>

            {/* Step 4: Repair (Telemetry Disclaimer) */}
            <div className="p-4 rounded-xl bg-slate-800/20 border border-dashed border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Repair Loop</span>
                  <span className="w-2 h-2 rounded-full bg-slate-600" />
                </div>
                <div className="text-2xl font-black font-mono text-slate-600 mt-2">
                  {kpis?.learningSignals?.completedRepair ? kpis.learningSignals.completedRepair : "—"}
                </div>
              </div>
              <div className="mt-3 text-[10px] text-amber-400/90 font-semibold border-t border-slate-800/60 pt-2">
                NOT TELEMETRIED
              </div>
            </div>

            {/* Step 5: Retest */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Retests Done</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-2">
                  {kpis?.learningSignals?.completedRetest ?? "—"}
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-800/60 pt-2">
                Twin variant retests
              </div>
            </div>

            {/* Step 6: Mastery Evidence */}
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Mastery Evidence</span>
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                </div>
                <div className="text-2xl font-black font-mono text-purple-400 mt-2">
                  {kpis?.learningSignals?.demonstratingMasteryEvidence ?? "—"}
                </div>
              </div>
              <div className="mt-3 text-[11px] text-slate-500 border-t border-slate-800/60 pt-2">
                Demonstrated skills verified
              </div>
            </div>
          </div>
        </section>
      )}

      {/* BENTO GRID: SECTION D (COMMERCIAL PIPELINE & FINANCE) */}
      {(activeTab === "all" || activeTab === "commercial") && (
        <section className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Commercial Queue & Subscription Lifecycle</h2>
                <p className="text-[11px] text-slate-400">Manual payment order verification, renewals and churn risk</p>
              </div>
            </div>
            <Link
              href="/ops/finance"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors self-start sm:self-auto"
            >
              <span>Manage Finance Queue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className={`p-4 rounded-xl border transition-all ${
              (kpis?.commercialOverview?.pendingPaymentOrders || 0) > 0
                ? "bg-amber-950/20 border-amber-500/40"
                : "bg-slate-800/40 border-slate-800"
            }`}>
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Pending Orders</div>
              <div className="text-2xl font-black font-mono text-amber-400 mt-2">
                {kpis?.commercialOverview?.pendingPaymentOrders ?? "0"}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">Awaiting CCP audit</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Approved Today</div>
              <div className="text-2xl font-black font-mono text-emerald-400 mt-2">
                {kpis?.commercialOverview?.approvedToday ?? "0"}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">Elevated to PAID</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Rejected Today</div>
              <div className="text-2xl font-black font-mono text-rose-400 mt-2">
                {kpis?.commercialOverview?.rejectedToday ?? "0"}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">Invalid receipts</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-[10px] font-bold text-white uppercase tracking-wider">Active Subs</div>
              <div className="text-2xl font-black font-mono text-white mt-2">
                {kpis?.commercialOverview?.activeSubscriptions ?? "0"}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">Paid subscribers</div>
            </div>

            <div className={`p-4 rounded-xl border transition-all ${
              (kpis?.commercialOverview?.subscriptionsExpiringSoon || 0) > 0
                ? "bg-amber-950/20 border-amber-500/40"
                : "bg-slate-800/40 border-slate-800"
            }`}>
              <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Expiring Soon</div>
              <div className="text-2xl font-black font-mono text-amber-400 mt-2">
                {kpis?.commercialOverview?.subscriptionsExpiringSoon ?? "0"}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">&le; 24 hours left</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expired Subs</div>
              <div className="text-2xl font-black font-mono text-slate-400 mt-2">
                {kpis?.commercialOverview?.expiredSubscriptions ?? "0"}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">Access closed</div>
            </div>
          </div>
        </section>
      )}

      {/* BENTO GRID: SECTION E (ACTIONABLE ATTENTION & ANOMALIES) */}
      {(activeTab === "all" || activeTab === "system") && (
        <section className="rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Actionable Operational Attention Queue</h2>
                <p className="text-[11px] text-slate-400">Prioritized triage items requiring immediate operator action</p>
              </div>
            </div>
            <Link
              href="/ops/issues"
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium transition-colors self-start sm:self-auto"
            >
              <span>View Full Issues Queue</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {kpis?.attentionItems && kpis.attentionItems.length > 0 ? (
              kpis.attentionItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.targetHref}
                  className="block p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 transition-all duration-150 group shadow-md"
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
              <div className="p-8 rounded-xl bg-slate-800/30 border border-slate-800/80 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-slate-200">Zero Unresolved Anomalies</div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  All platform systems, commercial orders, and student learning pipelines are operating within standard parameters.
                </p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

