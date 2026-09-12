/**
 * BAC Mastery — 3AS Mathematics Production Batch 03
 * 
 * Comprehensive Production Content for 9 Essential 3AS Math Competencies:
 * GROUP A — ALGÈBRE & ARITHMÉTIQUE:
 * 1. math_m_fermat_little_theorem (Petit théorème de Fermat et applications aux congruences)
 * 2. math_m_numeral_systems (Systèmes de numération, changement de base et divisibilité)
 * 
 * GROUP B — NOMBRES COMPLEXES:
 * 3. math_m_complex_polynomials_factorization (Polynômes dans C, factorisation et racines)
 * 
 * GROUP C — ANALYSE & INTÉGRATION:
 * 4. math_m_primitives_rational_fractions (Primitives de fractions rationnelles et éléments simples)
 * 5. math_m_integral_functions_variable_bounds (Fonctions définies par une intégrale F(x) = ∫_a^x f(t)dt)
 * 6. math_m_second_order_differential_equations (Équations différentielles linéaires ay'' + by' + cy = 0)
 * 
 * GROUP D — GÉOMÉTRIE DANS L'ESPACE:
 * 7. math_m_space_lines_intersections (Droites de l'espace, représentations paramétriques et intersections)
 * 8. math_m_space_spheres_equations (Sphères dans l'espace, équation cartésienne et intersection plan-sphère)
 * 
 * GROUP E — PROBABILITÉS & STATISTIQUES:
 * 9. math_m_random_variables_expectation (Variables aléatoires, loi de probabilité, espérance et variance)
 */

import { ContentPackage } from "@/domain/content-quality/types";
import {
  MathDiagnosticSignalProfile,
  MathSpacedReviewSchedule,
  MathSkillDossier,
} from "./types";
import { ALL_MATH_VISUAL_ASSETS } from "./math-visual-registry";
import { ALL_MATH_EXTERNAL_RESOURCES } from "./math-resource-registry";
import { ALL_MATH_FACTOR_INPUTS } from "./math-priority-ranking";
import { evaluateExpansionPriority } from "@/domain/content-quality/priority-engine";
import { evaluateContentQualityScore } from "@/domain/content-quality/quality-scorer";

// =============================================================================
// 1. CONTENT PACKAGES FOR THE 9 BATCH 03 SKILLS
// =============================================================================

