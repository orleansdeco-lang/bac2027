# BAC Mastery V1 — Stream Registry Specification
**Comprehensive Canonical Stream & Specialty Catalog for the Algerian Baccalauréat**
**Document Version**: 1.0.0 (V1 Completion Baseline)  
**Verification Classification**: OFFICIAL_HISTORICAL (Decree 07-142 Baseline)  
**Academic Year**: 2026–2027  

---

## 1. Overview & Statutory Authority

In accordance with **Executive Decree n° 07-142 of May 19, 2007** (*Décret Exécutif n° 07-142 fixant les règles relatives au Baccalauréat*), the Algerian Ministry of National Education establishes six distinct streams (*filières*) for the Baccalauréat examination.

This document provides the canonical registry of all 6 streams and the 4 engineering specialties of Technique Mathématiques, detailing their bilingual designations, pedagogical profiles, subject requirements, coefficient baselines, and architectural invariants.

---

## 2. Stream 1: Sciences Expérimentales (`sciences_exp`)

- **Code**: `SE`
- **Arabic Name**: علوم تجريبية
- **French Name**: Sciences Expérimentales
- **Pedagogical Profile**: Integrative natural sciences, physics, chemistry, and applied mathematics. Focuses on scientific inquiry, experimental analysis, and biological mechanisms.
- **Verification Status**: `OFFICIAL_HISTORICAL`
- **Official Statutory Reference**: Décret Exécutif n° 07-142 du 19 mai 2007

### Subject & Coefficient Table
| Subject | Subject ID | Baseline Coefficient | Core Status | Content Language | Direction | Methodology Family |
|:---|:---|:---:|:---:|:---:|:---:|:---|
| علوم الطبيعة والحياة | `natural_sciences` | **6** | Core | Arabic | RTL | `natural_sciences` |
| العلوم الفيزيائية | `physics` | **5** | Core | Arabic | RTL | `physics_chemistry` |
| الرياضيات | `math` | **5** | Core | Arabic | RTL | `mathematics` |
| اللغة العربية وآدابها | `arabic` | 3 | Common | Arabic | RTL | `languages` |
| الفلسفة | `philosophy` | 2 | Common | Arabic | RTL | `philosophy` |
| اللغة الفرنسية | `french` | 2 | Common | French | LTR | `languages` |
| اللغة الإنجليزية | `english` | 2 | Common | English | LTR | `languages` |
| العلوم الإسلامية | `islamic_studies` | 2 | Common | Arabic | RTL | `islamic_studies` |
| التاريخ والجغرافيا | `history_geography` | 2 | Common | Arabic | RTL | `history_geography` |
| **Total Coefficient Baseline** | — | **29** | — | — | — | — |

---

## 3. Stream 2: Mathématiques (`math`)

- **Code**: `M`
- **Arabic Name**: رياضيات
- **French Name**: Mathématiques
- **Pedagogical Profile**: Theoretical mathematical elite stream. Focuses on abstract axiomatic reasoning, formal proofs, advanced calculus, arithmetic in $\mathbb{Z}$, and deep physical modeling.
- **Verification Status**: `OFFICIAL_HISTORICAL`
- **Official Statutory Reference**: Décret Exécutif n° 07-142 du 19 mai 2007

### Subject & Coefficient Table
| Subject | Subject ID | Baseline Coefficient | Core Status | Content Language | Direction | Methodology Family |
|:---|:---|:---:|:---:|:---:|:---:|:---|
| الرياضيات | `math` | **7** | Core | Arabic | RTL | `mathematics` |
| العلوم الفيزيائية | `physics` | **6** | Core | Arabic | RTL | `physics_chemistry` |
| اللغة العربية وآدابها | `arabic` | 3 | Common | Arabic | RTL | `languages` |
| علوم الطبيعة والحياة | `natural_sciences` | 2 | Secondary | Arabic | RTL | `natural_sciences` |
| الفلسفة | `philosophy` | 2 | Common | Arabic | RTL | `philosophy` |
| اللغة الفرنسية | `french` | 2 | Common | French | LTR | `languages` |
| اللغة الإنجليزية | `english` | 2 | Common | English | LTR | `languages` |
| العلوم الإسلامية | `islamic_studies` | 2 | Common | Arabic | RTL | `islamic_studies` |
| التاريخ والجغرافيا | `history_geography` | 2 | Common | Arabic | RTL | `history_geography` |
| **Total Coefficient Baseline** | — | **28** | — | — | — | — |

