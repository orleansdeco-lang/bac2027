# BAC MASTERY V2 — CANONICAL CONTENT REGISTRY & READ CONTRACT

**Document Version:** 2.0.0  
**Status:** RATIFIED ARCHITECTURAL CONTRACT  
**Authority:** Core Architecture Group  
**Workspace:** BAC BEM (Algerian BAC Learning Operating System)  
**Invariant:** Strictly architectural and read-only — zero database writes or content mutations.  

---

## 1. PURPOSE

This document defines the formal architectural specification for the **BAC Mastery V2 Canonical Content Registry and Read Contracts**.

The primary objective of the Content Registry is to provide a single, deterministic, read-only gateway through which all V2 consumers (practice runners, diagnostic engines, review schedulers, and governance auditors) read educational content without allowing consumers to decide what is canonical or mutate content definitions.

```text
                  CANONICAL CONTENT (Git-tracked TS declarations)
                                        │
                                        ▼
                            CONTENT REGISTRY
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
             GOVERNANCE READ                         PUBLISHED READ
          (Full Envelopes with                     (Unwrapped Runtime
           Lifecycle Metadata)                     Eligible Entities)
                    │                                       │
                    ▼                                       ▼
          Audits & Governance                      Runtime Learning Loops
```

---

## 2. RELATIONSHIP TO TASK 1.4

In TASK 1.4, the platform established the fundamental ontological boundary:

$$\text{SOURCE OF TRUTH} \neq \text{STORAGE LOCATION} \neq \text{RUNTIME CACHE} \neq \text{UI STATE} \neq \text{DATABASE TELEMETRY} \neq \text{LEGACY REPRESENTATION}$$

TASK 1.5 translates this boundary into executable code:
1. **The Registry is NOT a database:** It executes purely in-memory from version-controlled Git declarations.
2. **The Registry is NOT a CMS or Authoring UI:** Content is authored in code, audited via tests, and versioned via Git commits.
3. **The Registry is NOT a second content store:** It indexes and projects existing canonical declarations without duplicating them.
4. **The Registry isolates Legacy Catalogs:** Legacy compatibility data is quarantined under an explicit compatibility contract and is never used as an automatic fallback.

---

## 3. REGISTRY RESPONSIBILITY

The V2 Content Registry has **ONE primary responsibility**:
> **Provide deterministic, side-effect free read access to canonical and published educational content through stable, language-independent V2 contracts.**

The Registry answers:
> *"What is this content and what are its verified properties?"*

The Registry NEVER answers:
> *"What should this student do next?"* (This belongs strictly to the Priority, Roadmap, and Decision engines).

---

## 4. CANONICAL READ CONTRACT (GOVERNANCE)

The **Canonical Content Read Contract** (`CanonicalContentReadContract`) provides complete visibility into all registered entities for governance, syllabus audits, and quality control.

### Properties:
- Operates on `ContentPublicationEnvelope<T>`.
- Preserves full lifecycle metadata:
  - `sourceKind`: `"canonical_git_declaration"` vs `"legacy_typescript_catalog"`
  - `lifecycleStatus`: `"draft" | "in_review" | "validated" | "published" | "deprecated"`
  - `version`: Monotonic revision number
  - `isRuntimeEligible`: Boolean gate
  - `governanceNotes`: Free-text audit justification
- Allows inspection of all states, including draft and deprecated content, ensuring complete auditability.

