# BAC MASTERY — TECHNICAL ARCHITECTURE

## 1. Architectural Philosophy

The technical foundation of BAC Mastery is built upon four guiding principles:
1. **Zero Infrastructure Cost**: Designed to run comfortably within Vercel and Supabase free tiers (0 DZD monthly ongoing operational cost during initial student cohorts).
2. **Mobile-First & Ultra-Fast**: Optimized for 3G/4G mobile connections typical in Algeria, with zero unnecessary external runtime bloat, fast initial byte delivery, and responsive layouts.
3. **Decoupled Domain Layer**: Core calculation logic (gap analysis, bottleneck calculation, mission scheduling, error taxonomy) is isolated in pure TypeScript functions independent of React or database drivers.
4. **Bilingual & Bi-Directional (RTL/LTR)**: First-class support for Arabic (`ar`, RTL) and French (`fr`, LTR), with layout mirroring baked into the styling system.

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14+ (App Router) | Server-side rendering, static route generation, API routes, fast compilation. |
| **Language** | TypeScript (Strict Mode) | Strong type safety across complex domain models and educational taxonomies. |
| **UI Library** | React 18+ | Declarative component model, Server and Client Components separation. |
| **Styling** | Tailwind CSS + PostCSS | Utility-first, zero-runtime CSS, native RTL support via logical properties. |
| **Icons** | Lucide React | Lightweight, consistent SVG icon set with calm academic aesthetic. |
| **Backend & Database** | Supabase (PostgreSQL) | Robust relational modeling, Row Level Security (RLS), instant Auth, free tier. |
| **Deployment** | Vercel / Edge Network | Zero-config deployments, automatic SSL, CDN edge caching. |
| **AI Layer (V1)** | Zero-API External Bridge | Structured prompt generation for manual student interaction with Claude/GPT/Gemini. |

---

## 3. Directory Layout

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Fonts, i18n Direction Provider)
│   ├── page.tsx                  # Foundation preview & constitutional manifesto
│   └── globals.css               # Design tokens, Tailwind directives, font definitions
├── components/                   # Reusable UI Primitives
│   └── ui/
│       ├── Button.tsx            # Accessible, calm button component
│       ├── Card.tsx              # Clean bordered cards with subtle shadows
│       ├── Badge.tsx             # Stream, priority, and state chips
│       ├── ProgressBar.tsx       # Progress indicator with percentage label
│       ├── Container.tsx         # Mobile-first constrained container
│       └── LanguageSwitcher.tsx  # Dynamic AR/FR toggle with RTL switching
├── lib/                          # Core Utilities & External Services
│   ├── i18n/                     # Lightweight zero-dependency localization
│   │   ├── config.ts             # Supported locales (ar, fr), default locale
│   │   ├── dictionaries.ts       # Structured translation dictionaries
│   │   └── context.tsx           # React context for locale state & direction
│   ├── supabase/                 # Supabase client & environment validator
│   │   ├── client.ts             # Browser client
│   │   └── server.ts             # Server/route-handler client stub
│   └── utils.ts                  # Classnames merging (clsx + tailwind-merge)
└── types/                        # Pure Domain Types (Stream & Exam Agnostic)
    ├── education.ts              # ExamType, Stream, Subject, Coefficient
    ├── student.ts                # StudentProfile, GoalSettings
    ├── diagnostic.ts             # DiagnosticQuestion, CognitiveLevel, Bottleneck
    ├── roadmap.ts                # RoadmapPhase, RoadmapItem, MasteryLevel
    ├── mission.ts                # DailyMission, MissionType, MissionStatus
    ├── error-lab.ts              # ErrorClassification, ErrorLog, RepairMission
    ├── mind-rest.ts              # WellbeingState, RestRecommendation, RecoveryPlan
    ├── progress.ts               # ProgressMetrics, WeeklyReview
    ├── ai-bridge.ts              # StudentIntelligenceReport schema
    └── index.ts                  # Central barrel export
