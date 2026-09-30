"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Compass,
  MessageSquare,
  Landmark,
  Clock,
  Users,
  ChevronLeft,
  Zap,
  Activity,
  Plus,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  MessageSquareQuote,
  Target,
} from "lucide-react";
import { MajlisEntryHero, MajlisRoomType } from "./MajlisEntryHero";
import { MajlisActiveRoom } from "./MajlisActiveRoom";
import { MajlisSessionReportModal, SessionReportData } from "./MajlisSessionReportModal";
import { MajlisInspectorPanel } from "./MajlisInspectorPanel";
import { MajlisInteractiveGrid } from "./MajlisInteractiveGrid";
import { CreateMajlisModal } from "./CreateMajlisModal";
import { formatStudentPrivacyName, resolveStudentIdentity } from "@/lib/constants/majlis-config";
import { useAuth } from "@/lib/auth/context";
import { getStrategicProfile, getRegistrationDraft } from "@/lib/onboarding/profile";
import { StreamId } from "@/types/education";
import { ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";
import {
  MajlisService,
  MajlisRoom,
  MajlisMember,
  MajlisMessage,
  MajlisStudyMode,
} from "@/lib/campus/majlis-service";

export function MajlisWorkspace() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const queryRoomId = searchParams?.get("roomId") || searchParams?.get("table");
  const openCreateParam = searchParams?.get("openCreate");
  const initialSubjectParam = searchParams?.get("subject");
  const initialLessonParam = searchParams?.get("lesson");

  const [activeSubject, setActiveSubject] = useState(initialSubjectParam || "physics");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTableTopic, setActiveTableTopic] = useState("الدارة RC (شحن وتفريغ)");
  const [isDiscussionDrawerOpen, setIsDiscussionDrawerOpen] = useState(false);

  // User Student Identity (Privacy Name + Wilaya Code + Registered Character Avatar)
  const [studentIdentity, setStudentIdentity] = useState({
    name: "طالب شاطر",
    wilayaCode: "16",
    avatar: "/illustrations/characters/scholar.jpg",
  });
  const [userStream, setUserStream] = useState<StreamId>("sciences_exp");

  // Real-Time Room State
  const [activeRoom, setActiveRoom] = useState<MajlisRoom | null>(null);
  const [members, setMembers] = useState<MajlisMember[]>([]);
  const [messages, setMessages] = useState<MajlisMessage[]>([]);

  // Search & Filter State for Majlis Tables
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterMode, setFilterMode] = useState("all");
  const [filterVacantOnly, setFilterVacantOnly] = useState(false);

  // Time Extension Requests State (Host Approval)
  const [extensionRequest, setExtensionRequest] = useState<{
    requesterName: string;
    requesterId: string;
  } | null>(null);

  // Campus Authentic Stats & Rooms State
  const [stats, setStats] = useState({
    activeRoomsCount: 0,
    activeStudentsCount: 0,
    completedSessionsToday: 0,
  });
  const [presenceCount, setPresenceCount] = useState(0);
  const [activeRoomsList, setActiveRoomsList] = useState<MajlisRoom[]>([]);
  const [activeReactionNotification, setActiveReactionNotification] = useState<{
    fromName: string;
    emoji: string;
    message: string;
  } | null>(null);

  // Active Majlis Session State
  const [isUserSeated, setIsUserSeated] = useState(false);
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Post-Session Report Modal State
  const [sessionReport, setSessionReport] = useState<SessionReportData | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync incoming URL search params
  useEffect(() => {
    if (openCreateParam === "true") {
      setIsCreateModalOpen(true);
    }
    if (initialSubjectParam) {
      setActiveSubject(initialSubjectParam);
      setFilterSubject(initialSubjectParam);
    }
  }, [openCreateParam, initialSubjectParam]);

  // Load genuine student identity (Profile, Draft, Wilaya, Character Avatar)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const profile = getStrategicProfile(user?.id);
      const draft = getRegistrationDraft();
      const identity = resolveStudentIdentity({ user, profile, draft });
      setStudentIdentity(identity);

      if (profile?.streamId) {
        setUserStream(profile.streamId as StreamId);
      }
    }
  }, [user]);

  // Load campus authentic statistics and active rooms with live ≤ 10s polling
  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/campus/stats?t=" + Date.now(), {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            const raw = data.stats || data;
            setStats({
              activeRoomsCount: Number(raw.activeRoomsCount) || 0,
              activeStudentsCount: Number(raw.activeStudentsCount) || 0,
              completedSessionsToday: Number(raw.completedSessionsToday) || 0,
            });
          }
        }
      } catch (err) {
        console.warn("Failed to fetch campus stats", err);
      }
    };

    const fetchRooms = async () => {
      const rooms = await MajlisService.fetchActiveRooms(userStream);
      if (isMounted) {
        setActiveRoomsList(rooms);
      }
    };

    fetchStats();
    fetchRooms();
    const interval = setInterval(() => {
      fetchStats();
      fetchRooms();
    }, 8000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userStream]);

  // Load initial active room and its data
  const loadRoom = useCallback(async (targetRoomId?: string) => {
    let roomIdToLoad = targetRoomId || queryRoomId;

    if (!roomIdToLoad) {
      const activeRooms = await MajlisService.fetchActiveRooms(userStream);
      if (activeRooms.length > 0) {
        roomIdToLoad = activeRooms[0].id;
      } else {
        roomIdToLoad = "room-sciences-rc";
      }
    }

    const room = await MajlisService.getRoom(roomIdToLoad);
    if (room) {
      setActiveRoom(room);
      setActiveTableTopic(room.lesson || room.title);
      setActiveSubject(room.subject);

      const mems = await MajlisService.getMembers(room.id);
      setMembers(mems);

      const msgs = await MajlisService.getMessages(room.id);
      setMessages(msgs);

      if (user?.id) {
        const userSeat = mems.find((m) => m.user_id === user.id);
        if (userSeat) {
          setIsUserSeated(true);
          setSessionStart(new Date(userSeat.joined_at).getTime());
        }
      }
    } else {
      setActiveRoom(null);
      setMembers([]);
      setMessages([]);
    }
  }, [queryRoomId, userStream, user?.id]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  // Real-Time Supabase Channel Subscription with Presence & Reactions
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
      onReaction: (payload) => {
        if (!payload.toUserId || payload.toUserId === user?.id) {
          setActiveReactionNotification({
            fromName: payload.fromName,
            emoji: payload.reactionEmoji,
            message: payload.message,
          });
          showToast(`${payload.fromName} أرسل ${payload.reactionEmoji} ${payload.message}`);
          setTimeout(() => setActiveReactionNotification(null), 4000);
        }
      },
      onKick: (payload) => {
        if (payload.kickedUserId === user?.id) {
          setIsUserSeated(false);
          setSessionStart(null);
          showToast("تم إخراجك من المجلس بواسطة المنظم.");
        }
      },
      onPresenceSync: (presenceState: Record<string, any>) => {
        const count = Object.values(presenceState).flat().length;
        setPresenceCount(count);
      },
      onExtensionRequest: (payload) => {
        if (activeRoom && user?.id === activeRoom.host_user_id) {
          setExtensionRequest({
            requesterName: payload.fromUserName,
            requesterId: payload.fromUserId,
          });
          showToast(`طلب تمديد الوقت (+15د) من ${payload.fromUserName} ⏳`);
        }
      },
      onTimeExtended: (payload) => {
        setActiveRoom((prev) => (prev ? { ...prev, timer_end: payload.newTimerEnd } : null));
        showToast("تم تمديد وقت المجلس بـ 15 دقيقة إضافية! ⏳");
      },
    });

    if (isUserSeated && user?.id) {
      unsubscribe.trackPresence({
        userId: user.id,
        userName: studentIdentity.name,
        stream: userStream,
        roomId: activeRoom.id,
      });
    }

    return () => {
      unsubscribe();
    };
  }, [activeRoom, isUserSeated, user?.id, studentIdentity.name, userStream]);

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

  // Handle Join Seat
  const handleJoin = async () => {
    if (!user) {
      showToast("يرجى تسجيل الدخول أو إنشاء حساب لحجز مقعدك على الطاولة 🏛️");
      return;
    }

    if (!activeRoom) return;

    const roomStreamName = ALGERIAN_BAC_STREAMS[activeRoom.stream]?.name_ar || activeRoom.stream;
    if (userStream !== activeRoom.stream) {
      showToast(
        `هذا المجلس مخصص لشعبة ${roomStreamName}. يمكنك المشاهدة أو مشاركة الرابط مع زميل في هذه الشعبة.`
      );
      return;
    }

    const result = await MajlisService.takeSeat({
      roomId: activeRoom.id,
      roomStream: activeRoom.stream,
      user: {
        id: user.id,
        name: studentIdentity.name,
        avatar: studentIdentity.avatar,
        wilayaCode: studentIdentity.wilayaCode,
        stream: userStream,
      },
    });

    if (result.allowed) {
      setIsUserSeated(true);
      setSessionStart(Date.now());
      showToast("تم حجز مقعدك بنجاح! بالتوفيق في جلسة المذاكرة 🎯");
      loadRoom(activeRoom.id);
    } else {
      showToast(result.reason || "تعذر حجز المقعد.");
    }
  };

  // Handle Leave Seat
  const handleLeave = async () => {
    if (!activeRoom || !user) return;
    await MajlisService.leaveSeat(activeRoom.id, user.id);
    setIsUserSeated(false);
    setSessionStart(null);
    showToast("غادرت المجلس. تم حفظ وقت مذاكرتك في خطتك اليومية ✅");
    loadRoom(activeRoom.id);
  };

  // Seated member requests time extension
  const handleRequestExtension = async () => {
    if (!activeRoom || !user) return;
    try {
      await MajlisService.requestExtension({
        roomId: activeRoom.id,
        fromUserId: user.id,
        fromUserName: studentIdentity.name,
      });
      showToast("تم إرسال طلب تمديد الوقت (+15د) إلى صاحب المجلس ⏳");
    } catch {
      showToast("تعذر إرسال طلب التمديد.");
    }
  };

  // Host approves time extension
  const handleApproveExtension = async () => {
    if (!activeRoom || !user) return;
    const res = await MajlisService.extendRoomTime({
      roomId: activeRoom.id,
      hostUserId: user.id,
      additionalMinutes: 15,
    });
    if (res.success && res.newTimerEnd) {
      setActiveRoom((prev) => (prev ? { ...prev, timer_end: res.newTimerEnd } : null));
      setExtensionRequest(null);
      showToast("تمت الموافقة وتمديد وقت المجلس بـ 15 دقيقة إضافية ✅");
    } else {
      showToast(res.error || "تعذر تمديد وقت المجلس.");
    }
  };

  // Handle Chat Message Send
  const handleSendMessage = async (content: string) => {
    if (!activeRoom || !user) return;
    const msg = await MajlisService.sendMessage({
      roomId: activeRoom.id,
      userId: user.id,
      userName: studentIdentity.name,
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

    if (user && userStream === room.stream) {
      MajlisService.takeSeat({
        roomId: room.id,
        roomStream: room.stream,
        user: {
          id: user.id,
          name: studentIdentity.name,
          avatar: studentIdentity.avatar,
          wilayaCode: studentIdentity.wilayaCode,
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

  // Launch session from MajlisEntryHero
  const handleStartSessionFromHero = async (config: {
    roomType: MajlisRoomType;
    subjectId: string;
    topic: string;
    goal: string;
    durationMinutes: number;
  }) => {
    setActiveSubject(config.subjectId);
    setActiveTableTopic(config.topic);

    // If solo or public, find matching room or create virtual focus room
    const matchingRoom = activeRoomsList.find(
      (r) => r.subject === config.subjectId && r.stream === userStream
    );

    if (matchingRoom && config.roomType !== "solo") {
      loadRoom(matchingRoom.id);
      showToast(`تم الانضمام إلى مجلس: ${matchingRoom.title} 🏛️`);
    } else {
      // Create new targeted room
      const title =
        config.roomType === "solo"
          ? `جلسة فردية: ${config.topic}`
          : `مجلس مذاكرة: ${config.topic}`;

      const created = await MajlisService.createRoom({
        title,
        subject: config.subjectId,
        stream: userStream,
        capacity: config.roomType === "solo" ? 1 : 6,
        durationMinutes: config.durationMinutes,
        mode: "PAPER_PRACTICE",
        lesson: config.topic,
        hostUserId: user?.id,
      });

      handleRoomCreated(created);
    }
  };

  const subjectLabels: Record<string, string> = {
    math: "رياضيات",
    physics: "فيزياء",
    sciences: "علوم طبيعية",
    arabic: "لغة عربية",
    philosophy: "فلسفة",
    history_geo: "تاريخ وجغرافيا",
    islamic: "علوم إسلامية",
    french: "فرنسية",
    english: "إنجليزية",
  };

  const handleSendReaction = async (toUserId: string, reactionEmoji: string) => {
    if (!activeRoom || !user) {
      showToast("يرجى تسجيل الدخول أولاً لإرسال التشجيع ☕");
      return;
    }
    const emojiToMsg: Record<string, string> = {
      "☕": "فنجان قهوة ودعم لمواصلة التركيز",
      "🔥": "عزيمة وإصرار حتى البكالوريا",
      "👏": "أحسنت وبارك الله في جهدك",
      "💪": "عزيمة وقوة نحو الامتياز",
    };
    const message = emojiToMsg[reactionEmoji] || "تحية وتشجيع من زميلك";
    await MajlisService.sendReaction({
      roomId: activeRoom.id,
      fromUserId: user.id,
      fromName: studentIdentity.name,
      toUserId,
      reactionEmoji,
      message,
    });
    showToast(`تم إرسال ${reactionEmoji} بنجاح!`);
  };

  const currentUserData = {
    id: user?.id,
    name: studentIdentity.name,
    avatar: studentIdentity.avatar,
    wilayaCode: studentIdentity.wilayaCode,
    subject: subjectLabels[activeSubject] || "فيزياء",
    stream: userStream,
  };

  // Filtered rooms list matching user search queries and filters
  const filteredRooms = activeRoomsList.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = r.title.toLowerCase().includes(q);
      const matchLesson = (r.lesson || "").toLowerCase().includes(q);
      const matchSubj = (r.subject || "").toLowerCase().includes(q);
      if (!matchTitle && !matchLesson && !matchSubj) return false;
    }
    if (filterSubject !== "all" && r.subject !== filterSubject) return false;
    if (filterMode !== "all" && r.mode !== filterMode) return false;
    if (filterVacantOnly && (r.capacity || 6) <= 0) return false;
    return true;
  });

  const effectiveStudentsCount = Math.max(
    stats.activeStudentsCount,
    members.length,
    presenceCount,
    isUserSeated ? 1 : 0
  );
  const effectiveRoomsCount = stats.activeRoomsCount || (activeRoom ? 1 : 0);

  // Handle Finished Session
  const handleSessionFinished = (reportData: SessionReportData) => {
    setSessionReport(reportData);
    setIsReportOpen(true);
    handleLeave();
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

      {/* 1. New Intent-Driven Entry Hero: «واش راك حاب تقرا اليوم؟» */}
      <MajlisEntryHero
        userStream={userStream}
        activeSubject={activeSubject}
        onSelectSubject={(subj) => {
          setActiveSubject(subj);
          setFilterSubject(subj);
        }}
        onStartSession={handleStartSessionFromHero}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        stats={{
          activeRoomsCount: effectiveRoomsCount,
          activeStudentsCount: effectiveStudentsCount,
          completedSessionsToday: stats.completedSessionsToday,
        }}
      />

      {/* 2. Main Active Majlis Virtual Study Environment (3-Zone Layout) */}
      {activeRoom ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>مجلس الدراسة النشط حالياً</span>
            </div>

            <button
              type="button"
              onClick={() => setIsDiscussionDrawerOpen(!isDiscussionDrawerOpen)}
              className="py-1.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <MessageSquareQuote className="w-3.5 h-3.5 text-blue-400" />
              <span>{isDiscussionDrawerOpen ? "إخفاء لوحة النقاش" : "لوحة النقاش والرسائل"}</span>
            </button>
          </div>

          <MajlisActiveRoom
            room={activeRoom}
            members={members}
            currentUser={currentUserData}
            isUserSeated={isUserSeated}
            userElapsedSeconds={elapsedSeconds}
            onJoinSeat={handleJoin}
            onLeaveSeat={handleLeave}
            onSendReaction={handleSendReaction}
            onRequestExtension={handleRequestExtension}
            onFinishSession={handleSessionFinished}
            activeReactionNotification={activeReactionNotification}
          />

          {/* Optional Collapsible Discussion Panel */}
          {isDiscussionDrawerOpen && (
            <div className="pt-2 animate-in fade-in duration-200">
              <MajlisInspectorPanel
                topic={activeTableTopic}
                description={activeRoom?.lesson ? `الموضوع الدراسي: ${activeRoom.lesson}` : "نناقش اليوم: حل التمارين + مراجعة الدرس"}
                tags={[subjectLabels[activeSubject] || "مادة", ALGERIAN_BAC_STREAMS[activeRoom?.stream || userStream]?.name_ar || "الشعبة", "مباشر"]}
                members={members.map((m) => ({
                  id: m.id,
                  userId: m.user_id,
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
                roomId={activeRoom?.id}
                hostUserId={activeRoom?.host_user_id}
                extensionRequest={extensionRequest}
                onApproveExtensionRequest={handleApproveExtension}
                onDismissExtensionRequest={() => setExtensionRequest(null)}
                onKickMember={async (targetUserId) => {
                  if (activeRoom) {
                    await MajlisService.kickMember({ roomId: activeRoom.id, targetUserId });
                    showToast("تم طرد العضو من المجلس.");
                  }
                }}
              />
            </div>
          )}
        </div>
      ) : null}

      {/* 3. Search & Discovery Section for Majlis Tables */}
      <div className="rounded-3xl p-5 sm:p-6 border border-white/[0.08] bg-[#0B1222]/95 backdrop-blur-xl shadow-2xl space-y-4">
        {/* Header with Title and Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>استكشاف المجالس المفتوحة في شعبتك</span>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {filteredRooms.length} متاح
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                انضم لمجلس يدرس نفس مادتك أو افتح مجلساً جديداً لزملائك
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>افتح مجلس جديد 🏛️</span>
          </button>
        </div>

        {/* Filter Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن درس أو موضوع (المتتاليات، الدارة RC، الاستنساخ)..."
              className="w-full py-2.5 pr-10 pl-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400/80 transition-all"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full py-2.5 px-3 rounded-2xl bg-[#0F172A] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              <option value="all">كل المواد الدراسية</option>
              {Object.entries(subjectLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="w-full py-2.5 px-3 rounded-2xl bg-[#0F172A] border border-white/10 text-xs text-white focus:outline-none focus:border-blue-400 cursor-pointer"
            >
              <option value="all">كل أوضاع المذاكرة</option>
              <option value="PAPER_PRACTICE">حل مواضيع وتمارين</option>
              <option value="SPEED_TRIVIA">تحدي السرعة</option>
              <option value="RECALL_SESSION">مراجعة واسترجاع</option>
            </select>
          </div>
        </div>

        {/* Filter Quick Pills */}
        <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-bold">
              <Filter className="w-3 h-3 text-blue-400" />
              <span>فلاتر سريعة:</span>
            </span>

            <button
              type="button"
              onClick={() => setFilterVacantOnly(!filterVacantOnly)}
              className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                filterVacantOnly
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-white/[0.04] text-slate-400 border-white/10 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>المقاعد الشاغرة فقط 🪑</span>
            </button>
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-[11px] text-rose-400 hover:text-rose-300 underline"
            >
              مسح البحث
            </button>
          )}
        </div>

        {/* Filtered Rooms Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {filteredRooms.length === 0 ? (
            <div className="col-span-full py-8 text-center rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2">
              <p className="text-xs text-slate-400">
                لا توجد مجالس مطابقة لمعايير البحث في شعبة {ALGERIAN_BAC_STREAMS[userStream]?.name_ar || userStream}.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-1 text-xs text-blue-400 font-bold underline hover:text-blue-300"
              >
                + كن أول من يفتح مجلساً في هذا الدرس 🏛️
              </button>
            </div>
          ) : (
            filteredRooms.map((r) => {
              const isSelected = activeRoom?.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    loadRoom(r.id);
                    setActiveTableTopic(r.lesson || r.title);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? "bg-blue-600/20 border-blue-500/50 shadow-lg shadow-blue-500/10"
                      : "bg-white/[0.03] hover:bg-white/[0.06] border-white/[0.08]"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {subjectLabels[r.subject] || r.subject}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        {r.capacity} مقاعد
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug line-clamp-1">
                      {r.title}
                    </h4>

                    {r.lesson && (
                      <p className="text-xs text-slate-400 line-clamp-1">
                        الهدف: {r.lesson}
                      </p>
                    )}
                  </div>

                  <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{r.duration_minutes || 45} دقيقة</span>
                    </span>

                    <span className="text-blue-400 font-bold flex items-center gap-1">
                      <span>{isSelected ? "المجلس المعروض" : "الانضمام"}</span>
                      <ArrowRight className="w-3 h-3 rotate-180" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 4. Community Peer Challenge Grid */}
      <MajlisInteractiveGrid activeRoomId={activeRoom?.id} />

      {/* Create Modal */}
      <CreateMajlisModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userStream={userStream}
        initialSubject={initialSubjectParam || activeSubject}
        initialLesson={initialLessonParam || undefined}
        onRoomCreated={handleRoomCreated}
      />

      {/* Post-Session Report Modal */}
      {sessionReport && (
        <MajlisSessionReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          report={sessionReport}
          onStartNewSession={() => setIsCreateModalOpen(true)}
        />
      )}
    </div>
  );
}
