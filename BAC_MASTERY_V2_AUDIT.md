# BAC MASTERY 2.0 — COMPLETE SYSTEM AUDIT & ARCHITECTURE INVENTORY
**Document Identifier:** `BAC_MASTERY_V2_AUDIT.md`  
**Phase:** Phase 0 — Project Audit & Freeze  
**Task:** TASK 0.1 — Repository Audit  
**Date:** September 17, 2026  
**Auditor:** Senior EdTech Product & System Architect (Google DeepMind Antigravity Team)  
**Status:** COMPLETED — STRICT AUDIT MODE (Zero Unauthorized Code Mutations)

---

## 1. EXECUTIVE SUMMARY & ARCHITECTURAL POSTURE

BAC Mastery is transitioning from its foundational V1 iteration (a high-quality modular prototype with strong pedagogical assets) to **BAC Mastery 2.0: The Learning Operating System for Algerian BAC Students**.

This comprehensive audit evaluates the entire repository as of commit `Sprint 01` against the **13 Canonical Product Layers** and **Final Learning Loop**:
$$\text{Goal} \rightarrow \text{Diagnostic} \rightarrow \text{Profile} \rightarrow \text{Gaps} \rightarrow \text{Priority} \rightarrow \text{Roadmap} \rightarrow \text{Mission} \rightarrow \text{Practice} \rightarrow \text{Evidence} \rightarrow \text{Error/Mastery} \rightarrow \text{Repair} \rightarrow \text{Retest} \rightarrow \text{Retention} \rightarrow \text{Transfer} \rightarrow \text{Exam Readiness}$$

### Key Findings at a Glance:
1. **Strong Pedagogical Assets Already Built:** Exactly **31 Canonical Skills** for *Sciences Expérimentales* (10 Math, 11 Physics, 10 SNV) are authoritatively defined with complete pedagogical metadata, repair steps, and cognitive dimensions.
2. **Deterministic Priority Engine:** The engine in `src/lib/roadmap/engine.ts` executes an explainable 8-tier priority hierarchy with mathematical rigor, now natively integrating **Spaced Retrieval Review** (Priority 2) and **Error Repair Loops** (Priority 1).
3. **Database Foundation:** 12 active migrations in `supabase/migrations/` define 16 relational tables with Row-Level Security (RLS) and localStorage fallback resilience.
4. **Operations Cockpit:** A complete operational suite (`/ops`) covers audit logs, payment verifications (CCP/BaridiMob), subscription management, issue tracking, and student directories.
5. **Architectural Gaps to Close in V2:**
   - Decouple empirical attempts from derived cognitive evidence (contracts established in Sprint 01, now requiring runtime wiring).
   - Expand non-MCQ item formats (step-by-step, document analysis, rubrics).
   - Prevent UI components from calculating pedagogical state; enforce strict rendering of domain decisions.

---

## 2. DEEP-DIVE INSPECTION ACROSS THE 19 AUDIT DIMENSIONS

