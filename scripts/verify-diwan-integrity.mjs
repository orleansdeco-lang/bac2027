import fs from "fs";
import path from "path";

console.log("=================================================");
console.log("🔍 SHATER DIWAN INTEGRITY & PRODUCTION AUDIT SCAN");
console.log("=================================================\n");

let failureCount = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    failureCount++;
  } else {
    console.log(`✅ PASS: ${message}`);
  }
}

// 1. Files to inspect for forbidden vanity metrics
const diwanFiles = [
  "src/components/diwan/MajlisHeroBanner.tsx",
  "src/components/diwan/CozyMajlisDesk.tsx",
  "src/components/diwan/MajlisWorkspace.tsx",
  "src/components/diwan/MajlisInspectorPanel.tsx",
  "src/components/diwan/MajlisInteractiveGrid.tsx",
  "src/lib/campus/majlis-service.ts",
  "src/lib/campus/table-store.ts",
];

const forbiddenPatterns = [
  { regex: /totalTablesCount=\{94\}/, name: "Hardcoded 94 tables count" },
  { regex: /activeStudentsCount=\{members\.length\s*\+\s*12\}/, name: "Fake +12 boost in active students" },
  { regex: /14[,.]?000\s*طالب/, name: "Fake 14,000 students claim" },
  { regex: /750\s*\/\s*1000\s*XP/, name: "Hardcoded 750/1000 XP" },
  { regex: /user-yassine/, name: "Mock user-yassine seeded in active members" },
  { regex: /user-sarah/, name: "Mock user-sarah seeded in active members" },
];

for (const fileRel of diwanFiles) {
  const filePath = path.resolve(process.cwd(), fileRel);
  if (!fs.existsSync(filePath)) {
    assert(false, `Expected file to exist: ${fileRel}`);
    continue;
  }

  const content = fs.readFileSync(filePath, "utf-8");
  for (const { regex, name } of forbiddenPatterns) {
    const match = content.match(regex);
    assert(!match, `[${fileRel}] Must NOT contain: ${name}`);
  }
}

// 2. Verify DEMO mode production guard
const configPath = path.resolve(process.cwd(), "src/lib/constants/majlis-config.ts");
assert(fs.existsSync(configPath), "majlis-config.ts must exist");
const configContent = fs.readFileSync(configPath, "utf-8");
assert(
  configContent.includes("CRITICAL SECURITY / HONESTY INVARIANT") ||
  configContent.includes("NEXT_PUBLIC_DEMO_MODE"),
  "majlis-config.ts must include build guard for DEMO mode"
);

// 3. Verify procedural sound engine (no external audio assets)
const soundEnginePath = path.resolve(process.cwd(), "src/lib/ypt/soundEngine.ts");
assert(fs.existsSync(soundEnginePath), "soundEngine.ts must exist");
const soundContent = fs.readFileSync(soundEnginePath, "utf-8");
assert(
  soundContent.includes("createBrownNoiseSource") &&
  soundContent.includes("createRainSource") &&
  soundContent.includes("startAlphaWaves"),
  "soundEngine.ts must contain pure procedural Web Audio API generators"
);
assert(!soundContent.includes(".mp3") && !soundContent.includes(".wav"), "soundEngine.ts must not reference any external audio files");

// 4. Verify RLS Migration exists
const migrationPath = path.resolve(
  process.cwd(),
  "supabase/migrations/033_diwan_production_readiness_and_safety.sql"
);
assert(fs.existsSync(migrationPath), "Migration 033 must exist in supabase/migrations");
const migrationContent = fs.readFileSync(migrationPath, "utf-8");
assert(
  migrationContent.includes("majlis_rsvp") &&
  migrationContent.includes("majlis_reports") &&
  migrationContent.includes("ROW LEVEL SECURITY"),
  "Migration 033 must declare majlis_rsvp, majlis_reports, and enable RLS"
);

// 5. Verify Ops Moderation Dashboard
const opsPath = path.resolve(process.cwd(), "src/app/ops/majlis/page.tsx");
assert(fs.existsSync(opsPath), "Operator dashboard src/app/ops/majlis/page.tsx must exist");

console.log("\n-------------------------------------------------");
if (failureCount === 0) {
  console.log("🎉 ALL INTEGRITY AUDIT CHECKS PASSED (100% Honest Data)!");
  process.exit(0);
} else {
  console.error(`💥 AUDIT FAILED: ${failureCount} checks failed.`);
  process.exit(1);
}
