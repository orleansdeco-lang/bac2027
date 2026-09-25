'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Calculator, 
  Sparkles, 
  RotateCcw, 
  MapPin, 
  Check, 
  SlidersHorizontal,
  ChevronDown,
  ArrowDownCircle,
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

const PRESET_AVERAGES = [
  { label: '10.00', value: 10.00, hint: 'مقبول' },
  { label: '12.00', value: 12.00, hint: 'قريب من الجيد' },
  { label: '14.50', value: 14.50, hint: 'جيد' },
  { label: '16.00', value: 16.00, hint: 'جيد جداً' },
  { label: '17.50', value: 17.50, hint: 'ممتاز' },
];

export const SmartGradeCalculator: React.FC<SmartGradeCalculatorProps> = ({
  onEvaluate,
  isLoading = false,
}) => {
  const [selectedStream, setSelectedStream] = useState<BacStreamCode>('sciences_exp');
  const [selectedWilaya, setSelectedWilaya] = useState<number>(16); // الجزائر العاصمة
  const [directMode, setDirectMode] = useState<boolean>(false);
  const [directAverage, setDirectAverage] = useState<number>(14.50);

  // Map of grades per subject code
  const [grades, setGrades] = useState<Record<string, number>>(() => {
    return { ...BAC_STREAMS_CONFIG.sciences_exp.defaultGrades };
  });

  const streamInfo = BAC_STREAMS_CONFIG[selectedStream];

  // Calculated average from subject grades
  const calcResult = useMemo(() => {
    return calculateStreamAverage(selectedStream, grades);
  }, [selectedStream, grades]);

  // Current effective average
  const effectiveAverage = directMode ? directAverage : calcResult.average;
  const encouraging = getEncouragingPhrase(effectiveAverage);

  // Stream change handler
  const handleStreamChange = (streamCode: BacStreamCode) => {
    setSelectedStream(streamCode);
    const defaults = BAC_STREAMS_CONFIG[streamCode]?.defaultGrades || {};
    setGrades({ ...defaults });
    trackEvent('orientation_stream_selected', { streamId: streamCode });
  };

  // Grade change handler
  const handleGradeChange = (subjectCode: string, valueStr: string) => {
    if (valueStr === '') {
      setGrades(prev => {
        const next = { ...prev };
        delete next[subjectCode];
        return next;
      });
      return;
    }
    const num = parseFloat(valueStr);
    if (isNaN(num)) return;
    const clamped = Math.min(20, Math.max(0, Math.round(num * 100) / 100));
    setGrades(prev => ({
      ...prev,
      [subjectCode]: clamped,
    }));
  };

  // Preset quick applier
  const handleApplyPreset = (targetAvg: number) => {
    if (directMode) {
      setDirectAverage(targetAvg);
    } else {
      const nextGrades: Record<string, number> = {};
      for (const subj of streamInfo.subjects) {
        nextGrades[subj.code] = targetAvg;
      }
      setGrades(nextGrades);
    }
  };

  // Reset to default grades
  const handleReset = () => {
    if (directMode) {
      setDirectAverage(14.50);
    } else {
      const defaults = BAC_STREAMS_CONFIG[selectedStream]?.defaultGrades || {};
      setGrades({ ...defaults });
    }
  };

  // Auto-evaluate when values change (debounced 250ms)
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      onEvaluate({
        streamId: selectedStream,
        wilayaId: selectedWilaya,
        generalAverage: effectiveAverage,
        grades: directMode ? {} : grades,
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [selectedStream, selectedWilaya, effectiveAverage, directMode, grades, onEvaluate]);

  // Mention calculation
  const mention = useMemo(() => {
    if (effectiveAverage >= 18) return { label: 'ممتاز', color: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' };
    if (effectiveAverage >= 16) return { label: 'جيد جداً', color: 'bg-teal-500/20 text-teal-200 border-teal-400/40' };
    if (effectiveAverage >= 14) return { label: 'جيد', color: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/40' };
    if (effectiveAverage >= 12) return { label: 'قريب من الجيد', color: 'bg-sky-500/20 text-sky-200 border-sky-400/40' };
    if (effectiveAverage >= 10) return { label: 'مقبول', color: 'bg-amber-500/20 text-amber-200 border-amber-400/40' };
    return { label: 'دون المعدل', color: 'bg-rose-500/20 text-rose-200 border-rose-400/40' };
  }, [effectiveAverage]);

  return (
    <section id="calculator" className="max-w-5xl mx-auto px-4 sm:px-6 mb-8 scroll-mt-6" dir="rtl">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Compact Stream Selector Bar */}
        <div className="bg-slate-50/80 p-2 sm:p-2.5 border-b border-slate-200">
          <div className="flex items-center justify-between gap-2 mb-1.5 px-1">
            <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
              <span>اختر شعبتك:</span>
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">
              المعاملات والمواد تتغير آلياً
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5">
            {(Object.keys(BAC_STREAMS_CONFIG) as BacStreamCode[]).map(code => {
              const stream = BAC_STREAMS_CONFIG[code];
              const isSelected = selectedStream === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleStreamChange(code)}
                  className={`py-2 px-2.5 rounded-xl text-right transition-all flex items-center justify-between border cursor-pointer ${
                    isSelected
                      ? 'bg-teal-700 border-teal-700 text-white shadow-xs font-bold'
                      : 'bg-white hover:bg-slate-100/80 border-slate-200/90 text-slate-700 font-medium'
                  }`}
                >
                  <span className="text-xs truncate">{stream.shortName}</span>
                  <span className="text-sm shrink-0 mr-1">{stream.icon}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toolbar: Mode Toggle, Wilaya & Presets */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => setDirectMode(false)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                !directMode
                  ? 'bg-white text-teal-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              حساب بالمواد (دقيق)
            </button>
            <button
              type="button"
              onClick={() => setDirectMode(true)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                directMode
                  ? 'bg-white text-teal-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              عندي المعدل واجد ⚡
            </button>
          </div>

          {/* Wilaya Selection */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <select
              value={selectedWilaya}
              onChange={e => setSelectedWilaya(Number(e.target.value))}
              className="bg-slate-50 border border-slate-200/90 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-teal-600 cursor-pointer"
            >
              {OFFICIAL_WILAYAS.map(w => (
                <option key={w.id} value={w.id}>
                  {w.code} - {w.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Preset Chips */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-bold ml-1 hidden md:inline">معدلات سريعة:</span>
            {PRESET_AVERAGES.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => handleApplyPreset(p.value)}
                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 text-[11px] font-bold transition-colors cursor-pointer"
                title={p.hint}
              >
                {p.label}
              </button>
            ))}

            <button
              type="button"
              onClick={handleReset}
              className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
              title="إعادة تعيين العلامات الافتراضية"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Score Banner (Deep Academic Pine Teal Gradient) */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-850 to-emerald-900 text-white p-3.5 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 border border-white/15 px-3 py-1 rounded-xl text-center">
                <span className="text-[10px] text-teal-200 block font-medium">معدل البكالوريا</span>
                <div className="text-2xl sm:text-3xl font-black tracking-tight font-mono text-white leading-tight">
                  {effectiveAverage.toFixed(2)}
                  <span className="text-xs text-teal-300 font-sans mr-1 font-bold">/ 20</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${mention.color}`}>
                    تقدير {mention.label}
                  </span>
                  <span className="text-xs font-bold text-teal-100">
                    شعبة {streamInfo.nameAr}
                  </span>
                </div>
                <p className="text-xs text-teal-200/90 font-medium">
                  {encouraging.text}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href="#results"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>استكشاف التخصصات أدناه</span>
                <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
              </a>
            </div>
          </div>
        </div>

        {/* Main Inputs Area */}
        <div className="p-3.5 sm:p-5">
          {directMode ? (
            /* Direct Average Mode (Quick slider + number input) */
            <div className="py-4 px-3 sm:px-6 bg-slate-50/60 rounded-xl border border-slate-200/70 text-center">
              <div className="flex items-center justify-center gap-3 max-w-sm mx-auto mb-3">
                <label htmlFor="direct-avg-val" className="text-xs font-bold text-slate-700">
                  المعدل العام للبكالوريا:
                </label>
                <input
                  id="direct-avg-val"
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={directAverage}
                  onChange={e => setDirectAverage(Math.min(20, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-24 text-center text-xl font-black text-slate-900 bg-white border-2 border-teal-600 rounded-xl py-1 px-2 shadow-inner focus:outline-hidden"
                />
                <span className="text-xs font-bold text-slate-500">/ 20</span>
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
            /* High Density Subjects Grid */
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {streamInfo.subjects.map(subj => {
                  const score = grades[subj.code] !== undefined ? grades[subj.code] : '';
                  return (
                    <div
                      key={subj.code}
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        subj.isKeySubject
                          ? 'bg-teal-50/40 border-teal-200/80'
                          : 'bg-white border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-slate-800 truncate block">
                            {subj.nameAr}
                          </span>
                          {subj.isKeySubject && (
                            <span className="text-[10px] text-amber-600 shrink-0" title="مادة أساسية للتخصصات والمعدل الموزون">
                              ⭐
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          معامل: <strong className="text-slate-700">{subj.coeff}</strong>
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          step="0.25"
                          placeholder="00"
                          value={score}
                          onChange={e => handleGradeChange(subj.code, e.target.value)}
                          className="w-14 h-8 text-center font-mono font-bold text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-slate-900"
                        />
                        <span className="text-[10px] text-slate-400">/20</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 px-1">
                <span>⭐ = مادة أساسية تؤثر مباشرة على الترتيب وحساب المعدل الموزون</span>
                <span>المجموع: {calcResult.completedCount}/{calcResult.totalSubjects} مواد</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
