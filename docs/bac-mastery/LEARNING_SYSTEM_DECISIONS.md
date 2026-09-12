# BAC Mastery — Learning System Architectural Decisions (ADRs)
**Phase:** Prompt 18.1  
**Status:** ACCEPTED & RATIFIED  

---

### ADR-01: Single Authoritative Roadmap Engine (Anti-Competition Rule)
- **Context**: As learning systems expand, there is a common architectural anti-pattern to introduce secondary AI recommendation agents, "smart suggestions", or parallel scheduling loops that contradict each other.
- **Decision**: All scheduling decisions must route through the single authoritative deterministic priority tree in `src/lib/roadmap/engine.ts`.
- **Rationale**: Students cannot trust an application that says "do Mission A" in one card and "do Mission B" in another. Determinism ensures that identical student evidence always produces the same unambiguous next best action.

---

### ADR-02: Strict Epistemic Differentiation: Signal vs. Practice Evidence vs. Mastery
- **Context**: Commercial edtech often treats completing a video, self-rating an understanding slider, or answering one practice item correctly as "100% mastery".
- **Decision**: The system strictly separates:
  - `SIGNAL`: Subjective or circumstantial (e.g. self-rating, video watch time).
  - `PRACTICE_EVIDENCE`: Objective correctness on initial problem.
  - `RETEST_EVIDENCE`: Validated solution on an unseen isomorphic twin question following error repair.
  - `TRANSFER_EVIDENCE`: Unassisted solution in a mixed or exam context.
  - `STABLE_MASTERY_EVIDENCE`: Repeated successful retrieval across expanding time intervals.
- **Rationale**: Prevents the fluency bias and false competence that causes students to fail when facing actual Algerian BAC exam papers.

---

### ADR-03: Evidence-Calibrated Spaced Review vs. Rigid Fixed Days (1/3/7/14/30)
- **Context**: Many apps hardcode Hermann Ebbinghaus intervals as universal rules.
- **Decision**: Intervals are initialized at 1.0 day and adaptively modulated by:
  - Retrieval correctness (failure drops interval to 1.0 day).
  - Confidence (1–5 scale adjusts growth factor between $1.2\times$ and $2.2\times$).
  - Response speed relative to expected benchmark.
  - Chronic past lapses and recurring error penalties.
- **Rationale**: Fixed days are crude heuristics; individual difficulty and student retention speed vary significantly across mathematical proofs and biological synthesis.

---

### ADR-04: Configurable Subject Methodology Profiles vs. Monolithic Pipeline
- **Context**: The initial prototype was built around STEM problem-solving. Forcing Philosophy, Islamic Studies, or Natural Sciences into an identical physics problem template degrades pedagogical quality.
- **Decision**: Implement 9 distinct `MethodologyFamily` profiles. For example:
  - *Natural Sciences*: Document Analysis $\to$ Causal Interpretation $\to$ Deduction $\to$ Structured Scientific Text.
  - *Philosophy*: Problematic $\to$ Thesis $\to$ Antithesis $\to$ Synthesis $\to$ Methodology of the 4 Essay Types.
- **Rationale**: Respects the authentic nature of each discipline while preserving the universal meta-loop (Goal $\to$ Diagnostic $\to$ Practice $\to$ Error $\to$ Repair $\to$ Retest $\to$ Review).

---

### ADR-05: Decoupling Educational Content Language from UI Localization
- **Context**: A student may prefer a French UI while studying Arabic Literature, or an Arabic UI while studying French / English / Spanish.
- **Decision**: UI language preference (`locale = "ar" | "fr"`) controls navigation, shells, and interface controls. Educational content language is defined per subject:
  - Sciences, Math, History-Geo, Philosophy, Islamic Studies, Technology $\to$ Arabic-first.
  - French subject $\to$ French content.
  - English subject $\to$ English content.
  - Third Language $\to$ Spanish / German / Italian.
- **Rationale**: Prevents awkward machine translation of foreign language exams and honors official Algerian curriculum standards.

---

### ADR-06: Provisional Status of Algerian BAC Stream Coefficients
- **Context**: BAC coefficients are established by ministerial decrees and may be subject to curricular adjustments across academic years.
- **Decision**: All stream coefficients in constants and data models are strictly categorized as `provisional_benchmark`. The system algorithmically relies on `subject.weight` rather than hardcoded assumptions, and no coefficient is labeled as "officially verified current" without citing the latest verified executive decree.
- **Rationale**: Protects institutional credibility and ensures the engine functions correctly even if ministerial coefficient weights change.

---

### ADR-07: Maximum 2-Cycle Failure Safeguard on Retests
- **Context**: When a student fails a retest repeatedly, automated systems often trap them in an infinite loop of frustrating retries.
- **Decision**: A student is permitted a maximum of 2 retest attempts per error cycle. On the second failure, the skill status transitions to `needs_more_work`, is removed from immediate daily blocking, and is rescheduled for delayed remedial recovery.
- **Rationale**: Preserves student psychological momentum and prevents catastrophic backlog paralysis.

---

### ADR-08: Non-Clinical Energy Calibration & Non-Punitive Recovery Mode
- **Context**: Traditional planners shame students with broken streaks and accumulated task backlogs when life events or fatigue disrupt study.
- **Decision**:
  - Daily checkins use simple non-clinical states (`good`, `normal`, `tired`, `stressed`).
  - Low energy scales down cognitive load (assigning 15-minute reviews instead of complex 45-minute problem solving).
  - Recovery mode resets momentum immediately by offering one achievable next action without backlog shaming.
- **Rationale**: Long-term BAC preparation is an endurance race; sustainability, rest, and emotional safety are mandatory for peak exam performance.
