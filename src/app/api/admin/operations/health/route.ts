import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { getTrackingHealth } from "@/lib/admin/operations-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authResult = await requirePermission("platform.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const health = await getTrackingHealth();
    return NextResponse.json({ success: true, data: health });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Erreur de chargement de l'état de santé" },
      { status: 500 }
    );
  }
}
