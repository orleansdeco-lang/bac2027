# BAC MASTERY V2 — ARCHITECTURE FREEZE SNAPSHOT (V1.1 RATIFIED)

**Document Version:** 2.1.0 (V1.1 Gate Approved)  
**Date of Ratification:** 2026-09-17  
**Authority:** Core Architecture Review Board  
**Workspace:** BAC BEM (Algerian BAC Learning Operating System)  
**Status:** `ARCHITECTURE_FREEZE_V1_1_READY`  
**Invariant:** Pure specification & formal contracts — zero code mutations.

---

## 1. Executive Summary

This document represents the definitive, revised architecture freeze for **BAC Mastery V2**, incorporating all six pedagogical and structural revisions mandated by the **TASK 0.3A Architecture Consistency Gate**.

The architecture reconciles the **BAC Mastery Product Constitution**, the **Central Learning Operating System Reference Architecture**, and empirical engineering realities into a single authoritative design.

---

## 2. The Authoritative Core Learning Loop

```
                  [ GOAL SETTING ]
                         │
                         ▼
             [ L0-L5 DIAGNOSTIC V2 ]
                         │
                         ▼
              [ LEARNING PROFILE & GAP ]
                         │
                         ▼
             [ DETERMINISTIC PRIORITY ]
                         │
                         ▼
               [ ADAPTIVE ROADMAP ]
                         │
                         ▼
               [ TARGETED MISSION ]
          (Micro / Short / Standard / Deep)
                         │
                         ▼
              [ DELIBERATE PRACTICE ]
                         │
                         ▼
             [ RAW STUDENT ATTEMPT ]
                         │
                         ▼
           [ MULTI-DIMENSIONAL EVIDENCE ]
                         │
                         ▼
        ┌────────────────┴────────────────┐
        ▼                                 ▼
 [ INCORRECT RESPONSE ]            [ CORRECT RESPONSE ]
        │                                 │
        ▼                                 ▼
 [ 10-TYPE ERROR EVENT ]           [ DEMONSTRATED MASTERY ]
        │                          (not_yet -> emerging ->
        ▼                           demonstrated -> review_due)
 [ TARGETED REPAIR DRILL ]                │
        │                                 ▼
        ▼                          [ 6-VECTOR RETENTION ]
 [ ISOMORPHIC RETEST TWIN ]        (Interval scheduling)
        │                                 │
        ▼                                 ▼
 (Max 2 Cycles Limit)              [ INTERLEAVING & TRANSFER ]
        │                                 │
        └────────────────┬────────────────┘
                         ▼
               [ NEXT BEST ACTION ]
```

---

## 3. Explicit Status: What is FROZEN vs. NOT YET FROZEN

To maintain academic rigor and prevent premature optimization, the architecture explicitly bifurcates into components that are **permanently frozen** and parameters that are **intentionally left open for empirical pilot calibration**:

### 3.1. FROZEN NOW (Authoritative Non-Negotiables)
1. **Canonical Domain Model:** 28 discrete domain entities and 10 core disambiguations (Skill ≠ Topic, Question ≠ Evidence, Attempt ≠ Evidence, Error ≠ Misconception, Skill ≠ Skill State, Priority ≠ Skill Property, Mission ≠ Lesson, Roadmap ≠ Priority, Retention ≠ Mastery).
2. **Authoritative Mastery States:**
   ```text
   not_yet
   emerging
   demonstrated
   review_due
   ```
   A numeric scalar MUST NOT define mastery. No single number replaces the multi-dimensional learner state.
3. **Canonical 10-Type Error Taxonomy:**
   `forgot_information`, `misunderstood_concept`, `methodology_error`, `calculation_error`, `misread_question`, `rushed`, `lack_of_practice`, `time_management`, `attention_error`, `unknown`. Legacy V1 codes mapped cleanly.
4. **4 Canonical Mission Duration Classes:**
   - `MICRO` (5–10 min): active recall, single repair drill, fast check.
   - `SHORT` (10–20 min): targeted practice, retest twin, daily review.
   - `STANDARD` (20–35 min): core 13-element lesson + guided + independent practice.
   - `DEEP` (35–60 min): multi-part synthesis, cross-unit interleaving, timed BAC paper section.
5. **6-Layer Diagnostic V2 Architecture:**
   L0 (Routing), L1 (Broad Screening), L2 (Skill Diagnosis), L3 (Bottleneck/Prerequisite Probe), L4 (Metacognitive & BAC Rubric Calibration), L5 (Transfer Probe).
6. **6 Retention Evidence Dimensions:**
   Consumes `correctness`, `confidence` ((1..5)), `response_speed_ratio` ((\tau)), `lapse_history` ((L)), `decay_factor` ((\delta)), and `days_elapsed`.
7. **Single Learner State Authority:**
   Exactly one authoritative store (Supabase Tier 2). Browser local storage is strictly a transient read-through cache and offline queue (Tier 3).
8. **Multi-Dimensional Evidence Invariant:**
   Multi-dimensional evidence must NEVER be collapsed into a single composite product (e.g. \(\text{score} \times \text{confidence} \times \dots\) is strictly prohibited).
