# BAC MASTERY V2 — LEARNER & EVIDENCE READ PATH AUDIT (TASK 1.2)

**Document Version:** 2.0.0  
**Phase:** Phase 1 — Domain Contract Implementation  
**Task:** 1.2 (Canonical Learner / Evidence Read Path)  
**Status:** COMPLETE  
**Core Invariant:** Read-Only Audit & Translation; Zero Mutations; Zero Decision Authority.

---

## 1. Executive Summary

This document performs an exhaustive audit of all existing learner, goal, attempt, evidence, skill-state, and retention data paths across the BAC Mastery codebase. It formalizes the canonical read path from legacy runtime representations to the V2 canonical domain model (`src/domain/v2/`).

In strict accordance with the V2 Architecture Freeze:
- The authoritative pipeline remains: `RAW DATA -> EVIDENCE -> DERIVED LEARNER STATE -> DECISION`.
- This task establishes **data access and translation only**.
- No new decision authority, priority weights, mastery thresholds, or retention scheduling algorithms are introduced.
- Client state (React, localStorage, UI progress bars) is explicitly identified and quarantined as non-authoritative.

---

## 2. Audit of Existing Representations

### 2.1. Learner Identity Paths

| Representation | Current Location | Types / Identifiers | Authority Level | V2 Canonical Target |
| :--- | :--- | :--- | :---: | :--- |
| **Supabase Auth User** | Supabase Auth (`auth.users`) | `id: UUID` | Authoritative Identity | `StudentId` (Branded) |
| **Student Profile** | `src/types/student.ts` | `StudentProfile.id: string` | Authoritative Profile | `StudentId` (Branded) |
| **Strategic Profile** | `src/types/onboarding.ts` | `StrategicProfile.id: string` | Onboarding Snapshot | `StudentId` (Branded) |
| **Mock / Anon Learner** | `scripts/verify-sprint01.ts`, local dev | e.g. `"mock-user-1"`, `"anon_*"` | Ephemeral / Mock | `StudentId` (flagged `isAnonymous: true`) |

**Semantic Distinctions:**
- `StudentProfile.id` is the persistent identity in Supabase `profiles`.
- `StrategicProfile.id` is the initial onboarding identity that seeds the profile.
- Anonymous/local IDs are unauthenticated sessions that must be flagged to prevent false cloud authority.

---

### 2.2. Learner Context Paths

| Context Element | Legacy Location | Legacy Types | V2 Representation | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Education Level** | `src/types/education.ts` | `"secondary" | "middle_school"` | `CanonicalEducationLevel` (`"secondary_3as"`) | Legacy is coarse; normalized to BAC 3AS. |
| **Exam Type** | `src/types/education.ts` | `"BAC" | "BEM"` | `ExamType` (`"BAC" | "BEM"`) | Direct match. |
| **Stream (Filière)** | `src/types/education.ts` | `StreamId` (6 branches) | `StreamId` (Entity 04) | Direct match. |
| **Specialty** | `src/types/education.ts` | `TechniqueMathSpecialty` (4 options) | `TechniqueMathSpecialty` (Entity 05) | Direct match for Technique Math. |
| **Target Score** | `src/types/student.ts` | `number` (0.00 – 20.00) | `targetScore: number` | Ministerial 20-point scale. |
| **Study Energy** | `src/types/onboarding.ts` | `"good" | "normal" | "tired" | "stressed"` | Preserved in context metadata | Ephemeral context. |
| **Available Time** | `src/types/onboarding.ts` | `AvailableTimeRange` (`"less_than_5"`, etc.) | Preserved in context metadata | Tactical constraint. |

---

### 2.3. Goal Representations

