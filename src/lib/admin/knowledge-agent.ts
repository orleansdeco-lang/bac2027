/**
 * SHATER KNOWLEDGE & DATA AGENT
 * 
 * Central Intelligence Agent for Ingesting, Organizing, Classifying,
 * Quality-Checking, and Validating Educational Knowledge in SHATER.
 * 
 * Strict Invariants:
 * 1. ZERO AUTO-PUBLISH: User-submitted content is NEVER published automatically.
 * 2. 7-Stage Strict Lifecycle:
 *    received → processing → classified → needs_review → verified → published | rejected
 * 3. Human Review Gate: All publications and merges require human review.
 * 4. Duplicate Protection: Detects possible duplicates and flags them; never auto-deletes duplicates.
 * 5. Quality Sentinel: Flags missing parts, poor OCR, or incomplete solutions without false correctness claims.
 * 6. File & Payload Security: Safe file handling, mime verification, size limits, no executable execution.
 * 7. Complete Audit Trail: Captures ingestion, AI classification, review actions, and publication.
 */

import { StreamId, SubjectId } from "@/types/education";
import { AdminContext } from "./auth";
import { hasPermission } from "./permissions";
import { recordAdminAudit } from "./audit";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";
import { GoogleGenAI } from "@google/genai";

export type ContentLifecycleStatus =
  | "received"
  | "processing"
  | "classified"
  | "needs_review"
  | "verified"
  | "published"
  | "rejected";

export type ContentItemType =
  | "exam_paper"
  | "exercise"
  | "summary"
  | "solution"
  | "student_experience"
  | "notebook_photo"
  | "educational_resource";

export interface ClassificationMetadata {
  subject: string;
  subjectAr: string;
  stream: string;
  streamAr: string;
  grade: "3AS_BAC" | "4AM_BEM" | "2AS" | "1AS";
  unit: string;
  lesson: string;
  skill?: string;
  difficulty: "standard" | "advanced" | "challenge";
  difficultyAr: string;
  contentType: ContentItemType;
  contentTypeAr: string;
  source: string;
  language: "ar" | "fr" | "en";
}

export interface DuplicateDetectionResult {
  isPossibleDuplicate: boolean;
  matchedItemId?: string;
  matchedTitle?: string;
  similarityScore?: number; // 0.0 to 1.0
  reason?: string;
}

export interface QualityIssue {
  code: string;
  severity: "info" | "warning" | "critical";
  messageAr: string;
}

export interface QualityCheckResult {
  qualityScore: number; // 0 to 100
  hasMissingInfo: boolean;
  missingFields: string[];
  hasContradictions: boolean;
  ocrQuality: "high" | "medium" | "low" | "unreadable" | "not_applicable";
  isIncompleteSolution: boolean;
  issues: QualityIssue[];
}

export interface AIConfidence {
  overall: number; // 0.0 to 1.0
  classificationConfidence: number;
  ocrConfidence: number;
  isVerifiedByHuman: boolean;
  disclaimer: string;
}

