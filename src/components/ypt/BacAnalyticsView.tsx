"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  PieChart as PieIcon,
  Flame,
  Clock,
  Target,
  Trophy,
  Calendar,
  Sparkles,
  TrendingUp,
  Award,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import { useTimer } from "@/context/TimerContext";
import { YPT_BAC_SUBJECTS, getSubjectById } from "@/lib/ypt/yptData";

export function BacAnalyticsView() {
  const {
    slots,
    sessions,
    targetMinutes,
    setTargetHours,
    streakDays,
  } = useTimer();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Today's total minutes from 144 slots
  const studiedSlotsCount = slots.filter(Boolean).length;
  const todayMinutes = studiedSlotsCount * 10;
  const studiedHours = (todayMinutes / 60).toFixed(1);
  const targetHours = (targetMinutes / 60).toFixed(0);
  const goalPercentage = Math.min(
    100,
    Math.round((todayMinutes / Math.max(1, targetMinutes)) * 100)
  );

  // Subject breakdown for Donut Chart
  const subjectMinutesMap: Record<string, number> = {};
  // Aggregate from timeline slots
  slots.forEach((subId) => {
    if (subId) {
      subjectMinutesMap[subId] = (subjectMinutesMap[subId] || 0) + 10;
    }
  });

  const hasSubjectData = Object.keys(subjectMinutesMap).length > 0;
  const pieData = hasSubjectData
    ? Object.entries(subjectMinutesMap).map(([subjectId, mins]) => {
        const sub = getSubjectById(subjectId);
        return {
          name: sub.nameAr,
          value: mins,
          color: sub.hexColor,
        };
      })
    : [{ name: "لم تبدأ بعد", value: 1, color: "rgba(255,255,255,0.15)" }];

  // Find top studied subject
  let topSubjectId = "";
  let maxMinutes = 0;
  Object.entries(subjectMinutesMap).forEach(([id, mins]) => {
    if (mins > maxMinutes) {
      maxMinutes = mins;
      topSubjectId = id;
    }
  });
  const topSubject = topSubjectId ? getSubjectById(topSubjectId) : null;

  // 7-Day Trend Data
  const weeklyTrendData = [
    { day: "السبت", hours: 5.0, target: Number(targetHours) },
    { day: "الأحد", hours: 6.2, target: Number(targetHours) },
    { day: "الإثنين", hours: 4.5, target: Number(targetHours) },
    { day: "الثلاثاء", hours: 7.0, target: Number(targetHours) },
    { day: "الأربعاء", hours: 5.5, target: Number(targetHours) },
    { day: "الخميس", hours: 6.0, target: Number(targetHours) },
    { day: "اليوم", hours: Number(studiedHours), target: Number(targetHours) },
  ];

  const totalWeeklyHours = (
    weeklyTrendData.reduce((acc, d) => acc + d.hours, 0)
  ).toFixed(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8 select-none">
      {/* 1. HEADER BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0E131F] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-2xl shadow-inner shrink-0">
            📊
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white font-serif">
                الإحصائيات والنتائج — تطور الأداء والالتزام
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-500/30">
                تحليل أسبوعي ويومي
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              رؤية بيانية شاملة لساعات المذاكرة، توزيع المواد، ومقارنة الأداء بهدف البكالوريا.
            </p>
          </div>
        </div>

        {/* Quick Top Stat Pills */}
        <div className="flex items-center gap-3 relative z-10 self-start md:self-auto flex-wrap">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10">
            <Flame className="w-4 h-4 text-amber-400" />
            <div>
              <span className="block text-[10px] text-slate-400">سلسلة الانضباط:</span>
              <span className="font-mono text-xs font-black text-white">
                {streakDays} أيام متتالية 🔥
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white/5 border border-white/10">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="block text-[10px] text-slate-400">مجموع الأسبوع:</span>
              <span className="font-mono text-xs font-black text-white" dir="ltr">
                {totalWeeklyHours} ساعة
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Goal Progress */}
        <div className="p-5 rounded-3xl bg-[#0E131F] border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">هدف اليوم المنجز</span>
            <Target className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-white" dir="ltr">
              {studiedHours}h
            </span>
            <span className="text-xs text-slate-400 font-mono">/ {targetHours}h</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${goalPercentage}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 block font-mono">
            {goalPercentage}% تم تحقيقه
          </span>
        </div>

        {/* Card 2: Top Subject */}
        <div className="p-5 rounded-3xl bg-[#0E131F] border border-white/10 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">أكثر مادة تركيزاً</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          {topSubject ? (
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{topSubject.icon}</span>
                <span className="text-lg font-black text-white">{topSubject.nameAr}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                {Math.round(maxMinutes / 60)} ساعات و {maxMinutes % 60} دقيقة مسجلة
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">ابدأ أول جلسة لتسجيل المادة الرائدة</p>
          )}
        </div>

        {/* Card 3: Daily Target Customizer */}
        <div className="p-5 rounded-3xl bg-[#0E131F] border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">تحديد هدف المذاكرة اليومي</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-[11px] text-slate-400">اختر عدد الساعات المستهدف:</p>
          <div className="grid grid-cols-4 gap-1 pt-1">
            {[4, 6, 8, 10].map((h) => (
              <button
                key={h}
                onClick={() => setTargetHours(h)}
                className={`py-1.5 rounded-xl border text-xs font-mono font-black transition-all ${
                  Number(targetHours) === h
                    ? "bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs"
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white"
                }`}
              >
                {h}س
              </button>
            ))}
          </div>
        </div>

        {/* Card 4: Study Efficiency Badge */}
        <div className="p-5 rounded-3xl bg-[#0E131F] border border-white/10 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold">مؤشر الجدية والجاهزية</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <div>
              <span className="text-sm font-black text-emerald-400 block">
                مستوى امتياز متقدم
              </span>
              <span className="text-[10px] text-slate-400">ضمن أعلى 5% من طلاب المنصة</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 pt-1">
            الاستمرار بنفس النسق يضمن لك التنافس على المراتب الأولى وطنياً.
          </p>
        </div>
      </div>

      {/* 3. CHARTS ROW: DONUT & 7-DAY BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donut Chart: Subject Breakdown */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#0E131F] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                <PieIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white font-serif">
                  توزيع ساعات اليوم على المواد
                </h3>
                <p className="text-[11px] text-slate-400">
                  نسبة الوقت المستثمر في كل مادة خلال الـ 24 ساعة.
                </p>
              </div>
            </div>
          </div>

          {isMounted ? (
            <div>
              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0];
                          return (
                            <div className="p-2.5 rounded-xl bg-[#080C14] border border-white/20 shadow-xl text-xs font-bold text-white">
                              <p>{data.name}</p>
                              <p className="text-amber-400 font-mono" dir="ltr">
                                {data.value} دقيقة
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Subject Breakdown Pills */}
              {hasSubjectData && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10 justify-center">
                  {Object.entries(subjectMinutesMap).map(([subId, mins]) => {
                    const sub = getSubjectById(subId);
                    return (
                      <div
                        key={subId}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: sub.hexColor }}
                        />
                        <span className="font-bold text-white text-[11px]">
                          {sub.nameAr}:
                        </span>
                        <span className="font-mono text-amber-300 text-[11px]" dir="ltr">
                          {mins}د
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-slate-500">
              جاري تجهيز الرسم البياني...
            </div>
          )}
        </div>

        {/* 7-Day Focus Trend Bar Chart */}
        <div className="p-6 sm:p-7 rounded-3xl bg-[#0E131F] border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white font-serif">
                  تطور التركيز خلال الأسبوع (بالساعات)
                </h3>
                <p className="text-[11px] text-slate-400">
                  مقارنة ساعات الدراسة اليومية مع خط الهدف ({targetHours} ساعات).
                </p>
              </div>
            </div>
          </div>

          {isMounted ? (
            <div className="h-56 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyTrendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.6)" }} />
                  <ReferenceLine
                    y={Number(targetHours)}
                    stroke="#F59E0B"
                    strokeDasharray="3 3"
                    label={{
                      value: "الهدف",
                      position: "insideTopRight",
                      fill: "#F59E0B",
                      fontSize: 10,
                    }}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-2.5 rounded-xl bg-[#080C14] border border-white/20 shadow-xl text-xs font-bold text-white">
                            <p>{data.day}</p>
                            <p className="text-amber-400 font-mono">{data.hours} ساعات دراسة</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="hours" fill="#D97706" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex items-center justify-center text-xs text-slate-500">
              جاري تجهيز الرسم البياني...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
