// ==============================================================================
// src/lib/orientation/data/study-abroad.ts
// Authoritative Study Abroad Database tailored specifically for Algerian Students
// Focusing exclusively on destination countries & universities attended by Algerians
// All costs in US Dollars ($ USD) with clear BAC GPA & language requirements
// ==============================================================================

export interface StudyAbroadUniversity {
  id: string;
  nameAr: string;
  nameOriginal: string;
  cityAr: string;
  countryCode: string;
  countryNameAr: string;
  flagEmoji: string;
  worldRankRange: string;
  teachingLanguage: string[];
  popularMajors: string[];
  minimumBacAverage: number;
  minBacStream?: string[];
  tuitionUsdPerYear: {
    min: number;
    max: number;
    isFreeOrExempt?: boolean;
    notesAr: string;
  };
  livingCostUsdPerYear: {
    min: number;
    max: number;
    notesAr: string;
  };
  admissionRequirements: string[];
  languageRequirements: string[];
  visaAndProcedures: {
    procedureNameAr: string;
    descriptionAr: string;
    officialPortalUrl?: string;
  };
  scholarshipsAvailable: {
    nameAr: string;
    coverageAr: string;
    isFullRide: boolean;
    deadlineAr?: string;
  }[];
  officialWebsite: string;
}

export interface StudyAbroadCountry {
  code: string;
  nameAr: string;
  nameEn: string;
  flagEmoji: string;
  currency: string;
  currencyRateToUsd: string;
  overviewAr: string;
  keyAdvantageForAlgeriansAr: string;
  annualAverageCostUsd: number;
  universitiesCount: number;
}

export const STUDY_ABROAD_COUNTRIES: StudyAbroadCountry[] = [
  {
    code: 'FR',
    nameAr: 'فرنسا',
    nameEn: 'France',
    flagEmoji: '🇫🇷',
    currency: 'EUR (€)',
    currencyRateToUsd: '1 EUR ≈ 1.08 USD',
    overviewAr: 'الوجهة الأكثر إقبالاً من الطلبة الجزائريين تاريخياً بفضل اللغة الفرنسية والاتفاقيات الجامعية وسهولة إجراءات Campus France Algérie.',
    keyAdvantageForAlgeriansAr: 'رسوم جامعية شبه مجانية في الجامعات المعفاة، وتغطية الضمان الاجتماعي والمساعدة في السكن (APL/CAF).',
    annualAverageCostUsd: 9500,
    universitiesCount: 5,
  },
  {
    code: 'TR',
    nameAr: 'تركيا',
    nameEn: 'Turkey',
    flagEmoji: '🇹🇷',
    currency: 'TRY (₺)',
    currencyRateToUsd: '1 USD ≈ 34 TRY',
    overviewAr: 'وجهة صاعدة بقوة بين الجزائريين لتوفر المنح الحكومية الكاملة وسهولة استخراج التأشيرة وتكاليف المعيشة المنخفضة مع جودة الحرم الجامعي.',
    keyAdvantageForAlgeriansAr: 'المنحة التركية الشاملة Türkiye Bursları (راتب، سكن، تذكرة طيران مجانية) وإمكانية الدراسة بالإنجليزية أو التركية.',
    annualAverageCostUsd: 4500,
    universitiesCount: 4,
  },
  {
    code: 'CA',
    nameAr: 'كندا',
    nameEn: 'Canada',
    flagEmoji: '🇨🇦',
    currency: 'CAD ($)',
    currencyRateToUsd: '1 USD ≈ 1.35 CAD',
    overviewAr: 'وجهة مرموقة للغاية، خصوصاً في مقاطعة كيبيك الفرانكوفونية، مع مسارات هجرة وتوطين ممتازة للطلبة بعد التخرج.',
    keyAdvantageForAlgeriansAr: 'إعفاءات تخفيض الرسوم الدراسية للطلبة الفرانكوفونيين في بعض الجامعات، وحق العمل بدوام جزئي أثناء الدراسة.',
    annualAverageCostUsd: 22000,
    universitiesCount: 4,
  },
  {
    code: 'RU',
    nameAr: 'روسيا',
    nameEn: 'Russia',
    flagEmoji: '🇷🇺',
    currency: 'RUB (₽)',
    currencyRateToUsd: '1 USD ≈ 92 RUB',
    overviewAr: 'الوجهة المفضلة لدراسة الطب البشري وطب الأسنان وهندسة الطيران للطلبة الجزائريين نظراً لعدم اشتراط معدلات تعجيزية ورسومها الميسرة.',
    keyAdvantageForAlgeriansAr: 'القبول المباشر في كليات الطب بدون شروط مفاضلة معقدة وسكن جامعي رمزي جداً (أقل من 50$ شهرياً).',
    annualAverageCostUsd: 5500,
    universitiesCount: 3,
  },
  {
    code: 'MY',
    nameAr: 'ماليزيا',
    nameEn: 'Malaysia',
    flagEmoji: '🇲🇾',
    currency: 'MYR (RM)',
    currencyRateToUsd: '1 USD ≈ 4.40 MYR',
    overviewAr: 'بيئة إسلامية متطورة، جامعات بتصنيفات عالمية متقدمة (Top 100 عالمياً)، والتعليم باللغة الإنجليزية بالكامل بتكاليف في متناول العائلات الجزائرية.',
    keyAdvantageForAlgeriansAr: 'فيزا دراسية ميسرة بنسبة قبول 99%، جودة حياة عالية، ونظام جامعي بريطاني معترف به دولياً.',
    annualAverageCostUsd: 6800,
    universitiesCount: 3,
  },
  {
    code: 'DE',
    nameAr: 'ألمانيا',
    nameEn: 'Germany',
    flagEmoji: '🇩🇪',
    currency: 'EUR (€)',
    currencyRateToUsd: '1 EUR ≈ 1.08 USD',
    overviewAr: 'قلعة الهندسة والتكنولوجيا والذكاء الاصطناعي في أوروبا، وتتميز بأن الدراسة فيها مجانية 100% في كافة الجامعات الحكومية.',
    keyAdvantageForAlgeriansAr: 'التعليم مجاني تماماً (0$ رسوم دراسية)، تدريب مهني عالمي مع عمالقة الصناعة الألمانية وفرص توظيف هائلة.',
    annualAverageCostUsd: 11800,
    universitiesCount: 3,
  },
  {
    code: 'IT',
    nameAr: 'إيطاليا',
    nameEn: 'Italy',
    flagEmoji: '🇮🇹',
    currency: 'EUR (€)',
    currencyRateToUsd: '1 EUR ≈ 1.08 USD',
    overviewAr: 'تتميز بمنح DSU الإقليمية التي تمنح الطلبة الجزائريين دراسة مجانية وسكناً ومنحة سنوية تتجاوز 7000 يورو بناءً على الدخل العائلي.',
    keyAdvantageForAlgeriansAr: 'منحة DSU التي تغطي تكاليف الدراسة والمعيشة بالكامل لأغلب الطلبة الجزائريين المقبولين.',
    annualAverageCostUsd: 4000,
    universitiesCount: 3,
  },
  {
    code: 'ES',
    nameAr: 'إسبانيا',
    nameEn: 'Spain',
    flagEmoji: '🇪🇸',
    currency: 'EUR (€)',
    currencyRateToUsd: '1 EUR ≈ 1.08 USD',
    overviewAr: 'وجهة قريبة جغرافياً، مناخ وثقافة متوسطية، ورسوم دراسية منخفضة في الجامعات الحكومية مقارنة ببقية أوروبا.',
    keyAdvantageForAlgeriansAr: 'سهولة معادلة البكالوريا (Homologación) ورسوم جامعية تبدأ من 1200$ سنوياً.',
    annualAverageCostUsd: 8500,
    universitiesCount: 2,
  },
  {
    code: 'TN',
    nameAr: 'تونس',
    nameEn: 'Tunisia',
    flagEmoji: '🇹🇳',
    currency: 'TND (د.ت)',
    currencyRateToUsd: '1 USD ≈ 3.10 TND',
    overviewAr: 'الوجهة الأقرب برياً وبدون تأشيرة نهائياً، معترف بها ومناسبة لطلبة كليات الهندسة والشبه طبي والبرمجة بالجامعات المعتمدة.',
    keyAdvantageForAlgeriansAr: 'بدون فيزا (الدخول ببطاقة التعريف أو جواز السفر)، وتكاليف معيشة مطابقة للجزائر.',
    annualAverageCostUsd: 4200,
    universitiesCount: 2,
  },
];

