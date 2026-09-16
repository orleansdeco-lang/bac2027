import { Skill } from "@/types/mission";

/**
 * 9 Core Targeted Skills for Sciences Expérimentales (3 per core subject)
 */
export const SCIENCES_EXP_SKILLS: Record<string, Skill> = {
  // ---------------------------------------------------------------------------
  // MATHEMATICS SKILLS
  // ---------------------------------------------------------------------------
  math_derivatives_chain_rule: {
    id: "math_derivatives_chain_rule",
    subjectId: "math",
    title_ar: "اشتقاق الدوال المركبة وقاعدة السلسلة",
    title_fr: "Dérivation des fonctions composées et règle de dérivation",
    description_ar: "إتقان اشتقاق الدوال المركبة من الشكل (e^u) و ln(u) دون نسيان مشتقة الدالة الداخلية u'(x).",
    description_fr: "Maîtriser la dérivation des fonctions composées (exp, ln) sans omettre la dérivée interne u'(x).",
    dimensions: ["knowledge", "application"],
    repairStrategy_ar: "تفكيك الدالة المركبة إلى دالتين، حساب مشتقة الدالة الداخلية أولاً، ثم تطبيق القاعدة العامة.",
    repairStrategy_fr: "Décomposer la composée, calculer la dérivée interne en premier, puis appliquer la formule générale.",
    repairSteps_ar: [
      "حدد الدالة الداخلية u(x) والدالة الخارجية f(u).",
      "احسب الدالة المشتقة الداخلية u'(x) جانباً وتأكد من صحتها.",
      "طبق القاعدة: [e^(u(x))]' = u'(x) · e^(u(x)) أو [ln(u(x))]' = u'(x) / u(x).",
      "انشر وبسط العبارة مع الاحتفاظ بالعامل المشترك u'(x) لدراسة الإشارة.",
    ],
    repairSteps_fr: [
      "Identifier la fonction interne u(x) et la fonction externe f(u).",
      "Calculer la dérivée interne u'(x) séparément avec rigueur.",
      "Appliquer la règle : [e^u]' = u'·e^u ou [ln(u)]' = u'/u.",
      "Factoriser l'expression obtenue pour faciliter l'étude du signe.",
    ],
  },

  math_functions_limits_factoring: {
    id: "math_functions_limits_factoring",
    subjectId: "math",
    title_ar: "إزالة عدم التعيين بالتحليل والاختزال",
    title_fr: "Levée des indéterminations par factorisation et simplification",
    description_ar: "رفع الصور المنعدمة (0/0) و(∞−∞) من خلال التحليل بعامل مشترك أو إضافة تعبيرات مترافقة ثم الاختزال.",
    description_fr: "Éliminer les formes indéterminées 0/0 et ∞−∞ par factorisation, conjugaison ou simplification algébrique.",
    dimensions: ["application", "methodology"],
    repairStrategy_ar: "تحديد الصيغة غير المحددة أولاً، ثم اختيار التقنية المناسبة (تحليل / مرافق / تقسيم بحد أعلى درجة).",
    repairStrategy_fr: "Identifier la forme indéterminée, puis choisir la technique : factorisation, conjugué, ou division par le terme dominant.",
    repairSteps_ar: [
      "احسب النهاية المباشرة أولاً لتحديد نوع عدم التعيين (0/0 أم ∞/∞ أم ∞−∞).",
      "إذا كانت 0/0: حلل البسط والمقام بعامل مشترك هو (x − a) ثم اختزل.",
      "إذا كانت ∞−∞: أخرج العامل الأعلى درجة أو اضرب بالمرافق.",
      "بعد الاختزال أو التبسيط، أعد حساب النهاية وتحقق من النتيجة بقراءة البيان.",
    ],
    repairSteps_fr: [
      "Calculer la limite directe pour identifier la forme indéterminée.",
      "Pour 0/0 : factoriser numérateur et dénominateur par (x − a) et simplifier.",
      "Pour ∞ − ∞ : extraire le terme dominant ou multiplier par la quantité conjuguée.",
      "Recalculer la limite après simplification et vérifier graphiquement si possible.",
    ],
  },

  math_functions_asymptotes: {
    id: "math_functions_asymptotes",
    subjectId: "math",
    title_ar: "المستقيمات المقاربة والوضع النسبي للمنحنى",
    title_fr: "Asymptotes (verticales, horizontales, obliques) et position relative",
    description_ar: "تحديد المقاربات الرأسية والأفقية والمائلة وتحليل وضع المنحنى بالنسبة للمقارب المائل (فوقه أو تحته).",
    description_fr: "Déterminer les asymptotes verticales, horizontales et obliques, puis étudier la position du courbe par rapport à son asymptote oblique.",
    dimensions: ["knowledge", "application"],
    repairStrategy_ar: "المقارب الرأسي عند نقاط انعدام المقام، الأفقي عند نهاية الدالة عند ±∞، والمائل بحساب m = lim(f(x)/x) ثم p = lim(f(x)−mx).",
    repairStrategy_fr: "Asymptote verticale aux zéros du dénominateur, horizontale par la limite en ±∞, oblique via m = lim f(x)/x puis p = lim(f(x) − mx).",
    repairSteps_ar: [
      "المقارب الرأسي: حل المعادلة (مقام = 0) وتحقق أن النهاية عندها ±∞.",
      "المقارب الأفقي: احسب lim f(x) عند x→+∞ وx→−∞، فإن كانت قيمة محدودة L فـ y = L مقارب أفقي.",
      "المقارب المائل: احسب m = lim(f(x)/x)، ثم p = lim(f(x) − mx)؛ المعادلة: y = mx + p.",
      "الوضع النسبي: ادرس إشارة f(x) − (mx + p) لتحديد موضع المنحنى فوق أو تحت المقارب المائل.",
    ],
    repairSteps_fr: [
      "Asymptote verticale : résoudre dénominateur = 0 et vérifier que la limite est ±∞.",
      "Asymptote horizontale : calculer la limite en ±∞ ; si elle est finie L, alors y = L est asymptote.",
      "Asymptote oblique : m = lim f(x)/x en ±∞, puis p = lim(f(x) − mx).",
      "Position relative : étudier le signe de f(x) − (mx + p) pour déterminer si la courbe est au-dessus ou en-dessous.",
    ],
  },

  math_functions_intermediate_value_theorem: {
    id: "math_functions_intermediate_value_theorem",
    subjectId: "math",
    title_ar: "مبرهنة القيم المتوسطة وحصر حلول المعادلات",
    title_fr: "Théorème des Valeurs Intermédiaires (TVI) : encadrement des solutions",
    description_ar: "توظيف TVI لإثبات وجود حل للمعادلة f(x)=k في مجال [a,b] والتمييز بين الوجود والوحدانية بشرط الرتابة التامة.",
    description_fr: "Appliquer le TVI pour prouver l'existence d'un antécédent et distinguer existence/unicité selon la stricte monotonie.",
    dimensions: ["understanding", "methodology"],
    repairStrategy_ar: "التحقق من ثلاثة شروط: استمرار f على [a,b] + f(a) و f(b) يحصران k + رتابة تامة للوحدانية.",
    repairStrategy_fr: "Vérifier trois conditions : continuité sur [a,b] + encadrement de k par f(a) et f(b) + stricte monotonie pour l'unicité.",
    repairSteps_ar: [
      "أثبت استمرار الدالة f على المجال المغلق [a, b] (ذكر نوع الدالة كافٍ للدوال المألوفة).",
      "احسب f(a) و f(b) وتحقق أن k محصور بينهما: (f(a) < k < f(b)) أو العكس.",
      "استنتج وجود عدد c في ]a, b[ بحيث f(c) = k بموجب مبرهنة القيم المتوسطة.",
      "للوحدانية: أثبت أن f رتيبة تماماً على [a, b]، ثم صغ: 'المعادلة تقبل حلاً وحيداً α في المجال ]a,b['.",
    ],
    repairSteps_fr: [
      "Justifier la continuité de f sur [a, b] en précisant la nature de la fonction.",
      "Calculer f(a) et f(b) et encadrer k : f(a) < k < f(b) ou inversement.",
      "Conclure l'existence de c dans ]a, b[ tel que f(c) = k par le TVI.",
      "Pour l'unicité : montrer la stricte monotonie sur [a, b] et conclure avec la formulation standard du barème.",
    ],
  },

  math_intermediate_value_method: {
    id: "math_intermediate_value_method",
    subjectId: "math",
    title_ar: "مبرهنة القيم المتوسطة والتمييز بين الوجود والوحدانية",
    title_fr: "Théorème des Valeurs Intermédiaires (TVI) : Existence vs Unicité",
    description_ar: "الضبط المنهجي الصارم لتطبيق مبرهنة القيم المتوسطة: متى نكتفي بالاستمرار ومتى نشترط الرتابة التامة.",
    description_fr: "Application rigoureuse du TVI : distinguer l'existence de solution et l'unicité stricte.",
    dimensions: ["understanding", "methodology"],
    repairStrategy_ar: "التحقق المنهجي من شرط الاستمرار وحساب f(a)·f(b) للوجود، وإضافة الرتابة التامة للوحدانية.",
    repairStrategy_fr: "Vérifier la continuité et le changement de signe pour l'existence, ajouter la stricte monotonie pour l'unicité.",
    repairSteps_ar: [
      "أثبت استمرار الدالة f على المجال [a, b] (غالباً كدالة مألوفة أو مجموع/جداء).",
      "احسب f(a) و f(b) وتحقق من أن f(a) · f(b) < 0 (أو k محصور بينهما).",
      "للتحقق من وجود حل وحيد: اذكر واثبت أن f رتيبة تماماً (متزايدة تماماً أو متناقصة تماماً).",
      "صغ النتيجة بنص صريح: 'حسب مبرهنة القيم المتوسطة، المعادلة تقبل حلاً وحيداً α في المجال'.",
    ],
    repairSteps_fr: [
      "Justifier la continuité de f sur [a, b].",
      "Calculer f(a) et f(b) et vérifier que le produit est strictement négatif.",
      "Préciser la stricte monotonie pour conclure à l'unicité de la solution alpha.",
      "Rédiger la conclusion conformément aux exigences du barème ministériel.",
    ],
  },

  math_sequence_reasoning: {
    id: "math_sequence_reasoning",
    subjectId: "math",
    title_ar: "الاستدلال بالمتتاليات ونهايات المتتاليات التراجعية",
    title_fr: "Raisonnement sur les suites et calcul des limites",
    description_ar: "حساب نهاية المتتالية المعرفة بعلاقة تراجعية u_(n+1) = f(u_n) وربط التقارب بالرتابة والمحدودية.",
    description_fr: "Calcul de limite pour les suites récurrentes u_(n+1) = f(u_n) et convergence.",
    dimensions: ["application", "understanding"],
    repairStrategy_ar: "استخدام مبرهنة التقارب (رتيبة ومحدودة) ثم حل المعادلة f(L) = L لتحديد النهاية بدقة.",
    repairStrategy_fr: "Vérifier la convergence (bornée et monotone) puis résoudre f(L) = L.",
    repairSteps_ar: [
      "برهن على التقارب أولاً: (متزايدة ومحدودة من الأعلى أو متناقصة ومحدودة من الأسفل).",
      "ضع النهاية المفترضة L بحيث lim u_n = L.",
      "حل المعادلة f(L) = L للحصول على القيمة الدقيقة للنهاية.",
      "ارفض الحلول التي لا تنتمي لمجال قيم حدود المتتالية إن وجدت.",
    ],
    repairSteps_fr: [
      "Justifier la convergence de la suite (monotone et bornée).",
      "Poser la limite L telle que lim u_n = L.",
      "Résoudre l'équation du point fixe f(L) = L.",
      "Valider la solution compatible avec l'encadrement des termes de la suite.",
    ],
  },

  // ---------------------------------------------------------------------------
  // COMPLEX NUMBERS & POINT TRANSFORMATIONS SKILLS
  // ---------------------------------------------------------------------------
  math_complex_forms: {
    id: "math_complex_forms",
    subjectId: "math",
    title_ar: "\u0627\u0644\u0623\u0634\u0643\u0627\u0644 \u0627\u0644\u062c\u0628\u0631\u064a\u0629 \u0648\u0627\u0644\u0645\u062b\u0644\u062b\u064a\u0629 \u0648\u0627\u0644\u0623\u0633\u064a\u0629 \u0644\u0644\u0623\u0639\u062f\u0627\u062f \u0627\u0644\u0645\u0631\u0643\u0628\u0629",
    title_fr: "Formes alg\u00e9brique, trigonom\u00e9trique et exponentielle des nombres complexes",
    description_ar: "\u0625\u062a\u0642\u0627\u0646 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0628\u064a\u0646 \u0627\u0644\u0623\u0634\u0643\u0627\u0644 \u0627\u0644\u062b\u0644\u0627\u062b\u0629 \u0648\u062d\u0633\u0627\u0628 \u0627\u0644\u0637\u0648\u064a\u0644\u0629 \u0648\u0627\u0644\u0639\u0645\u062f\u0629 \u0628\u062f\u0642\u0629\u060c \u0645\u0639 \u062a\u0637\u0628\u064a\u0642 \u0635\u064a\u063a\u0629 \u062f\u064a\u0645\u0648\u0627\u0641\u0631 \u0644\u062d\u0633\u0627\u0628 \u0627\u0644\u0642\u0648\u0649.",
    description_fr: "Ma\u00eetriser la conversion entre les trois formes d'un nombre complexe et le calcul du module/argument, avec application de la formule de De Moivre pour les puissances.",
    dimensions: ["knowledge", "application", "understanding"],
    repairStrategy_ar: "\u0625\u062a\u0642\u0627\u0646 \u0627\u0644\u062d\u0633\u0627\u0628 \u0627\u0644\u062f\u0642\u064a\u0642 \u0644\u0644\u0645\u0631\u0627\u0641\u0642 \u0648\u0627\u0644\u0637\u0648\u064a\u0644\u0629\u060c \u0648\u0627\u0644\u0631\u0628\u0637 \u0627\u0644\u062d\u062a\u0645\u064a \u0628\u064a\u0646 \u0625\u0634\u0627\u0631\u0627\u062a cos \u0648 sin \u0648\u0645\u0648\u0642\u0639 \u0627\u0644\u0632\u0627\u0648\u064a\u0629 \u0639\u0644\u0649 \u0627\u0644\u062f\u0627\u0626\u0631\u0629 \u0627\u0644\u0645\u062b\u0644\u062b\u064a\u0629 \u0644\u062a\u0641\u0627\u062f\u064a \u0623\u062e\u0637\u0627\u0621 \u0627\u0644\u0639\u0645\u062f\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629 \u0641\u064a \u0627\u0644\u0628\u0643\u0627\u0644\u0648\u0631\u064a\u0627.",
    repairStrategy_fr: "Ma\u00eetriser le calcul du conjugu\u00e9 et du module, et utiliser le cercle trigonom\u00e9trique pour d\u00e9terminer l'argument exact sans erreur de signe.",
    repairSteps_ar: [
      "\u062a\u062d\u062f\u064a\u062f \u0627\u0644\u062c\u0632\u0621 \u0627\u0644\u062d\u0642\u064a\u0642\u064a Re(z) \u0648\u0627\u0644\u062c\u0632\u0621 \u0627\u0644\u062a\u062e\u064a\u0644\u064a Im(z) \u0648\u0627\u0644\u062a\u062e\u0644\u0635 \u0645\u0646 i \u0641\u064a \u0627\u0644\u0645\u0642\u0627\u0645 \u0628\u0627\u0644\u0636\u0631\u0628 \u0641\u064a \u0627\u0644\u0645\u0631\u0627\u0641\u0642.",
      "\u062d\u0633\u0627\u0628 \u0627\u0644\u0637\u0648\u064a\u0644\u0629 \u0628\u062f\u0642\u0629: |z| = \u221a(x\u00b2 + y\u00b2) \u0648\u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0643\u0648\u0646\u0647\u0627 \u0645\u0648\u062c\u0628\u0629 \u062a\u0645\u0627\u0645\u0627\u064b \u0644\u0640 z \u2260 0.",
      "\u062a\u0639\u064a\u064a\u0646 \u0627\u0644\u0639\u0645\u062f\u0629 arg(z) \u0639\u0628\u0631 \u062d\u0644 \u062c\u0645\u0644\u0629: cos \u03b8 = x/|z| \u0648 sin \u03b8 = y/|z| \u0645\u0639 \u0645\u0631\u0627\u0639\u0627\u0629 \u0627\u0644\u0631\u0628\u0639 \u0627\u0644\u0645\u0646\u0627\u0633\u0628 \u0639\u0644\u0649 \u0627\u0644\u062f\u0627\u0626\u0631\u0629 \u0627\u0644\u0645\u062b\u0644\u062b\u064a\u0629.",
      "\u0627\u0644\u0627\u0646\u062a\u0642\u0627\u0644 \u0627\u0644\u0633\u0644\u064a\u0645 \u0628\u064a\u0646 \u0627\u0644\u0634\u0643\u0644 \u0627\u0644\u0645\u062b\u0644\u062b\u064a [r(cos\u03b8 + i\u00b7sin\u03b8)] \u0648\u0627\u0644\u0623\u0633\u064a r\u00b7e^(i\u03b8) \u0648\u062a\u0637\u0628\u064a\u0642 \u062e\u0648\u0627\u0635 \u0642\u0648\u0649 \u062f\u064a\u0645\u0648\u0627\u0641\u0631 (z^n).",
    ],
    repairSteps_fr: [
      "Identifier Re(z) et Im(z), et \u00e9liminer i du d\u00e9nominateur en multipliant par le conjugu\u00e9.",
      "Calculer le module avec pr\u00e9cision: |z| = \u221a(x\u00b2 + y\u00b2) en v\u00e9rifiant qu'il est strictement positif.",
      "D\u00e9terminer l'argument arg(z) via cos \u03b8 = x/|z| et sin \u03b8 = y/|z| selon le quadrant.",
      "Convertir rigoureusement entre les formes trigonom\u00e9trique et exponentielle, et appliquer De Moivre.",
    ],
  },

  math_complex_equations: {
    id: "math_complex_equations",
    subjectId: "math",
    title_ar: "\u062d\u0644 \u0627\u0644\u0645\u0639\u0627\u062f\u0644\u0627\u062a \u0641\u064a \u0645\u062c\u0645\u0648\u0639\u0629 \u0627\u0644\u0623\u0639\u062f\u0627\u062f \u0627\u0644\u0645\u0631\u0643\u0628\u0629 C",
    title_fr: "R\u00e9solution des \u00e9quations dans l'ensemble des nombres complexes C",
    description_ar: "\u062d\u0633\u0627\u0628 \u0627\u0644\u0645\u0645\u064a\u0632 \u0641\u064a C \u0648\u0627\u0633\u062a\u062e\u0631\u0627\u062c \u062c\u0630\u0648\u0631\u0647 \u0627\u0644\u062a\u0631\u0628\u064a\u0639\u064a\u0629 \u0648\u062a\u062d\u0644\u064a\u0644 \u0643\u062b\u064a\u0631\u0627\u062a \u0627\u0644\u062d\u062f\u0648\u062f \u0639\u0628\u0631 \u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0623\u0648 \u062e\u0648\u0627\u0631\u0632\u0645\u064a\u0629 \u0647\u0648\u0631\u0646\u0631.",
    description_fr: "Calculer le discriminant dans C, extraire ses racines carr\u00e9es et factoriser les polyn\u00f4mes par identification ou l'algorithme de Horner.",
    dimensions: ["application", "methodology"],
    repairStrategy_ar: "\u0627\u0644\u062a\u0631\u0643\u064a\u0632 \u0639\u0644\u0649 \u062a\u0641\u0643\u064a\u0643 \u0627\u0644\u0645\u0639\u0627\u062f\u0644\u0627\u062a \u0628\u0627\u0644\u062a\u062d\u0644\u064a\u0644 \u0648\u0643\u062a\u0627\u0628\u0629 \u0627\u0644\u062c\u0630\u0648\u0631 \u0627\u0644\u062a\u0631\u0628\u064a\u0639\u064a\u0629 \u0628\u062f\u0642\u0629\u060c \u0648\u062a\u0641\u0627\u062f\u064a \u0641\u062e \u0646\u0633\u064a\u0627\u0646 i \u0639\u0646\u062f \u0643\u062a\u0627\u0628\u0629 \u0627\u0644\u062d\u0644\u0648\u0644 \u0641\u064a \u062d\u0627\u0644\u0629 \u0627\u0644\u0645\u0645\u064a\u0632 \u0627\u0644\u0633\u0627\u0644\u0628.",
    repairStrategy_fr: "Se concentrer sur la factorisation m\u00e9thodique et l'extraction des racines carr\u00e9es dans C en \u00e9vitant les erreurs de signe sur le discriminant.",
    repairSteps_ar: [
      "\u062a\u062d\u062f\u064a\u062f \u0645\u0639\u0627\u0645\u0644\u0627\u062a \u0627\u0644\u0645\u0639\u0627\u062f\u0644\u0629 \u0628\u062f\u0642\u0629\u060c \u0648\u062d\u0633\u0627\u0628 \u0627\u0644\u0645\u0645\u064a\u0632 \u0394 \u0641\u064a C \u0648\u0627\u0633\u062a\u062e\u0631\u0627\u062c \u062c\u0630\u0631\u064a\u0647 \u0627\u0644\u062a\u0631\u0628\u064a\u0639\u064a\u064a\u0646 \u03b4.",
      "\u0643\u062a\u0627\u0628\u0629 \u0627\u0644\u062d\u0644\u0648\u0644 \u0627\u0644\u0645\u0631\u0643\u0628\u0629 \u0627\u0644\u0645\u062a\u0631\u0627\u0641\u0642\u0629 \u0628\u062f\u0642\u0629 \u0641\u064a \u062d\u0627\u0644\u0629 \u0627\u0644\u0645\u0645\u064a\u0632 \u0627\u0644\u0633\u0627\u0644\u0628: z = (-b \u00b1 i\u221a(-\u0394)) / (2a).",
      "\u0645\u0639\u0627\u0644\u062c\u0629 \u0645\u0639\u0627\u062f\u0644\u0627\u062a \u0627\u0644\u062f\u0631\u062c\u0627\u062a \u0627\u0644\u0623\u0639\u0644\u0649 \u0639\u0628\u0631 \u0627\u0644\u062a\u062d\u0644\u064a\u0644 \u0628\u0627\u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0623\u0648 \u062e\u0648\u0627\u0631\u0632\u0645\u064a\u0629 \u0647\u0648\u0631\u0646\u0631 \u0628\u0639\u062f \u0625\u064a\u062c\u0627\u062f \u0627\u0644\u062d\u0644 \u0627\u0644\u0638\u0627\u0647\u0631.",
      "\u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0635\u062d\u0629 \u0627\u0644\u062d\u0644\u0648\u0644 \u0639\u0628\u0631 \u0645\u062c\u0645\u0648\u0639 \u0648\u062c\u062f\u0627\u0621 \u0627\u0644\u062c\u0630\u0631\u064a\u0646 (S = -b/a \u0648 P = c/a).",
    ],
    repairSteps_fr: [
      "Identifier les coefficients et calculer le discriminant \u0394 dans C pour extraire ses racines carr\u00e9es \u03b4.",
      "Exprimer les solutions complexes conjugu\u00e9es pour \u0394 < 0: z = (-b \u00b1 i\u221a(-\u0394)) / (2a).",
      "Factoriser les \u00e9quations de degr\u00e9 sup\u00e9rieur via identification ou Horner apr\u00e8s la racine \u00e9vidente.",
      "V\u00e9rifier les solutions trouv\u00e9es avec la somme et le produit des racines (S = -b/a, P = c/a).",
    ],
  },

  math_complex_geometry: {
    id: "math_complex_geometry",
    subjectId: "math",
    title_ar: "\u0627\u0644\u062a\u0641\u0633\u064a\u0631 \u0627\u0644\u0647\u0646\u062f\u0633\u064a \u0644\u0644\u0623\u0639\u062f\u0627\u062f \u0627\u0644\u0645\u0631\u0643\u0628\u0629 \u0648\u0637\u0628\u064a\u0639\u0629 \u0627\u0644\u0645\u062b\u0644\u062b\u0627\u062a \u0648\u0627\u0644\u0631\u0628\u0627\u0639\u064a\u0627\u062a",
    title_fr: "Interpr\u00e9tation g\u00e9om\u00e9trique des nombres complexes et nature des triangles et quadrilat\u00e8res",
    description_ar: "\u062a\u0648\u0638\u064a\u0641 \u0627\u0644\u0646\u0633\u0628\u0629 \u0627\u0644\u0645\u0631\u0643\u0628\u0629 Z = (z_C - z_A)/(z_B - z_A) \u0644\u0627\u0633\u062a\u0646\u062a\u0627\u062c \u0637\u0628\u064a\u0639\u0629 \u0627\u0644\u0623\u0634\u0643\u0627\u0644 \u0627\u0644\u0647\u0646\u062f\u0633\u064a\u0629 \u0645\u0646 \u0637\u0648\u064a\u0644\u0629 Z \u0648\u0639\u0645\u062f\u062a\u0647.",
    description_fr: "Utiliser le rapport complexe Z = (z_C - z_A)/(z_B - z_A) pour d\u00e9duire la nature g\u00e9om\u00e9trique des figures \u00e0 partir du module et de l'argument de Z.",
    dimensions: ["understanding", "application", "methodology"],
    repairStrategy_ar: "\u0627\u0644\u062a\u062f\u0631\u064a\u0628 \u0639\u0644\u0649 \u0627\u0644\u0631\u0628\u0637 \u0627\u0644\u0645\u064a\u0643\u0627\u0646\u064a\u0643\u064a \u0628\u064a\u0646 \u0646\u062a\u0627\u0626\u062c \u0627\u0644\u0646\u0633\u0628\u0629 (\u0645\u062b\u0644 i \u0623\u0648 e^(i\u03c0/3) \u0623\u0648 \u0639\u062f\u062f \u062d\u0642\u064a\u0642\u064a) \u0648\u0627\u0644\u062f\u0644\u0627\u0644\u0629 \u0627\u0644\u0647\u0646\u062f\u0633\u064a\u0629 \u0627\u0644\u0645\u0628\u0627\u0634\u0631\u0629.",
    repairStrategy_fr: "Associer syst\u00e9matiquement la forme de Z (ex: purement imaginaire, e^(i\u03c0/3)) avec la conclusion g\u00e9om\u00e9trique (orthogonalit\u00e9, triangle \u00e9quilat\u00e9ral, alignement).",
    repairSteps_ar: [
      "\u062d\u0633\u0627\u0628 \u0627\u0644\u0646\u0633\u0628\u0629 \u0627\u0644\u0645\u0631\u0643\u0628\u0629 Z = (z_C - z_A) / (z_B - z_A) \u0648\u0643\u062a\u0627\u0628\u062a\u0647\u0627 \u0639\u0644\u0649 \u0627\u0644\u0634\u0643\u0644\u064a\u0646 \u0627\u0644\u062c\u0628\u0631\u064a \u0648\u0627\u0644\u0623\u0633\u064a.",
      "\u062a\u0631\u062c\u0645\u0629 \u0627\u0644\u0637\u0648\u064a\u0644\u0629 |Z| \u0625\u0644\u0649 \u0646\u0633\u0628\u0629 \u0623\u0637\u0648\u0627\u0644 \u0647\u0646\u062f\u0633\u064a\u0629: AC / AB.",
      "\u062a\u0631\u062c\u0645\u0629 \u0627\u0644\u0639\u0645\u062f\u0629 arg(Z) \u0625\u0644\u0649 \u0642\u064a\u0633 \u0627\u0644\u0632\u0627\u0648\u064a\u0629 \u0627\u0644\u0645\u0648\u062c\u0647\u0629: (\u0041\u0042\u20d7, \u0041\u0043\u20d7) [2\u03c0].",
      "\u0627\u0633\u062a\u0646\u062a\u0627\u062c \u0637\u0628\u064a\u0639\u0629 \u0627\u0644\u0645\u062b\u0644\u062b (\u0642\u0627\u0626\u0645\u060c \u0645\u062a\u0633\u0627\u0648\u064a \u0627\u0644\u0633\u0627\u0642\u064a\u0646\u060c \u0645\u062a\u0642\u0627\u064a\u0633 \u0627\u0644\u0623\u0636\u0644\u0627\u0639) \u0623\u0648 \u0627\u0644\u0631\u0628\u0627\u0639\u064a \u0628\u0646\u0627\u0621\u064b \u0639\u0644\u0649 |Z| \u0648 arg(Z).",
    ],
    repairSteps_fr: [
      "Calculer le rapport complexe Z = (z_C - z_A) / (z_B - z_A) sous forme alg\u00e9brique et exponentielle.",
      "Interpr\u00e9ter le module |Z| en tant que rapport de distances g\u00e9om\u00e9triques: AC / AB.",
      "Interpr\u00e9ter l'argument arg(Z) comme mesure de l'angle orient\u00e9: (AB\u20d7, AC\u20d7) [2\u03c0].",
      "D\u00e9duire rigoureusement la nature du triangle ou du quadrilat\u00e8re selon |Z| et arg(Z).",
    ],
  },

  math_complex_transformations: {
    id: "math_complex_transformations",
    subjectId: "math",
    title_ar: "\u0627\u0644\u062a\u062d\u0648\u064a\u0644\u0627\u062a \u0627\u0644\u0646\u0642\u0637\u064a\u0629 \u0641\u064a \u0627\u0644\u0645\u0633\u062a\u0648\u064a \u0627\u0644\u0645\u0631\u0643\u0628 (\u0627\u0644\u0627\u0646\u0633\u062d\u0627\u0628\u060c \u0627\u0644\u062a\u062d\u0627\u0643\u064a\u060c \u0627\u0644\u062f\u0648\u0631\u0627\u0646)",
    title_fr: "Transformations ponctuelles dans le plan complexe (translation, homoth\u00e9tie, rotation)",
    description_ar: "\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0639\u0628\u0627\u0631\u0629 z' = a\u00b7z + b \u0648\u062a\u0635\u0646\u064a\u0641 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 (\u0627\u0646\u0633\u062d\u0627\u0628 \u0623\u0648 \u062a\u062d\u0627\u0643\u064a \u0623\u0648 \u062f\u0648\u0631\u0627\u0646) \u0645\u0646 \u0637\u0628\u064a\u0639\u0629 \u0627\u0644\u0645\u0639\u0627\u0645\u0644 a \u0648\u062a\u0639\u064a\u064a\u0646 \u0639\u0646\u0627\u0635\u0631\u0647 \u0628\u0648\u0627\u0633\u0637\u0629 \u0645\u0639\u0627\u062f\u0644\u0629 \u0627\u0644\u0646\u0642\u0637\u0629 \u0627\u0644\u0635\u0627\u0645\u062f\u0629.",
    description_fr: "Lire l'\u00e9criture z' = a\u00b7z + b et classifier la transformation selon la nature de a (module et argument) pour d\u00e9terminer ses \u00e9l\u00e9ments caract\u00e9ristiques.",
    dimensions: ["knowledge", "application", "methodology"],
    repairStrategy_ar: "\u062a\u0635\u0646\u064a\u0641 \u0627\u0644\u062a\u062d\u0648\u064a\u0644 \u0627\u0644\u0646\u0642\u0637\u064a \u0641\u0648\u0631\u0627\u064b \u0627\u0646\u0637\u0644\u0627\u0642\u0627\u064b \u0645\u0646 \u0637\u0628\u064a\u0639\u0629 \u0648\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u0639\u0627\u0645\u0644 a (\u0637\u0648\u064a\u0644\u062a\u0647 \u0648\u0639\u0645\u062f\u062a\u0647)\u060c \u062b\u0645 \u062d\u0633\u0627\u0628 \u0644\u0627\u062d\u0642\u0629 \u0627\u0644\u0645\u0631\u0643\u0632 \u0639\u0628\u0631 \u0645\u0639\u0627\u062f\u0644\u0629 \u0627\u0644\u0646\u0642\u0637\u0629 \u0627\u0644\u0635\u0627\u0645\u062f\u0629 \u062f\u0648\u0646 \u062d\u0641\u0638 \u0639\u0634\u0648\u0627\u0626\u064a.",
    repairStrategy_fr: "Classifier la transformation selon la nature de a (module et argument), puis calculer l'affixe du centre via le point invariant z = az + b.",
    repairSteps_ar: [
      "\u0642\u0631\u0627\u0621\u0629 \u0627\u0644\u0639\u0628\u0627\u0631\u0629 \u0627\u0644\u0645\u0631\u0643\u0628\u0629 z' = a\u00b7z + b \u0648\u0627\u0633\u062a\u062e\u0631\u0627\u062c \u0627\u0644\u0645\u0639\u0627\u0645\u0644 a \u0648\u0627\u0644\u0639\u062f\u062f b.",
      "\u0625\u0630\u0627 \u0643\u0627\u0646 a = 1: \u0627\u0644\u0627\u0633\u062a\u0646\u062a\u0627\u062c \u0627\u0644\u0645\u0628\u0627\u0634\u0631 \u0623\u0646\u0647 \u0627\u0646\u0633\u062d\u0627\u0628 \u0634\u0639\u0627\u0639\u0647 u\u20d7 \u0644\u0627\u062d\u0642\u062a\u0647 b.",
      "\u0625\u0630\u0627 \u0643\u0627\u0646 a \u2208 R* \\ {1}: \u062a\u062d\u0627\u0643\u064a \u0646\u0633\u0628\u062a\u0647 k = a \u0648\u0645\u0631\u0643\u0632\u0647 \u0627\u0644\u0646\u0642\u0637\u0629 \u0627\u0644\u0635\u0627\u0645\u062f\u0629 \u03c9 = b / (1 - a).",
      "\u0625\u0630\u0627 \u0643\u0627\u0646 |a| = 1 \u0648 a \u2260 1 (a = e^(i\u03b8)): \u062f\u0648\u0631\u0627\u0646 \u0632\u0627\u0648\u064a\u062a\u0647 \u03b8 = arg(a) \u0648\u0645\u0631\u0643\u0632\u0647 \u03c9 = b / (1 - a).",
    ],
    repairSteps_fr: [
      "Analyser l'\u00e9criture complexe z' = a\u00b7z + b et extraire les constantes a et b.",
      "Si a = 1 : d\u00e9duire qu'il s'agit d'une translation de vecteur d'affixe b.",
      "Si a \u2208 R* \\ {1} : d\u00e9duire une homoth\u00e9tie de rapport k = a et de centre invariant \u03c9 = b / (1 - a).",
      "Si |a| = 1 et a \u2260 1 (a = e^(i\u03b8)) : d\u00e9duire une rotation d'angle \u03b8 = arg(a) et de centre \u03c9 = b / (1 - a).",
    ],
  },

  // ---------------------------------------------------------------------------
  // INTEGRATION & DIFFERENTIAL EQUATIONS SKILLS
  // ---------------------------------------------------------------------------
  math_primitives_basics: {
    id: "math_primitives_basics",
    subjectId: "math",
    title_ar: "\u0627\u0644\u062f\u0648\u0627\u0644 \u0627\u0644\u0623\u0635\u0644\u064a\u0629 \u0648\u062d\u0633\u0627\u0628 \u0627\u0644\u062f\u0648\u0627\u0644 \u0627\u0644\u0645\u0634\u062a\u0642\u0629 \u0627\u0644\u0639\u0643\u0633\u064a\u0629",
    title_fr: "Primitives usuelles et calcul de la fonction r\u00e9ciproque",
    description_ar: "\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u062f\u0648\u0627\u0644 \u0645\u0639 \u0623\u0634\u0643\u0627\u0644\u0647\u0627 \u0627\u0644\u0634\u0647\u064a\u0631\u0629 (u'\u00b7u^n \u0623\u0648 u'/u \u0623\u0648 u'\u00b7e^u) \u0648\u0645\u0648\u0627\u0632\u0646\u0629 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062a \u0644\u0625\u064a\u062c\u0627\u062f \u0627\u0644\u062f\u0627\u0644\u0629 \u0627\u0644\u0623\u0635\u0644\u064a\u0629 F(x).",
    description_fr: "Identifier la forme u'\u00b7u^n, u'/u ou u'\u00b7e^u et ajuster les constantes pour d\u00e9terminer la primitive exacte F(x).",
    dimensions: ["application", "methodology"],
    repairStrategy_ar: "\u0627\u0644\u0628\u062d\u062b \u062f\u0627\u0626\u0645\u0627\u064b \u0639\u0646 \u0645\u0634\u062a\u0642\u0629 \u0645\u0627 \u0628\u062f\u0627\u062e\u0644 \u0627\u0644\u0642\u0648\u0633 \u0623\u0648 \u0627\u0644\u0645\u0642\u0627\u0645 \u0623\u0648 \u0627\u0644\u0623\u0633 \u0623\u0648\u0644\u0627\u064b\u060c \u0648\u0645\u0648\u0627\u0632\u0646\u0629 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062a \u0627\u0644\u0639\u062f\u062f\u064a\u0629 \u0628\u062f\u0642\u0629 \u0642\u0628\u0644 \u0643\u062a\u0627\u0628\u0629 \u0627\u0644\u0639\u0628\u0627\u0631\u0629 \u0627\u0644\u0623\u0635\u0644\u064a\u0629.",
    repairStrategy_fr: "Rechercher syst\u00e9matiquement la d\u00e9riv\u00e9e interne et \u00e9quilibrer les coefficients scalaires avant d'int\u00e9grer.",
    repairSteps_ar: [
      "\u062a\u062d\u062f\u064a\u062f \u0634\u0643\u0644 \u0627\u0644\u0639\u0628\u0627\u0631\u0629 \u0648\u0645\u0637\u0627\u0628\u0642\u062a\u0647\u0627 \u0645\u0639 \u0627\u0644\u0642\u0648\u0627\u0646\u064a\u0646 \u0627\u0644\u0634\u0647\u064a\u0631\u0629: u'\u00b7u^n \u0623\u0648 u'/u \u0623\u0648 u'\u00b7e^u.",
      "\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0627\u062a \u0627\u0644\u062b\u0627\u0628\u062a\u0629 \u0639\u0628\u0631 \u0627\u0644\u0636\u0631\u0628 \u0648\u0627\u0644\u0642\u0633\u0645\u0629 \u0639\u0644\u0649 \u0639\u062f\u062f \u062d\u0642\u064a\u0642\u064a \u0644\u0636\u0628\u0637 \u0645\u0634\u062a\u0642\u0629 u'(x) \u062e\u0627\u0631\u062c \u0627\u0644\u0642\u0648\u0633.",
      "\u062a\u0637\u0628\u064a\u0642 \u0642\u0627\u0646\u0648\u0646 \u0627\u0644\u062f\u0627\u0644\u0629 \u0627\u0644\u0623\u0635\u0644\u064a\u0629 \u0628\u062f\u0642\u0629: (1/(n+1))\u00b7u^(n+1) \u0623\u0648 ln|u| \u0623\u0648 e^u.",
      "\u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u062b\u0627\u0628\u062a \u0627\u0644\u062d\u0642\u064a\u0642\u064a C\u060c \u0623\u0648 \u062a\u0639\u064a\u064a\u0646 \u0642\u064a\u0645\u062a\u0647 \u0628\u062f\u0642\u0629 \u0625\u0630\u0627 \u0623\u064f\u0639\u0637\u064a \u0634\u0631\u0637 \u0627\u0628\u062a\u062f\u0627\u0626\u064a F(x\u2080) = y\u2080.",
    ],
    repairSteps_fr: [
      "Identifier la forme de l'expression selon les r\u00e8gles usuelles: u'\u00b7u^n, u'/u ou u'\u00b7e^u.",
      "Ajuster les constantes par multiplication/division pour faire appara\u00eetre la d\u00e9riv\u00e9e u'(x).",
      "Appliquer rigoureusement la primitive correspondante: (1/(n+1))\u00b7u^(n+1), ln|u| ou e^u.",
      "Ajouter la constante C, ou calculer sa valeur exacte selon la condition initiale F(x\u2080) = y\u2080.",
    ],
  },

  math_integration_by_parts: {
    id: "math_integration_by_parts",
    subjectId: "math",
    title_ar: "\u0627\u0644\u0645\u0643\u0627\u0645\u0644\u0629 \u0628\u0627\u0644\u062a\u062c\u0632\u0626\u0629 \u0648\u062a\u0637\u0628\u064a\u0642\u0627\u062a\u0647\u0627",
    title_fr: "Int\u00e9gration par parties et applications",
    description_ar: "\u062a\u0637\u0628\u064a\u0642 \u062f\u0633\u062a\u0648\u0631 \u0627\u0644\u062a\u062c\u0632\u0626\u0629 \u0628\u0627\u062e\u062a\u064a\u0627\u0631 \u0635\u062d\u064a\u062d \u0644\u0640 u \u0648 v' \u0648\u0641\u0642 \u0642\u0627\u0639\u062f\u0629 ALPES\u060c \u0645\u0639 \u0645\u0631\u0627\u0642\u0628\u0629 \u062f\u0642\u064a\u0642\u0629 \u0644\u0644\u0625\u0634\u0627\u0631\u0627\u062a \u0648\u0627\u0644\u062d\u062f\u0648\u062f.",
    description_fr: "Appliquer la formule d'int\u00e9gration par parties en choisissant u et v' selon la r\u00e8gle ALPES, avec une rigueur sur les signes et les bornes.",
    dimensions: ["application", "methodology", "understanding"],
    repairStrategy_ar: "\u062a\u062d\u062f\u064a\u062f \u0627\u0644\u062f\u0627\u0644\u0629 \u0627\u0644\u0645\u0631\u0627\u062f \u0627\u0634\u062a\u0642\u0627\u0642\u0647\u0627 \u0628\u062f\u0642\u0629 \u0644\u062a\u0628\u0633\u064a\u0637 \u0627\u0644\u062a\u0643\u0627\u0645\u0644 \u0627\u0644\u062b\u0627\u0646\u0648\u064a\u060c \u0648\u0627\u0644\u062a\u062d\u0642\u0642 \u0627\u0644\u0645\u0633\u062a\u0645\u0631 \u0645\u0646 \u0627\u0644\u0625\u0634\u0627\u0631\u0629 \u0627\u0644\u0633\u0627\u0644\u0628\u0629 \u0642\u0628\u0644 \u0627\u0644\u062a\u0643\u0627\u0645\u0644 \u0627\u0644\u062b\u0627\u0646\u064a.",
    repairStrategy_fr: "S\u00e9lectionner judicieusement la fonction \u00e0 d\u00e9river pour simplifier la seconde int\u00e9grale et surveiller le signe n\u00e9gatif.",
    repairSteps_ar: [
      "\u0627\u062e\u062a\u064a\u0627\u0631 \u0627\u0644\u062f\u0627\u0644\u062a\u064a\u0646 u(x) \u0648 v'(x) \u0648\u0641\u0642 \u0642\u0627\u0639\u062f\u0629 \u0627\u0644\u0623\u0633\u0628\u0642\u064a\u0629 ALPES: \u0627\u0644\u0644\u0648\u063a\u0627\u0631\u064a\u062a\u0645\u060c \u0643\u062b\u064a\u0631 \u0627\u0644\u062d\u062f\u0648\u062f\u060c \u0627\u0644\u0623\u0633\u064a.",
      "\u0627\u0634\u062a\u0642\u0627\u0642 u(x) \u0644\u0625\u064a\u062c\u0627\u062f u'(x)\u060c \u0648\u0625\u064a\u062c\u0627\u062f \u062f\u0627\u0644\u0629 \u0623\u0635\u0644\u064a\u0629 v(x) \u0645\u0646 v'(x).",
      "\u062a\u0637\u0628\u064a\u0642 \u062f\u0633\u062a\u0648\u0631 \u0627\u0644\u0645\u0643\u0627\u0645\u0644\u0629 \u0628\u0627\u0644\u062a\u062c\u0632\u0626\u0629 \u0628\u062f\u0642\u0629: \u222b[a,b] u\u00b7v' = [u\u00b7v][a,b] \u2212 \u222b[a,b] u'\u00b7v.",
      "\u062d\u0633\u0627\u0628 \u0627\u0644\u062a\u0643\u0627\u0645\u0644 \u0627\u0644\u0645\u062a\u0628\u0642\u064a \u0648\u0627\u0644\u062a\u0639\u0648\u064a\u0636 \u0628\u0627\u0644\u062d\u062f\u064a\u0646 \u0645\u0639 \u0627\u0644\u062d\u0630\u0631 \u0645\u0646 \u0623\u062e\u0637\u0627\u0621 \u0627\u0644\u0625\u0634\u0627\u0631\u0627\u062a \u0628\u064a\u0646 \u0627\u0644\u0639\u0627\u0631\u0636\u062a\u064a\u0646.",
    ],
    repairSteps_fr: [
      "Choisir u(x) et v'(x) selon la r\u00e8gle de priorit\u00e9 (ALPES: logarithme, polyn\u00f4me, exponentielle).",
      "D\u00e9river u(x) pour trouver u'(x), et d\u00e9terminer une primitive v(x) de v'(x).",
      "Appliquer la formule d'int\u00e9gration par parties: \u222b[a,b] u\u00b7v' = [u\u00b7v][a,b] \u2212 \u222b[a,b] u'\u00b7v.",
      "Calculer l'int\u00e9grale r\u00e9siduelle et remplacer les bornes en \u00e9vitant les erreurs de signe.",
    ],
  },

  math_integration_areas: {
    id: "math_integration_areas",
    subjectId: "math",
    title_ar: "\u062d\u0633\u0627\u0628 \u0627\u0644\u0645\u0633\u0627\u062d\u0627\u062a \u0648\u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u0645\u062a\u0648\u0633\u0637\u0629 \u0644\u062f\u0627\u0644\u0629",
    title_fr: "Calcul d'aires et valeur moyenne d'une fonction",
    description_ar: "\u062a\u0648\u0638\u064a\u0641 \u0627\u0644\u062a\u0643\u0627\u0645\u0644 \u0644\u062d\u0633\u0627\u0628 \u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0628\u064a\u0646 \u0645\u0646\u062d\u0646\u064a\u064a\u0646 \u0627\u0646\u0637\u0644\u0627\u0642\u0627\u064b \u0645\u0646 \u0625\u0634\u0627\u0631\u0629 \u0627\u0644\u0641\u0631\u0642 f(x)\u2212g(x) \u0648\u062a\u0648\u0638\u064a\u0641 \u0639\u0644\u0627\u0642\u0629 \u0634\u0627\u0644 \u0639\u0646\u062f \u062a\u063a\u064a\u0631 \u0627\u0644\u0625\u0634\u0627\u0631\u0629.",
    description_fr: "Calculer l'aire entre deux courbes \u00e0 partir du signe de f(x)\u2212g(x) et d\u00e9composer avec Chasles si le signe change.",
    dimensions: ["application", "methodology", "understanding"],
    repairStrategy_ar: "\u0631\u0628\u0637 \u062d\u0633\u0627\u0628 \u0627\u0644\u0645\u0633\u0627\u062d\u0629 \u062d\u062a\u0645\u0627\u064b \u0628\u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0646\u0633\u0628\u064a \u0644\u0644\u0645\u0646\u062d\u0646\u064a\u064a\u0646\u061b \u0644\u0627 \u064a\u0645\u0643\u0646 \u0643\u062a\u0627\u0628\u0629 \u062a\u0643\u0627\u0645\u0644 \u0627\u0644\u0645\u0633\u0627\u062d\u0629 \u062f\u0648\u0646 \u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0623\u0646 \u0627\u0644\u0639\u0628\u0627\u0631\u0629 \u062f\u0627\u062e\u0644 \u0627\u0644\u062a\u0643\u0627\u0645\u0644 \u0645\u0648\u062c\u0628\u0629 \u062a\u0645\u0627\u0645\u0627\u064b.",
    repairStrategy_fr: "Relier imp\u00e9rativement le calcul d'aire \u00e0 la position relative des courbes pour garantir une quantit\u00e9 positive.",
    repairSteps_ar: [
      "\u062f\u0631\u0627\u0633\u0629 \u0625\u0634\u0627\u0631\u0629 \u0627\u0644\u0641\u0631\u0642 f(x) \u2212 g(x) \u0639\u0644\u0649 \u0627\u0644\u0645\u062c\u0627\u0644 [a, b] \u0644\u062a\u062d\u062f\u064a\u062f \u0627\u0644\u0645\u0646\u062d\u0646\u0649 \u0627\u0644\u0623\u0639\u0644\u0649 \u0648\u0627\u0644\u0623\u0633\u0641\u0644.",
      "\u0643\u062a\u0627\u0628\u0629 \u0639\u0628\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u0627\u062d\u0629 \u0643\u0642\u064a\u0645\u0629 \u0645\u0648\u062c\u0628\u0629: A = \u222b[a,b] |\u0627\u0644\u0623\u0639\u0644\u0649 \u2212 \u0627\u0644\u0623\u0633\u0641\u0644| dx \u0628\u0648\u062d\u062f\u0629 \u0642\u064a\u0627\u0633 \u0627\u0644\u0645\u0633\u0627\u062d\u0627\u062a (ua).",
      "\u0625\u0630\u0627 \u062a\u0642\u0627\u0637\u0639 \u0627\u0644\u0645\u0646\u062d\u0646\u064a\u0627\u0646 \u062f\u0627\u062e\u0644 \u0627\u0644\u0645\u062c\u0627\u0644\u060c \u062a\u0641\u0643\u064a\u0643 \u0627\u0644\u062a\u0643\u0627\u0645\u0644 \u0628\u0639\u0644\u0627\u0642\u0629 \u0634\u0627\u0644 \u0648\u0641\u0642 \u0625\u0634\u0627\u0631\u0629 \u0627\u0644\u0641\u0631\u0642.",
      "\u0636\u0631\u0628 \u0627\u0644\u0646\u062a\u064a\u062c\u0629 \u0641\u064a (||\u012b\u20d7|| \u00d7 ||\u0135\u20d7||) \u0641\u064a \u062d\u0627\u0644 \u0637\u064f\u0644\u0628\u062a \u0627\u0644\u0645\u0633\u0627\u062d\u0629 \u0628\u0627\u0644\u0648\u062d\u062f\u0629 cm\u00b2.",
    ],
    repairSteps_fr: [
      "\u00c9tudier le signe de f(x) \u2212 g(x) sur [a, b] pour identifier la courbe sup\u00e9rieure.",
      "Exprimer l'aire positivement: A = \u222b[a,b] (haut \u2212 bas) dx en unit\u00e9s d'aire (ua).",
      "D\u00e9composer l'int\u00e9grale avec la relation de Chasles si le signe change sur l'intervalle.",
      "Multiplier par (||\u012b\u20d7|| \u00d7 ||\u0135\u20d7||) si l'aire est demand\u00e9e en cm\u00b2.",
    ],
  },

  math_differential_equations: {
    id: "math_differential_equations",
    subjectId: "math",
    title_ar: "\u0627\u0644\u0645\u0639\u0627\u062f\u0644\u0627\u062a \u0627\u0644\u062a\u0641\u0627\u0636\u0644\u064a\u0629 \u0645\u0646 \u0627\u0644\u0634\u0643\u0644 y' = ay + b",
    title_fr: "\u00c9quations diff\u00e9rentielles de la forme y' = ay + b",
    description_ar: "\u062d\u0644 \u0627\u0644\u0645\u0639\u0627\u062f\u0644\u0629 y' = ay + b \u0628\u0643\u062a\u0627\u0628\u0629 \u0627\u0644\u062d\u0644 \u0627\u0644\u0639\u0627\u0645 y = C\u00b7e^(ax) \u2212 b/a \u0648\u062a\u0639\u064a\u064a\u0646 \u0627\u0644\u062b\u0627\u0628\u062a C \u0645\u0646 \u0627\u0644\u0634\u0631\u0637 \u0627\u0644\u0627\u0628\u062a\u062f\u0627\u0626\u064a\u060c \u0645\u0639 \u0627\u0644\u062a\u062d\u0642\u0642 \u0628\u0627\u0644\u0627\u0634\u062a\u0642\u0627\u0642 \u0648\u0627\u0644\u062a\u0639\u0648\u064a\u0636.",
    description_fr: "R\u00e9soudre y' = ay + b en \u00e9crivant la solution g\u00e9n\u00e9rale y = C\u00b7e^(ax) \u2212 b/a, puis d\u00e9terminer C via la condition initiale et v\u00e9rifier par d\u00e9rivation.",
    dimensions: ["knowledge", "application", "methodology"],
    repairStrategy_ar: "\u062d\u0641\u0638 \u0627\u0644\u0634\u0643\u0644 \u0627\u0644\u0635\u0631\u064a\u062d \u0644\u0644\u062d\u0644 \u0627\u0644\u0639\u0627\u0645 y = C\u00b7e^(ax) \u2212 b/a\u060c \u0648\u0627\u0644\u062a\u0631\u0643\u064a\u0632 \u0639\u0644\u0649 \u0627\u0644\u062a\u0639\u0648\u064a\u0636 \u0627\u0644\u062f\u0642\u064a\u0642 \u0644\u0644\u0634\u0631\u0637 \u0627\u0644\u0627\u0628\u062a\u062f\u0627\u0626\u064a \u0644\u0625\u064a\u062c\u0627\u062f C.",
    repairStrategy_fr: "Appliquer rigoureusement la forme analytique g\u00e9n\u00e9rale et d\u00e9terminer C via la condition initiale sans erreur de signe.",
    repairSteps_ar: [
      "\u0643\u062a\u0627\u0628\u0629 \u0627\u0644\u0645\u0639\u0627\u062f\u0644\u0629 \u0639\u0644\u0649 \u0634\u0643\u0644\u0647\u0627 \u0627\u0644\u0646\u0645\u0648\u0630\u062c\u064a: y' = a\u00b7y + b \u0648\u0627\u0633\u062a\u062e\u0631\u0627\u062c a \u0648 b.",
      "\u0643\u062a\u0627\u0628\u0629 \u0627\u0644\u062d\u0644 \u0627\u0644\u0639\u0627\u0645: y(x) = C\u00b7e^(ax) \u2212 (b/a) \u062d\u064a\u062b C \u062b\u0627\u0628\u062a \u062d\u0642\u064a\u0642\u064a (\u0625\u0630\u0627 \u0643\u0627\u0646 a \u2260 0).",
      "\u062a\u0648\u0638\u064a\u0641 \u0627\u0644\u0634\u0631\u0637 \u0627\u0644\u0627\u0628\u062a\u062f\u0627\u0626\u064a y(x\u2080) = y\u2080 \u0644\u062d\u0633\u0627\u0628 \u0627\u0644\u0642\u064a\u0645\u0629 \u0627\u0644\u062f\u0642\u064a\u0642\u0629 \u0644\u0644\u062b\u0627\u0628\u062a C.",
      "\u0627\u0633\u062a\u0646\u062a\u0627\u062c \u0627\u0644\u062d\u0644 \u0627\u0644\u062e\u0627\u0635 \u0648\u0627\u0644\u062a\u062d\u0642\u0642 \u0645\u0646 \u0635\u062d\u062a\u0647 \u0628\u0627\u0644\u0627\u0634\u062a\u0642\u0627\u0642 \u0648\u0627\u0644\u062a\u0639\u0648\u064a\u0636 \u0641\u064a \u0627\u0644\u0645\u0639\u0627\u062f\u0644\u0629 \u0627\u0644\u0623\u0635\u0644\u064a\u0629.",
    ],
    repairSteps_fr: [
      "Mettre l'\u00e9quation diff\u00e9rentielle sous forme canonique: y' = a\u00b7y + b et identifier a et b.",
      "\u00c9crire la solution g\u00e9n\u00e9rale: y(x) = C\u00b7e^(ax) \u2212 (b/a) avec C \u2208 \u211d (si a \u2260 0).",
      "Utiliser la condition initiale y(x\u2080) = y\u2080 pour d\u00e9terminer la valeur unique de C.",
      "Exprimer la solution particuli\u00e8re et valider par d\u00e9rivation dans l'\u00e9quation d'origine.",
    ],
  },

  // ---------------------------------------------------------------------------
  // SPACE GEOMETRY SKILLS (الهندسة في الفضاء)
  // ---------------------------------------------------------------------------
  math_space_planes_lines: {
    id: "math_space_planes_lines",
    subjectId: "math",
    title_ar: "المستويات والمستقيمات في الفضاء: التمثيل الوسيطي والمعادلة الديكارتية",
    title_fr: "Plans et droites dans l'espace : représentation paramétrique et équation cartésienne",
    description_ar: "كتابة واستخراج التمثيلات الوسيطية للمستقيمات والمعادلات الديكارتية للمستويات في الفضاء، وتحديد نقاط التقاطع بتوظيف الجداء السلمي والتعامد.",
    description_fr: "Déterminer et manipuler les représentations paramétriques de droites et équations cartésiennes de plans, et calculer leurs intersections.",
    dimensions: ["knowledge", "application", "methodology"],
    repairStrategy_ar: "التمييز الدقيق بين شعاع التوجيه (موازٍ للمستقيم) والشعاع الناظمي (عمودي على المستوي)، واستعمال الجداء السلمي المعدوم n⃗·u⃗ = 0 كأداة لإثبات التعامد والتوازي.",
    repairStrategy_fr: "Distinguer rigoureusement vecteur directeur et vecteur normal, et exploiter le produit scalaire nul pour les conditions d'orthogonalité.",
    repairSteps_ar: [
      "استخراج شعاع التوجيه u⃗ للمستقيم من تمثيله الوسيطي، أو الشعاع الناظمي n⃗ للمستوي من معادلته ax + by + cz + d = 0.",
      "كتابة التمثيل الوسيطي لمستقيم بمعرفة نقطة A(x0, y0, z0) وشعاع توجيه u⃗(a, b, c).",
      "تعيين المعادلة الديكارتية لمستوٍ عبر إيجاد شعاع ناظمي n⃗ بالتعامد (الجداء السلمي)، ثم تعويض إحداثيات نقطة لإيجاد d.",
      "تحديد نقطة تقاطع مستقيم ومستوٍ بتعويض التمثيل الوسيطي للمستقيم في معادلة المستوي واستخراج قيمة الوسيط t.",
    ],
    repairSteps_fr: [
      "Extraire le vecteur directeur u⃗ d'une droite ou le vecteur normal n⃗ d'un plan ax + by + cz + d = 0.",
      "Écrire la représentation paramétrique d'une droite à partir d'un point A et d'un vecteur directeur u⃗.",
      "Déterminer l'équation cartésienne d'un plan via son vecteur normal n⃗ et trouver d par substitution d'un point.",
      "Trouver le point d'intersection droite-plan en substituant les équations paramétriques dans l'équation du plan.",
    ],
  },

  math_space_distances_spheres: {
    id: "math_space_distances_spheres",
    subjectId: "math",
    title_ar: "المسافات في الفضاء ومعادلة سطح الكرة وتقاطعها مع مستوٍ",
    title_fr: "Distances dans l'espace, équation de la sphère et intersection avec un plan",
    description_ar: "حساب مسافة نقطة عن مستوٍ في الفضاء، وكتابة معادلة سطح الكرة وتحديد وضعها النسبي مع مستوٍ وحساب عناصر دائرة التقاطع.",
    description_fr: "Calculer la distance d'un point à un plan, déterminer l'équation d'une sphère et étudier son intersection avec un plan (cercle de section).",
    dimensions: ["application", "methodology", "understanding"],
    repairStrategy_ar: "مقارنة d مع R كنقطة ارتكاز حتمية لتحديد طبيعة التقاطع، وتطبيق مبرهنة فيثاغورس الهندسية لاستنتاج نصف قطر دائرة التقاطع r.",
    repairStrategy_fr: "Comparer systématiquement d(Ω, P) à R pour déduire l'intersection et appliquer Pythagore pour trouver le rayon du cercle.",
    repairSteps_ar: [
      "تطبيق قانون المسافة بين نقطة A ومستوٍ (P): d(A, P) = |axA + byA + czA + d| / √(a² + b² + c²).",
      "كتابة معادلة سطح الكرة (S) ذات المركز Ω ونصف القطر R: (x-x0)² + (y-y0)² + (z-z0)² = R²، أو إتمام المربعات لاستخراجها.",
      "مقارنة المسافة d(Ω, P) بنصف القطر R لتحديد وضع المستوي بالنسبة لسطح الكرة (خارجي، مماس، يقطع وفق دائرة).",
      "تعيين نصف قطر دائرة التقاطع r = √(R² - d²) والبحث عن إحداثيات مركزها H كمسقط عمودي للمركز Ω على المستوي.",
    ],
    repairSteps_fr: [
      "Appliquer la formule de la distance point-plan: d(A, P) = |axA + byA + czA + d| / √(a² + b² + c²).",
      "Écrire l'équation de la sphère (S) de centre Ω et rayon R, ou utiliser la forme canonique pour extraire le centre.",
      "Comparer d(Ω, P) avec R pour déterminer la position relative (disjoints, tangent, intersection selon un cercle).",
      "Calculer le rayon du cercle d'intersection r = √(R² - d²) et déterminer son centre H par projection orthogonale.",
    ],
  },

  math_space_relative_positions: {
    id: "math_space_relative_positions",
    subjectId: "math",
    title_ar: "الأوضاع النسبية للمستقيمات والمستويات في الفضاء",
    title_fr: "Positions relatives de droites et de plans dans l'espace",
    description_ar: "دراسة التوازي والتعامد والتقاطع بين المستقيمات والمستويات في الفضاء والتمييز بين المستقيمات المتقاطعة والمتوازية وغير المتلاقية في نفس المستوي.",
    description_fr: "Étudier le parallélisme, l'orthogonalité et l'intersection de droites et de plans, et distinguer droites sécantes, parallèles ou non coplanaires.",
    dimensions: ["application", "methodology", "understanding"],
    repairStrategy_ar: "استخدام حرفين مختلفين للوسيط عند دراسة تقاطع مستقيمين (t و k مثلاً) لمنع الخطأ الجبري الشائع بافتراض تساوي الوسائط.",
    repairStrategy_fr: "Toujours utiliser deux paramètres distincts (t et k) lors de la résolution du système d'intersection de deux droites.",
    repairSteps_ar: [
      "دراسة الارتباط الخطي لشعاعي التوجيه أو الشعاعين الناظميين لاختبار التوازي والتطابق.",
      "فحص تقاطع مستقيمين بحل جملة المعادلات الناتجة عن وسيطين مختلفين t و k.",
      "استنتاج الوضع النسبي لمستقيمين: متقاطعان في نقطة، متوازيان، أو ليسا من نفس المستوي (منفصلان فضائياً).",
      "استخراج مستقيم تقاطع مستويين غير متوازيين عبر اتخاذ أحد المجاهيل (x أو y أو z) كوسيط t.",
    ],
    repairSteps_fr: [
      "Étudier la colinéarité des vecteurs pour vérifier le parallélisme ou la superposition.",
      "Résoudre le système formé par les équations paramétriques à deux paramètres distincts t et k.",
      "Conclure la position de deux droites: sécantes, parallèles ou non coplanaires.",
      "Déterminer la droite d'intersection de deux plans sécants en fixant une inconnue comme paramètre t.",
    ],
  },

  // ---------------------------------------------------------------------------
  // PROBABILITY, COMBINATORICS & ARITHMETIC SKILLS (الاحتمالات، العد والحساب في Z)
  // ---------------------------------------------------------------------------
  math_counting_combinatorics: {
    id: "math_counting_combinatorics",
    subjectId: "math",
    title_ar: "طرائق العد، التبديلات، الترتيبات والتوفيقات",
    title_fr: "Dénombrement, permutations, arrangements et combinaisons",
    description_ar: "تحديد نوع السحب ونموذج العد الملائم (آني، متتالي مع أو بدون إرجاع) وحساب التوفيقات والترتيبات مع مراعاة معاملات الترتيب.",
    description_fr: "Identifier le mode de tirage et l'outil de dénombrement adapté (combinaisons, arrangements, p-listes) en tenant compte de l'ordre.",
    dimensions: ["knowledge", "application", "methodology"],
    repairStrategy_ar: "تحديد طبيعة السحب كخطوة أولى حاسمة لاختيار النموذج الرياضي (C أو A أو n^p)، وتفادي نسيان معامل الترتيب في السحب المتتالي.",
    repairStrategy_fr: "Qualifier formellement la modalité du tirage avant tout calcul pour sélectionner l'outil de dénombrement adéquat.",
    repairSteps_ar: [
      "تحديد نوع السحب من نص المسألة: في آن واحد (توفيقة C)، على التوالي بدون إرجاع (ترتيبات A)، أو على التوالي بإرجاع (قوائم n^p).",
      "استعمال التوفيقات C(n, p) = n! / (p!(n-p)!) عند عدم الاهتمام بالترتيب، وتطبيق خواصها التناظرية.",
      "مراعاة معامل الترتيب عند السحب المتتالي مع تمييز العناصر (الألوان أو الأرقام).",
      "توظيف مبدأ الشجرة أو المخطط لتفكيك الحالات المعقدة وحساب الحالات الملائمة بدقة.",
    ],
    repairSteps_fr: [
      "Identifier le type de tirage: simultané (combinaisons C), successif sans remise (arrangements A), ou avec remise (listes n^p).",
      "Utiliser les combinaisons C(n, p) = n! / (p!(n-p)!) lorsque l'ordre n'intervient pas.",
      "Prendre en compte le coefficient d'ordre lors d'un tirage successif avec distinction d'éléments.",
      "Construire un arbre de choix pour dénombrer méthodiquement les cas favorables.",
    ],
  },

  math_conditional_probability_trees: {
    id: "math_conditional_probability_trees",
    subjectId: "math",
    title_ar: "الاحتمال الشرطي، شجرة الاحتمالات ودستور الاحتمال الكلي",
    title_fr: "Probabilités conditionnelles, arbres pondérés et formule des probabilités totales",
    description_ar: "بناء وموازنة شجرة الاحتمالات الموزونة وحساب الاحتمالات الشرطية وتطبيق دستور الاحتمال الكلي وفحص استقلالية الحوادث.",
    description_fr: "Construire un arbre pondéré, calculer les probabilités conditionnelles, appliquer la formule des probabilités totales et tester l'indépendance.",
    dimensions: ["understanding", "application", "methodology"],
    repairStrategy_ar: "الرسم الإلزامي لشجرة الاحتمالات الموزونة لترجمة نص المسألة بيانياً وتطبيق دستور الاحتمالات الكلية دون خلط بين التقاطع P(A∩B) والاحتمال الشرطي PA(B).",
    repairStrategy_fr: "Systématiser l'arbre pondéré pour distinguer sans ambiguïté la probabilité de l'intersection et la probabilité conditionnelle.",
    repairSteps_ar: [
      "رسم شجرة احتمالات موزونة مع وضع الاحتمالات الشرطية على الفروع الثانوية.",
      "التحقق من أن مجموع احتمالات الفروع المنطلقة من نفس العقدة يساوي دائماً 1.",
      "تطبيق دستور الاحتمال الكلي لحساب احتمال حدث B يتقاطع مع تجزئة كاملة: P(B) = Σ P(Ai ∩ B).",
      "حساب الاحتمال الشرطي العكسي بدقة: PA(B) = P(A ∩ B) / P(A) واستنتاج استقلالية حادثتين إذا كان P(A ∩ B) = P(A)·P(B).",
    ],
    repairSteps_fr: [
      "Construire un arbre pondéré en plaçant rigoureusement les probabilités conditionnelles sur les branches.",
      "Vérifier que la somme des probabilités issues d'un même nœud est égale à 1.",
      "Appliquer la formule des probabilités totales pour déduire P(B) à partir d'une partition.",
      "Calculer la probabilité conditionnelle PA(B) = P(A ∩ B) / P(A) et tester l'indépendance de deux événements.",
    ],
  },

  math_random_variables_binomial: {
    id: "math_random_variables_binomial",
    subjectId: "math",
    title_ar: "المتغيرات العشوائية، قانون الاحتمال وقانون ثنائي الحدين",
    title_fr: "Variables aléatoires, loi de probabilité et loi binomiale",
    description_ar: "تعيين قانون احتمال المتغير العشوائي وحساب مؤشراته (الأمل، التباين، الانحراف المعياري) ونمذجة تجارب برنولي المتكررة بقانون ثنائي الحدين.",
    description_fr: "Déterminer la loi d'une variable aléatoire, calculer l'espérance et la variance, et modéliser par la loi binomiale B(n, p).",
    dimensions: ["application", "methodology", "understanding"],
    repairStrategy_ar: "إثبات شروط مخطط برنولي (تجربة ذات مخرجين تعاد n مرة بشكل متماثل ومستقل) قبل استخدام قانون ثنائي الحدين مباشرة.",
    repairStrategy_fr: "Vérifier formellement les hypothèses du schéma de Bernoulli avant de déployer la formule de la loi binomiale.",
    repairSteps_ar: [
      "تحديد مجموعة قيم المتغير العشوائي X(Ω) بدقة وربط كل قيمة بحادثة جزئية.",
      "كتابة قانون الاحتمال في جدول والتحقق الصارم من أن مجموع الاحتمالات Σ P(X = xi) = 1.",
      "حساب الأمل الرياضياتي E(X)، التباين V(X) والانحراف المعياري σ(X) بالقوانين المعتمدة.",
      "التعرف على مخطط برنولي وتطبيق قانون ثنائي الحدين B(n, p): P(X = k) = C(n, k)·p^k·(1-p)^(n-k).",
    ],
    repairSteps_fr: [
      "Déterminer l'ensemble des valeurs de la variable aléatoire X(Ω) selon l'expérience.",
      "Dresser la loi de probabilité dans un tableau et s'assurer que la somme des probabilités vaut 1.",
      "Calculer l'espérance mathématique E(X), la variance V(X) et l'écart-type σ(X).",
      "Identifier un schéma de Bernoulli et appliquer la loi binomiale B(n, p): P(X = k) = C(n, k)·p^k·(1-p)^(n-k).",
    ],
  },

  math_arithmetic_divisibility_congruence: {
    id: "math_arithmetic_divisibility_congruence",
    subjectId: "math",
    title_ar: "القسمة الإقليدية في Z، الموافِقات والمعادلات الديوفانتية",
    title_fr: "Division euclidienne dans ℤ, congruences et équations diophantiennes",
    description_ar: "توظيف خواص الموافقات ودورية البواقي لحل مسائل قابلية القسمة في Z، وتطبيق مبرهنتي بيزو وغاوس لحل المعادلات الديوفانتية.",
    description_fr: "Exploiter les congruences et la périodicité des restes dans ℤ, et appliquer les théorèmes de Bézout et Gauss pour résoudre ax + by = c.",
    dimensions: ["knowledge", "application", "methodology"],
    repairStrategy_ar: "إثبات الأولية بين المعاملات أولاً بمبرهنة بيزو قبل استخدام مبرهنة غاوس لتفادي استنتاجات خاطئة في حل المعادلات في Z.",
    repairStrategy_fr: "Valider la primalité entre les coefficients via Bézout avant d'invoquer le théorème de Gauss pour résoudre les équations diophantiennes.",
    repairSteps_ar: [
      "توظيف خواص الموافقة بترديد n (التوافق مع الجمع والضرب والقوى) لتعيين بواقي قسمة a^k على n.",
      "دراسة دورية بواقي قوى العدد وفق قيم العدد الطبيعي n وتلخيصها في جدول قيم.",
      "استعمال خوارزمية إقليدس لحساب PGCD(a, b) وإيجاد حل خاص للمعادلة ax + by = c بمبرهنة بيزو.",
      "استنتاج الحل العام للمعادلات الديوفانتية بتطبيق مبرهنة غاوس وتعيين الحلول الطبيعية إن طُلبت.",
    ],
    repairSteps_fr: [
      "Exploiter les propriétés des congruences modulo n pour déterminer les restes de a^k modulo n.",
      "Étudier la périodicité des restes des puissances et résumer les résultats dans un tableau.",
      "Appliquer l'algorithme d'Euclide pour calculer le PGCD et déduire une solution particulière via Bézout.",
      "Résoudre l'équation diophantienne ax + by = c en utilisant le théorème de Gauss.",
    ],
  },

  // ---------------------------------------------------------------------------
  // PHYSICS-CHEMISTRY SKILLS
  // ---------------------------------------------------------------------------
  physics_rc_time_constant: {
    id: "physics_rc_time_constant",
    subjectId: "physics",
    title_ar: "التحليل البعدي وثابت الزمن في دارة RC",
    title_fr: "Analyse dimensionnelle et constante de temps du circuit RC",
    description_ar: "إثبات تجانس ثابت الزمن τ = RC مع الزمن عبر التحليل البعدي واستثماره في قراءة المخططات البيانية.",
    description_fr: "Démontrer que tau = RC a la dimension d'un temps [T] et l'exploiter graphiquement.",
    dimensions: ["knowledge", "understanding"],
    repairStrategy_ar: "استخدام قانون أوم وعلاقة الشحنة i = dq/dt لاستخراج معادلة الأبعاد خطوة بخطوة.",
    repairStrategy_fr: "Utiliser la loi d'Ohm et la relation i = dq/dt pour déduire [RC] = T.",
    repairSteps_ar: [
      "اكتب قانون أوم: U = R · I ومنه [R] = [U] / [I].",
      "اكتب علاقة سعة المكثفة: q = C · U و i = dq/dt ومنه [C] = [I] · [T] / [U].",
      "اضرب البعدين: [RC] = [R] · [C] = ([U] / [I]) · ([I] · [T] / [U]) = [T].",
      "استنتج أن وحدة τ هي الثانية (s)، واستغل نسبة 63% للشحن ونقطة تقاطع المماس.",
    ],
    repairSteps_fr: [
      "Exprimer [R] à partir de la loi d'Ohm : [R] = [U] / [I].",
      "Exprimer [C] à partir de q = C·U et i = dq/dt : [C] = ([I]·[T]) / [U].",
      "Calculer le produit [RC] pour simplifier [U] et [I], obtenant ainsi [T].",
      "Conclure que tau s'exprime en secondes et repérer 0,63·E au chargement.",
    ],
  },

  physics_newton_projections: {
    id: "physics_newton_projections",
    subjectId: "physics",
    title_ar: "القانون الثاني لنيوتن والإسقاطات على المستوي المائل",
    title_fr: "2ème loi de Newton et projections sur plan incliné",
    description_ar: "إسقاط القوى (الثقل، رد الفعل، الاحتكاك) بدقة على المحاور المتعامدة دون الخلط بين sin و cos.",
    description_fr: "Projection rigoureuse des forces sur les axes sans confondre sinus et cosinus.",
    dimensions: ["application", "methodology"],
    repairStrategy_ar: "رسم المعلم بوضوح (المحور Ox موازٍ للمستوي وموجه نحو الأسفل) وإسقاط الثقل بالزاوية المقابلة.",
    repairStrategy_fr: "Tracer le repère avec Ox le long du plan et projeter P_x = P·sin(alpha).",
    repairSteps_ar: [
      "حدد الجملة الميكانيكية ومرجع الدراسة (عطالي أرضي).",
      "احص القوى المؤثرة بدقة: الثقل P، رد فعل السطح R، وقوة الاحتكاك f إن وجدت.",
      "اختر معلماً متعامداً ومتجانساً (Ox موازٍ للمستوي، Oy عمودي عليه).",
      "تأكد من إسقاط الثقل: P_x = mg · sin(α) على المحور الموازي و P_y = -mg · cos(α) على العمودي.",
    ],
    repairSteps_fr: [
      "Définir le système et le référentiel d'étude (galiléen).",
      "Faire l'inventaire complet des forces (P, R, f).",
      "Choisir un repère adapté (Ox parallèle à la pente, Oy perpendiculaire).",
      "Projeter rigoureusement : P_x = m·g·sin(alpha) et P_y = -m·g·cos(alpha).",
    ],
  },

  physics_decay_half_life: {
    id: "physics_decay_half_life",
    subjectId: "physics",
    title_ar: "قانون التناقص الإشعاعي وزمن نصف العمر",
    title_fr: "Loi de décroissance radioactive et temps de demi-vie",
    description_ar: "استيعاب الطبيعة الأسية للنشاط الإشعاعي وتجنب التخمين الخطي للتحلل الكلي.",
    description_fr: "Maîtriser la décroissance exponentielle N(t) = N_0·e^(-lambda·t) et le temps t_1/2.",
    dimensions: ["understanding", "application"],
    repairStrategy_ar: "تطبيق العلاقة t_(1/2) = ln(2)/λ وتذكر أن بعد زمنين من نصف العمر يتبقى الربع وليس الصفر.",
    repairStrategy_fr: "Appliquer t_1/2 = ln(2)/lambda et retenir qu'à 2·t_1/2 il reste 25% des noyaux.",
    repairSteps_ar: [
      "تذكر تعريف زمن نصف العمر: هو المدة اللازمة لتفكك نصف عدد الأنوية الابتدائية N(t_(1/2)) = N_0 / 2.",
      "استنتج العلاقة: λ · t_(1/2) = ln(2) وبالتالي t_(1/2) = ln(2) / λ.",
      "احذر الفخ الخطي: عند t = 2 · t_(1/2)، يتبقى N_0 / 4 (أي 25%)، وعند t = 3 · t_(1/2) يتبقى N_0 / 8.",
      "احسب النشاط الإشعاعي A(t) = λ · N(t) أو استعمل البيان اللوغاريتمي ln(N) بدقة.",
    ],
    repairSteps_fr: [
      "Rappeler la définition : durée nécessaire pour que la moitié des noyaux se désintègre.",
      "Relier la constante radioactive et t_1/2 : t_1/2 = ln(2) / lambda.",
      "Éviter le piège de la linéarité : à t = 2·t_1/2 il reste 25%, pas 0%.",
      "Calculer l'activité A(t) = lambda·N(t) en respectant les unités du SI.",
    ],
  },

  physics_chemical_kinetics: {
    id: "physics_chemical_kinetics",
    subjectId: "physics",
    title_ar: "المتابعة الزمنية لتحول كيميائي وسرعات التفاعل",
    title_fr: "Suivi temporel d'une transformation chimique et vitesses de réaction",
    description_ar: "استغلال جدول التقدم لتعيين المتفاعل المحد والتقدم الأعظمي، واستخراج زمن نصف التفاعل، وحساب السرعات الحجمية للتفاعل وميول المماسات.",
    description_fr: "Exploiter le tableau d'avancement, déterminer le temps de demi-réaction et calculer la vitesse volumique de réaction via la pente de la tangente.",
    dimensions: ["application", "methodology", "understanding"],
    repairStrategy_ar: "التركيز على تحديد معامل توجيه المماس (الميل) بدقة باختيار نقطتين واضحتين، ومراعاة التحويل الصحيح لوحدات الحجم والزمن قبل الحساب.",
    repairStrategy_fr: "Calculer rigoureusement la pente de la tangente avec deux points distincts et convertir impérativement les unités de volume et de temps.",
    repairSteps_ar: [
      "إنشاء جدول التقدم بدقة وتحديد المتفاعل المحد والتقدم الأعظمي x_max.",
      "تعريف واستخراج زمن نصف التفاعل t_(1/2) بيانياً بإسقاط القيمة x_f / 2 على محور الأزمنة.",
      "كتابة عبارة السرعة الحجمية للتفاعل v_vol = (1/V_tot) · (dx/dt) وحساب ميل المماس بيانياً عند اللحظة t.",
      "ربط سرعة التفاعل بسرعات اختفاء أو تشكل الأنواع الكيميائية المرافقة عبر المعاملات الستوكيومترية.",
    ],
    repairSteps_fr: [
      "Dresser le tableau d'avancement et identifier le réactif limitant et x_max.",
      "Déterminer graphiquement le temps de demi-réaction t_(1/2) par projection de x_f / 2.",
      "Exprimer la vitesse volumique de réaction v_vol et calculer la pente de la tangente à l'instant t.",
      "Relier la vitesse de réaction aux vitesses de disparition/formation via les coefficients stœchiométriques.",
    ],
  },

  physics_rc_rl_circuits: {
    id: "physics_rc_rl_circuits",
    subjectId: "physics",
    title_ar: "الدارات الكهربائية RC و RL: المعادلات التفاضلية والاستجابة لدرجة توتر",
    title_fr: "Circuits électriques RC et RL : équations différentielles et réponse à un échelon de tension",
    description_ar: "تأسيس وحل المعادلات التفاضلية لثنائي القطب RC و RL وفق قانون جمع التوترات، وتعيين ثابت الزمن وحساب الطاقة المخزنة.",
    description_fr: "Établir et résoudre les équations différentielles des dipôles RC et RL, déterminer la constante de temps τ et calculer l'énergie emmagasinée.",
    dimensions: ["knowledge", "application", "methodology"],
    repairStrategy_ar: "الاعتماد الدائم على قانون جمع التوترات كمنطلق رسمي للمعادلة التفاضلية، ومطابقة الثوابت A و α بالتعويض المباشر لحل المعادلة.",
    repairStrategy_fr: "Partir systématiquement de la loi d'additivité des tensions et identifier les constantes analytiques par substitution du حل général.",
    repairSteps_ar: [
      "تطبيق قانون جمع التوترات مع توجيه الدارة وتحديد جهة شدة التيار والأسهم الممثلة للتوترات.",
      "تأسيس المعادلة التفاضلية للتوتر u_C(t) أو الشحنة q(t) أو شدة التيار i(t) وتبيان حلها الأسي.",
      "تعيين ثابت الزمن τ بيانياً (طريقة المماس عند المبدأ أو قيمة 0.63 من القيمة الأعظمية في الشحن) وحسابه تحليلياً (RC أو L/R_tot).",
      "حساب الطاقة الكهرومغناطيسية المخزنة في المكثفة E_e = (1/2)Cu_C² أو الوشيعة E_m = (1/2)Li² في النظام الدائم.",
    ],
    repairSteps_fr: [
      "Appliquer la loi d'additivité des tensions avec convention récepteur/générateur correcte.",
      "Établir l'équation différentielle pour u_C(t), q(t) ou i(t) et identifier la solution exponentielle.",
      "Déterminer la constante de temps τ graphiquement (tangente à l'origine ou 0.63 max) et analytiquement.",
      "Calculer l'énergie emmagasinée dans le condensateur ou la bobine en régime permanent.",
    ],
  },

  physics_nuclear_reactions: {
    id: "physics_nuclear_reactions",
    subjectId: "physics",
    title_ar: "التحولات النووية: قانون التناقص وطاقة الربط والحصيلة الطاقوية",
    title_fr: "Transformations nucléaires : décroissance, énergie de liaison et bilan énergétique",
    description_ar: "موازنة التفاعلات النووية بقوانين صودي، وحساب النقص الكتلي وطاقة الربط لكل نوية، وتحديد الحصيلة الطاقوية للانشطار والاندماج.",
    description_fr: "Appliquer les lois de Soddy, calculer le défaut de masse, l'énergie de liaison par nucléon et le bilan énergétique des réactions de fission et fusion.",
    dimensions: ["knowledge", "application", "understanding"],
    repairStrategy_ar: "الانتباه الشديد للوحدات: استخدام MeV عند الحساب بكتل مقدرة بوحدة الكتل الذرية (u)، واستخدام الجول (J) عند الاعتماد على الكيلوغرام والسرعة c بالمتر/ثانية.",
    repairStrategy_fr: "Faire attention aux conversions d'unités: MeV avec l'unité de masse atomique (u), et Joules avec les masses en kg.",
    repairSteps_ar: [
      "موازنة التفاعلات النووية (الانبعاثات α، β⁻، β⁺، والأشعة γ) بتطبيق قانوني صودي لانحفاظ العدد الكتلي والشحني.",
      "توظيف قانون التناقص الإشعاعي N(t) = N_0·e^(-λt) والنشاط الإشعاعي A(t) وحساب زمن نصف العمر t_(1/2) = ln(2) / λ.",
      "حساب النقص الكتلي Δm وطاقة الربط للنواة E_l = Δm·c² ومؤشر الاستقرار (E_l / A).",
      "حساب الطاقة المحررة E_liberée من تفاعل انشطار أو اندماج عبر الحصيلة الكتلية أو مخطط الحصيلة الطاقوية.",
    ],
    repairSteps_fr: [
      "Équilibrer les réactions nucléaires (α, β⁻, β⁺, γ) en appliquant les lois de conservation de Soddy.",
      "Exploiter la loi de décroissance N(t) = N_0·e^(-λt), l'activité A(t) et relier t_(1/2) à λ.",
      "Calculer le défaut de masse Δm, l'énergie de liaison E_l et l'énergie de liaison par nucléon E_l / A.",
      "Déterminer l'énergie libérée par fission ou fusion via le bilan massique ou diagramme énergétique.",
    ],
  },

  physics_newton_mechanics: {
    id: "physics_newton_mechanics",
    subjectId: "physics",
    title_ar: "الميكانيك وقوانين نيوتن: حركة السقوط، القذائف، والكواكب والأقمار",
    title_fr: "Mécanique newtonienne : chute verticale, projectiles et mouvements des satellites et planètes",
    description_ar: "تطبيق القانون الثاني لنيوتن في المراجع الغاليلية، وإيجاد المعادلات التفاضلية للسرعة والحركة في السقوط والقذائف وحركة الأقمار والكواكب.",
    description_fr: "Appliquer la 2ème loi de Newton dans les référentiels galiléens, établir les équations différentielles pour la chute, les projectiles et les satellites.",
    dimensions: ["understanding", "application", "methodology"],
    repairStrategy_ar: "الالتزام بالخطوات المنهجية الرسمية لتصحيح البكالوريا: الجملة ➔ المرجع ➔ تمثيل القوى ➔ الإسقاط، دون القفز مباشرة لكتابة المعادلة التفاضلية.",
    repairStrategy_fr: "Respecter scrupuleusement la démarche méthodologique: système, référentiel, bilan des forces, puis projection.",
    repairSteps_ar: [
      "تحديد الجملة المدروسة والمرجع الغاليلي المناسب (مركزي أرضي، شمسي، أو سطحي أرضي).",
      "إحصاء القوى الخارجية المؤثرة وتمثيلها بدقة (الثقل، دافعة أرخميدس، وقوى الاحتكاك f = k·v^n).",
      "تطبيق القانون الثاني لنيوتن Σ F_ext = m·a⃗ وإسقاطه على المحاور الموجهة للوصول إلى المعادلة التفاضلية للسرعة.",
      "استنتاج السرعة الحدية v_lim في السقوط الشاقولي، أو تعيين معادلة المسار والمدى والذروة في حركة القذائف.",
    ],
    repairSteps_fr: [
      "Définir le système mécanique et le référentiel galiléen approprié (géocentrique, héliocentrique, terrestre).",
      "Bilan des forces extérieures et représentation vectorielle (poids, poussée d'Archimède, frottements).",
      "Appliquer la 2ème loi de Newton Σ F_ext = m·a⃗ et projeter sur les axes pour établir l'équation différentielle.",
      "Déduire la vitesse limite v_lim ou déterminer l'équation de la trajectoire et la portée d'un projectile.",
    ],
  },

  physics_acids_bases_equilibrium: {
    id: "physics_acids_bases_equilibrium",
    subjectId: "physics",
    title_ar: "تطور جملة كيميائية نحو حالة التوازن: الأحماض والأسس والمعايرة",
    title_fr: "Évolution d'un système chimique vers l'état d'équilibre : acides, bases et titrage",
    description_ar: "دراسة تفاعلات الأحماض والأسس، حساب نسبة التقدم النهائي وثابت التوازن و Ka، واستثمار منحنيات المعايرة ونقطة التكافؤ.",
    description_fr: "Étudier les équilibres acide-base, calculer le taux d'avancement final τ_f, Ka et exploiter les courbes de titrage pH-métrique et le point d'équivalence.",
    dimensions: ["application", "methodology", "understanding"],
    repairStrategy_ar: "التمييز الدقيق بين التفاعل التام (حمض/أساس قوي، τ_f = 1) والتفاعل غير التام المحدود (حمض/أساس ضعيف، τ_f < 1)، وتوظيف نقطة التكافؤ للمعايرة عبر المساواة الستوكيومترية.",
    repairStrategy_fr: "Distinguer formellement les transformations totales des équilibres limités et exploiter l'équivalence stœchiométrique.",
    repairSteps_ar: [
      "كتابة معادلة تفاعل حمض-أساس وحساب نسبة التقدم النهائي τ_f = x_f / x_max للحكم على قوة الحمض أو الأساس.",
      "كتابة عبارة كسر التفاعل Q_r واستنتاج ثابت التوازن K وثابت الحموضة K_a للثنائية.",
      "توظيف علاقة هندرسون: pH = pK_a + log([A⁻]/[HA]) لتعيين النوع الكيميائي المهيمن في المحلول.",
      "استغلال منحنى المعايرة الـ pH-مترية لتحديد نقطة التكافؤ E بطريقة المماسات المتوازية واستنتاج التركيز المجهول.",
    ],
    repairSteps_fr: [
      "Écrire la réaction acide-base et calculer le taux d'avancement final τ_f pour évaluer la force de l'acide/base.",
      "Exprimer le quotient de réaction Q_r et déduire la constante d'équilibre K et K_a du couple.",
      "Exploiter la relation pH = pK_a + log([A⁻]/[HA]) pour déterminer l'espèce prédominante.",
      "Exploiter la courbe de titrage pH-métrique pour identifier le point d'équivalence E par la méthode des tangentes.",
    ],
  },

  // ---------------------------------------------------------------------------
  // NATURAL SCIENCES (SVT) SKILLS
  // ---------------------------------------------------------------------------
  snv_document_exploitation: {
    id: "snv_document_exploitation",
    subjectId: "natural_sciences",
    title_ar: "منهجية استغلال الوثائق في الاستدلال العلمي",
    title_fr: "Méthodologie d'exploitation des documents scientifiques en SVT",
    description_ar: "هيكلة التحليل المنظم (تقديم الوثيقة + تفكيك المعطيات مع الأرقام + استنتاج صريح) دون سرد أعمى للدرس.",
    description_fr: "Structuration de l'analyse documentaire (présentation, données chiffrées, déduction).",
    dimensions: ["methodology", "understanding"],
    repairStrategy_ar: "اعتماد القالب الرباعي الإلزامي: تمثل الوثيقة... حيث نلاحظ... مما يدل على... ونستنتج أن...",
    repairStrategy_fr: "Appliquer la démarche : Présentation -> Analyse chiffrée -> Interprétation -> Déduction.",
    repairSteps_ar: [
      "تقديم الوثيقة: 'تمثل الوثيقة (أو المنحنى) تغيرات [المتغير التابع] بدلالة [المتغير المستقل]...'",
      "تفكيك المعطيات: قسّم المنحنى إلى فترات مع إعطاء قيم عددية وشروط التجربة المرافقة.",
      "الدلالة البيولوجية: اشرح ماذا تعني الزيادة أو الانخفاض على المستوى الجزيئي أو الخلوي.",
      "الاستنتاج الصريح: استخرج المعلومة الجديدة التي تجيب جزئياً أو كلياً على المشكل العلمي المطروح.",
    ],
    repairSteps_fr: [
      "Présenter le document : 'Le document présente la variation de ... en fonction de ...'",
      "Analyser les données : découper les intervalles en citant les valeurs chiffrées clés.",
      "Interpréter les variations observées au niveau moléculaire ou cellulaire.",
      "Formuler une déduction précise répondant au problème biologique posé.",
    ],
  },

  snv_protein_synthesis: {
    id: "snv_protein_synthesis",
    subjectId: "natural_sciences",
    title_ar: "آليات التعبير المورثي وتخليق البروتين",
    title_fr: "Mécanismes de l'expression génétique et synthèse des protéines",
    description_ar: "الربط المحكم بين مرحلتي الاستنساخ (في النواة) والترجمة (في الهيولى) ودور الشفرة الوراثية.",
    description_fr: "Articuler la transcription (noyau) et la traduction (cytoplasme) chez les eucaryotes.",
    dimensions: ["knowledge", "understanding"],
    repairStrategy_ar: "تحديد مقر وشروط ونواتج كل مرحلة، مع تتبع اتجاه القراءة ونضج جزيئة ARNm.",
    repairStrategy_fr: "Préciser le compartiment, les éléments nécessaires et le produit de chaque étape.",
    repairSteps_ar: [
      "الاستنساخ: مقره النواة، شروطه (مورثة ADN، إنزيم ARN بوليميراز، نيكليوتيدات حرة، طاقة ATP).",
      "الترجمة: مقرها الهيولى (الريبوزومات)، شروطها (ARNm ناضج، ريبوزومات وظيفية، ARNt نوعي، أحماض أمينية، طاقة).",
      "القراءة: تتم قراءة ARNm من الاتجاه '5 نحو '3، انطلاقاً من رامزة البداية AUG.",
      "احذر قلب المقرات: تذكر دائماً أن الترجمة لا تحدث في النواة أبداً لدى حقيقيات النوى.",
    ],
    repairSteps_fr: [
      "Transcription dans le noyau : matrice ADN, ARN polymérase, nucléotides, ATP.",
      "Traduction dans le cytoplasme : ARNm, ribosomes fonctionnels, ARNt, acides aminés, ATP.",
      "Lecture du transcrit de 5' vers 3' à partir du codon initiateur AUG.",
      "Veiller à la localisation stricte des compartiments cellulaires.",
    ],
  },

  snv_immunity_reasoning: {
    id: "snv_immunity_reasoning",
    subjectId: "natural_sciences",
    title_ar: "الاستدلال المناعي ودور الأجسام المضادة",
    title_fr: "Raisonnement immunologique et mode d'action des anticorps",
    description_ar: "التمييز بين دور الأجسام المضادة في تعديل المستضد وتشكيل المعقدات المناعية، ودور البالعات في الإقصاء.",
    description_fr: "Différencier la neutralisation de l'antigène par les anticorps et son élimination par phagocytose.",
    dimensions: ["understanding", "methodology"],
    repairStrategy_ar: "فهم أن الجسم المضاد يبطل مفعول المستضد فقط ولا يفككه بنفسه؛ التفكيك وظيفة البالعات.",
    repairStrategy_fr: "Comprendre que l'anticorps neutralise mais ne détruit pas directement l'antigène.",
    repairSteps_ar: [
      "وضح تشكل المعقد المناعي: يرتبط الجسم المضاد نوعياً بالمستضد عبر موقعي التثبيت بفضل التكامل البنيوي.",
      "تأثير التعديل: يؤدي تشكل المعقد المناعي إلى إبطال مفعول المستضد ومنع انتشاره أو تكاثره.",
      "الإقصاء النهائي: يتثبت المعقد المناعي على مستقبلات غشائية نوعية للبالعات الكبيرة لتتم بلعمته وهضمه إنزيمياً.",
      "احذر الفخ الشائع: الأجسام المضادة ليست إنزيمات هاضمة ولا تفكك المستضدات بشكل مباشر.",
    ],
    repairSteps_fr: [
      "Expliquer la formation du complexe immun par complémentarité stérique.",
      "Montrer que la formation du complexe neutralise l'antigène et bloque sa toxicité.",
      "Décrire la phagocytose facilitée via les récepteurs membranaires pour la partie constante de l'anticorps.",
      "Éviter l'erreur classique : l'anticorps ne possède pas d'activité enzymatique lytique.",
    ],
  },
  snv_enzymes_kinetics_activity: {
    id: "snv_enzymes_kinetics_activity",
    subjectId: "natural_sciences",
    title_ar: "النشاط الإنزيمي وعلاقته بالبنية الفراغية للموقع الفعال وتأثير pH والحرارة",
    title_fr: "Activité enzymatique : structure du site actif et influence du pH et de la température",
    description_ar: "دراسة العلاقة بين البنية الفراغية للموقع الفعال والنشاط النوعي للإنزيم، وتفسير تأثير العوامل الفيزيوكيميائية (pH والحرارة) على سرعة التفاعل.",
    description_fr: "Relier la conformation tridimensionnelle du site actif à la spécificité enzymatique et interpréter l'effet du pH et de la température sur Vi.",
    dimensions: ["understanding", "application", "methodology"],
    repairStrategy_ar: "التركيز دائماً على ربط تأثير العوامل الفيزيوكيميائية (pH والحرارة) بالحالة الشاردية والبنية الفراغية الثلاثية للموقع الفعال حتماً.",
    repairStrategy_fr: "Relier systématiquement l'effet des facteurs environnementaux à la conformation tridimensionnelle du site actif.",
    repairSteps_ar: [
      "تحديد بنية الموقع الفعال للإنزيم والتمييز بين موقع التثبيت وموقع التحفيز.",
      "تفسير ثبات السرعة الابتدائية Vi عند التراكيز العالية للركيزة بتشبع كل المواقع الفعالة للإنزيم.",
      "تحليل تأثير درجة الحرارة وتفسير التثبيط العكوس بالبرودة والتخريب غير العكوس بالحرارة المرتفعة.",
      "تفسير تأثير pH الوسط على الحالة الشاردية للجذور الكيميائية في الموقع الفعال وفقدان التكامل البنيوي.",
    ],
    repairSteps_fr: [
      "Identifier la structure du site actif de l'enzyme (site de fixation vs site catalytique).",
      "Expliquer la saturation de la vitesse initiale Vi à forte concentration de substrat par la saturation des sites actifs.",
      "Analyser l'effet de la température: inactivation réversible au froid vs dénaturation irréversible à chaud.",
      "Expliquer l'impact du pH sur l'état d'ionisation des radicaux du site actif et la perte de complémentarité.",
    ],
  },

  snv_immunology_self_nonself_humoral: {
    id: "snv_immunology_self_nonself_humoral",
    subjectId: "natural_sciences",
    title_ar: "المناعة: التمييز بين الذات واللاذات والاستجابة الخلطية (LB والأجسام المضادة)",
    title_fr: "Immunologie : soi et non-soi, réponse humorale (LB et anticorps)",
    description_ar: "التمييز بين محددات الذات (CMH)، وتتبع مراحل الاستجابة المناعية الخلطية من الانتخاب اللمي إلى إفراز الأجسام المضادة وتشكل المعقد المناعي والبلعمة.",
    description_fr: "Distinguer les marqueurs du soi (CMH), retracer les étapes de la réponse humorale (sélection clonale, plasmocytes, complexe immun et phagocytose).",
    dimensions: ["knowledge", "understanding", "methodology"],
    repairStrategy_ar: "اتباع التدرج المنهجي للاستجابة: التعرف والانتخاب اللمي ➔ التكاثر والتمايز ➔ إفراز الأجسام المضادة وتشكيل المعقد ➔ التخلص بالبلعمة.",
    repairStrategy_fr: "Respecter la chronologie de la réponse immunitaire: sélection, prolifération, différenciation et effectrice.",
    repairSteps_ar: [
      "التمييز بين جزيئات معقد التوافق النسيجي الرئيسي (CMHI في جميع الخلايا العارمة و CMHII في الخلايا البالغة/العارضة CPA).",
      "تفسير الانتخاب اللمي للخلايا اللمفاوية البائية LB بواسطة المستضد النوعي وتمايزها إلى خلايا بلازمية Plasmocytes.",
      "رسم وكتابة بيانات البنية الفراغية للجسم المضاد (السلاسل الثقيلة والخفيفة، المنطقة المتغيرة والثابتة، وموقع التثبيت).",
      "توضيح آلية تشكل المعقد المناعي (جسم مضاد - مستضد) ودوره في إبطال مفعول المستضد وتسهيل البلعمة عبر المستقبلات الغشائية للبلعميات.",
    ],
    repairSteps_fr: [
      "Distinguer les molécules du CMH (CMH-I sur toutes les cellules nucléées, CMH-II sur les CPA).",
      "Expliquer la sélection clonale des lymphocytes B et leur différenciation en plasmocytes sécréteurs.",
      "Schématiser la structure d'un anticorps (chaînes lourdes/légères, parties variables/constantes).",
      "Décrire la formation du complexe immun et son rôle dans la neutralisation et l'opsonisation pour la phagocytose.",
    ],
  },

  snv_immunology_cellular_response: {
    id: "snv_immunology_cellular_response",
    subjectId: "natural_sciences",
    title_ar: "الاستجابة المناعية ذات الوساطة الخلوية (LTc وإقصاء الخلايا المصابة)",
    title_fr: "Immunologie à médiation cellulaire : LTc et élimination des cellules cibles",
    description_ar: "شرح آلية التعرف المزدوج بين LT8 والخلايا المصابة، وتدخل LT4 عبر IL-2، وآلية السمية الخلوية بالبيرفورين والغرونزيم لإقصاء الخلايا المستهدفة.",
    description_fr: "Expliquer la double reconnaissance, la coopération via IL-2 des LT4, et les mécanismes cytotoxiques (perforine/granzyme) induisant l'apoptose.",
    dimensions: ["understanding", "application", "methodology"],
    repairStrategy_ar: "التأكيد الصارم على مبدأ 'التعرف المزدوج' وتدخل الإنترلوكينات كمؤشر حاسم لنجاح الاستجابة الخلوية ضد الخلايا السرطانية أو المصابة بفيروس.",
    repairStrategy_fr: "Souligner impérativement la double reconnaissance et la coopération cellulaire via les interleukines.",
    repairSteps_ar: [
      "تفسير آلية التعرف المزدوج بين مستقبل TCR للخلية LT8 ومعقد (CMHI - ببتيد مستضدي) المعروض على سطح الخلية المصابة.",
      "توضيح دور الخلية التائية المساعدة LT4 والمفرزة للإنترلوكين 2 (IL-2) في تحفيز تكاثر وتمايز LT8 إلى LTc سامة.",
      "شرح آلية التدمير الخلوي بواسطة البيرفورين (Perforine) الذي يحدث ثقوباً في غشاء الخلية المصابة والغرونزيم (Granzyme) المحفز للموت المبرمج.",
      "تحليل تجارب إثبات التخصص النوعي والتوافق النسيجي للخلايا LTc في إقصاء الخلايا المستهدفة.",
    ],
    repairSteps_fr: [
      "Expliquer la double reconnaissance entre TCR du LT8 et le complexe CMH-I/peptide antigénique.",
      "Détailler le rôle central du LT4 et de l'interleukine-2 (IL-2) dans la stimulation et différenciation des LTc.",
      "Décrire le mécanisme de cytotoxicité par libération de perforine et granzyme provoquant l'apoptose.",
      "Analyser les expériences démontrant la spécificité antigénique et la restriction tissulaire du LTc.",
    ],
  },

  snv_photosynthesis_light_dark_phases: {
    id: "snv_photosynthesis_light_dark_phases",
    subjectId: "natural_sciences",
    title_ar: "التركيب الضوئي: تفاعلات المرحلة الكيموضوئية والمرحلة الكيموحيوية (حلقة كالفن)",
    title_fr: "Photosynthèse : phase photochimique et phase biochimique (cycle de Calvin)",
    description_ar: "تتبع مسار الأكسدة الضوئية للماء وسلسلة نقل الإلكترونات وتركيب ATP و NADPH,H+، وربطها بتثبيت CO2 وإنتاج المادة العضوية في حلقة كالفن.",
    description_fr: "Décrire la photolyse de l'eau, le gradient de protons, la synthèse d'ATP/NADPH, et leur utilisation pour la fixation du CO2 dans le cycle de Calvin.",
    dimensions: ["knowledge", "understanding", "application"],
    repairStrategy_ar: "الربط التكاملي الحتمي بين نواتج المرحلة الكيموضوئية (ATP و NADPH,H+) واستهلاكها الإجباري في حلقة كالفن لإنتاج الغلوكوز.",
    repairStrategy_fr: "Mettre en évidence le couplage obligatoire entre les produits de la phase photochimique et la phase non photochimique.",
    repairSteps_ar: [
      "شرح أكسدة الماء الضوئية وانطلاق O2 وتراكم البروتونات H+ داخل تجويف التيلاكويد.",
      "تتبع مسار الإلكترونات عبر السلسلة التركيبية الضوئية من النظام الضوئي حتى المرجع النهائي +NADP لتشكيل NADPH,H+.",
      "تفسير تشكل ممال البروتونات ودوره في فسفرة ADP إلى ATP بواسطة الكرية المذنبة (ATP-synthase).",
      "شرح خطوات حلقة كالفن: تثبيت CO2 على الريديب (RuBP) بواسطة إنزيم الروبيسكو واستهلاك نواتج المرحلة الكيموضوئية لتشكيل المادة العضوية (السكر).",
    ],
    repairSteps_fr: [
      "Expliquer la photolyse de l'eau, le dégagement d'O2 et l'accumulation de protons dans le lumen thylakoïdien.",
      "Tracer le flux d'électrons le long de la chaîne photosynthétique jusqu'au récepteur final NADP+.",
      "Expliquer le gradient de protons et la phosphorylation de l'ADP en ATP via l'ATP-synthase.",
      "Détailler le cycle de Calvin: fixation du CO2 par la Rubisco et réduction en trioses phosphates grâce à l'ATP et NADPH.",
    ],
  },

  snv_respiration_fermentation_energy: {
    id: "snv_respiration_fermentation_energy",
    subjectId: "natural_sciences",
    title_ar: "التنفس والتخمر: أكسدة المادة العضوية والفسفرة التأكسدية (الميتوكوندري)",
    title_fr: "Respiration et fermentation : oxydation cellulaire et phosphorylation oxydative",
    description_ar: "تحديد مراحل التحلل السكري، تفاعلات حلقة كريبس في الميتوكوندري، السلسلة التنفسية والفسفرة التأكسدية، وحساب الحصيلة والمردود الطاقوي.",
    description_fr: "Détailler la glycolyse, le cycle de Krebs, la chaîne respiratoire mitochondriale, et comparer les bilans énergétiques de la respiration et de la fermentation.",
    dimensions: ["understanding", "application", "methodology"],
    repairStrategy_ar: "الربط بين بنيات الميتوكوندري وتمركز الإنزيمات ونواقل الإلكترونات، مع التأكيد على حساب الحصيلة الطاقوية الإجمالية ومفهوم المردود الطاقوي.",
    repairStrategy_fr: "Associer rigoureusement la compartimentation mitochondriale aux chaînes métaboliques et au calcul du rendement énergétique.",
    repairSteps_ar: [
      "تحديد مراحل التحلل السكري (Glycolyse) في الهيولى الأساسية ومصير حمض البيروفيك.",
      "تتبع تفاعلات حلقة كريبس داخل مادة الأساس للميتوكوندري ونزع الكربون ونزع الهيدروجين لتشكيل NADH,H+ و FADH2 و ATP.",
      "شرح الفسفرة التأكسدية على مستوى الغشاء الداخلي للميتوكوندري: أكسدة النواقل، ضخ البروتونات نحو الفراغ بين الغشائيين، ودور الأكسجين كمستقبل أخير للإلكترونات لتشكيل H2O.",
      "المقارنة بين الحصيلة الطاقوية للتنفس الخلوي (أكسدة تامة، 36 أو 38 ATP) والتخمر (أكسدة جزئية، 2 ATP) والمردود الطاقوي.",
    ],
    repairSteps_fr: [
      "Identifier les étapes de la glycolyse dans le hyaloplasme et le devenir du pyruvate.",
      "Suivre le cycle de Krebs dans la matrice mitochondriale avec décarboxylations et déshydrogénations.",
      "Détailler la phosphorylation oxydative: chaîne respiratoire, gradient de protons, et réduction de l'O2 en H2O.",
      "Comparer le bilan énergétique et le rendement entre la respiration cellulaire complète et la fermentation.",
    ],
  },
  // ---------------------------------------------------------------------------
  // ARABIC LANGUAGE & LITERATURE SKILLS (اللغة العربية وآدابها)
  // ---------------------------------------------------------------------------
  arabic_text_analysis_poetry_prose: {
    id: "arabic_text_analysis_poetry_prose",
    subjectId: "arabic",
    title_ar: "البناء الفكري: تحليل النص الشعري والنثري وتحديد النزعة والحقل المعجمي",
    title_fr: "Compréhension et analyse textuelle (poésie et prose), visée et champs lexicaux",
    description_ar: "تحديد النمط ومؤشراته، تحليل الحقول المعجمية والدلالية وعلاقتها بالفكرة العامة، وتحديد النزعات والقيم ومنهجية التلخيص.",
    description_fr: "Identifier les types de textes, analyser les champs lexicaux, repérer la visée de l'auteur et maîtriser la technique de synthèse.",
    dimensions: ["understanding", "methodology", "application"],
    repairStrategy_ar: "التركيز على الشواهد النصية المباشرة عند الإجابة عن أسئلة الفهم، والالتزام بتقنية التلخيص المنهجية (الأفكار الأساسية بأسلوب الطالب).",
    repairStrategy_fr: "S'appuyer systématiquement sur des citations textuelles et respecter la technique de synthèse.",
    repairSteps_ar: [
      "تحديد النمط النصي ومؤشراته (وصفي، سردي، حجاجي، تفسيري) مع التمثيل من النص.",
      "استخراج الحقول المعجمية والدلالية وتبيان علاقتها بالفكرة العامة للموضوع.",
      "تحديد نزعة الكاتب أو الشاعر (وطنية، قومية، إنسانية، دينية) وإبراز القيم المتضمنة.",
      "صياغة التلخيص بمراعاة الحجم (الربع)، الأسلوب الخاص، والالتزام الصارم بمضمون النص دون إبداء الرأي.",
    ],
    repairSteps_fr: [
      "Identifier le type de texte et ses indicateurs avec justification textuelle.",
      "Extraire les champs lexicaux et expliciter leur lien avec le thème central.",
      "Déterminer la visée et les valeurs de l'auteur (nationale, patriotique, humaniste).",
      "Rédiger un résumé fidèle respectant le quart de la longueur sans jugement personnel.",
    ],
  },

  arabic_linguistic_grammar_imagery: {
    id: "arabic_linguistic_grammar_imagery",
    subjectId: "arabic",
    title_ar: "البناء اللغوي: الإعراب التقديري والمحلي والصور البيانية والمحسنات",
    title_fr: "Analyse linguistique : grammaire, figures de style et cohérence textuelle",
    description_ar: "إعراب المفردات والجمل المقررة، وتحليل بلاغة الصور البيانية والمحسنات البديعية ودور أدوات الاتساق والانسجام في بناء النص.",
    description_fr: "Maîtriser l'analyse syntaxique, expliciter les figures de style et appréhender les mécanismes de cohésion textuelle.",
    dimensions: ["knowledge", "application", "methodology"],
    repairStrategy_ar: "تفكيك الصورة البيانية إلى أصلها التشبيهي أولاً للتعرف على المشبه والمشبه به المحذوف وتفادي الخلط بين الاستعارة والكناية.",
    repairStrategy_fr: "Décomposer l'image poétique en éléments comparatifs pour distinguer la métaphore de la métonymie.",
    repairSteps_ar: [
      "التمييز بين إعراب المفردات (إعراب 'إذ'، 'إذا'، 'إذن'، 'حينئذ' والتمييز والحال) وإعراب الجمل (التي لها محل والتي لا محل لها).",
      "تحديد نوع الصورة البيانية (تشبيه، استعارة مكنية/تصريحية، كناية) وشرح أركانها وتبيان بلاغتها وأثرها في المعنى.",
      "استخراج مظاهر الاتساق والانسجام (حروف العطف، الضمائر، التكرار، والأسماء الموصولة) وبيان دورها في بناء النص.",
      "استخراج المحسنات البديعية اللفظية والمعنوية (الطباق، الجناس، المقابلة) وتبيان أثرها.",
    ],
    repairSteps_fr: [
      "Distinguer l'analyse grammaticale des termes clés et la fonction syntaxique des propositions.",
      "Identifier et expliciter les figures de style (métaphore, métonymie, comparaison) et leur valeur rhétorique.",
      "Analyser la cohésion et la cohérence textuelle (anaphores, connecteurs logiques).",
      "Repérer les procédés stylistiques (antithèse, assonance) et leur impact sémantique.",
    ],
  },
  // ---------------------------------------------------------------------------
  // PHILOSOPHY SKILLS (الفلسفة للشعب العلمية)
  // ---------------------------------------------------------------------------
  philosophy_methodology_essay_scientific: {
    id: "philosophy_methodology_essay_scientific",
    subjectId: "philosophy",
    title_ar: "المنهجية الفلسفية: المقارنة، الجدل، والاستقصاء بالوضع للشعب العلمية",
    title_fr: "Méthodologie de la dissertation philosophique : comparaison, dialectique et plaidoyer",
    description_ar: "إتقان المنهجية الفلسفية لكتابة مقال متماسك (طرح المشكلة، محاجة ومناقشة ونقد، تركيب، وحل نهائي) وتجنب السرد الحفظي.",
    description_fr: "Maîtriser la méthodologie de l'essai philosophique (introduction, argumentation, critique, synthèse et conclusion argumentée).",
    dimensions: ["methodology", "understanding", "application"],
    repairStrategy_ar: "الابتعاد عن السرد الحفظي الجاف، والتركيز على الروابط المنطقية وبناء الحجة الفلسفية ونقد الموقف قبل الانتقال إلى الموقف المقابل.",
    repairStrategy_fr: "Privilégier l'argumentation rigoureuse et la transition logique plutôt que la récitation passive.",
    repairSteps_ar: [
      "ضبط مقدمة المقال: تمهيد وظيفي، إبراز العناد الفلسفي، وطرح الإشكال بصياغة سليمة.",
      "عرض الموقف الأول بحججه وبراهينه وأقوال الفلاسفة، ثم إتباعه بالمناقشة والنقد الموضوعي (شكلاً ومضموناً).",
      "عرض نقيض الموقف بنفس الهيكلة والدقة المنهجية مع نقد حججه.",
      "صياغة التركيب أو التجاوز مع التبرير، والخاتمة كحل نهائي منسجم مع مسار التحليل.",
    ],
    repairSteps_fr: [
      "Rédiger une introduction philosophique: mise en contexte, paradoxe et problématique.",
      "Développer la première thèse avec arguments et citations, suivie d'une critique objective.",
      "Présenter l'antithèse avec la même rigueur méthodologique et son évaluation critique.",
      "Formuler la synthèse argumentée et la conclusion répondant au problème initial.",
    ],
  },

  philosophy_epistemology_scientific_thinking: {
    id: "philosophy_epistemology_scientific_thinking",
    subjectId: "philosophy",
    title_ar: "فلسفة العلوم: المعرفة الرياضية والتجريبية والملاحظة والفرضية",
    title_fr: "Épistémologie et philosophie des sciences : mathématiques et méthode expérimentale",
    description_ar: "تحليل إشكاليات فلسفة العلوم: أصل المفاهيم الرياضية واليقين الرياضي، خطوات وحدود المنهج التجريبي، وعوائق التجريب في علوم المادة الحية.",
    description_fr: "Analyser les fondements épistémologiques : origine des mathématiques, valeur de la méthode expérimentale et sciences du vivant.",
    dimensions: ["knowledge", "understanding", "methodology"],
    repairStrategy_ar: "استثمار المعطيات والخبرة العلمية للطالب كأمثلة واقعية في المقال لتدعيم الحجج الإبستمولوجية المعاصرة.",
    repairStrategy_fr: "Illustrer les arguments philosophiques par des exemples scientifiques concrets tirés du programme.",
    repairSteps_ar: [
      "تحليل مشكلة أصل المفاهيم الرياضية (العقل مقابل التجربة والحواس).",
      "استيعاب خطوات المنهج التجريبي في علوم المادة الجامدة والحية وحدود تطبيقها (الحتمية واللاحتمية).",
      "مناقشة قيمة الفرضية العلمية بين التجريبيين والعقلانيين المعاصرين.",
      "فهم عوائق تطبيق المنهج التجريبي على الحادثة البيولوجية والإنسانية.",
    ],
    repairSteps_fr: [
      "Analyser l'origine des concepts mathématiques (rationalisme vs empirisme).",
      "Comprendre les étapes de la démarche expérimentale et les limites du déterminisme.",
      "Discuter de la valeur de l'hypothèse scientifique dans l'épistémologie moderne.",
      "Identifier les obstacles épistémologiques dans l'application de la méthode aux sciences du vivant.",
    ],
  },
};

