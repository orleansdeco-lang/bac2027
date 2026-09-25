'use client';

import React from 'react';
import { X, Scale, Trash2, Check, AlertCircle, Building2, MapPin } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-2xl text-right"
        dir="rtl"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight">
                مقارنة التخصصات الجامعية
              </h2>
              <p className="text-xs text-stone-500 mt-0.5 font-medium">
                قارن بين الشروط الرسمية، الشهادات، طريقة القبول، والعتبات التاريخية جنباً إلى جنب.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClear}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>إفراغ المقارنة</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="overflow-x-auto">
          <div
            className="grid gap-3 min-w-[700px]"
            style={{
              gridTemplateColumns: `180px repeat(${programs.length}, minmax(240px, 1fr))`,
            }}
          >
            {/* Header Row: Names */}
            <div className="font-bold text-stone-400 text-xs flex items-center p-3 bg-stone-50 rounded-xl">
              التخصص الجامعي
            </div>
            {programs.map(p => (
              <div
                key={p.id}
                className="relative p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 flex flex-col justify-between"
              >
                <button
                  type="button"
                  onClick={() => onRemove(p.id)}
                  className="absolute top-3 left-3 p-1 rounded-lg hover:bg-stone-200 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="حذف من المقارنة"
                >
                  <X className="w-4 h-4" />
                </button>
                <div>
                  <span className="text-[11px] font-mono text-teal-700 block mb-1 font-semibold">
                    رمز #{p.programCode}
                  </span>
                  <h3 className="font-black text-stone-900 text-base leading-snug">
                    {p.nameAr}
                  </h3>
                  {p.specialtyAr && (
                    <p className="text-xs text-stone-500 mt-1">{p.specialtyAr}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Row: Field & Training Type */}
            <div className="font-semibold text-stone-500 text-xs flex items-center p-3 bg-stone-50/50 rounded-xl">
              نوع التكوين والميدان
            </div>
            {programs.map(p => (
              <div key={p.id} className="p-3 text-xs text-stone-700 bg-white border border-stone-100 rounded-xl">
                <span className="font-bold text-stone-900 block mb-0.5">{p.trainingType}</span>
                <span className="text-stone-400">ميدان {p.fieldId}</span>
              </div>
            ))}

            {/* Row: Degree Type */}
            <div className="font-semibold text-stone-500 text-xs flex items-center p-3 bg-stone-50/50 rounded-xl">
              الشهادة الممنوحة
            </div>
            {programs.map(p => (
              <div key={p.id} className="p-3 text-xs text-stone-800 bg-white border border-stone-100 rounded-xl font-medium">
                {p.degreeType}
              </div>
            ))}

            {/* Row: Duration */}
            <div className="font-semibold text-stone-500 text-xs flex items-center p-3 bg-stone-50/50 rounded-xl">
              مدة الدراسة
            </div>
            {programs.map(p => (
              <div key={p.id} className="p-3 text-xs font-bold text-teal-700 bg-white border border-stone-100 rounded-xl">
                {p.durationYears} سنوات
              </div>
            ))}

            {/* Row: Ranking Formula */}
            <div className="font-semibold text-stone-500 text-xs flex items-center p-3 bg-stone-50/50 rounded-xl">
              طريقة القبول
            </div>
            {programs.map(p => {
              const ruleWithFormula = p.eligibilityRules?.find(r => r.weightedFormula);
              return (
                <div key={p.id} className="p-3 text-xs bg-white border border-stone-100 rounded-xl">
                  {ruleWithFormula?.weightedFormula ? (
                    <div>
                      <span className="font-bold text-teal-700 block mb-1">معدل موزون</span>
                      <span className="font-mono text-stone-700 text-[11px] block" dir="ltr">
                        {ruleWithFormula.weightedFormula.expressionAr}
                      </span>
                    </div>
                  ) : (
                    <span className="text-stone-600 font-medium">المعدل العام للبكالوريا مباشرة</span>
                  )}
                </div>
              );
            })}

            {/* Row: Past Cutoffs */}
            <div className="font-semibold text-stone-500 text-xs flex items-center p-3 bg-stone-50/50 rounded-xl">
              آخر عتبة تاريخية
            </div>
            {programs.map(p => {
              const cutoff = p.cutoffs?.[0];
              return (
                <div key={p.id} className="p-3 text-xs bg-white border border-stone-100 rounded-xl">
                  {cutoff ? (
                    <div>
                      <span className="text-base font-black text-stone-900">
                        {(cutoff.cutoffWeightedAverage || cutoff.cutoffGeneralAverage)?.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-stone-400 mr-1">/ 20</span>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        {cutoff.cutoffWeightedAverage ? 'معدل موزون' : 'معدل عام'} ({cutoff.academicYear})
                      </span>
                    </div>
                  ) : (
                    <span className="text-stone-400 text-[11px] italic">يتحدد سنوياً</span>
                  )}
                </div>
              );
            })}

            {/* Row: Host Institutions Count & Scope */}
            <div className="font-semibold text-stone-500 text-xs flex items-center p-3 bg-stone-50/50 rounded-xl">
              المؤسسات المتاحة
            </div>
            {programs.map(p => (
              <div key={p.id} className="p-3 text-xs bg-white border border-stone-100 rounded-xl">
                <span className="font-bold text-stone-800 block mb-0.5">
                  {p.institutions?.length || 1} مؤسسة جامعية
                </span>
                <span className="text-[11px] text-stone-500">
                  {p.institutions?.[0]?.registrationScope === 'national' ? 'تسجيل وطني' : 'تسجيل جهوي / محلي'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer Note */}
        <div className="mt-6 p-4 rounded-2xl bg-stone-50 border border-stone-200/80 text-xs text-stone-600 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            تذكير: المقارنة مستندة إلى نصوص المنشور الوزاري رقم 01 لوزارة التعليم العالي (MESRS). العتبات التاريخية استرشادية بحتة ولا تمثل ضماناً للقبول في الدورة الحالية.
          </p>
        </div>
      </div>
    </div>
  );
};
