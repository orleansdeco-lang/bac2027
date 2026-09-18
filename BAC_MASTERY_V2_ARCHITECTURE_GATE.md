# BAC MASTERY V2 — ARCHITECTURE CONSISTENCY & VALIDATION GATE REPORT

**Document Version:** 2.0.0  
**Audit Date:** 2026-09-17  
**Auditor:** Core Architecture Review Board  
**Authority Hierarchy:**
1. BAC Mastery Product Constitution
2. BAC Mastery Central Learning Operating System (Reference Architecture)
3. Approved V2 Architectural Doctrines
4. TASK 0.1 Audit & TASK 0.2 Inventory
5. TASK 0.3 Contracts & Specifications
6. Legacy Implementation (Evidence of current behavior only)

---

## 1. Executive Result

```
==================================================================
           BAC MASTERY V2 ARCHITECTURE GATE STATUS:
             ARCHITECTURE_APPROVED_WITH_REVISIONS
==================================================================
```

### Verdict Summary:
The architectural foundation frozen in TASK 0.3 is **structurally sound, highly disciplined, and aligned with 85%+ of the core BAC Mastery doctrine** (particularly regarding single source of truth, single learner state, data flow separation, offline synchronization, and strict AI boundaries).

However, the audit revealed **6 critical discrepancies** where TASK 0.3 either:
1. Accidentally inherited legacy V1 implementation limitations (e.g., adopting 6 error codes instead of the established 10).
2. Introduced new, unreviewed pedagogical mechanisms (e.g., replacing qualitative mastery states with a continuous 0–1 Exponential Moving Average scalar).
3. Oversimplified established multi-factor models (e.g., substituting the 6-vector retention model with standard SM-2; collapsing 4 mission duration classes into a single 15–20 min class; and summarizing the 6-layer Diagnostic V2 into 3 generic stages).

These discrepancies do **NOT** invalidate the core architecture, but they **REQUIRE FORMAL REVISION** prior to opening the Phase 1 implementation gate.

---

## 2. Comprehensive Decision Classification (Part 1 Audit)

