# BAC Mastery — Backend Schema Decisions
**Document Type:** Architectural & Security Decision Record (ADR)  
**Project:** BAC Mastery (Dedicated Instance)  
**Status:** Approved & Hardened (Prompt 10.3.1)  

---

## 1. Canonical Student Identity Design
In BAC Mastery, authentication identity originates from Supabase GoTrue (`auth.users.id`).
In `student_profiles`, the canonical identity is defined as:
```sql
id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
CONSTRAINT chk_student_profiles_id_matches_user CHECK (id = user_id)
```
Every student profile corresponds to exactly one `auth.users` record.

### Why Duplicated Identity Fields Were Constrained
Previously, `student_profiles` exposed two independent columns (`id` and `user_id`) without a database-level equality constraint. This introduced the risk of data divergence (e.g., an attacker or bug writing `id = userA` and `user_id = userB`).
Rather than breaking the repository contract where `user_id` is queried, we enforced:
`CONSTRAINT chk_student_profiles_id_matches_user CHECK (id = user_id)`
Additionally, the RLS policies enforce `auth.uid() = id AND auth.uid() = user_id` on writes. Identity divergence is structurally impossible.

---

## 2. errors → missions Relationship
The `errors` table tracks learning errors identified during mission practice attempts.
The foreign key is defined as a composite, ownership-safe relationship:
```sql
mission_id UUID,
CONSTRAINT fk_errors_mission_owner 
  FOREIGN KEY (mission_id, user_id) 
  REFERENCES public.missions(id, user_id) 
  ON DELETE SET NULL (mission_id)
```

### Nullable Relationship Decisions
`errors.mission_id` is intentionally nullable (`UUID`, not `NOT NULL`). While most errors are captured during a mission attempt, error evidence in the Error Lab can persist independently, or originate from outside a standard mission flow (e.g., direct retesting, future diagnostic errors, or standalone practice). Making `mission_id` NOT NULL would artificially constrain learning error tracking.

### ON DELETE Decisions
- For `errors.mission_id`, `ON DELETE SET NULL (mission_id)` is strictly utilized (supported in PostgreSQL 15+). Student errors are critical historical learning evidence. If an active mission is deleted or reset, the student's historical error record must NOT be deleted.
- For dependent child entities (`error_repairs` and `retests`), `ON DELETE CASCADE` is applied to their parent `errors(id, user_id)`: if an error record is explicitly deleted, its repairs and retests are deleted with it.
- For `auth.users(id)`, `ON DELETE CASCADE` is applied across all 10 student-owned tables: when an account is deleted, all associated personal data is completely purged (GDPR/privacy compliance).

---

