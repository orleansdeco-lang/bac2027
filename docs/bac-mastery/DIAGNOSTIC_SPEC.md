# BAC Mastery — Diagnostic Engine & Empirical Gap Analysis Specification

> **Document Version:** 1.0.0  
> **Phase:** 03 — Empirical Gap Analysis  
> **Status:** Implemented & Verified  
> **Core Philosophy:** *"ماشي واش تقرا. كيفاش توصل."* — From self-reported estimate to evidence-based learning data.

---

## 1. Executive Summary & Mission

BAC Mastery does not treat students as passive consumers of video lessons or generic quiz takers. Its fundamental pedagogical chain is:

$$\text{Goal} \longrightarrow \text{Diagnostic} \longrightarrow \text{Gap} \longrightarrow \text{Roadmap} \longrightarrow \text{Mission} \longrightarrow \text{Practice} \longrightarrow \text{Error} \longrightarrow \text{Repair} \longrightarrow \text{Retest} \longrightarrow \text{Mastery}$$

The **Diagnostic Engine** replaces subjective self-assessment with objective, empirical learning evidence. It answers:
1. What does the student actually know? (*Knowledge*)
2. What does the student truly understand? (*Understanding*)
3. Can the student apply formulas without mechanical errors? (*Application*)
4. Does the student adhere to the official Algerian BAC correction rubrics? (*Methodology*)
5. How efficiently do they solve under time constraints? (*Speed*)
6. Are they aware of what they know and do not know? (*Metacognitive Calibration*)
7. Where is the real academic bottleneck? (*Empirical Bottleneck*)
8. What single, actionable micro-mission should they complete first? (*First Recommended Mission*)

---

## 2. The 6 Cognitive Dimensions

Every diagnostic interaction is measured across six cognitive dimensions:

| Dimension | Arabic Definition | Focus in Algerian BAC |
| :--- | :--- | :--- |
| **Knowledge** | استرجاع المعارف | Precise formulas, definitions, units, and theorems. |
| **Understanding** | الفهم والتفسير | Underlying physical/biological/mathematical mechanisms, causal reasoning. |
| **Application** | التطبيق والحساب | Algebraic calculation, formula execution, trigonometric projection. |
| **Methodology** | المنهجية الرسمية | Rigorous written proofs, document exploitation (SVT), official rubrics. |
| **Speed** | إدارة الوقت | Execution velocity relative to question weight ($\le 1.2\times$ baseline). |
| **Confidence** | ثقة التلميذ | 5-point metacognitive calibration scale distinguishing certainty from guessing. |

---

## 3. Pilot Question Pack: Sciences Expérimentales (15 Questions)

The pilot pack tests the core triad of Algerian **Sciences Expérimentales** with high-yield syllabus topics:

### 3.1 Mathematics (5 Questions)
1. **`math-se-01` (Knowledge):** Composite exponential derivative $(e^{u(x)})' = u'(x)e^{u(x)}$. Trap: chain rule omission.
2. **`math-se-02` (Understanding):** Intermediate Value Theorem (TVI). Trap: confusing existence condition ($f(a) \cdot f(b) < 0$) with uniqueness condition (strict monotonicity).
3. **`math-se-03` (Application):** Limit computation with growth comparison ($\lim_{x \to +\infty} \frac{e^x - 3x}{x^2+1}$). Trap: denominator power dominance misconception.
4. **`math-se-04` (Application):** Recurrent sequence limit $u_{n+1} = \frac{1}{2}u_n + 3 \implies L = 6$. Trap: ignoring recurrence factor.
5. **`math-se-05` (Methodology):** Relative position protocol between curve $(C_f)$ and asymptote $(\Delta): y = ax+b$. Trap: substituting graphical reading for algebraic sign study.

### 3.2 Physics-Chemistry (5 Questions)
1. **`phys-se-01` (Knowledge):** Dipole RC time constant $\tau = RC$, dimensional analysis $[\tau] = T$ (seconds). Trap: frequency unit (Hz) confusion.
2. **`phys-se-02` (Understanding):** Radioactive half-life $t_{1/2} = \frac{\ln(2)}{\lambda}$. Trap: assuming total decay occurs at $2 \times t_{1/2}$.
3. **`phys-se-03` (Application):** Chemical reaction kinetics half-reaction time $t_{1/2}$ ($x(t_{1/2}) = x_{\max}/2$). Trap: linear rate division.
4. **`phys-se-04` (Application):** Newton's 2nd Law on inclined plane ($a = g \sin\alpha = 5\text{ m/s}^2$). Trap: cosine projection error.
5. **`phys-se-05` (Methodology):** Parallel tangents method in pH-metric titration. Trap: dogmatic belief that equivalence point is always at $pH = 7$.

