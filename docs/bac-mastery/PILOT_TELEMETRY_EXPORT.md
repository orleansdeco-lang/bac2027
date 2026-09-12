# BAC Mastery — Pilot Telemetry & Safe Data Export Specification
**Controlled Real-Student Validation (Prompt 18.2 § 24 & 25)**

---

## 1. Architectural Reality Statement
> [!NOTE]
> **Device-Local Telemetry**: In current pilot architecture, learning telemetry and feedback are buffered in **client-side local storage** on each student's device (`localStorage`). There is NO continuous server-side event ingestion pipeline or third-party tracking pixel. Telemetry is device-local and not aggregated remotely.

To analyze pilot data without compromising security or building an unnecessary analytics SaaS, BAC Mastery provides an **in-product anonymized export mechanism** accessible via `/account`.

---

## 2. Export Schema Specification (`v1.0.0`)

The export format is standardized JSON adhering strictly to:

```json
{
  "schemaVersion": "1.0.0",
  "exportedAt": "2026-09-12T15:45:00.000Z",
  "totalEvents": 42,
  "events": [
    {
      "id": "evt_1789224100000_a1b2c",
      "name": "practice_completed",
      "timestamp": "2026-09-12T15:42:10.000Z",
      "properties": {
        "sessionId": "pilot_ses_1789224000000_xyz789",
        "userId": "anon_235e08ab",
        "missionId": "mission_math_derivatives",
        "skillId": "math_derivatives_chain_rule",
        "isCorrect": false,
        "confidence": 3,
        "timeSpentSeconds": 85
      }
    }
  ],
  "totalFeedback": 3,
  "feedback": [
    {
      "id": "fb_1789224150000_d4e5f",
      "missionId": "mission_math_derivatives",
      "skillId": "math_derivatives_chain_rule",
      "rating": "helpful",
      "feedbackNote": "الشرح واضح بصح التمرين الثاني صعيب شوية",
      "userId": "anon_235e08ab",
      "createdAt": "2026-09-12T15:43:00.000Z"
    }
  ]
}
```

---

## 3. Mandatory Security & Sanitization Guarantees
Before the export file is generated:
1. **User ID Masking**: Full UUIDs (e.g. `235e08ab-94b5-40c7-9f4d-23d3d46d578f`) are truncated to irreversible 8-character hashes prefixed by `anon_` (e.g. `anon_235e08ab`).
2. **PII Scrubbing**: The `email` field is explicitly deleted from all event properties.
3. **Secret Elimination**: All authorization tokens, Bearer headers, and JWTs are stripped by `sanitizeProperties()`.
4. **Offline Export**: The export runs entirely in browser memory (`Blob` generation) without communicating with external endpoints.

---

## 4. Manual Collection Procedure on Pilot Devices
1. At the conclusion of a pilot session, the observer navigates to `/account` on the student's device.
2. Scroll to the card: **"بيانات التجربة الميدانية (Pilot Export)"**.
3. Click **"تحميل سجل التجربة المجهول (JSON)"** (`data-testid="pilot-export-btn"`).
4. The browser downloads `bac_mastery_pilot_data_{timestamp}.json`.
5. The observer transfers the JSON file to the pilot analysis vault for offline synthesis.
