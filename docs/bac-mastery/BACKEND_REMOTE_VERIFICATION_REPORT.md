# BAC Mastery — Backend Remote Verification Report
**Document Type:** Live Infrastructure & Remote Verification Audit (Prompt 10.4.2)  
**Date/Time:** September 11, 2026, 19:33 UTC+1  
**Project Ref:** `erbvmpnxufgeinqnshzu`  
**Supabase URL:** `https://erbvmpnxufgeinqnshzu.supabase.co`  
**Status:** Verification Conducted — Actionable Provider Toggle Blocker Identified  

---

## 1. Executive Summary
Following the user's configuration update in the Supabase Dashboard, live authentication tests were executed against `erbvmpnxufgeinqnshzu`.
- **Finding:** The master toggle **"Enable Email provider"** was inadvertently turned OFF instead of (or alongside) "Confirm email", resulting in GoTrue returning:
  - `SignUp: 400 Email signups are disabled`
  - `SignIn: 422 Email logins are disabled`
- **Integrity Rule:** Per prompt instructions, we do not invent live two-user session interactions when the auth provider is disabled. The status remains transparently **BLOCKED** with a 5-second fix.

---

## 2. Remote Table & Schema Audit
All 10 student foundation tables are confirmed live, reachable, and enforcing RLS:
1. `student_profiles` — **Verified** (table exists)
2. `diagnostic_sessions` — **Verified** (table exists)
3. `diagnostic_answers` — **Verified** (table exists)
4. `diagnostic_results` — **Verified** (table exists)
5. `missions` — **Verified** (table exists)
6. `practice_attempts` — **Verified** (table exists)
7. `errors` — **Verified** (table exists)
8. `error_repairs` — **Verified** (table exists)
9. `retests` — **Verified** (table exists)
10. `skill_mastery` — **Verified** (table exists)

---

## 3. RLS Live Rejection Verification
Every table was probed with unauthenticated write requests. All 10 tables actively rejected the operations:
- `student_profiles`: Rejected with code `42501`
- `diagnostic_sessions`: Rejected with code `42501`
- `diagnostic_answers`: Rejected with code `42501`
- `diagnostic_results`: Rejected with code `42501`
- `missions`: Rejected with code `42501`
- `practice_attempts`: Rejected with code `42501`
- `errors`: Rejected with code `42501`
- `error_repairs`: Rejected with code `42501`
- `retests`: Rejected with code `42501`
- `skill_mastery`: Rejected with code `42501`

Unauthenticated `SELECT` requests across all tables returned 0 rows.

---

## 4. Live Auth Audit
- `signUp()`: Returned `400 Email signups are disabled`.
- `signInWithPassword()`: Returned `422 Email logins are disabled`.
- **Root Cause:** In the Supabase Dashboard (`Authentication -> Providers -> Email`), the master toggle **"Enable Email provider"** is currently set to OFF.

---

## 5. Automated Test Suite Results
- **Domain Test Suites (6 suites):** 116 / 116 PASS
- **Security Test Suite:** 12 / 12 PASS (`scripts/test-supabase-security.mjs`)
- **TypeScript (`tsc --noEmit`):** PASS (0 errors)
- **Production Build (`next build`):** PASS (11/11 routes built successfully)

---

## 6. Actionable Resolution (5 Seconds)
In your Supabase Dashboard for project `erbvmpnxufgeinqnshzu`:
1. Go to **Authentication** → **Providers** → **Email**.
2. Turn **"Enable Email provider"** to **ON** (checked).
3. Underneath it, ensure **"Confirm email"** is **OFF** (unchecked).
4. Scroll to the bottom of the Email section and click the green **"Save"** button.