### 2.1 Folders & Codebase Physical Layout
```text
BAC BEM/
├── docs/                        # Formal architecture reports & educational audits (20+ markdown reports)
├── public/                      # Static assets, SVG diagrams, Algerian educational maps
├── scripts/                     # 66 verification, smoke-test, and audit scripts (all passing)
├── src/
│   ├── app/                     # 34 Next.js 14 App Router pages + 19 API endpoints
│   ├── components/              # 25 production UI components & interactive widgets
│   ├── data/                    # Curriculum catalogs, question banks, diagnostic packages
│   │   ├── curriculum/          # Topics, practice questions, re-export facade
│   │   ├── diagnostic/          # Packaged diagnostic items (Sciences Exp, Gestion, Math)
│   │   ├── practice/            # Domain-specific practice question sets
│   │   └── skills/              # Canonical skills catalogs (Sciences, Gestion, Philo)
│   ├── domain/                  # Pure domain logic (Contracts, Content, Learning, Curriculum)
│   │   ├── administrative/      # Wilaya/Daira data & Algerian phone validation (05/06/07)
│   │   ├── ai-bridge/           # Socratic AI tutoring bridge & prompt constraints
│   │   ├── content/             # Lessons, repair guides, past BAC references, Arabic & Philo units
│   │   ├── content-factory/     # Batch packages & exam transfer registries
│   │   ├── content-quality/     # Authoring contracts, claim audits, quality scoring
│   │   ├── contracts/           # Layer 1 Pure TypeScript Contracts (Zero-DOM/React dependencies)
│   │   ├── curriculum/          # Coverage matrices, streams, subjects definitions
│   │   ├── learning/            # Spaced review engine, methodology families, twin questions
│   │   ├── learning-ecosystem/  # Escalations, external references, teacher assistance
│   │   └── student/             # Learning context & profile isolation rules
│   ├── lib/                     # Engines, repositories, services, auth, i18n, operations
│   │   ├── access/              # 72h trial enforcement & server-time synchronization
│   │   ├── analytics/           # Privacy-first telemetry and event tracking
│   │   ├── auth/                # Supabase auth context, hooks, guest fallback
│   │   ├── diagnostic/          # Scoring, calibration, bottleneck diagnosis, session manager
│   │   ├── i18n/                # Arabic-first bilingual dictionaries (ar/fr)
│   │   ├── mission/             # Mission generator, Error Lab logic, client storage
│   │   ├── operations/          # Backoffice KPIs, receipts, financial audits, issues
│   │   ├── repositories/        # 8 Supabase data access objects with localStorage fallback
│   │   ├── roadmap/             # Deterministic Adaptive Roadmap Engine
│   │   ├── services/            # Application service orchestrators (Dashboard, Mission, Progress)
│   │   └── supabase/            # Supabase client (browser + server)
│   ├── types/                   # Cross-cutting TypeScript definitions
│   └── middleware.ts            # Route protection, trial gatekeeper, ops role enforcement
└── supabase/
    └── migrations/              # 12 production-grade SQL migrations (16 tables)
```

---

### 2.2 Routes & Page Endpoints
Total Page Routes: **34** | Total API Route Handlers: **19**

#### Student Experience Routes:
- `/` : Landing page & institutional value proposition.
- `/onboarding` : Diagnostic readiness questionnaire, target score, pace, wilaya selection.
- `/diagnostic` : Multi-dimensional diagnostic assessment (Sciences Exp, Math, Gestion-Eco; safely guarded for other streams).
- `/diagnostic/results` : Diagnostic analysis, calibration index (over/underconfidence), cognitive bottleneck report.
- `/roadmap` : Student roadmap visualizer, current focus, upcoming queued missions.
- `/dashboard` : Central learning hub answering "What to do next and why".
- `/mission/[missionId]` : Interactive micro-learning cycle (understand, practice, verify).
- `/error-lab` : Targeted misconception clinic (remedial guides, twin retests).
- `/curriculum` : Structured syllabus tree, topic explorer, official BAC coefficient breakdown.
- `/exam` : Timed BAC exam simulator with D-Day constraints.
- `/mind` : Cognitive state, study hygiene, exam stress regulator.
- `/progress` : Mastery accounting, retention indicators, streak & effort metrics.
- `/profile/academic` : Stream, specialty, target score, academic history.
- `/account` : Account settings, subscription status, trial timer.
- `/subscribe` : Subscription tier selector, CCP/BaridiMob payment receipt upload.
- `/auth/login`, `/auth/register`, `/register` : Secure authentication flows.
- `/reset-demo` : Developer/tester data reset utility.

#### Backoffice & Operations Cockpit Routes (`/ops`):
- `/ops/login` : Role-gated operational login.
- `/ops/overview` : High-level cockpit KPIs (MRR, active students, completion rates).
- `/ops/students` & `/ops/students/[id]` : Student directory, profile inspect, manual trial extension.
- `/ops/finance` : Payment verification queue (receipt image inspection, approval/rejection).
- `/ops/subscriptions` : Plan management, pricing overrides.
- `/ops/learning` & `/ops/pedagogy` : Learning loop analytics, bottleneck frequency, error heatmaps.
- `/ops/content` : Content lifecycle audit, authoring coverage matrix.
- `/ops/issues` : Operational issue tracker (bug reports, pedagogical tickets).
- `/ops/audit` : Immutably logged system actions.
- `/ops/system` : Edge guarding, latency monitoring, Supabase connection status.

