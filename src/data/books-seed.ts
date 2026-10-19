import { Book } from "@/types/book";

/**
 * خزانة المراجع المعتمدة لبكالوريا الجزائر
 * مكتبة أصيلة وشاملة لجميع المواد والشعب (13 مرجعاً دراسياً حقيقياً):
 * 1. الرياضيات: سلسلة الهباج في الرياضيات (الدوال العددية والأسية واللوغاريتمية)
 * 2. الفيزياء: سلسلة المجتهد في العلوم الفيزيائية (الوحدات الأساسية والمسائل المحلولة)
 * 3. التاريخ والجغرافيا: كتاب الأستاذ محمودي عادل (المصطلحات، الشخصيات، التواريخ والخرائط)
 * 4. العلوم الطبيعية: سلسلة المجتهد في علوم الطبيعة والحياة (الوحدات والتمارين النموذجية)
 * 5. الفلسفة: موسوعة المقالات الفلسفية الشاملة ومنهجيات التحرير النموذجية
 * 6. العلوم الإسلامية: سلسلة كليك في العلوم الإسلامية (ملخص الدروس وخرائط المفاهيم)
 * 7. اللغة العربية: المرشد الوافي في الأدب العربي (البلاغة، القواعد، وأنماط النصوص)
 * 8. التسيير المحاسبي والمالي: سلسلة التميز في التسيير المالي والمحاسبي
 * 9. الاقتصاد والمناجمنت: الدليل الشامل في الاقتصاد والمناجمنت
 * 10. القانون: الوجيز في مادة القانون والعقود والشركات التجارية
 * 11. الهندسة الكهربائية: سلسلة المختار في الهندسة الكهربائية والمنطق التعاقبي
 * 12. اللغة الإنجليزية: Click English BAC Master - Grammar Rules & Written Expression
 * 13. اللغة الفرنسية: Guide Méthodologique de Français 3AS - Histoire & Argumentatif
 */
