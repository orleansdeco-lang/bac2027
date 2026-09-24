import { NextResponse } from "next/server";
import { getVapidPublicKey } from "@/lib/notifications/vapid";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    publicKey: getVapidPublicKey(),
  });
}
