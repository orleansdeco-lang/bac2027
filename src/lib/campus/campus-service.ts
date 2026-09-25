/**
 * Campus & 3D Majlis Service
 * Handles Knowledge Bank, 3D Table State, Cross-Service Sync with Planner & Error Lab
 */

import {
  CampusPost,
  MajlisTable,
  MajlisSeat,
  CampusBagItem,
  MajlisActivityMode,
  TablePhase,
} from "@/types/campus";
import { StreamId, SubjectId } from "@/types/education";
import { PlannerStorage, getTodayDateString } from "@/lib/planner/storage";
import { saveErrorRecord } from "@/lib/mission/storage";
import { ErrorRecord } from "@/types/mission";

const STORAGE_KEYS = {
  POSTS: "shater_campus_posts_v1",
  TABLES: "shater_campus_tables_v1",
  BAG: "shater_campus_bag_v1",
  LIKES: "shater_campus_likes_v1",
};

// Seed authentic knowledge bank posts
const SEED_POSTS: CampusPost[] = [
  {
    id: "post-1",
    authorId: "laureate-amina",
    authorName: "أمينة ب. (معدل 18.72)",
    authorAvatar: "👩‍🎓",
    authorStream: "sciences_exp",
    authorBadge: "متفوقة بكالوريا 2024",
    type: "EXPERIENCE",
    title: "خطة التعامل مع مادة العلوم الطبيعية: كيف انتقلت من 13 إلى 19.5/20؟",
    content: `السلام عليكم زملائي المقبيلين على البكالوريا 🤍
الكثير يعتقد أن العلوم حفظ خالص، وهذا أكبر خطأ! السر الحقيقي يكمن في:
1. **استغلال الوثائق:** لا تبدأ أبداً بكتابة التفسير قبل استخراج الدلالة من المعطيات (كل منحنى له قراءة + دلالة + استنتاج).
2. **الربط المنطقي في النص العلمي:** ابدأ بمشكلة علمية واضحة تنتهي بعلامة استفهام، وفي العرض استخدم كلمات ربط سببية (حيث، مما يؤدي إلى، وبالتالي)، واختم بحل المشكل.
3. **تفريغ الأخطاء:** كل تمرين تحله في البكالوريات التجريبية، دوّن في دفتر خاص المصطلحات التي غفلت عنها في سلم التنقيط.`,
    stream: "sciences_exp",
    subjectId: "natural_sciences",
    lesson: "الاستدلال العلمي والنص العلمي",
    tags: ["منهجية_العلوم", "نصائح_متفوقين", "الاستدلال_العلمي"],
    likesCount: 142,
    bookmarksCount: 89,
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
  },
  {
    id: "post-2",
    authorId: "laureate-karim",
    authorName: "كريم م. (شعبة رياضيات)",
    authorAvatar: "👨‍🎓",
    authorStream: "math",
    authorBadge: "طالب بالمدرسة العليا للذكاء الاصطناعي",
    type: "SUMMARY",
    title: "خريطة ذهنية شاملة: إزالة جميع حالات عدم التعيين في النهايات الأربع",
    content: `ملخص مركز جمعت فيه الطرق الأسرع لإزالة حالات عدم التعيين الأربع ($0/0$ ، $\\infty/\\infty$ ، $0 \\times \\infty$ ، $+\\infty - \\infty$):
- **الدوال الناطقة:** الحد الأعلى درجة عند اللانهاية، والتحليل والاختزال عند الصفر.
- **الدوال الجذرية:** المرافق إذا كانت المعاملات متساوية، والتحليل وإخراج $x$ إذا كانت المعاملات مختلفة (احذر $|x| = -x$ عند $-\\infty$!).
- **الدوال الأسية واللوغاريتمية:** التزايد المقارن $\\lim \\frac{e^x}{x^n} = +\\infty$ و $\\lim x^n \\ln x = 0$.`,
    stream: "math",
    subjectId: "math",
    lesson: "الدوال والاشتقاقية والنهايات",
    tags: ["رياضيات", "ملخص_نهايات", "تزايد_مقارن"],
    likesCount: 215,
    bookmarksCount: 167,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "post-3",
    authorId: "laureate-sarah",
    authorName: "سارة ت. (آداب وفلسفة)",
    authorAvatar: "👩‍🏫",
    authorStream: "lettres_philo",
    authorBadge: "بكالوريا 16.40 الأولى ولائياً",
    type: "TRICKY_EXAM_PROBLEM",
    title: "فخ خطير في مقالة المقارنة بين المشكلة والإشكالية وكيف تكسب نقاط التركيب",
    content: `أغلب المترشحين يخسرون 4 نقاط كاملة في سلم تصحيح الفلسفة في المقارنة لأنهم يعتقدون أن المقارنة هي ذكر الفروق فقط!
- **في أوجه الاختلاف:** لا تكتفِ بجدول، بل بين أثر الاختلاف على طبيعة السؤال والجواب.
- **في مواطن التداخل:** أثبت أن المشكلة جزء من الإشكالية، والإشكالية مظلة تحتوي على مشكلات فرعية.
- **الخاتمة (نسبة الترابط):** يجب صياغة استنتاج نسقي يبين تكامل المصطلحين في الممارسة الفلسفية.`,
    stream: "lettres_philo",
    subjectId: "philosophy",
    lesson: "المشكلة والإشكالية",
    tags: ["فلسفة", "مقالة_مقارنة", "فخاخ_وزارية"],
    likesCount: 98,
    bookmarksCount: 74,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: "post-4",
    authorId: "laureate-yacine",
    authorName: "ياسين ع. (تقني رياضي - كهرباء)",
    authorAvatar: "⚡",
    authorStream: "technique_math",
    type: "TRICKY_EXAM_PROBLEM",
    title: "فخ التحليل البعدي لثابت الزمن $\\tau = RC$ و $\\tau = L/R$",
    content: `ركزوا جيداً في البكالوريا! يطلب منك: 'أثبت أن لثابت الزمن بعداً زمنياً'.
الخطأ الشائع: كتابة الناتج مباشرة دون المرور بقوانين التوتر والتيار!
- اكتب: $[\\tau] = [R] \\cdot [C]$
- استخرج $[R]$ من قانون أوم: $U = R \\cdot I \\implies [R] = [U] / [I]$
- استخرج $[C]$ من علاقة الشحنة: $q = C \\cdot U = I \\cdot t \\implies [C] = ([I] \\cdot [T]) / [U]$
- اضرب: $[\\tau] = ([U] / [I]) \\cdot (([I] \\cdot [T]) / [U]) = [T]$ (الناتج بالثانية $s$).`,
    stream: "technique_math",
    subjectId: "physics",
    lesson: "الدارة RC والتحليل البعدي",
    tags: ["فيزياء", "دارة_RC", "تحليل_بعدي"],
    likesCount: 164,
    bookmarksCount: 112,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: "post-5",
    authorId: "laureate-mehdi",
    authorName: "مهدي خ. (تسيير واقتصاد)",
    authorAvatar: "📊",
    authorStream: "gestion_eco",
    type: "SUMMARY",
    title: "جدول قوانين استهلاك القروض العادية (الدفعة الثابتة وحساب الفائدة)",
    content: `ملخص فائق الأهمية في التسيير المحاسبي والمالي:
1. العلاقة بين الاستهلاكات المتتالية: $A_{p} = A_1 \\times (1+i)^{p-1}$.
2. مجموع الاستهلاكات يساوي أصل القرض: $V_0 = A_1 + A_2 + \\dots + A_n$.
3. الدفعة الثابتة: $a = A_p + I_p = A_1 \\times (1+i)^n$.
تأكد دائماً من أن جدول الاستهلاك يختتم برصيد $0$ في نهاية المدة.`,
    stream: "gestion_eco",
    subjectId: "accounting_finance",
    lesson: "استهلاك القروض العادية",
    tags: ["محاسبة", "استهلاك_القروض", "تسيير_واقتصاد"],
    likesCount: 88,
    bookmarksCount: 65,
    createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
];

// Seed live tables
const SEED_TABLES: MajlisTable[] = [
  {
    id: "table-sciences-rc",
    title: "تحدي تمرين الدارة RC — بكالوريا 2022 بالتوقيت الصارم",
    creatorId: "user-ali",
    creatorName: "علي المنصوري",
    stream: "sciences_exp",
    subjectId: "physics",
    lesson: "ثنائي القطب RC (شحن وتفريغ مكثفة)",
    mode: "PAPER_PRACTICE",
    capacity: 6,
    status: "ACTIVE",
    currentPhase: "READING_SOLVING",
    timeRemainingSeconds: 780, // 13 mins left
    durationMinutes: 25,
    createdAt: new Date(Date.now() - 720000).toISOString(),
    seats: [
      {
        seatIndex: 0,
        studentId: "user-ali",
        studentName: "علي المنصوري",
        avatar: "👨‍🎓",
        stream: "sciences_exp",
        status: "SOLVING",
        statusPill: "يحل الآن ✍️",
        timerSeconds: 720,
        joinedAt: new Date(Date.now() - 720000).toISOString(),
      },
      {
        seatIndex: 1,
        studentId: "user-nour",
        studentName: "نور الهدى",
        avatar: "👩‍🎓",
        stream: "sciences_exp",
        status: "SOLVING",
        statusPill: "يحل الآن ✍️",
        timerSeconds: 650,
        joinedAt: new Date(Date.now() - 650000).toISOString(),
      },
      {
        seatIndex: 2,
        studentId: "user-anas",
        studentName: "أنس الجزائري",
        avatar: "🔬",
        stream: "sciences_exp",
        status: "FINISHED",
        statusPill: "أنهى الحل ✅",
        timerSeconds: 480,
        joinedAt: new Date(Date.now() - 500000).toISOString(),
      },
      null,
      null,
      null,
    ],
    activeMaterial: {
      problemSheet: {
        title: "تمرين تجريبي: شحن مكثفة عبر ناقل أومي وتعيين المقاومة المجهولة $R$",
        source: "بكالوريا 2022 — الموضوع الأول (شعبة علوم تجريبية)",
        problemText: `نحقق دارة كهربائية تتألف من مولد مثالي للتوتر قوته المحركة $E = 6\\text{ V}$، ناقل أومي مقاومته $R$، مكثفة سعتها $C = 100\\ \\mu\\text{F}$ فارغة تماماً، وقاطعة $K$. عند اللحظة $t=0$ نغلق القاطعة.
1. أعد رسم الدارة مبيناً عليها بسهم جهة التيار وتوتري الناقل الأومي ومكثفة.
2. بتطبيق قانون جمع التوترات، بيّن أن المعادلة التفاضلية التي يحققها التوتر $u_C(t)$ تُكتب من الشكل:
   $$\\frac{du_C}{dt} + \\frac{1}{\\tau} u_C = \\frac{E}{\\tau}$$
3. بالاعتماد على المنحنى البياني $u_C(t)$ المعطى:
   - عيّن بيانياً قيمة ثابت الزمن $\\tau$.
   - استنتج قيمة المقاومة $R$ للناقل الأومي.
   - احسب الطاقة الأعظمية المخزنة في المكثفة عند نهاية الشحن.`,
        hint: "تذكر أن $\\tau$ يمثل فاصلة النقطة التي يبلغ عندها التوتر $0.63 E$ أي $3.78\\text{ V}$.",
        solutionText: `الحل النموذجي المعتمد:
1. توتر المكثفة $u_C$ وتوتر المقاومة $u_R$ يكونان في عكس جهة التيار الكهربائي $i(t)$.
2. قانون جمع التوترات: $u_R(t) + u_C(t) = E$. لدينا $u_R = R \\cdot i$ و $i = C \\frac{du_C}{dt}$. إذن: $R C \\frac{du_C}{dt} + u_C = E$. بالقسمة على $R C$: $\\frac{du_C}{dt} + \\frac{1}{R C} u_C = \\frac{E}{R C}$ حيث $\\tau = R C$.
3. بيانياً: عند $u_C = 0.63 \\times 6 = 3.78\\text{ V}$ نقرأ على محور الفواصل: $\\tau = 0.2\\text{ s}$.
   - استنتاج $R$: لدينا $\\tau = R C \\implies R = \\frac{\\tau}{C} = \\frac{0.2}{100 \\times 10^{-6}} = 2000\\ \\Omega = 2\\text{ k}\\Omega$.
   - الطاقة الأعظمية: $E_{C,\\max} = \\frac{1}{2} C E^2 = 0.5 \\times 100 \\times 10^{-6} \\times 6^2 = 1.8 \\times 10^{-3}\\text{ J} = 1.8\\text{ mJ}$.`,
        rubric: [
          { criterion: "رسم الدارة وتوجيه الأسهم بدقة اصطلاح مستقبل ومولد", points: 0.5 },
          { criterion: "تطبيق قانون جمع التوترات وصياغة المعادلة التفاضلية", points: 1.0 },
          { criterion: "التعيين البياني لثابت الزمن $\\tau = 0.2\\text{ s}$ بطريقة $0.63 E$", points: 1.0 },
          { criterion: "حساب المقاومة $R = 2000\\ \\Omega$ مع ذكر الوحدة", points: 1.0 },
          { criterion: "حساب الطاقة الأعظمية $E_{C,\\max} = 1.8\\text{ mJ}$ بالقانون الصحيح", points: 0.5 },
        ],
        totalPoints: 4,
      },
    },
  },
  {
    id: "table-math-quiz",
    title: "كويز تفاعلي سريع: أسرار التزايد المقارن والمستقيمات المقاربة",
    creatorId: "user-tarek",
    creatorName: "طارق بلقاسم",
    stream: "math",
    subjectId: "math",
    lesson: "الدوال الأسية واللوغاريتمية",
    mode: "DIGITAL_QUIZ",
    capacity: 4,
    status: "ACTIVE",
    currentPhase: "QUESTION_ACTIVE",
    timeRemainingSeconds: 30,
    durationMinutes: 15,
    createdAt: new Date(Date.now() - 300000).toISOString(),
    seats: [
      {
        seatIndex: 0,
        studentId: "user-tarek",
        studentName: "طارق بلقاسم",
        avatar: "📐",
        stream: "math",
        status: "SOLVING",
        statusPill: "يحل الآن ✍️",
        timerSeconds: 25,
        quizScore: 20,
        joinedAt: new Date(Date.now() - 300000).toISOString(),
      },
      {
        seatIndex: 1,
        studentId: "user-fatima",
        studentName: "فاطمة الزهراء",
        avatar: "👩‍🎓",
        stream: "math",
        status: "FINISHED",
        statusPill: "أنهى الحل ✅",
        timerSeconds: 12,
        quizScore: 30,
        joinedAt: new Date(Date.now() - 280000).toISOString(),
      },
      null,
      null,
    ],
    activeMaterial: {
      currentQuestionIndex: 0,
      quizQuestions: [
        {
          id: "q-1",
          question: "ما هي نهاية الدالة $f(x) = x^2 e^{-x}$ عندما يؤول $x$ إلى $+\\infty$ مع التعليل الدقيق؟",
          options: [
            "نهايتها $+\\infty$ لأن $x^2$ يغلب الأسية",
            "نهايتها $0$ بالتزايد المقارن لأن الأسية في المقام $e^x$ أسرع نمواً من أي قوى لـ $x$",
            "حالة عدم تعيين لا يمكن إزالتها إلا بالعدد المشتق",
            "نهايتها $-\\infty$ بسبب إشارة الناقص في الأس",
          ],
          correctAnswer: 1,
          explanation: "نكتب $f(x) = \\frac{x^2}{e^x} = \\frac{1}{\\frac{e^x}{x^2}}$. وبما أن $\\lim_{x \\to +\\infty} \\frac{e^x}{x^2} = +\\infty$ بالتزايد المقارن، فإن مقلوبها يؤول حتماً إلى $0$.",
          points: 10,
          rubricTag: "نهايات_تزايد_مقارن",
        },
        {
          id: "q-2",
          question: "إذا كانت $\\lim_{x \\to +\\infty} [f(x) - (2x + 1)] = 0$، فماذا يمثل المستقيم $(\\Delta): y = 2x + 1$ بالنسبة لمنحنى الدالة؟",
          options: [
            "مستقيم مقارب أفقي بجوار $+\\infty$",
            "مستقيم مقارب مائل بجوار $+\\infty$",
            "مماس للمنحنى عند النقطة ذات الفاصلة $x=0$",
            "محور تناظر لمنحنى الدالة",
          ],
          correctAnswer: 1,
          explanation: "التعريف الرسمي للمستقيم المقارب المائل: إذا كانت نهاية الفرق بين معادلة المنحنى ومعادلة مستقيم من الدرجة الأولى $ax+b$ تساوي صفراً عند اللانهاية، فالمستقيم مقارب مائل.",
          points: 10,
          rubricTag: "مستقيمات_مقاربة",
        },
        {
          id: "q-3",
          question: "ما هو اتجاه تغير الدالة $g(x) = 1 - x e^x$ على المجال $[0, +\\infty[$؟",
          options: [
            "متزايدة تماماً لأن الدالة الأسية متزايدة",
            "متناقصة تماماً لأن مشتقتها $g'(x) = -(x+1)e^x$ سالبة تماماً",
            "ثابتة لأن الحد $1$ يلغي التغير",
            "متناقصة ثم متزايدة تنعدم عند $x=1$",
          ],
          correctAnswer: 1,
          explanation: "المشتقة: $g'(x) = 0 - (1 \\cdot e^x + x \\cdot e^x) = -(1+x)e^x$. على المجال $[0, +\\infty[$ لدينا $x \\ge 0$ و $e^x > 0$ إذن $g'(x) < 0$ تماماً فالدالة متناقصة تماماً.",
          points: 10,
          rubricTag: "اتجاه_التغير_والمشتقة",
        },
      ],
    },
  },
  {
    id: "table-history-recall",
    title: "حلقة الحفظ والاسترجاع: تواريخ ومشاريع الحرب الباردة (1945-1953)",
    creatorId: "user-bilal",
    creatorName: "بلال السعيد",
    stream: "lettres_philo",
    subjectId: "history_geography",
    lesson: "بروز الصراع وتشكل العالم (الحرب الباردة)",
    mode: "GROUP_MEMORIZATION",
    capacity: 5,
    status: "ACTIVE",
    currentPhase: "MEMORIZING",
    timeRemainingSeconds: 240, // 4 mins
    durationMinutes: 20,
    createdAt: new Date(Date.now() - 200000).toISOString(),
    seats: [
      {
        seatIndex: 0,
        studentId: "user-bilal",
        studentName: "بلال السعيد",
        avatar: "🧠",
        stream: "lettres_philo",
        status: "MEMORIZING",
        statusPill: "يحفظ 🧠",
        timerSeconds: 180,
        joinedAt: new Date(Date.now() - 200000).toISOString(),
      },
      {
        seatIndex: 1,
        studentId: "user-asma",
        studentName: "أسماء ق.",
        avatar: "📚",
        stream: "lettres_philo",
        status: "READY",
        statusPill: "تم الحفظ 🧠",
        timerSeconds: 150,
        joinedAt: new Date(Date.now() - 170000).toISOString(),
      },
      null,
      null,
      null,
    ],
    activeMaterial: {
      memorizationContent: {
        title: "حزمة التواريخ الحاسمة والمشاريع الاقتصادية (1947 - 1949)",
        category: "dates",
        originalItems: [
          {
            term: "12 مارس 1947 — مبدأ ترومان",
            definition: "مساعدات مالية أمريكية بقيمة 400 مليون دولار لليونان وتركيا لمنع المد الشيوعي وسد الفراغ البريطاني.",
            keyKeywords: ["مساعدات مالية", "اليونان وتركيا", "سد الفراغ", "منع المد الشيوعي"],
          },
          {
            term: "05 جوان 1947 — مشروع مارشال",
            definition: "مساعدات مالية واقتصادية لدول أوروبا الغربية المتضررة من الحرب لإعادة إعمارها وربط اقتصادها بالولايات المتحدة.",
            keyKeywords: ["أوروبا الغربية", "إعادة الإعمار", "ربط الاقتصاد", "الهيمنة الأمريكية"],
          },
          {
            term: "22 سبتمبر 1947 — مبدأ جدانوف",
            definition: "رد سوفياتي قسّم العالم إلى معسكرين: إمبريالي استعماري بزعامة واشنطن، وديمقراطي تحرري بزعامة موسكو.",
            keyKeywords: ["معسكرين", "إمبريالي بزعامة واشنطن", "ديمقراطي تحرري"],
          },
          {
            term: "04 أفريل 1949 — حلف الشمال الأطلسي (الناتو)",
            definition: "حلف عسكري غربي مقره بروكسل تأسس لمواجهة التوسع السوفياتي في أوروبا وتوفير مظلة دفاع جماعي.",
            keyKeywords: ["حلف عسكري", "بروكسل", "مظلة دفاع جماعي", "مواجهة السوفيات"],
          },
        ],
        recallQuestions: [
          {
            prompt: "ما هو التاريخ الدقيق لمبدأ ترومان؟ ومن هي الدولتان المستهدفتان به؟",
            expectedAnswer: "12 مارس 1947، مستهدفاً اليونان وتركيا لمنع المد الشيوعي.",
            keyKeywords: ["12 مارس 1947", "اليونان", "تركيا"],
          },
          {
            prompt: "عرّف مبدأ جدانوف واذكر التقسيم الذي أقرّه للعالم عام 1947.",
            expectedAnswer: "22 سبتمبر 1947، قسّم العالم إلى معسكر إمبريالي أمريكي ومعسكر ديمقراطي سوفياتي.",
            keyKeywords: ["22 سبتمبر 1947", "معسكر إمبريالي", "معسكر ديمقراطي"],
          },
        ],
      },
    },
  },
  {
    id: "table-tech-mechanics",
    title: "مراجعة تقني رياضي: دراسة الجمل الميكانيكية ونقل الحركة",
    creatorId: "user-walid",
    creatorName: "وليد الجزائري",
    stream: "technique_math",
    subjectId: "mechanical_eng",
    lesson: "أنظمة نقل الحركة والمسننات",
    mode: "PAPER_PRACTICE",
    capacity: 4,
    status: "LOBBY",
    currentPhase: "READING_SOLVING",
    timeRemainingSeconds: 1200,
    durationMinutes: 20,
    createdAt: new Date(Date.now() - 100000).toISOString(),
    seats: [
      {
        seatIndex: 0,
        studentId: "user-walid",
        studentName: "وليد الجزائري",
        avatar: "⚙️",
        stream: "technique_math",
        status: "READY",
        statusPill: "بانتظار الزملاء ⏳",
        timerSeconds: 0,
        joinedAt: new Date(Date.now() - 100000).toISOString(),
      },
      null,
      null,
      null,
    ],
    activeMaterial: {
      problemSheet: {
        title: "حساب نسبة النقل الإجمالية وسرعة الدوران في مخفض سرعة ذو مسننات أسطوانية",
        source: "تمرين منهجي في الهندسة الميكانيكية",
        problemText: `يتكون مخفض سرعة من مرحلتين مسننات أسطوانية ذات أسنان مستقيمة:
المرحلة الأولى: $Z_1 = 20$ سن، $Z_2 = 60$ سن.
المرحلة الثانية: $Z_3 = 25$ سن، $Z_4 = 100$ سن.
سرعة دوران محرك الدخول $N_e = 1500\\text{ tr/min}$.
1. احسب نسبة النقل لكل مرحلة $r_1$ و $r_2$.
2. احسب نسبة النقل الإجمالية $r_g$.
3. استنتج سرعة دوران عمود الخروج $N_s$.`,
        solutionText: `1. $r_1 = Z_1 / Z_2 = 20 / 60 = 1/3$.
$r_2 = Z_3 / Z_4 = 25 / 100 = 1/4$.
2. نسبة النقل الإجمالية: $r_g = r_1 \\times r_2 = (1/3) \\times (1/4) = 1/12$.
3. سرعة عمود الخروج: $N_s = r_g \\times N_e = (1/12) \\times 1500 = 125\\text{ tr/min}$.`,
        rubric: [
          { criterion: "حساب نسبتي النقل للمرحلتين بالقانون الصحيح", points: 1.0 },
          { criterion: "حساب النسبة الإجمالية كحاصل ضرب النسب", points: 1.0 },
          { criterion: "حساب سرعة عمود الخروج مع الوحدة tr/min", points: 1.0 },
        ],
        totalPoints: 3,
      },
    },
  },
];

export const CampusService = {
  // ---------------------------------------------------------------------------
  // 1. KNOWLEDGE BANK / POSTS
  // ---------------------------------------------------------------------------
  getPosts(): CampusPost[] {
    if (typeof window === "undefined") return SEED_POSTS;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.POSTS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(SEED_POSTS));
        return SEED_POSTS;
      }
      return JSON.parse(raw);
    } catch {
      return SEED_POSTS;
    }
  },

  savePosts(posts: CampusPost[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
    } catch (e) {
      console.warn("Failed to persist campus posts:", e);
    }
  },

  async fetchRemotePosts(filters?: {
    stream?: string;
    subject?: string;
    type?: string;
    search?: string;
  }): Promise<CampusPost[]> {
    if (typeof window === "undefined") return this.getPosts();
    try {
      const query = new URLSearchParams();
      if (filters?.stream && filters.stream !== "ALL") query.set("stream", filters.stream);
      if (filters?.subject && filters.subject !== "ALL") query.set("subject", filters.subject);
      if (filters?.type && filters.type !== "ALL") query.set("type", filters.type);
      if (filters?.search) query.set("search", filters.search);

      const res = await fetch(`/api/campus/posts?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.posts) && data.posts.length > 0) {
          const local = this.getPosts();
          const remoteIds = new Set(data.posts.map((p: CampusPost) => p.id));
          // Preserve local drafts or offline posts
          const localOnly = local.filter((p) => !remoteIds.has(p.id) && !p.id.startsWith("post-"));
          const merged = [...data.posts, ...localOnly];
          this.savePosts(merged);
          return merged;
        }
      }
      return this.getPosts();
    } catch (err) {
      console.warn("fetchRemotePosts error, falling back to local storage:", err);
      return this.getPosts();
    }
  },

  createPost(post: Omit<CampusPost, "id" | "likesCount" | "bookmarksCount" | "createdAt">): CampusPost {
    const all = this.getPosts();
    const newPostId = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newPost: CampusPost = {
      ...post,
      id: newPostId,
      likesCount: 0,
      bookmarksCount: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [newPost, ...all];
    this.savePosts(updated);

    // Asynchronously persist to server/Supabase
    if (typeof window !== "undefined") {
      fetch("/api/campus/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: post.type,
          title: post.title,
          content: post.content,
          stream: post.stream,
          subjectId: post.subjectId,
          lesson: post.lesson,
          tags: post.tags || [],
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            if (data.post && data.post.id) {
              const current = this.getPosts().map((p) =>
                p.id === newPostId ? { ...data.post, isBookmarked: false } : p
              );
              this.savePosts(current);
            }
          }
        })
        .catch((e) => console.warn("Campus post background sync warning:", e));
    }

    return newPost;
  },

  toggleLikePost(postId: string): { likesCount: number; isLiked: boolean } {
    if (typeof window === "undefined") return { likesCount: 0, isLiked: false };
    try {
      const likesRaw = localStorage.getItem(STORAGE_KEYS.LIKES) || "[]";
      const likedIds: string[] = JSON.parse(likesRaw);
      const isCurrentlyLiked = likedIds.includes(postId);
      const newLikedIds = isCurrentlyLiked
        ? likedIds.filter((id) => id !== postId)
        : [...likedIds, postId];
      localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(newLikedIds));

      const posts = this.getPosts();
      let updatedLikes = 0;
      const updated = posts.map((p) => {
        if (p.id === postId) {
          updatedLikes = isCurrentlyLiked ? Math.max(0, p.likesCount - 1) : p.likesCount + 1;
          return { ...p, likesCount: updatedLikes, isLiked: !isCurrentlyLiked };
        }
        return p;
      });
      this.savePosts(updated);
      return { likesCount: updatedLikes, isLiked: !isCurrentlyLiked };
    } catch {
      return { likesCount: 0, isLiked: false };
    }
  },

  // ---------------------------------------------------------------------------
  // 2. BAG / BOOKMARKING TO PERSONAL PLANNER
  // ---------------------------------------------------------------------------
  getBagItems(userId: string): CampusBagItem[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(`${STORAGE_KEYS.BAG}_${userId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  async bookmarkPostToPlanner(userId: string, post: CampusPost): Promise<{ success: boolean; isBookmarked: boolean }> {
    if (typeof window === "undefined") return { success: false, isBookmarked: false };
    try {
      const currentBag = this.getBagItems(userId);
      const existing = currentBag.find((item) => item.postId === post.id);

      if (existing) {
        // Remove from bag
        const updatedBag = currentBag.filter((item) => item.postId !== post.id);
        localStorage.setItem(`${STORAGE_KEYS.BAG}_${userId}`, JSON.stringify(updatedBag));

        // Decrement post bookmarksCount
        const posts = this.getPosts();
        this.savePosts(
          posts.map((p) => (p.id === post.id ? { ...p, bookmarksCount: Math.max(0, p.bookmarksCount - 1), isBookmarked: false } : p))
        );
        return { success: true, isBookmarked: false };
      }

      // Add to bag
      const newBagItem: CampusBagItem = {
        id: `bag-${Date.now()}`,
        userId,
        postId: post.id,
        title: post.title,
        type: post.type,
        stream: post.stream,
        subjectId: post.subjectId,
        lesson: post.lesson,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(`${STORAGE_KEYS.BAG}_${userId}`, JSON.stringify([newBagItem, ...currentBag]));

      // Increment post bookmarksCount
      const posts = this.getPosts();
      this.savePosts(
        posts.map((p) => (p.id === post.id ? { ...p, bookmarksCount: p.bookmarksCount + 1, isBookmarked: true } : p))
      );

      // PUSH DIRECTLY TO STUDENT'S DAILY PLANNER AS A STUDY EVENT
      const today = getTodayDateString();
      const now = new Date().toISOString();
      await PlannerStorage.saveEvent({
        id: `event-bag-${post.id}-${Date.now()}`,
        userId,
        user_id: userId,
        title: `مراجعة: ${post.title}`,
        type: "STUDY",
        event_type: "study",
        date: today,
        startTime: "19:00",
        start_time: "19:00",
        durationMinutes: 30,
        duration_minutes: 30,
        subjectId: post.subjectId !== "ALL" ? post.subjectId : "general",
        subject_id: post.subjectId !== "ALL" ? post.subjectId : "general",
        priority: "MEDIUM",
        status: "TODO",
        notes: `عنصر محفوظ من بنك تجارب مجالس العلم: ${post.lesson}\n${post.title}`,
        description: `عنصر محفوظ من بنك تجارب مجالس العلم: ${post.lesson}\n${post.title}`,
        source: "CAMPUS_BOOKMARK",
        createdAt: now,
        created_at: now,
        updatedAt: now,
        updated_at: now,
      });

      // Dispatch UI update
      window.dispatchEvent(new CustomEvent("must-win-updated"));
      window.dispatchEvent(new CustomEvent("planner-events-changed"));

      // Asynchronously sync with Supabase backend
      if (typeof window !== "undefined") {
        fetch(`/api/campus/posts/${encodeURIComponent(post.id)}/bookmark`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, isBookmarked: true }),
        }).catch((e) => console.warn("Background bookmark sync warning:", e));
      }

      return { success: true, isBookmarked: true };
    } catch (err) {
      console.error("Failed to bookmark post to planner:", err);
      return { success: false, isBookmarked: false };
    }
  },

  // ---------------------------------------------------------------------------
  // 3. MAJLIS TABLES MANAGEMENT
  // ---------------------------------------------------------------------------
  getTables(): MajlisTable[] {
    if (typeof window === "undefined") return SEED_TABLES;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TABLES);
      if (!raw) {
        localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(SEED_TABLES));
        return SEED_TABLES;
      }
      return JSON.parse(raw);
    } catch {
      return SEED_TABLES;
    }
  },

  saveTables(tables: MajlisTable[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEYS.TABLES, JSON.stringify(tables));
    } catch (e) {
      console.warn("Failed to persist campus tables:", e);
    }
  },

  async fetchRemoteTables(filters?: {
    stream?: string;
    mode?: string;
  }): Promise<MajlisTable[]> {
    if (typeof window === "undefined") return this.getTables();
    try {
      const query = new URLSearchParams();
      if (filters?.stream && filters.stream !== "ALL") query.set("stream", filters.stream);
      if (filters?.mode && filters.mode !== "ALL") query.set("mode", filters.mode);

      const res = await fetch(`/api/campus/tables?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.tables) && data.tables.length > 0) {
          this.saveTables(data.tables);
          return data.tables;
        }
      }
      return this.getTables();
    } catch (err) {
      console.warn("fetchRemoteTables error, falling back to local storage:", err);
      return this.getTables();
    }
  },

  getTableById(tableId: string): MajlisTable | null {
    const tables = this.getTables();
    return tables.find((t) => t.id === tableId) || null;
  },

  createTable(params: {
    title: string;
    stream: StreamId;
    subjectId: SubjectId;
    lesson: string;
    mode: MajlisActivityMode;
    capacity: number;
    creatorId: string;
    creatorName: string;
    creatorAvatar?: string;
  }): MajlisTable {
    const all = this.getTables();
    const capacity = Math.min(8, Math.max(2, params.capacity));
    const seats: (MajlisSeat | null)[] = Array(capacity).fill(null);

    // Creator occupies seat 0
    seats[0] = {
      seatIndex: 0,
      studentId: params.creatorId,
      studentName: params.creatorName,
      avatar: params.creatorAvatar || "👨‍🎓",
      stream: params.stream,
      status: "READY",
      statusPill: "بانتظار الزملاء ⏳",
      timerSeconds: 0,
      joinedAt: new Date().toISOString(),
    };

    // Build default initial material based on mode
    let initialMaterial = {};
    if (params.mode === "PAPER_PRACTICE") {
      initialMaterial = {
        problemSheet: {
          title: `تمرين تطبيقي مكثف في درس: ${params.lesson}`,
          source: "بكالوريا تجريبية مقترحة مع سلم التنقيط الوزاري",
          problemText: `مسألة نموذجية في مادة ${params.subjectId}: حل المطلوب على كراسك بدقة مع كتابة القوانين الحرفية.\nالمطلوب:\n1. تحليل المعطيات وتحديد الشروط الابتدائية.\n2. إثبات العلاقة النظرية وكتابة النتيجة بالوحدات الدولية.`,
          solutionText: `الحل النموذجي المعتمد:\n- الخطوة 1: الشروط الابتدائية واضحة.\n- الخطوة 2: تطبيق القانون وإيجاد النتيجة النهائية مع سلم التنقيط المرفق.`,
          rubric: [
            { criterion: "كتابة القانون الحرفي وتحديد الشروط", points: 1.0 },
            { criterion: "التعويض العددي المباشر مع احترام الوحدات", points: 1.0 },
            { criterion: "صياغة الاستنتاج العلمي النهائي", points: 1.0 },
          ],
          totalPoints: 3,
        },
      };
    } else if (params.mode === "DIGITAL_QUIZ") {
      initialMaterial = {
        currentQuestionIndex: 0,
        quizQuestions: [
          {
            id: `q-${Date.now()}-1`,
            question: `سؤال التحقق الفوري في درس: ${params.lesson}`,
            options: [
              "الخيار الأول (الصحيح وفق المنهاج الوزاري)",
              "الخيار الثاني (فخ نمطي شائع)",
              "الخيار الثالث (خطأ في الإشارة أو الوحدات)",
              "الخيار الرابع (مفهوم غير مكتمل)",
            ],
            correctAnswer: 0,
            explanation: "الخيار الأول هو الصحيح وفق المعايير الرسمية لسلم التصحيح الوزاري.",
            points: 10,
          },
        ],
      };
    } else {
      initialMaterial = {
        memorizationContent: {
          title: `حزمة الاسترجاع المركز: ${params.lesson}`,
          category: "definitions",
          originalItems: [
            {
              term: `المفهوم الرئيسي لدرس ${params.lesson}`,
              definition: "التعريف الرسمي الشامل المعتمد في المنهاج الوزاري الجزائري.",
              keyKeywords: ["التعريف", "المنهاج", "المعايير"],
            },
          ],
          recallQuestions: [
            {
              prompt: `اذكر العناصر الثلاثة الأساسية في مفهوم: ${params.lesson}`,
              expectedAnswer: "العنصر الأول، العنصر الثاني، والعنصر الثالث.",
              keyKeywords: ["الأول", "الثاني"],
            },
          ],
        },
      };
    }

    const newTable: MajlisTable = {
      id: `table-${Date.now()}`,
      title: params.title,
      creatorId: params.creatorId,
      creatorName: params.creatorName,
      stream: params.stream,
      subjectId: params.subjectId,
      lesson: params.lesson,
      mode: params.mode,
      capacity,
      seats,
      status: "ACTIVE",
      currentPhase:
        params.mode === "PAPER_PRACTICE"
          ? "READING_SOLVING"
          : params.mode === "DIGITAL_QUIZ"
          ? "QUESTION_ACTIVE"
          : "MEMORIZING",
      timeRemainingSeconds: 15 * 60,
      durationMinutes: 15,
      activeMaterial: initialMaterial,
      createdAt: new Date().toISOString(),
    };

    const updated = [newTable, ...all];
    this.saveTables(updated);

    // Asynchronously persist to server/Supabase
    if (typeof window !== "undefined") {
      fetch("/api/campus/tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: params.title,
          stream: params.stream,
          subjectId: params.subjectId,
          lesson: params.lesson,
          mode: params.mode,
          capacity,
        }),
      }).catch((e) => console.warn("Background table creation sync warning:", e));
    }

    return newTable;
  },

  joinTableSeat(
    tableId: string,
    seatIndex: number,
    student: { id: string; name: string; avatar: string; stream: StreamId }
  ): { success: boolean; reason?: string; table?: MajlisTable } {
    const table = this.getTableById(tableId);
    if (!table) return { success: false, reason: "الطاولة غير موجودة" };

    // STRICT STREAM RULE: Student must match the table stream!
    if (student.stream !== table.stream) {
      return {
        success: false,
        reason: `هذه الطاولة مخصصة لطلاب شعبة (${table.stream}) فقط. يمكنك المشاهدة فقط أو دعوة زميل من هذه الشعبة!`,
      };
    }

    if (seatIndex < 0 || seatIndex >= table.capacity) {
      return { success: false, reason: "رقم المقعد غير صالح" };
    }

    // Check if seat is occupied
    if (table.seats[seatIndex] !== null && table.seats[seatIndex]?.studentId !== student.id) {
      return { success: false, reason: "المقعد محجوز بالفعل" };
    }

    // Remove student from any other seat in this table
    const cleanedSeats = table.seats.map((s) => (s?.studentId === student.id ? null : s));

    const defaultPill =
      table.mode === "PAPER_PRACTICE"
        ? "يحل الآن ✍️"
        : table.mode === "DIGITAL_QUIZ"
        ? "جاهز للتحدي ⚡"
        : "يحفظ 🧠";

    cleanedSeats[seatIndex] = {
      seatIndex,
      studentId: student.id,
      studentName: student.name,
      avatar: student.avatar || "👨‍🎓",
      stream: student.stream,
      status: "SOLVING",
      statusPill: defaultPill,
      timerSeconds: 0,
      joinedAt: new Date().toISOString(),
    };

    const updatedTable: MajlisTable = { ...table, seats: cleanedSeats };
    const all = this.getTables().map((t) => (t.id === tableId ? updatedTable : t));
    this.saveTables(all);

    // Asynchronously persist to server/Supabase
    if (typeof window !== "undefined") {
      fetch(`/api/campus/tables/${encodeURIComponent(tableId)}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seatIndex,
          student,
        }),
      }).catch((e) => console.warn("Background join seat sync warning:", e));
    }

    return { success: true, table: updatedTable };
  },

  leaveTableSeat(tableId: string, studentId: string): MajlisTable | null {
    const table = this.getTableById(tableId);
    if (!table) return null;

    const cleanedSeats = table.seats.map((s) => (s?.studentId === studentId ? null : s));
    const updatedTable: MajlisTable = { ...table, seats: cleanedSeats };
    const all = this.getTables().map((t) => (t.id === tableId ? updatedTable : t));
    this.saveTables(all);
    return updatedTable;
  },

  updateSeatStatus(
    tableId: string,
    studentId: string,
    status: "SOLVING" | "FINISHED" | "MEMORIZING" | "READY",
    statusPill: string,
    selfAssessment?: "CORRECT" | "PARTIAL" | "INCORRECT"
  ): MajlisTable | null {
    const table = this.getTableById(tableId);
    if (!table) return null;

    const updatedSeats = table.seats.map((s) => {
      if (s?.studentId === studentId) {
        return {
          ...s,
          status,
          statusPill,
          selfAssessment: selfAssessment !== undefined ? selfAssessment : s.selfAssessment,
        };
      }
      return s;
    });

    const updatedTable: MajlisTable = { ...table, seats: updatedSeats };
    const all = this.getTables().map((t) => (t.id === tableId ? updatedTable : t));
    this.saveTables(all);
    return updatedTable;
  },

  updateTablePhase(tableId: string, newPhase: TablePhase): MajlisTable | null {
    const table = this.getTableById(tableId);
    if (!table) return null;

    const updatedTable: MajlisTable = { ...table, currentPhase: newPhase };
    const all = this.getTables().map((t) => (t.id === tableId ? updatedTable : t));
    this.saveTables(all);
    return updatedTable;
  },

  // ---------------------------------------------------------------------------
  // 4. CRITICAL INTEGRATION: RECORD MISTAKE TO ERROR VAULT & PLANNER
  // ---------------------------------------------------------------------------
  async recordMistakeToErrorVault(
    userId: string,
    params: {
      questionId: string;
      questionText: string;
      chosenAnswerText: string;
      correctAnswerText: string;
      explanation: string;
      subjectId: SubjectId;
      topicTitle: string;
    }
  ): Promise<{ errorId: string }> {
    const errorId = `err-majlis-${Date.now()}`;
    const now = new Date().toISOString();

    // 1. Create Error Record in Error Lab Storage
    const errorRecord: ErrorRecord = {
      id: errorId,
      studentId: userId,
      sessionId: "majlis-session",
      missionId: "majlis-challenge",
      subjectId: params.subjectId,
      skillId: params.topicTitle || "majlis-interactive",
      questionId: params.questionId,
      selectedAnswer: params.chosenAnswerText,
      correctAnswer: params.correctAnswerText,
      suspectedErrorType: "misunderstood_concept",
      errorSource: "student_selected",
      confidence: 3,
      repairStatus: "identified",
      isRecurring: false,
      attemptCount: 1,
      createdAt: now,
      updatedAt: now,
    };

    saveErrorRecord(errorRecord);

    // 2. Schedule Spaced Review Task in Daily Planner
    const today = getTodayDateString();
    await PlannerStorage.saveEvent({
      id: `event-err-${errorId}`,
      userId,
      user_id: userId,
      title: `معمل الأخطاء: مراجعة خطأ "${params.topicTitle}" من مجلس العلم`,
      type: "REVISION",
      event_type: "revision",
      date: today,
      startTime: "20:00",
      start_time: "20:00",
      durationMinutes: 20,
      duration_minutes: 20,
      subjectId: params.subjectId,
      subject_id: params.subjectId,
      priority: "HIGH",
      status: "TODO",
      notes: `السؤال: ${params.questionText}\nإجابتك: ${params.chosenAnswerText}\nالتصحيح: ${params.correctAnswerText}\nالشرح: ${params.explanation}`,
      description: `السؤال: ${params.questionText}\nإجابتك: ${params.chosenAnswerText}\nالتصحيح: ${params.correctAnswerText}\nالشرح: ${params.explanation}`,
      source: "ERROR_NOTEBOOK",
      createdAt: now,
      created_at: now,
      updatedAt: now,
      updated_at: now,
    });

    // Notify UI
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("must-win-updated"));
      window.dispatchEvent(new CustomEvent("planner-events-changed"));
    }

    return { errorId };
  },
};
