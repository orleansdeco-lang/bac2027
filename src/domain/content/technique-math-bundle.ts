/**
 * BAC 2026/2027 Production Engineering Bundle
 * Stream: Technique Mathématiques (تقني رياضي) - Batch 04
 * Subjects: Génie Civil, Génie Mécanique, Génie Électrique, Génie des Procédés
 * File: src/domain/content/technique-math-bundle.ts
 */

import { Skill } from "./types";

export interface EngineeringBundlePayload {
  skillId: string;
  branch: 'civil' | 'mecanique' | 'electrique' | 'procedes';
  subject: string;
  unitAr: string;
  titleAr: string;
  bloomLevel: 'apply' | 'analyze';
  theory: {
    summary: string;
    keyTakeaways: string[];
    commonPitfalls: string[];
  };
  practice: {
    question: string;
    options: Array<{ id: string; text: string; isCorrect: boolean }>;
    explanationStepByStep: string;
  };
  isomorphicRetest: {
    question: string;
    options: Array<{ id: string; text: string; isCorrect: boolean }>;
    repairGuide: string;
  };
}

export const TECHNIQUE_MATH_ALIASES: Record<string, string> = {
  tm_gc_structural_statics: "tm_civil_beam_reactions",
  tm_gm_kinematic_mechanisms: "tm_meca_dimensional_chains",
  tm_ge_combinational_logic: "tm_elec_sequential_counters",
  tm_gp_chemical_reactors: "tm_proc_chemical_kinetics_rate",
};

