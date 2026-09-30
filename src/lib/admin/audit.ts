/**
 * SHATER Control Center — Secure Append-Only Audit Logging System
 * 
 * Strict Invariants:
 * 1. Append-Only: No edit or delete operations exist.
 * 2. Sensitive Data Redaction: Passwords, tokens, cookies, secrets, and auth headers
 *    are automatically recursively stripped before logging.
 * 3. Complete Traceability: Captures actor, role, action, resource type, resource ID,
 *    before/after state diff, client IP, and metadata.
 * 4. Dual Persistence: Writes to Supabase operations_audit_logs with in-memory buffer fallback.
 */

import { supabase, isSupabaseConfigured, createAuthenticatedSupabaseClient } from "@/lib/supabase/client";
import { getAdminClient } from "@/lib/supabase/admin";

export interface AdminAuditEntry {
  id?: string;
  actorUserId: string | null;
  actorRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  reason?: string | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt?: string;
}

// In-memory buffer for fast operational retrieval & test resilience (max 500 items)
const memoryAuditBuffer: AdminAuditEntry[] = [];

/**
 * List of sensitive key substrings that must NEVER be written to audit logs
 */
const SENSITIVE_KEY_PATTERNS = [
  "password",
  "token",
  "secret",
  "key",
  "auth",
  "cookie",
  "bearer",
  "hash",
  "private",
  "credential",
  "session",
];

/**
 * Recursively redacts sensitive properties from state objects
 */
export function sanitizeAuditState(val: unknown, depth = 0): unknown {
  if (depth > 6) return "[TRUNCATED_MAX_DEPTH]";
  if (val === null || val === undefined) return val;

  if (typeof val === "string") {
    // Redact JWT-like strings or Bearer headers
    if (val.startsWith("Bearer ") || (val.split(".").length === 3 && val.length > 30)) {
      return "[REDACTED_TOKEN]";
    }
    return val;
  }

  if (Array.isArray(val)) {
    return val.map((item) => sanitizeAuditState(item, depth + 1));
  }

  if (typeof val === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      const lowerKey = k.toLowerCase();
      const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => lowerKey.includes(pattern));

      if (isSensitive) {
        sanitized[k] = "[REDACTED_SECRET]";
      } else {
        sanitized[k] = sanitizeAuditState(v, depth + 1);
      }
    }
    return sanitized;
  }

  return val;
}

/**
 * Records an immutable administrative audit entry.
 * Sanitizes before/after states and metadata before persistence.
 */
export async function recordAdminAudit(
  entry: AdminAuditEntry,
  callerToken?: string | null
): Promise<AdminAuditEntry> {
  const sanitizedBefore = entry.beforeState
    ? (sanitizeAuditState(entry.beforeState) as Record<string, unknown>)
    : null;
  const sanitizedAfter = entry.afterState
    ? (sanitizeAuditState(entry.afterState) as Record<string, unknown>)
    : null;
  const sanitizedMeta = entry.metadata
    ? (sanitizeAuditState(entry.metadata) as Record<string, unknown>)
    : null;

  const logRecord: AdminAuditEntry = {
    id: entry.id || `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    actorUserId: entry.actorUserId,
    actorRole: entry.actorRole,
    action: entry.action,
    resourceType: entry.resourceType,
    resourceId: entry.resourceId,
    reason: entry.reason || null,
    beforeState: sanitizedBefore,
    afterState: sanitizedAfter,
    metadata: sanitizedMeta,
    ipAddress: entry.ipAddress || null,
    createdAt: new Date().toISOString(),
  };

  // Push to in-memory buffer
  memoryAuditBuffer.unshift(logRecord);
  if (memoryAuditBuffer.length > 500) {
    memoryAuditBuffer.pop();
  }

  // Attempt database persistence in PostgreSQL public.operations_audit_logs
  const client = getAdminClient() || (callerToken ? createAuthenticatedSupabaseClient(callerToken) : null) || supabase;

  if (isSupabaseConfigured && client) {
    try {
      const dbPayload = {
        actor_user_id: logRecord.actorUserId,
        actor_role: logRecord.actorRole,
        action: logRecord.action,
        target_type: logRecord.resourceType,
        target_id: logRecord.resourceId,
        reason: logRecord.reason,
        before_state: logRecord.beforeState,
        after_state: logRecord.afterState,
        ip_address: logRecord.ipAddress,
      };

      const { data, error } = await client
        .from("operations_audit_logs")
        .insert(dbPayload)
        .select("id, created_at")
        .maybeSingle();

      if (!error && data) {
        logRecord.id = data.id;
        logRecord.createdAt = data.created_at;
      }
    } catch (dbErr) {
      console.warn("[AdminAudit] Supabase logging fallback to memory buffer:", dbErr);
    }
  }

  return logRecord;
}

/**
 * Retrieves audit logs with optional filtering and pagination
 */
export async function getAdminAuditLogs(
  filters?: {
    actorUserId?: string;
    action?: string;
    resourceType?: string;
    resourceId?: string;
    limit?: number;
    offset?: number;
  },
  callerToken?: string | null
): Promise<{ logs: AdminAuditEntry[]; total: number }> {
  const limit = Math.min(filters?.limit || 50, 100);
  const offset = filters?.offset || 0;

  const client = getAdminClient() || (callerToken ? createAuthenticatedSupabaseClient(callerToken) : null) || supabase;

  if (isSupabaseConfigured && client) {
    try {
      let query = client
        .from("operations_audit_logs")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (filters?.actorUserId) {
        query = query.eq("actor_user_id", filters.actorUserId);
      }
      if (filters?.action) {
        query = query.eq("action", filters.action);
      }
      if (filters?.resourceType) {
        query = query.eq("target_type", filters.resourceType);
      }
      if (filters?.resourceId) {
        query = query.eq("target_id", filters.resourceId);
      }

      const { data, error, count } = await query;

      if (!error && data && data.length > 0) {
        const logs: AdminAuditEntry[] = data.map((d: any) => ({
          id: d.id,
          actorUserId: d.actor_user_id,
          actorRole: d.actor_role,
          action: d.action,
          resourceType: d.target_type,
          resourceId: d.target_id,
          reason: d.reason,
          beforeState: d.before_state,
          afterState: d.after_state,
          ipAddress: d.ip_address,
          createdAt: d.created_at,
        }));

        return { logs, total: count || logs.length };
      }
    } catch (err) {
      console.warn("[AdminAudit] Supabase fetch fallback to memory buffer:", err);
    }
  }

  // Fallback to in-memory buffer
  let filtered = [...memoryAuditBuffer];
  if (filters?.actorUserId) {
    filtered = filtered.filter((l) => l.actorUserId === filters.actorUserId);
  }
  if (filters?.action) {
    filtered = filtered.filter((l) => l.action === filters.action);
  }
  if (filters?.resourceType) {
    filtered = filtered.filter((l) => l.resourceType === filters.resourceType);
  }
  if (filters?.resourceId) {
    filtered = filtered.filter((l) => l.resourceId === filters.resourceId);
  }

  const paginated = filtered.slice(offset, offset + limit);
  return { logs: paginated, total: filtered.length };
}
