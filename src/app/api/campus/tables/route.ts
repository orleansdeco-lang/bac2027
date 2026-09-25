import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { requireServerAuth } from "@/lib/auth/server-guard";
import { CreateTableSchema } from "@/lib/validation/campus-schemas";
import { sanitizeSingleLine } from "@/lib/security/sanitize";
import { MajlisTable, MajlisSeat } from "@/types/campus";

import { TableStore } from "@/lib/campus/table-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from("majlis_tables")
        .select("*")
        .eq("status", "ACTIVE")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: MajlisTable[] = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          creatorId: d.creator_id,
          creatorName: d.creator_name,
          stream: d.stream,
          subjectId: d.subject_id,
          lesson: d.lesson,
          mode: d.mode,
          capacity: d.capacity,
          seats: Array.isArray(d.seats) ? d.seats : [],
          status: d.status,
          currentPhase: d.current_phase,
          timeRemainingSeconds: d.time_remaining_seconds,
          durationMinutes: d.duration_minutes,
          activeMaterial: d.active_material || {},
          createdAt: d.created_at,
        }));
        return NextResponse.json({ success: true, tables: mapped });
      }
    }

    const localTables = TableStore.getAll();
    return NextResponse.json({ success: true, tables: localTables });
  } catch (err) {
    console.error("[API Campus Tables GET] Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireServerAuth(req);
    if (!authResult.authenticated || !authResult.authorized) {
      if (authResult.errorResponse) return authResult.errorResponse;
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const rawBody = await req.json().catch(() => null);
    const parseResult = CreateTableSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: "Validation Error", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { title, stream, subjectId, lesson, mode, capacity } = parseResult.data;

    // Strict stream check on creator
    const studentStream =
      authResult.profile?.streamId || (authResult.profile as any)?.stream || "sciences_exp";
    if (studentStream !== stream) {
      return NextResponse.json(
        {
          success: false,
          error: "Stream Mismatch",
          message: "لا يمكنك إنشاء طاولة لشعبة غير شعبتك المسجلة.",
        },
        { status: 403 }
      );
    }

    const cleanTitle = sanitizeSingleLine(title, 150);
    const cleanLesson = sanitizeSingleLine(lesson, 100);

    const tableId = `table-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const creatorName =
      authResult.profile?.firstName ||
      (authResult.profile as any)?.nickname ||
      "طالب بكالوريا";
    const creatorAvatar = "👨‍🎓";

    const seats: (MajlisSeat | null)[] = Array(capacity).fill(null);
    seats[0] = {
      seatIndex: 0,
      studentId: authResult.userId!,
      studentName: creatorName,
      avatar: creatorAvatar,
      stream,
      status: "READY",
      statusPill: "بانتظار الزملاء ⏳",
      timerSeconds: 0,
      joinedAt: new Date().toISOString(),
    };

    const initialMaterial = {
      problemSheet: {
        title: `تمرين تطبيقي مكثف في درس: ${cleanLesson}`,
        source: "بكالوريا تجريبية مقترحة مع سلم التنقيط الوزاري",
        problemText: `مسألة نموذجية في مادة ${subjectId}: حل المطلوب على كراسك بدقة مع كتابة القوانين الحرفية.\nالمطلوب:\n1. تحليل المعطيات وتحديد الشروط الابتدائية.\n2. إثبات العلاقة النظرية وكتابة النتيجة بالوحدات الدولية.`,
        solutionText: `الحل النموذجي المعتمد:\n- الخطوة 1: الشروط الابتدائية واضحة.\n- الخطوة 2: تطبيق القانون وإيجاد النتيجة النهائية مع سلم التنقيط المرفق.`,
        rubric: [
          { criterion: "كتابة القانون الحرفي وتحديد الشروط", points: 1.0 },
          { criterion: "التعويض العددي المباشر مع احترام الوحدات", points: 1.0 },
          { criterion: "صياغة الاستنتاج العلمي النهائي", points: 1.0 },
        ],
        totalPoints: 3,
      },
    };

    const now = new Date().toISOString();
    const payload = {
      id: tableId,
      title: cleanTitle,
      creator_id: authResult.userId,
      creator_name: creatorName,
      stream,
      subject_id: subjectId,
      lesson: cleanLesson,
      mode,
      capacity,
      seats,
      status: "ACTIVE",
      current_phase:
        mode === "PAPER_PRACTICE"
          ? "READING_SOLVING"
          : mode === "DIGITAL_QUIZ"
          ? "QUESTION_ACTIVE"
          : "MEMORIZING",
      time_remaining_seconds: 15 * 60,
      duration_minutes: 15,
      active_material: initialMaterial,
      created_at: now,
      updated_at: now,
    };

    if (isSupabaseConfigured) {
      const client = getAdminClient() || supabase;
      if (client) {
        await client.from("majlis_tables").insert(payload);
      }
    }

    const tableResponse: MajlisTable = {
      id: tableId,
      title: cleanTitle,
      creatorId: authResult.userId!,
      creatorName,
      stream,
      subjectId: subjectId as any,
      lesson: cleanLesson,
      mode,
      capacity,
      seats,
      status: "ACTIVE",
      currentPhase: payload.current_phase as any,
      timeRemainingSeconds: 15 * 60,
      durationMinutes: 15,
      activeMaterial: initialMaterial,
      createdAt: now,
    };

    TableStore.set(tableId, tableResponse);

    return NextResponse.json({ success: true, table: tableResponse }, { status: 201 });
  } catch (err) {
    console.error("[API Campus Tables POST] Error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
