import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/admin/auth";
import { loadServerStudentProfiles } from "@/lib/operations/students";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/students
 * Searches and lists student profiles for the Control Center.
 * Authoritative Guard: Requires 'students.read'.
 */
export async function GET(req: Request) {
  const authResult = await requirePermission("students.read", req);
  if (!authResult.success) {
    return authResult.response;
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const streamId = searchParams.get("streamId") || undefined;
  const wilayaCode = searchParams.get("wilayaCode") ? Number(searchParams.get("wilayaCode")) : undefined;
  const accessStatus = searchParams.get("accessStatus") || undefined;
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

  try {
    let students = loadServerStudentProfiles();

    if (search) {
      const q = search.toLowerCase();
      students = students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          (s.email && s.email.toLowerCase().includes(q))
      );
    }
    if (streamId) {
      students = students.filter((s) => s.streamId === streamId);
    }
    if (accessStatus) {
      students = students.filter((s) => s.accessStatus === accessStatus);
    }

    students = students.slice(0, limit);

    return NextResponse.json({ success: true, students });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to load students directory", details: err?.message },
      { status: 500 }
    );
  }
}
