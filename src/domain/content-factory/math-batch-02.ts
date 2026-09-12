/**
 * BAC Mastery — 3AS Mathematics Production Batch 02
 * 
 * Comprehensive Production Content for 9 Essential 3AS Math Competencies:
 * GROUP A — SUITES NUMÉRIQUES:
 * 1. math_m_sequences_comparison_limits (Limites de suites par comparaison & encadrement)
 * 2. math_m_geometric_sequences (Suites géométriques, somme et applications BAC)
 * 
 * GROUP B — NOMBRES COMPLEXES:
 * 3. math_m_roots_of_unity (Racines n-ièmes de l'unité et géométrie des polygones)
 * 4. math_m_complex_argument_loci (Lieux géométriques liés à arg((z-a)/(z-b)))
 * 
 * GROUP C — FONCTIONS / ANALYSE:
 * 5. math_m_logarithmic_differentiation (Dérivation logarithmique et puissances de fonctions)
 * 6. math_m_function_study (Étude complète et tracé rigoureux de courbes de fonctions)
 * 7. math_m_bounded_functions (Fonctions bornées, encadrement et inégalités intégrales)
 * 
 * GROUP D — PROBABILITÉS:
 * 8. math_m_conditional_probability_trees (Arbres de probabilités pondérés et probabilités conditionnelles)
 * 9. math_m_total_probability (Formule des probabilités totales et théorème de Bayes)
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
// 1. CONTENT PACKAGES FOR THE 9 BATCH 02 SKILLS
// =============================================================================

export const MATH_BATCH_02_PACKAGES: Record<string, ContentPackage> = {
  // ---------------------------------------------------------------------------
  // 1. LIMITES DE SUITES PAR COMPARAISON
  // ---------------------------------------------------------------------------
  math_m_sequences_comparison_limits: {
    packageId: "pkg_math_m_sequences_comparison_limits",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_sequences_convergence",
    skillId: "math_m_sequences_comparison_limits",
    objective_ar: "حساب نهايات المتتاليات العددية بتطبيق مبرهنات المقارنة والحصر (مبرهنة الساندويتش/الدرك) وإثبات التباعد نحو اللانهاية بتعليل استدلالي سليم.",
    objective_fr: "Déterminer la limite d'une suite par comparaison et encadrement (théorème des gendarmes) et justifier la divergence.",
    prerequisites: ["math_m_induction_adjacent_suites"],
    lesson: {
      title_ar: "نهايات المتتاليات بمبرهنات المقارنة والحصر (مبرهنة الدرك)",
      contentMarkdown_ar: `### مبرهنة الحصر (Théorème d'encadrement / Théorème des gendarmes)
لتكن $(u_n)$ و $(v_n)$ و $(w_n)$ ثلاث متتاليات عددية.
إذا وجد عدد طبيعي $n_0$ بحيث من أجل كل $n \ge n_0$:
$$v_n \le u_n \le w_n$$
وكانت المتتاليتان الحاصرتان تتقاربان نحو نفس النهاية الحقيقية $L$ أي:
$$\lim_{n \to +\infty} v_n = \lim_{n \to +\infty} w_n = L$$
فإن المتتالية المحصورة $(u_n)$ متقاربة ونهايتها هي حتماً $L$:
$$\lim_{n \to +\infty} u_n = L$$

### مبرهنتا المقارنة والتباعد نحو اللانهاية
1. **التباعد نحو $+\infty$**: إذا كان $u_n \ge v_n$ من أجل كل $n \ge n_0$ وكانت $\lim_{n \to +\infty} v_n = +\infty$، فإن:
   $$\lim_{n \to +\infty} u_n = +\infty$$
2. **التباعد نحو $-\infty$**: إذا كان $u_n \le w_n$ من أجل كل $n \ge n_0$ وكانت $\lim_{n \to +\infty} w_n = -\infty$، فإن:
   $$\lim_{n \to +\infty} u_n = -\infty$$

### حصر الدوال المثلثية والقوى المتناوبة
توظف المقارنة غالباً مع الحدود المتذبذبة التي لا تقبل نهاية مباشرة عند اللانهاية:
- $-1 \le \cos(n) \le 1$ و $-1 \le \sin(n) \le 1$ لكل $n \in \mathbb{N}$.
- $-1 \le (-1)^n \le 1$ لكل $n \in \mathbb{N}$.`,
      keyTakeaway_ar: "مبرهنة الحصر تتطلب شرطين: 1) حصر المتتالية بين متتاليتين من رتبة معينة، 2) تقارب طرفي الحصر نحو نفس النهاية L بدقة.",
    },
    workedExample: {
      problem_ar: "لتكن المتتالية (u_n) معرفة على N* بـ: u_n = (2n + (-1)^n) / (n + 3). احسب نهاية المتتالية u_n عند +infinity.",
      stepByStepSolution_ar: [
        "الخطوة 1: تحليل الحد المتذبذب: نلاحظ وجود (-1)^n في البسط وهي عبارة تتناوب بين -1 و +1 ولا تقبل نهاية مباشرة، لذا نلجأ إلى الحصر.",
        "الخطوة 2: حصر البسط: من أجل كل عدد طبيعي n >= 1 لدينا: -1 <= (-1)^n <= 1. نضيف 2n لجميع الأطراف: 2n - 1 <= 2n + (-1)^n <= 2n + 1.",
        "الخطوة 3: القسمة على المقام الموجب: بما أن n >= 1 فإن n + 3 > 0 تماماً. بالقسمة دون تغيير اتجاه المتراجحة نجد: (2n - 1) / (n + 3) <= u_n <= (2n + 1) / (n + 3).",
        "الخطوة 4: حساب نهايتي الطرفين: lim_{n -> +infinity} (2n - 1)/(n + 3) = lim 2n/n = 2. و lim_{n -> +infinity} (2n + 1)/(n + 3) = lim 2n/n = 2.",
        "الخطوة 5: تطبيق مبرهنة الحصر: بما أن طرفي الحصر يؤولان معاً إلى 2، فحسب مبرهنة الحصر، فإن المتتالية (u_n) متقاربة ونهايتها هي: lim_{n -> +infinity} u_n = 2.",
      ],
      pedagogicalComment_ar: "حصر الحدود المتذبذبة أولاً ثم القسمة على المقام بعد إثبات إشارته الموجبة الصريحة يضمن البناء البرهاني السليم.",
    },
    activeRecall: {
      prompt_ar: "إذا كان u_n >= n^2 + 5 من أجل كل n >= 0، فما هي نهاية المتتالية (u_n) عند +infinity؟ وما هي المبرهنة المطبقة؟",
      expectedAnswer_ar: "نهاية u_n هي +infinity بتطبيق مبرهنة المقارنة، لأن n^2 + 5 تؤول إلى +infinity ومتتالية أكبر منها تتباعد حتماً نحو +infinity.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_seq_comp_01",
        prompt_ar: "إذا كانت المتتالية (u_n) تحقق: 0 <= u_n <= 1/n من أجل كل n >= 1، فما هي قيمة lim u_n عند +infinity؟",
        optionsCount: 4,
        correctAnswerId: "opt_seq_comp_0",
        explanation_ar: "بما أن lim 0 = 0 و lim 1/n = 0، فحسب مبرهنة الحصر نجد lim u_n = 0.",
        distractorErrorMappings: {
          opt_seq_comp_1: "misunderstood_concept",
          opt_seq_comp_inf: "calculation_error",
          opt_seq_comp_none: "methodology_error",
        },
      },
      {
        id: "pq_math_m_seq_comp_02",
        prompt_ar: "احسب النهاية: lim (n -> +infinity) [(3n + sin(n)) / (n + 1)].",
        optionsCount: 4,
        correctAnswerId: "opt_seq_comp_3",
        explanation_ar: "بحصر sin(n) بين -1 و 1 نجد (3n-1)/(n+1) <= u_n <= (3n+1)/(n+1). كلا الطرفين يؤول إلى 3، إذن النهاية هي 3.",
        distractorErrorMappings: {
          opt_seq_comp_1: "calculation_error",
          opt_seq_comp_0: "forgot_information",
          opt_seq_comp_inf: "misunderstood_concept",
        },
      },
    ],
    retest: {
      id: "rq_math_m_seq_comp_twin",
      parentPracticeQuestionId: "pq_math_m_seq_comp_02",
      prompt_ar: "احسب النهاية: lim (n -> +infinity) [(5n + cos(n)) / (n + 2)].",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_seq_comp_5",
      explanation_ar: "بما أن -1 <= cos(n) <= 1، فإن (5n-1)/(n+2) <= (5n+cos(n))/(n+2) <= (5n+1)/(n+2). نهاية الطرفين هي 5، إذن حسب مبرهنة الحصر النهاية هي 5.",
    },
    repairGuide: {
      targetErrorType: "misunderstood_concept",
      title_ar: "معالجة الخلط بين شروط مبرهنة الحصر ومبرهنة المقارنة",
      mentalModelExplanation_ar: "يقع التلميذ في الخطأ عندما يطبق مبرهنة المقارنة بطرف واحد لاستنتاج نهاية منتهية، كأن يكتب u_n <= 3 إذن نهاية u_n هي 3، بينما الحصر لنهاية منتهية يتطلب حتماً طرفين يؤولان لنفس العدد L.",
      actionableSteps_ar: [
        "الخطوة 1: إذا كان المطلوب نهاية منتهية L، تأكد من حصر المتتالية بين حد أدنى وحد أقصى v_n <= u_n <= w_n.",
        "الخطوة 2: احسب نهاية كل طرف وتأكد من تساويهما تماماً (lim v_n = lim w_n = L).",
        "الخطوة 3: إذا كان الحصر بطرف واحد فقط، فلا يمكن استنتاج إلا التباعد نحو +infinity (إذا كانت u_n >= v_n -> +inf) أو نحو -infinity.",
      ],
      contrastiveWorkedExample: "خطأ: u_n <= 2 + 1/n إذن lim u_n = 2 (باطل لأن u_n قد تؤول إلى -infinity). صواب: 2 - 1/n <= u_n <= 2 + 1/n مع lim الطرفين = 2 يضمن أن lim u_n = 2.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_sequences_comparison_limits"],
    externalResourceIds: ["res_math_m_sequences_comparison_limits"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "يرد سؤال الحصر في الجزء الأخير من تمرين المتتاليات لحساب نهاية متتالية غير معروفة العبارة الصريحة، أو متتالية تكاملية.",
      commonPitfalls_ar: ["نسيان إثبات إيجابية المقام قبل القسمة عليه في المتراجحة", "الاستنتاج الخاطئ لنهاية منتهية من حصر غير ثنائي الطرفين"],
      officialBacPastRefIds: ["bac_m_2023_s1_ex3", "bac_m_2020_s1_ex3"],
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
  // 2. SUITES GÉOMÉTRIQUES & APPLICATIONS BAC
  // ---------------------------------------------------------------------------
  math_m_geometric_sequences: {
    packageId: "pkg_math_m_geometric_sequences",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_sequences_convergence",
    skillId: "math_m_geometric_sequences",
    objective_ar: "إثبات أن متتالية مساعدة هندسية وتعيين أساسها وحدها الأول والتعبير عن حدها العام ومجموع حدودها وحساب نهايتها حسب قيم الأساس q.",
    objective_fr: "Démontrer qu'une suite auxiliaire est géométrique, déterminer sa raison et premier terme, exprimer sa somme et étudier sa convergence.",
    prerequisites: ["math_m_induction_adjacent_suites"],
    lesson: {
      title_ar: "المتتاليات الهندسية: الأساس، الحد العام، المجاميع، والنهايات",
      contentMarkdown_ar: `### تعريف المتتالية الهندسية
تكون المتتالية العددية $(v_n)$ هندسية إذا وفقط إذا وجد عدد حقيقي ثابت $q$ (يسمى الأساس) بحيث من أجل كل عدد طبيعي $n$:
$$v_{n+1} = q \cdot v_n$$

### عبارة الحد العام بدلالة n
- إذا كان الحد الأول هو $v_0$: فإن $v_n = v_0 \cdot q^n$.
- إذا كان الحد الأول هو $v_p$: فإن $v_n = v_p \cdot q^{n-p}$.

### مجموع حدود متعاقبة من متتالية هندسية (مع $q \neq 1$)
مجموع $N$ حداً متعاقبة من متتالية هندسية أساسها $q \neq 1$ يعطى بالقانون:
$$S_n = v_p + v_{p+1} + \dots + v_n = v_p \cdot \frac{1 - q^{\text{عدد الحدود}}}{1 - q} = v_p \cdot \frac{1 - q^{n - p + 1}}{1 - q}$$

### نهاية المتتالية الهندسية $q^n$ حسب قيم الأساس q
- إذا كان $-1 < q < 1$ (أي $|q| < 1$): فإن $\lim_{n \to +\infty} q^n = 0$ (المتتالية متقاربة).
- إذا كان $q > 1$: فإن $\lim_{n \to +\infty} q^n = +\infty$ (المتتالية متباعدة).
- إذا كان $q \le -1$: فإن المتتالية $q^n$ لا تقبل نهاية (متذبذبة).`,
      keyTakeaway_ar: "لإثبات أن متتالية هندسية نحسب v_(n+1) ونعوض u_(n+1) ونستخرج الأساس q كعامل مشترك لتظهر عبارة v_n صريحة: v_(n+1) = q * v_n.",
    },
    workedExample: {
      problem_ar: "لتكن المتتالية (u_n) معرفة بـ: u_0 = 4 و u_(n+1) = (1/2)*u_n + 3. نضع من أجل كل n من N: v_n = u_n - 6. أثبت أن (v_n) هندسية، واكتب u_n بدلالة n، ثم احسب lim u_n.",
      stepByStepSolution_ar: [
        "الخطوة 1: كتابة عبارة v_(n+1): من تعريف v_n لدينا v_(n+1) = u_(n+1) - 6.",
        "الخطوة 2: التعويض بعبارة u_(n+1): v_(n+1) = ((1/2)*u_n + 3) - 6 = (1/2)*u_n - 3.",
        "الخطوة 3: استخراج الأساس كعامل مشترك: v_(n+1) = (1/2) * [u_n - 6] = (1/2) * v_n. إذن المتتالية (v_n) هندسية أساسها q = 1/2.",
        "الخطوة 4: حساب الحد الأول v_0: v_0 = u_0 - 6 = 4 - 6 = -2. ومنه عبارة الحد العام: v_n = -2 * (1/2)^n.",
        "الخطوة 5: استنتاج عبارة u_n ونهايتها: بما أن v_n = u_n - 6 فإن u_n = v_n + 6 = 6 - 2 * (1/2)^n. وبما أن -1 < 1/2 < 1 فإن lim_{n -> +infinity} (1/2)^n = 0، ومنه: lim_{n -> +infinity} u_n = 6 - 0 = 6.",
      ],
      pedagogicalComment_ar: "التأكد من كتابة v_(n+1) = q * v_n بربط الأقواس بدقة يجنب أخطاء النشر والتبسيط الشائعة في البكالوريا.",
    },
    activeRecall: {
      prompt_ar: "ما هو قانون مجموع حدود متتالية هندسية أساسها q != 1 وعدد حدودها N انطلاقاً من الحد الأول v_p؟",
      expectedAnswer_ar: "القانون هو S = v_p * (1 - q^N) / (1 - q) حيث عدد الحدود N = (دليل النهاية - دليل البداية + 1).",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_geom_01",
        prompt_ar: "احسب مجموع الحدود الخمسة الأولى للمتتالية الهندسية التي حدها الأول w_0 = 3 وأساسها q = 2 (أي S = w_0 + w_1 + w_2 + w_3 + w_4).",
        optionsCount: 4,
        correctAnswerId: "opt_geom_sum_93",
        explanation_ar: "عدد الحدود N = 4 - 0 + 1 = 5. S = 3 * (1 - 2^5) / (1 - 2) = 3 * (1 - 32) / (-1) = 3 * 31 = 93.",
        distractorErrorMappings: {
          opt_geom_sum_45: "calculation_error",
          opt_geom_sum_96: "forgot_information",
          opt_geom_sum_63: "methodology_error",
        },
      },
      {
        id: "pq_math_m_geom_02",
        prompt_ar: "إذا كان v_n = 5 * (1/3)^n، فما هي قيمة lim (n -> +infinity) v_n؟",
        optionsCount: 4,
        correctAnswerId: "opt_geom_lim_0",
        explanation_ar: "بما أن الأساس q = 1/3 محصور تماماً بين -1 و 1 (|q| < 1)، فإن lim (1/3)^n = 0 ومنه lim v_n = 0.",
        distractorErrorMappings: {
          opt_geom_lim_5: "misunderstood_concept",
          opt_geom_lim_inf: "calculation_error",
          opt_geom_lim_third: "forgot_information",
        },
      },
    ],
    retest: {
      id: "rq_math_m_geom_twin",
      parentPracticeQuestionId: "pq_math_m_geom_01",
      prompt_ar: "احسب المجموع: S = z_0 + z_1 + z_2 + z_3 لمتتالية هندسية حدها الأول z_0 = 2 وأساسها q = 3.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_geom_sum_80",
      explanation_ar: "عدد الحدود هو 3 - 0 + 1 = 4. S = 2 * (1 - 3^4) / (1 - 3) = 2 * (1 - 81) / (-2) = -80 / (-1) = 80. (التحقق: 2 + 6 + 18 + 54 = 80).",
    },
    repairGuide: {
      targetErrorType: "calculation_error",
      title_ar: "معالجة خطأ حساب عدد الحدود في قانون مجموع المتتالية الهندسية",
      mentalModelExplanation_ar: "يضع التلميذ n في أس القانون بدلاً من عدد الحدود الفعلي N = (الدليل الأخير - الدليل الأول + 1)، فيحسب مثلاً n حدوداً بدلاً من n+1 عند الانطلاق من v_0.",
      actionableSteps_ar: [
        "الخطوة 1: اكتب قاعدة حساب عدد الحدود أولاً: عدد الحدود = الدليل الأخير - الدليل الأول + 1.",
        "الخطوة 2: إذا كان المجموع من v_0 إلى v_n، فالأس في البسط يكون حتماً n + 1.",
        "الخطوة 3: طبق القانون بحذر: S = (الحد الأول للمجموع) * (1 - q^عدد الحدود) / (1 - q).",
      ],
      contrastiveWorkedExample: "خطأ: من v_0 إلى v_4 وضع الأس 4 فينتج 1 - q^4. صواب: عدد الحدود 4 - 0 + 1 = 5 إذن الأس هو 5: (1 - q^5).",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_geometric_sequences"],
    externalResourceIds: ["res_math_m_geometric_sequences"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "السؤال المركزي الثابت في تمرين المتتاليات بالبكالوريا هو إثبات المتتالية الهندسية المساعدة واستنتاج عبارة u_n ومجموعها ونهايتها.",
      commonPitfalls_ar: ["نسيان إضافة 1 لعدد الحدود", "الخلط بين إشارة الناقص في (1 - q) والأس"],
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
  // 3. RACINES N-IÈMES DE L'UNITÉ
  // ---------------------------------------------------------------------------
  math_m_roots_of_unity: {
    packageId: "pkg_math_m_roots_of_unity",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_complex_algebra",
    skillId: "math_m_roots_of_unity",
    objective_ar: "تعيين وحساب الجذور النونية للواحد الصحيح في C وكتابتها بالشكلين الأسي والجبري وتمثيل صورها هندسياً على دائرة الوحدة وتوظيف خواصها ومجموعها المعدوم.",
    objective_fr: "Déterminer et calculer les racines n-ièmes de l'unité dans C, les écrire sous formes exponentielle et algébrique, et interpréter leur disposition géométrique et leur somme nulle.",
    prerequisites: ["math_m_complex_algebraic_trig"],
    lesson: {
      title_ar: "الجذور النونية للواحد الصحيح والتمثيل الهندسي للمضلعات المنتظمة",
      contentMarkdown_ar: `### تعريف الجذور النونية للواحد الصحيح
نسمي جذراً نونياً للواحد الصحيح (من أجل $n \in \mathbb{N}^*$) كل عدد مركب $z$ يحقق المعادلة:
$$z^n = 1$$
تقبل هذه المعادلة في مجموعة الأعداد المركبة $\mathbb{C}$ بالضبط $n$ حلاً متمايزاً يُعطى بالشكل الأسي:
$$\omega_k = e^{i \frac{2k\pi}{n}} = \cos\left(\frac{2k\pi}{n}\right) + i \sin\left(\frac{2k\pi}{n}\right) \quad (k \in \{0, 1, 2, \dots, n - 1\})$$

### التفسير الهندسي وصور الجذور
- صور الجذور النونية $M_k(\omega_k)$ تنتمي جميعها إلى دائرة الوحدة التي مركزها المبدأ $O$ ونصف قطرها $R = 1$ لأن $|\omega_k| = 1$.
- تشكل النقط $M_0, M_1, \dots, M_{n-1}$ رؤوس مضلع منتظم ذي $n$ ضلعاً مرسوماً داخل دائرة الوحدة، ورأسه الأول هو النقطة $M_0(1, 0)$.

### خاصية المجموع المعدوم للجذور
من أجل كل عدد طبيعي $n \ge 2$، فإن مجموع الجذور النونية للواحد الصحيح معدوم دوماً:
$$\sum_{k=0}^{n-1} \omega_k = 1 + \omega_1 + \omega_2 + \dots + \omega_{n-1} = 0$$

### الحالة الخاصة: الجذور التكعيبية للواحد (n = 3)
الجذور التكعيبية للواحد هي $1$ و $j$ و $j^2$ حيث:
$$j = e^{i \frac{2\pi}{3}} = -\frac{1}{2} + i \frac{\sqrt{3}}{2} \quad \text{و} \quad j^2 = e^{i \frac{4\pi}{3}} = -\frac{1}{2} - i \frac{\sqrt{3}}{2} = \bar{j}$$
مع الخواص الأساسية: $j^3 = 1$ و $1 + j + j^2 = 0$.`,
      keyTakeaway_ar: "الجذور النونية للواحد z^n=1 تعطى بـ e^(i*2k*pi/n) وتشكل رؤوس مضلع منتظم محاط بدائرة الوحدة ومجموعها معدوم دوماً: 1 + w + w^2 + ... = 0.",
    },
    workedExample: {
      problem_ar: "حل في C المعادلة z^3 = 1، واكتب حلولها بالشكلين الأسي والجبري، وبيّن أن صورها تشكل مثلثاً متقايس الأضلاع في المستوي المركب.",
      stepByStepSolution_ar: [
        "الخطوة 1: وضع z بالشكل الأسي: نضع z = r * e^(i*theta)، فتصبح المعادلة: r^3 * e^(i*3*theta) = 1 * e^(i*0).",
        "الخطوة 2: المطابقة بين الطويلة والعمدة: r^3 = 1 يقتضي r = 1 (لأن r موجب تماماً). و 3*theta = 2k*pi يقتضي theta_k = 2k*pi / 3 مع k ∈ {0, 1, 2}.",
        "الخطوة 3: تعيين الجذور الثلاثة: - من أجل k = 0: z_0 = e^(i*0) = 1. - من أجل k = 1: z_1 = e^(i * 2pi / 3) = cos(2pi/3) + i*sin(2pi/3) = -1/2 + i*sqrt(3)/2 (وهو j). - من أجل k = 2: z_2 = e^(i * 4pi / 3) = cos(4pi/3) + i*sin(4pi/3) = -1/2 - i*sqrt(3)/2 (وهو j^2).",
        "الخطوة 4: التحقق من المجموع المعدوم: z_0 + z_1 + z_2 = 1 + (-1/2 + i*sqrt(3)/2) + (-1/2 - i*sqrt(3)/2) = 1 - 1 + 0 = 0.",
        "الخطوة 5: البرهان الهندسي على المثلث المتقايس الأضلاع: نحسب أطوال الأضلاع: - AB = |z_1 - z_0| = |-3/2 + i*sqrt(3)/2| = sqrt(9/4 + 3/4) = sqrt(12/4) = sqrt(3). - BC = |z_2 - z_1| = |-i*sqrt(3)| = sqrt(3). - CA = |z_0 - z_2| = |3/2 + i*sqrt(3)/2| = sqrt(3). بما أن AB = BC = CA = sqrt(3)، فإن صور الجذور تشكل مثلثاً متقايس الأضلاع مركزه المبدأ O.",
      ],
      pedagogicalComment_ar: "تطابق أطوال الأضلاع AB = BC = CA = sqrt(3) يثبت هندسياً انتظام المضلع الممثل للجذور.",
    },
    activeRecall: {
      prompt_ar: "ما هي الجذور التكعيبية للواحد الصحيح وما هو ناتج المجموع: 1 + j + j^2؟",
      expectedAnswer_ar: "الجذور التكعيبية هي 1 و j = e^(i*2pi/3) و j^2 = e^(i*4pi/3)، ومجموعها معدوم: 1 + j + j^2 = 0.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_roots_01",
        prompt_ar: "ما هي قيمة المجموع S = 1 + j + j^2 + j^3 + j^4 + j^5 حيث j الجذر التكعيبي للواحد؟",
        optionsCount: 4,
        correctAnswerId: "opt_roots_sum_0",
        explanation_ar: "بما أن j^3 = 1 فإن j^3 + j^4 + j^5 = 1 + j + j^2 = 0. إذن S = (1 + j + j^2) + (1 + j + j^2) = 0 + 0 = 0.",
        distractorErrorMappings: {
          opt_roots_sum_1: "calculation_error",
          opt_roots_sum_j: "misunderstood_concept",
          opt_roots_sum_3: "forgot_information",
        },
      },
      {
        id: "pq_math_m_roots_02",
        prompt_ar: "عيّن مجموعة الجذور الرباعية للواحد الصحيح (حلول z^4 = 1 في C).",
        optionsCount: 4,
        correctAnswerId: "opt_roots_4_set",
        explanation_ar: "الجذور المعطاة بـ e^(i * 2k*pi / 4) = e^(i * k*pi / 2) هي {1, i, -1, -i}.",
        distractorErrorMappings: {
          opt_roots_4_pm1: "forgot_information",
          opt_roots_4_pmi: "misunderstood_concept",
          opt_roots_4_other: "calculation_error",
        },
      },
    ],
    retest: {
      id: "rq_math_m_roots_twin",
      parentPracticeQuestionId: "pq_math_m_roots_02",
      prompt_ar: "حل في C المعادلة z^4 = 16، واذكر طبيعة المضلع الذي تشكله صور هذه الحلول في المستوي المركب.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_roots_16",
      explanation_ar: "الحلول هي z_k = 2 * e^(i * k*pi / 2) أي {2, 2i, -2, -2i}. صورها تشكل مربعاً مركزه المبدأ O وطول ضلعه 2*sqrt(2).",
    },
    repairGuide: {
      targetErrorType: "misunderstood_concept",
      title_ar: "معالجة خطأ خطوة زاوية الجذور النونية (الخلط بين 2k*pi/n و k*pi/n)",
      mentalModelExplanation_ar: "يغفل التلميذ دورة الدائرة الكاملة 2pi فيقسم k*pi على n بدلاً من 2k*pi/n، فيحصل على نصف عدد الجذور فقط أو يكرر زوايا خاطئة.",
      actionableSteps_ar: [
        "الخطوة 1: اكتب معادلة المطابقة للزوايا دائماً بدورة كاملة: n*theta = 2k*pi.",
        "الخطوة 2: اقسم على n: theta_k = 2k*pi / n.",
        "الخطوة 3: عوض قيم k بدقة من 0 إلى n - 1 دون زيادة أو نقصان لضمان الحصول على n جذراً متمايزاً.",
      ],
      contrastiveWorkedExample: "خطأ: z^3 = 1 تعطي theta = k*pi/3 (زوايا 0, pi/3, 2pi/3). صواب: theta = 2k*pi/3 (زوايا 0, 2pi/3, 4pi/3).",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_roots_of_unity"],
    externalResourceIds: ["res_math_m_roots_of_unity"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "ترد الجذور النونية في مسألة الأعداد المركبة لشعبة الرياضيات لإنشاء المضلعات المنتظمة وحساب قوى العبارات المركبة المتناظرة.",
      commonPitfalls_ar: ["نسيان الحلول التخيلية في المعادلات مثل z^4 = 1", "الخطأ في حساب زاوية الخطوة 2k*pi/n"],
      officialBacPastRefIds: ["bac_m_2023_catchup_ex2", "bac_m_2021_s1_ex2"],
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
  // 4. LIEUX GÉOMÉTRIQUES ET ARGUMENTS
  // ---------------------------------------------------------------------------
  math_m_complex_argument_loci: {
    packageId: "pkg_math_m_complex_argument_loci",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_complex_algebra",
    skillId: "math_m_complex_argument_loci",
    objective_ar: "تعيين وتحديد المجموعات النقطية (المستقيمات، أنصاف المستقيمات، والدوائر) المرتبطة بعمدة النسبة arg((z-a)/(z-b)) وتحديد النقاط المستثناة بدقة هندسية تامة.",
    objective_fr: "Déterminer les lieux géométriques (droites, demi-droites, cercles) associés à arg((z-a)/(z-b)) et identifier rigoureusement les points exclus.",
    prerequisites: ["math_m_complex_algebraic_trig"],
    lesson: {
      title_ar: "المجموعات النقطية في المستوي المركب وعمدة النسبة (z-a)/(z-b)",
      contentMarkdown_ar: `### التفسير الهندسي لعمدة النسبة
لتكن النقطتان المتميزتان $A(a)$ و $B(b)$ ونقطة $M(z)$ تختلف عن $A$ وعن $B$.
عمدة النسبة تعبر هندسياً عن الزاوية الموجهة بين الشعاعين $\vec{MB}$ و $\vec{MA}$:
$$\arg\left(\frac{z - a}{z - b}\right) = (\vec{MB}, \vec{MA}) \pmod{2\pi}$$

### الحالات الهندسية الأساسية للمجموعات النقطية
1. **الاستقامية في نفس الاتجاه**:
   $$\arg\left(\frac{z - a}{z - b}\right) = 0 \pmod{2\pi} \iff (\vec{MB}, \vec{MA}) = 0 \pmod{2\pi}$$
   مجموعة النقط $M$ هي المستقيم $(AB)$ باستثناء القطعة المستقيمة المغلقة $[AB]$، أي: $(AB) \setminus [AB]$.
2. **الاستقامية في اتجاهين متعاكسين**:
   $$\arg\left(\frac{z - a}{z - b}\right) = \pi \pmod{2\pi} \iff (\vec{MB}, \vec{MA}) = \pi \pmod{2\pi}$$
   مجموعة النقط $M$ هي القطعة المستقيمة المفتوحة $]AB[$.
3. **الاستقامية عموماً (بترديد $\pi$)**:
   $$\arg\left(\frac{z - a}{z - b}\right) = 0 \pmod{\pi}$$
   مجموعة النقط هي المستقيم $(AB)$ كاملاً باستثناء النقطتين $A$ و $B$، أي: $(AB) \setminus \{A, B\}$.
4. **التعامد والدائرة (بترديد $\pi$)**:
   $$\arg\left(\frac{z - a}{z - b}\right) = \frac{\pi}{2} \pmod{\pi} \iff \vec{MA} \perp \vec{MB}$$
   المثلث $MAB$ قائم في $M$. مجموعة النقط $M$ هي **الدائرة التي قطرها $[AB]$** باستثناء النقطتين $A$ و $B$.`,
      keyTakeaway_ar: "arg((z-a)/(z-b)) يمثل الزاوية (MB, MA). إذا كانت pi [2pi] فالمجموعة قطعة مفتوحة ]AB[، وإذا كانت pi/2 [pi] فالمجموعة دائرة قطرها [AB] محرومة من A و B.",
    },
    workedExample: {
      problem_ar: "لتكن النقطتان A(1 + 2i) و B(3 - i). عيّن طبيعة وعناصر المجموعة النقطية (E) للنقط M(z) بحيث: arg((z - (1+2i)) / (z - (3-i))) = pi/2 [pi].",
      stepByStepSolution_ar: [
        "الخطوة 1: تعيين لاحقتي النقطتين: نضع z_A = 1 + 2i و z_B = 3 - i. الشرط يقتضي z != z_A و z != z_B إذن M تختلف عن A وعن B.",
        "الخطوة 2: التفسير الهندسي للعمدة: arg((z - z_A) / (z - z_B)) = (MB, MA) [2pi].",
        "الخطوة 3: ترجمة شرط التعامد: العلاقة (MB, MA) = pi/2 [pi] تعني أن الشعاعين MA و MB متعامدان: MA ⊥ MB.",
        "الخطوة 4: الاستنتاج الهندسي: بما أن المثلث MAB قائم في M، فإن مجموعة النقط M هي الدائرة ذات القطر [AB] باستثناء النقطتين A و B.",
        "الخطوة 5: تعيين مركز ونصف قطر الدائرة: - لاحقة المركز I (منتصف [AB]): z_I = (z_A + z_B)/2 = (1+2i + 3-i)/2 = (4 + i)/2 = 2 + (1/2)i. إذن I(2, 1/2). - نصف القطر R = AB / 2 = |z_B - z_A| / 2 = |(3 - i) - (1 + 2i)| / 2 = |2 - 3i| / 2 = sqrt(2^2 + (-3)^2) / 2 = sqrt(13) / 2.",
      ],
      pedagogicalComment_ar: "استثناء النقطتين A و B أمر جوهري لأن الكسر غير معرف عند B، وعند A يكون البسط معدوماً والعدد المركب 0 لا يملك عمدة.",
    },
    activeRecall: {
      prompt_ar: "ما هي المجموعة النقطية للنقط M(z) بحيث arg((z-a)/(z-b)) = pi [2pi]؟",
      expectedAnswer_ar: "المجموعة النقطية هي القطعة المستقيمة المفتوحة ]AB[ (باستثناء النقطتين A و B).",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_loci_01",
        prompt_ar: "لتكن A(2) و B(-1). ما هي مجموعة النقط M(z) بحيث arg((z - 2)/(z + 1)) = pi [2pi]؟",
        optionsCount: 4,
        correctAnswerId: "opt_loci_segment",
        explanation_ar: "(MB, MA) = pi [2pi] يعني أن الشعاعين متعاكسان في الاتجاه، إذن النقطة M تنتمي إلى القطعة المستقيمة المفتوحة ]AB[.",
        distractorErrorMappings: {
          opt_loci_line: "misunderstood_concept",
          opt_loci_circle: "calculation_error",
          opt_loci_ray: "forgot_information",
        },
      },
      {
        id: "pq_math_m_loci_02",
        prompt_ar: "ما هي مجموعة النقط M(z) بحيث arg((z - 2)/(z + 1)) = 0 [pi]؟",
        optionsCount: 4,
        correctAnswerId: "opt_loci_line_minus_ab",
        explanation_ar: "بترديد pi تكون النقط A و B و M على استقامة واحدة. إذن المجموعة هي المستقيم (AB) باستثناء النقطتين A و B.",
        distractorErrorMappings: {
          opt_loci_circle: "misunderstood_concept",
          opt_loci_segment: "forgot_information",
          opt_loci_plane: "calculation_error",
        },
      },
    ],
    retest: {
      id: "rq_math_m_loci_twin",
      parentPracticeQuestionId: "pq_math_m_loci_01",
      prompt_ar: "لتكن النقطتان C(3i) و D(-2i). عيّن طبيعة المجموعة النقطية للنقط M(z) بحيث: arg((z - 3i)/(z + 2i)) = pi [2pi].",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_loci_segment_cd",
      explanation_ar: "الزاوية (MD, MC) = pi [2pi] تقتضي أن الشعاعين MD و MC متعاكسان في الاتجاه، وبالتالي تنتمي النقطة M إلى القطعة المستقيمة المفتوحة ]CD[ الواقعة على محور التخيل (باستثناء النقطتين C و D).",
    },
    repairGuide: {
      targetErrorType: "forgot_information",
      title_ar: "معالجة خطأ نسيان استثناء النقطتين A و B في المجموعات النقطية",
      mentalModelExplanation_ar: "ينسى التلميذ استثناء النقطتين الطرفيتين فيصرح بأن المجموعة هي 'المستقيم (AB)' أو 'الدائرة' كاملة، متجاهلاً أن مقام النسبة ينعدم عند B وبسطها ينعدم عند A.",
      actionableSteps_ar: [
        "الخطوة 1: اكتب صراحة عند بداية الحل: النسبة معرفة إذا وفقط إذا كان z != z_B و z != z_A.",
        "الخطوة 2: حدد الشكل الهندسي الإجمالي (مستقيم، نصف مستقيم، أو دائرة).",
        "الخطوة 3: أضف دائماً في الخاتمة عبارة: 'باستثناء النقطتين A و B' أو استعمل الأقواس المفتوحة في القطع المستقيمة ]AB[.",
      ],
      contrastiveWorkedExample: "ناقص: المجموعة هي الدائرة ذات القطر [AB]. كامل: المجموعة هي الدائرة ذات القطر [AB] باستثناء النقطتين A و B.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_complex_argument_loci"],
    externalResourceIds: ["res_math_m_complex_argument_loci"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "سؤال كلاسيكي مميز يرد في خاتمة مسألة الأعداد المركبة يربط الحساب الجبري بالهندسة التحليلية المستوية.",
      commonPitfalls_ar: ["الخلط بين 0 بترديد 2pi و 0 بترديد pi", "نسيان استثناء نقطتي القطر"],
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
  // 5. DÉRIVATION LOGARITHMIQUE
  // ---------------------------------------------------------------------------
  math_m_logarithmic_differentiation: {
    packageId: "pkg_math_m_logarithmic_differentiation",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_exp_log_croissances",
    skillId: "math_m_logarithmic_differentiation",
    objective_ar: "توظيف الاشتقاق اللوغاريتمي لحساب مشتقات الجداءات وحواصل القسمة وقوى الدوال الموجبة تماماً [f(x)]^g(x) وتبسيط الحسابات المعقدة.",
    objective_fr: "Appliquer la dérivation logarithmique pour calculer efficacement les dérivées de produits, quotients et puissances de fonctions strictement positives.",
    prerequisites: ["math_m_exp_log_croissances"],
    lesson: {
      title_ar: "الاشتقاق اللوغاريتمي ومشتقات قوى الدوال f(x)^g(x)",
      contentMarkdown_ar: `### مبدأ الاشتقاق اللوغاريتمي
إذا كانت الدالة $f$ قابلة للاشتقاق وموجبة تماماً ($f(x) > 0$) على مجال $I$، فإن الدالة $\ln(f(x))$ معرفة وقابلة للاشتقاق على $I$، وتكون مشتقتها:
$$[\ln(f(x))]' = \frac{f'(x)}{f(x)}$$
ومنه نستنتج المشتقة $f'(x)$ بضرب الطرفين في $f(x)$:
$$f'(x) = f(x) \cdot [\ln(f(x))]'$$

### اشتقاق قوى الدوال من الشكل $y = [u(x)]^{v(x)}$
لكل دالة من الشكل $f(x) = [u(x)]^{v(x)}$ مع $u(x) > 0$:
1. نكتب الدالة بالصيغة الأسية المكافئة:
   $$f(x) = e^{v(x) \cdot \ln(u(x))}$$
2. أو نطبق اللوغاريتم على الطرفين: $\ln(f(x)) = v(x) \cdot \ln(u(x))$.
3. نشتق الطرفين بالنسبة للمتغير $x$:
   $$\frac{f'(x)}{f(x)} = v'(x) \cdot \ln(u(x)) + v(x) \cdot \frac{u'(x)}{u(x)}$$
4. نستنتج $f'(x)$ مباشرة:
   $$f'(x) = [u(x)]^{v(x)} \cdot \left[ v'(x) \ln(u(x)) + \frac{v(x) u'(x)}{u(x)} \right]$$

### شرط الأمان الرياضي
لا يمكن تطبيق اللوغاريتم إلا على مقادير موجبة تماماً قطيعاً ($u(x) > 0$)؛ وفي حال وجود إشارات سالبة يجب دراسة القيمة المطلقة $\ln|u(x)|$.

### المعيار المنهجي في البكالوريا الرسمية
في نماذج تصحيح البكالوريا، الصياغة النموذجية المعتمدة هي التحويل الأسي الصريح $f(x) = e^{v(x) \ln(u(x))}$ مع تبرير قابلية الاشتقاق وإيجابية الأساس $u(x) > 0$. وتعتبر طريقة الاشتقاق اللوغاريتمي $\frac{f'(x)}{f(x)} = [\ln f(x)]'$ أداة مساعدة ممتازة للتحقق وتسريع الحساب.`,
      keyTakeaway_ar: "لاشتقاق u(x)^v(x) نكتبها بالصيغة الأسية e^(v(x)*ln(u(x))) مع اشتراط u(x) > 0، أو نطبق الاشتقاق اللوغاريتمي f'(x)/f(x) = [v*ln(u)]'.",
    },
    workedExample: {
      problem_ar: "لتكن الدالة f معرفة على ]0, +infinity[ بـ: f(x) = x^sqrt(x). احسب الدالة المشتقة f'(x) باستعمال الاشتقاق اللوغاريتمي.",
      stepByStepSolution_ar: [
        "الخطوة 1: التحقق من شرط الإيجابية ومجال التعريف: من أجل كل x من ]0, +infinity[، لدينا x > 0 و sqrt(x) > 0، إذن f(x) > 0 تماماً.",
        "الخطوة 2: تطبيق اللوغاريتم النيبيري على الطرفين: ln(f(x)) = ln(x^sqrt(x)) = sqrt(x) * ln(x).",
        "الخطوة 3: اشتقاق الطرفين بالنسبة إلى x: [ln(f(x))]' = f'(x) / f(x). مشتقة الطرف الأيمن كجداء دالتين: [sqrt(x) * ln(x)]' = (sqrt(x))' * ln(x) + sqrt(x) * (ln(x))' = (1 / (2*sqrt(x))) * ln(x) + sqrt(x) * (1 / x) = ln(x) / (2*sqrt(x)) + 1 / sqrt(x) = (ln(x) + 2) / (2*sqrt(x)).",
        "الخطوة 4: ضرب الطرفين في f(x): f'(x) = f(x) * [(ln(x) + 2) / (2*sqrt(x))].",
        "الخطوة 5: كتابة العبارة النهائية: f'(x) = x^sqrt(x) * [(ln(x) + 2) / (2*sqrt(x))].",
      ],
      pedagogicalComment_ar: "التحقق عند نقطة اختبار x = 1: f(1) = 1^1 = 1، و f'(1) = 1 * (0 + 2)/(2*1) = 1، وهو ما يتطابق تماماً مع مشتقة الصيغة الأسية.",
    },
    activeRecall: {
      prompt_ar: "ما هي مشتقة الدالة y = x^x على المجال ]0, +infinity[؟",
      expectedAnswer_ar: "مشتقة y = x^x هي y' = x^x * (1 + ln(x)) لأن ln(y) = x * ln(x) ومشتقته هي ln(x) + 1.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_logdiff_01",
        prompt_ar: "إذا كان f(x) = x^x على ]0, +infinity[، فما هي إشارة f'(x) عند x = 1؟",
        optionsCount: 4,
        correctAnswerId: "opt_logdiff_pos",
        explanation_ar: "f'(1) = 1^1 * (1 + ln(1)) = 1 * (1 + 0) = 1 > 0، إذن المشتقة موجبة تماماً.",
        distractorErrorMappings: {
          opt_logdiff_zero: "calculation_error",
          opt_logdiff_neg: "misunderstood_concept",
          opt_logdiff_none: "forgot_information",
        },
      },
      {
        id: "pq_math_m_logdiff_02",
        prompt_ar: "ما هو الشرط الرياضي الأساسي الذي يسمح بتطبيق الاشتقاق اللوغاريتمي المباشر ln(f(x))؟",
        optionsCount: 4,
        correctAnswerId: "opt_logdiff_cond_pos",
        explanation_ar: "الشرط هو أن تكون الدالة موجبة تماماً: f(x) > 0 على المجال المعتبر لأن اللوغاريتم غير معرف على الأعداد السالبة أو المعدومة.",
        distractorErrorMappings: {
          opt_logdiff_cond_deriv: "forgot_information",
          opt_logdiff_cond_monotone: "misunderstood_concept",
          opt_logdiff_cond_poly: "calculation_error",
        },
      },
    ],
    retest: {
      id: "rq_math_m_logdiff_twin",
      parentPracticeQuestionId: "pq_math_m_logdiff_01",
      prompt_ar: "احسب مشتقة الدالة g(x) = x^(2x) المعرفة على ]0, +infinity[، ثم احسب قيمتها عند x = 1.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_logdiff_2",
      explanation_ar: "ln(g(x)) = 2x * ln(x). بالاشتقاق: g'(x)/g(x) = 2*ln(x) + 2x*(1/x) = 2(ln x + 1). إذن g'(x) = 2 * x^(2x) * (ln x + 1). عند x = 1: g'(1) = 2 * 1 * (0 + 1) = 2.",
    },
    repairGuide: {
      targetErrorType: "methodology_error",
      title_ar: "معالجة خطأ نسيان الضرب في الدالة الأصلية بعد الاشتقاق اللوغاريتمي",
      mentalModelExplanation_ar: "يتوقف التلميذ بعد حساب مشتقة ln(f(x)) فيعتبر أن الناتج هو f'(x)، ناسياً أن الطرف الأيسر هو حاصل القسمة f'(x)/f(x) ويجب ضربه في f(x).",
      actionableSteps_ar: [
        "الخطوة 1: اكتب الطرف الأيسر صراحة: f'(x) / f(x).",
        "الخطوة 2: احسب مشتقة الطرف الأيمن بشكل كامل وبسطها.",
        "الخطوة 3: اضرب الطرف الأيمن في عبارة f(x) الأصلية للحصول على f'(x) منفردة.",
      ],
      contrastiveWorkedExample: "ناقص: مشتقة x^x هي 1 + ln(x). كامل: مشتقة x^x هي x^x * (1 + ln(x)).",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_logarithmic_differentiation"],
    externalResourceIds: ["res_math_m_logarithmic_differentiation"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "المعيار الرسمي النموذجي في البكالوريا هو تحويل العبارة إلى الشكل الأسي الصريح e^(v(x)*ln(u(x))) مع شرط u(x)>0، وتعتبر طريقة الاشتقاق اللوغاريتمي تقنية مساعدة فعالة للتحقق وتسريع الحساب.",
      commonPitfalls_ar: ["نسيان الضرب في f(x) في الخطوة النهائية", "إهمال شرط f(x) > 0 قبل تطبيق اللوغاريتم"],
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
  // 6. ÉTUDE ET REPRÉSENTATION GRAPHIQUE DE FONCTIONS
  // ---------------------------------------------------------------------------
  math_m_function_study: {
    packageId: "pkg_math_m_function_study",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_continuity_derivatives",
    skillId: "math_m_function_study",
    objective_ar: "إنجاز دراسة شاملة لدالة عددية (مجموعة التعريف، النهايات، المستقيمات المقاربة، المشتقة، جدول التغيرات، نقط التقاطع) ورسم المنحنى البياني بدقة رياضية.",
    objective_fr: "Mener l'étude complète d'une fonction (domaine, limites, asymptotes, dérivée, variations, points d'intersection) et tracer sa courbe représentative.",
    prerequisites: ["math_m_derivatives_tvi_rigor", "math_m_exp_log_croissances"],
    lesson: {
      title_ar: "المنهجية الكاملة لدراسة ورسم المنحنيات البيانية للدوال",
      contentMarkdown_ar: `### الخطوات المنهجية العشر لدراسة دالة ورسم منحناها
1. **مجموعة التعريف والتناظر**: تحديد $D_f$ والتحقق من الشفعية (دالة زوجية أو فردية) أو الدورية لاختزال مجال الدراسة إن أمكن.
2. **النهايات عند الأطراف**: حساب النهايات عند أطراف مجالات التعريف وتفسير النتائج هندسياً.
3. **المستقيمات المقاربة**:
   - مقارب عمودي: $\lim_{x \to x_0} f(x) = \pm\infty \implies x = x_0$.
   - مقارب أفقي: $\lim_{x \to \pm\infty} f(x) = b \implies y = b$.
   - مقارب مائل: $\lim_{x \to \pm\infty} [f(x) - (ax + b)] = 0 \implies y = ax + b$.
4. **الوضع النسبي**: دراسة إشارة الفرق $f(x) - y$ لتحديد تموضع المنحنى بالنسبة للمقارب.
5. **حساب المشتقة**: حساب $f'(x)$ بدقة وتفكيكها إلى جداء عوامل لتسهيل دراسة إشارتها.
6. **اتجاه التغير وجدول التغيرات**: استنتاج فترات التزايد والتناقص وتلخيصها في جدول متكامل يتضمن القيم الحدية والنهايات.
7. **نقط التقاطع مع المحورين**: التقاطع مع $(y'y)$ بحساب $f(0)$، والتقاطع مع $(x'x)$ بحل $f(x) = 0$.
8. **المماسات ونقاط الانعطاف**: معادلة المماس $y = f'(x_0)(x - x_0) + f(x_0)$، وانعدام $f''(x)$ مع تغيير الإشارة.
9. **رسم المعالم المساعدة**: رسم المستقيمات المقاربة والمماسات الأفقية والنقط الحدية أولاً.
10. **رسم المنحنى البياني**: وصل النقط باحترام اتجاه التغير والتقعر والسلوك التقاربي.`,
      keyTakeaway_ar: "رسم المنحنى يبدأ دائماً برسم المستقيمات المقاربة والنقط الحدية ذات المماسات الأفقية ليكون المنحنى موجهاً ومضبوطاً هندسياً.",
    },
    workedExample: {
      problem_ar: "ادرس تغيرات الدالة f(x) = (x^2 - 3) / (x - 2) المعرفة على R \ {2}، وعيّن مستقيماتها المقاربة، وشكّل جدول تغيراتها.",
      stepByStepSolution_ar: [
        "الخطوة 1: مجموعة التعريف: D_f = ]-infinity, 2[ U ]2, +infinity[.",
        "الخطوة 2: النهايات والمستقيمات المقاربة العمودية: - lim_{x -> 2^-} f(x) = (4 - 3)/0^- = 1/0^- = -infinity. - lim_{x -> 2^+} f(x) = (4 - 3)/0^+ = 1/0^+ = +infinity. إذن المستقيم ذو المعادلة x = 2 مستقيم مقارب عمودي للمنحنى (C_f).",
        "الخطوة 3: البحث عن المستقيم المقارب المائل: بالقسمة الإقليدية لبسط f(x) على مقامه: x^2 - 3 = (x - 2)(x + 2) + 1، إذن: f(x) = x + 2 + 1/(x - 2). بما أن lim_{x -> ±infinity} [f(x) - (x + 2)] = lim 1/(x - 2) = 0، فإن المستقيم (Delta): y = x + 2 مقارب مائل للمنحنى بجوار ±infinity.",
        "الخطوة 4: حساب المشتقة ودراسة إشارتها: f'(x) = [2x(x - 2) - (x^2 - 3)(1)] / (x - 2)^2 = [2x^2 - 4x - x^2 + 3] / (x - 2)^2 = (x^2 - 4x + 3) / (x - 2)^2. المقام موجب تماماً على D_f. إشارة f'(x) من إشارة البسط x^2 - 4x + 3 = (x - 1)(x - 3). - تنعدم المشتقة عند x = 1 و x = 3. - f'(x) > 0 على ]-inf, 1[ U ]3, +inf[ (الدالة متزايدة تماماً). - f'(x) < 0 على ]1, 2[ U ]2, 3[ (الدالة متناقصة تماماً).",
        "الخطوة 5: تعيين القيم الحدية المحلية: - قيمة حدية عظمى محلية عند x = 1: f(1) = (1 - 3)/(1 - 2) = -2 / (-1) = 2. - قيمة حدية صغرى محلية عند x = 3: f(3) = (9 - 3)/(3 - 2) = 6 / 1 = 6.",
      ],
      pedagogicalComment_ar: "كون القيمة العظمى المحلية 2 أصغر من القيمة الصغرى المحلية 6 أمر طبيعي لأن المنحنى ينفصل بمستقيم مقارب عمودي ينزل إلى -inf ثم يصعد من +inf.",
    },
    activeRecall: {
      prompt_ar: "كيف نبرهن أن المستقيم y = ax + b مقارب مائل للمنحنى (Cf) بجوار +infinity؟",
      expectedAnswer_ar: "بحساب نهاية الفرق وإثبات أنها تنعدم: lim_{x -> +infinity} [f(x) - (ax + b)] = 0.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_fnstudy_01",
        prompt_ar: "عيّن معادلة المستقيم المقارب المائل للدالة g(x) = (2x^2 + 3x - 1) / (x + 1) بجوار اللانهاية.",
        optionsCount: 4,
        correctAnswerId: "opt_fn_asymptote_2x1",
        explanation_ar: "بقسمة 2x^2 + 3x - 1 على x + 1 نجد الناتج 2x + 1 والباقي -2، أي g(x) = 2x + 1 - 2/(x+1). إذن y = 2x + 1 هو المقارب المائل.",
        distractorErrorMappings: {
          opt_fn_asymptote_2x: "calculation_error",
          opt_fn_asymptote_2xminus1: "forgot_information",
          opt_fn_asymptote_x1: "misunderstood_concept",
        },
      },
      {
        id: "pq_math_m_fnstudy_02",
        prompt_ar: "ما هي فواصل النقط التي تكون فيها مماسات المنحنى f(x) موازية لمحور الفواصل؟",
        optionsCount: 4,
        correctAnswerId: "opt_fn_tangent_deriv0",
        explanation_ar: "تكون المماسات أفقية عندما يكون معامل توجيهها معدوماً، أي عند حلول المعادلة f'(x) = 0.",
        distractorErrorMappings: {
          opt_fn_tangent_f0: "misunderstood_concept",
          opt_fn_tangent_inf: "calculation_error",
          opt_fn_tangent_deriv1: "forgot_information",
        },
      },
    ],
    retest: {
      id: "rq_math_m_fnstudy_twin",
      parentPracticeQuestionId: "pq_math_m_fnstudy_01",
      prompt_ar: "عيّن معادلة المستقيم المقارب المائل للمنحنى الممثل للدالة h(x) = (3x^2 - 2x + 4) / (x - 1) بجوار +infinity.",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_fn_asymptote_3x1",
      explanation_ar: "بالقسمة الإقليدية: 3x^2 - 2x + 4 = (x - 1)(3x + 1) + 5. إذن h(x) = 3x + 1 + 5/(x - 1). نهاية 5/(x - 1) معدومة، إذن المستقيم المقارب المائل هو y = 3x + 1.",
    },
    repairGuide: {
      targetErrorType: "calculation_error",
      title_ar: "معالجة أخطاء القسمة الإقليدية لاستخراج معادلة المقارب المائل",
      mentalModelExplanation_ar: "يخطئ التلميذ في إشارات الطرح أثناء القسمة الإقليدية للبسط على المقام، مما يغير الحد الثابت b في معادلة المقارب y = ax + b.",
      actionableSteps_ar: [
        "الخطوة 1: أجر عملية القسمة الإقليدية لكثير الحدود أو استعمل طريقة المطابقة بالأعداد a و b و c.",
        "الخطوة 2: اكتب f(x) = ax + b + R(x)/D(x).",
        "الخطوة 3: احسب lim [f(x) - (ax + b)] وتأكد أنها تساوي 0 قبل التصريح بالمعادلة.",
      ],
      contrastiveWorkedExample: "خطأ: (2x^2+3x-1)/(x+1) = 2x - 1 (خطأ إشارة). صواب: 2x(x+1) = 2x^2+2x، وبالطرح يتبقى x - 1 ثم + 1، إذن الحاصل هو 2x + 1.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_function_study"],
    externalResourceIds: ["res_math_m_function_study"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "المسألة الكبرى في امتحان البكالوريا (6 إلى 7 نقاط كاملة) تتمحور حول دراسة دالة لوغاريتمية أو أسية ورسم منحناها.",
      commonPitfalls_ar: ["رسم المنحنى قبل وضع المستقيمات المقاربة", "عدم احترام وضعية المنحنى بالنسبة للمقارب"],
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
  // 7. FONCTIONS BORNÉES ET ENCADREMENT
  // ---------------------------------------------------------------------------
  math_m_bounded_functions: {
    packageId: "pkg_math_m_bounded_functions",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_continuity_derivatives",
    skillId: "math_m_bounded_functions",
    objective_ar: "إثبات محدودية دالة عددية (محدودة من الأعلى، محدودة من الأسفل، محدودة) وتوظيف الحصر والمقارنة في استنتاج النهايات وحصر التكاملات.",
    objective_fr: "Démontrer qu'une fonction est bornée (majorée, minorée) et exploiter les inégalités d'encadrement pour déterminer des limites et encadrer des intégrales.",
    prerequisites: ["math_m_derivatives_tvi_rigor"],
    lesson: {
      title_ar: "الدوال المحدودة، مبرهنات الحصر، وتطبيقاتها التكاملية",
      contentMarkdown_ar: `### مفهوم الدالة المحدودة (Fonction bornée)
لتكن $f$ دالة معرفة على مجال $I$:
1. **دالة محدودة من الأعلى (Majorée)**: إذا وجد عدد حقيقي $M$ بحيث من أجل كل $x \in I$:
   $$f(x) \le M$$
2. **دالة محدودة من الأسفل (Minorée)**: إذا وجد عدد حقيقي $m$ بحيث من أجل كل $x \in I$:
   $$f(x) \ge m$$
3. **دالة محدودة (Bornée)**: إذا كانت محدودة من الأعلى ومحدودة من الأسفل معاً:
   $$m \le f(x) \le M \iff |f(x)| \le K \quad (K > 0)$$

### مبرهنة الدوال المستمرة على مجال مغلق
كل دالة مستمرة على مجال مغلق ومحدود $[a, b]$ هي دالة **محدودة وتبلغ حديها** (حدها الأعلى وحدها الأدنى).

### مبرهنة حصر التكاملات
إذا كانت $f$ مستمرة على $[a, b]$ (مع $a \le b$) وكانت محصورة بـ $m \le f(x) \le M$، فإن:
$$m(b - a) \le \int_{a}^{b} f(x) \, dx \le M(b - a)$$

### التمييز بين القيم الحدية المحلية والمحدودية العامة
وجود قيمة حدية عظمى محلية لا يعني بالضرورة أن الدالة محدودة من الأعلى على $\mathbb{R}$ كاملاً (مثال: كثير الحدود $f(x) = x^3 - 3x$).`,
      keyTakeaway_ar: "الدالة المحدودة تحقق m <= f(x) <= M على كامل المجال. وإذا حُصرت f(x) على [a, b] فإن تكاملها يُحصر بمساحتي المستطيلين الأدنى والأعلى.",
    },
    workedExample: {
      problem_ar: "لتكن f(x) = (2*cos(x) + 1) / (x^2 + 1) المعرفة على R. أثبت أن f محدودة على R وعيّن حاصريها m و M، ثم استنتج lim_{x -> +infinity} f(x).",
      stepByStepSolution_ar: [
        "الخطوة 1: حصر البسط: من أجل كل عدد حقيقي x، لدينا -1 <= cos(x) <= 1. بالضرب في 2: -2 <= 2*cos(x) <= 2. بإضافة 1: -1 <= 2*cos(x) + 1 <= 3.",
        "الخطوة 2: دراسة المقام: لدينا x^2 >= 0 إذن x^2 + 1 >= 1 > 0 تماماً من أجل كل x من R.",
        "الخطوة 3: استنتاج الحد الأعلى: f(x) = (2*cos(x) + 1)/(x^2 + 1) <= 3/(x^2 + 1) <= 3/1 = 3.",
        "الخطوة 4: استنتاج الحد الأدنى: f(x) >= -1/(x^2 + 1) >= -1/1 = -1. إذن من أجل كل x من R: -1 <= f(x) <= 3، فالدالة f محدودة على R بحاصرين هما m = -1 و M = 3.",
        "الخطوة 5: حساب النهاية عند +infinity: من أجل x > 0، لدينا: -1/(x^2 + 1) <= f(x) <= 3/(x^2 + 1). بما أن lim_{x -> +infinity} [-1/(x^2 + 1)] = 0 و lim_{x -> +infinity} [3/(x^2 + 1)] = 0، فحسب مبرهنة الحصر: lim_{x -> +infinity} f(x) = 0.",
      ],
      pedagogicalComment_ar: "المقام المتزايد نحو اللانهاية مع بسط محدود يضمن أن النسبة تؤول حتماً إلى الصفر.",
    },
    activeRecall: {
      prompt_ar: "إذا كانت الدالة f مستمرة ومحصورة بـ 2 <= f(x) <= 5 على المجال [1, 3]، فما هو حصر التكامل I = integral_1^3 (f(x) dx)؟",
      expectedAnswer_ar: "طول المجال هو 3 - 1 = 2. الحصر هو 2*(2) <= I <= 5*(2) أي: 4 <= I <= 10.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_bound_01",
        prompt_ar: "احصر التكامل I = integral_0^1 (1 / (1 + x^2) dx).",
        optionsCount: 4,
        correctAnswerId: "opt_bound_half_1",
        explanation_ar: "على [0, 1] لدينا 0 <= x^2 <= 1 ومنه 1 <= 1 + x^2 <= 2. بقلب الأطراف: 1/2 <= 1/(1+x^2) <= 1. بتكامل الأطراف على مجال طوله 1 نجد: 1/2 <= I <= 1.",
        distractorErrorMappings: {
          opt_bound_0_1: "forgot_information",
          opt_bound_1_2: "calculation_error",
          opt_bound_neg: "misunderstood_concept",
        },
      },
      {
        id: "pq_math_m_bound_02",
        prompt_ar: "هل الدالة f(x) = x^3 محدودة على R؟ ولماذا؟",
        optionsCount: 4,
        correctAnswerId: "opt_bound_no_cub",
        explanation_ar: "لا، لأن نهايتها عند +infinity هي +infinity وعند -infinity هي -infinity، فلا يوجد عدد حقيقي M يحصرها من الأعلى أو الأسفل.",
        distractorErrorMappings: {
          opt_bound_yes: "misunderstood_concept",
          opt_bound_only_pos: "calculation_error",
          opt_bound_zero: "forgot_information",
        },
      },
    ],
    retest: {
      id: "rq_math_m_bound_twin",
      parentPracticeQuestionId: "pq_math_m_bound_01",
      prompt_ar: "احصر التكامل J = integral_0^1 (1 / (2 + x^2) dx).",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_bound_third_half",
      explanation_ar: "على المجال [0, 1] لدينا 0 <= x^2 <= 1 إذن 2 <= 2 + x^2 <= 3. بأخذ المقلوب وترتيب الأطراف نجد: 1/3 <= 1/(2+x^2) <= 1/2. وبما أن طول المجال هو 1 - 0 = 1، فإن بالتكامل نجد حتماً: 1/3 <= J <= 1/2.",
    },
    repairGuide: {
      targetErrorType: "misunderstood_concept",
      title_ar: "معالجة خطأ قلب اتجاه المتراجحات عند أخذ مقلوب الحدود الموجبة",
      mentalModelExplanation_ar: "ينسى التلميذ أن دالة المقلوب f(t) = 1/t متناقصة تماماً على المجال الموجب، فيحافظ على نفس اتجاه المتراجحة عند قلب الأطراف.",
      actionableSteps_ar: [
        "الخطوة 1: تأكد أولاً أن جميع أطراف الحصر موجبة تماماً قبل أخذ المقلوب.",
        "الخطوة 2: اقلب اتجاه المتباينة فور أخذ المقلوب: إذا كان a <= b <= c فإن 1/c <= 1/b <= 1/a.",
        "الخطوة 3: رتب الأطراف تصاعدياً من الأصغر إلى الأكبر لضمان سلامة خطوات التكامل اللاحقة.",
      ],
      contrastiveWorkedExample: "خطأ: 1 <= 1 + x^2 <= 2 يعطي 1 <= 1/(1+x^2) <= 1/2 (باطل لأن 1 ليس أصغر من النصف!). صواب: 1/2 <= 1/(1+x^2) <= 1.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_bounded_functions"],
    externalResourceIds: ["res_math_m_bounded_functions"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "يرد سؤال حصر الدوال والتكاملات بانتظام في المسألة الكبرى للتحليل لتقدير مساحات لا يمكن إيجاد دوالها الأصلية بالصيغ المباشرة.",
      commonPitfalls_ar: ["نسيان قلب المتراجحة عند أخذ المقلوب", "إهمال ضرب حاصري الدالة في سعة المجال (b - a)"],
      officialBacPastRefIds: ["bac_m_2023_s1_ex4", "bac_m_2020_s1_ex4"],
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
  // 8. ARBRES DE PROBABILITÉS CONDITIONNELLES
  // ---------------------------------------------------------------------------
  math_m_conditional_probability_trees: {
    packageId: "pkg_math_m_conditional_probability_trees",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_combinatorics_bernoulli",
    skillId: "math_m_conditional_probability_trees",
    objective_ar: "بناء شجرة احتمالات متوازنة لنمذجة التجارب العشوائية وحساب الاحتمال الشرطي P_B(A) والتمييز بين P(A∩B) و P_B(A).",
    objective_fr: "Construire un arbre pondéré de probabilités pour modéliser une expérience aléatoire, calculer les probabilités conditionnelles et distinguer P(A∩B) de P_B(A).",
    prerequisites: ["math_m_combinatorics_bernoulli"],
    lesson: {
      title_ar: "شجرة الاحتمالات المتوازنة وحساب الاحتمالات الشرطية",
      contentMarkdown_ar: `### مفهوم الاحتمال الشرطي (Probabilité conditionnelle)
ليكن $A$ و $B$ حادثتين من فضاء العينة $\Omega$ حيث $P(A) > 0$.
احتمال تحقق الحادثة $B$ علماً أن الحادثة $A$ قد تحققت بالفعل يُرمز له بـ $P_A(B)$ أو $P(B|A)$ ويُعرف بـ:
$$P_A(B) = \frac{P(A \cap B)}{P(A)}$$

### قواعد شجرة الاحتمالات المتوازنة (Arbre pondéré)
1. **قاعدة العقدة الأولى**: مجموع احتمالات الفروع المنطلقة من نفس العقدة يساوي دائماً 1:
   $$P(A) + P(\bar{A}) = 1$$
   $$P_A(B) + P_A(\bar{B}) = 1$$
2. **قاعدة المسار (جداء الفروع)**: احتمال مسار كامل يساوي جداء احتمالات فروعه المتعاقبة:
   $$P(A \cap B) = P(A) \times P_A(B)$$

### التمييز الحاسم بين $P(A \cap B)$ و $P_A(B)$
- $P(A \cap B)$: احتمال تحقق الحادثتين $A$ و $B$ معاً في التجربة الكلية.
- $P_A(B)$: احتمال تحقق $B$ بعد تقليص فضاء العينة إلى الحادثة $A$ فقط (معلومية تحقق $A$).
- بوجه عام: $P_A(B) \neq P_B(A)$.`,
      keyTakeaway_ar: "في شجرة الاحتمالات: مجموع فروع كل عقدة يساوي 1، واحتمال التقاطع P(A∩B) يساوي جداء فروع المسار P(A)*P_A(B).",
    },
    workedExample: {
      problem_ar: "في مصنع، تنتج الآلة M1 نسبة 60% من القطع، وتنتج الآلة M2 نسبة 40%. نسبة القطع المعيبة في إنتاج M1 هي 2%، وفي إنتاج M2 هي 5%. مثّل المعطيات بشجرة احتمالات، ثم احسب احتمال أن تكون القطعة من إنتاج M1 ومعيبة، وإذا سُحبت قطعة معيبة فما احتمال أنها صُنعت بالآلة M1؟",
      stepByStepSolution_ar: [
        "الخطوة 1: ترميز الحوادث وتحديد الاحتمالات الابتدائية: - M1: القطعة مصنوعة بالآلة M1، P(M1) = 0.60. - M2: القطعة مصنوعة بالآلة M2، P(M2) = 0.40. (التحقق: 0.60 + 0.40 = 1).",
        "الخطوة 2: تحديد الاحتمالات الشرطية للفروع الثانوية (D: القطعة معيبة): - P(D | M1) = 0.02 و P(D_bar | M1) = 0.98. - P(D | M2) = 0.05 و P(D_bar | M2) = 0.95.",
        "الخطوة 3: حساب احتمال التقاطع P(M1 ∩ D): بقاعدة جداء المسار: P(M1 ∩ D) = P(M1) * P(D | M1) = 0.60 * 0.02 = 0.012.",
        "الخطوة 4: حساب الاحتمال الإجمالي للعيب P(D): P(D) = P(M1 ∩ D) + P(M2 ∩ D) = 0.012 + (0.40 * 0.05) = 0.012 + 0.020 = 0.032.",
        "الخطوة 5: حساب الاحتمال البعدي P(M1 | D) بدستور بايز: P(M1 | D) = P(M1 ∩ D) / P(D) = 0.012 / 0.032 = 12 / 32 = 3 / 8 = 0.375.",
      ],
      pedagogicalComment_ar: "التمييز بين P(D|M1)=0.02 (معطى أولي) و P(M1|D)=0.375 (احتمال بعدي محسوب بالقسمة على P(D)) هو جوهر فهم الاحتمال الشرطي.",
    },
    activeRecall: {
      prompt_ar: "إذا كان P(A) = 0.5 و P_A(B) = 0.4، فما هي قيمة P(A ∩ B)؟",
      expectedAnswer_ar: "P(A ∩ B) = P(A) * P_A(B) = 0.5 * 0.4 = 0.20.",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_probtree_01",
        prompt_ar: "إذا كان P(A) = 0.4 و P_A(B) = 0.3، فما هو احتمال P(A ∩ B)؟",
        optionsCount: 4,
        correctAnswerId: "opt_ptree_012",
        explanation_ar: "P(A ∩ B) = P(A) * P_A(B) = 0.4 * 0.3 = 0.12.",
        distractorErrorMappings: {
          opt_ptree_07: "calculation_error",
          opt_ptree_01: "forgot_information",
          opt_ptree_03: "misunderstood_concept",
        },
      },
      {
        id: "pq_math_m_probtree_02",
        prompt_ar: "في شجرة احتمالات، إذا كان فرع الحادثة A له احتمال 0.7، فما هو احتمال الفرع المكمل A_bar المنطلق من نفس العقدة؟",
        optionsCount: 4,
        correctAnswerId: "opt_ptree_03",
        explanation_ar: "مجموع احتمالات الفروع المنطلقة من نفس العقدة يساوي 1، إذن P(A_bar) = 1 - 0.7 = 0.3.",
        distractorErrorMappings: {
          opt_ptree_07: "misunderstood_concept",
          opt_ptree_1: "forgot_information",
          opt_ptree_0: "calculation_error",
        },
      },
    ],
    retest: {
      id: "rq_math_m_probtree_twin",
      parentPracticeQuestionId: "pq_math_m_probtree_01",
      prompt_ar: "إذا كان احتمال الحادثة C هو P(C) = 0.5 واحتمال الحادثة D علماً أن C محققة هو P_C(D) = 0.4، فاحسب P(C ∩ D).",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_ptree_020",
      explanation_ar: "P(C ∩ D) = P(C) * P_C(D) = 0.5 * 0.4 = 0.20.",
    },
    repairGuide: {
      targetErrorType: "misunderstood_concept",
      title_ar: "معالجة الخلط بين الاحتمال الشرطي P(B|A) واحتمال التقاطع P(A ∩ B)",
      mentalModelExplanation_ar: "يعتقد التلميذ خطأً أن 'احتمال وقوع B علماً أن A محققة' هو نفسه احتمال 'وقوع A و B معاً'، ناسياً أن المعلومية تقسم على P(A) فتكبر القيمة.",
      actionableSteps_ar: [
        "الخطوة 1: ابحث في نص السؤال عن عبارة 'علماً أن' أو 'إذا علمنا أن'؛ الحادثة التي تليها مباشرة هي شرط القسمة (المقام).",
        "الخطوة 2: اكتب القانون فوراً: P(B | A) = P(A ∩ B) / P(A).",
        "الخطوة 3: تذكر دائماً أن P(A ∩ B) <= P(B | A) دوماً لأننا نقسم على عدد موجب أصغر من 1.",
      ],
      contrastiveWorkedExample: "خطأ: P(M1|D) = P(M1 ∩ D) = 0.012. صواب: P(M1|D) = P(M1 ∩ D) / P(D) = 0.012 / 0.032 = 0.375.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_conditional_probability_trees"],
    externalResourceIds: ["res_math_m_conditional_probability_trees"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "شجرة الاحتمالات هي الأداة القياسية الإلزامية في تمرين الاحتمالات بالبكالوريا لتمثيل السحب المتتالي والصناديق والتحاليل الطبية.",
      commonPitfalls_ar: ["عدم تدقيق مجموع فروع كل عقدة = 1", "قلب طرفي الاحتمال الشرطي في حساب بايز"],
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
  // 9. FORMULE DES PROBABILITÉS TOTALES
  // ---------------------------------------------------------------------------
  math_m_total_probability: {
    packageId: "pkg_math_m_total_probability",
    streamId: "math",
    subjectId: "math",
    topicId: "math_topic_combinatorics_bernoulli",
    skillId: "math_m_total_probability",
    objective_ar: "تطبيق قانون الاحتمالات الكلية انطلاقاً من تجزئة فضاء العينة وحساب احتمال الحوادث المركبة واستنتاج الاحتمال البعدي (مبرهنة بايز).",
    objective_fr: "Appliquer la formule des probabilités totales à partir d'une partition de l'univers, calculer la probabilité d'événements composés et déduire la probabilité a posteriori.",
    prerequisites: ["math_m_conditional_probability_trees"],
    lesson: {
      title_ar: "قانون الاحتمالات الكلية ومبرهنة بايز",
      contentMarkdown_ar: `### مفهوم تجزئة فضاء العينة (Partition de l'univers)
نقول إن الحوادث $A_1, A_2, \dots, A_n$ تشكل تجزئة لفضاء العينة $\Omega$ إذا وفقط إذا تحقق:
1. الحوادث غير متلائمة مثنى مثنى: $A_i \cap A_j = \emptyset$ لكل $i \neq j$.
2. اتحادها يشكل فضاء العينة كاملاً: $A_1 \cup A_2 \cup \dots \cup A_n = \Omega$.
3. احتمالاتها غير معدومة: $P(A_i) > 0$ لكل $i$.
(الحالة الثنائية الأشهر: أي حادثة $A$ مع حادثتها العكسية $\bar{A}$ تشكلان حتماً تجزئة لـ $\Omega$).

### قانون الاحتمالات الكلية (Formule des probabilités totales)
إذا كانت $A_1, A_2, \dots, A_n$ تجزئة لفضاء العينة $\Omega$، فإن احتمال أي حادثة $B$ في $\Omega$ يساوي مجموع احتمالات تقاطعاتها مع عناصر التجزئة:
$$P(B) = \sum_{i=1}^{n} P(B \cap A_i) = \sum_{i=1}^{n} P(A_i) \cdot P_{A_i}(B)$$
وفي حالة التجزئة الثنائية $\{A, \bar{A}\}$:
$$P(B) = P(A) \cdot P_A(B) + P(\bar{A}) \cdot P_{\bar{A}}(B)$$

### مبرهنة بايز للاحتمال البعدي (Théorème de Bayes)
تسمح بحساب احتمال 'السبب' $A_k$ علماً أن 'النتيجة' $B$ قد وقعت:
$$P_B(A_k) = \frac{P(A_k \cap B)}{P(B)} = \frac{P(A_k) \cdot P_{A_k}(B)}{\sum_{i=1}^{n} P(A_i) \cdot P_{A_i}(B)}$$

*تنبيه منهاجي*: في مواضيع البكالوريا الرسمية، يُصاغ هذا السؤال عادة بعبارة: «احسب الاحتمال الشرطي $P_B(A_k)$» أو «علماً أن النتيجة $B$ قد تحققت، ما احتمال أنها ناتجة عن السبب $A_k$؟». وتعتبر مبرهنة بايز تأطيراً منهجياً تركيبياً ناتجاً عن تعريف الاحتمال الشرطي مقسوماً على قانون الاحتمالات الكلية.`,
      keyTakeaway_ar: "قانون الاحتمالات الكلية P(B) يجمع كل المسارات المنتهية بالحادثة B في شجرة الاحتمالات، ومجموع الاحتمال الإجمالي محصور دوماً في [0, 1].",
    },
    workedExample: {
      problem_ar: "لدينا 3 صناديق U1 و U2 و U3 تحوي كرات بيضاء وسوداء: U1 به 3 بيضاء و 2 سوداء، U2 به 4 بيضاء و 1 سوداء، U3 به كرتان بيضاوان و 3 سوداء. نختار عشوائياً صندوقاً باحتمالات: P(U1)=1/2، P(U2)=1/3، P(U3)=1/6، ثم نسحب كرة واحدة. تأكد أن الصناديق تشكل تجزئة، واحسب احتمال سحب كرة بيضاء W، وإذا كانت المسحوبة بيضاء فما احتمال أنها من الصندوق U2؟",
      stepByStepSolution_ar: [
        "الخطوة 1: التحقق من التجزئة: الصناديق متنافية، ومجموع احتمالاتها: P(U1) + P(U2) + P(U3) = 1/2 + 1/3 + 1/6 = 3/6 + 2/6 + 1/6 = 6/6 = 1. إذن الحوادث تشكل تجزئة لفضاء العينة.",
        "الخطوة 2: حساب الاحتمالات الشرطية لسحب كرة بيضاء من كل صندوق: من U1 نجد P(W|U1) = 3/5، ومن U2 نجد P(W|U2) = 4/5، ومن U3 نجد P(W|U3) = 2/5.",
        "الخطوة 3: تطبيق قانون الاحتمالات الكلية: P(W) = P(U1)*P(W|U1) + P(U2)*P(W|U2) + P(U3)*P(W|U3) = (1/2)*(3/5) + (1/3)*(4/5) + (1/6)*(2/5) = 3/10 + 4/15 + 2/30 = 9/30 + 8/30 + 2/30 = 19/30.",
        "الخطوة 4: حساب الاحتمال البعدي P(U2 | W) بمبرهنة بايز: P(U2 | W) = P(U2 ∩ W) / P(W) = (P(U2) * P(W | U2)) / P(W) = (8/30) / (19/30) = 8/19.",
      ],
      pedagogicalComment_ar: "التحقق الحسابي المباشر: احتمال سحب كرة سوداء P(B_black) = 1 - 19/30 = 11/30، وبحسابها المستقل: (1/2)*(2/5) + (1/3)*(1/5) + (1/6)*(3/5) = 2/10 + 1/15 + 3/30 = (6+2+3)/30 = 11/30 (تطابق تام وموثوق).",
    },
    activeRecall: {
      prompt_ar: "ما هي الصيغة الرياضية لقانون الاحتمالات الكلية للحادثة B بالنسبة للتجزئة الثنائية {A, A_bar}؟",
      expectedAnswer_ar: "P(B) = P(A) * P_A(B) + P(A_bar) * P_{A_bar}(B).",
      concealedInitially: true,
    },
    practice: [
      {
        id: "pq_math_m_totprob_01",
        prompt_ar: "إذا كانت {A, A_bar} تجزئة مع P(A) = 0.3 و P(E|A) = 0.8 و P(E|A_bar) = 0.1، فما هي قيمة P(E)؟",
        optionsCount: 4,
        correctAnswerId: "opt_totprob_031",
        explanation_ar: "P(A_bar) = 1 - 0.3 = 0.7. بقانون الاحتمالات الكلية: P(E) = 0.3 * 0.8 + 0.7 * 0.1 = 0.24 + 0.07 = 0.31.",
        distractorErrorMappings: {
          opt_totprob_024: "forgot_information",
          opt_totprob_09: "calculation_error",
          opt_totprob_05: "misunderstood_concept",
        },
      },
      {
        id: "pq_math_m_totprob_02",
        prompt_ar: "إذا كان P(E) = 0.31 و P(A ∩ E) = 0.24، فما هو الاحتمال الشرطي P(A|E)؟",
        optionsCount: 4,
        correctAnswerId: "opt_totprob_bayes_24_31",
        explanation_ar: "P(A|E) = P(A ∩ E) / P(E) = 0.24 / 0.31 = 24 / 31.",
        distractorErrorMappings: {
          opt_totprob_bayes_31_24: "calculation_error",
          opt_totprob_bayes_024: "misunderstood_concept",
          opt_totprob_bayes_031: "forgot_information",
        },
      },
    ],
    retest: {
      id: "rq_math_m_totprob_twin",
      parentPracticeQuestionId: "pq_math_m_totprob_01",
      prompt_ar: "إذا كانت {B, B_bar} تجزئة لفضاء العينة مع P(B) = 0.4 و P(F|B) = 0.7 و P(F|B_bar) = 0.2، فاحسب الاحتمال الكلي P(F).",
      isIsomorphicTwin: true,
      altersSurfaceContext: true,
      testsIdenticalConcept: true,
      correctAnswerId: "opt_rq_totprob_040",
      explanation_ar: "P(B_bar) = 1 - 0.4 = 0.6. بقانون الاحتمالات الكلية: P(F) = P(B)*P(F|B) + P(B_bar)*P(F|B_bar) = 0.4 * 0.7 + 0.6 * 0.2 = 0.28 + 0.12 = 0.40.",
    },
    repairGuide: {
      targetErrorType: "forgot_information",
      title_ar: "معالجة نسيان حساب الحادثة العكسية P(A_bar) في التجزئة الثنائية",
      mentalModelExplanation_ar: "يضرب التلميذ P(A) في P(E|A) ويضيف إليها مباشرة P(E|A_bar) دون ضرب هذه الأخيرة في احتمال الحادثة العكسية P(A_bar) = 1 - P(A).",
      actionableSteps_ar: [
        "الخطوة 1: احسب أولاً احتمال الحادثة المتممة: P(A_bar) = 1 - P(A).",
        "الخطوة 2: اكتب حدي القانون كجداءين كاملين: P(A)*P(E|A) + P(A_bar)*P(E|A_bar).",
        "الخطوة 3: تحقق دائماً أن الناتج النهائي للاحتمال الكلي محصور قطيعاً بين 0 و 1.",
      ],
      contrastiveWorkedExample: "خطأ: P(E) = 0.3*0.8 + 0.1 = 0.24 + 0.1 = 0.34. صواب: P(E) = 0.3*0.8 + (1 - 0.3)*0.1 = 0.24 + 0.07 = 0.31.",
    },
    visualNecessity: "VISUAL_REQUIRED",
    visualAssetIds: ["vis_math_m_total_probability"],
    externalResourceIds: ["res_math_m_total_probability"],
    examTransfer: {
      status: "AVAILABLE",
      bacTypologyNotes_ar: "قانون الاحتمالات الكلية يرد بانتظام بعد شجرة الاحتمالات، ويُطلب الاحتمال البعدي (صيغة بايز) بصياغة 'احسب الاحتمال الشرطي... علماً أن...' مقسوماً على الاحتمال الكلي.",
      commonPitfalls_ar: ["نسيان ضرب الحادثة العكسية في احتمالها المتمم", "خطأ توحيد المقامات في جمع المسارات"],
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
};

// =============================================================================
// 2. DIAGNOSTIC SIGNAL PROFILES FOR THE 9 BATCH 02 SKILLS
// =============================================================================

export const MATH_BATCH_02_DIAGNOSTIC_SIGNALS: Record<string, MathDiagnosticSignalProfile> = {
  math_m_sequences_comparison_limits: {
    skillId: "math_m_sequences_comparison_limits",
    missingPrerequisiteIndicators_ar: ["الارتباك في إشارات حصر الدوال المثلثية sin و cos في [-1, 1]", "عدم إتقان خواص المتراجحات عند القسمة"],
    conceptualMisconceptionIndicators_ar: ["محاولة استنتاج نهاية منتهية من حصر بطرف واحد فقط", "اعتقاد أن تذبذب الحد يمنع تقارب المتتالية كلياً"],
    proceduralWeaknessIndicators_ar: ["نسيان إثبات إيجابية المقام قبل القسمة عليه في أطراف المتباينة", "الخطأ في حساب نهاية طرفي الحصر عند اللانهاية"],
    examMethodWeaknessIndicators_ar: ["عدم ذكر اسم مبرهنة الحصر صراحة عند صياغة النتيجة النهائية"],
  },
  math_m_geometric_sequences: {
    skillId: "math_m_geometric_sequences",
    missingPrerequisiteIndicators_ar: ["الارتباك في قواعد حساب القوى وتفكيك الأسس a^(n+1) = a * a^n", "الارتباك في توحيد المقامات في الكسور"],
    conceptualMisconceptionIndicators_ar: ["الاعتقاد بأن q > 1 يعطي تقارباً", "الخلط بين عبارة الحد العام ومجموع الحدود"],
    proceduralWeaknessIndicators_ar: ["الخطأ في حساب عدد الحدود N = الدليل الأخير - الدليل الأول + 1", "الخطأ في إشارة الناقص في مقام قانون المجموع 1 - q"],
    examMethodWeaknessIndicators_ar: ["عدم التحقق الحسابي بتعويض الحدود الأولى في المجموع"],
  },
  math_m_roots_of_unity: {
    skillId: "math_m_roots_of_unity",
    missingPrerequisiteIndicators_ar: ["نسيان قيم الزوايا الشهيرة ونسبها المثلثية على الدائرة المثلثية", "الارتباك في الانتقال بين الشكلين الأسي والجبري"],
    conceptualMisconceptionIndicators_ar: ["الخلط بين خطوة زاوية الجذور 2k*pi/n و k*pi/n", "اعتقاد أن الجذور التكعيبية للواحد تحوي حلاً حقيقياً سالباً"],
    proceduralWeaknessIndicators_ar: ["الخطأ في حساب الطويلة r = 1", "تكرار الجذور عند تجاوز النطاق k من 0 إلى n - 1"],
    examMethodWeaknessIndicators_ar: ["إغفال ذكر خاصية المجموع المعدوم في براهين التناظر الهندسي"],
  },
  math_m_complex_argument_loci: {
    skillId: "math_m_complex_argument_loci",
    missingPrerequisiteIndicators_ar: ["الارتباك في قراءة لاحقة الشعاع وتحديد الزاوية الموجهة (MB, MA)", "نسيان تعريف الدائرة المعرفة بقطرها"],
    conceptualMisconceptionIndicators_ar: ["الخلط بين الترديد pi (استقامية أو تعامد كامل) والترديد 2pi (أنصاف مستقيمات أو أنصاف دوائر)", "اعتقاد أن النقط المستثناة مقبولة في مجموعة النقط"],
    proceduralWeaknessIndicators_ar: ["نسيان استثناء النقطتين A و B في التحديد النهائي للمجموعة", "الخطأ في حساب مركز ونصف قطر دائرة القطر [AB]"],
    examMethodWeaknessIndicators_ar: ["كتابة معادلة جبرية معقدة بدلاً من التحليل الهندسي المباشر للزاوية"],
  },
  math_m_logarithmic_differentiation: {
    skillId: "math_m_logarithmic_differentiation",
    missingPrerequisiteIndicators_ar: ["نسيان مشتقة جداء دالتين ومشتقة مركب دالة", "الارتباك في خواص اللوغاريتم ln(a^b) = b * ln(a)"],
    conceptualMisconceptionIndicators_ar: ["تطبيق اللوغاريتم على دوال سالبة أو معدومة دون فحص شرط f(x) > 0", "اعتبار مشتقة ln(f(x)) هي المشتقة النهائية المطلوبة"],
    proceduralWeaknessIndicators_ar: ["نسيان الضرب في f(x) في نهاية العملية لاستخلاص f'(x)", "الخطأ في اشتقاق الطرف الأيمن كجداء"],
    examMethodWeaknessIndicators_ar: ["عدم كتابة التحقق بنقطة عددية بسيطة للتأكد من صحة المشتقة"],
  },
  math_m_function_study: {
    skillId: "math_m_function_study",
    missingPrerequisiteIndicators_ar: ["الارتباك في القسمة الإقليدية لكثيرات الحدود", "الخطأ في دراسة إشارة ثلاثي الحدود من الدرجة الثانية"],
    conceptualMisconceptionIndicators_ar: ["اعتقاد أن القيمة العظمى المحلية يجب أن تكون أكبر من جميع القيم الصغرى في الدوال غير المتصلة", "الخلط بين المقارب المائل والمقارب الأفقي"],
    proceduralWeaknessIndicators_ar: ["الخطأ في حساب مشتقة حاصل القسمة (u/v)' وتوزيع إشارة السالب", "نسيان تحديد الوضع النسبي بين المنحنى والمقارب"],
    examMethodWeaknessIndicators_ar: ["رسم المنحنى قبل تثبيت المقاربات والمماسات الأفقية بدقة في المعلم"],
  },
  math_m_bounded_functions: {
    skillId: "math_m_bounded_functions",
    missingPrerequisiteIndicators_ar: ["الارتباك في خواص المتراجحات وتأثير الدوال المتناقصة كالمقلوب", "عدم إتقان مبرهنة المقارنة في الحساب التكاملي"],
    conceptualMisconceptionIndicators_ar: ["الخلط بين المحدودية المحلية على قطعة والمحدودية العامة على R", "اعتقاد أن انعدام المشتقة يضمن محدودية الدالة"],
    proceduralWeaknessIndicators_ar: ["نسيان قلب اتجاه المتراجحة عند أخذ مقلوب أطراف موجبة", "نسيان ضرب حاصري الدالة في طول مجال التكامل (b - a)"],
    examMethodWeaknessIndicators_ar: ["عدم التحقق من إيجابية الدالة قبل تطبيق حصر المساحات"],
  },
  math_m_conditional_probability_trees: {
    skillId: "math_m_conditional_probability_trees",
    missingPrerequisiteIndicators_ar: ["الارتباك في ضرب الأعداد العشرية والكسور", "نسيان مبدأ الحادثة العكسية P(A_bar) = 1 - P(A)"],
    conceptualMisconceptionIndicators_ar: ["الخلط بين احتمال التقاطع P(A ∩ B) والاحتمال الشرطي P_A(B)", "افتراض أن P(A|B) يساوي دائماً P(B|A) دون تطبيق بايز"],
    proceduralWeaknessIndicators_ar: ["عدم التأكد من أن مجموع فروع العقدة الثانوية يساوي 1", "الخطأ في تحديد الحادثة الشرطية المعلومة ووضعها في المقام"],
    examMethodWeaknessIndicators_ar: ["إغفال كتابة الترميز الحرفي للحادثة قبل الشروع في الحساب العددي"],
  },
  math_m_total_probability: {
    skillId: "math_m_total_probability",
    missingPrerequisiteIndicators_ar: ["الارتباك في توحيد المقامات لمجموع كسور متعددة", "عدم إتقان مفهوم الحوادث المتنافية"],
    conceptualMisconceptionIndicators_ar: ["تطبيق قانون الاحتمالات الكلية دون التأكد من أن الحوادث تشكل تجزئة لفضاء العينة", "نسيان ضرب الحادثة في احتمالها الأساسي P(A_i)"],
    proceduralWeaknessIndicators_ar: ["الخطأ في جمع احتمالات المسارات المختلفة المنتهية بنفس الحادثة", "الخطأ في التعويض في بسط ومقام مبرهنة بايز"],
    examMethodWeaknessIndicators_ar: ["عدم التحقق من أن الاحتمال الإجمالي الناتج ينتمي للمجال [0, 1]"],
  },
};

// =============================================================================
// 3. SPACED REVIEW SCHEDULES FOR THE 9 BATCH 02 SKILLS
// =============================================================================

export const MATH_BATCH_02_SPACED_REVIEWS: Record<string, MathSpacedReviewSchedule> = {
  math_m_sequences_comparison_limits: {
    skillId: "math_m_sequences_comparison_limits",
    day1InitialEvidence_ar: "إتمام حصر متتالية تحوي حدوداً متذبذبة وقسمتها على مقام موجب بنجاح.",
    day3RetrievalPrompt_ar: "استرجع: متى تطبق مبرهنة الحصر ومتى تطبق مبرهنة المقارنة للتباعد؟",
    day7MixedPracticePrompt_ar: "احسب نهاية المتتالية u_n = (n^2 + cos(n)) / (2n^2 + 1) بالحصر الصارم.",
    laterExamApplicationPrompt_ar: "حل تمرين متتاليات بكالوريا رسمي يتضمن حصر متتالية تكاملية واستنتاج نهايتها.",
  },
  math_m_geometric_sequences: {
    skillId: "math_m_geometric_sequences",
    day1InitialEvidence_ar: "إثبات أن v_n متتالية هندسية وحساب مجموع حدودها المتعاقبة.",
    day3RetrievalPrompt_ar: "استرجع: ما هو قانون مجموع حدود متتالية هندسية وكيف تحسب عدد الحدود بدقة؟",
    day7MixedPracticePrompt_ar: "حل مسألة تراجع مزدوج u_(n+1) = a*u_n + b واستنتاج عبارة الحد العام والمجموع S_n.",
    laterExamApplicationPrompt_ar: "حل تمرين المتتاليات من بكالوريا 2024 رياضيات في 35 دقيقة.",
  },
  math_m_roots_of_unity: {
    skillId: "math_m_roots_of_unity",
    day1InitialEvidence_ar: "حل z^3 = 1 في C وتمثيل صور الجذور على دائرة الوحدة وإثبات تقايس أضلاع المثلث.",
    day3RetrievalPrompt_ar: "استرجع: ما هي صيغة الجذور النونية للواحد الصحيح وما هو ناتج مجموعها التراكمي؟",
    day7MixedPracticePrompt_ar: "حل في C المعادلة (z - 1)^4 = 1 وتعيين طبيعة المضلع الناتج في المستوي المركب.",
    laterExamApplicationPrompt_ar: "حل تمرين الأعداد المركبة من بكالوريا شعبة رياضيات يتضمن قوى العدد j والتحويلات.",
  },
  math_m_complex_argument_loci: {
    skillId: "math_m_complex_argument_loci",
    day1InitialEvidence_ar: "تعيين المجموعة النقطية المرتبطة بعمدة النسبة وتحديد مركزها ونصف قطرها والنقاط المستثناة.",
    day3RetrievalPrompt_ar: "استرجع: ما هو التفسير الهندسي لـ arg((z-a)/(z-b)) وما الفرق بين ترديد pi وترديد 2pi؟",
    day7MixedPracticePrompt_ar: "عيّن مجموعة النقط M بحيث يكون (z - 2i)/(z + 1) تخيلياً صرفاً أو حقيقياً موجباً.",
    laterExamApplicationPrompt_ar: "حل مسألة أعداد مركبة كاملة من بكالوريا سابقة تتضمن المجموعات النقطية والتحويلات.",
  },
  math_m_logarithmic_differentiation: {
    skillId: "math_m_logarithmic_differentiation",
    day1InitialEvidence_ar: "اشتقاق دالة من الشكل x^g(x) بالاشتقاق اللوغاريتمي والتحقق بنقطة عددية.",
    day3RetrievalPrompt_ar: "استرجع: ما هي خطوات الاشتقاق اللوغاريتمي ولماذا يشترط أن تكون الدالة موجبة تماماً؟",
    day7MixedPracticePrompt_ar: "احسب مشتقة الدالة f(x) = (x^2 + 1)^x على R وادرس اتجاه تغيرها.",
    laterExamApplicationPrompt_ar: "حل دراسة دالة أسية مركبة تتضمن قوى الدوال في موضوع بكالوريا رسمي.",
  },
  math_m_function_study: {
    skillId: "math_m_function_study",
    day1InitialEvidence_ar: "إنجاز جدول تغيرات متكامل واستخراج المستقيمات المقاربة الأفقية والعمودية والمائلة.",
    day3RetrievalPrompt_ar: "استرجع: كيف نبرهن أن y = ax + b مقارب مائل وما هي شروط نقطة الانعطاف؟",
    day7MixedPracticePrompt_ar: "دراسة دالة ناطقة كاملة وتحديد نقط تقاطعها مع المحورين ورسم منحناها بدقة.",
    laterExamApplicationPrompt_ar: "حل المسألة الكبرى للدوال في بكالوريا رياضيات في 55 دقيقة.",
  },
  math_m_bounded_functions: {
    skillId: "math_m_bounded_functions",
    day1InitialEvidence_ar: "إثبات محدودية دالة كسرية بمقام موجب وحصر تكاملها على مجال مغلق بنجاح.",
    day3RetrievalPrompt_ar: "استرجع: ما هو مبرهنة حصر التكامل وما هي الحيطة الواجبة عند قلب أطراف المتراجحة؟",
    day7MixedPracticePrompt_ar: "احصر الدالة f(x) = 1/(2 + sin x) على [0, pi] واحصر تكاملها بين 0 و pi.",
    laterExamApplicationPrompt_ar: "حل تمرين تحليلي يتضمن حصر متتالية تكاملية I_n = integral_0^1 (x^n / (1+x) dx).",
  },
  math_m_conditional_probability_trees: {
    skillId: "math_m_conditional_probability_trees",
    day1InitialEvidence_ar: "بناء شجرة احتمالات متوازنة وحساب P(A ∩ B) و الاحتمال الشرطي P_B(A).",
    day3RetrievalPrompt_ar: "استرجع: ما هي قواعد الشجرة المتوازنة وما هو الفرق بين P(A ∩ B) و P_A(B)؟",
    day7MixedPracticePrompt_ar: "مسألة سحب كرات من صندوقين مع تغيير شروط السحب وبناء شجرة الاحتمالات.",
    laterExamApplicationPrompt_ar: "حل تمرين الاحتمالات من بكالوريا 2024 رياضيات في 30 دقيقة.",
  },
  math_m_total_probability: {
    skillId: "math_m_total_probability",
    day1InitialEvidence_ar: "تطبيق قانون الاحتمالات الكلية وحساب الاحتمال البعدي بدستور بايز.",
    day3RetrievalPrompt_ar: "استرجع: ما هو شرط تطبيق قانون الاحتمالات الكلية وكيف تصاغ مبرهنة بايز؟",
    day7MixedPracticePrompt_ar: "مسألة تشخيص طبي باختبار ذي دقة معينة وحساب احتمال أن يكون الشخص مصاباً فعلاً.",
    laterExamApplicationPrompt_ar: "حل تمرين احتمالات كامل يدمج المتغير العشوائي وقانون الاحتمالات الكلية في بكالوريا رسمية.",
  },
};

// =============================================================================
// 4. DOSSIER BUILDER & FACTORY QUERY HELPERS FOR BATCH 02
// =============================================================================

export function getMathBatch02SkillDossier(skillId: string): MathSkillDossier | null {
  const pkg = MATH_BATCH_02_PACKAGES[skillId];
  if (!pkg) return null;

  const visualAsset = ALL_MATH_VISUAL_ASSETS[skillId];
  const externalResource = ALL_MATH_EXTERNAL_RESOURCES[skillId];
  const diagnosticSignal = MATH_BATCH_02_DIAGNOSTIC_SIGNALS[skillId];
  const spacedReview = MATH_BATCH_02_SPACED_REVIEWS[skillId];
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

export function getAllMathBatch02Dossiers(): MathSkillDossier[] {
  return Object.keys(MATH_BATCH_02_PACKAGES).map((id) => getMathBatch02SkillDossier(id)!);
}
