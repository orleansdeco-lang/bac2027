/**
 * BAC Mastery - P0 Security Fix Verification Suite
 * Identity Isolation & Registration Reset Automated Verification
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

console.log("==================================================================");
console.log("  BAC MASTERY — P0 SECURITY AUDIT & REGRESSION SUITE");
console.log("  IDENTITY ISOLATION + REGISTRATION RESET VERIFICATION");
console.log("==================================================================\n");

// 1. Mock LocalStorage Environment
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, value) {
    this.store.set(key, String(value));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
  get length() {
    return this.store.size;
  }
  key(index) {
    return Array.from(this.store.keys())[index] || null;
  }
}

globalThis.localStorage = new MockLocalStorage();
globalThis.window = globalThis;

// 2. TypeScript Module Loader with path resolution
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
      esModuleInterop: true,
    },
  });
  const m = { exports: {} };
  moduleCache.set(fullPath, m.exports);

  const fn = new Function("exports", "require", "module", "__filename", "__dirname", result.outputText);
  fn(
    m.exports,
    (reqPath) => {
      let target = reqPath;
      if (target === "clsx" || target === "tailwind-merge") {
        return (...args) => args.filter(Boolean).join(" ");
      }
      if (target.startsWith("@supabase/supabase-js")) {
        return {
          createClient: () => ({
            from: () => ({
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: null, error: null }),
                }),
              }),
              insert: async () => ({ data: null, error: null }),
              upsert: async () => ({ data: null, error: null }),
            }),
            auth: {
              signOut: async () => ({ error: null }),
              getUser: async () => ({ data: { user: null }, error: null }),
            },
          }),
        };
      }
      if (target.startsWith("@/")) {
        target = path.resolve(target.replace("@/", "src/"));
      } else if (target.startsWith(".")) {
        target = path.resolve(path.dirname(fullPath), target);
      }
      if (fs.existsSync(target + ".ts")) return loadTs(target + ".ts");
      if (fs.existsSync(target + ".tsx")) return loadTs(target + ".tsx");
      if (fs.existsSync(target + "/index.ts")) return loadTs(target + "/index.ts");
      if (fs.existsSync(target) && fs.statSync(target).isFile()) return loadTs(target);
      return {};
    },
    m,
    fullPath,
    path.dirname(fullPath)
  );
  return m.exports;
}

// 3. Load actual source modules
const profileModule = loadTs("src/lib/onboarding/profile.ts");
const studentRepoModule = loadTs("src/lib/repositories/student-repository.ts");
const studentServiceModule = loadTs("src/lib/services/student-service.ts");

const {
  saveRegistrationDraft,
  getRegistrationDraft,
  clearRegistrationDraft,
  saveAcademicProfileDraft,
  getAcademicProfileDraft,
  clearAcademicProfileDraft,
  saveStrategicProfile,
  getStrategicProfile,
  clearStrategicProfile,
  saveOnboardingDraft,
  getOnboardingDraft,
  clearOnboardingDraft,
  purgeLegacyGlobalStorage,
  purgeUserScopedStorage,
  purgeUserAndLegacyStorage,
  ONBOARDING_DRAFT_KEY,
  STRATEGIC_PROFILE_KEY,
  REGISTRATION_DRAFT_KEY,
  ACADEMIC_PROFILE_DRAFT_KEY,
  GUEST_DRAFT_KEY,
} = profileModule;

const { StudentRepository } = studentRepoModule;
const { StudentService } = studentServiceModule;

const results = {};
const UUID_A = "11111111-aaaa-bbbb-cccc-111111111111";
const UUID_B = "22222222-bbbb-cccc-dddd-222222222222";

// -------------------------------------------------------------
// Test 1: NEW_SIGNUP_CLEAN_SLATE
// -------------------------------------------------------------
try {
  localStorage.clear();
  // Simulate stale browser state left over from previous usage
  localStorage.setItem(REGISTRATION_DRAFT_KEY, JSON.stringify({ firstName: "Stale", streamId: "gestion_eco" }));
  localStorage.setItem(GUEST_DRAFT_KEY, JSON.stringify({ streamId: "gestion_eco" }));

  // New signup action occurs for UUID_B: purge is executed
  purgeUserAndLegacyStorage(UUID_B);

  // New account must have zero drafts and null profile
  const regDraft = getRegistrationDraft(UUID_B);
  const acadDraft = getAcademicProfileDraft(UUID_B);
  const profile = getStrategicProfile(UUID_B);

  assert.strictEqual(regDraft, null, "New user registration draft must be null");
  assert.strictEqual(acadDraft, null, "New user academic draft must be null");
  assert.strictEqual(profile, null, "New user profile draft must be null");

  results["NEW_SIGNUP_CLEAN_SLATE"] = "PASS";
  console.log("✔ NEW_SIGNUP_CLEAN_SLATE: PASS");
} catch (e) {
  results["NEW_SIGNUP_CLEAN_SLATE"] = "FAIL: " + e.message;
  console.error("✖ NEW_SIGNUP_CLEAN_SLATE: FAIL", e);
}

// -------------------------------------------------------------
// Test 2: NO_CROSS_ACCOUNT_LOCAL_STORAGE
// -------------------------------------------------------------
try {
  localStorage.clear();
  // User A writes their registration draft
  saveRegistrationDraft(
    {
      firstName: "Student A",
      lastName: "Alpha",
      studentPhone: "0551111111",
      streamId: "gestion_eco",
      registrationCompletedAt: new Date().toISOString(),
    },
    UUID_A
  );

  // User B tries to fetch registration draft
  const draftB = getRegistrationDraft(UUID_B);
  assert.strictEqual(draftB, null, "User B must NOT read User A registration draft");

  // User A reads their own draft
  const draftA = getRegistrationDraft(UUID_A);
  assert.strictEqual(draftA?.firstName, "Student A");
  assert.strictEqual(draftA?.streamId, "gestion_eco");

  results["NO_CROSS_ACCOUNT_LOCAL_STORAGE"] = "PASS";
  console.log("✔ NO_CROSS_ACCOUNT_LOCAL_STORAGE: PASS");
} catch (e) {
  results["NO_CROSS_ACCOUNT_LOCAL_STORAGE"] = "FAIL: " + e.message;
  console.error("✖ NO_CROSS_ACCOUNT_LOCAL_STORAGE: FAIL", e);
}

// -------------------------------------------------------------
// Test 3: NO_GLOBAL_AUTHENTICATED_DRAFT
// -------------------------------------------------------------
try {
  localStorage.clear();
  // Calling save without userId must be a no-op
  saveRegistrationDraft({ firstName: "Global Attempt" });
  saveAcademicProfileDraft({ targetScore: 19.5 });
  saveStrategicProfile({ id: "profile_123", streamId: "math", targetScore: 18 });

  assert.strictEqual(localStorage.getItem(REGISTRATION_DRAFT_KEY), null, "Global registration key must not exist");
  assert.strictEqual(localStorage.getItem(ACADEMIC_PROFILE_DRAFT_KEY), null, "Global academic key must not exist");
  assert.strictEqual(localStorage.getItem(STRATEGIC_PROFILE_KEY), null, "Global strategic profile key must not exist");

  // Calling getters without userId must return null
  assert.strictEqual(getRegistrationDraft(), null);
  assert.strictEqual(getAcademicProfileDraft(), null);
  assert.strictEqual(getStrategicProfile(), null);

  results["NO_GLOBAL_AUTHENTICATED_DRAFT"] = "PASS";
  console.log("✔ NO_GLOBAL_AUTHENTICATED_DRAFT: PASS");
} catch (e) {
  results["NO_GLOBAL_AUTHENTICATED_DRAFT"] = "FAIL: " + e.message;
  console.error("✖ NO_GLOBAL_AUTHENTICATED_DRAFT: FAIL", e);
}

// -------------------------------------------------------------
// Test 4: NO_BLIND_SIGNUP_MIGRATION
// -------------------------------------------------------------
try {
  localStorage.clear();
  // Guest onboarding draft is present
  saveOnboardingDraft({ streamId: "lettres_philo", targetScore: 15.0 });
  assert.notStrictEqual(localStorage.getItem(GUEST_DRAFT_KEY), null);

  // Attempt migration on newly registered account UUID_B
  const migrated = await StudentService.handleAuthSessionMigration(UUID_B);
  assert.strictEqual(migrated, null, "handleAuthSessionMigration must return null and not migrate guest state");

  // Verify StudentRepository has not acquired the guest stream
  const profileB = await StudentRepository.getProfile(UUID_B);
  assert.strictEqual(profileB, null, "User B must not have any profile fabricated from guest state");

  results["NO_BLIND_SIGNUP_MIGRATION"] = "PASS";
  console.log("✔ NO_BLIND_SIGNUP_MIGRATION: PASS");
} catch (e) {
  results["NO_BLIND_SIGNUP_MIGRATION"] = "FAIL: " + e.message;
  console.error("✖ NO_BLIND_SIGNUP_MIGRATION: FAIL", e);
}

// -------------------------------------------------------------
// Test 5: SIGNOUT_STATE_PURGE
// -------------------------------------------------------------
try {
  localStorage.clear();
  // Set up User A scoped state
  saveRegistrationDraft({ firstName: "User A" }, UUID_A);
  saveAcademicProfileDraft({ targetScore: 16 }, UUID_A);
  saveStrategicProfile({ id: UUID_A, streamId: "sciences_exp", targetScore: 16 }, UUID_A);

  // Set up User B scoped state
  saveRegistrationDraft({ firstName: "User B" }, UUID_B);

  // Set legacy global keys
  localStorage.setItem(REGISTRATION_DRAFT_KEY, "legacy_polluted");
  localStorage.setItem("bac_mastery_student_profile", "legacy_profile");

  // Execute signout purge for User A
  purgeUserScopedStorage(UUID_A);
  purgeLegacyGlobalStorage();

  // Assert User A state is purged
  assert.strictEqual(getRegistrationDraft(UUID_A), null, "User A registration draft must be purged");
  assert.strictEqual(getAcademicProfileDraft(UUID_A), null, "User A academic draft must be purged");
  assert.strictEqual(getStrategicProfile(UUID_A), null, "User A strategic profile must be purged");

  // Assert legacy global keys are purged
  assert.strictEqual(localStorage.getItem(REGISTRATION_DRAFT_KEY), null, "Legacy registration draft must be purged");
  assert.strictEqual(localStorage.getItem("bac_mastery_student_profile"), null, "Legacy student profile must be purged");

  // Assert User B's scoped storage was NOT accidentally touched
  const userBDraft = getRegistrationDraft(UUID_B);
  assert.strictEqual(userBDraft?.firstName, "User B", "User B storage must be preserved");

  results["SIGNOUT_STATE_PURGE"] = "PASS";
  console.log("✔ SIGNOUT_STATE_PURGE: PASS");
} catch (e) {
  results["SIGNOUT_STATE_PURGE"] = "FAIL: " + e.message;
  console.error("✖ SIGNOUT_STATE_PURGE: FAIL", e);
}

// -------------------------------------------------------------
// Test 6: PROFILE_ID_EQUALS_AUTH_UID
// -------------------------------------------------------------
try {
  localStorage.clear();
  await StudentRepository.saveProfile(
    {
      id: UUID_A,
      educationLevel: "secondary",
      examType: "BAC",
      streamId: "sciences_exp",
      targetScore: 17.5,
      subjectEstimates: {},
      availableTime: "12_to_18",
      studyEnergy: "normal",
      createdAt: new Date().toISOString(),
    },
    UUID_A
  );

  const fetched = await StudentRepository.getProfile(UUID_A);
  assert.strictEqual(fetched?.id, UUID_A, "Profile ID must strictly equal auth.users.id");

  results["PROFILE_ID_EQUALS_AUTH_UID"] = "PASS";
  console.log("✔ PROFILE_ID_EQUALS_AUTH_UID: PASS");
} catch (e) {
  results["PROFILE_ID_EQUALS_AUTH_UID"] = "FAIL: " + e.message;
  console.error("✖ PROFILE_ID_EQUALS_AUTH_UID: FAIL", e);
}

// -------------------------------------------------------------
// Test 7: PHONE_NOT_IDENTITY
// -------------------------------------------------------------
try {
  localStorage.clear();
  // Save registration with initial phone
  await StudentRepository.saveRegistrationData(
    {
      characterId: "scholar",
      firstName: "Fatima",
      lastName: "Zohra",
      studentPhone: "0551234567",
      studentStatus: "schooled",
      streamId: "math",
      wilayaCode: "16",
      wilayaName: "Alger",
      communeCode: "1601",
      communeName: "Alger Centre",
      schoolName: "Lycée Emir Abdelkader",
      registrationCompletedAt: new Date().toISOString(),
    },
    UUID_A
  );

  // Update phone to a different number
  await StudentRepository.saveRegistrationData(
    {
      characterId: "scholar",
      firstName: "Fatima",
      lastName: "Zohra",
      studentPhone: "0770987654",
      studentStatus: "schooled",
      streamId: "math",
      wilayaCode: "16",
      wilayaName: "Alger",
      communeCode: "1601",
      communeName: "Alger Centre",
      schoolName: "Lycée Emir Abdelkader",
      registrationCompletedAt: new Date().toISOString(),
    },
    UUID_A
  );

  const profileAfterPhoneChange = await StudentRepository.getProfile(UUID_A);
  assert.strictEqual(profileAfterPhoneChange?.id, UUID_A, "Account identity must remain UUID_A regardless of phone update");
  assert.strictEqual(profileAfterPhoneChange?.studentPhone, "0770987654", "Phone is merely mutable profile data");

  results["PHONE_NOT_IDENTITY"] = "PASS";
  console.log("✔ PHONE_NOT_IDENTITY: PASS");
} catch (e) {
  results["PHONE_NOT_IDENTITY"] = "FAIL: " + e.message;
  console.error("✖ PHONE_NOT_IDENTITY: FAIL", e);
}

// -------------------------------------------------------------
// Test 8: SAME_PHONE_ACCOUNTS_ISOLATED
// -------------------------------------------------------------
try {
  localStorage.clear();
  const sharedPhone = "0550000000";

  // Register Account A with shared phone
  await StudentRepository.saveRegistrationData(
    {
      characterId: "scholar",
      firstName: "User A",
      lastName: "Alpha",
      studentPhone: sharedPhone,
      studentStatus: "schooled",
      streamId: "gestion_eco",
      wilayaCode: "31",
      wilayaName: "Oran",
      communeCode: "3101",
      communeName: "Oran",
      schoolName: "Lycée Pasteur",
      registrationCompletedAt: new Date().toISOString(),
    },
    UUID_A
  );

  // Register Account B with EXACT SAME shared phone
  await StudentRepository.saveRegistrationData(
    {
      characterId: "girl",
      firstName: "User B",
      lastName: "Beta",
      studentPhone: sharedPhone,
      studentStatus: "free",
      streamId: "sciences_exp",
      wilayaCode: "16",
      wilayaName: "Alger",
      communeCode: "1601",
      communeName: "Alger Centre",
      schoolName: null,
      registrationCompletedAt: new Date().toISOString(),
    },
    UUID_B
  );

  const profileA = await StudentRepository.getProfile(UUID_A);
  const profileB = await StudentRepository.getProfile(UUID_B);

  assert.strictEqual(profileA?.id, UUID_A, "Account A has UUID_A");
  assert.strictEqual(profileB?.id, UUID_B, "Account B has UUID_B");
  assert.strictEqual(profileA?.firstName, "User A");
  assert.strictEqual(profileB?.firstName, "User B");
  assert.strictEqual(profileA?.streamId, "gestion_eco");
  assert.strictEqual(profileB?.streamId, "sciences_exp");
  assert.strictEqual(profileA?.studentStatus, "schooled");
  assert.strictEqual(profileB?.studentStatus, "free");

  results["SAME_PHONE_ACCOUNTS_ISOLATED"] = "PASS";
  console.log("✔ SAME_PHONE_ACCOUNTS_ISOLATED: PASS");
} catch (e) {
  results["SAME_PHONE_ACCOUNTS_ISOLATED"] = "FAIL: " + e.message;
  console.error("✖ SAME_PHONE_ACCOUNTS_ISOLATED: FAIL", e);
}

// -------------------------------------------------------------
// Test 9: REGISTRATION_GATE_ISOLATED
// -------------------------------------------------------------
try {
  localStorage.clear();
  StudentRepository.clearMemoryCache();
  // Account A completed registration
  saveRegistrationDraft(
    {
      firstName: "Done User A",
      streamId: "math",
      registrationCompletedAt: "2026-09-13T10:00:00.000Z",
    },
    UUID_A
  );

  // Account B has NOT completed registration
  // Simulate gate check for Account B
  const pB = await StudentRepository.getProfile(UUID_B);
  const regDraftB = getRegistrationDraft(UUID_B);

  const isRegisteredB = Boolean(
    pB?.registrationCompletedAt ||
    pB?.registration_completed_at ||
    (pB?.firstName && pB?.streamId) ||
    (regDraftB?.registrationCompletedAt && (regDraftB?.firstName || regDraftB?.streamId))
  );

  assert.strictEqual(isRegisteredB, false, "Registration gate must evaluate to false for fresh Account B");

  results["REGISTRATION_GATE_ISOLATED"] = "PASS";
  console.log("✔ REGISTRATION_GATE_ISOLATED: PASS");
} catch (e) {
  results["REGISTRATION_GATE_ISOLATED"] = "FAIL: " + e.message;
  console.error("✖ REGISTRATION_GATE_ISOLATED: FAIL", e);
}

// -------------------------------------------------------------
// Test 10: FORM_HYDRATION_ISOLATED
// -------------------------------------------------------------
try {
  localStorage.clear();
  // Account A saved draft with specific form values
  saveRegistrationDraft(
    {
      firstName: "Mohamed",
      lastName: "Amine",
      studentPhone: "0661223344",
      streamId: "technique_math",
      techniqueMathSpecialty: "mechanical",
      wilayaCode: "25",
      wilayaName: "Constantine",
    },
    UUID_A
  );

  // Account B opens registration form: hydrator calls getRegistrationDraft(UUID_B)
  const hydratedB = getRegistrationDraft(UUID_B);
  assert.strictEqual(hydratedB, null, "Account B must receive null/empty draft on form mount");

  results["FORM_HYDRATION_ISOLATED"] = "PASS";
  console.log("✔ FORM_HYDRATION_ISOLATED: PASS");
} catch (e) {
  results["FORM_HYDRATION_ISOLATED"] = "FAIL: " + e.message;
  console.error("✖ FORM_HYDRATION_ISOLATED: FAIL", e);
}

// -------------------------------------------------------------
// Test 11: CLOUD_RLS_ISOLATION
// -------------------------------------------------------------
try {
  // Missing auth ID cannot resolve any profile
  const emptyFetch = await StudentRepository.getProfile();
  assert.strictEqual(emptyFetch, null, "Missing auth ID cannot resolve any profile");

  let errorThrown = false;
  try {
    await StudentRepository.saveRegistrationData({ firstName: "Hack" });
  } catch (err) {
    errorThrown = true;
  }
  assert.strictEqual(errorThrown, true, "Saving without authenticated userId must throw Error");

  results["CLOUD_RLS_ISOLATION"] = "PASS";
  console.log("✔ CLOUD_RLS_ISOLATION: PASS");
} catch (e) {
  results["CLOUD_RLS_ISOLATION"] = "FAIL: " + e.message;
  console.error("✖ CLOUD_RLS_ISOLATION: FAIL", e);
}

console.log("\n=======================================================");
console.log("AUDIT ASSERTION SUMMARY");
console.log("=======================================================");
let allPass = true;
for (const [k, v] of Object.entries(results)) {
  console.log(`${k} = ${v}`);
  if (v !== "PASS") allPass = false;
}

if (!allPass) {
  console.error("\nONE OR MORE SECURITY ASSERTIONS FAILED.");
  process.exit(1);
} else {
  console.log("\nALL 11 SECURITY ASSERTIONS PASSED WITH ZERO CONTAMINATION.");
  process.exit(0);
}
