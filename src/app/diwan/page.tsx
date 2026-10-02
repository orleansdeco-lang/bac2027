"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/ui/AppShell";
import { useAuth } from "@/lib/auth/context";
import { getStrategicProfile, getRegistrationDraft } from "@/lib/onboarding/profile";
import { resolveStudentIdentity } from "@/lib/constants/majlis-config";
import { StreamId } from "@/types/education";
import { DiwanTable, DiwanMember, DiwanMessage, StudentActivityStatus, DiwanMessageType } from "@/types/diwan";
import { DiwanService } from "@/lib/diwan/diwan-service";
import { DiwanLobbyView } from "@/components/diwan/DiwanLobbyView";
import { DiwanTableView } from "@/components/diwan/DiwanTableView";
import { DiwanSharedSummariesTab } from "@/components/diwan/DiwanSharedSummariesTab";
import { ExperiencesView } from "@/components/experiences/ExperiencesView";
import { CreateTableModal } from "@/components/diwan/CreateTableModal";
import { trackProductEvent } from "@/lib/analytics";

function DiwanMainContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const queryTableId = searchParams?.get("table") || searchParams?.get("roomId");

  // Track diwan_opened on mount
  useEffect(() => {
    trackProductEvent("diwan_opened", {});
  }, []);

  // Multi-tab isolation: unique persistent ID per browser session/tab
  const [clientId, setClientId] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      let cid = sessionStorage.getItem("diwan_session_client_id");
      if (!cid) {
        cid = `student_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
        sessionStorage.setItem("diwan_session_client_id", cid);
      }
      setClientId(cid);
    }
  }, []);

  // Top Lobby Tab State: Tables vs Summaries vs Experiences
  const [activeTab, setActiveTab] = useState<"tables" | "summaries" | "experiences">("tables");

  // Core Room State
  const [tables, setTables] = useState<DiwanTable[]>([]);
  const [activeTable, setActiveTable] = useState<DiwanTable | null>(null);
  const [members, setMembers] = useState<DiwanMember[]>([]);
  const [messages, setMessages] = useState<DiwanMessage[]>([]);
  const [isUserSeated, setIsUserSeated] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userStream, setUserStream] = useState<StreamId>("sciences_exp");

  const [studentIdentity, setStudentIdentity] = useState({
    name: "أمين ك.",
    wilayaCode: "16",
    avatar: "/illustrations/characters/scholar.jpg",
  });

  // Effective authenticated or tab-isolated user ID
  const currentUserId = user?.id || clientId || "student-guest";

  // Load student profile & identity (Distinct Algerian persona per client session if unauthenticated)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const profile = getStrategicProfile(user?.id);
      const draft = getRegistrationDraft();

      let fallbackWilaya = "16";
      let fallbackName = "أمين ك.";

      if (!user && clientId) {
        const guestPersonas = [
          { name: "أمين ك.", wilaya: "16" }, // الجزائر
          { name: "سارة ب.", wilaya: "31" }, // وهران
          { name: "ياسين ق.", wilaya: "19" }, // سطيف
          { name: "مريم ع.", wilaya: "25" }, // قسنطينة
          { name: "كريم ر.", wilaya: "23" }, // عنابة
          { name: "هدى م.", wilaya: "15" }, // تيزي وزو
          { name: "حمزة ل.", wilaya: "13" }, // تلمسان
          { name: "نور الدين ش.", wilaya: "09" }, // البليدة
        ];
        let hash = 0;
        for (let i = 0; i < clientId.length; i++) {
          hash = (hash << 5) - hash + clientId.charCodeAt(i);
          hash |= 0;
        }
        const picked = guestPersonas[Math.abs(hash) % guestPersonas.length];
        fallbackName = picked.name;
        fallbackWilaya = picked.wilaya;
      }

      const identity = resolveStudentIdentity({ user, profile, draft, fallbackWilaya });
      if (!identity.name || identity.name === "طالب شاطر" || identity.name === "طالب") {
        identity.name = fallbackName;
      }
      setStudentIdentity(identity);

      if (profile?.streamId) {
        setUserStream(profile.streamId as StreamId);
      }
    }
  }, [user, clientId]);

  // Load active tables list
  const refreshTables = useCallback(async () => {
    const list = await DiwanService.fetchTables(userStream);
    setTables(list);
  }, [userStream]);

  useEffect(() => {
    refreshTables();
    const interval = setInterval(refreshTables, 10000);
    return () => clearInterval(interval);
  }, [refreshTables]);

  // Load active table details if queryTableId is present
  const loadTable = useCallback(
    async (targetId: string) => {
      const table = await DiwanService.getTable(targetId);
      if (table) {
        setActiveTable(table);
        const mems = await DiwanService.getMembers(table.id);
        setMembers(mems);
        const msgs = await DiwanService.getMessages(table.id);
        setMessages(msgs);

        const effectiveId = user?.id || clientId;
        if (effectiveId) {
          const isSeated = mems.some((m) => m.user_id === effectiveId);
          setIsUserSeated(isSeated);
        }
      } else {
        setActiveTable(null);
        setMembers([]);
        setMessages([]);
        setIsUserSeated(false);
      }
    },
    [user?.id, clientId]
  );

  useEffect(() => {
    if (queryTableId) {
      loadTable(queryTableId);
    } else {
      setActiveTable(null);
    }
  }, [queryTableId, loadTable]);

  // Real-time subscription to active table (Supabase Broadcast + Local BroadcastChannel)
  useEffect(() => {
    if (!activeTable) return;

    const sub = DiwanService.subscribeToTable(activeTable.id, {
      onMemberChange: async () => {
        const mems = await DiwanService.getMembers(activeTable.id);
        setMembers(mems);
        const effectiveId = user?.id || clientId;
        if (effectiveId) {
          setIsUserSeated(mems.some((m) => m.user_id === effectiveId));
        }
      },
      onNewMessage: (msg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      },
    });

    return () => {
      sub.unsubscribe();
    };
  }, [activeTable, user?.id, clientId]);

  // Active polling safety net (every 1.5s) while inside an active table
  useEffect(() => {
    if (!activeTable) return;

    const interval = setInterval(async () => {
      try {
        const [latestMembers, latestMessages] = await Promise.all([
          DiwanService.getMembers(activeTable.id),
          DiwanService.getMessages(activeTable.id),
        ]);
        setMembers(latestMembers);
        setMessages(latestMessages);
        const effectiveId = user?.id || clientId;
        if (effectiveId) {
          setIsUserSeated(latestMembers.some((m) => m.user_id === effectiveId));
        }
      } catch (err) {
        console.warn("[Diwan] Active table polling sync error:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activeTable, user?.id, clientId]);

  // Periodic presence heartbeat while seated
  useEffect(() => {
    if (!activeTable || !isUserSeated) return;

    const interval = setInterval(() => {
      DiwanService.heartbeat(activeTable.id, currentUserId);
    }, 25000);

    return () => clearInterval(interval);
  }, [activeTable, isUserSeated, currentUserId]);

  // Actions
  const handleSelectTable = async (tableId: string, autoJoin = false) => {
    router.replace(`/diwan?table=${tableId}`, { scroll: false });
    await loadTable(tableId);

    if (autoJoin) {
      const res = await DiwanService.takeSeat({
        tableId,
        user: {
          id: currentUserId,
          name: studentIdentity.name,
          avatar: studentIdentity.avatar,
          wilayaCode: studentIdentity.wilayaCode,
        },
      });

      if (res.allowed && res.member) {
        setIsUserSeated(true);
        const updated = await DiwanService.getMembers(tableId);
        setMembers(updated);
        trackProductEvent("diwan_table_joined", { table_id: tableId });
      }
    }
  };

  const handleBackToLobby = () => {
    router.replace("/diwan", { scroll: false });
    setActiveTable(null);
    refreshTables();
  };

  const handleJoinTable = async () => {
    if (!activeTable) return;
    const res = await DiwanService.takeSeat({
      tableId: activeTable.id,
      user: {
        id: currentUserId,
        name: studentIdentity.name,
        avatar: studentIdentity.avatar,
        wilayaCode: studentIdentity.wilayaCode,
      },
    });

    if (res.allowed && res.member) {
      setIsUserSeated(true);
      const updated = await DiwanService.getMembers(activeTable.id);
      setMembers(updated);
      trackProductEvent("diwan_table_joined", {
        table_id: activeTable.id,
        subject: activeTable.subject,
        stream: activeTable.stream,
      });
    }
  };

  const handleLeaveTable = async () => {
    if (!activeTable) return;
    await DiwanService.leaveSeat(activeTable.id, currentUserId);
    setIsUserSeated(false);
    const updated = await DiwanService.getMembers(activeTable.id);
    setMembers(updated);
  };

  const handleStatusChange = async (status: StudentActivityStatus) => {
    if (!activeTable) return;
    await DiwanService.updateActivityStatus(activeTable.id, currentUserId, status);
    const updated = await DiwanService.getMembers(activeTable.id);
    setMembers(updated);
  };

  const handleSendMessage = async (content: string, type: DiwanMessageType) => {
    if (!activeTable) return;
    const newMsg = await DiwanService.sendMessage({
      tableId: activeTable.id,
      userId: currentUserId,
      userName: studentIdentity.name,
      userAvatar: studentIdentity.avatar,
      content,
      messageType: type,
    });
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });
  };

  const handleSendReaction = (emoji: string) => {
    handleSendMessage(emoji, "reaction");
  };

  const handleCreateTable = async (tableConfig: {
    title: string;
    subject: string;
    topic: string;
    stream: StreamId;
    capacity: number;
    durationMinutes: number;
  }) => {
    const created = await DiwanService.createTable({
      ...tableConfig,
      hostUserId: user?.id || currentUserId,
    });

    trackProductEvent("diwan_table_created", {
      table_id: created.id,
      title: tableConfig.title,
      subject: tableConfig.subject,
      topic: tableConfig.topic,
      stream: tableConfig.stream,
      capacity: tableConfig.capacity,
    });

    // Auto join host
    await DiwanService.takeSeat({
      tableId: created.id,
      user: {
        id: currentUserId,
        name: studentIdentity.name,
        avatar: studentIdentity.avatar,
        wilayaCode: studentIdentity.wilayaCode,
      },
    });

    handleSelectTable(created.id);
  };

  const currentUserData = {
    id: currentUserId,
    name: studentIdentity.name,
    avatar: studentIdentity.avatar,
    wilayaCode: studentIdentity.wilayaCode,
  };

  return (
    <AppShell>
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6" dir="rtl">
        {activeTable ? (
          <DiwanTableView
            table={activeTable}
            members={members}
            currentUser={currentUserData}
            isUserSeated={isUserSeated}
            messages={messages}
            onJoinTable={handleJoinTable}
            onLeaveTable={handleLeaveTable}
            onStatusChange={handleStatusChange}
            onSendMessage={handleSendMessage}
            onSendReaction={handleSendReaction}
            onBackToLobby={handleBackToLobby}
          />
        ) : (
          <div className="space-y-6">
            {/* Top Navigation Tabs: High Contrast, Unified SHATER Design System */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-white border-2 border-slate-200/90 shadow-sm max-w-2xl mx-auto">
              <button
                type="button"
                onClick={() => setActiveTab("tables")}
                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "tables"
                    ? "bg-amber-400 text-slate-950 shadow-sm scale-[1.01]"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                }`}
              >
                <span>🪑</span>
                <span className="truncate">طاولات المراجعة</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("summaries")}
                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "summaries"
                    ? "bg-[#2C5E54] text-white shadow-sm scale-[1.01]"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                }`}
              >
                <span>📑</span>
                <span className="truncate">الملخصات والمنهجية</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("experiences")}
                className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === "experiences"
                    ? "bg-blue-600 text-white shadow-sm scale-[1.01]"
                    : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
                }`}
              >
                <span>🌟</span>
                <span className="truncate">تجارب المتفوقين</span>
              </button>
            </div>

            {/* Tab 1: Digital Study Tables */}
            {activeTab === "tables" && (
              <DiwanLobbyView
                tables={tables}
                userStream={userStream}
                onSelectTable={handleSelectTable}
                onOpenCreateTable={() => setIsCreateModalOpen(true)}
              />
            )}

            {/* Tab 2: Summaries & Ministerial Methodologies */}
            {activeTab === "summaries" && (
              <div className="animate-in fade-in duration-200">
                <DiwanSharedSummariesTab />
              </div>
            )}

            {/* Tab 3: Peer Experiences & Challenges */}
            {activeTab === "experiences" && (
              <div className="animate-in fade-in duration-200">
                <ExperiencesView embedded={true} />
              </div>
            )}
          </div>
        )}

        {/* Create Table Modal */}
        <CreateTableModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          userStream={userStream}
          onTableCreated={handleCreateTable}
        />
      </div>
    </AppShell>
  );
}

export default function DiwanPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex flex-col items-center justify-center min-h-[500px]" dir="rtl">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs sm:text-sm text-slate-800 font-black">جاري تحضير طاولة المراجعة...</p>
          </div>
        </AppShell>
      }
    >
      <DiwanMainContent />
    </Suspense>
  );
}
