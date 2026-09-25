import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { StreamId } from "@/types/education";
import { CampusService } from "./campus-service";

export type MajlisStudyMode =
  | "PAPER_PRACTICE"
  | "SPEED_BATTLE"
  | "GROUP_MEMORIZATION"
  | "FULL_EXAM"
  | "DIGITAL_QUIZ";

export interface MajlisRoom {
  id: string;
  title: string;
  stream: StreamId;
  subject: string;
  lesson: string;
  mode: MajlisStudyMode;
  host_user_id?: string;
  capacity: number;
  status: "LOBBY" | "ACTIVE" | "COMPLETED";
  current_step: string;
  timer_end?: string;
  active_material?: any;
  created_at: string;
  updated_at?: string;
}

export interface MajlisMember {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  user_stream: StreamId;
  seat_index: number;
  status: "SEATED" | "SOLVING" | "FINISHED" | "SPECTATING";
  score: number;
  finished_paper: boolean;
  joined_at: string;
}

export interface MajlisMessage {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  user_stream: string;
  content: string;
  created_at: string;
}

// Built-in Curated Material Generator for Instant Sync
export function getInitialMaterialForMode(mode: MajlisStudyMode, subject: string, lesson: string) {
  if (mode === "PAPER_PRACTICE") {
    return {
      type: "PAPER_EXERCISE",
      durationSeconds: 15 * 60, // 15 mins default
      exercise: {
        title: `تمرين نموذجي في ${lesson}`,
        text: `الموضوع الرسمي للتدريب:\nليكن لدينا التمرين التالي في ${lesson}.\n1. أثبت بالتراجع أو بالبرهان الرياضي صحة الخاصية المعطاة.\n2. احسب نهاية المتتالية أو قيمة الثابت الفيزيائي مع كتابة كامل الخطوات على كراسك.\n3. فسر النتيجة المحصل عليها بيانيا ومقارنتها بالمعطيات النظرية.`,
        instructions: "حل التمرين على كراسك بتركيز تام، وعند الانتهاء اضغط على زر «أنهيت الحل على الكراس ✍️» لمشاهدة سلم التنقيط الوزاري والتقييم الذاتي.",
      },
      rubric: [
        { item: "كتابة القانون أو نص الخاصية بالشكل الصحيح", points: 1.0 },
        { item: "التعويض العددي الدقيق مع احترام الوحدات الدولية", points: 1.5 },
        { item: "التبرير المنهجي والاستنتاج النهائي", points: 1.5 },
        { item: "نظافة ورقة الإجابة والتنظيم الهندسي للحل", points: 1.0 },
      ],
      totalPoints: 5.0,
      modelAnswer: `الحل النموذجي المعتمد:\n- الخطوة 1: التحقق من الأساس والحالة الابتدائية n=0.\n- الخطوة 2: صياغة فرض التراجع ثم إثبات صحة الخاصية من أجل n+1.\n- الخطوة 3: استنتاج أن المتتالية متقاربة لأنها متزايدة ومحدودة من الأعلى.`,
    };
  }

  if (mode === "SPEED_BATTLE") {
    return {
      type: "SPEED_QUESTIONS",
      questionDurationSeconds: 15,
      questions: [
        {
          id: "q-speed-1",
          question: "متى انعقد مؤتمر الصومام الذي أعاد هيكلة الثورة التحريرية الجزائرية؟",
          options: ["20 أوت 1956", "1 نوفمبر 1954", "20 أوت 1955", "19 مارس 1962"],
          correctIndex: 0,
          explanation: "انعقد مؤتمر الصومام التاريخي في 20 أوت 1956 في قرية إيفري أوزلاقن بوادي الصومام.",
        },
        {
          id: "q-speed-2",
          question: "ما هو المقصد الشرعي الضروري لحفظ النفس في التشريع الإسلامي؟",
          options: ["تحريم الاعتداء والقتل والقصاص", "تحريم السرقة وقطع اليد", "تحريم الخمر والمسكرات", "تشريع الزواج"],
          correctIndex: 0,
          explanation: "حفظ النفس مقصد ضروري شُرع لحمايته تحريم القتل وتشريع القصاص والدفاع الشرعي.",
        },
        {
          id: "q-speed-3",
          question: "في الدارة الكهربائية RC، ما هي العبارة الرياضية لثابت الزمن τ؟",
          options: ["τ = R × C", "τ = R / C", "τ = L / R", "τ = 1 / (R × C)"],
          correctIndex: 0,
          explanation: "ثابت الزمن في دارة ثنائي القطب RC يعطى بالعلاقة τ = R · C ووحدته الثانية (s).",
        },
        {
          id: "q-speed-4",
          question: "إذا كانت (Un) متتالية هندسية أساسها q=2 وحدها الأول U0=3، فإن U3 يساوي:",
          options: ["24", "18", "12", "48"],
          correctIndex: 0,
          explanation: "U3 = U0 * q^3 = 3 * (2^3) = 3 * 8 = 24.",
        },
      ],
    };
  }

  if (mode === "GROUP_MEMORIZATION") {
    return {
      type: "MEMORIZATION_CARDS",
      memorizeDurationSeconds: 10 * 60, // 10 mins reading
      cardTitle: `عناصر الحفظ والتثبيت: ${lesson}`,
      fullText: "استراتيجية المعسكر الغربي الاقتصادية: مشروع مارشال 1947 لتقديم مساعدات لأوروبا، مبدأ ترومان 1947 لمحاصرة المد الشيوعي، ومشروع أيزنهاور 1957 لملء الفراغ في الشرق الأوسط.",
      maskedText: "استراتيجية المعسكر الغربي الاقتصادية: مشروع [_____] 1947 لتقديم مساعدات لأوروبا، مبدأ [_____] 1947 لمحاصرة المد الشيوعي، ومشروع [_____] 1957 لملء الفراغ في الشرق الأوسط.",
      recallQuestions: [
        {
          id: "rec-1",
          question: "ما اسم المشروع الاقتصادي الأمريكي لسنة 1947 الموجه لإعادة بناء أوروبا؟",
          correctAnswer: "مشروع مارشال",
          keywords: ["مارشال", "مشروع مارشال"],
        },
        {
          id: "rec-2",
          question: "ما اسم المبدأ السياسي-المالي لسنة 1947 الموجه لدعم اليونان وتركيا لمحاصرة الشيوعية؟",
          correctAnswer: "مبدأ ترومان",
          keywords: ["ترومان", "مبدأ ترومان"],
        },
        {
          id: "rec-3",
          question: "ما اسم المشروع الذي أُعلن سنة 1957 لتقديم مساعدات لدول الشرق الأوسط تحت شعار ملء الفراغ؟",
          correctAnswer: "مشروع أيزنهاور",
          keywords: ["أيزنهاور", "مشروع أيزنهاور"],
        },
      ],
    };
  }

  // Default Full Exam mode
  return {
    type: "FULL_EXAM_TOPIC",
    durationSeconds: 120 * 60,
    examTitle: `موضوع بكالوريا تجريبي شامل في ${lesson}`,
    parts: [
      { name: "الجزء الأول (10 نقاط)", description: "دراسة دالة عددية والاشتقاقية ونقاط الانعطاف والمستقيمات المقاربة" },
      { name: "الجزء الثاني (10 نقاط)", description: "المتتاليات العددية المرفقة بالدالة وحساب المجاميع والنهايات" },
    ],
  };
}

