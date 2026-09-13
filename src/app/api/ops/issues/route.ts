import { NextRequest, NextResponse } from "next/server";
import { isServerOperator, getServerUserRole } from "@/lib/operations/auth";
import {
  getOperationsIssues,
  createOperationsIssue,
  updateOperationsIssue,
} from "@/lib/operations/issues";
import { IssueCategory, IssueSeverity, IssueStatus } from "@/lib/operations/types";

export async function GET(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const isOperator = process.env.NODE_ENV !== "production" || (userId && (await isServerOperator(userId)));

  if (!isOperator) {
    return NextResponse.json(
      { error: "Forbidden: Operator or Owner access required." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as IssueStatus | undefined;
  const category = searchParams.get("category") as IssueCategory | undefined;
  const severity = searchParams.get("severity") as IssueSeverity | undefined;

  const issues = await getOperationsIssues({
    status: status || undefined,
    category: category || undefined,
    severity: severity || undefined,
  });

  return NextResponse.json({ issues, count: issues.length });
}

export async function POST(request: NextRequest) {
  const userId = request.headers.get("x-user-id");
  const isOperator = process.env.NODE_ENV !== "production" || (userId && (await isServerOperator(userId)));

  if (!isOperator) {
    return NextResponse.json(
      { error: "Forbidden: Operator or Owner access required." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const actorRole = (userId && (await getServerUserRole(userId))) || "OPERATOR";

    if (body.action === "update") {
      if (!body.issueId || !body.status) {
        return NextResponse.json(
          { error: "Missing required fields: issueId and status." },
          { status: 400 }
        );
      }

      const updated = await updateOperationsIssue({
        issueId: body.issueId,
        status: body.status,
        resolution: body.resolution,
        actorUserId: userId || null,
        actorRole,
      });

      return NextResponse.json({ success: true, issue: updated });
    }

    // Default: create new issue
    if (!body.category || !body.severity || !body.description) {
      return NextResponse.json(
        { error: "Missing required fields: category, severity, and description." },
        { status: 400 }
      );
    }

    const created = await createOperationsIssue({
      category: body.category,
      severity: body.severity,
      description: body.description,
      relatedStudentId: body.relatedStudentId,
      relatedOrderId: body.relatedOrderId,
      relatedEventId: body.relatedEventId,
      actorUserId: userId || null,
      actorRole,
    });

    return NextResponse.json({ success: true, issue: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
