"use client";

import React, { useState } from "react";
import {
  FileText,
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronDown,
  ChevronUp,
  Target,
  Bookmark,
  ShieldCheck,
} from "lucide-react";
import { StructuredSolution } from "@/lib/practice/practice-engine";
import { MathRenderer } from "@/components/ui/MathRenderer";

interface ExerciseSolutionViewProps {
  solution: StructuredSolution;
  className?: string;
  isInitiallyExpanded?: boolean;
}

export function ExerciseSolutionView({
  solution,
  className = "",
  isInitiallyExpanded = true,
}: ExerciseSolutionViewProps) {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

  return (
    <div
      className={`rounded-3xl border border-blue-500/30 bg-[#0B1528]/95 backdrop-blur-xl p-5 sm:p-6 space-y-5 shadow-2xl transition-all ${className}`}
      dir="rtl"
    >
      {/* Solution Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            <Award className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>الحل النموذجي البيداغوجي (معايير البكالوريا)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                منهجية 4 خطوات
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              مفصل بدقة وفق سلم التنقيط الرسمي لوزارة التربية الوطنية
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
          title={isExpanded ? "طي الحل" : "عرض الحل كاملاً"}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Section 1: المعطيات */}
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
              <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center text-[11px] font-bold">
                1
              </span>
              <span>المعطيات وحصر المسألة (Données)</span>
            </div>
            <ul className="pr-7 space-y-1 text-xs text-slate-300 list-disc marker:text-blue-400 leading-relaxed">
              {solution.givenInfo_ar.map((info, idx) => (
                <li key={idx}>
                  <MathRenderer content={info} />
                </li>
              ))}
            </ul>
          </div>

          {/* Section 2: الفكرة الرياضية / العلمية */}
          <div className="rounded-2xl bg-amber-500/[0.05] border border-amber-500/20 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px] font-bold">
                2
              </span>
              <span>الفكرة الأساسية والمبرهنة المعتمدة (Idée Clé)</span>
            </div>
            <div className="pr-7 text-xs text-slate-200 leading-relaxed">
              <MathRenderer content={solution.coreIdea_ar} />
            </div>
          </div>

          {/* Section 3: خطوات الحل خطوة بخطوة مع «واش درنا؟» و «علاش درناه؟» */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-4 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-bold">
                3
              </span>
              <span>خطوات الحل المنهجي (Démarche détaillée)</span>
            </div>

            <div className="space-y-3 pr-2 sm:pr-4">
              {solution.steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="rounded-xl border border-white/10 bg-[#0F172A]/90 p-3.5 space-y-2 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] font-bold">
                        {step.stepNumber}
                      </span>
                      <span>{step.title_ar}</span>
                    </span>
                  </div>

                  {/* Dual Grid: واش درنا؟ وعلاش درناه؟ */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                    {/* What we did */}
                    <div className="p-2.5 rounded-lg bg-blue-500/[0.06] border border-blue-500/15 space-y-1">
                      <span className="text-[10px] font-bold text-blue-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>واش درنا؟ (العملية المنجزة)</span>
                      </span>
                      <div className="text-xs text-slate-200 leading-relaxed">
                        <MathRenderer content={step.whatWeDid_ar} />
                      </div>
                    </div>

                    {/* Why we did it */}
                    <div className="p-2.5 rounded-lg bg-emerald-500/[0.06] border border-emerald-500/15 space-y-1">
                      <span className="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>علاش درناه؟ (المعيار الوزاري)</span>
                      </span>
                      <div className="text-xs text-slate-200 leading-relaxed">
                        <MathRenderer content={step.whyWeDidIt_ar} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: النتيجة النهائية والتحقق */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 to-teal-950/40 border border-emerald-500/30 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-bold">
                4
              </span>
              <span>النتيجة النهائية والتحقق (Conclusion & Vérification)</span>
            </div>
            <div className="pr-7 text-xs sm:text-sm font-bold text-white leading-relaxed">
              <MathRenderer content={solution.finalConclusion_ar} />
            </div>
          </div>

          {/* BAC Examiner Tip */}
          {solution.bacTip_ar && (
            <div className="rounded-xl bg-purple-500/[0.08] border border-purple-500/30 p-3 flex items-start gap-2.5 text-xs text-purple-200">
              <Lightbulb className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-purple-300 block mb-0.5">
                  نصيحة خاصة بورقة امتحان البكالوريا 📝:
                </span>
                <p className="leading-relaxed text-slate-300">{solution.bacTip_ar}</p>
              </div>
            </div>
          )}

          {/* Common Pitfalls to Avoid */}
          {solution.commonPitfalls_ar && solution.commonPitfalls_ar.length > 0 && (
            <div className="rounded-xl bg-rose-500/[0.06] border border-rose-500/25 p-3 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>أخطاء شائعة يتكرر الوقوع فيها في البكالوريا:</span>
              </div>
              <ul className="pr-5 list-disc marker:text-rose-400 text-slate-300 space-y-1">
                {solution.commonPitfalls_ar.map((pitfall, idx) => (
                  <li key={idx}>{pitfall}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
