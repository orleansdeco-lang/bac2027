import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import React from "react";
import ReactDOMServer from "react-dom/server";

console.log("==================================================================");
console.log("  BAC MASTERY — EMBEDDED VIDEO PLAYER VERIFICATION SUITE");
console.log("  Authoritative Test on Day 01 Lesson (SNV Week 01)");
console.log("==================================================================\n");

function loadTs(relPath) {
  const fullPath = path.resolve(relPath);
  const code = fs.readFileSync(fullPath, "utf8");
  const result = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.React,
    },
  });
  const m = { exports: {} };
  const fn = new Function("exports", "require", "module", result.outputText);
  fn(m.exports, (reqPath) => {
    if (reqPath === "react") return { default: React, ...React };
    if (reqPath === "react-dom/server") return { default: ReactDOMServer, ...ReactDOMServer };
    return {};
  }, m);
  return m.exports;
}

// Load curriculum and player
const snvModule = loadTs("src/domain/content/snv-daily-lessons.ts");
const playerModule = loadTs("src/components/curriculum/EmbeddedVideoPlayer.tsx");

const day1Lesson = snvModule.snvWeek01Lessons[0];
const { EmbeddedVideoPlayer, extractYoutubeVideoId, parseTimestampToSeconds } = playerModule;

let passed = 0;
function test(name, fn) {
  try {
    fn();
    console.log("  [PASS] " + name);
    passed++;
  } catch (err) {
    console.error("  [FAIL] " + name);
    console.error("         " + err.message);
    process.exit(1);
  }
}

test("Day 01 lesson externalResource integrity", () => {
  assert.ok(day1Lesson, "Day 1 lesson must exist");
  assert.strictEqual(day1Lesson.id, "snv_u01_d01_protein_site_arnm");
  assert.ok(day1Lesson.externalResource, "Day 1 must have externalResource");
  assert.strictEqual(day1Lesson.externalResource.platform, "youtube");
  assert.strictEqual(day1Lesson.externalResource.videoUrl, "https://www.youtube.com/watch?v=1oW_wB7yG0M");
  assert.strictEqual(day1Lesson.externalResource.targetTimestamp, "03:15");
  assert.strictEqual(day1Lesson.externalResource.title, "الوحدة 01: مقر تركيب البروتين وإبراز دور الـ ARNm بالتفصيل");
});

test("extractYoutubeVideoId correctly extracts video ID from URL", () => {
  const videoId = extractYoutubeVideoId(day1Lesson.externalResource.videoUrl);
  assert.strictEqual(videoId, "1oW_wB7yG0M");
});

test("parseTimestampToSeconds accurately converts mm:ss to integer seconds", () => {
  const seconds = parseTimestampToSeconds(day1Lesson.externalResource.targetTimestamp);
  assert.strictEqual(seconds, 195, `Expected 195s (3m15s), got ${seconds}`);
});

test("EmbeddedVideoPlayer renders server-side HTML with privacy-preserving URL", () => {
  const videoId = extractYoutubeVideoId(day1Lesson.externalResource.videoUrl);
  const startSeconds = parseTimestampToSeconds(day1Lesson.externalResource.targetTimestamp);
  const title_ar = day1Lesson.externalResource.title;

  const element = React.createElement(EmbeddedVideoPlayer, {
    videoId,
    startSeconds,
    title_ar,
  });

  const html = ReactDOMServer.renderToStaticMarkup(element);

  assert.ok(html.includes("youtube-nocookie.com/embed/1oW_wB7yG0M?start=195&amp;rel=0&amp;modestbranding=1"), "Must include nocookie embed URL with exact start seconds");
  assert.ok(html.includes("aspect-video"), "Must support 16:9 aspect ratio");
  assert.ok(html.includes("allowfullscreen"), "Must allow full screen mode");
  assert.ok(html.includes("dir=\"rtl\""), "Must support RTL text direction");
  assert.ok(html.includes(title_ar), "Must render title");
});

console.log(`\n  RESULTS: ${passed}/4 SUITES PASSED (0 FAILURES)`);
console.log("  EMBEDDED VIDEO PLAYER FULLY VERIFIED ON DAY 01 LESSON!\n");
