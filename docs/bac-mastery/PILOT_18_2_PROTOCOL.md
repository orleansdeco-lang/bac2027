# BAC Mastery — Pilot Observation Protocol
**Controlled Real-Student Validation (Prompt 18.2 § 6)**

---

## Observer Golden Rules
1. **Watch and Listen**: Your role is to observe natural student behavior. Never prompt, coach, or explain what buttons to press unless the student is completely stuck for over 3 minutes.
2. **Neutral Demeanor**: Do not show disappointment if a student misses a question, or excessive praise if they answer correctly.
3. **No Solution Leaks**: Never give away mathematical, physical, or biological answers.
4. **Record Timestamped Friction**: Document the exact screen, question ID, and word whenever hesitation, confusion, or visual searching occurs.

---

## Stage-by-Stage Protocol

### Stage A: Before Use (Setup & Context Setting)
1. Provide the student with an unmanaged device (smartphone or laptop) with a standard web browser (Chrome or Safari).
2. Open the browser to the landing page URL (`/`).
3. State the single orientation prompt:
   > *"هذا موقع لمساعدة تلاميذ البكالوريا في مراجعة مادة العلوم، الرياضيات، والفيزياء. ادخل وسجل حسابك، واستعمل الموقع وكأنك وحدك في الدار. إذا كان عندك أي استفسار أو حاجة ما فهمتهاش، قلها بصوت عالي."*
4. Start stopwatch / session recording.

### Stage B: First Session (Auth, Trial & Onboarding)
1. **Landing & Auth**:
   - Observe if the student clicks "ابدأ التجربة المجانية" or "تسجيل الدخول".
   - Note if password validation or confirmation fields create hesitation.
2. **48-Hour Free Trial Banner**:
   - Observe whether the student notices the 48-hour trial notification upon entering `/dashboard`.
   - Ask neutrally: *"واش فهمت من هذي الرسالة؟"*
3. **Strategic Onboarding**:
   - Observe stream selection (Sciences Expérimentales), target score setting (e.g. 16.0), available time, and energy.
   - Record time taken to complete `/onboarding`.

### Stage C: Diagnostic Assessment
1. Let the student navigate to `/diagnostic`.
2. Crucial Invariant: The diagnostic is a **gap signal detector**, NOT a BAC score predictor.
3. Observe:
   - Does the test feel intimidating or exhausting?
   - Do they guess randomly, or solve on draft paper?
   - How do they react to `/diagnostic/results`?
   - Ask neutrally: *"واش حسيت بهذي النتيجة؟ واش تعبر على مستواك؟"*

### Stage D: Discovering the Next Action ("واش ندير دروك؟")
1. Return student to `/dashboard` or `/roadmap`.
2. **DO NOT EXPLAIN WHAT TO DO**.
3. Pause and ask:
   > *"واش راك حاب تدير دروك؟ واش هي الخطوة الجاية؟"*
4. Classify response:
   - `NEXT_ACTION_CLEAR`: Identifies the top recommended mission card immediately (< 5 seconds).
   - `NEXT_ACTION_DISCOVERED`: Explores other cards, reads roadmap, then identifies it (< 30 seconds).
   - `NEXT_ACTION_UNCLEAR`: Does not know where to click without observer assistance (> 60 seconds).

### Stage E: The First Mission Loop (Learn & Active Recall)
1. Student enters `/mission/[missionId]`.
2. Observe lesson reading behavior:
   - Do they skim, or read line-by-line?
   - Do they read the "لماذا هذه المهارة في البكالوريا؟" section?
3. **Active Recall Gate**:
   - Ensure the answer is initially hidden.
   - Observe: Does the student pause and mentally answer before clicking "إظهار الإجابة" / "تحقق من فهمك" or do they reveal instantly?

### Stage F: First Practice Attempt & Error Occurrence
1. Student attempts Practice Question 1.
2. If the student answers correctly on Q1, move to Q2.
3. Upon making an error:
   - Observe emotional reaction.
   - Ask neutrally: *"واش تحس كان سبب الخطأ؟"*
   - Observe whether they examine the explanation or rush forward.

### Stage G: Error Lab & Micro-Repair Experience
1. Error is flagged and classified into the 10-type taxonomy.
2. Transition to Targeted Micro-Repair (5–15 min).
3. Observe:
   - Does the student read the diagnostic diagnosis?
   - Do they follow the structured repair steps?
   - Record classification: `REPAIR_USEFUL` / `REPAIR_TOO_LONG` / `REPAIR_TOO_VAGUE` / `REPAIR_CONFUSING`.

### Stage H: Isomorphic Retest Twin
1. Student begins Retest Question.
2. Verify:
   - Does the student recognize that the numerical values/structures have changed?
   - Do they apply the repaired method independently?
3. Record outcome:
   - `RETEST_TRANSFER_PASS`: Solves changed twin correctly with independent reasoning.
   - `RETEST_TRANSFER_FAIL`: Repeats previous conceptual or procedural error.
   - `RETEST_CONFUSED`: Misinterprets the isomorphic variant.

### Stage I: Demonstrated Mastery Transition
1. Upon passing retest, the skill transitions to `DEMONSTRATED_MASTERY`.
2. Observe:
   - Does the student understand why the skill is now marked as mastered?
   - Ensure the UI conveys evidence: *"أثبتت تمكنك بحل تمرين جديد بعد التصحيح"* rather than a participation trophy.

### Stage J: Next-Day Return (Day 1 $\to$ Day 2 Return)
1. 24 hours later, invite the student to re-open the application.
2. Do not coach them on where to click.
3. Measure:
   - Did they return voluntarily?
   - Did they remember where they left off?
   - Did they notice the spaced review queue or next mission?

### Stage K: Conversion & Exit Interview
1. Let student view the `/subscribe` page during trial or near expiration.
2. Ask neutrally:
   > *"لو كان هذا التطبيق مدفوع، واش الشيء اللي يخليك تخلّص عليه؟"*
3. Conduct the standardized 10-question Exit Interview (`PILOT_EXIT_INTERVIEW.md`).
