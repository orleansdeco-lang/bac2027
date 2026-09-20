import { NextResponse } from "next/server";
import { extractAndVerifyOperator } from "@/lib/operations/auth";
import {
  getVisitorAnalyticsDetailed,
  exportVisitorLogsToCsv,
} from "@/lib/operations/visitors";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/analytics/traffic
 * Shopify-style traffic analytics endpoint:
 * - Live visitor count (last 5 min)
 * - 24-hour hourly distribution for chosen date
 * - Campaign / referral link attribution for shared links
 * - CSV export support (?format=csv)
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
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date") || undefined;
    const format = searchParams.get("format");

    if (format === "csv") {
      const csv = exportVisitorLogsToCsv(5000);
      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="shater_visitors_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const analytics = getVisitorAnalyticsDetailed(dateParam);

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to retrieve traffic analytics" },
      { status: 500 }
    );
  }
}
