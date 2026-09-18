"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { PHILOSOPHY_TERM1_LESSONS } from "@/domain/content/philosophy";
import { ARABIC_LESSONS_CATALOG } from "@/domain/content/arabic";
import { GESTION_ECO_SKILLS } from "@/data/skills/gestion-economie";
import { LETTRES_PHILO_SKILLS } from "@/data/skills/lettres-philo";
import { getSkillsForSubject } from "@/data/skills";
import { ALL_SUBJECTS, ALGERIAN_BAC_STREAMS, getStreamSubjects } from "@/lib/constants/streams";
import { StreamId, SubjectId } from "@/types/education";
import { useLearningAccessGate, useUserProgress } from "@/lib/hooks";
import { normalizeStreamIdWithDefault } from "@/lib/curriculum/filter";
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
  Play,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Scale,
  FileText,
  Compass,
  Filter,
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

function parseYoutubeData(url?: string, timestamp?: string): { videoId: string; startSeconds: number } | null {
  if (!url) return null;
  const isSearch = url.includes("results?search_query=") || url.includes("search_query=");
  const videoId = isSearch ? url : extractYoutubeVideoId(url);
  if (!videoId) return null;
  const startSeconds = parseTimestampToSeconds(timestamp || 0);
  return { videoId, startSeconds };
}

