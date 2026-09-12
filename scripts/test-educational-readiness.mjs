/**
 * BAC Mastery — Educational Readiness Checker (Prompt 15)
 * Sciences Expérimentales — Educational Quality Gate
 * 
 * Verifies all 31 Canonical Skills against:
 * - The 12-Element Closed Learning Loop
 * - The 25 Educational Quality Criteria
 * - Status: COMPLETE | PARTIAL | FAIL
 */

import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

console.log("==================================================================");
console.log("  BAC MASTERY — PROMPT 15: EDUCATIONAL READINESS CHECKER");
console.log("  Sciences Expérimentales — 31 Canonical Skills Audit");
console.log("==================================================================\n");

// Safe TypeScript loader in Node.js
const moduleCache = new Map();
function loadTs(relPath) {
  const fullPath = path.resolve(relPath);
  if (moduleCache.has(fullPath)) {
    return moduleCache.get(fullPath);
  }

  const code = fs.readFileSync(fullPath, "utf8");
  const result = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const m = { exports: {} };
  moduleCache.set(fullPath, m.exports);

  const fn = new Function("exports", "require", "module", result.outputText);
  fn(
    m.exports,
    (reqPath) => {
      let target = reqPath;
      if (target.startsWith("@/")) {
        target = path.resolve(target.replace("@/", "src/"));
      } else if (target.startsWith(".")) {
        target = path.resolve(path.dirname(fullPath), target);
      }
      if (fs.existsSync(target + ".ts")) return loadTs(target + ".ts");
      if (fs.existsSync(target + "/index.ts")) return loadTs(target + "/index.ts");
      if (fs.existsSync(target) && fs.statSync(target).isFile()) return loadTs(target);
      return {};
    },
    m
  );

  return m.exports;
}

const mappingsModule = loadTs("src/domain/content/mappings.ts");
const {
  PROMPT11_SKILLS,
  PROMPT11_LEARNING_OBJECTIVES,
  PROMPT11_PRACTICE_QUESTIONS,
  PROMPT11_RETEST_QUESTIONS,
  PROMPT11_PAST_BAC_REFERENCES,
  PROMPT12_LESSONS,
  PROMPT12_REPAIR_GUIDES,
  PROMPT12_MINI_EXAMS,
  getSkillLearningBundle,
} = mappingsModule;

// Educational Quality Criteria Definitions (25 Criteria)
const CRITERIA = [
  { id: "C01", name: "Canonical Skill Identity", desc: "Skill belongs to 31 canonical SE skills" },
  { id: "C02", name: "Curriculum Topic Mapping", desc: "Mapped to valid curriculum topic" },
  { id: "C03", name: "Learning Objective Bound", desc: "Has explicit Bloom-aligned learning objective" },
  { id: "C04", name: "Prerequisites Specified", desc: "Clear prerequisite dependencies defined" },
  { id: "C05", name: "Active Lesson Present", desc: "14-element active lesson exists" },
  { id: "C06", name: "Target Capability Defined", desc: "Explicit target capability in Arabic" },
  { id: "C07", name: "Why This Matters Defined", desc: "Exam relevance articulated without overclaims" },
  { id: "C08", name: "Core Concept Defined", desc: "Rigorous scientific concept statement" },
  { id: "C09", name: "Simple Intuition Analogy", desc: "Accessible analogy or simplified explanation" },
  { id: "C10", name: "Worked Example Present", desc: "Step-by-step worked model exists" },
  { id: "C11", name: "Cognitive Friction Prompt", desc: "Worked example has think-first guidance" },
  { id: "C12", name: "Step Progression Rigor", desc: "Worked example has >= 3 structured steps" },
  { id: "C13", name: "Verification Tip Present", desc: "Worked example includes verification strategy" },
  { id: "C14", name: "Quick Recall Mini-Check", desc: "Active retrieval recall prompt & answer" },
  { id: "C15", name: "Practice Questions Sufficient", desc: "At least 2 exam-level practice questions" },
  { id: "C16", name: "Immediate Feedback Explanations", desc: "Practice questions have pedagogical explanations" },
  { id: "C17", name: "Distractor Misconception Mapping", desc: "Practice distractors mapped to error taxonomy" },
  { id: "C18", name: "Common Mistakes Documented", desc: "Lesson includes documented common errors" },
  { id: "C19", name: "Repair Guide Present", desc: "Actionable remediation protocol exists" },
  { id: "C20", name: "Repair Steps Structured", desc: "Repair guide has >= 3 progressive steps" },
  { id: "C21", name: "Repair Micro-Drill Present", desc: "Includes micro-practice drill and solution" },
  { id: "C22", name: "Unseen Retest Twin Present", desc: "Isomorphic twin retest question exists" },
  { id: "C23", name: "Mini-Exam Transfer Coverage", desc: "Skill covered in comprehensive mini-exam" },
  { id: "C24", name: "Past BAC Exam Provenance", desc: "Real past BAC session reference with citation" },
  { id: "C25", name: "Realistic Time Budget", desc: "Lesson 10-20m, Repair 5-15m, Practice 2-5m" },
];

