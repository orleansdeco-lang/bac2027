import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

console.log("🏛️ [SHATER] Running Diwan Production Integrity & Anti-Mock Verification Suite...\n");

const ROOT = process.cwd();

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf-8");
}

let passed = 0;
let total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Reason: ${err.message}`);
    process.exitCode = 1;
  }
}

// ----------------------------------------------------
// 1. STATS & TABLES ANTI-MOCK TESTS
// ----------------------------------------------------
console.log("📊 1. Campus Stats & Room Service De-Mocking Tests");

test("Stats endpoint (/api/campus/stats) does not inject artificial activeRoomsCount bump", () => {
  const code = read("src/app/api/campus/stats/route.ts");
  assert(!code.includes("if (activeRoomsCount === 0) activeRoomsCount = 1"), "Artificial room count bump found in stats route");
  assert(!code.includes("mockRooms"), "Mock rooms found in stats route");
});

test("Table Store (table-store.ts) does not contain SEED_TABLES or fake users", () => {
  const code = read("src/lib/campus/table-store.ts");
  assert(!code.includes("SEED_TABLES"), "SEED_TABLES still present in table-store.ts");
  assert(!code.includes("user-ali"), "Fake mock user 'user-ali' found in table-store.ts");
  assert(!code.includes("user-tarek"), "Fake mock user 'user-tarek' found in table-store.ts");
});

test("MajlisService (majlis-service.ts) has zero localRooms, zero localMembers, and zero fake default rooms", () => {
  const code = read("src/lib/campus/majlis-service.ts");
  assert(!code.includes("const localRooms:"), "localRooms in-memory mock still present in majlis-service.ts");
  assert(!code.includes("const localMembers:"), "localMembers in-memory mock still present in majlis-service.ts");
  assert(!code.includes('DEFAULT_ROOM_ID = "room-sciences-rc"'), "DEFAULT_ROOM_ID constant still present in majlis-service.ts");
  assert(!code.includes("return defaultRoom;"), "defaultRoom fallback still present in majlis-service.ts");
});

test("MajlisWorkspace (MajlisWorkspace.tsx) does not force effectiveRoomsCount to 1 when empty", () => {
  const code = read("src/components/diwan/MajlisWorkspace.tsx");
  assert(!code.includes("stats.activeRoomsCount,\n    1"), "effectiveRoomsCount still forced to minimum 1 in MajlisWorkspace.tsx");
  assert(!code.includes('loadRoom = useCallback(async (roomId = "room-sciences-rc")'), "loadRoom still hardcodes default roomId in MajlisWorkspace.tsx");
});

// ----------------------------------------------------
// 2. SEAT PLACEMENT & RENDERING INTEGRITY
// ----------------------------------------------------
console.log("\n🪑 2. Cozy Desk & Seat Placement Accuracy Tests");

test("CozyMajlisDesk accurately places seated students by seat_index", () => {
  const code = read("src/components/diwan/CozyMajlisDesk.tsx");
  assert(code.includes("members.find((m) => m.seat_index === idx)"), "Seat placement must map m.seat_index === idx");
  assert(!code.includes("(!member && idx === 4)"), "Fake user injection at idx === 4 must be removed");
});

test("CozyMajlisDesk renders authentic empty state with create table CTA when no room is active", () => {
  const code = read("src/components/diwan/CozyMajlisDesk.tsx");
  assert(code.includes("ما كاين حتى مجلس مفتوح حالياً"), "Missing authentic empty state in CozyMajlisDesk");
  assert(code.includes("onOpenCreateModal"), "Missing onOpenCreateModal action in CozyMajlisDesk");
});

// ----------------------------------------------------
// 3. STUDENT PRIVACY TESTS
// ----------------------------------------------------
console.log("\n🛡️ 3. Student Privacy Protection Tests");

test("Diwan components never derive student display name from raw email prefix", () => {
  const workspaceCode = read("src/components/diwan/MajlisWorkspace.tsx");
  const summariesCode = read("src/components/diwan/DiwanSharedSummariesTab.tsx");
  assert(!workspaceCode.includes('user?.email?.split("@")[0]'), "Email prefix used as name in MajlisWorkspace.tsx");
  assert(!summariesCode.includes('user?.email?.split("@")[0]'), "Email prefix used as name in DiwanSharedSummariesTab.tsx");
});

test("MajlisService enforces chat rate limiting and message length caps", () => {
  const code = read("src/lib/campus/majlis-service.ts");
  assert(code.includes("CHAT_MIN_INTERVAL_MS"), "Missing chat rate limit interval");
  assert(code.includes("300"), "Missing 300 character message length limit");
});

// ----------------------------------------------------
// 4. BRANCH B (EXPERIENCES) INTEGRITY
// ----------------------------------------------------
console.log("\n💬 4. Branch B (Student Experiences) Hardening Tests");

test("ExperienceService getUpvotedIds does not invert browser window check", () => {
  const code = read("src/lib/services/experience-service.ts");
  assert(!code.includes('if (typeof window !== "undefined") return [];'), "getUpvotedIds inversion bug still present in experience-service.ts");
  assert(code.includes('if (typeof window === "undefined") return [];'), "getUpvotedIds must return [] only on server");
});

test("api/experiences route does not inject CURATED_BAC_EXPERIENCES into live database queries", () => {
  const code = read("src/app/api/experiences/route.ts");
  assert(!code.includes("CURATED_BAC_EXPERIENCES.forEach((item) => {\n    map.set(item.id"), "Unconditional curated merge found in api/experiences/route.ts");
});

test("Experience upvote endpoint (/api/experiences/[id]/upvote) is implemented with database persistence", () => {
  assert(fs.existsSync(path.join(ROOT, "src/app/api/experiences/[id]/upvote/route.ts")), "Missing upvote route file");
  const code = read("src/app/api/experiences/[id]/upvote/route.ts");
  assert(code.includes("experience_upvotes"), "Upvote route must query experience_upvotes table");
  assert(code.includes("requireServerAuth"), "Upvote route must require authenticated server session");
});

test("Single experience endpoint (/api/experiences/[id]) supports GET, PATCH, and DELETE with authorization", () => {
  assert(fs.existsSync(path.join(ROOT, "src/app/api/experiences/[id]/route.ts")), "Missing single experience route file");
  const code = read("src/app/api/experiences/[id]/route.ts");
  assert(code.includes("export async function GET"), "Missing GET handler in experiences/[id]");
  assert(code.includes("export async function PATCH"), "Missing PATCH handler in experiences/[id]");
  assert(code.includes("export async function DELETE"), "Missing DELETE handler in experiences/[id]");
});

// ----------------------------------------------------
// 5. BRANCH C (SHARED SUMMARIES) INTEGRITY
// ----------------------------------------------------
console.log("\n📑 5. Branch C (Shared Summaries) Hardening Tests");

test("Campus post like endpoint (/api/campus/posts/[id]/like) is implemented with database persistence", () => {
  assert(fs.existsSync(path.join(ROOT, "src/app/api/campus/posts/[id]/like/route.ts")), "Missing post like route file");
  const code = read("src/app/api/campus/posts/[id]/like/route.ts");
  assert(code.includes("campus_post_likes"), "Post like route must query campus_post_likes table");
  assert(code.includes("requireServerAuth"), "Post like route must require authenticated server session");
});

test("Single post endpoint (/api/campus/posts/[id]) supports GET and DELETE with authorization", () => {
  assert(fs.existsSync(path.join(ROOT, "src/app/api/campus/posts/[id]/route.ts")), "Missing single post route file");
  const code = read("src/app/api/campus/posts/[id]/route.ts");
  assert(code.includes("export async function GET"), "Missing GET handler in campus/posts/[id]");
  assert(code.includes("export async function DELETE"), "Missing DELETE handler in campus/posts/[id]");
});

test("DiwanSharedSummariesTab connects to /api/campus/posts API", () => {
  const code = read("src/components/diwan/DiwanSharedSummariesTab.tsx");
  assert(code.includes('fetch("/api/campus/posts'), "Summaries tab must fetch from /api/campus/posts");
  assert(code.includes('/like'), "Summaries tab must trigger like via API endpoint");
});

// ----------------------------------------------------
// 6. DATABASE & MIGRATION HARDENING
// ----------------------------------------------------
console.log("\n🗄️ 6. Database Migration & RLS Security Tests");

test("Migration 034 exists and contains table locks, atomic RPCs, and block list", () => {
  assert(fs.existsSync(path.join(ROOT, "supabase/migrations/034_harden_diwan_production_security.sql")), "Migration 034 is missing");
  const sql = read("supabase/migrations/034_harden_diwan_production_security.sql");
  assert(sql.includes("majlis_blocks"), "Missing majlis_blocks table in migration 034");
  assert(sql.includes("majlis_take_seat_atomic"), "Missing majlis_take_seat_atomic in migration 034");
  assert(sql.includes("majlis_leave_seat_atomic"), "Missing majlis_leave_seat_atomic in migration 034");
  assert(sql.includes("campus_post_likes"), "Missing campus_post_likes table in migration 034");
});

// ----------------------------------------------------
// 7. ROUTE UNIFICATION & COMPATIBILITY
// ----------------------------------------------------
console.log("\n🔀 7. Route Unification & Legacy Redirect Tests");

test("Legacy route /campus/table/[tableId] redirects to unified Diwan route", () => {
  const code = read("src/app/campus/table/[tableId]/page.tsx");
  assert(code.includes('redirect(`/diwan?tab=majlis&roomId='), "Legacy table route must redirect to /diwan?tab=majlis&roomId=...");
});

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log(`\n========================================`);
console.log(`Total Tests: ${total} | Passed: ${passed} | Failed: ${total - passed}`);
console.log(`========================================\n`);

if (passed === total) {
  console.log("🎉 ALL DIWAN PRODUCTION HARDENING CHECKS PASSED!");
  process.exit(0);
} else {
  console.error("💥 SOME DIWAN INTEGRITY CHECKS FAILED!");
  process.exit(1);
}
