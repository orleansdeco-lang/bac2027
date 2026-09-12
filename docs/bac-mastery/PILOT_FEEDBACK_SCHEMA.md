# BAC Mastery — Pilot Feedback Schema & Protocol
**Controlled Real-Student Validation (Prompt 18.2 § 23)**

---

## 1. Feedback Design Principles
1. **Frictionless Interaction**: One-tap rating at the end of practice or mission completion. Never block student navigation if they choose to skip.
2. **Standard 3-Point Sentiment Scale**:
   - 👍 **مفيد** (`helpful`): The practice or explanation directly clarified the concept or method.
   - 😐 **عادي** (`neutral`): Adequate but unremarkable or standard content.
   - 👎 **ما فادنيش** (`unhelpful`): Confusing, poorly phrased, or unhelpful.
3. **Optional Clarification Prompt**:
   - *"علاش؟ (اختياري)"* — Allows short qualitative student commentary without character minimums.
4. **Local Anonymity**: Feedback is buffered client-side and scrubbed of identity markers.

---

## 2. TypeScript Data Schema (`PilotFeedbackPayload`)

```typescript
export type PilotFeedbackRating = "helpful" | "neutral" | "unhelpful" | "easy" | "normal" | "hard" | "unclear";

export interface PilotFeedbackPayload {
  id: string;                      // Format: fb_{timestamp}_{random}
  userId?: string | null;          // Pseudonymized or null for guests (e.g. anon_a1b2c3d4)
  sessionId: string;               // Anonymous session identifier
  missionId?: string;              // Target mission identifier (e.g. mission_math_derivatives)
  skillId?: string;                // Canonical skill ID (e.g. math_derivatives_chain_rule)
  step?: string;                   // Current learning step (e.g. practice, repair, retest)
  rating: PilotFeedbackRating;      // The selected sentiment
  feedbackNote?: string;           // Optional student text explanation
  createdAt: string;               // ISO 8601 UTC timestamp
}
```

---

## 3. Storage & Export Invariants
- **Storage Location**: `localStorage.getItem("bac_mastery_pilot_feedback")`
- **Scrubbing Rule**: User IDs are scrubbed before export to prevent correlation with email or auth identities.
- **Quota Safeguard**: Maximum 200 feedback entries stored locally before FIFO rotation.
