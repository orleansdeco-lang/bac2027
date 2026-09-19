/**
 * Automated Verification Suite for Algerian Baccalaureate Foreign Languages Bundle
 * Languages: Français & English (Batch 3 - Part 2)
 * Targets: 8 Core Competencies + Canonical Alias Bridges
 */

import {
  FOREIGN_LANGUAGES_BUNDLE,
  FOREIGN_LANGUAGES_ALIASES,
  getForeignLanguageBundle,
} from "../src/domain/content/foreign-languages-bundle";
import { getSkillLearningBundle } from "../src/domain/content/mappings";

const EXPECTED_SKILLS = [
  // Français (4)
  "fr_texte_histoire_enonciation",
  "fr_compte_rendu_objectif_critique",
  "fr_texte_argumentatif_plaidoyer_requisitoire",
  "fr_l_appel_incitatif",
  // English (4)
  "eng_ethics_in_business_whistleblowing",
  "eng_grammar_it_is_high_time_wish",
  "eng_grammar_provided_that_condition",
  "eng_ancient_civilizations_flourish_fall",
];

const EXPECTED_ALIASES = [
  { alias: "fr_lp_texte_histoire_temoignage", target: "fr_texte_histoire_enonciation" },
  { alias: "en_lp_ancient_civilizations", target: "eng_ancient_civilizations_flourish_fall" },
  { alias: "fr_ge_compte_rendu_economique", target: "fr_compte_rendu_objectif_critique" },
  { alias: "en_ge_economic_text_comprehension", target: "eng_ethics_in_business_whistleblowing" },
];

function runVerification() {
  console.log("===============================================================================");
  console.log("🧪 BAC 2026/2027: VERIFYING FOREIGN LANGUAGES BUNDLE (FRANÇAIS & ENGLISH)");
  console.log("===============================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Check all 8 expected competencies exist in the raw bundle
  console.log("📌 1. Raw Bundle Invariants (8 Core Competencies):");
  assert(Object.keys(FOREIGN_LANGUAGES_BUNDLE).length === 8, "Bundle contains exactly 8 competencies");

  for (const skillId of EXPECTED_SKILLS) {
    const item = FOREIGN_LANGUAGES_BUNDLE[skillId];
    assert(!!item, `Skill ${skillId} exists in bundle`);
    if (!item) continue;

    assert(item.skillId === skillId, `${skillId}: skillId matches key`);
    assert(item.language === "french" || item.language === "english", `${skillId}: valid language '${item.language}'`);
    assert(item.theory.summary.length > 50, `${skillId}: theory summary is substantive (${item.theory.summary.length} chars)`);
    assert(item.theory.keyTakeaways.length >= 2, `${skillId}: at least 2 key takeaways (${item.theory.keyTakeaways.length})`);
    assert(item.theory.commonPitfalls.length >= 1, `${skillId}: at least 1 common pitfall (${item.theory.commonPitfalls.length})`);

    // Practice
    assert(item.practice.question.length > 20, `${skillId}: practice question defined`);
    assert(item.practice.options.length >= 3, `${skillId}: practice has >= 3 options (${item.practice.options.length})`);
    const correctOpt = item.practice.options.filter((o) => o.isCorrect);
    assert(correctOpt.length === 1, `${skillId}: practice has exactly 1 correct option`);
    assert(item.practice.explanationStepByStep.length > 30, `${skillId}: step-by-step explanation provided`);

    // Isomorphic Retest
    assert(item.isomorphicRetest.question.length > 20, `${skillId}: retest question defined`);
    assert(item.isomorphicRetest.options.length >= 3, `${skillId}: retest has >= 3 options`);
    const correctRetestOpt = item.isomorphicRetest.options.filter((o) => o.isCorrect);
    assert(correctRetestOpt.length === 1, `${skillId}: retest has exactly 1 correct option`);
    assert(item.isomorphicRetest.repairGuide.length > 30, `${skillId}: repair guide provided`);
  }

  // 2. Check Alias Resolution
  console.log("\n📌 2. Canonical Alias Resolution:");
  for (const { alias, target } of EXPECTED_ALIASES) {
    const resolved = getForeignLanguageBundle(alias);
    assert(!!resolved && resolved.skillId === target, `Alias '${alias}' resolves to '${target}'`);
  }

  // 3. Integration with getSkillLearningBundle (Runtime Contract)
  console.log("\n📌 3. Runtime Integration with getSkillLearningBundle (mappings.ts):");
  for (const skillId of EXPECTED_SKILLS) {
    const runtimeBundle = getSkillLearningBundle(skillId);
    assert(!!runtimeBundle, `getSkillLearningBundle('${skillId}') returns non-null bundle`);
    if (!runtimeBundle) continue;

    assert(runtimeBundle.skill.id === skillId, `${skillId}: runtime skill.id matches`);
    assert(runtimeBundle.readiness.status === "MASTERY_READY", `${skillId}: readiness status is MASTERY_READY`);
    assert(!!runtimeBundle.lesson, `${skillId}: runtime lesson is present`);
    assert(!!runtimeBundle.workedExample, `${skillId}: worked example is present`);
    assert(runtimeBundle.practiceQuestions.length >= 1, `${skillId}: practice questions present (${runtimeBundle.practiceQuestions.length})`);
    assert(!!runtimeBundle.retest, `${skillId}: isomorphic retest question is present`);
    assert(!!runtimeBundle.repairGuide, `${skillId}: repair guide is present`);
    assert(!!runtimeBundle.provenance, `${skillId}: provenance is present`);
  }

  // 4. Test Aliases via getSkillLearningBundle
  console.log("\n📌 4. Canonical Aliases via getSkillLearningBundle:");
  for (const { alias, target } of EXPECTED_ALIASES) {
    const aliasRuntimeBundle = getSkillLearningBundle(alias);
    assert(!!aliasRuntimeBundle, `getSkillLearningBundle('${alias}') resolves via alias`);
    if (aliasRuntimeBundle) {
      assert(aliasRuntimeBundle.skill.id === target, `Resolved bundle skill.id matches target '${target}'`);
      assert(aliasRuntimeBundle.readiness.status === "MASTERY_READY", `Readiness status is MASTERY_READY for alias '${alias}'`);
    }
  }

  console.log("\n===============================================================================");
  console.log(`📊 SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("===============================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification();
