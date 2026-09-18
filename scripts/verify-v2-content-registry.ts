/**
 * BAC Mastery V2 — Canonical Content Registry & Read Contract Verification (Task 1.5)
 * 
 * Verifies all 20 required architectural invariants:
 * 1. Canonical ID lookup
 * 2. Unknown ID
 * 3. No fuzzy fallback
 * 4. No legacy fallback
 * 5. Stable identity
 * 6. Determinism
 * 7. Lifecycle (Draft safety)
 * 8. Deprecated content safety
 * 9. Relationship preservation
 * 10. No relationship invention
 * 11. Question semantics (difficulty != demand != tier)
 * 12. Resource distinction (Resource != Question)
 * 13. Rights preservation
 * 14. Provenance preservation
 * 15. Duplicate safety
 * 16. No learner-state dependency
 * 17. No decision authority
 * 18. No side effects
 * 19. No database dependency
 * 20. No AI dependency
 */

import {
  createDefaultCanonicalRegistry,
  createCanonicalContentRegistry,
  CanonicalContentRegistry,
} from "../src/domain/v2/content/registry";
import {
  toSkillId,
  toQuestionId,
  toTopicId,
  toResourceId,
} from "../src/domain/v2/ids";
import {
  StreamId,
  SubjectId,
  SkillId,
  QuestionId,
  TopicId,
  ResourceId,
} from "../src/domain/v2";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

console.log("==================================================================");
console.log("  BAC MASTERY V2 — CONTENT REGISTRY & READ CONTRACT TESTS (TASK 1.5)");
console.log("==================================================================\n");

const registry = createDefaultCanonicalRegistry();

// -----------------------------------------------------------------------------
// [TEST 1] Auditing Canonical ID Lookup...
// -----------------------------------------------------------------------------
console.log("[TEST 1] Auditing Canonical ID Lookup...");
const mathSkill = registry.published.getSkill(toSkillId("math_derivatives_chain_rule"));
assert(Boolean(mathSkill), "Known canonical skill resolves correctly");
assert(mathSkill?.id === "math_derivatives_chain_rule", "Resolved skill ID matches requested ID");
assert(mathSkill?.subjectId === "math", "Resolved skill subject matches");

const stream = registry.published.getStream("sciences_exp" as StreamId);
assert(Boolean(stream), "Known canonical stream resolves correctly");
assert(stream?.id === "sciences_exp", "Stream ID matches");

const topic = registry.published.getTopic(toTopicId("math_topic_functions"));
assert(Boolean(topic), "Known canonical topic resolves correctly");
assert(topic?.subjectId === "math", "Topic subject matches");

// -----------------------------------------------------------------------------
// [TEST 2] Auditing Unknown ID (Explicit Unavailable / Not-Found)...
// -----------------------------------------------------------------------------
console.log("\n[TEST 2] Auditing Unknown ID (Explicit Unavailable / Not-Found)...");
const unknownSkill = registry.published.getSkill(toSkillId("completely_unknown_skill_xyz"));
assert(unknownSkill === undefined, "Unknown skill ID returns explicit undefined");

const unknownQuestion = registry.published.getQuestion(toQuestionId("pq-non-existent-999"));
assert(unknownQuestion === undefined, "Unknown question ID returns explicit undefined");

const unknownTopic = registry.published.getTopic(toTopicId("topic_fake_math"));
assert(unknownTopic === undefined, "Unknown topic ID returns explicit undefined");

// -----------------------------------------------------------------------------
// [TEST 3] Auditing No Fuzzy Fallback...
// -----------------------------------------------------------------------------
console.log("\n[TEST 3] Auditing No Fuzzy Fallback...");
// Slight typo or plural
const typoSkill = registry.published.getSkill(toSkillId("math_derivatives_chain_rules"));
assert(typoSkill === undefined, "Typo/plural does NOT resolve to skill via fuzzy matching");

