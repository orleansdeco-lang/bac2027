import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { CustomExamService } from "@/lib/services/custom-exam-service";
import { recordAdminAudit } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/exercises
 * Lists exams and exercises from the official bank.
 * Authoritative Guard: Requires 'exercises.read'.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("exercises.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { searchParams } = new URL(req.url);
  const stream_id = searchParams.get("stream_id") || undefined;
  const subject_id = searchParams.get("subject_id") || undefined;
  const exam_type = searchParams.get("exam_type") || undefined;
  const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
  const term = searchParams.get("term") ? parseInt(searchParams.get("term")!) : undefined;

  try {
    const exams = await CustomExamService.getCustomExams({
      stream_id,
      subject_id,
      exam_type,
      year,
      term,
      includeDrafts: true,
    });

    return NextResponse.json({ success: true, exams });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "فشل جلب قائمة التمارين" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/exercises
 * Publishes a new exam/exercise into the bank.
 * Authoritative Guard: Requires 'exercises.manage'.
 */
export async function POST(req: Request) {
  const authResult = await requirePermission("exercises.manage", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const body = await req.json();
    if (!body.title || !body.stream_id || !body.subject_id || !body.file_url) {
      return NextResponse.json(
        { success: false, error: "العنوان، الشعبة، المادة، وملف الموضوع حقول إجبارية" },
        { status: 400 }
      );
    }

    const result = await CustomExamService.createCustomExam({
      title: body.title,
      stream_id: body.stream_id,
      subject_id: body.subject_id,
      exam_type: body.exam_type || "term_exam",
      year: body.year || new Date().getFullYear(),
      term: body.term ? parseInt(body.term) : null,
      topic_name: body.topic_name,
      school_name: body.school_name,
      wilaya: body.wilaya,
      file_url: body.file_url,
      solution_url: body.solution_url,
      has_solution: Boolean(body.has_solution || body.solution_url),
      difficulty: body.difficulty || "standard",
      is_published: body.is_published !== false,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "فشل حفظ الموضوع" },
        { status: 500 }
      );
    }

    // Record audit log
    await recordAdminAudit(
      {
        actorUserId: context.userId,
        actorRole: context.role,
        action: "EXERCISE_CREATED",
        resourceType: "custom_exam",
        resourceId: result.data?.id || "unknown",
        afterState: { title: body.title, stream_id: body.stream_id, subject_id: body.subject_id },
      },
      context.token
    );

    return NextResponse.json({ success: true, exam: result.data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "خطأ أثناء حفظ الموضوع" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/exercises
 * Removes an exam from the bank.
 * Authoritative Guard: Requires 'exercises.manage'.
 */
export async function DELETE(req: Request) {
  const authResult = await requirePermission("exercises.manage", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "معرف الموضوع مطلوب" }, { status: 400 });
    }

    const ok = await CustomExamService.deleteCustomExam(id);

    if (ok) {
      await recordAdminAudit(
        {
          actorUserId: context.userId,
          actorRole: context.role,
          action: "EXERCISE_DELETED",
          resourceType: "custom_exam",
          resourceId: id,
        },
        context.token
      );
    }

    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "فشل حذف الموضوع" },
      { status: 500 }
    );
  }
}
