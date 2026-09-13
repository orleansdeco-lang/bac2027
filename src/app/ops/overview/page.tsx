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
  Sliders,
  FileCheck,
  ShieldAlert,
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
            <h1 className="text-xl font-bold text-white tracking-tight">Operations Command Center</h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
              Live State
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative operational command cockpit: Monitor product status, daily velocity, explicit learning signals, finance, and actionable anomalies.
          </p>
        </div>

        <button
          onClick={fetchOverview}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
          <span>Refresh Cockpit</span>
        </button>
      </div>

      {/* A. PRODUCT STATUS */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>A. Product Status</span>
          </h2>
          <Link href="/ops/students" className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1">
            <span>Inspect Students</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Total Registered</div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {kpis?.productStatus?.totalRegistered ?? "—"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">All accounts</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Active Trials</div>
            <div className="text-xl font-bold text-blue-400 font-mono mt-1">
              {kpis?.productStatus?.studentsInTrial ?? "—"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">72h window</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Active Paid</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {kpis?.productStatus?.activePaidStudents ?? "—"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Subscribed</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Expired Access</div>
            <div className="text-xl font-bold text-slate-400 font-mono mt-1">
              {kpis?.productStatus?.expiredStudents ?? "—"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Trial/Sub ended</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Completed Onboarding</div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {kpis?.productStatus?.completedOnboarding ?? "—"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Stream selected</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">First Learning Activity</div>
            <div className="text-xl font-bold text-purple-400 font-mono mt-1">
              {kpis?.productStatus?.reachedFirstLearningActivity ?? "—"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Mission started</div>
          </div>
        </div>
      </section>

      {/* B. TODAY */}
      <section className="space-y-2.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>B. Today</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase">New Registrations</div>
            <div className="text-lg font-bold text-white font-mono mt-1">
              {kpis?.todayDetailed?.newRegistrationsToday ?? "0"}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase">Trial Starts</div>
            <div className="text-lg font-bold text-blue-400 font-mono mt-1">
              {kpis?.todayDetailed?.newTrialStartsToday ?? "0"}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase">New Orders</div>
            <div className="text-lg font-bold text-white font-mono mt-1">
              {kpis?.todayDetailed?.newPaymentOrdersToday ?? "0"}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase">Approved Orders</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
              {kpis?.todayDetailed?.approvedPaymentsToday ?? "0"}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase">Rejected Orders</div>
            <div className="text-lg font-bold text-red-400 font-mono mt-1">
              {kpis?.todayDetailed?.rejectedPaymentsToday ?? "0"}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase">Active Sessions</div>
            <div className="text-lg font-bold text-white font-mono mt-1">
              {kpis?.todayDetailed?.activeLearningSessionsToday ?? "0"}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase">Errors Recorded</div>
            <div className="text-lg font-bold text-yellow-400 font-mono mt-1">
              {kpis?.todayDetailed?.errorsRecordedToday ?? "0"}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase">Retests Today</div>
            <div className="text-lg font-bold text-indigo-400 font-mono mt-1">
              {kpis?.todayDetailed?.retestsToday ?? "0"}
            </div>
          </div>
        </div>
      </section>

      {/* C. LEARNING SIGNALS (EXPLICIT SIGNALS ONLY) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-purple-400" />
              <span>C. Learning Signals (Observable Evidence Only)</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Strictly observable facts across the learning loop. No arbitrary single &quot;Health Score&quot;.
            </p>
          </div>
          <Link href="/ops/learning" className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1">
            <span>Inspect Learning Funnel</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Completed &ge;1 Mission</div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {kpis?.learningSignals?.completedAtLeastOneMission ?? "—"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Missions mastered</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Completed Practice</div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {kpis?.learningSignals?.completedPractice ?? "—"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Practice attempts</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Triggered Error Lab</div>
            <div className="text-xl font-bold text-yellow-400 font-mono mt-1">
              {kpis?.learningSignals?.triggeredErrorLab ?? "—"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Identified misconceptions</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Completed Repair</div>
            <div className="text-xl font-bold text-slate-500 font-mono mt-1">
              {kpis?.learningSignals?.completedRepair ? kpis.learningSignals.completedRepair : "—"}
            </div>
            <div className="text-[10px] text-yellow-500 mt-0.5">NOT TELEMETRIED</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Completed Retest</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {kpis?.learningSignals?.completedRetest ?? "—"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Twin variant retests</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Mastery Evidence</div>
            <div className="text-xl font-bold text-indigo-400 font-mono mt-1">
              {kpis?.learningSignals?.demonstratingMasteryEvidence ?? "—"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Demonstrated skills</div>
          </div>
        </div>
      </section>

      {/* D. COMMERCIAL */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>D. Commercial</span>
          </h2>
          <Link href="/ops/finance" className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1">
            <span>Finance Queue</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Pending Orders</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1">
              {kpis?.commercialOverview?.pendingPaymentOrders ?? "0"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Awaiting verification</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Approved Today</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
              {kpis?.commercialOverview?.approvedToday ?? "0"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Elevated to PAID</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Rejected Today</div>
            <div className="text-xl font-bold text-red-400 font-mono mt-1">
              {kpis?.commercialOverview?.rejectedToday ?? "0"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Invalid receipt/notes</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Active Subscriptions</div>
            <div className="text-xl font-bold text-white font-mono mt-1">
              {kpis?.commercialOverview?.activeSubscriptions ?? "0"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Paid subscribers</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Expiring Soon</div>
            <div className="text-xl font-bold text-yellow-400 font-mono mt-1">
              {kpis?.commercialOverview?.subscriptionsExpiringSoon ?? "0"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">&le; 24 hours left</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
            <div className="text-[11px] text-slate-400">Expired Subscriptions</div>
            <div className="text-xl font-bold text-slate-400 font-mono mt-1">
              {kpis?.commercialOverview?.expiredSubscriptions ?? "0"}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Access closed</div>
          </div>
        </div>
      </section>

      {/* E. ATTENTION REQUIRED (CLICKABLE ONLY) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>E. Attention Required (Click to Act)</span>
          </h2>
          <Link href="/ops/issues" className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1">
            <span>View All Issues</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {kpis?.attentionItems && kpis.attentionItems.length > 0 ? (
            kpis.attentionItems.map((item) => (
              <Link
                key={item.id}
                href={item.targetHref}
                className="block bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold mt-0.5 ${
                        item.severity === "P0"
                          ? "bg-red-950 text-red-400 border border-red-800"
                          : item.severity === "P1"
                          ? "bg-orange-950 text-orange-400 border border-orange-800"
                          : item.severity === "P2"
                          ? "bg-yellow-950 text-yellow-400 border border-yellow-800"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {item.severity}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-medium text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-xs text-slate-400">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
              <div className="font-semibold text-slate-300">All Operational Systems Normal</div>
              <div className="text-[11px] text-slate-500">No critical anomalies require immediate intervention.</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
