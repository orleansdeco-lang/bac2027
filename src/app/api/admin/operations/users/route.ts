import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getUserJourney, getWilayaNameFr } from "@/lib/admin/operations-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authResult = await requirePermission("students.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { searchParams } = new URL(req.url);
  const journeyId = searchParams.get("journey");
  const query = searchParams.get("q") || "";

  // 1. If journey identifier requested, return complete user journey timeline
  if (journeyId) {
    try {
      const journey = await getUserJourney(journeyId);
      return NextResponse.json({ success: true, data: journey });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err?.message || "Erreur parcours utilisateur" },
        { status: 500 }
      );
    }
  }

  // 2. Otherwise return users list with joined attribution & orders
  try {
    let usersList: any[] = [];
    if (isSupabaseConfigured && supabase) {
      let qb = supabase
        .from("profiles")
        .select("id, full_name, username, phone, wilaya, stream, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

      if (query.trim()) {
        qb = qb.or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,username.ilike.%${query}%`);
      }

      const { data: profiles, error } = await qb;

      if (!error && profiles) {
        // Fetch sessions and orders for attribution
        const userIds = profiles.map((p) => p.id);
        const [ordersRes, sessionsRes] = await Promise.all([
          supabase.from("orders").select("user_id, plan_id, payment_status, status").in("user_id", userIds),
          supabase.from("analytics_sessions").select("user_id, first_utm_campaign, first_utm_source").in("user_id", userIds),
        ]);

        const ordersMap = new Map<string, any[]>();
        if (ordersRes.data) {
          for (const o of ordersRes.data) {
            if (!ordersMap.has(o.user_id)) ordersMap.set(o.user_id, []);
            ordersMap.get(o.user_id)!.push(o);
          }
        }

        const sessionsMap = new Map<string, any>();
        if (sessionsRes.data) {
          for (const s of sessionsRes.data) {
            if (!sessionsMap.has(s.user_id) && s.first_utm_campaign) {
              sessionsMap.set(s.user_id, s);
            }
          }
        }

        usersList = profiles.map((p) => {
          const userOrders = ordersMap.get(p.id) || [];
          const session = sessionsMap.get(p.id);
          const hasPaid = userOrders.some((o: any) => o.payment_status === "PAID");
          const hasPending = userOrders.some((o: any) => o.payment_status === "PENDING");

          return {
            id: p.id,
            fullName: p.full_name || p.username || "Élève SHATER",
            phone: p.phone || "Non renseigné",
            wilaya: getWilayaNameFr(p.wilaya),
            stream: p.stream || "Général",
            createdAt: p.created_at,
            status: hasPaid ? "Abonné Payé" : hasPending ? "Commande en cours" : "Compte Découverte",
            firstCampaign: session?.first_utm_campaign || "Organique / Direct",
            firstSource: session?.first_utm_source || "direct",
            ordersCount: userOrders.length,
          };
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total: usersList.length,
        users: usersList,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Erreur de chargement des utilisateurs" },
      { status: 500 }
    );
  }
}
