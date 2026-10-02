"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { VisitorTrendPoint, VisitorAnalyticsPeriod } from "@/lib/operations/visitors-analytics";
import { TrendingUp, Calendar } from "lucide-react";

interface Props {
  trend: VisitorTrendPoint[];
  period: VisitorAnalyticsPeriod;
  onPeriodChange: (p: VisitorAnalyticsPeriod) => void;
  loading?: boolean;
}

export function VisitorsTrendChart({
  trend,
  period,
  onPeriodChange,
  loading = false,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const periodLabels: Record<VisitorAnalyticsPeriod, string> = {
    today: "اليوم",
    "7d": "آخر 7 أيام",
    "30d": "آخر 30 يوماً",
    "90d": "آخر 90 يوماً",
  };

  if (!mounted) {
    return (
      <div className="h-80 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse flex items-center justify-center text-slate-500 text-xs font-mono">
        تحميل مخطط حركة الزوار...
      </div>
    );
  }

  const totalSessions = trend.reduce((sum, t) => sum + (t.sessions || 0), 0);
  const totalUnique = trend.reduce((sum, t) => sum + (t.uniqueVisitors || 0), 0);
  const totalNew = trend.reduce((sum, t) => sum + (t.newVisitors || 0), 0);
  const totalReturning = trend.reduce((sum, t) => sum + (t.returningVisitors || 0), 0);

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md space-y-4">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>مخطط نمو وتدفق الزوار (Visitors Trend Chart)</span>
              <span className="text-[11px] font-mono font-normal text-slate-400">
                ({periodLabels[period]})
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              مقارنة الزوار الفريدين، الجلسات، الزوار الجدد، والزوار العائدين
            </p>
          </div>
        </div>

        {/* Time Period Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(["today", "7d", "30d", "90d"] as VisitorAnalyticsPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              disabled={loading}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                period === p
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stat Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-800/30">
          <span className="text-[10px] text-cyan-400 block font-semibold">إجمالي الزوار الفريدين</span>
          <span className="text-lg font-black text-cyan-300 font-mono">{totalUnique}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-800/30">
          <span className="text-[10px] text-indigo-400 block font-semibold">إجمالي الجلسات</span>
          <span className="text-lg font-black text-indigo-300 font-mono">{totalSessions}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-800/30">
          <span className="text-[10px] text-emerald-400 block font-semibold">زوار جدد</span>
          <span className="text-lg font-black text-emerald-300 font-mono">{totalNew}</span>
        </div>
        <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-800/30">
          <span className="text-[10px] text-amber-400 block font-semibold">زوار عائدون</span>
          <span className="text-lg font-black text-amber-300 font-mono">{totalReturning}</span>
        </div>
      </div>

      {/* Area Chart */}
      <div className="h-72 w-full pt-2" dir="ltr">
        {trend.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-500">
            لا توجد بيانات حركة زوار مسجلة في هذا النطاق الزمني
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradUnique" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  border: "1px solid #334155",
                  borderRadius: "12px",
                  fontSize: "12px",
                  direction: "rtl",
                }}
                labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
              />
              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                formatter={(val) => {
                  switch (val) {
                    case "uniqueVisitors":
                      return "الزوار الفريدون";
                    case "sessions":
                      return "الجلسات";
                    case "newVisitors":
                      return "الزوار الجدد";
                    case "returningVisitors":
                      return "الزوار العائدون";
                    default:
                      return val;
                  }
                }}
              />
              <Area
                type="monotone"
                dataKey="uniqueVisitors"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradUnique)"
                name="uniqueVisitors"
              />
              <Area
                type="monotone"
                dataKey="sessions"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#gradSessions)"
                name="sessions"
              />
              <Area
                type="monotone"
                dataKey="newVisitors"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
                name="newVisitors"
              />
              <Area
                type="monotone"
                dataKey="returningVisitors"
                stroke="#f59e0b"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                fill="none"
                name="returningVisitors"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
