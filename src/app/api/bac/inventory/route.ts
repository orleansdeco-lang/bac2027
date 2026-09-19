import { NextRequest, NextResponse } from "next/server";
import { filterMasterInventory, getMasterStats } from "@/lib/content/bac-inventory";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const stream = searchParams.get("stream") || "all";
    const subject = searchParams.get("subject") || "all";
    const year = searchParams.get("year") || "all";
    const decade = (searchParams.get("decade") || "all") as any;
    const contentType = (searchParams.get("contentType") || "all") as any;
    const session = (searchParams.get("session") || "all") as any;
    const term = (searchParams.get("term") || "all") as any;
    const hasSolution = (searchParams.get("hasSolution") || "all") as any;
    const searchQuery = searchParams.get("q") || searchParams.get("searchQuery") || "";
    const sortBy = (searchParams.get("sortBy") || "newest") as any;

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const result = filterMasterInventory({
      stream,
      subject,
      year,
      decade,
      contentType,
      session,
      term,
      hasSolution,
      searchQuery,
      sortBy,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data: result.items,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
      availableYears: result.availableYears,
      stats: result.stats,
    });
  } catch (error: any) {
    console.error("API Error in /api/bac/inventory:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to retrieve BAC inventory",
      },
      { status: 500 }
    );
  }
}
