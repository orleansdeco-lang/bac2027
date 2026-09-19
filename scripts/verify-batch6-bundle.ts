/**
 * Automated Verification Suite for BAC 2026/2027 Complete Content Batch 6
 * Advanced Mathematics (Arithmetic & Complex Geometry) and Algerian Revolutionary History
 */

import {
  BATCH6_MATH_REVOLUTION_BUNDLE,
  BATCH6_MATH_REVOLUTION_ALIASES,
  getBatch6LearningBundle,
} from "../src/domain/content/math-factory-revolution-bundle";
import { getSkillLearningBundle } from "../src/domain/content/mappings";

const EXPECTED_BATCH6_SKILLS = [
  // Advanced Mathematics (4)
  "math_arithmetic_congruences_periodicity",
  "math_arithmetic_bezout_diophantine",
  "math_arithmetic_gauss_prime_factorization",
  "math_complex_geometric_transformations",
  // Algerian Revolutionary History (2)
  "hist_algerian_revolution_military_strategy",
  "hist_algerian_revolution_diplomatic_strategy",
];

const EXPECTED_ALIASES = [
  { alias: "hg_lp_algerian_revolution_diplomacy", target: "hist_algerian_revolution_diplomatic_strategy" },
  { alias: "lp_math_congruences_divisibility", target: "math_arithmetic_congruences_periodicity" },
  { alias: "math_congruences", target: "math_arithmetic_congruences_periodicity" },
  { alias: "math_bezout", target: "math_arithmetic_bezout_diophantine" },
  { alias: "math_gauss", target: "math_arithmetic_gauss_prime_factorization" },
  { alias: "math_complex_transformations", target: "math_complex_geometric_transformations" },
  { alias: "hist_revolution_military", target: "hist_algerian_revolution_military_strategy" },
  { alias: "hist_revolution_diplomacy", target: "hist_algerian_revolution_diplomatic_strategy" },
];

function runVerification() {
  console.log("===============================================================================");
  console.log("🧪 BAC 2026/2027: VERIFYING BATCH 6 (ADVANCED MATH & REVOLUTIONARY HISTORY)");
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

  // 1. Raw Bundle Invariants
  console.log("📌 1. Raw Bundle Invariants (6 Core Competencies):");
  assert(Object.keys(BATCH6_MATH_REVOLUTION_BUNDLE).length === 6, "Batch 6 contains exactly 6 competencies");

  for (const skillId of EXPECTED_BATCH6_SKILLS) {
    const item = BATCH6_MATH_REVOLUTION_BUNDLE[skillId];
    assert(!!item, `Skill ${skillId} exists in bundle`);
    if (!item) continue;

    assert(item.skillId === skillId, `${skillId}: skillId matches key`);
    assert(item.subject === "math" || item.subject === "history", `${skillId}: valid subject '${item.subject}'`);
    assert(item.theory.summary.length > 50, `${skillId}: theory summary is substantive (${item.theory.summary.length} chars)`);
    assert(item.theory.keyTakeaways.length >= 2, `${skillId}: at least 2 key takeaways (${item.theory.keyTakeaways.length})`);
    assert(item.theory.commonPitfalls.length >= 1, `${skillId}: at least 1 common pitfall (${item.theory.commonPitfalls.length})`);

    // Practice
    assert(item.practice.question.length > 20, `${skillId}: practice question defined`);
    assert(item.practice.options.length >= 3, `${skillId}: practice has >= 3 options (${item.practice.options.length})`);
    const correctOpts = item.practice.options.filter((o) => o.correct);
    assert(correctOpts.length === 1, `${skillId}: practice has exactly 1 correct option`);
    assert(item.practice.stepByStepSolution.length >= 2, `${skillId}: step-by-step solution provided (${item.practice.stepByStepSolution.length} steps)`);

    // Isomorphic Retest
    assert(item.isomorphicRetest.question.length > 20, `${skillId}: retest question defined`);
    assert(item.isomorphicRetest.options.length >= 3, `${skillId}: retest has >= 3 options`);
    const correctRetestOpts = item.isomorphicRetest.options.filter((o) => o.correct);
    assert(correctRetestOpts.length === 1, `${skillId}: retest has exactly 1 correct option`);
    assert(item.isomorphicRetest.repairGuide.length > 20, `${skillId}: repair guide provided`);
  }

  // 2. Canonical Aliases Resolution
  console.log("\n📌 2. Canonical Aliases Resolution:");
  for (const { alias, target } of EXPECTED_ALIASES) {
    const resolved = getBatch6LearningBundle(alias);
    assert(!!resolved && resolved.skillId === target, `Alias '${alias}' resolves to '${target}'`);
  }

  // 3. Runtime Contract via getSkillLearningBundle
  console.log("\n📌 3. Runtime Integration with getSkillLearningBundle (mappings.ts):");
  for (const skillId of EXPECTED_BATCH6_SKILLS) {
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

  // 4. Aliases via getSkillLearningBundle
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