#### API Endpoints (`src/app/api/`):
- `/api/server-time` : Tamper-proof server clock for 72h trial enforcement.
- `/api/student/sync` : Two-way offline/online client data synchronization.
- `/api/subscriptions/plans` : Dynamic subscription pricing and tier metadata.
- `/api/telemetry/events` : Anonymized learning interaction telemetry.
- `/api/ops/*` (15 dedicated handlers) : Secure management of students, receipts, audits, roles, and issues.

---

### 2.3 Components & UI Systems
Total Components in `src/components/`: **25**
- **Design System & Shells:** `AppShell.tsx`, `Sidebar.tsx`, `TopBar.tsx`, `BottomNav.tsx`, `Container.tsx`, `ThemeSelector.tsx`, `LanguageSwitcher.tsx`.
- **Atoms & Primitives:** `Button.tsx`, `Card.tsx`, `Badge.tsx`, `ProgressBar.tsx`, `Logo.tsx`.
- **Educational & Mathematical Renderers:**
  - `MathRenderer.tsx` : KaTeX-powered mathematical formula rendering.
  - `DiagramViewer.tsx` : Interactive SVG & canvas scientific diagrams (biological circuits, electrical schemes).
  - `EmbeddedVideoPlayer.tsx` : Multi-source Algerian teacher video player with timestamped bookmarks.
  - `RoadVisualizer.tsx` : Visual step-by-step roadmap path representation.
  - `DDaySimulator.tsx` : Realistic BAC countdown clock and pressure simulator.
  - `InteractiveSteps.tsx` & `InteractiveJournal.tsx` : Guided pedagogical steps and metacognitive reflection.
  - `TeacherEscalationModal.tsx` & `ExternalResourceWithReturnTicket.tsx` : Safe external pedagogical handoffs.

---

### 2.4 Domain Layer
Structured into **10 specialized sub-packages**:
1. `contracts/` : Layer 1 pure TypeScript interfaces:
   - `canonical-skill.contract.ts` : Unifies competence identity, prerequisites, dimensions, and repair steps.
   - `evidence.contract.ts` : Strictly separates `RawAttemptRecord` from derived `CognitiveEvidenceRecord`.
   - `learner.contract.ts` : Comprehensive cognitive state model (mastery, emerging, active errors, retention).
   - `decision.contract.ts` : Explainable, deterministic next-best-action contracts.
2. `curriculum/` : Multi-stream coverage matrices, subject coefficient rankings, and credit rules.
3. `learning/` :
   - `spaced-review.ts` : Evidence-calibrated retention scheduling based on fluency, confidence, and lapse count.
   - `subject-methodology.ts` : Algerian BAC ministerial methodology rubrics (Math, Physics, SNV, Philosophy, Arabic).
4. `content/` : Central repository of verified lessons, worked examples, and exam references.
5. `content-factory/` : 3 large batch production packages for Mathematics (derivatives, limits, sequences, geometry).
6. `content-quality/` : Automated claim auditor, curriculum verification matrices, and provenance checkers.
7. `ai-bridge/` : Guardrailed Socratic AI tutoring layer preventing direct state mutation.
8. `student/` : Stream compatibility filters and learning context validators.
9. `administrative/` : Algerian administrative geography (58 Wilayas + Dairas) and phone verification.
10. `learning-ecosystem/` : Handoffs, external reference curation, teacher assistance contracts.

---

### 2.5 Library (`src/lib/`) Architecture
- **Diagnostic Engine (`lib/diagnostic/`):**
  - `scoring.ts` : Normalizes raw attempt scores across cognitive dimensions.
  - `calibration.ts` : Computes metacognitive calibration index (identifies overconfidence vs impostor syndrome).
  - `bottleneck.ts` : Identifies foundational bottlenecks obstructing curriculum progression.
  - `question-selector.ts` : Stream-isolated diagnostic packaging with zero-crash fallback for unauthored streams.
