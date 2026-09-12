# BAC Mastery V1 — External Learning Resource Layer
**Prompt 20.1 Domain Specification Document**
*Version: 1.0.0 — Curated External Resource Architecture*
*Status: Verified & Active*

---

## 1. Pedagogical Rationale: Beyond the Link Directory

An open-web link directory provides uncurated hyperlinks that distract students, create infinite browsing loops, and sever learning accountability.

BAC Mastery strictly rejects the "link directory" model:
1. **Curated & Verified Only**: External resources are vetted for syllabus alignment with Algerian BAC requirements.
2. **Pedagogical Intent**: A link is never recommended as "helpful". It is recommended because:
   *"You made recurring error X on skill Y during retest Z."*
3. **Mandatory Return Action**: The student leaves with a mission and returns to prove learning.

```
       STUDENT STRUGGLES IN BAC MASTERY
                     │
                     ▼
       DETERMINISTIC ESCALATION ENGINE
                     │
                     ▼
  RECOMMENDATION: "Watch 10m CRDP Lesson on Limits"
  REASON: "Repeated failure in indeterminate forms"
                     │
                     ▼
      [Student leaves to external resource]
                     │
                     ▼
        MANDATORY RETURN TO BAC MASTERY
                     │
                     ▼
       UNSEEN ISOMORPHIC RETEST TWIN
                     │
                     ▼
             MASTERY VALIDATION
```

---

## 2. The Return-Action Contract

Every `ExternalLearningResource` and `ResourceRecommendation` declares a `suggestedReturnAction`:

| Return Action | Trigger Condition | Mandatory Student Task upon Return |
| :--- | :--- | :--- |
| `isomorphic_retest` | Failed retest after repair | Solve an independent twin problem with altered numerical values to demonstrate transfer. |
| `active_recall` | Conceptual confusion / passive viewing | Complete a closed-notes retrieval prompt immediately after watching/reading. |
| `guided_repair_step` | Incomplete repair protocol | Execute the next cognitive verification step in Error Lab. |
| `practice_micro_drill` | Procedural calculation slips | Solve a 3-minute focused micro-drill targeting the isolated operation. |
| `checkpoint_quiz` | Official document review | Answer a 2-question comprehension check verifying mastery of the ministerial guideline. |

---

## 3. Provenance Hierarchy & Copyright Boundaries

External resources are integrated strictly through metadata and safe outbound links.

### Copyright & Intellectual Property Protection
1. **Zero Text Scraping**: BAC Mastery **never** scrapes, copies, or republishes copyrighted third-party textbook chapters, paid videos, or proprietary courseware.
2. **Link-Only Architecture**: Resources are cited with metadata (`title`, `provider`, `url`, `duration`, `purpose`) and opened as external citations under `rightsStatus: "external_reference_only"` or `rightsStatus: "official_reference"`.

### Provenance Quality Classification
External resources inherit the platform's standardized provenance hierarchy:
- `OFFICIAL_CURRENT`: Current decrees, circulars, or official ministerial companion guides.
- `OFFICIAL_HISTORICAL`: Past national BAC examinations (ONEC archive) and ministerial solutions.
- `RESEARCH_SUPPORTED`: Peer-reviewed educational research or accredited pedagogical publisher material.
- `BAC_MASTERY_DERIVED`: Verified content syntheses authored by BAC Mastery inspectors.
- `PROVISIONAL`: Resources currently under pedagogical verification.
- `UNVERIFIED`: External third-party resources awaiting inspection (blocked from automated recommendation).

---

## 4. Technical Security & URL Safety

Outbound resource URLs represent an untrusted external surface. The platform enforces strict URL verification (`isSafeExternalUrl`):
- **Protocol Whitelist**: Only `https://` (and strictly validated `http://`) URLs are permitted.
- **Protocol Blacklist**: Executable URIs (`javascript:`, `data:`, `file:`, `blob:`, `vbscript:`) are rejected by the domain validator.
- **Zero Query Pollution**: No user authentication tokens, session secrets, emails, or student IDs are ever appended to outbound query strings.
