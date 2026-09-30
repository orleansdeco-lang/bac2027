# 🛡️ SHATER CONTROL CENTER — ARCHITECTURE & SECURITY AUDIT
**Authoritative Architectural Blueprint, Comprehensive Codebase Audit, and Security Assessment**
*Platform: الشاطر SHATER | Algerian BAC Learning Ecosystem (2026/2027)*
*Auditor: Principal Software Architect & Lead Security Auditor*
*Date: September 30, 2026*

---

## 📋 Executive Summary

The **SHATER (الشاطر)** platform is a comprehensive, production-grade Algerian Baccalaureate learning ecosystem built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL 17.6)**. It serves high school students across all 58 Algerian Wilayas and 6 national educational streams (*Sciences Expérimentales, Mathématiques, Technique Mathématique, Gestion et Économie, Lettres et Philosophie, Langues Étrangères*).

This document presents a deep, exhaustive technical audit of the entire existing codebase, Supabase database schema (37 migrations, 71 public tables, 50 functions, 148 RLS policies), security boundary evaluation, and the architectural blueprint for constructing the **Secure AI-Powered SHATER Control Center**.

The core invariant of this architecture is:
> **The AI Assistant operates under a strict principle of least privilege (POLP) and NEVER receives direct or unrestricted raw database access. All data interactions are mediated through typed, server-side validated tools, role-based authorization gates, and human-in-the-loop review mechanisms with immutable append-only audit logging.**

---

## 1. Current Architecture

### 1.1 Application Framework & Runtime Boundaries
- **Framework**: Next.js `14.2.15` utilizing the modern App Router (`src/app/`).
- **Language & Runtime**: TypeScript 5.6.3 running on Node.js (Edge Middleware + Serverless Route Handlers).
- **Styling & UI**: Tailwind CSS 3.4.14, Lucide React icons, Framer Motion for micro-interactions, KaTeX for mathematical rendering.
- **Server/Client Separation**:
  - Route Handlers (`src/app/api/**/route.ts`) execute strictly server-side.
  - Server Actions (`"use server"`) are **not used**; all mutations and queries traverse explicit RESTful Route Handlers.
  - Client components are strictly marked with `"use client"`.
  - In-browser local storage (`localStorage`) is used for resilient offline caching and draft saving.

### 1.2 Routing Layout & Middleware Security Gate
The Next.js Edge Middleware (`src/middleware.ts`) defines three distinct architectural zones:
1. **Operations Center (`/ops/*`)**:
   - Guarded by `hasActiveSession(request)`. Unauthenticated traffic is redirected to `/ops/login`.
   - `/ops/login` is explicitly exempted from interception.
   - Appends `x-operations-route: true` header to verified requests.
2. **Protected Learner Space (`/dashboard`, `/mission`, `/exam`, `/roadmap`, `/diwan`, `/tutor`, etc.)**:
   - Session verification checks bearer tokens and Supabase session cookies (`sb-access-token`, `bac_auth_token`, `ops_auth_token`).
   - Narrow exception: `/diwan` allows unauthenticated access only when URL parameters contain `?invite=` or `?table=` for prospective student preview.
3. **Public Gateway (`/`, `/auth`, `/onboarding`, `/orientation`, `/terms`, `/privacy`)**:
   - Publicly accessible without session friction.

