# BAC MASTERY V2 — END-TO-END DATA FLOW ARCHITECTURE

**Document Version:** 2.0.0  
**Status:** ARCHITECTURE FROZEN  
**Authority:** Core Architecture Group  
**Workspace:** BAC BEM (Algerian BAC Learning Operating System)  
**Invariant:** Pure specification — zero code mutations.

---

## 1. Architectural Data Flow Diagram

The complete end-to-end data lifecycle of BAC Mastery V2 is represented below. Four distinct types of flows are explicitly differentiated:
1. **Authoritative Flow (Bold Blue):** Strict transactional path that mutates learning truth.
2. **Read / Cache Flow (Green):** Reactive reads, client rehydration, and cache hits.
3. **Derived Calculation Flow (Amber):** Pure deterministic state reductions and projections.
4. **AI Assistance Flow (Dashed Purple):** Non-authoritative Socratic dialogue and explanation generation.

```mermaid
flowchart TD
    %% Tier 1: Static Definitions
    subgraph CurriculumLayer [1. Curriculum & Content OS (Git Repository)]
        Curriculum[Curriculum Definitions & Coefficients]
        SkillsDAG[Canonical Skills & Prerequisite DAG]
        QuestionsBank[Question Items & Rubrics]
    end

    %% Tier 2: Interactive Practice Session
    subgraph PresentationLayer [2. Experience Layer (Next.js UI)]
        StudentUI[Student Interface / Mission Runner]
        LocalCache[(Local Cache: bac_learner_state_v2)]
        OfflineQueue[Offline Event Queue]
        AIAssistant[Socratic AI Tutor & Explainer]
    end

    %% Tier 3: Telemetry & Processing
    subgraph TelemetryLayer [3. Assessment & Evidence Pipeline]
        RawAttempt[Raw Student Attempt]
        HeadlessEvaluator[Headless Evaluator Engine]
        EvidenceEvent[Standardized EvidenceEvent]
    end

    %% Tier 4: Authoritative Persistence & Derivation
    subgraph ServerLayer [4. Authoritative Backend (Supabase)]
        EvidenceStore[(evidence_events table)]
        LearnerModel[Learner Model State Reducer]
        LearnerStateStore[(learner_states table)]
    end

    %% Tier 5: Decision & Guidance
    subgraph GuidanceLayer [5. Deterministic Decision Engine]
        DecisionEngine[Priority & Decision Evaluator]
        RoadmapEngine[Roadmap Trajectory Planner]
        MissionEngine[Mission Generator & Packager]
    end

    %% Authoritative Forward Path
    QuestionsBank -->|Render Question Item| StudentUI
    StudentUI -->|1. Submit Action| RawAttempt
    RawAttempt -->|2. Pass to Evaluator| HeadlessEvaluator
    HeadlessEvaluator -->|3. Emit Verified Event| EvidenceEvent
    EvidenceEvent -->|4a. Online Path: Transactional Write| EvidenceStore
    EvidenceEvent -.->|4b. Offline Path: Queue Event| OfflineQueue
    OfflineQueue -.->|Replay on Reconnection| EvidenceStore
    EvidenceStore -->|5. Ingest Event Stream| LearnerModel
    LearnerModel -->|6. Update Skill/Error/Retention State| LearnerStateStore

    %% Derived Guidance Path
    LearnerStateStore -->|7. Supply Authoritative State| DecisionEngine
    SkillsDAG -->|Prerequisite & Weight Constraints| DecisionEngine
    DecisionEngine -->|8. Issue Next Best Action| RoadmapEngine
    RoadmapEngine -->|9. Order Daily Missions| MissionEngine
    MissionEngine -->|10. Dispatch New Mission| StudentUI

    %% Read & Cache Flows
    LearnerStateStore ==>|Rehydrate State Snapshot| LocalCache
    LocalCache ==>|Reactive Hook: useLearnerState| StudentUI

    %% AI Assistance Flow (Non-Authoritative)
    LearnerStateStore -.->|Read Active Error Code| AIAssistant
    StudentUI <===>|Socratic Chat / Dialogue| AIAssistant

    %% Styling
    classDef authoritative stroke:#0284c7,stroke-width:2px;
    classDef cache stroke:#16a34a,stroke-width:2px;
    classDef derived stroke:#d97706,stroke-width:2px;
    classDef ai stroke:#9333ea,stroke-width:2px,stroke-dasharray: 5 5;

    class RawAttempt,EvidenceEvent,EvidenceStore,LearnerModel,LearnerStateStore authoritative;
    class LocalCache,OfflineQueue cache;
    class DecisionEngine,RoadmapEngine,MissionEngine derived;
    class AIAssistant ai;
```

