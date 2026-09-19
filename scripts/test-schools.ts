/**
 * Automated Verification Script: High School Selection and Verification System
 * Run with: npx tsx scripts/test-schools.ts
 */

import { normalizeSchoolName, areSchoolNamesEquivalent } from "../src/domain/administrative/school-normalization";
import { SchoolService } from "../src/lib/services/school-service";
import { CURATED_OFFICIAL_HIGH_SCHOOLS } from "../src/data/schools";
import {
  getAlgerianWilayas,
  ALGERIAN_COMMUNES,
  getCommunesByWilayaCode,
  getWilayaByCode,
} from "../src/domain/administrative/algeria-administrative";

async function runTests() {
  console.log("================================================================================");
  console.log("SHATER HIGH SCHOOL SELECTION & VERIFICATION SYSTEM — TEST SUITE");
  console.log("================================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, details?: any) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`, details || "");
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // TEST 0: Administrative Dataset Update (69 Wilayas & 1,541 Communes)
  // -------------------------------------------------------------------------
  console.log("--- 0. Testing Updated Administrative Dataset (Wilayas & Communes) ---");
  const allWilayas = getAlgerianWilayas();
  assert(allWilayas.length === 69, `Loaded all 69 Algerian Wilayas (actual: ${allWilayas.length})`);
  assert(ALGERIAN_COMMUNES.length === 1541, `Loaded all 1,541 Algerian Communes (actual: ${ALGERIAN_COMMUNES.length})`);

  const w68 = getWilayaByCode("68");
  assert(Boolean(w68 && w68.name_ar === "بوسعادة"), "New Wilaya 68 (بوسعادة) successfully recognized");

  const w68Communes = getCommunesByWilayaCode("68");
  assert(w68Communes.length > 0, `Wilaya 68 has ${w68Communes.length} communes registered`);

  const chlefCommunes = getCommunesByWilayaCode("02");
  assert(chlefCommunes.length === 35, `Wilaya 02 (Chlef) has all 35 communes registered (actual: ${chlefCommunes.length})`);

  // -------------------------------------------------------------------------
  // TEST 1: Normalization Consistency (Arabic & French)
  // -------------------------------------------------------------------------
  console.log("--- 1. Testing School Name Normalization ---");

  const norm1 = normalizeSchoolName("ثانوية العقيد لطفي");
  assert(norm1 === "العقيد لطفي", "Strips 'ثانوية' prefix and normalizes: 'ثانوية العقيد لطفي' -> 'العقيد لطفي'", { actual: norm1 });

  const norm2 = normalizeSchoolName("Lycée Colonel Lotfi");
  assert(norm2 === "colonel lotfi", "Strips 'Lycée' prefix and lowercase: 'Lycée Colonel Lotfi' -> 'colonel lotfi'", { actual: norm2 });

  const norm3 = normalizeSchoolName("  ثانوية   أحمد   باي  ");
  assert(norm3 === "احمد باي", "Normalizes Alef [أ -> ا] and collapses spaces: 'احمد باي'", { actual: norm3 });

  const norm4 = normalizeSchoolName("ثانوية فاطمة الزهراء");
  assert(norm4 === "فاطمه الزهراء", "Normalizes Taa Marbuta [ة -> ه]: 'فاطمه الزهراء'", { actual: norm4 });

  const eq1 = areSchoolNamesEquivalent("ثانوية الأمير عبد القادر", "ثانويه الامير عبد القادر");
  assert(eq1 === true, "areSchoolNamesEquivalent detects identical schools despite Alef/Taa differences");

  const eq2 = areSchoolNamesEquivalent("Lycée Abdelhamid Ben Badis", "ثانوية عبد الحميد بن باديس");
  // They are in different languages so normalized differently
  assert(eq2 === false, "Different language names evaluate independently");

  // -------------------------------------------------------------------------
  // TEST 2: High School Search by Wilaya and Commune
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Testing High School Search ---");

  const chlefSchools = await SchoolService.searchSchools({
    wilaya_code: "02",
    commune_name_ar: "الشلف",
    limit: 10,
  });
  assert(chlefSchools.schools.length > 0, `Found ${chlefSchools.schools.length} schools in Chlef / Chlef`);
  assert(
    chlefSchools.schools.every((s) => s.wilaya_code === "02" && s.commune_name_ar === "الشلف"),
    "All returned schools belong strictly to Wilaya 02 and Commune الشلف"
  );

  // Search with query filter
  const queryResult = await SchoolService.searchSchools({
    wilaya_code: "02",
    commune_name_ar: "الشلف",
    query: "لطفي",
  });
  assert(
    queryResult.schools.some((s) => s.name.includes("لطفي")),
    "Search with query 'لطفي' matches 'ثانوية العقيد لطفي'"
  );

  // Commune isolation: Search in a different commune should not return schools from Chlef
  const ouedFoddaSchools = await SchoolService.searchSchools({
    wilaya_code: "02",
    commune_name_ar: "وادي الفضة",
  });
  assert(
    ouedFoddaSchools.schools.every((s) => s.commune_name_ar === "وادي الفضة"),
    "Commune isolation: Oued Fodda schools only contain Oued Fodda"
  );
  assert(
    !ouedFoddaSchools.schools.some((s) => s.name === "ثانوية السلام"),
    "Commune isolation: 'ثانوية السلام' (Chlef) does not appear in Oued Fodda"
  );

  // -------------------------------------------------------------------------
  // TEST 3: Duplicate Protection & Unlisted School Submission
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Testing Duplicate Protection & Submission Isolation ---");

  // 3.1 Duplicate check for existing official school
  const dupOfficial = await SchoolService.checkDuplicate("ثانوية السلام", "02", "الشلف");
  assert(dupOfficial.existsInOfficial === true, "Detects duplicate of official verified school ('ثانوية السلام')");

  // Attempting to submit an existing official school
  const submitDupOfficial = await SchoolService.submitSchool({
    proposed_name: "ثانوية السلام",
    wilaya_code: "02",
    wilaya_name_ar: "الشلف",
    commune_name_ar: "الشلف",
  });
  assert(submitDupOfficial.success === false, "Rejects submission of existing official school");
  assert(
    submitDupOfficial.error === "الثانوية موجودة بالفعل، ابحث عنها في القائمة.",
    "Returns exact expected message: 'الثانوية موجودة بالفعل، ابحث عنها في القائمة.'"
  );

  // 3.2 Submit a genuine unlisted school
  const uniqueName = `ثانوية الشهيد رابح_${Date.now()}`;
  const initialOfficialCount = CURATED_OFFICIAL_HIGH_SCHOOLS.length;

  const submitNew = await SchoolService.submitSchool({
    proposed_name: uniqueName,
    wilaya_code: "02",
    wilaya_name_ar: "الشلف",
    commune_name_ar: "الشلف",
  });
  assert(submitNew.success === true, "Submits unlisted school successfully");
  assert(submitNew.submission?.status === "pending", "New submission enters with status 'pending'");
  assert(
    CURATED_OFFICIAL_HIGH_SCHOOLS.length === initialOfficialCount,
    "Strict Isolation: Pending submission DOES NOT enter official high_schools directory"
  );

  // 3.3 Submit the same pending school again (should be caught by duplicate check)
  const submitDupPending = await SchoolService.submitSchool({
    proposed_name: uniqueName,
    wilaya_code: "02",
    wilaya_name_ar: "الشلف",
    commune_name_ar: "الشلف",
  });
  assert(submitDupPending.success === false, "Rejects duplicate submission for already pending school");
  assert(
    submitDupPending.error === "هذه الثانوية قيد المراجعة حالياً.",
    "Returns exact expected message: 'هذه الثانوية قيد المراجعة حالياً.'"
  );

  // -------------------------------------------------------------------------
  // TEST 4: Operations Review Workflow (Approve, Reject, Duplicate)
  // -------------------------------------------------------------------------
  console.log("\n--- 4. Testing Operations Review (Approve / Reject / Duplicate) ---");

  const pendingSubId = submitNew.submission!.id;

  // 4.1 Approve submission
  const approveResult = await SchoolService.approveSubmission(pendingSubId, "admin-user-001");
  assert(approveResult.success === true, "Admin approves submission successfully");

  // Verify that the school is now in the official list and searchable!
  const searchAfterApproval = await SchoolService.searchSchools({
    wilaya_code: "02",
    commune_name_ar: "الشلف",
    query: uniqueName,
  });
  assert(
    searchAfterApproval.schools.some((s) => s.name === uniqueName && s.is_verified === true),
    "Approved school is now verified and searchable by students"
  );

  // 4.2 Submit another unlisted school for rejection test
  const rejectTestName = `ثانوية اختبارية للرفض_${Date.now()}`;
  const submitForReject = await SchoolService.submitSchool({
    proposed_name: rejectTestName,
    wilaya_code: "02",
    wilaya_name_ar: "الشلف",
    commune_name_ar: "الشلف",
  });
  assert(submitForReject.success === true, "Created test submission for rejection");

  const rejectResult = await SchoolService.rejectSubmission(
    submitForReject.submission!.id,
    "admin-user-001",
    "الاسم غير دقيق أو غير تابع للمنظومة الرسمية"
  );
  assert(rejectResult.success === true, "Admin rejects submission with note");

  // 4.3 Submit another for duplicate mark test
  const dupMarkTestName = `ثانوية اختبارية مكررة_${Date.now()}`;
  const submitForDupMark = await SchoolService.submitSchool({
    proposed_name: dupMarkTestName,
    wilaya_code: "02",
    wilaya_name_ar: "الشلف",
    commune_name_ar: "الشلف",
  });
  assert(submitForDupMark.success === true, "Created test submission for duplicate mark");

  const dupResult = await SchoolService.markAsDuplicate(
    submitForDupMark.submission!.id,
    "admin-user-001",
    "مكررة مع ثانوية السلام"
  );
  assert(dupResult.success === true, "Admin marks submission as duplicate");

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("================================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
