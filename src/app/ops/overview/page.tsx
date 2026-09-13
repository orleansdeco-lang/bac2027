"use client";

import React, { useEffect, useState } from "react";
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
} from "lucide-react";
import { OperationsOverviewKPIs } from "@/lib/operations/types";

export default function OpsOverviewPage() {
  const [kpis, setKpis] = useState<OperationsOverviewKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchOverview() {
    setLoading(true);
    try {
      const res = await fetch("/api/ops/overview");
      if (res.ok) {
        const data = await res.json();
        if (data?.kpis) setKpis(data.kpis);
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Operations Cockpit</h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 font-mono">
              Live Monitor
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time observable telemetry and authoritative signals across the Learning & Commercial Cores.
          </p>
        </div>

        <button
          onClick={fetchOverview}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 1. TODAY'S PULSE */}
      <section className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>1. Today's Pulse</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Active Students</div>
            <div className="text-2xl font-bold text-white font-mono mt-1">
              {kpis?.today.activeStudents ?? "—"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Sessions today</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">New Registrations</div>
            <div className="text-2xl font-bold text-white font-mono mt-1">
              {kpis?.today.newRegistrations ?? "—"}
            </div>
            <div className="text-[10px] text-emerald-500 mt-0.5">Stream-isolated accounts</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Missions Started</div>
            <div className="text-2xl font-bold text-white font-mono mt-1">
              {kpis?.today.missionsStarted ?? "—"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Curriculum lessons</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-indigo-300 font-medium">Learning Signals (CLE)</div>
            <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">
              {kpis?.today.completedLearningEvents ?? "—"}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Practice & Retests</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Pending Receipts</div>
            <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
              {kpis?.today.pendingReceiptsCount ?? "—"}
            </div>
            <div className="text-[10px] text-amber-500/80 mt-0.5">Requires verification</div>
          </div>
        </div>
      </section>

      {/* 2. NEEDS ACTION */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>2. Needs Action (Decisions Required)</span>
          </h2>
          <Link href="/ops/finance" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
            <span>Go to Finance Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {kpis?.needsAction.pendingPayments && kpis.needsAction.pendingPayments.length > 0 ? (
          <div className="bg-slate-900 border border-amber-900/40 rounded-xl overflow-hidden divide-y divide-slate-800">
            {kpis.needsAction.pendingPayments.map((order) => (
              <div key={order.id} className="p-3.5 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">
                      {order.studentName || order.studentEmail || order.userId.slice(0, 8)}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 uppercase font-mono">
                      {order.paymentMethod}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">
                      {order.amount} {order.currency}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Order ID: <span className="font-mono text-slate-300">{order.id}</span> · Submitted: {new Date(order.submittedAt).toLocaleTimeString()}
                  </div>
                </div>

                <Link
                  href="/ops/finance"
                  className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                >
                  Review Order
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl text-center text-xs text-slate-500">
            ✓ Zero pending payment orders. Queue is clear.
          </div>
        )}
      </section>

      {/* 3 & 4. LEARNING ACTIVITY & TRIAL/ACCESS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Learning Activity */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>3. Learning Activity</span>
            </h3>
            <Link href="/ops/pedagogy" className="text-[11px] text-indigo-400 hover:underline">
              Pedagogy View &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Completed Missions</span>
              <span className="text-lg font-bold text-white font-mono">
                {kpis?.learningActivity.totalMissionsCompleted ?? "0"}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Practice Attempts</span>
              <span className="text-lg font-bold text-white font-mono">
                {kpis?.learningActivity.totalPracticeAttempts ?? "0"}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Twin Retests Passed</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {kpis?.learningActivity.totalRetestsPassed ?? "0"}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Demonstrated Skills</span>
              <span className="text-lg font-bold text-indigo-400 font-mono">
                {kpis?.learningActivity.totalDemonstratedSkills ?? "0"}
              </span>
            </div>
          </div>
        </div>

        {/* Trial & Access */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>4. Trial & Entitlements</span>
            </h3>
            <Link href="/ops/students" className="text-[11px] text-indigo-400 hover:underline">
              Student Directory &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Active 72h Trials</span>
              <span className="text-lg font-bold text-blue-400 font-mono">
                {kpis?.trialAndAccess.activeTrials ?? "0"}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Expiring (&lt;24h)</span>
              <span className="text-lg font-bold text-amber-400 font-mono">
                {kpis?.trialAndAccess.trialsExpiringWithin24h ?? "0"}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Expired Trials</span>
              <span className="text-lg font-bold text-red-400 font-mono">
                {kpis?.trialAndAccess.expiredTrials ?? "0"}
              </span>
            </div>
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500 block">Paid Pass Holders</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">
                {kpis?.trialAndAccess.paidSubscribers ?? "0"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. PAYMENTS & REVENUE */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>5. Commercial & Revenue Pipeline</span>
          </h3>
          <Link href="/ops/finance" className="text-[11px] text-indigo-400 hover:underline">
            Manage Orders &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-500 block">Gross Revenue</span>
            <span className="text-xl font-bold text-white font-mono mt-0.5 block">
              {(kpis?.revenue.totalRevenueDZD ?? 0).toLocaleString()} DZD
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-500 block">Approved Passes</span>
            <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5 block">
              {kpis?.revenue.approvedOrdersCount ?? "0"}
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-500 block">Pending Verification</span>
            <span className="text-xl font-bold text-amber-400 font-mono mt-0.5 block">
              {kpis?.revenue.pendingOrdersCount ?? "0"}
            </span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-500 block">Rejected Orders</span>
            <span className="text-xl font-bold text-slate-400 font-mono mt-0.5 block">
              {kpis?.revenue.rejectedOrdersCount ?? "0"}
            </span>
          </div>
        </div>
      </section>

      {/* 6 & 7. SYSTEM HEALTH & AUDIT STATUS */}
      <section className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Server className="w-4 h-4 text-slate-400" />
            <span>6 & 7. System Health & Observability</span>
          </h3>
          <Link href="/ops/system" className="text-[11px] text-indigo-400 hover:underline">
            System Diagnostics &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Telemetry Buffer</span>
            <span className="font-mono font-bold text-slate-200 mt-1 block">
              {kpis?.systemHealth.telemetryEventsLogged ?? 0} events
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Client Runtime Errors</span>
            <span className="font-mono font-bold text-slate-200 mt-1 block">
              {kpis?.systemHealth.clientErrorsCount ?? 0} errors
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Database Status</span>
            <span className={`font-mono font-bold mt-1 block ${kpis?.systemHealth.databaseStatus === "HEALTHY" ? "text-emerald-400" : "text-amber-400"}`}>
              {kpis?.systemHealth.databaseStatus ?? "CONNECTING"}
            </span>
          </div>
          <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-500 block">Server Edge Time</span>
            <span className="font-mono text-[11px] text-slate-400 mt-1 block truncate">
              {kpis?.systemHealth.serverTime ? new Date(kpis.systemHealth.serverTime).toLocaleTimeString() : "—"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
