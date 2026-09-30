"use client";

import React, { useEffect, useState } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  DailyIntelligenceReport,
  DailyReportItem,
} from "@/lib/admin/daily-report-service";
import { DailyIntelligenceReportView } from "@/components/admin/DailyIntelligenceReportView";
import {
  Bot,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Sliders,
  Check,
  X,
  RefreshCw,
  ArrowRight,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { AdminActionProposal } from "@/lib/admin/ai-actions";

export default function AdminDailyReportPage() {
  const [report, setReport] = useState<DailyIntelligenceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Safe Action Proposal for Confirmation Modal
  const [activeProposal, setActiveProposal] = useState<AdminActionProposal | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const fetchDailyReport = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/ai/daily-report", {
        method: forceRefresh ? "POST" : "GET",
      });
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
      } else {
        setError(data.error || "تعذر استرجاع تقرير الذكاء اليومي");
      }
    } catch (err: any) {
      setError(err?.message || "خطأ أثناء الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyReport(false);
  }, []);

  // Handler for [ حضّر العملية ]: Creates a safe proposal via Safe Controlled Actions API
  const handlePrepareAction = async (item: DailyReportItem) => {
    if (!item.actionPayload) return;
    setActionSuccessMessage(null);

    try {
      const res = await adminFetch("/api/admin/ai/actions", {
        method: "POST",
        body: JSON.stringify({
          actionName: item.actionPayload.actionName,
          resourceType: item.actionPayload.resourceType,
          resourceId: item.actionPayload.resourceId,
          params: item.actionPayload.params,
        }),
      });
      const data = await res.json();
      if (data.success && data.proposal) {
        setActiveProposal(data.proposal);
      } else {
        alert(data.error || "تعذر تحضير العملية المقترحة");
      }
    } catch (err: any) {
      alert("خطأ أثناء تحضير العملية: " + (err?.message || "فشل الاتصال"));
    }
  };

  // Handler for Human Confirmation of Prepared Action
  const handleConfirmAction = async () => {
    if (!activeProposal) return;
    setIsExecutingAction(true);
    try {
      const res = await adminFetch(`/api/admin/ai/actions/${activeProposal.id}/execute`, {
        method: "POST",
        body: JSON.stringify({
          confirmed: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccessMessage(data.message || "تم تنفيذ الإجراء المعتمد بنجاح وتوثيقه في سجل التدقيق.");
        setActiveProposal(null);
        // Refresh daily report to reflect updated reality
        fetchDailyReport(true);
      } else {
        alert(data.error || "فشل تنفيذ الإجراء المعتمد");
      }
    } catch (err: any) {
      alert("خطأ أثناء تنفيذ الإجراء: " + (err?.message || "فشل الاتصال"));
    } finally {
      setIsExecutingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation & Quick Action */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">
                تقرير الذكاء اليومي لـ SHATER (Daily Intelligence Report)
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified Observability
              </span>
            </div>
            <p className="text-xs text-slate-400">
              فحص شامل للنشاط، صحة التعلم، جودة البيانات، استقرار المنصة، والمؤشرات التجارية الواقعية.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDailyReport(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>حلل SHATER الآن</span>
          </button>
          <Link
            href="/admin/ai"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>مساعد AI</span>
          </Link>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button
            onClick={() => setActionSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-300 text-xs"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && !report && (
        <div className="bg-[#0D1526] border border-slate-800 rounded-2xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">جارِ فحص وتوليد تقرير الذكاء اليومي...</h3>
            <p className="text-xs text-slate-400">
              يتم استقراء نشاط الطلاب، ومختبر الأخطاء، ونسب التمكن، وسلامة الروابط دون اختلاق أي بيانات.
            </p>
          </div>
        </div>
      )}

      {/* Report View Component */}
      {report && (
        <DailyIntelligenceReportView
          report={report}
          onRefresh={() => fetchDailyReport(true)}
          isLoading={loading}
          onPrepareAction={handlePrepareAction}
        />
      )}

      {/* SAFE CONTROLLED ACTION CONFIRMATION MODAL (STAGE: PREVIEW & HUMAN CONFIRMATION) */}
      {activeProposal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0D1526] border-2 border-amber-500/40 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative text-right">
            <button
              onClick={() => setActiveProposal(null)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sliders className="w-4 h-4" />
              </span>
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  معاينة الإجراء المصادق عليه (Safe Action Preview)
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  {activeProposal.titleAr}
                </h3>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {activeProposal.descriptionAr}
            </p>

            {/* Before vs After Diff Preview */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
              <span className="font-semibold text-slate-300 block">فروقات التعديل الصريحة (Before / After):</span>
              <div className="space-y-1.5 font-mono text-[11px]">
                {activeProposal.diffSummary.map((diff, idx) => (
                  <div key={idx} className="p-2 rounded bg-black/40 border border-white/5 space-y-1">
                    <span className="text-slate-400 font-sans block">{diff.labelAr}:</span>
                    <div className="flex items-center gap-2 text-rose-400">
                      <span>الحالي:</span>
                      <span>{JSON.stringify(diff.before)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <span>المقترح:</span>
                      <span>{JSON.stringify(diff.after)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 space-y-0.5">
              <span className="font-bold block">🛡️ ضمانة شاطر لعدم التعديل الصامت:</span>
              <span>لن يتم تطبيق هذا الإجراء إلا بعد تأكيدك الصريح؛ وسيُسجل في سجل التدقيق الأمني بشكل دائم.</span>
            </div>

            {/* Confirmation Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveProposal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isExecutingAction}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isExecutingAction ? "جارِ التنفيذ والتوثيق..." : "تأكيد وتنفيذ الإجراء"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
