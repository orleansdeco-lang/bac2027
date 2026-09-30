'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Scale,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Share2,
  ArrowUpDown,
  RotateCcw,
  GraduationCap,
  Clock,
  ExternalLink,
  BookOpen,
  Info,
  TrendingUp,
  MinusCircle
} from 'lucide-react';
import {
  OrientationReport,
  ProgramEvaluationResult,
  Program,
  BacStreamCode
} from '@/types/orientation';
import { OFFICIAL_WILAYAS } from '@/lib/orientation/data/wilayas';
import { BAC_STREAMS_CONFIG } from '@/lib/orientation/data/calculator-config';
import { EXPLORE_CATEGORIES } from './OrientationHeroModern';
import { trackEvent } from '@/lib/analytics';

interface OrientationTableViewProps {
  report: OrientationReport;
  onToggleCompare: (program: Program) => void;
  comparedProgramIds: string[];
  onViewDetails: (program: Program) => void;
  onOpenShareModal: () => void;
}

export const OrientationTableView: React.FC<OrientationTableViewProps> = ({
  report,
  onToggleCompare,
  comparedProgramIds,
  onViewDetails,
  onOpenShareModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocationScope, setSelectedLocationScope] = useState<'all' | 'my_wilaya'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const student = report.studentProfile;
  const streamInfo = BAC_STREAMS_CONFIG[student.streamId as BacStreamCode];
  const userWilaya = OFFICIAL_WILAYAS.find(w => w.id === student.wilayaId);

  // Helper to extract numeric required cutoff
  const getRequiredCutoff = (evalRes: ProgramEvaluationResult): number => {
    if (evalRes.historicalCutoff?.cutoffValue) return evalRes.historicalCutoff.cutoffValue;
    if (evalRes.historicalCutoffs?.[0]?.weightedCutoff) return evalRes.historicalCutoffs[0].weightedCutoff;
    if (evalRes.historicalCutoffs?.[0]?.generalCutoff) return evalRes.historicalCutoffs[0].generalCutoff;
    if (evalRes.rule?.minimumWeightedAverage) return evalRes.rule.minimumWeightedAverage;
    if (evalRes.rule?.minimumGeneralAverage) return evalRes.rule.minimumGeneralAverage;
    return 10.00;
  };

  // 1. Separate programs into Eligible (المتاحة لك) and Unavailable (غير المتاحة / تفوق معدلك)
  const { eligibleList, unavailableList } = useMemo(() => {
    let all = [...report.programs];

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      all = all.filter(p =>
        p.program.nameAr.toLowerCase().includes(q) ||
        p.program.nameFr?.toLowerCase().includes(q) ||
        p.institutionOffer.institution.nameAr.toLowerCase().includes(q) ||
        p.program.specialtyAr?.toLowerCase().includes(q) ||
        p.program.programCode.includes(q)
      );
    }

    // Filter by Category
    if (selectedCategory !== 'ALL') {
      all = all.filter(p => {
        const field = p.program.fieldId?.toUpperCase();
        if (selectedCategory === 'MED') return field === 'MED';
        if (selectedCategory === 'INFO_AI') return field === 'INFO_AI' || p.program.programCode.includes('07');
        if (selectedCategory === 'TECH') return field === 'TECH' || p.program.programCode.includes('08');
        if (selectedCategory === 'ARCHI') return p.program.programCode.includes('083');
        if (selectedCategory === 'ECON') return field === 'SEGC' || p.program.programCode.includes('03');
        if (selectedCategory === 'LAW') return p.program.programCode.includes('021');
        if (selectedCategory === 'SNV') return field === 'SNV' || p.program.programCode.includes('06');
        if (selectedCategory === 'LANG') return field === 'LANG' || p.program.programCode.includes('025');
        if (selectedCategory === 'HUMAN') return field === 'HUMAN' || p.program.programCode.includes('09');
        return true;
      });
    }

    // Filter by Wilaya scope
    if (selectedLocationScope === 'my_wilaya') {
      all = all.filter(p => {
        if (p.institutionOffer.registrationScope === 'national') return true;
        return p.institutionOffer.eligibleWilayas?.includes(student.wilayaId) ||
               p.institutionOffer.institution.wilayaId === student.wilayaId;
      });
    }

    const eligible: ProgramEvaluationResult[] = [];
    const unavailable: ProgramEvaluationResult[] = [];

    for (const item of all) {
      if (item.eligibilityStatus === 'ELIGIBLE' || item.eligibilityStatus === 'CONDITIONAL') {
        eligible.push(item);
      } else {
        unavailable.push(item);
      }
    }

    // User Rule:
    // "المتاحين لي و تحتهم يظهرو الغير متاحين بالترتيب من ادنى معدل لاكبر معدل"
    // Sort unavailable ASCENDING by required cutoff (from lowest threshold to largest):
    unavailable.sort((a, b) => {
      const cutoffA = getRequiredCutoff(a);
      const cutoffB = getRequiredCutoff(b);
      return cutoffA - cutoffB;
    });

    // Eligible list sorted by prestige / score descending:
    eligible.sort((a, b) => {
      const priorityA = a.priority ?? 99;
      const priorityB = b.priority ?? 99;
      if (priorityA !== priorityB) return priorityA - priorityB;
      const scoreA = a.admissionScore?.scoreUsed || a.studentAverageUsed;
      const scoreB = b.admissionScore?.scoreUsed || b.studentAverageUsed;
      return scoreB - scoreA;
    });

    return { eligibleList: eligible, unavailableList: unavailable };
  }, [report.programs, searchQuery, selectedCategory, selectedLocationScope, student.wilayaId]);

  const toggleExpand = (rowKey: string) => {
    setExpandedRowId(prev => (prev === rowKey ? null : rowKey));
  };

  // Helper row component for consistency between tables
  const renderRow = (evalRes: ProgramEvaluationResult, isAvailableSection: boolean) => {
    const { program, institutionOffer, rule, eligibilityStatus, admissionScore, historicalCutoff } = evalRes;
    const rowKey = `${program.id}-${institutionOffer.institution.id}`;
    const isExpanded = expandedRowId === rowKey;

    const isEligible = eligibilityStatus === 'ELIGIBLE';
    const isConditional = eligibilityStatus === 'CONDITIONAL';
    const isNotEligible = eligibilityStatus === 'NOT_ELIGIBLE';

    const userScore = admissionScore?.scoreUsed ?? evalRes.studentAverageUsed;
    const isWeighted = admissionScore?.scoreType === 'WEIGHTED_AVERAGE';
    const requiredCutoff = getRequiredCutoff(evalRes);
    const scoreDiff = requiredCutoff - userScore;

    const institutionWilaya = OFFICIAL_WILAYAS.find(w => w.id === institutionOffer.institution.wilayaId);

    return (
      <div
        key={rowKey}
        className={`border rounded-2xl transition-all duration-200 overflow-hidden mb-2.5 ${
          isAvailableSection
            ? isExpanded
              ? 'border-[#2C5E54] bg-white shadow-md'
              : 'border-[#E4DED2] bg-white hover:border-[#5F8F86] hover:shadow-xs'
            : isExpanded
            ? 'border-[#C8796B] bg-white shadow-md'
            : 'border-[#EAE4D7] bg-[#FAF8F5]/80 hover:border-[#D7A66A] hover:bg-white hover:shadow-xs'
        }`}
      >
        {/* Clickable Header / Row Strip */}
        <div
          onClick={() => toggleExpand(rowKey)}
          className="p-3.5 sm:p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 select-none"
        >
          {/* Column 1: Program Name & Badges */}
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm sm:text-base font-black text-[#1E3A34] tracking-tight">
                {program.nameAr}
              </span>

              {/* Degree Badge */}
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#F4F8F7] text-[#2C5E54] border border-[#DCE9E4]">
                {program.degreeType || 'ليسانس'}
              </span>

              {/* Code */}
              <span className="text-[10px] font-mono text-[#78716C] bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#E4DED2]">
                {program.programCode}
              </span>
            </div>

            {/* Institution & Wilaya */}
            <div className="flex items-center gap-2 text-xs text-[#64748B] flex-wrap">
              <span className="flex items-center gap-1 font-medium text-[#475569]">
                <Building2 className="w-3.5 h-3.5 text-[#5F8F86]" />
                <span>{institutionOffer.institution.nameAr}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-[#78716C]">
                <MapPin className="w-3 h-3 text-[#78716C]" />
                <span>ولاية {institutionWilaya ? `${institutionWilaya.nameAr} (${institutionWilaya.id})` : institutionOffer.institution.wilayaId}</span>
              </span>
              <span>•</span>
              <span className="text-[11px] text-[#78716C]">
                {institutionOffer.registrationScope === 'national' ? 'تسجيل وطني' : 'تسجيل جهوي'}
              </span>
            </div>
          </div>

          {/* Column 2: Scores & Comparison (Mobile & Desktop) */}
          <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#E4DED2]/60">
            {/* User Calculated Score */}
            <div className="text-center min-w-[75px] bg-[#FAF8F5] border border-[#E4DED2] p-1.5 rounded-xl">
              <span className="text-[10px] text-[#78716C] block font-medium">
                {isWeighted ? 'معدلك الموزون' : 'معدلك العام'}
              </span>
              <span className="text-sm font-black text-[#2C5E54] font-mono">
                {userScore > 0 ? userScore.toFixed(2) : '—'}
              </span>
            </div>

            {/* Required Cutoff */}
            <div className="text-center min-w-[85px] bg-[#FAF8F5] border border-[#E4DED2] p-1.5 rounded-xl">
              <span className="text-[10px] text-[#78716C] block font-medium">المعدل المطلوب</span>
              <span className="text-sm font-black text-[#1E3A34] font-mono">
                {requiredCutoff ? requiredCutoff.toFixed(2) : 'غير محدد'}
              </span>
            </div>

            {/* Status Chip */}
            <div className="min-w-[110px] text-center">
              {isAvailableSection ? (
                isEligible ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8F2EB] text-[#245248] border border-[#AFC8BD] shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2C5E54]" />
                    <span>مؤهل للتسجيل</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FAF0E2] text-[#8C5D23] border border-[#E8CDA8]">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#D7A66A]" />
                    <span>شروط إضافية</span>
                  </span>
                )
              ) : (
                <div className="space-y-0.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FDE8E8] text-[#9B1C1C] border border-[#F8B4B4]">
                    <MinusCircle className="w-3.5 h-3.5 text-[#E02424]" />
                    <span>
                      {scoreDiff > 0 ? `ينقصك ${scoreDiff.toFixed(2)}` : 'غير متاح'}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Expand Indicator */}
            <div className="p-2 rounded-xl bg-[#FAF8F5] text-[#78716C] shrink-0">
              {isExpanded ? <ChevronUp className="w-4 h-4 text-[#1E3A34]" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>

        {/* Expandable Accordion Card: Details */}
        {isExpanded && (
          <div className="border-t border-[#E4DED2] bg-[#FAF8F5] p-4 sm:p-5 space-y-3.5 animate-in fade-in duration-200">
            {/* Priority & Weighted Formula Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Formula & Calculation */}
              <div className="bg-white p-3 rounded-xl border border-[#E4DED2] space-y-1">
                <span className="text-[11px] font-bold text-[#1E3A34] block flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-[#5F8F86]" />
                  <span>طريقة الترتيب وصيغة الحساب:</span>
                </span>
                {isWeighted && admissionScore?.formulaExpression ? (
                  <div className="space-y-1 text-xs">
                    <div className="bg-[#F4F8F7] border border-[#DCE9E4] p-2 rounded-lg font-mono text-[#2C5E54] text-[11px]" dir="ltr">
                      {admissionScore.formulaExpression}
                    </div>
                    <p className="text-[11px] text-[#64748B]">
                      يتم الترتيب على أساس المعدل الموزون المحسوب من علامات المواد الأساسية.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-[#64748B]">
                    الترتيب يتم مباشرة على أساس <strong className="text-[#1E3A34]">المعدل العام للبكالوريا</strong> بدون معاملات ترجيحية.
                  </p>
                )}
              </div>

              {/* Priority & Geographic Scope */}
              <div className="bg-white p-3 rounded-xl border border-[#E4DED2] space-y-1">
                <span className="text-[11px] font-bold text-[#1E3A34] block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#5F8F86]" />
                  <span>الأولوية والدائرة الجغرافية:</span>
                </span>
                <p className="text-xs text-[#475569] leading-relaxed">
                  • <strong>الأولوية:</strong> {rule ? (rule.priority === 1 ? 'أولوية قصوى (الأولوية 1)' : `الأولوية ${rule.priority}`) : 'غير محددة'} لشعبة {streamInfo?.nameAr}.
                </p>
                <p className="text-xs text-[#64748B] leading-relaxed">
                  • <strong>الدائرة:</strong> {institutionOffer.registrationScope === 'national' ? 'تسجيل وطني مفتوح لحاملي بكالوريا جميع الـ 58 ولاية' : `تسجيل جهوي مرتبط بولاية نيل الشهادة (${institutionOffer.eligibleWilayas?.length || 'محدد'} ولاية معنية)`}.
                </p>
              </div>
            </div>

            {/* Reasons / Blockers / Warnings List */}
            {evalRes.reasons && evalRes.reasons.length > 0 && (
              <div className="bg-white p-3 rounded-xl border border-[#E4DED2] space-y-1">
                <span className="text-[11px] font-bold text-[#1E3A34] block flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-[#2C5E54]" />
                  <span>المعايير البيداغوجية والتحقق:</span>
                </span>
                <ul className="text-xs space-y-1 text-[#475569] list-disc list-inside">
                  {evalRes.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                  {evalRes.blockers && evalRes.blockers.map((b, i) => (
                    <li key={`b-${i}`} className="text-[#9B1C1C] font-medium">{b}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E4DED2]/80">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompare(program);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  comparedProgramIds.includes(program.id)
                    ? 'bg-[#2C5E54] text-white'
                    : 'bg-white hover:bg-[#F7F3EA] text-[#2C5E54] border border-[#DCE9E4]'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{comparedProgramIds.includes(program.id) ? 'تمت المقارنة' : 'إضافة للمقارنة'}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(program);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#F7F3EA] text-[#1E3A34] text-xs font-bold border border-[#E4DED2] transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>البطاقة البيداغوجية الكاملة</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section id="results" className="max-w-5xl mx-auto px-4 sm:px-6 mb-16 scroll-mt-6" dir="rtl">
      {/* Header Strip with Stats & Share */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-[#1E3A34] tracking-tight">
              جدول توجيه نتائج البكالوريا
            </h2>
            <span className="text-xs font-bold text-[#2C5E54] bg-[#E8F2EB] border border-[#AFC8BD] px-2.5 py-0.5 rounded-full">
              {eligibleList.length} متاح لك
            </span>
            <span className="text-xs font-bold text-[#8C5D23] bg-[#FAF0E2] border border-[#E8CDA8] px-2.5 py-0.5 rounded-full">
              {unavailableList.length} غير متاح
            </span>
          </div>
          <p className="text-xs text-[#64748B] font-medium mt-1">
            وفق شعبة <strong className="text-[#1E3A34]">{streamInfo?.nameAr}</strong> ومعدل <strong className="text-[#2C5E54] font-mono">{student.generalAverage.toFixed(2)}</strong> بولاية <strong className="text-[#1E3A34]">{userWilaya?.nameAr}</strong>
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

      {/* Control Bar: Search & Category Pills */}
      <div className="bg-white rounded-2xl border border-[#E4DED2] p-3 sm:p-4 mb-6 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
            <input
              type="text"
              placeholder="ابحث باسم التخصص، المدرسة العليا، أو الجامعة (مثال: ESI، طب، ذكاء اصطناعي، عمارة، ورقلة...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-9 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E4DED2] text-xs sm:text-sm font-medium text-[#1E3A34] placeholder:text-[#78716C] focus:bg-white focus:border-[#2C5E54] focus:outline-hidden transition-all"
            />
          </div>

          {/* Wilaya Scope Filter */}
          <div className="flex items-center gap-1 bg-[#F7F3EA] p-1 rounded-xl border border-[#E4DED2] text-xs font-medium shrink-0">
            <button
              type="button"
              onClick={() => setSelectedLocationScope('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedLocationScope === 'all'
                  ? 'bg-white font-bold text-[#1E3A34] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E3A34]'
              }`}
            >
              كل جامعات الجزائر (58 ولاية)
            </button>
            <button
              type="button"
              onClick={() => setSelectedLocationScope('my_wilaya')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedLocationScope === 'my_wilaya'
                  ? 'bg-white font-bold text-[#1E3A34] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E3A34]'
              }`}
            >
              📍 ولايتي فقط ({userWilaya?.nameAr})
            </button>
          </div>
        </div>

        {/* Category Pills */}
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

      {/* SECTION 1: ELIGIBLE & AVAILABLE PROGRAMS (التخصصات المتاحة لك) */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-[#DCE9E4]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#2C5E54]" />
            <h3 className="text-lg font-black text-[#1E3A34]">
              التخصصات المتاحة لك للتسجيل بمعدلك
            </h3>
            <span className="text-xs font-bold text-[#2C5E54] bg-[#E8F2EB] px-2 py-0.5 rounded-full border border-[#AFC8BD]">
              {eligibleList.length} تخصص مؤهل
            </span>
          </div>
          <span className="text-xs text-[#64748B] hidden sm:inline">
            اضغط على أي تخصص لتوسيع الخانة وعرض التفاصيل
          </span>
        </div>

        {eligibleList.length > 0 ? (
          <div>
            {eligibleList.map(evalRes => renderRow(evalRes, true))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E4DED2] text-[#475569] mb-4">
            <AlertTriangle className="w-8 h-8 text-[#D7A66A] mx-auto mb-2" />
            <h4 className="font-bold text-[#1E3A34] text-sm mb-1">
              لا توجد تخصصات مطابقة تماماً للمعدل والفلتر الحالي
            </h4>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto">
              جرب تغيير خيار البحث أو اختيار &quot;كل جامعات الجزائر&quot; لاستعراض التخصصات المتاحة.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: UNAVAILABLE / HIGHER CUTOFF PROGRAMS (الغير متاحين بالترتيب من أدنى معدل لأكبر معدل) */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-[#E8CDA8]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#D7A66A]" />
            <h3 className="text-lg font-black text-[#1E3A34]">
              تخصصات تفوق معدلك أو غير متاحة لشعبتك (مرتبة من أدنى معدل إلى أعلاه)
            </h3>
            <span className="text-xs font-bold text-[#8C5D23] bg-[#FAF0E2] px-2 py-0.5 rounded-full border border-[#E8CDA8]">
              {unavailableList.length} تخصص
            </span>
          </div>
          <span className="text-xs text-[#8C5D23] font-bold hidden sm:inline flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ترتيب تصاعدي حسب العتبة</span>
          </span>
        </div>

        <p className="text-xs text-[#64748B] mb-3 leading-relaxed">
          هذه التخصصات تفوق معدلك الحالي أو تتطلب شعبة أخرى، وقد تم ترتيبها تصاعدياً من أدنى معدل مطلوب إلى أقصى معدل ليتسنى لك معرفة ما كان قريباً من نتيجتك وفارق النقاط المطلوب.
        </p>

        {unavailableList.length > 0 ? (
          <div>
            {unavailableList.map(evalRes => renderRow(evalRes, false))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-[#E4DED2] text-[#475569]">
            <CheckCircle2 className="w-8 h-8 text-[#2C5E54] mx-auto mb-2" />
            <h4 className="font-bold text-[#1E3A34] text-sm">
              أنت مؤهل لكافة التخصصات المندرجة تحت هذا الفلتر!
            </h4>
          </div>
        )}
      </div>
    </section>
  );
};
