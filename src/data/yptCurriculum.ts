export interface CurriculumStage {
  id: string;
  title: string;
}

export interface CurriculumUnit {
  id: string;
  code: string;
  titleAr: string;
  titleFr: string;
  descriptionAr: string;
  estimatedHours: number;
}

export interface CurriculumSubject {
  id: string;
  nameAr: string;
  nameFr: string;
  hexColor: string;
  icon: string;
  coefficient: number;
  units: CurriculumUnit[];
}

export interface StreamCurriculum {
  streamId: string;
  streamNameAr: string;
  streamNameFr: string;
  subjects: CurriculumSubject[];
}

export const CURRICULUM_STAGES: CurriculumStage[] = [
  { id: "theory", title: "درس نظري وفهم المفاهيم" },
  { id: "summary", title: "ملخص شخصي ومخطط ذهني" },
  { id: "exercises", title: "حل تمارين الكتاب والأنشطة" },
  { id: "annales", title: "حل مواضيع البكالوريا السابقة" },
];

export const BAC_STREAM_CURRICULUM: Record<string, StreamCurriculum> = {
  sciences_exp: {
    streamId: "sciences_exp",
    streamNameAr: "علوم تجريبية",
    streamNameFr: "Sciences Expérimentales",
    subjects: [
      {
        id: "natural_sciences",
        nameAr: "علوم الطبيعة والحياة",
        nameFr: "Sciences de la Nature et de la Vie",
        hexColor: "#059669",
        icon: "🧬",
        coefficient: 6,
        units: [
          {
            id: "sci_u1",
            code: "الوحدة 1",
            titleAr: "آليات تركيب البروتين والاستنساخ والترجمة",
            titleFr: "Mécanismes de synthèse des protéines",
            descriptionAr: "مقر ودور الـ ARNm، الشفرة الوراثية، والتنشيط والمراحل.",
            estimatedHours: 18,
          },
          {
            id: "sci_u2",
            code: "الوحدة 2",
            titleAr: "العلاقة بين بنية ووظيفة البروتين",
            titleFr: "Relation entre structure et fonction des protéines",
            descriptionAr: "المستويات البنائية، السلوك الأمفوتيري، والروابط الكيميائية.",
            estimatedHours: 12,
          },
          {
            id: "sci_u3",
            code: "الوحدة 3",
            titleAr: "النشاط الإنزيمي وتأثير العوامل الخارجية",
            titleFr: "Activité enzymatique",
            descriptionAr: "الموقع الفعال، التكامل المحفز، وتأثير pH ودرجة الحرارة والمثبطات.",
            estimatedHours: 16,
          },
          {
            id: "sci_u4",
            code: "الوحدة 4",
            titleAr: "دور البروتينات في الدفاع عن الذات (المناعة)",
            titleFr: "Immunologie",
            descriptionAr: "الذات واللاذات، الاستجابة الخلطية والخلوية، وفيروس فقدان المناعة VIH.",
            estimatedHours: 24,
          },
          {
            id: "sci_u5",
            code: "الوحدة 5",
            titleAr: "دور البروتينات في الاتصال العصبي",
            titleFr: "Communication nerveuse",
            descriptionAr: "كمون الراحة والعمل، النقل المشبكي، وتأثير المخدرات والسموم.",
            estimatedHours: 20,
          },
          {
            id: "sci_u6",
            code: "الوحدة 6",
            titleAr: "التحولات الطاقوية (التركيب الضوئي والتنفس)",
            titleFr: "Conversions énergétiques",
            descriptionAr: "المرحلة الكيميوضوئية، الكيميولاحيوية وحلقة كالفن، والتحلل السكري.",
            estimatedHours: 18,
          },
        ],
      },
      {
        id: "physics",
        nameAr: "العلوم الفيزيائية",
        nameFr: "Physique-Chimie",
        hexColor: "#D97706",
        icon: "⚡",
        coefficient: 5,
        units: [
          {
            id: "phys_u1",
            code: "الوحدة 1",
            titleAr: "المتابعة الزمنية لتحول كيميائي في وسط مائي",
            titleFr: "Suivi temporel d'une transformation chimique",
            descriptionAr: "طرق المتابعة (قياس الناقلية، حجم الغاز، المعايرة اللونية) وزمن نصف التفاعل t1/2.",
            estimatedHours: 20,
          },
          {
            id: "phys_u2",
            code: "الوحدة 2",
            titleAr: "دراسة تطور جملة ميكانيكية (قوانين نيوتن)",
            titleFr: "Évolution d'un système mécanique",
            descriptionAr: "حركة الكواكب والأقمار، السقوط الشاقولي، الحركة على المستوي، والقذائف.",
            estimatedHours: 24,
          },
          {
            id: "phys_u3",
            code: "الوحدة 3",
            titleAr: "الظواهر الكهربائية (ثنائي القطب RC و RL)",
            titleFr: "Phénomènes électriques (RC et RL)",
            descriptionAr: "شحن وتفريغ المكثفة، إقامة وانقطاع التيار في الوشيعة، ومعادلات التفاضلية.",
            estimatedHours: 18,
          },
          {
            id: "phys_u4",
            code: "الوحدة 4",
            titleAr: "تطور جملة كيميائية نحو حالة التوازن (الأحماض والأسس)",
            titleFr: "Équilibre acido-basique",
            descriptionAr: "مفهوم pH، ثابت الحموضة Ka، كسر التفاعل Qr، ومنحنيات المعايرة pH-متري.",
            estimatedHours: 18,
          },
          {
            id: "phys_u5",
            code: "الوحدة 5",
            titleAr: "التحولات النووية والنشاط الإشعاعي",
            titleFr: "Transformations nucléaires",
            descriptionAr: "أنواع التفكك الإشعاعي (α, β-, β+, γ)، قانون التناقص، طاقة الربط والانشطار والاندماج.",
            estimatedHours: 14,
          },
          {
            id: "phys_u6",
            code: "الوحدة 6",
            titleAr: "مراقبة تطور جملة كيميائية (الأسترة والحلمهة)",
            titleFr: "Estérification et hydrolyse",
            descriptionAr: "خصائص تفاعل الأسترة، المردود، وطرق تحسين المردود والسرعة.",
            estimatedHours: 12,
          },
        ],
      },
      {
        id: "math",
        nameAr: "الرياضيات",
        nameFr: "Mathématiques",
        hexColor: "#2563EB",
        icon: "📐",
        coefficient: 5,
        units: [
          {
            id: "math_u1",
            code: "الوحدة 1",
            titleAr: "المتتاليات العددية والبرهان بالتراجع",
            titleFr: "Suites numériques",
            descriptionAr: "المتتاليات الحسابية والهندسية، اتجاه التغير، التقارب، والمجاميع.",
            estimatedHours: 20,
          },
          {
            id: "math_u2",
            code: "الوحدة 2",
            titleAr: "الدوال العددية، الاشتقاقية، والاستمرارية",
            titleFr: "Fonctions numériques",
            descriptionAr: "النهايات، المستقيمات المقاربة، مبرهنة القيم المتوسطة، والاشتقاق.",
            estimatedHours: 18,
          },
          {
            id: "math_u3",
            code: "الوحدة 3",
            titleAr: "الدوال الأسية واللوغاريتمية النيبيرية",
            titleFr: "Fonctions exponentielles et logarithmiques",
            descriptionAr: "الخواص الجبرية، النهايات الشهيرة، المشتقات، ودراسة الدوال المركبة.",
            estimatedHours: 24,
          },
          {
            id: "math_u4",
            code: "الوحدة 4",
            titleAr: "الدوال الأصلية والحساب التكاملي",
            titleFr: "Primitives et calcul intégral",
            descriptionAr: "جدول الدوال الأصلية، التكامل بالتجزئة، وحساب المساحات والحجوم.",
            estimatedHours: 14,
          },
          {
            id: "math_u5",
            code: "الوحدة 5",
            titleAr: "الاحتمالات وقوانين التوزيع الاحتمالي",
            titleFr: "Probabilités",
            descriptionAr: "الاحتمال الشرطي، شجرة الاحتمالات، المتغير العشوائي، وقانون برنولي وتوزيع الحدين.",
            estimatedHours: 16,
          },
          {
            id: "math_u6",
            code: "الوحدة 6",
            titleAr: "الهندسة في الفضاء والجداء السلمي",
            titleFr: "Géométrie dans l'espace",
            descriptionAr: "المعادلات الديكارتية للمستويات، التمثيل الوسيطي للمستقيمات، والمسافات والتقاطع.",
            estimatedHours: 14,
          },
        ],
      },
      {
        id: "philosophy",
        nameAr: "الفلسفة",
        nameFr: "Philosophie",
        hexColor: "#7C3AED",
        icon: "💭",
        coefficient: 2,
        units: [
          {
            id: "philo_u1",
            code: "المحور 1",
            titleAr: "السؤال بين المشكلة العلمية والإشكالية الفلسفية",
            titleFr: "Problème scientifique et question philosophique",
            descriptionAr: "المقارنة، أوجه الشبه والاختلاف، ومجالات وحدود كل منهما.",
            estimatedHours: 10,
          },
          {
            id: "philo_u2",
            code: "المحور 2",
            titleAr: "فلسفة العلوم التجريبية والبيولوجيا",
            titleFr: "Épistémologie des sciences",
            descriptionAr: "تطبيق المنهج التجريبي على المادة الحية والجامدة، والحتمية واللاحتمية.",
            estimatedHours: 14,
          },
          {
            id: "philo_u3",
            code: "المحور 3",
            titleAr: "العلوم الإنسانية (علم النفس، التاريخ، الاجتماع)",
            titleFr: "Sciences humaines",
            descriptionAr: "إمكانية إخضاع الظاهرة الإنسانية والتاريخية للمنهج العلمي.",
            estimatedHours: 12,
          },
          {
            id: "philo_u4",
            code: "المحور 4",
            titleAr: "الرياضيات والمطلقية: أصل المفاهيم الرياضية",
            titleFr: "Origine des mathématiques",
            descriptionAr: "بين النزعة العقلية الفطرية والتجريبية الحسية، والبديهيات والمسلمات.",
            estimatedHours: 10,
          },
        ],
      },
    ],
  },
  math: {
    streamId: "math",
    streamNameAr: "رياضيات",
    streamNameFr: "Mathématiques",
    subjects: [
      {
        id: "math",
        nameAr: "الرياضيات",
        nameFr: "Mathématiques",
        hexColor: "#2563EB",
        icon: "📐",
        coefficient: 7,
        units: [
          {
            id: "m_u1",
            code: "الوحدة 1",
            titleAr: "المتتاليات العددية والبرهان بالتراجع والمجاميع المتقدمة",
            titleFr: "Suites numériques avancées",
            descriptionAr: "المتتاليات المترابطة، المتقاربة، ومبرهنات الحصر والمجاميع.",
            estimatedHours: 26,
          },
          {
            id: "m_u2",
            code: "الوحدة 2",
            titleAr: "الحساب والموافقات في Z والقواسم والمضاعفات",
            titleFr: "Arithmétique dans Z",
            descriptionAr: "الموافقات، قابلية القسمة، مبرهنة غوص وبيزو، والأعداد الأولية وتطبيقاتها في التشفير.",
            estimatedHours: 28,
          },
          {
            id: "m_u3",
            code: "الوحدة 3",
            titleAr: "الأعداد المركبة والتحويلات النقطية في المستوي",
            titleFr: "Nombres complexes et transformations",
            descriptionAr: "الشكل الجبري، المثلثي، الأسي، مبرهنة ديموافر، التحاكي، الدوران، والتشابه المباشر.",
            estimatedHours: 28,
          },
          {
            id: "m_u4",
            code: "الوحدة 4",
            titleAr: "الدوال العددية والأسية واللوغاريتمية المتقدمة",
            titleFr: "Fonctions avancées",
            descriptionAr: "نقط الانعطاف، المماسات، الدوال الأصلية المركبة، والدراسة البيانية المعمقة.",
            estimatedHours: 26,
          },
          {
            id: "m_u5",
            code: "الوحدة 5",
            titleAr: "الحساب التكاملي والمعادلات التفاضلية",
            titleFr: "Calcul intégral et équations différentielles",
            descriptionAr: "حل المعادلات التفاضلية من الرتبة 1 و 2، وحساب المساحات المعقدة.",
            estimatedHours: 20,
          },
        ],
      },
      {
        id: "physics",
        nameAr: "العلوم الفيزيائية",
        nameFr: "Physique-Chimie",
        hexColor: "#D97706",
        icon: "⚡",
        coefficient: 6,
        units: [
          {
            id: "mp_u1",
            code: "الوحدة 1",
            titleAr: "المتابعة الزمنية والسرعات اللحظية والتفاعلات الكيميائية",
            titleFr: "Cinétique chimique avancée",
            descriptionAr: "السرعات الحجمية للتفاعل والتشكل والاختفاء، زمن نصف التفاعل، والناقلية.",
            estimatedHours: 20,
          },
          {
            id: "mp_u2",
            code: "الوحدة 2",
            titleAr: "الميكانيك وقوانين نيوتن والحركات الاهتزازية",
            titleFr: "Mécanique et oscillations",
            descriptionAr: "النواس المرن، النواس الثقلي، التخامد، والطاقة الميكانيكية.",
            estimatedHours: 26,
          },
          {
            id: "mp_u3",
            code: "الوحدة 3",
            titleAr: "الدارات الكهربائية RC, RL و RLC المتذبذبة",
            titleFr: "Circuits RLC et résonance",
            descriptionAr: "الاهتزازات الكهربائية الحرة والمخمدة، وشبه الدور وتناقص الطاقة.",
            estimatedHours: 22,
          },
        ],
      },
    ],
  },
  technique_math: {
    streamId: "technique_math",
    streamNameAr: "تقني رياضي",
    streamNameFr: "Technique Mathématique",
    subjects: [
      {
        id: "technology",
        nameAr: "التكنولوجيا (الهندسة التخصصية)",
        nameFr: "Génie Technologique",
        hexColor: "#EA580C",
        icon: "⚙️",
        coefficient: 7,
        units: [
          {
            id: "tm_u1",
            code: "الوحدة 1",
            titleAr: "مقاومة المواد (المد والضغط والقص والالتواء والانحناء)",
            titleFr: "Résistance des matériaux",
            descriptionAr: "حساب الإجهادات ومعاملات الأمان والأبعاد المسموحة.",
            estimatedHours: 24,
          },
          {
            id: "tm_u2",
            code: "الوحدة 2",
            titleAr: "الأنظمة الآلية والمنطق التعاقبي والـ GRAFCET",
            titleFr: "Automatisme et Grafcet",
            descriptionAr: "المتمن، الجداول المنطقية، المخططات الوظيفية، والدوائر الهوائية والكهربائية.",
            estimatedHours: 22,
          },
          {
            id: "tm_u3",
            code: "الوحدة 3",
            titleAr: "الوصلات الميكانيكية ودراسة الآليات",
            titleFr: "Liaisons mécaniques et guidage",
            descriptionAr: "نقل الحركة، التوجيه بالتدحرج والانزلاق، والتحليل الوظيفي.",
            estimatedHours: 20,
          },
        ],
      },
      {
        id: "math",
        nameAr: "الرياضيات",
        nameFr: "Mathématiques",
        hexColor: "#2563EB",
        icon: "📐",
        coefficient: 6,
        units: [
          {
            id: "tmm_u1",
            code: "الوحدة 1",
            titleAr: "المتتاليات والدوال العددية والأسية واللوغاريتمية",
            titleFr: "Fonctions et suites",
            descriptionAr: "دراسة شاملة للنهايات والاشتقاق والدوال الأسية وتطبيقاتها.",
            estimatedHours: 24,
          },
          {
            id: "tmm_u2",
            code: "الوحدة 2",
            titleAr: "الأعداد المركبة والتحويلات الهندسية",
            titleFr: "Nombres complexes",
            descriptionAr: "الخواص الجبرية والمثلثية والهندسية للأعداد المركبة.",
            estimatedHours: 22,
          },
        ],
      },
    ],
  },
  gestion_eco: {
    streamId: "gestion_eco",
    streamNameAr: "تسيير واقتصاد",
    streamNameFr: "Gestion et Économie",
    subjects: [
      {
        id: "accounting_finance",
        nameAr: "التسيير المحاسبي والمالي",
        nameFr: "Gestion Comptable et Financière",
        hexColor: "#65A30D",
        icon: "📊",
        coefficient: 6,
        units: [
          {
            id: "ge_u1",
            code: "الوحدة 1",
            titleAr: "تسوية التثبيتات والاهتلاكات وخسائر القيمة",
            titleFr: "Amortissements et dépréciations",
            descriptionAr: "الاهتلاك الخطي والمتناقص والمتزايد، خسارة القيمة، والتنازل عن التثبيتات.",
            estimatedHours: 22,
          },
          {
            id: "ge_u2",
            code: "الوحدة 2",
            titleAr: "تسوية المخزونات والزبائن وحسابات الزبائن المشكوك فيهم",
            titleFr: "Régularisation des stocks et créances",
            descriptionAr: "فروق الجرد المبررة وغير المبررة، الديون المعدومة، وتسوية الأعباء والمنتوجات المعاينة مسبقاً.",
            estimatedHours: 20,
          },
          {
            id: "ge_u3",
            code: "الوحدة 3",
            titleAr: "إعداد الميزانية الختامية وحسابات النتائج وتحليل السيولة والربحية",
            titleFr: "Bilan financier et ratios",
            descriptionAr: "جدول حساب النتائج حسب الطبيعة وحسب الوظيفة، رأس المال العامل، ونسب المردودية.",
            estimatedHours: 24,
          },
        ],
      },
      {
        id: "economy_law",
        nameAr: "الاقتصاد والمناجمنت والقانون",
        nameFr: "Économie, Management & Droit",
        hexColor: "#0D9488",
        icon: "⚖️",
        coefficient: 5,
        units: [
          {
            id: "el_u1",
            code: "الوحدة 1",
            titleAr: "النقود، الكتلة النقدية، والنظام المصرفي الجزائري",
            titleFr: "Monnaie et système bancaire",
            descriptionAr: "وظائف النقود، أنواع البنوك، البنك المركزي، والسياسة النقدية.",
            estimatedHours: 16,
          },
          {
            id: "el_u2",
            code: "الوحدة 2",
            titleAr: "السوق والأسعار، التضخم، والبطالة وطرق علاجها",
            titleFr: "Marché, inflation et chômage",
            descriptionAr: "قانون العرض والطلب، أسباب التضخم وآثاره، وأنواع البطالة والسياسات التشغيلية.",
            estimatedHours: 16,
          },
          {
            id: "el_u3",
            code: "الوحدة 3",
            titleAr: "عقد العمل، علاقات العمل الفردية والجماعية، والشركات التجارية",
            titleFr: "Droit du travail et des sociétés",
            descriptionAr: "شروط عقد العمل، النزاعات العمالية، شركة المساهمة والشركة ذات المسؤولية المحدودة SARL.",
            estimatedHours: 18,
          },
        ],
      },
    ],
  },
  lettres_philo: {
    streamId: "lettres_philo",
    streamNameAr: "آداب وفلسفة",
    streamNameFr: "Lettres et Philosophie",
    subjects: [
      {
        id: "philosophy",
        nameAr: "الفلسفة",
        nameFr: "Philosophie",
        hexColor: "#7C3AED",
        icon: "💭",
        coefficient: 6,
        units: [
          {
            id: "lp_u1",
            code: "المحور 1",
            titleAr: "في الإدراك والميول: الإحساس والإدراك، واللغة والفكر",
            titleFr: "Perception, langage et pensée",
            descriptionAr: "علاقة الدال بالمدلول، اتجاهات علم النفس الغشتالتي والنفسي في الإدراك، ووظائف اللغة.",
            estimatedHours: 24,
          },
          {
            id: "lp_u2",
            code: "المحور 2",
            titleAr: "الذاكرة والخيال، والعادة والإرادة والحرية",
            titleFr: "Mémoire, imagination et volonté",
            descriptionAr: "المادية والروحية في الذاكرة (برغسون ورينو)، والتكيف الإيجابي والسلبي للعادة.",
            estimatedHours: 22,
          },
          {
            id: "lp_u3",
            code: "المحور 3",
            titleAr: "الحياة الفردية والاجتماعية: الشغل، والأنظمة الاقتصادية، والسياسة",
            titleFr: "Vie politique et économique",
            descriptionAr: "الرأسمالية والاشتراكية، مفهوم العدالة والدولة والحق والواجب، والأخلاق والسياسة.",
            estimatedHours: 26,
          },
        ],
      },
      {
        id: "arabic",
        nameAr: "اللغة العربية وآدابها",
        nameFr: "Langue et Littérature Arabes",
        hexColor: "#0891B2",
        icon: "📖",
        coefficient: 6,
        units: [
          {
            id: "lpa_u1",
            code: "الوحدة 1",
            titleAr: "عصر الضعف والانحطاط: المدائح النبوية وشعر الزهد والنثر العلمي",
            titleFr: "Poésie religieuse et prose scientifique",
            descriptionAr: "البوصيري، ابن عربي، ابن خلدون، وخصائص النثر العلمي المتأدب.",
            estimatedHours: 18,
          },
          {
            id: "lpa_u2",
            code: "الوحدة 2",
            titleAr: "عصر النهضة وأدب المهجر والنزعة الإنسانية والتفاؤلية",
            titleFr: "Littérature d'exil (Mahjar)",
            descriptionAr: "إيليا أبو ماضي، ميخائيل نعيمة، جبران خليل جبران، ومظاهر التجديد في القصيدة.",
            estimatedHours: 20,
          },
          {
            id: "lpa_u3",
            code: "الوحدة 3",
            titleAr: "الشعر السياسي والقومي وقضايا التحرر والثورة الجزائرية",
            titleFr: "Poésie engagée et Révolution",
            descriptionAr: "مفدي زكريا، محمود درويش، نزار قباني، وظاهرة الالتزام في الأدب العربي المعاصر.",
            estimatedHours: 22,
          },
        ],
      },
    ],
  },
  langues_etrangeres: {
    streamId: "langues_etrangeres",
    streamNameAr: "لغات أجنبية",
    streamNameFr: "Langues Étrangères",
    subjects: [
      {
        id: "french",
        nameAr: "اللغة الفرنسية",
        nameFr: "Langue Française",
        hexColor: "#4F46E5",
        icon: "🇫🇷",
        coefficient: 5,
        units: [
          {
            id: "le_fr1",
            code: "Projet 1",
            titleAr: "النص التاريخي وتحليل الشهادات وحرب التحرير الجزائرية",
            titleFr: "Le texte d'histoire et témoignages",
            descriptionAr: "L'objectivité, la visée communicative historique, la modalisation et le compte-rendu objectif.",
            estimatedHours: 22,
          },
          {
            id: "le_fr2",
            code: "Projet 2",
            titleAr: "النص الحجاجي والمناظرة الفكرية وتبادل الآراء",
            titleFr: "Le texte argumentatif et débat d'idées",
            descriptionAr: "Les thèses, les arguments, les connecteurs logiques, la réfutation et la concession.",
            estimatedHours: 20,
          },
          {
            id: "le_fr3",
            code: "Projet 3",
            titleAr: "النداء والخطاب التحريضي والإنساني",
            titleFr: "L'appel et l'exhortation",
            descriptionAr: "La situation négative, la prise de conscience, l'injonction et les verbes de modalité.",
            estimatedHours: 18,
          },
        ],
      },
      {
        id: "english",
        nameAr: "اللغة الإنجليزية",
        nameFr: "Langue Anglaise",
        hexColor: "#DB2777",
        icon: "🇬🇧",
        coefficient: 5,
        units: [
          {
            id: "le_en1",
            code: "Unit 1",
            titleAr: "Ancient Civilizations: Flourishing & Collapse",
            titleFr: "Ancient Civilizations",
            descriptionAr: "Mesopotamia, Ancient Egypt, Greece, Roman Empire, causes of rise and fall of civilizations.",
            estimatedHours: 20,
          },
          {
            id: "le_en2",
            code: "Unit 2",
            titleAr: "Ethics in Business: Fighting Corruption, Bribery, & Fraud",
            titleFr: "Ethics in Business",
            descriptionAr: "Whistleblowing, counterfeiting, child labor, moral obligations, passive voice and conditionals.",
            estimatedHours: 22,
          },
          {
            id: "le_en3",
            code: "Unit 3",
            titleAr: "Education in the World: Systems, Opportunities, & Challenges",
            titleFr: "Education in the World",
            descriptionAr: "Comparing Algerian, British, and American school systems, exams stress, and university life.",
            estimatedHours: 18,
          },
        ],
      },
    ],
  },
};

export function getStreamCurriculum(streamId: string): StreamCurriculum {
  return BAC_STREAM_CURRICULUM[streamId] || BAC_STREAM_CURRICULUM["sciences_exp"];
}
