'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AppShell } from '@/components/ui/AppShell';
import { OrientationHeroModern } from '@/components/orientation/OrientationHeroModern';
import { SmartGradeCalculator } from '@/components/orientation/SmartGradeCalculator';
import { OrientationTableView } from '@/components/orientation/OrientationTableView';
import { OrientationExploreView } from '@/components/orientation/OrientationExploreView';
import { StudyAbroadView } from '@/components/orientation/StudyAbroadView';
import { ProgramComparisonModal } from '@/components/orientation/ProgramComparisonModal';
import { ProgramDetailModal } from '@/components/orientation/ProgramDetailModal';
import { ShareResultModal } from '@/components/orientation/ShareResultModal';
import { SoftShaterCta } from '@/components/orientation/SoftShaterCta';
import { 
  Program, 
  OrientationReport, 
  BacStreamCode, 
  StudentBacProfile 
} from '@/types/orientation';
import { trackEvent, trackProductEvent } from '@/lib/analytics';
import { Scale, ArrowRight, Sparkles, Globe, Building2, LayoutList, LayoutGrid } from 'lucide-react';

export default function OrientationPage() {
  const [activeTab, setActiveTab] = useState<'NATIONAL' | 'ABROAD'>('NATIONAL');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');
  const [report, setReport] = useState<OrientationReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [comparedPrograms, setComparedPrograms] = useState<Program[]>([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState<boolean>(false);
  const [selectedProgramForModal, setSelectedProgramForModal] = useState<Program | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const calculatorRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);

  // Track initial page view
  useEffect(() => {
    trackProductEvent('orientation_opened', {});
    trackEvent('orientation_started', {});
  }, []);

  // Fetch initial orientation evaluation so Explore section is immediately populated
  const evaluateProfile = async (profile: {
    streamId: BacStreamCode;
    wilayaId: number;
    generalAverage: number;
    grades?: Record<string, number>;
  }) => {
    setIsLoading(true);
    try {
      const payload: StudentBacProfile = {
        streamId: profile.streamId,
        wilayaId: profile.wilayaId,
        generalAverage: profile.generalAverage,
        grades: profile.grades || {},
      };

      const res = await fetch('/api/orientation/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Evaluation check failed');
      }

      const data: OrientationReport = await res.json();
      setReport(data);
      trackEvent('orientation_results_viewed', {
        streamId: profile.streamId,
        average: profile.generalAverage,
        totalPrograms: data.totalEvaluated,
        eligibleCount: data.eligibleCount,
      });
    } catch (err) {
      console.error('Error evaluating orientation profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial evaluation on mount with default profile (sciences_exp, 14.72, Alger)
  useEffect(() => {
    evaluateProfile({
      streamId: 'sciences_exp',
      wilayaId: 16,
      generalAverage: 14.72,
    });
  }, []);

  const handleScrollToCalculator = () => {
    if (activeTab !== 'NATIONAL') {
      setActiveTab('NATIONAL');
    }
    setTimeout(() => {
      const el = document.getElementById('calculator');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleScrollToExplore = () => {
    if (activeTab !== 'NATIONAL') {
      setActiveTab('NATIONAL');
    }
    setTimeout(() => {
      const el = document.getElementById('results');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Toggle program in comparison tray
  const handleToggleCompare = (program: Program) => {
    setComparedPrograms(prev => {
      const exists = prev.some(p => p.id === program.id);
      if (exists) {
        return prev.filter(p => p.id !== program.id);
      } else {
        if (prev.length >= 3) {
          alert('يمكنك مقارنة 3 تخصصات كحد أقصى في نفس الوقت.');
          return prev;
        }
        trackEvent('orientation_compare', { programId: program.id });
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
    <AppShell activeNav="orientation" showSidebar={false} noPadding={true}>
      <div className="min-h-screen bg-[#F7F3EA] text-[#0F172A] pb-28" dir="rtl">
        
        {/* Hero Section */}
        <OrientationHeroModern
          onScrollToCalculator={handleScrollToCalculator}
          onScrollToExplore={handleScrollToExplore}
          onSelectCategory={(catId) => {
            handleScrollToExplore();
          }}
        />

        {/* Section Navigation Tabs: Algerian Universities vs Study Abroad */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-6">
          <div className="bg-white p-1.5 rounded-2xl border border-[#E4DED2] shadow-xs flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('NATIONAL')}
              className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'NATIONAL'
                  ? 'bg-[#1E3A34] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E3A34] hover:bg-[#FAF8F5]'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#5F8F86]" />
              <span>الجامعات والتخصصات الجزائرية (التوجيه الوطني)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('ABROAD');
                trackEvent('orientation_started', { mode: 'abroad' });
              }}
              className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'ABROAD'
                  ? 'bg-[#1E3A34] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E3A34] hover:bg-[#FAF8F5]'
              }`}
            >
              <Globe className="w-4 h-4 text-[#D7A66A]" />
              <span>الدراسة في الخارج للطلبة الجزائريين ($ USD)</span>
            </button>
          </div>
        </div>

        {activeTab === 'NATIONAL' ? (
          <>
            {/* Step 1 & 2: Smart Grade Calculator */}
            <div ref={calculatorRef}>
              <SmartGradeCalculator
                onEvaluate={async (profile) => {
                  await evaluateProfile(profile);
                }}
                isLoading={isLoading}
              />
            </div>

            {/* View Mode Switcher: Interactive Table (Default) vs Grid Cards */}
            {report && (
              <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[#64748B]">
                  نمط عرض التخصصات:
                </span>
                <div className="bg-white border border-[#E4DED2] p-1 rounded-xl flex items-center gap-1 text-xs shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setViewMode('TABLE')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'TABLE'
                        ? 'bg-[#2C5E54] text-white shadow-2xs'
                        : 'text-[#64748B] hover:text-[#1E3A34]'
                    }`}
                  >
                    <LayoutList className="w-3.5 h-3.5" />
                    <span>جدول تفاعلي (موسع)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('CARDS')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      viewMode === 'CARDS'
                        ? 'bg-[#2C5E54] text-white shadow-2xs'
                        : 'text-[#64748B] hover:text-[#1E3A34]'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>بطاقات شبكية</span>
                  </button>
                </div>
              </div>
            )}

            {/* Results Section */}
            <div ref={exploreRef}>
              {report && (
                viewMode === 'TABLE' ? (
                  <OrientationTableView
                    report={report}
                    onToggleCompare={handleToggleCompare}
                    comparedProgramIds={comparedPrograms.map(p => p.id)}
                    onViewDetails={(program) => {
                      setSelectedProgramForModal(program);
                      trackEvent('orientation_program_clicked', { programId: program.id });
                    }}
                    onOpenShareModal={() => setIsShareModalOpen(true)}
                  />
                ) : (
                  <OrientationExploreView
                    report={report}
                    onToggleCompare={handleToggleCompare}
                    comparedProgramIds={comparedPrograms.map(p => p.id)}
                    onViewDetails={(program) => {
                      setSelectedProgramForModal(program);
                      trackEvent('orientation_program_clicked', { programId: program.id });
                    }}
                    onOpenShareModal={() => setIsShareModalOpen(true)}
                  />
                )
              )}
            </div>
          </>
        ) : (
          /* Study Abroad Section */
          <div className="pt-2 animate-in fade-in duration-300">
            <StudyAbroadView />
          </div>
        )}

        {/* Soft Shater Conversion Section */}
        <SoftShaterCta />

        {/* Sticky Floating Comparison Tray */}
        {comparedPrograms.length > 0 && !isComparisonModalOpen && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-in slide-in-from-bottom duration-300">
            <div className="bg-[#1E3A34] text-white border border-[#2C5E54] rounded-2xl p-3.5 shadow-elevated flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 text-[#AFC8BD]">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    تم تحديد {comparedPrograms.length} تخصصات للمقارنة
                  </span>
                  <span className="text-[11px] text-[#AFC8BD]">
                    {comparedPrograms.map(p => p.nameAr).join(' • ').slice(0, 42)}...
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsComparisonModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#5F8F86] hover:bg-[#527D75] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <span>عرض المقارنة</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleClearCompare}
                  className="px-2.5 py-2 rounded-xl text-[#AFC8BD] hover:text-[#C8796B] text-xs transition-colors cursor-pointer"
                  title="إلغاء الكل"
                >
                  مسح
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Program Comparison Modal */}
        <ProgramComparisonModal
          programs={comparedPrograms}
          onRemove={handleRemoveCompare}
          onClear={handleClearCompare}
          onClose={() => setIsComparisonModalOpen(false)}
        />

        {/* Program Details Modal */}
        <ProgramDetailModal
          program={selectedProgramForModal}
          onClose={() => setSelectedProgramForModal(null)}
        />

        {/* Share Result Modal */}
        {report && (
          <ShareResultModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            average={report.studentProfile.generalAverage}
            streamNameAr={report.studentProfile.streamId === 'sciences_exp' ? 'علوم تجريبية' : report.studentProfile.streamId}
            availableProgramsCount={report.totalEvaluated}
          />
        )}
      </div>
    </AppShell>
  );
}
