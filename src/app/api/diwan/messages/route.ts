import { NextRequest, NextResponse } from "next/server";
import { DiwanService } from "@/lib/diwan/diwan-service";
import { DiwanGuardian } from "@/lib/diwan/diwan-guardian";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tableId = searchParams.get("tableId");

    if (!tableId) {
      return NextResponse.json({ success: false, error: "tableId is required" }, { status: 400 });
    }

    const messages = await DiwanService.getMessages(tableId);

    // Privacy & moderation filtering: only return visible messages
    const visibleMessages = messages.filter(
      (m) => !m.is_deleted && m.status !== "HIDDEN" && m.status !== "DELETED"
    );

    return NextResponse.json({ success: true, messages: visibleMessages });
  } catch (err: any) {
    console.error("[API Diwan Messages GET] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tableId, userId, userName, userAvatar, content, messageType, replyToId } = body;

    if (!tableId || !userId || !content) {
      return NextResponse.json(
        { success: false, error: "الرسالة ومعرف المستخدم مطلوبان." },
        { status: 400 }
      );
    }

    // Server-Side Hardening & Anti-Abuse via DiwanGuardian
    const validation = DiwanGuardian.validateMessage({
      userId,
      content,
      isReaction: messageType === "reaction",
    });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errorAr || "تم رفض الرسالة لمخالفتها ميثاق الأمان." },
        { status: 429 }
      );
    }

    const message = await DiwanService.sendMessage({
      tableId,
      userId,
      userName: userName || "طالب شاطر",
      userAvatar: userAvatar || "/illustrations/characters/scholar.jpg",
      content: validation.sanitizedContent,
      messageType: messageType || "chat",
      replyToId: replyToId || null,
    });

    return NextResponse.json({ success: true, message });
  } catch (err: any) {
    console.error("[API Diwan Messages POST] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
