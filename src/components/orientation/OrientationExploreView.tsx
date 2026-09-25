'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Filter, 
  Check, 
  Sparkles, 
  X, 
  GraduationCap,
  Building2,
  Share2,
  ArrowUpDown
} from 'lucide-react';
import { 
  ProgramEvaluationResult, 
  Program, 
  OrientationReport,
  BacStreamCode 
} from '@/types/orientation';
import { OFFICIAL_WILAYAS } from '@/lib/orientation/data/wilayas';
import { BAC_STREAMS_CONFIG } from '@/lib/orientation/data/calculator-config';
import { EXPLORE_CATEGORIES } from './OrientationHeroModern';
import { ProgramEvaluationCard } from './ProgramEvaluationCard';
import { trackEvent } from '@/lib/analytics';

interface OrientationExploreViewProps {
  report: OrientationReport;
  onToggleCompare: (program: Program) => void;
  comparedProgramIds: string[];
  onViewDetails: (program: Program) => void;
  onOpenShareModal: () => void;
}

export const OrientationExploreView: React.FC<OrientationExploreViewProps> = ({
  report,
  onToggleCompare,
  comparedProgramIds,
  onViewDetails,
  onOpenShareModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocationScope, setSelectedLocationScope] = useState<'all' | 'my_wilaya' | 'other'>('all');
  const [otherWilayaId, setOtherWilayaId] = useState<number>(16);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ELIGIBLE' | 'CONDITIONAL' | 'COMPETITIVE'>('ALL');
  const [sortBy, setSortBy] = useState<'RELEVANCE' | 'SCORE_DESC' | 'ALPHABETICAL'>('RELEVANCE');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const student = report.studentProfile;
  const streamInfo = BAC_STREAMS_CONFIG[student.streamId as BacStreamCode];
  const userWilaya = OFFICIAL_WILAYAS.find(w => w.id === student.wilayaId);

  // Filtered programs
  const filteredPrograms = useMemo(() => {
    let list = [...report.programs];

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(p => 
        p.program.nameAr.toLowerCase().includes(q) ||
        p.program.nameFr?.toLowerCase().includes(q) ||
        p.institutionOffer.institution.nameAr.toLowerCase().includes(q) ||
        p.program.specialtyAr?.toLowerCase().includes(q) ||
        p.program.programCode.includes(q)
      );
    }

    // 2. Category filter
    if (selectedCategory !== 'ALL') {
      list = list.filter(p => {
        const field = p.program.fieldId?.toUpperCase();
        if (selectedCategory === 'MED') return field === 'MED';
        if (selectedCategory === 'INFO_AI') return p.program.programCode === '071' || p.program.programCode === '072' || p.program.programCode === '041';
        if (selectedCategory === 'TECH') return p.program.programCode === '081' || field === 'ST';
        if (selectedCategory === 'ARCHI') return p.program.programCode === '083';
        if (selectedCategory === 'ECON') return field === 'SEGC' || p.program.programCode === '031' || p.program.programCode === '032';
        if (selectedCategory === 'LAW') return p.program.programCode === '021';
        if (selectedCategory === 'SNV') return field === 'SNV' || p.program.programCode === '061';
        if (selectedCategory === 'LANG') return p.program.programCode === '025';
        if (selectedCategory === 'HUMAN') return p.program.programCode === '091';
        return true;
      });
    }

    // 3. Location filter
    if (selectedLocationScope === 'my_wilaya') {
      list = list.filter(p => {
        if (p.institutionOffer.registrationScope === 'national') return true;
        return p.institutionOffer.eligibleWilayas?.includes(student.wilayaId) ||
               p.institutionOffer.institution.wilayaId === student.wilayaId;
      });
    } else if (selectedLocationScope === 'other') {
      list = list.filter(p => {
        if (p.institutionOffer.registrationScope === 'national') return true;
        return p.institutionOffer.eligibleWilayas?.includes(otherWilayaId) ||
               p.institutionOffer.institution.wilayaId === otherWilayaId;
      });
    }

    // 4. Status filter
    if (statusFilter === 'ELIGIBLE') {
      list = list.filter(p => p.eligibilityStatus === 'ELIGIBLE');
    } else if (statusFilter === 'CONDITIONAL') {
      list = list.filter(p => p.eligibilityStatus === 'CONDITIONAL');
    } else if (statusFilter === 'COMPETITIVE') {
      list = list.filter(p => p.rule?.rankingBasis === 'weighted_average');
    }

    // 5. Sorting
    if (sortBy === 'SCORE_DESC') {
      list.sort((a, b) => (b.admissionScore?.scoreUsed || 0) - (a.admissionScore?.scoreUsed || 0));
    } else if (sortBy === 'ALPHABETICAL') {
      list.sort((a, b) => a.program.nameAr.localeCompare(b.program.nameAr, 'ar'));
    }

    return list;
  }, [report.programs, searchQuery, selectedCategory, selectedLocationScope, otherWilayaId, statusFilter, sortBy, student.wilayaId]);

  return (
    <section id="results" className="max-w-6xl mx-auto px-4 sm:px-6 mb-20 scroll-mt-6" dir="rtl">
      {/* Top Banner: Student Summary & Share Action */}
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-5 sm:p-7 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200/80 flex flex-col items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-teal-700">معدلك</span>
              <span className="text-xl font-black text-stone-900 leading-none">
                {student.generalAverage.toFixed(2)}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                  التخصصات اللي ممكن تناسبك
                </h2>
                <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md">
                  {filteredPrograms.length} خيار
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                الشعبة: <strong className="text-stone-700">{streamInfo?.nameAr}</strong> • الولاية: <strong className="text-stone-700">{userWilaya?.nameAr}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                trackEvent('orientation_share', { average: student.generalAverage });
                onOpenShareModal();
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>شارك نتيجتك</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Quick Filters */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 mb-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="وش حاب تقرا؟ (مثال: informatique، طب، ذكاء اصطناعي، عمارة...)"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (e.target.value.length > 2) {
                  trackEvent('orientation_search', { query: e.target.value });
                }
              }}
              className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:bg-white focus:border-teal-600 focus:outline-hidden transition-all"
            />
          </div>

          {/* Quick Filter Buttons & Mobile Trigger */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile Filter Drawer Button */}
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="md:hidden flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Filter className="w-4 h-4 text-stone-600" />
              <span>فلاتر متقدمة</span>
            </button>

            {/* Desktop Location Scope Selector */}
            <div className="hidden md:flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-medium text-stone-600">
              <span className="px-2 text-stone-400 font-bold text-[11px]">وين تحب تقرا؟</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedLocationScope('all');
                  trackEvent('orientation_filter_used', { filter: 'location', value: 'all' });
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedLocationScope === 'all'
                    ? 'bg-white font-bold text-stone-900 shadow-2xs'
                    : 'hover:text-stone-900'
                }`}
              >
                كل الجزائر
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedLocationScope('my_wilaya');
                  trackEvent('orientation_filter_used', { filter: 'location', value: 'my_wilaya' });
                }}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedLocationScope === 'my_wilaya'
                    ? 'bg-white font-bold text-stone-900 shadow-2xs'
                    : 'hover:text-stone-900'
                }`}
              >
                ولايتي ({userWilaya?.nameAr})
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-xl text-xs font-medium">
              <ArrowUpDown className="w-3.5 h-3.5 text-stone-500" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-stone-800 focus:outline-hidden cursor-pointer"
              >
                <option value="RELEVANCE">الأقرب لفرصك</option>
                <option value="SCORE_DESC">الأعلى معدلاً</option>
                <option value="ALPHABETICAL">أبجدياً</option>
              </select>
            </div>
          </div>
        </div>

        {/* Domain Filter Pills Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 mt-3 border-t border-stone-100 no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('ALL');
              trackEvent('orientation_filter_used', { filter: 'category', value: 'ALL' });
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 hover:bg-stone-200/70 text-stone-700'
            }`}
          >
            جميع الميادين
          </button>

          {EXPLORE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id);
                trackEvent('orientation_filter_used', { filter: 'category', value: cat.id });
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-stone-100 hover:bg-stone-200/70 text-stone-700'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.nameAr}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Program Cards Grid */}
      {filteredPrograms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrograms.map(evalRes => (
            <ProgramEvaluationCard
              key={`${evalRes.program.id}-${evalRes.institutionOffer.institution.id}`}
              evaluation={evalRes}
              onToggleCompare={onToggleCompare}
              isCompared={comparedProgramIds.includes(evalRes.program.id)}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-600">
          <GraduationCap className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <h3 className="font-bold text-stone-800 text-base mb-1">
            لا توجد تخصصات مطابقة لمعايير البحث الحالية
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
            جرب تغيير كلمات البحث، أو تصفير فلاتر الميدان والولاية لعرض كافة الخيارات المتاحة.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedLocationScope('all');
              setStatusFilter('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-teal-700 text-white font-bold text-xs cursor-pointer"
          >
            إعادة ضبط الفلاتر
          </button>
        </div>
      )}

      {/* Mobile Filter Bottom Sheet Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <h3 className="font-black text-stone-900 text-lg">تصفية التخصصات</h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Location Filter */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-stone-700 mb-2">
                وين تحب تقرا؟
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLocationScope('all')}
                  className={`p-2.5 rounded-xl text-xs font-bold border ${
                    selectedLocationScope === 'all'
                      ? 'bg-teal-50 border-teal-600 text-teal-900'
                      : 'border-stone-200 text-stone-700'
                  }`}
                >
                  كل الجزائر
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLocationScope('my_wilaya')}
                  className={`p-2.5 rounded-xl text-xs font-bold border ${
                    selectedLocationScope === 'my_wilaya'
                      ? 'bg-teal-50 border-teal-600 text-teal-900'
                      : 'border-stone-200 text-stone-700'
                  }`}
                >
                  ولايتي ({userWilaya?.nameAr})
                </button>
              </div>
            </div>

            {/* Eligibility Status Filter */}
            <div className="mb-6">
              <label className="block text-xs font-bold text-stone-700 mb-2">
                حالة الأهلية:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`p-2 rounded-xl text-xs font-bold border ${
                    statusFilter === 'ALL'
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'border-stone-200 text-stone-700'
                  }`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ELIGIBLE')}
                  className={`p-2 rounded-xl text-xs font-bold border ${
                    statusFilter === 'ELIGIBLE'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                      : 'border-stone-200 text-stone-700'
                  }`}
                >
                  مؤهل فقط
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full py-3.5 rounded-xl bg-teal-700 text-white font-bold text-sm"
            >
              عرض {filteredPrograms.length} تخصص
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
