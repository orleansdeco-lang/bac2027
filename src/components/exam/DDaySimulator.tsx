"use client";

import React, { useState, useEffect, useMemo } from "react";
import { SubjectId, StreamId } from "@/types/education";
import { ALL_SUBJECTS, getStreamSubjects } from "@/lib/constants/streams";
import { BacExamItem } from "@/data/exams";
import { getExamFullDetails, ExamFullDetails, ExamTopicDetails } from "@/data/exams/exam-details";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  FileText,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Eye,
  Columns,
  Square,
  Edit3,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function getOfficialExamDurationMinutes(streamId: StreamId, subjectId: SubjectId): number {
  if (subjectId === "natural_sciences") {
    return streamId === "sciences_exp" ? 270 : 150; // 4.5h vs 2.5h
  }
  if (subjectId === "math") {
    if (streamId === "math" || streamId === "technique_math") return 270; // 4.5h
    if (streamId === "sciences_exp" || streamId === "gestion_eco") return 210; // 3.5h
    return 150; // 2.5h
  }
  if (subjectId === "physics") {
    return 210; // 3.5h
  }
  if (subjectId === "philosophy") {
    return streamId === "lettres_philo" ? 270 : 150; // 4.5h vs 2.5h
  }
  if (subjectId === "arabic") {
    return streamId === "lettres_philo" || streamId === "langues_etrangeres" ? 240 : 150; // 4.0h vs 2.5h
  }
  if (subjectId === "history_geography") {
    return streamId === "lettres_philo" || streamId === "gestion_eco" ? 210 : 150; // 3.5h vs 2.5h
  }
  if (subjectId === "accounting_finance") {
    return 270; // 4.5h
  }
  if (subjectId === "economics_management") {
    return 150; // 2.5h
  }
  if (subjectId === "law") {
    return 150; // 2.5h
  }
  if (
    subjectId === "mechanical_eng" ||
    subjectId === "civil_eng" ||
    subjectId === "electrical_eng" ||
    subjectId === "process_eng"
  ) {
    return 240; // 4.0h
  }
  if (
    subjectId === "french" ||
    subjectId === "english" ||
    subjectId === "third_language"
  ) {
    return streamId === "langues_etrangeres" ? 210 : 150; // 3.5h vs 2.5h
  }
  if (subjectId === "islamic_studies") {
    return 150; // 2.5h
  }
  return 150;
}

