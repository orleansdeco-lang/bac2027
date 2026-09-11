import assert from "node:assert";

// Pure functions directly tested
const RATING_TO_BASELINE_GRADE = {
  1: 7.0,
  2: 9.5,
  3: 12.0,
  4: 15.0,
  5: 18.0,
};

const ALGERIAN_BAC_STREAMS = {
  sciences_exp: {
    subjects: [
      { subjectId: "natural_sciences", coefficient: 6, isCoreSubject: true },
      { subjectId: "physics", coefficient: 5, isCoreSubject: true },
      { subjectId: "math", coefficient: 5, isCoreSubject: true },
      { subjectId: "arabic", coefficient: 3, isCoreSubject: false },
      { subjectId: "philosophy", coefficient: 2, isCoreSubject: false },
      { subjectId: "french", coefficient: 2, isCoreSubject: false },
      { subjectId: "english", coefficient: 2, isCoreSubject: false },
      { subjectId: "islamic_studies", coefficient: 2, isCoreSubject: false },
      { subjectId: "history_geography", coefficient: 2, isCoreSubject: false },
    ],
  },
  technique_math: {
    subjects: [
      { subjectId: "mechanical_eng", coefficient: 7, isCoreSubject: true },
      { subjectId: "math", coefficient: 6, isCoreSubject: true },
      { subjectId: "physics", coefficient: 6, isCoreSubject: true },
      { subjectId: "arabic", coefficient: 3, isCoreSubject: false },
      { subjectId: "philosophy", coefficient: 2, isCoreSubject: false },
      { subjectId: "french", coefficient: 2, isCoreSubject: false },
      { subjectId: "english", coefficient: 2, isCoreSubject: false },
      { subjectId: "islamic_studies", coefficient: 2, isCoreSubject: false },
      { subjectId: "history_geography", coefficient: 2, isCoreSubject: false },
    ],
  },
};

function getStreamSubjects(streamId, specialty) {
  const stream = ALGERIAN_BAC_STREAMS[streamId];
  if (!stream) return [];
  if (streamId === "technique_math" && specialty) {
    return stream.subjects.map((rule) => {
      if (["mechanical_eng", "civil_eng", "electrical_eng", "process_eng"].includes(rule.subjectId)) {
        return { subjectId: specialty, coefficient: 7, isCoreSubject: true };
      }
      return rule;
    });
  }
  return stream.subjects;
}

function calculateInitialStrategicGap(profile) {
  const streamSubjects = getStreamSubjects(profile.streamId, profile.techniqueMathSpecialty);
  const totalCoefficients = streamSubjects.reduce((sum, s) => sum + s.coefficient, 0);
  let weightedSum = 0;
  const subjectGaps = [];

  for (const rule of streamSubjects) {
    const rating = profile.subjectEstimates[rule.subjectId] || 3;
    const estimatedGrade = RATING_TO_BASELINE_GRADE[rating];
    weightedSum += estimatedGrade * rule.coefficient;
    const rawGap = Math.max(0, profile.targetScore - estimatedGrade);
    const weightedGap = rawGap * rule.coefficient;

    subjectGaps.push({
      subjectId: rule.subjectId,
      coefficient: rule.coefficient,
      isCoreSubject: rule.isCoreSubject,
      selfRatedLevel: rating,
      estimatedBaselineGrade: estimatedGrade,
      weightedGap,
    });
  }

  const rawBaseline = totalCoefficients > 0 ? weightedSum / totalCoefficients : 10;
  const estimatedBaselineScore = Math.round(rawBaseline * 10) / 10;
  const approximateGap = Math.max(0, Math.round((profile.targetScore - estimatedBaselineScore) * 10) / 10);
  subjectGaps.sort((a, b) => b.weightedGap - a.weightedGap);

  return {
    targetScore: profile.targetScore,
    estimatedBaselineScore,
    approximateGap,
    subjectGaps,
  };
}

function detectStrategicBottleneck(profile, gapResult) {
  const secondaryBottlenecks = [];
  const topSubjectGap = gapResult.subjectGaps[0];

  let academicBottleneck = null;
  if (topSubjectGap) {
    const isAcute = topSubjectGap.selfRatedLevel <= 2;
    academicBottleneck = {
      category: "subject_academic",
      targetSubjectId: topSubjectGap.subjectId,
      isAcute,
      title_ar: `${topSubjectGap.subjectId} — فجوة المعامل والتقدير`,
      explanation_ar: `المستوى التقديري يشكل أكبر عائق نظراً للمعامل ${topSubjectGap.coefficient}`,
    };
  }

  const obstacles = profile.obstacles || [];
  const hasTimeDeficit = profile.availableTime === "less_than_5" || profile.availableTime === "not_sure";
  const highTarget = profile.targetScore >= 14;

  let behavioralBottleneck = null;
  if (hasTimeDeficit && highTarget) {
    behavioralBottleneck = {
      category: "time_management",
      title_ar: "إدارة الوقت والانتظام الأسبوعي",
    };
  } else if (obstacles.includes("understand_but_fail_exercises")) {
    behavioralBottleneck = {
      category: "methodology_application",
      title_ar: "المنهجية وتطبيق التمارين",
    };
  }

  let primaryBottleneck;
  if (academicBottleneck && topSubjectGap.selfRatedLevel <= 2 && topSubjectGap.coefficient >= 5) {
    primaryBottleneck = academicBottleneck;
    if (behavioralBottleneck) secondaryBottlenecks.push(behavioralBottleneck);
  } else if (behavioralBottleneck) {
    primaryBottleneck = behavioralBottleneck;
    if (academicBottleneck) secondaryBottlenecks.push(academicBottleneck);
  } else {
    primaryBottleneck = academicBottleneck;
  }

  return { primaryBottleneck, secondaryBottlenecks };
}

