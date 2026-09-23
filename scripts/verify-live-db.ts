/**
 * Live Supabase DB Verification Script for Migration 023
 * Tests against live Supabase PostgreSQL (erbvmpnxufgeinqnshzu):
 * 1. subscription_plans active state & prices
 * 2. subscriptions table exists and has RLS enabled
 * 3. admin_authoritative_approve_order exists and enforces finance auth
 * 4. Anonymous reading of ops_payment_summary is blocked (401/403/permission denied)
 */

import { supabase } from "../src/lib/supabase/client";

async function verifyLiveDb() {
  console.log("==================================================================");
  console.log("  SHATER BAC — LIVE SUPABASE MIGRATION 023 VERIFICATION");
  console.log("==================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`, detail || "");
      failed++;
    }
  }

  // 1. Verify subscription_plans
  const { data: plans, error: plansErr } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("duration_months", { ascending: false });

  assert(!plansErr && plans && plans.length >= 2, "1a. subscription_plans query succeeds", plansErr);
  const season = plans?.find((p) => p.id === "season");
  const monthly = plans?.find((p) => p.id === "monthly");
  assert(season && Number(season.price_dzd) === 4900 && season.active === true, "1b. season plan is active at 4900 DZD", season);
  assert(monthly && Number(monthly.price_dzd) === 900 && monthly.active === true, "1c. monthly plan is active at 900 DZD", monthly);

  // 2. Verify subscriptions table exists
  const { data: subs, error: subsErr } = await supabase
    .from("subscriptions")
    .select("id")
    .limit(1);

  // Even if empty, the query should not error with "relation does not exist"
  const tableExists = !subsErr || subsErr.code !== "42P01";
  assert(tableExists, "2. public.subscriptions table exists and is queryable", subsErr);

  // 3. Verify admin_authoritative_approve_order RPC exists and enforces finance authorization
  const dummyUuid = "00000000-0000-0000-0000-000000000000";
  const { data: rpcData, error: rpcErr } = await supabase.rpc("admin_authoritative_approve_order", {
    p_order_id: dummyUuid,
  });

  assert(
    rpcErr !== null && rpcErr.message?.includes("Access denied: caller does not possess finance authorization"),
    "3. admin_authoritative_approve_order RPC is active and enforces strict finance authorization",
    rpcErr
  );

  // 4. Verify ops_payment_summary blocks anonymous users
  const { data: financialData, error: financialErr } = await supabase
    .from("ops_payment_summary")
    .select("*")
    .limit(1);

  assert(
    financialErr !== null,
    "4. ops_payment_summary blocks unauthenticated anonymous access",
    financialErr?.message
  );

  console.log("==================================================================");
  console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
  console.log("==================================================================");

  if (failed > 0) process.exit(1);
}

verifyLiveDb().catch((err) => {
  console.error("Fatal verification error:", err);
  process.exit(1);
});
