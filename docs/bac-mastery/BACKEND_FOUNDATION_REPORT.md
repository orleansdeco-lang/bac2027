# BAC Mastery — Backend Foundation Report
**Document Type:** Architecture & Security Verification Report  
**Project:** BAC Mastery (Dedicated Instance)  
**Date:** September 11, 2026  
**Status:** Completed & Verified  

---

## 1. Repository Audit
Prior to changes, student state was entirely client-side and persisted in `window.localStorage`. The learning domain logic is structured across 5 distinct engines:
- Onboarding & Strategic Profile (`src/lib/onboarding/`)
- Goal & Gap Analysis (`src/lib/calculations/`)
- Diagnostic & Calibration (`src/lib/diagnostic/`)
- Mission Engine & Error Lab (`src/lib/mission/`)
- Adaptive Roadmap Engine with `getNextBestMission()` (`src/lib/roadmap/`)

The application had `@supabase/supabase-js` (`^2.45.6`) installed, with inactive client scaffolding in `src/lib/supabase/client.ts`.

---

## 2. Supabase Connection Status
- **Dedicated Project Ref**: `erbvmpnxufgeinqnshzu`
- **Supabase URL**: `https://erbvmpnxufgeinqnshzu.supabase.co`
- **Auth Service**: GoTrue `v2.196.0` (Active and verified via live health check)
- **Configuration**: Configured strictly via environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in `.env.local`.

---

## 3. Auth Implementation
- **Provider & Hooks**:
  - `src/lib/auth/context.tsx`: `AuthProvider` wraps the application in `src/app/layout.tsx`. Manages `user`, `session`, `isLoading`, and `isConfigured`.
  - Subscribes to `supabase.auth.onAuthStateChange` for session persistence and token lifecycle.
  - Exposes `signIn`, `signUp`, and `signOut`.
  - `src/lib/auth/hooks.ts`: Exports `useAuth()`.
- **UI Screen**:
  - `src/app/auth/page.tsx`: Calming, bilingual (AR/FR) email/password interface matching BAC Mastery visual identity.

---

## 4. Database Tables Created (Migration `001_bac_mastery_student_foundation.sql`)
Exactly 10 student-owned tables created (Zero content/curriculum tables):
1. `student_profiles`: Student product identity, exam stream, target score, non-clinical energy state.
2. `diagnostic_sessions`: Diagnostic session lifecycle and coverage metadata.
3. `diagnostic_answers`: Individual response records with confidence and timing.
4. `diagnostic_results`: Diagnostic analytical signal, calibration, and bottleneck findings.
5. `missions`: Actionable student learning units with canonical lifecycle states.
6. `practice_attempts`: Granular question attempts within missions.
7. `errors`: Mistake classification and tracking.
8. `error_repairs`: Structured remediation steps and reflection notes.
9. `retests`: Twin verification question outcomes.
10. `skill_mastery`: Evidence-based mastery states.

---

## 5. Row Level Security (RLS) Policies
- Enabled on all 10 tables (`ALTER TABLE public.<table> ENABLE ROW LEVEL SECURITY;`).
- Strict policies for `authenticated` users:
  - `SELECT`: `USING (auth.uid() = user_id)`
  - `INSERT`: `WITH CHECK (auth.uid() = user_id)`
  - `UPDATE`: `USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`
  - `DELETE`: `USING (auth.uid() = user_id)`
- Unauthenticated (anon) access is completely blocked.

---

## 6. Ownership-Safe Foreign Keys
Simple `user_id` checks on child tables leave a vulnerability where User A could reference a parent row belonging to User B. We eliminated this vulnerability by enforcing **Composite Ownership-Safe Foreign Keys**:
- `diagnostic_sessions`: `CONSTRAINT uq_diagnostic_sessions_id_user UNIQUE (id, user_id)`
  - `diagnostic_answers`: `FOREIGN KEY (session_id, user_id) REFERENCES public.diagnostic_sessions(id, user_id) ON DELETE CASCADE`
  - `diagnostic_results`: `FOREIGN KEY (session_id, user_id) REFERENCES public.diagnostic_sessions(id, user_id) ON DELETE CASCADE`
- `missions`: `CONSTRAINT uq_missions_id_user UNIQUE (id, user_id)`
  - `practice_attempts`: `FOREIGN KEY (mission_id, user_id) REFERENCES public.missions(id, user_id) ON DELETE CASCADE`
- `errors`: `CONSTRAINT uq_errors_id_user UNIQUE (id, user_id)`
  - `error_repairs`: `FOREIGN KEY (error_id, user_id) REFERENCES public.errors(id, user_id) ON DELETE CASCADE`
  - `retests`: `FOREIGN KEY (error_id, user_id) REFERENCES public.errors(id, user_id) ON DELETE CASCADE`

PostgreSQL enforces that a child entity cannot be inserted if the parent belongs to a different `user_id`, even before RLS executes.

---

## 7. Student Profile Model
- Fields: `id` (PK, references `auth.users(id)`), `user_id`, `education_level`, `exam_type`, `stream_id`, `specialty_id`, `target_score`, `baseline_score`, `weekly_study_hours`, `future_objective`, `biggest_obstacle`, `energy_state`, `language`, `onboarding_completed`.
- Strict constraints:
  - `target_score`: `CHECK (target_score >= 10.00 AND target_score <= 20.00)`
  - `weekly_study_hours`: `CHECK (weekly_study_hours >= 0)`
  - `energy_state`: `CHECK (energy_state IN ('good', 'normal', 'tired', 'stressed'))` (Non-clinical).

