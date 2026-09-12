# BAC Mastery — Independent Auditor Changes Log
## Verification Adjustments & False Positive Documentation (Prompt 15.1)

**Date:** 2026-09-12  
**Auditor:** Independent Educational & QA Auditor  

In strict accordance with Rule 1, Rule 2, and Rule 22:
- No test assertion was weakened.
- Observed defects were NOT converted into passes.
- Any change to the independent verifier script was strictly limited to correcting demonstrably false positive script assertions (property name typos in the auditor itself) and is fully recorded below with evidence.
- Real defects (such as DEF-001) remain active and failing.

---

### Change Record 1: Suite C — Bloom Taxonomy Property Name & Case

- **Original Test Assertion:**
  ```javascript
  const validBlooms = new Set(["Remember", "Understand", "Apply", "Analyze", "Evaluate", "Create"]);
  let bloomsValid = true;
  for (const obj of PROMPT11_LEARNING_OBJECTIVES) {
    if (!validBlooms.has(obj.bloomTaxonomyLevel)) bloomsValid = false;
  }
  assert(bloomsValid, "All learning objectives specify a recognized Bloom's taxonomy behavioral level");
  ```
- **Why It Was Incorrect:**
  In `src/domain/content/types.ts` (`LearningObjective` interface) and `mappings.ts`, the property is named `bloomLevel` (type `BloomTaxonomyLevel = "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create"`), stored in lowercase. The auditor mistakenly checked `obj.bloomTaxonomyLevel` with capitalized string literals.
- **Evidence:**
  `PROMPT11_LEARNING_OBJECTIVES.map(o => o.bloomLevel)` outputs: `['apply', 'understand', 'analyze', 'evaluate']`.
- **Correction Applied:**
  Updated property accessor to `obj.bloomLevel` and normalized matching against lowercase standard levels: `new Set(["remember", "understand", "apply", "analyze", "evaluate", "create"])`.

---

### Change Record 2: Suite F — Formula Corpus Scope & Spacing

- **Original Test Assertion:**
  ```javascript
  const textCorpus = PROMPT12_LESSONS.map((l) => l.coreConcept_ar).join(" ");
  for (const pat of formulaPatterns) {
    if (!textCorpus.includes(pat) && !textCorpus.includes(pat.replace("_", ""))) {
      formulasSound = false;
    }
  }
  ```
- **Why It Was Incorrect:**
  The auditor restricted `textCorpus` to only `coreConcept_ar`, ignoring `workedExample` and `simpleExplanation_ar` where detailed algebraic derivations reside (e.g. `e^(2x)` in worked examples, `E/RC` without spaces in differential equations).
- **Evidence:**
  `E/RC` is present in differential equations without whitespace; `e^(2x)` is present in worked example problems.
- **Correction Applied:**
  Expanded `textCorpus` to encompass the complete lesson (`coreConcept_ar`, `simpleExplanation_ar`, and `workedExample`), and normalized formula token patterns (`E/RC`).

---

### Defect Preserved (NOT Modified to Pass)

- **Suite I (Adversarial Equation Duplicate Scan):**
  Assertion `assert(!isExpOverlap, ...)` was **KEPT INTACT AND UNMODIFIED**.
  The verifier detected `DEF-001` (`rq-math-exp-eq-01` duplicates the worked example equation $e^{2x} - 3e^x - 4 = 0$). This failure was **NOT** masked or modified to pass. It is preserved as a verified finding and recorded in the Defect Register.
