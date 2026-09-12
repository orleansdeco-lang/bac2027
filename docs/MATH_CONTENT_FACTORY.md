# BAC Mastery — Mathematics Content Factory & Pipeline Architecture
**Document ID**: `DOC-MATH-FACTORY-001`  
**Version**: `1.0.0`  
**Evaluation Date**: `12 September 2026`  
**Target Examination**: `BAC 2027 (Session Juin 2027)`  
**Target Stream**: `3AS Mathématiques (streamId: "math")`  
**Target Subject**: `Mathématiques (subjectId: "math")`  
**Authoring Status**: `PRODUCTION BATCH 01 COMPLETED & CERTIFIED`  

---

## 1. Executive Summary & Factory Vision

BAC Mastery has expanded from its initial single-stream pilot (*Sciences Expérimentales*) into a rigorous, industrialized **Content Factory**. Designed to support all 6 Algerian national BAC streams, the Content Factory implements a deterministic, evidence-grounded production engine where learning materials are authored, audited, and verified against an uncompromising 18-gate quality control pipeline.

The Content Factory establishes **3AS Mathématiques** as its first production-grade target:
- **Academic Standard**: BAC 2027 under official Ministerial syllabus guidelines.
- **Pedagogical Rigor**: 13-element canonical pedagogical loops for each atomic skill.
- **Quality Standard**: Zero fabricated numerical percentages; transparent categorical scoring (`EXEMPLARY`, `ACCEPTABLE`, `PROVISIONAL`, `UNKNOWN`).
- **Regulatory Truth**: Strict evidentiary classification distinguishing between `OFFICIAL_CURRENT` directives (e.g., Ministerial Cancellation Decision of 10 September 2026) and `OFFICIAL_HISTORICAL` standards (Executive Decree 07-142).

---

## 2. The 13-Element Pedagogical Loop Architecture

Every skill produced by the Math Content Factory is encapsulated in a comprehensive `MathSkillDossier` containing 13 interlinked pedagogical components:

```
+-------------------------------------------------------------------------------+
|                       13-ELEMENT CANONICAL PEDAGOGICAL LOOP                   |
+-------------------------------------------------------------------------------+
|  1. Bilingual Objective (AR/FR)   --> Measurable BAC standard & cognitive verb|
|  2. Diagnostic Signal Profile     --> Misconception & prerequisite indicators |
|  3. Structured Concept Lesson     --> Rigorous mathematical markdown & latex  |
|  4. Cognitive Worked Example      --> How-to-think + >=3 Steps + Verify Tip   |
|  5. Active Recall Prompt          --> Concealed retrieval with rubric criteria|
|  6. Guided Practice Micro-Drills  --> Scaffolding from intermediate to exam    |
|  7. Cognitive Error Taxonomy      --> Canonical SuspectedErrorType attribution|
|  8. Actionable Repair Guide       --> Mental model + >=3 actionable steps     |
|  9. Isomorphic Retest Twin        --> Matching cognitive depth, distinct nums |
| 10. Mastery Determination         --> Explicit threshold with mandatory retest|
| 11. Visual Learning Asset         --> Accessible figures, plots, & flowcharts |
| 12. Curated External Resource     --> Verified links with return-action ticket|
| 13. Exam Transfer & Spaced Review --> BAC task forms, ONEC citations, intervals|
+-------------------------------------------------------------------------------+
```

---

## 3. The 18-Gate Quality Verification Pipeline

The Content Factory enforces an automated, 18-gate programmatic validation pipeline implemented in `scripts/test-math-content-factory.mjs`:

| Gate # | Gate Name | Automated Verification Mechanism | Status |
| :---: | :--- | :--- | :---: |
| **01** | **Curriculum Alignment** | Validates against 5 official domains, 11 topics, and MEN syllabus provenance. | **PASSED** |
| **02** | **Skill Uniqueness & IDs** | Verifies canonical `math_m_*` naming convention and zero ID collisions. | **PASSED** |
| **03** | **Priority Engine Determinism** | Validates 10-factor input evaluation; unanimous `HIGH` priority band. | **PASSED** |
| **04** | **Bilingual Objectives** | Asserts presence of Arabic & French pedagogical objectives with active verbs. | **PASSED** |
| **05** | **Diagnostic Signals** | Validates prerequisite, misconception, and procedural indicators. | **PASSED** |
| **06** | **Authoring Contract** | Runs `validateContentPackage()` asserting 0 structural or validation errors. | **PASSED** |
| **07** | **Cognitive Worked Examples** | Asserts problem, `>=3` step solutions, and pedagogical commentary. | **PASSED** |
| **08** | **Active Recall Prompts** | Verifies retrieval questions and multi-point evaluation criteria. | **PASSED** |
| **09** | **Practice Micro-Drills** | Asserts multiple practice exercises with explicit answer keys. | **PASSED** |
| **10** | **Error Taxonomy Rigor** | Asserts 100% adherence of distractors to canonical `SuspectedErrorType`. | **PASSED** |
| **11** | **Actionable Repair Guides** | Asserts mental model explanation and `>=3` actionable remediation steps. | **PASSED** |
| **12** | **Isomorphic Retest Twins** | Asserts structural isomorphism with distinct parameters (no duplicate text). | **PASSED** |
| **13** | **Visual Learning Assets** | Audits accessibility metadata (alt text, screen-reader summary, non-color cues). | **PASSED** |
| **14** | **External Resources** | Validates safe HTTP(S) protocol and mandatory return-action tickets. | **PASSED** |
| **15** | **BAC Exam Transfer** | Asserts typical exam task forms, common pitfalls, and ONEC citations. | **PASSED** |
| **16** | **Spaced Review Schedules** | Asserts calibrated review intervals (Day 1, 3, 7, Exam application). | **PASSED** |
| **17** | **Claim & Regulatory Audit** | Runs `auditClaimString()`; 0 blockers, 0 fake coefficients, historical decree. | **PASSED** |
| **18** | **Integrated Skill Dossier** | Asserts complete resolution of `getMathSkillDossier()` for all 12 skills. | **PASSED** |

---

## 4. Architectural Boundaries & Non-Negotiable Invariants

1. **Zero Database Migrations**: All domain models, curriculum structures, and content packages are pure, immutable TypeScript structures. The Supabase schema remains fixed at the 3 baseline migrations.
2. **Zero AI/LLM Dependencies**: All content is authored by curriculum architects and pedagogical engineers. No runtime LLM APIs are invoked.
3. **No Marketplace Code**: No payment gateways, tutor booking calendars, or marketplace UIs are introduced.
4. **Preservation of Sciences Expérimentales**: The 31 canonical reference skills remain 100% intact, published, and unaffected.
5. **Real Student Validation Gate**: Deliberately maintained as **PENDING** until formal pilot classroom onboarding.
