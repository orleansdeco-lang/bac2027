"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Radio,
  Users,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  Share2,
  Calendar,
  Layers,
  ArrowRight,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Clock,
  Download,
  Eye,
  Filter,
  Flame,
  Zap,
  MapPin,
  ChevronRight,
  FileSpreadsheet,
} from "lucide-react";
import { opsFetch } from "@/lib/operations/client-api";

interface VisitorLog {
  id: string;
  timestamp: string;
  date: string;
  time: string;
  hour: number;
  sessionId: string;
  userId?: string | null;
  path: string;
  fullUrl?: string;
  deviceType: "mobile" | "desktop" | "tablet";
  browser?: string;
  os?: string;
  referrer?: string;
  referrerDomain?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmMedium?: string;
  refCode?: string;
  ip?: string;
}

interface VisitorData {
  liveCount: number;
  todayUniqueVisitors: number;
  todayPageviews: number;
  yesterdayUniqueVisitors: number;
  yesterdayPageviews: number;
  growthRatePercent: number;
  deviceRatios: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  topCampaignLinks: Array<{
    campaignKey: string;
    source: string;
    campaign?: string;
    refCode?: string;
    totalVisits: number;
    uniqueVisitors: number;
    lastVisitAt: string;
  }>;
  topReferrers: Array<{
    domain: string;
    label: string;
    count: number;
    percentage: number;
  }>;
  topPaths: Array<{ path: string; count: number }>;
  recentLogs: VisitorLog[];
  topWilayas?: Array<{ wilaya: string; count: number }>;
  topSources?: Array<{ source: string; count: number }>;
}

