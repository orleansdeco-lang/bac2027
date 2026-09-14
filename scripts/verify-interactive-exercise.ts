/**
 * BAC Mastery — Automated Verification Suite for Step 03: Interactive Journal & Steps
 * Run with: npx -y tsx scripts/verify-interactive-exercise.ts
 */

import {
  validateJournalEntry,
  normalizeAccountCode,
  resolveAccountName,
  SCF_ACCOUNTS,
} from "../src/components/interactive/InteractiveJournal";
import {
  validateStepInput,
  normalizeDigits,
  normalizeArabicText,
} from "../src/components/interactive/InteractiveSteps";
import {
  LINEAR_DEPRECIATION_JOURNAL_SOLUTION,
  LINEAR_DEPRECIATION_STEPS_SOLUTION,
  GESTION_ECO_JOURNAL_QUESTION,
  GESTION_ECO_STEPS_QUESTION,
} from "../src/data/practice/gestion-eco/interactive-exercises";
import { getSkillLearningBundle } from "../src/domain/content/mappings";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

async function runVerification() {
  console.log("==================================================================");
  console.log("🚀 STARTING INTERACTIVE JOURNAL & STEPS VERIFICATION");
  console.log("==================================================================\n");

  // --------------------------------------------------------------------------
  // 1. SCF Account Dictionary & Normalization
  // --------------------------------------------------------------------------
  console.log("--- 1. Testing SCF Accounts & Normalization ---");
  assert(SCF_ACCOUNTS["681"] !== undefined, "SCF has account 681 (Dotations)");
  assert(SCF_ACCOUNTS["28182"] !== undefined, "SCF has account 28182 (Matériel de transport)");
  assert(normalizeAccountCode(" 281.82 ") === "28182", "normalizeAccountCode strips spaces and dots");
  assert(
    resolveAccountName("681").includes("مخصصات"),
    "resolveAccountName resolves 681 to Arabic title"
  );

  // --------------------------------------------------------------------------
  // 2. Pure Journal Entry Validation
  // --------------------------------------------------------------------------
  console.log("\n--- 2. Testing Pure Journal Entry Validation ---");

  // Case 2.1: Valid & Balanced Entry
  const validPayload = {
    date: "31/12/2021",
    label_ar: "تسجيل قسط اهتلاك شاحنة النقل لسنة 2021",
    debitRows: [
      { id: "d1", code: "681", name_ar: "مخصصات الاهتلاكات", amount: 180000 },
    ],
    creditRows: [
      { id: "c1", code: "28182", name_ar: "اهتلاك معدات النقل", amount: 180000 },
    ],
  };
  const validRes = validateJournalEntry(validPayload, LINEAR_DEPRECIATION_JOURNAL_SOLUTION);
  assert(validRes.isValid === true, "Valid journal entry passes validation");
  assert(validRes.isBalanced === true, "Valid journal entry is balanced");
  assert(validRes.totalDebit === 180000, "totalDebit is 180,000");
  assert(validRes.totalCredit === 180000, "totalCredit is 180,000");

  // Case 2.2: Alternative Code (2818 instead of 28182)
  const altCodePayload = {
    ...validPayload,
    creditRows: [
      { id: "c1", code: "2818", name_ar: "اهتلاك تثبيتات عينية أخرى", amount: 180000 },
    ],
  };
  const altRes = validateJournalEntry(altCodePayload, LINEAR_DEPRECIATION_JOURNAL_SOLUTION);
  assert(altRes.isValid === true, "Alternative code 2818 is accepted for 28182");

  // Case 2.3: Unbalanced Entry (Debit ≠ Credit)
  const unbalancedPayload = {
    ...validPayload,
    creditRows: [
      { id: "c1", code: "28182", name_ar: "اهتلاك معدات النقل", amount: 150000 },
    ],
  };
  const unbalRes = validateJournalEntry(unbalancedPayload, LINEAR_DEPRECIATION_JOURNAL_SOLUTION);
  assert(unbalRes.isValid === false, "Unbalanced entry is rejected");
  assert(unbalRes.isBalanced === false, "isBalanced is false");
  assert(
    unbalRes.errors.some((e) => e.field === "balance"),
    "Returns balance error field"
  );
  assert(unbalRes.imbalanceAmount === 30000, "Correctly identifies 30,000 DZD imbalance");

  // Case 2.4: Reversed Entry (681 in credit, 28182 in debit)
  const reversedPayload = {
    ...validPayload,
    debitRows: [
      { id: "d1", code: "28182", name_ar: "اهتلاك معدات النقل", amount: 180000 },
    ],
    creditRows: [
      { id: "c1", code: "681", name_ar: "مخصصات الاهتلاكات", amount: 180000 },
    ],
  };
  const revRes = validateJournalEntry(reversedPayload, LINEAR_DEPRECIATION_JOURNAL_SOLUTION);
  assert(revRes.isValid === false, "Reversed entry is rejected");
  assert(
    revRes.errors.some((e) => e.message_ar.includes("بالمقلوب")),
    "Identifies reversed entry misconception with specific warning"
  );

  // Case 2.5: Misconception - Using asset account (2182) instead of amortization (28182)
  const assetAccountPayload = {
    ...validPayload,
    creditRows: [
      { id: "c1", code: "2182", name_ar: "معدات النقل", amount: 180000 },
    ],
  };
  const assetRes = validateJournalEntry(assetAccountPayload, LINEAR_DEPRECIATION_JOURNAL_SOLUTION);
  assert(assetRes.isValid === false, "Crediting asset account 2182 directly is rejected");
  assert(
    assetRes.errors.some((e) => e.message_ar.includes("حساب الأصل (الصنف 21)")),
    "Pedagogical warning advises against directly crediting Class 21"
  );

  // Case 2.6: Calculation Error (Forgetting 9/12 prorata, inputting full year 240,000)
  const fullYearPayload = {
    ...validPayload,
    debitRows: [
      { id: "d1", code: "681", name_ar: "مخصصات الاهتلاكات", amount: 240000 },
    ],
    creditRows: [
      { id: "c1", code: "28182", name_ar: "اهتلاك معدات النقل", amount: 240000 },
    ],
  };
  const calcRes = validateJournalEntry(fullYearPayload, LINEAR_DEPRECIATION_JOURNAL_SOLUTION);
  assert(calcRes.isValid === false, "Incorrect amount 240,000 is rejected");
  assert(
    calcRes.errors.some((e) => e.field === "amount"),
    "Flags amount mismatch against expected 180,000"
  );

  // --------------------------------------------------------------------------
  // 3. Step-by-Step Validation & Tolerant Normalization
  // --------------------------------------------------------------------------
  console.log("\n--- 3. Testing Step-by-Step Resolution Engine ---");

  // Step 1: Rate t = 20%
  const step1 = LINEAR_DEPRECIATION_STEPS_SOLUTION.steps[0];
  const s1Ok = validateStepInput(step1, "20");
  assert(s1Ok.isCorrect === true, "Step 1 accepts 20");
  const s1OkWithPercent = validateStepInput(step1, "20%");
  assert(s1OkWithPercent.isCorrect === true, "Step 1 accepts '20%' with unit stripped");
  const s1Wrong = validateStepInput(step1, "25");
  assert(s1Wrong.isCorrect === false, "Step 1 rejects wrong rate 25");

  // Step 2: Months m = 9
  const step2 = LINEAR_DEPRECIATION_STEPS_SOLUTION.steps[1];
  const s2Eastern = validateStepInput(step2, "٩");
  assert(s2Eastern.isCorrect === true, "Step 2 accepts Eastern Arabic numeral ٩ (9)");
  const s2Wrong = validateStepInput(step2, "12");
  assert(s2Wrong.isCorrect === false, "Step 2 rejects 12 months (full year)");

  // Step 3: Amount A = 180,000 DZD
  const step3 = LINEAR_DEPRECIATION_STEPS_SOLUTION.steps[2];
  const s3Formatted = validateStepInput(step3, "180,000 دج");
  assert(s3Formatted.isCorrect === true, "Step 3 accepts '180,000 دج' with currency stripped");
  const s3Wrong = validateStepInput(step3, "240000");
  assert(s3Wrong.isCorrect === false, "Step 3 rejects 240,000 DZD");

  // Step 4: VNC = 1,020,000 DZD
  const step4 = LINEAR_DEPRECIATION_STEPS_SOLUTION.steps[3];
  const s4Ok = validateStepInput(step4, "1020000");
  assert(s4Ok.isCorrect === true, "Step 4 accepts 1,020,000");

  // Arabic text normalization helper
  assert(normalizeArabicText("أهتلاك خطي") === "اهتلاك خطي", "Normalizes Alef with Hamza");
  assert(normalizeArabicText("مؤسسة   تجارية") === "مؤسسه تجاريه", "Normalizes Ta Marbuta and spaces");

  // --------------------------------------------------------------------------
  // 4. Bundle Integration & Question Bank
  // --------------------------------------------------------------------------
  console.log("\n--- 4. Testing Content Bundle Integration ---");
  const bundle = getSkillLearningBundle("acc_depreciation_linear_degressive");
  assert(bundle !== null, "getSkillLearningBundle returns bundle for acc_depreciation_linear_degressive");
  assert(
    bundle!.practiceQuestions.length >= 2,
    `bundle has at least 2 practice questions (found ${bundle!.practiceQuestions.length})`
  );

  const journalQ = bundle!.practiceQuestions.find((q) => q.exerciseType === "journal_entry");
  assert(journalQ !== undefined, "Bundle includes a journal_entry question");
  assert(
    journalQ!.interactiveConfig?.journalSolution !== undefined,
    "Journal question has interactiveConfig.journalSolution"
  );

  const stepsQ = bundle!.practiceQuestions.find((q) => q.exerciseType === "step_by_step");
  assert(stepsQ !== undefined, "Bundle includes a step_by_step question");
  assert(
    stepsQ!.interactiveConfig?.stepSolution !== undefined,
    "Steps question has interactiveConfig.stepSolution"
  );

  console.log("\n==================================================================");
  console.log("🎉 ALL TESTS PASSED! STEP 03 INTERACTIVE COMPONENTS ARE 100% OPERATIONAL");
  console.log("==================================================================");
}

runVerification().catch((err) => {
  console.error("Verification failed with uncaught exception:", err);
  process.exit(1);
});