| Goal Element | Legacy Location | Legacy Type | V2 Target | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Target Overall** | `src/types/student.ts` | `GoalSettings.targetOverallScore` | `targetOverallScore` | e.g. `16.50` for Medicine / ESI. |
| **Estimated Score** | `src/types/student.ts` | `GoalSettings.currentEstimatedOverall` | `currentEstimatedOverall` | Estimated baseline. |
| **Weekly Hours** | `src/types/student.ts` | `GoalSettings.weeklyStudyHours` | `weeklyStudyHours` | Study budget. |
| **Desired Field** | `src/types/student.ts` | `GoalSettings.desiredSpecialty` | `desiredSpecialty` | e.g. `"Médecine"`. |
| **Subject Targets** | `src/types/student.ts` | `SubjectGoalTarget[]` | `subjectTargets[]` | Per-subject target out of 20. |
| **Perceived Hard** | `src/types/student.ts` | `SubjectId[]` | `perceivedDifficulties[]` | Self-reported difficulty. |

**Goal Safety Rule Enforced:**
No new goal logic or priority ranking is introduced. Existing goals are exposed via a clean read model only.

---

### 2.4. Attempts Representations

| Attempt Element | Legacy Location | Fields | Conflated with Evidence? | V2 Separation |
| :--- | :--- | :--- | :---: | :--- |
| **Practice Response** | `src/types/mission.ts` | `questionId`, `selectedAnswer`, `isCorrect`, `responseTimeSeconds`, `confidence` | Sometimes in UI | Adapted to pure `RawAttempt` (telemetry only). |
| **Diagnostic Response**| `src/types/diagnostic.ts` | `questionId`, `selectedOptionId`, `isCorrect`, `timeSpentSeconds`, `confidenceRating` | Sometimes in UI | Adapted to pure `RawAttempt` (telemetry only). |
| **Practice Session** | `src/types/mission.ts` | Array of `PracticeResponse[]` | Flat array | Session container holding raw attempts. |

**Attempt Invariant:**
An attempt captures raw telemetry (what was clicked, elapsed seconds, confidence selected). It does NOT contain derived pedagogical strength or stability.

---

### 2.5. Evidence Representations

| Evidence Model | Legacy Location | Structure / Fields | V2 Target | Invariant |
| :--- | :--- | :--- | :--- | :--- |
| **Mastery Evidence** | `src/types/mission.ts` | `practiceAttempts`, `correctAttempts`, `retestAttempts`, `confidenceSignals` | Legacy evidence record | Ingested via read adapter. |
| **Student Evidence** | `src/domain/learning/types.ts` | `tier`, `score`, `confidence`, `source`, `responseTimeSeconds` | `CognitiveEvidence` | Multi-dimensional vectors. |
| **Cognitive Evidence**| `src/domain/contracts/evidence.contract.ts` | `isDemonstratedSuccess`, `confidenceAlignment`, `evidenceStrength` | `CognitiveEvidence` | Non-scalar vectors preserved. |

**Scalar Prohibition Rule:**
No scalar reduction formula (`score * confidence * speed * decay`) is permitted. The 6 dimensions are preserved intact.

---

### 2.6. Skill State Representations

| State Model | Legacy Location | Mastery Fields | Numeric Score Present? | V2 Target |
| :--- | :--- | :--- | :---: | :--- |
| **Layer 1 Contract**| `src/domain/contracts/learner.contract.ts` | `not_yet`, `emerging`, `demonstrated`, `review_due` | Secondary latency only | Canonical `LearnerSkillState` |
| **Mission Mastery** | `src/types/mission.ts` | `not_yet`, `emerging`, `demonstrated` | No | Normalized to 4 states |
| **Roadmap Counts** | `src/types/roadmap.ts` | `demonstratedCount`, `emergingCount`, `needsWorkCount` | Progress counts | Derived summary only |
| **Ad-Hoc UI Floats** | UI Components / LocalStorage | `progress: 0.73` | **YES** | **REJECTED AS MASTERY** |

**Numeric Mastery Safety Rule (Step 7):**
Where legacy records contain a continuous number (`0.0 → 1.0`) without an authoritative discrete state, the discrete mastery state is marked **UNAVAILABLE** and the numeric float is preserved in metadata. It is NEVER silently promoted to `demonstrated` or `emerging`.

---

### 2.7. Retention Representations

