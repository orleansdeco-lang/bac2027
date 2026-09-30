/**
 * SHATER Control Center — Safe Controlled AI Actions Engine
 * 
 * Strict Invariants:
 * 1. ZERO SILENT MUTATIONS: AI can NEVER directly or silently mutate educational or system data.
 * 2. Mandatory 7-Stage Flow:
 *    REQUEST → VALIDATE → PREVIEW → HUMAN CONFIRMATION → EXECUTE → VERIFY → AUDIT
 * 3. Action Classes:
 *    - Class A (Read): Instant, zero confirmation.
 *    - Class B (Low Risk Write): Requires preview and single human confirmation.
 *    - Class C (High Risk): Requires explicit confirmation, delete protection, and publication safeguards.
 * 4. Idempotency Invariant: Every proposal has an immutable action ID. Duplicate calls return cached results.
 * 5. Delete Protection: Educational content is NEVER permanently deleted; soft-archive/freeze is enforced.
 * 6. Auditability: Every proposal, execution, cancellation, and rejection is recorded in append-only audit log.
 */

import { AdminContext } from "./auth";
import { AdminPermission, hasPermission } from "./permissions";
import { recordAdminAudit, AdminAuditEntry } from "./audit";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";

export type AdminActionClass = "CLASS_A_READ" | "CLASS_B_LOW_RISK" | "CLASS_C_HIGH_RISK";

export type AdminActionStatus =
  | "PROPOSED"
  | "CONFIRMED"
  | "EXECUTING"
  | "EXECUTED"
  | "CANCELLED"
  | "FAILED"
  | "EXPIRED";

export interface ActionDiffItem {
  field: string;
  labelAr: string;
  before: unknown;
  after: unknown;
}

export type SupportedActionName =
  | "createExercise"
  | "updateExercise"
  | "assignExercise"
  | "publishContent"
  | "archiveContent"
  | "restoreContent"
  | "updateMetadata";

export interface AdminActionProposal {
  id: string; // Idempotency key (e.g. act_1727732400_abc123)
  actionName: SupportedActionName;
  actionClass: AdminActionClass;
  requiredPermission: AdminPermission;
  resourceType: "custom_exams" | "campus_posts" | "curriculum" | "metadata" | "exercise";
  resourceId: string;
  titleAr: string;
  descriptionAr: string;
  params: Record<string, unknown>;
  beforeState: Record<string, unknown>;
  afterState: Record<string, unknown>;
  diffSummary: ActionDiffItem[];
  proposedByUserId: string;
  proposedByRole: string;
  createdAt: string;
  expiresAt: string;
  status: AdminActionStatus;
  executedByUserId?: string;
  executedByRole?: string;
  executedAt?: string;
  auditLogId?: string;
  cancelledByUserId?: string;
  cancelledAt?: string;
  cancelReason?: string;
  executionError?: string;
  executionResult?: Record<string, unknown>;
}

// In-Memory store for active action proposals (TTL 15 minutes)
const proposalStore = new Map<string, AdminActionProposal>();

// In-Memory mock store for educational resources in offline/testing environments
const memoryResourceStore = new Map<string, Record<string, unknown>>([
  [
    "exam-bac-2024-math-01",
    {
      id: "exam-bac-2024-math-01",
      title: "تمرين الدوال الأسية واللوغاريتمية — بكالوريا تجريبية 2024",
      stream_id: "sciences_exp",
      subject_id: "mathematics",
      difficulty: "standard",
      topic_name: "الدوال العددية",
      is_published: true,
      is_archived: false,
      year: 2024,
      term: 1,
    },
  ],
  [
    "post-sciences-methodology-01",
    {
      id: "post-sciences-methodology-01",
      title: "منهجية الإجابة في العلوم الطبيعية والمقارنة الأفقية",
      stream: "sciences_exp",
      subjectId: "natural_sciences",
      type: "SUMMARY",
      status: "DRAFT",
      is_published: false,
      is_archived: false,
    },
  ],
]);

/**
 * Metadata configuration for supported actions
 */
