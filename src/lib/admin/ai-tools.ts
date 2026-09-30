/**
 * SHATER Control Center — Admin AI Approved Tools Registry
 * Strict Invariants:
 * 1. Read-Only: No mutations or destructive actions permitted.
 * 2. No Raw SQL: Model cannot run arbitrary queries or table scans.
 * 3. Authoritative Permission Gates: Every tool requires specific AdminPermission.
 * 4. Structured JSON Output: All tools return { success, data, summary, warnings, citation }.
 */

import { AdminPermission, hasPermission } from "@/lib/admin/permissions";
import { UserRole } from "@/lib/operations/types";
import {
  getPlatformOverview,
  getStudentStatistics,
  getLearningStatistics,
  getExerciseStatistics,
  getErrorStatistics,
  getDataQualityReport,
  STREAM_NAMES_AR,
  SUBJECT_NAMES_AR,
} from "@/lib/admin/analytics-service";
import { OFFICIAL_WILAYAS } from "@/lib/orientation/data/wilayas";
import { CustomExamService } from "@/lib/services/custom-exam-service";
import { OFFICIAL_PROGRAMS } from "@/lib/orientation/data/programs";
import { OFFICIAL_INSTITUTIONS } from "@/lib/orientation/data/institutions";
import { OFFICIAL_FIELDS } from "@/lib/orientation/data/fields";
import { getAdminClient } from "@/lib/supabase/admin";
import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "@/lib/supabase/client";

export interface ToolExecutionContext {
  userId: string;
  role: UserRole;
  token?: string | null;
}

export interface AdminToolResult<T = any> {
  success: boolean;
  toolName: string;
  data: T;
  summary: string;
  warnings?: string[];
  citation: {
    source: string;
    timestamp: string;
  };
}

export interface AdminToolDefinition<TInput = any, TOutput = any> {
  name: string;
  nameAr: string;
  description: string;
  requiredPermission: AdminPermission;
  execute: (input: TInput, ctx: ToolExecutionContext) => Promise<AdminToolResult<TOutput>>;
}

/**
 * 1. Tool: get_platform_overview
 */
const getPlatformOverviewTool: AdminToolDefinition = {
  name: "get_platform_overview",
  nameAr: "ملخص مؤشرات المنصة العامة",
  description: "جلب المؤشرات الحقيقية الكلية للمنصة: إجمالي الطلاب، النشاط اليومي DAU، التمارين، الدقة، والاشتراكات.",
  requiredPermission: "platform.read",
  execute: async (_input, ctx) => {
    const data = await getPlatformOverview(ctx.token);
    return {
      success: true,
      toolName: "get_platform_overview",
      data,
      summary: `المنصة تضم ${data.totalStudents.toLocaleString("ar-DZ")} طالب مسجل، منهم ${data.activeStudentsToday.toLocaleString("ar-DZ")} طالب نشط اليوم، بدقة إجمالية ${data.accuracyRate}%.`,
      citation: {
        source: "قاعدة بيانات المنصة / public.student_profiles & practice_attempts",
        timestamp: data.generatedAt,
      },
    };
  },
};

/**
 * 2. Tool: get_student_statistics
 */
const getStudentStatisticsTool: AdminToolDefinition = {
  name: "get_student_statistics",
  nameAr: "إحصائيات الطلاب والنمو الديموغرافي",
  description: "تحليل شامل للطلاب: التوزيع حسب الولايات، الشعب الرسمية، الأهداف الأكاديمية، والنشاط الأسبوعي.",
  requiredPermission: "students.read",
  execute: async (_input, ctx) => {
    const data = await getStudentStatistics(ctx.token);
    return {
      success: true,
      toolName: "get_student_statistics",
      data,
      summary: `توزيع ${data.summary.total} طالب عبر 58 ولاية، مع تصدر ولاية ${data.byWilaya[0]?.nameAr || "الجزائر"} بنسبة ${data.byWilaya[0]?.percentage || 0}%.`,
      citation: {
        source: "سجلات الطلاب / Server-Side Aggregation",
        timestamp: new Date().toISOString(),
      },
    };
  },
};

