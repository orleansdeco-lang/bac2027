# BAC MASTERY V2 — ADAPTER AUDIT & INFORMATION LOSS SPECIFICATION (TASK 1.1)

**Document Version:** 2.0.0  
**Phase:** Phase 1 — Domain Contract Implementation  
**Task:** 1.1 (Read-Only Legacy → V2 Integration)  
**Status:** COMPLETE  
**Principle:** Read-Only Translation; Zero Legacy Mutation; Zero DB Writes.

---

## 1. Executive Summary

This audit rigorously inspects the baseline adapters created in `src/domain/v2/adapters/` during Task 1.0 and specifies the enhanced read-only translation layer required for Task 1.1.

Every existing and newly designed adapter is evaluated across 8 critical dimensions:
1. **Input Type:** Legacy contract / shape ingested.
2. **Output V2 Type:** Authoritative domain contract emitted.
3. **Mapping Rules:** Translation logic applied.
4. **Fallback Behavior:** Handling of unmatched or malformed inputs.
5. **Information Preserved:** Data retained verbatim in V2.
6. **Information Derived:** Data computed deterministically.
7. **Information Unavailable / Lossy:** Data missing from legacy or collapsed during translation.
8. **Reversibility & Idempotency:** Can output be mapped back to input without loss?

---

## 2. Comprehensive Adapter Audit

### 2.1. Mastery Adapter (`adaptLegacyMasteryStatus`)

- **Input Type:** `string` (e.g. `"not_yet" | "emerging" | "demonstrated" | "review_due" | "mastered" | "needs_more_work" | "overdue"`)
- **Output V2 Type:** `AdapterResult<CanonicalMasteryStatus>`
- **Mapping Rules:**
  - `"not_yet"` $	o$ `"not_yet"` [EXACT]
  - `"emerging"` $	o$ `"emerging"` [EXACT]
  - `"demonstrated"` $	o$ `"demonstrated"` [EXACT]
  - `"review_due"` $	o$ `"review_due"` [EXACT]
  - `"mastered"` $	o$ `"demonstrated"` [ALIAS]
  - `"overdue"` $	o$ `"review_due"` [ALIAS]
  - `"in_progress"` $	o$ `"emerging"` [ALIAS]
  - `"needs_more_work"` $	o$ `"not_yet"` [LEGACY COMPATIBILITY MAPPING]
- **Fallback Behavior:** Any unmapped string maps to `"not_yet"` with `isKnown: false` and `originalLegacyValue` preserved.
- **Information Preserved:** Direct 4-state domain status.
- **Information Derived:** Normalized canonical status.
- **Information Unavailable:** Underlying multi-dimensional evidence vectors that generated the status.
- **Lossy Aspects:** `"needs_more_work"` loses the historical context of failing 2 retests unless accompanied by an active error state.
- **Reversibility:** Non-reversible for aliases (`"mastered"` $	o$ `"demonstrated"` $	o$ cannot know if original was `"demonstrated"` or `"mastered"`).
- **Deterministic:** Yes.

---

### 2.2. Error Taxonomy Adapter (`adaptLegacyErrorCode`)

- **Input Type:** `string` (e.g. `SuspectedErrorType` from `mission.ts`, `ErrorCategory` from `error-lab.ts`, or historic V1 string)
- **Output V2 Type:** `AdapterResult<CanonicalErrorType>`
- **Mapping Rules:**
  - 10 exact canonical types pass through identically.
  - `did_not_understand`, `concept_confusion` $	o$ `misunderstood_concept`
  - `method_unknown`, `methodology_flaw`, `keyword_missing` $	o$ `methodology_error`
  - `calculation_slip` $	o$ `calculation_error`
  - `reading_comprehension` $	o$ `misread_question`
  - `time_pressure` $	o$ `time_management`
- **Fallback Behavior:** Any unrecognized string maps to canonical `"unknown"` while strictly preserving `originalLegacyValue: string` in the result metadata.
- **Information Preserved:** The pedagogical classification of the mistake.
- **Information Derived:** Standardized taxonomy code.
- **Information Unavailable:** Distractor trap ID if not present in legacy error record.
- **Lossy Aspects:** The subtle distinction between missing a keyword vs overall methodology flaw is grouped into `methodology_error`.
- **Reversibility:** Non-reversible for merged codes.
- **Deterministic:** Yes.

---

### 2.3. Mission Duration Adapter (`adaptLegacyMissionDuration`)

- **Input Type:** `number` (`estimatedMinutes`)
- **Output V2 Type:** `AdapterResult<{ durationClass: MissionDurationClass; estimatedMinutes: number }>`
- **Mapping Rules:**
  - $< 10$ minutes $	o$ `"MICRO"` (5–10 min)
  - $10 le t < 20$ minutes $	o$ `"SHORT"` (10–20 min)
  - $20 le t le 35$ minutes $	o$ `"STANDARD"` (20–35 min)
  - $> 35$ minutes $	o$ `"DEEP"` (35–60 min)
- **Fallback Behavior:** Clamps negative or non-finite numbers safely to `"MICRO"` (5 min default) with warning in metadata.
- **Information Preserved:** The original exact `estimatedMinutes` number is preserved untouched alongside the class.
- **Information Derived:** `durationClass`.
- **Information Unavailable:** None.
- **Lossy Aspects:** Zero (both the continuous minutes and the discrete class are retained in the output).
- **Reversibility:** `durationClass` alone is lossy; paired with `estimatedMinutes` it is 100% reversible.
- **Deterministic:** Yes.

