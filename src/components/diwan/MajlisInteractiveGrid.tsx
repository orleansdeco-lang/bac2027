"use client";

import React, { useState } from "react";
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
  ChevronLeft,
  Flame,
  Shield,
  Star,
} from "lucide-react";

export function MajlisInteractiveGrid() {
  // Live Chat Local State
  const [messages, setMessages] = useState([
    {
      id: "1",
      author: "أمين",
      avatar: "/illustrations/characters/yassine.jpg",
      text: "ما هي أفضل طريقة لحفظ القوانين؟",
      time: "اليوم 14:25",
      isMe: false,
    },
    {
      id: "2",
      author: "سارة",
      avatar: "/illustrations/characters/sarah.jpg",
      text: "أنا أفضل طريقة عندي هي التكرار المتباعد مع حل التمارين مباشرة.",
      time: "اليوم 14:30",
      isMe: false,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [activeGameModal, setActiveGameModal] = useState<string | null>(null);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      author: "أنت (طالب بكالوريا)",
      avatar: "/illustrations/characters/ali.jpg",
      text: inputMessage.trim(),
      time: "الآن",
      isMe: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");
  };

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

        <button
          type="button"
          className="mt-3 w-full py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[11px] font-bold text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-1"
        >
          <span>تصفح كل المنتديات</span>
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ---------------- CARD 2: الألعاب التعليمية ---------------- */}
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
              <h3 className="text-sm font-bold text-white">الألعاب التعليمية</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">العب واكسب نقاطاً</span>
          </div>

          <p className="text-[11px] text-slate-400 mb-3">
            ألعاب تعليمية ممتعة .. تفاعل باللعب و احصد النقاط لتتصدر
          </p>

          {/* 2x2 Games Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Game 1: كويز سريع */}
            <button
              type="button"
              onClick={() => setActiveGameModal("كويز سريع")}
              className="p-3 rounded-2xl bg-gradient-to-br from-purple-600/30 to-indigo-900/40 border border-purple-500/30 hover:border-purple-400 hover:scale-[1.03] transition-all text-center group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-1.5 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block">كويز سريع</span>
            </button>

            {/* Game 2: تحدي الأبطال */}
            <button
              type="button"
              onClick={() => setActiveGameModal("تحدي الأبطال")}
              className="p-3 rounded-2xl bg-gradient-to-br from-blue-600/30 to-cyan-900/40 border border-blue-500/30 hover:border-blue-400 hover:scale-[1.03] transition-all text-center group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-1.5 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block">تحدي الأبطال</span>
            </button>

            {/* Game 3: حرب الكلمات */}
            <button
              type="button"
              onClick={() => setActiveGameModal("حرب الكلمات")}
              className="p-3 rounded-2xl bg-gradient-to-br from-pink-600/30 to-rose-900/40 border border-pink-500/30 hover:border-pink-400 hover:scale-[1.03] transition-all text-center group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center mx-auto mb-1.5 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                <Puzzle className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block">حرب الكلمات</span>
            </button>

            {/* Game 4: لغز الرياضيات */}
            <button
              type="button"
              onClick={() => setActiveGameModal("لغز الرياضيات")}
              className="p-3 rounded-2xl bg-gradient-to-br from-emerald-600/30 to-teal-900/40 border border-emerald-500/30 hover:border-emerald-400 hover:scale-[1.03] transition-all text-center group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-1.5 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <Gamepad2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-white block">لغز الرياضيات</span>
            </button>
          </div>
        </div>

        <div className="mt-3 text-center">
          <span className="text-[10px] text-amber-400/90 font-mono">
            +50 نقطة خبرة لكل تحدٍ مكتمل 🌟
          </span>
        </div>
      </div>

      {/* ---------------- CARD 3: لوحة النقاش (Live Chat Feed) ---------------- */}
      <div
        className="rounded-3xl p-5 border border-white/[0.08] shadow-xl backdrop-blur-xl flex flex-col justify-between"
        style={{
          background: "linear-gradient(180deg, rgba(14, 23, 42, 0.95) 0%, rgba(9, 14, 26, 0.98) 100%)",
        }}
      >
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">لوحة النقاش</h3>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">تواصل مع زملائك</span>
          </div>

          <p className="text-[11px] text-slate-400 mb-3">
            شارك أفكارك واطرح أسئلتك مباشرة مع زملائك على الطاولة
          </p>

          {/* Messages Feed */}
          <div className="space-y-2.5 max-h-[170px] overflow-y-auto no-scrollbar pr-0.5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-2.5 rounded-2xl text-xs ${
                  m.isMe
                    ? "bg-blue-600/25 border border-blue-500/40 mr-4"
                    : "bg-white/[0.04] border border-white/[0.06] ml-4"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1 text-[10px] text-slate-400">
                  <span className="font-bold text-slate-300">{m.author}</span>
                  <span className="font-mono">{m.time}</span>
                </div>
                <p className="text-slate-200 text-[11px] leading-relaxed font-medium">
                  {m.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-1.5">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="اكتب سؤالاً أو فكرة..."
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
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-amber-400">
                  <Image
                    src="/illustrations/characters/ali.jpg"
                    alt="أحمد بن سليم"
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">أحمد بن سليم</span>
                  <span className="text-[10px] text-amber-400 font-mono font-bold">
                    المستوى 3
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-300">
                750 / 1000 XP
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400"
                style={{ width: "75%" }}
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
            متبقي 250 نقطة للوصول إلى المستوى 4 🚀
          </span>
        </div>
      </div>

      {/* Interactive Quick Modal for Games */}
      {activeGameModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B1222] border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-3">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-black text-white mb-1">{activeGameModal}</h4>
            <p className="text-xs text-slate-300 mb-4">
              بدء جولة سريعة لاختبار معلوماتك في المنهاج وكسب 50 نقطة خبرة لرفع تصنيفك على الطاولة!
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveGameModal(null)}
                className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
              >
                بدء التحدي الآن
              </button>
              <button
                type="button"
                onClick={() => setActiveGameModal(null)}
                className="py-2 px-3 rounded-xl bg-white/10 text-slate-300 text-xs font-bold hover:bg-white/15"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