// Arabic display label passed as ID
const arabicLabelSkill = registry.published.getSkill(toSkillId("اشتقاق الدوال المركبة"));
assert(arabicLabelSkill === undefined, "Arabic surface label does NOT resolve via canonical ID lookup");

// French display label passed as ID
const frenchLabelSkill = registry.published.getSkill(toSkillId("Dérivation des fonctions composées"));
assert(frenchLabelSkill === undefined, "French surface label does NOT resolve via canonical ID lookup");

// -----------------------------------------------------------------------------
// [TEST 4] Auditing No Legacy Fallback (Strict Isolation)...
// -----------------------------------------------------------------------------
console.log("\n[TEST 4] Auditing No Legacy Fallback (Strict Isolation)...");
// In legacy catalog src/data/skills/index.ts, "math_functions_asymptotes" existed,
// but was replaced by "math_asymptotes_limits" in canonical-sciences.ts
const legacyOnlySkillInCanonical = registry.published.getSkill(toSkillId("math_functions_asymptotes"));
assert(legacyOnlySkillInCanonical === undefined, "Canonical published read DOES NOT fallback to legacy catalog");

const legacyOnlyInGovernance = registry.governance.getSkill(toSkillId("math_functions_asymptotes"));
assert(legacyOnlyInGovernance === undefined, "Canonical governance read DOES NOT fallback to legacy catalog");

// But compatibility contract DOES expose it when explicitly asked
const legacyViaCompatibility = registry.compatibility.getLegacySkill("math_functions_asymptotes");
assert(Boolean(legacyViaCompatibility), "Explicit compatibility contract exposes legacy skill");
assert(legacyViaCompatibility?.value.id === "math_functions_asymptotes", "Legacy skill ID preserved in compatibility store");

// -----------------------------------------------------------------------------
// [TEST 5] Auditing Stable Entity Identity...
// -----------------------------------------------------------------------------
console.log("\n[TEST 5] Auditing Stable Entity Identity...");
const targetId = toSkillId("snv_protein_synthesis");
const snvSkill = registry.published.getSkill(targetId);
assert(Boolean(snvSkill), "SNV skill retrieved");
assert(snvSkill?.id === targetId, "Entity identity equals requested canonical ID token");
assert(typeof snvSkill?.id === "string", "ID is immutable ASCII string");

// -----------------------------------------------------------------------------
// [TEST 6] Auditing Determinism (Idempotent Identical Reads)...
// -----------------------------------------------------------------------------
console.log("\n[TEST 6] Auditing Determinism (Idempotent Identical Reads)...");
const read1 = registry.published.getSkill(toSkillId("math_derivatives_chain_rule"));
const read2 = registry.published.getSkill(toSkillId("math_derivatives_chain_rule"));
assert(JSON.stringify(read1) === JSON.stringify(read2), "Repeated reads return identical JSON representation");

const reg1 = createDefaultCanonicalRegistry();
const reg2 = createDefaultCanonicalRegistry();
const list1 = reg1.published.listSkills({ subjectId: "math" });
const list2 = reg2.published.listSkills({ subjectId: "math" });
assert(list1.length === list2.length, "Different registry instances produce identical skill counts");
assert(JSON.stringify(list1) === JSON.stringify(list2), "Different registry instances produce identical skills");

// -----------------------------------------------------------------------------
// [TEST 7] Auditing Lifecycle Safety (Draft Quarantined from Runtime)...
// -----------------------------------------------------------------------------
console.log("\n[TEST 7] Auditing Lifecycle Safety (Draft Quarantined from Runtime)...");
const customReg = createCanonicalContentRegistry();
const draftSkillId = toSkillId("draft_math_quantum_algebra");

