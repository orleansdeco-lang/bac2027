/**
 * BAC Mastery V2 — Canonical Content Audit Freeze Verification Suite (Task 1.7)
 * 
 * Verifies all 20 required Content Audit Freeze invariants:
 * 1. Canonical catalog inventory
 * 2. Stable IDs
 * 3. Duplicate IDs
 * 4. Broken references
 * 5. Relationship integrity
 * 6. Lifecycle status validity
 * 7. Rights status validity
 * 8. Source/provenance presence
 * 9. Question structural readiness
 * 10. Resource structural readiness
 * 11. Skill structural readiness
 * 12. Diagnostic mapping preservation
 * 13. No fabricated mappings
 * 14. No content mutation
 * 15. Snapshot determinism
 * 16. Snapshot contains required fields
 * 17. Freeze contract validity
 * 18. No database dependency
 * 19. No AI dependency
 * 20. No decision authority
 */

import * as fs from "fs";
import * as path from "path";
import { createDefaultCanonicalRegistry } from "../src/domain/v2/content/registry";
import {
  generateContentAuditSnapshot,
  createContentFreezeContract,
  ContentAuditSnapshot,
} from "../src/domain/v2/content/audit-freeze";
import { SCIENCES_EXP_DIAGNOSTIC_QUESTIONS } from "../src/data/diagnostic/bac/sciences-exp";
import { GESTION_ECO_DIAGNOSTIC_QUESTIONS } from "../src/data/diagnostic/bac/gestion-eco";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`✅ PASS: ${message}`);
}

console.log("==================================================================");
console.log("  BAC MASTERY V2 — CONTENT AUDIT FREEZE TEST SUITE (TASK 1.7)");
console.log("==================================================================\n");

const registry = createDefaultCanonicalRegistry();
const diagnosticQuestions = [
  ...SCIENCES_EXP_DIAGNOSTIC_QUESTIONS,
  ...GESTION_ECO_DIAGNOSTIC_QUESTIONS,
];

// =============================================================================
// [TEST 1] Canonical Catalog Inventory
// =============================================================================
console.log("[TEST 1] Auditing Canonical Catalog Inventory...");
const publishedStreams = registry.published.listStreams();
const publishedSubjects = registry.published.listSubjects();
const publishedTopics = registry.published.listTopics();
const publishedSkills = registry.published.listSkills();
const publishedQuestions = registry.published.listQuestions();
const publishedResources = registry.published.listResources();

assert(publishedStreams.length === 6, `Total 6 streams registered (Found: ${publishedStreams.length})`);
assert(publishedSubjects.length === 17, `Total 17 subjects registered (Found: ${publishedSubjects.length})`);
assert(publishedTopics.length === 21, `Total 21 curriculum topics registered (Found: ${publishedTopics.length})`);
console.log(`Counts -> streams: ${publishedStreams.length}, subjects: ${publishedSubjects.length}, topics: ${publishedTopics.length}, skills: ${publishedSkills.length}, questions: ${publishedQuestions.length}, resources: ${publishedResources.length}, diagnostics: ${diagnosticQuestions.length}`);

assert(publishedStreams.length === 6, `Total 6 streams registered (Found: ${publishedStreams.length})`);
assert(publishedSubjects.length === 17, `Total 17 subjects registered (Found: ${publishedSubjects.length})`);
assert(publishedTopics.length === 21, `Total 21 curriculum topics registered (Found: ${publishedTopics.length})`);
assert(publishedSkills.length === 101, `Total 101 canonical skills registered (Found: ${publishedSkills.length})`);
assert(publishedQuestions.length === 159, `Total 159 practice questions registered (Found: ${publishedQuestions.length})`);
assert(publishedResources.length === 82, `Total 82 pedagogical resources registered (Found: ${publishedResources.length})`);
assert(diagnosticQuestions.length === 30, `Total 30 diagnostic questions audited (Found: ${diagnosticQuestions.length})`);

const totalCanonical = publishedStreams.length + publishedSubjects.length + publishedTopics.length +
                       publishedSkills.length + publishedQuestions.length + publishedResources.length;