export default function OpsVisitorsPage() {
  const [data, setData] = useState<VisitorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deviceFilter, setDeviceFilter] = useState<string>("ALL");
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  async function fetchVisitors(isManual = false) {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await opsFetch("/api/ops/analytics/visitors?days=30");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setData(json);
          setLastRefreshed(new Date());
        }
      }
    } catch (err) {
      console.error("Failed to load visitor analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchVisitors(false);
    const interval = setInterval(() => fetchVisitors(true), 12000);
    return () => clearInterval(interval);
  }, []);

  const logs = data?.recentLogs || [];

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (deviceFilter !== "ALL" && log.deviceType !== deviceFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchPath = log.path?.toLowerCase().includes(q);
        const matchSource = log.utmSource?.toLowerCase().includes(q);
        const matchCamp = log.utmCampaign?.toLowerCase().includes(q);
        const matchSession = log.sessionId?.toLowerCase().includes(q);
        const matchRef = log.referrer?.toLowerCase().includes(q);
        const matchBrowser = log.browser?.toLowerCase().includes(q);
        if (!matchPath && !matchSource && !matchCamp && !matchSession && !matchRef && !matchBrowser) {
          return false;
        }
      }
      return true;
    });
  }, [logs, deviceFilter, searchQuery]);

  const exportLogsToCsv = () => {
    if (filteredLogs.length === 0) {
      alert("لا توجد بيانات زوار للتصدير.");
      return;
    }

    const headers = [
      "Timestamp",
      "Session_ID",
      "Path",
      "Device",
      "Browser",
      "UTM_Source",
      "UTM_Campaign",
      "Referrer",
    ];

    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.sessionId}"`,
      `"${l.path}"`,
      `"${l.deviceType}"`,
      `"${l.browser || ""}"`,
      `"${l.utmSource || ""}"`,
      `"${l.utmCampaign || ""}"`,
      `"${(l.referrer || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shater_visitors_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-slate-100" dir="rtl">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/ops" className="hover:text-indigo-400 transition-colors">
              لوحة القيادة
            </Link>
            <span>/</span>
            <span className="text-slate-200 font-semibold">تتبع الزوار والحملات الإعلانية</span>
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Radio className="w-7 h-7 text-emerald-400 animate-pulse" />
            <span>تحليل حركة الزوار الحية والإعلانات (Real Visitors & Ads)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold">
              100% REAL FIRST-PARTY TRACKING
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            متابعة الجلسات المباشرة، مصادر الإعلانات (Facebook / TikTok / Google)، نوع الأجهزة، والصفحات المتصفحة
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => fetchVisitors(true)}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
            <span>تحديث فوري</span>
            {lastRefreshed && (
              <span className="text-[10px] text-slate-400 font-mono">
                ({lastRefreshed.toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })})
              </span>
            )}
          </button>

          <button
            onClick={exportLogsToCsv}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير السجل (CSV)</span>
          </button>
        </div>
      </div>

      {/* Top 4 Real Traffic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Live Active Now */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0D1526] to-[#080D1A] border border-emerald-500/30 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              الزوار المتواجدون الآن في الموقع
            </span>
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-4xl font-black text-white font-mono mt-3">
            {data?.liveCount || 0} <span className="text-sm font-normal text-slate-400">زائر نشط</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            نشاط لحظي خلال آخر 5 دقائق
          </div>
        </div>

        {/* Card 2: Today Unique Visitors */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0D1526] to-[#080D1A] border border-indigo-500/30 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400">إجمالي الزوار الفريدين اليوم</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-4xl font-black text-white font-mono mt-3">
            {data?.todayUniqueVisitors || 0} <span className="text-sm font-normal text-slate-400">زائر</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>مقارنة بالأمس:</span>
            <span className="font-mono text-slate-300 font-bold">{data?.yesterdayUniqueVisitors || 0}</span>
          </div>
        </div>

        {/* Card 3: Today Pageviews */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0D1526] to-[#080D1A] border border-purple-500/30 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400">مشاهدات الصفحات اليوم</span>
            <Eye className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-4xl font-black text-white font-mono mt-3">
            {data?.todayPageviews || 0} <span className="text-sm font-normal text-slate-400">مشاهدة</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            معدل التصفح والانتقال بين صفحات المنصة
          </div>
        </div>

        {/* Card 4: Device Breakdown */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0D1526] to-[#080D1A] border border-amber-500/30 relative overflow-hidden shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400">توزيع أجهزة الزوار</span>
            <Smartphone className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-center justify-between mt-3 text-xs font-mono">
            <div>
              <span className="block text-slate-400 text-[10px]">الهاتف (Mobile)</span>
              <span className="text-lg font-bold text-white">{data?.deviceRatios?.mobile || 0}%</span>
            </div>
            <div>
              <span className="block text-slate-400 text-[10px]">الكمبيوتر (Desktop)</span>
              <span className="text-lg font-bold text-white">{data?.deviceRatios?.desktop || 0}%</span>
            </div>
            <div>
              <span className="block text-slate-400 text-[10px]">اللوحي (Tablet)</span>
              <span className="text-lg font-bold text-white">{data?.deviceRatios?.tablet || 0}%</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            اكتشاف تلقائي دقيق للمتصفح ونظام التشغيل
          </div>
        </div>
      </div>

      {/* Row: Ad Campaigns & Top Sources & Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ad Campaigns Tracking (6 cols) */}
        <div className="lg:col-span-6 bg-[#0D1526] border border-slate-800 rounded-2xl p-5 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-400" />
                <span>الحملات الإعلانية المكتشفة (UTM Campaigns)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                تتبع الروابط الترويجية وحملات فيسبوك وتيك توك
              </p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
              UTM Attribution
            </span>
          </div>

          <div className="space-y-3 mt-4">
            {(data?.topCampaignLinks || []).length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                لم يتم رصد زيارات عبر معلمات UTM حتى الآن. تأكد من إضافة <code>?utm_source=facebook&utm_campaign=bac2025</code> إلى روابط إعلاناتك.
              </div>
            ) : (
              data?.topCampaignLinks.map((camp) => (
                <div
                  key={camp.campaignKey}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span className="text-indigo-400 font-mono">{camp.source}</span>
                      {camp.campaign && <span className="text-slate-300">/ {camp.campaign}</span>}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      آخر زيارة: {new Date(camp.lastVisitAt).toLocaleTimeString("ar-DZ")}
                    </div>
                  </div>
                  <div className="text-left font-mono">
                    <div className="font-black text-emerald-400 text-sm">{camp.totalVisits} زيارة</div>
                    <div className="text-[10px] text-slate-400">{camp.uniqueVisitors} فريدين</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Referrers & Top Pages (6 cols) */}
        <div className="lg:col-span-6 bg-[#0D1526] border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>مصادر الإحالة والصفحات الأكثر زيارة</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  من أين يأتي الزوار وما هي الصفحات التي يتصفحونها
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
              {/* Referrers */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-2">أهم مصادر الزيارات (Referrers)</span>
                <div className="space-y-2">
                  {(data?.topReferrers || []).length === 0 ? (
                    <span className="text-slate-500 text-xs">حركة مباشرة (Direct)</span>
                  ) : (
                    data?.topReferrers.map((ref) => (
                      <div key={ref.domain} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-300 truncate max-w-[140px]">{ref.label}</span>
                        <span className="font-mono font-bold text-emerald-400">{ref.count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Pages */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-2">أكثر الصفحات مشاهدة</span>
                <div className="space-y-2">
                  {(data?.topPaths || []).length === 0 ? (
                    <span className="text-slate-500 text-xs">/ (الصفحة الرئيسية)</span>
                  ) : (
                    data?.topPaths.map((tp) => (
                      <div key={tp.path} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-slate-300 font-mono truncate max-w-[140px]">{tp.path}</span>
                        <span className="font-mono font-bold text-indigo-400">{tp.count}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Detailed Visitor Log Table */}
      <div className="bg-[#0D1526] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Table Filters Header */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث في الزوار بالمسار، الحملة، المعرف، أو المصدر..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-indigo-500 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Device Filter */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={deviceFilter}
                onChange={(e) => setDeviceFilter(e.target.value)}
                className="bg-transparent text-white outline-none cursor-pointer"
              >
                <option value="ALL">كل الأجهزة</option>
                <option value="mobile">الهاتف (Mobile)</option>
                <option value="desktop">الكمبيوتر (Desktop)</option>
                <option value="tablet">اللوحي (Tablet)</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              عدد الجلسات المسجلة: <strong className="text-white font-mono">{filteredLogs.length}</strong>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase text-[11px] font-bold">
              <tr>
                <th className="p-4">الوقت والتاريخ</th>
                <th className="p-4">الصفحة المقصودة (Path)</th>
                <th className="p-4">المصدر والحملة الإعلانية (UTM)</th>
                <th className="p-4">الجهاز والمتصفح</th>
                <th className="p-4">معرف الجلسة (Session ID)</th>
                <th className="p-4">مصدر الإحالة (Referrer)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span>جاري تحميل سجل حركة الزوار الحقيقي...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    لم يتم تسجيل أي زيارات مطابقة للبحث حتى الآن.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    {/* Timestamp */}
                    <td className="p-4 font-mono text-[11px] text-slate-400">
                      <div>{new Date(log.timestamp).toLocaleDateString("ar-DZ")}</div>
                      <div className="text-slate-300 font-bold">{new Date(log.timestamp).toLocaleTimeString("ar-DZ")}</div>
                    </td>

                    {/* Path */}
                    <td className="p-4 font-mono font-bold text-white text-xs">
                      <span className="text-indigo-400">{log.path || "/"}</span>
                    </td>

                    {/* UTM / Campaign */}
                    <td className="p-4">
                      {log.utmSource || log.utmCampaign ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold">
                            {log.utmSource || "ad"}
                          </span>
                          {log.utmCampaign && (
                            <div className="text-[10px] text-slate-400 font-mono">{log.utmCampaign}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-[11px]">مباشر / عضوي</span>
                      )}
                    </td>

                    {/* Device & Browser */}
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                        {log.deviceType === "mobile" ? (
                          <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{log.deviceType === "mobile" ? "هاتف" : "كمبيوتر"}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                        {log.browser || "Web"}
                      </div>
                    </td>

                    {/* Session ID */}
                    <td className="p-4 font-mono text-[10px] text-slate-500 truncate max-w-[120px]">
                      {log.sessionId}
                    </td>

                    {/* Referrer */}
                    <td className="p-4 text-[11px] text-slate-400 truncate max-w-[160px]">
                      {log.referrer ? (
                        <span title={log.referrer}>{log.referrerDomain || log.referrer}</span>
                      ) : (
                        <span className="text-slate-600">Direct Visit</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
