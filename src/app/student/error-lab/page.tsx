"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth/context";
import { useTranslation } from "@/lib/i18n/context";
import {
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Filter,
  Layers,
  Clock,
  ShieldCheck,
  Flame,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Settings,
  HelpCircle,
  Check,
  Eye,
  Lightbulb,
  Compass,
  FileText,
  Target,
} from "lucide-react";
import { ErrorLabSummary, RecallQuestionWithState } from "@/types/recall";
import { ErrorRecord, Skill } from "@/types/mission";
import { RecallRepository } from "@/lib/repositories/recall-repository";
import { ErrorRepository } from "@/lib/repositories/error-repository";
import { RecallTrainerSettingsCard } from "@/components/recall/RecallTrainerSettingsCard";
import { trackEvent } from "@/lib/analytics";
import { getStrategicProfile, getRegistrationDraft } from "@/lib/onboarding/profile";
import { getSkillById } from "@/lib/mission";

interface MinisterialTrap {
  id: string;
  subject: string;
  term: number;
  title: string;
  trap: string;
  explanation: string;
  questionId: string;
}

const COMMON_MINISTERIAL_TRAPS: MinisterialTrap[] = [
  {
    id: "trap-hist-1",
    subject: "تاريخ",
    term: 1,
    title: "مؤتمر يالطا (فيفري 1945) مقابل مؤتمر بوتسدام (جويلية 1945)",
    trap: "الخلط بين القرارات التأسيسية لتقسيم ألمانيا والقرارات التنفيذية بعد استسلام النازية، أو إدراج ترومان في مؤتمر يالطا (حيث كان روزفلت هو الحاضر).",
    explanation: "في مؤتمر يالطا (فيفري 1945) حضر روزفلت وتشرشل وستالين، وتم الاتفاق المبدئي على تأسيس هيئة الأمم المتحدة وتقسيم ألمانيا إلى 4 مناطق نفوذ. أما في بوتسدام (جويلية 1945) فقد حل ترومان محل روزفلت بعد وفاته، وفيه تم إقرار نزع سلاح ألمانيا الفعلي وبدأت ملامح التوتر النووي والصراع المباشر.",
    questionId: "hist_cww_001",
  },
  {
    id: "trap-geo-1",
    subject: "جغرافيا",
    term: 1,
    title: "الميزان التجاري مقابل ميزان المدفوعات",
    trap: "استخدام مصطلح الميزان التجاري عند الحديث عن تدفقات رؤوس الأموال أو عائدات السياحة والخدمات.",
    explanation: "الميزان التجاري يقيس فقط الفارق بين قيمة الصادرات والواردات من 'السلع المادية المنظورة'. أما ميزان المدفوعات فهو السجل الشامل لجميع المعاملات الاقتصادية والمالية والخدمية (بما فيها السياحة والقروض واستثمارات رؤوس الأموال) بين الدولة وباقي دول العالم خلال سنة.",
    questionId: "geo_usa_001",
  },
  {
    id: "trap-isl-1",
    subject: "إسلامية",
    term: 1,
    title: "الترتيب الأصولي لمقاصد الشريعة الإسلامية",
    trap: "تقديم الحاجيات أو التحسينيات على الضروريات، أو الخلط في ترتيب الكليات الخمس عند التعارض.",
    explanation: "مقاصد الشريعة مرتبة تصاعدياً حسب الأولوية: الضروريات أولاً (حفظ الدين، النفس، العقل، النسل، المال)، ثم الحاجيات (رفع الحرج والمشقة كالمعاملات والرخص الشرعية)، ثم التحسينيات (مكارم الأخلاق ومحاسن العادات). إذا تعارض ضروري مع حاجي قُدّم الضروري وجوباً.",
    questionId: "isl_maqasid_001",
  },
  {
    id: "trap-phil-1",
    subject: "فلسفة",
    term: 1,
    title: "المشكلة مقابل الإشكالية: الفارق الدقيق في المقالة المقارنة",
    trap: "اعتبار المشكلة والإشكالية مجرد كلمتين مترادفتين، أو عدم تبيان أن الإشكالية هي التساؤل الكلي الشامل.",
    explanation: "المشكلة (Problème) هي قضية فلسفية أو علمية تثير التباساً عقلياً لكن لها حلاً نهائياً أو اتجاهاً محدداً. أما الإشكالية (Problématique) فهي تساؤل كلي معقد مفتوح على نهايات متعددة متناقضة لا تحسم بحل نهائي بات، وتنطوي تحت مظلتها عدة مشكلات جزئية.",
    questionId: "phil_sci_001",
  },
  {
    id: "trap-math-1",
    subject: "رياضيات",
    term: 1,
    title: "مجموعة التعريف وإشارة الدالة اللوغاريتمية والأسية",
    trap: "حل المعادلة ln(A) = ln(B) مباشرة بالتحويل A = B دون كتابة شرط A > 0 و B > 0 كخطوة أولى، مما يوقع الطالب في قبول حلول مرفوضة تخرج عن مجال التعريف.",
    explanation: "في مواضيع البكالوريا، أول خطوة إلزامية في سلم التنقيط هي تعيين مجموعة التعريف Df. الحلول تكون مقبولة فقط إذا انتمت لـ Df. كما يجب الحذر من أن ln(x) تنعدم عند 1 وتكون سالبة تماماً في المجال المفتوح ]0, 1[.",
    questionId: "math_ana_001",
  },
  {
    id: "trap-phys-1",
    subject: "فيزياء",
    term: 1,
    title: "سرعة التفاعل مقابل السرعة الحجمية للتفاعل",
    trap: "نسيان القسمة على الحجم الكلي للمزيج التفاعلي Vt في السرعة الحجمية، أو الخلط بين سرعة التفاعل وسرعة اختفاء/تشكل نوع كيميائي (إغفال المعامل الستوكيومتري).",
    explanation: "سرعة التفاعل: v = dx/dt (الوحدة: mol/s). السرعة الحجمية للتفاعل: v_vol = (1/Vt) * (dx/dt) (الوحدة: mol/(L.s)). كما أن سرعة اختفاء النوع A ذي المعامل الستوكيومتري a تساوي a مضروبة في سرعة التفاعل. انتبه دائماً للحجم الكلي إذا تم مزج محلولين.",
    questionId: "phys_nucl_001",
  },
];