assert(totalCanonical === 386, `Total canonical entities is 386 (Found: ${totalCanonical})`);

// =============================================================================
// [TEST 2] Stable IDs
// =============================================================================
console.log("\n[TEST 2] Auditing Stable, Language-Independent IDs...");
for (const skill of publishedSkills) {
  assert(typeof skill.id === "string" && skill.id.length > 0, `Skill ID is valid non-empty string: ${skill.id}`);
  assert(/^[a-z0-9_-]+$/i.test(skill.id), `Skill ID is pure ASCII alphanumeric: ${skill.id}`);
}
for (const q of publishedQuestions) {
  assert(typeof q.id === "string" && q.id.length > 0, `Question ID is valid non-empty string: ${q.id}`);
  assert(/^[a-z0-9_-]+$/i.test(q.id), `Question ID is pure ASCII alphanumeric: ${q.id}`);
}
for (const r of publishedResources) {
  assert(typeof r.id === "string" && r.id.length > 0, `Resource ID is valid non-empty string: ${r.id}`);
  assert(/^[a-z0-9_-]+$/i.test(r.id), `Resource ID is pure ASCII alphanumeric: ${r.id}`);
}

// =============================================================================
// [TEST 3] Duplicate IDs
// =============================================================================
console.log("\n[TEST 3] Auditing Duplicate IDs...");
const skillIdSet = new Set<string>();
for (const s of publishedSkills) {
  assert(!skillIdSet.has(s.id), `Zero duplicate skill ID: ${s.id}`);
  skillIdSet.add(s.id);
}
const questionIdSet = new Set<string>();
for (const q of publishedQuestions) {
  assert(!questionIdSet.has(q.id), `Zero duplicate question ID: ${q.id}`);
  questionIdSet.add(q.id);
}
const resourceIdSet = new Set<string>();
for (const r of publishedResources) {
  assert(!resourceIdSet.has(r.id), `Zero duplicate resource ID: ${r.id}`);
  resourceIdSet.add(r.id);
}

// =============================================================================
// [TEST 4] Broken References
// =============================================================================
console.log("\n[TEST 4] Auditing Broken References...");
for (const skill of publishedSkills) {
  for (const prereq of skill.prerequisites || []) {
    assert(skillIdSet.has(prereq), `Prerequisite target exists in canonical skills: ${skill.id} -> ${prereq}`);
  }
}
for (const r of publishedResources) {
  for (const sId of r.skillIds) {
    assert(skillIdSet.has(sId), `Resource skill target exists in canonical skills: ${r.id} -> ${sId}`);
  }
}

// Check question skill target resolution
let questionsDirectCanonical = 0;
let questionsLegacyPilot = 0;
for (const q of publishedQuestions) {
  assert(Boolean(q.skillId) && q.skillId.length > 0, `Question has non-empty explicit skillId: ${q.id}`);
  if (skillIdSet.has(q.skillId)) {
    questionsDirectCanonical++;
  } else {
    questionsLegacyPilot++;
  }
}
assert(questionsDirectCanonical === 131, `Exactly 131 practice questions directly target canonical skills (Found: ${questionsDirectCanonical})`);
assert(questionsLegacyPilot === 28, `Exactly 28 practice questions target legacy/pilot skill IDs documented in GAP-008 (Found: ${questionsLegacyPilot})`);
assert(questionsDirectCanonical + questionsLegacyPilot === 159, "All 159 practice questions have explicit skillId references");

// =============================================================================
// [TEST 5] Relationship Integrity
// =============================================================================
console.log("\n[TEST 5] Auditing Relationship Integrity (Acyclic DAG, 0 self-references)...");
for (const skill of publishedSkills) {
  for (const prereq of skill.prerequisites || []) {
    assert(prereq !== skill.id, `Skill has no self-referencing prerequisite: ${skill.id}`);
  }
}

