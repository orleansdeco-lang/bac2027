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
import { PHILOSOPHY_TERM1_LESSONS, PhilosophyEssayLesson } from "@/domain/content/philosophy";
import { ARABIC_LESSONS_CATALOG, ArabicLesson } from "@/domain/content/arabic";
import { GESTION_ECO_SKILLS } from "@/data/skills/gestion-economie";
import { LETTRES_PHILO_SKILLS } from "@/data/skills/lettres-philo";
import { useLearningAccessGate } from "@/lib/hooks";
import { normalizeStreamIdWithDefault, getStreamMetadata } from "@/lib/curriculum/filter";
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
  Quote,
  Flame,
  FileText,
  Compass,
  Scale,
} from "lucide-react";

// Diagrams mapping for key curriculum days (Sciences Expérimentales)
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
  const isSearch = url.includes("results?search_query=") || url.includes("search_query=");
  const videoId = isSearch ? url : extractYoutubeVideoId(url);
  if (!videoId) return null;
  const startSeconds = parseTimestampToSeconds(timestamp || 0);
  return { videoId, startSeconds };
}

export default function CurriculumPage() {
  const gate = useLearningAccessGate();
  const streamId = normalizeStreamIdWithDefault(
    gate.profile?.streamId || (gate.profile as any)?.stream,
    "sciences_exp"
  );
  const streamMeta = getStreamMetadata(streamId);

  const [activeUnit, setActiveUnit] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedDay, setExpandedDay] = useState<number | null>(1); // Default Day 1 open for Sciences
  const [expandedPhiloId, setExpandedPhiloId] = useState<string | null>("phil_lp_issue01_sensation_perception");
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"lessons" | "checkpoints">("lessons");
  const [revealedRecall, setRevealedRecall] = useState<Record<number, boolean>>({});

  // ---------------------------------------------------------------------------
  // LETTRES ET PHILOSOPHIE VIEW
  // ---------------------------------------------------------------------------
  if (streamId === "lettres_philo") {
    const philoLessons = PHILOSOPHY_TERM1_LESSONS;
    const arabicLessons = ARABIC_LESSONS_CATALOG;
    const methodSkills = Object.values(LETTRES_PHILO_SKILLS).filter(
      (s) => s.subjectId === "philosophy" && s.topicId === "phi_topic_methodology"
    );

    const filteredPhilo = philoLessons.filter((l) => {
      if (activeUnit !== "all" && activeUnit !== "philosophy" && l.id !== activeUnit) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        return (
          l.issueTitle_ar.toLowerCase().includes(q) ||
          l.unitTitle_ar.toLowerCase().includes(q) ||
          l.thesis.title_ar.toLowerCase().includes(q)
        );
      }
      return true;
    });

    return (
      <AppShell activeNav="curriculum">
        <Container size="lg" className="py-6 sm:py-10 space-y-8 text-right" dir="rtl">
          {/* Hero Banner */}
          <section className="rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900/90 p-6 sm:p-8 text-white relative overflow-hidden shadow-clay">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                    شعبة آداب وفلسفة · السنة الثالثة ثانوي
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    المعامل 6 (المادة الحاسمة للبكالوريا)
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                  منهاج الفلسفة واللغة العربية (الفصل الأول كاملاً)
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  دراسة إشكاليات إدراك العالم الخارجي الخمس، معمارية المقال الجدلي والاستقصاء بالوضع، حجج الفلاسفة وأقوالهم، أمثلة من الواقع المعاش، وسلالم التنقيط الوزارية المعتمدة.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/exam">
                  <Button variant="primary" size="md" className="bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    <span>محاكي امتحان الفلسفة الرسمي</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800">
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400">الإشكاليات الكبرى</span>
                <p className="text-2xl font-black text-rose-400 font-mono">05</p>
                <span className="text-[10px] text-slate-500">إشكاليات العالم الخارجي</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400">أقوال الفلاسفة</span>
                <p className="text-2xl font-black text-amber-400 font-mono">60+</p>
                <span className="text-[10px] text-slate-500">مع إرشادات التوظيف الذكي</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400">مناهج المقال</span>
                <p className="text-2xl font-black text-blue-400 font-mono">04</p>
                <span className="text-[10px] text-slate-500">جدل، استقصاء، مقارنة، نص</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400">الأدب العربي والبناء</span>
                <p className="text-2xl font-black text-emerald-400 font-mono">05</p>
                <span className="text-[10px] text-slate-500">إعراب إذا وإذ وقواعد المنفى</span>
              </div>
            </div>
          </section>

          {/* Unit Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
            <button
              onClick={() => setActiveUnit("all")}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                activeUnit === "all"
                  ? "bg-rose-700 text-white font-bold shadow-sm"
                  : "bg-card border border-theme text-theme-secondary hover:text-theme-text hover:bg-card-hover"
              }`}
            >
              جميع الإشكاليات والوحدات
            </button>
            {philoLessons.map((l, idx) => (
              <button
                key={l.id}
                onClick={() => setActiveUnit(l.id)}
                className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                  activeUnit === l.id
                    ? "bg-rose-700 text-white font-bold shadow-sm"
                    : "bg-card border border-theme text-theme-secondary hover:text-theme-text hover:bg-card-hover"
                }`}
              >
                {`إشكالية 0${idx + 1}: ${l.issueTitle_ar.replace("المشكلة الأولى: ", "").replace("المشكلة الثانية: ", "").replace("المشكلة الثالثة: ", "").replace("المشكلة الرابعة: ", "").replace("المشكلة الخامسة: ", "")}`}
              </button>
            ))}
            <button
              onClick={() => setActiveUnit("arabic")}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                activeUnit === "arabic"
                  ? "bg-emerald-700 text-white font-bold shadow-sm"
                  : "bg-card border border-theme text-theme-secondary hover:text-theme-text hover:bg-card-hover"
              }`}
            >
              📖 الأدب العربي: أحكام إذا وشعر المنفى
            </button>
            <button
              onClick={() => setActiveUnit("methods")}
              className={`px-3.5 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                activeUnit === "methods"
                  ? "bg-blue-700 text-white font-bold shadow-sm"
                  : "bg-card border border-theme text-theme-secondary hover:text-theme-text hover:bg-card-hover"
              }`}
            >
              📐 معسكر المناهج الفلسفية (4 طرق)
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن إشكالية، فيلسوف، أو مفهوم..."
              className="w-full bg-card border border-theme rounded-xl px-3 py-2 text-xs text-theme-text placeholder:text-theme-muted pr-8 focus:outline-none focus:border-rose-500"
            />
            <Search className="h-4 w-4 text-theme-muted absolute right-2.5 top-2.5" />
          </div>

          {/* Philosophy Lessons List */}
          {activeUnit !== "arabic" && activeUnit !== "methods" && (
            <div className="space-y-4">
              {filteredPhilo.map((lesson) => {
                const isExpanded = expandedPhiloId === lesson.id;

                return (
                  <Card
                    key={lesson.id}
                    className={`border transition-all duration-200 overflow-hidden ${
                      isExpanded
                        ? "border-rose-500/60 bg-card shadow-md ring-1 ring-rose-500/20"
                        : "border-theme bg-card hover:border-rose-500/40"
                    }`}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => setExpandedPhiloId(isExpanded ? null : lesson.id)}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 font-mono font-black text-sm flex items-center justify-center shrink-0 shadow-sm">
                          <Scale className="w-5 h-5" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] text-theme-muted font-bold">
                              {lesson.unitTitle_ar}
                            </span>
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-300 border border-rose-500/20">
                              {lesson.methodType === "dialectic" ? "طريقة جدلية" : "استقصاء بالوضع"}
                            </span>
                            {lesson.videoSources.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 px-2 py-0.5 rounded-lg">
                                📹 {lesson.videoSources.length} فيديو موجه
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-black text-theme-text mt-0.5">
                            {lesson.issueTitle_ar}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-theme-muted font-medium hidden sm:inline">
                          {isExpanded ? "طي التفاصيل" : "استكشف المقال والموقفين"}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-rose-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Lesson Content */}
                    {isExpanded && (
                      <div className="p-4 sm:p-6 border-t border-theme bg-surface-soft/60 space-y-6 animate-fade-in">
                        {/* 1. طرح المشكلة (المقدمة) */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-black text-amber-500 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              <span>1. طرح المشكلة (المقدمة النموذجية — 04 نقاط)</span>
                            </span>
                            <Badge variant="outline" size="sm" className="text-amber-500 border-amber-500/30 font-bold">
                              سلم البكالوريا: 04/20
                            </Badge>
                          </div>
                          <div className="space-y-2 text-xs sm:text-sm text-theme-text leading-relaxed">
                            <p><strong>التمهيد الوظيفي: </strong>{lesson.introduction.context_ar}</p>
                            <p><strong>المفارقة والعناد الفلسفي: </strong>{lesson.introduction.philosophicalParadox_ar}</p>
                            <p className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 font-bold text-amber-400">
                              <strong>صياغة الإشكال: </strong>{lesson.introduction.problemQuestion_ar}
                            </p>
                          </div>
                        </div>

                        {/* 2. القضية الأولى (الأطروحة) */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-theme space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-black text-theme-text flex items-center gap-2">
                              <Scale className="w-4 h-4 text-blue-500" />
                              <span>2. القضية الأولى (الأطروحة وممثلوها وحججها)</span>
                            </span>
                            <Badge variant="outline" size="sm" className="text-blue-500 border-blue-500/30 font-bold">
                              سلم البكالوريا: 04/20
                            </Badge>
                          </div>
                          <p className="text-xs font-bold text-theme-secondary">
                            {lesson.thesis.title_ar}
                          </p>
                          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300">
                            <strong>أبرز الفلاسفة والممثلين: </strong>{lesson.thesis.representatives.join(" • ")}
                          </div>
                          <div className="space-y-2 pt-2">
                            <span className="text-xs font-bold text-theme-text block">البراهين والحجج الفلسفية:</span>
                            {lesson.thesis.arguments_ar.map((arg, argIdx) => (
                              <div key={argIdx} className="p-3 rounded-xl bg-surface-soft border border-theme text-xs space-y-1">
                                <strong className="text-blue-400 block">• {arg.premise_ar}</strong>
                                <p className="text-theme-muted leading-relaxed">{arg.explanation_ar}</p>
                              </div>
                            ))}
                          </div>
                          {/* Critique */}
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                            <strong className="text-rose-400 block">النقد والمناقشة:</strong>
                            <p className="text-theme-text">{lesson.thesis.critique.positiveAspect_ar}</p>
                            <p className="text-theme-muted">{lesson.thesis.critique.negativeAspect_ar}</p>
                          </div>
                        </div>

                        {/* 3. نقيض القضية (نقيض الأطروحة) */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-theme space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-black text-theme-text flex items-center gap-2">
                              <Scale className="w-4 h-4 text-purple-500" />
                              <span>3. نقيض القضية (الموقف المعارض وحججه ونقده)</span>
                            </span>
                            <Badge variant="outline" size="sm" className="text-purple-500 border-purple-500/30 font-bold">
                              سلم البكالوريا: 04/20
                            </Badge>
                          </div>
                          <p className="text-xs font-bold text-theme-secondary">
                            {lesson.antithesis.title_ar}
                          </p>
                          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300">
                            <strong>أبرز الفلاسفة والممثلين: </strong>{lesson.antithesis.representatives.join(" • ")}
                          </div>
                          <div className="space-y-2 pt-2">
                            <span className="text-xs font-bold text-theme-text block">البراهين والحجج الفلسفية:</span>
                            {lesson.antithesis.arguments_ar.map((arg, argIdx) => (
                              <div key={argIdx} className="p-3 rounded-xl bg-surface-soft border border-theme text-xs space-y-1">
                                <strong className="text-purple-400 block">• {arg.premise_ar}</strong>
                                <p className="text-theme-muted leading-relaxed">{arg.explanation_ar}</p>
                              </div>
                            ))}
                          </div>
                          {/* Critique */}
                          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                            <strong className="text-rose-400 block">النقد والمناقشة:</strong>
                            <p className="text-theme-text">{lesson.antithesis.critique.positiveAspect_ar}</p>
                            <p className="text-theme-muted">{lesson.antithesis.critique.negativeAspect_ar}</p>
                          </div>
                        </div>

                        {/* 4. التركيب وتبرير الرأي الشخصي */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-black text-emerald-400 flex items-center gap-2">
                              <Brain className="w-4 h-4" />
                              <span>4. التركيب وتبرير الرأي الشخصي (محطة التجاوز والتوفيق)</span>
                            </span>
                            <Badge variant="outline" size="sm" className="text-emerald-400 border-emerald-500/30 font-bold">
                              سلم البكالوريا: 04/20
                            </Badge>
                          </div>
                          <p className="text-xs font-bold text-theme-text">
                            {lesson.synthesis.title_ar}
                          </p>
                          <p className="text-xs text-theme-muted leading-relaxed">
                            {lesson.synthesis.synthesizedThesis_ar}
                          </p>
                          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs space-y-1">
                            <strong className="text-emerald-300 block">الرأي الشخصي المبرر (شرط العلامة الكاملة):</strong>
                            <p className="text-theme-text">{lesson.synthesis.personalOpinion.opinion_ar}</p>
                            <p className="text-theme-muted font-bold">{lesson.synthesis.personalOpinion.justification_ar}</p>
                          </div>
                        </div>

                        {/* 5. حل المشكلة (الخاتمة) */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-black text-blue-400 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>5. حل المشكلة (الخاتمة النموذجية — 04 نقاط)</span>
                            </span>
                            <Badge variant="outline" size="sm" className="text-blue-400 border-blue-500/30 font-bold">
                              سلم البكالوريا: 04/20
                            </Badge>
                          </div>
                          <p className="text-xs sm:text-sm text-theme-text leading-relaxed">
                            {lesson.conclusion.resolution_ar}
                          </p>
                        </div>

                        {/* 6. أقوال الفلاسفة وأمثلة الواقع */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Quotes */}
                          <div className="p-4 rounded-2xl bg-card border border-theme space-y-3">
                            <span className="text-xs font-black text-amber-400 flex items-center gap-2">
                              <Quote className="w-4 h-4" />
                              <span>أقوال الفلاسفة المعتمدة وإرشادات التوظيف:</span>
                            </span>
                            <div className="space-y-2">
                              {lesson.thesis.quotes.concat(lesson.antithesis.quotes).slice(0, 3).map((q, qIdx) => (
                                <div key={qIdx} className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs space-y-1">
                                  <p className="font-bold text-amber-300">"{q.quote_ar}"</p>
                                  <span className="text-[11px] text-theme-muted block">— {q.philosopher}</span>
                                  <span className="text-[10px] text-theme-secondary block">💡 كيف توظفها: {q.usageGuidance_ar}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Fallacies */}
                          <div className="p-4 rounded-2xl bg-card border border-theme space-y-3">
                            <span className="text-xs font-black text-rose-400 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              <span>فخاخ الأخطاء الشائعة في سلم التصحيح:</span>
                            </span>
                            <div className="space-y-2">
                              {lesson.commonFallacies.slice(0, 2).map((fal, fIdx) => (
                                <div key={fIdx} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <strong className="text-rose-400">{fal.trapTitle_ar}</strong>
                                    <Badge variant="outline" size="sm" className="text-rose-400 border-rose-500/30 text-[10px]">
                                      تضيع: {fal.bacPenaltyPoints} نقاط
                                    </Badge>
                                  </div>
                                  <p className="text-theme-muted">{fal.description_ar}</p>
                                  <p className="text-emerald-400 font-bold">✓ التصحيح النموذجي: {fal.correctRemedy_ar}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Videos */}
                        {lesson.videoSources.length > 0 && (
                          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                            <span className="text-xs font-black text-slate-200 flex items-center gap-2">
                              <Video className="w-4 h-4 text-red-500" />
                              <span>فيديوهات موجهة بالدقيقة والثانية للأساتذة المعتمدين:</span>
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {lesson.videoSources.map((v, vIdx) => (
                                <div key={vIdx} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between gap-2">
                                  <div className="space-y-0.5 min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{v.title_ar}</p>
                                    <span className="text-[11px] text-slate-400 block">الأستاذ: {v.teacherName_ar} · {v.durationMinutes} دقيقة</span>
                                  </div>
                                  <a
                                    href={v.videoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shrink-0 transition-colors"
                                  >
                                    مشاهدة
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Arabic Lessons Tab */}
          {activeUnit === "arabic" && (
            <div className="space-y-4">
              {arabicLessons.map((ar) => (
                <Card key={ar.id} className="p-5 border-theme bg-card space-y-6">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-400 block">اللغة العربية وآدابها · المعامل 6</span>
                    <h2 className="text-lg font-black text-theme-text">{ar.unitTitle_ar}</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                      <span className="text-xs font-bold text-emerald-400 block">البناء الفكري وقضايا شعر المنفى:</span>
                      <p className="text-xs text-theme-text leading-relaxed">{ar.intellectualConstruction.centralTheme_ar}</p>
                      <div className="pt-2 border-t border-emerald-500/20 text-xs space-y-1">
                        <strong className="text-emerald-300 block">تقنية التلخيص المنهجي (قاعدة الربع 1/4):</strong>
                        <p className="text-theme-muted">{ar.intellectualConstruction.textSummaryGuide_ar.method_ar}</p>
                        <p className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-theme-text italic">
                          نموذج: {ar.intellectualConstruction.textSummaryGuide_ar.sampleModelSummary_ar}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-2">
                      <span className="text-xs font-bold text-blue-400 block">البناء اللغوي والقواعد النحوية (الإعراب):</span>
                      {ar.linguisticConstruction.grammarRules.slice(0, 1).map((rule) => (
                        <div key={rule.id} className="space-y-1.5 pt-2">
                          <p className="text-xs text-theme-text leading-relaxed">{rule.generalRule_ar}</p>
                          {rule.parsingCases.slice(0, 2).map((pc, pcIdx) => (
                            <div key={pcIdx} className="p-2.5 rounded-xl bg-surface-soft border border-theme text-xs">
                              <strong className="text-blue-400 block">• {pc.caseTitle_ar}</strong>
                              <p className="text-theme-muted">{pc.semanticMeaning_ar}</p>
                              <span className="text-[11px] text-emerald-400 block font-mono">{pc.exactParsingTemplate_ar}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Philosophy Methodologies Tab */}
          {activeUnit === "methods" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {methodSkills.map((sk) => (
                <Card key={sk.id} className="p-5 border-theme bg-card space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-400 flex items-center gap-2">
                      <Scale className="w-4 h-4" />
                      <span>{sk.title_ar}</span>
                    </span>
                    <Badge variant="outline" size="sm" className="font-mono text-xs">
                      منهجية معتمدة
                    </Badge>
                  </div>
                  <p className="text-xs text-theme-secondary leading-relaxed">{sk.description_ar}</p>
                  <div className="space-y-2 pt-2 border-t border-theme">
                    <span className="text-xs font-bold text-theme-text block">الخطوات الإلزامية في سلم التنقيط:</span>
                    {sk.repairSteps_ar.map((step, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-surface-soft border border-theme text-xs flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-theme-text leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Container>
      </AppShell>
    );
  }

  // ---------------------------------------------------------------------------
  // GESTION ET ÉCONOMIE VIEW
  // ---------------------------------------------------------------------------
  if (streamId === "gestion_eco") {
    const skillsList = Object.values(GESTION_ECO_SKILLS);
    const accountingSkills = skillsList.filter((s) => s.subjectId === "accounting_finance");
    const economicsSkills = skillsList.filter((s) => s.subjectId === "economics_management");
    const lawSkills = skillsList.filter((s) => s.subjectId === "law");

    return (
      <AppShell activeNav="curriculum">
        <Container size="lg" className="py-6 sm:py-10 space-y-8 text-right" dir="rtl">
          {/* Hero Banner */}
          <section className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900/90 p-6 sm:p-8 text-white relative overflow-hidden shadow-clay">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    شعبة تسيير واقتصاد · السنة الثالثة ثانوي
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    المعاملات الأساسية (محاسبة 6 · اقتصاد 5)
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                  منهاج التسيير المحاسبي والمالي والاقتصاد (الفصل الأول)
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  أعمال نهاية السنة، الاهتلاكات، تسوية المخزونات، قيود اليومية، نظريات النقود والتضخم، وعقود الشركات التجارية.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link href="/exam">
                  <Button variant="primary" size="md" className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>محاكي امتحان التسيير الرسمي</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-800">
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400">التسيير المالي والمحاسبي</span>
                <p className="text-2xl font-black text-amber-400 font-mono">{accountingSkills.length}</p>
                <span className="text-[10px] text-slate-500">مهارة إجرائية وقيد محاسبي</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400">الاقتصاد والمناجمنت</span>
                <p className="text-2xl font-black text-emerald-400 font-mono">{economicsSkills.length}</p>
                <span className="text-[10px] text-slate-500">مفهوم تحليلي ونظري</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-0.5">
                <span className="text-[11px] text-slate-400">القانون والشركات</span>
                <p className="text-2xl font-black text-blue-400 font-mono">{lawSkills.length}</p>
                <span className="text-[10px] text-slate-500">قواعد قانونية وتطبيقية</span>
              </div>
            </div>
          </section>

          {/* Skills Accordion List */}
          <div className="space-y-4">
            <h2 className="text-base font-black text-theme-text flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-500" />
              <span>فهرس كفاءات ودروس شعبة التسيير والاقتصاد:</span>
            </h2>

            {skillsList.map((sk) => (
              <Card key={sk.id} className="p-5 border-theme bg-card space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline" size="sm" className="font-mono text-[10px] mb-1">
                      {sk.subjectId === "accounting_finance" ? "تسيير مالي ومحاسبي (معامل 6)" : sk.subjectId === "economics_management" ? "اقتصاد ومناجمنت (معامل 5)" : "قانون (معامل 2)"}
                    </Badge>
                    <h3 className="text-sm sm:text-base font-bold text-theme-text">{sk.title_ar}</h3>
                  </div>
                  <span className="text-xs text-theme-muted font-mono">{sk.id}</span>
                </div>
                <p className="text-xs text-theme-secondary leading-relaxed">{sk.description_ar}</p>
                <div className="p-3.5 rounded-xl bg-surface-soft border border-theme text-xs space-y-2">
                  <strong className="text-amber-400 block">خطوات المعالجة والتطبيق:</strong>
                  {sk.repairSteps_ar.map((step, sIdx) => (
                    <p key={sIdx} className="text-theme-muted flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{step}</span>
                    </p>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </AppShell>
    );
  }

  // ---------------------------------------------------------------------------
  // SCIENCES EXPÉRIMENTALES VIEW (55 DAILY LESSONS + CHECKPOINTS)
  // ---------------------------------------------------------------------------
  const units = [
    { id: "all", label_ar: "جميع الوحدات (55 يوماً)", count: 55 },
    { id: "u01", label_ar: "الوحدة 01: تركيب البروتين", range: [1, 10], count: 10 },
    { id: "u02", label_ar: "الوحدة 02: بنية ووظيفة البروتين", range: [11, 25], count: 15 },
    { id: "u03", label_ar: "الوحدة 03: النشاط الإنزيمي", range: [26, 35], count: 10 },
    { id: "u04", label_ar: "الوحدة 04: الدفاع عن الذات (المناعة)", range: [36, 50], count: 15 },
    { id: "methodology", label_ar: "معسكر المنهجية والإدماج", range: [51, 55], count: 5 },
  ];

  const filteredLessons = snvTerm1Lessons.filter((lesson) => {
    if (activeUnit === "u01" && (lesson.dayNumber < 1 || lesson.dayNumber > 10)) return false;
    if (activeUnit === "u02" && (lesson.dayNumber < 11 || lesson.dayNumber > 25)) return false;
    if (activeUnit === "u03" && (lesson.dayNumber < 26 || lesson.dayNumber > 35)) return false;
    if (activeUnit === "u04" && (lesson.dayNumber < 36 || lesson.dayNumber > 50)) return false;
    if (activeUnit === "methodology" && (lesson.dayNumber < 51 || lesson.dayNumber > 55)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        lesson.title_ar.toLowerCase().includes(q) ||
        lesson.unitTitle_ar.toLowerCase().includes(q) ||
        lesson.targetCapability_ar.toLowerCase().includes(q) ||
        lesson.dayNumber.toString() === q
      );
    }
    return true;
  });

  return (
    <AppShell activeNav="curriculum">
      <Container size="lg" className="py-6 sm:py-10 space-y-8 text-right" dir="rtl">
        {/* HERO BANNER: SCIENCES EXPÉRIMENTALES */}
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

        {/* View Selector: Lessons vs Checkpoints */}
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

        {/* Section 1: Daily Lessons */}
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

            {/* Lessons Accordion */}
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

                    {isExpanded && (
                      <div className="p-4 sm:p-6 border-t border-theme bg-surface-soft/60 space-y-6 animate-fade-in">
                        {/* Target Capability */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 border-2 border-emerald-200/90 space-y-2 shadow-sm">
                          <span className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                            <Target className="h-4 w-4 text-emerald-700" />
                            الكفاءة المستهدفة اليوم:
                          </span>
                          <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-semibold">
                            {lesson.targetCapability_ar}
                          </p>
                        </div>

                        {/* Video */}
                        {videoData && lesson.externalResource && (
                          <div className="space-y-3">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                              <Video className="h-4 w-4 text-red-600" />
                              <span>فيديو تعليمي موجه بالدقيقة والثانية:</span>
                            </span>
                            <div className="rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-900 shadow-sm">
                              <EmbeddedVideoPlayer
                                videoId={videoData.videoId}
                                videoUrl={lesson.externalResource.videoUrl}
                                startSeconds={videoData.startSeconds}
                                title_ar={lesson.externalResource.title}
                                channelName={lesson.externalResource.channelName}
                              />
                            </div>
                          </div>
                        )}

                        {/* Scientific Explanation */}
                        <div className="space-y-2">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-amber-600" />
                            الشرح العلمي الدقيق:
                          </span>
                          <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-slate-200 shadow-sm">
                            <MathRenderer
                              content={lesson.simpleExplanation_ar}
                              className="text-xs sm:text-sm text-slate-800 leading-relaxed space-y-3"
                            />
                          </div>
                        </div>

                        {/* Diagram */}
                        {diagramData && (
                          <div className="space-y-2">
                            <DiagramViewer
                              caption_ar={diagramData.caption_ar}
                              diagramUrl={diagramData.diagramUrl}
                              labels={diagramData.labels}
                            />
                          </div>
                        )}

                        {/* Common Trap */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border-2 border-amber-200 space-y-2 shadow-sm">
                          <span className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                            <AlertTriangle className="h-4 w-4 text-amber-700" />
                            فخ منهجي شائع يحذر منه المفتشون:
                          </span>
                          <p className="text-xs sm:text-sm text-slate-900 leading-relaxed font-semibold">
                            {lesson.commonMistakes[0]?.trap_ar}
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Section 2: Weekly Checkpoints */}
        {activeSection === "checkpoints" && (
          <div className="space-y-6">
            <div className="space-y-4">
              {snvTerm1Checkpoints.map((cp) => (
                <Card key={cp.id} className="p-5 sm:p-6 border-theme bg-card space-y-5">
                  <div className="flex items-center justify-between border-b border-theme pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          نقطة تفتيش أسبوعية
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-theme-text mt-1">
                        {cp.title_ar}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-slate-200 space-y-3 shadow-sm">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                      {cp.taskStep.instruction_ar}
                    </p>
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
                </Card>
              ))}
            </div>
          </div>
        )}
      </Container>
    </AppShell>
  );
}
