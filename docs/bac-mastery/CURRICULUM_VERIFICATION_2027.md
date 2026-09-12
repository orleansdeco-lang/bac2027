# BAC Mastery — Official 2026–2027 Curriculum Verification & Legal Baseline
**Document: Official Ministerial Context & Legal Analysis**
*Academic Year: 2026–2027 / Target Examination: BAC 2027*
*Status: Authoritative Legal Benchmark*

---

## 1. Institutional Context & Official Ministerial Announcements

The Ministry of National Education has established clear operational parameters for the **2026–2027 school year**:

1. **Current Secondary Organization Maintained**:
   - The pedagogical organization of general and technological secondary education remains governed by the current established system for the 2026–2027 academic year.
   - Comprehensive structural curriculum and examination reforms are scheduled to take effect in academic year **2027–2028**.
2. **Examination Format Continuity**:
   - The format, structure, and subject roster of the Baccalaureate examination remain unchanged for BAC 2027.
   - The examined subjects correspond strictly to the official syllabi taught in 3AS during 2026–2027.

---

## 2. The 10 September 2026 Ministerial Cancellation Decision

### The Decisive Legal Event
On **10 September 2026**, the Ministry of National Education published an official decision cancelling the previously circulated ministerial decision regarding secondary-school weekly schedules and coefficients.

### Architectural & Legal Consequences for BAC Mastery
1. **Absolute Prohibition of "BAC 2027 Official Coefficients"**:
   - The platform **must never** represent any coefficient dataset as "current official BAC 2027 coefficients".
   - Doing so would constitute a direct legal and factual misrepresentation.
2. **Mandatory Classification as `OFFICIAL_HISTORICAL`**:
   - The valid operational baseline for secondary coefficients remains **Executive Decree No. 07-142 of May 19, 2007** (المرسوم التنفيذي رقم 07-142 المؤرخ في 19 مايو 2007).
   - All subject rules, weighting factors, and core designations derived from Decree 07-142 are strictly classified as:
     $$\mathbf{OFFICIAL\_HISTORICAL}$$
   - Any provisional planning coefficient without decree grounding is classified as $\mathbf{PROVISIONAL\_UNVERIFIED}$.

---

## 3. Formal Stream Audit (6 Canonical Streams)

| Stream ID | Official Name (Arabic) | Official Name (French) | Legal Anchor | Coefficient Status | Core Subjects |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `sciences_exp` | علوم تجريبية | Sciences Expérimentales | Décret 07-142 | `OFFICIAL_HISTORICAL` | العلوم الطبيعية والحياة، العلوم الفيزيائية، الرياضيات |
| `math` | رياضيات | Mathématiques | Décret 07-142 | `OFFICIAL_HISTORICAL` | الرياضيات، العلوم الفيزيائية |
| `technique_math` | تقني رياضي | Technique Mathématiques | Décret 07-142 | `OFFICIAL_HISTORICAL` | التكنولوجيا (التخصص)، الرياضيات، العلوم الفيزيائية |
| `gestion_eco` | تسيير واقتصاد | Gestion et Économie | Décret 07-142 | `OFFICIAL_HISTORICAL` | التسيير المحاسبي والمالي، الاقتصاد والمناجمنت، القانون، الرياضيات |
| `lettres_philo` | آداب وفلسفة | Lettres et Philosophie | Décret 07-142 | `OFFICIAL_HISTORICAL` | الفلسفة، اللغة العربية وآدابها، التاريخ والجغرافيا |
| `langues_etrangeres`| لغات أجنبية | Langues Étrangères | Décret 07-142 | `OFFICIAL_HISTORICAL` | اللغة الأجنبية الثالثة، اللغة الفرنسية، اللغة الإنجليزية، اللغة العربية |

---

## 4. Technique Math Specialty Isolation Guarantee

The platform guarantees strict programmatic isolation across all 4 engineering branches of the `technique_math` stream:

1. **Génie Civil (`civil_eng`)**: Construction, geotechnics, structural mechanics, reinforced concrete.
2. **Génie Mécanique (`mechanical_eng`)**: Kinematics, dynamics, mechanical design, machine elements.
3. **Génie Électrique (`electrical_eng`)**: Combinational & sequential logic, microprocessors, power electronics.
4. **Génie des Procédés (`process_eng`)**: Industrial organic chemistry, unit operations, chemical thermodynamics.

### Invariant
$$\text{Technique Math} \nrightarrow \text{Default to Génie Mécanique}$$
Every specialty is an isolated first-class entity with its own distinct specialty subject ID and curriculum mapping.