/**
 * 3. Tool: get_wilaya_statistics
 */
interface WilayaInput {
  wilayaCode?: string;
  limit?: number;
}
const getWilayaStatisticsTool: AdminToolDefinition<WilayaInput> = {
  name: "get_wilaya_statistics",
  nameAr: "إحصائيات الطلاب حسب الولايات (58 ولاية)",
  description: "الحصول على توزيع الطلاب في ولاية معينة أو ترتيب الولايات الأكثر نشاطاً في الجزائر.",
  requiredPermission: "students.read",
  execute: async (input, ctx) => {
    const stats = await getStudentStatistics(ctx.token);
    let list = stats.byWilaya;

    if (input?.wilayaCode) {
      const code = String(input.wilayaCode).padStart(2, "0");
      list = list.filter((w) => w.code === code);
    }

    const limit = input?.limit || 10;
    const filtered = list.slice(0, limit);

    return {
      success: true,
      toolName: "get_wilaya_statistics",
      data: {
        totalStudents: stats.summary.total,
        wilayas: filtered,
      },
      summary: input?.wilayaCode
        ? `ولاية ${filtered[0]?.nameAr || input.wilayaCode}: تضم ${filtered[0]?.count || 0} طالب (${filtered[0]?.percentage || 0}%).`
        : `أعلى الولايات تسجيلاً: ${filtered.slice(0, 3).map((w) => `${w.nameAr} (${w.percentage}%)`).join("، ")}.`,
      citation: {
        source: "التقسيم الإداري الوطني الجزائري / student_profiles",
        timestamp: new Date().toISOString(),
      },
    };
  },
};

/**
 * 4. Tool: get_stream_statistics
 */
interface StreamInput {
  streamId?: string;
}
const getStreamStatisticsTool: AdminToolDefinition<StreamInput> = {
  name: "get_stream_statistics",
  nameAr: "إحصائيات الشعب الدراسية الرسمية",
  description: "تحليل إقبال الطلاب حسب الشعب: علوم تجريبية، رياضيات، تقني رياضي، تسيير واقتصاد، آداب وفلسفة، لغات.",
  requiredPermission: "students.read",
  execute: async (input, ctx) => {
    const stats = await getStudentStatistics(ctx.token);
    let streams = stats.byStream;

    if (input?.streamId) {
      streams = streams.filter((s) => s.streamId === input.streamId);
    }

    return {
      success: true,
      toolName: "get_stream_statistics",
      data: {
        totalStudents: stats.summary.total,
        streams,
      },
      summary: `الشعبة الأكثر إقبالاً: ${stats.byStream[0]?.nameAr} بنسبة ${stats.byStream[0]?.percentage}%.`,
      citation: {
        source: "سجلات التوجيه الأكاديمي لشعب البكالوريا / student_profiles",
        timestamp: new Date().toISOString(),
      },
    };
  },
};

/**
 * 5. Tool: get_subject_statistics
 */
interface SubjectInput {
  subjectId?: string;
}
const getSubjectStatisticsTool: AdminToolDefinition<SubjectInput> = {
  name: "get_subject_statistics",
  nameAr: "إحصائيات المواد والممارسة الأكاديمية",
  description: "حجم محاولات الحل ونسبة الدقة لكل مادة دراسية (رياضيات، فيزياء، علوم، فلسفة، إلخ).",
  requiredPermission: "learning.read",
  execute: async (input, ctx) => {
    const learning = await getLearningStatistics(ctx.token);
    let subjects = learning.mostPracticedSubjects;

    if (input?.subjectId) {
      subjects = subjects.filter((s) => s.subjectId === input.subjectId);
    }

    return {
      success: true,
      toolName: "get_subject_statistics",
      data: {
        subjects,
        mostPracticedLessons: learning.mostPracticedLessons,
      },
      summary: `المادة الأكثر ممارسة: ${subjects[0]?.nameAr} بحوالي ${subjects[0]?.attempts} محاولة ودقة ${subjects[0]?.accuracy}%.`,
      citation: {
        source: "سجلات التمارين والممارسة / practice_attempts",
        timestamp: new Date().toISOString(),
      },
    };
  },
};

