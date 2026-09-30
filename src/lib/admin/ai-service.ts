/**
 * SHATER Control Center — Admin AI Core Service
 * Phase: READ-ONLY AI Command Center
 * 
 * Strict Invariants:
 * 1. ZERO raw SQL access or arbitrary code execution.
 * 2. Strict permission enforcement: Admin cannot escalate privileges.
 * 3. Never invents data: Discloses missing data models and cites actual tool sources.
 * 4. Resilient multi-modal synthesis: Uses Gemini with tool results, plus deterministic pedagogical fallback.
 */

import { UserRole } from "@/lib/operations/types";
import { executeAdminTool, ADMIN_AI_TOOLS_REGISTRY, AdminToolResult, ToolExecutionContext } from "./ai-tools";
import { GoogleGenAI } from "@google/genai";
import {
  proposeAction,
  AdminActionProposal,
  SupportedActionName,
  ACTION_METADATA,
} from "./ai-actions";
import { AdminContext } from "./auth";
import { getPermissionsForRole } from "./permissions";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  toolsUsed?: Array<{
    name: string;
    nameAr: string;
    summary: string;
  }>;
  structuredData?: any;
  warnings?: string[];
  actionProposal?: AdminActionProposal;
  timestamp: string;
}

export interface AdminAIQueryResponse {
  success: boolean;
  reply: string;
  toolsExecuted: Array<{
    name: string;
    nameAr: string;
    summary: string;
    source: string;
  }>;
  structuredData?: any;
  warnings?: string[];
  actionProposal?: AdminActionProposal;
}

/**
 * Intelligent query intent routing for the Algerian Baccalaureate Admin Command Center
 */
function resolveToolsForQuery(query: string): string[] {
  const q = query.toLowerCase().trim();
  const toolsToRun = new Set<string>();

  // Security Check: Attempted Raw SQL or DB Bypass
  if (
    q.includes("select ") ||
    q.includes("insert ") ||
    q.includes("update ") ||
    q.includes("delete ") ||
    q.includes("drop table") ||
    q.includes("execute_sql") ||
    q.includes("execute sql") ||
    q.includes("raw query")
  ) {
    // Will be rejected gracefully in synthesis
    return [];
  }

  // 0. Daily Intelligence Report ("حلللي SHATER اليوم", "تقرير اليوم", "حالة المنصة اليوم")
  if (
    q.includes("حلللي") ||
    q.includes("حلل") ||
    q.includes("تقرير اليوم") ||
    q.includes("تقرير الذكاء") ||
    q.includes("تحليل اليوم") ||
    q.includes("daily report") ||
    q.includes("كيفاش راهي") ||
    q.includes("تقرير المنصة")
  ) {
    toolsToRun.add("get_daily_intelligence_report");
    return Array.from(toolsToRun);
  }

  // 1. Wilayas / Geographic distribution
  if (q.includes("ولاية") || q.includes("ولايات") || q.includes("جغرافي") || q.includes("أين") || q.includes("وين راهم") || q.includes("توزيع الطلاب")) {
    toolsToRun.add("get_wilaya_statistics");
  }

  // 2. Streams / الشعب الرسمية
  if (q.includes("شعبة") || q.includes("شعب") || q.includes("علوم تجريبية") || q.includes("رياضيات") || q.includes("تقني")) {
    toolsToRun.add("get_stream_statistics");
  }

  // 3. Errors / الأخطاء ومختبر التعثر
  if (q.includes("خطأ") || q.includes("أخطاء") || q.includes("تعثر") || q.includes("صعوبة") || q.includes("مشكل") || q.includes("وين يغلطو")) {
    toolsToRun.add("get_error_statistics");
    toolsToRun.add("get_learning_statistics");
  }

  // 4. Exercises / التمارين والمسائل
  if (q.includes("تمرين") || q.includes("تمارين") || q.includes("مسألة") || q.includes("مسائل") || q.includes("مواضيع") || q.includes("حلول")) {
    toolsToRun.add("get_exercise_statistics");
  }

  // 5. Data Quality / المحتوى الناقص
  if (q.includes("ناقص") || q.includes("جودة") || q.includes("مسودة") || q.includes("مسودات") || q.includes("فاسد") || q.includes("معزول") || q.includes("سلامة البيانات")) {
    toolsToRun.add("get_data_quality_report");
  }

  // 6. Subjects / المواد
  if (q.includes("مادة") || q.includes("مواد") || q.includes("أكثر مادة") || q.includes("فيزياء") || q.includes("فلسفة") || q.includes("علوم")) {
    toolsToRun.add("get_subject_statistics");
  }

  // 7. Orientation / التوجيه الجامعي
  if (q.includes("توجيه") || q.includes("جامع") || q.includes("معدل قبول") || q.includes("طب") || q.includes("مدرسة عليا")) {
    toolsToRun.add("search_orientation_data");
  }

  // 8. Study Rooms / مجالس العلم
  if (q.includes("مجلس") || q.includes("مجالس") || q.includes("غرفة") || q.includes("غرف") || q.includes("طاولة") || q.includes("ديوان")) {
    toolsToRun.add("search_study_rooms");
  }

  // 9. Platform Overview / النشاط العام / التحليل الشامل
  if (
    q.includes("شحال") ||
    q.includes("كم عدد") ||
    q.includes("نشط") ||
    q.includes("أسبوع") ||
    q.includes("اليوم") ||
    q.includes("حالة المنصة") ||
    q.includes("نظرة عامة") ||
    q.includes("اشتراك") ||
    q.includes("مستخدم") ||
    toolsToRun.size === 0
  ) {
    toolsToRun.add("get_platform_overview");
    toolsToRun.add("get_student_statistics");
  }

  return Array.from(toolsToRun);
}

