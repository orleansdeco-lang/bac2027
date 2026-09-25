'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  MapPin,
  Scale,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink
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
  } = evaluation;

  const isEligible = eligibilityStatus === 'ELIGIBLE';
  const isConditional = eligibilityStatus === 'CONDITIONAL';
  const isNotEligible = eligibilityStatus === 'NOT_ELIGIBLE';
  const isCompetitive = rule?.rankingBasis === 'weighted_average';

  const scoreUsed = admissionScore?.scoreUsed ?? evaluation.studentAverageUsed;
  const isWeighted = admissionScore?.scoreType === 'WEIGHTED_AVERAGE';
  const formulaStr = admissionScore?.formulaExpression;

  const cutoffVal = historicalCutoff?.cutoffValue ?? (evaluation.historicalCutoffs?.[0]?.weightedCutoff || evaluation.historicalCutoffs?.[0]?.generalCutoff || null);
  const cutoffYear = historicalCutoff?.academicYear || evaluation.historicalCutoffs?.[0]?.year || 'سوابق';

  return (
    <article
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between hover:shadow-md ${
        isNotEligible
          ? 'border-slate-200 opacity-75 hover:opacity-100'
          : isConditional
          ? 'border-amber-200/90 shadow-2xs hover:border-amber-300'
          : 'border-slate-200 shadow-2xs hover:border-teal-400'
      }`}
      dir="rtl"
    >
      <div className="p-4 sm:p-4.5">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-1.5 mb-2.5">
          <div className="flex items-center gap-1.5">
            {/* Status Chip */}
            {isEligible && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>مؤهل للتسجيل</span>
              </span>
            )}

            {isConditional && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/70">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                <span>شروط إضافية</span>
              </span>
            )}

            {isNotEligible && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                <XCircle className="w-3 h-3 text-slate-400" />
                <span>غير متاح لشعبتك</span>
              </span>
            )}

            {/* Ranking Basis Tag */}
            {isCompetitive && !isNotEligible && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200/60" title="يخضع للترتيب على أساس المعدل الموزون">
                <Scale className="w-2.5 h-2.5 text-teal-600" />
                <span>موزون</span>
              </span>
            )}
          </div>

          {/* Degree Type */}
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
            {program.degreeType || program.trainingType || 'ليسانس'}
          </span>
        </div>

        {/* Program Title */}
        <h3 className="text-base font-black text-slate-900 tracking-tight leading-snug mb-1 line-clamp-2">
          {program.nameAr}
        </h3>

        {/* Institution & Scope */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-1 font-medium truncate">
            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{institutionOffer.institution.nameAr}</span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="shrink-0 text-[11px]">
            {institutionOffer.registrationScope === 'national' ? 'وطني' : 'جهوي'}
          </span>
        </div>

        {/* Score & Cutoff Metrics Box */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 mb-2 text-xs">
          {/* User Score */}
          <div className="bg-white p-2 rounded-lg border border-slate-200/80 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">
              {isWeighted ? 'معدلك الموزون' : 'معدلك المحسوب'}
            </span>
            <span className="text-sm font-black text-slate-900 font-mono">
              {scoreUsed > 0 ? scoreUsed.toFixed(2) : '—'}
            </span>
            <span className="text-[9px] text-slate-400 block">من 20</span>
          </div>

          {/* Reference Cutoff */}
          <div className="bg-white p-2 rounded-lg border border-slate-200/80 text-center">
            <span className="text-[10px] text-slate-400 block font-medium">
              آخر عتبة مرجعية
            </span>
            <span className="text-sm font-black text-slate-800 font-mono">
              {cutoffVal ? cutoffVal.toFixed(2) : 'غير محددة'}
            </span>
            <span className="text-[9px] text-slate-400 block">
              {cutoffVal ? `دورة ${cutoffYear}` : 'تسجيل وطني'}
            </span>
          </div>
        </div>

        {/* Formula Hint if weighted */}
        {isWeighted && formulaStr && (
          <div className="text-[10px] text-teal-800 bg-teal-50/50 px-2 py-1 rounded-md mb-2 flex items-center justify-between font-mono" dir="ltr">
            <span className="font-sans font-bold text-teal-900">حساب الأولوية:</span>
            <span className="truncate ml-1">{formulaStr}</span>
          </div>
        )}

        {/* Expandable Reasons / Notes if conditional or not eligible */}
        {expanded && (
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs space-y-1.5 animate-in fade-in duration-150">
            {evaluation.reasons && evaluation.reasons.length > 0 && (
              <div className="bg-slate-50 p-2 rounded-lg text-slate-700 text-[11px]">
                <span className="font-bold block mb-0.5">شروط القبول:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  {evaluation.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.warnings && evaluation.warnings.length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200/50 p-2 rounded-lg text-amber-900 text-[11px]">
                <span className="font-bold block mb-0.5">ملاحظات توجيهية:</span>
                <ul className="list-disc list-inside space-y-0.5 text-amber-800">
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
      <div className="bg-slate-50/80 border-t border-slate-100 px-3.5 py-2.5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onToggleCompare(program)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            isCompared
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          <Scale className="w-3 h-3" />
          <span>{isCompared ? 'تمت المقارنة' : 'مقارنة'}</span>
        </button>

        <div className="flex items-center gap-1">
          {(evaluation.reasons?.length || evaluation.warnings?.length) ? (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="إظهار تفاصيل إضافية"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => onViewDetails(program)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            تفاصيل
          </button>
        </div>
      </div>
    </article>
  );
};