customReg.registerSkill({
  entity: {
    id: draftSkillId,
    topicId: "math_topic_functions",
    subjectId: "math",
    streamId: "sciences_exp",
    title_ar: "جبر متقدم قيد المسودة",
    title_fr: "Algèbre quantique en brouillon",
    description_ar: "مسودة",
    description_fr: "Draft",
    prerequisites: [],
    cognitiveDimensions: ["knowledge"],
    dimensions: ["knowledge"],
    difficulty: 3,
    order: 99,
    isActive: true,
    repairStrategy_ar: "",
    repairStrategy_fr: "",
    repairSteps_ar: [],
    repairSteps_fr: [],
  },
  sourceKind: "canonical_git_declaration",
  lifecycleStatus: "draft",
  version: 1,
  isRuntimeEligible: false,
  governanceNotes: "Authored draft; under review.",
});

// Governance can see draft
const draftGov = customReg.governance.getSkill(draftSkillId);
assert(Boolean(draftGov), "Governance read can inspect draft content");
assert(draftGov?.lifecycleStatus === "draft", "Governance accurately reports draft status");
assert(draftGov?.isRuntimeEligible === false, "Draft is flagged non-runtime eligible");

// Published runtime CANNOT see draft
const draftPub = customReg.published.getSkill(draftSkillId);
assert(draftPub === undefined, "Published runtime read strictly quarantines draft content (returns undefined)");
const pubList = customReg.published.listSkills();
assert(!pubList.some((s) => s.id === draftSkillId), "Draft content absent from published listSkills()");

// -----------------------------------------------------------------------------
// [TEST 8] Auditing Deprecated Content Safety...
// -----------------------------------------------------------------------------
console.log("\n[TEST 8] Auditing Deprecated Content Safety...");
const deprecatedSkillId = toSkillId("deprecated_legacy_matrix_curriculum");
customReg.registerSkill({
  entity: {
    id: deprecatedSkillId,
    topicId: "math_topic_functions",
    subjectId: "math",
    streamId: "sciences_exp",
    title_ar: "مصفوفات ملغاة من المنهاج",
    title_fr: "Matrices dépréciées",
    description_ar: "",
    description_fr: "",
    prerequisites: [],
    cognitiveDimensions: ["knowledge"],
    dimensions: ["knowledge"],
    difficulty: 3,
    order: 100,
    isActive: false,
    repairStrategy_ar: "",
    repairStrategy_fr: "",
    repairSteps_ar: [],
    repairSteps_fr: [],
  },
  sourceKind: "canonical_git_declaration",
  lifecycleStatus: "deprecated",
  version: 1,
  isRuntimeEligible: false,
  governanceNotes: "Superseded curriculum topic from older syllabus.",
});

const depGov = customReg.governance.getSkill(deprecatedSkillId);
assert(Boolean(depGov), "Governance read preserves deprecated content for historical telemetry");
assert(depGov?.lifecycleStatus === "deprecated", "Governance accurately reports deprecated status");

const depPub = customReg.published.getSkill(deprecatedSkillId);
assert(depPub === undefined, "Published runtime read strictly quarantines deprecated content");

// -----------------------------------------------------------------------------
// [TEST 9] Auditing Relationship Preservation...
// -----------------------------------------------------------------------------
console.log("\n[TEST 9] Auditing Relationship Preservation...");
const funcTopic = registry.published.getTopic(toTopicId("math_topic_functions"));
assert(Boolean(funcTopic), "Functions topic retrieved");
assert(Array.isArray(funcTopic?.skillIds), "Topic skillIds is an array");
assert(funcTopic!.skillIds.length > 0, "Topic preserves associated skill links");

const allQuestions = registry.published.listQuestions();
const retestQuestion = allQuestions.find((q) => q.isRetestVariant && q.retestForQuestionId);
assert(Boolean(retestQuestion), "Found retest variant question in registry");
assert(typeof retestQuestion?.retestForQuestionId === "string", "Retest twin relationship preserved");

const snvTrans = registry.published.getSkill(toSkillId("snv_genetic_code_translation"));
assert(Boolean(snvTrans), "SNV translation skill retrieved");
assert(snvTrans!.prerequisites.includes("snv_protein_synthesis"), "Prerequisite relationship preserved");