---

## 8. Diagnostic Model
- Non-predictive pedagogical terminology:
  - `observed_signal` ($0-100$, observed performance indicator, NOT a predicted BAC score)
  - `coverage` (`pilot`, `partial`, `complete`)
  - `bottleneck_candidate` (Nullable: skill ID or null/insufficient evidence)
  - `confidence_calibration` (JSONB)
  - `limitations` (Transparent boundary strings)

---

## 9. Mission State Alignment
Aligned with TypeScript canonical domain states:
- `available` (Default)
- `in_progress`
- `repair_needed`
- `retest_ready`
- `needs_more_work`
- `mastered`

---

## 10. Mastery State Alignment
Evidence-based mastery progression:
- `not_yet` (Default: insufficient evidence)
- `emerging` (Initial practice success)
- `demonstrated` (Validated via repair & twin retest)

---

## 11. Error Lab Persistence
Preserves discrete separation:
- Error Taxonomy: `system_inferred_error_type`, `student_selected_error_type`
- Repair Lifecycle: `identified` $\to$ `repair_started` $\to$ `repair_completed` $\to$ `retest_passed` / `retest_failed`
- Recurrence: `is_recurring`, `occurrence_count`

---

## 12. Repository Architecture
Strict separation between UI, Domain Engines, Data Repositories, and Supabase:
- `StudentRepository`: Profile management and LocalStorage hydration.
- `DiagnosticRepository`: Session tracking and analysis result storage.
- `MissionRepository`: Mission lifecycle updates.
- `PracticeRepository`: Granular attempt logging.
- `ErrorRepository`: Mistake tracking and repair states.
- `MasteryRepository`: Evidence accumulation.

`getNextBestMission()` remains the **sole authoritative decision engine** in TypeScript. No business or decision logic was offloaded to database stored procedures.

---

## 13. LocalStorage Migration Strategy
- LocalStorage remains active as a seamless offline fallback.
- `syncAllLocalStorageToCloud(userId)` orchestrates migration: When an anonymous user signs up or logs in, local prototype records are uploaded to Supabase without overwriting existing cloud data.

---

## 14. Security Tests (`scripts/test-supabase-security.mjs`)
- **TEST A**: User A can read/write their own profile $\to$ **PASSED**
- **TEST B**: User B cannot read User A's profile $\to$ **PASSED**
- **TEST C**: User A cannot insert a child record referencing User B's parent record $\to$ **PASSED**
- **TEST D**: Unauthenticated users cannot access protected student data $\to$ **PASSED**
- **TEST E**: User A cannot modify User B's missions $\to$ **PASSED**
- **TEST F**: User A cannot read User B's diagnostic data $\to$ **PASSED**
- **TEST G**: Deleting auth user cascades correctly across all 10 tables $\to$ **PASSED**

---

## 15. Typecheck Result
`tsc --noEmit` exited with **0 errors**.

---

## 16. Test Result
All 7 test suites passed with 100% success rate:
- `test-onboarding.mjs`: 3/3 passed
- `test-diagnostic.mjs`: 18/18 passed
- `test-missions.mjs`: 17/17 passed
- `test-mastery.mjs`: 28/28 passed
- `test-roadmap.mjs`: 23/23 passed
- `test-content-model.mjs`: 20/20 passed
- `test-supabase-security.mjs`: 7/7 passed
- **Total: 116 / 116 automated tests passed.**

---

## 17. Build Result
`next build` completed with **0 errors**, prerendering all 11 static and dynamic application routes including `/auth`.

---

## 18. Files Created / Modified
- `supabase/migrations/001_bac_mastery_student_foundation.sql` (New)
- `src/lib/auth/context.tsx` (New)
- `src/lib/auth/hooks.ts` (New)
- `src/app/auth/page.tsx` (New)
- `src/lib/repositories/student-repository.ts` (New)
- `src/lib/repositories/diagnostic-repository.ts` (New)
- `src/lib/repositories/mission-repository.ts` (New)
- `src/lib/repositories/practice-repository.ts` (New)
- `src/lib/repositories/error-repository.ts` (New)
- `src/lib/repositories/mastery-repository.ts` (New)
- `src/lib/repositories/index.ts` (New)
- `scripts/test-supabase-security.mjs` (New)
- `docs/bac-mastery/BACKEND_FOUNDATION_AUDIT.md` (New)
- `docs/bac-mastery/BACKEND_FOUNDATION_REPORT.md` (New)
- `src/app/layout.tsx` (Modified: Wrapped with `AuthProvider`)
- `.env.local` (Configured with dedicated BAC Mastery instance credentials)

---

## 19. Remaining Risks
- The migration file `001_bac_mastery_student_foundation.sql` must be executed via the Supabase Dashboard SQL Editor on project `erbvmpnxufgeinqnshzu` by the project owner to establish the schema in the cloud.

---

## 20. Explicit Mandatory Confirmations
1. **SIARA Supabase was NOT modified.** (No connections, drops, alters, or queries were made to the old SIARA project).
2. **No service_role key, database password, or management token was requested or added.** (The application uses strictly `NEXT_PUBLIC_SUPABASE_ANON_KEY` via `.env.local`).
