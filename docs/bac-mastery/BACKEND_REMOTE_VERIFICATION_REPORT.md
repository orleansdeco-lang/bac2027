# BAC Mastery — Backend Remote Verification Report
**Document Type:** Infrastructure & Remote Database Verification (Prompt 10.4)  
**Date/Time:** September 11, 2026, 19:18 UTC+1  
**Project Ref:** `erbvmpnxufgeinqnshzu`  
**Supabase URL:** `https://erbvmpnxufgeinqnshzu.supabase.co`  
**Status:** Verification Completed with Actionable Blocker  

---

## 1. Executive Summary
The BAC Mastery database foundation migration (`001_bac_mastery_student_foundation.sql`) has been inspected against the live, dedicated Supabase project `erbvmpnxufgeinqnshzu`.
All 10 expected student-owned tables exist remotely and actively enforce Row Level Security.
Anonymous reads return 0 rows, and anonymous writes are rejected with PostgreSQL error `42501 (insufficient_privilege)`.
The Auth service is reachable and functional, but **"Confirm email" is currently active in the remote Supabase project**, which blocks automated two-user session acquisition until email confirmation is toggled off or test emails are confirmed.

---

## 2. Target Supabase Project
- **Project Ref:** `erbvmpnxufgeinqnshzu`
- **Environment:** Dedicated BAC Mastery Supabase Instance
- **Old SIARA Project:** Completely untouched; zero connections or shared resources.

---

## 3. Migration Status
- **Status:** **APPLIED**
- All 10 student-owned tables created by `001_bac_mastery_student_foundation.sql` are confirmed present and reachable over PostgREST:
  1. `student_profiles`: Confirmed (Table exists)
  2. `diagnostic_sessions`: Confirmed (Table exists)
  3. `diagnostic_answers`: Confirmed (Table exists)
  4. `diagnostic_results`: Confirmed (Table exists)
  5. `missions`: Confirmed (Table exists)
  6. `practice_attempts`: Confirmed (Table exists)
  7. `errors`: Confirmed (Table exists)
  8. `error_repairs`: Confirmed (Table exists)
  9. `retests`: Confirmed (Table exists)
  10. `skill_mastery`: Confirmed (Table exists)
- **Zero Content Tables:** No lessons, topics, skills catalog, question banks, or curriculum tables were created in the database.

---

## 4. Remote Schema & Table Verification
- **Root Identity:** Bound to `auth.users(id)` across all tables.
- **Table Count:** Exactly 10 student-owned tables.
- **Data Scoping:** All student activity is strictly partitioned by `user_id`.

---

## 5. Constraint Verification
- **`student_profiles` Identity Integrity:** `CONSTRAINT chk_student_profiles_id_matches_user CHECK (id = user_id)` guarantees `id` and `user_id` cannot diverge.
- **Score Bounds:** `target_score >= 10.00 AND target_score <= 20.00`, `baseline_score >= 0.00 AND baseline_score <= 20.00`.
- **Domain States:** Enforced via CHECK constraints matching TypeScript enums:
  - `diagnostic_sessions.status`: `in_progress`, `completed`
  - `diagnostic_sessions.coverage`: `pilot`, `partial`, `complete`
  - `diagnostic_results.coverage`: `pilot`, `partial`, `complete`
  - `missions.status`: `available`, `in_progress`, `repair_needed`, `retest_ready`, `needs_more_work`, `mastered`
  - `missions.priority`: `high`, `medium`, `low`
  - `practice_attempts.attempt_type`: `practice`, `retest`
  - `errors.status`: `identified`, `repair_started`, `repair_completed`, `retest_passed`, `retest_failed`
  - `skill_mastery.status`: `not_yet`, `emerging`, `demonstrated`
  - `student_profiles.energy_state`: `good`, `normal`, `tired`, `stressed`
  - `student_profiles.language`: `ar`, `fr`
- **Numeric Bounds:** `confidence` (1-5), `observed_signal` (0-100), `confidence_score` (0.00-1.00), `occurrence_count` (>= 1).

---

## 6. Composite Foreign Key & Ownership Verification
- Composite ownership foreign keys are defined across all child tables to prevent cross-user reference spoofing:
  - `diagnostic_answers(session_id, user_id)` → `diagnostic_sessions(id, user_id)`
  - `diagnostic_results(session_id, user_id)` → `diagnostic_sessions(id, user_id)`
  - `practice_attempts(mission_id, user_id)` → `missions(id, user_id)`
  - `errors(mission_id, user_id)` → `missions(id, user_id)`
  - `error_repairs(error_id, user_id)` → `errors(id, user_id)`
  - `retests(error_id, user_id)` → `errors(id, user_id)`

