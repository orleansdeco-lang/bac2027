# BAC Mastery — Content Test Integrity Baseline
**Document ID**: `DOC-TEST-BASELINE-001`  
**Audit Phase**: Prompt 13.1 Adversarial Content Truth & Quality Audit  
**Date**: 12 September 2026  
**Status**: ACTIVE BASELINE FREEZE  

---

## 1. Declarative Principle

> **"Tests are frozen as the audit baseline."**

In accordance with Section 2 of Prompt 13.1, before modifying any content or fixing any educational defects, all existing automated verification suites are officially frozen.
Under no circumstances may tests be deleted, assertions weakened, or invariants diluted to falsely turn a failing educational audit check into a pass.

---

## 2. Test Suite Snapshot & Cryptographic Baseline

| Test File Path | Git/File SHA-256 Checksum | Line Count | Primary Audit / Verification Purpose | Suites / Check Count |
| :--- | :--- | :---: | :--- | :---: |
| `scripts/test-content-architecture.mjs` | `fb7b311fa72c84d16fe52c54cdbf581e4f9285bacaafdf0ebd470aca32bfa039` | 393 | Architectural invariants, schema isolation, content purity (0 `user_id`), and DAG prerequisite integrity | 16 Suites (A–P)<br>82 Assertions |
| `scripts/test-content-educational-audit.mjs` | `de42671fb6468e1c628339d3062a09ad26da311b4f90fb672f1fcb3713358611` | 341 | Pedagogical quality, twin retest pairing, Bloom taxonomy, 14-element lesson structure, and 100% closed-loop coverage | 11 Suites (1–11)<br>100 Assertions |
| `scripts/test-content-model.mjs` | `4efd016ef91a93929258d1dd7288f545381bca79adecb1ac45d978a2a56a2db1` | 422 | Topic and skill hierarchy, lesson metadata, worked example properties, and repair guide linkage | 20 Suites (1–20)<br>63 Assertions |
| `scripts/test-content-production.mjs` | `48ea6fd8668d9bf08adc3008de01259967b25e6eb5738fe72c9c8b24d13a14d1` | 558 | Production readiness validation across all 31 skills: lessons, worked examples, practice (>=62), retests, repair guides, mini-exams, past BAC citations, and Suite X 100% mastery-readiness gate | 24 Suites (A–X)<br>146 Assertions |
| `scripts/test-diagnostic.mjs` | `a6788f5ecff884f60c718c083eb50902167801fc1003b82c2e37f2e09c6a17cf` | 660 | Formative diagnostic pack integrity, speed classification, calibration, bottleneck identification, and non-overclaiming guarantees | 18 Suites (1–18)<br>78 Assertions |
| `scripts/test-missions.mjs` | `2f5c577ee425723126230bcb2660dd91d4f8699a77cd267345bb624e1a93992a` | 426 | Closed-loop mission progression: practice -> error identification -> student attribution -> repair completion -> retest twin pass -> mastery evidence creation | 17 Suites (1–17)<br>44 Assertions |
| `scripts/test-supabase-security.mjs` | `1397642cd4f6a79ede2e17fe9a4ac15c7a79e5e0c34ce29e80cef20453ebe1f7` | 284 | Remote Supabase project security contract (`erbvmpnxufgeinqnshzu`), dual-user RLS tenant isolation, and strict absence of remote content tables | 12 Suites (A–L)<br>12 Live Checks |

**Total Baseline Test Inventory**: 7 primary suites | 118 test suites | 525+ automated assertions/checks.

---

## 3. Academic Limitation Disclosure

Automated unit and integration test suites validate programmatic structure, relational links, schema constraints, and algorithmic determinism.
**Automated test execution does NOT constitute mathematical or empirical proof of pedagogical truth.**
The Prompt 13.1 adversarial audit performs independent manual recalculation, formula verification, biological mechanism validation, and exam reference verification beyond the scope of automated runners.
