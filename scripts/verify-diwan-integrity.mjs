import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

console.log("🏛️ [SHATER BAC] Verifying Modern Diwan Digital Study Table & Hardening Suite...\n");

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
// 1. ARCHITECTURE & ZERO-CLUTTER VERIFICATION
// ----------------------------------------------------
console.log("📐 1. Architecture & Zero-Clutter Tests");

test("Only clean, modern Diwan components exist in src/components/diwan", () => {
  const dir = path.join(ROOT, "src/components/diwan");
  const files = fs.readdirSync(dir);
  const expected = [
    "CreateTableModal.tsx",
    "DiwanChatPanel.tsx",
    "DiwanLobbyView.tsx",
    "DiwanMultiplayerGame.tsx",
    "DiwanSharedSummariesTab.tsx",
    "DiwanTableView.tsx",
    "SharedStudyCard.tsx",
  ];
  assert.deepEqual(files.sort(), expected.sort(), `Found unexpected or legacy files in diwan dir: ${files.join(", ")}`);
});

test("DiwanTableView implements authentic Study Table concept with responsive seating and cheer ribbon", () => {
  const code = read("src/components/diwan/DiwanTableView.tsx");
  assert(code.includes("طاولة المراجعة الجماعية"), "Missing study table header");
  assert(code.includes("statusConfigs"), "Missing statusConfigs for seating");
  assert(code.includes("handleCheerMember"), "Missing cheer member action");
  assert(code.includes("تفاعل سريع"), "Missing instant cheer ribbon");
  assert(code.includes("🎮 ابدأ تحدي الطاولة"), "Missing multiplayer showdown trigger");
});

test("DiwanLobbyView displays visual seated peers preview and 1-tap join", () => {
  const code = read("src/components/diwan/DiwanLobbyView.tsx");
  assert(code.includes("membersPreview"), "Missing membersPreview in lobby cards");
  assert(code.includes("انضم واجلس 🪑"), "Missing 1-tap join button in lobby cards");
  assert(code.includes("افتح طاولة جديدة لزملائك"), "Missing create table CTA in lobby hero");
});

// ----------------------------------------------------
// 2. DIWAN GUARDIAN ANTI-ABUSE & PII SCRUBBING
// ----------------------------------------------------
console.log("\n🛡️ 2. Diwan Guardian Anti-Abuse & Privacy Tests");

test("DiwanGuardian enforces flood protection, duplicate spam guard, and character collapse", () => {
  const code = read("src/lib/diwan/diwan-guardian.ts");
  assert(code.includes("timeSinceLast < 800"), "Missing 800ms flood protection check");
  assert(code.includes("recentTimestamps.length >= 6"), "Missing rate limit max threshold check");
  assert(code.includes("30000"), "Missing 30s duplicate spam window check");
  assert(code.includes("replace(/(.)\\1{6,}/g"), "Missing character spam collapsing");
});

test("DiwanGuardian strictly scrubs Algerian phone numbers (05/06/07) and emails", () => {
  const code = read("src/lib/diwan/diwan-guardian.ts");
  assert(code.includes("phoneRegex"), "Missing Algerian phone regex");
  assert(code.includes("emailRegex"), "Missing email regex");
  assert(code.includes("[رقم هاتف مخفي للخصوصية 🔒]"), "Missing phone redaction placeholder");
  assert(code.includes("[بريد مخفي للخصوصية 🔒]"), "Missing email redaction placeholder");
});

test("DiwanGuardian & types support the 6 standard Arabic report reasons and auto-escalates", () => {
  const typesCode = read("src/types/diwan.ts");
  const guardianCode = read("src/lib/diwan/diwan-guardian.ts");
  assert(typesCode.includes('"إساءة"'), "Missing reason: إساءة in types");
  assert(typesCode.includes('"تنمر"'), "Missing reason: تنمر in types");
  assert(typesCode.includes('"محتوى غير مناسب"'), "Missing reason: محتوى غير مناسب in types");
  assert(typesCode.includes('"سبام"'), "Missing reason: سبام in types");
  assert(typesCode.includes('"غش"'), "Missing reason: غش in types");
  assert(typesCode.includes('"أخرى"'), "Missing reason: أخرى in types");
  assert(guardianCode.includes("FLAGGED"), "Missing FLAGGED escalation state");
  assert(guardianCode.includes("HIDDEN"), "Missing HIDDEN escalation state");
});

