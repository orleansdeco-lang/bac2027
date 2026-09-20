"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/theme/context";
import { AiPlannerResponse, PlannerEvent } from "@/lib/planner/types";
import { generateAiStudyPlan } from "@/lib/planner/ai-planner-service";
import {
  X,
  Sparkles,
  Bot,
  Check,
  RefreshCw,
  Clock,
  Calendar,
  BookOpen,
  ArrowRight,
  Flame,
  CheckCircle2,
  Sliders
} from "lucide-react";

interface AiPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptPlan: (events: Omit<PlannerEvent, "id" | "created_at" | "updated_at">[]) => void;
  streamId?: string;
  startDateIso?: string;
}

export const AiPlannerModal: React.FC<AiPlannerModalProps> = ({
  isOpen,
  onClose,
  onAcceptPlan,
  streamId = "sciences",
  startDateIso = new Date().toISOString().split("T")[0],
}) => {
  const { theme } = useTheme();
  const isGirls = theme === "girls";

  const [prompt, setPrompt] = useState("");
  const [daysCount, setDaysCount] = useState<number>(7);
  const [dailyHours, setDailyHours] = useState<number>(3);
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AiPlannerResponse | null>(null);

  if (!isOpen) return null;

  const quickPrompts = [
    {
      label: "أسبوع متوازن للبكالوريا",
      text: "نظم لي أسبوعاً دراسياً متوازناً مع التركيز على المواد الأساسية ذات المعامل العالي.",
    },
    {
      label: "تحضير فرض رياضيات",
      text: "عندي فرض رياضيات قريب، ركز لي على التمارين والمسائل الشاملة في الدوال والمتتاليات.",
    },
    {
      label: "تدارك نقص في الفيزياء والعلوم",
      text: "أشعر بنقص في الفيزياء ومادة العلوم الطبيعية، برمج لي حصص مراجعة مكثفة لهما.",
    },
  ];

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const response = await generateAiStudyPlan({
        studentStreamId: streamId,
        startDateIso,
        daysCount,
        dailyHoursAvailable: dailyHours,
        userPrompt: prompt.trim() || undefined,
      });
      setAiResult(response);
    } catch (err) {
      console.error("AI Planner error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (!aiResult) return;
    onAcceptPlan(aiResult.proposedEvents);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-2xl rounded-3xl border shadow-2xl p-6 sm:p-7 relative transition-all max-h-[90vh] overflow-y-auto ${
          isGirls
            ? "bg-white border-pink-200 text-[#4A2040]"
            : "bg-[#101C38] border-[#1E3160] text-slate-100"
        }`}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full opacity-60 hover:opacity-100 transition-all hover:bg-slate-500/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 mb-6">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md ${
              isGirls
                ? "bg-gradient-to-br from-pink-400 to-rose-400 text-white"
                : "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-500/20"
            }`}
          >
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-heading">
                SHATER AI Planner
              </h2>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  isGirls
                    ? "bg-pink-100 text-pink-700"
                    : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                }`}
              >
                المساعد الذكي لبناء الخطة
              </span>
            </div>
            <p
              className={`text-xs mt-1 ${
                isGirls ? "text-pink-600/70" : "text-slate-400"
              }`}
            >
              الذكاء الاصطناعي يقترح وأنت تقرر — لن يتم تعديل جدولك إلا بعد موافقتك.
            </p>
          </div>
        </div>

        {/* If no proposal generated yet: show inputs */}
        {!aiResult ? (
          <div className="space-y-5">
            {/* Natural language prompt */}
            <div>
              <label className="block text-xs font-bold mb-1.5 opacity-90">
                واش تحب تركز عليه في هذا البرنامج؟ (اختياري)
              </label>
              <textarea
                rows={3}
                placeholder="مثال: خصص ساعتين يومياً بعد الخامسة مساءً، وعندي امتحان علوم الأسبوع القادم..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className={`w-full text-xs rounded-2xl p-3 border outline-none transition-all ${
                  isGirls
                    ? "bg-pink-50/40 border-pink-200 focus:ring-2 focus:ring-pink-300 text-pink-950"
                    : "bg-[#152347] border-[#223668] focus:ring-2 focus:ring-cyan-500 text-slate-100"
                }`}
              />
            </div>

            {/* Quick Chips */}
            <div>
              <span className="block text-[11px] font-semibold opacity-70 mb-2">
                مقترحات جاهزة سريعة:
              </span>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(qp.text)}
                    className={`text-xs px-3 py-1.5 rounded-xl border transition-all text-right ${
                      isGirls
                        ? "border-pink-200 bg-pink-50/30 text-pink-900 hover:bg-pink-100/60"
                        : "border-slate-700 bg-slate-800/40 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {qp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences / Options */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-bold mb-1.5 opacity-90">
                  عدد أيام الخطة
                </label>
                <select
                  value={daysCount}
                  onChange={(e) => setDaysCount(parseInt(e.target.value, 10))}
                  className={`w-full text-xs rounded-xl p-2.5 border outline-none ${
                    isGirls
                      ? "bg-pink-50/40 border-pink-200 text-pink-950"
                      : "bg-[#152347] border-[#223668] text-slate-100"
                  }`}
                >
                  <option value={3}>3 أيام القادمة (خطة قصيرة)</option>
                  <option value={5}>5 أيام دراسية</option>
                  <option value={7}>أسبوع كامل (7 أيام)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5 opacity-90">
                  ساعات الدراسة اليومية
                </label>
                <select
                  value={dailyHours}
                  onChange={(e) => setDailyHours(parseInt(e.target.value, 10))}
                  className={`w-full text-xs rounded-xl p-2.5 border outline-none ${
                    isGirls
                      ? "bg-pink-50/40 border-pink-200 text-pink-950"
                      : "bg-[#152347] border-[#223668] text-slate-100"
                  }`}
                >
                  <option value={2}>ساعتان (خفيفة ومركزة)</option>
                  <option value={3}>3 ساعات (موصى بها)</option>
                  <option value={4}>4 ساعات (مكثفة)</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-theme">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs opacity-70 hover:opacity-100"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGenerate}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                  isGirls
                    ? "bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:from-pink-500 hover:to-rose-500 disabled:opacity-50"
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 shadow-cyan-500/20 disabled:opacity-50"
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري التفكير وصياغة الخطة...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>توليد الخطة الذكية ✨</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Proposed Plan Review */
          <div className="space-y-4">
            {/* Rationale Card */}
            <div
              className={`p-4 rounded-2xl border ${
                isGirls
                  ? "bg-pink-50/70 border-pink-200 text-pink-950"
                  : "bg-[#142347] border-[#243a70] text-slate-200"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs mb-1.5">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span>رؤية المساعد الذكي:</span>
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {aiResult.rationale}
              </p>
            </div>

            {/* Generated Items List */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs font-bold">
                <span>المهام المقترحة ({aiResult.proposedEvents.length} مهمة)</span>
                <span className="opacity-70 font-mono">
                  {daysCount} أيام
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {aiResult.proposedEvents.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                      isGirls
                        ? "bg-white border-pink-100"
                        : "bg-[#16274e] border-[#233b74]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                          isGirls
                            ? "bg-pink-100 text-pink-800"
                            : "bg-cyan-950 text-cyan-300 border border-cyan-800/40"
                        }`}
                      >
                        {item.date.slice(5)} {item.start_time}
                      </span>
                      <span className="font-semibold truncate">
                        {item.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 font-mono text-[11px] opacity-75">
                      <span>{item.duration_minutes}m</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Actions: [Accepter], [Modifier], [Régénérer] */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-theme">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setAiResult(null)}
                  className="px-3 py-2 rounded-xl text-xs font-medium border border-theme opacity-80 hover:opacity-100"
                >
                  تعديل المدخلات ✏️
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-3 py-2 rounded-xl text-xs font-medium border border-theme opacity-80 hover:opacity-100 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>إعادة التوليد 🔄</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleAccept}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                  isGirls
                    ? "bg-[#E879A8] text-white hover:bg-[#D46092]"
                    : "bg-[#0EA5E9] text-white hover:bg-cyan-600 shadow-cyan-500/20"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>اعتماد الخطة وتثبيتها في الجدول ✨</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
