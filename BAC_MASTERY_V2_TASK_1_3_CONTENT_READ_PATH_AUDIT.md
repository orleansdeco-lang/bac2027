# BAC MASTERY V2 — TASK 1.3 CONTENT & QUESTION READ PATH AUDIT

**Authoritative Status:** `AUDIT_COMPLETE`  
**Date:** 2026-09-17  
**Architecture Authority:** `BAC_MASTERY_V2_ARCHITECTURE_FREEZE_V1_1.md`  
**Preceding Verified Status:** `TASK_1_2_LEARNER_READ_PATH_COMPLETE`  
**Task Objective:** Comprehensive empirical audit of all legacy curriculum, subject, topic, skill, objective, concept, misconception, question, resource, and rubric representations before implementing the read-only integration layer.

---

## 1. EXISTING CURRICULUM REPRESENTATIONS

In the legacy codebase, curriculum structures are distributed across static constants, TypeScript schemas, and domain audited registries:

1. **`src/domain/content/types.ts` (`Curriculum` interface):**
   - Fields: `id`, `streamId`, `educationLevel`, `examType`, `academicYear`, `title_ar`, `title_fr`, `description_ar`, `description_fr`, `subjectIds`, `sourceId`, `sourceType`, `rightsStatus`, `verificationStatus`, `version`, `isActive`.
   - Semantics: High-level curriculum specification defining the academic year and the bundle of official subjects for an education level and stream.
2. **`src/lib/constants/streams.ts` & `src/types/education.ts`:**
   - 6 Official BAC streams:
     - `sciences_exp` (Sciences Expérimentales)
     - `math` (Mathématiques)
     - `technique_math` (Technique Mathématiques — with 4 specialties: `civil_eng`, `mechanical_eng`, `electrical_eng`, `process_eng`)
     - `gestion_eco` (Gestion & Économie)
     - `lettres_philo` (Lettres & Philosophie)
     - `langues_etrangeres` (Langues Étrangères)
   - Education level: legacy `"secondary"` or `"3as"` / `"2as"` / `"1as"`.
3. **Curriculum Versioning:**
   - Legacy systems generally store an unparsed string like `academicYear: "2024-2025"` or `version: 1`. There is no canonical cryptographic hash or formal `CurriculumVersionId` in the legacy data.

---

## 2. EXISTING SUBJECT REPRESENTATIONS

1. **`src/types/education.ts` (`SubjectId`):**
   - 15 Defined subject identifiers: `natural_sciences`, `physics`, `math`, `arabic`, `philosophy`, `french`, `english`, `islamic_studies`, `history_geography`, `accounting_finance`, `economics_management`, `law`, `civil_eng`, `mechanical_eng`, `electrical_eng`, `process_eng`.
2. **`src/lib/constants/streams.ts` (`ALL_SUBJECTS`):**
   - Fields: `id: SubjectId`, `code`, `name_ar`, `name_fr`, `isScientific: boolean`.
3. **Stream Subject Rules:**
   - In `STREAM_RULES`, each stream defines subject rules with ministerial coefficients:
     - Sciences Exp: Math (coef 5), Physics (coef 5), Natural Sciences (coef 6), Arabic (coef 3), Philo (coef 2), etc.
     - Gestion & Économie: Accounting & Finance (coef 6), Economics & Management (coef 5), Law (coef 2), Math (coef 5), etc.
     - Lettres & Philosophie: Philosophy (coef 6), Arabic (coef 6), History-Geography (coef 4), etc.
4. **Distinction:**
   - `Subject` is strictly a broad disciplinary boundary (e.g. `math`), distinct from `Topic` (e.g. `math_topic_functions`) and `Skill` (e.g. `math_derivatives_chain_rule`).

---

## 3. EXISTING TOPIC REPRESENTATIONS

1. **`src/types/content.ts` (`CurriculumTopic` interface):**
   - Fields: `id`, `educationLevel`, `examType`, `streamId`, `subjectId`, `title_ar`, `title_fr`, `description_ar`, `description_fr`, `order`, `isActive`.
