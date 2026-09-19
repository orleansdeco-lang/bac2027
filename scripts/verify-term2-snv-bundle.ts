import { getSkillLearningBundle } from "../src/domain/content/mappings";
import { CANONICAL_SCIENCES_EXP_SKILLS } from "../src/data/skills/canonical-sciences";
import { CURRICULUM_TOPICS } from "../src/data/curriculum/topics";
import { PROMPT12_LESSONS } from "../src/domain/content/lessons";
import { PROMPT12_REPAIR_GUIDES } from "../src/domain/content/repair-guides";
import { ALL_PRACTICE_QUESTIONS } from "../src/data/curriculum";

const TARGET_SKILLS = [
  {
    skillId: "snv_photosynthesis_light_reactions",
    expectedTopicId: "snv_topic_photosynthesis",
    title: "التركيب الضوئي: تفاعلات المرحلة الكيموضوئية على مستوى غشاء التيلاكوئيد",
  },
  {
    skillId: "snv_cellular_respiration_krebs_cycle",
    expectedTopicId: "snv_topic_respiration",
    title: "التنفس الخلوي: التحلل السكري، أكسدة حمض البيروفيك وحلقة كريبس في المتقدرة",
  },
  {
    skillId: "snv_geology_earth_structure_subduction",
    expectedTopicId: "snv_topic_geology",
    title: "الجيولوجيا والتكتونية العامة: بنية الأرض ونموذج الغوص التكتوني",
  },
];

console.log("==================================================================");
console.log("  VERIFYING SNV_TERM2_3_SCIENCES_BUNDLE INTEGRATION");
console.log("==================================================================\n");

let allPassed = true;

for (const target of TARGET_SKILLS) {
  console.log(`--- [Skill: ${target.skillId}] ---`);

  // 1. Check Topic
  const topic = CURRICULUM_TOPICS.find((t) => t.id === target.expectedTopicId);
  console.log(`1. Topic [${target.expectedTopicId}]:`, Boolean(topic) ? `✅ Found (${topic?.title_ar})` : "❌ NOT FOUND");
  if (!topic) allPassed = false;

  // 2. Check Canonical Skill
  const skill = CANONICAL_SCIENCES_EXP_SKILLS[target.skillId];
  console.log(`2. Canonical Skill:`, Boolean(skill) ? `✅ Registered (${skill?.title_ar})` : "❌ NOT FOUND");
  if (!skill) allPassed = false;

  // 3. Check Lesson
  const lesson = PROMPT12_LESSONS.find((l) => l.skillId === target.skillId);
  console.log(`3. 14-Element Lesson:`, Boolean(lesson) ? `✅ Present (${lesson?.id})` : "❌ NOT FOUND");
  if (!lesson) allPassed = false;

  // 4. Check Practice & Retest
  const practice = ALL_PRACTICE_QUESTIONS.filter((q) => q.skillId === target.skillId);
  const regular = practice.filter((q) => !q.isRetestVariant);
  const retest = practice.filter((q) => q.isRetestVariant);
  console.log(`4. Questions count:`, practice.length, `(Practice: ${regular.length}, Retest: ${retest.length})`);
  if (regular.length < 1 || retest.length < 1) {
    console.log("❌ Missing practice or retest questions!");
    allPassed = false;
  } else {
    console.log(`   ✅ Practice: ${regular[0].id} (Answer: ${regular[0].correctAnswerId})`);
    console.log(`   ✅ Retest: ${retest[0].id} (Answer: ${retest[0].correctAnswerId})`);
  }

  // 5. Check Repair Guide
  const repair = PROMPT12_REPAIR_GUIDES.find((r) => r.skillId === target.skillId);
  console.log(`5. Repair Guide:`, Boolean(repair) ? `✅ Found (${repair?.id}: ${repair?.title_ar})` : "❌ NOT FOUND");
  if (!repair) allPassed = false;

  // 6. Test Learning Bundle Resolution
  const bundle = getSkillLearningBundle(target.skillId);
  console.log(`6. Full Learning Bundle:`, Boolean(bundle) ? "✅ Resolves" : "❌ FAILED");
  if (bundle) {
    console.log(`   - Readiness: ${bundle.readiness?.status}`);
    console.log(`   - Has Lesson: ${Boolean(bundle.lesson)}`);
    console.log(`   - Worked Example: ${Boolean(bundle.workedExample)}`);
    console.log(`   - Practice Count: ${bundle.practiceQuestions?.length}`);
    console.log(`   - Retest Question: ${Boolean(bundle.retest)}`);
    console.log(`   - Repair Guide: ${Boolean(bundle.repairGuide)}`);
  } else {
    allPassed = false;
  }
  console.log();
}

console.log("==================================================================");
if (allPassed) {
  console.log("🎉 ALL 3 SKILLS IN SNV_TERM2_3_SCIENCES_BUNDLE FULLY VERIFIED!");
} else {
  console.error("❌ ONE OR MORE VERIFICATIONS FAILED!");
  process.exit(1);
}
console.log("==================================================================");
