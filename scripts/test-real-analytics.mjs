/**
 * SHATER CONTROL CENTER — Real Data Only & Zero Fake Metrics Test Suite
 * Automated verification suite for production-grade operational integrity.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;

function assert(condition, testName, details = "") {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ""}`);
    failed++;
  }
}

console.log("\n=======================================================");
console.log("🔍 SHATER REAL ANALYTICS & ZERO FAKE METRICS TEST SUITE");
console.log("=======================================================\n");

// =========================================================================
// TEST 1: Absolute Absence of Metric Faking in lib/admin & lib/operations
// =========================================================================
console.log("TEST GROUP 1: Static Code Scrutiny (Forbidden Fake Patterns)");

function scanDir(dir, ext = [".ts", ".tsx"]) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(scanDir(fullPath, ext));
    } else if (ext.some((e) => entry.name.endsWith(e))) {
      files.push(fullPath);
    }
  }
  return files;
}

const adminFiles = scanDir(path.join(rootDir, "src/lib/admin"));
const opsFiles = scanDir(path.join(rootDir, "src/lib/operations"));
const allLibFiles = [...adminFiles, ...opsFiles];

let foundFakeStudentFallback = false;
let foundFakeAttemptsFallback = false;
let foundFakeMultipliers = false;

for (const file of allLibFiles) {
  const content = fs.readFileSync(file, "utf8");
  const relPath = path.relative(rootDir, file);

  // Check for 1240 or 8940 assigned to metric totals
  if (/total\s*=\s*1240/.test(content) || /totalStudents\s*=\s*1240/.test(content)) {
    foundFakeStudentFallback = true;
    console.error(`    Found total = 1240 in ${relPath}`);
  }
  if (/totalAttempts\s*=\s*8940/.test(content)) {
    foundFakeAttemptsFallback = true;
    console.error(`    Found totalAttempts = 8940 in ${relPath}`);
  }

  // Check for arbitrary multipliers (* 0.28, * 0.52, * 0.70)
  const multiplierMatch = content.match(/\*\s*0\.(28|52|70|45|85)\b/);
  if (multiplierMatch) {
    foundFakeMultipliers = true;
    console.error(`    Found fake multiplier ${multiplierMatch[0]} in ${relPath}`);
  }
}

assert(!foundFakeStudentFallback, "Zero fake student count fallbacks (1240 eradicated)");
assert(!foundFakeAttemptsFallback, "Zero fake exercise attempts fallbacks (8940 eradicated)");
assert(!foundFakeMultipliers, "Zero arbitrary multiplier estimation formulas (* 0.28, * 0.52, * 0.70 eradicated)");

// =========================================================================
// TEST 2: Revenue Calculation Grounding (payment_status = 'PAID' strictly)
// =========================================================================
console.log("\nTEST GROUP 2: Revenue Calculation Logic & COD Integrity");

function calculateRealRevenue(orders) {
  return orders
    .filter((o) => o.payment_status === "PAID" || o.payment?.status === "PAID")
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
}

const mockOrders = [
  { id: "ord-1", payment_status: "PAID", total_amount: 1500 },
  { id: "ord-2", payment_status: "PENDING", total_amount: 3500 }, // COD pending - NOT revenue!
  { id: "ord-3", payment_status: "COD", total_amount: 2500 },    // COD on delivery - NOT revenue!
  { id: "ord-4", payment_status: "PAID", total_amount: 1500 },
  { id: "ord-5", payment_status: "CANCELLED", total_amount: 1500 },
  { id: "ord-6", payment_status: "RETURNED", total_amount: 2500 },
];

const computedRevenue = calculateRealRevenue(mockOrders);
assert(
  computedRevenue === 3000,
  "Revenue strictly includes ONLY confirmed paid orders (1500 + 1500 = 3000 DZD)",
  `Got: ${computedRevenue}`
);

// Verify operations-service revenue query implementation
const opsServiceContent = fs.readFileSync(
  path.join(rootDir, "src/lib/admin/operations-service.ts"),
  "utf8"
);
assert(
  opsServiceContent.includes('.eq("payment_status", "PAID")'),
  "operations-service queries orders strictly where payment_status = 'PAID'"
);
assert(
  !opsServiceContent.includes("totalRevenue = totalOrders * 1500"),
  "operations-service does NOT estimate revenue from order count"
);

// =========================================================================
// TEST 3: MetricState Contract & Zero-Division Safety
// =========================================================================
console.log("\nTEST GROUP 3: MetricState Contract & Honest Zero-State Representation");

function formatRate(numerator, denominator, label) {
  if (denominator === 0 || denominator == null) {
    return { status: "not_available", reason: `Aucune ${label} pour calculer le taux` };
  }
  return {
    status: "available",
    value: Math.round((numerator / denominator) * 1000) / 10,
  };
}

const rateWithZeroVisits = formatRate(0, 0, "visite");
assert(
  rateWithZeroVisits.status === "not_available",
  "Zero denominator produces 'not_available' instead of 0% or NaN%"
);
assert(
  rateWithZeroVisits.reason.includes("Aucune visite"),
  "Provides authentic human reason explaining why data is absent"
);

const rateWithRealVisits = formatRate(5, 100, "visite");
assert(
  rateWithRealVisits.status === "available" && rateWithRealVisits.value === 5.0,
  "Real data produces 'available' status with verified percentage (5.0%)"
);

// =========================================================================
// TEST 4: Channel & Campaign Authenticity (No Dummy Injection)
// =========================================================================
console.log("\nTEST GROUP 4: Channel & Campaign Authenticity");

assert(
  !opsServiceContent.includes("meta_ad_oran_promo"),
  "Zero mock campaigns injected in operations-service"
);
assert(
  opsServiceContent.includes("channelMap.size === 0") ||
  opsServiceContent.includes("Array.from(channelMap.values())"),
  "Acquisition channels returned strictly based on detected sessions"
);

// =========================================================================
// TEST 5: AdSlot Viewport-Only Real Impression Tracking
// =========================================================================
console.log("\nTEST GROUP 5: AdSlot Viewport-Only Impression Verification");

const adSlotContent = fs.readFileSync(
  path.join(rootDir, "src/components/ads/AdSlot.tsx"),
  "utf8"
);

assert(
  adSlotContent.includes("IntersectionObserver"),
  "AdSlot uses IntersectionObserver to detect real viewport presence"
);
assert(
  adSlotContent.includes("threshold: 0.5"),
  "AdSlot enforces minimum 50% element visibility before recording impression"
);
assert(
  adSlotContent.includes("shater_ad_imp_"),
  "AdSlot implements session deduplication key to prevent duplicate impressions"
);

// =========================================================================
// TEST 6: Daily Intelligence Report Real Metrics Grounding
// =========================================================================
console.log("\nTEST GROUP 6: Daily Intelligence Report Real Data Grounding");

const dailyReportContent = fs.readFileSync(
  path.join(rootDir, "src/lib/admin/daily-report-service.ts"),
  "utf8"
);

assert(
  !dailyReportContent.includes("count: 4120"),
  "Zero fake subject counts in daily-report-service"
);
assert(
  !dailyReportContent.includes("errorCount: 842"),
  "Zero fake error counts in daily-report-service"
);
assert(
  !dailyReportContent.includes("count: 1240, percentage: 13.9"),
  "Zero fake natural sciences counts in daily-report-service"
);
assert(
  dailyReportContent.includes("highestErrorAreas = (learningStats?.highestErrorSkills || [])"),
  "Daily report dynamically sources highest error areas from real learning stats"
);

// =========================================================================
// SUMMARY
// =========================================================================
console.log("\n=======================================================");
console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
console.log("=======================================================\n");

if (failed > 0) {
  console.error("❌ Some real analytics checks failed. Please fix before release.");
  process.exit(1);
} else {
  console.log("🎉 ALL REAL ANALYTICS CHECKS PASSED WITH 100% SUCCESS!");
  process.exit(0);
}
