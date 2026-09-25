"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  SubjectDashboard,
  UnifiedLessonReader,
  CurriculumDisplayItem,
  CurriculumEvidenceView,
} from "@/components/curriculum";
import {
  CurriculumEvidenceService,
  CurriculumTreeSummary,
} from "@/lib/study-os/curriculum-evidence-service";
import { ContentService } from "@/lib/services/content-service";
import { getSkillLearningBundle } from "@/data/curriculum/registry";
import { ALL_SUBJECTS, ALGERIAN_BAC_STREAMS, getStreamSubjects } from "@/lib/constants/streams";
import { StreamId, SubjectId } from "@/types/education";
import { useLearningAccessGate, useUserProgress } from "@/lib/hooks";
import { useAuth } from "@/lib/auth/hooks";
import { normalizeStreamIdWithDefault } from "@/lib/curriculum/filter";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
  Sparkles,
  ShieldCheck,
  Compass,
  Layers,
  Search,
  Lock,
} from "lucide-react";

// Diagrams mapping for key SNV curriculum days (Sciences Expérimentales)
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

export default function FreeRoamCurriculumPage() {
  const { user } = useAuth();
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
  const [selectedTrimester, setSelectedTrimester] = useState<"all" | 1 | 2 | 3>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeModalSkillId, setActiveModalSkillId] = useState<string | null>(null);

  // Phase 3 Study OS: Pedagogical Evidence State & View Switcher
  const [viewMode, setViewMode] = useState<"evidence_map" | "browser">("evidence_map");
  const [evidenceSummary, setEvidenceSummary] = useState<CurriculumTreeSummary | null>(null);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState<boolean>(true);

  // Keep selectedStream in sync if user profile loads
  useEffect(() => {
    if (gate.profile?.streamId) {
      setSelectedStream(normalizeStreamIdWithDefault(gate.profile.streamId, "sciences_exp"));
    }
  }, [gate.profile?.streamId]);

  // Fetch authentic pedagogical evidence summary for the active stream
  useEffect(() => {
    let cancelled = false;
    async function loadEvidence() {
      setIsLoadingEvidence(true);
      try {
        const userId = user?.id || (gate.profile as any)?.userId || gate.profile?.id || "";
        const summary = await CurriculumEvidenceService.getCurriculumTree(
          userId,
          selectedStream,
          userSkills
        );
        if (!cancelled) {
          setEvidenceSummary(summary);
        }
      } catch (err) {
        console.error("Failed to load curriculum evidence summary:", err);
      } finally {
        if (!cancelled) {
          setIsLoadingEvidence(false);
        }
      }
    }
    loadEvidence();
    return () => {
      cancelled = true;
    };
  }, [user?.id, (gate.profile as any)?.userId, gate.profile?.id, selectedStream, userSkills]);

  // Track study time on curriculum page every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      recordStudyTime(10).catch(() => {});
    }, 10000);
    return () => clearInterval(timer);
  }, [recordStudyTime]);

  // Precompute skill counts across all 6 streams
  const streamSkillCounts = useMemo<Record<StreamId, number>>(() => {
    const counts: Record<string, number> = {};
    const streams: StreamId[] = [
      "sciences_exp",
      "math",
      "technique_math",
      "gestion_eco",
      "lettres_philo",
      "langues_etrangeres",
    ];
    for (const st of streams) {
      counts[st] = ContentService.getSkillsForStream(st).length;
    }
    return counts as Record<StreamId, number>;
  }, []);

  // Retrieve raw canonical skills for the active stream
  const rawStreamSkills = useMemo(() => {
    return ContentService.getSkillsForStream(selectedStream);
  }, [selectedStream]);

  // Map to unified display items
  const displayItems = useMemo<CurriculumDisplayItem[]>(() => {
    const query = searchQuery.trim().toLowerCase();

    return rawStreamSkills
      .map((s) => {
        // Infer dayNumber if SNV daily lesson
        let dayNum: number | undefined;
        if (s.id.startsWith("snv_day_")) {
          const parsed = parseInt(s.id.replace("snv_day_", ""), 10);
          if (!isNaN(parsed)) dayNum = parsed;
        }

        // Infer trimester (Term 1, 2, or 3)
        let termNum: 1 | 2 | 3 | undefined;
        if (dayNum) {
          termNum = dayNum <= 45 ? 1 : dayNum <= 75 ? 2 : 3;
        } else if (s.id.includes("term2") || s.id.includes("t2")) {
          termNum = 2;
        } else if (s.id.includes("term3") || s.id.includes("t3")) {
          termNum = 3;
        } else {
          termNum = 1; // Standard primary syllabus term
        }

        const subjMeta = ALL_SUBJECTS[s.subjectId as SubjectId];
        const unitTitle = subjMeta?.name_ar || s.subjectId;

        return {
          id: s.id,
          skillId: s.id,
          subjectId: s.subjectId,
          title_ar: s.title_ar,
          title_fr: s.title_fr,
          unit_ar: unitTitle,
          summary_ar: s.description_ar,
          difficulty: (s.difficulty || 2) as 1 | 2 | 3,
          estimatedMinutes: 25,
          dayNumber: dayNum,
          termNumber: termNum,
          hasVideo: Boolean(dayNum && dayNum <= 10),
          hasDiagram: Boolean(dayNum && CURRICULUM_DIAGRAMS[dayNum]),
        };
      })
      .filter((item) => {
        // Subject filter
        if (selectedSubject !== "all" && item.subjectId !== selectedSubject) {
          return false;
        }
        // Trimester filter
        if (selectedTrimester !== "all" && item.termNumber !== selectedTrimester) {
          return false;
        }
        // Search query filter
        if (query) {
          const matchTitle = item.title_ar?.toLowerCase().includes(query);
          const matchSummary = item.summary_ar?.toLowerCase().includes(query);
          const matchUnit = item.unit_ar?.toLowerCase().includes(query);
          const matchId = item.skillId?.toLowerCase().includes(query);
          return matchTitle || matchSummary || matchUnit || matchId;
        }
        return true;
      });
  }, [rawStreamSkills, selectedSubject, selectedTrimester, searchQuery]);

  // Selected Bundle for Unified Lesson Reader Modal
  const activeBundle = useMemo(() => {
    if (!activeModalSkillId) return null;
    return getSkillLearningBundle(activeModalSkillId);
  }, [activeModalSkillId]);

  // Extract diagram data if present for active modal skill
  const activeDiagramData = useMemo(() => {
    if (!activeModalSkillId) return null;
    if (activeModalSkillId.startsWith("snv_day_")) {
      const day = parseInt(activeModalSkillId.replace("snv_day_", ""), 10);
      return CURRICULUM_DIAGRAMS[day] || null;
    }
    return null;
  }, [activeModalSkillId]);

  const streamInfo = ALGERIAN_BAC_STREAMS[selectedStream];

  if (!gate.isLoading && !gate.hasPremiumAccess) {
    return (
      <AppShell activeNav="curriculum">
        <Container size="sm" className="py-12 sm:py-16 text-center space-y-6" dir="rtl">
          <div data-testid="curriculum-trial-expired-gate" className="p-6 sm:p-8 rounded-3xl bg-card border border-theme space-y-5 shadow-clay animate-fade-in">
            <div className="h-12 w-12 rounded-2xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)] mx-auto">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-theme-text font-sans">
                مسارك مازال محفوظ. فعّل اشتراكك باش تكمل من وين حبست
              </h1>
              <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed max-w-md mx-auto font-sans">
                انتهت فترة التجربة المجانية (7 أيام). جميع دروسك ومهاراتك المكتسبة محفوظة بدقة. فعّل اشتراكك الآن للوصول الكامل لمنهاج البكالوريا كاملاً.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/subscribe" className="w-full sm:w-auto">
                <Button size="lg" variant="primary" fullWidth className="font-bold text-sm shadow-clay">
                  <span>كمّل مع الشاطر</span>
                </Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" fullWidth className="text-xs">
                  <span>العودة للوحة التحكم</span>
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </AppShell>
    );
  }

  return (
    <AppShell activeNav="curriculum">
      <Container size="lg" className="py-6 sm:py-10 space-y-8 text-right" dir="rtl">
        {/* ================================================================= */}
        {/* HERO SECTION WITH LIVE REAL STUDY-TIME TRACKER                    */}
        {/* ================================================================= */}
        <section className="rounded-3xl border border-theme bg-gradient-to-br from-surface via-surface/90 to-surface/60 p-6 sm:p-8 relative overflow-hidden shadow-clay">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="primary" size="sm" className="font-bold text-xs px-3 py-1">
                  المكتبة الشاملة • المنهاج الوزاري الموحد
                </Badge>
                <Badge
                  variant="outline"
                  size="sm"
                  className="text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold"
                >
                  شعبتك الرسمية: {streamInfo?.name_ar || "العلوم التجريبية"}
                </Badge>
                <Badge variant="outline" size="sm" className="text-xs text-theme-muted">
                  {displayItems.length} كفاءة ودرس معتمد
                </Badge>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-theme-text font-sans">
                منهاج شعبة {streamInfo?.name_ar || "البكالوريا"} كاملاً
              </h1>

              <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
                تصفح كل مواد شعبتك الرسمية مرتبة حسب المعاملات الوزارية المعتمدة في البكالوريا، اقرأ الشروحات النظرية المركزة،
                حل المسائل والتمارين، واختبر استيعابك بأسئلة تشخيصية متطابقة مع امتحانات البكالوريا.
              </p>
            </div>

            {/* Live Study Time & Authentic Pedagogical Evidence Counter */}
            <div className="flex items-center gap-3 shrink-0">
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
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>الإتقان المثبت</span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-emerald-500 font-mono">
                  {evidenceSummary ? `${evidenceSummary.overallMasteryPercentage}%` : `${masteredCount}`}
                </span>
                <span className="block text-[10px] text-theme-muted mt-0.5">
                  {evidenceSummary ? `${evidenceSummary.demonstratedSkillsCount}/${evidenceSummary.totalSkillsCount} مهارة` : "تقييم مثبت"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* VIEW MODE TOGGLE & STREAM SELECTOR                                */}
        {/* ================================================================= */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 rounded-2xl bg-card border border-theme shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode("evidence_map")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "evidence_map"
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-theme-muted hover:text-theme-text hover:bg-surface/60"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>خريطة الإتقان البيداغوجي 🗺️</span>
              {evidenceSummary && (
                <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-mono">
                  {evidenceSummary.overallMasteryPercentage}%
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setViewMode("browser")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "browser"
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "text-theme-muted hover:text-theme-text hover:bg-surface/60"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>تصفح الفصول والتمارين 📖</span>
              <span className="px-1.5 py-0.5 rounded-full bg-surface text-theme-muted text-[10px] font-mono border border-theme">
                {displayItems.length}
              </span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 text-xs pt-1 sm:pt-0 border-t sm:border-t-0 border-theme/40">
            <span className="text-theme-muted font-bold">الشعبة المعروضة:</span>
            <select
              value={selectedStream}
              onChange={(e) => setSelectedStream(e.target.value as StreamId)}
              className="bg-surface border border-theme rounded-xl px-3 py-1.5 text-xs text-theme-text font-bold focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              {Object.entries(ALGERIAN_BAC_STREAMS).map(([id, s]) => (
                <option key={id} value={id}>
                  {s.name_ar}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ================================================================= */}
        {/* MAIN CURRICULUM VIEW (EVIDENCE MAP OR SUBJECT BROWSER)            */}
        {/* ================================================================= */}
        {viewMode === "evidence_map" ? (
          isLoadingEvidence && !evidenceSummary ? (
            <div className="p-12 text-center rounded-3xl border border-theme bg-card shadow-clay space-y-4 animate-pulse">
              <Compass className="w-10 h-10 text-[var(--color-primary)] mx-auto animate-spin" />
              <div className="text-sm font-bold text-theme-text">جاري استخراج الأدلة البيداغوجية وتحليل المهارات...</div>
              <p className="text-xs text-theme-muted">نطابق بين جلساتك والتمارين المحلولة واختبارات التشخيص</p>
            </div>
          ) : evidenceSummary ? (
            <CurriculumEvidenceView
              summary={evidenceSummary}
              onOpenLesson={(skillId) => setActiveModalSkillId(skillId)}
            />
          ) : (
            <div className="p-8 text-center text-xs text-theme-muted">
              تعذر تحميل بيانات الأدلة البيداغوجية. يرجى إعادة المحاولة.
            </div>
          )
        ) : (
          <SubjectDashboard
            selectedStream={selectedStream}
            selectedSubject={selectedSubject}
            onSelectSubject={(subj) => setSelectedSubject(subj)}
            selectedTrimester={selectedTrimester}
            onSelectTrimester={(trim) => setSelectedTrimester(trim)}
            searchQuery={searchQuery}
            onSearchChange={(q) => setSearchQuery(q)}
            items={displayItems}
            userSkills={userSkills}
            onOpenLesson={(skillId) => setActiveModalSkillId(skillId)}
            onToggleMastery={async (skillId, streamId, subjectId) => {
              await markSkillMastered(skillId, streamId, subjectId);
            }}
          />
        )}

        {/* ================================================================= */}
        {/* UNIFIED LESSON READER MODAL (14 PEDAGOGICAL ASSETS)               */}
        {/* ================================================================= */}
        <UnifiedLessonReader
          bundle={activeBundle}
          isOpen={Boolean(activeModalSkillId)}
          onClose={() => setActiveModalSkillId(null)}
          isMastered={
            activeModalSkillId ? userSkills[activeModalSkillId]?.status === "mastered" : false
          }
          onToggleMastery={async (skillId) => {
            if (activeBundle) {
              await markSkillMastered(
                skillId,
                selectedStream,
                activeBundle.skill.subjectId
              );
            }
          }}
          diagramData={activeDiagramData}
        />
      </Container>
    </AppShell>
  );
}
