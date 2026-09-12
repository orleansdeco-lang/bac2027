# BAC Mastery V1 — Learning Ecosystem Architecture
**Prompt 20.1 Technical Architecture Document**
*Version: 1.0.0 — Ecosystem Integration Layer*
*Status: Architecture Verified & Implemented (Domain)*

---

## 1. Executive Summary & Architectural Vision

BAC Mastery is engineered as an Algerian **Learning Operating System (Learning OS)**. It is **not** a content repository, **not** an open web link directory, and **not** an open-ended tutoring marketplace.

Prior to Prompt 20.1, the system was defined by:
$$\text{Learning OS} = \text{Canonical Curriculum} + \text{Core Pedagogical Engines}$$

With Prompt 20.1, the system matures into:
$$\text{Curated Learning Ecosystem} = \text{Learning OS} + \text{Visual Learning Layer} + \text{External Resource Layer} + \text{Human Help Escalation Layer}$$

```
                            BAC MASTERY V1
                                  │
    ┌─────────────────────────────┼─────────────────────────────┐
    │                             │                             │
┌───▼────────────────┐   ┌────────▼───────────┐        ┌────────▼───────────┐
│   LEARNING OS      │   │   VISUAL LAYER     │        │  EXTERNAL RESOURCE │
│  (Authoritative)   │   │   (Pedagogical)    │        │      LAYER         │
├────────────────────┤   ├────────────────────┤        ├────────────────────┤
│ • Diagnostic       │   │ • Mathematical Plot│        │ • Official Docs    │
│ • Gap Analysis     │   │ • Physics Circuit  │        │ • Curated Video    │
│ • Mission Engine   │   │ • Bio Schemas      │        │ • Interactive Sim  │
│ • Practice Loop    │   │ • History Maps     │        │ • Explainable Rcmd │
│ • Error Intel      │   │ • Technical Drawing│        │ • Return Action    │
│ • Repair Protocol  │   │ • Accessibility    │        │   (Mandatory)      │
│ • Retest Twin      │   │ • Non-decorative   │        │ • Zero Scraping    │
│ • Mastery Tracker  │   └────────┬───────────┘        └────────┬───────────┘
│ • Spaced Review    │            │                             │
│ • Adaptive Roadmap │            │                             │
└───▲────────────────┘            │                             │
    │                             ▼                             ▼
    │               ┌───────────────────────────────┐           │
    │               │ HUMAN HELP / TEACHER ESCALATE │           │
    │               ├───────────────────────────────┤           │
    │               │ • Teacher Skill Profiles      │           │
    │               │ • Student Intent Mapping      │           │
    │               │ • Deterministic Escalation    │           │
    │               │ • Student Learning Brief      │           │
    │               │ • Zero PII / Privacy Safe     │           │
    │               │ • Future Rails (No Market UI) │           │
    │               └─────────────┬─────────────────┘           │
    │                             │                             │
    └─────────────────────────────┴─────────────────────────────┘
                                  │
                 MANDATORY RETURN TO LEARNING LOOP:
           RETRIEVAL ──► PRACTICE ──► RETEST ──► MASTERY
```

---

## 2. The Core Learning Loop Invariant

Under no circumstances does an external video, article, diagram, or human teacher replace the authoritative BAC Mastery learning loop:

1. **Goal / Stream Target**
2. **Diagnostic Assessment**
3. **Identified Gap / Priority**
4. **Lesson & Conceptual Understanding**
5. **Worked Example**
6. **Active Recall Check**
7. **Guided & Independent Practice**
8. **Instant Criterion Feedback**
9. **Error Intelligence & Root Cause Attribution**
10. **Targeted Cognitive Repair Guide**
11. **Independent Retest Twin**
12. **Mastery Evidence (Demonstrated)**
13. **Adaptive Spaced Review & Interleaving**
14. **BAC Exam Transfer**

Every external resource or teacher intervention is a **pedagogical detour with a predetermined return ticket**:
$$\text{Detour} \xrightarrow{\text{Consultation}} \text{Mandatory Return Action} \xrightarrow{\text{BAC Mastery}} \text{Retest Twin / Active Recall}$$

---

## 3. The Multi-Tier Escalation Ladder

Escalation in BAC Mastery is **evidence-based, proportional, and 100% deterministic**.

| Tier | Escalation Level | Trigger Condition | System Action | Return Mandate |
| :--- | :--- | :--- | :--- | :--- |
| **1** | `SELF_LEARN` | 0 errors or nominal progress | Standard mission progression | Guided practice |
| **2** | `EXTRA_EXPLANATION` | 1 initial wrong answer; or `explain_simpler` requested | Textual micro-clarification & worked example | Next practice item |
| **3** | `VISUAL_SUPPORT` | 2 consecutive errors; or high confidence wrong; or `need_visual` | Schematic / diagrammatic model representation | Self-check question |
| **4** | `EXTERNAL_RESOURCE` | Retest failed after repair; or recurring error | Curated external reference with explainable rationale | Isomorphic retest or checkpoint |
| **5** | `TEACHER_HELP` | $\ge 2$ retest failures; or repair loop exhausted | Synthesizes Student Learning Brief for qualified teacher | Formal retest twin |
| **6** | `LIVE_TUTORING` | $\ge 3$ retest failures + multiple repair cycles + $\ge 30$ min stuck | Live pedagogical intervention recommendation | Comprehensive retest |

### Invariant: Single Error Rule
$$\text{Single Error} \nrightarrow \text{Teacher Help}$$
$$\text{Single Error} \nrightarrow \text{External Resource}$$
A student who slips on a single algebra step or reading mistake receives immediate formative feedback within BAC Mastery. Human escalation is strictly reserved for persistent conceptual or methodological deadlocks.

---

## 4. Privacy & Data Boundaries

The ecosystem enforces absolute privacy boundaries:
1. **Zero Personally Identifiable Information (PII) to Third Parties**:
   - External resource URLs are outbound links opened client-side. No user ID, email, token, or session state is ever appended to external links.
2. **Student Learning Brief Privacy**:
   - The brief generated for human educators contains **only** pedagogical diagnostics: skill ID, error frequency, attempt counts, confidence mismatch, and suggested session objectives.
   - It contains **zero** student names, emails, passwords, phone numbers, payment details, or authentication tokens.
3. **Untrusted URL Handling**:
   - External links are strictly sanitized to allow only `https:` and `http:` schemes, preventing any executable URIs (`javascript:`, `data:`).

---

## 5. Architectural Boundaries & Non-Goals

1. **Zero Database Migrations**:
   - All models, taxonomies, and escalation rules exist as pure TypeScript types, domain registries, and pure deterministic functions.
   - Supabase schema remains in its verified 3-migration baseline.
2. **Zero AI / LLM Dependencies**:
   - All recommendations, reason codes, and briefs are generated deterministically from student attempt metrics.
3. **Zero Marketplace Implementation**:
   - No booking calendars, no teacher profile browsing UI, no ratings, no messaging systems, and no commission/payment code.
4. **Canonical Sciences Expérimentales Preservation**:
   - All 31 canonical reference skills remain published and untouched.