### 1.3 Supabase Client Architecture
Three distinct Supabase client instantiation factories exist in `src/lib/supabase/`:
1. **Browser Client (`src/lib/supabase/client.ts`)**:
   - Utilizes `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - Exports `createAuthenticatedSupabaseClient(token)` which attaches the student's or operator's bearer token in the `Authorization` header to enforce PostgreSQL RLS rules based on `auth.uid()`.
2. **Server Client (`src/lib/supabase/server.ts`)**:
   - Throws immediate runtime error if executed in browser context (`if (typeof window !== "undefined")`).
   - Creates authenticated or anonymous Supabase client scoped to incoming server requests.
3. **Privileged Admin Client (`src/lib/supabase/admin.ts`)**:
   - Server-only (`typeof window !== "undefined"` check).
   - Powered by `SUPABASE_SERVICE_ROLE_KEY`.
   - **Crucial Security Property**: Returns `null` if the secret key is missing; it **never masquerades** an anonymous key as an admin key.

---

## 2. Current Database Structure

The Supabase database has undergone 37 sequential migrations (`supabase/migrations/001_...` through `036_...`). It contains **71 tables**, all of which have **Row Level Security (RLS) enabled**.

### 2.1 Table Inventory by Domain

```
Platform Domains
├── 1. Student Core & Identity
│   ├── student_profiles (Composite profile, stream, baseline, trial, contact)
│   ├── user_roles (RBAC: OWNER, OPERATOR, CONTENT_REVIEWER, TEACHER_ADMIN)
│   ├── high_schools (758 verified Algerian secondary establishments)
│   ├── high_school_submissions (Crowdsourced school verifications)
│   ├── communes & wilayas (58 Algerian administrative divisions)
│   ├── daily_reflections (Student mindset, mood, energy logs)
│   └── notification_preferences (Push notification settings)
│
├── 2. Pedagogy, Curriculum & Mastery Engine
│   ├── bac_streams (6 official national streams)
│   ├── missions (Structured learning units per chapter)
│   ├── practice_attempts (Atomic exercise submissions & timestamps)
│   ├── errors (Diagnostic error records per question)
│   ├── error_repairs (Metacognitive repair logs)
│   ├── retests (Validation attempts following error repair)
│   ├── skill_mastery (Competency status: not_yet, emerging, demonstrated)
│   ├── user_progress (Composite [user_id, skill_id] progress tracker)
│   ├── diagnostic_sessions, diagnostic_answers, diagnostic_results
│   ├── student_recall_states (Spaced repetition intervals)
│   ├── custom_exams (Provincial term exams & national BAC archives)
│   └── student_challenges, challenge_comments, challenge_upvotes
│
├── 3. Study OS & Planning
│   ├── planner_events (Scheduled study blocks & calendar tasks)
│   ├── planner_preferences (Weekly hour budgets & rest day settings)
│   ├── planner_tracking_events (Study block start/stop/duration telemetry)
│   └── study_sessions (Pomodoro and deep-work timers)
│
├── 4. Community, Diwan & Majlis
│   ├── majlis_rooms (Virtual collaborative study rooms)
│   ├── majlis_members (Active study room seat assignments)
│   ├── majlis_messages (In-room monitored text messages)
│   ├── majlis_tables (Persistent study groups & tables)
│   ├── majlis_rsvp (Seat reservations for live sessions)
│   ├── majlis_blocks & majlis_reports (Moderation and reporting logs)
│   ├── flash_questions (Rapid-fire collaborative quiz bank)
│   ├── campus_posts, campus_post_likes, campus_bag_items
│   └── bac_experiences, experience_comments, experience_upvotes
│
├── 5. Official University Orientation (2026 Engine)
│   ├── institutions (Universities, Higher Schools, Institutes)
│   ├── programs (University majors & academic fields)
│   ├── program_institutions (Affiliation mapping)
│   ├── fields (Broad academic sectors)
│   ├── sources (Official ministerial circulars & bulletins)
│   ├── admission_rules (Calculated admission score formulas)
│   ├── admission_rule_sources (Evidence mappings)
│   ├── geographic_rules & geographic_rule_wilayas (Regional priority rules)
│   ├── program_bac_eligibility (Stream compatibility matrix)
│   ├── program_cutoffs (Historical ministerial cutoff scores)
│   ├── rule_evidence_records (Two-person verification audit trail)
│   ├── orientation_sources, orientation_versions, orientation_raw_records
│   └── orientation_import_runs, orientation_conflicts, orientation_review_logs
│
├── 6. Commercial, Subscriptions & Referrals
│   ├── subscription_plans (Season pass, monthly, physical card packages)
│   ├── subscriptions (Active, expired, cancelled student plans)
│   ├── payment_orders (BaridiMob, CCP, and Cash-on-Delivery orders)
│   ├── referrals (Referral code engine and conversions)
│   ├── credit_transactions (Reward balance history)
│   └── shater_pass_vouchers (Physical access scratch cards)
│
└── 7. Governance, Telemetry & Operations
    ├── operations_audit_logs (Append-only administrative audit trail)
    ├── operations_issues (System anomalies and bug tracking queue)
    ├── telemetry_events (Comprehensive client-side event tracking)
    ├── visitor_hits (UTM campaign, traffic, and referral tracking)
    └── bac_results (Official historic national grade distributions)
