# BAC Mastery — 48-Hour Trial & Conversion Product Specification
**Product Feature:** Authenticated Pilot, 48-Hour Free Trial, and Pedagogical Conversion Gate  
**Target Audience:** Algerian 3AS BAC Students (Série: Sciences Expérimentales)  
**Document Version:** 1.0.0  
**Phase:** Prompt 18  

---

## 1. Product Philosophy & Ethical Principles

BAC Mastery is not a gamified trick or an aggressive sales funnel. It is a serious academic preparation partner for Algerian baccalaureate candidates:

> **"من مستواك الحالي إلى هدفك"**  
> **"ماشي واش تقرا. كيفاش توصل."**

### Core Conversion Principles:
1. **Evidence-Based Conversion**: The paywall does not sell hype or generic promises; it reflects the student's *own demonstrated effort* (their exact target BAC score, their diagnostic baseline, the specific bottleneck identified, and the missions they completed).
2. **Respect for Student Data**: When the 48-hour trial expires, the student's data is **NEVER deleted or held hostage**. The roadmap, past diagnostics, and mastery records remain permanently accessible in read-only mode.
3. **No Dark Patterns**: No fake countdown timers ("only 5 minutes left!"), no fake discounts ("was 50,000 DZD, now 3,900 DZD!"), no forced credit card entry.
4. **Authentic Algerian Context**: Transparent pricing in Algerian Dinars (**3,900 DZD / saison complète**), clear educational phrasing in Standard Educational Arabic with dignified, respectful local phrasing (*"كمّل BAC Mastery"*).

---

## 2. The Student Journey Map

```
Stage 1: Exploration (Guest)
  • Student lands on BAC Mastery.
  • Completes Onboarding (Target BAC score, Study time, Energy).
  • Completes Diagnostic Test (Sciences Expérimentales: Math, Physics, SNV).
  • Discovers their personalized roadmap and primary bottleneck.

Stage 2: Registration Gate
  • To lock in their roadmap and start missions, the student creates an account.
  • Simple 3-field form: Email, Password, Password Confirmation.
  • Local guest progress automatically and idempotently migrates to the cloud.

Stage 3: 48-Hour Free Trial (TRIAL_ACTIVE)
  • Trial clock begins immediately upon registration via server timestamp.
  • Student has 48 hours of full, unrestricted access:
    - Study step (interactive lessons with LaTeX formulas)
    - Worked examples (step-by-step breakdown)
    - Practice step (immediate feedback)
    - Error Lab (deep diagnosis & micro-practice drills)
    - Retest verification (twin question mastery validation)
  • Dashboard and Account display a calm, non-intrusive status badge:
    "تجربتك المجانية مازالت فعالة • باقي X ساعة"

Stage 4: Trial Expiration (TRIAL_EXPIRED)
  • When server time passes 48 hours:
    - Roadmap and past achievements remain viewable.
    - Attempting practice or retests in a mission triggers the dignified expired gate.
    - Gate copy: "انتهت فترة التجربة المجانية (48 ساعة) • جميع مهامك وتقدمك الدراسي محفوظان بدقة."
    - Primary CTA directs smoothly to `/subscribe`.

Stage 5: Conversion Gate (/subscribe)
  • Personalized evidence card renders live student stats:
    - Target BAC Score (e.g., 16.50/20)
    - Diagnostic Signal (e.g., 60%)
    - Completed Missions count
    - Demonstrated Skills count
    - Primary Bottleneck (e.g., "معادلات الأكسدة والإرجاع")
  • Clear single-tier offering:
    - **Pass BAC Mastery الكامل — موسم 2026**
    - **3,900 DZD** (valid until BAC exam day)
  • Pilot activation flow: opens transparent pilot modal with unique reference code.
```

---

## 3. UX & UI Specifications by Screen

### 3.1 Authentication Screen (`/auth`)
- **Mode Toggle**: Clean toggle between "تسجيل الدخول" (Sign In) and "إنشاء حساب جديد" (Sign Up).
- **Signup Fields**:
  - `auth-email-input`: Email with format validation.
  - `auth-password-input`: Password (minimum 6 characters).
  - `auth-confirm-password-input`: Password confirmation with instant matching validation.
  - `auth-submit-button`: Clear submission CTA.
- **Copy**:
  - Arabic: *"أنشئ حسابك لحفظ تقدمك واستكشاف BAC Mastery مجاناً لمدة 48 ساعة."*
  - French: *"Créez votre compte pour sauvegarder vos progrès et explorer BAC Mastery gratuitement pendant 48 heures."*

