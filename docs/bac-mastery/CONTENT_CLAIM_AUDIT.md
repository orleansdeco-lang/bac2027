# BAC Mastery — Content Claim Audit Specification
**Legal, Pedagogical & Quality Policy Document**
*Version: 1.0.0 — Automated Claim Scanner*
*Status: Verified & Active*

---

## 1. Purpose of the Claim Audit

In Algerian test preparation, commercial marketing frequently resorts to sensationalist, misleading, or legally void claims (e.g. "guaranteed 20/20", "threshold guaranteed", "leaked topics").

BAC Mastery maintains **institutional credibility and legal compliance** through an automated claim scanner (`auditClaimString`) that audits all lessons, worked examples, practice prompts, and marketing copy.

---

## 2. Forbidden Claim Taxonomies & Severity Rules

| Category | Prohibited Phrases / Patterns | Severity | Legal & Pedagogical Rationale | Required Remediation |
| :--- | :--- | :--- | :--- | :--- |
| **Score Guarantee** | `علامة مضمونة`, `نضمن لك`, `ستحصل حتماً على`, `guaranteed score` | **BLOCKER** | Commercial score guarantees are scientifically invalid and pedagogically irresponsible. | Rephrase to emphasize skill mastery and structured effort (e.g. "إتقان المنهجية النموذجية"). |
| **Forbidden Threshold** | `عتبة الدروس`, `عتبة البكالوريا`, `العتبة الرسمية` | **BLOCKER** | The "threshold" (El-Ataba) concept is officially abolished in Algerian education. | Delete term entirely; affirm coverage of official syllabus competencies. |
| **Exam Topic Prediction** | `موضوع مؤكد في البكالوريا`, `سؤال مضمون 100%`, `توقع مؤكد لشهادة` | **BLOCKER** | Speculative claims about exam papers deceive learners and encourage surface learning. | Replace with: "نمط متكرر في اختبارات البكالوريا السابقة". |
| **2027 Official Coefficients** | `المعامل الرسمي لـ 2027`, `official BAC 2027 coefficient` | **BLOCKER** | The 10 September 2026 decision cancelled the previous decree; new 2027 coefficients are unissued. | Mark as `OFFICIAL_HISTORICAL` under Decree 07-142 pending new publications. |
| **Ministry Correction Standards** | `تصحيح وزاري رسمي ملزم`, `معايير التصحيح الوزاري القطعية` | **WARNING** | Official correction grids change annually; marking them as immutable is inaccurate. | Rephrase to: "حل نموذجي وفق الدليل البيداغوجي المعتمد". |
| **Syllabus Absolutism** | `المنهاج الوزاري الكامل 100%`, `برنامج البكالوريا الشامل الحصري` | **WARNING** | Avoid ungrounded monopoly claims. | Rephrase to: "تغطية للكفاءات الأساسية المستهدفة في المنهاج". |

---

## 3. Enforcement in Content Pipeline

1. **Pre-Publish Gate**:
   - Any content package containing a `BLOCKER` violation is immediately rejected from the `PUBLISHED` state.
2. **Automated CI/CD Scanner**:
   - `scripts/test-content-quality-infrastructure.mjs` executes regular pattern sweeps across all source files.
3. **Exemption Protocol**:
   - Verified historical citations (e.g. citing historical ministerial communiqués in documentation) are permitted only when explicitly categorized under `OFFICIAL_CURRENT` or `OFFICIAL_HISTORICAL`.
