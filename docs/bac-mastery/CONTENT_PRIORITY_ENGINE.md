# BAC Mastery — Deterministic Content Priority Engine
**Specification Document: Authoring Sequencing & Decision Architecture**
*Version: 1.0.0 — Priority Architecture*
*Status: Verified & Implemented*

---

## 1. Core Production Philosophy

$$\mathbf{QUALITY} > \mathbf{COVERAGE} > \mathbf{SPEED}$$

In educational software, a single complete, verified vertical slice (Lesson $\to$ Worked Example $\to$ Active Recall $\to$ Guided Practice $\to$ Error Lab $\to$ Retest Twin $\to$ Mastery) provides infinitely more learning value than 50 disconnected, unverified question stems.

---

## 2. The 10 Pedagogical Factors

The priority engine evaluates 10 objective pedagogical factors:

| # | Factor | Range | Evaluation Criteria |
| :- | :--- | :--- | :--- |
| **1** | `studentDemandPotential` | 1–5 | Real student search volume, diagnostic bottlenecks, and pilot feedback frequency. |
| **2** | `examRelevance` | 1–5 | Coefficient weight and probability of appearance in national BAC examination sections. |
| **3** | `curriculumCentrality` | 1–5 | Core governing concept vs. specialized peripheral subtopic. |
| **4** | `prerequisiteImportance` | 1–5 | Extent to which downstream skills depend on mastering this concept first. |
| **5** | `crossTopicDependency` | 1–5 | Utility across multiple chapters or related disciplines (e.g. algebra used in physics). |
| **6** | `difficultyLevel` | 1–3 | 1: Foundational, 2: Standard BAC difficulty, 3: Complex multi-step synthesis. |
| **7** | `currentContentGap` | Boolean | True if the skill has no authored lesson, practice, or retest twin in the platform. |
| **8** | `trustworthySourcesAvailable`| Boolean | True if verified official curricula or accredited pedagogical references are on hand. |
| **9** | `errorFrequencyPotential` | 1–5 | Frequency of student confusion and recurring distractor selection in past BAC sessions. |
| **10**| `educationalRoi` | 1–5 | Expected mastery impact and point-retention efficiency per hour of active study. |

---

## 3. Categorical Output vs. Fake Precision

The platform explicitly rejects pseudo-scientific decimal scores (e.g. 94.23/100). Instead, it outputs clean categorical classifications with human-readable rationales:

### Priority Tiers

- **`HIGH`**:
  - *Criteria*: Critical prerequisite + high exam relevance + unmapped content gap + trustworthy source available.
  - *Example Rationale*: *"مكتسب قبلي حاسم + وزن نوعي مرتفع في البكالوريا + غير مغطى حالياً."*
- **`MEDIUM`**:
  - *Criteria*: Moderate curriculum centrality, or high relevance but already partially addressed, or awaiting official documents.
  - *Example Rationale*: *"مهارة مساعدة مفيدة ذات ارتباط وثيق بالمنهج لكنها تأتي بعد الأولويات الأساسية."*
- **`LOW`**:
  - *Criteria*: Peripheral or localized subtopic with low immediate roadmap impact.
  - *Example Rationale*: *"مهارة طرفية ذات أثر تراكمي ثانوي على خريطة الطريق الفورية."*

### Trustworthy Source Safety Override
$$\text{trustworthySourcesAvailable} = \text{false} \implies \text{Priority} \neq \mathbf{HIGH}$$
Even if a skill has high student demand, it cannot be scheduled for immediate high-priority production if authoritative official sources are absent.

---

## 4. Recommended Content Expansion Order

1. **Sciences Expérimentales**: Audit and finalize verification of reference slice (31 skills).
2. **Mathématiques**: Core analysis (functions, limits, sequences) and arithmetic.
3. **Sciences Physiques**: Nuclear physics, mechanics, and electrical dipoles (RC/RL).
4. **Gestion et Économie**: Accounting, financial analysis, and national economic flows.
5. **Lettres et Philosophie**: Argumentation methodologies and core philosophical issues.
6. **Langues Étrangères**: Critical text comprehension and analytical writing.
7. **Technique Math Specialties**: Isolated technical modules for Civil, Mechanical, Electrical, and Process.
