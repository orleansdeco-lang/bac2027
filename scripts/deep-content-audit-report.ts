import { ALGERIAN_BAC_STREAMS, ALL_SUBJECTS } from "../src/lib/constants/streams";
import { PROMPT12_LESSONS } from "../src/domain/content/lessons";
import { MATH_LESSONS } from "../src/domain/content/lessons/math";
import { PHYSICS_LESSONS } from "../src/domain/content/lessons/physics";
import { SNV_LESSONS } from "../src/domain/content/lessons/snv";
import { MATH_BATCH_01_PACKAGES } from "../src/domain/content-factory/math-batch-01";
import { GESTION_ECO_PACKAGES } from "../src/domain/content/gestion-eco-mappings";
import { CANONICAL_SCIENCES_EXP_SKILLS } from "../src/data/skills/canonical-sciences";
import { GESTION_ECO_SKILLS } from "../src/data/skills/gestion-economie";
import { LETTRES_PHILO_SKILLS } from "../src/data/skills/lettres-philo";
import { SCIENCES_EXP_SKILLS } from "../src/data/skills/index";
import { ALL_PRACTICE_QUESTIONS } from "../src/data/curriculum";
import { CURRICULUM_TOPICS } from "../src/data/curriculum/topics";
import { PROMPT12_REPAIR_GUIDES } from "../src/domain/content/repair-guides";

console.log("=== COMPREHENSIVE CURRICULUM & LESSONS AUDIT ===");

console.log("\n1. STREAMS OVERVIEW:");
for (const [streamId, stream] of Object.entries(ALGERIAN_BAC_STREAMS)) {
  console.log(`\n--- Stream: ${stream.name_ar} (${stream.name_fr}) [ID: ${streamId}] ---`);
  console.log(`Subjects count: ${stream.subjects.length}`);
  for (const s of stream.subjects) {
    const subjMeta = ALL_SUBJECTS[s.subjectId];
    console.log(`  - ${subjMeta?.name_ar || s.subjectId} (${subjMeta?.name_fr || s.subjectId}) | معامل: ${s.coefficient} | أساسية: ${s.isCoreSubject ? 'نعم' : 'لا'}`);
  }
}

console.log("\n2. AUTHORED LESSONS (PROMPT12_LESSONS):");
console.log(`Total PROMPT12_LESSONS: ${PROMPT12_LESSONS.length}`);
console.log(`  - Mathematics: ${MATH_LESSONS.length}`);
console.log(`  - Physics: ${PHYSICS_LESSONS.length}`);
console.log(`  - SNV: ${SNV_LESSONS.length}`);

console.log("\n3. MATH FACTORY PACKAGES (MATH_BATCH_01_PACKAGES):");
const mathPkgKeys = Object.keys(MATH_BATCH_01_PACKAGES || {});
console.log(`Total Math Factory Packages: ${mathPkgKeys.length}`);
for (const k of mathPkgKeys) {
  const p = MATH_BATCH_01_PACKAGES[k];
  console.log(`  - ${p.skillId}: ${p.lesson.title_ar}`);
}

console.log("\n4. GESTION & ÉCONOMIE PACKAGES (GESTION_ECO_PACKAGES):");
const gePkgKeys = Object.keys(GESTION_ECO_PACKAGES || {});
console.log(`Total Gestion & Économie Packages: ${gePkgKeys.length}`);
const geBySubject: Record<string, number> = {};
for (const k of gePkgKeys) {
  const p = GESTION_ECO_PACKAGES[k];
  geBySubject[p.subjectId] = (geBySubject[p.subjectId] || 0) + 1;
}
console.log("  Breakdown by subject:", geBySubject);

console.log("\n5. SKILLS TAXONOMY BREAKDOWN:");
const sciSkills = Object.values(CANONICAL_SCIENCES_EXP_SKILLS || {});
console.log(`Canonical Sciences Exp Skills: ${sciSkills.length}`);
const sciSubjs: Record<string, number> = {};
for (const s of sciSkills) {
  sciSubjs[s.subjectId] = (sciSubjs[s.subjectId] || 0) + 1;
}
console.log("  Sciences Exp breakdown:", sciSubjs);

const geSkills = Object.values(GESTION_ECO_SKILLS || {});
console.log(`Gestion & Économie Skills: ${geSkills.length}`);
const geSubjs: Record<string, number> = {};
for (const s of geSkills) {
  geSubjs[s.subjectId] = (geSubjs[s.subjectId] || 0) + 1;
}
console.log("  Gestion & Économie breakdown:", geSubjs);

const lpSkills = Object.values(LETTRES_PHILO_SKILLS || {});
console.log(`Lettres & Philo Skills: ${lpSkills.length}`);
const lpSubjs: Record<string, number> = {};
for (const s of lpSkills) {
  lpSubjs[s.subjectId] = (lpSubjs[s.subjectId] || 0) + 1;
}
console.log("  Lettres & Philo breakdown:", lpSubjs);

console.log("\n6. REPAIR GUIDES & PRACTICE QUESTIONS:");
console.log(`Repair Guides: ${PROMPT12_REPAIR_GUIDES?.length || 0}`);
console.log(`Practice Questions: ${ALL_PRACTICE_QUESTIONS?.length || 0}`);
console.log(`Curriculum Topics: ${CURRICULUM_TOPICS?.length || 0}`);

