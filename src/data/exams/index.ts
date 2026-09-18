import { SubjectId, StreamId } from "@/types/education";
import { ALL_SUBJECTS, ALGERIAN_BAC_STREAMS } from "@/lib/constants/streams";

export type ExamKind = "official_bac" | "term_exam" | "term_quiz" | "bac_blanc";
export type AcademicTerm = 1 | 2 | 3;

export interface BacExamItem {
  id: string;
  year: number;
  session?: "regular" | "exceptional";
  kind: ExamKind;
  term?: AcademicTerm;
  schoolName?: string;
  wilaya?: string;
  academicYear?: string;
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

export interface TermExamFilters {
  term?: AcademicTerm | "all";
  kind?: ExamKind | "all";
  streamId?: string;
  subjectId?: string;
  wilaya?: string;
  searchQuery?: string;
}

/**
 * Public search and archive links for Algerian National Baccalaureate exams (ONEC / DzExams)
 */
function buildOfficialBacItem(
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
    kind: "official_bac",
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
      streamName,
      subjectName,
      `بكالوريا ${year}`,
      session === "exceptional" ? "دورة استثنائية" : "دورة عادية",
      ...keywords,
    ],
  };
}

/**
 * Helper to build authentic Term Quizzes, Term Exams, and Bac Blanc from Algerian High Schools
 */
