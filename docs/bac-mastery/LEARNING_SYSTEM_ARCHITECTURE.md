# BAC Mastery — Learning System Architecture Specification
**Document Version:** 1.0.0  
**Phase:** Prompt 18.1  
**Target:** System Architecture, Data Flow, Subsystem Interaction  

---

## 1. Subsystem Interaction Architecture

The BAC Mastery Learning Operating System (LOS) coordinates 12 modular, evidence-driven subsystems. Every subsystem communicates through pure deterministic contracts and observable evidence records:

```
+─────────────────────────────────────────────────────────────────────────────+
|                             STUDENT PROFILE LAYER                           |
|      Goal / Target Score • Available Time • Energy State • Stream & Specialty|
+──────────────────────────────────────┬──────────────────────────────────────+
                                       │
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
|                         DIAGNOSTIC & GAP ANALYSIS LAYER                     |
|  6 Cognitive Dimensions: Knowledge, Understanding, Application,              |
|                          Methodology, Speed, Confidence                     |
+──────────────────────────────────────┬──────────────────────────────────────+
                                       │
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
|                           CENTRAL PLANNING ENGINE                           |
|                    ┌─────────────────────────────────┐                      |
|                    │   Deterministic Priority Tree   │                      |
|                    └────────────────┬────────────────┘                      |
|                                     │                                       |
|        ┌────────────────────────────┼────────────────────────────┐          |
|        ▼                            ▼                            ▼          |
|  [Priority 1: Loop]       [Priority 2: Recurring]     [Priority 3: Review]  |
|  Repair or Retest Ready   Error Root-Cause Fix        Spaced Review Due     |
|        │                            │                            │          |
|        └────────────────────────────┼────────────────────────────┘          |
|                                     ▼                                       |
|                         [ ONE NEXT BEST ACTION ]                            |
|                          "واش ندير دروك بالتدقيق؟"                          |
+──────────────────────────────────────┬──────────────────────────────────────+
                                       │
                                       ▼
+─────────────────────────────────────────────────────────────────────────────+
|                           MISSION EXECUTION ENGINE                          |
|  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────────────────┐  |
|  │   Study Engine   │  │  Practice Engine │  │ Error Intelligence Engine │  |
|  │  13-Step Lesson  │  │ Guided -> Indep. │  │  10-Type Root Attribution │  |
|  └─────────┬────────┘  └────────┬─────────┘  └─────────────┬─────────────┘  |
|            │                    │                          │                |
|            └────────────────────┼──────────────────────────┘                |
|                                 ▼                                           |
|                   ┌───────────────────────────┐                             |
|                   │ Retest Engine (Twin Test) │                             |
|                   │ Max 2 Cycles Safeguard    │                             |
|                   └─────────────┬─────────────┘                             |
+─────────────────────────────────┼───────────────────────────────────────────+
                                  │
                                  ▼
+─────────────────────────────────────────────────────────────────────────────+
|                        EVIDENCE & RETENTION LAYER                           |
|  ┌─────────────────────────────────────┐  ┌───────────────────────────────┐ |
|  │        Mastery Evidence Engine      │  │     Spaced Review Engine      │ |
|  │ not_yet -> emerging -> demonstrated │  │ Multi-Factor Adaptive Interval│ |
|  └─────────────────────────────────────┘  └───────────────────────────────┘ |
+─────────────────────────────────────────────────────────────────────────────+
```

---

## 2. Structural Component Breakdown

### 2.1 The Study Engine
- **Responsibility**: Conceptual deconstruction and procedural modeling.
- **Contract**: Accepts a `SkillId` and `SubjectMethodologyProfile`; renders the 13-element lesson sequence.
- **Invariant**: Marks a student session as having `EXPOSURE`, but never records `MASTERY` until independent retrieval and retest are demonstrated.

### 2.2 The Practice Engine
- **Responsibility**: Scaffolded progression through guided, semi-guided, independent, and mixed problem sets.
- **Distractor Mapping**: Every incorrect choice in a multiple-choice or short-answer practice question is mapped to a specific `SuspectedErrorType`.

