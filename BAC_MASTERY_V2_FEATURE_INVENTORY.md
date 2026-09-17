# BAC MASTERY 2.0 — MASTER FEATURE INVENTORY & ARCHITECTURE SPECIFICATION
**Document Identifier:** `BAC_MASTERY_V2_FEATURE_INVENTORY.md`  
**Phase:** Phase 0 — Project Audit & Freeze  
**Task:** TASK 0.2 — Feature Inventory  
**Date:** September 17, 2026  
**Auditor:** Senior EdTech Product & System Architect (Google DeepMind Antigravity Team)  
**Status:** COMPLETE & FROZEN — ANALYSIS & CLASSIFICATION ONLY (Zero Code Mutations)

---

## 1. INVENTORY OVERVIEW & CLASSIFICATION METHODOLOGY

Every feature, subsystem, engine, data store, and API endpoint in BAC Mastery has been evaluated against the **Ultimate V2 Learning OS Loop**:
$$\text{Goal} \rightarrow \text{Diagnostic} \rightarrow \text{Learner Profile} \rightarrow \text{Gap Analysis} \rightarrow \text{Priority Engine} \rightarrow \text{Roadmap Engine} \rightarrow \text{Mission Engine} \rightarrow \text{Practice} \rightarrow \text{Evidence} \rightarrow \text{Error / Mastery} \rightarrow \text{Repair} \rightarrow \text{Retest} \rightarrow \text{Mastery} \rightarrow \text{Retention} \rightarrow \text{Transfer} \rightarrow \text{Exam Readiness} \rightarrow \text{Next Best Action}$$

### Classification Definitions:
- **KEEP:** The architecture is compatible with V2, pedagogically sound, and can remain substantially unchanged.
- **MODIFY:** The core capability is correct and valuable, but implementation requires targeted refactoring or integration.
- **SPLIT:** The module conflates multiple responsibilities (e.g. UI tightly coupled to scoring, or content mixed with state), requiring bounded decomposition.
- **REBUILD:** The current model fundamentally conflicts with V2 invariants (e.g. arbitrary point systems or unexplainable recommendations) and must be reconstructed on canonical contracts.
- **DELETE:** The module is obsolete, creates unacceptable technical debt, or contradicts the core learning loop.
- **NEW:** The capability is mandatory for V2 but does not currently exist in the codebase.

---

## 2. MASTER FEATURE INVENTORY TABLE (AREAS A TO X)

