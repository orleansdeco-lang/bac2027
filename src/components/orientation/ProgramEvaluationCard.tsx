'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Building2,
  GraduationCap,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Scale,
  Info,
} from 'lucide-react';
import { ProgramEvaluationResult, Program } from '@/types/orientation';

interface ProgramEvaluationCardProps {
  evaluation: ProgramEvaluationResult;
  onViewDetails: (program: Program) => void;
  onToggleCompare: (program: Program) => void;
  isCompared: boolean;
}

export const ProgramEvaluationCard: React.FC<ProgramEvaluationCardProps> = ({
  evaluation,
  onViewDetails,
  onToggleCompare,
  isCompared,
}) => {
  const [expanded, setExpanded] = useState(false);
  const {
    program,
    institutionOffer,
    rule,
    eligibilityStatus,
    calculatedWeightedAverage,
    studentAverageUsed,
    priority,
    reasons,
    blockers,
    warnings,
    historicalCutoffs,
    additionalRequirements,
  } = evaluation;

  // Status Styling & Badges
  const statusConfig = {
    COMPETITIVE: {
      label: 'فرصة تنافسية قوية',
      sublabel: 'مستوفٍ للشروط ومعدلك منافس تاريخياً',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
      borderClass: 'border-emerald-500/30 hover:border-emerald-500/50',
    },
    ELIGIBLE: {
      label: 'مستوفٍ للشروط القانونية',
      sublabel: 'يحق لك الترشح في بطاقة الرغبات',
      badgeClass: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
      icon: CheckCircle2,
      borderClass: 'border-teal-500/30 hover:border-teal-500/50',
    },
    STRETCH: {
      label: 'مؤهل قانوناً (تنافسي)',
      sublabel: 'مستوفٍ للشروط / معدل القبول الأخير أعلى',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
      borderClass: 'border-amber-500/30 hover:border-amber-500/50',
    },
    UNKNOWN: {
      label: 'بحاجة لعلامات المواد',
      sublabel: 'يرجى إدخال النقاط لحساب المعدل الموزون',
      badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      icon: HelpCircle,
      borderClass: 'border-cyan-500/30 hover:border-cyan-500/50',
    },
    NOT_ELIGIBLE: {
      label: 'غير مستوفٍ للشروط',
      sublabel: 'لا يمكن إدراجه في بطاقة الرغبات',
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      icon: XCircle,
      borderClass: 'border-rose-500/20 opacity-80 hover:opacity-100',
    },
  }[eligibilityStatus];

  const StatusIcon = statusConfig.icon;

  const scopeConfig = {
    national: { label: 'تسجيل وطني', class: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
    regional: { label: 'تسجيل جهوي', class: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    local: { label: 'تسجيل محلي', class: 'bg-slate-700/60 text-slate-300 border-slate-600/40' },
    wilaya_group: { label: 'دوائر ولائية', class: 'bg-slate-700/60 text-slate-300 border-slate-600/40' },
    commune_group: { label: 'دوائر بلديات', class: 'bg-slate-700/60 text-slate-300 border-slate-600/40' },
  }[institutionOffer.registrationScope];

  return (
    <div
      className={`rounded-2xl bg-slate-900/90 border p-5 md:p-6 transition-all duration-200 shadow-lg ${statusConfig.borderClass}`}
    >
      {/* Top Meta Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Eligibility Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${statusConfig.badgeClass}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusConfig.label}</span>
          </div>

          {/* Registration Scope Badge */}
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs font-medium ${scopeConfig.class}`}
          >
            <span>{scopeConfig.label}</span>
          </div>

          {/* Priority Badge */}
          {priority && (
            <div
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-xs font-bold ${
                priority === 1
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <span>{priority === 1 ? 'الأولوية 1 الأولى' : `الأولوية ${priority}`}</span>
            </div>
          )}

          {/* Code */}
          <span className="text-xs text-slate-500 font-mono">#{program.programCode}</span>
        </div>

        {/* Action button to compare */}
        <button
          onClick={() => onToggleCompare(program)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
            isCompared
              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>{isCompared ? 'تمت الإضافة للمقارنة' : 'أضف للمقارنة'}</span>
        </button>
      </div>

      {/* Program & Institution Title */}
      <div className="mb-4">
        <h3 className="text-lg md:text-xl font-bold text-white leading-snug">
          {program.nameAr}
        </h3>
        {program.specialtyAr && (
          <p className="text-sm text-emerald-400/90 font-medium mt-0.5">
            {program.specialtyAr}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-300">{institutionOffer.institution.nameAr}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
            <span>{program.degreeType}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>مدة الدراسة: {program.durationYears} سنوات</span>
          </div>
        </div>
      </div>

      {/* Numerical Stats & Weighted Average Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4">
        {/* Student Score / Weighted */}
        <div>
          <span className="text-[11px] text-slate-400 block mb-0.5">المعدل المعتمد في الترتيب:</span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-white">
              {studentAverageUsed.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">/ 20</span>
            {calculatedWeightedAverage !== null && rule?.weightedFormula && (
              <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-medium">
                موزون
              </span>
            )}
          </div>
        </div>

        {/* Minimum Required */}
        <div>
          <span className="text-[11px] text-slate-400 block mb-0.5">الحد الأدنى للترشح (المنشور):</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-slate-300">
              {rule?.minimumGeneralAverage
                ? `${rule.minimumGeneralAverage.toFixed(2)} / 20`
                : '10.00 / 20'}
            </span>
            {rule?.rankingBasis === 'weighted_average' && (
              <span className="text-[10px] text-slate-500">(أساس الترتيب موزون)</span>
            )}
          </div>
        </div>

        {/* Historical Cutoff (Last Year) */}
        <div>
          <span className="text-[11px] text-slate-400 block mb-0.5">معدل القبول الأخير (2025/2024):</span>
          {historicalCutoffs.length > 0 && (historicalCutoffs[0].weightedCutoff || historicalCutoffs[0].generalCutoff) ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-amber-300">
                {(historicalCutoffs[0].weightedCutoff || historicalCutoffs[0].generalCutoff)?.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500">/ 20</span>
              <span className="text-[10px] text-slate-500 font-sans">
                ({historicalCutoffs[0].year.slice(0, 4)})
              </span>
            </div>
          ) : (
            <span className="text-xs text-slate-500 italic">غير متوفر / يتحدد حسب الطلب</span>
          )}
        </div>
      </div>

      {/* Weighted Formula Box if exists */}
      {rule?.weightedFormula && (
        <div className="text-xs bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/60 mb-3 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-slate-400 font-medium">صيغة المعدل الموزون الرسمية: </span>
            <span className="text-emerald-300 font-mono font-semibold" dir="ltr">
              {rule.weightedFormula.expressionAr}
            </span>
            {calculatedWeightedAverage !== null && (
              <div className="text-slate-300 mt-1">
                النتيجة المحسوبة لنقاطك: <strong className="text-white">{calculatedWeightedAverage.toFixed(2)}</strong>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Blockers / Warnings Preview */}
      {blockers.length > 0 && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 mb-3">
          <div className="flex items-start gap-2 text-rose-300 text-xs">
            <XCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <strong className="block mb-1">عوائق الترشح القانونية:</strong>
              <ul className="list-disc list-inside space-y-0.5">
                {blockers.map((b, idx) => (
                  <li key={idx}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Reasons & Additional Requirements */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 text-xs">
          {reasons.length > 0 && (
            <div>
              <span className="font-semibold text-slate-300 block mb-1">العوامل الإيجابية والأهلية:</span>
              <ul className="space-y-1 text-slate-400">
                {reasons.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {warnings.length > 0 && (
            <div>
              <span className="font-semibold text-amber-300 block mb-1">تنبيهات وتوجيهات:</span>
              <ul className="space-y-1 text-amber-200/80">
                {warnings.map((w, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {additionalRequirements.length > 0 && (
            <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
              <span className="font-semibold block mb-1">شروط إضافية واجبة:</span>
              <ul className="list-disc list-inside space-y-0.5">
                {additionalRequirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Historical Cutoffs table */}
          {historicalCutoffs.length > 0 && (
            <div className="pt-2">
              <span className="font-semibold text-slate-300 block mb-1.5">
                سجل معدلات القبول السابقة (بيانات استرشادية فقط):
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] text-slate-500">
                      <th className="py-1">السنة الجامعية</th>
                      <th className="py-1">المعدل العام الأدنى</th>
                      <th className="py-1">المعدل الموزون</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {historicalCutoffs.map((c, idx) => (
                      <tr key={idx} className="text-slate-300">
                        <td className="py-1 font-mono">{c.year}</td>
                        <td className="py-1 font-bold text-white">
                          {c.generalCutoff ? `${c.generalCutoff.toFixed(2)}` : '—'}
                        </td>
                        <td className="py-1 font-bold text-emerald-400">
                          {c.weightedCutoff ? `${c.weightedCutoff.toFixed(2)}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card Actions Footer */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/70 text-xs">
        <button
          onClick={() => onViewDetails(program)}
          className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          <span>بطاقة التخصص الرسمية</span>
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-slate-400 hover:text-slate-200 flex items-center gap-1 font-medium transition-colors"
        >
          <span>{expanded ? 'إخفاء التفاصيل' : 'عرض الشروط والتفاصيل'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
