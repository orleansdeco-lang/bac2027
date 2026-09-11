# BAC Mastery — Backend Foundation Hardening Report
**Document Type:** Final Security & Schema Hardening Audit (Prompt 10.3.1)  
**Project:** BAC Mastery (Dedicated Supabase Project: `erbvmpnxufgeinqnshzu`)  
**Date:** September 11, 2026  
**Status:** Complete & Hardened  

---

## 1. Files Inspected
The following files were inspected and audited across the codebase:
- `supabase/migrations/001_bac_mastery_student_foundation.sql` (Migration DDL)
- `src/lib/supabase/client.ts` (Client configuration)
- `src/lib/auth/context.tsx` (Authentication state and session lifecycle)
- `src/lib/auth/hooks.ts` (useAuth hook)
- `src/lib/repositories/student-repository.ts` (Student profile data access)
- `src/lib/repositories/diagnostic-repository.ts` (Diagnostic session, answer, result access)
- `src/lib/repositories/mission-repository.ts` (Mission state and lifecycle access)
- `src/lib/repositories/practice-repository.ts` (Practice attempt logging)
- `src/lib/repositories/error-repository.ts` (Error Lab records and repairs)
- `src/lib/repositories/mastery-repository.ts` (Evidence-based skill mastery access)
- `src/lib/repositories/index.ts` (Synchronizer and exports)
- `src/types/student.ts`, `src/types/mission.ts`, `src/types/diagnostic.ts` (TypeScript domain definitions)
- `scripts/test-supabase-security.mjs` (Automated security test suite)
- `docs/bac-mastery/BACKEND_FOUNDATION_REPORT.md` (Initial foundation report)

---

## 2. Issues Found & Remediated

### Issue 1: Identity Model Duplication in `student_profiles`
- **Original Problem:** `student_profiles` contained both `id UUID PRIMARY KEY REFERENCES auth.users(id)` and `user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id)`, but lacked a database constraint ensuring `id = user_id`.
- **Risk:** Malicious users or buggy client code could write differing UUIDs to `id` and `user_id`, causing identity divergence, RLS bypasses, or orphaned profile associations.
- **Fix:** Added `CONSTRAINT chk_student_profiles_id_matches_user CHECK (id = user_id)` and hardened RLS policies with `WITH CHECK (auth.uid() = id AND auth.uid() = user_id)`.

### Issue 2: Missing Foreign Key on `errors.mission_id`
- **Original Problem:** `errors.mission_id` was nullable but had no foreign key constraint referencing `missions`.
- **Risk:** Weakened referential integrity allowing invalid or cross-user mission references; risk of orphaned references.
- **Fix:** Added ownership-safe composite foreign key:
  `CONSTRAINT fk_errors_mission_owner FOREIGN KEY (mission_id, user_id) REFERENCES public.missions(id, user_id) ON DELETE SET NULL (mission_id)`.
  This prevents cross-user mission attachment and ensures learning error history is preserved even if a mission is reset.

### Issue 3: Missing CHECK Constraint on `diagnostic_results.coverage`
- **Original Problem:** `diagnostic_results.coverage` defaulted to `'pilot'` but was unconstrained text.
- **Risk:** Arbitrary invalid coverage values could be stored, breaking domain invariants.
- **Fix:** Added `CHECK (coverage IN ('pilot', 'partial', 'complete'))` matching `diagnostic_sessions.coverage`.

### Issue 4: Missing Boundary Check on `skill_mastery.confidence_score`
- **Original Problem:** `skill_mastery.confidence_score NUMERIC(3, 2)` was unbounded.
- **Risk:** Out-of-bounds scores could corrupt mastery analytics.
- **Fix:** Added `CHECK (confidence_score IS NULL OR (confidence_score >= 0.00 AND confidence_score <= 1.00))`.

### Issue 5: Missing Composite Foreign Key Indexes on Child Tables
- **Original Problem:** Foreign key lookups on `(session_id, user_id)`, `(mission_id, user_id)`, and `(error_id, user_id)` lacked composite index coverage.
- **Risk:** Degraded performance on foreign key cascade checks and multi-tenant isolation scans.
- **Fix:** Added composite indexes across all child tables (`idx_diagnostic_answers_session_user`, `idx_diagnostic_results_session_user`, `idx_practice_attempts_mission_user`, `idx_errors_mission_user`, `idx_error_repairs_error_user`, `idx_retests_error_user`).

