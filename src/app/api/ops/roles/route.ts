import { NextResponse } from "next/server";
import { extractAndVerifyOwner, assignUserRole, getServerUserRole } from "@/lib/operations/auth";
import { UserRole } from "@/lib/operations/types";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/roles - List user roles (OWNER only)
 * POST /api/ops/roles - Assign or modify user role (OWNER only)
 * Strictly denies Operators and Content Reviewers (403 Forbidden).
 * Blocks Operator privilege self-escalation to OWNER.
 */
export async function GET(req: Request) {
  const ownerAuth = await extractAndVerifyOwner(req);
  if (!ownerAuth.authorized) {
    return NextResponse.json(
      { success: false, error: ownerAuth.error || "Unauthorized: Owner access required" },
      { status: ownerAuth.status }
    );
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        return NextResponse.json({ success: true, roles: data });
      }
    } catch {
      // Fallback
    }
  }

  return NextResponse.json({ success: true, roles: [] });
}

export async function POST(req: Request) {
  const ownerAuth = await extractAndVerifyOwner(req);
  if (!ownerAuth.authorized || !ownerAuth.userId) {
    return NextResponse.json(
      { success: false, error: ownerAuth.error || "Unauthorized: Owner access required" },
      { status: ownerAuth.status }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.targetUserId || !body.role) {
      return NextResponse.json(
        { success: false, error: "targetUserId and role are required" },
        { status: 400 }
      );
    }

    const validRoles: UserRole[] = ["OWNER", "OPERATOR", "CONTENT_REVIEWER", "TEACHER_ADMIN"];
    if (!validRoles.includes(body.role)) {
      return NextResponse.json(
        { success: false, error: `Invalid role. Allowed roles: ${validRoles.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await assignUserRole(ownerAuth.userId, body.targetUserId, body.role);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "Failed to assign role" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Role ${body.role} assigned to user ${body.targetUserId}.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to process role assignment", details: err?.message },
      { status: 500 }
    );
  }
}
