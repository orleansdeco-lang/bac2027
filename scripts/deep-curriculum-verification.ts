import { ContentService } from "../src/lib/services/content-service";
import { ALGERIAN_BAC_STREAMS } from "../src/lib/constants/streams";
import { getSkillLearningBundle } from "../src/domain/content/mappings";
import { StreamId } from "../src/types/education";

const ALL_STREAMS: StreamId[] = [
  "sciences_exp",
  "math",
  "technique_math",
  "gestion_eco",
  "lettres_philo",
  "langues_etrangeres",
];

interface SubjectAuditResult {
  subjectId: string;
  totalSkills: number;
  resolvedBundles: number;
  masteryReadyCount: number;
  hasPracticeQuestions: number;
  hasRetest: number;
  hasRepairGuide: number;
}

interface StreamAuditResult {
  streamId: StreamId;
  streamNameAr: string;
  totalSkills: number;
  subjects: Record<string, SubjectAuditResult>;
  anomalies: string[];
}

const auditResults: StreamAuditResult[] = [];
let grandTotalSkills = 0;
let grandTotalResolved = 0;
let totalAnomalies = 0;

console.log("==================================================================");
console.log("   AUDITING 100% BAC CURRICULUM COVERAGE ACROSS ALL 6 STREAMS");
console.log("==================================================================\n");

for (const streamId of ALL_STREAMS) {
  const streamDef = ALGERIAN_BAC_STREAMS[streamId];
  const streamName = streamDef ? streamDef.name_ar : streamId;
  const skills = ContentService.getSkillsForStream(streamId);

  const streamAudit: StreamAuditResult = {
    streamId,
    streamNameAr: streamName,
    totalSkills: skills.length,
    subjects: {},
    anomalies: [],
  };

  grandTotalSkills += skills.length;

  for (const skill of skills) {
    const subj = skill.subjectId;
    if (!streamAudit.subjects[subj]) {
      streamAudit.subjects[subj] = {
        subjectId: subj,
        totalSkills: 0,
        resolvedBundles: 0,
        masteryReadyCount: 0,
        hasPracticeQuestions: 0,
        hasRetest: 0,
        hasRepairGuide: 0,
      };
    }

    const subRecord = streamAudit.subjects[subj];
    subRecord.totalSkills++;

    const bundle = getSkillLearningBundle(skill.id);
    if (!bundle) {
      streamAudit.anomalies.push(`[${subj}] Skill '${skill.id}' (${skill.title_ar}) failed getSkillLearningBundle resolution.`);
      totalAnomalies++;
      continue;
    }

    subRecord.resolvedBundles++;
    grandTotalResolved++;

    if (bundle.readiness?.status === "MASTERY_READY" || bundle.readiness?.status === "CONTENT_READY") {
      subRecord.masteryReadyCount++;
    } else {
      streamAudit.anomalies.push(`[${subj}] Skill '${skill.id}' readiness is NOT_READY.`);
      totalAnomalies++;
    }

    if (bundle.practiceQuestions && bundle.practiceQuestions.length >= 1) {
      subRecord.hasPracticeQuestions++;
    } else {
      streamAudit.anomalies.push(`[${subj}] Skill '${skill.id}' is missing practice questions.`);
      totalAnomalies++;
    }

    if (bundle.retest && (bundle.retest.prompt_ar || (bundle.retest as any).question)) {
      subRecord.hasRetest++;
    } else {
      streamAudit.anomalies.push(`[${subj}] Skill '${skill.id}' is missing isomorphic retest.`);
      totalAnomalies++;
    }

    if (bundle.repairGuide && (bundle.repairGuide.repairSteps_ar?.length || (bundle.repairGuide as any).steps?.length)) {
      subRecord.hasRepairGuide++;
    } else {
      streamAudit.anomalies.push(`[${subj}] Skill '${skill.id}' is missing repair guide.`);
      totalAnomalies++;
    }
  }

  // Check for under-covered subjects (<= 1 lesson)
  for (const [subj, record] of Object.entries(streamAudit.subjects)) {
    if (record.totalSkills <= 1) {
      streamAudit.anomalies.push(`CRITICAL: Subject '${subj}' has only ${record.totalSkills} skill(s)!`);
      totalAnomalies++;
    }
  }

  auditResults.push(streamAudit);
}

// Print Report
for (const res of auditResults) {
  console.log(`\n------------------------------------------------------------`);
  console.log(`🎓 شعبة: ${res.streamNameAr} (${res.streamId}) | إجمالي المهارات: ${res.totalSkills}`);
  console.log(`------------------------------------------------------------`);

  for (const [subj, sub] of Object.entries(res.subjects)) {
    const isPerfect = sub.totalSkills === sub.resolvedBundles &&
                      sub.totalSkills === sub.masteryReadyCount &&
                      sub.totalSkills === sub.hasPracticeQuestions &&
                      sub.totalSkills === sub.hasRetest &&
                      sub.totalSkills === sub.hasRepairGuide;
    const statusIcon = isPerfect ? "✅" : "⚠️";
    console.log(`  ${statusIcon} مادة [${subj}]: ${sub.totalSkills} دروس كاملة (تمارين: ${sub.hasPracticeQuestions}, إعادة اختبار: ${sub.hasRetest}, أدلة معالجة: ${sub.hasRepairGuide})`);
  }

  if (res.anomalies.length > 0) {
    console.log(`  ❌ شذوذ مكتشف (${res.anomalies.length}):`);
    res.anomalies.forEach(a => console.log(`     - ${a}`));
  } else {
    console.log(`  ✨ حالة الشعبة: تغطية سليمة 100% دون أي شذوذ أو مواد ناقصة.`);
  }
}

console.log("\n==================================================================");
console.log(`GRAND AUDIT SUMMARY:`);
console.log(`  - Total Skills Checked across Streams: ${grandTotalSkills}`);
console.log(`  - Total Bundles Resolved: ${grandTotalResolved}`);
console.log(`  - Total Anomalies / Incompletes: ${totalAnomalies}`);
console.log("==================================================================");

if (totalAnomalies === 0) {
  console.log("🏆 100% CURRICULUM VERIFICATION PASSED WITH ZERO ANOMALIES!");
  process.exit(0);
} else {
  console.error(`❌ FAILED WITH ${totalAnomalies} ANOMALIES!`);
  process.exit(1);
}
