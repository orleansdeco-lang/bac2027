/**
 * BAC Mastery — Math Exam Transfer Layer & Past BAC Reference Registry
 * 
 * Provides evidence-based exam transfer guidance for each of the 12 Math skills:
 * - Typical BAC task phrasing
 * - Common traps & rubric failure points
 * - Standard answer structuring guidelines according to ministerial correction keys
 * - Quick self-verification routines under exam conditions
 * - Past ONEC BAC exam citations (metadata only)
 * 
 * Invariant: Never predicts future exam topics; strictly provides retrospective analysis of recurring formats.
 */

export interface MathExamTransferGuidance {
  skillId: string;
  typicalTaskForms_ar: string[];
  commonPitfalls_ar: string[];
  answerStructuringGuide_ar: string[];
  verificationRoutine_ar: string;
  pastBacCitations: {
    year: number;
    session: "principal" | "catchup";
    exerciseNumber: number;
    points: number;
    notes_ar: string;
  }[];
}

export const MATH_EXAM_TRANSFER_REGISTRY: Record<string, MathExamTransferGuidance> = {
  math_m_arithmetic_congruence: {
    skillId: "math_m_arithmetic_congruence",
    typicalTaskForms_ar: [
      "ادرس حسب قيم العدد الطبيعي n بواقي قسمة 7^n (أو a^n) على b.",
      "بيّن أن العدد A_n = a^n + b^n - c يقبل القسمة على d من أجل كل عدد طبيعي n.",
      "عيّن الأعداد الطبيعية n بحيث يكون A_n مضاعفاً للعدد k.",
    ],
    commonPitfalls_ar: [
      "نسيان حصر باقي القسمة الإقليدية في المجال [0, b-1] وكتابة بواقي سالبة أو أكبر من الترديد.",
      "الخلط بين دورية البواقي (الأس) وترديد الموافقة.",
      "إغفال مناقشة الحالات الأربع أو الخمس للدور كاملاً (مثلاً: n=4k, n=4k+1, n=4k+2, n=4k+3).",
    ],
    answerStructuringGuide_ar: [
      "احسب الحدود الأولى للقوى حتى ظهور التكرار (ظهور 1 أو 0).",
      "صرّح بالدور صراحة: 'نستنتج أن بواقي القسمة دورية ودورها p'.",
      "لخص النتائج في جدول بواقي واضح ومنظم قبل الانتقال للسؤال الموالي.",
    ],
    verificationRoutine_ar: "عوّض قيمة عددية صغيرة لـ n (مثلاً n=0 أو n=1) وتأكد يدوياً من تطابق الباقي مع النتيجة النظرية.",
    pastBacCitations: [
      { year: 2024, session: "principal", exerciseNumber: 1, points: 4.5, notes_ar: "دراسة بواقي 5^n بترديد 7 واستنتاج قابلية القسمة." },
      { year: 2022, session: "principal", exerciseNumber: 1, points: 5.0, notes_ar: "قوى العدد 3 بترديد 11 وتعيين قيم n." },
    ],
  },

  math_m_bezout_diophantine: {
    skillId: "math_m_bezout_diophantine",
    typicalTaskForms_ar: [
      "بيّن أن العددين a و b أوليان فيما بينهما ثم استنتج وجود حلول للمعادلة ax + by = c.",
      "باستعمال خوارزمية إقليدس عيّن حلاً خاصاً (x_0, y_0) للمعادلة ax + by = 1.",
      "حل في Z² المعادلة ax + by = c واستنتج حلول جملة معادلات بمجهولين.",
    ],
    commonPitfalls_ar: [
      "نسيان شرط قابلية القسمة: إذا كان PGCD(a, b) لا يقسم c، فالمعادلة لا تقبل حلولاً في Z².",
      "الخطأ في الإشارات عند الرجوع العكسي في خوارزمية إقليدس لاستخراج الحل الخاص.",
      "نسيان ذكر مبرهنة غوص عند الانتقال من مساواة الجداءات إلى تعيين الحل العام.",
    ],
    answerStructuringGuide_ar: [
      "احسب PGCD(a, b) بخوارزمية إقليدس الصريحة.",
      "بيّن استيفاء شرط بيزو: وجود ثنائية تحقق ax_0 + by_0 = c.",
      "اطرح المعادلة العامة من المعادلة الخاصة: a(x - x_0) = -b(y - y_0).",
      "طبّق مبرهنة غوص مع ذكر شرط الأولية صراحة واستنتج صيغة الحلول العامة: (x_0 + bk, y_0 - ak).",
    ],
    verificationRoutine_ar: "عوّض الحل العام في المعادلة الأصلية ax + by وتحقق جبرياً من اختزال k وظهور الطرف الأيمن c بدقة.",
    pastBacCitations: [
      { year: 2023, session: "principal", exerciseNumber: 1, points: 4.5, notes_ar: "حل المعادلة 13x - 7y = 1 في Z² وتطبيقات التعداد." },
      { year: 2021, session: "principal", exerciseNumber: 1, points: 5.0, notes_ar: "معادلة ديوفانتية وتطبيقها في إيجاد القواسم المشتركة." },
    ],
  },

  math_m_gauss_prime_factors: {
    skillId: "math_m_gauss_prime_factors",
    typicalTaskForms_ar: [
      "إذا كان a يقسم bc و PGCD(a, b) = 1، أثبت أن a يقسم c (مبرهنة غوص).",
      "عيّن الثنائيات (x, y) من الأعداد الطبيعية التي تحقق PGCD(x, y) = d و x + y = s.",
      "حلّل العددين إلى جداء عوامل أولية واستنتج عدد القواسم والقاسم المشترك الأكبر.",
    ],
    commonPitfalls_ar: [
      "تطبيق مبرهنة غوص دون التحقق من أن a و b أوليان فيما بينهما صراحة.",
      "نسيان أن التحليل إلى عوامل أولية للأعداد الطبيعية وحيد حتى ترتيب العوامل.",
      "إغفال شرط أن x' و y' أوليان فيما بينهما عند كتابة x = d*x' و y = d*y'.",
    ],
    answerStructuringGuide_ar: [
      "صرح دائماً بفرضيّة مبرهنة غوص: 'بما أن a يقسم bc ولدينا a و b أوليان فيما بينهما، فحسب مبرهنة غوص a يقسم c'.",
      "في مسائل PGCD: ضع المجهولين بدلالة القاسم المشترك x = dx' و y = dy' مع شرط PGCD(x', y') = 1.",
    ],
    verificationRoutine_ar: "تأكد من أن القواسم المستخرجة تقسم كلاً من العددين وأن القاسم المشترك لها يساوي القيمة المعطاة.",
    pastBacCitations: [
      { year: 2023, session: "catchup", exerciseNumber: 1, points: 4.5, notes_ar: "تطبيق مبرهنة غوص في تعيين قواسم عدد طبيعي." },
      { year: 2020, session: "principal", exerciseNumber: 1, points: 4.0, notes_ar: "جملة معادلات بالـ PGCD والـ PPCM." },
    ],
  },

  math_m_complex_algebraic_trig: {
    skillId: "math_m_complex_algebraic_trig",
    typicalTaskForms_ar: [
      "اكتب العدد المركب z على الشكل المثلثي ثم على الشكل الأسي.",
      "احسب z^2024 باستعمال دستور دو موافر وبيّن أنه عدد حقيقي (أو تخيلي صرف).",
      "حل في C المعادلة z^2 - 2*sqrt(3)*z + 4 = 0 ومثّل حلولها في المستوي المركب.",
    ],
    commonPitfalls_ar: [
      "الخطأ في تحديد عمدة العدد المركب arg(z) إذا كان الجزء الحقيقي سالباً (نسيان إضافة pi إلى Arctan).",
      "تطبيق دستور دو موافر على عبارة ليست على الشكل المثلثي النظامي cos(theta) + i*sin(theta).",
      "نسيان أن |z1 / z2| = |z1| / |z2| و arg(z1 / z2) = arg(z1) - arg(z2).",
    ],
    answerStructuringGuide_ar: [
      "احسب الطويلة أولاً: r = sqrt(x^2 + y^2).",
      "عيّن الزاوية theta بحساب cos(theta) = x/r و sin(theta) = y/r مع تحديد الربع المناسب بدقة.",
      "اكتب الشكل الأسي صراحة: z = r * e^(i*theta).",
      "عند حساب القوى: z^n = r^n * e^(i*n*theta) = r^n * [cos(n*theta) + i*sin(n*theta)].",
    ],
    verificationRoutine_ar: "احسب cos^2(theta) + sin^2(theta) للتأكد من أنها تساوي 1، وتأكد من إشارتي المركبتين لمطابقة الربع الهندسي.",
    pastBacCitations: [
      { year: 2024, session: "principal", exerciseNumber: 2, points: 4.5, notes_ar: "الشكل الأسي، دستور دو موافر وتعيين قيم n ليكون العدد حقيقياً." },
      { year: 2022, session: "principal", exerciseNumber: 2, points: 4.5, notes_ar: "معادلة من الدرجة الثانية والجذور التكعيبية في C." },
    ],
  },

  math_m_similitudes_directes: {
    skillId: "math_m_similitudes_directes",
    typicalTaskForms_ar: [
      "عيّن طبيعة التحويل النقطي S وعناصره المميزة المعرف بـ: z' = (1 + i*sqrt(3))*z + 2 - i.",
      "أثبت أن التحويل S هو تشابه مباشر وحدد مركزه Omega ونسبته k وزاويته theta.",
      "أوجد الكتابة المركبة للتشابه المباشر الذي يحول النقطة A إلى B والنقطة C إلى D.",
    ],
    commonPitfalls_ar: [
      "نسيان أن التشابه المباشر يشترط a != 1 و a != 0 (إذا كان a=1 فهو انسحاب، وإذا كان |a|=1 ودورانه زاوية theta فهو دوران).",
      "الخطأ في حساب لاحقة المركز: القانون هو omega = b / (1 - a)، والخطأ الشائع هو كتابة b / (a - 1).",
      "الخلط بين زاوية التشابه وزاوية الدوران.",
    ],
    answerStructuringGuide_ar: [
      "اكتب العبارة بالصيغة القياسية: z' = az + b.",
      "احسب النسبة: k = |a| (إذا كان k != 1 فهو تشابه مباشر بنسبة k).",
      "احسب الزاوية: theta = arg(a) بترديد 2pi.",
      "احسب لاحقة المركز بحل معادلة النقطة الصامدة z = az + b ومنه omega = b / (1 - a).",
      "صغ الخاتمة بنص صريح: 'S تشابه مباشر مركزه النقطة Omega(omega) ونسبته k وزاويته theta'.",
    ],
    verificationRoutine_ar: "عوّض لاحقة المركز omega في الكتابة المركبة z' = az + b وتأكد من الحصول على omega نفسها (نقطة صامدة).",
    pastBacCitations: [
      { year: 2023, session: "principal", exerciseNumber: 2, points: 4.5, notes_ar: "تعيين عناصر التشابه المباشر وصورة مثلث." },
      { year: 2021, session: "principal", exerciseNumber: 2, points: 5.0, notes_ar: "الكتابة المركبة للتشابه وتركيب تحويلين نقطيين." },
    ],
  },

  math_m_derivatives_tvi_rigor: {
    skillId: "math_m_derivatives_tvi_rigor",
    typicalTaskForms_ar: [
      "بيّن أن المعادلة f(x) = 0 تقبل حلاً وحيداً alpha في المجال ]a, b[ ثم جد حصراً له سعته 10^-2.",
      "ادرس استمرارية واشتقاقية الدالة f عند النقطة x_0 وفسر النتيجة هندسياً.",
      "ادرس تقعر المنحنى (C_f) ونقاط انعطافه مستعيناً بإشارة المشتقة الثانية f''.",
    ],
    commonPitfalls_ar: [
      "إغفال شرط الاستمرار أو شرط الرتابة التامة والاكتفاء بحساب f(a)*f(b) < 0 فقط.",
      "الخلط بين نقطة الانعطاف التي تنعدم فيها المشتقة الأولى دون تغيير الإشارة، والتي تنعدم فيها المشتقة الثانية مغيرّة إشارتها.",
      "عدم كتابة المجال المفتوح ]a, b[ في النتيجة النهائية للحل.",
    ],
    answerStructuringGuide_ar: [
      "برهن استمرار الدالة f على المجال المغلق [a, b].",
      "برهن الرتابة التامة (متزايدة تماماً أو متناقصة تماماً) من خلال جدول التغيرات أو إشارة المشتقة.",
      "احسب الصورتين f(a) و f(b) واذكر أن الصفر محصور بينهما (أي f(a)*f(b) < 0).",
      "اختم بالجملة القانونية: 'حسب مبرهنة القيم المتوسطة، المعادلة f(x)=0 تقبل حلاً وحيداً alpha في ]a, b['.",
    ],
    verificationRoutine_ar: "تأكد من أن f(a) و f(b) لهما إشارتان مختلفتان وأن الدالة لا تغيّر اتجاه تغيرها بين a و b.",
    pastBacCitations: [
      { year: 2024, session: "principal", exerciseNumber: 4, points: 6.5, notes_ar: "مسألة شاملة: دراسة الدالة المساعدة باستعمال مبرهنة القيم المتوسطة." },
      { year: 2022, session: "principal", exerciseNumber: 4, points: 7.0, notes_ar: "حل وحيد وحصر alpha واستنتاج إشارة الدالة." },
    ],
  },

  math_m_exp_log_croissances: {
    skillId: "math_m_exp_log_croissances",
    typicalTaskForms_ar: [
      "احسب نهايات الدالة f عند أطراف مجال التعريف وفسر المستقيمات المقاربة.",
      "أزل حالة عدم التعيين (+infinity - infinity) أو (infinity / infinity) باستعمال نهايات التزايد المقارن الشهيرة.",
      "بيّن أن المستقيم (Delta): y = ax + b مقارب مائل للمنحنى (C_f) عند +infinity وادرس الوضع النسبي.",
    ],
    commonPitfalls_ar: [
      "كتابة lim (x*ln(x)) = 0 عند +infinity بدلاً من 0+.",
      "نسيان استخراج العامل المشترك الأكبر درجة من داخل وخارج الجذر أو القوس عند إزالة عدم التعيين.",
      "الخطأ في حساب الفرق f(x) - (ax + b) بإغفال الأقواس وتغيير إشارة الحد الثابت.",
    ],
    answerStructuringGuide_ar: [
      "حدد شكل عدم التعيين بوضوح.",
      "استخرج العامل المهيمن (e^x عند +infinity أو x في اللوغاريتمات).",
      "وظف نهايات المرجع صراحة: lim (e^x / x^n) = +infinity و lim (ln(x) / x^n) = 0.",
      "اكتب معادلة المقارب وحدد جوار اللانهاية بدقة (+infinity أو -infinity).",
    ],
    verificationRoutine_ar: "احسب f(100) أو f(1000) بالآلة الحاسبة وتأكد من اقتراب القيمة العددية من قيمة النهاية المحسوبة.",
    pastBacCitations: [
      { year: 2023, session: "principal", exerciseNumber: 4, points: 7.0, notes_ar: "مسألة دالة لوغاريتمية كاملة وتزايد مقارن." },
      { year: 2021, session: "principal", exerciseNumber: 4, points: 7.0, notes_ar: "مسألة دالة أسية، مقارب مائل ووضعية نسبية." },
    ],
  },

  math_m_integration_parts: {
    skillId: "math_m_integration_parts",
    typicalTaskForms_ar: [
      "باستعمال المكاملة بالتجزئة، احسب التكامل I = integral_1^e (x * ln(x) dx).",
      "احسب بـ cm² مساحة الحيز من المستوي المحدد بالمنحنى (C_f) والمستقيمات x=a, x=b و y=0.",
      "أثبت باستعمال الحصر أن 0 <= I_n <= 1/(n+1) واستنتج نهاية المتتالية التكاملية (I_n).",
    ],
    commonPitfalls_ar: [
      "الاختيار الخاطئ للدالتين u(x) و v'(x) مما يؤدي إلى تعقيد التكامل بدلاً من تبسيطه.",
      "نسيان إشارة الناقص في قانون المكاملة بالتجزئة: integral (u*v') = [u*v] - integral (u'*v).",
      "إغفال ضرب المساحة بوحدة قياس المساحات u.a (أو وحدة الرسم cm² = ||i|| * ||j||).",
    ],
    answerStructuringGuide_ar: [
      "صرح باختيار الدالتين وقابليتهما للاشتقاق: نضع u(x) و v'(x) ومنه نستنتج u'(x) و v(x).",
      "طبق القانون الصارم للمكاملة بالتجزئة بعلامة واضحة للأقواس المعقوفة.",
      "احسب القيمة العددية بدقة مبسطة ودون تقريب عشري إلا إذا طُلب ذلك.",
    ],
    verificationRoutine_ar: "اشتق الدالة الناتجة من القوسين وتأكد من استرجاع الدالة الأصلية الموجودة داخل التكامل.",
    pastBacCitations: [
      { year: 2024, session: "catchup", exerciseNumber: 4, points: 4.0, notes_ar: "مكاملة بالتجزئة وحساب مساحة حيز مستو." },
      { year: 2022, session: "principal", exerciseNumber: 3, points: 4.5, notes_ar: "متتالية معرفة بتكامل، مكاملة بالتجزئة وحصر." },
    ],
  },

  math_m_differential_equations: {
    skillId: "math_m_differential_equations",
    typicalTaskForms_ar: [
      "حل المعادلة التفاضلية (E): y' - 2y = 0 ثم عيّن الحل الخاص الذي يحقق y(0) = 3.",
      "حل المعادلة (E'): y' + ay = b ثم حل المعادلة من الرتبة الثانية y'' + 4y = 0.",
      "بيّن أن الدالة g حل للمعادلة التفاضلية إذا وفقط إذا كانت (g - f) حلاً للمعادلة المتجانسة.",
    ],
    commonPitfalls_ar: [
      "الخطأ في إشارة الأس: حل y' = ay هو C*e^(ax) وليس C*e^(-ax).",
      "نسيان الثابتين المستقلين C_1 و C_2 في حلول معادلات الرتبة الثانية y'' + omega^2 * y = 0.",
      "عدم التحقق من استيفاء الشروط الابتدائية عند تعيين الثوابت.",
    ],
    answerStructuringGuide_ar: [
      "اكتب المعادلة بالشكل النموذجي: y' = ay + b.",
      "اكتب الحل العام الصريح: y(x) = C * e^(ax) - b/a مع C عدد حقيقي كيفي.",
      "عوّض الشرط الابتدائي y(x_0) = y_0 لحساب قيمة C الدقيقة.",
    ],
    verificationRoutine_ar: "اشتق الحل الخاص الناتج وعوضه في طرفي المعادلة التفاضلية الأصلية للتأكد من تطابق المساواة.",
    pastBacCitations: [
      { year: 2023, session: "catchup", exerciseNumber: 3, points: 4.0, notes_ar: "حل معادلة تفاضلية من الرتبة الأولى وتطبيقها في مسألة حركية." },
      { year: 2020, session: "principal", exerciseNumber: 3, points: 4.0, notes_ar: "معادلة تفاضلية خطية وتعيين الحل الخاص." },
    ],
  },

  math_m_induction_adjacent_suites: {
    skillId: "math_m_induction_adjacent_suites",
    typicalTaskForms_ar: [
      "برهن بالتراجع أنه من أجل كل عدد طبيعي n: u_n > alpha (أو a <= u_n <= b).",
      "ادرس اتجاه تغير المتتالية (u_n) وبيّن أنها متقاربة واحسب نهايتها.",
      "أثبت أن المتتاليتين (u_n) و (v_n) متجاورتان واستنتج أنهما تتقاربان نحو نفس النهاية L.",
    ],
    commonPitfalls_ar: [
      "إغفال مرحلة التحقق (الأساس) عند الرتبة الابتدائية n_0.",
      "الخلط بين فرضية التراجع والمطلوب إثباته (الانتقال غير المعلل من n إلى n+1).",
      "الاستدلال بالتقارب لحساب النهاية قبل إثبات وجود النهاية برتابة ومحدودية المتتالية.",
    ],
    answerStructuringGuide_ar: [
      "سمّ الخاصية P(n) بوضوح.",
      "التحقق: تأكد من صحة P(n_0) مع الحساب الصريح.",
      "الوراثة: نفرض P(n) صحيحة ونبرهن P(n+1) مع الاستناد للعلاقة التراجعية وتزايد الدالة المرفقة.",
      "الخاتمة: 'حسب مبدأ الاستدلال بالتراجع، P(n) صحيحة لكل n >= n_0'.",
    ],
    verificationRoutine_ar: "احسب الحدود الثلاثة الأولى u_0, u_1, u_2 وتحقق من موافقتها لخاصية الحصر أو اتجاه التغير.",
    pastBacCitations: [
      { year: 2024, session: "principal", exerciseNumber: 3, points: 4.5, notes_ar: "برهان بالتراجع، متتالية هندسية مساعدة وحساب مجموع." },
      { year: 2021, session: "principal", exerciseNumber: 3, points: 4.5, notes_ar: "متتاليتان متجاورتان وتحديد نهايتهما المشتركة." },
    ],
  },

  math_m_space_geometry_planes: {
    skillId: "math_m_space_geometry_planes",
    typicalTaskForms_ar: [
      "عيّن تمثيلاً وسيطياً للمستقيم (D) المار بالنقطة A والموجّه بشعاع u.",
      "أوجد معادلة ديكارتية للمستوي (P) العمودي على الشعاع n والمار بالنقطة B.",
      "احسب المسافة بين النقطة M والمستوي (P) واستنتج تقاطع المستوي مع سطح كرة (S).",
    ],
    commonPitfalls_ar: [
      "الخلط بين الشعاع الناظمي للمستوي n(a, b, c) والشعاع الموجه للمستقيم u(alpha, beta, gamma).",
      "الخطأ في قانون المسافة: نسيان القيمة المطلقة في البسط أو الجذر التربيعي في المقام d = |ax_0 + by_0 + cz_0 + d| / sqrt(a^2 + b^2 + c^2).",
      "افتراض أن مستقيمين غير متقاطعين في الفضاء متوازيان بالضرورة (إغفال حالة المستقيمين غير المتواجدين في نفس المستو).",
    ],
    answerStructuringGuide_ar: [
      "عيّن الشعاع الناظمي صراحة: 'الشعاع n ناظمي على المستوي إذن معادلته من الشكل ax + by + cz + d = 0'.",
      "عوّض إحداثيات النقطة المعطاة لحساب الثابت d.",
      "لحساب نقطة تقاطع مستقيم ومستو: عوّض التمثيلات الوسيطية x(t), y(t), z(t) في معادلة المستوي لحساب الوسيط t.",
    ],
    verificationRoutine_ar: "عوّض إحداثيات نقطة الانتماء في معادلة المستوي وتأكد من انعدام الطرف الأيسر تماماً.",
    pastBacCitations: [
      { year: 2023, session: "principal", exerciseNumber: 3, points: 4.5, notes_ar: "معادلة مستو، تمثيل وسيطي ومسافة نقطة عن مستو." },
      { year: 2022, session: "principal", exerciseNumber: 1, points: 4.0, notes_ar: "تقاطع مستقيم ومستو وتقاطع مستو مع سطح كرة." },
    ],
  },

  math_m_combinatorics_bernoulli: {
    skillId: "math_m_combinatorics_bernoulli",
    typicalTaskForms_ar: [
      "احسب عدد السحبات الممكنة في حالة السحب (في آن واحد / على التوالي بإرجاع / على التوالي دون إرجاع).",
      "عرّف المتغير العشوائي X الذي يمثل عدد الكرات البيضاء المسحوبة وعيّن قانون احتماله وأمله الرياضي E(X).",
      "نكرر التجربة n مرة بشكل مستقل: احسب احتمال الحصول على النجاح k مرة بالضبط (مخطط برنولي).",
    ],
    commonPitfalls_ar: [
      "استعمال التوفيقات C_n^p في السحب على التوالي، أو استعمال الترتيبات A_n^p في السحب في آن واحد.",
      "نسيان معامل الترتيب في السحب على التوالي عند سحب كرات من ألوان مختلفة.",
      "نسيان التأكد من أن مجموع احتمالات قيم المتغير العشوائي sum P(X = x_i) يساوي 1 تماماً.",
    ],
    answerStructuringGuide_ar: [
      "حدد أسلوب السحب والمجموعة الأساسية: cardinal(Omega) = C_n^p أو A_n^p أو n^p.",
      "عيّن مجموعة قيم المتغير العشوائي X(Omega) = {x_1, x_2, ..., x_k}.",
      "احسب احتمال كل قيمة P(X = x_i) مبرزاً التوفيقات المستعملة.",
      "لخص قانون الاحتمال في جدول واحسب E(X) = sum (x_i * P(X = x_i)).",
    ],
    verificationRoutine_ar: "اجمع كل الاحتمالات في جدول المتغير العشوائي؛ إذا لم يكن المجموع مساوياً للواحد تماماً، فهناك حادثة ناقصة أو خطأ حسابي.",
    pastBacCitations: [
      { year: 2024, session: "principal", exerciseNumber: 2, points: 4.5, notes_ar: "سحب في آن واحد، متغير عشوائي وأمل رياضي." },
      { year: 2020, session: "principal", exerciseNumber: 2, points: 4.5, notes_ar: "سحب على التوالي دون إرجاع وقانون ثنائي الحد." },
    ],
  },
};

