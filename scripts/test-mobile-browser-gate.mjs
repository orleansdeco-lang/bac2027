/**
 * BAC Mastery - Prompt 15.2 Real Mobile Browser Gate Runner
 * 
 * Target Viewport: 390 x 844 (Mobile Emulation)
 * Browser Engine: Google Chrome Headless via Chrome DevTools Protocol (CDP)
 * Tests:
 * 1. Targeted Mission Flow for math_exponential_properties_equations
 *    - Learn step (Arabic RTL, no overflow)
 *    - Worked example (toggle solution, legibility)
 *    - Practice step (selection, submit)
 *    - Error diagnosis & repair guide (micro-practice drill)
 *    - Retest step (NEW 2e^(2x)-5e^x-3=0 verification, legible options, RTL)
 *    - Retest submission (correct option opt-1, feedback, demonstrated mastery)
 * 2. General Mobile Smoke:
 *    - Landing (/), Dashboard (/dashboard), Roadmap (/roadmap), Error Lab (/error-lab), Progress (/progress)
 * 3. Evidence capture: screenshots, console logs, network audit, overflow metrics
 */

import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:3000";
const PORT = 9226;
const USER_DATA_DIR = `C:\\Users\\dina\\AppData\\Local\\Temp\\chrome-mobile-gate-${Date.now()}`;
const SCREENSHOT_DIR = path.resolve("docs/bac-mastery/screenshots");

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runGate() {
  console.log("==================================================================");
  console.log("  BAC MASTERY — PROMPT 15.2 REAL MOBILE BROWSER GATE");
  console.log("  Browser Engine: Google Chrome Headless via CDP");
  console.log("  Viewport: 390 × 844 (Mobile Emulation)");
  console.log("  Target URL: " + BASE_URL);
  console.log("==================================================================\n");

  const results = {
    chromeLaunched: false,
    cdpConnected: false,
    viewportConfigured: false,
    checks: {},
    screenshots: [],
    consoleErrors: [],
    networkErrors: [],
    overflows: [],
  };

  // 1. Launch Chrome
  console.log("[Chrome] Spawning headless Chrome at port " + PORT + "...");
  const chromeProc = spawn(CHROME_PATH, [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${USER_DATA_DIR}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--disable-extensions",
    "--window-size=390,844",
  ]);

  let connected = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try {
      const res = await fetch(`http://localhost:${PORT}/json/version`);
      if (res.ok) {
        connected = true;
        break;
      }
    } catch {}
  }

  if (!connected) {
    chromeProc.kill();
    throw new Error("Could not connect to Chrome CDP endpoint at localhost:" + PORT);
  }
  results.chromeLaunched = true;
  results.cdpConnected = true;
  console.log("[Chrome] Connected to Chrome DevTools Protocol.");

  const listRes = await fetch(`http://localhost:${PORT}/json/list`);
  const targets = await listRes.json();
  const pageTarget = targets.find((t) => t.type === "page" && !t.url.startsWith("chrome-extension://")) ||
                     targets.find((t) => t.type === "page") ||
                     targets[0];

  console.log("[CDP] Selected page target:", pageTarget.url);

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
    } else if (msg.method === "Runtime.consoleAPICalled") {
      if (msg.params.type === "error") {
        const text = msg.params.args.map((a) => a.value || a.description).join(" ");
        results.consoleErrors.push({ type: "error", text });
        console.log(`    [Browser Console Error]`, text);
      }
    } else if (msg.method === "Runtime.exceptionThrown") {
      const text = msg.params.exceptionDetails.text + (msg.params.exceptionDetails.exception?.description || "");
      results.consoleErrors.push({ type: "exception", text });
      console.log(`    [Browser Exception]`, text);
    } else if (msg.method === "Network.loadingFailed") {
      results.networkErrors.push(msg.params);
    }
  });

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  // Enable CDP domains
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");

  // Mobile Viewport: 390 x 844
  await send("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    mobile: true,
  });
  results.viewportConfigured = true;
  console.log("[CDP] Configured mobile emulation viewport: 390 x 844 @ 3x scale.");

  // Helpers
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

  async function waitForLoaded(maxWaitMs = 8000) {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const isSpinning = await evaluate(`
        Boolean(
          document.querySelector('.animate-spin') ||
          document.body.innerText.includes("جاري تحميل") ||
          document.body.innerText.includes("جاري استرجاع") ||
          document.body.innerText.includes("Chargement")
        )
      `);
      if (!isSpinning) {
        await new Promise((r) => setTimeout(r, 400));
        return true;
      }
      await new Promise((r) => setTimeout(r, 200));
    }
    return false;
  }

  async function navigate(url, waitMs = 2000) {
    await send("Page.navigate", { url });
    await new Promise((r) => setTimeout(r, waitMs));
    await waitForLoaded();
  }

  async function checkMobileOverflow(pageName) {
    const metrics = await evaluate(`
      JSON.stringify({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyScrollWidth: document.body.scrollWidth,
        innerWidth: window.innerWidth
      })
    `);
    const parsed = JSON.parse(metrics || "{}");
    const hasOverflow = parsed.scrollWidth > parsed.clientWidth + 2;
    if (hasOverflow) {
      console.log(`    ⚠ Horizontal overflow on ${pageName}: scrollWidth=${parsed.scrollWidth}, clientWidth=${parsed.clientWidth}`);
      results.overflows.push({ page: pageName, ...parsed });
    }
    return !hasOverflow;
  }

  try {
    // =========================================================================
    // PART 1: TARGETED MISSION GATE — math_exponential_properties_equations
    // =========================================================================
    console.log("\n--- [PART 1] Targeted Mission Flow: math_exponential_properties_equations ---");

    const missionUrl = `${BASE_URL}/mission/math_exponential_properties_equations`;
    console.log(`[Step 1] Navigating to mission URL: ${missionUrl}...`);
    await navigate(missionUrl, 3000);

    // 1. Learn Step Check
    const learnBody = await evaluate(`document.body.innerText`);
    const isLearnStep = learnBody.includes("خواص الدالة الأسية") ||
                        learnBody.includes("المعادلات والمتراجحات الأسية");
    const dirRtl = await evaluate(`document.documentElement.dir === 'rtl' || document.body.dir === 'rtl'`);
    const noOverflowLearn = await checkMobileOverflow("mission-learn");
    await takeScreenshot("01_mobile_mission_learn");

    results.checks.mission_learn_rendered = Boolean(isLearnStep);
    results.checks.mission_learn_rtl = Boolean(dirRtl);
    results.checks.mission_learn_no_overflow = noOverflowLearn;
    console.log(`  ✓ Mission Learn step: Rendered=${isLearnStep}, RTL=${dirRtl}, NoOverflow=${noOverflowLearn}`);

    // Click Proceed to Worked Example ("2. مثال محلول" tab or bottom button)
    console.log("[Step 2] Switching to worked example step...");
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const tabBtn = btns.find(b => b.innerText.includes("مثال محلول"));
        if (tabBtn) {
          tabBtn.click();
        } else {
          const nextBtn = btns.find(b => b.innerText.includes("المثال المحلول") || b.innerText.includes("التالي"));
          if (nextBtn) nextBtn.click();
        }
      })()
    `);
    await new Promise((r) => setTimeout(r, 1200));

    // 2. Worked Example Step Check
    const weBody = await evaluate(`document.body.innerText`);
    const hasWeProblem = weBody.includes("e^(2x) - 3*e^x - 4 = 0") || weBody.includes("e^(2x) - 3e^x - 4 = 0");
    // Reveal solution
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const revealBtn = btns.find(b => b.innerText.includes("اكشف") || b.innerText.includes("الحل"));
        if (revealBtn) revealBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 800));
    const revealedBody = await evaluate(`document.body.innerText`);
    const hasWeSteps = revealedBody.includes("X^2 - 3X - 4 = 0") || revealedBody.includes("الخطوة 1");
    const noOverflowWe = await checkMobileOverflow("mission-worked-example");
    await takeScreenshot("02_mobile_mission_worked_example");

    results.checks.mission_we_rendered = Boolean(hasWeProblem && hasWeSteps);
    results.checks.mission_we_no_overflow = noOverflowWe;
    console.log(`  ✓ Worked Example step: Problem=${hasWeProblem}, Steps=${hasWeSteps}, NoOverflow=${noOverflowWe}`);

    // Click Proceed to Practice ("فهمت المثال، نبدأ التطبيق")
    console.log("[Step 3] Clicking proceed to practice...");
    await evaluate(`
      (() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const nextBtn = btns.find(b => b.innerText.includes("التطبيق") || b.innerText.includes("التدريب"));
        if (nextBtn) nextBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 1200));

    // 3. Practice Step Check
    const practiceBody = await evaluate(`document.body.innerText`);
    const hasPqPrompt = practiceBody.includes("e^(2x) - 5e^x + 6 = 0");
    const noOverflowPractice = await checkMobileOverflow("mission-practice");
    await takeScreenshot("03_mobile_mission_practice");

    results.checks.mission_practice_rendered = Boolean(hasPqPrompt);
    results.checks.mission_practice_no_overflow = noOverflowPractice;
    console.log(`  ✓ Practice step: Prompt=${hasPqPrompt}, NoOverflow=${noOverflowPractice}`);

    // Trigger Error Repair Flow to reach Retest:
    // Select wrong option (opt-2: S = {2, 3}) to trigger Error Lab diagnosis
    console.log("[Step 4] Answering practice with misconception option to trigger repair flow...");
    await evaluate(`
      (() => {
        // Select option 2: {2, 3}
        const optBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes("{2, 3}"));
        if (optBtns.length > 0) optBtns[0].click();

        // Select confidence 3/5
        const confBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes("3/5") || b.innerText.trim() === "3");
        if (confBtns.length > 0) confBtns[0].click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 600));

    // Submit practice attempt ("تحقق من الإجابة")
    await evaluate(`
      (() => {
        const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes("تحقق"));
        if (submitBtn) submitBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 1500));

    // 4. Practice Feedback Screen
    await takeScreenshot("04_mobile_practice_feedback");
    console.log("[Step 4.1] Advancing from practice feedback to Error Diagnosis...");
    await evaluate(`
      (() => {
        const diagBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes("تشخيص سبب الخطأ"));
        if (diagBtn) diagBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 1200));

    // 5. Error Diagnosis Screen
    await takeScreenshot("05_mobile_error_diagnosis");
    console.log("[Step 5] Selecting attribution and advancing to Repair Guide...");
    await evaluate(`
      (() => {
        const advanceBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes("تأكيد وبدء دليل الإصلاح"));
        if (advanceBtn) advanceBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 1200));

    // 6. Repair Guide Screen
    const repairBody = await evaluate(`document.body.innerText`);
    const hasRepairGuide = repairBody.includes("دليل الإصلاح المركز") || repairBody.includes("خطوات المعالجة");
    await takeScreenshot("06_mobile_repair_guide");
    console.log(`  ✓ Repair Guide rendered: ${hasRepairGuide}`);

    // Advance from repair guide to Retest ("أكملت المراجعة • ننتقل لاختبار التوأم (Retest)")
    console.log("[Step 6.1] Advancing from repair guide to Retest...");
    await evaluate(`
      (() => {
        const retestBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes("اختبار التوأم"));
        if (retestBtn) retestBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 1500));

    // =========================================================================
    // 7. CRITICAL CHECK: NEW RETEST QUESTION VERIFICATION (DEF-001)
    // =========================================================================
    console.log("\n[Step 7] AUDITING NEW RETEST QUESTION RENDERING IN MOBILE VIEWPORT...");
    const retestText = await evaluate(`document.body.innerText`);
    const hasNewEquation = retestText.includes("2e^(2x) - 5e^x - 3 = 0");
    const doesNotHaveOldDuplicate = !retestText.includes("e^(2x) - 3e^x - 4 = 0");
    const hasOption1 = retestText.includes("ln(3)") && retestText.includes("مستحيلة");
    const hasOption2 = retestText.includes("ln(-1/2)");
    const hasOption3 = retestText.includes("{3, -1/2}");
    const noOverflowRetest = await checkMobileOverflow("mission-retest");
    await takeScreenshot("07_mobile_new_retest_rendered");

    results.checks.retest_has_new_equation = Boolean(hasNewEquation);
    results.checks.retest_no_old_duplicate = Boolean(doesNotHaveOldDuplicate);
    results.checks.retest_has_option1_correct = Boolean(hasOption1);
    results.checks.retest_has_distractors = Boolean(hasOption2 && hasOption3);
    results.checks.retest_no_overflow = noOverflowRetest;

    console.log(`  ✓ New Retest Equation rendered: ${hasNewEquation}`);
    console.log(`  ✓ Old Duplicate Equation eliminated: ${doesNotHaveOldDuplicate}`);
    console.log(`  ✓ Option 1 (Correct) rendered: ${hasOption1}`);
    console.log(`  ✓ Distractors (opt-2, opt-3) rendered: ${hasOption2 && hasOption3}`);
    console.log(`  ✓ Mobile 390px Zero Overflow: ${noOverflowRetest}`);

    // Answer the retest with correct answer (opt-1)
    console.log("[Step 7.1] Selecting correct answer on retest (opt-1) and submitting...");
    await evaluate(`
      (() => {
        // Find option 1
        const optBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes("ln(3)") && b.innerText.includes("مستحيلة"));
        if (optBtns.length > 0) optBtns[0].click();

        // Find confidence 5/5
        const confBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes("5/5") || b.innerText.trim() === "5");
        if (confBtns.length > 0) confBtns[0].click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 600));

    // Submit retest ("تقييم اختبار التوأم")
    await evaluate(`
      (() => {
        const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes("تقييم اختبار التوأم"));
        if (submitBtn) submitBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 1500));

    // Verify summary / demonstrated mastery
    const summaryText = await evaluate(`document.body.innerText`);
    const hasMasteryAchieved = summaryText.includes("وش ثبت اليوم؟") ||
                               summaryText.includes("تم إثبات التمكن") ||
                               summaryText.includes("إجابة صحيحة");
    await takeScreenshot("08_mobile_mastery_achieved");
    results.checks.retest_mastery_achieved = Boolean(hasMasteryAchieved);
    console.log(`  ✓ Demonstrated Mastery screen reached: ${hasMasteryAchieved}`);

    // =========================================================================
    // PART 2: GENERAL MOBILE SMOKE TEST ACROSS CORE SCREENS
    // =========================================================================
    console.log("\n--- [PART 2] General Mobile Smoke Test (390 × 844) ---");

    const generalRoutes = [
      { name: "Landing", path: "/", screenshot: "09_mobile_landing" },
      { name: "Dashboard", path: "/dashboard", screenshot: "10_mobile_dashboard" },
      { name: "Roadmap", path: "/roadmap", screenshot: "11_mobile_roadmap" },
      { name: "ErrorLab", path: "/error-lab", screenshot: "12_mobile_error_lab" },
      { name: "Progress", path: "/progress", screenshot: "13_mobile_progress" },
    ];

    for (const r of generalRoutes) {
      console.log(`  Testing ${r.name} (${r.path})...`);
      await navigate(`${BASE_URL}${r.path}`, 1500);
      const okOverflow = await checkMobileOverflow(r.name);
      await takeScreenshot(r.screenshot);
      results.checks[`route_${r.name.toLowerCase()}_no_overflow`] = okOverflow;
      console.log(`    ✓ ${r.name}: Viewport OK, NoOverflow=${okOverflow}`);
    }

  } finally {
    ws.close();
    chromeProc.kill();
    console.log("\n[Chrome] Cleaned up browser process and CDP session.");
  }

  // Final Evaluation
  const allChecksPass = Object.values(results.checks).every(Boolean);
  const zeroOverflows = results.overflows.length === 0;
  const zeroFatalConsole = results.consoleErrors.filter(e => e.type === "exception").length === 0;

  console.log("\n==================================================================");
  console.log("  MOBILE BROWSER GATE RESULTS SUMMARY");
  console.log("==================================================================");
  console.log(`  Total Checks: ${Object.keys(results.checks).length}`);
  console.log(`  Passed Checks: ${Object.values(results.checks).filter(Boolean).length}`);
  console.log(`  New Retest Verified: ${results.checks.retest_has_new_equation}`);
  console.log(`  Old Duplicate Eliminated: ${results.checks.retest_no_old_duplicate}`);
  console.log(`  Horizontal Overflows: ${results.overflows.length}`);
  console.log(`  Console Exceptions: ${results.consoleErrors.filter(e => e.type === 'exception').length}`);
  console.log(`  Screenshots Captured: ${results.screenshots.length}`);
  console.log(`  GATE STATUS: ${allChecksPass && zeroOverflows && zeroFatalConsole ? "PASS" : "FAIL"}`);
  console.log("==================================================================\n");

  fs.writeFileSync("docs/bac-mastery/mobile-gate-results.json", JSON.stringify(results, null, 2), "utf8");

  if (!allChecksPass || !zeroOverflows || !zeroFatalConsole) {
    process.exit(1);
  }
}

runGate().catch((err) => {
  console.error("FATAL Mobile Browser Gate Error:", err);
  process.exit(1);
});
