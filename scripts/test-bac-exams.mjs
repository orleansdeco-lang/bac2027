import assert from "node:assert/strict";
import {
  BAC_EXAMS_DATABASE,
  getAllBacExams,
  getBacExamById,
  filterBacExams,
  getAvailableExamYears,
  getExamSubjectIdsForStream,
} from "../src/data/exams/index.ts";

console.log("🔍 Running Algerian Baccalaureate Official Exams Archive Verification Suite...\n");

// 1. Check total count
const allExams = getAllBacExams();
console.log(`✓ Total exams indexed in catalog: ${allExams.length}`);
assert(allExams.length > 50, "Expected catalog to have more than 50 exam items");

// 2. Check Streams Coverage (All 6 official Algerian BAC streams)
const REQUIRED_STREAMS = [
  "sciences_exp",
  "math",
  "technique_math",
  "gestion_eco",
  "lettres_philo",
  "langues_etrangeres",
];

for (const streamId of REQUIRED_STREAMS) {
  const streamExams = allExams.filter((e) => e.streamId === streamId);
  console.log(`✓ Stream '${streamId}': ${streamExams.length} exams registered`);
  assert(streamExams.length > 0, `Stream ${streamId} must have exams mapped!`);
}

// 3. Check Years Coverage (2016 to 2026 inclusive)
const availableYears = getAvailableExamYears();
console.log(`\n✓ Available years detected: ${availableYears.join(", ")}`);
for (let y = 2016; y <= 2026; y++) {
  assert(availableYears.includes(y), `Year ${y} must be present in catalog!`);
  const yearExams = allExams.filter((e) => e.year === y);
  assert(yearExams.length > 0, `Year ${y} must have at least one exam entry!`);
}
console.log("✓ All years 2016 through 2026 are fully represented.");

// 4. Check Session Types (Regular and Exceptional)
const regularExams = allExams.filter((e) => e.session === "regular");
const exceptionalExams = allExams.filter((e) => e.session === "exceptional");
console.log(`\n✓ Regular session exams: ${regularExams.length}`);
console.log(`✓ Exceptional session exams: ${exceptionalExams.length}`);
assert(regularExams.length > 0, "Must have regular session exams");
assert(exceptionalExams.length > 0, "Must have exceptional session exams (e.g. 2016/2017)");

// 5. Schema Integrity Validation
for (const item of allExams) {
  assert(typeof item.id === "string" && item.id.length > 0, `Item has invalid id: ${JSON.stringify(item)}`);
  assert(typeof item.year === "number" && item.year >= 2016 && item.year <= 2026, `Item has invalid year: ${item.id}`);
  assert(item.session === "regular" || item.session === "exceptional", `Item has invalid session: ${item.id}`);
  assert(REQUIRED_STREAMS.includes(item.streamId), `Item has invalid streamId: ${item.id}`);
  assert(typeof item.subjectId === "string" && item.subjectId.length > 0, `Item has invalid subjectId: ${item.id}`);
  assert(typeof item.title_ar === "string" && item.title_ar.length > 0, `Item has invalid title_ar: ${item.id}`);
  assert(typeof item.topicsCount === "number" && item.topicsCount >= 1, `Item has invalid topicsCount: ${item.id}`);
  assert(typeof item.subjectPdfUrl === "string" && item.subjectPdfUrl.endsWith(".pdf"), `Item subjectPdfUrl must end in .pdf: ${item.id}`);
  assert(typeof item.solutionPdfUrl === "string" && item.solutionPdfUrl.endsWith(".pdf"), `Item solutionPdfUrl must end in .pdf: ${item.id}`);
}
console.log("✓ All exam entries strictly conform to BacExamItem schema.");

// 6. Test Query & Filter Functions
console.log("\nTesting filterBacExams()...");

// 6a. Filter by Stream
const seExams = filterBacExams({ streamId: "sciences_exp" });
assert(seExams.every((e) => e.streamId === "sciences_exp"), "Stream filtering failed");
console.log(`✓ Filter by stream='sciences_exp' returned ${seExams.length} exams`);

// 6b. Filter by Year
const exams2024 = filterBacExams({ year: 2024 });
assert(exams2024.every((e) => e.year === 2024), "Year filtering failed");
console.log(`✓ Filter by year=2024 returned ${exams2024.length} exams`);

// 6c. Filter by Subject
const mathExams = filterBacExams({ subjectId: "math" });
assert(mathExams.every((e) => e.subjectId === "math"), "Subject filtering failed");
console.log(`✓ Filter by subjectId='math' returned ${mathExams.length} exams`);

// 6d. Filter by Session
const excExams = filterBacExams({ session: "exceptional" });
assert(excExams.every((e) => e.session === "exceptional"), "Session filtering failed");
console.log(`✓ Filter by session='exceptional' returned ${excExams.length} exams`);

// 6e. Search Query
const searchResults = filterBacExams({ searchQuery: "المناعة" });
assert(searchResults.length > 0, "Keyword search for 'المناعة' should return results");
console.log(`✓ Search for 'المناعة' returned ${searchResults.length} matching topics`);

// 6f. ID Lookup
const sampleExam = allExams[0];
const lookup = getBacExamById(sampleExam.id);
assert(lookup && lookup.id === sampleExam.id, "getBacExamById failed");
console.log(`✓ Single item lookup by ID '${sampleExam.id}' succeeded.`);

console.log("\n🎉 ALL ALGERIAN BACCALAUREATE EXAM ARCHIVE TESTS PASSED SUCCESSFULLY!");
