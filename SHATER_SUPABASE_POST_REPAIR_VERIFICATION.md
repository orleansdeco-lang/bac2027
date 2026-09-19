# SHATER | الشاطر — POST-REPAIR SUPABASE PRODUCTION VERIFICATION

**Auditor Roles:**
* Senior Supabase / PostgreSQL Production Auditor
* PostgreSQL Security & RLS Auditor
* Next.js Backend Integration Auditor
* Data Integrity Engineer

**Audit Mode:** Strictly Read-Only / Verification Only  
**Supabase Project ID:** `erbvmpnxufgeinqnshzu`  
**Database Server:** PostgreSQL 17.6 on `aws-1-eu-west-1.pooler.supabase.com`  
**Date of Verification:** September 19, 2026  

---

## Executive Summary

An independent, rigorous, read-only verification was conducted on the Supabase production environment of **SHATER | الشاطر** following the repair executed under migration `018_repair_production_schema_sync.sql`.

Every claim from the previous repair report was verified against the active linked database catalog, live table data, storage configuration, migration registry, and Next.js/TypeScript application code.

### Overall Classification: **FAIL**

**Classification Rationale:**
While the core database schema synchronization succeeded (all 25 tables exist, all 25 tables have RLS enabled, the 758 official high schools remain intact, and no data was lost), **critical security vulnerabilities and a broken production build remain unresolved**:
1. **Critical Function Vulnerability (`approve_high_school_submission`)**: Defined as `SECURITY DEFINER` without a `search_path`, without internal caller authorization checks, and granted `EXECUTE` to `PUBLIC`, `anon`, and `authenticated`. Any visitor can invoke this RPC via the REST API to promote arbitrary pending submissions into official verified high schools.
2. **Cockpit KPI Backdoor (`ops_get_cockpit_kpis`)**: Contains a hardcoded parameter fallback allowing any caller supplying UUID `'7f7f704e-d9f1-4edf-9952-591f41fc0c55'` to bypass the `is_operator` check and inspect proprietary commercial revenue and student metrics.
3. **RLS Self-Approval Vulnerability (`bac_experiences`)**: Authors can update their own submissions and alter their `status` to `'approved'`, completely bypassing moderation.
4. **Build Pipeline Failure**: Contrary to the previous report's claim that builds succeeded, running `npx tsc --noEmit` and `npm run build` currently fails with exit code 1 (`Type error in src/lib/services/challenge-service.ts(181,11)`).

---

## 1. Migration Verification

A catalog comparison was executed between the remote PostgreSQL table `supabase_migrations.schema_migrations` and the local repository directory `supabase/migrations/`:

| Dimension | Repository (Local) | Remote (`schema_migrations`) | Alignment Status |
| :--- | :--- | :--- | :--- |
| Total Records | 18 files (`001` to `018`) | 21 rows | **Discrepancy** |
| Named Migrations | 18 | 13 | **Discrepancy** |
| Migrations with `name IS NULL` | 0 | 8 (`011` through `018`) | **Backfilled without names** |
| UI Dashboard Migrations | 0 | 3 (`20260918224536`, `20260918224845`, `20260918224923`) | **Remote Only (no local files)** |

### Detailed Findings:
1. **Migrations 011 to 018:** Present in `supabase_migrations.schema_migrations`, but their `name` column is `NULL` because they were inserted manually during the `018` repair script rather than applied through standard `supabase db push`.
2. **Unversioned Remote Migrations:** Three migrations were created directly in the Supabase UI by user `azinox27@gmail.com` on 2026-09-18:
   - `20260918224536_create_high_schools`
   - `20260918224845_enable_http_for_school_import`
   - `20260918224923_school_source_ref_unique`
   These do not exist in the local `supabase/migrations/` repository.
3. **Migration History Status:** Classified as **PARTIALLY VERIFIED / UNPROVEN** regarding complete identity fidelity.

---

## 2. Production Schema Verification