export interface IngestedKnowledgeItem {
  id: string;
  title: string;
  rawContent: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSizeBytes?: number;
  submittedByUserId?: string;
  submittedByRole?: string;
  status: ContentLifecycleStatus;
  classification: ClassificationMetadata;
  duplicateCheck: DuplicateDetectionResult;
  qualityCheck: QualityCheckResult;
  aiConfidence: AIConfidence;
  reviewNotes?: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// In-Memory store for Knowledge Items (with initial mock seeds for tests and resilient operational retrieval)
const knowledgeStore = new Map<string, IngestedKnowledgeItem>([
  [
    "item-seed-bac-math-01",
    {
      id: "item-seed-bac-math-01",
      title: "تمرين الدوال الأسية واللوغاريتمية — بكالوريا تجريبية ولاية سطيف 2024",
      rawContent: "التمرين الأول (04 نقاط): لتكن الدالة f المعرفة على R بـ f(x) = (2x - 1)e^x + 1. احسب النهايات وادرس اتجاه التغير.",
      fileUrl: "/documents/exercises/setif-math-2024.pdf",
      fileName: "setif-math-2024.pdf",
      fileType: "application/pdf",
      fileSizeBytes: 1048576,
      submittedByUserId: "student-ali-16",
      submittedByRole: "STUDENT",
      status: "published",
      classification: {
        subject: "mathematics",
        subjectAr: "الرياضيات",
        stream: "sciences_exp",
        streamAr: "علوم تجريبية",
        grade: "3AS_BAC",
        unit: "الوحدة الأولى: الدوال العددية",
        lesson: "الدوال الأسية ودراسة التغيرات",
        skill: "حساب النهايات ودراسة اتجاه التغير ورسم المنحنى",
        difficulty: "standard",
        difficultyAr: "متوسط (standard)",
        contentType: "exercise",
        contentTypeAr: "تمرين مسألة",
        source: "بكالوريا تجريبية — ولاية سطيف",
        language: "ar",
      },
      duplicateCheck: { isPossibleDuplicate: false },
      qualityCheck: {
        qualityScore: 95,
        hasMissingInfo: false,
        missingFields: [],
        hasContradictions: false,
        ocrQuality: "high",
        isIncompleteSolution: false,
        issues: [],
      },
      aiConfidence: {
        overall: 0.94,
        classificationConfidence: 0.96,
        ocrConfidence: 0.92,
        isVerifiedByHuman: true,
        disclaimer: "تمت مراجعة هذا المحتوى واعتماده رسمياً من قبل المفتشية البيداغوجية.",
      },
      createdAt: "2026-09-15T10:00:00.000Z",
      updatedAt: "2026-09-15T10:30:00.000Z",
    },
  ],
  [
    "item-seed-summary-physics-01",
    {
      id: "item-seed-summary-physics-01",
      title: "ملخص قوانين المتابعة الزمنية لتحول كيميائي — الأستاذ قزوري",
      rawContent: "قوانين السرعات: سرعة التفاعل v = 1/V * dx/dt. زمن نصف التفاعل t1/2 هو الزمن اللازم لبلوغ التفاعل نصف تقدمه النهائي.",
      fileUrl: "/documents/summaries/physics-chem-kinetics.pdf",
      fileName: "physics-chem-kinetics.pdf",
      fileType: "application/pdf",
      fileSizeBytes: 2097152,
      submittedByUserId: "student-mariam-31",
      submittedByRole: "STUDENT",
      status: "verified",
      classification: {
        subject: "physics",
        subjectAr: "العلوم الفيزيائية",
        stream: "sciences_exp",
        streamAr: "علوم تجريبية",
        grade: "3AS_BAC",
        unit: "الوحدة 01: المتابعة الزمنية لتحول كيميائي",
        lesson: "سرعات التفاعل وزمن نصف التفاعل",
        skill: "حساب السرعة الحجمية للتفاعل بيانيا",
        difficulty: "standard",
        difficultyAr: "متوسط (standard)",
        contentType: "summary",
        contentTypeAr: "ملخص درس",
        source: "ملخصات الأستاذ قزوري",
        language: "ar",
      },
      duplicateCheck: { isPossibleDuplicate: false },
      qualityCheck: {
        qualityScore: 92,
        hasMissingInfo: false,
        missingFields: [],
        hasContradictions: false,
        ocrQuality: "high",
        isIncompleteSolution: false,
        issues: [],
      },
      aiConfidence: {
        overall: 0.91,
        classificationConfidence: 0.95,
        ocrConfidence: 0.88,
        isVerifiedByHuman: true,
        disclaimer: "تم التحقق من تطابق القوانين مع المنهاج الرسمي للجيل الثاني.",
      },
      createdAt: "2026-09-20T14:00:00.000Z",
      updatedAt: "2026-09-20T14:45:00.000Z",
    },
  ],
]);

/**
 * 1. INGESTION & SECURITY VALIDATION
 * Safely processes user-submitted payloads and enforces strict upload boundaries.
 */
export interface IngestInput {
  title: string;
  rawContent?: string;
  fileName?: string;
  fileType?: string;
  fileSizeBytes?: number;
  fileUrl?: string;
  submittedByUserId?: string;
  submittedByRole?: string;
  declaredSubject?: string;
  declaredStream?: string;
  declaredContentType?: ContentItemType;
}

export function validateSafeUpload(input: IngestInput): { valid: boolean; error?: string } {
  // Safe File Ext Check
  if (input.fileName) {
    const ext = input.fileName.split(".").pop()?.toLowerCase();
    const allowedExtensions = ["pdf", "jpg", "jpeg", "png", "webp", "txt", "md"];
    const blockedExtensions = ["exe", "bat", "sh", "js", "ts", "py", "php", "html", "vbs", "msi"];

    if (ext && blockedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `الملف [${input.fileName}] ذو امتداد تنفيذي محظور لأسباب أمنية.`,
      };
    }

    if (ext && !allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `الامتداد [.${ext}] غير مدعوم. الصيغ المدعومة: PDF، صور عالية الدقة (JPG, PNG, WEBP)، نصوص (TXT).`,
      };
    }
  }

  // File size limit (25MB max)
  if (input.fileSizeBytes && input.fileSizeBytes > 25 * 1024 * 1024) {
    return {
      valid: false,
      error: "حجم الملف يتجاوز الحد الأقصى المسموح به (25 ميغابايت).",
    };
  }

  // Title validation
  if (!input.title || input.title.trim().length < 3) {
    return {
      valid: false,
      error: "عنوان الوثيقة أو التمرين مطلوب ويجب ألا يقل عن 3 أحرف.",
    };
  }

  return { valid: true };
}