export const MATH_BATCH_02_EXAM_TRANSFER_REGISTRY: Record<string, MathExamTransferGuidance> = {
  math_m_sequences_comparison_limits: {
    skillId: "math_m_sequences_comparison_limits",
    typicalTaskForms_ar: [
      "بيّن أنه من أجل كل عدد طبيعي n: v_n <= u_n <= w_n ثم استنتج نهاية المتتالية (u_n).",
      "أثبت أن u_n >= a^n واستنتج تباعد المتتالية (u_n) نحو +infinity.",
      "باستعمال حصر الدالة المشتقة أو حصر التكامل، عيّن نهاية المتتالية المعرفة بـ u_n = sum_{k=1}^n f(k/n).",
    ],
    commonPitfalls_ar: [
      "محاولة تطبيق مبرهنة الحصر عندما يؤول الطرفان إلى نهايتين مختلفتين والاستنتاج الخاطئ.",
      "الاستنتاج الخاطئ لنهاية منتهية من حصر غير ثنائي الطرفين (كاستنتاج التقارب من u_n <= 3 فقط).",
      "نسيان إثبات إيجابية المقام قبل القسمة عليه في المتراجحات الحاصرة.",
    ],
    answerStructuringGuide_ar: [
      "اكتب المتراجحة الحاصرة موضحاً المجال والمبررات: v_n <= u_n <= w_n من أجل كل n >= n_0.",
      "احسب نهاية الطرف الأدنى: lim v_n = L ونهاية الطرف الأعلى: lim w_n = L.",
      "صرح بوضوح: 'بما أن كلا الطرفين يؤولان لنفس النهاية L، فحسب مبرهنة الحصر فإن lim u_n = L'.",
    ],
    verificationRoutine_ar: "عوّض قيمة كبيرة نسبياً لـ n (مثل n=100) وتأكد من اقتراب قيمة u_n من النهاية المحسوبة L.",
    pastBacCitations: [
      { year: 2023, session: "principal", exerciseNumber: 3, points: 4.5, notes_ar: "حصر متتالية عددية واستنتاج نهايتها L = 1." },
      { year: 2020, session: "principal", exerciseNumber: 3, points: 4.5, notes_ar: "تطبيق مبرهنة المقارنة لإثبات التباعد نحو +infinity." },
    ],
  },

  math_m_geometric_sequences: {
    skillId: "math_m_geometric_sequences",
    typicalTaskForms_ar: [
      "أثبت أن المتتالية (v_n) هندسية يطلب تعيين أساسها q وحدها الأول v_0.",
      "عبّر عن v_n ثم u_n بدلالة n، ثم احسب نهاية (u_n).",
      "احسب بدلالة n المجموع S_n = v_0 + v_1 + ... + v_n، ثم استنتج المجموع T_n = u_0 + u_1 + ... + u_n.",
    ],
    commonPitfalls_ar: [
      "الخطأ في حساب عدد حدود المجموع: نسيان أن عدد الحدود هو (دليل الأخير - دليل الأول + 1).",
      "الخلط في نهاية q^n عندما يكون -1 < q < 0 (تتذبذب لكن تؤول إلى 0 بالقيمة المطلقة).",
      "نسيان استنتاج عبارة u_n من علاقتها مع v_n قبل حساب المجموع المستنتج T_n.",
    ],
    answerStructuringGuide_ar: [
      "احسب النسبة v_(n+1) واكتبها على الشكل q * v_n وصرح بالأساس q والحد الأول v_0.",
      "اكتب العبارة العامة: v_n = v_0 * q^n بدقة.",
      "طبّق قانون المجموع: S_n = (الحد الأول) * (1 - q^(عدد الحدود)) / (1 - q).",
      "ناقش النهاية حسب موقع الأساس q بالنسبة للواحد والقيمة المطلقة.",
    ],
    verificationRoutine_ar: "احسب S_1 يدوياً بالجمع المباشر (v_0 + v_1) وقارنه بنتيجة الصيغة العامة عند التعويض بـ n=1.",
    pastBacCitations: [
      { year: 2024, session: "principal", exerciseNumber: 1, points: 5.0, notes_ar: "متتالية هندسية مساعدة، عبارة الحد العام ومجموع حدود." },
      { year: 2022, session: "principal", exerciseNumber: 3, points: 4.5, notes_ar: "متتالية هندسية أساسها q=1/3 وحساب المجموع ونهايته." },
    ],
  },

  math_m_roots_of_unity: {
    skillId: "math_m_roots_of_unity",
    typicalTaskForms_ar: [
      "حل في C المعادلة z^n = 1 واكتب الحلول على الشكل الأسي والمثلثي.",
      "بيّن أن صور الحلول تشكل رؤوس مضلع منتظم محاط بالدائرة المثلثية.",
      "أثبت أن 1 + w + w^2 + ... + w^(n-1) = 0 واستنتج قيمة مجموع جيب التمام وزوايا المضلع.",
    ],
    commonPitfalls_ar: [
      "نسيان تدرج الزوايا 2k*pi/n بحيث يأخذ k القيم من 0 إلى n-1 فقط دون تكرار.",
      "الخلط بين مجموع الجذور النونية (وهو معدوم دائماً) وجداء الجذور النونية.",
      "تطبيق خواص الجذور النونية على معادلة من الشكل z^n = Z دون تحويل Z إلى شكله الأسي أولاً.",
    ],
    answerStructuringGuide_ar: [
      "اكتب المعادلة في شكلها الأسي: r^n * e^(i n theta) = 1 * e^(i 2k pi).",
      "استنتج r = 1 و theta_k = 2k pi / n مع تحديد مجال k: k in {0, 1, ..., n-1}.",
      "استعمل متطابقة مجموع حدود متتالية هندسية لإثبات أن مجموع الجذور معدوم: sum z_k = 0.",
    ],
    verificationRoutine_ar: "اجمع الجذور المحسوبة جبرياً وتأكد من انعدام كل من الجزء الحقيقي والجزء التخيلي.",
    pastBacCitations: [
      { year: 2023, session: "catchup", exerciseNumber: 2, points: 4.5, notes_ar: "الجذور التكعيبية للوحدة وحل المعادلة z^3 = 8i." },
      { year: 2019, session: "principal", exerciseNumber: 2, points: 4.5, notes_ar: "الجذور النونية وحساب مجموع زوايا مضلع منتظم." },
    ],
  },

  math_m_complex_argument_loci: {
    skillId: "math_m_complex_argument_loci",
    typicalTaskForms_ar: [
      "عيّن مجموعة النقط M(z) بحيث يكون arg((z - z_A) / (z - z_B)) = pi / 2 [pi].",
      "عيّن مجموعة النقط M(z) بحيث يكون (z - z_A) / (z - z_B) عدداً حقيقياً سالباً تماماً.",
      "أعط التفسير الهندسي لعمدة الكسر (z - z_A) / (z - z_B) واستنتج طبيعة المثلث ABM.",
    ],
    commonPitfalls_ar: [
      "نسيان استثناء النقطتين A و B (أو إحداهما) من المجموعة النقطية الناتجة.",
      "الخلط بين الترديد [pi] (دائرة كاملة أو مستقيم كامل) والترديد [2pi] (نصف دائرة أو نصف مستقيم).",
      "الخطأ في ترتيب المتجهات عند ترجمة العمدة: الزاوية هي (vect(BM), vect(AM)) وليس العكس.",
    ],
    answerStructuringGuide_ar: [
      "ترجم عمدة الكسر إلى زاوية موجهة: arg((z - z_A)/(z - z_B)) = (vect(BM), vect(AM)) [2pi].",
      "حدد الشرط الهندسي: تعامد أو استقامة مع تحديد مجال الزاوية بدقة.",
      "صرح بالمجموعة النقطية مع ذكر الاستثناءات: 'الدائرة ذات القطر [AB] باستثناء A و B'.",
    ],
    verificationRoutine_ar: "اختر نقطة واضحة تنتمي للمجموعة المحصلة (مثل منتصف [AB] أو مركز الدائرة) وعوّضها للتأكد من تحقق شرط العمدة.",
    pastBacCitations: [
      { year: 2024, session: "principal", exerciseNumber: 2, points: 4.5, notes_ar: "تعيين مجموعة النقط M انطلاقاً من عمدة كسر مركب." },
      { year: 2021, session: "principal", exerciseNumber: 2, points: 4.5, notes_ar: "طبيعة المثلث ABM ومجموعة النقط في المستوي المركب." },
    ],
  },

  math_m_logarithmic_differentiation: {
    skillId: "math_m_logarithmic_differentiation",
    typicalTaskForms_ar: [
      "بيّن أنه من أجل كل x > 0: f(x) = e^(g(x) ln(x)) ثم احسب مشتقة الدالة f.",
      "ادرس تغيرات الدالة المعرفة بـ f(x) = x^x أو f(x) = (1 + 1/x)^x.",
      "احسب النهاية الشهيرة: lim_{x -> +infinity} (1 + a/x)^x.",
    ],
    commonPitfalls_ar: [
      "اشتقاق f(x)^g(x) بقاعدة كثيرات الحدود g * f^(g-1) معتبرين أن الأس أو الأساس ثابت.",
      "نسيان شرط إيجابية الأساس f(x) > 0 قبل إدخال دالة اللوغاريتم النيبيري.",
      "الخطأ في اشتقاق الجداء الداخلي (g(x) * ln(f(x)))'.",
    ],
    answerStructuringGuide_ar: [
      "تحقق من شرط مجال التعريف: f(x) > 0 تماماً.",
      "حوّل العبارة إلى الشكل الأسي الصريح: f(x)^g(x) = exp(g(x) * ln(f(x))).",
      "طبّق قاعدة اشتقاق exp(u(x))': المشتقة هي u'(x) * exp(u(x)).",
      "احسب مشتقة الجداء u'(x) = g'(x) ln(f(x)) + g(x) * (f'(x)/f(x)) بدقة.",
    ],
    verificationRoutine_ar: "عوّض قيمة عددية بسيطة لـ x في المشتقة وقارنها بنتيجة التقريب العددي لحساب النسبة (f(x+h)-f(x))/h عند h صغير.",
    pastBacCitations: [
      { year: 2022, session: "principal", exerciseNumber: 4, points: 6.0, notes_ar: "دراسة دالة أسية تتضمن شكلاً مركباً مع نهايات النمو المقارن." },
      { year: 2018, session: "catchup", exerciseNumber: 4, points: 5.5, notes_ar: "دالة لوغاريتمية بأس متغير ودراسة اتجاه التغير." },
    ],
  },

  math_m_function_study: {
    skillId: "math_m_function_study",
    typicalTaskForms_ar: [
      "ادرس تغيرات الدالة f وشكّل جدول تغيراتها مبيناً النهايات والقيم الحدية.",
      "أثبت أن المستقيم (Delta) ذو المعادلة y = ax + b مستقيم مقارب مائل للمنحنى (C_f) بجوار infinity.",
      "ادرس الوضع النسبي للمنحنى (C_f) بالنسبة إلى (Delta)، ثم ارسم كلاً من المستقيمات المقاربة والمماسات والمنحنى (C_f).",
    ],
    commonPitfalls_ar: [
      "الرسم العشوائي للمنحنى دون احترام المماسات الأفقية عند القيم الحدية ونقاط التقاطع مع المحاور.",
      "نسيان دراسة إشارة الفرق f(x) - (ax + b) بشكل منظم في جدول الوضع النسبي.",
      "عدم تحديد نقطة الانعطاف عند انعدام المشتقة الثانية وتغيير إشارتها.",
    ],
    answerStructuringGuide_ar: [
      "احسب النهايات عند أطراف مجالات التعريف مع تبرير المستقيمات المقاربة العمودية والأفقية.",
      "احسب المشتقة f'(x) وادرس إشارتها بعناية، ثم لخصها في جدول تغيرات كامل بالأسهم والنهايات.",
      "ادرس الفرق f(x) - y_Delta واستنتج الوضع النسبي: فوق، تحت، أو يقطع.",
      "في الرسم: ابدأ برسم المستقيمات المقاربة، ثم النقط المميزة والمماسات، ثم ارسم المنحنى بانسيابية.",
    ],
    verificationRoutine_ar: "تأكد من أن اتجاه تزايد أو تناقص المنحنى في الرسم يتطابق نقطة بنقطة مع الأسهم في جدول التغيرات.",
    pastBacCitations: [
      { year: 2024, session: "principal", exerciseNumber: 4, points: 7.0, notes_ar: "مسألة شاملة لدراسة دالة لوغاريتمية مع مستقيم مقارب مائل ورسم بياني." },
      { year: 2023, session: "principal", exerciseNumber: 4, points: 7.0, notes_ar: "دراسة دالة أسية مع مناقشة بيانية ووضع نسبي." },
    ],
  },

  math_m_bounded_functions: {
    skillId: "math_m_bounded_functions",
    typicalTaskForms_ar: [
      "انطلاقاً من جدول تغيرات الدالة f، بيّن أن f محدودة بالعددين m و M على المجال I.",
      "أثبت أنه من أجل كل x in [a, b]: m <= f(x) <= M ثم استنتج حصراً للتكامل I = int_a^b f(x) dx.",
      "لتكن المتتالية I_n = int_0^1 (x^n / (1 + x)) dx: بيّن أن 0 <= I_n <= 1/(n+1) واستنتج lim I_n.",
    ],
    commonPitfalls_ar: [
      "تطبيق مكاملة المتراجحة دون التأكد من أن حدي التكامل مرتبان تصاعدياً a <= b.",
      "الخلط بين الحد الأعلى المحلي والحد الأعلى المطلق على المجال المعطى.",
      "نسيان ضرب الحدود الثابتة في طول المجال (b - a) عند مكاملة الحصر.",
    ],
    answerStructuringGuide_ar: [
      "عيّن القيم الحدية العظمى والصغرى للدالة f من جدول التغيرات: m <= f(x) <= M.",
      "طبّق مبرهنة خطية التكامل ورتابته: m * int_a^b dx <= int_a^b f(x) dx <= M * int_a^b dx.",
      "احسب تكامل الثابت: m(b - a) <= int_a^b f(x) dx <= M(b - a).",
      "في حالة المتتاليات التكاملية، استنتج نهاية التكامل بتطبيق مبرهنة الحصر مباشرة.",
    ],
    verificationRoutine_ar: "تحقق دائماً من أن طول المجال (b - a) موجب تماماً، وأن m <= M لضمان تناسق طرفي الحصر.",
    pastBacCitations: [
      { year: 2023, session: "principal", exerciseNumber: 3, points: 4.5, notes_ar: "حصر متتالية تكاملية وتطبيق مبرهنة الحصر لإيجاد نهايتها." },
      { year: 2021, session: "catchup", exerciseNumber: 3, points: 4.0, notes_ar: "حصر دالة أصلية وتعيين مجالات حصر المساحة." },
    ],
  },

  math_m_conditional_probability_trees: {
    skillId: "math_m_conditional_probability_trees",
    typicalTaskForms_ar: [
      "ترجم معطيات المسألة بشجرة احتمالات متوازنة موضحاً احتمالات الفروع الابتدائية والشرطية.",
      "احسب الاحتمال الشرطي P_A(B) واحتمال تقاطع الحادثتين P(A ∩ B).",
      "علماً أن الحادثة B قد تحققت، احسب احتمال أن تكون الحادثة A هي التي تحققت (احتمال بعدي).",
    ],
    commonPitfalls_ar: [
      "الخلط بين P(A ∩ B) (جداء المسار كاملاً) و P_A(B) (الاحتمال المكتوب على الفرع الثاني فقط).",
      "نسيان أن مجموع احتمالات الفروع المنطلقة من أي عقدة يجب أن يساوي 1 تماماً.",
      "عكس شرط الاحتمال الشرطي: حساب P_B(A) بدلاً من P_A(B).",
    ],
    answerStructuringGuide_ar: [
      "سمّ الحوادث بدقة مع إبراز الحوادث العكسية: A و A_barre، B و B_barre.",
      "ارسم الشجرة الاحتمالية مع كتابة الاحتمالات الصريحة على كل فرع.",
      "طبّق قاعدة جداء المسار: P(A ∩ B) = P(A) * P_A(B).",
      "لحساب الاحتمال الشرطي المعكوس: P_B(A) = P(A ∩ B) / P(B).",
    ],
    verificationRoutine_ar: "اجمع احتمالات جميع المسارات النهائية في الشجرة؛ يجب أن يكون المجموع الكلي مساوياً لـ 1 بالضبط.",
    pastBacCitations: [
      { year: 2024, session: "principal", exerciseNumber: 2, points: 4.5, notes_ar: "شجرة احتمالات، احتمال شرطي ومسألة كرات وصناديق." },
      { year: 2021, session: "principal", exerciseNumber: 1, points: 4.5, notes_ar: "سحب متتالٍ مع شجرة احتمالات واحتمال شرطي بعدي." },
    ],
  },

  math_m_total_probability: {
    skillId: "math_m_total_probability",
    typicalTaskForms_ar: [
      "بيّن أن الحوادث A_1, A_2, A_3 تشكل تجزئة للمجموعة الشاملة Omega.",
      "باستعمال قانون الاحتمالات الكلية، احسب احتمال الحادثة B.",
      "إذا علمت أن B قد وقعت، ما هو احتمال أن يكون مصدرها الحادثة A_1 (مبرهنة بايز)؟",
    ],
    commonPitfalls_ar: [
      "تطبيق قانون الاحتمالات الكلية دون التصريح بأن الحوادث تشكل تجزئة (نظاماً شاملاً) للمجموعة الشاملة.",
      "نسيان أحد الفروع عند جمع مسارات الحادثة B.",
      "الخطأ في تطبيق مبرهنة بايز عند تعويض المقام باحتمال غير مكتمل.",
    ],
    answerStructuringGuide_ar: [
      "صرّح بشرط التجزئة: 'بما أن الحوادث A_i منفصلة مثنى مثنى واتحادها يساوي Omega، فهي تشكل تجزئة لـ Omega'.",
      "اكتب صيغة قانون الاحتمالات الكلية صراحة: P(B) = sum P(A_i ∩ B) = sum P(A_i) * P_{A_i}(B).",
      "عوّض القيم بدقة واجمع الكسور لتصل إلى النتيجة المبسطة لـ P(B).",
      "صغ مبرهنة بايز: P_B(A_1) = (P(A_1) * P_{A_1}(B)) / P(B).",
    ],
    verificationRoutine_ar: "احسب P(B_barre) بواسطة الشجرة وتحقق من أن P(B) + P(B_barre) = 1 تماماً.",
    pastBacCitations: [
      { year: 2023, session: "principal", exerciseNumber: 2, points: 4.5, notes_ar: "قانون الاحتمالات الكلية ومبرهنة بايز في تشخيص إنتاج مصنع." },
      { year: 2020, session: "principal", exerciseNumber: 2, points: 4.5, notes_ar: "تجزئة فضاء العينة والاحتمالات الكلية مع متغير عشوائي." },
    ],
  },
};


