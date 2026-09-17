# BAC MASTERY 2.0 — COMPLETE LEARNER STATE MAPPING SPECIFICATION
**Document Identifier:** `BAC_MASTERY_V2_LEARNER_STATE_MAP.md`  
**Phase:** Phase 0 — Project Audit & Freeze  
**Task:** TASK 0.2 — Feature Inventory (Special Analysis: Learner State)  
**Date:** September 17, 2026  
**Auditor:** Senior EdTech Product & System Architect (Google DeepMind Antigravity Team)  
**Status:** COMPLETE & FROZEN — ANALYSIS & MAPPING ONLY (Zero Code Mutations)

---

## 1. EXECUTIVE SUMMARY & STATE INVARIANTS

In BAC Mastery 2.0, the core epistemic invariant states:
> **"The UI is not the brain. The Learner State is not a random collection of counters. It is an authoritative, derived model of the student's true cognitive capabilities, generated strictly from empirical learning evidence."**

Currently, student state is fragmented across **15 distinct browser localStorage keys**, **10 client React context states**, and **16 Supabase tables**. This document maps the current distributed state architecture, identifies structural vulnerabilities, and defines the unified **Target Learner State Architecture**.

---

## 2. CURRENT LEARNER STATE MAP (AS-IS INVENTORY)

### 2.1 Browser LocalStorage Keys
| Storage Key | Data Structure Stored | Primary Owning File | Sync Policy to Cloud | Vulnerability / Risk |
| :--- | :--- | :--- | :--- | :--- |
| `bac_auth_user` | User ID, email, metadata, guest flag | `src/lib/auth/context.tsx` | Synced on Supabase login | Stale session if cleared by browser cleanup |
| `bac_student_profile_data_v1` | Academic profile, wilaya, stream, phone | `src/lib/onboarding/profile.ts` | Upserts to `student_profiles` | Can drift from server record if offline |
| `bac_strategic_profile_v1` | Target score, study pace, baseline estimate | `src/lib/onboarding/profile.ts` | Upserts to `student_profiles` | Duplicate of `bac_student_profile_data_v1` |
| `bac_diagnostic_session` | Current diagnostic progress, answers map | `src/lib/diagnostic/session.ts` | Upserts on session complete | Uncompleted sessions lost on device switch |
| `bac_diagnostic_results` | Calculated sub-scores, bottleneck, calibration | `src/lib/diagnostic/session.ts` | Writes to `diagnostic_results` | Overwritten if diagnostic restarted |
| `bac_mastery_missions` | Dictionary of generated mission objects | `src/lib/mission/storage.ts` | Partial sync via repository | Mission status can conflict with server |
| `bac_mastery_active_mission_id` | ID string of current active mission | `src/lib/mission/storage.ts` | Local-only pointer | Desyncs if mission completed on another tab |
| `bac_mastery_practice_sessions` | Array of completed practice attempt records | `src/lib/mission/storage.ts` | Batch synced via `/api/student/sync` | High memory footprint if unpurged |
| `bac_mastery_errors` | Dictionary of documented `ErrorRecord` | `src/lib/mission/storage.ts` | Upserts to `errors` table | Recurrence count calculated locally |
| `bac_mastery_mastery` | Dictionary of `MasteryEvidence` records | `src/lib/mission/storage.ts` | Upserts to `skill_mastery` | Client can prematurely claim mastery |
| `bac_mastery_spaced_schedules` | Dictionary of `SpacedReviewSchedule` | `src/lib/mission/storage.ts` | Writes to `retention_schedules` | Clocks can drift without server timestamp |
| `bac_retests_local_v1` | Array of isomorphic retest records | `src/lib/repositories/retest-repository.ts` | Upserts to `retests` table | Incomplete retest twins |
| `bac_repairs_local_v1` | Array of completed repair sessions | `src/lib/repositories/repair-repository.ts` | Upserts to `error_repairs` | Unsynced notes lost if browser cleared |
| `bac_pilot_events` | Array of telemetry interaction events | `src/lib/analytics/index.ts` | Flushed via `/api/telemetry/events` | May fill localStorage quota |
| `pilot_payment_records` | CCP/BaridiMob submission receipt data | `src/lib/payment/manual-pilot-provider.ts` | Uploads receipt image to Supabase | Local receipt status does not auto-update |

---

### 2.2 React Runtime Component State
| Component / Hook | State Variables | Scope & Lifetime | Risk |
| :--- | :--- | :--- | :--- |
| `AuthContext` (`context.tsx`) | `user`, `profile`, `isLoading`, `trialStatus` | App-wide tree | Multiple asynchronous fetch waterfalls on mount |
| `DiagnosticPage` (`page.tsx`) | `session`, `questions`, `currentIndex`, `timeSpent` | Route lifetime | State resets if page reloaded without active session save |
| `MissionPage` (`[missionId]/page.tsx`) | `mission`, `activeTab`, `selectedAnswer`, `feedback` | Page lifetime | Intermediate practice answers held in unpersisted component state |
| `ErrorLabPage` (`page.tsx`) | `selectedError`, `activeTab`, `repairStep` | Page lifetime | Repair progress not saved until final step submission |
| `DashboardPage` (`page.tsx`) | `activeMission`, `roadmapState`, `kpis` | Page lifetime | Heavy calculation waterfall on initial load |

---

