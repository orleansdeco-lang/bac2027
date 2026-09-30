'use client';

import React, { useState, useMemo } from 'react';
import {
  Globe,
  Search,
  DollarSign,
  GraduationCap,
  MapPin,
  Award,
  BookOpen,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Plane,
  Languages,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Info,
  Calendar,
  CreditCard,
  Building2,
  RotateCcw
} from 'lucide-react';
import {
  STUDY_ABROAD_COUNTRIES,
  STUDY_ABROAD_UNIVERSITIES,
  StudyAbroadUniversity,
  StudyAbroadCountry
} from '@/lib/orientation/data/study-abroad';

export const StudyAbroadView: React.FC = () => {
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMajorFilter, setSelectedMajorFilter] = useState<string>('ALL');
  const [selectedBudgetFilter, setSelectedBudgetFilter] = useState<string>('ALL');
  const [expandedUnivId, setExpandedUnivId] = useState<string | null>(null);

  // Active country info if specific country selected
  const activeCountry = useMemo(() => {
    if (selectedCountryCode === 'ALL') return null;
    return STUDY_ABROAD_COUNTRIES.find(c => c.code === selectedCountryCode) || null;
  }, [selectedCountryCode]);

  // Filtered universities
  const filteredUniversities = useMemo(() => {
    return STUDY_ABROAD_UNIVERSITIES.filter(univ => {
      // 1. Country filter
      if (selectedCountryCode !== 'ALL' && univ.countryCode !== selectedCountryCode) {
        return false;
      }

      // 2. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = univ.nameAr.toLowerCase().includes(q) ||
                            univ.nameOriginal.toLowerCase().includes(q) ||
                            univ.cityAr.toLowerCase().includes(q) ||
                            univ.countryNameAr.toLowerCase().includes(q);
        const matchesMajor = univ.popularMajors.some(m => m.toLowerCase().includes(q));
        if (!matchesName && !matchesMajor) return false;
      }

      // 3. Major filter
      if (selectedMajorFilter !== 'ALL') {
        const hasMajor = univ.popularMajors.some(m => {
          if (selectedMajorFilter === 'MED') return m.includes('طب') || m.includes('صحة') || m.includes('صيدلة') || m.includes('Medicine');
          if (selectedMajorFilter === 'TECH') return m.includes('هندسة') || m.includes('حاسوب') || m.includes('ذكاء') || m.includes('برمجيات') || m.includes('سيبراني');
          if (selectedMajorFilter === 'BIZ') return m.includes('إدارة') || m.includes('اقتصاد') || m.includes('أعمال') || m.includes('محاسبة');
          if (selectedMajorFilter === 'HUMAN') return m.includes('لغات') || m.includes('حقوق') || m.includes('علاقات') || m.includes('آداب');
          return true;
        });
        if (!hasMajor) return false;
      }

      // 4. Budget filter (tuition max in USD)
      if (selectedBudgetFilter === 'FREE_OR_LOW') {
        if (univ.tuitionUsdPerYear.max > 1500) return false;
      } else if (selectedBudgetFilter === 'MID') {
        if (univ.tuitionUsdPerYear.min > 6000 || univ.tuitionUsdPerYear.max < 1500) return false;
      } else if (selectedBudgetFilter === 'HIGH') {
        if (univ.tuitionUsdPerYear.max < 6000) return false;
      }

      return true;
    });
  }, [selectedCountryCode, searchQuery, selectedMajorFilter, selectedBudgetFilter]);

  const toggleExpand = (univId: string) => {
    setExpandedUnivId(prev => (prev === univId ? null : univId));
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20 scroll-mt-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#1E3A34] via-[#244A42] to-[#162D28] text-white rounded-3xl p-6 sm:p-8 shadow-elevated mb-6 relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -right-10 -top-10 w-60 h-60 bg-[#5F8F86]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#AFC8BD] text-xs font-bold mb-3 backdrop-blur-xs">
            <Globe className="w-3.5 h-3.5 text-[#E8CDA8]" />
            <span>دليل الدراسة في الخارج لحاملي البكالوريا الجزائرية</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
            الجامعات الدولية الأكثر طلباً من الطلبة الجزائريين
          </h2>

          <p className="text-xs sm:text-sm text-[#DCE9E4] max-w-2xl leading-relaxed mb-4">
            دليل عملي وموثق يضم حصراً الدول والجامعات التي يسافر إليها الجزائريون فعلياً (فرنسا، تركيا، كندا، روسيا، ماليزيا، ألمانيا، إيطاليا، إسبانيا، تونس)، مع الشروط الرسمية، الحد الأدنى للمعدل، والتكلفة السنوية بالدولار الأمريكي (<strong className="text-white">$ USD</strong>) وتفاصيل المنح المتاحة.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-white/10 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <span className="text-[#AFC8BD] block text-[11px] mb-0.5">الدول المغطاة</span>
              <strong className="text-white text-sm font-black font-mono">9 دول رئيسية</strong>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <span className="text-[#AFC8BD] block text-[11px] mb-0.5">الرسوم الجامعية</span>
              <strong className="text-[#E8CDA8] text-sm font-black font-mono">تبدأ من 0$ إلى 4,000$</strong>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <span className="text-[#AFC8BD] block text-[11px] mb-0.5">منح دراسية ممولة</span>
              <strong className="text-[#AFC8BD] text-sm font-black font-mono">Türkiye, DSU, Eiffel</strong>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5">
              <span className="text-[#AFC8BD] block text-[11px] mb-0.5">معدل البكالوريا</span>
              <strong className="text-white text-sm font-black font-mono">متاح ابتداءً من 11.50+</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Country Filter Navigation Bar */}
      <div className="bg-white rounded-2xl border border-[#E4DED2] p-3 sm:p-4 mb-5 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#1E3A34] flex items-center gap-1.5">
            <Plane className="w-3.5 h-3.5 text-[#5F8F86]" />
            <span>اختر وجهتك الدراسية:</span>
          </span>
          {selectedCountryCode !== 'ALL' && (
            <button
              type="button"
              onClick={() => setSelectedCountryCode('ALL')}
              className="text-[11px] text-[#5F8F86] hover:text-[#1E3A34] font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>عرض كل الدول</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCountryCode('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCountryCode === 'ALL'
                ? 'bg-[#1E3A34] text-white shadow-xs'
                : 'bg-[#FAF8F5] hover:bg-[#F7F3EA] text-[#475569] border border-[#E4DED2]'
            }`}
          >
            <span>🌍</span>
            <span>جميع الدول ({STUDY_ABROAD_UNIVERSITIES.length})</span>
          </button>

          {STUDY_ABROAD_COUNTRIES.map(country => (
            <button
              key={country.code}
              type="button"
              onClick={() => setSelectedCountryCode(country.code)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCountryCode === country.code
                  ? 'bg-[#1E3A34] text-white shadow-xs'
                  : 'bg-[#FAF8F5] hover:bg-[#F7F3EA] text-[#475569] border border-[#E4DED2]'
              }`}
            >
              <span className="text-sm">{country.flagEmoji}</span>
              <span>{country.nameAr}</span>
            </button>
          ))}
        </div>

        {/* Highlight Banner for Selected Country */}
        {activeCountry && (
          <div className="mt-3 pt-3 border-t border-[#E4DED2] bg-[#FAF8F5] rounded-xl p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-base">{activeCountry.flagEmoji}</span>
                <span className="font-black text-[#1E3A34] text-sm">{activeCountry.nameAr} ({activeCountry.nameEn})</span>
                <span className="text-[10px] bg-white border border-[#E4DED2] px-2 py-0.5 rounded-full font-mono text-[#475569]">
                  العملة: {activeCountry.currency} ({activeCountry.currencyRateToUsd})
                </span>
              </div>
              <p className="text-[#64748B] text-[11px] leading-relaxed">
                {activeCountry.overviewAr}
              </p>
            </div>

            <div className="shrink-0 bg-white border border-[#DCE9E4] px-3 py-1.5 rounded-lg text-right">
              <span className="text-[10px] text-[#64748B] block">الميزة الكبرى للجزائريين:</span>
              <span className="font-bold text-[#2C5E54] text-[11px]">{activeCountry.keyAdvantageForAlgeriansAr}</span>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar: Search + Major + Budget Filters */}
      <div className="bg-white rounded-2xl border border-[#E4DED2] p-3 sm:p-4 mb-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
            <input
              type="text"
              placeholder="ابحث عن جامعة، تخصص، أو مدينة (مثال: السوربون، طب، ذكاء اصطناعي، مونتريال...)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-9 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E4DED2] text-xs sm:text-sm font-medium text-[#1E3A34] placeholder:text-[#78716C] focus:bg-white focus:border-[#2C5E54] focus:outline-hidden transition-all"
            />
          </div>

          {/* Major Filter */}
          <select
            value={selectedMajorFilter}
            onChange={e => setSelectedMajorFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E4DED2] text-xs font-bold text-[#1E3A34] focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">جميع المجالات</option>
            <option value="MED">الطب والعلوم الصحية</option>
            <option value="TECH">الهندسة والإعلام الآلي</option>
            <option value="BIZ">إدارة الأعمال والاقتصاد</option>
            <option value="HUMAN">العلوم الإنسانية واللغات</option>
          </select>

          {/* Budget Filter in USD */}
          <select
            value={selectedBudgetFilter}
            onChange={e => setSelectedBudgetFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E4DED2] text-xs font-bold text-[#1E3A34] focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">كل الميزانيات ($)</option>
            <option value="FREE_OR_LOW">شبه مجانية / أقل من 1,500$</option>
            <option value="MID">متوسطة (1,500$ - 6,000$)</option>
            <option value="HIGH">أكثر من 6,000$ (كندا / خاص)</option>
          </select>
        </div>
      </div>

      {/* Results Count Strip */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-[#64748B]">
          تم العثور على <strong className="text-[#1E3A34] font-mono">{filteredUniversities.length}</strong> خيار دراسي ملائم
        </span>
        <span className="text-[11px] text-[#78716C]">
          جميع التكاليف موثقة ومحدثة بالدولار الأمريكي ($ USD)
        </span>
      </div>

      {/* Universities Interactive List */}
      <div className="space-y-3.5">
        {filteredUniversities.length > 0 ? (
          filteredUniversities.map(univ => {
            const isExpanded = expandedUnivId === univ.id;

            return (
              <div
                key={univ.id}
                className="bg-white rounded-2xl border border-[#E4DED2] shadow-xs hover:border-[#5F8F86] transition-all overflow-hidden"
              >
                {/* Main Visible Row */}
                <div
                  onClick={() => toggleExpand(univ.id)}
                  className="p-4 sm:p-5 cursor-pointer hover:bg-[#FAF8F5]/60 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Left: Univ Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg">{univ.flagEmoji}</span>
                        <h3 className="text-base font-black text-[#1E3A34] tracking-tight">
                          {univ.nameAr}
                        </h3>
                        <span className="text-[11px] text-[#64748B] font-mono" dir="ltr">
                          ({univ.nameOriginal})
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF0E2] text-[#8C5D23] border border-[#E8CDA8]">
                          {univ.worldRankRange}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-[#64748B] pt-0.5 flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#5F8F86]" />
                          <span>{univ.cityAr}، {univ.countryNameAr}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-medium">
                          <Languages className="w-3.5 h-3.5 text-[#5F8F86]" />
                          <span>{univ.teachingLanguage.join(' • ')}</span>
                        </span>
                      </div>

                      {/* Major Badges */}
                      <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
                        {univ.popularMajors.slice(0, 3).map((major, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium bg-[#F7F3EA] text-[#475569] px-2 py-0.5 rounded-md border border-[#E4DED2]"
                          >
                            {major}
                          </span>
                        ))}
                        {univ.popularMajors.length > 3 && (
                          <span className="text-[10px] text-[#78716C]">+{univ.popularMajors.length - 3} تخصصات</span>
                        )}
                      </div>
                    </div>

                    {/* Right: Score, Cost & Expand Toggle */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E4DED2]">
                      {/* Minimum BAC Required */}
                      <div className="bg-[#FAF8F5] border border-[#E4DED2] p-2 rounded-xl text-center min-w-[90px]">
                        <span className="text-[10px] text-[#78716C] block font-medium">معدل البكالوريا</span>
                        <span className="text-sm font-black text-[#1E3A34] font-mono">
                          {univ.minimumBacAverage.toFixed(2)}+
                        </span>
                        <span className="text-[9px] text-[#5F8F86] block font-bold">حد أدنى مقبول</span>
                      </div>

                      {/* Annual Tuition in USD */}
                      <div className="bg-[#E8F2EB] border border-[#AFC8BD] p-2 rounded-xl text-center min-w-[110px]">
                        <span className="text-[10px] text-[#245248] block font-medium">الرسوم السنوية</span>
                        <span className="text-sm font-black text-[#2C5E54] font-mono">
                          ${univ.tuitionUsdPerYear.min.toLocaleString()} - ${univ.tuitionUsdPerYear.max.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-[#245248] block font-bold">USD / سنة</span>
                      </div>

                      {/* Chevron Indicator */}
                      <div className="p-2 rounded-xl bg-[#FAF8F5] text-[#78716C]">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable Accordion Body */}
                {isExpanded && (
                  <div className="border-t border-[#E4DED2] bg-[#FAF8F5] p-4 sm:p-5 space-y-4 animate-in fade-in duration-200">
                    {/* Cost Breakdown Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-[#E4DED2] space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A34]">
                          <CreditCard className="w-3.5 h-3.5 text-[#5F8F86]" />
                          <span>تفاصيل المصاريف الجامعية:</span>
                        </div>
                        <p className="text-xs text-[#475569] leading-relaxed">
                          {univ.tuitionUsdPerYear.notesAr}
                        </p>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-[#E4DED2] space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A34]">
                          <Building2 className="w-3.5 h-3.5 text-[#5F8F86]" />
                          <span>تكاليف المعيشة السنوية (السكن والإطعام):</span>
                        </div>
                        <p className="text-xs text-[#475569] leading-relaxed">
                          حوالي <strong className="font-mono text-[#1E3A34]">${univ.livingCostUsdPerYear.min.toLocaleString()} - ${univ.livingCostUsdPerYear.max.toLocaleString()}</strong> سنوياً. {univ.livingCostUsdPerYear.notesAr}
                        </p>
                      </div>
                    </div>

                    {/* Requirements & Language */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white p-3.5 rounded-xl border border-[#E4DED2] space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A34]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2C5E54]" />
                          <span>شروط القبول لشهادة البكالوريا الجزائرية:</span>
                        </div>
                        <ul className="text-xs space-y-1 text-[#475569] list-disc list-inside">
                          {univ.admissionRequirements.map((req, i) => (
                            <li key={i}>{req}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-[#E4DED2] space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A34]">
                          <Languages className="w-3.5 h-3.5 text-[#5F8F86]" />
                          <span>مستوى اللغة المطلوب:</span>
                        </div>
                        <ul className="text-xs space-y-1 text-[#475569]">
                          {univ.languageRequirements.map((lang, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#5F8F86]" />
                              <span>{lang}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Visa & Procedures for Algerians */}
                    <div className="bg-[#E8F2EB]/50 border border-[#AFC8BD] p-3.5 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#1E3A34] flex items-center gap-1.5">
                          <Plane className="w-3.5 h-3.5 text-[#2C5E54]" />
                          <span>خطوات الفيزا والتسجيل للطلبة الجزائريين: {univ.visaAndProcedures.procedureNameAr}</span>
                        </span>
                        {univ.visaAndProcedures.officialPortalUrl && (
                          <a
                            href={univ.visaAndProcedures.officialPortalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2C5E54] hover:underline"
                          >
                            <span>البوابة الرسمية</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <p className="text-[#334155] text-[11px] leading-relaxed">
                        {univ.visaAndProcedures.descriptionAr}
                      </p>
                    </div>

                    {/* Scholarships Available */}
                    {univ.scholarshipsAvailable.length > 0 && (
                      <div className="bg-[#FAF0E2] border border-[#E8CDA8] p-3.5 rounded-xl space-y-1.5 text-xs">
                        <span className="font-bold text-[#8C5D23] flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-[#D7A66A]" />
                          <span>المنح الدراسية المتاحة:</span>
                        </span>
                        <div className="space-y-1">
                          {univ.scholarshipsAvailable.map((schol, i) => (
                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-1">
                              <span className="font-bold text-[#1E3A34]">
                                • {schol.nameAr}: <span className="font-normal text-[#475569]">{schol.coverageAr}</span>
                              </span>
                              {schol.deadlineAr && (
                                <span className="text-[#8C5D23] font-mono text-[10px] shrink-0">
                                  (الموعد: {schol.deadlineAr})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Link to Official University Portal */}
                    <div className="flex items-center justify-end pt-1">
                      <a
                        href={univ.officialWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-[#1E3A34] hover:bg-[#2C5E54] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                      >
                        <span>زيارة البوابة الرسمية للجامعة</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-10 text-center bg-white rounded-2xl border border-[#E4DED2] text-[#475569]">
            <GraduationCap className="w-10 h-10 text-[#78716C] mx-auto mb-2" />
            <h3 className="font-bold text-[#1E3A34] text-sm mb-1">
              لا توجد جامعات مطابقة لمعايير البحث الحالية
            </h3>
            <p className="text-xs text-[#64748B] max-w-sm mx-auto mb-3">
              جرب تغيير الدولة أو مسح الفلاتر لعرض الخيارات الأخرى.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCountryCode('ALL');
                setSearchQuery('');
                setSelectedMajorFilter('ALL');
                setSelectedBudgetFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-[#2C5E54] text-white font-bold text-xs cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة تعيين الفلاتر</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
