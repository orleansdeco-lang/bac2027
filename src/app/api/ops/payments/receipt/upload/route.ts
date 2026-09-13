import { NextResponse } from "next/server";
import {
  extractAuthenticatedCaller,
  isServerOperator,
} from "@/lib/operations/auth";
import { uploadReceipt, validateReceiptFile } from "@/lib/operations/receipts";
import { getPaymentOrderById, updateOrderReceiptPath } from "@/lib/operations/payments";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/payments/receipt/upload
 * Securely uploads a payment receipt for an existing order.
 * Strictly validates:
 * - Caller session (must be owner of order or operator)
 * - MIME type: image/jpeg, image/png, application/pdf
 * - Max size: 5MB
 * - Path traversal defense
 */
export async function POST(req: Request) {
  const caller = await extractAuthenticatedCaller(req);
  if (!caller?.userId) {
    return NextResponse.json(
      { success: false, error: "Authentication required to upload receipts" },
      { status: 401 }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    let orderId: string = "";
    let fileName: string = "";
    let mimeType: string = "";
    let fileBuffer: Buffer;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      orderId = (formData.get("orderId") as string) || "";
      const file = formData.get("file") as File | null;

      if (!file) {
        return NextResponse.json(
          { success: false, error: "No file attached in form data" },
          { status: 400 }
        );
      }

      fileName = file.name;
      mimeType = file.type;
      const arrayBuf = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuf);
    } else {
      // JSON base64 upload support
      const body = await req.json().catch(() => null);
      if (!body || !body.orderId || !body.fileBase64) {
        return NextResponse.json(
          { success: false, error: "orderId and fileBase64 required" },
          { status: 400 }
        );
      }

      orderId = body.orderId;
      fileName = body.fileName || "receipt.png";
      mimeType = body.mimeType || "image/png";
      fileBuffer = Buffer.from(body.fileBase64, "base64");
    }

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      );
    }

    // Validate order ownership
    const order = await getPaymentOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Payment order not found" },
        { status: 404 }
      );
    }

    const isOperator = await isServerOperator(caller.userId);
    if (!isOperator && order.userId !== caller.userId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: Cannot upload receipt for another student's order" },
        { status: 403 }
      );
    }

    // Validate file properties
    const validation = validateReceiptFile({
      name: fileName,
      size: fileBuffer.length,
      type: mimeType,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Execute upload
    const uploadRes = await uploadReceipt({
      userId: order.userId,
      orderId,
      fileBuffer,
      fileName,
      mimeType,
    });

    if (!uploadRes.success || !uploadRes.receiptPath) {
      return NextResponse.json(
        { success: false, error: uploadRes.error || "Failed to upload receipt" },
        { status: 500 }
      );
    }

    // Attach receipt path to order
    await updateOrderReceiptPath(orderId, uploadRes.receiptPath);

    return NextResponse.json({
      success: true,
      receiptPath: uploadRes.receiptPath,
      message: "Receipt uploaded successfully.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Receipt upload error", details: err?.message },
      { status: 500 }
    );
  }
}
