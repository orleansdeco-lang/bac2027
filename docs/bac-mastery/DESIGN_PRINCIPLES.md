# BAC MASTERY — DESIGN PRINCIPLES & SYSTEM DIRECTION

## 1. Design Philosophy

The visual aesthetic of BAC Mastery reflects **intellectual rigor, calm composure, and human empathy**.

```
┌─────────────────────────────────────────────────────────────┐
│                       WHAT IT IS                            │
│  • Modern          • Academic        • Calm                 │
│  • Motivating      • Serious         • Human                │
│  • A personal coach + dynamic roadmap                       │
├─────────────────────────────────────────────────────────────┤
│                     WHAT IT IS NOT                          │
│  • Childish        • Casino / Gamified  • Cheap             │
│  • Overloaded      • Cold Corporate     • AI-generic        │
│  • An endless school repository of 1,000 PDF links          │
└─────────────────────────────────────────────────────────────┘
```

The Algerian student preparing for the BAC is already surrounded by intense familial, social, and academic anxiety. The application must act as a **quiet sanctuary of clarity**, reducing cognitive noise rather than multiplying it.

---

## 2. Core Color System

The palette uses grounding academic tones paired with gentle state indicators:

| Token Name | Hex Code | Purpose & Feeling |
|---|---|---|
| `bg-canvas` | `#F8FAFC` (Slate 50) | Warm, clean paper-like canvas; prevents screen glare during long reading sessions. |
| `surface-card` | `#FFFFFF` | Crisp white cards with ultra-subtle border (`#E2E8F0`). |
| `text-primary` | `#0F172A` (Slate 900) | Deep academic ink; highest readability and contrast. |
| `text-secondary` | `#475569` (Slate 600) | Calm explanatory text and metadata. |
| `brand-primary` | `#0D9488` (Teal 600) | Deep Algerian academic teal; focused, inspiring, authoritative. |
| `brand-accent` | `#0284C7` (Sky 600) | Precision and future perspective. |
| `state-mind-good` | `#10B981` (Emerald 500)| Calm reassurance, mastery, confidence. |
| `state-mind-rest` | `#F59E0B` (Amber 500)  | Gentle caution, rest reminder, pause indicator. |
| `state-bottleneck`| `#EF4444` (Red 500)    | Highlighting the active bottleneck with clarity, not shame. |

### Anti-Patterns:
- **No Neon Gradients**: Avoid aggressive violet/pink glow effects that mimic cryptocurrency landing pages.
- **No Dark Glassmorphism Bloat**: Avoid heavily blurred backdrop filters that harm readability on budget smartphone displays.

---

## 3. Typography Hierarchy

The typographic system must balance Arabic script (right-to-left) and Latin characters (French formulas, math terms) gracefully on the same line:

* **Arabic Typography**: Cairo / IBM Plex Sans Arabic. Clean, geometric, clear diacritics, legible at small sizes on mobile screens.
* **Latin Typography**: Inter / Geist. Standard neutral sans-serif designed for clean user interfaces.
* **Font Weights**:
  * Light / Regular (`400`): Body copy and lesson notes.
  * Medium (`500`): Mission titles, chips, navigation.
  * Semibold / Bold (`600`/`700`): Section headers, target scores, and constitutional statements.

---

## 4. Mobile-First Ergonomics

1. **Thumb Zone Architecture**: Primary actions (starting a mission, logging an error, switching language, checking mind state) sit in the lower 60% of the screen.
2. **Minimal Density**: Maximum of 3 primary missions visible at one time. Never dump 15 tasks on a single screen.
3. **Generous Touch Targets**: All interactive elements have a minimum hit target of `48px × 48px`.
4. **Instant Visual Feedback**: Smooth 150ms transitions on state changes without jarring page refreshes.

---

## 5. Accessibility & Contrast Standards

* **WCAG 2.1 AA Compliance**: Contrast ratios of at least `4.5:1` for body text and `3:1` for UI controls.
* **Keyboard Navigation**: Explicit focus rings (`ring-2 ring-teal-500 ring-offset-2`) on all interactive buttons and inputs.
* **Screen Reader Semantic Hierarchy**: Strict use of `<main>`, `<nav>`, `<header>`, `<article>`, and `<h1>` through `<h3>`.
* **Zero Shame Error Messaging**: Red is reserved strictly for diagnosing scientific errors, never for scolding missed deadlines.
