"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Gamepad2,
  Trophy,
  Award,
  Sparkles,
  Puzzle,
  Zap,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Shield,
  Star,
  X,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Share2,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { CampusService } from "@/lib/campus/campus-service";
import { SubjectId } from "@/types/education";
import { PlannerStorage } from "@/lib/planner/storage";
import { formatStudentPrivacyName } from "@/lib/constants/majlis-config";

interface QuizChallenge {
  id: string;
  title: string;
  subjectId: SubjectId;
  subjectLabel: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_CHALLENGES: Record<string, QuizChallenge> = {
  "كويز تفاعلي سريع": {
    id: "q-math-1",
    title: "كويز المتتاليات والتزايد المقارن ⚡",
    subjectId: "math",
    subjectLabel: "رياضيات",
    question: "ما هي نهاية المتتالية (Un) المعرفة بـ: Un = (3n² + 1) / (2n² - 5) عندما يؤول n إلى +∞؟",
    options: ["+∞", "3/2", "0", "غير معينة"],
    correctIndex: 1,
    explanation: "بما أنها دالة ناطقة عند اللانهاية، النهاية هي حاصل قسمة الحدين الأعلى درجة: 3n² / 2n² = 3/2 وفق المنهاج الوزاري.",
  },
  "لغز الرياضيات": {
    id: "q-math-2",
    title: "لغز إزالة حالات عدم التعيين 📐",
    subjectId: "math",
    subjectLabel: "رياضيات",
    question: "لحساب نهاية √(x² + 3) - x عند +∞، ما هي أنجع طريقة لتفادي حالة عدم التعيين (+∞ - ∞)؟",
    options: [
      "الضرب والقسمة على المرافق مباشرة",
      "إخراج x² كعامل مشترك دون مرافق",
      "الاشتقاق المباشر بالعدد المشتق",
      "إهمال الجذر واعتباره x",
    ],
    correctIndex: 0,
    explanation: "بما أن معامل x داخل الجذر يساوي معامل x خارجه (1 = 1)، فإن إخراج العامل المشترك يعطي 0 × ∞، وبالتالي الضرب بالمرافق هو الطريقة الوحيدة الصحيحة.",
  },
  "تحدي القوانين": {
    id: "q-physics-1",
    title: "تحدي التحليل البعدي لثابت الزمن ⚡",
    subjectId: "physics",
    subjectLabel: "فيزياء",
    question: "ما هي الوحدة الدولية لثابت الزمن τ = RC في الدارة الكهربائية لشحن مكثفة؟",
    options: ["الفولت (V)", "الأوم (Ω)", "الثانية (s)", "الفاراد (F)"],
    correctIndex: 2,
    explanation: "من قانون أوم U = R·I وقانون المكثفة I = C·(dU/dt)، نجد أن [R] = [U]/[I] و [C] = [I]·[t]/[U]. بضربهما: [τ] = [t] أي الثانية (s).",
  },
  "حلقة الاسترجاع": {
    id: "q-philo-1",
    title: "حلقة الاسترجاع: أطروحات الفلسفة 🧠",
    subjectId: "philosophy",
    subjectLabel: "فلسفة",
    question: "في مقالة المشكلة والإشكالية، ما هو الموقف الفلسفي الأدق للعلاقة بينهما؟",
    options: [
      "الانفصال التام بين المفهومين",
      "تداخل واحتواء: المشكلة جزء من الإشكالية الأوسع",
      "التطابق التام بحيث لا يوجد أي فرق بينهما",
      "المشكلة هي الإشكالية دون أي تفصيل",
    ],
    correctIndex: 1,
    explanation: "العلاقة بين المشكلة والإشكالية هي علاقة تداخل وتكامل؛ الإشكالية قضية فلسفية كلية تحتوي على مشكلات جزئية.",
  },
};

export function MajlisInteractiveGrid({
  topicTitle = "المتتاليات",
  activeRoomId,
}: {
  topicTitle?: string;
  activeRoomId?: string;
}) {
  const { user } = useAuth();
  const targetRoomId = activeRoomId || "room-sciences-rc";

  // Gamification & Quiz Modal State
  const [activeGameKey, setActiveGameKey] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isErrorRecorded, setIsErrorRecorded] = useState(false);

