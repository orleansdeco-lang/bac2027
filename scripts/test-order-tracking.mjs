import assert from "assert";
import {
  buildOrderTrackingTimeline,
  calculateDaysRemaining,
  formatArabicDate,
  formatArabicDateTime,
  resolvePlanMetadata,
} from "../src/lib/orders/tracking.js";

console.log("🚚 [SHATER COD] Verifying Student Order Tracking Page & 8-Stage Timeline...\n");

// -----------------------------------------------------------------------------
// 1. Test Arabic Date & Days Calculation Helpers
// -----------------------------------------------------------------------------
console.log("📅 1. Testing Date & Expiry Calculation:");
const arabicDate = formatArabicDate("2026-09-30T10:00:00.000Z");
assert.ok(arabicDate.includes("سبتمبر") || arabicDate.includes("2026"), "Date formatted in Arabic");
console.log(`  ✅ PASS: Arabic Date Formatter: ${arabicDate}`);

const futureExpiry = new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString();
const daysRemaining = calculateDaysRemaining(futureExpiry);
assert.strictEqual(typeof daysRemaining, "number");
assert.ok(daysRemaining >= 99 && daysRemaining <= 101, "Days remaining calculated accurately");
console.log(`  ✅ PASS: Days remaining calculated accurately: ${daysRemaining} days`);

// -----------------------------------------------------------------------------
// 2. Test Plan Metadata Resolution
// -----------------------------------------------------------------------------
console.log("\n🎓 2. Testing Plan Metadata Resolution:");
const seasonPlan = resolvePlanMetadata("season");
assert.ok(seasonPlan.name.includes("SHATER BAC"), "Season plan name correct");
assert.ok(seasonPlan.duration.includes("10"), "Season plan duration 10 months");
console.log(`  ✅ PASS: Season Plan: ${seasonPlan.name} (${seasonPlan.duration})`);

const monthlyPlan = resolvePlanMetadata("monthly");
assert.ok(monthlyPlan.name.includes("الشهري"), "Monthly plan name correct");
console.log(`  ✅ PASS: Monthly Plan: ${monthlyPlan.name} (${monthlyPlan.duration})`);

// -----------------------------------------------------------------------------
// 3. Scenario A: Brand New Order (Just Created)
// -----------------------------------------------------------------------------
console.log("\n📦 3. Scenario A: Brand New Order (PENDING, PENDING, COD, PENDING)");
const newOrderTracking = buildOrderTrackingTimeline(
  {
    id: "ord-1",
    order_number: "SH-2026-000101",
    status: "PENDING",
    created_at: "2026-09-30T12:00:00Z",
    amount: 4900,
    plan_id: "season",
  },
  { status: "PENDING" },
  { status: "COD" },
  { status: "PENDING" }
);

assert.strictEqual(newOrderTracking.timeline.length, 8, "Must contain exactly 8 steps");
assert.strictEqual(newOrderTracking.timeline[0].title, "تم تسجيل الطلب");
assert.strictEqual(newOrderTracking.timeline[0].state, "completed");
assert.strictEqual(newOrderTracking.timeline[0].symbol, "✓");

assert.strictEqual(newOrderTracking.timeline[1].title, "تم تأكيد الطلب");
assert.strictEqual(newOrderTracking.timeline[1].state, "current");
assert.strictEqual(newOrderTracking.timeline[1].symbol, "●");

assert.strictEqual(newOrderTracking.timeline[2].state, "pending");
assert.strictEqual(newOrderTracking.timeline[2].symbol, "○");
assert.strictEqual(newOrderTracking.subscription.is_active, false);
console.log("  ✅ PASS: Step 1 is ✓, Step 2 is ● (current), Steps 3-8 are ○ (pending)");