---

## 2. Walkthrough of the 4 Distinct Data Flows

### 2.1. The Authoritative Flow (Write Pipeline)
1. **Trigger:** Student clicks an option, types a mathematical derivation, or enters an accounting balance.
2. **Raw Attempt:** Encapsulates timestamps, inputs, hint usage, and client telemetry.
3. **Headless Evaluation:** The client or server evaluator scores the response against the official rubric.
4. **Evidence Generation:** An immutable, methodology-aware `EvidenceEvent` is constructed.
5. **Persistence & Reduction:** The event is written to Supabase `evidence_events`. The `LearnerModel` updates mastery scores, error logs, and SM-2 schedules in an atomic transaction.

---

### 2.2. The Read / Cache Flow (Rehydration & Display)
1. **Optimistic Local Update:** On client submission, the local state cache (`bac_learner_state_v2`) reflects the event immediately for zero UI latency.
2. **Server Confirmation:** Once the server processes the event, it emits the updated sequence number (`seqNumber`).
3. **Reactive UI Consumption:** All components access learning state through standard typed hooks (`useLearnerState()`, `useSkills()`, `useMissions()`).
4. **Zero Hydration Mismatch:** SSR pages render default skeletons or server-fetched snapshots; client rehydrates cleanly without conflicting date loops.

---

### 2.3. The Derived Calculation Flow (Guidance Loop)
1. **State Evaluation:** The `DecisionEngine` receives the unified `LearnerState`.
2. **Constraint Checking:** Evaluates hard safety constraints (unrepaired prerequisites, critical retention overdue (ge 4) days).
3. **Multi-Factor Scoring:** Ranks remaining skills by Algerian BAC coefficient, gap severity, and exam recurrence.
4. **Mission Assembly:** The `MissionEngine` packages the selected skill into a bounded 15-minute micro-mission.
5. **Student Delivery:** The mission appears as the primary CTA on the student's dashboard.

---

### 2.4. The AI Assistance Flow (Constrained Socratic Dialogue)
1. **Context Request:** When a student clicks "Ask AI Tutor" during practice, the system attaches:
   - Target Skill ID and title in Arabic.
   - Student's active `ErrorTaxonomyCode` (e.g., `keyword_missing`).
   - The question prompt and stimulus (WITHOUT the solution key).
2. **Socratic Guardrails:** The LLM prompt explicitly instructs the model:
   - "Never give the final numerical answer or write the final proof."
   - "Guide the student to identify which BAC ministerial keyword is missing."
   - "Use simple Algerian Arabic (Darija) and formal French/Arabic scientific terms."
3. **Zero State Authority:** The AI chat exchange produces no direct database writes.

---

## 3. Data Integrity & Race Condition Prevention

1. **Optimistic Locking via Monotonic Sequence Numbers:**  
   Every state update increments `seqNumber`. If a concurrent update is detected, the older payload is rejected, and the client triggers an automatic rehydration pass.
2. **Idempotent Ingestion:**  
   If network retries send the same `evidenceId` twice, the server ignores duplicate insertions via unique constraints on `evidence_events(evidence_id)`.
3. **Offline Event Buffering:**  
   Events recorded while offline are queued in IndexedDB and replayed in chronological order upon reconnection.
