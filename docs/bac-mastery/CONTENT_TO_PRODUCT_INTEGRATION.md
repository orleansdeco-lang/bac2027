# BAC Mastery — Content to Product Integration
## How the Verified 31-Skill Content Engine Powers Runtime Product Loops

**Version:** 1.0.0  
**Baseline Date:** September 2026

---

## 1. Overview: Bridging Pedagogical Knowledge and Student Runtime

In Prompts 11 through 13.2, BAC Mastery established an educational content engine covering 31 canonical skills for the Sciences Expérimentales stream.
In Prompt 14, this verified content engine is linked to interactive student runtime loops via the **`SkillLearningBundle`** abstraction.

```
┌─────────────────────────────────────────────────────────────┐
│             VERIFIED CONTENT ENGINE (Stateless)             │
│  - 31 Skills with Prerequisites DAG                         │
│  - 31 14-Element Micro-Lessons                              │
│  - 31 Step-by-Step Worked Examples ("Think First")         │
│  - 62 Calibrated Practice Questions                         │
│  - 31 4-Step Repair Guides (5-10 min)                       │
│  - 31 Isomorphic Retest Twins                               │
│  - 31 Past BAC Exam References (ONEC Official Citations)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                       Mapped at runtime via
                   getSkillLearningBundle(skillId)
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│             STUDENT PRODUCT ENGINE (Stateful)               │
│  - Today's Mission Recommendation (Roadmap Priority)        │
│  - 8-Step Interactive Mission Page (/mission/[id])          │
│  - Practice Attempt Logging (time, confidence, option)      │
│  - Error Lab Diagnosis (attribution & classification)       │
│  - Repair Execution & Personal Takeaway Note                │
│  - Retest Evaluation & Demonstrated Mastery Transition      │
│  - Verified Progress Dashboard (/dashboard, /progress)      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. The 14 Elements of a SkillLearningBundle

When a mission is loaded via `MissionService.getMissionWithBundle(missionId, userId)`, the system resolves the complete `SkillLearningBundle`:

| # | Bundle Element | Pedagogical Function in Product Loop |
|---|---|---|
| 1 | `skill` | Authoritative skill metadata (title, subject, topic, difficulty). |
| 2 | `lesson.targetCapability_ar` | Sets clear expectation (*"بعد ما نكمل الدرس، واش نقدر ندير؟"*). |
| 3 | `lesson.coreConcept_ar` | High-impact summary of the main rule or theorem. |
| 4 | `lesson.simpleExplanation_ar` | Clear, accessible explanation without textbook jargon. |
| 5 | `lesson.whyThisMatters_ar` | Direct connection to Algerian BAC exam point weighting. |
| 6 | `lesson.commonMistakes` | Preempts classic traps with cause and correct action. |
| 7 | `lesson.quickRecallPrompt_ar` | Active retrieval practice before looking at answers. |
| 8 | `workedExample` | Authentic problem with *"Think before looking"* toggle and step-by-step breakdown. |
| 9 | `practiceQuestions[0]` | First calibrated practice application with confidence rating. |
| 10 | `practiceQuestions[1]` | Secondary practice item for additional reinforcement. |
| 11 | `repairGuide` | Targeted 5-10 minute remediation protocol when an error occurs. |
| 12 | `retest` | Isomorphic twin test question evaluating real recovery. |
| 13 | `examApplication` | Historical BAC citations (year, session, exercise number). |
| 14 | `provenance` | Official ministerial and pedagogical provenance citations. |

---

## 3. Runtime Lifecycle Mapping

1. **Lesson Phase (`learn`):** Displays elements 1 through 7, providing active, high-yield preparation.
2. **Worked Example Phase (`worked_example`):** Displays element 8, forcing metacognitive reflection before revealing steps.
3. **Practice Phase (`practice`):** Administers element 9 or 10, measuring confidence ($1-5$) and response latency.
4. **Error Diagnosis Phase (`error_diagnosis`):** Uses student attribution to link the error to element 11 (`repairGuide`).
5. **Repair Phase (`repair`):** Executes the 4 repair steps in element 11 and captures the student's reflection note.
6. **Retest Phase (`retest`):** Administers element 12 (`retest`), verifying whether the student can solve an isomorphic variation independently.
7. **Mastery Confirmation (`summary`):** Combines element 13 (`examApplication`) with the updated `skill_mastery` record, cementing the achievement in the student's verified progress record.
