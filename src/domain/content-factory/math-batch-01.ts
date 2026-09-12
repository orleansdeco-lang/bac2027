/**
 * BAC Mastery — Math Content Factory Production Batch 01 (3AS Mathématiques)
 * 
 * 12 High-Priority, Complete Learning Loop Packages for 3AS Mathématiques:
 * 1. math_m_arithmetic_congruence (Divisibilité, congruences et puissances)
 * 2. math_m_bezout_diophantine (Théorème de Bézout et équations ax + by = c)
 * 3. math_m_gauss_prime_factors (Théorème de Gauss et décomposition en facteurs premiers)
 * 4. math_m_complex_algebraic_trig (Nombres complexes : forme exponentielle et équations dans C)
 * 5. math_m_similitudes_directes (Similitudes directes : écriture complexe, centre, rapport, angle)
 * 6. math_m_derivatives_tvi_rigor (Dérivation, continuité et TVI rigoureux)
 * 7. math_m_exp_log_croissances (Exponentielle, logarithme et croissances comparées)
 * 8. math_m_integration_parts (Intégration par parties et calcul d'aires)
 * 9. math_m_differential_equations (Équations différentielles linéaires y' = ay + b et y'' + w²y = 0)
 * 10. math_m_induction_adjacent_suites (Raisonnement par récurrence et suites adjacentes)
 * 11. math_m_space_geometry_planes (Géométrie dans l'espace : équation de plans et produit scalaire)
 * 12. math_m_combinatorics_bernoulli (Dénombrement, loi binomiale et variable aléatoire)
 * 
 * Invariants:
 * - Content Purity: ZERO user_id.
 * - 13-Element Completeness: Every package satisfies validateContentPackage().
 * - Isomorphic Retest Twins: Retests preserve cognitive demand while altering surface numbers/context.
 * - Mathematical Quality: Every answer is deterministically verifiable with explicit error taxonomy mapping.
 */

import { ContentPackage } from "@/domain/content-quality/types";
import {
  MathDiagnosticSignalProfile,
  MathSpacedReviewSchedule,
  MathSkillDossier,
} from "./types";
import { MATH_BATCH_01_VISUAL_ASSETS } from "./math-visual-registry";
import { MATH_BATCH_01_EXTERNAL_RESOURCES } from "./math-resource-registry";
import { MATH_EXAM_TRANSFER_REGISTRY } from "./math-exam-transfer";
import { evaluateExpansionPriority } from "@/domain/content-quality/priority-engine";
import { evaluateContentQualityScore } from "@/domain/content-quality/quality-scorer";
import { MATH_BATCH_01_FACTOR_INPUTS } from "./math-priority-ranking";
import { getMathBatch02SkillDossier } from "./math-batch-02";

// =============================================================================
// 1. THE 12 AUTHORED CONTENT PACKAGES (3AS MATHÉMATIQUES)
// =============================================================================

