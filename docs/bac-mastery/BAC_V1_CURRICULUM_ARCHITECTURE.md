# BAC Mastery V1 — Curriculum Architecture Specification
**Authoritative Architectural Blueprint for Algerian Secondary Education (3AS / Baccalauréat)**
**Document Version**: 1.0.0 (V1 Completion Baseline)  
**Verification Classification**: OFFICIAL_HISTORICAL (Decree 07-142 Baseline)  
**Academic Year**: 2026–2027  

---

## 1. Executive Summary & Core Intent

BAC Mastery V1 represents the architectural transition from a single-stream Sciences Expérimentales pilot into a comprehensive, multi-stream learning operating system natively supporting all 6 Algerian Baccalauréat streams.

The central design philosophy rests upon four non-negotiable pillars:

1. **Statutory Integrity**: Grounded strictly in Executive Decree 07-142 (*Décret Exécutif n° 07-142 du 19 mai 2007 fixant les règles relatives au Baccalauréat*), with transparent, defensible provenance classification.
2. **Technological Decoupling**: Complete separation between the UI presentation language, subject methodology family, and educational content language.
3. **Evidence-Based Mastery**: Passive consumption, summary skimming, and rote memorization are structurally prohibited from satisfying mastery criteria; progression requires diagnostic verification, guided practice, and isomorphic twin retest passing.
4. **Vertical Slice Expansion**: Content authoring prioritizes fully closed learning loops (Lesson → Example → Active Recall → Guided Practice → Independent Practice → Error Repair → Retest Twin → Exam Synthesis) over disconnected, shallow horizontal topic lists.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       BAC MASTERY V1 LEARNING OS                        │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
       ┌─────────────────────────────┼─────────────────────────────┐
       ▼                             ▼                             ▼
┌──────────────┐             ┌──────────────┐              ┌──────────────┐
│  6 STREAMS   │             │ 17 SUBJECTS  │              │ 9 METHODOLOGY│
│  REGISTRY    │             │  REGISTRY    │              │   FAMILIES   │
└──────┬───────┘             └──────┬───────┘              └──────┬───────┘
       │                            │                             │
       │    ┌───────────────────────┴────────────────────────┐    │
       └───►│          MASTER CONTENT COVERAGE MATRIX        │◄───┘
            │  (31 Published Skills + 15 Foundational Slice) │
            └───────────────────────┬────────────────────────┘
                                    │
                                    ▼
            ┌────────────────────────────────────────────────┐
            │        DETERMINISTIC PRIORITY ENGINE           │
            │ (Vertical Slice Integrity > Horizontal Volume) │
            └────────────────────────────────────────────────┘
