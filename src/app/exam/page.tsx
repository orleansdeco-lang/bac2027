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
} from "lucide-react";

export default function ExamModePage() {
  const { t, locale } = useTranslation();
  const isAr = locale === "ar";
  const gate = useLearningAccessGate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ExamReadinessMetrics | null>(null);
  const [report, setReport] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"strategy" | "readiness" | "archives">("strategy");

  const NextArrow = isAr ? ArrowLeft : ArrowRight;
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  useEffect(() => {
    async function loadExamData() {
      if (!gate.isAuthorized || !gate.profile) return;
      try {
        const prog = await ProgressService.getProgressReport(gate.profile.id);
        setReport(prog);

        const demonstrated = prog?.demonstratedSkills?.length || 0;
        const streamSkills = ContentService.getSkillsForStream(gate.profile.streamId as StreamId);
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

  const profile = gate.profile;
  const streamId = (profile.streamId || "sciences_exp") as StreamId;
  const authorizedSubjects = getStudentSubjects(streamId, profile.techniqueMathSpecialty);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "distinction_level":
        return {
          label: isAr ? "مستوى امتياز وتفوق (16-20)" : "Niveau Distinction (16-20)",
          color: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
        };
      case "exam_ready":
        return {
          label: isAr ? "جاهز للامتحان الرسمي" : "Prêt pour le BAC",
          color: "bg-blue-500/15 border-blue-500/40 text-blue-400",
        };
      case "emerging_readiness":
        return {
          label: isAr ? "جاهزية قيد التكوين" : "Préparation en cours",
          color: "bg-amber-500/15 border-amber-500/40 text-amber-400",
        };
      default:
        return {
          label: isAr ? "في بداية مسار التحضير" : "Début de préparation",
          color: "bg-slate-500/15 border-slate-500/40 text-slate-300",
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
        <section className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-[#0c1424] via-[#0f1b33] to-[#0a1120] p-6 sm:p-8 shadow-xl text-white relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span>{isAr ? "مؤشر الجاهزية الأكاديمي المثبت" : "Indice de Préparation Validé"}</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white">
                  {metrics?.readinessIndex || 0}%
                </span>
                <span className="text-xs sm:text-sm text-slate-300 font-sans">
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

              <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                {isAr
                  ? "كلما أنجزت مهمة واجتزت اختبار التوأم بنجاح، يرتفع هذا المؤشر تلقائياً بناءً على وزن المادة في معامل شعبتك الرسمي."
                  : "Cet indice progresse au rythme de vos réussites au retest jumeau, pondérées par les coefficients officiels."}
              </p>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">{isAr ? "مهارات مثبتة" : "Validées"}</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">
                  {report?.overallMetrics?.demonstratedSkillsCount || 0}
                </span>
                <span className="text-[10px] text-slate-400 block">{isAr ? "تم إثباتها بالدليل" : "Par preuve"}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">{isAr ? "أخطاء أُصلحت" : "Réparées"}</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {report?.overallMetrics?.repairedErrorsCount || 0}
                </span>
                <span className="text-[10px] text-slate-400 block">{isAr ? "أغلقت في مختبر الأخطاء" : "Au Lab"}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">{isAr ? "مراجع البكالوريا" : "Annales"}</span>
                <span className="text-2xl font-black text-blue-400 font-mono">
                  {PROMPT11_PAST_BAC_REFERENCES.length}
                </span>
                <span className="text-[10px] text-slate-400 block">{isAr ? "تمرين رسمي مرتبط" : "Sujets liés"}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 block">{isAr ? "الهدف المقرر" : "Objectif"}</span>
                <span className="text-2xl font-black text-cyan-300 font-mono">
                  {profile.targetScore ? profile.targetScore.toFixed(1) : "16.0"}/20
                </span>
                <span className="text-[10px] text-slate-400 block">{isAr ? "معدل البكالوريا" : "Moyenne"}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* 2. TABS: STRATEGY & 30-MIN RULE / TIMETABLE / PAST EXAMS          */}
        {/* ================================================================= */}
        <div className="flex items-center gap-2 border-b border-theme pb-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab("strategy")}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === "strategy"
                ? "bg-[var(--color-primary)] text-white shadow-md shadow-blue-500/20"
                : "text-theme-secondary hover:text-theme-text hover:bg-card-hover"
            }`}
          >
            {isAr ? "استراتيجية 30 دقيقة لاختيار الموضوع" : "Règle des 30 minutes"}
          </button>
          <button
            onClick={() => setActiveTab("readiness")}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === "readiness"
                ? "bg-[var(--color-primary)] text-white shadow-md shadow-blue-500/20"
                : "text-theme-secondary hover:text-theme-text hover:bg-card-hover"
            }`}
          >
            {isAr ? "توقيت ومعاملات الشعبة" : "Gestion du Temps"}
          </button>
          <button
            onClick={() => setActiveTab("archives")}
            className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
              activeTab === "archives"
                ? "bg-[var(--color-primary)] text-white shadow-md shadow-blue-500/20"
                : "text-theme-secondary hover:text-theme-text hover:bg-card-hover"
            }`}
          >
            {isAr ? "أرشيف تمارين البكالوريا السابقة" : "Annales Officielles"}
          </button>
        </div>

        {/* TAB 1: 30-MINUTE GOLDEN RULE */}
        {activeTab === "strategy" && (
          <div className="space-y-6 animate-fade-in">
            <Card className="p-6 sm:p-7 space-y-5 border-amber-500/30 bg-card">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-theme-text">
                    {isAr ? "قاعدة 30 دقيقة الذهبية: كيف تختار بين الموضوع الأول والثاني؟" : "La Règle des 30 minutes"}
                  </h3>
                  <p className="text-xs text-theme-secondary mt-0.5">
                    {isAr
                      ? "أكبر خطأ يقع فيه المترشح هو التسرع في البدء بالحل قبل قراءة كلا الموضوعين بدقة."
                      : "Ne commencez jamais à rédiger avant d'avoir analysé les deux sujets complets."}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-card-muted border border-theme space-y-2">
                  <span className="h-6 w-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-mono font-bold">
                    1
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-theme-text">
                    {isAr ? "قراءة استكشافية متكاملة (15 د)" : "Lecture intégrale (15 min)"}
                  </h4>
                  <p className="text-xs text-theme-secondary leading-relaxed">
                    {isAr
                      ? "اقرأ الموضوع الأول كاملاً دون قلم، ثم اقرأ الموضوع الثاني كاملاً. لاحظ المسألة المركبة وتمرين الفيزياء التجريبي."
                      : "Lisez l'ensemble du sujet 1 puis du sujet 2 sans rédiger pour identifier les blocages potentiels."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card-muted border border-theme space-y-2">
                  <span className="h-6 w-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-mono font-bold">
                    2
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-theme-text">
                    {isAr ? "تقييم النقاط المضمونة (10 د)" : "Calcul des points sûrs (10 min)"}
                  </h4>
                  <p className="text-xs text-theme-secondary leading-relaxed">
                    {isAr
                      ? "احسب عدد النقاط التي تضمن حلها بنسبة 100% في كل موضوع. اختر الموضوع الذي يمنحك أعلى رصيد مضمون."
                      : "Évaluez les questions dont vous maîtrisez la méthode à 100% pour maximiser votre score de départ."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-card-muted border border-theme space-y-2">
                  <span className="h-6 w-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-mono font-bold">
                    3
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-theme-text">
                    {isAr ? "قرار نهائي لا رجعة فيه (5 د)" : "Décision ferme et définitive (5 min)"}
                  </h4>
                  <p className="text-xs text-theme-secondary leading-relaxed">
                    {isAr
                      ? "بعد حسم اختيارك، ضع الموضوع الآخر جانباً ولا تفكر فيه مجدداً لتجنب التشتت وضياع الوقت."
                      : "Une fois votre choix arrêté, rangez l'autre sujet. Ne changez jamais d'avis en cours d'épreuve."}
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
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
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
                        <Badge variant="outline" size="sm" className="font-mono text-[10px] border-blue-500/30 text-blue-400">
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
