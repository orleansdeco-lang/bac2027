# BAC MASTERY V2 — TASK 0.3 ARCHITECTURE FREEZE REPORT

**Document Version:** 2.0.0  
**Date:** 2026-09-17  
**Authority:** Core Architecture Group  
**Workspace:** BAC BEM (Algerian BAC Learning Operating System)  
**Task Status:** `ARCHITECTURE_FROZEN`  
**Invariant:** Pure specification & verification — zero code mutations.

---

## 1. Executive Summary: What Was Frozen

Under **TASK 0.3**, the entire architecture of **BAC Mastery V2 (Learning Operating System)** has been codified, disambiguated, and permanently frozen across 10 canonical contract documents prior to initiating any production refactoring.

The system transitions from an ad-hoc collection of localized React states, isolated localStorage arrays, and fragmented Supabase tables to a **unified, deterministic, methodology-aware Learning OS** engineered specifically for the Algerian Baccalaureate (BAC).

### The 10 Master Specification Documents Created:
1. [`BAC_MASTERY_V2_CANONICAL_DOMAIN_CONTRACT.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_CANONICAL_DOMAIN_CONTRACT.md): Exhaustive specification of all 28 domain entities and 10 core distinctions (Skill ≠ Topic, Question ≠ Evidence, Attempt ≠ Evidence, etc.).
2. [`BAC_MASTERY_V2_LEARNER_STATE_CONTRACT.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_LEARNER_STATE_CONTRACT.md): The single canonical `LearnerState` schema across 10 sub-states, separating Raw Evidence from Derived State.
3. [`BAC_MASTERY_V2_STATE_TRANSITIONS.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_STATE_TRANSITIONS.md): The closed 8-stage state transition graph, 10 negative guardrail prohibitions, and the compensation protocol.
4. [`BAC_MASTERY_V2_EVIDENCE_CONTRACT.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_EVIDENCE_CONTRACT.md): The multi-dimensional evidence schema (correctness, independence, velocity, Bloom demand, hint penalties, and ministerial rubrics).
5. [`BAC_MASTERY_V2_ASSESSMENT_CONTRACT.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_ASSESSMENT_CONTRACT.md): Full lifecycle from Question to Decision, supporting 12 assessment formats, and documenting the critical distinction: *Renderer capability is not content diversity*.
6. [`BAC_MASTERY_V2_DECISION_CONTRACT.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_DECISION_CONTRACT.md): Two-phase deterministic Next Best Action evaluator (Hard Constraints before Multi-Factor Ranking).
7. [`BAC_MASTERY_V2_AUTHORITY_MATRIX.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_AUTHORITY_MATRIX.md): Single authoritative owner per decision domain and register of 10 legacy V1 violations.
8. [`BAC_MASTERY_V2_SOURCE_OF_TRUTH.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_SOURCE_OF_TRUTH.md): The 5 tiers of system truth and the cardinal law: *Never two authoritative copies of the same state*.
9. [`BAC_MASTERY_V2_DATA_FLOW.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_DATA_FLOW.md): Complete architectural flow diagram distinguishing Authoritative, Cache, Derived, and AI flows.
10. [`BAC_MASTERY_V2_SYNC_CONTRACT.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_SYNC_CONTRACT.md): Offline-first synchronization contract with client UUIDs, idempotency, and monotonic server reconciliation.
11. [`BAC_MASTERY_V2_MIGRATION_BOUNDARY.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_MIGRATION_BOUNDARY.md): Exact disposition of all 36 areas (19 Preserve, 10 Refactor, 4 Replace, 3 Defer).
12. [`BAC_MASTERY_V2_ARCHITECTURE_FREEZE.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_ARCHITECTURE_FREEZE.md): Executive decision record and 24 architectural non-negotiables.
13. [`BAC_MASTERY_V2_CONTRADICTIONS.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_CONTRADICTIONS.md): Detailed register of 8 fundamental contradictions identified between V1 and V2.

---

## 2. Definitive Answers to the 22 Success Criteria Questions

To ensure zero ambiguity, every question demanded by the Success Criteria is answered definitively:

### 1. Where does curriculum truth live?
**In Git (Tier 1 Source of Truth).** The canonical skill registry, Directed Acyclic Graph (DAG) of prerequisites, and ministerial BAC coefficients are versioned in Git (`src/data/skills/canonical-*.ts`). They are immutable at runtime.

### 2. Where does content truth live?
**In Git (Tier 1 Source of Truth).** Question bank items, official scoring rubrics, distractor misconceptions, and educational media metadata are versioned, peer-reviewed, and stored in `src/data/questions/` and `src/data/curriculum/`.

### 3. Where does learner truth live?
**In Supabase (Tier 2 Source of Truth).** Supabase is the sole authoritative persistence store for learner state (`learner_states`, `evidence_events`, `learner_skill_states`, `learner_retention_schedules`). Browser local storage is strictly a transient cache.

### 4. What exactly counts as evidence?
**An immutable, multi-dimensional `EvidenceEvent`** produced when a student attempt is evaluated against an authored rubric. It captures correctness ((0.00-1.00)), independence score (hint penalties), time velocity ratio, cognitive demand tier, and official ministerial keyword fidelity.

### 5. Who converts evidence into learner state?
**The Evidence Pipeline (`EvidenceProcessor` in the Learner Model).** It is a deterministic state transition engine that ingests `EvidenceEvent`s and calculates mathematical mastery updates (EMA), error ledger entries, and SM-2 retention schedules.

### 6. Who owns mastery?
**The Learner Model.** Mastery is a derived, mathematically modeled latent capability of the student on a specific skill ((0.000-1.000)). No other component may write to mastery tables.

### 7. Who owns retention?
**The Retention Subsystem / Learner Model.** It models memory decay and schedules retrieval practice using the SuperMemo-2 (SM-2) algorithm based on student review evidence.

### 8. Who decides the next action?
**The Decision Engine.** A pure, deterministic evaluator that enforces a two-phase hierarchy (Hard Safety Constraints before Multi-Factor Ranking).

### 9. Who owns the roadmap?
**The Roadmap Engine.** It plans the strategic macro-trajectory across the school year based on the curriculum DAG, student target score, and calendar days remaining until the BAC exam.

### 10. Who creates the mission?
**The Mission Engine.** It packages the tactical decision output into a bounded 15-20 minute intervention with curated questions, instructions, and time budgets.

### 11. What can the UI mutate?
**Only ephemeral presentation state and student interaction inputs.** The UI can capture form clicks, record response times, and emit `Attempt` records. The UI is **STRICTLY FORBIDDEN** from directly modifying mastery, priority, or error statuses.

### 12. What can AI mutate?
**ABSOLUTELY NOTHING.** Generative AI models operate strictly as Socratic explanation engines. They hold zero database write credentials and cannot award mastery or clear errors.

### 13. What happens offline?
**Students can practice and complete missions without connectivity.** Questions are loaded from cache; attempts and optimistic evidence are buffered in an append-only **IndexedDB queue** with unique client UUIDs.

### 14. How does synchronization work conceptually?
**Monotonic reconciliation.** Upon reconnection, the client flushes its ordered queue to Supabase. The server deduplicates via unique `evidenceId`s, executes the Evidence Pipeline, updates the authoritative state, and returns the latest `seqNumber` to rehydrate the client cache.

### 15. How does an attempt become evidence?
**Via Headless Evaluation.** The raw student interaction (clicks, inputs, timing, hints) is evaluated against the question's rubric by a pure evaluator function, normalizing partial credit and deducting hint/time penalties to emit an `EvidenceEvent`.

### 16. How does evidence change learner state?
**Via the State Transition Reducer.** The Evidence Pipeline applies the evidence to the target skill's Exponential Moving Average (EMA). If high-tier success is repeated twice, status promotes to `"mastered"`. If errors occur, the error ledger is updated. If from a review session, SM-2 intervals recalibrate.

### 17. How does learner state produce a decision?
**Through the Decision Engine's Two-Phase Evaluator.** It checks hard safety gates (unmastered prerequisites, critical memory decay (ge 4) days overdue, active unverified repairs). If all gates are clear, it scores candidate skills by BAC coefficient, gap severity, and exam frequency.

### 18. How does the decision produce a mission?
**The Mission Engine templates the action.** Based on the decision's action type (`active_repair`, `critical_retention`, `retest`, `high_impact_skill`), it selects appropriate items from the question bank and sets the time budget.

### 19. How does the mission produce new evidence?
**Through active student execution.** The student answers the exercises in the Practice Runner, generating raw `Attempt` payloads that feed back into the headless evaluator, completing the loop.

### 20. Which current systems are preserved?
**19 core subsystems are PRESERVED:** Layer 1 contracts, 31 Sciences Exp canonical skills, Chargily Pay, Supabase SSR Auth, Interactive Journal UI, Interactive Steps UI, D-Day Exam Simulator, Error Taxonomy definitions, Audio Player, PDF Exporters, Landing page, Verification suite, and UI primitives.

### 21. Which systems will eventually be replaced?
**4 legacy implementations will be REPLACED:**
1. Flat 15-question diagnostic quiz -> Replaced by 3-stage adaptive diagnostic.
2. 15 scattered localStorage keys -> Replaced by single-key cache + Sync Engine.
3. Inlined UI grading logic -> Replaced by headless pure evaluator.
4. Deprecated storage shims -> Safely deleted after state migration.

### 22. Which decisions are intentionally deferred?
**3 architectural areas are DEFERRED:**
1. Advanced IRT / Bayesian Knowledge Tracing (EMA model is sufficient for pilot).
2. Cross-stream elective selection (Algerian BAC uses fixed ministerial streams).
3. Handwritten OCR recognition (structured step selection handles math derivations).

---

## 3. Verification & Guardrail Confirmation

The required non-destructive verification was executed:
- **Production Code Changes:** 0 (Zero files in `src/` or database mutated).
- **Database Migrations:** 0 (Zero schema migrations run).
- **Sprint 01 Verification:** `npx tsx scripts/verify-sprint01.ts` **PASSED (7/7 Suites, Exit Code 0)**.
- **TypeScript Typecheck:** `npm run typecheck` (`tsc --noEmit`) **PASSED (0 Errors, Exit Code 0)**.

---

## 4. Final Architectural Status

```
==================================================================
           BAC MASTERY V2 ARCHITECTURE STATUS:
                  ARCHITECTURE_FROZEN
==================================================================
```

The architectural authority for BAC Mastery V2 is established.  
**Execution is halted per the Stop Condition. No code changes will be made until explicit user authorization.**