Querying `pg_class` where `relnamespace = 'public'::regnamespace`:
* **Total regular tables (`relkind = 'r'`):** **25**
* **Total views (`relkind = 'v'`):** **3** (`ops_learning_summary`, `ops_payment_summary`, `ops_trial_summary`)
* **Total materialized views (`relkind = 'm'`):** **0**
* **Total sequences:** **1** (`high_schools_id_seq` on integer/smallint sequence)

All 25 regular public tables have `relrowsecurity = true` (RLS enabled).

---

## 3. Table Verification

The 5 target repaired tables were audited column-by-column against PostgreSQL catalog tables `information_schema.columns` and `pg_constraint`:

### A. `user_progress`
* **Columns:** `user_id` (uuid, NOT NULL), `skill_id` (text, NOT NULL), `stream_id` (text, nullable), `subject_id` (text, nullable), `status` (text, NOT NULL, default `'in_progress'`), `score` (numeric, default 0), `diagnostic_completed` (boolean, default false), `diagnostic_score` (numeric, nullable), `last_lesson_id` (text, nullable), `total_time_seconds` (integer, default 0), `last_active_at` (timestamptz, default now()), `created_at` (timestamptz, default now()), `updated_at` (timestamptz, default now()).
* **Primary Key:** Composite PK `(user_id, skill_id)`.
* **Foreign Key:** `user_id -> auth.users(id) ON DELETE CASCADE`.
* **Check Constraints:** `chk_user_progress_status` (`status IN ('locked', 'available', 'in_progress', 'demonstrated', 'mastered')`), `chk_user_progress_time` (`total_time_seconds >= 0`).
* **RLS & Policies:** RLS enabled; 5 policies (`select_own`, `insert_own`, `update_own`, `delete_own`, `service_role_all`).

### B. `bac_experiences`
* **Columns:** `id` (uuid, default gen_random_uuid(), PK), `author_id` (uuid, nullable), `author_name` (text, NOT NULL), `author_role` (text, NOT NULL, default `'student'`), `candidate_type` (text, nullable), `stream_id` (text, NOT NULL), `wilaya` (text, nullable), `final_grade` (numeric, nullable), `initial_grade` (numeric, nullable), `target_major` (text, nullable), `passed_bac` (boolean, default true), `retaking_bac` (boolean, default false), `university_major` (text, nullable), `biggest_trap` (text, NOT NULL), `winning_routine` (text, NOT NULL), `best_resources` (text, nullable), `upvotes_count` (integer, default 0), `comments_count` (integer, default 0), `is_verified` (boolean, default false), `status` (text, NOT NULL, default `'pending'`), `reviewed_by` (uuid, nullable), `reviewed_at` (timestamptz, nullable), `created_at` (timestamptz, default now()), `updated_at` (timestamptz, default now()).
* **Foreign Keys:** `author_id -> auth.users(id) ON DELETE SET NULL`, `reviewed_by -> auth.users(id) ON DELETE SET NULL`.
* **Check Constraints:** `chk_bac_experiences_author_role` (`author_role IN ('student', 'alumni', 'teacher', 'top_achiever')`), `chk_bac_experiences_status` (`status IN ('pending', 'approved', 'rejected')`).
* **RLS & Policies:** RLS enabled; 4 policies.

### C. `experience_upvotes`
* **Columns:** `user_id` (uuid, NOT NULL), `experience_id` (uuid, NOT NULL), `created_at` (timestamptz, default now()).
* **Primary Key:** Composite PK `(user_id, experience_id)`.
* **Foreign Keys:** `user_id -> auth.users(id) ON DELETE CASCADE`, `experience_id -> bac_experiences(id) ON DELETE CASCADE`.
* **RLS & Policies:** RLS enabled; 3 policies (`manage_own_upvotes`, `remove_own_upvotes`, `viewable_by_everyone`).

### D. `experience_comments`
* **Columns:** `id` (uuid, default gen_random_uuid(), PK), `experience_id` (uuid, NOT NULL), `author_id` (uuid, nullable), `author_name` (text, NOT NULL), `author_role` (text, NOT NULL, default `'student'`), `wilaya` (text, nullable), `content` (text, NOT NULL), `is_flagged` (boolean, default false), `status` (text, default `'approved'`), `created_at` (timestamptz, default now()).
* **Foreign Keys:** `experience_id -> bac_experiences(id) ON DELETE CASCADE`, `author_id -> auth.users(id) ON DELETE SET NULL`.
* **RLS & Policies:** RLS enabled; 4 policies.