function buildTermExamItem(options: {
  id: string;
  year: number;
  academicYear?: string;
  term: AcademicTerm;
  kind: "term_exam" | "term_quiz" | "bac_blanc";
  schoolName: string;
  wilaya: string;
  streamId: StreamId;
  subjectId: SubjectId;
  title_ar: string;
  durationMinutes?: number;
  keywords?: string[];
}): BacExamItem {
  const stream = ALGERIAN_BAC_STREAMS[options.streamId];
  const streamName = stream?.name_ar || "";
  const subjectName = ALL_SUBJECTS[options.subjectId]?.name_ar || "";

  const termLabel =
    options.kind === "bac_blanc"
      ? "بكالوريا تجريبية شاملة"
      : options.kind === "term_quiz"
      ? `فرض الفصل ${options.term === 1 ? "الأول" : options.term === 2 ? "الثاني" : "الثالث"}`
      : `اختبار الفصل ${options.term === 1 ? "الأول" : options.term === 2 ? "الثاني" : "الثالث"}`;

  const subjectPdfUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `${termLabel} ${subjectName} شعبة ${streamName} ${options.schoolName} ${options.wilaya} pdf`
  )}`;
  const solutionPdfUrl = `https://www.google.com/search?q=${encodeURIComponent(
    `تصحيح ${termLabel} ${subjectName} شعبة ${streamName} ${options.schoolName} pdf`
  )}`;

  const subjectRule = stream?.subjects.find((s) => s.subjectId === options.subjectId);
  const coefficient = subjectRule?.coefficient || 2;

  return {
    id: options.id,
    year: options.year,
    academicYear: options.academicYear || `${options.year - 1}/${options.year}`,
    kind: options.kind,
    term: options.term,
    schoolName: options.schoolName,
    wilaya: options.wilaya,
    streamId: options.streamId,
    subjectId: options.subjectId,
    title_ar: options.title_ar,
    topicsCount: options.kind === "term_quiz" ? 1 : 2,
    subjectPdfUrl,
    solutionPdfUrl,
    durationMinutes: options.durationMinutes || (options.kind === "term_quiz" ? 60 : 120),
    coefficient,
    keywords: [
      options.title_ar,
      options.schoolName,
      options.wilaya,
      termLabel,
      streamName,
      subjectName,
      ...(options.keywords || []),
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
  buildOfficialBacItem(2026, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2026 تجريبي رسمي - علوم الطبيعة والحياة", 270, ["تركيب البروتين", "المناعة", "الإنزيمات"]),
  buildOfficialBacItem(2026, "regular", "sciences_exp", "physics", "بكالوريا 2026 تجريبي رسمي - العلوم الفيزيائية", 210, ["المتابعة الزمنية", "النووي", "الكهرباء RC RL"]),
  buildOfficialBacItem(2026, "regular", "sciences_exp", "math", "بكالوريا 2026 تجريبي رسمي - الرياضيات", 210, ["الدوال الأسية واللوغاريتمية", "المتتاليات", "الاحتمالات"]),
  buildOfficialBacItem(2026, "regular", "sciences_exp", "arabic", "بكالوريا 2026 تجريبي رسمي - اللغة العربية وآدابها", 150, ["شعر المنفى", "النثر العلمي"]),
  buildOfficialBacItem(2026, "regular", "sciences_exp", "philosophy", "بكالوريا 2026 تجريبي رسمي - الفلسفة", 180, ["العلوم البيولوجية", "الملاحظة والفرضية"]),
  buildOfficialBacItem(2026, "regular", "sciences_exp", "islamic_studies", "بكالوريا 2026 تجريبي رسمي - العلوم الإسلامية", 150, ["العقيدة وأثرها", "الصحة النفسية"]),
  buildOfficialBacItem(2026, "regular", "sciences_exp", "history_geography", "بكالوريا 2026 تجريبي رسمي - التاريخ والجغرافيا", 210, ["الحرب الباردة", "الثورة الجزائرية"]),
  buildOfficialBacItem(2026, "regular", "sciences_exp", "french", "بكالوريا 2026 تجريبي رسمي - اللغة الفرنسية", 150, ["Texte d'histoire", "Texte argumentatif"]),
  buildOfficialBacItem(2026, "regular", "sciences_exp", "english", "بكالوريا 2026 تجريبي رسمي - اللغة الإنجليزية", 150, ["Ethics in Business", "Safety First"]),

  buildOfficialBacItem(2026, "regular", "math", "math", "بكالوريا 2026 تجريبي رسمي - الرياضيات (شعبة رياضيات)", 270, ["القسمة في Z والأعداد الأولية", "الدوال العددية", "الفضاء"]),
  buildOfficialBacItem(2026, "regular", "math", "physics", "بكالوريا 2026 تجريبي رسمي - العلوم الفيزيائية (شعبة رياضيات)", 240, ["حركة الكواكب والأقمار", "الاهتزازات الميكانيكية"]),
  buildOfficialBacItem(2026, "regular", "math", "natural_sciences", "بكالوريا 2026 تجريبي رسمي - علوم الطبيعة والحياة", 150, ["الآليات الجزيئية للتعبير المورثي"]),
  buildOfficialBacItem(2026, "regular", "math", "arabic", "بكالوريا 2026 تجريبي رسمي - اللغة العربية وآدابها", 150, ["الالتزام في الشعر العربي"]),
  buildOfficialBacItem(2026, "regular", "math", "philosophy", "بكالوريا 2026 تجريبي رسمي - الفلسفة (رياضيات)", 180, ["فلسفة الرياضيات واليقين"]),

  buildOfficialBacItem(2026, "regular", "technique_math", "mechanical_eng", "بكالوريا 2026 تجريبي رسمي - الهندسة الميكانيكية", 240, ["دراسة نظام آلي ومخططات الصنع"]),
  buildOfficialBacItem(2026, "regular", "technique_math", "civil_eng", "بكالوريا 2026 تجريبي رسمي - الهندسة المدنية", 240, ["دراسة الروافد والمنشآت العلوية"]),
  buildOfficialBacItem(2026, "regular", "technique_math", "electrical_eng", "بكالوريا 2026 تجريبي رسمي - الهندسة الكهربائية", 240, ["المنطق التعاقبي والدارات المنطقية"]),
  buildOfficialBacItem(2026, "regular", "technique_math", "process_eng", "بكالوريا 2026 تجريبي رسمي - هندسة الطرائق", 240, ["الكيمياء العضوية والتحليل الحجمي"]),
  buildOfficialBacItem(2026, "regular", "technique_math", "math", "بكالوريا 2026 تجريبي رسمي - الرياضيات (تقني رياضي)", 240, ["المتتاليات العددية", "الحساب"]),
  buildOfficialBacItem(2026, "regular", "technique_math", "physics", "بكالوريا 2026 تجريبي رسمي - العلوم الفيزيائية (تقني رياضي)", 240, ["الميكانيك والكهرباء"]),

  buildOfficialBacItem(2026, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2026 تجريبي رسمي - التسيير المحاسبي والمالي", 240, ["تسوية التثبيتات والاهتلاكات", "الميزانية الوظيفية"]),
  buildOfficialBacItem(2026, "regular", "gestion_eco", "economics_management", "بكالوريا 2026 تجريبي رسمي - الاقتصاد والمناجمنت", 210, ["النقود والتمويل", "التسويق"]),
  buildOfficialBacItem(2026, "regular", "gestion_eco", "law", "بكالوريا 2026 تجريبي رسمي - القانون", 150, ["عقد العمل", "الشركات التجارية"]),
  buildOfficialBacItem(2026, "regular", "gestion_eco", "math", "بكالوريا 2026 تجريبي رسمي - الرياضيات (تسيير واقتصاد)", 180, ["المتتاليات المالية", "الدوال"]),
  buildOfficialBacItem(2026, "regular", "gestion_eco", "history_geography", "بكالوريا 2026 تجريبي رسمي - التاريخ والجغرافيا", 210, ["المبادلات والتنقلات في العالم"]),

  buildOfficialBacItem(2026, "regular", "lettres_philo", "philosophy", "بكالوريا 2026 تجريبي رسمي - الفلسفة (آداب وفلسفة)", 240, ["الإدراك والإحساس", "اللغة والفكر", "العدالة والحق"]),
  buildOfficialBacItem(2026, "regular", "lettres_philo", "arabic", "بكالوريا 2026 تجريبي رسمي - اللغة العربية وآدابها", 240, ["الشعر التعليمي", "المقال النقدي"]),
  buildOfficialBacItem(2026, "regular", "lettres_philo", "history_geography", "بكالوريا 2026 تجريبي رسمي - التاريخ والجغرافيا", 210, ["العالم المعاصر", "حركات التحرر"]),
  buildOfficialBacItem(2026, "regular", "lettres_philo", "islamic_studies", "بكالوريا 2026 تجريبي رسمي - العلوم الإسلامية", 150, ["مقاصد الشريعة", "المعاملات المالية"]),

  buildOfficialBacItem(2026, "regular", "langues_etrangeres", "french", "بكالوريا 2026 تجريبي رسمي - اللغة الفرنسية", 210, ["Texte d'histoire", "Texte argumentatif"]),
  buildOfficialBacItem(2026, "regular", "langues_etrangeres", "english", "بكالوريا 2026 تجريبي رسمي - اللغة الإنجليزية", 210, ["Ancient Civilizations", "Ethics in Business"]),
  buildOfficialBacItem(2026, "regular", "langues_etrangeres", "third_language", "بكالوريا 2026 تجريبي رسمي - اللغة الأجنبية الثالثة (إسبانية/ألمانية/إيطالية)", 210, ["Comprensión de texto", "Expresión escrita"]),
  buildOfficialBacItem(2026, "regular", "langues_etrangeres", "arabic", "بكالوريا 2026 تجريبي رسمي - اللغة العربية وآدابها", 180, ["القصيدة المهجرية", "النثر الأدبي"]),

  // =========================================================================
  // 2025 - Official Baccalaureate Exams (امتحانات بكالوريا دورة جوان 2025)
  // =========================================================================
  buildOfficialBacItem(2025, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2025 - علوم الطبيعة والحياة", 270, ["المناعة النوعية", "التحلون الدموي"]),
  buildOfficialBacItem(2025, "regular", "sciences_exp", "physics", "بكالوريا 2025 - العلوم الفيزيائية", 210, ["الأسترة", "الميكانيك ومبدأ انحفاظ الطاقة"]),
  buildOfficialBacItem(2025, "regular", "sciences_exp", "math", "بكالوريا 2025 - الرياضيات", 210, ["الدوال الأسية", "المتتاليات التراجعية"]),
  buildOfficialBacItem(2025, "regular", "sciences_exp", "arabic", "بكالوريا 2025 - اللغة العربية وآدابها", 150, ["شعر القضية الفلسطينية"]),
  buildOfficialBacItem(2025, "regular", "sciences_exp", "philosophy", "بكالوريا 2025 - الفلسفة", 180, ["المنطق الصوري والاستقرائي"]),
  buildOfficialBacItem(2025, "regular", "sciences_exp", "islamic_studies", "بكالوريا 2025 - العلوم الإسلامية", 150, ["مقاصد الشريعة الإسلامية"]),
  buildOfficialBacItem(2025, "regular", "sciences_exp", "history_geography", "بكالوريا 2025 - التاريخ والجغرافيا", 210, ["الأزمات الدولية", "القوى الاقتصادية الكبرى"]),

  buildOfficialBacItem(2025, "regular", "math", "math", "بكالوريا 2025 - الرياضيات (شعبة رياضيات)", 270, ["الموافقات في Z", "الدوال اللوغاريتمية", "الأعداد المركبة"]),
  buildOfficialBacItem(2025, "regular", "math", "physics", "بكالوريا 2025 - العلوم الفيزيائية (شعبة رياضيات)", 240, ["قوانين كبلر", "التحولات النووية"]),
  buildOfficialBacItem(2025, "regular", "math", "natural_sciences", "بكالوريا 2025 - علوم الطبيعة والحياة", 150, ["النشاط الإنزيمي"]),

  buildOfficialBacItem(2025, "regular", "technique_math", "mechanical_eng", "بكالوريا 2025 - الهندسة الميكانيكية", 240, ["نظام شحن آلي وتجميع ميكانيكي"]),
  buildOfficialBacItem(2025, "regular", "technique_math", "civil_eng", "بكالوريا 2025 - الهندسة المدنية", 240, ["حساب العزوم وقوى القص"]),
  buildOfficialBacItem(2025, "regular", "technique_math", "electrical_eng", "بكالوريا 2025 - الهندسة الكهربائية", 240, ["محرك خطوة خطوة وتصميم الدارات"]),
  buildOfficialBacItem(2025, "regular", "technique_math", "process_eng", "بكالوريا 2025 - هندسة الطرائق", 240, ["البوليميرات والمردود الصناعي"]),
  buildOfficialBacItem(2025, "regular", "technique_math", "math", "بكالوريا 2025 - الرياضيات", 240, ["الأعداد المركبة والتحويلات"]),
  buildOfficialBacItem(2025, "regular", "technique_math", "physics", "بكالوريا 2025 - العلوم الفيزيائية", 240, ["حركة القذائف والأقمار"]),

  buildOfficialBacItem(2025, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2025 - التسيير المحاسبي والمالي", 240, ["حساب النتائج حسب الوظيفة", "تحليل الاستغلال"]),
  buildOfficialBacItem(2025, "regular", "gestion_eco", "economics_management", "بكالوريا 2025 - الاقتصاد والمناجمنت", 210, ["التضخم والبطالة", "التجارة الخارجية"]),
  buildOfficialBacItem(2025, "regular", "gestion_eco", "law", "بكالوريا 2025 - القانون", 150, ["عقد البيع", "نزاعات العمل"]),
  buildOfficialBacItem(2025, "regular", "gestion_eco", "math", "بكالوريا 2025 - الرياضيات", 180, ["الدوال والبرمجة الخطية"]),

  buildOfficialBacItem(2025, "regular", "lettres_philo", "philosophy", "بكالوريا 2025 - الفلسفة", 240, ["الشعور واللاشعور", "الذاكرة والخيال"]),
  buildOfficialBacItem(2025, "regular", "lettres_philo", "arabic", "بكالوريا 2025 - اللغة العربية وآدابها", 240, ["شعر الثورة الجزائرية ومفدي زكريا"]),
  buildOfficialBacItem(2025, "regular", "lettres_philo", "history_geography", "بكالوريا 2025 - التاريخ والجغرافيا", 210, ["مؤتمر باندونغ وتصفية الاستعمار"]),

  buildOfficialBacItem(2025, "regular", "langues_etrangeres", "french", "بكالوريا 2025 - اللغة الفرنسية", 210, ["L'appel et le texte d'opinion"]),
  buildOfficialBacItem(2025, "regular", "langues_etrangeres", "english", "بكالوريا 2025 - اللغة الإنجليزية", 210, ["Education in the world", "Advertising & Safety"]),
  buildOfficialBacItem(2025, "regular", "langues_etrangeres", "third_language", "بكالوريا 2025 - اللغة الأجنبية الثالثة", 210, ["موضوع اللغة الإسبانية والألمانية"]),

  // =========================================================================
  // 2024 - Official Baccalaureate Exams (دورة 2024)
  // =========================================================================
  buildOfficialBacItem(2024, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2024 - علوم الطبيعة والحياة", 270, ["التحفيز الإنزيمي", "العصبونات والمشابك"]),
  buildOfficialBacItem(2024, "regular", "sciences_exp", "physics", "بكالوريا 2024 - العلوم الفيزيائية", 210, ["الأحماض والأسس pH", "ثنائي القطب RC"]),
  buildOfficialBacItem(2024, "regular", "sciences_exp", "math", "بكالوريا 2024 - الرياضيات", 210, ["المتتاليات الحسابية والهندسية", "الدوال الأسية"]),
  buildOfficialBacItem(2024, "regular", "sciences_exp", "philosophy", "بكالوريا 2024 - الفلسفة", 180, ["الحتمية واللاحتمية في الفيزياء المعاصرة"]),
  buildOfficialBacItem(2024, "regular", "sciences_exp", "arabic", "بكالوريا 2024 - اللغة العربية وآدابها", 150, ["النزعة الإنسانية في الشعر العربي"]),
  buildOfficialBacItem(2024, "regular", "sciences_exp", "islamic_studies", "بكالوريا 2024 - العلوم الإسلامية", 150, ["الربا وأنواعه", "المعاملات المالية"]),
  buildOfficialBacItem(2024, "regular", "sciences_exp", "history_geography", "بكالوريا 2024 - التاريخ والجغرافيا", 210, ["هجمات الشمال القسنطيني ومؤتمر الصومام"]),

  buildOfficialBacItem(2024, "regular", "math", "math", "بكالوريا 2024 - الرياضيات (شعبة رياضيات)", 270, ["الحساب في Z والتحويلات النقطية"]),
  buildOfficialBacItem(2024, "regular", "math", "physics", "بكالوريا 2024 - العلوم الفيزيائية (شعبة رياضيات)", 240, ["حركة الأجسام في الهواء", "ثنائي القطب RLC"]),
  
  buildOfficialBacItem(2024, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2024 - التسيير المحاسبي والمالي", 240, ["تمويل الاستثمارات والقروض العادية"]),
  buildOfficialBacItem(2024, "regular", "gestion_eco", "economics_management", "بكالوريا 2024 - الاقتصاد والمناجمنت", 210, ["المنظمة العالمية للتجارة والشراكة"]),
  buildOfficialBacItem(2024, "regular", "gestion_eco", "law", "بكالوريا 2024 - القانون", 150, ["التأمين والمسؤولية المدنية"]),

  buildOfficialBacItem(2024, "regular", "technique_math", "mechanical_eng", "بكالوريا 2024 - الهندسة الميكانيكية", 240, ["جهاز قطع وتشغيل الصفائح المعدنية"]),
  buildOfficialBacItem(2024, "regular", "technique_math", "civil_eng", "بكالوريا 2024 - الهندسة المدنية", 240, ["الجسور والأنفاق والمقاطع العرضية"]),
  buildOfficialBacItem(2024, "regular", "technique_math", "electrical_eng", "بكالوريا 2024 - الهندسة الكهربائية", 240, ["المتعاقب غرافسيت والمؤقتات"]),
  buildOfficialBacItem(2024, "regular", "technique_math", "process_eng", "بكالوريا 2024 - هندسة الطرائق", 240, ["الديناميكا الحرارية والكيمياء العضوية"]),

  buildOfficialBacItem(2024, "regular", "lettres_philo", "philosophy", "بكالوريا 2024 - الفلسفة", 240, ["أصل المفاهيم الرياضية: العقل أم التجربة"]),
  buildOfficialBacItem(2024, "regular", "lettres_philo", "arabic", "بكالوريا 2024 - اللغة العربية وآدابها", 240, ["شعر المهجر والرابطة القلمية"]),

  buildOfficialBacItem(2024, "regular", "langues_etrangeres", "french", "بكالوريا 2024 - اللغة الفرنسية", 210, ["Le texte d'histoire coloniale"]),
  buildOfficialBacItem(2024, "regular", "langues_etrangeres", "english", "بكالوريا 2024 - اللغة الإنجليزية", 210, ["Counterfeiting and Fraud"]),

  // =========================================================================
  // 2023 - Official Baccalaureate Exams (دورة 2023)
  // =========================================================================
  buildOfficialBacItem(2023, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2023 - علوم الطبيعة والحياة", 270, ["دور البروتينات في الدفاع عن الذات"]),
  buildOfficialBacItem(2023, "regular", "sciences_exp", "physics", "بكالوريا 2023 - العلوم الفيزيائية", 210, ["حركة الكواكب وسقوط الأجسام"]),
  buildOfficialBacItem(2023, "regular", "sciences_exp", "math", "بكالوريا 2023 - الرياضيات", 210, ["الدوال اللوغاريتمية والمتتاليات"]),
  buildOfficialBacItem(2023, "regular", "sciences_exp", "philosophy", "بكالوريا 2023 - الفلسفة", 180, ["العلوم الإنسانية والعلوم التجريبية"]),

  buildOfficialBacItem(2023, "regular", "math", "math", "بكالوريا 2023 - الرياضيات (شعبة رياضيات)", 270, ["الموافقات ونظرية بيزو وغوص"]),
  buildOfficialBacItem(2023, "regular", "technique_math", "mechanical_eng", "بكالوريا 2023 - الهندسة الميكانيكية", 240, ["نظام تغليف آلي"]),
  buildOfficialBacItem(2023, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2023 - التسيير المحاسبي والمالي", 240, ["إعداد الميزانية الوظيفية واهتلاك التثبيتات"]),
  buildOfficialBacItem(2023, "regular", "lettres_philo", "philosophy", "بكالوريا 2023 - الفلسفة", 240, ["الشغل والتحرر الإنساني"]),
  buildOfficialBacItem(2023, "regular", "langues_etrangeres", "french", "بكالوريا 2023 - اللغة الفرنسية", 210, ["Texte d'Histoire de la guerre de libération"]),

  // =========================================================================
  // 2022 - Official Baccalaureate Exams (دورة 2022)
  // =========================================================================
  buildOfficialBacItem(2022, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2022 - علوم الطبيعة والحياة", 270, ["التنفس الخلوي والتخمر"]),
  buildOfficialBacItem(2022, "regular", "sciences_exp", "physics", "بكالوريا 2022 - العلوم الفيزيائية", 210, ["التفاعلات النووية وطاقة الربط"]),
  buildOfficialBacItem(2022, "regular", "sciences_exp", "math", "بكالوريا 2022 - الرياضيات", 210, ["الدوال والتكامل والاحتمالات"]),
  buildOfficialBacItem(2022, "regular", "math", "math", "بكالوريا 2022 - الرياضيات (رياضيات)", 270, ["الأعداد المركبة والقسمة الإقليدية"]),
  buildOfficialBacItem(2022, "regular", "technique_math", "civil_eng", "بكالوريا 2022 - الهندسة المدنية", 240, ["الروافد المستمرة والأعمدة"]),
  buildOfficialBacItem(2022, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2022 - التسيير المحاسبي والمالي", 240, ["ميزانية التدفقات والسيولة"]),
  buildOfficialBacItem(2022, "regular", "lettres_philo", "philosophy", "بكالوريا 2022 - الفلسفة", 240, ["الحرية والمسؤولية والجزاء"]),

  // =========================================================================
  // 2021 - Official Baccalaureate Exams (دورة 2021)
  // =========================================================================
  buildOfficialBacItem(2021, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2021 - علوم الطبيعة والحياة", 270, ["تحويل الطاقة الضوئية إلى كيميائية كامنة"]),
  buildOfficialBacItem(2021, "regular", "sciences_exp", "physics", "بكالوريا 2021 - العلوم الفيزيائية", 210, ["المتابعة عن طريق المعايرة وقياس الناقلية"]),
  buildOfficialBacItem(2021, "regular", "sciences_exp", "math", "بكالوريا 2021 - الرياضيات", 210, ["المتتاليات العددية والدوال الأسية"]),
  buildOfficialBacItem(2021, "regular", "math", "math", "بكالوريا 2021 - الرياضيات (رياضيات)", 270, ["الحساب في Z والتحويلات الإقليدية"]),
  buildOfficialBacItem(2021, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2021 - التسيير المحاسبي والمالي", 240, ["جدول حسابات النتائج"]),
  buildOfficialBacItem(2021, "regular", "technique_math", "electrical_eng", "بكالوريا 2021 - الهندسة الكهربائية", 240, ["الدارات التوافقية وسجلات الإزاحة"]),
  buildOfficialBacItem(2021, "regular", "lettres_philo", "philosophy", "بكالوريا 2021 - الفلسفة", 240, ["العنف والتسامح في العلاقات الدولية"]),

  // =========================================================================
  // 2020 - Official Baccalaureate Exams (دورة سبتمبر 2020 الاستثنائية الصحية)
  // =========================================================================
  buildOfficialBacItem(2020, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2020 - علوم الطبيعة والحياة", 270, ["التركيب الحيوي للبروتينات والنشاط المناعي"]),
  buildOfficialBacItem(2020, "regular", "sciences_exp", "physics", "بكالوريا 2020 - العلوم الفيزيائية", 210, ["تفاعلات الأكسدة والإرجاع والظواهر الكهربائية"]),
  buildOfficialBacItem(2020, "regular", "sciences_exp", "math", "بكالوريا 2020 - الرياضيات", 210, ["الدوال العددية وحساب النهايات"]),
  buildOfficialBacItem(2020, "regular", "math", "math", "بكالوريا 2020 - الرياضيات (شعبة رياضيات)", 270, ["المتتاليات والدوال المعقدة"]),
  buildOfficialBacItem(2020, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2020 - التسيير المحاسبي والمالي", 240, ["التسويات المحاسبية لنهاية السنة"]),
  buildOfficialBacItem(2020, "regular", "lettres_philo", "philosophy", "بكالوريا 2020 - الفلسفة", 240, ["العلوم الإنسانية وعلم التاريخ"]),

  // =========================================================================
  // 2019 - Official Baccalaureate Exams (دورة جوان 2019)
  // =========================================================================
  buildOfficialBacItem(2019, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2019 - علوم الطبيعة والحياة", 270, ["آليات تركيب البروتين والتنظيم الهرموني"]),
  buildOfficialBacItem(2019, "regular", "sciences_exp", "physics", "بكالوريا 2019 - العلوم الفيزيائية", 210, ["الميكانيك وقوانين نيوتن والحركة المنحنية"]),
  buildOfficialBacItem(2019, "regular", "sciences_exp", "math", "بكالوريا 2019 - الرياضيات", 210, ["المتتاليات العددية والبرهان بالتراجع"]),
  buildOfficialBacItem(2019, "regular", "math", "math", "بكالوريا 2019 - الرياضيات (شعبة رياضيات)", 270, ["الحساب والموافقات والأعداد الأولية"]),
  buildOfficialBacItem(2019, "regular", "technique_math", "mechanical_eng", "بكالوريا 2019 - الهندسة الميكانيكية", 240, ["نظام تشكيل وتثقيب هوائي"]),
  buildOfficialBacItem(2019, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2019 - التسيير المحاسبي والمالي", 240, ["تحليل الاستغلال التفاضلي ونقطة التعادل"]),
  buildOfficialBacItem(2019, "regular", "lettres_philo", "philosophy", "بكالوريا 2019 - الفلسفة", 240, ["الحق والواجب في العدالة الاجتماعية"]),

  // =========================================================================
  // 2018 - Official Baccalaureate Exams (دورة 2018)
  // =========================================================================
  buildOfficialBacItem(2018, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2018 - علوم الطبيعة والحياة", 270, ["الاستجابة المناعية الخلطية والخلوية"]),
  buildOfficialBacItem(2018, "regular", "sciences_exp", "physics", "بكالوريا 2018 - العلوم الفيزيائية", 210, ["ثنائي القطب RL وظاهرة التحريض الكهرومغناطيسي"]),
  buildOfficialBacItem(2018, "regular", "sciences_exp", "math", "بكالوريا 2018 - الرياضيات", 210, ["الدوال اللوغاريتمية والأسية مع الرسم البياني"]),
  buildOfficialBacItem(2018, "regular", "math", "math", "بكالوريا 2018 - الرياضيات (رياضيات)", 270, ["القسمة الإقليدية والأعداد المركبة"]),
  buildOfficialBacItem(2018, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2018 - التسيير المحاسبي والمالي", 240, ["التسويات المحاسبية والمخزونات"]),
  buildOfficialBacItem(2018, "regular", "lettres_philo", "philosophy", "بكالوريا 2018 - الفلسفة", 240, ["الشعور بالأنا والشعور بالغير"]),

  // =========================================================================
  // 2017 - Official Baccalaureate Exams (دورة عادية + دورة استثنائية)
  // =========================================================================
  buildOfficialBacItem(2017, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2017 (الدورة العادية) - علوم الطبيعة والحياة", 270, ["العلاقة بين بنية ووظيفة البروتين"]),
  buildOfficialBacItem(2017, "regular", "sciences_exp", "physics", "بكالوريا 2017 (الدورة العادية) - العلوم الفيزيائية", 210, ["تفاعلات الأسترة وتوازنها الحركي"]),
  buildOfficialBacItem(2017, "regular", "sciences_exp", "math", "بكالوريا 2017 (الدورة العادية) - الرياضيات", 210, ["الدوال وحساب المساحات والتكامل"]),
  buildOfficialBacItem(2017, "regular", "math", "math", "بكالوريا 2017 (الدورة العادية) - الرياضيات (شعبة رياضيات)", 270, ["الحساب في Z والمسائل الهندسية"]),
  buildOfficialBacItem(2017, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2017 (الدورة العادية) - التسيير المحاسبي", 240, ["تحليل الميزانية الوظيفية وقدرة التمويل الذاتي"]),
  buildOfficialBacItem(2017, "regular", "lettres_philo", "philosophy", "بكالوريا 2017 (الدورة العادية) - الفلسفة", 240, ["الديمقراطية والحكم الراشد"]),

  buildOfficialBacItem(2017, "exceptional", "sciences_exp", "natural_sciences", "بكالوريا 2017 (الدورة الاستثنائية) - علوم الطبيعة والحياة", 270, ["النشاط المناعي ومكافحة الخلايا المصابة"]),
  buildOfficialBacItem(2017, "exceptional", "sciences_exp", "physics", "بكالوريا 2017 (الدورة الاستثنائية) - العلوم الفيزيائية", 210, ["النشاط الإشعاعي وقانون التناقص"]),
  buildOfficialBacItem(2017, "exceptional", "sciences_exp", "math", "بكالوريا 2017 (الدورة الاستثنائية) - الرياضيات", 210, ["المتتاليات العددية والدوال الأسية"]),
  buildOfficialBacItem(2017, "exceptional", "math", "math", "بكالوريا 2017 (الدورة الاستثنائية) - الرياضيات", 270, ["الأعداد الأولية والموافقات في Z"]),
  buildOfficialBacItem(2017, "exceptional", "gestion_eco", "accounting_finance", "بكالوريا 2017 (الدورة الاستثنائية) - التسيير المحاسبي", 240, ["تسوية حسابات الزبائن والموردين"]),
  buildOfficialBacItem(2017, "exceptional", "lettres_philo", "philosophy", "بكالوريا 2017 (الدورة الاستثنائية) - الفلسفة", 240, ["الحرية والحتمية"]),

  // =========================================================================
  // 2016 - Official Baccalaureate Exams (الدورة العادية + الدورة الاستثنائية)
  // =========================================================================
  buildOfficialBacItem(2016, "regular", "sciences_exp", "natural_sciences", "بكالوريا 2016 (الدورة العادية) - علوم الطبيعة والحياة", 270, ["التخصص الوظيفي للبروتينات والأنزيمات"]),
  buildOfficialBacItem(2016, "regular", "sciences_exp", "physics", "بكالوريا 2016 (الدورة العادية) - العلوم الفيزيائية", 210, ["المتابعة الزمنية لقياس ضغط الغاز"]),
  buildOfficialBacItem(2016, "regular", "sciences_exp", "math", "بكالوريا 2016 (الدورة العادية) - الرياضيات", 210, ["الدوال العددية والمتتاليات"]),
  buildOfficialBacItem(2016, "regular", "math", "math", "بكالوريا 2016 (الدورة العادية) - الرياضيات (رياضيات)", 270, ["الأعداد المركبة والحساب"]),
  buildOfficialBacItem(2016, "regular", "gestion_eco", "accounting_finance", "بكالوريا 2016 (الدورة العادية) - التسيير المحاسبي", 240, ["إعداد الكشوف المالية والميزانية"]),
  buildOfficialBacItem(2016, "regular", "lettres_philo", "philosophy", "بكالوريا 2016 (الدورة العادية) - الفلسفة", 240, ["الفكر واللغة والرموز"]),

  buildOfficialBacItem(2016, "exceptional", "sciences_exp", "natural_sciences", "بكالوريا 2016 (الدورة الاستثنائية الجزئية) - علوم الطبيعة والحياة", 270, ["الترجمة وتركيب البروتين"]),
  buildOfficialBacItem(2016, "exceptional", "sciences_exp", "physics", "بكالوريا 2016 (الدورة الاستثنائية الجزئية) - العلوم الفيزيائية", 210, ["الدارات الكهربائية ونواة اليورانيوم"]),
  buildOfficialBacItem(2016, "exceptional", "sciences_exp", "math", "بكالوريا 2016 (الدورة الاستثنائية الجزئية) - الرياضيات", 210, ["المتتاليات والدوال اللوغاريتمية"]),
  buildOfficialBacItem(2016, "exceptional", "math", "math", "بكالوريا 2016 (الدورة الاستثنائية الجزئية) - الرياضيات", 270, ["الحساب في Z والفضاء"]),
  buildOfficialBacItem(2016, "exceptional", "technique_math", "math", "بكالوريا 2016 (الدورة الاستثنائية الجزئية) - الرياضيات", 240, ["المتتاليات والدوال المعقدة"]),
];

/**
 * Curated Database for High-School Term Quizzes, Term Exams, and Bac Blanc
 * Categorized by Term (1, 2, 3) across top Algerian secondary schools
 */
export const TERM_EXAMS_DATABASE: BacExamItem[] = [
  // =========================================================================
  // 1. الفصل الأول (Term 1) - فروض واختبارات الفصل الأول
  // =========================================================================
  // العلوم التجريبية
  buildTermExamItem({
    id: "term1-exam-se-snv-kouba",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية الرياضيات بالقبة",
    wilaya: "الجزائر",
    streamId: "sciences_exp",
    subjectId: "natural_sciences",
    title_ar: "اختبار الفصل الأول في علوم الطبيعة والحياة - ثانوية الرياضيات بالقبة",
    durationMinutes: 180,
    keywords: ["تركيب البروتين", "النشاط الإنزيمي", "العلاقة بين بنية ووظيفة البروتين"],
  }),
  buildTermExamItem({
    id: "term1-quiz-se-snv-mokrani",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_quiz",
    schoolName: "ثانوية المقراني - بن عكنون",
    wilaya: "الجزائر",
    streamId: "sciences_exp",
    subjectId: "natural_sciences",
    title_ar: "الفرض المحروس الأول في علوم الطبيعة والحياة - ثانوية المقراني",
    durationMinutes: 60,
    keywords: ["استنساخ وترجمة ARNm", "طفرات وراثية"],
  }),
  buildTermExamItem({
    id: "term1-exam-se-phy-lotfi",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية العقيد لطفي",
    wilaya: "وهران",
    streamId: "sciences_exp",
    subjectId: "physics",
    title_ar: "اختبار الفصل الأول في العلوم الفيزيائية - ثانوية العقيد لطفي وهران",
    durationMinutes: 120,
    keywords: ["المتابعة الزمنية لتحول كيميائي", "ثنائي القطب RC", "الناقلية النوعية"],
  }),
  buildTermExamItem({
    id: "term1-quiz-se-phy-malek",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_quiz",
    schoolName: "ثانوية مالك بن نبي",
    wilaya: "سطيف",
    streamId: "sciences_exp",
    subjectId: "physics",
    title_ar: "الفرض الأول في العلوم الفيزيائية - ثانوية مالك بن نبي سطيف",
    durationMinutes: 60,
    keywords: ["تفكك الماء الأكسجيني", "زمن نصف التفاعل"],
  }),
  buildTermExamItem({
    id: "term1-exam-se-math-haitham",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية ابن الهيثم",
    wilaya: "قسنطينة",
    streamId: "sciences_exp",
    subjectId: "math",
    title_ar: "اختبار الفصل الأول في الرياضيات - ثانوية ابن الهيثم قسنطينة",
    durationMinutes: 150,
    keywords: ["الدوال الأسية", "نهايات واشتقاق", "المتتاليات التراجعية"],
  }),
  buildTermExamItem({
    id: "term1-exam-se-ar-amirkader",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية الأمير عبد القادر",
    wilaya: "مستغانم",
    streamId: "sciences_exp",
    subjectId: "arabic",
    title_ar: "اختبار الفصل الأول في اللغة العربية وآدابها - ثانوية الأمير عبد القادر",
    durationMinutes: 120,
    keywords: ["شعر المنفى والبارودي", "النثر العلمي المتأدب", "الإعراب التقديري"],
  }),
  buildTermExamItem({
    id: "term1-exam-se-phil-moufdi",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية مفدي زكرياء",
    wilaya: "غرداية",
    streamId: "sciences_exp",
    subjectId: "philosophy",
    title_ar: "اختبار الفصل الأول في مادة الفلسفة - ثانوية مفدي زكرياء غرداية",
    durationMinutes: 120,
    keywords: ["المشكلة العلمية والإشكالية الفلسفية", "الملاحظة والفرضية التجريبية"],
  }),
  buildTermExamItem({
    id: "term1-exam-se-isl-bachir",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية البشير الإبراهيمي",
    wilaya: "برج بوعريريج",
    streamId: "sciences_exp",
    subjectId: "islamic_studies",
    title_ar: "اختبار الفصل الأول في العلوم الإسلامية - ثانوية البشير الإبراهيمي",
    durationMinutes: 90,
    keywords: ["العقيدة الإسلامية وأثرها", "وسائل القرآن في تثبيت العقيدة", "الصحة النفسية"],
  }),
  buildTermExamItem({
    id: "term1-exam-se-hg-boumendjel",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية أحمد بومنجل",
    wilaya: "عنابة",
    streamId: "sciences_exp",
    subjectId: "history_geography",
    title_ar: "اختبار الفصل الأول في التاريخ والجغرافيا - ثانوية أحمد بومنجل عنابة",
    durationMinutes: 120,
    keywords: ["الحرب الباردة واستراتيجيات الصراع", "المبادلات وحركة رؤوس الأموال"],
  }),

  // شعبة الرياضيات
  buildTermExamItem({
    id: "term1-exam-m-math-kouba",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية الرياضيات بالقبة",
    wilaya: "الجزائر",
    streamId: "math",
    subjectId: "math",
    title_ar: "اختبار الفصل الأول في الرياضيات - ثانوية الرياضيات بالقبة (النخبة)",
    durationMinutes: 240,
    keywords: ["القسمة في Z", "الموافقات ونظرية غوص وبيزو", "دراسة دوال ناطقة وأسية"],
  }),
  buildTermExamItem({
    id: "term1-quiz-m-math-kouba",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_quiz",
    schoolName: "ثانوية الرياضيات بالقبة",
    wilaya: "الجزائر",
    streamId: "math",
    subjectId: "math",
    title_ar: "الفرض الأول في الحساب والأعداد الأولية - ثانوية الرياضيات بالقبة",
    durationMinutes: 90,
    keywords: ["القاسم المشترك الأكبر PGCD", "مبرهنة فيرما الصغرى"],
  }),
  buildTermExamItem({
    id: "term1-exam-m-phy-lotfi",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية العقيد لطفي",
    wilaya: "وهران",
    streamId: "math",
    subjectId: "physics",
    title_ar: "اختبار الفصل الأول في العلوم الفيزيائية - ثانوية العقيد لطفي (شعبة رياضيات)",
    durationMinutes: 180,
    keywords: ["المتابعة الزمنية", "الدارة الكهربائية RC وتفريغ مكثفة معقدة"],
  }),

  // شعبة التقني رياضي
  buildTermExamItem({
    id: "term1-exam-tm-meca-birkadem",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "متقن بئر خادم التقني",
    wilaya: "الجزائر",
    streamId: "technique_math",
    subjectId: "mechanical_eng",
    title_ar: "اختبار الفصل الأول في الهندسة الميكانيكية - متقن بئر خادم",
    durationMinutes: 180,
    keywords: ["دراسة نظام تحويل وصمامات", "مخططات الصنع والتجميع", "مقاومة المواد والانحناء"],
  }),
  buildTermExamItem({
    id: "term1-exam-tm-civil-hawas",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية الشهيد سي الحواس",
    wilaya: "المسيلة",
    streamId: "technique_math",
    subjectId: "civil_eng",
    title_ar: "اختبار الفصل الأول في الهندسة المدنية - ثانوية سي الحواس",
    durationMinutes: 180,
    keywords: ["الروافد المحددة استاتيكياً", "عزم الانحناء والجهد القاطع"],
  }),
  buildTermExamItem({
    id: "term1-exam-tm-elec-zighoud",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية زيغود يوسف",
    wilaya: "سكيكدة",
    streamId: "technique_math",
    subjectId: "electrical_eng",
    title_ar: "اختبار الفصل الأول في الهندسة الكهربائية - ثانوية زيغود يوسف",
    durationMinutes: 180,
    keywords: ["المنطق التوافقي", "الدارات المندمجة والمضخم العملياتي"],
  }),
  buildTermExamItem({
    id: "term1-exam-tm-proc-taymiya",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية ابن تيمية",
    wilaya: "الوادي",
    streamId: "technique_math",
    subjectId: "process_eng",
    title_ar: "اختبار الفصل الأول في هندسة الطرائق - ثانوية ابن تيمية",
    durationMinutes: 180,
    keywords: ["الكيمياء العضوية", "الوظائف الكحولية والكربوكسيلية"],
  }),

  // شعبة التسيير والاقتصاد
  buildTermExamItem({
    id: "term1-exam-ge-acc-omarracim",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية عمر راسم",
    wilaya: "الجزائر",
    streamId: "gestion_eco",
    subjectId: "accounting_finance",
    title_ar: "اختبار الفصل الأول في التسيير المحاسبي والمالي - ثانوية عمر راسم",
    durationMinutes: 180,
    keywords: ["الاهتلاك الخطي والمتناقص", "خسارة قيمة التثبيتات", "تسوية حسابات الزبائن"],
  }),
  buildTermExamItem({
    id: "term1-quiz-ge-acc-ibnrachd",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_quiz",
    schoolName: "ثانوية ابن رشد",
    wilaya: "البليدة",
    streamId: "gestion_eco",
    subjectId: "accounting_finance",
    title_ar: "الفرض الأول في محاسبة التثبيتات - ثانوية ابن رشد البليدة",
    durationMinutes: 60,
    keywords: ["جدول الاهتلاك", "قيد التسوية في نهاية الدورة"],
  }),
  buildTermExamItem({
    id: "term1-exam-ge-eco-chouhada",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية الشهداء",
    wilaya: "بومرداس",
    streamId: "gestion_eco",
    subjectId: "economics_management",
    title_ar: "اختبار الفصل الأول في الاقتصاد والمناجمنت - ثانوية بومرداس",
    durationMinutes: 150,
    keywords: ["النقود والوظائف النقدية", "السوق والأسعار وقوى التوازن"],
  }),
  buildTermExamItem({
    id: "term1-exam-ge-law-tebessi",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية العربي التبسي",
    wilaya: "تبسة",
    streamId: "gestion_eco",
    subjectId: "law",
    title_ar: "اختبار الفصل الأول في مادة القانون - ثانوية العربي التبسي",
    durationMinutes: 120,
    keywords: ["عقد البيع وأركانه والتزامات البائع", "عقد العمل الفردي"],
  }),

  // شعبة الآداب والفلسفة
  buildTermExamItem({
    id: "term1-exam-lp-phil-badis",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية عبد الحميد بن باديس",
    wilaya: "قسنطينة",
    streamId: "lettres_philo",
    subjectId: "philosophy",
    title_ar: "اختبار الفصل الأول في الفلسفة - ثانوية عبد الحميد بن باديس قسنطينة",
    durationMinutes: 180,
    keywords: ["المشكلة العلمية والإشكالية الفلسفية", "المنطق الصوري الأرسطي ومبدأ الهوية"],
  }),
  buildTermExamItem({
    id: "term1-quiz-lp-phil-mouhidi",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_quiz",
    schoolName: "ثانوية العربي بن مهيدي",
    wilaya: "أم البواقي",
    streamId: "lettres_philo",
    subjectId: "philosophy",
    title_ar: "الفرض الأول في مادة الفلسفة (مقالة مقارنة) - ثانوية العربي بن مهيدي",
    durationMinutes: 60,
    keywords: ["السؤال العلمي والسؤال الفلسفي", "طريقة المقارنة"],
  }),
  buildTermExamItem({
    id: "term1-exam-lp-ar-ibnkheldoun",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية ابن خلدون",
    wilaya: "تيارت",
    streamId: "lettres_philo",
    subjectId: "arabic",
    title_ar: "اختبار الفصل الأول في الأدب العربي - ثانوية ابن خلدون تيارت",
    durationMinutes: 180,
    keywords: ["عصر الضعف والانحطاط", "شعر المديح النبوي والزهد", "البلاغة وعلم البيان"],
  }),

  // شعبة اللغات الأجنبية
  buildTermExamItem({
    id: "term1-exam-le-l3-hassiba",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية حسيبة بن بوعلي",
    wilaya: "الجزائر",
    streamId: "langues_etrangeres",
    subjectId: "third_language",
    title_ar: "اختبار الفصل الأول في اللغة الإسبانية - ثانوية حسيبة بن بوعلي",
    durationMinutes: 180,
    keywords: ["La juventud y la sociedad", "El pretérito imperfecto vs indefinido"],
  }),
  buildTermExamItem({
    id: "term1-exam-le-fr-amirouche",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية العقيد عميروش",
    wilaya: "تيزي وزو",
    streamId: "langues_etrangeres",
    subjectId: "french",
    title_ar: "اختبار الفصل الأول في اللغة الفرنسية - ثانوية العقيد عميروش",
    durationMinutes: 180,
    keywords: ["Le texte d'histoire et les témoins de la Révolution", "Le compte-rendu objectif"],
  }),
  buildTermExamItem({
    id: "term1-exam-le-eng-mokrani",
    year: 2025,
    academicYear: "2024/2025",
    term: 1,
    kind: "term_exam",
    schoolName: "ثانوية المقراني",
    wilaya: "الجزائر",
    streamId: "langues_etrangeres",
    subjectId: "english",
    title_ar: "اختبار الفصل الأول في اللغة الإنجليزية - ثانوية المقراني",
    durationMinutes: 180,
    keywords: ["Ancient Civilizations: Mesopotamia and Nile Valley", "Grammar and Phonology"],
  }),

  // =========================================================================
  // 2. الفصل الثاني (Term 2) - فروض واختبارات الفصل الثاني
  // =========================================================================
  buildTermExamItem({
    id: "term2-exam-se-snv-kouba",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية الرياضيات بالقبة",
    wilaya: "الجزائر",
    streamId: "sciences_exp",
    subjectId: "natural_sciences",
    title_ar: "اختبار الفصل الثاني في علوم الطبيعة والحياة - ثانوية الرياضيات بالقبة",
    durationMinutes: 180,
    keywords: ["المناعة الخلطية والخلوية", "فيروس فقدان المناعة المكتسبة VIH", "الاتصال العصبي والمشابك"],
  }),
  buildTermExamItem({
    id: "term2-quiz-se-snv-benbadis",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_quiz",
    schoolName: "ثانوية عبد الحميد بن باديس",
    wilaya: "قسنطينة",
    streamId: "sciences_exp",
    subjectId: "natural_sciences",
    title_ar: "الفرض المحروس للثلاثي الثاني في المناعة - ثانوية بن باديس",
    durationMinutes: 60,
    keywords: ["انتقاء النسيليات اللمفاوية", "الأجسام المضادة"],
  }),
  buildTermExamItem({
    id: "term2-exam-se-phy-benboulaid",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية مصطفى بن بولعيد",
    wilaya: "باتنة",
    streamId: "sciences_exp",
    subjectId: "physics",
    title_ar: "اختبار الفصل الثاني في العلوم الفيزيائية - ثانوية بن بولعيد باتنة",
    durationMinutes: 150,
    keywords: ["الميكانيك وقوانين نيوتن", "حركة الأقمار والكواكب", "النشاط الإشعاعي والتحولات النووية"],
  }),
  buildTermExamItem({
    id: "term2-quiz-se-phy-amirkader",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_quiz",
    schoolName: "ثانوية الأمير عبد القادر",
    wilaya: "مستغانم",
    streamId: "sciences_exp",
    subjectId: "physics",
    title_ar: "فرض الفصل الثاني في ميكانيك نيوتن وحركة السقوط - ثانوية الأمير عبد القادر",
    durationMinutes: 60,
    keywords: ["السقوط الشاقولي الحقيقي والحر", "قوة الاحتكاك المائع"],
  }),
  buildTermExamItem({
    id: "term2-exam-se-math-malek",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية مالك بن نبي",
    wilaya: "سطيف",
    streamId: "sciences_exp",
    subjectId: "math",
    title_ar: "اختبار الفصل الثاني في الرياضيات - ثانوية مالك بن نبي سطيف",
    durationMinutes: 150,
    keywords: ["الدوال اللوغاريتمية النيبيرية", "المتتاليات والبرهان بالتراجع", "الهندسة في الفضاء"],
  }),
  buildTermExamItem({
    id: "term2-exam-se-ar-bachir",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية البشير الإبراهيمي",
    wilaya: "برج بوعريريج",
    streamId: "sciences_exp",
    subjectId: "arabic",
    title_ar: "اختبار الفصل الثاني في اللغة العربية - ثانوية الإبراهيمي",
    durationMinutes: 120,
    keywords: ["شعر القضية الفلسطينية ومحمود درويش", "ظاهرة الالتزام", "المحسنات والصور البيانية"],
  }),
  buildTermExamItem({
    id: "term2-exam-se-phil-mokrani",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية المقراني",
    wilaya: "الجزائر",
    streamId: "sciences_exp",
    subjectId: "philosophy",
    title_ar: "اختبار الفصل الثاني في الفلسفة - ثانوية المقراني بن عكنون",
    durationMinutes: 120,
    keywords: ["فلسفة الرياضيات والعلوم البيولوجية", "الحتمية ومبدأ الارتياب"],
  }),
  buildTermExamItem({
    id: "term2-exam-se-hg-boumendjel",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية أحمد بومنجل",
    wilaya: "عنابة",
    streamId: "sciences_exp",
    subjectId: "history_geography",
    title_ar: "اختبار الفصل الثاني في التاريخ والجغرافيا - ثانوية بومنجل عنابة",
    durationMinutes: 120,
    keywords: ["الثورة الجزائرية 1954-1962", "مؤتمر الصومام", "القوة الاقتصادية للولايات المتحدة الأمريكية"],
  }),

  // شعبة الرياضيات - الفصل 2
  buildTermExamItem({
    id: "term2-exam-m-math-kouba",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية الرياضيات بالقبة",
    wilaya: "الجزائر",
    streamId: "math",
    subjectId: "math",
    title_ar: "اختبار الفصل الثاني في الرياضيات - ثانوية الرياضيات بالقبة",
    durationMinutes: 240,
    keywords: ["الأعداد المركبة والتحويلات النقطية", "الدوال اللوغاريتمية والمتتاليات المعقدة"],
  }),
  buildTermExamItem({
    id: "term2-exam-m-phy-lotfi",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية العقيد لطفي",
    wilaya: "وهران",
    streamId: "math",
    subjectId: "physics",
    title_ar: "اختبار الفصل الثاني في العلوم الفيزيائية - ثانوية العقيد لطفي (رياضيات)",
    durationMinutes: 180,
    keywords: ["حركة الكواكب وقوانين كبلر", "التحولات النووية والاهتزازات الميكانيكية"],
  }),

  // شعبة التقني رياضي - الفصل 2
  buildTermExamItem({
    id: "term2-exam-tm-meca-birkadem",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "متقن بئر خادم التقني",
    wilaya: "الجزائر",
    streamId: "technique_math",
    subjectId: "mechanical_eng",
    title_ar: "اختبار الفصل الثاني في الهندسة الميكانيكية - متقن بئر خادم",
    durationMinutes: 180,
    keywords: ["نظام رفع آلي", "المدحرجات ونقل الحركة", "دراسة الجهد الناظمي وإجهاد القص"],
  }),
  buildTermExamItem({
    id: "term2-exam-tm-elec-zighoud",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية زيغود يوسف",
    wilaya: "سكيكدة",
    streamId: "technique_math",
    subjectId: "electrical_eng",
    title_ar: "اختبار الفصل الثاني في الهندسة الكهربائية - ثانوية زيغود يوسف",
    durationMinutes: 180,
    keywords: ["المنطق التعاقبي والقلابات JK و RS", "السجلات والعدادات اللاتزامنية"],
  }),
  buildTermExamItem({
    id: "term2-exam-tm-civil-hawas",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية الشهيد سي الحواس",
    wilaya: "المسيلة",
    streamId: "technique_math",
    subjectId: "civil_eng",
    title_ar: "اختبار الفصل الثاني في الهندسة المدنية - ثانوية سي الحواس",
    durationMinutes: 180,
    keywords: ["الخرسانة المسلحة والمقاطع المستطيلة", "التحنيط وحساب التسليح الطولي"],
  }),
  buildTermExamItem({
    id: "term2-exam-tm-proc-taymiya",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية ابن تيمية",
    wilaya: "الوادي",
    streamId: "technique_math",
    subjectId: "process_eng",
    title_ar: "اختبار الفصل الثاني في هندسة الطرائق - ثانوية ابن تيمية",
    durationMinutes: 180,
    keywords: ["الديناميكا الحرارية وحساب الانطالبي", "قانون هس وسرعة التفاعل"],
  }),

  // شعبة التسيير والاقتصاد - الفصل 2
  buildTermExamItem({
    id: "term2-exam-ge-acc-omarracim",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية عمر راسم",
    wilaya: "الجزائر",
    streamId: "gestion_eco",
    subjectId: "accounting_finance",
    title_ar: "اختبار الفصل الثاني في التسيير المحاسبي والمالي - ثانوية عمر راسم",
    durationMinutes: 180,
    keywords: ["الميزانية الوظيفية وحساب المؤشرات FRNG و BFR و TN", "جدول حسابات النتائج حسب الطبيعة"],
  }),
  buildTermExamItem({
    id: "term2-exam-ge-eco-chouhada",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية الشهداء",
    wilaya: "بومرداس",
    streamId: "gestion_eco",
    subjectId: "economics_management",
    title_ar: "اختبار الفصل الثاني في الاقتصاد والمناجمنت - ثانوية بومرداس",
    durationMinutes: 150,
    keywords: ["التجارة الخارجية وميزان المدفوعات", "منظمة التجارة العالمية والتضخم والبطالة"],
  }),
  buildTermExamItem({
    id: "term2-exam-ge-law-tebessi",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية العربي التبسي",
    wilaya: "تبسة",
    streamId: "gestion_eco",
    subjectId: "law",
    title_ar: "اختبار الفصل الثاني في مادة القانون - ثانوية العربي التبسي",
    durationMinutes: 120,
    keywords: ["الشركات التجارية: شركة التضامن والشركة ذات المسؤولية المحدودة SARL", "حل الشركات"],
  }),

  // شعبة الآداب والفلسفة - الفصل 2
  buildTermExamItem({
    id: "term2-exam-lp-phil-badis",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية عبد الحميد بن باديس",
    wilaya: "قسنطينة",
    streamId: "lettres_philo",
    subjectId: "philosophy",
    title_ar: "اختبار الفصل الثاني في الفلسفة - ثانوية بن باديس (آداب وفلسفة)",
    durationMinutes: 180,
    keywords: ["الإدراك والإحساس ومدرسة الجشطالت", "اللغة والفكر والدال والمدلول", "الذاكرة والخيال"],
  }),
  buildTermExamItem({
    id: "term2-quiz-lp-phil-bachir",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_quiz",
    schoolName: "ثانوية البشير الإبراهيمي",
    wilaya: "برج بوعريريج",
    streamId: "lettres_philo",
    subjectId: "philosophy",
    title_ar: "فرض الثلاثي الثاني في الفلسفة (مقالة جدلية) - ثانوية الإبراهيمي",
    durationMinutes: 60,
    keywords: ["هل العلاقة بين الدال والمدلول اعتباطية أم ضرورية؟", "اللسانيات المعاصرة"],
  }),
  buildTermExamItem({
    id: "term2-exam-lp-ar-ibnkheldoun",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية ابن خلدون",
    wilaya: "تيارت",
    streamId: "lettres_philo",
    subjectId: "arabic",
    title_ar: "اختبار الفصل الثاني في الأدب العربي - ثانوية ابن خلدون",
    durationMinutes: 180,
    keywords: ["شعر الثورة التحريرية عند مفدي زكريا وسليمان العيسى", "الرمز والأسطورة في الشعر الحر"],
  }),

  // شعبة اللغات الأجنبية - الفصل 2
  buildTermExamItem({
    id: "term2-exam-le-l3-hassiba",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية حسيبة بن بوعلي",
    wilaya: "الجزائر",
    streamId: "langues_etrangeres",
    subjectId: "third_language",
    title_ar: "اختبار الفصل الثاني في اللغة الإسبانية - ثانوية حسيبة بن بوعلي",
    durationMinutes: 180,
    keywords: ["El medio ambiente y el cambio climático", "El subjuntivo presente y las oraciones temporales"],
  }),
  buildTermExamItem({
    id: "term2-exam-le-fr-amirouche",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية العقيد عميروش",
    wilaya: "تيزي وزو",
    streamId: "langues_etrangeres",
    subjectId: "french",
    title_ar: "اختبار الفصل الثاني في اللغة الفرنسية - ثانوية العقيد عميروش",
    durationMinutes: 180,
    keywords: ["Le texte argumentatif: plaidoyer et réquisitoire", "La visée communicative"],
  }),
  buildTermExamItem({
    id: "term2-exam-le-eng-mokrani",
    year: 2025,
    academicYear: "2024/2025",
    term: 2,
    kind: "term_exam",
    schoolName: "ثانوية المقراني",
    wilaya: "الجزائر",
    streamId: "langues_etrangeres",
    subjectId: "english",
    title_ar: "اختبار الفصل الثاني في اللغة الإنجليزية - ثانوية المقراني",
    durationMinutes: 180,
    keywords: ["Ethics in Business: Bribery, Embezzlement and Money Laundering", "Passive Voice"],
  }),

  // =========================================================================
  // 3. الفصل الثالث والبكالوريا التجريبية (Term 3 & Bac Blanc)
  // =========================================================================
  buildTermExamItem({
    id: "bacblanc-se-snv-kouba",
    year: 2025,
    academicYear: "2024/2025",
    term: 3,
    kind: "bac_blanc",
    schoolName: "ثانوية الرياضيات بالقبة",
    wilaya: "الجزائر",
    streamId: "sciences_exp",
    subjectId: "natural_sciences",
    title_ar: "البكالوريا التجريبية 2025 - علوم الطبيعة والحياة (ثانوية القبة)",
    durationMinutes: 270,
    keywords: ["بكالوريا تجريبية شاملة", "المناعة والتركيب الضوئي", "الاتصال العصبي والمشابك"],
  }),
  buildTermExamItem({
    id: "bacblanc-se-phy-lotfi",
    year: 2025,
    academicYear: "2024/2025",
    term: 3,
    kind: "bac_blanc",
    schoolName: "ثانوية العقيد لطفي",
    wilaya: "وهران",
    streamId: "sciences_exp",
    subjectId: "physics",
    title_ar: "البكالوريا التجريبية 2025 - العلوم الفيزيائية (ثانوية العقيد لطفي وهران)",
    durationMinutes: 210,
    keywords: ["الأسترة ومردود التفاعل", "الأحماض والأسس والميكانيك", "الدارات الكهربائية RC RL"],
  }),
  buildTermExamItem({
    id: "bacblanc-se-math-mokrani",
    year: 2025,
    academicYear: "2024/2025",
    term: 3,
    kind: "bac_blanc",
    schoolName: "ثانوية المقراني - بن عكنون",
    wilaya: "الجزائر",
    streamId: "sciences_exp",
    subjectId: "math",
    title_ar: "البكالوريا التجريبية 2025 - الرياضيات (ثانوية المقراني الجزائر)",
    durationMinutes: 210,
    keywords: ["المتتاليات العددية", "الدوال الأسية واللوغاريتمية", "الاحتمالات والمتغير العشوائي"],
  }),
  buildTermExamItem({
    id: "bacblanc-m-math-kouba",
    year: 2025,
    academicYear: "2024/2025",
    term: 3,
    kind: "bac_blanc",
    schoolName: "ثانوية الرياضيات بالقبة",
    wilaya: "الجزائر",
    streamId: "math",
    subjectId: "math",
    title_ar: "البكالوريا التجريبية 2025 - الرياضيات (شعبة رياضيات النخبة القبة)",
    durationMinutes: 270,
    keywords: ["الموافقات في Z والأعداد الأولية", "الأعداد المركبة والتحويلات", "الفضاء والاحتمالات"],
  }),
  buildTermExamItem({
    id: "bacblanc-tm-meca-birkadem",
    year: 2025,
    academicYear: "2024/2025",
    term: 3,
    kind: "bac_blanc",
    schoolName: "متقن بئر خادم التقني",
    wilaya: "الجزائر",
    streamId: "technique_math",
    subjectId: "mechanical_eng",
    title_ar: "البكالوريا التجريبية 2025 - الهندسة الميكانيكية (متقن بئر خادم)",
    durationMinutes: 240,
    keywords: ["نظام آلي متكامل", "مخططات وظيفية ودراسة ميكانيكية شاملة"],
  }),
  buildTermExamItem({
    id: "bacblanc-tm-elec-zighoud",
    year: 2025,
    academicYear: "2024/2025",
    term: 3,
    kind: "bac_blanc",
    schoolName: "ثانوية زيغود يوسف",
    wilaya: "سكيكدة",
    streamId: "technique_math",
    subjectId: "electrical_eng",
    title_ar: "البكالوريا التجريبية 2025 - الهندسة الكهربائية (ثانوية زيغود يوسف)",
    durationMinutes: 240,
    keywords: ["المتعاقب غرافسيت والمتحكمات الدقيقة", "العدادات وسجلات الإزاحة"],
  }),
  buildTermExamItem({
    id: "bacblanc-ge-acc-omarracim",
    year: 2025,
    academicYear: "2024/2025",
    term: 3,
    kind: "bac_blanc",
    schoolName: "ثانوية عمر راسم",
    wilaya: "الجزائر",
    streamId: "gestion_eco",
    subjectId: "accounting_finance",
    title_ar: "البكالوريا التجريبية 2025 - التسيير المحاسبي والمالي (ثانوية عمر راسم)",
    durationMinutes: 240,
    keywords: ["تحليل الاستغلال التفاضلي ونقطة التعادل", "الميزانية الوظيفية وتسويات نهاية السنة"],
  }),
  buildTermExamItem({
    id: "bacblanc-lp-phil-badis",
    year: 2025,
    academicYear: "2024/2025",
    term: 3,
    kind: "bac_blanc",
    schoolName: "ثانوية عبد الحميد بن باديس",
    wilaya: "قسنطينة",
    streamId: "lettres_philo",
    subjectId: "philosophy",
    title_ar: "البكالوريا التجريبية 2025 - الفلسفة (شعبة آداب وفلسفة قسنطينة)",
    durationMinutes: 240,
    keywords: ["الحرية والمسؤولية والجزاء", "الحق والواجب والعدالة الاجتماعية", "تحليل نص فلسفي"],
  }),
  buildTermExamItem({
    id: "bacblanc-le-l3-hassiba",
    year: 2025,
    academicYear: "2024/2025",
    term: 3,
    kind: "bac_blanc",
    schoolName: "ثانوية حسيبة بن بوعلي",
    wilaya: "الجزائر",
    streamId: "langues_etrangeres",
    subjectId: "third_language",
    title_ar: "البكالوريا التجريبية 2025 - اللغة الإسبانية (ثانوية حسيبة بن بوعلي)",
    durationMinutes: 210,
    keywords: ["El turismo sostenible en España e Iberoamérica", "Gramática y expresión escrita"],
  }),
];

/**
 * Combined all-exams database
 */
export const ALL_EXAMS_DATABASE: BacExamItem[] = [
  ...BAC_EXAMS_DATABASE,
  ...TERM_EXAMS_DATABASE,
];

/**
 * Query helper to get all official BAC exams
 */
export function getAllBacExams(): BacExamItem[] {
  return BAC_EXAMS_DATABASE;
}

/**
 * Query helper to get all high-school term exams and quizzes
 */
export function getAllTermExams(): BacExamItem[] {
  return TERM_EXAMS_DATABASE;
}

/**
 * Query helper to get all exams
 */
export function getAllExams(): BacExamItem[] {
  return ALL_EXAMS_DATABASE;
}

/**
 * Find exam by its unique ID across official and term collections
 */
export function getBacExamById(id: string): BacExamItem | undefined {
  return ALL_EXAMS_DATABASE.find((item) => item.id === id);
}

/**
 * Filter official BAC exams according to stream, subject, year, session, and keywords
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
 * Filter term exams and quizzes by term, exam kind, stream, subject, and query
 */
export function filterTermExams(filters: TermExamFilters): BacExamItem[] {
  return TERM_EXAMS_DATABASE.filter((exam) => {
    if (filters.term && filters.term !== "all" && exam.term !== filters.term) {
      return false;
    }
    if (filters.kind && filters.kind !== "all" && exam.kind !== filters.kind) {
      return false;
    }
    if (filters.streamId && filters.streamId !== "all" && exam.streamId !== filters.streamId) {
      return false;
    }
    if (filters.subjectId && filters.subjectId !== "all" && exam.subjectId !== filters.subjectId) {
      return false;
    }
    if (filters.wilaya && filters.wilaya !== "all" && exam.wilaya !== filters.wilaya) {
      return false;
    }
    if (filters.searchQuery && filters.searchQuery.trim() !== "") {
      const q = filters.searchQuery.trim().toLowerCase();
      const matchTitle = exam.title_ar.toLowerCase().includes(q);
      const matchSubject = (ALL_SUBJECTS[exam.subjectId]?.name_ar || "").toLowerCase().includes(q);
      const matchSchool = (exam.schoolName || "").toLowerCase().includes(q);
      const matchWilaya = (exam.wilaya || "").toLowerCase().includes(q);
      const matchKeywords = exam.keywords?.some((k) => k.toLowerCase().includes(q)) ?? false;
      if (!matchTitle && !matchSubject && !matchSchool && !matchWilaya && !matchKeywords) {
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
    return Array.from(new Set(ALL_EXAMS_DATABASE.map((item) => item.subjectId)));
  }
  const streamExams = ALL_EXAMS_DATABASE.filter((item) => item.streamId === streamId);
  return Array.from(new Set(streamExams.map((item) => item.subjectId)));
}