### 3.3 Natural Sciences / SVT (5 Questions)
1. **`snv-se-01` (Knowledge):** Protein synthesis compartments (transcription in nucleus, translation in cytoplasm). Trap: cellular compartment inversion.
2. **`snv-se-02` (Understanding):** Thermal denaturation at $70^\circ\text{C}$ (irreversible) vs cold inactivation (reversible). Trap: assuming thermal denaturation can be undone by cooling.
3. **`snv-se-03` (Application):** Humoral immune response (antibodies form immune complexes for phagocytosis). Trap: assuming antibodies directly enzymatically lyse antigens.
4. **`snv-se-04` (Application):** Action potential ionic mechanisms (rapid depolarization caused by voltage-gated $Na^+$ influx). Trap: phase inversion with $K^+$.
5. **`snv-se-05` (Methodology):** Official document exploitation rubric (Document presentation $\to$ comparative analysis with numerical values $\to$ deduction $\to$ structured synthesis). Trap: rote memorization recitation without document data.

---

## 4. Metacognitive Calibration Engine

After selecting an option, students rate their confidence on an integer scale $1 \dots 5$:
- **1:** ما كنتش واثق (تخمين / hasard)
- **2:** ثقة ضعيفة (faible certitude)
- **3:** متوسط (moyenne)
- **4:** واثق (confiant)
- **5:** واثق بزاف (très confiant)

### The Calibration Matrix

$$\begin{array}{c|c|c}
& \textbf{Correct Answer} & \textbf{Wrong Answer} \\
\hline
\textbf{High Confidence (4–5)} & \text{Mastered Concept (معرفة متمكنة)} & \mathbf{Critical\ Misconception\ (فخ\ مفاهيمي\ حرج)} \\
\hline
\textbf{Low Confidence (1–2)} & \text{Underconfident / Lucky Guess} & \text{Recognized Academic Gap (فجوة معترف بها)} \\
\end{array}$$

- **`uncalibrated_severe`:** $\ge 3$ high-confidence wrong answers. Highlights silent traps that destroy BAC grades.
- **`overconfident`:** Normalized confidence exceeds empirical accuracy by $> 20\%$.
- **`underconfident`:** Empirical accuracy exceeds confidence by $> 20\%$.
- **`well_calibrated`:** Balanced awareness ($|\text{confidence} - \text{accuracy}| \le 20\%$).

---

## 5. Speed Profiles & Thresholds

Response times are benchmarked against question expected duration ($T_{\text{expected}}$):
- **Fast:** $T < 0.8 \times T_{\text{expected}}$
- **Normal:** $0.8 \times T_{\text{expected}} \le T \le 1.2 \times T_{\text{expected}}$
- **Slow:** $1.2 \times T_{\text{expected}} < T \le 1.8 \times T_{\text{expected}}$
- **Very Slow:** $T > 1.8 \times T_{\text{expected}}$

---

## 6. Empirical Scoring & Coefficient Safety

### 6.1 Observed Diagnostic Band (0–100%)
Accuracy per subject is weighted by official Algerian BAC coefficients:
$$\text{ObservedScore} = \frac{\sum (\text{Accuracy}_s \times \text{Coeff}_s)}{\sum \text{Coeff}_s}$$

Qualitative Bands:
- **$\ge 85\%$:** تحكم ممتاز واستعداد منهجي متقدم
- **$70\% - 84\%$:** تحكم جيد مع بعض النقائص الموضعية
- **$50\% - 69\%$:** مستوى متوسط يحتاج تثبيت المنهجية
- **$35\% - 49\%$:** فجوات معرفية وتطبيقية تتطلب معالجة عاجلة
- **$< 35\%$:** هشاشة تأسيسية تتطلب إعادة بناء القاعدة

### 6.2 Strict Coefficient Safety
- In `src/lib/constants/streams.ts`, `technique_math` NEVER defaults to `mechanical_eng` without an explicit specialty.
- Calling `getStreamSubjects("technique_math")` returns only the 8 base common subjects unless an explicit specialty is provided, preventing coefficient contamination.

---

## 7. Discrepancy & Bottleneck Resolution

