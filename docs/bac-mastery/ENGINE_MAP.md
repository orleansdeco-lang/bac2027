# BAC MASTERY — ENGINE MAP

This document details the functional specifications, inputs, logic, and outputs for all core engines of the BAC Mastery architecture.

---

## Engine 1 — Goal Engine
* **Purpose**: Transform vague dreams into an actionable, quantitative academic vector.
* **Onboarding Inputs (Phase 2)**:
  * `target_score` (e.g., 16.50 out of 20)
  * `subject_self_estimates` (1 to 5 rating per stream subject)
  * `estimated_baseline_score` (Weighted average derived from self-estimates: 1->7.0, 2->9.5, 3->12.0, 4->15.0, 5->18.0)
  * `weekly_study_hours` (<5h, 5-8h, 8-12h, 12-18h, 18-25h, 25+h, not_sure)
  * `desired_specialty` (University / Higher school aspiration)
  * `reported_obstacles` (Methodology, consistency, time, active recall, backlog)
* **Outputs**:
  * `approximate_gap`: $\max(0, \text{Target Score} - \text{Estimated Baseline})$
  * Strategic profile object persisted in browser local storage.
  * Explicit labeling as **"مستواك الحالي — تقديرك"** to maintain clear separation from future empirical diagnostics.

---