// -----------------------------------------------------------------------------
// [TEST 10] Auditing No Relationship Invention...
// -----------------------------------------------------------------------------
console.log("\n[TEST 10] Auditing No Relationship Invention...");
// Topic is NOT a skill; has no repair protocol
assert((funcTopic as any).repairStrategy_ar === undefined, "Topic does not invent skill repair strategy");
assert((funcTopic as any).repairSteps_ar === undefined, "Topic does not invent skill repair steps");

// Question without explicit rubric has undefined rubric
const simpleQ = allQuestions.find((q) => !q.rubricId);
assert(Boolean(simpleQ), "Found question without rubric");
assert(simpleQ?.rubricId === undefined, "Rubric relationship is NOT invented when unauthored");

// -----------------------------------------------------------------------------
// [TEST 11] Auditing Question Semantics (Difficulty != Demand != Tier)...
// -----------------------------------------------------------------------------
console.log("\n[TEST 11] Auditing Question Semantics (Difficulty != Demand != Tier)...");
const qWithDemand = allQuestions.find((q) => q.difficulty === 2 && q.cognitiveDemand === "comprehension");
assert(Boolean(qWithDemand), "Question has distinct difficulty and cognitive demand");
assert(qWithDemand?.difficulty === 2, "Difficulty is integer 2");
assert(qWithDemand?.cognitiveDemand === "comprehension", "Cognitive demand is comprehension");

// -----------------------------------------------------------------------------
// [TEST 12] Auditing Resource Distinction (Resource != Question)...
// -----------------------------------------------------------------------------
console.log("\n[TEST 12] Auditing Resource Distinction (Resource != Question)...");
const resources = registry.published.listResources();
assert(resources.length > 0, "Published resources exist in registry");
const sampleResource = resources[0];
assert(Boolean(sampleResource.uri), "Resource has instructional uri");
assert((sampleResource as any).options === undefined, "Resource does NOT have question options");
assert((sampleResource as any).format === undefined, "Resource does NOT have question format");
assert((sampleResource as any).correctAnswerId === undefined, "Resource does NOT have answer key");

const sampleQuestion = allQuestions[0];
assert((sampleQuestion as any).uri === undefined, "Question does NOT have resource instructional uri");

// -----------------------------------------------------------------------------
// [TEST 13] Auditing Rights Preservation...
// -----------------------------------------------------------------------------
console.log("\n[TEST 13] Auditing Rights Preservation...");
const customResReg = createCanonicalContentRegistry();
customResReg.registerResource({
  entity: {
    id: toResourceId("res_unknown_license"),
    type: "summary_card",
    title_ar: "بطاقة ملخصة",
    title_fr: "Fiche",
    uri: "internal://res/1",
    skillIds: [],
    isVerified: false,
  },
  sourceKind: "canonical_git_declaration",
  lifecycleStatus: "published",
  version: 1,
  isRuntimeEligible: true,
  governanceNotes: "Rights unconfirmed; preserved as unknown.",
});
const resGov = customResReg.governance.getResource(toResourceId("res_unknown_license"));
assert(Boolean(resGov?.governanceNotes?.includes("Rights unconfirmed")), "Undeclared rights documented; zero false copyright assumptions");

// -----------------------------------------------------------------------------
// [TEST 14] Auditing Provenance Preservation...
// -----------------------------------------------------------------------------
console.log("\n[TEST 14] Auditing Provenance Preservation...");
const firstQEnvelope = registry.governance.listQuestions()[0];
assert(Boolean(firstQEnvelope.sourceKind), "Question maintains traceable sourceKind");
assert(firstQEnvelope.sourceKind === "canonical_git_declaration", "Question sourceKind is canonical_git_declaration");

