import { NextRequest, NextResponse } from "next/server";
import { syncMasterInventory, getMasterStats } from "@/lib/content/bac-inventory";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const syncResult = syncMasterInventory();
    const stats = getMasterStats();

    return NextResponse.json({
      success: syncResult.success,
      message: syncResult.success
        ? "تم تحديث بنك المحتوى أونلاين بنجاح ومطابقة المستودع الرقمي الوطني"
        : "تعذر التحديث التلقائي، تم استخدام النسخة المخزنة مؤقتاً",
      syncedAt: syncResult.syncedAt,
      stats,
    });
  } catch (error: any) {
    console.error("API Error in /api/bac/sync:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to trigger online synchronization",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return POST(request);
}
