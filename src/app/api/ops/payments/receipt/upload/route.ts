import { NextResponse } from "next/server";
import {
  extractAuthenticatedCaller,
  isServerOperator,
} from "@/lib/operations/auth";
import { uploadReceipt, validateReceiptFile } from "@/lib/operations/receipts";
import {
  getPaymentOrderById,
  getPaymentOrders,
  updateOrderReceiptPath,
  createPaymentOrder,
} from "@/lib/operations/payments";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/payments/receipt/upload
 * Securely uploads a payment receipt and links or creates exactly ONE payment order.
 * Strictly avoids duplicate order generation.
 */
export async function POST(req: Request) {
  const caller = await extractAuthenticatedCaller(req);

  // Extract bearer token
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  let token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.replace(/^Bearer\s+/i, "").trim() : null;
  if (!token) {
    const cookieHeader = req.headers.get("cookie") || req.headers.get("Cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(/(?:ops_auth_token|sb-access-token)=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    }
  }

  try {
    const contentType = req.headers.get("content-type") || "";

    let orderId: string = "";
    let referenceId: string = "";
    let studentUserId: string = "";
    let plan: string = "season";
    let fileName: string = "";
    let mimeType: string = "";
    let fileBuffer: Buffer;
    let studentEmail: string | undefined = undefined;
    let studentName: string | undefined = undefined;
    let studentPhone: string | undefined = undefined;
    let streamId: string | undefined = undefined;
    let wilayaName: string | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      orderId = (formData.get("orderId") as string) || "";
      referenceId = (formData.get("referenceId") as string) || "";
      studentUserId = (formData.get("userId") as string) || "";
      plan = (formData.get("plan") as string) || "season";
      studentEmail = (formData.get("studentEmail") as string) || undefined;
      studentName = (formData.get("studentName") as string) || undefined;
      studentPhone = (formData.get("studentPhone") as string) || undefined;
      streamId = (formData.get("streamId") as string) || undefined;
      wilayaName = (formData.get("wilayaName") as string) || undefined;

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
      if (!body || !body.fileBase64) {
        return NextResponse.json(
          { success: false, error: "fileBase64 is required" },
          { status: 400 }
        );
      }

      orderId = body.orderId || "";
      referenceId = body.referenceId || "";
      studentUserId = body.userId || "";
      plan = body.plan || "season";
      studentEmail = body.studentEmail;
      studentName = body.studentName;
      studentPhone = body.studentPhone;
      streamId = body.streamId;
      wilayaName = body.wilayaName;
      fileName = body.fileName || "receipt.png";
      mimeType = body.mimeType || "image/png";
      fileBuffer = Buffer.from(body.fileBase64, "base64");
    }

    let effectiveUserId = caller?.userId;
    if (caller?.isOperator && studentUserId) {
      effectiveUserId = studentUserId;
    } else if (!effectiveUserId) {
      effectiveUserId = studentUserId;
    }

    if (!effectiveUserId) {
      return NextResponse.json(
        { success: false, error: "Authentication or student ID required to submit receipts" },
        { status: 401 }
      );
    }

    // 1. Validate file properties BEFORE creating any order
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

    // 2. Prepare receipt representation (Base64 data URL for instant resilient preview)
    const isImage = mimeType.startsWith("image/");
    const dataUrl = isImage && fileBuffer.length <= 4 * 1024 * 1024
      ? `data:${mimeType};base64,${fileBuffer.toString("base64")}`
      : null;

    // 3. Search for existing pending order to avoid creating duplicates
    let order = orderId ? await getPaymentOrderById(orderId, token) : null;
    if (!order && referenceId) {
      order = await getPaymentOrderById(referenceId, token);
    }
    if (!order) {
      // Look up any pending order without receipt for this student created recently
      const userOrders = await getPaymentOrders({ userId: effectiveUserId, status: "PENDING", limit: 5 }, token);
      const pendingMatch = userOrders.find((o) => !o.receiptPath && o.plan === plan);
      if (pendingMatch) {
        order = pendingMatch;
      }
    }

    // 4. If caller is restricted student, verify ownership
    if (caller?.userId && order) {
      const isOperator = await isServerOperator(caller.userId);
      if (!isOperator && order.userId !== caller.userId && (!studentUserId || order.userId !== studentUserId)) {
        return NextResponse.json(
          { success: false, error: "Forbidden: Cannot upload receipt for another student's order" },
          { status: 403 }
        );
      }
    }

    // 5. Upload receipt to storage
    const uploadRes = await uploadReceipt({
      userId: effectiveUserId,
      orderId: order?.id || orderId || `ord_${Date.now()}`,
      fileName,
      mimeType,
      fileBuffer,
    });

    const finalReceiptPath = dataUrl || (uploadRes.success ? uploadRes.receiptPath : null);
    if (!finalReceiptPath) {
      return NextResponse.json(
        { success: false, error: uploadRes.error || "Failed to process receipt" },
        { status: 500 }
      );
    }

    // 6. Link receipt to existing order OR create EXACTLY ONE order atomically with receiptPath
    if (order) {
      await updateOrderReceiptPath(order.id, finalReceiptPath, token);
    } else {
      order = await createPaymentOrder(
        {
          userId: effectiveUserId,
          plan,
          paymentMethod: "baridimob",
          receiptPath: finalReceiptPath,
          notes: `Receipt uploaded for ref: ${referenceId || orderId || "DIRECT"}`,
          studentEmail,
          studentName,
          studentPhone,
          streamId,
          wilayaName,
        },
        token
      );
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      receiptPath: finalReceiptPath,
      message: "Receipt uploaded successfully.",
    });
  } catch (err: any) {
    console.error("Receipt upload route error:", err);
    return NextResponse.json(
      { success: false, error: "Receipt upload error", details: err?.message },
      { status: 500 }
    );
  }
}
