# BAC Mastery — Content Rights & Intellectual Property Policy
## Prompt 11: Legal Rigor, Fair Use Boundaries, and Copyright Separation

---

## 1. Separation of Source Authority from Content Rights

A foundational distinction in BAC Mastery is the separation between:
1. **Source Authority**: Where a fact or pedagogical standard originates (e.g. the Ministry of National Education).
2. **Content Rights**: Who holds the intellectual property rights to the specific expression, question, or text asset.

| Dimension | Official Ministerial Syllabus | Official National Exam (ONEC) | BAC Mastery Question Bank |
| :--- | :--- | :--- | :--- |
| **Source Type** | `official_curriculum` | `official_exam` | `original_bac_mastery` |
| **Rights Status** | `official_reference` | `official_reference` | `original` |
| **Usage Basis** | Fair use / public circular reference | Metadata citation & pedagogical guidance | Proprietary authoring & copyright |
| **Text Reproduction** | Title & code reference only | Metadata, exercise index, & original hints | Full prompt, options, & step-by-step solutions |

---

## 2. Rights Status Classification

Every content item in the system declares an explicit `ContentRightsStatus`:

| Rights Status | Code | Legal & Operational Treatment |
| :--- | :--- | :--- |
| **Original** | `original` | Authored directly by the BAC Mastery editorial and pedagogical team. Full proprietary ownership. Protected against unauthorized extraction. |
| **Official Reference** | `official_reference` | Citation of an official public administrative act or national examination. Contains metadata, exercise index, and targeted skill mappings without verbatim reproduction of protected exam sheets. |
| **Licensed** | `licensed` | Third-party pedagogical material formally licensed for digital distribution under specific terms. |
| **Permission Granted** | `permission_granted` | Academic material utilized with express written permission from the author or institution. |
| **External Reference Only** | `external_reference_only` | Citation and outbound hyperlink/reference only. No internal content storage. |
| **Restricted** | `restricted` | Internal pedagogical draft or candidate problem. Cleared for testing but blocked from public distribution. |
| **Unknown** | `unknown` | Rights unconfirmed. System flags for audit and suppresses from release. |

---

## 3. Past BAC Exam Governance (Fair Use & Metadata Mapping)

### 3.1 The Problem with Verbatim Exam Scraping
Many educational platforms indiscriminately scrape, clone, and host entire copyrighted PDF booklets and official examination print layouts. This creates substantial legal risk and intellectual property exposure.

### 3.2 The BAC Mastery Solution: Metadata Mapping & Original Pedagogical Commentary
BAC Mastery addresses national BAC exams through **academic citation and original analytical value**:
1. **Metadata Citation**:
   - `year`: e.g. `2023`
   - `session`: `"principal"` | `"catchup"`
   - `subjectId`: e.g. `"math"`
   - `exerciseNumber`: e.g. `2`
   - `subQuestionRef`: e.g. `"Partie B - Question 2.a"`
2. **Pedagogical Enrichment**:
   - Instead of reproducing the raw exam text verbatim, BAC Mastery provides:
     - **Targeted Skill Mapping**: Which of the 31 curriculum skills this problem tests.
     - **Conceptual Focus**: Summary of the mathematical or scientific mechanism.
     - **Guidance Notes (`guidanceNotes_ar`, `guidanceNotes_fr`)**: Trap avoidance, typical student oversights, and recommended problem-solving strategies.
3. **Legal Compliance**:
   - Respects public examination authority.
   - Complies with fair-use and bibliographic citation standards.
   - Ensures zero copyright infringement while maximizing student utility.

---

## 4. Protection of Original BAC Mastery Assets

All assessment questions (`PracticeQuestion`, `RetestQuestion`), the Error Lab distractor mappings, and the multi-step remediation guides are original creations:
- **`sourceType`**: `original_bac_mastery`
- **`rightsStatus`**: `original`
- **Integrity Guarantee**: Automated test suite (`Suite E`) verifies that all practice and retest items maintain `rightsStatus === "original"`.
- **License**: Proprietary to BAC Mastery.
