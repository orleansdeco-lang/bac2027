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
  ChevronDown,
  ChevronUp,
  Scale,
  Sparkles,
  Info,
  ShieldCheck,
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
    calculatedWeightedAverage,
    studentAverageUsed,
    priority,
    reasons,
    blockers,
    warnings,
    historicalCutoffs,
    historicalComparison,
    additionalRequirements,
    source,
  } = evaluation;

  // Strict Legal Status Styling & Badges
  const statusConfig = {
    ELIGIBLE: {
      label: 'مستوفٍ للشروط القانونية للترشح',
      sublabel: 'يحق لك الترشح قانوناً في بطاقة الرغبات',
      badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      icon: CheckCircle2,
      borderClass: 'border-emerald-500/30 hover:border-emerald-500/50',
    },
    CONDITIONAL: {
      label: 'مؤهل بشرط المقابلة / الفحص الطبي',
      sublabel: 'مستوفٍ للشروط الأكاديمية مع إلزامية اجتياز المقابلة أو الفحص',
      badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      icon: AlertTriangle,
      borderClass: 'border-amber-500/30 hover:border-amber-500/50',
    },
    UNKNOWN: {
      label: 'يتطلب إدخال علامات المواد الأساسية',
      sublabel: 'يرجى إدخال النقاط لحساب المعدل الموزون والتحقق من الشروط',
      badgeClass: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      icon: HelpCircle,
      borderClass: 'border-cyan-500/30 hover:border-cyan-500/50',
    },
    INSUFFICIENT_DATA: {
      label: 'بيانات غير مكتملة',
      sublabel: 'القاعدة الوزارية قيد التوثيق الرسمي',
      badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
      icon: HelpCircle,
      borderClass: 'border-slate-500/30 hover:border-slate-500/50',
    },
    NOT_ELIGIBLE: {
      label: 'غير مستوفٍ للشروط الوزارية للترشح',
      sublabel: 'لا يمكن إدراجه في بطاقة الرغبات',
      badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      icon: XCircle,
      borderClass: 'border-rose-500/20 opacity-80 hover:opacity-100',
    },
  }[eligibilityStatus] || {
    label: 'قيد التقييم',
    sublabel: '',
    badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    icon: HelpCircle,
    borderClass: 'border-slate-700',
  };

  // Historical Comparison Badge (Strictly informational)
  const comparisonConfig = {
    ABOVE_HISTORICAL_CUTOFF: {
      label: 'معدلك أعلى من آخر معدل قبول سابق',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
    NEAR_HISTORICAL_CUTOFF: {
      label: 'معدلك قريب من آخر معدل قبول سابق',
      badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },
    BELOW_HISTORICAL_CUTOFF: {
      label: 'معدلك أقل من آخر معدل قبول سابق',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },
    NO_HISTORICAL_DATA: {
      label: 'لا تتوفر إحصائيات سابقة لهذه الشعبة',
      badgeClass: 'bg-slate-800 text-slate-400 border-slate-700',
    },
  }[historicalComparison || 'NO_HISTORICAL_DATA'];

  const StatusIcon = statusConfig.icon;

  const scopeConfig = {
    national: { label: 'تسجيل وطني', class: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
    regional: { label: 'تسجيل جهوي', class: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
    local: { label: 'تسجيل محلي', class: 'bg-slate-700/60 text-slate-300 border-slate-600/40' },
    wilaya_group: { label: 'دوائر ولائية', class: 'bg-slate-700/60 text-slate-300 border-slate-600/40' },
    commune_group: { label: 'دوائر بلديات', class: 'bg-slate-700/60 text-slate-300 border-slate-600/40' },
  }[institutionOffer.registrationScope] || { label: 'تسجيل عام', class: 'bg-slate-800 text-slate-400' };

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

      {/* Historical Comparison Indicator Banner */}
      {comparisonConfig && (
        <div className="mb-4">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-semibold ${comparisonConfig.badgeClass}`}>
            <Info className="w-3.5 h-3.5" />
            <span>{comparisonConfig.label}</span>
          </div>
        </div>
      )}

      {/* Numerical Stats & Weighted Average Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4">
        {/* Student Score / Weighted */}
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-400">
            {rule?.rankingBasis === 'weighted_average' ? 'المعدل الموزون المحسوب' : 'معدل الترتيب (المعدل العام)'}
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-black text-emerald-400">
              {studentAverageUsed.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">/ 20</span>
          </div>
        </div>

        {/* Required Min Average */}
        <div className="flex flex-col">
          <span className="text-[11px] text-slate-400">الحد الأدنى للترشح قانوناً</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-xl font-bold text-white">
              {rule?.minimumGeneralAverage !== null
                ? `${rule?.minimumGeneralAverage?.toFixed(2)}`
                : '10.00'}
            </span>
            <span className="text-xs text-slate-500">/ 20</span>
          </div>
        </div>

        {/* Historical Cutoff Reference */}
        <div className="flex flex-col sm:col-span-2 lg:col-span-1">
          <span className="text-[11px] text-slate-400">معدل قبول آخر دورة (استرشادي)</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            {historicalCutoffs.length > 0 ? (
              <>
                <span className="text-xl font-bold text-amber-400">
                  {historicalCutoffs[0].weightedCutoff
                    ? `${historicalCutoffs[0].weightedCutoff.toFixed(2)}`
                    : historicalCutoffs[0].generalCutoff
                    ? `${historicalCutoffs[0].generalCutoff.toFixed(2)}`
                    : '—'}
                </span>
                <span className="text-xs text-slate-500">({historicalCutoffs[0].year})</span>
              </>
            ) : (
              <span className="text-sm font-medium text-slate-500">غير متوفر</span>
            )}
          </div>
        </div>
      </div>

      {/* Weighted Formula Description Banner */}
      {rule?.weightedFormula && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-semibold text-emerald-300">
              صيغة حساب المعدل الموزون المعتمدة رسمياً في المنشور الوزاري:
            </div>
            <div className="text-slate-300 font-mono mt-0.5" dir="ltr">
              {rule.weightedFormula.expressionFr}
            </div>
            <div className="text-slate-400 mt-0.5">
              {rule.weightedFormula.expressionAr}
            </div>
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
                سجل معدلات القبول السابقة لهذه الشعبة (مؤشرات استرشادية فقط):
              </span>
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] text-slate-500">
                      <th className="py-1">السنة الجامعية</th>
                      <th className="py-1">الشعبة</th>
                      <th className="py-1">المعدل العام الأدنى</th>
                      <th className="py-1">المعدل الموزون</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {historicalCutoffs.map((c, idx) => (
                      <tr key={idx} className="text-slate-300">
                        <td className="py-1 font-mono">{c.year}</td>
                        <td className="py-1 text-slate-400">{c.stream || 'عام'}</td>
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
              <p className="text-[11px] text-slate-500 mt-1.5">
                * تنبيه: معدل القبول يتغير سنوياً حسب عدد المقاعد المتاحة ونتائج البكالوريا ورغبات المترشحين، ولا يشكل ضماناً للقبول.
              </p>
            </div>
          )}

          {/* Provenance Source Citation */}
          {source && (
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>المصدر المعتمد: {source.title}</span>
              </div>
              <span className="text-slate-500">دورة {source.academicYear}</span>
            </div>
          )}
        </div>
      )}

      {/* Card Footer Toggle Buttons */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800 text-xs">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
        >
          <span>{expanded ? 'إخفاء التفاصيل' : 'عرض الشروط والتفاصيل الكاملة'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <button
          onClick={() => onViewDetails(program)}
          className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
        >
          بطاقة التخصص الرسمية &larr;
        </button>
      </div>
    </div>
  );
};
