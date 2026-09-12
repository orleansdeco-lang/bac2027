# BAC Mastery — Commercial Pilot Release Checklist
**Target Release**: Controlled Pilot Launch (5 to 10 Real Students)  
**Stream**: Sciences Expérimentales (Saison BAC 2026)  
**Date**: September 12, 2026  

---

## 1. Product & Architecture Readiness
- [x] **No Project Reset / Architecture Rebuild**: Preserved existing Next.js App Router and Supabase structure.
- [x] **Zero AI API Dependencies**: No external LLM, ChatGPT, or Gemini dependencies in runtime learning loop.
- [x] **Canonical Content Intact**: All 31 Sciences Expérimentales skills (Math, Physics, Science) preserved without schema breaking changes.
- [x] **State Persistence**: Student profile, diagnostic results, practice sessions, error records, and masteries persist in both Supabase and LocalStorage.
- [x] **Offline / Fallback Resilience**: Full fallback to LocalStorage when Supabase network is unreachable.

---

## 2. Security & Payment Safeguards
- [x] **Adversarial Security Tested**: All 7 attack vectors verified via `test-payment-security.mjs`.
- [x] **Postgres Trigger Protection**: `trg_protect_student_trial` intercepts client attempts to elevate to `PAID`.
- [x] **RLS Multi-Tenant Isolation**: Verified that Student B cannot access, read, or modify Student A's records.
- [x] **No Premature Activation**: Clicking "أرسلت التأكيد للمشرف" moves payment record to `PAYMENT_PENDING_VERIFICATION` without granting `PAID_ACTIVE`.
- [x] **Server Authority Required**: Only authoritative administrative intervention can mark `access_status: "PAID"`.
- [x] **Zero Credential Capture**: Platform never prompts for CCP pins, CIB card numbers, or banking passwords.

---

## 3. Commercial Funnel & Transparency
- [x] **Honest 48h Free Trial**: Countdown timer clearly shows hours remaining; no surprise lockouts.
- [x] **Transparent Season Pass**: Fixed price of 3,900 DZD valid until BAC exam day; no recurring subscriptions or hidden fees.
- [x] **5 Core Questions Answered**: Fully articulated in Arabic and French on `/subscribe`.
- [x] **No Fake Dark Patterns**: No artificial countdowns, no fake scarcity, no fake testimonials.
- [x] **Configurable Support**: WhatsApp and Email links read from environment variables; falls back to `SUPPORT_CONTACT_REQUIRED`.

---

## 4. Cross-Platform UX
- [x] **Mobile Responsiveness**: Verified on 390×844 viewport (iPhone/Android standard).
- [x] **Desktop Responsiveness**: Verified on 1440×900 viewport.
- [x] **Bilingual Support**: Instant switching between Arabic (RTL) and French (LTR).
- [x] **Dynamic Landing CTA**: Aligned with Section 11 specifications across all student lifecycle states.

---

## 5. Supervisor Operations Protocol (Manual Payments)
1. **Student submits payment request** on `/subscribe` $\to$ receives unique reference code `PILOT-BAC-XXXX`.
2. **Student sends proof of transfer** (BaridiMob screenshot or CCP receipt) to supervisor WhatsApp/Email quoting the reference code.
3. **Supervisor verifies receipt** against platform database / account records.
4. **Supervisor elevates student status** in Supabase:
   ```sql
   UPDATE public.student_profiles
   SET access_status = 'PAID', plan = 'PAID', updated_at = NOW()
   WHERE id = '<STUDENT_USER_ID>';
   ```
5. **Student profile immediately activates `PAID_ACTIVE`**, and student resumes learning loop seamlessly.

---

## 6. Pilot Release Decision

| Category | Status | Notes |
| :--- | :--- | :--- |
| **Technical Commercial Readiness** | **GREEN** | 100% passing automated test suites, clean build, zero regressions. |
| **Security Posture** | **GREEN** | RLS verified, trigger enforced, zero client elevation vectors. |
| **Real Market Validation** | **PENDING** | Requires execution with 5-10 real paying students during controlled pilot. |
| **Final Recommendation** | **READY FOR CONTROLLED COMMERCIAL PILOT** | Ready to onboard pilot cohort under supervisor monitoring. |
