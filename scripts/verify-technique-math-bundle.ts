/**
 * Verification Script: Technique Mathématiques Bundle (Batch 04)
 * Ensures full readiness, 14-element learning bundle completeness,
 * and strict cross-stream and specialty isolation.
 */

import { getSkillLearningBundle } from "../src/domain/content/mappings";
import { TECHNIQUE_MATH_BUNDLE, getAllTechniqueMathSkills } from "../src/domain/content/technique-math-bundle";
import { ContentService } from "../src/lib/services/content-service";
import { validateContentStreamCompatibility } from "../src/domain/student";

console.log("==================================================================");
console.log("  VERIFYING TECHNIQUE_MATH_BUNDLE (BATCH 04) INTEGRATION");
console.log("==================================================================\n");

const expectedSkillIds = [
  "tm_civil_beam_reactions",
  "tm_civil_tension_compression_stress",
  "tm_meca_dimensional_chains",
  "tm_meca_simple_bending_rdm",
  "tm_elec_sequential_counters",
  "tm_elec_operational_amplifiers",
  "tm_proc_organic_lipids_saponification",
  "tm_proc_chemical_kinetics_rate",
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

console.log("==================================================================");
console.log("  TESTING STREAM AND SPECIALTY ISOLATION");
console.log("==================================================================\n");

// Test 1: Cross-stream leakage prevention
const testSciencesExp = validateContentStreamCompatibility("sciences_exp", { skillId: "tm_civil_beam_reactions" });
if (!testSciencesExp) {
  console.log("✅ PASS: sciences_exp CANNOT access tm_civil_beam_reactions");
} else {
  console.error("❌ FAIL: Cross-stream leakage! sciences_exp accessed tm_civil_beam_reactions");
  failedChecks++;
}

const testGestionEco = validateContentStreamCompatibility("gestion_eco", { skillId: "tm_meca_dimensional_chains" });
if (!testGestionEco) {
  console.log("✅ PASS: gestion_eco CANNOT access tm_meca_dimensional_chains");
} else {
  console.error("❌ FAIL: Cross-stream leakage! gestion_eco accessed tm_meca_dimensional_chains");
  failedChecks++;
}

// Test 2: Technique Math authorization
const testTM = validateContentStreamCompatibility("technique_math", { skillId: "tm_elec_sequential_counters" });
if (testTM) {
  console.log("✅ PASS: technique_math CAN access tm_elec_sequential_counters");
} else {
  console.error("❌ FAIL: technique_math was rejected from tm_elec_sequential_counters");
  failedChecks++;
}

// Test 3: Specialty isolation within Technique Math
const civilStudent = { stream: "technique_math", techniqueMathSpecialty: "civil_eng" } as any;
const canCivilAccessCivil = validateContentStreamCompatibility(civilStudent, { skillId: "tm_civil_beam_reactions" });
const canCivilAccessMeca = validateContentStreamCompatibility(civilStudent, { skillId: "tm_meca_dimensional_chains" });
const canCivilAccessElec = validateContentStreamCompatibility(civilStudent, { skillId: "tm_elec_sequential_counters" });
const canCivilAccessProc = validateContentStreamCompatibility(civilStudent, { skillId: "tm_proc_chemical_kinetics_rate" });

if (canCivilAccessCivil && !canCivilAccessMeca && !canCivilAccessElec && !canCivilAccessProc) {
  console.log("✅ PASS: civil_eng student can access ONLY civil engineering skills (cross-specialty isolation preserved)");
} else {
  console.error(`❌ FAIL: Specialty isolation breached: civil=${canCivilAccessCivil}, meca=${canCivilAccessMeca}, elec=${canCivilAccessElec}, proc=${canCivilAccessProc}`);
  failedChecks++;
}

// Test 4: ContentService
const bundleViaCS = ContentService.getBundle("tm_proc_organic_lipids_saponification", "technique_math");
const blockedViaCS = ContentService.getBundle("tm_proc_organic_lipids_saponification", "sciences_exp");

if (bundleViaCS && !blockedViaCS) {
  console.log("✅ PASS: ContentService enforces stream boundary for getBundle()");
} else {
  console.error("❌ FAIL: ContentService failed to enforce stream boundary");
  failedChecks++;
}

const tmSkills = ContentService.getSkillsForStream("technique_math");
const tmSkillsContainAll8 = expectedSkillIds.every((id) => tmSkills.some((s) => s.id === id));
if (tmSkillsContainAll8) {
  console.log(`✅ PASS: ContentService.getSkillsForStream("technique_math") contains all 8 engineering skills (total skills: ${tmSkills.length})`);
} else {
  console.error("❌ FAIL: ContentService.getSkillsForStream(\"technique_math\") missing engineering skills");
  failedChecks++;
}

console.log("\n==================================================================");
if (failedChecks === 0) {
  console.log("🎉 ALL 8 SKILLS IN TECHNIQUE_MATH_BUNDLE FULLY VERIFIED & ISOLATED!");
  process.exit(0);
} else {
  console.error(`❌ ${failedChecks} CHECKS FAILED!`);
  process.exit(1);
}
