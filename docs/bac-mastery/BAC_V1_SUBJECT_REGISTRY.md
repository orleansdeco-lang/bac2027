# BAC Mastery V1 — Subject Registry Specification
**Authoritative Catalog of All 17 Baccalauréat Subjects, Methodology Mappings & Statutory Provenance**
**Document Version**: 1.0.0 (V1 Completion Baseline)  
**Verification Classification**: OFFICIAL_HISTORICAL (Decree 07-142 Baseline)  
**Academic Year**: 2026–2027  

---

## 1. Overview

The Algerian secondary education curriculum for the Baccalauréat is organized around 17 distinct academic subjects. In BAC Mastery V1, each subject is codified as an independent first-class domain entity with explicit metadata governing:
1. **Bilingual Nomenclature**: Official Arabic and French titles.
2. **Stream & Specialty Compatibility**: Valid stream assignments, preventing cross-stream subject leakage.
3. **Linguistic Contract**: Explicit content language and text directionality, decoupled from user interface localization.
4. **Epistemic Model**: Linkage to one of 9 canonical pedagogical methodology families.
5. **Statutory Provenance**: Citing Decree 07-142 and national syllabus guidelines.

---

## 2. Canonical Subject Catalog (17 Subjects)

### 2.1 Core STEM Subjects

#### 1. الرياضيات (Mathématiques) — `math`
- **Code**: `MATH`
- **Compatible Streams**: All 6 Streams (`sciences_exp`, `math`, `technique_math`, `gestion_eco`, `lettres_philo`, `langues_etrangeres`)
- **Content Language**: Arabic (`ar`) | **Direction**: RTL
- **Scientific**: Yes
- **Methodology Family**: `mathematics`
- **Coefficient Scale**: 7 (Math), 6 (Technique Math), 5 (Sciences Exp, Gestion-Éco), 2 (Lettres-Philo, Langues)
- **Provenance**: National Secondary Curriculum Syllabus for Mathematics, Ministry of National Education.

#### 2. العلوم الفيزيائية (Sciences Physiques) — `physics`
- **Code**: `PHY`
- **Compatible Streams**: `sciences_exp`, `math`, `technique_math`
- **Content Language**: Arabic (`ar`) | **Direction**: RTL
- **Scientific**: Yes
- **Methodology Family**: `physics_chemistry`
- **Coefficient Scale**: 6 (Math, Technique Math), 5 (Sciences Exp)
- **Provenance**: National Curriculum Syllabus for Physical Sciences, Ministry of National Education.

#### 3. علوم الطبيعة والحياة (Sciences de la Nature et de la Vie) — `natural_sciences`
- **Code**: `SNV`
- **Compatible Streams**: `sciences_exp`, `math`
- **Content Language**: Arabic (`ar`) | **Direction**: RTL
- **Scientific**: Yes
- **Methodology Family**: `natural_sciences`
- **Coefficient Scale**: 6 (Sciences Exp - Core Distinguishing Subject), 2 (Math)
- **Provenance**: National Curriculum Syllabus for Life & Natural Sciences, Ministry of National Education.

---

### 2.2 Technique Math Engineering Specialties

#### 4. الهندسة المدنية (Génie Civil) — `civil_eng`
- **Code**: `GC`
- **Compatible Streams**: `technique_math` (Specialty: `civil_eng` strictly)
- **Content Language**: Arabic (`ar`) | **Direction**: RTL
- **Scientific**: Yes
- **Methodology Family**: `technique_math`
- **Coefficient**: 7 (Matière de spécialité)
- **Provenance**: National Curriculum for Civil Engineering, Technical Secondary Education.

#### 5. الهندسة الميكانيكية (Génie Mécanique) — `mechanical_eng`
- **Code**: `GM`
- **Compatible Streams**: `technique_math` (Specialty: `mechanical_eng` strictly)
- **Content Language**: Arabic (`ar`) | **Direction**: RTL
- **Scientific**: Yes
- **Methodology Family**: `technique_math`
- **Coefficient**: 7 (Matière de spécialité)
- **Provenance**: National Curriculum for Mechanical Engineering, Technical Secondary Education.

#### 6. الهندسة الكهربائية (Génie Électrique) — `electrical_eng`
- **Code**: `GE`
- **Compatible Streams**: `technique_math` (Specialty: `electrical_eng` strictly)
- **Content Language**: Arabic (`ar`) | **Direction**: RTL
- **Scientific**: Yes
- **Methodology Family**: `technique_math`
- **Coefficient**: 7 (Matière de spécialité)
- **Provenance**: National Curriculum for Electrical Engineering, Technical Secondary Education.

#### 7. هندسة الطرائق (Génie des Procédés) — `process_eng`
- **Code**: `GP`
- **Compatible Streams**: `technique_math` (Specialty: `process_eng` strictly)
- **Content Language**: Arabic (`ar`) | **Direction**: RTL
- **Scientific**: Yes
- **Methodology Family**: `technique_math`
- **Coefficient**: 7 (Matière de spécialité)
- **Provenance**: National Curriculum for Process Engineering, Technical Secondary Education.

---

### 2.3 Economics & Management Disciplines

