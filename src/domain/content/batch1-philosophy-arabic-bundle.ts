/**
 * BAC 2026/2027 Production Learning Bundles
 * Stream: Lettres & Philosophie / Langues Étrangères / All Streams (Batch 01)
 * Subjects: Philosophy & Arabic Language
 * Destination: src/domain/content/batch1-philosophy-arabic-bundle.ts
 */

export interface LearningBundlePayload {
  skillId: string;
  stream: string;
  subject: string;
  unitAr: string;
  titleAr: string;
  targetBloomLevel: 'knowledge' | 'comprehension' | 'apply' | 'analyze' | 'evaluate';
  theory: {
    summaryAr: string;
    keyTakeawaysAr: string[];
    commonPitfallsAr: string[];
  };
  practice: {
    questionAr: string;
    options: Array<{ id: string; textAr: string; isCorrect: boolean }>;
    explanationStepByStepAr: string;
  };
  isomorphicRetest: {
    questionAr: string;
    options: Array<{ id: string; textAr: string; isCorrect: boolean }>;
    repairGuideAr: string;
  };
}

export type SkillLearningBundle = LearningBundlePayload;

export const PHILO_ARABIC_ALIASES: Record<string, string> = {
  // New standardized names -> Base keys
  "phil_perception_empiricism_rationalism": "phil_perception_empiricism_rationalism",
  "phil_language_thought_connection": "phil_language_thought_connection",
  "phil_consciousness_unconscious_freud": "phil_consciousness_unconscious_freud",
  "phil_memory_imagination_theories": "phil_memory_imagination_theories",
  "phil_habit_will_conflict": "phil_habit_will_conflict",
  "ar_grammar_ida_idhan_rules": "ar_grammar_ida_idhan_rules",
  // Legacy aliases
  "philo_sensation_perception": "phil_perception_empiricism_rationalism",
  "phi_lp_perception_sensation": "phil_perception_empiricism_rationalism",
  "philo_language_thought": "phil_language_thought_connection",
  "phi_lp_language_thought": "phil_language_thought_connection",
  "philo_consciousness_unconscious": "phil_consciousness_unconscious_freud",
  "phi_lp_consciousness_unconscious": "phil_consciousness_unconscious_freud",
  "philo_memory_imagination": "phil_memory_imagination_theories",
  "phi_lp_memory_imagination": "phil_memory_imagination_theories",
  "philo_habit_will": "phil_habit_will_conflict",
  "phi_lp_habit_will": "phil_habit_will_conflict",
  "arabic_ida_idhan_rules": "ar_grammar_ida_idhan_rules",
  "ar_lp_ida_idhan_syntax": "ar_grammar_ida_idhan_rules",
};

