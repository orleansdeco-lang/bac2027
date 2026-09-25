"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  MessageSquare,
  Gamepad2,
  Trophy,
  Award,
  Send,
  Sparkles,
  Heart,
  MessageCircle,
  Puzzle,
  Zap,
  HelpCircle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Flame,
  Shield,
  Star,
  AlertTriangle,
  X,
  Smile,
  BookOpen,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { CampusService } from "@/lib/campus/campus-service";
import { SubjectId } from "@/types/education";

interface ChatMessage {
  id: string;
  author: string;
  avatar: string;
  streamBadge: string;
  text: string;
  time: string;
  isMe: boolean;
}

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

const QUICK_EMOJIS = ["🔥", "💡", "👏", "☕", "✅"];
const QUICK_PROMPTS = [
  "سؤال في سلم التنقيط 📝",
  "استراحة 5 دقائق ☕",
  "من يراجع معي هذا التمرين؟ 🤔",
];

export function MajlisInteractiveGrid({ topicTitle = "المتتاليات" }: { topicTitle?: string }) {
  const { user } = useAuth();
  const chatStorageKey = `shater_majlis_chat_${topicTitle}`;

  // Live Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Gamification & Quiz Modal State
  const [activeGameKey, setActiveGameKey] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isErrorRecorded, setIsErrorRecorded] = useState(false);
  const [userXp, setUserXp] = useState(750);

  // Initialize or load chat
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(chatStorageKey);
        if (saved) {
          setMessages(JSON.parse(saved));
          return;
        }
      } catch (e) {
        console.warn("Failed to read chat messages", e);
      }

      // Seed authentic messages
      const defaultChat: ChatMessage[] = [
        {
          id: "msg-1",
          author: "أمين",
          avatar: "/illustrations/characters/yassine.jpg",
          streamBadge: "رياضيات",
          text: "السلام عليكم زملائي! من وصل للسؤال الثالث في دراسة اتجاه التغير؟",
          time: "14:20",
          isMe: false,
        },
        {
          id: "msg-2",
          author: "سارة",
          avatar: "/illustrations/characters/sarah.jpg",
          streamBadge: "علوم تجريبية",
          text: "أنا درسته بالتراجع أولاً، وخرجت المتتالية متزايدة تماماً ومحدودة بالعدد 2.",
          time: "14:23",
          isMe: false,
        },
        {
          id: "msg-3",
          author: "علي",
          avatar: "/illustrations/characters/ali.jpg",
          streamBadge: "فيزياء",
          text: "ممتاز! لا تنسوا تطبيق نظرية التقارب: كل متتالية متزايدة ومحدودة من الأعلى فهي متقاربة.",
          time: "14:26",
          isMe: false,
        },
      ];
      setMessages(defaultChat);
      localStorage.setItem(chatStorageKey, JSON.stringify(defaultChat));
    }
  }, [chatStorageKey]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const content = (textToSend || inputMessage).trim();
    if (!content) return;

    const myName = user?.email?.split("@")[0] || "طالب بكالوريا";
    const newMsg: ChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
      author: `${myName} (أنت)`,
      avatar: "/illustrations/characters/ali.jpg",
      streamBadge: "أنت 🌟",
      text: content,
      time: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    if (!textToSend) setInputMessage("");

    if (typeof window !== "undefined") {
      localStorage.setItem(chatStorageKey, JSON.stringify(updated));
    }
  };

  const handleSendPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handleSendEmoji = (emoji: string) => {
    handleSendMessage(emoji);
  };

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
      setUserXp((prev) => prev + 50);
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

  const activeChallenge = activeGameKey ? QUIZ_CHALLENGES[activeGameKey] : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5" dir="rtl">
      {/* ---------------- CARD 1: المنتديات ---------------- */}
      <div
        className="rounded-3xl p-5 border border-white/[0.08] shadow-xl backdrop-blur-xl flex flex-col justify-between"
        style={{
          background: "linear-gradient(180deg, rgba(14, 23, 42, 0.95) 0%, rgba(9, 14, 26, 0.98) 100%)",
        }}
      >
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white">المنتديات</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">منتديات النقاش</span>
          </div>

          <div className="space-y-2.5">
            <div className="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-all cursor-pointer group">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                  أفضل طريقة لحل المتتاليات؟
                </span>
                <span className="text-[10px] text-emerald-400 shrink-0 font-mono">جديد</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 font-mono">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-slate-500" /> 56 رد
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-500" /> 190 إعجاب
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-all cursor-pointer group">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                  مراجعة مادة الفيزياء (الدارة RC)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 font-mono">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-slate-500" /> 124 رد
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-500" /> 184 إعجاب
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-all cursor-pointer group">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                  نصائح لاجتياز البكالوريا بتفوق
                </span>
                <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              </div>
              <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-2 font-mono">
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-slate-500" /> 89 رد
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-rose-500" /> 299 إعجاب
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-3">
          <span className="text-[10px] text-slate-400 block text-center">
            تفاعل مع أكثر من 14,000 طالب بكالوريا 🌟
          </span>
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
              تفاعلي + معمل الأخطاء
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Game 1: كويز سريع */}
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

            {/* Game 2: لغز الرياضيات */}
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

            {/* Game 3: تحدي القوانين */}
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

            {/* Game 4: حلقة الاسترجاع */}
            <button
              type="button"
              onClick={() => handleOpenGame("حلقة الاسترجاع")}
              className="p-3 rounded-2xl bg-gradient-to-br from-purple-600/30 to-pink-900/40 border border-purple-500/30 hover:border-purple-400 hover:scale-[1.03] transition-all text-center group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-1.5 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Brain className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block">حلقة الاسترجاع 🧠</span>
            </button>
          </div>
        </div>

        <div className="mt-3 text-center">
          <span className="text-[10px] text-amber-400/90 font-mono">
            +50 نقطة خبرة لكل تحدٍ مكتمل 🌟 والأخطاء تذهب لمعمل الأخطاء!
          </span>
        </div>
      </div>

      {/* ---------------- CARD 3: شات المجلس الحي (Functional Live Chat) ---------------- */}
      <div
        className="rounded-3xl p-5 border border-white/[0.08] shadow-xl backdrop-blur-xl flex flex-col justify-between"
        style={{
          background: "linear-gradient(180deg, rgba(14, 23, 42, 0.95) 0%, rgba(9, 14, 26, 0.98) 100%)",
        }}
      >
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">شات المجلس الحي</h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>مباشر</span>
            </span>
          </div>

          {/* Quick Prompt Chips */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-2">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendPrompt(prompt)}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06] whitespace-nowrap cursor-pointer transition-colors shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div className="space-y-2 max-h-[160px] overflow-y-auto no-scrollbar pr-0.5 mt-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-2 rounded-2xl text-xs transition-all ${
                  m.isMe
                    ? "bg-blue-600/25 border border-blue-500/40 mr-4"
                    : "bg-white/[0.04] border border-white/[0.06] ml-4"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-200">{m.author}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-medium">
                      {m.streamBadge}
                    </span>
                  </div>
                  <span className="font-mono text-slate-400">{m.time}</span>
                </div>
                <p className="text-slate-100 text-[11px] leading-relaxed font-normal">
                  {m.text}
                </p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar & Emojis */}
        <div className="mt-3 space-y-2">
          {/* Emojis row */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-slate-400">تفاعل سريع:</span>
            <div className="flex items-center gap-1.5">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleSendEmoji(emoji)}
                  className="hover:scale-125 transition-transform text-xs cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-1.5"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="اكتب سؤالاً أو فكرة لزملائك..."
              className="flex-1 py-1.5 px-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shrink-0"
              title="إرسال"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ---------------- CARD 4: نظام النقاط والمستويات ---------------- */}
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
              <h3 className="text-sm font-bold text-white">نظام النقاط والمستويات</h3>
            </div>
            <span className="text-[10px] text-amber-400 font-bold">طوّر مستواك</span>
          </div>

          <p className="text-[11px] text-slate-400 mb-3">
            اجمع النقاط وارتقِ في المستويات لتحصل على أوسمة الشرف
          </p>

          {/* Student Profile Card */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-amber-400 shrink-0">
                  <Image
                    src="/illustrations/characters/ali.jpg"
                    alt="الملف الشخصي"
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {user?.email?.split("@")[0] || "طالب بكالوريا"}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">
                    المستوى 3 · مجتهد
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-300">
                {userXp} / 1000 XP
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-300"
                style={{ width: `${Math.min(100, (userXp / 1000) * 100)}%` }}
              />
            </div>
          </div>

          {/* 4 Metallic Badges */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            <div className="flex flex-col items-center text-center p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Shield className="w-5 h-5 text-amber-500 mb-0.5" />
              <span className="text-[10px] font-bold text-amber-300">مجتهد</span>
            </div>

            <div className="flex flex-col items-center text-center p-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Star className="w-5 h-5 text-blue-400 mb-0.5" />
              <span className="text-[10px] font-bold text-blue-300">قائد</span>
            </div>

            <div className="flex flex-col items-center text-center p-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <Trophy className="w-5 h-5 text-rose-400 mb-0.5" />
              <span className="text-[10px] font-bold text-rose-300">متفوق</span>
            </div>

            <div className="flex flex-col items-center text-center p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 opacity-60">
              <Shield className="w-5 h-5 text-purple-400 mb-0.5" />
              <span className="text-[10px] font-bold text-purple-300">أسطورة</span>
            </div>
          </div>
        </div>

        <div className="mt-3 text-center">
          <span className="text-[10px] text-slate-400 font-mono">
            متبقي {Math.max(0, 1000 - userXp)} نقطة للوصول إلى المستوى 4 🚀
          </span>
        </div>
      </div>

      {/* ---------------- INTERACTIVE GAME / QUIZ MODAL WITH ERROR LAB SYNC ---------------- */}
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
                      <span className="text-[11px] text-emerald-200">+50 نقطة خبرة لرصيدك على الطاولة.</span>
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
                        ✅ تم حفظ هذا السؤال تلقائياً في <strong>معمل الأخطاء</strong> وبرمجة جلسة مراجعة متباعدة له في <strong>مخططك الدراسي</strong>!
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

function Brain(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
      <path d="M17.599 6.5a3 3 0 0 0 .399-1.375" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M19.938 10.5a4 4 0 0 1 .585.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M19.967 17.484A4 4 0 0 1 18 18" />
    </svg>
  );
}
