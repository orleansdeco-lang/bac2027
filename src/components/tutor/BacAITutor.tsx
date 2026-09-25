"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Bot,
  Send,
  Zap,
  CheckCircle2,
  Clock,
  BookOpen,
  HelpCircle,
  RotateCcw,
  Plus,
  Flame,
  Lightbulb,
  GraduationCap,
  Brain,
  FileCheck,
  Search,
  Settings,
  ChevronDown,
  X,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Target,
  FileText,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { ChatMessage, TutorMode, TutorTask } from "@/types/tutor";
import { TutorClient } from "@/lib/tutor/tutor-client";
import { useAuth } from "@/lib/auth/context";
import { useTranslation } from "@/lib/i18n/context";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MathRenderer } from "@/components/ui/MathRenderer";
import { getStrategicProfile, getRegistrationDraft } from "@/lib/onboarding/profile";

interface BacAITutorProps {
  isDrawer?: boolean;
  onClose?: () => void;
  initialLessonContext?: string;
  className?: string;
}

const STREAM_OPTIONS = [
  { id: "sciences_exp", label: "علوم تجريبية" },
  { id: "math", label: "رياضيات" },
  { id: "technique_math", label: "تقني رياضي" },
  { id: "lettres_philo", label: "آداب وفلسفة" },
  { id: "gestion_eco", label: "تسيير واقتصاد" },
  { id: "langues", label: "لغات أجنبية" },
];

const TUTOR_MODES: { id: TutorMode; label: string; icon: any; desc: string; color: string }[] = [
  {
    id: "explain",
    label: "اشرحلي درس",
    icon: GraduationCap,
    desc: "شرح سقراطي مبسط خطوة بخطوة مع فحص الفهم",
    color: "from-blue-500/20 to-indigo-500/20 text-blue-500 border-blue-500/30",
  },
  {
    id: "recite",
    label: "التسميع الذكي",
    icon: Brain,
    desc: "اختبار فوري في التواريخ، المصطلحات، والشريعة",
    color: "from-purple-500/20 to-pink-500/20 text-purple-500 border-purple-500/30",
  },
  {
    id: "task",
    label: "مهمة لليوم",
    icon: Target,
    desc: "تعيين تمرين موجه وإضافته لمهام الحسم (3 Must-Win)",
    color: "from-amber-500/20 to-orange-500/20 text-amber-500 border-amber-500/30",
  },
  {
    id: "methodology",
    label: "دربني على المنهجية",
    icon: FileCheck,
    desc: "أسرار شبكة التقويم الوزارية (علوم، فلسفة)",
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/30",
  },
  {
    id: "feynman",
    label: "تقنية فاينمان",
    icon: Lightbulb,
    desc: "اشرحلي فكرة ونقيّمك بكشف الثغرات",
    color: "from-rose-500/20 to-amber-500/20 text-rose-500 border-rose-500/30",
  },
  {
    id: "quiz",
    label: "كويز سريع ⚡",
    icon: Zap,
    desc: "3 أسئلة حاسمة من روح مواضيع البكالوريا",
    color: "from-cyan-500/20 to-blue-500/20 text-cyan-500 border-cyan-500/30",
  },
];

const QUICK_PROMPTS_BY_STREAM: Record<string, string[]> = {
  sciences_exp: [
    "اشرحلي آليات تركيب البروتين (الاستنساخ والترجمة)",
    "كيف أفرّق في العلوم بين فعل حلل وفعل فسر في الاستدلال العلمي؟",
    "سمّعلي تواريخ الوحدة الأولى في التاريخ (1945-1953)",
    "اشرحلي المعادلة التفاضلية لدارة RC في الفيزياء",
    "أعطني مهمة حسم لليوم في الدوال الأسية",
  ],
  math: [
    "اشرحلي التزايد المقارن وكيفية إزالة حالات عدم التعيين",
    "كيف أحل مسألة المتتاليات المركبة بالبرهان بالتراجع؟",
    "أعطني مهمة حسم لليوم من بكالوريا سابقة",
    "سمّعلي مقاصد الشريعة الإسلامية وترتيبها",
    "دربني على منهجية كتابة مقالة فلسفية جدلية",
  ],
  technique_math: [
    "اشرحلي دارة RC وRL والتحليل البعدي لثابت الزمن",
    "أعطني تمرين بكالوريا في الهندسة الكهربائية / الميكانيكية",
    "سمّعلي مصطلحات الجغرافيا (الميزان التجاري، التكتل، القطب)",
    "كيف أتجنب أخطاء الإشارة في الدوال اللوغاريتمية؟",
  ],
  lettres_philo: [
    "ما الفرق الدقيق بين المشكلة والإشكالية في مقالة المقارنة؟",
    "سمّعلي تواريخ الثورة التحريرية الجزائرية (1954-1962)",
    "اشرحلي خطوات الاستقصاء بالوضع وكيفية الدفاع عن الأطروحة",
    "سمّعلي أحكام العقل ومقاصد الشريعة في العلوم الإسلامية",
    "أعطني مهمة حسم لليوم في الفلسفة",
  ],
  gestion_eco: [
    "اشرحلي الفرق بين المحاسبة التحليلية والمحاسبة العامة",
    "سمّعلي مصطلحات الاقتصاد (التضخم، السوق، البنك المركزي)",
    "كيف أحل مسألة اهتلاك القروض واستهلاك رؤوس الأموال؟",
    "أعطني مهمة حسم لليوم في التسيير المالي والمحاسبي",
  ],
  langues: [
    "Comment réussir le compte rendu objectif en Français ?",
    "سمّعلي تواريخ الحرب الباردة والأزمات الدولية",
    "How to write an argumentative essay for English Bac?",
    "أعطني مهمة حسم لليوم في اللغات",
  ],
};

