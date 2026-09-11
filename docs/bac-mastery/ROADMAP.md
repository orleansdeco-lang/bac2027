# BAC MASTERY — PRODUCT & TECHNICAL ROADMAP

This roadmap outlines the disciplined, staged development of BAC Mastery from foundation to full exam readiness.

---

## Phase 1 — Foundation Setup (Current Phase)
* **Goal**: Establish the core product constitution, technical architecture, stream-agnostic type definitions, lightweight i18n system, design tokens, and clean Next.js + Tailwind scaffold.
* **Deliverables**:
  - Full documentation suite in `/docs/bac-mastery/`.
  - Pure domain type definitions in `src/types/`.
  - Bilingual localization engine (`ar` / `fr` with direction management) in `src/lib/i18n/`.
  - Reusable UI primitives in `src/components/ui/`.
  - Supabase client integration scaffold in `src/lib/supabase/`.
  - Foundational preview page embodying *"ماشي واش تقرا. كيفاش توصل."*.
* **Status**: In Progress / Completing.

---

## Phase 2 — Strategic Onboarding & Goal Engine
* **Goal**: Enable the student to configure their strategic academic vector.
* **Deliverables**:
  - Stream selector (Sciences Expérimentales, Math, Technique Math, Gestion, Lettres & Philo, Langues).
  - Target score calculator with stream coefficient weighting.
  - Weekly study time budgeter (hours/week).
  - Desired higher education destination picker (Medicine, ESI, ENS, Polytech, etc.).
  - Student profile state persistence.
* **Prerequisites**: Phase 1 foundation complete.

---

## Phase 3 — Diagnostic Engine & Gap Analysis
* **Goal**: Evaluate current student competence and isolate the primary academic bottleneck.
* **Deliverables**:
  - Multi-dimensional diagnostic test interface (Knowledge, Understanding, Application, Methodology, Speed).
  - Automated current level estimation.
  - Mathematical gap calculation: $(\text{Target} - \text{Current}) \times \text{Coefficient}$.
  - Primary bottleneck highlight.
* **Prerequisites**: Phase 2 completed.

---

## Phase 4 — Dynamic Roadmap & Daily Missions
* **Goal**: Deliver a sequence of bite-sized, executable tasks so the student never asks: *"What should I do today?"*.
* **Deliverables**:
  - Multi-phase roadmap generator (Foundation → Understanding → Methodology → Practice → Error Repair → Simulation).
  - Daily mission card system (2–4 tasks/day, 10–45 min each).
  - Study Method step-by-step guidance (Understand → Close → Recall → Apply → Test).
  - Session timer and mission completion tracking.
* **Prerequisites**: Phase 3 completed.

---

## Phase 5 — Error Lab & Remediation Engine
* **Goal**: Treat mistakes as empirical data to drive rapid mastery.
* **Deliverables**:
  - 10-type error classification interface for failed questions.
  - Error frequency aggregation by topic and category.
  - Automated trigger for **Repair Missions** upon recurring methodology/concept errors.
  - Re-testing protocol to verify error neutralization.
* **Prerequisites**: Phase 4 completed.

---

## Phase 6 — Mind Engine, Rest & Recovery Mode
* **Goal**: Protect student psychological stamina and eliminate backlog paralysis.
* **Deliverables**:
  - 1-click daily energy check-in (Good, Normal, Tired, Stressed).
  - Workload auto-scaling based on energy state.
  - Rest schedule enforcement and sleep hygiene nudges.
  - **Recovery Mode** algorithm to redistribute missed missions without guilt or backlog panic.
* **Prerequisites**: Phase 5 completed.

---

## Phase 7 — External AI Bridge
* **Goal**: Empower students with personalized AI guidance without SaaS API costs.
* **Deliverables**:
  - Automated compilation of the **Student Intelligence Report**.
  - One-click copy formatted for ChatGPT, Claude, and Gemini.
  - Guidance on interpreting AI feedback and executing the resulting action items inside BAC Mastery.
* **Prerequisites**: Phase 6 completed.

---

## Phase 8 — Exam Mode
* **Goal**: Final 60-day operational shift into exam mastery and trial simulation.
* **Deliverables**:
  - Full timed BAC exam simulations (3.5 to 4 hours).
  - Subject choice strategy modules (الموضوع الأول vs الموضوع الثاني).
  - Time allocation pacing alerts.
  - Final confidence and sleep tapering protocols.
* **Prerequisites**: Phase 7 completed.

---

## Phase 9 — BEM Extension
* **Goal**: Expand the proven architecture to Algerian Middle School (BEM) students.
* **Deliverables**:
  - BEM stream configuration and 4AM subjects.
  - Middle school cognitive assessment adaptations.
  - BEM-specific study protocols.
