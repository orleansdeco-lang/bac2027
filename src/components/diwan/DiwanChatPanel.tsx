"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Send,
  HelpCircle,
  Sparkles,
  Smile,
  Shield,
  Flag,
  CheckCircle2,
  X,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { DiwanMessage, DiwanMessageType } from "@/types/diwan";
import { DiwanService } from "@/lib/diwan/diwan-service";

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
  className?: string;
}

export function DiwanChatPanel({
  tableId,
  currentUser,
  messages,
  onSendMessage,
  onSendReaction,
  className = "",
}: DiwanChatPanelProps) {
  const [inputText, setInputText] = useState("");
  const [messageType, setMessageType] = useState<DiwanMessageType>("chat");
  const [filterMode, setFilterMode] = useState<"all" | "questions">("all");
  const [reportingMsgId, setReportingMsgId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("ألفاظ غير لائقة");
  const [reportToast, setReportToast] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage(inputText.trim(), messageType);
    setInputText("");
    setMessageType("chat"); // Reset to standard chat after sending
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
      setReportToast("تم إرسال الإبلاغ بنجاح للمراجعة الفورية 🛡️");
      setTimeout(() => setReportToast(null), 3000);
    } catch {
      setReportingMsgId(null);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (m.is_deleted) return false;
    if (filterMode === "questions") return m.message_type === "question";
    return true;
  });

  const quickReactions = ["💡", "👏", "🔥", "☕", "😂", "🤲"];

  return (
    <div
      className={`flex flex-col h-full rounded-3xl border border-white/10 bg-[#0B1222]/95 backdrop-blur-xl overflow-hidden shadow-xl ${className}`}
      dir="rtl"
    >
      {/* Toast Notification */}
      {reportToast && (
        <div className="p-2.5 bg-emerald-600 text-white text-[11px] font-bold text-center animate-in fade-in">
          {reportToast}
        </div>
      )}

      {/* Chat Header with Questions Filter */}
      <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between gap-2 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs sm:text-sm font-bold text-white">محادثة الطاولة الحية</h3>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-white/[0.04] border border-white/10 text-[10px]">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              filterMode === "all" ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            الكل
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("questions")}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
              filterMode === "questions" ? "bg-amber-500 text-slate-950 shadow-sm" : "text-slate-400 hover:text-white"
            }`}
          >
            <span>أسئلة</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 sm:p-4 space-y-3 overflow-y-auto no-scrollbar text-right"
      >
        {filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
            <span className="text-2xl">💬</span>
            <p className="text-xs text-slate-400 font-bold">لا توجد رسائل بعد</p>
            <p className="text-[11px] text-slate-500">
              حيِّ زملاءك على الطاولة، اطرح سؤالاً أو شارك معهم فكرة الدرس!
            </p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isSelf = msg.user_id === currentUser.id;
            const isQuestion = msg.message_type === "question";
            const isHelp = msg.message_type === "help";

            return (
              <div
                key={msg.id}
                className={`group flex items-start gap-2.5 ${isSelf ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className="relative w-7 h-7 rounded-xl overflow-hidden bg-white/10 shrink-0 border border-white/10 mt-0.5">
                  <Image src={msg.user_avatar} alt={msg.user_name} fill className="object-cover" />
                </div>

                {/* Bubble Container */}
                <div className={`max-w-[80%] space-y-1 ${isSelf ? "items-end text-left" : "items-start text-right"}`}>
                  {/* Sender Name + Type Tag */}
                  <div className={`flex items-center gap-1.5 text-[10px] ${isSelf ? "justify-end" : "justify-start"}`}>
                    <span className="font-bold text-slate-400">{isSelf ? "أنت" : msg.user_name}</span>
                    {isQuestion && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                        سؤال ❓
                      </span>
                    )}
                    {isHelp && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        مساعدة 💡
                      </span>
                    )}
                  </div>

                  {/* Bubble Content */}
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed transition-all break-words relative ${
                      isSelf
                        ? "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-500/10"
                        : isQuestion
                        ? "bg-amber-500/15 border border-amber-500/30 text-amber-100 rounded-tl-none shadow-sm"
                        : isHelp
                        ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-100 rounded-tl-none shadow-sm"
                        : "bg-white/[0.05] border border-white/10 text-slate-200 rounded-tl-none"
                    }`}
                  >
                    <p>{msg.content}</p>

                    {/* Report action for others' messages */}
                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => setReportingMsgId(msg.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute -left-6 top-1 text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                        title="إبلاغ عن هذه الرسالة"
                      >
                        <Flag className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <span className="text-[9px] text-slate-500 block px-1">
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

      {/* Quick Reaction Bar */}
      <div className="px-3 py-1.5 bg-black/20 border-t border-white/5 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5">
          {quickReactions.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => onSendReaction(emoji)}
              className="w-7 h-7 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-xs flex items-center justify-center transition-transform hover:scale-125 active:scale-95 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Question Mode Toggle Button */}
        <button
          type="button"
          onClick={() => setMessageType(messageType === "question" ? "chat" : "question")}
          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
            messageType === "question"
              ? "bg-amber-500 text-slate-950 border-amber-400 font-bold"
              : "bg-white/5 text-slate-400 border-white/10 hover:text-white"
          }`}
        >
          <span>❓ سؤال دراسي</span>
        </button>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-2.5 sm:p-3 border-t border-white/10 bg-white/[0.02]">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              messageType === "question"
                ? "اطرح سؤالك الدراسي هنا ليجيبك زملاؤك على الطاولة..."
                : "اكتب رسالة لزملائك..."
            }
            className={`w-full py-2.5 pr-3.5 pl-10 rounded-2xl bg-white/[0.04] border text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all ${
              messageType === "question"
                ? "border-amber-500/50 focus:border-amber-400"
                : "border-white/10 focus:border-blue-500"
            }`}
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="absolute left-1.5 p-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white transition-all cursor-pointer"
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
                className="text-slate-400 hover:text-white"
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
                <option value="ألفاظ غير لائقة">ألفاظ غير لائقة أو مسيئة</option>
                <option value="تشتيت وإزعاج">تشتيت الزملاء والخروج عن الدراسة</option>
                <option value="سبام">تكرار ورسائل عشوائية (سبام)</option>
                <option value="غش">محاولة غش وتضليل</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setReportingMsgId(null)}
                className="py-1.5 px-3 rounded-xl bg-white/10 text-white text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleReportSubmit}
                className="py-1.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
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
