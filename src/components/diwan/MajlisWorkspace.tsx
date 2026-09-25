"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  MessageSquare,
  Landmark,
  Gamepad2,
  MoreHorizontal,
  Home,
  Clock,
  Users,
  ChevronLeft,
  Zap,
  Activity,
  Plus,
} from "lucide-react";
import { MajlisHeroBanner } from "./MajlisHeroBanner";
import { CozyMajlisDesk, StudentSeat } from "./CozyMajlisDesk";
import { MajlisInspectorPanel } from "./MajlisInspectorPanel";
import { MajlisAudioBar } from "./MajlisAudioBar";
import { MajlisInteractiveGrid } from "./MajlisInteractiveGrid";
import { CreateMajlisModal } from "./CreateMajlisModal";

export function MajlisWorkspace() {
  const [activeSubject, setActiveSubject] = useState("math");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [activeTableTopic, setActiveTableTopic] = useState("المتتاليات");
  const [mobileTab, setMobileTab] = useState<"home" | "forums" | "majlis" | "games" | "more">("majlis");

  const activeTablesList = [
    { id: "1", title: "المتتاليات", time: "منذ 126 دقيقة", seats: "5/6", subject: "رياضيات" },
    { id: "2", title: "الكهرباء", time: "منذ 326 دقيقة", seats: "5/6", subject: "فيزياء" },
    { id: "3", title: "الوراثة", time: "منذ 47 دقيقة", seats: "5/6", subject: "علوم طبيعية" },
  ];

  const handleSeatClick = (seat: StudentSeat) => {
    // Encouragement logic or member inspect
  };

  return (
    <div className="space-y-6 sm:space-y-8" dir="rtl">
      {/* 1. Header Banner with Stats & Subject Pills */}
      <MajlisHeroBanner
        activeSubject={activeSubject}
        onSelectSubject={(subj) => setActiveSubject(subj)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      {/* 2. Main Desktop Showcase: 3D Cozy Majlis Table + Side Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* Left Column: Cozy 3D Table Centerpiece (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <CozyMajlisDesk
            topicTitle={activeTableTopic}
            occupiedSeatsCount={6}
            maxSeatsCount={6}
            onSeatClick={handleSeatClick}
          />
        </div>

        {/* Right Column: Side Inspector Panel (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <MajlisInspectorPanel
            topic={activeTableTopic}
            isJoined={isJoined}
            onJoin={() => setIsJoined(!isJoined)}
          />
        </div>
      </div>

      {/* 3. Ambient Audio Bar */}
      <MajlisAudioBar />

      {/* Mobile-Only Active Tables Section (Matches Reference Phone Screen) */}
      <div className="lg:hidden rounded-3xl p-5 border border-white/[0.08] bg-[#0B1222]/90 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>المجالس النشطة الآن</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">3 مجالس مفتوحة</span>
        </div>

        <div className="space-y-2">
          {activeTablesList.map((t) => (
            <div
              key={t.id}
              onClick={() => setActiveTableTopic(t.title)}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] transition-all cursor-pointer"
            >
              <div>
                <span className="text-xs font-bold text-white block">{t.title}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">{t.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  {t.seats}
                </span>
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Bottom 4-Column Interactive Grid */}
      <MajlisInteractiveGrid />

      {/* Community Banner Footer (From Reference Bottom Right) */}
      <div
        className="rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-xl text-center relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(20, 14, 30, 0.95) 0%, rgba(11, 18, 34, 0.95) 100%)",
        }}
      >
        <div className="relative z-10 max-w-xl mx-auto space-y-3">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold inline-block">
            مجتمع طموح
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            مجلس العلم — أكثر من مجرد دراسة.. إنه مجتمع طموح.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            معاً نحقق أحلامنا ❤️ .. احجز مقعدك وتشارك المعرفة وسلالم التنقيط الوزارية.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
            >
              انضم الآن
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Navigation Bar (Matches Phone Screen Mockup) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1222]/95 border-t border-white/10 backdrop-blur-xl px-4 py-2 flex items-center justify-around shadow-2xl">
        <Link
          href="/dashboard"
          className="flex flex-col items-center gap-1 text-[10px] text-slate-400 hover:text-white"
        >
          <Home className="w-5 h-5" />
          <span>الرئيسية</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileTab("forums")}
          className="flex flex-col items-center gap-1 text-[10px] text-slate-400 hover:text-white"
        >
          <MessageSquare className="w-5 h-5" />
          <span>المنتديات</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("majlis")}
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-blue-400"
        >
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center -mt-3 shadow-lg shadow-blue-500/30">
            <Landmark className="w-4 h-4" />
          </div>
          <span>مجلس العلم</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("games")}
          className="flex flex-col items-center gap-1 text-[10px] text-slate-400 hover:text-white"
        >
          <Gamepad2 className="w-5 h-5" />
          <span>الألعاب</span>
        </button>

        <Link
          href="/account"
          className="flex flex-col items-center gap-1 text-[10px] text-slate-400 hover:text-white"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span>المزيد</span>
        </Link>
      </div>

      {/* Create Modal */}
      <CreateMajlisModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={(tableData) => {
          setActiveTableTopic(tableData.lesson || tableData.title);
        }}
      />
    </div>
  );
}