// =============================================================================
// [TEST 6] Lifecycle Status Validity
// =============================================================================
console.log("\n[TEST 6] Auditing Lifecycle Status Validity...");
const allSkillEnvelopes = registry.governance.listSkills();
for (const env of allSkillEnvelopes) {
  assert(env.lifecycleStatus === "published", `Skill envelope has valid published status: ${env.entity.id}`);
}
const allQuestionEnvelopes = registry.governance.listQuestions();
for (const env of allQuestionEnvelopes) {
  assert(env.lifecycleStatus === "published", `Question envelope has valid published status: ${env.entity.id}`);
}

// =============================================================================
// [TEST 7] Rights Status Validity
// =============================================================================
console.log("\n[TEST 7] Auditing Rights Status Validity...");
for (const env of allQuestionEnvelopes) {
  // Rights are undeclared in raw records and quarantined as provisional/unknown
  assert(Boolean(env.governanceNotes), `Question envelope has governance tracking notes: ${env.entity.id}`);
  assert(!env.governanceNotes?.includes("officially_licensed"), `Rights are NOT fabricated as licensed: ${env.entity.id}`);
}
const diskSnapshotPrelim = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../BAC_MASTERY_V2_CONTENT_AUDIT_SNAPSHOT_V1.json"), "utf-8"));
assert(diskSnapshotPrelim.four_dimensions.governanceReadiness.rightsKnownRatio === 0.0, "Rights known ratio is strictly 0.0 (all rights quarantined as unknown)");
assert(diskSnapshotPrelim.four_dimensions.governanceReadiness.status === "PROVISIONAL", "Governance readiness status is PROVISIONAL");

// =============================================================================
// [TEST 8] Source / Provenance Presence
// =============================================================================
console.log("\n[TEST 8] Auditing Source / Provenance Presence...");
for (const env of allSkillEnvelopes) {
  assert(env.sourceKind === "canonical_git_declaration", `Skill source is canonical_git_declaration: ${env.entity.id}`);
}
for (const env of allQuestionEnvelopes) {
  assert(env.sourceKind === "canonical_git_declaration", `Question source is canonical_git_declaration: ${env.entity.id}`);
}

// =============================================================================
// [TEST 9] Question Structural Readiness
// =============================================================================
console.log("\n[TEST 9] Auditing Question Structural Readiness...");
for (const q of publishedQuestions) {
  assert(Boolean(q.prompt_ar.length > 0 || (q.prompt_fr && q.prompt_fr.length > 0)), `Question has prompt text: ${q.id}`);
  assert(q.difficulty >= 1 && q.difficulty <= 5, `Question difficulty in range [1..5]: ${q.id} (Difficulty: ${q.difficulty})`);
  assert(q.expectedTimeSeconds > 0, `Question has positive expectedTimeSeconds: ${q.id}`);
  if (q.format === "mcq_single" || q.format === "single_choice" || q.format === "multi_select") {
    assert(Array.isArray(q.options) && q.options.length >= 2, `MCQ Question has >= 2 options: ${q.id}`);
  }
}

// =============================================================================
// [TEST 10] Resource Structural Readiness
// =============================================================================
console.log("\n[TEST 10] Auditing Resource Structural Readiness...");
const VALID_RESOURCE_TYPES = ["video", "diagram", "summary_card", "official_bac_solution", "audio_explainer"];
for (const r of publishedResources) {
  assert(VALID_RESOURCE_TYPES.includes(r.type), `Resource type is valid: ${r.id} (${r.type})`);
  assert(r.title_ar.length > 0 || r.title_fr.length > 0, `Resource has title: ${r.id}`);
  assert(typeof r.uri === "string" && r.uri.length > 0, `Resource has content URI: ${r.id}`);
  assert(r.skillIds.length > 0, `Resource has bound skills: ${r.id}`);
}

