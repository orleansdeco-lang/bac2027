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
};

import { ALL_CURRICULUM_SKILLS } from "@/data/curriculum/skills";

export function getSkillById(skillId: string): Skill | undefined {
  return ALL_CURRICULUM_SKILLS[skillId] || SCIENCES_EXP_SKILLS[skillId];
}

export function getSkillsForSubject(subjectId: string): Skill[] {
  const curriculumSkills = Object.values(ALL_CURRICULUM_SKILLS).filter((s) => s.subjectId === subjectId);
  if (curriculumSkills.length > 0) return curriculumSkills;
  return Object.values(SCIENCES_EXP_SKILLS).filter((s) => s.subjectId === subjectId);
}