```ts
export interface CanonicalContentReadContract {
  getStream(id: StreamId): ContentPublicationEnvelope<CanonicalStream> | undefined;
  getSubject(id: SubjectId): ContentPublicationEnvelope<CanonicalSubject> | undefined;
  getTopic(id: TopicId): ContentPublicationEnvelope<Topic> | undefined;
  getSkill(id: SkillId): ContentPublicationEnvelope<CanonicalSkill> | undefined;
  getQuestion(id: QuestionId): ContentPublicationEnvelope<CanonicalQuestion> | undefined;
  getRubric(id: RubricId): ContentPublicationEnvelope<MinisterialRubric> | undefined;
  getResource(id: ResourceId): ContentPublicationEnvelope<PedagogicalResource> | undefined;
  getMisconception(id: MisconceptionId): ContentPublicationEnvelope<Misconception> | undefined;
  getConcept(id: ConceptId): ContentPublicationEnvelope<Concept> | undefined;
  getObjective(id: LearningObjectiveId): ContentPublicationEnvelope<CanonicalLearningObjective> | undefined;

  listStreams(): ContentPublicationEnvelope<CanonicalStream>[];
  listSubjects(streamId?: StreamId): ContentPublicationEnvelope<CanonicalSubject>[];
  listTopics(filter?: TopicReadFilter): ContentPublicationEnvelope<Topic>[];
  listSkills(filter?: SkillReadFilter): ContentPublicationEnvelope<CanonicalSkill>[];
  listQuestions(filter?: QuestionReadFilter): ContentPublicationEnvelope<CanonicalQuestion>[];
  listResources(filter?: ResourceReadFilter): ContentPublicationEnvelope<PedagogicalResource>[];
}
```

---

## 5. RUNTIME PUBLISHED READ CONTRACT

The **Published Content Read Contract** (`PublishedContentReadContract`) is the exclusive contract exposed to runtime execution engines (Practice Engine, Diagnostic Engine, Retest Engine).

### Strict Runtime Invariant:
> **The runtime contract ONLY returns entities where `isRuntimeEligible(status, sourceKind)` is `true`.**

If an entity exists in the registry with `lifecycleStatus: "draft"`, `"in_review"`, or `"deprecated"`, calling `published.getSkill(id)` or `published.getQuestion(id)` returns `undefined`. Draft and deprecated content is strictly quarantined from learner assessment loops.

```ts
export interface PublishedContentReadContract {
  getStream(id: StreamId): CanonicalStream | undefined;
  getSubject(id: SubjectId): CanonicalSubject | undefined;
  getTopic(id: TopicId): Topic | undefined;
  getSkill(id: SkillId): CanonicalSkill | undefined;
  getQuestion(id: QuestionId): CanonicalQuestion | undefined;
  getRubric(id: RubricId): MinisterialRubric | undefined;
  getResource(id: ResourceId): PedagogicalResource | undefined;
  getMisconception(id: MisconceptionId): Misconception | undefined;
  getConcept(id: ConceptId): Concept | undefined;
  getObjective(id: LearningObjectiveId): CanonicalLearningObjective | undefined;

  listStreams(): CanonicalStream[];
  listSubjects(streamId?: StreamId): CanonicalSubject[];
  listTopics(filter?: TopicReadFilter): Topic[];
  listSkills(filter?: SkillReadFilter): CanonicalSkill[];
  listQuestions(filter?: QuestionReadFilter): CanonicalQuestion[];
  listResources(filter?: ResourceReadFilter): PedagogicalResource[];
}
```

---

## 6. ENTITY ACCESS

The Registry exposes only entities that actually exist in the current V2 domain:

| Domain Entity | Underlying Type | Primary Access Key | Source Location |
| :--- | :--- | :--- | :--- |
| **Stream** | `CanonicalStream` | `StreamId` | `src/lib/constants/streams.ts` |
| **Subject** | `CanonicalSubject` | `SubjectId` | `src/lib/constants/streams.ts` |
| **Topic** | `Topic` | `TopicId` | `src/data/curriculum/topics.ts` |
| **Skill** | `CanonicalSkill` | `SkillId` | `src/data/skills/canonical-sciences.ts`, `gestion-economie.ts`, `lettres-philo.ts` |
| **Question** | `CanonicalQuestion` | `QuestionId` | `src/data/curriculum/practice-questions*.ts` |
| **Rubric** | `MinisterialRubric` | `RubricId` | Embedded structured rubric criteria |
| **Resource** | `PedagogicalResource`| `ResourceId` | `src/domain/content/lessons.ts`, `repair-guides.ts` |
| **Misconception** | `Misconception` | `MisconceptionId` | Option distractor traps |
| **Concept** | `Concept` | `ConceptId` | Core lesson concepts |
| **Learning Objective** | `CanonicalLearningObjective` | `LearningObjectiveId`| Pedagogical capability packages |

