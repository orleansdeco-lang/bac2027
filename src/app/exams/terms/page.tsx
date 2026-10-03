"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { ResourceInAppPdfModal } from "@/components/exams/ResourceInAppPdfModal";
import { ALL_SUBJECTS, ALGERIAN_BAC_STREAMS, getStreamBranches } from "@/lib/constants/streams";
import { classifyContentItem } from "@/lib/content/stream-classifier";
import { StreamId, SubjectId } from "@/types/education";
import { useAuth } from "@/lib/auth/context";
import { StudentService } from "@/lib/services";
import { BacContentService } from "@/lib/services/bac-content-service";
import { supabase } from "@/lib/supabase/client";
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
  RotateCcw,
  Clock,
  School,
  MapPin,
  GraduationCap,
  ArrowRight,
  ChevronLeft,
  RefreshCw,
  LayoutGrid,
  List,
  ChevronDown,
  Check,
} from "lucide-react";

// Streams List
const STREAMS_LIST = [
  { id: "all", name_ar: "كل الشعب", code: "ALL" },
  { id: "sciences_exp", name_ar: "علوم تجريبية", code: "SE" },
  { id: "math", name_ar: "رياضيات", code: "M" },
  { id: "technique_math", name_ar: "تقني رياضي", code: "TM" },
  { id: "gestion_eco", name_ar: "تسيير واقتصاد", code: "GE" },
  { id: "lettres_philo", name_ar: "آداب وفلسفة", code: "LP" },
  { id: "langues_etrangeres", name_ar: "لغات أجنبية", code: "LE" },
  { id: "arts", name_ar: "فنون", code: "ART" },
];

const TERMS_CONFIG = [
  { id: "all", label: "جميع الفصول", badge: "شامل", icon: "📚", desc: "تصفح بنك الفروض والاختبارات لكافة الفصول" },
  { id: 1, label: "الفصل الأول", badge: "ثلاثي 1", icon: "🍂", desc: "فروض واختبارات الوحدات التأسيسية الأولى" },
  { id: 2, label: "الفصل الثاني", badge: "ثلاثي 2", icon: "⚡", desc: "فروض واختبارات الوحدات المركزية المتقدمة" },
  { id: 3, label: "الفصل الثالث", badge: "ثلاثي 3", icon: "🎯", desc: "اختبارات نهاية المنهاج والتحضير للبكالوريا" },
  { id: "bac_blanc", label: "بكالوريا تجريبية", badge: "Bac Blanc", icon: "🏆", desc: "امتحانات شاملة مطابقة لمواصفات البكالوريا الرسمية" },
];

export interface UnifiedResourceExamItem {
  id: string;
  year: number;
  kind: "term_exam" | "term_quiz" | "bac_blanc" | "summary" | "exercise" | "official_bac";
  category: string;
  term: 1 | 2 | 3 | null;
  schoolName: string;
  streamId: string;
  stream_name: string;
  subjectId: string;
  subject_name: string;
  branchId?: string;
  branch_name?: string;
  title_ar: string;
  subjectPdfUrl: string;
  solutionPdfUrl: string;
  pdf_links: string[];
  has_solution: boolean;
  source_name: string;
  source_url: string;
}