```

---

## 4. Localization & RTL Strategy

- The application dynamically sets the `dir` attribute on `<html>` or main wrappers (`dir="rtl"` for Arabic, `dir="ltr"` for French).
- Tailwind logical utilities (e.g., `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*`) are preferred over hardcoded physical properties (`ml-*`, `mr-*`, `left-*`, `right-*`).
- Fonts:
  * Arabic: High-legibility modern sans-serif (e.g., Cairo / IBM Plex Sans Arabic).
  * Latin (French): High-legibility geometric sans-serif (Inter / Geist).

---

## 5. Conceptual Relational Database Schema (Supabase)

To support future incremental migrations without table bloat, the data model follows this structure:

```sql
-- 1. Reference: Education Levels & Exams
CREATE TABLE education_levels (
    id VARCHAR PRIMARY KEY, -- 'secondary', 'middle_school'
    name_ar VARCHAR NOT NULL,
    name_fr VARCHAR NOT NULL
);

CREATE TABLE exams (
    id VARCHAR PRIMARY KEY, -- 'BAC', 'BEM'
    education_level_id VARCHAR REFERENCES education_levels(id),
    name_ar VARCHAR NOT NULL,
    name_fr VARCHAR NOT NULL
);

-- 2. Streams & Subjects
CREATE TABLE streams (
    id VARCHAR PRIMARY KEY, -- 'sciences_exp', 'math', 'technique_math', etc.
    exam_id VARCHAR REFERENCES exams(id),
    code VARCHAR NOT NULL,
    name_ar VARCHAR NOT NULL,
    name_fr VARCHAR NOT NULL
);

CREATE TABLE subjects (
    id VARCHAR PRIMARY KEY, -- 'math', 'physics', 'natural_sciences', etc.
    code VARCHAR NOT NULL,
    name_ar VARCHAR NOT NULL,
    name_fr VARCHAR NOT NULL
);

CREATE TABLE stream_subjects (
    stream_id VARCHAR REFERENCES streams(id),
    subject_id VARCHAR REFERENCES subjects(id),
    coefficient INT NOT NULL,
    PRIMARY KEY (stream_id, subject_id)
);

-- 3. Students & Goals
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY, -- References auth.users
    exam_id VARCHAR REFERENCES exams(id),
    stream_id VARCHAR REFERENCES streams(id),
    full_name VARCHAR,
    phone VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE student_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id),
    target_score NUMERIC(4,2) NOT NULL,
    current_estimated_score NUMERIC(4,2) NOT NULL,
    weekly_study_hours INT NOT NULL,
    desired_specialty VARCHAR,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Diagnostics & Bottlenecks
CREATE TABLE diagnostic_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id),
    subject_id VARCHAR REFERENCES subjects(id),
    score NUMERIC(4,2) NOT NULL,
    knowledge_score NUMERIC(4,2),
    understanding_score NUMERIC(4,2),
    application_score NUMERIC(4,2),
    methodology_score NUMERIC(4,2),
    speed_score NUMERIC(4,2),
    confidence_score NUMERIC(4,2),
    is_bottleneck BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Daily Missions
CREATE TABLE daily_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id),
    subject_id VARCHAR REFERENCES subjects(id),
    mission_type VARCHAR NOT NULL, -- 'understand', 'practice', 'error_review', 'mini_test', 'rest'
    title_ar VARCHAR NOT NULL,
    title_fr VARCHAR NOT NULL,
    estimated_duration_min INT NOT NULL,
    status VARCHAR DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'delayed'
    assigned_date DATE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 6. Error Lab
CREATE TABLE error_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id),
    subject_id VARCHAR REFERENCES subjects(id),
    error_type VARCHAR NOT NULL, -- 'forgot', 'method_unknown', 'calculation', etc.
    description TEXT,
    is_repaired BOOLEAN DEFAULT FALSE,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Wellbeing & Mind Checks
CREATE TABLE wellbeing_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES student_profiles(id),
    state VARCHAR NOT NULL, -- 'good', 'normal', 'tired', 'stressed'
    logged_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```