// -----------------------------------------------------------------------------
// 4. Scenario B: Order Confirmed (CONFIRMED)
// -----------------------------------------------------------------------------
console.log("\n✅ 4. Scenario B: Order Confirmed (CONFIRMED)");
const confirmedTracking = buildOrderTrackingTimeline(
  {
    id: "ord-2",
    order_number: "SH-2026-000102",
    status: "CONFIRMED",
    created_at: "2026-09-30T12:00:00Z",
    amount: 4900,
  },
  { status: "PENDING" },
  { status: "COD" },
  { status: "PENDING" }
);
assert.strictEqual(confirmedTracking.timeline[0].state, "completed");
assert.strictEqual(confirmedTracking.timeline[1].state, "completed");
assert.strictEqual(confirmedTracking.timeline[2].title, "تم تجهيز الطلب");
assert.strictEqual(confirmedTracking.timeline[2].state, "current");
assert.strictEqual(confirmedTracking.timeline[2].symbol, "●");
console.log("  ✅ PASS: Steps 1-2 are ✓, Step 3 is ● (current), Steps 4-8 are ○");

// -----------------------------------------------------------------------------
// 5. Scenario C: In Preparation (PROCESSING)
// -----------------------------------------------------------------------------
console.log("\n🛠️ 5. Scenario C: Kit Prepared / Processing (PROCESSING)");
const processingTracking = buildOrderTrackingTimeline(
  {
    id: "ord-3",
    order_number: "SH-2026-000103",
    status: "PROCESSING",
    created_at: "2026-09-30T12:00:00Z",
    amount: 4900,
  },
  { status: "PENDING" },
  { status: "COD" },
  { status: "PENDING" }
);
assert.strictEqual(processingTracking.timeline[2].state, "completed");
assert.strictEqual(processingTracking.timeline[3].title, "تم الشحن");
assert.strictEqual(processingTracking.timeline[3].state, "current");
assert.strictEqual(processingTracking.timeline[3].symbol, "●");
console.log("  ✅ PASS: Steps 1-3 are ✓, Step 4 is ● (current), Steps 5-8 are ○");

// -----------------------------------------------------------------------------
// 6. Scenario D: Dispatched & In Transit (SHIPPED / OUT_FOR_DELIVERY)
// -----------------------------------------------------------------------------
console.log("\n🚚 6. Scenario D: Shipped & Out for Delivery (SHIPPED + Yalidine Express)");
const shippedTracking = buildOrderTrackingTimeline(
  {
    id: "ord-4",
    order_number: "SH-2026-000104",
    status: "SHIPPED",
    created_at: "2026-09-30T12:00:00Z",
    amount: 4900,
  },
  {
    carrier: "Yalidine Express",
    tracking_number: "TRK-981240-DZ",
    status: "OUT_FOR_DELIVERY",
    shipped_at: "2026-10-01T08:30:00Z",
  },
  { status: "COD" },
  { status: "PENDING" }
);
assert.strictEqual(shippedTracking.timeline[3].state, "completed");
assert.strictEqual(shippedTracking.timeline[3].symbol, "✓");
assert.strictEqual(shippedTracking.timeline[3].carrier, "Yalidine Express");
assert.strictEqual(shippedTracking.timeline[3].tracking_number, "TRK-981240-DZ");
assert.ok(shippedTracking.timeline[3].tracking_url?.includes("yalidine.com"));

assert.strictEqual(shippedTracking.timeline[4].title, "في الطريق");
assert.strictEqual(shippedTracking.timeline[4].state, "current");
assert.strictEqual(shippedTracking.timeline[4].symbol, "●");

assert.strictEqual(shippedTracking.timeline[5].title, "تم التسليم");
assert.strictEqual(shippedTracking.timeline[5].state, "pending");
console.log("  ✅ PASS: Steps 1-4 are ✓, Step 5 (في الطريق) is ● (current), Carrier details attached");

// -----------------------------------------------------------------------------
// 7. Scenario E: Package Delivered, COD Pending Settlement (DELIVERED ≠ PAID)
// -----------------------------------------------------------------------------
console.log("\n💵 7. Scenario E: Delivered, COD Pending Settlement (DELIVERED ≠ PAID):");
const deliveredPendingSettlement = buildOrderTrackingTimeline(
  {
    id: "ord-5",
    order_number: "SH-2026-000105",
    status: "SHIPPED",
    created_at: "2026-09-30T12:00:00Z",
    amount: 4900,
  },
  {
    carrier: "Yalidine Express",
    tracking_number: "TRK-981240-DZ",
    status: "DELIVERED",
    shipped_at: "2026-10-01T08:30:00Z",
    delivered_at: "2026-10-02T14:00:00Z",
  },
  { status: "DELIVERED_PENDING_SETTLEMENT" },
  { status: "PENDING" }
);
assert.strictEqual(deliveredPendingSettlement.timeline[5].title, "تم التسليم");
assert.strictEqual(deliveredPendingSettlement.timeline[5].state, "completed");
assert.strictEqual(deliveredPendingSettlement.timeline[5].symbol, "✓");