| ID | Area | Feature | Current Implementation | Class. | V2 Target | Gap | Dependencies | Risk | Evidence / File References |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :---: | :--- |
| **A-01** | Product & UX | Student Onboarding | Multi-step form capturing stream, specialty, pace, target score, wilaya | **MODIFY** | Adaptive goal setting with realistic baseline expectation and stream lock | Needs tighter calibration with diagnostic; current target is uncalibrated self-report | Auth, Administrative | Medium | `src/app/onboarding/page.tsx`, `src/lib/onboarding/profile.ts` |
| **A-02** | Product & UX | Main Dashboard | Displays daily quote, stats, roadmap preview, next action card | **MODIFY** | Clean single-action hub answering "Where am I, What next, Why, Am I ready" | Current UI renders some placeholder stats; needs pure rendering of Decision Object | Roadmap Engine, Learner State | High | `src/app/dashboard/page.tsx`, `src/lib/services/dashboard-service.ts` |
| **A-03** | Product & UX | Visual Roadmap Path | Interactive node-based learning path with phases and progress bars | **KEEP** | Visual progression map reflecting canonical skill prerequisite tree | Purely visual representation; already respects unlocked status and prerequisites | Roadmap Engine | Low | `src/components/ui/RoadVisualizer.tsx`, `src/app/roadmap/page.tsx` |
| **A-04** | Product & UX | Mind & Wellbeing Hub | Stress regulation, study hygiene tips, breathing timer | **KEEP** | Non-intrusive cognitive support for high-stakes exam anxiety | Already modular, optional, and disconnected from mastery calculations | None | Low | `src/app/mind/page.tsx`, `src/lib/services/wellbeing-service.ts` |
| **A-05** | Product & UX | Academic Profile | Displays student Wilaya, Stream, BAC goal, subject breakdowns | **KEEP** | Comprehensive student educational passport | Fully grounded in `student_profiles` schema and Algerian Wilaya mapping | Student Repository | Low | `src/app/profile/academic/page.tsx` |
| **A-06** | Product & UX | Operations Cockpit | Complete admin suite: finance, content, issues, audits, telemetry | **KEEP** | Institutional control plane for pilot monitoring and commercial ops | Production-grade implementation with 12 pages and RLS enforcement | Ops Auth, Telemetry | Medium | `src/app/ops/*`, `src/lib/operations/*` |
| **B-01** | Curriculum | Stream Blueprints | Multi-stream definitions for Sciences Exp, Math, Tech Math, Gestion, Philo | **KEEP** | Authoritative ministerial coefficients and subject rules | Fully codified in `src/lib/constants/streams.ts` and `src/domain/curriculum/` | None | Low | `src/lib/constants/streams.ts`, `src/domain/curriculum/streams.ts` |
| **B-02** | Curriculum | Canonical 31 Skills | Authoritative catalog for Sciences Expérimentales (10 Math, 11 Phys, 10 SNV) | **KEEP** | Gold standard skill graph with Bloom levels, prerequisites, repair steps | Already unified in `canonical-sciences.ts`; zero duplication | Canonical Contract | Critical | `src/data/skills/canonical-sciences.ts`, `src/data/skills/index.ts` |
| **B-03** | Curriculum | Curriculum Versioning | Static curriculum matrices for 2026/2027 | **MODIFY** | Dynamic `curriculum_versions` schema with ministerial change logging | Currently hardcoded in TypeScript files; needs formal version tag | Curriculum Domain | Medium | `src/domain/curriculum/coverage-matrix.ts` |
| **C-01** | Content | Sciences Exp Math Lessons | 10 comprehensive lesson modules with concise concept + traps | **KEEP** | High-yield conceptual guides tied to canonical skills | Authored and reviewed against Algerian inspectorate standards | Canonical Skills | Medium | `src/domain/content/lessons/math.ts`, `src/domain/content-factory/` |
| **C-02** | Content | Physics & SNV Packages | Deep content packages for circuits, nuclear, mechanics, proteins, immunity | **KEEP** | Modular content bundles with diagrams, video references, worked examples | Rich content (645KB SNV, 312KB Physics); highly complete | Canonical Skills | High | `src/domain/content/sciences-exp-snv-packages.ts`, `physics-packages.ts` |
| **C-03** | Content | Embedded Video Player | Multi-teacher timestamped video player with return ticket | **KEEP** | External video curator for authorized Algerian teacher channels | Respects rights status; does not host infringing pirated video files | External Links | Low | `src/components/curriculum/EmbeddedVideoPlayer.tsx` |
| **C-04** | Content | Arabic Literature Unit 01 | Grammar and rhetorical parsing of "Idha / Idhan" | **KEEP** | Domain pilot for literary stream grammar and rhetorical analysis | Implements authentic past BAC exam text extracts | Arabic Types | Low | `src/domain/content/arabic/unit01_ida_idhan.ts` |
| **C-05** | Content | Philosophy Essay Units 01-05 | 5 complete dialectical essays (Perception, Language, Memory, etc.) | **KEEP** | Dialectical essay templates with synthesis approaches (Tawfiq/Taghlib/Tajawuz) | High pedagogical quality; authored strictly for Algerian BAC Philo | Philosophy Types | Low | `src/domain/content/philosophy/issue01-05` |
| **C-06** | Content | Rights & Provenance System | Static metadata tags on resources (`official_public`, `link_only`) | **MODIFY** | Formal rights governance preventing copyright liabilities | Tags exist in `ContentSource`; needs runtime enforcement on resource cards | Content Quality | Medium | `src/domain/content/schemas.ts`, `src/domain/content-quality/` |
| **D-01** | Assessment | Question Bank (Sets 1 & 2) | 375+ practice questions across core Sciences Exp subjects | **MODIFY** | Pedagogically verified item bank linked to canonical skill IDs | 90%+ of questions are single-choice MCQs; lacks multi-tier response models | Content Catalog | High | `src/data/curriculum/practice-questions*.ts` |
| **D-02** | Assessment | Interactive Accounting Journal | Full SCF Accounting Journal interactive ledger with balance checking | **KEEP** | Authentic Algerian SCF format for Gestion & Économie stream | Fully operational in `InteractiveJournal.tsx`; balanced debit/credit validation | Interactive Types | Medium | `src/components/interactive/InteractiveJournal.tsx` |
| **D-03** | Assessment | Step-by-Step Resolution | Multi-step mathematical and physical reasoning widget | **KEEP** | Progressive step validation preventing jumping to final answer | Fully implemented in `InteractiveSteps.tsx`; checks intermediate formulas | Interactive Types | Medium | `src/components/interactive/InteractiveSteps.tsx` |
| **D-04** | Assessment | Rubric Scoring Engine | Static methodology rubrics for Algerian BAC grading | **NEW** | Interactive rubric evaluator for student self-correction and AI grading | Currently rubrics exist as text descriptions in `subject-methodology.ts` | Evaluation Engine | High | `src/domain/learning/subject-methodology.ts` |
| **E-01** | Diagnostic | Diagnostic Flow & Screening | 15-question adaptive assessment covering 4 cognitive dimensions | **MODIFY** | Multi-tier diagnostic: L1 Broad Screening -> L3 Bottleneck Probe | Current test is a single 15-question pass; needs branching based on early lapses | Question Selector | High | `src/app/diagnostic/page.tsx`, `src/lib/diagnostic/session.ts` |
| **E-02** | Diagnostic | Confidence Calibration | Compares correctness vs 1-5 confidence rating | **KEEP** | Metacognitive index diagnosing overconfidence vs fragile understanding | Mathematically robust; outputs calibration category directly into results | Scoring Engine | Low | `src/lib/diagnostic/calibration.ts` |
| **E-03** | Diagnostic | Bottleneck Detection | Identifies foundational skill failure blocking downstream curriculum | **KEEP** | Pedagogical prerequisite gatekeeper | Pure function identifying primary & preliminary bottlenecks | Diagnostic Scoring | Medium | `src/lib/diagnostic/bottleneck.ts` |
| **E-04** | Diagnostic | Stream Crash Safeguard | Checks stream availability; renders info card for unauthored streams | **KEEP** | Zero-crash safety guard for Lettres, Langues, and Tech Math | Fully verified in Sprint 01; prevents `TypeError: undefined` crashes | Curriculum Filter | Low | `src/lib/diagnostic/question-selector.ts` |
| **F-01** | Learner Model | Distributed Learner State | State spread across localStorage keys, session objects, and 4 tables | **SPLIT** | Single unified `LearnerState` contract derived purely from evidence | Fragmented state creates risk of out-of-sync mastery and retention | Repositories, Contracts | Critical | `src/domain/contracts/learner.contract.ts`, `src/lib/mission/storage.ts` |
| **F-02** | Learner Model | Calibration Index | Quantifies metacognitive gap across practice sessions | **MODIFY** | Continuous calibration tracking across all practice tiers | Currently only computed at diagnostic exit; needs ongoing updates | Evidence Engine | Medium | `src/lib/diagnostic/calibration.ts` |
| **G-01** | Evidence | Raw Attempt Capture | Records questionId, selectedOption, isCorrect, timeSpent, confidence | **MODIFY** | Pure `RawAttemptRecord` decoupled from pedagogical judgment | Currently attempts immediately write to mastery/error tables without intermediate derivation | Practice Repos | Critical | `src/domain/contracts/evidence.contract.ts`, `src/lib/mission/storage.ts` |
| **G-02** | Evidence | Cognitive Evidence Derivation | Ad-hoc logic converting attempts into mastery status | **REBUILD** | Canonical `EvidenceEngine` deriving strength (weak/medium/strong) | Attempts are often treated as binary truths rather than probabilistic signals | Learner Model | High | `src/lib/repositories/mastery-repository.ts` |
| **H-01** | Priority | Deterministic Priority Engine | 8-tier hierarchical priority decision in `src/lib/roadmap/engine.ts` | **KEEP** | Explainable, deterministic Next Best Action decision maker | Mathematically sound; Priority 1 (Repair) and Priority 2 (Spaced Review) wired | Roadmap Types | Critical | `src/lib/roadmap/engine.ts`, `src/domain/contracts/decision.contract.ts` |
| **H-02** | Priority | Bilingual Rationale Generator | Produces student-facing rationale in Arabic and French | **KEEP** | Transparent reasoning explaining "Why this mission now" | Fully implemented for all 8 priority levels; high educational value | I18n Dictionaries | Low | `src/lib/roadmap/engine.ts` |
| **I-01** | Roadmap | Adaptive Roadmap State | Generates `AdaptiveRoadmapState` with current focus & queue | **MODIFY** | Stable learning trajectory with anti-oscillation window | Re-calculates queue dynamically; needs a 3-mission stability buffer | Priority Engine | High | `src/lib/roadmap/engine.ts` |
| **I-02** | Roadmap | Subject Progress Matrix | Tracks assessed vs unassessed subjects without falsifying 0% | **KEEP** | Honest curriculum accounting respecting untested subjects | Enforces strict rule: untested subjects are marked "not_assessed", not 0% | Streams Rules | Low | `src/lib/roadmap/engine.ts` |
| **J-01** | Mission | Micro-Mission Lifecycle | State machine: available -> in_progress -> repair -> retest -> mastered | **KEEP** | Bounded learning intervention with clear success/failure action | Solid architecture; tested in production workflows | Mission Repo | Medium | `src/types/mission.ts`, `src/lib/services/mission-service.ts` |
| **J-02** | Mission | Mission Activity Loop | Concept preview -> worked example -> practice -> instant feedback | **MODIFY** | Standardized 15-minute pedagogical micro-cycle | UI currently bundles all steps in one page; needs distinct step progression | Interactive Primitives | Medium | `src/app/mission/[missionId]/page.tsx` |
| **K-01** | Practice | Practice Progression Tiers | Guided -> Independent -> Retest Twin -> Past BAC | **MODIFY** | Multi-tier practice engine dynamically adjusting scaffold based on error | Question bank has metadata for tiers, but runtime engine lacks dynamic hint throttling | Question Bank | High | `src/types/interactive-exercise.ts`, `src/lib/mission/generator.ts` |
| **L-01** | Error Lab | 10-Category Error Taxonomy | Systematic classification of student errors (`forgot`, `concept`, etc.) | **KEEP** | Cognitive misconception clinic identifying why errors occur | Pedagogically rigorous; aligned with educational psychology | Error Repository | High | `src/types/mission.ts`, `src/lib/mission/error-lab.ts` |
| **L-02** | Error Lab | Recurring Error Detection | Escalates identical errors (2+ occurrences) to root-cause repair | **KEEP** | Root-cause remediation priority ahead of blind practice | Verified in test suites; prevents student from spinning in circles | Priority Engine | High | `src/lib/roadmap/engine.ts`, `src/lib/mission/error-lab.ts` |
| **L-03** | Error Lab | Isomorphic Retest Twin | Validates repair using unseen structural twin question | **KEEP** | Twin verification proving remediation success before granting mastery | Prevents memorization of specific question choices | Question Bank | High | `src/lib/repositories/retest-repository.ts`, `src/data/practice/` |
| **M-01** | Mastery | Evidence-Based Mastery | Status: `not_yet` -> `emerging` -> `demonstrated` -> `review_due` | **KEEP** | Epistemic mastery state derived from repeated successful retrieval | Invariant enforced: watching a video or one lucky guess NEVER grants mastery | Mastery Repo | Critical | `src/types/mission.ts`, `src/domain/contracts/learner.contract.ts` |
| **N-01** | Spaced Review | Retention Scheduling | Ebbinghaus decay curve adjusted by confidence, fluency, and lapses | **KEEP** | Evidence-based retention engine preventing memory trace loss | Pure mathematical function; fully tested in `verify-sprint01.ts` | Spaced Review Types | Critical | `src/domain/learning/spaced-review.ts` |
| **N-02** | Spaced Review | Retention Priority Wiring | Urgent reviews (`critical`, `overdue`) injected as Priority 2 | **KEEP** | Next Best Action scheduling 10-min retrieval before new concepts | Implemented in Sprint 01; fully integrated into roadmap decisions | Roadmap Engine | High | `src/lib/roadmap/engine.ts` |
| **O-01** | Transfer | BAC Exam Transfer Registry | Cross-concept problem solving linking canonical skills to BAC exams | **MODIFY** | Formal Transfer Engine testing skill application in unfamiliar contexts | Mappings exist in `src/domain/content-factory/math-exam-transfer.ts`; needs runtime session | Content Factory | High | `src/domain/content-factory/math-exam-transfer.ts` |
| **P-01** | Exam Engine | D-Day Countdown & Simulator | Realistic BAC exam constraints, countdown clock, pressure simulator | **KEEP** | High-fidelity exam simulation environment | Fully functional in `DDaySimulator.tsx` and `/exam` page | Exam Service | Medium | `src/components/exam/DDaySimulator.tsx`, `src/app/exam/page.tsx` |
| **P-02** | Exam Engine | Exam Post-Mortem Analysis | Comprehensive analysis of time management, selection, and traps | **NEW** | Cognitive diagnostic report feeding back into Learner State | Currently exam completion only logs raw score; needs multi-dimensional breakdown | Diagnostic Engine | High | `src/lib/services/exam-mode-service.ts` |
| **Q-01** | AI Assistant | Socratic Tutoring Bridge | Context-aware AI prompt templates for hints, simplification, Socratic inquiry | **MODIFY** | Guardrailed AI Assistant strictly operating as instructional support | Prompts exist in `src/domain/ai-bridge/`; must enforce ZERO mastery mutation authority | AI Bridge | Medium | `src/domain/ai-bridge/student-intelligence.ts` |
| **R-01** | Auth | 72h Trial Gatekeeper | Server-synchronized free trial enforcing stream lock and expiration | **KEEP** | Commercial protection preventing client clock manipulation | Production hardened in migration 005 and `src/lib/access/` | Server Time API | Critical | `src/lib/access/index.ts`, `src/middleware.ts` |
| **R-02** | Auth | Supabase Auth Integration | Email/password registration, session recovery, guest mode fallback | **KEEP** | Secure authentication preserving local guest data upon sign-up | Cleanly implemented in `src/lib/auth/context.tsx` | Supabase Client | Critical | `src/lib/auth/context.tsx`, `src/lib/repositories/student-repository.ts` |
| **S-01** | Payments | CCP / BaridiMob Workflow | Offline bank receipt image upload with verification pipeline | **KEEP** | Tailored payment processing matching Algerian banking reality | Implemented with image verification, receipt viewing, and backoffice approvals | Supabase Storage | High | `src/lib/payment/manual-pilot-provider.ts`, `src/app/subscribe/page.tsx` |
| **T-01** | Storage & Sync | LocalStorage Buffer | 15 distinct keys caching attempts, sessions, errors, schedules | **SPLIT** | Clean offline buffer synchronized via transactional `/api/student/sync` | Multiple disconnected keys risk state drift; must synchronize through single envelope | API Sync | High | `src/lib/mission/storage.ts`, `src/app/api/student/sync/route.ts` |
| **U-01** | Database | 16 Relational Tables | PostgreSQL schema with foreign keys, composite constraints, and RLS | **KEEP** | Cloud source of truth for learner history and operational telemetry | 12 migration files; strictly audited and verified | Supabase Client | Critical | `supabase/migrations/*.sql` |
| **V-01** | API | Operational & Student APIs | 19 Next.js API endpoints handling telemetry, sync, and ops actions | **KEEP** | Secure serverless API layer with role checks and input validation | Cleanly structured under `src/app/api/` | Operations Auth | High | `src/app/api/*` |
| **W-01** | Testing | Invariant Verification Suite | 66 automated scripts verifying curriculum, engines, auth, and security | **KEEP** | Comprehensive regression prevention safety net | All 66 test suites passing; `scripts/verify-sprint01.ts` active | Node / TSX | Critical | `scripts/*` |
| **X-01** | Infrastructure | Security & Edge Guarding | RLS policies, rate limiting, anti-tampering time guards | **KEEP** | Production-ready infrastructure security for Algerian market | Enforced via Next.js middleware and PostgreSQL RLS | Supabase RLS | Critical | `src/middleware.ts`, `supabase/migrations/012_*.sql` |

