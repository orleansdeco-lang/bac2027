import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getFunnelMetrics } from "@/lib/admin/operations-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authResult = await requirePermission("analytics.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const funnel = await getFunnelMetrics();

    return NextResponse.json({
      success: true,
      data: funnel,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Erreur de chargement du funnel" },
      { status: 500 }
    );
  }
}
