# BAC MASTERY V2 — CANONICAL CONTENT RELATIONSHIP INTEGRITY

**Document Version:** 2.0.0  
**Status:** RATIFIED ARCHITECTURAL SPECIFICATION  
**Authority:** Core Architecture Group  
**Workspace:** BAC BEM (Algerian BAC Learning Operating System)  
**Invariant:** Strictly architectural and audit-based — zero content mutations, zero database writes.  

---

## 1. PURPOSE

This document defines the formal **Canonical Content Relationship Graph** for BAC Mastery V2.

Its primary purpose is to establish a verified, referentially sound mapping between all curriculum and assessment entities:
$$\text{Stream} \longrightarrow \text{Subject} \longrightarrow \text{Topic} \longrightarrow \text{Skill} \longrightarrow \text{Questions / Resources}$$

### The Core Architectural Mandate:
> **Prefer TRUTHFUL INCOMPLETENESS over FABRICATED COMPLETENESS.**  
> A missing relationship is recorded as `missing` or `unavailable`. It is NEVER silently invented, inferred from keywords, or guessed. The purpose of this task is to make the relationship graph **trustworthy**, not artificially complete.

---

## 2. RELATIONSHIP MODEL

The target relationship graph defines how pedagogical constructs connect across the learning system:

```text
CURRICULUM
   │
   ├── STREAM (6 streams)
   │     │ (51 explicit edges)
   │     └── SUBJECT (17 subjects)
   │            │ (14 explicit chapters)
   │            └── TOPIC (14 Sciences Exp chapters)
   │                   │ (31 explicit links)
   │                   └── SKILL (87 canonical skills)
   │                          │
   │              ┌───────────┼────────────┐
   │              ▼           ▼            ▼
   │         OBJECTIVE     CONCEPT    PREREQUISITE (29 edges, 0 cycles)
   │        (Unavailable) (Derived)        │
   │                                       ▼
   │                                  TARGET SKILL
   │
   └── QUESTIONS (105 practice items, 30 diagnostic probes)
          │
          ├── SKILL (105/105 explicit practice items; 0/30 diagnostic items)
          ├── RETEST TWIN (36 isomorphic twin pairs)
          ├── OBJECTIVE (Unavailable in legacy items)
          ├── CONCEPT (Unavailable in legacy items)
          ├── MISCONCEPTION (30/30 diagnostic option traps; text rationales on practice)
          └── RUBRIC (Unavailable on standard MCQs; defined on evaluative items)
          
RESOURCES (62 items: 31 lessons, 31 repair guides)
   │
   ├── SKILL (62/62 explicit links)
   ├── TOPIC (62/62 deterministically derived via skill.topicId)
   └── OBJECTIVE (Unavailable in legacy items)
```

---

## 3. RELATIONSHIP STATUS DEFINITIONS

Every relationship edge in the graph is strictly classified into one of five operational statuses:

1. **`EXPLICIT`**: Authored and verified directly on the entity contract (e.g. `question.skillId`, `skill.prerequisites`, `stream.subjects`).
2. **`DERIVED`**: Traversed deterministically through an intermediate entity without claiming direct explicit authoring (e.g. `Resource -> Skill -> Topic`).
3. **`MISSING`**: Expected by domain architecture but null, undefined, or empty in the current content store.
4. **`CONFLICTING`**: Contradictory links or contradictory statements across catalogs.
5. **`UNAVAILABLE`**: Pedagogical construct not yet formally authored or tokenized in legacy data.

---

## 4. CURRICULUM HIERARCHY

The macro-structural hierarchy links national examination streams to specific subjects and syllabus topics:

| Hierarchy Level | Entity | Total Count | Outgoing Edge | Target Entity | Edge Count | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Level 0** | `CanonicalStream` | 6 | `contains` | `CanonicalSubject` | 51 | **EXPLICIT (SAFE)** |
| **Level 1** | `CanonicalSubject`| 17 | `contains` | `Topic` | 14 | **EXPLICIT (SAFE)** |
| **Level 2** | `Topic` | 14 | `contains` | `CanonicalSkill` | 31 | **EXPLICIT (SAFE)** |

### Referential Integrity Audit:
- **Stream $\rightarrow$ Subject:** 51 explicit edges across 6 streams. All 17 subjects map to valid syllabus coefficients.
- **Subject $\rightarrow$ Topic:** All 14 topics map to valid, recognized subjects (`math`, `physics`, `natural_sciences`). Zero orphan topics exist.
- **Topic $\rightarrow$ Skill:** The 14 topics aggregate all 31 canonical Sciences Expérimentales skills without discrepancy.

