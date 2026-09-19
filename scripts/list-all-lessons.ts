import { MATH_LESSONS } from "../src/domain/content/lessons/math";
import { PHYSICS_LESSONS } from "../src/domain/content/lessons/physics";
import { SNV_LESSONS } from "../src/domain/content/lessons/snv";

console.log("=== DETAILED PROMPT12 LESSONS ===");
console.log("\n--- MATH LESSONS (Total:", MATH_LESSONS.length, ") ---");
MATH_LESSONS.forEach((l, i) => console.log(`${i+1}. [${l.skillId}] ${l.title_ar}`));

console.log("\n--- PHYSICS LESSONS (Total:", PHYSICS_LESSONS.length, ") ---");
PHYSICS_LESSONS.forEach((l, i) => console.log(`${i+1}. [${l.skillId}] ${l.title_ar}`));

console.log("\n--- SNV LESSONS (Total:", SNV_LESSONS.length, ") ---");
SNV_LESSONS.forEach((l, i) => console.log(`${i+1}. [${l.skillId}] ${l.title_ar}`));
