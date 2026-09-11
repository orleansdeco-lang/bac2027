# BAC Mastery — Mission Practice Engine Specification

> **Document Version:** 1.0.0  
> **Phase:** 04 — Mission Practice & Error Lab Engine  
> **Status:** Implemented & Verified (17/17 Unit Tests Passing)  
> **Core Philosophy:** *"ماشي واش تقرا. كيفاش توصل."* — Practice is not generic problem-solving; it is surgical bottleneck repair.

---

## 1. Executive Summary & Core Mission Loop

The Mission Practice Engine bridges the gap between diagnostic discovery and durable academic mastery. In traditional e-learning, students are given endless practice sets without contextual diagnosis or structured remediation. In **BAC Mastery**, practice follows a closed-loop evidence model:

$$\text{Diagnostic} \longrightarrow \text{Primary Bottleneck Candidate} \longrightarrow \text{Daily Mission} \longrightarrow \text{Targeted Practice} \longrightarrow \text{Error Lab} \longrightarrow \text{Guided Repair} \longrightarrow \text{Retest Twin} \longrightarrow \text{Demonstrated Mastery}$$

### Formative Mastery Principle
> **Critical Rule:** Answering a single practice question correctly does **NOT** constitute mastery.  
> Mastery is an evidence-backed state achieved when a student:
> 1. Completes a high-confidence direct practice question ($\text{Confidence} \ge 4$), OR
> 2. Identifies their error in the Error Lab $\to$ executes the 5–10 minute guided repair action $\to$ successfully solves an unseen twin retest variant.

---

## 2. Targeted Skills Architecture (Sciences Expérimentales)

The pilot engine provides **9 targeted skills** (3 per core subject) aligned with official Algerian BAC correction rubrics:

### 2.1 Mathematics (`math`)
1. **`math_derivatives_chain_rule`** — *اشتقاق الدوال المركبة وقاعدة السلسلة*
   - Dimensions: `knowledge`, `application`
   - Key Focus: Mastering $(e^{u(x)})' = u'(x)e^{u(x)}$ and $(\ln(u(x)))' = \frac{u'(x)}{u(x)}$ without omitting the inner derivative $u'(x)$.
2. **`math_intermediate_value_method`** — *مبرهنة القيم المتوسطة والتمييز بين الوجود والوحدانية*
   - Dimensions: `understanding`, `methodology`
   - Key Focus: Rigorous distinction between existence of solutions ($f$ continuous, $f(a) \cdot f(b) < 0$) and uniqueness ($f$ strictly monotonic).
3. **`math_sequence_reasoning`** — *الاستدلال بالتراجع ونهايات المتتاليات التراجعية*
   - Dimensions: `understanding`, `application`
   - Key Focus: Complete 3-step proof by induction and limit equation $L = f(L)$ for convergent sequences.

### 2.2 Physics-Chemistry (`physics`)
1. **`physics_rc_time_constant`** — *ثابت الزمن واستجابة ثنائي القطب RC*
   - Dimensions: `knowledge`, `application`
   - Key Focus: Identifying $\tau = RC$, unit dimensional analysis $[\tau] = T$, and the $63\%$ charging / $37\%$ discharging thresholds.
2. **`physics_newton_projections`** — *القانون الثاني لنيوتن والإسقاط على المستوي المائل*
   - Dimensions: `application`, `methodology`
   - Key Focus: Rigorous vector projection on inclined planes ($P_x = mg\sin\alpha$ vs $P_y = mg\cos\alpha$).
3. **`physics_decay_half_life`** — *قانون التناقص الإشعاعي وزمن نصف العمر*
   - Dimensions: `understanding`, `application`
   - Key Focus: Logarithmic decay kinetics $N(t) = N_0 e^{-\lambda t}$, $t_{1/2} = \frac{\ln 2}{\lambda}$, preventing linear decay traps.