### 7.1 Self-Estimate vs Observed Reality
$$\Delta = \text{SelfEstimate}_{0-20} - \left(\frac{\text{ObservedScore}_{0-100}}{5}\right)$$
- **Aligned:** $|\Delta| \le 2.0$ pts
- **Overestimated:** $\Delta > 2.0$ pts
- **Underestimated:** $\Delta < -2.0$ pts

### 7.2 Empirical Bottleneck Detection
$$\text{Vulnerability} = (100 - \text{Accuracy}_s) \times \text{Coeff}_s + (\text{HighConfidenceTraps}_s \times 20)$$
The subject with maximum vulnerability is declared the primary bottleneck, and its lowest cognitive dimension determines the first micro-mission.

---

## 8. Verification & Test Architecture

The engine is verified through 18 standalone automated test suites in `scripts/test-diagnostic.mjs`:
1. Question Pack Completeness (15 questions, 4 dimensions).
2. Speed classification boundaries ($0.8\times, 1.2\times, 1.8\times$).
3. Metacognitive calibration category assignments.
4. Misconception trap metadata validation.
5. Subject score breakdown accuracy.
6. Coefficient-weighted observed score calculation.
7. Discrepancy category evaluation.
8. Empirical bottleneck prioritization.
9. Deterministic first mission generation.
10. Technique Math coefficient safety verification.
11. Pilot Coverage Safety Check (`coverage: "pilot"`, `source: "diagnostic"`).
12. Non-Overclaiming Guarantee (complete absence of `predictedBACScore`).
13. Technique Math Specialty Isolation Verification (no default mechanical engineering).
14. Subject Sample Size Qualitative Signal Bands (0–34, 35–49, 50–69, 70–84, 85–100).
15. Preliminary Bottleneck Candidate Designation (`isPreliminary: true`).
16. Product Speed Benchmark Framing (`expectedSeconds` as product benchmark).
17. Possible Misconception Signal Inference (`suspectedErrorType`).
18. Roadmap Integration Safety & Untested Subject Preservation.

---

## 9. Current Limitations

To maintain absolute pedagogical and statistical honesty, the BAC Mastery Diagnostic Engine explicitly acknowledges the following structural limitations:

1. **Small Question Sample Size per Subject:**  
   The pilot pack contains 5 questions per subject (15 questions total). While carefully authored to isolate key cognitive dimensions, this sample size cannot provide high-precision decimal measurements (e.g., claiming 73.4% mastery). Results are presented as qualitative signal bands to prevent false certainty.

2. **Formative Diagnostic Signal vs. Official BAC Grade Prediction:**  
   The system calculates an observed formative signal across tested subjects (`coreDiagnosticSignal`, 0–100%). It **NEVER** predicts a definitive BAC final grade (e.g., "You will get 14.8/20"). A prominent mandatory disclaimer is displayed in both Arabic and French on all diagnostic interfaces.

3. **Formative Heuristic Bands vs. Ministerial Cutoffs:**  
   The qualitative bands (*هش / يحتاج تأسيس*, *ضعيف*, *في طور البناء*, *جيد*, *قوي*) are internal product heuristics designed to prioritize first remediation missions, not ministerial evaluation scales or official baccalaureate grades.

4. **Product Solving Time Benchmarks vs. Official Exam Timing:**  
   The `expectedSeconds` parameter for each question represents an estimated product solving benchmark to assess fluency under digital conditions. It does not represent or replace ministerial exam time allowances.

5. **Tentative Misconception Signals vs. Psychological Proof:**  
   High-confidence incorrect selections indicate a "possible misconception signal" (`suspectedErrorType`), highlighting topics that warrant immediate attention. They are not treated as definitive psychological or cognitive diagnostic proof.

6. **Provisional Subject Coefficients:**  
   Coefficients defined in `src/lib/constants/streams.ts` are provisional operational defaults pending final ministerial circular cross-validation. They are flagged internally as provisional.

7. **Pilot Coverage Restricted to Core Triad:**  
   Coverage in Phase 03 is explicitly categorized as `coverage = "pilot"`, restricted to the core subjects of the *Sciences Expérimentales* stream (Mathematics, Physics-Chemistry, Natural Sciences). It does not assess language, literary, or philosophical subjects.

8. **Preservation of Untested Subject Self-Estimates:**  
   When diagnostic results are synchronized into the student's roadmap, only tested subjects receive diagnostic signal updates. Unexamined subjects (e.g., Arabic, Philosophy, Languages) strictly preserve their original onboarding self-estimates, maintaining baseline roadmap stability.
