# BAC Mastery — Prompt 09: UX Refinement & Trust Pass
**"Make the existing product clearer, calmer, more actionable — NOT bigger."**

---

## 1. UX Problems Identified
Based on mobile inspection and real user flow analysis:
1. **Ambiguous Primary Action on Home Page**:
   - The landing page presented a generic entry point regardless of the student's actual learning state.
   - Returning students with in-progress missions or existing roadmaps were not guided directly to their next high-leverage step.
2. **Roadmap Information Overload & High-Pressure Visuals**:
   - The roadmap opened with distracting neon visualizer elements and high-stress progress metrics (such as `2/31`), shifting attention toward the long journey rather than the immediate next action.
   - The visual hierarchy did not prioritize the single active mission above secondary information.
3. **Unverified Authority Claims & Overclaiming**:
   - Phrasing such as *"وفق معايير التصحيح الوزاري"*, *"دليل التصحيح الوزاري"*, and *"مسار التعلم النموذجي"* gave an unverified impression of official ministerial affiliation and certification.
   - High-anxiety starting score displays risked being misinterpreted as definitive BAC grade predictions.
4. **Linguistic & Tone Dissonance**:
   - Visible English labels like *"Adaptive Path"* stood out against the Arabic interface.
   - The tone occasionally drifted into rigid academic or bureaucratic jargon rather than the warm, calm, supportive voice of an experienced Algerian mentor (*"ماشي واش تقرا. كيفاش توصل."*).

---

## 2. Changes Made
1. **Dynamic Smart Primary CTA on Home Page**:
   - Implemented state-aware CTA calculation from persisted LocalStorage records:
     - **No Profile**: Displays `"ابني خريطتي →"` pointing to `/onboarding`.
     - **Profile Exists, No Learning Activity**: Displays `"شوف خريطتي →"` pointing to `/roadmap`.
     - **Active In-Flight Mission**: Displays `"نكمل مهمتي →"` pointing directly to `/mission/${activeMissionId}`.
     - **Learning Activity / Mastery Progress**: Displays `"نكمل خريطتي →"` pointing to `/roadmap`.
2. **Action-First Roadmap Hierarchy**:
   - Completely restructured `/roadmap` into 6 calm, focused sections:
     - **Section 1 (Goal & Starting Indicator)**: Clean target score display (`16.00/20`), soft starting indicator (`مؤشر الانطلاق: 12.0/20`), transparent disclaimer (*"مؤشر أولي مبني على بياناتك الحالية، وليس توقعاً لعلامة البكالوريا"*), and approximate distance (*"المسافة إلى هدفك: حوالي 4.0 نقاط"*).
     - **Section 2 (Current Action - `مهمتك الآن`)**: Visually dominant card with a 52px+ prominent primary button to start or resume the active mission.
     - **Section 3 (Why This Mission? - `علاش هذي المهمة؟`)**: Clear, reassuring explanation of the specific weakness identified and the remediation plan.
     - **Section 4 (What Comes Next - `بعدها`)**: 2 to 4 queued missions clearly marked as dynamic and subject to change based on practice evidence.
     - **Section 5 (The Road & Progress Summary)**: Refined `RoadVisualizer` and a humanized foundation counter (*"2 مهارات مثبتة من أصل 31 مهارة في خريطة التعلم"*).
     - **Section 6 (Curriculum Map & Transparent Limitations)**: Multi-subject curriculum catalog and explicit boundaries notice.
3. **Terminology Refinements**:
   - Replaced *"مسار التعلم النموذجي"* with *"خريطتك التعليمية"*.
   - Replaced English *"Adaptive Path"* with Arabic *"مسار متكيف"*.

---

## 3. Trust & Claim Changes
- **Ministerial Rubric References Purged**:
  - Removed all occurrences of *"معايير التصحيح الوزاري"*, *"دليل التصحيح الوزاري"*, *"سلم تنقيط البكالوريا"*, and *"barème officiel"* from curriculum skills, diagnostic engines, mission prompts, practice questions, and dictionaries.
  - Replaced with honest, transparent phrasing focusing on methodological rigor and syllabus standards (*"خطوات الإجابة المنهجية"*, *"طريقة الحل النموذجية"*, *"معايير المنهاج"*).
- **Starting Level Disclaimer**:
  - Added an explicit disclaimer clarifying that initial scores are starting benchmarks for diagnostic orientation, never a mathematical forecast of the official BAC result.

---