- **Adaptive Roadmap Engine (`lib/roadmap/engine.ts`):**
  - Pure, deterministic, side-effect-free function `getNextBestMission(input)`.
  - Prioritizes interventions in strict 8-tier hierarchy:
    1. Unclosed Repair / Retest Loops (Priority 1)
    2. Critical / Overdue Spaced Retrieval Review (Priority 2)
    3. Recurring Error Root Cause (Priority 3)
    4. Diagnostic Cognitive Bottleneck (Priority 4)
    5. Emerging Skill Verification (Priority 5)
    6. Active Subject Sequence (Priority 6)
    7. Next Core Coefficient Subject (Priority 7)
    8. Needs More Work Recovery (Priority 8)
- **Data Repositories (`lib/repositories/`):**
  - Complete data access layer for `student_profiles`, `diagnostic_sessions`, `missions`, `errors`, `error_repairs`, `retests`, `skill_mastery`, and `retention_schedules`.
  - Automatically falls back to client storage when offline or when Supabase is disconnected.

---

### 2.6 Database & Migrations
12 SQL migration scripts located in `supabase/migrations/` defining **16 relational tables**:
1. `student_profiles` : Core student identity, stream, target score, 72h trial timestamps, phone, wilaya.
2. `diagnostic_sessions` : Diagnostic session lifecycle (in_progress, completed).
3. `diagnostic_answers` : Granular student responses to diagnostic questions.
4. `diagnostic_results` : Calculated baseline scores, dimension proficiencies, identified bottleneck.
5. `missions` : Generated educational interventions, status, estimated time.
6. `practice_attempts` : Raw attempt records, response times, chosen options, correctness.
7. `errors` : Documented mistakes, suspected error types (10 categories), recurrence flags.
8. `error_repairs` : Pedagogical repair session records and student notes.
9. `retests` : Isomorphic twin question validation attempts.
10. `skill_mastery` : Official demonstrated mastery states with timestamp verification.
11. `user_roles` : Role-Based Access Control (`student`, `ops_admin`, `pedagogical_lead`, `finance_reviewer`).
12. `telemetry_events` : Immutable append-only operational and learning events.
13. `payment_orders` : CCP/BaridiMob transaction records, receipt storage paths, amounts.
14. `operations_audit_logs` : Tamper-evident log of all backoffice operations.
15. `subscription_plans` : Active pricing tiers, validity periods, feature entitlements.
16. `operations_issues` : Internal bug and pedagogical ticketing system.

---

### 2.7 Supabase Integration & Security Posture
- **Client Implementation:** `src/lib/supabase/client.ts` exports singleton `supabase` instance using public anonymous key.
- **Server Implementation:** `src/lib/supabase/server.ts` handles server-side operations.
- **Security Check:** Zero leaks of `service_role` keys in client code.
- **Row-Level Security (RLS):** All student tables enforce `auth.uid() = user_id`.
- **Offline / Graceful Degradation:** When Supabase credentials are missing or internet connection drops, repositories gracefully fall back to localStorage without throwing runtime exceptions.

---

### 2.8 Content Inventory & Canonical Status
- **Canonical Pilot Package (Sciences Expérimentales):**
  - **Mathematics (10 Skills):** Functions, Chain Rule, Intermediate Value Theorem (TVI), Asymptotes, Tangents, Exponentials, Logarithms, Mathematical Induction, Numerical Sequences, Combinatorics & Conditional Probability.
  - **Physics (11 Skills):** Chemical Kinetics, Redox Titrations, RC Time Constant & Differential Equations, RL Circuits, Radioactive Decay Law, Mass Defect & Binding Energy, Newton's 2nd Law, Satellite & Planetary Motion (Kepler), Acid-Base pH & Ka Equilibria, Esterification.
  - **Natural Sciences / SNV (10 Skills):** Protein Synthesis & Transcription, Genetic Code Translation, Protein Structure & Ionization, Enzyme Kinetics & Active Sites, Humoral Immunity & Antibodies, Cellular Immunity & LTC, HIV & Immunodeficiency, Synaptic Transmission, Action Potential & Ionic Basis, Scientific Experimental Analysis.
- **Expanded Pilot (Gestion & Économie):** 33 skills across Accounting, Economics, Law, and Applied Mathematics.
- **Pilot Authoring (Lettres & Philosophie):** 23 skills, with Units 01-05 authored (Perception, Language & Thought, Consciousness, Memory & Imagination, Habit & Will).
- **Arabic Literature:** Unit 01 (Idha / Idhan grammatical parsing and rhetorical analysis) authored.

