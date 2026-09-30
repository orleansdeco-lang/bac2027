"use client";

export const dynamic = "force-dynamic";

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
import { CreateTableModal } from "@/components/diwan/CreateTableModal";

function DiwanMainContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const queryTableId = searchParams?.get("table") || searchParams?.get("roomId");

  // State
  const [tables, setTables] = useState<DiwanTable[]>([]);
  const [activeTable, setActiveTable] = useState<DiwanTable | null>(null);
  const [members, setMembers] = useState<DiwanMember[]>([]);
  const [messages, setMessages] = useState<DiwanMessage[]>([]);
  const [isUserSeated, setIsUserSeated] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userStream, setUserStream] = useState<StreamId>("sciences_exp");

  const [studentIdentity, setStudentIdentity] = useState({
    name: "طالب شاطر",
    wilayaCode: "16",
    avatar: "/illustrations/characters/scholar.jpg",
  });

  // Load student profile & identity
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
  const loadTable = useCallback(async (targetId: string) => {
    const table = await DiwanService.getTable(targetId);
    if (table) {
      setActiveTable(table);
      const mems = await DiwanService.getMembers(table.id);
      setMembers(mems);
      const msgs = await DiwanService.getMessages(table.id);
      setMessages(msgs);

      if (user?.id) {
        const isSeated = mems.some((m) => m.user_id === user.id);
        setIsUserSeated(isSeated);
      }
    } else {
      setActiveTable(null);
      setMembers([]);
      setMessages([]);
      setIsUserSeated(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (queryTableId) {
      loadTable(queryTableId);
    } else {
      setActiveTable(null);
    }
  }, [queryTableId, loadTable]);

  // Real-time subscription to active table
  useEffect(() => {
    if (!activeTable) return;

    const sub = DiwanService.subscribeToTable(activeTable.id, {
      onMemberChange: async () => {
        const mems = await DiwanService.getMembers(activeTable.id);
        setMembers(mems);
        if (user?.id) {
          setIsUserSeated(mems.some((m) => m.user_id === user.id));
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
  }, [activeTable, user?.id]);

  // Periodic presence heartbeat while seated
  useEffect(() => {
    if (!activeTable || !isUserSeated) return;
    const currentUserId = user?.id || "student-user";

    const interval = setInterval(() => {
      DiwanService.heartbeat(activeTable.id, currentUserId);
    }, 25000);

    return () => clearInterval(interval);
  }, [activeTable, isUserSeated, user?.id]);

  // Actions
  const handleSelectTable = (tableId: string) => {
    router.replace(`/diwan?table=${tableId}`, { scroll: false });
    loadTable(tableId);
  };

  const handleBackToLobby = () => {
    router.replace("/diwan", { scroll: false });
    setActiveTable(null);
    refreshTables();
  };

  const handleJoinTable = async () => {
    if (!activeTable) return;
    const currentUserId = user?.id || `anon-${Date.now()}`;
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
    }
  };

  const handleLeaveTable = async () => {
    if (!activeTable) return;
    const currentUserId = user?.id || `anon-${Date.now()}`;
    await DiwanService.leaveSeat(activeTable.id, currentUserId);
    setIsUserSeated(false);
    const updated = await DiwanService.getMembers(activeTable.id);
    setMembers(updated);
  };

  const handleStatusChange = async (status: StudentActivityStatus) => {
    if (!activeTable) return;
    const currentUserId = user?.id || `anon-${Date.now()}`;
    await DiwanService.updateActivityStatus(activeTable.id, currentUserId, status);
    const updated = await DiwanService.getMembers(activeTable.id);
    setMembers(updated);
  };

  const handleSendMessage = async (content: string, type: DiwanMessageType) => {
    if (!activeTable) return;
    const currentUserId = user?.id || `anon-${Date.now()}`;
    const newMsg = await DiwanService.sendMessage({
      tableId: activeTable.id,
      userId: currentUserId,
      userName: studentIdentity.name,
      userAvatar: studentIdentity.avatar,
      content,
      messageType: type,
    });
    setMessages((prev) => [...prev, newMsg]);
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
      hostUserId: user?.id,
    });

    // Auto join host
    const currentUserId = user?.id || `anon-${Date.now()}`;
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
    id: user?.id || "student-user",
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
          <DiwanLobbyView
            tables={tables}
            userStream={userStream}
            onSelectTable={handleSelectTable}
            onOpenCreateTable={() => setIsCreateModalOpen(true)}
          />
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
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs text-slate-400 font-bold">جاري تحميل طاولة المراجعة...</p>
          </div>
        </AppShell>
      }
    >
      <DiwanMainContent />
    </Suspense>
  );
}
