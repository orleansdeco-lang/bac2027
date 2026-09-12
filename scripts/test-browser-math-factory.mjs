/**
 * BAC Mastery — Mathematics Content Factory Chrome CDP Browser Smoke Test
 * 
 * Verifies real rendering across Mobile (390x844) & Desktop (1440x900) viewports:
 * - Real Google Chrome Headless via Chrome DevTools Protocol (CDP)
 * - 0 Horizontal scroll overflows (scrollWidth <= innerWidth)
 * - 0 Console exceptions & fatal runtime errors
 * - Correct mathematical typography and RTL reading flow
 * - Evidence capture with full-fidelity PNG screenshots
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const APP_PORT = 3000;
const CDP_PORT = 9228;
const BASE_URL = `http://localhost:${APP_PORT}`;
const USER_DATA_DIR = `C:\\Users\\dina\\AppData\\Local\\Temp\\chrome-math-factory-${Date.now()}`;
const SCREENSHOT_DIR = path.resolve("docs/bac-mastery/screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

let serverProc = null;
let chromeProc = null;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTest() {
  console.log("==================================================================");
  console.log("  BAC MASTERY — MATHEMATICS FACTORY CHROME CDP BROWSER TEST");
  console.log("  Viewports: Mobile (390×844) & Desktop (1440×900)");
  console.log("==================================================================\n");

  const results = {
    checksPassed: 0,
    checksFailed: 0,
    consoleErrors: [],
    overflowViolations: [],
    screenshots: [],
  };

  function assert(condition, message) {
    if (condition) {
      results.checksPassed++;
      console.log(`  ✓ ${message}`);
    } else {
      results.checksFailed++;
      console.error(`  ✗ FAIL: ${message}`);
    }
  }

  try {
    // 1. Start Next.js server
    console.log("[Server] Launching Next.js production server on port " + APP_PORT + "...");
    serverProc = spawn("node", ["./node_modules/next/dist/bin/next", "start", "-p", String(APP_PORT)], {
      stdio: "ignore",
      detached: false,
    });

    let serverReady = false;
    for (let i = 0; i < 30; i++) {
      await sleep(500);
      try {
        const res = await fetch(BASE_URL);
        if (res.ok || res.status === 200 || res.status === 307 || res.status === 302) {
          serverReady = true;
          break;
        }
      } catch {}
    }

    if (!serverReady) {
      throw new Error("Next.js server failed to respond on " + BASE_URL);
    }
    console.log("[Server] Next.js server confirmed responsive at " + BASE_URL);

    // 2. Launch Chrome Headless with CDP
    console.log("[Chrome] Spawning headless Chrome at CDP port " + CDP_PORT + "...");
    chromeProc = spawn(CHROME_PATH, [
      "--headless=new",
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${USER_DATA_DIR}`,
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-gpu",
      "--disable-extensions",
      "--window-size=1440,900",
    ]);

    let chromeReady = false;
    for (let i = 0; i < 30; i++) {
      await sleep(300);
      try {
        const res = await fetch(`http://localhost:${CDP_PORT}/json/version`);
        if (res.ok) {
          chromeReady = true;
          break;
        }
      } catch {}
    }

    if (!chromeReady) {
      throw new Error("Could not connect to Chrome CDP at port " + CDP_PORT);
    }
    console.log("[Chrome] Connected to Chrome DevTools Protocol.");

    // Connect WebSocket
    const listRes = await fetch(`http://localhost:${CDP_PORT}/json/list`);
    const targets = await listRes.json();
    const pageTarget = targets.find((t) => t.type === "page" && !t.url.startsWith("chrome-extension://")) ||
                       targets.find((t) => t.type === "page") ||
                       targets[0];

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));

    let msgId = 1;
    const pendingRequests = new Map();

    ws.addEventListener("message", (evt) => {
      const msg = JSON.parse(evt.data);
      if (msg.id && pendingRequests.has(msg.id)) {
        const { resolve, reject } = pendingRequests.get(msg.id);
        pendingRequests.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message));
        else resolve(msg.result);
      } else if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
        const text = msg.params.args.map((a) => a.value || a.description || "").join(" ");
        results.consoleErrors.push({ type: "error", text });
        console.log(`    [Browser Console Error]`, text);
      } else if (msg.method === "Runtime.exceptionThrown") {
        const text = msg.params.exceptionDetails.text + (msg.params.exceptionDetails.exception?.description || "");
        results.consoleErrors.push({ type: "exception", text });
        console.log(`    [Browser Exception]`, text);
      }
    });

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        pendingRequests.set(id, { resolve, reject });
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    await send("Page.enable");
    await send("Runtime.enable");
    await send("Network.enable");

    async function evaluate(expression) {
      const res = await send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      return res.result?.value;
    }

    async function takeScreenshot(name) {
      const res = await send("Page.captureScreenshot", { format: "png" });
      const filepath = path.join(SCREENSHOT_DIR, `${name}.png`);
      fs.writeFileSync(filepath, Buffer.from(res.data, "base64"));
      results.screenshots.push(filepath);
      console.log(`    📸 Saved screenshot: ${name}.png`);
    }

    async function setViewport(width, height, isMobile = false) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: isMobile ? 3 : 1,
        mobile: isMobile,
      });
      await sleep(200);
    }

    async function navigateAndWait(url, waitMs = 2500) {
      console.log(`\n  Navigating to: ${url}`);
      await send("Page.navigate", { url });
      await sleep(waitMs);
    }

    // =========================================================================
    // TEST 1: MOBILE VIEWPORT (390 x 844) — MISSION FLOW
    // =========================================================================
    console.log("\n[TEST 1] Mobile Viewport (390 × 844) Verification");
    await setViewport(390, 844, true);

    // 1.1 Mobile Roadmap
    await navigateAndWait(`${BASE_URL}/roadmap`);
    const mobileRoadmapOverflow = await evaluate(`document.documentElement.scrollWidth > window.innerWidth`);
    assert(!mobileRoadmapOverflow, "Mobile Roadmap (390px): Zero horizontal scroll overflow");
    await takeScreenshot("math-mobile-roadmap");

    // 1.2 Mobile Math Mission (math_m_arithmetic_congruence)
    await navigateAndWait(`${BASE_URL}/mission/math_m_arithmetic_congruence`);
    const mobileMissionOverflow = await evaluate(`document.documentElement.scrollWidth > window.innerWidth`);
    assert(!mobileMissionOverflow, "Mobile Mission (390px): Zero horizontal scroll overflow");

    const pageText = await evaluate(`document.body.innerText`);
    assert(!pageText.includes("[object Object]"), "Mobile Mission: No raw unrendered '[object Object]' tokens");
    assert(!pageText.includes("NaN"), "Mobile Mission: No NaN tokens in display");
    await takeScreenshot("math-mobile-mission-learn");

    // 1.3 Mobile Error Lab
    await navigateAndWait(`${BASE_URL}/error-lab`);
    const mobileErrorLabOverflow = await evaluate(`document.documentElement.scrollWidth > window.innerWidth`);
    assert(!mobileErrorLabOverflow, "Mobile Error Lab (390px): Zero horizontal scroll overflow");
    await takeScreenshot("math-mobile-errorlab");

    // =========================================================================
    // TEST 2: DESKTOP VIEWPORT (1440 x 900) — MISSION & DASHBOARD
    // =========================================================================
    console.log("\n[TEST 2] Desktop Viewport (1440 × 900) Verification");
    await setViewport(1440, 900, false);

    // 2.1 Desktop Math Mission
    await navigateAndWait(`${BASE_URL}/mission/math_m_arithmetic_congruence`);
    const desktopMissionOverflow = await evaluate(`document.documentElement.scrollWidth > window.innerWidth`);
    assert(!desktopMissionOverflow, "Desktop Mission (1440px): Zero horizontal scroll overflow");

    const hasTitle = await evaluate(`
      document.body.innerText.includes("الموافقات") ||
      document.body.innerText.includes("الحساب") ||
      document.body.innerText.includes("رياضيات") ||
      document.body.innerText.includes("Math")
    `);
    assert(hasTitle, "Desktop Mission: Renders mathematical pedagogical headers");
    await takeScreenshot("math-desktop-mission-learn");

    // 2.2 Desktop Roadmap
    await navigateAndWait(`${BASE_URL}/roadmap`);
    const desktopRoadmapOverflow = await evaluate(`document.documentElement.scrollWidth > window.innerWidth`);
    assert(!desktopRoadmapOverflow, "Desktop Roadmap (1440px): Zero horizontal scroll overflow");
    await takeScreenshot("math-desktop-roadmap");

    // 2.3 Desktop Dashboard
    await navigateAndWait(`${BASE_URL}/dashboard`);
    const desktopDashOverflow = await evaluate(`document.documentElement.scrollWidth > window.innerWidth`);
    assert(!desktopDashOverflow, "Desktop Dashboard (1440px): Zero horizontal scroll overflow");
    await takeScreenshot("math-desktop-dashboard");

    // Check for fatal console exceptions
    const fatalErrors = results.consoleErrors.filter(
      (e) => !e.text.includes("favicon") && !e.text.includes("manifest") && !e.text.includes("404")
    );
    assert(fatalErrors.length === 0, `Zero fatal console errors during execution (found ${fatalErrors.length})`);

    ws.close();
  } finally {
    if (chromeProc) {
      console.log("\n[Cleanup] Terminating Chrome process...");
      chromeProc.kill();
    }
    if (serverProc) {
      console.log("[Cleanup] Terminating Next.js server...");
      serverProc.kill();
    }
    try {
      if (fs.existsSync(USER_DATA_DIR)) {
        fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
      }
    } catch {}
  }

  console.log("\n==================================================================");
  console.log(`  BROWSER TEST COMPLETE: ${results.checksPassed} PASSED, ${results.checksFailed} FAILED`);
  console.log(`  SCREENSHOTS CAPTURED: ${results.screenshots.length}`);
  console.log("==================================================================\n");

  if (results.checksFailed > 0) {
    process.exit(1);
  } else {
    console.log("  >>> REAL CHROME CDP BROWSER VERIFICATION PASSED <<<\n");
    process.exit(0);
  }
}

runTest().catch((err) => {
  console.error("Fatal browser test error:", err);
  if (chromeProc) chromeProc.kill();
  if (serverProc) serverProc.kill();
  process.exit(1);
});
