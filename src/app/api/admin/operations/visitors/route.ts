import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getLiveActiveSessions, getVisitorAnalytics } from "@/lib/admin/operations-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authResult = await requirePermission("analytics.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get("days") || "7", 10);

  try {
    const [live, analytics] = await Promise.all([
      getLiveActiveSessions(5),
      getVisitorAnalytics(days),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        live,
        analytics,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Erreur de chargement des visiteurs" },
      { status: 500 }
    );
  }
}
