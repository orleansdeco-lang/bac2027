'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Building2,
  GraduationCap,
  MapPin,
  Scale,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock
} from 'lucide-react';
import { ProgramEvaluationResult, Program } from '@/types/orientation';

interface ProgramEvaluationCardProps {
  evaluation: ProgramEvaluationResult;
  onToggleCompare: (program: Program) => void;
  isCompared: boolean;
  onViewDetails: (program: Program) => void;
}

export const ProgramEvaluationCard: React.FC<ProgramEvaluationCardProps> = ({
  evaluation,
  onToggleCompare,
  isCompared,
  onViewDetails,
}) => {
  const [expanded, setExpanded] = useState(false);

  const {
    program,
    institutionOffer,
    rule,
    eligibilityStatus,
    admissionScore,
    historicalCutoff,
    historicalComparison,
    additionalRequirements,
    source,
  } = evaluation;

  // Primary Legal & Competitive Badges
  const isEligible = eligibilityStatus === 'ELIGIBLE' || eligibilityStatus === 'CONDITIONAL';
  const isConditional = eligibilityStatus === 'CONDITIONAL';
  const isCompetitive = rule?.rankingBasis === 'weighted_average' || (rule?.priority || 0) > 1;
  const isNotEligible = eligibilityStatus === 'NOT_ELIGIBLE';

  const scoreUsed = admissionScore?.scoreUsed ?? evaluation.studentAverageUsed;
  const isWeighted = admissionScore?.scoreType === 'WEIGHTED_AVERAGE';
  const formulaStr = admissionScore?.formulaExpression;

  const cutoffVal = historicalCutoff?.cutoffValue ?? (evaluation.historicalCutoffs?.[0]?.weightedCutoff || evaluation.historicalCutoffs?.[0]?.generalCutoff || null);
  const cutoffYear = historicalCutoff?.academicYear || evaluation.historicalCutoffs?.[0]?.year || 'سوابق';

  return (
    <article
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        isNotEligible
          ? 'border-stone-200/60 opacity-80 hover:opacity-100 hover:border-stone-300'
          : isConditional
          ? 'border-amber-200/80 shadow-xs hover:shadow-md hover:border-amber-300'
          : 'border-stone-200/90 shadow-xs hover:shadow-md hover:border-teal-300'
      }`}
      dir="rtl"
    >
      <div className="p-5 sm:p-6">
        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Eligibility Badge */}
            {isEligible && !isConditional && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>مؤهل للتسجيل</span>
              </span>
            )}

            {isConditional && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>يتطلب شروط إضافية</span>
              </span>
            )}

            {isNotEligible && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-stone-100 text-stone-600 border border-stone-200">
                <XCircle className="w-3.5 h-3.5 text-stone-500" />
                <span>غير متاح حسب الشعبة</span>
              </span>
            )}

            {/* Competitive Badge */}
            {isCompetitive && !isNotEligible && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200/60">
                <Scale className="w-3.5 h-3.5 text-teal-600" />
                <span>تنافسي</span>
              </span>
            )}
          </div>

          {/* Degree / Training Type Pill */}
          <span className="text-[11px] font-semibold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-md">
            {program.degreeType || program.trainingType}
          </span>
        </div>

        {/* Program Name & Specialty */}
        <h3 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight leading-snug mb-1">
          {program.nameAr}
        </h3>

        {program.nameFr && (
          <span className="text-xs text-stone-400 font-medium block mb-3 font-sans">
            {program.nameFr}
          </span>
        )}

        {/* Institution & Location */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-stone-600 mb-4 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-1.5 font-medium">
            <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate max-w-[240px]">{institutionOffer.institution.nameAr}</span>
          </div>

          <div className="flex items-center gap-1 text-stone-500">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>
              {institutionOffer.registrationScope === 'national' 
                ? 'تسجيل وطني (58 ولاية)' 
                : institutionOffer.registrationScope === 'regional'
                ? 'تسجيل جهوي'
                : 'تسجيل محلي'}
            </span>
          </div>
        </div>

        {/* Admission Score & Formula Box */}
        <div className="bg-stone-50/80 rounded-xl p-3 mb-4 border border-stone-200/50">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-stone-500 font-medium">معدلك المحسوب لهذا التخصص:</span>
            <span className="font-black text-stone-900 text-sm">
              {scoreUsed > 0 ? `${scoreUsed.toFixed(2)} / 20` : '—'}
            </span>
          </div>

          {isWeighted && formulaStr ? (
            <div className="text-[11px] text-teal-800 font-medium flex items-center justify-between pt-1 border-t border-stone-200/40">
              <span className="text-stone-400">طريقة الحساب:</span>
              <span className="font-mono font-semibold" dir="ltr">{formulaStr}</span>
            </div>
          ) : (
            <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1 border-t border-stone-200/40">
              <span className="text-stone-400">طريقة الحساب:</span>
              <span className="font-medium">المعدل العام للبكالوريا مباشرة</span>
            </div>
          )}
        </div>

        {/* Historical Cutoff Guidance Box */}
        <div className="rounded-xl p-3 mb-2 border border-stone-200/60 bg-white">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-stone-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>آخر عتبة تاريخية متوفرة:</span>
            </span>
            {cutoffVal ? (
              <span className="font-black text-stone-900 text-sm">
                {cutoffVal.toFixed(2)} ({cutoffYear})
              </span>
            ) : (
              <span className="text-[11px] text-stone-400 font-medium">
                غير متوفرة حالياً
              </span>
            )}
          </div>

          {cutoffVal ? (
            <p className="text-[11px] text-stone-500 leading-relaxed font-medium">
              ⚠️ <strong className="text-stone-700">عتبة تاريخية</strong> — مرجع استرشادي من دورات سابقة وليست ضماناً للقبول هذه السنة.
            </p>
          ) : (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-stone-500">
                لم تتوفر بعد معلومة حالية موثوقة.
              </span>
              <button
                type="button"
                onClick={() => onViewDetails(program)}
                className="text-[11px] font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
              >
                شوف التفاصيل المتاحة
              </button>
            </div>
          )}
        </div>

        {/* Expandable Reasons / Notes if conditional or not eligible */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-stone-100 text-xs space-y-2 animate-in fade-in duration-200">
            {evaluation.reasons && evaluation.reasons.length > 0 && (
              <div className="bg-stone-50 p-2.5 rounded-lg text-stone-700">
                <span className="font-bold block mb-1">شروط القبول:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-stone-600">
                  {evaluation.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.warnings && evaluation.warnings.length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200/50 p-2.5 rounded-lg text-amber-900">
                <span className="font-bold block mb-1">ملاحظات توجيهية:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                  {evaluation.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="bg-stone-50/70 border-t border-stone-100 px-5 py-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onToggleCompare(program)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            isCompared
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{isCompared ? 'تمت الإضافة للمقارنة' : 'قارن التخصص'}</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            title="إظهار تفاصيل إضافية"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => onViewDetails(program)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-stone-700 hover:text-stone-950 bg-white hover:bg-stone-100 border border-stone-200 transition-colors cursor-pointer"
          >
            تفاصيل أكثر
          </button>
        </div>
      </div>
    </article>
  );
};