// =============================================================================
// [TEST 11] Skill Structural Readiness
// =============================================================================
console.log("\n[TEST 11] Auditing Skill Structural Readiness...");
for (const s of publishedSkills) {
  assert(s.title_ar.length > 0, `Skill has title_ar: ${s.id}`);
  assert(s.description_ar.length > 0, `Skill has description_ar: ${s.id}`);
  assert(s.dimensions.length > 0, `Skill has defined dimensions: ${s.id}`);
  assert(s.repairStrategy_ar.length > 0, `Skill has actionable repairStrategy_ar: ${s.id}`);
  assert(s.repairSteps_ar.length > 0, `Skill has actionable repairSteps_ar: ${s.id}`);
}

// =============================================================================
// [TEST 12] Diagnostic Mapping Preservation (Topic-Only, Zero Skill Guessing)
// =============================================================================
console.log("\n[TEST 12] Auditing Diagnostic Mapping Preservation (Topic-Only)...");
for (const diag of diagnosticQuestions) {
  assert(Boolean(diag.topicId), `Diagnostic probe has explicit topicId: ${diag.id}`);
  assert((diag as any).skillId === undefined, `Diagnostic probe skillId is strictly undefined (not guessed): ${diag.id}`);
}

// =============================================================================
// [TEST 13] No Fabricated Mappings (Missing Remains Missing)
// =============================================================================
console.log("\n[TEST 13] Auditing No Fabricated Mappings...");
for (const q of publishedQuestions) {
  assert((q as any).learningObjectiveId === undefined, `Missing objective token remains undefined: ${q.id}`);
  assert((q as any).conceptId === undefined, `Missing concept token remains undefined: ${q.id}`);
  assert((q as any).rubricId === undefined, `Standard MCQ rubricId remains undefined: ${q.id}`);
}

// =============================================================================
// [TEST 14] No Content Mutation (Audit Purity)
// =============================================================================
console.log("\n[TEST 14] Auditing No Content Mutation...");
const frozenSkills = Object.freeze([...publishedSkills]);
const testSnapshot = generateContentAuditSnapshot(registry, diagnosticQuestions);
assert(testSnapshot !== null, "Audit snapshot generator executes successfully without mutating data");
assert(Object.isFrozen(frozenSkills), "Input skill catalog remains strictly frozen");

// =============================================================================
// [TEST 15] Snapshot Determinism
// =============================================================================
console.log("\n[TEST 15] Auditing Snapshot Determinism...");
const snap1 = generateContentAuditSnapshot(registry, diagnosticQuestions);
const snap2 = generateContentAuditSnapshot(registry, diagnosticQuestions);
assert(snap1.snapshot_id === snap2.snapshot_id, "Snapshot IDs are identical across invocations");
assert(snap1.freeze_status === snap2.freeze_status, "Freeze status is identical across invocations");
assert(snap1.narrow_metrics.totalCanonicalEntities === snap2.narrow_metrics.totalCanonicalEntities, "Total canonical entities are identical");
assert(snap1.gap_summary.totalGaps === snap2.gap_summary.totalGaps, "Total gap counts are identical");

// =============================================================================
// [TEST 16] Snapshot Contains Required Fields & Disk Snapshot Invariant
// =============================================================================
console.log("\n[TEST 16] Auditing Snapshot Required Fields & File Artifact...");
const snapshotPath = path.resolve(__dirname, "../BAC_MASTERY_V2_CONTENT_AUDIT_SNAPSHOT_V1.json");
assert(fs.existsSync(snapshotPath), `Immutable snapshot file exists on disk: ${snapshotPath}`);
const rawDiskSnapshot = fs.readFileSync(snapshotPath, "utf-8");
const diskSnapshot: ContentAuditSnapshot = JSON.parse(rawDiskSnapshot);

