# BAC Mastery V1 — Human Help & Teacher Escalation Architecture
**Prompt 20.1 Domain Specification Document**
*Version: 1.0.0 — Human Escalation Rails*
*Status: Verified & Active (Domain Only)*

---

## 1. The Core Architectural Philosophy

### BAC Mastery Detects. Teacher Explains. BAC Mastery Verifies.
Traditional tutoring marketplaces suffer from three structural failures:
1. **The Diagnostic Void**: The teacher spends the first 20 minutes asking: *"What lesson are you doing and what don't you understand?"* The student rarely knows their exact pedagogical bottleneck.
2. **The Passive Tutoring Trap**: A teacher explains, the student nods passively, but no rigorous verification occurs.
3. **The Unstructured Marketplace**: Tutors list generic subjects without skill-level verification.

BAC Mastery inverts this entire model:
$$\text{BAC Mastery Diagnostic} \xrightarrow{\text{Data}} \text{Student Learning Brief} \xrightarrow{\text{Targeted Intervention}} \text{Teacher} \xrightarrow{\text{Student Returns}} \text{Retest Twin Verification}$$

---

## 2. Deterministic Escalation Engine (`getLearningEscalation`)

Escalation decisions are made by a pure, deterministic function evaluating cumulative learning telemetry:
- **Consecutive practice failures**
- **Retest failure count**
- **Recurring error status**
- **Repair loop completion history**
- **High-confidence misconception rate**
- **Total time spent on the skill**
- **Explicit student intent**

### The Invariant of the Single Error
```
Practice Question ──► Single Wrong Answer ──► Normal Feedback & Repair
                                        │
                                        └── NOT Teacher Escalation
```
A single wrong answer indicates nominal learning effort. Human escalation requires objective evidence of recurring failure or chronic deadlock.

---

## 3. Student Intent Mapping (`mapStudentHelpRequest`)

Students interact with natural expressions of frustration. Rather than introducing a parallel, competing error taxonomy, BAC Mastery maps conversational intent directly into the authoritative `SuspectedErrorType`:

| Student Expression (Arabic) | Pedagogical Intent | Mapped Authoritative Error | Root Cause Attribution | Immediate System Action |
| :--- | :--- | :--- | :--- | :--- |
| **"ما فهمتش المفهوم"** | Did not understand the theoretical premise | `misunderstood_concept` | Conceptual | Simpler theoretical explanation |
| **"فهمت بصح ما نعرفش نطبق"** | Understands definition, cannot execute steps | `methodology_error` | Procedural | Step-by-step worked example |
| **"نسيت القاعدة"** | Cannot recall rule/formula | `forgot_information` | Metacognitive | Active recall formula card |
| **"نغلط في الحساب"** | Arithmetic or algebraic execution slip | `calculation_error` | Arithmetic | Micro-drill on operations |
| **"ما فهمتش السؤال"** | Struggling with question framing or text | `misread_question` | Attentional | Question prompt breakdown |
| **"نحتاج رسم / مخطط"** | Needs spatial / visual representation | `misunderstood_concept` | Conceptual | Schematic visual asset |
| **"نحتاج مصدر خارجي"** | Needs alternative lecture or video | `lack_of_practice` | Procedural | Curated external resource |
| **"نحتاج أستاذ"** | Requests human intervention | `methodology_error` / recurring | Procedural / Multi-tier | Evaluates escalation eligibility |

---

## 4. The Student Learning Brief: Evidence Without PII

When a student escalates to `TEACHER_HELP`, BAC Mastery generates an objective, pedagogical diagnostic brief.

### Key Brief Sections
1. **Academic Context**: Stream, Subject, Target Skill, and Current Mastery Tier.
2. **Quantitative Attempt Metrics**: Total attempts, consecutive failures, practice accuracy rate.
3. **Error Profile**: Frequencies of specific error types and context excerpts.
4. **Repair & Retest History**: Number of repair guide attempts, last repair status, retest twin outcomes.
5. **Cognitive Dynamics**: Confidence vs. accuracy alignment (e.g. overconfidence flags) and pacing metrics (rushed vs. struggling).
6. **Prior Interventions**: Visuals already viewed, external resources already consulted.
7. **Synthesized Diagnosis & Recommendations**: Concrete guidance for the educator on what to model and the required session objective.

### Absolute Privacy Guarantee
```typescript
// Strict Zero-PII Invariant:
// brief contains ZERO:
// - student names
// - email addresses
// - phone numbers
// - authentication tokens
// - passwords or financial data
```

---

## 5. Teacher Skill-Based Profile Model

A future teacher profile in BAC Mastery is defined by **competence granularity**, not broad subject declarations:
- `teacherId`: Anonymous identifier.
- `subjectId`: Canonical subject.
- `streamIds`: Qualified streams.
- `qualifiedSkillIds`: Array of specific skills the educator is certified to support.
- `supportedHelpTypes`:
  - `concept_explanation`
  - `methodology`
  - `exercise_solving`
  - `exam_preparation`
- `verificationStatus`: Pedagogical verification state.
- `isAcceptingBriefs`: Boolean availability toggle.

---

## 6. Why Marketplace UI & Payments Are Deferred

In accordance with Section 19 of Prompt 20.1, the platform intentionally defers:
- Teacher public directory and profile pages.
- Real-time booking calendars and appointment scheduling.
- Commission and payment splitting logic.
- In-app video calling, voice chat, and peer messaging.
- Public ratings and review widgets.

**Rationale**: Laying the architectural rails (data contracts, intent mapping, diagnostic briefs) ensures that when human tutoring is introduced, it will plug directly into the established Learning OS without creating architectural sprawl.
