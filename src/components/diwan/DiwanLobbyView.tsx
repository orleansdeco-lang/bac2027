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
  CheckCircle2,
  BookOpen,
  Filter,
} from "lucide-react";
import { DiwanTable, DiwanMember } from "@/types/diwan";
import { StreamId } from "@/types/education";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";

interface DiwanLobbyViewProps {
  tables: DiwanTable[];
  userStream: StreamId;
  onSelectTable: (tableId: string) => void;
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

  return (
    <div className="space-y-6 sm:space-y-8" dir="rtl">
      {/* 1. HERO HEADER: CLEAN, YOUTHFUL, ZERO CLUTTER */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0F172A]/95 via-[#0B1222]/95 to-[#070D19]/95 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-white/10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>طاولات مراجعة حية 🇩🇿</span>
              </span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                شعبة {streamInfo.name_ar}
              </span>
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

        {/* 2. SUBJECT QUICK FILTER PILLS */}
        <div className="space-y-2">
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
          <div className="rounded-3xl border border-white/10 bg-[#0B1222]/80 p-8 sm:p-12 text-center space-y-4">
            <span className="text-4xl block">🪑</span>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">لا توجد طاولة مفتوحة في هذا الموضوع بعد</h3>
              <p className="text-xs text-slate-400">
                كن أول من يفتح طاولة مراجعة واجمع زملاءك من شعبة {streamInfo.name_ar} للدراسة معاً!
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenCreateTable}
              className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>افتح طاولة الآن 🚀</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTables.map((table) => {
              const capacity = table.capacity || 6;

              return (
                <div
                  key={table.id}
                  onClick={() => onSelectTable(table.id)}
                  className="rounded-3xl border border-white/10 bg-gradient-to-b from-[#0F172A]/80 to-[#0A111F]/90 hover:from-[#131E36] hover:to-[#0D1526] p-5 shadow-xl transition-all duration-200 cursor-pointer flex flex-col justify-between gap-4 group hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-0.5"
                >
                  <div className="space-y-2.5">
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
                          : "📚 مادة"}
                      </span>

                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{capacity} مقاعد</span>
                      </span>
                    </div>

                    {/* Table Title & Topic */}
                    <div>
                      <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                        {table.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        الموضوع: {table.topic}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Seating HUD & CTA */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{table.duration_minutes || 45} دقيقة</span>
                    </span>

                    <button
                      type="button"
                      className="py-1.5 px-3.5 rounded-xl bg-blue-600/30 group-hover:bg-blue-600 text-blue-300 group-hover:text-white font-bold text-xs transition-all flex items-center gap-1.5"
                    >
                      <span>اجلس على الطاولة</span>
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