### E. `high_school_submissions`
* **Columns:** `id` (uuid, default gen_random_uuid(), PK), `submitted_by` (uuid, nullable), `proposed_name` (text, NOT NULL), `proposed_name_normalized` (text, NOT NULL), `wilaya_code` (text, NOT NULL), `wilaya_name_ar` (text, NOT NULL), `commune_name_ar` (text, NOT NULL), `status` (text, NOT NULL, default `'pending'`), `reviewed_by` (uuid, nullable), `reviewed_at` (timestamptz, nullable), `admin_notes` (text, nullable), `created_at` (timestamptz, default now()), `updated_at` (timestamptz, default now()).
* **Foreign Keys:** `submitted_by -> auth.users(id) ON DELETE SET NULL`, `reviewed_by -> auth.users(id) ON DELETE SET NULL`.
* **Check Constraints:** `high_school_submissions_status_check` (`status IN ('pending', 'approved', 'rejected', 'duplicate')`).
* **RLS & Policies:** RLS enabled; 5 policies.

---

## 4. RLS Verification

Every policy in `pg_policies` was audited for logic, roles, and safety:

### Verified Secure:
* `user_progress`: All write policies enforce `((auth.uid() = user_id) OR is_operator(auth.uid()))`. Users cannot write to or hijack another user's progress.
* `student_profiles`: `UPDATE` is guarded by the database trigger `protect_student_trial_fields()`, preventing students from elevating their subscription status, plan, or trial timestamps.
* `high_schools`: Authenticated users can only insert records where `is_verified = false AND verification_status = 'user_submitted'`. No direct UPDATE or DELETE is granted.

### Critical Vulnerabilities Identified:
1. **`bac_experiences` UPDATE Policy:**
   ```sql
   qual: ((auth.uid() = author_id) OR is_operator(auth.uid()))
   with_check: ((auth.uid() = author_id) OR is_operator(auth.uid()))
   ```
   **Vulnerability:** The policy permits authors to update any field on their own record without checking the new `status`. An author can submit a pending experience and immediately send an UPDATE request setting `status = 'approved'`, bypassing operator review.
2. **`experience_comments` INSERT Policy:**
   ```sql
   roles: {authenticated}
   with_check: true
   ```
   **Vulnerability:** The `with_check` expression is unconditionally `true`. An authenticated user can pass any arbitrary user's UUID in `author_id`, impersonating other students or staff in comment threads.
3. **`profiles` Public Read:**
   ```sql
   table: profiles
   policy: Allow read profiles
   roles: {public}
   qual: true
   ```
   **Finding:** Full public visibility on `public.profiles`.

---

## 5. Function Security Verification

Audited the three core functions highlighted in repair logs:

### A. `normalize_school_name(text)`
* **Language:** `plpgsql`
* **Volatility:** `IMMUTABLE`
* **Security Mode:** `SECURITY INVOKER` (`prosecdef = false`)
* **Behavior:** Correctly cleans Arabic prefixes, tatweel, diacritics, Alef variations, Taa Marbuta, French diacritics, and punctuation.
* **Evaluation:** **SECURE / CORRECT**

### B. `approve_high_school_submission(uuid, uuid)`
* **Language:** `plpgsql`
* **Volatility:** `VOLATILE`
* **Security Mode:** `SECURITY DEFINER` (`prosecdef = true`)
* **Owner:** `postgres`
* **Search Path:** **NOT SET** (Vulnerable to object-shadowing attacks)
* **Caller Authorization:** **NONE** (No check for `is_operator` or `auth.uid()`)
* **Grants:** `anon`, `authenticated`, `service_role`, `postgres`, `PUBLIC` all have `EXECUTE`
* **Evaluation:** **CRITICAL SECURITY FLAW**
  Because this function runs as superuser (`postgres`) and is granted to `anon` and `authenticated` with zero internal permission checks, any user who knows or enumerates a pending submission UUID can invoke `approve_high_school_submission` via Supabase RPC (`/rest/v1/rpc/approve_high_school_submission`) and permanently insert an official verified school into `public.high_schools`.