---

### 2.9 Questions & Assessment OS
- **Diagnostic Packs:**
  - Sciences Exp: 15 questions (5 Math, 5 Physics, 5 SNV) covering 4 dimensions.
  - Gestion Eco: 15 questions (4 Accounting, 4 Economics, 3 Law, 4 Math).
  - Math Stream: 10 questions (5 Math, 5 Physics, zero biology).
- **Practice Question Sets:**
  - Expanded Set 1: 220 items with pedagogical feedback.
  - Expanded Set 2: 155 items with detailed rationale.
  - Sciences Exp Set: 90 high-yield items.
  - Gestion Eco Set: 50 domain items.
- **Assessment Formats:** Currently dominated by 4-choice Multiple Choice Questions (MCQ) with confidence ratings (1 to 5). *Gap identified: Need step-by-step, document exploitation, and rubric-scored open items for BAC realism.*

---

### 2.10 Diagnostic Engine Flow
```text
User enters /diagnostic
  ├── Stream check: Is diagnostic available for stream?
  │     ├── YES: Load balanced 15-question pack
  │     └── NO:  Render graceful informational card with syllabus links (Zero crash)
  ├── Interactive Assessment (15 questions):
  │     ├── Select Option
  │     ├── Provide Metacognitive Confidence (1 to 5)
  │     └── Record Elapsed Response Time (seconds)
  ├── Session Completion:
  │     ├── Calculate Sub-scores (Knowledge, Understanding, Application, Methodology)
  │     ├── Evaluate Confidence Alignment (Well-calibrated, Overconfident, Underconfident)
  │     └── Identify Foundational Bottleneck
  └── Redirect to /diagnostic/results -> Generate First Personalized Mission
```

---

### 2.11 Adaptive Roadmap Engine
- **Source File:** `src/lib/roadmap/engine.ts`
- **Pure Function:** `generateAdaptiveRoadmap(input: AdaptiveRoadmapInput): AdaptiveRoadmapState`
- **Key Properties:**
  - 100% Deterministic: Same input strictly generates identical roadmap.
  - Explainable: Every single recommended mission includes bilingual rationales (`ar` and `fr`) explaining *why* it was chosen and what evidence triggered it.
  - Anti-Oscillation: Respects learning loops before shifting subjects.

---

### 2.12 Mission Engine
- **Source File:** `src/lib/mission/generator.ts`
- **Micro-Intervention Model:**
  - **Understand:** 3-minute concise explanation of concept & common trap.
  - **Practice:** 2-3 focused application problems.
  - **Evidence Capture:** Instant recording of correctness, time, confidence.
  - **Outcome Branching:**
    - Success -> Emerging / Demonstrated Mastery -> Spaced Retention Schedule.
    - Lapse -> Active Error Documented -> Targeted Remediation Plan.

---

### 2.13 Error Lab & Misconception Taxonomy
- **Source File:** `src/lib/mission/error-lab.ts`
- **Taxonomy (10 Canonical Error Types):**
  1. `forgot_information` (نسيان معلومة أو قانون)
  2. `misunderstood_concept` (سوء فهم للمفهوم)
  3. `methodology_error` (خلل في المنهجية أو خطوات الحل)
  4. `calculation_error` (خطأ حسابي أو جبري)
  5. `misread_question` (قراءة غير دقيقة لنص السؤال)
  6. `rushed` (تسرع في الإجابة)
  7. `lack_of_practice` (نقص في التدريب والتطبيق)
  8. `time_management` (سوء إدارة الوقت)
  9. `attention_error` (سهو أو عدم تركيز)
  10. `unknown` (خطأ غير محدد)
- **Recurrence Detection:** If the same skill accumulates 2+ errors of the same category, it is automatically elevated to a `recurring_error` triggering root-cause remediation.

---

### 2.14 Spaced Retrieval & Retention Engine
- **Source File:** `src/domain/learning/spaced-review.ts`
- **Mathematical Formula:** Modulates interval growth factor by:
  - Confidence rating ($1-2 \rightarrow 1.2\times$, $3 \rightarrow 1.5\times$, $4-5 \rightarrow 2.2\times$).
  - Retrieval fluency (penalizes responses taking $>2\times$ expected time).
  - Historical lapses (penalizes chronic stumbling).
