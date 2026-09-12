# BAC Mastery — Gestion & Économie Student Pilot Experience
## End-to-End Pedagogical Journey Simulation: Persona "Yasmine Belkacem"

- **Stream**: Gestion & Économie (تسيير واقتصاد - 3AS)
- **Candidate Persona**: Yasmine Belkacem (ياسمين بلقاسم)
- **High School**: Lycée Frères Hamia, Kouba, Alger (ثانوية الإخوة حامية - القبة - الجزائر العاصمة)
- **Target Goal**: 15.00 / 20.00 (Mention Bien / Très Bien)
- **Target University Aspiration**: École des Hautes Études Commerciales (EHEC Alger) / École Nationale Supérieure de Management (ENSM)
- **Weekly Study Budget**: 14 hours / week
- **Pilot Academic Year**: 2026–2027
- **Verification Baseline**: 100% Deterministic (Zero Runtime LLM, Zero PII)

---

## 1. Persona Profile & Strategic Onboarding

Yasmine is a dedicated 3AS student in the Gestion & Économie stream. She has strong analytical intuition and does well in conceptual subjects like Economics and Law, but faces persistent friction in Accounting procedural calculations (particularly end-of-year regularizations and depreciation schedules) and applied Mathematics (two-variable regression and arithmetic-geometric sequences).

### Onboarding Choices:
- **Stream Selection**: `gestion_eco` (شعبة التسيير والاقتصاد)
- **Target BAC Average**: **15.00 / 20.00**
- **Weekly Time Commitment**: **14 hours / week** (average 2 hours / day)
- **Baseline Subject Confidence**:
  - High: *Économie & Management*, *Droit*
  - Moderate: *Histoire-Géographie*, *Langues (Arabe, Français, Anglais)*
  - High Anxiety / Stumbling Block: *Comptabilité et Finance* (Coeff 6) & *Mathématiques* (Coeff 5)

---

## 2. Multi-Subject Diagnostic Execution (15 Questions)

Yasmine undertakes the calibrated 15-question cross-subject diagnostic battery covering the 4 core quantitative and institutional subjects:
- **4 Accounting Questions** (`accounting_finance`)
- **4 Economics & Management Questions** (`economics_management`)
- **3 Law Questions** (`law`)
- **4 Mathematics Questions** (`math`)

### Detailed Diagnostic Results:
| # | Subject | Topic / Skill | Dimension | Time | Result | Identified Trap / Rationale |
|---|---------|---------------|-----------|------|--------|-----------------------------|
| 1 | Accounting | Linear Depreciation & Prorata | Application | 72s | ❌ INCORRECT | Fell into `trap-annual-annuity-omission-prorata`: calculated full year instead of 6 months. |
| 2 | Accounting | Doubtful Receivables (Clients) | Methodology | 88s | ❌ INCORRECT | Committed `trap-ttc-depreciation-and-no-transfer`: computed loss on TTC instead of HT. |
| 3 | Accounting | Prepaid Expenses (486) | Understanding | 65s | ✅ CORRECT | Correctly identified 9 months deferred expense to account 486. |
| 4 | Accounting | Income Statement (EBE) | Knowledge | 55s | ✅ CORRECT | Correctly calculated EBE = VA + 74 - 63 - 64. |
| 5 | Economics | Inflation & Monetary Policy | Understanding | 68s | ✅ CORRECT | Correctly identified cost-push inflation and restrictive monetary policy. |
| 6 | Economics | Central Bank vs Commercial Banks | Knowledge | 48s | ✅ CORRECT | Correctly identified fiduciary issuance monopoly of Banque d'Algérie. |
| 7 | Economics | Exchange Rate & Elasticity | Application | 70s | ✅ CORRECT | Correctly analyzed Marshall-Lerner condition on currency depreciation. |
| 8 | Economics | Strategic vs Operational Decisions | Methodology | 58s | ✅ CORRECT | Properly classified 10-year industrial solar investment as strategic. |
| 9 | Law | Labor Contract & Trial Period | Methodology | 82s | ❌ INCORRECT | Fell into `trap-contractual-freedom-vs-labor-public-order`: assumed 14-month trial was binding. |
| 10 | Law | Collective Labor Disputes (90-02) | Application | 68s | ✅ CORRECT | Mastered sequence: Conciliation -> Médiation -> Arbitrage -> Secret Vote & Notice. |
| 11 | Law | Commercial Companies (SNC vs SPA) | Knowledge | 57s | ✅ CORRECT | Accurately distinguished indefinite joint liability (SNC) from limited liability (SPA). |
| 12 | Math | Arithmetico-Geometric Sequences | Application | 88s | ❌ INCORRECT | Fell into `trap-arithmetico-geometric-naive-addition`: added geometric and linear terms naively. |
| 13 | Math | Marginal Cost & Optimization | Understanding | 78s | ✅ CORRECT | Calculated derivative Cm(q) = 3q² - 12q + 15 and found minimum at q = 2. |
| 14 | Math | Two-Variable Linear Regression | Methodology | 82s | ❌ INCORRECT | Committed `trap-regression-variance-denominator-inversion`: divided Cov by V(y) instead of V(x). |
| 15 | Math | Discrete Probability in QC | Knowledge | 66s | ✅ CORRECT | Applied total probability theorem: P(D) = 0.60(0.02) + 0.40(0.05) = 0.032. |