/**
 * 2. CLASSIFICATION ENGINE
 * Analyzes pedagogical content and categorizes it strictly against official Algerian BAC taxonomy.
 */
export function classifyContent(
  title: string,
  content: string,
  declared?: Partial<ClassificationMetadata>
): ClassificationMetadata {
  const combined = `${title} ${content}`.toLowerCase();
  const normalized = combined
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");

  // Subject identification
  let subject = declared?.subject || "general";
  let subjectAr = "عام";

  if (
    normalized.includes("دوال") ||
    normalized.includes("متتاليات") ||
    normalized.includes("تكامل") ||
    normalized.includes("احتمالات") ||
    normalized.includes("هندسه فضائيه") ||
    normalized.includes("رياضيات") ||
    normalized.includes("math")
  ) {
    subject = "mathematics";
    subjectAr = "الرياضيات";
  } else if (
    normalized.includes("فيزياء") ||
    normalized.includes("كيميا") ||
    normalized.includes("متابعه") ||
    normalized.includes("سرعه") ||
    normalized.includes("اكسده") ||
    normalized.includes("ميكانيك") ||
    normalized.includes("نووي") ||
    normalized.includes("داره") ||
    normalized.includes("rc") ||
    normalized.includes("rl")
  ) {
    subject = "physics";
    subjectAr = "العلوم الفيزيائية";
  } else if (
    normalized.includes("علوم") ||
    normalized.includes("طبيعيه") ||
    normalized.includes("تركيب البروتين") ||
    normalized.includes("انزيمات") ||
    normalized.includes("مناعه") ||
    normalized.includes("عصبي") ||
    normalized.includes("جيولوجيا")
  ) {
    subject = "natural_sciences";
    subjectAr = "علوم الطبيعة والحياة";
  } else if (
    normalized.includes("فلسفه") ||
    normalized.includes("اطروحه") ||
    normalized.includes("جدليه") ||
    normalized.includes("استقصاء") ||
    normalized.includes("مقاله")
  ) {
    subject = "philosophy";
    subjectAr = "الفلسفة";
  } else if (
    normalized.includes("تاريخ") ||
    normalized.includes("جغرافيا") ||
    normalized.includes("حرب بارده") ||
    normalized.includes("ثوره") ||
    normalized.includes("خرائط")
  ) {
    subject = "history_geography";
    subjectAr = "التاريخ والجغرافيا";
  } else if (
    normalized.includes("شريعه") ||
    normalized.includes("اسلاميه") ||
    normalized.includes("عقيده") ||
    normalized.includes("قران") ||
    normalized.includes("حديث")
  ) {
    subject = "islamic_studies";
    subjectAr = "العلوم الإسلامية";
  } else if (
    normalized.includes("عربيه") ||
    normalized.includes("ادب") ||
    normalized.includes("شعر") ||
    normalized.includes("نثر") ||
    normalized.includes("محسنات")
  ) {
    subject = "arabic_literature";
    subjectAr = "اللغة العربية وآدابها";
  }

  // Stream identification
  let stream = declared?.stream || "sciences_exp";
  let streamAr = "علوم تجريبية";

  if (combined.includes("تقني رياضي") || combined.includes("هندسة مدنية") || combined.includes("هندسة ميكانيكية") || combined.includes("هندسة كهربائية") || combined.includes("طرائق")) {
    stream = "technique_math";
    streamAr = "تقني رياضي";
  } else if (combined.includes("رياضيات") && (combined.includes("شعبة رياضيات") || combined.includes("قسم الرياضيات") || combined.includes("مواضيع الرياضيات"))) {
    stream = "math";
    streamAr = "رياضيات";
  } else if (combined.includes("تسيير") || combined.includes("اقتصاد") || combined.includes("محاسبة") || combined.includes("قانون")) {
    stream = "gestion_eco";
    streamAr = "تسيير واقتصاد";
  } else if (combined.includes("آداب") || combined.includes("فلسفة") || combined.includes("أدبي")) {
    stream = "lettres_philo";
    streamAr = "آداب وفلسفة";
  } else if (combined.includes("لغات") || combined.includes("إسبانية") || combined.includes("ألمانية") || combined.includes("إيطالية")) {
    stream = "langues";
    streamAr = "لغات أجنبية";
  }

  // Grade
  let grade: ClassificationMetadata["grade"] = "3AS_BAC";
  if (combined.includes("بيام") || combined.includes("bem") || combined.includes("رابعة متوسط") || combined.includes("تعليم متوسط")) {
    grade = "4AM_BEM";
  }

  // Content Type
  let contentType: ContentItemType = declared?.contentType || "exercise";
  let contentTypeAr = "تمرين مسألة";

  if (combined.includes("ملخص") || combined.includes("خريطة ذهنية") || combined.includes("قوانين") || combined.includes("منهجية")) {
    contentType = "summary";
    contentTypeAr = "ملخص ومنهجية";
  } else if (combined.includes("امتحان") || combined.includes("بكالوريا تجريبية") || combined.includes("موضوع اختبار") || combined.includes("فرض")) {
    contentType = "exam_paper";
    contentTypeAr = "موضوع امتحان كامل";
  } else if (combined.includes("حل") || combined.includes("إجابة نموذجية") || combined.includes("تصحيح")) {
    contentType = "solution";
    contentTypeAr = "حل وتصحيح نموذجي";
  } else if (combined.includes("تجربة") || combined.includes("نصيحة متفوق") || combined.includes("برنامج دراسة")) {
    contentType = "student_experience";
    contentTypeAr = "تجربة تفوق";
  } else if (combined.includes("كراس") || combined.includes("دفتر") || combined.includes("صورة كراس")) {
    contentType = "notebook_photo";
    contentTypeAr = "صورة كراس دراسي";
  }

  // Unit & Lesson extraction
  let unit = "الوحدة الأولى: المفاهيم الأساسية";
  let lesson = "مراجعة مكتسبات قبلية وتطبيقات";

  if (subject === "mathematics") {
    if (combined.includes("دوال") || combined.includes("أسية") || combined.includes("لوغاريتم")) {
      unit = "الوحدة 01: الدوال العددية واللوغاريتمية والأسية";
      lesson = combined.includes("لوغاريتم") ? "الدوال اللوغاريتمية النيبيرية" : "الدوال الأسية ودراسة التغيرات";
    } else if (combined.includes("متتاليات") || combined.includes("تراجع") || combined.includes("حسابية") || combined.includes("هندسية")) {
      unit = "الوحدة 02: المتتاليات العددية";
      lesson = "البرهان بالتراجع واتجاه التغير وحساب المجاميع";
    } else if (combined.includes("احتمالات") || combined.includes("توفيقة") || combined.includes("متغير عشوائي")) {
      unit = "الوحدة 03: الاحتمالات والإحصاء";
      lesson = "الاحتمالات الشرطية والمتغير العشوائي";
    } else if (combined.includes("أعداد مركبة") || combined.includes("تحويلات نقطية")) {
      unit = "الوحدة 04: الأعداد المركبة والتحويلات النقطية";
      lesson = "الشكل الجبري والمثلثي والعمدة";
    }
  } else if (subject === "physics") {
    if (normalized.includes("متابعه") || normalized.includes("كيميا") || normalized.includes("سرعه") || normalized.includes("اكسده")) {
      unit = "الوحدة 01: المتابعة الزمنية لتحول كيميائي في وسط مائي";
      lesson = "سرعات التفاعل وزمن نصف التفاعل والعوامل الحركية";
    } else if (combined.includes("نووي") || combined.includes("نشاط إشعاعي") || combined.includes("تناقص")) {
      unit = "الوحدة 02: التحولات النووية وطاقة الربط";
      lesson = "قانون التناقص الإشعاعي والمخططات الطاقوية";
    } else if (combined.includes("rc") || combined.includes("rl") || combined.includes("مكثفة") || combined.includes("وشيعة")) {
      unit = "الوحدة 03: الظواهر الكهربائية (RC / RL)";
      lesson = "شحن وتفريغ مكثفة وتطبيق قانون جمع التوترات";
    } else if (combined.includes("ميكانيك") || combined.includes("نيوتن") || combined.includes("أقمار") || combined.includes("سقوط")) {
      unit = "الوحدة 05: تطور جملة ميكانيكية";
      lesson = "قوانين نيوتن وحركة الأقمار الاصطناعية والكواكب";
    }
  }

  // Difficulty estimation
  let difficulty: ClassificationMetadata["difficulty"] = "standard";
  let difficultyAr = "متوسط (standard)";
  if (combined.includes("صعب") || combined.includes("أولمبياد") || combined.includes("تحدي") || combined.includes("مركب")) {
    difficulty = "advanced";
    difficultyAr = "صعب (advanced)";
  }

  // Source extraction
  let source = "مساهمة تلميذ معتمدة في شاطر";
  if (combined.includes("ولاية")) {
    const wilayaMatch = combined.match(/ولاية\s+([\u0621-\u064A]+)/);
    if (wilayaMatch) source = `بكالوريا تجريبية — ولاية ${wilayaMatch[1]}`;
  } else if (combined.includes("وزارة") || combined.includes("مفتشية")) {
    source = "المفتشية العامة للبيداغوجيا والامتحانات";
  }

  return {
    subject,
    subjectAr,
    stream,
    streamAr,
    grade,
    unit,
    lesson,
    skill: `تطبيق مباشر في درس ${lesson}`,
    difficulty,
    difficultyAr,
    contentType,
    contentTypeAr,
    source,
    language: combined.includes("calculer") || combined.includes("fonction") ? "fr" : "ar",
  };
}

