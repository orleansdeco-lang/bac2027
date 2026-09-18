# BAC MASTERY V2 — ARCHITECTURE FREEZE & EXECUTIVE DECISION RECORD

**Document Version:** 2.0.0  
**Status:** ARCHITECTURE FROZEN  
**Date of Ratification:** 2026-09-17  
**Authority:** Core Architecture Group  
**Workspace:** BAC BEM (Algerian BAC Learning Operating System)  
**Invariant:** Pure specification — zero code mutations.

---

## 1. Architecture Objective

The definitive purpose of **BAC Mastery V2** is to operate as an adaptive, deterministic, and methodology-aware **Learning Operating System (Learning OS)** for Algerian Baccalaureate students.

It is **NOT**:
- A passive PDF repository or video course platform.
- An uncurated multiple-choice quiz bank.
- A generic wrapper around an unconstrained LLM chatbot.
- An algorithmic black box.

Its objective is to answer with mathematical and pedagogical certainty:
> **"What is the single next best learning action for this student, and what evidence justifies it?"**

---

## 2. Core Learning Loop

The platform operates on an unbroken 15-stage cyclical feedback loop:

```
GOAL
  ↓
DIAGNOSTIC
  ↓
LEARNING PROFILE
  ↓
GAP IDENTIFICATION
  ↓
PRIORITY
  ↓
ROADMAP
  ↓
MISSION
  ↓
PRACTICE
  ↓
EVIDENCE
  ↓
ERROR ANALYSIS
  ↓
REPAIR
  ↓
RETEST TWIN
  ↓
MASTERY CALCULATION
  ↓
RETENTION (SM-2)
  ↓
TRANSFER VERIFICATION
  ↓
NEXT MISSION
```

---

## 3. Canonical Domain

The curriculum and domain ontology is formally governed by **28 Canonical Domain Entities** defined in [`BAC_MASTERY_V2_CANONICAL_DOMAIN_CONTRACT.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_CANONICAL_DOMAIN_CONTRACT.md):
- Strictly separates organizational containers (Topics) from observable competencies (Skills).
- Strictly separates underlying knowledge (Concepts) from demonstrated abilities (Skills).
- Strictly separates curriculum definitions (Skills) from student-specific mastery trajectories (Learner Skill State).
- Encapsulates Algerian inspection criteria: official BAC coefficients, ministerial rubrics, and high-frequency error taxonomies.

---

## 4. Source of Truth

The hierarchy of authority is frozen into **5 distinct tiers** defined in [`BAC_MASTERY_V2_SOURCE_OF_TRUTH.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_SOURCE_OF_TRUTH.md):
1. **Git Repository (Tier 1):** The sole authority for curriculum truth, skills DAG, questions, and rubrics.
2. **Supabase Cloud (Tier 2):** The sole authority for student runtime state, evidence logs, mastery scores, and subscriptions.
3. **Browser LocalStorage / IndexedDB (Tier 3):** Strictly a transient read-through cache and offline queue; NEVER an independent source of truth.
4. **React Runtime State (Tier 4):** Strictly ephemeral UI presentation (scroll, timers, modal states).
5. **AI Context (Tier 5):** Strictly transient reasoning scratchpad for Socratic dialogue; holds ZERO state authority.

---

## 5. Learner State Authority

Governed by [`BAC_MASTERY_V2_LEARNER_STATE_CONTRACT.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_LEARNER_STATE_CONTRACT.md):
- **Single Canonical State:** The historical fragmentation across 15 localStorage keys is superseded by a single `LearnerState` schema composed of 10 strongly-typed sub-states.
- **Authoritative Discrete Mastery States:**
  ```text
  not_yet
  emerging
  demonstrated
  review_due
  ```
  A numeric float in \([0..1]\) MAY exist as internal telemetry, but **MUST NOT itself define mastery**. No single scalar replaces the multidimensional model.
- **Evidence Before Inference:** Mastery status, error ledgers, and retention decay are derived purely by the **Evidence Pipeline** from immutable evidence events.
- **Zero UI Authority:** The UI has zero write access to authoritative learner state.

---

## 6. Evidence Authority

Governed by [`BAC_MASTERY_V2_EVIDENCE_CONTRACT.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_EVIDENCE_CONTRACT.md):
- Replaces binary correct/incorrect scoring with **multi-dimensional evidence** (raw score, independence score, response time vs. budget, cognitive demand tier, hint usage penalty, and rubric keyword fidelity).
- Enforces **Evidence Strength Gates** (Low, Medium, High). Weak evidence (e.g., guessing, heavy hint usage) can never justify promotion to `"mastered"` status.

