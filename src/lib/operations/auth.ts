/**
 * BAC Mastery — Server-Side RBAC & Authorization Layer
 * Phase P0.1 Commercial Hardening
 * 
 * INVARIANTS:
 * 1. Authorization is strictly server-enforced; client claims are never trusted blindly.
 * 2. Normal students have zero access to /ops or operator RPCs.
 * 3. Content Reviewers are restricted to pedagogy; strictly DENIED finance, receipts, audit and roles.
 * 4. Operators have finance and audit access; strictly DENIED role management and owner escalation.
 * 5. Owners have complete authority over finance, audit, and role assignment.
 */

import { UserRole } from "./types";
import { supabase, isSupabaseConfigured } from "../supabase/client";
import { recordAuditLog } from "./audit";

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

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data?.role) {
        return data.role as UserRole;
      }
      if (!error && !data) {
        // Authoritative from remote Supabase: No administrative role assigned
        return null;
      }
    } catch {
      // Fallback only if remote call threw network error
    }
  }

  // Check memory store only for local offline / unconfigured environments
  if (!isSupabaseConfigured && memoryRoles.has(userId)) {
    return memoryRoles.get(userId) || null;
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
 * Checks if a user is a CONTENT_REVIEWER
 */
export async function isServerContentReviewer(userId: string): Promise<boolean> {
  if (!userId) return false;
  const role = await getServerUserRole(userId);
  return role === "CONTENT_REVIEWER";
}

/**
 * Checks if a user has finance access (OWNER or OPERATOR only)
 * CONTENT_REVIEWER is strictly denied.
 */
export async function hasFinanceAccess(userId: string): Promise<boolean> {
  if (!userId) return false;
  const role = await getServerUserRole(userId);
  return role === "OWNER" || role === "OPERATOR";
}

/**
 * Checks if a user has audit trail access (OWNER or OPERATOR only)
 * CONTENT_REVIEWER is strictly denied.
 */
export async function hasAuditAccess(userId: string): Promise<boolean> {
  if (!userId) return false;
  const role = await getServerUserRole(userId);
  return role === "OWNER" || role === "OPERATOR";
}

/**
 * Checks if a user has role management access (OWNER only)
 * OPERATOR and CONTENT_REVIEWER are strictly denied.
 */
export async function hasRoleManagementAccess(userId: string): Promise<boolean> {
  if (!userId) return false;
  const role = await getServerUserRole(userId);
  return role === "OWNER";
}

/**
 * Extract token from Cookie header (supports ops_auth_token and Supabase cookies)
 */
export function extractTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((c) => c.trim());
  for (const part of parts) {
    if (part.startsWith("ops_auth_token=")) {
      return decodeURIComponent(part.substring("ops_auth_token=".length));
    }
    if (part.startsWith("sb-access-token=")) {
      return decodeURIComponent(part.substring("sb-access-token=".length));
    }
    if (part.includes("-auth-token=")) {
      try {
        const val = decodeURIComponent(part.split("=")[1]);
        const parsed = JSON.parse(val);
        if (parsed?.access_token) return parsed.access_token;
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
      } catch {}
    }
  }
  return null;
}

/**
 * Extract authenticated user ID from request headers or cookies
 */
export async function extractAuthenticatedUserId(req: Request): Promise<string | null> {
  let token: string | null = null;

  // 1. Try Authorization header
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.replace(/^Bearer\s+/i, "").trim();
  }

  // 2. Try Cookies
  if (!token) {
    const cookieHeader = req.headers.get("cookie") || req.headers.get("Cookie");
    token = extractTokenFromCookies(cookieHeader);
  }

  // 3. Verify token with Supabase
  if (token && isSupabaseConfigured && supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user?.id) {
        return user.id;
      }
    } catch {
      // Continue
    }
  }

  // 4. Testing/development header support
  if (process.env.NODE_ENV !== "production") {
    const headerUid = req.headers.get("x-test-user-id") || req.headers.get("x-user-id");
    if (headerUid) return headerUid;
  }

  return null;
}

/**
 * Extract authenticated user and their resolved role
 */