2. **`src/data/curriculum/topics.ts` (`CURRICULUM_TOPICS`):**
   - Contains 14 core curricular topics covering Sciences Expérimentales (Mathematics, Physics-Chemistry, and SNV).
   - Examples:
     - `math_topic_functions` (دراسة الدوال العددية)
     - `math_topic_exp_ln` (الدوال الأسية واللوغاريتمية)
     - `physics_topic_rc_rl` (الظواهر الكهربائية: ثنائي القطب RC و RL)
     - `snv_topic_protein_synthesis` (التخصص الوظيفي للبروتينات: تركيب البروتين)
3. **Architectural Guardrail:**
   - A `Topic` is a thematic pedagogical unit or chapter. It **cannot** be directly assessed as a single observable competence. It groups multiple discrete skills.

---

## 4. EXISTING SKILL REPRESENTATIONS

Across the repository, skills are authored in three major catalogs:
1. **Canonical Sciences Expérimentales Skills:**
   - `src/data/skills/canonical-sciences.ts` (31 active skills).
   - Covers Mathematics (10 skills), Physics-Chemistry (10 skills), Natural Sciences (11 skills).
2. **Gestion & Économie Skills:**
   - `src/data/skills/gestion-economie.ts` (33 active skills across 10 subjects).
3. **Lettres & Philosophie Skills:**
   - `src/data/skills/lettres-philo.ts` (23 active skills across 7 subjects).
4. **Authoritative Skill Schema (`CurriculumSkill` / `CanonicalSkill`):**
   - `id: string` (e.g. `snv_protein_synthesis`)
   - `topicId: string`
   - `subjectId: SubjectId`
   - `streamId: StreamId`
   - `title_ar: string`, `title_fr: string`
   - `description_ar: string`, `description_fr: string`
   - `prerequisites: string[]` (Directional prerequisite DAG links)
   - `cognitiveDimensions: DiagnosticDimension[]`
   - `difficulty: 1 | 2 | 3`
   - `order: number`
   - `isActive: boolean`
   - `repairStrategy_ar`, `repairStrategy_fr`
   - `repairSteps_ar: string[]`, `repairSteps_fr: string[]`

---

## 5. EXISTING LEARNING OBJECTIVE REPRESENTATIONS

1. **`src/domain/content/types.ts` (`LearningObjective`):**
   - Fields: `id`, `skillId`, `code` (e.g. `LO-MATH-DERIV-01`), `description_ar`, `description_fr`, `bloomLevel: BloomTaxonomyLevel`, `order`, `sourceId`, `sourceType`, `rightsStatus`, `verificationStatus`.
2. **Packages & Syllabi:**
   - In `src/domain/content/sciences-exp-math-packages.ts`, capabilities include explicit `learningObjectives` arrays with Bloom levels (`remember`, `understand`, `apply`, `analyze`, `evaluate`, `create`).
3. **Incomplete Coverage:**
   - In standard practice question files (`practice-questions.ts`), questions do **not** directly reference learning objectives, only `skillId`.
   - When absent, learning objectives must remain `UNAVAILABLE` rather than synthetically invented.

---

## 6. EXISTING CONCEPT REPRESENTATIONS

1. **Explicit Concept Structures:**
   - Defined in `src/domain/v2/curriculum/index.ts` (`Concept` interface: `id`, `subjectId`, `title_ar`, `title_fr`, `summary_ar`, `summary_fr`, `relatedSkillIds`).
   - Also present in `src/domain/content/types.ts` within Lesson definitions (`Lesson.coreConcept_ar`).
2. **Safety Rule:**
   - A `Concept` is an abstract mental model or scientific principle (e.g., "Conservation of Energy", "Le Chatelier's Principle").
   - Concepts cannot be synthesized from question prompts or error tags.

---

## 7. EXISTING MISCONCEPTION REPRESENTATIONS

1. **Diagnostic Option Misconceptions (`src/types/diagnostic.ts`):**
   - `DiagnosticOption.misconceptionDetails`:
     `{ trapId: string, description_ar: string, description_fr: string, suspectedErrorType?: string }`
   - Explicitly models distractor traps designed to trigger known student misconceptions.
