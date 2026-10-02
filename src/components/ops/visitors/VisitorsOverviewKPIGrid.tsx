"use client";

import React from "react";
import { VisitorsOverviewKPIs } from "@/lib/operations/visitors-analytics";
import { Users, UserPlus, Repeat, Activity, Calendar, Eye } from "lucide-react";

interface Props {
  kpis: VisitorsOverviewKPIs;
  loading?: boolean;
}

export function VisitorsOverviewKPIGrid({ kpis, loading = false }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <span>نظرة عامة على حركة الزوار (Visitors Overview)</span>
        </h2>
        <span className="text-[11px] text-slate-500 font-mono">بيانات واقعية 100%</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* 1. Unique visitors today */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">زوار فريدون اليوم</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-cyan-300 font-mono">{kpis.uniqueVisitorsToday}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">UNIQUE TODAY</div>
          </div>
        </div>

        {/* 2. Sessions today */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">جلسات اليوم</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-indigo-300 font-mono">{kpis.sessionsToday}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">SESSIONS TODAY</div>
          </div>
        </div>

        {/* 3. New visitors today */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">زوار جدد اليوم</span>
            <UserPlus className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-300 font-mono">{kpis.newVisitorsToday}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">NEW TODAY</div>
          </div>
        </div>

        {/* 4. Returning visitors today */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">زوار عائدون اليوم</span>
            <Repeat className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-300 font-mono">{kpis.returningVisitorsToday}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">RETURNING TODAY</div>
          </div>
        </div>

        {/* 5. Unique visitors last 7 days */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">فريدون آخر 7 أيام</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-blue-300 font-mono">{kpis.uniqueVisitorsLast7Days}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">LAST 7 DAYS</div>
          </div>
        </div>

        {/* 6. Unique visitors last 30 days */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">فريدون آخر 30 يوماً</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-purple-300 font-mono">{kpis.uniqueVisitorsLast30Days}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">LAST 30 DAYS</div>
          </div>
        </div>
      </div>
    </div>
  );
}