  // Genuine XP & Study Sessions
  const [studyMinutes, setStudyMinutes] = useState(0);
  const [hasRsvpEvening, setHasRsvpEvening] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(0);

  // Load genuine RSVP status for the target majlis room
  useEffect(() => {
    fetch(`/api/campus/rsvp?roomId=${encodeURIComponent(targetRoomId)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRsvpCount(data.count || 0);
          setHasRsvpEvening(Boolean(data.hasRsvp));
        }
      })
      .catch(() => {});
  }, [user, targetRoomId]);

  // Load genuine study sessions for XP calculation (10 mins = 1 XP)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const effectiveId = user?.id || "demo-user";
        PlannerStorage.loadStudySessions(effectiveId).then((sessions) => {
          const completed = sessions.filter((s: any) => s.status === "COMPLETED");
          const totalSec = completed.reduce((acc: number, s: any) => acc + (s.actualDurationSeconds || 0), 0);
          setStudyMinutes(Math.floor(totalSec / 60));
        }).catch(() => {});
      } catch (e) {
        console.warn("Failed to load study sessions for XP", e);
      }
    }
  }, [user]);

  // Open Quiz Modal
  const handleOpenGame = (gameKey: string) => {
    setActiveGameKey(gameKey);
    setSelectedOption(null);
    setQuizSubmitted(false);
    setIsCorrect(false);
    setIsErrorRecorded(false);
  };

  // Submit Answer & Integrate with Error Lab & Planner
  const handleAnswerSubmit = async () => {
    if (selectedOption === null || !activeGameKey) return;
    const challenge = QUIZ_CHALLENGES[activeGameKey];
    if (!challenge) return;

    const correct = selectedOption === challenge.correctIndex;
    setIsCorrect(correct);
    setQuizSubmitted(true);

    if (correct) {
      setStudyMinutes((prev) => prev + 5); // Award equivalent study time
    } else {
      // Direct Integration with Error Lab & Planner Storage!
      const userId = user?.id || "demo-user";
      try {
        await CampusService.recordMistakeToErrorVault(userId, {
          questionId: challenge.id,
          questionText: challenge.question,
          chosenAnswerText: challenge.options[selectedOption],
          correctAnswerText: challenge.options[challenge.correctIndex],
          explanation: challenge.explanation,
          subjectId: challenge.subjectId,
          topicTitle: topicTitle,
        });
        setIsErrorRecorded(true);
      } catch (err) {
        console.error("Failed to record mistake to error vault:", err);
      }
    }
  };

  const handleToggleRsvp = async () => {
    const next = !hasRsvpEvening;
    setHasRsvpEvening(next);
    setRsvpCount((c) => (next ? c + 1 : Math.max(0, c - 1)));

    try {
      const res = await fetch("/api/campus/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: targetRoomId, willAttend: next }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && typeof data.count === "number") {
          setRsvpCount(data.count);
        }
      }
    } catch (err) {
      console.warn("Failed to toggle RSVP:", err);
    }
  };

  const handleDownloadIcs = () => {
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//SHATER BAC//Majlis Study//AR
BEGIN:VEVENT
SUMMARY:مجلس المساء الرسمي - مراجعة البكالوريا في ديوان العلم
DESCRIPTION:جلسة مذاكرة متزامنة وحل مواضيع رسمية مع الزملاء على منصة الشاطر
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:تذكير: يبدأ مجلس المذاكرة بعد 15 دقيقة
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "shater-evening-majlis.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // XP calculation
  const calculatedXp = Math.floor(studyMinutes / 10);
  const userLevel =
    calculatedXp >= 100
      ? { lvl: 4, title: "أسطورة", nextThreshold: 200, badgeColor: "text-purple-400" }
      : calculatedXp >= 50
      ? { lvl: 3, title: "متفوق", nextThreshold: 100, badgeColor: "text-rose-400" }
      : calculatedXp >= 20
      ? { lvl: 2, title: "قائد", nextThreshold: 50, badgeColor: "text-blue-400" }
      : { lvl: 1, title: "مجتهد", nextThreshold: 20, badgeColor: "text-amber-400" };

  const progressPercent = Math.min(
    100,
    Math.round((calculatedXp / userLevel.nextThreshold) * 100)
  );

  const activeChallenge = activeGameKey ? QUIZ_CHALLENGES[activeGameKey] : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5" dir="rtl">
      {/* ---------------- CARD 1: الملخصات والمواضيع التشاركية ---------------- */}
      <div
        className="rounded-3xl p-5 border border-white/[0.08] shadow-xl backdrop-blur-xl flex flex-col justify-between"
        style={{
          background: "linear-gradient(180deg, rgba(14, 23, 42, 0.95) 0%, rgba(9, 14, 26, 0.98) 100%)",
        }}
      >
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">الملخصات التشاركية</h3>
            </div>
            <Link
              href="/diwan?tab=summaries"
              className="text-[10px] text-emerald-400 hover:underline font-bold flex items-center gap-0.5"
            >
              <span>فتح التبويب</span>
              <ArrowRight className="w-3 h-3 rotate-180" />
            </Link>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3">
            ملخصات مركّزة وفخاخ وزارية شائعة، قابلة للحفظ في المخطط اليومي.
          </p>

          <div className="space-y-2">
            <Link
              href="/diwan?tab=summaries"
              className="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-all block group"
            >
              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors block">
                خريطة ذهنية: إزالة حالات عدم التعيين
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                شعبة رياضيات وعلوم · مادة الرياضيات
              </span>
            </Link>

            <Link
              href="/diwan?tab=summaries"
              className="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-all block group"
            >
              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors block">
                فخ التحليل البعدي لثابت الزمن RC
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                شعبة علوم وتقني رياضي · مادة الفيزياء
              </span>
            </Link>
          </div>
        </div>

        <div className="pt-3 border-t border-white/[0.06] text-center">
          <Link
            href="/diwan?tab=summaries"
            className="text-[11px] text-slate-300 hover:text-white font-bold inline-flex items-center gap-1"
          >
            <span>استعراض كافة الملخصات المركزة</span>
            <ArrowRight className="w-3 h-3 rotate-180" />
          </Link>
        </div>
      </div>

      {/* ---------------- CARD 2: الألعاب والتحديات مع معمل الأخطاء ---------------- */}
      <div
        className="rounded-3xl p-5 border border-white/[0.08] shadow-xl backdrop-blur-xl flex flex-col justify-between"
        style={{
          background: "linear-gradient(180deg, rgba(14, 23, 42, 0.95) 0%, rgba(9, 14, 26, 0.98) 100%)",
        }}
      >
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">الألعاب والتحديات</h3>
            </div>
            <span className="text-[10px] text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
              مربوط بمعمل الأخطاء
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Game 1 */}
            <button
              type="button"
              onClick={() => handleOpenGame("كويز تفاعلي سريع")}
              className="p-3 rounded-2xl bg-gradient-to-br from-blue-600/30 to-indigo-900/40 border border-blue-500/30 hover:border-blue-400 hover:scale-[1.03] transition-all text-center group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-1.5 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block">كويز سريع ⚡</span>
            </button>

            {/* Game 2 */}
            <button
              type="button"
              onClick={() => handleOpenGame("لغز الرياضيات")}
              className="p-3 rounded-2xl bg-gradient-to-br from-emerald-600/30 to-teal-900/40 border border-emerald-500/30 hover:border-emerald-400 hover:scale-[1.03] transition-all text-center group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-1.5 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Puzzle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block">لغز الرياضيات 📐</span>
            </button>

            {/* Game 3 */}
            <button
              type="button"
              onClick={() => handleOpenGame("تحدي القوانين")}
              className="p-3 rounded-2xl bg-gradient-to-br from-amber-600/30 to-orange-900/40 border border-amber-500/30 hover:border-amber-400 hover:scale-[1.03] transition-all text-center group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-1.5 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block">تحدي القوانين 🏆</span>
            </button>

            {/* Game 4 */}
            <button
              type="button"
              onClick={() => handleOpenGame("حلقة الاسترجاع")}
              className="p-3 rounded-2xl bg-gradient-to-br from-purple-600/30 to-pink-900/40 border border-purple-500/30 hover:border-purple-400 hover:scale-[1.03] transition-all text-center group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-1.5 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block">حلقة الاسترجاع 🧠</span>
            </button>
          </div>
        </div>

        <div className="mt-3 text-center">
          <span className="text-[10px] text-amber-400/90 font-mono">
            الأخطاء في التحديات تُرحّل تلقائياً لمعمل الأخطاء لترميمها 🎯
          </span>
        </div>
      </div>

      {/* ---------------- CARD 3: المجلس الرسمي المجدول اليوم (Genuine Scheduled Table) ---------------- */}
      <div
        className="rounded-3xl p-5 border border-white/[0.08] shadow-xl backdrop-blur-xl flex flex-col justify-between"
        style={{
          background: "linear-gradient(180deg, rgba(14, 23, 42, 0.95) 0%, rgba(9, 14, 26, 0.98) 100%)",
        }}
      >
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">المجلس الرسمي المجدول</h3>
            </div>
            <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              يبدأ 20:00 (توقيت الجزائر)
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2">
            <span className="text-xs font-bold text-white block">
              مجلس المساء: مراجعة الدارة RC وحل مسائل البكالوريا
            </span>
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-mono">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>20:00 – 21:30 (توقيت الجزائر)</span>
              </div>
              <span className="text-emerald-400 font-bold">
                {rsvpCount} مسجلون للحضور
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 pt-3 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={handleToggleRsvp}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              hasRsvpEvening
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{hasRsvpEvening ? "تم تأكيد حضورك ✋" : "سأحضر هذا المجلس ✋"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadIcs}
            className="w-full py-1.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-300 text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3 h-3 text-blue-400" />
            <span>أضف للتقويم (.ics)</span>
          </button>
        </div>
      </div>

      {/* ---------------- CARD 4: الرتب وساعات التركيز الحقيقية ---------------- */}
      <div
        className="rounded-3xl p-5 border border-white/[0.08] shadow-xl backdrop-blur-xl flex flex-col justify-between"
        style={{
          background: "linear-gradient(180deg, rgba(14, 23, 42, 0.95) 0%, rgba(9, 14, 26, 0.98) 100%)",
        }}
      >
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">مستوى التركيز</h3>
            </div>
            <span className="text-[10px] text-slate-400">بيانات حقيقية</span>
          </div>

          {/* Student Profile Card with Real XP */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-white block">
                  {formatStudentPrivacyName(user?.user_metadata?.full_name || user?.email)}
                </span>
                <span className={`text-[10px] font-bold font-mono ${userLevel.badgeColor}`}>
                  المستوى {userLevel.lvl} · {userLevel.title}
                </span>
              </div>
              <div className="text-left font-mono">
                <span className="text-xs font-bold text-white">{calculatedXp} XP</span>
                <span className="text-[10px] text-slate-400 block">{studyMinutes} دقيقة</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* 4 True Tiers */}
          <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
            <div
              className={`p-1.5 rounded-xl border text-[10px] font-bold ${
                userLevel.lvl >= 1
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                  : "bg-white/[0.02] border-white/5 text-slate-500 opacity-40"
              }`}
            >
              <Shield className="w-4 h-4 mx-auto mb-0.5 text-amber-400" />
              <span>مجتهد</span>
            </div>

            <div
              className={`p-1.5 rounded-xl border text-[10px] font-bold ${
                userLevel.lvl >= 2
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                  : "bg-white/[0.02] border-white/5 text-slate-500 opacity-40"
              }`}
            >
              <Star className="w-4 h-4 mx-auto mb-0.5 text-blue-400" />
              <span>قائد</span>
            </div>

            <div
              className={`p-1.5 rounded-xl border text-[10px] font-bold ${
                userLevel.lvl >= 3
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                  : "bg-white/[0.02] border-white/5 text-slate-500 opacity-40"
              }`}
            >
              <Trophy className="w-4 h-4 mx-auto mb-0.5 text-rose-400" />
              <span>متفوق</span>
            </div>

            <div
              className={`p-1.5 rounded-xl border text-[10px] font-bold ${
                userLevel.lvl >= 4
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-300"
                  : "bg-white/[0.02] border-white/5 text-slate-500 opacity-40"
              }`}
            >
              <Award className="w-4 h-4 mx-auto mb-0.5 text-purple-400" />
              <span>أسطورة</span>
            </div>
          </div>
        </div>

        <div className="mt-3 text-center">
          <span className="text-[10px] text-slate-400 font-mono">
            كل 10 دقائق مذاكرة في الديوان = 1 نقطة خبرة (XP) 🌟
          </span>
        </div>
      </div>

      {/* ---------------- INTERACTIVE QUIZ MODAL ---------------- */}
      {activeGameKey && activeChallenge && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl text-right animate-in zoom-in-95 duration-200"
            style={{
              background: "linear-gradient(180deg, #0B1222 0%, #070B14 100%)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {activeChallenge.title}
                  </h3>
                  <span className="text-[10px] text-purple-300 font-mono">
                    مادة: {activeChallenge.subjectLabel}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveGameKey(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Question Text */}
            <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>سؤال التحدي التفاعلي:</span>
              </div>
              <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                {activeChallenge.question}
              </p>
            </div>

            {/* Options */}
            <div className="space-y-2 mt-4">
              {activeChallenge.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                let btnStyle = "bg-white/[0.04] text-slate-200 border-white/[0.08] hover:bg-white/[0.08]";

                if (quizSubmitted) {
                  if (idx === activeChallenge.correctIndex) {
                    btnStyle = "bg-emerald-600/30 text-emerald-300 border-emerald-500/50 font-bold";
                  } else if (isSelected && !isCorrect) {
                    btnStyle = "bg-rose-600/30 text-rose-300 border-rose-500/50 font-bold";
                  } else {
                    btnStyle = "opacity-40 bg-white/[0.02] text-slate-400 border-transparent";
                  }
                } else if (isSelected) {
                  btnStyle = "bg-blue-600/30 text-blue-200 border-blue-500/60 font-bold";
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={quizSubmitted}
                    onClick={() => setSelectedOption(idx)}
                    className={`w-full p-3 rounded-2xl border text-right text-xs transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                  >
                    <span>{option}</span>
                    <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center font-mono text-[11px] shrink-0 mr-2">
                      {String.fromCharCode(65 + idx)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Result & Explanation */}
            {quizSubmitted && (
              <div className="mt-4 space-y-3 animate-in fade-in duration-200">
                {isCorrect ? (
                  <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold block">إجابة صحيحة وفق المنهاج الوزاري! 🎉</span>
                      <span className="text-[11px] text-emerald-200">+5 دقائق خبرة تركيز لرصيدك.</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                      <span className="font-bold text-rose-300">
                        إجابة خاطئة! فخ وزاري شائع ⚠️
                      </span>
                    </div>
                    {isErrorRecorded && (
                      <p className="text-[11px] text-amber-300 font-medium">
                        ✅ تم حفظ هذا السؤال تلقائياً في <strong>معمل الأخطاء</strong> وبرمجته للمراجعة في <strong>مخططك الدراسي</strong>!
                      </p>
                    )}
                  </div>
                )}

                {/* Explanation */}
                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs space-y-1">
                  <span className="font-bold text-slate-300 block">شرح وتوجيه سلم التصحيح:</span>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {activeChallenge.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 mt-4 border-t border-white/[0.08] flex items-center gap-2">
              {!quizSubmitted ? (
                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleAnswerSubmit}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
                    selectedOption !== null
                      ? "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg shadow-blue-500/25"
                      : "bg-white/10 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  تأكيد الإجابة
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveGameKey(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs cursor-pointer"
                >
                  إغلاق التحدي
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
