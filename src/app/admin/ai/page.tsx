"use client";

import React, { useState, useEffect, useRef } from "react";
import { adminFetch } from "@/lib/admin/client";
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Terminal,
  CheckCircle2,
  MapPin,
  Brain,
  Clock,
  ChevronDown,
  ChevronUp,
  Trash2,
  HelpCircle,
  Info,
  Lock,
  ArrowDownCircle,
  FileCheck,
  BarChart3,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

interface ToolExecution {
  name: string;
  nameAr: string;
  summary: string;
  source: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolsExecuted?: ToolExecution[];
  structuredData?: any;
  warnings?: string[];
  timestamp: string;
}

const STARTER_PROMPTS = [
  "شحال من تلميذ نشط هذا الأسبوع؟",
  "أعطيني التلاميذ حسب الولاية.",
  "واش أكثر مادة فيها أخطاء؟",
  "أريني التمارين اللي عندها نسبة خطأ كبيرة.",
  "هل كاين محتوى ناقص؟",
  "حلللي حالة المنصة اليوم.",
];

export default function AdminAIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeToolActivity, setActiveToolActivity] = useState<string | null>(null);
  const [expandedToolsMessageId, setExpandedToolsMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcoming system prompt
  useEffect(() => {
    setMessages([
      {
        id: "msg-welcome",
        role: "assistant",
        content: `مرحباً بك في **مركز قيادة شاطر الذكي (SHATER AI Command Center)**.

أنا مساعدك الإداري المأذون؛ أعمل تحت **بروتوكول الأمان الصارم (Strict Tool Protocol)**:
- 🛡️ **وضع القراءة فقط (READ-ONLY):** لا يُسمح بتعديل أو حذف أي سجلات تلقائياً.
- 🚫 **انعدام الاستعلامات الحرة (No Raw SQL):** لا وصول مباشر للجداول، وتتم جميع الاستعلامات عبر أدوات معتمدة ومحددة سلفاً.
- 🎯 **بيانات واقعية مثبتة:** لا اختلاق للأرقام، مع توثيق شفاف لأي نواقص في النموذج المعرفي.

يمكنك طرح أي استفسار بالعامية أو الفصحى، أو النقر على أحد الأسئلة المقترحة أدناه:`,
        timestamp: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeToolActivity]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputPrompt).trim();
    if (!textToSend || loading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt("");
    setLoading(true);
    setActiveToolActivity("جاري فحص الاستفسار وتحديد الأدوات الإدارية المصرح بها...");

    try {
      // Simulate live tool-calling progression feedback in UI
      const timer = setTimeout(() => {
        setActiveToolActivity("جاري استرجاع البيانات ومطابقة الصلاحيات...");
      }, 700);

      const res = await adminFetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-5).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      clearTimeout(timer);
      const data = await res.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: data.reply,
          toolsExecuted: data.toolsExecuted || [],
          structuredData: data.structuredData,
          warnings: data.warnings,
          timestamp: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: `⚠️ تعذر إكمال الطلب: ${data.error || "خطأ غير متوقع في معالجة الاستعلام"}`,
          warnings: data.warnings,
          timestamp: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          role: "assistant",
          content: `⚠️ خطأ في الاتصال بالخادم: ${err?.message || "يرجى التحقق من الشبكة أو صلاحية الجلسة"}`,
          timestamp: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
      setActiveToolActivity(null);
    }
  };

  const clearSession = () => {
    if (confirm("هل ترغب في مسح سجل المحادثة وبدء جلسة جديدة؟")) {
      setMessages([
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: "تم بدء جلسة جديدة لمركز القيادة. كيف يمكنني مساعدتك في تدقيق وتحليل بيانات شاطر؟",
          timestamp: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">
                مركز قيادة الذكاء الاصطناعي (SHATER AI Command Center)
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Strict Tool-Bound (Read-Only)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              استعلام تفاعلي ذكي عن حركة الطلاب، بنك التمارين، مؤشرات التعلم، وجودة البيانات.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-[#080D1A] hover:bg-[#131E36] border border-[#1E293B] transition-colors"
            title="مسح سجل المحادثة الحالي"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>جلسة جديدة</span>
          </button>
          <Link
            href="/admin/data-quality"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>جودة البيانات</span>
          </Link>
        </div>
      </div>

      {/* Main Conversation Box */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl flex flex-col h-[650px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === "user" ? "items-start" : "items-end"
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 space-y-2 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/10"
                    : "bg-[#080D1A] border border-[#1E293B] text-slate-200 rounded-bl-none"
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-4 text-[10px] pb-1 border-b border-white/10 opacity-75">
                  <span className="font-semibold flex items-center gap-1">
                    {msg.role === "user" ? (
                      <>
                        <span>المشرف المعتمد</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-3 h-3 text-indigo-400" />
                        <span>مساعد شاطر الإداري</span>
                      </>
                    )}
                  </span>
                  <span className="font-mono">{msg.timestamp}</span>
                </div>

                {/* Message Content formatted with Markdown breaks */}
                <div className="whitespace-pre-line font-sans space-y-1">
                  {msg.content}
                </div>

                {/* Warnings Badge if Present */}
                {msg.warnings && msg.warnings.length > 0 && (
                  <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-[11px] text-amber-300">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>تنبيهات رقابية:</span>
                    </div>
                    {msg.warnings.map((w, idx) => (
                      <div key={idx} className="text-amber-200/90 pr-4">
                        • {w}
                      </div>
                    ))}
                  </div>
                )}

                {/* Tool Execution Transparency Accordion */}
                {msg.toolsExecuted && msg.toolsExecuted.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-[#1E293B]">
                    <button
                      onClick={() =>
                        setExpandedToolsMessageId(
                          expandedToolsMessageId === msg.id ? null : msg.id
                        )
                      }
                      className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 bg-[#131E36]/60 p-2 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-1.5 font-mono">
                        <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          الأدوات المنفذة ({msg.toolsExecuted.length}):{" "}
                          {msg.toolsExecuted.map((t) => t.nameAr).join("، ")}
                        </span>
                      </div>
                      {expandedToolsMessageId === msg.id ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {expandedToolsMessageId === msg.id && (
                      <div className="mt-2 space-y-2 text-[11px]">
                        {msg.toolsExecuted.map((tool) => (
                          <div
                            key={tool.name}
                            className="p-2.5 rounded-lg bg-[#050811] border border-[#1E293B] space-y-1 font-mono"
                          >
                            <div className="flex items-center justify-between text-emerald-400">
                              <span className="font-bold">{tool.name}</span>
                              <span className="text-[10px] text-slate-500">{tool.source}</span>
                            </div>
                            <p className="text-slate-300 font-sans text-[11px]">
                              {tool.summary}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Active Tool Execution Indicator */}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="p-3.5 rounded-2xl bg-[#080D1A] border border-[#1E293B] flex items-center gap-3 text-xs text-slate-300">
                <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                <div className="space-y-0.5">
                  <span className="font-semibold block text-indigo-300">
                    {activeToolActivity || "جاري المعالجة..."}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Deterministic Tools · Read-Only Execution
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Questions Bar */}
        <div className="px-5 py-2.5 bg-[#080D1A] border-t border-[#1E293B] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] text-slate-500 shrink-0 flex items-center gap-1 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>مقترحات سريعة:</span>
          </span>
          {STARTER_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSendMessage(prompt)}
              disabled={loading}
              className="text-xs text-slate-300 hover:text-white bg-[#131E36] hover:bg-[#1B2A4A] border border-[#1E293B] px-3 py-1 rounded-xl shrink-0 transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Text Form */}
        <div className="p-4 bg-[#080D1A] border-t border-[#1E293B]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="اسأل عن أي مؤشر، ولاية، شعبة، أو تمرين في شاطر... (مثال: شحال من تلميذ نشط هذا الأسبوع؟)"
                disabled={loading}
                className="w-full bg-[#0D1526] border border-[#1E293B] rounded-xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20"
            >
              <span>إرسال</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