### 3.2 Dashboard Trial Banner (`/dashboard`)
- **Active State (`TRIAL_ACTIVE`)**:
  - Position: Subtle top banner beneath header.
  - Visual: Slate/blue palette, non-intrusive.
  - Text: *"تجربتك المجانية مازالت فعالة • باقي {remainingHours} ساعة"* + link *"تفاصيل التفعيل"*.
- **Expired State (`TRIAL_EXPIRED`)**:
  - Visual: Amber/dark slate palette, calm warning icon.
  - Text: *"التجربة انتهت • تقدمك وخريطتك محفوظان"*
  - Subtext: *"قم بتفعيل اشتراكك لمتابعة المهام والتصحيح الذكي."*
  - Action Button: *"كمّل BAC Mastery"* -> `/subscribe`.

### 3.3 Mission Access Gate (`/mission/[missionId]`)
- **Active State**: Full study, practice, and retest capabilities enabled.
- **Expired State**:
  - Learning content and lesson text remain visible.
  - Interactive practice and retest interactive controls are replaced by `mission-trial-expired-gate`.
  - Icon: Shield / Lock in warm amber.
  - Primary CTA: *"كمّل BAC Mastery"* -> `/subscribe`.
  - Secondary CTA: *"العودة للخريطة"* -> `/roadmap`.

### 3.4 Conversion & Subscription Page (`/subscribe`)
- **Real Student Evidence Summary Card**:
  - Target Score badge: `{targetScore}/20`
  - Diagnostic Signal: `{diagnosticPercentage}%`
  - Completed Missions: `{count}`
  - Demonstrated Skills: `{masteryCount}`
  - Key Bottleneck highlight card.
- **Plan Pricing Card**:
  - Name: **Pass BAC الكامل (موسم 2026)**
  - Price: **3,900 DZD** (حتى يوم امتحان البكالوريا)
  - Core Benefits:
    - تغطية 31 كفاءة جوهرية في المواد الأساسية الثلاث (رياضيات، فيزياء، علوم)
    - نظام تشخيص الثغرات التلقائي وتوجيه المجهود اليومي
    - مخبر الأخطاء (Error Lab) لإصلاح المفاهيم المعقدة
    - أسئلة اختبار توأمية وإثبات الإتقان بالأدلة
  - Primary CTA: *"كمّل BAC Mastery"* (`subscribe-primary-cta`).
  - Secondary CTA: *"شوف واش بنيت حتى الآن"* -> `/progress`.
- **Pilot Activation Modal**:
  - Displays honest explanation: *"التفعيل متاح حالياً بشكل تجريبي (Pilot)"*.
  - Provides unique Student Reference Code (`PILOT-{userId}-{timestamp}`).
  - Instructions for pilot cohort confirmation.

### 3.5 Account & Subscription Settings (`/account`)
- **Card**: `data-testid="account-subscription-card"`
- **Fields**:
  - Current Plan: *"تجربة مجانية استكشافية (48 ساعة)"* vs *"Pass BAC كامل"*.
  - Access Status: *"وصول كامل متاح"* vs *"الوصول مقفل (مطلوب التفعيل)"*.
  - Expiration Date: Server-formatted local date string.
  - Upgrade CTA: Links to `/subscribe`.

---

## 4. Telemetry & Analytics Contract

Nine new pilot events are tracked via `src/lib/analytics/index.ts`:

| Event Name | Trigger Moment | Payload Attributes |
| :--- | :--- | :--- |
| `trial_started` | Fresh registration completes & trial initialized | `userId`, `trialExpiresAt` |
| `registration_completed` | Auth sign up succeeds | `userId`, `emailDomain` |
| `login_completed` | Auth sign in succeeds | `userId` |
| `trial_expiring` | User visits app with `< 6 hours` remaining | `userId`, `remainingHours` |
| `trial_expired` | User accesses app after 48h expiration | `userId`, `expiredAt` |
| `conversion_viewed` | User views `/subscribe` | `userId`, `source` |
| `conversion_cta_clicked` | User clicks primary subscribe CTA | `userId`, `planId` |
| `payment_started` | User initiates pilot checkout | `userId`, `planId` |
| `payment_confirmed` | Payment verified by authority | `userId`, `referenceId` |

---

## 5. Success Metrics for the Controlled Pilot

1. **Onboarding-to-Registration Rate**: `>= 60%` of students completing diagnostic create an account.
2. **48-Hour Trial Engagement**: `>= 70%` of trial users complete at least 2 missions during the 48-hour window.
3. **Conversion Page View Rate**: `>= 80%` of expired users view `/subscribe`.
4. **Pilot Conversion Intent**: `>= 20%` of trial-expired students click the pilot activation CTA.