---

## 3. Final Schema (10 Student-Owned Tables)
1. **`student_profiles`**: Core student identity, exam stream, target score, energy state, onboarding status.
2. **`diagnostic_sessions`**: Diagnostic lifecycle tracking (in_progress, completed) and coverage metadata.
3. **`diagnostic_answers`**: Granular question responses with confidence rating and time spent.
4. **`diagnostic_results`**: Observed analytical signal, bottleneck candidate, calibration, and dimension scores.
5. **`missions`**: Actionable learning units with canonical states (`available`, `in_progress`, `repair_needed`, `retest_ready`, `needs_more_work`, `mastered`).
6. **`practice_attempts`**: Granular question attempts within missions.
7. **`errors`**: Classified student mistakes linked to missions and skills.
8. **`error_repairs`**: Remediation progress, completed repair steps, and student reflection.
9. **`retests`**: Twin verification question attempts and pass/fail evidence.
10. **`skill_mastery`**: Evidence-based mastery states (`not_yet`, `emerging`, `demonstrated`).

---

## 4. Identity Model
- `auth.users(id)` is the single authoritative root of identity.
- In `student_profiles`:
  - `id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
  - `user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
  - `CONSTRAINT chk_student_profiles_id_matches_user CHECK (id = user_id)`
- In all other 9 tables:
  - `user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- Cross-user identity tampering is structurally blocked at the database engine level.

---

## 5. Foreign Key Model
- **Ownership Isolation:** All child relationships use composite foreign keys containing `user_id`:
  - `diagnostic_answers` → `(session_id, user_id)` references `diagnostic_sessions(id, user_id)`
  - `diagnostic_results` → `(session_id, user_id)` references `diagnostic_sessions(id, user_id)`
  - `practice_attempts` → `(mission_id, user_id)` references `missions(id, user_id)`
  - `errors` → `(mission_id, user_id)` references `missions(id, user_id)` (nullable, `ON DELETE SET NULL (mission_id)`)
  - `error_repairs` → `(error_id, user_id)` references `errors(id, user_id)`
  - `retests` → `(error_id, user_id)` references `errors(id, user_id)`
- **Durable Error Evidence:** Setting `ON DELETE SET NULL (mission_id)` on `errors` guarantees that historical learning mistakes remain recorded even if an active mission is cleared or completed.

---

## 6. Row Level Security (RLS) Model
- **Enabled:** `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;` executed on all 10 tables.
- **Default Deny:** Zero policies exist for `anon` / unauthenticated users.
- **Authenticated Isolation:** All operations (SELECT, INSERT, UPDATE, DELETE) require `auth.uid() = user_id`.
- **Dual Check on Profile Writes:** `student_profiles` INSERT and UPDATE policies check `(auth.uid() = id AND auth.uid() = user_id)`.
- **Zero Privileged Secrets:** No `service_role` keys, database passwords, or management tokens exist in client code or environment variables.

---

## 7. Constraints
- **Canonical Domain States:**
  - `diagnostic_sessions.status`: `CHECK (status IN ('in_progress', 'completed'))`
  - `diagnostic_sessions.coverage`: `CHECK (coverage IN ('pilot', 'partial', 'complete'))`
  - `diagnostic_results.coverage`: `CHECK (coverage IN ('pilot', 'partial', 'complete'))`
  - `missions.status`: `CHECK (status IN ('available', 'in_progress', 'repair_needed', 'retest_ready', 'needs_more_work', 'mastered'))`
  - `missions.priority`: `CHECK (priority IN ('high', 'medium', 'low'))`
  - `practice_attempts.attempt_type`: `CHECK (attempt_type IN ('practice', 'retest'))`
  - `errors.status`: `CHECK (status IN ('identified', 'repair_started', 'repair_completed', 'retest_passed', 'retest_failed'))`
  - `skill_mastery.status`: `CHECK (status IN ('not_yet', 'emerging', 'demonstrated'))`
  - `student_profiles.energy_state`: `CHECK (energy_state IN ('good', 'normal', 'tired', 'stressed'))`
  - `student_profiles.language`: `CHECK (language IN ('ar', 'fr'))`
- **Numeric & Identity Constraints:**
  - `student_profiles`: `CHECK (id = user_id)`, `CHECK (target_score >= 10.00 AND target_score <= 20.00)`, `CHECK (baseline_score >= 0.00 AND baseline_score <= 20.00)`, `CHECK (weekly_study_hours >= 0)`
  - `missions`: `CHECK (estimated_minutes > 0)`
  - `confidence`: `CHECK (confidence >= 1 AND confidence <= 5)` on answers, attempts, and retests
  - `observed_signal`: `CHECK (observed_signal >= 0 AND observed_signal <= 100)`
  - `confidence_score`: `CHECK (confidence_score IS NULL OR (confidence_score >= 0.00 AND confidence_score <= 1.00))`
  - `occurrence_count`: `CHECK (occurrence_count >= 1)`

---

## 8. Indexes
- `idx_student_profiles_user_id` on `student_profiles(user_id)`
- `idx_diagnostic_sessions_user_status` on `diagnostic_sessions(user_id, status)`
- `idx_diagnostic_answers_session_user` on `diagnostic_answers(session_id, user_id)`
- `idx_diagnostic_answers_user` on `diagnostic_answers(user_id)`
- `idx_diagnostic_results_session_user` on `diagnostic_results(session_id, user_id)`
- `idx_diagnostic_results_user` on `diagnostic_results(user_id)`
- `idx_missions_user_status` on `missions(user_id, status)`
- `idx_missions_user_skill` on `missions(user_id, skill_id)`
- `idx_practice_attempts_mission_user` on `practice_attempts(mission_id, user_id)`
- `idx_practice_attempts_user_skill` on `practice_attempts(user_id, skill_id)`
- `idx_errors_user_status` on `errors(user_id, status)`
- `idx_errors_user_skill` on `errors(user_id, skill_id)`
- `idx_errors_mission_user` on `errors(mission_id, user_id)`
- `idx_error_repairs_error_user` on `error_repairs(error_id, user_id)`
- `idx_error_repairs_user` on `error_repairs(user_id)`
- `idx_retests_error_user` on `retests(error_id, user_id)`
- `idx_retests_user` on `retests(user_id)`
- `idx_skill_mastery_user_skill` on `skill_mastery(user_id, skill_id)`

---

## 9. Security Test Results
Automated suite: `node scripts/test-supabase-security.mjs`

| Test ID | Scenario Description | Result |
|---|---|---|
| **TEST A** | User A can read own profile (`auth.uid() = id`) | **PASS** |
| **TEST B** | User B cannot read User A profile (RLS isolation) | **PASS** |
| **TEST C** | User A cannot insert a student row belonging to User B | **PASS** |
| **TEST D** | User A cannot create `practice_attempt` against User B's mission | **PASS** |
| **TEST E** | User A cannot create `error_repair` against User B's error | **PASS** |
| **TEST F** | User A cannot create `retest` against User B's error | **PASS** |
| **TEST G** | User A cannot manipulate User B's `skill_mastery` | **PASS** |
| **TEST H** | Unauthenticated user cannot access student-owned data | **PASS** |
| **TEST I** | `errors.mission_id` cannot reference a mission belonging to another user | **PASS** |
| **TEST J** | Invalid enum-like values are rejected by strict `CHECK` constraints | **PASS** |
| **TEST K** | Invalid score ranges are rejected by strict numeric `CHECK` constraints | **PASS** |
| **TEST L** | Student profile identity cannot diverge between auth user and profile identity | **PASS** |

**Summary:** 12 / 12 Security Suites Passed (100% Success).

---

## 10. TypeScript Typecheck
- Command: `tsc --noEmit`
- Result: **PASS** (0 errors)

---

## 11. Production Build
- Command: `next build`
- Result: **PASS** (11/11 routes generated successfully with 0 errors)

---

## 12. Migration Readiness
**READY FOR CONTROLLED MIGRATION**
