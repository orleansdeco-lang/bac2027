# BAC Mastery — Backend Foundation Audit
**Audit Date:** September 11, 2026  
**Architectural Scope:** Transitioning from Local-First Storage to Supabase Auth & PostgreSQL Foundation

---

## 1. Executive Summary

This audit establishes the baseline for connecting the existing BAC Mastery application to its dedicated, independent Supabase project (`erbvmpnxufgeinqnshzu`).

BAC Mastery currently runs on a high-fidelity local-first client architecture where learning engines make deterministic decisions against browser `localStorage`. No user accounts, database tables, or server-side persistence currently exist.

The objective of this phase is to establish:
1. **Supabase Auth** (email/password)
2. **Clean PostgreSQL Foundation** (10 student-owned tables with strict Row Level Security)
3. **Repository / Data Access Layer** (decoupling UI and domain engines from Supabase client details)
4. **Non-Destructive LocalStorage Migration Strategy** (zero loss of prototype data)

---

## 2. Current Persistence Model

All persistent student state currently resides in the browser's `Window.localStorage`.
- Storage operations are synchronous and scoped to the browser profile.
- There is zero multi-device synchronization.
- If the browser cache is cleared or opened in Incognito mode, the learning journey resets.

### Current LocalStorage Keys & Namespaces:

| LocalStorage Key | Domain Entity / Subsystem | Data Structure | File References |
| :--- | :--- | :--- | :--- |
| `bac_mastery_onboarding_draft` | Onboarding In-Flight State | `OnboardingDraft` | `src/lib/onboarding/profile.ts` |
| `bac_mastery_student_profile` | Completed Strategic Profile | `StrategicProfile` | `src/lib/onboarding/profile.ts`, `src/app/diagnostic/page.tsx` |
| `bac_mastery_diagnostic_session` | In-Flight Diagnostic Test | `DiagnosticSession` | `src/lib/diagnostic/session.ts` |
| `bac_mastery_diagnostic_results` | Diagnostic Scoring & Analysis | `DiagnosticAnalysisResult` | `src/lib/diagnostic/session.ts` |
| `bac_mastery_missions` | Generated Learning Missions | `Record<string, Mission>` | `src/lib/mission/storage.ts` |
| `bac_mastery_active_mission_id` | Current Active Mission ID | `string` | `src/lib/mission/storage.ts`, `src/app/page.tsx` |
| `bac_mastery_practice_sessions` | Practice Question Attempts | `PracticeSession[]` | `src/lib/mission/storage.ts` |
| `bac_mastery_errors` | Error Lab Mistakes & Retests | `Record<string, ErrorRecord>`| `src/lib/mission/storage.ts` |
| `bac_mastery_mastery` | Evidence-Based Skill Mastery | `Record<string, MasteryEvidence>`| `src/lib/mission/storage.ts` |
| `bac_mastery_locale` | UI Language Preference | `"ar" \| "fr"` | `src/lib/i18n/context.tsx` |

---

## 3. Current Authentication State

- **Current State**: Unauthenticated / Anonymous.
- There is currently no login page, signup flow, or user profile authentication.
- Any visitor to `/` can directly access `/onboarding`, `/diagnostic`, and `/roadmap`.
- `@supabase/supabase-js` (`^2.45.6`) is installed in `package.json`, but client utilities (`src/lib/supabase/client.ts` and `src/lib/supabase/server.ts`) were inert scaffolding returning `null` when environment variables were unconfigured.

---

## 4. Current Domain Entities (TypeScript)

The domain logic is organized into 5 robust subsystems in `src/types/`:

1. **Student & Onboarding** (`src/types/onboarding.ts`, `src/types/student.ts`):
   - `StrategicProfile`: Education level, stream (`sciences_experimentales`, `technique_math`, etc.), target score ($10.00-20.00$), baseline estimate, weekly available time, obstacles, energy state (`good`, `normal`, `tired`, `stressed`).
   - `InitialGapResult`: Quantitative gap calculation.
2. **Diagnostic** (`src/types/diagnostic.ts`):
   - `DiagnosticSession`: 15-question diagnostic session state with responses.
   - `DiagnosticAnalysisResult`: Core diagnostic signal ($0-100$), qualitative signal band, dimension scores, confidence calibration index, preliminary bottleneck candidate.
