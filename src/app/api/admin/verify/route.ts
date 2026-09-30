import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/verify
 * Authoritatively verifies the current administrative session.
 * Returns role, permissions, and identity info.
 */
export async function GET(req: Request) {
  const authResult = await requireAdmin(req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { context } = authResult;

  return NextResponse.json({
    success: true,
    authorized: true,
    user: {
      id: context.userId,
      email: context.email,
      role: context.role,
      isOwner: context.isOwner,
      permissions: context.permissions,
    },
  });
}
