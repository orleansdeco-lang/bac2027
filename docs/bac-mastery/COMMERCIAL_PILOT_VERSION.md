# BAC Mastery — Commercial Pilot Version Specification
**Release Tag**: `v1.3.0-commercial`  
**Milestone**: PROMPT 19 — Commercial Hardening & Controlled Pilot Launch  
**Date**: September 12, 2026  
**Status**: `TECHNICAL COMMERCIAL READINESS: GREEN` | `REAL MARKET VALIDATION: PENDING`

---

## 1. Version Identifiers

```ini
[BAC_MASTERY_PLATFORM]
version = "v1.3.0-commercial"
commit = "HEAD"
framework = "Next.js 16.1.6 (App Router)"
backend = "Supabase PostgreSQL (Cloud Managed)"

[LEARNING_SYSTEM_FOUNDATION]
version = "v1.1.0-los"
stream = "Sciences Expérimentales"
canonical_skills = 31
subjects = ["math", "physics", "science"]
loop = "Diagnostic -> Roadmap -> Mission -> Practice -> Error Lab -> Repair -> Retest -> Mastery"

[CONTENT_SPECIFICATION]
version = "v1.0.0-canonical"
scope = "Sciences Expérimentales — Mathématiques (11), Physique-Chimie (10), Sciences Naturelles (10)"
twin_coverage = 100% (31/31 skills have twin retest questions)
error_taxonomy = "METHODOLOGICAL | CONCEPTUAL | CALCULATION"

[COMMERCIAL_SPECIFICATION]
version = "v1.0.0-pilot-pass"
model = "48h Free Trial -> 3,900 DZD Season Pass"
payment_mode = "Manual Pilot Provider (BaridiMob / CCP Verification)"
security_level = "Server-Authoritative Enforcement with Postgres Trigger & RLS"
```

---

## 2. Component Changelog (Prompt 19)

### A. Payment & Security Hardening
- **`src/lib/payment/types.ts`**: Introduced `PilotPaymentState` (`PAYMENT_NOT_STARTED`, `PAYMENT_REQUESTED`, `PAYMENT_PENDING_VERIFICATION`, `PAYMENT_CONFIRMED`, `PAYMENT_REJECTED`, `PAYMENT_CANCELLED`) and `PilotPaymentRecord`.
- **`src/lib/payment/manual-pilot-provider.ts`**:
  - Implemented local and remote payment record tracking via `savePaymentRecord` and `getStoredPaymentRecords`.
  - Added `markPaymentPendingVerification` to securely record student receipt submission without elevating account permissions.
  - Hardened `confirmPayment` to return `false` on any client call.
- **`scripts/test-payment-security.mjs`**: Authoritative suite testing 7 adversarial attack vectors (storage tampering, URL injection, payload alteration, token replay, user substitution, clock rollback, server authority). All 7 vectors verified secure.

### B. User Experience & Commercial Transparency
- **`src/app/subscribe/page.tsx`**:
  - Fully articulated answers to the 5 core commercial/educational questions (*واش راح نربح؟، واش راح نستعمل؟، بقداه؟، كيفاش نخلص؟، واش يصرا من بعد؟*).
  - Configurable supervisor support via `NEXT_PUBLIC_SUPPORT_WHATSAPP` and `NEXT_PUBLIC_SUPPORT_EMAIL` with safe `SUPPORT_CONTACT_REQUIRED` fallback.
  - Real student evidence card displaying target score, diagnostic signal, completed missions, and validated masteries.
  - Interactive modal with state transitions (`PAYMENT_REQUESTED` $\to$ `PAYMENT_PENDING_VERIFICATION`).
- **`src/app/page.tsx`**:
  - Aligned dynamic primary CTA with Section 11 specifications:
    - New visitor: `"ابني خريطتي"` (`/onboarding`)
    - Onboarded student: `"شوف خريطتي"` (`/roadmap`)
    - Active mission: `"كمّل مهمتك"` (`/mission/[id]`)
    - Expired trial: `"شوف الحل"` (`/subscribe`)
    - Paid active: `"كمّل مهمتك"` (`/dashboard`)
- **`src/app/account/page.tsx`**:
  - Honest trial countdown and status display.
  - Pending payment reference and verification status banner.

### C. Automated Validation & Verification
- **`scripts/test-commercial-pilot-readiness.mjs`**: End-to-end verification of all 21 commercial lifecycle gates (A through U). 100% pass rate.