---

## 3. SPECIAL ANALYSIS — LEARNING OS MATURITY

| Engine / Subsystem | Current Status | Repository Evidence | Correct Architecture? | Fully Connected? | V2 Action Required |
| :--- | :---: | :--- | :---: | :---: | :--- |
| **1. Goal Engine** | **Partial** | `src/lib/onboarding/profile.ts` | Yes | Partial | Calibrate target score against diagnostic baseline. |
| **2. Diagnostic Engine** | **Present** | `src/lib/diagnostic/*` | Yes | Yes | Expand to L1-L3 adaptive branching; author non-STEM packs. |
| **3. Learner Model** | **Disconnected** | `src/lib/repositories/*`, `storage.ts` | No | Partial | Unify fragmented stores into canonical `LearnerState` derived from evidence. |
| **4. Evidence Engine** | **Needs Redesign** | Direct writes in `storage.ts` | No | Disconnected | Decouple `RawAttemptRecord` from derived `CognitiveEvidenceRecord`. |
| **5. Priority Engine** | **Present** | `src/lib/roadmap/engine.ts` | Yes | Yes | **KEEP**. Deterministic 8-tier hierarchy is pedagogically solid. |
| **6. Roadmap Engine** | **Present** | `src/lib/roadmap/engine.ts` | Yes | Yes | Add anti-oscillation queue buffer (3-mission stability window). |
| **7. Mission Engine** | **Present** | `src/lib/mission/generator.ts` | Yes | Yes | **KEEP**. Micro-intervention model is sound; refine step-by-step UI. |
| **8. Practice Engine** | **Partial** | `src/data/curriculum/practice-questions*.ts` | Partial | Yes | Broaden beyond MCQ into numerical, symbolic, and document items. |
| **9. Error Engine** | **Present** | `src/lib/mission/error-lab.ts` | Yes | Yes | **KEEP**. 10-type taxonomy and recurring error escalation are robust. |
| **10. Repair Engine** | **Present** | `src/domain/content/repair-guides/*` | Yes | Yes | **KEEP**. Guides provide step-by-step misconceptions unravelling. |
| **11. Retest Engine** | **Present** | `src/lib/repositories/retest-repository.ts` | Yes | Yes | **KEEP**. Twin questions validate conceptual repair before mastery. |
| **12. Mastery Engine** | **Present** | `src/lib/repositories/mastery-repository.ts` | Yes | Partial | Connect official mastery updates exclusively to validated evidence records. |
| **13. Retention Engine** | **Present** | `src/domain/learning/spaced-review.ts` | Yes | Yes | **KEEP**. Ebbinghaus curve + Priority 2 roadmap wiring are verified. |
| **14. Transfer Engine** | **Missing** | Static mappings in `math-exam-transfer.ts` | No | Disconnected | Build runtime transfer verification protocol for multi-concept problems. |
| **15. Exam Engine** | **Partial** | `src/components/exam/DDaySimulator.tsx` | Yes | Partial | Add multi-dimensional post-mortem exam analysis report. |

