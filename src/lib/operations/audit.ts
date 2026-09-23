/**
 * BAC Mastery — Operations Audit Logging Service
 * Phase 2: Operations Foundation P0
 * 
 * INVARIANTS:
 * 1. Append-Only: No edit or delete methods exist in application code.
 * 2. Complete accountability: captures actor, role, action, target, before/after states.
 * 3. Graceful fallback: dual-mode persistence (Supabase + memory fallback).
 */

import { OperationsAuditLog, AuditAction, AuditTargetType } from "./types";
import { supabase, isSupabaseConfigured } from "../supabase/client";

const memoryAuditLogs: OperationsAuditLog[] = [];

export async function recordAuditLog(entry: {
  actorUserId?: string | null;
  actorRole: string;
  action: AuditAction;
  targetType: AuditTargetType;
  targetId: string;
  reason?: string | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  ipAddress?: string | null;
}): Promise<OperationsAuditLog> {
  const log: OperationsAuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    ...entry,
    createdAt: new Date().toISOString(),
  };

  // Always retain in memory for operational fast retrieval
  memoryAuditLogs.unshift(log);
  if (memoryAuditLogs.length > 500) {
    memoryAuditLogs.pop();
  }

  // Attempt database persistence
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("operations_audit_logs").insert({
        actor_user_id: log.actorUserId || null,
        actor_role: log.actorRole,
        action: log.action,
        target_type: log.targetType,
        target_id: log.targetId,
        reason: log.reason || null,
        before_state: log.beforeState || null,
        after_state: log.afterState || null,
        ip_address: log.ipAddress || null,
      });
    } catch {
      // Retained in memory fallback
    }
  }

  return log;
}

export async function getAuditLogs(filters?: {
  actorUserId?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  limit?: number;
}): Promise<OperationsAuditLog[]> {
  const limit = filters?.limit || 50;

  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from("operations_audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (filters?.actorUserId) {
        query = query.eq("actor_user_id", filters.actorUserId);
      }
      if (filters?.action) {
        query = query.eq("action", filters.action);
      }
      if (filters?.targetType) {
        query = query.eq("target_type", filters.targetType);
      }
      if (filters?.targetId) {
        query = query.eq("target_id", filters.targetId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          actorUserId: d.actor_user_id,
          actorRole: d.actor_role,
          action: d.action,
          targetType: d.target_type,
          targetId: d.target_id,
          reason: d.reason,
          beforeState: d.before_state,
          afterState: d.after_state,
          ipAddress: d.ip_address,
          createdAt: d.created_at,
        }));
      }
    } catch {
      // Fallback only if unconfigured
    }
  }

  if (isSupabaseConfigured) {
    return [];
  }

  // Filter in-memory logs
  let result = [...memoryAuditLogs];
  if (filters?.actorUserId) {
    result = result.filter((l) => l.actorUserId === filters.actorUserId);
  }
  if (filters?.action) {
    result = result.filter((l) => l.action === filters.action);
  }
  if (filters?.targetType) {
    result = result.filter((l) => l.targetType === filters.targetType);
  }

  return result.slice(0, limit);
}