export const INITIAL_BOOKS_SEED: Book[] = [
  // 1. الرياضيات
  {
    id: "book-math-001",
    title: "سلسلة الهباج في الرياضيات: دراسة الدوال العددية والأسية واللوغاريتمية (الجزء الأول)",
    author: "الأستاذ حجاج بلقاسم / مراجعة نخبة من الأساتذة",
    category: "professor_series",
    subject: "math",
    streams: ["scientific", "math_tech", "math"],
    cover_url: "/images/books/cover-math-001.svg",
    file_url: "/documents/books/book-math-001.pdf",
    file_size: "4.4 MB",
    pages_count: 214,
    year_edition: "2024",
    downloads_count: 4890,
    is_featured: true,
  },
  // 2. العلوم الفيزيائية
  {
    id: "book-phys-001",
    title: "سلسلة المجتهد في العلوم الفيزيائية: الوحدات الأساسية والتمارين الشاملة المحلولة",
    author: "نخبة من أساتذة ومفتشي مادة العلوم الفيزيائية",
    category: "professor_series",
    subject: "physics",
    streams: ["scientific", "math_tech", "math"],
    cover_url: "/images/books/cover-phys-001.svg",
    file_url: "/documents/books/book-phys-001.pdf",
    file_size: "4.7 MB",
    pages_count: 113,
    year_edition: "2024",
    downloads_count: 5340,
    is_featured: true,
  },
  // 3. التاريخ والجغرافيا
  {
    id: "book-hist-001",
    title: "كتاب الأستاذ محمودي عادل في التاريخ والجغرافيا: المصطلحات والشخصيات والخرائط والمنهجية",
    author: "الأستاذ محمودي عادل",
    category: "summary",
    subject: "history_geo",
    streams: ["scientific", "math_tech", "math", "management", "literature", "languages"],
    cover_url: "/images/books/cover-hist-001.svg",
    file_url: "/documents/books/book-hist-001.pdf",
    file_size: "6.7 MB",
    pages_count: 62,
    year_edition: "2024",
    downloads_count: 8760,
    is_featured: true,
  },
  // 4. علوم الطبيعة والحياة
  {
    id: "book-sci-001",
    title: "سلسلة المجتهد في علوم الطبيعة والحياة: الوحدات الشاملة والتمارين النموذجية المحلولة",
    author: "نخبة من مفتشي وأساتذة مادة العلوم الطبيعية",
    category: "professor_series",
    subject: "science",
    streams: ["scientific", "math"],
    cover_url: "/images/books/cover-sci-001.svg",
    file_url: "/documents/books/book-sci-001.pdf",
    file_size: "10.8 MB",
    pages_count: 37,
    year_edition: "2024",
    downloads_count: 6120,
    is_featured: true,
  },
  // 5. الفلسفة
  {
    id: "book-phil-001",
    title: "موسوعة المقالات الفلسفية الشاملة ومنهجيات التحرير النموذجية للبكالوريا",
    author: "الأستاذ عبد الحق بوقرة / مراجعة نخبة من الأساتذة",
    category: "summary",
    subject: "philosophy",
    streams: ["scientific", "math_tech", "math", "management", "literature", "languages"],
    cover_url: "/images/books/cover-phil-001.svg",
    file_url: "/documents/books/book-phil-001.pdf",
    file_size: "3.1 MB",
    pages_count: 56,
    year_edition: "2024",
    downloads_count: 7450,
    is_featured: true,
  },
  // 6. العلوم الإسلامية
  {
    id: "book-isl-001",
    title: "سلسلة كليك في العلوم الإسلامية: ملخص الوحدات المقررة وخرائط المفاهيم الذهنية",
    author: "الأستاذ محمد بوخاتم / مفتش التربية الوطنية",
    category: "summary",
    subject: "islamic",
    streams: ["scientific", "math_tech", "math", "management", "literature", "languages"],
    cover_url: "/images/books/cover-isl-001.svg",
    file_url: "/documents/books/book-isl-001.pdf",
    file_size: "6.6 MB",
    pages_count: 18,
    year_edition: "2024",
    downloads_count: 9230,
    is_featured: true,
  },
  // 7. اللغة العربية وآدابها
  {
    id: "book-ar-001",
    title: "المرشد الوافي في الأدب العربي: البلاغة، القواعد، وأنماط النصوص والتقويم النقدي",
    author: "الأستاذ حيقون رابح / خبير مناهج اللغة العربية",
    category: "summary",
    subject: "arabic",
    streams: ["scientific", "math_tech", "math", "management", "literature", "languages"],
    cover_url: "/images/books/cover-ar-001.svg",
    file_url: "/documents/books/book-ar-001.pdf",
    file_size: "2.8 MB",
    pages_count: 10,
    year_edition: "2024",
    downloads_count: 6780,
    is_featured: true,
  },
  // 8. التسيير المالي والمحاسبي
  {
    id: "book-acc-001",
    title: "سلسلة التميز في التسيير المحاسبي والمالي: ملخص أعمال نهاية السنة والتسويات",
    author: "الأستاذ إلياس بن خديجة / مفتش التعليم الثانوي",
    category: "summary",
    subject: "accounting",
    streams: ["management"],
    cover_url: "/images/books/cover-acc-001.svg",
    file_url: "/documents/books/book-acc-001.pdf",
    file_size: "7.9 MB",
    pages_count: 8,
    year_edition: "2024",
    downloads_count: 4520,
    is_featured: false,
  },
  // 9. الاقتصاد والمناجمنت
  {
    id: "book-eco-001",
    title: "الدليل الشامل في الاقتصاد والمناجمنت: ملخص الوحدات والمصطلحات والخطاطات الذهنية",
    author: "الأستاذ يوسف عادل / أستاذ الاقتصاد والمناجمنت",
    category: "summary",
    subject: "economics",
    streams: ["management"],
    cover_url: "/images/books/cover-eco-001.svg",
    file_url: "/documents/books/book-eco-001.pdf",
    file_size: "2.3 MB",
    pages_count: 6,
    year_edition: "2024",
    downloads_count: 3890,
    is_featured: false,
  },
  // 10. القانون
  {
    id: "book-law-001",
    title: "الوجيز في مادة القانون: العقود والشركات التجارية وعلاقات العمل الفردية والجماعية",
    author: "الأستاذ فريد بن عمارة / خبير الشؤون القانونية",
    category: "summary",
    subject: "law",
    streams: ["management"],
    cover_url: "/images/books/cover-law-001.svg",
    file_url: "/documents/books/book-law-001.pdf",
    file_size: "21.7 MB",
    pages_count: 42,
    year_edition: "2024",
    downloads_count: 3410,
    is_featured: false,
  },
  // 11. الهندسة الكهربائية
  {
    id: "book-elec-001",
    title: "سلسلة المختار في الهندسة الكهربائية: المنطق التعاقبي، الدارات المندمجة والأنظمة الآلية",
    author: "نخبة من أساتذة التعليم التقني والثانوي",
    category: "professor_series",
    subject: "electrical_engineering",
    streams: ["math_tech"],
    cover_url: "/images/books/cover-elec-001.svg",
    file_url: "/documents/books/book-elec-001.pdf",
    file_size: "4.0 MB",
    pages_count: 109,
    year_edition: "2024",
    downloads_count: 4120,
    is_featured: false,
  },
  // 12. اللغة الإنجليزية
  {
    id: "book-eng-001",
    title: "Click English BAC Master: Grammar Rules, Vocabulary & Written Expression Guide",
    author: "Teacher K. Mansouri & English Inspectorate Team",
    category: "summary",
    subject: "english",
    streams: ["scientific", "math_tech", "math", "management", "literature", "languages"],
    cover_url: "/images/books/cover-eng-001.svg",
    file_url: "/documents/books/book-eng-001.pdf",
    file_size: "1.2 MB",
    pages_count: 8,
    year_edition: "2024",
    downloads_count: 5670,
    is_featured: false,
  },
  // 13. اللغة الفرنسية
  {
    id: "book-fr-001",
    title: "Guide Méthodologique de Français 3AS: Texte d'Histoire, Argumentatif et l'Appel",
    author: "Prof. N. Chérif & Inspecteurs Pédagogiques",
    category: "summary",
    subject: "french",
    streams: ["scientific", "math_tech", "math", "management", "literature", "languages"],
    cover_url: "/images/books/cover-fr-001.svg",
    file_url: "/documents/books/book-fr-001.pdf",
    file_size: "1.3 MB",
    pages_count: 7,
    year_edition: "2024",
    downloads_count: 5190,
    is_featured: false,
  },
];