---

## 7. Decision Authority

Governed by [`BAC_MASTERY_V2_DECISION_CONTRACT.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_DECISION_CONTRACT.md):
- The `DecisionEngine` is a pure, deterministic, explainable evaluator.
- Enforces **Two-Phase Architecture**:
  1. *Phase 1 (Hard Constraints):* Unmastered prerequisites, critical memory decay ((ge 4) days overdue), and active unverified repairs MUST be cleared first.
  2. *Phase 2 (Multi-Factor Ranking):* Ranks candidate skills by BAC coefficient, gap severity, and historical exam recurrence using provisional calibrated weights.

---

## 8. Roadmap Authority

The Roadmap Engine plans the macro-level strategic sequence across the school year:
- Respects the directed acyclic graph (DAG) of prerequisites.
- Adjusts pacing dynamically based on the student's target BAC grade and days remaining until official exam week.
- Does NOT override micro-level tactical priorities issued by the Decision Engine.

---

## 9. Mission Authority

The Mission Engine packages tactical learning actions into **adaptive, bounded interventions across 4 canonical duration classes**:
- **MICRO (5–10 min):** Micro-repair drill, active recall check, fast single-step verification.
- **SHORT (10–20 min):** Targeted practice, post-repair isomorphic twin retest, daily spaced retrieval.
- **STANDARD (20–35 min):** 13-element core lesson (concept acquisition + worked example + guided + independent practice).
- **DEEP (35–60 min):** Complex synthesis, cross-unit interleaving, multi-document scientific reasoning (SNV), timed mock BAC section.

Missions require active cognitive output; a mission cannot be marked complete without generating verified attempt payloads.

---

## 10. AI Boundary

The boundary between deterministic learning algorithms and generative AI is absolute:
- **What AI May Do:** Socratic hinting, conceptual analogies in Algerian Darija/Arabic, answering student clarification questions, and breaking down inspection mark schemes.
- **What AI May NEVER Do:** Assign mastery scores, mutate learner state, override curriculum truth, declare errors resolved, or give away final numerical/proof solutions.

---

## 11. Offline Boundary

Governed by [`BAC_MASTERY_V2_SYNC_CONTRACT.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_SYNC_CONTRACT.md):
- Students can practice, complete active missions, and review retention cards completely offline.
- Events are buffered in an append-only IndexedDB queue with client UUIDs.
- Syncing is idempotent, chronologically ordered, and reconciled on Supabase using monotonic sequence numbers.
- Local cache never silently overwrites cloud truth.

---

## 12. Data Flow

Governed by [`BAC_MASTERY_V2_DATA_FLOW.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_DATA_FLOW.md):
- Strictly separates **Authoritative Write Flows** (Attempt -> Evaluator -> EvidenceEvent -> Supabase -> LearnerModel) from **Read/Cache Flows** (`useLearnerState`), **Derived Guidance Flows** (Decision Engine), and **AI Assistance Flows**.

---

## 13. Migration Boundary

Governed by [`BAC_MASTERY_V2_MIGRATION_BOUNDARY.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_MIGRATION_BOUNDARY.md):
- **19 Subsystems PRESERVED:** Layer 1 contracts, 31 Sciences Exp canonical skills, Chargily Pay, Supabase SSR Auth, Interactive Journal, Interactive Steps, D-Day Simulator, Error Taxonomy.
- **10 Subsystems REFACTORED:** Roadmap Engine, Practice Runner, Error Lab, Mission Engine, Spaced Review, Non-Sciences Curricula, Question Tagging.
- **4 Subsystems REPLACED:** Static diagnostic quiz -> 3-stage adaptive diagnostic; scattered localStorage keys -> unified `LearnerState` cache + Sync Engine; inlined UI scoring -> headless evaluator; legacy shims purged.
- **3 Subsystems DEFERRED:** Badges/gamification, peer leaderboards, parent SMS notifications.

