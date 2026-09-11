# BAC Mastery — Error Lab & Cognitive Remediation Specification

> **Document Version:** 1.0.0  
> **Phase:** 04 — Mission Practice & Error Lab Engine  
> **Status:** Implemented & Verified (17/17 Unit Tests Passing)  
> **Core Philosophy:** *"الخطأ ليس نهاية المطاف، بل هو المادة الخام للتمكن الحقيقي."* — Errors are the primary source of diagnostic insight.

---

## 1. Executive Summary & Philosophy

In conventional educational platforms, an incorrect answer leads to an abrupt "Incorrect — try again" alert or an immediate reveal of the final solution. This encourages passive skimming and repeat mistakes.

In **BAC Mastery**, the **Error Lab** intercepts every failed exercise. It transforms a missed question into an active cognitive diagnosis, attribution, and structured 5–10 minute repair flow.

---

## 2. The 5-Stage Error Lifecycle

Every detected error moves through a strictly typed, unidirectional finite state machine:

```
[ identified ] 
      │
      ▼  (Student selects attribution)
[ repair_started ] 
      │
      ▼  (Student completes 5-10 min action steps)
[ repair_completed ] 
      │
      ▼  (System triggers paired retest)
      ├───────────► [ retest_passed ] ===> (Mastery Evidence Created)
      │
      └───────────► [ retest_failed ] ===> (Queued for secondary review)
```

| Lifecycle State | Description | Next Trigger |
| :--- | :--- | :--- |
| `identified` | Triggered immediately upon an incorrect practice submission. The system infers a likely cause from distractor metadata. | Student confirms or alters cause attribution. |
| `repair_started` | Student views the targeted repair strategy and begins reviewing concrete checklist steps. | Student clicks "أتممت خطوات الترميم وفهمت الفكرة". |
| `repair_completed` | System marks remediation as complete and activates the paired retest button. | Student clicks "الانتقال إلى إعادة الاختبار". |
| `retest_passed` | Student solves the twin retest variant correctly. Formative mastery evidence is saved. | Mission status updated to `mastered`. |
| `retest_failed` | Student misses the retest question. Flagged for secondary conceptual review. | Re-initiates repair guide without penalty. |

---

## 3. Cognitive Error Taxonomy (10 Categories)

The Error Lab uses a unified cognitive taxonomy mapped across Algerian high-school learning behaviors:

| Taxonomy Key | Arabic Label | French Label | Typical Diagnostic Source |
| :--- | :--- | :--- | :--- |
| `forgot_information` | نسيت المعلومة / القانون | Oubli de la formule / cours | Missing derivative rules, unit constants, definitions. |
| `misunderstood_concept` | ما فهمتش الفكرة أصلاً | Incompréhension du concept | Misconceptions about limits, half-life, or antibody role. |
| `methodology_error` | عرفت الفكرة بصح ما عرفتش نطبقها منهجياً | Erreur méthodologique BAC | Incomplete induction step, TVI uniqueness omission, SVT rubric skips. |
| `calculation_error` | غلطت في الحساب / الإشارة | Erreur de calcul ou signe | Sign inversions in exponent powers, arithmetic fractions. |
| `misread_question` | ما قريتش السؤال مليح / تسرعت | Consigne mal lue / incomprise | Overlooking negative constraints, boundary conditions. |
| `rushed` | استعجلت في اختيار الإجابة | Précipitation | Submissions executed in $< 30\%$ expected time. |
| `lack_of_practice` | نحتاج تمارين أكثر لتثبيت الفكرة | Manque d'entraînement | Conceptual hesitation, low self-efficacy. |
| `time_management` | مشكل في تنظيم الوقت | Problème de gestion du temps | Excessive dwell time causing hasty late clicks. |
| `attention_error` | قلة تركيز وسهو | Manque d'attention ponctuel | Transposing variables, minor careless slips. |
| `unknown` | ما علاباليش بالضبط | Cause indéterminée | Student unable to identify self-rationale. |

---

## 4. Student Attribution Interface

When an error occurs, the UI displays:
1. **Calm, respectful banner**:
   - Arabic: *"الجواب غير صحيح — خلينا نفهم علاش."*
   - French: *"Réponse incorrecte — analysons pourquoi."*
2. **System Inferred Hint**:
   - Displays the distractor's suspected error type as a starting hypothesis:  
     *"إشارة النظام المقترحة: ما فهمتش الفكرة أصلاً"*
3. **8 Clickable Attribution Buttons**:
   - Allows the student to confirm or override the system's guess with their true internal metacognitive reflection.
4. **Action**:
   - Clicking *"تثبيت التشخيص وبدء خطة الترميم"* updates the error record's `errorSource` from `system_inferred` to `student_selected`.

---

## 5. Guided Immediate Repair (5–10 Minutes)

Once attribution is confirmed, the student receives the **Repair Action Plan**:
- **Strategy Summary**: High-level conceptual anchor (e.g., *"تفكيك الدالة المركبة إلى دالتين وحساب مشتقة الدالة الداخلية أولاً"*).
- **Numbered Checklist**: 3 to 4 concrete, actionable algorithmic steps.
- **Detailed Solution**: Complete ministerial-style step-by-step solution for the missed practice question.
- **Action CTA**: *"أتممت خطوات الترميم وفهمت الفكرة"*.

---

## 6. The Retest Gate & Evidence-Based Mastery

To eliminate the illusion of competence caused by simply reading an explanation:
1. The student **must** solve an unseen twin question (`rq-...`).
2. If the retest is passed:
   - Status transitions to `retest_passed`.
   - `MasteryEvidence` record is generated:
     ```ts
     interface MasteryEvidence {
       skillId: string;
       missionId: string;
       subjectId: SubjectId;
       masteredAt: string;
       retestQuestionId: string;
       retestConfidence: number;
       status: "mastered";
     }
     ```
   - The skill is marked as mastered in the student's roadmap.
3. If the retest is failed:
   - Status transitions to `retest_failed`.
   - The mission returns to the repair queue without demoralizing punitive scores.

---

## 7. Error Registry Page (`/error-lab`)

Students can review their entire error history at `/error-lab`:
- Filters by subject (Math, Physics, SVT).
- Status badges (`identified`, `repair_started`, `repair_completed`, `retest_passed`, `retest_failed`).
- Direct action link to resume repair or launch retests for any pending errors.