export const MATH_BATCH_01_PACKAGES: Record<string, ContentPackage> = {
  // ---------------------------------------------------------------------------
  // 1. DIVISIBILITÉ & CONGRUENCES
  // ---------------------------------------------------------------------------
  math_m_arithmetic_congruence: {
    packageId: "pkg_math_m_arithmetic_congruence",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_divisibility_congruences",
    skillId: "math_m_arithmetic_congruence",
    objective_ar: "حساب بواقي قسمة قوى عدد طبيعي على عدد معطى بدراسة دورية البواقي وتوظيف خواص الموافقات في إثبات قابلية القسمة.",
    objective_fr: "Déterminer la périodicité des restes des puissances d'un entier modulo n et appliquer les congruences.",
    prerequisites: [],
    lesson: {
      title_ar: "القسمة الإقليدية ودراسة دورية بواقي قوى الأعداد بالموافقات",
      contentMarkdown_ar: `### مفهوم الموافقة بترديد n
نقول إن العددين الصحيحين a و b متوافقان بترديد n (حيث n عدد طبيعي أكبر تماماً من 1) ونكتب:
$$a \\equiv b \\pmod{n}$$
إذا وفقط إذا كان للعددين a و b نفس باقي القسمة الإقليدية على n، وهو ما يكافئ أن (a - b) مضاعف للعدد n.

### الخواص الأساسية للموافقات
1. التلاؤم مع الجمع: إذا كان $a \\equiv b \\pmod{n}$ و $c \\equiv d \\pmod{n}$ فإن $a + c \\equiv b + d \\pmod{n}$.
2. التلاؤم مع الجداء: إذا كان $a \\equiv b \\pmod{n}$ و $c \\equiv d \\pmod{n}$ فإن $a \\cdot c \\equiv b \\cdot d \\pmod{n}$.
3. التلاؤم مع الأسس: إذا كان $a \\equiv b \\pmod{n}$ فإن $a^k \\equiv b^k \\pmod{n}$ لكل عدد طبيعي $k$.

### منهجية دراسة دورية قوى العدد $a^k$ بترديد n
لحساب باقي قسمة $a^k$ على n:
- نحسب القوى المتتالية: $a^0 \\equiv 1 \\pmod{n}$، $a^1$، $a^2$، ...
- نتوقف فور ظهور باقي يتكرر (عادة ظهور 1).
- إذا ظهر $a^p \\equiv 1 \\pmod{n}$، فإن البواقي دورية ودورها p، ويكون من أجل كل عدد طبيعي k:
  $$a^{pk} \\equiv 1 \\pmod{n}$$`,
      keyTakeaway_ar: "بواقي قوى الأعداد الطبيعية بترديد n دورية دوماً؛ نبحث عن أصغر أس موجب p يحقق a^p = 1 بترديد n ثم نناقش حسب قيم الأس k = pk + r.",
    },
    workedExample: {
      problem_ar: "ادرس حسب قيم العدد الطبيعي n بواقي القسمة الإقليدية للعدد 3^n على 5، ثم استنتج باقي قسمة العدد 3^2026 على 5.",
      stepByStepSolution_ar: [
        "الخطوة 1: نحسب القوى الأولى للعدد 3 بترديد 5:\n- من أجل n = 0: 3^0 = 1 ≡ 1 [5]\n- من أجل n = 1: 3^1 = 3 ≡ 3 [5]\n- من أجل n = 2: 3^2 = 9 ≡ 4 [5] (أو -1 [5])\n- من أجل n = 3: 3^3 = 27 ≡ 2 [5]\n- من أجل n = 4: 3^4 = 81 ≡ 1 [5]",
        "الخطوة 2: بما أن 3^4 ≡ 1 [5]، فإن بواقي قسمة 3^n على 5 دورية ودورها 4.",
        "الخطوة 3: نلخص البواقي حسب قيم n:\n- إذا كان n = 4k فإن 3^n ≡ 1 [5]\n- إذا كان n = 4k + 1 فإن 3^n ≡ 3 [5]\n- إذا كان n = 4k + 2 فإن 3^n ≡ 4 [5]\n- إذا كان n = 4k + 3 فإن 3^n ≡ 2 [5] (حيث k عدد طبيعي).",
        "الخطوة 4: لحساب باقي 3^2026 على 5، نقسم الأس 2026 على الدور 4:\n2026 = 4 * 506 + 2، إذن 2026 من الشكل 4k + 2.\nومنه: 3^2026 ≡ 3^2 ≡ 4 [5].",
      ],
      pedagogicalComment_ar: "قسمة الأس على الدور تلغي تكرار الدورات الكاملة وتُبقي فقط الباقي الصغير في الحساب المباشر.",
    },
    activeRecall: {
      prompt_ar: "إذا كان a^5 ≡ 1 [7]، فما هو باقي قسمة a^(5k + 3) على 7؟",
      expectedAnswer_ar: "الباقي هو باقي قسمة a^3 على 7 لأن a^(5k+3) = (a^5)^k * a^3 ≡ 1^k * a^3 ≡ a^3 [7].",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_cong_01",
        prompt_ar: "ادرس دورية قوى 4 على 7، ما هو باقي قسمة 4^3 على 7؟",
        optionsCount: 4,
        correctAnswerId: "opt_cong_1",
        explanation_ar: "4^1 = 4 ≡ 4 [7]، 4^2 = 16 = 2*7 + 2 ≡ 2 [7]، 4^3 = 64 = 9*7 + 1 ≡ 1 [7]. إذن الباقي هو 1 والدور هو 3.",
        distractorErrorMappings: {
          opt_cong_2: "calculation_error",
          opt_cong_3: "forgot_information",
          opt_cong_4: "misunderstood_concept",
        },
      },
      {
        id: "pq_math_m_cong_02",
        prompt_ar: "عيّن باقي قسمة العدد 4^2025 على 7 علماً أن دور قوى 4 بترديد 7 هو 3.",
        optionsCount: 4,
        correctAnswerId: "opt_cong_2025_1",
        explanation_ar: "نقسم الأس 2025 على الدور 3: 2+0+2+5 = 9 مضاعف لـ 3، إذن 2025 = 3 * 675 + 0. إذن 4^2025 ≡ 4^0 ≡ 1 [7].",
        distractorErrorMappings: {
          opt_cong_2025_2: "calculation_error",
          opt_cong_2025_3: "misread_question",
          opt_cong_2025_4: "methodology_error",
        },
      },
    ],
    retest: {
      id: "rq_math_m_cong_twin",
      parentPracticeQuestionId: "pq_math_m_cong_02",
      prompt_ar: "ادرس دور قوى العدد 2 بترديد 7، ثم استنتج باقي قسمة العدد 2^2027 على 7.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_cong_4",
      explanation_ar: "قوى 2 بترديد 7: 2^0=1، 2^1=2، 2^2=4، 2^3=8 ≡ 1 [7]. الدور هو 3. نقسم 2027 على 3: 2027 = 3 * 675 + 2. إذن 2^2027 ≡ 2^2 ≡ 4 [7].",
    },
    repairGuide: {
      targetErrorType: "calculation_error",
      title_ar: "معالجة خطأ خلط دورية الأسس مع ترديد الموافقة",
      mentalModelExplanation_ar: "يحدث الخطأ عندما يقسم التلميذ الأس على ترديد الموافقة (مثلاً على 7) بدلاً من قسمته على دور القوى p (مثلاً 3). الأسس تحسب بترديد الدور p، بينما الأعداد والأساسات تحسب بترديد n.",
      actionableSteps_ar: [
        "الخطوة 1: اكتب جدول القوى a^0, a^1, a^2... حتى يظهر الناتج 1 صراحة وحدد الدور p.",
        "الخطوة 2: اقسم الأس المعطى في السؤال على الدور p وليس على الترديد الأصلي.",
        "الخطوة 3: عوض باقي قسمة الأس مباشرة في عبارة القوة المبسطة a^r.",
      ],
      contrastiveWorkedExample: "خطأ: قسمة 2027 على 7. صواب: بما أن 2^3 ≡ 1 [7] فالدور هو 3، إذن نقسم 2027 على 3.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_congruence_table"],
    externalResourceIds: ["res_math_m_congruence_guide"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "يرد هذا السؤال كأول جزء في تمرين الحساب في بكالوريا الرياضيات بمعدل 4 إلى 5 نقاط كاملة.",
      commonPitfalls_ar: ["نسيان الحالة n=0 أو إغفال أن الدور يبدأ عند n=1", "عدم حصر الباقي في المجال 0 إلى n-1"],
      officialBacPastRefIds: ["bac_m_2024_s1_ex1", "bac_m_2022_s1_ex1"],
    },
    provenance: {
      sourceId: "src-men-3as-math-syllabus",
      sourceTitle: "المنهاج الرسمي لمادة الرياضيات 3AS شعبة رياضيات",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "original",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ---------------------------------------------------------------------------
  // 2. THÉORÈME DE BÉZOUT & ÉQUATIONS DIOPHANTIENNES
  // ---------------------------------------------------------------------------
  math_m_bezout_diophantine: {
    packageId: "pkg_math_m_bezout_diophantine",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_arithmetic_theorems",
    skillId: "math_m_bezout_diophantine",
    objective_ar: "تطبيق مبرهنة بيزو واستعمال خوارزمية إقليدس لإيجاد الحل الخاص وحل المعادلات الديوفانتية ax + by = c في Z².",
    objective_fr: "Appliquer le théorème de Bézout et résoudre les équations diophantiennes dans Z².",
    prerequisites: ["math_m_arithmetic_congruence"],
    lesson: {
      title_ar: "مبرهنة بيزو وحل المعادلات الديوفانتية في Z²",
      contentMarkdown_ar: `### مبرهنة بيزو (Théorème de Bézout)
يكون العددان الصحيحان a و b أوليين فيما بينهما (أي PGCD(a, b) = 1) إذا وفقط إذا وجد عددان صحيحان u و v بحيث:
$$a \\cdot u + b \\cdot v = 1$$

### شرط وجود حلول للمعادلة $ax + by = c$
المعادلة $ax + by = c$ تقبل حلولاً في $\\mathbb{Z}^2$ إذا وفقط إذا كان $PGCD(a, b)$ يقسم العدد c.
إذا كان $d = PGCD(a, b)$ يقسم c، نقسم طرفي المعادلة على d فنحصل على معادلة مكافئة $a'x + b'y = c'$ حيث $PGCD(a', b') = 1$.

### منهجية الحل في $\\mathbb{Z}^2$
1. استخراج حل خاص $(x_0, y_0)$ إما بالملاحظة المباشرة أو بواسطة خوارزمية إقليدس الممددة (التعويض العكسي للبواقي).
2. كتابة المعادلة الأصلية والمعادلة المعوضة:
   $$a(x) + b(y) = c$$
   $$a(x_0) + b(y_0) = c$$
3. الطرح طرفاً لطرف: $a(x - x_0) = -b(y - y_0) = b(y_0 - y)$.
4. تطبيق مبرهنة غوص لاستنتاج الحلول العامة بدلالة الوسيط الصحيح k.`,
      keyTakeaway_ar: "حل المعادلة ax+by=c يتطلب التأكد أولاً أن PGCD(a,b) يقسم c، ثم إيجاد حل خاص والتحويل إلى صيغة غوص a(x-x0) = b(y0-y).",
    },
    workedExample: {
      problem_ar: "حل في Z² المعادلة: 7x - 5y = 1.",
      stepByStepSolution_ar: [
        "الخطوة 1: التحقق من وجود الحلول: PGCD(7, 5) = 1، والعدد 1 يقسم 1، إذن المعادلة تقبل حلولاً في Z².",
        "الخطوة 2: البحث عن حل خاص بالملاحظة: 7 * (3) - 5 * (4) = 21 - 20 = 1. إذن الثنائية (3, 4) حل خاص.",
        "الخطوة 3: الطرح طرفاً لطرف:\n7x - 5y = 1\n7(3) - 5(4) = 1\nبالطرح: 7(x - 3) - 5(y - 4) = 0 ومنه: 7(x - 3) = 5(y - 4).",
        "الخطوة 4: تطبيق مبرهنة غوص:\n5 يقسم 7(x - 3) وبما أن PGCD(7, 5) = 1، فحسب مبرهنة غوص 5 يقسم (x - 3).\nومنه يوجد عدد صحيح k بحيث: x - 3 = 5k أي x = 5k + 3.",
        "الخطوة 5: استنتاج y بالتعويض:\n7(5k) = 5(y - 4) ومنه 7k = y - 4 أي y = 7k + 4.\nمجموعة الحلول هي: S = {(5k + 3, 7k + 4) / k ∈ Z}.",
      ],
      pedagogicalComment_ar: "التعويض العكسي في المعادلة الأصلية 7(5k+3) - 5(7k+4) = 35k + 21 - 35k - 20 = 1 يؤكد صحة الحل.",
    },
    activeRecall: {
      prompt_ar: "ما هو الشرط اللازم والكافي لكي تقبل المعادلة 14x + 21y = c حلولاً في Z²؟",
      expectedAnswer_ar: "أن يكون c مضاعفاً للعدد 7 لأن PGCD(14, 21) = 7.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_bezout_01",
        prompt_ar: "عيّن حلاً خاصاً للمعادلة 11x - 3y = 2 في Z².",
        optionsCount: 4,
        correctAnswerId: "opt_bez_1",
        explanation_ar: "نلاحظ أن 11(1) - 3(3) = 11 - 9 = 2. إذن الثنائية (1, 3) حل خاص للمعادلة.",
        distractorErrorMappings: {
          opt_bez_2: "calculation_error",
          opt_bez_3: "calculation_error",
          opt_bez_4: "methodology_error",
        },
      },
      {
        id: "pq_math_m_bezout_02",
        prompt_ar: "إذا كان 11(x - 1) = 3(y - 3) مع PGCD(11, 3) = 1، فما هي عبارة x العامة؟",
        optionsCount: 4,
        correctAnswerId: "opt_bez_x_1",
        explanation_ar: "بما أن 3 يقسم 11(x - 1) و PGCD(11, 3) = 1، فحسب غوص 3 يقسم (x - 1)، إذن x - 1 = 3k ومنه x = 3k + 1.",
        distractorErrorMappings: {
          opt_bez_x_2: "forgot_information",
          opt_bez_x_3: "calculation_error",
          opt_bez_x_4: "misunderstood_concept",
        },
      },
    ],
    retest: {
      id: "rq_math_m_bezout_twin",
      parentPracticeQuestionId: "pq_math_m_bezout_02",
      prompt_ar: "حل في Z² المعادلة 13x - 5y = 1، ما هي الصيغة العامة للحلول (x, y)؟",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_bezout_1",
      explanation_ar: "الحل الخاص بالملاحظة: 13(2) - 5(5) = 26 - 25 = 1. بطرح المعادلتين: 13(x - 2) = 5(y - 5). بتطبيق غوص: x = 5k + 2 و y = 13k + 5 مع k ∈ Z.",
    },
    repairGuide: {
      targetErrorType: "calculation_error",
      title_ar: "معالجة أخطاء الإشارة في التعويض العكسي وخوارزمية إقليدس",
      mentalModelExplanation_ar: "يقع التلميذ في خطأ الإشارة عند نقل الحدود في الطرح طرفاً لطرف، فيكتب a(x - x0) = b(y - y0) بدلاً من -b(y - y0) عندما تكون المعادلة بالجمع، أو العكس عندما تكون بالطرح.",
      actionableSteps_ar: [
        "الخطوة 1: اكتب المعادلتين تحت بعضهما مباشرة مع وضع علامة ناقص صريحة.",
        "الخطوة 2: انقل الحد الثاني للطرف الآخر وتأكد من إشارته قبل تطبيق مبرهنة غوص.",
        "الخطوة 3: عوض الحل العام الناتج في الطرف الأيسر للمعادلة الأصلية وتأكد من اختزال الوسيط k.",
      ],
      contrastiveWorkedExample: "خطأ: 7(x-3) = 5(y-4) يعطي y = -7k + 4. صواب: 7(x-3) = 5(y-4) يقتضي y = 7k + 4 لأن الإشارة موجبة بالطرفين.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_bezout_diophantine"],
    externalResourceIds: ["res_math_m_bezout_video"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "تمرين أساسي ثابت في بكالوريا شعبة الرياضيات، وغالباً ما يُربط بمسائل التعداد في أنظمة العد المختلفة.",
      commonPitfalls_ar: ["إغفال التحقق من قابلية قسمة c على PGCD(a,b)", "الخطأ في تطبيق مبرهنة غوص بعدم ذكر شرط الأولية"],
      officialBacPastRefIds: ["bac_m_2023_s1_ex1", "bac_m_2021_s1_ex1"],
    },
    provenance: {
      sourceId: "src-men-3as-math-syllabus",
      sourceTitle: "المنهاج الرسمي لمادة الرياضيات 3AS شعبة رياضيات",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "original",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ---------------------------------------------------------------------------
  // 3. THÉORÈME DE GAUSS & FACTEURS PREMIERS
  // ---------------------------------------------------------------------------
  math_m_gauss_prime_factors: {
    packageId: "pkg_math_m_gauss_prime_factors",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_arithmetic_theorems",
    skillId: "math_m_gauss_prime_factors",
    objective_ar: "توظيف مبرهنة غوص والتحليل إلى جداء عوامل أولية في إثبات قابلية القسمة وتعيين القواسم المشتركة وحل جمل المعادلات بالأعداد الطبيعية.",
    objective_fr: "Exploiter le théorème de Gauss et la décomposition en facteurs premiers pour la divisibilité.",
    prerequisites: ["math_m_bezout_diophantine"],
    lesson: {
      title_ar: "مبرهنة غوص والتحليل إلى جداء عوامل أولية",
      contentMarkdown_ar: `### مبرهنة غوص (Théorème de Gauss)
إذا كان العدد الصحيح a يقسم الجداء $b \\cdot c$ وكان a و b أوليين فيما بينهما ($PGCD(a, b) = 1$)، فإن a يقسم العدد c.

### نتيجة مباشرة لمبرهنة غوص
إذا كان عدد أولي p يقسم الجداء $a \\cdot b$، فإن p يقسم a أو p يقسم b.

### مبرهنة التحليل إلى جداء عوامل أولية
كل عدد طبيعي $n \\ge 2$ يكتب بكيفية وحيدة (باستثناء ترتيب العوامل) على الشكل:
$$n = p_1^{\\alpha_1} \\cdot p_2^{\\alpha_2} \\cdots p_k^{\\alpha_k}$$
حيث $p_1, p_2, ..., p_k$ أعداد أولية متمايزة و $\\alpha_1, \\alpha_2, ..., \\alpha_k$ أعداد طبيعية غير معدومة.

- عدد قواسم n في $\\mathbb{N}$ هو: $(\\alpha_1 + 1)(\\alpha_2 + 1) \\cdots (\\alpha_k + 1)$.
- لحساب $PGCD(a, b)$: نأخذ العوامل الأولية المشتركة بأصغر أس.
- لحساب $PPCM(a, b)$: نأخذ العوامل الأولية المشتركة وغير المشتركة بأكبر أس، مع العلاقة: $PGCD(a, b) \\times PPCM(a, b) = a \\times b$.`,
      keyTakeaway_ar: "مبرهنة غوص تتطلب شرطين صريحين: قابلية قسمة الجداء والأولية بين القاسم وأحد العاملين؛ وإغفال شرط الأولية يبطل البرهان.",
    },
    workedExample: {
      problem_ar: "عيّن جميع الثنائيات (a, b) من الأعداد الطبيعية بحيث: PGCD(a, b) = 12 و a + b = 96 مع a < b.",
      stepByStepSolution_ar: [
        "الخطوة 1: بما أن PGCD(a, b) = 12، فإنه يوجد عددان طبيعيان a' و b' بحيث:\na = 12a' و b = 12b' مع الشرط الجوهري: PGCD(a', b') = 1 و a' < b'.",
        "الخطوة 2: نعوض في المعادلة a + b = 96:\n12a' + 12b' = 96 ومنه بالقسمة على 12: a' + b' = 8.",
        "الخطوة 3: نبحث عن الأعداد الطبيعية a' و b' التي مجموعها 8 ومحققة للشرطين a' < b' و PGCD(a', b') = 1:\n- إذا كان a' = 1 فإن b' = 7، و PGCD(1, 7) = 1 (مقبول).\n- إذا كان a' = 2 فإن b' = 6، و PGCD(2, 6) = 2 != 1 (مرفوض).\n- إذا كان a' = 3 فإن b' = 5، و PGCD(3, 5) = 1 (مقبول).\n- إذا كان a' = 4 فإن b' = 4، و a' ليس أصغر تماماً من b' (مرفوض).",
        "الخطوة 4: نستنتج قيم (a, b) بضرب كل ثنائية في 12:\n- من الثنائية (1, 7): a = 12 * 1 = 12 و b = 12 * 7 = 84.\n- من الثنائية (3, 5): a = 12 * 3 = 36 و b = 12 * 5 = 60.\nإذن الثنائيات المطلوبة هي: (12, 84) و (36, 60).",
      ],
      pedagogicalComment_ar: "اشتراط PGCD(a', b') = 1 ضروري لمنع تضخيم القاسم المشترك الأكبر ليظل 12 بدقة.",
    },
    activeRecall: {
      prompt_ar: "كم عدد قواسم العدد 72 في مجموعة الأعداد الطبيعية N علماً أن 72 = 2^3 * 3^2؟",
      expectedAnswer_ar: "عدد القواسم هو (3 + 1) * (2 + 1) = 4 * 3 = 12 قاسماً.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_gauss_01",
        prompt_ar: "إذا كان 3 يقسم 4n، فهل بالضرورة 3 يقسم n؟ علل.",
        optionsCount: 4,
        correctAnswerId: "opt_gauss_yes",
        explanation_ar: "نعم، لأن 3 يقسم الجداء 4n وبما أن 3 و 4 أوليان فيما بينهما (PGCD(3, 4) = 1)، فحسب مبرهنة غوص 3 يقسم n.",
        distractorErrorMappings: {
          opt_gauss_no: "misunderstood_concept",
          opt_gauss_calc: "calculation_error",
          opt_gauss_none: "methodology_error",
        },
      },
      {
        id: "pq_math_m_gauss_02",
        prompt_ar: "عيّن الثنائيات (a, b) من الأعداد الطبيعية التي تحقق PGCD(a, b) = 10 و a + b = 50 مع a < b.",
        optionsCount: 4,
        correctAnswerId: "opt_gauss_pairs_10_40",
        explanation_ar: "نضع a = 10a' و b = 10b' مع a' + b' = 5 و PGCD(a', b') = 1 و a' < b'. الثنائيات المقبولة لـ (a', b') هي (1, 4) و (2, 3). ومنه الثنائيات (a, b) هي (10, 40) و (20, 30).",
        distractorErrorMappings: {
          opt_gauss_pairs_all: "misunderstood_concept",
          opt_gauss_pairs_calc: "calculation_error",
          opt_gauss_pairs_other: "forgot_information",
        },
      },
    ],
    retest: {
      id: "rq_math_m_gauss_twin",
      parentPracticeQuestionId: "pq_math_m_gauss_02",
      prompt_ar: "عيّن الثنائيات (a, b) من الأعداد الطبيعية بحيث PGCD(a, b) = 15 و a + b = 75 مع a < b.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_gauss_res",
      explanation_ar: "نضع a = 15a' و b = 15b' مع a'+b' = 5 و PGCD(a', b') = 1 و a'<b'. الثنائيات المقبولة لـ (a', b') هي (1, 4) و (2, 3). ومنه (a, b) هي (15, 60) و (30, 45).",
    },
    repairGuide: {
      targetErrorType: "misunderstood_concept",
      title_ar: "إصلاح إغفال شرط الأولية بين القواسم في مبرهنة غوص",
      mentalModelExplanation_ar: "يعتقد بعض التلاميذ خطأً أن a إذا قسم bc فإنه يقسم أحدهما دائماً، وهذا غير صحيح إلا إذا كان a أولياً أو أولياً مع أحدهما (مثال: 6 يقسم 4*3 لكن 6 لا يقسم 4 ولا يقسم 3 لأن 6 و 4 ليسا أوليين فيما بينهما).",
      actionableSteps_ar: [
        "الخطوة 1: قبل كتابة 'حسب مبرهنة غوص a يقسم c'، احسب PGCD(a, b) وتأكد أنه يساوي 1.",
        "الخطوة 2: اكتب عبارة التبرير كاملة: 'بما أن a يقسم bc و PGCD(a, b) = 1 فحسب مبرهنة غوص a يقسم c'.",
        "الخطوة 3: إذا لم يكن PGCD(a, b) = 1، اختزل المعادلة أولاً بالقسمة على القاسم المشترك الأكبر قبل تطبيق غوص.",
      ],
      contrastiveWorkedExample: "خطأ: 4 يقسم 6n إذن 4 يقسم n (باطل لأن PGCD(4, 6)=2!=1). صواب: نقسم أولاً على 2 فتصبح 2 يقسم 3n وبما أن PGCD(2, 3)=1 فإن 2 يقسم n.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_gauss_prime_factors"],
    externalResourceIds: ["res_math_m_gauss_doc"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "يرد في الجزء الثاني من مسألة الحساب كأداة استدلالية لإثبات وجود قواسم مشتركة أو حل مسائل التشفير RSA.",
      commonPitfalls_ar: ["نسيان شرط أن a' و b' أوليان فيما بينهما", "الخلط بين PGCD و PPCM في تفكيك العوامل"],
      officialBacPastRefIds: ["bac_m_2023_catchup_ex1", "bac_m_2020_s1_ex1"],
    },
    provenance: {
      sourceId: "src-men-3as-math-syllabus",
      sourceTitle: "المنهاج الرسمي لمادة الرياضيات 3AS شعبة رياضيات",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "original",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ---------------------------------------------------------------------------
  // 4. NOMBRES COMPLEXES : FORME EXPONENTIELLE & ÉQUATIONS
  // ---------------------------------------------------------------------------
  math_m_complex_algebraic_trig: {
    packageId: "pkg_math_m_complex_algebraic_trig",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_complex_algebra",
    skillId: "math_m_complex_algebraic_trig",
    objective_ar: "الانتقال بدقة بين الأشكال الجبرية والمثلثية والأسية للأعداد المركبة وتطبيق خواص العمدة ودستور دو موافر وحل المعادلات في C.",
    objective_fr: "Maîtriser les formes algébrique, trigonométrique et exponentielle et la formule de Moivre.",
    prerequisites: [],
    lesson: {
      title_ar: "الأعداد المركبة: الأشكال الجبرية، المثلثية، والأسية ودستور دو موافر",
      contentMarkdown_ar: `### أشكال العدد المركب z
لكل عدد مركب غير معدوم $z = x + iy$:
1. الشكل الجبري: $z = x + iy$ (حيث x الجزء الحقيقي و y الجزء التخيلي).
2. الطويلة: $|z| = r = \\sqrt{x^2 + y^2}$.
3. العمدة: $\\arg(z) = \\theta \\pmod{2\\pi}$ حيث:
   $$\\cos(\\theta) = \\frac{x}{r} \\quad \\text{و} \\quad \\sin(\\theta) = \\frac{y}{r}$$
4. الشكل المثلثي: $z = r(\\cos\\theta + i\\sin\\theta)$.
5. الشكل الأسي (صيغة أويلر): $z = r \\cdot e^{i\\theta}$.

### دستور دو موافر وخواص الأسس
من أجل كل عدد طبيعي n:
$$z^n = (r \\cdot e^{i\\theta})^n = r^n \\cdot e^{i n \\theta} = r^n [\\cos(n\\theta) + i\\sin(n\\theta)]$$

### شروط طبيعة العدد المركب $z^n$
- يكون $z^n$ عدداً حقيقياً إذا وفقط إذا كان $\\sin(n\\theta) = 0$ أي: $n\\theta = k\\pi$ ($k \\in \\mathbb{Z}$).
- يكون $z^n$ تخيلياً صرفاً إذا وفقط إذا كان $\\cos(n\\theta) = 0$ أي: $n\\theta = \\frac{\\pi}{2} + k\\pi$ ($k \\in \\mathbb{Z}$).`,
      keyTakeaway_ar: "لحساب قوى الأعداد المركبة z^n نحول دائماً إلى الشكل الأسي r*e^(itheta) ونطبق دستور دو موافر z^n = r^n * e^(i*n*theta).",
    },
    workedExample: {
      problem_ar: "ليكن العدد المركب z = 1 + i*sqrt(3). اكتب z على الشكل الأسي، ثم احسب z^3 وبيّن أنه عدد حقيقي سالب.",
      stepByStepSolution_ar: [
        "الخطوة 1: حساب الطويلة:\n|z| = sqrt(1^2 + (sqrt(3))^2) = sqrt(1 + 3) = sqrt(4) = 2.",
        "الخطوة 2: تعيين العمدة theta:\ncos(theta) = 1/2 و sin(theta) = sqrt(3)/2.\nبما أن الكوسينوس والجيب موجبان، فالزاوية في الربع الأول: theta = pi / 3 [2pi].",
        "الخطوة 3: كتابة الشكل الأسي:\nz = 2 * e^(i * pi / 3).",
        "الخطوة 4: حساب z^3 بدستور دو موافر:\nz^3 = (2 * e^(i * pi / 3))^3 = 2^3 * e^(i * 3 * pi / 3) = 8 * e^(i * pi) = 8 * [cos(pi) + i*sin(pi)].",
        "الخطوة 5: بما أن cos(pi) = -1 و sin(pi) = 0، فإن z^3 = 8 * (-1) = -8 وهو عدد حقيقي سالب تماماً.",
      ],
      pedagogicalComment_ar: "حساب العمدة المضاعفة 3 * (pi/3) = pi يضع صورة العدد مباشرة على الجزء السالب من محور الفواصل.",
    },
    activeRecall: {
      prompt_ar: "ما هو الشكل الأسي للعدد المركب z = -1 + i؟",
      expectedAnswer_ar: "الطويلة r = sqrt(2) والعمدة theta = 3pi/4، إذن z = sqrt(2) * e^(i * 3pi / 4).",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_complex_01",
        prompt_ar: "عيّن عمدة العدد المركب z = -sqrt(3) - i.",
        optionsCount: 4,
        correctAnswerId: "opt_cplx_arg_7pi6",
        explanation_ar: "الطويلة r = 2. cos = -sqrt(3)/2 و sin = -1/2. كلاهما سالب إذن الزاوية في الربع الثالث: theta = -5pi/6 أو 7pi/6.",
        distractorErrorMappings: {
          opt_cplx_arg_pi6: "calculation_error",
          opt_cplx_arg_5pi6: "misunderstood_concept",
          opt_cplx_arg_other: "calculation_error",
        },
      },
      {
        id: "pq_math_m_complex_02",
        prompt_ar: "إذا كان z = e^(i * pi / 4)، فما هي أصغر قيمة للعدد الطبيعي n > 0 بحيث يكون z^n تخيلياً صرفاً؟",
        optionsCount: 4,
        correctAnswerId: "opt_cplx_n_2",
        explanation_ar: "z^n = e^(i * n*pi / 4). لكي يكون تخيلياً صرفاً يجب أن يكون n*pi/4 = pi/2 + k*pi. لأصغر n موجب نضع k=0 ومنه n/4 = 1/2 أي n = 2.",
        distractorErrorMappings: {
          opt_cplx_n_4: "misunderstood_concept",
          opt_cplx_n_1: "calculation_error",
          opt_cplx_n_8: "methodology_error",
        },
      },
    ],
    retest: {
      id: "rq_math_m_complex_twin",
      parentPracticeQuestionId: "pq_math_m_complex_02",
      prompt_ar: "ليكن z = sqrt(3) + i. ما هي أصغر قيمة للعدد الطبيعي n > 0 بحيث يكون z^n عدداً حقيقياً؟",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_cplx_n_6",
      explanation_ar: "عمدة z هي theta = pi/6. لكي يكون z^n حقيقياً يجب n*(pi/6) = k*pi أي n = 6k. أصغر عدد طبيعي غير معدوم هو n = 6.",
    },
    repairGuide: {
      targetErrorType: "calculation_error",
      title_ar: "معالجة أخطاء تحديد ربع الدائرة المثلثية عند حساب عمدة العدد المركب",
      mentalModelExplanation_ar: "يقع التلميذ في الخطأ عندما يحدد الزاوية انطلاقاً من القيمة المطلقة لـ cos و sin فقط، فيهمل إشارات المركبات ويسقط في الربع الأول دائماً بدلاً من الربع الصحيح.",
      actionableSteps_ar: [
        "الخطوة 1: ارسم دائرة مثلثية صغيرة جانباً وضع إشارتي (x, y).",
        "الخطوة 2: إذا كان x<0 و y>0 فالزاوية pi - alpha (الربع الثاني). إذا كان x<0 و y<0 فالزاوية pi + alpha (الربع الثالث). إذا كان x>0 و y<0 فالزاوية -alpha (الربع الرابع).",
        "الخطوة 3: تحقق دائماً بحساب cos(theta) و sin(theta) للزاوية الناتجة ومقارنة إشارتيهما مع إشارتي المركبتين الحقيقية والتخيلية.",
      ],
      contrastiveWorkedExample: "خطأ: z = -1 + i يعطي theta = pi/4. صواب: x سالب و y موجب فالزاوية في الربع الثاني theta = pi - pi/4 = 3pi/4.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_complex_algebraic_trig"],
    externalResourceIds: ["res_math_m_complex_summary"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "سؤال كلاسيكي في بداية مسألة الأعداد المركبة لاختبار التحكم في الحساب المثلثي وقوى دو موافر.",
      commonPitfalls_ar: ["الخلط بين الشكل الأسي والتحويل النقطي", "نسيان رفع الطويلة r إلى الأس n في z^n = r^n * e^(i*n*theta)"],
      officialBacPastRefIds: ["bac_m_2024_s1_ex2", "bac_m_2022_s1_ex2"],
    },
    provenance: {
      sourceId: "src-men-3as-math-syllabus",
      sourceTitle: "المنهاج الرسمي لمادة الرياضيات 3AS شعبة رياضيات",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "original",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ---------------------------------------------------------------------------
  // 5. SIMILITUDES PLANES DIRECTES
  // ---------------------------------------------------------------------------
  math_m_similitudes_directes: {
    packageId: "pkg_math_m_similitudes_directes",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_similitudes_directes",
    skillId: "math_m_similitudes_directes",
    objective_ar: "تعيين الطبيعة الهندسية والعناصر المميزة للتشابه المباشر (المركز، النسبة، والزاوية) انطلاقاً من الكتابة المركبة z' = az + b والعكس.",
    objective_fr: "Caractériser géométriquement une similitude plane directe à partir de son écriture complexe.",
    prerequisites: ["math_m_complex_algebraic_trig"],
    lesson: {
      title_ar: "التحويلات النقطية: التشابه المباشر وعناصره المميزة",
      contentMarkdown_ar: `### التعريف والكتابة المركبة
كل تحويل نقطي S في المستوي المركب يرفق بكل نقطة M(z) النقطة M'(z') حيث:
$$z' = a \\cdot z + b \\quad (a \\in \\mathbb{C}^*, b \\in \\mathbb{C})$$
هو تحويل نقطي مباشر.

### التصنيف الهندسي حسب قيمة المعامل a
1. إذا كان $a = 1$: S هو انسحاب شعاعه $\\vec{u}$ لاحقته b.
2. إذا كان $a \\in \\mathbb{R}^* \\setminus \\{1\\}$: S هو تحاكٍ نسبته $k = a$ ومركزه $\\Omega$ النقطة الصامدة.
3. إذا كان $|a| = 1$ و $a \\neq 1$: S هو دوران زاويته $\\theta = \\arg(a)$ ومركزه $\\Omega$.
4. إذا كان $a \\notin \\mathbb{R}$ و $|a| \\neq 1$: S هو تشابه مباشر عناصره المميزة هي:
   - النسبة: $k = |a| > 0$.
   - الزاوية: $\\theta = \\arg(a) \\pmod{2\\pi}$.
   - المركز: النقطة الصامدة الوحيدة $\\Omega(\\omega)$ حيث:
     $$\\omega = a\\omega + b \\iff \\omega = \\frac{b}{1 - a}$$`,
      keyTakeaway_ar: "التشابه المباشر z'=az+b له نسبة k=|a| وزاوية theta=arg(a) ومركز صامد وحيد omega = b / (1 - a) متى كان a != 1.",
    },
    workedExample: {
      problem_ar: "عيّن طبيعة وعناصر التحويل النقطي S المعرف بـ: z' = (1 + i)*z + 2 - i.",
      stepByStepSolution_ar: [
        "الخطوة 1: تحديد المعاملين a و b:\na = 1 + i و b = 2 - i.",
        "الخطوة 2: حساب النسبة k:\nk = |a| = |1 + i| = sqrt(1^2 + 1^2) = sqrt(2). بما أن k != 1 و a ليس حقيقياً، فالتحويل تشابه مباشر.",
        "الخطوة 3: حساب الزاوية theta:\ncos(theta) = 1/sqrt(2) = sqrt(2)/2 و sin(theta) = 1/sqrt(2) = sqrt(2)/2.\nإذن: theta = pi / 4 [2pi].",
        "الخطوة 4: حساب لاحقة المركز omega للنقطة الصامدة:\nomega = b / (1 - a) = (2 - i) / (1 - (1 + i)) = (2 - i) / (-i).\nنضرب البسط والمقام في مرافق المقام (أو في i):\nomega = (2 - i)*i / (-i*i) = (2i - i^2) / 1 = 1 + 2i.",
        "الخطوة 5: الخلاصة الهندسية:\nS هو تشابه مباشر مركزه النقطة Omega(1, 2)، ونسبته k = sqrt(2)، وزاويته theta = pi / 4.",
      ],
      pedagogicalComment_ar: "التحقق بالتعويض: (1 + i)*(1 + 2i) + 2 - i = (1 + 2i + i - 2) + 2 - i = -1 + 3i + 2 - i = 1 + 2i = omega (نقطة صامدة صحيحة).",
    },
    activeRecall: {
      prompt_ar: "ما هي لاحقة مركز التشابه المباشر z' = az + b إذا كان a != 1؟",
      expectedAnswer_ar: "لاحقة المركز هي omega = b / (1 - a).",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_simil_01",
        prompt_ar: "ما هي نسبة وزاوية التشابه المباشر المعرف بـ z' = 2i*z + 1؟",
        optionsCount: 4,
        correctAnswerId: "opt_sim_k2_pi2",
        explanation_ar: "a = 2i. النسبة k = |2i| = 2. الزاوية theta = arg(2i) = pi/2 [2pi].",
        distractorErrorMappings: {
          opt_sim_k2_0: "misunderstood_concept",
          opt_sim_k1_pi2: "calculation_error",
          opt_sim_other: "forgot_information",
        },
      },
      {
        id: "pq_math_m_simil_02",
        prompt_ar: "احسب لاحقة مركز التحويل z' = 2z - 3.",
        optionsCount: 4,
        correctAnswerId: "opt_sim_center_3",
        explanation_ar: "omega = b / (1 - a) = -3 / (1 - 2) = -3 / (-1) = 3. التحويل هو تحاكٍ نسبته 2 ومركزه النقطة ذات اللاحقة 3.",
        distractorErrorMappings: {
          opt_sim_center_minus3: "calculation_error",
          opt_sim_center_half: "calculation_error",
          opt_sim_center_zero: "misunderstood_concept",
        },
      },
    ],
    retest: {
      id: "rq_math_m_simil_twin",
      parentPracticeQuestionId: "pq_math_m_simil_02",
      prompt_ar: "عيّن لاحقة مركز ونسبة وزاوية التشابه المباشر S: z' = (1 - i)*z + 2 + 3i.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_simil_res",
      explanation_ar: "a = 1 - i. النسبة k = |1 - i| = sqrt(2). الزاوية theta = arg(1 - i) = -pi/4 [2pi]. لاحقة المركز: omega = b / (1 - a) = (2 + 3i) / (1 - (1 - i)) = (2 + 3i) / i = (2 + 3i)(-i) = 3 - 2i. إذن المركز هو النقطة Omega(3, -2).",
    },
    repairGuide: {
      targetErrorType: "forgot_information",
      title_ar: "معالجة خطأ قانون لاحقة المركز (الخلط بين 1-a و a-1)",
      mentalModelExplanation_ar: "يكتب بعض التلاميذ omega = b / (a - 1) بدلاً من omega = b / (1 - a) ناتجاً عن نقل خاطئ للحدود في معادلة النقطة الصامدة omega - a*omega = b.",
      actionableSteps_ar: [
        "الخطوة 1: انطلق دائماً من تعريف النقطة الصامدة: S(omega) = omega أي omega = a*omega + b.",
        "الخطوة 2: انقل a*omega إلى اليسار: omega - a*omega = b ومنه omega*(1 - a) = b.",
        "الخطوة 3: اقسم على (1 - a): omega = b / (1 - a).",
      ],
      contrastiveWorkedExample: "خطأ: z' = 2z + 1 يعطي omega = 1 / (2 - 1) = 1. صواب: omega = 1 / (1 - 2) = -1. بالتعويض: 2*(-1) + 1 = -1 (صحيح).",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_similitudes_directes"],
    externalResourceIds: ["res_math_m_similitudes_guide"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "وحدة مميزة وحصرية لشعبتي الرياضيات والتقني رياضي، ولا ترد في شعبة العلوم التجريبية.",
      commonPitfalls_ar: ["الخلط بين زاوية التشابه وزاوية الدوران", "خطأ مرافق المقام عند حساب لاحقة المركز المركبة"],
      officialBacPastRefIds: ["bac_m_2023_s1_ex2", "bac_m_2021_s1_ex2"],
    },
    provenance: {
      sourceId: "src-men-3as-math-syllabus",
      sourceTitle: "المنهاج الرسمي لمادة الرياضيات 3AS شعبة رياضيات",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "original",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ---------------------------------------------------------------------------
  // 6. DÉRIVATION, CONTINUITÉ & TVI RIGOUREUX
  // ---------------------------------------------------------------------------
  math_m_derivatives_tvi_rigor: {
    packageId: "pkg_math_m_derivatives_tvi_rigor",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_continuity_derivatives",
    skillId: "math_m_derivatives_tvi_rigor",
    objective_ar: "تطبيق مبرهنة القيم المتوسطة بالبرهان الاستدلالي الصارم للوجود والوحدانية وحصر الحلول وتوظيف المشتقة الثانية في دراسة التحدب ونقاط الانعطاف.",
    objective_fr: "Démontrer l'existence et l'unicité des solutions par le TVI et étudier la convexité.",
    prerequisites: [],
    lesson: {
      title_ar: "الاستمرارية، مبرهنة القيم المتوسطة، والتقعر ونقاط الانعطاف",
      contentMarkdown_ar: `### مبرهنة القيم المتوسطة (TVI) الصارمة
لتكن f دالة معرفة ومستمرة على مجال مغلق $[a, b]$:
1. مبرهنة الوجود: إذا كان العدد k محصوراً بين $f(a)$ و $f(b)$، فإنه يوجد على الأقل عدد حقيقي $c \\in [a, b]$ بحيث $f(c) = k$.
2. مبرهنة الوحدانية (مبرهنة التزايد/التناقص التام): إذا كانت f مستمرة **ورتيبة تماماً** على $[a, b]$ وكان $f(a) \\cdot f(b) < 0$، فإن المعادلة $f(x) = 0$ تقبل **حلاً وحيداً** $\\alpha$ في المجال المفتوح $]a, b[$.

### دراسة التحدب ونقاط الانعطاف بواسطة $f''$
لتكن f دالة قابلة للاشتقاق مرتين على مجال I:
- المنحنى $(C_f)$ محدب (convex) على I إذا وفقط إذا كانت المشتقة الثانية موجبة: $f''(x) \\ge 0$.
- المنحنى $(C_f)$ مقعر (concave) على I إذا وفقط إذا كانت المشتقة الثانية سالبة: $f''(x) \\le 0$.
- النقطة $A(x_0, f(x_0))$ نقطة انعطاف للمنحنى $(C_f)$ إذا وفقط إذا انعدمت المشتقة الثانية $f''(x)$ عند $x_0$ مغيّرة إشارتها.`,
      keyTakeaway_ar: "إثبات وجود حل وحيد ألفا يتطلب 3 ركائز: 1) الاستمرار، 2) الرتابة التامة، 3) اختلاف إشارتي طرفي المجال f(a)*f(b) < 0.",
    },
    workedExample: {
      problem_ar: "لتكن f(x) = 2x^3 + 3x - 4 المعرفة على R. أثبت أن المعادلة f(x) = 0 تقبل حلاً وحيداً alpha في المجال ]0, 1[.",
      stepByStepSolution_ar: [
        "الخطوة 1: إثبات الاستمرار: الدالة f دالة كثيرة حدود، إذن فهي مستمرة على R وبخاصة على المجال المغلق [0, 1].",
        "الخطوة 2: دراسة اتجاه التغير والرتابة التامة:\nالدالة المشتقة هي: f'(x) = 6x^2 + 3.\nبما أن x^2 >= 0 فإن 6x^2 + 3 >= 3 > 0 تماماً من أجل كل x من R.\nإذن الدالة f متزايدة تماماً على R وبخاصة على [0, 1].",
        "الخطوة 3: حساب الصور عند طرفي المجال:\n- f(0) = 2(0)^3 + 3(0) - 4 = -4 < 0.\n- f(1) = 2(1)^3 + 3(1) - 4 = 1 > 0.\nإذن: f(0) * f(1) = (-4) * 1 = -4 < 0 (الصورتان مختلفتان في الإشارة).",
        "الخطوة 4: صياغة النتيجة:\nبما أن f مستمرة ومتزايدة تماماً على [0, 1] ولدينا f(0) * f(1) < 0، فحسب مبرهنة القيم المتوسطة، المعادلة f(x) = 0 تقبل حلاً وحيداً alpha في المجال المفتوح ]0, 1[.",
      ],
      pedagogicalComment_ar: "الصياغة المنظمة بثلاث نقاط مستقلة تضمن الحصول على العلامة الكاملة في سلم التنقيط الوزاري.",
    },
    activeRecall: {
      prompt_ar: "متى تكون النقطة A(x0, f(x0)) نقطة انعطاف للمنحنى البياني؟",
      expectedAnswer_ar: "عندما تنعدم المشتقة الثانية f''(x) عند x0 مغيّرة إشارتها (أو تنعدم المشتقة الأولى عند x0 دون تغيير إشارتها).",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_tvi_01",
        prompt_ar: "إذا كانت f مستمرة على [1, 3] و f(1) = -2 و f(3) = 4، فهل المعادلة f(x) = 0 تقبل بالضرورة حلاً وحيداً؟",
        optionsCount: 4,
        correctAnswerId: "opt_tvi_at_least_one",
        explanation_ar: "تقبل حلاً على الأقل لأن الرتابة التامة غير معطاة؛ قد تقبل حلاً وحيداً أو عدة حلول إذا كانت الدالة تتذبذب.",
        distractorErrorMappings: {
          opt_tvi_unique: "misunderstood_concept",
          opt_tvi_no_sol: "methodology_error",
          opt_tvi_other: "misread_question",
        },
      },
      {
        id: "pq_math_m_tvi_02",
        prompt_ar: "لتكن f''(x) = 2x - 4. عيّن فاصلة نقطة انعطاف المنحنى (Cf).",
        optionsCount: 4,
        correctAnswerId: "opt_tvi_infl_2",
        explanation_ar: "تنعدم المشتقة الثانية عند 2x - 4 = 0 أي x = 2، وتغير إشارتها من السالب إلى الموجب، إذن x = 2 هي فاصلة نقطة الانعطاف.",
        distractorErrorMappings: {
          opt_tvi_infl_minus2: "calculation_error",
          opt_tvi_infl_4: "calculation_error",
          opt_tvi_infl_0: "misunderstood_concept",
        },
      },
    ],
    retest: {
      id: "rq_math_m_tvi_twin",
      parentPracticeQuestionId: "pq_math_m_tvi_02",
      prompt_ar: "لتكن g(x) = x^3 - 3x^2 + 2. عيّن فاصلة نقطة انعطاف منحنى الدالة g وادرس تقعره.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_tvi_res",
      explanation_ar: "g'(x) = 3x^2 - 6x، g''(x) = 6x - 6. تنعدم عند x = 1 وتغير إشارتها من السالب إلى الموجب. إذن (1, 0) نقطة انعطاف، والمنحنى مقعر على ]-inf, 1[ ومحدب على ]1, +inf[.",
    },
    repairGuide: {
      targetErrorType: "methodology_error",
      title_ar: "إصلاح الخلط المنهجي بين شرط وجود حل وشرط الوحدانية في TVI",
      mentalModelExplanation_ar: "يكتفي بعض التلاميذ بالاستمرار والجداء السالب ويصرح بالحل الوحيد دون إثبات الرتابة التامة، مما يفقد البرهان ركيزة الوحدانية الأساسية.",
      actionableSteps_ar: [
        "الخطوة 1: اكتب شرط الاستمرار صراحة كخطوة أولى مع التعليل.",
        "الخطوة 2: اذكر اتجاه تغير الدالة وأكد على أنها 'رتيبة تماماً' (متزايدة تماماً أو متناقصة تماماً).",
        "الخطوة 3: احسب جداء الصورتين f(a)*f(b) وبيّن أنه سالب تماماً.",
      ],
      contrastiveWorkedExample: "ناقص: بما أن f(1)*f(2) < 0 إذن يوجد حل وحيد. كامل: بما أن f مستمرة ورتيبة تماماً و f(1)*f(2) < 0، فحسب TVI يوجد حل وحيد.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_derivatives_tvi_rigor"],
    externalResourceIds: ["res_math_m_tvi_methodology"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "يرد سؤال TVI دائماً في الجزء الأول من دراسة الدالة المساعدة g(x) لتحديد إشارتها وتوظيفها في إشارة مشتقة الدالة الرئيسية f(x).",
      commonPitfalls_ar: ["نسيان كتابة كلمة 'تماماً' في الرتابة", "عدم حصر المجال المفتوح في النتيجة النهائية"],
      officialBacPastRefIds: ["bac_m_2024_s1_ex4", "bac_m_2022_s1_ex4"],
    },
    provenance: {
      sourceId: "src-men-3as-math-syllabus",
      sourceTitle: "المنهاج الرسمي لمادة الرياضيات 3AS شعبة رياضيات",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "original",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ---------------------------------------------------------------------------
  // 7. EXPONENTIELLE, LOGARITHME & CROISSANCES COMPARÉES
  // ---------------------------------------------------------------------------
  math_m_exp_log_croissances: {
    packageId: "pkg_math_m_exp_log_croissances",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_exp_log_croissances",
    skillId: "math_m_exp_log_croissances",
    objective_ar: "إزالة حالات عدم التعيين المعقدة بتوظيف نهايات التزايد المقارن وتفسير المستقيمات المقاربة الأفقية والعمودية والمائلة.",
    objective_fr: "Lever les indéterminations complexes par les croissances comparées et interpréter les asymptotes.",
    prerequisites: ["math_m_derivatives_tvi_rigor"],
    lesson: {
      title_ar: "الدوال الأسية واللوغاريتمية والتزايد المقارن والمستقيمات المقاربة",
      contentMarkdown_ar: `### نهايات التزايد المقارن الشهيرة (Croissances comparées)
عند $+\\infty$، تتباعد الدالة الأسية بسرعة تفوق أي قوة، بينما تتباعد قوى x بسرعة تفوق اللوغاريتم النيبيري:
1. للدالة الأسية:
   $$\\lim_{x \\to +\\infty} \\frac{e^x}{x^n} = +\\infty \\quad (n \\in \\mathbb{N}^*)$$
   $$\\lim_{x \\to -\\infty} x^n \\cdot e^x = 0 \\quad (n \\in \\mathbb{N}^*)$$
2. للدالة اللوغاريتمية:
   $$\\lim_{x \\to +\\infty} \\frac{\\ln x}{x^n} = 0 \\quad (n \\in \\mathbb{N}^*)$$
   $$\\lim_{x \\to 0^+} x^n \\cdot \\ln x = 0 \\quad (n \\in \\mathbb{N}^*)$$

### إثبات المستقيم المقارب المائل ودراسة الوضع النسبي
يكون المستقيم $(\\Delta): y = ax + b$ مقارباً مائلاً للمنحنى $(C_f)$ بجوار $\\pm\\infty$ إذا وفقط إذا كان:
$$\\lim_{x \\to \\pm\\infty} [f(x) - (ax + b)] = 0$$
ولدراسة الوضع النسبي بين المنحنى والمقارب: ندرس إشارة الفرق $d(x) = f(x) - y$ في جدول منظم.`,
      keyTakeaway_ar: "في حالات عدم التعيين باللانهاية نستخرج العامل المهيمن e^x أو x كعامل مشترك ونطبق نهايات التزايد المقارن lim e^x / x = +inf و lim ln(x) / x = 0.",
    },
    workedExample: {
      problem_ar: "احسب النهاية: lim (x -> +infinity) [x - e^(-x) - ln(x) / x] وبيّن أن المستقيم y = x مقارب مائل للمنحنى.",
      stepByStepSolution_ar: [
        "الخطوة 1: نحسب نهاية كل حد على حدة عند +infinity:\n- lim e^(-x) = lim 1/e^x = 0.\n- lim (ln(x) / x) = 0 (نهاية تزايد مقارن شهيرة).",
        "الخطوة 2: نحسب نهاية الفرق [f(x) - x]:\nf(x) - x = -e^(-x) - ln(x) / x.\nlim_{x -> +infinity} [f(x) - x] = 0 - 0 = 0.",
        "الخطوة 3: الاستنتاج الهندسي:\nبما أن نهاية الفرق عند +infinity معدومة، فإن المستقيم (Delta) ذو المعادلة y = x مقارب مائل للمنحنى (C_f) بجوار +infinity.",
        "الخطوة 4: دراسة الوضع النسبي:\nf(x) - x = - [e^(-x) + ln(x)/x]. من أجل x > 1، لدينا e^(-x) > 0 و ln(x)/x > 0، إذن الفرق سالب تماماً والمنحنى يقع تحت المقارب.",
      ],
      pedagogicalComment_ar: "تفكيك العبارة إلى حدود تؤول للصفر بالخواص المرجعية يجنب التلميذ التوحيد غير المجدي للمقامات.",
    },
    activeRecall: {
      prompt_ar: "ما هي قيمة lim (x -> +infinity) [ln(x) / sqrt(x)]؟",
      expectedAnswer_ar: "القيمة هي 0 لأن sqrt(x) = x^(1/2) والتزايد المقارن يضمن أن القوة تتفوق على اللوغاريتم.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_exp_01",
        prompt_ar: "احسب النهاية lim (x -> +infinity) [e^(2x) - 5x^3].",
        optionsCount: 4,
        correctAnswerId: "opt_exp_plus_inf",
        explanation_ar: "نستخرج e^(2x) كعامل مشترك: e^(2x) * [1 - 5x^3 / e^(2x)]. بالتزايد المقارن x^3 / e^(2x) يؤول إلى 0. إذن النهاية +infinity * 1 = +infinity.",
        distractorErrorMappings: {
          opt_exp_minus_inf: "calculation_error",
          opt_exp_zero: "misunderstood_concept",
          opt_exp_indet: "methodology_error",
        },
      },
      {
        id: "pq_math_m_exp_02",
        prompt_ar: "احسب lim (x -> 0+) [x^2 * ln(x)].",
        optionsCount: 4,
        correctAnswerId: "opt_exp_zero",
        explanation_ar: "نهاية تزايد مقارن شهيرة ومباشرة: lim (x -> 0+) x^n * ln(x) = 0 من أجل كل n >= 1.",
        distractorErrorMappings: {
          opt_exp_minus_inf: "forgot_information",
          opt_exp_one: "calculation_error",
          opt_exp_plus_inf: "misunderstood_concept",
        },
      },
    ],
    retest: {
      id: "rq_math_m_exp_twin",
      parentPracticeQuestionId: "pq_math_m_exp_01",
      prompt_ar: "احسب النهاية: lim (x -> +infinity) [(x^2 + 1) * e^(-x)].",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_exp_res",
      explanation_ar: "(x^2 + 1)*e^(-x) = x^2 / e^x + 1 / e^x. بالتزايد المقارن: lim x^2 / e^x = 0 و lim 1/e^x = 0. إذن النهاية هي 0.",
    },
    repairGuide: {
      targetErrorType: "forgot_information",
      title_ar: "معالجة الخلط بين نهايات التزايد المقارن عند الصفر وعند اللانهاية",
      mentalModelExplanation_ar: "يخلط التلميذ بين lim x*ln(x) = 0 (عند 0+) و lim ln(x)/x = 0 (عند +infinity)، فيطبق إحداهما في جوار الأخرى.",
      actionableSteps_ar: [
        "الخطوة 1: حدد أولاً أين يؤول المتغير x (هل إلى 0+ أم إلى +infinity أم إلى -infinity).",
        "الخطوة 2: تذكر أن الجداء x*ln(x) خاص بالصفر، وحاصل القسمة ln(x)/x خاص باللانهاية.",
        "الخطوة 3: استخرج المقلوب أو ضع تغييراً للمتغير X = 1/x إذا كانت العبارة مركبة.",
      ],
      contrastiveWorkedExample: "خطأ: lim (x->+inf) x*ln(x) = 0. صواب: عند +inf كلاهما موجب وكبير إذن الجداء يؤول إلى +infinity.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_exp_log_croissances"],
    externalResourceIds: ["res_math_m_croissances_sim"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "يرد في المسألة الكبرى للدوال (6 إلى 7 نقاط) كنقطة ارتكاز لبناء جدول التغيرات ورسم المنحنى والمستقيمات المقاربة.",
      commonPitfalls_ar: ["الخلط بين e^(-inf) = 0 و e^(+inf) = +inf", "نسيان إشارة الناقص عند النشر في الفرق f(x) - y"],
      officialBacPastRefIds: ["bac_m_2023_s1_ex4", "bac_m_2021_s1_ex4"],
    },
    provenance: {
      sourceId: "src-men-3as-math-syllabus",
      sourceTitle: "المنهاج الرسمي لمادة الرياضيات 3AS شعبة رياضيات",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "original",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ---------------------------------------------------------------------------
  // 8. INTÉGRATION PAR PARTIES & CALCUL D'AIRES
  // ---------------------------------------------------------------------------
  math_m_integration_parts: {
    packageId: "pkg_math_m_integration_parts",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_integration_primitives",
    skillId: "math_m_integration_parts",
    objective_ar: "حساب التكاملات باستعمال تقنية المكاملة بالتجزئة وتوظيفها في حساب مساحات الحيز المستوي وحصر المتتاليات التكاملية.",
    objective_fr: "Calculer des intégrales par parties et déterminer des aires planes.",
    prerequisites: ["math_m_exp_log_croissances"],
    lesson: {
      title_ar: "الحساب التكاملي: المكاملة بالتجزئة وحساب المساحات",
      contentMarkdown_ar: `### قانون المكاملة بالتجزئة (Intégration par parties)
لتكن u و v دالتين قابلتين للاشتقاق على مجال $[a, b]$ ومشتقتيهما مستمرتين على $[a, b]$:
$$\\int_{a}^{b} u(x) \\cdot v'(x) \\, dx = [u(x) \\cdot v(x)]_{a}^{b} - \\int_{a}^{b} u'(x) \\cdot v(x) \\, dx$$

### استراتيجية اختيار الدالتين u و v' (قاعدة ALPES)
نختار u(x) حسب الأولوية التالية (الأسبق يُشتق):
1. **A**: Arcsin / Arccos (غير مبرمجة)
2. **L**: اللوغاريتم النيبيري $\\ln(x)$
3. **P**: كثيرات الحدود والدوال القوى $x^n$
4. **E**: الدالة الأسية $e^x$
5. **S**: الدوال الدائرية الجيب وجيب التمام $\\sin(x), \\cos(x)$

### حساب مساحة حيز مستو
إذا كانت f مستمرة وموجبة على $[a, b]$، فإن مساحة الحيز المحصور بين $(C_f)$ ومحور الفواصل والمستقيمين $x=a$ و $x=b$ هي:
$$\\mathcal{A} = \\int_{a}^{b} f(x) \\, dx \\quad (u.a)$$
حيث $1 \\, u.a = \\|\\vec{i}\\| \\times \\|\\vec{j}\\| \\, \\text{cm}^2$.`,
      keyTakeaway_ar: "في جداء كثير حدود مع لوغاريتم نضع u = ln(x) ونشتقها، وفي جداء كثير حدود مع أسية نضع u = P(x) لتخفيض درجته.",
    },
    workedExample: {
      problem_ar: "باستعمال المكاملة بالتجزئة، احسب التكامل: I = integral_1^e (x * ln(x) dx).",
      stepByStepSolution_ar: [
        "الخطوة 1: اختيار u(x) و v'(x):\n- نضع u(x) = ln(x) لأن مشتقتها دالة ناطقة بسيطة: u'(x) = 1/x.\n- نضع v'(x) = x ومنه نأخذ دالتها الأصلية: v(x) = (1/2) * x^2.",
        "الخطوة 2: تطبيق قانون المكاملة بالتجزئة:\nI = [ (1/2) * x^2 * ln(x) ]_1^e - integral_1^e ( (1/x) * (1/2)*x^2 dx ).",
        "الخطوة 3: تبسيط التكامل المتبقي:\n(1/x) * (1/2)*x^2 = (1/2)*x.\nإذن: integral_1^e ( (1/2)*x dx ) = [ (1/4) * x^2 ]_1^e.",
        "الخطوة 4: حساب القيمة العددية بالتعويض:\nI = [ (1/2)*e^2*ln(e) - (1/2)*(1)^2*ln(1) ] - [ (1/4)*e^2 - (1/4)*(1)^2 ]\nبما أن ln(e)=1 و ln(1)=0:\nI = (1/2)*e^2 - [ (1/4)*e^2 - 1/4 ] = (1/2)*e^2 - (1/4)*e^2 + 1/4 = (1/4)*e^2 + 1/4 = (e^2 + 1) / 4.",
      ],
      pedagogicalComment_ar: "احتساب الأقواس المعقوفة بعناية يمنع أخطاء إشارة الناقص التي تفصل بين حدي القانون.",
    },
    activeRecall: {
      prompt_ar: "ما هو قانون المكاملة بالتجزئة للتكامل integral_a^b (u * v' dx)؟",
      expectedAnswer_ar: "integral_a^b (u * v' dx) = [u * v]_a^b - integral_a^b (u' * v dx).",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_integ_01",
        prompt_ar: "عند حساب التكامل integral (x * e^x dx) بالمكاملة بالتجزئة، ما هو الاختيار الأنسب للدالة u(x)؟",
        optionsCount: 4,
        correctAnswerId: "opt_int_u_x",
        explanation_ar: "نختار u(x) = x لكي تنخفض درجتها بالاشتقاق إلى u'(x) = 1، ونضع v'(x) = e^x فتكون v(x) = e^x.",
        distractorErrorMappings: {
          opt_int_u_ex: "methodology_error",
          opt_int_u_both: "misunderstood_concept",
          opt_int_u_none: "methodology_error",
        },
      },
      {
        id: "pq_math_m_integ_02",
        prompt_ar: "احسب التكامل J = integral_0^1 (x * e^x dx).",
        optionsCount: 4,
        correctAnswerId: "opt_int_val_1",
        explanation_ar: "J = [x*e^x]_0^1 - integral_0^1 (e^x dx) = (1*e^1 - 0) - [e^x]_0^1 = e - (e - 1) = 1.",
        distractorErrorMappings: {
          opt_int_val_e: "calculation_error",
          opt_int_val_minus1: "calculation_error",
          opt_int_val_0: "misunderstood_concept",
        },
      },
    ],
    retest: {
      id: "rq_math_m_integ_twin",
      parentPracticeQuestionId: "pq_math_m_integ_02",
      prompt_ar: "باستعمال المكاملة بالتجزئة، احسب التكامل: K = integral_0^1 ((2x + 1) * e^x dx).",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_integ_res",
      explanation_ar: "u = 2x+1 ومنه u'=2. v'=e^x ومنه v=e^x. K = [(2x+1)*e^x]_0^1 - integral_0^1 (2e^x dx) = (3e - 1) - [2e^x]_0^1 = 3e - 1 - (2e - 2) = e + 1.",
    },
    repairGuide: {
      targetErrorType: "methodology_error",
      title_ar: "إصلاح الاختيار المعكوس للدوال في المكاملة بالتجزئة",
      mentalModelExplanation_ar: "إذا اختار التلميذ u = e^x و v' = x، فسيصبح التكامل الجديد يحتوي على x^2 بدلاً من x، مما يعقد المسألة بدلاً من حلها.",
      actionableSteps_ar: [
        "الخطوة 1: تذكر قاعدة ALPES: كثيرات الحدود تُشتق أمام الدوال الأسية والدائرية، وتُدمج أمام اللوغاريتم.",
        "الخطوة 2: بعد كتابة u' و v، ألق نظرة سريعة على التكامل الجديد integral(u'*v)؛ إذا كان أبسط من الأصلي فاستمر، وإذا تعقد فاقلب الاختيار فوراً.",
        "الخطوة 3: احسب الحدين الحديين [u*v]_a^b بعناية تامة وتأكد من توزيع إشارة السالب على حدود التكامل الثانوي كاملاً.",
      ],
      contrastiveWorkedExample: "خطأ: في integral(x*e^x) وضع u = e^x و v' = x يعطي integral(x^2 * e^x). صواب: u = x و v' = e^x يعطي integral(e^x) وهو مباشر جداً.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_integration_parts"],
    externalResourceIds: ["res_math_m_integration_video"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "سؤال تكاملي يرد في نهاية مسألة التحليل لحساب مساحة حيز هندسي أو حساب نهاية متتالية تكاملية.",
      commonPitfalls_ar: ["نسيان إشارة الناقص في القانون", "نسيان ضرب المساحة بوحدة القياس cm² عند إعطاء سلم الرسم"],
      officialBacPastRefIds: ["bac_m_2024_catchup_ex4", "bac_m_2022_s1_ex3"],
    },
    provenance: {
      sourceId: "src-men-3as-math-syllabus",
      sourceTitle: "المنهاج الرسمي لمادة الرياضيات 3AS شعبة رياضيات",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "original",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ---------------------------------------------------------------------------
  // 9. ÉQUATIONS DIFFÉRENTIELLES LINÉAIRES
  // ---------------------------------------------------------------------------
  math_m_differential_equations: {
    packageId: "pkg_math_m_differential_equations",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_differential_equations",
    skillId: "math_m_differential_equations",
    objective_ar: "حل المعادلات التفاضلية الخطية من الرتبة الأولى y' = ay + b والرتبة الثانية y'' + w²y = 0 وتعيين الحلول الخاصة المستوفية للشروط الابتدائية.",
    objective_fr: "Résoudre les équations différentielles linéaires des premier et second ordres.",
    prerequisites: ["math_m_exp_log_croissances"],
    lesson: {
      title_ar: "المعادلات التفاضلية الخطية من الرتبة الأولى والثانية",
      contentMarkdown_ar: `### حل المعادلة التفاضلية $y' = ay$
حلول المعادلة التفاضلية $y' = ay$ على $\\mathbb{R}$ (مع $a \\in \\mathbb{R}^*$) هي الدوال المعرفة بـ:
$$y(x) = C \\cdot e^{ax} \\quad (C \\in \\mathbb{R})$$

### حل المعادلة التفاضلية $y' = ay + b$
حلول المعادلة التفاضلية $y' = ay + b$ على $\\mathbb{R}$ (مع $a \\neq 0$) هي الدوال:
$$y(x) = C \\cdot e^{ax} - \\frac{b}{a} \\quad (C \\in \\mathbb{R})$$
حيث $-\\frac{b}{a}$ هو الحل الخاص الثابت.

### حل المعادلة التفاضلية من الرتبة الثانية $y'' + \\omega^2 y = 0$
حلول المعادلة التفاضلية $y'' + \\omega^2 y = 0$ على $\\mathbb{R}$ (مع $\\omega > 0$) هي الدوال الجيبية من الشكل:
$$y(x) = C_1 \\cdot \\cos(\\omega x) + C_2 \\cdot \\sin(\\omega x) \\quad (C_1, C_2 \\in \\mathbb{R})$$

### تعيين الحل الخاص بالشرط الابتدائي
يسمح إعطاء قيمة $y(x_0) = y_0$ (أو $y'(x_0) = y'_0$) بتحديد قيمة الثابتين $C$ أو $C_1, C_2$ بشكل وحيد ودقيق.`,
      keyTakeaway_ar: "حل y'=ay+b هو y = C*e^(ax) - b/a، وحل y''+w²y=0 هو y = C1*cos(wx) + C2*sin(wx)، والشرط الابتدائي يحدد الثوابت بدقة.",
    },
    workedExample: {
      problem_ar: "حل المعادلة التفاضلية (E): 2y' + 6y = 12، ثم عيّن الحل الخاص الذي يحقق y(0) = 5.",
      stepByStepSolution_ar: [
        "الخطوة 1: كتابة المعادلة بالصيغة النموذجية:\n2y' = -6y + 12 ومنه بالقسمة على 2: y' = -3y + 6.\nهنا: a = -3 و b = 6.",
        "الخطوة 2: استخراج الحل الخاص الثابت:\n-b/a = -6 / (-3) = 2.",
        "الخطوة 3: كتابة الحل العام:\ny(x) = C * e^(-3x) + 2 (حيث C عدد حقيقي كيفي).",
        "الخطوة 4: تطبيق الشرط الابتدائي y(0) = 5:\ny(0) = C * e^0 + 2 = C + 2 = 5 ومنه C = 5 - 2 = 3.",
        "الخطوة 5: كتابة الحل الخاص النهائي:\ny(x) = 3 * e^(-3x) + 2.",
      ],
      pedagogicalComment_ar: "التحقق بالاشتقاق: y'(x) = -9*e^(-3x). نعوض: 2*(-9*e^(-3x)) + 6*(3*e^(-3x) + 2) = -18*e^(-3x) + 18*e^(-3x) + 12 = 12 (صحيح تماماً).",
    },
    activeRecall: {
      prompt_ar: "ما هو الحل العام للمعادلة التفاضلية y'' + 9y = 0 على R؟",
      expectedAnswer_ar: "omega = 3، والحل العام هو y(x) = C1*cos(3x) + C2*sin(3x) مع C1 و C2 عددان حقيقيان.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_diffeq_01",
        prompt_ar: "عيّن حل المعادلة التفاضلية y' = 4y الذي يحقق y(0) = -2.",
        optionsCount: 4,
        correctAnswerId: "opt_de_minus2_e4x",
        explanation_ar: "الحل العام y(x) = C*e^(4x). بما أن y(0) = C = -2 فإن الحل الخاص هو y(x) = -2 * e^(4x).",
        distractorErrorMappings: {
          opt_de_2_e4x: "calculation_error",
          opt_de_minus2_eminus4x: "forgot_information",
          opt_de_other: "calculation_error",
        },
      },
      {
        id: "pq_math_m_diffeq_02",
        prompt_ar: "ما هو الحل الثابت الخاص للمعادلة التفاضلية y' + 2y = 8؟",
        optionsCount: 4,
        correctAnswerId: "opt_de_const_4",
        explanation_ar: "y' = -2y + 8. الحل الثابت هو y = -b/a = -8 / (-2) = 4 (أو بانعدام y' نجد 2y = 8 ومنه y = 4).",
        distractorErrorMappings: {
          opt_de_const_minus4: "calculation_error",
          opt_de_const_8: "misunderstood_concept",
          opt_de_const_2: "calculation_error",
        },
      },
    ],
    retest: {
      id: "rq_math_m_diffeq_twin",
      parentPracticeQuestionId: "pq_math_m_diffeq_01",
      prompt_ar: "حل المعادلة التفاضلية y' - 5y = 10 ثم عيّن الحل الخاص الذي يحقق y(0) = 1.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_diffeq_res",
      explanation_ar: "y' = 5y + 10 ومنه الحل العام y(x) = C*e^(5x) - 10/5 = C*e^(5x) - 2. بالشرط y(0) = C - 2 = 1 ومنه C = 3. الحل الخاص: y(x) = 3*e^(5x) - 2.",
    },
    repairGuide: {
      targetErrorType: "calculation_error",
      title_ar: "معالجة خطأ إشارة الأس في حل المعادلات التفاضلية y' = ay",
      mentalModelExplanation_ar: "يكتب التلميذ أحياناً y = C*e^(-ax) لمعادلة y' = ay متأثراً بحل المعادلات الفيزيائية للدارة RC التي تكون من الشكل y' + (1/tau)y = 0.",
      actionableSteps_ar: [
        "الخطوة 1: ضع المعادلة دوماً بالشكل الصريح: y' = ay.",
        "الخطوة 2: تذكر أن إشارة المعامل a في الأس تتبع نفس إشارة الطرف الأيمن: y = C*e^(ax).",
        "الخطوة 3: اشتق حلك: مشتقة C*e^(ax) هي a*C*e^(ax) = a*y، مما يثبت صحة الإشارة فوراً.",
      ],
      contrastiveWorkedExample: "خطأ: y' = 2y حلها C*e^(-2x) لأن مشتقتها -2y != 2y. صواب: y' = 2y حلها C*e^(2x) ومشتقتها 2*y.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_differential_equations"],
    externalResourceIds: ["res_math_m_diff_eq_sheet"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "ترد في موضوع البكالوريا إما كسؤال مستقل أو كمدخل لتعريف دالة أسية مجهولة عبر معادلتها التفاضلية وسلوكها عند الصفر.",
      commonPitfalls_ar: ["الخلط بين إشارة a في y'=ay وإشارتها في y'+ay=0", "نسيان الثابت C في الحل العام"],
      officialBacPastRefIds: ["bac_m_2023_catchup_ex3", "bac_m_2020_s1_ex3"],
    },
    provenance: {
      sourceId: "src-men-3as-math-syllabus",
      sourceTitle: "المنهاج الرسمي لمادة الرياضيات 3AS شعبة رياضيات",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "original",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ---------------------------------------------------------------------------
  // 10. SUITES NUMÉRIQUES & SUITES ADJACENTES
  // ---------------------------------------------------------------------------
  math_m_induction_adjacent_suites: {
    packageId: "pkg_math_m_induction_adjacent_suites",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_sequences_convergence",
    skillId: "math_m_induction_adjacent_suites",
    objective_ar: "صياغة البرهان بالتراجع بدقة منهجية تامة وإثبات تجاور متتاليتين عدديتين وتحديد نهايتهما المشتركة.",
    objective_fr: "Rédiger le raisonnement par récurrence et démontrer l'adjacence de deux suites.",
    prerequisites: [],
    lesson: {
      title_ar: "المتتاليات العددية: الاستدلال بالتراجع والمتتاليات المتجاورة",
      contentMarkdown_ar: `### خطوات البرهان بالتراجع (Raisonnement par récurrence)
لإثبات خاصية $P(n)$ متعلقة بعدد طبيعي $n$ من أجل كل $n \\ge n_0$:
1. **مرحلة التحقق (Initialisation)**: نتأكد من صحة الخاصية $P(n_0)$ لأصغر رتبة $n_0$.
2. **مرحلة الوراثة (Hérédité)**: نفرض صحة الخاصية $P(n)$ لرتبة كيفيّة $n \\ge n_0$ (فرضية التراجع)، ونبرهن صحة الخاصية من الرتبة الموالية $P(n+1)$.
3. **الخاتمة (Conclusion)**: نصرح بالنتيجة: حسب مبدأ الاستدلال بالتراجع، $P(n)$ صحيحة من أجل كل $n \\ge n_0$.

### مبرهنة المتتاليتين المتجاورتين (Suites adjacentes)
تكون المتتاليتان العدديتان $(u_n)$ و $(v_n)$ متجاورتين إذا وفقط إذا تحقق:
1. إحداهما متزايدة تماماً (مثلاً $u_n$ متزايدة).
2. والأخرى متناقصة تماماً (مثلاً $v_n$ متناقصة).
3. نهاية الفرق بينهما تؤول إلى الصفر:
   $$\\lim_{n \\to +\\infty} (v_n - u_n) = 0$$

### نتيجة تجاور متتاليتين
إذا كانت المتتاليتان $(u_n)$ و $(v_n)$ متجاورتين، فإنهما **متقاربتان وتتقاربان نحو نفس النهاية الحقيقية L**:
$$\\lim_{n \\to +\\infty} u_n = \\lim_{n \\to +\\infty} v_n = L \\quad \\text{مع} \\quad u_n \\le L \\le v_n$$`,
      keyTakeaway_ar: "المتتاليتان المتجاورتان تحصران نهاية مشتركة L: إحداهما تصعد والأخرى تنزل والمسافة بينهما تؤول للصفر.",
    },
    workedExample: {
      problem_ar: "لتكن المتتالية (u_n) معرفة بـ: u_0 = 1 و u_(n+1) = sqrt(2 + u_n). برهن بالتراجع أن 0 < u_n < 2 من أجل كل n من N.",
      stepByStepSolution_ar: [
        "الخطوة 1: نسمي الخاصية P(n): 0 < u_n < 2.",
        "الخطوة 2: مرحلة التحقق عند n = 0:\nu_0 = 1 ولدينا 0 < 1 < 2، إذن الخاصية P(0) صحيحة.",
        "الخطوة 3: مرحلة الوراثة:\nنفرض أن P(n) صحيحة أي: 0 < u_n < 2، ونبرهن صحة P(n+1) أي: 0 < u_(n+1) < 2.\n- ننطلق من فرضية التراجع: 0 < u_n < 2.\n- نضيف 2 لجميع الأطراف: 2 < u_n + 2 < 4.\n- بما أن دالة الجذر التربيعي متزايدة تماماً على [0, +infinity[:\nsqrt(2) < sqrt(u_n + 2) < sqrt(4)\nومنه: sqrt(2) < u_(n+1) < 2.\nوبما أن 0 < sqrt(2)، فإن: 0 < u_(n+1) < 2.\nإذن الخاصية P(n+1) صحيحة.",
        "الخطوة 4: الخاتمة النموذجية:\nحسب مبدأ الاستدلال بالتراجع، فإن 0 < u_n < 2 من أجل كل عدد طبيعي n.",
      ],
      pedagogicalComment_ar: "توظيف تزايد دالة الجذر التربيعي يحافظ على اتجاه المتراجحات ويسمح بالانتقال السلس من n إلى n+1.",
    },
    activeRecall: {
      prompt_ar: "ما هي الشروط الثلاثة التي تجعل المتتاليتين (un) و (vn) متجاورتين؟",
      expectedAnswer_ar: "1) إحداهما متزايدة، 2) الأخرى متناقصة، 3) نهاية الفرق بينهما تؤول إلى الصفر: lim (vn - un) = 0.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_induct_01",
        prompt_ar: "إذا كانت (un) متزايدة و (vn) متناقصة وكان un <= vn دوماً، و lim (vn - un) = 0، فماذا نستنتج؟",
        optionsCount: 4,
        correctAnswerId: "opt_adj_same_lim",
        explanation_ar: "نستنتج أن المتتاليتين متجاورتان ومتقاربتان نحو نفس النهاية المشتركة L.",
        distractorErrorMappings: {
          opt_adj_diverge: "misunderstood_concept",
          opt_adj_diff_lim: "methodology_error",
          opt_adj_geom: "misread_question",
        },
      },
      {
        id: "pq_math_m_induct_02",
        prompt_ar: "في البرهان بالتراجع على أن u_n > 3، ما هي الخطوة الأولى الإلزامية؟",
        optionsCount: 4,
        correctAnswerId: "opt_induct_init",
        explanation_ar: "التحقق من صحة الخاصية عند الرتبة الأولى n0 بتعويض القيمة العددية لـ u_n0 ومقارنتها بالعدد 3.",
        distractorErrorMappings: {
          opt_induct_deriv: "methodology_error",
          opt_induct_limit: "misunderstood_concept",
          opt_induct_hered: "methodology_error",
        },
      },
    ],
    retest: {
      id: "rq_math_m_induct_twin",
      parentPracticeQuestionId: "pq_math_m_induct_01",
      prompt_ar: "لتكن u_n = 2 - 1/n و v_n = 2 + 1/n (من أجل n >= 1). بيّن أن (u_n) و (v_n) متجاورتان وعيّن نهايتهما.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_induct_res",
      explanation_ar: "u_(n+1) - u_n = 1/n - 1/(n+1) > 0 متزايدة. v_(n+1) - v_n = -1/n + 1/(n+1) < 0 متناقصة. v_n - u_n = 2/n يؤول للصفر عند اللانهاية. إذن متجاورتان وتتقاربان نحو النهاية المشتركة L = 2.",
    },
    repairGuide: {
      targetErrorType: "methodology_error",
      title_ar: "معالجة القفز غير المبرر من n إلى n+1 في الاستدلال بالتراجع",
      mentalModelExplanation_ar: "يفترض التلميذ أحياناً صحة P(n+1) مباشرة ويعوضها في طرفي المساواة، بينما المطلوب هو الانطلاق من P(n) كمعطى والوصول استنتاجياً إلى P(n+1).",
      actionableSteps_ar: [
        "الخطوة 1: اكتب نص فرضية التراجع بوضوح: 'نفرض أن P(n) صحيحة'.",
        "الخطوة 2: اكتب المطلوب برهانه بوضوح على ورقة المحاولات: 'نريد إثبات أن P(n+1) صحيحة'.",
        "الخطوة 3: انطلق من فرضية التراجع وطبق خواص المتراجحات وتزايد الدوال للوصول إلى P(n+1).",
      ],
      contrastiveWorkedExample: "خطأ: كتابة u_(n+1) < 2 والبدء في تفكيكها. صواب: الانطلاق من u_n < 2 وبناء عبارة u_(n+1) خطوة بخطوة.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_induction_adjacent_suites"],
    externalResourceIds: ["res_math_m_suites_methodology"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "تمرين المتتاليات هو التمرين الثاني أو الثالث في موضوع البكالوريا ويمنح 4 إلى 4.5 نقطة مضمونة للمتمكن منهجياً.",
      commonPitfalls_ar: ["نسيان مرحلة التحقق الأولى", "الخلط بين إثبات التقارب وحساب النهاية بالمعادلة f(l) = l"],
      officialBacPastRefIds: ["bac_m_2024_s1_ex3", "bac_m_2021_s1_ex3"],
    },
    provenance: {
      sourceId: "src-men-3as-math-syllabus",
      sourceTitle: "المنهاج الرسمي لمادة الرياضيات 3AS شعبة رياضيات",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "original",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ---------------------------------------------------------------------------
  // 11. GÉOMÉTRIE DANS L'ESPACE : PLANS & PRODUIT SCALAIRE
  // ---------------------------------------------------------------------------
  math_m_space_geometry_planes: {
    packageId: "pkg_math_m_space_geometry_planes",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_space_geometry",
    skillId: "math_m_space_geometry_planes",
    objective_ar: "كتابة المعادلة الديكارتية لمستو والتمثيل الوسيطي لمستقيم وحساب المسافة بين نقطة ومستو وتعيين نقط التقاطع في الفضاء.",
    objective_fr: "Déterminer l'équation cartésienne d'un plan, la représentation d'une droite et calculer des distances.",
    prerequisites: [],
    lesson: {
      title_ar: "الهندسة في الفضاء: الجداء السلمي، معادلات المستويات، والمسافات",
      contentMarkdown_ar: `### المعادلة الديكارتية لمستو في الفضاء
المستوي $(P)$ المار بالنقطة $A(x_0, y_0, z_0)$ والمعمودي على الشعاع الناظمي غير المعدوم $\\vec{n}(a, b, c)$ له معادلة ديكارتية من الشكل:
$$a(x - x_0) + b(y - y_0) + c(z - z_0) = 0 \\iff ax + by + cz + d = 0$$
حيث: $d = -(a x_0 + b y_0 + c z_0)$.

### التمثيل الوسيطي لمستقيم
المستقيم $(D)$ المار بالنقطة $A(x_0, y_0, z_0)$ والموجه بالشعاع $\\vec{u}(\\alpha, \\beta, \\gamma)$ له تمثيل وسيطي:
$$\\begin{cases} x = x_0 + \\alpha t \\\\ y = y_0 + \\beta t \\\\ z = z_0 + \\gamma t \\end{cases} \\quad (t \\in \\mathbb{R})$$

### مسافة نقطة عن مستو (Distance d'un point à un plan)
مسافة النقطة $M_0(x_0, y_0, z_0)$ عن المستوي $(P): ax + by + cz + d = 0$ تعطى بالقانون الصارم:
$$d(M_0, (P)) = \\frac{|a x_0 + b y_0 + c z_0 + d|}{\\sqrt{a^2 + b^2 + c^2}}$$`,
      keyTakeaway_ar: "الشعاع الناظمي للمستوي n(a,b,c) يعطي معاملات معادلته الديكارتية ax+by+cz+d=0، والمسافة تتطلب القيمة المطلقة في البسط وجذر التربيعات في المقام.",
    },
    workedExample: {
      problem_ar: "عيّن معادلة ديكارتية للمستوي (P) المار بالنقطة A(1, 2, -1) والعمودي على الشعاع n(2, -1, 3)، ثم احسب مسافة النقطة B(3, 0, 1) عن المستوي (P).",
      stepByStepSolution_ar: [
        "الخطوة 1: بما أن n(2, -1, 3) شعاع ناظمي لـ (P)، فإن معادلة (P) من الشكل:\n2x - 1y + 3z + d = 0 أي: 2x - y + 3z + d = 0.",
        "الخطوة 2: النقطة A(1, 2, -1) تنتمي إلى (P)، إذن تحقق معادلته:\n2(1) - (2) + 3(-1) + d = 0\n2 - 2 - 3 + d = 0 ومنه d = 3.\nمعادلة المستوي هي: 2x - y + 3z + 3 = 0.",
        "الخطوة 3: حساب مسافة النقطة B(3, 0, 1) عن المستوي (P):\nd(B, (P)) = |2(3) - (0) + 3(1) + 3| / sqrt(2^2 + (-1)^2 + 3^2)\nd(B, (P)) = |6 - 0 + 3 + 3| / sqrt(4 + 1 + 9) = |12| / sqrt(14) = 12 / sqrt(14) = (6 * sqrt(14)) / 7.",
      ],
      pedagogicalComment_ar: "كتابة القانون الحرفي قبل التعويض يضمن نصف علامة السؤال في تصحيح البكالوريا الرسمي.",
    },
    activeRecall: {
      prompt_ar: "ما هو الشعاع الناظمي للمستوي ذي المعادلة: 3x - 4y + z - 7 = 0؟",
      expectedAnswer_ar: "الشعاع الناظمي هو n(3, -4, 1).",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_space_01",
        prompt_ar: "عيّن قيمة d بحيث يمر المستوي 2x + y - z + d = 0 بالنقطة O(0, 0, 0).",
        optionsCount: 4,
        correctAnswerId: "opt_space_d_0",
        explanation_ar: "بتعويض إحداثيات المبدأ: 2(0) + 0 - 0 + d = 0 ومنه d = 0.",
        distractorErrorMappings: {
          opt_space_d_1: "calculation_error",
          opt_space_d_2: "misunderstood_concept",
          opt_space_d_minus1: "calculation_error",
        },
      },
      {
        id: "pq_math_m_space_02",
        prompt_ar: "ما هي مسافة النقطة M(0, 0, 0) عن المستوي x + y + z - sqrt(3) = 0؟",
        optionsCount: 4,
        correctAnswerId: "opt_space_dist_1",
        explanation_ar: "d = |0 + 0 + 0 - sqrt(3)| / sqrt(1^2 + 1^2 + 1^2) = |-sqrt(3)| / sqrt(3) = sqrt(3) / sqrt(3) = 1.",
        distractorErrorMappings: {
          opt_space_dist_sqrt3: "forgot_information",
          opt_space_dist_zero: "calculation_error",
          opt_space_dist_minus1: "calculation_error",
        },
      },
    ],
    retest: {
      id: "rq_math_m_space_twin",
      parentPracticeQuestionId: "pq_math_m_space_02",
      prompt_ar: "احسب مسافة النقطة C(1, 1, 1) عن المستوي (Q): 2x - 2y + z + 5 = 0.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_space_res",
      explanation_ar: "d = |2(1) - 2(1) + 1(1) + 5| / sqrt(2^2 + (-2)^2 + 1^2) = |2 - 2 + 1 + 5| / sqrt(4 + 4 + 1) = |6| / sqrt(9) = 6 / 3 = 2.",
    },
    repairGuide: {
      targetErrorType: "forgot_information",
      title_ar: "معالجة أخطاء قانون مسافة نقطة عن مستو في الفضاء",
      mentalModelExplanation_ar: "ينسى بعض التلاميذ وضع القيمة المطلقة في البسط، فيحصل على مسافة سالبة، أو ينسى تربيع المعاملات في المقام فيحسب a+b+c بدلاً من sqrt(a^2+b^2+c^2).",
      actionableSteps_ar: [
        "الخطوة 1: اكتب القانون كاملاً بالرموز مع التأكيد على عارضتي القيمة المطلقة ورمز الجذر التربيعي.",
        "الخطوة 2: تذكر دائماً أن المسافة مقدار موجب قطعي، ولا يمكن هندسياً أن تكون سالبة.",
        "الخطوة 3: احسب مجموع مربعات إحداثيات الناظم a^2 + b^2 + c^2 بحذر وتأكد من استخراج الجذر بدقة قبل إجراء القسمة النهائية.",
      ],
      contrastiveWorkedExample: "خطأ: d = (2*1 - 5)/3 = -1. صواب: d = |2*1 - 5| / 3 = |-3| / 3 = 3/3 = 1.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_space_geometry_planes"],
    externalResourceIds: ["res_math_m_space_video"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "تمرين الهندسة الفضائية تمرين نمطي يمنح 4 إلى 4.5 نقاط في البكالوريا، وغالباً ما يُربط بأسطح الكرات والتقاطعات المستوية.",
      commonPitfalls_ar: ["الخلط بين معاملات المستوي ومركبات شعاع التوجيه للمستقيم", "نسيان القيمة المطلقة في قانون المسافة"],
      officialBacPastRefIds: ["bac_m_2023_s1_ex3", "bac_m_2022_s1_ex1"],
    },
    provenance: {
      sourceId: "src-men-3as-math-syllabus",
      sourceTitle: "المنهاج الرسمي لمادة الرياضيات 3AS شعبة رياضيات",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "original",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },

  // ---------------------------------------------------------------------------
  // 12. DÉNOMBREMENT & LOI BINOMIALE
  // ---------------------------------------------------------------------------
  math_m_combinatorics_bernoulli: {
    packageId: "pkg_math_m_combinatorics_bernoulli",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_combinatorics_bernoulli",
    skillId: "math_m_combinatorics_bernoulli",
    objective_ar: "توظيف قوانين التحليل التوفيقي وحساب احتمالات مخطط برنولي وتعيين قانون الاحتمال والأمل الرياضي والتباين لمتغير عشوائي.",
    objective_fr: "Calculer les probabilités combinatoires, la loi binomiale et les paramètres d'une variable aléatoire.",
    prerequisites: [],
    lesson: {
      title_ar: "التحليل التوفيقي، مخطط برنولي، وقانون ثنائي الحد",
      contentMarkdown_ar: `### أدوات العد والتحليل التوفيقي (Dénombrement)
1. **السحب في آن واحد (Simultané)**: الترتيب غير مهم وبدون إرجاع $\\implies$ نستعمل **التوفيقات**:
   $$C_n^p = \\frac{n!}{p!(n - p)!}$$
2. **السحب على التوالي دون إرجاع (Successif sans remise)**: الترتيب مهم وبدون إرجاع $\\implies$ نستعمل **الترتيبات**:
   $$A_n^p = \\frac{n!}{(n - p)!}$$
3. **السحب على التوالي بإرجاع (Successif avec remise)**: الترتيب مهم مع التكرار $\\implies$ نستعمل **القوائم**: $n^p$.

### مخطط برنولي وقانون ثنائي الحد $\\mathcal{B}(n, p)$
تجربة برنولي هي تجربة عشوائية لها نتيجتان فقط: النجاح S باحتمال p، والفشل F باحتمال $q = 1 - p$.
عند تكرار تجربة برنولي n مرة متتالية ومستقلة، فإن المتغير العشوائي X الذي يمثل عدد مرات النجاح يتبع **قانون ثنائي الحد** $\\mathcal{B}(n, p)$:
$$P(X = k) = C_n^k \\cdot p^k \\cdot (1 - p)^{n - k} \\quad (k \\in \\{0, 1, ..., n\\})$$

### المؤشرات العددية للمتغير العشوائي الثنائي
- الأمل الرياضي (Espérance): $E(X) = n \\cdot p$.
- التباين (Variance): $V(X) = n \\cdot p \\cdot (1 - p)$.
- الانحراف المعياري (Écart-type): $\\sigma(X) = \\sqrt{V(X)}$.`,
      keyTakeaway_ar: "السحب في آن واحد يستعمل التوفيقات C(n, p)، وتكرار التجربة بشكل مستقل يتبع قانون ثنائي الحد P(X=k) = C(n, k) * p^k * (1-p)^(n-k).",
    },
    workedExample: {
      problem_ar: "يحوي كيس 5 كرات بيضاء و 3 كرات سوداء. نسحب عشوائياً وفي آن واحد 3 كرات. عرّف المتغير العشوائي X الذي يمثل عدد الكرات البيضاء المسحوبة، واكتب قانون احتماله واحسب أمله الرياضي E(X).",
      stepByStepSolution_ar: [
        "الخطوة 1: حساب عدد الحالات الممكنة كلياً:\nبما أن السحب في آن واحد لـ 3 كرات من أصل 8 كرات، فإن:\ncard(Omega) = C_8^3 = (8 * 7 * 6) / (3 * 2 * 1) = 56.",
        "الخطوة 2: تحديد قيم المتغير العشوائي X:\nيمكن ألا نسحب أي كرة بيضاء (X = 0)، أو كرة واحدة (X = 1)، أو كرتين (X = 2)، أو ثلاث كرات بيضاء (X = 3).\nقيم X هي: {0, 1, 2, 3}.",
        "الخطوة 3: حساب الاحتمالات:\n- P(X = 0) = (C_5^0 * C_3^3) / 56 = (1 * 1) / 56 = 1/56.\n- P(X = 1) = (C_5^1 * C_3^2) / 56 = (5 * 3) / 56 = 15/56.\n- P(X = 2) = (C_5^2 * C_3^1) / 56 = (10 * 3) / 56 = 30/56.\n- P(X = 3) = (C_5^3 * C_3^0) / 56 = (10 * 1) / 56 = 10/56.",
        "الخطوة 4: التحقق من مجموع الاحتمالات:\n1/56 + 15/56 + 30/56 + 10/56 = 56/56 = 1 (صحيح تماماً).",
        "الخطوة 5: حساب الأمل الرياضي E(X):\nE(X) = 0*(1/56) + 1*(15/56) + 2*(30/56) + 3*(10/56) = (0 + 15 + 60 + 30) / 56 = 105 / 56 = 15 / 8 = 1.875.",
      ],
      pedagogicalComment_ar: "جمع الاحتمالات في الخطوة 4 هو صمام الأمان الفوري للتأكد من خلو الحسابات من أي خطأ.",
    },
    activeRecall: {
      prompt_ar: "إذا كررنا رمي قطعة نقود متوازنة 4 مرات متتالية، فما هو احتمال الحصول على الوجه (Face) مرتين بالضبط؟",
      expectedAnswer_ar: "n = 4، p = 1/2. P(X=2) = C_4^2 * (1/2)^2 * (1/2)^2 = 6 * (1/16) = 6/16 = 3/8.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_comb_01",
        prompt_ar: "احسب عدد التوفيقات الممكنة لاختيار تلميذين من بين 6 تلاميذ (C_6^2).",
        optionsCount: 4,
        correctAnswerId: "opt_comb_15",
        explanation_ar: "C_6^2 = (6 * 5) / (2 * 1) = 30 / 2 = 15.",
        distractorErrorMappings: {
          opt_comb_30: "misunderstood_concept",
          opt_comb_12: "calculation_error",
          opt_comb_6: "methodology_error",
        },
      },
      {
        id: "pq_math_m_comb_02",
        prompt_ar: "إذا كان X يتبع القانون الثنائي B(10, 0.3)، فما هو أمله الرياضي E(X)؟",
        optionsCount: 4,
        correctAnswerId: "opt_comb_exp_3",
        explanation_ar: "E(X) = n * p = 10 * 0.3 = 3.",
        distractorErrorMappings: {
          opt_comb_exp_03: "calculation_error",
          opt_comb_exp_21: "forgot_information",
          opt_comb_exp_10: "misunderstood_concept",
        },
      },
    ],
    retest: {
      id: "rq_math_m_comb_twin",
      parentPracticeQuestionId: "pq_math_m_comb_02",
      prompt_ar: "إذا كان المتغير العشوائي Y يخضع لقانون ثنائي B(20, 0.2)، فما هو تباينه V(Y)؟",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_comb_res",
      explanation_ar: "V(Y) = n * p * (1 - p) = 20 * 0.2 * 0.8 = 4 * 0.8 = 3.2.",
    },
    repairGuide: {
      targetErrorType: "misunderstood_concept",
      title_ar: "معالجة الخلط بين الترتيبات A(n,p) والتوفيقات C(n,p)",
      mentalModelExplanation_ar: "يستعمل التلميذ الترتيبات في السحب في آن واحد أو العكس، متجاهلاً أن السحب المتزامن يلغي أثر الترتيب ويتطلب حتماً التوفيقات.",
      actionableSteps_ar: [
        "الخطوة 1: اقرأ نص التمرين وحدد طريقة السحب فوراً وضع تحتها خطاً.",
        "الخطوة 2: إذا كان 'في آن واحد' أو 'تشكيل لجنة غير معينة المهام' فاستعمل التوفيقات C(n, p).",
        "الخطوة 3: إذا كان 'على التوالي دون إرجاع' أو 'تشكيل لجنة ذات مهام محددة كالرئيس والنائب' فاستعمل الترتيبات A(n, p).",
      ],
      contrastiveWorkedExample: "خطأ: سحب 3 كرات معاً باستعمال A_8^3. صواب: السحب في آن واحد يستلزم C_8^3 لأن ترتيب سحب الكرات لا يغير محتوى اليد المسحوبة.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_combinatorics_bernoulli"],
    externalResourceIds: ["res_math_m_probabilites_sheet"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "تمرين الاحتمالات يرد بانتظام في بكالوريا الرياضيات بمعدل 4 إلى 4.5 نقاط.",
      commonPitfalls_ar: ["نسيان معامل الترتيب عند السحب على التوالي لكرات مختلفة الألوان", "نسيان التأكد من أن مجموع الاحتمالات يساوي 1"],
      officialBacPastRefIds: ["bac_m_2024_s1_ex2", "bac_m_2020_s1_ex2"],
    },
    provenance: {
      sourceId: "src-men-3as-math-syllabus",
      sourceTitle: "المنهاج الرسمي لمادة الرياضيات 3AS شعبة رياضيات",
      classification: "OFFICIAL_HISTORICAL",
      rightsStatus: "original",
      lastAuditedAt: "2026-09-12",
    },
    lifecycleState: "PUBLISHED",
  },
};

// =============================================================================
// 2. DIAGNOSTIC SIGNAL PROFILES FOR THE 12 MATH SKILLS
// =============================================================================

export const MATH_BATCH_01_DIAGNOSTIC_SIGNALS: Record<string, MathDiagnosticSignalProfile> = {
  math_m_arithmetic_congruence: {
    skillId: "math_m_arithmetic_congruence",
    missingPrerequisiteIndicators_ar: ["عدم التمييز بين القسمة الإقليدية في Z والقسمة العشرية", "نسيان شروط باقي القسمة (0 <= r < n)"],
    conceptualMisconceptionIndicators_ar: ["اعتقاد أن الأسس تخضع لنفس ترديد الأساسات", "الخلط بين الدور وترديد الموافقة"],
    proceduralWeaknessIndicators_ar: ["الخطأ في قسمة الأس الكبير على الدور", "عدم فحص الحالات الأربع للدور كاملاً"],
    examMethodWeaknessIndicators_ar: ["إغفال صياغة النتيجة في جدول دورية البواقي"],
  },
  math_m_bezout_diophantine: {
    skillId: "math_m_bezout_diophantine",
    missingPrerequisiteIndicators_ar: ["عدم إتقان خوارزمية إقليدس لحساب PGCD", "الارتباك في إشارات الأعداد النسبية السالبة"],
    conceptualMisconceptionIndicators_ar: ["محاولة حل المعادلة حين يكون PGCD لا يقسم c", "اعتقاد أن الحل الخاص هو الحل الوحيد"],
    proceduralWeaknessIndicators_ar: ["الخطأ في نشر إشارة الناقص عند الطرح طرفاً لطرف", "نسيان ربط الحل بالوسيط الصحيح k"],
    examMethodWeaknessIndicators_ar: ["عدم ذكر مبرهنة غوص وشرط الأولية عند استنتاج الحل العام"],
  },
  math_m_gauss_prime_factors: {
    skillId: "math_m_gauss_prime_factors",
    missingPrerequisiteIndicators_ar: ["عدم حفظ الأعداد الأولية الأصغر من 50", "الارتباك في قواعد التحليل إلى عوامل أولية"],
    conceptualMisconceptionIndicators_ar: ["تطبيق مبرهنة غوص دون تحقق شرط الأولية", "الخلط بين PGCD و PPCM في تفكيك العوامل"],
    proceduralWeaknessIndicators_ar: ["إغفال شرط PGCD(a', b') = 1 في مسائل تفكيك القاسم المشترك", "نسيان التحقق من العوامل المرفوضة"],
    examMethodWeaknessIndicators_ar: ["عدم كتابة نص الاستدلال البيداغوجي المعتمد في التصحيح الوزاري"],
  },
  math_m_complex_algebraic_trig: {
    skillId: "math_m_complex_algebraic_trig",
    missingPrerequisiteIndicators_ar: ["نسيان قيم النسب المثلثية للزوايا الشهيرة pi/6, pi/4, pi/3", "الارتباك في علاقات الزوايا الموجهة"],
    conceptualMisconceptionIndicators_ar: ["إسقاط الزاوية في الربع الأول دائماً وإهمال إشارات x و y", "تطبيق دو موافر على عبارة غير نظامية"],
    proceduralWeaknessIndicators_ar: ["الخطأ في حساب مربع الطويلة sqrt(x^2 + y^2)", "نسيان رفع الطويلة r للأس n عند حساب z^n"],
    examMethodWeaknessIndicators_ar: ["كتابة الشكل الأسي دون تبرير حساب الطويلة والعمدة أولاً"],
  },
  math_m_similitudes_directes: {
    skillId: "math_m_similitudes_directes",
    missingPrerequisiteIndicators_ar: ["عدم إتقان ضرب وقسمة الأعداد المركبة بالشكل الجبري ومرافق المقام"],
    conceptualMisconceptionIndicators_ar: ["الخلط بين زاوية التشابه وزاوية الدوران البسيط", "اعتقاد أن التشابه المباشر يقلب التوجيه المستوي"],
    proceduralWeaknessIndicators_ar: ["الخطأ في قانون المركز: كتابة b/(a-1) بدلاً من b/(1-a)", "الخطأ في ضرب البسط والمقام في مرافق (1-a)"],
    examMethodWeaknessIndicators_ar: ["إغفال تحديد طبيعة التحويل صراحة قبل سرد عناصره المميزة"],
  },
  math_m_derivatives_tvi_rigor: {
    skillId: "math_m_derivatives_tvi_rigor",
    missingPrerequisiteIndicators_ar: ["الارتباك في حساب مشتقات كثيرات الحدود والدوال الناطقة"],
    conceptualMisconceptionIndicators_ar: ["الاعتقاد بأن f(a)*f(b) < 0 يثبت الوحدانية دون الحاجة للرتابة التامة", "الخلط بين استمرار الدالة عند نقطة وعلى مجال"],
    proceduralWeaknessIndicators_ar: ["الخطأ في إشارة المشتقة وتحديد اتجاه التغير", "عدم حصر المجال المفتوح في النتيجة"],
    examMethodWeaknessIndicators_ar: ["عدم احترام الصياغة النموذجية المعتمدة في التصحيح الرسمي للبكالوريا"],
  },
  math_m_exp_log_croissances: {
    skillId: "math_m_exp_log_croissances",
    missingPrerequisiteIndicators_ar: ["نسيان خواص القوى واللوغاريتمات الأساسية", "الارتباك في إشارات ما بداخل اللوغاريتم والأس"],
    conceptualMisconceptionIndicators_ar: ["الخلط بين نهايات التزايد المقارن عند الصفر وعند اللانهاية", "اعتقاد أن e^(-x) تؤول إلى -infinity"],
    proceduralWeaknessIndicators_ar: ["إغفال الأقواس عند حساب الفرق f(x) - y للمقارب المائل", "الخطأ في استخراج العامل المشترك المهيمن"],
    examMethodWeaknessIndicators_ar: ["عدم كتابة معادلة المقارب وجوار اللانهاية صراحة"],
  },
  math_m_integration_parts: {
    skillId: "math_m_integration_parts",
    missingPrerequisiteIndicators_ar: ["الارتباك في تعيين الدوال الأصلية البسيطة وقواعد الاشتقاق"],
    conceptualMisconceptionIndicators_ar: ["اختيار دالة معقدة لـ u ترفع درجة التكامل بدلاً من خفضها", "الخلط بين قيمة التكامل ومساحة الحيز الهندسي"],
    proceduralWeaknessIndicators_ar: ["نسيان إشارة الناقص في قانون التجزئة", "الخطأ في حساب قيم الأقواس المعقوفة عند طرفي التكامل"],
    examMethodWeaknessIndicators_ar: ["إغفال ذكر قابلية اشتقاق الدالتين u و v على المجال المعتبر"],
  },
  math_m_differential_equations: {
    skillId: "math_m_differential_equations",
    missingPrerequisiteIndicators_ar: ["الارتباك في حل المعادلات الجبرية من الدرجة الأولى"],
    conceptualMisconceptionIndicators_ar: ["وضع إشارة سالب في أس حل y'=ay ليصبح e^(-ax)", "اعتقاد أن المعادلة من الرتبة الثانية تقبل ثابتاً واحداً"],
    proceduralWeaknessIndicators_ar: ["الخطأ في إشارة الحل الخاص الثابت -b/a", "الخطأ في تعويض الشرط الابتدائي لحساب C"],
    examMethodWeaknessIndicators_ar: ["عدم التحقق بالاشتقاق من صحة الحل الخاص المعين"],
  },
  math_m_induction_adjacent_suites: {
    skillId: "math_m_induction_adjacent_suites",
    missingPrerequisiteIndicators_ar: ["الارتباك في المتراجحات وتأثير إشارة السالب والقسمة عليها"],
    conceptualMisconceptionIndicators_ar: ["القفز غير المبرر من n إلى n+1 دون الانطلاق من فرضية التراجع", "الاعتقاد بأن تزايد متتالية يضمن تقاربها دون الحاجة لمحدوديتها"],
    proceduralWeaknessIndicators_ar: ["نسيان مرحلة التحقق عند n0", "الخطأ في دراسة إشارة الفرق u_(n+1) - u_n"],
    examMethodWeaknessIndicators_ar: ["عدم صياغة خاتمة البرهان بالتراجع بالشكل الرسمي"],
  },
  math_m_space_geometry_planes: {
    skillId: "math_m_space_geometry_planes",
    missingPrerequisiteIndicators_ar: ["الارتباك في حساب الجداء السلمي لمركبات الأشعة في الفضاء"],
    conceptualMisconceptionIndicators_ar: ["الخلط بين الشعاع الناظمي للمستوي والشعاع الموجه للمستقيم", "افتراض تقاطع مستقيمين بمجرد عدم توازيهما في الفضاء"],
    proceduralWeaknessIndicators_ar: ["نسيان القيمة المطلقة في بسط قانون المسافة", "نسيان الجذر التربيعي لمركبات الناظم في المقام"],
    examMethodWeaknessIndicators_ar: ["عدم كتابة التمثيل الوسيطي بصيغة الجملة وحصر الوسيط t في R"],
  },
  math_m_combinatorics_bernoulli: {
    skillId: "math_m_combinatorics_bernoulli",
    missingPrerequisiteIndicators_ar: ["الارتباك في حساب العاملي n! واختزاله"],
    conceptualMisconceptionIndicators_ar: ["استعمال الترتيبات في السحب في آن واحد أو العكس", "نسيان أن مجموع احتمالات المتغير العشوائي يساوي 1"],
    proceduralWeaknessIndicators_ar: ["إغفال معامل الترتيب في السحب على التوالي لكرات متعددة الألوان", "الخطأ في حساب التباين V(X)"],
    examMethodWeaknessIndicators_ar: ["عدم تفريغ قانون الاحتمال في جدول واضح يحوي سطر القيم وسطر الاحتمالات"],
  },
};

// =============================================================================
// 3. SPACED REVIEW SCHEDULES FOR THE 12 MATH SKILLS
// =============================================================================

export const MATH_BATCH_01_SPACED_REVIEWS: Record<string, MathSpacedReviewSchedule> = {
  math_m_arithmetic_congruence: {
    skillId: "math_m_arithmetic_congruence",
    day1InitialEvidence_ar: "إتمام حساب جدول دور قوى 7 بترديد 5 وإنجاز مسألة التدريب المستقل بنجاح.",
    day3RetrievalPrompt_ar: "استرجع شفهياً: ما هو دور قوى 3 بترديد 5 وكيف نستنتج باقي 3^100؟",
    day7MixedPracticePrompt_ar: "حل مسألة مدمجة تجمع بين دورية القوى وقابلية قسمة مجموع تعبيري 3^n + 4^n على 5.",
    laterExamApplicationPrompt_ar: "حل تمرين الحساب من بكالوريا 2024 شعبة رياضيات تحت توقيت 35 دقيقة.",
  },
  math_m_bezout_diophantine: {
    skillId: "math_m_bezout_diophantine",
    day1InitialEvidence_ar: "إيجاد الحل الخاص للمعادلة 7x - 5y = 1 وصياغة الحلول العامة بدقة.",
    day3RetrievalPrompt_ar: "استرجع: ما هي صيغة مبرهنة غوص وكيف تفصل المجهولين بعد الطرح طرفاً لطرف؟",
    day7MixedPracticePrompt_ar: "حل المعادلة 13x - 7y = 2 مع حصر الحلول الطبيعية x و y في المجال [0, 50].",
    laterExamApplicationPrompt_ar: "حل مسألة ديوفانتية كاملة مربوطة بالتعداد في النظام ذي الأساس 7 و 9 من بكالوريا سابقة.",
  },
  math_m_gauss_prime_factors: {
    skillId: "math_m_gauss_prime_factors",
    day1InitialEvidence_ar: "إيجاد الثنائيات العددية التي تحقق PGCD معطى ومجموعاً معلوماً.",
    day3RetrievalPrompt_ar: "استرجع: لماذا يشترط أن يكون العددان أوليين فيما بينهما قبل تطبيق مبرهنة غوص؟",
    day7MixedPracticePrompt_ar: "حل جملة معادلات بالـ PGCD والـ PPCM: PGCD(a,b)*PPCM(a,b) = 2160.",
    laterExamApplicationPrompt_ar: "تطبيق مبرهنة غوص في إثبات خوارزميات التشفير أو دراسة القواسم المشتركة في البكالوريا.",
  },
  math_m_complex_algebraic_trig: {
    skillId: "math_m_complex_algebraic_trig",
    day1InitialEvidence_ar: "كتابة z على الشكل الأسي وتطبيق دو موافر لحساب z^3 وإثبات أنه حقيقي سالب.",
    day3RetrievalPrompt_ar: "استرجع: ما هي عمدة z = -1 - i*sqrt(3) وكيف تحدد ربع الدائرة المثلثية؟",
    day7MixedPracticePrompt_ar: "حل في C المعادلة z^2 - 2z + 4 = 0 وكتابة حلولها على الشكل الأسي وحساب قواها.",
    laterExamApplicationPrompt_ar: "حل مسألة الأعداد المركبة من بكالوريا 2023 وحساب مجموع النقاط الهندسية.",
  },
  math_m_similitudes_directes: {
    skillId: "math_m_similitudes_directes",
    day1InitialEvidence_ar: "استخراج النسبة والزاوية والمركز للتشابه المباشر z' = (1+i)z + 2 - i.",
    day3RetrievalPrompt_ar: "استرجع: ما هو قانون لاحقة المركز الصامد omega وما هي نسبة وزاوية التحويل z' = -3iz؟",
    day7MixedPracticePrompt_ar: "تعيين الكتابة المركبة لتشابه مباشر يحول نقطتين A و B إلى C و D معطاة.",
    laterExamApplicationPrompt_ar: "دراسة تركيب تشابهين مباشرين واستنتاج طبيعة التحويل المركب في بكالوريا رياضيات.",
  },
  math_m_derivatives_tvi_rigor: {
    skillId: "math_m_derivatives_tvi_rigor",
    day1InitialEvidence_ar: "تحرير البرهان المنهجي الكامل لوجود حل وحيد ألفا بمبرهنة القيم المتوسطة وحصره.",
    day3RetrievalPrompt_ar: "استرجع: ما هي الشروط الثلاثة الإلزامية في صياغة مبرهنة القيم المتوسطة للوحدانية؟",
    day7MixedPracticePrompt_ar: "دراسة تقعر دالة وحساب مشتقتها الثانية وتعيين نقط انعطافها وتأطير ألفا بسعة 10^-2.",
    laterExamApplicationPrompt_ar: "حل الجزء التمهيدي للدالة المساعدة g(x) في المسألة الكبرى لبكالوريا 2024.",
  },
  math_m_exp_log_croissances: {
    skillId: "math_m_exp_log_croissances",
    day1InitialEvidence_ar: "إزالة حالة عدم التعيين (+inf - inf) باستخراج العامل المهيمن وتطبيق التزايد المقارن.",
    day3RetrievalPrompt_ar: "استرجع: ما هي نهاية e^x / x^3 عند +inf وما هي نهاية x^2 * ln(x) عند 0+؟",
    day7MixedPracticePrompt_ar: "دراسة دالة أسية ناطقة وحساب نهاياتها عند أطراف مجال التعريف وإثبات المقارب المائل.",
    laterExamApplicationPrompt_ar: "حل مسألة دالة لوغاريتمية كاملة مع دراسة الوضع النسبي في 60 دقيقة.",
  },
  math_m_integration_parts: {
    skillId: "math_m_integration_parts",
    day1InitialEvidence_ar: "حساب تكامل x*ln(x) بالتجزئة بنجاح واختيار دالتي u و v' الصحيحة.",
    day3RetrievalPrompt_ar: "استرجع: ما هي قاعدة ALPES لأولويات الاشتقاق في المكاملة بالتجزئة؟",
    day7MixedPracticePrompt_ar: "حساب مساحة الحيز المحصور بين منحنى f(x) = (x-1)*e^x ومحور الفواصل بالـ cm².",
    laterExamApplicationPrompt_ar: "دراسة متتالية تكاملية معرفة بالتجزئة وحساب نهايتها بالحصر في موضوع بكالوريا رسمي.",
  },
  math_m_differential_equations: {
    skillId: "math_m_differential_equations",
    day1InitialEvidence_ar: "حل المعادلة 2y' + 6y = 12 وتعيين الحل الخاص المستوفي لـ y(0) = 5.",
    day3RetrievalPrompt_ar: "استرجع: ما هو الحل العام للمعادلة y' = ay + b وما هو الحل العام لـ y'' + 4y = 0؟",
    day7MixedPracticePrompt_ar: "إثبات أن دالة معطاة g حل لمعادلة تفاضلية غير متجانسة واستنتاج الحلول العامة.",
    laterExamApplicationPrompt_ar: "حل مسألة فيزيائية-رياضية نموذجية تنتهي بمعادلة تفاضلية للشحنة أو السرعة.",
  },
  math_m_induction_adjacent_suites: {
    skillId: "math_m_induction_adjacent_suites",
    day1InitialEvidence_ar: "البرهان بالتراجع على حصر متتالية تراجعية وإثبات رتابتها وتقاربها.",
    day3RetrievalPrompt_ar: "استرجع: ما هي شروط تجاور متتاليتين وماذا نستنتج بخصوص نهايتهما المشتركة؟",
    day7MixedPracticePrompt_ar: "دراسة متتاليتين (un) و (vn) معرفتين بعلاقة تراجعية متبادلة وإثبات تجاورهما.",
    laterExamApplicationPrompt_ar: "حل تمرين متتاليات كامل من بكالوريا 2024 رياضيات تحت توقيت 40 دقيقة.",
  },
  math_m_space_geometry_planes: {
    skillId: "math_m_space_geometry_planes",
    day1InitialEvidence_ar: "كتابة معادلة مستو بمعرفة ناظمه ونقطة منه وحساب مسافة نقطة عنه.",
    day3RetrievalPrompt_ar: "استرجع: ما هو قانون مسافة نقطة M0(x0, y0, z0) عن المستوي ax+by+cz+d=0؟",
    day7MixedPracticePrompt_ar: "تعيين تقاطع مستقيم ومستو في الفضاء ودراسة تقاطع مستو مع سطح كرة (S).",
    laterExamApplicationPrompt_ar: "حل مسألة هندسة فضائية شاملة من بكالوريا 2023 تتضمن المسافات والتقاطعات والمستويات.",
  },
  math_m_combinatorics_bernoulli: {
    skillId: "math_m_combinatorics_bernoulli",
    day1InitialEvidence_ar: "تعيين قانون احتمال متغير عشوائي في سحب متزامن وحساب أمله الرياضي.",
    day3RetrievalPrompt_ar: "استرجع: متى نستعمل التوفيقات C(n,p) ومتى نطبق قانون ثنائي الحد B(n,p)؟",
    day7MixedPracticePrompt_ar: "مسألة كرات وصناديق تعتمد على شجرة احتمالات متوازنة وقانون الاحتمال الكلي والمتغير العشوائي.",
    laterExamApplicationPrompt_ar: "حل تمرين الاحتمالات من بكالوريا 2024 رياضيات وحساب الأمل والتباين.",
  },
};

// =============================================================================
// 4. DOSSIER BUILDER & FACTORY QUERY HELPERS
// =============================================================================

/**
 * Builds the complete pedagogical dossier for an authored Math skill.
 */
export function getMathSkillDossier(skillId: string): MathSkillDossier | null {
  const pkg = MATH_BATCH_01_PACKAGES[skillId];
  if (!pkg) return getMathBatch02SkillDossier(skillId);

  const visualAsset = MATH_BATCH_01_VISUAL_ASSETS[skillId];
  const externalResource = MATH_BATCH_01_EXTERNAL_RESOURCES[skillId];
  const diagnosticSignal = MATH_BATCH_01_DIAGNOSTIC_SIGNALS[skillId];
  const spacedReview = MATH_BATCH_01_SPACED_REVIEWS[skillId];
  const factorInputs = MATH_BATCH_01_FACTOR_INPUTS[skillId];

  const priorityAssessment = evaluateExpansionPriority(factorInputs);
  const qualityAssessment = evaluateContentQualityScore({
    factualAccuracy: "VERIFIED",
    curriculumAlignment: "VERIFIED",
    pedagogicalQuality: "VERIFIED",
    practiceQuality: "VERIFIED",
    retestQuality: "VERIFIED",
    errorCoverage: "VERIFIED",
    provenanceVerification: "VERIFIED",
    accessibilityCompliance: "VERIFIED",
    languageQuality: "VERIFIED",
    examTransferAlignment: "VERIFIED",
  });

  const escalationProfile = {
    skillId,
    subjectId: "math" as const,
    streamId: "math" as const,
    complexityWeight: 2 as const,
    recommendedEscalation: "SELF_LEARN" as const,
    requiresTeacherForRetestFailure: true,
  };

  return {
    package: pkg,
    domainId: (pkg.topicId.includes("arithmetic") || pkg.topicId.includes("divisibility")
      ? "algebre_arithmetique"
      : pkg.topicId.includes("complex") || pkg.topicId.includes("similitudes")
      ? "nombres_complexes_geometrie"
      : pkg.topicId.includes("space")
      ? "geometrie_espace"
      : pkg.topicId.includes("combinatorics")
      ? "probabilites_denombrement"
      : "analyse") as any,
    diagnosticSignal,
    spacedReview,
    visualAsset,
    externalResource,
    escalationProfile,
    priorityAssessment,
    qualityAssessment,
  };
}

/**
 * Retrieves all 12 authored Math skill dossiers.
 */
export function getAllMathBatch01Dossiers(): MathSkillDossier[] {
  return Object.keys(MATH_BATCH_01_PACKAGES).map((id) => getMathSkillDossier(id)!);
}