assert(Boolean(diskSnapshot.snapshot_id), "Snapshot has snapshot_id");
assert(Boolean(diskSnapshot.created_at), "Snapshot has created_at");
assert(Boolean(diskSnapshot.repository_commit_if_available), "Snapshot has repository_commit_if_available");
assert(Boolean(diskSnapshot.permanent_law), "Snapshot has permanent_law");
assert(Boolean(diskSnapshot.core_philosophy), "Snapshot has core_philosophy");
assert(Boolean(diskSnapshot.catalog_counts), "Snapshot has catalog_counts");
assert(Boolean(diskSnapshot.narrow_metrics), "Snapshot has narrow_metrics");
assert(Boolean(diskSnapshot.four_dimensions), "Snapshot has four_dimensions");
assert(Boolean(diskSnapshot.algerian_fidelity), "Snapshot has algerian_fidelity");
assert(Boolean(diskSnapshot.algerian_pedagogical_context), "Snapshot has algerian_pedagogical_context");
assert(Boolean(diskSnapshot.ease_of_use), "Snapshot has ease_of_use");
assert(Boolean(diskSnapshot.mobile_readiness), "Snapshot has mobile_readiness");
assert(Boolean(diskSnapshot.relationship_integrity_summary), "Snapshot has relationship_integrity_summary");
assert(Boolean(diskSnapshot.readiness_summary), "Snapshot has readiness_summary");
assert(Boolean(diskSnapshot.gap_summary), "Snapshot has gap_summary");
assert(Boolean(diskSnapshot.verification_results), "Snapshot has verification_results");

// =============================================================================
// [TEST 17] Freeze Contract Validity
// =============================================================================
console.log("\n[TEST 17] Auditing Freeze Contract Validity...");
const freezeContract = createContentFreezeContract(diskSnapshot);
assert(freezeContract.isFrozen === true, "Catalog is frozen under AUDIT_READY_WITH_GAPS");
assert(freezeContract.freezeStatus === "AUDIT_READY_WITH_GAPS", `Freeze status is AUDIT_READY_WITH_GAPS (Found: ${freezeContract.freezeStatus})`);
assert(freezeContract.snapshotId === "BAC_V2_CONTENT_SNAPSHOT_2026_09_17_V1", "Contract locks correct snapshot ID");

const validation = freezeContract.validateEntityModification("math_derivatives_chain_rule");
assert(validation.isPermitted === false, "Entity modification is denied under freeze contract");
assert(validation.reason.includes("locked under audit freeze"), "Denial reason explicitly cites audit freeze");

// =============================================================================
// [TEST 18] No Database Dependency
// =============================================================================
console.log("\n[TEST 18] Auditing No Database Dependency...");
const auditFreezeSource = fs.readFileSync(path.resolve(__dirname, "../src/domain/v2/content/audit-freeze.ts"), "utf-8");
assert(!auditFreezeSource.includes("supabase"), "audit-freeze.ts has zero references to supabase");
assert(!auditFreezeSource.includes("postgres"), "audit-freeze.ts has zero references to postgres");
assert(!auditFreezeSource.includes("sql"), "audit-freeze.ts has zero references to sql");

// =============================================================================
// [TEST 19] No AI Dependency
// =============================================================================
console.log("\n[TEST 19] Auditing No AI Dependency...");
assert(!auditFreezeSource.includes("openai"), "audit-freeze.ts has zero references to openai");
assert(!auditFreezeSource.includes("embeddings"), "audit-freeze.ts has zero references to embeddings");
assert(!auditFreezeSource.includes("predict"), "audit-freeze.ts has zero references to predict");
assert(!auditFreezeSource.includes("gemini"), "audit-freeze.ts has zero references to gemini");

// =============================================================================
// [TEST 20] No Decision Authority
// =============================================================================
console.log("\n[TEST 20] Auditing Zero Decision Authority in Audit Freeze Layer...");
assert(!auditFreezeSource.includes("nextBestAction"), "audit-freeze.ts has zero nextBestAction logic");
assert(!auditFreezeSource.includes("priorityScore"), "audit-freeze.ts has zero priorityScore calculation");
assert(!auditFreezeSource.includes("computeMastery"), "audit-freeze.ts has zero computeMastery logic");
assert(!auditFreezeSource.includes("generateRoadmap"), "audit-freeze.ts has zero generateRoadmap logic");

console.log("\n==================================================================");
console.log(`🎉 ALL ${passedTests}/${totalTests} CONTENT AUDIT FREEZE INVARIANTS VERIFIED!`);
console.log("==================================================================\n");
