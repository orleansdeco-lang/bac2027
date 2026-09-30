import { NextResponse } from "next/server";
import {
  getNextLearningRecommendation,
  getErrorRepairPlan,
  getStudentMasteryOverview,
  recordStudentPracticeAttempt,
  AttemptSignal,
  SKILLS_ONTOLOGY,
} from "@/lib/learning/learning-intelligence";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { verifyAdminToken } from "@/lib/admin/auth";
import { hasPermission } from "@/lib/admin/permissions";

export const dynamic = "force-dynamic";

/**
 * Helper to authenticate caller and enforce strict student privacy.
 */
async function resolveStudentContext(req: Request, targetStudentId?: string | null) {
  let token: string | null = null;
  let callerUserId: string | null = null;
  let callerRole: string = "STUDENT";

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.replace(/^Bearer\s+/i, "").trim();

    // Check if admin token
    const adminCheck = await verifyAdminToken(token);
    if (adminCheck) {
      return {
        authorized: true,
        callerUserId: adminCheck.userId,
        callerRole: adminCheck.role,
        isAdmin: true,
        studentId: targetStudentId || adminCheck.userId,
      };
    }

    // Check if regular student token in Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user?.id) {
          callerUserId = user.id;
        }
      } catch {
        // ignore
      }
    }
  }

  // If no auth header, fallback to targetStudentId in dev/test or anonymous student
  const effectiveCallerId = callerUserId || targetStudentId || "student-guest-01";
  const effectiveTargetId = targetStudentId || effectiveCallerId;

  // Strict Privacy: Student A cannot access Student B's records
  if (callerUserId && effectiveTargetId !== callerUserId && callerRole === "STUDENT") {
    return {
      authorized: false,
      error: "غير مصرح لك بالاطلاع على السجل التعليمي لطالب آخر (حماية الخصوصية).",
      status: 403,
    };
  }

  return {
    authorized: true,
    callerUserId: effectiveCallerId,
    callerRole,
    isAdmin: false,
    studentId: effectiveTargetId,
  };
}

/**
 * GET /api/learning/recommendations
 * Retrieves next learning recommendation and error repair plan for the student.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const requestedStudentId = searchParams.get("studentId");

  const auth = await resolveStudentContext(req, requestedStudentId);
  if (!auth.authorized || !auth.studentId) {
    return NextResponse.json({ success: false, error: auth.error || "غير مصرح" }, { status: auth.status || 401 });
  }

  const studentId = auth.studentId;
  const recommendation = getNextLearningRecommendation(studentId);
  const masteries = getStudentMasteryOverview(studentId);

  // If target skill has repeated errors, include repair plan
  let errorRepairPlan = null;
  if (recommendation.type === "similar_exercise") {
    const targetMastery = masteries.find((m) => m.skillId === recommendation.targetSkillId);
    if (targetMastery) {
      const topError = Object.entries(targetMastery.repeatedErrorTypes)[0];
      if (topError) {
        errorRepairPlan = getErrorRepairPlan(studentId, recommendation.targetSkillId, topError[0]);
      }
    }
  }

  return NextResponse.json({
    success: true,
    studentId,
    recommendation,
    errorRepairPlan,
    masteries,
  });
}

/**
 * POST /api/learning/recommendations
 * Records a practice attempt signal and recalculates mastery state.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.skillId) {
      return NextResponse.json(
        { success: false, error: "معرّف المهارة (skillId) مطلوب لتسجيل محاولة التدريب." },
        { status: 400 }
      );
    }

    const auth = await resolveStudentContext(req, body.studentId);
    if (!auth.authorized || !auth.studentId) {
      return NextResponse.json({ success: false, error: auth.error || "غير مصرح" }, { status: auth.status || 401 });
    }

    const studentId = auth.studentId;

    const signal: AttemptSignal = {
      attemptId: `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      exerciseId: body.exerciseId || "custom_exercise",
      skillId: body.skillId,
      isCorrect: Boolean(body.isCorrect),
      difficulty: body.difficulty || "standard",
      hintsUsed: Number(body.hintsUsed || 0),
      timeSpentSeconds: Number(body.timeSpentSeconds || 30),
      errorType: body.errorType || undefined,
      timestamp: new Date().toISOString(),
    };

    const updatedMastery = recordStudentPracticeAttempt(signal, studentId);
    const nextRecommendation = getNextLearningRecommendation(studentId);

    return NextResponse.json({
      success: true,
      studentId,
      updatedMastery,
      nextRecommendation,
      messageAr: "تم تسجيل إشارة التدريب وتحديث مصفوفة الإتقان المعرفي بنجاح.",
    });
  } catch (err: any) {
    console.error("[LearningRecommendationsAPI] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "حدث خطأ أثناء معالجة إشارة التدريب." },
      { status: 500 }
    );
  }
}
