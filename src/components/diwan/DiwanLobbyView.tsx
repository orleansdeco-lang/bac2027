"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Users,
  Plus,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  BookOpen,
  Zap,
} from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");

  const streamInfo = ALGERIAN_BAC_STREAMS[userStream] || ALGERIAN_BAC_STREAMS.sciences_exp;

  const subjectFilters = [
    { id: "all", label: "كل المواد", icon: "✨" },
    { id: "math", label: "رياضيات", icon: "📐" },
    { id: "physics", label: "فيزياء", icon: "⚡" },
    { id: "sciences", label: "علوم طبيعية", icon: "🧬" },
    { id: "philosophy", label: "فلسفة", icon: "🏛️" },
    { id: "history_geo", label: "تاريخ وجغرافيا", icon: "🌍" },
    { id: "arabic", label: "لغة عربية", icon: "📖" },
    { id: "islamic", label: "علوم إسلامية", icon: "🕌" },
  ];

  const filteredTables = tables.filter((t) => {
    if (selectedSubject !== "all" && t.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchTopic = (t.topic || "").toLowerCase().includes(q);
      if (!matchTitle && !matchTopic) return false;
    }
    return true;
  });

  // Calculate live stats
  const totalStudentsSeated = tables.reduce((acc, t) => acc + (t.member_count || 0), 0);

  return (
    <div className="space-y-6 sm:space-y-8" dir="rtl">
      {/* 1. HERO HEADER: WARM, SOCIAL, YOUTHFUL, FAST */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0F172A]/95 via-[#0B1222]/95 to-[#070D19]/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-white/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>طاولات حية 🇩🇿</span>
              </span>

              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                شعبة {streamInfo.name_ar}
              </span>

              {totalStudentsSeated > 0 && (
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>{totalStudentsSeated} تلاميذ يراجعون الآن معاً</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              طاولة المراجعة الرقمية 🏛️
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              اجلس حول طاولة مع زملائك: راجعوا مع بعضاكم، عاونوا بعضاكم، تنافسوا في أسئلة سريعة، وتحداو بعضكم في ثواني بدون تعقيد.
            </p>
          </div>

          {/* Quick CTA to Open Table */}
          <div className="shrink-0">
            <button
              type="button"
              onClick={onOpenCreateTable}
              className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>افتح طاولة جديدة لزملائك ➕</span>
            </button>
          </div>
        </div>

        {/* 2. SUBJECT QUICK FILTER PILLS & SEARCH */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {subjectFilters.map((subj) => {
              const isSelected = selectedSubject === subj.id;
              return (
                <button
                  key={subj.id}
                  type="button"
                  onClick={() => setSelectedSubject(subj.id)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20 font-black"
                      : "bg-white/[0.03] hover:bg-white/[0.07] text-slate-300 border-white/10"
                  }`}
                >
                  <span>{subj.icon}</span>
                  <span>{subj.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن درس أو موضوع..."
              className="w-full py-2 pr-9 pl-3 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400/60 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 3. OPEN STUDY TABLES GRID */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <span>الطاولات المفتوحة الآن</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {filteredTables.length} طاولة
            </span>
          </h2>
        </div>

        {filteredTables.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#0B1222]/80 p-8 sm:p-12 text-center space-y-4 shadow-xl">
            <span className="text-4xl block">🪑</span>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">لا توجد طاولة مفتوحة في هذا الموضوع بعد</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                كن أول من يفتح طاولة مراجعة واجمع زملاءك من شعبة {streamInfo.name_ar} للدراسة معاً!
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenCreateTable}
              className="inline-flex items-center gap-2 py-2.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition-all cursor-pointer hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              <span>افتح طاولة الآن 🚀</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTables.map((table) => {
              const capacity = table.capacity || 6;
              const seatedCount = table.member_count || (table.membersPreview ? table.membersPreview.length : 0);
              const isFull = seatedCount >= capacity;

              return (
                <div
                  key={table.id}
                  onClick={() => onSelectTable(table.id, true)}
                  className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0F172A]/85 to-[#0A111F]/95 hover:from-[#131E36] hover:to-[#0D1526] p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 group hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/15 hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {table.subject === "math"
                          ? "📐 رياضيات"
                          : table.subject === "physics"
                          ? "⚡ فيزياء"
                          : table.subject === "sciences"
                          ? "🧬 علوم طبيعية"
                          : table.subject === "philosophy"
                          ? "🏛️ فلسفة"
                          : table.subject === "history_geo"
                          ? "🌍 تاريخ وجغرافيا"
                          : table.subject === "arabic"
                          ? "📖 لغة عربية"
                          : "🕌 علوم إسلامية"}
                      </span>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                          isFull
                            ? "text-rose-400 bg-rose-500/10 border-rose-500/20"
                            : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        }`}
                      >
                        <Users className="w-3 h-3" />
                        <span>
                          {seatedCount} من {capacity} مقاعد
                        </span>
                      </span>
                    </div>

                    {/* Table Title & Topic */}
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                        {table.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        الموضوع: <span className="text-slate-300 font-semibold">{table.topic}</span>
                      </p>
                    </div>

                    {/* VISUAL SEATED PEERS PREVIEW */}
                    {table.membersPreview && table.membersPreview.length > 0 ? (
                      <div className="flex items-center gap-2 pt-1">
                        <div className="flex -space-x-2 space-x-reverse overflow-hidden">
                          {table.membersPreview.map((m, mIdx) => (
                            <div
                              key={mIdx}
                              className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-[#0F172A] shadow-md ring-1 ring-white/10"
                              title={`${m.name}`}
                            >
                              <Image src={m.avatar} alt={m.name} fill className="object-cover" />
                            </div>
                          ))}
                        </div>
                        <span className="text-[11px] text-slate-300 font-medium truncate">
                          <strong className="text-white font-bold">{seatedCount}</strong> يراجعون الآن 📖
                        </span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>طاولة شاغرة · كن أول من يجلس 🪑</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Seating HUD & CTA */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{table.duration_minutes || 45} دقيقة</span>
                    </span>

                    <button
                      type="button"
                      className="py-1.5 px-4 rounded-xl bg-blue-600/30 group-hover:bg-blue-600 text-blue-300 group-hover:text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm group-hover:shadow-blue-500/25"
                    >
                      <span>{isFull ? "مشاهدة الطاولة 👁️" : "انضم واجلس 🪑"}</span>
                      <ArrowRight className="w-3 h-3 rotate-180" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