---

## 4. Stream 3: Technique Mathématiques (`technique_math`)

- **Code**: `TM`
- **Arabic Name**: تقني رياضي
- **French Name**: Technique Mathématiques
- **Pedagogical Profile**: Advanced applied engineering and technological sciences built upon strong theoretical mathematics and physics.
- **Verification Status**: `OFFICIAL_HISTORICAL`
- **Official Statutory Reference**: Décret Exécutif n° 07-142 du 19 mai 2007

### 4.1 Common Core Subjects (8 Subjects, Total Coef 25)
All Technique Math students take these 8 common subjects regardless of specialty:
| Subject | Subject ID | Baseline Coef | Core Status | Content Language | Direction |
|:---|:---|:---:|:---:|:---:|:---:|
| الرياضيات | `math` | **6** | Core | Arabic | RTL |
| العلوم الفيزيائية | `physics` | **6** | Core | Arabic | RTL |
| اللغة العربية وآدابها | `arabic` | 3 | Common | Arabic | RTL |
| الفلسفة | `philosophy` | 2 | Common | Arabic | RTL |
| اللغة الفرنسية | `french` | 2 | Common | French | LTR |
| اللغة الإنجليزية | `english` | 2 | Common | English | LTR |
| العلوم الإسلامية | `islamic_studies` | 2 | Common | Arabic | RTL |
| التاريخ والجغرافيا | `history_geography` | 2 | Common | Arabic | RTL |

### 4.2 The 4 Isolated Engineering Specialties (Coefficient 7)
Each student specializes in exactly ONE engineering branch:

1. **Génie Civil (`civil_eng`)**
   - **Matière**: الهندسة المدنية (Code: `GC`, Coef: 7)
   - **Scope**: Structural statics, truss analysis, strength of materials (RDM), geotechnical foundations, reinforced concrete.
2. **Génie Mécanique (`mechanical_eng`)**
   - **Matière**: الهندسة الميكانيكية (Code: `GM`, Coef: 7)
   - **Scope**: Kinematics, mechanisms, velocity diagrams, statics, mechanical design, ISO tolerancing, manufacturing.
3. **Génie Électrique (`electrical_eng`)**
   - **Matière**: الهندسة الكهربائية (Code: `GE`, Coef: 7)
   - **Scope**: Combinational and sequential logic, microprocessors, PIC/Arduino, power electronics, sensors, motor control.
4. **Génie des Procédés (`process_eng`)**
   - **Matière**: هندسة الطرائق (Code: `GP`, Coef: 7)
   - **Scope**: Industrial chemistry, unitary operations, thermodynamics, reactor kinetics, distillation, polymer synthesis.

**Total Coefficient with Specialty: 32**

### 4.3 Specialty Isolation Rules
- Calling `resolveStreamSubjects("technique_math", undefined)` strictly returns the 8 common subjects.
- Under no circumstances does the system default to `mechanical_eng` or leak one specialty's questions into another.

---

## 5. Stream 4: Gestion et Économie (`gestion_eco`)

- **Code**: `GE`
- **Arabic Name**: تسيير واقتصاد
- **French Name**: Gestion et Économie
- **Pedagogical Profile**: Corporate financial management, macroeconomic analysis, commercial and labor law, and quantitative statistics.
- **Verification Status**: `OFFICIAL_HISTORICAL`
- **Official Statutory Reference**: Décret Exécutif n° 07-142 du 19 mai 2007

### Subject & Coefficient Table
| Subject | Subject ID | Baseline Coefficient | Core Status | Content Language | Direction | Methodology Family |
|:---|:---|:---:|:---:|:---:|:---:|:---|
| التسيير المحاسبي والمالي | `accounting_finance` | **6** | Core | Arabic | RTL | `economics_management` |
| الاقتصاد والمناجمنت | `economics_management` | **5** | Core | Arabic | RTL | `economics_management` |
| الرياضيات | `math` | **5** | Core | Arabic | RTL | `mathematics` |
| التاريخ والجغرافيا | `history_geography` | **4** | Core | Arabic | RTL | `history_geography` |
| اللغة العربية وآدابها | `arabic` | 3 | Common | Arabic | RTL | `languages` |
| القانون | `law` | 2 | Common | Arabic | RTL | `economics_management` |
| الفلسفة | `philosophy` | 2 | Common | Arabic | RTL | `philosophy` |
| اللغة الفرنسية | `french` | 2 | Common | French | LTR | `languages` |
| اللغة الإنجليزية | `english` | 2 | Common | English | LTR | `languages` |
| العلوم الإسلامية | `islamic_studies` | 2 | Common | Arabic | RTL | `islamic_studies` |
| **Total Coefficient Baseline** | — | **33** | — | — | — | — |

