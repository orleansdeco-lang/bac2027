// src/data/practice/gestion-eco/trimestre1-all-subjects.ts

import { PracticeQuestion, SuspectedErrorType } from "@/types/mission";
import { SubjectId, StreamId } from "@/types/education";
import { DiagnosticPracticeItem } from "./trimestre1-accounting";

export const gestionEcoT1AllSubjectsPractice: DiagnosticPracticeItem[] = [
  // ═══════════════════════════════════════════════════════════════
  // 1. الرياضيات (تسيير واقتصاد): المتتاليات العددية والفوائد المركبة
  // ═══════════════════════════════════════════════════════════════
  {
    id: "diag_ge_math_sequences_01",
    skillId: "math_sequences_reasoning",
    subjectId: "math",
    streamId: "gestion_eco",
    difficulty: "intermediate",
    prompt_ar: "متتالية هندسية $(u_n)$ حدودها موجبة تماماً، أساسها $q = 1.05$ وحدها الأول $u_0 = 10,000$. ما هو اتجاه تغير المتتالية وحساب الحد $u_2$؟",
    options_ar: [
      "المتتالية متزايدة تماماً، و $u_2 = 11,025$",
      "المتتالية متناقصة تماماً، و $u_2 = 11,000$",
      "المتتالية متزايدة تماماً، و $u_2 = 10,500$",
      "المتتالية ثابتة، و $u_2 = 10,000$"
    ],
    correctAnswer_ar: "المتتالية متزايدة تماماً، و $u_2 = 11,025$",
    explanation_ar: "بما أن $u_0 > 0$ والأساس $q = 1.05 > 1$، فإن المتتالية متزايدة تماماً. الحساب: $u_1 = 10,000 \\times 1.05 = 10,500$، ثم $u_2 = 10,500 \\times 1.05 = 11,025$.",
    trapType: "calculation",
    commonTrap_ar: "الخلط بين الفائدة البسيطة (زيادة 500 كل سنة) والفائدة المركبة (ضرب الأساس $1.05^2$).",
    twinQuestion: {
      id: "twin_ge_math_sequences_01",
      prompt_ar: "متتالية هندسية أساسها $q = 0.8$ وحدها الأول $u_0 = 500$. ما هي قيمة $u_2$ وما هو اتجاه تغيرها؟",
      options_ar: [
        "متناقصة تماماً، و $u_2 = 320$",
        "متزايدة تماماً، و $u_2 = 400$",
        "متناقصة تماماً، و $u_2 = 400$",
        "ثابتة، و $u_2 = 320$"
      ],
      correctAnswer_ar: "متناقصة تماماً، و $u_2 = 320$",
      explanation_ar: "بما أن $0 < q < 1$ و $u_0 > 0$ فالمتتالية متناقصة تماماً. $u_1 = 500 \\times 0.8 = 400$ و $u_2 = 400 \\times 0.8 = 320$."
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 2. التاريخ (تسيير واقتصاد): الحرب الباردة، الاستراتيجيات والمشاريع
  // ═══════════════════════════════════════════════════════════════
  {
    id: "diag_ge_hist_cold_war_01",
    skillId: "hist_geo_methodology_terms_maps",
    subjectId: "history_geography",
    streamId: "gestion_eco",
    difficulty: "intermediate",
    prompt_ar: "ما هو الهدف الاقتصادي والسياسي الخفي لمشروع مارشال (1947) الذي قدمته الولايات المتحدة الأمريكية لأوروبا؟",
    options_ar: [
      "ربط الاقتصاد الأوروبي بالدولار الأمريكي واحتواء المد الشيوعي في غرب أوروبا",
      "تقديم مساعدات إنسانية مجانية وإعادة بناء الاتحاد السوفياتي",
      "إنشاء حلف شمال الأطلسي العسكري مباشرة",
      "تشجيع الدول الأوروبية على تبني النظام الاشتراكي"
    ],
    correctAnswer_ar: "ربط الاقتصاد الأوروبي بالدولار الأمريكي واحتواء المد الشيوعي في غرب أوروبا",
    explanation_ar: "مشروع مارشال كان غطاؤه إعادة الإعمار، لكن أهدافه الخفية تمثلت في التخلص من فائض الإنتاج الأمريكي، تثبيت هيمنة الدولار، وتطويق التوسع السوفياتي سياسياً.",
    trapType: "reading_error",
    commonTrap_ar: "التركيز على الهدف المعلن (المساعدة الإنسانية) وإغفال الأهداف الاقتصادية والاستراتيجية التوسعية.",
    twinQuestion: {
      id: "twin_ge_hist_cold_war_01",
      prompt_ar: "ما كان الرد الاقتصادي المباشر للاتحاد السوفياتي لمواجهة مشروع مارشال الأمريكي سنة 1949؟",
      options_ar: [
        "تأسيس منظمة الكوميكون (مجلس التعاون الاقتصادي)",
        "إنشاء حلف وارسو العسكري",
        "إعلان مبدأ جدانوف السياسي",
        "غلق مضيق البوسفور والدردنيل"
      ],
      correctAnswer_ar: "تأسيس منظمة الكوميكون (مجلس التعاون الاقتصادي)",
      explanation_ar: "الكوميكون (Comecon) كان التكتل الاقتصادي الذي أسسه المعسكر الشرقي لربط اقتصادات دول أوروبا الشرقية بموسكو في مواجهة مشروع مارشال."
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 3. الجغرافيا (تسيير واقتصاد): إشكالية التقدم والتخلف والمبادلات
  // ═══════════════════════════════════════════════════════════════
  {
    id: "diag_ge_geo_development_01",
    skillId: "hist_geo_methodology_terms_maps",
    subjectId: "history_geography",
    streamId: "gestion_eco",
    difficulty: "intermediate",
    prompt_ar: "يُعتبر مؤشر التنمية البشرية (IDH) معياراً مركباً لقياس تقدم الدول؛ ما هي الأبعاد الثلاثة المعتمدة في حسابه؟",
    options_ar: [
      "متوسط العمر المتوقع عند الولادة، مستوى التعليم (التمدرس والأمية)، والدخل الفردي الحقيقي (PPP)",
      "حجم الإنتاج الصناعي، عدد المستشفيات، وعدد السكان الإجمالي",
      "قيمة الصادرات النفطية، الاحتياطي من الذهب، ومعدل التضخم",
      "المساحة الجغرافية، الميزان التجاري، ومعدل النمو الديمغرافي"
    ],
    correctAnswer_ar: "متوسط العمر المتوقع عند الولادة، مستوى التعليم (التمدرس والأمية)، والدخل الفردي الحقيقي (PPP)",
    explanation_ar: "مؤشر التنمية البشرية (IDH) يتراوح بين 0 و 1 ويجمع بين 3 مؤشرات: البعد الصحي (أمد الحياة)، البعد المعرفي (سنوات التمدرس)، والبعد الاقتصادي (نصيب الفرد من الدخل الوطني الإجمالي وفق تعادل القدرة الشرائية).",
    trapType: "misconception",
    commonTrap_ar: "الخلط بين المؤشر المركب (IDH) والمؤشرات الاقتصادية الخام مثل الناتج الداخلي الخام (PIB).",
    twinQuestion: {
      id: "twin_ge_geo_development_01",
      prompt_ar: "ما الذي يميز حركة تجارة البترول والغاز في السوق الدولية بين دول الشمال المتقدم ودول الجنوب النامي؟",
      options_ar: [
        "الجنوب يصدره كمادة خام تخضع لتسعير بورصات الشمال (لندن ونيويورك) والشركات الكبرى",
        "الجنوب يتحكم في تكريره وتحديد أسعاره في البورصات الاستهلاكية",
        "التبادل متكافئ تماماً بين الطرفين بفضل تكتل أوبك",
        "الشمال يعتمد كلياً على الصادرات الزراعية للجنوب"
      ],
      correctAnswer_ar: "الجنوب يصدره كمادة خام تخضع لتسعير بورصات الشمال (لندن ونيويورك) والشركات الكبرى",
      explanation_ar: "تجارة المحروقات تجسد التبعية؛ الجنوب مورد للمادة الأولية، بينما مراكز التسعير والاحتكار التكنولوجي والتكرير تتواجد في دول الشمال."
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 4. الفلسفة (تسيير واقتصاد): المشكلة والإشكالية والمنطق الصوري
  // ═══════════════════════════════════════════════════════════════
  {
    id: "diag_ge_philo_logic_01",
    skillId: "philosophy_methodology_essay_scientific",
    subjectId: "philosophy",
    streamId: "gestion_eco",
    difficulty: "intermediate",
    prompt_ar: "ينص مبدأ 'عدم التناقض' في قواعد المنطق الصوري الأرسطي على أنه:",
    options_ar: [
      "لا يمكن للشيء أن يتصف بصفة ونقيضها في نفس الوقت ومن نفس الجهة (أ لا يمكن أن يكون ب ولا-ب معاً)",
      "الشيء هو ذاته دائماً وله هوية مطابقة (أ هو أ)",
      "بين النقيضين يوجد حد ثالث وسط يقبلهما معاً",
      "كل قضية يجب أن يكون لها سبب كاف يفسرها"
    ],
    correctAnswer_ar: "لا يمكن للشيء أن يتصف بصفة ونقيضها في نفس الوقت ومن نفس الجهة (أ لا يمكن أن يكون ب ولا-ب معاً)",
    explanation_ar: "مبادئ العقل المنطقية الثلاثة هي: الهوية (أ هو أ)، عدم التناقض (استحالة الجمع بين الصفتين المتناقضتين في آن واحد)، والثالث المرفوع (إما أ أو لا-أ ولا خيار ثالث بينهما).",
    trapType: "misconception",
    commonTrap_ar: "الخلط بين مبدأ الهوية (الأول) ومبدأ عدم التناقض (الثاني) ومبدأ الثالث المرفوع (الثالث).",
    twinQuestion: {
      id: "twin_ge_philo_logic_01",
      prompt_ar: "ما هو جوهر نقد الفلاسفة المحدثين (مثل فرانسيس بيكون) للمنطق الصوري الأرسطي؟",
      options_ar: [
        "منطق عقيم وتحصيلي حاصل؛ لا يأتي بمعرفة جديدة عن الواقع بل يعيد ترتيب المقدمات",
        "منطق يعتمد كلياً على التجربة والملاحظة الحسية والمختبرات",
        "منطق غير متماسك رياضياً ولا يحترم مبدأ الهوية",
        "منطق خاص بالشعر والخطابة فقط"
      ],
      correctAnswer_ar: "منطق عقيم وتحصيلي حاصل؛ لا يأتي بمعرفة جديدة عن الواقع بل يعيد ترتيب المقدمات",
      explanation_ar: "القياس الأرسطي نتائجه متضمنة في مقدماته (تحصيل حاصل)، لذا تم استبداله بالمنهج التجريبي الاستقرائي الذي يولد معارف واقعية جديدة."
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 5. اللغة العربية: شعر المنفى والمهجر / النثر العلمي
  // ═══════════════════════════════════════════════════════════════
  {
    id: "diag_ge_arab_prose_01",
    skillId: "arabic_text_analysis_poetry_prose",
    subjectId: "arabic",
    streamId: "gestion_eco",
    difficulty: "intermediate",
    prompt_ar: "إذا كان النص في البكالوريا نثراً يعالج ظاهرة تاريخية أو علمية بأسلوب يخلو من العاطفة والصور البيانية ويعتمد على المصطلحات الدقيقة، يُصنف تحت فن:",
    options_ar: [
      "النثر العلمي أو العلمي المتأدب",
      "المقال الصحفي الذاتي والوجداني",
      "الشعر السياسي التحرري",
      "شعر الزهد والمدائح النبوية"
    ],
    correctAnswer_ar: "النثر العلمي أو العلمي المتأدب",
    explanation_ar: "خصائص النثر العلمي: الموضوعية، الدقة، الاعتماد على لغة الأرقام والمصطلحات، وغياب العاطفة والصور الخيالية المتكلفة إلا ما جاء لخدمة الإيضاح (العلمي المتأدب).",
    trapType: "methodology",
    commonTrap_ar: "تحديد النمط على أنه وجداني بسبب وجود جملة مجازية واحدة عابرة.",
    twinQuestion: {
      id: "twin_ge_arab_prose_01",
      prompt_ar: "ما هي القرائن اللغوية التي تدل على ظاهرة 'الاتساق والانسجام' في نص نثري؟",
      options_ar: [
        "حروف العطف، أسماء الإشارة، الأسماء الموصولة، والضمائر العائدة على متقدم",
        "الطباق والمقابلة والجناس فقط",
        "كثرة الجمل التعجبية وأسلوب القسم والنداء",
        "الوزن العروضي وتقطيع التفاعيل الشعرية"
      ],
      correctAnswer_ar: "حروف العطف، أسماء الإشارة، الأسماء الموصولة، والضمائر العائدة على متقدم",
      explanation_ar: "الاتساق يتحقق بالربط النحوي والإحالة (الضمائر والأسماء الموصولة وحروف العطف) مما يربط أجزاء النص كالبنيان المرصوص."
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 6. العلوم الإسلامية: العقل، مقاصد الشريعة، والمساواة
  // ═══════════════════════════════════════════════════════════════
  {
    id: "diag_ge_islamic_mind_01",
    skillId: "islamic_creed_sharia_analysis",
    subjectId: "islamic_studies",
    streamId: "gestion_eco",
    difficulty: "intermediate",
    prompt_ar: "ما هو حد ومجال إعمال العقل في الإسلام الذي يمنع الوقوع في الانحراف الفكري والعقائدي؟",
    options_ar: [
      "إعمال العقل في الكون والظواهر الطبيعية، والتوقف عند الغيبيات والمسلّمات التوقيفية وكيفيات صفات الله",
      "إعمال العقل في مساءلة أصول العقيدة والغيب دون أي ضوابط",
      "تعطيل العقل تماماً والاعتماد على التقليد المسبق",
      "حصر دور العقل في استخراج المعاملات المالية فقط"
    ],
    correctAnswer_ar: "إعمال العقل في الكون والظواهر الطبيعية، والتوقف عند الغيبيات والمسلّمات التوقيفية وكيفيات صفات الله",
    explanation_ar: "الإسلام حث على التفكر والتدبر في الآفاق والأنفس، لكنه وضع حداً عند الغيبيات التي لا يحيط بها الإدراك الحسي، لحماية العقل من التيه والظنون.",
    trapType: "misconception",
    commonTrap_ar: "الظن بأن تحريم الخوض في الغيبيات هو تعطيل للعقل، والصحيح أنه ترشيد لوظيفته في مجاله الإدراكي.",
    twinQuestion: {
      id: "twin_ge_islamic_mind_01",
      prompt_ar: "في حديث المرأة المخزومية التي سرقت، ما هو الأثر الاجتماعي الخطير المترتب على 'الشفاعة في الحدود' الذي حذر منه النبي ﷺ؟",
      options_ar: [
        "سقوط العدالة المجتمعية، انتشار الجريمة، وهلاك المجتمع بتطبيق العقوبة على الضعيف وإسقاطها عن الشريف",
        "زيادة أموال بيت مال المسلمين",
        "تأخير الفصل في قضايا الميراث",
        "إلغاء عقوبة القصاص فقط"
      ],
      correctAnswer_ar: "سقوط العدالة المجتمعية، انتشار الجريمة، وهلاك المجتمع بتطبيق العقوبة على الضعيف وإسقاطها عن الشريف",
      explanation_ar: "الشفاعة في الحدود تهدم مبدأ المساواة أمام الشريعة وتؤدي لهلاك المجتمع؛ لقوله ﷺ: 'إنما أهلك الذين قبلكم أنهم كانوا إذا سرق فيهم الشريف تركوه وإذا سرق فيهم الضعيف أقاموا عليه الحد'."
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 7. اللغات الأجنبية (الفرنسية): النص التاريخي والـ Visée
  // ═══════════════════════════════════════════════════════════════
  {
    id: "diag_ge_french_history_01",
    skillId: "languages_foreign_comprehension_production",
    subjectId: "french",
    streamId: "gestion_eco",
    difficulty: "intermediate",
    prompt_ar: "Dans un texte d'histoire sur la guerre de libération nationale, lorsque l'historien rapporte des faits réels avec des dates précises sans utiliser de modalisateurs de jugement, sa visée communicative est :",
    options_ar: [
      "Informer et faire connaître des faits historiques objectifs (visée informative / explicative)",
      "Critiquer violemment les décisions d'un dirigeant",
      "Convaincre le lecteur de changer d'avis politique",
      "Raconter une fiction imaginaire"
    ],
    correctAnswer_ar: "Informer et faire connaître des faits historiques objectifs (visée informative / explicative)",
    explanation_ar: "Si le texte d'histoire ne comporte pas de marques de subjectivité ou de témoignage engagé, la visée première est informative, documentaire et explicative.",
    trapType: "reading_error",
    commonTrap_ar: "الخلط بين النص التاريخي التوثيقي المحايد (Visée informative) والنص التاريخي الذي يهدف إلى التكريم والتمجيد (Visée d'hommage/commémorative).",
    twinQuestion: {
      id: "twin_ge_french_history_01",
      prompt_ar: "Quels sont les indices textuels majeurs qui prouvent qu'un témoin de guerre s'implique personnellement dans son témoignage historique ?",
      options_ar: [
        "L'emploi de la 1ère personne (Je/Nous), des verbes d'opinion, et des adjectifs appréciatifs/dépréciatifs",
        "L'utilisation exclusive de la forme passive et impersonnelle",
        "L'absence totale de pronoms personnels",
        "L'énumération de dates chronologiques sans aucun commentaire"
      ],
      correctAnswer_ar: "L'emploi de la 1ère personne (Je/Nous), des verbes d'opinion, et des adjectifs appréciatifs/dépréciatifs",
      explanation_ar: "La présence du témoin se manifeste à travers les marques d'énonciation (modalisateurs, 1ère personne, vocabulaire évaluatif)."
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // 8. اللغات الأجنبية (الإنجليزية): الأخلاقيات في الأعمال والتجارة
  // ═══════════════════════════════════════════════════════════════
  {
    id: "diag_ge_eng_ethics_01",
    skillId: "english_foreign_comprehension_production",
    subjectId: "english",
    streamId: "gestion_eco",
    difficulty: "intermediate",
    prompt_ar: "In the unit 'Ethics in Business', which illegal practice refers to paying money to officials to obtain an undue commercial advantage or public contract?",
    options_ar: [
      "Bribery and Corruption",
      "Counterfeiting and Piracy",
      "Child Labor",
      "Whistleblowing"
    ],
    correctAnswer_ar: "Bribery and Corruption",
    explanation_ar: "Bribery (الرشوة) involves offering or accepting payments/favors to influence the actions of an official in charge of public or business decisions.",
    trapType: "misconception",
    commonTrap_ar: "الخلط بين الرشوة (Bribery) والتبليغ القانوني عن الفساد (Whistleblowing) الذي يعتبر سلوكاً نزيهاً وليس جريمة.",
    twinQuestion: {
      id: "twin_ge_eng_ethics_01",
      prompt_ar: "Which business concept refers to the fraudulent imitation and unauthorized reproduction of branded commercial goods to deceive consumers?",
      options_ar: [
        "Counterfeiting",
        "Money Laundering",
        "Fair Competition",
        "Social Responsibility"
      ],
      correctAnswer_ar: "Counterfeiting",
      explanation_ar: "Counterfeiting (التقليد والتزوير التجاري) is the act of manufacturing fake goods bearing brand names to mislead buyers and evade intellectual property rights."
    }
  }
];

export function convertToPracticeQuestions(items: DiagnosticPracticeItem[]): PracticeQuestion[] {
  const result: PracticeQuestion[] = [];

  const trapToErrorType: Record<string, SuspectedErrorType> = {
    misconception: "misunderstood_concept",
    calculation: "calculation_error",
    methodology: "methodology_error",
    reading_error: "misread_question",
  };

  for (const item of items) {
    const diffMap: Record<string, 1 | 2 | 3> = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
    };
    const diff = diffMap[item.difficulty] || 2;
    const suspectedErr = trapToErrorType[item.trapType] || "misunderstood_concept";

    // 1. Primary Practice Question
    const primaryOptions = (item.options_ar || []).map((opt, idx) => ({
      id: `opt-${idx + 1}`,
      text_ar: opt,
      text_fr: opt,
      ...(opt !== item.correctAnswer_ar ? { suspectedErrorType: suspectedErr } : {}),
    }));

    const correctOpt = primaryOptions.find((o) => o.text_ar === item.correctAnswer_ar);
    const correctOptId = correctOpt ? correctOpt.id : "opt-1";

    result.push({
      id: item.id,
      educationLevel: "secondary",
      examType: "bac",
      streamId: item.streamId as StreamId,
      subjectId: item.subjectId as SubjectId,
      skillId: item.skillId,
      dimension: "application",
      difficulty: diff,
      type: "mcq",
      prompt_ar: item.prompt_ar,
      prompt_fr: item.prompt_ar,
      options: primaryOptions,
      correctAnswerId: correctOptId,
      explanation_ar: item.explanation_ar,
      explanation_fr: item.explanation_ar,
      repairHint_ar: item.commonTrap_ar,
      repairHint_fr: item.commonTrap_ar,
      expectedTimeSeconds: 90,
      tags: [item.subjectId, item.skillId, item.trapType],
      version: 1,
      isRetestVariant: false,
    });

    // 2. Paired Retest Variant from twinQuestion
    const twinOptions = (item.twinQuestion.options_ar || []).map((opt, idx) => ({
      id: `opt-${idx + 1}`,
      text_ar: opt,
      text_fr: opt,
      ...(opt !== item.twinQuestion.correctAnswer_ar ? { suspectedErrorType: suspectedErr } : {}),
    }));

    const correctTwinOpt = twinOptions.find((o) => o.text_ar === item.twinQuestion.correctAnswer_ar);
    const correctTwinOptId = correctTwinOpt ? correctTwinOpt.id : "opt-1";

    result.push({
      id: item.twinQuestion.id,
      educationLevel: "secondary",
      examType: "bac",
      streamId: item.streamId as StreamId,
      subjectId: item.subjectId as SubjectId,
      skillId: item.skillId,
      dimension: "application",
      difficulty: diff,
      type: "mcq",
      prompt_ar: item.twinQuestion.prompt_ar,
      prompt_fr: item.twinQuestion.prompt_ar,
      options: twinOptions,
      correctAnswerId: correctTwinOptId,
      explanation_ar: item.twinQuestion.explanation_ar,
      explanation_fr: item.twinQuestion.explanation_ar,
      expectedTimeSeconds: 90,
      tags: [item.subjectId, item.skillId, "twin_retest"],
      version: 1,
      isRetestVariant: true,
      retestForQuestionId: item.id,
    });
  }

  return result;
}

export const GESTION_ECO_T1_ALL_SUBJECTS_PRACTICE_QUESTIONS: PracticeQuestion[] = convertToPracticeQuestions(gestionEcoT1AllSubjectsPractice);
