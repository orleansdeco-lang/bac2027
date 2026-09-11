# BAC MASTERY — PRODUCT ARCHITECTURE

## 1. System Overview

BAC Mastery is architected around a state-driven educational transformation engine. Rather than organizing the application around content types (e.g., "Lessons", "PDFs", "Quizzes"), the system is organized around **cognitive states and student progression**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                         STUDENT INTERFACE LAYER                        │
│                 (Mobile-First Next.js App Router UI)                   │
├────────────────────────────────────────────────────────────────────────┤
│                          CORE DOMAIN ENGINES                           │
│                                                                        │
│   ┌───────────────┐  ┌───────────────────┐  ┌───────────────────────┐  │
│   │  Goal Engine  │  │ Diagnostic Engine │  │  Gap Analysis Engine  │  │
│   └───────┬───────┘  └─────────┬─────────┘  └───────────┬───────────┘  │
│           │                    │                        │              │
│           └────────────────────┼────────────────────────┘              │
│                                ▼                                       │
│                     ┌─────────────────────┐                            │
│                     │   Roadmap Engine    │                            │
│                     └──────────┬──────────┘                            │
│                                ▼                                       │
│                     ┌─────────────────────┐                            │
│                     │   Missions Engine   │                            │
│                     └──────────┬──────────┘                            │
│                                │                                       │
│            ┌───────────────────┼───────────────────┐                   │
│            ▼                   ▼                   ▼                   │
│   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐         │
│   │  Study Method   │ │    Error Lab    │ │ Adaptive System │         │
│   │     Engine      │ │     Engine      │ │     Engine      │         │
│   └─────────────────┘ └─────────────────┘ └─────────────────┘         │
│                                │                                       │
│            ┌───────────────────┼───────────────────┐                   │
│            ▼                   ▼                   ▼                   │
│   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐         │
│   │   Mind Engine   │ │   Rest Engine   │ │  Recovery Mode  │         │
│   └─────────────────┘ └─────────────────┘ └─────────────────┘         │
│                                │                                       │
│            ┌───────────────────┴───────────────────┐                   │
│            ▼                                       ▼                   │
│   ┌─────────────────┐                     ┌─────────────────┐         │
│   │ Progress Engine │                     │   Future & AI   │         │
│   │  & Exam Mode    │                     │  Bridge Engine  │         │
│   └─────────────────┘                     └─────────────────┘         │
├────────────────────────────────────────────────────────────────────────┤
│                         STORAGE & AUTH LAYER                           │
│                     (Supabase PostgreSQL & Auth)                       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The 14 Conceptual Engines

### Engine 1: Goal Engine
- **Responsibility**: Manages the strategic target (target score e.g., 16.5/20), initial estimated score, target exam date, preferred future university stream/faculty, and weekly study budget in hours.
- **Phase 2 Implementation**: Implemented as a 10-step mobile-first onboarding journey (`/onboarding`) generating a validated `StrategicProfile` saved in browser `localStorage`.
- **Key Insight**: The score is not a vanity metric; it is an academic vector driving the difficulty and density of the roadmap.

### Engine 2: Diagnostic Engine
- **Responsibility**: Assesses multi-dimensional competence across Knowledge, Understanding, Application, Methodology, Speed, and Confidence.
- **Key Boundary (Phase 2)**: The self-reported estimate from onboarding is explicitly labeled as *"مستواك الحالي — تقديرك"*. The empirical Diagnostic Engine will be implemented in Phase 3 (`/diagnostic`).

### Engine 3: Gap Analysis & Bottleneck Engine
- **Responsibility**: Computes mathematical and weighted gaps per subject, considering the official coefficient for the student's stream, and isolates the primary bottleneck.
- **Phase 2 Implementation**:
  - `calculateInitialStrategicGap()`: computes coefficient-weighted baseline and approximate gap without false decimal precision.
  - `detectStrategicBottleneck()`: hybrid analyzer evaluating both acute academic gaps (coefficients $\times$ self-ratings) and behavioral blockers (methodology, consistency, time deficit).
- **Key Deliverable**: Generates the Strategic Map screen (`/roadmap`) displaying *"أول حاجة لازم نخدمو عليها"*.

### Engine 4: Roadmap Engine
- **Responsibility**: Converts the diagnostic gap into structured learning phases (Foundation → Understanding → Methodology → Practice → Error Repair → Advanced Exercises → Simulation → Exam Readiness).
- **Key Insight**: The roadmap is dynamic and updates based on mastery assessments, not calendar days alone.

### Engine 5: Missions Engine
- **Responsibility**: Breaks roadmap milestones into daily executable atomic tasks (10 to 45 minutes each).
- **Key Insight**: Eliminates decision paralysis. The student never has to ask: *"What should I study today?"*

### Engine 6: Study Method Engine
- **Responsibility**: Implements cognitive learning protocols tailored to Algerian BAC requirements (e.g., Active Recall for history/philosophy; systematic document exploitation for natural sciences; problem-solving algorithms for math/physics).

### Engine 7: Error Lab Engine
- **Responsibility**: Treats errors as precious data. Categorizes every failure into a strict 10-type taxonomy (forgot info, misunderstood concept, didn't know method, calculation error, misread question, rushed, lack of practice, methodology error, time management, attention error).
- **Key Insight**: Triggers targeted **Repair Missions** rather than repetitive generic practice.

### Engine 8: Adaptive System Engine
- **Responsibility**: Continuously reconciles planned vs. actual performance. If a student struggles on prerequisite concepts, it pauses linear progression and inserts repair cycles.

### Engine 9: Mind Engine
- **Responsibility**: A lightweight, non-clinical study wellbeing sensor. Collects simple 1-click state (Good, Normal, Tired, Stressed) and modulates the day's intensity.

### Engine 10: Rest Engine
- **Responsibility**: Integrates active recovery into the syllabus. Mandates breaks, screen-off time, and rest intervals. Prevents cognitive depletion before exam season.

### Engine 11: Recovery Mode Engine
- **Responsibility**: When missions are skipped or days missed, this engine avoids creating an unmanageable backlog. It redistributes the syllabus into **Priority 1**, **Priority 2**, and **Optional**, restoring forward momentum.

### Engine 12: Future Engine
- **Responsibility**: Connects daily study to future aspirations (faculties, medical schools, engineering institutes like ESI/Polytech, economics/management institutes, architecture, etc.).

### Engine 13: Progress Engine
- **Responsibility**: Delivers transparent, calm metrics: Current Estimated Score, Target Gap, Mastery Percentage, Active Bottleneck, and Weekly Progress without toxic gamification.

### Engine 14: Exam Mode Engine
- **Responsibility**: Automatically activates 60–90 days prior to the BAC. Shifts the product from progressive learning to timed simulations, official BAC paper analysis, exam pacing strategy, and energy preservation.

---

## 3. Structural Isolation & Agnosticism

1. **Stream Agnosticism**: The core engines know nothing about specific subject details. All syllabus structures, coefficients, and topic trees are injected via configuration tables/objects.
2. **Exam Agnosticism**: Naming conventions use `education_level` and `exam_type` rather than hardcoded "BAC", ensuring seamless extension to **BEM** (Brevet d'Enseignement Moyen).
3. **Decoupled AI Bridge**: V1 relies on structured reporting prompts exportable to external LLMs, ensuring zero API runtime cost and complete data privacy for the student.
