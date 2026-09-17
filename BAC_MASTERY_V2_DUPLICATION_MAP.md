# BAC MASTERY 2.0 — COMPLETE CODEBASE DUPLICATION AUDIT & UNIFICATION MAP
**Document Identifier:** `BAC_MASTERY_V2_DUPLICATION_MAP.md`  
**Phase:** Phase 0 — Project Audit & Freeze  
**Task:** TASK 0.2 — Feature Inventory (Special Analysis: Duplication)  
**Date:** September 17, 2026  
**Auditor:** Senior EdTech Product & System Architect (Google DeepMind Antigravity Team)  
**Status:** COMPLETE & FROZEN — AUDIT & UNIFICATION MAPPING (Zero Code Mutations)

---

## 1. EXECUTIVE SUMMARY

Technical debt in educational platforms frequently manifests as duplicated definitions of learning objectives, contradictory subject constants, and split state stores.

This audit maps every detected duplication across the BAC Mastery codebase, documents its exact consumer files, and defines the **Single Source of Truth (SSOT)** for each domain.

---

## 2. COMPREHENSIVE DUPLICATION MAP

### 2.1 Skills Catalog Duplication
| Duplication ID | Locations Found | Duplicated Concept | Current Consumers | Recommended Canonical Source | Status / Resolution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DUP-SKILL-01** | `src/data/curriculum/skills.ts` (1001 lines)<br>vs<br>`src/data/skills/canonical-sciences.ts` (1025 lines) | The 31 Canonical Skills for Sciences Exp (Math, Physics, SNV) | `coverage-matrix.ts`, `mappings.ts`, `test-*.mjs` scripts | `src/data/skills/canonical-sciences.ts` | **RESOLVED IN SPRINT 01:** `curriculum/skills.ts` converted to 10-line facade re-exporting canonical catalog. |
| **DUP-SKILL-02** | `src/data/skills/index.ts` (lines 6-1116)<br>vs<br>`src/data/skills/canonical-sciences.ts` | Legacy 9-skill partial subset vs Full 31 canonical skills | `src/lib/roadmap/engine.ts`, `src/lib/mission/generator.ts` | `src/data/skills/canonical-sciences.ts` | **RESOLVED IN SPRINT 01:** `SCIENCES_EXP_SKILLS` merged with canonical 31 skills; `getSkillById` prioritizes canonical. |
| **DUP-SKILL-03** | `src/domain/content-factory/math-batch-01.ts`<br>vs<br>`src/data/skills/canonical-sciences.ts` | Math skills metadata (derivatives, limits, TVI) duplicated in factory packages | Math content batch authoring pipelines | Canonical Skill references `math-batch-01` by skill ID rather than re-declaring properties | Migrate batch files to reference canonical IDs strictly. |

---

### 2.2 Subjects & Stream Constants Duplication
| Duplication ID | Locations Found | Duplicated Concept | Current Consumers | Recommended Canonical Source | Status / Resolution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DUP-SUBJ-01** | `src/lib/constants/streams.ts` (`ALL_SUBJECTS`)<br>vs<br>`src/domain/curriculum/subjects.ts` (`BAC_SUBJECT_DEFINITIONS`) | Subject identity, Arabic/French titles, ministerial coefficients | `engine.ts`, `coverage-matrix.ts`, `BottomNav.tsx`, UI cards | `src/lib/constants/streams.ts` | **UNIFIED TARGET:** Consolidate into `src/domain/curriculum/subjects.ts` with re-export from `constants/streams.ts`. |
| **DUP-STREAM-02** | `src/types/education.ts` (`StreamId`)<br>vs<br>`src/domain/curriculum/streams.ts` (`BAC_STREAM_CONFIGS`) | Stream codes: `sciences_exp`, `math`, `technique_math`, `gestion_eco`, `lettres_philo`, `langues_etrangeres` | Route middlewares, student profiles, diagnostic selector | `src/types/education.ts` (Type) & `src/domain/curriculum/streams.ts` (Metadata) | Keep strict typing in `types/education.ts`; align metadata imports. |

---