```

### 2.2 Key Enums and Allowed Values
- `user_roles.role`: `'OWNER'`, `'OPERATOR'`, `'CONTENT_REVIEWER'`, `'TEACHER_ADMIN'`
- `payment_orders.payment_method`: `'baridimob'`, `'ccp'`, `'manual_transfer'`, `'cash'`, `'other'`
- `payment_orders.status`: `'DRAFT'`, `'PENDING'`, `'APPROVED'`, `'REJECTED'`, `'CANCELLED'`
- `student_profiles.access_status`: `'TRIAL'`, `'PAID'`, `'EXPIRED'`, `'REJECTED'`
- `skill_mastery.status`: `'not_yet'`, `'emerging'`, `'demonstrated'`
- `operations_audit_logs.target_type`: `'payment_order'`, `'student_profile'`, `'user_role'`, `'telemetry'`, `'system'`, `'subscription_plan'`

### 2.3 Stored Procedures & Critical RPCs
The database contains **50 stored functions**, including key security-definer procedures:
- `public.is_operator(UUID)`: Checks if a user is `OWNER` or `OPERATOR`.
- `public.is_owner(UUID)`: Checks if a user is `OWNER`.
- `public.has_finance_access(UUID)`: Checks finance authorization.
- `public.approve_payment_order(p_order_id, p_reason)`: Atomic order approval, student access upgrade (`PAID`), and audit log entry.
- `public.admin_authoritative_reject_order(p_order_id, p_operator_id, p_reason)`: Authoritative rejection with state restoration.
- `public.extend_student_subscription(p_student_id, p_days, p_reason)`: Extends subscription validity with audit trail.
- `public.ops_get_cockpit_kpis(p_operator_id)`: Aggregates real-time business and funnel KPIs.
- `public.ops_get_student_directory(p_operator_id, p_limit, p_offset)`: Paginated directory with email join from `auth.users`.
- `public.ops_get_student_dossier(p_student_id, p_operator_id)`: Detailed single student record.

---

## 3. Existing Reusable Components

The project includes an extensive set of UI components designed in a sleek dark theme (`#080D1A` background, `#0D1526` surface, `#1E293B` borders, indigo/emerald accents):

| Component | Path | Reusable Purpose |
|---|---|---|
| `OpsSidebar` | `src/components/ops/OpsSidebar.tsx` | Operational navigation hierarchy, user role initials, sign-out handler. |
| `OperationsCockpitDashboard` | `src/components/ops/OperationsCockpitDashboard.tsx` | Multi-tab operations view with live filters, metrics, and KPI cards. |
| `AdminNotifications` | `src/components/ops/AdminNotifications.tsx` | Live notification bell with polling for pending orders and anomalies. |
| `GlobalSearchModal` | `src/components/ui/GlobalSearchModal.tsx` | Command palette (`Ctrl+K`) for rapid navigation and search. |
| `MathRenderer` | `src/components/ui/MathRenderer.tsx` | LaTeX math rendering via KaTeX for STEM formulas. |
| `DiagramViewer` | `src/components/ui/DiagramViewer.tsx` | SVG/Mermaid science diagrams and scientific illustrations. |
| `Card`, `Badge`, `Button` | `src/components/ui/` | Standardized primitive UI tokens. |
| `OrientationTableView` | `src/components/orientation/OrientationTableView.tsx` | Comprehensive data table with multi-column filtering. |
| `GoogleAnalytics` / `VisitorTracker` | `src/components/analytics/` | Client-side tracking and telemetry ingestion. |

---

## 4. Existing Admin Functionality (`/ops/*`)

The `/ops` section already has 16 operational pages and dedicated API endpoints:

1. **Cockpit Overview (`/ops/overview`)**:
   - Executive KPIs: Total signups, active trials, paying subscribers, revenue in DZD, conversion rate.
   - Real-time traffic, active visitors in the last 15 minutes, device breakdown.
2. **Students Directory (`/ops/students` & `/ops/students/[id]`)**:
   - Paginated search by name, email, phone, stream, Wilaya, and access status.
   - Student dossier: view learning history, enrolled stream, trial expiration, order history.
   - Subscription manual extension action (`POST /api/ops/students/[id]/extend`).
3. **Payments & Orders (`/ops/payments` & `/ops/finance`)**:
   - Processing queue for BaridiMob/CCP receipt uploads and COD physical cards.
   - Actions: `approve` (`POST /api/ops/payments/approve`) and `reject` (`POST /api/ops/payments/reject`).
4. **Learning & Mastery Analytics (`/ops/learning`)**:
   - Global pass rates per subject and diagnostic test distributions.
   - Analysis of common bottlenecks and error patterns.
