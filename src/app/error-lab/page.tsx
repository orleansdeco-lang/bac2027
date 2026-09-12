"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AppShell } from "@/components/ui/AppShell";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  BookOpen,
  Layers,
  Clock,
  ExternalLink,
  ShieldCheck,
  Flame,
  Wrench,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { ErrorRepository } from "@/lib/repositories/error-repository";
import { ErrorRecord, Skill } from "@/types/mission";
import {
  getAllErrorsList,
  getRecurringErrors,
  getOpenErrors,
  getRemediatedErrors,
  getSkillById,
} from "@/lib/mission";

export default function ErrorLabPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { t, locale, direction } = useTranslation();
  const isRtl = direction === "rtl";
  const NextArrow = isRtl ? ArrowLeft : ArrowRight;
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  const [errors, setErrors] = useState<ErrorRecord[]>([]);
  const [openCount, setOpenCount] = useState(0);
  const [recurringCount, setRecurringCount] = useState(0);
  const [remediatedCount, setRemediatedCount] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    async function loadErrors() {
      try {
        const errorMap = await ErrorRepository.getErrors(user?.id);
        const list = Object.values(errorMap);
        setErrors(list);
        setOpenCount(
          list.filter((e) => e.repairStatus === "identified" || e.repairStatus === "repair_started").length
        );
        setRecurringCount(list.filter((e) => e.isRecurring).length);
        setRemediatedCount(
          list.filter((e) => e.repairStatus === "retest_passed" || e.repairStatus === "repair_completed").length
        );
      } catch (err) {
        console.error("Error loading error lab:", err);
      } finally {
        setHasLoaded(true);
      }
    }

    if (!authLoading) {
      loadErrors();
    }
  }, [user, authLoading]);

  if (!hasLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1020]">
        <div className="animate-pulse text-sm text-blue-400 font-mono tracking-wider">
          BAC MASTERY...
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: ErrorRecord["repairStatus"]) => {
    switch (status) {
      case "identified":
        return <Badge variant="warning" size="sm">{t.errorLab.statusBadges.identified}</Badge>;
      case "repair_started":
        return <Badge variant="warning" size="sm">{t.errorLab.statusBadges.repair_started}</Badge>;
      case "repair_completed":
        return (
          <Badge variant="outline" size="sm" className="border-cyan-500/40 bg-cyan-950/40 text-cyan-300 font-bold">
            {t.errorLab.statusBadges.repair_completed}
          </Badge>
        );
      case "retest_passed":
        return <Badge variant="success" size="sm">{t.errorLab.statusBadges.retest_passed}</Badge>;
      case "retest_failed":
        return <Badge variant="danger" size="sm">{t.errorLab.statusBadges.retest_failed}</Badge>;
      default:
        return <Badge variant="outline" size="sm">{status}</Badge>;
    }
  };

  const getSubjectName = (skill: Skill | undefined) => {
    if (!skill) return "";
    switch (skill.subjectId) {
      case "math":
        return locale === "ar" ? "رياضيات" : "Mathématiques";
      case "physics":
        return locale === "ar" ? "علوم فيزيائية" : "Physique-Chimie";
      case "natural_sciences":
        return locale === "ar" ? "علوم الطبيعة والحياة" : "Sciences Naturelles";
      default:
        return skill.subjectId;
    }
  };

  return (
    <AppShell activeNav="missions">
      <div className="py-6 sm:py-10">
        <Container size="md" className="space-y-6">
          {/* Header Banner */}
          <div className="space-y-2 text-center sm:text-start">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-300">
              <Sparkles className="h-3.5 w-3.5 text-rose-400" />
              <span>{t.errorLab.badge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t.errorLab.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              {locale === "ar"
                ? "الغلط ماشي فشل. الغلط معلومة. كل خطأ مرصود هنا هو فرصة مباشرة لتثبيت نقطة في البكالوريا."
                : t.errorLab.subtitle}
            </p>
          </div>

          {/* Summary Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="p-4 border-rose-900/40 bg-[#241217] text-center space-y-1 shadow-md">
              <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">{openCount}</span>
              <span className="text-[11px] sm:text-xs font-semibold text-rose-200 block">
                {t.errorLab.stats.open}
              </span>
            </Card>

            <Card className="p-4 border-amber-900/40 bg-[#281c11] text-center space-y-1 shadow-md">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{recurringCount}</span>
              <span className="text-[11px] sm:text-xs font-semibold text-amber-200 block">
                {t.errorLab.stats.recurring}
              </span>
            </Card>

            <Card className="p-4 border-emerald-900/40 bg-[#0d271f] text-center space-y-1 shadow-md">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{remediatedCount}</span>
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-200 block">
                {t.errorLab.stats.remediated}
              </span>
            </Card>
          </div>

          {/* Recurring Error Alert Banner */}
          {recurringCount > 0 && (
            <div className="p-4 rounded-2xl bg-[#281c11] border border-amber-500/40 shadow-lg flex items-start gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                <Flame className="h-5 w-5 fill-current" />
              </div>
              <div className="space-y-1 text-xs">
                <strong className="text-sm font-bold text-white block">
                  {t.errorLab.recurringBannerTitle}
                </strong>
                <p className="text-amber-200/90 leading-relaxed">
                  {t.errorLab.recurringBannerDesc}
                </p>
              </div>
            </div>
          )}

          {/* Errors List */}
          {errors.length === 0 ? (
            <Card className="p-10 sm:p-12 text-center space-y-4 border-slate-800 bg-[#111827] shadow-xl">
              <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {t.errorLab.emptyErrorsNotice}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {locale === "ar"
                    ? "عندما تحل تمارين المهام اليومية، سيتم رصد وتصنيف أي خطأ ترتكبه هنا لتحويله إلى تمكن دائم."
                    : "Lors de vos entraînements, toute erreur sera enregistrée et analysée ici pour la réparer avec méthode."}
                </p>
              </div>
              <div className="pt-2">
                <Link href="/roadmap">
                  <Button size="md">
                    <span>{t.errorLab.returnToRoadmap}</span>
                    <NextArrow className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 px-1">
                <span>{t.errorLab.historyTitle} ({errors.length})</span>
                <span>{t.roadmap.repairStatusLabel}</span>
              </div>

              <div className="grid grid-cols-1 gap-3.5">
                {errors.map((err) => {
                  const skill = getSkillById(err.skillId);
                  const errorLabel =
                    t.errorLab.errorTypes[err.suspectedErrorType] || err.suspectedErrorType;

                  return (
                    <Card
                      key={err.id}
                      className={`p-4 sm:p-5 transition-all space-y-3.5 ${
                        err.isRecurring
                          ? "border-amber-500/40 bg-[#281c11]/40 shadow-lg shadow-amber-950/20"
                          : "border-slate-800 bg-[#111827] hover:border-slate-700"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="primary" size="sm">
                            {getSubjectName(skill)}
                          </Badge>
                          <span className="text-xs font-bold text-white">
                            {skill ? (locale === "ar" ? skill.title_ar : skill.title_fr) : err.skillId}
                          </span>
                          {err.isRecurring && (
                            <Badge variant="warning" size="sm" className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold">
                              🔥 {locale === "ar" ? "متكرر" : "Récurrent"}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(err.repairStatus)}
                          <span className="text-[11px] text-slate-500 font-mono">
                            {new Date(err.createdAt).toLocaleDateString(
                              locale === "ar" ? "ar-DZ" : "fr-FR"
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-[#162032] border border-slate-800 space-y-1">
                          <span className="text-[11px] font-bold text-slate-400 block">
                            {locale === "ar" ? "نوع الخلل المرصود:" : "Cause diagnostiquée :"}
                          </span>
                          <span className="font-semibold text-white">
                            {errorLabel}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-[#162032] border border-slate-800 space-y-1">
                          <span className="text-[11px] font-bold text-slate-400 block">
                            {locale === "ar" ? "حالة المعالجة والتحقق:" : "État de remédiation :"}
                          </span>
                          <span className="font-semibold text-white">
                            {err.repairStatus === "retest_passed"
                              ? (locale === "ar"
                                  ? "تم التمكن واجتياز إعادة الاختبار بنجاح ✓"
                                  : "Maîtrise validée par re-test ✓")
                              : err.repairStatus === "repair_completed"
                              ? (locale === "ar"
                                  ? "اكتمل الترميم — بانتظار إعادة الاختبار"
                                  : "Remédié — en attente de re-test")
                              : err.repairStatus === "retest_failed"
                              ? (locale === "ar"
                                  ? "فشل إعادة الاختبار — بحاجة لمراجعة ثانية"
                                  : "Re-test échoué — révision requise")
                              : (locale === "ar"
                                  ? "بحاجة لإكمال خطوات الترميم"
                                  : "Remédiation à compléter")}
                          </span>
                        </div>
                      </div>

                      {/* Action CTA */}
                      <div className="pt-1 flex items-center justify-end">
                        <Link href={`/mission/${err.missionId}`}>
                          <Button
                            size="sm"
                            variant={err.repairStatus === "retest_passed" ? "ghost" : "outline"}
                          >
                            <span>
                              {err.repairStatus === "retest_passed"
                                ? (locale === "ar" ? "مراجعة المهمة" : "Revoir la mission")
                                : (locale === "ar" ? "متابعة الترميم والاختبار" : "Continuer la réparation")}
                            </span>
                            <NextArrow className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </Container>
      </div>
    </AppShell>
  );
}
