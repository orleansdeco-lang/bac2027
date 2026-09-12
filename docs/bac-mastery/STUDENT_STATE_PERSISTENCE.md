# BAC Mastery — Student State Persistence Specification
## Dual-Storage, RLS Enforcement, and State Lifecycle

**Version:** 1.0.0  
**Baseline Date:** September 2026

---

## 1. Persistence Philosophy: Resilient Dual-Storage

BAC Mastery is designed with a **fail-safe dual-storage architecture**:
1. **Local-First Resilience:** A student can open the platform, complete Onboarding, take the Diagnostic, run practice sessions, and repair errors in the browser without any network connection or prior login. All data lives in `localStorage` under isolated keys.
2. **Cloud-Authoritative Sync:** When a student creates an account or signs in via Supabase, `StudentService.handleAuthSessionMigration(userId)` seamlessly transfers all local state into the 10 remote tables. Future writes write to Supabase while maintaining local cache coherence.

```
┌─────────────────────────────────────────────────────────────┐
│                    STUDENT INTERFACE                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     REPOSITORY LAYER                        │
│   (Student, Diag, Mission, Practice, Error, Repair, Retest) │
└──────────────┬───────────────────────────────┬──────────────┘
               │ (If unauthenticated)          │ (If authenticated)
               ▼                               ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐
│     Browser localStorage     │ │   Remote Supabase Postgres   │
│   - bac_mastery_profile      │ │   - 10 Foundation Tables     │
│   - bac_mastery_diag         │ │   - Strict RLS (auth.uid())  │
│   - bac_mastery_missions     │ │   - Foreign Key Cascades     │
│   - bac_mastery_errors       │ │   - Check Constraints        │
└──────────────────────────────┘ └──────────────────────────────┘
```

---

## 2. Remote Supabase Table Architecture (10 Foundation Tables)

| # | Table Name | Purpose | RLS Policy Key |
|---|---|---|---|
| 1 | `student_profiles` | Strategic goals, stream, target average, time, energy | `auth.uid() = id AND auth.uid() = user_id` |
| 2 | `diagnostic_sessions` | Initial 12-question diagnostic test execution | `auth.uid() = user_id` |
| 3 | `diagnostic_answers` | Granular item responses and latency | `auth.uid() = user_id` |
| 4 | `diagnostic_results` | Computed subject & dimension gap scores | `auth.uid() = user_id` |
| 5 | `missions` | Scheduled mission queue with status & priority | `auth.uid() = user_id` |
| 6 | `practice_attempts` | Practice question submissions with confidence & timing | `auth.uid() = user_id` |
| 7 | `errors` | Error records with self-attribution and repair status | `auth.uid() = user_id` |
| 8 | `error_repairs` | Completed repair steps, reflection, duration | `auth.uid() = user_id` |
| 9 | `retests` | Isomorphic twin test results validating recovery | `auth.uid() = user_id` |
| 10 | `skill_mastery` | Formal demonstrated mastery evidence records | `auth.uid() = user_id` |

---

## 3. Migration & State Synchronization Protocol

When a student authenticates:
1. `StudentService.handleAuthSessionMigration(userId)` reads existing local profile.
2. Checks if remote `student_profiles` already has a record for `userId`. If not, writes local profile with `id = userId`.
3. `syncAllLocalStorageToCloud(userId)` is executed:
   - Syncs diagnostic results and answers.
   - Syncs all cached missions (`MissionRepository.saveMissions`).
   - Syncs all recorded practice sessions (`PracticeRepository.savePracticeSession`).
   - Syncs all errors and error repairs (`ErrorRepository.saveError`, `RepairRepository.saveRepair`).
   - Syncs retest attempts (`RetestRepository.saveRetest`).
   - Syncs mastery records (`MasteryRepository.saveMasteryRecord`).
4. Result: Zero lost work, seamless transition from guest exploration to authenticated cloud persistence.

---

## 4. Multi-Tenant Security & Isolation Guarantees

1. **Strict User Isolation:** An authenticated student with JWT token $A$ can only view and mutate rows where `user_id = auth.uid()`.
2. **Anonymous Access Rejection:** Any `SELECT`, `INSERT`, `UPDATE`, or `DELETE` attempt by an unauthenticated anon client returns an empty dataset or an HTTP 401/403 forbidden error.
3. **Database Constraints:** Foreign keys (`ON DELETE CASCADE`), CHECK constraints on valid scores ($0 \le \text{score} \le 20$), and enumeration checks prevent invalid states.
