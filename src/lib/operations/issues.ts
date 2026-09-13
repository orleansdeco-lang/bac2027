/**
 * BAC Mastery — Central Operations Issues Subsystem
 * Phase 11: Operational Issues Queue
 * 
 * INVARIANTS:
 * 1. Simple, dense operational issue queue (P0 to P3 severity).
 * 2. Every status transition (OPEN -> INVESTIGATING -> RESOLVED / DISMISSED) is auditable.
 * 3. Dual-mode persistence: Supabase operations_issues with in-memory fallback.
 * 4. Strictly server-enforced authorization (Operators & Owners only).
 */

import { OperationsIssue, IssueCategory, IssueSeverity, IssueStatus } from "./types";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import { recordAuditLog } from "./audit";

const memoryIssues: Map<string, OperationsIssue> = new Map();

export interface CreateIssueInput {
  category: IssueCategory;
  severity: IssueSeverity;
  description: string;
  relatedStudentId?: string | null;
  relatedOrderId?: string | null;
  relatedEventId?: string | null;
  actorUserId?: string | null;
  actorRole?: string;
}

export interface UpdateIssueInput {
  issueId: string;
  status: IssueStatus;
  resolution?: string | null;
  actorUserId?: string | null;
  actorRole: string;
}

/**
 * Initializes baseline operational issue detection
 */
export async function getOperationsIssues(filters?: {
  status?: IssueStatus;
  category?: IssueCategory;
  severity?: IssueSeverity;
  limit?: number;
}): Promise<OperationsIssue[]> {
  const limit = filters?.limit || 100;

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from("operations_issues")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.category) {
        query = query.eq("category", filters.category);
      }
      if (filters?.severity) {
        query = query.eq("severity", filters.severity);
      }

      const { data, error } = await query;
      if (!error && data) {
        return data.map((d: any) => ({
          id: d.id,
          category: d.category as IssueCategory,
          severity: d.severity as IssueSeverity,
          status: d.status as IssueStatus,
          description: d.description,
          relatedStudentId: d.related_student_id,
          relatedOrderId: d.related_order_id,
          relatedEventId: d.related_event_id,
          resolution: d.resolution,
          resolvedBy: d.resolved_by,
          resolvedAt: d.resolved_at,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    } catch {
      // Memory fallback only if unconfigured
    }
  }

  if (isSupabaseConfigured) {
    return [];
  }

  // Filter in-memory issues
  let issues = Array.from(memoryIssues.values());
  if (filters?.status) {
    issues = issues.filter((i) => i.status === filters.status);
  }
  if (filters?.category) {
    issues = issues.filter((i) => i.category === filters.category);
  }
  if (filters?.severity) {
    issues = issues.filter((i) => i.severity === filters.severity);
  }

  return issues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit);
}

/**
 * Create a new operational issue
 */
export async function createOperationsIssue(input: CreateIssueInput): Promise<OperationsIssue> {
  const issueId = `iss_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newIssue: OperationsIssue = {
    id: issueId,
    category: input.category,
    severity: input.severity,
    status: "OPEN",
    description: input.description,
    relatedStudentId: input.relatedStudentId || null,
    relatedOrderId: input.relatedOrderId || null,
    relatedEventId: input.relatedEventId || null,
    resolution: null,
    resolvedBy: null,
    resolvedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  memoryIssues.set(issueId, newIssue);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("operations_issues").insert({
        id: issueId,
        category: newIssue.category,
        severity: newIssue.severity,
        status: newIssue.status,
        description: newIssue.description,
        related_student_id: newIssue.relatedStudentId,
        related_order_id: newIssue.relatedOrderId,
        related_event_id: newIssue.relatedEventId,
        created_at: newIssue.createdAt,
        updated_at: newIssue.updatedAt,
      });
    } catch {
      // Retained in memory
    }
  }

  await recordAuditLog({
    actorUserId: input.actorUserId || null,
    actorRole: input.actorRole || "OPERATOR",
    action: "ISSUE_CREATED",
    targetType: "issue",
    targetId: issueId,
    reason: input.description,
    afterState: {
      category: newIssue.category,
      severity: newIssue.severity,
      status: newIssue.status,
    },
  });

  return newIssue;
}

/**
 * Update the status of an issue (INVESTIGATING, RESOLVED, DISMISSED)
 */
export async function updateOperationsIssue(input: UpdateIssueInput): Promise<OperationsIssue> {
  const existing = memoryIssues.get(input.issueId);
  const now = new Date().toISOString();

  let beforeState: Record<string, unknown> | null = null;
  if (existing) {
    beforeState = {
      status: existing.status,
      resolution: existing.resolution,
    };
  }

  const isResolving = input.status === "RESOLVED" || input.status === "DISMISSED";
  const resolvedBy = isResolving ? (input.actorUserId || "operator") : null;
  const resolvedAt = isResolving ? now : null;

  const updated: OperationsIssue = {
    ...(existing || {
      id: input.issueId,
      category: "system" as IssueCategory,
      severity: "P2" as IssueSeverity,
      description: "Updated operational issue",
      createdAt: now,
    }),
    status: input.status,
    resolution: input.resolution || (existing?.resolution ?? null),
    resolvedBy: resolvedBy || existing?.resolvedBy || null,
    resolvedAt: resolvedAt || existing?.resolvedAt || null,
    updatedAt: now,
  };

  memoryIssues.set(input.issueId, updated);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from("operations_issues")
        .update({
          status: updated.status,
          resolution: updated.resolution,
          resolved_by: updated.resolvedBy,
          resolved_at: updated.resolvedAt,
          updated_at: updated.updatedAt,
        })
        .eq("id", input.issueId);
    } catch {
      // Memory fallback
    }
  }

  const action = input.status === "RESOLVED"
    ? "ISSUE_RESOLVED"
    : input.status === "DISMISSED"
    ? "ISSUE_DISMISSED"
    : "ISSUE_STATUS_CHANGED";

  await recordAuditLog({
    actorUserId: input.actorUserId || null,
    actorRole: input.actorRole,
    action,
    targetType: "issue",
    targetId: input.issueId,
    reason: input.resolution || `Status changed to ${input.status}`,
    beforeState,
    afterState: {
      status: updated.status,
      resolution: updated.resolution,
      resolvedBy: updated.resolvedBy,
      resolvedAt: updated.resolvedAt,
    },
  });

  return updated;
}

/**
 * Resets memory issues for testing
 */
export function resetMemoryIssues(): void {
  memoryIssues.clear();
}
