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
  { name: 'علوم اقتصادية، تسيير وعلوم تجارية (ESC)', icon: '📊', badge: 'تسجيل وطني/جهوي' },
  { name: 'علوم المادة، بيولوجيا وتكنولوجيا (ST / SNV)', icon: '🧬', badge: 'آفاق واعدة' },
  { name: 'مدارس عليا للأساتذة (ENS)', icon: '📚', badge: 'توظيف مباشر' },
  { name: 'حقوق، لغات أجنبية وترجمة', icon: '🌍', badge: 'تكوين أكاديمي' },
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
    <header className="relative pt-6 pb-6 px-4 sm:px-6 max-w-5xl mx-auto text-center" dir="rtl">
      {/* Soft warm ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-40 bg-[#5F8F86]/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Trust pill with SHATER warm branding */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#E4DED2] text-[#2C5E54] text-xs font-semibold mb-3 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-[#5F8F86] animate-pulse" />
        <span>منشور التوجيه الوزاري الرسمي 2026/2027</span>
        <span className="text-[#AFC8BD]">•</span>
        <span className="text-[#1E3A34] font-bold">أداة مجانية 100% بدون تسجيل</span>
      </div>

      {/* Main Title & Value Prop */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1E3A34] tracking-tight leading-tight mb-2.5">
        واش نقدر نقرا؟
      </h1>

      <p className="text-sm sm:text-base text-[#475569] max-w-2xl mx-auto leading-relaxed mb-4 font-normal">
        احسب معدلك، اكتشف التخصصات اللي تناسب شعبتك وعلاماتك، وتعرف على شروط القبول والمعدلات الموزونة في جامعات الجزائر.
      </p>

      {/* Rotating Specialty Highlight Bar (Warm, soothing, harmonious) */}
      <div className="max-w-xl mx-auto mb-5 p-1.5 rounded-2xl bg-white border border-[#E4DED2] shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 px-2.5 text-xs font-bold text-[#527D75] shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-[#D7A66A]" />
          <span className="hidden sm:inline">أبرز التخصصات المتاحة:</span>
        </div>
        
        <div 
          key={currentSpecialty.name}
          className="flex-1 flex items-center justify-between gap-2 py-1 px-3 rounded-xl bg-[#F7F3EA] border border-[#E4DED2] text-xs font-bold text-[#1E3A34] animate-in fade-in slide-in-from-bottom-1 duration-300"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="text-base">{currentSpecialty.icon}</span>
            <span className="truncate">{currentSpecialty.name}</span>
          </div>
          <span className="text-[10px] font-semibold text-[#2C5E54] bg-white px-2 py-0.5 rounded-md border border-[#E4DED2] shrink-0">
            {currentSpecialty.badge}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onScrollToCalculator}
          className="px-5 py-2.5 rounded-xl bg-[#2C5E54] hover:bg-[#234B43] text-white font-bold text-xs sm:text-sm shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Calculator className="w-4 h-4 text-[#AFC8BD]" />
          <span>احسب معدلي</span>
        </button>

        <button
          onClick={onScrollToExplore}
          className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#F7F3EA] text-[#1E3A34] font-bold text-xs sm:text-sm border border-[#E4DED2] shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Compass className="w-4 h-4 text-[#5F8F86]" />
          <span>استكشاف التخصصات مباشرة</span>
        </button>
      </div>
    </header>
  );
};