// In-Memory Fallback Cache for local resilience
const localRooms = new Map<string, MajlisRoom>();
const localMembers = new Map<string, MajlisMember[]>();
const localMessages = new Map<string, MajlisMessage[]>();

// Seed default room
const DEFAULT_ROOM_ID = "room-sciences-rc";
const defaultRoom: MajlisRoom = {
  id: DEFAULT_ROOM_ID,
  title: "حل تمرين الدارة RC — بكالوريا 2022 بالتوقيت الصارم",
  stream: "sciences_exp",
  subject: "physics",
  lesson: "ثنائي القطب RC (شحن وتفريغ مكثفة)",
  mode: "PAPER_PRACTICE",
  capacity: 6,
  status: "ACTIVE",
  current_step: "SOLVING",
  timer_end: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
  active_material: getInitialMaterialForMode("PAPER_PRACTICE", "physics", "ثنائي القطب RC"),
  created_at: new Date().toISOString(),
};
localRooms.set(DEFAULT_ROOM_ID, defaultRoom);
localMembers.set(DEFAULT_ROOM_ID, [
  {
    id: "mem-1",
    room_id: DEFAULT_ROOM_ID,
    user_id: "user-yassine",
    user_name: "ياسين",
    user_avatar: "/illustrations/characters/yassine.jpg",
    user_stream: "sciences_exp",
    seat_index: 0,
    status: "SOLVING",
    score: 0,
    finished_paper: false,
    joined_at: new Date().toISOString(),
  },
  {
    id: "mem-2",
    room_id: DEFAULT_ROOM_ID,
    user_id: "user-sarah",
    user_name: "سارة",
    user_avatar: "/illustrations/characters/sarah.jpg",
    user_stream: "sciences_exp",
    seat_index: 1,
    status: "SOLVING",
    score: 0,
    finished_paper: true,
    joined_at: new Date().toISOString(),
  },
]);

