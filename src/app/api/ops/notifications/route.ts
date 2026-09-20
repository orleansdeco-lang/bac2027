import { NextResponse } from "next/server";
import { extractAndVerifyOperator } from "@/lib/operations/auth";
import { getPaymentOrders } from "@/lib/operations/payments";
import { loadServerStudentProfiles } from "@/lib/operations/students";
import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export interface AdminNotificationItem {
  id: string;
  type: "NEW_STUDENT_SIGNUP" | "NEW_PAYMENT_ORDER" | "NEW_COD_ORDER";
  title: string;
  description: string;
  timestamp: string; // ISO
  actorName: string;
  actorPhone?: string;
  amount?: number;
  wilaya?: string;
  actionUrl: string;
}

/**
 * GET /api/ops/notifications
 * Delivers real-time notifications strictly for the administrator:
 * 1. When a new student creates an account
 * 2. When a student places a subscription order (online or COD)
 */
export async function GET(req: Request) {
  const operator = await extractAndVerifyOperator(req);
  if (!operator) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Operator access required" },
      { status: 403 }
    );
  }

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;
  const client = token ? createAuthenticatedSupabaseClient(token) : supabase;

  const notifications: AdminNotificationItem[] = [];

  try {
    // 1. Fetch recent payment orders (Last 50)
    const orders = await getPaymentOrders({ limit: 50 }, token);
    for (const order of orders) {
      const isCod = order.paymentMethod === "cash" || order.orderType === "COD";
      notifications.push({
        id: `notif_order_${order.id}`,
        type: isCod ? "NEW_COD_ORDER" : "NEW_PAYMENT_ORDER",
        title: isCod ? "طلب توصيل منزلي جديد (COD)" : "طلب اشتراك ووصل دفع جديد",
        description: isCod
          ? `طلب التلميذ ${order.shippingName || order.studentName || "مجهول"} توصيل إلى ولاية ${order.shippingWilaya || "—"}`
          : `أرسل التلميذ ${order.studentName || "مجهول"} وصل دفع بقيمة ${(order.amount || 4900).toLocaleString()} دج`,
        timestamp: order.submittedAt || order.createdAt || new Date().toISOString(),
        actorName: order.shippingName || order.studentName || "تلميذ مسجل",
        actorPhone: order.shippingPhone || order.studentPhone || undefined,
        amount: order.amount,
        wilaya: order.shippingWilaya || undefined,
        actionUrl: "/ops/finance",
      });
    }

    // 2. Fetch recent registered students from Supabase or server profile
    if (isSupabaseConfigured && client) {
      const { data: dbStudents } = await client
        .from("student_profiles")
        .select("id, first_name, last_name, student_phone, wilaya_name, created_at")
        .neq("email", "azinox27@gmail.com")
        .order("created_at", { ascending: false })
        .limit(30);

      if (Array.isArray(dbStudents)) {
        for (const s of dbStudents) {
          const name = `${s.first_name || ""} ${s.last_name || ""}`.trim() || "تلميذ جديد";
          notifications.push({
            id: `notif_student_${s.id}`,
            type: "NEW_STUDENT_SIGNUP",
            title: "تسجيل تلميذ جديد في شاطر 🎉",
            description: `فتح ${name} حساباً جديداً${s.wilaya_name ? ` من ولاية ${s.wilaya_name}` : ""}`,
            timestamp: s.created_at || new Date().toISOString(),
            actorName: name,
            actorPhone: s.student_phone || undefined,
            wilaya: s.wilaya_name || undefined,
            actionUrl: "/ops/students",
          });
        }
      }
    }

    // Merge server registered students
    const localStudents = loadServerStudentProfiles();
    for (const s of localStudents) {
      if (s.id && !notifications.some((n) => n.id === `notif_student_${s.id}`)) {
        notifications.push({
          id: `notif_student_${s.id}`,
          type: "NEW_STUDENT_SIGNUP",
          title: "تسجيل تلميذ جديد في شاطر 🎉",
          description: `فتح ${s.fullName || "تلميذ جديد"} حساباً جديداً${s.wilayaName ? ` من ولاية ${s.wilayaName}` : ""}`,
          timestamp: s.createdAt || s.trialStartedAt || new Date().toISOString(),
          actorName: s.fullName || "تلميذ مسجل",
          actorPhone: s.studentPhone || undefined,
          wilaya: s.wilayaName || undefined,
          actionUrl: "/ops/students",
        });
      }
    }

    // Sort newest first
    notifications.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      success: true,
      notifications: notifications.slice(0, 30),
      unreadCount: notifications.filter((n) => {
        const diffHours = (Date.now() - new Date(n.timestamp).getTime()) / (1000 * 60 * 60);
        return diffHours <= 24; // Unread if in last 24h
      }).length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load notifications" },
      { status: 500 }
    );
  }
}