### C. `ops_get_cockpit_kpis(uuid)`
* **Language:** `plpgsql`
* **Volatility:** `STABLE`
* **Security Mode:** `SECURITY DEFINER` (`prosecdef = true`)
* **Search Path:** `'public', 'pg_temp'` (Safe)
* **Grants:** `authenticated`, `service_role`, `postgres` have `EXECUTE`
* **Authorization Clause:**
  ```sql
  IF (v_caller IS NULL OR NOT public.is_operator(v_caller))
     AND (p_operator_id IS DISTINCT FROM '7f7f704e-d9f1-4edf-9952-591f41fc0c55'::uuid) THEN
    RAISE EXCEPTION 'Access denied: operator authorization required';
  END IF;
  ```
* **Evaluation:** **HIGH SECURITY FLAW**
  The expression `AND (p_operator_id IS DISTINCT FROM '7f7f704e-...')` creates an unintended backdoor. If any non-operator or unauthenticated caller explicitly passes `p_operator_id = '7f7f704e-d9f1-4edf-9952-591f41fc0c55'`, the condition evaluates to `FALSE`, the exception is bypassed, and the caller receives the complete commercial intelligence payload (total revenue, active subscribers, expiring subscriptions, etc.).

---

## 6. High Schools Verification

* **Total Count:** Exactly **758** official schools in `public.high_schools`.
* **Verification Status:** All 758 records have `is_verified = true`, `verification_status = 'verified'`, and `source = 'geoalgeria'`.
* **Data Completeness:**
  - Missing `wilaya_code`: 0
  - Missing `commune_name_ar`: 0
  - Missing `name`: 0
* **Wilaya Coverage:**
  - 54 of 58 Algerian wilayas are represented (wilaya codes 1 to 58).
  - 4 wilayas currently have 0 schools in this dataset:
    - Code 50: Tindouf (تندوف)
    - Code 52: Béni Abbès (بني عباس)
    - Code 54: In Guezzam (عين قزام)
    - Code 56: Djanet (جانت)
* **Duplicate Analysis:**
  - 10 distinct groups (totaling 21 rows) share identical normalized names within the **same commune and wilaya**.
  - Example: `Oum El Bouaghi` (Wilaya 4) contains 3 identical rows for `lycee ثانوية الشهيد قوراري رحمان`.
  - Example: `Mohammadia` (Wilaya 29) contains 2 identical rows for `مدرسة ثانوية`.
* **Direct Manipulation Protection:** Authenticated users cannot directly update or delete official schools.

---

## 7. User Progress Verification

* **Table Existence & Schema:** Fully verified. Composite PK `(user_id, skill_id)` correctly blocks duplicate progress rows.
* **RLS Isolation:** Strict tenant isolation is enforced:
  - `SELECT`: `((auth.uid() = user_id) OR is_operator(auth.uid()))`
  - `INSERT`: `WITH CHECK ((auth.uid() = user_id) OR is_operator(auth.uid()))`
  - `UPDATE`: `USING ((auth.uid() = user_id) OR is_operator(auth.uid())) WITH CHECK ((auth.uid() = user_id) OR is_operator(auth.uid()))`
  - `DELETE`: `USING ((auth.uid() = user_id) OR is_operator(auth.uid()))`
* **Cross-Tenant Attack Test:** Verified structurally that a user cannot modify another user's progress or change `user_id` on an update.

---

## 8. Experiences / Comments / Upvotes Verification

* **Active Row Counts:**
  - `bac_experiences`: 6
  - `experience_comments`: 0
  - `experience_upvotes`: 0
* **Upvote Integrity:** Composite PK `(user_id, experience_id)` prevents duplicate upvoting by the same user.
* **Orphan Cascade:** Foreign keys on `experience_upvotes` and `experience_comments` specify `ON DELETE CASCADE` referencing `bac_experiences(id)`.
* **Security Gaps:** As documented in Section 4, authors can self-approve experiences, and comments allow arbitrary `author_id` spoofing.

---

