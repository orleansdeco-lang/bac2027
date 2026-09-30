import { NextRequest, NextResponse } from "next/server";
import { sanitizeSingleLine } from "@/lib/security/sanitize";
import { DiwanService } from "@/lib/diwan/diwan-service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tableId = searchParams.get("tableId");

    if (!tableId) {
      return NextResponse.json({ success: false, error: "tableId is required" }, { status: 400 });
    }

    const messages = await DiwanService.getMessages(tableId);
    return NextResponse.json({ success: true, messages });
  } catch (err: any) {
    console.error("[API Diwan Messages GET] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tableId, userId, userName, userAvatar, content, messageType, replyToId } = body;

    if (!tableId || !userId || !content || !content.trim()) {
      return NextResponse.json({ success: false, error: "الرسالة لا يمكن أن تكون فارغة" }, { status: 400 });
    }

    const cleanContent = sanitizeSingleLine(content, 500);

    const message = await DiwanService.sendMessage({
      tableId,
      userId,
      userName: userName || "طالب شاطر",
      userAvatar: userAvatar || "/illustrations/characters/scholar.jpg",
      content: cleanContent,
      messageType: messageType || "chat",
      replyToId: replyToId || null,
    });

    return NextResponse.json({ success: true, message });
  } catch (err: any) {
    console.error("[API Diwan Messages POST] Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
