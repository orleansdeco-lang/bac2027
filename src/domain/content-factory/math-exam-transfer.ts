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