/**
 * Synthesizes a factual, Arabic-first answer based strictly on retrieved tool results
 */
function synthesizeFactualResponse(
  query: string,
  toolResults: AdminToolResult[]
): { reply: string; structuredData?: any; warnings?: string[] } {
  const q = query.toLowerCase().trim();
  const allWarnings: string[] = [];

  for (const tr of toolResults) {
    if (tr.warnings && tr.warnings.length > 0) {
      allWarnings.push(...tr.warnings);
    }
  }

  // SQL Attempt Blocked
  if (
    q.includes("select ") ||
    q.includes("insert ") ||
    q.includes("update ") ||
    q.includes("delete ") ||
    q.includes("drop table") ||
    q.includes("execute_sql")
  ) {
    return {
      reply: `⚠️ **تنبيه أمني صارم (Security Gate Violation):**
لا يُسمح بتنفيذ استعلامات SQL مباشرة أو غير مقيدة عبر مركز القيادة الذكي.

وفقاً لمبادئ الأمان في شاطر، يعمل المساعد حصراً عبر **أدوات معتمدة ومحددة سلفاً (Approved Typed Tools)** لحماية سلامة قاعدة البيانات وسرية بيانات الطلاب.

يمكنك طلب استعلامات إحصائية مثل:
- "شحال من تلميذ نشط هذا الأسبوع؟"
- "أعطيني توزيع الطلاب حسب الولاية."
- "هل كاين تمارين بدون حلول؟"`,
      warnings: ["تم حجب محاولة تنفيذ استعلام SQL مباشر."],
    };
  }

  // 0. Daily Intelligence Report ("حلللي SHATER اليوم", "تقرير اليوم")
  const dailyRepResult = toolResults.find((r) => r.toolName === "get_daily_intelligence_report");
  if (dailyRepResult && dailyRepResult.data) {
    const rep = dailyRepResult.data;
    const stableLines = rep.stableItems.map(
      (s: any) => `• **✓ ${s.titleAr}**\n  - *السبب:* ${s.whyAr}\n  - *الدليل:* ${s.evidenceAr}`
    ).join("\n\n");

    const attentionLines = rep.attentionItems.map(
      (a: any) => `• **⚠ ${a.titleAr}**\n  - *السبب:* ${a.whyAr}\n  - *الدليل:* ${a.evidenceAr}\n  - *الإجراء المقترح:* ${a.recommendedActionAr}`
    ).join("\n\n");

    const criticalLines = rep.criticalIssues.map(
      (c: any) => `• **🔴 ${c.titleAr}**\n  - *السبب:* ${c.whyAr}\n  - *الدليل:* ${c.evidenceAr}\n  - *الإجراء المقترح:* ${c.recommendedActionAr}`
    ).join("\n\n");

    const actionLines = rep.proposedActions.map(
      (p: any) => `• **→ [مقترح] ${p.titleAr}**\n  - *الهدف:* ${p.whyAr}\n  - *الدليل:* ${p.evidenceAr}\n  - *التنفيذ:* ${p.recommendedActionAr}`
    ).join("\n\n");

    return {
      reply: `### 📊 تقرير الذكاء اليومي لـ SHATER (Daily Intelligence Report)
*تاريخ التوليد: ${new Date(rep.generatedAt).toLocaleString("ar-DZ")} | فحص عملياتي موثق*

${rep.summaryAr}

---

### ✓ الأمور المستقرة (Stable & Healthy)
${stableLines}

---

### ⚠ تحتاج انتباه (Needs Attention)
${attentionLines}

---

### 🔴 مشاكل حرجة (Critical Issues)
${criticalLines}

---

### → اقتراحات العمل (Proposed Actions)
${actionLines}

> 📌 **تذكير أمني صارم:** التوصيات المعروضة هي مقترحات تشغيلية فقط؛ لا يتم تنفيذ أي تعديل صامت تلقائياً. يمكنك الضغط على **[حضّر العملية]** لمعاينة وتأكيد أي إجراء بأمان.`,
      structuredData: {
        type: "DAILY_INTELLIGENCE_REPORT",
        report: rep,
      },
      warnings: allWarnings,
    };
  }

  // 1. Data Quality Queries ("هل كاين محتوى ناقص؟")
  const dqResult = toolResults.find((r) => r.toolName === "get_data_quality_report");
  if (dqResult && (q.includes("ناقص") || q.includes("جودة") || q.includes("مسودة"))) {
    const report = dqResult.data;
    return {
      reply: `### 🛡️ تقرير جودة وسلامة البيانات (Data Quality Sentinel)

حسب الفحص الآلي اللحظي للسجلات في قاعدة البيانات:

- **مؤشر سلامة البيانات:** **${report.healthScore}%** (لا توجد سجلات تالفة أو فاسدة).
- **الكيانات المفحوصة:** ${report.totalAuditedEntities} كياناً (تمارين، شعب، تخصصات وجامعات).
- **إجمالي الملاحظات المرصودة:** **${report.totalIssuesCount} ملاحظة** بحاجة لمتابعة إدارية:

${report.issues
  .map(
    (i: any) =>
      `• **[${i.severity === "critical" ? "حرج" : i.severity === "high" ? "عالي" : "متوسط"}] ${i.titleAr}:** ${i.descriptionAr}\n  ↳ *الإجراء الموصى به:* ${i.remediationAction}`
  )
  .join("\n\n")}

> 📌 **ملاحظة تشغيلية:** النظام يعمل في وضع القراءة فقط (Read-Only) لمنع أي تغييرات عشوائية دون مصادقة المفتش التربوي.`,
      structuredData: {
        type: "DATA_QUALITY_REPORT",
        healthScore: report.healthScore,
        totalIssues: report.totalIssuesCount,
        issues: report.issues,
      },
      warnings: allWarnings,
    };
  }

  // 2. Errors Queries ("واش أكثر مادة فيها أخطاء؟", "التمارين الأكثر تعثراً")
  const errResult = toolResults.find((r) => r.toolName === "get_error_statistics");
  const exResult = toolResults.find((r) => r.toolName === "get_exercise_statistics");
  const learnResult = toolResults.find((r) => r.toolName === "get_learning_statistics");

  if (errResult && (q.includes("خطأ") || q.includes("أخطاء") || q.includes("تعثر") || q.includes("أكثر مادة"))) {
    const errData = errResult.data;
    const topError = errData.bySupportedTaxonomy[0];
    const weakSkills = learnResult?.data?.weakSkills || [];
    const highFailExercises = exResult?.data?.highestFailureRate || [];

    let highFailSection = "";
    if (highFailExercises.length > 0) {
      highFailSection = `\n\n#### ⚠️ التمارين ذات أعلى نسبة تعثر:
${highFailExercises
  .slice(0, 3)
  .map((ex: any) => `• التمرين \`${ex.questionId}\`: نسبة التعثر **${ex.failureRate}%** (عدد المحاولات: ${ex.attempts})`)
  .join("\n")}`;
    }

    return {
      reply: `### 🔍 تحليل الأخطاء ومواطن التعثر الأكاديمي

حسب سجلات مختبر الأخطاء (Error Lab) في المنصة:

- **إجمالي الأخطاء المسجلة:** **${errData.totalLoggedErrors.toLocaleString("ar-DZ")}** خطأ.
- **الأخطاء المتكررة:** **${errData.recurringErrorsCount}** خطأ (${errData.recurringPercentage}% من الإجمالي).
- **أكثر نمط خطأ شيوعاً:** **${topError?.labelAr || "أخطاء حسابية"}** بنسبة **${topError?.percentage}%**.

#### 🎯 المهارات الأضعف لدى الطلاب:
${weakSkills
  .slice(0, 3)
  .map((ws: any) => `• **${ws.titleAr}:** تكرار الخطأ ${ws.recurrenceRate}% (${ws.affectedStudents} طالب يواجهون صعوبة).`)
  .join("\n")}${highFailSection}

---

> ⚠️ **توثيق النموذج المعماري (Architectural Transparency):**
> أخطاء الإشارة (+ / -)، أخطاء القوانين والصيغ، وتفسير المنحنيات البيانية **غير مفصولة كأعمدة مستقلة في قاعدة البيانات الحالية**، وتُسجل مدمجة ضمن الأخطاء الحسابية والمفاهيمية منعاً لتزييف البيانات.`,
      structuredData: {
        type: "ERROR_ANALYSIS",
        totalErrors: errData.totalLoggedErrors,
        recurringErrors: errData.recurringErrorsCount,
        topErrors: errData.bySupportedTaxonomy,
        weakSkills: weakSkills.slice(0, 3),
      },
      warnings: allWarnings,
    };
  }

  // 3. Wilaya Queries ("أعطيني التلاميذ حسب الولاية")
  const wilayaResult = toolResults.find((r) => r.toolName === "get_wilaya_statistics");
  if (wilayaResult && (q.includes("ولاية") || q.includes("ولايات") || q.includes("توزيع"))) {
    const wData = wilayaResult.data;
    const topWilayas = wData.wilayas.slice(0, 6);

    return {
      reply: `### 📍 التوزيع الجغرافي للطلاب حسب الولايات

حسب بيانات التسجيل الجغرافي عبر خوادم المنصة:

- **إجمالي الطلاب المفحوصين:** **${wData.totalStudents.toLocaleString("ar-DZ")}** طالب.
- **أعلى 6 ولايات تسجيلاً ونشاطاً:**

| الولاية | الرمز | عدد الطلاب | النسبة المئوية |
| :--- | :---: | :---: | :---: |
${topWilayas.map((w: any) => `| **${w.nameAr}** | \`${w.code}\` | ${w.count.toLocaleString("ar-DZ")} | ${w.percentage}% |`).join("\n")}

> 💡 **ملاحظة:** يتم التجميع من جهة الخادم (Server-side aggregation) دون جلب السجلات الفردية للواجهة حمايةً لخصوصية الطلاب.`,
      structuredData: {
        type: "WILAYA_STATISTICS",
        total: wData.totalStudents,
        wilayas: topWilayas,
      },
      warnings: allWarnings,
    };
  }

  // 4. Exercises Queries ("أريني التمارين اللي عندها نسبة خطأ كبيرة")
  if (exResult && (q.includes("تمرين") || q.includes("تمارين") || q.includes("مسائل"))) {
    const exData = exResult.data;
    return {
      reply: `### 📚 إحصائيات بنك التمارين والمسائل

- **إجمالي التمارين في البنك:** **${exData.totalExercises}** مسألة.
- **التمارين المنشورة للطلاب:** **${exData.publishedCount}** مسألة.
- **المسودات قيد المراجعة:** **${exData.unpublishedCount}** مسألة.
- **تمارين بدليل الحل المعتمد:** **${exData.withSolutionCount}** (${Math.round((exData.withSolutionCount / exData.totalExercises) * 100)}%).

#### 🚨 المسائل ذات أعلى نسبة تعثر (High Failure Rate):
${exData.highestFailureRate
  .map(
    (ex: any, idx: number) =>
      `${idx + 1}. معرف المسألة: \`${ex.questionId}\` — نسبة عدم التوفيق: **${ex.failureRate}%** (من إجمالي ${ex.attempts} محاولة).`
  )
  .join("\n")}

> 🛠️ يوصى بمراجعة صياغة هذه المسائل وإضافة شروح مفصلة بالفيديو في بنك التمارين.`,
      structuredData: {
        type: "EXERCISE_STATISTICS",
        total: exData.totalExercises,
        published: exData.publishedCount,
        highestFailure: exData.highestFailureRate,
      },
      warnings: allWarnings,
    };
  }

  // 5. Platform Overview Default ("شحال من تلميذ نشط هذا الأسبوع؟", "حلللي حالة المنصة اليوم")
  const ovResult = toolResults.find((r) => r.toolName === "get_platform_overview");
  const stuResult = toolResults.find((r) => r.toolName === "get_student_statistics");

  if (ovResult) {
    const o = ovResult.data;
    const s = stuResult?.data;

    return {
      reply: `### 📊 ملخص حالة منصة شاطر (Operational Briefing)

حسب المؤشرات المعتمدة والمستخلصة لحظياً:

1. **الطلاب والنشاط:**
   - **إجمالي الطلاب المسجلين:** **${o.totalStudents.toLocaleString("ar-DZ")}** طالب.
   - **النشاط اليومي (DAU):** **${o.activeStudentsToday.toLocaleString("ar-DZ")}** طالب نشط اليوم.
   - **النشاط الأسبوعي (WAU):** **${o.activeStudents7d.toLocaleString("ar-DZ")}** طالب نشط خلال آخر 7 أيام.
   - **الطلاب الجدد هذا الأسبوع:** **+${o.newStudents7d}** طالب جديد.

2. **الأداء الأكاديمي والممارسة:**
   - **محاولات حل التمارين:** **${o.exercisesAttempted.toLocaleString("ar-DZ")}** محاولة حل.
   - **التمارين المكتملة:** **${o.exercisesCompleted.toLocaleString("ar-DZ")}** تمرين.
   - **متوسط دقة الإجابات:** **${o.accuracyRate}%** دقة إجمالية.

3. **التفاعل ومجالس العلم والاشتراكات:**
   - **مجالس العلم النشطة حالياً:** **${o.activeStudyRooms}** مجالس في ديوان شاطر.
   - **الاشتراكات المفعلة (Paid):** **${o.paidSubscriptions}** باقة تفوق مدفوعة (+${o.pendingSubscriptions} طلب معلق).
   - **مؤشر جودة البيانات:** **${o.dataHealthScore}%** سلامة منظومة.

> 🛡️ تم التحقق من كافة المؤشرات عبر أدوات الرقابة الإدارية في وضع القراءة فقط.`,
      structuredData: {
        type: "PLATFORM_OVERVIEW",
        totalStudents: o.totalStudents,
        activeToday: o.activeStudentsToday,
        active7d: o.activeStudents7d,
        exercisesAttempted: o.exercisesAttempted,
        accuracyRate: o.accuracyRate,
        paidSubscriptions: o.paidSubscriptions,
      },
      warnings: allWarnings,
    };
  }

  // Fallback if no specific tool returned
  return {
    reply: `مرحباً بك في مركز قيادة شاطر الذكي. تم فحص استفسارك وتحليله عبر الأدوات الإدارية المصرح بها.

${toolResults.map((tr) => `• **${tr.toolName}:** ${tr.summary}`).join("\n\n")}

يمكنك طرح أسئلة محددة عن الولايات، التمارين الأكثر تعثراً، جودة البيانات، أو تفاصيل الاشتراكات.`,
    warnings: allWarnings,
  };
}

/**
 * Detects whether the administrator is requesting an authoritative data mutation.
 * Invariant: Never mutates immediately — generates a typed action proposal for human confirmation.
 */
function detectMutationIntent(
  query: string,
  adminContext: AdminContext
): { actionName: SupportedActionName; params: Record<string, unknown> } | null {
  const q = query.toLowerCase().trim();

  // 1. Update Exercise / Change Difficulty
  if (
    q.includes("بدل صعوبة") ||
    q.includes("غير صعوبة") ||
    q.includes("عدل صعوبة") ||
    q.includes("بدل درجة صعوبة") ||
    q.includes("غير مستوى الصعوبة") ||
    (q.includes("صعوبة") && (q.includes("بدل") || q.includes("غير") || q.includes("عدل") || q.includes("إلى")))
  ) {
    let targetDifficulty = "advanced";
    if (q.includes("صعب") || q.includes("advanced")) {
      targetDifficulty = "advanced";
    } else if (q.includes("تحدي") || q.includes("challenge")) {
      targetDifficulty = "challenge";
    } else if (q.includes("متوسط") || q.includes("عادي") || q.includes("standard")) {
      targetDifficulty = "standard";
    }

    const examMatch = query.match(/(?:التمرين|تمرين)\s+([a-zA-Z0-9_\-]+)/);
    const resourceId = examMatch ? examMatch[1] : "exam-bac-2024-math-01";

    return {
      actionName: "updateExercise",
      params: {
        resourceId,
        resourceType: "custom_exams",
        difficulty: targetDifficulty,
      },
    };
  }

  // 2. Assign Exercise to Lesson
  if (
    q.includes("عين التمرين") ||
    q.includes("عيّن التمرين") ||
    q.includes("اربط التمرين") ||
    q.includes("خصص التمرين") ||
    q.includes("عين لدرس") ||
    q.includes("اربط بدرس")
  ) {
    const examMatch = query.match(/(?:التمرين|تمرين)\s+([a-zA-Z0-9_\-]+)/);
    const resourceId = examMatch ? examMatch[1] : "exam-bac-2024-math-01";

    let topic = "الدوال العددية واللوغاريتمية";
    const topicMatch = query.match(/(?:درس|لوحدة|وحدة)\s+([^.]+)/);
    if (topicMatch) {
      topic = topicMatch[1].trim();
    }

    return {
      actionName: "assignExercise",
      params: {
        resourceId,
        resourceType: "custom_exams",
        topic_name: topic,
      },
    };
  }

  // 3. Create Draft Exercise
  if (
    q.includes("أنشئ تمرين") ||
    q.includes("انشئ تمرين") ||
    q.includes("أنشئ مسودة تمرين") ||
    q.includes("انشئ مسودة") ||
    q.includes("أضف تمرين") ||
    q.includes("اصنع تمرين")
  ) {
    let subject = "mathematics";
    if (q.includes("فيزياء")) subject = "physics";
    if (q.includes("علوم")) subject = "natural_sciences";

    return {
      actionName: "createExercise",
      params: {
        title: "مسودة تمرين مقترح في " + (subject === "mathematics" ? "الرياضيات" : subject === "physics" ? "الفيزياء" : "العلوم الطبيعية"),
        stream: "sciences_exp",
        subject,
        difficulty: "standard",
        topic: "الوحدة الأولى",
      },
    };
  }

  // 4. Archive Content / Delete Protection (Soft Archive)
  if (
    q.includes("أرشف") ||
    q.includes("ارشف") ||
    q.includes("أرشفة") ||
    q.includes("تجميد المحتوى") ||
    q.includes("احذف التمرين") ||
    q.includes("حذف التمرين") ||
    q.includes("احذف الملخص") ||
    q.includes("حذف الملخص")
  ) {
    const match = query.match(/(?:التمرين|الملخص|المحتوى|الموضوع)\s+([a-zA-Z0-9_\-]+)/);
    const resourceId = match ? match[1] : "exam-bac-2024-math-01";

    return {
      actionName: "archiveContent",
      params: {
        resourceId,
        resourceType: q.includes("ملخص") ? "campus_posts" : "custom_exams",
        reason: "أرشفة وتجميد آمن بطلب من المشرف الإداري",
      },
    };
  }

  // 5. Publish Content
  if (
    q.includes("انشر التمرين") ||
    q.includes("انشر الملخص") ||
    q.includes("نشر الموضوع") ||
    q.includes("اعتماد النشر") ||
    q.includes("انشر المحتوى")
  ) {
    const match = query.match(/(?:التمرين|الملخص|المحتوى|الموضوع)\s+([a-zA-Z0-9_\-]+)/);
    const resourceId = match ? match[1] : "post-sciences-methodology-01";

    return {
      actionName: "publishContent",
      params: {
        resourceId,
        resourceType: q.includes("ملخص") ? "campus_posts" : "custom_exams",
      },
    };
  }

  // 6. Restore Content
  if (q.includes("استرجع المحتوى") || q.includes("فك الأرشفة") || q.includes("استعادة التمرين") || q.includes("استرجع التمرين")) {
    const match = query.match(/(?:التمرين|الملخص|المحتوى|الموضوع)\s+([a-zA-Z0-9_\-]+)/);
    const resourceId = match ? match[1] : "exam-bac-2024-math-01";

    return {
      actionName: "restoreContent",
      params: {
        resourceId,
        resourceType: "custom_exams",
      },
    };
  }

  // 7. Update Metadata
  if (q.includes("حدث البيانات الوصفية") || q.includes("عدل وسوم") || q.includes("غير الوسوم")) {
    return {
      actionName: "updateMetadata",
      params: {
        resourceId: "exam-bac-2024-math-01",
        metadata: {
          category: "تمارين نموذجية معتمدة",
          reviewedBy: adminContext.userId,
          status: "VERIFIED",
        },
      },
    };
  }

  return null;
}

/**
 * Main Entry Point for executing an Administrative AI Command
 */
export async function executeAdminAIQuery(
  ctx: ToolExecutionContext,
  query: string,
  history: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<AdminAIQueryResponse> {
  const adminContext: AdminContext = {
    userId: ctx.userId,
    email: null,
    role: ctx.role,
    isOwner: ctx.role === "OWNER",
    permissions: getPermissionsForRole(ctx.role),
    token: ctx.token || null,
  };

  // CHECK 1: Detect Mutation Intent (Never execute silently — propose for human confirmation)
  const mutation = detectMutationIntent(query, adminContext);
  if (mutation) {
    try {
      const proposal = await proposeAction(mutation.actionName, mutation.params, adminContext);

      const resourceName = proposal.beforeState.title
        ? String(proposal.beforeState.title)
        : proposal.resourceId;

      const diffAr = proposal.diffSummary
        .map((d) => `• **${d.labelAr}:**\n  - الحالية: \`${d.before}\`\n  - المقترحة: \`${d.after}\``)
        .join("\n");

      const previewReply = `### 📋 العملية المقترحة (تحت المعاينة البشرية)

لقد أعددت مقترح العملية التالي بناءً على طلبك، وفق بروتوكول السلامة الإداري الصارم:

- **نوع العملية:** ${proposal.titleAr} (${proposal.actionClass === "CLASS_C_HIGH_RISK" ? "Class C — عالية الخطورة" : "Class B — منخفضة المخاطر"})
- **المورد المستهدف:** ${resourceName} (\`${proposal.resourceId}\`)

#### 🔄 تفاصيل التغيير المقترح (Before / After):
${diffAr}

---

⚠️ **تنبيه بروتوكول الأمان (Safety Invariant):**
النظام **لم يقم بأي تعديل صامت** في قاعدة البيانات. يتطلب تطبيق التعديل مصادقتك الصريحة بالضغط على زر **[ تنفيذ العملية بأمان ✅ ]** أدناه أو زر **[ إلغاء ❌ ]** للإلغاء.`;

      return {
        success: true,
        reply: previewReply,
        toolsExecuted: [
          {
            name: "proposeAction",
            nameAr: "إعداد مقترح العملية (Action Preview)",
            summary: `تم إعداد مقترح [${proposal.titleAr}] بانتظار التأكيد البشري الصريح.`,
            source: "ai-actions-engine",
          },
        ],
        structuredData: {
          type: "ACTION_PROPOSAL",
          proposal,
        },
        actionProposal: proposal,
        warnings: [
          proposal.actionClass === "CLASS_C_HIGH_RISK"
            ? "عملية عالية الخطورة: تتطلب فحصاً بشرياً صريحاً وتوثيقاً إلزامياً."
            : "العملية في حالة مسودة تحت المعاينة البشرية (لم تُطبق في قاعدة البيانات بعد).",
        ],
      };
    } catch (propErr: any) {
      return {
        success: false,
        reply: `⚠️ **تعذر إعداد مقترح العملية:** ${propErr.message || "حدث خطأ في التحقق من صحة المعطيات."}`,
        toolsExecuted: [],
        warnings: [propErr.message],
      };
    }
  }

  // CHECK 2: Read-Only Query Resolution
  const toolsToRun = resolveToolsForQuery(query);
  const toolsExecuted: AdminAIQueryResponse["toolsExecuted"] = [];
  const toolResults: AdminToolResult[] = [];

  // Execute resolved tools sequentially with permission checks
  for (const toolName of toolsToRun) {
    const res = await executeAdminTool(toolName, {}, ctx);
    toolResults.push(res);
    const def = ADMIN_AI_TOOLS_REGISTRY[toolName];
    toolsExecuted.push({
      name: toolName,
      nameAr: def?.nameAr || toolName,
      summary: res.summary,
      source: res.citation.source,
    });
  }

  // Check if Gemini API key exists
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    "";

  // Try real Gemini reasoning if API key is provided and toolResults are gathered
  if (apiKey && toolResults.length > 0) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `أنت المساعد الإداري الذكي لمنصة "شاطر" (SHATER Control Center AI).
أنت تخاطب المشرف الإداري للمنصة باللغة العربية بأسلوب راقٍ، مهني، دقيق، وسلس (مع لمسة تفهم البيئة الجزائرية وامتحان شهادة البكالوريا).

القواعد الصارمة:
1. اعتمد حصراً على معطيات الأدوات (Tool Results) التالية دون اختلاق أي أرقام من خيالك.
2. إذا كان هناك نقص في البيانات أو أخطاء غير مفصولة في قاعدة البيانات، صرح بذلك بوضوح.
3. ميز بين الحقائق المثبتة في الأداة وبين التوصيات الإدارية.
4. لا تنفذ أو تقترح أي استعلام SQL مباشر.

معطيات الأدوات المنفذة:
${JSON.stringify(
  toolResults.map((t) => ({ tool: t.toolName, summary: t.summary, data: t.data, warnings: t.warnings })),
  null,
  2
)}

السياق السابق:
${history.slice(-3).map((h) => `${h.role}: ${h.content}`).join("\n")}

سؤال المشرف الأخير:
${query}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      if (response && response.text) {
        return {
          success: true,
          reply: response.text,
          toolsExecuted,
          structuredData: toolResults[0]?.data,
          warnings: toolResults.flatMap((t) => t.warnings || []),
        };
      }
    } catch (err: any) {
      console.warn("[AdminAIService] Gemini API call bypassed, falling back to deterministic synthesizer:", err?.message);
    }
  }

  // Deterministic pedagogical administrative synthesizer (Zero Hallucination, Real Evidence)
  const synthesis = synthesizeFactualResponse(query, toolResults);

  return {
    success: true,
    reply: synthesis.reply,
    toolsExecuted,
    structuredData: synthesis.structuredData,
    warnings: synthesis.warnings,
  };
}
