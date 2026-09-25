'use client';

import React, { useState, useEffect } from 'react';
import { 
  Compass, 
  Calculator, 
  Sparkles, 
  CheckCircle,
  GraduationCap,
  Building2,
  TrendingUp,
  ArrowDown
} from 'lucide-react';

interface OrientationHeroModernProps {
  onScrollToCalculator: () => void;
  onScrollToExplore: () => void;
  onSelectCategory?: (categoryId: string) => void;
}

const ROTATING_SPECIALTIES = [
  { name: 'إعلام آلي وذكاء اصطناعي (ESI / ENSIA)', icon: '💻', badge: 'مطلوب جداً' },
  { name: 'العلوم الطبية (طب • صيدلة • طب أسنان)', icon: '🎓', badge: 'معدل موزون' },
  { name: 'المدارس الوطنية العليا للمهندسين (ENP)', icon: '⚙️', badge: 'أولوية 1' },
  { name: 'هندسة معمارية وعمران (EPAU)', icon: '📐', badge: 'معدل موزون' },
  { name: 'علوم اقتصادية، تسيير وعلوم تجارية', icon: '📊', badge: 'تسجيل وطني/محلي' },
  { name: 'علوم المادة، بيولوجيا وتكنولوجيا (ST / SNV)', icon: '🧬', badge: 'آفاق واعدة' },
  { name: 'مدارس عليا للأساتذة (ENS)', icon: '📚', badge: 'توظيف مباشر' },
  { name: 'حقوق ولغات أجنبية وترجمة', icon: '🌍', badge: 'تكوين أكاديمي' },
];

export const EXPLORE_CATEGORIES = [
  { id: 'MED', nameAr: 'طب وصحة', icon: '🎓' },
  { id: 'INFO_AI', nameAr: 'إعلام آلي وذكاء اصطناعي', icon: '💻' },
  { id: 'TECH', nameAr: 'هندسة وتقنيات', icon: '⚙️' },
  { id: 'ARCHI', nameAr: 'عمارة وعمران', icon: '📐' },
  { id: 'ECON', nameAr: 'اقتصاد وتسيير', icon: '📊' },
  { id: 'LAW', nameAr: 'حقوق وعلوم قانونية', icon: '⚖️' },
  { id: 'SNV', nameAr: 'علوم وبيولوجيا', icon: '🧬' },
  { id: 'LANG', nameAr: 'لغات وترجمة', icon: '🌍' },
  { id: 'HUMAN', nameAr: 'مدارس عليا وأساتذة', icon: '📚' },
];

export const OrientationHeroModern: React.FC<OrientationHeroModernProps> = ({
  onScrollToCalculator,
  onScrollToExplore,
}) => {
  const [specialtyIndex, setSpecialtyIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSpecialtyIndex(prev => (prev + 1) % ROTATING_SPECIALTIES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const currentSpecialty = ROTATING_SPECIALTIES[specialtyIndex];

  return (
    <header className="pt-6 pb-6 px-4 sm:px-6 max-w-5xl mx-auto text-center" dir="rtl">
      {/* Trust pill */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs font-semibold mb-3 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>منشور التوجيه الوزاري الرسمي 2026/2027</span>
        <span className="text-emerald-300">•</span>
        <span className="text-emerald-800 font-bold">حساب فوري مجاني 100%</span>
      </div>

      {/* Main Title & Value Prop */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-2.5">
        واش نقدر نقرا؟
      </h1>

      <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-4">
        احسب معدلك، اكتشف التخصصات اللي تناسب شعبتك وعلاماتك، وشوف شروط القبول والعتبات في جامعات الجزائر.
      </p>

      {/* Rotating Specialty Highlight Bar (Compact, dynamic & sleek) */}
      <div className="max-w-xl mx-auto mb-5 p-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 px-2 text-xs font-bold text-slate-500 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="hidden sm:inline">من التخصصات المتاحة:</span>
        </div>
        
        <div 
          key={currentSpecialty.name}
          className="flex-1 flex items-center justify-between gap-2 py-1 px-2.5 rounded-xl bg-teal-50/70 border border-teal-200/60 text-xs font-bold text-teal-950 animate-in fade-in slide-in-from-bottom-1 duration-300"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-base">{currentSpecialty.icon}</span>
            <span className="truncate">{currentSpecialty.name}</span>
          </div>
          <span className="text-[10px] font-semibold text-teal-700 bg-white/80 px-2 py-0.5 rounded-md shrink-0">
            {currentSpecialty.badge}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onScrollToCalculator}
          className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Calculator className="w-4 h-4" />
          <span>احسب معدلي</span>
        </button>

        <button
          onClick={onScrollToExplore}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200/90 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Compass className="w-4 h-4 text-teal-600" />
          <span>استكشاف التخصصات مباشرة</span>
        </button>
      </div>
    </header>
  );
};