- **Urgency Classification:**
  - `fresh` : In retention window.
  - `due` : Reached due date today.
  - `overdue` : 1 to 3 days past due date.
  - `critical` : $>3$ days past due date (high risk of memory trace loss).
- **Roadmap Priority:** Evaluated at **Priority 2** directly ahead of new curriculum topics.

---

### 2.15 Exam Engine & BAC Simulation
- **Source Files:** `src/components/exam/DDaySimulator.tsx`, `src/domain/content/mini-exams.ts`
- **Capabilities:**
  - Real-time countdown timer to official BAC date (June 2026).
  - Timed topic-level mini-exams (20-40 minutes) with strict exam conditions.
  - Exam transfer items designed to simulate authentic BAC problem formulations.

---

### 2.16 Authentication, Identity & Trial Gate
- **Source Files:** `src/lib/auth/context.tsx`, `src/middleware.ts`, `src/lib/access/index.ts`
- **Features:**
  - 72-Hour Free Trial with server-synchronized clock (`/api/server-time`) to prevent client clock tampering.
  - Stream lock preventing cross-stream cheating during trial.
  - Offline-resilient guest mode with seamless account registration upgrade.

---

### 2.17 Commercial Hardening & Payments
- **Source Files:** `src/lib/payment/manual-pilot-provider.ts`, `src/lib/operations/payments.ts`
- **Payment Rails:**
  - Manual Algerian domestic payment receipts: CCP (Algérie Poste) and BaridiMob.
  - Receipt upload with file verification and cryptographic hash tracking.
  - Backoffice approval/rejection workflow in `/ops/finance`.
  - Transaction state machine: `draft` -> `submitted` -> `approved` / `rejected` -> `active`.

---

### 2.18 Storage & Offline Resilience
- **Source File:** `src/lib/mission/storage.ts`
- **Storage Keys:**
  - `bac_mastery_missions`
  - `bac_mastery_active_mission_id`
  - `bac_mastery_practice_sessions`
  - `bac_mastery_errors`
  - `bac_mastery_mastery`
  - `bac_mastery_spaced_schedules`
- **Data Hygiene:** Includes `clearAllMissionData()` for isolated development and reset testing.

---

### 2.19 Testing & Verification Infrastructure
- **Verification Suites in `scripts/`:** Exactly **66 executable verification scripts**.
- **Automated Invariant Tests:**
  - `scripts/verify-sprint01.ts` : Validates contracts, canonical registry, spaced review priority 2, and diagnostic safety (All 7 test suites passing).
  - `scripts/test-roadmap.mjs` : 23 test suites validating deterministic roadmap behavior.
  - `scripts/verify-stream-isolation.ts` : Ensures strict boundary isolation between streams.
  - `scripts/verify-ops-auth.ts` : Validates operational role-based access control.
  - `scripts/verify-edge-guard.ts` : Tests anti-tampering server clocks.
- **Build Quality:** `npm run typecheck` (`tsc --noEmit`) exits with code **0**; clean production Next.js build.

---

## 3. FEATURE INVENTORY TABLE

