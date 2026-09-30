import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { StreamId } from "@/types/education";
import { CampusService } from "./campus-service";
import { sanitizeSingleLine } from "@/lib/security/sanitize";

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
  duration_minutes?: number;
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
  wilaya_code?: string;
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

// Built-in Curated Material Generator for Instant Room Practice
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

// Client-side rate limiting tracker for in-room chat
export const CHAT_MIN_INTERVAL_MS = 1500;
let lastMessageTimestamp = 0;

export const MajlisService = {
  /**
   * Create a new Majlis room and persist authoritatively to Supabase
   */
  async createRoom(params: {
    title: string;
    stream: StreamId;
    subject: string;
    lesson: string;
    mode: MajlisStudyMode;
    capacity: number;
    durationMinutes?: number;
    hostUserId?: string;
    hostName?: string;
    hostAvatar?: string;
  }): Promise<MajlisRoom> {
    const roomId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const durationMinutes = Math.min(180, Math.max(15, params.durationMinutes || 45));
    const timerEnd = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
    const material = getInitialMaterialForMode(params.mode, params.subject, params.lesson);

    const activeMaterial = {
      ...(typeof material === "object" ? material : {}),
      durationMinutes,
      hostStudentId: params.hostUserId || null,
      hostStudentName: params.hostName || "طالب شاطر",
      hostStudentAvatar: params.hostAvatar || "/illustrations/characters/scholar.jpg",
    };

    const room: MajlisRoom = {
      id: roomId,
      title: sanitizeSingleLine(params.title, 150),
      stream: params.stream,
      subject: params.subject,
      lesson: sanitizeSingleLine(params.lesson, 100),
      mode: params.mode,
      host_user_id: params.hostUserId,
      capacity: Math.min(8, Math.max(2, params.capacity)),
      status: "ACTIVE",
      current_step: "SOLVING",
      duration_minutes: durationMinutes,
      timer_end: timerEnd,
      active_material: activeMaterial,
      created_at: now,
      updated_at: now,
    };

    // 1. Try authoritative API endpoint (runs on server with admin client, bypassing RLS)
    try {
      const res = await fetch("/api/campus/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: room.title,
          stream: room.stream,
          subject: room.subject,
          lesson: room.lesson,
          mode: room.mode,
          capacity: room.capacity,
          durationMinutes: room.duration_minutes,
          hostUserId: room.host_user_id,
          hostName: params.hostName,
          hostAvatar: params.hostAvatar,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.room) {
          return json.room;
        }
      }
    } catch (apiErr) {
      console.warn("[MajlisService] API room creation failed, falling back to direct database insert:", apiErr);
    }

    // 2. Direct Supabase insert fallback with schema self-healing
    if (isSupabaseConfigured && supabase) {
      try {
        const isUUID =
          params.hostUserId &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.hostUserId);
        const safeHostUserId = isUUID ? params.hostUserId : null;

        const basePayload: Record<string, any> = {
          id: room.id,
          title: room.title,
          stream: room.stream,
          subject: room.subject,
          lesson: room.lesson,
          mode: room.mode,
          host_user_id: safeHostUserId,
          capacity: room.capacity,
          status: room.status,
          current_step: room.current_step,
          timer_end: room.timer_end,
          active_material: room.active_material,
          created_at: room.created_at,
          updated_at: room.updated_at,
        };

        // Try insert with duration_minutes first
        let { error } = await supabase.from("majlis_rooms").insert({
          ...basePayload,
          duration_minutes: room.duration_minutes,
        });

        // If duration_minutes does not exist in schema cache (PGRST204), retry with base payload
        if (error && (error.code === "PGRST204" || (error as any).code === "42703")) {
          const retryResult = await supabase.from("majlis_rooms").insert(basePayload);
          error = retryResult.error;
        }

        // If host_user_id failed on foreign key or syntax, retry with null
        if (error && (error.code === "23503" || error.code === "22P02")) {
          const retryResult = await supabase.from("majlis_rooms").insert({
            ...basePayload,
            host_user_id: null,
          });
          error = retryResult.error;
        }

        if (error) {
          console.warn("[MajlisService] Supabase room creation notice:", error.message);
        }
      } catch (dbErr) {
        console.warn("[MajlisService] Direct database insert error:", dbErr);
      }
    }

    return room;
  },

  /**
   * Fetch room details authoritatively by ID
   */
  async getRoom(roomId: string): Promise<MajlisRoom | null> {
    if (!roomId) return null;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("majlis_rooms")
          .select("*")
          .eq("id", roomId)
          .maybeSingle();

        if (!error && data) {
          return {
            id: data.id,
            title: data.title,
            stream: data.stream as StreamId,
            subject: data.subject,
            lesson: data.lesson,
            mode: data.mode as MajlisStudyMode,
            host_user_id: data.host_user_id || data.active_material?.hostStudentId,
            capacity: data.capacity,
            status: data.status,
            current_step: data.current_step,
            duration_minutes: data.duration_minutes || data.active_material?.durationMinutes || 45,
            timer_end: data.timer_end,
            active_material: data.active_material,
            created_at: data.created_at,
            updated_at: data.updated_at,
          };
        }
      } catch (err) {
        console.warn("[MajlisService] Supabase getRoom error:", err);
      }
    }

    return null;
  },

  /**
   * Fetch members for a given room
   */
  async getMembers(roomId: string): Promise<MajlisMember[]> {
    if (!roomId) return [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("majlis_members")
          .select("*")
          .eq("room_id", roomId)
          .order("seat_index", { ascending: true });

        if (!error && data) {
          return data.map((d: any) => {
            let extractedWilaya = d.wilaya_code;
            let cleanName = d.user_name || "طالب شاطر";
            if (!extractedWilaya && typeof d.user_name === "string") {
              const match = d.user_name.match(/\((\d{2})\)/);
              if (match) {
                extractedWilaya = match[1];
                cleanName = d.user_name.replace(/\s*\(\d{2}\)\s*$/, "").trim();
              }
            }
            return {
              id: d.id,
              room_id: d.room_id,
              user_id: d.user_id,
              user_name: cleanName,
              user_avatar: d.user_avatar || "/illustrations/characters/scholar.jpg",
              user_stream: d.user_stream as StreamId,
              wilaya_code: extractedWilaya || "16",
              seat_index: d.seat_index,
              status: d.status,
              score: d.score || 0,
              finished_paper: Boolean(d.finished_paper),
              joined_at: d.joined_at,
            };
          });
        }
      } catch (err) {
        console.warn("[MajlisService] Supabase getMembers error:", err);
      }
    }

    return [];
  },

  /**
   * Strictly take a seat with stream enforcement and atomic reservation
   */
  async takeSeat(params: {
    roomId: string;
    roomStream: StreamId;
    user: {
      id: string;
      name: string;
      avatar: string;
      stream: StreamId;
      wilayaCode?: string;
    };
    preferredSeatIndex?: number;
  }): Promise<{
    success: boolean;
    allowed: boolean;
    reason?: string;
    message?: string;
    member?: MajlisMember;
  }> {
    // 1. STRICT STREAM ACCESS RULE (الشعبة):
    if (params.user.stream !== params.roomStream && (params.roomStream as string) !== "ALL") {
      return {
        success: false,
        allowed: false,
        reason: "STREAM_MISMATCH",
        message: "هذا المجلس مخصص لشعبة أخرى. يمكنك المشاهدة فقط.",
      };
    }

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        allowed: false,
        reason: "DATABASE_DISCONNECTED",
        message: "الاتصال بقاعدة البيانات غير متاح حالياً.",
      };
    }

    const wilayaCode = params.user.wilayaCode || "16";

    // Try atomic stored procedure first
    try {
      const { data, error } = await supabase.rpc("majlis_take_seat_atomic", {
        p_room_id: params.roomId,
        p_user_id: params.user.id,
        p_user_name: params.user.name,
        p_user_avatar: params.user.avatar,
        p_user_stream: params.user.stream,
        p_preferred_seat: params.preferredSeatIndex ?? 0,
        p_wilaya_code: wilayaCode,
      });

      if (!error && data && data.success) {
        const member = data.member as MajlisMember;
        // Broadcast presence/seat change
        const channel = supabase.channel(`majlis-room-${params.roomId}`);
        channel.send({
          type: "broadcast",
          event: "seat_change",
          payload: { member, action: "JOIN" },
        });

        return { success: true, allowed: true, member };
      }

      if (data && !data.success) {
        return {
          success: false,
          allowed: false,
          reason: data.error,
          message: data.message,
        };
      }
    } catch (rpcErr) {
      console.warn("[MajlisService] take_seat_atomic RPC fallback to direct insert:", rpcErr);
    }

    // Fallback direct check & insert
    const currentMembers = await this.getMembers(params.roomId);
    const existing = currentMembers.find((m) => m.user_id === params.user.id);
    if (existing) {
      return { success: true, allowed: true, member: existing };
    }

    // Check capacity
    const room = await this.getRoom(params.roomId);
    const capacity = room?.capacity || 6;
    if (currentMembers.length >= capacity) {
      return {
        success: false,
        allowed: false,
        reason: "ROOM_FULL",
        message: "المجلس ممتلئ بالكامل (اكتملت المقاعد).",
      };
    }

    const occupiedSeats = new Set(currentMembers.map((m) => m.seat_index));
    let targetSeat = params.preferredSeatIndex ?? 0;
    if (occupiedSeats.has(targetSeat) || targetSeat >= capacity) {
      for (let i = 0; i < capacity; i++) {
        if (!occupiedSeats.has(i)) {
          targetSeat = i;
          break;
        }
      }
    }

    const newMember: MajlisMember = {
      id: crypto.randomUUID(),
      room_id: params.roomId,
      user_id: params.user.id,
      user_name: params.user.name,
      user_avatar: params.user.avatar || "/illustrations/characters/scholar.jpg",
      user_stream: params.user.stream,
      wilaya_code: wilayaCode,
      seat_index: targetSeat,
      status: "SOLVING",
      score: 0,
      finished_paper: false,
      joined_at: new Date().toISOString(),
    };

    const baseMemberPayload: Record<string, any> = {
      id: newMember.id,
      room_id: newMember.room_id,
      user_id: newMember.user_id,
      user_name: `${newMember.user_name} (${wilayaCode})`,
      user_avatar: newMember.user_avatar,
      user_stream: newMember.user_stream,
      seat_index: newMember.seat_index,
      status: newMember.status,
      score: newMember.score,
      finished_paper: newMember.finished_paper,
      joined_at: newMember.joined_at,
    };

    let { error: insertErr } = await supabase.from("majlis_members").insert({
      ...baseMemberPayload,
      wilaya_code: newMember.wilaya_code,
    });

    if (insertErr && (insertErr.code === "PGRST204" || (insertErr as any).code === "42703")) {
      console.warn("[MajlisService] wilaya_code column not found, falling back to base payload");
      const retryResult = await supabase.from("majlis_members").insert(baseMemberPayload);
      insertErr = retryResult.error;
    }

    if (insertErr) {
      console.error("[MajlisService] Supabase takeSeat error:", insertErr);
      return {
        success: false,
        allowed: false,
        reason: insertErr.code === "23505" ? "SEAT_TAKEN" : "INSERT_FAILED",
        message: "تعذر حجز المقعد، قد يكون تم حجزه من طرف زميل آخر.",
      };
    }

    // Broadcast seat change
    const channel = supabase.channel(`majlis-room-${params.roomId}`);
    channel.send({
      type: "broadcast",
      event: "seat_change",
      payload: { member: newMember, action: "JOIN" },
    });

    return { success: true, allowed: true, member: newMember };
  },

  /**
   * Leave seat authoritatively & auto-close room when empty
   */
  async leaveSeat(roomId: string, userId: string): Promise<void> {
    if (!roomId || !userId) return;

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from("majlis_members")
          .delete()
          .eq("room_id", roomId)
          .eq("user_id", userId);

        // Check remaining members in the room
        const { count } = await supabase
          .from("majlis_members")
          .select("*", { count: "exact", head: true })
          .eq("room_id", roomId);

        const isEmpty = (count === 0 || count === null);
        if (isEmpty) {
          // Auto-mark room as completed
          await supabase
            .from("majlis_rooms")
            .update({ status: "COMPLETED", updated_at: new Date().toISOString() })
            .eq("id", roomId);
        }

        const channel = supabase.channel(`majlis-room-${roomId}`);
        channel.send({
          type: "broadcast",
          event: "seat_change",
          payload: { userId, action: "LEAVE", remainingCount: count || 0 },
        });

        if (isEmpty) {
          channel.send({
            type: "broadcast",
            event: "room_update",
            payload: { status: "COMPLETED" },
          });
        }
      } catch (err) {
        console.warn("[MajlisService] Supabase leaveSeat error:", err);
      }
    }
  },

  /**
   * Mark Paper Problem Finished (✍️ أنهيت الحل على الكراس)
   */
  async markPaperFinished(roomId: string, userId: string): Promise<boolean> {
    if (!roomId || !userId) return false;

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

    let updatedScore = pointsAwarded;

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: member } = await supabase
          .from("majlis_members")
          .select("score")
          .eq("room_id", params.roomId)
          .eq("user_id", params.userId)
          .maybeSingle();

        if (member) {
          updatedScore = (member.score || 0) + pointsAwarded;
          await supabase
            .from("majlis_members")
            .update({ score: updatedScore })
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
   * In-Room Chat: Send Message with Rate Limiting and Sanitization
   */
  async sendMessage(params: {
    roomId: string;
    userId: string;
    userName: string;
    userStream: string;
    content: string;
  }): Promise<MajlisMessage> {
    const now = Date.now();
    // Flood protection: max 1 message per 1.5 seconds per client
    if (now - lastMessageTimestamp < CHAT_MIN_INTERVAL_MS) {
      throw new Error("يرجى الانتظار ثانية قبل إرسال رسالة أخرى.");
    }
    lastMessageTimestamp = now;

    const trimmed = params.content.trim();
    if (!trimmed) {
      throw new Error("لا يمكن إرسال رسالة فارغة.");
    }
    if (trimmed.length > 300) {
      throw new Error("الرسالة طويلة جداً (الحد الأقصى 300 حرف).");
    }

    const cleanContent = sanitizeSingleLine(trimmed, 300);

    const msg: MajlisMessage = {
      id: crypto.randomUUID(),
      room_id: params.roomId,
      user_id: params.userId,
      user_name: sanitizeSingleLine(params.userName, 80),
      user_stream: sanitizeSingleLine(params.userStream, 50),
      content: cleanContent,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from("majlis_messages").insert({
          id: msg.id,
          room_id: msg.room_id,
          user_id: msg.user_id,
          user_name: msg.user_name,
          user_stream: msg.user_stream,
          content: msg.content,
          created_at: msg.created_at,
        });

        if (error) {
          console.error("[MajlisService] sendMessage DB insert error:", error);
          throw new Error("فشل إرسال الرسالة.");
        }

        const channel = supabase.channel(`majlis-room-${params.roomId}`);
        channel.send({
          type: "broadcast",
          event: "new_message",
          payload: msg,
        });
      } catch (err: any) {
        console.warn("[MajlisService] sendMessage error:", err);
        throw err;
      }
    }

    return msg;
  },

  /**
   * Fetch in-room chat messages from database
   */
  async getMessages(roomId: string): Promise<MajlisMessage[]> {
    if (!roomId) return [];

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("majlis_messages")
          .select("*")
          .eq("room_id", roomId)
          .order("created_at", { ascending: true })
          .limit(50);

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            room_id: d.room_id,
            user_id: d.user_id,
            user_name: d.user_name,
            user_stream: d.user_stream,
            content: d.content,
            created_at: d.created_at,
          }));
        }
      } catch (err) {
        console.warn("[MajlisService] getMessages error:", err);
      }
    }

    return [];
  },

  /**
   * Send live cheer / reaction to room or specific student
   */
  async sendReaction(params: {
    roomId: string;
    fromUserId: string;
    fromName: string;
    toUserId?: string;
    reactionEmoji: string;
    message: string;
  }): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const channel = supabase.channel(`majlis-room-${params.roomId}`);
        await channel.send({
          type: "broadcast",
          event: "seat_reaction",
          payload: {
            fromUserId: params.fromUserId,
            fromName: params.fromName,
            toUserId: params.toUserId,
            reactionEmoji: params.reactionEmoji,
            message: params.message,
            timestamp: Date.now(),
          },
        });
      } catch (err) {
        console.warn("[MajlisService] sendReaction error:", err);
      }
    }
  },

  /**
   * Kick member from room (for host / moderation)
   */
  async kickMember(params: { roomId: string; targetUserId: string }): Promise<void> {
    await this.leaveSeat(params.roomId, params.targetUserId);
    if (isSupabaseConfigured && supabase) {
      try {
        const channel = supabase.channel(`majlis-room-${params.roomId}`);
        await channel.send({
          type: "broadcast",
          event: "kick_member",
          payload: { kickedUserId: params.targetUserId },
        });
      } catch (err) {
        console.warn("[MajlisService] kickMember error:", err);
      }
    }
  },

  /**
   * Anti-harassment: Block disruptive user
   */
  async blockUser(params: { userId: string; blockedUserId: string; reason?: string }): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from("majlis_blocks").insert({
        user_id: params.userId,
        blocked_user_id: params.blockedUserId,
        reason: params.reason ? sanitizeSingleLine(params.reason, 100) : null,
      });
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Anti-harassment: Fetch blocked users list for current user
   */
  async getBlockedUserIds(userId: string): Promise<string[]> {
    if (!userId || !isSupabaseConfigured || !supabase) return [];
    try {
      const { data, error } = await supabase
        .from("majlis_blocks")
        .select("blocked_user_id")
        .eq("user_id", userId);
      if (!error && data) {
        return data.map((d: any) => d.blocked_user_id);
      }
    } catch {}
    return [];
  },

  /**
   * Anti-harassment: Unblock user
   */
  async unblockUser(params: { userId: string; blockedUserId: string }): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase
        .from("majlis_blocks")
        .delete()
        .eq("user_id", params.userId)
        .eq("blocked_user_id", params.blockedUserId);
      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Request session time extension from the room host (+15 mins)
   */
  async requestExtension(params: {
    roomId: string;
    fromUserId: string;
    fromUserName: string;
  }): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const channel = supabase.channel(`majlis-room-${params.roomId}`);
        await channel.send({
          type: "broadcast",
          event: "extension_request",
          payload: {
            fromUserId: params.fromUserId,
            fromUserName: params.fromUserName,
            requestedMinutes: 15,
            timestamp: Date.now(),
          },
        });
      } catch (err) {
        console.warn("[MajlisService] requestExtension error:", err);
      }
    }
  },

  /**
   * Extend room duration (+15 mins approved by host or operator)
   */
  async extendRoomTime(params: {
    roomId: string;
    hostUserId: string;
    additionalMinutes?: number;
  }): Promise<{ success: boolean; newTimerEnd?: string; error?: string }> {
    const minutes = params.additionalMinutes || 15;
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, error: "Database disconnected" };
    }

    try {
      // 1. Try atomic stored procedure
      const { data, error } = await supabase.rpc("majlis_extend_room_time", {
        p_room_id: params.roomId,
        p_host_user_id: params.hostUserId,
        p_additional_minutes: minutes,
      });

      if (!error && data && data.success) {
        const newTimerEnd = data.new_timer_end;
        const channel = supabase.channel(`majlis-room-${params.roomId}`);
        channel.send({
          type: "broadcast",
          event: "room_update",
          payload: { timer_end: newTimerEnd },
        });
        channel.send({
          type: "broadcast",
          event: "time_extended",
          payload: { newTimerEnd, additionalMinutes: minutes },
        });
        return { success: true, newTimerEnd };
      }

      // 2. Direct fallback
      const room = await this.getRoom(params.roomId);
      if (!room) return { success: false, error: "المجلس غير موجود" };

      const currentEnd = room.timer_end ? new Date(room.timer_end).getTime() : Date.now();
      const newEndMs = Math.max(Date.now(), currentEnd) + minutes * 60 * 1000;
      const newTimerEndIso = new Date(newEndMs).toISOString();

      const { error: updateErr } = await supabase
        .from("majlis_rooms")
        .update({ timer_end: newTimerEndIso, updated_at: new Date().toISOString() })
        .eq("id", params.roomId);

      if (updateErr) {
        return { success: false, error: updateErr.message };
      }

      const channel = supabase.channel(`majlis-room-${params.roomId}`);
      channel.send({
        type: "broadcast",
        event: "room_update",
        payload: { timer_end: newTimerEndIso },
      });
      channel.send({
        type: "broadcast",
        event: "time_extended",
        payload: { newTimerEnd: newTimerEndIso, additionalMinutes: minutes },
      });

      return { success: true, newTimerEnd: newTimerEndIso };
    } catch (err: any) {
      console.warn("[MajlisService] extendRoomTime error:", err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Fetch active rooms genuine query strictly from Supabase (Zero Mock Fallback)
   */
  async fetchActiveRooms(stream?: StreamId): Promise<MajlisRoom[]> {
    // 1. Try authoritative API endpoint (merges server memory + database)
    try {
      const url = stream ? `/api/campus/rooms?stream=${encodeURIComponent(stream)}` : "/api/campus/rooms";
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.rooms)) {
          return json.rooms;
        }
      }
    } catch (apiErr) {
      console.warn("[MajlisService] API fetchActiveRooms fallback to direct client query:", apiErr);
    }

    // 2. Direct Supabase query fallback
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase
          .from("majlis_rooms")
          .select("*")
          .eq("status", "ACTIVE")
          .order("created_at", { ascending: false })
          .limit(30);

        if (stream) {
          query = query.or(`stream.eq.${stream},stream.eq.ALL`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            title: d.title,
            stream: d.stream as StreamId,
            subject: d.subject,
            lesson: d.lesson,
            mode: d.mode as MajlisStudyMode,
            host_user_id: d.host_user_id || d.active_material?.hostStudentId,
            capacity: d.capacity,
            status: d.status,
            current_step: d.current_step,
            duration_minutes: d.duration_minutes || d.active_material?.durationMinutes || 45,
            timer_end: d.timer_end,
            active_material: d.active_material,
            created_at: d.created_at,
            updated_at: d.updated_at,
          }));
        }
      } catch (err) {
        console.warn("[MajlisService] fetchActiveRooms error:", err);
      }
    }

    // Zero fake fallback: return honest empty array
    return [];
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
      onReaction?: (payload: {
        fromUserId: string;
        fromName: string;
        toUserId?: string;
        reactionEmoji: string;
        message: string;
      }) => void;
      onKick?: (payload: { kickedUserId: string }) => void;
      onPresenceSync?: (presenceState: Record<string, any>) => void;
      onPresenceLeave?: (leftPresences: any[]) => void;
      onExtensionRequest?: (payload: {
        fromUserId: string;
        fromUserName: string;
        requestedMinutes: number;
      }) => void;
      onTimeExtended?: (payload: {
        newTimerEnd: string;
        additionalMinutes: number;
      }) => void;
    }
  ) {
    if (!isSupabaseConfigured || !supabase || !roomId) {
      const noop = () => {};
      noop.trackPresence = async () => {};
      noop.untrackPresence = async () => {};
      return noop;
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
      .on("broadcast", { event: "seat_reaction" }, ({ payload }) => {
        if (callbacks.onReaction) callbacks.onReaction(payload);
      })
      .on("broadcast", { event: "kick_member" }, ({ payload }) => {
        if (callbacks.onKick) callbacks.onKick(payload);
      })
      .on("broadcast", { event: "extension_request" }, ({ payload }) => {
        if (callbacks.onExtensionRequest) callbacks.onExtensionRequest(payload);
      })
      .on("broadcast", { event: "time_extended" }, ({ payload }) => {
        if (callbacks.onTimeExtended) callbacks.onTimeExtended(payload);
      })
      .on("presence", { event: "sync" }, () => {
        if (callbacks.onPresenceSync) {
          callbacks.onPresenceSync(channel.presenceState());
        }
      })
      .on("presence", { event: "leave" }, ({ leftPresences }) => {
        if (callbacks.onPresenceLeave) {
          callbacks.onPresenceLeave(leftPresences);
        }
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

    const unsubscribe = () => {
      channel.unsubscribe();
    };

    unsubscribe.trackPresence = async (data: Record<string, any>) => {
      try {
        await channel.track(data);
      } catch (e) {
        console.warn("[MajlisService] trackPresence error:", e);
      }
    };

    unsubscribe.untrackPresence = async () => {
      try {
        await channel.untrack();
      } catch (e) {
        console.warn("[MajlisService] untrackPresence error:", e);
      }
    };

    return unsubscribe;
  },
};
