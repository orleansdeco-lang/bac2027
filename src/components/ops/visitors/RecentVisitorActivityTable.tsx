"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  RecentVisitorActivityItem,
  formatDwellDuration,
  generateGuestStudentNumber,
} from "@/lib/operations/visitors-analytics";
import { VisitorDossierModal } from "./VisitorDossierModal";
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
  User,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Info,
  SlidersHorizontal,
} from "lucide-react";

interface Props {
  activity: RecentVisitorActivityItem[];
  loading?: boolean;
}

export function RecentVisitorActivityTable({ activity, loading = false }: Props) {
  const [search, setSearch] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [visitorTypeFilter, setVisitorTypeFilter] = useState("all");
  const [pageSize, setPageSize] = useState<string>("25");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedVisitor, setSelectedVisitor] = useState<RecentVisitorActivityItem | null>(null);

  // Reset page to 1 whenever search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, deviceFilter, visitorTypeFilter, pageSize]);

  const filtered = useMemo(() => {
    return (activity || []).filter((item) => {
      // 1. Device filter
      const device = (item.device || "desktop").toLowerCase();
      if (deviceFilter !== "all" && device !== deviceFilter.toLowerCase()) {
        return false;
      }

      // 2. Visitor type filter
      const isReg = Boolean(item.isRegistered || item.studentProfile || item.userId);
      const isNew = item.visitorType === "NEW";
      if (visitorTypeFilter === "registered" && !isReg) return false;
      if (visitorTypeFilter === "guest" && isReg) return false;
      if (visitorTypeFilter === "new" && !isNew) return false;
      if (visitorTypeFilter === "returning" && isNew) return false;

      // 3. Search query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const page = ((item as any).page || (item as any).path || "").toLowerCase();
        const source = (item.source || "").toLowerCase();
        const name = (item.displayName || "").toLowerCase();
        const id = String(item.id || (item as any).sessionId || (item as any).visitorId || "").toLowerCase();
        const wilaya = String(item.wilayaCode || item.wilayaName || "").toLowerCase();

        if (
          !page.includes(q) &&
          !source.includes(q) &&
          !id.includes(q) &&
          !name.includes(q) &&
          !wilaya.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [activity, search, deviceFilter, visitorTypeFilter]);

  // Pagination calculations
  const totalItems = filtered.length;
  const isAll = pageSize === "all";
  const numSize = isAll ? Math.max(1, totalItems) : Math.max(1, parseInt(pageSize, 10) || 25);
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalItems / numSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedItems = useMemo(() => {
    if (isAll) return filtered;
    const start = (safePage - 1) * numSize;
    return filtered.slice(start, start + numSize);
  }, [filtered, isAll, safePage, numSize]);

  const startItem = totalItems === 0 ? 0 : (safePage - 1) * numSize + 1;
  const endItem = isAll ? totalItems : Math.min(safePage * numSize, totalItems);

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
    <>
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl backdrop-blur-xl">
        {/* Header & Badges */}
        <div className="p-4 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white">النشاط الأخير للزوار والطلاب (Recent Activity & Dwell Time)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/40">
                {totalItems} نشاط مسجل
              </span>
              {activity && activity.length > totalItems && (
                <span className="text-[10px] text-slate-400 font-mono">
                  (من إجمالي {activity.length})
                </span>
              )}
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800/60">
              <Info className="w-3 h-3 text-cyan-400" />
              <span>يتم تجميع زيارات نفس الصفحة لحساب مدة البقاء بدقة وتجنب التكرار</span>
            </span>
          </div>

          {/* Filter Controls Bar */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="بحث بالاسم، الصفحة، المصدر..."
                className="w-full pr-8 pl-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Visitor Type Filter */}
            <select
              value={visitorTypeFilter}
              onChange={(e) => setVisitorTypeFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">كل الهويات</option>
              <option value="registered">طلاب مسجلون فقط 🎓</option>
              <option value="guest">زوار ضيوف فقط 👤</option>
              <option value="returning">زوار عائدون</option>
              <option value="new">زوار جدد</option>
            </select>

            {/* Device Filter */}
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-slate-300 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">كل الأجهزة</option>
              <option value="mobile">الهاتف (Mobile)</option>
              <option value="desktop">الكمبيوتر (Desktop)</option>
              <option value="tablet">اللوحي (Tablet)</option>
            </select>

            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 text-cyan-400 text-xs font-mono rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="25">25 في الصفحة</option>
              <option value="50">50 في الصفحة</option>
              <option value="100">100 في الصفحة</option>
              <option value="all">عرض الكل ({totalItems})</option>
            </select>
          </div>
        </div>

        {/* Activity Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">الطالب / الزائر (انقر للملف الكامل)</th>
                <th className="px-4 py-3">الصفحة المزارة (Page)</th>
                <th className="px-4 py-3">وقت الدخول والخروج (Entry & Exit)</th>
                <th className="px-4 py-3">مدة البقاء (Dwell Time)</th>
                <th className="px-4 py-3">نوع الزائر</th>
                <th className="px-4 py-3">مصدر الزيارة (Source)</th>
                <th className="px-4 py-3">الجهاز (Device)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                      <span>جاري تحميل تفاعلات الزوار والطلاب...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 text-xs">
                    لا توجد سجلات نشاط مطابقة في الفترة المحددة
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item, idx) => {
                  const { date, time } = formatTimeDetails(item.time);
                  const isNew = item.visitorType === "NEW" || (item as any).isNew;
                  const page = (item as any).page || (item as any).path || "/";
                  const source = item.source || "direct";
                  const device = item.device || "desktop";
                  const safeId = String(item.id || (item as any).sessionId || `act_${idx}`);

                  // Student & Visitor Identity
                  const isReg = Boolean(item.isRegistered || item.studentProfile || item.userId);
                  const fallbackGuestName = generateGuestStudentNumber(item.visitorId || item.sessionId || safeId);
                  const displayName = item.displayName || fallbackGuestName;

                  // Exact entry & exit times
                  const entryClock = formatClockOnly(item.enteredAt) || time;
                  const exitClock = formatClockOnly(item.exitedAt);

                  // Dwell duration
                  const durationText =
                    item.formattedDuration ||
                    (typeof item.durationSeconds === "number" ? formatDwellDuration(item.durationSeconds) : null);

                  return (
                    <tr key={safeId} className="hover:bg-slate-800/40 transition-colors">
                      {/* Student / Visitor Name (CLICKABLE FOR FULL DOSSIER & JOURNEY) */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedVisitor(item)}
                          className="flex items-center gap-2 text-right group cursor-pointer focus:outline-none"
                          title="انقر لعرض كل تفاصيل واستخدامات هذا الزائر"
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                              isReg
                                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:border-emerald-400 group-hover:bg-emerald-500/20"
                                : "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 group-hover:border-cyan-400 group-hover:bg-cyan-500/20"
                            }`}
                          >
                            {isReg ? <GraduationCap className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                          </div>

                          <div className="truncate max-w-[200px]">
                            <div
                              className={`font-bold text-xs truncate group-hover:underline ${
                                isReg ? "text-emerald-300" : "text-cyan-300"
                              }`}
                            >
                              {displayName}
                            </div>
                            <div className="text-[10px] text-slate-500 font-sans truncate">
                              {isReg ? "طالب مسجل • انقر للملف" : "زائر ضيف • انقر للسجل"}
                            </div>
                          </div>
                        </button>
                      </td>

                      {/* Page */}
                      <td className="px-4 py-3">
                        <span className="font-mono text-cyan-300 text-xs truncate max-w-[200px] block" dir="ltr">
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
                            {exitClock ? (
                              <span>{exitClock}</span>
                            ) : item.enteredAt && !item.exitedAt ? (
                              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>جارية الآن...</span>
                              </span>
                            ) : (
                              <span>—</span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500">{date}</div>
                        </div>
                      </td>

                      {/* Dwell Duration Badge */}
                      <td className="px-4 py-3">
                        {durationText && durationText.includes("نشطة الآن") ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-800/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>{durationText}</span>
                          </span>
                        ) : durationText && durationText !== "—" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-950/70 text-cyan-300 border border-cyan-800/50">
                            <Clock className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{durationText}</span>
                          </span>
                        ) : item.enteredAt && !item.exitedAt ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>جارية الآن</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-slate-500 bg-slate-950/60 border border-slate-800">
                            <span>ثوانٍ معدودة</span>
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
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Table Footer */}
        {totalItems > 0 && !isAll && (
          <div className="p-3 border-t border-slate-800/80 bg-slate-950/60 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 font-mono">
              عرض{" "}
              <span className="text-white font-bold">{startItem}</span> -{" "}
              <span className="text-white font-bold">{endItem}</span> من أصل{" "}
              <span className="text-cyan-400 font-bold">{totalItems}</span> نشاط
            </div>

            <div className="flex items-center gap-1.5">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={safePage <= 1}
                title="الصفحة الأولى"
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                title="الصفحة السابقة"
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Page Indicator */}
              <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
                صفحة <span className="text-cyan-400 font-bold">{safePage}</span> من{" "}
                <span className="text-white font-bold">{totalPages}</span>
              </div>

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                title="الصفحة التالية"
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage >= totalPages}
                title="الصفحة الأخيرة"
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Visitor Dossier & Journey Inspector Modal */}
      <VisitorDossierModal
        isOpen={Boolean(selectedVisitor)}
        onClose={() => setSelectedVisitor(null)}
        visitor={selectedVisitor}
      />
    </>
  );
}
