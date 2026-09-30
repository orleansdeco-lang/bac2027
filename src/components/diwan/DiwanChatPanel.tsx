"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Send,
  HelpCircle,
  Flag,
  X,
  MessageSquare,
  AlertTriangle,
  ArrowDown,
  CornerDownLeft,
} from "lucide-react";
import { DiwanMessage, DiwanMessageType } from "@/types/diwan";

interface DiwanChatPanelProps {
  tableId: string;
  currentUser: {
    id?: string;
    name: string;
    avatar: string;
    wilayaCode?: string;
  };
  messages: DiwanMessage[];
  onSendMessage: (content: string, type: DiwanMessageType) => void;
  onSendReaction: (emoji: string) => void;
  onTyping?: (isTyping: boolean) => void;
  prefillInput?: { text: string; type?: DiwanMessageType; timestamp: number } | null;
  onCloseMobile?: () => void;
  className?: string;
}

export function DiwanChatPanel({
  tableId,
  currentUser,
  messages,
  onSendMessage,
  onSendReaction,
  onTyping,
  prefillInput,
  onCloseMobile,
  className = "",
}: DiwanChatPanelProps) {
  const [inputText, setInputText] = useState("");
  const [messageType, setMessageType] = useState<DiwanMessageType>("chat");
  const [filterMode, setFilterMode] = useState<"all" | "questions">("all");
  const [reportingMsgId, setReportingMsgId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("إساءة");
  const [reportToast, setReportToast] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle prefilled text from parent (e.g. clicking "اسقسيه" on student profile)
  useEffect(() => {
    if (prefillInput?.text) {
      setInputText(prefillInput.text);
      if (prefillInput.type) {
        setMessageType(prefillInput.type);
      }
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [prefillInput]);

  // Handle scroll detection and unread counter
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);
    const atBottom = distanceToBottom < 60;
    setIsAtBottom(atBottom);
    if (atBottom) {
      setUnreadCount(0);
    }
  };

  const scrollToBottom = (smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
      setUnreadCount(0);
      setIsAtBottom(true);
    }
  };

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom(false);
    } else {
      setUnreadCount((prev) => prev + 1);
    }
  }, [messages.length]);

  const handleInputChange = (val: string) => {
    setInputText(val);

    // Auto-presence: broadcast writing state
    if (onTyping) {
      onTyping(true);
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        onTyping(false);
      }, 3500);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    onTyping?.(false);

    onSendMessage(inputText.trim(), messageType);
    setInputText("");
    setMessageType("chat"); // Reset to standard chat after sending
    setTimeout(() => scrollToBottom(true), 50);
  };

  const handleQuickPeerReply = (studentName: string) => {
    setInputText(`رد على @${studentName}: `);
    setMessageType("chat");
    inputRef.current?.focus();
  };

  const handleReportSubmit = async () => {
    if (!reportingMsgId || !currentUser.id) return;
    try {
      await fetch("/api/diwan/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "REPORT_MESSAGE",
          messageId: reportingMsgId,
          tableId,
          reporterUserId: currentUser.id,
          reason: reportReason,
        }),
      });
      setReportingMsgId(null);
      setReportToast("تم إرسال الإبلاغ بنجاح 🛡️");
      setTimeout(() => setReportToast(null), 3000);
    } catch {
      setReportingMsgId(null);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (m.is_deleted || m.status === "HIDDEN" || m.status === "DELETED") return false;
    if (filterMode === "questions") return m.message_type === "question";
    return true;
  });

  const quickReactions = ["🔥", "👏", "💡", "😂", "❤️", "☕"];

  return (
    <div
      className={`relative flex flex-col h-full rounded-3xl border border-white/10 bg-[#0B1222]/95 backdrop-blur-xl overflow-hidden shadow-2xl ${className}`}
      dir="rtl"
    >
      {/* Toast Notification */}
      {reportToast && (
        <div className="p-2.5 bg-emerald-600 text-white text-[11px] font-bold text-center animate-in fade-in">
          {reportToast}
        </div>
      )}

      {/* Chat Header */}
      <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between gap-2 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs sm:text-sm font-black text-white">محادثة الطاولة</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Simple Filter Pills */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/[0.04] border border-white/10 text-[10px]">
            <button
              type="button"
              onClick={() => setFilterMode("all")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterMode === "all"
                  ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              الكل
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("questions")}
              className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                filterMode === "questions"
                  ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>أسئلة</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            </button>
          </div>

          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="p-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer lg:hidden"
              title="إغلاق المحادثة"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 p-3 sm:p-4 space-y-3 overflow-y-auto no-scrollbar text-right relative"
      >
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
            <span className="text-3xl">💬</span>
            <p className="text-xs text-slate-300 font-bold">الطاولة راهي هادئة 👋</p>
            <p className="text-[11px] text-slate-500 max-w-[200px]">
              سقسي أصحابك، شارك معاهم فكرة في التمرين، أو شجعهم!
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isSelf = msg.user_id === currentUser.id;
            const isQuestion = msg.message_type === "question";
            const isReaction = msg.message_type === "reaction";

            // SPECIAL QUESTION CARD ("سؤال للديوان")
            if (isQuestion) {
              return (
                <div
                  key={msg.id}
                  className="rounded-2xl border border-amber-500/40 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent p-3 space-y-2 shadow-lg shadow-amber-500/5 relative group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6 rounded-lg overflow-hidden border border-amber-400/40">
                        <Image src={msg.user_avatar} alt={msg.user_name} fill className="object-cover" />
                      </div>
                      <span className="text-xs font-bold text-amber-200">
                        {isSelf ? "أنت" : msg.user_name}
                      </span>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black flex items-center gap-1 shadow-sm">
                      <HelpCircle className="w-3 h-3" />
                      <span>سؤال ❓</span>
                    </span>
                  </div>

                  <p className="text-xs font-medium text-amber-100/90 leading-relaxed whitespace-pre-line bg-black/20 p-2.5 rounded-xl border border-amber-500/20">
                    {msg.content}
                  </p>

                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[9px] text-amber-300/60 font-mono">
                      {new Date(msg.created_at).toLocaleTimeString("ar-DZ", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => handleQuickPeerReply(msg.user_name)}
                        className="py-1 px-2.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/30 text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <CornerDownLeft className="w-3 h-3" />
                        <span>رد عليه</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            // Quick Reaction message
            if (isReaction) {
              return (
                <div
                  key={msg.id}
                  className={`flex items-center gap-2 ${isSelf ? "justify-end" : "justify-start"}`}
                >
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/5 text-xs text-slate-300">
                    <span className="text-base">{msg.content}</span>
                    <span className="text-[10px] text-slate-400">{isSelf ? "أنت" : msg.user_name}</span>
                  </div>
                </div>
              );
            }

            // Standard Lightweight Bubble
            return (
              <div
                key={msg.id}
                className={`group flex items-start gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className="relative w-6 h-6 rounded-lg overflow-hidden bg-white/10 shrink-0 border border-white/10 mt-0.5">
                  <Image src={msg.user_avatar} alt={msg.user_name} fill className="object-cover" />
                </div>

                <div className={`max-w-[82%] space-y-0.5 ${isSelf ? "items-end text-left" : "items-start text-right"}`}>
                  <div className={`flex items-center gap-1.5 text-[10px] ${isSelf ? "justify-end" : "justify-start"}`}>
                    <span className="font-bold text-slate-400">{isSelf ? "أنت" : msg.user_name}</span>
                  </div>

                  <div
                    className={`p-2.5 sm:p-3 rounded-2xl text-xs leading-relaxed break-words relative shadow-sm ${
                      isSelf
                        ? "bg-blue-600 text-white rounded-tr-none shadow-blue-500/10"
                        : "bg-white/[0.06] border border-white/10 text-slate-200 rounded-tl-none"
                    }`}
                  >
                    <p>{msg.content}</p>

                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => setReportingMsgId(msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute -left-6 top-1 text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        title="إبلاغ"
                      >
                        <Flag className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <span className="text-[9px] text-slate-500 block px-1 font-mono">
                    {new Date(msg.created_at).toLocaleTimeString("ar-DZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Unread Counter Pill */}
      {!isAtBottom && unreadCount > 0 && (
        <button
          type="button"
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20 py-1.5 px-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow-xl border border-blue-400/40 flex items-center gap-1.5 animate-bounce cursor-pointer transition-all"
        >
          <ArrowDown className="w-3.5 h-3.5" />
          <span>رسائل جديدة ({unreadCount})</span>
        </button>
      )}

      {/* Quick Reaction Bar */}
      <div className="px-3 py-1.5 bg-black/25 border-t border-white/5 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5">
          {quickReactions.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSendReaction(emoji)}
              className="w-7 h-7 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-xs flex items-center justify-center transition-transform hover:scale-125 active:scale-95 cursor-pointer"
              title={`إرسال ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Question Mode Toggle Button */}
        <button
          type="button"
          onClick={() => setMessageType(messageType === "question" ? "chat" : "question")}
          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
            messageType === "question"
              ? "bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md"
              : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
          }`}
        >
          <span>❓ سؤال للديوان</span>
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-2.5 sm:p-3 border-t border-white/10 bg-white/[0.02]">
        <div className="relative flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={
              messageType === "question"
                ? "اطرح سؤالك للناس تعاونك..."
                : "اكتب لصحابك على الطابلة..."
            }
            className={`w-full py-2.5 pr-3.5 pl-10 rounded-2xl bg-white/[0.04] border text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all ${
              messageType === "question"
                ? "border-amber-400/60 focus:border-amber-400 shadow-sm shadow-amber-400/10"
                : "border-white/10 focus:border-blue-500"
            }`}
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute left-1.5 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white transition-all cursor-pointer"
            title="إرسال"
          >
            <Send className="w-3.5 h-3.5 rotate-180" />
          </button>
        </div>
      </form>

      {/* Report Modal */}
      {reportingMsgId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0B1222] p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>إبلاغ عن محتوى غير لائق</span>
              </div>
              <button
                type="button"
                onClick={() => setReportingMsgId(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="text-slate-300 font-bold block">سبب الإبلاغ:</label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full py-2 px-3 rounded-xl bg-[#0F172A] border border-white/10 text-xs text-white focus:outline-none"
              >
                <option value="إساءة">إساءة أو شتائم</option>
                <option value="تنمر">تنمر ومضايقة</option>
                <option value="محتوى غير مناسب">محتوى غير مناسب للطلاب</option>
                <option value="سبام">سبام وتكرار عشوائي</option>
                <option value="غش">محاولة غش وتضليل</option>
                <option value="أخرى">أسباب أخرى</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setReportingMsgId(null)}
                className="py-1.5 px-3 rounded-xl bg-white/10 text-white text-xs font-bold cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleReportSubmit}
                className="py-1.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                تأكيد الإبلاغ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
