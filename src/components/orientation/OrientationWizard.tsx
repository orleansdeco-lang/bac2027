'use client';

import React, { useState } from 'react';
import {
  Compass,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  GraduationCap,
  Scale,
  XCircle,
} from 'lucide-react';
import {
  StudentBacProfile,
  BacStreamCode,
  Wilaya,
  OrientationReport,
  Program,
} from '@/types/orientation';
import { OFFICIAL_BAC_STREAMS } from '@/lib/orientation/data/streams';
import { OFFICIAL_WILAYAS } from '@/lib/orientation/data/wilayas';
import { ProgramEvaluationCard } from './ProgramEvaluationCard';
import { ProgramDetailModal } from './ProgramDetailModal';

interface OrientationWizardProps {
  onToggleCompare: (program: Program) => void;
  comparedProgramIds: string[];
}

export const OrientationWizard: React.FC<OrientationWizardProps> = ({
  onToggleCompare,
  comparedProgramIds,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedStream, setSelectedStream] = useState<BacStreamCode>('sciences_exp');
  const [selectedWilaya, setSelectedWilaya] = useState<number>(16); // Alger default
  const [wilayaSearch, setWilayaSearch] = useState<string>('');
  const [generalAverage, setGeneralAverage] = useState<number>(15.50);

  // Subject Grades
  const [grades, setGrades] = useState<{
    mathematics?: number;
    physics?: number;
    naturalSciences?: number;
    arabic?: number;
    french?: number;
    english?: number;
    philosophy?: number;
    historyGeo?: number;
    accounting?: number;
  }>({
    mathematics: 16.0,
    physics: 15.5,
    naturalSciences: 16.0,
    arabic: 14.0,
    french: 15.0,
    english: 16.0,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<OrientationReport | null>(null);
  const [selectedProgramForModal, setSelectedProgramForModal] = useState<Program | null>(null);

  // Results filtering
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ELIGIBLE' | 'CONDITIONAL' | 'UNKNOWN' | 'NOT_ELIGIBLE'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Handle step completion & evaluation
  const handleEvaluate = async () => {
    setLoading(true);
    try {
      const payload: StudentBacProfile = {
        streamId: selectedStream,
        wilayaId: selectedWilaya,
        generalAverage: Number(generalAverage),
        grades,
      };

      const res = await fetch('/api/orientation/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Evaluation failed');
      }

      const data: OrientationReport = await res.json();
      setReport(data);
      setCurrentStep(5);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtered Wilayas for Step 2
  const filteredWilayas = OFFICIAL_WILAYAS.filter(w =>
    w.nameAr.includes(wilayaSearch) ||
    w.nameFr.toLowerCase().includes(wilayaSearch.toLowerCase()) ||
    w.code.includes(wilayaSearch) ||
    String(w.id) === wilayaSearch
  );

  return (
    <div>
      {/* Wizard Step Progress Tracker */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto px-2">
          {[
            { step: 1, title: 'الشعبة' },
            { step: 2, title: 'الولاية' },
            { step: 3, title: 'المعدل العام' },
            { step: 4, title: 'نقاط المواد' },
            { step: 5, title: 'النتائج والفرص' },
          ].map((item, idx) => (
            <React.Fragment key={item.step}>
              <div
                onClick={() => {
                  if (item.step < currentStep || (report && item.step === 5)) {
                    setCurrentStep(item.step);
                  }
                }}
                className={`flex flex-col items-center cursor-pointer transition-all ${
                  currentStep === item.step
                    ? 'scale-105'
                    : currentStep > item.step
                    ? 'opacity-90'
                    : 'opacity-40'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors ${
                    currentStep === item.step
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/25'
                      : currentStep > item.step
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {currentStep > item.step ? <CheckCircle2 className="w-5 h-5" /> : item.step}
                </div>
                <span className="text-xs font-semibold text-slate-300 mt-1.5 hidden sm:block">
                  {item.title}
                </span>
              </div>

              {idx < 4 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors ${
                    currentStep > item.step ? 'bg-emerald-500/60' : 'bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Wizard Steps Containers */}
      <div className="max-w-4xl mx-auto">
        {/* STEP 1: BAC STREAM */}
        {currentStep === 1 && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl md:text-2xl font-black text-white text-right mb-2">
              الخطوة 1: اختر شعبة البكالوريا الرسمية
            </h2>
            <p className="text-sm text-slate-400 text-right mb-6">
              يحدد المنشور الوزاري الأولوية وشروط كل تخصص بدقة متناهية بناءً على نوع الشعبة.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {OFFICIAL_BAC_STREAMS.map(stream => {
                const isSelected = selectedStream === stream.id;
                return (
                  <button
                    key={stream.id}
                    onClick={() => setSelectedStream(stream.id)}
                    className={`p-5 rounded-2xl border text-right transition-all duration-200 flex flex-col justify-between h-36 ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-500/10 scale-[1.02]'
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                        {stream.code}
                      </span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">{stream.nameAr}</h3>
                      <p className="text-xs text-slate-400 font-sans mt-0.5" dir="ltr">
                        {stream.nameFr}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <span>المتابعة إلى اختيار الولاية</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: WILAYA */}
        {currentStep === 2 && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
            <h2 className="text-xl md:text-2xl font-black text-white text-right mb-2">
              الخطوة 2: حدد ولاية إقامتك / مركز إجراء البكالوريا
            </h2>
            <p className="text-sm text-slate-400 text-right mb-6">
              التسجيل الجامعي في التخصصات الطبية، المعاهد، وبعض الجامعات يخضع لدوائر جغرافية محددة ولائياً وجهوياً.
            </p>

            {/* Search Input for Wilayas */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="ابحث بالاسم أو الرقم (مثال: الجزائر، سطيف، 16)..."
                value={wilayaSearch}
                onChange={e => setWilayaSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-3 pr-11 pl-4 text-white text-sm focus:outline-none focus:border-emerald-500 text-right placeholder-slate-500"
                dir="rtl"
              />
              <Search className="w-5 h-5 text-slate-500 absolute top-3.5 right-4 pointer-events-none" />
            </div>

            {/* Wilayas Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-1 border border-slate-800/80 rounded-2xl bg-slate-950/40">
              {filteredWilayas.map(w => {
                const isSelected = selectedWilaya === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWilaya(w.id)}
                    className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>{w.nameAr}</span>
                    <span className="font-mono text-slate-500 font-semibold">{w.code}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-5 py-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm flex items-center gap-2 border border-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
                <span>الرجوع للشعبة</span>
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <span>المتابعة إلى المعدل العام</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: GENERAL AVERAGE */}
        {currentStep === 3 && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-right">
            <h2 className="text-xl md:text-2xl font-black text-white mb-2">
              الخطوة 3: أدخل المعدل العام المحصل عليه في البكالوريا
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              المعدل العام هو أول شرط قانوني يتم التحقق منه في كل تخصص جامعي.
            </p>

            <div className="p-6 md:p-8 rounded-2xl bg-slate-950/80 border border-slate-800 max-w-lg mx-auto text-center">
              <label className="text-xs text-slate-400 block mb-3 font-semibold">
                المعدل العام (من 00.00 إلى 20.00)
              </label>

              <div className="flex items-center justify-center gap-3 mb-6">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="20"
                  value={generalAverage}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setGeneralAverage(Math.min(20, Math.max(0, val)));
                    } else {
                      setGeneralAverage(0);
                    }
                  }}
                  className="w-36 text-center text-3xl font-black bg-slate-900 border-2 border-emerald-500 rounded-2xl py-3 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
                />
                <span className="text-xl font-bold text-slate-500">/ 20</span>
              </div>

              {/* Slider for smooth interaction */}
              <input
                type="range"
                min="9"
                max="20"
                step="0.05"
                value={generalAverage}
                onChange={e => setGeneralAverage(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />

              <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-mono">
                <span>09.00</span>
                <span>12.00</span>
                <span>15.00</span>
                <span>18.00</span>
                <span>20.00</span>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm flex items-center gap-2 border border-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
                <span>الرجوع للولاية</span>
              </button>

              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <span>متابعة إلى نقاط المواد (اختياري)</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUBJECT GRADES */}
        {currentStep === 4 && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-right">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white">
                  الخطوة 4: نقاط المواد الأساسية (لحساب المعدل الموزون)
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  أغلب التخصصات ذات الاستقطاب الواسع والمدارس العليا تعتمد على <strong className="text-emerald-300">المعدل الموزون</strong> في الترتيب (مثل الطب: الرياضيات، العلوم، الفيزياء | الإعلام الآلي: الرياضيات، الفيزياء).
                </p>
              </div>
              <span className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                حساب رسمي دقيق
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {[
                { key: 'mathematics', label: 'الرياضيات', streams: ['sciences_exp', 'math', 'technique_math', 'gestion_eco'] },
                { key: 'physics', label: 'العلوم الفيزيائية', streams: ['sciences_exp', 'math', 'technique_math'] },
                { key: 'naturalSciences', label: 'علوم الطبيعة والحياة', streams: ['sciences_exp', 'math'] },
                { key: 'arabic', label: 'اللغة العربية وآدابها', streams: ['lettres_philo', 'langues_etrangeres', 'sciences_exp', 'math', 'technique_math', 'gestion_eco'] },
                { key: 'english', label: 'اللغة الإنجليزية', streams: ['langues_etrangeres', 'lettres_philo', 'sciences_exp', 'math', 'technique_math', 'gestion_eco'] },
                { key: 'french', label: 'اللغة الفرنسية', streams: ['langues_etrangeres', 'lettres_philo', 'sciences_exp', 'math', 'technique_math', 'gestion_eco'] },
                { key: 'philosophy', label: 'الفلسفة', streams: ['lettres_philo'] },
                { key: 'accounting', label: 'التسيير المحاسبي والمالي', streams: ['gestion_eco'] },
              ]
                .filter(item => item.streams.includes(selectedStream))
                .map(item => {
                  const val = grades[item.key as keyof typeof grades] ?? '';
                  return (
                    <div
                      key={item.key}
                      className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800"
                    >
                      <label className="text-xs font-bold text-slate-300 block mb-2">
                        {item.label}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          max="20"
                          placeholder="مثال: 15.5"
                          value={val}
                          onChange={e => {
                            const num = parseFloat(e.target.value);
                            setGrades(prev => ({
                              ...prev,
                              [item.key]: isNaN(num) ? undefined : Math.min(20, Math.max(0, num)),
                            }));
                          }}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-white text-sm focus:outline-none focus:border-emerald-500 text-center font-bold"
                        />
                        <span className="text-xs text-slate-500 font-semibold">/20</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 rounded-2xl bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm flex items-center gap-2 border border-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
                <span>الرجوع للمعدل</span>
              </button>

              <button
                onClick={handleEvaluate}
                disabled={loading}
                className="px-8 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center gap-2.5 shadow-xl shadow-emerald-500/25 transition-all disabled:opacity-50"
              >
                <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: loading ? '1s' : '0s' }} />
                <span>{loading ? 'جاري تحليل المنشور الوزاري...' : 'فحص الأهلية واستخراج الفرص'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: RESULTS & EVALUATION REPORT */}
        {currentStep === 5 && report && (
          <div className="space-y-6">
            {/* Summary Counters Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-right">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
                    <Sparkles className="w-6 h-6 text-emerald-400" />
                    <span>تقرير التوجيه واستكشاف الفرص الجامعية</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    الشعبة: <strong className="text-white">{report.studentProfile.streamId}</strong> • الولاية: <strong className="text-white">{report.studentProfile.wilayaId}</strong> • المعدل العام: <strong className="text-white">{report.studentProfile.generalAverage.toFixed(2)}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تعديل المعطيات</span>
                </button>
              </div>

              {/* Counter Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div
                  onClick={() => setStatusFilter('ELIGIBLE')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    statusFilter === 'ELIGIBLE'
                      ? 'bg-emerald-500/20 border-emerald-500 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl font-black text-emerald-400 block">
                    {report.eligibleCount}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">مؤهل قانوناً للترشح</span>
                </div>

                <div
                  onClick={() => setStatusFilter('CONDITIONAL')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    statusFilter === 'CONDITIONAL'
                      ? 'bg-cyan-500/20 border-cyan-500 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl font-black text-cyan-400 block">
                    {report.conditionalCount}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">مؤهل بشروط (مقابلة/فحص)</span>
                </div>

                <div
                  onClick={() => setStatusFilter('UNKNOWN')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    statusFilter === 'UNKNOWN'
                      ? 'bg-amber-500/20 border-amber-500 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl font-black text-amber-400 block">
                    {report.unknownCount}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">بحاجة لنقاط المواد</span>
                </div>

                <div
                  onClick={() => setStatusFilter('NOT_ELIGIBLE')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    statusFilter === 'NOT_ELIGIBLE'
                      ? 'bg-rose-500/20 border-rose-500 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-2xl font-black text-rose-400 block">
                    {report.notEligibleCount}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">غير مؤهل</span>
                </div>
              </div>

              {/* Official Legal Disclaimer Banner */}
              <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-right flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <strong className="block text-amber-300 mb-0.5 font-bold">
                    تنبيه نظام التوجيه الجزائري (المصدر: المنشور الوزاري 2026):
                  </strong>
                  الأهلية للترشح تمنحك الحق في تدوين الرغبة في بطاقة الرغبات الرسمية، لكن القبول النهائي يخضع للترتيب التنافسي المباشر بحسب المقاعد البيداغوجية المتوفرة وطلبات حاملي شهادة البكالوريا الجدد.
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                {[
                  { key: 'ALL', label: 'جميع التخصصات' },
                  { key: 'ELIGIBLE', label: 'مؤهل للترشح' },
                  { key: 'CONDITIONAL', label: 'مؤهل بشروط' },
                  { key: 'UNKNOWN', label: 'بحاجة لنقاط' },
                  { key: 'NOT_ELIGIBLE', label: 'غير مؤهل' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      statusFilter === f.key
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search in results */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="بحث في النتائج..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pr-9 pl-3 text-white text-xs focus:outline-none focus:border-emerald-500 text-right placeholder-slate-500"
                  dir="rtl"
                />
                <Search className="w-4 h-4 text-slate-500 absolute top-2.5 right-3 pointer-events-none" />
              </div>
            </div>

            {/* Results Grid */}
            <div className="space-y-4">
              {report.programs
                .filter(p => {
                  if (statusFilter !== 'ALL' && p.eligibilityStatus !== statusFilter) return false;
                  if (searchQuery) {
                    const q = searchQuery.toLowerCase();
                    return (
                      p.program.nameAr.toLowerCase().includes(q) ||
                      p.institutionOffer.institution.nameAr.toLowerCase().includes(q) ||
                      p.program.programCode.includes(q)
                    );
                  }
                  return true;
                })
                .map((evalResult, idx) => (
                  <ProgramEvaluationCard
                    key={`${evalResult.program.id}-${evalResult.institutionOffer.institution.id}-${idx}`}
                    evaluation={evalResult}
                    onViewDetails={p => setSelectedProgramForModal(p)}
                    onToggleCompare={p => onToggleCompare(p)}
                    isCompared={comparedProgramIds.includes(evalResult.program.id)}
                  />
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Program Detail Modal */}
      <ProgramDetailModal
        program={selectedProgramForModal}
        onClose={() => setSelectedProgramForModal(null)}
      />
    </div>
  );
};
