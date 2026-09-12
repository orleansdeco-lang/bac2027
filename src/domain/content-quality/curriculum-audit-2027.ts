/**
 * BAC Mastery — Official 2026-2027 Curriculum Audit & Legal Benchmark
 * 
 * Institutional & Legal Baseline for Academic Year 2026-2027 / BAC 2027:
 * 
 * 1. Ministerial Announcement Context:
 *    The Ministry of National Education has formally affirmed that the 2026-2027 school year
 *    remains under the current secondary-school pedagogical organization. Larger structural
 *    curriculum reforms are scheduled for academic year 2027-2028.
 * 
 * 2. Examination Format:
 *    The BAC examination format did not change. The examination subjects correspond to the
 *    official 3AS subjects programmed for 2026-2027.
 * 
 * 3. Ministerial Cancellation Decision (10 September 2026):
 *    A ministerial decision published on 10 September 2026 explicitly CANCELLED the previous
 *    decision regarding secondary-school weekly schedules and coefficients.
 * 
 * 4. Critical Coefficient Rule:
 *    NO coefficient data may be asserted as "current official BAC 2027 coefficients".
 *    All historical coefficients remain anchored in Executive Decree No. 07-142 of May 19, 2007,
 *    and are strictly classified as OFFICIAL_HISTORICAL.
 */

import { StreamId, SubjectId, TechniqueMathSpecialty } from "@/types/education";
import { StreamCurriculumAuditRecord } from "./types";

export const OFFICIAL_2027_MINISTERIAL_CONTEXT = {
  academicYear: "2026-2027",
  targetBacExam: "BAC 2027",
  secondaryOrganizationStatus: "REMAINS_CURRENT_ORGANIZATION",
  structuralReformTargetYear: "2027-2028",
  examFormatStatus: "UNMODIFIED_IDENTICAL_TO_3AS_SYLLABUS",
  ministerialCancellationDate: "2026-09-10",
  ministerialCancellationSubject: "إلغاء القرار الوزاري السابق المتعلق بالمواقيت والمعاملات في مرحلة التعليم الثانوي العام والتكنولوجي",
  governingHistoricalDecree: "المرسوم التنفيذي رقم 07-142 المؤرخ في 19 مايو 2007",
  coefficientAssertionPolicy: "OFFICIAL_HISTORICAL_ONLY",
};