export const TECHNIQUE_MATH_BUNDLE: Record<string, EngineeringBundlePayload> = {
  "tm_civil_beam_reactions": {
    "skillId": "tm_civil_beam_reactions",
    "branch": "civil",
    "subject": "genie_civil",
    "unitAr": "الميكانيك المطبقة ومقاومة المواد (RDM)",
    "titleAr": "العوارض المحددة سكونياً: حساب ردود الأفعال في المساند",
    "bloomLevel": "apply",
    "theory": {
      "summary": "تحديد ردود أفعال المساند في رافدة أفقية محددة سكونياً (مسند بسيط ومسند مضاعف) تخضع لحمولات مركزية F وحمولات موزعة بانتظام q بتطبيق مبدأ السكون العام (PFS): مجموع القوى الأفقية = 0، مجموع القوى الشاقولية = 0، ومجموع عزوم القوى بالنسبة لأي نقطة = 0.",
      "keyTakeaways": [
        "معادلات التوازن الاستاتيكي الثلاث: $\\sum F_x = 0$ ، $\\sum F_y = 0$ ، و $\\sum M_{/A} = 0$.",
        "المسند البسيط (Appui simple): يقدم رد فعل شاقولي واحد فقط عمودي على سطح الارتكاز $V_B$.",
        "المسند المضاعف (Appui double / Articulation): يقدم مركبتين لرد الفعل: أفقية $H_A$ وشاقولية $V_A$.",
        "الحمولة الموزعة بانتظام $q$ (N/m أو kN/m) على طول $L$: تعوض بحمولة مركزية مكافئة $Q = q \\cdot L$ تؤثر في مركز ثقل المجال (في المنتصف $L/2$)."
      ],
      "commonPitfalls": [
        "نسيان ذراع القوة عند حساب العزم $\\sum M$ أو وضع الإشارة غير الصحيحة لدوران عقارب الساعة.",
        "نسيان تعويض الحمولة الموزعة في منتصف طولها ووضعها خطأً في طرف العارضة."
      ]
    },
    "practice": {
      "question": "رافدة أفقية محددة سكونياً AB طولها $L = 6\\text{ m}$ تستند على مسند مضاعف عند A ومسند بسيط عند B. تخضع لحمولة موزعة بانتظام $q = 4\\text{ kN/m}$ على كامل طولها، وحمولة مركزية شاقولية نحو الأسفل $F = 6\\text{ kN}$ عند النقطة C التي تبعد $2\\text{ m}$ عن A. ما هي قيمة رد الفعل الشاقولي $V_B$ في المسند B؟",
      "options": [
        {
          "id": "opt_a",
          "text": "$V_B = 14\\text{ kN}$",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "$V_B = 16\\text{ kN}$",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "$V_B = 10\\text{ kN}$",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "$V_B = 18\\text{ kN}$",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "1) حساب الحمولة الموزعة المكافئة: $Q = q \\times L = 4 \\times 6 = 24\\text{ kN}$ وتؤثر عند المسافة $x = 3\\text{ m}$ من A.\n2) كتابة معادلة مجموع العزوم بالنسبة للمسند A: $\\sum M_{/A} = 0 \\implies (F \\times 2) + (Q \\times 3) - (V_B \\times 6) = 0$.\n3) التعويض الحسابي: $(6 \\times 2) + (24 \\times 3) - 6 V_B = 0 \\implies 12 + 72 = 6 V_B$.\n4) $6 V_B = 84 \\implies V_B = 84 / 6 = 14\\text{ kN}$."
    },
    "isomorphicRetest": {
      "question": "بناءً على المعطيات السابقة ($F = 6\\text{ kN}$ و $Q = 24\\text{ kN}$ و $V_B = 14\\text{ kN}$)، ما هي قيمة رد الفعل الشاقولي $V_A$ عند المسند A؟",
      "options": [
        {
          "id": "iso_a",
          "text": "$V_A = 16\\text{ kN}$",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "$V_A = 14\\text{ kN}$",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "$V_A = 24\\text{ kN}$",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "$V_A = 30\\text{ kN}$",
          "isCorrect": false
        }
      ],
      "repairGuide": "نطبق معادلة التوازن الشاقولي: $\\sum F_y = 0 \\implies V_A + V_B - F - Q = 0 \\implies V_A = 6 + 24 - 14 = 16\\text{ kN}$."
    }
  },
  "tm_civil_tension_compression_stress": {
    "skillId": "tm_civil_tension_compression_stress",
    "branch": "civil",
    "subject": "genie_civil",
    "unitAr": "مقاومة المواد: التحريضات البسيطة",
    "titleAr": "الشد والانضغاط البسيط: حساب الإجهاد الناظمي وشرط المقاومة",
    "bloomLevel": "apply",
    "theory": {
      "summary": "دراسة سلوك قضيب مستقيم خاضع لقوة ناظمية محورية N (شد إذا كانت N موجبة خارجة، وانضغاط إذا كانت سالبة داخلة)، حساب الإجهاد الناظمي $\\sigma$، الاستطالة المطلقة $\\Delta L$ بقانون هوك، والتحقق من شرط المقاومة والأمان.",
      "keyTakeaways": [
        "الإجهاد الناظمي: $\\sigma = \\frac{N}{S}$ حيث N القوة الناظمية و S مساحة المقطع العرضي.",
        "شرط المقاومة: يجب ألا يتجاوز الإجهاد الفعلي الإجهاد المسموح به: $\\sigma \\le \\bar{\\sigma} = \\frac{R_e}{s}$ (حيث $R_e$ حد المرونة و s معامل الأمان).",
        "قانون هوك والتمدد: $\\Delta L = \\frac{N \\cdot L_0}{E \\cdot S}$ حيث E هو معامل يونغ (معامل المرونة الطولي)."
      ],
      "commonPitfalls": [
        "عدم توحيد الوحدات (مثلاً استخدام N بالكيلونيوتن ومساحة S بالمتر المربع دون التحويل إلى الميغاباسكال MPa أو N/mm²)."
      ]
    },
    "practice": {
      "question": "قضيب فولاذي دائري المقطع مساحته $S = 200\\text{ mm}^2$ وطوله $L_0 = 2\\text{ m}$ يخضع لقوة شد محورية $N = 40\\text{ kN}$. إذا كان حد المرونة للفولاذ $R_e = 400\\text{ MPa}$ ومعامل الأمان $s = 1.6$، هل القضيب محقق لشرط المقاومة؟",
      "options": [
        {
          "id": "opt_a",
          "text": "نعم، محقق لأن الإجهاد الفعلي $\\sigma = 200\\text{ MPa}$ وهو أقل من الإجهاد المسموح به $\\bar{\\sigma} = 250\\text{ MPa}$.",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "لا، غير محقق لأن الإجهاد الفعلي يتجاوز 300 MPa.",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "لا، لأن الاستطالة تتجاوز طول القضيب.",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "نعم، لأن الإجهاد الناظمي منعدم في حالة الشد.",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "1) حساب الإجهاد الناظمي: $N = 40\\text{ kN} = 40,000\\text{ N}$. إذن: $\\sigma = N / S = 40,000 / 200 = 200\\text{ N/mm}^2 = 200\\text{ MPa}$.\n2) حساب الإجهاد المسموح به: $\\bar{\\sigma} = R_e / s = 400 / 1.6 = 250\\text{ MPa}$.\n3) المقارنة: بما أن $\\sigma = 200 < 250 = \\bar{\\sigma}$، فإن شرط المقاومة محقق بأمان."
    },
    "isomorphicRetest": {
      "question": "ما هي الاستطالة المطلقة $\\Delta L$ لنفس القضيب إذا علمت أن معامل يونغ $E = 2 \\times 10^5\\text{ MPa}$ وطوله $2000\\text{ mm}$؟",
      "options": [
        {
          "id": "iso_a",
          "text": "$\\Delta L = 2\\text{ mm}$",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "$\\Delta L = 0.2\\text{ mm}$",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "$\\Delta L = 4\\text{ mm}$",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "$\\Delta L = 20\\text{ mm}$",
          "isCorrect": false
        }
      ],
      "repairGuide": "$\\Delta L = (\\sigma \\cdot L_0) / E = (200 \\times 2000) / (2 \\times 10^5) = 400,000 / 200,000 = 2\\text{ mm}$."
    }
  },
  "tm_meca_dimensional_chains": {
    "skillId": "tm_meca_dimensional_chains",
    "branch": "mecanique",
    "subject": "genie_mecanique",
    "unitAr": "سلاسل الأبعاد والتفاوتات الوظيفية (Cotation fonctionnelle)",
    "titleAr": "السلسلة البعدية: معادلات التوافق وحساب بعد الخلوص الأقصى والأدنى",
    "bloomLevel": "apply",
    "theory": {
      "summary": "تركيب وحساب سلسلة الأبعاد لسهم شرطي (خلوص $J_a$)؛ تمثيل المتجهات الموجبة (المعاكسة لجهة السهم الشرطي) والمتجهات السالبة (الموافقة لجهة السهم)، وحساب البعد الاسمي والتفاوتات العظمى والدنيا للخلوص.",
      "keyTakeaways": [
        "السهم الشرطي $J_a$: يرسم بخط مضاعف وله اتجاه محدد.",
        "قاعدة المتجهات: المتجه الشرطي = مجموع المتجهات ذات الجهة المعاكسة له ناقص مجموع المتجهات التي تسير في نفس اتجاهه.",
        "الخلوص الأقصى: $J_{a\\max} = \\sum A_{i\\max} \\text{ (المعاكسة)} - \\sum A_{k\\min} \\text{ (الموافقة)}$.",
        "الخلوص الأدنى: $J_{a\\min} = \\sum A_{i\\min} \\text{ (المعاكسة)} - \\sum A_{k\\max} \\text{ (الموافقة)}$."
      ],
      "commonPitfalls": [
        "عكس إشارات الحدود عند حساب الخلوص الأدنى أو طرح الأبعاد القصوى من بعضها مباشرة."
      ]
    },
    "practice": {
      "question": "سلسلة أبعاد ذات مركبتين تحدد الخلوص $J_a$ بالمعادلة: $J_a = A_1 - A_2$. إذا كان $A_1 = 50^{\\pm 0.2}\\text{ mm}$ و $A_2 = 48^{\\pm 0.1}\\text{ mm}$، فما هي قيمة الخلوص الأقصى $J_{a\\max}$؟",
      "options": [
        {
          "id": "opt_a",
          "text": "$J_{a\\max} = 2.3\\text{ mm}$",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "$J_{a\\max} = 2.0\\text{ mm}$",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "$J_{a\\max} = 2.1\\text{ mm}$",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "$J_{a\\max} = 1.7\\text{ mm}$",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "1) تعيين القيم القصوى والدنيا للمركبات:\n$A_{1\\max} = 50 + 0.2 = 50.2\\text{ mm}$ و $A_{1\\min} = 49.8\\text{ mm}$.\n$A_{2\\max} = 48 + 0.1 = 48.1\\text{ mm}$ و $A_{2\\min} = 48 - 0.1 = 47.9\\text{ mm}$.\n2) تطبيق قانون الخلوص الأقصى: $J_{a\\max} = A_{1\\max} - A_{2\\min} = 50.2 - 47.9 = 2.3\\text{ mm}$."
    },
    "isomorphicRetest": {
      "question": "بناءً على نفس المعطيات السابقة، كم تبلغ قيمة الخلوص الأدنى $J_{a\\min}$؟",
      "options": [
        {
          "id": "iso_a",
          "text": "$J_{a\\min} = 1.7\\text{ mm}$",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "$J_{a\\min} = 1.9\\text{ mm}$",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "$J_{a\\min} = 2.3\\text{ mm}$",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "$J_{a\\min} = 1.5\\text{ mm}$",
          "isCorrect": false
        }
      ],
      "repairGuide": "$J_{a\\min} = A_{1\\min} - A_{2\\max} = 49.8 - 48.1 = 1.7\\text{ mm}$."
    }
  },
  "tm_meca_simple_bending_rdm": {
    "skillId": "tm_meca_simple_bending_rdm",
    "branch": "mecanique",
    "subject": "genie_mecanique",
    "unitAr": "مقاومة المواد: الانحناء البسيط المستوي",
    "titleAr": "الانحناء البسيط: حساب عزم الانحناء الأقصى والتحقق من الأمان",
    "bloomLevel": "apply",
    "theory": {
      "summary": "دراسة الرافدة المعرضة لعزم انحناء $M_f(x)$، تحديد موضع المقطع الحرج الذي ينعدم فيه الجهد القاطع $T(x) = 0$ حيث يكون العزم أعظمياً $M_{f\\max}$، وحساب الإجهاد الناظمي الأقصى $\\sigma_{\\max} = \\frac{M_{f\\max}}{I_G / v}$.",
      "keyTakeaways": [
        "العلاقة بين الجهد القاطع وعزم الانحناء: $T(x) = -\\frac{dM_f(x)}{dx}$ أو $\\frac{dM_f}{dx} = T(x)$ حسب الاتجاه المختار.",
        "المقطع الخطير: يحدث دائماً عند النقطة التي يغير فيها $T(x)$ إشارته وينعدم.",
        "معامل عزم المقاومة للمقطع المستطيل (العرض b والارتفاع h): $\\frac{I_G}{v} = \\frac{b \\cdot h^2}{6}$.",
        "شرط المقاومة للانحناء: $\\sigma_{\\max} = \\frac{M_{f\\max}}{I_G / v} \\le \\bar{\\sigma}$."
      ],
      "commonPitfalls": [
        "الخلط بين عزم العطالة $I_G = \\frac{b h^3}{12}$ ومعامل المقاومة $\\frac{I_G}{v} = \\frac{b h^2}{6}$."
      ]
    },
    "practice": {
      "question": "رافدة ذات مقطع مستطيل عرضه $b = 40\\text{ mm}$ وارتفاعه $h = 60\\text{ mm}$ تخضع لعزم انحناء أقصى $M_{f\\max} = 360\\text{ N}\\cdot\\text{m}$. ما هو الإجهاد الناظمي الأقصى $\\sigma_{\\max}$ في هذا المقطع؟",
      "options": [
        {
          "id": "opt_a",
          "text": "$\\sigma_{\\max} = 15\\text{ MPa}$",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "$\\sigma_{\\max} = 30\\text{ MPa}$",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "$\\sigma_{\\max} = 7.5\\text{ MPa}$",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "$\\sigma_{\\max} = 150\\text{ MPa}$",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "1) حساب معامل المقاومة: $I_G / v = (b \\cdot h^2) / 6 = (40 \\times 60^2) / 6 = (40 \\times 3600) / 6 = 24,000\\text{ mm}^3$.\n2) تحويل عزم الانحناء إلى $\\text{N}\\cdot\\text{mm}$: $M_{f\\max} = 360\\text{ N}\\cdot\\text{m} = 360,000\\text{ N}\\cdot\\text{mm}$.\n3) حساب الإجهاد: $\\sigma_{\\max} = 360,000 / 24,000 = 15\\text{ N/mm}^2 = 15\\text{ MPa}$."
    },
    "isomorphicRetest": {
      "question": "إذا كان الإجهاد المسموح به للمادة $\\bar{\\sigma} = 20\\text{ MPa}$، فما هو استنتاجك بخصوص أمان الرافدة؟",
      "options": [
        {
          "id": "iso_a",
          "text": "الرافدة آمنة ومحققة للشرط لأن $\\sigma_{\\max} = 15\\text{ MPa} \\le 20\\text{ MPa}$.",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "الرافدة ستنكسر فوراً لأن الإجهاد تجاوز حد المرونة.",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "يجب مضاعفة ارتفاع الرافدة لتقليل الوزن.",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "الشرط غير محقق ويوجد خطر التواء جانبي.",
          "isCorrect": false
        }
      ],
      "repairGuide": "شرط الأمان هو $\\sigma_{\\max} \\le \\bar{\\sigma}$؛ وبما أن $15 \\le 20$ فالقطعة في حالة استقرار تام ومقاومة."
    }
  },
  "tm_elec_sequential_counters": {
    "skillId": "tm_elec_sequential_counters",
    "branch": "electrique",
    "subject": "genie_electrique",
    "unitAr": "الوظائف المنطقية التعاقبية: العدادات والسجلات",
    "titleAr": "العدادات اللازامنية بالمقالبات JK وتصميم دورة الترديد N",
    "bloomLevel": "apply",
    "theory": {
      "summary": "بناء عداد تنازلي أو تصاعدي لازامني باستخدام قلابات JK بنمط التبديل (T = Toggle حيث J = K = 1). حساب عدد القلابات اللازمة $n$ لترديد $N$ وفق المتباينة $2^{n-1} < N \\le 2^n$، ودارة الإرجاع إلى الصفر (Forçage à zéro) بواسطة بوابات NAND المربوطة بمداخل الإرغام $RAZ$ (Clear).",
      "keyTakeaways": [
        "نمط التبديل (Basculement): جعل المداخل $J = K = 1$ مع تغذية نبضات الساعة H.",
        "العداد التصاعدي مع مقالبات تشتعل بالجبهة الهابطة (Front descendant): ساعة القلاب اللاحق توصل بالمخرج المباشر Q للقلاب السابق.",
        "العداد ذو الدورة الناقصة (Modulo N): يتم فك تشفير العدد N بالنظام الثنائي وتوصيل المخارج المساوية لـ 1 إلى مدخل بوابة NAND لتفعيل مداخل $\\overline{CLR}$ ذات المستوى المنطقي 0 المنشط."
      ],
      "commonPitfalls": [
        "الخلط بين الجبهة الصاعدة والهابطة لساعة القلاب، مما يقلب العداد من تصاعدي إلى تنازلي عن غير قصد.",
        "توصيل المخرج $Q$ ذي القيمة 0 في بوابة الإرجاع إلى الصفر بدلاً من المخارج ذات القيمة 1 فقط للعدد N."
      ]
    },
    "practice": {
      "question": "نريد تصميم عداد لازامني تصاعدي ترديده $N = 10$ (Modulo 10 - عداد عشري BCD) باستخدام قلابات JK. ما هو عدد القلابات اللازمة وما هي المخارج التي يجب ربطها ببوابة الإرجاع إلى الصفر (RAZ)؟",
      "options": [
        {
          "id": "opt_a",
          "text": "4 قلابات، ونربط المخرجين $Q_3$ و $Q_1$ ببوابة NAND (لأن $10 = 1010_2$).",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "3 قلابات، ونربط جميع المخارج ببوابة AND.",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "4 قلابات، ونربط المخرجين $Q_2$ و $Q_0$ ببوابة NOR.",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "10 قلابات متتالية دون بوابة إرجاع.",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "1) حساب عدد القلابات $n$: $2^{n-1} < 10 \\le 2^n \\implies 2^3 < 10 \\le 2^4 \\implies n = 4$ قلابات ($Q_0, Q_1, Q_2, Q_3$).\n2) تمثيل الترديد 10 في النظام الثنائي (Binary): $10_{10} = (1010)_2 = Q_3 Q_2 Q_1 Q_0$.\n3) عند وصول العداد للحالة العابرة 10، تصبح $Q_3 = 1$ و $Q_1 = 1$، فنربطهما بمدخلي بوابة NAND لإرسال نبضة هابطة ترغم العداد على العودة فوراً إلى 0000."
    },
    "isomorphicRetest": {
      "question": "إذا أردنا تصميم عداد بترديد $N = 6$ (Modulo 6) باستخدام 3 قلابات ($Q_0, Q_1, Q_2$)، ما هي المخارج المرتبطة ببوابة NAND لتصفيره؟",
      "options": [
        {
          "id": "iso_a",
          "text": "المخرجان $Q_2$ و $Q_1$ (لأن $6 = 110_2$).",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "المخرجان $Q_2$ و $Q_0$.",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "المخرج $Q_1$ فقط.",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "جميع المخارج $Q_0, Q_1, Q_2$.",
          "isCorrect": false
        }
      ],
      "repairGuide": "العدد $6_{10} = 110_2$ حيث $Q_2 = 1$ و $Q_1 = 1$ و $Q_0 = 0$. إذن المخرجان ذوا القيمة 1 هما $Q_2$ و $Q_1$."
    }
  },
  "tm_elec_operational_amplifiers": {
    "skillId": "tm_elec_operational_amplifiers",
    "branch": "electrique",
    "subject": "genie_electrique",
    "unitAr": "الوظائف التناظرية: تضخيم ومقارنة الإشارات",
    "titleAr": "المضخم العملياتي: التركيب العاكس، غير العاكس ومضخم الطرح",
    "bloomLevel": "apply",
    "theory": {
      "summary": "تحليل دارات المضخم العملياتي المثالي في النظام الخطي (وجود تغذية عكسية سالبة من المخرج نحو المدخل العاكس $V_-$): افتراض تيارات المداخل منعدمة $i_+ = i_- = 0$ وتساوي الجهدين $V_+ = V_- = \\epsilon = 0$. استنتاج دالة التضخيم $A_v = \\frac{V_s}{V_e}$.",
      "keyTakeaways": [
        "التركيب العاكس (Amplificateur inverseur): $V_s = -\\frac{R_2}{R_1} \\cdot V_e$ (إشارة سالبة ومعامل تضخيم $A_v = -R_2/R_1$).",
        "التركيب غير العاكس (Non-inverseur): $V_s = \\left(1 + \\frac{R_2}{R_1}\\right) \\cdot V_e$ (تضخيم موجب دوماً وأكبر من 1).",
        "التركيب التابعي (Suiveur): $R_2 = 0$ فتكون $V_s = V_e$ (يستعمل كمكيف للممانعة والمقاومة)."
      ],
      "commonPitfalls": [
        "نسيان تطبيق قانون كيرشوف (العقد) عند المدخل العاكس $V_-$.",
        "الاعتقاد بأن توتر المخرج $V_s$ يمكن أن يتجاوز جهد التغذية $\\pm V_{sat}$ (المخرج يتشبع دوماً عند $\\pm 15\\text{V}$ مثلاً)."
      ]
    },
    "practice": {
      "question": "دارة مضخم عاكس تحتوي على مقاومة دخل $R_1 = 10\\text{ k}\\Omega$ ومقاومة تغذية خلفية $R_2 = 100\\text{ k}\\Omega$. إذا طبقنا توتر دخل مستمر قدره $V_e = +0.5\\text{ V}$، ما هي قيمة توتر المخرج $V_s$؟ (بافتراض التغذية $\\pm 15\\text{ V}$)",
      "options": [
        {
          "id": "opt_a",
          "text": "$V_s = -5.0\\text{ V}$",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "$V_s = +5.0\\text{ V}$",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "$V_s = -0.05\\text{ V}$",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "$V_s = -15.0\\text{ V}$ (تشبع)",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "1) قانون المضخم العاكس المثالي: $V_s = - (R_2 / R_1) \\times V_e$.\n2) حساب معامل التضخيم: $A_v = - 100\\text{ k} / 10\\text{ k} = -10$.\n3) حساب توتر المخرج: $V_s = -10 \\times 0.5 = -5.0\\text{ V}$.\n4) بما أن $|-5\\text{ V}| < 15\\text{ V}$، فإن المضخم يعمل في النظام الخطي غير المتشبع."
    },
    "isomorphicRetest": {
      "question": "إذا قمنا بتوصيل نفس المقاومات بنمط التركيب غير العاكس مع نفس توتر الدخل $V_e = +0.5\\text{ V}$، كم يصبح توتر المخرج $V_s$؟",
      "options": [
        {
          "id": "iso_a",
          "text": "$V_s = +5.5\\text{ V}$",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "$V_s = +5.0\\text{ V}$",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "$V_s = -5.5\\text{ V}$",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "$V_s = +11.0\\text{ V}$",
          "isCorrect": false
        }
      ],
      "repairGuide": "في التركيب غير العاكس: $V_s = (1 + R_2/R_1) \\times V_e = (1 + 10) \\times 0.5 = 11 \\times 0.5 = +5.5\\text{ V}$."
    }
  },
  "tm_proc_organic_lipids_saponification": {
    "skillId": "tm_proc_organic_lipids_saponification",
    "branch": "procedes",
    "subject": "genie_des_procedes",
    "unitAr": "الكيمياء العضوية الحيوية: الليبيدات والزيوت",
    "titleAr": "الليبيدات: أرقام التصبن واليود، وتفاعل التصبن (Saponification)",
    "bloomLevel": "apply",
    "theory": {
      "summary": "دراسة الغليسيريدات الثلاثية (Triglycérides) المتكونة من أسترة الغليسيرول بثلاثة أحماض دهنية، تفاعل التصبن مع هيدروكسيد البوتاسيوم KOH لإنتاج الصابون والغليسيرول، وحساب قرينة التصبن $I_s$ وقرينة اليود $I_i$ لمعرفة الكتلة المولية ودرجة عدم التشبع (عدد الروابط المضاعفة).",
      "keyTakeaways": [
        "تفاعل التصبن التام: $1\\text{ mol Triglycéride} + 3\\text{ mol KOH} \\longrightarrow 1\\text{ mol Glycérol} + 3\\text{ mol Savon}$.",
        "قرينة التصبن ($I_s$): كتلة هيدروكسيد البوتاسيوم KOH بالملغ (mg) اللازمة لتصبن $1\\text{ g}$ من المادة الدهنية: $I_s = \\frac{3 \\times M_{\\text{KOH}} \\times 10^3}{M_{\\text{lipide}}} = \\frac{3 \\times 56 \\times 1000}{M_{\\text{lipide}}} = \\frac{168,000}{M_{\\text{lipide}}}$.",
        "قرينة اليود ($I_i$): كتلة اليود $I_2$ بالغرام (g) المثبتة على $100\\text{ g}$ من المادة الدهنية لتحديد عدد الروابط الثنائية $n$ في السلسلة الفحمية."
      ],
      "commonPitfalls": [
        "نسيان ضرب كتلة KOH في 3 (لأن الغليسيريد الثلاثي يحتاج إلى 3 جزيئات KOH وليس جزيئاً واحداً).",
        "نسيان التحويل إلى الملغ بالضرب في $10^3$ في قانون $I_s$."
      ]
    },
    "practice": {
      "question": "ثلاثي غليسيريد متجانس كتلته المولية $M = 884\\text{ g/mol}$. بالاعتماد على الكتلة المولية لـ $\\text{KOH} = 56\\text{ g/mol}$، ما هي قرينة تصبنه $I_s$؟",
      "options": [
        {
          "id": "opt_a",
          "text": "$I_s \\approx 190\\text{ mg KOH/g}$",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "$I_s \\approx 63.3\\text{ mg KOH/g}$",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "$I_s \\approx 250\\text{ mg KOH/g}$",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "$I_s \\approx 126\\text{ mg KOH/g}$",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "1) تطبيق القانون الوزاري لقرينة التصبن: $I_s = (3 \\times M_{\\text{KOH}} \\times 1000) / M_{\\text{triglycéride}}$.\n2) التعويض: $I_s = (3 \\times 56 \\times 1000) / 884 = 168,000 / 884 \\approx 190.04\\text{ mg}$.\n3) إذن قرينة التصبن هي 190."
    },
    "isomorphicRetest": {
      "question": "إذا كانت قرينة تصبن مادة دهنية نقية هي $I_s = 200\\text{ mg}$، فكم تبلغ الكتلة المولية التقريبية لهذا الغليسيريد الثلاثي؟",
      "options": [
        {
          "id": "iso_a",
          "text": "$M = 840\\text{ g/mol}$",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "$M = 560\\text{ g/mol}$",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "$M = 1020\\text{ g/mol}$",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "$M = 280\\text{ g/mol}$",
          "isCorrect": false
        }
      ],
      "repairGuide": "$M = (3 \\times 56 \\times 1000) / I_s = 168,000 / 200 = 840\\text{ g/mol}$."
    }
  },
  "tm_proc_chemical_kinetics_rate": {
    "skillId": "tm_proc_chemical_kinetics_rate",
    "branch": "procedes",
    "subject": "genie_des_procedes",
    "unitAr": "الكيمياء الحركية والديناميكا الحرارية",
    "titleAr": "الحركية الكيميائية: رتبة التفاعل، السرعة الحجمية وزمن نصف التفاعل",
    "bloomLevel": "apply",
    "theory": {
      "summary": "دراسة التفاعلات من الرتبة 1 والرتبة 2؛ استنتاج قانون السرعة التفاضلي والتكاملي، تحديد رتبة التفاعل بيانياً، وحساب ثابت السرعة k وزمن نصف التفاعل $t_{1/2}$.",
      "keyTakeaways": [
        "تفاعل الرتبة 1: $v = -\\frac{d[A]}{dt} = k[A] \\implies \\ln[A] = \\ln[A]_0 - k \\cdot t$ (رسم بياني لـ $\\ln[A]$ بدلالة $t$ يعطي خطاً مستقيماً ميله $-k$).",
        "زمن نصف التفاعل لتفاعل الرتبة 1: $t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}$ (مستقل تماماً عن التركيز الابتدائي $[A]_0$).",
        "تفاعل الرتبة 2: $v = k[A]^2 \\implies \\frac{1}{[A]} = \\frac{1}{[A]_0} + k \\cdot t$ وزمن نصف التفاعل $t_{1/2} = \\frac{1}{k[A]_0}$."
      ],
      "commonPitfalls": [
        "الاعتقاد بأن زمن نصف التفاعل مستقل عن التركيز الابتدائي في جميع الرتب (هو مستقل في الرتبة الأولى فقط، بينما يتناسب عكساً مع التركيز في الرتبة الثانية)."
      ]
    },
    "practice": {
      "question": "تفكك مركب كيميائي يتبع حركية من الرتبة الأولى بثابت سرعة $k = 0.0231\\text{ min}^{-1}$. ما هو زمن نصف التفاعل $t_{1/2}$ لهذا التحول؟",
      "options": [
        {
          "id": "opt_a",
          "text": "$t_{1/2} = 30\\text{ minutes}$",
          "isCorrect": true
        },
        {
          "id": "opt_b",
          "text": "$t_{1/2} = 15\\text{ minutes}$",
          "isCorrect": false
        },
        {
          "id": "opt_c",
          "text": "$t_{1/2} = 43.2\\text{ minutes}$",
          "isCorrect": false
        },
        {
          "id": "opt_d",
          "text": "$t_{1/2} = 60\\text{ minutes}$",
          "isCorrect": false
        }
      ],
      "explanationStepByStep": "1) قانون زمن نصف التفاعل من الرتبة 1: $t_{1/2} = (\\ln 2) / k$.\n2) بالتعويض: $\\ln 2 \\approx 0.693$.\n3) $t_{1/2} = 0.693 / 0.0231 = 30\\text{ min}$."
    },
    "isomorphicRetest": {
      "question": "كم يتبقى من تركيز المادة المتفاعلة بعد مرور زمن قدره $t = 3 \\times t_{1/2}$ (ثلاثة أنصاف تفاعل) لتفاعل من الرتبة الأولى تركيزه الابتدائي $[A]_0 = 0.8\\text{ mol/L}$؟",
      "options": [
        {
          "id": "iso_a",
          "text": "$[A] = 0.1\\text{ mol/L}$",
          "isCorrect": true
        },
        {
          "id": "iso_b",
          "text": "$[A] = 0.2\\text{ mol/L}$",
          "isCorrect": false
        },
        {
          "id": "iso_c",
          "text": "$[A] = 0.05\\text{ mol/L}$",
          "isCorrect": false
        },
        {
          "id": "iso_d",
          "text": "$[A] = 0.0\\text{ mol/L}$ (تفكك تام)",
          "isCorrect": false
        }
      ],
      "repairGuide": "بعد $1\\, t_{1/2}$: $0.8 / 2 = 0.4$. بعد $2\\, t_{1/2}$: $0.4 / 2 = 0.2$. بعد $3\\, t_{1/2}$: $0.2 / 2 = 0.1\\text{ mol/L}$."
    }
  }
};

export function getTechniqueMathBundle(skillId: string): EngineeringBundlePayload | null {
  if (TECHNIQUE_MATH_BUNDLE[skillId]) {
    return TECHNIQUE_MATH_BUNDLE[skillId];
  }
  const aliasedId = TECHNIQUE_MATH_ALIASES[skillId];
  if (aliasedId && TECHNIQUE_MATH_BUNDLE[aliasedId]) {
    return TECHNIQUE_MATH_BUNDLE[aliasedId];
  }
  return null;
}

export function getAllTechniqueMathPayloads(): EngineeringBundlePayload[] {
  return Object.values(TECHNIQUE_MATH_BUNDLE);
}

export const TECHNIQUE_MATH_SUBJECT_MAP: Record<string, string> = {
  civil: "civil_eng",
  genie_civil: "civil_eng",
  mecanique: "mechanical_eng",
  genie_mecanique: "mechanical_eng",
  electrique: "electrical_eng",
  genie_electrique: "electrical_eng",
  procedes: "process_eng",
  genie_des_procedes: "process_eng",
};

export function getAllTechniqueMathSkills(): Skill[] {
  return Object.values(TECHNIQUE_MATH_BUNDLE).map((payload, idx) => {
    const subjectId = TECHNIQUE_MATH_SUBJECT_MAP[payload.branch] || TECHNIQUE_MATH_SUBJECT_MAP[payload.subject] || "civil_eng";
    return {
      id: payload.skillId,
      topicId: `topic_${payload.skillId}`,
      subjectId: subjectId as any,
      streamId: "technique_math" as any,
      title_ar: payload.titleAr,
      title_fr: payload.titleAr,
      description_ar: payload.theory.summary,
      description_fr: payload.theory.summary,
      prerequisites: [],
      cognitiveDimensions: ["application", "knowledge"],
      difficulty: 2,
      order: idx + 1,
      repairStrategy_ar: payload.theory.keyTakeaways.join(" | "),
      repairStrategy_fr: "",
      repairSteps_ar: payload.theory.commonPitfalls,
      repairSteps_fr: [],
      academicYear: "2026-2027",
      sourceId: "src-ministry-curriculum-3as-tm",
      sourceType: "official_curriculum",
      rightsStatus: "official_reference",
      verificationStatus: "verified",
      isActive: true,
    };
  });
}