export default function FreeRoamCurriculumPage() {
  const gate = useLearningAccessGate();
  const enrolledStream = normalizeStreamIdWithDefault(
    gate.profile?.streamId || (gate.profile as any)?.stream,
    "sciences_exp"
  );

  const {
    skills: userSkills,
    masteredCount,
    totalStudyTimeSeconds,
    markSkillMastered,
    recordStudyTime,
  } = useUserProgress();

  const [selectedStream, setSelectedStream] = useState<StreamId>(enrolledStream);
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedItemId, setExpandedItemId] = useState<string | number | null>(1);
  const [activeTab, setActiveTab] = useState<"lessons" | "checkpoints">("lessons");

  // Keep selectedStream in sync if user profile loads
  useEffect(() => {
    if (gate.profile?.streamId) {
      setSelectedStream(normalizeStreamIdWithDefault(gate.profile.streamId, "sciences_exp"));
    }
  }, [gate.profile?.streamId]);

  // Track active study time on the curriculum library (accumulates every 10 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      recordStudyTime(10).catch(() => {});
    }, 10000);
    return () => clearInterval(timer);
  }, [recordStudyTime]);

  const streamRules = useMemo(() => {
    return getStreamSubjects(selectedStream);
  }, [selectedStream]);

  const allAvailableStreams: Array<{ id: StreamId; label_ar: string; label_fr: string }> = [
    { id: "sciences_exp", label_ar: "علوم تجريبية", label_fr: "Sciences Expérimentales" },
    { id: "math", label_ar: "رياضيات", label_fr: "Mathématiques" },
    { id: "technique_math", label_ar: "تقني رياضي", label_fr: "Technique Mathématiques" },
    { id: "gestion_eco", label_ar: "تسيير واقتصاد", label_fr: "Gestion & Économie" },
    { id: "lettres_philo", label_ar: "آداب وفلسفة", label_fr: "Lettres & Philosophie" },
    { id: "langues_etrangeres", label_ar: "لغات أجنبية", label_fr: "Langues Étrangères" },
  ];

  // Resolve active curriculum items based on stream and subject filter
  const curriculumItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // 1. Sciences Expérimentales & Math/Physics streams
    if (selectedStream === "sciences_exp" || selectedStream === "math" || selectedStream === "technique_math") {
      let items: any[] = [];

      // SNV daily lessons (for sciences_exp)
      if (selectedStream === "sciences_exp" && (selectedSubject === "all" || selectedSubject === "natural_sciences")) {
        items.push(
          ...snvTerm1Lessons.map((l) => ({
            id: `snv_day_${l.dayNumber}`,
            skillId: `snv_day_${l.dayNumber}`,
            subjectId: "natural_sciences",
            title_ar: `اليوم ${l.dayNumber}: ${l.title_ar}`,
            title_fr: `Jour ${l.dayNumber}: ${l.title_ar}`,
            unit_ar: l.unitTitle_ar,
            summary_ar: l.coreConcept_ar || l.simpleExplanation_ar,
            summary_fr: l.targetCapability_ar,
            videoUrl: l.externalResource?.videoUrl,
            videoTimestamp: l.externalResource?.targetTimestamp,
            dayNumber: l.dayNumber,
            keyQuestions: l.commonMistakes?.map((m) => m.trap_ar) || [],
            type: "daily_lesson",
          }))
        );
      }

      // Subject skills for Math & Physics
      const subjectsToLoad = selectedSubject === "all"
        ? streamRules.map((r) => r.subjectId)
        : [selectedSubject];

      for (const subj of subjectsToLoad) {
        if (subj === "natural_sciences" && selectedStream === "sciences_exp") continue; // already loaded as daily lessons
        const skills = getSkillsForSubject(subj, selectedStream);
        items.push(
          ...skills.map((s) => ({
            id: s.id,
            skillId: s.id,
            subjectId: s.subjectId,
            title_ar: s.title_ar,
            title_fr: s.title_fr,
            unit_ar: ALL_SUBJECTS[s.subjectId as SubjectId]?.name_ar || s.subjectId,
            summary_ar: s.description_ar,
            summary_fr: s.description_fr,
            repairStrategy_ar: s.repairStrategy_ar,
            repairSteps_ar: s.repairSteps_ar,
            type: "skill",
          }))
        );
      }

      if (query) {
        return items.filter(
          (it) =>
            it.title_ar?.toLowerCase().includes(query) ||
            it.title_fr?.toLowerCase().includes(query) ||
            it.summary_ar?.toLowerCase().includes(query) ||
            it.unit_ar?.toLowerCase().includes(query)
        );
      }
      return items;
    }

    // 2. Gestion & Économie
    if (selectedStream === "gestion_eco") {
      const skills = Object.values(GESTION_ECO_SKILLS);
      let filtered = skills;
      if (selectedSubject !== "all") {
        filtered = filtered.filter((s) => s.subjectId === selectedSubject);
      }
      if (query) {
        filtered = filtered.filter(
          (s) =>
            s.title_ar?.toLowerCase().includes(query) ||
            s.title_fr?.toLowerCase().includes(query) ||
            s.description_ar?.toLowerCase().includes(query)
        );
      }
      return filtered.map((s) => ({
        id: s.id,
        skillId: s.id,
        subjectId: s.subjectId,
        title_ar: s.title_ar,
        title_fr: s.title_fr,
        unit_ar: ALL_SUBJECTS[s.subjectId as SubjectId]?.name_ar || s.subjectId,
        summary_ar: s.description_ar,
        summary_fr: s.description_fr,
        repairStrategy_ar: s.repairStrategy_ar,
        repairSteps_ar: s.repairSteps_ar,
        type: "skill",
      }));
    }

    // 3. Lettres & Philosophie
    if (selectedStream === "lettres_philo" || selectedStream === "langues_etrangeres") {
      let items: any[] = [];

      // Philosophy Essay Lessons
      if (selectedSubject === "all" || selectedSubject === "philosophy") {
        items.push(
          ...PHILOSOPHY_TERM1_LESSONS.map((p) => ({
            id: p.id,
            skillId: p.id,
            subjectId: "philosophy",
            title_ar: p.issueTitle_ar,
            title_fr: p.issueTitle_ar,
            unit_ar: p.unitTitle_ar,
            summary_ar: p.introduction.philosophicalParadox_ar || p.thesis.title_ar,
            summary_fr: p.thesis.title_ar,
            arguments: p.thesis.arguments_ar?.map((arg) => arg.premise_ar) || [],
            quotes: p.thesis.quotes || [],
            type: "philosophy_essay",
          }))
        );
      }

      // Arabic Language Lessons
      if (selectedSubject === "all" || selectedSubject === "arabic") {
        items.push(
          ...ARABIC_LESSONS_CATALOG.map((a) => ({
            id: a.id,
            skillId: a.id,
            subjectId: "arabic",
            title_ar: a.unitTitle_ar,
            title_fr: a.unitTitle_ar,
            unit_ar: a.unitTitle_ar,
            summary_ar: a.intellectualConstruction.centralTheme_ar,
            summary_fr: a.intellectualConstruction.centralTheme_ar,
            rules: a.linguisticConstruction.grammarRules || [],
            type: "arabic_lesson",
          }))
        );
      }

      // Additional Lettres & Philo skills
      const lpSkills = Object.values(LETTRES_PHILO_SKILLS);
      for (const s of lpSkills) {
        if (selectedSubject !== "all" && s.subjectId !== selectedSubject) continue;
        items.push({
          id: s.id,
          skillId: s.id,
          subjectId: s.subjectId,
          title_ar: s.title_ar,
          title_fr: s.title_fr,
          unit_ar: ALL_SUBJECTS[s.subjectId as SubjectId]?.name_ar || s.subjectId,
          summary_ar: s.description_ar,
          summary_fr: s.description_fr,
          repairStrategy_ar: s.repairStrategy_ar,
          repairSteps_ar: s.repairSteps_ar,
          type: "skill",
        });
      }

      if (query) {
        return items.filter(
          (it) =>
            it.title_ar?.toLowerCase().includes(query) ||
            it.title_fr?.toLowerCase().includes(query) ||
            it.summary_ar?.toLowerCase().includes(query)
        );
      }
      return items;
    }

    return [];
  }, [selectedStream, selectedSubject, searchQuery, streamRules]);

  const streamInfo = ALGERIAN_BAC_STREAMS[selectedStream];

  return (
    <AppShell activeNav="curriculum">
      <Container size="lg" className="py-6 sm:py-10 space-y-8 text-right" dir="rtl">
        {/* ================================================================= */}
        {/* HERO SECTION WITH REAL STUDY-TIME TRACKER                          */}
        {/* ================================================================= */}
        <section className="rounded-3xl border border-theme bg-gradient-to-br from-surface via-surface/90 to-surface/60 p-6 sm:p-8 relative overflow-hidden shadow-clay">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" size="sm" className="font-bold text-xs px-3 py-1">
                  المكتبة الشاملة • الوضع الحر
                </Badge>
                {selectedStream === enrolledStream && (
                  <Badge variant="outline" size="sm" className="text-xs bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                    شعبتك الرسمية المسجلة
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-theme-text">
                منهاج {streamInfo?.name_ar || "البكالوريا"} كاملاً
              </h1>

              <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
                تصفح كل الوحدات والدروس، شاهد الشروحات، راجع الملخصات، وعلّم الدروس التي أتقنتها بضغطة زر دون أي تقييد بمسار إجباري.
              </p>
            </div>

            {/* Live Study Time & Mastery Counter */}
            <div className="flex items-center gap-3">
              <div className="p-4 rounded-2xl bg-card border border-theme shadow-sm text-center min-w-[130px]">
                <div className="flex items-center justify-center gap-1.5 text-xs text-theme-muted mb-1 font-bold">
                  <Clock className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  <span>وقت الدراسة</span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-theme-text font-mono">
                  {Math.round(totalStudyTimeSeconds / 60)} د
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-card border border-theme shadow-sm text-center min-w-[130px]">
                <div className="flex items-center justify-center gap-1.5 text-xs text-theme-muted mb-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>الدروس المتقنة</span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-emerald-500 font-mono">
                  {masteredCount}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stream Selector Pills */}
          <div className="pt-6 mt-6 border-t border-theme/60 space-y-2">
            <span className="text-xs font-bold text-theme-muted block">
              تصفح شعبة أخرى:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {allAvailableStreams.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => {
                    setSelectedStream(st.id);
                    setSelectedSubject("all");
                    setSearchQuery("");
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedStream === st.id
                      ? "bg-[var(--color-primary)] text-white shadow-md scale-102"
                      : "bg-card border border-theme text-theme-secondary hover:text-theme-text hover:border-theme-hover"
                  }`}
                >
                  <span>{st.label_ar}</span>
                  {st.id === enrolledStream && (
                    <span className="ms-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-white/20">
                      أنت هنا
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SUBJECT TABS & SEARCH BAR                                          */}
        {/* ================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Subject Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedSubject("all")}
                className={`px-4 py-2 rounded-xl whitespace-nowrap font-bold transition-all ${
                  selectedSubject === "all"
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm"
                    : "bg-card border border-theme text-theme-secondary hover:text-theme-text"
                }`}
              >
                كل المواد ({curriculumItems.length})
              </button>

              {streamRules.map((r) => {
                const subj = ALL_SUBJECTS[r.subjectId];
                const name = subj?.name_ar || r.subjectId;
                const isSelected = selectedSubject === r.subjectId;

                return (
                  <button
                    key={r.subjectId}
                    type="button"
                    onClick={() => setSelectedSubject(r.subjectId)}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[var(--color-primary)] text-white shadow-sm"
                        : "bg-card border border-theme text-theme-secondary hover:text-theme-text"
                    }`}
                  >
                    <span>{name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface/80 border border-theme">
                      معامل {r.coefficient}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72 shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في الدروس والملخصات..."
                className="w-full bg-card border border-theme rounded-xl px-3 py-2 text-xs text-theme-text placeholder:text-theme-muted pr-8 focus:outline-none focus:border-[var(--color-primary)]"
              />
              <Search className="h-4 w-4 text-theme-muted absolute right-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* CURRICULUM ITEMS LIST WITH MANUAL MASTERY TOGGLES                  */}
        {/* ================================================================= */}
        <div className="space-y-4">
          {curriculumItems.length === 0 ? (
            <Card className="p-8 text-center space-y-3 bg-card border-theme">
              <BookOpen className="w-10 h-10 text-theme-muted mx-auto" />
              <p className="text-sm font-bold text-theme-text">لا توجد دروس مطابقة لبحثك</p>
              <p className="text-xs text-theme-muted">جرب اختيار مادة أخرى أو مسح نص البحث</p>
            </Card>
          ) : (
            curriculumItems.map((item: any) => {
              const isExpanded = expandedItemId === item.id;
              const isMastered = userSkills[item.skillId]?.status === "mastered";
              const subjMeta = ALL_SUBJECTS[item.subjectId as SubjectId];
              const diagramData = item.dayNumber ? CURRICULUM_DIAGRAMS[item.dayNumber] : null;
              const youtubeData = parseYoutubeData(item.videoUrl, item.videoTimestamp);

              return (
                <Card
                  key={item.id}
                  className={`border transition-all duration-200 overflow-hidden ${
                    isExpanded
                      ? "border-[var(--color-primary)]/60 bg-card shadow-md ring-1 ring-[var(--color-primary)]/20"
                      : "border-theme bg-card hover:border-theme-hover"
                  }`}
                >
                  {/* Header Row */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div
                      onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                      className="flex items-start gap-3.5 flex-1 cursor-pointer select-none"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center shrink-0 mt-0.5 shadow-sm font-bold text-sm">
                        {item.dayNumber ? `ي${item.dayNumber}` : <BookOpen className="w-5 h-5" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-sm sm:text-base text-theme-text hover:text-[var(--color-primary)] transition-colors">
                            {item.title_ar}
                          </span>
                          {subjMeta && (
                            <Badge variant="outline" size="sm" className="text-[10px] font-bold">
                              {subjMeta.name_ar}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-theme-secondary line-clamp-1">
                          {item.summary_ar}
                        </p>
                      </div>
                    </div>

                    {/* Action Controls: Mastery Toggle + Practice Link */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {/* Manual Mastery Toggle Button */}
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          await markSkillMastered(item.skillId, selectedStream, item.subjectId);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          isMastered
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                            : "bg-surface border border-theme text-theme-secondary hover:text-theme-text hover:border-[var(--color-border-hover)]"
                        }`}
                        title="تحديد أو إلغاء إتقان الدرس يدوياً"
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isMastered ? "text-emerald-400" : "text-theme-muted"}`} />
                        <span>{isMastered ? "تم الإتقان ✓" : "تحديد كمتقن"}</span>
                      </button>

                      {/* Direct Practice Link */}
                      <Link
                        href={`/mission/${item.skillId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] transition-all shadow-sm"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>تمرين</span>
                      </Link>

                      {/* Toggle Expand Arrow */}
                      <button
                        type="button"
                        onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                        className="p-1.5 rounded-lg border border-theme text-theme-muted hover:text-theme-text"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content Drawer */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-theme/60 space-y-4 animate-fade-in text-xs sm:text-sm">
                      {/* Summary & Description */}
                      <div className="p-4 rounded-2xl bg-surface/50 border border-theme space-y-2">
                        <span className="font-bold text-theme-text block text-xs text-[var(--color-primary)]">
                          ملخص الدرس والمفاهيم الأساسية:
                        </span>
                        <p className="text-theme-secondary leading-relaxed">
                          {item.summary_ar}
                        </p>
                      </div>

                      {/* Repair Steps / Methodological Framework */}
                      {item.repairSteps_ar && item.repairSteps_ar.length > 0 && (
                        <div className="p-4 rounded-2xl bg-surface/50 border border-theme space-y-2">
                          <span className="font-bold text-theme-text block text-xs text-amber-500">
                            الخطوات المنهجية المعتمدة للحل:
                          </span>
                          <ol className="list-decimal list-inside space-y-1 text-theme-secondary">
                            {item.repairSteps_ar.map((step: string, sIdx: number) => (
                              <li key={sIdx} className="leading-relaxed">
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {/* Video explanation if available */}
                      {youtubeData && (
                        <div className="space-y-2">
                          <span className="font-bold text-theme-text block text-xs flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-rose-500" />
                            <span>الشرح المرئي المصاحب:</span>
                          </span>
                          <EmbeddedVideoPlayer
                            videoId={youtubeData.videoId}
                            startSeconds={youtubeData.startSeconds}
                            title_ar={item.title_ar}
                          />
                        </div>
                      )}

                      {/* Diagram Viewer if available */}
                      {diagramData && (
                        <div className="space-y-2">
                          <DiagramViewer
                            caption_ar={diagramData.caption_ar}
                            diagramUrl={diagramData.diagramUrl}
                            labels={diagramData.labels}
                          />
                        </div>
                      )}

                      {/* Philosophy Arguments & Quotes if applicable */}
                      {item.arguments && (
                        <div className="p-4 rounded-2xl bg-surface/50 border border-theme space-y-3">
                          <span className="font-bold text-theme-text block text-xs text-rose-400">
                            أبرز الحجج الفلسفية والأقوال:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {item.arguments.slice(0, 4).map((arg: any, aIdx: number) => (
                              <div key={aIdx} className="p-2.5 rounded-xl bg-card border border-theme space-y-1">
                                <span className="font-bold text-xs text-theme-text block">{arg.title_ar}</span>
                                <p className="text-[11px] text-theme-muted">{arg.content_ar}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </Container>
    </AppShell>
  );
}
