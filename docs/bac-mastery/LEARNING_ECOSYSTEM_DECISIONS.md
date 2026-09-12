# BAC Mastery V1 — Learning Ecosystem Architecture Decisions (ADR)
**Prompt 20.1 Architectural Decision Records**
*Status: Approved & Implemented*

---

## ADR 01: Pure Domain Architecture (Zero Database Migrations)

### Context
Prompt 20.1 introduces three ecosystem layers: visuals, external resources, and human help escalation. A conventional approach might create database tables (`visual_assets`, `external_resources`, `teachers`, `tutoring_sessions`, `learning_briefs`) in Supabase.

### Decision
Implement all models, taxonomies, registries, and escalation logic as **pure TypeScript domain modules** in `src/domain/learning-ecosystem/` with **zero** Supabase database migrations.

### Rationale
1. Preserves the stability and security of the existing database schema (currently at 3 migrations).
2. Avoids premature schema locks before real-student pilot validation.
3. Facilitates instant, zero-latency unit and property testing without network roundtrips.

---

## ADR 02: Deterministic Evidence-Based Escalation over AI/LLM Prompts

### Context
Modern platforms often delegate recommendation and escalation to external LLM APIs (e.g. OpenAI/Gemini chat completions).

### Decision
All escalation decisions (`getLearningEscalation`), resource recommendations (`recommendExternalResource`), and intent mappings (`mapStudentHelpRequest`) are **100% deterministic functions** based on objective telemetry.

### Rationale
1. **Explainability**: Recommendations must explain exactly why they occurred using clear reason codes (`REPEATED_RETEST_FAILURE`, `METHODOLOGY_BLOCK`).
2. **Reliability & Invariance**: A single error must never probabilistically trigger teacher escalation.
3. **Zero External API Cost / Latency**: Escalation executes in $< 1\text{ms}$ with zero downtime risk.

---

## ADR 03: Mandatory Return-Action Contract for External Resources

### Context
External links frequently become navigational dead-ends, diverting students away from active learning into passive media consumption.

### Decision
Every external resource and recommendation contract must declare an explicit `suggestedReturnAction` (`isomorphic_retest`, `active_recall`, `checkpoint_quiz`, etc.).

### Rationale
Maintains the primacy of the BAC Mastery learning loop. An external resource is an informational detour; the student must return to verify understanding through active retrieval or problem solving.

---

## ADR 04: Non-Decorative Visual Learning Policy

### Context
Educational software often includes generic illustrations that distract students and inflate download payloads without aiding comprehension.

### Decision
Visual assets must be classified under an explicit `educationalPurpose` (one of 10 pedagogical functions) and satisfy subject-specific epistemic rules. Decorative images are strictly prohibited.

### Rationale
Adheres to Mayer's Multimedia Learning Principles and ensures visual content directly targets known curriculum bottlenecks (asymptotes, circuit polarity, ribosomal translation, geopolitical alliances).

---

## ADR 05: Pedagogical Student Learning Brief over Generic Tutoring Marketplace

### Context
Online tutoring marketplaces typically connect students with tutors without context, wasting lesson time diagnosing basic student difficulties.

### Decision
Establish the rails for future human help through the **Student Learning Brief**, generating an automated pedagogical diagnostic report containing error frequency, attempt history, and recommended intervention.

### Rationale
Transforms future human tutoring from unstructured Q&A into high-efficiency, targeted intervention while intentionally deferring marketplace UI, booking, and payment complexities.

---

## ADR 06: Decoupled Educational Language & Independent Text Direction

### Context
BAC Mastery supports both Arabic and French UI locales, while BAC subjects have distinct linguistic requirements (Arabic for STEM/Humanities, target languages for foreign languages).

### Decision
Visual asset language and text direction are independent of the UI locale. Mathematical coordinate plots retain LTR orientation, while Arabic annotations and contextual diagrams retain RTL orientation.

### Rationale
Preserves mathematical and scientific notation conventions used in Algerian national examinations.

---

## ADR 07: Strict Zero-PII Invariant on Diagnostic Briefs

### Context
Future educators require diagnostic information, but sharing student personal data introduces privacy and compliance risks.

### Decision
The `StudentLearningBrief` model contains only academic metrics, skill identifiers, error classifications, and pedagogical advice. All student PII (names, emails, phones, passwords, tokens) is strictly excluded.

### Rationale
Ensures student privacy by design and eliminates risk when briefs are shared with educators.
