/**
 * BAC Mastery - Batch 9 Verification Script
 * Validates 100% Curriculum Coverage Bundle:
 * 1. hist_non_aligned_movement_third_world
 * 2. hist_palestine_arab_israeli_conflict
 * 3. geo_algerian_economy_development_challenges
 * 4. geo_brazil_emerging_power_inequalities
 * 5. ar_grammar_plural_types_qillah_kathrah
 * 6. ar_rhetoric_musnad_musnad_ilayh_syntax
 */

import {
  getSkillLearningBundle,
  BATCH9_FINAL_CURRICULUM_BUNDLE,
  BATCH9_CURRICULUM_ALIASES,
  getAllBatch9Skills,
} from "../src/domain/content";
import { ContentService } from "../src/lib/services/content-service";
import { StreamId } from "../src/types/education";
import * as fs from "fs";
import * as path from "path";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log("==================================================================");
console.log("  BAC MASTERY — BATCH 9 (FINAL CLOSING BUNDLE) VERIFICATION");
console.log("==================================================================\n");

const BATCH9_SKILL_IDS = [
  "hist_non_aligned_movement_third_world",
  "hist_palestine_arab_israeli_conflict",
  "geo_algerian_economy_development_challenges",
  "geo_brazil_emerging_power_inequalities",
  "ar_grammar_plural_types_qillah_kathrah",
  "ar_rhetoric_musnad_musnad_ilayh_syntax",
];

// -----------------------------------------------------------------------------
// [TEST 1] Raw Bundle Completeness
// -----------------------------------------------------------------------------
console.log("[TEST 1] Auditing Batch 9 Raw Bundle Completeness...");
assert(Object.keys(BATCH9_FINAL_CURRICULUM_BUNDLE).length === 6, "Batch 9 bundle has exactly 6 competencies");

for (const skillId of BATCH9_SKILL_IDS) {
  const item = BATCH9_FINAL_CURRICULUM_BUNDLE[skillId];
  assert(Boolean(item), `Skill ${skillId} exists in BATCH9_FINAL_CURRICULUM_BUNDLE`);
  assert(item.skillId === skillId, `Item skillId matches ${skillId}`);
  assert(item.title_ar.length > 0, `Item ${skillId} has non-empty title_ar`);
  assert(item.unit.length > 0, `Item ${skillId} has non-empty unit`);
  assert(item.theory.summary.length > 0, `Item ${skillId} has non-empty theory summary`);
  assert(item.theory.keyTakeaways.length >= 3, `Item ${skillId} has >= 3 key takeaways`);
  assert(item.theory.commonPitfalls.length >= 1, `Item ${skillId} has >= 1 common pitfalls`);

  // Practice question checks
  assert(item.practice.question.length > 0, `Item ${skillId} practice question exists`);
  assert(item.practice.options.length === 4, `Item ${skillId} practice has exactly 4 options`);
  const correctPractice = item.practice.options.filter((o) => o.correct);
  assert(correctPractice.length === 1, `Item ${skillId} practice has exactly 1 correct option`);
  assert(item.practice.stepByStepSolution.length > 0, `Item ${skillId} has stepByStepSolution`);

  // Isomorphic retest checks
  assert(item.isomorphicRetest.question.length > 0, `Item ${skillId} retest question exists`);
  assert(item.isomorphicRetest.options.length === 4, `Item ${skillId} retest has exactly 4 options`);
  const correctRetest = item.isomorphicRetest.options.filter((o) => o.correct);
  assert(correctRetest.length === 1, `Item ${skillId} retest has exactly 1 correct option`);
  assert(item.isomorphicRetest.repairGuide.length > 0, `Item ${skillId} has repairGuide`);
}

// -----------------------------------------------------------------------------
// [TEST 2] Aliases Resolution
// -----------------------------------------------------------------------------
console.log("\n[TEST 2] Auditing Curriculum Aliases Resolution...");
for (const [alias, canonical] of Object.entries(BATCH9_CURRICULUM_ALIASES)) {
  const bundle = getSkillLearningBundle(alias);
  assert(Boolean(bundle), `Alias "${alias}" resolves to bundle`);
  assert(bundle?.skill.id === canonical, `Alias "${alias}" maps to canonical "${canonical}" (Got: ${bundle?.skill.id})`);
}

