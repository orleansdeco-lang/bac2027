import { createClient } from "@supabase/supabase-js";

const DEFAULT_SUPABASE_URL = "https://erbvmpnxufgeinqnshzu.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyYnZtcG54dWZnZWlucW5zaHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxMjkzMzEsImV4cCI6MjEwNDcwNTMzMX0.STGUNuth4J2-TXqvH_BNwRJEsxH5RjSmhjUPttLN998";

const supabase = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY);

console.log("🧪 Testing Resilient Room Creation & Schema Self-Healing...\n");

async function runTests() {
  let passed = 0;
  let failed = 0;
  const testRoomId = `test-room-${Date.now()}`;

  // Test 1: Self-healing insert into majlis_rooms without crashing on duration_minutes or non-UUID host
  try {
    const isUUID = false; // Simulated usr_std_12345678
    const safeHostUserId = isUUID ? "usr_std_12345678" : null;
    const now = new Date().toISOString();
    const duration = 60;
    const timerEnd = new Date(Date.now() + duration * 60 * 1000).toISOString();

    const basePayload = {
      id: testRoomId,
      title: "مذاكرة وتمارين: المشكلة والإشكالية والمنطق الصوري والرياضي",
      stream: "sciences_exp",
      subject: "philosophy",
      lesson: "المشكلة والإشكالية والمنطق الصوري والرياضي",
      mode: "FULL_EXAM",
      host_user_id: safeHostUserId,
      capacity: 2,
      status: "ACTIVE",
      current_step: "SOLVING",
      timer_end: timerEnd,
      active_material: {
        durationMinutes: duration,
        hostStudentId: "usr_std_12345678",
        hostStudentName: "أحمد .ب",
      },
      created_at: now,
      updated_at: now,
    };

    let { error } = await supabase.from("majlis_rooms").insert({
      ...basePayload,
      duration_minutes: duration,
    });

    if (error && (error.code === "PGRST204" || error.code === "42703")) {
      const retry = await supabase.from("majlis_rooms").insert(basePayload);
      error = retry.error;
    }

    if (!error) {
      console.log("  ✅ PASS: Room created successfully with self-healing fallback");
      passed++;
    } else {
      console.error("  ❌ FAIL: Room insert failed:", error);
      failed++;
    }
  } catch (err) {
    console.error("  ❌ FAIL: Room insert threw exception:", err);
    failed++;
  }

  // Test 2: Taking a seat with self-healing wilaya code
  try {
    const wilayaCode = "16";
    const studentName = "أحمد .ب";
    const baseMember = {
      room_id: testRoomId,
      user_id: "usr_std_12345678",
      user_name: `${studentName} (${wilayaCode})`,
      user_avatar: "/illustrations/characters/scholar.jpg",
      user_stream: "sciences_exp",
      seat_index: 0,
      status: "SOLVING",
      score: 0,
    };

    let { error: memErr } = await supabase.from("majlis_members").insert({
      ...baseMember,
      wilaya_code: wilayaCode,
    });

    if (memErr && (memErr.code === "PGRST204" || memErr.code === "42703")) {
      const retry = await supabase.from("majlis_members").insert(baseMember);
      memErr = retry.error;
    }

    if (!memErr) {
      console.log("  ✅ PASS: Member seated successfully with self-healing wilaya fallback");
      passed++;
    } else {
      console.error("  ❌ FAIL: Member seat failed:", memErr);
      failed++;
    }
  } catch (err) {
    console.error("  ❌ FAIL: Member seat threw exception:", err);
    failed++;
  }

  // Test 3: Member retrieval and wilaya recovery
  try {
    const { data, error } = await supabase
      .from("majlis_members")
      .select("*")
      .eq("room_id", testRoomId);

    if (!error && data && data.length > 0) {
      const m = data[0];
      let extractedWilaya = m.wilaya_code;
      let cleanName = m.user_name;
      if (!extractedWilaya && typeof m.user_name === "string") {
        const match = m.user_name.match(/\((\d{2})\)/);
        if (match) {
          extractedWilaya = match[1];
          cleanName = m.user_name.replace(/\s*\(\d{2}\)\s*$/, "").trim();
        }
      }

      if (extractedWilaya === "16" && cleanName === "أحمد .ب") {
        console.log(`  ✅ PASS: Member identity recovered: name="${cleanName}", wilaya="(${extractedWilaya})"`);
        passed++;
      } else {
        console.error("  ❌ FAIL: Member identity mismatched:", { cleanName, extractedWilaya });
        failed++;
      }
    } else {
      console.error("  ❌ FAIL: Could not fetch seated member:", error);
      failed++;
    }
  } catch (err) {
    console.error("  ❌ FAIL: Member retrieval exception:", err);
    failed++;
  }

  // Cleanup test records
  try {
    await supabase.from("majlis_members").delete().eq("room_id", testRoomId);
    await supabase.from("majlis_rooms").delete().eq("id", testRoomId);
    console.log("  🧹 Test records cleaned up successfully");
  } catch (cleanErr) {
    console.warn("  Cleanup notice:", cleanErr);
  }

  console.log(`\n========================================`);
  console.log(`Total: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`========================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
