import { ContentService } from "../src/lib/services/content-service";
import { ALGERIAN_BAC_STREAMS, ALL_SUBJECTS } from "../src/lib/constants/streams";
import { StreamId, SubjectId } from "../src/types/education";
import { getSkillLearningBundle } from "../src/domain/content/mappings";

console.log("=== COMPACT STREAM AUDIT TABLE ===");

const streams: StreamId[] = [
  "sciences_exp",
  "math",
  "technique_math",
  "gestion_eco",
  "lettres_philo",
  "langues_etrangeres",
];

for (const streamId of streams) {
  const streamDef = ALGERIAN_BAC_STREAMS[streamId];
  const streamSkills = ContentService.getSkillsForStream(streamId);
  const streamSubjMap: Record<string, any[]> = {};
  for (const s of streamSkills) {
    if (!streamSubjMap[s.subjectId]) streamSubjMap[s.subjectId] = [];
    streamSubjMap[s.subjectId].push(s);
  }

  console.log(`\n============================================================`);
  console.log(`🎓 ${streamDef.name_ar} (${streamId}) - إجمالي: ${streamSkills.length}`);
  console.log(`============================================================`);

  for (const subjRule of streamDef.subjects) {
    const subjId = subjRule.subjectId;
    const subjName = ALL_SUBJECTS[subjId]?.name_ar || subjId;
    const list = streamSubjMap[subjId] || [];
    let withFullLesson = 0;
    for (const sk of list) {
      const b = getSkillLearningBundle(sk.id);
      if (b && b.lesson && (b.lesson as any).sections && (b.lesson as any).sections.length > 0) {
        withFullLesson++;
      } else if (b && b.lesson && b.lesson.simpleExplanation_ar) {
        withFullLesson++;
      }
    }

    const warning = list.length === 0 ? " ❌ [0 دروس - منعدمة تماماً!]" 
                  : list.length === 1 ? " ⚠️ [درس واحد فقط!]" 
                  : list.length <= 3 ? ` ⚠️ [ناقصة جداً: ${list.length} فقط]` 
                  : ` ✅ (${list.length})`;

    console.log(`  • ${subjName} (${subjId}) [معامل ${subjRule.coefficient}]: مسجلة = ${list.length}, دروس حقيقية = ${withFullLesson}${warning}`);
  }
}