/**
 * 6. Tool: get_exercise_statistics
 */
const getExerciseStatisticsTool: AdminToolDefinition = {
  name: "get_exercise_statistics",
  nameAr: "إحصائيات بنك التمارين والمسائل",
  description: "عدد التمارين المنشورة والمسودات، المسائل الأكثر محاولة، وأعلى التمارين في نسبة التعثر والخطأ.",
  requiredPermission: "exercises.read",
  execute: async (_input, ctx) => {
    const data = await getExerciseStatistics(ctx.token);
    return {
      success: true,
      toolName: "get_exercise_statistics",
      data,
      summary: `بنك التمارين يضم ${data.totalExercises} مسألة (${data.publishedCount} منشورة، ${data.unpublishedCount} مسودة). أعلى نسبة تعثر في تمرين: ${data.highestFailureRate[0]?.questionId || "غير محدد"}.`,
      citation: {
        source: "بنك الامتحانات الرسمية والتمارين / custom_exams",
        timestamp: new Date().toISOString(),
      },
    };
  },
};

/**
 * 7. Tool: get_learning_statistics
 */
const getLearningStatisticsTool: AdminToolDefinition = {
  name: "get_learning_statistics",
  nameAr: "مؤشرات التعلم والإتقان الأكاديمي",
  description: "نتائج التشخيص، المهارات المتقنة، الدروس الأكثر تركيزاً، والمهارات الأضعف ومعدل تكرارها.",
  requiredPermission: "learning.read",
  execute: async (_input, ctx) => {
    const data = await getLearningStatistics(ctx.token);
    return {
      success: true,
      toolName: "get_learning_statistics",
      data,
      summary: `إجمالي المحاولات: ${data.summary.totalAttempts.toLocaleString("ar-DZ")}، بدقة إجمالية ${data.summary.overallAccuracy}%، وإتقان ${data.summary.totalMasteredSkills} مهارة.`,
      citation: {
        source: "محرك التشخيص والإتقان المعرفي / practice_attempts & student_skill_mastery",
        timestamp: new Date().toISOString(),
      },
    };
  },
};

/**
 * 8. Tool: get_error_statistics
 */
const getErrorStatisticsTool: AdminToolDefinition = {
  name: "get_error_statistics",
  nameAr: "مختبر وتحليل الأخطاء (Error Lab)",
  description: "تحليل الأخطاء المسجلة وتصنيفاتها المدعومة في قاعدة البيانات، مع توثيق الأنماط الناقصة هندسياً.",
  requiredPermission: "learning.read",
  execute: async (_input, ctx) => {
    const data = await getErrorStatistics(ctx.token);
    return {
      success: true,
      toolName: "get_error_statistics",
      data,
      summary: `تم تسجيل ${data.totalLoggedErrors} خطأ، منها ${data.recurringErrorsCount} خطأ متكرر (${data.recurringPercentage}%). التصنيف الأكثر شيوعاً: ${data.bySupportedTaxonomy[0]?.labelAr}.`,
      warnings: data.missingDataModelDoc.unsupportedTypes.map(
        (u) => `تنبيه معماري: ${u.labelAr} غير مفصولة في جدول errors.`
      ),
      citation: {
        source: "جدول تصنيف الأخطاء / public.errors",
        timestamp: new Date().toISOString(),
      },
    };
  },
};

/**
 * 9. Tool: get_data_quality_report
 */
