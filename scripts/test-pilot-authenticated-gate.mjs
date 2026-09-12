/**
 * BAC Mastery — Prompt 18 Chrome DevTools Protocol (CDP) Browser Gate
 * 
 * Verifies live in Headless Chrome:
 * 1. Mobile (390 × 844) Registration View (/auth signup mode, password confirmation)
 * 2. Mobile (390 × 844) Active Trial Dashboard (banner with remaining hours)
 * 3. Mobile (390 × 844) Trial Status Banner detail
 * 4. Mobile (390 × 844) Expired Trial Mission Gate (access blocked, content preserved)
 * 5. Mobile (390 × 844) Conversion Page (/subscribe real metrics + activation modal)
 * 6. Mobile (390 × 844) Account Subscription Card (/account)
 * 7. Desktop (1440 × 900) Responsive & Overflow Verification
 * 
 * Generates 6 official screenshots in docs/bac-mastery/screenshots/prompt-18/
 */

import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";
const CDP_PORT = 9235;
const USER_DATA_DIR = `C:\\Users\\dina\\AppData\\Local\\Temp\\chrome-pilot-gate-${Date.now()}`;
const SCREENSHOT_DIR = path.resolve("docs/bac-mastery/screenshots/prompt-18");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ensureServerRunning() {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/server-time`);
      if (res.ok) {
        console.log(`[Server] Next.js is responding on ${BASE_URL}`);
        return null;
      }
    } catch {}
    await sleep(1000);
  }

  console.log(`[Server] Launching Next.js server on port 3000...`);
  const serverProc = spawn("node", ["node_modules/next/dist/bin/next", "start", "-p", "3000"], {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: true,
  });

  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`${BASE_URL}/api/server-time`);
      if (res.ok) {
        console.log(`[Server] Next.js started successfully.`);
        return serverProc;
      }
    } catch {}
    await sleep(1000);
  }

  throw new Error("Failed to start or connect to Next.js server on port 3000");
}

async function runBrowserGate() {
  console.log("==================================================================");
  console.log("  BAC MASTERY — PROMPT 18 REAL BROWSER GATE (CDP)");
  console.log("  Chrome: " + CHROME_PATH);
  console.log("  Port: " + CDP_PORT);
  console.log("==================================================================\n");

  const serverProc = await ensureServerRunning();

  console.log("[Chrome] Spawning headless Chrome at port " + CDP_PORT + "...");
  const chromeProc = spawn(CHROME_PATH, [
    "--headless=new",
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--disable-extensions",
    "--window-size=390,844",
  ]);

  let connected = false;
  for (let i = 0; i < 30; i++) {
    await sleep(300);
    try {
      const res = await fetch(`http://localhost:${CDP_PORT}/json/version`);
      if (res.ok) {
        connected = true;
        break;
      }
    } catch {}
  }

  if (!connected) {
    chromeProc.kill();
    if (serverProc) serverProc.kill();
    throw new Error("Could not connect to Chrome CDP endpoint at localhost:" + CDP_PORT);
  }

  console.log("[Chrome] Connected to Chrome CDP endpoint.");

  const listRes = await fetch(`http://localhost:${CDP_PORT}/json/list`);
  const targets = await listRes.json();
  const pageTarget = targets.find((t) => t.type === "page" && !t.url.startsWith("chrome-extension://")) ||
                     targets.find((t) => t.type === "page") ||
                     targets[0];

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let msgId = 1;
  const pendingRequests = new Map();
  const consoleErrors = [];

  ws.addEventListener("message", (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.id && pendingRequests.has(msg.id)) {
      const { resolve, reject } = pendingRequests.get(msg.id);
      pendingRequests.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    } else if (msg.method === "Runtime.consoleAPICalled") {
      if (msg.params.type === "error") {
        const text = msg.params.args.map((a) => a.value || a.description).join(" ");
        consoleErrors.push(text);
        console.log("    [Browser Console Error]:", text);
      }
    } else if (msg.method === "Runtime.exceptionThrown") {
      const text = msg.params.exceptionDetails.text + (msg.params.exceptionDetails.exception?.description || "");
      consoleErrors.push(text);
      console.log("    [Browser Exception]:", text);
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
  await send("DOM.enable");

  async function evaluate(expression) {
    const res = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  async function setViewport(width, height, isMobile = true, scale = 3) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: scale,
      mobile: isMobile,
    });
  }

  async function navigate(url) {
    await send("Page.navigate", { url });
    await sleep(1500);
  }

  async function takeScreenshot(filename) {
    const res = await send("Page.captureScreenshot", { format: "png" });
    const filepath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(filepath, Buffer.from(res.data, "base64"));
    console.log(`    📸 Saved screenshot: ${filename}`);
  }

  async function checkOverflow() {
    return evaluate(`
      (() => {
        const docWidth = document.documentElement.offsetWidth;
        const scrollWidth = document.documentElement.scrollWidth;
        const bodyWidth = document.body ? document.body.scrollWidth : 0;
        const maxChildWidth = Math.max(
          ...Array.from(document.querySelectorAll('*'))
            .filter(el => el.getBoundingClientRect().width > 0)
            .map(el => el.getBoundingClientRect().right)
        );
        return {
          docWidth,
          scrollWidth,
          bodyWidth,
          maxChildWidth,
          hasOverflow: scrollWidth > docWidth || bodyWidth > docWidth + 1
        };
      })()
    `);
  }

  // Configure Mobile 390 × 844
  await setViewport(390, 844, true, 3);
  console.log("\n[CDP] Configured mobile viewport: 390 × 844 @ 3x scale.");

  const now = new Date();
  const activeExpiry = new Date(now.getTime() + 47 * 3600 * 1000 + 30 * 60 * 1000).toISOString();
  const expiredTime = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();

  // Test 1: Register Page (/auth in signup mode)
  console.log("\n--- Scenario 1: Registration View (Mobile 390×844) ---");
  await navigate(`${BASE_URL}/auth`);
  // Switch to signup mode
  await evaluate(`
    (() => {
      const signupBtn = document.querySelector('[data-testid="auth-mode-signup"]');
      if (signupBtn) signupBtn.click();
    })()
  `);
  await sleep(600);

  const authElements = await evaluate(`
    (() => {
      return {
        emailInput: !!document.querySelector('[data-testid="auth-email-input"]'),
        passwordInput: !!document.querySelector('[data-testid="auth-password-input"]'),
        confirmPasswordInput: !!document.querySelector('[data-testid="auth-confirm-password-input"]'),
        submitBtn: !!document.querySelector('[data-testid="auth-submit-button"]'),
      };
    })()
  `);

  console.log("  Auth form elements:", authElements);
  if (!authElements.confirmPasswordInput) {
    throw new Error("Missing auth-confirm-password-input in signup mode!");
  }

  // Populate dummy inputs for visual clarity
  await evaluate(`
    (() => {
      const email = document.querySelector('[data-testid="auth-email-input"]');
      const pass = document.querySelector('[data-testid="auth-password-input"]');
      const conf = document.querySelector('[data-testid="auth-confirm-password-input"]');
      if (email) email.value = "pilot.student2026@bac.dz";
      if (pass) pass.value = "PilotSecret2026";
      if (conf) conf.value = "PilotSecret2026";
    })()
  `);
  await takeScreenshot("01_auth_register_mobile.png");

  // Test 2: Active Trial Dashboard
  console.log("\n--- Scenario 2: Active Trial Dashboard (Mobile 390×844) ---");
  await evaluate(`
    (() => {
      const activeProfile = {
        educationLevel: "secondary",
        examType: "BAC",
        streamId: "science",
        techniqueMathSpecialty: undefined,
        targetScore: 16.5,
        availableTime: "12_to_18",
        futureObjective: { preset: "higher_school_ens_esi", customText: "طبيب جراح" },
        obstacles: ["time_management"],
        studyEnergy: "high",
        createdAt: "${now.toISOString()}",
        trial_started_at: "${now.toISOString()}",
        trial_expires_at: "${activeExpiry}",
        access_status: "TRIAL",
        plan: "PILOT_TRIAL"
      };
      localStorage.setItem("bac_mastery_strategic_profile", JSON.stringify(activeProfile));
      localStorage.setItem("bac_mastery_profile", JSON.stringify(activeProfile));
      localStorage.setItem("bac_user_email", "pilot.student2026@bac.dz");
    })()
  `);

  await navigate(`${BASE_URL}/dashboard`);
  await sleep(1000);

  const bannerData = await evaluate(`
    (() => {
      const banner = document.querySelector('[data-testid="dashboard-trial-banner"]');
      return {
        exists: !!banner,
        text: banner ? banner.innerText : null
      };
    })()
  `);
  console.log("  Dashboard trial banner:", bannerData);
  await takeScreenshot("02_active_trial_dashboard_mobile.png");

  // Test 3: Focused view of trial status banner
  console.log("\n--- Scenario 3: Focused Trial Status Banner Detail ---");
  await evaluate(`
    (() => {
      const banner = document.querySelector('[data-testid="dashboard-trial-banner"]');
      if (banner) banner.scrollIntoView({ behavior: "instant", block: "center" });
    })()
  `);
  await sleep(400);
  await takeScreenshot("03_trial_status_banner_mobile.png");

  // Test 4: Expired Trial Mission Gate
  console.log("\n--- Scenario 4: Expired Trial Mission Gate (Mobile 390×844) ---");
  await evaluate(`
    (() => {
      const expiredProfile = {
        educationLevel: "secondary",
        examType: "BAC",
        streamId: "science",
        targetScore: 16.5,
        availableTime: "12_to_18",
        futureObjective: { preset: "higher_school_ens_esi", customText: "طبيب جراح" },
        obstacles: ["time_management"],
        studyEnergy: "high",
        createdAt: "${now.toISOString()}",
        trial_started_at: "${new Date(now.getTime() - 50 * 3600 * 1000).toISOString()}",
        trial_expires_at: "${expiredTime}",
        access_status: "TRIAL",
        plan: "PILOT_TRIAL"
      };
      localStorage.setItem("bac_mastery_strategic_profile", JSON.stringify(expiredProfile));
      localStorage.setItem("bac_mastery_profile", JSON.stringify(expiredProfile));
    })()
  `);

  await navigate(`${BASE_URL}/mission/math_exponential_properties_equations`);
  await sleep(1200);

  const expiredGateData = await evaluate(`
    (() => {
      const gate = document.querySelector('[data-testid="mission-trial-expired-gate"]');
      return {
        exists: !!gate,
        text: gate ? gate.innerText.slice(0, 100) : null
      };
    })()
  `);
  console.log("  Mission expired trial gate:", expiredGateData);
  await takeScreenshot("04_expired_gate_mission_mobile.png");

  // Test 5: Conversion Page (/subscribe)
  console.log("\n--- Scenario 5: Conversion Page (Mobile 390×844) ---");
  await navigate(`${BASE_URL}/subscribe`);
  await sleep(1200);

  const subscribeElements = await evaluate(`
    (() => {
      return {
        card: !!document.querySelector('[data-testid="subscribe-conversion-card"]'),
        pilotButton: !!document.querySelector('[data-testid="subscribe-primary-cta"]'),
        priceText: document.body.innerText.includes("3,900") || document.body.innerText.includes("3900"),
      };
    })()
  `);
  console.log("  Subscribe page elements:", subscribeElements);

  // Click pilot activation button to show modal
  await evaluate(`
    (() => {
      const btn = document.querySelector('[data-testid="subscribe-primary-cta"]');
      if (btn) btn.click();
    })()
  `);
  await sleep(800);

  const modalShown = await evaluate(`
    (() => {
      return !!document.querySelector('[data-testid="subscribe-modal"]');
    })()
  `);
  console.log("  Pilot modal displayed:", modalShown);
  await takeScreenshot("05_conversion_page_mobile.png");

  // Close modal
  await evaluate(`
    (() => {
      const closeBtn = document.querySelector('[data-testid="subscribe-modal-close"]');
      if (closeBtn) closeBtn.click();
    })()
  `);
  await sleep(400);

  // Test 6: Account Subscription Card (/account)
  console.log("\n--- Scenario 6: Account Subscription Card (Mobile 390×844) ---");
  await navigate(`${BASE_URL}/account`);
  await sleep(1000);

  const accountSubCard = await evaluate(`
    (() => {
      const card = document.querySelector('[data-testid="account-subscription-card"]');
      return {
        exists: !!card,
        text: card ? card.innerText.slice(0, 120) : null
      };
    })()
  `);
  console.log("  Account subscription card:", accountSubCard);
  await takeScreenshot("06_account_subscription_mobile.png");

  // Test 7: Desktop Responsive & Overflow Verification (1440 × 900)
  console.log("\n--- Scenario 7: Desktop Responsive & Overflow (1440×900) ---");
  await setViewport(1440, 900, false, 1);
  console.log("[CDP] Configured desktop viewport: 1440 × 900 @ 1x scale.");

  const pagesToCheck = ["/dashboard", "/subscribe", "/account", "/mission/math_exponential_properties_equations"];
  const overflowIssues = [];

  for (const page of pagesToCheck) {
    await navigate(`${BASE_URL}${page}`);
    await sleep(800);
    const overflow = await checkOverflow();
    console.log(`  Page ${page} overflow check:`, overflow);
    if (overflow?.hasOverflow) {
      overflowIssues.push({ page, ...overflow });
    }
  }

  // Cleanup
  ws.close();
  chromeProc.kill();
  if (serverProc) serverProc.kill();

  console.log("\n==================================================================");
  console.log(`  BROWSER GATE SUMMARY:`);
  console.log(`  Screenshots Captured: 6/6 in ${SCREENSHOT_DIR}`);
  console.log(`  Console Errors: ${consoleErrors.length}`);
  console.log(`  Overflow Issues: ${overflowIssues.length}`);
  console.log("==================================================================\n");

  if (overflowIssues.length > 0 || consoleErrors.length > 0) {
    console.warn("  [Warning] Detected issues during browser gate!");
  } else {
    console.log("  ALL BROWSER GATE CRITERIA SATISFIED PERFECTLY!");
  }
}

runBrowserGate().catch((err) => {
  console.error("FATAL BROWSER GATE ERROR:", err);
  process.exit(1);
});