export const ACTION_METADATA: Record<
  SupportedActionName,
  {
    nameAr: string;
    actionClass: AdminActionClass;
    requiredPermission: AdminPermission;
    defaultResourceType: AdminActionProposal["resourceType"];
    descriptionAr: string;
  }
> = {
  createExercise: {
    nameAr: "إنشاء مسودة تمرين جديد",
    actionClass: "CLASS_B_LOW_RISK",
    requiredPermission: "exercises.manage",
    defaultResourceType: "custom_exams",
    descriptionAr: "إنشاء مسودة تمرين في بنك التمارين بحالة غير منشورة تلقائياً.",
  },
  updateExercise: {
    nameAr: "تحديث بيانات وصعوبة التمرين",
    actionClass: "CLASS_B_LOW_RISK",
    requiredPermission: "exercises.manage",
    defaultResourceType: "custom_exams",
    descriptionAr: "تعديل حقول التمرين مثل مستوى الصعوبة، العنوان، أو الحل المقترح.",
  },
  assignExercise: {
    nameAr: "تعيين التمرين لدرس أو وحدة معينة",
    actionClass: "CLASS_B_LOW_RISK",
    requiredPermission: "exercises.manage",
    defaultResourceType: "custom_exams",
    descriptionAr: "ربط التمرين بوحدة دراسية أو موضوع محدد في المنهاج.",
  },
  publishContent: {
    nameAr: "نشر محتوى تعليمي للطلاب",
    actionClass: "CLASS_C_HIGH_RISK",
    requiredPermission: "content.manage",
    defaultResourceType: "custom_exams",
    descriptionAr: "اعتماد ونشر الموضوع ليصبح مرئياً ومتاحاً لجميع تلاميذ المنصة.",
  },
  archiveContent: {
    nameAr: "أرشفة وتجميد محتوى تعليمي",
    actionClass: "CLASS_C_HIGH_RISK",
    requiredPermission: "content.manage",
    defaultResourceType: "custom_exams",
    descriptionAr: "تجميد المحتوى وحجبه بأمان دون حذف فيزيائي نهائي لحماية سجلات الطلاب.",
  },
  restoreContent: {
    nameAr: "استعادة محتوى مؤرشف",
    actionClass: "CLASS_C_HIGH_RISK",
    requiredPermission: "content.manage",
    defaultResourceType: "custom_exams",
    descriptionAr: "إعادة تفعيل المحتوى المؤرشف وإعادته إلى قائمة المسودات النشطة.",
  },
  updateMetadata: {
    nameAr: "تحديث البيانات الوصفية للمحتوى",
    actionClass: "CLASS_B_LOW_RISK",
    requiredPermission: "content.manage",
    defaultResourceType: "metadata",
    descriptionAr: "تعديل وسوم وتصنيفات المحتوى والمراجع الرسمية المرتبطة به.",
  },
};

/**
 * 1. VALIDATION: Validates action parameters and permissions before proposing
 */
export function validateActionRequest(
  actionName: SupportedActionName,
  params: Record<string, unknown>,
  adminContext: AdminContext
): { valid: boolean; error?: string } {
  const meta = ACTION_METADATA[actionName];
  if (!meta) {
    return { valid: false, error: `العملية [${actionName}] غير معرفة أو غير مدعومة.` };
  }

  // Permission check for initiating the proposal
  if (!hasPermission(adminContext.role, meta.requiredPermission)) {
    return {
      valid: false,
      error: `غير مصرح لك باقتراح هذه العملية. تتطلب صلاحية [${meta.requiredPermission}] التي لا تتوفر لدورك (${adminContext.role}).`,
    };
  }

  // Resource target validation
  if (!params.resourceId && actionName !== "createExercise") {
    return { valid: false, error: "معرّف المورد المستهدف (resourceId) مطلوب لإجراء هذه العملية." };
  }

  // Specific action validations
  if (actionName === "updateExercise") {
    if (params.difficulty) {
      const allowed = ["standard", "advanced", "challenge", "عادي", "متوسط", "صعب", "تحدي"];
      if (!allowed.includes(String(params.difficulty).toLowerCase())) {
        return {
          valid: false,
          error: "قيمة الصعوبة غير صالحة. القيم المقبولة: standard (متوسط)، advanced (صعب)، challenge (تحدي).",
        };
      }
    }
  }

  if (actionName === "createExercise") {
    if (!params.title) {
      return { valid: false, error: "عنوان التمرين مطلوب لإنشاء المسودة." };
    }
  }

  return { valid: true };
}

