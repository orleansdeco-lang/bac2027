# BAC Mastery V1 — Language & Typography Policy
**Linguistic Architecture, Bidirectional Text Layout & Pedagogical Medium Standards**
**Document Version**: 1.0.0 (V1 Completion Baseline)  
**Academic Year**: 2026–2027  

---

## 1. Architectural Decoupling: UI Locale vs Educational Content Language

One of the most common pitfalls in regional EdTech is confusing the user interface localization with the educational language of instruction.

**BAC Mastery V1 enforces strict technical decoupling**:

```
┌────────────────────────────────────────────────────────┐
│               STUDENT APP SHELL (UI LOCALE)            │
│   Choice of Arabic ('ar') or French ('fr') interface   │
│   (Navigation, buttons, headers, trial countdown)      │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             EDUCATIONAL CONTENT LANGUAGE               │
│   Determined SOLELY by National Curriculum Subject     │
│   - STEM & Humanities: Pure Educational Arabic (RTL)  │
│   - French Subject: Standard French (LTR)              │
│   - English Subject: Standard English (LTR)            │
│   - 3rd Foreign Language: Spanish/German/Italian (LTR) │
└────────────────────────────────────────────────────────┘
```

A student who chooses French as their app interface language because they prefer French navigation menus will still study Mathematics, Physics, and Natural Sciences in **Arabic**, because the Algerian national Baccalauréat examination in those streams is conducted in Arabic.

---

## 2. Subject Content Language Matrix

| Subject | Canonical ID | Content Language | Direction | Justification & Official Practice |
|:---|:---|:---:|:---:|:---|
| الرياضيات | `math` | `ar` | RTL | National syllabus: Arabic instruction with Latin function symbols ($f(x)$, $\lim$). |
| العلوم الفيزيائية | `physics` | `ar` | RTL | National syllabus: Arabic narrative, Latin unit symbols ($\text{mol}$, $\text{kg}$, $\text{s}$). |
| علوم الطبيعة والحياة | `natural_sciences` | `ar` | RTL | National syllabus: Arabic terminology, Latin biochemical nomenclature ($\text{ARN}$, $\text{ADN}$). |
| اللغة العربية وآدابها | `arabic` | `ar` | RTL | Official language of instruction and examination. |
| الفلسفة | `philosophy` | `ar` | RTL | Formal philosophical inquiry and essay composition in Arabic. |
| العلوم الإسلامية | `islamic_studies` | `ar` | RTL | Arabic Quranic exegesis and jurisprudential reasoning. |
| التاريخ والجغرافيا | `history_geography` | `ar` | RTL | National historical analysis and cartographic interpretation in Arabic. |
| التسيير المحاسبي والمالي | `accounting_finance` | `ar` | RTL | National financial accounting system (SCF) taught in Arabic. |
| الاقتصاد والمناجمنت | `economics_management` | `ar` | RTL | Micro/Macroeconomics and corporate management in Arabic. |
| القانون | `law` | `ar` | RTL | Algerian civil, commercial, and labor legislation in Arabic. |
| الهندسة المدنية | `civil_eng` | `ar` | RTL | Technical secondary syllabus: Arabic with standard engineering diagrams. |
| الهندسة الميكانيكية | `mechanical_eng` | `ar` | RTL | Technical secondary syllabus: Arabic with ISO engineering symbols. |
| الهندسة الكهربائية | `electrical_eng` | `ar` | RTL | Technical secondary syllabus: Arabic with IEEE/IEC logic symbols. |
| هندسة الطرائق | `process_eng` | `ar` | RTL | Technical secondary syllabus: Arabic with standard chemical equations. |
| اللغة الفرنسية | `french` | `fr` | LTR | Target language immersion: 100% French text and exercises. |
| اللغة الإنجليزية | `english` | `en` | LTR | Target language immersion: 100% English text and exercises. |
| اللغة الأجنبية الثالثة | `third_language` | `es`/`de`/`it` | LTR | Target language immersion: Spanish, German, or Italian. |

---

## 3. Bidirectional (BiDi) Typography & Mathematical Formatting

### 3.1 Mathematical Formula Integration in Arabic (RTL Context)
In the Algerian secondary curriculum, mathematical statements are embedded into right-to-left Arabic narrative while using Western/Latin mathematical symbols for variables and functions:

- **Equations & Expressions**: Rendered with KaTeX in inline or block format:
  - Example (Inline): تنعدم المشتقة $f'(x) = 0$ عند النقطة ذات الفاصلة $x = 1$.
  - Example (Display):
    $$\lim_{x \to +\infty} \frac{e^x}{x^2} = +\infty$$
- **Step-by-Step Proofs**: Narrative transitions flow in Arabic (إذن، بما أن، بالتعويض نجد), followed by indented centered mathematical derivations.

### 3.2 Terminology & Biochemical Acronyms
For Natural Sciences and Physical Sciences, official French/Latin acronyms frequently cited in the Arabic ministerial textbook are retained in brackets or as standard symbols:
- حمض ريبي نووي منقوص الأكسجين ($\text{ADN}$)
- حمض ريبي نووي رسول ($\text{ARNm}$)
- معقد التوافق النسيجي الرئيسي ($\text{CMH}$)
- زمن نصف التفاعل ($t_{1/2}$)
- الناقلية النوعية ($\sigma$)

---

## 4. Linguistic Quality Standards

1. **Authentic Algerian Educational Arabic**:
   - Content must reflect the natural phrasing, dignified academic register, and precise technical phrasing used by Algerian national education inspectors.
   - Expressions must conform to official exam phrasing (e.g., استنتج، فسر، علل، أثبت، عين، ناقش بيانياً).
2. **Prohibition of Machine-Translation Calques**:
   - Phrases translated mechanically from foreign sources (e.g., literal French calques that distort Arabic syntax) are strictly rejected during the Fact-Checking and Pedagogical Review phases.
3. **Typography & Readability**:
   - Clean Arabic fonts with generous line height (1.6 to 1.8) and clear diacritical markers (*tashkeel*) where ambiguity would impair mathematical understanding (e.g., مُميِّز vs مُميَّز).
