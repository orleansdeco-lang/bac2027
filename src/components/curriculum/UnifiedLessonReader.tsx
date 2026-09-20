"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SkillLearningBundle } from "@/data/curriculum/bundle-builder";
import { ALL_SUBJECTS } from "@/lib/constants/streams";
import { SubjectId } from "@/types/education";
import { MathRenderer } from "@/components/ui/MathRenderer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  EmbeddedVideoPlayer,
  extractYoutubeVideoId,
  parseTimestampToSeconds,
} from "./EmbeddedVideoPlayer";
import { DiagramViewer } from "./DiagramViewer";
import {
  X,
  BookOpen,
  FileCheck,
  Target,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Play,
  Lightbulb,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  ChevronRight,
  Eye,
  EyeOff,
  Clock,
  Layers,
  Award,
} from "lucide-react";

interface UnifiedLessonReaderProps {
  bundle: SkillLearningBundle | null;
  isOpen: boolean;
  onClose: () => void;
  isMastered?: boolean;
  onToggleMastery?: (skillId: string) => Promise<void> | void;
  diagramData?: {
    caption_ar: string;
    diagramUrl: string;
    labels: { id: number; text_ar: string }[];
  } | null;
}

type TabType = "theory" | "worked_example" | "practice" | "recall";

export const UnifiedLessonReader: React.FC<UnifiedLessonReaderProps> = ({
  bundle,
  isOpen,
  onClose,
  isMastered = false,
  onToggleMastery,
  diagramData,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>("theory");
  const [selectedPracticeOption, setSelectedPracticeOption] = useState<string | null>(null);
  const [showPracticeAnswer, setShowPracticeAnswer] = useState(false);
  const [selectedRetestOption, setSelectedRetestOption] = useState<string | null>(null);
  const [showRetestAnswer, setShowRetestAnswer] = useState(false);
  const [showRecallAnswer, setShowRecallAnswer] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset interactive state when bundle changes
  useEffect(() => {
    setActiveTab("theory");
    setSelectedPracticeOption(null);
    setShowPracticeAnswer(false);
    setSelectedRetestOption(null);
    setShowRetestAnswer(false);
    setShowRecallAnswer(false);
  }, [bundle?.skill?.id]);

  if (!isOpen || !bundle) return null;

  const { skill, lesson, workedExample, practiceQuestions, retest, repairGuide, provenance, readiness } = bundle;
  const subjectMeta = ALL_SUBJECTS[skill.subjectId as SubjectId];
  const firstPractice = practiceQuestions && practiceQuestions.length > 0 ? practiceQuestions[0] : null;

  // Video parsing
  const videoUrl = (lesson as any)?.videoUrl || (skill as any)?.videoUrl;
  const youtubeVideoId = videoUrl ? extractYoutubeVideoId(videoUrl) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      dir="rtl"
    >
      <div
        className="relative w-full max-w-5xl h-[92vh] flex flex-col bg-card border border-theme rounded-3xl shadow-2xl overflow-hidden text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ================================================================= */}
        {/* TOP MODAL HEADER                                                  */}
        {/* ================================================================= */}
        <div className="px-5 py-4 border-b border-theme/80 bg-surface/80 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center shrink-0 font-bold shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>

            <div className="min-w-0 space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                {subjectMeta && (
                  <Badge variant="primary" size="sm" className="font-bold text-[11px]">
                    {subjectMeta.name_ar}
                  </Badge>
                )}
                {skill.difficulty && (
                  <Badge variant="outline" size="sm" className="text-[10px]">
                    صعوبة: {"★".repeat(skill.difficulty)}{"☆".repeat(3 - skill.difficulty)}
                  </Badge>
                )}
                {readiness?.status === "MASTERY_READY" && (
                  <Badge variant="success" size="sm" className="text-[10px] hidden sm:inline-flex">
                    معتمد رسمياً 100%
                  </Badge>
                )}
              </div>

              <h2 className="text-sm sm:text-base md:text-lg font-black text-theme-text truncate">
                {skill.title_ar}
              </h2>
            </div>
          </div>

          {/* Action buttons & Close */}
          <div className="flex items-center gap-2 shrink-0">
            {onToggleMastery && (
              <button
                type="button"
                onClick={() => onToggleMastery(skill.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isMastered
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                    : "bg-surface border border-theme text-theme-secondary hover:text-theme-text"
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 ${isMastered ? "text-emerald-400" : "text-theme-muted"}`} />
                <span className="hidden sm:inline">{isMastered ? "تم الإتقان ✓" : "تحديد كمتقن"}</span>
              </button>
            )}

            <Link
              href={`/mission/${skill.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-primary)] text-white hover:opacity-95 shadow-sm"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>تمرين في وضع المهمة</span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-theme hover:bg-surface text-theme-muted hover:text-theme-text transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================================================================= */}
        {/* PEDAGOGICAL 4-PHASE NAVIGATION TABS                               */}
        {/* ================================================================= */}
        <div className="px-5 py-2.5 bg-surface/50 border-b border-theme/60 flex items-center gap-2 overflow-x-auto shrink-0 select-none">
          <button
            type="button"
            onClick={() => setActiveTab("theory")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "theory"
                ? "bg-[var(--color-primary)] text-white shadow-sm scale-102"
                : "bg-card border border-theme text-theme-secondary hover:text-theme-text"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. الشرح النظري والمفاهيم</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("worked_example")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "worked_example"
                ? "bg-[var(--color-primary)] text-white shadow-sm scale-102"
                : "bg-card border border-theme text-theme-secondary hover:text-theme-text"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>2. المسألة النموذجية المحلولة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("practice")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "practice"
                ? "bg-[var(--color-primary)] text-white shadow-sm scale-102"
                : "bg-card border border-theme text-theme-secondary hover:text-theme-text"
            }`}
          >
            <Target className="w-4 h-4" />
            <span>3. التدريب التشخيصي والإصلاح</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("recall")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === "recall"
                ? "bg-[var(--color-primary)] text-white shadow-sm scale-102"
                : "bg-card border border-theme text-theme-secondary hover:text-theme-text"
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>4. بطاقة الاسترجاع والمرجعية الوزارية</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* TAB CONTENTS CONTAINER (SCROLLABLE)                               */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* ------------------------------------------------------------- */}
          {/* TAB 1: THEORY & CONCEPTS                                      */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "theory" && (
            <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
              {/* Target Capability Banner */}
              {lesson?.targetCapability_ar && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs sm:text-sm">
                    <span className="font-bold text-emerald-400 block">
                      الكفاءة المستهدفة في امتحان البكالوريا:
                    </span>
                    <p className="text-theme-text leading-relaxed">
                      {lesson.targetCapability_ar}
                    </p>
                  </div>
                </div>
              )}

              {/* Core Concept */}
              <div className="p-5 sm:p-6 rounded-2xl bg-surface/70 border border-theme space-y-3">
                <div className="flex items-center gap-2 text-[var(--color-primary)] font-black text-sm">
                  <Lightbulb className="w-4 h-4" />
                  <span>الفكرة الجوهرية والتعريف المنهجي:</span>
                </div>
                <div className="text-xs sm:text-sm leading-relaxed text-theme-text">
                  <MathRenderer
                    content={
                      lesson?.coreConcept_ar ||
                      (lesson as any)?.contentMarkdown_ar ||
                      bundle.theory?.summary ||
                      skill.description_ar
                    }
                  />
                </div>
              </div>

              {/* Simple Explanation if present */}
              {lesson?.simpleExplanation_ar && (
                <div className="p-5 rounded-2xl bg-card border border-theme space-y-2">
                  <span className="text-xs font-bold text-theme-muted block">
                    الشرح التبسيطي والتطبيقي:
                  </span>
                  <div className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
                    <MathRenderer content={lesson.simpleExplanation_ar} />
                  </div>
                </div>
              )}

              {/* Methodological Steps / Repair Steps */}
              {skill.repairSteps_ar && skill.repairSteps_ar.length > 0 && (
                <div className="p-5 rounded-2xl bg-card border border-theme space-y-3">
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-xs sm:text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>الخطوات المنهجية المعتمدة للحل:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-theme-secondary leading-relaxed">
                    {skill.repairSteps_ar.map((step, idx) => (
                      <li key={idx} className="ps-1">
                        <span className="text-theme-text font-medium">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Common Pitfalls / Misconceptions */}
              {lesson?.commonMistakes && lesson.commonMistakes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs sm:text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>أفخاخ شائعة يقع فيها المترشحون وكيفية تجنبها:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {lesson.commonMistakes.map((m, mIdx) => (
                      <div
                        key={mIdx}
                        className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-2 text-xs"
                      >
                        <span className="font-bold text-rose-400 block">
                          ⚠️ الفخ: {m.mistake_ar}
                        </span>
                        {m.whyItHappens_ar && (
                          <p className="text-theme-muted">
                            <span className="font-medium text-theme-secondary">السبب: </span>
                            {m.whyItHappens_ar}
                          </p>
                        )}
                        {m.correctAction_ar && (
                          <p className="text-emerald-400 font-medium">
                            <span className="text-emerald-500 font-bold">التصحيح المنهجي: </span>
                            {m.correctAction_ar}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Explanation if available */}
              {youtubeVideoId && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-theme-muted flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-rose-500" />
                    <span>الشرح المرئي المصاحب للدرس:</span>
                  </span>
                  <EmbeddedVideoPlayer
                    videoId={youtubeVideoId}
                    startSeconds={0}
                    title_ar={skill.title_ar}
                  />
                </div>
              )}

              {/* Diagram Viewer if available */}
              {diagramData && (
                <div className="space-y-2 pt-2">
                  <DiagramViewer
                    caption_ar={diagramData.caption_ar}
                    diagramUrl={diagramData.diagramUrl}
                    labels={diagramData.labels}
                  />
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: WORKED EXAMPLE                                         */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "worked_example" && (
            <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
              {workedExample ? (
                <div className="space-y-5">
                  {/* Problem Statement */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-surface/70 border border-theme space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[var(--color-primary)] uppercase tracking-wider">
                        نص المسألة النموذجية:
                      </span>
                      <Badge variant="outline" size="sm" className="text-[10px]">
                        معيار البكالوريا
                      </Badge>
                    </div>
                    <div className="text-xs sm:text-sm text-theme-text font-medium leading-relaxed">
                      <MathRenderer
                        content={
                          workedExample.problem_ar ||
                          workedExample.question_ar ||
                          workedExample.question ||
                          "تطبيق مباشر للمفهوم المدروس."
                        }
                      />
                    </div>
                  </div>

                  {/* Thinking Process / How to Think */}
                  {workedExample.howToThink_ar && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-xs sm:text-sm">
                      <div className="flex items-center gap-2 font-bold text-amber-400">
                        <Lightbulb className="w-4 h-4" />
                        <span>كيف يفكر التلميذ المتفوق أمام هذه المسألة؟</span>
                      </div>
                      <p className="text-theme-secondary leading-relaxed">
                        {workedExample.howToThink_ar}
                      </p>
                    </div>
                  )}

                  {/* Step-by-Step Solution */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-card border border-theme space-y-4">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                      خطوات الحل النموذجي المفصل:
                    </span>
                    {Array.isArray(workedExample.stepByStepSolution_ar) ||
                    Array.isArray(workedExample.stepByStepSolution) ? (
                      <div className="space-y-3">
                        {(
                          workedExample.stepByStepSolution_ar ||
                          workedExample.stepByStepSolution
                        ).map((step: string, sIdx: number) => (
                          <div
                            key={sIdx}
                            className="p-3.5 rounded-xl bg-surface/60 border border-theme/60 flex items-start gap-3"
                          >
                            <span className="w-6 h-6 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] text-xs font-mono font-bold flex items-center justify-center shrink-0">
                              {sIdx + 1}
                            </span>
                            <div className="text-xs sm:text-sm text-theme-text leading-relaxed">
                              <MathRenderer content={step} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs sm:text-sm text-theme-text leading-relaxed">
                        <MathRenderer
                          content={
                            workedExample.stepByStepSolution_ar ||
                            workedExample.stepByStepSolution ||
                            "تم استنتاج الحل وفق القواعد المدروسة."
                          }
                        />
                      </div>
                    )}
                  </div>

                  {/* Final Answer & Verification Tip */}
                  {workedExample.finalAnswer_ar && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs sm:text-sm">
                      <span className="font-bold text-emerald-400">النتيجة النهائية المعتمدة:</span>
                      <span className="font-mono font-bold text-theme-text">
                        {workedExample.finalAnswer_ar}
                      </span>
                    </div>
                  )}

                  {workedExample.verificationTip_ar && (
                    <div className="p-4 rounded-2xl bg-surface border border-theme text-xs space-y-1">
                      <span className="font-bold text-theme-muted block">
                        💡 طريقة التأكد والتحقق من صحة الإجابة:
                      </span>
                      <p className="text-theme-secondary leading-relaxed">
                        {workedExample.verificationTip_ar}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center space-y-2 bg-surface/40 rounded-2xl border border-theme">
                  <FileCheck className="w-8 h-8 text-theme-muted mx-auto" />
                  <p className="text-sm font-bold text-theme-text">المثال المحلول متاح في التمارين التفاعلية</p>
                  <p className="text-xs text-theme-muted">انتقل إلى تبويب التدريب أو ابدأ وضع المهمة مباشرة</p>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: DIAGNOSTIC PRACTICE & RETEST                           */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "practice" && (
            <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
              {/* Diagnostic Question */}
              {firstPractice ? (
                <div className="p-5 sm:p-6 rounded-2xl bg-surface/70 border border-theme space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[var(--color-primary)] uppercase tracking-wider">
                      السؤال التشخيصي الفوري:
                    </span>
                    <Badge variant="outline" size="sm" className="text-[10px]">
                      اختبر فهمك الآن
                    </Badge>
                  </div>

                  <div className="text-xs sm:text-sm text-theme-text font-bold leading-relaxed">
                    <MathRenderer content={firstPractice.prompt_ar} />
                  </div>

                  {/* Options */}
                  <div className="space-y-2 pt-2">
                    {firstPractice.options?.map((opt: any) => {
                      const isSelected = selectedPracticeOption === opt.id;
                      const isCorrect = opt.id === firstPractice.correctAnswerId || opt.isCorrect;

                      let optStyles = "bg-card border-theme text-theme-text hover:border-[var(--color-primary)]/50";
                      if (showPracticeAnswer) {
                        if (isCorrect) {
                          optStyles = "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold";
                        } else if (isSelected && !isCorrect) {
                          optStyles = "bg-rose-500/10 border-rose-500 text-rose-400";
                        }
                      } else if (isSelected) {
                        optStyles = "bg-[var(--color-primary-soft)] border-[var(--color-primary)] text-[var(--color-primary)] font-bold";
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedPracticeOption(opt.id);
                            setShowPracticeAnswer(true);
                          }}
                          className={`w-full text-right p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${optStyles}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full border border-current/40 flex items-center justify-center text-[10px] shrink-0 font-mono">
                              {opt.id.slice(-1).toUpperCase()}
                            </span>
                            <span>{opt.text_ar || opt.text}</span>
                          </div>

                          {showPracticeAnswer && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          {showPracticeAnswer && isSelected && !isCorrect && (
                            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation revealed */}
                  {showPracticeAnswer && firstPractice.explanation_ar && (
                    <div className="p-4 rounded-xl bg-surface border border-theme space-y-1.5 text-xs sm:text-sm animate-fade-in">
                      <span className="font-bold text-emerald-400 block">
                        الشرح النموذجي المعتمد:
                      </span>
                      <div className="text-theme-secondary leading-relaxed">
                        <MathRenderer content={firstPractice.explanation_ar} />
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* Isomorphic Retest Question */}
              {retest && (
                <div className="p-5 sm:p-6 rounded-2xl bg-card border border-theme space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-500 uppercase tracking-wider">
                      السؤال التوأم المتطابق بنيوياً (Isomorphic Retest):
                    </span>
                    <Badge variant="outline" size="sm" className="text-[10px]">
                      تثبيت التعلم
                    </Badge>
                  </div>

                  <div className="text-xs sm:text-sm text-theme-text font-bold leading-relaxed">
                    <MathRenderer content={retest.prompt_ar} />
                  </div>

                  {/* Retest Options */}
                  <div className="space-y-2 pt-2">
                    {retest.options?.map((opt: any) => {
                      const isSelected = selectedRetestOption === opt.id;
                      const isCorrect = opt.id === retest.correctAnswerId || opt.isCorrect;

                      let optStyles = "bg-surface/70 border-theme text-theme-text hover:border-amber-500/50";
                      if (showRetestAnswer) {
                        if (isCorrect) {
                          optStyles = "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold";
                        } else if (isSelected && !isCorrect) {
                          optStyles = "bg-rose-500/10 border-rose-500 text-rose-400";
                        }
                      } else if (isSelected) {
                        optStyles = "bg-amber-500/10 border-amber-500 text-amber-400 font-bold";
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setSelectedRetestOption(opt.id);
                            setShowRetestAnswer(true);
                          }}
                          className={`w-full text-right p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${optStyles}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full border border-current/40 flex items-center justify-center text-[10px] shrink-0 font-mono">
                              {opt.id.slice(-1).toUpperCase()}
                            </span>
                            <span>{opt.text_ar || opt.text}</span>
                          </div>

                          {showRetestAnswer && isCorrect && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {showRetestAnswer && retest.explanation_ar && (
                    <div className="p-4 rounded-xl bg-surface border border-theme space-y-1 text-xs animate-fade-in">
                      <span className="font-bold text-amber-400 block">شرح السؤال التوأم:</span>
                      <p className="text-theme-secondary leading-relaxed">{retest.explanation_ar}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Repair Guide / Cognitive Strategy */}
              {repairGuide && (
                <div className="p-5 rounded-2xl bg-surface/50 border border-theme space-y-3">
                  <span className="text-xs font-black text-blue-400 uppercase tracking-wider block">
                    دليل المعالجة والإصلاح المعرفي:
                  </span>
                  {(repairGuide.diagnosis_ar || repairGuide.whyItHappens_ar || (repairGuide as any).mentalModelExplanation_ar) && (
                    <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed">
                      {repairGuide.diagnosis_ar || repairGuide.whyItHappens_ar || (repairGuide as any).mentalModelExplanation_ar}
                    </p>
                  )}
                  {((repairGuide as any).actionableAdvice_ar || repairGuide.repairSteps_ar?.[0]) && (
                    <div className="p-3 rounded-xl bg-card border border-theme/60 text-xs text-theme-text font-medium">
                      🎯 <span className="font-bold">توجيه فوري:</span>{" "}
                      {(repairGuide as any).actionableAdvice_ar || repairGuide.repairSteps_ar[0]}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 4: ACTIVE RECALL & MINISTERIAL PROVENANCE                 */}
          {/* ------------------------------------------------------------- */}
          {activeTab === "recall" && (
            <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
              {/* Active Recall Flashcard */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-surface via-surface/90 to-surface/60 border border-theme shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-[var(--color-primary)]" />
                    <span className="text-xs font-black text-theme-text uppercase tracking-wider">
                      بطاقة الاسترجاع النشط الفوري (Active Recall):
                    </span>
                  </div>
                  <Badge variant="primary" size="sm" className="text-[10px]">
                    المراجعة الذكية
                  </Badge>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-theme space-y-2">
                  <span className="text-xs font-bold text-theme-muted block">
                    سؤال الاسترجاع السريع (أجب ذهنياً قبل المشاهدة):
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-theme-text leading-relaxed">
                    {lesson?.quickRecallPrompt_ar ||
                      `ما هي القاعدة الأساسية التي تحكم: ${skill.title_ar}؟`}
                  </p>
                </div>

                {/* Answer toggle */}
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRecallAnswer(!showRecallAnswer)}
                    className="text-xs"
                  >
                    {showRecallAnswer ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>إخفاء الإجابة النموذجية</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>اضغط لإظهار الإجابة النموذجية</span>
                      </>
                    )}
                  </Button>

                  {showRecallAnswer && (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs sm:text-sm text-theme-text leading-relaxed animate-fade-in">
                      <MathRenderer
                        content={
                          lesson?.quickRecallAnswer_ar ||
                          lesson?.summaryCard?.keyRule_ar ||
                          skill.repairStrategy_ar ||
                          "تطبيق القاعدة المنهجية المعتمدة."
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Golden Rules and Formulas */}
              {lesson?.summaryCard && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lesson.summaryCard.keyFormula_ar && (
                    <div className="p-4 rounded-2xl bg-card border border-theme space-y-1.5">
                      <span className="text-xs font-bold text-blue-400 block">
                        القانون أو القاعدة الذهبية:
                      </span>
                      <div className="text-xs sm:text-sm font-mono text-theme-text">
                        <MathRenderer content={lesson.summaryCard.keyFormula_ar} />
                      </div>
                    </div>
                  )}

                  {lesson.summaryCard.trapToAvoid_ar && (
                    <div className="p-4 rounded-2xl bg-card border border-theme space-y-1.5">
                      <span className="text-xs font-bold text-rose-400 block">
                        أهم فخ يجب تجنبه:
                      </span>
                      <p className="text-xs sm:text-sm text-theme-secondary">
                        {lesson.summaryCard.trapToAvoid_ar}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Official Ministerial Provenance */}
              <div className="p-5 sm:p-6 rounded-2xl bg-surface/50 border border-theme space-y-3">
                <div className="flex items-center gap-2 text-theme-text font-bold text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>المرجعية الوزارية والتوثيق الرسمي:</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-card border border-theme/60 space-y-1">
                    <span className="text-theme-muted block text-[11px]">المصدر الرسمي:</span>
                    <span className="font-bold text-theme-text block truncate">
                      {provenance?.title_ar || "المنهاج الوزاري الرسمي للبكالوريا"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-theme/60 space-y-1">
                    <span className="text-theme-muted block text-[11px]">حالة الاعتماد:</span>
                    <span className="font-bold text-emerald-400 block">
                      {readiness?.status === "MASTERY_READY" ? "معتمد 100% ✓" : "جاهز"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-theme/60 space-y-1">
                    <span className="text-theme-muted block text-[11px]">المعامل الرسمي:</span>
                    <span className="font-bold text-theme-text block">
                      معامل {subjectMeta?.isScientific ? "علمي" : "أدبي"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-card border border-theme/60 space-y-1">
                    <span className="text-theme-muted block text-[11px]">معرف الكفاءة:</span>
                    <span className="font-mono text-[10px] text-theme-muted block truncate">
                      {skill.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Big CTA Button */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-[var(--color-primary)] to-emerald-600 text-white text-center space-y-3 shadow-lg">
                <h3 className="text-base sm:text-lg font-black">
                  جاهز لاختبار قدرتك على حل تمارين البكالوريا؟
                </h3>
                <p className="text-xs sm:text-sm text-white/80 max-w-lg mx-auto">
                  انتقل إلى وضع المهمة التفاعلية لتجربة أسئلة مطابقة تماماً لامتحانات البكالوريا مع تصحيح ذكي فوري.
                </p>
                <div className="pt-2">
                  <Link
                    href={`/mission/${skill.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-950 font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-md"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>ابدأ المهمة التفاعلية الآن</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