console.log("=== EXECUTING BAC MASTERY ONBOARDING UNIT TESTS ===");

// TEST 1: Technique Math specialty resolution
console.log("\n[TEST 1] Technique Math specialty subject resolution...");
{
  const civil = getStreamSubjects("technique_math", "civil_eng");
  const civilRule = civil.find((s) => s.subjectId === "civil_eng");
  assert(civilRule, "Civil engineering subject must be resolved");
  assert.strictEqual(civilRule.coefficient, 7, "Civil engineering must have coefficient 7");
  console.log("  ✓ Technique Math resolution verified (Coef 7 assigned).");
}

// TEST 2: Gap Calculation on Science student (Target 16, weak math, strong biology)
console.log("\n[TEST 2] Gap calculation on realistic Science student (Target 16.0)...");
{
  const profile = {
    streamId: "sciences_exp",
    targetScore: 16.0,
    subjectEstimates: {
      natural_sciences: 5, // 18.0 * 6 = 108
      physics: 3,          // 12.0 * 5 = 60
      math: 2,             // 9.5  * 5 = 47.5
      arabic: 3,           // 12.0 * 3 = 36
      philosophy: 3,       // 12.0 * 2 = 24
      french: 3,           // 12.0 * 2 = 24
      english: 4,          // 15.0 * 2 = 30
      islamic_studies: 4,  // 15.0 * 2 = 30
      history_geography: 3,// 12.0 * 2 = 24
    },
    availableTime: "12_to_18",
    obstacles: ["understand_but_fail_exercises"],
  };

  const gap = calculateInitialStrategicGap(profile);
  console.log(`  - Target Score: ${gap.targetScore}`);
  console.log(`  - Estimated Baseline Score: ${gap.estimatedBaselineScore} / 20`);
  console.log(`  - Approximate Strategic Gap: ${gap.approximateGap} points`);
  console.log(`  - Top Subject Weighted Gap: ${gap.subjectGaps[0].subjectId} (gap: ${gap.subjectGaps[0].weightedGap})`);

  assert.strictEqual(gap.subjectGaps[0].subjectId, "math", "Math must be the largest academic gap");
  assert(gap.estimatedBaselineScore > 13.0 && gap.estimatedBaselineScore < 14.5);
  assert(gap.approximateGap >= 2.0 && gap.approximateGap <= 3.0);
  console.log("  ✓ Gap calculation verified without false precision.");
}

// TEST 3: Bottleneck detection - Acute subject vs Behavioral
console.log("\n[TEST 3] Bottleneck detection scenarios...");
{
  // Scenario A: Acute subject weakness
  const profA = {
    streamId: "sciences_exp",
    targetScore: 16.0,
    subjectEstimates: { math: 1, natural_sciences: 4, physics: 4 },
    availableTime: "12_to_18",
    obstacles: ["understand_but_fail_exercises"],
  };
  const gapA = calculateInitialStrategicGap(profA);
  const resA = detectStrategicBottleneck(profA, gapA);
  assert.strictEqual(resA.primaryBottleneck.targetSubjectId, "math", "Math must be primary bottleneck");
  console.log("  ✓ Scenario A: Acute Math weakness detected as primary bottleneck.");

  // Scenario B: Balanced subjects but time deficit (< 5 hours)
  const profB = {
    streamId: "sciences_exp",
    targetScore: 16.0,
    subjectEstimates: { math: 4, natural_sciences: 4, physics: 4 },
    availableTime: "less_than_5",
    obstacles: ["start_and_stop"],
  };
  const gapB = calculateInitialStrategicGap(profB);
  const resB = detectStrategicBottleneck(profB, gapB);
  assert.strictEqual(resB.primaryBottleneck.category, "time_management", "Time deficit must be primary bottleneck");
  console.log("  ✓ Scenario B: Time management/consistency detected as primary bottleneck.");

  // Scenario C: Balanced subjects, methodology obstacle
  const profC = {
    streamId: "sciences_exp",
    targetScore: 15.0,
    subjectEstimates: { math: 3, natural_sciences: 3, physics: 3 },
    availableTime: "12_to_18",
    obstacles: ["understand_but_fail_exercises"],
  };
  const gapC = calculateInitialStrategicGap(profC);
  const resC = detectStrategicBottleneck(profC, gapC);
  assert.strictEqual(resC.primaryBottleneck.category, "methodology_application", "Methodology must be primary bottleneck");
  console.log("  ✓ Scenario C: Methodology/exercise application detected as primary bottleneck.");
}

console.log("\n=== ALL 3 SUITES OF ONBOARDING TESTS PASSED (100% SUCCESS) ===");