2. **Lesson Common Mistake Cards (`src/domain/content/types.ts`):**
   - `CommonMistakeCard`: `{ id, mistake_ar, whyItHappens_ar, correctAction_ar, suspectedErrorType }`
3. **Philosophical Fallacies (`src/domain/content/philosophy/twinEngine.ts`):**
   - Models specific high-stakes argumentative traps (e.g. `investigation_to_dialectic`).
4. **NON-NEGOTIABLE INVARIANT:**
   - `Error ≠ Misconception`. An error code like `calculation_error` is an outcome; a misconception is an underlying flawed cognitive construct. Misconceptions are only mapped when explicit trap/card structures exist.

---

## 8. EXISTING QUESTION REPRESENTATIONS

The repository contains three primary collections of questions:

1. **Practice & Retest Questions Bank:**
   - `src/data/curriculum/practice-questions.ts` (120+ questions)
   - `src/data/curriculum/practice-questions-set2.ts` (100+ questions)
   - `src/data/practice/sciences-exp/new-skills-practice.ts` (60+ questions)
   - Total practice questions across bank: >465 items.
   - Schema: `PracticeQuestion` (`src/types/mission.ts` and `src/domain/content/types.ts`).
2. **Diagnostic Questions Bank:**
   - `src/data/diagnostic/bac/sciences-exp/` (Mathematics, Natural Sciences, Physics).
   - `src/data/diagnostic/bac/gestion-eco/` (Accounting, Economics, Law, Mathematics).
   - Schema: `DiagnosticQuestion` (`src/types/diagnostic.ts`).
3. **Interactive & Advanced Capability Questions:**
   - `src/data/practice/gestion-eco/interactive-exercises.ts` (Accounting Journals, Step-by-Step).
   - `src/domain/content/sciences-exp-*-packages.ts` (5-tier practice ladders: Foundation, Application, Mixed, Transfer, BAC-Style).

---

## 9. EXISTING QUESTION FORMATS

The audit identified the following distinct question formats currently authored in code:

