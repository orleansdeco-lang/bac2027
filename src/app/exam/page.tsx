"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useLearningAccessGate } from "@/lib/hooks";
import { ExamModeService, ExamReadinessMetrics } from "@/lib/services/exam-mode-service";
import { ProgressService } from "@/lib/services/progress-service";
import { ContentService } from "@/lib/services/content-service";
import { getStudentSubjects } from "@/domain/student";
import { SUBJECT_REGISTRY } from "@/domain/curriculum/subjects";
import { PROMPT11_PAST_BAC_REFERENCES } from "@/domain/content/past-bac-references";
import { SubjectId, StreamId } from "@/types/education";
import { trackEvent } from "@/lib/analytics";
import { normalizeStreamIdWithDefault } from "@/lib/curriculum/filter";
import {
  Target,
  Clock,
  ShieldCheck,
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  BookOpen,
  Award,
  Sparkles,
  Zap,
  Lock,
} from "lucide-react";

import { DDaySimulator } from "@/components/exam/DDaySimulator";

export default function ExamModePage() {
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";
  const gate = useLearningAccessGate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ExamReadinessMetrics | null>(null);
  const [report, setReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"simulator" | "strategy" | "readiness" | "archives">("simulator");

  const NextArrow = isAr ? ArrowLeft : ArrowRight;
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  useEffect(() => {
    async function loadExamData() {
      if (!gate.isAuthorized || !gate.profile) return;
      try {
        const prog = await ProgressService.getProgressReport(gate.profile.id);
        setReport(prog);

        const demonstrated = prog?.demonstratedSkills?.length || 0;
        const currentStream = normalizeStreamIdWithDefault(gate.profile.streamId, "sciences_exp");
        const streamSkills = ContentService.getSkillsForStream(currentStream);
        const totalSkills = streamSkills.length || 31;
        const mathCount = prog?.subjectBreakdown?.mathematics?.demonstrated || 0;
        const physCount = prog?.subjectBreakdown?.physics?.demonstrated || 0;
        const snvCount = prog?.subjectBreakdown?.natural_sciences?.demonstrated || 0;
        const activeErrors = prog?.activeErrors?.length || 0;
        const repairedErrors = prog?.repairedErrorsCount || 0;

        const calculated = ExamModeService.calculateReadiness({
          demonstratedSkillsCount: demonstrated,
          totalSkillsCount: totalSkills,
          mathDemonstrated: mathCount,
          physicsDemonstrated: physCount,
          snvDemonstrated: snvCount,
          activeErrorsCount: activeErrors,
          repairedErrorsCount: repairedErrors,
        });

        setMetrics(calculated);
        trackEvent("exam_mode_viewed", {
          streamId: gate.profile.streamId,
          readinessIndex: calculated.readinessIndex,
        });
      } catch (err) {
        console.error("Failed to load exam data:", err);
      } finally {
        setLoading(false);
      }
    }

    if (gate.isAuthorized) {
      loadExamData();
    } else if (!gate.isLoading) {
      setLoading(false);
    }
  }, [gate.isAuthorized, gate.isLoading, gate.profile]);

  if (gate.isLoading || loading) {
    return (
      <AppShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <Compass className="h-6 w-6 text-[var(--color-primary)] animate-spin" />
            <p className="text-sm font-mono text-theme-muted">
              {isAr ? "جاري احتساب مؤشر الجاهزية للبكالوريا..." : "Calcul de l'indice de préparation au BAC..."}
            </p>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!gate.isAuthorized || !gate.profile) {
    return null;
  }

  if (!gate.hasPremiumAccess) {
    return (
      <AppShell activeNav="exam">
        <Container size="sm" className="py-12 sm:py-16 text-center space-y-6" dir="rtl">
          <div data-testid="exam-trial-expired-gate" className="p-6 sm:p-8 rounded-3xl bg-card border border-theme space-y-5 shadow-clay animate-fade-in">
            <div className="h-12 w-12 rounded-2xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/30 flex items-center justify-center text-[var(--color-accent)] mx-auto">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-bold text-theme-text font-sans">
                مسارك مازال محفوظ. فعّل اشتراكك باش تكمل
              </h1>
              <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed max-w-md mx-auto font-sans">
                انتهت فترة التجربة المجانية (7 أيام). تحليلات جاهزيتك واختباراتك السابقة محفوظة بالكامل. فعّل اشتراكك الآن لتشغيل محاكي البكالوريا وتوليد المواضيع الرسمية.
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

  const profile = gate.profile;
  const streamId = normalizeStreamIdWithDefault(profile.streamId || (profile as any)?.stream, "sciences_exp");
  const authorizedSubjects = getStudentSubjects(streamId, profile.techniqueMathSpecialty);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "distinction_level":
        return {
          label: isAr ? "مستوى امتياز وتفوق (16-20)" : "Niveau Distinction (16-20)",
          color: "bg-[var(--color-success-soft)] border-[var(--color-success)]/30 text-[var(--color-success)]",
        };
      case "exam_ready":
        return {
          label: isAr ? "جاهز للامتحان الرسمي" : "Prêt pour le BAC",
          color: "bg-[var(--color-primary-soft)] border-[var(--color-primary)]/30 text-[var(--color-primary)]",
        };
      case "emerging_readiness":
        return {
          label: isAr ? "جاهزية قيد التكوين" : "Préparation en cours",
          color: "bg-[var(--color-accent-soft)] border-[var(--color-accent)]/30 text-[var(--color-accent)]",
        };
      default:
        return {
          label: isAr ? "في بداية مسار التحضير" : "Début de préparation",
          color: "bg-surface-soft border-theme text-theme-muted",
        };
    }
  };

  const statusBadge = getStatusBadge(metrics?.status);

  // Time allocation by stream
  const examTimetable =
    streamId === "math"
      ? [
          { subject_ar: "الرياضيات", coeff: 7, duration: "4 سا و 30 د", priority_ar: "معامل حاسم • مسألة الدوال والمتتاليات" },
          { subject_ar: "العلوم الفيزيائية", coeff: 6, duration: "3 سا و 30 د", priority_ar: "الدارة RC/RL والميكانيك" },
          { subject_ar: "اللغة العربية", coeff: 3, duration: "2 سا و 30 د", priority_ar: "النص الشعري أو المقال" },
          { subject_ar: "الفلسفة", coeff: 2, duration: "2 سا و 30 د", priority_ar: "المقالة الفلسفية المنهجية" },
        ]
      : streamId === "gestion_eco"
      ? [
          { subject_ar: "التسيير المحاسبي والمالي", coeff: 6, duration: "4 سا و 30 د", priority_ar: "الميزانية وأعمال نهاية السنة" },
          { subject_ar: "الاقتصاد والمناجمنت", coeff: 5, duration: "3 سا و 30 د", priority_ar: "السوق والأسعار والنقود" },
          { subject_ar: "القانون", coeff: 2, duration: "2 سا و 30 د", priority_ar: "عقد العمل والشركات التجارية" },
          { subject_ar: "الرياضيات", coeff: 5, duration: "3 سا و 30 د", priority_ar: "الدوال والمتتاليات العددية" },
        ]
      : [
          { subject_ar: "علوم الطبيعة والحياة", coeff: 6, duration: "4 سا و 30 د", priority_ar: "المسعى العلمي والاستدلال المنطقي" },
          { subject_ar: "العلوم الفيزيائية", coeff: 5, duration: "3 سا و 30 د", priority_ar: "الظواهر الكهربائية والميكانيك" },
          { subject_ar: "الرياضيات", coeff: 5, duration: "3 سا و 30 د", priority_ar: "الدوال الأسية واللوغارتمية والمتتاليات" },
          { subject_ar: "الفلسفة", coeff: 2, duration: "2 سا و 30 د", priority_ar: "منهجية المقارنة والجدل واستقصاء بالوضع" },
        ];

  return (
    <AppShell activeNav="exam">
      <Container size="lg" className="py-6 sm:py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-theme pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="primary" size="sm" className="font-bold">
                {isAr ? "وضع الامتحان الرسمي" : "Mode Examen BAC"}
              </Badge>
              <div className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${statusBadge.color}`}>
                {statusBadge.label}
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-theme-text tracking-tight font-sans">
              {isAr ? "محاكاة واستراتيجية امتحان البكالوريا" : "Stratégie & Simulation BAC"}
            </h1>
            <p className="text-xs sm:text-sm text-theme-secondary max-w-2xl leading-relaxed">
              {isAr
                ? "في البكالوريا، التميز ليس فقط في حفظ القوانين، بل في إدارة الوقت، اختيار الموضوع الأنسب، وضمان كل نقطة في ورقة الإجابة."
                : "La réussite au BAC dépend de la maîtrise méthodologique, du choix tactique du sujet et de la gestion du temps."}
            </p>
          </div>

          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <BackArrow className="h-4 w-4" />
              <span>{isAr ? "العودة للرئيسية" : "Retour"}</span>
            </Button>
          </Link>
        </div>

        {/* ================================================================= */}
        {/* 1. AUTHENTIC READINESS INDEX HERO                                 */}
        {/* ================================================================= */}
        <section className="rounded-3xl border border-[#E4DED2] bg-gradient-to-br from-[#EFE9DC] via-[#F7F3EA] to-[#FFFCF7] p-6 sm:p-8 shadow-clay text-theme-text relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-primary)]">
                <Sparkles className="h-4 w-4 text-[var(--color-primary)]" />
                <span>{isAr ? "مؤشر الجاهزية الأكاديمي المثبت" : "Indice de Préparation Validé"}</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-theme-text">
                  {metrics?.readinessIndex || 0}%
                </span>
                <span className="text-xs sm:text-sm text-theme-secondary font-sans font-medium">
                  {isAr
                    ? "جاهزية فعلية مبنية على مهارات مثبتة وأخطاء تم إصلاحها"
                    : "Basé sur les compétences et réparations validées"}
                </span>
              </div>

              <ProgressBar
                value={metrics?.readinessIndex || 0}
                variant="primary"
                size="md"
                className="max-w-md"
              />

              <p className="text-xs text-theme-muted leading-relaxed max-w-xl">
                {isAr
                  ? "كلما أنجزت مهمة واجتزت اختبار التوأم بنجاح، يرتفع هذا المؤشر تلقائياً بناءً على وزن المادة في معامل شعبتك الرسمي."
                  : "Cet indice progresse au rythme de vos réussites au retest jumeau, pondérées par les coefficients officiels."}
              </p>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/90 border border-[#E4DED2] shadow-sm space-y-1">
                <span className="text-[11px] text-theme-muted block font-medium">{isAr ? "مهارات مثبتة" : "Validées"}</span>
                <span className="text-2xl font-black text-[var(--color-success)] font-mono">
                  {report?.overallMetrics?.demonstratedSkillsCount || 0}
                </span>
                <span className="text-[10px] text-theme-muted block">{isAr ? "تم إثباتها بالدليل" : "Par preuve"}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 border border-[#E4DED2] shadow-sm space-y-1">
                <span className="text-[11px] text-theme-muted block font-medium">{isAr ? "أخطاء أُصلحت" : "Réparées"}</span>
                <span className="text-2xl font-black text-[var(--color-accent)] font-mono">
                  {report?.overallMetrics?.repairedErrorsCount || 0}
                </span>
                <span className="text-[10px] text-theme-muted block">{isAr ? "أغلقت في مختبر الأخطاء" : "Au Lab"}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 border border-[#E4DED2] shadow-sm space-y-1">
                <span className="text-[11px] text-theme-muted block font-medium">{isAr ? "مراجع البكالوريا" : "Annales"}</span>
                <span className="text-2xl font-black text-[var(--color-primary)] font-mono">
                  {PROMPT11_PAST_BAC_REFERENCES.length}
                </span>
                <span className="text-[10px] text-theme-muted block">{isAr ? "تمرين رسمي مرتبط" : "Sujets liés"}</span>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 border border-[#E4DED2] shadow-sm space-y-1">
                <span className="text-[11px] text-theme-muted block font-medium">{isAr ? "الهدف المقرر" : "Objectif"}</span>
                <span className="text-2xl font-black text-theme-text font-mono">
                  {profile.targetScore ? profile.targetScore.toFixed(1) : "16.0"}/20
                </span>
                <span className="text-[10px] text-theme-muted block">{isAr ? "معدل البكالوريا" : "Moyenne"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. TABS: STRATEGY & 30-MIN RULE / TIMETABLE / PAST EXAMS          */}
        {/* ================================================================= */}
        <div className="flex items-center gap-2 border-b border-theme pb-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center gap-2 ${
              activeTab === "simulator"
                ? "bg-emerald-600 text-white shadow-clay font-bold"
                : "text-theme-secondary hover:text-theme-text hover:bg-card-hover"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{isAr ? "محاكي الامتحان الرسمي (جميع مواد الشعبة)" : "Simulateur BAC par matière"}</span>
          </button>
          <button
            onClick={() => setActiveTab("strategy")}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === "strategy"
                ? "bg-[var(--color-primary)] text-white shadow-clay font-bold"
                : "text-theme-secondary hover:text-theme-text hover:bg-card-hover"
            }`}
          >
            {isAr ? "منهجية اختيار وحل مواضيع البكالوريا" : "Méthodologie de Réussite"}
          </button>
          <button
            onClick={() => setActiveTab("readiness")}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === "readiness"
                ? "bg-[var(--color-primary)] text-white shadow-clay"
                : "text-theme-secondary hover:text-theme-text hover:bg-card-hover"
            }`}
          >
            {isAr ? "توقيت ومعاملات الشعبة" : "Gestion du Temps"}
          </button>
          <button
            onClick={() => setActiveTab("archives")}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === "archives"
                ? "bg-[var(--color-primary)] text-white shadow-clay"
                : "text-theme-secondary hover:text-theme-text hover:bg-card-hover"
            }`}
          >
            {isAr ? "أرشيف تمارين البكالوريا السابقة" : "Annales Officielles"}
          </button>
        </div>

        {/* TAB 0: D-DAY EXAM SIMULATOR */}
        {activeTab === "simulator" && (
          <div className="space-y-6 animate-fade-in">
            <DDaySimulator streamId={streamId} />
          </div>
        )}

        {/* TAB 1: BAC METHODOLOGY & TACTICAL CHOICE */}
        {activeTab === "strategy" && (
          <div className="space-y-6 animate-fade-in">
            <Card className="p-6 sm:p-7 space-y-5 border-theme bg-card shadow-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-theme-text font-sans">
                    {isAr ? "المنهجية الذهبية لاختيار ومعالجة مواضيع البكالوريا" : "Méthodologie du Choix Tactique au BAC"}
                  </h3>
                  <p className="text-xs text-theme-secondary mt-0.5">
                    {isAr
                      ? "اقرأ كلا الموضوعين بتمارينهما كاملة، قارن التمارين التي تضمن نقاطها، ثم انطلق في الحل المركز."
                      : "Analysez les deux sujets dans leur intégralité pour identifier vos points forts."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-card-muted border border-theme space-y-2">
                  <span className="h-6 w-6 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center text-xs font-mono font-bold">
                    1
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-theme-text">
                    {isAr ? "قراءة استكشافية متأنية لكلا الموضوعين" : "Lecture intégrale comparative"}
                  </h4>
                  <p className="text-xs text-theme-secondary leading-relaxed">
                    {isAr
                      ? "اقرأ تمارين الموضوع الأول كاملة بسياقاتها وأسئلتها، ثم اقرأ تمارين الموضوع الثاني. حدد التمارين المألوفة لديك."
                      : "Lisez l'ensemble du sujet 1 puis du sujet 2 pour identifier les questions familières."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card-muted border border-theme space-y-2">
                  <span className="h-6 w-6 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center text-xs font-mono font-bold">
                    2
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-theme-text">
                    {isAr ? "حساب النقاط المضمونة" : "Calcul des points assurés"}
                  </h4>
                  <p className="text-xs text-theme-secondary leading-relaxed">
                    {isAr
                      ? "احسب عدد النقاط التي تضمن حلها بنسبة 100% في كل موضوع. اختر الموضوع الذي يمنحك أعلى رصيد مضمون."
                      : "Évaluez les questions dont vous maîtrisez la méthode à 100% pour maximiser votre capital points."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card-muted border border-theme space-y-2">
                  <span className="h-6 w-6 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center text-xs font-mono font-bold">
                    3
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-theme-text">
                    {isAr ? "حسم الاختيار واستغلال كامل الوقت الرسمي" : "Gestion optimale du temps officiel"}
                  </h4>
                  <p className="text-xs text-theme-secondary leading-relaxed">
                    {isAr
                      ? "بعد حسم اختيارك، ركز في ورقتك ومسودتك ولا تفكر في الموضوع الآخر. استغل كل دقيقة من التوقيت الرسمي للمادة."
                      : "Une fois votre choix arrêté, concentrez-vous sur votre copie et exploitez tout le temps officiel alloué."}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: TIMETABLE & SUBJECT TIME MANAGEMENT */}
        {activeTab === "readiness" && (
          <div className="space-y-6 animate-fade-in">
            <Card className="p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-theme pb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[var(--color-primary)]" />
                  <h3 className="text-base font-bold text-theme-text">
                    {isAr ? "توزيع الوقت الرسمي والمعاملات لشعبتك" : "Grille Horaire & Coefficients"}
                  </h3>
                </div>
                <Badge variant="outline" size="sm">
                  {isAr ? "منهاج وزارة التربية الوطنية" : "Programme MEN"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {examTimetable.map((row, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-card-muted border border-theme space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-theme-text">{row.subject_ar}</span>
                      <Badge variant="primary" size="sm">
                        {isAr ? `معامل ${row.coeff}` : `Coeff ${row.coeff}`}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-theme-muted font-mono">
                      <Clock className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                      <span>{row.duration}</span>
                    </div>
                    <p className="text-xs text-theme-secondary leading-relaxed pt-1 border-t border-theme">
                      {row.priority_ar}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* TAB 3: OFFICIAL ONEC PAST BAC ARCHIVES */}
        {activeTab === "archives" && (
          <div className="space-y-6 animate-fade-in">
            <Card className="p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-theme pb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[var(--color-success)]" />
                  <h3 className="text-base font-bold text-theme-text">
                    {isAr ? "تمارين البكالوريا السابقة المرتبطة بالمهارات" : "Annales Officielles ONEC"}
                  </h3>
                </div>
                <span className="text-xs text-theme-muted font-mono">
                  {PROMPT11_PAST_BAC_REFERENCES.length} {isAr ? "مرجع رسمي" : "références"}
                </span>
              </div>

              <div className="space-y-3">
                {PROMPT11_PAST_BAC_REFERENCES.map((ref, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-card-muted border border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" size="sm" className="font-mono text-[10px] border-[var(--color-primary)]/30 text-[var(--color-primary)]">
                          BAC {ref.year}
                        </Badge>
                        <span className="text-xs sm:text-sm font-bold text-theme-text">
                          {isAr ? `تمرين ${ref.exerciseNumber}` : `Exercice ${ref.exerciseNumber}`}
                        </span>
                        <span className="text-xs text-theme-muted">
                          {ref.session === "principal" ? (isAr ? "دورة عادية" : "Normale") : (isAr ? "دورة استثنائية" : "Rattrapage")}
                        </span>
                      </div>
                      <p className="text-xs text-theme-secondary leading-relaxed">
                        {isAr ? (ref.description_ar || ref.title_ar) : (ref.description_fr || ref.title_fr)}
                      </p>
                    </div>

                    <Link href="/dashboard" className="shrink-0">
                      <Button variant="outline" size="sm" className="text-xs">
                        <span>{isAr ? "تدرب على المهارة" : "S'entraîner"}</span>
                        <NextArrow className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </Container>
    </AppShell>
  );
}
