import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { CustomExamService } from "@/lib/services/custom-exam-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const stream_id = searchParams.get("stream_id") || undefined;
    const subject_id = searchParams.get("subject_id") || undefined;
    const exam_type = searchParams.get("exam_type") || undefined;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!) : undefined;
    const term = searchParams.get("term") ? parseInt(searchParams.get("term")!) : undefined;
    const includeDrafts = searchParams.get("includeDrafts") === "true";

    const exams = await CustomExamService.getCustomExams({
      stream_id,
      subject_id,
      exam_type,
      year,
      term,
      includeDrafts,
    });

    return NextResponse.json({ success: true, exams });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "فشل جلب المواضيع" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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

    return NextResponse.json({ success: true, exam: result.data });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "خطأ أثناء حفظ الموضوع" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "معرف الموضوع مفقود" }, { status: 400 });
    }

    const ok = await CustomExamService.deleteCustomExam(id);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "فشل حذف الموضوع" },
      { status: 500 }
    );
  }
}
