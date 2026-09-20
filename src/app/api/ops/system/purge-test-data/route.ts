import { NextResponse } from "next/server";
import { extractAndVerifyOperator, isAbsoluteOwner } from "@/lib/operations/auth";
import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "@/lib/supabase/client";
import { recordAuditLog } from "@/lib/operations/audit";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/system/purge-test-data
 * Strictly restricted to Platform Owner (azinox27@gmail.com).
 * Wipes all dummy, test, and mock subscribers while safeguarding the real Owner account.
 */
export async function POST(req: Request) {
  const operator = await extractAndVerifyOperator(req);
  if (!operator || (!operator.isOwner && !isAbsoluteOwner(operator.userId))) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Only platform owner can purge test data" },
      { status: 403 }
    );
  }

  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;
  const client = token ? createAuthenticatedSupabaseClient(token) : supabase;

  let purgedDbStudents = 0;
  let purgedDbOrders = 0;

  // 1. Reset durable runtime files
  const runtimeDir = path.join(process.cwd(), ".runtime");
  const filesToReset = [
    "students.json",
    "payment_orders.json",
    "referrals.json",
    "credit_transactions.json",
    "vouchers.json",
  ];

  try {
    if (fs.existsSync(runtimeDir)) {
      for (const file of filesToReset) {
        const p = path.join(runtimeDir, file);
        if (fs.existsSync(p)) {
          fs.writeFileSync(p, "[]", "utf8");
        }
      }
    }
  } catch (err) {
    console.error("Failed to reset runtime files:", err);
  }

  // 2. Clear global in-memory buffers
  if (typeof globalThis !== "undefined") {
    (globalThis as any).__BAC_STUDENTS_REGISTRY__ = [];
  }

  // 3. Purge test records from Supabase (preserving azinox27@gmail.com)
  if (isSupabaseConfigured && client) {
    try {
      // Purge test student profiles
      const { data: testProfiles, error: pError } = await client
        .from("student_profiles")
        .delete()
        .neq("email", "azinox27@gmail.com")
        .or("email.ilike.%@test.dz,email.ilike.%@mock.dz,id.ilike.test-%,id.ilike.student_%")
        .select("id");

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
    afterState: { purgedDbStudents, purgedDbOrders, runtimeReset: true },
  });

  return NextResponse.json({
    success: true,
    message: "تم تطهير وحذف كافة بيانات الاختبار بنجاح مع الحفاظ على حساب المدير الرئيسي.",
    purged: {
      dbStudents: purgedDbStudents,
      dbOrders: purgedDbOrders,
      runtimeFilesReset: true,
    },
  });
}
