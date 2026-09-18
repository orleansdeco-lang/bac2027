# BAC MASTERY V2 — ARCHITECTURAL CONTRADICTION REGISTER

**Document Version:** 2.0.0  
**Status:** ARCHITECTURE FROZEN  
**Authority:** Core Architecture Group  
**Workspace:** BAC BEM (Algerian BAC Learning Operating System)  
**Invariant:** Pure specification — zero code mutations.

---

## 1. The Principle of Non-Silent Reconciliation

> [!WARNING]
> **CRITICAL ARCHITECTURAL DIRECTIVE:**  
> **DO NOT SILENTLY RECONCILE CONTRADICTIONS.**  
> An engineering team must never "paper over" fundamental discrepancies between the product vision, pedagogical science, and legacy code. Every mismatch must be registered with surgical clarity, evaluated for risk, and assigned a formal resolution decision.

---

## 2. Register of Identified Architectural Contradictions

Below is the complete register of 8 fundamental contradictions identified across the repository audit (TASK 0.1), feature inventory (TASK 0.2), and the V2 architecture doctrine:

---

### Contradiction 01: Dual Authority Between LocalStorage and Supabase
- **Description:** The system has two competing persistence systems operating simultaneously without synchronization.
- **Current Behavior:** Many components read and write directly to 15 different `localStorage` keys (`bac_mastery_store`, `bac_mistakes`, `bac_spaced_reviews`). Other services write to 16 Supabase tables. If a student uses two devices or clears their browser history, mastery states diverge completely.
- **Desired V2 Behavior:** Supabase is the sole authoritative persistence store. A single local cache (`bac_learner_state_v2`) acts as an optimistic mirror with an offline event buffer.
- **Risk:** High (data loss, streak corruption, multi-device failure).
- **Decision Required:** Execute state consolidation during Phase 2; provide automatic local-to-cloud migration on user login.
- **Freeze Status:** **FROZEN NOW** in [`BAC_MASTERY_V2_LEARNER_STATE_CONTRACT.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_LEARNER_STATE_CONTRACT.md).

---

### Contradiction 02: Flat Diagnostic vs. Adaptive Multi-Stage Profiling
- **Description:** The marketing vision promises an "AI-driven adaptive diagnostic", while the codebase contains a flat static quiz.
- **Current Behavior:** The diagnostic route runs a static 15-question test that outputs a generic percentage score without branching, item calibration, or prerequisite mapping.
- **Desired V2 Behavior:** A 3-stage adaptive diagnostic: (1) coarse unit screening, (2) targeted weak-skill probing, and (3) baseline initialization of `LearnerState` with projected BAC grade.
- **Risk:** High (misclassifying students; generating misaligned roadmaps on Day 1).
- **Decision Required:** Completely rebuild `src/lib/diagnostic/` in Phase 3.
- **Freeze Status:** **FROZEN NOW** in [`BAC_MASTERY_V2_MIGRATION_BOUNDARY.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_MIGRATION_BOUNDARY.md).

---

### Contradiction 03: Advanced Renderer Capability vs. 92% Multiple Choice Content
- **Description:** Discrepancy between UI renderer sophistication and actual authored content diversity.
- **Current Behavior:** The codebase possesses high-quality renderers for accounting double-entry ledgers (`InteractiveJournal.tsx`) and multi-stage deductions (`InteractiveSteps.tsx`), yet 92% of the 465+ questions in `src/data/practice/` are standard single-choice MCQs.
- **Desired V2 Behavior:** Maintain existing renderers and expand the authored question bank with multi-stage reasoning and document exploitation items matching official Algerian BAC standards.
- **Risk:** Medium (pedagogical skepticism from teachers/inspectors if platform appears to be just a "quiz app").
- **Decision Required:** Do NOT write new UI renderers; invest engineering time in tagging and authoring structured problem sets.
- **Freeze Status:** **FROZEN NOW** in [`BAC_MASTERY_V2_ASSESSMENT_CONTRACT.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_ASSESSMENT_CONTRACT.md).

---

### Contradiction 04: Spaced Review Engine vs. Runtime Integration Gap
- **Description:** A theoretically sound SuperMemo-2 implementation exists in isolation from the student's daily mission loop.
- **Current Behavior:** `spaced-review.ts` correctly calculates SM-2 intervals, but until Sprint 01, the Roadmap and Mission engines completely ignored overdue review dates when selecting daily missions.
- **Desired V2 Behavior:** Priority 2 in the Decision Engine enforces critical spaced reviews ((ge 4) days overdue) before advancing to new syllabus content.
- **Risk:** Medium (student forgets previously mastered skills before the June BAC exam).
- **Decision Required:** Sprint 01 successfully verified Priority 2 injection in `engine.ts`; formalize integration into the unified `LearnerState` during Phase 2.
- **Freeze Status:** **FROZEN NOW** in [`BAC_MASTERY_V2_DECISION_CONTRACT.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_DECISION_CONTRACT.md).

