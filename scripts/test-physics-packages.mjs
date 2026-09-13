import fs from "fs";
import path from "path";
import ts from "typescript";

const source = fs.readFileSync("src/domain/content/sciences-exp-physics-packages.ts", "utf8");
const result = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  },
});

const m = { exports: {} };
const fn = new Function("exports", "require", "module", result.outputText);
fn(m.exports, () => ({}), m);

const { ALL_PHYSICS_PACKAGES, PHYSICS_CANONICAL_13_INDEX, PHYSICS_HOLD_CAPABILITY } = m.exports;

console.log("=== VERIFYING PHYSICS & CHEMISTRY PACKAGES ===");

let pass = 0;
let fail = 0;

function assert(cond, msg) {
  if (cond) {
    pass++;
    console.log(`  ✓ ${msg}`);
  } else {
    fail++;
    console.error(`  ✗ FAIL: ${msg}`);
  }
}

assert(Array.isArray(PHYSICS_CANONICAL_13_INDEX), "Canonical 13 Index is an array");
assert(PHYSICS_CANONICAL_13_INDEX.length === 13, `Canonical index has exactly 13 active capabilities (found ${PHYSICS_CANONICAL_13_INDEX.length})`);
assert(PHYSICS_HOLD_CAPABILITY === "physics_rlc_free_oscillations", "Hold capability is physics_rlc_free_oscillations");

for (const id of PHYSICS_CANONICAL_13_INDEX) {
  const pkg = ALL_PHYSICS_PACKAGES[id];
  assert(pkg !== undefined, `Package for ${id} exists in registry`);
  if (!pkg) continue;
  assert(pkg.status === "APPROVED", `${id} has status APPROVED`);
  assert(pkg.scopeIn && pkg.scopeIn.length >= 3, `${id} has non-empty scopeIn (>= 3 items)`);
  assert(pkg.scopeOut && pkg.scopeOut.length >= 1, `${id} has explicit scopeOut`);
  assert(pkg.learningObjectives && pkg.learningObjectives.length >= 2, `${id} has >= 2 measurable learning objectives`);
  
  // Practice ladder L1 - L5
  const ladder = pkg.practiceLadder;
  assert(ladder.l1_foundation && ladder.l1_foundation.level === "L1_FOUNDATION", `${id} has L1 Foundation item`);
  assert(ladder.l2_application && ladder.l2_application.level === "L2_APPLICATION", `${id} has L2 Application item`);
  assert(ladder.l3_mixed && ladder.l3_mixed.level === "L3_MIXED", `${id} has L3 Mixed item`);
  assert(ladder.l4_transfer && ladder.l4_transfer.level === "L4_TRANSFER", `${id} has L4 Transfer item`);
  assert(ladder.l5_bac_style && ladder.l5_bac_style.level === "L5_BAC_STYLE", `${id} has L5 BAC-Style item`);
  
  // Disciplinary model
  assert(ladder.l1_foundation.physicalOrChemicalModel_ar !== undefined, `${id} L1 has physicalOrChemicalModel`);
  assert(ladder.l5_bac_style.physicalOrChemicalModel_ar !== undefined, `${id} L5 has physicalOrChemicalModel`);

  // Repair
  assert(pkg.repairProtocol && pkg.repairProtocol.threeStepActionProtocol_ar.length === 3, `${id} has 3-step repair protocol`);

  // Retest
  assert(pkg.isomorphicRetest && pkg.isomorphicRetest.retestId.length > 0, `${id} has isomorphic retest twin`);

  // BAC production
  assert(pkg.bacProductionTask && pkg.bacProductionTask.markingScheme_ar.length >= 3, `${id} has BAC production task with multi-criterion rubric`);
}

// Check HOLD capability
const holdPkg = ALL_PHYSICS_PACKAGES[PHYSICS_HOLD_CAPABILITY];
assert(holdPkg !== undefined, "HOLD package exists");
assert(holdPkg && holdPkg.status === "HOLD", "HOLD package has status HOLD");

console.log(`\nResults: ${pass} passed, ${fail} failed.`);
if (fail > 0) process.exit(1);
