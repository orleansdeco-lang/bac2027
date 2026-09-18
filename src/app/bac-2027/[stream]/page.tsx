import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import {
  BookOpen,
  Calculator,
  Compass,
  FileCheck2,
  GraduationCap,
  Sparkles,
  Target,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  ChevronRight,
  School,
  AlertCircle,
} from "lucide-react";

interface StreamData {
  slug: string;
  titleAr: string;
  titleFr: string;
  metaDesc: string;
  badge: string;
  summary: string;
  subjects: {
    name: string;
    coeff: number;
    duration: string;
    focus: string;
    isKey: boolean;
  }[];
  orientation: {
    field: string;
    threshold: string;
    description: string;
  }[];
  advice: string[];
}

const STREAMS_DATA: Record<string, StreamData> = {
  "sciences-experimentales": {
    slug: "sciences-experimentales",
    titleAr: "شعبة العلوم التجريبية — بكالوريا 2027",
    titleFr: "Filière Sciences Expérimentales",
    metaDesc:
      "الدليل الشامل لشعبة العلوم التجريبية في بكالوريا 2027 بالجزائر: المعاملات الرسمية، منهجية مادة العلوم الطبيعية، الفيزياء والرياضيات، وفرص التوجيه الجامعي لكليات الطب والمدارس العليا.",
    badge: "شعبة العلوم التجريبية",
    summary:
      "تعتبر شعبة العلوم التجريبية بوابة التخصصات الطبية والصحية والبيولوجية والمدارس العليا. التميز فيها يتطلب إتقان منهجية الاستدلال العلمي والمسعى العلمي الدقيق وتطبيق القوانين الرياضية والفيزيائية بدقة وسرعة.",
    subjects: [
      { name: "علوم الطبيعة والحياة", coeff: 6, duration: "4 سا و 30 د", focus: "المسعى العلمي، الاستدلال المنطقي، واستغلال الوثائق", isKey: true },
      { name: "العلوم الفيزيائية", coeff: 5, duration: "3 سا و 30 د", focus: "الظواهر الكهربائية، الميكانيك، والمتابعة الزمنية للتحولات", isKey: true },
      { name: "الرياضيات", coeff: 5, duration: "3 سا و 30 د", focus: "الدوال الأسية واللوغارتمية، المتتاليات، والاحتمالات", isKey: true },
      { name: "اللغة العربية وآدابها", coeff: 3, duration: "2 سا و 30 د", focus: "البلاغة، القواعد، وتحليل النصوص الشعرية والنثرية", isKey: false },
      { name: "الفلسفة", coeff: 2, duration: "2 سا و 30 د", focus: "المقالة الفلسفية (المقارنة، الجدل، والاستقصاء بالوضع)", isKey: false },
      { name: "التاريخ والجغرافيا", coeff: 2, duration: "2 سا و 30 د", focus: "المصطلحات، الشخصيات، التواريخ، ورسم وتفسير الرسومات البيانية", isKey: false },
      { name: "العلوم الإسلامية", coeff: 2, duration: "2 سا و 00 د", focus: "الفهم والتدبر والاستشهاد بالنصوص الشرعية", isKey: false },
      { name: "اللغة الفرنسية", coeff: 2, duration: "2 سا و 30 د", focus: "النص التاريخي والنص الحجاجي والتلخيص (Compte-rendu)", isKey: false },
      { name: "اللغة الإنجليزية", coeff: 2, duration: "2 سا و 30 د", focus: "فهم النص والقواعد النحوية والتعبير الكتابي", isKey: false },
    ],
    orientation: [
      { field: "العلوم الطبية (طب، صيدلة، طب أسنان)", threshold: "معدل 15.50 إلى 17.50+", description: "الأولوية الأولى بالمعدل الموزون (معدل البكالوريا + علامة العلوم الطبيعية)." },
      { field: "المدارس العليا للأساتذة (ENS)", threshold: "معدل 14.50 إلى 16.00", description: "تكوين أساتذة التعليم الثانوي والمتوسط في مختلف المواد العلمية." },
      { field: "المدارس الوطنية العليا (ذكاء اصطناعي، بيوتكنولوجيا، بيطرة)", threshold: "معدل 15.00 إلى 17.00", description: "أقطاب النخبة العلمية والتكنولوجية بالجزائر." },
      { field: "العلوم الدقيقة والتكنولوجيا (ST / SM)", threshold: "معدل 10.00 إلى 12.00", description: "دراسات جامعية في الهندسة والكيمياء والفيزياء." },
    ],
    advice: [
      "لا تضيع نقاط العلوم في الصياغة اللغوية: التزم بأفعال الأداء (حلل، فسر، استنتج، صادق على الفرضية).",
      "الفيزياء مادة نقاط: تدرب على رسم المخططات والتحليل البعدي وكتابة الوحدات دون نسيان.",
      "المواد الثانوية (إسلامية، تاريخ وجغرافيا، لغات) تصنع فارق التفوق وترفع المعدل بأكثر من نقطتين كاملتين.",
    ],
  },
  "mathematiques": {
    slug: "mathematiques",
    titleAr: "شعبة الرياضيات — بكالوريا 2027",
    titleFr: "Filière Mathématiques",
    metaDesc:
      "دليل شعبة الرياضيات في بكالوريا 2027 الجزائر: المعاملات الرسمية، برنامج الرياضيات والفيزياء، التوجيه نحو المدرسة الوطنية للذكاء الاصطناعي وهندسة الإعلام الآلي والطب.",
    badge: "شعبة الرياضيات",
    summary:
      "شعبة النخبة الأولى في النظام التعليمي الجزائري. يتمتع طالب الرياضيات بأعلى معامل أولوية في التوجيه الجامعي لمعظم التخصصات التكنولوجية والهندسية وكليات الذكاء الاصطناعي والإعلام الآلي.",
    subjects: [
      { name: "الرياضيات", coeff: 7, duration: "4 سا و 30 د", focus: "الحساب والقسمة في Z، الهندسة في الفضاء، الدوال، الأعداد المركبة", isKey: true },
      { name: "العلوم الفيزيائية", coeff: 6, duration: "3 سا و 30 د", focus: "الميكانيك الدقيق، الكهرباء، الاهتزازات، ومراقبة تطور جملة كيميائية", isKey: true },
      { name: "اللغة العربية وآدابها", coeff: 3, duration: "2 سا و 30 د", focus: "تحليل النصوص والخصائص البلاغية", isKey: false },
      { name: "الفلسفة", coeff: 2, duration: "2 سا و 30 د", focus: "فلسفة الرياضيات، العلوم التجريبية، والمنطق", isKey: false },
      { name: "التاريخ والجغرافيا", coeff: 2, duration: "2 سا و 30 د", focus: "الخرائط والتعليق والمنهجية التاريخية", isKey: false },
      { name: "علوم الطبيعة والحياة", coeff: 2, duration: "2 سا و 00 د", focus: "الأسس الوراثية والمناعية العامة", isKey: false },
      { name: "اللغة الفرنسية", coeff: 2, duration: "2 سا و 30 د", focus: "المنهجية والاستيعاب اللغوي", isKey: false },
      { name: "اللغة الإنجليزية", coeff: 2, duration: "2 سا و 30 د", focus: "الكتابة والتراكيب اللغوية", isKey: false },
      { name: "العلوم الإسلامية", coeff: 2, duration: "2 سا و 00 د", focus: "القواعد والتشريعات الإسلامية", isKey: false },
    ],
    orientation: [
      { field: "المدرسة الوطنية العليا للذكاء الاصطناعي (ENSIA)", threshold: "معدل 17.50+", description: "أعلى معدلات القبول في الجزائر بالأولوية المطلقة لشعبة الرياضيات." },
      { field: "المدرسة الوطنية العليا للإعلام الآلي (ESI Alger)", threshold: "معدل 17.00+", description: "رائدة هندسة البرمجيات والأنظمة في الجزائر." },
      { field: "العلوم الطبية وكليات الهندسة المعمارية", threshold: "معدل 15.00 إلى 16.50", description: "أولوية ثانية قوية في الطب مع احتساب معامل الرياضيات المرتفع." },
      { field: "المدارس العليا المتعددة التقنيات (Polytech)", threshold: "معدل 14.50 إلى 16.00", description: "تكوين مهندسي الدولة في مختلف التخصصات الصناعية والتكنولوجية." },
    ],
    advice: [
      "معامل الرياضيات 7 والفيزياء 6 يمثلان أكثر من 45% من مجموع نقاط البكالوريا بالكامل.",
      "تمرين القسمة في Z والأعداد المركبة يحتاجان إلى الدقة والمنطق الرياضي المتسلسل دون القفز على الخطوات.",
      "لا تهمل المواد الأدبية؛ الحصول على 16 في الإسلامية والعربية يرفع معدلك العام بسرعة إلى رتبة الامتياز.",
    ],
  },
  "technique-mathematiques": {
    slug: "technique-mathematiques",
    titleAr: "شعبة تقني رياضي — بكالوريا 2027",
    titleFr: "Filière Technique Mathématiques",
    metaDesc:
      "دليل شعبة تقني رياضي بكالوريا 2027 الجزائر: فروع الهندسة الميكانيكية والكهربائية والمدنية والطرائق، المعاملات، ودراسة المشاريع والتوظيف الهندسي.",
    badge: "شعبة تقني رياضي",
    summary:
      "تجمع هذه الشعبة بين العمق النظري في الرياضيات والفيزياء والتطبيق الهندسي الميداني عبر 4 فروع تخصصية (هندسة ميكانيكية، هندسة كهربائية، هندسة مدنية، هندسة الطرائق).",
    subjects: [
      { name: "التكنولوجيا (حسب التخصص)", coeff: 6, duration: "4 سا و 30 د", focus: "دراسة الأنظمة، المخططات، والمشاريع الهندسية", isKey: true },
      { name: "الرياضيات", coeff: 6, duration: "4 سا و 00 د", focus: "الدوال، الحساب التكاملي، المتتاليات، الأعداد المركبة", isKey: true },
      { name: "العلوم الفيزيائية", coeff: 6, duration: "3 سا و 30 د", focus: "الميكانيك والكهرباء والكيمياء الحركية", isKey: true },
      { name: "اللغة العربية وآدابها", coeff: 3, duration: "2 سا و 30 د", focus: "فهم النص والتحليل الأدبي", isKey: false },
      { name: "الفلسفة", coeff: 2, duration: "2 سا و 30 د", focus: "المنهج التجريبي وفلسفة العلوم والتقنية", isKey: false },
      { name: "التاريخ والجغرافيا", coeff: 2, duration: "2 سا و 30 د", focus: "الوضعيات التعلمية والخرائط", isKey: false },
      { name: "اللغة الفرنسية", coeff: 2, duration: "2 سا و 30 د", focus: "النصوص التقنية والحجاجية", isKey: false },
      { name: "اللغة الإنجليزية", coeff: 2, duration: "2 سا و 30 د", focus: "المصطلحات العلمية والتعبير", isKey: false },
      { name: "العلوم الإسلامية", coeff: 2, duration: "2 سا و 00 د", focus: "القيم الأسرية والاجتماعية والتشريع", isKey: false },
    ],
    orientation: [
      { field: "المدارس الوطنية المتعددة التقنيات (ENP)", threshold: "معدل 15.00 إلى 16.50", description: "أولوية قصوى لطلبة التقني رياضي في التكوين الهندسي المتقدم." },
      { field: "المدرسة العليا للذكاء الاصطناعي والإعلام الآلي", threshold: "معدل 16.50+", description: "قبول منافس مع شعبة الرياضيات." },
      { field: "الهندسة المعمارية وعمران (Architecture)", threshold: "معدل 14.00 إلى 15.50", description: "أفضلية متميزة لفرعي الهندسة المدنية والميكانيكية." },
      { field: "جامعات العلوم والتكنولوجيا (ST)", threshold: "معدل 10.00 إلى 12.00", description: "استمرار مباشر في التخصصات الهندسية." },
    ],
    advice: [
      "مادة التخصص (معامل 6) هي مادة النقطة الكاملة لطلبة التقني رياضي: احرص على التدرب على قراءة دفاتر الشروط والمخططات بدقة.",
      "الثالوث الحاسم (تكنولوجيا 6 + رياضيات 6 + فيزياء 6 = 18 معامل!) يحدد مصير معدلك بنسبة تفوق 60%.",
    ],
  },
  "gestion-economie": {
    slug: "gestion-economie",
    titleAr: "شعبة تسيير واقتصاد — بكالوريا 2027",
    titleFr: "Filière Gestion et Économie",
    metaDesc:
      "دليل شعبة تسيير واقتصاد بكالوريا 2027 الجزائر: المحاسبة، الاقتصاد، المناجمنت، القانون، والرياضيات المالية. نصائح التوجيه للمدارس العليا للتجارة والمصارف.",
    badge: "شعبة تسيير واقتصاد",
    summary:
      "الشعبة الاستراتيجية لرواد الأعمال والمحاسبين ومديري الشركات وخبراء المالية. تركز على الفهم العميق للدورات الاقتصادية، التسجيل المحاسبي المعياري، والنصوص القانونية المنظمة لبيئة الأعمال.",
    subjects: [
      { name: "التسيير المحاسبي والمالي", coeff: 6, duration: "4 سا و 30 د", focus: "أعمال نهاية السنة، إعداد الميزانيات، واستهلاك القروض", isKey: true },
      { name: "الاقتصاد والمناجمنت", coeff: 5, duration: "3 سا و 30 د", focus: "السوق، النقود، البنوك، القيادة، والاتصال في المؤسسة", isKey: true },
      { name: "الرياضيات", coeff: 5, duration: "3 سا و 30 د", focus: "الدوال، المتتاليات العددية، والإحصاء الرياضي", isKey: true },
      { name: "القانون", coeff: 2, duration: "2 سا و 30 د", focus: "عقود العمل، الشركات التجارية، والقوانين المدنية", isKey: false },
      { name: "اللغة العربية وآدابها", coeff: 3, duration: "2 سا و 30 د", focus: "النصوص النثرية والمقالات الاجتماعية والاقتصادية", isKey: false },
      { name: "التاريخ والجغرافيا", coeff: 4, duration: "3 سا و 30 د", focus: "القوى الاقتصادية الكبرى والتنمية في العالم", isKey: false },
      { name: "الفلسفة", coeff: 2, duration: "2 سا و 30 د", focus: "المنهج الفلسفي ونظريات المعرفة والعلوم الإنسانية", isKey: false },
      { name: "اللغات الأجنبية (فرنسية وإنجليزية)", coeff: 4, duration: "2 سا و 30 د لكل لغة", focus: "المصطلحات الاقتصادية والتواصل المؤسساتي", isKey: false },
      { name: "العلوم الإسلامية", coeff: 2, duration: "2 سا و 00 د", focus: "المعاملات المالية الإسلامية والربا والبيوع", isKey: false },
    ],
    orientation: [
      { field: "المدرسة العليا للتجارة (ESC)", threshold: "معدل 14.50 إلى 16.00", description: "أعرق مدرسة تجارية بالجزائر لتكوين أطر التسيير والتسويق الدولي." },
      { field: "المدرسة الوطنية العليا للإحصاء والاقتصاد التطبيقي (ENSSEA)", threshold: "معدل 14.00 إلى 15.50", description: "تخصص قيادي في تحليل البيانات الاقتصادية والاكتوارية." },
      { field: "المدرسة العليا للعلوم المصرفية والمالية (EHEC)", threshold: "معدل 14.50 إلى 16.00", description: "تأهيل كوادر البنوك والمؤسسات المالية والتأمينات." },
      { field: "كليات العلوم الاقتصادية والتجارية وعلوم التسيير", threshold: "معدل 10.00 إلى 12.00", description: "جامعات الوطن في مختلف التخصصات المالية والمحاسبية." },
    ],
    advice: [
      "في المحاسبة، الحسابات الرياضية لا تقبل الخطأ: تدرب باستمرار على جداول الاهتلاك وقيود التسوية في اليومية.",
      "مادتا الاقتصاد والقانون تحتاجان للحفظ المنهجي مع فهم الأمثلة الواقعية من الاقتصاد الجزائري والدولي.",
      "مادة التاريخ والجغرافيا بمعامل 4 تعتبر مادة أساسية ثانية: لا تهمل مصطلحات وخريطة التكتلات الاقتصادية الكبرى.",
    ],
  },
  "lettres-philosophie": {
    slug: "lettres-philosophie",
    titleAr: "شعبة آداب وفلسفة — بكالوريا 2027",
    titleFr: "Filière Lettres et Philosophie",
    metaDesc:
      "دليل شعبة آداب وفلسفة بكالوريا 2027 الجزائر: منهجيات كتابة المقالة الفلسفية، إتقان اللغة العربية، التاريخ والجغرافيا، والتوجيه لكليات الحقوق والعلوم السياسية والإعلام.",
    badge: "شعبة آداب وفلسفة",
    summary:
      "شعبة الفكر والتحليل النقدي واللغوي. الركيزة الأساسية للراغبين في دراسة القانون والعلوم السياسية والصحافة والإعلام والتربية والعلوم الإنسانية واللغوية.",
    subjects: [
      { name: "الفلسفة", coeff: 6, duration: "4 سا و 30 د", focus: "منهجية المقارنة، الجدل، الاستقصاء بالوضع، وتحليل النص الفلسفي", isKey: true },
      { name: "اللغة العربية وآدابها", coeff: 6, duration: "4 سا و 30 د", focus: "الشعر الحديث، النثر العلمي المتأدب، البلاغة، والقواعد", isKey: true },
      { name: "التاريخ والجغرافيا", coeff: 4, duration: "3 سا و 30 د", focus: "حركات التحرر، الثورة الجزائرية، جغرافيا العالم والعالم الثالث", isKey: true },
      { name: "اللغة الفرنسية", coeff: 3, duration: "2 سا و 30 د", focus: "فهم النصوص التاريخية والحجاجية وتلخيصها", isKey: false },
      { name: "اللغة الإنجليزية", coeff: 3, duration: "2 سا و 30 د", focus: "النصوص الأدبية والتعبير الكتابي المقالي", isKey: false },
      { name: "العلوم الإسلامية", coeff: 2, duration: "2 سا و 00 د", focus: "الفقه والمقاصد والأحكام التشريعية", isKey: false },
      { name: "الرياضيات", coeff: 2, duration: "2 سا و 00 د", focus: "المتتاليات العددية، الإحصاء، والموافقات في Z", isKey: false },
    ],
    orientation: [
      { field: "المدارس العليا للأساتذة (أدب عربي، فلسفة، تاريخ وجغرافيا)", threshold: "معدل 14.50 إلى 16.00", description: "مهنة التدريس المرموقة بالجزائر مع ضمان التوظيف." },
      { field: "المدرسة الوطنية العليا للصحافة وعلوم الإعلام", threshold: "معدل 13.50 إلى 15.00", description: "تكوين الصحفيين ومحللي الاتصال والإعلام." },
      { field: "كليات الحقوق والعلوم السياسية (محاماة، قضاء، دبلوماسية)", threshold: "معدل 11.00 إلى 13.50", description: "بوابة الالتحاق بالمدرسة العليا للقضاء والمحاماة." },
      { field: "العلوم الإنسانية والاجتماعية واللغات", threshold: "معدل 10.00 إلى 11.50", description: "علم النفس، علم الاجتماع، والعلوم الإدارية." },
    ],
    advice: [
      "المقالة الفلسفية تتطلب الالتزام الصارم بالخطوات المنهجية (طرح المشكلة، محاولة حل المشكلة، حل المشكلة) وتدعيم كل موقف بأقوال الفلاسفة وأمثلة حية.",
      "مادتا الفلسفة والعربية (معامل 6 لكل منهما) هما العمود الفقري للشعبة: لا تكتف بالحفظ بل طور لغة تعبيرية قوية وجذابة.",
    ],
  },
  "langues-etrangeres": {
    slug: "langues-etrangeres",
    titleAr: "شعبة لغات أجنبية — بكالوريا 2027",
    titleFr: "Filière Langues Étrangères",
    metaDesc:
      "دليل شعبة لغات أجنبية بكالوريا 2027 الجزائر: معاملات اللغة الفرنسية، الإنجليزية، واللغة الثالثة (إسبانية/ألمانية/إيطالية)، وفرص كليات الترجمة والعلاقات الدولية.",
    badge: "شعبة لغات أجنبية",
    summary:
      "المسار المتميز للطلاب الشغوفين بالتواصل اللغوي، الترجمة الفورية، العلاقات الدولية، والدبلوماسية. تعتمد على إتقان ثلاث لغات عالمية حية بجانب اللغة العربية.",
    subjects: [
      { name: "اللغة الأجنبية الثالثة (إسبانية / ألمانية / إيطالية)", coeff: 5, duration: "3 سا و 30 د", focus: "قواعد اللغة، التعبير الكتابي، وفهم النصوص الحضارية", isKey: true },
      { name: "اللغة الفرنسية", coeff: 5, duration: "3 سا و 30 د", focus: "النص التاريخي، النص الحجاجي، والتقرير الموضوعي (Compte-rendu critique)", isKey: true },
      { name: "اللغة الإنجليزية", coeff: 5, duration: "3 سا و 30 د", focus: "الأخلاقيات في العمل (Ethics in Business)، الحضارات القديمة، والتعبير", isKey: true },
      { name: "اللغة العربية وآدابها", coeff: 5, duration: "3 سا و 30 د", focus: "دراسة النصوص والأساليب البلاغية واللغوية", isKey: true },
      { name: "التاريخ والجغرافيا", coeff: 2, duration: "2 سا و 30 د", focus: "الأحداث السياسية والمؤشرات الجغرافية", isKey: false },
      { name: "الفلسفة", coeff: 2, duration: "2 سا و 30 د", focus: "فلسفة اللغة، الأخلاق، وعلم النفس", isKey: false },
      { name: "العلوم الإسلامية", coeff: 2, duration: "2 سا و 00 د", focus: "القيم الدينية والمعاملات", isKey: false },
      { name: "الرياضيات", coeff: 2, duration: "2 سا و 00 د", focus: "الموافقات والمتتاليات العددية", isKey: false },
    ],
    orientation: [
      { field: "المعهد العالي للترجمة (جامعة الجزائر 1)", threshold: "معدل 14.00 إلى 15.50", description: "التكوين المرموق في الترجمة الفورية والتحريرية بين اللغات." },
      { field: "المدارس العليا للأساتذة في اللغات (ENS)", threshold: "معدل 14.50 إلى 16.00", description: "أساتذة اللغات الإنجليزية، الفرنسية، والإسبانية/الألمانية." },
      { field: "العلاقات الدولية والعلوم السياسية والدبلوماسية", threshold: "معدل 12.50 إلى 14.00", description: "المنظمات الدولية، الإعلام متعدد اللغات، والسلك الدبلوماسي." },
      { field: "أقسام اللغات الأجنبية بالجامعات", threshold: "معدل 10.00 إلى 12.00", description: "دراسات معمقة في آداب وحضارات اللغات المختلفة." },
    ],
    advice: [
      "أربع لغات بمعامل 5 لكل لغة (مجموع 20 معاملاً للغات وحدها!): هذا يمثل أكثر من ثلثي نقاط البكالوريا.",
      "في اللغات، كتابة التعبير الكتابي (Production écrite / Essay) دون أخطاء إملائية وصرفية تضمن لك علامة تفوق 16 بسهولة.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(STREAMS_DATA).map((stream) => ({
    stream,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ stream: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const data = STREAMS_DATA[resolved.stream];

  if (!data) {
    return {
      title: "الشعبة غير موجودة | الشاطر BAC",
    };
  }

  return {
    title: `${data.titleAr} | المعاملات والتحضير والتوجيه الجامعي`,
    description: data.metaDesc,
    alternates: {
      canonical: `/bac-2027/${data.slug}`,
    },
    openGraph: {
      title: `${data.titleAr} | الشاطر SHATER`,
      description: data.metaDesc,
      images: [
        {
          url: "/illustrations/shater-hero.jpg",
          width: 1200,
          height: 630,
          alt: data.titleAr,
        },
      ],
      type: "article",
    },
  };
}

export default async function StreamHubPage({
  params,
}: {
  params: Promise<{ stream: string }>;
}) {
  const resolved = await params;
  const data = STREAMS_DATA[resolved.stream];

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-900 font-sans antialiased">
      <BreadcrumbJsonLd
        items={[
          { name: "الرئيسية", url: "/" },
          { name: "دليل البكالوريا 2027", url: "/bac-2027" },
          { name: data.badge, url: `/bac-2027/${data.slug}` },
        ]}
      />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E2D5] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-serif font-black text-2xl text-[#1E3A34]">
              الشاطر
            </Link>
            <span className="text-slate-300">/</span>
            <Link
              href="/bac-2027"
              className="text-xs font-bold text-slate-600 hover:text-[#2C5E54] transition-colors"
            >
              بكالوريا 2027
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/calculator"
              className="text-xs font-bold text-slate-700 hover:text-[#2C5E54] transition-colors hidden sm:inline-block"
            >
              حاسبة المعدل
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 rounded-xl bg-[#2C5E54] hover:bg-[#234b43] text-white text-xs font-bold transition-all shadow-sm"
            >
              ابدأ التشخيص مجاناً
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 pt-10 pb-12 md:pt-16 md:pb-20 border-b border-[#E8E2D5]">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2C5E54]/10 text-[#2C5E54] text-xs font-bold">
            <Layers className="w-4 h-4" />
            <span>{data.titleFr}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-black text-[#1E3A34] leading-tight">
            {data.titleAr}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
            {data.summary}
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2C5E54] text-white text-xs font-bold hover:bg-[#234b43] transition-all shadow-sm"
            >
              <Calculator className="w-4 h-4" />
              <span>احسب معدلك لشعبة {data.badge}</span>
            </Link>
            <Link
              href="/curriculum"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E8E2D5] text-slate-800 text-xs font-bold hover:border-[#2C5E54] transition-all"
            >
              <BookOpen className="w-4 h-4 text-[#2C5E54]" />
              <span>دروس وملخصات الشعبة</span>
            </Link>
            <Link
              href="/exams"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E8E2D5] text-slate-800 text-xs font-bold hover:border-[#2C5E54] transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-[#2C5E54]" />
              <span>مواضيع البكالوريا السابقة</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Sections */}
      <div className="max-w-6xl mx-auto px-4 py-14 space-y-16">
        {/* Section 1: Official Subjects & Coefficients Table */}
        <section className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2C5E54]">
              <Clock className="w-4 h-4" />
              <span>الرزنامة والمعاملات الرسمية — وزارة التربية الوطنية</span>
            </div>
            <h2 className="text-2xl font-serif font-black text-[#1E3A34]">
              جدول مواد ومعاملات ومدد امتحان {data.badge}
            </h2>
            <p className="text-xs text-slate-600">
              المعاملات الرسمية المعتمدة في حساب معدل شهادة البكالوريا بالجزائر.
            </p>
          </div>

          <div className="overflow-x-auto bg-white rounded-3xl border border-[#E8E2D5] shadow-sm">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#F2ECE1]/60 text-slate-700 font-bold border-b border-[#E8E2D5]">
                <tr>
                  <th className="py-3.5 px-4">المادة</th>
                  <th className="py-3.5 px-4 text-center">المعامل الرسمي</th>
                  <th className="py-3.5 px-4">مدة الامتحان</th>
                  <th className="py-3.5 px-4">محور التركيز في التصحيح الوزاري</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE1]">
                {data.subjects.map((sub, idx) => (
                  <tr key={idx} className={sub.isKey ? "bg-[#2C5E54]/5 font-medium" : "hover:bg-slate-50/50"}>
                    <td className="py-3.5 px-4 flex items-center gap-2">
                      {sub.isKey && (
                        <span className="w-2 h-2 rounded-full bg-[#2C5E54] shrink-0" title="مادة أساسية" />
                      )}
                      <span className="text-slate-900 font-bold">{sub.name}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-mono font-black ${
                          sub.isKey
                            ? "bg-[#2C5E54] text-white shadow-sm"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {sub.coeff}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{sub.duration}</td>
                    <td className="py-3.5 px-4 text-slate-600">{sub.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: University Orientation & Career Prospects */}
        <section className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2C5E54]">
              <School className="w-4 h-4" />
              <span>دليل التوجيه الجامعي للناجحين</span>
            </div>
            <h2 className="text-2xl font-serif font-black text-[#1E3A34]">
              أبرز التخصصات والمدارس العليا المتاحة لشعبة {data.badge}
            </h2>
            <p className="text-xs text-slate-600">
              مؤشرات معدلات القبول السابقة والأولويات الممنوحة حسب المنشور الوزاري السنوي للتوجيه.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.orientation.map((ori, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-[#E8E2D5] space-y-3 shadow-sm hover:border-[#2C5E54] transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700">
                    {ori.threshold}
                  </span>
                  <GraduationCap className="w-5 h-5 text-[#2C5E54]" />
                </div>
                <h3 className="text-base font-bold text-slate-900">{ori.field}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{ori.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: High-Impact Preparation Strategy */}
        <section className="p-8 rounded-3xl bg-gradient-to-br from-[#EFE9DC] to-[#F7F3EA] border border-[#E4DED2] space-y-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2C5E54]">
              <Target className="w-4 h-4" />
              <span>نصائح تفوق مجربة</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-[#1E3A34]">
              استراتيجيات التفوق الذهبية لشعبة {data.badge}
            </h2>
          </div>

          <div className="space-y-3">
            {data.advice.map((adv, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/90 border border-[#E4DED2] flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#2C5E54] shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">{adv}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-[#E4DED2]">
            <div className="text-xs text-slate-600">
              هل تريد معرفة نقاط ضعفك في مواد الشعبة فوراً وبدون تخمين؟
            </div>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#2C5E54] hover:bg-[#234b43] text-white text-xs font-bold shadow-md transition-all"
            >
              <span>ابدأ التشخيص الأكاديمي لشعبتك</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E8E2D5] bg-[#F2ECE1]/40 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-4 mb-3">
          <Link href="/bac-2027" className="hover:text-[#2C5E54]">
            دليل البكالوريا 2027
          </Link>
          <span>•</span>
          <Link href="/calculator" className="hover:text-[#2C5E54]">
            حاسبة معدل البكالوريا
          </Link>
          <span>•</span>
          <Link href="/curriculum" className="hover:text-[#2C5E54]">
            الدروس والملخصات
          </Link>
          <span>•</span>
          <Link href="/exams" className="hover:text-[#2C5E54]">
            بنك الامتحانات الرسمية
          </Link>
        </div>
        <p>© 2026-2027 الشاطر (SHATER) — كل الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