### 2.3 Supabase PostgreSQL Tables (Cloud State)
| Table Name | Entity Represented | Authoritative Invariant |
| :--- | :--- | :--- |
| `student_profiles` | Identity, Wilaya, Stream, Trial access | Single source of truth for student entitlement and academic path |
| `diagnostic_sessions` | Diagnostic session metadata | Records start, completion timestamp, and stream examined |
| `diagnostic_answers` | Individual question responses | Empirical record of choice, response time, and confidence |
| `diagnostic_results` | Derived diagnostic analysis | Baseline score, cognitive dimension scores, identified bottleneck |
| `missions` | Generated micro-interventions | Tracks intervention lifecycle (`available`, `in_progress`, `mastered`) |
| `practice_attempts` | Practice exercise attempts | Empirical record of question attempts and errors |
| `errors` | Documented student blunders | 10-category taxonomy, recurrence flags, repair status |
| `error_repairs` | Remedial intervention records | Documented reflection and repair steps completed |
| `retests` | Twin question validations | Formal verification proving conceptual repair |
| `skill_mastery` | Demonstrated mastery records | Epistemic proof of mastery with verification timestamps |
| `retention_schedules` | Spaced retrieval schedules | Interval days, urgency state, decay rate, next due date |
| `payment_orders` | Algerian payment receipts | CCP / BaridiMob transactions, receipt URLs, approval states |

---

## 3. ARCHITECTURAL VULNERABILITIES OF CURRENT STATE

1. **Dual Source of Truth:** LocalStorage and Supabase maintain parallel records of `skill_mastery` and `missions`. If a student uses two devices, local records can overwrite more recent cloud progress.
2. **Missing Attempt-to-Evidence Decoupling:** When a student submits a question, the UI currently updates `MasteryEvidence` directly, skipping the epistemic layer that weighs evidence strength (weak signal vs demonstrated proof).
3. **Fragmented Error Lifecycle:** An error is logged in `bac_mastery_errors`, repaired in `bac_repairs_local_v1`, and retested in `bac_retests_local_v1`. These are 3 separate storage buckets instead of a single unified error lifecycle machine.

---

## 4. TARGET LEARNER STATE MAP (V2 ARCHITECTURE)

In BAC Mastery 2.0, all student cognitive state is consolidated into the canonical **`LearnerState`** model defined in `src/domain/contracts/learner.contract.ts`:

```typescript
export interface LearnerState {
  userId: string;
  streamId: StreamId;
  techniqueMathSpecialty?: TechniqueMathSpecialty;
  targetScore: number;
  baselineScore?: number;
  
  // 1. Skill State Map (Keyed by canonical Skill ID)
  skills: Record<string, LearnerSkillState>;
  
  // 2. Active Error State (Unified Error Lifecycle)
  activeErrors: ActiveErrorState[];
  
  // 3. Spaced Retrieval Retention Schedules
  retentionSchedules: Record<string, SpacedReviewSchedule>;
  
  // 4. Derived Epistemic Sets (Computed, Never Mutated Directly)
  masteredSkillIds: string[];
  emergingSkillIds: string[];
  needsMoreWorkSkillIds: string[];
  reviewDueSkillIds: string[];
  
  // 5. Metacognitive Index
  calibrationIndex: number; // -1.0 (Underconfident) to +1.0 (Overconfident)
  
  lastActiveAt: string;
}
```

### 4.1 Granular Skill State Model (`LearnerSkillState`)
```typescript
export interface LearnerSkillState {
  skillId: string;
  subjectId: SubjectId;
  masteryStatus: "not_yet" | "emerging" | "demonstrated" | "review_due";
  consecutiveSuccesses: number;
  totalAttempts: number;
  lastTestedAt?: string;
  lastSuccessAt?: string;
  lastLapseAt?: string;
  nextReviewDueAt?: string;
  isOverdueForReview: boolean;
  evidenceStrength: "weak" | "moderate" | "strong" | "definitive";
}
```

### 4.2 Unified Active Error Model (`ActiveErrorState`)
```typescript
export interface ActiveErrorState {
  id: string;
  skillId: string;
  subjectId: SubjectId;
  questionId: string;
  suspectedErrorType: SuspectedErrorType; // 10 Canonical Categories
  repairStatus: "identified" | "repair_started" | "repair_completed" | "retest_passed" | "retest_failed";
  isRecurring: boolean;
  attemptCount: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## 5. STATE TRANSITION RULES & INVARIANTS

```text
Raw Student Attempt (Question, Option, Time, Confidence)
             │
             ▼
    [ Evidence Engine ] ──► Computes Evidence Record & Strength
             │
             ▼
    Does evidence prove mastery?
    ├── YES (First success)      ──► Set skillStatus = "emerging"
    ├── YES (Validated retest)   ──► Set skillStatus = "demonstrated" -> Seed SpacedReviewSchedule
    └── NO  (Lapse / Blunder)    ──► Set skillStatus = "not_yet" -> Open ActiveErrorState
                                     (If lapse count >= 2 ──► Flag as "recurring_error")
```

### Fundamental Rules:
1. **Rule of Pure Derivation:** `masteredSkillIds`, `emergingSkillIds`, and `reviewDueSkillIds` are derived views of `skills`. The UI cannot append to `masteredSkillIds` directly.
2. **Rule of Cloud Supremacy:** When connecting online, the server's immutable attempt and evidence log recomputes the state. LocalStorage is an offline cache, not an authority.
3. **Rule of Recurrence:** An active error is only resolved when `retestStatus === "retest_passed"` on an unseen isomorphic twin question.
