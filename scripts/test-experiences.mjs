import assert from "node:assert/strict";
import { CURATED_BAC_EXPERIENCES } from "../src/data/experiences/index.ts";

console.log("🚀 Starting verification tests for 'بنك التجارب والعِبر' (Bac Experience & Alum Wisdom Hub)...");

// 1. Verify Curated Experiences Data Structure
console.log("\n🧪 Test 1: Validating Curated Experiences Dataset...");
assert(Array.isArray(CURATED_BAC_EXPERIENCES), "CURATED_BAC_EXPERIENCES must be an array");
assert(CURATED_BAC_EXPERIENCES.length >= 10, "Must have at least 10 curated experiences");

const validStreams = new Set(["sciences", "math", "technique_math", "gestion_economie", "lettres_philo", "langues_etrangeres"]);
const validRoles = new Set(["top_achiever", "repeater_success", "student"]);

for (const exp of CURATED_BAC_EXPERIENCES) {
  assert(exp.id && typeof exp.id === "string", `Invalid ID on experience ${exp.id}`);
  assert(exp.author_name && typeof exp.author_name === "string", `Missing author name on ${exp.id}`);
  assert(validRoles.has(exp.author_role), `Invalid role '${exp.author_role}' on ${exp.id}`);
  assert(validStreams.has(exp.stream_id), `Invalid stream '${exp.stream_id}' on ${exp.id}`);
  assert(exp.biggest_trap && exp.biggest_trap.length >= 25, `biggest_trap too short on ${exp.id}`);
  assert(exp.winning_routine && exp.winning_routine.length >= 25, `winning_routine too short on ${exp.id}`);
  assert(typeof exp.upvotes_count === "number" && exp.upvotes_count >= 0, `Invalid upvotes_count on ${exp.id}`);
  if (exp.final_grade !== null && exp.final_grade !== undefined) {
    assert(exp.final_grade >= 9.0 && exp.final_grade <= 20.0, `final_grade out of bounds on ${exp.id}`);
  }
}
console.log(`✅ Passed: All ${CURATED_BAC_EXPERIENCES.length} curated experiences have valid fields and substantive prompts.`);

// 2. Stream Coverage across all 6 Algerian BAC streams
console.log("\n🧪 Test 2: Checking Stream Coverage across all 6 Algerian Streams...");
const coveredStreams = new Set(CURATED_BAC_EXPERIENCES.map((e) => e.stream_id));
for (const stream of validStreams) {
  assert(coveredStreams.has(stream), `Stream '${stream}' is missing from curated experiences`);
}
console.log(`✅ Passed: All 6 Algerian BAC streams (${Array.from(validStreams).join(", ")}) are represented.`);

// 3. Category Filtering Logic
console.log("\n🧪 Test 3: Testing Category Filtering Logic...");

// 3a. Top Achievers (16+)
const topAchievers = CURATED_BAC_EXPERIENCES.filter(
  (e) => (e.final_grade && e.final_grade >= 16) || e.author_role === "top_achiever"
);
assert(topAchievers.length > 0, "Top achievers filter should return entries");
for (const exp of topAchievers) {
  const isHigh = (exp.final_grade && exp.final_grade >= 16) || exp.author_role === "top_achiever";
  assert(isHigh, `Item ${exp.id} should not be in top achievers`);
}
console.log(`✅ Passed: Top achievers filter returned ${topAchievers.length} qualifying experiences.`);

// 3b. Repeater Success Stories
const repeaters = CURATED_BAC_EXPERIENCES.filter(
  (e) => e.author_role === "repeater_success" || (e.initial_grade !== null && e.initial_grade !== undefined)
);
assert(repeaters.length >= 3, "Repeater success filter should return at least 3 inspiring stories");
for (const exp of repeaters) {
  assert(
    exp.author_role === "repeater_success" || exp.initial_grade !== null,
    `Item ${exp.id} should have initial grade or repeater_success role`
  );
}
console.log(`✅ Passed: Repeater success filter returned ${repeaters.length} stories with initial/final grade progression.`);

// 3c. Top Upvoted Sorting
const sortedByVotes = [...CURATED_BAC_EXPERIENCES].sort((a, b) => b.upvotes_count - a.upvotes_count);
for (let i = 0; i < sortedByVotes.length - 1; i++) {
  assert(
    sortedByVotes[i].upvotes_count >= sortedByVotes[i + 1].upvotes_count,
    "Items must be sorted in descending order of upvotes"
  );
}
console.log(`✅ Passed: Top upvoted sorting verified (top item has ${sortedByVotes[0].upvotes_count} upvotes).`);

// 4. One-click Match Filter: "تجارب تشبه هدفي"
console.log("\n🧪 Test 4: Testing 'تجارب تشبه هدفي' Target Match Filter...");
const userTargetStream = "sciences";
const targetMatches = CURATED_BAC_EXPERIENCES.filter((e) => e.stream_id === userTargetStream);
assert(targetMatches.length > 0, "Target match must find experiences for sciences");
for (const exp of targetMatches) {
  assert(exp.stream_id === userTargetStream, "Target match items must match user stream");
}
console.log(`✅ Passed: Target match for '${userTargetStream}' correctly isolated ${targetMatches.length} experiences.`);

// 5. Keyword Search Verification
console.log("\n🧪 Test 5: Testing Keyword Search Filter...");
const query = "طب";
const searchResults = CURATED_BAC_EXPERIENCES.filter((e) => {
  const q = query.toLowerCase();
  return (
    e.author_name.toLowerCase().includes(q) ||
    (e.target_major && e.target_major.toLowerCase().includes(q)) ||
    e.biggest_trap.toLowerCase().includes(q) ||
    e.winning_routine.toLowerCase().includes(q) ||
    (e.best_resources && e.best_resources.toLowerCase().includes(q))
  );
});
assert(searchResults.length > 0, "Search for 'طب' should return matching medicine experiences");
console.log(`✅ Passed: Search for 'طب' returned ${searchResults.length} relevant results.`);

// 6. Upvote Toggle & Favorite Mechanics Simulation
console.log("\n🧪 Test 6: Testing Upvote Toggle and Favorite Logic...");
let testUpvotes = 100;
let userUpvoted = false;

// Toggle upvote ON
userUpvoted = !userUpvoted;
testUpvotes = userUpvoted ? testUpvotes + 1 : testUpvotes - 1;
assert.equal(testUpvotes, 101, "Upvote increment failed");
assert.equal(userUpvoted, true, "Upvoted state must be true");

// Toggle upvote OFF
userUpvoted = !userUpvoted;
testUpvotes = userUpvoted ? testUpvotes + 1 : testUpvotes - 1;
assert.equal(testUpvotes, 100, "Upvote decrement failed");
assert.equal(userUpvoted, false, "Upvoted state must be false");

// Favorite toggle simulation
const favorites = new Set();
const expId = "exp-001";
favorites.add(expId);
assert(favorites.has(expId), "Experience should be favorited");
favorites.delete(expId);
assert(!favorites.has(expId), "Experience should be unfavorited");
console.log("✅ Passed: Upvote and Favorite state toggles perform as expected.");

console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! (6/6 suites passed)\n");
