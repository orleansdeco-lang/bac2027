/**
 * BAC Mastery — Subject Methodology Registry
 * Prompt 18.1: Subject-Specific Epistemic Models & Pedagogical Families
 * 
 * Rules:
 * - Decouples universal learning cycles from subject-specific cognitive demands.
 * - Language separation: educational content language is subject-driven, decoupled from UI language.
 * - Technique Math: 4 engineering specialties strictly separated.
 * - Coefficients: labeled "provisional_benchmark", never claimed as officially current.
 */

import { SubjectMethodologyProfile, MethodologyFamily } from "./types";
import { SubjectId, TechniqueMathSpecialty } from "@/types/education";

export const SUBJECT_METHODOLOGY_REGISTRY: Record<SubjectId, SubjectMethodologyProfile> = {
  // 1. MATHEMATICS
  math: {
    family: "mathematics",
    subjectId: "math",
    displayName_ar: "الرياضيات",
    displayName_fr: "Mathématiques",
    contentLanguage: "ar",
    textDirection: "rtl",
    coreEpistemicSequence: [
      "تعريف المفهوم والشروط الرياضية",
      "الاستدلال واختيار الطريقة المناسبة",
      "النمذجة الرياضية والمثال المحلول",
      "الحساب الدقيق والمراقبة الذاتية",
      "التحقق والتأويل البياني أو الهندسي",
      "التحويل إلى سياق مسألة البكالوريا",
    ],
    typicalCognitiveDemands: [
      "التمييز بين طرائق الحل في التمارين غير المصنفة",
      "الانتقال السلس بين التمثيل الجبري والتمثيل البياني",
      "الصرامة في كتابة الاستدلال الرياضي (مبرهنة القيم المتوسطة، الاستدلال بالتراجع)",
    ],
    preferredStudyProtocol: "STEM Problem Solving: إغلاق الحل، كتابة الاستدلال خطوة بخطوة، والتحقق الحسابي",
    practiceProgressionModel: ["guided", "semi_guided", "independent", "mixed", "transfer", "exam"],
    dominantErrorTypes: ["calculation_error", "misunderstood_concept", "methodology_error", "misread_question"],
    examTransferCharacteristics: [
      "مسائل الدوال الشاملة ذات الجزأين أو الأجزاء الثلاثة المترابطة",
      "تمارين المتتاليات المترابطة بالدوال أو البرهان بالتراجع",
      "مسائل الاحتمالات أو الأعداد المركبة المركبة سياقياً",
    ],
    coefficientStatus: "provisional_benchmark",
    provisionalCoefficient: 5, // Sciences Exp default baseline
  },

  // 2. PHYSICS & CHEMISTRY
  physics: {
    family: "physics_chemistry",
    subjectId: "physics",
    displayName_ar: "العلوم الفيزيائية",
    displayName_fr: "Sciences Physiques",
    contentLanguage: "ar",
    textDirection: "rtl",
    coreEpistemicSequence: [
      "وصف الظاهرة الفيزيائية أو التحول الكيميائي",
      "تحديد النموذج الفيزيائي والشروط الابتدائية والحدودية",
      "استحضار القانون المناسب وتبرير شروط تطبيقه",
      "استخراج العلاقات الحرفية قبل أي حساب عددي",
      "التحويل الصارم للوحدات إلى النظام الدولي (SI)",
      "الحساب العددي وتأطير النتيجة وفحص المعقولية الفيزيائية",
    ],
    typicalCognitiveDemands: [
      "استغلال المنحنيات البيانية (الميل، القيمة الابتدائية، نقطة التكافؤ، زمن نصف التفاعل)",
      "تحديد المرجع المناسب وإسقاط الأشعة وفق محاور الحركة (الميكانيك)",
      "تحليل شروط التوازن الكيميائي والتحولات النووية وحصيلة الطاقة",
    ],
    preferredStudyProtocol: "Phenomenon-to-Formula: فهم فيزيائي، تمثيل تخطيطي، معادلة حرفية، تدقيق الوحدات",
    practiceProgressionModel: ["guided", "semi_guided", "independent", "mixed", "transfer", "exam"],
    dominantErrorTypes: ["calculation_error", "forgot_information", "methodology_error", "misread_question"],
    examTransferCharacteristics: [
      "تمارين المتابعة الزمنية لتحول كيميائي مع منحنيات تجريبية متعددة",
      "دراسة حركات الكواكب والأقمار أو القذائف والمستويات",
      "الدارات الكهربائية RC و RL مع استنتاج الثوابت الزمنية من البيانات",
    ],
    coefficientStatus: "provisional_benchmark",
    provisionalCoefficient: 5,
  },

  // 3. NATURAL SCIENCES (SNV)
  natural_sciences: {
    family: "natural_sciences",
    subjectId: "natural_sciences",
    displayName_ar: "علوم الطبيعة والحياة",
    displayName_fr: "Sciences de la Nature et de la Vie",
    contentLanguage: "ar",
    textDirection: "rtl",
    coreEpistemicSequence: [
      "قراءة السياق العلمي بدقة وتحديد المشكل البيولوجي",
      "استغلال الوثائق: ملاحظة دقيقة للمعطيات (تحليل منظم)",
      "تفسير المعطيات: الربط بين الملاحظة والمعارف البيولوجية (علاقة سببية)",
      "استخلاص النتائج الجزئية من كل وثيقة",
      "التركيب والحل الإجمالي للمشكل العلمي المطروح في نص علمي أو رسم تخطيطي",
    ],
    typicalCognitiveDemands: [
      "الفصل المنهجي بين التحليل (الملاحظة المباشرة) والتفسير (الربط السببي)",
      "بناء نص علمي مهيكل (مقدمة ومشكل علمي، عرض متسلسل بالحجج، وخاتمة)",
      "قراءة الوثائق المركبة (أعمدة بيانية، جداول تجريبية، صور مجهرية)",
    ],
    preferredStudyProtocol: "Methodological Document Exploitation: ملاحظة، تفسير سببي، استنتاج، وتركيب منظم",
    practiceProgressionModel: ["guided", "semi_guided", "independent", "transfer", "exam"],
    dominantErrorTypes: ["methodology_error", "misunderstood_concept", "misread_question"],
    examTransferCharacteristics: [
      "تمرين المهمة البسيطة (استرجاع منظم للمعارف)",
      "تمرين الاستدلال العلمي ذو الجزأين مع فرضيات وتفسير وثائق",
      "تمرين المسعى العلمي الشامل مع مناقشة واستنتاج بيولوجي",
    ],
    coefficientStatus: "provisional_benchmark",
    provisionalCoefficient: 6,
  },

  // 4. HISTORY & GEOGRAPHY
  history_geography: {
    family: "history_geography",
    subjectId: "history_geography",
    displayName_ar: "التاريخ والجغرافيا",
    displayName_fr: "Histoire-Géographie",
    contentLanguage: "ar",
    textDirection: "rtl",
    coreEpistemicSequence: [
      "فهم السياق التاريخي أو الجغرافي والظاهرة المدروسة",
      "هيكلة الأحداث والمفاهيم في خطوط زمنية أو شبكات سببية",
      "الاسترجاع النشط للمصطلحات والشخصيات والتواريخ المحورية",
      "منهجية تحليل السندات (خرائط، رسومات بيانية، نصوص)",
      "صياغة مقال منهجي متوازن (مقدمة، عناصر الإشكالية، خاتمة)",
    ],
    typicalCognitiveDemands: [
      "الربط السببي بين أحداث الحرب الباردة وحركات التحرر والثورة الجزائرية",
      "قراءة الجداول الجغرافية واستخلاص المؤشرات الاقتصادية",
      "التوقيع الدقيق على الخرائط الصماء",
    ],
    preferredStudyProtocol: "Cause-and-Effect Mind Dump: خطوط زمنية، خرائط مفاهيمية، واسترجاع متباعد للحقائق",
    practiceProgressionModel: ["guided", "independent", "transfer", "exam"],
    dominantErrorTypes: ["forgot_information", "methodology_error", "misread_question"],
    examTransferCharacteristics: [
      "الجزء الأول: مصطلحات، شخصيات، تواريخ، توقيع على الخريطة",
      "الجزء الثاني: كتابة مقال تاريخي أو جغرافي بالإجابة على سؤالين إشكاليتين",
    ],
    coefficientStatus: "provisional_benchmark",
    provisionalCoefficient: 2,
  },

  // 5. PHILOSOPHY
  philosophy: {
    family: "philosophy",
    subjectId: "philosophy",
    displayName_ar: "الفلسفة",
    displayName_fr: "Philosophie",
    contentLanguage: "ar",
    textDirection: "rtl",
    coreEpistemicSequence: [
      "ضبط المفاهيم الفلسفية وتحديد الإشكالية المركزية",
      "تحليل الموقف الأول: حججه، فلاسفته، وأمثلته الواقعية",
      "نقد وتقييم الموقف الأول ببيان حدوده ونقائصه",
      "تحليل الموقف النقيض: حججه وأمثلته",
      "نقد الموقف الثاني واستخلاص الموقف التوفيقي أو التجاوزي",
      "كتابة المقال الفلسفي المنهجي (جدلية، مقارنة، استقصاء بالوضع، تحليل نص)",
    ],
    typicalCognitiveDemands: [
      "بناء الحجاج الفلسفي السليم والابتعاد عن السرد الإنشائي العشوائي",
      "التفريق الصارم بين طرائق المقال الفلسفي الأربعة",
      "استثمار الأمثلة الواقعية والأقوال الفلسفية الدقيقة لدعم المواقف",
    ],
    preferredStudyProtocol: "Argument Matrix: مخطط المواقف، الحجج، النقد، والتركيب المنهجي بدون حفظ إنشائي أعمى",
    practiceProgressionModel: ["guided", "semi_guided", "independent", "transfer", "exam"],
    dominantErrorTypes: ["methodology_error", "misunderstood_concept", "forgot_information"],
    examTransferCharacteristics: [
      "موضوعان مقالان (جدلي / استقصاء أو مقارنة) + موضوع تحليل نص فلسفي",
    ],
    coefficientStatus: "provisional_benchmark",
    provisionalCoefficient: 2,
  },

  // 6. ISLAMIC STUDIES
  islamic_studies: {
    family: "islamic_studies",
    subjectId: "islamic_studies",
    displayName_ar: "العلوم الإسلامية",
    displayName_fr: "Sciences Islamiques",
    contentLanguage: "ar",
    textDirection: "rtl",
    coreEpistemicSequence: [
      "فهم المعنى العام للآية أو الحديث النبوي الشريف",
      "استيعاب التعريفات اللغوية والاصطلاحية للأحكام والمفاهيم",
      "تحليل الدلالات الشرعية والمقاصد والأحكام والقيم",
      "استخراج الفوائد والأحكام الشرعية من النصوص بطريقة استنباطية",
      "الاسترجاع الدقيق للأدلة والاستشهاد المناسب في الأسئلة الجزئية",
    ],
    typicalCognitiveDemands: [
      "الاستنباط المنهجي للأحكام والفوائد وصياغتها صياغة شرعية دقيقة",
      "التمييز بين مقاصد الشريعة (ضروريات، حاجيات، تحسينيات)",
      "الربط بين القيم القرآنية والواقع الاجتماعي والسلوكي المعاصر",
    ],
    preferredStudyProtocol: "Concept & Evidence Retrieval: فهم المعنى، استنباط الأحكام، واسترجاع متباعد للأدلة الشرعية",
    practiceProgressionModel: ["guided", "independent", "transfer", "exam"],
    dominantErrorTypes: ["forgot_information", "methodology_error", "misunderstood_concept"],
    examTransferCharacteristics: [
      "نص شرعي قرآني أو حديث تليه أسئلة فهم وتحليل واستخراج أحكام وفوائد",
    ],
    coefficientStatus: "provisional_benchmark",
    provisionalCoefficient: 2,
  },

  // 7. ARABIC LANGUAGE & LITERATURE
  arabic: {
    family: "languages",
    subjectId: "arabic",
    displayName_ar: "اللغة العربية وآدابها",
    displayName_fr: "Langue et Littérature Arabes",
    contentLanguage: "ar",
    textDirection: "rtl",
    coreEpistemicSequence: [
      "القراءة الاستكشافية للنص الشعري أو النثري وفهم دلالاته",
      "البناء الفكري: تحديد الفكرة العامة، الأفكار الفرعية، النزعة، والنمط",
      "البناء اللغوي: الإعراب، القواعد، الصور البيانية، والمحسنات البديعية",
      "التقويم النقدي: خصائص العصر، مدرسة الشاعر، وأثر الظاهرة الأدبية",
    ],
    typicalCognitiveDemands: [
      "تحليل الصور البيانية وسر بلاغتها دون الاكتفاء بالتسمية المجردة",
      "إتقان إعراب المفردات وإعراب الجمل المبرمج في السنة الثالثة ثانوي",
      "التعليل الدقيق لأنماط النصوص ومؤشراتها الأدبية",
    ],
    preferredStudyProtocol: "Text Dissection: تحليل فكري، تدريب نحوي وبلاغي، وتطبيقات مستمرة على نصوص البكالوريا",
    practiceProgressionModel: ["guided", "semi_guided", "independent", "transfer", "exam"],
    dominantErrorTypes: ["methodology_error", "misread_question", "forgot_information"],
    examTransferCharacteristics: [
      "اختيار بين موضوع شعر (ثوري / مهجري / ديني) وموضوع نثر علمي أو مقال",
    ],
    coefficientStatus: "provisional_benchmark",
    provisionalCoefficient: 3,
  },

  // 8. FRENCH LANGUAGE
  french: {
    family: "languages",
    subjectId: "french",
    displayName_ar: "اللغة الفرنسية",
    displayName_fr: "Français",
    contentLanguage: "fr",
    textDirection: "ltr",
    coreEpistemicSequence: [
      "Lecture attentive et compréhension globale du texte support",
      "Identification de la visée communicative de l'auteur",
      "Analyse lexicale et syntaxique ciblée (voix passive, discours rapporté, conditionnel)",
      "Réponses précises aux questions de compréhension de l'écrit",
      "Production écrite : compte-rendu objectif ou essai argumentatif",
    ],
    typicalCognitiveDemands: [
      "Repérage des indices d'énonciation et de la subjectivité de l'auteur",
      "Maîtrise de la technique du compte-rendu objectif sans paraphrase",
      "Reformulation rigoureuse des idées du texte",
    ],
    preferredStudyProtocol: "Document Reading & Objective Synthesis: lecture active, repérage énonciatif, compte-rendu",
    practiceProgressionModel: ["guided", "independent", "transfer", "exam"],
    dominantErrorTypes: ["misread_question", "methodology_error", "misunderstood_concept"],
    examTransferCharacteristics: [
      "Texte d'histoire ou texte argumentatif suivi de 6-8 questions de compréhension et d'un compte-rendu",
    ],
    coefficientStatus: "provisional_benchmark",
    provisionalCoefficient: 2,
  },

  // 9. ENGLISH LANGUAGE
  english: {
    family: "languages",
    subjectId: "english",
    displayName_ar: "اللغة الإنجليزية",
    displayName_fr: "Anglais",
    contentLanguage: "en",
    textDirection: "ltr",
    coreEpistemicSequence: [
      "Skimming & scanning the text for general and specific ideas",
      "Reading comprehension questions (True/False, table completion, Wh-questions)",
      "Text exploration: synonyms, opposites, word formation (prefixes/suffixes)",
      "Grammar in context (conditionals, passive voice, linkers, wishes)",
      "Written expression: guided or free composition using topic vocabulary",
    ],
    typicalCognitiveDemands: [
      "Locating exact textual evidence for answer justification",
      "Accurate morphological word-building and grammatical transformations",
      "Structured paragraph writing with topic sentence and supporting evidence",
    ],
    preferredStudyProtocol: "Text Exploration & Structural Practice: active vocabulary retrieval, syntax drills, paragraph synthesis",
    practiceProgressionModel: ["guided", "independent", "transfer", "exam"],
    dominantErrorTypes: ["misread_question", "forgot_information", "methodology_error"],
    examTransferCharacteristics: [
      "Text comprehension (7-8 points) + Text exploration (7-8 points) + Written expression (5 points)",
    ],
    coefficientStatus: "provisional_benchmark",
    provisionalCoefficient: 2,
  },

  // 10. THIRD FOREIGN LANGUAGE
  third_language: {
    family: "languages",
    subjectId: "third_language",
    displayName_ar: "اللغة الأجنبية الثالثة (إسبانية / ألمانية / إيطالية)",
    displayName_fr: "Troisième Langue Vivante",
    contentLanguage: "es", // Default representative
    textDirection: "ltr",
    coreEpistemicSequence: [
      "Comprensión textual y lectura analítica",
      "Morfosintaxis y estructuras gramaticales fundamentales",
      "Léxico temático y relaciones semánticas",
      "Expresión escrita guiada según la metodología del examen",
    ],
    typicalCognitiveDemands: [
      "Conjugación verbal y concordancia temporal",
      "Comprensión contextual de vocabulario temático",
    ],
    preferredStudyProtocol: "Targeted Foreign Language Mastery: práctica de comprensión, léxico guiado, producción estructurada",
    practiceProgressionModel: ["guided", "independent", "transfer", "exam"],
    dominantErrorTypes: ["forgot_information", "misread_question"],
    examTransferCharacteristics: [
      "Comprensión de lectura, gramática aplicada y redacción guiada",
    ],
    coefficientStatus: "provisional_benchmark",
    provisionalCoefficient: 4,
  },

  // 11. ACCOUNTING & FINANCIAL MANAGEMENT (Gestion & Économie)
  accounting_finance: {
    family: "economics_management",
    subjectId: "accounting_finance",
    displayName_ar: "التسيير المحاسبي والمالي",
    displayName_fr: "Gestion Comptable et Financière",
    contentLanguage: "ar",
    textDirection: "rtl",
    coreEpistemicSequence: [
      "فهم المبادئ المحاسبية ودليل الحسابات الوطني (SCF)",
      "قراءة القيود والعمليات المالية وتسجيلها محاسبياً",
      "تسويات نهاية السنة: الاهتلاكات، خسائر القيمة، والمؤونات",
      "إعداد الكشوف المالية والميزانية وتحليل الاستغلال الوظيفي",
      "التدقيق الحسابي وتأطير النتائج المحاسبية",
    ],
    typicalCognitiveDemands: [
      "التحكم الدقيق في أرقام الحسابات وتوازنات الأصول والخصوم",
      "التسجيل الدقيق لقيود التسوية وجداول الاهتلاك الخطي والمتناقص والمتزايد",
    ],
    preferredStudyProtocol: "Accounting Procedure & Balance Check: فهم قيد، تطبيق جدولي، ومراقبة توازن الحسابات",
    practiceProgressionModel: ["guided", "semi_guided", "independent", "transfer", "exam"],
    dominantErrorTypes: ["calculation_error", "methodology_error", "forgot_information"],
    examTransferCharacteristics: [
      "مسائل شاملة تجمع بين الاهتلاكات، قيود التسوية، الميزانية الوظيفية، وجدول حسابات النتائج",
    ],
    coefficientStatus: "provisional_benchmark",
    provisionalCoefficient: 6,
  },

  // 12. ECONOMICS & MANAGEMENT
  economics_management: {
    family: "economics_management",
    subjectId: "economics_management",
    displayName_ar: "الاقتصاد والمناجمنت",
    displayName_fr: "Économie et Management",
    contentLanguage: "ar",
    textDirection: "rtl",
    coreEpistemicSequence: [
      "ضبط المفاهيم والمصطلحات الاقتصادية (التضخم، البطالة، النقود، البنوك)",
      "فهم آليات عمل السوق والتجارة الخارجية وميزان المدفوعات",
      "استيعاب وظائف الإدارة الاستراتيجية والتنظيمية في المؤسسة",
      "معالجة الوضعيات الاقتصادية والتسييرية الملموسة",
    ],
    typicalCognitiveDemands: [
      "الربط المنطقي بين السياسات الاقتصادية والآثار المترتبة عليها",
      "تحليل الوضعيات الإدارية واقتراح حلول تنظيمية",
    ],
    preferredStudyProtocol: "Concept & Case Matrix: تعريفات محددة، علاقات سببية، وتحليل وضعيات البكالوريا",
    practiceProgressionModel: ["guided", "independent", "transfer", "exam"],
    dominantErrorTypes: ["forgot_information", "misunderstood_concept", "methodology_error"],
    examTransferCharacteristics: [
      "أسئلة معرفية مباشرة ووضعية إدماجية اقتصادية وتسييرية",
    ],
    coefficientStatus: "provisional_benchmark",
    provisionalCoefficient: 5,
  },

  // 13. LAW (Droit)
  law: {
    family: "economics_management",
    subjectId: "law",
    displayName_ar: "القانون",
    displayName_fr: "Droit",
    contentLanguage: "ar",
    textDirection: "rtl",
    coreEpistemicSequence: [
      "فهم أركان وشروط ومفاهيم العقود والنصوص القانونية",
      "التمييز بين فروع القانون (عقد العمل، الشركات، الملكية)",
      "استيعاب النصوص القانونية وتكييفها مع الوضعيات الواقعية",
      "حل النزاعات القانونية الافتراضية وفق المواد والتشريعات المقررة",
    ],
    typicalCognitiveDemands: [
      "التكييف القانوني السليم للوقائع (تحديد نوع العقد أو سبب بطلانه)",
      "الصياغة القانونية الموضوعية والمنظمة",
    ],
    preferredStudyProtocol: "Legal Reasoning Protocol: توصيف الواقعة، استحضار السند القانوني، وتطبيق الحكم المباشر",
    practiceProgressionModel: ["guided", "independent", "transfer", "exam"],
    dominantErrorTypes: ["forgot_information", "methodology_error", "misread_question"],
    examTransferCharacteristics: [
      "أسئلة نظرية مباشرة + وضعية قانونية تتطلب تحليلاً وحلاً معللاً",
    ],
    coefficientStatus: "provisional_benchmark",
    provisionalCoefficient: 2,
  },

  // 14. CIVIL ENGINEERING (Technique Math)
  civil_eng: {
    family: "technique_math",
    subjectId: "civil_eng",
    displayName_ar: "الهندسة المدنية",
    displayName_fr: "Génie Civil",
    contentLanguage: "ar",
    textDirection: "rtl",
    coreEpistemicSequence: [
      "دراسة وتحديد القوى والإجهادات المؤثرة على المنشآت",
      "حساب العزوم ومخططات قوى القص وعزوم الانحناء في الروافد",
      "التحقق من شروط المقاومة والاستقرار في الخرسانة المسلحة والصلب",
      "قراءة المخططات المعمارية والتنفيذية والمقاطع العرضية والطولية",
    ],
    typicalCognitiveDemands: [
      "الصرامة في تطبيق قوانين التحريك وعلم السكون (Statique)",
      "قراءة المخططات الفنية وحساب الأطوال والمناسيب والتسليح",
    ],
    preferredStudyProtocol: "Engineering Statics & Structural Check: عزل الجملة، حساب ردود الأفعال، ورسم المخططات",
    practiceProgressionModel: ["guided", "semi_guided", "independent", "transfer", "exam"],
    dominantErrorTypes: ["calculation_error", "methodology_error", "misunderstood_concept"],
    examTransferCharacteristics: [
      "مشروع دراسة منشأ كامل (ميكانيك مطبق، خرسانة مسلحة، ومخططات تقنية)",
    ],
    specialtyIdentifier: "civil_eng",
    coefficientStatus: "provisional_benchmark",
    provisionalCoefficient: 7,
  },

  // 15. MECHANICAL ENGINEERING (Technique Math)
  mechanical_eng: {
    family: "technique_math",
    subjectId: "mechanical_eng",
    displayName_ar: "الهندسة الميكانيكية",
    displayName_fr: "Génie Mécanique",
    contentLanguage: "ar",
    textDirection: "rtl",
    coreEpistemicSequence: [
      "تحليل النظم والآليات الميكانيكية ودراسة مسارات الحركة والسرعات",
      "مقاومة المواد (RDM): دراسة الشد، الانضغاط، القص، والالتواء",
      "قراءة وتفسير الرسم التجميعي والرسوم التعاريفية للقطع",
      "سلسلة الأبعاد والتسامحات الهندسية والوصلات الميكانيكية",
      "تحديد طرائق التصنيع والتشغيل على الآلات المبرمجة",
    ],
    typicalCognitiveDemands: [
      "الفهم الفضائي لحركة القطع الميكانيكية ونقل الحركة",
      "حساب المقاومة ومعاملات الأمان بدقة عددية تامة",
    ],
    preferredStudyProtocol: "Mechanism Dissection: تحليل وظيفي، دراسة حركية وإجهادات، وإعداد جداول التشغيل",
    practiceProgressionModel: ["guided", "semi_guided", "independent", "transfer", "exam"],
    dominantErrorTypes: ["calculation_error", "methodology_error", "misread_question"],
    examTransferCharacteristics: [
      "دراسة نظام آلي صناعي متكامل (تحليل وظيفي، RDM، رسم تقني، وتصنيع)",
    ],
    specialtyIdentifier: "mechanical_eng",
    coefficientStatus: "provisional_benchmark",
    provisionalCoefficient: 7,
  },

  // 16. ELECTRICAL ENGINEERING (Technique Math)
  electrical_eng: {
    family: "technique_math",
    subjectId: "electrical_eng",
    displayName_ar: "الهندسة الكهربائية",
    displayName_fr: "Génie Électrique",
    contentLanguage: "ar",
    textDirection: "rtl",
    coreEpistemicSequence: [
      "تحليل الدارات المنطقية والتوليفية والتعاقبية (السجلات، العدادات)",
      "دراسة المنطق التعاقبي والغرافست (GRAFCET) بمختلف مستوياته",
      "التحكم في المحركات الكهربائية (المحرك اللاتزامني والمستمر)",
      "المضخمات العملياتية وتوليد الإشارات وتحويل الطاقة",
      "برمجة المتحكمات الدقيقة وتكييف الإشارات التناظرية والرقمية",
    ],
    typicalCognitiveDemands: [
      "تصميم الجداول المنطقية ومعادلات كارنو والغرافست دون أخطاء تعاقبية",
      "تحليل وظائف التغذية والتحويل والاستطاعة الكهربائية",
    ],
    preferredStudyProtocol: "Circuit & GRAFCET Synthesis: تحليل المخططات، كتابة المعادلات المنطقية، ورسم المخططات الزمنية",
    practiceProgressionModel: ["guided", "semi_guided", "independent", "transfer", "exam"],
    dominantErrorTypes: ["methodology_error", "calculation_error", "misunderstood_concept"],
    examTransferCharacteristics: [
      "دراسة نظام صناعي آلي كامل (تغذية، غرافست، دوائر منطقية، ومحركات)",
    ],
    specialtyIdentifier: "electrical_eng",
    coefficientStatus: "provisional_benchmark",
    provisionalCoefficient: 7,
  },

  // 17. PROCESS ENGINEERING (Technique Math)
  process_eng: {
    family: "technique_math",
    subjectId: "process_eng",
    displayName_ar: "هندسة الطرائق",
    displayName_fr: "Génie des Procédés",
    contentLanguage: "ar",
    textDirection: "rtl",
    coreEpistemicSequence: [
      "الكيمياء العضوية: آليات التفاعل، التسميات النظامية، وتخليق المركبات",
      "الديناميكا الحرارية الكيميائية (حساب الأنطالبي، الأنتروبي، وطاقة غيبس)",
      "الحركية الكيميائية وتوازنات الأطوار وعمليات الفصل الصناعي",
      "العمليات الصناعية: التقطير، الاستخلاص، ومعالجة المياه والمحروقات",
      "مراقبة الجودة والتحاليل الفيزيوكيميائية",
    ],
    typicalCognitiveDemands: [
      "إتقان سلاسل التفاعلات العضوية وصيغ المركبات نصف المفصلة",
      "حساب حصائل المادة والطاقة في العمليات الصناعية المستمرة والمتقطعة",
    ],
    preferredStudyProtocol: "Organic & Thermodynamic Rigor: كتابة التفاعلات، توازن المعادلات، وحساب حصيلة الطاقة",
    practiceProgressionModel: ["guided", "semi_guided", "independent", "transfer", "exam"],
    dominantErrorTypes: ["calculation_error", "forgot_information", "methodology_error"],
    examTransferCharacteristics: [
      "مسألة كيمياء عضوية تخليقية + دراسة ديناميكا حرارية أو وحدة صناعية",
    ],
    specialtyIdentifier: "process_eng",
    coefficientStatus: "provisional_benchmark",
    provisionalCoefficient: 7,
  },
};

/**
 * Helper to retrieve methodology profile for a given subject
 */
export function getSubjectMethodology(subjectId: SubjectId): SubjectMethodologyProfile {
  const profile = SUBJECT_METHODOLOGY_REGISTRY[subjectId];
  if (!profile) {
    throw new Error(`SubjectMethodologyProfile not registered for subjectId: ${subjectId}`);
  }
  return profile;
}