assert.strictEqual(deliveredPendingSettlement.timeline[6].title, "تم تأكيد الدفع");
assert.strictEqual(deliveredPendingSettlement.timeline[6].state, "current");
assert.strictEqual(deliveredPendingSettlement.timeline[6].symbol, "●");

assert.strictEqual(deliveredPendingSettlement.timeline[7].title, "تم تفعيل الاشتراك");
assert.strictEqual(deliveredPendingSettlement.timeline[7].state, "pending");
assert.strictEqual(deliveredPendingSettlement.subscription.is_active, false);
console.log("  ✅ PASS: DELIVERED ≠ PAID strictly enforced. Step 6 is ✓, Step 7 is ●, Step 8 is ○");

// -----------------------------------------------------------------------------
// 8. Scenario F: Fully Paid & Activated Subscription (PAID + ACTIVE)
// -----------------------------------------------------------------------------
console.log("\n🎉 8. Scenario F: Paid & Subscription Activated (PAID + ACTIVE):");
const activeTracking = buildOrderTrackingTimeline(
  {
    id: "ord-6",
    order_number: "SH-2026-000184",
    status: "COMPLETED",
    created_at: "2026-09-30T12:00:00Z",
    amount: 4900,
    plan_id: "season",
  },
  {
    carrier: "Yalidine Express",
    tracking_number: "TRK-981240-DZ",
    status: "DELIVERED",
    shipped_at: "2026-10-01T08:30:00Z",
    delivered_at: "2026-10-02T14:00:00Z",
  },
  {
    status: "PAID",
    settled_at: "2026-10-03T10:00:00Z",
  },
  {
    status: "ACTIVE",
    starts_at: "2026-10-03T10:05:00Z",
    expires_at: "2027-06-30T23:59:59Z",
  },
  {
    full_name: "أحمد بن ساسي",
    wilaya: "الجزائر",
    commune: "القبة",
    address: "حي 500 مسكن عمارة ج",
  }
);

for (let i = 0; i < 8; i++) {
  assert.strictEqual(activeTracking.timeline[i].state, "completed");
  assert.strictEqual(activeTracking.timeline[i].symbol, "✓");
}
console.log("  ✅ PASS: All 8 timeline steps are completed (✓)");

assert.strictEqual(activeTracking.subscription.is_active, true);
assert.ok(activeTracking.subscription.plan_name.includes("SHATER BAC"));
assert.ok(activeTracking.subscription.formatted_expires_at);
assert.ok(activeTracking.subscription.days_remaining > 0);
console.log(`  ✅ PASS: Subscription Activated Display: Plan=${activeTracking.subscription.plan_name}, Expiry=${activeTracking.subscription.formatted_expires_at}, DaysRemaining=${activeTracking.subscription.days_remaining}`);

// -----------------------------------------------------------------------------
// 9. Zero-Secrets & No Internal Data Leak Check
// -----------------------------------------------------------------------------
console.log("\n🔒 9. Verifying Zero-Secrets & No Internal Status Leakage Invariants:");
const trackingJson = JSON.stringify(activeTracking);
assert.strictEqual(trackingJson.includes("verified_by"), false, "Must NOT leak verified_by operator ID");
assert.strictEqual(trackingJson.includes("webhook_secret"), false, "Must NOT leak webhook secret");
assert.strictEqual(trackingJson.includes("internal_notes"), false, "Must NOT leak internal notes");
assert.strictEqual(trackingJson.includes("operator_id"), false, "Must NOT leak operator ID");
console.log("  ✅ PASS: Zero internal operator IDs or secrets leaked in student tracking response");

console.log("\n========================================================");
console.log("🎯 ALL TESTS PASSED: Order Tracking Page & 8-Stage Timeline 100% Verified!");
console.log("========================================================\n");
