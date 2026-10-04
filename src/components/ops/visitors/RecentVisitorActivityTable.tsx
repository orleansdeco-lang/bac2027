"use client";

import React, { useState, useMemo } from "react";
import { RecentVisitorActivityItem, formatDwellDuration } from "@/lib/operations/visitors-analytics";
import {
  Activity,
  Search,
  Filter,
  Smartphone,
  Monitor,
  Tablet,
  HelpCircle,
  Clock,
  Repeat,
  UserPlus,
  ArrowRight,
} from "lucide-react";

interface Props {
  activity: RecentVisitorActivityItem[];
  loading?: boolean;
}

export function RecentVisitorActivityTable({ activity, loading = false }: Props) {
  const [search, setSearch] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");

  const filtered = useMemo(() => {
    return (activity || []).filter((item) => {
      const device = (item.device || "desktop").toLowerCase();
      if (deviceFilter !== "all" && device !== deviceFilter.toLowerCase()) {
        return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const page = ((item as any).page || (item as any).path || "").toLowerCase();
        const source = (item.source || "").toLowerCase();
        const id = String(item.id || (item as any).sessionId || "").toLowerCase();
        if (!page.includes(q) && !source.includes(q) && !id.includes(q)) return false;
      }
      return true;
    });
  }, [activity, search, deviceFilter]);

  function getDeviceIcon(device?: string) {
    switch ((device || "desktop").toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-3.5 h-3.5 text-cyan-400" />;
      case "tablet":
        return <Tablet className="w-3.5 h-3.5 text-purple-400" />;
      case "desktop":
        return <Monitor className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  }

  function formatTimeDetails(isoString?: string) {
    if (!isoString) return { date: "—", time: "—" };
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return { date: "—", time: isoString };
      return {
        date: d.toLocaleDateString("fr-DZ"),
        time: d.toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      };
    } catch {
      return { date: "—", time: isoString };
    }
  }

  function formatClockOnly(isoString?: string) {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleTimeString("fr-DZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return null;
    }
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl">
      {/* Header & Filter Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-white">النشاط الأخير للزوار ومدة البقاء (Recent Visitor Activity & Dwell Time)</span>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
            {filtered.length} نشاط مسجل
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث بالمسار أو المصدر..."
              className="w-full pr-8 pl-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Device Filter */}
          <select
            value={deviceFilter}
            onChange={(e) => setDeviceFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            <option value="all">كل الأجهزة</option>
            <option value="mobile">الهاتف (Mobile)</option>
            <option value="desktop">الكمبيوتر (Desktop)</option>
            <option value="tablet">اللوحي (Tablet)</option>
          </select>
        </div>
      </div>

      {/* Activity Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs text-slate-300">
          <thead className="bg-slate-950/90 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">الصفحة المزارة (Page)</th>
              <th className="px-4 py-3">وقت الدخول والخروج (Entry & Exit)</th>
              <th className="px-4 py-3">مدة البقاء (Dwell Time)</th>
              <th className="px-4 py-3">نوع الزائر (Visitor Type)</th>
              <th className="px-4 py-3">مصدر الزيارة (Source)</th>
              <th className="px-4 py-3">نوع الجهاز (Device)</th>
              <th className="px-4 py-3 text-left">معرف الجلسة الآمن</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <span>جاري تحميل أحدث تفاعلات الزوار ومدة البقاء...</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-12 text-center text-slate-500 text-xs">
                  لا توجد سجلات نشاط مطابقة في الفترة المحددة
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => {
                const { date, time } = formatTimeDetails(item.time);
                const isNew = item.visitorType === "NEW" || (item as any).isNew;
                const page = (item as any).page || (item as any).path || "/";
                const source = item.source || "direct";
                const device = item.device || "desktop";
                const safeId = String(item.id || (item as any).sessionId || `act_${idx}`);

                // Exact entry & exit times
                const entryClock = formatClockOnly(item.enteredAt) || time;
                const exitClock = formatClockOnly(item.exitedAt);

                // Dwell duration
                const durationText = item.formattedDuration || (typeof item.durationSeconds === "number" ? formatDwellDuration(item.durationSeconds) : null);

                return (
                  <tr key={safeId} className="hover:bg-slate-800/40 transition-colors">
                    {/* Page */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-cyan-300 text-xs truncate max-w-[220px] block" dir="ltr">
                        {page}
                      </span>
                    </td>

                    {/* Entry & Exit Times */}
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400" dir="ltr">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <span className="text-[10px] text-slate-500 font-sans">دخول:</span>
                          <span>{entryClock}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <span className="text-[10px] text-slate-500 font-sans">خروج:</span>
                          <span>{exitClock || (item.enteredAt && !item.exitedAt ? "جارية الآن..." : "—")}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">{date}</div>
                      </div>
                    </td>

                    {/* Dwell Duration Badge */}
                    <td className="px-4 py-3">
                      {durationText && durationText !== "—" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-800/50">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{durationText}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 bg-slate-950/60 border border-slate-800">
                          <span>&lt; 1ث</span>
                        </span>
                      )}
                    </td>

                    {/* Visitor Type */}
                    <td className="px-4 py-3">
                      {isNew ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          <UserPlus className="w-3 h-3" />
                          <span>زائر جديد</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          <Repeat className="w-3 h-3" />
                          <span>زائر عائد</span>
                        </span>
                      )}
                    </td>

                    {/* Source */}
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 font-mono">
                        {source}
                      </span>
                    </td>

                    {/* Device */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 capitalize text-slate-300">
                        {getDeviceIcon(device)}
                        <span>{device}</span>
                      </div>
                    </td>

                    {/* Masked Session ID (Safe, Zero PII) */}
                    <td className="px-4 py-3 text-left">
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-950/80 px-2 py-1 rounded border border-slate-800/60">
                        {safeId.length > 12 ? `${safeId.slice(0, 12)}…` : safeId}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
