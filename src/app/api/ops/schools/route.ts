import { NextRequest, NextResponse } from "next/server";
import { SchoolService } from "@/lib/services/school-service";
import { extractAndVerifyOperator } from "@/lib/operations/auth";
import { HighSchoolSubmissionStatus } from "@/types/school";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/schools
 * Fetch high school submissions filtered by status.
 * Requires Operator/Owner privileges in production.
 */
export async function GET(request: NextRequest) {
  try {
    const operator = await extractAndVerifyOperator(request);
    // Allow in development or when operator authenticated
    if (!operator && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: "غير مصرح: يتطلب صلاحيات إدارة العمليات (Operator/Owner)." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") as HighSchoolSubmissionStatus | null;

    const validStatuses: HighSchoolSubmissionStatus[] = ["pending", "approved", "rejected", "duplicate"];
    const status = statusParam && validStatuses.includes(statusParam) ? statusParam : undefined;

    const submissions = await SchoolService.getSubmissions(status);

    return NextResponse.json({
      success: true,
      submissions,
    });
  } catch (error: any) {
    console.error("GET /api/ops/schools error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "حدث خطأ أثناء جلب طلبات الثانويات." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ops/schools
 * Perform review action: approve, reject, or mark as duplicate.
 */
export async function POST(request: NextRequest) {
  try {
    const operator = await extractAndVerifyOperator(request);
    if (!operator && process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { success: false, error: "غير مصرح: يتطلب صلاحيات إدارة العمليات (Operator/Owner)." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, submissionId, adminNote } = body;

    if (!submissionId || !action) {
      return NextResponse.json(
        { success: false, error: "بيانات الإجراء غير مكتملة (submissionId, action)." },
        { status: 400 }
      );
    }

    const reviewerId = operator?.userId || "ops-admin";

    if (action === "approve") {
      const result = await SchoolService.approveSubmission(submissionId, reviewerId);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: "تم اعتماد الثانوية بنجاح وإضافتها إلى الدليل الرسمي المعتمد.",
        newSchoolId: result.newSchoolId,
      });
    }

    if (action === "reject") {
      const result = await SchoolService.rejectSubmission(submissionId, reviewerId, adminNote);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: "تم رفض طلب الثانوية وتحديث حالته.",
      });
    }

    if (action === "duplicate") {
      const result = await SchoolService.markAsDuplicate(submissionId, reviewerId, adminNote);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }
      return NextResponse.json({
        success: true,
        message: "تم تصنيف الطلب كطلب مكرر.",
      });
    }

    return NextResponse.json(
      { success: false, error: "الإجراء المطلوب غير معروف." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("POST /api/ops/schools error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "حدث خطأ غير متوقع أثناء مراجعة الطلب." },
      { status: 500 }
    );
  }
}
