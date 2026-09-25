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
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between hover:shadow-card ${
        isNotEligible
          ? 'border-[#E4DED2] opacity-80 hover:opacity-100'
          : isConditional
          ? 'border-[#E8CDA8] shadow-xs hover:border-[#D7A66A]'
          : 'border-[#E4DED2] shadow-xs hover:border-[#5F8F86]'
      }`}
      dir="rtl"
    >
      <div className="p-4">
        {/* Top Badges Row */}
        <div className="flex items-center justify-between gap-1.5 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Status Chip */}
            {isEligible && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#E8F2EB] text-[#245248] border border-[#AFC8BD]">
                <CheckCircle2 className="w-3 h-3 text-[#2C5E54]" />
                <span>مؤهل للتسجيل</span>
              </span>
            )}

            {isConditional && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FAF0E2] text-[#8C5D23] border border-[#E8CDA8]">
                <AlertTriangle className="w-3 h-3 text-[#D7A66A]" />
                <span>شروط إضافية</span>
              </span>
            )}

            {isNotEligible && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#F2EFE9] text-[#78716C] border border-[#E4DED2]">
                <XCircle className="w-3 h-3 text-[#78716C]" />
                <span>غير متاح لشعبتك</span>
              </span>
            )}

            {/* Ranking Basis Tag */}
            {isCompetitive && !isNotEligible && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F4F8F7] text-[#2C5E54] border border-[#DCE9E4]" title="يخضع للترتيب على أساس المعدل الموزون">
                <Scale className="w-2.5 h-2.5 text-[#5F8F86]" />
                <span>موزون</span>
              </span>
            )}
          </div>

          {/* Degree Type */}
          <span className="text-[10px] font-bold text-[#527D75] bg-[#FAF8F5] border border-[#E4DED2] px-2 py-0.5 rounded-md shrink-0">
            {program.degreeType || program.trainingType || 'ليسانس'}
          </span>
        </div>

        {/* Program Title */}
        <h3 className="text-base font-black text-[#1E3A34] tracking-tight leading-snug mb-1.5 line-clamp-2">
          {program.nameAr}
        </h3>

        {/* Institution & Scope */}
        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-3">
          <div className="flex items-center gap-1 font-medium truncate">
            <Building2 className="w-3.5 h-3.5 text-[#5F8F86] shrink-0" />
            <span className="truncate">{institutionOffer.institution.nameAr}</span>
          </div>
          <span className="text-[#CBD5E1]">•</span>
          <span className="shrink-0 text-[11px] text-[#78716C]">
            {institutionOffer.registrationScope === 'national' ? 'تسجيل وطني' : 'تسجيل جهوي'}
          </span>
        </div>

        {/* Score & Cutoff Comparison Box */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#EAE4D7] mb-2 text-xs">
          {/* User Score */}
          <div className="bg-white p-2 rounded-lg border border-[#E4DED2] text-center shadow-2xs">
            <span className="text-[10px] text-[#78716C] block font-medium">
              {isWeighted ? 'معدلك الموزون' : 'معدلك المحسوب'}
            </span>
            <span className="text-base font-black text-[#2C5E54] font-mono">
              {scoreUsed > 0 ? scoreUsed.toFixed(2) : '—'}
            </span>
            <span className="text-[9px] text-[#78716C] block">من 20</span>
          </div>

          {/* Reference Cutoff */}
          <div className="bg-white p-2 rounded-lg border border-[#E4DED2] text-center shadow-2xs">
            <span className="text-[10px] text-[#78716C] block font-medium">
              آخر عتبة مرجعية
            </span>
            <span className="text-base font-black text-[#1E3A34] font-mono">
              {cutoffVal ? cutoffVal.toFixed(2) : 'غير محددة'}
            </span>
            <span className="text-[9px] text-[#78716C] block">
              {cutoffVal ? `دورة ${cutoffYear}` : 'مرجع وطني'}
            </span>
          </div>
        </div>

        {/* Formula Hint if weighted */}
        {isWeighted && formulaStr && (
          <div className="text-[10px] text-[#2C5E54] bg-[#F4F8F7] border border-[#DCE9E4] px-2 py-1 rounded-md mb-2 flex items-center justify-between font-mono" dir="ltr">
            <span className="font-sans font-bold text-[#1E3A34]">حساب الأولوية:</span>
            <span className="truncate ml-1">{formulaStr}</span>
          </div>
        )}

        {/* Expandable Reasons / Notes if conditional or not eligible */}
        {expanded && (
          <div className="mt-2 pt-2 border-t border-[#E4DED2] text-xs space-y-1.5 animate-in fade-in duration-150">
            {evaluation.reasons && evaluation.reasons.length > 0 && (
              <div className="bg-[#FAF8F5] border border-[#E4DED2] p-2 rounded-lg text-[#334155] text-[11px]">
                <span className="font-bold block mb-0.5 text-[#1E3A34]">شروط القبول:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[#475569]">
                  {evaluation.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.warnings && evaluation.warnings.length > 0 && (
              <div className="bg-[#FAF0E2] border border-[#E8CDA8] p-2 rounded-lg text-[#8C5D23] text-[11px]">
                <span className="font-bold block mb-0.5">ملاحظات توجيهية:</span>
                <ul className="list-disc list-inside space-y-0.5">
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
      <div className="bg-[#FAF8F5] border-t border-[#E4DED2] px-3.5 py-2.5 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onToggleCompare(program)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
            isCompared
              ? 'bg-[#2C5E54] text-white shadow-2xs'
              : 'bg-white hover:bg-[#F7F3EA] text-[#2C5E54] border border-[#DCE9E4]'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{isCompared ? 'تمت المقارنة' : 'مقارنة'}</span>
        </button>

        <div className="flex items-center gap-1">
          {(evaluation.reasons?.length || evaluation.warnings?.length) ? (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1E3A34] hover:bg-[#EFE9DC] transition-colors"
              title="إظهار تفاصيل إضافية"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          ) : null}

          <button
            type="button"
            onClick={() => onViewDetails(program)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#334155] hover:text-[#1E3A34] bg-white hover:bg-[#F7F3EA] border border-[#E4DED2] transition-colors cursor-pointer"
          >
            تفاصيل
          </button>
        </div>
      </div>
    </article>
  );
};
