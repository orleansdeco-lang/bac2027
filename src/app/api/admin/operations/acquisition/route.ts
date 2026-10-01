import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getTrafficAcquisition, getCampaignsList } from "@/lib/admin/operations-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authResult = await requirePermission("analytics.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const [channels, campaigns] = await Promise.all([
      getTrafficAcquisition(),
      getCampaignsList(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        channels,
        campaigns,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Erreur de chargement de l'acquisition" },
      { status: 500 }
    );
  }
}