export function BacAITutor({
  isDrawer = false,
  onClose,
  initialLessonContext,
  className = "",
}: BacAITutorProps) {
  const { user } = useAuth();
  const effectiveUserId = user?.id || "anonymous-student";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedMode, setSelectedMode] = useState<TutorMode>("explain");
  const [selectedStream, setSelectedStream] = useState<string>("sciences_exp");
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize stream and cached messages
  useEffect(() => {
    const profile = user?.id ? getStrategicProfile(user.id) : null;
    const regDraft = user?.id ? getRegistrationDraft(user.id) : null;
    const stream = profile?.streamId || (regDraft as any)?.streamId || "sciences_exp";
    setSelectedStream(stream);

    setCustomApiKey(TutorClient.getStoredApiKey());

    const saved = TutorClient.loadChatHistory();
    if (saved.length > 0) {
      setMessages(saved);
    } else {
      // Welcome initial message
      const initialWelcome: ChatMessage = {
        id: "msg-welcome",
        role: "assistant",
        content: `### 🎓 مرحباً بك يا بطل في فضاء **"الأستاذ الذكي"**!

أنا أستاذك المرافق لتحقيق أعلى المعدلات في شهادة البكالوريا الجزائرية. أسلوبي معك **سقراطي وتفاعلي**: نبسّط المفاهيم خطوة بخطوة، نختبر استيعابك فورياً، ونعالج أي ثغرة قبل يوم الامتحان.

اختر أحد الأنماط بالأعلى أو اكتب سؤالك مباشرة:
- 🎓 **اشرحلي درس:** لتفكيك أصعب المفاهيم برياضيات وفيزياء وعلوم مبسطة.
- 🧠 **التسميع الذكي:** لاختبار حفظك في التواريخ، المصطلحات، والشريعة بالكلمات المفتاحية الوزارية.
- 📝 **مهمة لليوم:** لتحديد تمرين حاسم وإضافته لمهام الحسم (3 Must-Win Tasks).
- 🔍 **المنهجية:** لضبط معايير الإجابة النموذجية وسلم التنقيط.

👉 **عن أي موضوع أو درس تريد أن نبدأ الآن؟**`,
        timestamp: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }),
        mode: "general",
      };
      setMessages([initialWelcome]);
    }
  }, [user]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || input).trim();
    if (!content || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }),
      mode: selectedMode,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await TutorClient.sendMessage({
        messages: newMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        mode: selectedMode,
        streamId: selectedStream,
        lessonContext: initialLessonContext,
        clientApiKey: customApiKey,
      });

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.reply,
        timestamp: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }),
        mode: response.mode || selectedMode,
        suggestedTask: response.suggestedTask,
      };

      const finalMessages = [...newMessages, assistantMessage];
      setMessages(finalMessages);
      TutorClient.saveChatHistory(finalMessages);
    } catch (err: any) {
      console.error("Failed to get tutor reply:", err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "⚠️ حدث خطأ أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى أو التحقق من اتصالك بالإنترنت.",
        timestamp: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTaskToMustWin = async (task: TutorTask, messageId: string) => {
    const success = await TutorClient.pushTaskToMustWin(effectiveUserId, task);
    if (success) {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, taskAdded: true } : m))
      );
      showToast(`تمت إضافة "${task.title}" بنجاح إلى مهام الحسم لليوم (3 Must-Win) 🎯`);
    } else {
      showToast("تعذر إضافة المهمة، يرجى المحاولة مرة أخرى");
    }
  };

  const handleClearHistory = () => {
    TutorClient.clearChatHistory();
    setMessages([]);
    showToast("تم مسح سجل المحادثة بنجاح");
  };

  const handleSaveApiKey = () => {
    TutorClient.setStoredApiKey(customApiKey);
    setIsSettingsOpen(false);
    showToast("تم حفظ إعدادات المفتاح بنجاح ✓");
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = QUICK_PROMPTS_BY_STREAM[selectedStream] || QUICK_PROMPTS_BY_STREAM["sciences_exp"];

  return (
    <div
      className={`flex flex-col bg-surface border border-theme shadow-2xl overflow-hidden rounded-3xl ${
        isDrawer ? "h-full w-full" : "min-h-[750px] max-w-5xl mx-auto my-4 sm:my-6"
      } ${className}`}
      dir="rtl"
    >
      {/* ========================================================================= */}
      {/* 1. TOP HEADER                                                             */}
      {/* ========================================================================= */}
      <div className="p-4 sm:p-5 border-b border-theme bg-surface-elevated/70 backdrop-blur-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Bot className="w-6 h-6" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-surface rounded-full animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-theme-text font-sans">
                الأستاذ الذكي 🤖
              </h2>
              <Badge variant="primary" size="sm" className="font-mono text-[10px] bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30">
                Socratic AI BAC
              </Badge>
            </div>
            <p className="text-[11px] text-theme-muted hidden sm:block">
              المدرب البيداغوجي لشهادة البكالوريا — تعليم سقراطي، تسميع ذكي، وتكليف بالمهام
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Stream Selector */}
          <select
            value={selectedStream}
            onChange={(e) => setSelectedStream(e.target.value)}
            className="bg-surface border border-theme rounded-xl px-2.5 py-1.5 text-xs text-theme-text font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {STREAM_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Settings button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="w-8 h-8 rounded-xl bg-surface border border-theme text-theme-muted hover:text-theme-text flex items-center justify-center transition-all hover:bg-surface-elevated"
            title="إعدادات المفتاح والمحرك"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Clear history */}
          <button
            type="button"
            onClick={handleClearHistory}
            className="w-8 h-8 rounded-xl bg-surface border border-theme text-theme-muted hover:text-rose-500 flex items-center justify-center transition-all hover:bg-surface-elevated"
            title="مسح المحادثة"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Close if in drawer */}
          {isDrawer && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-surface border border-theme text-theme-muted hover:text-theme-text flex items-center justify-center transition-all hover:bg-surface-elevated"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MODE SELECTOR CHIPS                                                    */}
      {/* ========================================================================= */}
      <div className="px-4 py-2.5 bg-surface-soft/40 border-b border-theme/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[11px] font-bold text-theme-muted shrink-0">النمط:</span>
        {TUTOR_MODES.map((m) => {
          const Icon = m.icon;
          const isSelected = selectedMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMode(m.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                isSelected
                  ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20"
                  : "bg-surface border-theme text-theme-secondary hover:text-theme-text hover:bg-surface-elevated"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. CHAT MESSAGES SCROLL AREA                                              */}
      {/* ========================================================================= */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 bg-canvas/30">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? "items-start" : "items-end"} gap-1.5 max-w-3xl ${
                isUser ? "mr-auto" : "ml-auto"
              }`}
            >
              {/* Message Header */}
              <div className="flex items-center gap-2 px-1 text-[11px] text-theme-muted">
                {isUser ? (
                  <>
                    <span className="font-bold text-theme-text">أنت</span>
                    <span>• {msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold text-purple-600 dark:text-purple-400">الأستاذ الذكي</span>
                    {msg.mode && (
                      <Badge variant="outline" size="sm" className="text-[10px] py-0 px-1.5">
                        {TUTOR_MODES.find((m) => m.id === msg.mode)?.label || msg.mode}
                      </Badge>
                    )}
                    <span>• {msg.timestamp}</span>
                  </>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`relative p-4 sm:p-5 rounded-3xl transition-all leading-relaxed ${
                  isUser
                    ? "bg-[var(--color-primary)] text-white rounded-tr-sm shadow-md"
                    : "bg-card border border-theme text-theme-text rounded-tl-sm shadow-sm"
                }`}
              >
                {/* Content with Markdown & Math Rendering */}
                {isUser ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
                ) : (
                  <MathRenderer content={msg.content} className="text-sm" />
                )}

                {/* Suggested Task Action Card */}
                {!isUser && msg.suggestedTask && (
                  <div className="mt-4 pt-3.5 border-t border-theme-border/60">
                    <Card className="p-4 border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-surface to-amber-500/5 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                            📝
                          </span>
                          <div>
                            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">
                              مهمة دراسية مقترحة لليوم (Must-Win)
                            </span>
                            <h4 className="font-black text-xs sm:text-sm text-theme-text">
                              {msg.suggestedTask.title}
                            </h4>
                          </div>
                        </div>

                        <Badge variant="warning" size="sm" className="font-mono text-xs shrink-0">
                          <Clock className="w-3 h-3 ml-1 inline" />
                          {msg.suggestedTask.minutes} دقيقة
                        </Badge>
                      </div>

                      {msg.suggestedTask.reason && (
                        <p className="text-xs text-theme-secondary bg-surface-soft/60 p-2.5 rounded-xl border border-theme/40 leading-relaxed">
                          🎯 <strong>الهدف:</strong> {msg.suggestedTask.reason}
                        </p>
                      )}

                      <div className="flex items-center justify-end pt-1">
                        <Button
                          size="sm"
                          variant={msg.taskAdded ? "ghost" : "primary"}
                          onClick={() => handleAddTaskToMustWin(msg.suggestedTask!, msg.id)}
                          disabled={msg.taskAdded}
                          className="font-bold text-xs gap-1.5 shadow-sm"
                        >
                          {msg.taskAdded ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400">
                                أُضيفت لقائمة مهام الحسم ✓
                              </span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>أضف إلى مهام الحسم لليوم (+)</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Bubble Footer Action (Copy) */}
                {!isUser && (
                  <div className="mt-2.5 flex items-center justify-end gap-1.5 text-theme-muted">
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.id, msg.content)}
                      className="p-1 rounded-lg hover:text-theme-text hover:bg-surface-elevated text-[11px] flex items-center gap-1 transition-all"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-end gap-1.5 max-w-md ml-auto">
            <div className="flex items-center gap-2 px-1 text-[11px] text-theme-muted">
              <span className="font-bold text-purple-500">الأستاذ الذكي يحلل ويكتب...</span>
            </div>
            <div className="p-4 rounded-3xl bg-card border border-theme rounded-tl-sm shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-theme-muted font-sans mr-2">صياغة الإجابة البيداغوجية</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ========================================================================= */}
      {/* 4. QUICK PROMPT PILLS                                                     */}
      {/* ========================================================================= */}
      <div className="px-4 py-2 border-t border-theme/50 bg-surface-soft/30 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-theme-muted shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          مقترحات سريعة:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-xl bg-surface border border-theme/80 text-[11px] text-theme-secondary hover:text-theme-text hover:border-purple-500/50 transition-all shrink-0 whitespace-nowrap"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 5. INPUT BAR                                                              */}
      {/* ========================================================================= */}
      <div className="p-3 sm:p-4 border-t border-theme bg-surface-elevated/80 backdrop-blur-md">
        <div className="relative flex items-center gap-2 bg-surface rounded-2xl border border-theme focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 p-2 shadow-inner">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="اسأل الأستاذ الذكي عن أي درس، قانون، فكرة، أو اطلب تسميعاً..."
            className="flex-1 bg-transparent border-0 outline-none text-xs sm:text-sm text-theme-text resize-none max-h-32 min-h-[40px] px-2 py-2 placeholder:text-theme-muted"
          />

          <Button
            size="md"
            variant="primary"
            onClick={() => handleSendMessage()}
            disabled={!input.trim() || isLoading}
            className="rounded-xl px-4 font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 shrink-0 gap-1.5"
          >
            <span>إرسال</span>
            <Send className="w-3.5 h-3.5 rotate-180" />
          </Button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-theme-muted mt-2 px-1">
          <span>اضغط Enter للإرسال • Shift+Enter لسطر جديد</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            مطابق لمقرر وزارة التربية الوطنية الجزائرية
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. SETTINGS MODAL                                                         */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl bg-card border border-theme shadow-2xl space-y-4"
              dir="rtl"
            >
              <div className="flex items-center justify-between border-b border-theme pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-500" />
                  <h3 className="font-bold text-base text-theme-text">
                    إعدادات الأستاذ الذكي (Gemini API)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-theme-muted hover:text-theme-text text-sm p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-theme-muted leading-relaxed">
                  المنصة تأتي بمحرك بيداغوجي مدمج فوري للبكالوريا. إذا كنت ترغب في استخدام مفتاح Google Gemini API شخصي خاص بك للحصول على توليد سحابي غير محدود، يمكنك إدخاله هنا (يُحفظ بأمان في جهازك فقط):
                </p>

                <div className="space-y-1.5">
                  <label className="font-bold text-theme-text block">
                    مفتاح Gemini API Key (اختياري):
                  </label>
                  <input
                    type="password"
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-surface border border-theme rounded-xl px-3.5 py-2.5 text-xs text-theme-text focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                  <span className="text-[10px] text-theme-muted block">
                    يمكنك الحصول على مفتاح مجاني تماماً من Google AI Studio (aistudio.google.com).
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-xs"
                >
                  إلغاء
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSaveApiKey}
                  className="text-xs font-bold px-4"
                >
                  حفظ الإعدادات
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 7. TOAST NOTIFICATION                                                     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-zinc-900 text-white border border-zinc-700 shadow-2xl flex items-center gap-2.5 text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
