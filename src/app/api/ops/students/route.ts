import { NextResponse } from "next/server";
import { extractAndVerifyOperator } from "@/lib/operations/auth";
import { getStudentsOperationalList } from "@/lib/operations/kpis";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/students
 * Returns student operational summaries for the student directory.
 * Strictly requires OPERATOR or OWNER role.
 */
export async function GET(req: Request) {
  const operator = await extractAndVerifyOperator(req);
  if (!operator) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Operator access required" },
      { status: 403 }
    );
  }

  try {
    const students = await getStudentsOperationalList();
    return NextResponse.json({ success: true, students });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch student operational list", details: err?.message },
      { status: 500 }
    );
  }
}
