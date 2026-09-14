import { ContentService } from "../src/lib/services/content-service";
import { getNextBestMission } from "../src/lib/roadmap/engine";
import { isSubjectAuthorizedForStream, getAuthorizedSubjectsForStream, getDefaultSkillForStream } from "../src/lib/curriculum/filter";
import { StreamId } from "../src/types/education";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function run() {
  console.log("==================================================");
  console.log("RUNNING MULTI-STREAM CURRICULUM ISOLATION AUDIT");
  console.log("==================================================");

  // 1. Audit Lettres & Philosophie Stream Isolation
  console.log("\n[TEST 1] Auditing Lettres & Philosophie Skills Isolation...");
  const lpSkills = ContentService.getSkillsForStream("lettres_philo");
  assert(lpSkills.length > 0, `Lettres & Philo has ${lpSkills.length} skills loaded`);

  const lpBannedSubjects = lpSkills.filter(
    (s) => s.subjectId === "natural_sciences" || s.subjectId === "physics"
  );
  assert(
    lpBannedSubjects.length === 0,
    `Lettres & Philo must have 0 SNV or Physics skills. Found: ${lpBannedSubjects.length}`
  );

  const lpBannedPrefixes = lpSkills.filter(
    (s) =>
      s.id.startsWith("acc_") ||
      s.id.startsWith("eco_") ||
      s.id.startsWith("law_") ||
      s.id.startsWith("phi_ge_") ||
      s.id.startsWith("snv_") ||
      s.id.startsWith("phy_")
  );
  assert(
    lpBannedPrefixes.length === 0,
    `Lettres & Philo must have 0 Gestion or Science skills. Found: ${lpBannedPrefixes.length} (${lpBannedPrefixes.map(s => s.id).join(", ")})`
  );

  const lpHasPhilo = lpSkills.some((s) => s.subjectId === "philosophy" && s.id.startsWith("phi_lp_"));
  assert(lpHasPhilo, "Lettres & Philo has official phi_lp_ philosophy skills");

  // 2. Audit Gestion & Économie Stream Isolation
  console.log("\n[TEST 2] Auditing Gestion & Économie Skills Isolation...");
  const geSkills = ContentService.getSkillsForStream("gestion_eco");
  assert(geSkills.length > 0, `Gestion & Eco has ${geSkills.length} skills loaded`);

  const geBannedSubjects = geSkills.filter(
    (s) => s.subjectId === "natural_sciences" || s.subjectId === "physics"
  );
  assert(
    geBannedSubjects.length === 0,
    `Gestion & Eco must have 0 SNV or Physics skills. Found: ${geBannedSubjects.length}`
  );

  const geBannedPrefixes = geSkills.filter(
    (s) =>
      s.id.startsWith("phi_lp_") ||
      s.id.startsWith("ar_lp_") ||
      s.id.startsWith("snv_") ||
      s.id.startsWith("phy_")
  );
  assert(
    geBannedPrefixes.length === 0,
    `Gestion & Eco must have 0 Lettres or Sciences skills. Found: ${geBannedPrefixes.length}`
  );

  // 3. Audit Sciences Expérimentales Stream Isolation
  console.log("\n[TEST 3] Auditing Sciences Expérimentales Skills Isolation...");
  const seSkills = ContentService.getSkillsForStream("sciences_exp");
  assert(seSkills.length > 0, `Sciences Exp has ${seSkills.length} skills loaded`);

  const seBannedPrefixes = seSkills.filter(
    (s) =>
      s.id.startsWith("acc_") ||
      s.id.startsWith("eco_") ||
      s.id.startsWith("law_") ||
      s.id.startsWith("phi_ge_") ||
      s.id.startsWith("phi_lp_")
  );
  assert(
    seBannedPrefixes.length === 0,
    `Sciences Exp must have 0 Gestion or Lettres skills. Found: ${seBannedPrefixes.length}`
  );

  // 4. Audit Mission Generation for Fresh Lettres & Philosophie Student
  console.log("\n[TEST 4] Testing getNextBestMission for Lettres & Philosophie Student...");
  const lpMissionResult = getNextBestMission({
    onboardingProfile: {
      streamId: "lettres_philo",
      stream: "lettres_philo",
      targetScore: 16.0,
      studyEnergy: "normal",
      studyTime: "standard",
    } as any,
    diagnosticResult: null,
    missions: {},
    masteryEvidence: {},
    errors: [],
  });

  assert(lpMissionResult.mission !== null, "Mission generated for fresh Lettres & Philo student");
  const mission = lpMissionResult.mission!;
  console.log(`Generated Mission Title: "${mission.title_ar}"`);
  console.log(`Mission Subject: "${mission.subjectId}", SkillId: "${mission.skillId}"`);

  assert(
    mission.subjectId === "philosophy" || mission.subjectId === "arabic",
    `Mission subject must be Philosophy or Arabic (coef 6). Got: ${mission.subjectId}`
  );
  assert(
    !mission.title_ar.includes("لشعبة التسيير"),
    "Mission title must NOT contain 'لشعبة التسيير'"
  );
  assert(
    !mission.title_ar.includes("علوم الطبيعة"),
    "Mission title must NOT contain 'علوم الطبيعة'"
  );
  assert(
    mission.skillId.startsWith("phi_lp_") || mission.skillId.startsWith("ar_lp_"),
    `Mission skillId must be an official Lettres & Philo skill. Got: ${mission.skillId}`
  );

  // 5. Audit Mission Generation for Fresh Gestion & Économie Student
  console.log("\n[TEST 5] Testing getNextBestMission for Gestion & Économie Student...");
  const geMissionResult = getNextBestMission({
    onboardingProfile: {
      streamId: "gestion_eco",
      stream: "gestion_eco",
      targetScore: 16.0,
      studyEnergy: "normal",
      studyTime: "standard",
    } as any,
    diagnosticResult: null,
    missions: {},
    masteryEvidence: {},
    errors: [],
  });

  assert(geMissionResult.mission !== null, "Mission generated for fresh Gestion student");
  const geMission = geMissionResult.mission!;
  console.log(`Generated Mission Title: "${geMission.title_ar}"`);
  console.log(`Mission Subject: "${geMission.subjectId}", SkillId: "${geMission.skillId}"`);

  assert(
    geMission.subjectId === "accounting_finance" || geMission.subjectId === "economics_management",
    `Mission subject must be Accounting or Economics. Got: ${geMission.subjectId}`
  );
  assert(
    geMission.subjectId !== "natural_sciences" && geMission.subjectId !== "physics",
    "Gestion student mission is NOT science"
  );

  // 6. Audit Subject Authorization Rules
  console.log("\n[TEST 6] Testing isSubjectAuthorizedForStream across all 6 streams...");
  assert(
    !isSubjectAuthorizedForStream("natural_sciences", "lettres_philo"),
    "SNV is strictly forbidden for lettres_philo"
  );
  assert(
    !isSubjectAuthorizedForStream("physics", "lettres_philo"),
    "Physics is strictly forbidden for lettres_philo"
  );
  assert(
    !isSubjectAuthorizedForStream("natural_sciences", "gestion_eco"),
    "SNV is strictly forbidden for gestion_eco"
  );
  assert(
    !isSubjectAuthorizedForStream("physics", "gestion_eco"),
    "Physics is strictly forbidden for gestion_eco"
  );
  assert(
    !isSubjectAuthorizedForStream("natural_sciences", "math"),
    "SNV is strictly forbidden for math stream"
  );
  assert(
    isSubjectAuthorizedForStream("natural_sciences", "sciences_exp"),
    "SNV is authorized for sciences_exp"
  );
  assert(
    isSubjectAuthorizedForStream("philosophy", "lettres_philo"),
    "Philosophy is authorized for lettres_philo"
  );

  console.log("\n==================================================");
  console.log("🎉 ALL STREAM ISOLATION AUDITS PASSED WITH ZERO LEAKAGE!");
  console.log("==================================================");
}

run().catch((err) => {
  console.error("Audit error:", err);
  process.exit(1);
});
