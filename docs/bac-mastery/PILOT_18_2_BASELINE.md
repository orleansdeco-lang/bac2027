# BAC Mastery — Prompt 18.2 Baseline Audit
**Controlled Real-Student Validation (5 to 10 Students)**

---

## 1. Baseline Metadata & Git Identification
- **Current Git Commit**: `34307af859f516535fdd6e3071270a9015c5fdc6`
- **Branch**: `main`
- **Node.js Runtime**: `v24.19.0`
- **Next.js Framework**: `14.2.35` (App Router, React 18)
- **Database / Auth Backend**: Supabase Cloud (`https://erbvmpnxufgeinqnshzu.supabase.co`)
- **Inspection Date**: September 12, 2026
- **Lead Role**: Product Engineer & Educational Validation Architect

---

## 2. Inventory of Active Application Routes (18 Routes)

| Route Path | Type | Role & Gating Status |
| :--- | :---: | :--- |
| `/` | Static (SSG) | Landing page with value proposition, curriculum preview, and direct CTA to `/auth` / `/onboarding`. |
| `/_not-found` | Static (SSG) | Arabic RTL 404 recovery page with route reset and home return. |
| `/account` | Static (SSG) | Profile summary, subscription status, manual cloud sync, and **Anonymized Pilot Data Export (`exportAnonymizedPilotData`)**. |
| `/api/server-time` | Dynamic (SSR) | Server-authoritative UTC clock providing drift-resistant timestamps for the 48-hour free trial. |
| `/auth` | Static (SSG) | Unified authentication portal (Email/Password registration and login with real-time confirmation checks). |
| `/auth/login` | Static (SSG) | Dedicated login redirect route. |
| `/auth/register` | Static (SSG) | Dedicated sign-up redirect route. |
| `/dashboard` | Static (SSG) | Main student cockpit: dynamic 48h trial banner, Single Next Best Action (*"واش ندير دروك؟"*), today's focus, streak, and subject breakdown. |
| `/diagnostic` | Static (SSG) | Stream-calibrated multi-subject diagnostic assessment (Math, Physics, SNV) detecting weak domains and bottlenecks. |
| `/diagnostic/results` | Static (SSG) | Diagnostic results presentation: signals, provisional gap percentages, and first recommended mission. |
| `/error-lab` | Static (SSG) | Error diagnosis hub classifying mistakes into the 10-class educational taxonomy and queuing micro-repairs. |
| `/errors` | Static (SSG) | Legacy alias route routing to Error Lab. |
| `/mission/[missionId]` | Dynamic (SSR) | Complete 13-element mission loop: Lesson $\to$ Worked Example $\to$ Active Recall $\to$ Practice $\to$ Error Lab $\to$ Micro-Repair $\to$ Isomorphic Retest Twin $\to$ Mastery. Includes trial expiry gate. |
| `/onboarding` | Static (SSG) | Strategic Profile onboarding: stream selection, target score, weekly study hours, baseline energy. |
| `/progress` | Static (SSG) | Curriculum mastery tracker displaying demonstrated competencies, review queue, and decay status. |
| `/reset-demo` | Static (SSG) | Developer/pilot reset utility for purging local student state during QA setup. |
| `/roadmap` | Static (SSG) | Comprehensive learning path with explicit mission rationales (*"علاش هذي المهمة؟"*), status tags, and dependency ordering. |
| `/subscribe` | Static (SSG) | Conversion gate presenting personalized evidence (target score, completed missions, demonstrated skills) and the 3,900 DZD Season Pass pilot offer. |

---

## 3. Active Learning Engines Status

