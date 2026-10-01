import { NextResponse } from "next/server";
import { extractAndVerifyOperator } from "@/lib/operations/auth";
import { getKitInventorySummary, adjustInventoryStock } from "@/lib/operations/inventory-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/inventory
 * Returns real stock levels, kit components, and safety alerts.
 */
export async function GET(req: Request) {
  const operator = await extractAndVerifyOperator(req);
  if (!operator) {
    return NextResponse.json(
      { success: false, error: "غير مصرح: يلزم صلاحية مشغل النظام." },
      { status: 403 }
    );
  }

  try {
    const summary = await getKitInventorySummary();
    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "فشل تحميل بيانات المخزون" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ops/inventory
 * Adjusts inventory stock (restock or manual deduction).
 */
export async function POST(req: Request) {
  const operator = await extractAndVerifyOperator(req);
  if (!operator) {
    return NextResponse.json(
      { success: false, error: "غير مصرح: يلزم صلاحية مشغل النظام." },
      { status: 403 }
    );
  }

  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.itemId) {
      return NextResponse.json(
        { success: false, error: "معرف الصنف مطلوب." },
        { status: 400 }
      );
    }

    const deltaHand = Number(body.deltaHand) || 0;
    const deltaReserved = Number(body.deltaReserved) || 0;

    const updated = await adjustInventoryStock(body.itemId, deltaHand, deltaReserved);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "لم يتم العثور على الصنف في المخزون." },
        { status: 404 }
      );
    }

    const summary = await getKitInventorySummary();

    return NextResponse.json({
      success: true,
      item: updated,
      summary,
      message: "تم تحديث كمية المخزون بنجاح.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "فشل تعديل المخزون" },
      { status: 500 }
    );
  }
}
