# BAC MASTERY V2 — SYSTEM AUTHORITY MATRIX & VIOLATION REGISTER

**Document Version:** 2.0.0  
**Status:** ARCHITECTURE FROZEN  
**Authority:** Core Architecture Group  
**Workspace:** BAC BEM (Algerian BAC Learning Operating System)  
**Invariant:** Pure specification — zero code mutations.

---

## 1. The Single Ownership Principle

In a complex adaptive learning platform, distributed authority creates architectural catastrophe. If two subsystems believe they have the right to calculate mastery, assign priorities, or record mistakes, state divergence is inevitable.

**The V2 Mandate:**  
> **For every decision, calculation, and state boundary in BAC Mastery V2, there is EXACTLY ONE Authoritative Owner.**  
> All other modules are either passive consumers, telemetry emitters, or projection caches.

---

## 2. Canonical System Authority Matrix

| Decision Domain | Canonical Authoritative Owner | Allowed Writers | Allowed Readers | Prohibited Writers |
| :--- | :--- | :--- | :--- | :--- |
| **Curriculum Truth & Coefficients** | Curriculum OS (Git) | Inspectoral Curriculum Commits | All Engines, UI | Runtime DB, UI, AI |
| **Skill & Prerequisite Definitions** | Curriculum OS (Git) | Curriculum Engineering | All Engines, UI | Runtime DB, UI, AI |
| **Question & Rubric Specifications**| Assessment OS (Git) | Pedagogical Item Authors | Assessment Engine | Runtime DB, UI, AI |
| **Raw Attempt Recording** | Assessment / Telemetry Layer | Student interaction hooks | Evidence Engine | UI renderers, AI |
| **Evidence Generation & Grading** | Evidence Engine | Headless Evaluators | Learner Model | UI components, AI |
| **Learner State Derivation** | Learner Model | Evidence Pipeline | All Engines, UI | React state, LocalStorage |
| **Mastery State Derivation** | Learner Model | Evidence Pipeline | Roadmap, Analytics | UI buttons, AI, Admin |
| *(Derived States: not_yet, emerging, demonstrated, review_due)* | | | | |
| **Retention & Decay Calculation** | Retention Subsystem | Evidence Pipeline (6 Vectors) | Decision Engine | UI components, LocalStorage |
| *(Vectors: correctness, confidence, speed ratio, lapses, decay, days)* | | | | |
| **Tactical Learning Priority** | Decision / Priority Engine | Decision Engine | Roadmap, Mission | UI filters, AI, LocalStorage |
| **Strategic Roadmap Trajectory** | Roadmap Engine | Roadmap Engine | Dashboard, Missions | UI state, LocalStorage |
| **Current Next Best Action** | Decision Engine | Decision Engine | Dashboard CTA, Nav | UI state, AI Assistant |
| **Mission Generation & Lifecycle** | Mission Engine | Mission Engine | Practice Runner | UI components, AI |
| **UI Presentation & Styling** | Experience Layer (React) | Component Renderers | Student (Display) | Database, State Stores |
| **AI Pedagogical Scaffolding** | AI Assistant (Socratic) | LLM Generation Pipeline | Student (Display) | Authoritative Learner State |
| **Authoritative Assessment Result** | Assessment OS | Exam Simulator Engine | Learner Model | UI client calculations |
| **BAC Exam Readiness Estimation** | Learning Decision Layer | Statistical Projection Model | Dashboard, Reports | UI state, AI Assistant |

---

## 3. Register of V1 Architectural Violations (Current Implementation Audit)

The audit of the existing BAC Mastery codebase revealed **10 severe violations** of this Authority Matrix.  
Per the strict rules of TASK 0.3, these violations are **DOCUMENTED HERE IN DETAIL** and will be systematically remediated during subsequent implementation phases without ad-hoc patching:

### Violation 01: Practice Runner Directly Writing to Mistakes Store
- **File:** `src/components/practice/PracticeSession.tsx` & `src/lib/practice/`
- **Violation:** When a student answers incorrectly, the UI component directly pushes a new record into `localStorage.setItem('bac_mistakes', ...)` and updates local error counters.
- **Authority Matrix Rule:** Raw interaction must emit an `Attempt` -> `EvidenceEngine` parses error -> `LearnerModel` updates `ErrorState`. The UI is strictly prohibited from mutating error storage.

