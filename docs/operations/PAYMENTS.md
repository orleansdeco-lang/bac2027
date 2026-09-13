# BAC Mastery — Payments & Subscription Authority
## Phase 2: Operations Foundation P0

### 1. Payment Philosophy
For the Algerian pilot, transactions are primarily conducted through **BaridiMob** and **CCP (Algérie Poste)** transfers. Automated credit cards (SATIM/CIB) are Phase 2. Client devices **NEVER** determine subscription status.

### 2. State Machine
```
[DRAFT]
   │
   ▼ (Student submits receipt / reference)
[PENDING]
   │
   ├───────────────────────────────┐
   ▼ (Operator approves)           ▼ (Operator rejects with mandatory reason)
[APPROVED]                      [REJECTED]
   │
   ▼ (Atomic Database RPC)
student_profiles.access_status = 'PAID'
student_profiles.plan = 'PAID'
operations_audit_logs += PAYMENT_APPROVED
```

### 3. Server Authority Invariants
1. `payment_orders.status` is guarded by CHECK constraints: `DRAFT`, `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`.
2. Normal students have `INSERT` permissions with `status IN ('DRAFT', 'PENDING')`, but **zero** `UPDATE` grants on `status`.
3. Only an authorized `OPERATOR` or `OWNER` can transition an order to `APPROVED` or `REJECTED`.
4. The database trigger `protect_student_trial_fields()` prevents students from modifying their own `access_status` directly in PostgreSQL.