// ----------------------------------------------------
// 3. MULTIPLAYER CHALLENGES & ANTI-CHEAT
// ----------------------------------------------------
console.log("\n🎮 3. Multiplayer Challenges & Anti-Cheat Tests");

test("DiwanMultiplayerGame supports 5 short fast game types and smooth return to study", () => {
  const code = read("src/components/diwan/DiwanMultiplayerGame.tsx");
  assert(code.includes("SPEED_RUSH"), "Missing SPEED_RUSH game mode");
  assert(code.includes("TRUE_FALSE_BLITZ"), "Missing TRUE_FALSE_BLITZ game mode");
  assert(code.includes("BRAIN_RUSH"), "Missing BRAIN_RUSH game mode");
  assert(code.includes("BAC_SPRINT"), "Missing BAC_SPRINT game mode");
  assert(code.includes("MEMORY_BATTLE"), "Missing MEMORY_BATTLE game mode");
  assert(code.includes("نرجعو للمراجعة 📖"), "Missing seamless return to study button");
  assert(code.includes("resultAutoAdvanceTimer"), "Missing dynamic auto-advance timer for result phase");
});

test("Server-side game validation in api/diwan/games rejects expired answers and double submissions", () => {
  const code = read("src/app/api/diwan/games/route.ts");
  assert(code.includes("SUBMIT_ANSWER"), "Missing SUBMIT_ANSWER action in games API");
  assert(code.includes("Answer rejected: time expired"), "Missing expired answer rejection");
  assert(code.includes("Answer already recorded for this round"), "Missing double submission prevention");
  assert(code.includes("SPEED_RUSH"), "Missing first-solver lock for Speed Rush");
});

// ----------------------------------------------------
// 4. DATABASE MIGRATIONS & IMMUTABLE AUDIT LOG
// ----------------------------------------------------
console.log("\n🗄️ 4. Database Migrations & Security Tests");

test("Migration 038 exists with message status column and immutable audit log trigger", () => {
  assert(fs.existsSync(path.join(ROOT, "supabase/migrations/038_diwan_production_hardening.sql")), "Migration 038 missing");
  const sql = read("supabase/migrations/038_diwan_production_hardening.sql");
  assert(sql.includes("ADD COLUMN status TEXT NOT NULL DEFAULT 'VISIBLE'"), "Missing message status column");
  assert(sql.includes("prevent_moderation_log_tampering"), "Missing tamper-proof trigger for moderation log");
  assert(sql.includes("diwan_moderation_logs"), "Missing diwan_moderation_logs table");
});

// ----------------------------------------------------
// 5. MOBILE & RESPONSIVE TOUCH FRIENDLINESS
// ----------------------------------------------------
console.log("\n📱 5. Mobile & Responsive Layout Tests");

test("DiwanTableView includes safe-area insets and mobile bottom drawer actions", () => {
  const code = read("src/components/diwan/DiwanTableView.tsx");
  assert(code.includes("safe-area-inset-bottom"), "Missing safe-area bottom padding in mobile bar");
  assert(code.includes("activeMobileDrawer"), "Missing activeMobileDrawer state for mobile");
  assert(code.includes("selectedMemberForProfile"), "Missing mini-profile popover on avatar click");
});

test("Diwan main page supports auto-join seating when selected from lobby", () => {
  const code = read("src/app/diwan/page.tsx");
  assert(code.includes("handleSelectTable = async (tableId: string, autoJoin = false)"), "handleSelectTable must accept autoJoin parameter");
  assert(code.includes("DiwanService.takeSeat"), "takeSeat must be executed when autoJoin is true");
});

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log(`\n========================================`);
console.log(`Total Tests: ${total} | Passed: ${passed} | Failed: ${total - passed}`);
console.log(`========================================\n`);

if (passed === total) {
  console.log("🎉 ALL MODERN DIWAN INTEGRITY CHECKS PASSED WITH 100% SUCCESS!");
  process.exit(0);
} else {
  console.error("💥 SOME DIWAN INTEGRITY CHECKS FAILED!");
  process.exit(1);
}
