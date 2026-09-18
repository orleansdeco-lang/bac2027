/**
 * Automated Verification: Real Account Statistics & Full PWA Installation with Push Notifications
 */

import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

console.log("================================================================================");
console.log("🧪 VERIFICATION: Real Account Statistics & Full PWA Installation");
console.log("================================================================================");

let testsPassed = 0;
let testsFailed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(`     Error: ${err.message}`);
    testsFailed++;
  }
}

async function run() {
  console.log("\n📦 1. PWA Web App Manifest (public/manifest.json):");

  const manifestPath = path.resolve("public/manifest.json");
  it("manifest.json exists and is valid JSON", () => {
    assert.ok(fs.existsSync(manifestPath), "manifest.json must exist in public/");
    const content = fs.readFileSync(manifestPath, "utf8");
    const parsed = JSON.parse(content);
    assert.equal(parsed.name, "BAC Mastery — طريقك نحو امتياز البكالوريا");
    assert.equal(parsed.short_name, "BAC Mastery");
    assert.equal(parsed.start_url, "/dashboard");
    assert.equal(parsed.display, "standalone");
    assert.equal(parsed.background_color, "#0B0F19");
    assert.equal(parsed.theme_color, "#0B0F19");
    assert.ok(Array.isArray(parsed.icons) && parsed.icons.length >= 2, "Icons configured");
  });

  console.log("\n📦 2. Service Worker & Offline Caching (public/sw.js):");

  const swPath = path.resolve("public/sw.js");
  it("sw.js exists with cache and push notification handlers", () => {
    assert.ok(fs.existsSync(swPath), "sw.js must exist in public/");
    const swContent = fs.readFileSync(swPath, "utf8");
    assert.ok(swContent.includes('addEventListener("install"'), "Has install event");
    assert.ok(swContent.includes('addEventListener("activate"'), "Has activate event");
    assert.ok(swContent.includes('addEventListener("fetch"'), "Has fetch event");
    assert.ok(swContent.includes('addEventListener("push"'), "Has push notification event");
    assert.ok(swContent.includes('addEventListener("notificationclick"'), "Has notificationclick event");
  });

  console.log("\n📦 3. PWA Components & Root Layout Integration:");

  const swRegisterPath = path.resolve("src/components/pwa/ServiceWorkerRegister.tsx");
  it("ServiceWorkerRegister.tsx registers sw.js", () => {
    assert.ok(fs.existsSync(swRegisterPath), "ServiceWorkerRegister.tsx exists");
    const content = fs.readFileSync(swRegisterPath, "utf8");
    assert.ok(content.includes('.register("/sw.js")'), "Registers sw.js");
  });

  const promptPath = path.resolve("src/components/pwa/PWAInstallPrompt.tsx");
  it("PWAInstallPrompt.tsx captures beforeinstallprompt and handles prompt()", () => {
    assert.ok(fs.existsSync(promptPath), "PWAInstallPrompt.tsx exists");
    const content = fs.readFileSync(promptPath, "utf8");
    assert.ok(content.includes("beforeinstallprompt"), "Listens for beforeinstallprompt");
    assert.ok(content.includes("deferredPrompt.prompt()"), "Triggers prompt()");
    assert.ok(content.includes("bac_pwa_install_dismissed_at"), "Supports 7-day dismissal");
    assert.ok(content.includes("تثبيت تطبيق BAC Mastery على هاتفك"), "Displays Arabic install message");
  });

  const layoutPath = path.resolve("src/app/layout.tsx");
  it("RootLayout links manifest and mounts PWA components", () => {
    const layoutContent = fs.readFileSync(layoutPath, "utf8");
    assert.ok(layoutContent.includes('manifest: "/manifest.json"'), "Includes manifest in metadata");
    assert.ok(layoutContent.includes("<ServiceWorkerRegister />"), "Mounts ServiceWorkerRegister");
    assert.ok(layoutContent.includes("<PWAInstallPrompt />"), "Mounts PWAInstallPrompt");
  });

  console.log("\n📦 4. Real Account Statistics Binding (src/app/account/page.tsx):");

  const accountPath = path.resolve("src/app/account/page.tsx");
  it("Account page binds useUserProgress and displays real statistics", () => {
    const accountContent = fs.readFileSync(accountPath, "utf8");
    assert.ok(accountContent.includes("useUserProgress"), "Hooks into useUserProgress");
    assert.ok(accountContent.includes("totalStudyTimeSeconds"), "Uses live totalStudyTimeSeconds");
    assert.ok(accountContent.includes("masteredCount"), "Uses live masteredCount");
    assert.ok(accountContent.includes("formatStudyTime"), "Formats study time into hours and minutes");
    assert.ok(accountContent.includes("getSubjectStatus"), "Uses live getSubjectStatus for subjects");
  });

  it("Account page displays stream-aware subjects and diagnostic breakdown", () => {
    const accountContent = fs.readFileSync(accountPath, "utf8");
    assert.ok(accountContent.includes("getStreamSubjects"), "Calculates subjects dynamically per stream");
    assert.ok(accountContent.includes("streamMeta"), "Resolves stream metadata dynamically");
    assert.ok(accountContent.includes("subjectMasteredCount"), "Computes mastered count per subject");
  });

  it("Account page contains Resume Last Lesson card", () => {
    const accountContent = fs.readFileSync(accountPath, "utf8");
    assert.ok(accountContent.includes("lastLessonInfo"), "Resolves lastLessonInfo");
    assert.ok(accountContent.includes("متابعة من حيث توقفت"), "Displays resume lesson title");
    assert.ok(accountContent.includes("lastLessonId"), "Tracks lastLessonId");
  });

  it("Account page features Push Notification settings & test trigger", () => {
    const accountContent = fs.readFileSync(accountPath, "utf8");
    assert.ok(accountContent.includes("Notification.requestPermission()"), "Requests notification permission");
    assert.ok(accountContent.includes("handleSendTestNotification"), "Allows sending test notification");
    assert.ok(accountContent.includes("إشعارات التذكير وتطبيق الهاتف"), "Notification section title present");
  });

  console.log("\n📦 5. Profile Route Alias (src/app/profile/page.tsx):");

  const profilePath = path.resolve("src/app/profile/page.tsx");
  it("/profile redirects to /account", () => {
    assert.ok(fs.existsSync(profilePath), "/profile/page.tsx exists");
    const content = fs.readFileSync(profilePath, "utf8");
    assert.ok(content.includes('redirect("/account")'), "Redirects to /account");
  });

  console.log("================================================================================");
  console.log(`🏁 RESULTS: ${testsPassed} passed, ${testsFailed} failed`);
  console.log("================================================================================");

  if (testsFailed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal error running verification:", err);
  process.exit(1);
});