---

## 7. CANONICAL ID RULES

1. **Branded Types:** All IDs are strongly typed branded strings (`SkillId`, `QuestionId`, `TopicId`, `SubjectId`, `ResourceId`).
2. **Language Independence:** Identifiers are semantic Latin ASCII tokens (e.g. `math_derivatives_chain_rule`, `snv_protein_synthesis`). Surface strings in Arabic or French do NOT form identity.
3. **Immutability:** IDs are immutable tokens. Changing an ID breaks prerequisite DAGs, error logs, and spaced repetition schedules.
4. **No Fuzzy Fallbacks:** If an ID contains a typo (e.g. `math_derivatives_chain_rules`), an Arabic label, or a French title, the Registry returns `undefined`. Zero fuzzy matching is permitted.

---

## 8. LIFECYCLE RULES

The content lifecycle follows five discrete, un-promoted states:
1. `draft`: Authored in code; under drafting. Quarantined from runtime.
2. `in_review`: Pedagogical, linguistic, and ministerial validation in progress. Quarantined from runtime.
3. `validated`: Approved by subject-matter inspectors; awaiting scheduled syllabus release.
4. `published`: Active in runtime practice, diagnostic, and exam simulation engines.
5. `deprecated`: Superseded by official syllabus revisions (e.g. executive decree updates); preserved for historical attempt telemetry. Quarantined from runtime practice.

### Zero Automatic Promotion:
The Registry does not upgrade `draft` or `unverified` content to `published`. All promotions require explicit Git-tracked configuration.

---

## 9. RELATIONSHIP RULES

Where relationships are explicitly declared, the Registry preserves them verbatim:
- **Topic $\rightarrow$ Skills:** `topic.skillIds` contains the canonical skills belonging to that chapter.
- **Skill $\rightarrow$ Prerequisites:** `skill.prerequisites` preserves the topological DAG.
- **Question $\rightarrow$ Skill:** `question.skillId` and multi-skill array `question.skillIds`.
- **Question $\rightarrow$ Retest Twin:** `question.isRetestVariant` and `question.retestForQuestionId`.
- **Question $\rightarrow$ Rubric:** `question.rubricId`.
- **Resource $\rightarrow$ Skills:** `resource.skillIds`.

### Zero Relationship Invention:
If a question lacks an explicit learning objective or concept, the field remains `undefined`. The Registry never synthesizes missing links from keywords, titles, or error codes.

---

## 10. QUESTION RULES

Questions are assessment instruments that generate evidence, but are distinct from evidence itself:
1. **Difficulty $\neq$ Cognitive Demand $\neq$ Practice Tier:**
   - `difficulty`: Integer `1 | 2 | 3` (problem complexity).
   - `cognitiveDemand`: Bloom demand (`recall`, `comprehension`, `application`, `analysis_synthesis`, `bac_evaluation`).
   - `practiceTier`: Scaffolding tier (`guided`, `semi_guided`, `mixed`, `transfer`, `bac_exam_level`).
   - These three dimensions are strictly decoupled; a high difficulty item does not automatically become `bac_exam_level`.
2. **Interaction Formats Preserved:**
   - SCF Accounting journals (`journal_entry`), progressive reasoning stages (`step_by_step`), and multi-select items are preserved without forced conversion to single-choice MCQ.
3. **Isomorphic Retest Twin Links:**
   - Retest twin variants maintain an explicit link to their parent problem via `retestForQuestionId`.

---