export const MajlisService = {
  /**
   * Create a new Majlis room and persist to Supabase & local cache
   */
  async createRoom(params: {
    title: string;
    stream: StreamId;
    subject: string;
    lesson: string;
    mode: MajlisStudyMode;
    capacity: number;
    hostUserId?: string;
    hostName?: string;
    hostAvatar?: string;
  }): Promise<MajlisRoom> {
    const roomId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const material = getInitialMaterialForMode(params.mode, params.subject, params.lesson);
    const durationSec = material.durationSeconds || 900;
    const timerEnd = new Date(Date.now() + durationSec * 1000).toISOString();

    const room: MajlisRoom = {
      id: roomId,
      title: params.title.trim(),
      stream: params.stream,
      subject: params.subject,
      lesson: params.lesson.trim(),
      mode: params.mode,
      host_user_id: params.hostUserId,
      capacity: Math.min(8, Math.max(2, params.capacity)),
      status: "ACTIVE",
      current_step: "SOLVING",
      timer_end: timerEnd,
      active_material: material,
      created_at: now,
      updated_at: now,
    };

    localRooms.set(roomId, room);
    localMembers.set(roomId, []);
    localMessages.set(roomId, []);

    // Persist to Supabase if available
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("majlis_rooms").insert({
          id: room.id,
          title: room.title,
          stream: room.stream,
          subject: room.subject,
          lesson: room.lesson,
          mode: room.mode,
          host_user_id: room.host_user_id,
          capacity: room.capacity,
          status: room.status,
          current_step: room.current_step,
          timer_end: room.timer_end,
          active_material: room.active_material,
          created_at: room.created_at,
          updated_at: room.updated_at,
        });

        // Also sync to legacy majlis_tables for total consistency
        await supabase.from("majlis_tables").insert({
          id: room.id,
          title: room.title,
          creator_id: room.host_user_id,
          creator_name: params.hostName || "طالب شاطر",
          stream: room.stream,
          subject_id: room.subject,
          lesson: room.lesson,
          mode: room.mode === "SPEED_BATTLE" ? "DIGITAL_QUIZ" : room.mode === "GROUP_MEMORIZATION" ? "GROUP_MEMORIZATION" : "PAPER_PRACTICE",
          capacity: room.capacity,
          seats: [],
          status: "ACTIVE",
          current_phase: "READING_SOLVING",
          time_remaining_seconds: durationSec,
          duration_minutes: Math.ceil(durationSec / 60),
          active_material: room.active_material,
          created_at: room.created_at,
        });
      } catch (err) {
        console.warn("[MajlisService] Supabase room creation fallback to local:", err);
      }
    }

    return room;
  },

  /**
   * Fetch room details by ID
   */
  async getRoom(roomId: string): Promise<MajlisRoom | null> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("majlis_rooms")
          .select("*")
          .eq("id", roomId)
          .single();

        if (!error && data) {
          const room: MajlisRoom = {
            id: data.id,
            title: data.title,
            stream: data.stream as StreamId,
            subject: data.subject,
            lesson: data.lesson,
            mode: data.mode as MajlisStudyMode,
            host_user_id: data.host_user_id,
            capacity: data.capacity,
            status: data.status,
            current_step: data.current_step,
            timer_end: data.timer_end,
            active_material: data.active_material,
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
          localRooms.set(roomId, room);
          return room;
        }
      } catch (err) {
        console.warn("[MajlisService] Supabase getRoom error:", err);
      }
    }

    return localRooms.get(roomId) || null;
  },

  /**
   * Fetch members for a given room
   */
  async getMembers(roomId: string): Promise<MajlisMember[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("majlis_members")
          .select("*")
          .eq("room_id", roomId)
          .order("seat_index", { ascending: true });

        if (!error && data) {
          const members: MajlisMember[] = data.map((d: any) => ({
            id: d.id,
            room_id: d.room_id,
            user_id: d.user_id,
            user_name: d.user_name,
            user_avatar: d.user_avatar,
            user_stream: d.user_stream as StreamId,
            seat_index: d.seat_index,
            status: d.status,
            score: d.score,
            finished_paper: d.finished_paper,
            joined_at: d.joined_at,
          }));
          localMembers.set(roomId, members);
          return members;
        }
      } catch (err) {
        console.warn("[MajlisService] Supabase getMembers error:", err);
      }
    }

    return localMembers.get(roomId) || [];
  },

  /**
   * Strictly take a seat with branch/stream check enforcement
   */
  async takeSeat(params: {
    roomId: string;
    roomStream: StreamId;
    user: {
      id: string;
      name: string;
      avatar: string;
      stream: StreamId;
    };
    preferredSeatIndex?: number;
  }): Promise<{
    success: boolean;
    allowed: boolean;
    reason?: string;
    member?: MajlisMember;
  }> {
    // 1. STRICT STREAM ACCESS RULE (الشعبة):
    if (params.user.stream !== params.roomStream) {
      return {
        success: false,
        allowed: false,
        reason: "STREAM_MISMATCH",
      };
    }

    const currentMembers = await this.getMembers(params.roomId);

    // If user is already seated, return their current membership
    const existing = currentMembers.find((m) => m.user_id === params.user.id);
    if (existing) {
      return { success: true, allowed: true, member: existing };
    }

    // Find first available seat
    const occupiedSeats = new Set(currentMembers.map((m) => m.seat_index));
    let targetSeat = params.preferredSeatIndex ?? 0;
    if (occupiedSeats.has(targetSeat) || targetSeat >= 8) {
      for (let i = 0; i < 8; i++) {
        if (!occupiedSeats.has(i)) {
          targetSeat = i;
          break;
        }
      }
    }

    const newMember: MajlisMember = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      room_id: params.roomId,
      user_id: params.user.id,
      user_name: params.user.name,
      user_avatar: params.user.avatar || "👨‍🎓",
      user_stream: params.user.stream,
      seat_index: targetSeat,
      status: "SOLVING",
      score: 0,
      finished_paper: false,
      joined_at: new Date().toISOString(),
    };

    // Update local cache
    const updated = [...currentMembers.filter((m) => m.user_id !== params.user.id), newMember];
    localMembers.set(params.roomId, updated);

    // Persist to Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("majlis_members").upsert(
          {
            room_id: newMember.room_id,
            user_id: newMember.user_id,
            user_name: newMember.user_name,
            user_avatar: newMember.user_avatar,
            user_stream: newMember.user_stream,
            seat_index: newMember.seat_index,
            status: newMember.status,
            score: newMember.score,
            finished_paper: newMember.finished_paper,
            joined_at: newMember.joined_at,
          },
          { onConflict: "room_id,user_id" }
        );

        // Broadcast presence/seat change
        const channel = supabase.channel(`majlis-room-${params.roomId}`);
        channel.send({
          type: "broadcast",
          event: "seat_change",
          payload: { member: newMember, action: "JOIN" },
        });
      } catch (err) {
        console.warn("[MajlisService] Supabase takeSeat error:", err);
      }
    }

    return { success: true, allowed: true, member: newMember };
  },

  /**
   * Leave seat
   */
  async leaveSeat(roomId: string, userId: string): Promise<void> {
    const current = localMembers.get(roomId) || [];
    localMembers.set(roomId, current.filter((m) => m.user_id !== userId));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("majlis_members")
          .delete()
          .eq("room_id", roomId)
          .eq("user_id", userId);

        const channel = supabase.channel(`majlis-room-${roomId}`);
        channel.send({
          type: "broadcast",
          event: "seat_change",
          payload: { userId, action: "LEAVE" },
        });
      } catch (err) {
        console.warn("[MajlisService] Supabase leaveSeat error:", err);
      }
    }
  },

  /**
   * Mark Paper Problem Finished (✍️ أنهيت الحل على الكراس)
   */
  async markPaperFinished(roomId: string, userId: string): Promise<boolean> {
    const members = localMembers.get(roomId) || [];
    const target = members.find((m) => m.user_id === userId);
    if (target) {
      target.finished_paper = true;
      target.status = "FINISHED";
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("majlis_members")
          .update({ finished_paper: true, status: "FINISHED" })
          .eq("room_id", roomId)
          .eq("user_id", userId);

        const channel = supabase.channel(`majlis-room-${roomId}`);
        channel.send({
          type: "broadcast",
          event: "paper_finished",
          payload: { userId },
        });
      } catch (err) {
        console.warn("[MajlisService] markPaperFinished error:", err);
      }
    }

    return true;
  },

  /**
   * Record Self Assessment / Mistake from Paper Problem Rubric
   */
  async recordRubricAssessment(params: {
    userId: string;
    roomId: string;
    topicTitle: string;
    subjectId: string;
    result: "PERFECT" | "PARTIAL" | "WRONG";
    notes?: string;
  }) {
    if (params.result === "PERFECT") return;

    // Automatically push mistake to Error Lab Storage and Daily Planner
    await CampusService.recordMistakeToErrorVault(params.userId, {
      questionId: `rubric-${params.roomId}`,
      questionText: `تمرين مجلس العلم: ${params.topicTitle}`,
      chosenAnswerText: params.result === "PARTIAL" ? "حل جزئي مع أخطاء في التعويض أو التبرير" : "إجابة خاطئة أو تعثر في المنهجية",
      correctAnswerText: "مراجعة سلم التنقيط الوزاري والنموذج الرسمي المعتمد في المجلس",
      explanation: params.notes || "يحتاج هذا الدرس إلى حل تمرين إضافي لتثبيت المكتسبات وتفادي الأخطاء المتكررة.",
      subjectId: params.subjectId as any,
      topicTitle: params.topicTitle,
    });
  },

  /**
   * Submit Speed Trivia Answer (award points or capture mistakes)
   */
  async submitSpeedAnswer(params: {
    roomId: string;
    userId: string;
    questionId: string;
    questionText: string;
    chosenOptionText: string;
    correctOptionText: string;
    isCorrect: boolean;
    secondsRemaining: number;
    subjectId: string;
    topicTitle: string;
    explanation: string;
  }): Promise<{ newScore: number }> {
    const pointsAwarded = params.isCorrect ? 100 + Math.max(0, params.secondsRemaining * 10) : 0;
    const members = localMembers.get(params.roomId) || [];
    const target = members.find((m) => m.user_id === params.userId);

    let updatedScore = 0;
    if (target) {
      target.score = (target.score || 0) + pointsAwarded;
      updatedScore = target.score;
    }

    // If incorrect, automatically persist to Error Lab and schedule review in Planner
    if (!params.isCorrect) {
      await CampusService.recordMistakeToErrorVault(params.userId, {
        questionId: params.questionId,
        questionText: params.questionText,
        chosenAnswerText: params.chosenOptionText,
        correctAnswerText: params.correctOptionText,
        explanation: params.explanation,
        subjectId: params.subjectId as any,
        topicTitle: params.topicTitle,
      });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        if (target) {
          await supabase
            .from("majlis_members")
            .update({ score: target.score })
            .eq("room_id", params.roomId)
            .eq("user_id", params.userId);
        }

        const channel = supabase.channel(`majlis-room-${params.roomId}`);
        channel.send({
          type: "broadcast",
          event: "score_update",
          payload: {
            userId: params.userId,
            score: updatedScore,
            pointsAdded: pointsAwarded,
            isCorrect: params.isCorrect,
          },
        });
      } catch (err) {
        console.warn("[MajlisService] submitSpeedAnswer error:", err);
      }
    }

    return { newScore: updatedScore };
  },

  /**
   * In-Room Chat: Send Message
   */
  async sendMessage(params: {
    roomId: string;
    userId: string;
    userName: string;
    userStream: string;
    content: string;
  }): Promise<MajlisMessage> {
    const msg: MajlisMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      room_id: params.roomId,
      user_id: params.userId,
      user_name: params.userName,
      user_stream: params.userStream,
      content: params.content.trim(),
      created_at: new Date().toISOString(),
    };

    const current = localMessages.get(params.roomId) || [];
    localMessages.set(params.roomId, [...current, msg]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from("majlis_messages").insert({
          room_id: msg.room_id,
          user_id: msg.user_id,
          user_name: msg.user_name,
          user_stream: msg.user_stream,
          content: msg.content,
          created_at: msg.created_at,
        });

        const channel = supabase.channel(`majlis-room-${params.roomId}`);
        channel.send({
          type: "broadcast",
          event: "new_message",
          payload: msg,
        });
      } catch (err) {
        console.warn("[MajlisService] sendMessage error:", err);
      }
    }

    return msg;
  },

  /**
   * Fetch in-room chat messages
   */
  async getMessages(roomId: string): Promise<MajlisMessage[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("majlis_messages")
          .select("*")
          .eq("room_id", roomId)
          .order("created_at", { ascending: true })
          .limit(50);

        if (!error && data) {
          const msgs: MajlisMessage[] = data.map((d: any) => ({
            id: d.id,
            room_id: d.room_id,
            user_id: d.user_id,
            user_name: d.user_name,
            user_stream: d.user_stream,
            content: d.content,
            created_at: d.created_at,
          }));
          localMessages.set(roomId, msgs);
          return msgs;
        }
      } catch (err) {
        console.warn("[MajlisService] getMessages error:", err);
      }
    }

    return localMessages.get(roomId) || [];
  },

  /**
   * Subscribe to real-time events on `majlis-room-${roomId}`
   */
  subscribeToRoom(
    roomId: string,
    callbacks: {
      onSeatChange?: (payload: any) => void;
      onPaperFinished?: (payload: any) => void;
      onScoreUpdate?: (payload: any) => void;
      onNewMessage?: (msg: MajlisMessage) => void;
      onRoomUpdate?: (room: Partial<MajlisRoom>) => void;
    }
  ) {
    if (!isSupabaseConfigured || !supabase) {
      return () => {};
    }

    const channel = supabase.channel(`majlis-room-${roomId}`, {
      config: {
        broadcast: { ack: false },
        presence: { key: roomId },
      },
    });

    channel
      .on("broadcast", { event: "seat_change" }, ({ payload }) => {
        if (callbacks.onSeatChange) callbacks.onSeatChange(payload);
      })
      .on("broadcast", { event: "paper_finished" }, ({ payload }) => {
        if (callbacks.onPaperFinished) callbacks.onPaperFinished(payload);
      })
      .on("broadcast", { event: "score_update" }, ({ payload }) => {
        if (callbacks.onScoreUpdate) callbacks.onScoreUpdate(payload);
      })
      .on("broadcast", { event: "new_message" }, ({ payload }) => {
        if (callbacks.onNewMessage) callbacks.onNewMessage(payload);
      })
      .on("broadcast", { event: "room_update" }, ({ payload }) => {
        if (callbacks.onRoomUpdate) callbacks.onRoomUpdate(payload);
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "majlis_members", filter: `room_id=eq.${roomId}` },
        () => {
          if (callbacks.onSeatChange) callbacks.onSeatChange({ action: "REFRESH" });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "majlis_messages", filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (callbacks.onNewMessage && payload.new) {
            callbacks.onNewMessage(payload.new as MajlisMessage);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  },
};
