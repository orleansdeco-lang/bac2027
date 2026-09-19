import { NextRequest, NextResponse } from "next/server";
import { SchoolService } from "@/lib/services/school-service";
import { getWilayaByCode, getCommunesByWilayaCode } from "@/domain/administrative/algeria-administrative";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/schools/submit
 * Allows students to submit an unlisted high school for administrative review.
 * Strictly isolates submissions into high_school_submissions table (status='pending').
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proposed_name, wilaya_code, wilaya_name_ar, commune_name_ar } = body;

    const trimmedName = proposed_name ? String(proposed_name).trim() : "";
    if (!trimmedName || trimmedName.length < 3) {
      return NextResponse.json(
        { success: false, error: "يرجى كتابة اسم الثانوية كاملاً (3 أحرف على الأقل)." },
        { status: 400 }
      );
    }

    if (!wilaya_code || !commune_name_ar) {
      return NextResponse.json(
        { success: false, error: "يرجى اختيار الولاية والبلدية أولاً." },
        { status: 400 }
      );
    }

    // Validate Wilaya
    const wilaya = getWilayaByCode(wilaya_code);
    if (!wilaya) {
      return NextResponse.json(
        { success: false, error: "رمز الولاية غير صالح." },
        { status: 400 }
      );
    }

    // Validate Commune
    const communes = getCommunesByWilayaCode(wilaya_code);
    const communeValid = communes.some((c) => c.name_ar === commune_name_ar);
    if (!communeValid) {
      return NextResponse.json(
        { success: false, error: "البلدية المحددة لا تنتمي إلى هذه الولاية." },
        { status: 400 }
      );
    }

    // Try to resolve current authenticated user id if present
    let userId: string | null = null;
    const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");
    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;
    if (token) {
      const supabaseServer = createServerSupabaseClient(token);
      if (supabaseServer) {
        const { data: userData } = await supabaseServer.auth.getUser();
        if (userData?.user?.id) {
          userId = userData.user.id;
        }
      }
    }

    // Submit via SchoolService (handles duplicate checks against official and pending)
    const result = await SchoolService.submitSchool(
      {
        proposed_name: trimmedName,
        wilaya_code,
        wilaya_name_ar: wilaya_name_ar || wilaya.name_ar,
        commune_name_ar,
      },
      userId
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "تعذر إرسال طلب إضافة الثانوية." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم إرسال طلب إضافة الثانوية بنجاح. سيتم التحقق منها قبل اعتمادها.",
      submission: result.submission,
    });
  } catch (error: any) {
    console.error("POST /api/schools/submit error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "حدث خطأ غير متوقع أثناء معالجة طلبك." },
      { status: 500 }
    );
  }
}
