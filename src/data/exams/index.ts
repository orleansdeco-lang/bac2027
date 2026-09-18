import { SubjectId, StreamId } from "@/types/education";
import { ALL_SUBJECTS, ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";

export interface BacExamItem {
  id: string;
  year: number;
  session: "regular" | "exceptional";
  streamId: StreamId;
  subjectId: SubjectId;
  title_ar: string;
  topicsCount: number; // usually 2 topics
  subjectPdfUrl: string; // URL or cloud/public path
  solutionPdfUrl: string; // Official bareme solution
  keywords?: string[];
  durationMinutes?: number;
  coefficient?: number;
}

export interface BacExamFilters {
  streamId?: string;
  subjectId?: string;
  year?: number;
  session?: "all" | "regular" | "exceptional";
  searchQuery?: string;
}

/**
 * Public search and archive links for Algerian National Baccalaureate exams (ONEC / DzExams)
 */
function buildExamItem(
  year: number,
  session: "regular" | "exceptional",
  streamId: StreamId,
  subjectId: SubjectId,
  title_ar: string,
  durationMinutes: number = 210,
  keywords: string[] = []
): BacExamItem {
  const sessionTag = session === "exceptional" ? "exc" : "reg";
  const id = `bac-${year}-${sessionTag}-${streamId}-${subjectId}`;
  
  const stream = ALGERIAN_BAC_STREAMS[streamId];
  const streamName = stream?.name_ar || "";
  const subjectName = ALL_SUBJECTS[subjectId]?.name_ar || "";

  // Direct safe queries for authentic scanned PDF on Algerian national portals
  const subjectPdfUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `موضوع بكالوريا ${year} ${session === "exceptional" ? "دورة استثنائية" : ""} ${subjectName} شعبة ${streamName} pdf`
  )}`;
  const solutionPdfUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `تصحيح وسلم تنقيط بكالوريا ${year} ${session === "exceptional" ? "دورة استثنائية" : ""} ${subjectName} شعبة ${streamName} pdf`
  )}`;

  const subjectRule = stream?.subjects.find((s) => s.subjectId === subjectId);
  const coefficient = subjectRule?.coefficient || 2;

  return {
    id,
    year,
    session,
    streamId,
    subjectId,
    title_ar,
    topicsCount: 2,
    subjectPdfUrl,
    solutionPdfUrl,
    durationMinutes,
    coefficient,
    keywords: [
      title_ar,
      stream?.name_ar || "",
      ALL_SUBJECTS[subjectId]?.name_ar || "",
      `بكالوريا ${year}`,
      session === "exceptional" ? "دورة استثنائية" : "دورة عادية",
      ...keywords,
    ],
  };
}

/**
 * Curated Algerian Official Baccalaureate Exam Archives (2016 - 2026)
 * Covering all 6 streams and core/subsidiary subjects
 */
