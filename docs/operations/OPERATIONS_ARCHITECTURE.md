# BAC Mastery — Operations Architecture Specification
## Phase 2: Operations Foundation P0

### 1. Conceptual Separation
BAC Mastery maintains a strict architectural boundary between the **Learning Core** and the **Operations Core**:

```
BAC MASTERY
│
├── LEARNING CORE (10 Canonical Tables)
│   ├── student_profiles
│   ├── diagnostic_sessions
│   ├── diagnostic_answers
│   ├── diagnostic_results
│   ├── missions
│   ├── practice_attempts
│   ├── errors
│   ├── error_repairs
│   ├── retests
│   └── skill_mastery
│
└── OPERATIONS CORE (4 Additive Tables + Aggregations)
    ├── user_roles
    ├── telemetry_events
    ├── payment_orders
    ├── operations_audit_logs
    └── ops_* SQL views & API aggregators
```

### 2. Core Tenets
1. **The Learning Core is the Source of Truth:** Student pedagogical data is never altered or replaced by the Operations Core. The Operations Core observes, audits, and controls entitlements.
2. **Strict Additive Schema:** Zero tables are renamed or dropped. Zero columns in the Learning Core are weakened.
3. **Server-Side Authority:**
   - Client clocks cannot dictate trial expiration.
   - Client storage cannot self-elevate a subscription.
   - Client-side role claims are untrusted.
4. **Least Privilege & Privacy:** Only authorized operators can access `/ops`. Normal students cannot query operations tables or cross-student telemetry.