## 11. RESOURCE RULES

$$\text{Resource} \neq \text{Question}$$

Instructional resources (lessons, summary cards, formula sheets, repair guides) provide pedagogical explanation and scaffolding. They do NOT have options, answer keys, scoring rubrics, or attempt telemetry. Questions do not have instructional URIs.

---

## 12. RIGHTS & PROVENANCE

1. **Traceable Provenance:** Every publication envelope records `sourceKind: "canonical_git_declaration"`.
2. **Quarantine of Unknown Rights:** Content with undeclared rights remains `rightsStatus: "unknown"`. The Registry never assumes public domain or fair use without explicit declaration.

---

## 13. DUPLICATE HANDLING

The Registry enforces the **Non-Resolution Principle for Duplicates**:
> **Duplicates and catalog overlaps are detected and explicitly reported via diagnostics; they are NEVER silently resolved, merged, or deleted based on heuristics.**

The Registry provides `registry.getDiagnostics()`, returning a structured `DuplicateDiagnosticReport`:
- Detects exact ID collisions across catalogs.
- Detects superseded overlaps between canonical catalogs and legacy catalogs.
- Preserves all items until human architectural decisions or formal migration scripts resolve them.

---

## 14. LEGACY COMPATIBILITY BOUNDARY

To prevent regression while avoiding premature breaking changes, legacy content (such as `src/data/skills/index.ts`) is isolated under the **Legacy Compatibility Read Contract** (`registry.compatibility`):

```text
CANONICAL ACCESS:
  registry.published.getSkill("math_functions_asymptotes") ──► undefined  (NOT in canonical catalog)

COMPATIBILITY ACCESS:
  registry.compatibility.getLegacySkill("math_functions_asymptotes") ──► AdapterResult<CanonicalSkill>
```

Canonical readers never fall back to legacy stores. Legacy access must be explicitly and intentionally requested.

---

## 15. DETERMINISM

For identical input:
$$\text{Registry}(\text{ID}, \text{Repo Commit}) \implies \text{Identical Output}$$

- Zero random selection.
- Zero dependence on UI state, scroll position, or theme.
- Zero dependence on local storage, session cookies, or device tokens.
- Zero dependence on wall-clock time (`Date.now()`).
- Zero dependence on student profile, mastery scores, or history.

---

## 16. NON-RESPONSIBILITIES

The Content Registry explicitly **DOES NOT**:
1. Calculate student priority weights or ranking.
2. Evaluate learner mastery states (`not_yet`, `emerging`, `demonstrated`, `review_due`).
3. Determine learning readiness or unlock prerequisites.
4. Recommend next best actions.
5. Generate roadmaps, daily missions, or study schedules.
6. Calculate diagnostic scores or assign student performance tiers.
7. Schedule spaced review intervals.
8. Store student telemetry, attempts, clicks, or error logs.
9. Connect to Supabase or execute database mutations.
10. Call external AI APIs or generate synthetic content.

---

## 17. CURRENT LIMITATIONS

1. **Incomplete Structured Rubrics:** Many open-response items currently feature rich Arabic text explanations rather than atomic ministerial criteria arrays.
2. **Cryptographic Version Hashes:** Syllabi currently reference ministerial decision names rather than cryptographic Git commit hashes.
3. **Diagnostic Topic Proxy:** Some legacy diagnostic items reference `topicId` rather than fine-grained `skillId`.

---

## 18. FUTURE MIGRATION REQUIREMENTS

1. Phase out `src/data/skills/index.ts` in favor of stream-specific canonical files (`canonical-sciences.ts`, `gestion-economie.ts`, `lettres-philo.ts`).
2. Map legacy diagnostic items to primary canonical `SkillId`s.
3. Complete structured keyword criteria rubrics for all written examination items.
4. Establish cryptographic content release manifests for each official academic year.

---
*END OF CANONICAL CONTENT REGISTRY SPECIFICATION*