9. **Strict 4-Tier Pipeline Separation:**
   `RAW ATTEMPT -> EVIDENCE -> DERIVED LEARNER STATE -> DECISION`. No layer may be skipped or conflated.
10. **Deterministic Decision Authority:**
    Hard safety constraints (prerequisite gaps, critical retention (\ge 4) days overdue, active unverified repairs) take absolute precedence over advancing new syllabus content.
11. **Weakest Skill ≠ Highest Priority:**
    A foundational prerequisite of a weak skill, or an urgent retention review of a mastered skill, always takes priority over the weakest skill itself.
12. **AI Zero State Authority:**
    Generative AI models are strictly read-only Socratic coaches. Zero write access to learner state; zero authority over mastery or official BAC grading.
13. **Offline Synchronization Resilience:**
    Append-only IndexedDB queue with client UUIDs, strict server idempotency (`ON CONFLICT DO NOTHING`), chronological ordering, and monotonic sequence numbers.

---

### 3.2. INTENTIONALLY NOT YET FROZEN (To Be Calibrated via Sciences Exp Pilot)
1. **Exact Internal Numerical Ability Weights:** The specific continuous mathematical representation (e.g., latent ability \(\theta \in [0..1]\)) used for secondary ranking.
2. **Exact Retention Interval Scheduling Function:** Classic SM-2 serves as an initial reference baseline. The definitive mathematical formula synthesizing all 6 evidence dimensions will be calibrated on Algerian student cohort data during Phase 3.
3. **Formal Psychometric Latent-Trait Models (IRT / BKT):** Deferred past initial core stabilization.
4. **Cross-Stream Electives Architecture:** Deferred; Algerian BAC candidates follow single, non-overlapping ministerial streams.
5. **Automated OCR / Handwriting Recognition:** Deferred; structured step selection and KaTeX notation are sufficient for digital problem solving.
6. **Future Generative AI Features:** Any AI capability beyond Socratic explanation and error breakdown remains strictly out of scope.

---

## 4. Subsystem Authority & Source of Truth Table

| Subsystem | Canonical Authoritative Owner | Source of Truth | Mutability Policy |
| :--- | :--- | :--- | :--- |
| **Curriculum, Skills & DAG** | Curriculum OS | Git Repository (Tier 1) | Immutable at runtime |
| **Questions & Rubrics** | Assessment OS | Git Repository (Tier 1) | Immutable at runtime |
| **Raw Student Attempts** | Assessment Layer | Supabase `attempts` (Tier 2) | Immutable append-only |
| **Evidence Events** | Evidence Engine | Supabase `evidence_events` (Tier 2) | Immutable append-only |
| **Learner State (Mastery/Errors)**| Learner Model | Supabase `learner_states` (Tier 2) | Derived from evidence |
| **Retention Schedules** | Retention Subsystem | Supabase `retention_schedules` (Tier 2) | Derived from review evidence |
| **Next Action / Priority** | Decision Engine | Pure In-Memory Function | Deterministic & explainable |
| **Macro Study Trajectory** | Roadmap Engine | Pure In-Memory Function | DAG & Target-driven |
| **Bounded Missions** | Mission Engine | Supabase `missions` (Tier 2) | State advances on attempts |
| **Client Cache & Offline Queue** | Client State Manager | IndexedDB / LocalStorage (Tier 3) | Transient mirror (Zero auth) |
| **UI Presentation State** | Experience Layer (React) | Component State (Tier 4) | Ephemeral presentation |
| **Socratic AI Tutoring** | AI Assistant | Ephemeral Prompt Context (Tier 5) | Zero state authority |

---

## 5. Architectural Non-Negotiables (24 Cardinal Principles)

1. **One canonical learner state.**
2. **One authoritative source for learner state (Supabase Tier 2).**
3. **Evidence before inference.**
4. **Attempt ≠ Evidence.**
5. **Evidence ≠ Mastery.**
6. **Error ≠ Misconception.**
7. **Skill ≠ Skill State.**
8. **Priority is contextual, not an intrinsic skill property.**
9. **Weakest Skill ≠ Highest Priority.**
10. **Roadmap is not Priority (Strategy vs. Tactics).**
11. **Mission is not Lesson (Active vs. Passive).**
12. **Content consumption is not mastery.**
13. **Correctness alone is not sufficient evidence for BAC methodology.**
14. **No single scalar replaces multi-dimensional mastery.**
15. **UI cannot directly mutate authoritative learner state.**
16. **AI cannot directly mutate authoritative learner state.**
17. **Local cache cannot silently override cloud truth.**
18. **Curriculum must be versioned and immutable in Git.**
19. **Questions must have explicit canonical skill tagging and rubrics.**
20. **Every learner-state change must be explainable from raw evidence.**
21. **Decision outputs must expose structured reason codes in Algerian Arabic.**
22. **Max 2 repair cycles before transitioning to `needs_more_work`.**
23. **Do not add AI where deterministic logic is sufficient.**
24. **Do not optimize UI before the learning loop is stable.**
