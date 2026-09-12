# BAC Mastery V1 — Content Production & Verification System
**Standard Operating Procedure for Vertical-Slice Educational Content Engineering**
**Document Version**: 1.0.0 (V1 Completion Baseline)  
**Academic Year**: 2026–2027  

---

## 1. The Vertical Slice Paradigm

### 1.1 Why Vertical Slices Beat Horizontal Breadth
Traditional EdTech platforms mass-produce shallow content: hundreds of textbook summaries or unguided multiple-choice questions without diagnostics, error analysis, or remediation. This creates an illusion of coverage while leaving students stranded when they encounter difficulty.

**BAC Mastery V1 enforces a strict Vertical Slice Policy**:
> A skill is NOT considered ready for production until its **entire closed learning loop** is authored, audited, and verified.

Building 5 completely closed, mastery-verifiable skills yields far superior educational outcomes than writing 50 isolated text summaries without practice, repair, or independent retests.

```
HORIZONTAL APPROACH (Flawed)             VERTICAL SLICE APPROACH (BAC Mastery)
┌──────────────────────────────┐        ┌──────────────────────────────┐
│ Lesson 1   Lesson 2  Lesson 3│        │ Skill 1: Full Closed Loop    │
│ (No practice, no repair,     │        │ ├─ Lesson & Worked Example   │
│  no twin retests)            │        │ ├─ Active Recall & Practice  │
└──────────────────────────────┘        │ ├─ Error Lab Repair Guide    │
                                        │ ├─ Isomorphic Retest Twin    │
                                        │ └─ BAC Synthesis Transfer    │
                                        └──────────────────────────────┘
```

---

## 2. The 12-Element Closed Learning Loop

Every production-ready skill in BAC Mastery must provide assets satisfying all 12 elements:

| # | Component | Educational Function | Verification Requirement |
|:---:|:---|:---|:---|
| **1** | **Skill Identity & Bloom Level** | Uniquely identify the competence and cognitive target | Mapped to official ministerial syllabus |
| **2** | **Diagnostic Question** | Detect baseline proficiency or misconception | High-discrimination distractor design |
| **3** | **Interactive Core Lesson** | Deliver active, modular conceptual instruction | 14-element structured lesson model |
| **4** | **Worked Example** | Model expert thought process and execution | Step-by-step reasoning with "why" annotations |
| **5** | **Active Recall Check** | Test retrieval without recognition cues | Immediate retention verification |
| **6** | **Guided Practice Problem** | Scaffold initial execution with hints and tips | Scaffolded problem-solving sequence |
| **7** | **Independent Practice Problem** | Validate unassisted student performance | Realistic BAC-level difficulty |
| **8** | **Diagnostic Error Taxonomy** | Categorize exact cognitive breakdown | Mapped to Error Lab taxonomy (calculation, concept, method, reading, notation) |
| **9** | **Error Lab Repair Guide** | Remediate the specific mental defect in 5–15 mins | Why it happens, self-diagnosis, 3+ actionable steps, micro-drill |
| **10** | **Isomorphic Retest Twin** | Independently verify repair success | Identical deep structure, distinct surface values |
| **11** | **Retest Passing Gate** | Server-authoritative state transition | 100% correct score required to award mastery |
| **12** | **BAC Exam Synthesis Transfer** | Bridge single skill to full Baccalauréat problem | Past BAC reference citation and multi-part transfer |

---

## 3. The 6 Content Quality Dimensions & Audit Rubric

Before any content moves to the verification stage, it is evaluated against a 6-dimensional rubric. The weighted average must exceed **95%**, with zero tolerance for factual or curricular inaccuracies:

### 1. Scientific & Mathematical Accuracy (Weight: 25% | Pass Threshold: 100%)
- All formulas, physical equations, chemical reactions, biological structures, and historical facts are 100% verified.
- Calculation steps contain zero algebraic or arithmetic slips.
- Numerical values conform to physical reality and standard constants.

### 2. Curricular Alignment (Weight: 20% | Pass Threshold: 100%)
- Aligns strictly with the official pedagogical progression published by the Ministry of National Education.
- Does not test outdated techniques or unprescribed curriculum elements.
- Uses official terminology and notations (e.g., $t_{1/2}$, $x_f$, $\text{TVI}$, $\mathbb{R}$, $\ln$).

### 3. Explanatory Clarity (Weight: 15% | Pass Threshold: 95%)
- Concise, student-friendly prose without unnecessary jargon or pedantry.
- Logical flow from intuition to mathematical rigor.
- Diagrams, mathematical expressions, and typography are clean and readable.

### 4. Pedagogical Soundness (Weight: 20% | Pass Threshold: 100%)
- Distractors represent real student cognitive errors, never arbitrary wrong numbers.
- Explanations address *why* an option is wrong, not just *what* the correct option is.
- Cognitive load is properly managed (no gratuitous complexity in training phases).

### 5. Academic Rigor & Barème Alignment (Weight: 10% | Pass Threshold: 95%)
- Solutions conform to the step-by-step scoring criteria (*barème ministériel*) used in official BAC grading centers.
- Required justifications (continuity, strict monotonicity, reference frame, system boundary) are explicitly emphasized.

### 6. Linguistic & Cultural Authenticity (Weight: 10% | Pass Threshold: 100%)
- Written in authentic, elegant Algerian educational Arabic or standard French/English for language disciplines.
- Zero machine-translation artifacts, awkward calques, or foreign terminology variants.

---

## 4. The 7-State Verification Lifecycle Machine

Content transitions through 7 deterministic states:

```
[DRAFT] 
   │ (Authoring completed: 12 elements drafted)
   ▼
[INTERNAL_REVIEW] 
   │ (Peer review by subject specialist)
   ▼
[FACT_CHECKED] 
   │ (Scientific truth and numerical verification)
   ▼
[PEDAGOGICALLY_REVIEWED] 
   │ (Audit of distractors, cognitive load, and repair guides)
   ▼
[VERIFIED] 
   │ (QA lead audit: 6 dimensions score >= 95%)
   ▼
[PUBLISHED] ──► (Active in student roadmap engine)
   │
   ▼
[ARCHIVED] (Superceded or deprecated by curriculum reform)
```

---

## 5. Deterministic Priority Engine

Content expansion across the 6 streams follows an algorithmic priority ranking rather than random topic picking:

$$\text{Priority Score} = 0.35 \times C + 0.25 \times V + 0.20 \times F + 0.10 \times S + 0.10 \times E$$

Where:
- **$C$ (Coefficient Impact, 35%)**: Baseline subject coefficient (e.g., 7 for Math in Math stream, 6 for SNV in Sciences Exp).
- **$V$ (Vertical Completeness Potential, 25%)**: Readiness to close all 12 loop elements immediately.
- **$F$ (Foundational Dependency, 20%)**: Downstream prerequisites depending on this skill (e.g., derivatives before curve sketching).
- **$S$ (Historical BAC Frequency, 10%)**: Frequency of occurrence in official Baccalauréat exams over the past 10 sessions.
- **$E$ (Student Error Density, 10%)**: Observed error rate in diagnostics and mock exams.

Skills scoring **$\ge 85$** are scheduled in immediate production sprints.
