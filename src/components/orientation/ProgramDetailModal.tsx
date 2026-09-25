'use client';

import React from 'react';
import {
  X,
  Building2,
  GraduationCap,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Program } from '@/types/orientation';
import { OFFICIAL_CIRCULAR_REF } from '@/lib/orientation/orientation-engine';

interface ProgramDetailModalProps {
  program: Program | null;
  onClose: () => void;
}

export const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({
  program,
  onClose,
}) => {
  if (!program) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200" dir="rtl">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-2xl text-right"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
            <span>رمز التخصص بالمنشور الوزاري: {program.programCode}</span>
          </div>

          <h2 className="text-2xl font-black text-stone-900 leading-tight">
            {program.nameAr}
          </h2>
          {program.nameFr && (
            <p className="text-stone-400 text-xs font-sans mt-0.5" dir="ltr">
              {program.nameFr}
            </p>
          )}
          {program.specialtyAr && (
            <p className="text-teal-700 font-semibold text-xs mt-1">
              التخصص الدقيق: {program.specialtyAr}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-stone-600">
            <span className="flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-xl font-medium">
              <GraduationCap className="w-4 h-4 text-teal-700" />
              <span>{program.degreeType}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-xl font-medium">
              <Calendar className="w-4 h-4 text-stone-500" />
              <span>مدة الدراسة: {program.durationYears} سنوات</span>
            </span>
            <span className="flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-xl font-medium">
              <FileText className="w-4 h-4 text-stone-500" />
              <span>الدورة: {program.academicYear}</span>
            </span>
          </div>
        </div>

        {/* Section 1: Conditions & Priorities per Stream */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-700" />
            <span>الشروط البيداغوجية والأولويات حسب شعبة البكالوريا</span>
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-stone-50/50">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 bg-stone-100/70 font-semibold">
                  <th className="py-2.5 px-3">الشعبة</th>
                  <th className="py-2.5 px-3">الأولوية</th>
                  <th className="py-2.5 px-3">طريقة الترتيب</th>
                  <th className="py-2.5 px-3">الحد الأدنى للمشاركة</th>
                  <th className="py-2.5 px-3">صيغة الحساب / الشروط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200/70 text-stone-700">
                {program.eligibilityRules?.map((r, idx) => (
                  <tr key={idx} className="hover:bg-white transition-colors">
                    <td className="py-2.5 px-3 font-bold text-stone-900">
                      {r.bacStreamId === 'sciences_exp' && 'علوم تجريبية'}
                      {r.bacStreamId === 'math' && 'رياضيات'}
                      {r.bacStreamId === 'technique_math' && 'تقني رياضي'}
                      {r.bacStreamId === 'gestion_eco' && 'تسيير واقتصاد'}
                      {r.bacStreamId === 'lettres_philo' && 'آداب وفلسفة'}
                      {r.bacStreamId === 'langues_etrangeres' && 'لغات أجنبية'}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          r.priority === 1
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        أولوية {r.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium">
                      {r.rankingBasis === 'weighted_average' ? 'معدل موزون' : 'معدل عام'}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                      {r.minimumGeneralAverage ? `${r.minimumGeneralAverage.toFixed(2)} / 20` : '10.00 / 20'}
                    </td>
                    <td className="py-2.5 px-3">
                      {r.weightedFormula ? (
                        <span className="font-mono text-teal-700 text-[11px] font-semibold" dir="ltr">
                          {r.weightedFormula.expressionAr}
                        </span>
                      ) : (
                        <span className="text-stone-500">المعدل العام</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Institutions & Registration Scopes */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-700" />
            <span>المؤسسات الجامعية التي تضمن التكوين والدوائر الجغرافية</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {program.institutions?.map((instOffer, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-stone-900 text-xs">
                    {instOffer.institution.nameAr}
                  </h4>
                  <div className="flex items-center gap-1.5 text-stone-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>ولاية {instOffer.institution.wilayaId}</span>
                  </div>
                </div>

                <div className="shrink-0 text-left">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${
                      instOffer.registrationScope === 'national'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : 'bg-stone-200/70 text-stone-700'
                    }`}
                  >
                    {instOffer.registrationScope === 'national' ? 'تسجيل وطني' : 'تسجيل جهوي'}
                  </span>
                  {instOffer.institution.websiteUrl && (
                    <a
                      href={instOffer.institution.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[10px] text-teal-700 hover:underline mt-1 font-semibold"
                    >
                      <span>الموقع الرسمي</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Historical Cutoffs */}
        {program.cutoffs && program.cutoffs.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold text-stone-900 mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-700" />
              <span>معدلات القبول السابقة حسب الشعبة (مؤشرات استرشادية غير ملزمة)</span>
            </h3>
            <p className="text-[11px] text-stone-500 mb-3">
              معدل القبول يتغير سنوياً حسب مستوى نتائج البكالوريا وعدد المقاعد ورغبات الطلبة.
            </p>

            <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-stone-50/50">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 bg-stone-100/70 font-semibold">
                    <th className="py-2.5 px-3">السنة</th>
                    <th className="py-2.5 px-3">الشعبة</th>
                    <th className="py-2.5 px-3">الأولوية</th>
                    <th className="py-2.5 px-3">المعدل التاريخي</th>
                    <th className="py-2.5 px-3">المصدر الإحصائي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/70 text-stone-700">
                  {program.cutoffs.map((c, idx) => (
                    <tr key={idx} className="hover:bg-white transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-stone-800">{c.academicYear}</td>
                      <td className="py-2.5 px-3 font-bold text-stone-900">
                        {c.bacStreamId === 'sciences_exp' && 'علوم تجريبية'}
                        {c.bacStreamId === 'math' && 'رياضيات'}
                        {c.bacStreamId === 'technique_math' && 'تقني رياضي'}
                        {c.bacStreamId === 'gestion_eco' && 'تسيير واقتصاد'}
                        {c.bacStreamId === 'lettres_philo' && 'آداب وفلسفة'}
                        {c.bacStreamId === 'langues_etrangeres' && 'لغات أجنبية'}
                        {!c.bacStreamId && 'عام (كافة الشعب)'}
                      </td>
                      <td className="py-2.5 px-3">
                        {c.priority ? (
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${c.priority === 1 ? 'bg-teal-50 text-teal-800' : 'bg-stone-100 text-stone-600'}`}>
                            أولوية {c.priority}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-black text-stone-900">
                        {(c.cutoffWeightedAverage || c.cutoffGeneralAverage)?.toFixed(2)} / 20
                      </td>
                      <td className="py-2.5 px-3 text-stone-500 text-[11px]">
                        {c.source}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 4: Legal Reference Footer */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-stone-800 font-bold mb-1">
                تنبيه بيداغوجي وقانوني من وزارة التعليم العالي والبحث العلمي:
              </p>
              <p className="leading-relaxed">
                استيفاء الشروط المذكورة أعلاه يمنح المترشح صفة "الأهلية للترشح" فقط، ولا يعتبر قبولاً نهائياً بأي حال.
                يخضع القبول الفعلي للترتيب التنافسي حسب المقاعد الشاغرة لدى المؤسسة الجامعية ورغبات الدفعة الحالية.
              </p>
              <div className="mt-1.5 text-[11px] text-stone-400 font-sans">
                المرجع: {OFFICIAL_CIRCULAR_REF}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
