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
    { id: "all", label: "كل المواد", icon: "✨" },
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
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8" dir="rtl">
      {/* 1. SOCIAL HEADER: HIGH CONTRAST, ZERO TECHNICAL JARGON */}
      <div className="text-center space-y-3 pt-2 sm:pt-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-100 border border-rose-300 text-rose-800 text-xs font-black shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
          <span>الناس راهي تقرا الآن 🔴</span>
          {totalStudentsSeated > 0 && (
            <span className="text-rose-900 font-bold">
              ({totalStudentsSeated} تلاميذ في شعبة {streamInfo.name_ar})
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          طاولة المراجعة الجماعية 🏛️
        </h1>

        <p className="text-sm sm:text-base text-slate-700 max-w-xl mx-auto leading-relaxed font-medium">
          ادخل، اقعد مع صحابك حول نفس الطاولة، راجعوا نفس الدرس، عاونوا بعضكم، وتحدّاو بعضكم في أسئلة سريعة.
        </p>

        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={onOpenCreateTable}
            className="text-xs sm:text-sm font-bold text-[#2C5E54] hover:text-amber-700 transition-colors flex items-center gap-1.5 cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-200"
          >
            <Plus className="w-4 h-4 text-[#2C5E54]" />
            <span>افتح طاولة جديدة لزملائك</span>
          </button>
        </div>

        {/* Responsive subject filter pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 pt-2 overflow-x-auto no-scrollbar pb-1 px-1">
          {subjectFilters.map((subj) => {
            const isSelected = selectedSubject === subj.id;
            return (
              <button
                key={subj.id}
                type="button"
                onClick={() => setSelectedSubject(subj.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-bold border-2 transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-amber-400 text-slate-950 border-amber-500 shadow-sm font-black scale-105"
                    : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs"
                }`}
              >
                <span>{subj.icon}</span>
                <span>{subj.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. THE STUDY TABLES: RESPONSIVE CARDS (DESKTOP / TABLET / MOBILE) */}
      {filteredTables.length === 0 ? (
        /* HUMAN EMPTY STATE */
        <div className="rounded-3xl border-2 border-slate-200 bg-white p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-3xl mx-auto">
            😴
          </div>
          <div className="space-y-1">
            <h3 className="text-lg sm:text-xl font-black text-slate-900">الطاولات فارغة حاليًا 😴</h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto font-medium">
              كن أول واحد يقعد وافتح طابلة مراجعة في شعبة {streamInfo.name_ar} ليجلس معك زملاؤك!
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenCreateTable}
            className="py-3 px-7 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-400/25 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            نفتح طابلة الآن 🪑
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                className="rounded-3xl border-2 border-slate-200 hover:border-amber-400 bg-white hover:shadow-xl p-5 sm:p-6 shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between gap-5 group hover:-translate-y-1"
              >
                {/* Table Header: Subject & Seated Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
                      <span>{sIcon}</span>
                      <span>{table.topic}</span>
                    </span>

                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                        isFull
                          ? "bg-rose-50 text-rose-800 border-rose-200"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{seatedCount} قاعدين</span>
                    </span>
                  </div>

                  {/* Table Title */}
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                      {table.title}
                    </h3>
                  </div>

                  {/* SEATED CLASSMATES PREVIEW */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                    {table.membersPreview && table.membersPreview.length > 0 ? (
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="flex -space-x-2 space-x-reverse shrink-0">
                          {table.membersPreview.map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-xs ring-1 ring-slate-200"
                            >
                              <Image src={m.avatar} alt={m.name} fill className="object-cover" />
                            </div>
                          ))}
                        </div>
                        <div className="space-y-0.5 truncate text-right">
                          <p className="text-xs font-black text-slate-900 truncate">
                            {table.membersPreview.map((m) => m.name.split(" ")[0]).join("، ")}
                          </p>
                          <p className="text-[11px] text-slate-600 truncate font-medium">
                            {table.membersPreview[0]?.status === "writing"
                              ? "يكتب في التمرين الآن ✍️"
                              : table.membersPreview[0]?.status === "answering"
                              ? "يشرح لزملائه 💡"
                              : "يراجعون مع بعض 📖"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-700 flex items-center gap-1.5 font-bold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>طاولة شاغرة · كن أول من يقعد 🪑</span>
                      </div>
                    )}

                    <span className="text-xs text-slate-700 font-mono font-bold shrink-0 bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                      {freeSeats > 0 ? `${freeSeats} كراسي فارغة` : "ممتلئة"}
                    </span>
                  </div>
                </div>

                {/* THE PRIMARY ACTION BUTTON */}
                <button
                  type="button"
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-400/25 flex items-center justify-center gap-2 transition-all group-hover:scale-[1.01] active:scale-98 cursor-pointer"
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

      {/* 3. SECONDARY ACTION: OPEN A NEW TABLE */}
      {filteredTables.length > 0 && (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onOpenCreateTable}
            className="inline-flex items-center gap-2 py-2.5 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 shadow-xs text-xs sm:text-sm font-bold transition-all cursor-pointer hover:border-slate-300"
          >
            <Plus className="w-4 h-4 text-amber-500" />
            <span>تحب تقرا في مادة أخرى؟ افتح طابلة جديدة ➕</span>
          </button>
        </div>
      )}
    </div>
  );
}
