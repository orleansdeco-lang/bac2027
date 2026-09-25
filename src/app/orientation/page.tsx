'use client';

import React, { useState } from 'react';
import { Scale, ArrowRight, ShieldCheck, Compass } from 'lucide-react';
import { Program } from '@/types/orientation';
import { AppShell } from '@/components/ui/AppShell';
import { OrientationHero } from '@/components/orientation/OrientationHero';
import { OrientationWizard } from '@/components/orientation/OrientationWizard';
import { OrientationDirectory } from '@/components/orientation/OrientationDirectory';
import { ProgramComparisonModal } from '@/components/orientation/ProgramComparisonModal';

export default function OrientationPage() {
  const [activeTab, setActiveTab] = useState<'wizard' | 'directory' | 'compare'>('wizard');
  const [comparedPrograms, setComparedPrograms] = useState<Program[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState<boolean>(false);

  // Toggle program in comparison tray
  const handleToggleCompare = (program: Program) => {
    setComparedPrograms(prev => {
      const exists = prev.some(p => p.id === program.id);
      if (exists) {
        return prev.filter(p => p.id !== program.id);
      } else {
        if (prev.length >= 4) {
          alert('يمكنك مقارنة 4 تخصصات كحد أقصى في نفس الوقت.');
          return prev;
        }
        return [...prev, program];
      }
    });
  };

  const handleRemoveCompare = (programId: string) => {
    setComparedPrograms(prev => prev.filter(p => p.id !== programId));
  };

  const handleClearCompare = () => {
    setComparedPrograms([]);
    setIsComparisonModalOpen(false);
  };

  return (
    <AppShell activeNav="orientation">
      <div className="min-h-screen text-slate-100 pb-28 pt-2" dir="rtl">
        <div className="max-w-7xl mx-auto">
        {/* Hero Section & Tab Switcher */}
        <OrientationHero
          activeTab={activeTab}
          onTabChange={tab => {
            if (tab === 'compare') {
              if (comparedPrograms.length === 0) {
                alert('يرجى اختيار تخصصين على الأقل لإجراء المقارنة.');
                return;
              }
              setIsComparisonModalOpen(true);
            } else {
              setActiveTab(tab);
            }
          }}
          compareCount={comparedPrograms.length}
        />

        {/* Tab 1: Interactive Assessment Wizard */}
        {activeTab === 'wizard' && (
          <OrientationWizard
            onToggleCompare={handleToggleCompare}
            comparedProgramIds={comparedPrograms.map(p => p.id)}
          />
        )}

        {/* Tab 2: Directory & Search */}
        {activeTab === 'directory' && (
          <OrientationDirectory
            onToggleCompare={handleToggleCompare}
            comparedProgramIds={comparedPrograms.map(p => p.id)}
          />
        )}

        {/* Sticky Floating Comparison Bar if items selected */}
        {comparedPrograms.length > 0 && !isComparisonModalOpen && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-in slide-in-from-bottom duration-300">
            <div className="bg-slate-900/95 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    تم تحديد {comparedPrograms.length} تخصصات للمقارنة
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {comparedPrograms.map(p => p.nameAr).join(' • ').slice(0, 45)}...
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsComparisonModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
                >
                  <span>عرض المقارنة</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleClearCompare}
                  className="px-2.5 py-2 rounded-xl text-slate-400 hover:text-rose-400 text-xs transition-colors"
                  title="إلغاء الكل"
                >
                  مسح
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Modal */}
        <ProgramComparisonModal
          programs={comparedPrograms}
          onRemove={handleRemoveCompare}
          onClear={handleClearCompare}
          onClose={() => setIsComparisonModalOpen(false)}
        />
        </div>
      </div>
    </AppShell>
  );
}
