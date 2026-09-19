import { NextRequest, NextResponse } from "next/server";
import { SchoolService } from "@/lib/services/school-service";
import { getWilayaByCode, getCommunesByWilayaCode } from "@/domain/administrative/algeria-administrative";

export const dynamic = "force-dynamic";

/**
 * GET /api/schools/search
 * Query verified schools filtered by wilaya_code and commune_name_ar.
 * Supports debounced query string, limit, and offset.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wilayaCode = searchParams.get("wilaya_code");
    const communeNameAr = searchParams.get("commune_name_ar");
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");

    if (!wilayaCode || !communeNameAr) {
      return NextResponse.json(
        { success: false, error: "يجب تحديد الولاية والبلدية للبحث عن الثانويات." },
        { status: 400 }
      );
    }

    // Validate Wilaya existence
    const wilaya = getWilayaByCode(wilayaCode);
    if (!wilaya) {
      return NextResponse.json(
        { success: false, error: "رمز الولاية غير صالح." },
        { status: 400 }
      );
    }

    // Validate Commune belongs to Wilaya
    const communes = getCommunesByWilayaCode(wilayaCode);
    const communeValid = communes.some((c) => c.name_ar === communeNameAr);
    if (!communeValid) {
      return NextResponse.json(
        { success: false, error: "البلدية المحددة لا تنتمي إلى هذه الولاية." },
        { status: 400 }
      );
    }

    const limit = limitParam ? Math.min(Math.max(parseInt(limitParam, 10), 1), 50) : 20;
    const offset = offsetParam ? Math.max(parseInt(offsetParam, 10), 0) : 0;

    const result = await SchoolService.searchSchools({
      wilaya_code: wilayaCode,
      commune_name_ar: communeNameAr,
      query,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      schools: result.schools,
      total: result.total,
      limit,
      offset,
    });
  } catch (error: any) {
    console.error("GET /api/schools/search error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "حدث خطأ أثناء البحث عن الثانويات." },
      { status: 500 }
    );
  }
}