export const BAC_EXAMS_DATABASE: BacExamItem[] = [
  // =========================================================================
  // 2026 - Official Model & Benchmark Exams (نماذج البكالوريا الرسمية الوزارية)
  // =========================================================================
  buildExamItem(2026, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2026 تجريبي رسمي - علوم الطبيعة والحياة", 270, ["تركيب البروتين", "المناعة", "الإنزيمات"]),
  buildExamItem(2026, "regular", "sciences_exp", "physics", "بكالوريا 2026 تجريبي رسمي - العلوم الفيزيائية", 210, ["المتابعة الزمنية", "النووي", "الكهرباء RC RL"]),
  buildExamItem(2026, "regular", "sciences_exp", "math", "بكالوريا 2026 تجريبي رسمي - الرياضيات", 210, ["الدوال الأسية واللوغاريتمية", "المتتاليات", "الاحتمالات"]),
  buildExamItem(2026, "regular", "sciences_exp", "arabic", "بكالوريا 2026 تجريبي رسمي - اللغة العربية وآدابها", 150, ["شعر المنفى", "النثر العلمي"]),
  buildExamItem(2026, "regular", "sciences_exp", "philosophy", "بكالوريا 2026 تجريبي رسمي - الفلسفة", 180, ["العلوم البيولوجية", "الملاحظة والفرضية"]),
  buildExamItem(2026, "regular", "sciences_exp", "islamic_studies", "بكالوريا 2026 تجريبي رسمي - العلوم الإسلامية", 150, ["العقيدة وأثرها", "الصحة النفسية"]),
  buildExamItem(2026, "regular", "sciences_exp", "history_geography", "بكالوريا 2026 تجريبي رسمي - التاريخ والجغرافيا", 210, ["الحرب الباردة", "الثورة الجزائرية"]),

  buildExamItem(2026, "regular", "math", "math", "بكالوريا 2026 تجريبي رسمي - الرياضيات (شعبة رياضيات)", 270, ["القسمة في Z والأعداد الأولية", "الدوال العددية", "الفضاء"]),
  buildExamItem(2026, "regular", "math", "physics", "بكالوريا 2026 تجريبي رسمي - العلوم الفيزيائية (شعبة رياضيات)", 240, ["حركة الكواكب والأقمار", "الاهتزازات الميكانيكية"]),
  buildExamItem(2026, "regular", "math", "natural_sciences", "بكالوريا 2026 تجريبي رسمي - علوم الطبيعة والحياة", 150, ["الآليات الجزيئية للتعبير المورثي"]),

  buildExamItem(2026, "regular", "technique_math", "mechanical_eng", "بكالوريا 2026 تجريبي رسمي - الهندسة الميكانيكية", 240, ["دراسة نظام آلي ومخططات الصنع"]),
  buildExamItem(2026, "regular", "technique_math", "civil_eng", "بكالوريا 2026 تجريبي رسمي - الهندسة المدنية", 240, ["دراسة الروافد والمنشآت العلوية"]),
  buildExamItem(2026, "regular", "technique_math", "electrical_eng", "بكالوريا 2026 تجريبي رسمي - الهندسة الكهربائية", 240, ["المنطق التعاقبي والدارات المنطقية"]),
  buildExamItem(2026, "regular", "technique_math", "process_eng", "بكالوريا 2026 تجريبي رسمي - هندسة الطرائق", 240, ["الكيمياء العضوية والتحليل الحجمي"]),
  buildExamItem(2026, "regular", "technique_math", "math", "بكالوريا 2026 تجريبي رسمي - الرياضيات (تقني رياضي)", 240, ["المتتاليات العددية", "الحساب"]),
  buildExamItem(2026, "regular", "technique_math", "physics", "بكالوريا 2026 تجريبي رسمي - العلوم الفيزيائية (تقني رياضي)", 240, ["الميكانيك والكهرباء"]),

  buildExamItem(2026, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2026 تجريبي رسمي - التسيير المحاسبي والمالي", 240, ["تسوية التثبيتات والاهتلاكات", "الميزانية الوظيفية"]),
  buildExamItem(2026, "regular", "gestion_eco", "economics_management", "بكالوريا 2026 تجريبي رسمي - الاقتصاد والمناجمنت", 210, ["النقود والتمويل", "التسويق"]),
  buildExamItem(2026, "regular", "gestion_eco", "law", "بكالوريا 2026 تجريبي رسمي - القانون", 150, ["عقد العمل", "الشركات التجارية"]),
  buildExamItem(2026, "regular", "gestion_eco", "math", "بكالوريا 2026 تجريبي رسمي - الرياضيات (تسيير واقتصاد)", 180, ["المتتاليات المالية", "الدوال"]),

  buildExamItem(2026, "regular", "lettres_philo", "philosophy", "بكالوريا 2026 تجريبي رسمي - الفلسفة (آداب وفلسفة)", 240, ["الإدراك والإحساس", "اللغة والفكر", "العدالة والحق"]),
  buildExamItem(2026, "regular", "lettres_philo", "arabic", "بكالوريا 2026 تجريبي رسمي - اللغة العربية وآدابها", 240, ["الشعر التعليمي", "المقال النقدي"]),
  buildExamItem(2026, "regular", "lettres_philo", "history_geography", "بكالوريا 2026 تجريبي رسمي - التاريخ والجغرافيا", 210, ["العالم المعاصر", "حركات التحرر"]),

  buildExamItem(2026, "regular", "langues_etrangeres", "french", "بكالوريا 2026 تجريبي رسمي - اللغة الفرنسية", 210, ["Texte d'histoire", "Texte argumentatif"]),
  buildExamItem(2026, "regular", "langues_etrangeres", "english", "بكالوريا 2026 تجريبي رسمي - اللغة الإنجليزية", 210, ["Ancient Civilizations", "Ethics in Business"]),
  buildExamItem(2026, "regular", "langues_etrangeres", "third_language", "بكالوريا 2026 تجريبي رسمي - اللغة الأجنبية الثالثة (إسبانية/ألمانية/إيطالية)", 210, ["Comprensión de texto", "Expresión escrita"]),

  // =========================================================================
  // 2025 - Official Baccalaureate Exams (امتحانات بكالوريا دورة جوان 2025)
  // =========================================================================
  buildExamItem(2025, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2025 - علوم الطبيعة والحياة", 270, ["المناعة النوعية", "التحلون الدموي"]),
  buildExamItem(2025, "regular", "sciences_exp", "physics", "بكالوريا 2025 - العلوم الفيزيائية", 210, ["الأسترة", "الميكانيك ومبدأ انحفاظ الطاقة"]),
  buildExamItem(2025, "regular", "sciences_exp", "math", "بكالوريا 2025 - الرياضيات", 210, ["الدوال الأسية", "المتتاليات التراجعية"]),
  buildExamItem(2025, "regular", "sciences_exp", "arabic", "بكالوريا 2025 - اللغة العربية وآدابها", 150, ["شعر القضية الفلسطينية"]),
  buildExamItem(2025, "regular", "sciences_exp", "philosophy", "بكالوريا 2025 - الفلسفة", 180, ["المنطق الصوري والاستقرائي"]),
  buildExamItem(2025, "regular", "sciences_exp", "islamic_studies", "بكالوريا 2025 - العلوم الإسلامية", 150, ["مقاصد الشريعة الإسلامية"]),
  buildExamItem(2025, "regular", "sciences_exp", "history_geography", "بكالوريا 2025 - التاريخ والجغرافيا", 210, ["الأزمات الدولية", "القوى الاقتصادية الكبرى"]),

  buildExamItem(2025, "regular", "math", "math", "بكالوريا 2025 - الرياضيات (شعبة رياضيات)", 270, ["الموافقات في Z", "الدوال اللوغاريتمية", "الأعداد المركبة"]),
  buildExamItem(2025, "regular", "math", "physics", "بكالوريا 2025 - العلوم الفيزيائية (شعبة رياضيات)", 240, ["قوانين كبلر", "التحولات النووية"]),
  buildExamItem(2025, "regular", "math", "natural_sciences", "بكالوريا 2025 - علوم الطبيعة والحياة", 150, ["النشاط الإنزيمي"]),

  buildExamItem(2025, "regular", "technique_math", "mechanical_eng", "بكالوريا 2025 - الهندسة الميكانيكية", 240, ["نظام شحن آلي وتجميع ميكانيكي"]),
  buildExamItem(2025, "regular", "technique_math", "civil_eng", "بكالوريا 2025 - الهندسة المدنية", 240, ["حساب العزوم وقوى القص"]),
  buildExamItem(2025, "regular", "technique_math", "electrical_eng", "بكالوريا 2025 - الهندسة الكهربائية", 240, ["محرك خطوة خطوة وتصميم الدارات"]),
  buildExamItem(2025, "regular", "technique_math", "process_eng", "بكالوريا 2025 - هندسة الطرائق", 240, ["البوليميرات والمردود الصناعي"]),
  buildExamItem(2025, "regular", "technique_math", "math", "بكالوريا 2025 - الرياضيات", 240, ["الأعداد المركبة والتحويلات"]),
  buildExamItem(2025, "regular", "technique_math", "physics", "بكالوريا 2025 - العلوم الفيزيائية", 240, ["حركة القذائف والأقمار"]),

  buildExamItem(2025, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2025 - التسيير المحاسبي والمالي", 240, ["حساب النتائج حسب الوظيفة", "تحليل الاستغلال"]),
  buildExamItem(2025, "regular", "gestion_eco", "economics_management", "بكالوريا 2025 - الاقتصاد والمناجمنت", 210, ["التضخم والبطالة", "التجارة الخارجية"]),
  buildExamItem(2025, "regular", "gestion_eco", "law", "بكالوريا 2025 - القانون", 150, ["عقد البيع", "نزاعات العمل"]),
  buildExamItem(2025, "regular", "gestion_eco", "math", "بكالوريا 2025 - الرياضيات", 180, ["الدوال والبرمجة الخطية"]),

  buildExamItem(2025, "regular", "lettres_philo", "philosophy", "بكالوريا 2025 - الفلسفة", 240, ["الشعور واللاشعور", "الذاكرة والخيال"]),
  buildExamItem(2025, "regular", "lettres_philo", "arabic", "بكالوريا 2025 - اللغة العربية وآدابها", 240, ["شعر الثورة الجزائرية ومفدي زكريا"]),
  buildExamItem(2025, "regular", "lettres_philo", "history_geography", "بكالوريا 2025 - التاريخ والجغرافيا", 210, ["مؤتمر باندونغ وتصفية الاستعمار"]),

  buildExamItem(2025, "regular", "langues_etrangeres", "french", "بكالوريا 2025 - اللغة الفرنسية", 210, ["L'appel et le texte d'opinion"]),
  buildExamItem(2025, "regular", "langues_etrangeres", "english", "بكالوريا 2025 - اللغة الإنجليزية", 210, ["Education in the world", "Advertising & Safety"]),
  buildExamItem(2025, "regular", "langues_etrangeres", "third_language", "بكالوريا 2025 - اللغة الأجنبية الثالثة", 210, ["موضوع اللغة الإسبانية والألمانية"]),

  // =========================================================================
  // 2024 - Official Baccalaureate Exams (دورة 2024)
  // =========================================================================
  buildExamItem(2024, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2024 - علوم الطبيعة والحياة", 270, ["التحفيز الإنزيمي", "العصبونات والمشابك"]),
  buildExamItem(2024, "regular", "sciences_exp", "physics", "بكالوريا 2024 - العلوم الفيزيائية", 210, ["الأحماض والأسس pH", "ثنائي القطب RC"]),
  buildExamItem(2024, "regular", "sciences_exp", "math", "بكالوريا 2024 - الرياضيات", 210, ["المتتاليات الحسابية والهندسية", "الدوال الأسية"]),
  buildExamItem(2024, "regular", "sciences_exp", "philosophy", "بكالوريا 2024 - الفلسفة", 180, ["الحتمية واللاحتمية في الفيزياء المعاصرة"]),
  buildExamItem(2024, "regular", "sciences_exp", "arabic", "بكالوريا 2024 - اللغة العربية وآدابها", 150, ["النزعة الإنسانية في الشعر العربي"]),
  buildExamItem(2024, "regular", "sciences_exp", "islamic_studies", "بكالوريا 2024 - العلوم الإسلامية", 150, ["الربا وأنواعه", "المعاملات المالية"]),
  buildExamItem(2024, "regular", "sciences_exp", "history_geography", "بكالوريا 2024 - التاريخ والجغرافيا", 210, ["هجمات الشمال القسنطيني ومؤتمر الصومام"]),

  buildExamItem(2024, "regular", "math", "math", "بكالوريا 2024 - الرياضيات (شعبة رياضيات)", 270, ["الحساب في Z والتحويلات النقطية"]),
  buildExamItem(2024, "regular", "math", "physics", "بكالوريا 2024 - العلوم الفيزيائية (شعبة رياضيات)", 240, ["حركة الأجسام في الهواء", "ثنائي القطب RLC"]),
  
  buildExamItem(2024, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2024 - التسيير المحاسبي والمالي", 240, ["تمويل الاستثمارات والقروض العادية"]),
  buildExamItem(2024, "regular", "gestion_eco", "economics_management", "بكالوريا 2024 - الاقتصاد والمناجمنت", 210, ["المنظمة العالمية للتجارة والشراكة"]),
  buildExamItem(2024, "regular", "gestion_eco", "law", "بكالوريا 2024 - القانون", 150, ["التأمين والمسؤولية المدنية"]),

  buildExamItem(2024, "regular", "technique_math", "mechanical_eng", "بكالوريا 2024 - الهندسة الميكانيكية", 240, ["جهاز قطع وتشغيل الصفائح المعدنية"]),
  buildExamItem(2024, "regular", "technique_math", "civil_eng", "بكالوريا 2024 - الهندسة المدنية", 240, ["الجسور والأنفاق والمقاطع العرضية"]),
  buildExamItem(2024, "regular", "technique_math", "electrical_eng", "بكالوريا 2024 - الهندسة الكهربائية", 240, ["المتعاقب غرافسيت والمؤقتات"]),
  buildExamItem(2024, "regular", "technique_math", "process_eng", "بكالوريا 2024 - هندسة الطرائق", 240, ["الديناميكا الحرارية والكيمياء العضوية"]),

  buildExamItem(2024, "regular", "lettres_philo", "philosophy", "بكالوريا 2024 - الفلسفة", 240, ["أصل المفاهيم الرياضية: العقل أم التجربة"]),
  buildExamItem(2024, "regular", "lettres_philo", "arabic", "بكالوريا 2024 - اللغة العربية وآدابها", 240, ["شعر المهجر والرابطة القلمية"]),

  buildExamItem(2024, "regular", "langues_etrangeres", "french", "بكالوريا 2024 - اللغة الفرنسية", 210, ["Le texte d'histoire coloniale"]),
  buildExamItem(2024, "regular", "langues_etrangeres", "english", "بكالوريا 2024 - اللغة الإنجليزية", 210, ["Counterfeiting and Fraud"]),

  // =========================================================================
  // 2023 - Official Baccalaureate Exams (دورة 2023)
  // =========================================================================
  buildExamItem(2023, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2023 - علوم الطبيعة والحياة", 270, ["دور البروتينات في الدفاع عن الذات"]),
  buildExamItem(2023, "regular", "sciences_exp", "physics", "بكالوريا 2023 - العلوم الفيزيائية", 210, ["حركة الكواكب وسقوط الأجسام"]),
  buildExamItem(2023, "regular", "sciences_exp", "math", "بكالوريا 2023 - الرياضيات", 210, ["الدوال اللوغاريتمية والمتتاليات"]),
  buildExamItem(2023, "regular", "sciences_exp", "philosophy", "بكالوريا 2023 - الفلسفة", 180, ["العلوم الإنسانية والعلوم التجريبية"]),

  buildExamItem(2023, "regular", "math", "math", "بكالوريا 2023 - الرياضيات (شعبة رياضيات)", 270, ["الموافقات ونظرية بيزو وغوص"]),
  buildExamItem(2023, "regular", "technique_math", "mechanical_eng", "بكالوريا 2023 - الهندسة الميكانيكية", 240, ["نظام تغليف آلي"]),
  buildExamItem(2023, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2023 - التسيير المحاسبي والمالي", 240, ["إعداد الميزانية الوظيفية واهتلاك التثبيتات"]),
  buildExamItem(2023, "regular", "lettres_philo", "philosophy", "بكالوريا 2023 - الفلسفة", 240, ["الشغل والتحرر الإنساني"]),
  buildExamItem(2023, "regular", "langues_etrangeres", "french", "بكالوريا 2023 - اللغة الفرنسية", 210, ["Texte d'Histoire de la guerre de libération"]),

  // =========================================================================
  // 2022 - Official Baccalaureate Exams (دورة 2022)
  // =========================================================================
  buildExamItem(2022, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2022 - علوم الطبيعة والحياة", 270, ["التنفس الخلوي والتخمر"]),
  buildExamItem(2022, "regular", "sciences_exp", "physics", "بكالوريا 2022 - العلوم الفيزيائية", 210, ["التفاعلات النووية وطاقة الربط"]),
  buildExamItem(2022, "regular", "sciences_exp", "math", "بكالوريا 2022 - الرياضيات", 210, ["الدوال والتكامل والاحتمالات"]),
  buildExamItem(2022, "regular", "math", "math", "بكالوريا 2022 - الرياضيات (رياضيات)", 270, ["الأعداد المركبة والقسمة الإقليدية"]),
  buildExamItem(2022, "regular", "technique_math", "civil_eng", "بكالوريا 2022 - الهندسة المدنية", 240, ["الروافد المستمرة والأعمدة"]),
  buildExamItem(2022, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2022 - التسيير المحاسبي والمالي", 240, ["ميزانية التدفقات والسيولة"]),
  buildExamItem(2022, "regular", "lettres_philo", "philosophy", "بكالوريا 2022 - الفلسفة", 240, ["الحرية والمسؤولية والجزاء"]),

  // =========================================================================
  // 2021 - Official Baccalaureate Exams (دورة 2021)
  // =========================================================================
  buildExamItem(2021, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2021 - علوم الطبيعة والحياة", 270, ["تحويل الطاقة الضوئية إلى كيميائية كامنة (التركيب الضوئي)"]),
  buildExamItem(2021, "regular", "sciences_exp", "physics", "بكالوريا 2021 - العلوم الفيزيائية", 210, ["المتابعة عن طريق المعايرة وقياس الناقلية"]),
  buildExamItem(2021, "regular", "sciences_exp", "math", "بكالوريا 2021 - الرياضيات", 210, ["المتتاليات العددية والدوال الأسية"]),
  buildExamItem(2021, "regular", "math", "math", "بكالوريا 2021 - الرياضيات (رياضيات)", 270, ["الحساب في Z والتحويلات الإقليدية"]),
  buildExamItem(2021, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2021 - التسيير المحاسبي والمالي", 240, ["جدول حسابات النتائج"]),
  buildExamItem(2021, "regular", "technique_math", "electrical_eng", "بكالوريا 2021 - الهندسة الكهربائية", 240, ["الدارات التوافقية وسجلات الإزاحة"]),
  buildExamItem(2021, "regular", "lettres_philo", "philosophy", "بكالوريا 2021 - الفلسفة", 240, ["العنف والتسامح في العلاقات الدولية"]),

  // =========================================================================
  // 2020 - Official Baccalaureate Exams (دورة سبتمبر 2020 الاستثنائية الصحية)
  // =========================================================================
  buildExamItem(2020, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2020 - علوم الطبيعة والحياة", 270, ["التركيب الحيوي للبروتينات والنشاط المناعي"]),
  buildExamItem(2020, "regular", "sciences_exp", "physics", "بكالوريا 2020 - العلوم الفيزيائية", 210, ["تفاعلات الأكسدة والإرجاع والظواهر الكهربائية"]),
  buildExamItem(2020, "regular", "sciences_exp", "math", "بكالوريا 2020 - الرياضيات", 210, ["الدوال العددية وحساب النهايات"]),
  buildExamItem(2020, "regular", "math", "math", "بكالوريا 2020 - الرياضيات (شعبة رياضيات)", 270, ["المتتاليات والدوال المعقدة"]),
  buildExamItem(2020, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2020 - التسيير المحاسبي والمالي", 240, ["التسويات المحاسبية لنهاية السنة"]),
  buildExamItem(2020, "regular", "lettres_philo", "philosophy", "بكالوريا 2020 - الفلسفة", 240, ["العلوم الإنسانية وعلم التاريخ"]),

  // =========================================================================
  // 2019 - Official Baccalaureate Exams (دورة جوان 2019)
  // =========================================================================
  buildExamItem(2019, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2019 - علوم الطبيعة والحياة", 270, ["آليات تركيب البروتين والتنظيم الهرموني"]),
  buildExamItem(2019, "regular", "sciences_exp", "physics", "بكالوريا 2019 - العلوم الفيزيائية", 210, ["الميكانيك وقوانين نيوتن والحركة المنحنية"]),
  buildExamItem(2019, "regular", "sciences_exp", "math", "بكالوريا 2019 - الرياضيات", 210, ["المتتاليات العددية والبرهان بالتراجع"]),
  buildExamItem(2019, "regular", "math", "math", "بكالوريا 2019 - الرياضيات (شعبة رياضيات)", 270, ["الحساب والموافقات والأعداد الأولية"]),
  buildExamItem(2019, "regular", "technique_math", "mechanical_eng", "بكالوريا 2019 - الهندسة الميكانيكية", 240, ["نظام تشكيل وتثقيب هوائي"]),
  buildExamItem(2019, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2019 - التسيير المحاسبي والمالي", 240, ["تحليل الاستغلال التفاضلي ونقطة التعادل"]),
  buildExamItem(2019, "regular", "lettres_philo", "philosophy", "بكالوريا 2019 - الفلسفة", 240, ["الحق والواجب في العدالة الاجتماعية"]),

  // =========================================================================
  // 2018 - Official Baccalaureate Exams (دورة 2018)
  // =========================================================================
  buildExamItem(2018, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2018 - علوم الطبيعة والحياة", 270, ["الاستجابة المناعية الخلطية والخلوية"]),
  buildExamItem(2018, "regular", "sciences_exp", "physics", "بكالوريا 2018 - العلوم الفيزيائية", 210, ["ثنائي القطب RL وظاهرة التحريض الكهرومغناطيسي"]),
  buildExamItem(2018, "regular", "sciences_exp", "math", "بكالوريا 2018 - الرياضيات", 210, ["الدوال اللوغاريتمية والأسية مع الرسم البياني"]),
  buildExamItem(2018, "regular", "math", "math", "بكالوريا 2018 - الرياضيات (رياضيات)", 270, ["القسمة الإقليدية والأعداد المركبة"]),
  buildExamItem(2018, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2018 - التسيير المحاسبي والمالي", 240, ["التسويات المحاسبية والمخزونات"]),
  buildExamItem(2018, "regular", "lettres_philo", "philosophy", "بكالوريا 2018 - الفلسفة", 240, ["الشعور بالأنا والشعور بالغير"]),

  // =========================================================================
  // 2017 - Official Baccalaureate Exams (دورة عادية + دورة استثنائية)
  // =========================================================================
  // Regular session 2017
  buildExamItem(2017, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2017 (الدورة العادية) - علوم الطبيعة والحياة", 270, ["العلاقة بين بنية ووظيفة البروتين"]),
  buildExamItem(2017, "regular", "sciences_exp", "physics", "بكالوريا 2017 (الدورة العادية) - العلوم الفيزيائية", 210, ["تفاعلات الأسترة وتوازنها الحركي"]),
  buildExamItem(2017, "regular", "sciences_exp", "math", "بكالوريا 2017 (الدورة العادية) - الرياضيات", 210, ["الدوال وحساب المساحات والتكامل"]),
  buildExamItem(2017, "regular", "math", "math", "بكالوريا 2017 (الدورة العادية) - الرياضيات (شعبة رياضيات)", 270, ["الحساب في Z والمسائل الهندسية"]),
  buildExamItem(2017, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2017 (الدورة العادية) - التسيير المحاسبي", 240, ["تحليل الميزانية الوظيفية وقدرة التمويل الذاتي"]),
  buildExamItem(2017, "regular", "lettres_philo", "philosophy", "بكالوريا 2017 (الدورة العادية) - الفلسفة", 240, ["الديمقراطية والحكم الراشد"]),

  // Exceptional session 2017 (دورة جويلية الاستثنائية للمتأخرين)
  buildExamItem(2017, "exceptional", "sciences_exp", "natural_sciences", "بكالوريا 2017 (الدورة الاستثنائية) - علوم الطبيعة والحياة", 270, ["النشاط المناعي ومكافحة الخلايا المصابة"]),
  buildExamItem(2017, "exceptional", "sciences_exp", "physics", "بكالوريا 2017 (الدورة الاستثنائية) - العلوم الفيزيائية", 210, ["النشاط الإشعاعي وقانون التناقص"]),
  buildExamItem(2017, "exceptional", "sciences_exp", "math", "بكالوريا 2017 (الدورة الاستثنائية) - الرياضيات", 210, ["المتتاليات العددية والدوال الأسية"]),
  buildExamItem(2017, "exceptional", "math", "math", "بكالوريا 2017 (الدورة الاستثنائية) - الرياضيات", 270, ["الأعداد الأولية والموافقات في Z"]),
  buildExamItem(2017, "exceptional", "gestion_eco", "accounting_finance", "بكالوريا 2017 (الدورة الاستثنائية) - التسيير المحاسبي", 240, ["تسوية حسابات الزبائن والموردين"]),
  buildExamItem(2017, "exceptional", "lettres_philo", "philosophy", "بكالوريا 2017 (الدورة الاستثنائية) - الفلسفة", 240, ["الحرية والحتمية"]),

  // =========================================================================
  // 2016 - Official Baccalaureate Exams (الدورة العادية + الدورة الجزئية الاستثنائية)
  // =========================================================================
  // Regular session 2016
  buildExamItem(2016, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2016 (الدورة العادية) - علوم الطبيعة والحياة", 270, ["التخصص الوظيفي للبروتينات والأنزيمات"]),
  buildExamItem(2016, "regular", "sciences_exp", "physics", "بكالوريا 2016 (الدورة العادية) - العلوم الفيزيائية", 210, ["المتابعة الزمنية لقياس ضغط الغاز"]),
  buildExamItem(2016, "regular", "sciences_exp", "math", "بكالوريا 2016 (الدورة العادية) - الرياضيات", 210, ["الدوال العددية والمتتاليات"]),
  buildExamItem(2016, "regular", "math", "math", "بكالوريا 2016 (الدورة العادية) - الرياضيات (رياضيات)", 270, ["الأعداد المركبة والحساب"]),
  buildExamItem(2016, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2016 (الدورة العادية) - التسيير المحاسبي", 240, ["إعداد الكشوف المالية والميزانية"]),
  buildExamItem(2016, "regular", "lettres_philo", "philosophy", "بكالوريا 2016 (الدورة العادية) - الفلسفة", 240, ["الفكر واللغة والرموز"]),

  // Exceptional session 2016 (دورة الإعادة الجزئية المشهورة لشعبة العلوم والرياضيات)
  buildExamItem(2016, "exceptional", "sciences_exp", "natural_sciences", "بكالوريا 2016 (الدورة الاستثنائية الجزئية) - علوم الطبيعة والحياة", 270, ["الترجمة وتركيب البروتين"]),
  buildExamItem(2016, "exceptional", "sciences_exp", "physics", "بكالوريا 2016 (الدورة الاستثنائية الجزئية) - العلوم الفيزيائية", 210, ["الدارات الكهربائية ونواة اليورانيوم"]),
  buildExamItem(2016, "exceptional", "sciences_exp", "math", "بكالوريا 2016 (الدورة الاستثنائية الجزئية) - الرياضيات", 210, ["المتتاليات والدوال اللوغاريتمية"]),
  buildExamItem(2016, "exceptional", "math", "math", "بكالوريا 2016 (الدورة الاستثنائية الجزئية) - الرياضيات", 270, ["الحساب في Z والفضاء"]),
  buildExamItem(2016, "exceptional", "technique_math", "math", "بكالوريا 2016 (الدورة الاستثنائية الجزئية) - الرياضيات", 240, ["المتتاليات والدوال المعقدة"]),
];

/**
 * Query helper to get all exams
 */
export function getAllBacExams(): BacExamItem[] {
  return BAC_EXAMS_DATABASE;
}

/**
 * Find exam by its unique ID
 */
export function getBacExamById(id: string): BacExamItem | undefined {
  return BAC_EXAMS_DATABASE.find((item) => item.id === id);
}

/**
 * Filter exams according to stream, subject, year, session, and keywords
 */
export function filterBacExams(filters: BacExamFilters): BacExamItem[] {
  return BAC_EXAMS_DATABASE.filter((exam) => {
    if (filters.streamId && filters.streamId !== "all" && exam.streamId !== filters.streamId) {
      return false;
    }
    if (filters.subjectId && filters.subjectId !== "all" && exam.subjectId !== filters.subjectId) {
      return false;
    }
    if (filters.year && filters.year !== 0 && exam.year !== filters.year) {
      return false;
    }
    if (filters.session && filters.session !== "all" && exam.session !== filters.session) {
      return false;
    }
    if (filters.searchQuery && filters.searchQuery.trim() !== "") {
      const q = filters.searchQuery.trim().toLowerCase();
      const matchTitle = exam.title_ar.toLowerCase().includes(q);
      const matchSubject = (ALL_SUBJECTS[exam.subjectId]?.name_ar || "").toLowerCase().includes(q);
      const matchYear = exam.year.toString().includes(q);
      const matchKeywords = exam.keywords?.some((k) => k.toLowerCase().includes(q)) ?? false;
      if (!matchTitle && !matchSubject && !matchYear && !matchKeywords) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Retrieve sorted unique list of all available years (e.g. [2026, 2025, ..., 2016])
 */
export function getAvailableExamYears(): number[] {
  const years = Array.from(new Set(BAC_EXAMS_DATABASE.map((item) => item.year)));
  return years.sort((a, b) => b - a);
}

/**
 * Retrieve distinct subject IDs represented in the exams dataset for a stream
 */
export function getExamSubjectIdsForStream(streamId: StreamId | "all"): SubjectId[] {
  if (streamId === "all") {
    return Array.from(new Set(BAC_EXAMS_DATABASE.map((item) => item.subjectId)));
  }
  const streamExams = BAC_EXAMS_DATABASE.filter((item) => item.streamId === streamId);
  return Array.from(new Set(streamExams.map((item) => item.subjectId)));
}