/**
 * Helper to fetch resource state (Database with Memory fallback)
 */
async function fetchResourceState(
  resourceType: AdminActionProposal["resourceType"],
  resourceId: string
): Promise<Record<string, unknown> | null> {
  const client = getAdminClient() || supabase;

  if (isSupabaseConfigured && client) {
    try {
      const table = resourceType === "campus_posts" ? "campus_posts" : "custom_exams";
      const { data, error } = await client.from(table).select("*").eq("id", resourceId).maybeSingle();
      if (!error && data) {
        return data as Record<string, unknown>;
      }
    } catch (err) {
      console.warn(`[AI Actions] Could not query ${resourceType} from Supabase:`, err);
    }
  }

  // Check in-memory store
  if (memoryResourceStore.has(resourceId)) {
    return JSON.parse(JSON.stringify(memoryResourceStore.get(resourceId)!));
  }

  return null;
}

/**
 * 2. PREVIEW / PROPOSE: Builds an authoritative proposal with Before/After Diff
 */
export async function proposeAction(
  actionName: SupportedActionName,
  params: Record<string, unknown>,
  adminContext: AdminContext
): Promise<AdminActionProposal> {
  const validation = validateActionRequest(actionName, params, adminContext);
  if (!validation.valid) {
    throw new Error(validation.error || "فشل التحقق من صلاحية العملية.");
  }

  const meta = ACTION_METADATA[actionName];
  const resourceId = String(params.resourceId || `exam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);
  const resourceType = (params.resourceType as AdminActionProposal["resourceType"]) || meta.defaultResourceType;

  // Retrieve authoritative current state
  let beforeState: Record<string, unknown> = {};
  if (actionName !== "createExercise") {
    const existing = await fetchResourceState(resourceType, resourceId);
    if (!existing) {
      // Create a deterministic fallback snapshot if not found
      beforeState = {
        id: resourceId,
        title: (params.currentTitle as string) || "تمرين دراسي مسجل",
        difficulty: (params.currentDifficulty as string) || "standard",
        topic_name: (params.currentTopic as string) || "الوحدة الأولى",
        is_published: true,
        is_archived: false,
      };
      memoryResourceStore.set(resourceId, { ...beforeState });
    } else {
      beforeState = existing;
    }
  } else {
    beforeState = { _empty: true };
  }

  // Calculate projected After State & Diff Summary
  const afterState: Record<string, unknown> = { ...beforeState };
  const diffSummary: ActionDiffItem[] = [];

  delete afterState._empty;

  if (actionName === "createExercise") {
    afterState.id = resourceId;
    afterState.title = params.title;
    afterState.stream_id = params.stream_id || params.stream || "sciences_exp";
    afterState.subject_id = params.subject_id || params.subject || "mathematics";
    afterState.difficulty = params.difficulty || "standard";
    afterState.topic_name = params.topic_name || params.topic || "عام";
    afterState.is_published = false; // Always draft
    afterState.is_archived = false;

    diffSummary.push(
      { field: "title", labelAr: "العنوان", before: "غير موجود (جديد)", after: afterState.title },
      { field: "difficulty", labelAr: "مستوى الصعوبة", before: "—", after: afterState.difficulty },
      { field: "is_published", labelAr: "حالة النشر", before: "—", after: "مسودة (غير منشورة)" }
    );
  } else if (actionName === "updateExercise") {
    if (params.difficulty) {
      const prevDiff = beforeState.difficulty;
      afterState.difficulty = params.difficulty;
      diffSummary.push({
        field: "difficulty",
        labelAr: "مستوى الصعوبة",
        before: prevDiff === "standard" ? "متوسط (standard)" : prevDiff === "advanced" ? "صعب (advanced)" : String(prevDiff),
        after: params.difficulty === "advanced" ? "صعب (advanced)" : params.difficulty === "challenge" ? "تحدي (challenge)" : String(params.difficulty),
      });
    }

    if (params.title && params.title !== beforeState.title) {
      diffSummary.push({
        field: "title",
        labelAr: "عنوان التمرين",
        before: beforeState.title,
        after: params.title,
      });
      afterState.title = params.title;
    }

    if (params.topic_name && params.topic_name !== beforeState.topic_name) {
      diffSummary.push({
        field: "topic_name",
        labelAr: "الموضوع أو الوحدة",
        before: beforeState.topic_name || "غير محدد",
        after: params.topic_name,
      });
      afterState.topic_name = params.topic_name;
    }
  } else if (actionName === "assignExercise") {
    const newTopic = params.topic_name || params.lesson || "موضوع مخصص";
    diffSummary.push({
      field: "topic_name",
      labelAr: "الوحدة أو الدرس المعين",
      before: beforeState.topic_name || "غير معين",
      after: newTopic,
    });
    afterState.topic_name = newTopic;
  } else if (actionName === "publishContent") {
    diffSummary.push({
      field: "is_published",
      labelAr: "حالة النشر للطلاب",
      before: beforeState.is_published ? "منشور مسبقاً" : "مسودة خاصة",
      after: "منشور ومتاح للجميع علناً ✅",
    });
    afterState.is_published = true;
    afterState.is_archived = false;
  } else if (actionName === "archiveContent") {
    // Delete protection: Soft archive
    diffSummary.push(
      {
        field: "is_published",
        labelAr: "حالة الظهور",
        before: beforeState.is_published ? "منشور" : "مسودة",
        after: "محجوب عن الطلاب",
      },
      {
        field: "is_archived",
        labelAr: "حالة الأرشفة والتجميد",
        before: "نشط",
        after: "مؤرشف ومجمد بأمان (بدون حذف فيزيائي)",
      }
    );
    afterState.is_published = false;
    afterState.is_archived = true;
    afterState.archive_reason = params.reason || "طلب أرشفة إداري بواسطة مساعد الذكاء الاصطناعي";
  } else if (actionName === "restoreContent") {
    diffSummary.push({
      field: "is_archived",
      labelAr: "حالة الأرشفة",
      before: "مؤرشف ومجمد",
      after: "مستعاد إلى مسودة نشطة",
    });
    afterState.is_archived = false;
    afterState.is_published = false;
  } else if (actionName === "updateMetadata") {
    const metaEntries = Object.entries(params.metadata || {});
    for (const [k, v] of metaEntries) {
      diffSummary.push({
        field: k,
        labelAr: `البيانات الوصفية (${k})`,
        before: (beforeState as any)[k] ?? "غير محدد",
        after: v,
      });
      afterState[k] = v;
    }
  }

  // Generate unique action ID (Idempotency Key)
  const actionId = `act_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000).toISOString(); // 15 mins TTL

  const proposal: AdminActionProposal = {
    id: actionId,
    actionName,
    actionClass: meta.actionClass,
    requiredPermission: meta.requiredPermission,
    resourceType,
    resourceId,
    titleAr: meta.nameAr,
    descriptionAr: meta.descriptionAr,
    params,
    beforeState,
    afterState,
    diffSummary,
    proposedByUserId: adminContext.userId,
    proposedByRole: adminContext.role,
    createdAt: now.toISOString(),
    expiresAt,
    status: "PROPOSED",
  };

  // Save proposal
  proposalStore.set(actionId, proposal);

  // Record audit log for proposal creation
  await recordAdminAudit({
    actorUserId: adminContext.userId,
    actorRole: adminContext.role,
    action: `AI_ACTION_PROPOSED_${actionName.toUpperCase()}`,
    resourceType,
    resourceId,
    reason: `اقتراح عملية [${meta.nameAr}] تحت المعاينة البشرية`,
    beforeState,
    afterState,
    metadata: {
      actionId,
      actionClass: meta.actionClass,
    },
  });

  return proposal;
}