### 2.3 The Error Intelligence Engine
- **Responsibility**: Captures and analyzes errors.
- **Recurring Detector**: Flags `isRecurring = true` when 2 or more identical error types occur on the same competence.
- **Output**: Generates `ErrorRecord` consumed by the Roadmap priority selector.

### 2.4 The Repair Engine
- **Responsibility**: Targeted, surgical remediation (5–15 minutes).
- **Execution**: Connects directly to the specific misconception without requiring full chapter restudy.

### 2.5 The Retest Engine
- **Responsibility**: Validates that an error repair was successful.
- **Isomorphic Invariant**: Uses a distinct twin question that tests the same deep structure with altered surface conditions.
- **Safety**: Strictly caps consecutive failures at 2 cycles before transitioning the skill to `needs_more_work` and pausing it.

### 2.6 The Mastery Engine
- **Responsibility**: Maintains the authoritative mastery ledger (`MasteryEvidence`).
- **Tiers**: `not_yet` $\to$ `emerging` $\to$ `demonstrated`.
- **Decay Rule**: When the Spaced Review Engine flags that retention risk has exceeded the threshold, the state transitions to `demonstrated (review_due)`.

### 2.7 The Spaced Review Engine
- **Responsibility**: Calculates next retrieval dates based on accuracy, confidence, response speed ratio, lapse history, and decay.
- **Output**: `SpacedReviewSchedule` containing urgency states (`fresh`, `due`, `overdue`, `critical`).

### 2.8 The Interleaving Engine
- **Responsibility**: Interleaves related skills to train strategy selection ("Which method should I use?").
- **Eligibility**: Restricts interleaving to skills that have already reached at least `emerging` mastery.

### 2.9 The Subject Methodology Engine
- **Responsibility**: Implements 9 family profiles so that each BAC discipline (Mathematics, Physics-Chemistry, Natural Sciences, Philosophy, History-Geo, Islamic Studies, Languages, Economics/Management, Technique Math) teaches according to its true epistemic nature.

---

## 3. Data & Entity Relationship Mapping

```
[ExamType: BAC]
   │
   └── [Stream: sciences_exp | math | technique_math | gestion_eco | lettres_philo | langues]
          │
          ├── [Specialty (Technique Math only): civil | mechanical | electrical | process]
          │
          └── [Subject: math, physics, natural_sciences, philosophy, etc.]
                 │
                 ├── [MethodologyProfile: family, sequence, language, direction, errorTypes]
                 │
                 └── [CurriculumTopic: e.g. "الدوال العددية", "التحولات النووية"]
                        │
                        └── [Skill: e.g. "اشتقاق الدوال المركبة"]
                               │
                               ├── [Prerequisites: string[]]
                               ├── [CognitiveDimensions: DiagnosticDimension[]]
                               ├── [PracticeQuestions: PracticeQuestion[]]
                               ├── [RepairGuide: RepairProtocol]
                               ├── [RetestTwin: PracticeQuestion]
                               │
                               └── [Evidence Log]
                                      ├── [PracticeResponses: PracticeResponse[]]
                                      ├── [ErrorRecords: ErrorRecord[]]
                                      ├── [MasteryEvidence: MasteryStatus]
                                      └── [SpacedReviewSchedule: nextReviewDueAt]
```

---

## 4. Architectural Invariants

1. **Single Source of Truth**: The priority selector in `src/lib/roadmap/engine.ts` remains the single authoritative deterministic decision engine. No secondary or competing recommendation engine may be introduced.
2. **Deterministic Reproducibility**: All calculations (review intervals, urgency, next action, recurring error detection) are pure functions of student state without side-effects.
3. **Database Independence**: The learning operating system operates seamlessly on in-memory domain models, localStorage fallbacks, and remote Supabase persistence without requiring hardcoded database triggers for pedagogical evaluation.
