# SHATER Marketing Tracking & Analytics Infrastructure

## 1. Overview & Architecture

SHATER's marketing tracking architecture is built as a single, decoupled, type-safe facade that coordinates:
- **Meta Pixel** (Client-side browser events via `fbevents.js`)
- **Meta Conversions API (CAPI)** (Server-side reliable conversion events via Graph API v20.0)
- **Google Analytics 4 (GA4)** (High-level web telemetry via `gtag.js`)
- **First-Party Telemetry** (Direct internal analytics store and Supabase audit)

```
                       User Action (Browser)
                                 │
                 ┌───────────────┴───────────────┐
                 │                               │
                 ▼                               ▼
     Meta Pixel (Browser)            Google Analytics 4 (GA4)
   trackMetaEvent / PageView        trackGAEvent / PageView
          (event_id)                             │
                 │                               │
                 │                               ▼
                 │                       Google Analytics 4
                 │
                 ▼
          Meta Ad Systems
                 ▲
                 │
                 │  Matching event_id Deduplication
                 │
                 │
   Meta Conversions API (CAPI)
      (Server-Side Node.js)
                 ▲
                 │
     POST /api/orders/checkout (Verified Purchase)
```

---

## 2. Directory Structure & Key Files

| File | Purpose | Environment |
| :--- | :--- | :--- |
| `src/lib/analytics/marketing.ts` | **Central Facade** — Single unified API for all components | Client / Isomorphic |
| `src/lib/analytics/meta.ts` | Client-side Meta Pixel helpers, standard event types & guards | Browser |
| `src/lib/analytics/meta-server.ts` | Server-side Meta Conversions API (CAPI) client with SHA-256 hashing | Server Only (Node.js) |
| `src/lib/analytics/gtag.ts` | Google Analytics 4 helper with strict PII scrubbing | Browser |
| `src/lib/analytics/tracker.ts` | First-party visitor tracker & UTM dual-touch attribution manager | Browser |
| `src/components/analytics/MetaPixel.tsx` | Root Next.js App Router component with client-side PageView tracking | Browser |
| `src/components/analytics/GoogleAnalytics.tsx` | Root Next.js App Router component for GA4 script injection | Browser |
| `src/types/meta.d.ts` | TypeScript declarations for `window.fbq` | Build / Typecheck |

---

## 3. Environment Variables

All variables are declared in `.env.example`.

```env
# Google Analytics 4 (Client-side)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Meta Pixel (Client-side)
NEXT_PUBLIC_META_PIXEL_ID=1234567890123456

# Meta Conversions API (Server-side ONLY - NEVER exposed to browser)
META_PIXEL_ID=1234567890123456
META_ACCESS_TOKEN=EAAG...your_system_user_token_here
META_TEST_EVENT_CODE=

# Marketing Analytics Debug Mode (true/false)
NEXT_PUBLIC_ANALYTICS_DEBUG=false
```

> **Security Guard**: `META_ACCESS_TOKEN` is loaded strictly on the server in `src/lib/analytics/meta-server.ts`. It never starts with `NEXT_PUBLIC_` and is never included in client JavaScript bundles.

---

## 4. Event Taxonomy & Trigger Matrix

| Event Name | Standard Meta Event | GA4 Event | Trigger Location | Trigger Condition |
| :--- | :--- | :--- | :--- | :--- |
| **PageView** | `PageView` | `page_view` | `MetaPixel.tsx` / `GoogleAnalytics.tsx` | Automatic on initial load & client-side navigation (ignoring `/ops/*`, `/admin/*`) |
| **ViewContent** | `ViewContent` | `view_item` | `/subscribe` | When visitor views the subscription pricing options |
| **CompleteRegistration** | `CompleteRegistration` | `sign_up` | `auth/register/page.tsx` | Fired **strictly after** `StudentService.saveRegistration` succeeds |
| **StartTrial** | `StartTrial` & `shater_trial_started` | `trial_started` | `auth/page.tsx` | Fired when new student account is created |
| **InitiateCheckout** | `InitiateCheckout` | `begin_checkout` | `/checkout` & `/subscribe` | When checkout page opens with selected plan |
| **Purchase** | `Purchase` | `purchase` | `/checkout` & `/subscribe` | Fired **strictly after** order is confirmed by server (`data.success === true`) |
| **Lead** | `Lead` | `generate_lead` | `/referral` | When student copies/shares their referral invite link |

---

## 5. Event Deduplication Architecture (`event_id`)

When a student confirms a subscription purchase, the system fires:
1. **Browser Pixel**: Dispatches `trackPurchase(...)` with `eventID: orderNumber || purch_orderId`.
2. **Server CAPI**: In `POST /api/orders/checkout`, `sendMetaServerEvent(...)` sends the purchase event with the **identical** `event_id: orderNumber || purch_orderId`.

Meta's Event Deduplication engine compares the `event_name` (`Purchase`) and the matching `event_id`. When received within 48 hours, Meta treats both as a single conversion, providing maximum attribution accuracy without double counting.

---

## 6. UTM Attribution Tracking

- **Capture**: `src/lib/analytics/tracker.ts` reads `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and `utm_term`.
- **First-Touch Attribution**: Saved on the visitor's first campaign visit in `localStorage["shater_first_touch_utm"]`. Stored permanently and never overwritten.
- **Last-Touch Attribution**: Updated in `localStorage["shater_last_touch_utm"]` whenever a visit contains campaign parameters.
- **Order Linking**: When `/checkout` or `/subscribe` submits an order, `getStoredAttribution()` attaches the full attribution object to `POST /api/orders/checkout`, recording it directly into the order record.

---

## 7. How to Test Events

### A. Local Debug Mode
1. In `.env.local`, set:
   ```env
   NEXT_PUBLIC_ANALYTICS_DEBUG=true
   ```
2. Open the browser DevTools Console.
3. Every marketing event will log:
   ```text
   [SHATER Analytics] ViewContent { eventId: "vc_...", content_name: "Subscription Plans", value: 4900, currency: "DZD" }
   ```

### B. Meta Pixel Helper Extension
1. Install the official **Meta Pixel Helper** Chrome extension.
2. Navigate through SHATER:
   - Homepage ➔ `PageView` (green checkmark)
   - `/subscribe` ➔ `ViewContent`
   - Create test account ➔ `StartTrial` + `CompleteRegistration`
   - `/checkout` ➔ `InitiateCheckout`
   - Confirm order ➔ `Purchase`

### C. Meta Events Manager Test Events (CAPI)
1. Go to **Meta Events Manager** ➔ Your Pixel / Dataset ➔ **Test Events**.
2. Copy the Test Code (e.g. `TEST12345`).
3. Set `META_TEST_EVENT_CODE=TEST12345` in your `.env.local` / deployment environment.
4. Complete a test purchase ➔ Both Browser and Server events will appear with matching `event_id` and green "Deduplicated" badges.

---

## 8. Adding New Events

To add a new event to the platform without duplicating code:
1. Open `src/lib/analytics/marketing.ts`.
2. Add a typed helper function (e.g. `trackExamCompleted`).
3. Call `trackMetaEvent`, `trackGAEvent`, and `sendAnalyticsEvent` inside.
4. Import and call the helper in your page component.