## 9. Data Integrity Verification

A comparative audit was conducted between the previous repair baseline and the active database:

| Table | Previous Repair Report Count | Current Live Verified Count | Status | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `high_schools` | 758 | 758 | **VERIFIED** | Exactly preserved |
| `student_profiles` | 2 | 2 | **VERIFIED** | Exactly preserved |
| `payment_orders` | 5 | 5 | **VERIFIED** | Exactly preserved |
| `telemetry_events` | 465 | 468 | **VERIFIED** | +3 new events ingested |
| `bac_experiences` | 6 | 6 | **VERIFIED** | Exactly preserved |
| `experience_comments` | 0 | 0 | **VERIFIED** | Clean state |
| `experience_upvotes` | 0 | 0 | **VERIFIED** | Clean state |
| `high_school_submissions` | 0 | 0 | **VERIFIED** | Clean state |
| `user_progress` | 0 | 0 | **VERIFIED** | Clean state |

**Data Loss Conclusion:** **No data loss detected based on available evidence.** Active telemetry ingestion (+3 records) demonstrates live database connectivity and operational continuity.

---

## 10. Foreign Key / Orphan Verification

Executed automated referential integrity queries across all user-dependent tables:

```sql
SELECT 'payment_orders_orphan', count(*) FROM public.payment_orders p LEFT JOIN auth.users u ON u.id = p.user_id WHERE u.id IS NULL
UNION ALL SELECT 'student_profiles_orphan', count(*) FROM public.student_profiles sp LEFT JOIN auth.users u ON u.id = sp.id WHERE u.id IS NULL
UNION ALL SELECT 'telemetry_events_orphan', count(*) FROM public.telemetry_events te LEFT JOIN auth.users u ON u.id = te.user_id WHERE te.user_id IS NOT NULL AND u.id IS NULL
UNION ALL SELECT 'bac_experiences_orphan', count(*) FROM public.bac_experiences be LEFT JOIN auth.users u ON u.id = be.author_id WHERE be.author_id IS NOT NULL AND u.id IS NULL;
```

**Result:** Exactly **0** orphaned records found across all checked tables.

---

## 11. Grants / Data API Verification

* **PostgreSQL Grant Layer:** In accordance with Supabase defaults, public tables have broad table-level grants (`ALL`) assigned to `anon` and `authenticated`, relying entirely upon RLS (`relrowsecurity = true`) to enforce access control.
* **Defense-in-Depth Gap:** No restrictive table-level `REVOKE` or column-level privileges exist. Where RLS policies contain logic flaws (e.g. `experience_comments` `with_check = true`), the table-level grant permits the operation immediately.
* **Routine Grants:** `approve_high_school_submission` is granted `EXECUTE` to `PUBLIC`, `anon`, and `authenticated`.

---

## 12. Storage Verification

* **Storage Buckets:** Exactly 1 active bucket in `storage.buckets`:
  - `id`: `payment_receipts`
  - `public`: `false` (Private bucket)
  - `file_size_limit`: 5,242,880 bytes (5MB)
  - `allowed_mime_types`: `image/jpeg`, `image/png`, `application/pdf`
* **Bucket Policies:**
  - `payment_receipts_student_upload`: Properly scoped to user folder: `((bucket_id = 'payment_receipts') AND ((storage.foldername(name))[1] = auth.uid()::text))`.
  - `payment_receipts_student_select`: Properly restricted to own receipt.
  - `payment_receipts_operator_select`: Restricted to operators (`is_operator(auth.uid())`).
* **Vulnerability in `storage.objects`:**
  - Policies `Allow upload to exam_documents and community_uploads` and `Allow delete on community and exam documents` remain attached to `storage.objects` granting unconditional `INSERT` and `DELETE` to role `{public}`.

---

## 13. Application ↔ Database Contract Verification

Audited queries in `src/` against actual database columns:

1. **`student_profiles` Persistence Columns:**
   - Database: `last_lesson_id` (text), `total_study_time_seconds` (integer), `diagnostic_completed` (boolean), `diagnostic_score` (numeric).
   - Application (`src/lib/progress/progress-service.ts`, `src/lib/repositories/student-repository.ts`): Fully implemented and correctly referenced in read, update, and summary calculation queries.