export const BATCH1_PHILOSOPHY_ARABIC_BUNDLE: Record<string, LearningBundlePayload> = {
  // 1. Philosophy: الإحساس والإدراك
  "phil_perception_empiricism_rationalism": {
    skillId: "phil_perception_empiricism_rationalism",
    stream: "lettres_philo",
    subject: "philosophy",
    unitAr: "في إدراك العالم الخارجي",
    titleAr: "الإحساس والإدراك بين التمييز والاتصال (المذهب العقلي، الحسي، والجيشتالت)",
    targetBloomLevel: "analyze",
    theory: {
      summaryAr: "تتناول هذه القضية الفلسفية التمييز بين الإحساس كنشاط عضوي فيزيولوجي بسيط والإدراك كنشاط عقلي تركيبي يعطي معنى للمحسوسات. يتنازع المسألة اتجاهان كلاسيكيان: الحسي والتجريبي (جون لوك وديفيد هيوم) الذي يرجع المعرفة للحواس، والعقلي (ديكارت وكانط) الذي يرجعها للعقل، في مقابل الاتجاه المعاصر (الجيشتالت والفينومينولوجيا) الذي يرفض الفصل بينهما ويعتبر الإدراك كلاً متكاملاً وبنية واحدة.",
      keyTakeawaysAr: [
        "الاتجاه الكلاسيكي (العقلي والحسي): يفصل بين الإحساس (عضوي أدنى) والإدراك (عقلي معقد).",
        "المذهب العقلي (ديكارت، كانط): الحواس خادعة، والعقل هو الذي يحكم ويرتب المعطيات الحسية عبر مقولات قبلية.",
        "المذهب الحسي (أرسطو، لوك): العقل صفحة بيضاء، والتجربة الحسية هي المصدر الحصري لكل معارفنا.",
        "النظرية الجيشتالتية (كوهلر، كوفكا): ندرك الأشياء كصيغ وبنى كلية خاضعة لقوانين موضوعية (الشكل والأرضية، التشابه، التقارب).",
        "النظرية الفينومينولوجية (ميرلوبونتي، هوسرل): الإدراك تجربة معيشة مرتبطة بالشعور والقصدية ووضعية الجسد في العالم."
      ],
      commonPitfallsAr: [
        "الخلط بين موقف الجيشتالت وموقف الفينومينولوجيا: الجيشتالت تركز على العوامل الموضوعية في الموضوع المدرك، بينما الفينومينولوجيا تركز على قصدية الذات وتجربتها الحية.",
        "إغفال التمييز بين المنهج الجدلي ومنهج المقارنة في كتابة المقالة حسب السؤال المطروح."
      ]
    },
    practice: {
      questionAr: "أيّ المواقف الفلسفية التالية يُرجع الإدراك إلى بنية الموضوع وقوانين المجال البصري بدلاً من النشاط الذهني المعزول؟",
      options: [
        { id: "opt_a", textAr: "النظرية الجيشتالتية بزعامة كوفكا وكوهلر", isCorrect: true },
        { id: "opt_b", textAr: "المذهب العقلي الديكارتي القائم على الفطرة", isCorrect: false },
        { id: "opt_c", textAr: "المذهب الحسي التجريبي لجون لوك", isCorrect: false },
        { id: "opt_d", textAr: "الفينومينولوجيا القائمة على القصدية والشعور المعاش", isCorrect: false }
      ],
      explanationStepByStepAr: "الجيشتالت (Gestalt) تعتبر أن العالم المدرك يُفرض علينا كبنية كلية متماسكة تحكمها قوانين انتظام المجال (كقانون الامتلاء، التشابه، والتقارب)، رافضة تجزئة الإدراك إلى عناصر حسية فردية أو أحكام عقلية منفصلة."
    },
    isomorphicRetest: {
      questionAr: "في مقالة فلسفية جدلية، اعتمد التلميذ على قول ديكارت: 'أنا أرى قبعات ومعاطف، ولكنني أحكم بأنهم رجال'. يمثل هذا الشاهد حجة رئيسية لدعم أي تيار؟",
      options: [
        { id: "iso_a", textAr: "الموقف العقلي الذي يفصل الإدراك عن معطيات الحواس الخادعة", isCorrect: true },
        { id: "iso_b", textAr: "المذهب الحسي التجريبي الذي يعتبر الحواس أساس الحكم", isCorrect: false },
        { id: "iso_c", textAr: "الموقف الفينومينولوجي القائل بقصدية الشعور", isCorrect: false },
        { id: "iso_d", textAr: "النظرية الكلية الجيشتالتية", isCorrect: false }
      ],
      repairGuideAr: "ديكارت يستدل هنا على أن العين تنقل خيالات وصوراً مادية فقط (قبعات ومعاطف)، بينما العقل هو الذي يُصدر الحكم المعرفي بأن أصحابها بشر، مما يثبت أولوية النشاط العقلي في عملية الإدراك."
    }
  },

  // 2. Philosophy: اللغة والفكر
  "phil_language_thought_connection": {
    skillId: "phil_language_thought_connection",
    stream: "lettres_philo",
    subject: "philosophy",
    unitAr: "في إدراك العالم الخارجي",
    titleAr: "علاقة اللغة بالفكر: الاتصال والانفصال ودلالة الألفاظ",
    targetBloomLevel: "analyze",
    theory: {
      summaryAr: "تتناول هذه القضية مدى التوافق والتطابق بين الفكر المجرد والألفاظ اللغوية الحاملة له. يرى الاتجاه الثنائي (برغسون) وجود انفصال بينهما، حيث يعجز اللفظ الثابت عن استيعاب ديمومة الفكر وسيولته (اللغة قبور المعاني). بينما يرى الاتجاه الأحادي التواصلي (دي سوسير، ميرلوبونتي، وهيجل) أنهما وجهان لعملة نقدية واحدة، ولا وجود لفكر متمايز دون رموز لغوية تحققه في الواقع.",
      keyTakeawaysAr: [
        "الاتجاه الثنائي (الانفصالي): برغسون يعتبر الفكر أوسع من اللغة، والكلمات أوعية جامدة تشوه فيض المشاعر والأفكار.",
        "الاتجاه الأحادي (الاتصالي): هيجل يؤكد أننا نفكر داخل الكلمات، ودي سوسير يعتبر الفكر واللغة كالوجه والقفا لورقة واحدة.",
        "دلالة الألفاظ: العلاقة بين الدال والمدلول اعتباطية اصطلاحية عند اللسانيين المحدثين (دي سوسير)، بينما رأى القدماء كأفلاطون أنها تحاكي أصوات الطبيعة."
      ],
      commonPitfallsAr: [
        "الاعتقاد بأن الاتجاه الانفصالي يرفض أهمية اللغة كلياً؛ برغسون يعترف بوظيفتها العملية الاجتماعية لكنه يحصر قصورها في التعبير عن الفكر الحدسي الداخلي."
      ]
    },
    practice: {
      questionAr: "يقول الفيلسوف فريدريك هيجل: 'إن الرغبة في التفكير بدون كلمات لمحاولة عديمة الجدوى'. يهدف هذا القول إلى إثبات:",
      options: [
        { id: "opt_a", textAr: "الوحدة العضوية والتطابق التام بين الفكر واللغة", isCorrect: true },
        { id: "opt_b", textAr: "أسبقية الفكر المطلقة وعجزه عن التجسد اللفظي", isCorrect: false },
        { id: "opt_c", textAr: "انفصال الفكر المعنوي عن الرموز المادية الاصطلاحية", isCorrect: false },
        { id: "opt_d", textAr: "أن اللغة عائق إبستيمولوجي يعطل تدفق الوعي والحدس", isCorrect: false }
      ],
      explanationStepByStepAr: "هيجل في فلسفته يؤكد على الاتجاه الأحادي؛ فالأفكار لا تكتسب وجوداً حقيقياً ومحدداً إلا عندما تتجسد في الألفاظ، والقول بوجود فكر خالص بدون لغة هو وهم ميتافيزيقي."
    },
    isomorphicRetest: {
      questionAr: "اعتبر هنري برغسون أن 'الألفاظ قبور المعاني'. يُستخدم هذا الشاهد في بناء حجة أطروحة تؤكد على:",
      options: [
        { id: "iso_a", textAr: "عجز اللغة عن التعبير التام عن فيض الفكر وسيلان المشاعر", isCorrect: true },
        { id: "iso_b", textAr: "تطابق الرمز والدلالة في الأنساق الفلسفية المعاصرة", isCorrect: false },
        { id: "iso_c", textAr: "أن التفكير عملية حوار صامت مع الذات", isCorrect: false },
        { id: "iso_d", textAr: "ارتباط اللغة بالبنية الاجتماعية والتواصل العلمي الدقيق", isCorrect: false }
      ],
      repairGuideAr: "برغسون يعتبر الفكر ديمومة وحيوية مستمرة، بينما الكلمات قوالب مادية ساكنة؛ بمجرد صب المشاعر والأفكار فيها تتجمد وتفقد أصالتها، ومن هنا جاء تشبيهه لها بـ'القبور'."
    }
  },

  // 3. Philosophy: الشعور واللاشعور
  "phil_consciousness_unconscious_freud": {
    skillId: "phil_consciousness_unconscious_freud",
    stream: "lettres_philo",
    subject: "philosophy",
    unitAr: "في إدراك العالم الخارجي",
    titleAr: "الحياة النفسية بين الشعور ومدرسة التحليل النفسي (اللاشعور لفرويد)",
    targetBloomLevel: "evaluate",
    theory: {
      summaryAr: "تتناول المسألة حقيقة الحياة النفسية للإنسان: هل تقتصر تماماً على الوعي والشعور كما يزعم الاتجاه الكلاسيكي (ديكارت، سارتر)، أم أن هناك جانباً خفياً وأكثر اتساعاً يحرك السلوك وهو اللاشعور كما أثبتت مدرسة التحليل النفسي بزعامة سيغموند فرويد عبر أدلة زلات اللسان، فلتات القلم، النسيان، والأحلام، ومكونات الجهاز النفسي (الهو، الأنا، الأنا الأعلى).",
      keyTakeawaysAr: [
        "الاتجاه الكلاسيكي العقلاني: النفس تساوي الشعور بالضرورة (ديكارت: النفس تفكر دوماً؛ سارتر: اللاشعور خداع للنفس وسوء نية).",
        "مدرسة التحليل النفسي (فرويد): اللاشعور حقيقة علمية ونفسية، والشعور ليس إلا السطح الظاهر من جبل الجليد النفسي.",
        "مكونات الجهاز النفسي الفرويدي: الهو (مستودع الغرائز ومبدأ اللذة)، الأنا (الواقع والعقلانية)، الأنا الأعلى (الضمير والقيم الأخلاقية والاجتماعية).",
        "مظاهر اللاشعور: الأحلام، زلات القلم واللسان، النسيان المؤقت، والأعراض العصابية التحويلية."
      ],
      commonPitfallsAr: [
        "اعتبار اللاشعور مجرد خرافة أو نكرانه بالمطلق؛ النقد البيداغوجي المعتمد في البكالوريا يؤكد على تكامل الجانبين: فالإنسان كائن واعٍ ومسؤول أخلاقياً لكنه يخضع أحياناً لدوافع لاشعورية خفية."
      ]
    },
    practice: {
      questionAr: "تعتبر مدرسة التحليل النفسي أن 'زلات اللسان وفلتات القلم والأحلام' هي:",
      options: [
        { id: "opt_a", textAr: "منافذ مشروعة ومعدلة لبروز المكبوتات والنزعات اللاشعورية", isCorrect: true },
        { id: "opt_b", textAr: "اضطرابات فيزيولوجية عابرة تصيب الجهاز العصبي المحيطي فقط", isCorrect: false },
        { id: "opt_c", textAr: "أدلة قاطعة على بطلان وجود العقل والوعي الإنساني كلياً", isCorrect: false },
        { id: "opt_d", textAr: "تصرفات إرادية يقوم بها الأنا للتخلص من ضغط الأنا الأعلى", isCorrect: false }
      ],
      explanationStepByStepAr: "فرويد بين أن المكبوتات في منطقة اللاشعور تبحث دائماً عن التعبير عن نفسها، وحين تضعف رقابة 'الأنا' أثناء النوم أو الإرهاق تبرز على هيئة حلم أو زلة لسان كحل وسط بين الرغبة والرقابة."
    },
    isomorphicRetest: {
      questionAr: "انتقد الفيلسوف الوجودي جان بول سارتر مفهوم اللاشعور الفرويدي، واعتبره حيلة نلجأ إليها بدافع:",
      options: [
        { id: "iso_a", textAr: "سوء النية والهروب من المسؤولية والحرية الإنسانية التامة", isCorrect: true },
        { id: "iso_b", textAr: "تأكيد سمو الغرائز البيولوجية على القوانين الأخلاقية", isCorrect: false },
        { id: "iso_c", textAr: "تطوير مناهج علم النفس التجريبي والكلينيكي", isCorrect: false },
        { id: "iso_d", textAr: "إثبات خضوع الإنسان التام للحتمية الاجتماعية المادية", isCorrect: false }
      ],
      repairGuideAr: "سارتر يرى أن الإنسان حر ومسؤول عن كافة أفعاله ومشاعره؛ والادعاء بوجود قوى 'لاشعورية' قاهرة تسيره هو تبرير كاذب وموقف ينطوي على سوء نية (Mauvaise foi) للتملص من وطأة المسؤولية."
    }
  },

  // 4. Philosophy: الذاكرة والخيال
  "phil_memory_imagination_theories": {
    skillId: "phil_memory_imagination_theories",
    stream: "lettres_philo",
    subject: "philosophy",
    unitAr: "في إدراك العالم الخارجي",
    titleAr: "الذاكرة بين الطبيعة العضوية المادية والطبيعة النفسية الاجتماعية",
    targetBloomLevel: "analyze",
    theory: {
      summaryAr: "تبحث هذه القضية في أساس حفظ الذكريات واسترجاعها: هل الذكرى أثر مادي يخزن في خلايا الدماغ والتلافيف العصبية (النظرية المادية الفيزيولوجية - ريبو)، أم أنها نشاط روحي شعوري مستقل عن الجسد (النظرية النفسية - برغسون)، أم أنها إعادة بناء اجتماعية تقوم على الأطر العامة للمجتمع (النظرية الاجتماعية - هالفاكس).",
      keyTakeawaysAr: [
        "النظرية المادية (تيودول ريبو): الذاكرة وظيفة بيولوجية دماغية، وإصابة التلفيف الصدغي الثالث تؤدي إلى أمراض الحبسة وفقدان الذاكرة (قانون ريبو للتقهقر).",
        "النظرية النفسية الروحية (هنري برغسون): يميز بين ذاكرة العادة الحركية (الآلية) والذاكرة المحضة النفسية (الروحية الحرة المستقلة عن الدماغ). الدماغ جهاز إرسال واسترجاع وليس خزانة للذكريات.",
        "النظرية الاجتماعية (موريس هالفاكس): 'أنا لست وحدي أتذكر، بل الآخرون هم الذين يدفعونني إلى التذكر'؛ الذكريات تُبنى ضمن الأطر الاجتماعية (العائلة، المدرسة، الأعياد)."
      ],
      commonPitfallsAr: [
        "إهمال الطرح التركيبي المعاصر: الذاكرة تتطلب سلامة القاعدة العصبية العضوية، ونشاط الوعي والشعور النفسي، وحضور المحفزات والأطر الاجتماعية في آن واحد."
      ]
    },
    practice: {
      questionAr: "يقول عالم النفس موريس هالفاكس: 'إنني في أغلب الأحيان عندما أتذكر فإن الآخرين هم الذين يدفعونني إلى التذكر'. يعبر هذا النص عن أطروحة:",
      options: [
        { id: "opt_a", textAr: "الأساس الاجتماعي التشاركي للذاكرة عبر الأطر الجماعية", isCorrect: true },
        { id: "opt_b", textAr: "النظرية المادية العصبية التي تحصر الذكريات في خلايا القشرة المخية", isCorrect: false },
        { id: "opt_c", textAr: "النظرية الروحية لبرغسون التي تجعل الذكرى معزولة تماماً عن المجتمع", isCorrect: false },
        { id: "opt_d", textAr: "اللاشعور الجمعي المعرفي الخاص بالممارسات البدائية", isCorrect: false }
      ],
      explanationStepByStepAr: "هالفاكس يثبت أن الفرد لا يستحضر ذكرياته إلا من خلال التفاعل مع محيطه الاجتماعي واستعمال لغة ومفاهيم وأطر زمنية ومكانية مشتركة."
    },
    isomorphicRetest: {
      questionAr: "اعتمد تيودول ريبو في إثبات نظريته المادية حول الذاكرة على دراسة الحالات المرضية مثل مرض 'الأفازيا' (Aphasia). الحجة المستخلصة هي:",
      options: [
        { id: "iso_a", textAr: "تلف مناطق محددة من خلايا الدماغ يؤدي مباشرة إلى فقدان نوعي للذكريات المسجلة فيها", isCorrect: true },
        { id: "iso_b", textAr: "الذكريات مستقلة استقلالاً مطلقاً عن أي وعاء جسدي أو تلفيف عصبي", isCorrect: false },
        { id: "iso_c", textAr: "الذاكرة الاجتماعية هي التي تحمي الدماغ من التلف البيولوجي", isCorrect: false },
        { id: "iso_d", textAr: "النسيان مجرد كبت لاشعوري تفرضه رقابة الأنا الأعلى على الذات", isCorrect: false }
      ],
      repairGuideAr: "ريبو كان طبيباً نفسياً اعتمد على الملاحظة الإكلينيكية؛ فعندما رأى أن إصابة أجزاء من القشرة الدماغية تمحو ذكريات لغوية أو حركية محددة، استنتج أن الدماغ هو الوعاء المادي الحقيقي لتخزين الذكريات."
    }
  },

  // 5. Philosophy: العادة والإرادة
  "phil_habit_will_conflict": {
    skillId: "phil_habit_will_conflict",
    stream: "lettres_philo",
    subject: "philosophy",
    unitAr: "في إدراك العالم الخارجي",
    titleAr: "العادة والإرادة: التكيف والجمود والتحرر السلوكي",
    targetBloomLevel: "analyze",
    theory: {
      summaryAr: "تدرس هذه الإشكالية دور العادة (السلوك المكتسب بالمران والتكرار الآلي) في التكيف مع الواقع وعلاقتها بالإرادة والوعي. يركز الجدل الفلسفي على الأثر المزدوج للعادة: هل هي عامل إيجابي يضمن الاقتصاد في الجهد والوقت وإتقان المهارات، أم هي عائق سلبي يورث الجمود والروتين ويقيد حرية الفكر والإرادة؟",
      keyTakeawaysAr: [
        "الإيجابيات: توفير الطاقة والجهد، التكيف السريع مع البيئة، إتقان الصنائع والحرف والسرعة في الإنجاز.",
        "السلبيات (الجمود والآلية): يقول برودوم: 'كلما ازدادت العادات قوة أصبحت حرية الإرادة أضعف'، فالتعود يبلد الإحساس ويفقد الإنسان القدرة على الإبداع والتغيير.",
        "العلاقة بين العادة والإرادة: ليست علاقة تنافر دائم؛ فالإرادة هي التي تنشئ العادات الإيجابية وتشرف على توجيهها وتعديلها كلما طرأت مستجدات بيئية."
      ],
      commonPitfallsAr: [
        "التركيز على الآثار السلبية للعادة فقط؛ يجب دائماً إبراز أن التطور الحضاري والمهاري للإنسان يستحيل بدون تثبيت المكاسب المعرفية والحركية في شكل عادات."
      ]
    },
    practice: {
      questionAr: "يقول جان جاك روسو: 'خير عادة ألا نألف أي عادة'. يقصد روسو من هذا الموقف التحذير من:",
      options: [
        { id: "opt_a", textAr: "الجمود والتبعية والروتين الذي يسلب الإنسان حريته ومرونته الفكرية", isCorrect: true },
        { id: "opt_b", textAr: "تعلم المهارات الحركية والصناعية الجديدة في مرحلة الطفولة", isCorrect: false },
        { id: "opt_c", textAr: "دور الإرادة في توجيه القرارات الأخلاقية والاجتماعية المستقلة", isCorrect: false },
        { id: "opt_d", textAr: "التكيف السريع مع القوانين الطبيعية والبيئية المتغيرة", isCorrect: false }
      ],
      explanationStepByStepAr: "روسو يرى أن العادة حين تتحول إلى طبع ثانٍ مقيد، تجعل الإنسان عبداً للمألوف وعاجزاً عن التفكير النقدي أو التفاعل الحر مع المستجدات."
    },
    isomorphicRetest: {
      questionAr: "تكتسب العادة أهميتها الإيجابية الأساسية في النشاط الإنساني اليومي من خلال:",
      options: [
        { id: "iso_a", textAr: "تحرير الفكر والوعي وتوفير الجهد العصبي لتوجيهه نحو مهام إبداعية أعلى", isCorrect: true },
        { id: "iso_b", textAr: "إلغاء الحاجة تماماً إلى التدخل الإرادي في الأفعال الأخلاقية المعقدة", isCorrect: false },
        { id: "iso_c", textAr: "منع الفرد من التمرد على التقاليد والأعراف الاجتماعية البالية", isCorrect: false },
        { id: "iso_d", textAr: "تثبيت حركات الجسم بطريقة ميكانيكية غير قابلة للتغيير والتطور", isCorrect: false }
      ],
      repairGuideAr: "عندما تتحول حركات الكتابة أو السياقة أو العزف إلى عادات آلية، لا يعود العقل بحاجة إلى مراقبة كل عضلة أو حركة، مما يوفر طاقته الذهنية للتركيز على المعنى أو الإبداع."
    }
  },

  // 6. Arabic: إعراب إذا، وإذ، وإذن، وحينئذ
  "ar_grammar_ida_idhan_rules": {
    skillId: "ar_grammar_ida_idhan_rules",
    stream: "all_streams",
    subject: "arabic",
    unitAr: "قواعد اللغة والإعراب التقديري والمحلي",
    titleAr: "إعراب ودلالة: إذا، إذ، إذن، وحينئذ",
    targetBloomLevel: "apply",
    theory: {
      summaryAr: "تعد هذه الأدوات من الثوابت الوزارية المقررة في كافة دورات البكالوريا لجميع الشُعب. تتنوع معانيها وإعرابها حسب السياق التركيبي للجملة بين الظرفية الشرطية، والمفاجأة، والتعليل، والجزاء.",
      keyTakeawaysAr: [
        "إذا الشرطية الظرفية: ظرف لما يستقبل من الزمان متضمن معنى الشرط غير جازم، خافض لشرطه منصوب بجوابه، مبني على السكون في محل نصب على الظرفية الزمانية. الجملة بعدها في محل جر مضاف إليه.",
        "إذا الفجائية: حرف مبني على السكون لا محل له من الإعراب، تدخل على الجملة الاسمية وتحتاج إلى واو قبلها أو تقع بعد 'بينما' أو 'بينا' (مثال: خرجت فإذا المطرُ ينهمر).",
        "إذا التفسيرية: حرف تفسير مبني على السكون لا محل له من الإعراب (بمعنى أيْ).",
        "إذْ: تكون ظرفاً لما مضى من الزمان مبنياً على السكون في محل نصب، أو فجائية، أو حرف تعليل مبني على السكون لا محل له من الإعراب.",
        "إذن (إذنْ / إذاً): حرف جواب وجزاء واستقبال ونصب، ينصب الفعل المضارع بشروط: أن تكون في صدر جملة الجواب، متصلة بالفعل، ودالة على الاستقبال.",
        "حينئذٍ: مركبة من 'حينَ' (ظرف زمان منصوب) و 'إذْ' (ظرف لما مضى من الزمان مبني على السكون المقدر منع من ظهوره اشتغال المحل بتنوين العوض، في محل جر مضاف إليه)."
      ],
      commonPitfallsAr: [
        "إعراب الاسم المرفوع بعد 'إذا' الشرطية: لا يُعرب مبتدأً، بل يُعرب دائماً (فاعل أو نائب فاعل أو اسم لفعل ناسخ) لفعل محذوف يفسره الفعل المذكور بعده (إذا السماءُ انشقت: السماءُ فاعل لفعل محذوف يفسره انشقت).",
        "الخلط بين 'إذا' الشرطية و'إذا' الفجائية: الفجائية لا تحتاج إلى جملة جواب شرط، وتدخل فقط على الأسماء."
      ]
    },
    practice: {
      questionAr: "قال المتنبي: 'إذا غامَرْتَ في شَرَفٍ مَرُومِ ... فَلا تَقنَعْ بِما دونَ النُّجومِ'. ما هو الإعراب النموذجي لـ 'إذا' في هذا البيت؟",
      options: [
        { id: "opt_a", textAr: "ظرف لما يستقبل من الزمان متضمن معنى الشرط غير جازم مبني على السكون في محل نصب على الظرفية الزمانية", isCorrect: true },
        { id: "opt_b", textAr: "حرف شرط جازم مبني على السكون في محل نصب مفعول فيه لفعل الشرط", isCorrect: false },
        { id: "opt_c", textAr: "حرف مفاجأة مبني على السكون لا محل له من الإعراب", isCorrect: false },
        { id: "opt_d", textAr: "ظرف لما مضى من الزمان مبني على السكون المقدر في محل رفع مبتدأ", isCorrect: false }
      ],
      explanationStepByStepAr: "'إذا' هنا تضمنت معنى الشرط، دلت على الزمن المستقبل، ولم تجزم الفعل لفظاً، واقترنت بجواب شرط مقترن بالفاء (فلا تقنع). إعرابها الرسمي الكامل المعتمد في التصحيح الوزاري هو: ظرف لما يستقبل من الزمان خافض لشرطه منصوب بجوابه مبني على السكون في محل نصب ظرف زمان."
    },
    isomorphicRetest: {
      questionAr: "ما هو إعراب كلمة 'الشعبُ' في قول الشاعر: 'إذا الشعبُ يوماً أرادَ الحياةَ ... فلا بدّ أن يستجيبَ القدر'؟",
      options: [
        { id: "iso_a", textAr: "فاعل لفعل محذوف وجوباً يفسره ما بعده (أراد) مرفوع وعلامة رفعه الضمة الظاهرة", isCorrect: true },
        { id: "iso_b", textAr: "مبتدأ مؤخر مرفوع وعلامة رفعه الضمة الظاهرة والجملة الفعلية بعده خبره", isCorrect: false },
        { id: "iso_c", textAr: "نائب فاعل لفعل محذوف تقديره طُلب الشعب مرفوع بالضمة", isCorrect: false },
        { id: "iso_d", textAr: "اسم إذا مرفوع بالضمة الظاهرة لأن إذا تعمل عمل الأفعال الناقصة", isCorrect: false }
      ],
      repairGuideAr: "قاعدة بصرية راسخة في البكالوريا: إذا وليت 'إذا' الشرطية باسم مرفوع يليه فعل مبني للمعلوم، فإن هذا الاسم يُعرب دائماً فاعلاً لفعل محذوف يفسره الفعل المذكور، لأن 'إذا' مختصة بالدخول على الجمل الفعلية فقط."
    }
  }
};

