"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Brain,
  Zap,
  RotateCw,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  Flame,
  Volume2,
  Calendar,
  User,
  BookOpen,
  HelpCircle,
  Timer,
  Clock,
  Shuffle,
  Eye,
} from "lucide-react";
import {
  BAC_HISTORICAL_DATES,
  BAC_PERSONALITIES,
  BAC_TERMS,
  BacDateItem,
  BacPersonalityItem,
  BacTermItem,
} from "@/data/memorization/bac-memorization-data";

type TabMode = "flashcards" | "quiz" | "sudden";
type CategoryFilter = "all" | "dates" | "personalities" | "terms";

interface FlashcardItem {
  id: string;
  type: "date" | "personality" | "term";
  titleFront: string;
  subtitleFront: string;
  badge: string;
  badgeColor: string;
  contentBack: string;
  extraBack?: string;
  hintBack?: string;
}

interface QuizQuestion {
  id: string;
  prompt: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
  categoryName: string;
}

export function MemorizeClient() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabMode>("flashcards");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [selectedUnit, setSelectedUnit] = useState<string>("all");

  // Flashcards State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isQuizTimerActive, setIsQuizTimerActive] = useState(false);

  // Sudden Question Modal / Active Item
  const [activeSuddenQuestion, setActiveSuddenQuestion] = useState<QuizQuestion | null>(null);
  const [suddenAnswered, setSuddenAnswered] = useState(false);
  const [suddenSelectedOpt, setSuddenSelectedOpt] = useState<string | null>(null);

  // Load mastered cards from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bac_memorized_ids");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setMasteredIds(new Set(parsed));
          }
        } catch (e) {
          console.error("Failed to load memorized cards:", e);
        }
      }

      // Check URL parameters for sudden mode or quiz mode
      if (searchParams.get("mode") === "quiz") {
        setActiveTab("quiz");
      } else if (searchParams.get("mode") === "sudden" || searchParams.get("sudden") === "true") {
        setActiveTab("sudden");
        triggerNewSuddenQuestion();
      }
    }
  }, [searchParams]);

  // Save mastered cards to localStorage
  const toggleMastered = (id: string) => {
    setMasteredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("bac_memorized_ids", JSON.stringify(Array.from(next)));
      }
      return next;
    });
  };

  // Convert raw data into uniform flashcard items
  const allCards: FlashcardItem[] = useMemo(() => {
    const cards: FlashcardItem[] = [];

    // Dates
    BAC_HISTORICAL_DATES.forEach((d) => {
      cards.push({
        id: `date_${d.id}`,
        type: "date",
        titleFront: d.dateStr,
        subtitleFront: d.unitNameAr,
        badge: "تاريخ وحدث",
        badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
        contentBack: d.event,
        extraBack: d.context,
        hintBack: d.mnemonic,
      });
    });

    // Personalities
    BAC_PERSONALITIES.forEach((p) => {
      cards.push({
        id: `person_${p.id}`,
        type: "personality",
        titleFront: p.name,
        subtitleFront: `${p.nationality} • ${p.categoryNameAr}`,
        badge: "شخصية تاريخية",
        badgeColor: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
        contentBack: p.role,
        extraBack: p.officialBacDefinition,
        hintBack: `أبرز إنجازاته: ${p.majorActions.slice(0, 2).join(" • ")}`,
      });
    });

    // Terms
    BAC_TERMS.forEach((t) => {
      cards.push({
        id: `term_${t.id}`,
        type: "term",
        titleFront: t.term,
        subtitleFront: t.categoryNameAr,
        badge: "مصطلح ومفهوم",
        badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
        contentBack: t.definition,
        hintBack: `الكلمات المفتاحية في التصحيح: ${t.keyWords.join(" • ")}`,
      });
    });

    return cards;
  }, []);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      if (categoryFilter === "dates" && card.type !== "date") return false;
      if (categoryFilter === "personalities" && card.type !== "personality") return false;
      if (categoryFilter === "terms" && card.type !== "term") return false;
      return true;
    });
  }, [allCards, categoryFilter]);

  // Current Card Safe Bounds
  const currentCard = filteredCards[currentCardIndex] || filteredCards[0];

  const handleNextCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCurrentCardIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  // Generate randomized Speed Quiz Questions
  const generateQuiz = () => {
    const questions: QuizQuestion[] = [];

    // Helper: shuffle array
    const shuffle = <T,>(arr: T[]): T[] => [...arr].sort(() => Math.random() - 0.5);

    // Pick 5 random dates
    const shuffledDates = shuffle(BAC_HISTORICAL_DATES).slice(0, 5);
    shuffledDates.forEach((d) => {
      // Pick 3 wrong date options from other dates
      const wrongOpts = shuffle(
        BAC_HISTORICAL_DATES.filter((other) => other.id !== d.id).map((other) => other.dateStr)
      ).slice(0, 3);
      const allOpts = shuffle([d.dateStr, ...wrongOpts]);

      questions.push({
        id: `q_date_${d.id}`,
        prompt: `ما هو التاريخ الدقيق لحدث: "${d.event}"؟`,
        correctAnswer: d.dateStr,
        options: allOpts,
        explanation: `${d.event} حدث بتاريخ ${d.dateStr}. السياق: ${d.context}`,
        categoryName: "تواريخ البكالوريا",
      });
    });

    // Pick 5 random personalities
    const shuffledPersons = shuffle(BAC_PERSONALITIES).slice(0, 5);
    shuffledPersons.forEach((p) => {
      const wrongOpts = shuffle(
        BAC_PERSONALITIES.filter((other) => other.id !== p.id).map((other) => other.name)
      ).slice(0, 3);
      const allOpts = shuffle([p.name, ...wrongOpts]);

      questions.push({
        id: `q_person_${p.id}`,
        prompt: `من هي الشخصية التاريخية المعروفة بـ: "${p.role}"؟`,
        correctAnswer: p.name,
        options: allOpts,
        explanation: `${p.name}: ${p.officialBacDefinition}`,
        categoryName: "شخصيات البكالوريا",
      });
    });

    const finalQuestions = shuffle(questions);
    setQuizQuestions(finalQuestions);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setQuizFinished(false);
    setTimeLeft(15);
    setIsQuizTimerActive(true);
  };

  // Initialize Quiz on first select
  useEffect(() => {
    if (activeTab === "quiz" && quizQuestions.length === 0) {
      generateQuiz();
    }
  }, [activeTab]);

  // Quiz Countdown Timer
  useEffect(() => {
    let timer: any;
    if (isQuizTimerActive && !isAnswerSubmitted && !quizFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isAnswerSubmitted && isQuizTimerActive) {
      // Time is up! Auto submit as wrong
      handleOptionSubmit(null);
    }

    return () => clearInterval(timer);
  }, [isQuizTimerActive, isAnswerSubmitted, quizFinished, timeLeft]);

  const handleOptionSubmit = (option: string | null) => {
    if (isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    setSelectedOption(option);
    setIsQuizTimerActive(false);

    const currentQ = quizQuestions[currentQuestionIndex];
    if (option && currentQ && option === currentQ.correctAnswer) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setTimeLeft(15);
      setIsQuizTimerActive(true);
    } else {
      setQuizFinished(true);
    }
  };

  // Sudden Question generation
  const triggerNewSuddenQuestion = () => {
    const isDate = Math.random() > 0.5;
    if (isDate) {
      const d = BAC_HISTORICAL_DATES[Math.floor(Math.random() * BAC_HISTORICAL_DATES.length)];
      const otherOpts = BAC_HISTORICAL_DATES.filter((x) => x.id !== d.id)
        .map((x) => x.dateStr)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const allOpts = [d.dateStr, ...otherOpts].sort(() => Math.random() - 0.5);

      setActiveSuddenQuestion({
        id: `sudden_${d.id}`,
        prompt: `سؤال فجائي: ما هو تاريخ "${d.event}"؟`,
        correctAnswer: d.dateStr,
        options: allOpts,
        explanation: `${d.event} كان بتاريخ ${d.dateStr}. (${d.context})`,
        categoryName: "سؤال فجائي • تواريخ",
      });
    } else {
      const p = BAC_PERSONALITIES[Math.floor(Math.random() * BAC_PERSONALITIES.length)];
      const otherOpts = BAC_PERSONALITIES.filter((x) => x.id !== p.id)
        .map((x) => x.name)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const allOpts = [p.name, ...otherOpts].sort(() => Math.random() - 0.5);

      setActiveSuddenQuestion({
        id: `sudden_${p.id}`,
        prompt: `سؤال فجائي: من صاحب التعريف التالي: "${p.role}"؟`,
        correctAnswer: p.name,
        options: allOpts,
        explanation: p.officialBacDefinition,
        categoryName: "سؤال فجائي • شخصيات",
      });
    }
    setSuddenAnswered(false);
    setSuddenSelectedOpt(null);
  };

  // Test push notification trigger
  const handleTriggerPushPing = () => {
    if (typeof window === "undefined") return;
    if ("Notification" in window && Notification.permission === "granted") {
      const randomDate = BAC_HISTORICAL_DATES[Math.floor(Math.random() * BAC_HISTORICAL_DATES.length)];
      const title = "⚡ سؤال فجائي لتنشيط الذاكرة (BAC 2027)";
      const body = `اختبر معلوماتك: متى حدث ${randomDate.event}؟ اضغط للإجابة!`;

      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.showNotification(title, {
            body,
            icon: "/app-icon.svg",
            badge: "/favicon.svg",
            dir: "rtl",
            data: { url: "/memorize?mode=sudden" },
          });
        });
      } else {
        new Notification(title, { body, icon: "/app-icon.svg" });
      }
    } else if ("Notification" in window) {
      Notification.requestPermission();
    }
  };

  return (
    <AppShell activeNav="memorize">
      <Container size="xl" className="py-6 sm:py-10 space-y-6">
        {/* Top Header Card */}
        <Card className="p-6 sm:p-8 rounded-3xl bg-card border-2 border-[var(--color-primary)]/20 shadow-clay flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center font-bold text-2xl shadow-xs">
              🧠
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-theme-text font-serif">
                  لعبة الحفظ الذكية والمسابقات (BAC 2027)
                </h1>
                <Badge variant="outline" size="sm" className="border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10 font-bold text-[10px]">
                  التكرار المتباعد
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-theme-muted max-w-xl">
                احفظ وثبّت جميع التواريخ والشخصيات والمصطلحات الرسمية المقررة في التاريخ والجغرافيا بأسلوب البطاقات الذكية وتحديات السرعة.
              </p>
            </div>
          </div>

          {/* Mastery Counter Stat */}
          <div className="flex items-center gap-4 bg-card-muted/80 p-3 sm:p-4 rounded-2xl border border-theme self-start md:self-auto">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-theme-muted block">
                مكتسباتك المتقنة
              </span>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {masteredIds.size}
                </span>
                <span className="text-xs text-theme-muted">
                  /{allCards.length}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Navigation Tabs Selector */}
        <div className="flex items-center bg-card p-1.5 rounded-3xl border border-theme shadow-clay max-w-xl mx-auto">
          <button
            type="button"
            onClick={() => setActiveTab("flashcards")}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "flashcards"
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "text-theme-muted hover:text-theme-text"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>بطاقات التكرار ({allCards.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("quiz");
              if (quizQuestions.length === 0) generateQuiz();
            }}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "quiz"
                ? "bg-[var(--color-primary)] text-white shadow-xs"
                : "text-theme-muted hover:text-theme-text"
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>تحدي السرعة (10 أسئلة)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("sudden");
              if (!activeSuddenQuestion) triggerNewSuddenQuestion();
            }}
            className={`flex-1 py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "sudden"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-theme-muted hover:text-theme-text"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-200" />
            <span>السؤال الفجائي ⚡</span>
          </button>
        </div>

        {/* ================================================================= */}
        {/* TAB 1: 3D FLASHCARDS MODE (بطاقات التكرار المتباعد)                 */}
        {/* ================================================================= */}
        {activeTab === "flashcards" && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter("all");
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                  categoryFilter === "all"
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-xs"
                    : "bg-card text-theme-muted hover:text-theme-text border-theme"
                }`}
              >
                جميع البطاقات ({allCards.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategoryFilter("dates");
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                  categoryFilter === "dates"
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-card text-theme-muted hover:text-theme-text border-theme"
                }`}
              >
                📅 التواريخ والأحداث ({BAC_HISTORICAL_DATES.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategoryFilter("personalities");
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                  categoryFilter === "personalities"
                    ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                    : "bg-card text-theme-muted hover:text-theme-text border-theme"
                }`}
              >
                👤 الشخصيات التاريخية ({BAC_PERSONALITIES.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategoryFilter("terms");
                  setCurrentCardIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                  categoryFilter === "terms"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-card text-theme-muted hover:text-theme-text border-theme"
                }`}
              >
                📖 المصطلحات والمفاهيم ({BAC_TERMS.length})
              </button>
            </div>

            {/* Main Interactive Flashcard */}
            {currentCard && (
              <div className="relative min-h-[360px] sm:min-h-[400px] flex flex-col justify-between">
                {/* 3D Flippable Card Container */}
                <div
                  onClick={() => setIsFlipped((prev) => !prev)}
                  className={`w-full min-h-[340px] sm:min-h-[380px] p-6 sm:p-10 rounded-3xl border-2 transition-all duration-500 cursor-pointer shadow-clay flex flex-col justify-between relative select-none ${
                    isFlipped
                      ? "bg-gradient-to-br from-card via-card-muted/60 to-card border-[var(--color-primary)]/50"
                      : "bg-card border-theme hover:border-[var(--color-primary)]/40"
                  }`}
                >
                  {/* Card Header Status */}
                  <div className="flex items-center justify-between border-b border-theme pb-4">
                    <Badge variant="outline" size="sm" className={`font-bold ${currentCard.badgeColor}`}>
                      {currentCard.badge}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-theme-muted">
                        {currentCardIndex + 1} / {filteredCards.length}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMastered(currentCard.id);
                        }}
                        className={`p-1.5 rounded-xl border transition-all ${
                          masteredIds.has(currentCard.id)
                            ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/40"
                            : "bg-card text-theme-muted border-theme hover:text-theme-text"
                        }`}
                        title={masteredIds.has(currentCard.id) ? "متقنة" : "تعليم كمتقنة"}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card Main Content */}
                  <div className="py-6 sm:py-10 text-center space-y-4">
                    {!isFlipped ? (
                      /* Front: Prompt / Question */
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-theme-muted block">
                          {currentCard.subtitleFront}
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-black text-theme-text font-serif leading-tight">
                          {currentCard.titleFront}
                        </h2>
                        <div className="pt-4 inline-flex items-center gap-1.5 text-xs text-[var(--color-primary)] font-bold animate-bounce">
                          <Eye className="w-4 h-4" />
                          <span>اضغط على البطاقة لكشف الشرح والنموذج الوزاري</span>
                        </div>
                      </div>
                    ) : (
                      /* Back: Full Answer & Official Definition */
                      <div className="space-y-4 text-start">
                        <div className="text-center pb-2 border-b border-theme">
                          <span className="text-xs font-bold text-[var(--color-primary)]">
                            {currentCard.titleFront}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <h3 className="text-base sm:text-lg font-bold text-theme-text leading-relaxed">
                            {currentCard.contentBack}
                          </h3>

                          {currentCard.extraBack && (
                            <p className="text-xs sm:text-sm text-theme-secondary leading-relaxed bg-card-muted p-3.5 rounded-2xl border border-theme">
                              {currentCard.extraBack}
                            </p>
                          )}

                          {currentCard.hintBack && (
                            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                              <Sparkles className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                              <span>{currentCard.hintBack}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Hint */}
                  <div className="flex items-center justify-between border-t border-theme pt-3 text-[11px] text-theme-muted">
                    <span>
                      {masteredIds.has(currentCard.id) ? "✅ تم وسمها كمعلومة متقنة" : "💡 قيد المذاكرة والتثبيت"}
                    </span>
                    <span className="flex items-center gap-1">
                      <RotateCw className="w-3 h-3" />
                      <span>اقلب البطاقة</span>
                    </span>
                  </div>
                </div>

                {/* Card Controls Bar */}
                <div className="flex items-center justify-between gap-3 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevCard}
                    className="rounded-2xl py-3 px-5 border-theme flex items-center gap-2"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>السابق</span>
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={masteredIds.has(currentCard.id) ? "outline" : "primary"}
                      size="sm"
                      onClick={() => toggleMastered(currentCard.id)}
                      className="rounded-2xl py-3 px-4 font-bold text-xs"
                    >
                      {masteredIds.has(currentCard.id) ? "إلغاء الإتقان" : "أتقنتها بنجاح ✓"}
                    </Button>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleNextCard}
                    className="rounded-2xl py-3 px-5 flex items-center gap-2"
                  >
                    <span>التالي</span>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: SPEED CHALLENGE QUIZ (تحدي السرعة 10 أسئلة)                 */}
        {/* ================================================================= */}
        {activeTab === "quiz" && (
          <div className="max-w-2xl mx-auto space-y-6">
            {!quizFinished && quizQuestions.length > 0 ? (
              <Card className="p-6 sm:p-8 rounded-3xl bg-card border border-theme shadow-clay space-y-6">
                {/* Quiz Header Bar */}
                <div className="flex items-center justify-between border-b border-theme pb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" size="sm" className="font-bold text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                      السؤال {currentQuestionIndex + 1} / {quizQuestions.length}
                    </Badge>
                    <span className="text-xs font-bold text-theme-muted">
                      {quizQuestions[currentQuestionIndex]?.categoryName}
                    </span>
                  </div>

                  {/* Countdown Timer with color indicator */}
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-2xl font-mono font-bold text-xs border ${
                    timeLeft <= 5
                      ? "bg-rose-500/15 text-rose-600 border-rose-500/30 animate-pulse"
                      : "bg-card-muted text-theme-text border-theme"
                  }`}>
                    <Timer className="w-3.5 h-3.5" />
                    <span>{timeLeft} ثانية</span>
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="space-y-2 py-2">
                  <h2 className="text-base sm:text-xl font-black text-theme-text leading-relaxed">
                    {quizQuestions[currentQuestionIndex]?.prompt}
                  </h2>
                </div>

                {/* Multiple Choice Options */}
                <div className="space-y-3">
                  {quizQuestions[currentQuestionIndex]?.options.map((option, idx) => {
                    const isSelected = selectedOption === option;
                    const isCorrect = option === quizQuestions[currentQuestionIndex].correctAnswer;

                    let btnClass = "border-theme bg-card hover:bg-card-muted text-theme-text";
                    if (isAnswerSubmitted) {
                      if (isCorrect) {
                        btnClass = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold";
                      } else if (isSelected && !isCorrect) {
                        btnClass = "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold";
                      } else {
                        btnClass = "opacity-50 border-theme bg-card";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isAnswerSubmitted}
                        onClick={() => handleOptionSubmit(option)}
                        className={`w-full p-4 rounded-2xl border text-start text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${btnClass}`}
                      >
                        <span>{option}</span>
                        {isAnswerSubmitted && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        {isAnswerSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation and Next Button */}
                {isAnswerSubmitted && (
                  <div className="p-4 rounded-2xl bg-card-muted border border-theme space-y-3 animate-fadeIn">
                    <div className="flex items-start gap-2 text-xs leading-relaxed text-theme-secondary">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span>{quizQuestions[currentQuestionIndex]?.explanation}</span>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleNextQuestion}
                      className="w-full font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2"
                    >
                      <span>
                        {currentQuestionIndex + 1 < quizQuestions.length ? "السؤال التالي" : "عرض نتيجتي النهائية"}
                      </span>
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </Card>
            ) : quizFinished ? (
              /* Final Score Card */
              <Card className="p-8 rounded-3xl bg-card border border-theme shadow-clay text-center space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center font-bold text-3xl shadow-xs">
                  🏆
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-theme-text font-serif">
                    اكتمل التحدي بنجاح!
                  </h2>
                  <p className="text-xs text-theme-muted">
                    إليك محصلة نتيجتك في بنك أسئلة الحفظ السريعة:
                  </p>
                </div>

                <div className="py-4">
                  <div className="inline-block p-6 rounded-3xl bg-card-muted border border-theme font-mono">
                    <span className="text-4xl font-black text-[var(--color-primary)]">
                      {quizScore}
                    </span>
                    <span className="text-lg text-theme-muted font-bold"> / {quizQuestions.length}</span>
                  </div>
                </div>

                <p className="text-sm font-bold text-theme-text">
                  {quizScore === 10
                    ? "🎉 مذهل! ذاكرتك خارقة ومعلوماتك جاهزة لامتحان البكالوريا بدرجة امتياز."
                    : quizScore >= 7
                    ? "👏 ممتاز جداً! تقدم رائع، راجع فقط بعض التواريخ الدقيقة."
                    : "💪 بداية جيدة! واصل تكرار البطاقات الذكية لترسيخ التواريخ والشخصيات."}
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={generateQuiz}
                    className="w-full sm:w-auto font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2"
                  >
                    <Shuffle className="w-4 h-4" />
                    <span>تحدي 10 أسئلة جديدة</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("flashcards")}
                    className="w-full sm:w-auto py-3 px-6 rounded-2xl"
                  >
                    <span>العودة لبطاقات الحفظ</span>
                  </Button>
                </div>
              </Card>
            ) : null}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: SUDDEN BRAIN PING (السؤال الفجائي التنشيطي)                  */}
        {/* ================================================================= */}
        {activeTab === "sudden" && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Sudden Mode Explainer Card */}
            <Card className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/25 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                  <Zap className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-amber-900 dark:text-amber-200">
                    ميزة السؤال الفجائي التنشيطي (Flash Brain Ping)
                  </h2>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                    تحديات وتنبيهات مفاجئة تجعل عقلك متيقظاً دائماً وتمنع نسيان التواريخ والشخصيات.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-500/20">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={triggerNewSuddenQuestion}
                  className="text-xs font-bold rounded-xl py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>توليد سؤال فجائي فوري</span>
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTriggerPushPing}
                  className="text-xs rounded-xl py-2.5 px-4 border-amber-500/40 text-amber-900 dark:text-amber-200 hover:bg-amber-500/10 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>إرسال إشعار فجائي لجهازي الآن ⚡</span>
                </Button>
              </div>
            </Card>

            {/* Active Sudden Question Card */}
            {activeSuddenQuestion && (
              <Card className="p-6 sm:p-8 rounded-3xl bg-card border-2 border-amber-500/30 shadow-clay space-y-6">
                <div className="flex items-center justify-between border-b border-theme pb-4">
                  <Badge variant="warning" size="sm" className="font-bold flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-current" />
                    <span>تحدي اللحظة الفجائي</span>
                  </Badge>
                  <span className="text-xs text-theme-muted font-bold">
                    {activeSuddenQuestion.categoryName}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-black text-theme-text leading-relaxed">
                    {activeSuddenQuestion.prompt}
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {activeSuddenQuestion.options.map((option, idx) => {
                    const isSelected = suddenSelectedOpt === option;
                    const isCorrect = option === activeSuddenQuestion.correctAnswer;

                    let btnClass = "border-theme bg-card hover:bg-card-muted text-theme-text";
                    if (suddenAnswered) {
                      if (isCorrect) {
                        btnClass = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold";
                      } else if (isSelected && !isCorrect) {
                        btnClass = "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold";
                      } else {
                        btnClass = "opacity-50 border-theme bg-card";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={suddenAnswered}
                        onClick={() => {
                          setSuddenAnswered(true);
                          setSuddenSelectedOpt(option);
                        }}
                        className={`w-full p-4 rounded-2xl border text-start text-xs sm:text-sm transition-all flex items-center justify-between gap-3 ${btnClass}`}
                      >
                        <span>{option}</span>
                        {suddenAnswered && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        {suddenAnswered && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {suddenAnswered && (
                  <div className="p-4 rounded-2xl bg-card-muted border border-theme space-y-3 animate-fadeIn">
                    <p className="text-xs leading-relaxed text-theme-secondary">
                      {activeSuddenQuestion.explanation}
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={triggerNewSuddenQuestion}
                      className="w-full font-bold py-3 rounded-2xl"
                    >
                      <span>تحدي فجائي آخر ⚡</span>
                    </Button>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </Container>
    </AppShell>
  );
}
