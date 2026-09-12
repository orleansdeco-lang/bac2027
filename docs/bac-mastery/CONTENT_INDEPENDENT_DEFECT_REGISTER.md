# BAC Mastery — Content Independent Defect Register
## Adversarial Audit Findings (Prompt 15.1)

**Audit Date:** 2026-09-12  
**Baseline Commit:** `cb447e08ccbf99961bfe4947674d5572effce25c`  
**Auditor Role:** Independent Senior Educational Auditor & Scientific Fact-Checker  

---

## 1. Summary of Defect Classifications

| Severity | Count | Resolved | Description |
| :--- | :---: | :---: | :--- |
| **CRITICAL** | 0 | 0 | Scientifically or mathematically false claims, wrong answers that teach false concepts. |
| **MAJOR** | 0 | 1 | Methodological or pedagogical weaknesses, semantic duplicate between worked example & retest (DEF-001 RESOLVED). |
| **MINOR** | 3 | 0 | Slight formatting, passive active-recall exposure, or single-step micro-drill. |
| **UNKNOWN** | 1 | 0 | Formal current BAC 2027 ministerial circular status for coefficient weights. |

---

## 2. Itemized Defect Register

### DEF-001
- **Severity:** `MAJOR`
- **Skill:** `math_exponential_properties_equations`
- **Content Type:** Retest Question (`rq-math-exp-eq-01`) vs. Worked Example
- **Exact Issue:** The Retest question previously asked to solve $e^{2x} - 3e^x - 4 = 0$, which was the exact same equation solved step-by-step in the Worked Example ($e^{2x} - 3*e^x - 4 = 0$).
- **Why It Matters:** A student who completes the lesson could answer the retest simply by recalling the worked example's solution ($\ln(4)$) rather than demonstrating independent mastery of auxiliary quadratic substitution.
- **Evidence:** 
  - Worked Example problem: `حل في R المعادلة: e^(2x) - 3*e^x - 4 = 0`
  - Previous Retest prompt: `[إعادة اختبار] حلول المعادلة e^(2x) - 3e^x - 4 = 0 في ℝ هي:`
- **Recommended Correction:** Replace the retest equation with an independent quadratic exponential problem with different coefficients and roots, e.g., $2e^{2x} - 5e^x - 3 = 0$ (yielding $X=3 \implies x=\ln(3)$ and rejecting $X=-1/2$).
- **Status:** **RESOLVED**
- **Date Resolved:** 2026-09-12
- **Resolution Description:** Replaced `rq-math-exp-eq-01` equation in `src/data/curriculum/practice-questions.ts` with independent quadratic exponential equation:
  $$2e^{2x} - 5e^x - 3 = 0$$
  This equation is fully distinct from the worked example ($e^{2x} - 3e^x - 4 = 0$) and practice question 1 ($e^{2x} - 5e^x + 6 = 0$).
  - Characteristic quadratic: $2X^2 - 5X - 3 = 0$, $\Delta = 49 = 7^2$.
  - Roots: $X_1 = -1/2$ (strictly rejected as $e^x > 0$), $X_2 = 3$ (accepted $\implies x = \ln(3)$).
  - Unambiguous correct answer: `opt-1` ($S = \{\ln(3)\}$ فقط).
  - Retest independence verified by independent auditor (`scripts/test-content-independent-truth-audit.mjs` — 29/29 assertions passed, 100%).
  - End-to-end verified in real Google Chrome mobile emulation (390 × 844) with full interactive solve and screenshot evidence (`docs/bac-mastery/screenshots/07_mobile_new_retest_rendered.png`).

---

### DEF-002
- **Severity:** `MINOR`
- **Skill:** Across all 31 skills
- **Content Type:** Lesson Quick Recall (`quickRecallPrompt_ar` & `quickRecallAnswer_ar`)
- **Exact Issue:** Quick recall answers are statically colocated in the data structure and rendered inline. Without an interactive frontend blur/accordion reveal, students may passively read the answer immediately after reading the prompt.
- **Why It Matters:** True retrieval practice (active recall) requires cognitive effort prior to seeing the solution.
- **Evidence:** Data structures store `quickRecallAnswer_ar` directly adjacent to `quickRecallPrompt_ar`.
- **Recommended Correction:** Ensure the UI presentation layer always conceals `quickRecallAnswer_ar` behind an explicit "Show Answer / Reveal" click trigger.
- **Status:** OPEN (UX/Pedagogical observation).

---

### DEF-003
- **Severity:** `MINOR`
- **Skill:** `physics_mass_defect_binding_energy`
- **Content Type:** Practice Question 1 (`pq-phys-mass-defect-01`)
- **Exact Issue:** The question contrasts Helium-4 ($E_l/A = 7.07\text{ MeV/nucleon}$) with Uranium-235 ($E_l/A = 7.59\text{ MeV/nucleon}$). While Uranium-235 is correctly more tightly bound per nucleon than Helium-4, Uranium-235 is fissile and generally described as an unstable heavy nucleus in common parlance.
- **Why It Matters:** Students might confuse "binding energy per nucleon stability" (where U-235 is higher than light nuclei) with "radioactive/fissile stability" (where U-235 undergoes fission).
- **Evidence:** Practice question prompt compares 4He and 235U.
- **Recommended Correction:** In future iterations, compare Iron-56 (peak of Aston curve) or Carbon-12 to avoid student confusion between nuclear binding energy and fission susceptibility.
- **Status:** OPEN (Pedagogical nuance).

---

### DEF-004
- **Severity:** `MINOR`
- **Skill:** Multiple skills in SNV and Physics repair guides
- **Content Type:** Repair Guide Micro-Drill (`microPracticePrompt_ar`)
- **Exact Issue:** Some micro-practice drills are concise single-step recall questions rather than multi-step remediation drills.
- **Why It Matters:** Students recovering from severe calculation or conceptual errors benefit from at least two progressive micro-drills before attempting the full retest.
- **Evidence:** Repair guides currently contain exactly 1 micro-drill prompt and solution.
- **Recommended Correction:** Expand micro-practice drills in a future content release to include 2 progressive drills (Level 1: Scaffolded, Level 2: Independent).
- **Status:** OPEN (Enhancement backlog).

---

### DEF-005
- **Severity:** `UNKNOWN / PROVISIONAL`
- **Skill:** Curriculum Stream Architecture
- **Content Type:** Stream Subject Coefficients (Math: 7, Physics: 6, SNV: 6)
- **Exact Issue:** While Math=7, Physics=6, and SNV=6 reflect the established historical Algerian BAC syllabus for Sciences Expérimentales, official executive circulars specifically designating BAC 2027 parameters have not yet been gazetted.
- **Why It Matters:** Claiming historical coefficients as definitive current law without an official circular date risks misinforming students if ministerial adjustments occur.
- **Evidence:** Documented in `src/lib/constants/streams.ts` as `Provisional — Pending Official Ministry Verification`.
- **Recommended Correction:** Retain the explicit label `OFFICIAL_HISTORICAL / PENDING CURRENT VERIFICATION` across all student-facing displays until the ministry issues the official 2027 decree.
- **Status:** MONITORED (Appropriately mitigated in codebase).