// Also attach legacy keys to BATCH1_PHILOSOPHY_ARABIC_BUNDLE for immediate index access
BATCH1_PHILOSOPHY_ARABIC_BUNDLE["philo_sensation_perception"] = BATCH1_PHILOSOPHY_ARABIC_BUNDLE["phil_perception_empiricism_rationalism"];
BATCH1_PHILOSOPHY_ARABIC_BUNDLE["phi_lp_perception_sensation"] = BATCH1_PHILOSOPHY_ARABIC_BUNDLE["phil_perception_empiricism_rationalism"];
BATCH1_PHILOSOPHY_ARABIC_BUNDLE["philo_language_thought"] = BATCH1_PHILOSOPHY_ARABIC_BUNDLE["phil_language_thought_connection"];
BATCH1_PHILOSOPHY_ARABIC_BUNDLE["phi_lp_language_thought"] = BATCH1_PHILOSOPHY_ARABIC_BUNDLE["phil_language_thought_connection"];
BATCH1_PHILOSOPHY_ARABIC_BUNDLE["philo_consciousness_unconscious"] = BATCH1_PHILOSOPHY_ARABIC_BUNDLE["phil_consciousness_unconscious_freud"];
BATCH1_PHILOSOPHY_ARABIC_BUNDLE["phi_lp_consciousness_unconscious"] = BATCH1_PHILOSOPHY_ARABIC_BUNDLE["phil_consciousness_unconscious_freud"];
BATCH1_PHILOSOPHY_ARABIC_BUNDLE["philo_memory_imagination"] = BATCH1_PHILOSOPHY_ARABIC_BUNDLE["phil_memory_imagination_theories"];
BATCH1_PHILOSOPHY_ARABIC_BUNDLE["phi_lp_memory_imagination"] = BATCH1_PHILOSOPHY_ARABIC_BUNDLE["phil_memory_imagination_theories"];
BATCH1_PHILOSOPHY_ARABIC_BUNDLE["philo_habit_will"] = BATCH1_PHILOSOPHY_ARABIC_BUNDLE["phil_habit_will_conflict"];
BATCH1_PHILOSOPHY_ARABIC_BUNDLE["phi_lp_habit_will"] = BATCH1_PHILOSOPHY_ARABIC_BUNDLE["phil_habit_will_conflict"];
BATCH1_PHILOSOPHY_ARABIC_BUNDLE["arabic_ida_idhan_rules"] = BATCH1_PHILOSOPHY_ARABIC_BUNDLE["ar_grammar_ida_idhan_rules"];
BATCH1_PHILOSOPHY_ARABIC_BUNDLE["ar_lp_ida_idhan_syntax"] = BATCH1_PHILOSOPHY_ARABIC_BUNDLE["ar_grammar_ida_idhan_rules"];

export const BATCH1_PHILOSOPHY_ARABIC_BUNDLES = BATCH1_PHILOSOPHY_ARABIC_BUNDLE;

/**
 * Mapping bridge to attach Batch 1 bundles into getSkillLearningBundle
 */
export function getBatch1LearningBundle(skillId: string): LearningBundlePayload | null {
  if (BATCH1_PHILOSOPHY_ARABIC_BUNDLE[skillId]) {
    return BATCH1_PHILOSOPHY_ARABIC_BUNDLE[skillId];
  }
  const aliasedId = PHILO_ARABIC_ALIASES[skillId];
  if (aliasedId && BATCH1_PHILOSOPHY_ARABIC_BUNDLE[aliasedId]) {
    return BATCH1_PHILOSOPHY_ARABIC_BUNDLE[aliasedId];
  }
  return null;
}
