# BAC Mastery V1 — Visual Learning Layer
**Prompt 20.1 Domain Specification Document**
*Version: 1.0.0 — Pedagogical Visual Architecture*
*Status: Verified & Active*

---

## 1. Pedagogical Foundation: Why Visuals Exist

In BAC Mastery, an educational visual is a **first-class learning asset**, never an arbitrary illustration or cosmetic decoration.

### The Core Pedagogical Principle
$$\text{Visual Asset} \neq \text{imageUrl: string}$$
$$\text{Visual Asset} = \text{Cognitive Model} + \text{Epistemic Function} + \text{Accessibility Contract} + \text{Provenance}$$

According to Mayer's Cognitive Theory of Multimedia Learning and Paivio's Dual-Coding Theory:
1. Students build more stable mental models when verbal/algebraic representations are paired with synchronized visual-spatial representations.
2. A visual must reduce extraneous cognitive load, never increase it.
3. Every visual must serve an explicit educational purpose that can be verified through practice or retest.

---

## 2. Visual Taxonomy & Subject-Specific Rules

Different academic disciplines impose distinct epistemic demands. The platform avoids applying generic diagrams to subjects that require specialized visual representations.

### Disciplines & Natural Visual Models

| Subject Family | Natural Visual Representations | Epistemic Role |
| :--- | :--- | :--- |
| **Mathematics** (`math`) | Function curves (`mathematical_plot`), asymptote schemas, geometric figures, sign tables, algorithm flowcharts | Spatial interpretation of limits, continuity, rate of change, and geometric transformations. |
| **Physics / Chemistry** (`physics`) | Circuit diagrams (`circuit_diagram`), force vectors (`force_diagram`), molecular structures, reaction steps | Physical setup convention, receiver/generator conventions, vector equilibrium. |
| **Natural Sciences** (`natural_sciences`) | Biological schemas (`biological_schema`), cellular mechanisms, anatomical sections, scientific document data | Scientific interpretation, experimental observation, protein synthesis and immune pathways. |
| **History / Geography** (`history_geography`) | Cartographic maps (`map`), chronological timelines (`timeline`), spatial comparative tables | Geopolitical polarities, historical sequence of crises, demographic and economic spatial distributions. |
| **Technique Math** (`mechanical_eng`, `civil_eng`, `electrical_eng`, `process_eng`) | Technical drawings (`technical_drawing`), kinematic mechanisms, structural schemes, ladder logic | Standardization, mechanical constraints, hydraulic/chemical process flows. |
| **Economics & Management** (`accounting_finance`, `economics_management`, `law`) | Process diagrams, balance sheet flowcharts, financial ratio matrices | Accounting cycle flows, supply/demand curves, institutional hierarchies. |
| **Philosophy** (`philosophy`) | Argumentation maps, thesis/antithesis dialectic trees, conceptual comparison matrices | Visualizing deductive reasoning, contrasting philosophical doctrines. |
| **Languages** (`arabic`, `french`, `english`, `third_language`) | Text structure diagrams, contextual vocabulary schemas, rhetorical analysis matrices | Structural text dissection, thematic comprehension anchors. |

---

## 3. Educational Purpose Taxonomy

A visual asset is strictly prohibited from having an empty or purely decorative purpose. Every visual must declare one of 10 pedagogical purposes:

1. `CONCEPT_EXPLANATION`: Reifying abstract theoretical concepts into clear mental models.
2. `PROCESS_EXPLANATION`: Decomposing sequential dynamic mechanisms (e.g. translation elongation, RC charging).
3. `RELATIONSHIP_MAPPING`: Exposing links between interconnected curriculum entities.
4. `SPATIAL_REASONING`: Fostering geometric, spatial, or directional reasoning.
5. `DOCUMENT_ANALYSIS`: Acting as an authentic BAC exam scientific document requiring systematic reading.
6. `MEMORY_SUPPORT`: Providing a high-retention visual anchor for complex factual sets.
7. `COMPARISON`: Contrasting two physical states, historical blocs, or mathematical domains.
8. `EXAM_METHOD`: Illustrating the standard formatting expected by ministerial BAC correction rubrics.
9. `ERROR_REPAIR`: Directly countering and dismantling a known student misconception.
10. `WORKED_EXAMPLE_SUPPORT`: Providing the visual accompaniment to a step-by-step resolved exercise.

---

## 4. Accessibility & Direction Invariants

Every visual asset must fulfill three strict accessibility standards:
1. **Meaningful Non-Visual Alternative**:
   - `altText_ar`: Concise Arabic text describing the visual content for screen readers.
   - `accessibilityMetadata.description`: Comprehensive textual explanation capturing all information embedded in the image.
   - `accessibilityMetadata.screenReaderSummary`: Quick auditory abstract.
2. **Non-Color-Dependent Cues**:
   - Information must not rely on color perception alone (e.g. dashed vs. solid lines, distinct geometric shapes, explicit labels alongside colors).
3. **Independent Directionality**:
   - UI locale does not dictate image coordinate systems.
   - Cartesian coordinate systems in Algeria follow international mathematical standards ($x$-axis left-to-right), retaining `direction: "ltr"`.
   - Arabic contextual annotations and schematic workflows retain `direction: "rtl"`.

---

## 5. Exemplar Verified Assets Implemented in V1

The initial ecosystem baseline includes 4 verified reference visual assets in `src/domain/learning-ecosystem/visual-assets.ts`:
1. `vis_math_asymptote_interpretation`: Function curves and horizontal/vertical asymptotes with interactive annotations.
2. `vis_phys_rc_charging_circuit`: RC charging circuit with receiver convention voltage and current vectors.
3. `vis_snv_ribosome_translation_schema`: Ribosomal P and A sites during polypeptide elongation.
4. `vis_hist_cold_war_bipolar_map`: European geopolitical division, NATO and Warsaw Pact alliances, and the Iron Curtain.