1. **Universal 18-Stage Learning Cycle**:
   - Implemented in pure TypeScript domain under `src/domain/learning/`.
   - Formally defines the progression: Diagnostic $\to$ Orientation $\to$ Retrieval $\to$ Method Selection $\to$ Scaffolded Practice $\to$ Independent Practice $\to$ Error Diagnosis $\to$ Targeted Repair $\to$ Isomorphic Retest $\to$ Interleaved Practice $\to$ Spaced Review $\to$ Speed Drill $\to$ Mock Exam $\to$ Score Calibration $\to$ Review Queue Insertion $\to$ Strategic Reflection $\to$ Energy Adaptation $\to$ Stable Mastery.

2. **Epistemic Separation of Evidence**:
   - Strict separation between exposure (`SIGNAL`) and true capability (`DEMONSTRATED_MASTERY`).
   - Retrieval practice (`PRACTICE_EVIDENCE`) separated from recognition.
   - Retests (`RETEST_EVIDENCE`) strictly require independent problem solving on isomorphic twins.

3. **Adaptive Spaced Review Engine**:
   - Implemented in `src/domain/learning/spaced-review.ts`.
   - Pure deterministic algorithm adjusting intervals based on accuracy, confidence rating (1–5), speed ratio, and lapse history.
   - Urgency categories: `fresh`, `due`, `overdue`, `critical`.
   - *Status*: Calibrated via cognitive science benchmarks (SuperMemo SM-2/FSRS heuristics); awaiting empirical student validation in pilot.

4. **Roadmap Recommendation Engine**:
   - Single authoritative engine in `src/lib/roadmap/engine.ts`.
   - Deterministic hierarchy: Urgent Review > Active Error Repair > Priority Retest > Weakest Domain Progression.
   - Answers *"واش ندير دروك؟"* with exactly one next best mission and an evidence-based rationale code.

5. **Error Intelligence & Micro-Repair Loop**:
   - 10-type diagnostic taxonomy (`conceptual_gap`, `misread_question`, `computational_slip`, `unit_conversion_error`, etc.).
   - Recurring error detection ($\ge 2$ occurrences) escalates repair priority.
   - Micro-repair guides (5–15 min) with actionable remediation steps followed by isomorphic retest twins (max 2 repair cycles before cooldown).

6. **Subject Methodology Profiles**:
   - Configured across all 9 subject families and 17 individual subjects in `src/domain/learning/subject-methodology.ts`.
   - Dedicated profiles for Mathematics, Physics-Chemistry, Natural Sciences SNV, History-Geography, Philosophy, Islamic Studies, Languages, Economics/Management, and 4 distinct Technique Math specialties (Civil, Mechanical, Electrical, Process).
   - Educational content language/direction strictly decoupled from platform UI language.

---

## 4. Authentication, Persistence & Security Baseline

1. **Authentication**:
   - Supabase Auth (Email + Password) with synchronous length ($\ge 6$) and confirmation matching.
   - Idempotent guest-to-cloud profile migration (`handleAuthSessionMigration`) preserving local onboarding and diagnostic history.

2. **48-Hour Free Trial Rules**:
   - Server-authoritative clock (`/api/server-time`) compensated for client latency.
   - States: `TRIAL_ACTIVE`, `TRIAL_EXPIRED`, `PAID_ACTIVE`.
   - Expired trial gate shields practice and retest interactions while keeping reading materials and student progress transparently visible.
   - Postgres trigger `trg_protect_student_trial` prevents client-side elevation to `PAID`.

3. **Remote Security Audit & Supabase Hardening**:
   - Row Level Security (RLS) enabled across `student_profiles`, `missions`, and `skill_mastery`.
   - Cross-user read and write isolation verified: 0 row leaks, cross-user tampering blocked.
   - **SECURITY FINDING (Leaked Password Protection)**:
     - Supabase Auth Leaked Password Protection is currently **DISABLED** on remote project `erbvmpnxufgeinqnshzu`.
     - **Status**: `SECURITY_HARDENING_REQUIRED`.
     - *Directive*: Pilot may proceed ONLY in controlled conditions with trusted participants. Production launch requires enabling HaveIBeenPwned API check in Supabase Auth settings.