---

### Contradiction 05: Stream Parity Disparity (Sciences vs. Gestion & Lettres)
- **Description:** Sciences Expérimentales has 31 canonical skills and rich practice content, while other streams have legacy or partial curriculum definitions.
- **Current Behavior:** Sciences Exp is 100% covered by Layer 1 contracts and verified in Sprint 01. Gestion & Économie (33 skills) and Lettres & Philosophie (23 skills) exist in legacy formats with non-canonical IDs.
- **Desired V2 Behavior:** All streams implemented under the identical `CanonicalSkill` contract with official Algerian coefficients.
- **Risk:** Medium (students in non-sciences streams experience degraded adaptive features).
- **Decision Required:** Complete Sciences Exp pilot first; port Gestion and Lettres during Phase 2.
- **Freeze Status:** **FROZEN NOW**; Sciences Exp is prioritized for initial stabilization.

---

### Contradiction 06: Commercial Monetization vs. Frictionless Onboarding
- **Description:** Tensions between paid paywall gating (Chargily Pay) and pedagogical diagnostic access.
- **Current Behavior:** The onboarding and diagnostic flows allow any user to test their level, but daily missions and detailed mistake repairs require active subscription or proof of payment.
- **Desired V2 Behavior:** Allow 100% free access to the Diagnostic Baseline and Lesson 1 of each subject; gate adaptive daily practice and Error Lab behind subscription.
- **Risk:** Low (conversion funnel balance).
- **Decision Required:** Preserve existing Chargily Pay integration; align access gates in route middleware.
- **Freeze Status:** **FROZEN NOW** in [`BAC_MASTERY_V2_MIGRATION_BOUNDARY.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_MIGRATION_BOUNDARY.md).

---

### Contradiction 07: Unconstrained AI Tutor vs. Pedagogical Socratic Scaffolding
- **Description:** Direct LLM chat endpoint risks leaking solutions and bypassing active retrieval.
- **Current Behavior:** `/api/tutor` forwards prompts with broad context, allowing students to paste questions and receive direct answers.
- **Desired V2 Behavior:** The AI Tutor acts as a Socratic coach, constrained by the student's active `ErrorTaxonomyCode` and prohibited from revealing final numerical or proof answers.
- **Risk:** High (undermining student learning; cognitive offloading).
- **Decision Required:** Refactor prompt pipeline to inject strict pedagogical guardrails and error codes during Phase 6.
- **Freeze Status:** **FROZEN NOW** in [`BAC_MASTERY_V2_AUTHORITY_MATRIX.md`](file:///c:/Users/dina/Desktop/BAC%20BEM/BAC_MASTERY_V2_AUTHORITY_MATRIX.md).

---

### Contradiction 08: Client-Side React Rendering vs. Server-Side Hydration
- **Description:** Client components reading browser storage during mount trigger Next.js hydration warnings.
- **Current Behavior:** Dashboard and Practice components inspect `localStorage` in `useEffect` or during render, leading to layout shifts and hydration console errors.
- **Desired V2 Behavior:** Pure SSR rendering with default skeletons, rehydrated seamlessly via the unified `useLearnerState` hook backed by local cache.
- **Risk:** Low (developer experience and UI flicker).
- **Decision Required:** Modernize dashboard and practice pages to consume the unified hook in Phase 6.
- **Freeze Status:** **FROZEN NOW**.


---

## 3. Contradiction Resolution Status (Post TASK 0.3B)

All 8 identified contradictions have been addressed in the revised contracts:
- **Contradiction 01 (Dual Storage):** Resolved in `LEARNER_STATE_CONTRACT.md` (Supabase sole authority, single local cache).
- **Contradiction 02 (Diagnostic):** Resolved in `ASSESSMENT_CONTRACT.md` (Rebuilding with full 6 layers L0–L5).
- **Contradiction 03 (Renderer vs Content):** Resolved in `ASSESSMENT_CONTRACT.md` (Preserving renderers, prioritizing content authoring).
- **Contradiction 04 (Spaced Review):** Resolved in `CANONICAL_DOMAIN_CONTRACT.md` & `EVIDENCE_CONTRACT.md` (6 evidence vectors established; Priority 2 enforced).
- **Contradiction 05 (Stream Parity):** Resolved in `MIGRATION_BOUNDARY.md` (Sciences Exp stabilized first, followed by Gestion & Lettres).
- **Contradiction 06 (Monetization):** Resolved (Free diagnostic baseline, gated adaptive daily missions).
- **Contradiction 07 (AI Scaffolding):** Resolved in `AUTHORITY_MATRIX.md` (Socratic constraints, zero write authority).
- **Contradiction 08 (Hydration):** Resolved in `STATE_TRANSITIONS.md` (Pure SSR with reactive `useLearnerState`).
