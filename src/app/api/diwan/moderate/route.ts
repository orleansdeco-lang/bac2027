import { NextRequest, NextResponse } from "next/server";
import { DiwanService } from "@/lib/diwan/diwan-service";
import { DiwanGuardian } from "@/lib/diwan/diwan-guardian";
import { DiwanReportReason } from "@/types/diwan";

export const dynamic = "force-dynamic";

const VALID_REPORT_REASONS: DiwanReportReason[] = [
  "إساءة",
  "تنمر",
  "محتوى غير مناسب",
  "سبام",
  "غش",
  "أخرى",
];

export async function GET(req: NextRequest) {
  try {
    const logs = DiwanGuardian.getAuditLogs();
    return NextResponse.json({ success: true, logs });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, messageId, tableId, reporterUserId, moderatorId, reason, details } = body;

    // ------------------------------------------------------------------------
    // 1. REPORT MESSAGE (With Auto-Escalation & Immutable Logging)
    // ------------------------------------------------------------------------
    if (action === "REPORT_MESSAGE") {
      if (!messageId || !tableId || !reporterUserId || !reason) {
        return NextResponse.json(
          { success: false, error: "معلومات الإبلاغ غير مكتملة." },
          { status: 400 }
        );
      }

      // Validate reason against standard vocabulary
      const validReason = VALID_REPORT_REASONS.includes(reason as DiwanReportReason)
        ? reason
        : "محتوى غير مناسب";

      const escalation = await DiwanGuardian.handleReport({
        messageId,
        roomId: tableId,
        reporterUserId,
        reason: validReason,
        details,
      });

      return NextResponse.json({
        success: true,
        message: "تم تسجيل الإبلاغ للمراجعة الفورية بنجاح 🛡️",
        escalationStatus: escalation.messageStatus,
        reportCount: escalation.reportCount,
      });
    }

    // ------------------------------------------------------------------------
    // 2. MODERATOR DELETE / HIDE MESSAGE
    // ------------------------------------------------------------------------
    if (action === "DELETE_MESSAGE") {
      if (!messageId || !moderatorId) {
        return NextResponse.json(
          { success: false, error: "معلومات الحذف غير مكتملة." },
          { status: 400 }
        );
      }

      const cleanReason = reason || "مخالفة ميثاق مجلس العلم";

      await DiwanService.deleteMessage(messageId, moderatorId, cleanReason);

      await DiwanGuardian.logModerationAction({
        moderatorId,
        actionType: "DELETE_MESSAGE",
        targetType: "MESSAGE",
        targetId: messageId,
        roomId: tableId,
        reason: cleanReason,
      });

      return NextResponse.json({ success: true, message: "تم حذف الرسالة وتوثيق الإجراء الإداري بنجاح." });
    }

    // ------------------------------------------------------------------------
    // 3. WARN / FLAG MEMBER
    // ------------------------------------------------------------------------
    if (action === "WARN_MEMBER") {
      const { targetUserId } = body;
      if (!targetUserId || !moderatorId) {
        return NextResponse.json({ success: false, error: "بيانات التنبيه غير مكتملة." }, { status: 400 });
      }

      await DiwanGuardian.logModerationAction({
        moderatorId,
        actionType: "WARN_MEMBER",
        targetType: "STUDENT",
        targetId: targetUserId,
        roomId: tableId,
        reason: reason || "تنبيه سلوكي",
      });

      return NextResponse.json({ success: true, message: "تم توثيق تنبيه الطالب في السجل الرقابي." });
    }

    return NextResponse.json({ success: false, error: "إجراء غير معروف." }, { status: 400 });
  } catch (err: any) {
    console.error("[API Diwan Moderate POST] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
