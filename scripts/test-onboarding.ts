import assert from "node:assert";
import { validateOnboardingStep } from "../src/lib/onboarding/validation";
import { calculateInitialStrategicGap } from "../src/lib/onboarding/gap";
import { detectStrategicBottleneck } from "../src/lib/onboarding/bottleneck";
import { buildStrategicProfile } from "../src/lib/onboarding/profile";
import { getStreamSubjects } from "../src/lib/constants/streams";
import { OnboardingDraft, StrategicProfile, SelfRatedLevel } from "../src/types/onboarding";
import { SubjectId } from "../src/types/education";

console.log("=== STARTING BAC MASTERY ONBOARDING TEST SUITE ===");

// 1. TEST: Step Validation
console.log("\n[TEST 1] Testing step validations...");
{
  // Target score validations
  const invalidLowTarget = validateOnboardingStep("target_score", { targetScore: 8 });
  assert.strictEqual(invalidLowTarget.isValid, false, "Target score < 10 must be invalid");

  const invalidHighTarget = validateOnboardingStep("target_score", { targetScore: 21 });
  assert.strictEqual(invalidHighTarget.isValid, false, "Target score > 20 must be invalid");

  const validTarget = validateOnboardingStep("target_score", { targetScore: 16.5 });
  assert.strictEqual(validTarget.isValid, true, "Target score 16.5 must be valid");

  // Stream validation
  const missingStream = validateOnboardingStep("stream", {});
  assert.strictEqual(missingStream.isValid, false, "Missing stream must be invalid");

  // Technique Math specialty requirement
  const tmWithoutSpecialty = validateOnboardingStep("stream", { streamId: "technique_math" });
  assert.strictEqual(tmWithoutSpecialty.isValid, false, "Technique Math without specialty must be invalid");

  const tmWithSpecialty = validateOnboardingStep("stream", {
    streamId: "technique_math",
    techniqueMathSpecialty: "civil_eng",
  });
  assert.strictEqual(tmWithSpecialty.isValid, true, "Technique Math with specialty must be valid");

  // Core subjects rating validation
  const missingCoreRating = validateOnboardingStep("level_estimation", {
    streamId: "sciences_exp",
    subjectEstimates: {
      math: 3,
      // natural_sciences and physics missing!
    } as unknown as Record<SubjectId, SelfRatedLevel>,
  });
  assert.strictEqual(missingCoreRating.isValid, false, "Missing core subjects rating must be invalid");

  const allCoreRated = validateOnboardingStep("level_estimation", {
    streamId: "sciences_exp",
    subjectEstimates: {
      natural_sciences: 4,
      physics: 3,
      math: 2,
    } as unknown as Record<SubjectId, SelfRatedLevel>,
  });
  assert.strictEqual(allCoreRated.isValid, true, "All core subjects rated must be valid");
  console.log("  ✓ Step validations passed.");
}

// 2. TEST: Technique Math Specialty Subject Resolution
console.log("\n[TEST 2] Testing Technique Math specialty subject resolution...");
{
  const civilSubjects = getStreamSubjects("technique_math", "civil_eng");
  const civilRule = civilSubjects.find((s) => s.subjectId === "civil_eng");
  assert(civilRule, "Civil engineering must be present in subjects list");
  assert.strictEqual(civilRule.coefficient, 7, "Civil engineering must have coefficient 7");

  const mechSubjects = getStreamSubjects("technique_math", "mechanical_eng");
  const mechRule = mechSubjects.find((s) => s.subjectId === "mechanical_eng");
  assert(mechRule, "Mechanical engineering must be present");
  assert.strictEqual(mechRule.coefficient, 7, "Mechanical engineering must have coefficient 7");
  console.log("  ✓ Technique Math specialty resolution passed.");
}

// 3. TEST: Strategic Profile Creation
console.log("\n[TEST 3] Testing Strategic Profile builder...");
{
  const draft: OnboardingDraft = {
    currentStep: "summary",
    educationLevel: "secondary",
    examType: "BAC",
    streamId: "sciences_exp",
    targetScore: 16.5,
    subjectEstimates: {
      natural_sciences: 5,
      physics: 3,
      math: 2,
      arabic: 3,
      philosophy: 3,
      french: 3,
      english: 4,
      islamic_studies: 4,
      history_geography: 3,
    } as unknown as Record<SubjectId, SelfRatedLevel>,
    availableTime: "12_to_18",
    futureObjectivePreset: "higher_school_ens_esi",
    obstacles: ["understand_but_fail_exercises"],
    studyEnergy: "normal",
  };

  const profile = buildStrategicProfile(draft);
  assert.strictEqual(profile.streamId, "sciences_exp");
  assert.strictEqual(profile.targetScore, 16.5);
  assert.strictEqual(profile.subjectEstimates.math, 2);
  assert(profile.createdAt, "Profile must have a timestamp");
  console.log("  ✓ Strategic Profile creation passed.");
}

