# BAC Mastery — Telemetry Ingestion Specification
## Phase 2: Operations Foundation P0

### 1. Architectural Model
Telemetry operates in a hybrid **Client Queue + Asynchronous Server Ingestion** pattern:
- The existing client `localStorage` buffer is preserved for offline resilience.
- An in-memory queue batches events and flushes to `POST /api/telemetry/events`.
- Triggers: Queue threshold ($\ge 5$ events), 20s debounce, or page lifecycle (`visibilitychange` / `beforeunload` using `sendBeacon`).

### 2. Ingestion Endpoint
- **URL:** `POST /api/telemetry/events`
- **Authentication:** Optional (Supports anonymous visitors for `landing_view`, `onboarding_started`). When a Bearer JWT is present, the server derives `user_id` cryptographically and overrides untrusted client claims.
- **Payload Limits:** Maximum 100 events per batch; maximum 64KB per request.

### 3. Event Allowlist (38 Canonical Events)
Only events from the predefined domain allowlist are persisted:
`landing_view`, `onboarding_started`, `onboarding_completed`, `diagnostic_started`, `diagnostic_completed`, `dashboard_viewed`, `first_mission_started`, `mission_started`, `lesson_viewed`, `active_recall_started`, `active_recall_answer_revealed`, `practice_started`, `practice_completed`, `error_created`, `repair_started`, `repair_completed`, `retest_started`, `retest_completed`, `mastery_demonstrated`, `roadmap_viewed`, `roadmap_mission_selected`, `progress_viewed`, `error_lab_viewed`, `recovery_viewed`, `exam_mode_viewed`, `returned_next_day`, `pilot_feedback_submitted`, `pilot_session_started`, `pilot_session_ended`, `pilot_resume_success`, `trial_started`, `registration_completed`, `login_completed`, `trial_expiring`, `trial_expired`, `conversion_viewed`, `conversion_cta_clicked`, `payment_started`, `payment_pending_verification`, `payment_confirmed`.

### 4. Data Minimization & Sanitization
The server scrubs:
- Passwords, secrets, auth tokens, bearer headers.
- Keys matching `jwt`, `apikey`, `access_token`, `refresh_token`.
- Unnecessary student phone numbers or personal messages.
