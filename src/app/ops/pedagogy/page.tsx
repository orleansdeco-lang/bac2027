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
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { OperationsOverviewKPIs } from "@/lib/operations/types";

export default function OpsPedagogyPage() {
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
        console.error("Failed to load pedagogy stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Pedagogical Intelligence</h1>
            <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800 font-mono">
              Learning Signals
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated learning progress signals: formative practice, active recall, root cause errors, and twin retest validations.
          </p>
        </div>
      </div>

      {/* Top 4 Progress Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400">Total Missions Completed</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {kpis?.learningActivity.totalMissionsCompleted ?? "0"}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Micro-concept mastery</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400">Formative Practice Attempts</div>
          <div className="text-2xl font-bold text-white font-mono mt-1">
            {kpis?.learningActivity.totalPracticeAttempts ?? "0"}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Exercises executed</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400">Twin Retests Cleared</div>
          <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {kpis?.learningActivity.totalRetestsPassed ?? "0"}
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">Verified error remediation</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-[11px] text-slate-400">Skills Demonstrated</div>
          <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">
            {kpis?.learningActivity.totalDemonstratedSkills ?? "0"}
          </div>
          <div className="text-[10px] text-indigo-400/80 mt-0.5">Curriculum milestone proof</div>
        </div>
      </div>

      {/* Error Lab Root Cause Analysis */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Brain className="w-4 h-4 text-indigo-400" />
            <span>Error Lab Root Cause Heatmap (Observable Types)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Pedagogical classification of student stumbling blocks across all Algerian Baccalaureate streams.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xs font-semibold text-white">Conceptual</div>
            <div className="text-[11px] text-slate-400 leading-snug">
              Fundamental misunderstandings of definitions, physical laws, or theorems.
            </div>
            <div className="text-xs font-mono font-bold text-amber-400 pt-1">
              Primary Bottleneck
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xs font-semibold text-white">Methodological</div>
            <div className="text-[11px] text-slate-400 leading-snug">
              Incorrect proof structure, invalid scientific reasoning steps, or incomplete justifications.
            </div>
            <div className="text-xs font-mono font-bold text-indigo-400 pt-1">
              High BAC Weight
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xs font-semibold text-white">Calculation</div>
            <div className="text-[11px] text-slate-400 leading-snug">
              Algebraic slip-ups, sign errors, derivative calculation mistakes.
            </div>
            <div className="text-xs font-mono font-bold text-blue-400 pt-1">
              Rapid Repair
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-xs font-semibold text-white">Comprehension</div>
            <div className="text-[11px] text-slate-400 leading-snug">
              Misinterpreting complex Arabic problem phrasing or ignoring boundary conditions.
            </div>
            <div className="text-xs font-mono font-bold text-slate-300 pt-1">
              Linguistic Nuance
            </div>
          </div>
        </div>
      </div>

      {/* Stream Isolation Policy Notice */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Curriculum Stream Isolation Guard</span>
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The Learning Core strictly isolates stream curricula: Math students have zero biology content; Gestion-Économie has zero physics or biology. Operations observes aggregated performance metrics while preserving student stream boundaries.
        </p>
      </div>
    </div>
  );
}
