# BAC MASTERY V2 — LEGACY DOMAIN INVENTORY (TASK 1.0)

**Document Version:** 2.0.0  
**Phase:** Phase 1 — Domain Contract Implementation  
**Task:** 1.0 (Domain Contract Implementation)  
**Status:** COMPLETE  
**Audit Invariant:** Zero legacy code deleted; zero production behavior broken.

---

## 1. Executive Summary

Before introducing the canonical V2 TypeScript domain contracts in `src/domain/v2/`, an exhaustive audit of all existing types across `src/types/`, `src/domain/`, `src/data/`, and `src/lib/` was conducted.

The audit identifies:
1. **Direct Alignments:** Concepts that already map cleanly to V2 definitions (e.g., Stream IDs, 10 canonical error types in `src/types/mission.ts`).
2. **Partial Divergences:** Legacy definitions lacking required V2 dimensions (e.g., `MasteryStatus` in `src/types/mission.ts` having only 3 states instead of the authoritative 4).
3. **Competing / Ambiguous Taxonomies:** Multiple error taxonomies in `src/types/error-lab.ts` (`ErrorCategory` with 11 items including `did_not_understand` and `method_unknown`) vs `src/types/mission.ts` (`SuspectedErrorType` with 10 items).
4. **Scalar Conflations:** Areas where raw attempts, scores, and evidence were flattened into single numeric percentages or where duration was unconstrained free-form numbers.

The table below catalogs every existing domain concept and defines the adapter boundary needed to bridge legacy code to V2 contracts cleanly.

---

## 2. Comprehensive Legacy Domain Inventory Table

