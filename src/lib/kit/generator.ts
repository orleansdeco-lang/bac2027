import QRCode from "qrcode";
import { AdminOrderRecord } from "@/lib/admin/orders";
import { PhysicalKitDocumentData } from "./types";

/**
 * Formats a clean public SHATER ID
 * Example format: ST-7K42-91M
 */
export function formatShaterId(rawId?: string | null, fallbackKey?: string): string {
  if (rawId && rawId.trim()) {
    return rawId.trim().toUpperCase();
  }

  // Derive a deterministic clean public identifier from fallback key
  const clean = (fallbackKey || "SHATER2027").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const part1 = (clean.slice(0, 4) || "7K42").padEnd(4, "X");
  const part2 = (clean.slice(-3) || "91M").padStart(3, "0");
  return `ST-${part1}-${part2}`;
}

/**
 * Generates high-resolution QR codes as base64 Data URLs
 */
export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 320,
      margin: 1,
      color: {
        dark: "#0F172A",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "M",
    });
  } catch (err) {
    console.error("[KitGenerator] Failed to generate QR code:", err);
    return "";
  }
}

/**
 * Builds the complete, print-ready document data for an order
 * Strictly enforces ZERO secrets / NO passwords.
 */
export async function buildPhysicalKitDocumentData(
  order: AdminOrderRecord,
  baseUrl?: string
): Promise<PhysicalKitDocumentData> {
  const origin = baseUrl || "https://shater-bac.dz";
  const loginUrl = `${origin}/login?ref=kit&order=${encodeURIComponent(order.order_number)}`;
  const websiteUrl = origin;

  // WhatsApp Support details
  const whatsappNumber = "+213 550 85 32 34";
  const whatsappRawPhone = "213550853234";
  const whatsappMessage = encodeURIComponent(
    `السلام عليكم فريق شاطر، أنا التلميذ(ة) ${order.student.full_name || ""}، رقم طلبي هو: ${order.order_number}. أحتاج مساعدة أو استفسار.`
  );
  const whatsappUrl = `https://wa.me/${whatsappRawPhone}?text=${whatsappMessage}`;

  // Generate both QR codes concurrently
  const [platformQrCode, whatsappQrCode] = await Promise.all([
    generateQrCodeDataUrl(loginUrl),
    generateQrCodeDataUrl(whatsappUrl),
  ]);

  // Format date in Arabic
  let formattedDate = "";
  try {
    const d = new Date(order.created_at);
    formattedDate = d.toLocaleDateString("ar-DZ", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    formattedDate = order.created_at;
  }

  // Derive public SHATER ID
  const shaterId = formatShaterId(
    order.student.shater_id,
    order.student.id || order.id
  );

  return {
    orderNumber: order.order_number,
    shaterId,
    studentName: order.student.full_name || order.shipping_address.full_name || "تلميذ شاطر",
    phone: order.student.phone || order.shipping_address.phone || "",
    wilaya: order.shipping_address.wilaya || "غير محدد",
    commune: order.shipping_address.commune || "",
    address: order.shipping_address.address || "",
    planName: order.plan.name || "SHATER BAC",
    planDuration: `${order.plan.duration_months} أشهر`,
    amount: order.amount,
    currency: "DA",
    formattedPrice: `${order.amount.toLocaleString()} DA`,
    formattedDate,
    carrier: order.shipment.carrier || "Yalidine Express",
    trackingNumber: order.shipment.tracking_number,
    loginUrl,
    websiteUrl,
    platformQrCode,
    whatsappUrl,
    whatsappNumber,
    whatsappQrCode,
    notes: order.shipping_address.delivery_notes || null,
  };
}
