# BAC Mastery — Pilot Success Criteria & Signal Thresholds
**Controlled Real-Student Validation (Prompt 18.2 § 29)**

---

## 1. Philosophical Grounding
> [!IMPORTANT]
> These criteria are **directional pilot signals**, NOT statistical guarantees or scientific p-values. In a 5–10 student cohort, our objective is to uncover qualitative usability truths, learning loop friction, and epistemic clarity before larger deployments.

These thresholds are established **a priori** (before inspecting student cohort results) to prevent post-hoc rationalization.

---

## 2. Directional Pilot Signals

### 🟢 GREEN Signal (Pilot Validation Succeeded)
A GREEN pilot signal indicates that the product fundamentally works in the hands of real Algerian students and the learning loop is viable without human coaching:
1. **Zero Coaching Onboarding**: $\ge 80\%$ of students complete registration, trial activation, and onboarding without asking the observer for help.
2. **Diagnostic Comprehension**: Majority of students understand that the diagnostic identifies current gaps rather than assigning a permanent judgment or fake BAC score.
3. **Mission Purpose Clarity**: Students can articulate *"علاش هذي المهمة بالذات؟"* using the reason provided in the UI.
4. **Immediate Next Action**: $\ge 80\%$ of students identify the single next best action on Dashboard/Roadmap (`NEXT_ACTION_CLEAR`).
5. **Closed Loop Completion**: Students experience: Practice Error $\to$ Error Lab Diagnosis $\to$ 5–15m Targeted Micro-Repair $\to$ Isomorphic Retest Twin $\to$ Demonstrated Mastery.
6. **Retest Epistemic Integrity**: Students understand that mastery requires independent performance on a new question, not mere lesson completion.
7. **Voluntary Return Signal**: At least some students return on Day 2 without observer prodding or reminder emails.
8. **Zero P0 Security or Integrity Flaws**: Zero credential leaks, zero cross-user data exposure, zero data loss, and client trial tamper resistance.

### 🟡 YELLOW Signal (Functional with Friction / Conditions Required)
A YELLOW pilot signal indicates the platform is fundamentally sound but exhibits friction requiring refinement before wider rollout:
1. **Next Action Friction**: $\ge 30\%$ of students hesitate or experience `CHOICE_OVERLOAD` on the Dashboard before discovering the next action.
2. **Pedagogical Pacing Mismatch**: Students report that the 5–15m micro-repair is too verbose or that question difficulty transitions too abruptly.
3. **Diagnostic Anxiety**: Students express feeling demotivated by low diagnostic signals despite explanatory text.
4. **Error Taxonomy Misalignment**: Students feel confused by error classifications (e.g. distinguishing conceptual gap from calculation slip).
5. **Intermittent Observer Intervention**: Observer had to assist on non-critical UX friction (e.g. finding the back button or scrolling).

### 🔴 RED Signal (Critical Pilot Failure / Rollout Blocked)
A RED signal halts further pilot cohorts until core architectural or content defects are resolved:
1. **Broken Learning Loop**: Students are unable to complete the sequence (e.g., retest twin fails to load, repair guide crashes, state resets).
2. **Disorientation**: Majority of students have no idea what to do next without step-by-step developer prompting.
3. **Data Loss or State Corruption**: LocalStorage or Supabase profile state desynchronizes, wiping student progress.
4. **Security or Tenant Breach**: A student can view another student's profile or bypass the trial expiration gate.
5. **Critical Content Invalidation**: Factually incorrect mathematics, physics formulas, or biology answers discovered in the canonical curriculum.