#### 8. التسيير المحاسبي والمالي (Gestion Comptable et Financière) — `accounting_finance`
- **Code**: `ACC`
- **Compatible Streams**: `gestion_eco`
- **Content Language**: Arabic (`ar`) | **Direction**: RTL
- **Scientific**: No
- **Methodology Family**: `economics_management`
- **Coefficient**: 6 (Core distinguishing subject for Gestion-Éco)
- **Provenance**: National Curriculum for Accounting & Financial Management, Ministry of National Education.

#### 9. الاقتصاد والمناجمنت (Économie et Management) — `economics_management`
- **Code**: `ECO`
- **Compatible Streams**: `gestion_eco`
- **Content Language**: Arabic (`ar`) | **Direction**: RTL
- **Scientific**: No
- **Methodology Family**: `economics_management`
- **Coefficient**: 5
- **Provenance**: National Curriculum for Economics and Management, Ministry of National Education.

#### 10. القانون (Droit) — `law`
- **Code**: `LAW`
- **Compatible Streams**: `gestion_eco`
- **Content Language**: Arabic (`ar`) | **Direction**: RTL
- **Scientific**: No
- **Methodology Family**: `economics_management`
- **Coefficient**: 2
- **Provenance**: National Curriculum for Legal Studies, Ministry of National Education.

---

### 2.4 Humanities & Social Sciences

#### 11. الفلسفة (Philosophie) — `philosophy`
- **Code**: `PHIL`
- **Compatible Streams**: All 6 Streams
- **Content Language**: Arabic (`ar`) | **Direction**: RTL
- **Scientific**: No
- **Methodology Family**: `philosophy`
- **Coefficient Scale**: 6 (Lettres-Philo - Core Distinguishing Subject), 2 (All Other Streams)
- **Provenance**: National Curriculum for Philosophy, Secondary Education.

#### 12. اللغة العربية وآدابها (Langue et Littérature Arabes) — `arabic`
- **Code**: `AR`
- **Compatible Streams**: All 6 Streams
- **Content Language**: Arabic (`ar`) | **Direction**: RTL
- **Scientific**: No
- **Methodology Family**: `languages`
- **Coefficient Scale**: 6 (Lettres-Philo), 5 (Langues Étrangères), 3 (Sciences Exp, Math, TM, Gestion-Éco)
- **Provenance**: National Curriculum for Arabic Language and Literature, Ministry of National Education.

#### 13. العلوم الإسلامية (Sciences Islamiques) — `islamic_studies`
- **Code**: `ISL`
- **Compatible Streams**: All 6 Streams
- **Content Language**: Arabic (`ar`) | **Direction**: RTL
- **Scientific**: No
- **Methodology Family**: `islamic_studies`
- **Coefficient**: 2 (Universal across all 6 streams)
- **Provenance**: National Curriculum for Islamic Sciences, Ministry of National Education.

#### 14. التاريخ والجغرافيا (Histoire-Géographie) — `history_geography`
- **Code**: `HG`
- **Compatible Streams**: All 6 Streams
- **Content Language**: Arabic (`ar`) | **Direction**: RTL
- **Scientific**: No
- **Methodology Family**: `history_geography`
- **Coefficient Scale**: 4 (Lettres-Philo, Gestion-Éco), 2 (Sciences Exp, Math, TM, Langues Étrangères)
- **Provenance**: National Curriculum for History and Geography, Ministry of National Education.

---

### 2.5 Foreign Languages

#### 15. اللغة الفرنسية (Français) — `french`
- **Code**: `FR`
- **Compatible Streams**: All 6 Streams
- **Content Language**: French (`fr`) | **Direction**: LTR
- **Scientific**: No
- **Methodology Family**: `languages`
- **Coefficient Scale**: 5 (Langues Étrangères), 3 (Lettres-Philo), 2 (Scientific & Economic Streams)
- **Provenance**: Programme Officiel de Français pour le Secondaire, Ministère de l'Éducation Nationale.

#### 16. اللغة الإنجليزية (Anglais) — `english`
- **Code**: `ENG`
- **Compatible Streams**: All 6 Streams
- **Content Language**: English (`en`) | **Direction**: LTR
- **Scientific**: No
- **Methodology Family**: `languages`
- **Coefficient Scale**: 5 (Langues Étrangères), 3 (Lettres-Philo), 2 (Scientific & Economic Streams)
- **Provenance**: Official English Syllabus for Secondary Education, Ministry of National Education.

#### 17. اللغة الأجنبية الثالثة (Troisième Langue Vivante) — `third_language`
- **Code**: `L3`
- **Compatible Streams**: `langues_etrangeres`
- **Content Language**: Spanish (`es`) / German (`de`) / Italian (`it`) | **Direction**: LTR
- **Scientific**: No
- **Methodology Family**: `languages`
- **Coefficient**: 4 (Core distinguishing language for Langues Étrangères)
- **Provenance**: National Secondary Curriculum for Third Foreign Languages, Ministry of National Education.

---

## 3. Cross-Subject Invariants

1. **Zero Orphan Subjects**: Every subject maps to at least one stream (`sub.streamIds.length > 0`).
2. **Technique Math Specialty Integrity**: The 4 engineering subjects (`civil_eng`, `mechanical_eng`, `electrical_eng`, `process_eng`) have `streamIds: ["technique_math"]` and are mutually isolated via their `specialtyIds` attribute.
3. **Directional Safety**: Subjects with `contentLanguage: "ar"` are strictly `textDirection: "rtl"`. European language subjects are strictly `textDirection: "ltr"`.
