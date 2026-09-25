'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, 
  Sparkles, 
  RotateCcw, 
  ArrowLeft, 
  MapPin, 
  Check, 
  SlidersHorizontal,
  GraduationCap
} from 'lucide-react';
import { BacStreamCode } from '@/types/orientation';
import { OFFICIAL_WILAYAS } from '@/lib/orientation/data/wilayas';
import { 
  BAC_STREAMS_CONFIG, 
  calculateStreamAverage, 
  getEncouragingPhrase 
} from '@/lib/orientation/data/calculator-config';
import { trackEvent } from '@/lib/analytics';

interface SmartGradeCalculatorProps {
  onEvaluate: (profile: {
    streamId: BacStreamCode;
    wilayaId: number;
    generalAverage: number;
    grades: Record<string, number>;
  }) => void;
  isLoading?: boolean;
}

export const SmartGradeCalculator: React.FC<SmartGradeCalculatorProps> = ({
  onEvaluate,
  isLoading = false,
}) => {
  const [selectedStream, setSelectedStream] = useState<BacStreamCode>('sciences_exp');
  const [selectedWilaya, setSelectedWilaya] = useState<number>(16); // الجزائر
  const [directMode, setDirectMode] = useState<boolean>(false);
  const [directAverage, setDirectAverage] = useState<number>(14.50);

  // Map of grades per subject code
  const [grades, setGrades] = useState<Record<string, number>>(() => {
    return { ...BAC_STREAMS_CONFIG.sciences_exp.defaultGrades };
  });

  // When stream changes, load default grades for that stream
  const handleStreamChange = (streamCode: BacStreamCode) => {
    setSelectedStream(streamCode);
    const defaults = BAC_STREAMS_CONFIG[streamCode]?.defaultGrades || {};
    setGrades({ ...defaults });
    trackEvent('orientation_stream_selected', { streamId: streamCode });
  };

  // Grade change handler
  const handleGradeChange = (subjectCode: string, valueStr: string) => {
    const num = parseFloat(valueStr);
    if (isNaN(num)) {
      setGrades(prev => {
        const next = { ...prev };
        delete next[subjectCode];
        return next;
      });
      return;
    }
    const clamped = Math.min(20, Math.max(0, Math.round(num * 100) / 100));
    setGrades(prev => ({
      ...prev,
      [subjectCode]: clamped,
    }));
  };

  // Calculated average from subject grades
  const calcResult = useMemo(() => {
    return calculateStreamAverage(selectedStream, grades);
  }, [selectedStream, grades]);

  // Current effective average
  const effectiveAverage = directMode ? directAverage : calcResult.average;
  const encouraging = getEncouragingPhrase(effectiveAverage);

  const streamInfo = BAC_STREAMS_CONFIG[selectedStream];

  // Submit profile to explore
  const handleSubmit = () => {
    trackEvent('orientation_score_completed', {
      streamId: selectedStream,
      wilayaId: selectedWilaya,
      average: effectiveAverage,
      directMode,
    });

    onEvaluate({
      streamId: selectedStream,
      wilayaId: selectedWilaya,
      generalAverage: effectiveAverage,
      grades: directMode ? {} : grades,
    });
  };

  // Quick preset scores
  const handleApplyPreset = (targetAvg: number) => {
    if (directMode) {
      setDirectAverage(targetAvg);
    } else {
      const nextGrades: Record<string, number> = {};
      for (const subj of streamInfo.subjects) {
        // distribute around target
        nextGrades[subj.code] = targetAvg;
      }
      setGrades(nextGrades);
    }
  };

  return (
    <section id="calculator" className="max-w-5xl mx-auto px-4 sm:px-6 mb-16 scroll-mt-6" dir="rtl">
      {/* Container card */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-5 sm:p-8">
        
        {/* Step 1: Choose BAC Stream */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md mb-1 inline-block">
                الخطوة 1 من 2
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                اختر شعبة البكالوريا
              </h2>
            </div>
            <span className="text-xs text-stone-500 hidden sm:inline">
              المواد والمعاملات تتغير آلياً حسب الشعبة
            </span>
          </div>

          {/* Stream Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
            {(Object.keys(BAC_STREAMS_CONFIG) as BacStreamCode[]).map(code => {
              const stream = BAC_STREAMS_CONFIG[code];
              const isSelected = selectedStream === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleStreamChange(code)}
                  className={`p-3.5 sm:p-4 rounded-2xl text-right transition-all flex flex-col justify-between border cursor-pointer ${
                    isSelected
                      ? 'bg-teal-50/70 border-teal-600 text-teal-950 ring-1 ring-teal-600 shadow-xs'
                      : 'bg-white hover:bg-stone-50 border-stone-200/80 text-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{stream.icon}</span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-sm block leading-snug">
                      {stream.nameAr}
                    </span>
                    <span className="text-[11px] text-stone-600 block mt-0.5 font-medium">
                      {stream.shortName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Subject Grades & Wilaya Input */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-stone-100">
            <div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md mb-1 inline-block">
                الخطوة 2 من 2
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                دخل علامات المواد
              </h2>
            </div>

            {/* Direct Average Mode Toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDirectMode(!directMode)}
                className="text-xs font-bold text-teal-800 hover:text-teal-950 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200/70 transition-all cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-teal-700" />
                <span>{directMode ? 'الرجوع للمواد الفردية' : 'عندي المعدل واجد مباشرة؟'}</span>
              </button>
            </div>
          </div>

          {/* Wilaya Selection Selector */}
          <div className="mb-6 p-4 rounded-2xl bg-stone-50/70 border border-stone-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
              <div>
                <span className="text-xs font-bold text-stone-800 block">ولاية الإقامة (للتوجيه الجهوي والمحلي)</span>
                <span className="text-[11px] text-stone-500">بعض كليات الطب والجامعات تتطلب تطابق ولاية الطالب</span>
              </div>
            </div>

            <select
              value={selectedWilaya}
              onChange={e => setSelectedWilaya(Number(e.target.value))}
              className="bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-hidden focus:ring-2 focus:ring-teal-600/30 max-w-xs cursor-pointer"
            >
              {OFFICIAL_WILAYAS.map(w => (
                <option key={w.id} value={w.id}>
                  {w.code} - {w.nameAr} ({w.nameFr})
                </option>
              ))}
            </select>
          </div>

          {/* Conditional Input View: Direct Average vs Subject Cards */}
          {directMode ? (
            <div className="p-8 rounded-2xl bg-teal-50/40 border border-teal-200/60 text-center mb-8">
              <label htmlFor="direct-avg-input" className="block text-sm font-bold text-stone-700 mb-2">
                أدخل معدل البكالوريا العام الخاص بك مباشرة:
              </label>
              <div className="inline-flex items-center justify-center gap-2 max-w-xs mx-auto mb-4">
                <input
                  id="direct-avg-input"
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={directAverage}
                  onChange={e => setDirectAverage(Math.min(20, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-36 text-center text-3xl font-black text-stone-900 bg-white border-2 border-teal-600 rounded-2xl py-2 px-3 shadow-inner focus:outline-hidden"
                />
                <span className="text-base font-bold text-stone-500">/ 20</span>
              </div>
              <input
                type="range"
                min="9"
                max="19"
                step="0.05"
                value={directAverage}
                onChange={e => setDirectAverage(parseFloat(e.target.value))}
                className="w-full max-w-md accent-teal-700 cursor-pointer"
              />
            </div>
          ) : (
            <>
              {/* Progress bar indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1.5 font-medium">
                  <span>اكتمال المواد: {calcResult.completedCount} من {calcResult.totalSubjects}</span>
                  <span>المعاملات المعتمدة: {calcResult.totalCoeff}</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-700 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(calcResult.completedCount / calcResult.totalSubjects) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Subject Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                {streamInfo.subjects.map(subj => {
                  const val = grades[subj.code];
                  const hasVal = typeof val === 'number' && !isNaN(val);
                  return (
                    <div
                      key={subj.code}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        subj.isKeySubject
                          ? 'bg-white border-stone-300 shadow-2xs'
                          : 'bg-white border-stone-200/80 hover:border-stone-300'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-bold text-stone-900 text-xs sm:text-sm truncate block">
                            {subj.nameAr}
                          </span>
                          {subj.isKeySubject && (
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0" title="مادة مميزة" />
                          )}
                        </div>
                        <span className="text-[11px] font-medium text-stone-400 block">
                          المعامل: <strong className="text-stone-700">{subj.coeff}</strong> • {subj.nameFr}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          max="20"
                          placeholder="00"
                          value={hasVal ? val : ''}
                          onChange={e => handleGradeChange(subj.code, e.target.value)}
                          className="w-16 h-10 text-center font-bold text-sm sm:text-base text-stone-900 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-600 focus:outline-hidden transition-all"
                        />
                        <span className="text-[11px] text-stone-400 font-medium">/ 20</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Quick preset buttons */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-8 text-xs text-stone-500 pt-2 border-t border-stone-100">
            <span className="font-medium">تجربة سريعة لمعدلات نموذجية:</span>
            <div className="flex items-center gap-1.5">
              {[12.00, 14.50, 16.20, 17.50].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleApplyPreset(val)}
                  className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-stone-700 font-bold transition-colors cursor-pointer"
                >
                  {val.toFixed(2)}
                </button>
              ))}
            </div>
          </div>

          {/* Big Expected Average Display Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-linear-to-br from-stone-900 via-stone-850 to-stone-900 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-right">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                معدلك المتوقع
              </span>
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                  {effectiveAverage.toFixed(2)}
                </span>
                <span className="text-stone-400 font-bold text-base">/ 20</span>
              </div>
              <p className={`mt-2 text-xs sm:text-sm ${encouraging.tone}`}>
                {encouraging.text}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full md:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-base shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                  <span>جاري حساب الفرص...</span>
                </>
              ) : (
                <>
                  <span>استكشف التخصصات اللي تناسبك</span>
                  <ArrowLeft className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};
