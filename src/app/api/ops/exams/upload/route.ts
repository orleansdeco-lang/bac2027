import { NextResponse } from "next/server";
import { uploadDocument, sanitizeFileName } from "@/lib/services/document-storage-service";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "exam_documents";
    const subFolder = (formData.get("subFolder") as string) || "ops_exams";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "لم يتم اختيار أي ملف" },
        { status: 400 }
      );
    }

    // Check size limit: 25MB
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "حجم الملف يتجاوز الحد الأقصى (25 ميغابايت)" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sanitizedName = sanitizeFileName(file.name);
    const ext = sanitizedName.substring(sanitizedName.lastIndexOf(".")).toLowerCase();

    let fileType: "pdf" | "image" | "none" = "none";
    if (ext === ".pdf" || file.type === "application/pdf") {
      fileType = "pdf";
    } else if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext) || file.type.startsWith("image/")) {
      fileType = "image";
    }

    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const objectPath = `${subFolder}/${uniqueId}_${sanitizedName}`;

    if (isSupabaseConfigured && supabase) {
      try {
        const targetBucket = bucket === "community_uploads" ? "community_uploads" : "exam_documents";
        const { data, error } = await supabase.storage
          .from(targetBucket)
          .upload(objectPath, buffer, {
            contentType: file.type || (fileType === "pdf" ? "application/pdf" : "image/jpeg"),
            upsert: true,
          });

        if (!error && data) {
          const { data: pubData } = supabase.storage
            .from(targetBucket)
            .getPublicUrl(objectPath);

          return NextResponse.json({
            success: true,
            url: pubData.publicUrl,
            fileType,
            fileName: sanitizedName,
          });
        }
        if (error) {
          console.warn("Storage upload error in API route:", error.message);
        }
      } catch (err: any) {
        console.warn("Storage upload exception in API route:", err);
      }
    }

    // Fallback: Return base64 data URI
    const base64 = `data:${file.type || (fileType === "pdf" ? "application/pdf" : "image/jpeg")};base64,${buffer.toString("base64")}`;
    return NextResponse.json({
      success: true,
      url: base64,
      fileType,
      fileName: sanitizedName,
    });
  } catch (error: any) {
    console.error("Upload handler error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "حدث خطأ أثناء معالجة الملف" },
      { status: 500 }
    );
  }
}