export const STUDY_ABROAD_UNIVERSITIES: StudyAbroadUniversity[] = [
  // ---------------------------------------------------------------------------
  // FRANCE (فرنسا)
  // ---------------------------------------------------------------------------
  {
    id: 'abroad-sorbonne-fr',
    nameAr: 'جامعة السوربون (باريس)',
    nameOriginal: 'Sorbonne Université',
    cityAr: 'باريس',
    countryCode: 'FR',
    countryNameAr: 'فرنسا',
    flagEmoji: '🇫🇷',
    worldRankRange: 'Top 60 عالمياً',
    teachingLanguage: ['الفرنسية', 'الإنجليزية (بعض مسارات الماستر)'],
    popularMajors: ['الطب والعلوم الصحية', 'الإعلام الآلي والذكاء الاصطناعي', 'الرياضيات والفيزياء', 'الآداب والعلوم الإنسانية'],
    minimumBacAverage: 14.50,
    minBacStream: ['sciences_exp', 'math', 'technique_math', 'lettres_philo'],
    tuitionUsdPerYear: {
      min: 200,
      max: 3000,
      isFreeOrExempt: true,
      notesAr: 'معظم كليات العلوم والإنسانيات تطبق الإعفاء الجزئي لتصبح الرسوم ~200$ سنوياً فقط لحاملي إعفاء الكلية.',
    },
    livingCostUsdPerYear: {
      min: 8500,
      max: 12000,
      notesAr: 'تشمل السكن الجامعي CROUS أو الاستئجار مع الاستفادة من دعم السكن الفرنسي APL (تخفيض 150-220 يورو/شهر).',
    },
    admissionRequirements: [
      'شهادة البكالوريا الجزائرية بمعدل جيد جداً (14.50+ مفضل).',
      'إجراءات مسار Campus France Algérie (ملف Etudes en France).',
      'اجتياز امتحان لغة فرنسية TCF DAP أو الحصول على دبلوم DELF B2/DALF C1.',
      'كشف نقاط السنوات الثلاث للثانوية مع سيرة ذاتية ورسالة تحفيزية قوية.',
    ],
    languageRequirements: ['TCF SO/DAP بمعدل 400+ أو DELF B2 فما فوق'],
    visaAndProcedures: {
      procedureNameAr: 'Campus France Algérie (إجراءات DAP Blanche)',
      descriptionAr: 'التسجيل يفتح سنوياً في شهر أكتوبر ويغلق في ديسمبر عبر منصة France-Visas و Campus France بالجزائر، متبوعاً بمقابلة شفهية.',
      officialPortalUrl: 'https://algerie.campusfrance.org',
    },
    scholarshipsAvailable: [
      {
        nameAr: 'منحة إيفل للتميز (Bourse Eiffel)',
        coverageAr: 'راتب شهري 1,200 يورو + تذكرة طيران مجانية وتأمين صحي كامل.',
        isFullRide: true,
        deadlineAr: 'نوفمبر - جانفي سنوياً',
      },
      {
        nameAr: 'منح المساعدة الاجتماعية CROUS',
        coverageAr: 'إعفاء من رسوم التسجيل ووجبات طعام مدعومة بـ 1 يورو/وجبة.',
        isFullRide: false,
      },
    ],
    officialWebsite: 'https://www.sorbonne-universite.fr',
  },

  {
    id: 'abroad-paris-saclay-fr',
    nameAr: 'جامعة باريس ساكلاي (عاصمة العلوم والتكنولوجيا)',
    nameOriginal: 'Université Paris-Saclay',
    cityAr: 'أورسي / إيل دو فرانس',
    countryCode: 'FR',
    countryNameAr: 'فرنسا',
    flagEmoji: '🇫🇷',
    worldRankRange: 'المرتبة 15 عالمياً (الأولى عالمياً في الرياضيات)',
    teachingLanguage: ['الفرنسية', 'الإنجليزية'],
    popularMajors: ['الرياضيات التطبيقية', 'الذكاء الاصطناعي وعلوم البيانات', 'الفيزياء المتقدمة', 'الصيدلة والبيوتكنولوجيا'],
    minimumBacAverage: 15.00,
    minBacStream: ['math', 'sciences_exp', 'technique_math'],
    tuitionUsdPerYear: {
      min: 200,
      max: 3100,
      isFreeOrExempt: true,
      notesAr: 'تطبق الجامعة سياسة الإعفاء التلقائي للعديد من التخصصات العلمية.',
    },
    livingCostUsdPerYear: {
      min: 8000,
      max: 11000,
      notesAr: 'الحرم الجامعي في ضواحي باريس الجنوبية يتميز بتوفر سكنات طلابية حديثة وأقل تكلفة من قلب العاصمة.',
    },
    admissionRequirements: [
      'معدل بكالوريا 15.00 فما فوق في شعب الرياضيات أو العلوم التجريبية أو تقني رياضي.',
      'علامات ممتازة في مادتي الرياضيات والفيزياء (15+).',
      'إجراءات Campus France المسبقة.',
    ],
    languageRequirements: ['TCF Tout Public B2 أو DELF B2 (الحد الأدنى 400 نقطة)'],
    visaAndProcedures: {
      procedureNameAr: 'Campus France Algérie (DAP & Hors-DAP)',
      descriptionAr: 'يتم التقديم عبر بوابة études en France مع اختيار التخصصات في كليات العلوم بساكلاي.',
      officialPortalUrl: 'https://algerie.campusfrance.org',
    },
    scholarshipsAvailable: [
      {
        nameAr: 'منحة التميز لجامعة باريس ساكلاي (Bourse IDEX)',
        coverageAr: '10,000 يورو سنوياً + 1,000 يورو مصاريف السفر والتأشيرة.',
        isFullRide: true,
      },
    ],
    officialWebsite: 'https://www.universite-paris-saclay.fr',
  },

  {
    id: 'abroad-lyon1-fr',
    nameAr: 'جامعة كلود برنارد ليون 1',
    nameOriginal: 'Université Claude Bernard Lyon 1',
    cityAr: 'ليون',
    countryCode: 'FR',
    countryNameAr: 'فرنسا',
    flagEmoji: '🇫🇷',
    worldRankRange: 'Top 250 عالمياً',
    teachingLanguage: ['الفرنسية'],
    popularMajors: ['العلوم الطبية والصحية', 'الكيمياء الصناعية', 'الهندسة الميكانيكية والكهربائية', 'البيولوجيا'],
    minimumBacAverage: 13.50,
    minBacStream: ['sciences_exp', 'math', 'technique_math'],
    tuitionUsdPerYear: {
      min: 190,
      max: 2900,
      notesAr: 'تكاليف تسجيل نظامية مدعومة من الدولة الفرنسية.',
    },
    livingCostUsdPerYear: {
      min: 7200,
      max: 9500,
      notesAr: 'مدينة ليون أرخص بنسبة 30% من باريس ومناسبة جداً لميزانية الطلبة الجزائريين.',
    },
    admissionRequirements: [
      'شهادة البكالوريا بمعدل 13.50+ للعلوم و 14.50+ لمسارات الصحة.',
      'شهادة DELF B2 أو TCF.',
    ],
    languageRequirements: ['DELF B2 أو TCF DAP'],
    visaAndProcedures: {
      procedureNameAr: 'Campus France Algérie',
      descriptionAr: 'إيداع الملف ودفع رسوم المقابلة ومراجعة قنصلية فرنسا بالجزائر أو وهران أو عنابة.',
    },
    scholarshipsAvailable: [
      {
        nameAr: 'منح مدينة ليون الجامعية',
        coverageAr: 'تسهيلات سكن ووجبات مدعومة.',
        isFullRide: false,
      },
    ],
    officialWebsite: 'https://www.univ-lyon1.fr',
  },

  // ---------------------------------------------------------------------------
  // TURKEY (تركيا)
  // ---------------------------------------------------------------------------
  {
    id: 'abroad-istanbul-univ-tr',
    nameAr: 'جامعة إسطنبول الحكومية',
    nameOriginal: 'İstanbul Üniversitesi',
    cityAr: 'إسطنبول',
    countryCode: 'TR',
    countryNameAr: 'تركيا',
    flagEmoji: '🇹🇷',
    worldRankRange: 'أعرق وأقدم جامعة تركية (تأسست 1453)',
    teachingLanguage: ['التركية', 'الإنجليزية'],
    popularMajors: ['الطب البشري', 'طب الأسنان', 'الصيدلة', 'إدارة الأعمال والاقتصاد الدولي', 'الحقوق'],
    minimumBacAverage: 13.00,
    minBacStream: ['sciences_exp', 'math', 'gestion_eco', 'lettres_philo'],
    tuitionUsdPerYear: {
      min: 500,
      max: 4200,
      notesAr: 'التخصصات الهندسية والأدبية حوالي 500$ - 1,200$ سنوياً، وتخصصات الطب البشري حوالي 3,500$ - 4,200$ سنوياً.',
    },
    livingCostUsdPerYear: {
      min: 3600,
      max: 5500,
      notesAr: 'السكن الجامعي الحكومي (KYK) أو السكن الطلابي المشترك يتراوح بين 100$ - 250$ شهرياً.',
    },
    admissionRequirements: [
      'كشف نقاط شهادة البكالوريا مترجماً ومصدقاً للتركية أو الإنجليزية.',
      'امتحان القبول للطلبة الأجانب TR-YÖS أو القبول المباشر بمعدل البكالوريا لبعض التخصصات.',
      'شهادة طبية عامة وجواز سفر ساري المفعول.',
    ],
    languageRequirements: ['TÖMER C1 للغة التركية أو TOEFL iBT 79+ للبرامج الإنجليزية (تتوفر سنة تحضيرية للغة)'],
    visaAndProcedures: {
      procedureNameAr: 'تأشيرة الطالب التركية عبر مراكز Gateway بالجزائر',
      descriptionAr: 'الحصول على القبول الجامعي المبدئي ثم التقدم لتأشيرة الدراسة عبر مكاتب VFS/Gateway في الجزائر العاصمة، وهران، وقسنطينة.',
      officialPortalUrl: 'https://www.turkiyeburslari.gov.tr',
    },
    scholarshipsAvailable: [
      {
        nameAr: 'المنحة التركية الحكومية (Türkiye Bursları)',
        coverageAr: 'إعفاء 100% من الرسوم الدراسية + راتب شهري + سكن جامعي مجاني مع وجبات طعام + تذكرة طيران ذهاب وإياب وتأمين صحي.',
        isFullRide: true,
        deadlineAr: '10 جانفي - 20 فيفري سنوياً',
      },
    ],
    officialWebsite: 'https://www.istanbul.edu.tr',
  },

  {
    id: 'abroad-metu-tr',
    nameAr: 'جامعة الشرق الأوسط التقنية (METU أنقرة)',
    nameOriginal: 'Middle East Technical University (ODTÜ)',
    cityAr: 'أنقرة',
    countryCode: 'TR',
    countryNameAr: 'تركيا',
    flagEmoji: '🇹🇷',
    worldRankRange: 'Top 300 عالمياً (الأولى في الهندسة في تركيا)',
    teachingLanguage: ['الإنجليزية 100%'],
    popularMajors: ['هندسة الحاسوب والذكاء الاصطناعي', 'الهندسة الكهربائية والإلكترونية', 'الهندسة الميكانيكية', 'العمارة والتخطيط الحضري'],
    minimumBacAverage: 14.50,
    minBacStream: ['math', 'technique_math', 'sciences_exp'],
    tuitionUsdPerYear: {
      min: 1200,
      max: 2800,
      notesAr: 'رسوم جامعية حكومية ميسرة للتعليم الكامل باللغة الإنجليزية.',
    },
    livingCostUsdPerYear: {
      min: 3200,
      max: 4800,
      notesAr: 'مدينة أنقرة أرخص من إسطنبول وتتميز بأكبر حرم جامعي تقني في الشرق الأوسط.',
    },
    admissionRequirements: [
      'معدل بكالوريا ممتاز (14.50+) أو درجات امتحان SAT (درجة 1250+ مفضلة).',
      'امتحان إتقان اللغة الإنجليزية TOEFL أو اجتياز امتحان الكفاءة الداخلي للجامعة (METU EPE).',
    ],
    languageRequirements: ['TOEFL iBT 84+ أو امتحان كفاءة الجامعة EPE'],
    visaAndProcedures: {
      procedureNameAr: 'التقديم المباشر عبر البوابة الدولية للجامعة ثم فيزا Gateway',
      descriptionAr: 'التقديم يفتح في شهري ماي وجوان عبر موقع الجامعة الدولي.',
    },
    scholarshipsAvailable: [
      {
        nameAr: 'منحة التميز الهندسي METU',
        coverageAr: 'تخفيض بنسبة 50% إلى 100% من الرسوم الدراسية للمتفوقين.',
        isFullRide: false,
      },
      {
        nameAr: 'المنحة التركية Türkiye Bursları',
        coverageAr: 'تغطية شاملة كاملة 100%.',
        isFullRide: true,
      },
    ],
    officialWebsite: 'https://www.metu.edu.tr',
  },

  // ---------------------------------------------------------------------------
  // CANADA (كندا - خصوصاً مقاطعة كيبيك)
  // ---------------------------------------------------------------------------
  {
    id: 'abroad-udem-ca',
    nameAr: 'جامعة مونتريال (كندا)',
    nameOriginal: 'Université de Montréal (UdeM)',
    cityAr: 'مونتريال، مقاطعة كيبيك',
    countryCode: 'CA',
    countryNameAr: 'كندا',
    flagEmoji: '🇨🇦',
    worldRankRange: 'المرتبة 111 عالمياً',
    teachingLanguage: ['الفرنسية'],
    popularMajors: ['علوم الحاسوب والذكاء الاصطناعي (MILA)', 'إدارة الأعمال (HEC Montréal)', 'الصيدلة والبيولوجيا الطبية', 'الهندسة (Polytechnique Montréal)'],
    minimumBacAverage: 13.50,
    minBacStream: ['sciences_exp', 'math', 'technique_math', 'gestion_eco'],
    tuitionUsdPerYear: {
      min: 14000,
      max: 21000,
      isFreeOrExempt: false,
      notesAr: 'تمنح جامعة مونتريال منح إعفاء سنوية تلقائية (Bourses d\'exemption UdeM) تخصم ما بين 2,000$ إلى 12,000$ سنوياً للمتفوقين.',
    },
    livingCostUsdPerYear: {
      min: 11000,
      max: 14500,
      notesAr: 'تشمل السكن والمعيشة والتأمين الصحي الإجباري في كيبيك (RAMQ).',
    },
    admissionRequirements: [
      'شهادة البكالوريا الجزائرية بمعدل 13.50 فما فوق (15+ للتخصصات التنافسية كالإعلام الآلي).',
      'الحصول على شهادة القبول في كيبيك (CAQ - Certificat d\'Acceptation du Québec).',
      'إصدار تصريح الدراسة الكندي (Permis d\'études) مع تقديم كشف بنكي يثبت القدرة المالية (~15,000$ إلى 20,000$).',
    ],
    languageRequirements: ['الفرنسية لغة دراسة أساسية بالجزائر معفاة من الاختبار، أو TCF Tout Public بمعدل B2'],
    visaAndProcedures: {
      procedureNameAr: 'بوابة الهجرة الكندية IRCC و CAQ كيبيك',
      descriptionAr: 'بعد القبول الجامعي، يتم استخراج وثيقة CAQ أونلاين ثم تقديم ملف الفيزا وتصريح الدراسة لدى مركز VFS Global بالجزائر.',
      officialPortalUrl: 'https://www.canada.ca/fr/immigration-refugies-citoyennete.html',
    },
    scholarshipsAvailable: [
      {
        nameAr: 'منحة الإعفاء لجامعة مونتريال (Bourse d\'exemption UdeM)',
        coverageAr: 'خصم سنوي يصل إلى 12,400 دولار كندي من المصاريف الدراسية للطلبة الدوليين.',
        isFullRide: false,
      },
    ],
    officialWebsite: 'https://www.umontreal.ca',
  },

  {
    id: 'abroad-laval-ca',
    nameAr: 'جامعة لافال (كيبيك)',
    nameOriginal: 'Université Laval',
    cityAr: 'مدينة كيبيك',
    countryCode: 'CA',
    countryNameAr: 'كندا',
    flagEmoji: '🇨🇦',
    worldRankRange: 'Top 350 عالمياً',
    teachingLanguage: ['الفرنسية'],
    popularMajors: ['الهندسة الزراعية والغذائية', 'هندسة الغابات والبيئة', 'علوم التمريض والصحة', 'علوم التسيير والمحاسبة'],
    minimumBacAverage: 12.50,
    minBacStream: ['sciences_exp', 'math', 'technique_math', 'gestion_eco'],
    tuitionUsdPerYear: {
      min: 13500,
      max: 19500,
      notesAr: 'تتوفر برامج لدعم تخفيض الأقساط للطلبة المتفوقين في مجالات العلوم التطبيقية.',
    },
    livingCostUsdPerYear: {
      min: 10000,
      max: 13000,
      notesAr: 'تكاليف المعيشة والإيجار في مدينة كيبيك أقل بنسبة 25% من مونتريال وتورونتو.',
    },
    admissionRequirements: [
      'معدل بكالوريا 12.50 فما فوق.',
      'ملف CAQ وتصريح الدراسة الكندي.',
    ],
    languageRequirements: ['اللغة الفرنسية (مستوى B2)'],
    visaAndProcedures: {
      procedureNameAr: 'CAQ + Permis d\'études كندا',
      descriptionAr: 'التقديم يبدأ في نوفمبر ويناير لكل دورة دراسية (خريف / شتاء).',
    },
    scholarshipsAvailable: [
      {
        nameAr: 'منح التميز للطلبة الأجانب بجامعة لافال',
        coverageAr: 'منح تشجيعية تتراوح بين 5,000$ و 10,000$ تخصم من الرسوم.',
        isFullRide: false,
      },
    ],
    officialWebsite: 'https://www.ulaval.ca',
  },

  // ---------------------------------------------------------------------------
  // RUSSIA (روسيا)
  // ---------------------------------------------------------------------------
  {
    id: 'abroad-rudn-ru',
    nameAr: 'جامعة الصداقة بين الشعوب (RUDN موسكو)',
    nameOriginal: 'Peoples\' Friendship University of Russia',
    cityAr: 'موسكو',
    countryCode: 'RU',
    countryNameAr: 'روسيا',
    flagEmoji: '🇷🇺',
    worldRankRange: 'Top 300 عالمياً (الأولى للطلبة الأجانب بروسيا)',
    teachingLanguage: ['الروسية (بعد سنة تحضيرية)', 'الإنجليزية (مباشرة للطب والهندسة)'],
    popularMajors: ['الطب البشري (General Medicine)', 'طب وجراحة الأسنان', 'الصيدلة', 'هندسة النفط والغاز', 'العلاقات الدولية'],
    minimumBacAverage: 12.00,
    minBacStream: ['sciences_exp', 'math', 'technique_math'],
    tuitionUsdPerYear: {
      min: 2800,
      max: 6000,
      notesAr: 'الطب البشري باللغة الإنجليزية ~5,500$ سنوياً، وباللغة الروسية ~4,200$ سنوياً. التخصصات الهندسية ~2,800$ - 3,500$.',
    },
    livingCostUsdPerYear: {
      min: 2800,
      max: 4200,
      notesAr: 'السكن الجامعي التابع للجامعة متوفر بسعر 35$ إلى 80$ شهرياً فقط.',
    },
    admissionRequirements: [
      'شهادة البكالوريا وكشف النقاط مترجماً للغة الروسية مع التصديق.',
      'شهادة فحص طبي وفحص الإيدز (HIV) وفحص الصدر.',
      'لا يشترط معدل تعجيزي (12.00 كافية لدراسة الطب أو الهندسة بعد السنة التحضيرية).',
    ],
    languageRequirements: ['سنة تحضيرية لدراسة اللغة الروسية (Podfak) أو مقابلة بالإنجليزية للبرامج المباشرة'],
    visaAndProcedures: {
      procedureNameAr: 'الدعوة الدراسية الرسمية (Priglashenie) + فيزا السفارة الروسية بالجزائر',
      descriptionAr: 'ترسل الجامعة الدعوة الدراسية الصادرة من وزارة الداخلية الروسية، ويتم إيداع التأشيرة في السفارة الروسية بالأبيار (الجزائر العاصمة)، بنسبة قبول شبه تامة.',
    },
    scholarshipsAvailable: [
      {
        nameAr: 'منحة الحكومة الروسية (المركز الثقافي الروسي بالجزائر)',
        coverageAr: 'دراسة مجانية 100% وسكن جامعي مدعوم وراتب شهري رمزي.',
        isFullRide: true,
        deadlineAr: 'ديسمبر - جانفي عبر موقع education-in-russia.com',
      },
    ],
    officialWebsite: 'https://www.rudn.ru',
  },

  {
    id: 'abroad-sechenov-ru',
    nameAr: 'جامعة سيتشينوف الطبية الأولى بموسكو',
    nameOriginal: 'Sechenov First Moscow State Medical University',
    cityAr: 'موسكو',
    countryCode: 'RU',
    countryNameAr: 'روسيا',
    flagEmoji: '🇷🇺',
    worldRankRange: 'أقدم وأكبر كلية طب في روسيا',
    teachingLanguage: ['الإنجليزية', 'الروسية'],
    popularMajors: ['الطب البشري العام', 'طب الأسنان', 'الصيدلة الإكلينيكية', 'التكنولوجيا الحيوية الطبية'],
    minimumBacAverage: 13.00,
    minBacStream: ['sciences_exp', 'math'],
    tuitionUsdPerYear: {
      min: 4500,
      max: 7500,
      notesAr: 'أرقى درجات التدريب الإكلينيكي في المستشفيات الروسية، معترف بها دولياً في قائمة المنظمة العالمية للصحة (WHO).',
    },
    livingCostUsdPerYear: {
      min: 3200,
      max: 4800,
      notesAr: 'تكاليف المعيشة في موسكو مع السكن الجامعي.',
    },
    admissionRequirements: [
      'اجتياز اختبار القبول في مادتي الكيمياء والبيولوجيا (يقام أونلاين بالإنجليزية أو الروسية).',
      'شهادة البكالوريا مترجمة للروسية.',
    ],
    languageRequirements: ['إتقان الإنجليزية أو دراسة السنة التحضيرية الروسية'],
    visaAndProcedures: {
      procedureNameAr: 'تأشيرة دراسية روسية عبر سفارة روسيا بالجزائر',
      descriptionAr: 'إصدار الدعوة الجامعية في شهر جويلية وتقديم التأشيرة في أوت.',
    },
    scholarshipsAvailable: [
      {
        nameAr: 'منحة وزارة العلوم والتعليم العالي الروسية',
        coverageAr: 'إعفاء من الرسوم الدراسية للطلبة الجزائريين المتفوقين في المسابقة السنوية.',
        isFullRide: true,
      },
    ],
    officialWebsite: 'https://www.sechenov.ru',
  },

  // ---------------------------------------------------------------------------
  // MALAYSIA (ماليزيا)
  // ---------------------------------------------------------------------------
  {
    id: 'abroad-univ-malaya-my',
    nameAr: 'جامعة مالايا (UM كوالالمبور)',
    nameOriginal: 'Universiti Malaya (UM)',
    cityAr: 'كوالالمبور',
    countryCode: 'MY',
    countryNameAr: 'ماليزيا',
    flagEmoji: '🇲🇾',
    worldRankRange: 'المرتبة 60 عالمياً (QS World Ranking)',
    teachingLanguage: ['الإنجليزية 100%'],
    popularMajors: ['علوم الحاسوب والذكاء الاصطناعي', 'الهندسة الكيميائية والكهربائية', 'إدارة الأعمال والمحاسبة', 'العلوم البيولوجية'],
    minimumBacAverage: 14.00,
    minBacStream: ['math', 'sciences_exp', 'technique_math', 'gestion_eco'],
    tuitionUsdPerYear: {
      min: 3500,
      max: 6500,
      notesAr: 'أفضل عائد تعليمي مقابل التكلفة في آسيا لجامعة مصنفة ضمن أفضل 60 جامعة في العالم.',
    },
    livingCostUsdPerYear: {
      min: 3500,
      max: 5200,
      notesAr: 'السكن الجامعي والمعيشة في العاصمة كوالالمبور رخيصة جداً ومطابقة تقريباً لمصاريف العيش في الجزائر.',
    },
    admissionRequirements: [
      'شهادة البكالوريا بمعدل 14.00+ للتخصصات العلمية و 13.50+ للإدارة.',
      'شهادة IELTS بمعدل 6.0 فما فوق أو TOEFL iBT 80.',
      'جواز سفر صالح لمدة لا تقل عن 18 شهراً.',
    ],
    languageRequirements: ['IELTS 6.0 أو TOEFL iBT 80+'],
    visaAndProcedures: {
      procedureNameAr: 'تأشيرة الطالب EMGS الماليزية',
      descriptionAr: 'يتم التقديم واستخراج خطاب الموافقة الإلكتروني (eVAL) عبر هيئة EMGS أونلاين ثم استلام الفيزا عند الوصول للمطار بكوالالمبور.',
      officialPortalUrl: 'https://educationmalaysia.gov.my',
    },
    scholarshipsAvailable: [
      {
        nameAr: 'منحة التميز لجامعة مالايا للطلبة الدوليين',
        coverageAr: 'تخفيض جزئي من 20% إلى 50% من الرسوم.',
        isFullRide: false,
      },
    ],
    officialWebsite: 'https://www.um.edu.my',
  },

  {
    id: 'abroad-apu-my',
    nameAr: 'جامعة آسيا والمحيط الهادئ للتكنولوجيا (APU)',
    nameOriginal: 'Asia Pacific University of Technology & Innovation',
    cityAr: 'كوالالمبور',
    countryCode: 'MY',
    countryNameAr: 'ماليزيا',
    flagEmoji: '🇲🇾',
    worldRankRange: 'الجامعة الأولى في ماليزيا في التوظيف التقني والأمن السيبراني',
    teachingLanguage: ['الإنجليزية 100%'],
    popularMajors: ['الأمن السيبراني والتحقيق الرقمي', 'الذكاء الاصطناعي وهندسة البرمجيات', 'إنترنت الأشياء والحوسبة السحابية', 'تطوير الألعاب الرقمية'],
    minimumBacAverage: 12.00,
    minBacStream: ['sciences_exp', 'math', 'technique_math', 'gestion_eco'],
    tuitionUsdPerYear: {
      min: 4800,
      max: 7200,
      notesAr: 'تشمل برامج شهادة مزدوجة (Dual Degree) مع جامعة دي مونتفورت البريطانية (DMU UK).',
    },
    livingCostUsdPerYear: {
      min: 3600,
      max: 5000,
      notesAr: 'حرم جامعي فائق الحداثة يضم إقامة طلابية فاخرة ووسائل نقل مجانية.',
    },
    admissionRequirements: [
      'شهادة البكالوريا بمعدل 12.00 فما فوق (مقبولة لجميع الشعب).',
      'اجتياز اختبار لغة إنجليزية أو دراسة دورة لغة مكثفة في الجامعة.',
    ],
    languageRequirements: ['IELTS 5.5 أو اختبار APU الداخلي'],
    visaAndProcedures: {
      procedureNameAr: 'تأشيرة EMGS الميسرة',
      descriptionAr: 'تتولى الجامعة متابعة إصدار خطاب الفال (VAL) خلال 3 أسابيع من إيداع الملف.',
    },
    scholarshipsAvailable: [
      {
        nameAr: 'منحة APU للمتفوقين في البكالوريا',
        coverageAr: 'خصم من 15% إلى 30% من الرسوم الدراسية بناءً على معدل البكالوريا (14+ أو 16+).',
        isFullRide: false,
      },
    ],
    officialWebsite: 'https://www.apu.edu.my',
  },

  // ---------------------------------------------------------------------------
  // GERMANY (ألمانيا)
  // ---------------------------------------------------------------------------
  {
    id: 'abroad-tum-de',
    nameAr: 'جامعة ميونخ التقنية (TUM)',
    nameOriginal: 'Technical University of Munich',
    cityAr: 'ميونخ، ولاية بافاريا',
    countryCode: 'DE',
    countryNameAr: 'ألمانيا',
    flagEmoji: '🇩🇪',
    worldRankRange: 'المرتبة 28 عالمياً (الأولى في ألمانيا)',
    teachingLanguage: ['الألمانية', 'الإنجليزية (مسارات متعددة)'],
    popularMajors: ['الهندسة الميكانيكية والسيارات', 'الذكاء الاصطناعي والروبوتات', 'الهندسة الكهربائية وهندسة الفضاء', 'علوم الحاسوب'],
    minimumBacAverage: 14.50,
    minBacStream: ['math', 'technique_math', 'sciences_exp'],
    tuitionUsdPerYear: {
      min: 0,
      max: 600,
      isFreeOrExempt: true,
      notesAr: 'التعليم في الجامعات الحكومية الألمانية شبه مجاني، يدفع الطالب رسوم اشتراك ونقل فصلي فقط (~150 إلى 300 يورو للفصل).',
    },
    livingCostUsdPerYear: {
      min: 11500,
      max: 13500,
      notesAr: 'تشترط السفارة الألمانية فتح حساب بنكي مغلق (Sperrkonto) بقيمة محددة قانوناً (~11,208 يورو) يصرف منها الطالب شهرياً ~934 يورو لمصاريفه.',
    },
    admissionRequirements: [
      'شهادة البكالوريا الجزائرية (تتطلب دراسة سنة تحضيرية Studienkolleg في ألمانيا لاختبار Feststellungsprüfung).',
      'شهادة إتقان اللغة الألمانية بمستوى B1 أو B2 للالتحاق بالسنة التحضيرية، أو TestDaF 4 / DSH 2 للدراسة المباشرة.',
      'الحساب البنكي المغلق (Sperrkonto).',
    ],
    languageRequirements: ['ألماني Goethe/Telc B2 أو TestDaF 4*4 للبرامج الألمانية، أو IELTS 6.5 للإنجليزية'],
    visaAndProcedures: {
      procedureNameAr: 'تأشيرة الطالب الألمانية عبر سفارة ألمانيا بالجزائر (حيدرة)',
      descriptionAr: 'حجز موعد Visa عبر البوابة الإلكترونية، وتقديم إشعار القبول أو دعوة امتحان القبول للسنة التحضيرية Aufnahmetest مع الحساب المغلق.',
    },
    scholarshipsAvailable: [
      {
        nameAr: 'منح هيئة التبادل الأكاديمي الألمانية (DAAD)',
        coverageAr: 'منح دراسية للطلبة المتفوقين ومسارات الماستر والدكتوراه.',
        isFullRide: true,
      },
    ],
    officialWebsite: 'https://www.tum.de',
  },

  {
    id: 'abroad-rwth-aachen-de',
    nameAr: 'جامعة آر دبليو تي إتش آخن التقنية (RWTH Aachen)',
    nameOriginal: 'RWTH Aachen University',
    cityAr: 'آخن، شمال الراين',
    countryCode: 'DE',
    countryNameAr: 'ألمانيا',
    flagEmoji: '🇩🇪',
    worldRankRange: 'Top 100 عالمياً (معقل النخبة الهندسية بأوروبا)',
    teachingLanguage: ['الألمانية', 'الإنجليزية'],
    popularMajors: ['هندسة الإنتاج والتصنيع', 'هندسة السيارات والقطارات', 'هندسة التعدين والمعادن', 'الفيزياء التطبيقية'],
    minimumBacAverage: 14.00,
    minBacStream: ['math', 'technique_math', 'sciences_exp'],
    tuitionUsdPerYear: {
      min: 0,
      max: 700,
      isFreeOrExempt: true,
      notesAr: 'مجانية تماماً (0$ مصاريف دراسة).',
    },
    livingCostUsdPerYear: {
      min: 10500,
      max: 12000,
      notesAr: 'تكاليف المعيشة في مدينة آخن معتدلة جداً مقارنة بميونخ وبرلين.',
    },
    admissionRequirements: [
      'شهادة البكالوريا + شهادة السنة التحضيرية الألمانية (Studienkolleg T-Kurs).',
      'حساب بنكي مغلق بميونخ أو آخن.',
    ],
    languageRequirements: ['Goethe B2 / TestDaF'],
    visaAndProcedures: {
      procedureNameAr: 'تأشيرة دراسة ألمانية عبر السفارة بالجزائر',
      descriptionAr: 'التقديم يبدأ في شهري ماي وجوان عبر بوابة uni-assist الألمانية.',
    },
    scholarshipsAvailable: [
      {
        nameAr: 'منحة Deutschlandstipendium الوطنية',
        coverageAr: '300 يورو شهرياً دعماً للمتفوقين دراسياً.',
        isFullRide: false,
      },
    ],
    officialWebsite: 'https://www.rwth-aachen.de',
  },

  // ---------------------------------------------------------------------------
  // ITALY (إيطاليا)
  // ---------------------------------------------------------------------------
  {
    id: 'abroad-polimi-it',
    nameAr: 'جامعة البوليتكنيك في ميلانو (Politecnico di Milano)',
    nameOriginal: 'Politecnico di Milano',
    cityAr: 'ميلانو',
    countryCode: 'IT',
    countryNameAr: 'إيطاليا',
    flagEmoji: '🇮🇹',
    worldRankRange: 'المرتبة 111 عالمياً (السابعة عالمياً في الهندسة الميكانيكية والعمارة)',
    teachingLanguage: ['الإنجليزية', 'الإيطالية'],
    popularMajors: ['الهندسة المعمارية والتصميم', 'هندسة الحاسوب والذكاء الاصطناعي', 'هندسة الطيران والفضاء', 'الهندسة الطبية الحيوية'],
    minimumBacAverage: 13.50,
    minBacStream: ['math', 'technique_math', 'sciences_exp'],
    tuitionUsdPerYear: {
      min: 200,
      max: 3800,
      isFreeOrExempt: true,
      notesAr: 'مع منحة DSU الإقليمية، تصبح الرسوم مجانية 100% ويحصل الطالب على إعفاء تام بناءً على الدخل العائلي.',
    },
    livingCostUsdPerYear: {
      min: 2500,
      max: 8500,
      notesAr: 'الفائزون بمنحة DSU يحصلون على سكن مجاني ووجبات طعام يومية بالإضافة إلى منحة نقدية سنوية تصل إلى 7,000 يورو!',
    },
    admissionRequirements: [
      'شهادة البكالوريا مترجمة ومصدقة ومعادلة عبر بيان القيمة (Dichiarazione di Valore) أو منصة CIMEA.',
      'اجتياز اختبار القبول الهندسي الإيطالي TOLC أو اختبار العمارة.',
      'التسجيل المسبق عبر منصة Universitaly الرسمية للحكومة الإيطالية.',
    ],
    languageRequirements: ['IELTS 6.0 أو TOEFL iBT 78 للبرامج الإنجليزية، أو B2 بالإيطالية'],
    visaAndProcedures: {
      procedureNameAr: 'منصة Universitaly + تأشيرة VFS Global الجزائر',
      descriptionAr: 'التسجيل يفتح في شهر أفريل عبر بوابة universitaly.it، وتودع الفيزا لدى مركز VFS Global بالجزائر العاصمة أو وهران.',
      officialPortalUrl: 'https://www.universitaly.it',
    },
    scholarshipsAvailable: [
      {
        nameAr: 'منحة إقليم لومبارديا (Borsa di Studio DSU Politecnico)',
        coverageAr: 'سكن جامعي مجاني + وجبات مجانية + إعفاء من الرسوم + منحة مالية سنوية حتى 7,000 يورو، تمنح لأكثر من 85% من الطلبة الجزائريين المؤهلين.',
        isFullRide: true,
        deadlineAr: 'جويلية - أوت سنوياً',
      },
    ],
    officialWebsite: 'https://www.polimi.it',
  },

  {
    id: 'abroad-sapienza-it',
    nameAr: 'جامعة سابينزا روما (Sapienza Università di Roma)',
    nameOriginal: 'Sapienza Università di Roma',
    cityAr: 'روما',
    countryCode: 'IT',
    countryNameAr: 'إيطاليا',
    flagEmoji: '🇮🇹',
    worldRankRange: 'Top 130 عالمياً (الأكبر في أوروبا)',
    teachingLanguage: ['الإنجليزية', 'الإيطالية'],
    popularMajors: ['الطب والجراحة بالإنجليزية (IMAT)', 'الذكاء الاصطناعي والروبوتات', 'الآثار الكلاسيكية وتاريخ الفنون', 'الصيدلة'],
    minimumBacAverage: 14.00,
    minBacStream: ['sciences_exp', 'math'],
    tuitionUsdPerYear: {
      min: 300,
      max: 3000,
      isFreeOrExempt: true,
      notesAr: 'رسوم منخفضة وتغطية كاملة مع منحة LazioDisco الإقليمية.',
    },
    livingCostUsdPerYear: {
      min: 3000,
      max: 8000,
      notesAr: 'تكاليف مغطاة بالكامل للطلبة الحاصلين على منحة إقليم لاتسيو.',
    },
    admissionRequirements: [
      'اجتياز امتحان IMAT الطبي الدولي لكليات الطب باللغة الإنجليزية.',
      'التسجيل عبر بوابة Universitaly.',
    ],
    languageRequirements: ['IELTS 6.0 أو B2 إنجليزي'],
    visaAndProcedures: {
      procedureNameAr: 'Universitaly + VFS Global إيطاليا',
      descriptionAr: 'إجراءات سهلة بعد إعلان نتائج IMAT في سبتمبر.',
    },
    scholarshipsAvailable: [
      {
        nameAr: 'منحة LazioDisco الإقليمية في روما',
        coverageAr: 'إعفاء من الرسوم وسكن مجاني ومنحة سنوية.',
        isFullRide: true,
      },
    ],
    officialWebsite: 'https://www.uniroma1.it',
  },

  // ---------------------------------------------------------------------------
  // TUNISIA (تونس)
  // ---------------------------------------------------------------------------
  {
    id: 'abroad-tunis-el-manar-tn',
    nameAr: 'جامعة تونس المنار',
    nameOriginal: 'Université de Tunis El Manar',
    cityAr: 'تونس العاصمة',
    countryCode: 'TN',
    countryNameAr: 'تونس',
    flagEmoji: '🇹🇳',
    worldRankRange: 'الجامعة الأولى مغاربياً في التصنيفات الإفريقية',
    teachingLanguage: ['الفرنسية', 'العربية'],
    popularMajors: ['الطب والصحة العامة', 'الهندسة الوطنية (ENIT)', 'العلوم الاقتصادية والتصرف', 'الحقوق والعلوم السياسية'],
    minimumBacAverage: 12.50,
    minBacStream: ['sciences_exp', 'math', 'technique_math', 'gestion_eco'],
    tuitionUsdPerYear: {
      min: 800,
      max: 3500,
      notesAr: 'رسوم جامعية رمزية في الكليات الحكومية التونسية للطلبة المغاربيين وفق اتفاقيات التبادل الثنائي.',
    },
    livingCostUsdPerYear: {
      min: 2200,
      max: 3800,
      notesAr: 'تكلفة المعيشة مطابقة تقريباً للجزائر، مع إمكانية السفر براً بالسيارة أو الحافلة بدون تكاليف تذاكر طيران باهظة.',
    },
    admissionRequirements: [
      'معادلة شهادة البكالوريا الجزائرية لدى وزارة التعليم العالي والبحث العلمي التونسية.',
      'كشف النقاط الأصلي وبطاقة التعريف الوطنية أو جواز السفر (لا يشترط تأشيرة للجزائريين نهائياً).',
    ],
    languageRequirements: ['الفرنسية أو العربية حسب التخصص بدون اختبار رسمي'],
    visaAndProcedures: {
      procedureNameAr: 'دخول مباشر بدون تأشيرة + بطاقة إقامة طالب',
      descriptionAr: 'يدخل الطالب الجزائري تونس مباشرة بجواز السفر، ثم يستخرج بطاقة إقامة طالب من مركز الأمن التابع لمقر سكنه بتونس.',
    },
    scholarshipsAvailable: [
      {
        nameAr: 'منح التبادل الثنائي الجزائري - التونسي',
        coverageAr: 'سكن جامعي بالمطاعم الجامعية لديوان الخدمات الجامعية للشمال.',
        isFullRide: false,
      },
    ],
    officialWebsite: 'https://www.utm.rnu.tn',
  },

  {
    id: 'abroad-esprit-tn',
    nameAr: 'المدرسة العليا الخاصة للهندسة والتكنولوجيا (ESPRIT تونس)',
    nameOriginal: 'ESPRIT - Ecole Supérieure Privée d\'Ingénierie et de Technologies',
    cityAr: 'تونس (أريانة)',
    countryCode: 'TN',
    countryNameAr: 'تونس',
    flagEmoji: '🇹🇳',
    worldRankRange: 'معتمدة دولياً بشهادة EUR-ACE الأوروبية و CDIO',
    teachingLanguage: ['الفرنسية', 'الإنجليزية'],
    popularMajors: ['هندسة البرمجيات والذكاء الاصطناعي', 'الاتصالات والشبكات المتقدمة', 'الميكاترونيكس والأنظمة المدمجة', 'علوم البيانات'],
    minimumBacAverage: 11.50,
    minBacStream: ['math', 'technique_math', 'sciences_exp'],
    tuitionUsdPerYear: {
      min: 2500,
      max: 4200,
      notesAr: 'أقوى جامعة هندسية خاصة في شمال إفريقيا مع توظيف فوري في كبرى الشركات الأوروبية.',
    },
    livingCostUsdPerYear: {
      min: 2400,
      max: 3800,
      notesAr: 'سكن جامعي حديث مخصص للطلبة الدوليين.',
    },
    admissionRequirements: [
      'شهادة البكالوريا بمعدل 11.50 فما فوق.',
      'اجتياز مقابلة بيداغوجية مع لجنة قبول المدرسة.',
    ],
    languageRequirements: ['الفرنسية والإنجليزية المتوسطة'],
    visaAndProcedures: {
      procedureNameAr: 'قبول فوري ومباشر بدون فيزا',
      descriptionAr: 'يتم التسجيل إلكترونياً واستلام شهادة التسجيل لبدء الدراسة مباشرة.',
    },
    scholarshipsAvailable: [
      {
        nameAr: 'تخفيضات التفوق الأكاديمي للطلبة المغاربيين',
        coverageAr: 'خصومات تصل إلى 20% للطلبة الحاصلين على تقدير جيد جداً في البكالوريا.',
        isFullRide: false,
      },
    ],
    officialWebsite: 'https://www.esprit.tn',
  },
];