---

## 5. SKILL GRAPH

The system defines 87 authoritative skills across three core baccalaureate streams:
- **Sciences Expérimentales:** 31 Skills (`src/data/skills/canonical-sciences.ts`)
- **Gestion & Économie:** 33 Skills (`src/data/skills/gestion-economie.ts`)
- **Lettres & Philosophie:** 23 Skills (`src/data/skills/lettres-philo.ts`)

### Ontological Boundaries Enforced:
1. **`Topic ≠ Skill`:** A topic is an organizational curriculum unit; a skill is an actionable, assessable student capability. Topics have zero repair strategies; skills have mandatory repair strategies and step-by-step remediation protocols.
2. **`Skill ≠ Concept`:** A skill describes student performance under criteria; a concept is declarative domain knowledge.
3. **`Skill ≠ Misconception`:** A skill represents valid mastery; a misconception is a specific cognitive trap or flawed mental model.

---

## 6. QUESTION GRAPH

### Practice & Retest Items (`ALL_PRACTICE_QUESTIONS`):
- **Total Questions:** 105
- **Explicit Skill Mappings:** 105 / 105 (100% coverage).
- **Multi-Skill Mappings:** 0 (all items currently target a single primary skill).
- **Retest Twin Variants:** 36 items declare `isRetestVariant: true` and link explicitly to their parent problem via `retestForQuestionId`.
- **Learning Objectives:** 0 / 105 (`UNAVAILABLE`).
- **Concepts:** 0 / 105 (`UNAVAILABLE`).
- **Ministerial Rubrics:** 0 / 105 on standard MCQs (`UNAVAILABLE`; rubrics belong to structured evaluation contracts).

---

## 7. RESOURCE GRAPH

### Pedagogical Resources (`PROMPT12_LESSONS`, `PROMPT12_REPAIR_GUIDES`):
- **Total Resources:** 62 (31 active lesson cards, 31 error remediation guides).
- **Explicit Skill Mappings:** 62 / 62 (100% link to an authoritative skill ID via `resource.skillIds`).
- **Explicit Topic Mappings:** 0 / 62 (`PedagogicalResource` does not have a direct `topicId` property).
- **Derived Topic Mappings:** 62 / 62 (traversed deterministically via `skill.topicId`).

---

## 8. OBJECTIVE GRAPH

Atomic learning objectives (Bloom taxonomy levels: `remember`, `understand`, `apply`, `analyze`, `evaluate`, `create`) are defined conceptually in capability package specifications, but **are not currently tokenized on runtime practice items or skills**.
- Status: **`UNAVAILABLE`**.
- Invariant: Zero synthetic objective IDs are fabricated in Task 1.6.

---

## 9. CONCEPT GRAPH

Scientific concepts exist embedded within lesson prose (e.g. `coreConcept_ar`), but are not yet exposed as independent relational graph nodes with distinct `ConceptId` foreign keys.
- Status: **`UNAVAILABLE / DERIVED`**.
- Invariant: Concepts are not inferred from error codes or skill titles.

---

## 10. MISCONCEPTION GRAPH

1. **Diagnostic Questions:** 30 / 30 diagnostic probes in `src/data/diagnostic/bac/` contain explicit distractor traps with `misconceptionDetails` (`trapId`, `description_ar`, `description_fr`).
2. **Practice Questions:** Standard practice questions feature Arabic prose explanations (`distractorRationale_ar`), but lack discrete branded `MisconceptionId` tokens.
3. **`Error ≠ Misconception`:** A generic error category (e.g. `calculation_error`, `time_management`) is an behavioral classification; an authentic misconception (e.g. `trap-chain-rule-omission`) is a specific pedagogical trap.

---

## 11. PREREQUISITE GRAPH

The canonical skill prerequisite DAG was audited using a 3-color Depth First Search (DFS) algorithm:
- **Total Prerequisite Edges:** 29 explicit edges.
- **Self-Referencing Prerequisites:** 0.
- **Missing Prerequisite Targets:** 0 (all 29 targets resolve to existing canonical skills).
- **Duplicate Edges:** 0.
- **Cycles Detected:** **0 (Strictly Acyclic DAG)**.
- **Quality Classification:** **`SAFE`**.

---

## 12. RELATIONSHIP COVERAGE

