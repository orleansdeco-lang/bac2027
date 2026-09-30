/**
 * SHATER BAC — Diwan Digital Study Table & Multiplayer Service
 * 
 * Manages tables, seated students, real-time TikTok/DM-style chat,
 * server-evaluated multiplayer games, and moderation logs.
 */

import { supabase, isSupabaseConfigured } from "../supabase/client";
import { getAdminClient } from "../supabase/admin";
import {
  DiwanTable,
  DiwanMember,
  DiwanMessage,
  DiwanGameSession,
  DiwanGamePlayer,
  DiwanGameQuestion,
  StudentActivityStatus,
  DiwanMessageType,
  DiwanGameType,
} from "@/types/diwan";
import { StreamId } from "@/types/education";
import { getMultiplayerRoundQuestions } from "@/data/diwan/diwan-games";

// ============================================================================
// RESILIENT IN-MEMORY FALLBACK (For offline, 0 DZD demo, or offline tables)
// ============================================================================

const DEFAULT_MEMORY_TABLES: DiwanTable[] = [
  {
    id: "table-math-limits",
    title: "طاولة المتتاليات والنهايات 📐",
    subject: "math",
    topic: "المتتاليات العددية وسلوك الدوال",
    stream: "sciences_exp",
    capacity: 6,
    status: "ACTIVE",
    duration_minutes: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "table-phys-rc",
    title: "مراجعة الدارة RC وحل مسائل البكالوريا ⚡",
    subject: "physics",
    topic: "شحن وتفريغ المكثفة والتحليل البعدي",
    stream: "sciences_exp",
    capacity: 6,
    status: "ACTIVE",
    duration_minutes: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "table-sci-proteins",
    title: "طاولة تركيب البروتين والإنزيمات 🧬",
    subject: "sciences",
    topic: "الاستنساخ والترجمة وتأثير درجة الحرارة",
    stream: "sciences_exp",
    capacity: 4,
    status: "ACTIVE",
    duration_minutes: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "table-philo-problems",
    title: "مناقشة مقالة المشكلة والإشكالية 🏛️",
    subject: "philosophy",
    topic: "الفلسفة والعلم والمقارنة المنهجية",
    stream: "sciences_exp",
    capacity: 6,
    status: "ACTIVE",
    duration_minutes: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const inMemoryTables = new Map<string, DiwanTable>(
  DEFAULT_MEMORY_TABLES.map((t) => [t.id, t])
);

const inMemoryMembers = new Map<string, DiwanMember[]>();
const inMemoryMessages = new Map<string, DiwanMessage[]>();
const inMemoryGameSessions = new Map<string, DiwanGameSession>();

// Seed default members for authentic active presence
inMemoryMembers.set("table-math-limits", [
  {
    id: "mem-1",
    room_id: "table-math-limits",
    user_id: "user-sarah",
    user_name: "سارة ب.",
    user_avatar: "/illustrations/characters/sarah.jpg",
    wilaya_code: "16",
    current_status: "writing",
    seat_index: 0,
    school: "ثانوية الأمير عبد القادر",
    stream: "علوم تجريبية",
    currentTopic: "حل تمرين النهايات والمتتاليات التراجعية",
    joined_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "mem-2",
    room_id: "table-math-limits",
    user_id: "user-ali",
    user_name: "علي م.",
    user_avatar: "/illustrations/characters/ali.jpg",
    wilaya_code: "31",
    current_status: "studying",
    seat_index: 1,
    school: "ثانوية العقيد لطفي",
    stream: "رياضيات",
    currentTopic: "البرهان بالتراجع وتعيين اتجاه التغير",
    joined_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "mem-3",
    room_id: "table-math-limits",
    user_id: "user-yacine",
    user_name: "ياسين ق.",
    user_avatar: "/illustrations/characters/yassine.jpg",
    wilaya_code: "25",
    current_status: "answering",
    seat_index: 2,
    school: "ثانوية ابن باديس",
    stream: "تقني رياضي",
    currentTopic: "حساب المجموع Sn واستنتاج النهاية",
    joined_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
  },
]);

inMemoryMembers.set("table-phys-rc", [
  {
    id: "mem-rc-1",
    room_id: "table-phys-rc",
    user_id: "user-mariam",
    user_name: "مريم ب.",
    user_avatar: "/illustrations/characters/mariam.jpg",
    wilaya_code: "31",
    current_status: "writing",
    seat_index: 0,
    school: "ثانوية العقيد لطفي",
    stream: "علوم تجريبية",
    currentTopic: "حل المعادلة التفاضلية لثنائي القطب RC",
    joined_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  },
  {
    id: "mem-rc-2",
    room_id: "table-phys-rc",
    user_id: "user-scholar",
    user_name: "أمين ك.",
    user_avatar: "/illustrations/characters/scholar.jpg",
    wilaya_code: "16",
    current_status: "studying",
    seat_index: 1,
    school: "ثانوية رابح بيطاط",
    stream: "رياضيات",
    currentTopic: "التحليل البعدي لثابت الزمن تاو τ",
    joined_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
]);

inMemoryMembers.set("table-sci-proteins", [
  {
    id: "mem-sci-1",
    room_id: "table-sci-proteins",
    user_id: "user-girl",
    user_name: "خديجة ع.",
    user_avatar: "/illustrations/characters/girl.jpg",
    wilaya_code: "25",
    current_status: "answering",
    seat_index: 0,
    school: "ثانوية زيغود يوسف",
    stream: "علوم تجريبية",
    currentTopic: "رسم تخطيطي لآلية الاستنساخ والترجمة",
    joined_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: "mem-sci-2",
    room_id: "table-sci-proteins",
    user_id: "user-boy",
    user_name: "حمزة ت.",
    user_avatar: "/illustrations/characters/boy.jpg",
    wilaya_code: "05",
    current_status: "studying",
    seat_index: 1,
    school: "ثانوية مصطفى بن بولعيد",
    stream: "علوم تجريبية",
    currentTopic: "مقارنة شفرات الـ ARNm وتأثير الطفرات",
    joined_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
]);

inMemoryMembers.set("table-philo-problems", [
  {
    id: "mem-philo-1",
    room_id: "table-philo-problems",
    user_id: "user-sarah2",
    user_name: "إيمان ل.",
    user_avatar: "/illustrations/characters/sarah.jpg",
    wilaya_code: "13",
    current_status: "writing",
    seat_index: 0,
    school: "ثانوية الدكتور بن زرجب",
    stream: "آداب وفلسفة",
    currentTopic: "كتابة مقدمة مقالة المشكلة والإشكالية",
    joined_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
]);

inMemoryMessages.set("table-math-limits", [
  {
    id: "msg-1",
    room_id: "table-math-limits",
    user_id: "user-sarah",
    user_name: "سارة ب.",
    user_avatar: "/illustrations/characters/sarah.jpg",
    content: "سلام عليكم جميعاً! رانا نحلوا في تمرين المتتاليات التراجعية صفحة 32 👋",
    message_type: "chat",
    created_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
  },
  {
    id: "msg-2",
    room_id: "table-math-limits",
    user_id: "user-ali",
    user_name: "علي م.",
    user_avatar: "/illustrations/characters/ali.jpg",
    content: "سؤال: كيفاش نبرهنوا بالتراجع على أن Un < 2 في السؤال الثاني؟ 🤔",
    message_type: "question",
    created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  },
]);

inMemoryMessages.set("table-phys-rc", [
  {
    id: "msg-rc-1",
    room_id: "table-phys-rc",
    user_id: "user-mariam",
    user_name: "مريم ب.",
    user_avatar: "/illustrations/characters/mariam.jpg",
    content: "صحا رفاق! شكون عندو فكرة على التحليل البعدي لثابت الزمن τ = R.C؟ ⚡",
    message_type: "question",
    created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "msg-rc-2",
    room_id: "table-phys-rc",
    user_id: "user-scholar",
    user_name: "أمين ك.",
    user_avatar: "/illustrations/characters/scholar.jpg",
    content: "نستعملو قانون أوم U = R.I وشحنة المكثفة Q = C.U ونختزلو التوتر والشدة، يخرج بالثانية [s] 📐",
    message_type: "chat",
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
]);

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

export const DiwanService = {
  /**
   * Fetch all active digital study tables
   */
  async fetchTables(stream?: StreamId): Promise<DiwanTable[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from("diwan_rooms")
          .select("*")
          .eq("status", "ACTIVE")
          .order("created_at", { ascending: false });

        if (stream) {
          query = query.or(`stream.eq.${stream},stream.eq.ALL`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            title: d.title,
            subject: d.subject,
            topic: d.topic,
            stream: d.stream as StreamId,
            capacity: d.capacity || 6,
            status: d.status,
            host_user_id: d.host_user_id,
            duration_minutes: d.duration_minutes || 45,
            created_at: d.created_at,
            updated_at: d.updated_at,
          }));
        }
      } catch (err) {
        console.warn("[DiwanService] Supabase fetch error, fallback to memory", err);
      }
    }

    // Fallback enriched with seated member previews
    return Array.from(inMemoryTables.values())
      .filter((t) => {
        if (stream && t.stream !== stream && t.stream !== ("ALL" as any)) return false;
        return t.status === "ACTIVE";
      })
      .map((t) => {
        const mems = inMemoryMembers.get(t.id) || [];
        return {
          ...t,
          member_count: mems.length,
          membersPreview: mems.slice(0, 4).map((m) => ({
            name: m.user_name,
            avatar: m.user_avatar,
            status: m.current_status,
          })),
        };
      });
  },

  /**
   * Fetch specific table by ID
   */
  async getTable(tableId: string): Promise<DiwanTable | null> {
    if (!tableId) return null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("diwan_rooms")
          .select("*")
          .eq("id", tableId)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            title: data.title,
            subject: data.subject,
            topic: data.topic,
            stream: data.stream as StreamId,
            capacity: data.capacity || 6,
            status: data.status,
            host_user_id: data.host_user_id,
            duration_minutes: data.duration_minutes || 45,
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
        }
      } catch (err) {
        console.warn("[DiwanService] Supabase getTable error", err);
      }
    }

    return inMemoryTables.get(tableId) || null;
  },

  /**
   * Create a new digital study table
   */
  async createTable(params: {
    title: string;
    subject: string;
    topic: string;
    stream: StreamId;
    capacity?: number;
    durationMinutes?: number;
    hostUserId?: string;
  }): Promise<DiwanTable> {
    const tableId = `table-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const newTable: DiwanTable = {
      id: tableId,
      title: params.title.trim(),
      subject: params.subject,
      topic: params.topic.trim(),
      stream: params.stream,
      capacity: Math.min(8, Math.max(2, params.capacity || 6)),
      status: "ACTIVE",
      duration_minutes: params.durationMinutes || 45,
      host_user_id: params.hostUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    inMemoryTables.set(tableId, newTable);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("diwan_rooms").insert({
          id: newTable.id,
          title: newTable.title,
          subject: newTable.subject,
          topic: newTable.topic,
          stream: newTable.stream,
          capacity: newTable.capacity,
          status: newTable.status,
          duration_minutes: newTable.duration_minutes,
          host_user_id: newTable.host_user_id || null,
        });
      } catch (err) {
        console.warn("[DiwanService] Supabase createTable error", err);
      }
    }

    return newTable;
  },

  /**
   * Fetch members seated at a table
   */
  async getMembers(tableId: string): Promise<DiwanMember[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("diwan_room_members")
          .select("*")
          .eq("room_id", tableId)
          .order("seat_index", { ascending: true });

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            room_id: d.room_id,
            user_id: d.user_id,
            user_name: d.user_name,
            user_avatar: d.user_avatar,
            wilaya_code: d.wilaya_code || "16",
            current_status: d.current_status || "studying",
            seat_index: d.seat_index || 0,
            joined_at: d.joined_at,
            last_seen_at: d.last_seen_at,
          }));
        }
      } catch (err) {
        console.warn("[DiwanService] Supabase getMembers error", err);
      }
    }

    return inMemoryMembers.get(tableId) || [];
  },

  /**
   * Take a seat at the digital table
   */
  async takeSeat(params: {
    tableId: string;
    user: {
      id: string;
      name: string;
      avatar: string;
      wilayaCode?: string;
    };
    preferredSeat?: number;
  }): Promise<{ allowed: boolean; member?: DiwanMember; reason?: string }> {
    const existing = await this.getMembers(params.tableId);
    const table = await this.getTable(params.tableId);

    if (existing.length >= (table?.capacity || 6)) {
      return { allowed: false, reason: "الطاولة ممتلئة بالكامل حالياً 🪑" };
    }

    // Check if user already seated
    const alreadySeated = existing.find((m) => m.user_id === params.user.id);
    if (alreadySeated) {
      return { allowed: true, member: alreadySeated };
    }

    // Prevent seat index collisions
    const occupiedSeats = new Set(existing.map((m) => m.seat_index));
    let assignedSeat = params.preferredSeat;
    if (assignedSeat === undefined || occupiedSeats.has(assignedSeat)) {
      for (let i = 0; i < (table?.capacity || 6); i++) {
        if (!occupiedSeats.has(i)) {
          assignedSeat = i;
          break;
        }
      }
    }
    if (assignedSeat === undefined) {
      return { allowed: false, reason: "لا توجد مقاعد شاغرة حالياً." };
    }

    const member: DiwanMember = {
      id: `mem-${Date.now()}`,
      room_id: params.tableId,
      user_id: params.user.id,
      user_name: params.user.name,
      user_avatar: params.user.avatar,
      wilaya_code: params.user.wilayaCode || "16",
      current_status: "studying",
      seat_index: assignedSeat,
      joined_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
    };

    const updated = [...existing, member];
    inMemoryMembers.set(params.tableId, updated);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("diwan_room_members").upsert({
          room_id: member.room_id,
          user_id: member.user_id,
          user_name: member.user_name,
          user_avatar: member.user_avatar,
          wilaya_code: member.wilaya_code,
          current_status: member.current_status,
          seat_index: member.seat_index,
          joined_at: member.joined_at,
          last_seen_at: member.last_seen_at,
        });
      } catch (err) {
        console.warn("[DiwanService] Supabase takeSeat error", err);
      }
    }

    return { allowed: true, member };
  },

  /**
   * Periodic presence heartbeat to prevent stale seats and impersonation
   */
  async heartbeat(tableId: string, userId: string): Promise<void> {
    const existing = inMemoryMembers.get(tableId) || [];
    const member = existing.find((m) => m.user_id === userId);
    if (member) {
      member.last_seen_at = new Date().toISOString();
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase
            .from("diwan_room_members")
            .update({ last_seen_at: member.last_seen_at })
            .eq("room_id", tableId)
            .eq("user_id", userId);
        } catch {}
      }
    }
  },

  /**
   * Leave seat at the table
   */
  async leaveSeat(tableId: string, userId: string): Promise<void> {
    const existing = inMemoryMembers.get(tableId) || [];
    inMemoryMembers.set(tableId, existing.filter((m) => m.user_id !== userId));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("diwan_room_members")
          .delete()
          .match({ room_id: tableId, user_id: userId });
      } catch (err) {
        console.warn("[DiwanService] Supabase leaveSeat error", err);
      }
    }
  },

  /**
   * Update student's real-time activity status (studying, writing, helping, playing)
   */
  async updateActivityStatus(
    tableId: string,
    userId: string,
    status: StudentActivityStatus
  ): Promise<void> {
    const members = inMemoryMembers.get(tableId) || [];
    const target = members.find((m) => m.user_id === userId);
    if (target) {
      target.current_status = status;
      target.last_seen_at = new Date().toISOString();
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("diwan_room_members")
          .update({ current_status: status, last_seen_at: new Date().toISOString() })
          .match({ room_id: tableId, user_id: userId });
      } catch (err) {
        console.warn("[DiwanService] Supabase updateActivityStatus error", err);
      }
    }
  },

  /**
   * Fetch chat messages for table
   */
  async getMessages(tableId: string): Promise<DiwanMessage[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("diwan_messages")
          .select("*")
          .eq("room_id", tableId)
          .eq("is_deleted", false)
          .order("created_at", { ascending: true })
          .limit(100);

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            room_id: d.room_id,
            user_id: d.user_id,
            user_name: d.user_name,
            user_avatar: d.user_avatar,
            content: d.content,
            message_type: d.message_type || "chat",
            reply_to_id: d.reply_to_id,
            attachment_url: d.attachment_url,
            is_deleted: d.is_deleted,
            created_at: d.created_at,
          }));
        }
      } catch (err) {
        console.warn("[DiwanService] Supabase getMessages error", err);
      }
    }

    return inMemoryMessages.get(tableId) || [];
  },

  /**
   * Send live message in room
   */
  async sendMessage(params: {
    tableId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    messageType?: DiwanMessageType;
    replyToId?: string | null;
  }): Promise<DiwanMessage> {
    const newMsg: DiwanMessage = {
      id: `msg-${Date.now()}`,
      room_id: params.tableId,
      user_id: params.userId,
      user_name: params.userName,
      user_avatar: params.userAvatar,
      content: params.content.trim(),
      message_type: params.messageType || "chat",
      reply_to_id: params.replyToId || null,
      is_deleted: false,
      created_at: new Date().toISOString(),
    };

    const existing = inMemoryMessages.get(params.tableId) || [];
    inMemoryMessages.set(params.tableId, [...existing, newMsg]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("diwan_messages").insert({
          room_id: newMsg.room_id,
          user_id: newMsg.user_id,
          user_name: newMsg.user_name,
          user_avatar: newMsg.user_avatar,
          content: newMsg.content,
          message_type: newMsg.message_type,
          reply_to_id: newMsg.reply_to_id,
        });
      } catch (err) {
        console.warn("[DiwanService] Supabase sendMessage error", err);
      }
    }

    return newMsg;
  },

  /**
   * Report message for moderation
   */
  async reportMessage(params: {
    messageId: string;
    tableId: string;
    reporterUserId: string;
    reason: string;
    details?: string;
  }): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("diwan_message_reports").insert({
          message_id: params.messageId,
          room_id: params.tableId,
          reporter_user_id: params.reporterUserId,
          reason: params.reason,
          details: params.details || null,
        });
      } catch (err) {
        console.warn("[DiwanService] reportMessage error", err);
      }
    }
  },

  /**
   * Moderate/delete message
   */
  async deleteMessage(messageId: string, moderatorId: string, reason: string): Promise<void> {
    Array.from(inMemoryMessages.entries()).forEach(([tableId, msgs]) => {
      inMemoryMessages.set(
        tableId,
        msgs.filter((m: DiwanMessage) => m.id !== messageId)
      );
    });

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("diwan_messages")
          .update({ is_deleted: true })
          .eq("id", messageId);

        await supabase.from("diwan_moderation_logs").insert({
          action_type: "DELETE_MESSAGE",
          target_type: "MESSAGE",
          target_id: messageId,
          moderator_id: moderatorId,
          reason,
        });
      } catch (err) {
        console.warn("[DiwanService] deleteMessage error", err);
      }
    }
  },

  /**
   * Fetch active multiplayer challenge for a room
   */
  async getActiveGame(roomId: string): Promise<{ session: DiwanGameSession | null; players: DiwanGamePlayer[] }> {
    try {
      const res = await fetch(`/api/diwan/games?roomId=${roomId}`, { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("[DiwanService] getActiveGame error:", e);
    }
    return { session: null, players: [] };
  },

  /**
   * Create a new multiplayer challenge session
   */
  async createChallenge(params: {
    roomId: string;
    gameType: DiwanGameType;
    subject: string;
    topic?: string;
    hostUser: { id: string; name: string; avatar: string };
    totalRounds?: number;
  }): Promise<{ session: DiwanGameSession; players: DiwanGamePlayer[] }> {
    try {
      const res = await fetch("/api/diwan/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_CHALLENGE",
          ...params,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("[DiwanService] createChallenge error:", e);
    }

    // Resilient fallback
    const fallbackSession: DiwanGameSession = {
      id: `game-${Date.now()}`,
      room_id: params.roomId,
      game_type: params.gameType,
      subject: params.subject,
      topic: params.topic || "مراجعة شاملة",
      status: "WAITING",
      current_round: 1,
      total_rounds: params.totalRounds || 3,
      round_duration_seconds: 20,
      host_user_id: params.hostUser.id,
      host_user_name: params.hostUser.name,
      created_at: new Date().toISOString(),
    };
    const fallbackPlayer: DiwanGamePlayer = {
      id: `p-${Date.now()}`,
      session_id: fallbackSession.id,
      user_id: params.hostUser.id,
      user_name: params.hostUser.name,
      user_avatar: params.hostUser.avatar,
      score: 0,
      streak: 0,
    };
    return { session: fallbackSession, players: [fallbackPlayer] };
  },

  /**
   * Join an existing multiplayer challenge
   */
  async joinChallenge(sessionId: string, user: { id: string; name: string; avatar: string }) {
    try {
      const res = await fetch("/api/diwan/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "JOIN_CHALLENGE",
          sessionId,
          user,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("[DiwanService] joinChallenge error:", e);
    }
    return null;
  },

  /**
   * Start countdown: WAITING -> STARTING
   */
  async startCountdown(sessionId: string, userId: string) {
    try {
      const res = await fetch("/api/diwan/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "START_COUNTDOWN",
          sessionId,
          userId,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("[DiwanService] startCountdown error:", e);
    }
    return null;
  },

  /**
   * Start round: STARTING -> PLAYING
   */
  async startRound(sessionId: string) {
    try {
      const res = await fetch("/api/diwan/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "START_ROUND",
          sessionId,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("[DiwanService] startRound error:", e);
    }
    return null;
  },

  /**
   * Submit answer with server-side validation
   */
  async submitAnswer(params: {
    sessionId: string;
    userId: string;
    roundNumber: number;
    selectedIndex: number;
  }) {
    try {
      const res = await fetch("/api/diwan/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SUBMIT_ANSWER",
          ...params,
          clientTimestamp: Date.now(),
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("[DiwanService] submitAnswer error:", e);
    }
    return null;
  },

  /**
   * Advance to next round or finish
   */
  async nextRound(sessionId: string, userId: string) {
    try {
      const res = await fetch("/api/diwan/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "NEXT_ROUND",
          sessionId,
          userId,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn("[DiwanService] nextRound error:", e);
    }
    return null;
  },

  /**
   * Finish game session
   */
  async finishGame(sessionId: string) {
    try {
      await fetch("/api/diwan/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "FINISH_GAME",
          sessionId,
        }),
      });
    } catch (e) {
      console.warn("[DiwanService] finishGame error:", e);
    }
  },

  /**
   * Subscribe to real-time events for a table
   */
  subscribeToTable(
    tableId: string,
    callbacks: {
      onMemberChange?: () => void;
      onNewMessage?: (msg: DiwanMessage) => void;
      onGameUpdate?: (game: DiwanGameSession) => void;
      onReaction?: (payload: { fromName: string; emoji: string }) => void;
    }
  ): { unsubscribe: () => void; sendBroadcastReaction: (fromName: string, emoji: string) => void } {
    if (!isSupabaseConfigured || !supabase) {
      return {
        unsubscribe: () => {},
        sendBroadcastReaction: () => {},
      };
    }

    const channel = supabase.channel(`diwan-table-${tableId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "diwan_room_members", filter: `room_id=eq.${tableId}` },
        () => {
          if (callbacks.onMemberChange) callbacks.onMemberChange();
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "diwan_messages", filter: `room_id=eq.${tableId}` },
        (payload) => {
          if (callbacks.onNewMessage && payload.new) {
            callbacks.onNewMessage(payload.new as DiwanMessage);
          }
        }
      )
      .on("broadcast", { event: "reaction" }, ({ payload }) => {
        if (callbacks.onReaction) callbacks.onReaction(payload);
      })
      .on("broadcast", { event: "game_event" }, ({ payload }) => {
        if (callbacks.onGameUpdate) callbacks.onGameUpdate(payload);
      })
      .subscribe();

    return {
      unsubscribe: () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      },
      sendBroadcastReaction: (fromName: string, emoji: string) => {
        channel.send({
          type: "broadcast",
          event: "reaction",
          payload: { fromName, emoji },
        });
      },
    };
  },
};