2. **`user_progress`:** Columns `skill_id`, `status`, `diagnostic_completed`, `diagnostic_score`, `last_lesson_id`, `total_time_seconds`, `last_active_at` are properly queried and upserted with `onConflict: "user_id,skill_id"`.
3. **`high_school_submissions`:** Columns match the payload in `src/lib/services/school-service.ts` line 262.
4. **`bac_experiences`:** Column payload in `src/app/api/experiences/route.ts` line 156 matches all database schema definitions.

---

## 14. LocalStorage / Persistence Verification

Audited client-side caching vs. database persistence across `src/`:

* **`user_progress`:** Implemented as a **Dual-Write / Sync Cache**. LocalStorage key `bac_user_progress:${userId}` provides immediate synchronous UI reactivity; changes are dual-written asynchronously to Supabase `public.user_progress`.
* **`student_profiles`:** Supabase is the **Durable Source of Truth**. LocalStorage holds an ephemeral session copy.
* **`high_school_submissions`:** Implemented as **Dual-Write** (Supabase `high_school_submissions` + fallback to LocalStorage `bac_high_school_submissions`).
* **`custom_exams` & `challenges`:** Dual-write with fallback to LocalStorage.
* **Verdict:** Core student progress and identity correctly treat Supabase as the source of truth, utilizing LocalStorage strictly as an offline/optimistic cache.

---

## 15. Build Verification

Both commands specified in Section 21 were executed in the production environment:

### Command 1: `npx tsc --noEmit`
* **Exit Code:** **1 (FAIL)**
* **Output:**
  ```text
  src/lib/services/challenge-service.ts(181,11): error TS2322: Type '{ id: string; created_at: string; updated_at: string; user_has_upvoted: false; author_id: string | null; author_name: string; wilaya: string | null; stream_id: string; subject_id: string; ... 11 more ...; comments_count: number; }' is not assignable to type 'StudentChallenge'.
    Types of property 'status' are incompatible.
      Type 'string' is not assignable to type 'ChallengeStatus'.
  ```

### Command 2: `npm run build`
* **Exit Code:** **1 (FAIL)**
* **Output:**
  ```text
  Failed to compile.
  ./src/lib/services/challenge-service.ts:181:11
  Type error: Type '{ ... }' is not assignable to type 'StudentChallenge'.
    Types of property 'status' are incompatible.
      Type 'string' is not assignable to type 'ChallengeStatus'.
  ```

---

## 16. Previous Claims Verification

| Claim | Evidence | Status |
| :--- | :--- | :--- |
| **758 official high schools preserved** | Direct query `SELECT count(*) FROM public.high_schools` returned exactly 758 with `is_verified = true`. | **VERIFIED** |
| **25 public tables present** | Direct catalog query on `pg_class` returned exactly 25 tables. | **VERIFIED** |
| **100% RLS enabled on all public tables** | `pg_class.relrowsecurity = true` confirmed for all 25 tables. | **VERIFIED** |
| **student_profiles 4 persistence columns added** | Columns `last_lesson_id`, `total_study_time_seconds`, `diagnostic_completed`, `diagnostic_score` confirmed in catalog and application code. | **VERIFIED** |
| **Migrations 011–018 registered** | Rows 011–018 confirmed present in `supabase_migrations.schema_migrations`. | **VERIFIED** |
| **Migration history internally consistent** | Discrepancy between 21 remote records and 18 local files; 011-018 lack names; 3 remote dashboard migrations lack local `.sql` files. | **PARTIALLY VERIFIED** |
| **Zero Data Loss** | Table row counts match or exceed baseline (telemetry +3), but historical baseline prior to migration 018 was not independently auditable. | **PARTIALLY VERIFIED** |
| **TypeScript build successful** | `npx tsc --noEmit` exited with code 1 due to TS2322 in `challenge-service.ts`. | **CONTRADICTED** |
| **Next.js production build successful** | `npm run build` failed during type checking with exit code 1. | **CONTRADICTED** |

---

## 17. Findings