export async function extractAuthenticatedCaller(req: Request): Promise<{
  userId: string;
  role: UserRole | null;
  isOwner: boolean;
  isOperator: boolean;
  isContentReviewer: boolean;
} | null> {
  const userId = await extractAuthenticatedUserId(req);
  if (!userId) return null;

  const role = await getServerUserRole(userId);
  return {
    userId,
    role,
    isOwner: role === "OWNER",
    isOperator: role === "OPERATOR" || role === "OWNER",
    isContentReviewer: role === "CONTENT_REVIEWER",
  };
}

/**
 * Extract authenticated user and verify operator privileges (OWNER or OPERATOR)
 */
export async function extractAndVerifyOperator(req: Request): Promise<{
  userId: string;
  role: UserRole;
  isOwner: boolean;
} | null> {
  const caller = await extractAuthenticatedCaller(req);
  if (!caller || !caller.role || (caller.role !== "OWNER" && caller.role !== "OPERATOR")) {
    return null;
  }

  return {
    userId: caller.userId,
    role: caller.role,
    isOwner: caller.isOwner,
  };
}

/**
 * Extract and verify caller has Finance privileges (OWNER or OPERATOR)
 * Strictly rejects CONTENT_REVIEWER and normal students.
 */
export async function extractAndVerifyFinanceOperator(req: Request): Promise<{
  authorized: boolean;
  userId?: string;
  role?: UserRole;
  isOwner?: boolean;
  status: 200 | 401 | 403;
  error?: string;
}> {
  const userId = await extractAuthenticatedUserId(req);
  if (!userId) {
    return { authorized: false, status: 401, error: "Authentication required" };
  }

  const role = await getServerUserRole(userId);
  if (!role) {
    return { authorized: false, status: 403, error: "Forbidden: No administrative role assigned" };
  }

  if (role === "CONTENT_REVIEWER") {
    return {
      authorized: false,
      status: 403,
      error: "Forbidden: Content Reviewers are denied finance and payment management access.",
    };
  }

  if (role !== "OWNER" && role !== "OPERATOR") {
    return { authorized: false, status: 403, error: "Forbidden: Finance operator access required" };
  }

  return {
    authorized: true,
    userId,
    role,
    isOwner: role === "OWNER",
    status: 200,
  };
}

/**
 * Extract and verify caller is an OWNER (required for role management)
 */
export async function extractAndVerifyOwner(req: Request): Promise<{
  authorized: boolean;
  userId?: string;
  status: 200 | 401 | 403;
  error?: string;
}> {
  const userId = await extractAuthenticatedUserId(req);
  if (!userId) {
    return { authorized: false, status: 401, error: "Authentication required" };
  }

  const isOwner = await isServerOwner(userId);
  if (!isOwner) {
    return {
      authorized: false,
      status: 403,
      error: "Forbidden: Only OWNER is authorized to manage roles.",
    };
  }

  return { authorized: true, userId, status: 200 };
}

/**
 * Assign or update a user's role authoritatively.
 * Strictly enforced: Only OWNER can assign roles. OPERATOR self-escalation is blocked.
 */
export async function assignUserRole(
  callerUserId: string,
  targetUserId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  if (!callerUserId || !targetUserId || !newRole) {
    return { success: false, error: "Missing required parameters" };
  }

  const isOwner = await isServerOwner(callerUserId);
  if (!isOwner) {
    return {
      success: false,
      error: "Unauthorized: Only system OWNER can grant or revoke roles.",
    };
  }

  const existingRole = await getServerUserRole(targetUserId);

  // Update memory role registry
  setMemoryUserRole(targetUserId, newRole);

  // Attempt database upsert
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from("user_roles").upsert(
        { user_id: targetUserId, role: newRole },
        { onConflict: "user_id,role" }
      );
    } catch {
      // Memory fallback
    }
  }

  // Record audit log
  await recordAuditLog({
    actorUserId: callerUserId,
    actorRole: "OWNER",
    action: "ROLE_GRANTED",
    targetType: "user_role",
    targetId: targetUserId,
    reason: `Role ${newRole} granted by owner`,
    beforeState: { previousRole: existingRole },
    afterState: { grantedRole: newRole },
  });

  return { success: true };
}