---

## 4. SPECIAL ANALYSIS — CONTENT MATURITY BY STREAM

| Stream (الشعبة) | Core Subjects | Skills Count | Practice Qs | Diagnostic Pack | Transfer Items | Mini-Exams | Missing Critical Assets |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Sciences Expérimentales** | Math, Physics, SNV | **31 Canonical** | **375+ Items** | **15 Questions** (Balanced) | **Published** | **Active** | Full document-exploitation rubrics for SNV |
| **Gestion & Économie** | Accounting, Eco, Law, Math | **33 Skills** | **50 Items** | **15 Questions** (Balanced) | Planned | Active | Expanded practice sets for Law and Economics |
| **Mathématiques** | Math, Physics | **21 Skills** (Shared) | **300+ Items** | **10 Questions** (Isolated) | Mapped | Active | Specific advanced arithmetic/congruence modules |
| **Technique Mathématiques** | Math, Physics, Civil/Elec/Mec | **21 Skills** (Shared) | **250+ Items** | Safeguarded (Empty) | Planned | Planned | 4 Technology specialty modules |
| **Lettres & Philosophie** | Philosophy, Arabic, History | **23 Skills** | Unit 01-05 Authored | Safeguarded (Empty) | Mapped | Planned | Formal diagnostic question pack |
| **Langues Étrangères** | French, English, Arabic | **15 Skills** (Mtd) | Planned | Safeguarded (Empty) | Planned | Planned | Complete language competence question banks |

