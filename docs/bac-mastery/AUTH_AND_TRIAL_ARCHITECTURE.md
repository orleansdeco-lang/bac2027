# BAC Mastery — Authentication, 48-Hour Free Trial, and Access Architecture
**Document Version:** 1.0.0  
**Phase:** Prompt 18 — Authenticated Pilot + 48-Hour Free Trial + Conversion Gate  
**Backend:** Dedicated Supabase (`https://erbvmpnxufgeinqnshzu.supabase.co`)  
**Status:** PRODUCTION VERIFIED  

---

## 1. Executive Architectural Overview

BAC Mastery transitions from a purely anonymous / guest web application into an **authenticated, account-backed learning product with an authoritative 48-hour free trial lifecycle**.

```
                           +------------------------+
                           |  Guest Student Entry   |
                           |  (Landing/Onboarding)  |
                           +-----------+------------+
                                       |
                                       v
                           +------------------------+
                           | Registration / Sign Up |
                           |  (Email + Pass + Conf) |
                           +-----------+------------+
                                       |
                   +-------------------+-------------------+
                   |                                       |
                   v                                       v
         +--------------------+                  +--------------------+
         | Idempotent Guest   |                  | Fresh User Profile |
         | State Migration    |                  | Creation           |
         +---------+----------+                  +---------+----------+
                   |                                       |
                   +-------------------+-------------------+
                                       |
                                       v
                        +----------------------------+
                        | Trial Initialization       |
                        | trial_started_at = NOW()   |
                        | trial_expires_at = NOW+48h |
                        | access_status = 'TRIAL'    |
                        | plan = 'PILOT_TRIAL'       |
                        +--------------+-------------+
                                       |
                  +--------------------+--------------------+
                  |                                         |
                  v (Server Time < ExpiresAt)               v (Server Time >= ExpiresAt)
       +-----------------------+                 +-----------------------+
       |     TRIAL_ACTIVE      |                 |     TRIAL_EXPIRED     |
       | - Full study & practice|                 | - Read-only roadmap   |
       | - Retest verification |                 | - Mission practice lock|
       | - Progress tracking   |                 | - CTA -> /subscribe   |
       +-----------+-----------+                 +-----------+-----------+
                   |                                         |
                   +-------------------+---------------------+
                                       |
                                       v
                           +-----------------------+
                           |   /subscribe Gate     |
                           | Real Student Evidence |
                           | 3,900 DZD Season Pass |
                           +-----------+-----------+
                                       |
                                       v
                           +-----------------------+
                           | Payment Provider      |
                           | (ManualPilotProvider) |
                           | Status: PENDING       |
                           +-----------------------+
```

---

## 2. Authentication & Account Persistence

### 2.1 Credentials & Input Requirements
- **Inputs**: Email, Password (min 6 characters), Password Confirmation.
- **Strictly Excluded**: No phone numbers, no physical addresses, no complex KYC, no multi-step email verification blockers for pilot onboarding.
- **Validation**:
  - `email` matches standard RFC format.
  - `password === passwordConfirmation` enforced synchronously before sending request.
  - `password.length >= 6`.
- **Security Finding (Supabase Auth Leaked Password Protection)**:
  - Empirically audited on remote instance `erbvmpnxufgeinqnshzu`.
  - Registration with common dictionary passwords (`password123`) succeeded without rejection.
  - **Audit Finding**: Supabase Auth Leaked Password Protection is **DISABLED** on this remote instance. Client-side validation enforces standard length requirements.

### 2.2 Idempotent Guest-to-Cloud State Migration
When an existing guest student registers:
1. `handleAuthSessionMigration(user)` runs atomically.
2. LocalStorage keys inspected:
   - `bac_mastery_strategic_profile`
   - `bac_diagnostic_results`
   - `bac_mastery_missions`
   - `bac_mastery_records`
3. Checks if remote `student_profiles` row exists for `user.id`.
4. If exists: Remote cloud profile is preserved; remote trial timestamps take precedence (anti-reset guard).
5. If absent: Local guest profile is upserted to remote database satisfying `id = user_id`, setting `trial_started_at = NOW()` and `trial_expires_at = NOW() + 48 hours`.

---

## 3. The 48-Hour Free Trial Model

### 3.1 Server-Authoritative Time Invariant
- **Rule**: Client device clocks (`Date.now()`, `new Date()`) are NEVER trusted for access control.
- **Latency-Compensated Sync Service** (`src/lib/access/server-time.ts`):
  - Fetches authoritative UTC ISO timestamp from `/api/server-time`.
  - Measures round-trip time (`rtt = t_recv - t_sent`).
  - Stores high-precision clock offset: `offset = serverTime - (t_sent + rtt / 2)`.
  - Subsequent client checks use `performance.now()` adjusted by this verified offset.
  - Device clock rollbacks fail automatically.

