import { ContentService } from "../src/lib/services/content-service";
import { ALGERIAN_BAC_STREAMS, ALL_SUBJECTS } from "../src/lib/constants/streams";
import { StreamId, SubjectId } from "../src/types/education";
import { getSkillLearningBundle } from "../src/domain/content/mappings";

console.log("==================================================================");
console.log("  DETAILED AUDIT OF ALL SUBJECTS AND LESSONS PER STREAM");
console.log("==================================================================\n");

const streams: StreamId[] = [
  "sciences_exp",
  "math",
  "technique_math",
  "gestion_eco",
  "lettres_philo",
  "langues_etrangeres",
];

const allSkills = ContentService.getAllSkills();
console.log(`Total canonical skills in ContentService: ${allSkills.length}`);

// Group by subject across entire platform
const subjectSkillMap: Record<string, any[]> = {};
for (const s of allSkills) {
  const subj = s.subjectId;
  if (!subjectSkillMap[subj]) subjectSkillMap[subj] = [];
  subjectSkillMap[subj].push(s);
}

console.log("\n--- OVERALL SKILLS COUNT PER SUBJECT IN PLATFORM ---");
for (const [subj, list] of Object.entries(subjectSkillMap)) {
  const subjName = ALL_SUBJECTS[subj as SubjectId]?.name_ar || subj;
  console.log(`• ${subjName} (${subj}): ${list.length} skill(s)`);
}

console.log("\n==================================================================");
console.log("  PER-STREAM BREAKDOWN OF SUBJECTS AND LESSONS");
console.log("==================================================================");

for (const streamId of streams) {
  const streamDef = ALGERIAN_BAC_STREAMS[streamId];
  const streamSkills = ContentService.getSkillsForStream(streamId);
  console.log(`\n============================================================`);
  console.log(`🎓 شعبة: ${streamDef.name_ar} (${streamDef.name_fr}) [${streamId}]`);
  console.log(`إجمالي المهارات/الدروس المسجلة للشعبة: ${streamSkills.length}`);
  console.log(`============================================================`);

  // Count skills by subject in this stream
  const streamSubjMap: Record<string, any[]> = {};
  for (const s of streamSkills) {
    if (!streamSubjMap[s.subjectId]) streamSubjMap[s.subjectId] = [];
    streamSubjMap[s.subjectId].push(s);
  }

  // Check against all official subjects of this stream
  for (const subjRule of streamDef.subjects) {
    const subjId = subjRule.subjectId;
    const subjName = ALL_SUBJECTS[subjId]?.name_ar || subjId;
    const skillsInSubj = streamSubjMap[subjId] || [];
    const coeff = subjRule.coefficient;
    const isCore = subjRule.isCoreSubject;

    const statusIcon = skillsInSubj.length === 0 
      ? "🔴 فارغة تماماً (0)" 
      : skillsInSubj.length <= 2 
        ? `⚠️ ناقصة جداً (${skillsInSubj.length} فقط)` 
        : `✅ (${skillsInSubj.length})`;

    console.log(`  - [معامل ${coeff}${isCore ? ' - أساسية' : ''}] ${subjName} (${subjId}): ${statusIcon}`);
    if (skillsInSubj.length > 0) {
      for (const sk of skillsInSubj) {
        const bundle = getSkillLearningBundle(sk.id);
        const hasLesson = bundle?.lesson ? "درس متوفر" : "لا يوجد درس كامل";
        console.log(`      * [${sk.id}] ${sk.title_ar} (${hasLesson})`);
      }
    }
  }
}
