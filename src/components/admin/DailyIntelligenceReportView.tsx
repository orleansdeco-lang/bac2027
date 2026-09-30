"use client";

import React, { useState } from "react";
import {
  DailyIntelligenceReport,
  DailyReportItem,
} from "@/lib/admin/daily-report-service";
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sliders,
  Check,
  X,
  FileCheck,
  HelpCircle,
  TrendingUp,
  Activity,
  Zap,
  Info,
} from "lucide-react";
import { AdminActionProposal } from "@/lib/admin/ai-actions";

interface DailyIntelligenceReportViewProps {
  report: DailyIntelligenceReport;
  onRefresh?: () => void;
  isLoading?: boolean;
  onPrepareAction?: (item: DailyReportItem) => void;
}

export function DailyIntelligenceReportView({
  report,
  onRefresh,
  isLoading = false,
  onPrepareAction,
}: DailyIntelligenceReportViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "stable" | "attention" | "critical" | "actions">("all");
  const [selectedDetailsItem, setSelectedDetailsItem] = useState<DailyReportItem | null>(null);
  const [preparingActionId, setPreparingActionId] = useState<string | null>(null);

  const handlePrepareClick = async (item: DailyReportItem) => {
    if (onPrepareAction) {
      setPreparingActionId(item.id);
      try {
        await onPrepareAction(item);
      } finally {
        setPreparingActionId(null);
      }
    }
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* 1. REPORT HERO HEADER */}
      <div className="bg-[#0B132B] border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>SHATER DAILY REPORT</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-md border border-slate-700/50">
                {new Date(report.generatedAt).toLocaleString("ar-DZ", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>بيانات عملياتية موثقة (Zero Fabrication)</span>
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              تقرير الذكاء اليومي لـ SHATER
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
              {report.summaryAr}
            </p>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer self-start lg:self-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "جارِ الفحص اللحظي..." : "إعادة الفحص الآن"}</span>
            </button>
          )}
        </div>

        {/* METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-[#080D1A]/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-1">الطلاب المسجلون</span>
            <span className="text-base font-black text-white font-mono">
              {report.platformStatus.totalStudents.toLocaleString("ar-DZ")}
            </span>
          </div>
          <div className="bg-[#080D1A]/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-1">النشاط اليومي (DAU)</span>
            <span className="text-base font-black text-emerald-400 font-mono">
              {report.platformStatus.activeStudentsToday.toLocaleString("ar-DZ")}
            </span>
          </div>
          <div className="bg-[#080D1A]/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-1">دقة الإجابات الكلية</span>
            <span className="text-base font-black text-cyan-400 font-mono">
              %{report.platformStatus.accuracyRate}
            </span>
          </div>
          <div className="bg-[#080D1A]/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-1">سلامة البيانات</span>
            <span className="text-base font-black text-indigo-400 font-mono">
              %{report.dataHealth.healthScore}
            </span>
          </div>
          <div className="bg-[#080D1A]/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-1">الاشتراكات المدفوعة</span>
            <span className="text-base font-black text-amber-400 font-mono">
              {report.businessHealth.paidSubscriptionsCount.toLocaleString("ar-DZ")}
            </span>
          </div>
          <div className="bg-[#080D1A]/60 rounded-xl p-3 border border-slate-800">
            <span className="text-[10px] text-slate-400 block mb-1">الطلبات المعلقة (COD)</span>
            <span className="text-base font-black text-rose-400 font-mono">
              {report.businessHealth.pendingCodOrdersCount.toLocaleString("ar-DZ")}
            </span>
          </div>
        </div>
      </div>

      {/* 2. PILLAR TABS NAV */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "all"
              ? "bg-slate-800 text-white border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          كل الأقسام ({report.stableItems.length + report.attentionItems.length + report.criticalIssues.length + report.proposedActions.length})
        </button>

        <button
          onClick={() => setActiveTab("critical")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "critical"
              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
              : "text-slate-400 hover:text-rose-400"
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span>🔴 مشاكل حرجة ({report.criticalIssues.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("attention")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "attention"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "text-slate-400 hover:text-amber-400"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>⚠ تحتاج انتباه ({report.attentionItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("actions")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "actions"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              : "text-slate-400 hover:text-blue-400"
          }`}
        >
          <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
          <span>→ اقتراحات العمل ({report.proposedActions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("stable")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeTab === "stable"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              : "text-slate-400 hover:text-emerald-400"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>✓ الأمور المستقرة ({report.stableItems.length})</span>
        </button>
      </div>

      {/* 3. FOUR PILLARS CONTENT */}
      <div className="space-y-8">
        {/* PILLAR: 🔴 مشاكل حرجة (Critical Issues) */}
        {(activeTab === "all" || activeTab === "critical") && report.criticalIssues.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span>🔴 مشاكل حرجة (تستدعي التدخل الفوري)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.criticalIssues.map((item) => (
                <ReportCard
                  key={item.id}
                  item={item}
                  variant="critical"
                  onOpenDetails={() => setSelectedDetailsItem(item)}
                  onPrepareAction={() => handlePrepareClick(item)}
                  isPreparing={preparingActionId === item.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* PILLAR: ⚠ تحتاج انتباه (Needs Attention) */}
        {(activeTab === "all" || activeTab === "attention") && report.attentionItems.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>⚠ تحتاج انتباه (ملاحظات تشغيلية وبيداغوجية)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {report.attentionItems.map((item) => (
                <ReportCard
                  key={item.id}
                  item={item}
                  variant="attention"
                  onOpenDetails={() => setSelectedDetailsItem(item)}
                  onPrepareAction={() => handlePrepareClick(item)}
                  isPreparing={preparingActionId === item.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* PILLAR: → اقتراحات العمل (Proposed Actions) */}
        {(activeTab === "all" || activeTab === "actions") && report.proposedActions.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <ArrowRight className="w-4 h-4 text-blue-400" />
                <span>→ اقتراحات العمل (Actionable Proposals)</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                🔒 مقترحات فقط؛ لا تنفيذ آلي صامت
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.proposedActions.map((item) => (
                <ReportCard
                  key={item.id}
                  item={item}
                  variant="action"
                  onOpenDetails={() => setSelectedDetailsItem(item)}
                  onPrepareAction={() => handlePrepareClick(item)}
                  isPreparing={preparingActionId === item.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* PILLAR: ✓ الأمور المستقرة (Stable) */}
        {(activeTab === "all" || activeTab === "stable") && report.stableItems.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>✓ الأمور المستقرة (حالة المنصة تعمل بانتظام)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {report.stableItems.map((item) => (
                <ReportCard
                  key={item.id}
                  item={item}
                  variant="stable"
                  onOpenDetails={() => setSelectedDetailsItem(item)}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 4. TRANSPARENCY NOTICE (NO FABRICATION) */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-400 space-y-1">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>شفافية التقارير وعدم اختلاق المقاييس (Strict No-Fabrication Protocol)</span>
        </div>
        <p className="leading-relaxed">
          {report.businessHealth.missingMetricsNotice}
        </p>
      </div>

      {/* 5. MODAL: ITEM DETAILS INSPECTION */}
      {selectedDetailsItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1526] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative text-right">
            <button
              onClick={() => setSelectedDetailsItem(null)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                تفاصيل الكيان المفحوص
              </span>
              <h3 className="text-base font-bold text-white mt-1">
                {selectedDetailsItem.titleAr}
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-300 block">السبب والتشخيص البيداغوجي/التقني:</span>
                <p className="text-slate-400 leading-relaxed">{selectedDetailsItem.whyAr}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="font-semibold text-slate-300 block">الدليل الإحصائي المسجل:</span>
                <p className="text-slate-400 leading-relaxed font-mono">{selectedDetailsItem.evidenceAr}</p>
              </div>

              {selectedDetailsItem.recommendedActionAr && (
                <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/20 space-y-1">
                  <span className="font-semibold text-indigo-300 block">الإجراء المقترح:</span>
                  <p className="text-indigo-200/90 leading-relaxed">{selectedDetailsItem.recommendedActionAr}</p>
                </div>
              )}

              {selectedDetailsItem.detailsData && (
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400 block font-mono">البيانات الفنية الخام:</span>
                  <pre className="p-3 rounded-xl bg-black/60 border border-slate-800 text-[10px] font-mono text-emerald-400 overflow-x-auto max-h-40 scrollbar-none" dir="ltr">
                    {JSON.stringify(selectedDetailsItem.detailsData, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedDetailsItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                إغلاق
              </button>
              {selectedDetailsItem.actionPayload && onPrepareAction && (
                <button
                  onClick={() => {
                    const item = selectedDetailsItem;
                    setSelectedDetailsItem(null);
                    handlePrepareClick(item);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>حضّر العملية</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: Individual Card in 4 Pillars
function ReportCard({
  item,
  variant,
  onOpenDetails,
  onPrepareAction,
  isPreparing = false,
}: {
  item: DailyReportItem;
  variant: "stable" | "attention" | "critical" | "action";
  onOpenDetails: () => void;
  onPrepareAction?: () => void;
  isPreparing?: boolean;
}) {
  const borderClass =
    variant === "critical"
      ? "border-rose-500/30 hover:border-rose-500/50 bg-[#160B12]"
      : variant === "attention"
      ? "border-amber-500/30 hover:border-amber-500/50 bg-[#17130B]"
      : variant === "action"
      ? "border-blue-500/30 hover:border-blue-500/50 bg-[#0B1424]"
      : "border-emerald-500/20 hover:border-emerald-500/40 bg-[#0B1713]";

  return (
    <div
      className={`rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between space-y-3 ${borderClass}`}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-xs md:text-sm font-bold text-white leading-snug">
            {item.titleAr}
          </h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0">
            {variant === "critical" && (
              <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-bold">
                حرج
              </span>
            )}
            {variant === "attention" && (
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                انتباه
              </span>
            )}
            {variant === "action" && (
              <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                إجراء
              </span>
            )}
            {variant === "stable" && (
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                مستقر
              </span>
            )}
          </span>
        </div>

        {/* WHY */}
        <div className="text-[11px] text-slate-300 leading-relaxed">
          <span className="text-slate-400 font-semibold">السبب: </span>
          <span>{item.whyAr}</span>
        </div>

        {/* EVIDENCE */}
        <div className="text-[11px] text-slate-400 leading-relaxed bg-black/30 p-2 rounded-lg border border-white/5 font-mono">
          <span className="text-slate-400 font-semibold font-sans">الدليل: </span>
          <span>{item.evidenceAr}</span>
        </div>

        {/* RECOMMENDED ACTION */}
        {item.recommendedActionAr && (
          <div className="text-[11px] text-indigo-300 bg-indigo-950/30 p-2 rounded-lg border border-indigo-500/20">
            <span className="text-indigo-400 font-semibold">الإجراء المقترح: </span>
            <span>{item.recommendedActionAr}</span>
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
        <button
          onClick={onOpenDetails}
          className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <ExternalLink className="w-3 h-3" />
          <span>فتح التفاصيل</span>
        </button>

        {onPrepareAction && item.actionPayload && (
          <button
            onClick={onPrepareAction}
            disabled={isPreparing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
          >
            <Sliders className="w-3 h-3" />
            <span>{isPreparing ? "جارِ التحضير..." : "حضّر العملية"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
