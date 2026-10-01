import { NextResponse } from "next/server";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { createAuthenticatedSupabaseClient, isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { getAlgeriaDateString } from "@/lib/planner/algeria-date";
import { ALGERIAN_BAC_STREAMS, ALL_SUBJECTS, getStreamSubjects } from "@/lib/constants/streams";
import { StreamId, SubjectId } from "@/types/education";
import { CreatePlannerEventSchema, normalizeUpperEnum, ValidEventTypes, ValidPriorities } from "@/lib/planner/schemas";

export const dynamic = "force-dynamic";

/**
 * POST /api/planner/ai-proposal
 * Two-phase secure AI proposal system:
 * 1. "generate": Builds a safe server context (stream, coefficients, Error Lab signals),
 *    and generates a structured proposal with "Why? What changes? Impact?"
 *    NEVER directly mutates or executes SQL.
 * 2. "commit": Commits student-accepted changes to PostgreSQL after review.
 */
export async function POST(req: Request) {
  try {
    const callerId = await extractAuthenticatedUserId(req);
    if (!callerId) {
      return NextResponse.json(
        { success: false, error: "يجب تسجيل الدخول لاستخدام المقترح الذكي." },
        { status: 401 }
      );
    }

    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;

    const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;
    if (!isSupabaseConfigured || !client) {
      return NextResponse.json({ success: false, error: "Database service unavailable" }, { status: 503 });
    }

    const body = await req.json().catch(() => null);
    const action = body?.action || "generate";

    // =========================================================================
    // PHASE A: COMMIT ACCEPTED PROPOSAL
    // =========================================================================
    if (action === "commit") {
      const eventsToCommit = body?.events;
      if (!Array.isArray(eventsToCommit) || eventsToCommit.length === 0) {
        return NextResponse.json(
          { success: false, error: "لا توجد مهام مقبولة للحفظ." },
          { status: 400 }
        );
      }

      const rowsToInsert: any[] = [];
      const nowIso = new Date().toISOString();

      for (const item of eventsToCommit) {
        const parsed = CreatePlannerEventSchema.safeParse(item);
        if (!parsed.success) continue;

        const d = parsed.data;
        rowsToInsert.push({
          user_id: callerId,
          title: d.title,
          type: normalizeUpperEnum(d.type, ValidEventTypes, "STUDY"),
          date: d.date,
          start_time: d.start_time || "18:00",
          end_time: d.end_time || null,
          duration_minutes: d.duration_minutes || 45,
          stream_id: d.stream_id || "sciences_exp",
          subject_id: d.subject_id || null,
          skill_id: d.skill_id || null,
          priority: normalizeUpperEnum(d.priority, ValidPriorities, "MEDIUM"),
          status: "TODO",
          notes: d.notes || "مقترح ذكي معتمد من شاطر",
          source: "AI",
          created_at: nowIso,
          updated_at: nowIso,
        });
      }

      if (rowsToInsert.length === 0) {
        return NextResponse.json(
          { success: false, error: "فشل التحقق من صحة المهام المقترحة." },
          { status: 400 }
        );
      }

      const { data: inserted, error: insertErr } = await client
        .from("planner_events")
        .insert(rowsToInsert)
        .select();

      if (insertErr) {
        console.error("[POST /api/planner/ai-proposal commit] Error:", insertErr);
        return NextResponse.json({ success: false, error: insertErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `تم اعتماد ${inserted.length} مهمة بنجاح في جدولك الدراسي.`,
        events: inserted,
      });
    }

    // =========================================================================
    // PHASE B: GENERATE STRUCTURED PROPOSAL
    // =========================================================================
    const userPrompt = (body?.userPrompt || body?.prompt || "").trim();
    const daysCount = Math.min(Math.max(Number(body?.daysCount) || 3, 1), 7);
    const dailyHours = Math.min(Math.max(Number(body?.dailyHoursAvailable) || 3, 1), 8);
    const startDate = body?.startDate || getAlgeriaDateString();

    // 1. Authoritative Student Context (Profile + Stream)
    const { data: profile } = await client
      .from("student_profiles")
      .select("stream_id, target_score, first_name")
      .eq("id", callerId)
      .maybeSingle();

    const rawStream = profile?.stream_id || body?.streamId || "sciences_exp";
    const streamId = (rawStream === "sciences" ? "sciences_exp" : rawStream) as StreamId;
    const streamConfig = ALGERIAN_BAC_STREAMS[streamId] || ALGERIAN_BAC_STREAMS.sciences_exp;
    const streamRules = getStreamSubjects(streamId) || [];

    // 2. Consume Learning Signals from Error Lab (Phase 13)
    let weakSubjectId: string | null = null;
    try {
      const { data: errorLabItems } = await client
        .from("errors")
        .select("subject_id")
        .eq("user_id", callerId)
        .eq("resolved", false)
        .limit(10);

      if (errorLabItems && errorLabItems.length > 0) {
        const counts: Record<string, number> = {};
        for (const item of errorLabItems) {
          if (item.subject_id) counts[item.subject_id] = (counts[item.subject_id] || 0) + 1;
        }
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        if (sorted[0] && streamRules.some((r) => r.subjectId === sorted[0][0])) {
          weakSubjectId = sorted[0][0];
        }
      }
    } catch {}

    // 3. Identify user-specified priority subjects from prompt
    const promptLower = userPrompt.toLowerCase();
    const prioritySubjects: string[] = [];

    for (const rule of streamRules) {
      const meta = ALL_SUBJECTS[rule.subjectId as SubjectId];
      if (meta) {
        const nameAr = meta.name_ar.toLowerCase();
        const nameFr = meta.name_fr.toLowerCase();
        if (promptLower.includes(nameAr) || promptLower.includes(nameFr) || promptLower.includes(rule.subjectId)) {
          prioritySubjects.push(rule.subjectId);
        }
      }
    }

    // Core stream subjects sorted by coefficient descending
    const coreRules = streamRules.filter((r) => r.isCoreSubject).sort((a, b) => b.coefficient - a.coefficient);
    const secondaryRules = streamRules.filter((r) => !r.isCoreSubject);

    // 4. Generate structured proposed events across requested days
    const proposedEvents: any[] = [];
    const [startYear, startMonth, startDay] = startDate.split("-").map(Number);

    for (let dayOffset = 0; dayOffset < daysCount; dayOffset++) {
      const targetDateObj = new Date(Date.UTC(startYear, startMonth - 1, startDay + dayOffset, 12, 0, 0));
      const y = targetDateObj.getUTCFullYear();
      const m = String(targetDateObj.getUTCMonth() + 1).padStart(2, "0");
      const d = String(targetDateObj.getUTCDate()).padStart(2, "0");
      const dateStr = `${y}-${m}-${d}`;

      // Pick Subject 1 (Primary): user specified > weak subject > top core by coefficient
      let subj1 = prioritySubjects[dayOffset % prioritySubjects.length];
      if (!subj1 && dayOffset === 0 && weakSubjectId) {
        subj1 = weakSubjectId;
      }
      if (!subj1) {
        subj1 = coreRules[dayOffset % coreRules.length]?.subjectId || "math";
      }

      // Pick Subject 2 (Secondary/Complementary)
      const subj2 = secondaryRules[dayOffset % secondaryRules.length]?.subjectId ||
        coreRules[(dayOffset + 1) % coreRules.length]?.subjectId ||
        "arabic";

      const meta1 = ALL_SUBJECTS[subj1 as SubjectId];
      const meta2 = ALL_SUBJECTS[subj2 as SubjectId];

      // Slot 1: Evening Focus Session (Core subject)
      proposedEvents.push({
        title: `${meta1?.name_ar || subj1} — مراجعة مركزة وحل تمارين نموذجية`,
        type: "STUDY",
        date: dateStr,
        start_time: "17:30",
        duration_minutes: 60,
        stream_id: streamId,
        subject_id: subj1,
        priority: "HIGH",
        notes: subj1 === weakSubjectId
          ? "موصى بها بناءً على الأخطاء المرصودة في معمل الأخطاء (Error Lab) لتعزيز التثبيت."
          : `مادة أساسية لشعبة ${streamConfig.name_ar} ذات معامل مرتفع.`,
      });

      // Slot 2: Night Practice Session
      proposedEvents.push({
        title: `${meta2?.name_ar || subj2} — تثبيت المفاهيم وتلخيص النقاط المهمة`,
        type: "PRACTICE",
        date: dateStr,
        start_time: "19:00",
        duration_minutes: 45,
        stream_id: streamId,
        subject_id: subj2,
        priority: "MEDIUM",
        notes: "جلسة موازنة بين الفهم والحفظ لتجنب التراكم.",
      });

      // Add Diwan Study Table Activity on weekend / mid-week (Phase 14)
      if (dayOffset === 1 || dayOffset === 4) {
        proposedEvents.push({
          title: `جلسة ديوان العلم — مدارسة جماعية في ${meta1?.name_ar || subj1}`,
          type: "REVIEW",
          date: dateStr,
          start_time: "20:30",
          duration_minutes: 45,
          stream_id: streamId,
          subject_id: subj1,
          priority: "MEDIUM",
          notes: "جلسة مدارسة جماعية على طاولة ديوان العلم مع زملائك في نفس الشعبة.",
        });
      }
    }

    const whyAr = weakSubjectId
      ? `تم تصميم هذا البرنامج خصيصاً لشعبة ${streamConfig.name_ar} مع إعطاء أولوية لمادة (${ALL_SUBJECTS[weakSubjectId as SubjectId]?.name_ar || weakSubjectId}) بناءً على النقاط التي تحتاج تثبيتاً في معمل الأخطاء.`
      : `تم بناء الخطة وفق التوزيع الوزاري لمعاملات شعبة ${streamConfig.name_ar} مع الموازنة بين المواد الأساسية ومواد الدعم.`;

    const impactAr = `المحافظة على وتيرة ${dailyHours} ساعات يومياً تضمن لك تغطية الوحدات المستهدفة ورفع معدلك نحو هدف ${profile?.target_score || 16}/20 بثبات.`;

    return NextResponse.json({
      success: true,
      proposal: {
        type: "study_schedule_recommendation",
        title: "اقتراح شاطر لبرنامج المذاكرة",
        streamNameAr: streamConfig.name_ar,
        whyAr,
        impactAr,
        daysCount,
        proposedEvents,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[POST /api/planner/ai-proposal] Error:", err);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