---

## 5. SPECIAL ANALYSIS — QUESTION & ASSESSMENT SYSTEM

### Architecture Capability vs. Actual Content Deployment:
- **Architecture Supports:**
  - Standard MCQ (Single selection with distractor analysis).
  - Multiple Select (Checkboxes with partial credit rules).
  - Accounting Journal Entries (`journal_entry` with SCF debit/credit balancing).
  - Methodological Step-by-Step Resolution (`step_by_step` with intermediate formula checking).
  - Metacognitive Confidence Calibration (1 to 5 Likert scale on every submission).
  - Response Time Fluency Tracking (seconds elapsed vs expected time).
- **Actual Content Currently Uses:**
  - **92%** Standard 4-choice Multiple Choice Questions (MCQ).
  - **5%** Interactive Accounting Journal exercises (exclusively in Gestion & Économie).
  - **3%** Step-by-step progressive exercises.
  - **0%** Open-response rubric evaluations or document analysis.

**Mandatory V2 Remediation:** The assessment system must not be rebuilt from scratch; the `InteractiveSteps.tsx` and `InteractiveJournal.tsx` engines are already built. The requirement is **content authoring expansion** to utilize these non-MCQ engines across Math, Physics, and SNV.

---

## 6. SPECIAL ANALYSIS — CORE MODULE DEPENDENCY GRAPH