| Existing Concept | Current Location | Current Representation | V2 Canonical Concept | Conflict? | Adapter Needed? |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Skill Identity** | `src/data/skills/*.ts`<br/>`src/types/mission.ts` | Plain unbranded `string` (e.g., `math_limits_continuity`, `snv_protein_synthesis`) | Canonical `SkillId` (Entity 10) | Minor (Unbranded string allows arbitrary strings) | **Yes**: `toSkillId()`, `isSkillId()` branded type validator |
| **Canonical Skill Model** | `src/domain/contracts/canonical-skill.contract.ts` | `CanonicalSkill` with 16 fields (`id`, `topicId`, `subjectId`, `dimensions`, `repairSteps`, etc.) | Domain Entity 10 (`CanonicalSkill`) | None (Matches V2 gold standard) | **No** (Directly compatible; re-exported in V2) |
| **Subject Identity** | `src/types/education.ts` | Union of 17 string literals (`SubjectId`) | Canonical `SubjectId` (Entity 06) | None (Standard Algerian curriculum identifiers) | **Yes**: Validation type guard `isSubjectId()` |
| **Stream Identity** | `src/types/education.ts` | Union of 6 string literals (`StreamId`) | Canonical `StreamId` (Entity 04) | None (Standard Algerian BAC branches) | **Yes**: Validation type guard `isStreamId()` |
| **Specialty Identity** | `src/types/education.ts` | Union of 4 engineering specialties (`TechniqueMathSpecialty`) | Canonical `SpecialtyId` (Entity 05) | None (Technique Math sub-branches) | **Yes**: Validation type guard `isSpecialtyId()` |
| **Education Level** | `src/types/education.ts` | `"secondary" | "middle_school"` (`EducationLevel`) | Canonical `EducationLevel` (Entity 02: `"secondary_3as"`) | Minor (Legacy is coarse: `"secondary"`) | **Yes**: `mapLegacyEducationLevel()` adapter |
| **Exam Type** | `src/types/education.ts` | `"BAC" | "BEM"` (`ExamType`) | Canonical `ExamType` (Entity 03: `"BAC" | "BEM"`) | None (Direct match) | **Yes**: Validation guard `isExamType()` |
| **Mastery States (Legacy Mission)** | `src/types/mission.ts:212` | `"not_yet" | "emerging" | "demonstrated"` (3 states) | Authoritative 4-state Mastery: `not_yet`, `emerging`, `demonstrated`, `review_due` (Entity 23) | **YES**: Missing `review_due` state | **Yes**: `mapLegacyMasteryStatus()` adapter |
| **Mastery States (Layer 1 Contract)** | `src/domain/contracts/learner.contract.ts:12` | `"not_yet" | "emerging" | "demonstrated" | "review_due"` | Authoritative 4-state Mastery (Entity 23) | None (Exact match to V2 ratified freeze) | **No** (Canonical V2 baseline definition) |
| **Numeric Mastery Score** | Various UI/Storage locations | Float `0.0` to `1.0` (e.g., `0.73`) treated as "mastery" | Secondary Telemetry Signal ONLY ($\theta \in [0..1]$); NEVER authoritative mastery | **YES**: Scalar reduction violates non-scalar invariant | **Yes**: Disambiguation validator; reject numeric as mastery state |
| **Error Taxonomy (Mission Engine)** | `src/types/mission.ts:131` | `SuspectedErrorType` (10 items: `forgot_information`, `misunderstood_concept`, `methodology_error`, `calculation_error`, `misread_question`, `rushed`, `lack_of_practice`, `time_management`, `attention_error`, `unknown`) | Canonical 10-Type Taxonomy (Entity 21) | None (Exact match to V2 ratified freeze) | **No** (Directly compatible; re-exported in V2) |
| **Error Taxonomy (Error Lab)** | `src/types/error-lab.ts:8` | `ErrorCategory` (11 items: includes `did_not_understand`, `method_unknown`) | Canonical 10-Type Taxonomy (Entity 21) | **YES**: Contains divergent legacy error names | **Yes**: `mapLegacyErrorCategory()` adapter |
| **Legacy V1 Error Codes** | Historic V1 logs/stores | `concept_confusion`, `calculation_slip`, `keyword_missing`, `methodology_flaw`, `time_pressure`, `reading_comprehension` | Canonical 10-Type Taxonomy (Entity 21) | **YES**: Legacy code vocabulary | **Yes**: `mapLegacyV1ErrorCode()` adapter per Migration Boundary §4 |
| **Mission Types** | `src/types/mission.ts:9` | `"understand" | "practice" | "error_review" | "mini_test" | "rest_reset"` | 6 Canonical Mission Types (Entity 18): `new_concept`, `repair`, `review`, `exam_transfer`, `mastery_verification`, `diagnostic_followup` | **YES**: Divergent string vocabulary | **Yes**: `mapLegacyMissionType()` adapter |
| **Mission Duration** | `src/types/mission.ts:123` | Free-form `estimatedMinutes: number` | 4 Canonical Duration Classes: `MICRO` (5–10m), `SHORT` (10–20m), `STANDARD` (20–35m), `DEEP` (35–60m) | **YES**: Lacks duration class constraints | **Yes**: `classifyMissionDuration()`, `validateDurationMinutes()` |
| **Diagnostic Dimensions** | `src/types/diagnostic.ts:7` | 6 dimensions: `knowledge`, `understanding`, `application`, `methodology`, `speed`, `confidence` | Cognitive Dimensions in Evidence & Diagnostics | None (Direct match to Learning OS dimensions) | **Yes**: Validation type guard `isDiagnosticDimension()` |
| **Diagnostic Layers** | `src/types/diagnostic.ts` | Implicit structure; no explicit layer typing on questions | 6 Canonical Layers: `L0` (Routing), `L1` (Screening), `L2` (Skill Diagnosis), `L3` (Prerequisite Probe), `L4` (Confidence & Calibration), `L5` (Transfer Probe) | **YES**: Legacy questions lack explicit layer tagging | **Yes**: `DiagnosticLayer` union + tagging adapter |
| **Diagnostic Output** | `src/types/diagnostic.ts` | `SubjectDiagnosticScore` (percentage-based scoring) | Epistemic Evidence Set for Learner Model; NOT a summary quiz score | **YES**: Score generation vs. Evidence collection | **Yes**: Adapter translating diagnostic responses into `CognitiveEvidenceRecord[]` |
| **Question Types** | `src/types/mission.ts:81`<br/>`src/types/interactive-exercise.ts` | Multiple ad-hoc unions (`mcq`, `short_answer`, `true_false`, `journal_entry`, `step_by_step`, `cloze`, `reorder`, etc.) | Domain Entity 16 (`Question`) with `QuestionFormat` & `CognitiveDemand` | Minor: Fragmented across 3 files | **Yes**: Standardized `QuestionFormat` union + legacy mapper |
| **Raw Attempt Model** | `src/types/mission.ts:182`<br/>`src/domain/contracts/evidence.contract.ts:25` | `PracticeResponse` (flat response) vs `RawAttemptRecord` (methodology-aware telemetry) | Domain Entity 19 (`Attempt` / `RawAttemptRecord`) | Minor: `PracticeResponse` lacks device & telemetry fields | **Yes**: `mapPracticeResponseToRawAttempt()` |
| **Cognitive Evidence Model** | `src/domain/contracts/evidence.contract.ts:45`<br/>`src/domain/learning/types.ts:58` | `CognitiveEvidenceRecord` (normalized facts) vs `StudentEvidenceRecord` | Domain Entity 20 (`Evidence` / `CognitiveEvidenceRecord`) | Minor: Two slightly different evidence records | **Yes**: Unified V2 `CognitiveEvidenceRecord` preserving 6 vectors |
| **Retention Schedule** | `src/domain/learning/types.ts:77` | `SpacedReviewSchedule` (`intervalDays`, `urgency`, `consecutiveSuccesses`, `decayRate`) | Domain Entity 24 (`RetentionSchedule`) with 6 frozen vectors | Minor: Embedded in SM-2 assumptions | **Yes**: Interface decoupling; pure 6-vector input contract |
| **Retention Algorithm** | `src/domain/learning/spaced-review.ts` | Embedded SM-2 calculation | Replaceable `updateRetentionSchedule()` interface; SM-2 as reference baseline ONLY | Architectural: Hardcoded algorithm | **Yes**: Abstract `RetentionScheduler` interface |
| **Learner State** | `src/domain/contracts/learner.contract.ts:40` | `LearnerState` (`skills`, `activeErrors`, `masteredSkillIds`, `emergingSkillIds`, etc.) | Domain Entity 23 (`LearnerState` derived from evidence) | None (Sprint 01 contract is fully V2-compliant) | **No** (Canonical baseline; preserved in V2) |
| **Roadmap Reason Codes** | `src/types/roadmap.ts:22`<br/>`src/domain/contracts/decision.contract.ts:11` | `MissionReasonCode` vs `InterventionActionType` (10 items) | Domain Entity 25 (`LearningDecision`) with 8-level Priority Hierarchy | Minor: Two slightly divergent union names | **Yes**: `PriorityReasonCode` union + mapping |
| **Priority vs Roadmap** | `src/types/roadmap.ts` | Mixed ranking logic in legacy engine | Strict separation: Strategic Roadmap (macro) vs Tactical Priority (micro) | Minor: Historical conflation | **Yes**: Decoupled `RoadmapTrajectory` vs `PriorityDecision` |
| **Error Repair Protocol** | `src/types/mission.ts:148`<br/>`src/domain/learning/types.ts:134` | `RepairStatus`, `RepairProtocol`, `RetestContract` | Domain Entities 21 & 22 (2-cycle repair policy, isomorphic retest twin) | None (Matches frozen rules) | **No** (Preserved and formalized in V2) |

---

## 3. Key Invariants & Red Lines for V2 Domain Implementation

1. **Do NOT Modify Existing Files:** All existing type files (`src/types/*.ts`, `src/domain/contracts/*.ts`, `src/domain/learning/types.ts`) must remain untouched during Task 1.0.
2. **Namespace Isolation:** All new canonical V2 contracts will reside in `src/domain/v2/`.
3. **Preserve Legacy Behavior:** Existing imports referencing `@/domain/contracts` or `@/types/*` will continue to function without disruption.
4. **Adapter Purity:** Adapters must be pure functions with strict type signatures and defensive fallbacks (e.g., unrecognized error code maps to `unknown` with logged telemetry, never silently swallowed).
5. **Non-Scalar Invariant:** Any continuous numeric score $\in [0..1]$ passed to a mastery validator must be rejected if presented as a mastery state.
