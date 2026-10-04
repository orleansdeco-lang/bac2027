"use client";

import React from "react";
import {
  TopPageItem,
  TrafficSourceItem,
  EntryPageItem,
  ExitPageItem,
  GeographyBreakdown,
} from "@/lib/operations/visitors-analytics";
import {
  FileText,
  Share2,
  LogIn,
  LogOut,
  MapPin,
  ExternalLink,
  Layers,
} from "lucide-react";

interface Props {
  topPages: TopPageItem[];
  sources: TrafficSourceItem[];
  entryPages: EntryPageItem[];
  exitPages: ExitPageItem[];
  geography: GeographyBreakdown;
  loading?: boolean;
}

export function TrafficSourcesAndTopPages({
  topPages,
  sources,
  entryPages,
  exitPages,
  geography,
  loading = false,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. TOP PAGES */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>أكثر الصفحات مشاهدة (Top Pages)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                مشاهدات حقيقية مؤكدة عبر أحداث page_view
              </p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
              {topPages.length} مسار
            </span>
          </div>

          <div className="space-y-2">
            {(topPages || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                لا توجد مشاهدات صفحات مسجلة في هذا النطاق الزمني
              </div>
            ) : (
              (topPages || []).map((page, idx) => {
                const path = page.path || (page as any).page || "/";
                const views = page.views ?? (page as any).count ?? 0;
                const percentage = page.percentage ?? 0;

                return (
                  <div
                    key={path || idx}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono text-slate-200 truncate max-w-[240px] sm:max-w-xs" dir="ltr">
                        {path}
                      </span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-cyan-300 font-bold">{views} مشاهدة</span>
                        <span className="text-[10px] text-slate-400">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percentage}%` }}
                        className="h-full bg-cyan-500 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 2. TRAFFIC SOURCES */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-indigo-400" />
                <span>مصادر الزيارات (Traffic Sources)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                القنوات والحملات الإعلانية ومصادر الإحالة
              </p>
            </div>
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
              FIRST-TOUCH / CHANNEL
            </span>
          </div>

          <div className="space-y-2">
            {sources.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                لا توجد مصادر زيارات مسجلة في هذا النطاق الزمني
              </div>
            ) : (
              sources.map((src) => (
                <div
                  key={src.source}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-white capitalize flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      <span>{src.source}</span>
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-indigo-300 font-bold">{src.sessions} جلسة</span>
                      <span className="text-slate-400 text-[11px]">({src.visitors} زائر)</span>
                      <span className="text-[10px] text-indigo-400">({src.percentage}%)</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${src.percentage}%` }}
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 3. ENTRY PAGES */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>صفحات الدخول الأولى (Entry Pages)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                الصفحات التي بدأت منها جلسات التصفح
              </p>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              LANDING PAGES
            </span>
          </div>

          <div className="space-y-2">
            {(entryPages || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                لا توجد صفحات دخول مسجلة
              </div>
            ) : (
              (entryPages || []).map((entry, idx) => {
                const page = entry.page || (entry as any).path || "/";
                const sessions = entry.sessions ?? (entry as any).entries ?? 0;
                const percentage = entry.percentage ?? 0;

                return (
                  <div
                    key={page || idx}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-slate-300 truncate max-w-[240px]" dir="ltr">
                      {page}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-emerald-300">{sessions} جلسة</span>
                      <span className="text-[10px] text-slate-400">({percentage}%)</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 4. EXIT / LAST PAGES (Only if supported and available) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>صفحات الخروج الأخيرة (Exit / Last Pages)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                آخر صفحة تمت زيارتها قبل انتهاء الجلسة
              </p>
            </div>
            <span className="text-[10px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/40">
              EXIT ATTRIBUTION
            </span>
          </div>

          <div className="space-y-2">
            {(exitPages || []).length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                لم يتم تسجيل صفحات خروج محددة بعد للجلسات الحالية
              </div>
            ) : (
              (exitPages || []).map((exit, idx) => {
                const page = exit.page || (exit as any).path || "/";
                const exits = exit.exits ?? 0;
                const percentage = exit.percentage ?? 0;

                return (
                  <div
                    key={page || idx}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-slate-300 truncate max-w-[240px]" dir="ltr">
                      {page}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-rose-300">{exits} خروج</span>
                      <span className="text-[10px] text-slate-400">({percentage}%)</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 5. GEOGRAPHY (Strict rule: ONLY show if legitimate geographic data exists) */}
      {geography?.hasReliableGeography && geography?.wilayas && geography.wilayas.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-md space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>التوزيع الجغرافي التقريبي (Coarse Geography)</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                بيانات جغرافية عامة غير حساسة مستخرجة من سياق الجلسات المسجلة
              </p>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
              ALGERIA WILAYAS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {geography.wilayas.map((w) => (
              <div
                key={w.wilaya}
                className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-200">ولاية {w.wilaya}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{w.percentage}%</div>
                </div>
                <div className="font-mono font-bold text-amber-400 text-sm">{w.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
