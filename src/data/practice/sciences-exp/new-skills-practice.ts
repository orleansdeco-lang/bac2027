/**
 * BAC Mastery - Diagnostic & Practice Items for Newly Added Skills
 * Stream: Sciences Expérimentales (3AS)
 * Paired Diagnostic / Practice Items with Twin Retest Variants and Common Trap Analysis
 */

import { PracticeQuestion } from "@/types/mission";
import { SubjectId, StreamId } from "@/types/education";

export interface DiagnosticPracticeItem {
  id: string;
  skillId: string;
  subjectId: string;
  streamId: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  prompt_ar: string;
  options_ar?: string[];
  correctAnswer_ar: string;
  explanation_ar: string;
  trapType: "misconception" | "calculation" | "methodology" | "reading_error";
  commonTrap_ar: string;
  twinQuestion: {
    id: string;
    prompt_ar: string;
    options_ar?: string[];
    correctAnswer_ar: string;
    explanation_ar: string;
  };
}

export const newSkillsPracticeQuestions: DiagnosticPracticeItem[] = [
  // ─── 1. الفيزياء: المتابعة الزمنية والسرعات الحجمية ───────────────────────
  {
    id: "diag_phys_kinetics_01",
    skillId: "physics_chemical_kinetics",
    subjectId: "physics",
    streamId: "sciences_exp",
    difficulty: "intermediate",
    prompt_ar: "في تحول كيميائي تام وبطيء، إذا كان حجم الوسط التفاعلي V_tot = 100 mL وكان ميل المماس لمنحنى التقدم x = f(t) عند اللحظة t = 0 يساوي 2.5 mmol/min، فما هي قيمة السرعة الحجمية الابتدائية للتفاعل بوحدة mol/(L·min)؟",
    options_ar: [
      "0.025 mol/(L·min)",
      "0.25 mol/(L·min)",
      "2.5 × 10^-5 mol/(L·min)",
      "25 mol/(L·min)"
    ],
    correctAnswer_ar: "0.025 mol/(L·min)",
    explanation_ar: "قانون السرعة الحجمية هو: v_vol = (1 / V_tot) × (dx/dt). بالتحويل: V_tot = 0.1 L والميل dx/dt = 2.5 × 10^-3 mol/min. إذن: v_vol = (2.5 × 10^-3) / 0.1 = 0.025 mol/(L·min).",
    trapType: "calculation",
    commonTrap_ar: "نسيان تحويل الحجم من mL إلى L أو نسيان تحويل التقدم من mmol إلى mol قبل الحساب.",
    twinQuestion: {
      id: "twin_phys_kinetics_01",
      prompt_ar: "محلول تفاعلي حجمه V_tot = 200 mL. بلغ ميل المماس لتشكل غاز ثنائي أكسيد الكربون dn(CO2)/dt عند اللحظة t1 القيمة 4 mmol/s. إذا كان المعامل الستوكيومتري لـ CO2 هو 2، فما هي السرعة الحجمية للتفاعل v_vol عند تلك اللحظة بوحدة mol/(L·s)؟",
      options_ar: [
        "0.01 mol/(L·s)",
        "0.02 mol/(L·s)",
        "0.04 mol/(L·s)",
        "0.005 mol/(L·s)"
      ],
      correctAnswer_ar: "0.01 mol/(L·s)",
      explanation_ar: "العلاقة: v = (1/2) · (dn(CO2)/dt) = 2 mmol/s. السرعة الحجمية: v_vol = v / V_tot = (2 × 10^-3 mol/s) / 0.2 L = 0.01 mol/(L·s)."
    }
  },

  // ─── 2. الفيزياء: الدارات الكهربائية RC وثابت الزمن ───────────────────────
  {
    id: "diag_phys_rc_01",
    skillId: "physics_rc_rl_circuits",
    subjectId: "physics",
    streamId: "sciences_exp",
    difficulty: "intermediate",
    prompt_ar: "أثناء شحن مكثفة سعتها C عبر ناقل أومي مقاومته R بمولد توتر ثابت E، يُمثل ثابت الزمن τ بيولوجياً وفيزيائياً بأنه اللحظة التي يبلغ فيها التوتر بين طرفي المكثفة u_C(τ):",
    options_ar: [
      "0.63 من قيمته الأعظمية E",
      "0.37 من قيمته الأعظمية E",
      "0.50 من قيمته الأعظمية E",
      "القيمة الأعظمية E تماماً"
    ],
    correctAnswer_ar: "0.63 من قيمته الأعظمية E",
    explanation_ar: "حل معادلة الشحن هو u_C(t) = E(1 - e^(-t/τ)). عند t = τ تصبح العبارة: u_C(τ) = E(1 - e^-1) = E(1 - 0.37) = 0.63 E.",
    trapType: "misconception",
    commonTrap_ar: "الخلط بين مرحلة الشحن (تبلغ 63%) ومرحلة التفريغ (تتناقص إلى 37%).",
    twinQuestion: {
      id: "twin_phys_rc_01",
      prompt_ar: "في دارة تفريغ مكثفة مشحونة كلياً عبر ناقل أومي R، ما هي النسبة المئوية المتبقية من الشحنة الكهربائية q(t) عند اللحظة t = τ مقارنة بالشحنة الابتدائية Q0؟",
      options_ar: [
        "37%",
        "63%",
        "50%",
        "10%"
      ],
      correctAnswer_ar: "37%",
      explanation_ar: "في التفريغ: q(t) = Q0 · e^(-t/τ). عند t = τ تصبح q(τ) = Q0 · e^(-1) ≈ 0.37 Q0 أي 37%."
    }
  },

  // ─── 3. العلوم الطبيعية: النشاط الإنزيمي وتأثير pH ─────────────────────────
  {
    id: "diag_snv_enzyme_01",
    skillId: "snv_enzymes_kinetics_activity",
    subjectId: "natural_sciences",
    streamId: "sciences_exp",
    difficulty: "intermediate",
    prompt_ar: "عند وضع إنزيم وظيفي في وسط ذي درجة حموضة حمضية جداً (pH = 2) بعيداً عن درجة حموضته المثلى (pH = 7.4)، يعود انخفاض سرعة التفاعل إلى:",
    options_ar: [
      "اكتساب الوظائف الكيميائية لجذور الأحماض الأمينية في الموقع الفعال شحنات موجبة وتغير بنيته الفراغية",
      "فقدان البروتونات H+ وتأين المجموعات الكربوكسيلية فقط",
      "تفكك الروابط الببتيدية الأساسية بين الأحماض الأمينية بالكامل",
      "تشبع المواقع الفعالة للإنزيم بجزيئات الركيزة"
    ],
    correctAnswer_ar: "اكتساب الوظائف الكيميائية لجذور الأحماض الأمينية في الموقع الفعال شحنات موجبة وتغير بنيته الفراغية",
    explanation_ar: "في الوسط الحامضي تكتسب الوظائف الأمينية (-NH2) بروتونات وتتحول إلى (-NH3+)، مما يغير الشحنة الإجمالية للموقع الفعال ويخرب الروابط الشاردية وبالتالي يفقد الموقع الفعال تكامله البنيوي مع مادة التفاعل.",
    trapType: "misconception",
    commonTrap_ar: "الاعتقاد بأن تغير الـ pH يكسر الروابط الببتيدية (التخريب لا يمس الروابط التكافئية الببتيدية بل الروابط الهيدروجينية والشارودية الضعيفة).",
    twinQuestion: {
      id: "twin_snv_enzyme_01",
      prompt_ar: "ما هو التفسير الجزيئي لعدم استعادة الإنزيم لنشاطه النوعي بعد تسخينه لدرجة حرارة 80°C ثم إعادته لدرجة الحرارة المثلى (37°C)؟",
      options_ar: [
        "تخريب غير عكوس للبنية الفراغية للموقع الفعال لتكسر الروابط الهشة المسؤولة عن ثباته",
        "تثبيط عكوس مؤقت بسبب تباطؤ حركة الجزيئات",
        "تحول مادة التفاعل إلى نواتج سامة تثبط الإنزيم",
        "فقدان المرافق الإنزيمي مع بقاء بنية الإنزيم سليمة"
      ],
      correctAnswer_ar: "تخريب غير عكوس للبنية الفراغية للموقع الفعال لتكسر الروابط الهشة المسؤولة عن ثباته",
      explanation_ar: "الحرارة المرتفعة تفكك الروابط الضعيفة (الهيدروجينية والشاردية) التي تحافظ على البنية الفراغية الثلاثية، مما يؤدي إلى تغيير نهائي لا رجعة فيه في شكل الموقع الفعال."
    }
  },

  // ─── 4. العلوم الطبيعية: المناعة والتعرف المزدوج ───────────────────────────
  {
    id: "diag_snv_immunology_01",
    skillId: "snv_immunology_cellular_response",
    subjectId: "natural_sciences",
    streamId: "sciences_exp",
    difficulty: "advanced",
    prompt_ar: "تتحقق آلية 'التعرف المزدوج' التي تقوم بها الخلايا اللمفاوية التائية السامة (LTc) لاستهداف خلية مصابة عبر:",
    options_ar: [
      "تعرف مستقبل TCR في آن واحد على محدد المستضد وعلى جزيئة CMH-I للخلية المصابة",
      "تعرف الأجسام المضادة الغشائية على المستضد المنحل في البلازما",
      "تعرف مستقبل CD4 على معقد (CMH-II - ببتيد مستضدي)",
      "تعرف المستقبلات الغشائية للبلعمية على الجزء الثابت للجسم المضاد"
    ],
    correctAnswer_ar: "تعرف مستقبل TCR في آن واحد على محدد المستضد وعلى جزيئة CMH-I للخلية المصابة",
    explanation_ar: "التعرف المزدوج لـ LTc (الحاملة لـ CD8) يتطلب تعرف مستقبل TCR التائي نوعياً على الببتيد المستضدي المعروض، ومطابقة بروتين CD8 مع جزيئة التوافق النسيجي CMH من الصنف الأول المعبر عنها على الخلية المصابة.",
    trapType: "reading_error",
    commonTrap_ar: "الخلط بين CMH-I (الخاص بالخلايا العارضة للخلايا التائية القاتلة LT8/LTc) و CMH-II (الخاص بالخلايا العارضة للـ LT4).",
    twinQuestion: {
      id: "twin_snv_immunology_01",
      prompt_ar: "ما هو دور جزيئات البيرفورين (Perforine) المفرزة من طرف اللمفاويات التائية السامة LTc عند تماسها بالخلية المستهدفة؟",
      options_ar: [
        "تشكيل قنوات وثقوب في غشاء الخلية المصابة مما يحدث صدمة حلولية وموتها",
        "تثبيط تكاثر الفيروسات داخل الهيولى مباشرة دون مساس الغشاء",
        "تعديل سموم المستضد عبر تشكيل معقدات مناعية ترسبه",
        "تحفيز إنتاج الإنترلوكين 2 لتنشيط البالعات الكبيرة"
      ],
      correctAnswer_ar: "تشكيل قنوات وثقوب في غشاء الخلية المصابة مما يحدث صدمة حلولية وموتها",
      explanation_ar: "تتبلمر جزيئات البيرفورين في غشاء الخلية المستهدفة بوجود شوارد Ca2+ مشكلة ثقوباً تسمح بدخول الماء والشوارد وانفجار الخلية أو دخول إنزيمات الغرانزيم لتحفيز الموت المبرمج."
    }
  },

  // ─── 5. اللغة العربية: البناء الفكري ونمط النص ─────────────────────────────
  {
    id: "diag_arab_prose_01",
    skillId: "arabic_text_analysis_poetry_prose",
    subjectId: "arabic",
    streamId: "sciences_exp",
    difficulty: "intermediate",
    prompt_ar: "إذا تضمن النص مقالاً يعالج فيه الكاتب قضية علمية أو فكرية، واعتمد على الشرح، ذكر الأسباب والنتائج، واستعمال أدوات التعليل والروابط المنطقية مع غياب الذاتية، فإن النمط الغالب هو:",
    options_ar: [
      "نمط تفسيري",
      "نمط حجاجي",
      "نمط وصفي",
      "نمط سردي"
    ],
    correctAnswer_ar: "نمط تفسيري",
    explanation_ar: "النمط التفسيري يهدف إلى إعلام القارئ وشرح الظاهرة بموضوعية وتوظيف أدوات التعليل والتحليل دون محاولة إقناعه برأي شخصي كما في الحجاجي.",
    trapType: "misconception",
    commonTrap_ar: "الخلط بين النمط الحجاجي (الذي يعتمد على الإقناع ودحض رأي مقابل) والنمط التفسيري (الذي يعتمد على العرض والشرح المحايد).",
    twinQuestion: {
      id: "twin_arab_prose_01",
      prompt_ar: "إذا استعمل الكاتب أسلوب المقارنة والمقابلة، وأدوات التوكيد والشرط، بهدف تعديل موقف القارئ وإثبات صحة أطروحته ودحض فكرة الخصم، فما هو النمط المعتمد؟",
      options_ar: [
        "نمط حجاجي",
        "نمط تفسيري",
        "نمط إيعازي (توجيهي)",
        "نمط سردي"
      ],
      correctAnswer_ar: "نمط حجاجي",
      explanation_ar: "الهدف الإقناعي ودحض أطروحة الخصم وتوظيف الحجج والبراهين المنطقية هي الخصائص المميزة للنمط الحجاجي."
    }
  },

  // ─── 6. العلوم الإسلامية: مقاصد الشريعة والترتيب ───────────────────────────
  {
    id: "diag_islamic_purposes_01",
    skillId: "islamic_creed_sharia_analysis",
    subjectId: "islamic_studies",
    streamId: "sciences_exp",
    difficulty: "intermediate",
    prompt_ar: "تحريم تعاطي المخدرات والمسكرات في الشريعة الإسلامية يُصنف ضمن حفظ مقصد من مقاصد الشريعة الضرورية هو:",
    options_ar: [
      "حفظ العقل (من جانب العدم)",
      "حفظ الدين (من جانب الوجود)",
      "حفظ النفس (من جانب الوجود فقط)",
      "حفظ المال (من التحسينيات)"
    ],
    correctAnswer_ar: "حفظ العقل (من جانب العدم)",
    explanation_ar: "المخدرات تعطل التكليف والإدراك، فتحريمها يقع ضمن حفظ العقل، ومن 'جانب العدم' لأنه يدرأ المفاسد والأخطار التي تزيله.",
    trapType: "methodology",
    commonTrap_ar: "نسيان تحديد جهة الحفظ: هل هي من جانب الوجود (تثبيته وإنشاؤه) أم من جانب العدم (حمايته ودفع ما يفوته).",
    twinQuestion: {
      id: "twin_islamic_purposes_01",
      prompt_ar: "تشريع القصاص في جرائم القتل العمدي يخدم مباشرة الكليات الخمس بحفظ:",
      options_ar: [
        "حفظ النفس من جانب العدم",
        "حفظ النفس من جانب الوجود",
        "حفظ الدين من الحاجيات",
        "حفظ العرض من التحسينيات"
      ],
      correctAnswer_ar: "حفظ النفس من جانب العدم",
      explanation_ar: "القصاص يمنع القتل ويزجر المعتدي، فهو حفظ للنفس البشرية برد الأذى والجناية عنها (من جانب العدم)."
    }
  },

  // ─── 7. الفلسفة: منهجية التمييز بين الجدل والاستقصاء ───────────────────────
  {
    id: "diag_philo_methodology_01",
    skillId: "philosophy_methodology_essay_scientific",
    subjectId: "philosophy",
    streamId: "sciences_exp",
    difficulty: "intermediate",
    prompt_ar: "إذا ورد في الامتحان السؤال التالي: 'دافع عن صحة الأطروحة القائلة بأن الرياضيات يقينية في نتائجها'، فالطريقة المنهجية الإلزامية للمعالجة هي:",
    options_ar: [
      "طريقة الاستقصاء بالوضع",
      "طريقة الجدل",
      "طريقة المقارنة",
      "تحليل نص فلسفي"
    ],
    correctAnswer_ar: "طريقة الاستقصاء بالوضع",
    explanation_ar: "الأمر المباشر 'دافع' أو 'أثبت صدق الأطروحة' يفرض صراحة طريقة الاستقصاء بالوضع (طرح المشكلة، محاولة حل المشكلة بالدفاع عن الأطروحة وعرض منطق الخصوم وتفنيده، ثم الخاتمة بتأكيد مشروعية الدفاع).",
    trapType: "methodology",
    commonTrap_ar: "معالجة السؤال بطريقة الجدل ووضع موقفين متصارعين وتركيب، وهو ما يعرض الطالب لخسارة علامة المنهجية (الخروج عن النمط المطلوب).",
    twinQuestion: {
      id: "twin_philo_methodology_01",
      prompt_ar: "إذا صيغ السؤال الفلسفي كالتالي: 'هل لكل سبب مادي بالضرورة نتيجة حتمية لا تتخلف؟'، فما هي الطريقة المعتمدة؟",
      options_ar: [
        "طريقة الجدل",
        "طريقة الاستقصاء بالوضع",
        "طريقة الاستقصاء بالرفع",
        "طريقة المقارنة"
      ],
      correctAnswer_ar: "طريقة الجدل",
      explanation_ar: "أداة الاستفهام 'هل' المقترنة بقضية تحتمل موقفين فلسفيين متناقضين (الحتمية الكلاسيكية مقابل اللاحتمية في الميكروفيزياء) تقتضي المعالجة الجدلية."
    }
  },

  // ─── 8. التاريخ والجغرافيا: التعليق على الجداول ─────────────────────────────
  {
    id: "diag_hist_geo_table_comment_01",
    skillId: "hist_geo_methodology_terms_maps",
    subjectId: "history_geography",
    streamId: "sciences_exp",
    difficulty: "intermediate",
    prompt_ar: "عند التعليق على جدول إحصائي يوضح نسب المبادلات التجارية لدول الاتحاد الأوروبي، ما هي المنهجية الرسمية المعتمدة لنيل العلامة الكاملة؟",
    options_ar: [
      "تقديم الوثيقة + إبراز الملاحظات الرئيسية (التفاوت، التنوع، الضخامة) في مطّات + تقديم التعليل الجغرافي للاختلاف",
      "إعادة كتابة الأرقام والنسب المذكورة في الجدول على شكل فقرة سردية",
      "رسم منحنى بياني دون كتابة استنتاجات نصية",
      "ذكر تعريف الاتحاد الأوروبي وتاريخ تأسيسه فقط"
    ],
    correctAnswer_ar: "تقديم الوثيقة + إبراز الملاحظات الرئيسية (التفاوت، التنوع، الضخامة) في مطّات + تقديم التعليل الجغرافي للاختلاف",
    explanation_ar: "التعليق ليس قراءة للأرقام بل استنتاج الدلالات (التفاوت الكبير، احتكار السوق، قوة الاقتصاد) ثم تعليل الأسباب مع تقديم الوثيقة وطبيعتها ومصدرها.",
    trapType: "methodology",
    commonTrap_ar: "سرد الأرقام الحسابية كما هي دون استخراج الكلمات المفتاحية (تفاوت، تباين، هيمنة، ارتفاع ملحوظ).",
    twinQuestion: {
      id: "twin_hist_geo_table_comment_01",
      prompt_ar: "عند توقيع دول الثالوث الاقتصادي العالمي على خريطة العالم الصماء، ما هي الشروط الشكلية الثلاثة الإلزامية التي يحددها سلم التنقيط؟",
      options_ar: [
        "العنوان الواضح للخريطة، المفتاح الدقيق، والإطار الخارجي التحديدي",
        "تلوين كل قارات العالم واستعمال قلم الحبر الأحمر",
        "كتابة أسماء عواصم جميع الدول المجاورة",
        "تحديد خطوط الطول ودوائر العرض فقط"
      ],
      correctAnswer_ar: "العنوان الواضح للخريطة، المفتاح الدقيق، والإطار الخارجي التحديدي",
      explanation_ar: "المعايير الرسمية لرسم أو توقيع أي خريطة في البكالوريا تشترط: العنوان، المفتاح، الإطار، وتوجيه الشمال مع دقة الموضع الجغرافي."
    }
  }
];

/**
 * Convert DiagnosticPracticeItem array into standard PracticeQuestion items
 * (Each item creates a primary PracticeQuestion + a paired Retest Variant from twinQuestion)
 */
export function convertToPracticeQuestions(items: DiagnosticPracticeItem[]): PracticeQuestion[] {
  const result: PracticeQuestion[] = [];

  for (const item of items) {
    const diffMap: Record<string, 1 | 2 | 3> = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
    };

    const diff = diffMap[item.difficulty] || 2;

    // 1. Primary Practice Question
    const primaryOptions = (item.options_ar || []).map((opt, idx) => ({
      id: `opt-${idx + 1}`,
      text_ar: opt,
      text_fr: opt,
      ...(opt !== item.correctAnswer_ar ? { suspectedErrorType: "misunderstood_concept" as const } : {}),
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
      ...(opt !== item.twinQuestion.correctAnswer_ar ? { suspectedErrorType: "misunderstood_concept" as const } : {}),
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

export const NEW_SKILLS_PRACTICE_QUESTIONS: PracticeQuestion[] = convertToPracticeQuestions(newSkillsPracticeQuestions);
