# BAC Mastery — Adaptive Roadmap Engine Specification (Prompt 06)

## 1. Product Philosophy & Non-Negotiable Mission

> **"ماشي واش تقرا. كيفاش توصل."**  
> **From static checklist $\longrightarrow$ living adaptive decision engine.**

In typical learning platforms, a roadmap is merely a static syllabus or a passive dashboard showing past grades. In BAC preparation, students do not suffer from a lack of syllabi—they suffer from decision paralysis, premature topic jumping, and unresolved procedural misconceptions.

BAC Mastery transforms the roadmap into an authoritative, living decision engine:

$$\text{Goal} \longrightarrow \text{Diagnostic} \longrightarrow \text{Gap} \longrightarrow \text{Bottleneck} \longrightarrow \text{Mission} \longrightarrow \text{Practice} \longrightarrow \text{Error} \longrightarrow \text{Repair} \longrightarrow \text{Retest} \longrightarrow \text{Mastery Evidence} \longrightarrow \text{Roadmap Reordering} \longrightarrow \text{Next Best Mission}$$

The roadmap continuously and deterministically answers two vital questions:
1. **What should this student work on NEXT?**
2. **WHY this specific mission right now?**

---

## 2. Architectural Separation: Pure Engine vs. Storage Adapter

To guarantee testability, resilience, and determinism, the system strictly separates pure decision logic from environment side effects:

```
[ LocalStorage / Browser State ]
              │
              ▼
[ Adapter: src/lib/roadmap/index.ts ]  (Reads storage, builds AdaptiveRoadmapInput)
              │
              ▼
[ Pure Engine: src/lib/roadmap/engine.ts ]  (100% Pure, Zero side-effects, Deterministic)
              │
              ▼
[ Output: AdaptiveRoadmapState ]  (Consumed by UI: src/app/roadmap/page.tsx)
```

- **`src/lib/roadmap/engine.ts`**: Pure functional domain engine. No `localStorage`, no `window`, no network requests, no `Math.random()`, no non-deterministic timers. Same input $\implies$ exact same roadmap output.
- **`src/lib/roadmap/index.ts`**: Browser boundary adapter that safely aggregates data from localStorage keys (`missions`, `errors`, `mastery`, `diagnostic`, `onboarding`) and invokes `buildAdaptiveRoadmap`.
- **`src/app/roadmap/page.tsx`**: Mobile-first, responsive presentation layer organized into 5 clear visual sections.

---

## 3. The 7-Tier Authoritative Priority Hierarchy

When deciding the next mission and upcoming queue, the engine evaluates evidence against a strict 7-tier hierarchy:

| Priority | Tier Name | Condition & Rule | Rationale Code |
| :---: | :--- | :--- | :--- |
| **1** | **Unfinished Learning Loops** | Any mission with `repair_needed` or `retest_ready`. Retest ready takes precedence over repair needed. **Never abandoned for higher coefficients.** | `continuation_retest` / `continuation_repair` |
| **2** | **Delayed `needs_more_work`** | Skills with two failed retest cycles are bounded and delayed to prevent cognitive fatigue. Scheduled only after fresh unmastered skills are addressed. | `delayed_needs_more_work` |
| **3** | **Recurring Errors** | Multiple errors with identical `suspectedErrorType` on the same skill. Engine prioritizes root cause remediation before random practice. | `recurring_error_cause` |
| **4** | **Weakest Cognitive Dimension** | Empirical bottleneck from diagnostic (`methodology`, `understanding`, `application`, or `knowledge`). Targets specific fragile dimensions. | `weakest_supported_dimension` |
| **5** | **Emerging Skills** | Initial practice answered correctly with high confidence. Prioritized for paired transfer verification to prove mastery. | `emerging_verification` |
| **6** | **Next Skill in Current Subject** | Sequential progression through unmastered skills in the active focus subject. | `next_subject_skill` |
| **7** | **Next Core Subject by Coefficient** | Transition to next unmastered subject ordered descending by official BAC coefficient ($6 \to 5 \to \dots$). | `next_core_subject` |

### Invariant: Coefficients as Planning Signals, NOT Error Overrides
Official BAC coefficients (e.g. Natural Sciences Coef 6, Math Coef 5, Physics Coef 5) are used **strictly as planning signals for clean unstarted subjects (Priority 7)**. A high coefficient NEVER overrides an active error, an in-progress repair, or a scheduled retest in another core subject. An unclosed learning loop always takes precedence.

---

## 4. Honest Untested Subject Preservation

Untested curriculum subjects (such as Arabic, Philosophy, French, English, Islamic Studies, History-Geography in the Science stream pilot) must never be penalized:

- **Status**: `not_assessed`
- **Evidence Level**: `none`
- **Metric Chips**: Neutral, distinct badges indicating *"Not yet assessed"*
- **Strict Rule**: Untested subjects are **never** assigned 0%, never labeled as weak, and never given false diagnostic precision.

---

## 5. Structured Bilingual Mission Rationale

Every single recommended mission includes a structured, human-readable explanation grounding the decision in student evidence:

```typescript
export interface MissionRationale {
  reasonCode: MissionReasonCode;
  priority: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  reasonLabel_ar: string;
  reasonLabel_fr: string;
  evidence_ar: string;
  evidence_fr: string;
  shortExplanation_ar: string;
  shortExplanation_fr: string;
}
```

The UI prominently surfaces:
1. **Why this mission?** (Category badge and reason label)
2. **Context explanation** (Plain conversational rationale)
3. **Evidence signal** (Specific diagnosis or error history triggering the recommendation)

---

## 6. The 4-Stage Learning Journey Map

The roadmap visualizes the student's active cognitive stage:

$$\text{01 Fix (الترميم)} \longrightarrow \text{02 Verify (التحقق)} \longrightarrow \text{03 Demonstrate (الإثبات)} \longrightarrow \text{04 Move Forward (التقدم)}$$

- **Stage 1: Fix (`fix`)**: Active when `status === "repair_needed"`. Student has an identified misconception requiring pedagogical repair.
- **Stage 2: Verify (`verify`)**: Active when `status === "retest_ready"`. Student has completed repair steps and must validate on a paired twin variant.
- **Stage 3: Demonstrate (`demonstrate`)**: Active during initial practice of an emerging or unvalidated skill.
- **Stage 4: Move Forward (`move_forward`)**: Active when previous loops are closed and the student advances to the next curriculum milestone.

---

## 7. Deterministic Queue Simulation

The roadmap displays 2 to 4 upcoming queued missions (`queuedMissions`). These are computed by iteratively simulating the resolution of preceding missions through pure functional recursion, guaranteeing a predictable and transparent view of what lies ahead without mutating actual student state.

---

## 8. Honest Confidence Standard

- **Roadmap Confidence**: Explicitly marked as `"pilot"`.
- **Transparency Disclosure**: Explicitly informs the student that recommendations are derived from pilot diagnostic data covering the 3 core scientific disciplines.
- **No Overclaiming**: The codebase contains zero instances of `predictedBACScore` or guaranteed grades.