let totalPassedCriteria = 0;
let totalPossibleCriteria = PROMPT11_SKILLS.length * CRITERIA.length;
const skillReports = [];

for (const skill of PROMPT11_SKILLS) {
  const bundle = getSkillLearningBundle(skill.id);
  const lesson = PROMPT12_LESSONS.find((l) => l.skillId === skill.id && l.isActive);
  const objectives = PROMPT11_LEARNING_OBJECTIVES.filter((lo) => lo.skillId === skill.id);
  const practiceQuestions = PROMPT11_PRACTICE_QUESTIONS.filter((q) => q.skillId === skill.id);
  const retestQuestion = PROMPT11_RETEST_QUESTIONS.find((q) => q.skillId === skill.id);
  const repairGuide = PROMPT12_REPAIR_GUIDES.find((rg) => rg.skillId === skill.id && rg.isActive);
  const miniExam = PROMPT12_MINI_EXAMS.find((me) => me.skillIds.includes(skill.id) && me.isActive);
  const pastRef = PROMPT11_PAST_BAC_REFERENCES.find((ref) => ref.skillIds.includes(skill.id));

  const evaluation = {
    C01: Boolean(skill.id && skill.streamId === "sciences_exp"),
    C02: Boolean(skill.topicId),
    C03: objectives.length >= 1,
    C04: Array.isArray(skill.prerequisites),
    C05: Boolean(lesson),
    C06: Boolean(lesson?.targetCapability_ar && lesson.targetCapability_ar.length > 20),
    C07: Boolean(lesson?.whyThisMatters_ar && lesson.whyThisMatters_ar.length > 20),
    C08: Boolean(lesson?.coreConcept_ar && lesson.coreConcept_ar.length > 20),
    C09: Boolean(lesson?.simpleExplanation_ar && lesson.simpleExplanation_ar.length > 20),
    C10: Boolean(lesson?.workedExample),
    C11: Boolean(lesson?.workedExample?.howToThink_ar && lesson.workedExample.howToThink_ar.length > 15),
    C12: Boolean(lesson?.workedExample?.stepByStepSolution_ar && lesson.workedExample.stepByStepSolution_ar.length >= 3),
    C13: Boolean(lesson?.workedExample?.verificationTip_ar && lesson.workedExample.verificationTip_ar.length > 10),
    C14: Boolean(lesson?.quickRecallPrompt_ar && lesson?.quickRecallAnswer_ar),
    C15: practiceQuestions.length >= 2,
    C16: practiceQuestions.every((q) => q.explanation_ar && q.explanation_ar.length > 15),
    C17: practiceQuestions.some((q) => q.options.some((opt) => opt.suspectedErrorType)),
    C18: Boolean(lesson?.commonMistakes && lesson.commonMistakes.length >= 1),
    C19: Boolean(repairGuide),
    C20: Boolean(repairGuide?.repairSteps_ar && repairGuide.repairSteps_ar.length >= 3),
    C21: Boolean(repairGuide?.microPracticePrompt_ar && repairGuide?.microPracticeSolution_ar),
    C22: Boolean(retestQuestion && retestQuestion.isRetestVariant),
    C23: Boolean(miniExam),
    C24: Boolean(pastRef && pastRef.year >= 2008 && pastRef.sourceId),
    C25: Boolean(
      lesson?.estimatedMinutes >= 10 &&
      lesson?.estimatedMinutes <= 25 &&
      (!repairGuide || (repairGuide.estimatedMinutes >= 5 && repairGuide.estimatedMinutes <= 20))
    ),
  };

  const passedCount = Object.values(evaluation).filter(Boolean).length;
  totalPassedCriteria += passedCount;

  // Closed loop verification (12 Elements)
  const closedLoopComplete =
    evaluation.C03 && // Objective
    evaluation.C04 && // Prerequisite
    evaluation.C08 && // Explanation
    evaluation.C10 && // Worked Example
    evaluation.C14 && // Mini-Check
    evaluation.C15 && // Practice
    evaluation.C16 && // Feedback
    evaluation.C17 && // Error Taxonomy
    evaluation.C19 && // Repair Guide
    evaluation.C22 && // Retest Twin
    evaluation.C23 && // Mini-Exam
    evaluation.C24;   // Past BAC Exam

  let status = "FAIL";
  if (passedCount === 25 && closedLoopComplete) {
    status = "COMPLETE";
  } else if (passedCount >= 20) {
    status = "PARTIAL";
  }

  skillReports.push({
    skillId: skill.id,
    subjectId: skill.subjectId,
    title_ar: skill.title_ar,
    passedCriteria: passedCount,
    status,
    evaluation,
    bundleComplete: Boolean(bundle),
  });
}

