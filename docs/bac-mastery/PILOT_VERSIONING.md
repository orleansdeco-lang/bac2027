# BAC Mastery — Pilot Versioning & In-Flight Change Protocol
**Controlled Real-Student Validation (Prompt 18.2 § 31 & 32)**

---

## 1. Tri-Partite Versioning Architecture
To ensure scientific and observational interpretability across all student sessions, every pilot observation record and telemetry export must bind to three distinct version vectors:

| Component | Version String | Definition & Scope |
| :--- | :---: | :--- |
| **Product Platform Version** | `v1.2.0-pilot` | Next.js routes, UI layout, AppShell, trial engine, Supabase RLS policies, telemetry exporter. |
| **Learning System Version** | `v1.1.0-los` | 18-stage cycle, deterministic review algorithms (`src/domain/learning/spaced-review.ts`), priority hierarchy. |
| **Curriculum Content Version** | `v1.0.0-canonical` | 31 canonical Sciences Expérimentales skills, 62 practice questions, 31 repair guides, 31 isomorphic retest twins. |

---

## 2. In-Flight Change & Bug Remediation Policy during Pilot

If a defect or friction point is observed while a student cohort is active:

1. **Document First**:
   - Record the bug in `PILOT_CONTENT_FEEDBACK.md` or the defect register with severity rating (P0 to P3).
2. **Triaging Decision**:
   - **P0 (Security Breach / Fatal Data Loss)**: HALT pilot immediately. Apply hotfix, verify across test suites, increment product version (`v1.2.1-pilot`), and restart affected student session.
   - **P1 (Core Learning Loop Blocker)**: Fix only if the blocker prevents retest or mastery completion. Mark `PILOT_VERSION_CHANGE`.
   - **P2 / P3 (Minor UX Polish / Wording Tweaks)**: **DEFER** to post-pilot milestone. DO NOT modify UI copy mid-cohort to avoid skewing comparative observations between students.
3. **Prohibition of Silent Iteration**:
   - Never alter button text, question order, or diagnostic scoring between Student-03 and Student-04 without documenting a `PILOT_VERSION_CHANGE`.
