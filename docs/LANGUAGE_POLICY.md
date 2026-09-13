# BAC MASTERY — PLATFORM LANGUAGE POLICY v1.0
## NON-NEGOTIABLE ARCHITECTURAL & PEDAGOGICAL SPECIFICATION

---

## 1. CORE DIRECTIVE

The educational content language within BAC Mastery is governed strictly by the disciplinary nature of each school subject in the official Algerian National Baccalaureate (BAC) curriculum.

Platform UI language preferences (Arabic RTL vs French LTR) govern only system chrome, buttons, and navigation; the **instructional language of learning content is immutable** and determined solely by this policy.

---

## 2. DISCIPLINARY LANGUAGE MATRIX

### 2.1 Default Instructional Language: Arabic (`ar`)
All scientific, humanistic, social, and national curriculum subjects are taught and explained in academic, structured Arabic:

| Subject | Curricular Designation | Instructional Language | Terminology Rule |
|---------|------------------------|------------------------|------------------|
| **Mathematics** | الرياضيات | **Arabic** | Standard mathematical notation; French terms permitted in parentheses for technical clarity |
| **Physics & Chemistry** | العلوم الفيزيائية | **Arabic** | Standard SI units & symbols; French/English terms permitted in parentheses |
| **Natural Sciences (SNV)** | علوم الطبيعة والحياة | **Arabic** | Biological & experimental mechanisms in Arabic; standard French terms in parentheses |
| **Arabic Literature** | اللغة العربية وآدابها | **Arabic** | 100% Standard Literary Arabic |
| **Philosophy** | الفلسفة | **Arabic** | Philosophical essays, argumentation, and doctrines in Arabic |
| **History & Geography** | التاريخ والجغرافيا | **Arabic** | Historical analyses, geopolitical concepts, and cartography in Arabic |
| **Islamic Studies** | العلوم الإسلامية | **Arabic** | 100% Standard Sharia & Quranic terminology in Arabic |

### 2.2 Target-Language Foreign Language Subjects
Foreign language subjects are taught, practiced, and assessed **entirely in their native target language**:

| Subject | Curricular Designation | Instructional Language | Translation Rule |
|---------|------------------------|------------------------|------------------|
| **French** | Français (3AS) | **French (`fr`)** | **STRICTLY BANNED**: Translating lessons into Arabic as the primary instructional layer. Lessons, grammar, texts, and exercises remain 100% in French. |
| **English** | English (3AS) | **English (`en`)** | **STRICTLY BANNED**: Translating lessons into Arabic as the primary instructional layer. Lessons, grammar, reading comprehension, and tasks remain 100% in English. |
| **Third Language** | Espagnol / Allemand / Italien | **Target Language (`es` / `de` / `it`)** | Instruction and immersion in the target language for Langues Étrangères stream. |

---

## 3. SCIENTIFIC & TECHNICAL TERMINOLOGY GUIDELINES

For non-language subjects (Mathematics, Physics & Chemistry, Natural Sciences):
1. **Instructional Exposition**: All causal explanations, document observations, problem definitions, hypotheses, conclusions, and pedagogical repairs **must be authored in Arabic**.
2. **Parenthetical Equivalents**: Standard French (or English) nomenclature may be provided in parentheses adjacent to Arabic terminology when it serves a pedagogical purpose:
   - *Natural Sciences*: `إنزيم أستيل كولين إستراز (AChE)`، `حلقة كالفن (Cycle de Calvin)`، `المعقد المناعي (Complexe immun)`، `الفسفرة التأكسدية (Phosphorylation oxydative)`.
   - *Physics & Chemistry*: `المعايرة اللونية (Titrage colorimétrique)`، `السرعة الحجمية (Vitesse volumique)`، `طاقة الربط (Énergie de liaison)`.
   - *Mathematics*: `نقطة الانعطاف (Point d'inflexion)`، `المستقيم المقارب (Asymptote)`، `المعادلات التفاضلية (Équations différentielles)`.
3. **No Language Creep**: The presence of technical terminology in parentheses must never dilute the primary instructional layer: all explanatory sentences, reasoning chains, and analytical deductions remain purely in Arabic.

---

## 4. FOREIGN LANGUAGE IMMERSION & ANTI-TRANSLATION DIRECTIVE

For **French** and **English**:
1. **Primary Layer Immersion**: All lesson overviews, text excerpts, grammar rules, comprehension questionnaires, writing prompts (production écrite / written expression), and rubrics must be authored directly in French or English respectively.
2. **Prohibited Practice**: Providing parallel line-by-line Arabic translations or writing grammar lessons in Arabic for French and English is strictly prohibited. The student must engage with and master the language in its native form, reflecting Algerian BAC exam papers where questions, texts, and synthesis tasks are 100% in the target language.
3. **Glossaries**: If difficult literary or specialized vocabulary requires definition, it should be glossed in the target language (synonymes / context definitions) or with minimal targeted annotations, without degrading the immersion environment.

---

## 5. CODEBASE ALIGNMENT & VERIFICATION

This policy is deterministically enforced at the code layer via:
- [`src/domain/content/language.ts`](file:///c:/Users/dina/Desktop/BAC%20&%20BEM/src/domain/content/language.ts):
  * `resolveEducationalContentLanguage(subjectId)` resolves non-language subjects to `"ar"`, French to `"fr"`, English to `"en"`.
  * `resolveContentDirection(lang)` sets direction (`rtl` for Arabic, `ltr` for French/English).
  * Separation of UI language state from educational content language state.
- **Content Factories**:
  * Mathematics packages: `sciences-exp-math-packages.ts` (Arabic)
  * Physics & Chemistry packages: `sciences-exp-physics-packages.ts` (Arabic)
  * Natural Sciences packages: `sciences-exp-snv-packages.ts` (Arabic)
  * Future French & English packages: Purely authored in target languages (`fr` / `en`).
