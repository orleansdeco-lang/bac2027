/**
 * BAC Mastery — Server-Side RBAC & Authorization Layer
 * Phase 2: Operations Foundation P0
 * 
 * INVARIANTS:
 * 1. Authorization is strictly server-enforced; client claims are never trusted blindly.
 * 2. Normal students have zero access to /ops or operator RPCs.
 * 3. Supports live Supabase user_roles lookup with graceful local fallback for offline/testing.
 */

import { UserRole } from "./types";
import { supabase, isSupabaseConfigured } from "../supabase/client";

// In-memory fallback role registry for testing or bootstrap environments
const memoryRoles = new Map<string, UserRole>();

export function setMemoryUserRole(userId: string, role: UserRole): void {
  memoryRoles.set(userId, role);
}

export function clearMemoryUserRoles(): void {
  memoryRoles.clear();
}

/**
 * Retrieve the role for a specific user ID
 */
export async function getServerUserRole(userId: string): Promise<UserRole | null> {
  if (!userId) return null;

  // Check memory store first (for mock/bootstrap environments)
  if (memoryRoles.has(userId)) {
    return memoryRoles.get(userId) || null;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        // Table might not exist yet if migration pending
        return null;
      }
      if (data?.role) {
        return data.role as UserRole;
      }
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Checks if a user has OPERATOR or OWNER privileges
 */
export async function isServerOperator(userId: string): Promise<boolean> {
  if (!userId) return false;
  const role = await getServerUserRole(userId);
  return role === "OWNER" || role === "OPERATOR";
}

/**
 * Checks if a user is an OWNER
 */
export async function isServerOwner(userId: string): Promise<boolean> {
  if (!userId) return false;
  const role = await getServerUserRole(userId);
  return role === "OWNER";
}

/**
 * Extract authenticated user and verify operator privileges from an incoming API request
 */
export async function extractAndVerifyOperator(req: Request): Promise<{
  userId: string;
  role: UserRole;
  isOwner: boolean;
} | null> {
  // 1. Check Authorization Header (Bearer JWT)
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  let userId: string | null = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user?.id) {
          userId = user.id;
        }
      } catch {
        userId = null;
      }
    }
  }

  // 2. Also check x-operator-id for internal testing/mock suites if enabled
  if (!userId && process.env.NODE_ENV !== "production") {
    const headerUid = req.headers.get("x-test-user-id");
    if (headerUid) userId = headerUid;
  }

  if (!userId) return null;

  const role = await getServerUserRole(userId);
  if (!role || (role !== "OWNER" && role !== "OPERATOR")) {
    return null;
  }

  return {
    userId,
    role,
    isOwner: role === "OWNER",
  };
}
