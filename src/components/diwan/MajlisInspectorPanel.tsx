"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Users, LogIn, CheckCircle2, Sparkles, BookOpen, Clock, Tag } from "lucide-react";
import { StudentSeat } from "./CozyMajlisDesk";

interface MajlisInspectorPanelProps {
  topic?: string;
  description?: string;
  tags?: string[];
  members?: {
    name: string;
    avatar: string;
    subject: string;
    subjectColor: string;
  }[];
  onJoin?: () => void;
  isJoined?: boolean;
}

export function MajlisInspectorPanel({
  topic = "المتتاليات",
  description = "نناقش اليوم: حل التمارين + مراجعة الدرس - مواضيع البكالوريا",
  tags = ["رياضيات", "البكالوريا"],
  members = [
    {
      name: "سارة",
      avatar: "/illustrations/characters/sarah.jpg",
      subject: "علوم طبيعية",
      subjectColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    },
    {
      name: "ياسين",
      avatar: "/illustrations/characters/yassine.jpg",
      subject: "رياضيات",
      subjectColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    },
    {
      name: "علي",
      avatar: "/illustrations/characters/ali.jpg",
      subject: "فيزياء",
      subjectColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    },
    {
      name: "مريم",
      avatar: "/illustrations/characters/mariam.jpg",
      subject: "فلسفة",
      subjectColor: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    },
    {
      name: "نهى",
      avatar: "/illustrations/characters/sarah.jpg",
      subject: "فرنسية",
      subjectColor: "bg-pink-500/15 text-pink-400 border-pink-500/30",
    },
    {
      name: "أمين",
      avatar: "/illustrations/characters/yassine.jpg",
      subject: "تاريخ",
      subjectColor: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    },
  ],
  onJoin,
  isJoined = false,
}: MajlisInspectorPanelProps) {
  const [hasJoined, setHasJoined] = useState(isJoined);

  const handleJoinClick = () => {
    setHasJoined(!hasJoined);
    if (onJoin) onJoin();
  };

  return (
    <div
      className="rounded-3xl p-5 sm:p-6 border border-white/[0.08] shadow-2xl backdrop-blur-xl flex flex-col justify-between"
      style={{
        background: "linear-gradient(180deg, rgba(14, 23, 42, 0.95) 0%, rgba(9, 14, 26, 0.98) 100%)",
      }}
      dir="rtl"
    >
      <div>
        {/* Top Header Row with Status */}
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-slate-300">معلومات المجلس</h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>نشط الآن</span>
          </span>
        </div>

        {/* Topic Title */}
        <div className="mt-4">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {topic}
          </h3>
          <p className="text-xs text-slate-300/80 mt-1.5 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-slate-300 text-[11px] font-semibold"
            >
              <Tag className="w-3 h-3 text-blue-400" />
              <span>{tag}</span>
            </span>
          ))}
        </div>

        {/* Primary CTA Button: Royal Blue */}
        <div className="mt-5">
          <button
            type="button"
            onClick={handleJoinClick}
            className={`w-full py-3 px-4 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              hasJoined
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            {hasJoined ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>أنت حاضر في هذا المجلس</span>
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 text-white" />
                <span>الانضمام إلى المجلس</span>
              </>
            )}
          </button>
        </div>

        {/* Members List Sub-Section */}
        <div className="mt-6 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs mb-3">
            <span className="font-bold text-slate-300">أعضاء المجلس</span>
            <span className="text-slate-400 font-mono text-[11px]">
              {members.length} طلاب
            </span>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto no-scrollbar pr-0.5">
            {members.map((mem, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-emerald-400/80 shrink-0">
                    <Image
                      src={mem.avatar}
                      alt={mem.name}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-white">
                    {mem.name}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${mem.subjectColor}`}
                >
                  {mem.subject}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
