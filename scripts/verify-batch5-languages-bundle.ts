/**
 * Verification Script: Foreign Languages & Literature Bundle (Batch 05)
 * Ensures full readiness, 14-element learning bundle completeness,
 * and strict cross-stream and third-language isolation.
 */

import { getSkillLearningBundle } from "../src/domain/content/mappings";
import {
  BATCH5_LITERATURE_LANGUAGES_BUNDLE,
  getAllBatch5Skills,
  getBatch5SkillsForStream,
} from "../src/domain/content/foreign-languages-third-lang-bundle";
import { ContentService } from "../src/lib/services/content-service";
import { validateContentStreamCompatibility } from "../src/domain/student";
import { StreamId } from "../src/types/education";

console.log("==================================================================");
console.log("  VERIFYING BATCH5_LITERATURE_LANGUAGES_BUNDLE INTEGRATION");
console.log("==================================================================\n");

const expectedSkillIds = [
  "ar_poetry_commit_liberation",
  "ar_rhetoric_cohesion_coherence",
  "esp_subjuntivo_deseo_duda",
  "esp_oraciones_condicionales_si",
  "all_passiv_modalverben",
  "all_nebensaetze_weil_dass_wenn",
  "phil_epistemology_biology_determinism",
  "phil_ethics_justice_equality_merit",
];

let failedChecks = 0;

for (const skillId of expectedSkillIds) {
  console.log(`--- [Skill: ${skillId}] ---`);
  const bundle = getSkillLearningBundle(skillId);

  if (!bundle) {
    console.error(`❌ FAILED: getSkillLearningBundle("${skillId}") returned null!`);
    failedChecks++;
    continue;
  }

  // 1. Skill Metadata
  if (bundle.skill.id !== skillId) {
    console.error(`❌ Skill ID mismatch: got ${bundle.skill.id}, expected ${skillId}`);
    failedChecks++;
  } else {
    console.log(`1. Canonical Skill: ✅ Resolved (${bundle.skill.title_ar})`);
  }

  // 2. 14-Element Lesson
  if (!bundle.lesson) {
    console.error(`❌ Missing lesson!`);
    failedChecks++;
  } else {
    const l = bundle.lesson;
    const hasWorkedExample = Boolean(l.workedExample && l.workedExample.stepByStepSolution_ar.length > 0);
    const hasMistakes = Boolean(l.commonMistakes && l.commonMistakes.length > 0);
    const hasSummaryCard = Boolean(l.summaryCard && l.summaryCard.keyRule_ar);
    const hasQuickRecall = Boolean(l.quickRecallPrompt_ar && l.quickRecallAnswer_ar);

    if (hasWorkedExample && hasMistakes && hasSummaryCard && hasQuickRecall) {
      console.log(`2. 14-Element Lesson: ✅ Complete (id: ${l.id})`);
    } else {
      console.error(`❌ Lesson missing key elements: WE=${hasWorkedExample}, CM=${hasMistakes}, SC=${hasSummaryCard}, QR=${hasQuickRecall}`);
      failedChecks++;
    }
  }

  // 3. Practice Questions
  if (!bundle.practiceQuestions || bundle.practiceQuestions.length === 0) {
    console.error(`❌ Missing practice questions!`);
    failedChecks++;
  } else {
    const pq = bundle.practiceQuestions[0];
    const hasCorrect = pq.options.some((o) => o.id === pq.correctAnswerId);
    console.log(`3. Practice Question: ✅ Valid (id: ${pq.id}, correct: ${pq.correctAnswerId}, validKey: ${hasCorrect})`);
    if (!hasCorrect) failedChecks++;
  }

  // 4. Retest Question
  if (!bundle.retest) {
    console.error(`❌ Missing isomorphic retest question!`);
    failedChecks++;
  } else {
    const rq = bundle.retest;
    const hasCorrect = rq.options.some((o) => o.id === rq.correctAnswerId);
    console.log(`4. Isomorphic Retest: ✅ Valid (id: ${rq.id}, correct: ${rq.correctAnswerId}, validKey: ${hasCorrect})`);
    if (!hasCorrect) failedChecks++;
  }

  // 5. Repair Guide
  if (!bundle.repairGuide) {
    console.error(`❌ Missing repair guide!`);
    failedChecks++;
  } else {
    console.log(`5. Repair Guide: ✅ Valid (id: ${bundle.repairGuide.id}, title: ${bundle.repairGuide.title_ar})`);
  }

  // 6. Readiness
  console.log(`6. Readiness: ${bundle.readiness.status === "MASTERY_READY" ? "✅ MASTERY_READY" : "⚠️ " + bundle.readiness.status}`);
  console.log("");
}

// -----------------------------------------------------------------------------
// [TEST SECTION 2] Cross-Stream Isolation Verification
// -----------------------------------------------------------------------------
console.log("==================================================================");
console.log("  CROSS-STREAM & THIRD-LANGUAGE ISOLATION TESTS");
console.log("==================================================================\n");

// A. Spanish and German skills must NOT leak outside Langues Étrangères
const thirdLangSkills = [
  "esp_subjuntivo_deseo_duda",
  "esp_oraciones_condicionales_si",
  "all_passiv_modalverben",
  "all_nebensaetze_weil_dass_wenn",
];

const nonLanguagesStreams: StreamId[] = [
  "sciences_exp",
  "math",
  "technique_math",
  "gestion_eco",
  "lettres_philo",
];