## 3. RLS Ownership Model
All 10 student-owned tables have Row Level Security (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`) strictly enabled.
- No public/anonymous access policies exist. Unauthenticated requests receive 0 rows or are rejected.
- Authenticated policies use `auth.uid() = user_id` for SELECT, INSERT, UPDATE, and DELETE.
- For `student_profiles`, INSERT and UPDATE policies enforce `WITH CHECK (auth.uid() = id AND auth.uid() = user_id)`.
- Zero service_role keys or privileged database passwords are used in client applications or browser bundles.

---

## 4. Composite Foreign Key Strategy
Standard single-column foreign keys (`FOREIGN KEY (mission_id) REFERENCES missions(id)`) allow an attacker (User A) to attach their own child row to a victim's (User B's) mission ID, bypassing simple RLS checks.
To eliminate cross-user reference vulnerabilities at the database engine level:
1. Every parent table enforces `CONSTRAINT uq_<table>_id_user UNIQUE (id, user_id)`.
2. Every child table includes both `parent_id` and `user_id` and enforces:
   `FOREIGN KEY (parent_id, user_id) REFERENCES parent_table(id, user_id) ON DELETE CASCADE`.
This guarantees that PostgreSQL will reject any attempt to link User A's child row to User B's parent record, even before RLS policies are evaluated.

---

## 5. Enum-Like CHECK Constraints
All domain states are enforced via strict database `CHECK` constraints directly aligned with TypeScript domain types:
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

### Numeric Range Constraints:
- `student_profiles.target_score`: `CHECK (target_score >= 10.00 AND target_score <= 20.00)`
- `student_profiles.baseline_score`: `CHECK (baseline_score >= 0.00 AND baseline_score <= 20.00)`
- `student_profiles.weekly_study_hours`: `CHECK (weekly_study_hours >= 0)`
- `missions.estimated_minutes`: `CHECK (estimated_minutes > 0)`
- `diagnostic_answers.confidence`: `CHECK (confidence >= 1 AND confidence <= 5)`
- `practice_attempts.confidence`: `CHECK (confidence >= 1 AND confidence <= 5)`
- `retests.confidence`: `CHECK (confidence >= 1 AND confidence <= 5)`
- `diagnostic_results.observed_signal`: `CHECK (observed_signal >= 0 AND observed_signal <= 100)`
- `skill_mastery.confidence_score`: `CHECK (confidence_score IS NULL OR (confidence_score >= 0.00 AND confidence_score <= 1.00))`
- `errors.occurrence_count`: `CHECK (occurrence_count >= 1)`

---

## 6. Migration Assumptions
1. Target database is Supabase PostgreSQL 15+ (`erbvmpnxufgeinqnshzu`).
2. Schema is freshly applied to `public`.
3. Non-destructive DDL (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`) ensures structural safety without hiding drift.
4. Extensions `uuid-ossp` and `pgcrypto` are enabled.
5. Migration does NOT touch `auth.users` or Supabase internal schemas.

---

## 7. Index Strategy
Indexes are specifically curated to optimize RLS evaluations and composite FK joins:
1. `idx_student_profiles_user_id`: on `student_profiles(user_id)`
2. `idx_diagnostic_sessions_user_status`: on `diagnostic_sessions(user_id, status)`
3. `idx_diagnostic_answers_session_user`: on `diagnostic_answers(session_id, user_id)`
4. `idx_diagnostic_answers_user`: on `diagnostic_answers(user_id)`
5. `idx_diagnostic_results_session_user`: on `diagnostic_results(session_id, user_id)`
6. `idx_diagnostic_results_user`: on `diagnostic_results(user_id)`
7. `idx_missions_user_status`: on `missions(user_id, status)`
8. `idx_missions_user_skill`: on `missions(user_id, skill_id)`
9. `idx_practice_attempts_mission_user`: on `practice_attempts(mission_id, user_id)`
10. `idx_practice_attempts_user_skill`: on `practice_attempts(user_id, skill_id)`
11. `idx_errors_user_status`: on `errors(user_id, status)`
12. `idx_errors_user_skill`: on `errors(user_id, skill_id)`
13. `idx_errors_mission_user`: on `errors(mission_id, user_id)`
14. `idx_error_repairs_error_user`: on `error_repairs(error_id, user_id)`
15. `idx_error_repairs_user`: on `error_repairs(user_id)`
16. `idx_retests_error_user`: on `retests(error_id, user_id)`
17. `idx_retests_user`: on `retests(user_id)`
18. `idx_skill_mastery_user_skill`: on `skill_mastery(user_id, skill_id)`

---

## 8. What Is Intentionally NOT in This Schema
- **Content & Curriculum**: Lessons, topics, skill definitions, questions, and distractor taxonomies remain in code (`src/data/curriculum/`, `src/data/practice/`, `src/data/diagnostic/`).
- **Administrative / Teacher Roles**: No multi-tenant admin models, teacher dashboards, or school views.
- **Billing / Payments**: No subscription or transaction models.
- **BEM (Brevet d'Enseignement Moyen)**: Only BAC Sciences Expérimentales (3AS).
- **AI API / LLM State**: No LLM prompt logs, token usage, or external AI tables.
