"use client";

import React, { useEffect, useState } from "react";
import {
  GraduationCap,
  Target,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Brain,
  Layers,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Activity,
} from "lucide-react";
import { OperationsOverviewKPIs } from "@/lib/operations/types";

interface FunnelStep {
  name: string;
  count: number | null; // null = NOT TELEMETRIED
  description: string;
  isTelemetried: boolean;
}

export default function OpsLearningPage() {
  const [kpis, setKpis] = useState<OperationsOverviewKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch("/api/ops/overview");
        if (res.ok) {
          const data = await res.json();
          if (data?.kpis) setKpis(data.kpis);
        }
      } catch (err) {
        console.error("Failed to load learning operations:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalRegistered = kpis?.trialAndAccess
    ? (kpis.trialAndAccess.activeTrials || 0) +
      (kpis.trialAndAccess.expiredTrials || 0) +
      (kpis.trialAndAccess.paidSubscribers || 0)
    : 0;

  const completedMissions = kpis?.learningActivity?.totalMissionsCompleted || 0;
  const practiceAttempts = kpis?.learningActivity?.totalPracticeAttempts || 0;
  const retestsPassed = kpis?.learningActivity?.totalRetestsPassed || 0;
  const demonstratedSkills = kpis?.learningActivity?.totalDemonstratedSkills || 0;
  const avgAccuracy = kpis?.learningActivity?.averagePracticeAccuracy || 0;

  // Pedagogical Funnel: ONBOARDING -> DIAGNOSTIC -> FIRST MISSION -> PRACTICE -> ERROR -> REPAIR -> RETEST -> MASTERY
  const funnelSteps: FunnelStep[] = [
    {
      name: "1. Onboarding Completed",
      count: totalRegistered > 0 ? totalRegistered : 0,
      description: "Students who completed initial stream & target setup",
      isTelemetried: true,
    },
    {
      name: "2. Diagnostic Completed",
      count: null,
      description: "Students who completed baseline diagnostic assessment (telemetry pending)",
      isTelemetried: false,
    },
    {
      name: "3. First Mission",
      count: completedMissions,
      description: "Students who initiated their first personalized learning mission",
      isTelemetried: true,
    },
    {
      name: "4. Practice Attempts",
      count: practiceAttempts,
      description: "Formative recall & practice questions attempted",
      isTelemetried: true,
    },
    {
      name: "5. Error Lab Triggered",
      count: kpis?.learningSignals?.triggeredErrorLab ?? null,
      description: "Errors identified and captured in student error book",
      isTelemetried: true,
    },
    {
      name: "6. Guided Repair",
      count: null, // Explicit invariant: Not currently telemetried separately
      description: "Deep pedagogical repair & reflection steps completed",
      isTelemetried: false,
    },
    {
      name: "7. Retests Passed",
      count: retestsPassed,
      description: "Unseen twin variant retests passed with verified confidence",
      isTelemetried: true,
    },
    {
      name: "8. Mastery Demonstrated",
      count: demonstratedSkills,
      description: "Skills elevated to authoritatively verified mastery state",
      isTelemetried: true,
    },
  ];

  // Retention Cohorts
  const retentionCohorts = [
    { label: "D1", value: null, note: "Day 1 return rate" },
    { label: "D3", value: null, note: "Day 3 return rate" },
    { label: "D7", value: null, note: "Day 7 return rate" },
    { label: "D14", value: null, note: "Day 14 return rate" },
    { label: "D30", value: null, note: "Day 30 return rate" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Learning Operations</h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 font-mono">
              Pedagogical Funnel
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Measures actual utilization of the BAC Mastery learning engine: onboarding, diagnostic, mission execution, error repair, twin retests, and verified mastery.
          </p>
        </div>
      </div>

      {/* Top Core Signals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Completed Missions</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{completedMissions}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active curriculum missions</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Practice Attempts</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">{practiceAttempts}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Formative question submissions</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Retests Passed</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{retestsPassed}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Twin problem validation</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Demonstrated Mastery</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">{demonstratedSkills}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Verified skill milestones</div>
        </div>
      </div>

      {/* Pedagogical Utilization Funnel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Pedagogical Execution Funnel</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracks the sequential student journey through diagnostic assessment, formative practice, error recovery, and verified skill mastery.
            </p>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
            EVIDENCE-BASED ONLY
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {funnelSteps.map((step, idx) => {
            const prevCount = idx > 0 ? funnelSteps[idx - 1].count : null;
            let conversionPct: string | null = null;
            if (step.count !== null && prevCount !== null && prevCount > 0) {
              conversionPct = `${Math.min(100, Math.round((step.count / prevCount) * 100))}%`;
            }

            return (
              <div
                key={step.name}
                className="bg-slate-950 border border-slate-800/80 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <span>{step.name}</span>
                    {!step.isTelemetried && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-950/80 text-yellow-400 border border-yellow-800 font-mono uppercase">
                        NOT TELEMETRIED
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">{step.description}</div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  {conversionPct && (
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase">Conversion</div>
                      <div className="text-xs font-mono font-semibold text-slate-300">{conversionPct}</div>
                    </div>
                  )}
                  <div className="text-right min-w-[70px]">
                    <div className="text-[10px] text-slate-500 uppercase">Count</div>
                    <div className="text-sm font-mono font-bold text-white">
                      {step.count !== null ? step.count : "—"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Retention Cohorts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Retention Cohort Signals</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Longitudinal student engagement across day milestones. Uncollected cohorts explicitly show insufficient data.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          {retentionCohorts.map((c) => (
            <div
              key={c.label}
              className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center space-y-1"
            >
              <div className="text-xs font-bold text-slate-300 font-mono">{c.label}</div>
              <div className="text-[11px] font-mono text-slate-500 font-medium">
                {c.value !== null ? `${c.value}%` : "INSUFFICIENT DATA"}
              </div>
              <div className="text-[10px] text-slate-600">{c.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