export function formatDurationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours} ساعات`;
  }
  if (mins === 30) {
    return `${hours} ساعات ونصف`;
  }
  return `${hours} سا و ${mins} د`;
}

interface Props {
  streamId?: StreamId;
  initialSubjectId?: SubjectId;
  examData?: any; // For backward compatibility
}

export const DDaySimulator: React.FC<Props> = ({
  streamId = "sciences_exp",
  initialSubjectId,
}) => {
  // 1. Available subjects for this stream sorted by coefficient
  const streamSubjects = useMemo(() => {
    return [...getStreamSubjects(streamId)].sort((a, b) => b.coefficient - a.coefficient);
  }, [streamId]);

  const defaultSubj = initialSubjectId || streamSubjects[0]?.subjectId || "natural_sciences";
  const [activeSubject, setActiveSubject] = useState<SubjectId>(defaultSubj);

  // 2. Exam Details for currently active subject
  const currentExamDetails = useMemo<ExamFullDetails>(() => {
    const durationMinutes = getOfficialExamDurationMinutes(streamId, activeSubject);
    const subjMeta = ALL_SUBJECTS[activeSubject];
    const rule = streamSubjects.find((s) => s.subjectId === activeSubject);

    const examItem: BacExamItem = {
      id: `mock-${streamId}-${activeSubject}`,
      year: 2024,
      session: "regular",
      kind: "official_bac",
      streamId,
      subjectId: activeSubject,
      title_ar: `امتحان بكالوريا رسمي متكامل — ${subjMeta?.name_ar || activeSubject}`,
      topicsCount: 2,
      subjectPdfUrl: "",
      solutionPdfUrl: "",
      durationMinutes,
      coefficient: rule?.coefficient || 2,
    };

    return getExamFullDetails(examItem);
  }, [streamId, activeSubject, streamSubjects]);

  // 3. State Management
  const [selectedTopic, setSelectedTopic] = useState<1 | 2>(1); // Active preview tab
  const [confirmedTopic, setConfirmedTopic] = useState<1 | 2 | null>(null); // Decision locked for exam solving
  const [viewMode, setViewMode] = useState<"tab" | "split">("tab");
  const [showDraftPad, setShowDraftPad] = useState(false);
  const [draftContent, setDraftContent] = useState("");

  // Official Exam Timer
  const totalDurationSeconds = useMemo(() => {
    return (currentExamDetails.exam.durationMinutes || 210) * 60;
  }, [currentExamDetails]);

  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(totalDurationSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isExamCompleted, setIsExamCompleted] = useState<boolean>(false);

  // Reset timer whenever subject changes or decision resets
  useEffect(() => {
    setTimeLeftSeconds(totalDurationSeconds);
    setIsTimerRunning(false);
    setConfirmedTopic(null);
    setIsExamCompleted(false);
  }, [activeSubject, totalDurationSeconds]);

  // Countdown clock effect
  useEffect(() => {
    if (!isTimerRunning || timeLeftSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          setIsExamCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeftSeconds]);

  const formatTimer = (totalSecs: number) => {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartExamWithTopic = (topicNum: 1 | 2) => {
    setConfirmedTopic(topicNum);
    setSelectedTopic(topicNum);
    setIsTimerRunning(true);
    setIsExamCompleted(false);
  };

  const handleResetExam = () => {
    setConfirmedTopic(null);
    setIsTimerRunning(false);
    setTimeLeftSeconds(totalDurationSeconds);
    setIsExamCompleted(false);
  };

  const topic1 = currentExamDetails.topic1;
  const topic2 = currentExamDetails.topic2;
  const activeTopic = confirmedTopic === 2 || (confirmedTopic === null && selectedTopic === 2) ? topic2 : topic1;

  const renderTopicContent = (topic: ExamTopicDetails, isChosen: boolean = false) => (
    <div className="space-y-6">
      {/* Topic Header Card */}
      <div className="p-5 rounded-2xl bg-surface/70 border border-theme space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="primary"
            size="sm"
            className="text-xs font-bold px-3 py-1 bg-[var(--color-primary)] text-white"
          >
            الموضوع {topic.topicNumber}
          </Badge>
          <span className="text-xs font-bold text-theme-muted font-mono">
            {topic.exercises.reduce((sum, ex) => sum + ex.points, 0)} نقطة
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-black text-theme-text font-sans">
          {topic.title}
        </h3>
        <p className="text-xs text-theme-secondary font-sans leading-relaxed">
          {topic.instruction}
        </p>

        {/* Action Button inside topic preview */}
        {!confirmedTopic && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleStartExamWithTopic(topic.topicNumber)}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                اخترت الموضوع {topic.topicNumber} — ابدأ الامتحان الآن (انطلاق وقت {formatDurationLabel(currentExamDetails.exam.durationMinutes || 210)})
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {topic.exercises.map((exercise) => (
          <Card
            key={exercise.id}
            className="p-5 sm:p-6 border border-theme bg-card space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-theme/60 pb-3">
              <div className="space-y-0.5">
                <span className="text-xs font-mono font-bold text-[var(--color-primary)]">
                  التمرين #{exercise.number}
                </span>
                <h4 className="font-bold text-sm sm:text-base text-theme-text font-sans">
                  {exercise.title}
                </h4>
              </div>
              <Badge variant="outline" size="sm" className="font-bold text-xs bg-surface-soft">
                {exercise.points} نقاط
              </Badge>
            </div>

            {/* Exercise Context / Subject text */}
            {exercise.description && (
              <div className="p-3.5 rounded-xl bg-surface-soft border border-theme/80 text-xs sm:text-sm text-theme-text font-sans leading-relaxed">
                {exercise.description}
              </div>
            )}

            {/* Questions list */}
            <div className="space-y-3 pt-1">
              <span className="text-[11px] font-bold text-theme-muted uppercase tracking-wider block">
                التعليمات والأسئلة:
              </span>
              <div className="space-y-2.5 pr-2">
                {exercise.questions.map((q, qIdx) => (
                  <div key={qIdx} className="space-y-1.5 text-xs sm:text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-[var(--color-primary)] shrink-0 font-mono">
                        {q.number}.
                      </span>
                      <p className="text-theme-text leading-relaxed font-sans flex-1">
                        {q.text}
                      </p>
                      {q.points > 0 && (
                        <span className="text-[10px] font-mono text-theme-muted font-bold shrink-0">
                          ({q.points} ن)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expandable Official Marking Scheme & Bareme */}
            <details className="mt-3 pt-3 border-t border-theme/60 text-xs text-theme-muted group">
              <summary className="cursor-pointer font-bold text-emerald-600 dark:text-emerald-400 hover:underline select-none flex items-center gap-1.5">
                <span>🔍 شبكة التنقيط وسلم التصحيح النموذجي (Barème)</span>
              </summary>
              <div className="mt-3 space-y-2 p-3.5 rounded-xl bg-surface-soft border border-theme/80">
                {exercise.questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-2 rounded-lg bg-card border border-theme/60 space-y-1 text-xs"
                  >
                    <div className="flex justify-between font-bold text-theme-text">
                      <span>السؤال {q.number}:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">
                        {q.points} ن
                      </span>
                    </div>
                    <p className="text-theme-secondary font-sans leading-relaxed">
                      {q.solutionText}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full space-y-6 text-right" dir="rtl">
      {/* 1. Subject Navigation Strip (Choose any subject of the stream) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-theme-muted flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[var(--color-primary)]" />
            <span>مواد البكالوريا المتاحة للمحاكاة الرسمية (اختر مادة للبدء):</span>
          </span>
          <span className="text-[11px] text-theme-muted font-mono">
            {streamSubjects.length} مواد رسمية
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {streamSubjects.map((subj) => {
            const isSelected = activeSubject === subj.subjectId;
            const duration = getOfficialExamDurationMinutes(streamId, subj.subjectId);

            return (
              <button
                key={subj.subjectId}
                type="button"
                onClick={() => {
                  if (confirmedTopic && isTimerRunning) {
                    if (
                      !confirm(
                        "أنت الآن في خضم امتحان رسمي جاري. هل تريد حقاً تبديل المادة وإعادة ضبط المؤقت؟"
                      )
                    ) {
                      return;
                    }
                  }
                  setActiveSubject(subj.subjectId);
                }}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all select-none flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-[var(--color-primary)] text-white shadow-clay scale-[1.02]"
                    : "bg-card border border-theme text-theme-secondary hover:text-theme-text hover:bg-card-hover"
                }`}
              >
                <span>{ALL_SUBJECTS[subj.subjectId]?.name_ar || subj.subjectId}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-surface-soft text-theme-muted"
                  }`}
                >
                  {formatDurationLabel(duration)}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono font-bold ${
                    isSelected ? "bg-white/20 text-white" : "bg-surface-soft text-theme-muted"
                  }`}
                >
                  معامل {subj.coefficient}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Top Dashboard Header: Exam Info + Live Official Timer */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              بكالوريا رسمية نموذجية
            </span>
            <span className="text-xs font-mono text-slate-400">
              المعامل: {currentExamDetails.coefficient}
            </span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black font-sans text-white">
            {currentExamDetails.subjectName} — {currentExamDetails.streamName}
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            المدة الرسمية المعتمدة:{" "}
            <strong className="text-emerald-300 font-mono">
              {formatDurationLabel(currentExamDetails.exam.durationMinutes || 210)}
            </strong>
          </p>
        </div>

        {/* Real Countdown Timer Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-3 bg-slate-800/90 px-5 py-3 rounded-2xl border border-slate-700 w-full sm:w-auto justify-between sm:justify-start">
            <div
              className={`w-3 h-3 rounded-full ${
                isTimerRunning
                  ? "bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"
                  : confirmedTopic
                  ? "bg-amber-400"
                  : "bg-slate-500"
              }`}
            />
            <div className="text-start">
              <span className="text-[10px] text-slate-400 block leading-tight">
                {confirmedTopic ? "المؤقت الرسمي للامتحان" : "المدة المتاحة"}
              </span>
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-300 tracking-wider">
                {formatTimer(timeLeftSeconds)}
              </span>
            </div>
          </div>

          {/* Timer Action Buttons */}
          {confirmedTopic && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors"
                title={isTimerRunning ? "إيقاف مؤقت" : "استئناف"}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleResetExam}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 transition-colors"
                title="إلغاء وإعادة الاختيار"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Decision & Exploration Phase (Shown BEFORE locking decision) */}
      {!confirmedTopic ? (
        <div className="space-y-6">
          {/* Instructions Notice */}
          <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-900/50 text-blue-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-white">
                تصفح واقرأ الموضوعين الأول والثاني بكامل تفاصيلهما قبل الاختيار:
              </h4>
              <p className="text-blue-300 text-xs leading-relaxed">
                اقرأ نصوص وتمارين كلا الموضوعين، قارن بين التمارين ونقاط القوة لديك، وعندما تحسم قرارك
                اضغط على زر البدء لتشغيل التوقيت الرسمي للامتحان.
              </p>
            </div>
          </div>

          {/* Dual Topic View Switcher */}
          <div className="flex items-center justify-between gap-3 border-b border-theme pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedTopic(1)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTopic === 1
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "bg-surface-soft text-theme-secondary hover:text-theme-text"
                }`}
              >
                معاينة الموضوع الأول ({topic1.exercises.length} تمارين)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTopic(2)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedTopic === 2
                    ? "bg-[var(--color-primary)] text-white shadow-sm"
                    : "bg-surface-soft text-theme-secondary hover:text-theme-text"
                }`}
              >
                معاينة الموضوع الثاني ({topic2.exercises.length} تمارين)
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-xs text-theme-muted">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "split" ? "tab" : "split")}
                className={`px-3 py-1.5 rounded-lg border border-theme text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === "split"
                    ? "bg-card text-[var(--color-primary)]"
                    : "bg-surface-soft text-theme-muted"
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>{viewMode === "split" ? "عرض مفررد" : "عرض جنباً إلى جنب"}</span>
              </button>
            </div>
          </div>

          {/* Render Topics based on viewMode */}
          {viewMode === "split" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>{renderTopicContent(topic1, false)}</div>
              <div>{renderTopicContent(topic2, false)}</div>
            </div>
          ) : (
            <div>{renderTopicContent(selectedTopic === 1 ? topic1 : topic2, false)}</div>
          )}
        </div>
      ) : (
        /* 4. Active Exam Solving Phase (After Topic is Chosen) */
        <div className="space-y-6 animate-fade-in">
          {/* Active Exam Banner */}
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-900/60 text-emerald-200 text-xs sm:text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                أنت الآن تعالج: <strong>الموضوع {confirmedTopic}</strong> — ركز في ورقتك ومسودتك،
                والمؤقت الرسمي يعمل الآن.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDraftPad(!showDraftPad)}
                className="px-3 py-1.5 rounded-xl bg-emerald-800/60 hover:bg-emerald-700/60 text-emerald-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{showDraftPad ? "إخفاء المسودة" : "فتح ورقة المسودة"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm("هل تريد العودة لاستعراض الموضوع الآخر؟ سيتم إيقاف المؤقت.")) {
                    setIsTimerRunning(false);
                    setConfirmedTopic(null);
                  }
                }}
                className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
              >
                تغيير الموضوع
              </button>
            </div>
          </div>

          {/* Interactive Draft / Scratchpad Area */}
          {showDraftPad && (
            <Card className="p-4 border-theme bg-card space-y-2 shadow-clay">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-theme-text flex items-center gap-1.5 font-sans">
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>ورقة المسودة والحل السريع (Brouillon):</span>
                </span>
                <span className="text-[10px] text-theme-muted">
                  ملاحظاتك هنا تحفظ تلقائياً أثناء حلك
                </span>
              </div>
              <textarea
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                placeholder="اكتب هنا القوانين، الأفكار الأساسية، الترتيب المنهجي، أو النتائج الوسيطية..."
                rows={5}
                className="w-full p-3 rounded-xl bg-surface-soft border border-theme text-xs sm:text-sm text-theme-text font-mono placeholder:text-theme-muted focus:outline-hidden focus:border-[var(--color-primary)] transition-all resize-y"
              />
            </Card>
          )}

          {/* Render Active Chosen Topic */}
          <div>{renderTopicContent(activeTopic, true)}</div>

          {/* Finish Exam Button */}
          <div className="p-6 rounded-3xl bg-surface-soft border border-theme text-center space-y-3">
            <h4 className="text-base font-bold text-theme-text font-sans">
              هل أكملت معالجة ورقة الإجابة؟
            </h4>
            <p className="text-xs text-theme-secondary max-w-md mx-auto">
              راجع إجاباتك وسلم التنقيط النموذجي أسفل كل تمرين، ثم اضغط لإنهاء جلسة الاختبار.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setIsExamCompleted(true);
                  alert("أحسنت! تم تسجيل انتهاء جلسة الامتحان التجريبي. راجع سلم التنقيط بعناية لتقييم علامتك.");
                }}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                إنهاء الامتحان وتسجيل الجلسة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