export default function StudentErrorLabPage() {
  const { user } = useAuth();
  const { locale, direction } = useTranslation();
  const isAr = locale === "ar";
  const isRtl = direction === "rtl";
  const NextArrow = isRtl ? ArrowLeft : ArrowRight;

  const [activeTab, setActiveTab] = useState<"recall_gaps" | "mission_errors" | "settings">("recall_gaps");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [items, setItems] = useState<RecallQuestionWithState[]>([]);
  const [missionErrors, setMissionErrors] = useState<ErrorRecord[]>([]);
  const [summary, setSummary] = useState<ErrorLabSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedTrapId, setExpandedTrapId] = useState<string | null>("trap-hist-1");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const userId = user?.id || "anonymous-student";
        const p = user?.id ? getStrategicProfile(user.id) : null;
        const reg = user?.id ? getRegistrationDraft(user.id) : null;
        const studentTerm = (p as any)?.current_term || (p as any)?.currentTerm || 1;
        const studentStream = p?.streamId || (reg as any)?.streamId || "sciences_exp";

        // Fetch active recall flash question gaps
        const recallResult = await RecallRepository.getErrorLabData(userId, {
          studentTerm,
          studentStream,
        });
        setItems(recallResult.items);
        setSummary(recallResult.summary);

        // Fetch mission and curriculum errors
        const errorMap = await ErrorRepository.getErrors(user?.id);
        const missionList = Object.values(errorMap);
        setMissionErrors(missionList);

        trackEvent("error_lab_viewed", {
          totalRecallErrors: recallResult.summary.totalErrors,
          inErrorLabCount: recallResult.summary.inErrorLabCount,
          totalMissionErrors: missionList.length,
        });
      } catch (err) {
        console.error("Failed to load error lab data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const filteredRecallItems = items.filter((item) => {
    if (selectedSubject !== "all" && item.subject !== selectedSubject) {
      return false;
    }
    return true;
  });

  const subjectsList = ["all", "تاريخ", "جغرافيا", "إسلامية", "فلسفة", "رياضيات", "فيزياء"];

  const openMissionErrorsCount = missionErrors.filter(
    (e) => e.repairStatus === "identified" || e.repairStatus === "repair_started"
  ).length;

  const recurringMissionErrorsCount = missionErrors.filter((e) => e.isRecurring).length;

  const remediatedMissionErrorsCount = missionErrors.filter(
    (e) => e.repairStatus === "retest_passed" || e.repairStatus === "repair_completed"
  ).length;

  const totalGapsCount = items.length + openMissionErrorsCount;
  const totalRemediatedCount = (summary?.remediatedCount || 0) + remediatedMissionErrorsCount;

  const getStatusBadge = (status: ErrorRecord["repairStatus"]) => {
    switch (status) {
      case "identified":
        return <Badge variant="warning" size="sm">تم رصد الخطأ</Badge>;
      case "repair_started":
        return <Badge variant="warning" size="sm">قيد الترميم</Badge>;
      case "repair_completed":
        return (
          <Badge
            variant="outline"
            size="sm"
            className="border-[var(--color-primary)]/40 bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-bold"
          >
            اكتمل الترميم
          </Badge>
        );
      case "retest_passed":
        return <Badge variant="success" size="sm">تم اجتياز الاختبار ✓</Badge>;
      case "retest_failed":
        return <Badge variant="danger" size="sm">يحتاج مراجعة ثانية</Badge>;
      default:
        return <Badge variant="outline" size="sm">{status}</Badge>;
    }
  };

  const getErrorTypeLabel = (type: string) => {
    switch (type) {
      case "forgot_information":
        return "نسيت المعلومة / القانون";
      case "misunderstood_concept":
        return "سوء فهم للمفهوم الأساسي";
      case "misread_question":
        return "تسرع في قراءة المعطيات";
      case "calculation_error":
        return "خطأ حسابي أو تقني";
      case "methodology_error":
        return "خلل في المنهجية أو خطوات الحل";
      default:
        return type || "خطأ غير محدد";
    }
  };

  return (
    <AppShell activeNav="missions">
      <Container className="py-6 sm:py-8 max-w-6xl">
        {/* Top Hero Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-surface/80 backdrop-blur-md p-6 sm:p-7 rounded-3xl border border-theme shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center border border-amber-500/30 shadow-inner shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-theme-text font-sans">
                  معمل الأخطاء والترميم الفوري
                </h1>
                <Badge variant="warning" size="sm" className="font-mono">
                  Error Lab 2.0
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-theme-muted mt-1.5 max-w-2xl leading-relaxed">
                الخطأ ليس فشلاً بل هو أثمن معلومة تشخيصية في رحلتك نحو البكالوريا. حوّل كل عثرة إلى نقطة قوة مضمونة عبر العلاج المستهدف والتكرار الذكي.
              </p>
            </div>
          </div>

          {/* Quick remediation CTA button */}
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
            <Link href="/student/arena/quick-recall" className="w-full md:w-auto">
              <Button variant="primary" size="lg" className="w-full gap-2 shadow-lg shadow-[var(--color-primary)]/20 font-bold">
                <Zap className="w-4 h-4 fill-current" />
                <span>تصفية الثغرات الآن ⚡</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Global KPI Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <Card className="p-4 sm:p-5 border border-theme bg-surface/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-theme-muted">نسبة الترميم الإجمالية</span>
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-theme-text font-mono">
              {summary ? `${summary.remediationRatePercent}%` : "100%"}
            </div>
            <div className="w-full h-2 bg-theme-border/40 rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${summary ? summary.remediationRatePercent : 100}%` }}
              />
            </div>
          </Card>

          <Card className="p-4 sm:p-5 border border-theme bg-surface/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-theme-muted">ثغرات الاسترجاع (Leitner)</span>
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-500 font-mono">
              {items.length}
            </div>
            <div className="text-[11px] text-theme-muted mt-1.5">
              تتطلب جولتين ناجحتين للتخرج
            </div>
          </Card>

          <Card className="p-4 sm:p-5 border border-theme bg-surface/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-theme-muted">أخطاء التمارين المنهجية</span>
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-500 font-mono">
              {openMissionErrorsCount}
            </div>
            <div className="text-[11px] text-theme-muted mt-1.5">
              من مهام المنهاج اليومية
            </div>
          </Card>

          <Card className="p-4 sm:p-5 border border-theme bg-surface/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-theme-muted">ثغرات تم حسمها وترميمها</span>
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
              {totalRemediatedCount}
            </div>
            <div className="text-[11px] text-theme-muted mt-1.5">
              تحولت إلى نقاط قوة مثبتة
            </div>
          </Card>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-6 border-b border-theme pb-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("recall_gaps")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "recall_gaps"
                ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30 shadow-sm"
                : "text-theme-muted hover:text-theme-text hover:bg-surface-elevated"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>ثغرات الاسترجاع النشط والتكرار ({items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("mission_errors")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "mission_errors"
                ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30 shadow-sm"
                : "text-theme-muted hover:text-theme-text hover:bg-surface-elevated"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>أخطاء المهام والتمارين ({missionErrors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "settings"
                ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30 shadow-sm"
                : "text-theme-muted hover:text-theme-text hover:bg-surface-elevated"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>إعدادات التكرار والإشعارات</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: RECALL LEITNER GAPS                                                */}
        {/* ========================================================================= */}
        {activeTab === "recall_gaps" && (
          <div className="space-y-6">
            {/* Subject Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              <span className="text-xs font-semibold text-theme-muted shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>تصفية المادة:</span>
              </span>
              {subjectsList.map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all shrink-0 ${
                    selectedSubject === subj
                      ? "bg-[var(--color-primary)] text-[var(--color-primary-text)] border-[var(--color-primary)] shadow-sm"
                      : "bg-surface border-theme-border text-theme-muted hover:text-theme-text"
                  }`}
                >
                  {subj === "all" ? "جميع المواد" : subj}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6 border border-theme bg-surface/40 animate-pulse">
                    <div className="h-5 w-40 bg-theme-border/40 rounded mb-3" />
                    <div className="h-4 w-full bg-theme-border/20 rounded mb-2" />
                    <div className="h-4 w-3/4 bg-theme-border/20 rounded" />
                  </Card>
                ))}
              </div>
            ) : filteredRecallItems.length > 0 ? (
              <div className="space-y-4">
                {filteredRecallItems.map((item) => (
                  <Card
                    key={item.id}
                    className="p-5 sm:p-6 border border-theme hover:border-amber-500/40 bg-surface/80 backdrop-blur-sm transition-all duration-200 rounded-2xl shadow-sm hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="primary" size="sm">
                          {item.subject}
                        </Badge>
                        <Badge variant="outline" size="sm">
                          {item.question_type}
                        </Badge>
                        <Badge variant="outline" size="sm" className="text-theme-muted text-[11px]">
                          الفصل {item.term}
                        </Badge>
                        <span className="text-xs text-rose-500 font-medium">
                          تعثرت {item.error_count} {item.error_count === 1 ? "مرة" : "مرات"}
                        </span>
                      </div>

                      {/* Remediation streak progress (0/2 or 1/2) */}
                      <div className="flex items-center gap-2 bg-surface-elevated px-3 py-1 rounded-xl border border-theme-border/60 text-xs">
                        <span className="text-theme-muted">الترميم:</span>
                        <div className="flex items-center gap-1 font-mono font-bold">
                          <span
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                              (item.consecutive_correct || 0) >= 1
                                ? "bg-emerald-500 text-white"
                                : "bg-zinc-300 dark:bg-zinc-700"
                            }`}
                          >
                            1
                          </span>
                          <span
                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                              (item.consecutive_correct || 0) >= 2
                                ? "bg-emerald-500 text-white"
                                : "bg-zinc-300 dark:bg-zinc-700"
                            }`}
                          >
                            2
                          </span>
                        </div>
                        <span className="text-[11px] text-theme-muted">
                          {(item.consecutive_correct || 0) === 1 ? "باقي جولة واحدة" : "باقي جولتان"}
                        </span>
                      </div>
                    </div>

                    {/* Question text */}
                    <h3 className="font-bold text-base text-theme-text mb-2 leading-relaxed">
                      {item.question_text}
                    </h3>

                    {/* Correct explanation */}
                    <p className="text-xs sm:text-sm text-theme-muted bg-surface-elevated/50 p-3.5 rounded-xl border border-theme-border/50 mb-4 leading-relaxed">
                      💡 <strong className="text-theme-text">التفسير الصحيح:</strong> {item.explanation}
                    </p>

                    {/* Action footer */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-theme-border/50">
                      <a
                        href={item.target_lesson_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:underline font-semibold"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>راجع ثغرة هذا الدرس في المنهاج 📖</span>
                      </a>

                      <Link href={`/student/arena/quick-recall?questionId=${item.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                          <span>إعادة اختبار هذا السؤال 🎯</span>
                          <NextArrow className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              /* Rich Empty State: Celebratory banner + Common Ministerial BAC Traps Explorer */
              <div className="space-y-8">
                <Card className="p-6 sm:p-8 text-center border border-theme bg-gradient-to-b from-emerald-500/10 via-surface/60 to-surface/80 rounded-3xl shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center mb-3.5 shadow-inner">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-theme-text mb-1.5">
                    صندوق ثغرات الاسترجاع نظيف ومثالي! 🎯
                  </h3>
                  <p className="text-xs sm:text-sm text-theme-muted max-w-lg mx-auto mb-5 leading-relaxed">
                    لا توجد أي أسئلة عالقة في صندوق الأخطاء حالياً. إما أنك لم ترتكب أخطاء بعد، أو أنك قمت بترميمها بنجاح عبر نظام التكرار المتباعد.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link href="/student/arena/quick-recall">
                      <Button variant="primary" size="md" className="gap-2 font-bold shadow-md">
                        <Zap className="w-4 h-4 fill-current" />
                        <span>بدء جولة استرجاع سريعة لاختبار الذاكرة</span>
                      </Button>
                    </Link>
                  </div>
                </Card>

                {/* Common Ministerial Traps Explorer */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-amber-500" />
                        <h2 className="text-lg sm:text-xl font-black text-theme-text font-sans">
                          بنك الفخاخ الوزارية الشائعة في البكالوريا
                        </h2>
                      </div>
                      <p className="text-xs text-theme-muted mt-1">
                        أخطاء نمطية يقع فيها آلاف المترشحين كل عام. اطلع عليها مسبقاً لحماية نقاطك في ورقة الامتحان:
                      </p>
                    </div>
                    <Badge variant="outline" size="sm" className="hidden sm:inline-flex font-mono text-xs">
                      {COMMON_MINISTERIAL_TRAPS.length} فخاخ نموذجية
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {COMMON_MINISTERIAL_TRAPS.map((trap) => {
                      const isExpanded = expandedTrapId === trap.id;
                      return (
                        <Card
                          key={trap.id}
                          className="p-5 border border-theme bg-surface/70 hover:border-amber-500/40 transition-all rounded-2xl flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between gap-2">
                              <Badge variant="primary" size="sm">
                                {trap.subject}
                              </Badge>
                              <Badge variant="outline" size="sm" className="text-[11px] text-theme-muted">
                                الفصل {trap.term}
                              </Badge>
                            </div>

                            <h3 className="font-bold text-sm sm:text-base text-theme-text leading-snug">
                              {trap.title}
                            </h3>

                            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                              <strong>⚠️ الفخ الشائع:</strong> {trap.trap}
                            </div>

                            {isExpanded && (
                              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed animate-fade-in">
                                <strong>💡 التفسير الوزاري المعتمد:</strong> {trap.explanation}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-theme-border/40">
                            <button
                              type="button"
                              onClick={() => setExpandedTrapId(isExpanded ? null : trap.id)}
                              className="inline-flex items-center gap-1 text-xs text-theme-muted hover:text-theme-text font-semibold"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                  <span>إخفاء التفسير</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5 text-amber-500" />
                                  <span className="text-amber-500">كشف سر الفخ والتصحيح</span>
                                </>
                              )}
                            </button>

                            <Link href={`/student/arena/quick-recall?subject=${encodeURIComponent(trap.subject)}`}>
                              <Button variant="ghost" size="sm" className="text-xs gap-1 font-bold text-[var(--color-primary)]">
                                <span>تدرب على هذا</span>
                                <NextArrow className="w-3.5 h-3.5" />
                              </Button>
                            </Link>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CURRICULUM & MISSION ERRORS                                        */}
        {/* ========================================================================= */}
        {activeTab === "mission_errors" && (
          <div className="space-y-6">
            {recurringMissionErrorsCount > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Flame className="w-5 h-5 fill-current" />
                </div>
                <div className="space-y-1 text-xs">
                  <strong className="text-sm font-bold text-theme-text block">
                    تنبيه: أخطاء متكررة في المهارات المنهجية
                  </strong>
                  <p className="text-theme-secondary leading-relaxed">
                    تم رصد نفس نوع الخطأ أكثر من مرة في بعض المهارات. المعالجة المنهجية للسبب الجذري أجدى من مضاعفة حل التمارين دون فهم.
                  </p>
                </div>
              </div>
            )}

            {missionErrors.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-semibold text-theme-muted px-1">
                  <span>سجل أخطاء التمارين ({missionErrors.length})</span>
                  <span>حالة المعالجة</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {missionErrors.map((err) => {
                    const skill = getSkillById(err.skillId);
                    return (
                      <Card
                        key={err.id}
                        className={`p-5 space-y-3.5 border-theme bg-surface/80 rounded-2xl transition-all shadow-sm ${
                          err.isRecurring
                            ? "border-amber-500/60 ring-1 ring-amber-500/30"
                            : "hover:border-[var(--color-primary)]/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 border-b border-theme pb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="primary" size="sm">
                              {err.subjectId}
                            </Badge>
                            <span className="text-xs font-bold text-theme-text">
                              {skill ? (isAr ? skill.title_ar : skill.title_fr) : err.skillId}
                            </span>
                            {err.isRecurring && (
                              <Badge variant="warning" size="sm" className="font-bold text-[10px]">
                                🔥 متكرر
                              </Badge>
                            )}
                          </div>
                          <div>{getStatusBadge(err.repairStatus)}</div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="p-3 rounded-xl bg-surface-soft border border-theme/60 space-y-1">
                            <span className="text-[11px] font-bold text-theme-muted block">
                              نوع الخلل:
                            </span>
                            <span className="font-semibold text-theme-text">
                              {getErrorTypeLabel(err.suspectedErrorType)}
                            </span>
                          </div>

                          <div className="p-3 rounded-xl bg-surface-soft border border-theme/60 space-y-1">
                            <span className="text-[11px] font-bold text-theme-muted block">
                              تاريخ الرصد:
                            </span>
                            <span className="font-mono text-theme-text text-xs">
                              {new Date(err.createdAt).toLocaleDateString("ar-DZ")}
                            </span>
                          </div>
                        </div>

                        {/* Action CTA */}
                        <div className="pt-2 flex items-center justify-end">
                          <Link href={`/mission/${err.missionId || "mission_" + err.skillId}`}>
                            <Button size="sm" variant="outline" className="text-xs gap-1.5 font-bold">
                              <span>
                                {err.repairStatus === "retest_passed"
                                  ? "مراجعة المهمة"
                                  : "متابعة الترميم وإعادة الاختبار"}
                              </span>
                              <NextArrow className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Rich Empty State for Mission Errors: Protocol Guide */
              <div className="space-y-6">
                <Card className="p-6 sm:p-8 text-center border border-theme bg-surface/70 rounded-3xl shadow-sm">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/15 text-blue-500 mx-auto flex items-center justify-center mb-3.5 shadow-inner">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-theme-text mb-1.5">
                    لا توجد أخطاء منهجية غير معالجة! 🌟
                  </h3>
                  <p className="text-xs sm:text-sm text-theme-muted max-w-lg mx-auto mb-5 leading-relaxed">
                    عندما تحل تمارين المهام اليومية في الخريطة، سيتم رصد وتصنيف أي عثرة تقع فيها هنا تلقائياً لترميمها وضمان عدم تكرارها في البكالوريا.
                  </p>
                  <Link href="/roadmap">
                    <Button variant="primary" size="md" className="gap-2 font-bold shadow-md">
                      <Compass className="w-4 h-4" />
                      <span>الانتقال إلى خريطة المهام لبدء التدريب</span>
                    </Button>
                  </Link>
                </Card>

                {/* 4-Step Error Repair Protocol Guide */}
                <div className="p-6 rounded-3xl border border-theme bg-surface/60 space-y-4">
                  <h3 className="font-black text-base sm:text-lg text-theme-text flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
                    <span>بروتوكول تفكيك الأخطاء في منصة شاطر (4 خطوات ذهبية)</span>
                  </h3>
                  <p className="text-xs text-theme-muted leading-relaxed">
                    كيف يحمي نظام معمل الأخطاء مسارك نحو معدل التفوق في البكالوريا:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                    <div className="p-4 rounded-2xl bg-surface border border-theme/60 space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 font-bold flex items-center justify-center text-xs font-mono">
                        01
                      </div>
                      <strong className="text-xs font-bold text-theme-text block">
                        رصد الفخ اللحظي
                      </strong>
                      <p className="text-[11px] text-theme-muted leading-relaxed">
                        التعرف الفوري على السؤال الذي تعثرت فيه دون تأجيل لتفادي ترسيخ الفهم الخاطئ.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface border border-theme/60 space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 font-bold flex items-center justify-center text-xs font-mono">
                        02
                      </div>
                      <strong className="text-xs font-bold text-theme-text block">
                        التشخيص الذاتي الدقيق
                      </strong>
                      <p className="text-[11px] text-theme-muted leading-relaxed">
                        تحديد هل الخطأ بسبب نسيان قانون، سوء فهم مفاهيمي، تسرع، أو خلل في خطوات المنهجية.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface border border-theme/60 space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-500 font-bold flex items-center justify-center text-xs font-mono">
                        03
                      </div>
                      <strong className="text-xs font-bold text-theme-text block">
                        خطة ترميم مركزة (5-10 د)
                      </strong>
                      <p className="text-[11px] text-theme-muted leading-relaxed">
                        مراجعة مكثفة للقاعدة المستهدفة واستخراج سر الفخ قبل الانتقال لتمرين جديد.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-surface border border-theme/60 space-y-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 font-bold flex items-center justify-center text-xs font-mono">
                        04
                      </div>
                      <strong className="text-xs font-bold text-theme-text block">
                        الاختبار التوأم (Twin Retest)
                      </strong>
                      <p className="text-[11px] text-theme-muted leading-relaxed">
                        حل سؤال مشابه بنفس البنية للتأكد القطعي من أن الخطأ قد تم علاجه نهائياً.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SETTINGS                                                           */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <div className="max-w-3xl">
            <RecallTrainerSettingsCard userId={user?.id || "anonymous-student"} />
          </div>
        )}
      </Container>
    </AppShell>
  );
}