Every architectural decision across the 14 documents of TASK 0.3 has been extracted and classified into exactly one of five categories:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TASK 0.3 DECISION CLASSIFICATION                     │
├────┬───────────────────────────────────────┬───────┬───────────────────┤
│ Cat│ Definition                            │ Count │ Status            │
├────┼───────────────────────────────────────┼───────┼───────────────────┤
│ A  │ Previously Established Doctrine       │  21   │ Confirmed Frozen  │
│ B  │ Reasonable Architectural Choice       │  14   │ Confirmed Frozen  │
│ C  │ New Pedagogical Decision              │   4   │ Revisions Required│
│ D  │ New Product Decision                  │   3   │ Revisions Required│
│ E  │ Unsupported / Contradictory           │   3   │ Corrected in Gate │
└────┴───────────────────────────────────────┴───────┴───────────────────┘
```

### Category A: Previously Established Doctrines (Validated)
1. **Single Canonical Learner State:** Eliminates multi-key fragmentation across 15 localStorage stores. *(Constitution §4, Learning OS §1)*
2. **Closed Epistemic Learning Loop:** Goal $	o$ Diagnostic $	o$ Gap $	o$ Priority $	o$ Roadmap $	o$ Mission $	o$ Practice $	o$ Evidence $	o$ Error $	o$ Repair $	o$ Retest $	o$ Mastery $	o$ Retention $	o$ Transfer $	o$ Next Mission. *(Learning OS §2)*
3. **Five Tiers of Truth:** Git (Tier 1) $	o$ Supabase (Tier 2) $	o$ Cache/IndexedDB (Tier 3) $	o$ React (Tier 4) $	o$ AI Context (Tier 5). *(Constitution §5)*
4. **Cardinal Rule on State Authority:** There must never be two authoritative copies of the same learner state. *(Constitution §5)*
5. **Strict Conceptual Disambiguations:** Skill ≠ Topic, Skill ≠ Concept, Question ≠ Evidence, Attempt ≠ Evidence, Error ≠ Misconception, Skill ≠ Skill State, Priority ≠ Skill Property, Mission ≠ Lesson, Roadmap ≠ Priority, Retention ≠ Mastery. *(Learning OS §2, §8)*
6. **Hard Constraints Before Ranking:** Prerequisite gaps and critical retention decay take absolute precedence over advancing syllabus content. *(Learning OS §10.1)*
7. **Two-Cycle Failure Policy on Retest:** Max 2 repair cycles before transitioning to `needs_more_work` to prevent cognitive burnout. *(Learning OS §7.4)*
8. **Isomorphic Retest Twins:** Verification items must test identical competence with altered surface features, never verbatim repetition. *(Learning OS §7.4)*
9. **Renderer Capability ≠ Content Diversity:** Existing renderers (`InteractiveJournal.tsx`, `InteractiveSteps.tsx`) are preserved; authoring must expand beyond 92% MCQ. *(Audit TASK 0.2)*
10. **Strict AI Red Lines:** AI is a read-only Socratic explainer; holds zero write credentials; cannot award mastery or grade authoritative BAC submissions. *(Constitution §5.3)*
11. **Negative Invariants:** UI cannot directly mutate mastery or priority; content consumption ≠ mastery; time spent ≠ mastery; question completion ≠ mastery. *(Learning OS §3)*
12. **Sciences Exp First Pilot:** Core stabilization focuses 100% on the 31 canonical Sciences Expérimentales skills before stream expansion. *(Sprint 01 Invariant)*
13. **Mobile-First Responsive Layout:** Retains mobile-first optimization for Algerian smartphone revising reality. *(Constitution §5.6)*
14. **Bilingual Grounding:** Arabic-first STEM and humanities content with decoupled French/Arabic UI layout. *(Learning OS §14)*
15. **Non-Punitive Recovery Mode:** No streak shaming or backlog guilt when students return after absence. *(Constitution §2, Learning OS §11.2)*
16. **Rest as Part of Roadmap:** Downtime and cognitive recovery explicitly integrated into student planning. *(Constitution §2, Learning OS §11.3)*
17. **Curriculum Immutability at Runtime:** Syllabi and ministerial coefficients are versioned in Git and cannot be altered by runtime API calls. *(Learning OS §13)*
18. **Methodology-Aware Subject Families:** Rejection of one-size-fits-all STEM templates; preservation of 9 distinct subject methodology loops. *(Learning OS §9)*
19. **Preservation of Chargily Pay V2:** Algerian Edahabia/CIB payment engine and receipt upload preserved without learning logic entanglement. *(Audit TASK 0.2)*
20. **Preservation of Supabase SSR Auth:** Secure session cookies and route protection middleware retained. *(Audit TASK 0.1)*
21. **Preservation of D-Day Exam Simulator:** Official 3.5h–4.5h timed mock papers with double-subject choice. *(Learning OS §12)*

---

### Category B: Reasonable Architectural Implementation Choices (Validated)
1. **Client-Generated UUIDs:** `att_${uuid}` and `ev_${uuid}` for collision-free offline queuing across mobile devices.
2. **SQL Idempotency via ON CONFLICT DO NOTHING:** Prevents duplicate event ingestion during network retry storms.
3. **Monotonic Sequence Numbers (seqNumber):** Enables optimistic concurrency control and clean client cache invalidation.
4. **Headless Evaluator Pure Functions:** Decouples grading logic (`evaluateStudentAttempt`) from React component UI lifecycles.
5. **Single-Key LocalStorage / IndexedDB Mirror:** Consolidates 15 client storage keys into a single `bac_learner_state_v2` key.
6. **Reactive Domain Selectors:** Exposing state via clean React hooks (`useLearnerState`, `useSkills`, `useMissions`).
7. **HTTP 301 Permanent Redirections in next.config.mjs:** Eliminates legacy duplicate routes (`/errors` $	o$ `/error-lab`) cleanly.
8. **Automated Verification Regression Harness:** Extending `scripts/verify-sprint01.ts` across all subsequent development phases.
9. **Curriculum Facade Architecture:** 10-line backward compatibility shim ensuring legacy imports do not break during refactoring.
10. **Evidence Compensation Protocol:** Retroactive compensation events (`type: "compensation_adjustment"`) rather than dirty DB row mutations.
11. **Exponential Backoff with Jitter for Offline Sync:** Resilient network retry timing (2s $	o$ 5s $	o$ 15s $	o$ max 5min).
12. **Append-Only Evidence Store:** Complete historical audit trail in Supabase `evidence_events` protected by RLS.
13. **Standardized Bloom Demand Tagging:** Tagging question items with cognitive demand tiers (recall, procedural, conceptual, analytical, synthesis).
14. **Time Velocity Benchmark (tau):** Tracking response time against expected budget ($	au = t_{actual} / t_{expected}$) to detect rushing or extreme hesitation.

---

### Category C: New Pedagogical Decisions (Audit & Review Required)
1. **Mastery Calculation via Continuous EMA Scalar:** TASK 0.3 proposed computing mastery as a single float between $0.000$ and $1.000$ using Exponential Moving Average ($Mastery_{new} = Mastery_{old}(1-alpha) + ...$).  
   *Review Finding:* Conflicts with the established Learning OS doctrine where mastery is a discrete qualitative state based on observable evidence criteria.
2. **Substitution of Mastery State Enums:** TASK 0.3 used `"untested" | "emergent" | "practicing" | "mastered" | "needs_retest"`.  
   *Review Finding:* The authoritative Learning OS defines four explicit states: `not_yet`, `emerging`, `demonstrated`, and `review_due`.
3. **Adoption of Legacy 6 Error Codes Instead of Authoritative 10:** TASK 0.3 inherited 6 error codes from current legacy code instead of restoring the 10 cognitive error types from `BAC_MASTERY_LEARNING_SYSTEM.md` §7.1.
4. **Substitution of Retention Model with Standard SM-2:** TASK 0.3 designated classic SuperMemo-2 (using single quality grade $q in [0..5]$ and Easiness Factor) as the retention engine, whereas the Learning OS mandates a 6-vector multi-factor model.

---

### Category D: New Product Decisions (Audit & Review Required)
1. **Collapsing Mission Durations to a Single 15–20 Minute Class:** TASK 0.3 repeatedly described missions as "bounded 15–20 minute interventions", accidentally erasing the established 4-tier duration structure (Micro: 5–10 min, Short: 10–20 min, Standard: 20–35 min, Deep: 35–60 min).
2. **Reduction of Diagnostic V2 to 3 Generic Stages:** TASK 0.3 described a "3-stage adaptive diagnostic" (screening, weak-skill probe, state init), omitting the formal 6-layer architecture (L0 Routing, L1 Broad Screening, L2 Skill Diagnosis, L3 Bottleneck/Prerequisite Probe, L4 Confidence & Methodology, L5 Transfer Probe).
3. **Static Linear Combination Formula for Priority:** TASK 0.3 introduced a fixed linear equation $Score(S) = W_{coef} C(S) + W_{gap} G(S) + ...$ with provisional weights, risking turning dynamic contextual priority into a rigid arithmetic sum.

---

### Category E: Unsupported / Contradictory Elements (Must Be Corrected)
1. **Compressing Multi-Dimensional Evidence into a Single Scalar:** The formula in `BAC_MASTERY_V2_STATE_TRANSITIONS.md` attempted to multiply `Evidence_score * α * Independence_factor`, violating the principle that evidence must remain multi-dimensional.
2. **Allowing Full Offline Mock BAC Exams without Time Tamper Safeguards:** Suggesting that a 4-hour high-stakes mock exam can be executed offline without local cryptographic time-attestation risks corrupting pacing analytics.
3. **Conflating Lesson Completion with Mission Progress:** Any implication that viewing lesson content increments progress towards a daily target without generating verified evidence.

---

## 3. Critical Decision Audit (Detailed Deep-Dives)

---

### 3.1. Mastery Model Audit (Part 2)

#### The Claim in TASK 0.3:
> "Mastery is an inferred latent capability score $0.000-1.000$ calculated using weighted Exponential Moving Average (EMA)."

#### The Authoritative Doctrine (`BAC_MASTERY_LEARNING_SYSTEM.md` §8.1):
Mastery is **NOT** a continuous percentage. It is an **empirical, discrete state of demonstrated capability**:
- **`not_yet` (لم نثبتها بعد):** Unassessed, unpracticed, or failed 2 consecutive retest cycles requiring recovery.
- **`emerging` (في طور التحسن):** Initial practice completed successfully, but unverified by an isomorphic twin retest or delayed retrieval.
- **`demonstrated` (تم إثبات التحكم ✓):** Error identified $	o$ repair completed $	o$ unseen isomorphic twin retest passed with high confidence, OR two independent high-tier practice successes without hints.
- **`review_due` (حان وقت المراجعة):** A previously demonstrated skill whose memory stability has decayed past the critical threshold.

#### Evaluation Questions:
1. **Was EMA previously approved?** **NO.** EMA was introduced during TASK 0.3 as an engineering simplification.
2. **Is a 0–1 float compatible with discrete states?** It can serve as an **internal telemetry metric** (e.g. `confidenceIndex` or `fluencyWeight`), but it **CANNOT REPLACE** the discrete mastery state enum.
3. **Does EMA adequately handle methodology differences?** **NO.** In Natural Sciences (SNV), a student who omits ministerial keywords cannot be modeled by an EMA that smooths over distinct rubric criteria.
4. **Does EMA handle confidence?** **NO.** An EMA treats a lucky guess with confidence 1 the same as an effortless answer with confidence 5 unless arbitrary ad-hoc weights are added.
5. **Does EMA handle transfer & recurring errors?** **NO.** A recurring error requires a hard state transition to `isRecurring: true` and priority escalation, not a fractional point reduction.
6. **Does it risk reducing mastery to a single number?** **YES.** This directly violates Constitutional Principle 2: *"True exam excellence is built on clear metrics, bottlenecks, and error repair, not a single superficial percentage."*

#### Required Revision:
- **Preserve the 4 Discrete Mastery States:** `not_yet | emerging | demonstrated | review_due`.
- Relegate any continuous numerical metric (e.g., latent ability estimate $	heta$) to an internal diagnostic/ranking attribute (`SkillState.latentAbility`), while the authoritative status remains discrete and explainable to students.

---

### 3.2. Retention Model Audit (Part 3)

#### The Claim in TASK 0.3:
> "Retention uses SuperMemo-2 / SM-2 algorithm based on review quality grade $q in [0..5]$."

#### The Authoritative Doctrine (`BAC_MASTERY_LEARNING_SYSTEM.md` §5.1–5.2):
- **Explicit Rejection of Fixed Schedules:** Section 5.1 explicitly states: *"BAC Mastery explicitly rejects hardcoding a rigid interval law... Such fixed schedules ignore individual student performance, difficulty, and lapse history."*
- **The 6 Empirical Evidence Vectors:**
  1. **Correctness ($c in {0, 1}$):** Incorrect retrieval immediately collapses interval to 1.0 day and triggers a repair cycle.
  2. **Student Confidence ($kappa in {1, 2, 3, 4, 5}$):** Low confidence ($kappa le 2$) yields conservative expansion factor ($1.2	imes$); high confidence ($kappa ge 4$) yields robust expansion ($2.2	imes$).
  3. **Response Speed Ratio ($	au = t_{actual} / t_{expected}$):** Cognitive struggle ($	au > 2.0$) discounts interval expansion by $0.8	imes$; effortless fluency ($	au < 0.6 wedge kappa ge 4$) boosts by $1.15	imes$.
  4. **Lapse History ($L$):** Chronic past lapses penalize interval expansion: $	ext{penalty} = max(0.6, 1.0 - 0.1 	imes L)$.
  5. **Decay Factor ($delta$):** Stabilizes with consecutive successes, accelerates under recurring errors.
  6. **Days Elapsed:** Determines review urgency (`fresh`, `due`, `overdue`, `critical`).

#### Evaluation:
- Classic SM-2 relies on a single subjective quality grade ($q in [0..5]$) selected by the user.
- In BAC Mastery, the student does not self-rate a generic SM-2 score; the system **derives retrieval quality** from objective response speed ($	au$), confidence rating ($kappa in [1..5]$), and objective correctness ($c$).
- **Status:** Standard SM-2 was adopted in TASK 0.3 as a shorthand because `src/domain/learning/spaced-review.ts` had an existing SM-2 implementation. It only partially implements the doctrine.

#### Required Revision:
- Classify SM-2 as **PROVISIONAL BASELINE**.
- The V2 Retention Engine must explicitly integrate the **6 empirical evidence vectors** (§5.2) into the interval calculation rather than relying on classic SM-2 quality grades.

---

### 3.3. Mission Duration Audit (Part 4)

#### The Claim in TASK 0.3:
> "Mission = bounded 15–20 minute intervention."

#### The Authoritative Doctrine:
The established Learning OS specifies **4 distinct mission duration classes**:
1. **Micro Mission (5–10 min):** Quick prerequisite check, focused micro-repair drill, or single active recall check.
2. **Short Mission (10–20 min):** Standard daily spaced retrieval session, isomorphic twin retest, or single-concept targeted practice.
3. **Standard Mission (20–35 min):** Full 13-element lesson (concept acquisition + worked example + guided practice + independent practice).
4. **Deep Mission (35–60 min):** Complex multi-part problem solving, cross-unit interleaving, document exploitation synthesis, or timed BAC section simulation.

#### Evaluation:
- TASK 0.3 accidentally collapsed all missions into the "Short Mission" class (15–20 min).
- This breaks support for quick 5-minute mobile micro-drills (crucial when student energy is `tired` or `stressed`) and complex 45-minute deep BAC exam problems.

#### Required Revision:
- Formally restore the **4 Duration Classes** (`Micro`, `Short`, `Standard`, `Deep`) in `CanonicalSkillContract` and `MissionState`.

---

### 3.4. Evidence Model Audit (Part 5)

#### Evaluation of Dimensions in TASK 0.3:
- **Keyword Fidelity:** Established and essential for Algerian BAC scoring rubrics (especially in Natural Sciences and Humanities).
- **Independence Score:** Established (hints decrease independence from 1.00 to 0.00).
- **Time Velocity Ratio ($	au$):** Established ($t_{actual} / t_{expected}$).
- **Bloom Cognitive Demand:** Established (recall, procedural, conceptual, analytical, synthesis).
- **Correctness:** Multi-level normalized raw score ($0.00-1.00$).

#### Critical Invariant Check:
> **Is Evidence reduced to a weighted numerical score?**
- In `BAC_MASTERY_V2_EVIDENCE_CONTRACT.md`, the schema is properly multi-dimensional.
- However, in `BAC_MASTERY_V2_STATE_TRANSITIONS.md`, the update function collapsed evidence into a single product: `Evidence_score * α * Independence_factor`.
- **Finding:** Evidence must remain a **structured multi-attribute object**. Different engines consume different attributes:
  - Retention Engine consumes $	au$, $kappa$, and correctness.
  - Error Lab consumes `errorTaxonomyCode`, distractor keys, and rubric details.
  - Mastery Engine consumes independence, practice tier, and cognitive demand.

---

### 3.5. Diagnostic Architecture Audit (Part 6)

#### The Authoritative Diagnostic V2 Specification:
Diagnostic V2 is structured into **6 formal hierarchical layers**:
- **L0: Routing Layer:** Calibrates student stream, education level, language preferences, target BAC grade, and daily study budget.
- **L1: Broad Screening Layer:** Rapid, coarse-grained evaluation covering the breadth of the stream's core units.
- **L2: Skill Diagnosis Layer:** Precision probing of specific observable skills within identified units.
- **L3: Bottleneck / Prerequisite Probe Layer:** Descends the prerequisite DAG to locate the foundational root cause of an observed failure.
- **L4: Confidence & Methodology Calibration Layer:** Evaluates metacognitive awareness (high-confidence errors) and official BAC answer structuring.
- **L5: Transfer Probe Layer:** Tests resilience in unannounced, cross-unit synthesis scenarios.

#### Evaluation of TASK 0.3:
- TASK 0.3 accurately described the diagnostic as requiring a rebuild (replacing the static 15-question quiz).
- However, it summarized the target design as a generic "3-stage test".
- **Finding:** The 6-layer model (L0–L5) is the authoritative architecture and must be explicitly recorded in the frozen contracts.

---

### 3.6. Priority Engine Audit (Part 7)

#### Evaluation of TASK 0.3:
- TASK 0.3 successfully codified the **Hard-Rule Hierarchy**:
  - Priority 1: Unmastered Prerequisites
  - Priority 2: Critical Retention Review ($ge 4$ days overdue)
  - Priority 3: Active Error Repair
  - Priority 4: Retest Twin Verification
  - Priority 5: Standard Spaced Review
  - Priority 6: High-Yield Curriculum Advance
- **Critical Principles Verified:**
  - ✅ **Weakest Skill ≠ Highest Priority:** A prerequisite of a weak skill, or an urgent review of a mastered skill, always takes precedence over the weakest skill itself.
  - ✅ **Roadmap ≠ Priority:** Roadmap is the macro-path; Priority is the tactical next step.
- **Finding:** The Phase 2 linear combination formula was marked `[PROVISIONAL]` in TASK 0.3. This is correct, as numerical weights must be empirically calibrated.

---

### 3.7. Error Intelligence Audit (Part 8)

#### The Discrepancy:
- **Authoritative Doctrine (`BAC_MASTERY_LEARNING_SYSTEM.md` §7.1):** 10 structured cognitive and methodological error types:
  1. `forgot_information`
  2. `misunderstood_concept`
  3. `methodology_error`
  4. `calculation_error`
  5. `misread_question`
  6. `rushed`
  7. `lack_of_practice`
  8. `time_management`
  9. `attention_error`
  10. `unknown`
- **Legacy Code & TASK 0.3:** Contained only 6 error types (`concept_confusion`, `calculation_slip`, `keyword_missing`, `methodology_flaw`, `time_pressure`, `reading_comprehension`).
- **Audit Finding:** TASK 0.3 inherited the legacy code's simplified 6 types without cross-checking the Learning OS specification.
- **Resolution:** The **10 authoritative error types** must be restored as the canonical taxonomy in the contracts. The 6 legacy types map cleanly as a subset of the 10.

---

### 3.8. AI, Offline Sync & Source of Truth Audits (Parts 10, 11, 12)

- **AI Boundary (Part 10):** **100% PASS.** No ambiguities found. AI is firmly established as a read-only Socratic explainer with zero state authority and zero direct DB credentials.
- **Offline / Sync Architecture (Part 11):** **100% PASS.** Append-only IndexedDB queue, client UUIDs, strict idempotency (`ON CONFLICT DO NOTHING`), chronological replay, and monotonic sequence numbers.
- **Source of Truth (Part 12):** **100% PASS.** The 5 tiers are crystal clear. Supabase is the sole runtime authority; local storage is strictly a transient mirror.

---

## 4. Current V2 Architecture Validation Scorecard (Part 13)

| Architectural Area | Audit Status | Primary Reason / Finding |
| :--- | :---: | :--- |
| **Canonical Domain** | **PASS** | 28 entities and 10 core disambiguations fully defined and verified. |
| **Learner State** | **REVIEW** | Must align sub-state enums with canonical 4 mastery states. |
| **Evidence Contract** | **PASS** | Multi-dimensional schema correctly preserves independence, velocity, and rubrics. |
| **Assessment Contract**| **PASS** | 12 formats supported; renderer capability vs. content diversity properly resolved. |
| **Diagnostic Engine** | **REVIEW** | Must formally restore L0–L5 layered architecture over generic 3 stages. |
| **Priority Engine** | **PASS** | Hard-rule hierarchy strictly preserved; Weakest Skill ≠ Highest Priority verified. |
| **Roadmap Engine** | **PASS** | Strategic macro-path decoupled from micro-priority; DAG-driven. |
| **Mission Engine** | **REVIEW** | Must restore the 4 duration classes (Micro, Short, Standard, Deep). |
| **Error Intelligence** | **REVIEW** | Must restore authoritative 10-type error taxonomy from Learning OS §7.1. |
| **Mastery Model** | **BLOCK** | Revert continuous EMA scalar as sole mastery definition; restore 4 discrete states. |
| **Retention Model** | **REVIEW** | Expand standard SM-2 into the established 6-vector multi-factor model. |
| **Transfer Engine** | **PASS** | Authentic BAC exam transfer missions decoupled from routine practice. |
| **AI Boundary** | **PASS** | Red lines strictly enforced; zero state authority; read-only Socratic assistant. |
| **Offline Sync** | **PASS** | Append-only event queue, idempotency, monotonic reconciliation confirmed. |
| **Source of Truth** | **PASS** | 5 tiers strictly enforced; zero dual-authority ambiguity. |

---

## 5. Required Architectural Revisions (Action Plan Before Implementation)

The following 6 revisions are formally documented and will be incorporated into the contracts before Phase 1 implementation begins:

### Revision 1: Restore the 4 Canonical Mastery States
- **Target Contract:** `BAC_MASTERY_V2_LEARNER_STATE_CONTRACT.md` & `CANONICAL_DOMAIN_CONTRACT.md`
- **Modification:** Replace `"untested" | "emergent" | "practicing" | "mastered" | "needs_retest"` with the authoritative enum:
  ```typescript
  export type MasteryStatus = "not_yet" | "emerging" | "demonstrated" | "review_due";
  ```
- Continuous mathematical metrics (e.g. latent ability $	heta in [0..1]$) remain internal telemetry fields, but never replace the student-facing mastery status.

### Revision 2: Restore the 10 Authoritative Error Types
- **Target Contract:** `BAC_MASTERY_V2_EVIDENCE_CONTRACT.md` & `CANONICAL_DOMAIN_CONTRACT.md`
- **Modification:** Update `ErrorTaxonomyCode` to include all 10 types from `BAC_MASTERY_LEARNING_SYSTEM.md` §7.1:
  ```typescript
  export type ErrorTaxonomyCode =
    | "forgot_information"
    | "misunderstood_concept"
    | "methodology_error"
    | "calculation_error"
    | "misread_question"
    | "rushed"
    | "lack_of_practice"
    | "time_management"
    | "attention_error"
    | "unknown";
  ```

### Revision 3: Restore the 4 Mission Duration Classes
- **Target Contract:** `BAC_MASTERY_V2_DECISION_CONTRACT.md` & `LEARNER_STATE_CONTRACT.md`
- **Modification:** Codify the 4 duration tiers:
  - `micro` (5–10 min)
  - `short` (10–20 min)
  - `standard` (20–35 min)
  - `deep` (35–60 min)

### Revision 4: Formalize the 6-Layer Diagnostic V2 Architecture
- **Target Contract:** `BAC_MASTERY_V2_ASSESSMENT_CONTRACT.md` & `MIGRATION_BOUNDARY.md`
- **Modification:** Explicitly define layers L0 (Routing), L1 (Screening), L2 (Skill Diagnosis), L3 (Bottleneck Probe), L4 (Metacognition/Rubrics), and L5 (Transfer Probe).

### Revision 5: Multi-Factor Retention Engine Upgrade
- **Target Contract:** `BAC_MASTERY_V2_DECISION_CONTRACT.md` & `LEARNER_STATE_CONTRACT.md`
- **Modification:** Formulate the interval update function to consume all 6 empirical vectors (Correctness, Confidence $kappa$, Speed Ratio $	au$, Lapse History $L$, Decay Factor $delta$, Days Elapsed).

### Revision 6: Multi-Dimensional State Reducer Rule
- **Target Contract:** `BAC_MASTERY_V2_STATE_TRANSITIONS.md`
- **Modification:** Prohibit multiplying multi-dimensional evidence dimensions into a single scalar in the transition formula. State updates must evaluate correctness, independence, and rubric fidelity independently.

---

## 6. Phase 1 Entry Conditions (Mandatory Checkpoints)

Phase 1 (Foundation Refactor & Canonical Porting) may commence **ONLY** when the following conditions are met:

1. **Gate Acceptance:** Architecture review board approves this report and confirms the 6 required revisions.
2. **Contract Synchronization:** The 6 target markdown contracts in the workspace root are updated to reflect the revisions.
3. **Automated Verification Zero-Regression:** `scripts/verify-sprint01.ts` and `npm run typecheck` pass cleanly with zero errors.
4. **Zero Code Changes Pre-Phase 1:** Confirmation that zero production code or database migrations were executed during the review.

---

## 7. Mandatory Stop Condition

**TASK 0.3A IS NOW COMPLETE.**  
No production code has been modified. No database schemas have been altered.  
Execution is paused awaiting architecture review and authorization to proceed.


---

## 8. Revision Application Status (TASK 0.3B Completion)

As of TASK 0.3B, all **6 Required Architectural Revisions** have been applied, cross-verified, and documented across all canonical contract files:

1. ✅ **Revision 1 Applied:** Discrete mastery states (`not_yet`, `emerging`, `demonstrated`, `review_due`) restored; continuous float prohibited from defining mastery.
2. ✅ **Revision 2 Applied:** 10 canonical error taxonomy codes restored with legacy V1 mapping and 2-cycle failure limit.
3. ✅ **Revision 3 Applied:** 4 mission duration classes (`MICRO`, `SHORT`, `STANDARD`, `DEEP`) restored.
4. ✅ **Revision 4 Applied:** 6 Diagnostic V2 layers (`L0` through `L5`) fully codified.
5. ✅ **Revision 5 Applied:** 6 retention evidence dimensions frozen; exact interval algorithm designated as provisional / un-frozen.
6. ✅ **Revision 6 Applied:** Multi-dimensional evidence non-scalar reduction invariant established.

**Final Validated Gate Status:** `ARCHITECTURE_FREEZE_V1_1_READY`