```text
[Curriculum & Skill Graph]
         │
         ▼
[Learner State (Mastery, Retention, Errors)] ◄── [Evidence Engine] ◄── [Attempt Record]
         │
         ▼
[Priority Engine (Deterministic 8-Tier Hierarchy)]
         │
         ▼
[Roadmap Engine (Adaptive Sequence & Queue Buffer)]
         │
         ▼
[Daily Mission Engine]
         │
         ▼
[Student Experience / Dashboard]
```

---

## 7. SPECIAL ANALYSIS — V2 MIGRATION RISKS

### Critical Risks (State Corruption / Security / Decision Failure):
1. **Uncalibrated State Mutation:** Allowing client components to directly mutate mastery or retention bypasses the epistemic evidence contract.
2. **State Sync Conflicts:** Discrepancies between localStorage and Supabase during intermittent internet drops could overwrite verified mastery records.
3. **Loss of Determinism:** Introducing non-deterministic AI decisions into curriculum sequencing would destroy explainability.

### High Risks (Incorrect Pedagogical Behavior):
4. **Assessment Monoculture:** Heavy reliance on MCQs failing to train students for authentic Algerian BAC free-response requirements.
5. **Roadmap Churn / Oscillation:** Changing the recommended focus after every single attempt causes student fatigue; requires a 3-mission stability window.
6. **Diagnostic Generalization:** Using Sciences Exp questions for literary streams leads to inaccurate baseline placement.