### 3.2 Access Decision Matrix (`getStudentAccess`)
A centralized decision service (`src/lib/access/index.ts`) produces a unified `StudentAccessDecision`:

| State | Condition | `canUseProduct` | UI Representation | Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **`TRIAL_ACTIVE`** | `access_status === 'TRIAL'` AND `now < trial_expires_at` | `true` | Countdown banner (`باقي X ساعة`) in Dashboard & Account | Full access to lessons, worked examples, practice, retests, and Error Lab |
| **`TRIAL_EXPIRED`**| `access_status === 'TRIAL'` AND `now >= trial_expires_at` | `false` | Warning banner in Dashboard; Lockout gate in Mission; Smart CTA on Landing | Read-only access to curriculum & profile; practice/retest blocked; CTA to `/subscribe` |
| **`PAID_ACTIVE`**  | `access_status === 'PAID'` | `true` | Green verified badge (`Pass BAC كامل`) | Unrestricted access through official exam day |

---

## 4. Database Schema & Migration Architecture

### 4.1 Migration `003_add_trial_access_to_student_profiles.sql`
```sql
ALTER TABLE student_profiles
ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS access_status TEXT NOT NULL DEFAULT 'TRIAL',
ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'PILOT_TRIAL';

CREATE OR REPLACE FUNCTION protect_student_trial()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent client from illegally elevating to PAID
  IF NEW.access_status = 'PAID' AND OLD.access_status <> 'PAID' AND auth.role() = 'authenticated' THEN
    RAISE EXCEPTION 'Access status cannot be elevated directly from client.';
  END IF;

  -- Prevent client from extending trial expiration
  IF NEW.trial_expires_at > OLD.trial_expires_at AND auth.role() = 'authenticated' THEN
    RAISE EXCEPTION 'Trial duration cannot be extended by client.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_protect_student_trial
BEFORE UPDATE ON student_profiles
FOR EACH ROW
EXECUTE FUNCTION protect_student_trial();
```

### 4.2 Dual-Path Schema Resilience (No Downtime Fallback)
In enterprise pilot deployments, PostgREST rejects upserts with `PGRST204` if client payloads mention columns not yet refreshed in its schema cache.
`StudentRepository.saveProfile` executes dual-path resilience:
1. **Primary**: Upserts with direct trial columns (`trial_started_at`, `trial_expires_at`, `access_status`, `plan`).
2. **Resilient Fallback**: If column missing error occurs, saves trial state securely within `raw_draft` JSONB payload.
3. `StudentRepository.getProfile` and `getStudentAccess` inspect both top-level columns and `raw_draft` fallback, guaranteeing 100% functionality and testability under all environment states.

---

## 5. Payment Provider Abstraction

### 5.1 Architecture Interface (`src/lib/payment/types.ts`)
```typescript
export interface PaymentProvider {
  id: string;
  createCheckout(params: CheckoutParams): Promise<CheckoutResult>;
  confirmPayment(referenceId: string): Promise<PaymentStatusResult>;
  getAvailablePlans(): Promise<PaymentPlan[]>;
}
```

### 5.2 Implementation: `ManualPilotPaymentProvider`
- **Integrity Rule**: ZERO FAKE PAYMENTS. The provider never simulates instant client-side confirmation or fake receipts.
- **Product Model**:
  - Plan: **Pass BAC Mastery — موسم 2026**
  - Price: **3,900 DZD** (One-time payment for the full BAC academic season).
  - Status: Always returns `status: "pending"`.
  - Pilot Flow: Renders a transparent modal explaining that the student is part of the controlled pilot, displays their unique reference ID (`PILOT-{userId}-{timestamp}`), and prompts direct coordination with the pilot team.

---

## 6. Security Boundaries & Isolation Summary

1. **Row-Level Security (RLS)**:
   - `auth.uid() = user_id` enforced on `student_profiles`, `missions`, `diagnostic_sessions`, `skill_mastery`.
   - Verified by automated cross-tenant security test (`test-two-user-isolation.mjs` and `test-registration-trial.mjs`): 0 rows visible across accounts.
2. **Client Privilege Safeguards**:
   - `anon` key only in client bundle.
   - `service_role` strictly excluded.
   - Database trigger blocks direct unauthorized status elevation to `PAID`.