### Diagnostic Summary & Score Baseline:
- **Total Diagnostic Score**: **10 / 15** (66.7%)
  - Accounting: 2 / 4 (50%)
  - Economics: 4 / 4 (100%)
  - Law: 2 / 3 (66.7%)
  - Mathematics: 2 / 4 (50%)
- **Estimated Baseline BAC Score**: **12.20 / 20.00**
- **Score Gap to Target (15.00)**: **+2.80 Points**
- **Primary Identified Bottleneck**: **Comptabilité et Finance** (Coeff 6, 50% score, procedural gaps in end-of-year adjustments).
- **Secondary Bottleneck**: **Mathématiques** (Coeff 5, 50% score, formulas inversion in regression & sequences).

---

## 3. Gap Analysis & Adaptive Roadmap Generation

The Roadmap Engine processes Yasmine's diagnostic signals, weighing subject coefficients according to Executive Decree 07-142:
- Accounting weight: $6 \times (1 - 0.50) = 3.00$ gap urgency.
- Math weight: $5 \times (1 - 0.50) = 2.50$ gap urgency.
- Law weight: $2 \times (1 - 0.667) = 0.67$ gap urgency.
- Economics weight: $5 \times (1 - 1.00) = 0.00$ (Strength to maintain).

### Yasmine's Prioritized Mission Queue:
1. **Mission 1 (Priority: HIGH)**: `acc_depreciation_linear_degressive` (Comptabilité - الاهتلاكات والتناسب الزمني).
2. **Mission 2 (Priority: HIGH)**: `acc_loss_value_stocks_receivables` (Comptabilité - الزبائن المشكوك فيهم وحساب HT).
3. **Mission 3 (Priority: HIGH)**: `math_two_variable_statistics_regression` (Mathématiques - مستقيم الانحدار الخطي والتنبؤ).
4. **Mission 4 (Priority: MEDIUM)**: `math_sequences_arithmetico_geometric_models` (Mathématiques - المتتاليات وتطبيقاتها المالية).
5. **Mission 5 (Priority: MEDIUM)**: `law_labor_contract_trial_termination` (Droit - عقد العمل وفترة التجربة).

---

## 4. Complete Learning Loop: Mission 1 Execution

### Step 1: Learn Phase (Micro-Lesson)
Yasmine opens Mission 1 on **اهتلاك التثبيتات العينية والتناسب الزمني**. She reviews:
- The legal definition of depreciation under the SCF.
- The rule of *prorata temporis*: $A = V_0 \times t \times \frac{m}{12}$.
- Accounting entry on 31/12: Débit 681 / Crédit 281x.

### Step 2: Practice Session
Yasmine solves practice item `pq-acc-deprec-01`:
- Acquisition: 1,200,000 DA on 01/04/2021 (5-year linear).
- She calculates: $m = 9$ months (April to December).
- $A = 1,200,000 \times 20\% \times (9/12) = 180,000$ DA.
- $VNC = 1,200,000 - 180,000 = 1,020,000$ DA.
- She selects the correct option and receives positive affirmation.

### Step 3: Error Encounter & Error Lab
In a subsequent multi-asset exercise, Yasmine errs on a machine bought on 15/09/2022: she counted only 3 months instead of 4 months (September to December).
- **Error Lab Attribution**: The system flags `SuspectedErrorType = "calculation_error"`.
- Yasmine selects student confirmation: "أخطأت في عد أشهر الاستغلال ابتداءً من شهر الاقتناء".