## 4. Roadmap Hierarchy Changes
| Previous Structure | Refined Action-First Structure |
| :--- | :--- |
| Cluttered dashboard with scattered metrics | 1. Your Goal & Soft Starting Baseline |
| Equal visual weight between active and queued items | 2. Your Current Next Action (`مهمتك الآن` - 52px+ primary CTA) |
| System explanation placed at bottom | 3. Why This Mission? (`علاش هذي المهمة؟`) |
| Static list appearance | 4. What Comes Next (`بعدها` - dynamic queue) |
| High-intensity neon roadmap & `2/31` pressure counter | 5. The Road (calm visualizer) & Progress (`2 مهارات مثبتة من أصل 31 مهارة`) |
| Unclear scope | 6. Curriculum Map & Pilot Limitations Notice |

---

## 5. CTA State Logic
The primary CTA on the landing page is evaluated synchronously upon mounting using pure client-side inspection:
```typescript
if (!profile) {
  return { label: "ابني خريطتي →", href: "/onboarding", subtext: "ابدأ بتحديد شعبتك وهدفك في 3 دقائق" };
}
if (activeMissionId) {
  return { label: "نكمل مهمتي →", href: `/mission/${activeMissionId}`, subtext: "عندك مهمة نشطة في طور الإنجاز" };
}
if (masteryCount > 0 || practiceCount > 0 || diagnosticResults) {
  return { label: "نكمل خريطتي →", href: "/roadmap", subtext: "تابع تقدمك في المهارات المتبقية" };
}
return { label: "شوف خريطتي →", href: "/roadmap", subtext: "اكتشف أول محطة في مسارك التعليمي" };
```

---

## 6. Copy Changes
- Transformed prompts and feedback into a calm, reassuring Algerian mentor tone:
  - *"ماشي واش تقرا. كيفاش توصل."*
  - *"لقينا عندك إشارة ضعف في هذي المهارة. نصلحوها، ومن بعد نختبرو واش ثبت فعلاً."*
  - *"الهدف اللي اخترته"*
  - *"مؤشر الانطلاق"*
  - *"المسافة إلى هدفك: حوالي..."*
- Preserved all authoritative mastery test tokens:
  - `"✓ تم إثبات التحكم"` / `"Maîtrise démontrée"`
  - `"تحتاج إلى عمل إضافي"` / `"needs_more_work"`
  - `"عندك خطأ يحتاج إصلاح"` / `"repair_needed"`

---

## 7. Visual Changes
- **Calmer Palette & Contrast**:
  - Removed glowing radial halos, neon borders, and pulsating animations (`animate-ping`, `animate-pulse`).
  - Swapped high-contrast multi-colored spines for a muted slate spine (`bg-slate-700/60`).
- **Clear Visual Dominance**:
  - The `مهمتك الآن` action card uses a high-contrast emerald action button (`min-h-[52px]`) with prominent typography, making the next step unmissable on mobile screens (390×844 base).
- **Reduced Anxiety Metrics**:
  - Converted fraction-based progress counters (`2/31`) into descriptive achievement statements (*"2 مهارات مثبتة من أصل 31 مهارة في خريطة التعلم"*).

---

## 8. What Was Intentionally NOT Changed
- **Zero Architecture Rebuild**:
  - `src/lib/roadmap/engine.ts` remains the single authoritative decision engine (`getComputedAdaptiveRoadmap`, `getNextBestMission`).
  - `src/lib/mission/engine.ts` and `src/lib/diagnostic/` logic remain completely intact.
- **Zero New Scope**:
  - No backend, no Supabase, no external authentication.
  - No AI APIs, no spaced repetition algorithms, no BEM streams.
  - No gamification badges, leaderboards, or streak mechanics.

---

## 9. Test Results
All automated test suites verified and passing with 100% success rate:
- `test-onboarding.mjs`: 3/3 passed
- `test-diagnostic.mjs`: 18/18 passed
- `test-missions.mjs`: 17/17 passed
- `test-mastery.mjs`: 28/28 passed
- `test-roadmap.mjs`: 23/23 passed
- `test-content-model.mjs`: 20/20 passed
- **Total: 109 / 109 automated tests passing**.
- `tsc --noEmit`: 0 errors.

---

## 10. Remaining Limitations
1. **Curriculum Scope**: Pilot curriculum is focused on BAC Sciences Expérimentales (3AS), spanning 31 skills across 14 topics in Mathematics, Physics-Chemistry, and Natural Sciences.
2. **Client-First Persistence**: Learning state is persisted locally in the browser's `localStorage` (device-scoped).
3. **Adaptive Signals**: Mastery calibration is driven by explicit practice and twin retest evidence, not statistical guessing or unverified extrapolation.