---

## 6. Stream 5: Lettres et Philosophie (`lettres_philo`)

- **Code**: `LP`
- **Arabic Name**: آداب وفلسفة
- **French Name**: Lettres et Philosophie
- **Pedagogical Profile**: Philosophical inquiry, epistemology, advanced Arabic literature, rhetoric, historical analysis, and humanities.
- **Verification Status**: `OFFICIAL_HISTORICAL`
- **Official Statutory Reference**: Décret Exécutif n° 07-142 du 19 mai 2007

### Subject & Coefficient Table
| Subject | Subject ID | Baseline Coefficient | Core Status | Content Language | Direction | Methodology Family |
|:---|:---|:---:|:---:|:---:|:---:|:---|
| الفلسفة | `philosophy` | **6** | Core | Arabic | RTL | `philosophy` |
| اللغة العربية وآدابها | `arabic` | **6** | Core | Arabic | RTL | `languages` |
| التاريخ والجغرافيا | `history_geography` | **4** | Core | Arabic | RTL | `history_geography` |
| اللغة الفرنسية | `french` | 3 | Common | French | LTR | `languages` |
| اللغة الإنجليزية | `english` | 3 | Common | English | LTR | `languages` |
| الرياضيات | `math` | 2 | Common | Arabic | RTL | `mathematics` |
| العلوم الإسلامية | `islamic_studies` | 2 | Common | Arabic | RTL | `islamic_studies` |
| **Total Coefficient Baseline** | — | **26** | — | — | — | — |

---

## 7. Stream 6: Langues Étrangères (`langues_etrangeres`)

- **Code**: `LE`
- **Arabic Name**: لغات أجنبية
- **French Name**: Langues Étrangères
- **Pedagogical Profile**: Multilingual fluency, comparative literary analysis, civilization studies, syntax, and intercultural communication across Arabic, French, English, and a 3rd Foreign Language (Spanish, German, or Italian).
- **Verification Status**: `OFFICIAL_HISTORICAL`
- **Official Statutory Reference**: Décret Exécutif n° 07-142 du 19 mai 2007

### Subject & Coefficient Table
| Subject | Subject ID | Baseline Coefficient | Core Status | Content Language | Direction | Methodology Family |
|:---|:---|:---:|:---:|:---:|:---:|:---|
| اللغة العربية وآدابها | `arabic` | **5** | Core | Arabic | RTL | `languages` |
| اللغة الفرنسية | `french` | **5** | Core | French | LTR | `languages` |
| اللغة الإنجليزية | `english` | **5** | Core | English | LTR | `languages` |
| اللغة الأجنبية الثالثة | `third_language` | **4** | Core | Spanish/German/Italian | LTR | `languages` |
| التاريخ والجغرافيا | `history_geography` | 2 | Common | Arabic | RTL | `history_geography` |
| الفلسفة | `philosophy` | 2 | Common | Arabic | RTL | `philosophy` |
| الرياضيات | `math` | 2 | Common | Arabic | RTL | `mathematics` |
| العلوم الإسلامية | `islamic_studies` | 2 | Common | Arabic | RTL | `islamic_studies` |
| **Total Coefficient Baseline** | — | **27** | — | — | — | — |

---

## 8. Architectural Integrity Invariants

1. **No Hardcoded Single-Stream Assumptions**: No component in `src/domain/curriculum/` or `src/lib/roadmap/` assumes `sciences_exp` as a fallback or global constant.
2. **Stream-Specific Roadmaps**: A student in `lettres_philo` receives priority on Philosophy and Arabic; a student in `gestion_eco` receives priority on Accounting and Economics; a student in `sciences_exp` receives priority on Natural Sciences.
3. **Audit Compliance**: All streams pass compile-time schema validation and runtime assertion testing.
