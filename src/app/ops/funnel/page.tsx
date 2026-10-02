"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Filter,
  RefreshCw,
  Calendar,
  AlertCircle,
  TrendingUp,
  Download,
} from "lucide-react";
import { opsFetch } from "@/lib/operations/client-api";
import {
  ConversionFunnelResponse,
  FunnelPeriod,
} from "@/lib/operations/conversion-funnel";
import { FunnelHeadlineRatiosCards } from "@/components/ops/funnel/FunnelHeadlineRatios";
import { FunnelVisualizer } from "@/components/ops/funnel/FunnelVisualizer";
import { AttributionQualityBanner } from "@/components/ops/funnel/AttributionQualityBanner";
import { AcquisitionSourcesTable } from "@/components/ops/funnel/AcquisitionSourcesTable";
import { CampaignsBreakdownTable } from "@/components/ops/funnel/CampaignsBreakdownTable";

export default function OpsFunnelPage() {
  const [data, setData] = useState<ConversionFunnelResponse | null>(null);
  const [period, setPeriod] = useState<FunnelPeriod>("30d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  async function fetchFunnelData(isManual = false) {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      let url = `/api/ops/analytics/funnel?period=${period}`;
      if (period === "custom" && customStart && customEnd) {
        url += `&startDate=${encodeURIComponent(customStart)}&endDate=${encodeURIComponent(customEnd)}`;
      }

      const res = await opsFetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
          setLastRefreshed(new Date());
        } else {
          setError(json.error || "فشل تحميل مسار التحويل");
        }
      } else {
        setError(`خطأ في استجابة الخادم: ${res.status}`);
      }
    } catch (err: any) {
      console.error("Failed to load conversion funnel data:", err);
      setError(err?.message || "حدث خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (period !== "custom" || (customStart && customEnd)) {
      fetchFunnelData(false);
    }
  }, [period, customStart, customEnd]);

  const periodLabels: Record<FunnelPeriod, string> = {
    today: "اليوم",
    "7d": "آخر 7 أيام",
    "30d": "آخر 30 يوماً",
    "90d": "آخر 90 يوماً",
    custom: "نطاق مخصص",
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100" dir="rtl">
      {/* 1. Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/ops" className="hover:text-cyan-400 transition-colors">
              لوحة العمليات
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-semibold">مسار التحويل والاكتساب</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
            <Filter className="w-6 h-6 text-cyan-400" />
            <span>مسار التحويل والاكتساب (Conversion Funnel & Acquisition)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold">
              REAL FIRST-PARTY DATA
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            تتبع دقيق من الزائر الأول حتى المشترك المدفوع، مع إسناد القنوات الإعلانية، ونسب التحويل الحقيقية 100%.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {lastRefreshed && (
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              آخر تحديث: {lastRefreshed.toLocaleTimeString("fr-DZ")}
            </span>
          )}

          <button
            onClick={() => fetchFunnelData(true)}
            disabled={refreshing || loading}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* 2. Date Filter Controls */}
      <div className="bg-slate-900/70 border border-slate-800/80 p-3.5 rounded-2xl backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200">النطاق الزمني للتحليل:</span>
          <span className="text-[11px] text-slate-400 font-mono">({periodLabels[period]})</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
            {(["today", "7d", "30d", "90d", "custom"] as FunnelPeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
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

          {period === "custom" && (
            <div className="flex items-center gap-2 text-xs" dir="ltr">
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
              <span className="text-slate-500">إلى</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. Error State Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="text-xs font-bold text-rose-300">تعذر تحميل بيانات مسار التحويل</div>
              <div className="text-[11px] text-rose-400/80">{error}</div>
            </div>
          </div>
          <button
            onClick={() => fetchFunnelData(false)}
            className="px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-rose-200 text-xs font-semibold border border-rose-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* 4. Headline Conversion Ratios */}
      <FunnelHeadlineRatiosCards
        ratios={
          data?.ratios || {
            visitorToRegistration: 0,
            registrationToActivation: 0,
            activationToTrial: 0,
            trialToPaid: 0,
            overallConversion: 0,
          }
        }
        loading={loading}
      />

      {/* 5. Attribution Quality & Completeness Warning Banner */}
      {data?.attributionIntegrity && (
        <AttributionQualityBanner integrity={data.attributionIntegrity} />
      )}

      {/* 6. 8-Stage Conversion Funnel Visualizer */}
      <FunnelVisualizer stages={data?.stages || []} loading={loading} />

      {/* 7. Acquisition Sources Breakdown */}
      <AcquisitionSourcesTable sources={data?.sources || []} loading={loading} />

      {/* 8. Campaigns Breakdown (UTM Data) */}
      <CampaignsBreakdownTable campaigns={data?.campaigns || []} loading={loading} />
    </div>
  );
}