import { ALL_CURRICULUM_SKILLS } from "@/data/curriculum/skills";
import { GESTION_ECO_SKILLS } from "./gestion-economie";
import { LETTRES_PHILO_SKILLS } from "./lettres-philo";
import { normalizeStreamId } from "@/lib/curriculum/filter";

export { GESTION_ECO_SKILLS, LETTRES_PHILO_SKILLS };

export function getSkillById(skillId: string): Skill | undefined {
  return (
    (LETTRES_PHILO_SKILLS as unknown as Record<string, Skill>)[skillId] ||
    (GESTION_ECO_SKILLS as unknown as Record<string, Skill>)[skillId] ||
    (ALL_CURRICULUM_SKILLS as unknown as Record<string, Skill>)[skillId] ||
    SCIENCES_EXP_SKILLS[skillId]
  );
}

export function getSkillsForSubject(subjectId: string, streamId?: string): Skill[] {
  const normStream = normalizeStreamId(streamId);

  // 1. Strict Lettres & Philosophie Stream Isolation
  if (normStream === "lettres_philo") {
    return Object.values(LETTRES_PHILO_SKILLS).filter(
      (s) => s.subjectId === subjectId
    ) as unknown as Skill[];
  }

  // 2. Strict Gestion & Économie Stream Isolation
  if (normStream === "gestion_eco") {
    return Object.values(GESTION_ECO_SKILLS).filter(
      (s) => s.subjectId === subjectId
    ) as unknown as Skill[];
  }

  // 3. Strict Sciences Expérimentales Stream Isolation
  if (normStream === "sciences_exp") {
    const curriculumSkills = Object.values(ALL_CURRICULUM_SKILLS).filter((s) => s.subjectId === subjectId);
    if (curriculumSkills.length > 0) return curriculumSkills as unknown as Skill[];
    return Object.values(SCIENCES_EXP_SKILLS).filter((s) => s.subjectId === subjectId);
  }

  // 4. Strict Math & Technique Math Stream Isolation
  if (normStream === "math" || normStream === "technique_math") {
    // Pull from ALL_CURRICULUM_SKILLS first, then fall back to SCIENCES_EXP_SKILLS math entries
    const curriculumMath = Object.values(ALL_CURRICULUM_SKILLS).filter(
      (s) => (s.subjectId === "math" || s.subjectId === "physics") && s.subjectId === subjectId
    ) as unknown as Skill[];
    if (curriculumMath.length > 0) return curriculumMath;
    return Object.values(SCIENCES_EXP_SKILLS).filter(
      (s) => s.subjectId === subjectId
    );
  }

  // 5. Langues Étrangères Stream
  if (normStream === "langues_etrangeres") {
    return Object.values(LETTRES_PHILO_SKILLS).filter(
      (s) => s.subjectId === subjectId
    ) as unknown as Skill[];
  }

  // 6. Safe Fallback: Check skills by explicit subject without cross-stream bleeding
  const philoMatch = Object.values(LETTRES_PHILO_SKILLS).filter((s) => s.subjectId === subjectId);
  if (subjectId === "philosophy" && philoMatch.length > 0) return philoMatch as unknown as Skill[];

  const gestionMatch = Object.values(GESTION_ECO_SKILLS).filter((s) => s.subjectId === subjectId);
  if (
    (subjectId === "accounting_finance" || subjectId === "economics_management" || subjectId === "law") &&
    gestionMatch.length > 0
  ) {
    return gestionMatch as unknown as Skill[];
  }

  const curriculumSkills = Object.values(ALL_CURRICULUM_SKILLS).filter((s) => s.subjectId === subjectId);
  if (curriculumSkills.length > 0) return curriculumSkills as unknown as Skill[];
  return Object.values(SCIENCES_EXP_SKILLS).filter((s) => s.subjectId === subjectId);
}


