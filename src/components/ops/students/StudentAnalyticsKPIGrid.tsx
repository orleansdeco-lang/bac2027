"use client";

import React from "react";
import { StudentAnalyticsKPIs } from "@/lib/operations/students-analytics";
import {
  Users,
  UserPlus,
  Calendar,
  Zap,
  Activity,
  UserX,
  Sparkles,
  CreditCard,
  Clock,
  Info,
} from "lucide-react";

interface Props {
  kpis: StudentAnalyticsKPIs;
  loading?: boolean;
}

export function StudentAnalyticsKPIGrid({ kpis, loading = false }: Props) {
  return (
    <div className="space-y-4">
      {/* Explicit Activity Definition Banner */}
      <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-cyan-200/90 leading-relaxed">
          <strong className="text-cyan-300 font-semibold">تعريف التلميذ النشط (Active Student):</strong>{" "}
          هو التلميذ المسجل الذي قام بتفاعل تعليمي حقيقي وموثق (حل تمارين، فتح مخطط المراجعة، تجربة امتحانات، طاولات الديوان، إلخ) خلال الفترة الزمنية المحددة.
          <span className="block text-[11px] text-cyan-400/80 mt-0.5">
            * لا يُعتبر مجرد وجود الحساب في قاعدة البيانات نشاطاً، كما تم استبعاد كافة زيارات وأنشطة المشرفين والإدارة تلقائياً.
          </span>
        </div>
      </div>

      {/* 11 Real Database Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {/* 1. TOTAL STUDENTS */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">إجمالي التلاميذ</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-white font-mono">{kpis.totalStudents}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">TOTAL STUDENTS</div>
          </div>
        </div>

        {/* 2. REGISTRATIONS TODAY */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">تسجيلات اليوم</span>
            <UserPlus className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-cyan-300 font-mono">{kpis.registrationsToday}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">REGISTRATIONS TODAY</div>
          </div>
        </div>

        {/* 3. REGISTRATIONS THIS WEEK */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">تسجيلات هذا الأسبوع</span>
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-indigo-300 font-mono">{kpis.registrationsThisWeek}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">THIS WEEK (7 DAYS)</div>
          </div>
        </div>

        {/* 4. REGISTRATIONS THIS MONTH */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">تسجيلات هذا الشهر</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-purple-300 font-mono">{kpis.registrationsThisMonth}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">THIS MONTH (30 DAYS)</div>
          </div>
        </div>

        {/* 5. ACTIVE TODAY */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-semibold">النشطون اليوم</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-300 font-mono">{kpis.activeToday}</div>
            <div className="text-[10px] text-emerald-500/80 font-mono mt-0.5">ACTIVE TODAY</div>
          </div>
        </div>

        {/* 6. ACTIVE LAST 7 DAYS */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-semibold">نشطون آخر 7 أيام</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-300 font-mono">{kpis.activeLast7Days}</div>
            <div className="text-[10px] text-emerald-500/80 font-mono mt-0.5">ACTIVE LAST 7 DAYS</div>
          </div>
        </div>

        {/* 7. ACTIVE LAST 30 DAYS */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-[11px] font-semibold">نشطون آخر 30 يوماً</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-300 font-mono">{kpis.activeLast30Days}</div>
            <div className="text-[10px] text-emerald-500/80 font-mono mt-0.5">ACTIVE LAST 30 DAYS</div>
          </div>
        </div>

        {/* 8. NEVER ACTIVE */}
        <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[11px] font-semibold">لم ينشطوا أبداً</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-rose-300 font-mono">{kpis.neverActive}</div>
            <div className="text-[10px] text-rose-500/80 font-mono mt-0.5">NEVER ACTIVE</div>
          </div>
        </div>

        {/* 9. TRIAL STUDENTS */}
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-[11px] font-semibold">تلاميذ التجربة</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-cyan-300 font-mono">{kpis.trialStudents}</div>
            <div className="text-[10px] text-cyan-500/80 font-mono mt-0.5">TRIAL STUDENTS</div>
          </div>
        </div>

        {/* 10. PAID STUDENTS */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 backdrop-blur-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-[11px] font-semibold">الاشتراكات المدفوعة</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-300 font-mono">{kpis.paidStudents}</div>
            <div className="text-[10px] text-amber-500/80 font-mono mt-0.5">PAID STUDENTS</div>
          </div>
        </div>

        {/* 11. EXPIRED SUBSCRIPTIONS */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between sm:col-span-2 lg:col-span-2 xl:col-span-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-semibold">اشتراكات منتهية الصلاحية</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-400 font-mono">{kpis.expiredSubscriptions}</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">EXPIRED SUBSCRIPTIONS</div>
          </div>
        </div>
      </div>
    </div>
  );
}