3. **Missions & Practice** (`src/types/mission.ts`):
   - `Mission`: Pedagogical action unit with canonical states (`available`, `in_progress`, `repair_needed`, `retest_ready`, `needs_more_work`, `mastered`).
   - `PracticeSession`: Question attempt sequence, correctness, confidence ratings ($1-5$), solving times.
4. **Error Lab** (`src/types/mission.ts`, `src/types/error-lab.ts`):
   - `ErrorRecord`: Error attribution taxonomy (`forgot_information`, `misunderstood_concept`, `methodology_error`, etc.), repair lifecycle (`identified`, `repair_started`, `repair_completed`, `retest_passed`, `retest_failed`), recurrence tracking.
5. **Mastery** (`src/types/mission.ts`):
   - `MasteryEvidence`: Three-tier evidence progression (`not_yet`, `emerging`, `demonstrated`).

---

## 5. Current Supabase Integration State

- **Dedicated BAC Mastery Project**:
  - Reference: `erbvmpnxufgeinqnshzu`
  - URL: `https://erbvmpnxufgeinqnshzu.supabase.co`
- **Audit Verification**:
  - Live HTTP check against `https://erbvmpnxufgeinqnshzu.supabase.co/auth/v1/health` confirmed GoTrue `v2.196.0` is operational.
  - Live query confirmed that the `public` schema is clean and empty (0 tables exist).
  - Storage: 0 buckets exist.
- **Client Scaffolding**:
  - `src/lib/supabase/client.ts` creates browser client with graceful fallback.
  - `src/lib/supabase/server.ts` provides server client scaffolding.

---

## 6. Migration Risks & Mitigation Strategies

| Risk | Impact | Mitigation Strategy |
| :--- | :--- | :--- |
| **Premature LocalStorage Invalidation** | Student loses in-flight diagnostic or onboarding draft upon browser refresh. | Preserve LocalStorage read fallback; introduce a clean repository sync that migrates local state into Supabase upon user signup/login. |
| **Engine Coupling to Supabase** | Domain algorithms (`getNextBestMission`, scoring, gap calculation) break if DB schema changes. | Strict Repository Layer: Engines continue to operate on pure TypeScript objects in memory; repositories handle persistence. |
| **Insecure Foreign Key Relationships** | User A creates a child entity (e.g. `practice_attempt`) pointing to User B's `mission`. | Enforce **Composite Foreign Keys**: `UNIQUE(id, user_id)` on parents, and `FOREIGN KEY (parent_id, user_id) REFERENCES parent(id, user_id) ON DELETE CASCADE` on children. |
| **Leaking Service Role Keys** | Malicious client gains admin bypass on RLS. | Strictly use `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Zero service_role keys in client bundles, repository code, or Git commits. |
| **Content Bloat in Student DB** | Conflating curriculum/question data with student telemetry. | Strict boundary: 0 content tables in this migration. Static curriculum remains in-code (`src/data/`). |

---

## 7. Proposed Repository / Data-Access Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                       UI Layer                          │
│   (Pages, Components, Modals in src/app/ & src/components)│
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                     Domain Engines                      │
│   (Adaptive Roadmap, getNextBestMission, Diagnostic,    │
│    Calibration, Error Lab in src/lib/roadmap, etc.)     │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│               Repository Layer (Data Access)            │
│   (StudentRepo, DiagnosticRepo, MissionRepo, ErrorRepo) │
│   - Check Auth Session                                  │
│   - Authenticated: Query / Mutate Supabase with RLS     │
│   - Unauthenticated / Offline: Fallback to LocalStorage │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                   Supabase PostgreSQL                   │
│   (10 Student-Owned Tables with auth.uid() = user_id)   │
└─────────────────────────────────────────────────────────┘
```

### Planned Repositories:
1. `StudentProfileRepository`: Profile creation, update, onboarding completion check.
2. `DiagnosticRepository`: Session creation, answer recording, diagnostic analysis result persistence.
3. `MissionRepository`: Mission generation persistence, status transitions (`available` $\to$ `in_progress` $\to$ `mastered`).
4. `PracticeRepository`: Practice attempts recording.
5. `ErrorLabRepository`: Error records, repair milestones, retest variant outcomes.
6. `MasteryRepository`: Evidence-based mastery updates.
