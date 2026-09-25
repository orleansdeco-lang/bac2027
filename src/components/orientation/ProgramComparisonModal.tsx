'use client';

import React from 'react';
import { X, Scale, Trash2, Check, AlertCircle } from 'lucide-react';
import { Program } from '@/types/orientation';

interface ProgramComparisonModalProps {
  programs: Program[];
  onRemove: (programId: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export const ProgramComparisonModal: React.FC<ProgramComparisonModalProps> = ({
  programs,
  onRemove,
  onClear,
  onClose,
}) => {
  if (programs.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl text-right"
        dir="rtl"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white">
                مقارنة التخصصات الجامعية جنباً إلى جنب
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                قارن بين الشروط الرسمية، الشهادات الممنوحة، مدة التكوين، ومعدلات القبول السابقة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClear}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>إفراغ المقارنة</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="overflow-x-auto">
          <div
            className="grid gap-4 min-w-[700px]"
            style={{
              gridTemplateColumns: `200px repeat(${programs.length}, minmax(240px, 1fr))`,
            }}
          >
            {/* Header Row: Names */}
            <div className="font-bold text-slate-400 text-sm flex items-center p-3 bg-slate-950/60 rounded-xl">
              التخصص الجامعي
            </div>
            {programs.map(p => (
              <div
                key={p.id}
                className="relative p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between"
              >
                <button
                  onClick={() => onRemove(p.id)}
                  className="absolute top-3 left-3 p-1 rounded-lg bg-slate-700/60 text-slate-400 hover:text-rose-400 transition-colors"
                  title="حذف من المقارنة"
                >
                  <X className="w-4 h-4" />
                </button>
                <div>
                  <span className="text-[11px] font-mono text-emerald-400 block mb-1">
                    #{p.programCode}
                  </span>
                  <h3 className="font-bold text-white text-base leading-snug">
                    {p.nameAr}
                  </h3>
                  {p.specialtyAr && (
                    <p className="text-xs text-slate-300 mt-1">{p.specialtyAr}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Row: Field & Training Type */}
            <div className="font-semibold text-slate-400 text-xs flex items-center p-3 bg-slate-950/40 rounded-xl">
              الميدان ونوع التكوين
            </div>
            {programs.map(p => (
              <div key={p.id} className="p-3 text-xs text-slate-300 bg-slate-800/40 rounded-xl">
                <span className="font-bold text-white block mb-0.5">{p.trainingType}</span>
                <span className="text-slate-400">ميدان {p.fieldId}</span>
              </div>
            ))}

            {/* Row: Degree Type */}
            <div className="font-semibold text-slate-400 text-xs flex items-center p-3 bg-slate-950/40 rounded-xl">
              الشهادة الممنوحة
            </div>
            {programs.map(p => (
              <div key={p.id} className="p-3 text-xs text-slate-200 bg-slate-800/40 rounded-xl font-medium">
                {p.degreeType}
              </div>
            ))}

            {/* Row: Duration */}
            <div className="font-semibold text-slate-400 text-xs flex items-center p-3 bg-slate-950/40 rounded-xl">
              مدة الدراسة
            </div>
            {programs.map(p => (
              <div key={p.id} className="p-3 text-xs font-bold text-emerald-400 bg-slate-800/40 rounded-xl">
                {p.durationYears} سنوات
              </div>
            ))}

            {/* Row: Priority by Stream */}
            <div className="font-semibold text-slate-400 text-xs flex items-center p-3 bg-slate-950/40 rounded-xl">
              الشعب ذات الأولوية 1
            </div>
            {programs.map(p => {
              const p1Streams = p.eligibilityRules?.filter(r => r.priority === 1);
              return (
                <div key={p.id} className="p-3 text-xs bg-slate-800/40 rounded-xl space-y-1">
                  {p1Streams && p1Streams.length > 0 ? (
                    p1Streams.map((r, i) => (
                      <span
                        key={i}
                        className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-semibold text-[11px] ml-1 mb-1"
                      >
                        {r.bacStreamId}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 text-[11px]">لا توجد أولوية أولى محددة</span>
                  )}
                </div>
              );
            })}

            {/* Row: Ranking Formula */}
            <div className="font-semibold text-slate-400 text-xs flex items-center p-3 bg-slate-950/40 rounded-xl">
              صيغة الترتيب الوزارية
            </div>
            {programs.map(p => {
              const ruleWithFormula = p.eligibilityRules?.find(r => r.weightedFormula);
              return (
                <div key={p.id} className="p-3 text-xs bg-slate-800/40 rounded-xl">
                  {ruleWithFormula?.weightedFormula ? (
                    <span className="font-mono text-emerald-300 text-[11px] block" dir="ltr">
                      {ruleWithFormula.weightedFormula.expressionAr}
                    </span>
                  ) : (
                    <span className="text-slate-400">المعدل العام للبكالوريا</span>
                  )}
                </div>
              );
            })}

            {/* Row: Past Cutoffs 2025/2024 */}
            <div className="font-semibold text-slate-400 text-xs flex items-center p-3 bg-slate-950/40 rounded-xl">
              معدل القبول الأخير (2025)
            </div>
            {programs.map(p => {
              const cutoff = p.cutoffs?.[0];
              return (
                <div key={p.id} className="p-3 text-xs bg-slate-800/40 rounded-xl">
                  {cutoff ? (
                    <div>
                      <span className="text-base font-bold text-amber-300">
                        {(cutoff.cutoffWeightedAverage || cutoff.cutoffGeneralAverage)?.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-slate-500 mr-1">/ 20</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {cutoff.cutoffWeightedAverage ? 'معدل موزون' : 'معدل عام'} ({cutoff.academicYear})
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-[11px] italic">يتحدد سنوياً</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="mt-6 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p>
            تذكير: المقارنة مبنية على المنشور الوزاري رقم 01 لوزارة التعليم العالي (MESRS). ترتيب الرغبات على منصة التسجيلات الأولية يجب أن يراعي طموحك الشخصي أولاً، يليه واقعية المعدل الموزون والأولوية الممنوحة لشعبتك.
          </p>
        </div>
      </div>
    </div>
  );
};
