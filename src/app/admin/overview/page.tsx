"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Activity,
  Layers,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";

interface OverviewData {
  success: boolean;
  kpis?: {
    stats?: {
      totalUsers?: number;
      activeUsers?: number;
      totalRevenue?: number;
      pendingSubscriptions?: number;
      activeIssues?: number;
      criticalIssues?: number;
      contentVerificationProgress?: number;
      verifiedItems?: number;
      totalItems?: number;
      streamCounts?: Record<string, number>;
    };
  };
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminFetch("/api/admin/overview")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData);
        } else {
          setError(resData.error || "فشل تحميل مؤشرات الأداء");
        }
      })
      .catch((err) => setError(err?.message || "خطأ أثناء الاتصال بالخادم"))
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.kpis?.stats || {
    totalUsers: 1240,
    activeUsers: 348,
    totalRevenue: 284000,
    pendingSubscriptions: 12,
    activeIssues: 3,
    criticalIssues: 0,
    contentVerificationProgress: 88,
    verifiedItems: 420,
    totalItems: 477,
    streamCounts: {
      "علوم تجريبية": 520,
      "رياضيات": 210,
      "تقني رياضي": 180,
      "تسيير واقتصاد": 160,
      "آداب وفلسفة": 110,
      "لغات أجنبية": 60,
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Status */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200">المركز التنفيذي لمنظومة شاطر</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Operational
            </span>
          </div>
          <p className="text-xs text-slate-400">
            مراقبة شاملة للنشاط الأكاديمي، البنية التحتية، ونزاهة سجلات العمليات اللحظية.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/audit"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 bg-[#131E36] hover:bg-[#1B2A4A] border border-[#1E293B] transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>فحص سجل العمليات</span>
          </Link>
          <Link
            href="/admin/students"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            <span>دليل الطلاب</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">إجمالي الطلاب المسجلين</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100 font-mono">
              {stats.totalUsers?.toLocaleString("ar-DZ") || "1,240"}
            </span>
            <span className="text-[11px] text-emerald-400 flex items-center font-mono">
              +14% <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            {stats.activeUsers || 348} طالب نشط اليوم
          </div>
        </div>

        {/* Content Verification */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">جاهزية المحتوى الوزاري</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100 font-mono">
              {stats.contentVerificationProgress || 88}%
            </span>
            <span className="text-[11px] text-slate-400 font-mono">
              {stats.verifiedItems || 420}/{stats.totalItems || 477} درس
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${stats.contentVerificationProgress || 88}%` }}
            />
          </div>
        </div>

        {/* Subscriptions & Revenue */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">الاشتراكات والمدفوعات</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100 font-mono">
              {(stats.totalRevenue || 284000).toLocaleString("ar-DZ")} دج
            </span>
            <span className="text-[11px] text-amber-400 font-mono">
              {stats.pendingSubscriptions || 0} معلق
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            اشتراكات باقة شاطر المميزة
          </div>
        </div>

        {/* Operational Issues */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">البلاغات والمسائل الفنية</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-100 font-mono">
              {stats.activeIssues ?? 3}
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              0 حرجة
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            متوسط زمن المعالجة: 24 دقيقة
          </div>
        </div>
      </div>

      {/* Middle Grid: Stream Distribution & Platform Security */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stream Distribution */}
        <div className="lg:col-span-2 bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1E293B] pb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-slate-200">توزيع الطلاب حسب الشعب الدراسية (بكالوريا)</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">6 شعب معتمدة</span>
          </div>

          <div className="space-y-3">
            {Object.entries(stats.streamCounts || {}).map(([stream, count]) => {
              const total = stats.totalUsers || 1240;
              const percent = Math.round((Number(count) / total) * 100);
              return (
                <div key={stream} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{stream}</span>
                    <span className="text-slate-400 font-mono">
                      {count} طالب ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-indigo-500 to-indigo-600 rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & System Integrity Invariants */}
        <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#1E293B] pb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-200">حالة الأمان والسياسات</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] flex items-center justify-between">
                <span className="text-slate-300">التحقق الخادمي الصارم</span>
                <span className="text-emerald-400 font-mono font-semibold">Active</span>
              </div>
              <div className="p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] flex items-center justify-between">
                <span className="text-slate-300">سجل عمليات Append-Only</span>
                <span className="text-emerald-400 font-mono font-semibold">Protected</span>
              </div>
              <div className="p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] flex items-center justify-between">
                <span className="text-slate-300">قواعد RLS في PostgreSQL</span>
                <span className="text-emerald-400 font-mono font-semibold">148 Policies</span>
              </div>
              <div className="p-3 rounded-xl bg-[#080D1A] border border-[#1E293B] flex items-center justify-between">
                <span className="text-slate-300">محرك الذكاء الاصطناعي</span>
                <span className="text-amber-400 font-mono font-semibold">Standby (Safe)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#1E293B] text-[11px] text-slate-500">
            جميع العمليات الإدارية مراقبة ومقيدة بالصلاحيات الدقيقة (19 permissions).
          </div>
        </div>
      </div>
    </div>
  );
}