export const CANONICAL_2027_STREAM_AUDIT: Record<StreamId, StreamCurriculumAuditRecord> = {
  sciences_exp: {
    streamId: "sciences_exp",
    streamName_ar: "علوم تجريبية",
    streamName_fr: "Sciences Expérimentales",
    educationLevel: "secondary",
    academicYear: "2026-2027",
    legalStatusSummary: "الشعبة سارية وفق التنظيم المعمول به؛ تخضع للمرسوم التنفيذي 07-142.",
    coefficientStatus: "OFFICIAL_HISTORICAL",
    ministerialCancellationNotice: "ألغى قرار 10 سبتمبر 2026 التعديلات المقترحة على المواقيت والمعاملات، وتعتمد المنصة المعاملات كمرجع تاريخي مقيد.",
    coreSubjects: ["natural_sciences", "physics", "math"],
    totalOfficialSubjects: 9,
    lastVerifiedDate: "2026-09-12",
    reviewerStatus: "AUDITED_LEGAL_BASELINE",
    unresolvedQuestions: [
      "تأكيد المنشور السنوي للمسابقات والامتحانات المدرسية لدورة 2027 فور صدوره.",
    ],
  },
  math: {
    streamId: "math",
    streamName_ar: "رياضيات",
    streamName_fr: "Mathématiques",
    educationLevel: "secondary",
    academicYear: "2026-2027",
    legalStatusSummary: "الشعبة سارية وفق التنظيم المعمول به؛ مادة الرياضيات ومادة العلوم الفيزيائية هما الركيزتان الأساسيتان.",
    coefficientStatus: "OFFICIAL_HISTORICAL",
    ministerialCancellationNotice: "قرار 10 سبتمبر 2026 ملزم؛ المعاملات تاريخية ولا يُزعم أنها معتمدة رسمياً لـ 2027.",
    coreSubjects: ["math", "physics"],
    totalOfficialSubjects: 9,
    lastVerifiedDate: "2026-09-12",
    reviewerStatus: "AUDITED_LEGAL_BASELINE",
    unresolvedQuestions: [
      "متابعة صدور دليل إعداد مواضيع البكالوريا المحين لمادة الرياضيات.",
    ],
  },
  technique_math: {
    streamId: "technique_math",
    streamName_ar: "تقني رياضي",
    streamName_fr: "Technique Mathématiques",
    educationLevel: "secondary",
    academicYear: "2026-2027",
    legalStatusSummary: "تتفرع شعبة التقني رياضي وجوباً إلى أربعة فروع تخصصية مستقلة. يُحظر دمج التخصصات أو تعيين خيار افتراضي عشوائي.",
    coefficientStatus: "OFFICIAL_HISTORICAL",
    ministerialCancellationNotice: "قرار 10 سبتمبر 2026 ملزم؛ معامل المادة التخصصية (معامل 7) تاريخي وفق المرسوم 07-142.",
    coreSubjects: ["math", "physics"],
    totalOfficialSubjects: 9,
    lastVerifiedDate: "2026-09-12",
    reviewerStatus: "AUDITED_LEGAL_BASELINE",
    unresolvedQuestions: [
      "التأكد من مطابقة دفاتر الشروط ومشاريع إنجاز الأعمال المؤطرة في الفروع التكنولوجية.",
    ],
  },
  gestion_eco: {
    streamId: "gestion_eco",
    streamName_ar: "تسيير واقتصاد",
    streamName_fr: "Gestion et Économie",
    educationLevel: "secondary",
    academicYear: "2026-2027",
    legalStatusSummary: "الشعبة سارية وفق التنظيم المعمول به؛ المواد المميزة: التسيير المحاسبي والمالي، الاقتصاد والمناجمنت، والقانون.",
    coefficientStatus: "OFFICIAL_HISTORICAL",
    ministerialCancellationNotice: "قرار 10 سبتمبر 2026 ملزم؛ تصنيف المعاملات مرجع تاريخي.",
    coreSubjects: ["accounting_finance", "economics_management", "law", "math"],
    totalOfficialSubjects: 8,
    lastVerifiedDate: "2026-09-12",
    reviewerStatus: "AUDITED_LEGAL_BASELINE",
    unresolvedQuestions: [
      "تحيين معايير النظام المحاسبي المالي (SCF) في نماذج التمارين المطروحة.",
    ],
  },
  lettres_philo: {
    streamId: "lettres_philo",
    streamName_ar: "آداب وفلسفة",
    streamName_fr: "Lettres et Philosophie",
    educationLevel: "secondary",
    academicYear: "2026-2027",
    legalStatusSummary: "الشعبة سارية؛ مادة الفلسفة واللغة العربية وآدابها هما المواد المميزة للشعبة.",
    coefficientStatus: "OFFICIAL_HISTORICAL",
    ministerialCancellationNotice: "قرار 10 سبتمبر 2026 ملزم؛ المعاملات مرجع تاريخي رسمي.",
    coreSubjects: ["philosophy", "arabic", "history_geography"],
    totalOfficialSubjects: 7,
    lastVerifiedDate: "2026-09-12",
    reviewerStatus: "AUDITED_LEGAL_BASELINE",
    unresolvedQuestions: [
      "إرشادات صياغة المقالة الفلسفية وتوزيع علامات سلم التصحيح في المنهجيات الثلاث.",
    ],
  },
  langues_etrangeres: {
    streamId: "langues_etrangeres",
    streamName_ar: "لغات أجنبية",
    streamName_fr: "Langues Étrangères",
    educationLevel: "secondary",
    academicYear: "2026-2027",
    legalStatusSummary: "الشعبة سارية؛ المواد المميزة هي اللغات: العربية، الفرنسية، الإنجليزية، واللغة الثالثة (إسبانية/ألمانية/إيطالية).",
    coefficientStatus: "OFFICIAL_HISTORICAL",
    ministerialCancellationNotice: "قرار 10 سبتمبر 2026 ملزم؛ تصنيف المعاملات مرجع تاريخي رسمي.",
    coreSubjects: ["arabic", "french", "english", "third_language"],
    totalOfficialSubjects: 8,
    lastVerifiedDate: "2026-09-12",
    reviewerStatus: "AUDITED_LEGAL_BASELINE",
    unresolvedQuestions: [
      "التحقق من معادلة التقييم بين خيارات اللغة الثالثة (إسبانية، ألمانية، إيطالية).",
    ],
  },
};

export const TECHNIQUE_MATH_SPECIALTY_AUDIT: Record<TechniqueMathSpecialty, {
  name_ar: string;
  name_fr: string;
  specialtySubjectId: SubjectId;
  isolationGuarantee: string;
}> = {
  civil_eng: {
    name_ar: "هندسة مدنية",
    name_fr: "Génie Civil",
    specialtySubjectId: "civil_eng",
    isolationGuarantee: "مستقلة كلياً عن فروع الميكانيك والكهرباء والطرائق في كافة المهارات التخصصية.",
  },
  mechanical_eng: {
    name_ar: "هندسة ميكانيكية",
    name_fr: "Génie Mécanique",
    specialtySubjectId: "mechanical_eng",
    isolationGuarantee: "مستقلة كلياً؛ لا يتم اعتبارها الفرع الافتراضي لشعبة التقني رياضي.",
  },
  electrical_eng: {
    name_ar: "هندسة كهربائية",
    name_fr: "Génie Électrique",
    specialtySubjectId: "electrical_eng",
    isolationGuarantee: "مستقلة كلياً بمقررات الأنظمة المنطقية والآلية والإلكترونية.",
  },
  process_eng: {
    name_ar: "هندسة الطرائق",
    name_fr: "Génie des Procédés",
    specialtySubjectId: "process_eng",
    isolationGuarantee: "مستقلة كلياً بمقررات الكيمياء العضوية والعمليات الصناعية والديناميكا الحرارية.",
  },
};
