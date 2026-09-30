import { NextRequest, NextResponse } from "next/server";
import { DiwanService } from "@/lib/diwan/diwan-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, messageId, tableId, reporterUserId, moderatorId, reason, details } = body;

    if (action === "REPORT_MESSAGE") {
      if (!messageId || !tableId || !reporterUserId || !reason) {
        return NextResponse.json({ success: false, error: "معلومات الإبلاغ غير مكتملة." }, { status: 400 });
      }

      await DiwanService.reportMessage({
        messageId,
        tableId,
        reporterUserId,
        reason,
        details,
      });

      return NextResponse.json({ success: true, message: "تم تسجيل الإبلاغ للمراجعة بنجاح." });
    }

    if (action === "DELETE_MESSAGE") {
      if (!messageId || !moderatorId) {
        return NextResponse.json({ success: false, error: "معلومات الحذف غير مكتملة." }, { status: 400 });
      }

      await DiwanService.deleteMessage(messageId, moderatorId, reason || "رسالة مخالفة");
      return NextResponse.json({ success: true, message: "تم حذف الرسالة بنجاح." });
    }

    return NextResponse.json({ success: false, error: "إجراء غير معروف." }, { status: 400 });
  } catch (err: any) {
    console.error("[API Diwan Moderate POST] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