| Feature / Subsystem | Current State | Keep | Modify | Split | Rebuild | Delete | New | Strategic Assessment |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **Layer 1: Domain Contracts** | Created in Sprint 01 | **KEEP** | | | | | | `src/domain/contracts/` established. Zero React coupling. Pure types. |
| **Canonical 31 Skills Registry** | Unified in `canonical-sciences.ts` | **KEEP** | | | | | | Single source of truth for Sciences Exp. 10 Math, 11 Phys, 10 SNV. |
| **Curriculum Skills Catalog** | Legacy 1001-line duplicate | | | | | **DELETE** | | Deleted in Sprint 01; replaced with a 10-line backward-compat facade. |
| **Duplicate Route /errors** | Duplicate of `/error-lab` | | | | | **DELETE** | | Deleted in Sprint 01; permanent redirect added in `next.config.mjs`. |
| **Adaptive Roadmap Engine** | 8-tier hierarchy in `engine.ts` | | **MODIFY** | | | | | Keep deterministic logic; enhance stability window against rapid flipping. |
| **Spaced Review Integration** | Wired as Priority 2 | **KEEP** | | | | | | Evaluates urgency and prevents memory trace loss before new concepts. |
| **Diagnostic Route Safety** | Guarded for unauthored streams | **KEEP** | | | | | | Graceful informational card prevents `TypeError: undefined` crashes. |
| **Diagnostic L0-L5 Probing** | Currently flat 15-item pack | | | **SPLIT** | | | | Split into broad screening (L1) and deep bottleneck probe (L3). |
| **Question Models** | 4-option MCQ dominant | | **MODIFY** | | | | | Add step-by-step, document analysis, and rubrics for BAC realism. |
| **Learner Model State** | Stored across multiple tables | | | **SPLIT** | | | | Unify into single derived state contract (`LearnerState`). |
| **Error Lab** | 10 taxonomy types + Twin Retests | **KEEP** | | | | | | Functional and effective; preserve exact error taxonomy. |
| **Backoffice Cockpit (`/ops`)** | Full operational suite (12 pages) | **KEEP** | | | | | | Essential for pilot management, payment approvals, and student support. |
| **72h Trial & Server Clock** | Tamper-resistant edge guard | **KEEP** | | | | | | Prevents client clock spoofing; critical for commercial viability. |
| **CCP / BaridiMob Payments** | Manual receipt upload flow | **KEEP** | | | | | | Tailored specifically to the Algerian banking/payment reality. |
| **AI Tutoring Bridge** | Socratic constraints designed | | **MODIFY** | | | | | Wire strictly as an assistant without mastery decision authority. |
| **Exam Simulation (D-Day)** | Countdown + Mini-exams | **KEEP** | | | | | | Realistic BAC countdown and timed mini-exam infrastructure. |

---

## 4. ARCHITECTURE BOUNDARIES & SOURCE OF TRUTH FREEZE

To prevent architectural regression, the following strict boundaries are frozen:

1. **The UI is NOT the Brain:**
   - React components (`src/app/`, `src/components/`) MUST NEVER compute mastery status, calculate review intervals, or decide next best learning actions.
   - UI components ONLY render decisions produced by domain engines and dispatch raw attempt events.
2. **Pedagogical Content Source of Truth:**
   - Canonical definitions of curriculum, skills, topics, methodology rubrics, and diagnostic packs reside in **Git Version Control** (`src/data/`, `src/domain/`).
   - Content is immutable at runtime.
3. **Learner State Source of Truth:**
   - PostgreSQL / Supabase is the authoritative cloud source of truth for student records (`student_profiles`, `practice_attempts`, `skill_mastery`, `errors`, `retention_schedules`).
   - Browser localStorage serves strictly as a temporary cache and offline buffer; it is synchronized upon reconnection and never overrides validated cloud records.
4. **AI Boundary (Zero Autonomous Authority):**
   - AI models (LLMs) have ZERO authority to grant mastery, skip prerequisites, alter roadmaps, or override deterministic scores.
   - AI operates strictly as an instructional assistant (Socratic probing, hint generation, alternative explanations).

---

## 5. REMAINING RISKS & PREREQUISITES FOR TASK 0.2

1. **Assessment Monoculture Risk:** The practice bank is currently 90%+ multiple-choice questions. Real Algerian BAC exams require structured scientific justification, mathematical proofs, and document interpretation. (Addressed in Phase 4 / Phase 11).
2. **Learner State Fragmentation:** Mastery evidence, error records, and retention schedules are currently stored in three separate repositories. They must be coordinated through the unified `LearnerState` contract. (Addressed in Phase 5 / Phase 6).
3. **Diagnostic Packaging for Non-Pilot Streams:** While the system safely handles non-STEM streams without crashing, actual diagnostic packs for *Lettres & Philosophie* and *Langues Étrangères* remain to be authored. (Addressed in Phase 20 / Phase 27).

---

## 6. AUDIT CONCLUSION & NEXT STEP

TASK 0.1 is complete. The repository has been audited with zero unauthorized code changes. All 19 dimensions have been inventoried, verified, and mapped.

**Next Immediate Task:**
`TASK 0.2 — Feature Inventory` (Formalize the definitive Keep / Modify / Split / Rebuild / Delete / New transition matrix).