| Relationship | Subject Domain | Total Items | Valid Mappings | Coverage Ratio | Quality |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Stream $\rightarrow$ Subject** | National Syllabus | 6 Streams | 51 Edges | 100% | `SAFE` |
| **Subject $\rightarrow$ Topic** | Sciences Exp | 14 Topics | 14 Valid Subjects | 100% | `SAFE` |
| **Topic $\rightarrow$ Skill** | Sciences Exp | 14 Topics | 31 Skills | 100% | `SAFE` |
| **Skill $\rightarrow$ Prerequisite**| Sciences Exp | 31 Skills | 29 Valid Edges | 100% | `SAFE` |
| **Question $\rightarrow$ Skill** | Practice Item Bank | 105 Items | 105 Skills | 100% | `SAFE` |
| **Question $\rightarrow$ Twin** | Retest Bank | 36 Retest Items | 36 Parent IDs | 100% | `SAFE` |
| **Resource $\rightarrow$ Skill** | Lessons & Guides | 62 Resources | 62 Skills | 100% | `SAFE` |
| **Resource $\rightarrow$ Topic** | Lessons & Guides | 62 Resources | 62 Derived Topics| 100% (Derived)| `SAFE` |
| **Question $\rightarrow$ Skill** | Diagnostic Bank | 30 Diagnostic Items| 0 Skills | 0% | `INCOMPLETE` |
| **Question $\rightarrow$ Topic** | Diagnostic Bank | 30 Diagnostic Items| 30 Topics | 100% | `SAFE` |

---

## 13. MISSING RELATIONSHIPS

The following relationships are genuinely absent in the current content repository:
1. **Diagnostic Questions $\rightarrow$ Skill:** All 30 diagnostic questions currently link to `topicId` rather than fine-grained `skillId`.
2. **Questions $\rightarrow$ Objective:** 105 / 105 practice items lack Bloom objective linkage.
3. **Questions $\rightarrow$ Concept:** 105 / 105 practice items lack atomic concept linkage.
4. **Resources $\rightarrow$ Objective:** 62 / 62 resources lack objective linkage.

---

## 14. CONFLICTING RELATIONSHIPS

- **Canonical Skills vs Legacy Catalog:** 9 skills in `src/data/skills/canonical-sciences.ts` share IDs with coarse legacy entries in `src/data/skills/index.ts`.
- **Status:** Quarantined under `registry.compatibility`. Canonical reads bypass legacy files completely. Zero runtime conflicts occur.

---

## 15. DUPLICATE RELATIONSHIPS

- **Prerequisites:** 0 duplicate prerequisite edges detected.
- **Curriculum Links:** 0 duplicate stream-subject edges detected.

---

## 16. DIAGNOSTIC MAPPING GAP

A major architectural gap identified in the audit:
> **All 30 diagnostic questions in `src/data/diagnostic/bac/` declare `topicId`, but declare ZERO `skillId`.**

### Non-Invention Enforcement:
In TASK 1.6, this gap is **strictly preserved**. No skill ID was guessed or assigned based on topic titles. Diagnostic questions remain mapped to `topicId`, with `skillId = undefined` until pedagogical experts formally author the fine-grained linkage.

---

## 17. QUESTION MAPPING GAP

While 100% of practice questions link to a primary skill, they completely lack atomic Bloom objective tokens (`objectiveId`) and concept tokens (`conceptId`). These fields are preserved as `undefined` rather than synthetically populated.

---

## 18. RESOURCE MAPPING GAP

Resources link explicitly to `skillIds`, but lack a direct `topicId` field. While a topic can be reliably derived via `skill.topicId`, direct topic ownership is preserved as `UNAVAILABLE` on the resource entity itself to maintain structural honesty.

---

## 19. FUTURE REMEDIATION REQUIREMENTS

1. **Diagnostic Skill Authorship:** Map all 30 diagnostic probes to primary canonical `SkillId`s.
2. **Topic Expansion:** Author and register formal `Topic` entities for Gestion & Économie and Lettres & Philosophie.
3. **Objective & Concept Tokenization:** Extract and assign discrete `LearningObjectiveId` and `ConceptId` tokens to practice items.
4. **Structured Rubric Authoring:** Author official ministerial criteria arrays for open-ended questions.

---

## 20. EXPLICIT NON-CHANGES

- Zero production questions or skills modified.
- Zero missing mappings synthetically invented.
- Zero Supabase database tables created or modified.
- Zero UI components modified.
- Zero decision, roadmap, or mastery logic introduced.

---
*END OF CANONICAL CONTENT RELATIONSHIP INTEGRITY SPECIFICATION*
