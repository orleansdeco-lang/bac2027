"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import {
  TERM_EXAMS_DATABASE,
  BacExamItem,
  filterTermExams,
  AcademicTerm,
  ExamKind,
} from "@/data/exams";
import { ExamPdfViewerModal } from "@/components/exams/ExamPdfViewerModal";
import { ALL_SUBJECTS, ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import { StreamId, SubjectId } from "@/types/education";
import { useAuth } from "@/lib/auth/context";
import { StudentService } from "@/lib/services";
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
} from "lucide-react";

const STREAMS_LIST: { id: StreamId | "all"; name_ar: string; code: string }[] = [
  { id: "all", name_ar: "كل الشعب", code: "ALL" },
  { id: "sciences_exp", name_ar: "علوم تجريبية", code: "SE" },
  { id: "math", name_ar: "رياضيات", code: "M" },
  { id: "technique_math", name_ar: "تقني رياضي", code: "TM" },
  { id: "gestion_eco", name_ar: "تسيير واقتصاد", code: "GE" },
  { id: "lettres_philo", name_ar: "آداب وفلسفة", code: "LP" },
  { id: "langues_etrangeres", name_ar: "لغات أجنبية", code: "LE" },
];

const TERMS_CONFIG: {
  id: AcademicTerm | "all" | "bac_blanc";
  label: string;
  badge: string;
  icon: string;
  desc: string;
}[] = [
  { id: "all", label: "جميع الفصول", badge: "شامل", icon: "📚", desc: "تصفح بنك الفروض والاختبارات لكافة الفصول" },
  { id: 1, label: "الفصل الأول", badge: "ثلاثي 1", icon: "🍂", desc: "فروض واختبارات الوحدات التأسيسية الأولى" },
  { id: 2, label: "الفصل الثاني", badge: "ثلاثي 2", icon: "⚡", desc: "فروض واختبارات الوحدات المركزية المتقدمة" },
  { id: 3, label: "الفصل الثالث", badge: "ثلاثي 3", icon: "🎯", desc: "اختبارات نهاية المنهاج والتحضير للبكالوريا" },
  { id: "bac_blanc", label: "بكالوريا تجريبية", badge: "Bac Blanc", icon: "🏆", desc: "امتحانات شاملة مطابقة لمواصفات البكالوريا الرسمية" },
];

function TermExamsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // Filters State
  const [selectedTerm, setSelectedTerm] = useState<AcademicTerm | "all" | "bac_blanc">("all");
  const [selectedKind, setSelectedKind] = useState<ExamKind | "all">("all");
  const [selectedStream, setSelectedStream] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal State
  const [activeModalExam, setActiveModalExam] = useState<BacExamItem | null>(null);
  const [modalTab, setModalTab] = useState<"subject" | "solution">("subject");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Deep Link Support
  useEffect(() => {
    const urlStream = searchParams.get("stream");
    const urlSubject = searchParams.get("subject");
    const urlTerm = searchParams.get("term");
    const urlKind = searchParams.get("kind") as ExamKind | null;
    const urlExamId = searchParams.get("examId");
    const urlTab = searchParams.get("tab") as "subject" | "solution" | null;

    if (urlStream && STREAMS_LIST.some((s) => s.id === urlStream)) {
      setSelectedStream(urlStream);
    }
    if (urlSubject) {
      setSelectedSubject(urlSubject);
    }
    if (urlTerm) {
      if (urlTerm === "bac_blanc") setSelectedTerm("bac_blanc");
      else if (["1", "2", "3"].includes(urlTerm)) setSelectedTerm(Number(urlTerm) as AcademicTerm);
    }
    if (urlKind && ["term_exam", "term_quiz", "bac_blanc"].includes(urlKind)) {
      setSelectedKind(urlKind);
    }

    if (urlExamId) {
      const foundExam = TERM_EXAMS_DATABASE.find((e) => e.id === urlExamId);
      if (foundExam) {
        setActiveModalExam(foundExam);
        if (urlTab === "solution" || urlTab === "subject") {
          setModalTab(urlTab);
        }
      }
    }
  }, [searchParams]);

  // Filter available subjects based on selected stream
  const availableSubjects = useMemo(() => {
    if (selectedStream === "all") {
      const distinct = Array.from(new Set(TERM_EXAMS_DATABASE.map((e) => e.subjectId)));
      return distinct.map((id) => ({
        id,
        name: ALL_SUBJECTS[id]?.name_ar || id,
      }));
    }
    const streamMeta = ALGERIAN_BAC_STREAMS[selectedStream as StreamId];
    if (!streamMeta) return [];
    return streamMeta.subjects.map((s) => ({
      id: s.subjectId,
      name: ALL_SUBJECTS[s.subjectId]?.name_ar || s.subjectId,
    }));
  }, [selectedStream]);

  // Filtered Exams Result
  const filteredExams = useMemo(() => {
    let effectiveTerm: AcademicTerm | "all" = "all";
    let effectiveKind: ExamKind | "all" = selectedKind;

    if (selectedTerm === "bac_blanc") {
      effectiveKind = "bac_blanc";
    } else if (selectedTerm !== "all") {
      effectiveTerm = selectedTerm;
    }

    return filterTermExams({
      term: effectiveTerm,
      kind: effectiveKind,
      streamId: selectedStream,
      subjectId: selectedSubject,
      searchQuery,
    });
  }, [selectedTerm, selectedKind, selectedStream, selectedSubject, searchQuery]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareExam = async (exam: BacExamItem, tab: "subject" | "solution" = "subject") => {
    try {
      const url = `${window.location.origin}/exams/terms?stream=${exam.streamId}&subject=${exam.subjectId}&term=${exam.term || 1}&examId=${encodeURIComponent(exam.id)}&tab=${tab}`;
      await navigator.clipboard.writeText(url);
      triggerToast("✅ تم نسخ رابط الفرض/الاختبار بنجاح!");
    } catch (err) {
      console.error(err);
      triggerToast("تعذر نسخ الرابط تلقائياً");
    }
  };

  const handleOpenModal = (exam: BacExamItem, tab: "subject" | "solution") => {
    setActiveModalExam(exam);
    setModalTab(tab);
  };

  const handleResetFilters = () => {
    setSelectedTerm("all");
    setSelectedKind("all");
    setSelectedStream("all");
    setSelectedSubject("all");
    setSearchQuery("");
  };

  return (
    <AppShell activeNav="exams">
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
        {/* TOP BREADCRUMB / SWITCHER BAR                                     */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Link
              href="/exams"
              className="px-3 py-1.5 rounded-xl border border-theme bg-card hover:bg-card-hover text-theme-secondary hover:text-theme-text transition-all inline-flex items-center gap-1.5"
            >
              <span>مواضيع البكالوريا الرسمية (2016-2026)</span>
            </Link>
            <span className="text-theme-muted">/</span>
            <span className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-white shadow-xs">
              بنك الفروض والاختبارات الفصلية
            </span>
          </div>

          <Link
            href="/exams"
            className="text-xs text-[var(--color-primary)] hover:underline font-bold inline-flex items-center gap-1"
          >
            <span>الذهاب لأرشيف البكالوريا الرسمية</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* ================================================================= */}
        {/* 1. HERO HEADER                                                    */}
        {/* ================================================================= */}
        <header className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border border-indigo-900/40 p-6 sm:p-10 shadow-clay text-white">
          <div className="relative z-10 max-w-3xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold font-sans">
              <School className="w-3.5 h-3.5 text-emerald-400" />
              <span>فروض واختبارات فصيلة نموذجية من كبرى ثانويات الوطن</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              بنك الفروض والاختبارات حسب الفصول
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-sans">
              بنك شامل ومبوب لفروض واختبارات الفصل الأول، الفصل الثاني، الفصل الثالث، ومواضيع البكالوريا التجريبية (Bac Blanc) من كبرى الثانويات الجزائرية (ثانوية الرياضيات بالقبة، المقراني، العقيد لطفي، بن باديس، مالك بن نبي...) مع نماذج الإجابة وسلم التنقيط الرسمي.
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-4 sm:gap-6 pt-2 flex-wrap text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-bold">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>3 فصول دراسية كاملة</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span>بكالوريا تجريبية شاملة</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>ثانويات النخبة عبر مختلف الولايات</span>
              </div>
            </div>
          </div>

          <div className="absolute top-0 end-0 -mt-8 -me-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        </header>

        {/* ================================================================= */}
        {/* 2. TERM SELECTOR TABS                                             */}
        {/* ================================================================= */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {TERMS_CONFIG.map((term) => {
            const isSelected = selectedTerm === term.id;
            return (
              <button
                key={term.id}
                type="button"
                onClick={() => {
                  setSelectedTerm(term.id);
                  if (term.id === "bac_blanc") {
                    setSelectedKind("bac_blanc");
                  } else {
                    setSelectedKind("all");
                  }
                }}
                className={`p-4 rounded-3xl border text-start flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-br from-[var(--color-primary)] to-indigo-700 text-white border-transparent shadow-lg shadow-[var(--color-primary)]/20 scale-[1.02]"
                    : "bg-surface border-theme hover:border-[var(--color-primary)]/40 hover:bg-card shadow-clay"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span className="text-xl">{term.icon}</span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-card text-theme-secondary border border-theme"
                    }`}
                  >
                    {term.badge}
                  </span>
                </div>
                <div>
                  <h3
                    className={`text-xs sm:text-sm font-bold ${
                      isSelected ? "text-white" : "text-theme-text"
                    }`}
                  >
                    {term.label}
                  </h3>
                  <p
                    className={`text-[10px] line-clamp-1 mt-0.5 ${
                      isSelected ? "text-white/80" : "text-theme-secondary"
                    }`}
                  >
                    {term.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </section>

        {/* ================================================================= */}
        {/* 3. FILTER & SEARCH CONTROLS                                       */}
        {/* ================================================================= */}
        <section className="p-4 sm:p-6 rounded-3xl bg-surface border border-theme shadow-clay space-y-5">
          {/* Stream Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-theme-secondary mb-2">
              1. اختر الشعبة:
            </label>
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
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
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[var(--color-primary)] text-white shadow-md shadow-[var(--color-primary)]/20 scale-[1.02]"
                        : "bg-card text-theme-secondary hover:text-theme-text hover:bg-card-hover border border-theme"
                    }`}
                  >
                    {stream.name_ar}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject Selector Pills */}
          <div>
            <label className="block text-xs font-bold text-theme-secondary mb-2">
              2. المادة:
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
                جميع المواد
              </button>
              {availableSubjects.map((sub) => {
                const isSelected = selectedSubject === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setSelectedSubject(sub.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-bold"
                        : "bg-surface text-theme-secondary hover:text-theme-text border border-theme"
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Exam Type + Search Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-theme/60">
            {/* Kind Selector */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="block text-xs font-bold text-theme-secondary">
                3. نوع الموضوع:
              </label>
              <div className="flex items-center gap-1">
                {[
                  { id: "all", label: "الكل" },
                  { id: "term_quiz", label: "فروض محروسة" },
                  { id: "term_exam", label: "اختبارات فصلية" },
                  { id: "bac_blanc", label: "بكالوريا تجريبية" },
                ].map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => setSelectedKind(k.id as any)}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${
                      selectedKind === k.id
                        ? "bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900"
                        : "bg-card text-theme-secondary border border-theme"
                    }`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="md:col-span-7 space-y-1.5">
              <label className="block text-xs font-bold text-theme-secondary">
                بحث بالثانوية، الولاية، أو عنوان الدرس:
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-theme-muted absolute top-2.5 end-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="مثال: ثانوية القبة، المناعة، الدوال الأسية، وهران..."
                  className="w-full py-1.5 pe-8 ps-3 text-xs rounded-xl bg-card border border-theme text-theme-text placeholder:text-theme-muted focus:outline-hidden focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Active Filter Summary + Reset Button */}
          <div className="flex items-center justify-between text-xs text-theme-secondary pt-2 border-t border-theme/40">
            <span>
              النتائج المعروضة: <strong className="text-theme-text font-mono">{filteredExams.length}</strong> موضوع وفحص
            </span>

            {(selectedStream !== "all" || selectedSubject !== "all" || selectedTerm !== "all" || selectedKind !== "all" || searchQuery) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-[11px] text-[var(--color-primary)] hover:underline font-bold cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة تعيين الفلاتر</span>
              </button>
            )}
          </div>
        </section>

        {/* ================================================================= */}
        {/* 4. EXAMS GRID                                                     */}
        {/* ================================================================= */}
        {filteredExams.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-surface border border-theme shadow-clay space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-stone-500/10 text-stone-400 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-theme-text">لم يتم العثور على مواضيع مطابقة</h3>
            <p className="text-xs text-theme-secondary max-w-sm mx-auto">
              جرب تغيير معايير البحث أو اختيار فصل أو شعبة أخرى للاطلاع على البنك.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold cursor-pointer"
            >
              عرض جميع الفروض والاختبارات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
            {filteredExams.map((exam) => {
              const stream = ALGERIAN_BAC_STREAMS[exam.streamId];
              const subject = ALL_SUBJECTS[exam.subjectId];

              const termBadge =
                exam.kind === "bac_blanc"
                  ? "بكالوريا تجريبية"
                  : exam.term === 1
                  ? "الفصل 1"
                  : exam.term === 2
                  ? "الفصل 2"
                  : "الفصل 3";

              const kindBadge =
                exam.kind === "term_quiz"
                  ? "فرض محروس"
                  : exam.kind === "term_exam"
                  ? "اختبار فصلي"
                  : "Bac Blanc";

              return (
                <div
                  key={exam.id}
                  className="p-5 rounded-3xl bg-surface border border-theme shadow-clay flex flex-col justify-between hover:border-[var(--color-primary)]/40 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="space-y-3">
                    {/* Header: Term + Kind Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-primary)]/20 text-[11px] font-black font-sans">
                          {termBadge}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-500/10 text-theme-secondary border border-theme text-[10px] font-bold">
                          {kindBadge}
                        </span>
                        {exam.academicYear && (
                          <span className="text-[10px] text-theme-muted font-mono">
                            {exam.academicYear}
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

                    {/* School Name & Wilaya */}
                    {exam.schoolName && (
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        <School className="w-3.5 h-3.5 shrink-0" />
                        <span className="line-clamp-1">{exam.schoolName}</span>
                        {exam.wilaya && (
                          <span className="text-theme-muted font-normal">({exam.wilaya})</span>
                        )}
                      </div>
                    )}

                    {/* Subject & Stream Title */}
                    <div>
                      <h3 className="text-sm font-bold text-theme-text font-sans group-hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                        {exam.title_ar}
                      </h3>
                      <div className="flex items-center gap-2 text-[11px] text-theme-secondary mt-1 font-sans">
                        <span>{stream?.name_ar}</span>
                        <span>•</span>
                        <span>{subject?.name_ar}</span>
                      </div>
                    </div>

                    {/* Specs: Duration & Coefficient */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap text-[10px] text-theme-muted font-sans">
                      <span className="px-2 py-0.5 rounded-md bg-card border border-theme">
                        المدة: <strong className="text-theme-text">{Math.floor((exam.durationMinutes || 120) / 60)} سا</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-card border border-theme">
                        المعامل: <strong className="text-theme-text">{exam.coefficient}</strong>
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
                        className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm active:scale-98 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>التصحيح النموذجي</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between px-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(exam, "subject")}
                        className="text-theme-secondary hover:text-[var(--color-primary)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>معاينة وطباعة الوثيقة</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenModal(exam, "solution")}
                        className="text-theme-secondary hover:text-emerald-500 hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>سلم التنقيط</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
              <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary)]/20 flex items-center justify-center text-[var(--color-primary)]">
                <FileText className="w-6 h-6 animate-spin" />
              </div>
              <p className="text-xs text-theme-muted font-sans">
                جاري تحميل بنك الفروض والاختبارات الفصلية...
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
