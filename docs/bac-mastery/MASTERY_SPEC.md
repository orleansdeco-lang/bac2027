# BAC Mastery — Evidence-Based Mastery & Adaptive Repair Specification (Prompt 05)

## 1. Product Philosophy & Non-Negotiable Axiom

> **"ماشي واش تقرا. كيفاش توصل."**
> **One correct practice question $\neq$ mastery.**

Shallow e-learning software typically marks a skill as "complete" or "mastered" immediately upon a single correct answer. In Algerian BAC preparation, this creates a catastrophic illusion of competence: a student guesses correctly, receives false positive feedback, skips deeper study, and fails on the final exam.

BAC Mastery enforces an evidence-based standard:

$$\text{Diagnostic} \longrightarrow \text{Bottleneck} \longrightarrow \text{Mission} \longrightarrow \text{Practice} \longrightarrow \text{Error} \longrightarrow \text{Repair} \longrightarrow \text{Retest} \longrightarrow \text{Mastery Evidence}$$

---

## 2. Three-Tier Mastery Model

| Tier | Status Key | UI Label (AR) | UI Label (FR) | Standard of Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **0** | `not_yet` | لم نثبتها بعد | *Pas encore démontrée* | No data, unaddressed, or 2 failed retests requiring deeper remediation. |
| **1** | `emerging` | في طور التحسن | *En progression* | Initial practice answered correctly with confidence, but unvalidated by a twin variant. |
| **2** | `demonstrated` | ✓ تم إثبات التحكم | *Maîtrise démontrée ✓* | Error identified $\to$ root cause attributed $\to$ repair completed $\to$ unseen twin retest passed. |

### MasteryEvidence Schema
```typescript
export interface MasteryEvidence {
  missionId: string;
  skillId: string;
  subjectId: SubjectId;
  evidenceType: "practice_success" | "repair_retest_success" | "verification_success";
  practiceAttempts: number;
  correctAttempts: number;
  retestAttempts: number;
  successfulRetests: number;
  confidenceSignals: number[];
  masteryStatus: MasteryStatus; // "not_yet" | "emerging" | "demonstrated"
  achievedAt?: string;
  // Backward compatibility fields
  masteredAt?: string;
  retestQuestionId?: string;
  retestConfidence?: number;
  status?: "mastered" | "needs_further_work";
}
```

---

## 3. Deterministic Recurring Error Detection

Repeated errors on the same skill indicate a systemic cognitive misconception or missing procedural foundation, not just a random oversight.

### Detection Rule
$$\text{Count}\big(e \in \text{Errors} \;\big|\; e.\text{skillId} = \text{skillId} \;\wedge\; e.\text{suspectedErrorType} = \text{errorType}\big) \ge 2 \implies \text{isRecurring} = \text{true}$$

* Exception: `unknown` ("ما نعرفش") is never marked as recurring to prevent false categorization.
* When triggered:
  1. Both error records receive `isRecurring = true`.
  2. Error Lab displays a highlighted warning banner:
     * **AR**: *"نفس النوع من الخطأ تكرر أكثر من مرة. الأفضل نصلح السبب بدل ما نزيدو تمارين."*
     * **FR**: *"Le même type d'erreur s'est répété. Il vaut mieux corriger la cause avant d'ajouter d'autres exercices."*
  3. The skill is prioritized in the next mission selection queue.

---

## 4. Adaptive Repair Taxonomy

Repair strategies are customized to the student's attributed cognitive failure mode:

1. **`forgot_information`**: Active recall protocol (write definition/formula without looking, identify omitted condition).
2. **`calculation_error`**: Intermediate arithmetic verification, explicit sign checks, unit balance checks.
3. **`misunderstood_concept`**: Conceptual deconstruction, verbal explanation in own words, graphical/schematic connection.
4. **`methodology_error`**: Official BAC marking rubric alignment, explicit premises/hypotheses before conclusion.
5. **`misread_question`**: Active instruction decoding, highlighting action verbs and mathematical constraints.
6. **`rushed`**: Rhythm control, eliminating incorrect distractors with proof before confirming selection.
7. **`unknown`**: Step-by-step trace to isolate the first line of ambiguity without forcing false certainty.

---

## 5. Retest Failure Policy (Max 2 Cycles)

Infinite retry loops destroy student morale and induce panic. BAC Mastery bounds retests to a maximum of 2 cycles:

* **Retest Attempt 1 (Failure)**:
  * Error status transitions to `retest_failed` (`retestFailureCount: 1`).
  * Mission status returns to `repair_needed`.
  * Student reviews repair steps and is offered one final retest attempt.
* **Retest Attempt 2 (Failure)**:
  * Error status transitions to `retest_failed` (`retestFailureCount: 2`).
  * Mission status transitions to `needs_more_work` ("تحتاج هذه النقطة إلى عمل إضافي").
  * Mission is removed from immediate active execution and returned to the roadmap queue for spaced review.

---

## 6. Deterministic Next Mission Priority Queue

When an active mission is mastered or concluded, `getNextRecommendedMission` selects the next task according to a strict 5-tier priority hierarchy:

1. **Priority 1**: High-priority unresolved errors (`status === "repair_needed"` or `status === "retest_ready"`).
2. **Priority 2**: Recurring errors that have not reached demonstrated mastery.
3. **Priority 3**: Weakest cognitive dimension from the empirical diagnostic (e.g. `methodology`, `understanding`).
4. **Priority 4**: Next unmastered skill in the current core subject.
5. **Priority 5**: Next unmastered skill in subsequent core subjects ordered by official coefficient:
   * *Sciences Expérimentales*: Natural Sciences (coef 6) $\to$ Physics-Chemistry (coef 5) $\to$ Mathematics (coef 5).

---

## 7. Development & QA Reset Utility

A safe development utility is available at `/reset-demo`:
* Wipes local storage mission, error, and mastery records.
* Optionally performs a full reset back to `/onboarding`.
* Enables clean automated verification and reproducible user walkthroughs.