5. **Content Verification (`/ops/content`)**:
   - Curriculum verification status by stream, chapter, and subject.
6. **Exams & Subjects Bank (`/ops/exams`)**:
   - Management and PDF upload for official BAC annales and high-school mock exams.
7. **Issues & Anomalies Queue (`/ops/issues`)**:
   - Student-reported problems, broken LaTeX, and platform bugs.
8. **High Schools Moderation (`/ops/schools`)**:
   - Moderation queue for student-submitted unlisted secondary schools.
9. **Experiences Moderation (`/ops/experiences`)**:
   - Moderation queue for top-achiever BAC stories (approve, reject, edit typos).
10. **Governance & Audit (`/ops/audit`)**:
    - Filterable view of `operations_audit_logs` tracking administrative actions.
11. **System Health & Purge (`/ops/system`)**:
    - Environment health check and authorized test-data purger (`/api/ops/system/purge-test-data`).

---

## 5. Existing Analytics

1. **Business & Financial Analytics**:
   - Live revenue tracking in Algerian Dinars (DZD).
   - Approval velocity and pending order backlog.
   - Conversion rates from 72-hour trial to paid season pass.
2. **Visitor & Traffic Telemetry**:
   - Handled via `src/lib/operations/visitors.ts` and `src/app/api/telemetry/visitor/route.ts`.
   - Real-time active users (15-minute sliding window).
   - 24-hour hourly traffic aggregation.
   - UTM campaign attribution: `utm_source`, `utm_campaign`, `utm_medium`, `ref_code`.
   - Stored in `visitor_hits` (migration 021).
3. **Pedagogical Telemetry**:
   - Stored in `telemetry_events` table (migration 006).
   - Tracks `mission_started`, `practice_completed`, `error_encountered`, `retest_passed`.
4. **External Analytics**:
   - Google Analytics 4 (GA4) integrated via measurement ID `G-LXJM06XMHT` in `src/components/analytics/GoogleAnalytics.tsx`.

---

## 6. Existing AI Functionality

1. **AI Tutor API (`src/app/api/ai/tutor/route.ts`)**:
   - Utilizes `@google/genai` (SDK v2.24.0) with model `gemini-2.5-flash`.
   - Configured with pedagogical system instructions customized to the Algerian curriculum, ministerial grading schemes (*سلالم التنقيط الوزارية*), and Socratic step-by-step guidance.
   - Extracts structured action tasks using a custom block syntax:
     ```
     :::task
     { "title": "...", "subjectId": "...", "minutes": 25, "reason": "..." }
     :::
     ```
   - Rate limited with in-memory IP sliding window (20 requests per minute).
   - Zero-failure guarantee: falls back to a deterministic local expert pedagogical engine if the Gemini API key is missing or calls fail.
2. **AI Bridge Report Generator (`src/domain/ai-bridge/student-intelligence.ts`)**:
   - Generates structured, privacy-preserving markdown summaries of a student's profile, academic bottlenecks, strongest/weakest areas, and recurring errors.
   - Strict rule: **ZERO PII** (no names, emails, or user IDs).

---

## 7. Security Findings & Vulnerability Matrix

The audit discovered several critical security vulnerabilities that **must be addressed** during the development of the Control Center:

