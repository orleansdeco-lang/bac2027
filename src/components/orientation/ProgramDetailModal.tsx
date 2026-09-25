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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl text-right"
        dir="rtl"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>رمز التخصص بالمنشور الوزاري: {program.programCode}</span>
          </div>

          <h2 className="text-2xl font-black text-white leading-tight">
            {program.nameAr}
          </h2>
          <p className="text-slate-400 text-sm font-sans mt-0.5" dir="ltr">
            {program.nameFr}
          </p>
          {program.specialtyAr && (
            <p className="text-emerald-400 font-semibold text-sm mt-1">
              التخصص الدقيق: {program.specialtyAr}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-slate-300">
            <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>{program.degreeType}</span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>مدة الدراسة: {program.durationYears} سنوات</span>
            </span>
            <span className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>الدورة: {program.academicYear}</span>
            </span>
          </div>
        </div>

        {/* Section 1: Conditions & Priorities per Stream */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>الشروط البيداغوجية والأولويات حسب شعبة البكالوريا</span>
          </h3>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/80">
                  <th className="py-2.5 px-3">الشعبة</th>
                  <th className="py-2.5 px-3">الأولوية</th>
                  <th className="py-2.5 px-3">أساس الترتيب</th>
                  <th className="py-2.5 px-3">الحد الأدنى للترشح</th>
                  <th className="py-2.5 px-3">الصيغة / الشروط</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {program.eligibilityRules?.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 font-semibold text-white">
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
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        أولوية {r.priority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {r.rankingBasis === 'weighted_average' ? 'معدل موزون' : 'معدل عام'}
                    </td>
                    <td className="py-2.5 px-3 font-mono">
                      {r.minimumGeneralAverage ? `${r.minimumGeneralAverage.toFixed(2)} / 20` : '10.00 / 20'}
                    </td>
                    <td className="py-2.5 px-3">
                      {r.weightedFormula ? (
                        <span className="font-mono text-emerald-300 text-[11px]" dir="ltr">
                          {r.weightedFormula.expressionAr}
                        </span>
                      ) : (
                        <span className="text-slate-400">المعدل العام</span>
                      )}
                      {r.mathematicsMin && (
                        <div className="text-[10px] text-amber-300 mt-0.5">
                          الرياضيات &gt;= {r.mathematicsMin}
                        </div>
                      )}
                      {r.requiredSubject && r.requiredSubjectMin && (
                        <div className="text-[10px] text-amber-300 mt-0.5">
                          {r.requiredSubject} &gt;= {r.requiredSubjectMin}
                        </div>
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
          <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>المؤسسات الجامعية التي تضمن التكوين والدوائر الجغرافية</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {program.institutions?.map((instOffer, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">
                    {instOffer.institution.nameAr}
                  </h4>
                  <div className="flex items-center gap-1.5 text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>ولاية رقم {instOffer.institution.wilayaId}</span>
                  </div>
                  {instOffer.eligibleWilayas && (
                    <p className="text-[11px] text-slate-400 mt-1">
                      الولايات المؤهلة: {instOffer.eligibleWilayas.join('، ')}
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      instOffer.registrationScope === 'national'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {instOffer.registrationScope === 'national' ? 'تسجيل وطني' : 'تسجيل جهوي'}
                  </span>
                  {instOffer.institution.websiteUrl && (
                    <a
                      href={instOffer.institution.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-emerald-400 hover:underline mt-1.5"
                    >
                      <span>الموقع الرسمي</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Stream-Stratified Historical Cutoffs */}
        {program.cutoffs && program.cutoffs.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>معدلات القبول في السنوات السابقة حسب الشعبة (مؤشرات استرشادية غير ملزمة)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mb-3">
              معدل القبول يتغير سنوياً حسب مستوى نتائج البكالوريا وعدد المقاعد ورغبات الطلبة. لا يمثل الحد الأدنى للترشح.
            </p>

            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/80">
                    <th className="py-2.5 px-3">السنة</th>
                    <th className="py-2.5 px-3">الشعبة</th>
                    <th className="py-2.5 px-3">الأولوية</th>
                    <th className="py-2.5 px-3">معدل القبول العام</th>
                    <th className="py-2.5 px-3">معدل القبول الموزون</th>
                    <th className="py-2.5 px-3">المصدر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {program.cutoffs.map((c, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono text-cyan-300 font-semibold">{c.academicYear}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">
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
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${c.priority === 1 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>
                            أولوية {c.priority}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">
                        {c.cutoffGeneralAverage ? `${c.cutoffGeneralAverage.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-emerald-400 font-bold">
                        {c.cutoffWeightedAverage ? `${c.cutoffWeightedAverage.toFixed(2)}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {c.source}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 4: Provenance & Verified Official Source */}
        {program.sourceId && (
          <div className="mb-6 p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>مصدر البيانات المعتمد: {program.sourceId}</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                موثق رسمياً (VERIFIED)
              </span>
            </div>
          </div>
        )}

        {/* Section 5: Legal Reference Footer */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-slate-300 font-semibold mb-1">
                تنبيه بيداغوجي وقانوني من وزارة التعليم العالي والبحث العلمي:
              </p>
              <p className="leading-relaxed">
                استيفاء الشروط المذكورة أعلاه يمنح المترشح صفة "الأهلية للترشح" فقط، ولا يعتبر قبولاً نهائياً بأي حال.
                يخضع القبول الفعلي للترتيب التنافسي حسب المقاعد الشاغرة لدى المؤسسة الجامعية، ورغبات الدفعة الحالية، وتطابق الدائرة الجغرافية.
              </p>
              <div className="mt-2 text-[11px] text-slate-500 font-sans">
                المرجع: {OFFICIAL_CIRCULAR_REF}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
