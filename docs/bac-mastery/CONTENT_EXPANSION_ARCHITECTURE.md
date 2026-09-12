# BAC Mastery — Content Expansion Architecture
**Content Quality & Curriculum Infrastructure Document**
*Version: 1.0.0 — Production Quality Standards*
*Status: Verified & Implemented*

---

## 1. Architectural Philosophy: The Separation of Concerns

BAC Mastery strictly enforces four distinct conceptual layers:

$$\text{Content Existence} \neq \text{Content Quality}$$
$$\text{Content Quality} \neq \text{Official Verification}$$
$$\text{Official Verification} \neq \text{Student Mastery}$$
$$\text{Student Mastery} \neq \text{BAC Score Prediction}$$

1. **Content Existence**: Having questions or lessons in the database does not mean they are pedagogically sound.
2. **Content Quality**: Even a beautifully written lesson is not an "official ministerial decree".
3. **Official Verification**: A curriculum item verified against official decrees does not mean the student has learned it.
4. **Student Mastery**: A student who masters a skill on BAC Mastery must never be fed false commercial promises ("علامة مضمونة 20/20"). Real exam performance depends on comprehensive synthesis, stamina, and psychological readiness.

---

## 2. The Canonical 20-Stage Content Pipeline

Every educational competence follows a rigorous, unbroken pipeline from official decree to student mastery:

```
OFFICIAL CITATION
       │
       ▼
   CURRICULUM ──► SUBJECT ──► TOPIC ──► SKILL
                                          │
       ┌──────────────────────────────────┘
       ▼
LEARNING OBJECTIVE (Bloom Taxonomy)
       │
       ▼
PREREQUISITES MAPPING
       │
       ▼
INTERACTIVE LESSON (Conceptual Core)
       │
       ▼
WORKED EXAMPLE (Step-by-Step Modeling)
       │
       ▼
ACTIVE RECALL CHECK (Concealed Retrieval)
       │
       ▼
GUIDED & INDEPENDENT PRACTICE (Original MCQ / Short Answer >= 2)
       │
       ▼
ERROR INTELLIGENCE MAPPING (Cognitive Root Cause Attribution)
       │
       ▼
COGNITIVE REPAIR GUIDE (Misconception Dismantling)
       │
       ▼
INDEPENDENT RETEST TWIN (Isomorphic Transfer Measurement)
       │
       ▼
MASTERY EVIDENCE (Demonstrated in Product Engine)
       │
       ▼
ADAPTIVE SPACED REVIEW (Decay Rate & Urgency Tracking)
       │
       ▼
EXAM TRANSFER SYNTHESIS (BAC Traps & Typology Notes)
       │
       ▼
QA AUDIT ──► MULTI-DIMENSIONAL VERIFICATION ──► PUBLISHED
```

---

## 3. Strict Prohibitions

1. **No Mass Low-Quality Generation**: Generating hundreds of shallow questions without distractor analysis or retest twins is strictly prohibited.
2. **No Fake Precision**: No arbitrary percentage scores (e.g. 98.4%). Scores are evidence-based, returning `UNKNOWN` if audit data is incomplete.
3. **No Commercial Guarantees**: Prohibited phrases such as "علامة مضمونة", "نضمن لك", "موضوع مؤكد في البكالوريا", or "العتبة".
4. **No Premature Remote Database Tables**: All content infrastructure is domain-driven (pure TypeScript types, validators, and registries), avoiding database schema churn.