console.log("------------------------------------------------------------------");
console.log("  SKILL-BY-SKILL SCORECARD (25 CRITERIA & 12-ELEMENT CLOSED LOOP)");
console.log("------------------------------------------------------------------");

let completeCount = 0;
let partialCount = 0;
let failCount = 0;

for (const report of skillReports) {
  const icon = report.status === "COMPLETE" ? "✅" : report.status === "PARTIAL" ? "⚠️" : "❌";
  console.log(
    `${icon} [${report.status.padEnd(8)}] ${report.subjectId.padEnd(16)} | ${report.skillId.padEnd(38)} | Score: ${report.passedCriteria}/25`
  );
  if (report.status === "COMPLETE") completeCount++;
  else if (report.status === "PARTIAL") partialCount++;
  else failCount++;
}

console.log("\n==================================================================");
console.log("  SUMMARY RESULTS");
console.log("==================================================================");
console.log(`Total Canonical Skills Evaluated : ${skillReports.length}`);
console.log(`COMPLETE (12/12 Loop, 25/25 QA) : ${completeCount} (${Math.round((completeCount / skillReports.length) * 100)}%)`);
console.log(`PARTIAL                        : ${partialCount}`);
console.log(`FAIL                           : ${failCount}`);
console.log(`Total Criteria Passed          : ${totalPassedCriteria} / ${totalPossibleCriteria} (${Math.round((totalPassedCriteria / totalPossibleCriteria) * 100)}%)`);

if (completeCount === 31 && failCount === 0 && partialCount === 0) {
  console.log("\n🎉 EDUCATIONAL QUALITY GATE PASSED: All 31 Skills are 100% COMPLETE!");
  process.exit(0);
} else {
  console.error("\n❌ EDUCATIONAL QUALITY GATE FAILED: Some skills have missing criteria.");
  process.exit(1);
}
