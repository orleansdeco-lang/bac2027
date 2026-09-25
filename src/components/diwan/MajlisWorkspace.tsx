"use client";

import React, { useState, useEffect } from "react";
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
  Sparkles,
} from "lucide-react";
import { MajlisHeroBanner } from "./MajlisHeroBanner";
import { CozyMajlisDesk, StudentSeat } from "./CozyMajlisDesk";
import { MajlisInspectorPanel } from "./MajlisInspectorPanel";
import { MajlisAudioBar } from "./MajlisAudioBar";
import { MajlisInteractiveGrid } from "./MajlisInteractiveGrid";
import { CreateMajlisModal } from "./CreateMajlisModal";
import { useAuth } from "@/lib/auth/context";
import { getStrategicProfile } from "@/lib/onboarding/profile";
import { PlannerStorage } from "@/lib/planner/storage";
import { StreamId } from "@/types/education";

const STORAGE_SESSION_KEY = "shater_active_majlis_seat_v1";

export function MajlisWorkspace() {
  const { user } = useAuth();
  const [activeSubject, setActiveSubject] = useState("math");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTableTopic, setActiveTableTopic] = useState("المتتاليات");
  const [mobileTab, setMobileTab] = useState<"home" | "forums" | "majlis" | "games" | "more">("majlis");

  // User Profile
  const [userName, setUserName] = useState("طالب بكالوريا");
  const [userStream, setUserStream] = useState<StreamId>("sciences_exp");

  // Active Majlis Session State
  const [isUserSeated, setIsUserSeated] = useState(false);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load user details & check if previously seated
  useEffect(() => {
    if (typeof window !== "undefined") {
      const profile = getStrategicProfile(user?.id);
      if (profile?.fullName) {
        setUserName(profile.fullName);
      } else if (user?.email) {
        setUserName(user.email.split("@")[0]);
      }

      if (profile?.streamId) {
        setUserStream(profile.streamId as StreamId);
      }

      // Check saved active seat
      try {
        const savedSeat = localStorage.getItem(STORAGE_SESSION_KEY);
        if (savedSeat) {
          const parsed = JSON.parse(savedSeat);
          if (parsed && parsed.startedAt) {
            setIsUserSeated(true);
            setSessionStart(parsed.startedAt);
            if (parsed.topic) setActiveTableTopic(parsed.topic);
          }
        }
      } catch (e) {
        console.warn("Failed to parse active majlis session", e);
      }
    }
  }, [user]);

  // Live Stopwatch Ticker anchored to Date.now()
  useEffect(() => {
    if (!isUserSeated || !sessionStart) {
      setElapsedSeconds(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - sessionStart) / 1000));
      setElapsedSeconds(diffSec);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isUserSeated, sessionStart]);

  const handleJoin = () => {
    if (!user) {
      showToast("يرجى تسجيل الدخول أو إنشاء حساب لحجز مقعدك على الطاولة 🏛️");
      return;
    }

    const now = Date.now();
    setIsUserSeated(true);
    setSessionStart(now);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_SESSION_KEY,
        JSON.stringify({
          topic: activeTableTopic,
          startedAt: now,
          userId: user.id,
        })
      );
    }
    showToast(`مرحباً بك يا ${userName}! تم حجز مقعدك على طاولة ${activeTableTopic} بنجاح 🪑`);
  };

  const handleLeave = async () => {
    if (!sessionStart) {
      setIsUserSeated(false);
      return;
    }

    const totalSeconds = Math.max(1, Math.floor((Date.now() - sessionStart) / 1000));
    const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));

    try {
      // Log session to PlannerStorage
      await PlannerStorage.saveStudySession({
        id: `majlis-session-${Date.now()}`,
        userId: user?.id || "demo-user",
        streamId: userStream,
        subjectId: activeSubject,
        plannedDurationMinutes: 45,
        actualDurationSeconds: totalSeconds,
        startedAt: new Date(sessionStart).toISOString(),
        endedAt: new Date().toISOString(),
        status: "COMPLETED",
        interruptionsCount: 0,
        notes: `جلسة مذاكرة جماعية في مجلس العلم: ${activeTableTopic}`,
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("study-session-logged"));
        window.dispatchEvent(new CustomEvent("planner-events-changed"));
        localStorage.removeItem(STORAGE_SESSION_KEY);
      }

      showToast(`أحسنت! تم تسجيل ${totalMinutes} دقيقة مذاكرة في رصيدك اليومي 🎉`);
    } catch (e) {
      console.warn("Error logging majlis study session", e);
      showToast(`تمت مغادرة المجلس بنجاح.`);
    }

    setIsUserSeated(false);
    setSessionStart(null);
    setElapsedSeconds(0);
  };

  const activeTablesList = [
    { id: "1", title: "المتتاليات", time: "منذ 126 دقيقة", seats: "5/6", subject: "رياضيات" },
    { id: "2", title: "الكهرباء", time: "منذ 326 دقيقة", seats: "5/6", subject: "فيزياء" },
    { id: "3", title: "الوراثة", time: "منذ 47 دقيقة", seats: "5/6", subject: "علوم طبيعية" },
  ];

  const handleSeatClick = (seat: StudentSeat) => {
    if (seat.isEmpty && !isUserSeated) {
      handleJoin();
    }
  };

  const subjectLabels: Record<string, string> = {
    math: "رياضيات",
    physics: "فيزياء",
    sciences: "علوم طبيعية",
    french: "فرنسية",
    history_geo: "تاريخ وجغرافيا",
  };

  const currentUserData = {
    name: userName,
    avatar: "/illustrations/characters/ali.jpg",
    subject: subjectLabels[activeSubject] || "رياضيات",
  };

  return (
    <div className="space-y-6 sm:space-y-8" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-2xl border border-blue-400/40 animate-in fade-in slide-in-from-top-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

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
            occupiedSeatsCount={isUserSeated ? 6 : 5}
            maxSeatsCount={6}
            isUserSeated={isUserSeated}
            currentUser={currentUserData}
            userElapsedSeconds={elapsedSeconds}
            onSeatClick={handleSeatClick}
            onJoinSeat={handleJoin}
            onLeaveSeat={handleLeave}
          />
        </div>

        {/* Right Column: Side Inspector Panel (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <MajlisInspectorPanel
            topic={activeTableTopic}
            isJoined={isUserSeated}
            userElapsedSeconds={elapsedSeconds}
            currentUser={currentUserData}
            onJoin={handleJoin}
            onLeave={handleLeave}
          />
        </div>
      </div>

      {/* 3. Ambient Audio Bar */}
      <MajlisAudioBar />

      {/* Mobile-Only Active Tables Section */}
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
      <MajlisInteractiveGrid topicTitle={activeTableTopic} />

      {/* Community Banner Footer */}
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

      {/* Mobile Sticky Bottom Navigation Bar */}
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
          showToast(`تم فتح مجلس جديد: ${tableData.title} 🎉`);
        }}
      />
    </div>
  );
}