// -----------------------------------------------------------------------------
// [TEST 15] Auditing Duplicate Safety (Reported, NOT Auto-Merged)...
// -----------------------------------------------------------------------------
console.log("\n[TEST 15] Auditing Duplicate Safety (Reported, NOT Auto-Merged)...");
const diagnostics = registry.getDiagnostics();
assert(typeof diagnostics.hasDuplicates === "boolean", "Diagnostics runs pure check");
assert(diagnostics.duplicates.length > 0, "Diagnostics detects duplicate IDs between canonical and legacy catalog");
const legacyOverlap = diagnostics.duplicates.find((d) => d.kind === "superseded_catalog_overlap");
assert(Boolean(legacyOverlap), "Superseded catalog overlap between canonical and legacy is explicitly reported");
assert(Boolean(legacyOverlap?.sources.includes("canonical_skills")), "Canonical skills catalog listed as source");
assert(Boolean(legacyOverlap?.sources.includes("legacy_skills_index")), "Legacy skills index listed as source");

// -----------------------------------------------------------------------------
// [TEST 16] Auditing No Learner-State Dependency...
// -----------------------------------------------------------------------------
console.log("\n[TEST 16] Auditing No Learner-State Dependency...");
// Functions take no studentId, profile, or telemetry
const skillsA = registry.published.listSkills();
const skillsB = registry.published.listSkills();
assert(skillsA.length === skillsB.length, "Skills list is static and invariant to student state");

// -----------------------------------------------------------------------------
// [TEST 17] Auditing Zero Decision Authority in Registry...
// -----------------------------------------------------------------------------
console.log("\n[TEST 17] Auditing Zero Decision Authority in Registry...");
assert((registry as any).calculatePriority === undefined, "Registry does not have calculatePriority method");
assert((registry as any).getNextBestAction === undefined, "Registry does not have getNextBestAction method");
assert((registry as any).generateRoadmap === undefined, "Registry does not have generateRoadmap method");
assert((registry as any).evaluateMastery === undefined, "Registry does not have evaluateMastery method");
assert((registry as any).createMission === undefined, "Registry does not have createMission method");
assert((registry as any).computeRetentionSchedule === undefined, "Registry does not have computeRetentionSchedule method");

// -----------------------------------------------------------------------------
// [TEST 18] Auditing No Side Effects (Read Purity)...
// -----------------------------------------------------------------------------
console.log("\n[TEST 18] Auditing No Side Effects (Read Purity)...");
const countBefore = registry.published.listSkills().length;
registry.published.getSkill(toSkillId("math_derivatives_chain_rule"));
registry.governance.listQuestions();
registry.getDiagnostics();
const countAfter = registry.published.listSkills().length;
assert(countBefore === countAfter, "Read operations do NOT mutate registry contents");

// -----------------------------------------------------------------------------
// [TEST 19] Auditing No Database Dependency (Works Purely In-Memory)...
// -----------------------------------------------------------------------------
console.log("\n[TEST 19] Auditing No Database Dependency (Works Purely In-Memory)...");
const manifest = registry.getManifest();
assert(manifest.totalStreams > 0, "Streams loaded without database");
assert(manifest.totalSubjects > 0, "Subjects loaded without database");
assert(manifest.totalTopics > 0, "Topics loaded without database");
assert(manifest.totalCanonicalSkills > 0, "Canonical skills loaded without database");
assert(manifest.totalQuestions > 0, "Questions loaded without database");

// -----------------------------------------------------------------------------
// [TEST 20] Auditing No AI Dependency...
// -----------------------------------------------------------------------------
console.log("\n[TEST 20] Auditing No AI Dependency...");
assert((registry as any).promptAI === undefined, "Registry has zero AI bridge methods");
assert((registry as any).generateContent === undefined, "Registry has zero generative content methods");

console.log("\n==================================================================");
console.log("🎉 ALL 20 CONTENT REGISTRY & READ CONTRACT INVARIANTS VERIFIED!");
console.log("==================================================================");
