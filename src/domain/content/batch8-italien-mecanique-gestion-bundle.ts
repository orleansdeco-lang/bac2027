/**
 * BAC 2026/2027 Production Learning Bundles
 * Stream: Langues Étrangères / Gestion & Économie / Technique Math (Batch 08)
 * Subjects: Italien, Gestion Comptable, Droit, Mathématiques Financières, Génie Mécanique
 * Destination: src/domain/content/batch8-italien-mecanique-gestion-bundle.ts
 */

export interface SkillLearningBundle {
  skillId: string;
  title_ar: string;
  subject: 'italien' | 'gestion_comptable' | 'droit' | 'mathematiques' | 'genie_mecanique';
  stream: string;
  unit: string;
  bloomLevel: 'apply' | 'analyze';
  theory: {
    summary: string;
    keyTakeaways: string[];
    commonPitfalls: string[];
  };
  practice: {
    question: string;
    options: Array<{ id: string; text: string; correct: boolean }>;
    stepByStepSolution: string[];
  };
  isomorphicRetest: {
    question: string;
    options: Array<{ id: string; text: string; correct: boolean }>;
    repairGuide: string;
  };
}

export const BATCH8_ITALIEN_MECANIQUE_GESTION_BUNDLE: Record<string, SkillLearningBundle> = {
  // 1. Italien: Passato prossimo vs Imperfetto
  "it_grammar_passato_imperfetto": {
    skillId: "it_grammar_passato_imperfetto",
    title_ar: "اللغة الإيطالية: الفروق الدلالية والتركيبية بين Passato Prossimo و Imperfetto في السرد",
    subject: "italien",
    stream: "langues_etrangeres",
    unit: "I tempi del passato nel testo narrativo",
    bloomLevel: "apply",
    theory: {
      summary: "يُستخدم زمن الماضي القريب (Passato prossimo) في اللغة الإيطالية للتعبير عن أحداث منتهية ومحددة زمنياً في الماضي تشكل العقدة السردية الأساسية (azioni puntuali e concluse)، بينما يُستخدم الماضي المستمر (Imperfetto) لوصف الحالات النفسية والجسدية، العادات المتكررة (azioni abituali)، أو وصف خلفية المشهد والطقس. عند تقاطع حدثين في الماضي، يوضع الحدث المستمر الطويل في زمن Imperfetto والحدث المفاجئ القاطع في زمن Passato prossimo.",
      keyTakeaways: [
        "Passato prossimo: أفعال منتهية في زمن محدد مع مؤشرات مثل: ieri, sabato scorso, improvvisamente, all'improvviso, a un tratto.",
        "Imperfetto: وصف، عادات، تكرار مع مؤشرات مثل: sempre, di solito, ogni estate, mentre, da bambino, quando avevo dieci anni.",
        "الحدث القاطع: Mentre studiavo (Imperfetto), è squillato il telefono (Passato prossimo).",
        "الأفعال الوصفية التي تأتي غالباً في Imperfetto: essere, avere, fare bel tempo, sentirsi."
      ],
      commonPitfalls: [
        "استعمال Passato prossimo بعد أداة التزامن 'Mentre'؛ القاعدة الإيطالية تفرض استعمال Imperfetto وجوباً مع Mentre للدلالة على الاستمرارية.",
        "نسيان مطابقة اسم المفعول (Participio passato) مع الفاعل عند استعمال الفعل المساعد 'essere' في Passato prossimo."
      ]
    },
    practice: {
      question: "اختر التصريف الصحيح للفعلين في الجملة الإيطالية التالية:\n« Mentre noi __________ (camminare) lungo la spiaggia, all'improvviso __________ (cominciare) a piovere fortissimo ».",
      options: [
        { id: "opt_a", text: "camminavamo / ha cominciato", correct: true },
        { id: "opt_b", text: "abbiamo camminato / cominciava", correct: false },
        { id: "opt_c", text: "camminavamo / cominciava", correct: false },
        { id: "opt_d", text: "abbiamo camminato / ha cominciato", correct: false }
      ],
      stepByStepSolution: [
        "1) بعد أداة التزامن 'Mentre' نعبر عن حدث مستمر في الماضي، إذن الفعل camminare يُصرف في زمن Imperfetto مع الضمير noi: camminavamo.",
        "2) العبارة 'all'improvviso' (فجأة) تشير إلى حدث طارئ ومفاجئ يقطع الحدث الأول، إذن الفعل cominciare يُصرف في زمن Passato prossimo: ha cominciato.",
        "3) الجملة الصحيحة: « Mentre noi camminavamo lungo la spiaggia, all'improvviso ha cominciato a piovere fortissimo »."
      ]
    },
    isomorphicRetest: {
      question: "أكمل الجملة التالية باختيار الصيغة الصحيحة:\n« Da piccolo, Marco __________ (andare) sempre al mare ogni domenica, ma un giorno __________ (vedere) un delfino vicino alla riva ».",
      options: [
        { id: "iso_a", text: "andava / ha visto", correct: true },
        { id: "iso_b", text: "è andato / vedeva", correct: false },
        { id: "iso_c", text: "andava / vedeva", correct: false },
        { id: "iso_d", text: "è andato / ha visto", correct: false }
      ],
      repairGuide: "المؤشر 'sempre ogni domenica' يدل على عادة وتكرار في الطفولة، فيُصرف الفعل في Imperfetto: andava. بينما المؤشر 'ma un giorno' يدل على حدث مفرد استثنائي وقع مرة واحدة في الماضي، فيُصرف في Passato prossimo: ha visto."
    }
  },

  // 2. Italien: Pronomi combinati e particella 'ne'
  "it_grammar_pronomi_combinati_ne": {
    skillId: "it_grammar_pronomi_combinati_ne",
    title_ar: "اللغة الإيطالية: الضمائر المزدوجة المدمجة وقواعد استعمال ومطابقة الجزئية 'ne'",
    subject: "italien",
    stream: "langues_etrangeres",
    unit: "I pronomi doppi e la concordanza del participio",
    bloomLevel: "apply",
    theory: {
      summary: "تتكون الضمائر المزدوجة (Pronomi combinati) من التقاء ضمير المفعول به غير المباشر (mi, ti, gli/le, ci, vi) مع ضمير المفعول به المباشر (lo, la, li, le) أو مع أداة التجزئة 'ne'. عند الالتقاء يتحول الحرف 'i' في الضمائر غير المباشرة إلى 'e' (me, te, ce, ve)، وتدمج ضمائر الغائب (gli + lo/la/li/le/ne = glielo, gliela, glieli, gliele, gliene). مع أزمنة المركب كـ Passato prossimo، يجب مطابقة اسم المفعول في الجنس والعدد مع الضمير المباشر أو مع الكمية المحددة بـ 'ne'.",
      keyTakeaways: [
        "جدول التحول: mi lo -> me lo، ti la -> te la، ci li -> ce li، vi le -> ve le.",
        "ضمير الغائب الموحد للمذكر والمؤنث: gli/le + lo/la/li/le/ne = glielo, gliela, glieli, gliele, gliene.",
        "وظائف 'ne': التعبير عن جزء من كمية محددة بعدد أو ظرف كمية (Quante pizze mangi? Ne mangio due).",
        "مطابقة اسم المفعول مع 'ne': Quante mele hai comprate? Ne ho comprate tre (comprate تتطابق مع tre mele في التأنيث والجمع)."
      ],
      commonPitfalls: [
        "نسيان كتابة 'glielo' ككلمة واحدة مدمجة وكتابتها منفصلة 'gli lo' (هذا خطأ إملائي وقواعدي فادح).",
        "إغفال مطابقة اسم المفعول مع الكمية المشار إليها بـ 'ne' في الماضي القريب."
      ]
    },
    practice: {
      question: "استبدل الكلمات بين قوسين بالضمير المزدوج المناسب مع إجراء المطابقة إن لزمت:\n« Hai prestato (a Maria) (la tua bicicletta)? - Sì, __________ ho prestata ieri ».",
      options: [
        { id: "opt_a", text: "gliela", correct: true },
        { id: "opt_b", text: "le la", correct: false },
        { id: "opt_c", text: "me la", correct: false },
        { id: "opt_d", text: "gliene", correct: false }
      ],
      stepByStepSolution: [
        "1) المفعول غير المباشر: 'a Maria' (مؤنث مفرد) ضميره le.",
        "2) المفعول المباشر: 'la tua bicicletta' (مؤنث مفرد) ضميره la.",
        "3) الدمج القاعدي: le + la يُصبح كلمة واحدة: gliela (تُستخدم glie للمذكر والمؤنث معاً).",
        "4) مع الفعل المساعد avere واسم المفعول: gliela ho prestata (prestata تطابقت مع la bicicletta في التأنيث المفرد).",
        "5) الإجابة الصحيحة: gliela."
      ]
    },
    isomorphicRetest: {
      question: "اختر الجملة التي تحتوي على الاستعمال والمطابقة الصحيحة لأداة التجزئة 'ne':",
      options: [
        { id: "iso_a", text: "Quanti libri hai letti durante le vacanze? - Ne ho letti quattro.", correct: true },
        { id: "iso_b", text: "Quanti libri hai letti durante le vacanze? - Ne ho letto quattro.", correct: false },
        { id: "iso_c", text: "Quanti libri hai letti durante le vacanze? - Li ho letti quattro libri.", correct: false },
        { id: "iso_d", text: "Quanti libri hai letti durante le vacanze? - Ci ho letto quattro.", correct: false }
      ],
      repairGuide: "أداة التجزئة 'ne' تعبر عن جزء من الكل يتبعه عدد (quattro)، وبما أن المعدود مذكر جمع (libri) فيجب وجوباً مطابقة اسم المفعول في الماضي القريب: Ne ho letti quattro."
    }
  },

  // 3. Gestion: حساب النتائج حسب الوظيفة
  "acc_income_statement_by_function": {
    skillId: "acc_income_statement_by_function",
    title_ar: "حساب النتائج حسب الوظيفة: كلفة المبيعات، هامش التكلفة الإجمالية، والنتيجة العملياتية",
    subject: "gestion_comptable",
    stream: "gestion_economie",
    unit: "الوحدة 08: حساب النتائج حسب الوظيفة",
    bloomLevel: "apply",
    theory: {
      summary: "يقوم جدول حساب النتائج حسب الوظيفة بإعادة تصنيف أعباء المؤسسة (المحسوبة حسب الطبيعة في الصنف 6) وتوزيعها حسب الوظائف الأساسية: وظيفة الشراء (التموين)، وظيفة الإنتاج، وظيفة التوزيع (التجارية)، والوظيفة الإدارية والمالية. يبدأ الجدول بتحديد هامش التكلفة الإجمالية = رقم الأعمال (حـ/ 70) - كلفة المبيعات، ثم يضاف إليه المنتوجات العملياتية الأخرى (75) وتطرح الأعباء التجارية والإدارية والأعباء العملياتية الأخرى (65) مع تسوية الاسترجاعات (78) والمخصصات (68) للوصول إلى النتيجة العملياتية.",
      keyTakeaways: [
        "كلفة المبيعات للمؤسسة الإنتاجية = تكلفة شراء المواد المستهلكة (601 ± 6031) + مصاريف الشراء + أعباء الإنتاج المباشرة وغير المباشرة ± التغير في المخزونات المنتجة (72).",
        "هامش التكلفة الإجمالية = رقم الأعمال (حـ/ 70) - كلفة المبيعات.",
        "النتيجة العملياتية = هامش التكلفة الإجمالية + المنتوجات العملياتية الأخرى (75) - التكاليف التجارية - الأعباء الإدارية - الأعباء العملياتية الأخرى (65) + الاسترجاعات عن خسائر القيمة (78) - مخصصات الاهتلاكات (68).",
        "النتيجة الصافية للسنة المالية = النتيجة العادية قبل الضريبة - الضرائب الواجب دفعها عن النتائج العادية (حـ/ 695)."
      ],
      commonPitfalls: [
        "الخلط بين إشارة حساب 72 (الإنتاج المخزن): إذا كان رصيد 72 دائناً يُطرح من كلفة المبيعات، وإذا كان رصيد 72 مديناً (سحب من المخزون) يُضاف إلى كلفة المبيعات.",
        "إدراج أعباء الوظيفة المالية ضمن كلفة المبيعات؛ الأعباء المالية (حـ/ 66) تدرج حصرياً في حساب النتيجة المالية المستقلة."
      ]
    },
    practice: {
      question: "مؤسسة إنتاجية حققت المعطيات التالية لدورة 2023:\n- رقم الأعمال (حـ/ 70): 3,000,000 دج\n- تكلفة المواد الأولية المستهلكة (601): 800,000 دج\n- مصاريف الإنتاج الأخرى: 400,000 دج\n- الإنتاج المخزن (حـ/ 72 دائن): 100,000 دج\n- التكاليف التجارية: 200,000 دج\n- الأعباء الإدارية: 300,000 دج\nكم تبلغ كلفة المبيعات وهامش التكلفة الإجمالية على التوالي؟",
      options: [
        { id: "opt_a", text: "كلفة المبيعات = 1,100,000 دج و هامش التكلفة الإجمالية = 1,900,000 دج", correct: true },
        { id: "opt_b", text: "كلفة المبيعات = 1,300,000 دج و هامش التكلفة الإجمالية = 1,700,000 دج", correct: false },
        { id: "opt_c", text: "كلفة المبيعات = 1,200,000 دج و هامش التكلفة الإجمالية = 1,800,000 دج", correct: false },
        { id: "opt_d", text: "كلفة المبيعات = 800,000 دج و هامش التكلفة الإجمالية = 2,200,000 دج", correct: false }
      ],
      stepByStepSolution: [
        "1) حساب كلفة المبيعات = تكلفة المواد المستهلكة (800,000) + مصاريف الإنتاج (400,000) - الإنتاج المخزن الدائن (100,000).",
        "2) كلفة المبيعات = 1,200,000 - 100,000 = 1,100,000 دج.",
        "3) هامش التكلفة الإجمالية = رقم الأعمال (حـ/ 70) - كلفة المبيعات.",
        "4) هامش التكلفة الإجمالية = 3,000,000 - 1,100,000 = 1,900,000 دج."
      ]
    },
    isomorphicRetest: {
      question: "بناءً على النتائج السابقة (هامش التكلفة الإجمالية = 1,900,000 دج، التكاليف التجارية = 200,000 دج، الأعباء الإدارية = 300,000 دج، وأعباء عملياتية أخرى = 50,000 دج)، كم تبلغ النتيجة العملياتية؟",
      options: [
        { id: "iso_a", text: "1,350,000 دج", correct: true },
        { id: "iso_b", text: "1,400,000 دج", correct: false },
        { id: "iso_c", text: "1,900,000 دج", correct: false },
        { id: "iso_d", text: "1,650,000 دج", correct: false }
      ],
      repairGuide: "النتيجة العملياتية = هامش التكلفة الإجمالية - التكاليف التجارية - الأعباء الإدارية - الأعباء العملياتية الأخرى = 1,900,000 - 200,000 - 300,000 - 50,000 = 1,350,000 دج."
    }
  },

  // 4. Droit: الشركة ذات المسؤولية المحدودة SARL
  "law_commercial_companies_sarl_spa": {
    skillId: "law_commercial_companies_sarl_spa",
    title_ar: "القانون التجاري: الشركة ذات المسؤولية المحدودة (SARL) وأحكامها بالمقارنة مع شركة المساهمة",
    subject: "droit",
    stream: "gestion_economie",
    unit: "المجال المفاهيمي 02: الشركات التجارية",
    bloomLevel: "apply",
    theory: {
      summary: "الشركة ذات المسؤولية المحدودة (SARL) هي شركة تجارية مختلطة تجمع بين خصائص شركات الأشخاص (الاعتبار الشخصي المحدود) وشركات الأموال (تحديد مسؤولية الشريك). تتأسس من شريك واحد (وتسمى حينئذ مؤسسة ذات شخص وحيد وذات مسؤولية محدودة EURL) إلى 50 شريكاً كحد أقصى. ينقسم رأسمالها إلى حصص اسمية متساوية غير قابلة للتداول التجاري بالطرق التجارية ولا يجوز بيعها للغير إلا بموافقة أغلبية الشركاء الممثلة لثلاثة أرباع رأس المال على الأقل.",
      keyTakeaways: [
        "عدد الشركاء: من شريك واحد (EURL) إلى 50 شريكاً كحد أقصى (إذا تجاوزت 50 وجب تحويلها إلى شركة مساهمة خلال سنتين وإلا حُلّت).",
        "طبيعة الحصص: حصص نقدية أو عينية ولا يجوز تقديم حصص بالعمل، وهي غير قابلة للتداول بالبورصة.",
        "التنازل عن الحصص: حر بين الشركاء والأزواج والأصول والفروع، لكنه مشروط برضى أغلبية الشركاء الحائزين على ثلاثة أرباع رأس المال (3/4) إذا كان التنازل لشخص أجنبي عن الشركة.",
        "المسؤولية المالية: محددة بمقدار الحصص المقدمة فقط، ولا يكتسب الشريك فيها صفة التاجر."
      ],
      commonPitfalls: [
        "الاعتقاد بأن حصص شركة SARL قابلة للتداول مثل أسهم شركة SPA؛ حصص SARL لا تصدر في شكل أوراق مالية قابلة للتداول بل تُنقل بموجب عقود رسمية مقيدة بسجل الشركة.",
        "نسيان شرط موافقة الشركاء (3/4 رأس المال) عند رغبة شريك في التنازل عن حصصه لشخص أجنبي عن الشركة."
      ]
    },
    practice: {
      question: "يرغب شريك يملك 20% من حصص شركة ذات مسؤولية محدودة (SARL) في بيع حصصه والتنازل عنها لصديق له من خارج الشركة. ما هو الشرط القانوني الجوهري لصحة هذا التنازل وفق القانون التجاري الجزائري؟",
      options: [
        { id: "opt_a", text: "الحصول على موافقة أغلبية الشركاء الذين يمثلون ثلاثة أرباع رأس مال الشركة على الأقل بعقد رسمي", correct: true },
        { id: "opt_b", text: "الحصول على موافقة رئيس المحكمة التجارية دون الحاجة لاستشارة بقية الشركاء", correct: false },
        { id: "opt_c", text: "التنازل حر ومطلق ولا يحق لبقية الشركاء الاعتراض إطلاقاً", correct: false },
        { id: "opt_d", text: "تحويل الشركة وجوباً إلى شركة تضامن قبل إتمام عقد البيع", correct: false }
      ],
      stepByStepSolution: [
        "1) تنص المادة 567 من القانون التجاري الجزائري على أن حصص الشركة ذات المسؤولية المحدودة لا يمكن التنازل عنها لأشخاص أجانب عن الشركة إلا برضى أغلبية الشركاء.",
        "2) تشترط المادة أن تمثل هذه الأغلبية ما لا يقل عن ثلاثة أرباع (3/4) رأسمال الشركة.",
        "3) هذا الإجراء يحمي الاعتبار الشخصي وشركاء التأسيس من دخول أطراف غير مرغوب فيهم.",
        "4) يجب إفراغ التنازل في عقد رسمي توثيقي وشهر التعديل بالسجل التجاري."
      ]
    },
    isomorphicRetest: {
      question: "إذا وصل عدد الشركاء في شركة ذات مسؤولية محدودة إلى 55 شريكاً نتيجة انتقال الحصص لورثة شرعيين، فما هو الأثر والمهلة القانونية الممنوحة لتسوية الوضعية؟",
      options: [
        { id: "iso_a", text: "يجب تحويلها إلى شركة مساهمة (SPA) خلال مهلة سنتين، وإلا حُلّت بحكم القانون", correct: true },
        { id: "iso_b", text: "تُنحل الشركة فوراً وتسحب سجلها التجاري بعد شهر واحد", correct: false },
        { id: "iso_c", text: "تستمر كشركة ذات مسؤولية محدودة بدون أي قيد زمني لأن الزيادة ناتجة عن الإرث", correct: false },
        { id: "iso_d", text: "تتحول تلقائياً إلى شركة تضامن غير محددة المسؤولية", correct: false }
      ],
      repairGuide: "المادة 590 من القانون التجاري تحدد الحد الأقصى لشركاء SARL بـ 50 شريكاً؛ فإذا زاد العدد عن ذلك، مُنحت الشركة مهلة سنتين لتحويلها إلى شركة مساهمة SPA أو تخفيض عدد الشركاء، وإلا اعتُبرت منحلة بقوة القانون."
    }
  },

  // 5. Mathématiques Financières: جدول استهلاك القرض
  "math_fin_loan_amortization_constant_payments": {
    skillId: "math_fin_loan_amortization_constant_payments",
    title_ar: "الرياضيات المالية: جدول استهلاك القرض العادي ذي الدفعات السنوية الثابتة والعلاقات بين الأسطر",
    subject: "mathematiques",
    stream: "gestion_economie",
    unit: "المجال المفاهيمي 04: اختيار المشاريع والاستثمارات",
    bloomLevel: "apply",
    theory: {
      summary: "استهلاك القروض العادية بواسطة دفعات متساوية وثابتة يمثل التطبيق الرياضي المالي الأوسع في البكالوريا. يتضمن جدول الاستهلاك أعمدة: أصل الدين في بداية المدة V_p-1، الفائدة I_p = V_p-1 · i، الاستهلاك A_p، الدفعة الثابتة a = A_p + I_p، وأصل الدين في نهاية المدة V_p = V_p-1 - A_p. تمتاز الاستهلاكات بكونها متتالية هندسية أساسها (1 + i)، مما يتيح حساب معدل الفائدة واستنتاج كافة عناصر الجدول من سطرين مختلفين.",
      keyTakeaways: [
        "العلاقة بين استهلاكين متباعدين: A_p = A_k · (1 + i)^(p - k).",
        "الفرق بين استهلاكين متتاليين: A_p+1 - A_p = A_p · i.",
        "أصل القرض بدلالة الاستهلاك الأول: V₀ = A₁ · [(1 + i)^n - 1] / i.",
        "الدفعة السنوية الثابتة: a = V₀ · i / [1 - (1 + i)^(-n)] = A_p + I_p."
      ],
      commonPitfalls: [
        "الخلط بين رمز الدفعة a (الثابتة) ورمز الاستهلاك A_p (المتزايد هندسياً).",
        "الخطأ في حساب الأس عند تطبيق علاقة الاستهلاكات المتباعدة: التأكد من أن الأس هو (p - k)."
      ]
    },
    practice: {
      question: "قرض عادي يُسدد بواسطة دفعات سنوية ثابتة. إذا علمت أن الاستهلاك الأول A₁ = 80,000 دج والاستهلاك الثالث A₃ = 96,800 دج، فما هو معدل الفائدة السنوي المركب i لهذا القرض؟",
      options: [
        { id: "opt_a", text: "i = 10% (0.10)", correct: true },
        { id: "opt_b", text: "i = 8% (0.08)", correct: false },
        { id: "opt_c", text: "i = 12% (0.12)", correct: false },
        { id: "opt_d", text: "i = 9.5%", correct: false }
      ],
      stepByStepSolution: [
        "1) العلاقة بين الاستهلاك الثالث والأول: A₃ = A₁ · (1 + i)².",
        "2) بالتعويض العددي: 96,800 = 80,000 · (1 + i)².",
        "3) حساب (1 + i)²: (1 + i)² = 96,800 / 80,000 = 1.21.",
        "4) حساب (1 + i): 1 + i = √1.21 = 1.10.",
        "5) استنتاج معدل الفائدة: i = 1.10 - 1 = 0.10 أي 10%."
      ]
    },
    isomorphicRetest: {
      question: "بناءً على معطيات القرض السابق (A₁ = 80,000 دج و i = 10%)، إذا كان القرض يُسدد على 5 دفعات سنوية ثابتة، فما هي قيمة الدفعة السنوية الثابتة a؟",
      options: [
        { id: "iso_a", text: "a = 128,840.80 دج (أو a = A₁ · (1 + i)⁵ = 80,000 × (1.10)⁵ = 128,840.8 دج)", correct: true },
        { id: "iso_b", text: "a = 88,000 دج", correct: false },
        { id: "iso_c", text: "a = 150,000 دج", correct: false },
        { id: "iso_d", text: "a = 96,800 دج", correct: false }
      ],
      repairGuide: "نعلم أن الاستهلاك الأخير هو A_n = A_1 · (1 + i)^(n - 1) وأن الفائدة الأخيرة هي I_n = A_n · i، وبالتالي فإن الدفعة تساوي: a = A_n + I_n = A_n(1 + i) = A_1 · (1 + i)^n = 80,000 × (1.10)⁵ = 80,000 × 1.61051 = 128,840.80 دج."
    }
  },

  // 6. Génie Mécanique: نقل الحركة بالمسننات المستقيمة
  "tm_meca_spur_gears_kinematics": {
    skillId: "tm_meca_spur_gears_kinematics",
    title_ar: "الهندسة الميكانيكية: نقل الحركة بالمسننات الأسطوانية ذات الأسنان المستقيمة والنسبة الحركية",
    subject: "genie_mecanique",
    stream: "technique_mathematiques",
    unit: "آليات نقل وتحويل الحركة",
    bloomLevel: "apply",
    theory: {
      summary: "تُستخدم المسننات الأسطوانية ذات الأسنان المستقيمة (Engrenages cylindriques à denture droite) لنقل الحركة الدائرية بين محورين متوازيين بدقة وكفاءة عالية دون انزلاق. ترتكز الحسابات الحركية والهندسية على الموديول القياسي m، عدد الأسنان Z، قطر دائرة التسنن الابتدائية d = m · Z، والتباعد المحوري بين المحورين a = (d1 + d2) / 2 = m(Z1 + Z2) / 2. تُحدد النسبة الحركية (Rapport de transmission) r بالعلاقة: r = N_sortie / N_entrée = Z_menante / Z_menée، وبإهمال ضياع الاستطاعة يكون عزم الدوران متناسباً عكساً مع سرعة الدوران C_sortie = C_entrée / r.",
      keyTakeaways: [
        "القطر الابتدائي: d = m · Z، وقطر الرأس: d_a = d + 2m، وقطر القاع: d_f = d - 2.5m.",
        "التباعد المحوري (Entraxe) في التسنن الخارجي: a = m(Z1 + Z2) / 2.",
        "نسبة نقل الحركة r: r = N2 / N1 = ω2 / ω1 = Z1 / Z2 = d1 / d2.",
        "إذا كان r < 1 يكون المسنن مخفضاً للسرعة ومضاعفاً لعزم الدوران (C2 > C1)؛ وإذا كان r > 1 يكون مضاعفاً للسرعة ومخفضاً للعزم."
      ],
      commonPitfalls: [
        "الخلط بين المسنن القائد (menant) والمسنن المقاد (mené) عند كتابة كسر نسبة النقل r = Z_menant / Z_mené = N_mené / N_menant.",
        "استعمال قطر الرأس d_a بدلاً من القطر الابتدائي d عند حساب نسبة النقل الحركي أو التباعد المحوري."
      ]
    },
    practice: {
      question: "يدور مسنن قائد (1) بعدد أسنان Z₁ = 20 وموديول m = 2 mm بسرعة دوران N₁ = 1500 tr/min. يعشق مع مسنن مقاد (2) ذي قطر ابتدائي d₂ = 120 mm. ما هو عدد أسنان المسنن المقاد Z₂، التباعد المحوري a، وسرعة دوران عمود الخروج N₂؟",
      options: [
        { id: "opt_a", text: "Z₂ = 60 سناً، a = 80 mm، و N₂ = 500 tr/min", correct: true },
        { id: "opt_b", text: "Z₂ = 40 سناً، a = 60 mm، و N₂ = 750 tr/min", correct: false },
        { id: "opt_c", text: "Z₂ = 60 سناً، a = 160 mm، و N₂ = 4500 tr/min", correct: false },
        { id: "opt_d", text: "Z₂ = 30 سناً، a = 100 mm، و N₂ = 1000 tr/min", correct: false }
      ],
      stepByStepSolution: [
        "1) حساب Z₂: d₂ = m · Z₂ => Z₂ = d₂ / m = 120 / 2 = 60 سناً.",
        "2) حساب القطر الابتدائي للمسنن (1): d₁ = m · Z₁ = 2 × 20 = 40 mm.",
        "3) حساب التباعد المحوري a: a = (d₁ + d₂) / 2 = (40 + 120) / 2 = 160 / 2 = 80 mm.",
        "4) نسبة نقل الحركة: r = Z₁ / Z₂ = 20 / 60 = 1/3.",
        "5) سرعة دوران عمود الخروج: N₂ = N₁ · r = 1500 × (1/3) = 500 tr/min."
      ]
    },
    isomorphicRetest: {
      question: "في جهاز تخفيض سرعة بمردود ميكانيكي تام (η = 1)، إذا كانت استطاعة المحرك P = 1.5 kW وسرعة عمود الدخول N₁ = 1500 tr/min، وسرعة عمود الخروج المخفضة N₂ = 300 tr/min (نسبة التخفيض r = 1/5). ما هي قيمة عزم الدوران على عمود الخروج C₂ بالمقارنة مع عزم الدخول C₁؟",
      options: [
        { id: "iso_a", text: "عزم الخروج C₂ يتضاعف 5 مرات مقارنة بعزم الدخول (C₂ = 5 · C₁)", correct: true },
        { id: "iso_b", text: "عزم الخروج C₂ ينخفض إلى الخُمس (C₂ = C₁ / 5)", correct: false },
        { id: "iso_c", text: "عزم الخروج يبقى ثابتاً ومساوياً لعزم الدخول", correct: false },
        { id: "iso_d", text: "عزم الخروج يساوي الصفر لأن السرعة منخفضة", correct: false }
      ],
      repairGuide: "في أنظمة نقل الحركة دون ضياع: الاستطاعة محفوظة P₁ = P₂ => C₁ · ω₁ = C₂ · ω₂ => C₂ / C₁ = ω₁ / ω₂ = N₁ / N₂ = 1 / r = 1500 / 300 = 5. وبالتالي فإن تخفيض السرعة بمقدار 5 أضعاف يضاعف عزم الدوران 5 مرات."
    }
  }
};

export function getBatch8LearningBundle(skillId: string): SkillLearningBundle | null {
  return BATCH8_ITALIEN_MECANIQUE_GESTION_BUNDLE[skillId] || null;
}
