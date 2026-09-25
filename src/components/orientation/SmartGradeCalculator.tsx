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

  // Mention calculation (harmonized with SHATER theme)
  const mention = useMemo(() => {
    if (effectiveAverage >= 18) return { label: 'ممتاز', bg: 'bg-[#E8F2EB]', text: 'text-[#245248]', border: 'border-[#AFC8BD]' };
    if (effectiveAverage >= 16) return { label: 'جيد جداً', bg: 'bg-[#E8F2EB]', text: 'text-[#2C5E54]', border: 'border-[#AFC8BD]' };
    if (effectiveAverage >= 14) return { label: 'جيد', bg: 'bg-[#E8F2EB]', text: 'text-[#2C5E54]', border: 'border-[#DCE9E4]' };
    if (effectiveAverage >= 12) return { label: 'قريب من الجيد', bg: 'bg-[#FAF0E2]', text: 'text-[#8C5D23]', border: 'border-[#E8CDA8]' };
    if (effectiveAverage >= 10) return { label: 'مقبول', bg: 'bg-[#FAF0E2]', text: 'text-[#8C5D23]', border: 'border-[#E8CDA8]' };
    return { label: 'دون المعدل', bg: 'bg-[#F9EAE8]', text: 'text-[#9E3E33]', border: 'border-[#E8BCB5]' };
  }, [effectiveAverage]);

  return (
    <section id="calculator" className="max-w-5xl mx-auto px-4 sm:px-6 mb-8 scroll-mt-6" dir="rtl">
      <div className="bg-white rounded-3xl border border-[#E4DED2] shadow-sm overflow-hidden">
        
        {/* Compact Stream Selector Bar */}
        <div className="bg-[#FAF8F5] p-2.5 sm:p-3 border-b border-[#E4DED2]">
          <div className="flex items-center justify-between gap-2 mb-2 px-1">
            <span className="text-xs font-bold text-[#1E3A34] flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#5F8F86]" />
              <span>اختر شعبة البكالوريا:</span>
            </span>
            <span className="text-[11px] text-[#78716C] hidden sm:inline">
              المعاملات والمواد تتغير آلياً حسب الشعبة
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2">
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
                      ? 'bg-[#2C5E54] border-[#2C5E54] text-white shadow-xs font-bold'
                      : 'bg-white hover:bg-[#F7F3EA] border-[#E4DED2] text-[#334155] font-medium'
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
        <div className="p-3 sm:p-4 bg-white border-b border-[#E4DED2] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#F7F3EA] p-1 rounded-xl border border-[#E4DED2]">
            <button
              type="button"
              onClick={() => setDirectMode(false)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                !directMode
                  ? 'bg-white text-[#1E3A34] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E3A34]'
              }`}
            >
              حساب بالمواد (مفصل وموزون)
            </button>
            <button
              type="button"
              onClick={() => setDirectMode(true)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                directMode
                  ? 'bg-white text-[#1E3A34] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E3A34]'
              }`}
            >
              عندي المعدل واجد ⚡
            </button>
          </div>

          {/* Wilaya Selection */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#5F8F86] shrink-0" />
            <select
              value={selectedWilaya}
              onChange={e => setSelectedWilaya(Number(e.target.value))}
              className="bg-[#FAF8F5] border border-[#E4DED2] rounded-lg px-2.5 py-1 text-xs font-bold text-[#1E3A34] focus:outline-hidden focus:ring-1 focus:ring-[#2C5E54] cursor-pointer"
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
            <span className="text-[11px] text-[#78716C] font-bold ml-1 hidden md:inline">معدلات سريعة:</span>
            {PRESET_AVERAGES.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => handleApplyPreset(p.value)}
                className="px-2 py-0.5 rounded-md bg-[#FAF8F5] hover:bg-[#F7F3EA] hover:text-[#2C5E54] text-[#334155] border border-[#E4DED2] text-[11px] font-bold transition-colors cursor-pointer"
                title={p.hint}
              >
                {p.label}
              </button>
            ))}

            <button
              type="button"
              onClick={handleReset}
              className="p-1 text-[#78716C] hover:text-[#C8796B] rounded-md transition-colors"
              title="إعادة تعيين العلامات الافتراضية"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Live Score Banner: Warm, Soothing, Academic (Soft Sage / Cream Card) */}
        <div className="bg-gradient-to-r from-[#F4F8F7] via-[#FAF9F6] to-[#F7F3EA] p-3.5 sm:p-5 border-b border-[#E4DED2]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Score Display Card */}
              <div className="bg-white border border-[#DCE9E4] shadow-xs px-4 py-2 rounded-2xl text-center shrink-0">
                <span className="text-[10px] text-[#527D75] block font-bold">معدل البكالوريا</span>
                <div className="text-3xl sm:text-4xl font-black tracking-tight font-mono text-[#2C5E54] leading-tight">
                  {effectiveAverage.toFixed(2)}
                  <span className="text-xs text-[#78716C] font-sans mr-1 font-bold">/ 20</span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${mention.bg} ${mention.text} ${mention.border}`}>
                    تقدير {mention.label}
                  </span>
                  <span className="text-xs font-bold text-[#1E3A34]">
                    شعبة {streamInfo.nameAr}
                  </span>
                </div>
                <p className="text-xs text-[#475569] font-medium leading-relaxed">
                  {encouraging.text}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href="#results"
                className="px-4 py-2 rounded-xl bg-[#2C5E54] hover:bg-[#234B43] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
              >
                <span>استكشاف التخصصات أدناه</span>
                <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
              </a>
            </div>
          </div>
        </div>

        {/* Main Inputs Area */}
        <div className="p-4 sm:p-5">
          {directMode ? (
            /* Direct Average Mode (Clean warm container) */
            <div className="py-5 px-4 sm:px-8 bg-[#FAF8F5] rounded-2xl border border-[#E4DED2] text-center max-w-xl mx-auto">
              <label htmlFor="direct-avg-val" className="block text-xs font-bold text-[#334155] mb-3">
                أدخل معدل البكالوريا العام مباشرة لتحليل التخصصات المتوافقة معه:
              </label>
              
              <div className="inline-flex items-center justify-center gap-2 bg-white px-4 py-2 rounded-2xl border border-[#DCE9E4] shadow-xs mb-4">
                <input
                  id="direct-avg-val"
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={directAverage}
                  onChange={e => setDirectAverage(Math.min(20, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-24 text-center text-3xl font-black text-[#1E3A34] bg-transparent focus:outline-hidden font-mono"
                />
                <span className="text-sm font-bold text-[#78716C]">/ 20</span>
              </div>

              <div className="max-w-md mx-auto">
                <input
                  type="range"
                  min="9"
                  max="19"
                  step="0.05"
                  value={directAverage}
                  onChange={e => setDirectAverage(parseFloat(e.target.value))}
                  className="w-full accent-[#2C5E54] cursor-pointer"
                />
              </div>
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
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        subj.isKeySubject
                          ? 'bg-[#F4F8F7] border-[#AFC8BD]/70 text-[#1E3A34]'
                          : 'bg-white border-[#E4DED2] hover:border-[#DCE9E4] text-[#334155]'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-[#1E3A34] truncate block">
                            {subj.nameAr}
                          </span>
                          {subj.isKeySubject && (
                            <span className="text-[11px] text-[#D7A66A] shrink-0" title="مادة أساسية للتخصصات والمعدل الموزون">
                              ⭐
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#78716C] font-mono">
                          معامل: <strong className="text-[#1E3A34]">{subj.coeff}</strong>
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
                          className="w-14 h-8 text-center font-mono font-bold text-xs bg-white border border-[#D8D0C3] focus:border-[#2C5E54] focus:ring-1 focus:ring-[#2C5E54] rounded-lg text-[#0F172A]"
                        />
                        <span className="text-[10px] text-[#78716C]">/20</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-[11px] text-[#78716C] px-1">
                <span>⭐ = مادة أساسية تؤثر مباشرة على الترتيب وحساب المعدل الموزون</span>
                <span>المواد المدخلة: {calcResult.completedCount}/{calcResult.totalSubjects} مواد</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