| ID | Severity | Area | Finding | Evidence | Impact | Recommended Next Action |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-01** | **CRITICAL** | Database Functions | `approve_high_school_submission` is `SECURITY DEFINER` without `search_path`, without caller authorization checks, and executable by `anon` and `authenticated`. | `pg_proc.prosecdef = true`, no `search_path`, `routine_privileges` shows `anon` has `EXECUTE`. | Unauthenticated or unauthorized users can call the RPC to promote arbitrary pending submissions into official verified high schools. | Revoke EXECUTE from PUBLIC/anon/authenticated; set search_path to `'public', 'pg_temp'`; add `IF NOT is_operator(auth.uid()) THEN RAISE EXCEPTION ...`. |
| **SEC-02** | **HIGH** | Database Functions | `ops_get_cockpit_kpis` contains a hardcoded parameter fallback allowing callers to bypass the operator check. | `IF ... AND (p_operator_id IS DISTINCT FROM '7f7f704e-...')` in function definition. | Anyone passing this UUID argument can view confidential business metrics and revenue. | Remove parameter fallback check; strictly check `IF NOT is_operator(auth.uid())`. |
| **SEC-03** | **HIGH** | RLS Authorization | `bac_experiences` UPDATE policy allows authors to self-approve pending experiences. | Policy `with_check` is `((auth.uid() = author_id) OR is_operator(auth.uid()))`. | Authors can mutate `status` from `'pending'` to `'approved'`, bypassing content moderation. | Enforce `status = 'pending'` for authors in UPDATE `with_check`, or use a database trigger to protect status. |
| **SEC-04** | **HIGH** | RLS Authorization | `experience_comments` INSERT policy allows arbitrary `author_id` spoofing. | Policy `with_check` is `true`. | Authenticated users can forge comments under another student's or operator's UUID. | Update `with_check` to require `(auth.uid() = author_id OR author_id IS NULL)`. |
| **SEC-05** | **HIGH** | Application Build | `npx tsc --noEmit` and `npm run build` fail with type error TS2322 in `challenge-service.ts`. | Compiler error at line 181:11: `Type 'string' is not assignable to type 'ChallengeStatus'`. | Production builds and CI/CD pipelines cannot succeed. | Cast `status` in `localChallenge` to `ChallengeStatus`. |
| **SEC-06** | **MEDIUM** | Storage Security | `storage.objects` has legacy policies granting PUBLIC insert and delete permissions. | Policies on `storage.objects` allow role `{public}` to upload/delete on `exam_documents` and `community_uploads`. | Potential tampering or asset deletion if these buckets are active or recreated. | Drop legacy policies from `storage.objects`. |
| **DAT-01** | **LOW** | Data Integrity | `high_schools` contains 21 duplicate rows across 10 groups in the same commune. | `GROUP BY wilaya_code, commune_name_ar, name_normalized HAVING count(*) > 1` returns 10 groups. | Duplicate entries appear in school selector dropdowns. | Deduplicate redundant rows and add a unique constraint on `(wilaya_code, commune_name_ar, name_normalized)`. |
| **MIG-01** | **LOW** | Migration Registry | Registry contains 21 migrations vs. 18 local files; versions 011–018 have null names. | `supabase_migrations.schema_migrations` catalog query. | Supabase CLI reports drift and migration sync warnings. | Align local migration files and capture remote schema changes via `supabase db pull`. |

---

## 18. Final Classification

### Classification: **FAIL**

**Summary:**  
The repair succeeded in restoring tables, columns, row integrity, and base RLS flags. However, it introduced or left unaddressed **one critical stored procedure vulnerability (`approve_high_school_submission`)**, **two RLS authorization flaws (self-approval and identity spoofing)**, **a backdoor parameter in cockpit KPIs**, and **a broken Next.js/TypeScript build pipeline**.

---

```text
NO DATABASE MODIFICATIONS WERE PERFORMED DURING THIS VERIFICATION.
NO APPLICATION CODE WAS MODIFIED DURING THIS VERIFICATION.
NO PRODUCTION DATA WAS CREATED, UPDATED, OR DELETED DURING THIS VERIFICATION.
```
