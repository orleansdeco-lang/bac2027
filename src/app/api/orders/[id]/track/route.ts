import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";
import { extractAdminContext } from "@/lib/admin/auth";
import { buildOrderTrackingTimeline } from "@/lib/orders/tracking";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/orders/[id]/track
 * Returns the 8-stage timeline and safe tracking data for an order.
 * 
 * STRICT INVARIANTS:
 * 1. Safe lookup by Order UUID or Order Number (e.g. SH-2026-000184).
 * 2. Strictly verifies authorization: Authenticated student can only view their own order.
 * 3. Does NOT expose internal operator data, admin notes, reviewer IDs, or settlement internals.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id: rawId } = await params;
    const lookupId = decodeURIComponent(rawId || "").trim();

    if (!lookupId) {
      return NextResponse.json(
        { success: false, error: "معرّف أو رقم الطلب مطلوب." },
        { status: 400 }
      );
    }

    const userId = await extractAuthenticatedUserId(req);
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;

    const client = (token ? createAuthenticatedSupabaseClient(token) : null) || getAdminClient() || supabase;
    if (!isSupabaseConfigured || !client) {
      return NextResponse.json(
        { success: false, error: "قاعدة البيانات غير متاحة حالياً." },
        { status: 503 }
      );
    }

    let canonicalOrder: any = null;
    let shippingAddress: any = null;
    let shipment: any = null;
    let payment: any = null;
    let subscription: any = null;

    // Check if lookupId is a UUID or an order number (e.g., SH-2026-XXXXXX)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lookupId);

    // 1. Try querying Migration 039 canonical orders table
    try {
      let query = client
        .from("orders")
        .select(`
          id,
          order_number,
          user_id,
          plan_id,
          amount,
          currency,
          status,
          created_at,
          updated_at,
          shipping_addresses (full_name, phone, wilaya, commune, address, delivery_notes),
          shipments (carrier, tracking_number, status, shipped_at, delivered_at),
          payments (method, status, amount, settled_at),
          subscriptions (status, starts_at, expires_at)
        `);

      if (isUuid) {
        query = query.eq("id", lookupId);
      } else {
        query = query.eq("order_number", lookupId);
      }

      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        // Strict Authorization check:
        // If order belongs to a registered student, caller MUST be that student or a verified admin
        if (data.user_id) {
          if (!userId) {
            return NextResponse.json(
              { success: false, error: "يجب تسجيل الدخول لعرض تفاصيل هذا الطلب." },
              { status: 401 }
            );
          }
          if (data.user_id !== userId) {
            const adminCtx = await extractAdminContext(req);
            if (!adminCtx) {
              return NextResponse.json(
                { success: false, error: "غير مصرح لك بعرض بيانات هذا الطلب." },
                { status: 403 }
              );
            }
          }
        } else {
          // Guest order: reject UUID enumeration. Must provide exact human-readable order_number
          if (isUuid) {
            return NextResponse.json(
              { success: false, error: "الرجاء استخدام رقم الطلب المرجعي (مثل SH-2026-XXXXXX) لتتبع الطلب." },
              { status: 400 }
            );
          }
        }

        canonicalOrder = data;
        shippingAddress = Array.isArray(data.shipping_addresses) ? data.shipping_addresses[0] : data.shipping_addresses;
        shipment = Array.isArray(data.shipments) ? data.shipments[0] : data.shipments;
        payment = Array.isArray(data.payments) ? data.payments[0] : data.payments;
        subscription = Array.isArray(data.subscriptions) ? data.subscriptions[0] : data.subscriptions;
      }
    } catch (canonicalErr) {
      console.warn("[OrderTrackingAPI] Canonical order lookup warning:", canonicalErr);
    }

    // 2. Fallback to legacy payment_orders table if not found in canonical
    if (!canonicalOrder) {
      try {
        let legQuery = client
          .from("payment_orders")
          .select(`
            id,
            user_id,
            plan,
            amount,
            currency,
            status,
            delivery_status,
            payment_method,
            shipping_wilaya,
            shipping_commune,
            shipping_address,
            full_name,
            phone,
            created_at,
            updated_at
          `);

        if (isUuid) {
          legQuery = legQuery.eq("id", lookupId);
        } else {
          // If looking up by SH-2026-XXXXXX, match prefix
          const pseudoPrefix = lookupId.replace(/^SH-2026-/i, "");
          legQuery = legQuery.ilike("id", `${pseudoPrefix}%`);
        }

        const { data: legData, error: legErr } = await legQuery.maybeSingle();

        if (!legErr && legData) {
          if (legData.user_id) {
            if (!userId) {
              return NextResponse.json(
                { success: false, error: "يجب تسجيل الدخول لعرض تفاصيل هذا الطلب." },
                { status: 401 }
              );
            }
            if (legData.user_id !== userId) {
              const adminCtx = await extractAdminContext(req);
              if (!adminCtx) {
                return NextResponse.json(
                  { success: false, error: "غير مصرح لك بعرض بيانات هذا الطلب." },
                  { status: 403 }
                );
              }
            }
          } else {
            if (isUuid) {
              return NextResponse.json(
                { success: false, error: "الرجاء استخدام رقم الطلب المرجعي (مثل SH-2026-XXXXXX) لتتبع الطلب." },
                { status: 400 }
              );
            }
          }

          canonicalOrder = {
            id: legData.id,
            order_number: `SH-2026-${legData.id.substring(0, 6).toUpperCase()}`,
            user_id: legData.user_id,
            plan_id: legData.plan,
            amount: legData.amount,
            currency: legData.currency || "DA",
            status: legData.status === "APPROVED" ? "COMPLETED" : legData.status,
            created_at: legData.created_at,
            updated_at: legData.updated_at,
          };

          shippingAddress = {
            full_name: legData.full_name || "المشترك",
            wilaya: legData.shipping_wilaya || "غير محدد",
            commune: legData.shipping_commune || "",
            address: legData.shipping_address || "",
          };

          shipment = {
            carrier: "Yalidine Express",
            status: legData.delivery_status || "PENDING",
          };

          payment = {
            status: legData.status === "APPROVED" ? "PAID" : "COD",
            method: legData.payment_method === "cash" ? "COD" : "CCP",
            amount: legData.amount,
          };

          subscription = {
            status: legData.status === "APPROVED" ? "ACTIVE" : "PENDING",
            starts_at: legData.status === "APPROVED" ? legData.updated_at || legData.created_at : null,
            expires_at: legData.status === "APPROVED" ? new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString() : null,
          };
        }
      } catch (legErr) {
        console.warn("[OrderTrackingAPI] Legacy payment_orders lookup warning:", legErr);
      }
    }

    if (!canonicalOrder) {
      return NextResponse.json(
        { success: false, error: `الطلب رقم (${lookupId}) غير موجود في النظام.` },
        { status: 404 }
      );
    }

    // PII Protection Invariant: If unauthenticated public tracking, mask recipient name, phone, and exact address
    let sanitizedShippingAddress = shippingAddress;
    if (!userId || (canonicalOrder.user_id && canonicalOrder.user_id !== userId)) {
      if (shippingAddress) {
        const rawName = shippingAddress.full_name || shippingAddress.recipient_name || "";
        const maskedName = rawName.length > 2 ? `${rawName.substring(0, 2)}***` : "المشترك";
        sanitizedShippingAddress = {
          ...shippingAddress,
          full_name: maskedName,
          recipient_name: maskedName,
          address: "حي سكني (محمي لدواعي الخصوصية)",
          phone: shippingAddress.phone ? `${shippingAddress.phone.substring(0, 3)}****${shippingAddress.phone.slice(-2)}` : undefined,
        };
      }
    }

    // Build the 8-step sanitized timeline
    const trackingData = buildOrderTrackingTimeline(
      canonicalOrder,
      shipment,
      payment,
      subscription,
      sanitizedShippingAddress
    );

    return NextResponse.json({
      success: true,
      tracking: trackingData,
    });
  } catch (err: any) {
    console.error("[OrderTrackingAPI] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "تعذر تحميل بيانات التتبع، يرجى المحاولة لاحقاً." },
      { status: 500 }
    );
  }
}
