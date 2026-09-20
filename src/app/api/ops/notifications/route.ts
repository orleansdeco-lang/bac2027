import { NextResponse } from "next/server";
import { extractAndVerifyOperator } from "@/lib/operations/auth";
import { getPaymentOrders } from "@/lib/operations/payments";
import { loadServerStudentProfiles, isRealStudentId } from "@/lib/operations/students";
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

const ADMIN_USER_ID = "7f7f704e-d9f1-4edf-9952-591f41fc0c55";
const ADMIN_EMAIL = "azinox27@gmail.com";

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
      if (order.userId && !isRealStudentId(order.userId)) continue;
      const isCod = order.paymentMethod === "cash" || order.orderType === "COD";
      const validTimestamp = order.submittedAt || order.createdAt || "2025-01-01T00:00:00.000Z";
      notifications.push({
        id: `notif_order_${order.id}`,
        type: isCod ? "NEW_COD_ORDER" : "NEW_PAYMENT_ORDER",
        title: isCod ? "طلب توصيل منزلي جديد (COD)" : "طلب اشتراك ووصل دفع جديد",
        description: isCod
          ? `طلب التلميذ ${order.shippingName || order.studentName || "مجهول"} توصيل إلى ولاية ${order.shippingWilaya || "—"}`
          : `أرسل التلميذ ${order.studentName || "مجهول"} وصل دفع بقيمة ${(order.amount || 4900).toLocaleString()} دج`,
        timestamp: validTimestamp,
        actorName: order.shippingName || order.studentName || "تلميذ مسجل",
        actorPhone: order.shippingPhone || order.studentPhone || undefined,
        amount: order.amount,
        wilaya: order.shippingWilaya || undefined,
        actionUrl: "/ops/finance",
      });
    }

    // 2. Fetch recent registered students from Supabase
    if (isSupabaseConfigured && client) {
      try {
        const { data: dbStudents } = await client
          .from("student_profiles")
          .select("id, first_name, last_name, student_phone, wilaya_name, created_at")
          .neq("id", ADMIN_USER_ID)
          .order("created_at", { ascending: false })
          .limit(30);

        if (Array.isArray(dbStudents)) {
          for (const s of dbStudents) {
            if (!s?.id || s.id === ADMIN_USER_ID || !isRealStudentId(s.id)) continue;
            const name = `${s.first_name || ""} ${s.last_name || ""}`.trim() || "تلميذ جديد";
            const validTimestamp = s.created_at || "2025-01-01T00:00:00.000Z";
            notifications.push({
              id: `notif_student_${s.id}`,
              type: "NEW_STUDENT_SIGNUP",
              title: "تسجيل تلميذ جديد في شاطر 🎉",
              description: `فتح ${name} حساباً جديداً${s.wilaya_name ? ` من ولاية ${s.wilaya_name}` : ""}`,
              timestamp: validTimestamp,
              actorName: name,
              actorPhone: s.student_phone || undefined,
              wilaya: s.wilaya_name || undefined,
              actionUrl: "/ops/students",
            });
          }
        }
      } catch (dbErr) {
        console.warn("Supabase student_profiles fetch for notifs skipped:", dbErr);
      }
    }

    // Merge server registered students
    const localStudents = loadServerStudentProfiles();
    for (const s of localStudents) {
      if (
        s.id &&
        s.id !== ADMIN_USER_ID &&
        isRealStudentId(s.id) &&
        s.email !== ADMIN_EMAIL &&
        !notifications.some((n) => n.id === `notif_student_${s.id}`)
      ) {
        const validTimestamp = s.createdAt || s.trialStartedAt || "2025-01-01T00:00:00.000Z";
        notifications.push({
          id: `notif_student_${s.id}`,
          type: "NEW_STUDENT_SIGNUP",
          title: "تسجيل تلميذ جديد في شاطر 🎉",
          description: `فتح ${s.fullName || "تلميذ جديد"} حساباً جديداً${s.wilayaName ? ` من ولاية ${s.wilayaName}` : ""}`,
          timestamp: validTimestamp,
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

    const now = Date.now();
    return NextResponse.json({
      success: true,
      notifications: notifications.slice(0, 30),
      unreadCount: notifications.filter((n) => {
        const time = new Date(n.timestamp).getTime();
        if (isNaN(time) || time === 0) return false;
        const diffHours = (now - time) / (1000 * 60 * 60);
        return diffHours >= 0 && diffHours <= 24; // Unread if in last 24h
      }).length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to load notifications" },
      { status: 500 }
    );
  }
}