| ID | Vulnerability | Severity | Location | Technical Impact |
|---|---|---|---|---|
| **SEC-01** | **Client-Side Grading & Unvalidated Mastery** | **CRITICAL** | `src/lib/repositories/practice-repository.ts:24`<br>`src/lib/services/mission-service.ts:121-135`<br>`src/lib/repositories/mastery-repository.ts:75-77` | The client evaluates whether an answer is correct (`is_correct: r.isCorrect`), sends this to the database, and updates `skill_mastery` directly via RLS (`auth.uid() = user_id`). A student can forge 100% mastery without answering questions. |
| **SEC-02** | **Unauthenticated Exam Deletion & Creation** | **HIGH** | `src/app/api/ops/exams/route.ts:35-96` | `POST` (create exam) and `DELETE` (delete exam) have **zero authentication checks**. Anyone on the public internet can insert or delete exam records in the database. |
| **SEC-03** | **Unauthenticated File Upload in Ops API** | **HIGH** | `src/app/api/ops/exams/upload/route.ts:7-20` | Endpoint does not check operator session. Unauthenticated users can upload arbitrary files up to 25MB to storage buckets. |
| **SEC-04** | **IDOR in Experience Comments** | **HIGH** | `src/app/api/experiences/[id]/comments/route.ts:157-163, 231-237` | Update (`PATCH`) and delete (`DELETE`) authorize requests by matching `existing.author_id === body.userId` without verifying that `body.userId` matches the authenticated caller's JWT token. Anyone can delete or edit any comment by passing the author's user ID. |
| **SEC-05** | **Client-Controlled User ID in Receipt Upload** | **MEDIUM** | `src/app/api/ops/payments/receipt/upload/route.ts:102-104` | If caller is unauthenticated, the route falls back to `effectiveUserId = studentUserId` from form data, allowing unauthenticated receipt submissions linked to victim IDs. |
| **SEC-06** | **Client-Side Admin Bypass Flag** | **MEDIUM** | `src/components/experiences/ExperiencesView.tsx:99`<br>`src/components/experiences/ExperienceCard.tsx:162` | Client components check `localStorage.getItem("ops_owner_bypass")` and hardcoded email `azinox27@gmail.com` to grant UI administrative buttons. While server API routes generally block unauthorized mutations, client-side trust creates confusion. |
| **SEC-07** | **Header Spoofing in Content Route** | **MEDIUM** | `src/app/api/ops/content/route.ts:9-15` | Route trusts `request.headers.get("x-user-id")` directly without cryptographic JWT verification via Supabase Auth. Anyone sending a known operator's UUID in the header gains access to content operations data. |

---

## 8. Row Level Security (RLS) Findings

### 8.1 Strengths
- All 71 public tables have RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- `operations_audit_logs` has append-only RLS: `INSERT` is restricted to operators/service_role, and there are **zero `UPDATE` or `DELETE` policies**, guaranteeing database-level audit immutability.
- Tables like `user_roles` strictly isolate role management to `is_owner(auth.uid())`.

### 8.2 Gaps & Weaknesses
- `skill_mastery`: Policy `skill_mastery_insert_own_or_operator` allows any student to insert rows where `auth.uid() = user_id`. Because grading occurs on the client, students can grant themselves `"demonstrated"` status for any skill.
- `practice_attempts`: Allows students to insert arbitrary `is_correct = true` values.
- `custom_exams`: Managed via client service without strict RLS enforcement on `INSERT`/`DELETE` for non-operators.

---

## 9. Conceptual Data Maps

### 9.1 Student Learning Flow
```
Student (auth.users)
       ↓
Strategic Profile (public.student_profiles)
  [stream_id, target_score, baseline_score, access_status]
       ↓
Learning Activity & Roadmap (missions, study_sessions, daily_reflections)
       ↓
Exercises & Assessment (curriculum registry, custom_exams, flash_questions)
       ↓
Practice Attempts (public.practice_attempts)
  [question_id, response, confidence, duration]
       ↓
Diagnostic & Errors (public.errors & public.error_lab)
  [misconception_type, trap_category]
       ↓
Metacognitive Repair & Retest (public.error_repairs & public.retests)
       ↓
Competency Verification (public.skill_mastery & public.user_progress)
  [status: not_yet → emerging → demonstrated]
       ↓
Personalized Recommendations (Domain V2 Engine & AI Bridge)
  [Next mission, spaced review schedule, targeted repair intervention]
```

### 9.2 Admin & AI Control Center Architecture
```
Authorized Administrator (auth.users + public.user_roles)
       ↓
SHATER Control Center (Secure /ops interface)
       ↓
AI Assistant (LLM Orchestrator via @google/genai)
       ↓
Deterministic Typed Tools (Read & Proposal Tools)
       ↓
Strict Permission & Policy Gate (Server-side RBAC validation)
       ├── READ ACTION ──→ Direct Service / Read-Only View Execution
       └── MUTATE ACTION ─→ 2-Phase Approval Proposal ("Review & Confirm" Card)
                                 ↓
                            Human Operator Signs & Confirms
                                 ↓
Authoritative Stored Procedures / RPCs (SECURITY DEFINER with FOR UPDATE)
  [approve_payment_order(), extend_subscription(), moderate_room()]
       ↓
Database Layer (Supabase PostgreSQL with RLS)
       ↓
Immutable Operations Audit Log (public.operations_audit_logs)
```

---

## 10. Recommended Control Center Architecture