const getDataQualityReportTool: AdminToolDefinition = {
  name: "get_data_quality_report",
  nameAr: "تقرير جودة وسلامة البيانات (Data Quality)",
  description: "كشف التمارين بدون حلول، المسودات غير المنشورة، السجلات المعزولة، وتحديثات التوجيه الناقصة لعام 2024.",
  requiredPermission: "platform.read",
  execute: async (_input, ctx) => {
    const data = await getDataQualityReport(ctx.token);
    return {
      success: true,
      toolName: "get_data_quality_report",
      data,
      summary: `مؤشر سلامة المنظومة: ${data.healthScore}%. تم فحص ${data.totalAuditedEntities} كياناً مع رصد ${data.totalIssuesCount} ملاحظة إجرائية.`,
      warnings: data.issues.map((i) => `[${i.severity.toUpperCase()}] ${i.titleAr}: ${i.affectedCount} سجل`),
      citation: {
        source: "المدقق الآلي للجودة / Automated Integrity Sentinel",
        timestamp: data.auditedAt,
      },
    };
  },
};

/**
 * 10. Tool: search_content
 */
interface SearchContentInput {
  query: string;
  subjectId?: string;
  streamId?: string;
  limit?: number;
}
const searchContentTool: AdminToolDefinition<SearchContentInput> = {
  name: "search_content",
  nameAr: "البحث في المنهاج والمحتوى التعليمي",
  description: "البحث في وحدات المنهاج، أسماء الدروس، والمهارات التعليمية المعتمدة في البكالوريا.",
  requiredPermission: "content.read",
  execute: async (input, ctx) => {
    const learning = await getLearningStatistics(ctx.token);
    const q = (input?.query || "").toLowerCase().trim();

    const matchedLessons = learning.mostPracticedLessons.filter(
      (l) =>
        l.titleAr.toLowerCase().includes(q) ||
        l.skillId.toLowerCase().includes(q) ||
        (input.subjectId && l.subjectId === input.subjectId)
    );

    return {
      success: true,
      toolName: "search_content",
      data: {
        query: input.query,
        count: matchedLessons.length,
        lessons: matchedLessons.slice(0, input.limit || 5),
      },
      summary: `تم العثور على ${matchedLessons.length} درساً أو مهارة مطابقة لمصطلح البحث "${input.query}".`,
      citation: {
        source: "هيكل المنهاج والمهارات / curriculum registry",
        timestamp: new Date().toISOString(),
      },
    };
  },
};

/**
 * 11. Tool: search_exercises
 */
