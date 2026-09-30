import { NextResponse } from "next/server";
import { processCarrierWebhook } from "@/lib/shipping/webhook-handler";

export const dynamic = "force-dynamic";

/**
 * Carrier Webhook Ingestion Endpoint
 * 
 * Supports:
 * - POST /api/webhooks/shipping/yalidine
 * - POST /api/webhooks/shipping/zr-express
 * - POST /api/webhooks/shipping/maystro
 * - POST /api/webhooks/shipping/generic
 * 
 * Architecture:
 * Carrier API -> Webhook -> Shipment Status (Authoritative update & DELIVERED != PAID cascade)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ carrier: string }> }
) {
  try {
    const { carrier } = await params;
    const carrierSlug = carrier || "generic";

    // Optional webhook signature / secret verification
    const webhookSecret = process.env.SHIPPING_WEBHOOK_SECRET;
    const authHeader = req.headers.get("authorization") || req.headers.get("x-webhook-secret");
    if (webhookSecret && authHeader !== webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid webhook signature or token." },
        { status: 401 }
      );
    }

    const payload = await req.json().catch(() => null);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload." },
        { status: 400 }
      );
    }

    const result = await processCarrierWebhook(carrierSlug, payload);

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: any) {
    console.error("[CarrierWebhook] Execution error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error processing carrier webhook." },
      { status: 500 }
    );
  }
}
