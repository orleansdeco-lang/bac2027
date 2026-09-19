import { getSkillLearningBundle } from "../src/domain/content/mappings";
import { getBatch1LearningBundle, BATCH1_PHILOSOPHY_ARABIC_BUNDLES } from "../src/domain/content/batch1_philosophy_arabic_bundle";
import { getBatch1GestionEcoBundle, BATCH1_GESTION_ECO_BUNDLES } from "../src/domain/content/batch1_gestion_eco_real_content";

console.log("==================================================================");
console.log("  BATCH 01 INTEGRATION & MISSION ACTIVATION VERIFICATION");
console.log("==================================================================\n");

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

// 1. Check Philosophy & Arabic bundles
console.log("--- 1. Verifying Philosophy & Arabic Bundles ---");
const philoArabicSkills = [
  "philo_sensation_perception",
  "philo_language_thought",
  "philo_consciousness_unconscious",
  "philo_memory_imagination",
  "philo_habit_will",
  "arabic_ida_idhan_rules",
];

for (const skillId of philoArabicSkills) {
  const directBundle = getBatch1LearningBundle(skillId);
  assert(Boolean(directBundle), `getBatch1LearningBundle('${skillId}') returns bundle`);

  const bundle = getSkillLearningBundle(skillId);
  assert(Boolean(bundle), `getSkillLearningBundle('${skillId}') resolves without 'Mission introuvable'`);
  assert(Boolean(bundle?.skill?.id), `Skill ID exists on bundle for '${skillId}'`);
  assert(Boolean(bundle?.skill?.subjectId), `SubjectId exists on bundle for '${skillId}': ${bundle?.skill?.subjectId}`);
  assert(Boolean(bundle?.lesson?.title_ar), `Lesson title exists for '${skillId}'`);
  assert(Boolean(bundle?.workedExample), `Worked example exists for '${skillId}'`);
  assert(Boolean(bundle?.practiceQuestions && bundle.practiceQuestions.length > 0), `Practice questions exist for '${skillId}'`);
  assert(Boolean(bundle?.retest), `Retest question exists for '${skillId}'`);
  assert(Boolean(bundle?.repairGuide), `Repair guide exists for '${skillId}'`);

  // Verify NO mock data
  const hasMockOption = bundle?.practiceQuestions.some(q => q.options.some(o => o.text_ar.includes("خيار بديل")));
  assert(!hasMockOption, `No 'خيار بديل' mock data in practice for '${skillId}'`);

  const hasMockRetest = bundle?.retest?.options.some(o => o.text_ar.includes("إجابة خاطئة شائعة"));
  assert(!hasMockRetest, `No 'إجابة خاطئة شائعة' mock data in retest for '${skillId}'`);

  // Verify flat schema compatibility
  assert(Boolean(bundle?.theory?.summaryAr), `Flat theory.summaryAr exists for '${skillId}'`);
  assert(Boolean(bundle?.practice?.questionAr), `Flat practice.questionAr exists for '${skillId}'`);
  assert(Boolean(bundle?.isomorphic_retest?.questionAr), `Flat isomorphic_retest exists for '${skillId}'`);
}

// 2. Check Aliases for Philosophy & Arabic
console.log("\n--- 2. Verifying Philosophy & Arabic Aliases ---");
const philoAliases = [
  { canonical: "phi_lp_perception_sensation", target: "philo_sensation_perception" },
  { canonical: "phi_lp_language_thought", target: "philo_language_thought" },
  { canonical: "phi_lp_consciousness_unconscious", target: "philo_consciousness_unconscious" },
  { canonical: "phi_lp_memory_imagination", target: "philo_memory_imagination" },
  { canonical: "phi_lp_habit_will", target: "philo_habit_will" },
  { canonical: "ar_lp_ida_idhan_syntax", target: "arabic_ida_idhan_rules" },
];

for (const { canonical } of philoAliases) {
  const bundle = getSkillLearningBundle(canonical);
  assert(Boolean(bundle), `Canonical alias '${canonical}' resolves to full bundle`);
}

// 3. Check Gestion & Économie bundles
console.log("\n--- 3. Verifying Gestion & Économie Bundles ---");
const gestionEcoSkills = [
  "acc_impairment_tangible_assets",
  "acc_doubtful_clients_adjustment",
  "eco_foreign_trade_balance_payments",
  "law_commercial_companies_spa",
  "math_fin_loan_amortization_annuity",
];

for (const skillId of gestionEcoSkills) {
  const directGE = getBatch1GestionEcoBundle(skillId);
  assert(Boolean(directGE), `getBatch1GestionEcoBundle('${skillId}') returns bundle`);

  const bundle = getSkillLearningBundle(skillId);
  assert(Boolean(bundle), `getSkillLearningBundle('${skillId}') resolves without 'Mission introuvable'`);
  assert(Boolean(bundle?.skill?.id), `Skill ID exists on bundle for '${skillId}'`);
  assert(Boolean(bundle?.skill?.subjectId), `SubjectId exists on bundle for '${skillId}': ${bundle?.skill?.subjectId}`);
  assert(Boolean(bundle?.lesson?.title_ar), `Lesson title exists for '${skillId}'`);
  assert(Boolean(bundle?.workedExample), `Worked example exists for '${skillId}'`);
  assert(Boolean(bundle?.practiceQuestions && bundle.practiceQuestions.length > 0), `Practice questions exist for '${skillId}'`);
  assert(Boolean(bundle?.retest), `Retest question exists for '${skillId}'`);
  assert(Boolean(bundle?.repairGuide), `Repair guide exists for '${skillId}'`);

  // Verify NO mock data
  const hasMockOption = bundle?.practiceQuestions.some(q => q.options.some(o => o.text_ar.includes("خيار بديل")));
  assert(!hasMockOption, `No 'خيار بديل' mock data in practice for '${skillId}'`);

  const hasMockRetest = bundle?.retest?.options.some(o => o.text_ar.includes("إجابة خاطئة شائعة"));
  assert(!hasMockRetest, `No 'إجابة خاطئة شائعة' mock data in retest for '${skillId}'`);

  // Verify realistic exam values
  const practicePrompt = bundle?.practiceQuestions[0]?.prompt_ar || "";
  assert(practicePrompt.length > 20, `Realistic exam question content for '${skillId}'`);
}

// 4. Check Aliases for Gestion & Économie
console.log("\n--- 4. Verifying Gestion & Économie Aliases ---");
const geAliases = [
  "mgmt_accounting_amortization_provisions",
  "acc_client_receivables_doubtful_impairment",
  "eco_international_trade_balance_payments",
  "acc_borrowing_amortization_table",
];

for (const canonical of geAliases) {
  const bundle = getSkillLearningBundle(canonical);
  assert(Boolean(bundle), `Canonical alias '${canonical}' resolves to full bundle`);
}

console.log("\n==================================================================");
console.log("  ALL BATCH 01 INTEGRATION TESTS PASSED WITH 100% SUCCESS!");
console.log("==================================================================");