// 4. TEST: Gap Calculation & Realistic Output
console.log("\n[TEST 4] Testing Gap Calculation on realistic Science student...");
{
  // Science student with weak math (2 -> 9.5), strong science (5 -> 18.0)
  const profile: StrategicProfile = {
    id: "test_prof_1",
    educationLevel: "secondary",
    examType: "BAC",
    streamId: "sciences_exp",
    targetScore: 16.0,
    subjectEstimates: {
      natural_sciences: 5, // 18.0 (coef 6)
      physics: 3,          // 12.0 (coef 5)
      math: 2,             // 9.5  (coef 5)
      arabic: 3,           // 12.0 (coef 3)
      philosophy: 3,       // 12.0 (coef 2)
      french: 3,           // 12.0 (coef 2)
      english: 4,          // 15.0 (coef 2)
      islamic_studies: 4,  // 15.0 (coef 2)
      history_geography: 3,// 12.0 (coef 2)
    } as unknown as Record<SubjectId, SelfRatedLevel>,
    availableTime: "12_to_18",
    futureObjective: { preset: "specific_university_field" },
    obstacles: ["understand_but_fail_exercises"],
    studyEnergy: "normal",
    createdAt: new Date().toISOString(),
  };

  const gap = calculateInitialStrategicGap(profile);
  console.log(`  - Target: ${gap.targetScore}`);
  console.log(`  - Estimated Baseline Score: ${gap.estimatedBaselineScore}`);
  console.log(`  - Approximate Strategic Gap: ${gap.approximateGap}`);

  assert(gap.estimatedBaselineScore > 12.0 && gap.estimatedBaselineScore < 14.5, "Estimated baseline should be realistic ~13.5");
  assert(gap.approximateGap > 1.5 && gap.approximateGap < 3.5, "Approximate gap should be ~2.5");
  assert.strictEqual(gap.subjectGaps[0].subjectId, "math", "Math must have the largest weighted gap because rating is 2 and coef is 5");
  console.log("  ✓ Gap calculation passed.");
}

// 5. TEST: Hybrid Bottleneck Detection (Academic vs Behavioral)
console.log("\n[TEST 5] Testing Bottleneck Detection...");
{
  // Case A: Acute Subject Bottleneck (Science student with weak Math)
  const academicProfile: StrategicProfile = {
    id: "test_academic",
    educationLevel: "secondary",
    examType: "BAC",
    streamId: "sciences_exp",
    targetScore: 16.5,
    subjectEstimates: {
      natural_sciences: 5,
      physics: 4,
      math: 1, // Acute weakness in high coef subject!
    } as unknown as Record<SubjectId, SelfRatedLevel>,
    availableTime: "12_to_18",
    futureObjective: { preset: "higher_school_ens_esi" },
    obstacles: ["understand_but_fail_exercises"],
    studyEnergy: "normal",
    createdAt: new Date().toISOString(),
  };

  const gapA = calculateInitialStrategicGap(academicProfile);
  const bottleneckA = detectStrategicBottleneck(academicProfile, gapA);

  assert.strictEqual(bottleneckA.primaryBottleneck.targetSubjectId, "math", "Math must be the primary bottleneck for acute weakness in coef 5");
  assert(bottleneckA.primaryBottleneck.explanation_ar.includes("الرياضيات"), "Arabic explanation must mention Math");
  console.log("  ✓ Case A: Acute subject bottleneck identified correctly:", bottleneckA.primaryBottleneck.title_ar);

  // Case B: Behavioral Consistency Bottleneck (Balanced subjects, but <5 hours study time and start_and_stop)
  const behavioralProfile: StrategicProfile = {
    id: "test_behavioral",
    educationLevel: "secondary",
    examType: "BAC",
    streamId: "sciences_exp",
    targetScore: 16.0,
    subjectEstimates: {
      natural_sciences: 4,
      physics: 4,
      math: 4,
    } as unknown as Record<SubjectId, SelfRatedLevel>,
    availableTime: "less_than_5", // Severe time deficit for target 16
    futureObjective: { preset: "open_more_doors" },
    obstacles: ["start_and_stop", "waste_time"],
    studyEnergy: "tired",
    createdAt: new Date().toISOString(),
  };

  const gapB = calculateInitialStrategicGap(behavioralProfile);
  const bottleneckB = detectStrategicBottleneck(behavioralProfile, gapB);

  assert.strictEqual(bottleneckB.primaryBottleneck.category, "time_management", "Primary bottleneck should be time management and consistency");
  console.log("  ✓ Case B: Behavioral bottleneck identified correctly:", bottleneckB.primaryBottleneck.title_ar);

  // Case C: Methodology Bottleneck (Understands theory, fails exercises)
  const methodologyProfile: StrategicProfile = {
    id: "test_methodology",
    educationLevel: "secondary",
    examType: "BAC",
    streamId: "sciences_exp",
    targetScore: 15.0,
    subjectEstimates: {
      natural_sciences: 3,
      physics: 3,
      math: 3,
    } as unknown as Record<SubjectId, SelfRatedLevel>,
    availableTime: "12_to_18",
    futureObjective: { preset: "prove_to_myself" },
    obstacles: ["understand_but_fail_exercises"],
    studyEnergy: "normal",
    createdAt: new Date().toISOString(),
  };

  const gapC = calculateInitialStrategicGap(methodologyProfile);
  const bottleneckC = detectStrategicBottleneck(methodologyProfile, gapC);

  assert.strictEqual(bottleneckC.primaryBottleneck.category, "methodology_application", "Primary bottleneck should be exercise methodology");
  console.log("  ✓ Case C: Methodology bottleneck identified correctly:", bottleneckC.primaryBottleneck.title_ar);
}

console.log("\n=== ALL ONBOARDING & GOAL ENGINE TESTS PASSED SUCCESSFULLY! ===");
