"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { MajlisInteractiveGrid } from "./MajlisInteractiveGrid";
import { CreateMajlisModal } from "./CreateMajlisModal";
import { useAuth } from "@/lib/auth/context";
import { getStrategicProfile } from "@/lib/onboarding/profile";
import { PlannerStorage } from "@/lib/planner/storage";
import { StreamId } from "@/types/education";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import {
  MajlisService,
  MajlisRoom,
  MajlisMember,
  MajlisMessage,
} from "@/lib/campus/majlis-service";

const STORAGE_SESSION_KEY = "shater_active_majlis_seat_v2";

export function MajlisWorkspace() {
  const { user } = useAuth();
  const [activeSubject, setActiveSubject] = useState("physics");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTableTopic, setActiveTableTopic] = useState("الدارة RC (شحن وتفريغ)");
  const [mobileTab, setMobileTab] = useState<"home" | "forums" | "majlis" | "games" | "more">("majlis");

  // User Profile
  const [userName, setUserName] = useState("طالب بكالوريا");
  const [userStream, setUserStream] = useState<StreamId>("sciences_exp");

  // Real-Time Room State
  const [activeRoom, setActiveRoom] = useState<MajlisRoom | null>(null);
  const [members, setMembers] = useState<MajlisMember[]>([]);
  const [messages, setMessages] = useState<MajlisMessage[]>([]);

  // Active Majlis Session State
  const [isUserSeated, setIsUserSeated] = useState(false);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load user details
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
    }
  }, [user]);

  // Load initial active room and its data
  const loadRoom = useCallback(async (roomId = "room-sciences-rc") => {
    const room = await MajlisService.getRoom(roomId);
    if (room) {
      setActiveRoom(room);
      setActiveTableTopic(room.lesson || room.title);
      setActiveSubject(room.subject);

      const mems = await MajlisService.getMembers(room.id);
      setMembers(mems);

      const msgs = await MajlisService.getMessages(room.id);
      setMessages(msgs);

      // Check if current user is seated
      if (user?.id) {
        const userSeat = mems.find((m) => m.user_id === user.id);
        if (userSeat) {
          setIsUserSeated(true);
          setSessionStart(new Date(userSeat.joined_at).getTime());
        }
      }
    }
  }, [user?.id]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  // Real-Time Supabase Channel Subscription
  useEffect(() => {
    if (!activeRoom) return;

    const unsubscribe = MajlisService.subscribeToRoom(activeRoom.id, {
      onSeatChange: async () => {
        const updatedMems = await MajlisService.getMembers(activeRoom.id);
        setMembers(updatedMems);
      },
      onPaperFinished: async () => {
        const updatedMems = await MajlisService.getMembers(activeRoom.id);
        setMembers(updatedMems);
      },
      onScoreUpdate: async () => {
        const updatedMems = await MajlisService.getMembers(activeRoom.id);
        setMembers(updatedMems);
      },
      onNewMessage: (msg: MajlisMessage) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      },
      onRoomUpdate: (updatedRoom: Partial<MajlisRoom>) => {
        setActiveRoom((prev) => (prev ? { ...prev, ...updatedRoom } : null));
      },
    });

    return () => {
      unsubscribe();
    };
  }, [activeRoom]);

  // Live Stopwatch Ticker
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

  // Handle Join Seat with Strict Stream Access Rule
  const handleJoin = async () => {
    if (!user) {
      showToast("يرجى تسجيل الدخول أو إنشاء حساب لحجز مقعدك على الطاولة 🏛️");
      return;
    }

    if (!activeRoom) return;

    // Strict stream verification
    const roomStreamName = ALGERIAN_BAC_STREAMS[activeRoom.stream]?.name_ar || activeRoom.stream;
    if (userStream !== activeRoom.stream) {
      showToast(
        `هذا المجلس مخصص لشعبة ${roomStreamName}. يمكنك المشاهدة أو مشاركة الرابط مع زميل في هذه الشعبة.`
      );
      return;
    }

    const now = Date.now();
    const result = await MajlisService.takeSeat({
      roomId: activeRoom.id,
      roomStream: activeRoom.stream,
      user: {
        id: user.id,
        name: userName,
        avatar: user.user_metadata?.avatar_url || "/illustrations/characters/ali.jpg",
        stream: userStream,
      },
    });

    if (!result.allowed) {
      showToast(
        `هذا المجلس مخصص لشعبة ${roomStreamName}. يمكنك المشاهدة أو مشاركة الرابط مع زميل في هذه الشعبة.`
      );
      return;
    }

    setIsUserSeated(true);
    setSessionStart(now);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_SESSION_KEY,
        JSON.stringify({
          roomId: activeRoom.id,
          topic: activeTableTopic,
          startedAt: now,
          userId: user.id,
        })
      );
    }

    const updatedMems = await MajlisService.getMembers(activeRoom.id);
    setMembers(updatedMems);
    showToast(`مرحباً بك يا ${userName}! تم حجز مقعدك على طاولة ${activeRoom.title} بنجاح 🪑`);
  };

  // Handle Leave Seat & Log Study Duration
  const handleLeave = async () => {
    if (activeRoom && user?.id) {
      await MajlisService.leaveSeat(activeRoom.id, user.id);
    }

    if (sessionStart) {
      const totalSeconds = Math.max(1, Math.floor((Date.now() - sessionStart) / 1000));
      const totalMinutes = Math.max(1, Math.round(totalSeconds / 60));

      try {
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
          notes: `جلسة مذاكرة تفاعلية في مجلس العلم: ${activeTableTopic}`,
        });

        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("study-session-logged"));
          window.dispatchEvent(new CustomEvent("planner-events-changed"));
          localStorage.removeItem(STORAGE_SESSION_KEY);
        }

        showToast(`أحسنت! تم تسجيل ${totalMinutes} دقيقة مذاكرة في رصيدك اليومي 🎉`);
      } catch (e) {
        console.warn("Error logging majlis study session", e);
        showToast("تمت مغادرة المجلس بنجاح.");
      }
    }

    setIsUserSeated(false);
    setSessionStart(null);
    setElapsedSeconds(0);

    if (activeRoom) {
      const updatedMems = await MajlisService.getMembers(activeRoom.id);
      setMembers(updatedMems);
    }
  };

  // Handle Chat Message Send
  const handleSendMessage = async (content: string) => {
    if (!activeRoom || !user) return;
    const msg = await MajlisService.sendMessage({
      roomId: activeRoom.id,
      userId: user.id,
      userName,
      userStream: ALGERIAN_BAC_STREAMS[userStream]?.name_ar || userStream,
      content,
    });
    setMessages((prev) => [...prev, msg]);
  };

  // Handle Created Room from Modal
  const handleRoomCreated = (room: MajlisRoom) => {
    setActiveRoom(room);
    setActiveTableTopic(room.lesson || room.title);
    setActiveSubject(room.subject);
    setMembers([]);
    setMessages([]);
    showToast(`تم فتح مجلس جديد: ${room.title} 🎉`);

    // Auto-join host if stream matches
    if (user && userStream === room.stream) {
      MajlisService.takeSeat({
        roomId: room.id,
        roomStream: room.stream,
        user: {
          id: user.id,
          name: userName,
          avatar: user.user_metadata?.avatar_url || "/illustrations/characters/ali.jpg",
          stream: userStream,
        },
      }).then((res) => {
        if (res.allowed) {
          setIsUserSeated(true);
          setSessionStart(Date.now());
          MajlisService.getMembers(room.id).then(setMembers);
        }
      });
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
    id: user?.id,
    name: userName,
    avatar: "/illustrations/characters/ali.jpg",
    subject: subjectLabels[activeSubject] || "فيزياء",
    stream: userStream,
  };

  const activeTablesList = [
    { id: "room-sciences-rc", title: "الدارة RC والفيزياء", time: "نشط الآن", seats: `${members.length}/6`, subject: "فيزياء" },
    { id: "2", title: "المتتاليات العددية", time: "منذ 45 دقيقة", seats: "4/6", subject: "رياضيات" },
    { id: "3", title: "تركيب البروتين", time: "منذ 20 دقيقة", seats: "3/6", subject: "علوم طبيعية" },
  ];

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
        totalTablesCount={94}
        activeStudentsCount={members.length > 0 ? members.length + 12 : 12}
      />

      {/* 2. Main Desktop Showcase: 3D Cozy Majlis Table + Side Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* Left Column: Cozy 3D Table Centerpiece (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <CozyMajlisDesk
            topicTitle={activeTableTopic}
            occupiedSeatsCount={members.length}
            maxSeatsCount={activeRoom?.capacity || 6}
            isUserSeated={isUserSeated}
            currentUser={currentUserData}
            userElapsedSeconds={elapsedSeconds}
            room={activeRoom}
            members={members}
            onJoinSeat={handleJoin}
            onLeaveSeat={handleLeave}
            onRefreshRoom={() => {
              if (activeRoom) {
                MajlisService.getMembers(activeRoom.id).then(setMembers);
              }
            }}
          />
        </div>

        {/* Right Column: Side Inspector Panel (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col">
          <MajlisInspectorPanel
            topic={activeTableTopic}
            description={activeRoom?.lesson ? `الموضوع الدراسي: ${activeRoom.lesson}` : "نناقش اليوم: حل التمارين + مراجعة الدرس - مواضيع البكالوريا"}
            tags={[subjectLabels[activeSubject] || "مادة", ALGERIAN_BAC_STREAMS[activeRoom?.stream || userStream]?.name_ar || "الشعبة", "مباشر"]}
            members={members.map((m) => ({
              name: m.user_name,
              avatar: m.user_avatar,
              subject: activeRoom?.subject ? subjectLabels[activeRoom.subject] || activeRoom.subject : "رياضيات",
              subjectColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
            }))}
            messages={messages}
            onSendMessage={handleSendMessage}
            isJoined={isUserSeated}
            userElapsedSeconds={elapsedSeconds}
            currentUser={currentUserData}
            onJoin={handleJoin}
            onLeave={handleLeave}
          />
        </div>
      </div>

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
                <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                  {t.seats}
                </span>
                <ChevronLeft className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Community Games & Peer Challenge Grid */}
      <MajlisInteractiveGrid />

      {/* Create Modal */}
      <CreateMajlisModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userStream={userStream}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  );
}