---

## 7. ON DELETE SET NULL Verification
- In `public.errors`:
  `CONSTRAINT fk_errors_mission_owner FOREIGN KEY (mission_id, user_id) REFERENCES public.missions(id, user_id) ON DELETE SET NULL (mission_id)`.
- **Behavioral Intent:** If an active learning mission is completed or reset, historical mistake records in the Error Lab remain intact and durable, preserving critical learning evidence.

---

## 8. Row Level Security (RLS) Verification
- **Status:** **PASS (Verified Remotely)**
- Anonymous client verification:
  - `student_profiles`: INSERT rejected with code `42501 (new row violates row-level security policy)`.
  - `diagnostic_sessions`: INSERT rejected with code `42501`.
  - `missions`: INSERT rejected with code `42501`.
  - `errors`: INSERT rejected with code `42501`.
  - `skill_mastery`: INSERT rejected with code `42501`.
  - `diagnostic_answers`: INSERT rejected with code `42501`.
  - `diagnostic_results`: INSERT rejected with code `42501`.
  - `practice_attempts`: INSERT rejected with code `42501`.
  - `error_repairs`: INSERT rejected with code `42501`.
  - `retests`: INSERT rejected with code `42501`.
- Unauthenticated reads on all tables return 0 rows.

---

## 9. Authentication Verification
- **Status:** **PARTIAL / BLOCKED (Email Confirmation Required)**
- **User Creation:** `supabase.auth.signUp()` successfully registers users with GoTrue (tested with generated student account; registered with User ID `181e4e22-939f-4e9f-ae99-3fec37b6045d`).
- **Session Acquisition:** Blocked because **"Confirm email"** is currently enabled on the remote Supabase project. `signInWithPassword()` returns `SignIn error: Email not confirmed`.

---

## 10. Two-User Isolation Test Results
- **Status:** **BLOCKED (Requires active session tokens)**
- The contract and DDL policies are verified (12/12 test suites pass in `scripts/test-supabase-security.mjs`), but live authenticated interaction testing between User A and User B cannot proceed until test accounts can obtain JWT session tokens.

---

## 11. Repository Verification
- **Status:** **PASS**
- All repositories (`StudentRepository`, `DiagnosticRepository`, `MissionRepository`, `PracticeRepository`, `ErrorRepository`, `MasteryRepository`) maintain:
  1. Pure client SDK usage using authenticated session tokens; zero `service_role` dependencies.
  2. LocalStorage offline fallback active; anonymous onboarding remains functional.
  3. Strict database RLS reliance for authorization.

---

## 12. Credential & Security Audit
- **Status:** **PASS**
- Zero `service_role` keys found in repository source code.
- Zero database passwords or management tokens in source or git history.
- `.env.local` is ignored by `.gitignore`.
- Zero SIARA project references in BAC Mastery codebase.

---

## 13. Test Results
- **Domain Test Suites (6 suites):** 116 / 116 PASS
  - `test-onboarding.mjs`: 3/3
  - `test-diagnostic.mjs`: 18/18
  - `test-missions.mjs`: 17/17
  - `test-mastery.mjs`: 28/28
  - `test-roadmap.mjs`: 23/23
  - `test-content-model.mjs`: 20/20
- **Security Test Suite:** 12 / 12 PASS (`test-supabase-security.mjs`)
- **Combined Automated Tests:** **128 / 128 tests passing**.

---

## 14. TypeScript & Build Results
- **TypeScript (`tsc --noEmit`):** **PASS** (0 errors)
- **Production Build (`next build`):** **PASS** (11/11 routes built successfully)

---

## 15. Known Limitations & Blockers
1. **Remote Auth Email Confirmation Active:** Newly registered accounts cannot sign in or obtain session tokens without clicking an email confirmation link or having "Confirm email" toggled off in the Supabase Dashboard.

---

## 16. Exact Next Recommended Action
In your Supabase Dashboard for project `erbvmpnxufgeinqnshzu`:
1. Go to **Authentication** → **Providers** → **Email**.
2. Uncheck / toggle OFF **"Confirm email"** (Save changes).
3. Once toggled off, test accounts can be immediately instantiated with live JWT tokens, allowing the live two-user isolation test to execute and conclude the backend verification phase.