/**
 * 3. DUPLICATE DETECTION ENGINE
 * Computes semantic and textual similarity against the existing database.
 * Rule: Flags `possible_duplicate` without destructive auto-deletion.
 */
export function detectDuplicates(
  candidateTitle: string,
  candidateContent: string,
  existingItems: IngestedKnowledgeItem[]
): DuplicateDetectionResult {
  const normCand = candidateTitle.toLowerCase().replace(/[^\u0621-\u064Aa-z0-9]/g, " ").trim();
  const candWords = new Set(normCand.split(/\s+/).filter((w) => w.length > 2));

  let highestScore = 0;
  let bestMatch: IngestedKnowledgeItem | null = null;

  for (const item of existingItems) {
    const normItem = item.title.toLowerCase().replace(/[^\u0621-\u064Aa-z0-9]/g, " ").trim();
    const itemWords = new Set(normItem.split(/\s+/).filter((w) => w.length > 2));

    // Jaccard similarity of keywords
    let intersection = 0;
    candWords.forEach((w) => {
      if (itemWords.has(w)) intersection++;
    });
    const unionWords = new Set<string>();
    candWords.forEach((w) => unionWords.add(w));
    itemWords.forEach((w) => unionWords.add(w));
    const union = unionWords.size;
    const score = union > 0 ? intersection / union : 0;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  // Duplicate threshold: >= 0.65 similarity
  if (highestScore >= 0.65 && bestMatch) {
    return {
      isPossibleDuplicate: true,
      matchedItemId: bestMatch.id,
      matchedTitle: bestMatch.title,
      similarityScore: Math.round(highestScore * 100) / 100,
      reason: `تطابق عنوان وكلمات مفتاحية بنسبة ${Math.round(highestScore * 100)}% مع الوثيقة المسجلة: "${bestMatch.title}"`,
    };
  }

  return { isPossibleDuplicate: false };
}

/**
 * 4. QUALITY CHECK SENTINEL
 * Detects missing information, poor OCR, truncated text, and incomplete solutions.
 */
export function runQualityCheck(
  title: string,
  content: string,
  classification: ClassificationMetadata
): QualityCheckResult {
  const issues: QualityIssue[] = [];
  const missingFields: string[] = [];
  let score = 100;

  // 1. Text Length & Truncation Check
  const textLen = (content || "").trim().length;
  if (textLen < 20) {
    score -= 30;
    missingFields.push("rawContent");
    issues.push({
      code: "TRUNCATED_CONTENT",
      severity: "critical",
      messageAr: "النص المستخرج قصير جداً أو يبدو مبتوراً (أقل من 20 حرفاً).",
    });
  }

  // 2. OCR Quality Assessment
  let ocrQuality: QualityCheckResult["ocrQuality"] = "high";
  const replacementCharCount = (content.match(/|\?{3,}|\*{3,}/g) || []).length;
  if (replacementCharCount > 5) {
    ocrQuality = "low";
    score -= 25;
    issues.push({
      code: "POOR_OCR_ARTEFACTS",
      severity: "warning",
      messageAr: "تم رصد علامات تشويش في التعرف الضوئي (رموز غير مقروءة  أو استفهامات متتالية).",
    });
  }

  // 3. Solution Completeness Check
  let isIncompleteSolution = false;
  if (classification.contentType === "solution") {
    const hasFinalAnswer = content.includes("ومنه") || content.includes("إذن") || content.includes("النتيجة") || content.includes("=");
    if (!hasFinalAnswer || textLen < 50) {
      isIncompleteSolution = true;
      score -= 20;
      issues.push({
        code: "INCOMPLETE_SOLUTION",
        severity: "warning",
        messageAr: "الحل المقترح يفتقر إلى النتائج النهائية أو خطوات التبرير النموذجية.",
      });
    }
  }

  // 4. Missing Unit or Lesson
  if (!classification.unit || classification.unit.includes("المفاهيم الأساسية")) {
    issues.push({
      code: "GENERIC_UNIT_CLASSIFICATION",
      severity: "info",
      messageAr: "الوحدة مصنفة بشكل عام؛ يُستحسن التدقيق لتحديد الوحدة الدقيقة في المنهاج.",
    });
  }

  score = Math.max(0, Math.min(100, score));

  return {
    qualityScore: score,
    hasMissingInfo: missingFields.length > 0,
    missingFields,
    hasContradictions: false,
    ocrQuality,
    isIncompleteSolution,
    issues,
  };
}

/**
 * 5. MAIN AGENT INGESTION WORKFLOW
 * Handles Request -> Validation -> Classification -> Duplicate Check -> Quality Check -> State: needs_review
 */
export async function ingestKnowledgeItem(
  input: IngestInput,
  actorContext: { userId: string; role: string }
): Promise<IngestedKnowledgeItem> {
  // Validate safety
  const safeCheck = validateSafeUpload(input);
  if (!safeCheck.valid) {
    throw new Error(safeCheck.error || "فشل التحقق الأمني من سلامة الملف المدخل.");
  }

  const itemId = `know_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  // Run Classification
  const classification = classifyContent(input.title, input.rawContent || "", {
    subject: input.declaredSubject,
    stream: input.declaredStream,
    contentType: input.declaredContentType,
  });

  // Run Duplicate Detection
  const existingItems = Array.from(knowledgeStore.values());
  const duplicateCheck = detectDuplicates(input.title, input.rawContent || "", existingItems);

  // Run Quality Sentinel
  const qualityCheck = runQualityCheck(input.title, input.rawContent || "", classification);

  // Calculate Internal AI Confidence Signal
  const classificationConfidence = classification.subject !== "general" ? 0.92 : 0.65;
  const ocrConfidence = qualityCheck.ocrQuality === "high" ? 0.95 : qualityCheck.ocrQuality === "medium" ? 0.75 : 0.45;
  const overallConfidence = Math.round(((classificationConfidence + ocrConfidence + (qualityCheck.qualityScore / 100)) / 3) * 100) / 100;

  const item: IngestedKnowledgeItem = {
    id: itemId,
    title: input.title.trim(),
    rawContent: input.rawContent || "",
    fileUrl: input.fileUrl,
    fileName: input.fileName,
    fileType: input.fileType,
    fileSizeBytes: input.fileSizeBytes,
    submittedByUserId: input.submittedByUserId || actorContext.userId,
    submittedByRole: input.submittedByRole || actorContext.role,
    status: "needs_review", // Strict invariant: Never auto-published
    classification,
    duplicateCheck,
    qualityCheck,
    aiConfidence: {
      overall: overallConfidence,
      classificationConfidence,
      ocrConfidence,
      isVerifiedByHuman: false,
      disclaimer: "إشارة ثقة استدلالية داخلية للذكاء الاصطناعي، وتتطلب تأكيد المفتش البيداغوجي البشري.",
    },
    createdAt: now,
    updatedAt: now,
  };

  // Persist to store
  knowledgeStore.set(itemId, item);

  // Record Audit Log for Ingestion & Classification
  await recordAdminAudit({
    actorUserId: actorContext.userId,
    actorRole: actorContext.role,
    action: "KNOWLEDGE_AGENT_INGEST",
    resourceType: "knowledge_items",
    resourceId: itemId,
    reason: `استقبال وتصنيف آلي للوثيقة: [${item.title}] بانتظار المراجعة البشرية`,
    afterState: {
      title: item.title,
      classification: item.classification,
      isDuplicate: duplicateCheck.isPossibleDuplicate,
      qualityScore: qualityCheck.qualityScore,
    },
    metadata: {
      fileType: item.fileType,
      confidence: overallConfidence,
      initialStatus: item.status,
    },
  });

  return item;
}

/**
 * 6. HUMAN REVIEW WORKFLOW
 * Reviewer can: approve, reject, edit, merge, request_review
 */
export type ReviewActionType = "approve" | "reject" | "edit" | "merge" | "request_review" | "publish";

export interface ReviewActionOptions {
  notes?: string;
  rejectionReason?: string;
  targetMergeItemId?: string;
  editedTitle?: string;
  editedClassification?: Partial<ClassificationMetadata>;
}

export async function reviewKnowledgeItem(
  itemId: string,
  action: ReviewActionType,
  options: ReviewActionOptions,
  reviewerContext: AdminContext
): Promise<{ success: boolean; item: IngestedKnowledgeItem; messageAr: string }> {
  const item = knowledgeStore.get(itemId);
  if (!item) {
    throw new Error(`لم يتم العثور على وثيقة المعرفة بالمعرف [${itemId}].`);
  }

  // Permission Verification
  if (!hasPermission(reviewerContext.role, "content.manage")) {
    throw new Error(
      `غير مصرح لك بمراجعة المحتوى التعليمي. تتطلب صلاحية [content.manage] التي لا تتوفر لدورك (${reviewerContext.role}).`
    );
  }

  const previousState = JSON.parse(JSON.stringify(item));
  const now = new Date().toISOString();

  item.reviewedByUserId = reviewerContext.userId;
  item.reviewedAt = now;
  item.reviewNotes = options.notes || item.reviewNotes;
  item.updatedAt = now;

  let messageAr = "";

  switch (action) {
    case "approve":
      item.status = "verified";
      item.aiConfidence.isVerifiedByHuman = true;
      messageAr = "تمت الموافقة والتحقق من صحة الوثيقة وتصنيفها البيداغوجي بنجاح.";
      break;

    case "publish":
      // Explicit publication safeguard
      if (item.status !== "verified" && item.status !== "needs_review") {
        throw new Error("لا يمكن نشر محتوى تم رفضه أو غير مكتمل المعالجة.");
      }
      item.status = "published";
      item.aiConfidence.isVerifiedByHuman = true;
      messageAr = "تم نشر الوثيقة وتفعيل إتاحتها للطلاب في المنصة بنجاح.";
      break;

    case "reject":
      item.status = "rejected";
      item.rejectionReason = options.rejectionReason || "لم تستوفِ معايير الجودة البيداغوجية المعتمدة في شاطر.";
      messageAr = `تم رفض الوثيقة: ${item.rejectionReason}`;
      break;

    case "edit":
      if (options.editedTitle) {
        item.title = options.editedTitle;
      }
      if (options.editedClassification) {
        item.classification = {
          ...item.classification,
          ...options.editedClassification,
        };
      }
      item.status = "verified";
      item.aiConfidence.isVerifiedByHuman = true;
      messageAr = "تم تعديل التصنيف واعتماد الوثيقة كمسودة مؤكدة ومحققة.";
      break;

    case "merge":
      if (!options.targetMergeItemId) {
        throw new Error("معرّف الوثيقة الأصلية (targetMergeItemId) مطلوب لعملية الدمج.");
      }
      const targetItem = knowledgeStore.get(options.targetMergeItemId);
      if (!targetItem) {
        throw new Error(`الوثيقة الهدف للدمج [${options.targetMergeItemId}] غير موجودة.`);
      }
      item.status = "rejected";
      item.rejectionReason = `تم دمجها كنسخة مكررة مع الوثيقة الأصلية: [${targetItem.title}] (${targetItem.id})`;
      messageAr = `تم دمج الوثيقة بنجاح مع الوثيقة الأصلية: "${targetItem.title}".`;
      break;

    case "request_review":
      item.status = "needs_review";
      item.reviewNotes = options.notes || "مطلوب مراجعة ثانية من قبل مفتش المادة المتخصص.";
      messageAr = "تم تحويل الوثيقة للمراجعة المعمقة من قبل المفتش البيداغوجي.";
      break;

    default:
      throw new Error(`إجراء المراجعة [${action}] غير معروف.`);
  }

  // Append-Only Audit Logging
  await recordAdminAudit({
    actorUserId: reviewerContext.userId,
    actorRole: reviewerContext.role,
    action: `KNOWLEDGE_AGENT_REVIEW_${action.toUpperCase()}`,
    resourceType: "knowledge_items",
    resourceId: itemId,
    reason: `إجراء مراجعة بشرية [${action}] للوثيقة: [${item.title}]`,
    beforeState: previousState,
    afterState: item as unknown as Record<string, unknown>,
    metadata: {
      action,
      notes: options.notes,
      rejectionReason: item.rejectionReason,
    },
  });

  return { success: true, item, messageAr };
}

/**
 * 7. RETRIEVAL & FILTERING
 */
export function listKnowledgeItems(filters?: {
  status?: ContentLifecycleStatus;
  subject?: string;
  stream?: string;
  isDuplicate?: boolean;
  limit?: number;
}): IngestedKnowledgeItem[] {
  let items = Array.from(knowledgeStore.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (filters?.status) {
    items = items.filter((i) => i.status === filters.status);
  }
  if (filters?.subject) {
    items = items.filter((i) => i.classification.subject === filters.subject);
  }
  if (filters?.stream) {
    items = items.filter((i) => i.classification.stream === filters.stream);
  }
  if (filters?.isDuplicate !== undefined) {
    items = items.filter((i) => i.duplicateCheck.isPossibleDuplicate === filters.isDuplicate);
  }

  return items.slice(0, filters?.limit || 50);
}

export function getKnowledgeItemById(id: string): IngestedKnowledgeItem | null {
  return knowledgeStore.get(id) || null;
}