// -----------------------------------------------------------------------------
// [TEST 3] Full 14-Element Learning Bundle Resolution
// -----------------------------------------------------------------------------
console.log("\n[TEST 3] Auditing 14-Element Learning Bundle Resolution...");
for (const skillId of BATCH9_SKILL_IDS) {
  const bundle = getSkillLearningBundle(skillId);
  assert(Boolean(bundle), `Bundle for ${skillId} resolves via getSkillLearningBundle`);
  if (!bundle) continue;

  // 14 Core & Architectural Elements check
  assert(bundle.skill.id === skillId, `1. skill.id matches ${skillId}`);
  assert(Boolean(bundle.skill.title_ar), `2. skill.title_ar present`);
  assert(Boolean(bundle.skill.subjectId), `3. skill.subjectId present`);
  assert(Boolean(bundle.skill.streamId), `4. skill.streamId present`);
  assert(Boolean(bundle.lesson && bundle.lesson.id), `5. lesson present`);
  assert(Boolean(bundle.workedExample && bundle.workedExample.problem_ar), `6. workedExample present`);
  assert(Boolean(bundle.practiceQuestions && bundle.practiceQuestions.length >= 1), `7. practiceQuestions present`);
  assert(Boolean(bundle.repairGuide && bundle.repairGuide.repairSteps_ar), `8. repairGuide present`);
  assert(Boolean(bundle.retest && bundle.retest.prompt_ar), `9. retest question present`);
  assert(Boolean(bundle.provenance && bundle.provenance.publisher), `10. provenance present`);
  assert(bundle.readiness.status === "MASTERY_READY", `11. readiness is MASTERY_READY`);
  assert(bundle.readiness.hasLesson === true, `12. readiness hasLesson is true`);
  assert(bundle.readiness.hasWorkedExample === true, `13. readiness hasWorkedExample is true`);
  assert(bundle.readiness.hasRetest === true, `14. readiness hasRetest is true`);
}

// -----------------------------------------------------------------------------
// [TEST 4] Universal Cross-Stream Compatibility
// -----------------------------------------------------------------------------
console.log("\n[TEST 4] Auditing Universal Stream Compatibility...");
const ALL_STREAMS: StreamId[] = [
  "sciences_exp",
  "math",
  "technique_math",
  "gestion_eco",
  "lettres_philo",
  "langues_etrangeres",
];

for (const streamId of ALL_STREAMS) {
  const streamSkills = ContentService.getSkillsForStream(streamId);
  const streamSkillIds = new Set(streamSkills.map((s) => s.id));

  for (const skillId of BATCH9_SKILL_IDS) {
    assert(streamSkillIds.has(skillId), `Stream ${streamId} contains ${skillId}`);

    const bundle = ContentService.getBundle(skillId, streamId);
    assert(Boolean(bundle), `ContentService.getBundle(${skillId}, ${streamId}) resolves without rejection`);
  }
}

// -----------------------------------------------------------------------------
// [TEST 5] Catalog Completeness in ContentService.getAllSkills()
// -----------------------------------------------------------------------------
console.log("\n[TEST 5] Auditing ContentService.getAllSkills()...");
const allCatalogSkills = ContentService.getAllSkills();
const allCatalogIds = new Set(allCatalogSkills.map((s) => s.id));
for (const skillId of BATCH9_SKILL_IDS) {
  assert(allCatalogIds.has(skillId), `getAllSkills() includes ${skillId}`);
}
assert(getAllBatch9Skills().length === 6, "getAllBatch9Skills() returns exactly 6 skills");

// -----------------------------------------------------------------------------
// [TEST 6] Content Purity Invariant (zero student_id / user_id)
// -----------------------------------------------------------------------------
console.log("\n[TEST 6] Auditing Content Purity (zero student_id / user_id)...");
const batch9File = path.resolve(__dirname, "../src/domain/content/batch9-final-curriculum-bundle.ts");
const content = fs.readFileSync(batch9File, "utf-8");
assert(!content.includes("student_id"), "batch9 bundle file contains zero 'student_id'");
assert(!content.includes("user_id"), "batch9 bundle file contains zero 'user_id'");
assert(!content.includes("learner_id"), "batch9 bundle file contains zero 'learner_id'");

console.log("\n==================================================================");
console.log("🎉 ALL BATCH 9 VERIFICATION CHECKS PASSED PERFECTLY!");
console.log("==================================================================");
