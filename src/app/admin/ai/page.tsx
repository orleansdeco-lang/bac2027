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
  Terminal,
  CheckCircle2,
  Trash2,
  Lock,
  ArrowRight,
  Sliders,
  Check,
  X,
  FileCheck,
  Archive,
  UploadCloud,
  FileEdit,
} from "lucide-react";
import Link from "next/link";
import { AdminActionProposal } from "@/lib/admin/ai-actions";

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
  actionProposal?: AdminActionProposal;
  warnings?: string[];
  timestamp: string;
}

const STARTER_PROMPTS = [
  "شحال من تلميذ نشط هذا الأسبوع؟",
  "أعطيني التلاميذ حسب الولاية.",
  "واش أكثر مادة فيها أخطاء؟",
  "بدل صعوبة التمرين exam-bac-2024-math-01 إلى صعب.",
  "أرشف التمرين القديم exam-bac-2024-math-01.",
  "هل كاين محتوى ناقص؟",
];

export default function AdminAIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeToolActivity, setActiveToolActivity] = useState<string | null>(null);
  const [expandedToolsMessageId, setExpandedToolsMessageId] = useState<string | null>(null);

  // Track action execution states per actionId: { status, auditLogId, message }
  const [actionStates, setActionStates] = useState<
    Record<
      string,
      {
        status: "IDLE" | "EXECUTING" | "EXECUTED" | "CANCELLED" | "FAILED";
        auditLogId?: string;
        message?: string;
      }
    >
  >({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcoming system prompt
  useEffect(() => {
    setMessages([
      {
        id: "msg-welcome",
        role: "assistant",
        content: `مرحباً بك في **مركز قيادة شاطر الذكي (SHATER AI Command Center)**.

أنا مساعدك الإداري المأذون؛ أعمل تحت **بروتوكول الأمان الصارم والإجراءات الآمنة المقيدة (Safe Controlled Actions)**:
- 🛡️ **لا تعديلات صامتة (Zero Silent Mutations):** لن يتم تعديل أي سجل في قاعدة البيانات تلقائياً دون موافقتك.
- 📋 **المعاينة الصريحة (Before / After Preview):** قبل أي تعديل، أعرض لك الحالة الحالية والقيمة المقترحة بالتفصيل.
- 🚫 **حماية المحتوى التعليمي (Delete Protection):** لا حذف فيزيائي نهائي للتمارين والمواضيع؛ نعتمد التجميد والأرشفة لحماية سجلات التلاميذ.
- 🔒 **منع التكرار (Idempotency):** كل مقترح محمي بمفتاح عدم تكرار لمنع النقرات المزدوجة.

يمكنك طرح أي استفسار إحصائي أو طلب تعديل محتوى بالعامية أو الفصحى:`,
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
          actionProposal: data.actionProposal,
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

  /**
   * Safe Controlled Action Execution Handler (STAGE: Human Confirmation -> Execute -> Verify -> Audit)
   */
  const handleExecuteAction = async (actionId: string) => {
    if (actionStates[actionId]?.status === "EXECUTING") return;

    setActionStates((prev) => ({
      ...prev,
      [actionId]: { status: "EXECUTING" },
    }));

    try {
      const res = await adminFetch("/api/admin/ai/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "execute",
          actionId,
          idempotencyKey: actionId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setActionStates((prev) => ({
          ...prev,
          [actionId]: {
            status: "EXECUTED",
            auditLogId: data.auditLogId,
            message: data.message || "تم تنفيذ العملية بنجاح ومطابقة التحديث.",
          },
        }));
      } else {
        setActionStates((prev) => ({
          ...prev,
          [actionId]: {
            status: "FAILED",
            message: data.error || "فشل تنفيذ العملية.",
          },
        }));
      }
    } catch (err: any) {
      setActionStates((prev) => ({
        ...prev,
        [actionId]: {
          status: "FAILED",
          message: err?.message || "تعذر الاتصال بالخادم لتنفيذ العملية.",
        },
      }));
    }
  };

  /**
   * Action Cancellation Handler
   */
  const handleCancelAction = async (actionId: string) => {
    setActionStates((prev) => ({
      ...prev,
      [actionId]: { status: "EXECUTING" },
    }));

    try {
      const res = await adminFetch("/api/admin/ai/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "cancel",
          actionId,
          cancelReason: "إلغاء يدوي من قبل المشرف الإداري",
        }),
      });

      const data = await res.json();

      if (data.success) {
        setActionStates((prev) => ({
          ...prev,
          [actionId]: {
            status: "CANCELLED",
            message: data.message || "تم إلغاء العملية بأمان.",
          },
        }));
      } else {
        setActionStates((prev) => ({
          ...prev,
          [actionId]: {
            status: "FAILED",
            message: data.error || "تعذر إلغاء العملية.",
          },
        }));
      }
    } catch (err: any) {
      setActionStates((prev) => ({
        ...prev,
        [actionId]: {
          status: "FAILED",
          message: err?.message || "خطأ أثناء محاولة الإلغاء.",
        },
      }));
    }
  };

  const clearSession = () => {
    if (confirm("هل ترغب في مسح سجل المحادثة وبدء جلسة جديدة؟")) {
      setMessages([
        {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: "تم بدء جلسة جديدة لمركز القيادة. كيف يمكنني مساعدتك في تدقيق، تحليل، أو إدارة بيانات شاطر؟",
          timestamp: new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
      setActionStates({});
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
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Safe Controlled Actions Active</span>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              تحليل ذكي وإجراءات معتمدة: استعلام تفاعلي، معاينة التغييرات (Before/After)، وتأكيد بشري ملزم.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearSession}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 bg-[#080D1A] hover:bg-[#131E36] border border-[#1E293B] transition-colors cursor-pointer"
            title="مسح سجل المحادثة الحالي"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>جلسة جديدة</span>
          </button>
          <Link
            href="/admin/overview"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>لوحة التحكم</span>
          </Link>
        </div>
      </div>

      {/* Main Conversation Box */}
      <div className="bg-[#0D1526] border border-[#1E293B] rounded-2xl flex flex-col h-[670px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 custom-scrollbar">
          {messages.map((msg) => {
            const proposal = msg.actionProposal;
            const currentActionState = proposal ? actionStates[proposal.id]?.status || proposal.status : null;
            const actionMessage = proposal ? actionStates[proposal.id]?.message : null;
            const auditLogId = proposal ? actionStates[proposal.id]?.auditLogId || proposal.auditLogId : null;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-start" : "items-end"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-4 space-y-2.5 text-xs leading-relaxed ${
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

                  {/* Message Text Content */}
                  <div className="whitespace-pre-line font-sans space-y-1">
                    {msg.content}
                  </div>

                  {/* ACTION PROPOSAL PREVIEW CARD (STAGE: PREVIEW & HUMAN CONFIRMATION) */}
                  {proposal && (
                    <div className="mt-3 p-4 rounded-xl bg-[#0D1526] border-2 border-amber-500/30 space-y-3 shadow-lg">
                      {/* Card Header: Title & Risk Badge */}
                      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#1E293B]">
                        <div className="flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-amber-400" />
                          <span className="font-black text-sm text-slate-100">
                            {proposal.titleAr}
                          </span>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            proposal.actionClass === "CLASS_C_HIGH_RISK"
                              ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                              : "bg-blue-500/15 text-blue-300 border-blue-500/30"
                          }`}
                        >
                          {proposal.actionClass === "CLASS_C_HIGH_RISK"
                            ? "Class C — عالية الخطورة"
                            : "Class B — منخفضة المخاطر"}
                        </span>
                      </div>

                      {/* Resource Reference */}
                      <div className="text-[11px] text-slate-400 space-y-1">
                        <div>
                          <span className="text-slate-500">المورد المستهدف: </span>
                          <span className="font-mono font-bold text-indigo-300">
                            {proposal.resourceId}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">نوع الكيان: </span>
                          <span className="font-semibold text-slate-300">
                            {proposal.resourceType === "custom_exams" ? "بنك التمارين والامتحانات" : proposal.resourceType}
                          </span>
                        </div>
                      </div>

                      {/* Before / After Diff Table */}
                      <div className="rounded-xl overflow-hidden border border-[#1E293B] bg-[#050811]">
                        <table className="w-full text-right text-[11px]">
                          <thead>
                            <tr className="bg-[#131E36]/60 text-slate-400 border-b border-[#1E293B]">
                              <th className="p-2 font-bold">الحقل</th>
                              <th className="p-2 font-bold">القيمة الحالية (Before)</th>
                              <th className="p-2 font-bold text-amber-400">القيمة الجديدة (After)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#1E293B]">
                            {proposal.diffSummary.map((diff, dIdx) => (
                              <tr key={dIdx} className="hover:bg-white/[0.02]">
                                <td className="p-2 font-semibold text-slate-300">{diff.labelAr}</td>
                                <td className="p-2 font-mono text-slate-400">{String(diff.before)}</td>
                                <td className="p-2 font-mono font-bold text-amber-300">{String(diff.after)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Human Action State Bar */}
                      {currentActionState === "EXECUTED" ? (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-emerald-300">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="font-bold text-xs">
                              {actionMessage || "تم تنفيذ العملية بنجاح ومطابقتها في قاعدة البيانات."}
                            </span>
                          </div>
                          {auditLogId && (
                            <span className="text-[10px] font-mono text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">
                              تدقيق: {auditLogId}
                            </span>
                          )}
                        </div>
                      ) : currentActionState === "CANCELLED" ? (
                        <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2 text-slate-400">
                          <X className="w-4 h-4 text-slate-500 shrink-0" />
                          <span className="font-semibold text-xs">
                            {actionMessage || "تم إلغاء مقترح العملية ولم يتم إجراء أي تعديل."}
                          </span>
                        </div>
                      ) : currentActionState === "FAILED" ? (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-rose-300">
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span className="font-semibold text-xs">
                            {actionMessage || "تعذر تنفيذ العملية. يرجى مراجعة الصلاحيات أو الاتصال بالدعم."}
                          </span>
                        </div>
                      ) : (
                        <div className="pt-1 flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleExecuteAction(proposal.id)}
                            disabled={currentActionState === "EXECUTING"}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                          >
                            {currentActionState === "EXECUTING" ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                <span>جاري التحقق والتنفيذ...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>تنفيذ العملية بأمان ✅</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCancelAction(proposal.id)}
                            disabled={currentActionState === "EXECUTING"}
                            className="py-2.5 px-4 rounded-xl bg-[#131E36] hover:bg-[#1B2A4A] disabled:opacity-50 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-[#1E293B] transition-all cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>إلغاء ❌</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

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
                        className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 bg-[#131E36]/60 p-2 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 font-mono">
                          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                          <span>
                            الأدوات المنفذة ({msg.toolsExecuted.length}):{" "}
                            {msg.toolsExecuted.map((t) => t.nameAr).join("، ")}
                          </span>
                        </div>
                        {expandedToolsMessageId === msg.id ? (
                          <span className="text-[10px]">▲ إخفاء</span>
                        ) : (
                          <span className="text-[10px]">▼ عرض</span>
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
            );
          })}

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
                    Deterministic Tools & Safe Guard Invariant
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
              className="text-xs text-slate-300 hover:text-white bg-[#131E36] hover:bg-[#1B2A4A] border border-[#1E293B] px-3 py-1 rounded-xl shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
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
                placeholder="اطلب استعلاماً أو تعديلاً... (مثال: بدل صعوبة التمرين exam-bac-2024-math-01 إلى صعب)"
                disabled={loading}
                className="w-full bg-[#0D1526] border border-[#1E293B] rounded-xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
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
