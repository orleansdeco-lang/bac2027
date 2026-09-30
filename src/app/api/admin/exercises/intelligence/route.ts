import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import {
  listExerciseIntelligence,
  getExerciseIntelligenceById,
  createExerciseDraft,
  validateExerciseSolution,
  generateProgressiveHints,
  analyzeStudentError,
  recommendRelatedExercises,
  reviewExerciseIntelligence,
  ExerciseLifecycleStatus,
  ExerciseDifficulty,
  ExerciseReviewAction,
  ExerciseReviewOptions,
} from "@/lib/admin/exercise-intelligence";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/exercises/intelligence
 * Lists exercise models or gets specific exercise intelligence details.
 * Guard: Requires 'exercises.read'.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("exercises.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { searchParams } = new URL(req.url);
  const exerciseId = searchParams.get("id");

  if (exerciseId) {
    const exercise = getExerciseIntelligenceById(exerciseId);
    if (!exercise) {
      return NextResponse.json(
        { success: false, error: `المسألة [${exerciseId}] غير موجودة.` },
        { status: 404 }
      );
    }
    const related = recommendRelatedExercises(exercise);
    return NextResponse.json({ success: true, exercise, related });
  }

  const status = (searchParams.get("status") as ExerciseLifecycleStatus) || undefined;
  const subject = searchParams.get("subject") || undefined;
  const stream = searchParams.get("stream") || undefined;
  const difficulty = (searchParams.get("difficulty") as ExerciseDifficulty) || undefined;
  const limit = parseInt(searchParams.get("limit") || "50", 10);

  const items = listExerciseIntelligence({
    status,
    subject,
    stream,
    difficulty,
    limit,
  });

  return NextResponse.json({
    success: true,
    total: items.length,
    items,
  });
}

/**
 * POST /api/admin/exercises/intelligence
 * Handles drafting, validation, hint generation, error analysis, and human review.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.action) {
      return NextResponse.json(
        { success: false, error: "حقل action مطلوب لتحديد العملية." },
        { status: 400 }
      );
    }

    const { action } = body;

    // 1. Standalone Validation (no save)
    if (action === "validate") {
      const authResult = await requirePermission("exercises.read", req);
      if (!authResult.success) return authResult.response;

      const { question, solution, subject } = body;
      if (!question || !solution) {
        return NextResponse.json(
          { success: false, error: "السؤال والحل النموذجي مطلوبان للتحقق." },
          { status: 400 }
        );
      }
      const validation = validateExerciseSolution(question, solution, subject || "mathematics");
      return NextResponse.json({ success: true, validation });
    }

    // 2. Standalone Progressive Hints Generation
    if (action === "hints") {
      const authResult = await requirePermission("exercises.read", req);
      if (!authResult.success) return authResult.response;

      const { question, solution, skills } = body;
      if (!question) {
        return NextResponse.json(
          { success: false, error: "نص المسألة مطلوب لتوليد التلميحات." },
          { status: 400 }
        );
      }
      const hints = generateProgressiveHints(question, solution || "", skills || []);
      return NextResponse.json({ success: true, hints });
    }

    // 3. Student Error Taxonomy Diagnosis
    if (action === "analyze_error") {
      const authResult = await requirePermission("exercises.read", req);
      if (!authResult.success) return authResult.response;

      const { question, solution, studentAnswer } = body;
      if (!question || !studentAnswer) {
        return NextResponse.json(
          { success: false, error: "السؤال وإجابة الطالب مطلوبان لتشخيص الخطأ." },
          { status: 400 }
        );
      }
      const diagnosis = analyzeStudentError(question, solution || "", studentAnswer);
      return NextResponse.json({ success: true, diagnosis });
    }

    // 4. Create AI Exercise Draft (Workflow: Draft -> Validation -> Needs Review)
    if (action === "draft") {
      const authResult = await requirePermission("exercises.manage", req);
      if (!authResult.success) return authResult.response;

      const { context } = authResult;
      const draft = await createExerciseDraft(body.payload, {
        userId: context.userId,
        role: context.role,
      });

      return NextResponse.json({
        success: true,
        exercise: draft,
        messageAr: "تم إنشاء مسودة التمرين والتحقق منها آلياً وهي بانتظار المراجعة والاعتماد البشري.",
      });
    }

    // 5. Human Review Actions (approve, publish, reject, edit, review)
    if (action === "review") {
      const authResult = await requirePermission("exercises.manage", req);
      if (!authResult.success) return authResult.response;

      const { context } = authResult;
      const exerciseId = body.exerciseId?.trim();
      const reviewAction = body.reviewAction as ExerciseReviewAction;
      const options = (body.options || {}) as ExerciseReviewOptions;

      if (!exerciseId || !reviewAction) {
        return NextResponse.json(
          { success: false, error: "exerciseId و reviewAction مطلوبان لتنفيذ المراجعة." },
          { status: 400 }
        );
      }

      const result = await reviewExerciseIntelligence(exerciseId, reviewAction, options, context);

      return NextResponse.json({
        success: true,
        exercise: result.exercise,
        messageAr: result.messageAr,
      });
    }

    return NextResponse.json(
      { success: false, error: `العملية [${action}] غير معروفة.` },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[ExerciseIntelligenceAPI] Error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "حدث خطأ أثناء معالجة الطلب." },
      { status: 400 }
    );
  }
}
