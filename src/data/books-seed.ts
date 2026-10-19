import { Book } from "@/types/book";

/**
 * خزانة المراجع المعتمدة لبكالوريا الجزائر
 * تحتوي على 3 مراجع أصلية كاملة وعالية الجودة:
 * 1. سلسلة الهباج في الرياضيات (الدوال العددية، الأسية، واللوغاريتمية)
 * 2. سلسلة المجتهد في العلوم الفيزيائية (الوحدات الأساسية والمسائل الشاملة المحلولة)
 * 3. كتاب الأستاذ محمودي عادل في التاريخ والجغرافيا (الدليل الشامل لجميع الشعب)
 */
export const INITIAL_BOOKS_SEED: Book[] = [
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
];