### 2.3 Natural Sciences (`natural_sciences` / SVT)
1. **`snv_document_exploitation`** — *منهجية استغلال الوثائق في العلوم الطبيعية*
   - Dimensions: `methodology`, `application`
   - Key Focus: Official 4-step rubric (presentation $\to$ numerical comparative analysis $\to$ logical deduction $\to$ synthesis).
2. **`snv_protein_synthesis`** — *آليات ومقر تركيب البروتين*
   - Dimensions: `knowledge`, `understanding`
   - Key Focus: Strict cellular compartmentalization (nuclear transcription vs cytoplasmic ribosomal translation) and $5' \to 3'$ mRNA reading.
3. **`snv_immunity_reasoning`** — *الاستدلال المناعي ودور الأجسام المضادة*
   - Dimensions: `understanding`, `methodology`
   - Key Focus: Antibody neutralization via variable regions and macrophage phagocytosis via Fc constant region (preventing direct enzymatic lysis trap).

---

## 3. Question Bank & Twin Retest Architecture

Every skill is supported by a minimum of **two distinct questions**:
1. **Initial Practice Question (`pq-...`)**: Diagnoses initial competency and common traps.
2. **Paired Retest Variant (`rq-...`)**: A twin problem with identical pedagogical structure and difficulty, but altered numerical values, equations, or biological conditions.

$$\text{Total Pilot Questions} = 9 \text{ Skills} \times 2 \text{ Questions} = 18 \text{ Original Questions}$$

### Retest Coupling Rules
- Retest questions are explicitly tagged:
  ```ts
  isRetestVariant: true,
  retestForQuestionId: "pq-math-chain-01"
  ```
- Retest questions never repeat the exact initial prompt to eliminate surface-level rote recall.

---

## 4. Deterministic Mission Generator

The generator maps a student's diagnostic profile to their primary mission:

```ts
function generateMissionFromDiagnostic(diagnosticResult: DiagnosticAnalysisResult): Mission
```

### Deterministic Routing Rules:
1. **Mathematics Bottleneck**:
   - Chain-rule trap or `application` weakness $\longrightarrow$ `math_derivatives_chain_rule`
   - TVI trap or `understanding`/`methodology` weakness $\longrightarrow$ `math_intermediate_value_method`
   - Otherwise $\longrightarrow$ `math_sequence_reasoning`
2. **Physics Bottleneck**:
   - Projection/trig trap or `application` weakness $\longrightarrow$ `physics_newton_projections`
   - Decay trap or `understanding` weakness $\longrightarrow$ `physics_decay_half_life`
   - Otherwise $\longrightarrow$ `physics_rc_time_constant`
3. **Natural Sciences Bottleneck**:
   - Document/rote trap or `methodology` weakness $\longrightarrow$ `snv_document_exploitation`
   - Immune trap or `understanding` weakness $\longrightarrow$ `snv_immunity_reasoning`
   - Otherwise $\longrightarrow$ `snv_protein_synthesis`

---

## 5. Storage & State Persistence (`localStorage`)

All mission states persist on client-side storage under resilient namespace keys:

| Key | Type | Description |
| :--- | :--- | :--- |
| `bac_mastery_missions` | `Record<string, Mission>` | Registry of active, in-progress, and mastered missions. |
| `bac_mastery_active_mission_id` | `string` | The ID of the student's currently active roadmap mission. |
| `bac_mastery_practice_sessions` | `Record<string, PracticeSession>` | Audit log of attempts, selected answers, and elapsed times. |
| `bac_mastery_errors` | `Record<string, ErrorRecord>` | Comprehensive Error Lab registry. |
| `bac_mastery_mastery` | `Record<string, MasteryEvidence>` | Formative proofs of verified competence. |

---

## 6. Verification & Quality Gates

The Mission Practice Engine satisfies 100% of its contract criteria:
- **Zero external cloud dependencies**: No Supabase, Firebase Auth, or external database required.
- **Zero AI hallucinations**: Fixed, verified pedagogical rubrics designed for the Algerian BAC curriculum.
- **Full TypeScript strictness**: Zero `any`, clean interfaces across all domain entities.
- **Build Status**: 100% Next.js static and dynamic route compilation.
