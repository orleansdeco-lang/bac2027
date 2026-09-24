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
  Settings,
} from "lucide-react";
import { ErrorLabSummary, RecallQuestionWithState } from "@/types/recall";
import { RecallRepository } from "@/lib/repositories/recall-repository";
import { RecallTrainerSettingsCard } from "@/components/recall/RecallTrainerSettingsCard";
import { trackEvent } from "@/lib/analytics";
import { getStrategicProfile, getRegistrationDraft } from "@/lib/onboarding/profile";

export default function StudentErrorLabPage() {
  const { user } = useAuth();
  const { locale } = useTranslation();
  const isAr = locale === "ar";
  const NextArrow = isAr ? ArrowLeft : ArrowRight;

  const [activeTab, setActiveTab] = useState<"gaps" | "settings">("gaps");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [items, setItems] = useState<RecallQuestionWithState[]>([]);
  const [summary, setSummary] = useState<ErrorLabSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const userId = user?.id || "anonymous-student";
        const p = user?.id ? getStrategicProfile(user.id) : null;
        const reg = user?.id ? getRegistrationDraft(user.id) : null;
        const studentTerm = (p as any)?.current_term || (p as any)?.currentTerm || 1;
        const studentStream = p?.streamId || (reg as any)?.streamId || "sciences_exp";

        const result = await RecallRepository.getErrorLabData(userId, {
          studentTerm,
          studentStream,
        });
        setItems(result.items);
        setSummary(result.summary);
        trackEvent("error_lab_viewed", {
          totalErrors: result.summary.totalErrors,
          inErrorLabCount: result.summary.inErrorLabCount,
        });
      } catch (err) {
        console.error("Failed to load error lab data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const filteredItems = items.filter((item) => {
    if (selectedSubject !== "all" && item.subject !== selectedSubject) {
      return false;
    }
    return true;
  });

  const subjectsList = ["all", "تاريخ", "جغرافيا", "إسلامية", "فلسفة"];

  return (
    <AppShell>
      <Container className="py-6 sm:py-8 max-w-6xl">
        {/* Top Hero Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-surface/70 backdrop-blur-md p-6 rounded-3xl border border-theme shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-theme-text">معمل الأخطاء والترميم الفوري</h1>
                <Badge variant="warning" size="sm" className="font-mono">
                  Error Lab
                </Badge>
              </div>
              <p className="text-sm text-theme-muted mt-1 max-w-xl">
                الأخطاء هي أثمن كنز في رحلتك نحو البكالوريا: حوّل كل عثرة إلى نقطة قوة مضمونة عبر العلاج المستهدف والتكرار الذكي.
              </p>
            </div>
          </div>

          {/* Quick remediation CTA button */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/student/arena/quick-recall" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full gap-2 shadow-lg shadow-[var(--color-primary)]/20">
                <Zap className="w-4 h-4 fill-current" />
                <span>تصفية الثغرات الآن ⚡</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mb-6 border-b border-theme pb-2">
          <button
            onClick={() => setActiveTab("gaps")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "gaps"
                ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30"
                : "text-theme-muted hover:text-theme-text hover:bg-surface-elevated"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>الثغرات المعلقة ({items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "settings"
                ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/30"
                : "text-theme-muted hover:text-theme-text hover:bg-surface-elevated"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>إعدادات التكرار والإشعارات</span>
          </button>
        </div>

        {activeTab === "settings" ? (
          <div className="max-w-3xl">
            <RecallTrainerSettingsCard userId={user?.id || "anonymous-student"} />
          </div>
        ) : (
          <>
            {/* KPI Cards & Remediation Progress */}
            {summary && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <Card className="p-5 border border-theme bg-surface/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-theme-muted">نسبة الترميم والمعالجة</span>
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-extrabold text-theme-text font-mono">
                    {summary.remediationRatePercent}%
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-theme-border/40 rounded-full mt-3 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${summary.remediationRatePercent}%` }}
                    />
                  </div>
                </Card>

                <Card className="p-5 border border-theme bg-surface/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-theme-muted">الثغرات العالقة في المعمل</span>
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="text-3xl font-extrabold text-amber-500 font-mono">
                    {summary.inErrorLabCount}
                  </div>
                  <div className="text-xs text-theme-muted mt-2">
                    تتطلب إجابتين صحيحتين متتاليتين للإخراج
                  </div>
                </Card>

                <Card className="p-5 border border-theme bg-surface/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-theme-muted">ثغرات تم ترميمها بنجاح</span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    {summary.remediatedCount}
                  </div>
                  <div className="text-xs text-theme-muted mt-2">
                    انتقلت لنظام التكرار المتباعد المتقدم
                  </div>
                </Card>
              </div>
            )}

            {/* Subject Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
              <span className="text-xs font-semibold text-theme-muted shrink-0 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>تصفية حسب المادة:</span>
              </span>
              {subjectsList.map((subj) => (
                <button
                  key={subj}
                  type="button"
                  onClick={() => setSelectedSubject(subj)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all shrink-0 ${
                    selectedSubject === subj
                      ? "bg-[var(--color-primary)] text-[var(--color-primary-text)] border-[var(--color-primary)] shadow-sm"
                      : "bg-surface border-theme-border text-theme-muted hover:text-theme-text"
                  }`}
                >
                  {subj === "all" ? "جميع المواد" : subj}
                </button>
              ))}
            </div>

            {/* List of Open Gaps */}
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
            ) : filteredItems.length === 0 ? (
              <Card className="p-10 text-center border border-theme bg-surface/60 rounded-3xl">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-theme-text mb-1">
                  لا توجد ثغرات عالقة في هذا القسم!
                </h3>
                <p className="text-sm text-theme-muted mb-4">
                  إما أنك لم ترتكب أخطاء بعد، أو أنك قمت بترميم جميع العثرات بنجاح.
                </p>
                <Link href="/student/arena/quick-recall">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Zap className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>خوض جولة استرجاع سريعة</span>
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
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
                    <p className="text-xs sm:text-sm text-theme-muted bg-surface-elevated/40 p-3 rounded-xl border border-theme-border/50 mb-4 leading-relaxed">
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
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                          <span>إعادة اختبار هذا السؤال 🎯</span>
                          <NextArrow className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </AppShell>
  );
}
