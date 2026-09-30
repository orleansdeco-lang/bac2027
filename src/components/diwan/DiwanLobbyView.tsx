"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Users, Plus, ArrowRight } from "lucide-react";
import { DiwanTable } from "@/types/diwan";
import { StreamId } from "@/types/education";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";

interface DiwanLobbyViewProps {
  tables: DiwanTable[];
  userStream: StreamId;
  onSelectTable: (tableId: string, autoJoin?: boolean) => void;
  onOpenCreateTable: () => void;
}

export function DiwanLobbyView({
  tables,
  userStream,
  onSelectTable,
  onOpenCreateTable,
}: DiwanLobbyViewProps) {
  const [selectedSubject, setSelectedSubject] = useState("all");

  const streamInfo = ALGERIAN_BAC_STREAMS[userStream] || ALGERIAN_BAC_STREAMS.sciences_exp;

  const subjectFilters = [
    { id: "all", label: "كل الطاولات", icon: "✨" },
    { id: "math", label: "رياضيات", icon: "📐" },
    { id: "physics", label: "فيزياء", icon: "⚡" },
    { id: "sciences", label: "علوم", icon: "🧬" },
    { id: "philosophy", label: "فلسفة", icon: "🏛️" },
  ];

  const filteredTables = tables.filter((t) => {
    if (selectedSubject !== "all" && t.subject !== selectedSubject) return false;
    return true;
  });

  const totalStudentsSeated = tables.reduce((acc, t) => acc + (t.member_count || 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8" dir="rtl">
      {/* 1. SOCIAL HEADER: PEOPLE FIRST, WARM, INSTANTLY UNDERSTANDABLE */}
      <div className="text-center space-y-3 pt-2 sm:pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <span>الناس راهي تقرا الآن 🔴</span>
          {totalStudentsSeated > 0 && (
            <span className="text-slate-300 font-normal">
              ({totalStudentsSeated} تلاميذ في شعبة {streamInfo.name_ar})
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          طابلة قراية Online 🏛️
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto leading-relaxed">
          ادخل، اقعد مع صحابك حول نفس الطاولة، راجعوا نفس الدرس، عاونوا بعضكم، وتحدّاو بعضكم في أسئلة سريعة.
        </p>

        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={onOpenCreateTable}
            className="text-xs font-bold text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>افتح طاولة جديدة لزملائك</span>
          </button>
        </div>

        {/* Minimal subject pills */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 pt-2 overflow-x-auto no-scrollbar pb-1">
          {subjectFilters.map((subj) => {
            const isSelected = selectedSubject === subj.id;
            return (
              <button
                key={subj.id}
                type="button"
                onClick={() => setSelectedSubject(subj.id)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-xs font-bold border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md font-black scale-105"
                    : "bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border-white/10"
                }`}
              >
                <span>{subj.icon}</span>
                <span>{subj.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. THE STUDY TABLES: VISUAL SOCIAL DENSITY */}
      {filteredTables.length === 0 ? (
        /* HUMAN EMPTY STATE */
        <div className="rounded-3xl border border-white/10 bg-[#0B1222]/90 p-8 sm:p-12 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-3xl mx-auto">
            😴
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">الطاولات فارغة حاليًا 😴</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
              كن أول واحد يقعد وافتح طابلة مراجعة في شعبة {streamInfo.name_ar} ليجلس معك زملاؤك!
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCreateTable}
            className="py-3 px-7 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            نفتح طابلة الآن 🪑
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {filteredTables.map((table) => {
            const capacity = table.capacity || 6;
            const seatedCount = table.member_count || (table.membersPreview ? table.membersPreview.length : 0);
            const freeSeats = Math.max(0, capacity - seatedCount);
            const isFull = freeSeats === 0;

            const subjectIcons: Record<string, string> = {
              math: "📐",
              physics: "⚡",
              sciences: "🧬",
              philosophy: "🏛️",
              history_geo: "🌍",
              arabic: "📖",
              islamic: "🕌",
            };
            const sIcon = subjectIcons[table.subject] || "📚";

            return (
              <div
                key={table.id}
                onClick={() => onSelectTable(table.id, true)}
                className="rounded-3xl border border-white/12 bg-gradient-to-b from-[#0F172A] to-[#0A101D] hover:from-[#131E36] hover:to-[#0D1526] p-5 sm:p-6 shadow-2xl transition-all duration-200 cursor-pointer flex flex-col justify-between gap-5 group hover:border-amber-400/50 hover:shadow-amber-400/10 hover:-translate-y-1"
              >
                {/* Table Header: Subject & Seated Avatars */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                      <span>{sIcon}</span>
                      <span>{table.topic}</span>
                    </span>

                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                        isFull
                          ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                          : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{seatedCount} قاعدين</span>
                    </span>
                  </div>

                  {/* Table Title */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                      {table.title}
                    </h3>
                  </div>

                  {/* SEATED CLASSMATES VISUAL (Social Presence) */}
                  <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-3">
                    {table.membersPreview && table.membersPreview.length > 0 ? (
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="flex -space-x-2 space-x-reverse shrink-0">
                          {table.membersPreview.map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[#0F172A] shadow-md ring-1 ring-white/10"
                            >
                              <Image src={m.avatar} alt={m.name} fill className="object-cover" />
                            </div>
                          ))}
                        </div>
                        <div className="space-y-0.5 truncate text-right">
                          <p className="text-xs font-bold text-white truncate">
                            {table.membersPreview.map((m) => m.name.split(" ")[0]).join("، ")}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {table.membersPreview[0]?.status === "writing"
                              ? "يكتب في التمرين الآن ✍️"
                              : table.membersPreview[0]?.status === "answering"
                              ? "يشرح لزملائه 💡"
                              : "يراجعون مع بعض 📖"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span>طاولة شاغرة · كن أول من يقعد 🪑</span>
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {freeSeats > 0 ? `${freeSeats} كراسى فارغين` : "ممتلئة"}
                    </span>
                  </div>
                </div>

                {/* THE ONE ACTION: نقعد معاهم */}
                <button
                  type="button"
                  className="w-full py-3 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-400/20 flex items-center justify-center gap-2 transition-all group-hover:scale-[1.02] active:scale-95"
                >
                  <span>{isFull ? "نشوف واش راهم يقراو 👁️" : "نقعد معاهم 🪑"}</span>
                  <span className="sr-only">انضم واجلس 🪑</span>
                  <ArrowRight className="w-4 h-4 rotate-180 text-slate-950" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. DISCREET SECONDARY ACTION: OPEN A NEW TABLE */}
      {filteredTables.length > 0 && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onOpenCreateTable}
            className="inline-flex items-center gap-2 py-2 px-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>تحب تقرا في مادة أخرى؟ افتح طابلة جديدة ➕</span>
          </button>
        </div>
      )}
    </div>
  );
}