### Step 4: Pedagogical Repair Guide
The system serves the targeted repair card:
- Rule: "إذا تم الشراء قبل أو يوم 15 من الشهر، يحتسب الشهر كاملاً ضمن فترة الاستغلال (من شهر 9 إلى 12 = 4 أشهر)."
- Contrasting Example: September 15 purchase vs October 01 purchase.

### Step 5: Isomorphic Retest
Yasmine takes twin retest `rq-acc-deprec-01`:
- Machine: 600,000 DA on 01/10/2022, 5 years linear.
- Months: October, November, December = 3 months.
- $A = 600,000 \times 0.20 \times (3/12) = 30,000$ DA.
- $VNC = 570,000$ DA.
- **Retest Result**: **PASSED (100%)**.
- **Skill Status**: Updated to **`mastered`**.

---

## 5. Spaced Review & Wellbeing Regulation

- **Spaced Review Schedule**: The engine registers `acc_depreciation_linear_degressive` for review in:
  - Interval 1: +3 Days
  - Interval 2: +7 Days
  - Interval 3: +21 Days
- **Fatigue Detection**: After completing 3 consecutive high-load quantitative missions (Accounting + Math), the Wellbeing Engine detects cognitive fatigue:
  - System serves a *Rest & Reset* prompt: "استرح لمدة 15 دقيقة أو راجع ملخصاً خفيفاً في مادة التاريخ والجغرافيا قبل استئناف الحسابات".

---

## 6. Full Exam Mode Simulation (ONEC Authentic Citation)

Yasmine undertakes a timed exam module under official conditions:
- **Exam Session**: Baccalauréat 2023 — Épreuve de Comptabilité et Gestion Financière (Sujet 1).
- **Duration**: 90 minutes.
- **Score Achieved**: **16.50 / 20.00**.
- **Methodology Marks**: Full credit awarded on journal entry balance, account numbers, and step justifications.

---

## 7. Score Progression & Student Intelligence Report

### Progress Summary:
- **Baseline Diagnostic**: 12.20 / 20.00
- **Post-Loop Estimated Score**: **15.40 / 20.00** (Surpassed Target 15.00!)
- **Mastered Competencies**: 11 / 33 skills confirmed.

### Generated AI Bridge Report (Zero PII):
Yasmine clicks "نسخ تقرير الذكاء الدراسي" to consult ChatGPT/Claude:
```markdown
# 🎓 تقرير الذكاء الدراسي — BAC Mastery (شعبة التسيير والاقتصاد)
*تاريخ التوليد: 2026-09-12 | المعرّف الأكاديمي: [ANONYMIZED_CANDIDATE_3AS]*

## 1. الملف الاستراتيجي للطالب (Student Strategic Profile)
- **الشعبة الرسمية:** شعبة التسيير والاقتصاد (Série Gestion & Économie)
- **المعدل المستهدف في البكالوريا:** 15.00 / 20.00
- **المعدل التقديري الحالي (Baseline):** 15.40 / 20.00
- **الحجم الساعي الأسبوعي المخصص:** 14 ساعة/أسبوع
- **المهارات المثبتة فعلياً (Mastery Evidence):** 11 من أصل 33 مهارة معيارية

## 2. العائق الأكاديمي الرئيسي (Primary Bottleneck)
- **المادة العائق الأبرز:** الرياضيات (المتتاليات والانحدار الخطي)
- **التشخيص الأكاديمي:** تم تجاوز عائق المحاسبة بنجاح، وتتركز الأولوية الحالية على النمذجة الرياضية.
```

---

## 8. Verification & Pilot Acceptance

| Step | Simulated Component | Verification Status |
|------|----------------------|---------------------|
| 1 | Onboarding & Target (15.00) | ✅ VERIFIED |
| 2 | 15-Question Diagnostic | ✅ VERIFIED |
| 3 | Gap Analysis & Roadmap | ✅ VERIFIED |
| 4 | Mission Generation | ✅ VERIFIED |
| 5 | Learn -> Practice -> Error Lab | ✅ VERIFIED |
| 6 | Repair Guide -> Isomorphic Retest | ✅ VERIFIED |
| 7 | Spaced Review & Wellbeing Rest | ✅ VERIFIED |
| 8 | ONEC Exam Mode Simulation | ✅ VERIFIED |
| 9 | Zero-PII AI Bridge Telemetry | ✅ VERIFIED |

**Pilot Verdict**: **`FULL_STREAM_PILOT_READY`**.