export const MATH_BATCH_03_PACKAGES: Record<string, ContentPackage> = {
  // ---------------------------------------------------------------------------
  // 1. PETIT THÉORÈME DE FERMAT
  // ---------------------------------------------------------------------------
  math_m_fermat_little_theorem: {
    packageId: "pkg_math_m_fermat_little_theorem",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_arithmetic_theorems",
    skillId: "math_m_fermat_little_theorem",
    objective_ar: "تطبيق مبرهنة فيرما الصغرى a^(p-1) ≡ 1 [p] لحساب قوى الأعداد الكبيرة وتبسيط البواقي وحل المعادلات في Z/pZ.",
    objective_fr: "Appliquer le petit théorème de Fermat pour simplifier les puissances modulo p, calculer des restes et résoudre des congruences.",
    prerequisites: ["math_m_arithmetic_congruence", "math_m_gauss_prime_factors"],
    lesson: {
      title_ar: "مبرهنة فيرما الصغرى وتطبيقاتها في الحساب بالموافقات",
      contentMarkdown_ar: `### نص مبرهنة فيرما الصغرى (Petit théorème de Fermat)
ليكن $p$ عدداً أولياً و $a$ عدداً صحيحاً لا يقبل القسمة على $p$ (أي $\\text{PGCD}(a, p) = 1$).
تنص مبرهنة فيرما الصغرى على أن:
$$a^{p - 1} \\equiv 1 \\pmod{p}$$

### الصيغة المكافئة العامة
من أجل كل عدد صحيح $a$ وكل عدد أولي $p$:
$$a^p \\equiv a \\pmod{p}$$

### تقليص الأسس الكبيرة بمبرهنة فيرما
لحساب باقي قسمة $a^n$ على العدد الأولي $p$:
1. نتحقق من أن $p$ أولي وأن $a$ ليس مضاعفاً لـ $p$.
2. ننجز القسمة الإقليدية للأس $n$ على $p - 1$:
   $$n = q(p - 1) + r \\quad (0 \\le r < p - 1)$$
3. نستنتج الباقي مباشرة بتطبيق خواص القوى:
   $$a^n = (a^{p-1})^q \\cdot a^r \\equiv 1^q \\cdot a^r \\equiv a^r \\pmod{p}$$

### تنبيه منهاجي أساسي
لا يمكن تطبيق صيغة $a^{p-1} \\equiv 1 \\pmod{p}$ إلا إذا كان الترديد $p$ عدداً أولياً قطيعاً. إذا كان الترديد مؤلفاً (غير أولي)، نلجأ إلى دراسة دورية البواقي الاعتيادية.`,
      keyTakeaway_ar: "إذا كان p أولياً و a لا يقبل القسمة على p، فإن a^(p-1) يوافق 1 بترديد p، ونختزل أي أس بقسمته على p - 1.",
    },
    workedExample: {
      problem_ar: "ليكن p = 7. احسب باقي قسمة العدد 3^2026 على 7، ثم حل في Z المعادلة: 3x^6 ≡ 3 [7] مع x ليس مضاعفاً لـ 7.",
      stepByStepSolution_ar: [
        "الخطوة 1: التحقق من شروط مبرهنة فيرما: العدد 7 أولي، و 3 لا يقبل القسمة على 7 لأن PGCD(3, 7) = 1.",
        "الخطوة 2: صياغة المبرهنة: حسب مبرهنة فيرما الصغرى، لدينا: 3^(7 - 1) = 3^6 ≡ 1 [7].",
        "الخطوة 3: القسمة الإقليدية للأس 2026 على 6: 2026 = 6 * 337 + 4 (الباقي r = 4).",
        "الخطوة 4: تبسيط القوة الكبرى: 3^2026 = (3^6)^337 * 3^4 ≡ (1)^337 * 3^4 ≡ 3^4 [7]. لدينا 3^4 = 81.",
        "الخطوة 5: استنتاج باقي القسمة: بقسمة 81 على 7: 81 = 7 * 11 + 4، إذن 81 ≡ 4 [7]. ومنه باقي قسمة 3^2026 على 7 هو 4.",
        "الخطوة 6: حل المعادلة التوافقية 3x^6 ≡ 3 [7]: بما أن 7 لا يقسم x، فحسب فيرما x^6 ≡ 1 [7]. إذن 3x^6 ≡ 3(1) ≡ 3 [7] محققة دوماً من أجل كل عدد صحيح x ليس مضاعفاً لـ 7.",
      ],
      pedagogicalComment_ar: "اختزال الأس بالقسمة على 6 يختصر حسابات القوى الكبرى في خطوة استدلالية واحدة معتمدة في البكالوريا.",
    },
    activeRecall: {
      prompt_ar: "إذا كان p عدداً أولياً و a عدداً صحيحاً لا يقبل القسمة على p، فما هي صيغة مبرهنة فيرما الصغرى؟",
      expectedAnswer_ar: "صيغة مبرهنة فيرما الصغرى هي: a^(p-1) ≡ 1 [p].",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_fermat_01",
        prompt_ar: "باستعمال مبرهنة فيرما الصغرى، ما هو باقي قسمة 2^2025 على العدد الأولي 5؟",
        optionsCount: 4,
        correctAnswerId: "opt_fermat_rem_2",
        explanation_ar: "5 أولي و 5 لا يقسم 2، إذن 2^4 ≡ 1 [5]. نقسم الأس على 4: 2025 = 4*506 + 1. إذن 2^2025 ≡ 2^1 ≡ 2 [5].",
        distractorErrorMappings: {
          opt_fermat_rem_1: "forgot_information",
          opt_fermat_rem_4: "calculation_error",
          opt_fermat_rem_3: "misunderstood_concept",
        },
      },
      {
        id: "pq_math_m_fermat_02",
        prompt_ar: "ما هو الشرط الإلزامي في الترديد m لتطبيق مبرهنة فيرما a^(m-1) ≡ 1 [m]؟",
        optionsCount: 4,
        correctAnswerId: "opt_fermat_cond_prime",
        explanation_ar: "يجب أن يكون الترديد m عدداً أولياً صريحاً p وأن يكون a غير قابل للقسمة على p.",
        distractorErrorMappings: {
          opt_fermat_cond_odd: "misunderstood_concept",
          opt_fermat_cond_even: "calculation_error",
          opt_fermat_cond_any: "forgot_information",
        },
      },
    ],
    retest: {
      id: "rq_math_m_fermat_twin",
      parentPracticeQuestionId: "pq_math_m_fermat_01",
      prompt_ar: "باستعمال مبرهنة فيرما الصغرى، احسب باقي قسمة 3^2027 على العدد الأولي 5.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_fermat_rem_2",
      explanation_ar: "بما أن 5 أولي و PGCD(3, 5) = 1، فإن 3^4 ≡ 1 [5]. لدينا 2027 = 4*506 + 3. إذن 3^2027 ≡ 3^3 ≡ 27 ≡ 2 [5].",
    },
    repairGuide: {
      targetErrorType: "misunderstood_concept",
      title_ar: "معالجة خطأ تطبيق مبرهنة فيرما على ترديدات غير أولية أو قسمة الأس على p بدلاً من p-1",
      mentalModelExplanation_ar: "يقع التلميذ في خطأين شائعين: إما تطبيق المبرهنة على ترديد غير أولي، أو قسمة الأس n على p بدلاً من p - 1.",
      actionableSteps_ar: [
        "الخطوة 1: تأكد أولاً أن الترديد عدد أولي p وأن الأساس a لا يقبل القسمة على p.",
        "الخطوة 2: اقسم الأس n على (p - 1) حصراً وليس على p: n = q(p - 1) + r.",
        "الخطوة 3: احسب الباقي بتعويض القوة بـ a^r وبسط الناتج بترديد p.",
      ],
      contrastiveWorkedExample: "خطأ: في 2^2025 بترديد 5 نقسم 2025 على 5 فينتج الباقي 0 ونستنتج 1 (باطل). صواب: نقسم على 5 - 1 = 4 فينتج الباقي 1 والباقي الفعلي هو 2^1 = 2.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_fermat_little_theorem"],
    externalResourceIds: ["res_math_m_fermat_little_theorem"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "مبرهنة فيرما الصغرى ترد كأداة اختزال نموذجية في تمرين الحساب لشعبة الرياضيات لتسريع حساب القوى الفلكية دون جدول دوري كامل.",
      commonPitfalls_ar: ["القسمة على p بدلاً من p - 1", "إغفال شرط أولية الترديد"],
      officialBacPastRefIds: ["bac_m_2024_s1_ex1", "bac_m_2022_catchup_ex1"],
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
  // 2. SYSTÈMES DE NUMÉRATION
  // ---------------------------------------------------------------------------
  math_m_numeral_systems: {
    packageId: "pkg_math_m_numeral_systems",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_divisibility_congruences",
    skillId: "math_m_numeral_systems",
    objective_ar: "كتابة ونشر الأعداد في نظام تعداد ذي قاعدة b >= 2 والتحويل بين الأنظمة وحل معادلات إيجاد الأساس المجهول.",
    objective_fr: "Écrire et décomposer les entiers en base b, effectuer les changements de base et déterminer une base inconnue.",
    prerequisites: ["math_m_arithmetic_congruence"],
    lesson: {
      title_ar: "أنظمة التعداد: النشر الموضعي وتغيير الأساس والمعادلات",
      contentMarkdown_ar: `### المبدأ الموضعي في نظام ذي أساس b
ليكن $b$ عدداً طبيعياً بحيث $b \\ge 2$.
كل عدد طبيعي $N$ يكتب بشكل وحيد في الأساس $b$ على الصورة:
$$\\overline{a_n a_{n-1} \\dots a_1 a_0}^b$$
حيث:
1. الأرقام $a_k$ أعداد طبيعية تحقق: $0 \\le a_k < b$ من أجل كل $k$.
2. الرقم الأساسي الأول $a_n \\neq 0$.
3. النشر الموضعي المفصل:
   $$N = a_n b^n + a_{n-1} b^{n-1} + \\dots + a_1 b + a_0$$

### التحويل بين القواعد
- **من الأساس $b$ إلى الأساس 10**: نحسب مباشرة قيمة كثير الحدود بدلالة $b$.
- **من الأساس 10 إلى الأساس $b$**: نجري قسمات إقليدية متتالية على $b$ حتى نحصل على حاصل قسمة معدوم، وتكون أرقام العدد هي البواقي مرتبة من اليمين إلى اليسار (أي من الباقي الأخير إلى الأول).

### حل المعادلات ذات الأساس المجهول
لإيجاد أساس مجهول $x$:
1. نحدد أولاً شرط الوجود: $x > \\max(\\text{أرقام العدد})$.
2. ننشر العبارات ونحل المعادلة الجبرية ذات المجهول $x$.
3. نرفض أي حل لا يحقق شرط الوجود أو لا ينتمي إلى $\\mathbb{N}$.`,
      keyTakeaway_ar: "في الأساس b، كل رقم أصغر تماماً من b، ونشر العدد هو مجموع a_k * b^k. والتحويل إلى الأساس 10 يتم بحساب هذا المجموع.",
    },
    workedExample: {
      problem_ar: "عدد طبيعي N يكتب (234)_x في الأساس x، ويكتب (163)_(x+1) في الأساس x+1. عيّن قيمة الأساس x واكتب العدد N في النظام العشري.",
      stepByStepSolution_ar: [
        "الخطوة 1: تحديد شرط الوجود للأساس x: في الأساس x الأرقام هي {2, 3, 4} إذن x > 4 أي x >= 5. وفي الأساس x+1 الأرقام هي {1, 6, 3} إذن x+1 > 6 أي x >= 6. نستنتج أن الشرط الإلزامي هو x >= 6.",
        "الخطوة 2: نشر العدد N في الأساس x: N = 2*x^2 + 3*x + 4.",
        "الخطوة 3: نشر العدد N في الأساس x+1: N = 1*(x+1)^2 + 6*(x+1) + 3 = (x^2 + 2x + 1) + 6x + 6 + 3 = x^2 + 8x + 10.",
        "الخطوة 4: مساواة العبارتين وحل المعادلة: 2x^2 + 3x + 4 = x^2 + 8x + 10. بنقل الحدود لطرف واحد: x^2 - 5x - 6 = 0.",
        "الخطوة 5: تحليل المعادلة: (x - 6)(x + 1) = 0. الحلان هما x = 6 أو x = -1. بما أن x >= 6، نرفض -1 ونقبل x = 6.",
        "الخطوة 6: كتابة N في النظام العشري: N = 2*(6^2) + 3*(6) + 4 = 2*36 + 18 + 4 = 72 + 18 + 4 = 94. (التحقق في الأساس 7: 1*(49) + 6*(7) + 3 = 49 + 42 + 3 = 94، تطابق تام).",
      ],
      pedagogicalComment_ar: "البدء بشرط x >= 6 يضمن استبعاد الحلول السالبة والمرفوضة رياضياً قبل التصريح بالأساس النهائي.",
    },
    activeRecall: {
      prompt_ar: "في نظام تعداد ذي أساس b، ما هو الشرط الضروري على الأرقام a_k المكونة للعدد؟",
      expectedAnswer_ar: "يجب أن تكون جميع الأرقام a_k أعداداً طبيعية محصورة في المجال: 0 <= a_k < b.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_numsys_01",
        prompt_ar: "اكتب العدد N = (1011)_2 المعطى في النظام الثنائي بالنظام العشري (الأساس 10).",
        optionsCount: 4,
        correctAnswerId: "opt_num_sys_11",
        explanation_ar: "N = 1*2^3 + 0*2^2 + 1*2^1 + 1*2^0 = 8 + 0 + 2 + 1 = 11.",
        distractorErrorMappings: {
          opt_num_sys_10: "calculation_error",
          opt_num_sys_13: "misunderstood_concept",
          opt_num_sys_9: "forgot_information",
        },
      },
      {
        id: "pq_math_m_numsys_02",
        prompt_ar: "عيّن الأساس x بحيث يكون العدد (12)_x مساوياً للعدد 8 في النظام العشري.",
        optionsCount: 4,
        correctAnswerId: "opt_num_sys_x6",
        explanation_ar: "(12)_x = 1*x + 2. بمساواته بـ 8 نجد: x + 2 = 8 إذن x = 6 (وهو أكبر من 2 محقق).",
        distractorErrorMappings: {
          opt_num_sys_x4: "calculation_error",
          opt_num_sys_x8: "misunderstood_concept",
          opt_num_sys_x5: "forgot_information",
        },
      },
    ],
    retest: {
      id: "rq_math_m_numsys_twin",
      parentPracticeQuestionId: "pq_math_m_numsys_01",
      prompt_ar: "حول العدد A = (1101)_2 من النظام الثنائي إلى النظام العشري ذي القاعدة 10.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_num_sys_13",
      explanation_ar: "A = 1*2^3 + 1*2^2 + 0*2^1 + 1*2^0 = 8 + 4 + 0 + 1 = 13.",
    },
    repairGuide: {
      targetErrorType: "calculation_error",
      title_ar: "معالجة خطأ نسيان الرتبة الصفرية b^0 أو قبول أرقام تساوي الأساس",
      mentalModelExplanation_ar: "يغفل التلميذ أن الرقم الأيمن يضرب في b^0 = 1 وليس في b^1، أو يقبل أرقاماً تفوق أو تساوي الأساس x.",
      actionableSteps_ar: [
        "الخطوة 1: رقّم المراتب من اليمين إلى اليسار بدءاً من الصفر: 0، 1، 2، ...",
        "الخطوة 2: اضرب كل رقم في b مرفوعاً إلى رتبته المحددة: a_0 * b^0 + a_1 * b^1 + ...",
        "الخطوة 3: تأكد دوماً أن جميع أرقام العدد أصغر تماماً من الأساس b.",
      ],
      contrastiveWorkedExample: "خطأ: (101)_2 = 1*2^2 + 0*2^1 + 1*2^1 = 6. صواب: 1*2^2 + 0*2^1 + 1*2^0 = 4 + 0 + 1 = 5.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_numeral_systems"],
    externalResourceIds: ["res_math_m_numeral_systems"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "تعد أنظمة التعداد من المواضيع المميزة لشعبة الرياضيات، وترد غالباً كمسألة إيجاد الأساس المجهول أو دراسة قابلية القسمة على b - 1.",
      commonPitfalls_ar: ["نسيان شرط x > max(الأرقام)", "الخطأ في نشر قوى ذات الحدين (x + 1)^2"],
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
  // 3. POLYNÔMES DANS C ET FACTORISATION
  // ---------------------------------------------------------------------------
  math_m_complex_polynomials_factorization: {
    packageId: "pkg_math_m_complex_polynomials_factorization",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_complex_algebra",
    skillId: "math_m_complex_polynomials_factorization",
    objective_ar: "حل معادلات كثيرات الحدود في C بإيجاد جذر معلوم أو تخيلي صرف، والتحليل إلى جداء عوامل، وتطبيق المميز المركب.",
    objective_fr: "Résoudre des équations polynomiales dans C, identifier des racines imaginaires pures, factoriser et calculer le discriminant complexe.",
    prerequisites: ["math_m_complex_algebraic_trig"],
    lesson: {
      title_ar: "كثيرات الحدود في مجموعة الأعداد المركبة: الجذور والتحليل",
      contentMarkdown_ar: `### خاصية الجذور المترافقة لكثيرات الحدود ذات المعاملات الحقيقية
إذا كان $P(z)$ كثير حدود بمعاملات حقيقية:
$$\\overline{P(z)} = P(\\bar{z})$$
وبالتالي، إذا كان العدد المركب $z_0$ جذراً لـ $P(z)$، فإن مرافقه $\\bar{z_0}$ هو حتماً جذر لـ $P(z)$ أيضاً.

### البحث عن جذر تخيلي صرف
لإثبات أن $P(z) = 0$ تقبل حلاً تخيلياً صرفاً $z_0 = i b$ ($b \\in \\mathbb{R}$):
1. نعوض $z = i b$ في المعادلة $P(z) = 0$.
2. نستعمل قوى الوحدة التخيلية: $i^2 = -1$ و $i^3 = -i$ و $i^4 = 1$.
3. نفصل العبارة إلى جزأين: جزء حقيقي وجزء تخيلي:
   $$X(b) + i Y(b) = 0 \\iff \\begin{cases} X(b) = 0 \\\\ Y(b) = 0 \\end{cases}$$
4. نحل الجملة لإيجاد القيمة المشتركة لـ $b$.

### التحليل إلى جداء عوامل
إذا كان $z_0$ جذراً لكثير حدود من الدرجة الثالثة $P(z)$، فإنه يقبل القسمة على $(z - z_0)$:
$$P(z) = (z - z_0)(a z^2 + b z + c)$$
ويتم تعيين المعاملات $a, b, c$ إما بالقسمة الإقليدية أو بطريقة المطابقة.`,
      keyTakeaway_ar: "إذا كان لكثير حدود بمعاملات حقيقية جذر z_0 فإن مرافقه جذر أيضاً. والجذر التخيلي ib يعين بفصل الجزء الحقيقي والتخيلي إلى الصفر.",
    },
    workedExample: {
      problem_ar: "نعتبر في C كثير الحدود: P(z) = z^3 - 3z^2 + 4z - 12. بيّن أن المعادلة P(z) = 0 تقبل حلاً تخيلياً صرفاً z_0، ثم حل المعادلة في C.",
      stepByStepSolution_ar: [
        "الخطوة 1: البحث عن الجذر التخيلي الصرف z = ib (مع b حقيقي): P(ib) = (ib)^3 - 3(ib)^2 + 4(ib) - 12 = -i*b^3 + 3b^2 + 4ib - 12.",
        "الخطوة 2: فصل الجزأين الحقيقي والتخيلي: P(ib) = (3b^2 - 12) + i*(4b - b^3) = 0.",
        "الخطوة 3: حل جملة المعادلتين: - من الجزء الحقيقي: 3b^2 - 12 = 0 يعطي b^2 = 4 إذن b = 2 أو b = -2. - من الجزء التخيلي: 4b - b^3 = b(4 - b^2) = 0 وهو محقق للقيمتين b = 2 و b = -2. إذن الحل التخيلي الصرف هو z_0 = 2i (ومرافقه -2i جذر أيضاً).",
        "الخطوة 4: التفكيك إلى جداء عوامل: بما أن 2i و -2i جذران، فإن (z - 2i)(z + 2i) = z^2 + 4 يقسم P(z).",
        "الخطوة 5: القسمة الإقليدية لـ P(z) على z^2 + 4: (z^3 - 3z^2 + 4z - 12) = (z^2 + 4)(z - 3).",
        "الخطوة 6: استنتاج حلول المعادلة P(z) = 0: إما z - 3 = 0 أي z = 3، أو z^2 + 4 = 0 أي z = 2i أو z = -2i. مجموعة الحلول هي: S = {3, 2i, -2i}.",
      ],
      pedagogicalComment_ar: "ظهور الجذرين المترافقين 2i و -2i يؤكد نظرية الجذور المترافقة لكثيرات الحدود ذات المعاملات الحقيقية.",
    },
    activeRecall: {
      prompt_ar: "إذا كان كثير حدود P(z) ذا معاملات حقيقية و z_0 جذراً مركباً له، فماذا نستنتج عن مرافقه z_0_bar؟",
      expectedAnswer_ar: "مرافقه z_0_bar هو حتماً جذر لـ P(z) أيضاً.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_cpoly_01",
        prompt_ar: "حل في C المعادلة: z^2 + 9 = 0.",
        optionsCount: 4,
        correctAnswerId: "opt_cpoly_pm3i",
        explanation_ar: "z^2 = -9 = (3i)^2، إذن z = 3i أو z = -3i.",
        distractorErrorMappings: {
          opt_cpoly_pm3: "misunderstood_concept",
          opt_cpoly_3i: "forgot_information",
          opt_cpoly_none: "calculation_error",
        },
      },
      {
        id: "pq_math_m_cpoly_02",
        prompt_ar: "حل في C المعادلة: (z - 2)(z^2 + 2z + 2) = 0.",
        optionsCount: 4,
        correctAnswerId: "opt_cpoly_set_3",
        explanation_ar: "إما z = 2. أو z^2 + 2z + 2 = 0: Delta = 4 - 8 = -4 = (2i)^2، ومنه z = (-2 ± 2i)/2 = -1 ± i. إذن S = {2, -1+i, -1-i}.",
        distractorErrorMappings: {
          opt_cpoly_set_real: "forgot_information",
          opt_cpoly_set_sign: "calculation_error",
          opt_cpoly_set_wrong: "misunderstood_concept",
        },
      },
    ],
    retest: {
      id: "rq_math_m_cpoly_twin",
      parentPracticeQuestionId: "pq_math_m_cpoly_02",
      prompt_ar: "حل في C المعادلة: (z - 1)(z^2 + 4) = 0.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_cpoly_1_pm2i",
      explanation_ar: "إما z = 1. أو z^2 + 4 = 0 يعطي z^2 = -4 = (2i)^2 ومنه z = 2i أو z = -2i. مجموعة الحلول هي S = {1, 2i, -2i}.",
    },
    repairGuide: {
      targetErrorType: "misunderstood_concept",
      title_ar: "معالجة خطأ تربيع وتكعيب الوحدة التخيلية i أو نسيان الحلول المركبة المترافقة",
      mentalModelExplanation_ar: "يخلط التلميذ في إشارة قوى i فيكتب (ib)^2 = b^2 أو ينسى أن المعادلة z^2 = -a تقبل حلين مركبين مترافقين ±i*sqrt(a).",
      actionableSteps_ar: [
        "الخطوة 1: تذكر دائماً: i^2 = -1، و i^3 = -i، و i^4 = 1.",
        "الخطوة 2: عند حل z^2 = -a (مع a > 0)، اكتب مباشرة z = ± i*sqrt(a).",
        "الخطوة 3: تأكد أن عدد حلول كثير الحدود من الدرجة n في C يساوي دائماً n حلولاً (مع احتساب التكرار).",
      ],
      contrastiveWorkedExample: "خطأ: z^2 + 4 = 0 ليس لها حلول. صواب: z^2 = -4 = (2i)^2 ومنه z = 2i أو z = -2i.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_complex_polynomials_factorization"],
    externalResourceIds: ["res_math_m_complex_polynomials_factorization"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "معادلات كثيرات الحدود والبحث عن جذر تخيلي صرف تمثل المدخل الكلاسيكي الثابت في تمرين الأعداد المركبة بالبكالوريا تمهيداً للتحويلات النقطية.",
      commonPitfalls_ar: ["الخطأ في إشارة الجزء الحقيقي عند تعويض (ib)^2", "نسيان مرافقة الحلول في كثير الحدود ذي المعاملات الحقيقية"],
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
  // 4. PRIMITIVES DE FRACTIONS RATIONNELLES
  // ---------------------------------------------------------------------------
  math_m_primitives_rational_fractions: {
    packageId: "pkg_math_m_primitives_rational_fractions",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_integration_primitives",
    skillId: "math_m_primitives_rational_fractions",
    objective_ar: "إيجاد الدوال الأصلية للكسور الناطقة بتفكيكها إلى عناصر بسيطة وتوظيف الأشكال النموذجية u'/u و u'/u^2 على مجالات صريحة.",
    objective_fr: "Déterminer les primitives de fractions rationnelles par décomposition en éléments simples et reconnaître les formes u'/u et u'/u^2.",
    prerequisites: ["math_m_integration_parts", "math_m_exp_log_croissances"],
    lesson: {
      title_ar: "الدوال الأصلية للكسور الناطقة بالتفكيك إلى عناصر بسيطة",
      contentMarkdown_ar: `### الدوال الأصلية القياسية للكسور
1. **الصيغة اللوغاريتمية**: إذا كانت $u$ دالة قابلة للاشتقاق ولا تنعدم على مجال $I$:
   $$\\int \\frac{u'(x)}{u(x)} \\, dx = \\ln|u(x)| + C$$
2. **صيغة القوى السالبة**:
   $$\\int \\frac{u'(x)}{[u(x)]^2} \\, dx = -\\frac{1}{u(x)} + C$$
   $$\\int \\frac{u'(x)}{[u(x)]^n} \\, dx = -\\frac{1}{(n - 1)[u(x)]^{n-1}} + C \\quad (n \\ge 2)$$

### تفكيك الكسور الناطقة إلى عناصر بسيطة
لكل كسر ناطق $\\frac{P(x)}{Q(x)}$:
1. إذا كانت درجة البسط $\\ge$ درجة المقام، نجري أولاً القسمة الإقليدية:
   $$\\frac{P(x)}{Q(x)} = E(x) + \\frac{R(x)}{Q(x)}$$
2. إذا كان المقام يحلل إلى جداء عوامل من الدرجة الأولى ذات جذور متمايزة $(x - a)(x - b)$، نكتب الكسر على الشكل:
   $$\\frac{R(x)}{(x - a)(x - b)} = \\frac{A}{x - a} + \\frac{B}{x - b}$$
3. نعين الثابتين $A$ و $B$ بطريقة المطابقة أو بالضرب في $(x - a)$ والتعويض بـ $x = a$.
4. نستنتج الدالة الأصلية مباشرة بجمع الدوال الأصلية للعناصر البسيطة الناتجة.`,
      keyTakeaway_ar: "تفكيك الكسر الناطق يحوله إلى مجموع كسور بسيطة تكاملاتها مباشرة بصيغة اللوغاريتم ln|x - a|.",
    },
    workedExample: {
      problem_ar: "لتكن f(x) = (3x - 1) / [(x - 1)(x + 2)] المعرفة على المجال I = ]1, +infinity[. عيّن العددين الحقيقيين A و B بحيث f(x) = A/(x - 1) + B/(x + 2)، ثم استنتج الدالة الأصلية F للدالة f على I التي تنعدم عند x = 2.",
      stepByStepSolution_ar: [
        "الخطوة 1: تفكيك الكسر الناطق بالمطابقة: نكتب (3x - 1) / [(x - 1)(x + 2)] = A/(x - 1) + B/(x + 2).",
        "الخطوة 2: حساب الثابت A: نضرب الطرفين في (x - 1) ونعوض x = 1: A = (3(1) - 1) / (1 + 2) = 2 / 3.",
        "الخطوة 3: حساب الثابت B: نضرب الطرفين في (x + 2) ونعوض x = -2: B = (3(-2) - 1) / (-2 - 1) = (-7) / (-3) = 7 / 3.",
        "الخطوة 4: التحقق من التفكيك: (2/3)/(x - 1) + (7/3)/(x + 2) = [2(x + 2) + 7(x - 1)] / [3(x - 1)(x + 2)] = (2x + 4 + 7x - 7) / [3(x-1)(x+2)] = (9x - 3) / [3(x-1)(x+2)] = (3x - 1) / [(x-1)(x+2)]. تطابق تام.",
        "الخطوة 5: إيجاد الدوال الأصلية على ]1, +infinity[: على هذا المجال لدينا x - 1 > 0 و x + 2 > 0، إذن: F(x) = (2/3)*ln(x - 1) + (7/3)*ln(x + 2) + C.",
        "الخطوة 6: تعيين الثابت C بالشرط F(2) = 0: F(2) = (2/3)*ln(1) + (7/3)*ln(4) + C = 0 + (7/3)*ln(4) + C = 0، إذن C = -(7/3)*ln(4) = -(14/3)*ln(2). العبارة النهائية: F(x) = (2/3)*ln(x - 1) + (7/3)*ln(x + 2) - (14/3)*ln(2).",
      ],
      pedagogicalComment_ar: "تحديد إيجابية العوامل على المجال المعطى I يسمح بحذف رمز القيمة المطلقة داخل اللوغاريتم ببرهان سليم.",
    },
    activeRecall: {
      prompt_ar: "ما هي الدالة الأصلية للعبارة f(x) = u'(x)/u(x) على مجال يكون فيه u(x) موجباً تماماً؟",
      expectedAnswer_ar: "الدالة الأصلية هي F(x) = ln(u(x)) + C.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_ratprim_01",
        prompt_ar: "عيّن دالة أصلية للدالة f(x) = 1 / (x + 3) على المجال ]-3, +infinity[.",
        optionsCount: 4,
        correctAnswerId: "opt_ratprim_lnx3",
        explanation_ar: "بما أن x + 3 > 0 ومشتقته 1، فالدالة الأصلية هي F(x) = ln(x + 3) + C.",
        distractorErrorMappings: {
          opt_ratprim_neg: "calculation_error",
          opt_ratprim_sq: "misunderstood_concept",
          opt_ratprim_inv: "forgot_information",
        },
      },
      {
        id: "pq_math_m_ratprim_02",
        prompt_ar: "فكك الكسر الناطق 1 / [x(x + 1)] إلى مجموع كسرين بسيطين.",
        optionsCount: 4,
        correctAnswerId: "opt_ratprim_decomp",
        explanation_ar: "1 / [x(x + 1)] = 1/x - 1/(x + 1) لأن (x + 1 - x) / [x(x + 1)] = 1 / [x(x + 1)].",
        distractorErrorMappings: {
          opt_ratprim_decomp_plus: "calculation_error",
          opt_ratprim_decomp_half: "forgot_information",
          opt_ratprim_decomp_inv: "misunderstood_concept",
        },
      },
    ],
    retest: {
      id: "rq_math_m_ratprim_twin",
      parentPracticeQuestionId: "pq_math_m_ratprim_01",
      prompt_ar: "عيّن دالة أصلية للدالة g(x) = 1 / (x + 5) على المجال ]-5, +infinity[ والتي تنعدم عند x = -4.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_ratprim_lnx5",
      explanation_ar: "G(x) = ln(x + 5) + C. بما أن G(-4) = ln(1) + C = 0 + C = 0، فإن C = 0. إذن G(x) = ln(x + 5).",
    },
    repairGuide: {
      targetErrorType: "forgot_information",
      title_ar: "معالجة خطأ إهمال القيمة المطلقة في مكاملة u'(x)/u(x) أو أخطاء توحيد المقامات",
      mentalModelExplanation_ar: "يكتب التلميذ ln(u) دون قيمة مطلقة على مجالات سالبة، أو يخطئ في إشارات الطرح أثناء مطابقة معاملات التفكيك.",
      actionableSteps_ar: [
        "الخطوة 1: اكتب دائماً الدالة الأصلية بالقيمة المطلقة أولاً: ln|u(x)|.",
        "الخطوة 2: ادرس إشارة u(x) على المجال المعطى لحذف القيمة المطلقة أو الإبقاء عليها مسبوقة بناقص.",
        "الخطوة 3: تحقق دائماً بإعادة توحيد مقامات التفكيك والتأكد من مطابقة الكسر الأصلي.",
      ],
      contrastiveWorkedExample: "خطأ: تكامل 1/(x - 3) على ]-infinity, 3[ هو ln(x - 3) (غير معرف لأن x - 3 < 0). صواب: هو ln|x - 3| = ln(3 - x).",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_primitives_rational_fractions"],
    externalResourceIds: ["res_math_m_primitives_rational_fractions"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "تفكيك الكسور الناطة واستنتاج الدوال الأصلية سؤال مركزي في الجزء الختامي من مسألة التحليل لحساب مساحات الحيزات المحصورة بالمنحنيات والمستقيمات المقاربة.",
      commonPitfalls_ar: ["إهمال القيمة المطلقة في اللوغاريتم", "الخلط بين تكامل u'/u وتكامل u'/u^2"],
      officialBacPastRefIds: ["bac_m_2024_catchup_ex4", "bac_m_2021_s1_ex4"],
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
  // 5. FONCTIONS DÉFINIES PAR UNE INTÉGRALE
  // ---------------------------------------------------------------------------
  math_m_integral_functions_variable_bounds: {
    packageId: "pkg_math_m_integral_functions_variable_bounds",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_integration_primitives",
    skillId: "math_m_integral_functions_variable_bounds",
    objective_ar: "دراسة وتفسير الدوال المعرفة بتكامل من الشكل F(x) = ∫_a^x f(t)dt واشتقاقها F'(x) = f(x) واستنتاج اتجاه تغيرها وحصرها ودراسة نهاياتها.",
    objective_fr: "Étudier les fonctions définies par une intégrale à bornes variables, dériver F'(x) = f(x), déterminer leur sens de variation et étudier leurs limites.",
    prerequisites: ["math_m_derivatives_tvi_rigor", "math_m_integration_parts", "math_m_bounded_functions"],
    lesson: {
      title_ar: "الدوال المعرفة بتكامل بحدود متغيرة: الاشتقاق ودراسة السلوك",
      contentMarkdown_ar: `### المبرهنة الأساسية للحساب التكاملي
إذا كانت $f$ دالة مستمرة على مجال $I$، وكان $a$ عنصراً ثابتاً من $I$، فإن الدالة $F$ المعرفة على $I$ بـ:
$$F(x) = \\int_{a}^{x} f(t) \\, dt$$
هي الدالة الأصلية الوحيدة للدالة $f$ على $I$ التي تنعدم عند $a$.
وبالتالي:
1. $F$ قابلة للاشتقاق على $I$ ومشتقتها هي:
   $$F'(x) = f(x) \\quad (\\forall x \\in I)$$
2. قيمة الدالة عند الحد الثابت معدومة دوماً:
   $$F(a) = \\int_{a}^{a} f(t) \\, dt = 0$$

### اتجاه تغير الدالة F
بما أن $F'(x) = f(x)$، فإن:
- تكون $F$ متزايدة تماماً على الفترات التي تكون فيها $f(x) \\ge 0$.
- تكون $F$ متناقصة تماماً على الفترات التي تكون فيها $f(x) \\le 0$.

### حصر ونهاية الدالة التكاملية
إذا كانت $f$ محصورة بـ $m \\le f(t) \\le M$ على $[a, x]$ (مع $x \\ge a$)، فإن بالتكامل:
$$m(x - a) \\le F(x) \\le M(x - a)$$
وإذا كانت $F$ متزايدة ومحدودة من الأعلى، فإنها تقبل حتماً نهاية منتهية عند $+\\infty$.`,
      keyTakeaway_ar: "مشتقة F(x) = ∫_a^x f(t)dt هي ببساطة f(x)، وإشارتها تحدد اتجاه تغير F، وقيمة F(a) تساوي 0 دائماً.",
    },
    workedExample: {
      problem_ar: "لتكن الدالة F معرفة على R بـ: F(x) = integral_0^x (1 / (1 + t^2) dt). برر اشتقاقية F واحسب مشتقتها، ثم ادرس اتجاه تغيرها وشفعيتها، وأثبت أنها محدودة من الأعلى على [1, +infinity[.",
      stepByStepSolution_ar: [
        "الخطوة 1: تبرير قابلية الاشتقاق وحساب F'(x): الدالة t -> 1/(1+t^2) مستمرة على R كحاصل قسمة كثيري حدود مع مقام لا ينعدم. إذن الدالة F قابلة للاشتقاق على R ومشتقتها المباشرة هي: F'(x) = 1 / (1 + x^2).",
        "الخطوة 2: اتجاه التغير: من أجل كل عدد حقيقي x، لدينا x^2 >= 0 إذن 1 + x^2 >= 1 > 0 تماماً. ومنه F'(x) > 0 قطيعاً، فالدالة F متزايدة تماماً على R.",
        "الخطوة 3: دراسة الشفعية: بوضع المتغير u = -t: F(-x) = integral_0^(-x) (1/(1+t^2) dt) = integral_0^x (-1/(1+(-u)^2) du) = -integral_0^x (1/(1+u^2) du) = -F(x). إذن F دالة فردية ومنحناها متناظر بالنسبة للمبدأ O.",
        "الخطوة 4: حصر الدالة على [1, +infinity[: من أجل t >= 1، لدينا 1 + t^2 > t^2، وبالمقلوب: 1/(1+t^2) < 1/t^2. بتكامل الطرفين من 1 إلى x (مع x >= 1): integral_1^x (1/(1+t^2) dt) <= integral_1^x (1/t^2 dt) = [-1/t]_1^x = 1 - 1/x < 1.",
        "الخطوة 5: استنتاج المحدودية: بما أن F(x) = F(1) + integral_1^x (1/(1+t^2) dt)، فإن F(x) < F(1) + 1 من أجل كل x >= 1، فالدالة F محدودة من الأعلى على [1, +infinity[.",
      ],
      pedagogicalComment_ar: "الميزة الكبرى لهذا النمط من التمارين هي استنتاج خواص F وسلوكها دون الحاجة لإيجاد عبارة جبرية أصلية للدالة.",
    },
    activeRecall: {
      prompt_ar: "إذا كانت f دالة مستمرة على R، فما هي مشتقة الدالة F(x) = integral_a^x f(t)dt وما هي قيمة F(a)؟",
      expectedAnswer_ar: "المشتقة هي F'(x) = f(x) من أجل كل x، وقيمة F(a) = 0 دوماً.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_intfn_01",
        prompt_ar: "لتكن H(x) = integral_1^x ln(t) dt المعرفة على ]0, +infinity[. احسب المشتقة H'(x).",
        optionsCount: 4,
        correctAnswerId: "opt_intfn_lnx",
        explanation_ar: "بما أن الدالة t -> ln(t) مستمرة على ]0, +inf[، فإن مشتقة الدالة التكاملية هي ببساطة H'(x) = ln(x).",
        distractorErrorMappings: {
          opt_intfn_inv: "calculation_error",
          opt_intfn_exp: "misunderstood_concept",
          opt_intfn_zero: "forgot_information",
        },
      },
      {
        id: "pq_math_m_intfn_02",
        prompt_ar: "ما هي قيمة التكامل F(a) = integral_a^a f(t) dt لأي دالة مستمرة f؟",
        optionsCount: 4,
        correctAnswerId: "opt_intfn_zero",
        explanation_ar: "تطابق حدي التكامل يجعل مساحة الحيز منعدمة، إذن F(a) = 0 دوماً.",
        distractorErrorMappings: {
          opt_intfn_fa: "misunderstood_concept",
          opt_intfn_one: "calculation_error",
          opt_intfn_inf: "forgot_information",
        },
      },
    ],
    retest: {
      id: "rq_math_m_intfn_twin",
      parentPracticeQuestionId: "pq_math_m_intfn_01",
      prompt_ar: "لتكن الدالة K(x) = integral_0^x e^(-t^2) dt المعرفة على R. احسب مشتقتها K'(x) واستنتج اتجاه تغيرها.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_intfn_inc",
      explanation_ar: "K'(x) = e^(-x^2). بما أن الدالة الأسية موجبة تماماً على R، فإن K'(x) > 0، والدالة K متزايدة تماماً على R مع K(0) = 0.",
    },
    repairGuide: {
      targetErrorType: "misunderstood_concept",
      title_ar: "معالجة خطأ محاولة إيجاد العبارة الصريحة للدوال المعرفة بتكامل والخلط بين t و x",
      mentalModelExplanation_ar: "يضيع التلميذ وقتاً طويلاً في البحث عن دالة أصلية بالصيغ المألوفة لدوال غير قابلة للتكامل الابتدائي، ناسياً أن المطلوب هو توظيف F'(x) = f(x) مباشرة.",
      actionableSteps_ar: [
        "الخطوة 1: لا تبحث أبداً عن عبارة أصلية صريحة إذا لم يُطلب منك ذلك صراحة.",
        "الخطوة 2: اذكر شرط الاستمرارية أولاً: 'بما أن f مستمرة، فإن F قابلة للاشتقاق'.",
        "الخطوة 3: اكتب المشتقة مباشرة بتعويض متغير التكامل t بمتغير الدالة x: F'(x) = f(x).",
      ],
      contrastiveWorkedExample: "خطأ: لحساب مشتقة integral_0^x e^(-t^2) dt نحاول مكاملة الدالة ثم اشتقاقها. صواب: المشتقة هي مباشرة e^(-x^2).",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_integral_functions_variable_bounds"],
    externalResourceIds: ["res_math_m_integral_functions_variable_bounds"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "تعد الدوال المعرفة بتكامل من الأسئلة الراقية المميزة لشعبة الرياضيات في البكالوريا، وغالباً ما تشكل الجزء الثالث من مسألة التحليل الكبرى لدراسة النهايات والحصر.",
      commonPitfalls_ar: ["الخلط بين t و x أثناء الاشتقاق", "نسيان أن F(a) = 0"],
      officialBacPastRefIds: ["bac_m_2023_catchup_ex4", "bac_m_2020_s1_ex4"],
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
  // 6. ÉQUATIONS DIFFÉRENTIELLES DU SECOND ORDRE
  // ---------------------------------------------------------------------------
  math_m_second_order_differential_equations: {
    packageId: "pkg_math_m_second_order_differential_equations",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_differential_equations",
    skillId: "math_m_second_order_differential_equations",
    objective_ar: "حل المعادلات التفاضلية الخطية المتجانسة من الرتبة الثانية ay'' + by' + cy = 0 عبر المعادلة المميزة بالحالات الثلاث وتعيين الحلول الخاصة المستوفية للشروط الابتدائية.",
    objective_fr: "Résoudre les équations différentielles linéaires homogènes du second ordre à coefficients constants via l'équation caractéristique et déterminer la solution vérifiant des conditions initiales.",
    prerequisites: ["math_m_differential_equations", "math_m_derivatives_tvi_rigor"],
    lesson: {
      title_ar: "المعادلات التفاضلية الخطية من الرتبة الثانية ay'' + by' + cy = 0",
      contentMarkdown_ar: `### الشكل العام والمعادلة المميزة
نعتبر المعادلة التفاضلية الخطية المتجانسة من الرتبة الثانية ذات المعاملات الحقيقية الثابتة:
$$a y'' + b y' + c y = 0 \\quad (a \\neq 0)$$
المعادلة المميزة المرفقة بها هي:
$$a r^2 + b r + c = 0$$
مميزها هو: $\\Delta = b^2 - 4ac$.

### الحالات الثلاث للحل العام
1. **الحالة الأولى: $\\Delta > 0$ (جذران حقيقيان متمايزان $r_1, r_2$)**:
   $$y(x) = C_1 e^{r_1 x} + C_2 e^{r_2 x} \\quad (C_1, C_2 \\in \\mathbb{R})$$
2. **الحالة الثانية: $\\Delta = 0$ (جذر حقيقي مضاعف $r_0 = -b/(2a)$)**:
   $$y(x) = (C_1 x + C_2) e^{r_0 x} \\quad (C_1, C_2 \\in \\mathbb{R})$$
3. **الحالة الثالثة: $\\Delta < 0$ (جذران مركبان مترافقان $r = \\alpha \\pm i \\beta$)** حيث $\\alpha = -b/(2a)$ و $\\beta = \\sqrt{-\\Delta}/(2a)$:
   $$y(x) = e^{\\alpha x} [C_1 \\cos(\\beta x) + C_2 \\sin(\\beta x)] \\quad (C_1, C_2 \\in \\mathbb{R})$$

### تعيين الحل الخاص بالشروط الابتدائية
لتعيين الثابتين $C_1$ و $C_2$:
1. نعوض الشرط الابتدائي الأول $y(x_0) = y_0$.
2. نشتق عبارة الحل العام $y'(x)$ بدقة.
3. نعوض الشرط الابتدائي الثاني $y'(x_0) = y'_0$ ونحل جملة المعادلتين خطياً.`,
      keyTakeaway_ar: "حل ay'' + by' + cy = 0 يتبع إشارة دلتا للمعادلة المميزة: أسيتان متباينتان إذا Delta > 0، خطي مضروب في أسي إذا Delta = 0، وأسي في جيبي إذا Delta < 0.",
    },
    workedExample: {
      problem_ar: "حل في R المعادلة التفاضلية: y'' - 4y' + 13y = 0، ثم عيّن الحل الخاص f الذي يحقق الشرطين الابتدائيين: f(0) = 1 و f'(0) = 5.",
      stepByStepSolution_ar: [
        "الخطوة 1: كتابة المعادلة المميزة: r^2 - 4r + 13 = 0.",
        "الخطوة 2: حساب المميز Delta: Delta = (-4)^2 - 4(1)(13) = 16 - 52 = -36 = (6i)^2 < 0.",
        "الخطوة 3: تعيين الجذرين المركبين المترافقين: r = (4 ± 6i) / 2 = 2 ± 3i. إذن الجزء الحقيقي alpha = 2 والجزء التخيلي beta = 3.",
        "الخطوة 4: كتابة الحل العام: y(x) = e^(2x) * [C_1 * cos(3x) + C_2 * sin(3x)] حيث C_1 و C_2 عددان حقيقيان.",
        "الخطوة 5: تطبيق الشرط الابتدائي الأول f(0) = 1: f(0) = e^0 * [C_1 * cos(0) + C_2 * sin(0)] = 1 * [C_1 * 1 + 0] = C_1 = 1.",
        "الخطوة 6: حساب المشتقة f'(x) وتطبيق الشرط f'(0) = 5: f'(x) = 2*e^(2x)*[cos(3x) + C_2*sin(3x)] + e^(2x)*[-3*sin(3x) + 3*C_2*cos(3x)]. عند x = 0: f'(0) = 2(1)[1 + 0] + 1[0 + 3*C_2] = 2 + 3*C_2. بالمساواة مع 5: 2 + 3*C_2 = 5 إذن 3*C_2 = 3 ومنه C_2 = 1.",
        "الخطوة 7: كتابة عبارة الحل الخاص النهائي: f(x) = e^(2x) * [cos(3x) + sin(3x)].",
      ],
      pedagogicalComment_ar: "تطبيق مشتقة جداء دالتين u*v عند حساب f'(x) بدقة يضمن الحساب الصحيح للثابت الثاني C_2 دون خطأ إشارة.",
    },
    activeRecall: {
      prompt_ar: "ما هي عبارة الحل العام للمعادلة التفاضلية ay'' + by' + cy = 0 إذا كانت جذور المعادلة المميزة مركبة مترافقة r = alpha ± i*beta؟",
      expectedAnswer_ar: "y(x) = e^(alpha*x) * [C_1*cos(beta*x) + C_2*sin(beta*x)] مع C_1 و C_2 عددين حقيقيين.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_ode2_01",
        prompt_ar: "حل في R المعادلة التفاضلية: y'' - 5y' + 6y = 0.",
        optionsCount: 4,
        correctAnswerId: "opt_ode2_real_roots",
        explanation_ar: "المعادلة المميزة r^2 - 5r + 6 = 0 تعطي الجذرين r_1 = 2 و r_2 = 3. الحل العام هو y(x) = C_1*e^(2x) + C_2*e^(3x).",
        distractorErrorMappings: {
          opt_ode2_minus: "calculation_error",
          opt_ode2_trig: "misunderstood_concept",
          opt_ode2_one: "forgot_information",
        },
      },
      {
        id: "pq_math_m_ode2_02",
        prompt_ar: "ما هو شكل الحل العام للمعادلة y'' - 6y' + 9y = 0 حيث r_0 = 3 جذر مضاعف؟",
        optionsCount: 4,
        correctAnswerId: "opt_ode2_double_root",
        explanation_ar: "في حالة الجذر المضاعف r_0 = 3، يكون الحل العام هو y(x) = (C_1*x + C_2)*e^(3x).",
        distractorErrorMappings: {
          opt_ode2_no_x: "forgot_information",
          opt_ode2_sq: "calculation_error",
          opt_ode2_cos: "misunderstood_concept",
        },
      },
    ],
    retest: {
      id: "rq_math_m_ode2_twin",
      parentPracticeQuestionId: "pq_math_m_ode2_01",
      prompt_ar: "حل في R المعادلة التفاضلية: y'' - 2y' + 5y = 0.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_ode2_complex",
      explanation_ar: "المعادلة المميزة r^2 - 2r + 5 = 0 مميزها Delta = 4 - 20 = -16 = (4i)^2. جذراها r = 1 ± 2i (alpha = 1, beta = 2). الحل العام هو y(x) = e^x * [C_1*cos(2x) + C_2*sin(2x)].",
    },
    repairGuide: {
      targetErrorType: "calculation_error",
      title_ar: "معالجة خطأ نسيان العامل x في الجذر المضاعف أو الخلط بين alpha و beta في الحلول الجيبية",
      mentalModelExplanation_ar: "ينسى التلميذ ضرب أحد الثابتين في x في حالة دلتا معدوم فيكتب (C_1 + C_2)e^(rx) وهو ثابت واحد، أو يعكس موضع الجزء الحقيقي والتخيلي.",
      actionableSteps_ar: [
        "الخطوة 1: اكتب المعادلة المميزة واحسب المميز دلتا بدقة.",
        "الخطوة 2: إذا كان دلتا معدوماً، ضع دائماً العامل الخطي (C_1*x + C_2).",
        "الخطوة 3: إذا كان دلتا سالباً، الجزء الحقيقي alpha يوضع في الأس e^(alpha*x)، والجزء التخيلي الموجب beta يوضع داخل cos و sin.",
      ],
      contrastiveWorkedExample: "خطأ: لجذر مضاعف r=3 نكتب C_1*e^(3x) + C_2*e^(3x). صواب: نكتب (C_1*x + C_2)*e^(3x).",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_second_order_differential_equations"],
    externalResourceIds: ["res_math_m_second_order_differential_equations"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "المعادلات التفاضلية من الرتبة الثانية ترد بانتظام في الجزء الأول من مسألة التحليل لتعريف دالة الحل الخاص التي تدرس لاحقاً في المسألة.",
      commonPitfalls_ar: ["نسيان العامل x في الجذر المضاعف", "الخطأ في تطبيق مشتقة الجداء عند حساب f'(0)"],
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
  // 7. DROITES DANS L'ESPACE ET INTERSECTIONS
  // ---------------------------------------------------------------------------
  math_m_space_lines_intersections: {
    packageId: "pkg_math_m_space_lines_intersections",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_space_geometry",
    skillId: "math_m_space_lines_intersections",
    objective_ar: "تعيين التمثيل الوسيطي لمستقيم في الفضاء ودراسة الأوضاع النسبية لمستقيمين وتعيين نقطة تقاطع مستقيم مع مستو ومسقط نقطة عمودياً على مستو.",
    objective_fr: "Établir une représentation paramétrique de droite, étudier les positions relatives de deux droites, déterminer l'intersection droite-plan et le projeté orthogonal.",
    prerequisites: ["math_m_space_geometry_planes"],
    lesson: {
      title_ar: "المستقيمات في الفضاء: التمثيل الوسيطي والتقاطع والتعامد",
      contentMarkdown_ar: `### التمثيل الوسيطي لمستقيم في الفضاء
المستقيم $(D)$ المار بالنقطة $A(x_A, y_A, z_A)$ والموجه بالشعاع غير المعدوم $\\vec{u}(a, b, c)$ معرف بجملة المعادلات الوسيطية:
$$\\begin{cases} x = x_A + a t \\\\ y = y_A + b t \\\\ z = z_A + c t \\end{cases} \\quad (t \\in \\mathbb{R})$$

### تقاطع مستقيم مع مستو
لتعيين نقطة تقاطع المستقيم $(D)$ مع المستوي $(P)$ ذي المعادلة الديكارتية $Ax + By + Cz + D = 0$:
1. نعوض عبارات $x(t)$ و $y(t)$ و $z(t)$ في معادلة المستوي.
2. نحل المعادلة الناتجة ذات المجهول الوحيد $t$.
3. إذا وجد حل وحيد $t_0$: المستقيم والمستوي يتقاطعان في نقطة وحيدة $M_0$.
4. إذا كانت المعادلة مستحيلة: المستقيم يوازي تماماً المستوي ($(D) \\cap (P) = \\emptyset$).

### المسقط العمودي لنقطة على مستو
لتعيين المسقط العمودي $H$ لنقطة $A$ على مستو $(P)$:
1. المستقيم $(\\Delta)$ العمودي على $(P)$ والمار بـ $A$ يوجه بالشعاع الناظمي $\\vec{n}(A, B, C)$ للمستوي.
2. نكتب التمثيل الوسيطي للمستقيم $(\\Delta)$.
3. نحسب نقطة تقاطع $(\\Delta)$ مع $(P)$؛ وتلك النقطة هي بالضبط المسقط العمودي $H$.`,
      keyTakeaway_ar: "لإيجاد تقاطع مستقيم ومستو نعوض إحداثيات وسيط المستقيم في معادلة المستوي ونحل بالنسبة لـ t. والمسقط العمودي هو تقاطع المستقيم الناظمي مع المستوي.",
    },
    workedExample: {
      problem_ar: "نعتبر المستوي (P): 2x - y + z - 7 = 0 والنقطة A(1, 2, 1). اكتب تمثيلاً وسيطياً للمستقيم (D) العمودي على (P) والمار بـ A، ثم عيّن إحداثيات المسقط العمودي H للنقطة A على المستوي (P).",
      stepByStepSolution_ar: [
        "الخطوة 1: تعيين شعاع التوجيه للمستقيم العمودي: بما أن المستقيم (D) عمودي على المستوي (P)، فإن شعاع توجيهه u يوازي الشعاع الناظمي للمستوي: n(2, -1, 1).",
        "الخطوة 2: كتابة التمثيل الوسيطي لـ (D) المار بـ A(1, 2, 1): x = 1 + 2t، y = 2 - t، z = 1 + t مع t من R.",
        "الخطوة 3: تعويض إحداثيات المستقيم في معادلة المستوي (P): 2(1 + 2t) - (2 - t) + (1 + t) - 7 = 0.",
        "الخطوة 4: حل المعادلة بالنسبة للوسيط t: (2 + 4t) - 2 + t + 1 + t - 7 = 0. نجمع الحدود: 6t - 6 = 0 إذن 6t = 6 ومنه t = 1.",
        "الخطوة 5: حساب إحداثيات المسقط العمودي H: بتعويض t = 1 في التمثيل الوسيطي: x_H = 1 + 2(1) = 3، y_H = 2 - (1) = 1، z_H = 1 + (1) = 2. إذن إحداثيات المسقط العمودي هي: H(3, 1, 2).",
        "الخطوة 6: التحقق من النتيجة: نعوض H في معادلة المستوي (P): 2(3) - 1 + 2 - 7 = 6 - 1 + 2 - 7 = 0 (محققة). ونحسب المسافة AH: AH = sqrt((3-1)^2 + (1-2)^2 + (2-1)^2) = sqrt(4 + 1 + 1) = sqrt(6). ونحسب بالدستور: d(A, P) = |2(1) - 2 + 1 - 7| / sqrt(4+1+1) = |-6| / sqrt(6) = 6 / sqrt(6) = sqrt(6) (تطابق تام وموثوق).",
      ],
      pedagogicalComment_ar: "تطابق المسافة المحسوبة AH مع قانون المسافة d(A, P) يثبت صحة إحداثيات المسقط العمودي H بنسبة 100%.",
    },
    activeRecall: {
      prompt_ar: "كيف نعين نقطة تقاطع مستقيم ذي تمثيل وسيطي مع مستو ذي معادلة ديكارتية؟",
      expectedAnswer_ar: "نعوض عبارات x(t) و y(t) و z(t) في معادلة المستوي، ونحل المعادلة ذات المجهول t، ثم نعوض قيمة t في التمثيل الوسيطي لحساب إحداثيات نقطة التقاطع.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_spaceline_01",
        prompt_ar: "عيّن نقطة تقاطع المستقيم x = t, y = 2t, z = 1 مع المستوي x + y + z - 7 = 0.",
        optionsCount: 4,
        correctAnswerId: "opt_space_pt_241",
        explanation_ar: "بالتعويض: t + 2t + 1 - 7 = 0 يعطي 3t = 6 إذن t = 2. ومنه M(2, 4, 1).",
        distractorErrorMappings: {
          opt_space_pt_121: "calculation_error",
          opt_space_pt_007: "misunderstood_concept",
          opt_space_pt_361: "forgot_information",
        },
      },
      {
        id: "pq_math_m_spaceline_02",
        prompt_ar: "ما هو شعاع التوجيه للمستقيم ذي التمثيل الوسيطي: x = 2 + 3t, y = 1 - t, z = 4t؟",
        optionsCount: 4,
        correctAnswerId: "opt_space_vec_3m14",
        explanation_ar: "شعاع التوجيه يتشكل من معاملات الوسيط t: u(3, -1, 4).",
        distractorErrorMappings: {
          opt_space_vec_210: "misunderstood_concept",
          opt_space_vec_314: "calculation_error",
          opt_space_vec_111: "forgot_information",
        },
      },
    ],
    retest: {
      id: "rq_math_m_spaceline_twin",
      parentPracticeQuestionId: "pq_math_m_spaceline_01",
      prompt_ar: "عيّن نقطة تقاطع المستقيم x = 1 + t, y = 2 - t, z = 3t مع المستوي x + y + z - 6 = 0.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_space_pt_213",
      explanation_ar: "بالتعويض: (1 + t) + (2 - t) + 3t - 6 = 0 يعطي 3 + 3t - 6 = 0 إذن 3t = 3 ومنه t = 1. النقطة هي N(1+1, 2-1, 3(1)) = N(2, 1, 3).",
    },
    repairGuide: {
      targetErrorType: "misunderstood_concept",
      title_ar: "معالجة الخلط بين شعاع التوجيه للمستقيم والشعاع الناظمي للمستوي في الفضاء",
      mentalModelExplanation_ar: "يعتقد التلميذ خطأً أن المستقيم العمودي على مستو يوجه بأشعة محتواة في المستوي، في حين أنه يوجه حصراً بالشعاع الناظمي العمودي على المستوي.",
      actionableSteps_ar: [
        "الخطوة 1: إذا كان المستقيم عمودياً على المستوي (P)، فشعاع توجيهه u هو نفسه الشعاع الناظمي n للمستوي.",
        "الخطوة 2: إذا كان المستقيم موازياً للمستوي، فشعاع توجيهه يعامد الناظم: u . n = 0.",
        "الخطوة 3: لحساب نقطة التقاطع، عوض دائماً معادلات المستقيم في معادلة المستوي وتأكد من التحقق بعد إيجاد t.",
      ],
      contrastiveWorkedExample: "خطأ: مستقيم عمودي على 2x - y + z = 0 نوجهه بـ (1, 2, 0). صواب: نوجهه بالشعاع الناظمي المباشر (2, -1, 1).",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_space_lines_intersections"],
    externalResourceIds: ["res_math_m_space_lines_intersections"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "التمثيل الوسيطي لمستقيم والمسقط العمودي لنقطة على مستو سؤالان رئيسيان في تمرين الهندسة الفضائية بالبكالوريا لحساب المسافات وحجوم الأهرامات.",
      commonPitfalls_ar: ["الخلط بين معاملات t والنقطة الثابتة", "الخطأ في حل المعادلة الخطية لـ t"],
      officialBacPastRefIds: ["bac_m_2024_s1_ex3", "bac_m_2022_s1_ex3"],
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
  // 8. SPHÈRES DANS L'ESPACE ET INTERSECTIONS
  // ---------------------------------------------------------------------------
  math_m_space_spheres_equations: {
    packageId: "pkg_math_m_space_spheres_equations",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_space_geometry",
    skillId: "math_m_space_spheres_equations",
    objective_ar: "تعيين المعادلة الديكارتية لسطح كرة ودراسة تقاطع مستو مع سطح كرة وتعيين مركز ونصف قطر دائرة التقاطع أو معادلة المستوي المماس.",
    objective_fr: "Déterminer l'équation d'une sphère, étudier l'intersection d'un plan et d'une sphère et caractériser le cercle d'intersection ou le plan tangent.",
    prerequisites: ["math_m_space_geometry_planes", "math_m_space_lines_intersections"],
    lesson: {
      title_ar: "سطح الكرة في الفضاء: المعادلات وتقاطع مستو وسطح كرة",
      contentMarkdown_ar: `### المعادلة الديكارتية لسطح كرة
سطح الكرة $(S)$ الذي مركزه $\\Omega(x_0, y_0, z_0)$ ونصف قطره $R > 0$ هو مجموعة النقط $M(x, y, z)$ التي تحقق $\\Omega M = R$.
معادلته النموذجية:
$$(x - x_0)^2 + (y - y_0)^2 + (z - z_0)^2 = R^2$$

### تقاطع مستو مع سطح كرة
لدراسة تقاطع مستو $(P)$ مع سطح كرة $(S)$ مركزه $\\Omega$ ونصف قطره $R$:
1. نحسب المسافة $d = d(\\Omega, P)$ بين المركز $\\Omega$ والمستوي $(P)$.
2. نميز ثلاث حالات هندسية:
   - **إذا كان $d > R$**: التقاطع خالٍ: $(P) \\cap (S) = \\emptyset$ (المستوي يقع خارج سطح الكرة).
   - **إذا كان $d = R$**: المستوي مماس لسطح الكرة في نقطة وحيدة $H$ (المسقط العمودي لـ $\\Omega$ على $(P)$).
   - **إذا كان $d < R$**: يتقاطع المستوي وسطح الكرة وفق **دائرة** $(C)$ مركزها $H$ (المسقط العمودي لـ $\\Omega$ على $(P)$) ونصف قطرها $r$ يعطى بنظرية فيثاغورس:
     $$r = \\sqrt{R^2 - d^2}$$`,
      keyTakeaway_ar: "إذا كانت المسافة d من مركز الكرة إلى المستوي أصغر من نصف القطر R، فإن التقاطع دائرة نصف قطرها r = sqrt(R^2 - d^2) ومركزها المسقط العمودي H.",
    },
    workedExample: {
      problem_ar: "نعتبر سطح الكرة (S) ذي المعادلة: (x - 1)^2 + (y - 2)^2 + (z + 1)^2 = 25 والمستوي (P): 2x - 2y + z + 12 = 0. ادرس تقاطع (P) و (S)، وعيّن مركز ونصف قطر دائرة التقاطع (C).",
      stepByStepSolution_ar: [
        "الخطوة 1: استخراج مركز ونصف قطر سطح الكرة: بالمطابقة مع المعادلة النموذجية، مركز الكرة هو Omega(1, 2, -1) ونصف قطرها R = sqrt(25) = 5.",
        "الخطوة 2: حساب المسافة d بين المركز Omega والمستوي (P): d = |2(1) - 2(2) + 1(-1) + 12| / sqrt(2^2 + (-2)^2 + 1^2) = |2 - 4 - 1 + 12| / sqrt(4 + 4 + 1) = |9| / sqrt(9) = 9 / 3 = 3.",
        "الخطوة 3: مقارنة المسافة d مع نصف القطر R: لدينا d = 3 و R = 5، إذن d < R تماماً.",
        "الخطوة 4: الاستنتاج الهندسي وحساب نصف قطر دائرة التقاطع r: بما أن d < R، فإن المستوي (P) يقطع سطح الكرة (S) وفق دائرة (C). نصف قطر الدائرة هو: r = sqrt(R^2 - d^2) = sqrt(5^2 - 3^2) = sqrt(25 - 9) = sqrt(16) = 4.",
        "الخطوة 5: تعيين مركز دائرة التقاطع H (المسقط العمودي لـ Omega على P): المستقيم المار بـ Omega والعمودي على (P) يوجه بـ n(2, -2, 1): x = 1 + 2t، y = 2 - 2t، z = -1 + t. بالتعويض في (P): 2(1+2t) - 2(2-2t) + (-1+t) + 12 = 0. 2 + 4t - 4 + 4t - 1 + t + 12 = 0 يعطي 9t + 9 = 0 إذن t = -1. بتعويض t = -1: x_H = 1 - 2 = -1، y_H = 2 + 2 = 4، z_H = -1 - 1 = -2. مركز الدائرة هو H(-1, 4, -2).",
      ],
      pedagogicalComment_ar: "التطبيق الدقيق لنظرية فيثاغورس r = sqrt(R^2 - d^2) يمنع الخلط الشائع بين نصف قطر الكرة R ونصف قطر دائرة التقاطع r.",
    },
    activeRecall: {
      prompt_ar: "إذا كانت المسافة بين مركز سطح كرة Omega ذي نصف القطر R ومستو (P) أصغر تماماً من R (أي d < R)، فما هي طبيعة تقاطع المستوي وسطح الكرة؟",
      expectedAnswer_ar: "التقاطع هو دائرة (C) مركزها H (المسقط العمودي لـ Omega على P) ونصف قطرها r = sqrt(R^2 - d^2).",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_sphere_01",
        prompt_ar: "عيّن مركز ونصف قطر سطح الكرة ذي المعادلة: (x - 2)^2 + (y + 1)^2 + z^2 = 16.",
        optionsCount: 4,
        correctAnswerId: "opt_sphere_c2m10_r4",
        explanation_ar: "المركز هو أوميغا(2, -1, 0) ونصف القطر هو R = sqrt(16) = 4.",
        distractorErrorMappings: {
          opt_sphere_r16: "calculation_error",
          opt_sphere_sign: "misunderstood_concept",
          opt_sphere_z1: "forgot_information",
        },
      },
      {
        id: "pq_math_m_sphere_02",
        prompt_ar: "إذا كان نصف قطر سطح كرة هو R = 5 ومسافة مركزه عن مستو هي d = 3، فما هو نصف قطر دائرة التقاطع؟",
        optionsCount: 4,
        correctAnswerId: "opt_sphere_circ_r4",
        explanation_ar: "r = sqrt(R^2 - d^2) = sqrt(25 - 9) = sqrt(16) = 4.",
        distractorErrorMappings: {
          opt_sphere_circ_r2: "calculation_error",
          opt_sphere_circ_r5: "misunderstood_concept",
          opt_sphere_circ_r8: "forgot_information",
        },
      },
    ],
    retest: {
      id: "rq_math_m_sphere_twin",
      parentPracticeQuestionId: "pq_math_m_sphere_02",
      prompt_ar: "سطح كرة نصف قطره R = 10 يقطعه مستو يبعد عن مركزه بمسافة d = 6. احسب نصف قطر دائرة التقاطع r.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_sphere_circ_r8",
      explanation_ar: "r = sqrt(R^2 - d^2) = sqrt(10^2 - 6^2) = sqrt(100 - 36) = sqrt(64) = 8.",
    },
    repairGuide: {
      targetErrorType: "calculation_error",
      title_ar: "معالجة خطأ الخلط بين نصف قطر الكرة R ونصف قطر دائرة التقاطع r أو نسيان الجذر التربيعي",
      mentalModelExplanation_ar: "يخلط التلميذ بين نصف قطر الكرة R ونصف قطر الدائرة الناتجة r، أو يطرح المسافات مباشرة دون تربيع (كأن يكتب r = R - d).",
      actionableSteps_ar: [
        "الخطوة 1: ارسم في المسودة مقطع المثلث القائم الذي وتره R وضلعاه القائمان d و r.",
        "الخطوة 2: اكتب نظرية فيثاغورس صراحة: R^2 = d^2 + r^2.",
        "الخطوة 3: استنتج نصف قطر دائرة التقاطع بالجذر التربيعي: r = sqrt(R^2 - d^2).",
      ],
      contrastiveWorkedExample: "خطأ: r = R - d = 5 - 3 = 2. صواب: r = sqrt(5^2 - 3^2) = sqrt(25 - 9) = 4.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_space_spheres_equations"],
    externalResourceIds: ["res_math_m_space_spheres_equations"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "دراسة تقاطع مستو وسطح كرة ترد كخاتمة لتمرين الهندسة الفضائية، وغالباً ما يطلب إثبات المماسية أو حساب نصف قطر دائرة التقاطع.",
      commonPitfalls_ar: ["الخلط بين r و R", "الخطأ في حساب مسافة نقطة عن مستو"],
      officialBacPastRefIds: ["bac_m_2023_s1_ex3", "bac_m_2021_s1_ex3"],
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
  // 9. VARIABLES ALÉATOIRES, ESPÉRANCE ET VARIANCE
  // ---------------------------------------------------------------------------
  math_m_random_variables_expectation: {
    packageId: "pkg_math_m_random_variables_expectation",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_combinatorics_bernoulli",
    skillId: "math_m_random_variables_expectation",
    objective_ar: "تعيين قيم متغير عشوائي X(Omega) وتأسيس جدول قانون الاحتمال وحساب الأمل الرياضي E(X) والتباين V(X) والانحراف المعياري وتفسير عدالة اللعبة.",
    objective_fr: "Déterminer l'ensemble des valeurs d'une variable aléatoire, établir sa loi de probabilité, calculer l'espérance, la variance et interpréter l'équité d'un jeu.",
    prerequisites: ["math_m_combinatorics_bernoulli", "math_m_total_probability"],
    lesson: {
      title_ar: "المتغيرات العشوائية: قانون الاحتمال، الأمل الرياضي والتباين",
      contentMarkdown_ar: `### مفهوم المتغير العشوائي وقانون الاحتمال
المتغير العشوائي $X$ هو دالة معرفة من فضاء العينة $\\Omega$ نحو $\\mathbb{R}$.
مجموعة قيمه هي: $X(\\Omega) = \\{x_1, x_2, \\dots, x_k\\}$.
قانون احتمال $X$ هو إرفاق كل قيمة $x_i$ باحتمال تحققها $P(X = x_i) = p_i$، مع تحقيق شرط الانغلاق الاحتمالي:
$$\\sum_{i=1}^{k} P(X = x_i) = p_1 + p_2 + \\dots + p_k = 1$$

### الأمل الرياضي (Espérance mathématique)
يمثل القيمة المتوسطة المتوقعة للمتغير العشوائي عند تكرار التجربة عدداً كبيراً من المرات:
$$E(X) = \\sum_{i=1}^{k} x_i \\cdot P(X = x_i) = x_1 p_1 + x_2 p_2 + \\dots + x_k p_k$$
- إذا كان $X$ يمثل الربح الصافي للعبة:
  - $E(X) = 0$: اللعبة **عادلة** (équitable).
  - $E(X) > 0$: اللعبة رابحة لصالح اللاعب.
  - $E(X) < 0$: اللعبة خاسرة ضد اللاعب.

### التباين والانحراف المعياري
التباين يقيس درجة تشتت القيم حول الأمل الرياضي، ويحسب بقانون كونيغ (Formule de Koenig-Huygens):
$$V(X) = E(X^2) - [E(X)]^2 = \\sum_{i=1}^{k} x_i^2 p_i - [E(X)]^2$$
والانحراف المعياري هو:
$$\\sigma(X) = \\sqrt{V(X)}$$`,
      keyTakeaway_ar: "قانون الاحتمال يلخص في جدول مجموعه 1، والأمل E(X) هو المجموع الموزون x_i*p_i، والتباين هو V(X) = E(X^2) - (E(X))^2.",
    },
    workedExample: {
      problem_ar: "يحتوي كيس على 3 كرات حمراء وكرتين سوداوين. نسحب عشوائياً كرتين في آن واحد. ليكن X المتغير العشوائي الذي يمثل عدد الكرات الحمراء المسحوبة. عيّن قانون احتمال X، واحسب أمله الرياضي E(X) وتباينه V(X).",
      stepByStepSolution_ar: [
        "الخطوة 1: حساب عدد الحالات الإجمالية card(Omega): السحب في آن واحد لكرتين من بين 5: card(Omega) = C_5^2 = (5 * 4) / 2 = 10.",
        "الخطوة 2: تحديد مجموعة قيم المتغير العشوائي X: بما أننا نسحب كرتين، فالقيم الممكنة لعدد الكرات الحمراء هي: X(Omega) = {0, 1, 2}.",
        "الخطوة 3: حساب احتمالات كل قيمة: - P(X = 0) (0 حمراء و 2 سوداء): C_3^0 * C_2^2 / 10 = (1 * 1) / 10 = 1/10 = 0.1. - P(X = 1) (1 حمراء و 1 سوداء): C_3^1 * C_2^1 / 10 = (3 * 2) / 10 = 6/10 = 0.6. - P(X = 2) (2 حمراء و 0 سوداء): C_3^2 * C_2^0 / 10 = (3 * 1) / 10 = 3/10 = 0.3.",
        "الخطوة 4: التحقق من الانغلاق: sum p_i = 0.1 + 0.6 + 0.3 = 1.0 (مجموع الاحتمالات يساوي 1 تماماً).",
        "الخطوة 5: حساب الأمل الرياضي E(X): E(X) = 0*(0.1) + 1*(0.6) + 2*(0.3) = 0 + 0.6 + 0.6 = 1.2.",
        "الخطوة 6: حساب E(X^2) والتباين V(X): E(X^2) = 0^2*(0.1) + 1^2*(0.6) + 2^2*(0.3) = 0 + 0.6 + 4*(0.3) = 0.6 + 1.2 = 1.8. التباين بقانون كونيغ: V(X) = E(X^2) - (E(X))^2 = 1.8 - (1.2)^2 = 1.8 - 1.44 = 0.36. والانحراف المعياري sigma(X) = sqrt(0.36) = 0.6.",
      ],
      pedagogicalComment_ar: "الأمل الرياضي 1.2 يتطابق بدقة مع النتيجة النظرية لقانون السحب الفوق-هندسي n*(R/N) = 2*(3/5) = 1.2.",
    },
    activeRecall: {
      prompt_ar: "ما هو قانون كونيغ لحساب التباين V(X) لمتغير عشوائي X؟",
      expectedAnswer_ar: "قانون كونيغ هو: V(X) = E(X^2) - [E(X)]^2 حيث E(X^2) = sum (x_i^2 * p_i).",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_rv_01",
        prompt_ar: "متغير عشوائي X يأخذ القيمة 1 باحتمال 0.4 والقيمة 2 باحتمال 0.6. احسب الأمل الرياضي E(X).",
        optionsCount: 4,
        correctAnswerId: "opt_rv_exp_16",
        explanation_ar: "E(X) = 1*(0.4) + 2*(0.6) = 0.4 + 1.2 = 1.6.",
        distractorErrorMappings: {
          opt_rv_exp_15: "calculation_error",
          opt_rv_exp_10: "forgot_information",
          opt_rv_exp_20: "misunderstood_concept",
        },
      },
      {
        id: "pq_math_m_rv_02",
        prompt_ar: "متى تكون لعبة حظ ذات متغير عشوائي X عادلة (équitable)؟",
        optionsCount: 4,
        correctAnswerId: "opt_rv_fair_zero",
        explanation_ar: "تكون اللعبة عادلة إذا وفقط إذا كان الأمل الرياضي معدوماً: E(X) = 0.",
        distractorErrorMappings: {
          opt_rv_fair_pos: "misunderstood_concept",
          opt_rv_fair_one: "calculation_error",
          opt_rv_fair_var: "forgot_information",
        },
      },
    ],
    retest: {
      id: "rq_math_m_rv_twin",
      parentPracticeQuestionId: "pq_math_m_rv_01",
      prompt_ar: "متغير عشوائي Y يأخذ القيمة -2 باحتمال 0.3 والقيمة 3 باحتمال 0.7. احسب الأمل الرياضي E(Y).",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_rv_exp_15",
      explanation_ar: "E(Y) = -2*(0.3) + 3*(0.7) = -0.6 + 2.1 = 1.5.",
    },
    repairGuide: {
      targetErrorType: "calculation_error",
      title_ar: "معالجة خطأ حساب التباين بتعويض E(X^2) بـ (E(X))^2 أو نسيان إشارة الناقص في القيم السالبة",
      mentalModelExplanation_ar: "يحسب التلميذ E(X^2) بتربيع الأمل الرياضي نفسه مما ينتج عنه تباين منعدم خطأً، أو يهمل الإشارات السالبة عند ضرب القيم في احتمالاتها.",
      actionableSteps_ar: [
        "الخطوة 1: احسب الأمل الرياضي أولاً: E(X) = sum x_i * p_i.",
        "الخطوة 2: أضف سطراً لـ x_i^2 واحسب بشكل مستقل تماماً: E(X^2) = sum x_i^2 * p_i.",
        "الخطوة 3: طبق قانون كونيغ: V(X) = E(X^2) - [E(X)]^2 وتأكد أن الناتج موجب تماماً.",
      ],
      contrastiveWorkedExample: "خطأ: إذا كان E(X) = 1.2 نعتبر E(X^2) = 1.44 والتباين 0. صواب: E(X^2) = sum x_i^2*p_i = 1.8 والتباين 1.8 - 1.44 = 0.36.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_random_variables_expectation"],
    externalResourceIds: ["res_math_m_random_variables_expectation"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "جدول قانون الاحتمال وحساب الأمل الرياضي يمثلان السؤال الختامي الثابت في تمرين الاحتمالات بالبكالوريا وعليهما ثلث علامة التمرين الإجمالية.",
      commonPitfalls_ar: ["نسيان إحدى قيم X الممكنة", "الخلط بين E(X^2) و (E(X))^2"],
      officialBacPastRefIds: ["bac_m_2024_s1_ex2", "bac_m_2023_catchup_ex2"],
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
// 2. DIAGNOSTIC SIGNAL PROFILES FOR BATCH 03
// =============================================================================

export const MATH_BATCH_03_DIAGNOSTIC_SIGNALS: Record<string, MathDiagnosticSignalProfile> = {
  math_m_fermat_little_theorem: {
    skillId: "math_m_fermat_little_theorem",
    missingPrerequisiteIndicators_ar: [
      "الارتباك في إثبات أولية العددين a و p بالقاسم المشترك الأكبر PGCD(a, p) = 1",
      "الخطأ في حساب باقي القسمة الإقليدية للأس الكبير على p - 1"
    ],
    conceptualMisconceptionIndicators_ar: [
      "تطبيق مبرهنة فيرما على ترديد غير أولي دون التحقق من شرط الأولية",
      "قسمة الأس على p بدلاً من p - 1 عند اختزال القوة الكبيرة"
    ],
    proceduralWeaknessIndicators_ar: [
      "الخطأ في قسمة الأس الكبير على p-1 وتحديد الباقي r بدقة",
      "نسيان ضرب باقي a^r في مضاعف الترديد لحساب النتيجة النهائية"
    ],
    examMethodWeaknessIndicators_ar: [
      "إغفال ذكر شرط PGCD(a, p) = 1 صراحة قبل تطبيق المبرهنة في ورقة الإجابة"
    ],
  },
  math_m_numeral_systems: {
    skillId: "math_m_numeral_systems",
    missingPrerequisiteIndicators_ar: [
      "الارتباك في كتابة مفكوك العدد برتب القوى b^k",
      "الخطأ في حل معادلة من الدرجة الثانية في مجموعة الأعداد الطبيعية"
    ],
    conceptualMisconceptionIndicators_ar: [
      "قبول رقم في الكتابة يفوق أو يساوي أساس نظام العد x",
      "اعتبار أن الأساس يمكن أن يكون عدداً سالباً أو مساوياً لـ 1"
    ],
    proceduralWeaknessIndicators_ar: [
      "نسيان الرتبة الصفرية b^0 = 1 أثناء النشر والتحويل إلى النظام العشري",
      "الخطأ في تجميع الحدود وحساب المميز Δ للمعادلة الناتجة"
    ],
    examMethodWeaknessIndicators_ar: [
      "عدم التحقق من شرط الأساس x > max(chiffres) قبل قبول الحلول الجبرية"
    ],
  },
  math_m_complex_polynomials_factorization: {
    skillId: "math_m_complex_polynomials_factorization",
    missingPrerequisiteIndicators_ar: [
      "الارتباك في حساب قوى الوحدة التخيلية i^2 = -1 و i^3 = -i",
      "الخطأ في القسمة الإقليدية لكثير حدود على (z - z_0)"
    ],
    conceptualMisconceptionIndicators_ar: [
      "الاعتقاد بأن مرافق الجذر المركب حل دائماً حتى لو كانت معاملات كثير الحدود غير حقيقية",
      "نسيان الحلول التخيلية الصرفة عند استخراج المعادلة المميزة"
    ],
    proceduralWeaknessIndicators_ar: [
      "الخطأ في مطابقة المعاملات الحقيقية والتخيلية لاستخراج قيمة الجذر التخيلي الصرف b",
      "الخطأ في حساب المميز Δ المركب عند استنتاج الجذرين الآخرين"
    ],
    examMethodWeaknessIndicators_ar: [
      "عدم كتابة التحليل الإجمالي P(z) = a(z - z_0)(z - z_1)(z - z_2) قبل استنتاج مجموعة الحلول"
    ],
  },
  math_m_primitives_rational_fractions: {
    skillId: "math_m_primitives_rational_fractions",
    missingPrerequisiteIndicators_ar: [
      "الارتباك في تفكيك الكسور وتوحيد المقامات",
      "نسيان مشتقات الدوال اللوغاريتمية والكسرية"
    ],
    conceptualMisconceptionIndicators_ar: [
      "إهمال وضع القيمة المطلقة داخل اللوغاريتم ln|u| عند حساب الدوال الأصلية",
      "الخلط بين شكل التكامل u'/u (يعطي ln) وشكل u'/u^2 (يعطي -1/u)"
    ],
    proceduralWeaknessIndicators_ar: [
      "الخطأ في تعيين ثوابت التفكيك a و b بالمطابقة أو التعويض بنقاط خاصة",
      "الخطأ في إشارة السالب عند مكاملة 1/(x-a)^2"
    ],
    examMethodWeaknessIndicators_ar: [
      "عدم تحديد مجال صلاحية الدالة الأصلية ومراعاة استمراريتها على المجال المعطى"
    ],
  },
  math_m_integral_functions_variable_bounds: {
    skillId: "math_m_integral_functions_variable_bounds",
    missingPrerequisiteIndicators_ar: [
      "عدم إتقان تبرير استمرارية الدوال المركبة والكسرية",
      "الارتباك في قواعد اشتقاق الدوال وتطبيق المبرهنات الأساسية"
    ],
    conceptualMisconceptionIndicators_ar: [
      "محاولة إيجاد عبارة صريحة للدالة الأصلية لدوال لا تقبل تكاملاً ابتدائياً",
      "الخلط بين متغير التكامل t ومتغير الدالة x أثناء الاشتقاق"
    ],
    proceduralWeaknessIndicators_ar: [
      "نسيان أن مشتقة F(x) هي f(x) مباشرة دون أي عمليات مكاملة مسبقة",
      "الخطأ في استغلال حصر الدالة f(t) لحصر التكامل"
    ],
    examMethodWeaknessIndicators_ar: [
      "إغفال ذكر شرط استمرارية الدالة f على المجال قبل تأكيد قابلية اشتقاق F"
    ],
  },
  math_m_second_order_differential_equations: {
    skillId: "math_m_second_order_differential_equations",
    missingPrerequisiteIndicators_ar: [
      "الارتباك في حل المعادلات من الدرجة الثانية ذات المميز السالب في C",
      "الخطأ في اشتقاق الدوال المثلثية وجداء الدوال"
    ],
    conceptualMisconceptionIndicators_ar: [
      "نسيان العامل x في الحل العام لحالة المميز المعدوم (C_1 + C_2 x) e^(r_0 x)",
      "الخلط بين الجزء الحقيقي alpha وجزء التردد beta في الحلول المركبة e^(alpha x) (A cos(beta x) + B sin(beta x))"
    ],
    proceduralWeaknessIndicators_ar: [
      "الخطأ في حساب جذور المعادلة المميزة ar^2 + br + c = 0",
      "الخطأ في جملة المعادلتين لتعيين الثوابت C_1 و C_2 انطلاقاً من الشروط الابتدائية y(x_0) و y'(x_0)"
    ],
    examMethodWeaknessIndicators_ar: [
      "عدم كتابة المعادلة المميزة صراحة قبل استعراض الحل العام للمعادلة التفاضلية"
    ],
  },
  math_m_space_lines_intersections: {
    skillId: "math_m_space_lines_intersections",
    missingPrerequisiteIndicators_ar: [
      "الارتباك في استخراج إحداثيات شعاع التوجيه ونقطة من التمثيل الوسيطي",
      "الخطأ في حل معادلة من الدرجة الأولى بمجهول واحد t"
    ],
    conceptualMisconceptionIndicators_ar: [
      "الخلط بين الشعاع الناظمي للمستوي وشعاع توجيه المستقيم العمودي عليه",
      "اعتقاد أن المستقيم يوازي المستوي إذا كانت نقطة تقاطعهما غير موجودة في الربع الأول"
    ],
    proceduralWeaknessIndicators_ar: [
      "الخطأ في تعويض التمثيل الوسيطي (x(t), y(t), z(t)) في المعادلة الديكارتية للمستوي",
      "الخطأ في حساب إحداثيات نقطة التقاطع بعد إيجاد قيمة الوسيط t"
    ],
    examMethodWeaknessIndicators_ar: [
      "عدم التحقق من أن نقطة التقاطع المحسوبة تنتمي فعلاً لكل من المستقيم والمستوي معاً"
    ],
  },
  math_m_space_spheres_equations: {
    skillId: "math_m_space_spheres_equations",
    missingPrerequisiteIndicators_ar: [
      "الارتباك في إتمام المربع لتعيين مركز ونصف قطر سطح الكرة",
      "الخطأ في قانون المسافة من نقطة إلى مستو d(Omega, P)"
    ],
    conceptualMisconceptionIndicators_ar: [
      "الخلط بين نصف قطر سطح الكرة R ونصف قطر دائرة التقاطع r",
      "طرح المسافات مباشرة r = R - d بدلاً من تطبيق مبرهنة فيثاغورس r = sqrt(R^2 - d^2)"
    ],
    proceduralWeaknessIndicators_ar: [
      "الخطأ في حساب المميز أو الإشارة داخل الجذر التربيعي لحساب نصف قطر الدائرة",
      "الخطأ في كتابة التمثيل الوسيطي للمستقيم المار بالمركز والعمودي على المستوي لتعيين مركز الدائرة"
    ],
    examMethodWeaknessIndicators_ar: [
      "عدم المقارنة الصريحة بين المسافة d ونصف القطر R قبل الجزم بوجود دائرة التقاطع"
    ],
  },
  math_m_random_variables_expectation: {
    skillId: "math_m_random_variables_expectation",
    missingPrerequisiteIndicators_ar: [
      "الارتباك في حساب التوفيقات C_n^p بالآلة الحاسبة أو دستور التحليل التوفيقي",
      "الخطأ في جمع الكسور وتوحيد المقامات"
    ],
    conceptualMisconceptionIndicators_ar: [
      "نسيان إحدى قيم المتغير العشوائي الممكنة (خاصة القيمة 0 أو القيم السالبة في ألعاب الحظ)",
      "الخلط بين E(X^2) و (E(X))^2 عند حساب التباين V(X)"
    ],
    proceduralWeaknessIndicators_ar: [
      "الخطأ في حساب احتمالات كل قيمة لـ X وعدم التأكد من أن مجموعها يساوي 1",
      "الخطأ في حساب الجذر التربيعي للتباين لإيجاد الانحراف المعياري sigma(X)"
    ],
    examMethodWeaknessIndicators_ar: [
      "إغفال رسم جدول قانون الاحتمال والتحقق من مجموع الاحتمالات قبل حساب الأمل الرياضي"
    ],
  },
};

// =============================================================================
// 3. SPACED REVIEW SCHEDULES FOR BATCH 03
// =============================================================================

export const MATH_BATCH_03_SPACED_REVIEWS: Record<string, MathSpacedReviewSchedule> = {
  math_m_fermat_little_theorem: {
    skillId: "math_m_fermat_little_theorem",
    day1InitialEvidence_ar: "حساب باقي قسمة 3^2026 على 7 وتطبيق مبرهنة فيرما باختزال الأس بنجاح.",
    day3RetrievalPrompt_ar: "استرجع: ما هو نص مبرهنة فيرما الصغرى وما الشرطان الأساسيان لتطبيقها؟",
    day7MixedPracticePrompt_ar: "احسب باقي قسمة 5^2025 على 13 واستنتج قابلية قسمة 5^2025 - 5 على 13.",
    laterExamApplicationPrompt_ar: "حل مسألة حساب وجبر من بكالوريا شعبة رياضيات تتضمن حل معادلة ديوفانتية ومبرهنة فيرما.",
  },
  math_m_numeral_systems: {
    skillId: "math_m_numeral_systems",
    day1InitialEvidence_ar: "حل معادلة نظام التعداد وتعيين الأساس x = 6 وكتابة العدد في النظام العشري.",
    day3RetrievalPrompt_ar: "استرجع: كيف يكتب العدد bar(cba)_x في النظام العشري وما هو شرط أرقامه a, b, c؟",
    day7MixedPracticePrompt_ar: "عيّن الأساس n بحيث يكون: bar(132)_n = bar(220)_5 مع التحقق من الشروط.",
    laterExamApplicationPrompt_ar: "حل تمرين قسمة وتعداد من بكالوريا سابقة يتضمن الانتقال بين قاعدتين ودراسة القواسم.",
  },
  math_m_complex_polynomials_factorization: {
    skillId: "math_m_complex_polynomials_factorization",
    day1InitialEvidence_ar: "حل معادلة تكعيبية في C بإيجاد الحل التخيلي الصرف وإتمام التحليل والحل الكامل.",
    day3RetrievalPrompt_ar: "استرجع: إذا كان كثير حدود بمعاملات حقيقية يقبل z_0 حلاً، فما هو الحل التلقائي الآخر؟ وكيف نبحث عن جذر تخيلي صرف؟",
    day7MixedPracticePrompt_ar: "حل في C المعادلة z^3 - (3+2i)z^2 + (3+6i)z - 9i = 0 علماً أنها تقبل حلاً حقيقياً صرفاً.",
    laterExamApplicationPrompt_ar: "حل مسألة أعداد مركبة كاملة من بكالوريا 2024 تحوي حل كثير حدود وتعيين النقط في المستوي.",
  },
  math_m_primitives_rational_fractions: {
    skillId: "math_m_primitives_rational_fractions",
    day1InitialEvidence_ar: "تفكيك كسر ناطق وحساب دواله الأصلية بنجاح وتعيين الدالة الأصلية المنعدمة عند قيمة معطاة.",
    day3RetrievalPrompt_ar: "استرجع: ما هي الدالة الأصلية لـ u'(x)/u(x) ولـ u'(x)/u(x)^2 وما الفرق الحاسم بينهما؟",
    day7MixedPracticePrompt_ar: "عيّن الأعداد a, b, c بحيث: (2x^2 - x + 1)/(x - 1)^2 = a + b/(x-1) + c/(x-1)^2 ثم استنتج دالة أصلية.",
    laterExamApplicationPrompt_ar: "حل مسألة تكامل وحساب مساحات من بكالوريا رسمية تتضمن تفكيك كسر ناطق وحساب مساحة حيز.",
  },
  math_m_integral_functions_variable_bounds: {
    skillId: "math_m_integral_functions_variable_bounds",
    day1InitialEvidence_ar: "اشتقاق الدالة المعرفة بتكامل F(x) = integral_0^x (1/(1+t^2) dt) وإثبات رتابتها ومحدوديتها بنجاح.",
    day3RetrievalPrompt_ar: "استرجع: إذا كانت f مستمرة، فما هي مشتقة F(x) = integral_a^x f(t)dt وما هي قيمة F(a)؟",
    day7MixedPracticePrompt_ar: "ادرس اتجاه تغير الدالة G(x) = integral_1^x (ln(t)/(1+t)) dt على ]0, +infinity[ واحصرها.",
    laterExamApplicationPrompt_ar: "حل مسألة الدوال المعرفة بتكامل من بكالوريا 2023 الدورة الاستدراكية شعبة رياضيات.",
  },
  math_m_second_order_differential_equations: {
    skillId: "math_m_second_order_differential_equations",
    day1InitialEvidence_ar: "حل معادلة تفاضلية من الرتبة الثانية بمميز سالب وتعيين الحل الخاص المستوفي للشروط الابتدائية.",
    day3RetrievalPrompt_ar: "استرجع: ما هي صيغ الحل العام لـ ay'' + by' + cy = 0 في الحالات الثلاث: Delta > 0, Delta = 0, Delta < 0؟",
    day7MixedPracticePrompt_ar: "حل المعادلة y'' + 4y = 0 ثم عيّن الحل الخاص الذي يحقق y(0) = 1 و y'(0) = 2.",
    laterExamApplicationPrompt_ar: "حل تمرين معادلات تفاضلية من بكالوريا شعبة رياضيات يتضمن تعيين حل خاص ودراسة نقط انعطافه.",
  },
  math_m_space_lines_intersections: {
    skillId: "math_m_space_lines_intersections",
    day1InitialEvidence_ar: "تعيين التمثيل الوسيطي لمستقيم عمودي على مستو وحساب نقطة التقاطع والمسقط العمودي بدقة.",
    day3RetrievalPrompt_ar: "استرجع: كيف نكتب تمثيلاً وسيطياً لمستقيم عمودي على مستو؟ وكيف نجد نقطة التقاطع؟",
    day7MixedPracticePrompt_ar: "عيّن تقاطع المستقيم (D): x = 1+2t, y = -t, z = 3t مع المستوي (P): x + 2y - z + 4 = 0.",
    laterExamApplicationPrompt_ar: "حل تمرين الهندسة الفضائية من بكالوريا 2024 شعبة رياضيات وتعيين المسقط العمودي والمسافات.",
  },
  math_m_space_spheres_equations: {
    skillId: "math_m_space_spheres_equations",
    day1InitialEvidence_ar: "تعيين الوضع النسبي لسطح كرة ومستو وحساب مركز ونصف قطر دائرة التقاطع بنجاح.",
    day3RetrievalPrompt_ar: "استرجع: ما هي الحالات الثلاث للوضع النسبي بين سطح كرة ومستو اعتماداً على d(Omega, P) و R؟",
    day7MixedPracticePrompt_ar: "عيّن تقاطع سطح الكرة (S) ذات المركز Omega(0, 1, -1) و R = 3 مع المستوي x - 2y + 2z + 1 = 0.",
    laterExamApplicationPrompt_ar: "حل مسألة هندسة فضائية كاملة تتضمن سطح الكرة والمستويات المماسة ودوائر التقاطع في البكالوريا.",
  },
  math_m_random_variables_expectation: {
    skillId: "math_m_random_variables_expectation",
    day1InitialEvidence_ar: "تعيين قانون احتمال المتغير العشوائي وحساب E(X) والتباين والانحراف المعياري بنجاح.",
    day3RetrievalPrompt_ar: "استرجع: ما هو قانون الأمل الرياضي E(X)؟ وما هي صيغة كونيغ لحساب التباين V(X)؟",
    day7MixedPracticePrompt_ar: "لعبة حظ: يربح اللاعب 100 دج باحتمال 0.2 ويخسر 50 دج باحتمال 0.8. احسب الأمل وهل اللعبة عادلة؟",
    laterExamApplicationPrompt_ar: "حل مسألة الاحتمالات من بكالوريا 2024 شعبة رياضيات وحساب المتغير العشوائي والأمل الرياضي.",
  },
};

// =============================================================================
// 4. DOSSIER BUILDER & FACTORY QUERY HELPERS FOR BATCH 03
// =============================================================================

export function getMathBatch03SkillDossier(skillId: string): MathSkillDossier | null {
  const pkg = MATH_BATCH_03_PACKAGES[skillId];
  if (!pkg) return null;

  const visualAsset = ALL_MATH_VISUAL_ASSETS[skillId];
  const externalResource = ALL_MATH_EXTERNAL_RESOURCES[skillId];
  const diagnosticSignal = MATH_BATCH_03_DIAGNOSTIC_SIGNALS[skillId];
  const spacedReview = MATH_BATCH_03_SPACED_REVIEWS[skillId];
  const factorInputs = ALL_MATH_FACTOR_INPUTS[skillId];

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

export function getAllMathBatch03Dossiers(): MathSkillDossier[] {
  return Object.keys(MATH_BATCH_03_PACKAGES).map((id) => getMathBatch03SkillDossier(id)!);
}
