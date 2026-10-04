"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Radio,
  Users,
  RefreshCw,
  Download,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import { opsFetch } from "@/lib/operations/client-api";
import {
  VisitorsAnalyticsResponse,
  VisitorAnalyticsPeriod,
} from "@/lib/operations/visitors-analytics";
import { VisitorsOverviewKPIGrid } from "@/components/ops/visitors/VisitorsOverviewKPIGrid";
import { LiveActivitySection } from "@/components/ops/visitors/LiveActivitySection";
import { VisitorsTrendChart } from "@/components/ops/visitors/VisitorsTrendChart";
import { ReturningVsNewAndDevices } from "@/components/ops/visitors/ReturningVsNewAndDevices";
import { TrafficSourcesAndTopPages } from "@/components/ops/visitors/TrafficSourcesAndTopPages";
import { RecentVisitorActivityTable } from "@/components/ops/visitors/RecentVisitorActivityTable";

export default function OpsVisitorsPage() {
  const [data, setData] = useState<VisitorsAnalyticsResponse | null>(null);
  const [period, setPeriod] = useState<VisitorAnalyticsPeriod>("30d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  async function fetchVisitors(isManual = false) {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await opsFetch(`/api/ops/analytics/visitors?period=${period}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
          setLastRefreshed(new Date());
        } else {
          setError(json.error || "فشل تحميل بيانات الزوار");
        }
      } else {
        setError(`خطأ في استجابة الخادم: ${res.status}`);
      }
    } catch (err: any) {
      console.error("Failed to load visitor analytics:", err);
      setError(err?.message || "حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchVisitors(false);
  }, [period]);

  // Periodic subtle refresh every 30 seconds for live updates
  useEffect(() => {
    const timer = setInterval(() => {
      fetchVisitors(true);
    }, 30000);
    return () => clearInterval(timer);
  }, [period]);

  const exportActivityToCsv = () => {
    if (!data || data.recentActivity.length === 0) {
      alert("لا توجد بيانات نشاط زوار للتصدير في هذا النطاق الزمني.");
      return;
    }

    const headers = [
      "Session ID",
      "Timestamp",
      "Page Path",
      "Visitor Type",
      "Traffic Source",
      "Device",
    ];

    const rows = (data.recentActivity || []).map((item) => [
      `"${item.id || ""}"`,
      `"${item.time || ""}"`,
      `"${item.page || (item as any).path || "/"}"`,
      `"${item.visitorType || "NEW"}"`,
      `"${item.source || "direct"}"`,
      `"${item.device || "desktop"}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `shater_visitors_activity_${period}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100" dir="rtl">
      {/* 1. Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/ops" className="hover:text-cyan-400 transition-colors">
              لوحة العمليات
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-semibold">تحليلات حركة الزوار الحقيقية</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
            <Radio className="w-6 h-6 text-cyan-400" />
            <span>تحليلات حركة الزوار والحملات (Visitors Analytics)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold">
              FIRST-PARTY DATA
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            تحليل دقيق وموثق 100% للزوار المجهولين والعائدين، الجلسات، مصادر الحملات الإعلانية، وتوزيع الأجهزة.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchVisitors(true)}
            disabled={refreshing || loading}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
            <span>تحديث</span>
            {lastRefreshed && (
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                ({lastRefreshed.toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit" })})
              </span>
            )}
          </button>

          <button
            onClick={exportActivityToCsv}
            disabled={!data || data.recentActivity.length === 0}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>تصدير النشاط (CSV)</span>
          </button>
        </div>
      </div>

      {/* 2. Error State Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-rose-300">تعذر تحميل تحليلات الزوار</div>
              <div className="text-[11px] text-rose-400/80">{error}</div>
            </div>
          </div>
          <button
            onClick={() => fetchVisitors(false)}
            className="px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-rose-200 text-xs font-semibold border border-rose-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* 3. Live Activity Section (Real Active Visitors or Explicit Unavailable) */}
      <LiveActivitySection
        liveActivity={
          data?.liveActivity || {
            isSupported: true,
            activeNow: 0,
          }
        }
        loading={loading}
      />

      {/* 4. Visitors Overview 6 Core Real KPIs */}
      <VisitorsOverviewKPIGrid
        kpis={
          data?.kpis || {
            uniqueVisitorsToday: 0,
            sessionsToday: 0,
            newVisitorsToday: 0,
            returningVisitorsToday: 0,
            uniqueVisitorsLast7Days: 0,
            uniqueVisitorsLast30Days: 0,
          }
        }
        loading={loading}
      />

      {/* 5. Visitors Trend Chart (Unique Visitors, Sessions, New, Returning) */}
      <VisitorsTrendChart
        trend={data?.trend || []}
        period={period}
        onPeriodChange={(newPeriod) => setPeriod(newPeriod)}
        loading={loading}
      />

      {/* 6. Returning vs New Breakdown & Devices Breakdown */}
      <ReturningVsNewAndDevices
        returningVsNew={
          data?.returningVsNew || {
            newVisitors: 0,
            returningVisitors: 0,
            newPercentage: 0,
            returningPercentage: 0,
          }
        }
        devices={
          data?.devices || {
            mobile: 0,
            desktop: 0,
            tablet: 0,
            unknown: 0,
            total: 0,
          }
        }
        loading={loading}
      />

      {/* 7. Traffic Sources, Top Pages, Entry Pages, Exit Pages, and Geography */}
      <TrafficSourcesAndTopPages
        topPages={data?.topPages || []}
        sources={data?.sources || []}
        entryPages={data?.entryPages || []}
        exitPages={data?.exitPages || []}
        geography={data?.geography || { hasReliableGeography: false }}
        loading={loading}
      />

      {/* 8. Recent Visitor Activity Table */}
      <RecentVisitorActivityTable
        activity={data?.recentActivity || []}
        loading={loading}
      />
    </div>
  );
}