| Legacy Format Identifier | File / Component Source | Input & Response Payload | Supported V2 Equivalent |
|:---|:---|:---|:---|
| `"mcq"` / `"mcq_single"` | `practice-questions.ts`, `diagnostic` | Single option selection (`selectedAnswerId`) | `"mcq_single"` / `"single_choice"` |
| `"multiple_select"` | `src/domain/content/types.ts` | Array of option IDs (`correctAnswerIds`) | `"multi_select"` |
| `"numeric"` | `src/domain/content/types.ts` | Numeric value with tolerance bounds | `"numeric"` |
| `"short_answer"` | `src/types/mission.ts`, `types.ts` | Short string / algebraic symbol | `"short_answer"` |
| `"journal_entry"` | `interactive-exercises.ts` | SCF accounting rows (Debit / Credit / Account Codes) | `"journal_entry"` |
| `"step_by_step"` | `interactive-exercises.ts` | Progressive sequential steps with partial evaluation | `"step_by_step"` |
| `"error_identification"` | `src/types/diagnostic.ts` | Identification of erroneous step in a solution | `"error_identification"` |
| `"methodology_sequence"` | `src/types/diagnostic.ts` | Reordering / ranking scientific reasoning steps | `"methodology_sequence"` |
| `"trap_avoidance"` | `src/types/diagnostic.ts` | Identification and evasion of distractor traps | `"trap_avoidance"` |
| `"structured_written"` | `sciences-exp-*-packages.ts` | Open scientific deduction with keyword criteria | `"structured_open"` / `"open_response"` |
| `"document_analysis"` | `sciences-exp-snv-packages.ts` | Multi-document exploitation (*saisie d'informations*) | `"document_analysis"` |

**Preservation Principle:** The adapter preserves the true interaction format. Non-MCQ items are **never** forced into single-choice representations.

---

## 10. EXISTING DIFFICULTY MODELS

1. **Integer Scale (1 | 2 | 3):**
   - Standard in `PracticeQuestion.difficulty` and `CurriculumSkill.difficulty`.
   - Semantics: 1 = Basic/Introductory, 2 = Standard Curriculum Benchmark, 3 = Advanced/Complex.
2. **String Labels (`"easy"` | `"medium"` | `"hard"`):**
   - Used in certain UI filters and legacy diagnostic prototypes.
3. **Critical Invariant:**
   - **Difficulty is an empirical or calibrated measure of problem complexity.**
   - It is **NOT** cognitive demand, and it is **NOT** a practice tier.

---

## 11. EXISTING COGNITIVE-DEMAND MODELS

1. **Explicit Cognitive Demand:**
   - `DiagnosticDimension` in `src/types/diagnostic.ts`: `"knowledge"`, `"understanding"`, `"application"`, `"methodology"`, `"speed"`, `"confidence"`.
   - `CognitiveDemand` in `src/domain/v2/assessment/index.ts`: `"recall"`, `"comprehension"`, `"application"`, `"analysis_synthesis"`, `"bac_evaluation"`.
   - `BloomTaxonomyLevel` in `src/domain/content/types.ts`: `"remember"`, `"understand"`, `"apply"`, `"analyze"`, `"evaluate"`, `"create"`.
2. **Absence Handling:**
   - In `PracticeQuestion`, there is a `dimension` field, but no explicit `cognitiveDemand`.
   - If absent, cognitive demand **must not be fabricated** from difficulty or text length. It must be classified as `UNAVAILABLE`.

---

## 12. EXISTING PRACTICE-TIER MODELS

1. **Explicit Practice Tiers in Capability Packages:**
   - In `src/domain/content/sciences-exp-*-packages.ts`, assessment items declare an explicit level:
     - `"L1_FOUNDATION"` -> `guided`
     - `"L2_APPLICATION"` -> `semi_guided`
     - `"L3_MIXED"` -> `mixed`
     - `"L4_TRANSFER"` -> `transfer`
     - `"L5_BAC_STYLE"` -> `exam_level`
2. **Absence Handling:**
   - Standard `PracticeQuestion` items do **not** declare a practice tier.
   - When absent, practice tier must remain `UNAVAILABLE`. A difficulty score of 3 does not justify declaring `exam_level`.

---

## 13. EXISTING RESOURCES

1. **Entity Definition (`src/domain/content/types.ts`):**
   - `Resource`: `summary_sheet`, `methodology_guide`, `formula_card`, `concept_map`.
2. **Lesson Entities (`Lesson`):**
   - 14-element active lessons with worked examples, thinking protocols, quick recall prompts, and summary cards.
3. **Repair Guides (`RepairGuide`):**
   - Targeted 5–15 minute error-repair guides mapping to specific error types.
4. **External Resources:**
   - `ExternalResourceWithReturnTicket.tsx` handles external ministerial or approved educational links with clear return tracking.

---

## 14. EXISTING RUBRICS

1. **Internal Rubrics in Capability Packages:**
   - `scoringRubric_ar: string` in `sciences-exp-math-packages.ts` and `sciences-exp-physics-packages.ts`.
   - Often structured as markdown text describing point allocations (e.g., "0.5 نقطة على كتابة القانون، 0.5 على التعويض العددي").
2. **Philosophical Essay Rubric Advice:**
   - `rubricAdvice_ar` in `src/domain/content/philosophy/twinEngine.ts`.
3. **Structured Ministerial Rubrics (`MinisterialRubric`):**
   - `src/domain/v2/assessment/index.ts` defines structured `criteria: RubricCriterion[]` with allocated points and required keywords.
4. **Safety Rule:**
   - Generic text explanations or unstructured markdown strings **must not be converted into structured ministerial rubrics**.
   - If structured rubric criteria are missing, structured rubric is marked `UNAVAILABLE`, and raw text is preserved in metadata.

---

## 15. EXISTING RETEST RELATIONSHIPS

1. **Practice vs Retest Pairs:**
   - `src/data/curriculum/practice-questions.ts` pairs each practice question (`id: "pq-..."`) with an unseen retest variant (`id: "rq-..."`).
   - Fields: `isRetestVariant: true`, `retestForQuestionId: string`.
2. **Philosophy Twin Retests:**
   - `PHILOSOPHY_TWIN_RETEST_CATALOG` maps methodology fallacies directly to isomorphic twin retests.
3. **Safety Invariant:**
   - Only preserve **explicit** retest pairings. Never fabricate a retest twin simply because two questions share a skill.

---

## 16. SOURCE & RIGHTS REPRESENTATIONS

1. **Source Classifications (`ContentSourceType`):**
   - `ministry`, `official_curriculum`, `official_exam`, `school_reference`, `original_bac_mastery`, `past_bac_exam`, `other`.
2. **Rights Classifications (`ContentRightsStatus`):**
   - `original`, `official_reference`, `licensed`, `permission_granted`, `external_reference_only`, `restricted`, `unknown`.
3. **Safety Guardrail:**
   - If a content item does not explicitly declare rights status, it must be marked `"unknown"`. Never assume public domain or unrestricted rights.

---

## 17. LIFECYCLE REPRESENTATIONS

1. **Verification Status (`VerificationStatus`):**
   - `unverified`, `pending_review`, `verified`, `outdated`, `rejected`.
2. **Safety Rule:**
   - Existing lifecycle status is preserved verbatim. The read adapter performs **no automatic promotions** (e.g. `unverified` is never promoted to `verified`).

---

## 18. FORMAL CONTENT MAPPING MATRIX

| Legacy Entity | Legacy Field | V2 Canonical Entity | V2 Field | Classification | Exact / Derived / Lossy | Notes |
|:---|:---|:---|:---|:---|:---|:---|
| `CurriculumTopic` | `id` | `Topic` | `id` | Preserved | Exact | Cast to `TopicId` |
| `CurriculumTopic` | `subjectId` | `Topic` | `subjectId` | Preserved | Exact | Verified subject ID |
| `CurriculumTopic` | `title_ar` / `title_fr` | `Topic` | `title_ar` / `title_fr` | Preserved | Exact | Verbatim Arabic and French titles |
| `CurriculumTopic` | *(none)* | `Topic` | `unitId` | Unavailable | Derived | Legacy topics lack domain unit hierarchy; marked unavailable |
| `CurriculumTopic` | *(none)* | `Topic` | `skillIds` | Derived | Derived | Aggregated from skills targeting this `topicId` |
| `CurriculumSkill` | `id` | `CanonicalSkill` | `id` | Preserved | Exact | Canonical skill ID |
| `CurriculumSkill` | `topicId` | `CanonicalSkill` | `topicId` | Preserved | Exact | Maintained topic link |
| `CurriculumSkill` | `prerequisites` | `CanonicalSkill` | `prerequisites` | Preserved | Exact | Directional DAG prerequisite IDs |
| `CurriculumSkill` | `difficulty` | `CanonicalSkill` | `difficulty` | Preserved | Exact | Integer scale (1 | 2 | 3) |
| `CurriculumSkill` | `repairStrategy_ar` | `CanonicalSkill` | `repairStrategy_ar` | Preserved | Exact | Actionable repair guidance |
| `CurriculumSkill` | `repairSteps_ar` | `CanonicalSkill` | `repairSteps_ar` | Preserved | Exact | Pedagogical steps |
| `PracticeQuestion` | `id` | `CanonicalQuestion` | `id` | Preserved | Exact | Cast to `QuestionId` |
| `PracticeQuestion` | `skillId` | `CanonicalQuestion` | `skillId` | Preserved | Exact | Target skill ID |
| `PracticeQuestion` | `type` / `exerciseType` | `CanonicalQuestion` | `format` | Preserved | Exact / Lossy | Preserves `journal_entry`, `step_by_step`, `mcq`. |
| `PracticeQuestion` | `difficulty` | `CanonicalQuestion` | `difficulty` | Preserved | Exact | Preserved without inflating to cognitive demand |
| `PracticeQuestion` | *(none)* | `CanonicalQuestion` | `cognitiveDemand` | Unavailable | Fallback | Marked unavailable in metadata; safe default assigned |
| `PracticeQuestion` | *(none)* | `CanonicalQuestion` | `diagnosticLayer` | Unavailable | Unavailable | L0–L5 strictly undefined for non-diagnostic questions |
| `PracticeQuestion` | `retestForQuestionId`| `CanonicalQuestion` | `retestForQuestionId`| Preserved | Exact | Preserves twin linkage when explicitly authored |
| `DiagnosticQuestion`| `topicId` | `CanonicalQuestion` | `skillId` | Unavailable | Lossy Proxy | Legacy diagnostic has only `topicId`; marked in metadata |
| `Resource` | `rightsStatus` | `PedagogicalResource`| *(metadata)* | Preserved | Exact | Preserved; defaults to `unknown` if undeclared |
| `Resource` | `verificationStatus` | `PedagogicalResource`| `isVerified` | Derived | Exact | `status === "verified"` maps to boolean |

---

## 19. PRESERVED INFORMATION
- Authentic multilingual strings (Arabic / French stems, titles, options, explanations, repair protocols).
- Explicit prerequisite linkages (DAG structure).
- Non-MCQ question interaction models (`journal_entry`, `step_by_step`, `short_answer`, `numeric`).
- Explicit difficulty ratings.
- Retest twin relationships (`isRetestVariant`, `retestForQuestionId`).
- Official subject coefficients and stream associations.

---

## 20. DERIVED INFORMATION
- `isVerified`: Derived from `verificationStatus === "verified"`.
- `CanonicalEducationLevel`: Normalized from coarse strings (`"secondary"` -> `"secondary_3as"`).
- Topic-to-skills aggregation: Derived by scanning the active skill registry for matching `topicId`.

---

## 21. UNAVAILABLE INFORMATION
- **Cryptographic Curriculum Version IDs:** Legacy curriculum stores only unparsed academic years.
- **Cognitive Demand on Practice Questions:** Legacy practice questions do not declare formal Bloom/evaluative demand.
- **Practice Tiers on Standard Items:** Legacy practice questions do not declare guided vs independent vs transfer tiers.
- **Diagnostic Layers (L0–L5) on Content:** Legacy items lack layer classification; left strictly undefined.
- **Structured Rubric Criteria on Written Items:** Most written items store only free-form text rubrics, not structured criteria arrays.
- **Direct Skill Linkages in Diagnostic Items:** Diagnostic questions link to `topicId` rather than `skillId`.

---

## 22. LOSSY INFORMATION
- Diagnostic `topicId` proxying as `skillId`: Fully documented in `mapping.lossy`.
- Normalization of unstructured response formats into supported V2 enum variants, with raw format preserved in `originalLegacyValue`.

---

## 23. AMBIGUITIES & DUPLICATIONS
- **Dual Skill Catalogs:** `src/data/curriculum/skills.ts` is a re-export facade of `canonical-sciences.ts`, while `gestion-economie.ts` and `lettres-philo.ts` exist separately.
- **Multiple Question Schemas:** `src/types/mission.ts`, `src/types/diagnostic.ts`, and `src/domain/content/types.ts` each maintain slightly differing question models.

---

## 24. LEGACY SOURCE-OF-TRUTH RISKS
- Hardcoded question arrays in TypeScript files risk divergence from Supabase seed files if modified independently.
- Lack of centralized content IDs across branches.

---

## 25. CONTENT / UI COUPLING RISKS
- Certain question options contain inline LaTeX strings intended for specific KaTeX renderers.
- Legacy practice runners coupled evaluation logic directly to click handlers rather than pure domain evaluators.

---

## 26. WHAT REMAINS INTENTIONALLY UNTOUCHED
- No existing question text, options, or explanations have been modified.
- No database tables, columns, or rows have been migrated or updated.
- No curriculum relationships have been synthesized.
- All legacy files in `src/data/` remain 100% read-only and unmutated.

---
*END OF AUDIT REPORT*
