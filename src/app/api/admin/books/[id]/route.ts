import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { BooksService } from "@/lib/services/books-service";

export const dynamic = "force-dynamic";

/**
 * PUT /api/admin/books/[id]
 * Updates an existing book.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ success: false, error: "معرف المرجع غير صالح" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const result = await BooksService.updateBook(id, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "تعذر تحديث المرجع" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم تحديث بيانات المرجع بنجاح",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "خطأ أثناء تحديث المرجع" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/books/[id]
 * Deletes a book from the library.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ success: false, error: "معرف المرجع غير صالح" }, { status: 400 });
  }

  try {
    const result = await BooksService.deleteBook(id);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "تعذر حذف المرجع" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "تم حذف المرجع بنجاح من المكتبة",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "خطأ أثناء حذف المرجع" },
      { status: 500 }
    );
  }
}
