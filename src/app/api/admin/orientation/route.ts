import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { OFFICIAL_INSTITUTIONS } from "@/lib/orientation/data/institutions";
import { OFFICIAL_PROGRAMS } from "@/lib/orientation/data/programs";
import { OFFICIAL_FIELDS } from "@/lib/orientation/data/fields";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/orientation
 * Algerian Higher Education & Orientation management data.
 * Guarded by 'orientation.read' permission.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("orientation.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const totalInstitutions = OFFICIAL_INSTITUTIONS.length;
    const totalPrograms = OFFICIAL_PROGRAMS.length;
    const totalFields = OFFICIAL_FIELDS.length;

    // Aggregate by institution type
    const institutionTypes = OFFICIAL_INSTITUTIONS.reduce((acc: Record<string, number>, inst) => {
      const type = inst.institutionType || "university";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    // Wilaya coverage
    const uniqueWilayas = new Set(OFFICIAL_INSTITUTIONS.map((i) => i.wilayaId)).size;

    // Top programs sample
    const samplePrograms = OFFICIAL_PROGRAMS.slice(0, 15).map((p) => ({
      id: p.id,
      code: p.programCode,
      nameAr: p.nameAr,
      fieldId: p.fieldId,
      minScore2024: p.cutoffs?.find((c) => c.academicYear.includes("2024"))?.cutoffGeneralAverage ?? null,
      institution: p.institutions?.[0]?.institution?.shortName || p.institutions?.[0]?.institution?.nameAr || "مؤسسة وطنية",
    }));

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalInstitutions,
          totalPrograms,
          totalFields,
          wilayaCoverageCount: uniqueWilayas,
          institutionTypes,
        },
        programsSample: samplePrograms,
        dataSource: "المنشور الوزاري رقم 01 / circulaire.mesrs.dz",
      },
    });
  } catch (err: any) {
    console.error("[AdminOrientation] Error compiling orientation data:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load orientation data", details: err?.message },
      { status: 500 }
    );
  }
}