### 2.3 Question Banks & Practice Items Duplication
| Duplication ID | Locations Found | Duplicated Concept | Current Consumers | Recommended Canonical Source | Status / Resolution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DUP-QUEST-01** | `src/data/curriculum/practice-questions.ts` (Set 1)<br>vs<br>`src/data/curriculum/practice-questions-set2.ts` (Set 2)<br>vs<br>`src/data/practice/sciences-exp/index.ts` | Practice question items overlapping across multiple files | Aggregated in `src/data/curriculum/index.ts` (`ALL_PRACTICE_QUESTIONS`) | `src/data/practice/[stream]/[subject].ts` | **TARGET:** Organize questions into modular per-stream/per-subject directories with unique IDs. |
| **DUP-QUEST-02** | `src/domain/content/mini-exams.ts`<br>vs<br>`src/data/curriculum/practice-questions-set2.ts` | Authentic BAC questions duplicated between practice and mini-exams | Practice sessions vs Timed Exam simulator | Canonical Item Bank with usage tags (`practice`, `retest`, `exam`) | Prevent student from seeing the identical question in practice and exam simulator. |

---

### 2.4 Learner State Storage & Repository Duplication
| Duplication ID | Locations Found | Duplicated Concept | Current Consumers | Recommended Canonical Source | Status / Resolution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DUP-STATE-01** | Direct `localStorage` calls in `src/lib/mission/storage.ts` (`loadMasteryRecords`)<br>vs<br>`src/lib/repositories/mastery-repository.ts` (`getMasteryRecords`) | Reading and writing mastery evidence | Dashboard, Mission runner, Error Lab | `src/lib/repositories/mastery-repository.ts` | **TARGET:** Ban direct `localStorage` calls from components; route 100% of state queries through Repositories. |
| **DUP-STATE-02** | `bac_student_profile_data_v1`<br>vs<br>`bac_strategic_profile_v1`<br>vs<br>`student_profiles` (Supabase table) | Student target score, stream, pace, and academic history | `AuthContext`, `onboarding/profile.ts`, `academic/page.tsx` | `student_profiles` in Supabase via `StudentRepository` | Unify local cache into single key `bac_student_profile_v2`. |

---

### 2.5 Error & Repair Logic Duplication
| Duplication ID | Locations Found | Duplicated Concept | Current Consumers | Recommended Canonical Source | Status / Resolution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DUP-ERR-01** | `ErrorRecord` in `src/types/mission.ts`<br>vs<br>`ActiveErrorState` in `src/domain/contracts/learner.contract.ts`<br>vs<br>`errors` PostgreSQL table | Representation of student blunders and misconception categories | Error Lab, Priority Engine, Repair workflow | `src/domain/contracts/learner.contract.ts` (`ActiveErrorState`) | Align `src/types/mission.ts` to alias or extend `ActiveErrorState`. |
| **DUP-ERR-02** | `src/domain/content/repair-guides.ts`<br>vs<br>`src/domain/content/repair-guides/math.ts` | Remediation steps for math errors | Mission generator, Error Lab | `src/domain/content/repair-guides/[subject].ts` | Re-export facade established; keep domain split clean. |

---

### 2.6 Route Duplication
| Duplication ID | Locations Found | Duplicated Concept | Current Consumers | Recommended Canonical Source | Status / Resolution |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DUP-ROUTE-01** | `src/app/errors/page.tsx`<br>vs<br>`src/app/error-lab/page.tsx` | Identical page rendering the misconception clinic | BottomNav, Sidebar, user bookmarks | `/error-lab` | **RESOLVED IN SPRINT 01:** Deleted `src/app/errors/page.tsx`; added permanent 301 redirect in `next.config.mjs`. |

---

## 3. UNIFICATION ROADMAP FOR REMAINING DUPLICATIONS

1. **Sprint 02 (Domain Consolidation):**
   - Direct all subject metadata lookups to `src/domain/curriculum/subjects.ts`.
   - Ensure `src/lib/constants/streams.ts` acts as a clean facade or import proxy.
2. **Sprint 03 (State Unification):**
   - Eliminate direct calls to `src/lib/mission/storage.ts` from React components.
   - Channel all read/write operations through the unified Repositories.
3. **Sprint 04 (Question Bank Harmonization):**
   - Tag question items with unique canonical hashes to prevent questions from appearing simultaneously in diagnostic, practice, and exam simulations.
