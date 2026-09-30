import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { getSubscriptionPlanById } from "@/lib/operations/subscriptions";
import { extractAuthenticatedUserId } from "@/lib/operations/auth";
import { recordAuditLog } from "@/lib/operations/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/orders/checkout
 * Authoritative checkout endpoint for SHATER Physical Kit + COD Subscription.
 * 
 * INVARIANTS:
 * 1. Price is NEVER accepted from the client; it is retrieved strictly from the database.
 * 2. Collects ONLY essential shipping information (Data Minimization).
 * 3. Enforces Algerian phone number regex: ^(05|06|07|02)\d{8}$
 * 4. Creates Order (PENDING), Payment (COD / PENDING), and Subscription (PENDING).
 * 5. DOES NOT activate subscription. Activation is strictly gated behind Payment = PAID + Admin.
 * 6. Generates order number format: SH-2026-XXXXXX.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "يرجى تقديم بيانات الطلب كاملة." },
        { status: 400 }
      );
    }

    const {
      plan_id = "season",
      full_name,
      phone,
      wilaya,
      commune,
      address,
      delivery_notes,
    } = body;

    // 1. Data Minimization & Validation: Required fields only
    if (!full_name || !phone || !wilaya || !commune || !address) {
      return NextResponse.json(
        {
          success: false,
          error: "يرجى ملء جميع معلومات التوصيل الإلزامية: الاسم الكامل، رقم الهاتف، الولاية، البلدية، والعنوان.",
        },
        { status: 400 }
      );
    }

    const cleanFullName = full_name.trim();
    const cleanPhone = phone.replace(/\s+/g, "").trim();
    const cleanWilaya = wilaya.trim();
    const cleanCommune = commune.trim();
    const cleanAddress = address.trim();
    const cleanNotes = (delivery_notes || "").trim() || null;

    if (cleanFullName.length < 3) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال اسم ولقب صالحين." },
        { status: 400 }
      );
    }

    // 2. Strict Algerian Phone Regex Validation
    if (!/^(05|06|07|02)\d{8}$/.test(cleanPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: "يرجى إدخال رقم هاتف جزائري صالح مكون من 10 أرقام (يبدأ بـ 05 أو 06 أو 07 أو 02).",
        },
        { status: 400 }
      );
    }

    // 3. Authoritative Plan & Price Extraction (SERVER-SIDE ONLY)
    // The client sends only plan_id; the server resolves price, duration & availability from database
    const plan = await getSubscriptionPlanById(plan_id);
    if (!plan) {
      return NextResponse.json(
        { success: false, error: `خطة الاشتراك المطلوبة (${plan_id}) غير موجودة في النظام.` },
        { status: 400 }
      );
    }

    if (plan.active === false) {
      return NextResponse.json(
        { success: false, error: `الخطة '${plan.name}' غير متاحة للطلب حالياً.` },
        { status: 400 }
      );
    }

    const authoritativePrice = Number(plan.price_dzd);
    const authoritativeDuration = Number(plan.duration_months) || 10;
    const shippingFee = 0.0; // Free shipping for physical VIP kit
    const totalAmount = authoritativePrice + shippingFee;

    // 4. Resolve authenticated user if present (guest checkout allowed)
    const callerId = await extractAuthenticatedUserId(req);
    const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;

    const client = (token ? createAuthenticatedSupabaseClient(token) : null) || getAdminClient() || supabase;
    if (!isSupabaseConfigured || !client) {
      return NextResponse.json(
        { success: false, error: "خدمة قاعدة البيانات غير متاحة حالياً." },
        { status: 503 }
      );
    }

    const orderId = crypto.randomUUID();
    const now = new Date().toISOString();

    // 5. Generate human-readable Order Number in format: SH-2026-XXXXXX
    let orderNumber: string;
    try {
      const { data: seqData, error: seqErr } = await client.rpc("nextval", {
        sequence_name: "public.shater_order_seq",
      });
      if (!seqErr && seqData) {
        orderNumber = `SH-2026-${String(seqData).padStart(6, "0")}`;
      } else {
        const randSix = Math.floor(100000 + Math.random() * 900000);
        orderNumber = `SH-2026-${randSix}`;
      }
    } catch {
      const randSix = Math.floor(100000 + Math.random() * 900000);
      orderNumber = `SH-2026-${randSix}`;
    }

    // 6. Insert Order into `public.orders`
    const { data: insertedOrder, error: orderErr } = await client
      .from("orders")
      .insert({
        id: orderId,
        order_number: orderNumber,
        user_id: callerId || null,
        plan_id: plan.id,
        amount: totalAmount,
        currency: "DZD",
        status: "PENDING",
        created_at: now,
        updated_at: now,
      })
      .select("*")
      .single();

    if (orderErr) {
      console.error("[Checkout] Order insert error:", orderErr);
      return NextResponse.json(
        { success: false, error: `فشل إنشاء الطلب في قاعدة البيانات: ${orderErr.message}` },
        { status: 500 }
      );
    }

    // 7. Insert Shipping Address into `public.shipping_addresses`
    const { error: addressErr } = await client
      .from("shipping_addresses")
      .insert({
        order_id: orderId,
        full_name: cleanFullName,
        phone: cleanPhone,
        wilaya: cleanWilaya,
        commune: cleanCommune,
        address: cleanAddress,
        delivery_notes: cleanNotes,
        created_at: now,
        updated_at: now,
      });

    if (addressErr) {
      console.error("[Checkout] Shipping address insert error:", addressErr);
    }

    // 8. Insert Shipment into `public.shipments` (Status: PENDING)
    const { error: shipmentErr } = await client
      .from("shipments")
      .insert({
        order_id: orderId,
        carrier: "YALIDINE",
        status: "PENDING",
        created_at: now,
        updated_at: now,
      });

    if (shipmentErr) {
      console.error("[Checkout] Shipment insert error:", shipmentErr);
    }

    // 9. Insert Payment into `public.payments` (Method: COD, Status: COD)
    const { error: paymentErr } = await client
      .from("payments")
      .insert({
        order_id: orderId,
        method: "COD",
        status: "COD",
        amount: totalAmount,
        created_at: now,
        updated_at: now,
      });

    if (paymentErr) {
      console.error("[Checkout] Payment insert error:", paymentErr);
    }

    // 10. Insert Subscription into `public.subscriptions` (Status: STRICTLY PENDING!)
    // DO NOT ACTIVATE! Activation happens ONLY after payment settlement & admin approval.
    const expiresDate = new Date();
    expiresDate.setMonth(expiresDate.getMonth() + authoritativeDuration);
    const expiresAt = expiresDate.toISOString();

    if (callerId) {
      const { error: subErr } = await client
        .from("subscriptions")
        .insert({
          order_id: orderId,
          user_id: callerId,
          student_id: callerId,
          plan_id: plan.id,
          status: "PENDING", // STRICTLY PENDING!
          starts_at: now,
          started_at: now,
          expires_at: expiresAt,
          notes: "اشتراك باقة مادية COD بانتظار استلام وتسوية المبلغ",
          created_at: now,
          updated_at: now,
        });

      if (subErr) {
        console.error("[Checkout] Subscription insert error:", subErr);
      }
    }

    // 11. Backward Compatibility: Insert / Sync to legacy `payment_orders`
    try {
      await client.from("payment_orders").insert({
        id: orderId,
        user_id: callerId || null,
        plan: plan.id,
        amount: totalAmount,
        currency: "DZD",
        payment_method: "cash",
        status: "PENDING",
        order_type: "COD",
        delivery_status: "PENDING",
        shipping_name: cleanFullName,
        shipping_phone: cleanPhone,
        shipping_wilaya: cleanWilaya,
        shipping_commune: cleanCommune,
        shipping_address: cleanAddress,
        notes: cleanNotes || "طلب باقة شاطر المادية COD",
        submitted_at: now,
        created_at: now,
        updated_at: now,
      });
    } catch (legacyErr) {
      console.warn("[Checkout] Non-fatal legacy payment_orders sync warning:", legacyErr);
    }

    // 12. Record Audit Log
    try {
      await recordAuditLog({
        actorUserId: callerId || null,
        actorRole: "STUDENT",
        action: "COD_ORDER_CREATED",
        targetType: "payment_order",
        targetId: orderId,
        reason: `تسجيل طلب باقة شاطر المادية COD (${orderNumber}) لولاية ${cleanWilaya}`,
        afterState: {
          orderNumber,
          planId: plan.id,
          amount: totalAmount,
          wilaya: cleanWilaya,
          status: "PENDING",
        },
      });
    } catch {}

    // 13. Return Success with Confirmation Message
    return NextResponse.json({
      success: true,
      message: "تم تسجيل طلبك بنجاح! سيتم إرسال طلبك عبر شركة التوصيل، والدفع يكون عند الاستلام.",
      order: {
        id: orderId,
        order_number: orderNumber,
        plan_id: plan.id,
        plan_name: plan.name,
        duration_months: authoritativeDuration,
        amount: authoritativePrice,
        shipping_fee: shippingFee,
        total: totalAmount,
        currency: "DZD",
        status: "PENDING",
        payment_status: "COD",
        subscription_status: "PENDING",
        recipient: {
          full_name: cleanFullName,
          phone: cleanPhone,
          wilaya: cleanWilaya,
          commune: cleanCommune,
          address: cleanAddress,
          delivery_notes: cleanNotes,
        },
      },
    });
  } catch (err: any) {
    console.error("[Checkout] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "حدث خطأ أثناء معالجة الطلب، يرجى المحاولة لاحقاً." },
      { status: 500 }
    );
  }
}