---

## 14. Known Contradictions (Documented & Frozen)

All 10 contradictions identified between the V1 codebase and the V2 doctrine are cataloged in [`BAC_MASTERY_V2_CONTRADICTIONS.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_CONTRADICTIONS.md). They will be resolved according to the topological migration sequence in Phase 1-6.

---

## 15. Explicitly Deferred / Not Yet Frozen Decisions

The architecture strictly distinguishes what is **FROZEN NOW** from what is **INTENTIONALLY NOT YET FROZEN**:

### FROZEN NOW (Canonical Authority):
- 28 Canonical Domain Entities and 10 Disambiguations.
- Authoritative Mastery States: `not_yet`, `emerging`, `demonstrated`, `review_due`.
- 10 Authoritative Cognitive & Methodological Error Types.
- 4 Mission Duration Classes (Micro, Short, Standard, Deep).
- 6-Layer Diagnostic V2 Architecture (L0 through L5).
- 6 Retention Evidence Dimensions ((c, \kappa, \tau, L, \delta, \text{days})).
- Single Learner State Authority (Supabase Tier 2).
- Source of Truth Hierarchy (5 Tiers).
- Multi-dimensional evidence non-scalar reduction invariant.
- AI zero state authority red line.

### NOT YET FROZEN (To Be Calibrated via Pilot Evidence):
- **Exact Mastery Numerical Weighting:** The specific weighting of internal continuous scores (e.g. latent ability $\theta$).
- **Exact Retention Interval Algorithm:** Classic SM-2 serves as baseline reference; final formula consuming all 6 vectors will be calibrated using pilot cohort data.
- **Psychometric Modeling (IRT / BKT):** Deferred past initial pilot.
- **Cross-Stream Electives:** Deferred; Algerian BAC candidates follow strictly separated ministerial curricula.
- **Automated OCR Handwriting Recognition:** Deferred; structured step selection handles mathematical derivations.

---

## 16. The 24 Architectural Non-Negotiables

These 24 principles are permanently frozen:

1. **One canonical learner state.**
2. **One authoritative source for learner state (Supabase).**
3. **Evidence before inference.**
4. **Attempt ≠ Evidence.**
5. **Evidence ≠ Mastery.**
6. **Error ≠ Misconception.**
7. **Skill ≠ Skill State.**
8. **Priority is contextual, not an intrinsic skill property.**
9. **Roadmap is not Priority (Strategy vs. Tactics).**
10. **Mission is not Lesson (Active vs. Passive).**
11. **Content consumption is not mastery.**
12. **Correctness alone is not sufficient evidence for BAC methodology.**
13. **UI cannot directly mutate authoritative mastery.**
14. **AI cannot directly mutate authoritative learner state.**
15. **Local cache cannot silently override server truth.**
16. **Curriculum must be versioned and immutable in Git.**
17. **Questions must have explicit canonical skill tagging and rubrics.**
18. **Every learner-state mutation must be explainable from raw evidence.**
19. **Decision outputs must expose structured reason codes in Algerian Arabic.**
20. **Existing working capabilities must be preserved unless formally slated for replacement.**
21. **Do not build new infrastructure merely because a cleaner diagram exists.**
22. **Do not rewrite existing high-quality content when metadata tagging is sufficient.**
23. **Do not add AI where deterministic algorithms are sufficient.**
24. **Do not optimize UI before the core learning loop is stable.**