| Schedule Model | Legacy Location | Fields Present | Algorithm Imposed? | V2 Target |
| :--- | :--- | :--- | :---: | :--- |
| **Spaced Schedule** | `src/domain/learning/types.ts` | `intervalDays`, `lastTestedAt`, `nextReviewDueAt`, `urgency`, `consecutiveSuccesses`, `lapseCount`, `decayRate` | SM-2 in separate engine | Canonical `RetentionSchedule` |
| **Supabase Row** | `retention_schedules` table | `interval_days`, `urgency`, `decay_rate` | Storage schema | Mapped cleanly to read model |

**Retention Safety Rule (Step 8):**
The read adapter exposes the schedule fields without declaring SM-2 or any algorithm authoritative.

---

## 3. Adapter Mapping Matrix

| Adapter Function | Input Legacy Type | Canonical V2 Output | Preserved Fields | Derived Fields | Unavailable Fields | Lossy Fields |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `adaptLegacyLearnerIdentity` | `StudentProfile | StrategicProfile | string` | `{ studentId, isAnonymous, legacyIdentityType }` | `studentId` | `isAnonymous`, `legacyIdentityType` | `national_matricule` | None |
| `adaptLegacyLearnerContext` | `StudentProfile | StrategicProfile | OnboardingDraft` | `{ streamId, examType, educationLevel, specialty, targetScore }` | `streamId`, `specialty`, `targetScore`, `wilayaCode` | `educationLevel`, `examType` | `curriculumVersionId` | Coarse level normalized |
| `adaptLegacyGoal` | `GoalSettings | StrategicProfile` | `{ studentId, targetOverallScore, subjectTargets, weeklyStudyHours }` | `targetOverallScore`, `subjectTargets`, `weeklyStudyHours`, `desiredSpecialty` | `branded_studentId` | `pacing_curve` | None |
| `adaptLegacySkillState` | `LegacyLearnerSkillState | MasteryEvidence | Record<string, any>` | `LearnerSkillState` | `skillId`, `subjectId`, `consecutiveSuccesses`, `totalAttempts`, `lastTestedAt` | `canonical_mastery_status` | `authoritative_discrete_status` (if only float provided) | Failure history if raw string |
| `adaptLegacyAttempt` | `PracticeResponse | DiagnosticResponse` | `RawAttempt` | `questionId`, `selectedAnswer`, `isCorrect`, `confidenceRating`, `timeSpentSeconds` | `attemptId`, `timestamp` | `hint_step_timestamps` | None |
| `adaptLegacyEvidence` | `CognitiveEvidenceRecord | MasteryEvidence | StudentEvidenceRecord` | `CognitiveEvidence` | `skillId`, `subjectId`, `isDemonstratedSuccess`, 6 vectors | `evidenceId`, `derivedAt` | `rubric_criteria_breakdown` | None |
| `adaptLegacyRetentionState`| `SpacedReviewSchedule` | `RetentionSchedule` | `intervalDays`, `lastTestedAt`, `nextReviewDueAt`, `urgency`, `lapseCount` | `scheduleId` | Algorithm implementation (intentionally unfrozen) | None |

---

## 4. Risks & Safety Guardrails

### 4.1. Legacy Source-of-Truth Risks
- **Dual-Storage Drift:** The repository currently allows fallback to `localStorage` when Supabase is unconfigured. The adapter explicitly tags whether an identity or record originated from cloud authority or client cache.
- **Untyped JSON Columns:** `evidence_history` in Supabase is a JSONB array. The read path validates incoming objects defensively before creating `CognitiveEvidence`.

### 4.2. Client-State & UI Risks (Step 5)
- **UI Progress Conflation:** Components such as progress bars or dashboard badges compute percentages (e.g. `73%`). These are strictly client presentation models and must NEVER be promoted to authoritative learner mastery.
- **Mutation Boundary:** Read adapters return deep-frozen or newly allocated objects ensuring client callers cannot mutate underlying domain contracts.

---

## 5. What Remains Intentionally Untouched

1. **Zero Database Migrations:** No Supabase tables modified or created.
2. **Zero Production Engine Rewrites:** Existing roadmap, diagnostic, and practice logic continue running unchanged.
3. **Zero UI Disruption:** Front-end components continue consuming existing stores.
4. **No New Priority Weights:** Zero decision logic added to the adapter layer.