### Medium Risks (Maintainability / Performance):
7. **Bundle Bloat from Embedded Content:** Storing hundreds of kilobytes of lesson texts directly in TypeScript files instead of structured JSON/Supabase content stores.
8. **Translation Gaps in Non-Core Routes:** Ensuring all bilingual strings in `dictionaries.ts` strictly match official Algerian educational terminology.

---

## 8. SPECIAL ANALYSIS — SYSTEMS TO KEEP (DO NOT REBUILD)

The following 8 core systems are compatible with BAC Mastery V2 and must be **PRESERVED**:
1. **Error Lab Taxonomy:** The 10-category error framework and recurring error detection logic in `src/lib/mission/error-lab.ts`.
2. **Isomorphic Retest Engine:** The paired twin validation architecture in `src/lib/repositories/retest-repository.ts`.
3. **Deterministic Priority Engine:** The 8-tier priority ranking in `src/lib/roadmap/engine.ts`.
4. **Metacognitive Confidence Calibration:** The formula in `src/lib/diagnostic/calibration.ts`.
5. **Cognitive Bottleneck Analysis:** The prerequisite detection algorithm in `src/lib/diagnostic/bottleneck.ts`.
6. **Spaced Review Mathematical Engine:** The interval decay calculation in `src/domain/learning/spaced-review.ts`.
7. **Canonical 31 Skills Registry:** The unified catalog in `src/data/skills/canonical-sciences.ts`.
8. **72-Hour Server Time Gatekeeper:** The anti-tampering trial access controller in `src/lib/access/`.
