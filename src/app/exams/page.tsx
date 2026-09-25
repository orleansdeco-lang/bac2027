"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { BacExamItem } from "@/data/exams";
import { ExamPdfViewerModal } from "@/components/exams/ExamPdfViewerModal";
import { ALL_SUBJECTS, ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import { StreamId, SubjectId } from "@/types/education";
import { useAuth } from "@/lib/auth/context";
import { StudentService } from "@/lib/services";
import { BacContentService } from "@/lib/services/bac-content-service";
import { BacMasterItem, MasterInventoryStats } from "@/lib/content/bac-inventory";
import {
  FileText,
  CheckCircle2,
  Download,
  Share2,
  Search,
  Filter,
  Calendar,
  Layers,
  Sparkles,
  BookOpen,
  Award,
  ExternalLink,
  Check,
  RotateCcw,
  Clock,
  ArrowUpDown,
  GraduationCap,
  ChevronLeft,
  RefreshCw,
  LayoutGrid,
  List,
  ChevronDown,
  ShieldCheck,
  HelpCircle,
  FolderOpen,
} from "lucide-react";

// Stream Options (Current + Historical)
const CURRENT_STREAMS = [
  { id: "sciences_exp", name_ar: "علوم تجريبية", code: "SE" },
  { id: "math", name_ar: "رياضيات", code: "M" },
  { id: "technique_math", name_ar: "تقني رياضي", code: "TM" },
  { id: "gestion_eco", name_ar: "تسيير واقتصاد", code: "GE" },
  { id: "lettres_philo", name_ar: "آداب وفلسفة", code: "LP" },
  { id: "langues_etrangeres", name_ar: "لغات أجنبية", code: "LE" },
  { id: "arts", name_ar: "فنون", code: "ART" },
];

const HISTORICAL_STREAMS = [
  { id: "sciences_nature_vie", name_ar: "علوم الطبيعة والحياة (قديم)", code: "SNV" },
  { id: "sciences_exactes", name_ar: "علوم دقيقة (قديم)", code: "SE_OLD" },
  { id: "technologie", name_ar: "تكنولوجيا (قديم)", code: "TECH" },
  { id: "sciences_eco_gestion", name_ar: "علوم اقتصادية وتسيير (قديم)", code: "ECO" },
  { id: "lettres_sciences_humaines", name_ar: "آداب وعلوم إنسانية (قديم)", code: "LSH" },
  { id: "lettres_langues_vivantes", name_ar: "آداب ولغات حية (قديم)", code: "LLV" },
];

const ALL_STREAMS_LIST = [
  { id: "all", name_ar: "كل الشعب", code: "ALL" },
  ...CURRENT_STREAMS,
  ...HISTORICAL_STREAMS,
];

const CONTENT_TYPES = [
  { id: "all", label: "جميع الأنواع", icon: "📚" },
  { id: "bac_official", label: "بكالوريا رسمية", icon: "🏛️" },
  { id: "bac_blanc", label: "بكالوريا تجريبية", icon: "🏆" },
  { id: "term_exam", label: "اختبارات فصول", icon: "📝" },
  { id: "term_quiz", label: "فروض محروسة", icon: "⚡" },
];

const DECADE_PRESETS = [
  { id: "all", label: "كل السنوات" },
  { id: "2020s", label: "2020 — 2026" },
  { id: "2010s", label: "2010 — 2019" },
  { id: "2000s", label: "2000 — 2009" },
  { id: "1990s", label: "1990 — 1999" },
];

export function ExamsView({ embedded = false }: { embedded?: boolean }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // Inventory State
  const [inventoryItems, setInventoryItems] = useState<BacMasterItem[]>([]);
  const [stats, setStats] = useState<MasterInventoryStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Filters State
  const [selectedStream, setSelectedStream] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [selectedDecade, setSelectedDecade] = useState<string>("all");
  const [selectedContentType, setSelectedContentType] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<string>("all");
  const [hasSolutionOnly, setHasSolutionOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "most_detailed">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [displayCount, setDisplayCount] = useState<number>(32);

  // Modal State
  const [activeModalExam, setActiveModalExam] = useState<BacExamItem | null>(null);
  const [modalTab, setModalTab] = useState<"subject" | "solution">("subject");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial Load of Master Inventory
  useEffect(() => {
    let isMounted = true;
    BacContentService.loadAllInventory().then((res) => {
      if (isMounted) {
        setInventoryItems(res.items);
        if (res.stats) setStats(res.stats);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-detect student's default stream from profile if available
  useEffect(() => {
    if (user?.id && selectedStream === "all" && !searchParams.get("stream")) {
      StudentService.getProfile(user.id).then((profile) => {
        if (profile?.streamId && ALGERIAN_BAC_STREAMS[profile.streamId as StreamId]) {
          setSelectedStream(profile.streamId);
        }
      });
    }
  }, [user]);

  // Read URL query parameters on initial mount (Deep Link Support)
  useEffect(() => {
    const urlStream = searchParams.get("stream");
    const urlSubject = searchParams.get("subject");
    const urlYear = searchParams.get("year");
    const urlSession = searchParams.get("session");
    const urlExamId = searchParams.get("examId");
    const urlTab = searchParams.get("tab") as "subject" | "solution" | null;
    const urlContentType = searchParams.get("type");

    if (urlStream && ALL_STREAMS_LIST.some((s) => s.id === urlStream)) {
      setSelectedStream(urlStream);
    }
    if (urlSubject) setSelectedSubject(urlSubject);
    if (urlYear && !isNaN(Number(urlYear))) setSelectedYear(Number(urlYear));
    if (urlSession) setSelectedSession(urlSession);
    if (urlContentType) setSelectedContentType(urlContentType);

    if (urlExamId && inventoryItems.length > 0) {
      const foundExam = inventoryItems.find((e) => e.id === urlExamId);
      if (foundExam) {
        setActiveModalExam(foundExam);
        if (urlTab === "solution" || urlTab === "subject") setModalTab(urlTab);
      }
    }
  }, [searchParams, inventoryItems]);

  // Handle Online Sync
  const handleOnlineSync = async () => {
    setIsSyncing(true);
    setSyncMessage("جاري الاتصال بالمستودع الرقمي الوطني ومزامنة أحدث المواضيع...");
    try {
      const res = await BacContentService.triggerOnlineSync();
      if (res.success) {
        const refreshed = await BacContentService.loadAllInventory(true);
        setInventoryItems(refreshed.items);
        if (res.stats) setStats(res.stats);
        triggerToast(`✅ ${res.message} (${refreshed.items.length} موضوع موثق)`);
      } else {
        triggerToast(`⚠️ ${res.message}`);
      }
    } catch (e) {
      triggerToast("تعذر التحديث أونلاين حالياً، تحقق من الشبكة");
    } finally {
      setIsSyncing(false);
      setSyncMessage(null);
    }
  };

  // Dynamic Subjects List based on Selected Stream + item count
  const availableSubjects = useMemo(() => {
    let pool = inventoryItems;
    if (selectedStream !== "all") {
      pool = pool.filter((item) => item.streamId === selectedStream);
    }

    const counts: Record<string, number> = {};
    for (const item of pool) {
      counts[item.subjectId] = (counts[item.subjectId] || 0) + 1;
    }

    const subjectIds = Object.keys(counts);
    return subjectIds.map((id) => {
      const sampleItem = pool.find((it) => it.subjectId === id);
      const meta = ALL_SUBJECTS[id as SubjectId];
      return {
        id,
        name: sampleItem?.subject_name || meta?.name_ar || id,
        count: counts[id],
      };
    });
  }, [inventoryItems, selectedStream]);

  // All distinct years available in current dataset
  const allYears = useMemo(() => {
    const set = new Set<number>();
    for (const item of inventoryItems) {
      if (item.year) set.add(item.year);
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [inventoryItems]);

  // Fast Client-Side Multi-Faceted Filtering
  const filteredExams = useMemo(() => {
    return BacContentService.filterItems(inventoryItems, {
      stream: selectedStream,
      subject: selectedSubject,
      year: selectedYear === 0 ? "all" : selectedYear,
      decade: selectedDecade as any,
      contentType: selectedContentType as any,
      session: selectedSession as any,
      hasSolution: hasSolutionOnly ? "yes" : "all",
      searchQuery,
      sortBy,
    });
  }, [
    inventoryItems,
    selectedStream,
    selectedSubject,
    selectedYear,
    selectedDecade,
    selectedContentType,
    selectedSession,
    hasSolutionOnly,
    searchQuery,
    sortBy,
  ]);

  const displayedExams = useMemo(() => {
    return filteredExams.slice(0, displayCount);
  }, [filteredExams, displayCount]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleShareExam = async (exam: BacExamItem, tab: "subject" | "solution" = "subject") => {
    try {
      const url = `${window.location.origin}/exams?stream=${exam.streamId}&subject=${exam.subjectId}&year=${exam.year}&examId=${encodeURIComponent(exam.id)}&tab=${tab}`;
      await navigator.clipboard.writeText(url);
      triggerToast("✅ تم نسخ رابط الموضوع والتصحيح بنجاح!");
    } catch (err) {
      triggerToast("تعذر نسخ الرابط تلقائياً");
    }
  };

  const handleOpenModal = (exam: BacExamItem, tab: "subject" | "solution") => {
    setActiveModalExam(exam);
    setModalTab(tab);
  };

  const handleResetFilters = () => {
    setSelectedStream("all");
    setSelectedSubject("all");
    setSelectedYear(0);
    setSelectedDecade("all");
    setSelectedContentType("all");
    setSelectedSession("all");
    setHasSolutionOnly(false);
    setSearchQuery("");
    setDisplayCount(32);
  };

  const hasActiveFilters =
    selectedStream !== "all" ||
    selectedSubject !== "all" ||
    selectedYear !== 0 ||
    selectedDecade !== "all" ||
    selectedContentType !== "all" ||
    selectedSession !== "all" ||
    hasSolutionOnly ||
    searchQuery.trim().length > 0;

  const innerContent = (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {activeModalExam && (
        <ExamPdfViewerModal
          exam={activeModalExam}
          initialTab={modalTab}
          onClose={() => {
            setActiveModalExam(null);
            const url = new URL(window.location.href);
            url.searchParams.delete("examId");
            url.searchParams.delete("tab");
            window.history.replaceState({}, "", url.toString());
          }}
        />
      )}

      <Container size="lg" className="py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* ================================================================= */}
        {/* 1. TOP BREADCRUMB & ONLINE SYNC ACTION BAR                       */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-3.5 py-2 rounded-2xl bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20">
              بنك البكالوريا الشامل ({stats?.totalItems || inventoryItems.length} موضوع)
            </span>
            <span className="text-theme-muted">/</span>
            <Link
              href="/exams/terms"
              className="px-3.5 py-2 rounded-2xl border border-theme bg-card hover:bg-card-hover text-theme-secondary hover:text-theme-text transition-all inline-flex items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
              <span>فروض واختبارات الفصول وبكالوريا تجريبية</span>
            </Link>
          </div>

          {/* ONLINE UPDATE BUTTON */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSyncing}
              onClick={handleOnlineSync}
              className={`px-4 py-2 rounded-2xl text-xs font-bold inline-flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                isSyncing
                  ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 cursor-wait"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 active:scale-98"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "جاري التحديث أونلاين..." : "تحديث أونلاين 🔄"}</span>
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* 2. HERO HEADER WITH LIVE STATS                                    */}
        {/* ================================================================= */}
        <header className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-stone-900 border border-indigo-900/40 p-6 sm:p-10 shadow-clay text-white">
          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>أكبر قاعدة معطيات مهيكلة للبكالوريا الجزائرية (1990 — 2026)</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              بنك مواضيع وحلول البكالوريا الجزائرية
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl font-sans">
              تصفح وحمل واطبع كل مواضيع شهادة البكالوريا الرسمية، البكالوريات التجريبية، اختبارات الفصول، والفروض المحروسة مع الحلول النموذجية وسلم التنقيط المعتمد لكافة الشعب السارية والنظام القديم.
            </p>

            {/* Quick Metrics Live Badges */}
            <div className="flex items-center gap-3 sm:gap-6 pt-2 flex-wrap text-xs text-slate-200">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm font-bold">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>37 سنة (1990 → 2026)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm font-bold">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>13 شعبة (حالية + قديمة)</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm font-bold">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>22 مادة رسمية</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 backdrop-blur-sm font-bold">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>وثائق إدارية عامة (الأمر 03-05)</span>
              </div>
            </div>
          </div>

          <div className="absolute top-0 end-0 -mt-10 -me-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        </header>

        {/* ================================================================= */}
        {/* 3. ADVANCED FILTER & SEARCH CONTROLS                               */}
        {/* ================================================================= */}
        <section className="p-4 sm:p-6 rounded-3xl bg-surface border border-theme shadow-clay space-y-5">
          {/* Smart Search Input with Clear Button */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-theme-secondary">
              البحث الفوري الذكي (بالعنوان، المادة، الشعبة، المفهوم، أو المصدر):
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-theme-muted absolute top-3 end-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="مثال: رياضيات علوم تجريبية 2024، فيزياء النووي، فلسفة شعب أدبية..."
                className="w-full py-2.5 pe-10 ps-4 text-xs sm:text-sm rounded-2xl bg-card border border-theme text-theme-text placeholder:text-theme-muted focus:outline-hidden focus:ring-2 focus:ring-[var(--color-primary)] transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute top-2.5 start-3 text-xs text-theme-muted hover:text-theme-text font-bold px-1.5 py-0.5 rounded-md bg-stone-500/10 cursor-pointer"
                >
                  مسح
                </button>
              )}
            </div>
          </div>

          {/* 1. Stream Selector Tabs (Categorized: Current vs Historical) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-theme-secondary">
                1. الشعبة:
              </label>
              <span className="text-[11px] text-theme-muted">
                {selectedStream === "all" ? "عرض جميع الشعب" : ALL_STREAMS_LIST.find((s) => s.id === selectedStream)?.name_ar}
              </span>
            </div>

            {/* Current Streams */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1.5 scrollbar-none">
              <button
                type="button"
                onClick={() => {
                  setSelectedStream("all");
                  setSelectedSubject("all");
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStream === "all"
                    ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20 scale-[1.02]"
                    : "bg-card text-theme-secondary hover:text-theme-text hover:bg-card-hover border border-theme"
                }`}
              >
                كل الشعب
              </button>

              {CURRENT_STREAMS.map((s) => {
                const isSelected = selectedStream === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedStream(s.id);
                      setSelectedSubject("all");
                    }}
                    className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20 scale-[1.02]"
                        : "bg-card text-theme-secondary hover:text-theme-text hover:bg-card-hover border border-theme"
                    }`}
                  >
                    {s.name_ar}
                  </button>
                );
              })}
            </div>

            {/* Historical Streams Collapsible or Secondary Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none border-t border-theme/40 text-[11px]">
              <span className="text-theme-muted font-bold whitespace-nowrap text-[10px] me-1">
                النظام القديم:
              </span>
              {HISTORICAL_STREAMS.map((s) => {
                const isSelected = selectedStream === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setSelectedStream(s.id);
                      setSelectedSubject("all");
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-amber-600 text-white font-bold shadow-xs"
                        : "bg-surface text-theme-muted hover:text-theme-text border border-theme/60"
                    }`}
                  >
                    {s.name_ar}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Dynamic Subject Selector Chips */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-theme-secondary">
              2. المادة (ديناميكية حسب الشعبة):
            </label>
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedSubject("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSubject === "all"
                    ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold"
                    : "bg-surface text-theme-secondary hover:text-theme-text border border-theme"
                }`}
              >
                جميع المواد ({inventoryItems.length})
              </button>
              {availableSubjects.map((sub) => {
                const isSelected = selectedSubject === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubject(sub.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold shadow-xs"
                        : "bg-surface text-theme-secondary hover:text-theme-text border border-theme"
                    }`}
                  >
                    <span>{sub.name}</span>
                    <span className="text-[10px] opacity-75 font-mono">({sub.count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Multi-Row Controls: Content Types, Years/Decades, Solution, and View */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 border-t border-theme/60">
            {/* Content Type Filter */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-xs font-bold text-theme-secondary">
                نوع المحتوى:
              </label>
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {CONTENT_TYPES.map((ct) => {
                  const isSelected = selectedContentType === ct.id;
                  return (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => setSelectedContentType(ct.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                        isSelected
                          ? "bg-[var(--color-primary)] text-white shadow-xs"
                          : "bg-card text-theme-secondary border border-theme hover:text-theme-text"
                      }`}
                    >
                      <span>{ct.icon}</span>
                      <span>{ct.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Decade Quick Pills + Year Dropdown */}
            <div className="md:col-span-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-theme-secondary">
                  الحقبة والسنة:
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="text-xs font-mono py-0.5 px-2 rounded-lg bg-card border border-theme text-theme-text"
                >
                  <option value={0}>كل السنوات الفردية</option>
                  {allYears.map((yr) => (
                    <option key={yr} value={yr}>
                      سنة {yr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none font-mono text-xs">
                {DECADE_PRESETS.map((dec) => {
                  const isSelected = selectedDecade === dec.id && selectedYear === 0;
                  return (
                    <button
                      key={dec.id}
                      type="button"
                      onClick={() => {
                        setSelectedDecade(dec.id);
                        setSelectedYear(0);
                      }}
                      className={`px-2 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                          : "bg-card text-theme-secondary border border-theme hover:text-theme-text"
                      }`}
                    >
                      {dec.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Solution Filter & View Mode & Sorting */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-xs font-bold text-theme-secondary">
                خيارات العرض والحل:
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {/* With Solution Only Toggle */}
                <button
                  type="button"
                  onClick={() => setHasSolutionOnly(!hasSolutionOnly)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                    hasSolutionOnly
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                      : "bg-card text-theme-secondary border-theme hover:text-theme-text"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>مع الحل النموذجي فقط</span>
                </button>

                {/* Sort By Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs py-1.5 px-2 rounded-xl bg-card border border-theme text-theme-text cursor-pointer"
                >
                  <option value="newest">الأحدث (2026 ← 1990)</option>
                  <option value="oldest">الأقدم (1990 ← 2026)</option>
                  <option value="most_detailed">المواضيع ذات الحل أولاً</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-card border border-theme rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    title="عرض بطاقات"
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-[var(--color-primary)] text-white shadow-xs"
                        : "text-theme-muted hover:text-theme-text"
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("table")}
                    title="عرض جدول مختصر"
                    className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === "table"
                        ? "bg-[var(--color-primary)] text-white shadow-xs"
                        : "text-theme-muted hover:text-theme-text"
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Filter Summary Bar & Reset Action */}
          <div className="flex items-center justify-between text-xs text-theme-secondary pt-2 border-t border-theme/40 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span>
                النتائج المطابقة: <strong className="text-theme-text font-mono font-bold text-sm">{filteredExams.length}</strong> موضوع
              </span>
              {filteredExams.length > displayedExams.length && (
                <span className="text-[11px] text-theme-muted">
                  (معروض منها {displayedExams.length})
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إلغاء جميع الفلاتر</span>
              </button>
            )}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 4. CONTENT DISPLAY (GRID CARDS OR COMPACT TABLE)                  */}
        {/* ================================================================= */}
        {isLoading ? (
          <div className="p-16 text-center rounded-3xl bg-surface border border-theme shadow-clay">
            <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center mx-auto mb-3 animate-spin">
              <RefreshCw className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-theme-text">جاري مزامنة وفهرسة بنك محتوى البكالوريا...</p>
            <p className="text-xs text-theme-muted mt-1">يتم الآن تجهيز 1,365 موضوع رسمي وتحضيري</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-surface border border-theme shadow-clay space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-stone-500/10 text-stone-400 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-theme-text">لم يتم العثور على مواضيع مطابقة للمعايير المحددة</h3>
            <p className="text-xs text-theme-secondary max-w-sm mx-auto">
              جرب تغيير الشعبة أو السنة أو مسح كلمات البحث للاطلاع على مواضيع الأرشيف الوطني.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold shadow-md cursor-pointer"
            >
              عرض جميع المواضيع ({inventoryItems.length})
            </button>
          </div>
        ) : viewMode === "grid" ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
            {displayedExams.map((exam) => {
              const stream = ALGERIAN_BAC_STREAMS[exam.streamId as StreamId];
              const subject = ALL_SUBJECTS[exam.subjectId as SubjectId];

              const isOfficial = exam.content_type === "bac_official" || exam.kind === "official_bac";
              const isBlanc = exam.content_type === "bac_blanc" || exam.kind === "bac_blanc";
              const isExam = exam.content_type === "term_exam" || exam.kind === "term_exam";

              return (
                <div
                  key={exam.id}
                  className="p-5 rounded-3xl bg-surface border border-theme shadow-clay flex flex-col justify-between hover:border-[var(--color-primary)]/40 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="space-y-3">
                    {/* Header Badges: Year, Type, and Session */}
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-primary)]/20 text-xs font-black font-mono">
                          {exam.year}
                        </span>

                        {isOfficial && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">
                            بكالوريا رسمية
                          </span>
                        )}
                        {isBlanc && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                            بكالوريا تجريبية
                          </span>
                        )}
                        {isExam && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 text-[10px] font-bold">
                            اختبار فصلي
                          </span>
                        )}
                        {exam.session === "exceptional" && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold">
                            دورة استثنائية
                          </span>
                        )}
                      </div>

                      {/* Quick Share Button */}
                      <button
                        type="button"
                        onClick={() => handleShareExam(exam, "subject")}
                        title="مشاركة رابط الموضوع"
                        className="p-1.5 rounded-xl border border-theme bg-card hover:bg-card-hover text-theme-secondary hover:text-theme-text transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Title and Subject */}
                    <div>
                      <h3 className="text-sm font-bold text-theme-text font-sans group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                        {exam.title_ar}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-theme-secondary mt-1 font-sans">
                        <span>{exam.stream_name || stream?.name_ar}</span>
                        <span>•</span>
                        <span>{exam.subject_name || subject?.name_ar}</span>
                      </div>
                    </div>

                    {/* Specs & Source Info */}
                    <div className="flex items-center gap-1.5 pt-1 flex-wrap text-[10px] text-theme-muted font-sans">
                      <span className="px-2 py-0.5 rounded-md bg-card border border-theme">
                        المعامل: <strong className="text-theme-text">{exam.coefficient || 5}</strong>
                      </span>
                      {exam.has_solution ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>مع الحل النموذجي</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-stone-500/10 text-stone-500 border border-stone-500/20">
                          موضوع فقط
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-card border border-theme truncate max-w-[120px]" title={exam.source_name}>
                        {exam.source_name || "ONEC"}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons: View Topic & View Solution */}
                  <div className="pt-4 mt-4 border-t border-theme/60 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(exam, "subject")}
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold shadow-sm hover:opacity-95 active:scale-98 transition-all cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>موضوع الامتحان</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenModal(exam, "solution")}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold shadow-sm active:scale-98 transition-all cursor-pointer ${
                          exam.has_solution
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                            : "bg-card text-theme-muted border border-theme hover:text-theme-text"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{exam.has_solution ? "التصحيح الوزاري" : "عناصر الإجابة"}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between px-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(exam, "subject")}
                        className="text-theme-secondary hover:text-[var(--color-primary)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>معاينة وتحميل PDF</span>
                      </button>

                      {exam.alternate_sources && exam.alternate_sources.length > 0 && (
                        <span className="text-[10px] text-theme-muted font-mono" title={`${exam.alternate_sources.length} مرايا رقمية معتمدة`}>
                          +{exam.alternate_sources.length} مصادر بديلة
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* COMPACT TABLE VIEW */
          <div className="rounded-3xl bg-surface border border-theme shadow-clay overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-card border-b border-theme text-theme-secondary font-bold select-none">
                  <tr>
                    <th className="py-3 px-4 text-start">السنة</th>
                    <th className="py-3 px-4 text-start">الشعبة</th>
                    <th className="py-3 px-4 text-start">المادة</th>
                    <th className="py-3 px-4 text-start">عنوان الموضوع</th>
                    <th className="py-3 px-4 text-start">النوع</th>
                    <th className="py-3 px-4 text-start">الحل</th>
                    <th className="py-3 px-4 text-start">المصدر</th>
                    <th className="py-3 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme/60">
                  {displayedExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-card/50 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-black text-theme-text">
                        {exam.year}
                      </td>
                      <td className="py-2.5 px-4 text-theme-secondary font-sans whitespace-nowrap">
                        {exam.stream_name || ALGERIAN_BAC_STREAMS[exam.streamId as StreamId]?.name_ar}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-theme-text whitespace-nowrap">
                        {exam.subject_name || ALL_SUBJECTS[exam.subjectId as SubjectId]?.name_ar}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-theme-text max-w-xs truncate">
                        {exam.title_ar}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-500">
                          {exam.content_type === "bac_official"
                            ? "بكالوريا رسمية"
                            : exam.content_type === "bac_blanc"
                            ? "بكالوريا تجريبية"
                            : exam.content_type === "term_exam"
                            ? "اختبار فصلي"
                            : "فرض"}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {exam.has_solution ? (
                          <span className="text-emerald-500 font-bold text-[11px] flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>متوفر</span>
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[11px]">بدون حل</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-theme-muted whitespace-nowrap">
                        {exam.source_name || "ONEC"}
                      </td>
                      <td className="py-2.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenModal(exam, "subject")}
                            className="px-2.5 py-1 rounded-lg bg-[var(--color-primary)] text-white font-bold text-[11px] hover:opacity-90 cursor-pointer"
                          >
                            الموضوع
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenModal(exam, "solution")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 cursor-pointer"
                          >
                            التصحيح
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Load More Button */}
        {filteredExams.length > displayedExams.length && (
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => setDisplayCount((c) => c + 32)}
              className="px-6 py-2.5 rounded-2xl bg-card border border-theme hover:bg-card-hover text-theme-text font-bold text-xs shadow-sm inline-flex items-center gap-2 cursor-pointer transition-all active:scale-98"
            >
              <span>عرض المزيد من المواضيع ({filteredExams.length - displayedExams.length} موضوع متبقي)</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </Container>
    </>
  );

  if (embedded) {
    return innerContent;
  }

  return <AppShell activeNav="exams">{innerContent}</AppShell>;
}

export default function ExamsPage() {
  return (
    <Suspense
      fallback={
        <AppShell activeNav="exams">
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                <FileText className="w-6 h-6 animate-spin" />
              </div>
              <p className="text-xs text-theme-muted font-sans">
                جاري تحميل بنك امتحانات البكالوريا الشامل...
              </p>
            </div>
          </div>
        </AppShell>
      }
    >
      <ExamsView />
    </Suspense>
  );
}
