"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MathRenderer } from "@/components/ui/MathRenderer";
import {
  EmbeddedVideoPlayer,
  extractYoutubeVideoId,
  parseTimestampToSeconds,
} from "@/components/curriculum/EmbeddedVideoPlayer";
import { DiagramViewer } from "@/components/curriculum/DiagramViewer";
import {
  snvTerm1Lessons,
  snvTerm1Checkpoints,
} from "@/domain/content/snv-daily-lessons";
import {
  BookOpen,
  Target,
  Sparkles,
  AlertTriangle,
  Brain,
  Video,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  ChevronDown,
  ChevronUp,
  Award,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";

// Diagrams mapping for key curriculum days
const CURRICULUM_DIAGRAMS: Record<number, { caption_ar: string; diagramUrl: string; labels: { id: number; text_ar: string }[] }> = {
  1: {
    caption_ar: "رسم تخطيطي لبنية الخلية حقيقية النواة ومقر تركيب البروتين",
    diagramUrl: "/diagrams/snv-d01-protein-site.svg",
    labels: [
      { id: 1, text_ar: "غشاء هيولي محيط بالخلية" },
      { id: 2, text_ar: "شبكة هيولية داخلية محببة (مقر التركيب)" },
      { id: 3, text_ar: "ريبوزومات حرة ومثبتة" },
      { id: 4, text_ar: "نواة تحتوي على الـ ADN المشفر" },
      { id: 5, text_ar: "ثقب نووي لنفاذ الـ ARNm" },
      { id: 6, text_ar: "حمض ريبي نووي رسول (ARNm)" },
    ],
  },
  2: {
    caption_ar: "رسم تخطيطي تفسيري لآلية الاستنساخ الحيوي عند حقيقيات النوى",
    diagramUrl: "/diagrams/snv-d02-transcription.svg",
    labels: [
      { id: 1, text_ar: "إنزيم ARN بوليميراز الوظيفي" },
      { id: 2, text_ar: "سلسلة الـ ADN المستنسخة (3' -> 5')" },
      { id: 3, text_ar: "سلسلة الـ ADN غير المستنسخة (5' -> 3')" },
      { id: 4, text_ar: "خيط الـ ARNm النامي في الاتجاه (5' -> 3')" },
      { id: 5, text_ar: "نكليوتيدات ريبية حرة (ATP, UTP, CTP, GTP)" },
    ],
  },
  5: {
    caption_ar: "رسم تخطيطي لمراحل الترجمة وتشكل المعقد ريبوزوم-ARNm",
    diagramUrl: "/diagrams/snv-d05-translation.svg",
    labels: [
      { id: 1, text_ar: "تحت وحدة ريبوزومية صغرى (تثبت الـ ARNm)" },
      { id: 2, text_ar: "تحت وحدة ريبوزومية كبرى (تحوي موقعي P و A)" },
      { id: 3, text_ar: "الموقع التحفيزي البيبتيدي (P)" },
      { id: 4, text_ar: "الموقع الحمضي الأميني (A)" },
      { id: 5, text_ar: "جزيء ARNt نوعي حامل للحمض الأميني" },
      { id: 6, text_ar: "سلسلة ببتيدية في طور الاستطالة" },
    ],
  },
  36: {
    caption_ar: "رسم تخطيطي مقارن بين جزيئات التوافق النسيجي CMH-I و CMH-II",
    diagramUrl: "/diagrams/snv-d36-cmh.svg",
    labels: [
      { id: 1, text_ar: "سلسلة ببتيدية ثقيلة ألفا (α1, α2, α3)" },
      { id: 2, text_ar: "سلسلة بيتا 2 ميكروغلوبولين (β2m)" },
      { id: 3, text_ar: "حجيرة تثبيت البيبتيد المستضدي" },
      { id: 4, text_ar: "جزء غشائي مخترق للهيولى" },
    ],
  },
  38: {
    caption_ar: "رسم تخطيطي للبنية الفراغية للجسم المضاد النوعي (IgG)",
    diagramUrl: "/diagrams/snv-d38-antibody.svg",
    labels: [
      { id: 1, text_ar: "سلسلة ثقيلة H (Heavy chain)" },
      { id: 2, text_ar: "سلسلة خفيفة L (Light chain)" },
      { id: 3, text_ar: "موقع تثبيت محدد المستضد المتغير (Fab)" },
      { id: 4, text_ar: "المنطقة الثابتة المتبلورة (Fc)" },
      { id: 5, text_ar: "جسور ثنائية الكبريت (S-S)" },
      { id: 6, text_ar: "منطقة مفصلية مرنة" },
    ],
  },
};

// Helper: Parse YouTube URL and timestamp into videoId and startSeconds
function parseYoutubeData(url?: string, timestamp?: string): { videoId: string; startSeconds: number } | null {
  if (!url) return null;
  const videoId = extractYoutubeVideoId(url);
  if (!videoId) return null;
  const startSeconds = parseTimestampToSeconds(timestamp || 0);
  return { videoId, startSeconds };
}

export default function CurriculumPage() {
  const [activeUnit, setActiveUnit] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedDay, setExpandedDay] = useState<number | null>(1); // Default Day 1 open
  const [activeSection, setActiveSection] = useState<"lessons" | "checkpoints">("lessons");
  const [revealedRecall, setRevealedRecall] = useState<Record<number, boolean>>({});

  // Units list
  const units = [
    { id: "all", label_ar: "جميع الوحدات (55 يوماً)", count: 55 },
    { id: "u01", label_ar: "الوحدة 01: تركيب البروتين", range: [1, 10], count: 10 },
    { id: "u02", label_ar: "الوحدة 02: بنية ووظيفة البروتين", range: [11, 25], count: 15 },
    { id: "u03", label_ar: "الوحدة 03: النشاط الإنزيمي", range: [26, 35], count: 10 },
    { id: "u04", label_ar: "الوحدة 04: الدفاع عن الذات (المناعة)", range: [36, 50], count: 15 },
    { id: "methodology", label_ar: "معسكر المنهجية والإدماج", range: [51, 55], count: 5 },
  ];

  // Filter lessons
  const filteredLessons = useMemo(() => {
    return snvTerm1Lessons.filter((lesson) => {
      // Unit filter
      if (activeUnit === "u01" && (lesson.dayNumber < 1 || lesson.dayNumber > 10)) return false;
      if (activeUnit === "u02" && (lesson.dayNumber < 11 || lesson.dayNumber > 25)) return false;
      if (activeUnit === "u03" && (lesson.dayNumber < 26 || lesson.dayNumber > 35)) return false;
      if (activeUnit === "u04" && (lesson.dayNumber < 36 || lesson.dayNumber > 50)) return false;
      if (activeUnit === "methodology" && (lesson.dayNumber < 51 || lesson.dayNumber > 55)) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesTitle = lesson.title_ar.toLowerCase().includes(q);
        const matchesUnit = lesson.unitTitle_ar.toLowerCase().includes(q);
        const matchesCap = lesson.targetCapability_ar.toLowerCase().includes(q);
        const matchesDay = lesson.dayNumber.toString() === q;
        return matchesTitle || matchesUnit || matchesCap || matchesDay;
      }

      return true;
    });
  }, [activeUnit, searchQuery]);

  const toggleRecall = (day: number) => {
    setRevealedRecall((prev) => ({ ...prev, [day]: !prev[day] }));
  };

  return (
    <AppShell activeNav="curriculum">
      <Container size="lg" className="py-6 sm:py-10 space-y-8 text-right" dir="rtl">
        {/* ================================================================= */}
        {/* HERO BANNER: OFFICIAL 3AS NATURAL SCIENCES CURRICULUM             */}
        {/* ================================================================= */}
        <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900/90 p-6 sm:p-8 text-white relative overflow-hidden shadow-clay">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  شعبة علوم تجريبية · السنة الثالثة ثانوي
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  الفصل الأول كاملاً
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                منهاج علوم الطبيعة والحياة (55 يوماً تفاعلياً)
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                كل يوم مخصص لمهارة ومفهوم وزاري محدد، مدعم بالشرح المفصل، الفيديوهات الموجهة بالدقيقة والثانية، الأخطاء الشائعة، ونقاط التفتيش الأسبوعية.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/exam">
                <Button variant="primary" size="md" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>محاكي امتحان D-Day الشامل</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800">
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-0.5">
              <span className="text-[11px] text-slate-400">الدروس اليومية</span>
              <p className="text-2xl font-black text-emerald-400 font-mono">55</p>
              <span className="text-[10px] text-slate-500">درساً تفصيلياً</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-0.5">
              <span className="text-[11px] text-slate-400">نقاط التفتيش</span>
              <p className="text-2xl font-black text-amber-400 font-mono">11</p>
              <span className="text-[10px] text-slate-500">محطة تقويم أسبوعية</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-0.5">
              <span className="text-[11px] text-slate-400">الوحدات التعليمية</span>
              <p className="text-2xl font-black text-blue-400 font-mono">4 + 1</p>
              <span className="text-[10px] text-slate-500">وحدات + معسكر منهجية</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-0.5">
              <span className="text-[11px] text-slate-400">محاكي البكالوريا</span>
              <p className="text-2xl font-black text-purple-400 font-mono">D-Day</p>
              <span className="text-[10px] text-slate-500">موضوعان كاملان</span>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* VIEW SELECTOR: LESSONS VS CHECKPOINTS                             */}
        {/* ================================================================= */}
        <div className="flex items-center justify-between border-b border-theme pb-3 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection("lessons")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSection === "lessons"
                  ? "bg-[var(--color-primary)] text-white shadow-clay"
                  : "text-theme-secondary hover:text-theme-text hover:bg-card-hover"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>الدروس اليومية (1 - 55)</span>
            </button>
            <button
              onClick={() => setActiveSection("checkpoints")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeSection === "checkpoints"
                  ? "bg-[var(--color-primary)] text-white shadow-clay"
                  : "text-theme-secondary hover:text-theme-text hover:bg-card-hover"
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
              <span>نقاط التفتيش الأسبوعية (1 - 11)</span>
            </button>
          </div>

          {/* Search bar */}
          {activeSection === "lessons" && (
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث برقم اليوم أو الكلمة..."
                className="w-full bg-card border border-theme rounded-xl px-3 py-1.5 text-xs text-theme-text placeholder:text-theme-muted pr-8 focus:outline-none focus:border-[var(--color-primary)]"
              />
              <Search className="h-3.5 w-3.5 text-theme-muted absolute right-2.5 top-2.5" />
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* SECTION 1: DAILY LESSONS (55 DAYS)                                */}
        {/* ================================================================= */}
        {activeSection === "lessons" && (
          <div className="space-y-6">
            {/* Unit Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
              {units.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setActiveUnit(u.id)}
                  className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                    activeUnit === u.id
                      ? "bg-emerald-600 text-white font-bold shadow-sm"
                      : "bg-card border border-theme text-theme-secondary hover:text-theme-text hover:bg-card-hover"
                  }`}
                >
                  {u.label_ar} ({u.count})
                </button>
              ))}
            </div>

            {/* Lessons Accordion / List */}
            <div className="space-y-4">
              {filteredLessons.map((lesson) => {
                const isExpanded = expandedDay === lesson.dayNumber;
                const videoData = parseYoutubeData(
                  lesson.externalResource?.videoUrl,
                  lesson.externalResource?.targetTimestamp
                );
                const diagramData = CURRICULUM_DIAGRAMS[lesson.dayNumber];
                const isRecallOpen = revealedRecall[lesson.dayNumber];

                return (
                  <Card
                    key={lesson.id}
                    className={`border transition-all duration-200 overflow-hidden ${
                      isExpanded
                        ? "border-emerald-500/60 bg-card shadow-md ring-1 ring-emerald-500/20"
                        : "border-theme bg-card hover:border-emerald-500/40"
                    }`}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => setExpandedDay(isExpanded ? null : lesson.dayNumber)}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-mono font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                          {lesson.dayNumber.toString().padStart(2, "0")}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] text-theme-muted font-bold">
                              {lesson.unitTitle_ar}
                            </span>
                            {videoData && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">
                                📹 فيديو موجه
                              </span>
                            )}
                            {diagramData && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-lg">
                                📊 رسم تخطيطي
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-0.5">
                            {lesson.title_ar}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-600 font-medium hidden sm:inline">
                          {isExpanded ? "طي التفاصيل" : "عرض الدرس"}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-emerald-700" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Lesson Content */}
                    {isExpanded && (
                      <div className="p-4 sm:p-6 border-t border-theme bg-surface-soft/60 space-y-6 animate-fade-in">
                        {/* Target Capability */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-200/90 space-y-2 shadow-sm">
                          <span className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                            <Target className="h-4 w-4 text-emerald-700" />
                            الكفاءة المستهدفة (المطلوبة في البكالوريا):
                          </span>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                            {lesson.targetCapability_ar}
                          </p>
                        </div>

                        {/* Core Concept */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-slate-200/90 space-y-2 shadow-sm">
                          <span className="text-xs sm:text-sm font-bold text-emerald-900 flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-emerald-600" />
                            الفكرة الجوهرية (المفهوم الأساسي):
                          </span>
                          <MathRenderer
                            content={lesson.coreConcept_ar}
                            className="text-xs sm:text-sm text-slate-900 leading-relaxed font-medium"
                          />
                        </div>

                        {/* Simple Explanation */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200/80 space-y-2 shadow-sm">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4 text-emerald-700" />
                            الشرح المبسط والدلائل التجريبية:
                          </span>
                          <MathRenderer
                            content={lesson.simpleExplanation_ar}
                            className="text-xs sm:text-sm text-slate-800 leading-relaxed"
                          />
                        </div>

                        {/* Embedded Video Player */}
                        {videoData && lesson.externalResource && (
                          <div className="space-y-2">
                            <EmbeddedVideoPlayer
                              videoId={videoData.videoId}
                              startSeconds={videoData.startSeconds}
                              title_ar={lesson.externalResource.title}
                              channelName={lesson.externalResource.channelName}
                              timestampStr={lesson.externalResource.targetTimestamp}
                            />
                          </div>
                        )}

                        {/* Diagram Viewer (Self-Testing mode) */}
                        {diagramData && (
                          <div className="space-y-2">
                            <DiagramViewer
                              diagramUrl={diagramData.diagramUrl}
                              caption_ar={diagramData.caption_ar}
                              labels={diagramData.labels}
                            />
                          </div>
                        )}

                        {/* Common Mistakes & Traps */}
                        {lesson.commonMistakes && lesson.commonMistakes.length > 0 && (
                          <div className="space-y-3">
                            <span className="text-xs sm:text-sm font-bold text-rose-950 flex items-center gap-1.5">
                              <AlertTriangle className="h-4 w-4 text-rose-700" />
                              فخاخ منهجية وأخطاء شائعة في تصحيح البكالوريا:
                            </span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {lesson.commonMistakes.map((m, idx) => (
                                <div
                                  key={idx}
                                  className="p-4 rounded-2xl bg-rose-50/90 border-2 border-rose-200 shadow-sm space-y-2"
                                >
                                  <span className="text-xs sm:text-sm font-bold text-rose-950 block leading-snug">
                                    ⚠️ {m.trap_ar}
                                  </span>
                                  <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-normal">
                                    <strong className="text-rose-900 font-bold">السبب وتفسير الخطأ: </strong>
                                    {m.explanation_ar}
                                  </p>
                                  <div className="p-2.5 rounded-xl bg-emerald-100/90 border border-emerald-300 text-xs sm:text-sm text-emerald-950 leading-relaxed font-semibold">
                                    <strong className="text-emerald-900 font-bold">العلاج المنهجي المعتمد: </strong>
                                    {m.remedy_ar}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Quick Recall Interactive Card */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-200 shadow-sm space-y-3">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <span className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                              <Brain className="h-4 w-4 text-amber-700" />
                              اختبار الاسترجاع السريع (Active Recall):
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleRecall(lesson.dayNumber)}
                              className="text-xs px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white font-bold transition-colors shadow-sm"
                            >
                              {isRecallOpen ? "إخفاء الجواب" : "اكشف الإجابة النموذجية"}
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                            ❓ {lesson.quickRecallPrompt_ar}
                          </p>
                          {isRecallOpen && (
                            <div className="p-3.5 rounded-xl bg-white border-2 border-emerald-500 text-xs sm:text-sm text-slate-900 animate-fade-in font-semibold shadow-sm leading-relaxed">
                              <span className="text-emerald-800 font-bold block mb-1">💡 الإجابة النموذجية:</span>
                              {lesson.quickRecallAnswer_ar}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* SECTION 2: WEEKLY CHECKPOINTS (11 WEEKS)                          */}
        {/* ================================================================= */}
        {activeSection === "checkpoints" && (
          <div className="space-y-6">
            <p className="text-xs sm:text-sm text-slate-700 font-medium">
              نقاط التفتيش الأسبوعية صُممت لتقويم الحصيلة وتثبيت المفاهيم عبر تمارين توأمية تعالج الثغرات الشائعة في نهاية كل أسبوع.
            </p>

            <div className="space-y-4">
              {snvTerm1Checkpoints.map((cp, idx) => (
                <Card key={cp.id} className="p-5 sm:p-6 border-2 border-slate-200/90 bg-card space-y-4 shadow-card">
                  <div className="flex items-center justify-between border-b border-theme pb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="primary" size="sm" className="font-mono bg-emerald-600 text-white font-bold">
                          المحطة {idx + 1}
                        </Badge>
                        <span className="text-xs text-slate-500 font-mono">{cp.id}</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">{cp.title_ar}</h3>
                    </div>
                  </div>

                  {/* Context */}
                  <div className="p-4 rounded-2xl bg-slate-50 border-2 border-slate-200/80 space-y-2">
                    <span className="text-xs sm:text-sm font-bold text-emerald-800 block">سياق التمرين:</span>
                    <MathRenderer content={cp.context_ar} className="text-xs sm:text-sm text-slate-800 leading-relaxed" />
                  </div>

                  {/* Task Step */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-slate-200 space-y-3 shadow-sm">
                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block mb-1">التعليمة والمهمة المطلوبة:</span>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                        {cp.taskStep.instruction_ar}
                      </p>
                    </div>

                    {/* Expected Keywords */}
                    {cp.taskStep.expectedKeywords && cp.taskStep.expectedKeywords.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-xs font-bold text-slate-700 block">
                          الكلمات المفتاحية والمؤشرات المنهجية المطلوبة في شبكة التقويم:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cp.taskStep.expectedKeywords.map((kw, kwIdx) => (
                            <span
                              key={kwIdx}
                              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-900 border border-emerald-300"
                            >
                              ✓ {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Full Solution */}
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                      <span className="text-xs sm:text-sm font-bold text-emerald-900 block">الحل المنهجي المفصل:</span>
                      <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200">
                        <MathRenderer
                          content={cp.taskStep.fullSolution_ar}
                          className="text-xs sm:text-sm text-slate-800 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Twin Retest for Error Lab */}
                  {cp.twinRetest && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-200 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                          <ShieldCheck className="h-4 w-4 text-amber-700" />
                          {cp.twinRetest.title_ar} (Twin Retest - Error Lab)
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-medium">
                        {cp.twinRetest.context_ar}
                      </p>
                      <div className="p-3.5 rounded-xl bg-white border-2 border-amber-300 text-xs sm:text-sm text-amber-950 font-bold shadow-sm">
                        <strong className="text-amber-900 block mb-0.5">سؤال الاختبار التوأمي: </strong>
                        {cp.twinRetest.question_ar}
                      </div>
                      <div className="p-3.5 rounded-xl bg-white border-2 border-emerald-500 text-xs sm:text-sm text-slate-900 shadow-sm font-medium">
                        <strong className="text-emerald-800 font-bold block mb-0.5">الإجابة النموذجية المصححة: </strong>
                        {cp.twinRetest.correctAnswer_ar}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </Container>
    </AppShell>
  );
}
