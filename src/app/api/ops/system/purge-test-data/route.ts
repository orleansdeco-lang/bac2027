import { NextResponse } from "next/server";
import { extractAndVerifyOperator } from "@/lib/operations/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { createAuthenticatedSupabaseClient, isSupabaseConfigured, supabase } from "@/lib/supabase/client";
import { recordAuditLog } from "@/lib/operations/audit";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/system/purge-test-data
 * Strictly restricted to platform OWNER verified via public.user_roles.
 * Wipes dummy/test/mock data without hardcoded UUID backdoors.
 */
export async function POST(req: Request) {
  const operator = await extractAndVerifyOperator(req);
  if (!operator || !operator.isOwner) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Only platform owner can purge test data" },
      { status: 403 }
    );
  }

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;
  const client = getAdminClient() || (token ? createAuthenticatedSupabaseClient(token) : null) || supabase;

  let purgedDbStudents = 0;
  let purgedDbOrders = 0;

  // Clear global in-memory buffers
  if (typeof globalThis !== "undefined") {
    (globalThis as any).__BAC_STUDENTS_REGISTRY__ = [];
  }

  // Purge test records from PostgreSQL (protecting all administrative users)
  if (isSupabaseConfigured && client) {
    try {
      // Find all owners and operators to protect them from deletion
      const { data: adminRoles } = await client
        .from("user_roles")
        .select("user_id")
        .in("role", ["OWNER", "OPERATOR"]);

      const protectedIds = (adminRoles || []).map((r) => r.user_id).filter(Boolean);

      // Purge test student profiles
      let studentQuery = client
        .from("student_profiles")
        .delete()
        .or("id.ilike.test-%,id.ilike.mock-%,id.ilike.student_%");

      if (protectedIds.length > 0) {
        studentQuery = studentQuery.not("id", "in", `(${protectedIds.join(",")})`);
      }

      const { data: testProfiles, error: pError } = await studentQuery.select("id");
      if (!pError && testProfiles) {
        purgedDbStudents = testProfiles.length;
      }

      // Purge test payment orders
      const { data: testOrders, error: oError } = await client
        .from("payment_orders")
        .delete()
        .or("notes.ilike.%test%,notes.ilike.%mock%")
        .select("id");

      if (!oError && testOrders) {
        purgedDbOrders = testOrders.length;
      }
    } catch (dbErr) {
      console.error("Supabase purge error:", dbErr);
    }
  }

  await recordAuditLog({
    actorUserId: operator.userId,
    actorRole: operator.role,
    action: "SYSTEM_PURGE_TEST_DATA",
    targetType: "student_profile",
    targetId: "ALL_TEST_DATA",
    reason: "Purge test data requested by platform owner",
    afterState: { purgedDbStudents, purgedDbOrders },
  });

  return NextResponse.json({
    success: true,
    message: "تم تطهير وحذف كافة بيانات الاختبار بنجاح مع الحفاظ على حسابات الإدارة.",
    purged: {
      dbStudents: purgedDbStudents,
      dbOrders: purgedDbOrders,
    },
  });
}
