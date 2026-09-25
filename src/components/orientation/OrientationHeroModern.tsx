'use client';

import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Calculator, 
  ArrowDown, 
  Sparkles, 
  CheckCircle,
  GraduationCap,
  Building2,
  TrendingUp,
  Search
} from 'lucide-react';

interface OrientationHeroModernProps {
  onScrollToCalculator: () => void;
  onScrollToExplore: () => void;
  onSelectCategory?: (categoryId: string) => void;
}

const ROTATING_SPECIALTIES = [
  { name: 'Informatique & IA', icon: '💻', color: 'text-teal-700 bg-teal-50 border-teal-200' },
  { name: 'Médecine & Santé', icon: '🎓', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { name: 'Architecture (EPAU)', icon: '📐', color: 'text-amber-800 bg-amber-50 border-amber-200' },
  { name: 'Grandes Écoles (ENP)', icon: '⚙️', color: 'text-stone-800 bg-stone-100 border-stone-300' },
  { name: 'Économie & Finance', icon: '📊', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
  { name: 'Droit & Sciences Po', icon: '⚖️', color: 'text-stone-800 bg-stone-100 border-stone-300' },
  { name: 'Sciences Naturelles (SNV)', icon: '🧬', color: 'text-teal-800 bg-teal-50 border-teal-200' },
  { name: 'Langues & Traduction', icon: '🌍', color: 'text-cyan-800 bg-cyan-50 border-cyan-200' },
];

export const EXPLORE_CATEGORIES = [
  { id: 'MED', nameAr: 'طب وصحة', icon: '🎓', desc: 'طب عام، صيدلة، طب أسنان' },
  { id: 'INFO_AI', nameAr: 'إعلام آلي وذكاء اصطناعي', icon: '💻', desc: 'ESI، ENSIA، مهندس، ليسانس' },
  { id: 'TECH', nameAr: 'هندسة وتقنيات', icon: '⚙️', desc: 'ENP، مدارس عليا متعددة التقنيات' },
  { id: 'ARCHI', nameAr: 'عمارة وعمران', icon: '📐', desc: 'EPAU، هندسة معمارية' },
  { id: 'ECON', nameAr: 'اقتصاد وتسيير', icon: '📊', desc: 'ESC، تجارة، إدارة أعمال' },
  { id: 'LAW', nameAr: 'حقوق وعلوم قانونية', icon: '⚖️', desc: 'قانون، علوم سياسية وإدارية' },
  { id: 'SNV', nameAr: 'علوم وبيولوجيا', icon: '🧬', desc: 'بيولوجيا، تكنولوجيا حيوية' },
  { id: 'LANG', nameAr: 'لغات أجنبية', icon: '🌍', desc: 'إنجليزية، فرنسية، ترجمة' },
  { id: 'HUMAN', nameAr: 'علوم إنسانية وأساتذة', icon: '📚', desc: 'ENS القبة، فلسفة، تاريخ' },
];

export const OrientationHeroModern: React.FC<OrientationHeroModernProps> = ({
  onScrollToCalculator,
  onScrollToExplore,
  onSelectCategory,
}) => {
  const [specialtyIndex, setSpecialtyIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSpecialtyIndex(prev => (prev + 1) % ROTATING_SPECIALTIES.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const currentSpecialty = ROTATING_SPECIALTIES[specialtyIndex];

  return (
    <header className="relative pt-6 pb-12 md:py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center" dir="rtl">
      {/* Subtle Warm Accent Background Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Trust pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200 shadow-xs text-stone-700 text-xs font-medium mb-6 animate-in fade-in duration-500">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>أداة ذكية مجانية — بدون تسجيل مسبق</span>
        <span className="text-stone-300">•</span>
        <span className="text-teal-700 font-semibold">توجيه بكالوريا الجزائر</span>
      </div>

      {/* Main Title */}
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.2] mb-4">
        واش نقدر نقرا؟
      </h1>

      {/* Subtitle */}
      <p className="text-base sm:text-lg lg:text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
        دخل نقاطك، واحنا نعاونك تكتشف عالم التخصصات اللي قدامك، وتعرف الشروط والمعدلات الموزونة المعتمدة.
      </p>

      {/* Interactive Visual Element */}
      <div className="max-w-md mx-auto mb-10 p-5 rounded-2xl bg-white border border-stone-200/80 shadow-md">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-3">
          <span className="text-xs font-semibold text-stone-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>محاكاة معدل البكالوريا</span>
          </span>
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
            حساب فوري
          </span>
        </div>

        <div className="flex items-center justify-center gap-4 my-2">
          <div className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight">
            14.72
          </div>
          <div className="text-right">
            <span className="text-xs text-stone-400 block font-medium">من 20</span>
            <span className="text-xs font-bold text-teal-700 block">شعبة علوم تجريبية</span>
          </div>
        </div>

        {/* Dynamic Rotating Tag */}
        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
          <span className="text-xs text-stone-500 font-medium">تخصصات تتناسب مع نتيجتك:</span>
          <div
            key={currentSpecialty.name}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all duration-300 animate-in fade-in slide-in-from-bottom-1 ${currentSpecialty.color}`}
          >
            <span>{currentSpecialty.icon}</span>
            <span>{currentSpecialty.name}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-14">
        <button
          onClick={onScrollToCalculator}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-base shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Calculator className="w-5 h-5" />
          <span>نحسب معدلي</span>
        </button>

        <button
          onClick={onScrollToExplore}
          className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-stone-100 hover:bg-stone-200/80 text-stone-800 font-bold text-base border border-stone-200/80 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Compass className="w-5 h-5 text-stone-600" />
          <span>نستكشف التخصصات</span>
        </button>
      </div>

      {/* Quick Category Badges Section ("اكتشف أكثر") */}
      <div className="pt-6 border-t border-stone-200/70">
        <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
          اكتشف أكثر حسب الميدان العلمي
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {EXPLORE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory?.(cat.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-200/80 text-xs font-medium text-stone-700 shadow-2xs hover:border-stone-300 transition-all cursor-pointer"
            >
              <span>{cat.icon}</span>
              <span>{cat.nameAr}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