### 10.1 Core Architectural Principles
1. **Zero Unrestricted AI Access**:
   - The AI Assistant is **never** provided a raw SQL tool or unbounded Supabase client.
   - Every AI capability is encapsulated in a discrete, typed tool schema (Zod validated).
2. **Two-Phase Commit for Mutating Actions**:
   - **Phase 1 (Proposal)**: AI drafts the proposed change (e.g., extend subscription by 7 days for student X, adjust capacity of study room Y, create announcement campaign Z). The UI presents an interactive confirmation card displaying the exact before/after diff.
   - **Phase 2 (Execution)**: The human operator clicks "Confirm & Execute". The server verifies the operator's session and executes the authoritative RPC.
3. **Strict Cryptographic Authentication**:
   - All `/api/ops/*` routes must discard `x-user-id` header trust and cryptographically verify the JWT bearer token with Supabase Auth via `extractAndVerifyOperator(req)` or `extractAndVerifyOwner(req)`.
4. **Append-Only AI Audit Log**:
   - All AI prompts, tool calls, generated proposals, and human approval/rejection outcomes must be logged in an audit table.

---

## 11. Required New Database Tables

To support the AI Control Center, advertising campaigns, and AI tool governance without altering existing schemas, the following **4 new tables** are required:

### 11.1 `public.ai_control_conversations`
Stores conversation sessions between administrators and the Control Center AI.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `operator_user_id`: `UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE`
- `title`: `TEXT NOT NULL`
- `context_domain`: `TEXT NOT NULL DEFAULT 'general'` (e.g., `analytics`, `students`, `pedagogy`, `finance`, `diwan`, `campaigns`)
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`

### 11.2 `public.ai_control_messages`
Stores individual chat messages, tool calls, and structured tool outputs.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `conversation_id`: `UUID NOT NULL REFERENCES public.ai_control_conversations(id) ON DELETE CASCADE`
- `role`: `TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool'))`
- `content`: `TEXT NOT NULL`
- `tool_calls`: `JSONB` (Array of tool invocations generated by the AI)
- `tool_call_id`: `TEXT` (For role='tool' results)
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`

### 11.3 `public.ai_action_proposals`
Stores AI-generated mutation proposals awaiting human administrator approval.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `conversation_id`: `UUID REFERENCES public.ai_control_conversations(id) ON DELETE SET NULL`
- `proposer_operator_id`: `UUID NOT NULL REFERENCES auth.users(id)`
- `action_type`: `TEXT NOT NULL` (e.g., `EXTEND_SUBSCRIPTION`, `MODERATE_ROOM`, `UPDATE_CAMPAIGN`, `APPROVE_PAYMENT`, `FLAG_EXERCISE`)
- `target_type`: `TEXT NOT NULL` (e.g., `student_profile`, `study_room`, `ad_campaign`, `custom_exam`)
- `target_id`: `TEXT NOT NULL`
- `proposed_payload`: `JSONB NOT NULL` (Parameters for the mutation)
- `before_state`: `JSONB`
- `status`: `TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTED', 'FAILED'))`
- `reviewed_by`: `UUID REFERENCES auth.users(id)`
- `reviewed_at`: `TIMESTAMPTZ`
- `execution_result`: `JSONB`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`

### 11.4 `public.ad_campaigns`
Enables the administration to manage promotional campaigns, partner ads, and internal announcements.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `title`: `TEXT NOT NULL`
- `description`: `TEXT`
- `placement`: `TEXT NOT NULL CHECK (placement IN ('dashboard_banner', 'diwan_sidebar', 'exam_interstitial', 'announcement_bar'))`
- `target_streams`: `TEXT[]` (e.g., `['sciences_exp', 'math']` or empty for all)
- `target_wilayas`: `INT[]` (Wilaya codes 1-58 or empty for all)
- `image_url`: `TEXT`
- `destination_url`: `TEXT`
- `start_date`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- `end_date`: `TIMESTAMPTZ`
- `is_active`: `BOOLEAN NOT NULL DEFAULT true`
- `click_count`: `INT NOT NULL DEFAULT 0`
- `impression_count`: `INT NOT NULL DEFAULT 0`
- `created_by`: `UUID REFERENCES auth.users(id)`
- `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`
- `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT now()`

---

## 12. Required Server Functions & RPCs

The following new PostgreSQL stored functions are required:

1. **`public.ai_approve_and_execute_proposal(p_proposal_id UUID, p_operator_id UUID)`**:
   - `SECURITY DEFINER SET search_path = public, pg_temp;`
   - Verifies caller has required role for the target action (`OWNER` or `OPERATOR`).
   - Locks proposal with `FOR UPDATE`.
   - Dispatches to appropriate domain logic based on `action_type`.
   - Records execution in `operations_audit_logs`.
   - Marks proposal as `EXECUTED`.
2. **`public.ops_search_students_advanced(p_query TEXT, p_stream TEXT, p_wilaya TEXT, p_status TEXT, p_limit INT, p_offset INT)`**:
   - Multi-field search across `first_name`, `last_name`, `email`, `phone`, `wilaya`.
   - Only executable by authorized operators.
3. **`public.ops_get_exercise_analytics(p_subject_id TEXT, p_stream_id TEXT)`**:
   - Returns aggregated statistics on question failure rates, common errors, and attempt distributions.

---

## 13. Required Routes

### 13.1 Control Center UI Routes
- `/ops/ai`: Dedicated AI Assistant Cockpit interface.
- `/ops/campaigns`: Advertising and promotional campaign management.
- `/ops/exercises`: Exercise performance and difficulty analysis dashboard.
- `/ops/rooms`: Real-time study room and Majlis moderation dashboard.
- `/ops/orientation-admin`: Official university orientation pipeline and conflict resolution.

### 13.2 Control Center API Route Handlers
- `POST /api/ops/ai/chat`: Streaming or structured chat endpoint handling user prompts, Gemini function calling, and tool execution.
- `POST /api/ops/ai/proposals/[id]/execute`: Human confirmation endpoint executing an approved proposal.
- `POST /api/ops/ai/proposals/[id]/reject`: Rejection of an AI proposal.
- `GET /api/ops/campaigns` & `POST /api/ops/campaigns`: Fetch and manage advertising campaigns.
- `PATCH /api/ops/campaigns/[id]`: Toggle campaign active status or update details.
- `DELETE /api/ops/campaigns/[id]`: Remove campaign.
- `GET /api/ops/exercises/stats`: Aggregate exercise difficulty and failure metrics.
- `GET /api/ops/rooms/active`: Real-time active study rooms with participant counts.
- `POST /api/ops/rooms/[id]/moderate`: Kick participant, mute chat, or close room.

---

## 14. Required UI Components

1. **`ControlCenterChat` (`src/components/ops/ai/ControlCenterChat.tsx`)**:
   - Main conversation interface with message streaming, domain selector, and action cards.
2. **`AIProposalCard` (`src/components/ops/ai/AIProposalCard.tsx`)**:
   - Visual comparison card showing the proposed change, affected student/room/campaign, and "Confirm & Execute" vs. "Reject" buttons.
3. **`PlatformAnalyticsView` (`src/components/ops/analytics/PlatformAnalyticsView.tsx`)**:
   - Unified analytics combining business, traffic, and pedagogical KPIs.
4. **`CampaignManagerView` (`src/components/ops/campaigns/CampaignManagerView.tsx`)**:
   - Campaign banner list, click/impression stats, creation modal, and placement previews.
5. **`StudyRoomsModerationView` (`src/components/ops/rooms/StudyRoomsModerationView.tsx`)**:
   - Grid of live Majlis study tables, participant count, noise level, and instant moderation actions.
6. **`ExercisesQualityView` (`src/components/ops/exercises/ExercisesQualityView.tsx`)**:
   - Ranked list of exercises with highest failure rates, student feedback, and direct edit links.

---

## 15. Stability Guard: What Must NOT Be Changed

To prevent regressions in production, the following components are **frozen and stable**:

1. **Learning Core Database Tables (Migrations 001–005)**:
   - `student_profiles`, `missions`, `practice_attempts`, `errors`, `error_repairs`, `retests`, `skill_mastery`, `user_progress`.
   - Never alter primary keys, remove columns, or rename existing columns.
2. **Official University Orientation Engine (Migrations 027–031)**:
   - `institutions`, `programs`, `program_institutions`, `admission_rules`, `program_cutoffs`, `rule_evidence_records`.
   - These represent verified ministerial data for the 2026/2027 Algerian BAC session.
3. **Realtime Majlis Multiplayer Engine (Migrations 032–036)**:
   - `majlis_rooms`, `majlis_members`, `majlis_messages`, `majlis_tables`.
   - Broadcast channels and presence signaling must remain untouched.
4. **Commercial State Machine & Stored Procedures (Migrations 006, 025)**:
   - `approve_payment_order()`, `admin_authoritative_reject_order()`.
   - Invariant: Orders must maintain atomic transition from `PENDING` to `APPROVED` or `REJECTED`.
5. **Supabase Client Factories (`src/lib/supabase/`)**:
   - `admin.ts`, `server.ts`, `client.ts` provide strict server/client boundary enforcement and must remain the sole instantiation points.

---

## 16. Security Hardening Plan

Before launching the Control Center, the vulnerabilities identified in Section 7 must be fixed:

1. **Secure `/api/ops/exams`**:
   - Add `extractAndVerifyOperator(req)` guard to `POST` and `DELETE` methods in `src/app/api/ops/exams/route.ts`.
2. **Secure `/api/ops/exams/upload`**:
   - Add `extractAndVerifyOperator(req)` guard to `src/app/api/ops/exams/upload/route.ts`.
3. **Eliminate Header Spoofing in `/api/ops/content`**:
   - Replace `request.headers.get("x-user-id")` with token-based `extractAndVerifyOperator(request)`.
4. **Fix IDOR in `/api/experiences/[id]/comments`**:
   - Verify that `caller.userId === existing.author_id` using the authenticated JWT token rather than trusting `body.userId`.
5. **Remove Client-Side Bypass References**:
   - Remove `localStorage.getItem("ops_owner_bypass")` checks from `ExperiencesView.tsx` and `ExperienceCard.tsx`.
6. **Server-Side Grading Migration**:
   - Introduce `POST /api/exercises/submit` where the client submits only the student's selected answer key, and the server validates against the answer key before writing to `practice_attempts` and `skill_mastery`.

---

## 17. Implementation Phases & Migration Order

```
Phase 0: Security Hardening (P0)
├── Fix unauthenticated ops endpoints (/api/ops/exams, /api/ops/exams/upload)
├── Fix header spoofing in /api/ops/content
├── Fix IDOR in /api/experiences/[id]/comments
└── Remove client-side bypass checks (ops_owner_bypass)