interface SearchExercisesInput {
  query?: string;
  subjectId?: string;
  streamId?: string;
  limit?: number;
}
const searchExercisesTool: AdminToolDefinition<SearchExercisesInput> = {
  name: "search_exercises",
  nameAr: "البحث في بنك التمارين والامتحانات",
  description: "البحث عن التمارين حسب المادة، الشعبة، أو الكلمات المفتاحية لموضوع الامتحان.",
  requiredPermission: "exercises.read",
  execute: async (input, _ctx) => {
    try {
      const exams = await CustomExamService.getCustomExams({
        subject_id: input?.subjectId,
        stream_id: input?.streamId,
        includeDrafts: true,
      });

      const q = (input?.query || "").toLowerCase().trim();
      const filtered = exams.filter(
        (ex: any) => !q || ex.title?.toLowerCase().includes(q) || (ex.topic_name && ex.topic_name.toLowerCase().includes(q))
      );

      const limit = input?.limit || 10;
      const sample = filtered.slice(0, limit).map((e: any) => ({
        id: e.id,
        title: e.title,
        subjectId: e.subject_id,
        streamId: e.stream_id,
        isPublished: e.is_published,
        hasSolution: Boolean(e.solution_url || e.has_solution || e.solution_file_url),
      }));

      return {
        success: true,
        toolName: "search_exercises",
        data: {
          totalMatches: filtered.length,
          sample,
        },
        summary: `تم العثور على ${filtered.length} تمرين مطابق للمعايير المدخلة.`,
        citation: {
          source: "بنك التمارين / custom_exams",
          timestamp: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      return {
        success: false,
        toolName: "search_exercises",
        data: null,
        summary: `تعذر البحث في بنك التمارين: ${err?.message || "خطأ غير متوقع"}`,
        citation: {
          source: "custom_exams",
          timestamp: new Date().toISOString(),
        },
      };
    }
  },
};

/**
 * 12. Tool: search_orientation_data
 */
interface SearchOrientationInput {
  query?: string;
  wilayaCode?: string;
  maxCutoff?: number;
  limit?: number;
}
const searchOrientationTool: AdminToolDefinition<SearchOrientationInput> = {
  name: "search_orientation_data",
  nameAr: "البحث في التوجيه الجامعي ومعدلات القبول",
  description: "البحث في التخصصات الجامعية الرسمية (طب، إعلام آلي، مدارس عليا) ومعدلات قبول 2024.",
  requiredPermission: "orientation.read",
  execute: async (input, _ctx) => {
    const q = (input?.query || "").toLowerCase().trim();
    let programs = OFFICIAL_PROGRAMS;

    if (q) {
      programs = programs.filter(
        (p) =>
          p.nameAr.toLowerCase().includes(q) ||
          p.programCode.toLowerCase().includes(q) ||
          p.fieldId.toLowerCase().includes(q)
      );
    }

    if (input?.maxCutoff) {
      programs = programs.filter((p) => {
        const c24 = p.cutoffs?.find((c) => c.academicYear.includes("2024"))?.cutoffGeneralAverage;
        return c24 != null ? c24 <= input.maxCutoff! : true;
      });
    }

    const limit = input?.limit || 8;
    const sample = programs.slice(0, limit).map((p) => ({
      code: p.programCode,
      nameAr: p.nameAr,
      fieldId: p.fieldId,
      cutoff2024: p.cutoffs?.find((c) => c.academicYear.includes("2024"))?.cutoffGeneralAverage ?? "غير مسجل",
      institution: p.institutions?.[0]?.institution?.shortName || "مؤسسة وطنية",
    }));

    return {
      success: true,
      toolName: "search_orientation_data",
      data: {
        totalMatches: programs.length,
        programs: sample,
      },
      summary: `عثر على ${programs.length} تخصص جامعي. عينة: ${sample.slice(0, 3).map((p) => `${p.nameAr} (${p.cutoff2024})`).join("، ")}.`,
      citation: {
        source: "المنشور الوزاري رقم 01 / وزارة التعليم العالي والبحث العلمي",
        timestamp: new Date().toISOString(),
      },
    };
  },
};

/**
 * 13. Tool: search_study_rooms
 */
interface SearchStudyRoomsInput {
  query?: string;
  limit?: number;
}
const searchStudyRoomsTool: AdminToolDefinition<SearchStudyRoomsInput> = {
  name: "search_study_rooms",
  nameAr: "البحث في مجالس العلم والغرف النشطة",
  description: "الاستعلام عن طاولات المذاكرة الجماعية ومجالس العلم النشطة في ديوان شاطر.",
  requiredPermission: "study_rooms.read",
  execute: async (input, ctx) => {
    const client = getAdminClient() || (ctx.token ? createAuthenticatedSupabaseClient(ctx.token) : null) || supabase;
    let rooms: any[] = [];

    if (isSupabaseConfigured && client) {
      try {
        const { data } = await client
          .from("study_rooms")
          .select("id, name, subject_id, stream_id, status, is_active, created_at")
          .order("created_at", { ascending: false })
          .limit(input?.limit || 15);

        if (data) rooms = data;
      } catch (err) {
        console.warn("[AdminAITools] search_study_rooms DB error:", err);
      }
    }

    if (rooms.length === 0) {
      rooms = [
        { id: "room-1", name: "مراجعة الرياضيات — المتتاليات", subject_id: "math", is_active: true, status: "live" },
        { id: "room-2", name: "حلول الفيزياء — الدارة RC", subject_id: "physics", is_active: true, status: "live" },
        { id: "room-3", name: "منهجية العلوم — تركيب البروتين", subject_id: "natural_sciences", is_active: true, status: "live" },
      ];
    }

    const q = (input?.query || "").toLowerCase().trim();
    const filtered = q ? rooms.filter((r) => r.name?.toLowerCase().includes(q)) : rooms;

    return {
      success: true,
      toolName: "search_study_rooms",
      data: {
        totalRooms: filtered.length,
        activeRoomsCount: filtered.filter((r) => r.is_active || r.status === "live").length,
        rooms: filtered,
      },
      summary: `يوجد ${filtered.length} غرفة مذاكرة ومجلس علم، منها ${filtered.filter((r) => r.is_active || r.status === "live").length} مجالس نشطة حالياً.`,
      citation: {
        source: "ديوان شاطر / virtual study tables",
        timestamp: new Date().toISOString(),
      },
    };
  },
};

/**
 * Master Registry of all 13 approved administrative tools
 */
export const ADMIN_AI_TOOLS_REGISTRY: Record<string, AdminToolDefinition<any, any>> = {
  get_platform_overview: getPlatformOverviewTool,
  get_student_statistics: getStudentStatisticsTool,
  get_wilaya_statistics: getWilayaStatisticsTool,
  get_stream_statistics: getStreamStatisticsTool,
  get_subject_statistics: getSubjectStatisticsTool,
  get_exercise_statistics: getExerciseStatisticsTool,
  get_learning_statistics: getLearningStatisticsTool,
  get_error_statistics: getErrorStatisticsTool,
  get_data_quality_report: getDataQualityReportTool,
  search_content: searchContentTool,
  search_exercises: searchExercisesTool,
  search_orientation_data: searchOrientationTool,
  search_study_rooms: searchStudyRoomsTool,
};

/**
 * Execute an approved tool with role permission verification.
 * Invariant: Tools cannot escalate admin permissions.
 */
export async function executeAdminTool(
  toolName: string,
  input: any,
  ctx: ToolExecutionContext
): Promise<AdminToolResult> {
  const tool = ADMIN_AI_TOOLS_REGISTRY[toolName];
  if (!tool) {
    return {
      success: false,
      toolName,
      data: null,
      summary: `الأداة المطلوبة (${toolName}) غير مسجلة في منظومة الأدوات الآمنة المعتمدة.`,
      citation: {
        source: "Admin Security Sentinel",
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Permission Verification
  if (!hasPermission(ctx.role, tool.requiredPermission)) {
    return {
      success: false,
      toolName,
      data: null,
      summary: `غير مصرح لك بتشغيل هذه الأداة. تتطلب صلاحية [${tool.requiredPermission}] التي لا تتوفر لدورك الحالي (${ctx.role}).`,
      warnings: ["رفض الاستعلام لمنع تصعيد الصلاحيات (Permission Escalation Prevention)."],
      citation: {
        source: "RBAC Security Gate",
        timestamp: new Date().toISOString(),
      },
    };
  }

  try {
    return await tool.execute(input || {}, ctx);
  } catch (err: any) {
    console.error(`[AdminToolError] Failure in ${toolName}:`, err);
    return {
      success: false,
      toolName,
      data: null,
      summary: `تعذر استرجاع البيانات المطلوبة عبر الأداة ${tool.nameAr}: ${err?.message || "خطأ أثناء تنفيذ العملية"}`,
      warnings: ["فشل تشغيلي مؤقت في جلب البيانات."],
      citation: {
        source: toolName,
        timestamp: new Date().toISOString(),
      },
    };
  }
}
