'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Filter, 
  Sparkles, 
  X, 
  GraduationCap,
  Building2,
  Share2,
  ArrowUpDown,
  RotateCcw
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
    <section id="results" className="max-w-5xl mx-auto px-4 sm:px-6 mb-16 scroll-mt-6" dir="rtl">
      {/* Sleek Results Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#1E3A34] tracking-tight">
              التخصصات المقترحة لنتيجتك
            </h2>
            <span className="text-xs font-bold text-[#2C5E54] bg-[#E8F2EB] border border-[#AFC8BD] px-2.5 py-0.5 rounded-full">
              {filteredPrograms.length} تخصص
            </span>
          </div>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            بناءً على شعبة <strong className="text-[#1E3A34]">{streamInfo?.nameAr}</strong> ومعدل <strong className="text-[#2C5E54] font-mono">{student.generalAverage.toFixed(2)}</strong> بولاية <strong className="text-[#1E3A34]">{userWilaya?.nameAr}</strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            trackEvent('orientation_share', { average: student.generalAverage });
            onOpenShareModal();
          }}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white hover:bg-[#F7F3EA] text-[#2C5E54] hover:text-[#1E3A34] border border-[#DCE9E4] text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-[#5F8F86]" />
          <span>مشاركة القائمة</span>
        </button>
      </div>

      {/* Control Bar: Search & Compact Warm Filters */}
      <div className="bg-white rounded-2xl border border-[#E4DED2] p-3 sm:p-4 mb-5 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
            <input
              type="text"
              placeholder="ابحث عن تخصص، مدرسة عليا، أو جامعة (مثال: ESI، طب، ذكاء اصطناعي، عمارة...)"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                if (e.target.value.length > 2) {
                  trackEvent('orientation_search', { query: e.target.value });
                }
              }}
              className="w-full pl-8 pr-9 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E4DED2] text-xs sm:text-sm font-medium text-[#1E3A34] placeholder:text-[#78716C] focus:bg-white focus:border-[#2C5E54] focus:outline-hidden transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1E3A34] p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Location Scope & Sort Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Location Scope Selector */}
            <div className="flex items-center gap-1 bg-[#F7F3EA] p-1 rounded-xl border border-[#E4DED2] text-xs font-medium">
              <button
                type="button"
                onClick={() => setSelectedLocationScope('all')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedLocationScope === 'all'
                    ? 'bg-white font-bold text-[#1E3A34] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1E3A34]'
                }`}
              >
                كل الجزائر
              </button>
              <button
                type="button"
                onClick={() => setSelectedLocationScope('my_wilaya')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedLocationScope === 'my_wilaya'
                    ? 'bg-white font-bold text-[#1E3A34] shadow-xs'
                    : 'text-[#64748B] hover:text-[#1E3A34]'
                }`}
              >
                📍 ولايتي فقط
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-[#FAF8F5] border border-[#E4DED2] px-2.5 py-1.5 rounded-xl text-xs font-medium">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#5F8F86]" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent font-bold text-[#1E3A34] focus:outline-hidden cursor-pointer text-xs"
              >
                <option value="RELEVANCE">الأقرب لفرصك</option>
                <option value="SCORE_DESC">الأعلى معدلاً</option>
                <option value="ALPHABETICAL">أبجدياً</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Pills (Horizontal Scroll with soothing theme) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#E4DED2] no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#2C5E54] text-white shadow-xs border border-[#2C5E54]'
                : 'bg-[#FAF8F5] hover:bg-[#F7F3EA] text-[#475569] border border-[#E4DED2]'
            }`}
          >
            جميع الميادين
          </button>

          {EXPLORE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#2C5E54] text-white shadow-xs border border-[#2C5E54]'
                  : 'bg-[#FAF8F5] hover:bg-[#F7F3EA] text-[#475569] border border-[#E4DED2]'
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
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
        <div className="p-10 text-center bg-white rounded-2xl border border-[#E4DED2] text-[#475569]">
          <GraduationCap className="w-10 h-10 text-[#78716C] mx-auto mb-2" />
          <h3 className="font-bold text-[#1E3A34] text-sm mb-1">
            لا توجد تخصصات مطابقة لمعايير البحث الحالية
          </h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto mb-3">
            جرب كتابة اسم تخصص آخر أو تصفير فلاتر الميدان والولاية لعرض كافة الخيارات المتاحة.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setSelectedLocationScope('all');
              setStatusFilter('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-[#2C5E54] text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط الفلاتر</span>
          </button>
        </div>
      )}
    </section>
  );
};
