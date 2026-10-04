import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { BooksService } from "@/lib/services/books-service";
import { BookInput } from "@/types/book";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/books
 * Retrieves all books for the administration portal.
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || undefined;
  const category = searchParams.get("category") || undefined;
  const subject = searchParams.get("subject") || undefined;
  const stream = searchParams.get("stream") || undefined;

  try {
    const books = await BooksService.getBooks({
      search,
      category,
      subject,
      stream,
      sortBy: "latest",
    });

    const stats = await BooksService.getLibraryStats(books);

    return NextResponse.json({
      success: true,
      books,
      stats,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "فشل استرجاع قائمة المراجع" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/books
 * Creates a new educational reference book.
 */
export async function POST(request: NextRequest) {
  const authResult = await requireAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body: BookInput = await request.json();

    // Validation
    if (!body.title || !body.category || !body.subject || !body.file_url) {
      return NextResponse.json(
        {
          success: false,
          error: "العنوان، التصنيف، المادة، ورابط ملف الـ PDF حقول إلزامية",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.streams) || body.streams.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "يجب اختيار شعبة واحدة على الأقل للمرجع",
        },
        { status: 400 }
      );
    }

    const result = await BooksService.createBook(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || "تعذر حفظ المرجع في قاعدة البيانات" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      book: result.data,
      message: "تمت إضافة المرجع بنجاح إلى المكتبة الرقمية",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "خطأ في معالجة طلب الإضافة" },
      { status: 500 }
    );
  }
}