---

### 2.4. Mission Type Adapter (`adaptLegacyMissionType`)

- **Input Type:** `string` (`MissionType` from `src/types/mission.ts`)
- **Output V2 Type:** `AdapterResult<CanonicalMissionType>`
- **Mapping Rules:**
  - `"understand"`, `"new_learning"` $	o$ `"new_concept"`
  - `"repair"`, `"continuation_repair"` $	o$ `"repair"`
  - `"practice"`, `"mini_test"`, `"retest"`, `"continuation_retest"` $	o$ `"mastery_verification"`
  - `"error_review"`, `"spaced_review"` $	o$ `"review"`
  - `"exam_transfer"`, `"bac_simulation"` $	o$ `"exam_transfer"`
  - `"diagnostic"`, `"diagnostic_followup"` $	o$ `"diagnostic_followup"`
- **Fallback Behavior:** Maps to `"review"` with `isKnown: false` and original value preserved.
- **Information Preserved:** Core pedagogical intent.
- **Information Derived:** Canonical 6-type classification.
- **Information Unavailable:** Detailed sub-activities if legacy was just a single type tag.
- **Lossy Aspects:** Nuance between a diagnostic follow-up vs standard practice is normalized.
- **Reversibility:** Non-reversible.
- **Deterministic:** Yes.

---

### 2.5. Diagnostic Representation Adapter (`adaptLegacyDiagnosticQuestion`)

- **Input Type:** `DiagnosticQuestion` from `src/types/diagnostic.ts`
- **Output V2 Type:** `AdapterResult<CanonicalQuestion>`
- **Mapping Rules:**
  - Ingests legacy question ID, prompt, subject, stream, options.
  - `diagnosticLayer`: Marked as `undefined` unless explicitly tagged. **CRITICAL:** Adapter NEVER invents or fabricates L0–L5 layers.
- **Fallback Behavior:** Preserves raw options and prompts; marks layer as `"unresolved"`.
- **Information Preserved:** Text, choices, correct answers, topic IDs.
- **Information Derived:** Question format, cognitive demand (estimated from format).
- **Information Unavailable:** Explicit L0–L5 layer tagging (legacy had no layer attribute).
- **Lossy Aspects:** None; missing layer is transparently left `undefined`.
- **Reversibility:** Reversible to legacy question structure.
- **Deterministic:** Yes.

---

### 2.6. Attempt vs Evidence Adapter (`adaptPracticeResponseToAttemptAndEvidence`)

- **Input Type:** `PracticeResponse` from `src/types/mission.ts` (or `DiagnosticResponse`)
- **Output V2 Type:** `{ rawAttempt: RawAttempt; cognitiveEvidence?: CognitiveEvidence }`
- **Mapping Rules:**
  - Constructs an immutable `RawAttempt` capturing user interaction telemetry (selected answer, response time, confidence rating).
  - DOES NOT conflate attempt with evidence.
  - If sufficient information exists (e.g. correctness, confidence), derives an initial `CognitiveEvidence` record with multi-dimensional vectors.
  - Does NOT perform scalar score multiplication.
- **Fallback Behavior:** Telemetry defaults safely if optional fields (e.g. responseTimeSeconds) are missing.
- **Information Preserved:** Selected answer, timing, confidence, correctness.
- **Information Derived:** `responseSpeedRatio` (if expected time provided), `confidenceAlignment`.
- **Information Unavailable:** Hint click timestamps (legacy practice responses did not log exact hint step timestamps).
- **Lossy Aspects:** None.
- **Reversibility:** Reversible.
- **Deterministic:** Yes.

---

## 3. The Standard AdapterResult Metadata Envelope

To satisfy Task 3 (Information Loss Reporting) and Task 4 (Unknown Values), all enhanced adapters return a structured result envelope:

```ts
export interface MappingMetadata {
  isKnown: boolean;
  preserved: string[];
  derived: string[];
  unavailable: string[];
  lossy: string[];
  originalLegacyValue?: unknown;
  notes?: string;
}

export interface AdapterResult<T> {
  value: T;
  mapping: MappingMetadata;
}
```

---

## 4. Summary Matrix

| Domain Area | Legacy Source | V2 Target | Mapping Status | Reversible? | Notes |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **Education** | `src/types/education.ts` | `src/domain/v2/curriculum/` | 100% Deterministic | Partial | Level `secondary` maps to `secondary_3as`. |
| **Mastery** | `src/types/mission.ts` | `src/domain/v2/learner/` | Normalized | No | `needs_more_work` tagged as compatibility. |
| **Errors** | `src/types/error-lab.ts` | `src/domain/v2/errors/` | 10 Canonical + Metadata | No | Original code preserved in metadata on unknown. |
| **Missions** | `src/types/mission.ts` | `src/domain/v2/mission/` | 4 Classes + 6 Types | With minutes | Original minutes preserved alongside class. |
| **Diagnostic**| `src/types/diagnostic.ts` | `src/domain/v2/assessment/` | Zero Fabrication | Yes | `diagnosticLayer` left `undefined`. |
| **Telemetry** | `src/types/mission.ts` | `src/domain/v2/evidence/` | Strict Separation | Yes | `RawAttempt` and `CognitiveEvidence` distinct. |
