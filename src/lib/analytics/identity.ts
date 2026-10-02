/**
 * SHATER — Server-Side Analytics Identity Linking
 * 
 * Links anonymous visitor_id to authenticated user_id after login/registration.
 * MUST be called server-side only — never from browser code.
 * 
 * SECURITY INVARIANTS:
 * 1. Uses service_role admin client to bypass RLS.
 * 2. Only links if the visitor has NOT already been linked to a different user.
 * 3. Uses the SECURITY DEFINER RPC for atomic cross-table updates.
 */

import { getAdminClient } from "@/lib/supabase/admin";

/**
 * Links an anonymous visitor identity to an authenticated user.
 * Call this server-side after successful registration or login.
 * 
 * @param visitorId - The client-generated visitor_id from localStorage
 * @param userId - The authenticated user's UUID from Supabase Auth
 * @returns true if linking succeeded, false if skipped or failed
 */
export async function linkVisitorToUser(
  visitorId: string,
  userId: string
): Promise<boolean> {
  if (!visitorId || !userId) return false;

  const admin = getAdminClient();
  if (!admin) {
    console.warn("[analytics-identity] No admin client available for visitor linking");
    return false;
  }

  try {
    // Use the SECURITY DEFINER RPC for atomic cross-table updates
    const { error } = await admin.rpc("link_visitor_to_user", {
      p_visitor_id: visitorId,
      p_user_id: userId,
    });

    if (error) {
      console.error("[analytics-identity] Visitor linking failed:", error.message);
      return false;
    }

    return true;
  } catch (err: any) {
    console.error("[analytics-identity] Visitor linking exception:", err?.message);
    return false;
  }
}

/**
 * Resolves visitor_id from a request's analytics payload.
 * Used in auth callbacks to extract the visitor identity for linking.
 */
export function extractVisitorIdFromBody(body: Record<string, any>): string | null {
  return body?.visitorId || body?.anonymousId || body?.anonymous_id || null;
}