```

---

## 2. Statutory Authority & Decree 07-142 Classification

### 2.1 The Legal Foundation
The structure of the Algerian General and Technical Baccalauréat examinations is governed by **Executive Decree n° 07-142 of May 19, 2007** (*Journal Officiel de la République Algérienne Démocratique et Populaire*, n° 33, 20 mai 2007), supplemented by subsequent ministerial ministerial circulars (*arrêtés et circulaires ministérielles*).

### 2.2 Truthful Legal Classification
To eliminate false authoritative claims, BAC Mastery V1 enforces strict verification tiers:
- **`OFFICIAL_HISTORICAL`**: Structural stream definitions, core subject requirements, and baseline coefficient scales codified in Executive Decree 07-142.
- **`PROVISIONAL`**: Benching coefficient weighting or syllabus sequencing applied in the absence of active, publicly signed ministerial circulars for the current 2026–2027 cycle.
- **`UNVERIFIED`**: Prohibited across all production endpoints. Any curriculum mapping lacking a statutory citation or ministerial syllabus reference is rejected at compile time.

---

## 3. The 6 Canonical Algerian BAC Streams

| Stream Code | Stream Key | Arabic Designation | French Designation | Core Distinguishing Subjects | Statutory Basis |
|:---|:---|:---|:---|:---|:---|
| **SE** | `sciences_exp` | علوم تجريبية | Sciences Expérimentales | Natural Sciences (6), Physics (5), Math (5) | Décret 07-142 |
| **M** | `math` | رياضيات | Mathématiques | Math (7), Physics (6) | Décret 07-142 |
| **TM** | `technique_math` | تقني رياضي | Technique Mathématiques | Engineering Specialty (7), Math (6), Physics (6) | Décret 07-142 |
| **GE** | `gestion_eco` | تسيير واقتصاد | Gestion et Économie | Accounting & Finance (6), Economics (5), Math (5) | Décret 07-142 |
| **LP** | `lettres_philo` | آداب وفلسفة | Lettres et Philosophie | Philosophy (6), Arabic Language & Lit (6) | Décret 07-142 |
| **LE** | `langues_etrangeres` | لغات أجنبية | Langues Étrangères | Arabic (5), French (5), English (5), 3rd Language (4) | Décret 07-142 |

### 3.1 Technique Math Specialty Isolation Guarantee
Technique Math comprises 4 mutually exclusive engineering branches:
1. **Génie Civil (`civil_eng`)**
2. **Génie Mécanique (`mechanical_eng`)**
3. **Génie Électrique (`electrical_eng`)**
4. **Génie des Procédés (`process_eng`)**

**Architectural Law**: An unknown specialty MUST remain unknown. Calling `resolveStreamSubjects("technique_math", undefined)` strictly returns the 8 common subjects (Math, Physics, Arabic, Philosophy, French, English, Islamic Studies, History-Geography). It **never** defaults to Mechanical Engineering or leaks specialty engineering curriculum assets into unspecialized student roadmaps.

---

## 4. Subject Taxonomy & Decoupled Language Architecture

The platform recognizes 17 canonical Baccalauréat subjects across secondary education.

### 4.1 Separation of Concerns
1. **UI Presentation Language (`uiLocale`)**: Student choice (`ar` or `fr`), controlling button labels, navigation headers, and app typography.
2. **Educational Content Language (`contentLanguage`)**: Determined strictly by pedagogical subject identity:
   - Arabic (`ar`): Mathematics, Physics, Natural Sciences, Philosophy, Arabic, History-Geography, Islamic Studies, Economics, Accounting, Law, Engineering branches.
   - French (`fr`): French Language & Literature.
   - English (`en`): English Language & Literature.
   - Spanish / German / Italian (`es` / `de` / `it`): 3rd Foreign Language options.
3. **Text Directionality (`textDirection`)**:
   - `rtl` for Arabic-taught subjects.
   - `ltr` for European language subjects.

---

## 5. Subject Methodology Families (9 Epistemic Models)

Every subject connects to an epistemic learning model that dictates how concepts are modeled, drilled, and evaluated:

1. **`mathematics`**: Axiomatic definition → Theorem / Conditions → Worked Proof → Rigorous Algebraic Manipulation → Graphical Interpretation → BAC Synthesis Problem.
2. **`physics_chemistry`**: Physical Phenomenon / Reaction → Theoretical Model → Differential Equation / Law → Calculation with SI Units → Error Margin Analysis.
3. **`natural_sciences`**: Experimental Observation / Micrograph → Scientific Exploitation (Présentation, Analyse, Interprétation) → Rigorous Deductive Synthesis.
4. **`philosophy`**: Problematic Construction → Paradox / Conceptual Tension → Thesis vs Antithesis vs Synthesis (Jadaliya) or Comparison (Muqarana) → Textual Commentary.
5. **`languages`**: Textual Immersion → Structural Grammatical / Rhetorical Mechanics → Objective Summary / Compte-Rendu → Guided Composition.
6. **`islamic_studies`**: Textual Revelation (Quran / Hadith) → Lexical & Conceptual Meaning → Legal Rulings (Ahkam) & Educational Guidelines (Fawaid) → Life Application.
7. **`history_geography`**: Event / Phenomenon Chronology → Causal Structural Factors → Historical Consequences / Cartographic Analysis → Terminology & Figure Identification.
8. **`technique_math`**: Technological Problem → Mechanical/Structural/Electrical Schema → Statics/Kinematics/Logic Modeling → Engineering Sizing & Verification.
9. **`economics_management`**: Economic Phenomenon / Balance Sheet → Accounting Invariant → Algebraic Indicator (FRNG, BFR, TN) → Micro/Macroeconomic Remediation.

---

## 6. Content Quality Dimensions & Verification Lifecycle

### 6.1 The 6 Quality Dimensions (Minimum 95% Weighted Threshold)
To achieve publication, content must be audited against:
1. **Accuracy (100% Mandatory)**: Scientific, mathematical, and grammatical correctness with zero hallucinations.
2. **Alignment (100% Mandatory)**: Precise adherence to the official Algerian national curriculum syllabus.
3. **Clarity (95% Threshold)**: Unambiguous wording, precise diagrams, and clear step-by-step reasoning.
4. **Pedagogical Soundness (100% Mandatory)**: Cognitive progression from retrieval to application; distractors diagnose real conceptual misconceptions.
5. **Rigor (95% Threshold)**: Exact algebraic, terminological, and formal standards expected by ministerial Baccalauréat grading rubrics.
6. **Authenticity (100% Mandatory)**: Natural, idiomatic Algerian educational Arabic or target language; zero mechanical machine-translation artifacts.

### 6.2 The 7 Lifecycle States
```
┌─────────┐     ┌─────────────────┐     ┌──────────────┐     ┌────────────────────────┐
│  DRAFT  │ ──► │ INTERNAL_REVIEW │ ──► │ FACT_CHECKED │ ──► │ PEDAGOGICALLY_REVIEWED │
└─────────┘     └─────────────────┘     └──────────────┘     └───────────┬────────────┘
                                                                         │
                ┌──────────┐            ┌───────────┐                    ▼
                │ ARCHIVED │ ◄───────── │ PUBLISHED │ ◄──────────── ┌──────────┐
                └──────────┘            └───────────┘               │ VERIFIED │
                                                                    └──────────┘
```

---

## 7. Content Coverage Matrix Summary (Baseline V1)

- **Total Tracked Skills**: 46
- **Published Reference Skills (Sciences Expérimentales)**: 31 (100% complete closed learning loops with lessons, worked examples, practice items, error repair guides, and isomorphic retest twins).
- **Multi-Stream Foundational Slices**: 15 mapped anchor skills across Mathematics, Technique Math (all 4 branches), Gestion-Économie, Lettres-Philosophie, and Langues Étrangères.
- **Verification Policy**: Zero unverified content served to students.
