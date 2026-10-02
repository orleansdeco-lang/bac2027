"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { DailyGrowthPoint, DailyActivityPoint, AnalyticsPeriod } from "@/lib/operations/students-analytics";
import { TrendingUp, Activity, Calendar } from "lucide-react";

interface Props {
  dailyGrowth: DailyGrowthPoint[];
  dailyActivity: DailyActivityPoint[];
  period: AnalyticsPeriod;
  onPeriodChange: (p: AnalyticsPeriod) => void;
  loading?: boolean;
}

export function StudentAnalyticsCharts({
  dailyGrowth,
  dailyActivity,
  period,
  onPeriodChange,
  loading = false,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-72 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse flex items-center justify-center text-slate-500 text-xs font-mono">
          تحميل مخطط نمو التسجيلات...
        </div>
        <div className="h-72 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse flex items-center justify-center text-slate-500 text-xs font-mono">
          تحميل مخطط نشاط التلاميذ...
        </div>
      </div>
    );
  }

  const periodLabels: Record<AnalyticsPeriod, string> = {
    today: "اليوم",
    "7d": "آخر 7 أيام",
    "30d": "آخر 30 يوماً",
    "90d": "آخر 90 يوماً",
  };

  return (
    <div className="space-y-4">
      {/* Charts Header with Period Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/70 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200">التحليل الزمني للنمو والتفاعل الحقيقي</span>
          <span className="text-[11px] text-slate-400 font-mono">({periodLabels[period]})</span>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          {(["today", "7d", "30d", "90d"] as AnalyticsPeriod[]).map((p) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Student Growth Chart */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">مخطط نمو التسجيلات اليومية</h3>
                <p className="text-[11px] text-slate-400">التلاميذ الجدد المنضمون للمنصة يومياً</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-cyan-300">
                {dailyGrowth.reduce((acc, curr) => acc + (curr.registrations || 0), 0)}
              </span>
              <span className="text-[10px] text-slate-400 block">تسجيل في الفترة</span>
            </div>
          </div>

          <div className="h-64 w-full pt-2" dir="ltr">
            {dailyGrowth.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                لا توجد تسجيلات مسجلة في هذا النطاق الزمني
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
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
                    formatter={(val: any) => [`${val} تلميذ جديد`, "التسجيلات"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#growthGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 2. Activity Chart */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">مخطط النشاط اليومي للتلاميذ</h3>
                <p className="text-[11px] text-slate-400">تلاميذ قاموا بتفاعل أكاديمي حقيقي خلال اليوم</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono font-bold text-emerald-300">
                {dailyActivity.reduce((acc, curr) => acc + (curr.totalEvents || 0), 0)}
              </span>
              <span className="text-[10px] text-slate-400 block">إجمالي التفاعلات</span>
            </div>
          </div>

          <div className="h-64 w-full pt-2" dir="ltr">
            {dailyActivity.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                لا يوجد نشاط مسجل في هذا النطاق الزمني
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    formatter={(val: any, name: any) => [
                      name === "activeStudents" ? `${val} تلميذ نشط` : `${val} تفاعل تعليمي`,
                      name === "activeStudents" ? "التلاميذ النشطون" : "التفاعلات",
                    ]}
                  />
                  <Bar
                    dataKey="activeStudents"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
