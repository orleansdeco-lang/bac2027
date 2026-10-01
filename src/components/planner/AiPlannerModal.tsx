"use client";

import React, { useState } from "react";
import { PlannerEvent } from "@/lib/planner/types";
import {
  Sparkles,
  X,
  RefreshCw,
  CheckCircle2,
  Calendar,
  Clock,
  Bot,
  AlertCircle,
  TrendingUp,
  HelpCircle,
  XCircle,
} from "lucide-react";
import { getAlgeriaDateString } from "@/lib/planner/algeria-date";
import { ALL_SUBJECTS } from "@/lib/constants/streams";
import { SubjectId } from "@/types/education";

interface AiPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptPlan: (
    events: Omit<PlannerEvent, "id" | "created_at" | "updated_at">[]
  ) => void;
  streamId?: string;
  startDateIso?: string;
}

interface AiProposalData {
  type: string;
  title: string;
  streamNameAr: string;
  whyAr: string;
  impactAr: string;
  daysCount: number;
  proposedEvents: any[];
}

export const AiPlannerModal: React.FC<AiPlannerModalProps> = ({
  isOpen,
  onClose,
  onAcceptPlan,
  streamId = "sciences_exp",
  startDateIso,
}) => {
  const [prompt, setPrompt] = useState("");
  const [daysCount, setDaysCount] = useState(5);
  const [dailyHours, setDailyHours] = useState(3);
  const [isLoading, setIsLoading] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [proposal, setProposal] = useState<AiProposalData | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    {
      label: "تركيز مكثف على المواد الأساسية",
      text: "ركز لي على المواد ذات المعامل الأكبر، مع تخصيص تمارين مسائية يومياً.",
    },
    {
      label: "تحضير فرض تجريبي الأسبوع القادم",
      text: "عندي فروض قادمة، أريد مراجعة مركزة لدروس الفصل الأول مع حل مواضيع نموذجية.",
    },
    {
      label: "خطة متوازنة بين الحفظ والفهم",
      text: "برمج لي مواد الفهم في الصباح أو المساء، مع فترات حفظ قصيرة في أوقات النشاط.",
    },
  ];

  const handleGenerate = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const activeStart = startDateIso || getAlgeriaDateString();
      const res = await fetch("/api/planner/ai-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          userPrompt: prompt,
          streamId,
          startDate: activeStart,
          daysCount,
          dailyHoursAvailable: dailyHours,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "تعذر توليد المقترح الذكي حالياً.");
      }

      setProposal(data.proposal);
    } catch (err: any) {
      console.error("AI Planner error:", err);
      setErrorMessage(err.message || "حدث خطأ أثناء التواصل مع المساعد الذكي.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!proposal || !proposal.proposedEvents?.length) return;
    setIsCommitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/planner/ai-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "commit",
          events: proposal.proposedEvents,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "فشل تثبيت الخطة في قاعدة البيانات.");
      }

      // Propagate to parent to refresh state
      onAcceptPlan(proposal.proposedEvents);
      onClose();
    } catch (err: any) {
      console.error("Commit error:", err);
      setErrorMessage(err.message || "حدث خطأ أثناء تثبيت الخطة.");
    } finally {
      setIsCommitting(false);
    }
  };

  const handleReject = () => {
    setProposal(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-start">
      <div className="w-full max-w-2xl rounded-3xl border border-theme bg-card text-theme-text shadow-clay p-6 sm:p-7 relative transition-all max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full text-theme-muted hover:text-theme-text hover:bg-surface transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-[var(--color-primary-soft)] text-[var(--color-primary)] border border-[var(--color-primary)]/20 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-theme-text font-sans">
                الشاطر يقترح عليك
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-[var(--color-accent-soft)] text-[#8F5E1F] border border-[var(--color-accent)]/30">
                مساعد الذكاء الاصطناعي
              </span>
            </div>
            <p className="text-xs text-theme-secondary mt-1 font-medium">
              خطة دراسية ذكية مبنية على معاملات شعبتك وإشارات معمل الأخطاء — لن يتم تطبيق أي شيء إلا بموافقتك.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl border border-red-500/30 bg-red-500/10 text-red-600 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* State A: Inputs before generating */}
        {!proposal ? (
          <div className="space-y-4">
            {/* Natural language prompt */}
            <div>
              <label className="block text-xs font-bold text-theme-text mb-1.5">
                ما الذي تريد التركيز عليه في هذا البرنامج؟ (اختياري)
              </label>
              <textarea
                rows={3}
                placeholder="مثال: أريد التركيز على الرياضيات والعلوم، وأفضل المذاكرة بعد الخامسة مساءً..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full text-xs font-medium rounded-xl p-3 border border-theme bg-surface text-theme-text placeholder:text-theme-muted focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            {/* Quick Chips */}
            <div>
              <span className="block text-[11px] font-bold text-theme-secondary mb-1.5">
                مقترحات جاهزة سريعة:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(qp.text)}
                    className="text-xs font-medium px-3 py-1.5 rounded-xl border border-theme bg-surface text-theme-secondary hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/40 transition-all cursor-pointer"
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences / Options */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-theme-text mb-1.5">
                  مدة الخطة
                </label>
                <select
                  value={daysCount}
                  onChange={(e) => setDaysCount(parseInt(e.target.value, 10))}
                  className="w-full text-xs font-medium rounded-xl p-2.5 border border-theme bg-surface text-theme-text focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value={3}>3 أيام (خطة قصيرة ومركزة)</option>
                  <option value={5}>5 أيام دراسية</option>
                  <option value={7}>أسبوع كامل (7 أيام)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-text mb-1.5">
                  ساعات المذاكرة اليومية
                </label>
                <select
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseInt(e.target.value, 10))}
                  className="w-full text-xs font-medium rounded-xl p-2.5 border border-theme bg-surface text-theme-text focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value={2}>ساعتان (خفيفة ومركزة)</option>
                  <option value={3}>3 ساعات (موصى بها)</option>
                  <option value={4}>4 ساعات (مكثفة)</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-theme">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-theme-muted hover:text-theme-text cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGenerate}
                className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري صياغة مقترح شاطر...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>توليد المقترح الذكي ✨</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* State B: Phase 12 Structured Proposal (WHY, WHAT CHANGES, IMPACT, ACCEPT/EDIT/REJECT) */
          <div className="space-y-4">
            {/* 1. WHY? (لماذا) */}
            <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-theme-text">
              <div className="flex items-center gap-2 font-black text-xs mb-1.5 text-blue-600">
                <HelpCircle className="w-4 h-4" />
                <span>لماذا هذا المقترح؟ (التعليل التربوي)</span>
              </div>
              <p className="text-xs leading-relaxed text-theme-secondary font-medium">
                {proposal.whyAr}
              </p>
            </div>

            {/* 2. IMPACT? (الأثر المتوقع) */}
            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-theme-text">
              <div className="flex items-center gap-2 font-black text-xs mb-1.5 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
                <span>الأثر المتوقع على التحضير</span>
              </div>
              <p className="text-xs leading-relaxed text-theme-secondary font-medium">
                {proposal.impactAr}
              </p>
            </div>

            {/* 3. WHAT CHANGES? (المهام المقترحة) */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs font-bold text-theme-text">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
                  <span>المهام والأنشطة المقترحة ({proposal.proposedEvents?.length || 0} مهمة)</span>
                </div>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface border border-theme text-theme-secondary font-mono">
                  {proposal.daysCount} أيام
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {proposal.proposedEvents?.map((item, idx) => {
                  const subMeta = ALL_SUBJECTS[item.subject_id as SubjectId];
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-theme bg-surface text-xs flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-card border border-theme text-theme-secondary shrink-0">
                          {item.date?.slice(5)} | {item.start_time || "18:00"}
                        </span>
                        <div className="truncate">
                          <span className="font-bold text-theme-text block truncate">
                            {item.title}
                          </span>
                          {item.notes && (
                            <span className="text-[10px] text-theme-muted block truncate">
                              {item.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-theme-muted font-bold">
                        {subMeta && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-sans hidden sm:inline-block">
                            {subMeta.name_ar}
                          </span>
                        )}
                        <span>{item.duration_minutes || 45} د</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Decision Buttons: قبول / تعديل / رفض */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-theme">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Reject (رفض) */}
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-red-500/20 bg-red-500/5 text-red-600 hover:bg-red-500/10 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>رفض الخطة</span>
                </button>

                {/* Edit (تعديل) */}
                <button
                  type="button"
                  onClick={() => setProposal(null)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold border border-theme bg-surface text-theme-secondary hover:text-theme-text transition-all cursor-pointer"
                >
                  تعديل المدخلات ✏️
                </button>
              </div>

              {/* Accept (قبول) */}
              <button
                type="button"
                disabled={isCommitting}
                onClick={handleAccept}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isCommitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري التثبيت في الجدول...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>قبول واعتماد الخطة في الجدول ✨</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

