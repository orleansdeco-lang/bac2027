'use client';

import React from 'react';
import { Compass, ShieldCheck, Scale, Sparkles, BookOpen } from 'lucide-react';
import { OFFICIAL_ORIENTATION_YEAR } from '@/lib/orientation/orientation-engine';

interface OrientationHeroProps {
  activeTab: 'wizard' | 'directory' | 'compare';
  onTabChange: (tab: 'wizard' | 'directory' | 'compare') => void;
  compareCount: number;
}

export const OrientationHero: React.FC<OrientationHeroProps> = ({
  activeTab,
  onTabChange,
  compareCount,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-950 p-6 md:p-8 border border-emerald-500/20 shadow-2xl mb-8">
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>المنشور الوزاري الرسمي لتوجيه حاملي البكالوريا {OFFICIAL_ORIENTATION_YEAR}</span>
          </div>

          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <Compass className="w-8 h-8 md:w-10 md:h-10 text-emerald-400 animate-pulse" />
            <span>مستكشف التوجيه الجامعي الجزائري</span>
          </h1>

          <p className="mt-2 text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
            محرك التوجيه الرسمي الذكي المبني وفق نصوص منشور وزارة التعليم العالي والبحث العلمي (MESRS). 
            اكتشف التخصصات المؤهل لها، وافهم الفارق الجوهري بين <strong className="text-emerald-300">الأهلية للترشح</strong> و<strong className="text-amber-300">معدل القبول التنافسي</strong>، مع حساب دقيق للمعدلات الموزونة لكل تخصص.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <span>معدلات موزونة ديناميكية (Dynamic Formulas)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>تغطية 58 ولاية + تسجيل وطني وجهوي</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>معدلات القبول السابقة 2024 و 2025</span>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0">
          <button
            onClick={() => onTabChange('wizard')}
            className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 border ${
              activeTab === 'wizard'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>فاحص الأهلية والفرص (المعالج)</span>
          </button>

          <button
            onClick={() => onTabChange('directory')}
            className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 border ${
              activeTab === 'directory'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>دليل التخصصات والمدارس</span>
          </button>

          <button
            onClick={() => onTabChange('compare')}
            className={`relative px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2.5 border ${
              activeTab === 'compare'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/70 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>مقارنة التخصصات</span>
            {compareCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full bg-emerald-400 text-slate-950">
                {compareCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
