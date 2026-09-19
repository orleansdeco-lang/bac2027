import { getSkillLearningBundle } from "../src/domain/content/mappings";
import { CANONICAL_SCIENCES_EXP_SKILLS } from "../src/data/skills/canonical-sciences";
import { CURRICULUM_TOPICS } from "../src/data/curriculum/topics";
import { PROMPT12_LESSONS } from "../src/domain/content/lessons";
import { PROMPT12_REPAIR_GUIDES } from "../src/domain/content/repair-guides";
import { ALL_PRACTICE_QUESTIONS } from "../src/data/curriculum";

console.log("=== VERIFYING math_complex_numbers_polar_form INTEGRATION ===");

// 1. Check Topic
const topic = CURRICULUM_TOPICS.find((t) => t.id === "math_topic_complex_numbers");
console.log("1. Topic registered:", Boolean(topic), topic ? `[${topic.id}] ${topic.title_ar}` : "NOT FOUND");

// 2. Check Skill in Canonical Skills
const skill = CANONICAL_SCIENCES_EXP_SKILLS["math_complex_numbers_polar_form"];
console.log("2. Skill in canonical registry:", Boolean(skill), skill ? `[${skill.id}] ${skill.title_ar}` : "NOT FOUND");

// 3. Check Lesson in PROMPT12_LESSONS
const lesson = PROMPT12_LESSONS.find((l) => l.skillId === "math_complex_numbers_polar_form");
console.log("3. Lesson in PROMPT12_LESSONS:", Boolean(lesson), lesson ? `[${lesson.id}] ${lesson.title_ar}` : "NOT FOUND");

// 4. Check Practice Questions
const practice = ALL_PRACTICE_QUESTIONS.filter((q) => q.skillId === "math_complex_numbers_polar_form");
console.log("4. Practice questions count:", practice.length);
practice.forEach((q) => console.log(`   - ${q.id} (Retest: ${q.isRetestVariant})`));

// 5. Check Repair Guide
const repair = PROMPT12_REPAIR_GUIDES.find((r) => r.skillId === "math_complex_numbers_polar_form");
console.log("5. Repair guide found:", Boolean(repair), repair ? `[${repair.id}] ${repair.title_ar}` : "NOT FOUND");

// 6. Test getSkillLearningBundle
const bundle = getSkillLearningBundle("math_complex_numbers_polar_form");
console.log("6. Full Learning Bundle resolves:", Boolean(bundle));
if (bundle) {
  console.log("   - Skill:", bundle.skill?.title_ar);
  console.log("   - Lesson:", bundle.lesson?.title_ar);
  console.log("   - Worked Example:", Boolean(bundle.workedExample));
  console.log("   - Practice Questions:", bundle.practiceQuestions?.length);
  console.log("   - Retest Question:", bundle.retest?.id);
  console.log("   - Repair Guide:", bundle.repairGuide?.title_ar);
  console.log("   - Readiness Status:", bundle.readiness?.status);
}

if (!topic || !skill || !lesson || practice.length < 2 || !repair || !bundle) {
  console.error("\n❌ VERIFICATION FAILED!");
  process.exit(1);
} else {
  console.log("\n✅ ALL CHECKS PASSED PERFECTLY!");
}