Phase 1: Database Migration (P1)
├── Create migration 037_shater_control_center_and_campaigns.sql
│   ├── Table: ai_control_conversations
│   ├── Table: ai_control_messages
│   ├── Table: ai_action_proposals
│   └── Table: ad_campaigns
├── Configure RLS policies (restricted strictly to operators and owners)
└── Implement RPC: ai_approve_and_execute_proposal()

Phase 2: AI Tool Registry & Server Bridge (P2)
├── Define typed tools using Zod:
│   ├── Tool: get_platform_analytics (Read-only)
│   ├── Tool: search_students (Read-only)
│   ├── Tool: inspect_student_dossier (Read-only)
│   ├── Tool: inspect_learning_activity (Read-only)
│   ├── Tool: inspect_exercise_quality (Read-only)
│   ├── Tool: propose_subscription_extension (Mutating → Proposal)
│   ├── Tool: propose_room_moderation (Mutating → Proposal)
│   ├── Tool: propose_campaign_status (Mutating → Proposal)
│   └── Tool: propose_payment_review (Mutating → Proposal)
└── Implement server-side AI execution controller using @google/genai

Phase 3: Control Center UI Modules (P3)
├── Build AI Chat Cockpit (/ops/ai)
├── Build AI Proposal Review Card (interactive diff + confirm/reject)
├── Build Ad Campaigns Manager (/ops/campaigns)
├── Build Live Study Room Moderation (/ops/rooms)
└── Build Exercise Quality Inspector (/ops/exercises)

Phase 4: Audit Trail & Governance Verification (P4)
├── Connect all AI actions to operations_audit_logs
├── Implement audit trail filter for AI-initiated actions
└── End-to-end security penetration testing & verification
```

---

## 18. Dependencies & Environmental Pre-requisites

- **Node.js Dependencies**:
  - `@google/genai`: `^2.24.0` (Already installed in `package.json`).
  - `@supabase/supabase-js`: `^2.45.6` (Already installed).
  - `zod`: `^4.6.5` (Already installed).
- **Environment Variables**:
  - `GEMINI_API_KEY` or `GOOGLE_GENAI_API_KEY`: Required for Gemini model execution.
  - `SUPABASE_SERVICE_ROLE_KEY`: Required for privileged server operations (must be set in `.env.local` for production execution).
  - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Present and verified.

---

*End of Architectural Audit Document.*
*Status: Completed and Ready for Review. Code modification will only commence upon user instruction.*
