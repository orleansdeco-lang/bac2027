"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import {
  BAC_EXAMS_DATABASE,
  BacExamItem,
  filterBacExams,
  getAvailableExamYears,
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
  Check,
  RotateCcw,
  Clock,
  ArrowUpDown,
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

function ExamsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // Filters State
  const [selectedStream, setSelectedStream] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [selectedSession, setSelectedSession] = useState<"all" | "regular" | "exceptional">("all");
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

  // Read URL query parameters on initial mount (Deep Link Support)
  useEffect(() => {
    const urlStream = searchParams.get("stream");
    const urlSubject = searchParams.get("subject");
    const urlYear = searchParams.get("year");
    const urlSession = searchParams.get("session");
    const urlExamId = searchParams.get("examId");
    const urlTab = searchParams.get("tab") as "subject" | "solution" | null;

    if (urlStream && STREAMS_LIST.some((s) => s.id === urlStream)) {
      setSelectedStream(urlStream);
    }
    if (urlSubject) {
      setSelectedSubject(urlSubject);
    }
    if (urlYear && !isNaN(Number(urlYear))) {
      setSelectedYear(Number(urlYear));
    }
    if (urlSession === "regular" || urlSession === "exceptional") {
      setSelectedSession(urlSession);
    }

    if (urlExamId) {
      const foundExam = BAC_EXAMS_DATABASE.find((e) => e.id === urlExamId);
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
      const distinct = Array.from(new Set(BAC_EXAMS_DATABASE.map((e) => e.subjectId)));
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
    return filterBacExams({
      streamId: selectedStream,
      subjectId: selectedSubject,
      year: selectedYear,
      session: selectedSession,
      searchQuery,
    });
  }, [selectedStream, selectedSubject, selectedYear, selectedSession, searchQuery]);

  const allYears = useMemo(() => getAvailableExamYears(), []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShareExam = async (exam: BacExamItem, tab: "subject" | "solution" = "subject") => {
    try {
      const url = `${window.location.origin}/exams?stream=${exam.streamId}&subject=${exam.subjectId}&year=${exam.year}&examId=${encodeURIComponent(exam.id)}&tab=${tab}`;
      await navigator.clipboard.writeText(url);
      triggerToast("✅ تم نسخ رابط الموضوع والتصحيح بنجاح!");
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
    setSelectedStream("all");
    setSelectedSubject("all");
    setSelectedYear(0);
    setSelectedSession("all");
    setSearchQuery("");
  };

  return (
    <AppShell activeNav="exams">
      {/* Deep Link Copied Toast Notification */}
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
            // Clean modal query params from URL without reload
            const url = new URL(window.location.href);
            url.searchParams.delete("examId");
            url.searchParams.delete("tab");
            window.history.replaceState({}, "", url.toString());
          }}
        />
      )}

      <Container size="lg" className="py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* ================================================================= */}
        {/* 1. HERO HEADER                                                    */}
        {/* ================================================================= */}
        <header className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-stone-900 border border-indigo-900/40 p-6 sm:p-10 shadow-clay text-white">
          <div className="relative z-10 max-w-3xl space-y-3.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold font-sans">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>الأرشيف الرسمي المعتمد (2016 - 2026)</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              بنك مواضيع وحلول البكالوريا الرسمية
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-sans">
              تصفح وحمل واطبع مواضيع شهادة البكالوريا الجزائرية مع التصحيحات النموذجية وسلم التنقيط المفصل لجميع الشعب، من دورة 2016 إلى دورة 2026 الرسمية.
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex items-center gap-4 sm:gap-6 pt-2 flex-wrap text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-bold">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>11 سنة كاملة (2016-2026)</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>6 شعب وطنية</span>
              </div>
              <div className="flex items-center gap-1.5 font-bold">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>تصحيح رسمي + سلالم التنقيط</span>
              </div>
            </div>
          </div>

          <div className="absolute top-0 end-0 -mt-8 -me-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </header>

        {/* ================================================================= */}
        {/* 2. FILTER & SEARCH CONTROLS                                       */}
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

          {/* Year Chips + Session Selector + Search Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-2 border-t border-theme/60">
            {/* Year Chips */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="block text-xs font-bold text-theme-secondary">
                3. السنة:
              </label>
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedYear(0)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer font-mono ${
                    selectedYear === 0
                      ? "bg-[var(--color-primary)] text-white"
                      : "bg-card text-theme-secondary border border-theme hover:text-theme-text"
                  }`}
                >
                  الكل
                </button>
                {allYears.map((yr) => {
                  const isSelected = selectedYear === yr;
                  return (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => setSelectedYear(yr)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer font-mono ${
                        isSelected
                          ? "bg-[var(--color-primary)] text-white shadow-xs"
                          : "bg-card text-theme-secondary border border-theme hover:text-theme-text"
                      }`}
                    >
                      {yr}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Session Type */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="block text-xs font-bold text-theme-secondary">
                الدورة:
              </label>
              <div className="flex items-center gap-1">
                {[
                  { id: "all", label: "الكل" },
                  { id: "regular", label: "عادية" },
                  { id: "exceptional", label: "استثنائية" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSession(s.id as any)}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                      selectedSession === s.id
                        ? "bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900"
                        : "bg-card text-theme-secondary border border-theme"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="block text-xs font-bold text-theme-secondary">
                بحث بالكلمات المفتاحية:
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-theme-muted absolute top-2.5 end-3 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن مادة، تمرين، موضوع..."
                  className="w-full py-1.5 pe-8 ps-3 text-xs rounded-xl bg-card border border-theme text-theme-text placeholder:text-theme-muted focus:outline-hidden focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Active Filter Summary + Reset Button */}
          <div className="flex items-center justify-between text-xs text-theme-secondary pt-2 border-t border-theme/40">
            <span>
              النتائج المعروضة: <strong className="text-theme-text font-mono">{filteredExams.length}</strong> موضوع بكالوريا
            </span>

            {(selectedStream !== "all" || selectedSubject !== "all" || selectedYear !== 0 || selectedSession !== "all" || searchQuery) && (
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
        {/* 3. EXAMS GRID                                                     */}
        {/* ================================================================= */}
        {filteredExams.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-surface border border-theme shadow-clay space-y-3">
            <div className="w-14 h-14 rounded-3xl bg-stone-500/10 text-stone-400 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-theme-text">لم يتم العثور على مواضيع مطابقة</h3>
            <p className="text-xs text-theme-secondary max-w-sm mx-auto">
              جرب تغيير معايير البحث أو اختيار سنة أو شعبة أخرى للاطلاع على الأرشيف.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="mt-2 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold"
            >
              عرض جميع المواضيع
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredExams.map((exam) => {
              const stream = ALGERIAN_BAC_STREAMS[exam.streamId];
              const subject = ALL_SUBJECTS[exam.subjectId];

              return (
                <div
                  key={exam.id}
                  className="p-5 rounded-3xl bg-surface border border-theme shadow-clay flex flex-col justify-between hover:border-[var(--color-primary)]/40 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="space-y-3">
                    {/* Header: Year + Session Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-primary)]/20 text-xs font-black font-mono">
                          بكالوريا {exam.year}
                        </span>
                        {exam.session === "exceptional" && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold">
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

                    {/* Specs Pills: Duration & Coefficient */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap text-[10px] text-theme-muted font-sans">
                      <span className="px-2 py-0.5 rounded-md bg-card border border-theme">
                        المعامل: <strong className="text-theme-text">{exam.coefficient}</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-card border border-theme">
                        المدة: <strong className="text-theme-text">{Math.floor((exam.durationMinutes || 210) / 60)} سا</strong>
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-card border border-theme">
                        موضوعان اختياريان
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
                        <span>التصحيح الوزاري</span>
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
                        <span>سلم التنقيط الوزاري</span>
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
                جاري تحميل بنك امتحانات البكالوريا الرسمية...
              </p>
            </div>
          </div>
        </AppShell>
      }
    >
      <ExamsContent />
    </Suspense>
  );
}
