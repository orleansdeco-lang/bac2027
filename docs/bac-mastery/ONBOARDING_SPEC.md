# BAC MASTERY — STRATEGIC ONBOARDING SPECIFICATION

## 1. Vision & Core Value Proposition

> **"ماشي واش تقرا. كيفاش توصل."**
> *(It's not just what you study. It's how you reach your goal.)*

Information is everywhere in Algerian high school education: thousands of PDFs, endless YouTube lessons, and Facebook groups. 
The problem students face is **orientation, prioritization, and cognitive momentum**:
1. Where am I now? (Baseline estimation)
2. Where do I want to go? (Strategic target score & future faculty)
3. What is the gap? (Distance to cover without false precision)
4. What should I work on first? (Primary academic or behavioral bottleneck)
5. What is my roadmap? (Personalized trajectory)
6. How do I know I am improving? (Demonstrated mastery)

---

## 2. Onboarding Principles

- **Journey, Not a Government Form**: One focused question per screen, minimal density, smooth progress indication.
- **Explicit Separation Between Estimation and Diagnostic**:
  * Onboarding captures: **"مستواك الحالي — تقديرك"** (Self-reported initial confidence level, scale 1-5).
  * Empirical diagnostic tests: **"التشخيص الحقيقي"** (Implemented in Phase 3 to objectively measure Knowledge, Understanding, Application, Methodology, Speed, and Confidence).
- **Zero False Precision**: We show **"المسافة التقريبية"** (approximate gap, e.g. ~2.8 points) rather than misleading decimals (e.g. 2.784 points).
- **Hybrid Bottleneck Detection**: A bottleneck can be an **academic subject** (e.g. Math coef 7 with rating 1) OR a **behavioral/methodological obstacle** (e.g. understanding theory but losing points on BAC answer formulation, or studying <5 hours/week for a high target).
- **No Account Barrier (Zero Friction)**: V1 uses browser `localStorage` autosave. Students can refresh or return anytime without signing up or paying.

---

## 3. Step-by-Step Breakdown

| Step # | Screen Key | Question / Concept | Data Captured | Validation Rules | UX Rationale |
|---|---|---|---|---|---|
| **01** | `welcome` | *"ماشي واش تقرا. كيفاش توصل."* | None | None | Frames the system's transformative value. Sets a calm, serious tone. |
| **02** | `education_level` | *"واش راك تحضر؟"* | `educationLevel`, `examType` | Must select BAC (default) | Prepares future BEM architecture without hardcoded assumptions. |
| **03** | `stream` | *"شعبة البكالوريا تاعك؟"* | `streamId`, `techniqueMathSpecialty` | Required; if Technique Math, specialty branch is mandatory | Loads official Algerian stream coefficients. If Technique Math, assigns coefficient 7 to the chosen engineering subject. |
| **04** | `target_score` | *"شحال حاب تجيب؟"* | `targetScore` (10.0 to 20.0) | Range: $10.00 \le \text{target} \le 20.00$ | Quick presets (10-11 to 18-20) + exact score input. Shows realistic message: *"هدف واضح = طريق أوضح"*. |
| **05** | `level_estimation` | *"وين تشوف روحك حالياً؟"* | `subjectEstimates` (1 to 5 per subject) | All core subjects of the stream must have a rating (1..5) | 5-point scale (1: ضعيف جداً to 5: قوي). Prominent disclaimer clarifying this is self-estimation, not diagnostic. |
| **06** | `available_time` | *"قداش تقدر تقرا في الأسبوع بانتظام؟"* | `availableTime` (<5h, 5-8h, 8-12h, 12-18h, 18-25h, 25+h, not_sure) | Required | Prevents impossible, guilt-inducing schedules. Calibrates roadmap velocity. |
| **07** | `future_objective` | *"علاش حاب تجيب هاد المعدل؟"* | `futureObjectivePreset`, optional `customText` | At least preset or custom text required | Connects daily effort to university faculties (Medicine, ESI, ENS, Polytech, Architecture). |
| **08** | `obstacles` | *"وش أكثر حاجة حابسة تقدمك؟"* | `obstacles[]` (Multi-select) | At least 1 obstacle selected | Captures root blockers (methodology, consistency, backlog, retention, time). |
| **09** | `study_state` | *"كيفاش راهي طاقتك هاد الأيام؟"* | `studyEnergy` (Good, Normal, Tired, Stressed) | Required | Non-clinical study energy check to scale initial mission intensity. |
| **10** | `summary` | *"ملخص ملفك الاستراتيجي"* | Verification of all fields | All validations pass | Full review of choices. "نبدل" allows jumping back to edit; "نبني خريطتي" persists and redirects to `/roadmap`. |

---

## 4. Initial Strategic Gap Algorithm

Given the student's stream subject rules $\{ (s_i, c_i) \}$ and self-ratings $r_i \in \{1, 2, 3, 4, 5\}$:
1. Ratings are mapped to baseline grade approximations:
   $$1 \rightarrow 7.0, \quad 2 \rightarrow 9.5, \quad 3 \rightarrow 12.0, \quad 4 \rightarrow 15.0, \quad 5 \rightarrow 18.0$$
2. The coefficient-weighted baseline score is computed:
   $$\text{Estimated Baseline} = \frac{\sum_i (\text{grade}_i \times c_i)}{\sum_i c_i}$$
3. The approximate gap is:
   $$\text{Approximate Gap} = \max(0, \text{Target Score} - \text{Estimated Baseline})$$
4. Individual subject weighted gaps:
   $$\text{Weighted Gap}_i = \max(0, \text{Target Score} - \text{grade}_i) \times c_i$$

---

## 5. Hybrid Bottleneck Engine

The engine identifies both **Academic** and **Behavioral** constraints:
- **Acute Academic Bottleneck**: If a core subject ($c_i \ge 5$) has rating $r_i \le 2$, it is flagged as the Primary Bottleneck because lifting it produces the largest mathematical jump in the overall BAC score.
- **Methodology Bottleneck**: If the student selected obstacle `understand_but_fail_exercises`, the bottleneck is flagged as answer formulation and BAC marking criteria alignment rather than theory memorization.
- **Time & Consistency Bottleneck**: If available time is $<5$ hours or `not_sure` while the target is $\ge 14$, or if `start_and_stop` was selected, the bottleneck is structured around habit formation and micro-missions (25 min).

---

## 6. Strategic Map Destination (`/roadmap`)

Completing onboarding redirects directly to `/roadmap`—the first major "WOW" moment:
1. **Target Score**: Displayed clearly (e.g., `16.50 / 20`).
2. **Current Estimate**: Clearly labeled as *"مستواك الحالي — تقديرك"* (e.g., `~12.2 / 20`).
3. **Approximate Gap**: Expressed as *"المسافة التقريبية نحو الهدف"* (e.g., `+4.3 نقاط`).
4. **Primary Bottleneck**: Detailed card titled *"أول حاجة لازم نخدمو عليها"*.
5. **First Mission Preview**: Concrete 25-minute mission to break inertia.
6. **Diagnostic Hook**: Prominent button *"نبدأ التشخيص"* pointing to `/diagnostic`.

---

## 7. Future Evolution (Phases 3+)
- Transitioning from self-reported estimates to dynamic diagnostic scores upon completing Phase 3.
- Replacing the placeholder first mission with active mission timers and exercise submission in Phase 4.
- Syncing local profiles to Supabase user accounts once authentication is introduced.