### Violation 02: Dashboard Directly Computing Streaks and Review Urgency
- **File:** `src/app/dashboard/page.tsx`
- **Violation:** The dashboard page reads raw arrays from multiple localStorage keys during component mount, loops over dates, and computes streak and overdue reviews in the client render cycle.
- **Authority Matrix Rule:** Streak and review urgency are derived metrics belonging to `LearnerModel` and `RetentionSubsystem`. The UI must be a pure consumer of `useLearnerState().retention.dueCount`.

### Violation 03: Dual Authority Between Supabase and LocalStorage
- **File:** `src/lib/repositories/mastery-repository.ts` & multiple client pages
- **Violation:** Some queries check Supabase, while other hooks fallback to or exclusively query `localStorage.getItem('bac_mastery_store')`. There is no version vector or conflict resolver.
- **Authority Matrix Rule:** Supabase is the sole persistence authority; local storage is strictly a transient read-through cache.

### Violation 04: Roadmap Engine Reading Fragmented Storage Directly
- **File:** `src/lib/roadmap/engine.ts`
- **Violation:** The engine accepts mixed ad-hoc inputs (`onboardingProfile`, `masteryEvidence`, `retentionSchedules`) that are manually assembled across disparate pages, creating the risk of incomplete state feeds.
- **Authority Matrix Rule:** The Roadmap and Decision engines must accept exactly ONE input: the authoritative, consolidated `LearnerState` object.

### Violation 05: Unconstrained AI Tutor Direct Prompts
- **File:** `src/app/api/tutor/route.ts` & `src/lib/ai/`
- **Violation:** The AI assistant receives raw student prompts with arbitrary system context and generates unconstrained markdown answers, occasionally revealing direct numerical solutions.
- **Authority Matrix Rule:** The AI Assistant must operate as a constrained Socratic scaffold, receiving structured error codes from the `ErrorState` and restricted from mutating any learning state.

### Violation 06: Diagnostic Flat Quiz Setting Arbitrary Percentages
- **File:** `src/lib/diagnostic/`
- **Violation:** A flat 15-question quiz sets a blanket percentage score for subjects without estimating true latent ability or prerequisite dependencies.
- **Authority Matrix Rule:** Initial proficiency estimation belongs to the multi-stage `AssessmentOS`, emitting calibrated `EvidenceEvent`s into the `LearnerModel`.

### Violation 07: Client-Side Spaced Review Interval Mutations
- **File:** `src/domain/learning/spaced-review.ts`
- **Violation:** SM-2 intervals are recalculated and saved directly inside browser storage by UI components, allowing device clocks or local manipulation to distort review dates.
- **Authority Matrix Rule:** Retention updates belong to the server-coordinated `RetentionSubsystem` triggered via authenticated evidence events.

### Violation 08: Missing Non-Sciences Canonical Registries
- **File:** `src/data/curriculum/gest-econ.ts` & `lettres-philo.ts`
- **Violation:** Gestion and Lettres curricula exist in legacy unstructured formats without official `CanonicalSkillId`s or coefficient weights.
- **Authority Matrix Rule:** All streams must be governed by the `CanonicalSkill` interface in `Curriculum OS`.

### Violation 09: Orphan Questions Without Skill Mapping
- **File:** `src/data/questions/`
- **Violation:** Several question records lack primary canonical skill tags or reference deprecated legacy string IDs.
- **Authority Matrix Rule:** The Assessment OS must enforce at build time that 100% of questions bind to a registered `CanonicalSkillId`.

### Violation 10: Client Bypassing Payment Verification Webhook
- **File:** `src/lib/payments/` & client checkout components
- **Violation:** Temporary client-side flags could theoretically simulate active subscription status in local storage.
- **Authority Matrix Rule:** User subscription state is owned exclusively by Supabase backend and protected by Row Level Security.