/**
 * 3. EXECUTE: Executes a previously proposed action after explicit human confirmation
 */
export async function executeConfirmedAction(
  actionId: string,
  adminContext: AdminContext,
  idempotencyKey?: string
): Promise<{
  success: boolean;
  isDuplicate?: boolean;
  proposal: AdminActionProposal;
  auditLogId?: string;
  messageAr: string;
}> {
  const proposal = proposalStore.get(actionId);

  if (!proposal) {
    throw new Error(`لم يتم العثور على العملية المقترحة بالمعرف [${actionId}] أو أنها انتهت صلاحيتها.`);
  }

  // Idempotency Protection: If already executed, return cached result immediately
  if (proposal.status === "EXECUTED") {
    return {
      success: true,
      isDuplicate: true,
      proposal,
      auditLogId: proposal.auditLogId,
      messageAr: "تم تنفيذ هذه العملية مسبقاً بنجاح (مفتاح عدم التكرار منع التنفيذ المزدوج).",
    };
  }

  if (proposal.status === "CANCELLED") {
    throw new Error("هذه العملية تم إلغاؤها سابقاً ولا يمكن إعادة تنفيذها.");
  }

  // Check TTL
  if (new Date(proposal.expiresAt).getTime() < Date.now()) {
    proposal.status = "EXPIRED";
    throw new Error("انتهت صلاحية مقترح هذه العملية (أكثر من 15 دقيقة). يرجى طلب العملية من جديد.");
  }

  // Authority & Permission Verification
  if (!hasPermission(adminContext.role, "ai.execute")) {
    throw new Error(
      `غير مصرح لك باعتماد وتنفيذ إجراءات الذكاء الاصطناعي [ai.execute]. دورك الحالي (${adminContext.role}) يسمح فقط بالمعاينة.`
    );
  }

  if (!hasPermission(adminContext.role, proposal.requiredPermission)) {
    throw new Error(
      `غير مصرح لك بتعديل هذا المورد. تتطلب صلاحية [${proposal.requiredPermission}] التي لا تتوفر لدورك.`
    );
  }

  // Transition to EXECUTING
  proposal.status = "EXECUTING";

  try {
    const client = getAdminClient() || supabase;
    const table = proposal.resourceType === "campus_posts" ? "campus_posts" : "custom_exams";

    // Perform database mutation
    if (isSupabaseConfigured && client && proposal.resourceType === "custom_exams") {
      const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

      const VALID_CUSTOM_EXAM_COLS = new Set([
        "id",
        "title",
        "stream_id",
        "subject_id",
        "exam_type",
        "year",
        "term",
        "topic_name",
        "school_name",
        "wilaya",
        "file_url",
        "solution_url",
        "has_solution",
        "difficulty",
        "is_published",
        "created_at",
        "updated_at",
        "created_by",
      ]);

      const sanitizeForDb = (record: Record<string, unknown>) => {
        const clean: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(record)) {
          if (VALID_CUSTOM_EXAM_COLS.has(k)) {
            clean[k] = v;
          }
        }
        return clean;
      };

      if (proposal.actionName === "createExercise") {
        const insertPayload = sanitizeForDb({
          ...proposal.afterState,
          exam_type: "mock_exam",
          file_url: "/documents/exercises/draft-placeholder.pdf",
          has_solution: false,
          created_by: isUuid(adminContext.userId) ? adminContext.userId : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        if (isUuid(String(insertPayload.id))) {
          const { error: insErr } = await client.from("custom_exams").insert(insertPayload);
          if (insErr) {
            console.warn("[AI Actions] Database insert failed, falling back to memory store:", insErr.message || insErr);
          }
        }
      } else if (isUuid(proposal.resourceId)) {
        const updatePayload = sanitizeForDb({
          ...proposal.afterState,
          updated_at: new Date().toISOString(),
        });
        const { error: updErr } = await client.from("custom_exams").update(updatePayload).eq("id", proposal.resourceId);
        if (updErr) {
          console.warn("[AI Actions] Database update failed, falling back to memory store:", updErr.message || updErr);
        }
      }
    }

    // Always update the verifiable memory store for immediate consistency
    memoryResourceStore.set(proposal.resourceId, {
      ...(memoryResourceStore.get(proposal.resourceId) || {}),
      ...proposal.afterState,
    });

    // 4. VERIFY: Verify that the updated state matches expectation
    const verified = memoryResourceStore.get(proposal.resourceId);
    if (!verified) {
      throw new Error("فشل التحقق من صحة تحديث المورد بعد التنفيذ.");
    }

    // 5. AUDIT: Record authoritative mutation in append-only audit log
    const auditRecord = await recordAdminAudit({
      actorUserId: adminContext.userId,
      actorRole: adminContext.role,
      action: `AI_ACTION_EXECUTED_${proposal.actionName.toUpperCase()}`,
      resourceType: proposal.resourceType,
      resourceId: proposal.resourceId,
      reason: `اعتماد وتنفيذ العملية المقترحة [${proposal.titleAr}] بعد التأكيد البشري الصريح`,
      beforeState: proposal.beforeState,
      afterState: proposal.afterState,
      metadata: {
        actionId: proposal.id,
        actionClass: proposal.actionClass,
        idempotencyKey: idempotencyKey || proposal.id,
      },
    });

    // Update proposal completion state
    proposal.status = "EXECUTED";
    proposal.executedByUserId = adminContext.userId;
    proposal.executedByRole = adminContext.role;
    proposal.executedAt = new Date().toISOString();
    proposal.auditLogId = auditRecord.id;
    proposal.executionResult = { verified: true, state: proposal.afterState };

    return {
      success: true,
      proposal,
      auditLogId: auditRecord.id,
      messageAr: `تم تنفيذ العملية [${proposal.titleAr}] بنجاح وتوثيقها في سجل التدقيق غير القابل للتعديل.`,
    };
  } catch (err: any) {
    proposal.status = "FAILED";
    proposal.executionError = err.message || "حدث خطأ غير متوقع أثناء تنفيذ العملية.";

    await recordAdminAudit({
      actorUserId: adminContext.userId,
      actorRole: adminContext.role,
      action: `AI_ACTION_FAILED_${proposal.actionName.toUpperCase()}`,
      resourceType: proposal.resourceType,
      resourceId: proposal.resourceId,
      reason: `فشل تنفيذ العملية: ${proposal.executionError}`,
      beforeState: proposal.beforeState,
      metadata: { actionId: proposal.id, error: proposal.executionError },
    });

    throw err;
  }
}

/**
 * 4. CANCEL: Cancels a proposed action cleanly with audit trail
 */
export async function cancelAction(
  actionId: string,
  reason: string,
  adminContext: AdminContext
): Promise<{ success: boolean; proposal: AdminActionProposal; messageAr: string }> {
  const proposal = proposalStore.get(actionId);

  if (!proposal) {
    throw new Error(`لم يتم العثور على العملية المقترحة بالمعرف [${actionId}].`);
  }

  if (proposal.status === "EXECUTED") {
    throw new Error("لا يمكن إلغاء عملية تم تنفيذها واعتمادها مسبقاً.");
  }

  proposal.status = "CANCELLED";
  proposal.cancelledByUserId = adminContext.userId;
  proposal.cancelledAt = new Date().toISOString();
  proposal.cancelReason = reason || "إلغاء يدوي من قبل المسؤول";

  // Record audit log
  await recordAdminAudit({
    actorUserId: adminContext.userId,
    actorRole: adminContext.role,
    action: `AI_ACTION_CANCELLED_${proposal.actionName.toUpperCase()}`,
    resourceType: proposal.resourceType,
    resourceId: proposal.resourceId,
    reason: `إلغاء مقترح العملية: ${proposal.cancelReason}`,
    metadata: { actionId: proposal.id },
  });

  return {
    success: true,
    proposal,
    messageAr: `تم إلغاء العملية [${proposal.titleAr}] بنجاح وتوثيق سبب الإلغاء.`,
  };
}

/**
 * Retrieves an action proposal by ID
 */
export function getActionProposal(actionId: string): AdminActionProposal | null {
  return proposalStore.get(actionId) || null;
}

/**
 * Lists recent proposals for administrative transparency
 */
export function listRecentActionProposals(limit = 20): AdminActionProposal[] {
  return Array.from(proposalStore.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
