/**
 * BAC Mastery — Automated Verification Script: Curriculum Routing & Stream Isolation
 * 
 * Verifies Definition of Done for Step 02:
 * 1. Stream aliases normalize accurately to canonical StreamId.
 * 2. Gestion & Économie has strict, 100% isolation from Natural Sciences and Physics.
 * 3. Math stream isolates Natural Sciences from its core specialty curriculum.
 * 4. Default subjects and skills match respective streams without cross-stream contamination.
 * 5. Stream metadata delivers exact Algerian BAC subjects and counts.
 */

import {
  normalizeStreamId,
  normalizeStreamIdWithDefault,
  getAuthorizedSubjectsForStream,
  isSubjectAuthorizedForStream,
  getDefaultSubjectForStream,
  getDefaultSkillForStream,
  getStreamMetadata,
} from "../src/lib/curriculum/filter";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`❌ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
    failedCount++;
  }
}

console.log("=== STEP 02: CURRICULUM ROUTING & STREAM ISOLATION AUDIT ===\n");

// 1. ALIAS NORMALIZATION
console.log("--- 1. Stream Alias Normalization ---");
const gestionAliases = ["management", "gestion", "gestion_eco", "gestion_economie", "تسيير واقتصاد", "GE", "ge"];
for (const alias of gestionAliases) {
  assert(
    normalizeStreamId(alias) === "gestion_eco",
    `Alias "${alias}" normalizes to "gestion_eco"`
  );
}

const scienceAliases = ["sciences_exp", "sciences", "science", "experimental_sciences", "علوم تجريبية", "SE", "se"];
for (const alias of scienceAliases) {
  assert(
    normalizeStreamId(alias) === "sciences_exp",
    `Alias "${alias}" normalizes to "sciences_exp"`
  );
}

const mathAliases = ["math", "maths", "mathematics", "رياضيات", "M", "m"];
for (const alias of mathAliases) {
  assert(
    normalizeStreamId(alias) === "math",
    `Alias "${alias}" normalizes to "math"`
  );
}

assert(normalizeStreamId(null) === null, "null returns null");
assert(normalizeStreamId(undefined) === null, "undefined returns null");
assert(normalizeStreamIdWithDefault(null, "sciences_exp") === "sciences_exp", "null fallback works");

// 2. GESTION & ÉCONOMIE STRICT SUBJECT ISOLATION
console.log("\n--- 2. Gestion & Économie Strict Isolation ---");
const gestionSubjects = getAuthorizedSubjectsForStream("management");
assert(
  !gestionSubjects.includes("natural_sciences" as any),
  "Gestion & Économie NEVER includes 'natural_sciences'"
);
assert(
  !gestionSubjects.includes("physics" as any),
  "Gestion & Économie NEVER includes 'physics'"
);
assert(
  gestionSubjects.includes("accounting_finance"),
  "Gestion & Économie includes 'accounting_finance'"
);
assert(
  gestionSubjects.includes("economics_management"),
  "Gestion & Économie includes 'economics_management'"
);
assert(
  gestionSubjects.includes("law"),
  "Gestion & Économie includes 'law'"
);
assert(
  gestionSubjects.includes("math"),
  "Gestion & Économie includes 'math'"
);

// Strict Boolean Guards
assert(
  isSubjectAuthorizedForStream("natural_sciences", "management") === false,
  "isSubjectAuthorizedForStream('natural_sciences', 'management') is false"
);
assert(
  isSubjectAuthorizedForStream("physics", "management") === false,
  "isSubjectAuthorizedForStream('physics', 'management') is false"
);
assert(
  isSubjectAuthorizedForStream("science", "gestion") === false,
  "isSubjectAuthorizedForStream('science', 'gestion') is false"
);
assert(
  isSubjectAuthorizedForStream("accounting_finance", "management") === true,
  "isSubjectAuthorizedForStream('accounting_finance', 'management') is true"
);
assert(
  isSubjectAuthorizedForStream("economics_management", "gestion_eco") === true,
  "isSubjectAuthorizedForStream('economics_management', 'gestion_eco') is true"
);
assert(
  isSubjectAuthorizedForStream("law", "management") === true,
  "isSubjectAuthorizedForStream('law', 'management') is true"
);

// 3. MATHÉMATIQUES STREAM ISOLATION
console.log("\n--- 3. Mathématiques Stream Isolation ---");
const mathSubjects = getAuthorizedSubjectsForStream("mathematics");
assert(
  !mathSubjects.includes("natural_sciences" as any),
  "Math stream NEVER includes 'natural_sciences'"
);
assert(
  mathSubjects.includes("math"),
  "Math stream includes 'math'"
);
assert(
  mathSubjects.includes("physics"),
  "Math stream includes 'physics'"
);
assert(
  isSubjectAuthorizedForStream("natural_sciences", "mathematics") === false,
  "isSubjectAuthorizedForStream('natural_sciences', 'mathematics') is false"
);
assert(
  isSubjectAuthorizedForStream("physics", "mathematics") === true,
  "isSubjectAuthorizedForStream('physics', 'mathematics') is true"
);

// 4. DEFAULT SUBJECTS & SKILLS
console.log("\n--- 4. Defaults & Fallbacks ---");
assert(
  getDefaultSubjectForStream("management") === "accounting_finance",
  "Default subject for 'management' is 'accounting_finance'"
);
assert(
  getDefaultSkillForStream("management") === "acc_depreciation_linear_degressive",
  "Default skill for 'management' is 'acc_depreciation_linear_degressive'"
);
assert(
  getDefaultSubjectForStream("math") === "math",
  "Default subject for 'math' is 'math'"
);
assert(
  getDefaultSubjectForStream("sciences_exp") === "natural_sciences",
  "Default subject for 'sciences_exp' is 'natural_sciences'"
);

// 5. DASHBOARD METADATA
console.log("\n--- 5. Dashboard Stream Metadata ---");
const gestionMeta = getStreamMetadata("management");
assert(
  gestionMeta.name_ar === "شعبة التسيير والاقتصاد",
  "Stream metadata name_ar is 'شعبة التسيير والاقتصاد'"
);
assert(
  gestionMeta.totalSkills === 33,
  "Stream metadata totalSkills is 33 for Gestion"
);
const hasSnvInMeta = gestionMeta.subjects.some(
  (s) => s.subjectId === "natural_sciences" || s.name_ar.includes("طبيعة")
);
const hasPhysInMeta = gestionMeta.subjects.some(
  (s) => s.subjectId === "physics" || s.name_ar.includes("فيزيائية")
);
assert(!hasSnvInMeta, "Gestion metadata has ZERO natural sciences");
assert(!hasPhysInMeta, "Gestion metadata has ZERO physics");

console.log(`\n==================================================`);
console.log(`RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
console.log(`==================================================`);

if (failedCount > 0) {
  process.exit(1);
}
