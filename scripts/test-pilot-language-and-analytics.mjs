/**
 * BAC Mastery — Pilot Language & Analytics Verification Suite
 * Prompt 17 § 4, § 14, § 15, § 16, § 17
 * 
 * Tests:
 * 1. Educational content language resolution:
 *    - Math, Physics, SNV must resolve to "ar" and direction "rtl"
 *    - French must resolve to "fr" and direction "ltr"
 *    - English must resolve to "en" and direction "ltr"
 * 2. Sciences Exp Subjects Content Language Configuration
 * 3. Essential Pilot Analytics Service:
 *    - Session ID generation
 *    - Event logging & localStorage buffering
 *    - PII & token sanitization
 * 4. Pilot Feedback & Monitoring Services:
 *    - Submission & buffering
 *    - Associated analytics tracking
 *    - Error capturing & credential scrubbing
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Mock browser localStorage
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (key) => (mockStorage.has(key) ? mockStorage.get(key) : null),
  setItem: (key, val) => mockStorage.set(key, String(val)),
  removeItem: (key) => mockStorage.delete(key),
  clear: () => mockStorage.clear(),
};
globalThis.window = globalThis;

// Helper: Transpile and load TypeScript module in pure Node.js
const moduleCache = new Map();
function loadTs(relPath) {
  const fullPath = path.resolve(relPath);
  if (moduleCache.has(fullPath)) {
    return moduleCache.get(fullPath);
  }

  const code = fs.readFileSync(fullPath, "utf8");
  const result = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const m = { exports: {} };
  moduleCache.set(fullPath, m.exports);

  const fn = new Function("exports", "require", "module", result.outputText);
  fn(
    m.exports,
    (reqPath) => {
      let target = reqPath;
      if (target.startsWith("@/")) {
        target = path.resolve(target.replace("@/", "src/"));
      } else if (target.startsWith(".")) {
        target = path.resolve(path.dirname(fullPath), target);
      }
      if (fs.existsSync(target + ".ts")) return loadTs(target + ".ts");
      if (fs.existsSync(target + "/index.ts")) return loadTs(target + "/index.ts");
      if (fs.existsSync(target) && fs.statSync(target).isFile()) return loadTs(target);
      return {};
    },
    m
  );

  return m.exports;
}

async function run() {
  console.log("==================================================================");
  console.log("🧪 BAC MASTERY — PILOT LANGUAGE & ANALYTICS VERIFICATION");
  console.log("==================================================================");

  let passedAssertions = 0;

  // --------------------------------------------------------------------------
  // 1. Language Resolution Architecture
  // --------------------------------------------------------------------------
  console.log("\n[1/4] Verifying Educational Content Language Separation...");
  const languageModule = loadTs("src/domain/content/language.ts");
  const {
    resolveEducationalContentLanguage,
    resolveContentDirection,
    isLanguageSubject,
  } = languageModule;

  // Scientific subjects MUST stay in Arabic
  assert.equal(resolveEducationalContentLanguage("math"), "ar");
  assert.equal(resolveContentDirection("ar"), "rtl");
  passedAssertions += 2;

  assert.equal(resolveEducationalContentLanguage("physics"), "ar");
  assert.equal(resolveEducationalContentLanguage("science_snv"), "ar");
  assert.equal(resolveEducationalContentLanguage("islamic_studies"), "ar");
  assert.equal(resolveEducationalContentLanguage("arabic_literature"), "ar");
  assert.equal(resolveEducationalContentLanguage("history_geography"), "ar");
  assert.equal(resolveEducationalContentLanguage("philosophy"), "ar");
  passedAssertions += 6;

  // Language subjects
  assert.equal(resolveEducationalContentLanguage("french"), "fr");
  assert.equal(resolveContentDirection("fr"), "ltr");
  assert.equal(resolveEducationalContentLanguage("english"), "en");
  assert.equal(resolveContentDirection("en"), "ltr");
  assert.equal(resolveEducationalContentLanguage("spanish"), "es");
  assert.equal(resolveContentDirection("es"), "ltr");
  passedAssertions += 6;

  // Language subject detector
  assert.equal(isLanguageSubject("french"), true);
  assert.equal(isLanguageSubject("english"), true);
  assert.equal(isLanguageSubject("spanish"), true);
  assert.equal(isLanguageSubject("math"), false);
  assert.equal(isLanguageSubject("physics"), false);
  assert.equal(isLanguageSubject("science_snv"), false);
  passedAssertions += 6;

  console.log(`  ✓ 20/20 language resolution assertions passed.`);

  // --------------------------------------------------------------------------
  // 2. Sciences Exp Subjects Content Language Definition
  // --------------------------------------------------------------------------
  console.log("\n[2/4] Verifying Sciences Exp Subjects Configuration...");
  const mappingsModule = loadTs("src/domain/content/mappings.ts");
  const { SCIENCES_EXP_SUBJECTS } = mappingsModule;
  
  assert.ok(SCIENCES_EXP_SUBJECTS.length >= 3);
  for (const s of SCIENCES_EXP_SUBJECTS) {
    if (["math", "physics", "science_snv"].includes(s.id)) {
      assert.equal(s.contentLanguage, "ar", `Subject ${s.id} must declare contentLanguage: "ar"`);
      passedAssertions++;
    }
  }
  console.log(`  ✓ Sciences Exp subjects correctly specify Arabic content language.`);

  // --------------------------------------------------------------------------
  // 3. Essential Pilot Analytics Service
  // --------------------------------------------------------------------------
  console.log("\n[3/4] Verifying Essential Pilot Analytics Telemetry...");
  const analyticsModule = loadTs("src/lib/analytics/index.ts");
  const {
    trackEvent,
    getStoredPilotEvents,
    clearStoredPilotEvents,
    getOrCreateSessionId,
  } = analyticsModule;

  clearStoredPilotEvents();
  assert.equal(getStoredPilotEvents().length, 0);
  passedAssertions++;

  const sessionId = getOrCreateSessionId();
  assert.ok(sessionId.startsWith("pilot_ses_"), "Session ID must start with pilot_ses_");
  passedAssertions++;

  // Log landing view
  trackEvent("landing_view", { hasProfile: false });
  let events = getStoredPilotEvents();
  assert.equal(events.length, 1);
  assert.equal(events[0].name, "landing_view");
  assert.equal(events[0].properties.hasProfile, false);
  assert.equal(events[0].properties.sessionId, sessionId);
  passedAssertions += 4;

  // Log practice completed with confidential scrub check
  trackEvent("practice_completed", {
    missionId: "msn-test-01",
    skillId: "math_exponential_limits",
    isCorrect: true,
    confidence: 4,
    token: "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.sensitive",
    password: "secret_student_pass",
  });
  events = getStoredPilotEvents();
  assert.equal(events.length, 2);
  assert.equal(events[1].properties.missionId, "msn-test-01");
  // Ensure token and password were NOT leaked into event properties
  assert.equal(events[1].properties.token, undefined);
  assert.equal(events[1].properties.password, undefined);
  passedAssertions += 4;

  console.log(`  ✓ Pilot analytics correctly buffered with PII/secret sanitization.`);

  // --------------------------------------------------------------------------
  // 4. Pilot Feedback & Monitoring Services
  // --------------------------------------------------------------------------
  console.log("\n[4/4] Verifying Feedback and Monitoring Services...");
  const feedbackModule = loadTs("src/lib/feedback/index.ts");
  const {
    submitPilotFeedback,
    getStoredPilotFeedback,
    clearStoredPilotFeedback,
  } = feedbackModule;

  clearStoredPilotFeedback();
  assert.equal(getStoredPilotFeedback().length, 0);
  passedAssertions++;

  const fb = submitPilotFeedback({
    missionId: "msn-math-limits-01",
    skillId: "math_exponential_limits",
    rating: "easy",
    feedbackNote: "الشرح مبسط ومفهوم بزاف يعطيك الصحة",
  });
  assert.ok(fb.id.startsWith("fb_"));
  const storedFb = getStoredPilotFeedback();
  assert.equal(storedFb.length, 1);
  assert.equal(storedFb[0].rating, "easy");
  assert.equal(storedFb[0].feedbackNote, "الشرح مبسط ومفهوم بزاف يعطيك الصحة");
  passedAssertions += 4;

  // Verify feedback also emitted an analytics event
  const eventsAfterFb = getStoredPilotEvents();
  const fbEvent = eventsAfterFb.find((e) => e.name === "pilot_feedback_submitted");
  assert.ok(fbEvent, "Feedback must emit pilot_feedback_submitted analytics event");
  assert.equal(fbEvent.properties.rating, "easy");
  assert.equal(fbEvent.properties.hasNote, true);
  passedAssertions += 3;

  // Test Monitoring Error Scrubbing
  const monitoringModule = loadTs("src/lib/monitoring/index.ts");
  const { captureClientError, getCapturedClientErrors, clearCapturedClientErrors } = monitoringModule;
  clearCapturedClientErrors();
  assert.equal(getCapturedClientErrors().length, 0);
  passedAssertions++;

  captureClientError("Failed to fetch user state with token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 and password secret123", {
    route: "/mission/msn-1",
  });
  const logs = getCapturedClientErrors();
  assert.equal(logs.length, 1);
  assert.ok(!logs[0].message.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"), "JWT must be scrubbed");
  assert.ok(!logs[0].message.includes("secret123"), "Password must be scrubbed");
  assert.ok(logs[0].message.includes("[JWT_REDACTED]"), "JWT scrub indicator must be present");
  passedAssertions += 4;

  console.log(`  ✓ Feedback and Monitoring verified with zero secrets leaked.`);

  console.log("\n==================================================================");
  console.log(`🎉 ALL ${passedAssertions} ASSERTIONS PASSED!`);
  console.log("==================================================================");
}

run().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
