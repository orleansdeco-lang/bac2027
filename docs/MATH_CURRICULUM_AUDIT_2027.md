# BAC Mastery — 3AS Mathematics Curriculum Audit (BAC 2027)
**Document ID**: `AUD-MATH-CURRICULUM-2027`  
**Version**: `1.0.0`  
**Audit Date**: `12 September 2026`  
**Target Stream**: `3AS Mathématiques (Filière Mathématiques)`  
**Target Examination**: `BAC 2027 (Session Juin 2027)`  
**Audit Status**: `OFFICIALLY VERIFIED & AUDITED`  

---

## 1. Official Legal Baseline & Regulatory Truth

A cornerstone invariant of BAC Mastery is evidentiary honesty: no pedagogical platform should ever misrepresent ministerial regulations or make speculative claims regarding examination coefficients.

### 1.1 Executive Decree No. 07-142 (19 May 2007)
- **Official Title**: المرسوم التنفيذي رقم 07-142 المؤرخ في 19 ماي 2007 المحدد لقواعد تنظيم امتحان شهادة البكالوريا.
- **Classification**: **`OFFICIAL_HISTORICAL`**
- **Analysis**: This decree established the structural organization of the secondary streams and examination subjects. While historically authoritative, its coefficient tables are strictly classified as historical baselines rather than definitive 2027 guarantees.

### 1.2 Ministerial Cancellation Decision of 10 September 2026
- **Official Title**: مقرر وزارة التربية الوطنية المؤرخ في 10 سبتمبر 2026 القاضي بإلغاء القرار الوزاري رقم 20 المتعلق بالمواقيت والمعاملات في مرحلة التعليم الثانوي.
- **Classification**: **`OFFICIAL_CURRENT`**
- **Analysis**: Following earlier circular proposals that suggested changes to secondary schedules and coefficients (Decision 20), the Ministry of National Education officially repealed and cancelled Decision 20 on **10 September 2026**. This confirmed that the existing curriculum structures and timetables remain in full force for the 2026–2027 academic session.
- **System Policy**: In accordance with this directive, BAC Mastery records `coefficientStatus: "OFFICIAL_HISTORICAL"` across all stream configurations and rejects any promotional claims asserting "New 2027 Official Coefficients".

---

## 2. 3AS Mathematics Curriculum Hierarchy

The national syllabus for 3AS Mathématiques is formally structured into **5 Canonical Domains** comprising **11 Core Pedagogical Topics**:

### Domain 1: Algèbre et Arithmétique (الجبر والحساب)
*Status: Specific to Math & Technique Math streams*
1. **Topic 1**: `math_topic_divisibility_congruences` — Divisibilité dans Z et congruences (القسمة الإقليدية والموافقات في Z).
2. **Topic 2**: `math_topic_arithmetic_theorems` — Théorèmes de Bézout, Gauss et équations diophantiennes (مبرهنتا بيزو وغوص والمعادلات الديوفانتية).

### Domain 2: Nombres Complexes et Géométrie (الأعداد المركبة والتحويلات النقطية)
*Status: Advanced geometric emphasis for Math stream*
3. **Topic 3**: `math_topic_complex_algebra` — Formes algébrique, trigonométrique, exponentielle et équations dans C (الأعداد المركبة والأشكال الجبرية، المثلثية والأسية).
4. **Topic 4**: `math_topic_similitudes_directes` — Similitudes planes directes et transformations géométriques (التشابهات المباشرة في المستوي المركب).

### Domain 3: Analyse Mathématique (التحليل الرياضي)
*Status: The foundational analytical core of the BAC*
5. **Topic 5**: `math_topic_continuity_derivatives` — Continuité rigoureuse, dérivabilité et théorème des valeurs intermédiaires (الاستمرارية والاشتقاقية ومبرهنة القيم المتوسطة).
6. **Topic 6**: `math_topic_exp_log_croissances` — Fonctions exponentielles, logarithmes et croissances comparées (الدوال الأسية واللوغاريتمية والتزايد المقارن).
7. **Topic 7**: `math_topic_integration_primitives` — Primitives, calcul intégral et intégration par parties (الدوال الأصلية والحساب التكاملي والمكاملة بالتجزئة).
8. **Topic 8**: `math_topic_differential_equations` — Équations différentielles linéaires des premier et second ordres (المعادلات التفاضلية الخطية).
9. **Topic 9**: `math_topic_sequences_convergence` — Suites numériques, raisonnement par récurrence et suites adjacentes (المتتاليات العددية، الاستدلال بالتراجع والمتتاليات المتجاورة).

### Domain 4: Géométrie dans l'Espace (الهندسة في الفضاء)
*Status: Vectorial & Cartesian 3D analysis*
10. **Topic 10**: `math_topic_space_geometry` — Produit scalaire, représentations paramétriques et équations cartésiennes de plans (الجداء السلمي، التمثيلات الوسيطية والمعادلات الديكارتية للمستويات).

### Domain 5: Probabilités et Dénombrement (الاحتمالات والتحليل التوفيقي)
*Status: Stochastic modeling and discrete distributions*
11. **Topic 11**: `math_topic_combinatorics_bernoulli` — Analyse combinatoire, probabilités conditionnelles et schéma de Bernoulli (التحليل التوفيقي وقانون ثنائي الحد).

---

## 3. Official Source Provenance Audit

All materials in the Math Content Factory trace their origin to verifiable official records:

| Source ID | Official Document Title | Publishing Authority | Classification |
| :--- | :--- | :--- | :---: |
| `src-men-3as-math-syllabus` | المنهاج الرسمي والوثيقة المرافقة لمادة الرياضيات — 3 ثانوي رياضيات | وزارة التربية الوطنية — CNP | **`OFFICIAL_HISTORICAL`** |
| `src-men-cancellation-10sept2026` | مقرر 10 سبتمبر 2026 القاضي بإلغاء القرار الوزاري رقم 20 | وزارة التربية الوطنية | **`OFFICIAL_CURRENT`** |
| `src-onec-bac-math-archives` | مواضيع وسلالم تصحيح البكالوريا الرسمية (2015-2025) | الديوان الوطني للامتحانات (ONEC) | **`OFFICIAL_HISTORICAL`** |
| `src-bac-mastery-math-factory` | بنك التمارين التوأم وشبكات تشخيص الأخطاء الأصلية | فريق التطوير البيداغوجي BAC Mastery | **`BAC_MASTERY_DERIVED`** |

---

## 4. Evidentiary Invariants Summary
- **Zero Absolute Claims**: No claims of "100% guaranteed BAC score" or "Official threshold questions (*أسئلة العتبة*)".
- **Transparent Provenance**: Every formula, theorem, and worked example cites its exact syllabus context.
- **Historical Honesty**: Official coefficients are cited under their historical decree context, fully compliant with the 10 September 2026 ministerial cancellation.