function mapSupabaseResourceToExamItem(row: any): UnifiedResourceExamItem {
  const title = row.title || "موضوع تعليمي";
  const yearMatch = title.match(/20\d\d/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : 2024;
  const pdfLinks: string[] = Array.isArray(row.pdf_links) ? row.pdf_links : [];
  const category = row.category || "اختبارات";

  const classified = classifyContentItem({
    title: row.title,
    subject: row.subject,
    stream: row.stream,
    category: row.category,
    url: row.source_url || pdfLinks[0],
  });

  let kind: "term_exam" | "term_quiz" | "bac_blanc" | "summary" | "exercise" = "term_exam";
  if (category === "فروض" || title.includes("فرض")) kind = "term_quiz";
  else if (category === "بكالوريا" || title.includes("بكالوريا") || title.includes("تجريبية")) kind = "bac_blanc";
  else if (category === "ملخصات" || title.includes("ملخص")) kind = "summary";
  else if (category === "تمارين" || title.includes("سلسلة") || title.includes("تمرين")) kind = "exercise";

  const hasSolution = Boolean(
    title.includes("تصحيح") ||
    title.includes("حل") ||
    title.includes("الحل") ||
    pdfLinks.length > 1
  );

  return {
    id: row.id,
    year,
    kind,
    category,
    term: row.term ? (Number(row.term) as 1 | 2 | 3) : null,
    schoolName: "ثانوية جزائرية",
    streamId: classified.streamId,
    stream_name: classified.streamName,
    subjectId: classified.subjectId,
    subject_name: classified.subjectName,
    branchId: classified.branchId,
    branch_name: classified.branchName,
    title_ar: title,
    subjectPdfUrl: pdfLinks[0] || "",
    solutionPdfUrl: pdfLinks[1] || (hasSolution ? pdfLinks[0] : ""),
    pdf_links: pdfLinks,
    has_solution: hasSolution,
    source_name: "موقع الدراسة الجزائري",
    source_url: row.source_url || "",
  };
}

function matchesStream(item: UnifiedResourceExamItem, streamId: string): boolean {
  if (streamId === "all") return true;
  if (item.streamId === streamId) return true;
  if (item.streamId === "common" || item.streamId === "all") return true;
  return false;
}

function matchesKind(item: UnifiedResourceExamItem, kind: string): boolean {
  if (kind === "all") return true;
  if (kind === "term_exam" || kind === "اختبارات") {
    return item.category === "اختبارات" || item.kind === "term_exam" || item.title_ar.includes("اختبار");
  }
  if (kind === "term_quiz" || kind === "فروض") {
    return item.category === "فروض" || item.kind === "term_quiz" || item.title_ar.includes("فرض");
  }
  if (kind === "summaries" || kind === "ملخصات") {
    return item.category === "ملخصات" || item.kind === "summary" || item.title_ar.includes("ملخص");
  }
  if (kind === "exercises" || kind === "تمارين") {
    return item.category === "تمارين" || item.kind === "exercise" || item.title_ar.includes("سلسلة") || item.title_ar.includes("تمرين");
  }
  if (kind === "bac_blanc" || kind === "بكالوريا") {
    return item.category === "بكالوريا" || item.kind === "bac_blanc" || item.title_ar.includes("بكالوريا") || item.title_ar.includes("تجريبية");
  }
  return true;
}

function TermExamsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // Inventory State
  const [allItems, setAllItems] = useState<UnifiedResourceExamItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Filters State
  const [selectedTerm, setSelectedTerm] = useState<number | "all" | "bac_blanc">("all");
  const [selectedKind, setSelectedKind] = useState<string>("all");
  const [selectedStream, setSelectedStream] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [hasSolutionOnly, setHasSolutionOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [displayCount, setDisplayCount] = useState<number>(32);

  // Modal State
  const [activeModalExam, setActiveModalExam] = useState<UnifiedResourceExamItem | null>(null);
  const [modalTab, setModalTab] = useState<"subject" | "solution">("subject");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch real data directly from Supabase resources table with fallback
  useEffect(() => {
    let isMounted = true;

    async function loadResources() {
      setIsLoading(true);
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from("resources")
            .select("*")
            .neq("pdf_links", "{}")
            .order("created_at", { ascending: false })
            .limit(3000);

          if (isMounted && data && data.length > 0) {
            const mapped = data.map(mapSupabaseResourceToExamItem);
            setAllItems(mapped);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Direct Supabase fetch encountered error, attempting fallback:", err);
      }

      // Local inventory fallback if offline or table empty
      BacContentService.loadAllInventory().then((res) => {
        if (isMounted) {
          const fallbackMapped: UnifiedResourceExamItem[] = (res.items || []).map((i) => ({
            id: i.id,
            year: i.year || 2024,
            kind: i.kind || "term_exam",
            category: i.content_type === "term_quiz" ? "فروض" : i.content_type === "bac_blanc" ? "بكالوريا" : "اختبارات",
            term: (i.term as any) || null,
            schoolName: i.source_name || "ثانوية جزائرية",
            streamId: i.streamId || "all",
            stream_name: i.stream_name || ALGERIAN_BAC_STREAMS[i.streamId as StreamId]?.name_ar || "عام / جميع الشعب",
            subjectId: i.subjectId || "all",
            subject_name: i.subject_name || ALL_SUBJECTS[i.subjectId as SubjectId]?.name_ar || "الرياضيات",
            title_ar: i.title_ar,
            subjectPdfUrl: i.subjectPdfUrl || "",
            solutionPdfUrl: i.solutionPdfUrl || "",
            pdf_links: i.subjectPdfUrl ? [i.subjectPdfUrl] : [],
            has_solution: Boolean(i.has_solution),
            source_name: i.source_name || "ثانوية جزائرية",
            source_url: i.source_url || "",
          }));
          setAllItems(fallbackMapped);
          setIsLoading(false);
        }
      });
    }

    loadResources();

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

  // Read URL query parameters on initial mount
  useEffect(() => {
    const urlStream = searchParams.get("stream");
    const urlSubject = searchParams.get("subject");
    const urlTerm = searchParams.get("term");
    const urlKind = searchParams.get("kind");
    const urlExamId = searchParams.get("examId");
    const urlTab = searchParams.get("tab") as "subject" | "solution" | null;

    if (urlStream && STREAMS_LIST.some((s) => s.id === urlStream)) {
      setSelectedStream(urlStream);
    }
    if (urlSubject) setSelectedSubject(urlSubject);
    if (urlTerm) {
      if (urlTerm === "bac_blanc") setSelectedTerm("bac_blanc");
      else if (!isNaN(Number(urlTerm))) setSelectedTerm(Number(urlTerm));
    }
    if (urlKind) setSelectedKind(urlKind);

    if (urlExamId && allItems.length > 0) {
      const foundExam = allItems.find((e) => e.id === urlExamId);
      if (foundExam) {
        handleOpenModal(foundExam, urlTab === "solution" ? "solution" : "subject");
      }
    }
  }, [searchParams, allItems]);

  // Online Sync Handler directly querying Supabase resources table
  const handleOnlineSync = async () => {
    setIsSyncing(true);
    try {
      if (!supabase) {
        throw new Error("Supabase is not configured");
      }
      const { data, error } = await supabase
        .from("resources")
        .select("*")
        .neq("pdf_links", "{}")
        .order("created_at", { ascending: false })
        .limit(3000);

      if (error) throw error;

      if (data && data.length > 0) {
        const mapped = data.map(mapSupabaseResourceToExamItem);
        setAllItems(mapped);
        triggerToast(`✅ تم تحديث ${mapped.length} موضوع من قاعدة البيانات مباشرة`);
      } else {
        triggerToast("لم يتم العثور على سجلات في قاعدة البيانات");
      }
    } catch (e: any) {
      triggerToast("تعذر التحديث أونلاين حالياً، تحقق من الاتصال");
    } finally {
      setIsSyncing(false);
    }
  };

  // Dynamic Subjects based on stream from live resources
  const availableSubjects = useMemo(() => {
    let pool = allItems;
    if (selectedStream !== "all") {
      pool = pool.filter((item) => matchesStream(item, selectedStream));
    }
    const counts: Record<string, number> = {};
    for (const item of pool) {
      const sName = item.subject_name || "الرياضيات";
      counts[sName] = (counts[sName] || 0) + 1;
    }
    return Object.keys(counts).map((name) => ({
      id: name,
      name,
      count: counts[name],
    }));
  }, [allItems, selectedStream]);

  // Available Years
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    for (const item of allItems) {
      if (item.year) set.add(item.year);
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [allItems]);

  // Filtered Items
  const filteredExams = useMemo(() => {
    let result = allItems;

    // Term filter
    if (selectedTerm === "bac_blanc") {
      result = result.filter(
        (i) => i.category === "بكالوريا" || i.kind === "bac_blanc" || i.title_ar.includes("بكالوريا") || i.title_ar.includes("تجريبية")
      );
    } else if (selectedTerm !== "all") {
      result = result.filter((i) => i.term === selectedTerm);
    }

    // Kind / Category filter
    if (selectedKind !== "all") {
      result = result.filter((i) => matchesKind(i, selectedKind));
    }

    // Stream
    if (selectedStream !== "all") {
      result = result.filter((i) => matchesStream(i, selectedStream));
    }

    // Subject
    if (selectedSubject !== "all") {
      result = result.filter((i) => i.subject_name === selectedSubject || i.subjectId === selectedSubject);
    }

    // Year
    if (selectedYear !== 0) {
      result = result.filter((i) => i.year === selectedYear);
    }

    // Has Solution
    if (hasSolutionOnly) {
      result = result.filter((i) => i.has_solution);
    }

    // Search Query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((i) => {
        return (
          i.title_ar.toLowerCase().includes(q) ||
          i.subject_name.toLowerCase().includes(q) ||
          i.stream_name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          String(i.year).includes(q)
        );
      });
    }

    return result;
  }, [
    allItems,
    selectedTerm,
    selectedKind,
    selectedStream,
    selectedSubject,
    selectedYear,
    hasSolutionOnly,
    searchQuery,
  ]);

  const displayedExams = useMemo(() => {
    return filteredExams.slice(0, displayCount);
  }, [filteredExams, displayCount]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareExam = async (exam: UnifiedResourceExamItem) => {
    try {
      const url = `${window.location.origin}/exams/terms?term=${exam.term || "all"}&examId=${encodeURIComponent(exam.id)}`;
      await navigator.clipboard.writeText(url);
      triggerToast("✅ تم نسخ رابط الموضوع بنجاح!");
    } catch (err) {
      triggerToast("تعذر نسخ الرابط");
    }
  };

  const handleOpenModal = (exam: UnifiedResourceExamItem, tab: "subject" | "solution" = "subject") => {
    setActiveModalExam(exam);
    setModalTab(tab);
  };

  const handleResetFilters = () => {
    setSelectedTerm("all");
    setSelectedKind("all");
    setSelectedStream("all");
    setSelectedSubject("all");
    setSelectedYear(0);
    setHasSolutionOnly(false);
    setSearchQuery("");
    setDisplayCount(32);
  };

  const hasActiveFilters =
    selectedTerm !== "all" ||
    selectedKind !== "all" ||
    selectedStream !== "all" ||
    selectedSubject !== "all" ||
    selectedYear !== 0 ||
    hasSolutionOnly ||
    searchQuery.trim().length > 0;

  return (
    <AppShell activeNav="exams">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-stone-700 flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* In-App PDF Modal */}
      {activeModalExam && (
        <ResourceInAppPdfModal
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
        {/* Navigation Switcher & Online Sync */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Link
              href="/exams"
              className="px-3.5 py-2 rounded-2xl border border-theme bg-card hover:bg-card-hover text-theme-secondary hover:text-theme-text transition-all inline-flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>مواضيع البكالوريا الرسمية (1990 — 2026)</span>
            </Link>
            <span className="text-theme-muted">/</span>
            <span className="px-3.5 py-2 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
              بنك الفروض والاختبارات المدرسية ({allItems.length})
            </span>
          </div>

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
            <span>{isSyncing ? "جاري التحديث من Supabase..." : "تحديث أونلاين 🔄"}</span>
          </button>
        </div>

        {/* Hero Section */}
        <header className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-900 to-stone-900 border border-emerald-900/40 p-6 sm:p-10 shadow-clay text-white">
          <div className="relative z-10 max-w-3xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>أرشيف الفروض والاختبارات المدرسية المعتمدة (Supabase Live)</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              فروض واختبارات الفصول وبكالوريا تجريبية
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-sans">
              تدرب على مئات الفروض المحروسة واختبارات الفصول الثلاثة والبكالوريا التجريبية لثانويات الوطن مع روابط التحميل المباشرة لملفات الـ PDF.
            </p>

            <div className="flex items-center gap-4 sm:gap-6 pt-2 flex-wrap text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-bold">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <span>الفصول 1، 2، 3 + البكالوريا التجريبية</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>{allItems.length} موضوع مسجل وموثق بالـ PDF</span>
              </div>
            </div>
          </div>
          <div className="absolute top-0 end-0 -mt-8 -me-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </header>

        {/* Term Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {TERMS_CONFIG.map((term) => {
            const isSelected = selectedTerm === term.id;
            return (
              <button
                key={term.id}
                type="button"
                onClick={() => setSelectedTerm(term.id as any)}
                className={`p-3.5 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-md scale-[1.02]"
                    : "bg-surface text-theme-secondary border-theme hover:bg-card hover:text-theme-text"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{term.icon}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-card border border-theme text-theme-muted"
                  }`}>
                    {term.badge}
                  </span>
                </div>
                <div className="mt-2">
                  <h4 className="font-bold text-xs">{term.label}</h4>
                </div>
              </button>
            );
          })}
        </div>

        {/* Advanced Filters Section */}
        <section className="p-4 sm:p-6 rounded-3xl bg-surface border border-theme shadow-clay space-y-4">
          {/* Instant Search */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-theme-secondary">
              البحث السريع بالعنوان والمفاهيم:
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-theme-muted absolute top-3 end-3.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن فرض، اختبار، مادة، شعبة، سنة..."
                className="w-full py-2.5 pe-10 ps-4 text-xs sm:text-sm rounded-2xl bg-card border border-theme text-theme-text placeholder:text-theme-muted focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Stream Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-theme-secondary">
              الشعبة:
            </label>
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
              {STREAMS_LIST.map((stream) => {
                const isSelected = selectedStream === stream.id;
                return (
                  <button
                    key={stream.id}
                    type="button"
                    onClick={() => {
                      setSelectedStream(stream.id);
                      setSelectedSubject("all");
                    }}
                    className={`px-3 py-1.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-md scale-[1.02]"
                        : "bg-card text-theme-secondary hover:text-theme-text hover:bg-card-hover border border-theme"
                    }`}
                  >
                    {stream.name_ar}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Subject Chips from Real DB */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-theme-secondary">
              المادة الأكاديمية:
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedSubject("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedSubject === "all"
                    ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold"
                    : "bg-surface text-theme-secondary border border-theme"
                }`}
              >
                جميع المواد ({allItems.length})
              </button>
              {availableSubjects.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubject(sub.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedSubject === sub.id
                      ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold shadow-xs"
                      : "bg-surface text-theme-secondary border border-theme"
                  }`}
                >
                  <span>{sub.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({sub.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-theme/60">
            {/* Kind Filter */}
            <div className="md:col-span-5 space-y-1">
              <label className="block text-xs font-bold text-theme-secondary">نوع التقييم:</label>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSelectedKind("all")}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${
                    selectedKind === "all" ? "bg-emerald-600 text-white" : "bg-card border border-theme text-theme-secondary"
                  }`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedKind("اختبارات")}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${
                    selectedKind === "اختبارات" ? "bg-emerald-600 text-white" : "bg-card border border-theme text-theme-secondary"
                  }`}
                >
                  اختبارات
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedKind("فروض")}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${
                    selectedKind === "فروض" ? "bg-emerald-600 text-white" : "bg-card border border-theme text-theme-secondary"
                  }`}
                >
                  فروض
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedKind("ملخصات")}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${
                    selectedKind === "ملخصات" ? "bg-emerald-600 text-white" : "bg-card border border-theme text-theme-secondary"
                  }`}
                >
                  ملخصات
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedKind("تمارين")}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold ${
                    selectedKind === "تمارين" ? "bg-emerald-600 text-white" : "bg-card border border-theme text-theme-secondary"
                  }`}
                >
                  تمارين
                </button>
              </div>
            </div>

            {/* Year Selector */}
            <div className="md:col-span-3 space-y-1">
              <label className="block text-xs font-bold text-theme-secondary">السنة:</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full text-xs font-mono py-1.5 px-3 rounded-xl bg-card border border-theme text-theme-text"
              >
                <option value={0}>كل السنوات المتاحة</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    سنة {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Solution & View Toggle */}
            <div className="md:col-span-4 flex items-center gap-2 pt-4">
              <button
                type="button"
                onClick={() => setHasSolutionOnly(!hasSolutionOnly)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  hasSolutionOnly
                    ? "bg-emerald-600 text-white border-emerald-500"
                    : "bg-card text-theme-secondary border-theme"
                }`}
              >
                <span>مع الحل فقط</span>
              </button>

              <div className="flex items-center bg-card border border-theme rounded-xl p-0.5 ms-auto">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg ${viewMode === "grid" ? "bg-emerald-600 text-white" : "text-theme-muted"}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg ${viewMode === "table" ? "bg-emerald-600 text-white" : "text-theme-muted"}`}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Footer */}
          <div className="flex items-center justify-between text-xs text-theme-secondary pt-2 border-t border-theme/40">
            <span>
              المواضيع المطابقة: <strong className="text-theme-text font-mono font-bold">{filteredExams.length}</strong> موضوع
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-rose-500 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إلغاء الفلاتر</span>
              </button>
            )}
          </div>
        </section>

        {/* Content Render */}
        {isLoading ? (
          <div className="p-16 text-center rounded-3xl bg-surface border border-theme shadow-clay">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-3 animate-spin">
              <RefreshCw className="w-5 h-5" />
            </div>
            <p className="text-xs text-theme-muted">جاري تحميل مواضيع الفصول والاختبارات من قاعدة البيانات...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-surface border border-theme shadow-clay space-y-3">
            <h3 className="text-sm font-bold text-theme-text">لم يتم العثور على نتائج مطابقة للبحث</h3>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
            >
              عرض جميع المواضيع
            </button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {displayedExams.map((exam) => {
              const isQuiz = exam.kind === "term_quiz" || exam.category === "فروض";
              const isBlanc = exam.kind === "bac_blanc" || exam.category === "بكالوريا";
              const directPdfUrl = exam.pdf_links && exam.pdf_links.length > 0 ? exam.pdf_links[0] : "";

              return (
                <div
                  key={exam.id}
                  onClick={() => handleOpenModal(exam, "subject")}
                  className="p-5 rounded-3xl bg-surface border border-theme shadow-clay flex flex-col justify-between hover:border-emerald-500/50 hover:shadow-lg transition-all group cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black font-mono">
                          {exam.year}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-stone-500/10 text-stone-600 dark:text-stone-300 text-[10px] font-bold">
                          {isBlanc
                            ? "بكالوريا تجريبية"
                            : isQuiz
                            ? "فرض محروس"
                            : exam.term
                            ? `اختبار ف${exam.term}`
                            : exam.category}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareExam(exam);
                        }}
                        className="p-1.5 rounded-xl border border-theme bg-card hover:bg-card-hover text-theme-secondary hover:text-theme-text cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-theme-text line-clamp-2 group-hover:text-emerald-500 transition-colors">
                        {exam.title_ar}
                      </h3>
                      <p className="text-[11px] text-theme-secondary mt-1">
                        {exam.stream_name} • {exam.subject_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-theme-muted font-sans flex-wrap">
                      {exam.has_solution ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>مع الحل</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-stone-500/10 text-stone-500">
                          موضوع فقط
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-card border border-theme truncate max-w-[120px]">
                        {exam.source_name}
                      </span>
                    </div>
                  </div>

                  {/* Actions: Large View Button & Compact Download Button */}
                  <div className="pt-4 mt-4 border-t border-theme/60 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal(exam, "subject");
                        }}
                        className="flex-1 py-2.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        title="عرض موضوع الامتحان وقراءته مباشرة داخل الموقع"
                      >
                        <FileText className="w-4 h-4" />
                        <span>عرض الموضوع</span>
                      </button>

                      {exam.has_solution && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenModal(exam, "solution");
                          }}
                          className="py-2.5 px-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                          title="عرض التصحيح النموذجي"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>الحل</span>
                        </button>
                      )}

                      {directPdfUrl && (
                        <a
                          href={`/api/pdf/proxy?url=${encodeURIComponent(directPdfUrl)}&download=1&filename=${encodeURIComponent(
                            `${exam.subject_name}_${exam.title_ar}.pdf`
                          )}`}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="py-2.5 px-3 rounded-2xl bg-card border border-theme hover:bg-card-hover text-theme-secondary hover:text-theme-text text-xs font-bold shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 shrink-0"
                          title="تحميل ملف الـ PDF"
                        >
                          <Download className="w-3.5 h-3.5 text-stone-400" />
                          <span>تحميل</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Table View */
          <div className="rounded-3xl bg-surface border border-theme shadow-clay overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-card border-b border-theme text-theme-secondary font-bold">
                  <tr>
                    <th className="py-3 px-4 text-start">السنة</th>
                    <th className="py-3 px-4 text-start">الشعبة</th>
                    <th className="py-3 px-4 text-start">المادة</th>
                    <th className="py-3 px-4 text-start">العنوان</th>
                    <th className="py-3 px-4 text-start">النوع</th>
                    <th className="py-3 px-4 text-start">الفصل</th>
                    <th className="py-3 px-4 text-start">الحل</th>
                    <th className="py-3 px-4 text-center">التحميل والمعاينة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme/60">
                  {displayedExams.map((exam) => {
                    const directPdf = exam.pdf_links?.[0] || "";
                    return (
                      <tr
                        key={exam.id}
                        onClick={() => handleOpenModal(exam, "subject")}
                        className="hover:bg-card/50 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-4 font-mono font-bold text-theme-text">{exam.year}</td>
                        <td className="py-2.5 px-4 text-theme-secondary">{exam.stream_name}</td>
                        <td className="py-2.5 px-4 font-bold text-theme-text">{exam.subject_name}</td>
                        <td className="py-2.5 px-4 text-theme-text max-w-xs truncate">{exam.title_ar}</td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                            {exam.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-theme-secondary">
                          {exam.term ? `فصل ${exam.term}` : "—"}
                        </td>
                        <td className="py-2.5 px-4">{exam.has_solution ? "✅ متوفر" : "—"}</td>
                        <td className="py-2.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(exam, "subject");
                              }}
                              title="عرض وقراءة موضوع الامتحان مباشرة داخل الموقع"
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <FileText className="w-3 h-3" />
                              <span>عرض</span>
                            </button>
                            {directPdf ? (
                              <a
                                href={`/api/pdf/proxy?url=${encodeURIComponent(directPdf)}&download=1&filename=${encodeURIComponent(
                                  `${exam.subject_name}_${exam.title_ar}.pdf`
                                )}`}
                                download
                                onClick={(e) => e.stopPropagation()}
                                title="تحميل ملف الـ PDF"
                                className="p-1 rounded-lg bg-card border border-theme hover:bg-card-hover text-theme-secondary hover:text-theme-text transition-all shadow-xs"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Load More */}
        {filteredExams.length > displayedExams.length && (
          <div className="text-center pt-4">
            <button
              type="button"
              onClick={() => setDisplayCount((c) => c + 32)}
              className="px-6 py-2.5 rounded-2xl bg-card border border-theme hover:bg-card-hover text-theme-text font-bold text-xs shadow-sm inline-flex items-center gap-2 cursor-pointer"
            >
              <span>عرض المزيد ({filteredExams.length - displayedExams.length} متبقي)</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </Container>
    </AppShell>
  );
}

export default function TermExamsPage() {
  return (
    <Suspense
      fallback={
        <AppShell activeNav="exams">
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <FileText className="w-6 h-6 animate-spin" />
              </div>
              <p className="text-xs text-theme-muted font-sans">
                جاري تحميل فروض واختبارات الفصول من قاعدة البيانات...
              </p>
            </div>
          </div>
        </AppShell>
      }
    >
      <TermExamsContent />
    </Suspense>
  );
}