---

## 5. Telemetry & Feedback Mechanisms

1. **Telemetry**:
   - Minimal device-local telemetry in `src/lib/analytics/index.ts`.
   - Buffered in `localStorage` (`bac_mastery_pilot_events`), capped at 500 events.
   - Sanitization engine removes tokens, passwords, secrets, JWTs, and email addresses.
   - **Export Capability**: Added `exportAnonymizedPilotData()` in `src/lib/analytics/index.ts` and UI export button in `/account` (`v1.0.0`), producing zero-PII JSON with pseudonymous user IDs (`anon_xxxx`).
   - *Limitation*: Telemetry is device-local and not centrally aggregated in a remote database.

2. **Qualitative Feedback**:
   - Lightweight one-tap post-mission feedback in `src/lib/feedback/index.ts` and `/mission/[id]`.
   - Ratings: Easy (`easy`), Normal (`normal`), Hard (`hard`), Unclear (`unclear`).
   - Optional qualitative text note (*"واش اللي ما عجبكش؟"*).
   - Stored locally in `localStorage` (`bac_mastery_pilot_feedback`) and bundled into telemetry export.

---

## 6. Sciences Expérimentales Curriculum Coverage
- **Total Canonical Skills**: Exactly **31 skills** fully authored and pedagogical bundles registered in `src/data/curriculum/skills.ts`.
  - **Mathematics**: 10 skills (Derivatives & chain rule, intermediate value theorem, asymptotes & limits, tangent & convexity, exponential equations, logarithm domain & limits, induction reasoning, sequence reasoning, auxiliary arithmetic/geometric sequences, conditional probability tree).
  - **Physique-Chimie**: 11 skills (Reaction rate monitoring, redox titration, RC time constant, RC differential equations, RL circuit response, radioactive decay law, mass defect & binding energy, Newton's 2nd law, satellite Kepler orbits, acid-base pH/Ka, esterification equilibrium).
  - **Sciences Naturelles (SNV)**: 10 skills (Protein synthesis transcription, translation & genetic code, protein structure & ionization, enzyme kinetics & active site, humoral immunity antibodies, cellular immunity LTC, HIV immune deficiency, synaptic transmission, action potential ionic basis, scientific analysis methodology).
- **Bundle Completeness**: 100% of the 31 skills include Lesson, Step-by-Step Worked Example, Active Recall Quick Check, 2 Practice Questions, Error Lab Diagnosis Linkage, 5–15m Targeted Micro-Repair Guide, and Isomorphic Retest Twin.

---

## 7. What Can Actually Be Measured Today vs What Cannot

### A. Measurable Today (Technical Readiness & QA Verification)
- [x] End-to-end user navigation from landing to mastery.
- [x] Correctness of mathematical calculations, SI units, and chemical balance.
- [x] Deterministic execution of roadmap priorities and bottleneck selection.
- [x] Error identification, repair guide display, and retest twin independence.
- [x] Server-time synchronization and trial expiration gate enforcement.
- [x] Cross-user isolation and RLS tamper resistance.
- [x] Local telemetry buffering and sanitization.
- [x] Anonymized JSON export generation.
- [x] Responsive layout on mobile (390×844) and desktop (1440×900).

### B. What CANNOT Yet Be Measured (Requires Real Human Students)
- [ ] Whether real students independently discover *"واش ندير دروك؟"* without hesitation.
- [ ] Actual student emotional and cognitive reaction to the diagnostic.
- [ ] Real comprehension and retention across next-day sessions (Day 1 $\to$ Day 2 return).
- [ ] Subjective perception of the 5–15m micro-repair length (too short, just right, or boring).
- [ ] Real willingness to pay 3,900 DZD for the Season Pass.
- [ ] Qualitative clarity of Arabic educational explanations in high-stress study sessions.
- [ ] Empirical calibration of spaced review decay parameter ($\lambda$).