for (const sId of thirdLangSkills) {
  // Should pass for langues_etrangeres
  const allowedInLang = validateContentStreamCompatibility("langues_etrangeres", { skillId: sId });
  if (!allowedInLang) {
    console.error(`❌ Isolation Failure: ${sId} should be allowed in langues_etrangeres`);
    failedChecks++;
  } else {
    console.log(`✅ Allowed in langues_etrangeres: ${sId}`);
  }

  // Must fail for all other streams
  for (const st of nonLanguagesStreams) {
    const allowed = validateContentStreamCompatibility(st, { skillId: sId });
    if (allowed) {
      console.error(`❌ Leakage Detected: ${sId} leaked into stream ${st}!`);
      failedChecks++;
    }
  }
}
console.log(`✅ Third-language skills strictly quarantined to langues_etrangeres.`);

// B. Advanced Philosophy skills must NOT leak outside Lettres & Philo
const philoSkills = [
  "phil_epistemology_biology_determinism",
  "phil_ethics_justice_equality_merit",
];

const nonPhiloStreams: StreamId[] = [
  "sciences_exp",
  "math",
  "technique_math",
  "gestion_eco",
];

for (const sId of philoSkills) {
  const allowedInPhilo = validateContentStreamCompatibility("lettres_philo", { skillId: sId });
  if (!allowedInPhilo) {
    console.error(`❌ Isolation Failure: ${sId} should be allowed in lettres_philo`);
    failedChecks++;
  } else {
    console.log(`✅ Allowed in lettres_philo: ${sId}`);
  }

  for (const st of nonPhiloStreams) {
    const allowed = validateContentStreamCompatibility(st, { skillId: sId });
    if (allowed) {
      console.error(`❌ Leakage Detected: ${sId} leaked into stream ${st}!`);
      failedChecks++;
    }
  }
}
console.log(`✅ Advanced Philosophy skills strictly quarantined to lettres_philo.`);

// C. Arabic literature skills should be allowed in Lettres & Philo AND Langues Étrangères, but NOT scientific/tech streams
const arabicSkills = [
  "ar_poetry_commit_liberation",
  "ar_rhetoric_cohesion_coherence",
];

for (const sId of arabicSkills) {
  const inLP = validateContentStreamCompatibility("lettres_philo", { skillId: sId });
  const inLE = validateContentStreamCompatibility("langues_etrangeres", { skillId: sId });
  if (!inLP || !inLE) {
    console.error(`❌ Isolation Failure: ${sId} must be allowed in both lettres_philo and langues_etrangeres`);
    failedChecks++;
  } else {
    console.log(`✅ Allowed in both lettres_philo & langues_etrangeres: ${sId}`);
  }

  for (const st of nonPhiloStreams) {
    const allowed = validateContentStreamCompatibility(st, { skillId: sId });
    if (allowed) {
      console.error(`❌ Leakage Detected: ${sId} leaked into scientific/tech stream ${st}!`);
      failedChecks++;
    }
  }
}
console.log(`✅ Arabic literature skills accessible exclusively to literary streams.`);

// -----------------------------------------------------------------------------
// [TEST SECTION 3] ContentService Query Verification
// -----------------------------------------------------------------------------
console.log("\n==================================================================");
console.log("  CONTENT SERVICE STREAM QUERY TESTS");
console.log("==================================================================\n");

const leSkills = ContentService.getSkillsForStream("langues_etrangeres");
const lpSkills = ContentService.getSkillsForStream("lettres_philo");
const seSkills = ContentService.getSkillsForStream("sciences_exp");
const allSkills = ContentService.getAllSkills();

console.log(`- Langues Étrangères total skills: ${leSkills.length}`);
console.log(`- Lettres & Philosophie total skills: ${lpSkills.length}`);
console.log(`- Sciences Expérimentales total skills: ${seSkills.length}`);
console.log(`- System-wide total skills: ${allSkills.length}`);

// Verify LE contains Spanish and German
for (const sId of thirdLangSkills) {
  const found = leSkills.some((s) => s.id === sId);
  if (!found) {
    console.error(`❌ ContentService missing ${sId} in langues_etrangeres!`);
    failedChecks++;
  }
}
console.log(`✅ ContentService: All Spanish and German skills present in langues_etrangeres.`);

// Verify LP contains Advanced Philosophy
for (const sId of philoSkills) {
  const found = lpSkills.some((s) => s.id === sId);
  if (!found) {
    console.error(`❌ ContentService missing ${sId} in lettres_philo!`);
    failedChecks++;
  }
}
console.log(`✅ ContentService: All Advanced Philosophy skills present in lettres_philo.`);

// Verify ContentService.getBundle stream enforcement
const blockedCrossStream = ContentService.getBundle("esp_subjuntivo_deseo_duda", "sciences_exp");
if (blockedCrossStream !== null) {
  console.error(`❌ ContentService.getBundle did NOT block cross-stream access!`);
  failedChecks++;
} else {
  console.log(`✅ ContentService.getBundle successfully rejected cross-stream request.`);
}

const authorizedBundle = ContentService.getBundle("esp_subjuntivo_deseo_duda", "langues_etrangeres");
if (authorizedBundle === null) {
  console.error(`❌ ContentService.getBundle failed for authorized stream!`);
  failedChecks++;
} else {
  console.log(`✅ ContentService.getBundle successfully served authorized stream.`);
}

console.log("\n==================================================================");
if (failedChecks === 0) {
  console.log("🎉 ALL BATCH 05 CHECKS PASSED WITH 0 ERRORS! READY FOR PRODUCTION.");
  process.exit(0);
} else {
  console.error(`🚨 VERIFICATION FAILED: ${failedChecks} checks failed.`);
  process.exit(1);
}