## Engine 2 — Diagnostic Engine
* **Purpose**: Reveal actual cognitive capabilities across six dimensions rather than simple multiple-choice recall.
* **Cognitive Dimensions Measured (Coming in Phase 3)**:
  1. **Knowledge** (استرجاع المعارف - Facts, definitions, properties)
  2. **Understanding** (الفهم والتفسير - Explaining mechanisms, concepts)
  3. **Application** (التطبيق والحساب - Executing formulas, procedures)
  4. **Methodology** (المنهجية - Algerian BAC official marking methodology)
  5. **Speed** (السرعة وإدارة الوقت - Completion time per point)
  6. **Confidence** (الثقة - Student's calibrated certainty vs. correctness)
* **Outputs**:
  * Empirical diagnostic report replacing initial self-estimates.
  * Precise topic and error-pattern mapping.

---

## Engine 3 — Gap & Bottleneck Engine
* **Purpose**: Calculate weighted opportunity matrices and identify the single highest-leverage bottleneck.
* **Initial Gap Mathematical Model**:
  $$\text{Subject Weighted Gap}_s = (\text{Target Grade} - \text{Estimated Baseline Grade}_s) \times \text{Coefficient}_s$$
* **Hybrid Bottleneck Discovery (Academic + Behavioral)**:
  1. **Academic**: Identifies core subjects with high coefficient $\times$ low rating (ratings 1 or 2 in coef $\ge 5$).
  2. **Methodology**: Triggers when obstacle `understand_but_fail_exercises` is reported (focusing on BAC answer framing).
  3. **Consistency & Time**: Triggers when study time is `< 5h` or `start_and_stop` is reported alongside high targets.
  4. **Active Recall**: Triggers when obstacle `memorize_and_forget` is reported.
* **Outputs**:
  * `primaryBottleneck`: Category, title, human-first explanation, and first mission recommendation.
  * `secondaryBottlenecks`: Supplementary areas to monitor.

---

## Engine 4 — Roadmap Engine
* **Purpose**: Transform the identified gaps into an ordered, multi-phase curriculum.
* **Phases**:
  1. `Phase 1: Foundation` (Prerequisites from 1AS/2AS, fundamental definitions)
  2. `Phase 2: Understanding` (Mechanisms, proofs, core chapter concepts)
  3. `Phase 3: Methodology` (Official BAC answer structuring)
  4. `Phase 4: Practice` (Standard exercises with graduated difficulty)
  5. `Phase 5: Weakness Repair` (Targeting errors identified in Error Lab)
  6. `Phase 6: Advanced Exercises` (Synthesis problems from past BACs and pilot schools)
  7. `Phase 7: Simulation` (Timed full-paper conditions)
  8. `Phase 8: Exam Readiness` (Final consolidation, mindset, and rest)
* **Outputs**:
  * Dynamic sequence of milestones with estimated completion dates.

---

## Engine 5 — Missions Engine
* **Purpose**: Eliminate student decision fatigue by supplying ready-to-execute daily tasks.
* **Structure**:
  * 2 to 4 missions per day.
  * Duration: 10 to 45 minutes per mission (Maximum 90–120 minutes total daily self-study).
* **Mission Types**:
  * `UNDERSTAND`: Concept deconstruction and active recall.
  * `PRACTICE`: 2–4 targeted problems with self-correction.
  * `ERROR_REVIEW`: Review previous mistakes and apply fixes.
  * `MINI_TEST`: 10-minute check to validate retention.
  * `REST_RESET`: Mindful downtime, cognitive reset.

---

## Engine 6 — Study Method Engine
* **Purpose**: Equip the student with concrete cognitive study protocols tailored to subject requirements.
* **Protocols**:
  * **Active Recall Protocol**: Understand → Close Material → Recall → Verify → Synthesize.
  * **STEM Problem Protocol**: Read statement → Extract givens → Diagram/Hypothesis → Plan steps → Execute → Unit/Sanity check.
  * **Experimental Science Methodology Protocol**: Official 3-step Algerian BAC methodology (Observation/Fact → Interpretation → Deduction/Synthesis).
  * **Spaced Review Engine**: Intervals calibrated at +1 day, +3 days, +7 days, +21 days.

---

## Engine 7 — Error Lab Engine
* **Purpose**: Transform mistakes from sources of shame into empirical optimization data.
* **Taxonomy (10 Types)**:
  1. `forgot_information` (نسيان المعلومة أو القاعدة)
  2. `did_not_understand` (عدم فهم المفهوم أو الظاهرة)
  3. `method_unknown` (عدم معرفة طريقة الحل)
  4. `calculation_error` (خطأ في الحساب أو الإشارة)
  5. `misread_question` (سوء قراءة نص السؤال)
  6. `rushed` (التسرع وعدم التحقق)
  7. `lack_of_practice` (نقص التدريب والتطبيق)
  8. `methodology_error` (خطأ منهجي في صياغة الإجابة)
  9. `time_management` (سوء توزيع الوقت في التمرين)
  10. `attention_error` (عدم الانتباه للوحدات أو الشروط)
* **Outputs**:
  * Error frequency dashboard.
  * Automated **Repair Missions** triggered when the same error type recurs $\ge 2$ times.

---

## Engine 8 — Adaptive System Engine
* **Purpose**: Dynamically re-balance roadmap velocity based on student performance.
* **Mechanics**:
  * If a topic has unresolved high-frequency errors $\rightarrow$ Freeze forward progression on that thread, insert a Repair Mission.
  * If mastery is verified with $>85\%$ on mini-tests $\rightarrow$ Fast-track to advanced practice.
  * If the student misses 3 consecutive days $\rightarrow$ Trigger **Recovery Mode**.

---

## Engine 9 — Mind Engine
* **Purpose**: Calibrate daily study intensity against the student's psychological and energy state.
* **Daily States**:
  * 🙂 **Good**: Normal full mission load assigned.
  * 😐 **Normal**: Standard load with optional bonus challenge.
  * 😫 **Tired**: Halve practice volume; prioritize active recall or short video/audio review; mandate early sleep.
  * 😰 **Stressed**: Abort long problem sets; assign a 5-minute breathing/reset, 1 high-confidence mini mission, and rest.

---

## Engine 10 — Rest Engine
* **Purpose**: Codify rest as an essential performance variable.
* **Rules**:
  * Scheduled downtime every 7 days (e.g., Friday afternoon or Saturday evening).
  * 5–10 minute movement/screen-free intervals between 45-minute focus blocks.
  * Sleep awareness warnings when study activity is recorded past 23:00.

---

## Engine 11 — Recovery Mode Engine
* **Purpose**: Protect momentum after interruptions without toxic backlog accumulation.
* **Rules**:
  * Never display: *"You are 14 missions late!"*
  * Resets backlog into three triage buckets:
    * **Priority 1 (Crucial)**: Prerequisite knowledge and primary bottleneck repairs.
    * **Priority 2 (Standard)**: Core chapter exercises.
    * **Archived (Optional)**: Deferred until final exam review.
  * Restores momentum within 24 hours.

---

## Engine 12 — Future Engine
* **Purpose**: Anchor hard daily work in tangible future possibilities.
* **Features**:
  * Algerian Higher Education Directory: Faculty of Medicine, ESI (Algiers & Sidi Bel Abbès), ENS, Polytech, Architecture, Pharmacy, Law, Business & Economics.
  * BAC score requirement ranges (historical threshold averages).
  * Motivation cards linking today's math mission to future engineering/medical skills.

---

## Engine 13 — Progress Engine
* **Purpose**: Present calm, actionable, non-addictive feedback.
* **Metrics**:
  * Current Estimated Score vs. Target Score.
  * Net Points Gained this month.
  * Error Neutralization Rate (% of logged errors successfully repaired).
  * Active Bottleneck status.

---

## Engine 14 — Exam Mode Engine
* **Purpose**: Final 60-day operational shift from conceptual learning to exam mastery.
* **Features**:
  * Timed 3.5-hour and 4-hour BAC simulations.
  * Subject subject-topic choice strategy (الموضوع الأول vs الموضوع الثاني).
  * Answer sheet formatting practice according to BAC standards.
  * Energy and circadian rhythm tapering in the final 10 days.

---

## Engine 15 — AI Bridge (Student Intelligence Report)
* **Purpose**: Provide advanced AI analysis without incurring SaaS API costs or risking token abuse.
* **Mechanism**:
  * Generates a structured, privacy-preserving markdown report detailing:
    * Student stream, target score, current estimated score, and remaining weeks.
    * High-frequency error categories from the Error Lab.
    * Current primary bottleneck and recent mission completion metrics.
  * One-click copy with an optimized prompt template for ChatGPT, Claude, or Gemini.
  * The student gets tailored AI coaching for free, then applies the advice back in BAC Mastery.

---

## Engine 16 — Stream & Exam Agnostic Engine
* **Supported BAC Streams**:
  1. Sciences Expérimentales
  2. Mathématiques
  3. Technique Math (Génie Civil, Génie Mécanique, Génie Électrique, Génie des Procédés)
  4. Gestion & Économie
  5. Lettres & Philosophie
  6. Langues Étrangères
* **BEM Extension Readiness**:
  * Uses generic `education_level` (Secondary vs. Middle School) and `exam_type` ('BAC' | 'BEM').
  * Allows introducing 4AM subjects and BEM coefficients seamlessly without code refactoring.
