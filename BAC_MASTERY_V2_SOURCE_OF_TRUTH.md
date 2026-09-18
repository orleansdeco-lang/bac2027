# BAC MASTERY V2 — SOURCE OF TRUTH ARCHITECTURE

**Document Version:** 2.0.0  
**Status:** ARCHITECTURE FROZEN  
**Authority:** Core Architecture Group  
**Workspace:** BAC BEM (Algerian BAC Learning Operating System)  
**Invariant:** Pure specification — zero code mutations.

---

## 1. The Cardinal Architectural Law

> [!CAUTION]
> **THE CARDINAL PRINCIPLE:**  
> **THERE MUST NEVER BE TWO AUTHORITATIVE COPIES OF THE SAME LEARNER OR CURRICULUM STATE.**  
> Every data element in BAC Mastery V2 has exactly one primary home. Every other representation is an ephemeral cache, a read-only projection, or a temporary presentation buffer.

---

## 2. The Five Tiers of System Truth

```mermaid
flowchart TD
    subgraph Tier 1: Git Content Repository [Static & Versioned Truth]
        G1[Curriculum & Syllabi]
        G2[Canonical Skills & DAG]
        G3[Questions & Rubrics]
        G4[Inspection Guidelines]
    end

    subgraph Tier 2: Supabase Database [Authoritative Runtime Learner Truth]
        DB1[Profiles & Subscriptions]
        DB2[Immutable Evidence Events]
        DB3[Mastery & Retention States]
        DB4[Error Ledgers & Missions]
    end

    subgraph Tier 3: Browser Cache & IndexedDB [Transient Offline Mirror]
        C1[Optimistic Local State Cache]
        C2[Pending Offline Event Queue]
    end

    subgraph Tier 4: React UI State [Ephemeral Presentation Only]
        R1[Form inputs, active timer, scroll, modals]
    end

    subgraph Tier 5: AI Prompt Context [Temporary Reasoning Scratchpad]
        AI1[Socratic prompt context, session tokens]
    end

    Tier 1 -->|Loaded at Build / Server Startup| Tier 2
    Tier 2 -->|Bidirectional Sync / Rehydration| Tier 3
    Tier 3 -->|Reactive Hooks (useLearnerState)| Tier 4
    Tier 2 -->|Sanitized Context Injection| Tier 5
```

---

### Tier 1: Git / Content Repository (The Curriculum Truth)
- **Nature:** Version-controlled, peer-reviewed, cryptographically signed files in the repository.
- **Authoritative For:**
  - Official Algerian curriculum definitions (Ministère de l'Éducation Nationale).
  - Curriculum versioning tags (e.g., `curriculum_dz_2026_v1`).
  - Canonical Skill registry and Directed Acyclic Graph (DAG) of prerequisites.
  - Granular learning objectives, theoretical concepts, and documented misconceptions.
  - Question bank items, official scoring rubrics, and distractor taxonomy bindings.
  - Educational media metadata (verified video URLs, diagrams, formula cards).
  - Mission templates and pedagogical repair blueprints.
- **Rules:**
  - Build-time and CI/CD tests validate that there are zero circular prerequisite dependencies and zero untagged questions.
  - The runtime database NEVER overrides curriculum coefficients or skill relationships.

---

### Tier 2: Supabase Cloud Database (The Learner Runtime Truth)
- **Nature:** PostgreSQL database with Row Level Security (RLS), ACID transactions, and point-in-time recovery.
- **Authoritative For:**
  - Registered student identity and authentication records.
  - Student goals, target BAC scores, and pacing preferences.
  - Append-only immutable log of raw `Attempt`s and `EvidenceEvent`s.
  - Authoritative `LearnerSkillState`s (mastery scores, stability, status).
  - Active error events, repair tracking, and retest twin verifications.
  - Spaced retrieval schedules (`learner_retention_schedules`).
  - Mission assignments, progress timestamps, and completion statuses.
  - Mock BAC exam sessions and verified subject attempt scores.
  - Subscription status, Chargily Pay invoices, and payment receipts.
- **Rules:**
  - When browser storage conflicts with Supabase, **Supabase always wins**.
  - Direct student mutations to mastery, errors, or retention tables are blocked by RLS policies; updates must pass through authenticated Server Actions / Evidence Pipeline.

---

### Tier 3: Browser Local Storage / IndexedDB (Transient Offline Mirror)
- **Nature:** Client-side local storage and IndexedDB.
- **Strict Role in V2:**
  - Read-through cache to enable instantaneous UI rendering without network lag.
  - Offline event queue holding un-synced `EvidenceEvent`s recorded during network dropouts.
  - User UI preferences (dark/light theme, collapsed sidebar state).
- **Prohibitions:**
  - Local storage is **STRICTLY PROHIBITED** from acting as an independent source of truth.
  - Clearing local storage must NEVER result in permanent data loss; rehydrating from Supabase will restore 100% of the student's progress and state.

---

### Tier 4: React Runtime Component State (Ephemeral Presentation Only)
- **Nature:** React hooks (`useState`, `useReducer`, component context).
- **Strict Role in V2:**
  - Active form input values before submission.
  - Interactive timer ticks, animation flags, modal dialog open/closed states.
  - Drag-and-drop accounting journal row reordering before validation.
- **Prohibitions:**
  - React state must **NEVER** store authoritative learning progress.
  - React state must **NEVER** calculate persistent streaks or mastery scores.

---

### Tier 5: AI Context Scratchpad (Temporary Reasoning Window)
- **Nature:** Ephemeral LLM system prompt context injected during API calls to `/api/tutor`.
- **Strict Role in V2:**
  - Socratic guidance, conversational explanations, breakdown of hints in Algerian dialect (Darija) and Arabic.
- **Prohibitions:**
  - The LLM has **ZERO** write access to the database.
  - The LLM cannot award mastery points or declare an error resolved.

---

## 3. Reconciliation Rules for Divergence

| Conflict Scenario | Resolution Rule | Action Taken |
| :--- | :--- | :--- |
| **Local storage version < Supabase version** | Supabase is authoritative. | Overwrite local cache with cloud snapshot. |
| **Local storage has un-synced offline attempts** | Monotonic event sequence reconciliation. | Push offline events to Supabase Evidence Pipeline, process state delta, update cloud version, rehydrate local cache. |
| **Network partition during mission attempt** | Idempotent event buffering. | Attempt buffered in IndexedDB queue with unique `attemptId`; submitted upon reconnection; deduplicated on server. |
| **Curriculum updated in Git while student is active** | Versioned curriculum migration. | Student state evaluated against new curriculum version via formal state migration script; never corrupted silently. |


---

## 4. The Architectural Layer Invariant: Preserving the 4 Distinct Tiers

```text
RAW ATTEMPT (Student interactions, clicks, text entries, timestamps, hint views)
     ↓
EVIDENCE (Multi-dimensional, methodology-aware, immutable EvidenceEvent)
     ↓
DERIVED LEARNER STATE (Mastery status: not_yet/emerging/demonstrated/review_due, errors, retention)
     ↓
DECISION (Deterministic Next Best Action: actionType, targetSkill, durationClass, reasonCode)
```

**Rule:** No layer may be skipped, conflated, or collapsed into another.  
Raw attempts do not directly produce decisions; evidence does not directly equal mastery; decisions do not directly alter student records without an active mission loop.