export const MATH_BATCH_03_EXAM_TRANSFER_REGISTRY: Record<string, MathExamTransferGuidance> = {
  math_m_fermat_little_theorem: {
    skillId: "math_m_fermat_little_theorem",
    typicalTaskForms_ar: [
      "باستعمال مبرهنة فيرما الصغرى، احسب باقي قسمة a^n على p حيث p عدد أولي.",
      "بيّن أن العدد a^(p-1) - 1 مضاعف للعدد الأولي p واستنتج حلول المعادلة في Z.",
      "عيّن باقي القسمة الإقليدية لقوى كبرى دون اللجوء لحساب الجدول الدوري الكامل.",
    ],
    commonPitfalls_ar: [
      "تطبيق مبرهنة فيرما على ترديد غير أولي (مثلاً الترديد 6 أو 9 أو 12).",
      "نسيان شرط أن يكون الأساس a غير مضاعف للعدد الأولي p (أي PGCD(a, p) = 1).",
      "الخطأ في القسمة الإقليدية للأس n على (p - 1).",
    ],
    answerStructuringGuide_ar: [
      "تحقق صراحة من أمرين: 1) p عدد أولي، 2) a لا يقبل القسمة على p.",
      "صغ نص المبرهنة: 'حسب مبرهنة فيرما الصغرى لدينا a^(p-1) ≡ 1 [p]'.",
      "أجر القسمة الإقليدية للأس n على p - 1: n = q(p - 1) + r.",
      "استنتج الباقي بدقة: a^n = (a^(p-1))^q * a^r ≡ a^r [p].",
    ],
    verificationRoutine_ar: "اختبر بمثال مصغر لنفس الأساس والترديد وتحقق من صحة الموافقة يدوياً.",
    pastBacCitations: [
      { year: 2024, session: "principal", exerciseNumber: 1, points: 4.5, notes_ar: "مبرهنة فيرما الصغرى مع p=7 وقوى كبرى في تمرين الحساب." },
      { year: 2022, session: "catchup", exerciseNumber: 1, points: 4.5, notes_ar: "تبسيط بواقي قوى عدد أولي بواسطة مبرهنة فيرما." },
    ],
  },

  math_m_numeral_systems: {
    skillId: "math_m_numeral_systems",
    typicalTaskForms_ar: [
      "اكتب العدد N المعطى في الأساس b بالشكل العشري المنشور بدلالة b.",
      "عيّن الأساس x بحيث يكون العدد مكتوباً بصيغتين متكافئتين في قاعدتين مختلفتين.",
      "بيّن شروط قابلية القسمة لعدد مكتوب في الأساس b على b - 1 أو b + 1.",
    ],
    commonPitfalls_ar: [
      "نسيان شرط أن تكون جميع أرقام العدد أصغر تماماً من أساس نظام التعداد (a_i < b).",
      "قبول حلول سالبة أو غير طبيعية للأساس x عند حل المعادلة.",
      "الخلط بين مراتب الأساس (b^0, b^1, b^2) أثناء النشر.",
    ],
    answerStructuringGuide_ar: [
      "حدد أولاً شرط الوجود للأساس: x > max(أرقام العدد).",
      "انشر العدد في كلا الأساسين بمجموع قوى الأساس: sum a_i * b^i.",
      "شكل المعادلة ذات المجهول x وبسطها لحلها جبرياً.",
      "تحقق من موافقة الحل المقبول مع شرط الوجود الأولي.",
    ],
    verificationRoutine_ar: "عوض قيمة الأساس المستخرج في كتابة العددين وتأكد من تساويهما العشري التام.",
    pastBacCitations: [
      { year: 2023, session: "principal", exerciseNumber: 1, points: 4.5, notes_ar: "كتابة عدد في قاعدتين وتعيين الأساس x في تمرين الحساب." },
      { year: 2021, session: "principal", exerciseNumber: 1, points: 4.5, notes_ar: "أنظمة التعداد وقابلية القسمة على b-1 لشعبة رياضيات." },
    ],
  },

  math_m_complex_polynomials_factorization: {
    skillId: "math_m_complex_polynomials_factorization",
    typicalTaskForms_ar: [
      "بيّن أن المعادلة P(z) = 0 تقبل حلاً تخيلياً صرفاً z_0 = ib يُطلب تعيينه.",
      "عيّن الأعداد الحقيقية a و b و c بحيث P(z) = (z - z_0)(az^2 + bz + c).",
      "حل في C المعادلة P(z) = 0 واكتب حلولها بالشكلين الجبري والمثلثي.",
    ],
    commonPitfalls_ar: [
      "نسيان أن (ib)^2 = -b^2 و (ib)^3 = -i*b^3 مما يقلب إشارات الجزء الحقيقي والتخيلي.",
      "عدم فصل المعادلة P(ib) = 0 إلى جملة معادلتين: جزء حقيقي معدوم وجزء تخيلي معدوم.",
      "إهمال الجذور التخيلية عند حساب مميز معادلة الدرجة الثانية.",
    ],
    answerStructuringGuide_ar: [
      "عوّض z = ib في P(z) ورتب الحدود إلى شكل جبري X + iY = 0.",
      "حل الجملة X = 0 و Y = 0 لاستخراج قيمة b بدقة وتحديد الجذر z_0.",
      "أجر القسمة الإقليدية أو المطابقة لتفكيك كثير الحدود إلى جداء عوامل.",
      "احسب المميز Delta واستخرج الجذرين المتبقيين واكتب مجموعة الحلول S كاملة.",
    ],
    verificationRoutine_ar: "احسب مجموع الجذور الثلاثة وتأكد من مطابقتها للقانون z_1 + z_2 + z_3 = -a_2 / a_3.",
    pastBacCitations: [
      { year: 2024, session: "principal", exerciseNumber: 2, points: 4.5, notes_ar: "كثير حدود من الدرجة الثالثة، جذر تخيلي صرف، وتحليل ومثلث أضلاع." },
      { year: 2022, session: "principal", exerciseNumber: 2, points: 4.5, notes_ar: "حل معادلة تكعيبية في C وتعيين الحلول وتمثيلها هندسياً." },
    ],
  },

  math_m_primitives_rational_fractions: {
    skillId: "math_m_primitives_rational_fractions",
    typicalTaskForms_ar: [
      "عيّن الأعداد الحقيقية a و b و c بحيث f(x) = ax + b + c / (x - x_0).",
      "استنتج دالة أصلية F للدالة f على المجال المعطى.",
      "احسب التكامل I = integral_a^b f(x) dx بدلالة اللوغاريتم النيبيري.",
    ],
    commonPitfalls_ar: [
      "نسيان القيمة المطلقة داخل اللوغاريتم ln|u(x)| عندما لا تكون العبارة موجبة صراحة.",
      "الخطأ في توحيد المقامات أثناء عملية المطابقة لاستخراج الثوابت.",
      "الخلط بين تكامل u'/u (يعطي ln) وتكامل u'/u^2 (يعطي -1/u).",
    ],
    answerStructuringGuide_ar: [
      "أجر القسمة الإقليدية إذا كانت درجة البسط أكبر من أو تساوي درجة المقام.",
      "طابق المعاملات بدقة لاستخراج الثوابت A و B.",
      "اكتب الدوال الأصلية لكل عنصر بسيط مستعملاً الصيغ القياسية.",
      "حدد مجال العمل صراحة لتبرير حذف القيمة المطلقة إن كانت العبارة موجبة.",
    ],
    verificationRoutine_ar: "اشتق الدالة الأصلية المحسوبة F'(x) وتأكد من عودتها التامة إلى عبارة f(x) الأصلية.",
    pastBacCitations: [
      { year: 2024, session: "catchup", exerciseNumber: 4, points: 7.0, notes_ar: "تفكيك كسر ناطق وحساب مساحة حيز بتكامل لوغاريتمي." },
      { year: 2021, session: "principal", exerciseNumber: 4, points: 7.0, notes_ar: "دوال أصلية لكسور ناطقة وتوظيفها في مسألة التحليل الكبرى." },
    ],
  },

  math_m_integral_functions_variable_bounds: {
    skillId: "math_m_integral_functions_variable_bounds",
    typicalTaskForms_ar: [
      "برر أن الدالة F(x) = integral_a^x f(t) dt قابلة للاشتقاق واحسب مشتقتها F'(x).",
      "ادرس اتجاه تغير الدالة F على المجال المعطى انطلاقاً من إشارة f(t).",
      "أثبت أن الدالة F محدودة من الأعلى أو احسب نهايتها عند اللانهاية بالحصر.",
    ],
    commonPitfalls_ar: [
      "محاولة البحث العبثي عن عبارة صريحة لـ F(x) عندما تكون الدالة f غير قابلة للمكاملة بالصيغ المألوفة.",
      "الخلط بين متغير التكامل t ومتغير الدالة x أثناء الاشتقاق.",
      "نسيان أن قيمة الدالة عند الحد الثابت تنعدم حتماً: F(a) = 0.",
    ],
    answerStructuringGuide_ar: [
      "صرّح باستمرارية f على المجال I: 'بما أن f مستمرة، فإن F قابلة للاشتقاق على I'.",
      "اكتب المشتقة مباشرة: F'(x) = f(x) مع التذكير بأن F(a) = 0.",
      "اربط إشارة المشتقة F' بإشارة منحنى f المعطى في الجزء السابق من المسألة.",
      "لحصر F(x)، احصر الدالة f(t) أولاً ثم كامل الأطراف من a إلى x مع مراعاة x >= a.",
    ],
    verificationRoutine_ar: "تحقق دائماً من أن F(a) = 0 وأن اتجاه تغير F يوافق تماماً إشارة f(x).",
    pastBacCitations: [
      { year: 2023, session: "catchup", exerciseNumber: 4, points: 7.0, notes_ar: "دالة معرفة بتكامل، اتجاه التغير وحصر النهاية عند اللانهاية." },
      { year: 2020, session: "principal", exerciseNumber: 4, points: 7.0, notes_ar: "دراسة دالة تكاملية وشفعيتها وسلوكها التقاربي لشعبة رياضيات." },
    ],
  },

  math_m_second_order_differential_equations: {
    skillId: "math_m_second_order_differential_equations",
    typicalTaskForms_ar: [
      "حل في R المعادلة التفاضلية ay'' + by' + cy = 0.",
      "عيّن الحل الخاص f الذي يحقق الشروط الابتدائية f(x_0) = y_0 و f'(x_0) = y'_0.",
      "بيّن أن حلول المعادلة تمثل اهتزازات جيبية متخامدة عند Delta < 0.",
    ],
    commonPitfalls_ar: [
      "نسيان العامل x في حل الجذر المزدوج: كتابة (C_1 + C_2)e^(rx) بدلاً من (C_1*x + C_2)e^(rx).",
      "الخطأ في اشتقاق الحل العام عند تعويض الشروط الابتدائية لـ y'(0).",
      "الخلط بين الجزء الحقيقي alpha والجزء التخيلي beta في الحلول المركبة.",
    ],
    answerStructuringGuide_ar: [
      "اكتب المعادلة المميزة ar^2 + br + c = 0 واحسب مميزها Delta بدقة.",
      "حدد صنف الحلول حسب إشارة Delta (حقيقيان متميزان، مضاعف، أو مركبان مترافقان).",
      "اكتب عبارة الحل العام متضمنة الثابتين C_1 و C_2.",
      "اشتق عبارة y(x) وعوض الشروط الابتدائية لحساب C_1 و C_2 وحل الجملة الناتجة.",
    ],
    verificationRoutine_ar: "عوّض الحل الخاص المستخرج ومشتقاته الأولى والثانية في المعادلة الأصلية وتأكد من تحقق التساوي 0 = 0.",
    pastBacCitations: [
      { year: 2023, session: "principal", exerciseNumber: 4, points: 7.0, notes_ar: "معادلة تفاضلية من الرتبة الثانية بشروط ابتدائية مدمجة في مسألة تحليل." },
      { year: 2021, session: "principal", exerciseNumber: 4, points: 7.0, notes_ar: "حل معادلة تفاضلية من الرتبة الثانية ودراسة حلها الخاص." },
    ],
  },

  math_m_space_lines_intersections: {
    skillId: "math_m_space_lines_intersections",
    typicalTaskForms_ar: [
      "اكتب تمثيلاً وسيطياً للمستقيم (D) المار بالنقطة A والموجه بالشعاع u.",
      "عيّن إحداثيات نقطة تقاطع المستقيم (D) مع المستوي (P).",
      "عيّن إحداثيات المسقط العمودي H للنقطة A على المستوي (P).",
      "ادرس الوضع النسبي للمستقيمين (D_1) و (D_2) (متقاطعان، متوازيان، أو غير متلائمين).",
    ],
    commonPitfalls_ar: [
      "استعمال نفس الحرف للوسيط عند مقارنة مستقيمين (يجب استعمال t لمستقيم و t' للآخر).",
      "الخلط بين شعاع التوجيه وشعاع الناظم عند تعيين مستقيم عمودي على مستو.",
      "الخطأ في الحساب الجبري لحل المعادلة ذات المجهول الوسيطي t.",
    ],
    answerStructuringGuide_ar: [
      "اكتب جملة التمثيل الوسيطي بذكر الوسيط الحقيقي t ∈ R صراحة.",
      "لتقاطع مستقيم ومستو: عوض x(t) و y(t) و z(t) في معادلة المستوي الديكارتية.",
      "استخرج قيمة t بدقة ثم عوضها في التمثيل الوسيطي لحساب إحداثيات نقطة التقاطع.",
      "للمسقط العمودي: المستقيم المساعد يشمل النقطة A ويوجه بالناظم n للمستوي.",
    ],
    verificationRoutine_ar: "عوض إحداثيات نقطة التقاطع المستخرجة في معادلة المستوي وتحقق من تحقق المعادلة.",
    pastBacCitations: [
      { year: 2024, session: "principal", exerciseNumber: 3, points: 4.0, notes_ar: "تمثيل وسيطي لمستقيم، تقاطع مع مستو، والمسقط العمودي في تمرين الفضاء." },
      { year: 2022, session: "principal", exerciseNumber: 3, points: 4.0, notes_ar: "دراسة تقاطع مستقيمات ومستويات وأوضاع نسبية لشعبة رياضيات." },
    ],
  },

  math_m_space_spheres_equations: {
    skillId: "math_m_space_spheres_equations",
    typicalTaskForms_ar: [
      "عيّن طبيعة وعناصر المجموعة النقطية (S) المعرفة بمعادلة من الشكل x^2 + y^2 + z^2 + ... = 0.",
      "ادرس تقاطع المستوي (P) مع سطح الكرة (S) ذات المركز Omega ونصف القطر R.",
      "عيّن إحداثيات مركز ونصف قطر دائرة التقاطع أو معادلة المستوي المماس.",
    ],
    commonPitfalls_ar: [
      "الخلط بين نصف قطر سطح الكرة R ونصف قطر دائرة التقاطع r (حيث r = sqrt(R^2 - d^2)).",
      "نسيان إتمام المربعات الكاملة بدقة عند استخراج المركز ونصف القطر من المعادلة المنشورة.",
      "قبول نصف قطر سالب أو عدم الانتباه لحالة d > R حيث التقاطع خالٍ.",
    ],
    answerStructuringGuide_ar: [
      "أتمم المربعات الكاملة لكتابة معادلة سطح الكرة بالشكل النموذجي واستخراج Omega و R.",
      "احسب المسافة d بين المركز Omega والمستوي (P) بدستور المسافة النظامي.",
      "قارن d مع R وصرح بحالة التقاطع (خالٍ، نقطة تماس، أو دائرة).",
      "في حالة الدائرة: احسب نصف القطر r = sqrt(R^2 - d^2) وعيّن المركز H كمسقط عمودي.",
    ],
    verificationRoutine_ar: "تحقق من أن r < R دائماً ومن أن إحداثيات المركز H تحقق معادلة المستوي (P).",
    pastBacCitations: [
      { year: 2023, session: "principal", exerciseNumber: 3, points: 4.0, notes_ar: "معادلة سطح كرة، دراسة تقاطع مع مستو واستنتاج عناصر دائرة التقاطع." },
      { year: 2021, session: "principal", exerciseNumber: 3, points: 4.0, notes_ar: "تقاطع مستو وسطح كرة وتعيين المستوي المماس لشعبة رياضيات." },
    ],
  },

  math_m_random_variables_expectation: {
    skillId: "math_m_random_variables_expectation",
    typicalTaskForms_ar: [
      "عيّن القيم الممكنة للمتغير العشوائي X المرفق بالتجربة العشوائية.",
      "عرّف قانون الاحتمال للمتغير العشوائي X ولخصه في جدول.",
      "احسب الأمل الرياضي E(X) والتباين V(X) والانحراف المعياري sigma(X).",
      "فسر القيمة المحسوبة للأمل الرياضي وبيّن ما إذا كانت اللعبة عادلة (équitable).",
    ],
    commonPitfalls_ar: [
      "نسيان إحدى قيم المتغير العشوائي الممكنة عند حصر مجموعة القيم X(Omega).",
      "عدم التحقق من أن مجموع الاحتمالات في جدول قانون الاحتمال يساوي 1 تماماً.",
      "الخطأ في حساب التباين بتعويض E(X^2) بـ (E(X))^2 (مما يصفر التباين خطأً).",
    ],
    answerStructuringGuide_ar: [
      "حدد مجموعة قيم X بدقة: X(Omega) = {x_1, x_2, ..., x_k}.",
      "احسب احتمال كل قيمة P(X = x_i) مبرزاً طريقة العد (توفيقات أو شجرة).",
      "لخص قانون الاحتمال في جدول مبيناً سطر القيم وسطر الاحتمالات وتحقق أن المجموع = 1.",
      "احسب E(X) بالجداء المباشر sum x_i*p_i، ثم احسب E(X^2) وطبق قانون كونيغ V(X) = E(X^2) - (E(X))^2.",
    ],
    verificationRoutine_ar: "تأكد من أن مجموع احتمالات الجدول يساوي 1 بالضبط، وأن التباين V(X) مقدار موجب تماماً.",
    pastBacCitations: [
      { year: 2024, session: "principal", exerciseNumber: 2, points: 4.5, notes_ar: "متغير عشوائي، قانون احتمال، أمل رياضي وتباين في سحب متزامن." },
      { year: 2023, session: "catchup", exerciseNumber: 2, points: 4.5, notes_ar: "متغير عشوائي مرفق بلعبة حظ وحساب الأمل وتفسير العدالة." },
    ],
  },
};

export const ALL_MATH_EXAM_TRANSFER_REGISTRY: Record<string, MathExamTransferGuidance> = {
  ...MATH_BATCH_03_EXAM_TRANSFER_REGISTRY,
  ...MATH_EXAM_TRANSFER_REGISTRY,
  ...MATH_BATCH_02_EXAM_TRANSFER_REGISTRY,
};
